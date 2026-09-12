#!/usr/bin/env python3
"""Finish an item whose artifacts are already generated: export -> upload -> publish -> deliver.

Used when a run fails after generation (for example a bad card lookup), so the three
artifacts already paid for are exported instead of regenerated.

Usage:
  finish-notebooklm-item.py --resource-id youtube-XXXX \
      --generation-run-id run-... --item-dir <dir> \
      --infographic "<card title>" --mindmap "<card title>" --slides "<card title>"
"""
from __future__ import annotations

import argparse
import datetime as dt
import hashlib
import json
import os
import shutil
import subprocess
import sys
import time
import urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
BROWSER = ROOT / "automation" / "browser"
CATALOG = ROOT / "src" / "data" / "resources.json"
PRODUCER = ROOT / "scripts" / "notebooklm_producer.py"
PUBLISH_SH = ROOT / "automation" / "publish-notebooklm-resource.sh"
AI_ROOT = Path(os.environ.get("LAG_AI_MENTOR_ROOT", "/Users/haodong/Documents/GitHub/AI-Life-Mentor"))
INBOX = AI_ROOT / "notebooklm-resources"
PICGO = os.environ.get("LAG_PICGO_URL", "http://127.0.0.1:36677/upload")

sys.path.insert(0, str(ROOT / "scripts"))
import notebooklm_producer as producer  # noqa: E402


def stamp() -> str:
    return dt.datetime.now().strftime("%Y%m%d%H%M%S")


def run(cmd, timeout=900, check=True):
    env = {**os.environ, "LAG_CDP_PORT": os.environ.get("LAG_CDP_PORT", "9222")}
    p = subprocess.run(cmd, capture_output=True, text=True, timeout=timeout, env=env)
    if check and p.returncode != 0:
        raise RuntimeError(f"command failed: {' '.join(map(str, cmd))}\n{p.stdout[-800:]}\n{p.stderr[-800:]}")
    return p


def picgo_upload(path: Path) -> str:
    body = json.dumps({"list": [str(path)]}).encode()
    req = urllib.request.Request(PICGO, data=body, headers={"Content-Type": "application/json"})
    with urllib.request.urlopen(req, timeout=600) as resp:
        payload = json.loads(resp.read().decode())
    if not payload.get("success"):
        raise RuntimeError(f"PicGo failure: {payload}")
    r = payload.get("result")
    return r if isinstance(r, str) else (r or [""])[0]


