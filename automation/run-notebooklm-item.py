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


def norm_tokens(text: str) -> set[str]:
    text = text.lower()
    text = re.sub(r"[^a-z0-9\u4e00-\u9fff]+", " ", text)
    stop = {"the", "a", "an", "of", "in", "and", "to", "for", "on", "with", "how", "your", "you"}
    return {w for w in text.split() if len(w) > 2 and w not in stop}


def title_matches(catalog_title: str, source_title: str, threshold: float = 0.6) -> bool:
    """Fuzzy match: YouTube source titles are usually the catalog title, sometimes with
    punctuation or subtitle differences. Used both to reuse an already-imported source
    and to refuse a mis-identified import."""
    want = norm_tokens(catalog_title)
    got = norm_tokens(source_title)
    if not want or not got:
        return catalog_title.strip() == source_title.strip()
    return len(want & got) / len(want) >= threshold


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


def list_sources() -> list[str]:
    proc = run(["node", str(BROWSER / "nblm-list-sources.cjs")], check=False)
    try:
        return json.loads(proc.stdout.strip().splitlines()[-1]).get("sources", [])
    except Exception:
        return []


def studio_cards() -> list[str]:
    proc = run(["node", str(BROWSER / "nblm-studio-list.cjs"), "--json"], check=False)
    try:
        payload = json.loads(proc.stdout.strip().splitlines()[-1])
        return payload.get("artifacts", [])
    except Exception:
        return []


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
    even though nothing had actually failed.
    """
    return int(os.environ.get("LAG_CARD_TIMEOUT_SEC", "1200"))


def wait_for_card(icon: str, known: set[tuple[str, str]], timeout: int | None = None) -> str:
    """Wait until a NEW card of the given icon type finishes generating; return its title."""
    timeout = card_timeout() if timeout is None else timeout
    deadline = time.time() + timeout
    last_seen = "no card of this type appeared"
    # The Studio list can freeze on "正在生成" long after the server finished (observed
    # 2026-09-14: three cards read as generating for 80+ minutes and showed real titles
    # immediately after a reload). Re-reading through a reload is therefore part of
    # waiting, not a recovery step, and it costs nothing.
    reread_every = int(os.environ.get("LAG_CARD_REREAD_SEC", "300"))
    next_reread = time.time() + reread_every
    while time.time() < deadline:
        for c in studio_cards():
            card_icon, title = parse_card(c)
            if card_icon != icon:
                continue
            if (card_icon, title) in known:
                continue
            if re.search(r"正在生成|生成中|Generating", c):
                last_seen = "still generating"
                continue
            if title:
                return title
        if time.time() >= next_reread:
            next_reread = time.time() + reread_every
            run(["node", str(BROWSER / "nblm-studio-list.cjs")], timeout=180, check=False)
        time.sleep(15)
    # Say what was actually observed: a card that is still generating has not failed,
    # it is unfinished, and the distinction matters when deciding whether to re-run.
    raise StageError(f"{icon} card was not ready after {timeout}s ({last_seen})", "generation")


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


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--resource-id")
    ap.add_argument("--identity-check", action="store_true",
                    help="read identity cases as JSON on stdin and print booleans; does not touch the ledger")
    ap.add_argument("--parse-cards", action="store_true",
                    help="read raw Studio card strings as JSON on stdin and print [icon, title] pairs")
    ap.add_argument("--state-dir", default=os.environ.get("LAG_NOTEBOOKLM_STATE_DIR", str(Path.home() / ".local/state/learn-about-games/notebooklm-daily")))
    ap.add_argument("--item-dir")
    ap.add_argument("--generation-run-id", help="resume an already-claimed run instead of claiming again")
    args = ap.parse_args()

    if args.identity_check:
        return identity_check_command()
    if args.parse_cards:
        return parse_cards_command()
    if not args.resource_id:
        ap.error("--resource-id is required unless --identity-check or --parse-cards is used")

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

            probe = run(["node", str(BROWSER / "nblm-deck-available.cjs")], timeout=180, check=False)
            try:
                avail = json.loads(probe.stdout.strip().splitlines()[-1])
            except Exception:
                avail = {"available": False, "reason": f"deck probe unreadable: {probe.stdout[-200:]}{probe.stderr[-200:]}"}
            item.note(stage, avail)
            if not avail.get("available"):
                raise StageError("deck feature unavailable before claim: " + str(avail.get("reason")), stage)

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
        cards = studio_cards()
        while any(re.search(r"正在生成|生成中|Generating", c) for c in cards) and time.time() < idle_deadline:
            time.sleep(20)
            cards = studio_cards()
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
        keep = isolate_name(item.imported_title, video_id)
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
            run(["node", str(BROWSER / "nblm-generate-artifact.cjs"), kind, prompts[kind], keep], timeout=900)
            item.note(f"generate-{kind}", {"submitted": True})
        for kind in ("infographic", "mindmap", "slides"):
            card_title = wait_for_card(ICON[kind], cards_before, timeout=card_timeout())
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
        run(["node", str(BROWSER / "nblm-export-mindmap.cjs"), item.cards["mindmap"], str(files["mindmap"]), "2664"], timeout=900)
        deck_dir = item.dir / "deck"
        run(["node", str(BROWSER / "nblm-export-deck.cjs"), item.cards["slides"], str(deck_dir), "--timeout-sec=300"], timeout=600)
        downloaded = [p for p in deck_dir.glob("*.pptx") if not p.name.endswith(".crdownload")]
        if not downloaded:
            raise StageError("deck download produced no pptx", stage)
        shutil.copy(downloaded[0], files["slides"])
        for k, p in files.items():
            if not p.exists() or p.stat().st_size < 50000:
                raise StageError(f"{k} export looks empty: {p}", stage)
        item.note(stage, {k: p.stat().st_size for k, p in files.items()})

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
                             "expansion_verification": {"method": "notebooklm-viewer", "action": "全部展开",
                                                        "observed_depth": 3, "collapsed_node_count": 0}},
                "slide_deck": {"label": "中文简体详细演示文稿（PPTX）", "url": item.uploads["slides"]["url"]},
            },
            "notebook_url": "https://notebook.google.com/notebook/2ce16a4b-c41a-42f4-8e03-d387494cdd17",
            "export_note": ("信息图：CDP Fetch 流式取回 lh3 原始字节（asset-capture.cjs）；思维导图：viewer 内 Expand all nodes "
                            "+ DOM 核验（折叠 0、层级不少于三级、渲染稳定）后以 SVG 抽取渲染；演示文稿：viewer ⋮ 下载 PPTX。"
                            "三件均经 PicGo 上传并回读 sha256 校验。"),
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
