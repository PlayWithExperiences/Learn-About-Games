#!/usr/bin/env python3
"""Fetch public YouTube channel metadata through local ADC.

The default output is outside the repository. This script deliberately keeps
the catalog immutable: its output is an input for later transcript and content
review, not an automatic catalog mutation.
"""

from __future__ import annotations

import argparse
import json
import os
import re
import subprocess
import sys
import tempfile
import urllib.error
import urllib.parse
import urllib.request
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Callable


REPO_ROOT = Path(__file__).resolve().parents[1]
DEFAULT_SOURCES = REPO_ROOT / "src/data/sources.json"
DEFAULT_OUTPUT = Path.home() / ".cache" / "lag-youtube" / "metadata.json"
API_BASE = "https://www.googleapis.com/youtube/v3"
YOUTUBE_HANDLE_PATTERN = re.compile(r"^/@([^/?#]+)$")
QUOTA_REASONS = {"quotaExceeded", "dailyLimitExceeded", "userRateLimitExceeded"}


class YouTubeApiError(RuntimeError):
    """A visible YouTube API response failure that is never treated as empty data."""

    def __init__(self, status: int, reason: str, detail: str = "") -> None:
        self.status = status
        self.reason = reason or "unknown"
        if status == 401:
            self.failure_class = "auth"
        elif status == 403 and self.reason in QUOTA_REASONS:
            self.failure_class = "quota"
        elif status == 429 or status >= 500:
            self.failure_class = "channel"
        elif 400 <= status < 500:
            self.failure_class = "request"
        else:
            self.failure_class = "response"
        self.is_retryable = self.failure_class == "channel"
        self.detail = detail
        super().__init__(f"YouTube API HTTP {status} ({self.reason})")


class YouTubeTransportError(RuntimeError):
    """The HTTP channel failed before a trustworthy API response was received."""


class YouTubeResponseError(RuntimeError):
    """The API returned a successful HTTP response with an invalid shape."""


class SourceResolutionError(RuntimeError):
    """A selected public Source could not be resolved to one channel."""


def utc_now() -> str:
    return datetime.now(timezone.utc).replace(microsecond=0).isoformat()


def extract_youtube_handle(homepage: str) -> str:
    parsed = urllib.parse.urlparse(homepage)
    hostname = (parsed.hostname or "").lower()
    if hostname == "www.youtube.com":
        hostname = "youtube.com"
    if hostname != "youtube.com":
        raise ValueError(f"不是 YouTube 频道主页：{homepage}")
    match = YOUTUBE_HANDLE_PATTERN.fullmatch(parsed.path.rstrip("/"))
    if not match:
        raise ValueError(f"YouTube 主页缺少 @handle：{homepage}")
    return f"@{match.group(1)}"


def _parse_api_error(raw: str) -> tuple[str, str]:
    try:
        payload = json.loads(raw)
    except json.JSONDecodeError:
        return "httpError", ""
    error = payload.get("error", {}) if isinstance(payload, dict) else {}
    if not isinstance(error, dict):
        return "httpError", ""
    details = error.get("errors", [])
    first = details[0] if isinstance(details, list) and details and isinstance(details[0], dict) else {}
    reason = first.get("reason") or error.get("status") or "httpError"
    message = error.get("message") if isinstance(error.get("message"), str) else ""
    return str(reason), message


def _decode_response(status: int, raw: bytes) -> dict[str, Any]:
    try:
        payload = json.loads(raw.decode("utf-8"))
    except (UnicodeDecodeError, json.JSONDecodeError) as exc:
        raise YouTubeResponseError(f"YouTube API 返回了不可解析的 JSON（HTTP {status}）") from exc
    if not isinstance(payload, dict):
        raise YouTubeResponseError(f"YouTube API 返回的顶层 JSON 不是对象（HTTP {status}）")
    return payload


