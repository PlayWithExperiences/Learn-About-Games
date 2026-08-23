"""Deterministic, idempotent preparation for one NotebookLM resource.

This module deliberately does not call NotebookLM, PicGo, GitHub, or an LLM.  The
local Skill owns those runtime actions; this module owns candidate selection, the
single-instance lock, durable state, and the validated ``ready`` inbox artifact.
"""

from __future__ import annotations

import argparse
import hashlib
import json
import os
import re
import sys
from contextlib import contextmanager
from dataclasses import asdict, dataclass
from datetime import datetime, timedelta, timezone
from pathlib import Path
from typing import Iterator
from urllib.parse import parse_qs, urlparse


BEIJING = timezone(timedelta(hours=8))
DEFAULT_STATE_DIR = Path.home() / ".local" / "state" / "learn-about-games" / "notebooklm-daily"
VIDEO_ID_RE = re.compile(r"^[A-Za-z0-9_-]{11}$")
SLUG_RE = re.compile(r"^[a-z0-9][a-z0-9-]*$")
TIMESTAMP_RE = re.compile(r"^\d{4}-\d{4}-\d{4}$")
INBOX_STATUSES = {"ready", "delivering", "consumed", "failed", "partial"}


class ProducerError(RuntimeError):
    """The local producer contract is broken; never turn this into an empty result."""


class AlreadyProcessed(ProducerError):
    """The selected video already has a durable claim or an inbox artifact."""


class AlreadyRunning(ProducerError):
    """Another producer process owns the single-instance lock."""


@dataclass(frozen=True)
class Candidate:
    resource_id: str
    video_id: str
    source_url: str
    catalog_id: str
    title: str
    topic: str


def _now() -> str:
    return datetime.now(BEIJING).isoformat(timespec="seconds")


def _timestamp(now: str) -> str:
    try:
        parsed = datetime.fromisoformat(now)
    except ValueError as exc:
        raise ProducerError(f"时间戳不是 ISO 日期时间：{now}") from exc
    return parsed.strftime("%Y-%m%d-%H%M")


def _required_text(value: object, field: str) -> str:
    if not isinstance(value, str) or not value.strip():
        raise ProducerError(f"{field} 必须是非空字符串")
    return value.strip()


def _topic(value: object) -> str:
    if isinstance(value, str) and SLUG_RE.fullmatch(value.strip()):
        return value.strip()
    return "learning-resource"


def _strict_topic(value: object, field: str) -> str:
    if not isinstance(value, str) or not SLUG_RE.fullmatch(value.strip()):
        raise ProducerError(f"{field} 必须是小写短横线 slug")
    return value.strip()


def extract_video_id(url: str) -> str | None:
    """Extract a YouTube video ID from supported public URL forms."""
    if not isinstance(url, str) or not url.strip():
        return None
    parsed = urlparse(url.strip())
    host = parsed.netloc.lower().split(":", 1)[0]
    if host == "youtu.be":
        value = parsed.path.strip("/").split("/", 1)[0]
    elif host in {"youtube.com", "www.youtube.com", "m.youtube.com"}:
        if parsed.path == "/watch":
            value = parse_qs(parsed.query).get("v", [None])[0]
        elif parsed.path.startswith(("/shorts/", "/embed/")):
            value = parsed.path.split("/", 2)[2]
        else:
            value = None
    else:
        return None
    if not isinstance(value, str):
        return None
    value = value.split("?", 1)[0].split("&", 1)[0]
    return value if VIDEO_ID_RE.fullmatch(value) else None


def _resource_title(resource: dict, resource_id: str) -> str:
    titles = resource.get("title")
    if isinstance(titles, dict):
        for key in ("zh-CN", "en"):
            value = titles.get(key)
            if isinstance(value, str) and value.strip():
                return value.strip()
    return resource_id


