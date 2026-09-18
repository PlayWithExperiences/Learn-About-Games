#!/usr/bin/env python3
"""Run one collect-resources-about-game item end to end.

Stages: claim -> import source -> isolate -> summary -> 3 artifacts -> export ->
upload -> publish ready -> deliver to the remote inbox -> write the run report.

Every stage is logged with its name. On failure the item is recorded through the
producer's `fail` with the failing stage, so a later reader can tell exactly where it
stopped instead of seeing a vague "failed".

Usage:
  run-notebooklm-item.py --resource-id youtube-XXXXXXXXXXX --state-dir <dir> [--item-dir <dir>]
"""
from __future__ import annotations

import argparse
import datetime as dt
import difflib
import json
import os
import re
import shutil
import subprocess
import sys
import time
import urllib.request
import hashlib
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT / "scripts"))
import notebooklm_producer as producer  # noqa: E402  (single source of truth for candidates)
BROWSER = ROOT / "automation" / "browser"
CATALOG = ROOT / "src" / "data" / "resources.json"
PRODUCER = ROOT / "scripts" / "notebooklm_producer.py"
PUBLISH_SH = ROOT / "automation" / "publish-notebooklm-resource.sh"
SPLITTER = ROOT / "automation" / "notebooklm-split-answer.py"

AI_ROOT = Path(os.environ.get("LAG_AI_MENTOR_ROOT", "/Users/haodong/Documents/GitHub/AI-Life-Mentor"))
INBOX = AI_ROOT / "notebooklm-resources"
PICGO = os.environ.get("LAG_PICGO_URL", "http://127.0.0.1:36677/upload")

ICON = {"infographic": "stacked_bar_chart", "mindmap": "flowchart", "slides": "tablet"}
# Wording NotebookLM uses in an artifact card that failed to generate; used to fail fast
# with the real reason instead of waiting out the card cap.
KIND_WORDS = {"stacked_bar_chart": "信息图", "flowchart": "思维导图", "tablet": "演示文稿"}
GENERATING_RE = re.compile(r"正在生成|生成中|Generating", re.I)
FAILURE_RE = re.compile(r"未能生成|生成失败|Failed to generate", re.I)


def now() -> str:
    return dt.datetime.now().astimezone().strftime("%Y-%m-%dT%H:%M:%S%z")


def stamp() -> str:
    return dt.datetime.now().strftime("%Y%m%d%H%M%S")


def run(cmd: list[str], *, timeout: int = 900, check: bool = True) -> subprocess.CompletedProcess:
    env = {**os.environ, "LAG_CDP_PORT": os.environ.get("LAG_CDP_PORT", "9222")}
    proc = subprocess.run(cmd, capture_output=True, text=True, timeout=timeout, env=env)
    if check and proc.returncode != 0:
        raise StageError(f"command failed ({proc.returncode}): {' '.join(str(c) for c in cmd)}\n{proc.stdout[-1500:]}\n{proc.stderr[-1500:]}")
    return proc


class StageError(RuntimeError):
    def __init__(self, message: str, stage: str | None = None):
        super().__init__(message)
        self.stage = stage


class Item:
    def __init__(self, resource_id: str, item_dir: Path):
        self.resource_id = resource_id
        self.dir = item_dir
        self.artifacts_dir = item_dir / "artifacts"
        self.artifacts_dir.mkdir(parents=True, exist_ok=True)
        self.log: list[dict] = []
        self.claim: dict = {}
        self.imported_title = ""
        self.cards: dict[str, str] = {}
        self.uploads: dict[str, dict] = {}
        self.deck_route = "page-asset-capture"
        self.mindmap_verification: dict = {}

    def note(self, stage: str, detail) -> None:
        entry = {"stage": stage, "at": now(), "detail": detail}
        self.log.append(entry)
        print(f"[{stage}] {json.dumps(detail, ensure_ascii=False)[:300]}", flush=True)


def catalog_candidate(resource_id: str):
    """Resolve a resource_id through the producer's own candidate derivation.

    Deriving it here would risk drifting from the producer (the catalog stores
    canonicalUrl/accessVersions and resourceTopicIds, not resource_id/topic), so we
    reuse load_candidates directly.
    """
    for cand in producer.load_candidates(CATALOG):
        if cand.resource_id == resource_id:
            return cand
    raise SystemExit(f"resource_id is not a YouTube candidate in the catalog: {resource_id}")


def normalize_title(text: str) -> str:
    """Lower-case a title and collapse everything non-alphanumeric into single spaces."""
    return re.sub(r"[^a-z0-9\u4e00-\u9fff]+", " ", (text or "").lower()).strip()


def norm_tokens(text: str) -> set[str]:
    stop = {"the", "a", "an", "of", "in", "and", "to", "for", "on", "with", "how", "your", "you"}
    return {w for w in normalize_title(text).split() if len(w) > 2 and w not in stop}


def title_matches(catalog_title: str, source_title: str, threshold: float = 0.6) -> bool:
    """Fuzzy match: YouTube source titles are usually the catalog title, sometimes with
    punctuation or subtitle differences. Used both to reuse an already-imported source
    and to refuse a mis-identified import.

    Token overlap alone is not identity. GDC titles come in templates, and on 2026-09-18
    "Classic Game Postmortem: Ultima Online" overlapped "Classic Game Postmortem: 'Star Wars
    Galaxies'" on classic/game/postmortem — exactly 3 of the candidate's 5 tokens, i.e. the
    0.6 threshold — so the runner treated a different lecture as this candidate's source and
    stopped in the isolation stage. The character-level similarity is required as well, so a
    shared series prefix can never stand in for the distinctive part of the title.
    """
    want = norm_tokens(catalog_title)
    got = norm_tokens(source_title)
    if not want or not got:
        return catalog_title.strip() == source_title.strip()
    if len(want & got) / len(want) < threshold:
        return False
    # Measured on the real cases: every source currently in the production notebook matches
    # its candidate at 1.0, the documented punctuation/subtitle variant sits at 0.81, and the
    # 2026-09-18 series-template clash at 0.68 — 0.75 keeps a ~0.06 margin on both sides.
    return difflib.SequenceMatcher(None, normalize_title(catalog_title),
                                   normalize_title(source_title)).ratio() >= 0.75