def api_get(
    opener: Callable[..., Any],
    token: str,
    endpoint: str,
    params: dict[str, str],
    timeout: int = 30,
) -> dict[str, Any]:
    if not token.strip():
        raise RuntimeError("ADC access token 为空")
    query = urllib.parse.urlencode({key: value for key, value in params.items() if value is not None})
    request = urllib.request.Request(
        f"{API_BASE}/{endpoint}?{query}",
        headers={
            "Authorization": f"Bearer {token}",
            "Accept": "application/json",
            "User-Agent": "Learn-About-Games/youtube-metadata-sync",
        },
        method="GET",
    )
    try:
        with opener(request, timeout=timeout) as response:
            status = int(getattr(response, "status", 200) or 200)
            raw = response.read()
    except urllib.error.HTTPError as exc:
        raw = exc.read()
        reason, detail = _parse_api_error(raw.decode("utf-8", errors="replace"))
        raise YouTubeApiError(exc.code, reason, detail) from exc
    except (urllib.error.URLError, TimeoutError, OSError) as exc:
        raise YouTubeTransportError(f"YouTube API 通道失败：{type(exc).__name__}") from exc

    if not 200 <= status < 300:
        reason, detail = _parse_api_error(raw.decode("utf-8", errors="replace"))
        raise YouTubeApiError(status, reason, detail)
    return _decode_response(status, raw)


def list_playlist_items(
    opener: Callable[..., Any],
    token: str,
    playlist_id: str,
    page_size: int = 50,
    max_items: int | None = None,
) -> list[dict[str, Any]]:
    if not 1 <= page_size <= 50:
        raise ValueError("page_size 必须在 1 到 50 之间")
    if max_items is not None and max_items <= 0:
        raise ValueError("max_items 必须为正整数")

    items: list[dict[str, Any]] = []
    page_token: str | None = None
    seen_page_tokens: set[str] = set()
    while True:
        params = {
            "part": "contentDetails,snippet,status",
            "playlistId": playlist_id,
            "maxResults": str(page_size),
        }
        if page_token:
            params["pageToken"] = page_token
        payload = api_get(opener, token, "playlistItems", params)
        page_items = payload.get("items")
        if not isinstance(page_items, list) or any(not isinstance(item, dict) for item in page_items):
            raise YouTubeResponseError("playlistItems.list 返回的 items 不是对象数组")
        items.extend(page_items)
        if max_items is not None and len(items) >= max_items:
            return items[:max_items]
        next_page = payload.get("nextPageToken")
        if not next_page:
            return items
        if not isinstance(next_page, str) or next_page in seen_page_tokens:
            raise YouTubeResponseError("playlistItems.list 的分页 token 重复或格式错误")
        seen_page_tokens.add(next_page)
        page_token = next_page


def _list_channel(opener: Callable[..., Any], token: str, handle: str) -> dict[str, Any]:
    payload = api_get(
        opener,
        token,
        "channels",
        {"part": "id,snippet,contentDetails", "forHandle": handle},
    )
    items = payload.get("items")
    if not isinstance(items, list) or not items:
        raise SourceResolutionError(f"YouTube handle 未解析到频道：{handle}")
    if not isinstance(items[0], dict):
        raise YouTubeResponseError("channels.list 返回的频道对象格式错误")
    channel = items[0]
    content_details = channel.get("contentDetails")
    if not isinstance(content_details, dict):
        raise YouTubeResponseError(f"频道缺少 contentDetails：{handle}")
    related = content_details.get("relatedPlaylists")
    uploads = related.get("uploads") if isinstance(related, dict) else None
    if not isinstance(uploads, str) or not uploads:
        raise YouTubeResponseError(f"频道缺少 uploads playlist：{handle}")
    return channel


def _list_videos(
    opener: Callable[..., Any],
    token: str,
    video_ids: list[str],
) -> list[dict[str, Any]]:
    by_id: dict[str, dict[str, Any]] = {}
    for start in range(0, len(video_ids), 50):
        batch = video_ids[start : start + 50]
        payload = api_get(
            opener,
            token,
            "videos",
            {
                "part": "snippet,contentDetails,status",
                "id": ",".join(batch),
            },
        )
        items = payload.get("items")
        if not isinstance(items, list) or any(not isinstance(item, dict) for item in items):
            raise YouTubeResponseError("videos.list 返回的 items 不是对象数组")
        for item in items:
            video_id = item.get("id")
            if isinstance(video_id, str) and video_id:
                by_id[video_id] = item
    return [by_id[video_id] for video_id in video_ids if video_id in by_id]