def _candidate_from_resource(resource: dict, position: int) -> list[Candidate]:
    resource_id = _required_text(resource.get("id"), f"resources[{position}].id")
    urls: list[str] = []
    canonical = resource.get("canonicalUrl")
    if isinstance(canonical, str):
        urls.append(canonical)
    versions = resource.get("accessVersions")
    if isinstance(versions, list):
        urls.extend(
            version.get("url")
            for version in versions
            if isinstance(version, dict) and isinstance(version.get("url"), str)
        )

    candidates: list[Candidate] = []
    seen_ids: set[str] = set()
    topic_ids = resource.get("resourceTopicIds")
    topic = _topic(topic_ids[0] if isinstance(topic_ids, list) and topic_ids else None)
    title = _resource_title(resource, resource_id)
    for url in urls:
        video_id = extract_video_id(url)
        if video_id is None or video_id in seen_ids:
            continue
        seen_ids.add(video_id)
        candidates.append(
            Candidate(
                resource_id=f"youtube-{video_id}",
                video_id=video_id,
                source_url=url,
                catalog_id=resource_id,
                title=title,
                topic=topic,
            )
        )
    return candidates


def load_candidates(catalog_path: Path) -> list[Candidate]:
    """Load unique YouTube candidates in catalog order."""
    try:
        raw = json.loads(catalog_path.read_text(encoding="utf-8"))
    except FileNotFoundError as exc:
        raise ProducerError(f"资源目录不存在：{catalog_path}") from exc
    except json.JSONDecodeError as exc:
        raise ProducerError(f"资源目录不是合法 JSON：{catalog_path}：{exc}") from exc
    if not isinstance(raw, list):
        raise ProducerError(f"资源目录必须是 JSON 数组：{catalog_path}")

    candidates: list[Candidate] = []
    seen: dict[str, Candidate] = {}
    for position, resource in enumerate(raw):
        if not isinstance(resource, dict):
            raise ProducerError(f"resources[{position}] 必须是对象")
        for candidate in _candidate_from_resource(resource, position):
            previous = seen.get(candidate.video_id)
            if previous is not None:
                if previous.catalog_id != candidate.catalog_id:
                    raise ProducerError(
                        f"YouTube video_id {candidate.video_id} 同时属于 {previous.catalog_id} 和 {candidate.catalog_id}，"
                        "拒绝猜测归属"
                    )
                continue
            seen[candidate.video_id] = candidate
            candidates.append(candidate)
    return candidates


def _empty_ledger() -> dict:
    return {"version": 1, "entries": {}}


def read_ledger(path: Path) -> dict:
    if not path.exists():
        return _empty_ledger()
    try:
        ledger = json.loads(path.read_text(encoding="utf-8"))
    except json.JSONDecodeError as exc:
        raise ProducerError(f"ledger 不是合法 JSON：{path}：{exc}") from exc
    if not isinstance(ledger, dict) or ledger.get("version") != 1 or not isinstance(ledger.get("entries"), dict):
        raise ProducerError(f"ledger 合同无效：{path}")
    return ledger


def _atomic_write_json(path: Path, value: dict) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    temporary = path.with_name(f".{path.name}.{os.getpid()}.tmp")
    try:
        with temporary.open("w", encoding="utf-8") as handle:
            json.dump(value, handle, ensure_ascii=False, indent=2, sort_keys=True)
            handle.write("\n")
            handle.flush()
            os.fsync(handle.fileno())
        os.replace(temporary, path)
    finally:
        if temporary.exists():
            temporary.unlink()


def write_ledger(path: Path, ledger: dict) -> None:
    _atomic_write_json(path, ledger)


@contextmanager
def producer_lock(lock_path: Path) -> Iterator[None]:
    lock_path.parent.mkdir(parents=True, exist_ok=True)
    descriptor: int | None = None
    try:
        try:
            descriptor = os.open(lock_path, os.O_CREAT | os.O_EXCL | os.O_WRONLY, 0o600)
        except FileExistsError as exc:
            raise AlreadyRunning(f"NotebookLM producer 已在运行，锁文件：{lock_path}") from exc
        payload = {"pid": os.getpid(), "created_at": _now()}
        os.write(descriptor, json.dumps(payload, ensure_ascii=False).encode("utf-8"))
        os.close(descriptor)
        descriptor = None
        yield
    finally:
        if descriptor is not None:
            os.close(descriptor)
        if lock_path.exists():
            lock_path.unlink()