def source_identity_ok(catalog_title: str, video_id: str, source_title: str) -> bool:
    """Decide whether a source-list entry is THIS candidate.

    NotebookLM renders a freshly added link source with its raw URL as the card title
    and only swaps in the real YouTube title once metadata resolves. Reading the card
    during that window is not a mis-import: the URL carries the candidate's video id,
    which identifies the source more precisely than any title comparison.

    Observed 2026-09-13 20:04-20:05: three consecutive items were recorded as
    `import-source` failures on that placeholder, although every source HAD been
    imported correctly, and the ledger still holds all three as `failed`. Fuzzy-matching
    the placeholder against the catalog title returns 0 overlap, so the guard converted
    a correct import into a false failure and spent one daily claim per item.
    """
    raw = (source_title or "").strip()
    if not raw:
        return False
    if title_matches(catalog_title, raw):
        return True
    # A URL-shaped card is the metadata placeholder: accept only an exact video-id match.
    if re.match(r"^https?://", raw, re.I):
        found = re.search(r"(?:v=|youtu\.be/|/shorts/|/embed/)([A-Za-z0-9_-]{6,})", raw)
        return bool(found) and bool(video_id) and found.group(1) == video_id
    return False


def isolate_name(imported_title: str, video_id: str) -> str:
    """The exact name the source-list checkbox carries, for the isolation step.

    The isolate adapter matches the name exactly, so a fragment must never be passed:
    two lectures can share a prefix and the wrong one would then be kept. When the card
    is still an unresolved URL placeholder, the video id is used instead — truncating
    "https://www.youtube.com/watch?v=..." to 28 characters would collide across every
    unresolved source in the notebook.
    """
    raw = (imported_title or "").strip()
    if re.match(r"^https?://", raw, re.I):
        return video_id
    return raw


def resolve_isolate_name(title: str, video_id: str, sources: list[str]) -> str:
    """The exact name to hand the isolate step, re-resolved from the LIVE source list.

    A freshly imported link source renders as its raw URL first and swaps in the real
    YouTube title once metadata resolves — and that swap can happen between the import step
    and the isolation step. On 2026-09-18 the runner passed the video id it captured at
    import time while the card had already become "Classic Game Postmortem: Ultima Online":
    the id matched nothing, isolation refused, and the item was recorded failed with a claim
    spent and no artifact attempted. Resolving the name here also means a card that resolved
    late is isolated by its real title, not by a placeholder.
    """
    matches = [s for s in sources if source_identity_ok(title, video_id, s)]
    if len(matches) != 1:
        raise StageError(
            f"expected exactly one source for this candidate before isolation, found {len(matches)}: "
            f"{json.dumps(matches, ensure_ascii=False)[:400]}", "isolate-source")
    return isolate_name(matches[0], video_id)


def list_sources() -> list[str]:
    proc = run(["node", str(BROWSER / "nblm-list-sources.cjs")], check=False)
    try:
        return json.loads(proc.stdout.strip().splitlines()[-1]).get("sources", [])
    except Exception:
        return []


def studio_payload(proc: subprocess.CompletedProcess, what: str) -> dict:
    """Return the Studio list JSON a browser step printed, or raise StageError.

    A read that failed must never be reported as an empty list. On 2026-09-17 the runner
    waited out the whole card cap and reported "no card of this type appeared" while all
    three artifacts were in the notebook; swallowing a channel error into `[]` is exactly
    how an observation failure turns into a fabricated "the server produced nothing".
    """
    for line in reversed(proc.stdout.strip().splitlines()):
        try:
            payload = json.loads(line)
        except Exception:  # noqa: BLE001 - not every output line is JSON
            continue
        if isinstance(payload, dict) and isinstance(payload.get("artifacts"), list):
            return payload
    raise StageError(
        f"{what} could not be read (rc={proc.returncode}): "
        f"{proc.stdout[-300:]} {proc.stderr[-300:]}", "studio-read")


def studio_cards(*, require_items: bool = False, what: str = "studio card list") -> list[str]:
    """Read the Studio artifact cards; raise instead of returning a fake empty list.

    "The panel answered with zero cards" is not the same fact as "the notebook has no
    artifacts". On 2026-09-17 the wait spent its whole 1200s cap reading an empty list from
    a panel that was not rendering its list at all, reported "no card of this type
    appeared", and left a finished artifact in the notebook. A payload that says the panel
    itself is missing is therefore an unreadable channel, and the pre-generation baseline
    refuses an empty answer outright: an empty baseline makes every older card look new.
    """
    proc = run(["node", str(BROWSER / "nblm-studio-list.cjs"), "--json"], timeout=180, check=False)
    payload = studio_payload(proc, what)
    cards = payload["artifacts"]
    detail = json.dumps({k: v for k, v in payload.items() if k != "artifacts"},
                        ensure_ascii=False)[:220]
    if not cards and payload.get("panel") is False:
        raise StageError(f"{what}: the Studio panel is not rendering ({detail})", "studio-read")
    if not cards and require_items:
        raise StageError(f"{what}: the panel returned no artifact cards ({detail})", "studio-read")
    return cards


def refresh_studio_list(*, settle_ms: int = 12000) -> list[str]:
    """Force a page reload, then return the freshly rendered card list."""
    proc = run(["node", str(BROWSER / "nblm-studio-list.cjs"), "--json", "--reload",
                f"--settle-ms={settle_ms}"], timeout=300, check=False)
    payload = studio_payload(proc, "studio card list after reload")
    if not payload.get("reloaded"):
        # The script only reloads on request; if it says otherwise the panel state is not
        # the one this function promises, so do not pretend the freeze was cleared.
        raise StageError(f"studio reload did not happen: {json.dumps(payload, ensure_ascii=False)[:200]}",
                         "studio-read")
    return payload["artifacts"]


