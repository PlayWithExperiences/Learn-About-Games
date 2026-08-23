#!/usr/bin/env python3
"""Safely repair the external trickle runtime after the known ffmpeg failure.

This command is intentionally opt-in: without --apply it only verifies the
known failure fingerprint. It never changes resources.json.
"""

from __future__ import annotations

import argparse
import hashlib
import json
import os
import shutil
import subprocess
import sys
from datetime import datetime, timezone
from pathlib import Path
from typing import Any


REPO_ROOT = Path(__file__).resolve().parents[1]
if str(REPO_ROOT) not in sys.path:
    sys.path.insert(0, str(REPO_ROOT))

from scripts.backfill_video_content import initialize_pending_records


CACHE = Path.home() / ".cache" / "lag-video-content"
STATE_PATH = CACHE / "state.json"
REPORT_PATH = CACHE / "report.json"
FAILURES_PATH = CACHE / "failures.log"
TRICKLE_LOG_PATH = CACHE / "trickle.log"
COOLDOWN_PATH = CACHE / "cooldown_until"
LAUNCHD_SCRIPT_PATH = CACHE / "trickle.sh"
TARGET_ITEM_ID = "yt-20260820-gdc-9YG9INjO91Y"
EXPECTED_TARGET_TOTAL = 2311
TARGET_FAILURE_CLASS = "audio_channel"
TOOLING_FAILURE_MARKER = "ffprobe and ffmpeg not found"
EXTERNAL_ARTICLE_PROVIDER = "Senko's Activity Log"
EXTERNAL_ARTICLE_LABEL = "二手专题摘要（非视频正文）"
ARTICLE_SUMMARY_LABEL = "文章摘要（非视频正文）"
POLYGON_ARTICLE_PROVIDER = "Polygon"
NINTENDOWIRE_ARTICLE_PROVIDER = "Nintendo Wire"
OFFICIAL_DESCRIPTION_PROVIDER = "YouTube"
OFFICIAL_DESCRIPTION_LABEL = "视频简介首段（原文摘录，非字幕正文）"
EVIDENCE_CONTRACTS = {
    (EXTERNAL_ARTICLE_PROVIDER, EXTERNAL_ARTICLE_LABEL): {
        "inputMode": "external_article",
        "evidenceType": "secondary_summary",
        "model": "manual/secondary-summary",
    },
    (POLYGON_ARTICLE_PROVIDER, ARTICLE_SUMMARY_LABEL): {
        "inputMode": "external_article",
        "evidenceType": "secondary_summary",
        "model": "manual/secondary-summary",
    },
    (NINTENDOWIRE_ARTICLE_PROVIDER, ARTICLE_SUMMARY_LABEL): {
        "inputMode": "external_article",
        "evidenceType": "secondary_summary",
        "model": "manual/secondary-summary",
    },
    (OFFICIAL_DESCRIPTION_PROVIDER, OFFICIAL_DESCRIPTION_LABEL): {
        "inputMode": "description",
        "evidenceType": "official_description",
        "model": "manual/official-description-summary",
    },
}


def now_iso() -> str:
    return datetime.now(timezone.utc).replace(microsecond=0).isoformat()


def load_json(path: Path, label: str) -> dict[str, Any]:
    if not path.exists():
        raise RuntimeError(f"{label} 不存在：{path}")
    try:
        value = json.loads(path.read_text(encoding="utf-8"))
    except json.JSONDecodeError as exc:
        raise RuntimeError(f"{label} 不是合法 JSON：{path}") from exc
    if not isinstance(value, dict):
        raise RuntimeError(f"{label} 顶层不是对象：{path}")
    return value