def _inbox_records(inbox_dir: Path | None) -> list[tuple[Path, dict]]:
    if inbox_dir is None or not inbox_dir.exists():
        return []
    records: list[tuple[Path, dict]] = []
    for path in sorted(inbox_dir.glob("*.json")):
        try:
            value = json.loads(path.read_text(encoding="utf-8"))
        except json.JSONDecodeError as exc:
            raise ProducerError(f"inbox JSON 损坏：{path}：{exc}") from exc
        if not isinstance(value, dict):
            raise ProducerError(f"inbox 记录必须是对象：{path}")
        records.append((path, value))
    return records


def _record_video_id(record: dict, path: Path) -> str | None:
    source = record.get("source")
    if not isinstance(source, dict):
        return None
    explicit = source.get("video_id")
    url_id = extract_video_id(source.get("url", ""))
    if explicit is not None and (not isinstance(explicit, str) or not VIDEO_ID_RE.fullmatch(explicit)):
        raise ProducerError(f"inbox source.video_id 无效：{path}")
    if explicit and url_id and explicit != url_id:
        raise ProducerError(f"inbox source.video_id 与 URL 不一致：{path}")
    return explicit or url_id


def _existing_inbox_for_video(inbox_dir: Path | None, video_id: str) -> Path | None:
    for path, record in _inbox_records(inbox_dir):
        if _record_video_id(record, path) == video_id:
            return path
    return None


def _run_id(now: str) -> str:
    compact = re.sub(r"[^0-9]", "", now)[:14]
    return f"run-{compact}-{os.getpid()}"


def claim_candidate(
    candidate: Candidate,
    ledger_path: Path,
    now: str,
    *,
    inbox_dir: Path | None = None,
) -> dict:
    """Atomically claim one candidate before any NotebookLM call."""
    lock_path = ledger_path.with_suffix(ledger_path.suffix + ".lock")
    with producer_lock(lock_path):
        ledger = read_ledger(ledger_path)
        existing = ledger["entries"].get(candidate.resource_id)
        if existing and existing.get("status") in INBOX_STATUSES | {"generating"}:
            raise AlreadyProcessed(
                f"{candidate.resource_id} 已处于 {existing.get('status')}，拒绝再次生产"
            )
        existing_inbox = _existing_inbox_for_video(inbox_dir, candidate.video_id)
        if existing_inbox is not None:
            raise AlreadyProcessed(f"{candidate.video_id} 已存在 inbox 记录：{existing_inbox}")

        claim = {
            "resource_id": candidate.resource_id,
            "video_id": candidate.video_id,
            "catalog_id": candidate.catalog_id,
            "source_url": candidate.source_url,
            "title": candidate.title,
            "topic": candidate.topic,
            "status": "generating",
            "generation_run_id": _run_id(now),
            "claimed_at": now,
        }
        ledger["entries"][candidate.resource_id] = claim
        write_ledger(ledger_path, ledger)
        return claim


def _artifact(value: object, field: str) -> dict:
    if not isinstance(value, dict):
        raise ProducerError(f"{field} 必须是对象")
    label = value.get("label") or value.get("status")
    _required_text(label, f"{field}.label/status")
    url = value.get("url")
    if not isinstance(url, str) or not url.startswith(("https://", "http://", "/")):
        raise ProducerError(f"{field}.url 必须是可引用链接")
    normalized = dict(value)
    normalized["url"] = url.strip()
    return normalized