def normalize_video(video: dict[str, Any], source_id: str) -> dict[str, Any]:
    video_id = video.get("id")
    snippet = video.get("snippet")
    content_details = video.get("contentDetails")
    status = video.get("status")
    if not isinstance(video_id, str) or not video_id:
        raise ValueError("video 缺少 id")
    if not isinstance(snippet, dict) or not isinstance(content_details, dict) or not isinstance(status, dict):
        raise ValueError(f"video {video_id} 缺少必要元数据")
    title = snippet.get("title")
    if not isinstance(title, str) or not title.strip():
        raise ValueError(f"video {video_id} 缺少标题")
    return {
        "sourceId": source_id,
        "videoId": video_id,
        "url": f"https://www.youtube.com/watch?v={video_id}",
        "channelId": snippet.get("channelId", ""),
        "channelTitle": snippet.get("channelTitle", ""),
        "title": title,
        "description": snippet.get("description", ""),
        "publishedAt": snippet.get("publishedAt", ""),
        "duration": content_details.get("duration", ""),
        "captionAvailability": content_details.get("caption", "unknown"),
        "privacyStatus": status.get("privacyStatus", "unknown"),
    }


def _video_ids_from_playlist(items: list[dict[str, Any]], limit: int) -> list[str]:
    ids: list[str] = []
    seen: set[str] = set()
    for item in items:
        content_details = item.get("contentDetails")
        snippet = item.get("snippet")
        video_id = content_details.get("videoId") if isinstance(content_details, dict) else None
        if not video_id and isinstance(snippet, dict):
            resource_id = snippet.get("resourceId")
            video_id = resource_id.get("videoId") if isinstance(resource_id, dict) else None
        if isinstance(video_id, str) and video_id and video_id not in seen:
            seen.add(video_id)
            ids.append(video_id)
        if len(ids) >= limit:
            break
    return ids


def fetch_source(
    opener: Callable[..., Any],
    token: str,
    source: dict[str, Any],
    limit: int,
    page_size: int,
) -> dict[str, Any]:
    source_id = source.get("id")
    homepage = source.get("homepage")
    if not isinstance(source_id, str) or not isinstance(homepage, str):
        raise SourceResolutionError("Source 缺少 id 或 homepage")
    handle = extract_youtube_handle(homepage)
    channel = _list_channel(opener, token, handle)
    channel_id = channel.get("id")
    channel_snippet = channel.get("snippet")
    channel_title = channel_snippet.get("title", "") if isinstance(channel_snippet, dict) else ""
    content_details = channel["contentDetails"]
    uploads_playlist_id = content_details["relatedPlaylists"]["uploads"]
    playlist_items = list_playlist_items(
        opener,
        token,
        uploads_playlist_id,
        page_size=min(page_size, limit),
        max_items=limit,
    )
    video_ids = _video_ids_from_playlist(playlist_items, limit)
    videos = _list_videos(opener, token, video_ids)
    by_id = {video.get("id"): video for video in videos}
    normalized = [
        normalize_video(by_id[video_id], source_id)
        for video_id in video_ids
        if video_id in by_id
    ]
    return {
        "sourceId": source_id,
        "handle": handle,
        "channelId": channel_id or "",
        "channelTitle": channel_title,
        "uploadsPlaylistId": uploads_playlist_id,
        "items": normalized,
    }


def load_adc_token() -> str:
    try:
        result = subprocess.run(
            ["gcloud", "auth", "application-default", "print-access-token"],
            capture_output=True,
            text=True,
            check=False,
        )
    except FileNotFoundError as exc:
        raise RuntimeError("找不到 gcloud，无法读取本机 ADC") from exc
    if result.returncode != 0:
        raise RuntimeError(f"gcloud ADC token 获取失败（退出码 {result.returncode}）")
    token = result.stdout.strip()
    if not token:
        raise RuntimeError("gcloud ADC 返回空 token")
    return token


def load_sources(path: Path) -> list[dict[str, Any]]:
    try:
        payload = json.loads(path.read_text(encoding="utf-8"))
    except FileNotFoundError as exc:
        raise RuntimeError(f"Source 文件不存在：{path}") from exc
    except json.JSONDecodeError as exc:
        raise RuntimeError(f"Source 文件不是合法 JSON：{path}") from exc
    if not isinstance(payload, list) or any(not isinstance(source, dict) for source in payload):
        raise RuntimeError("Source 文件必须是对象数组")
    return payload


