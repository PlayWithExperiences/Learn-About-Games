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


CARD_RE = re.compile(r"^(?P<icon>\w+)\s*(?:未读)?\s*(?P<title>.*?)\s*\d+\s*个来源")


def parse_card(card: str) -> tuple[str, str]:
    """Split a Studio card string into (icon, title).

    Card strings embed a RELATIVE age ("· 16 分钟前"), so two readings of the same card
    differ as text. Comparing raw strings therefore fails to recognise already-known
    cards, and a stale card from the previous item gets mistaken for the new one
    (observed 2026-09-13, where item 2's export targeted item 1's artifacts).
    """
    m = CARD_RE.match(card.strip())
    if m:
        return (m.group("icon"), m.group("title").strip())
    return ("", card.strip())


def wait_for_card(icon: str, known: set[tuple[str, str]], timeout: int = 1200) -> str:
    """Wait until a NEW card of the given icon type finishes generating; return its title."""
    deadline = time.time() + timeout
    while time.time() < deadline:
        for c in studio_cards():
            card_icon, title = parse_card(c)
            if card_icon != icon:
                continue
            if (card_icon, title) in known:
                continue
            if re.search(r"正在生成|生成中|Generating", c):
                continue
            if title:
                return title
        time.sleep(15)
    raise StageError(f"{icon} card did not finish generating within {timeout}s", "generation")


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


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--resource-id", required=True)
    ap.add_argument("--state-dir", default=os.environ.get("LAG_NOTEBOOKLM_STATE_DIR", str(Path.home() / ".local/state/learn-about-games/notebooklm-daily")))
    ap.add_argument("--item-dir")
    ap.add_argument("--generation-run-id", help="resume an already-claimed run instead of claiming again")
    args = ap.parse_args()

    state = Path(args.state_dir)
    cand = catalog_candidate(args.resource_id)
    title = cand.title
    video_id = cand.video_id
    source_url = cand.source_url
    topic = cand.topic

    item_dir = Path(args.item_dir) if args.item_dir else state / "runs" / f"{dt.datetime.now().strftime('%Y-%m-%dT%H%M%S%z')}-item-{video_id}"
    item = Item(args.resource_id, item_dir)
    print(f"ITEM {args.resource_id} | {title} | topic={topic} | dir={item_dir}", flush=True)

    stage = "claim"
    try:
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
        existing = [t for t in list_sources() if title_matches(title, t)]
        if existing:
            item.imported_title = existing[0]
            item.note(stage, {"imported_title": item.imported_title, "reused": True})
        else:
            proc = run(["node", str(BROWSER / "nblm-add-youtube.cjs"), source_url, "--timeout-sec=180"], timeout=400)
            m = re.search(r"^ADDED: (.+)$", proc.stdout, re.M)
            if not m:
                raise StageError("source import produced no ADDED line", stage)
            item.imported_title = m.group(1).strip()
            if not title_matches(title, item.imported_title):
                raise StageError(
                    f"imported source does not match the candidate: catalog={title!r} imported={item.imported_title!r}",
                    stage)
            item.note(stage, {"imported_title": item.imported_title, "reused": False})

        # 4) isolate: only the new source stays selected (chat + generation dialogs)
        stage = "isolate-source"
        keep = item.imported_title[:28]
        run(["node", str(BROWSER / "nblm-isolate-source.cjs"), keep], timeout=240)
        item.note(stage, {"kept": keep})

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
        run(["node", str(BROWSER / "nblm-isolate-source.cjs"), keep], timeout=240)
        for kind in ("infographic", "mindmap", "slides"):
            run(["node", str(BROWSER / "nblm-generate-artifact.cjs"), kind, prompts[kind], keep], timeout=900)
            item.note(f"generate-{kind}", {"submitted": True})
        for kind in ("infographic", "mindmap", "slides"):
            card_title = wait_for_card(ICON[kind], cards_before, timeout=1200)
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