def normalize_result(
    candidate: Candidate,
    raw_result: dict,
    generation_run_id: str,
    now: str,
) -> dict:
    """Normalize a completed external result without filling missing content."""
    if not isinstance(raw_result, dict):
        raise ProducerError("NotebookLM 结果必须是 JSON 对象")
    title = _required_text(raw_result.get("title"), "title")
    content_summary = _required_text(raw_result.get("content_summary"), "content_summary")
    boundary = _required_text(raw_result.get("boundary"), "boundary")
    topic = _strict_topic(raw_result.get("topic"), "topic")
    raw_source = raw_result.get("source")
    if not isinstance(raw_source, dict):
        raise ProducerError("source 必须是对象")
    source_url = _required_text(raw_source.get("url"), "source.url")
    if extract_video_id(source_url) != candidate.video_id:
        raise ProducerError("source.url 与已占用的候选 video_id 不一致")
    source_label = _required_text(raw_source.get("label") or "YouTube", "source.label")
    artifacts_raw = raw_result.get("artifacts")
    if not isinstance(artifacts_raw, dict):
        raise ProducerError("artifacts 必须是对象")
    artifacts = {
        key: _artifact(artifacts_raw.get(key), f"artifacts.{key}")
        for key in ("infographic", "mind_map", "slide_deck")
    }
    timestamp = _timestamp(now)
    normalized = dict(raw_result)
    normalized.update(
        {
            "resource_id": candidate.resource_id,
            "title": title,
            "topic": topic,
            "timestamp": timestamp,
            "generated_at": now,
            "producer_status": "ready",
            "generation_run_id": _required_text(generation_run_id, "generation_run_id"),
            "source": {"label": source_label, "url": candidate.source_url, "video_id": candidate.video_id},
            "artifacts": artifacts,
            "content_summary": content_summary,
            "boundary": boundary,
        }
    )
    fingerprint_payload = {
        "resource_id": normalized["resource_id"],
        "source": normalized["source"],
        "title": normalized["title"],
        "topic": normalized["topic"],
        "artifacts": normalized["artifacts"],
        "content_summary": normalized["content_summary"],
        "boundary": normalized["boundary"],
    }
    normalized["output_fingerprint"] = hashlib.sha256(
        json.dumps(fingerprint_payload, ensure_ascii=False, sort_keys=True).encode("utf-8")
    ).hexdigest()
    return normalized


def _same_fingerprint(path: Path, fingerprint: str) -> bool:
    try:
        value = json.loads(path.read_text(encoding="utf-8"))
    except (FileNotFoundError, json.JSONDecodeError) as exc:
        raise ProducerError(f"已有 inbox 记录不可读：{path}") from exc
    return isinstance(value, dict) and value.get("output_fingerprint") == fingerprint


def _resource_path(record: dict, inbox_dir: Path) -> Path:
    timestamp = _required_text(record.get("timestamp"), "timestamp")
    topic = _required_text(record.get("topic"), "topic")
    if not TIMESTAMP_RE.fullmatch(timestamp) or not SLUG_RE.fullmatch(topic):
        raise ProducerError("ready 资源的 timestamp/topic 不符合文件命名合同")
    return inbox_dir / f"{timestamp}-{topic}.json"


def publish_ready(
    candidate: Candidate,
    raw_result: dict,
    inbox_dir: Path,
    ledger_path: Path,
    generation_run_id: str,
    now: str,
) -> Path:
    """Write exactly one validated ready JSON and advance generating -> ready."""
    lock_path = ledger_path.with_suffix(ledger_path.suffix + ".lock")
    with producer_lock(lock_path):
        ledger = read_ledger(ledger_path)
        entry = ledger["entries"].get(candidate.resource_id)
        if not isinstance(entry, dict) or entry.get("status") not in {"generating", "ready"}:
            raise ProducerError(f"{candidate.resource_id} 没有可发布的 generating claim")
        try:
            normalized = normalize_result(candidate, raw_result, generation_run_id, now)
        except ProducerError as exc:
            entry.update(
                {
                    "status": "failed",
                    "failed_at": now,
                    "failure_reason": str(exc),
                }
            )
            ledger["entries"][candidate.resource_id] = entry
            write_ledger(ledger_path, ledger)
            raise
        target = _resource_path(normalized, inbox_dir)
        inbox_dir.mkdir(parents=True, exist_ok=True)

        matching_paths = []
        for path, record in _inbox_records(inbox_dir):
            if record.get("resource_id") == candidate.resource_id:
                matching_paths.append(path)
        if len(matching_paths) > 1:
            raise ProducerError(f"同一 resource_id 存在多个 inbox 文件：{candidate.resource_id}")
        existing_path = matching_paths[0] if matching_paths else (target if target.exists() else None)
        if existing_path is not None:
            if _same_fingerprint(existing_path, normalized["output_fingerprint"]):
                if entry.get("status") != "ready":
                    entry.update(
                        {
                            "status": "ready",
                            "ready_at": now,
                            "inbox_file": str(existing_path),
                            "output_fingerprint": normalized["output_fingerprint"],
                        }
                    )
                    ledger["entries"][candidate.resource_id] = entry
                    write_ledger(ledger_path, ledger)
                return existing_path
            raise ProducerError(f"{existing_path} 已存在不同内容，拒绝覆盖")

        _atomic_write_json(target, normalized)
        entry.update(
            {
                "status": "ready",
                "ready_at": now,
                "inbox_file": str(target),
                "output_fingerprint": normalized["output_fingerprint"],
            }
        )
        ledger["entries"][candidate.resource_id] = entry
        write_ledger(ledger_path, ledger)
        return target