CARD_RE = re.compile(r"^(?P<icon>[a-z_]+)(?:未读)?\s*(?P<title>.*?)\s*\d+\s*个来源")


def parse_card(card: str) -> tuple[str, str]:
    """Split a Studio card string into (icon, title).

    Card strings embed a RELATIVE age ("· 16 分钟前"), so two readings of the same card
    differ as text. Comparing raw strings therefore fails to recognise already-known
    cards, and a stale card from the previous item gets mistaken for the new one
    (observed 2026-09-13, where item 2's export targeted item 1's artifacts).

    The unread badge sits between the icon and the title, and it only appears on cards
    the operator has not opened — which is exactly the case for a card this run just
    generated. The icon class is ASCII, so restricting it to [a-z_]+ keeps 未读 out of
    the icon: leaving it in made the icon '<icon>未读', which never equals ICON[kind],
    so every freshly generated card looked like it did not exist and two items were
    recorded as generation failures on 2026-09-14 while their artifacts were fine.
    """
    m = CARD_RE.match(card.strip())
    if m:
        return (m.group("icon"), m.group("title").strip())
    return ("", card.strip())


def card_timeout() -> int:
    """Seconds to wait for one artifact card, overridable per run.

    1200s was the original guess. On 2026-09-14 all three cards for one item were still
    "正在生成" 30 minutes after submission with no throttle message, so the cap expired
    while the server was still working and the item was recorded as a generation failure
    even though nothing had actually failed. On 2026-09-15 a slide deck that had produced a
    complete summary, infographic and mind map was still generating at 1200s too (that one
    later reported a server-side failure, which the card loop below now surfaces directly
    instead of waiting). Completed decks on this account have taken about 27 minutes, so the
    cap must sit above that; the periodic refresh keeps a frozen list from being trusted.
    """
    return int(os.environ.get("LAG_CARD_TIMEOUT_SEC", "2700"))


def classify_cards(icon: str, known: set[tuple[str, str]], cards: list[str]) -> tuple[str, str]:
    """Turn one Studio snapshot into a decision for the artifact we are waiting for.

    Returns (state, detail) with state in {ready, generating, failure, absent}.

    A still-generating artifact is NOT rendered in the finished card shape. On 2026-09-17
    the panel showed "sync正在生成信息图…基于 1 个来源": icon `sync`, with the artifact type
    inside the title. The old code compared the icon first and `continue`d on every
    mismatch, so the "still generating" branch underneath was unreachable for our own
    artifact: the wait ran out and reported "no card of this type appeared", which reads as
    "the server produced nothing" and is the opposite of what the page said. Match the
    generating and failure rows by their type word BEFORE matching the finished card.
    """
    detail = "no card of this type appeared"
    word = KIND_WORDS.get(icon, "")
    for raw in cards:
        text = raw.strip()
        if GENERATING_RE.search(text):
            if word and word in text:
                detail = f"still generating: {text[:120]}"
            continue
        parsed = parse_card(text)
        if FAILURE_RE.search(text):
            # A server-side failure replaces the card and never becomes a card of the
            # requested type, so waiting out the cap would hide the real reason (observed
            # 2026-09-15: "未能生成演示文稿。请试试其他内容。"). Only rows that were not in the
            # pre-generation baseline count, so an older error row cannot fail a fresh item.
            if word and word in text and parsed not in known:
                return ("failure", text[:200])
            continue
        card_icon, title = parsed
        if card_icon != icon or not title or parsed in known:
            continue
        return ("ready", title)
    return ("generating" if detail.startswith("still generating") else "absent", detail)


def wait_for_card_events(icon: str, known: set[tuple[str, str]], *, timeout: float,
                         stale_after: float, poll: float, read_cards, refresh_cards,
                         clock=time.time, sleep=time.sleep, on_event=None) -> str:
    """Card wait as a pure decision walk, so tests replay it without a browser.

    Two observation defects produced false generation failures and each burned daily
    claims; both are handled here:

    * 2026-09-14 — a freshly generated card carries a "未读" badge, which the icon regex
      folded into the icon, so no new card ever matched (fixed in parse_card).
    * 2026-09-17 — the Studio list can stop reflecting the server. The panel kept showing
      the snapshot from while the artifact was still generating; the read immediately
      after the failure returned all three finished cards from the same list. Only a page
      reload has ever cleared that, so a list whose parsed card set has not moved for
      `stale_after` seconds is reloaded, and the timeout path reloads once more before
      giving up. Generation is server-side: a reload cannot cancel it. It DOES reset the
      source-panel selection to ALL sources, which is safe here because it only happens
      after the three generations were submitted — the caller logs every reload.
    """
    deadline = clock() + timeout
    last_seen = "no card of this type appeared"
    fingerprint: frozenset | None = None
    unchanged_since = clock()
    refreshes = 0
    last_refresh = 0.0
    last_read_error = ""

    while True:
        try:
            cards = read_cards()
            last_read_error = ""
        except StageError as exc:
            # An unreadable panel is not evidence about the artifact. Keep trying through
            # the refresh path and say so if the cap runs out.
            cards = []
            last_read_error = str(exc)
        state, detail = classify_cards(icon, known, cards)
        if state == "ready":
            if on_event:
                on_event("card-ready", {"card": detail, "refreshes": refreshes})
            return detail
        if state == "failure":
            raise StageError(f"{icon} card reported a generation failure: {detail}", "generation")
        last_seen = detail or last_seen

        observed = frozenset(parse_card(c) for c in cards)
        if observed != fingerprint:
            fingerprint = observed
            unchanged_since = clock()
        expired = clock() >= deadline
        # An empty list is a panel that is not showing its artifacts, not a panel that has
        # none, so it must not buy four quiet minutes: refresh it as soon as it is seen.
        blank = not cards
        stale = clock() - unchanged_since >= stale_after
        if blank and clock() - last_refresh < 60:
            blank = False  # already refreshed a moment ago; give the app time to finish
        if expired or stale or blank:
            if on_event:
                on_event("studio-refresh", {
                    "reason": ("timeout-final-refresh" if expired else
                               "studio list empty" if blank else "list unchanged"),
                    "unchanged_sec": int(clock() - unchanged_since),
                    "cards": len(cards), "read_error": last_read_error or None,
                    "source_selection_reset": True})
            try:
                refreshed = refresh_cards()
                last_read_error = ""
            except StageError as exc:
                refreshed = []
                last_read_error = str(exc)
            refreshes += 1
            last_refresh = clock()
            state, detail = classify_cards(icon, known, refreshed)
            if state == "ready":
                if on_event:
                    on_event("card-ready", {"card": detail, "refreshes": refreshes, "after_refresh": True})
                return detail
            if state == "failure":
                raise StageError(f"{icon} card reported a generation failure: {detail}", "generation")
            last_seen = detail or last_seen
            fingerprint = frozenset(parse_card(c) for c in refreshed)
            unchanged_since = clock()
            if expired:
                # Say what was actually observed: a card that is still generating has not
                # failed, it is unfinished, and the distinction decides how it is handled.
                detail_note = f"; last read error: {last_read_error}" if last_read_error else ""
                raise StageError(
                    f"{icon} card was not ready after {int(timeout)}s ({last_seen}; "
                    f"cards={len(refreshed)} after {refreshes} forced studio refresh(es){detail_note})",
                    "generation")

        sleep(poll)