def reconcile_external_article_results(
    state: dict[str, Any],
    target_items: list[dict[str, Any]],
    timestamp: str,
    skipped_existing: list[str] | None = None,
) -> list[str]:
    """Register explicitly contracted external evidence without overwriting conflicts.

    The resource record is the reviewed artifact; this function only mirrors a
    verified completion into the external state when --apply is explicitly run.
    It never treats an arbitrary externalSignals entry as content evidence.
    Existing completed records from another input channel are preserved and
    reported to the caller instead of being overwritten.
    """
    items = state.setdefault("items", {})
    reconciled: list[str] = []
    for item in target_items:
        signals = item.get("externalSignals")
        if not isinstance(signals, list):
            continue
        matches = [
            signal
            for signal in signals
            if isinstance(signal, dict)
            and (signal.get("provider"), signal.get("label")) in EVIDENCE_CONTRACTS
        ]
        if not matches:
            continue
        if len(matches) != 1:
            raise RuntimeError(f"内容证据标记不唯一：{item.get('id')}")
        signal = matches[0]
        contract = EVIDENCE_CONTRACTS[(signal["provider"], signal["label"])]
        summary = item.get("summary", {}).get("zh-CN") if isinstance(item.get("summary"), dict) else None
        if not isinstance(summary, str) or not 150 <= len(summary) <= 250:
            raise RuntimeError(f"内容证据条目的摘要未通过长度校验：{item.get('id')}")
        if not isinstance(signal.get("url"), str) or not signal["url"].startswith(("http://", "https://")):
            raise RuntimeError(f"内容证据 URL 无效：{item.get('id')}")
        if (
            signal["provider"] == OFFICIAL_DESCRIPTION_PROVIDER
            and "youtube.com/watch?v=" not in signal["url"]
        ):
            raise RuntimeError(f"官方描述证据必须指向 YouTube 视频页：{item.get('id')}")
        if not isinstance(item.get("resourceTopicIds"), list) or len(item["resourceTopicIds"]) != 1:
            raise RuntimeError(f"内容证据条目的主要资源主题不唯一：{item.get('id')}")

        item_id = item["id"]
        existing = items.get(item_id)
        if existing is not None:
            if not isinstance(existing, dict):
                raise RuntimeError(f"state 记录不是对象，拒绝同步二手证据：{item_id}")
            same_external_completion = (
                existing.get("status") == "completed"
                and existing.get("inputMode") == contract["inputMode"]
                and existing.get("evidenceUrl") == signal["url"]
            )
            if existing.get("status") == "completed" and not same_external_completion:
                if skipped_existing is not None:
                    skipped_existing.append(item_id)
                continue
            if existing.get("status") not in {"evidence_pending", "retryable"} and not same_external_completion:
                raise RuntimeError(
                    f"state 已有非待处理记录，拒绝覆盖内容证据：{item_id} status={existing.get('status')!r}"
                )

        items[item_id] = {
            "status": "completed",
            "retryable": False,
            "inputMode": contract["inputMode"],
            "model": contract["model"],
            "evidenceType": contract["evidenceType"],
            "evidenceUrl": signal["url"],
            "evidenceLabel": signal["label"],
            "evidenceValue": signal.get("value", ""),
            "summaryLength": len(summary),
            "summarySha256": hashlib.sha256(summary.encode("utf-8")).hexdigest(),
            "updatedAt": timestamp,
        }
        reconciled.append(item_id)
    return reconciled