def _candidate_state(candidate: Candidate, ledger: dict, inbox_dir: Path | None) -> tuple[str, str]:
    entry = ledger["entries"].get(candidate.resource_id)
    if isinstance(entry, dict) and entry.get("status") in INBOX_STATUSES | {"generating"}:
        return "already_seen", f"local ledger status={entry.get('status')}"
    existing_inbox = _existing_inbox_for_video(inbox_dir, candidate.video_id)
    if existing_inbox is not None:
        return "already_seen", f"inbox record={existing_inbox}"
    return "ready_to_claim", "没有发现本地 ledger 或 inbox 记录"


def preflight(catalog_path: Path, inbox_dir: Path | None, ledger_path: Path) -> dict:
    """Read-only selection probe; it never claims, writes, or calls a service."""
    candidates = load_candidates(catalog_path)
    ledger = read_ledger(ledger_path)
    for candidate in candidates:
        status, reason = _candidate_state(candidate, ledger, inbox_dir)
        if status == "ready_to_claim":
            return {"status": status, "reason": reason, "candidate": asdict(candidate)}
    return {
        "status": "no_candidate",
        "reason": "所有候选都已在本地 ledger 或 inbox 中留下状态",
        "candidate_count": len(candidates),
    }


def _state_path(cli_value: str | None) -> Path:
    if cli_value:
        return Path(cli_value)
    env_value = os.environ.get("LAG_NOTEBOOKLM_STATE_DIR")
    return Path(env_value) if env_value else DEFAULT_STATE_DIR


def _parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(description="Prepare one idempotent NotebookLM inbox resource")
    subparsers = parser.add_subparsers(dest="command", required=True)
    for command in ("preflight", "claim"):
        sub = subparsers.add_parser(command)
        sub.add_argument("--catalog", type=Path, required=True)
        sub.add_argument("--inbox", type=Path, required=True)
        sub.add_argument("--state-dir", type=Path)
    publish = subparsers.add_parser("publish")
    publish.add_argument("--catalog", type=Path, required=True)
    publish.add_argument("--inbox", type=Path, required=True)
    publish.add_argument("--state-dir", type=Path)
    publish.add_argument("--resource-id", required=True)
    publish.add_argument("--generation-run-id", required=True)
    publish.add_argument("--result-json", type=Path, required=True)
    return parser


def _command(args: argparse.Namespace) -> dict | str:
    state_dir = _state_path(str(args.state_dir) if args.state_dir else None)
    ledger_path = state_dir / "ledger.json"
    if args.command == "preflight":
        return preflight(args.catalog, args.inbox, ledger_path)

    candidates = load_candidates(args.catalog)
    if args.command == "claim":
        result = preflight(args.catalog, args.inbox, ledger_path)
        if result["status"] != "ready_to_claim":
            raise ProducerError(f"不能占用候选：{result['status']}：{result['reason']}")
        candidate = Candidate(**result["candidate"])
        return claim_candidate(candidate, ledger_path, _now(), inbox_dir=args.inbox)

    candidate = next((item for item in candidates if item.resource_id == args.resource_id), None)
    if candidate is None:
        raise ProducerError(f"找不到 resource_id：{args.resource_id}")
    try:
        raw_result = json.loads(args.result_json.read_text(encoding="utf-8"))
    except FileNotFoundError as exc:
        raise ProducerError(f"结果文件不存在：{args.result_json}") from exc
    except json.JSONDecodeError as exc:
        raise ProducerError(f"结果文件不是合法 JSON：{args.result_json}：{exc}") from exc
    path = publish_ready(
        candidate,
        raw_result,
        args.inbox,
        ledger_path,
        args.generation_run_id,
        _now(),
    )
    return str(path)


def main(argv: list[str] | None = None) -> int:
    try:
        result = _command(_parser().parse_args(argv))
    except ProducerError as exc:
        print(f"[ERROR] {exc}", file=sys.stderr)
        return 1
    print(json.dumps(result, ensure_ascii=False, indent=2, sort_keys=True) if isinstance(result, dict) else result)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