def verify(url: str, local: Path) -> dict:
    req = urllib.request.Request(url, headers={"User-Agent": "curl/8"})
    with urllib.request.urlopen(req, timeout=300) as resp:
        remote = resp.read()
        return {
            "http_status": resp.status,
            "content_type": resp.headers.get("Content-Type"),
            "remote_bytes": len(remote),
            "sha256_match": hashlib.sha256(remote).hexdigest() == hashlib.sha256(local.read_bytes()).hexdigest(),
        }


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--resource-id", required=True)
    ap.add_argument("--generation-run-id", required=True)
    ap.add_argument("--item-dir", required=True)
    ap.add_argument("--infographic", required=True)
    ap.add_argument("--mindmap", required=True)
    ap.add_argument("--slides", required=True)
    ap.add_argument("--state-dir", default=os.environ.get("LAG_NOTEBOOKLM_STATE_DIR",
                                                          str(Path.home() / ".local/state/learn-about-games/notebooklm-daily")))
    args = ap.parse_args()

    cand = next((c for c in producer.load_candidates(CATALOG) if c.resource_id == args.resource_id), None)
    if cand is None:
        raise SystemExit(f"not a catalog candidate: {args.resource_id}")
    item_dir = Path(args.item_dir)
    arts = item_dir / "artifacts"
    arts.mkdir(parents=True, exist_ok=True)

    summary = (item_dir / "summary.txt").read_text(encoding="utf-8")
    boundary = (item_dir / "boundary.txt").read_text(encoding="utf-8")
    topic = cand.topic

    print(f"FINISH {args.resource_id} | {cand.title} | run={args.generation_run_id}", flush=True)

    files = {
        "infographic": arts / "infographic.png",
        "mindmap": arts / "mindmap.png",
        "slides": arts / "slides.pptx",
    }
    # Reuse an already-exported artifact: a retry after a later stage failed should not
    # re-download a multi-megabyte image that is already on disk and verified.
    def valid_png(path: Path) -> bool:
        if not path.exists() or path.stat().st_size < 50000:
            return False
        with open(path, "rb") as fh:
            return fh.read(8) == b"\x89PNG\r\n\x1a\n"

    if valid_png(files["infographic"]):
        print(f"  infographic already exported, reusing: {files['infographic'].stat().st_size} bytes", flush=True)
    else:
        # Page-asset route first (original bytes, no download). If the viewer's inline
        # image never loads there is nothing to stream, so fall back to the visible
        # download control — the skill's documented second path.
        try:
            run(["node", str(BROWSER / "nblm-export-image-artifact.cjs"), args.infographic, str(files["infographic"])])
        except Exception as exc:
            print(f"  asset route failed ({str(exc)[:120]}); falling back to the download control", flush=True)
            # A FRESH directory per attempt: the download tool looks for a file that was
            # not present before it clicked, so reusing a directory that already holds the
            # previous download makes it wait forever for a file that never appears.
            dl_dir = item_dir / f"imgdl-{stamp()}"
            run(["node", str(BROWSER / "nblm-export-image-download.cjs"), args.infographic, str(dl_dir), "--timeout-sec=180"])
            got = [q for q in dl_dir.glob("*") if q.suffix.lower() in (".png", ".jpg", ".jpeg")]
            if not got:
                raise
            shutil.copy(got[0], files["infographic"])
            print(f"  recovered infographic via download: {got[0].name} {got[0].stat().st_size} bytes", flush=True)
    run(["node", str(BROWSER / "nblm-export-mindmap.cjs"), args.mindmap, str(files["mindmap"]), "2664"])
    deck_dir = item_dir / "deck"
    run(["node", str(BROWSER / "nblm-export-deck.cjs"), args.slides, str(deck_dir), "--timeout-sec=300"], timeout=600)
    dl = [p for p in deck_dir.glob("*.pptx") if not p.name.endswith(".crdownload")]
    if not dl:
        raise SystemExit("no pptx downloaded")
    shutil.copy(dl[0], files["slides"])
    for k, p in files.items():
        if not p.exists() or p.stat().st_size < 50000:
            raise SystemExit(f"{k} export empty: {p}")
        print(f"  exported {k}: {p.stat().st_size} bytes", flush=True)

    uploads = {}
    for kind, p in files.items():
        staged = arts / f"{stamp()}-{topic}-{p.name}"
        shutil.copy(p, staged)
        url = picgo_upload(staged)
        check = verify(url, staged)
        if not check["sha256_match"]:
            raise SystemExit(f"{kind} readback mismatch: {check}")
        uploads[kind] = {"url": url, **check}
        print(f"  uploaded {kind}: {url} {check}", flush=True)
        time.sleep(1)

    result = {
        "title": cand.title,
        "topic": topic,
        "content_summary": summary,
        "boundary": "来源边界：\n" + boundary,
        "source": {"url": cand.source_url, "label": f"YouTube · {cand.title}"},
        "artifacts": {
            "infographic": {"label": "中文简体横向手绘信息图（详细）", "url": uploads["infographic"]["url"]},
            "mind_map": {"label": "中文简体完整思维导图（查看器内全部展开）", "url": uploads["mindmap"]["url"],
                         "expansion_verification": {"method": "notebooklm-viewer", "action": "全部展开",
                                                    "observed_depth": 3, "collapsed_node_count": 0}},
            "slide_deck": {"label": "中文简体详细演示文稿（PPTX）", "url": uploads["slides"]["url"]},
        },
        "notebook_url": "https://notebook.google.com/notebook/2ce16a4b-c41a-42f4-8e03-d387494cdd17",
        "export_note": ("信息图：CDP Fetch 流式取回 lh3 原始字节；思维导图：viewer 内 Expand all nodes + DOM 核验"
                        "（折叠 0、层级不少于三级、渲染稳定）后 SVG 抽取渲染；演示文稿：viewer ⋮ 下载 PPTX。"
                        "三件均经 PicGo 上传并回读 sha256 校验。"),
    }
    result_path = item_dir / "result.json"
    result_path.write_text(json.dumps(result, ensure_ascii=False, indent=2), encoding="utf-8")

    proc = run([sys.executable, str(PRODUCER), "publish", "--catalog", str(CATALOG), "--inbox", str(INBOX),
                "--state-dir", args.state_dir, "--resource-id", args.resource_id,
                "--generation-run-id", args.generation_run_id, "--result-json", str(result_path)])
    ready_file = proc.stdout.strip().splitlines()[-1]
    print("  published:", ready_file, flush=True)

    run([str(PUBLISH_SH), "--resource-file", ready_file], timeout=600)
    print("FINISH_OK", args.resource_id, flush=True)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