def wait_for_card(icon: str, known: set[tuple[str, str]], timeout: int | None = None,
                  on_event=None) -> str:
    """Wait until a NEW card of the given icon type finishes generating; return its title."""
    return wait_for_card_events(
        icon, known,
        timeout=card_timeout() if timeout is None else timeout,
        stale_after=float(os.environ.get("LAG_CARD_STALE_SEC", "240")),
        poll=float(os.environ.get("LAG_CARD_POLL_SEC", "15")),
        read_cards=studio_cards, refresh_cards=refresh_studio_list, on_event=on_event)


def mindmap_verification(stdout: str) -> dict:
    """Read the real expand-all evidence out of nblm-export-mindmap.cjs output.

    The published contract's `expansion_verification` must describe what the viewer
    actually showed. Writing "observed_depth": 3 as a constant would assert a check nobody
    performed, so the numbers come from the export step that performs it: it clicks
    "Expand all nodes", counts the remaining collapse affordances, counts the text columns
    (depth below the root), and re-counts to prove the render settled.
    """
    m = re.search(r"^VERIFY: (\{.*\})$", stdout, re.M)
    d = re.search(r"^DEPTH_BELOW_ROOT: (\d+)$", stdout, re.M)
    if not m or not d:
        raise StageError("mindmap export did not report its viewer verification", "export")
    verify = json.loads(m.group(1))
    if verify.get("expandAffordances") != 0 or not verify.get("renderStable"):
        raise StageError(f"mindmap viewer verification incomplete: {verify}", "export")
    return {
        "method": "notebooklm-viewer",
        "action": "全部展开",
        "observed_depth": int(d.group(1)),
        "collapsed_node_count": int(verify["expandAffordances"]),
        "content_node_count": int(verify.get("contentNodes", 0)),
        "render_stable": bool(verify.get("renderStable")),
    }


def picgo_upload(path: Path) -> str:
    body = json.dumps({"list": [str(path)]}).encode()
    req = urllib.request.Request(PICGO, data=body, headers={"Content-Type": "application/json"})
    with urllib.request.urlopen(req, timeout=600) as resp:
        payload = json.loads(resp.read().decode())
    if not payload.get("success"):
        raise StageError(f"PicGo reported failure: {payload}", "upload")
    result = payload.get("result")
    url = result if isinstance(result, str) else (result or [""])[0]
    if not url.startswith("http"):
        raise StageError(f"PicGo returned no URL: {payload}", "upload")
    return url


def verify_remote(url: str, local: Path) -> dict:
    req = urllib.request.Request(url, headers={"User-Agent": "curl/8"})
    with urllib.request.urlopen(req, timeout=300) as resp:
        remote = resp.read()
        ctype = resp.headers.get("Content-Type")
        status = resp.status
    local_bytes = local.read_bytes()
    return {
        "http_status": status,
        "content_type": ctype,
        "remote_bytes": len(remote),
        "local_bytes": len(local_bytes),
        "sha256_match": hashlib.sha256(remote).hexdigest() == hashlib.sha256(local_bytes).hexdigest(),
    }


def identity_check_command() -> int:
    """Answer identity questions from stdin so tests exercise THIS rule, not a copy.

    Reads [{"catalog_title","video_id","source_title"}...], writes a boolean per entry.
    Deliberately dependency-free: no browser, no network, no state, no ledger.
    """
    cases = json.loads(sys.stdin.read() or "[]")
    results = [source_identity_ok(c["catalog_title"], c["video_id"], c["source_title"]) for c in cases]
    json.dump(results, sys.stdout)
    sys.stdout.write("\n")
    return 0


def parse_cards_command() -> int:
    """Parse raw Studio card strings from stdin; used by tests to exercise parse_card."""
    cards = json.loads(sys.stdin.read() or "[]")
    json.dump([list(parse_card(c)) for c in cards], sys.stdout)
    sys.stdout.write("\n")
    return 0