def select_sources(
    sources: list[dict[str, Any]],
    requested_ids: list[str] | None,
) -> list[dict[str, Any]]:
    by_id = {source.get("id"): source for source in sources if isinstance(source.get("id"), str)}
    if requested_ids:
        missing = [source_id for source_id in requested_ids if source_id not in by_id]
        if missing:
            raise ValueError(f"未知 Source id：{', '.join(missing)}")
        selected = [by_id[source_id] for source_id in requested_ids]
        for source in selected:
            if source.get("kind") != "channel":
                raise ValueError(f"Source 不是 channel：{source.get('id', '')}")
            extract_youtube_handle(str(source.get("homepage", "")))
        return selected

    selected: list[dict[str, Any]] = []
    for source in sources:
        if source.get("kind") != "channel":
            continue
        try:
            extract_youtube_handle(str(source.get("homepage", "")))
        except ValueError:
            continue
        selected.append(source)
    return selected


def atomic_write_json(path: Path, payload: dict[str, Any]) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    temporary: Path | None = None
    try:
        with tempfile.NamedTemporaryFile(
            "w",
            encoding="utf-8",
            dir=path.parent,
            prefix=f".{path.name}.",
            suffix=".tmp",
            delete=False,
        ) as handle:
            temporary = Path(handle.name)
            handle.write(json.dumps(payload, ensure_ascii=False, indent=2) + "\n")
            handle.flush()
            os.fsync(handle.fileno())
        os.replace(temporary, path)
    finally:
        if temporary is not None and temporary.exists():
            temporary.unlink()


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--sources", type=Path, default=DEFAULT_SOURCES)
    parser.add_argument("--source-id", action="append", dest="source_ids")
    parser.add_argument("--limit", type=int, default=50)
    parser.add_argument("--page-size", type=int, default=50)
    parser.add_argument("--output", type=Path, default=DEFAULT_OUTPUT)
    parser.add_argument("--dry-run", action="store_true")
    return parser


def run(
    args: argparse.Namespace,
    opener: Callable[..., Any] = urllib.request.urlopen,
    token_loader: Callable[[], str] = load_adc_token,
) -> int:
    if args.limit <= 0:
        raise ValueError("--limit 必须为正整数")
    if not 1 <= args.page_size <= 50:
        raise ValueError("--page-size 必须在 1 到 50 之间")
    sources = select_sources(load_sources(args.sources), args.source_ids)
    if not sources:
        raise ValueError("没有可同步的 YouTube channel Source")

    token = token_loader()
    records: list[dict[str, Any]] = []
    failures: list[dict[str, str]] = []
    for source in sources:
        source_id = str(source.get("id", ""))
        try:
            records.append(fetch_source(opener, token, source, args.limit, args.page_size))
        except SourceResolutionError as exc:
            failures.append({"sourceId": source_id, "failureClass": "source", "message": str(exc)})

    if not records:
        raise RuntimeError("所有选定 Source 均未成功解析")
    output = {
        "schemaVersion": 1,
        "generatedAt": utc_now(),
        "api": "youtube-data-v3",
        "sources": records + [
            {"sourceId": failure["sourceId"], "failure": {
                "class": failure["failureClass"], "message": failure["message"]
            }}
            for failure in failures
        ],
    }
    if not args.dry_run:
        atomic_write_json(args.output, output)
    summary = {
        "sourcesSelected": len(sources),
        "sourcesFetched": len(records),
        "videoCount": sum(len(record["items"]) for record in records),
        "sourceFailures": len(failures),
        "dryRun": args.dry_run,
    }
    if not args.dry_run:
        summary["output"] = str(args.output)
    print(json.dumps(summary, ensure_ascii=False, indent=2))
    return 0


def main() -> int:
    args = build_parser().parse_args()
    try:
        return run(args)
    except (RuntimeError, ValueError) as exc:
        print(f"FATAL: {exc}", file=sys.stderr)
        return 2


if __name__ == "__main__":
    raise SystemExit(main())