def atomic_write_json(path: Path, value: dict[str, Any]) -> None:
    temporary = path.with_name(f".{path.name}.repair-tmp")
    temporary.write_text(json.dumps(value, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    os.replace(temporary, path)


def reconcile_summary_lengths(
    state: dict[str, Any], target_items: list[dict[str, Any]], timestamp: str
) -> list[str]:
    """Align completed-state length metadata with the catalog without changing content."""
    items = state.get("items")
    if not isinstance(items, dict):
        raise RuntimeError("state.items 不是对象，拒绝做摘要长度对账")
    changed: list[str] = []
    for item in target_items:
        item_id = item.get("id")
        record = items.get(item_id)
        if not isinstance(record, dict):
            raise RuntimeError(f"摘要长度对账缺少 state 记录：{item_id}")
        if record.get("status") != "completed":
            raise RuntimeError(
                f"摘要长度对账只接受 completed：{item_id} status={record.get('status')!r}"
            )
        summary = item.get("summary", {}).get("zh-CN") if isinstance(item.get("summary"), dict) else None
        if not isinstance(summary, str) or not summary.strip():
            raise RuntimeError(f"摘要长度对账遇到空摘要：{item_id}")
        expected_length = len(summary)
        if record.get("summaryLength") != expected_length:
            record["summaryLength"] = expected_length
            record["summaryLengthReconciledAt"] = timestamp
            changed.append(item_id)
    return changed


def reconcile_external_summary_lengths() -> dict[str, Any]:
    """Persist a strict catalog/state length reconciliation in the external cache."""
    resources = json.loads((REPO_ROOT / "src/data/resources.json").read_text(encoding="utf-8"))
    target_sources = {"gdc-festival-of-gaming", "masahiro-sakurai-on-creating-games-en", "game-makers-toolkit"}
    target_items = [item for item in resources if item.get("sourceId") in target_sources]
    if len(target_items) != EXPECTED_TARGET_TOTAL:
        raise RuntimeError(
            f"目标视频条目数为 {len(target_items)}，预期 {EXPECTED_TARGET_TOTAL}；拒绝摘要长度对账"
        )
    state = load_json(STATE_PATH, "正式 state")
    timestamp = now_iso()
    changed = reconcile_summary_lengths(state, target_items, timestamp)
    atomic_write_json(STATE_PATH, state)
    report = load_json(REPORT_PATH, "正式 report")
    report["summaryLengthReconciliation"] = {
        "at": timestamp,
        "changedCount": len(changed),
        "changedItemIds": changed,
    }
    atomic_write_json(REPORT_PATH, report)
    return {
        "reconciled": True,
        "targetTotal": len(target_items),
        "changedCount": len(changed),
        "changedItemIds": changed,
    }


def last_failure_line() -> str:
    if not FAILURES_PATH.exists():
        raise RuntimeError(f"失败日志不存在：{FAILURES_PATH}")
    lines = [line for line in FAILURES_PATH.read_text(encoding="utf-8").splitlines() if line.strip()]
    if not lines:
        raise RuntimeError("失败日志为空，拒绝推断音频失败根因")
    return lines[-1]


def validate_preconditions() -> dict[str, Any]:
    if not (REPO_ROOT / "scripts/trickle-video-content.sh").is_file():
        raise RuntimeError("仓库内涓流脚本不存在")
    state = load_json(STATE_PATH, "正式 state")
    record = state.get("items", {}).get(TARGET_ITEM_ID)
    if not isinstance(record, dict):
        raise RuntimeError(f"state 中没有目标条目：{TARGET_ITEM_ID}")
    if record.get("status") != "retryable" or record.get("failureClass") != TARGET_FAILURE_CLASS:
        raise RuntimeError(
            "目标条目不是预期的历史 audio_channel retryable，拒绝自动改写："
            f"status={record.get('status')!r}, failureClass={record.get('failureClass')!r}"
        )
    failure = last_failure_line()
    fields = failure.split("\t", 3)
    if len(fields) != 4 or fields[1] != TARGET_ITEM_ID or TOOLING_FAILURE_MARKER not in fields[3]:
        raise RuntimeError("最后一条失败日志不是已核实的 ffmpeg/ffprobe 缺失，拒绝清除冷却")
    if not COOLDOWN_PATH.exists():
        raise RuntimeError("冷却标记不存在，拒绝假设它由这条历史失败产生")
    if not REPORT_PATH.exists():
        raise RuntimeError(f"正式 report 不存在：{REPORT_PATH}")
    return {"state": state, "record": record, "failure": failure}


def repair(*, kickstart: bool) -> dict[str, Any]:
    checked = validate_preconditions()
    state = checked["state"]
    record = dict(checked["record"])
    timestamp = now_iso()
    resources = json.loads((REPO_ROOT / "src/data/resources.json").read_text(encoding="utf-8"))
    target_sources = {"gdc-festival-of-gaming", "masahiro-sakurai-on-creating-games-en", "game-makers-toolkit"}
    target_items = [item for item in resources if item.get("sourceId") in target_sources]
    if len(target_items) != EXPECTED_TARGET_TOTAL:
        raise RuntimeError(
            f"目标视频条目数为 {len(target_items)}，预期 {EXPECTED_TARGET_TOTAL}；拒绝修复 runtime"
        )

    CACHE.mkdir(parents=True, exist_ok=True)
    shutil.copy2(REPO_ROOT / "scripts/trickle-video-content.sh", LAUNCHD_SCRIPT_PATH)
    skipped_external_article_ids: list[str] = []
    external_article_ids = reconcile_external_article_results(
        state, target_items, timestamp, skipped_existing=skipped_external_article_ids
    )
    initialize_pending_records(state, target_items, STATE_PATH)

    record["failureClass"] = "audio_tooling"
    record["retryable"] = True
    record["nextStep"] = "使用显式 ffmpeg/ffprobe 路径重试音频入口"
    record["updatedAt"] = timestamp
    state.setdefault("items", {})[TARGET_ITEM_ID] = record
    atomic_write_json(STATE_PATH, state)

    report = load_json(REPORT_PATH, "正式 report")
    target_ids = {item["id"] for item in resources if item.get("sourceId") in target_sources}
    items = state.get("items", {})
    channel_classes = {"transcript_channel", "model_channel", "audio_channel", "vertex_channel"}
    model_classes = {"model_output", "vertex_output"}
    records = [items.get(item_id, {}) for item_id in target_ids]
    totals = {
        "completed": sum(record.get("status") == "completed" for record in records),
        "no_transcript": sum(record.get("status") == "no_transcript" for record in records),
        "transcript_insufficient": sum(record.get("status") == "transcript_insufficient" for record in records),
        "channel_failure": sum(record.get("failureClass") in channel_classes for record in records),
        "model_failure": sum(record.get("failureClass") in model_classes for record in records),
        "retryable_other": sum(
            record.get("status") == "retryable" and record.get("failureClass") not in channel_classes | model_classes
            for record in records
        ),
    }
    report["totals"] = totals
    report["unclassifiedAfterRun"] = sum(item_id not in items for item_id in target_ids)
    report["evidencePendingAfterRun"] = sum(
        isinstance(items.get(item_id), dict) and items[item_id].get("status") == "evidence_pending"
        for item_id in target_ids
    )
    report["remainingAfterRun"] = len(target_ids) - sum(totals.values())
    report["uncompletedAfterRun"] = len(target_ids) - totals["completed"]
    report["runtimeRepair"] = {
        "itemId": TARGET_ITEM_ID,
        "from": TARGET_FAILURE_CLASS,
        "to": "audio_tooling",
        "at": timestamp,
        "externalArticleCompleted": external_article_ids,
        "externalArticleSkippedExisting": skipped_external_article_ids,
    }
    atomic_write_json(REPORT_PATH, report)
    COOLDOWN_PATH.unlink()
    TRICKLE_LOG_PATH.parent.mkdir(parents=True, exist_ok=True)
    with TRICKLE_LOG_PATH.open("a", encoding="utf-8") as handle:
        handle.write(f"{timestamp}\tINFO\t已核验并修复历史 ffmpeg 工具链失败，清除对应冷却\n")

    kickstart_result = None
    if kickstart:
        launchd_label = f"gui/{os.getuid()}/com.lag.video-trickle"
        completed = subprocess.run(
            ["launchctl", "kickstart", "-k", launchd_label],
            capture_output=True,
            text=True,
            check=False,
        )
        kickstart_result = {"returncode": completed.returncode, "stderr": completed.stderr.strip()}
        if completed.returncode != 0:
            raise RuntimeError(f"launchd kickstart 失败：{completed.stderr.strip()}")

    return {
        "repaired": True,
        "itemId": TARGET_ITEM_ID,
        "failureClass": "audio_tooling",
        "cooldownRemoved": True,
        "launchdScript": str(LAUNCHD_SCRIPT_PATH),
        "kickstart": kickstart_result,
        "externalArticleCompleted": external_article_ids,
        "totals": totals,
    }


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--apply", action="store_true", help="确认前置条件后同步副本、修复 state/report 并清除对应冷却")
    parser.add_argument("--kickstart", action="store_true", help="修复后立即 kickstart launchd；必须同时使用 --apply")
    parser.add_argument(
        "--reconcile-summary-lengths",
        action="store_true",
        help="只对账已完成记录的 summaryLength 元数据，不改摘要正文",
    )
    args = parser.parse_args()
    if args.kickstart and not args.apply:
        parser.error("--kickstart 必须同时使用 --apply")
    if args.reconcile_summary_lengths and (args.apply or args.kickstart):
        parser.error("--reconcile-summary-lengths 不能与 --apply/--kickstart 同时使用")
    if args.reconcile_summary_lengths:
        print(json.dumps(reconcile_external_summary_lengths(), ensure_ascii=False, indent=2))
        return 0
    if not args.apply:
        checked = validate_preconditions()
        print(json.dumps({"ready": True, "itemId": TARGET_ITEM_ID, "failure": checked["failure"]}, ensure_ascii=False, indent=2))
        return 0
    print(json.dumps(repair(kickstart=args.kickstart), ensure_ascii=False, indent=2))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