def isolate_name_command() -> int:
    """Resolve the isolation name from stdin; used by tests to exercise THIS rule.

    Input: [{"catalog_title","video_id","sources":[...]}...]
    Output: [{"name": "..."}] or [{"error": "..."}] per case. No browser, no ledger.
    """
    cases = json.loads(sys.stdin.read() or "[]")
    out: list[dict] = []
    for case in cases:
        try:
            out.append({"name": resolve_isolate_name(case["catalog_title"], case["video_id"],
                                                      case.get("sources") or [])})
        except StageError as exc:
            out.append({"error": str(exc)})
    json.dump(out, sys.stdout, ensure_ascii=False)
    sys.stdout.write("\n")
    return 0


def wait_plan_command() -> int:
    """Replay the card wait over recorded Studio snapshots; used by tests.

    Input (stdin): {"icon", "known": [[icon,title]...], "reads": [[card,...], ...],
                    "timeout_sec", "stale_after_sec", "poll_sec"}
    A "read" is one whole Studio snapshot. `refresh` re-reads the current snapshot (the
    page reload itself is what production does; the snapshot index still advances, which
    is how a frozen panel is modelled). Output: what the production decision walk did.
    No browser, no network, no ledger.
    """
    plan = json.loads(sys.stdin.read() or "{}")
    reads = plan.get("reads") or []
    events: list[dict] = []
    clock = {"t": 1000.0, "i": 0, "refreshes": 0}
    seen: list[str] = []

    def current() -> list[str]:
        # Each read/refresh consumes the next recorded snapshot; once the recording is
        # exhausted the panel keeps showing the last one, which is what a frozen list is.
        if not reads:
            return []
        idx = min(clock["i"], len(reads) - 1)
        clock["i"] += 1
        return list(reads[idx])

    def read_cards() -> list[str]:
        cards = current()
        seen.append("read")
        return cards

    def refresh_cards() -> list[str]:
        clock["refreshes"] += 1
        cards = current()
        seen.append("refresh")
        return cards

    def sleep(seconds: float) -> None:
        clock["t"] += float(seconds)

    def fake_clock() -> float:
        return clock["t"]

    payload: dict = {"reads": 0, "refreshes": 0, "events": events}
    try:
        title = wait_for_card_events(
            plan["icon"], {tuple(x) for x in plan.get("known", [])},
            timeout=float(plan.get("timeout_sec", 900)),
            stale_after=float(plan.get("stale_after_sec", 240)),
            poll=float(plan.get("poll_sec", 15)),
            read_cards=read_cards, refresh_cards=refresh_cards, clock=fake_clock, sleep=sleep,
            on_event=lambda name, detail: events.append({"event": name, **detail}))
        payload.update({"result": "ready", "title": title, "reads": seen.count("read"),
                        "refreshes": seen.count("refresh")})
    except StageError as exc:
        payload.update({"result": "failure", "stage": exc.stage, "message": str(exc),
                        "reads": seen.count("read"), "refreshes": seen.count("refresh")})
    json.dump(payload, sys.stdout, ensure_ascii=False)
    sys.stdout.write("\n")
    return 0


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--resource-id")
    ap.add_argument("--identity-check", action="store_true",
                    help="read identity cases as JSON on stdin and print booleans; does not touch the ledger")
    ap.add_argument("--parse-cards", action="store_true",
                    help="read raw Studio card strings as JSON on stdin and print [icon, title] pairs")
    ap.add_argument("--isolate-name", action="store_true",
                    help="resolve the isolation name for source lists given as JSON on stdin")
    ap.add_argument("--wait-plan", action="store_true",
                    help="replay the card-wait decision over recorded Studio snapshots on stdin")
    ap.add_argument("--state-dir", default=os.environ.get("LAG_NOTEBOOKLM_STATE_DIR", str(Path.home() / ".local/state/learn-about-games/notebooklm-daily")))
    ap.add_argument("--item-dir")
    ap.add_argument("--generation-run-id", help="resume an already-claimed run instead of claiming again")
    args = ap.parse_args()

    if args.identity_check:
        return identity_check_command()
    if args.parse_cards:
        return parse_cards_command()
    if args.isolate_name:
        return isolate_name_command()
    if args.wait_plan:
        return wait_plan_command()
    if not args.resource_id:
        ap.error("--resource-id is required unless --identity-check, --parse-cards or --wait-plan is used")

    state = Path(args.state_dir)
    cand = catalog_candidate(args.resource_id)
    title = cand.title
    video_id = cand.video_id
    source_url = cand.source_url
    topic = cand.topic

    item_dir = Path(args.item_dir) if args.item_dir else state / "runs" / f"{dt.datetime.now().strftime('%Y-%m-%dT%H%M%S%z')}-item-{video_id}"
    item = Item(args.resource_id, item_dir)
    print(f"ITEM {args.resource_id} | {title} | topic={topic} | dir={item_dir}", flush=True)

    stage = "deck-availability"
    try:
        # 0) Refuse to spend a claim when the deck feature cannot generate right now.
        # A deck is one of the three required artifacts, so a throttled deck makes the
        # item impossible; finding that out after claiming wastes one of ten daily claims
        # (observed 2026-09-13). This probe opens and closes a dialog only.
        if not args.generation_run_id:
            # 0a) Is the source already in the production notebook? Never spend a claim to
            # re-import one. This is a read-only lookup and never fails the item: a failed
            # lookup is reported as unknown rather than as "source absent".
            pre_state = "unknown"
            try:
                pre_sources = list_sources()
                if any(source_identity_ok(title, video_id, t) for t in pre_sources):
                    pre_state = "present"
                elif pre_sources:
                    pre_state = "absent"
            except Exception as exc:  # noqa: BLE001 - advisory only, must not abort the item
                pre_state = f"unknown: {exc}"
            item.note("pre-claim-source-lookup", {"state": pre_state})

            # 0b) Put the Studio panel back in list mode first, AND prove the card list is
            # actually readable. The previous item's export leaves one of its artifact
            # viewers open, and an open viewer hides the create buttons, so the deck probe
            # below reports a false "unavailable" and stops the whole batch for a UI reason
            # (observed 2026-09-15). Reading strictly also keeps the 2026-09-17 failure
            # honest: an unreadable panel is a run-level channel problem and must stop the
            # item BEFORE a claim, not surface later as "the server made no card".
            normalised = studio_cards(require_items=True, what="pre-claim studio card list")
            item.note("pre-claim-studio-list", {"cards": len(normalised)})

            probe = run(["node", str(BROWSER / "nblm-deck-available.cjs")], timeout=180, check=False)
            try:
                avail = json.loads(probe.stdout.strip().splitlines()[-1])
            except Exception:
                avail = {"available": False, "reason": f"deck probe unreadable: {probe.stdout[-200:]}{probe.stderr[-200:]}"}
            item.note(stage, avail)
            if not avail.get("available"):
                raise StageError("deck feature unavailable before claim: " + str(avail.get("reason")), stage)

            # 0c) Can the chat answer? The summary stage asks the notebook a question, so a
            # rate limited chat makes the item impossible — and the limit only becomes
            # visible when the question is sent, i.e. after the claim is spent (observed
            # 2026-09-16: "已达到 AI 用量限额。12:38 PM 之后，所有功能都将可用。"). This probe
            # is a page read: it sends nothing and consumes no quota.
            chat = run(["node", str(BROWSER / "nblm-chat-available.cjs")], timeout=120, check=False)
            try:
                chat_state = json.loads(chat.stdout.strip().splitlines()[-1])
            except Exception:
                chat_state = {"available": False,
                              "reason": f"chat probe unreadable: {chat.stdout[-200:]}{chat.stderr[-200:]}"}
            item.note("chat-availability", chat_state)
            if not chat_state.get("available"):
                raise StageError("chat unavailable before claim: " + str(chat_state.get("reason")), "chat-availability")

        # 1) claim (or resume a claim opened by an explicit retry)
        if args.generation_run_id:
            run_id = args.generation_run_id
            item.claim = {"generation_run_id": run_id}
            item.note("claim", {"generation_run_id": run_id, "resumed": True})
        else:
            proc = run([sys.executable, str(PRODUCER), "claim", "--catalog", str(CATALOG), "--inbox", str(INBOX),
                        "--state-dir", str(state), "--resource-id", args.resource_id])
            item.claim = json.loads(proc.stdout)
            run_id = item.claim["generation_run_id"]
            item.note("claim", {"generation_run_id": run_id, "claimed_at": item.claim["claimed_at"]})

        # 2) make sure the Studio panel is in list mode before touching anything.
        # An open artifact viewer (left over from the previous item's export) would make
        # the generator reload the page, and a reload resets the source selection to ALL
        # sources — which silently grounds an artifact in every lecture in the notebook.
        stage = "ensure-list"
        # Wait until no artifact is mid-generation. Otherwise a previous item's card can
        # finish AFTER our baseline is taken, and wait_for_card would then claim it as
        # ours, exporting the wrong lecture's artifact.
        idle_deadline = time.time() + 900
        # An empty baseline would make every older card look like this item's new card, so
        # the baseline read refuses an empty answer (that is the 2026-09-13 wrong-artifact
        # failure mode). A long-term notebook that suddenly reports no artifacts at all is
        # an observation problem, not an empty notebook.
        cards = studio_cards(require_items=True, what="pre-generation studio baseline")
        while any(re.search(r"正在生成|生成中|Generating", c) for c in cards) and time.time() < idle_deadline:
            time.sleep(20)
            cards = studio_cards(require_items=True, what="pre-generation studio baseline")
        cards_before = {parse_card(c) for c in cards}
        item.note(stage, {"cards": len(cards_before),
                          "idle": not any(re.search(r"正在生成|生成中", c) for c in cards)})

        # 3) ensure the YouTube source is present (reuse it if a previous attempt already
        #    imported it, so a retry cannot duplicate the source or mismatch its identity)
        stage = "import-source"
        existing = [t for t in list_sources() if source_identity_ok(title, video_id, t)]
        if existing:
            item.imported_title = existing[0]
            item.note(stage, {"imported_title": item.imported_title, "reused": True})
        else:
            proc = run(["node", str(BROWSER / "nblm-add-youtube.cjs"), source_url, "--timeout-sec=180"], timeout=400)
            m = re.search(r"^ADDED: (.+)$", proc.stdout, re.M)
            if not m:
                raise StageError("source import produced no ADDED line", stage)
            item.imported_title = m.group(1).strip()
            if not source_identity_ok(title, video_id, item.imported_title):
                raise StageError(
                    f"imported source does not match the candidate: catalog={title!r} imported={item.imported_title!r}",
                    stage)
            item.note(stage, {"imported_title": item.imported_title, "reused": False,
                              "title_is_url_placeholder": bool(re.match(r"^https?://", item.imported_title, re.I))})

        # 4) isolate: only the new source stays selected (chat + generation dialogs)
        stage = "isolate-source"
        # Resolve against the live source list: the card may have swapped its URL
        # placeholder for the real title since the import step.
        keep = resolve_isolate_name(title, video_id, list_sources())
        run(["node", str(BROWSER / "nblm-isolate-source.cjs"), keep], timeout=420)
        item.note(stage, {"kept": keep, "imported_title": item.imported_title})

        # 5) content summary
        stage = "summary"
        prompt = (f"只基于当前唯一来源'{item.imported_title}'（{source_url}）完整转写，用中文简体按原演讲顺序完整写一份"
                  f"面向游戏设计师的详细内容总结：核心问题、案例与迭代、设计取舍、玩家影响、可迁移方法；"
                  f"不要逐字稿，不要补充外部事实。最后单独写\"来源边界：\"，说明来源未覆盖或无法确认的内容。")
        ask = run(["node", str(BROWSER / "nblm-ask.cjs"), prompt, "--timeout-sec=300"], timeout=400, check=False)
        before = int(re.search(r"ANSWERS_BEFORE=(\d+)", ask.stdout).group(1)) if "ANSWERS_BEFORE=" in ask.stdout else 0
        if ask.returncode not in (0, 2):
            raise StageError(f"ask failed: {ask.stdout[-400:]} {ask.stderr[-400:]}", stage)
        raw = item.dir / "summary-raw.txt"
        run(["node", str(BROWSER / "nblm-extract-answer.cjs"), str(raw),
             f"--min-count={before + 1}", "--timeout-sec=420"], timeout=600)
        run([sys.executable, str(SPLITTER), str(raw), str(item.dir / "summary.txt"), str(item.dir / "boundary.txt")])
        summary = (item.dir / "summary.txt").read_text(encoding="utf-8")
        boundary = (item.dir / "boundary.txt").read_text(encoding="utf-8")
        if any(x in summary + boundary for x in ["辐射4", "Fallout"]):
            raise StageError("summary mentions a different source (cross-source contamination)", stage)
        item.note(stage, {"summary_chars": len(summary), "boundary_chars": len(boundary)})

        # 5) three artifacts
        prompts = {
            "infographic": (f"用中文简体生成一张横向、详细的手绘笔记风格信息图，基于唯一来源《{item.imported_title}》讲座："
                            f"核心问题、案例与迭代、设计取舍、玩家影响与可迁移方法。所有文字必须使用中文简体。"),
            "mindmap": (f"用中文简体输出思维导图，围绕唯一来源《{item.imported_title}》讲座展开：核心问题、案例与迭代、"
                        f"设计取舍、玩家影响、可迁移方法。所有节点必须使用中文简体，层级不少于三级。"),
            "slides": (f"请基于唯一来源《{item.imported_title}》讲座，制作中文简体详细演示文稿：核心问题、案例与迭代、"
                       f"设计取舍、玩家影响、可迁移方法，以及来源未覆盖的边界。内容对应讲座原顺序，不补充外部事实。"),
        }
        stage = "generation"
        # re-assert isolation immediately before generating: the dialog snapshots the
        # selection when it opens, so this is the last safe moment to guarantee grounding
        run(["node", str(BROWSER / "nblm-isolate-source.cjs"), keep], timeout=420)
        for kind in ("infographic", "mindmap", "slides"):
            try:
                run(["node", str(BROWSER / "nblm-generate-artifact.cjs"), kind, prompts[kind], keep], timeout=900)
            except StageError as exc:
                # The deck feature can go from "available" to throttled inside one item
                # (observed 2026-09-15: the pre-claim gate said available at 12:29 and the
                # submission at 12:32 offered only the multi-hour queue). Re-probe so the
                # ledger and the run report name the throttle instead of an opaque command
                # failure — that is the signal that stops the rest of the day's batch.
                if kind == "slides" and re.search(r"no generate button|GEN_FAIL", str(exc)):
                    gate = run(["node", str(BROWSER / "nblm-deck-available.cjs")], timeout=180, check=False)
                    try:
                        state = json.loads(gate.stdout.strip().splitlines()[-1])
                    except Exception:  # noqa: BLE001 - classification is advisory
                        state = {}
                    if "throttled" in str(state.get("reason", "")):
                        item.note("deck-throttle", state)
                        raise StageError("deck feature throttled mid-item: " + str(state.get("reason")), "generation")
                raise
            item.note(f"generate-{kind}", {"submitted": True})
        for kind in ("infographic", "mindmap", "slides"):
            card_title = wait_for_card(ICON[kind], cards_before, timeout=card_timeout(),
                                       on_event=lambda name, detail, k=kind: item.note(f"{k}-{name}", detail))
            item.cards[kind] = card_title
            item.note(f"ready-{kind}", {"card": card_title})

        # 6) export real bytes
        stage = "export"
        files = {
            "infographic": item.artifacts_dir / "infographic.png",
            "mindmap": item.artifacts_dir / "mindmap.png",
            "slides": item.artifacts_dir / "slides.pptx",
        }
        run(["node", str(BROWSER / "nblm-export-image-artifact.cjs"), item.cards["infographic"], str(files["infographic"])], timeout=900)
        mindmap_proc = run(["node", str(BROWSER / "nblm-export-mindmap.cjs"), item.cards["mindmap"], str(files["mindmap"]), "2664"], timeout=900)
        item.mindmap_verification = mindmap_verification(mindmap_proc.stdout)
        item.note("mindmap-verification", item.mindmap_verification)
        # The deck goes through the page-asset route first: the card's own download control
        # is a browser-process download navigation that, on this machine (2026-09-15),
        # stalled a few KB in on every attempt and then killed the browser. The viewer
        # download stays as the fallback for environments where the page route is blocked.
        deck_dir = item.dir / "deck"
        deck_route = "page-asset-capture"
        try:
            run(["node", str(BROWSER / "nblm-capture-deck.cjs"), item.cards["slides"], str(files["slides"]),
                 "--timeout-sec=300"], timeout=600)
        except StageError as exc:
            item.note("export-deck-capture", {"fell_back_to_viewer_download": True, "reason": str(exc)[:300]})
            deck_route = "viewer-download"
            run(["node", str(BROWSER / "nblm-export-deck.cjs"), item.cards["slides"], str(deck_dir), "--timeout-sec=300"], timeout=600)
            downloaded = [p for p in deck_dir.glob("*.pptx") if not p.name.endswith(".crdownload")]
            if not downloaded:
                raise StageError("deck download produced no pptx", stage)
            shutil.copy(downloaded[0], files["slides"])
        for k, p in files.items():
            if not p.exists() or p.stat().st_size < 50000:
                raise StageError(f"{k} export looks empty: {p}", stage)
        sizes = {k: p.stat().st_size for k, p in files.items()}
        sizes["deck_route"] = deck_route
        item.note(stage, sizes)
        item.deck_route = deck_route

        # 7) upload + readback
        stage = "upload"
        contract = {"infographic": "infographic.png", "mindmap": "mindmap.png", "slides": "slides.pptx"}
        for kind, p in files.items():
            ts = stamp()
            staged = item.artifacts_dir / f"{ts}-{topic}-{contract[kind]}"
            shutil.copy(p, staged)
            url = picgo_upload(staged)
            check = verify_remote(url, staged)
            if not check["sha256_match"]:
                raise StageError(f"{kind} remote readback mismatch: {check}", stage)
            item.uploads[kind] = {"url": url, "local": staged.name, "bytes": staged.stat().st_size, **check}
            item.note(f"upload-{kind}", item.uploads[kind])
            time.sleep(1)

        # 8) publish ready
        stage = "publish"
        result = {
            "title": title,
            "topic": topic,
            "content_summary": summary,
            "boundary": "来源边界：\n" + boundary,
            "source": {"url": source_url, "label": f"YouTube · {title}"},
            "artifacts": {
                "infographic": {"label": "中文简体横向手绘信息图（详细）", "url": item.uploads["infographic"]["url"]},
                "mind_map": {"label": "中文简体完整思维导图（查看器内全部展开）", "url": item.uploads["mindmap"]["url"],
                             "expansion_verification": item.mindmap_verification},
                "slide_deck": {"label": "中文简体详细演示文稿（PPTX）", "url": item.uploads["slides"]["url"]},
            },
            "notebook_url": "https://notebook.google.com/notebook/2ce16a4b-c41a-42f4-8e03-d387494cdd17",
            "export_note": ("信息图：CDP Fetch 流式取回 lh3 原始字节（asset-capture.cjs）；思维导图：viewer 内 Expand all nodes "
                            "+ DOM 核验（折叠 0、层级不少于三级、渲染稳定）后以 SVG 抽取渲染；演示文稿："
                            + ("页面网络栈取回原始 PPTX（nblm-capture-deck.cjs，浏览器的下载控件在本机不可靠）"
                               if item.deck_route == "page-asset-capture"
                               else "viewer ⋮ 下载 PPTX（页面资产路径不可用时的回退）")
                            + "。三件均经 PicGo 上传并回读 sha256 校验。"),
        }
        result_path = item.dir / "result.json"
        result_path.write_text(json.dumps(result, ensure_ascii=False, indent=2), encoding="utf-8")
        proc = run([sys.executable, str(PRODUCER), "publish", "--catalog", str(CATALOG), "--inbox", str(INBOX),
                    "--state-dir", str(state), "--resource-id", args.resource_id,
                    "--generation-run-id", run_id, "--result-json", str(result_path)])
        ready_file = proc.stdout.strip().splitlines()[-1]
        item.note(stage, {"ready_file": ready_file})

        # 9) deliver to the remote inbox
        stage = "deliver"
        proc = run([str(PUBLISH_SH), "--resource-file", ready_file], timeout=600)
        item.note(stage, {"output": proc.stdout.strip()[-200:]})

        stage = "done"
        item.note(stage, {"ready": True})
        (item.dir / "report.json").write_text(json.dumps({
            "resource_id": args.resource_id, "title": title, "topic": topic, "stage": "done",
            "generation_run_id": run_id, "ready_file": ready_file, "uploads": item.uploads,
            "cards": item.cards, "log": item.log, "recorded_at": now(),
        }, ensure_ascii=False, indent=1), encoding="utf-8")
        print("ITEM_OK", args.resource_id, flush=True)
        return 0

    except Exception as exc:  # noqa: BLE001 - we must record the stage, not crash silently
        detail = str(exc)
        failing_stage = getattr(exc, "stage", None) or stage
        print(f"ITEM_FAIL stage={failing_stage}: {detail}", flush=True)
        if failing_stage == "deck-availability":
            # No claim was taken, so this is a run-level capacity block, not an item failure.
            (item.dir / "report.json").write_text(json.dumps({
                "resource_id": args.resource_id, "title": title, "topic": topic,
                "stage": failing_stage, "error": detail[:2000], "claim_consumed": False,
                "log": item.log, "recorded_at": now(),
            }, ensure_ascii=False, indent=1), encoding="utf-8")
            print("ITEM_BLOCKED_DECK", args.resource_id, flush=True)
            return 3
        if failing_stage == "studio-read" and not item.claim.get("generation_run_id"):
            # The browser channel could not even read the artifact list, so nothing about
            # this candidate was attempted. Stopping here keeps the daily claim for a run
            # where the panel is readable again (the 2026-09-17 batch burned a claim on
            # exactly this class of observation problem).
            (item.dir / "report.json").write_text(json.dumps({
                "resource_id": args.resource_id, "title": title, "topic": topic,
                "stage": failing_stage, "error": detail[:2000], "claim_consumed": False,
                "log": item.log, "recorded_at": now(),
            }, ensure_ascii=False, indent=1), encoding="utf-8")
            print("ITEM_BLOCKED_STUDIO", args.resource_id, flush=True)
            return 3
        run_id = item.claim.get("generation_run_id")
        if run_id:
            run([sys.executable, str(PRODUCER), "fail", "--catalog", str(CATALOG), "--state-dir", str(state),
                 "--resource-id", args.resource_id, "--generation-run-id", run_id,
                 "--reason", f"{failing_stage}: {detail[:600]}"], check=False)
        (item.dir / "report.json").write_text(json.dumps({
            "resource_id": args.resource_id, "title": title, "topic": topic, "stage": failing_stage,
            "error": detail[:2000], "log": item.log, "recorded_at": now(),
        }, ensure_ascii=False, indent=1), encoding="utf-8")
        return 1


if __name__ == "__main__":
    raise SystemExit(main())
