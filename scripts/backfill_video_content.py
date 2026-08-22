#!/usr/bin/env python3
"""Backfill imported YouTube Work Items from English transcripts.

All transcript text, state, logs, and reports default to paths outside the
repository. Only validated derived fields are written to resources.json.
"""

from __future__ import annotations

import argparse
import base64
import copy
import html
import json
import os
import re
import shutil
import signal
import subprocess
import sys
import tempfile
import urllib.error
import urllib.parse
import urllib.request
from contextlib import contextmanager
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Callable


REPO_ROOT = Path(__file__).resolve().parents[1]
DEFAULT_RESOURCES = REPO_ROOT / "src/data/resources.json"
DEFAULT_TOPICS = REPO_ROOT / "src/data/resource-topics.json"
DEFAULT_CAPABILITIES = REPO_ROOT / "src/data/capabilities.json"
DEFAULT_SOURCES = REPO_ROOT / "src/data/sources.json"
DEFAULT_CACHE = Path.home() / ".cache" / "lag-transcripts"
DEFAULT_AUDIO_CACHE = Path.home() / ".cache" / "lag-audio"
DEFAULT_METADATA = Path.home() / ".cache" / "lag-youtube" / "metadata.json"
DEFAULT_STATE = Path.home() / ".cache" / "lag-video-content" / "state.json"
DEFAULT_REPORT = Path.home() / ".cache" / "lag-video-content" / "report.json"
DEFAULT_LOG = Path.home() / ".cache" / "lag-video-content" / "failures.log"
DEFAULT_YTDLP = Path.home() / ".cache" / "lag-video-content" / "venv" / "bin" / "yt-dlp"
DEFAULT_GCLOUD = Path("/opt/homebrew/bin/gcloud")
DEFAULT_KEY_FILE = Path("/Users/haodong/Documents/GitHub/AI-Life-Mentor/.claude/openrouter-key")
OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions"
VERTEX_API_URL = "https://aiplatform.googleapis.com/v1/projects/{project}/locations/global/publishers/google/models/{model}:generateContent"
DEFAULT_VERTEX_MODEL = "gemini-2.5-flash"
DEFAULT_MAX_INLINE_AUDIO_BYTES = 60 * 1024 * 1024
TARGET_SOURCE_IDS = {
    "gdc-festival-of-gaming",
    "masahiro-sakurai-on-creating-games-en",
    "game-makers-toolkit",
}
# v4-pro is available but exceeded the per-request wait in the sample. The
# cheaper chat model is the primary batch worker; v4-flash remains a fallback.
DEFAULT_MODELS = [
    "deepseek/deepseek-chat-v3-0324",
    "deepseek/deepseek-v4-flash",
    "deepseek/deepseek-v3.2",
    "deepseek/deepseek-v4-pro",
]
NO_TRANSCRIPT_NAMES = {"TranscriptsDisabled", "NoTranscriptFound"}
CHANNEL_PATTERNS = re.compile(
    r"(?:\b429\b|\b5(?:00|02|03|04)\b|too many requests|rate.?limit|ip.?blocked|"
    r"request.?blocked|connection|timed? out|timeout|network|remote disconnected|"
    r"incomplete.?read|broken pipe|connection reset|"
    r"empty response|temporarily unavailable)",
    re.IGNORECASE,
)


class ModelOutputError(RuntimeError):
    """The model responded, but its result was empty or invalid."""

    def __init__(self, message: str, invalid_payloads: list[dict[str, Any]] | None = None):
        super().__init__(message)
        self.invalid_payloads = invalid_payloads or []


class VertexOutputError(ModelOutputError):
    """Vertex returned a response, but it was not usable catalog JSON."""


class AudioChannelError(RuntimeError):
    """The audio download route failed before content analysis."""


class AudioInputLimitError(RuntimeError):
    """The downloaded audio needs a larger-file upload route than inline data."""


class DescriptionInsufficientError(RuntimeError):
    """The official description is too short or contains only links."""


class VertexChannelError(RuntimeError):
    """ADC or the Vertex generateContent request failed."""


class TranscriptChannelError(RuntimeError):
    """The transcript channel failed and the item must remain retryable."""


class TranscriptRetryableError(RuntimeError):
    """An unclassified transcript failure that must not become a terminal skip."""


class TranscriptInsufficientError(RuntimeError):
    """The transcript exists but is too short or mostly audio markers to analyze."""


class NoTranscriptFound(RuntimeError):
    """The selected transcript source returned no usable caption track."""


class ModelChannelError(RuntimeError):
    """Every configured model failed through a channel error."""


@contextmanager
def alarm_timeout(seconds: int):
    """Bound the transcript library's requests, which has no timeout argument."""
    if seconds <= 0 or not hasattr(signal, "SIGALRM"):
        yield
        return

    def raise_timeout(_signum: int, _frame: Any) -> None:
        raise TimeoutError(f"字幕请求超过 {seconds} 秒")

    previous_handler = signal.signal(signal.SIGALRM, raise_timeout)
    signal.alarm(seconds)
    try:
        yield
    finally:
        signal.alarm(0)
        signal.signal(signal.SIGALRM, previous_handler)


def now_iso() -> str:
    return datetime.now(timezone.utc).replace(microsecond=0).isoformat()


def atomic_write_text(path: Path, text: str) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    with tempfile.NamedTemporaryFile("w", encoding="utf-8", dir=path.parent, delete=False) as handle:
        temporary = Path(handle.name)
        handle.write(text)
        handle.flush()
        os.fsync(handle.fileno())
    os.replace(temporary, path)


def atomic_write_json(path: Path, value: Any) -> None:
    atomic_write_text(path, json.dumps(value, ensure_ascii=False, indent=2) + "\n")


def load_json(path: Path, label: str) -> Any:
    if not path.exists():
        raise FileNotFoundError(f"{label} 不存在：{path}")
    try:
        return json.loads(path.read_text(encoding="utf-8"))
    except json.JSONDecodeError as exc:
        raise ValueError(f"{label} 不是合法 JSON：{path}: {exc}") from exc


def classify_transcript_exception(exc: BaseException) -> str:
    """Return no_transcript, channel_error, or retryable without hiding failures."""
    if exc.__class__.__name__ in NO_TRANSCRIPT_NAMES:
        return "no_transcript"
    status = getattr(exc, "status_code", None) or getattr(exc, "status", None)
    detail = str(exc)
    if status == 429 or CHANNEL_PATTERNS.search(detail):
        return "channel_error"
    return "retryable"


def extract_video_id(url: str) -> str:
    parsed = urllib.parse.urlparse(url)
    query = urllib.parse.parse_qs(parsed.query)
    video_id = query.get("v", [""])[0]
    if not video_id and parsed.netloc in {"youtu.be", "www.youtu.be"}:
        video_id = parsed.path.strip("/").split("/")[0]
    if not video_id:
        raise ValueError(f"无法从 canonicalUrl 解析 YouTube video id：{url}")
    return video_id


def parse_vtt(text: str) -> str:
    """Extract readable cue text and drop exact repeated auto-caption cues."""
    cues: list[str] = []
    previous = ""
    for raw_line in text.splitlines():
        line = raw_line.strip()
        if not line or line == "WEBVTT" or "-->" in line or re.fullmatch(r"\d+", line):
            continue
        if line.startswith(("NOTE", "STYLE", "REGION")):
            continue
        line = re.sub(r"<[^>]+>", "", line)
        line = re.sub(r"\s+", " ", html.unescape(line)).strip()
        if not line or line == previous:
            continue
        cues.append(line)
        previous = line
    return " ".join(cues)


def validate_transcript_text(text: str) -> str:
    normalized = " ".join(text.split())
    without_markers = re.sub(r"\[[^\]]+\]", "", normalized)
    if len(normalized) < 80 or len(without_markers.strip()) < 80:
        raise TranscriptInsufficientError("字幕正文过短或只有音频标记")
    return normalized


def resolve_ytdlp_binary() -> str | None:
    configured = os.environ.get("YTDLP_BIN", "").strip()
    if configured:
        if not Path(configured).is_file() or not os.access(configured, os.X_OK):
            raise TranscriptChannelError(f"YTDLP_BIN 不可执行：{configured}")
        return configured
    discovered = shutil.which("yt-dlp")
    if discovered:
        return discovered
    if DEFAULT_YTDLP.is_file() and os.access(DEFAULT_YTDLP, os.X_OK):
        return str(DEFAULT_YTDLP)
    return None


def fetch_transcript_via_ytdlp(video_id: str, binary: str, timeout: int = 45) -> str:
    """Fetch English manual/auto captions through yt-dlp into an external temp dir."""
    with tempfile.TemporaryDirectory(prefix="lag-ytdlp-") as directory:
        output_template = str(Path(directory) / "%(id)s")
        command = [
            binary,
            "--no-playlist",
            "--skip-download",
            "--write-subs",
            "--write-auto-subs",
            "--sub-langs",
            "en",
            "--sub-format",
            "vtt",
            "--socket-timeout",
            str(timeout),
            "--retries",
            "1",
            "--fragment-retries",
            "1",
            "--no-warnings",
            "--output",
            output_template,
            f"https://www.youtube.com/watch?v={video_id}",
        ]
        try:
            result = subprocess.run(
                command,
                capture_output=True,
                text=True,
                timeout=timeout + 15,
                check=False,
            )
        except (FileNotFoundError, OSError) as exc:
            raise TranscriptChannelError(f"yt-dlp 通道启动失败：{type(exc).__name__}") from exc
        except subprocess.TimeoutExpired as exc:
            raise TranscriptChannelError(f"yt-dlp 字幕请求超过 {timeout + 15} 秒") from exc

        paths = sorted(Path(directory).glob(f"{video_id}*.vtt"))
        if not paths:
            detail = (result.stderr or result.stdout or "").strip().splitlines()[-1:] or ["未生成 VTT"]
            message = detail[0][:240]
            if result.returncode == 0 or re.search(r"no subtitles|subtitles are not available|requested format is not available", message, re.IGNORECASE):
                raise NoTranscriptFound(f"yt-dlp 未取得字幕：{message}")
            raise TranscriptChannelError(f"yt-dlp 字幕通道失败：退出码 {result.returncode}：{message}")
        transcript = parse_vtt(paths[0].read_text(encoding="utf-8"))
        if not transcript:
            raise NoTranscriptFound("yt-dlp 返回空字幕")
        return validate_transcript_text(transcript)


def fetch_transcript_with_fallback(video_id: str, timeout: int = 45) -> str:
    """Prefer yt-dlp captions, then retain the transcript API as a visible fallback."""
    binary = resolve_ytdlp_binary()
    if not binary:
        return fetch_transcript(video_id, timeout=timeout)
    try:
        return fetch_transcript_via_ytdlp(video_id, binary, timeout=timeout)
    except (TranscriptChannelError, TranscriptRetryableError, TranscriptInsufficientError, NoTranscriptFound) as ytdlp_error:
        try:
            return fetch_transcript(video_id, timeout=timeout)
        except Exception as transcript_error:
            if classify_transcript_exception(transcript_error) == "no_transcript":
                raise transcript_error
            if isinstance(ytdlp_error, TranscriptInsufficientError) and isinstance(
                transcript_error, TranscriptInsufficientError
            ):
                raise TranscriptInsufficientError(
                    "字幕双通道均返回不可分析的正文；可转入音频路线"
                ) from transcript_error
            if isinstance(ytdlp_error, NoTranscriptFound) and classify_transcript_exception(transcript_error) == "channel_error":
                # yt-dlp already established that no caption track was available. The
                # secondary transcript API may be blocked independently; preserve that
                # detail while allowing the caller to try the audio route.
                raise NoTranscriptFound(
                    "yt-dlp 未取得字幕；备用字幕 API 通道失败，可转入音频路线"
                ) from transcript_error
            raise TranscriptChannelError(
                f"字幕双通道失败：yt-dlp={type(ytdlp_error).__name__}; transcript-api={type(transcript_error).__name__}"
            ) from transcript_error


def fetch_transcript(video_id: str, api_factory: Callable[[], Any] | None = None, timeout: int = 45) -> str:
    if api_factory is None:
        try:
            from youtube_transcript_api import YouTubeTranscriptApi
        except ImportError as exc:
            raise TranscriptChannelError(
                "缺少 youtube-transcript-api；请在仓库外的虚拟环境中安装"
            ) from exc
        api_factory = YouTubeTranscriptApi
    try:
        with alarm_timeout(timeout):
            fetched = api_factory().fetch(video_id, languages=["en"])
            text = " ".join(segment.text for segment in fetched).strip()
    except Exception as exc:  # classification below deliberately preserves the distinction
        kind = classify_transcript_exception(exc)
        if kind == "no_transcript":
            raise
        if kind == "channel_error":
            raise TranscriptChannelError(f"字幕通道失败：{type(exc).__name__}: {exc}") from exc
        raise TranscriptRetryableError(f"字幕请求可重试失败：{type(exc).__name__}: {exc}") from exc
    if not text:
        raise NoTranscriptFound("字幕返回为空")
    return validate_transcript_text(text)


def fetch_audio_via_ytdlp(
    video_id: str,
    binary: str,
    cache_dir: Path,
    timeout: int = 120,
    max_bytes: int = DEFAULT_MAX_INLINE_AUDIO_BYTES,
) -> Path:
    """Download a compressed audio copy into the external cache, never the repo."""
    if "/" in video_id or "\\" in video_id:
        raise AudioChannelError("video id 含有非法路径字符")
    cache_dir.mkdir(parents=True, exist_ok=True)
    cached = cache_dir / f"{video_id}.mp3"
    if cached.exists():
        size = cached.stat().st_size
        if size <= 0:
            raise AudioChannelError(f"音频缓存为空：{cached}")
        if size > max_bytes:
            raise AudioInputLimitError(f"音频缓存超过 inline 上限：{size} bytes")
        return cached

    with tempfile.TemporaryDirectory(prefix="lag-audio-ytdlp-") as directory:
        output_template = str(Path(directory) / "%(id)s.%(ext)s")
        command = [
            binary,
            "--no-playlist",
            "--extract-audio",
            "--audio-format",
            "mp3",
            "--audio-quality",
            "64K",
            "--socket-timeout",
            str(timeout),
            "--retries",
            "1",
            "--fragment-retries",
            "1",
            "--no-warnings",
            "--output",
            output_template,
            f"https://www.youtube.com/watch?v={video_id}",
        ]
        try:
            result = subprocess.run(
                command,
                capture_output=True,
                text=True,
                timeout=timeout + 30,
                check=False,
            )
        except (FileNotFoundError, OSError) as exc:
            raise AudioChannelError(f"音频 yt-dlp 通道启动失败：{type(exc).__name__}") from exc
        except subprocess.TimeoutExpired as exc:
            raise AudioChannelError(f"音频下载超过 {timeout + 30} 秒") from exc

        paths = sorted(Path(directory).glob(f"{video_id}*.mp3"))
        if not paths:
            detail = (result.stderr or result.stdout or "未生成 MP3").strip().splitlines()[-1]
            raise AudioChannelError(f"音频 yt-dlp 通道失败：退出码 {result.returncode}：{detail[:240]}")
        source = paths[0]
        size = source.stat().st_size
        if size <= 0:
            raise AudioChannelError("yt-dlp 生成了空音频")
        if size > max_bytes:
            raise AudioInputLimitError(f"音频超过 inline 上限：{size} bytes")
        shutil.move(str(source), str(cached))
    return cached


def validate_description_text(text: str, minimum_chars: int = 240) -> str:
    """Keep only substantive official description text for model evidence."""
    normalized = " ".join(text.split())
    without_urls = re.sub(r"https?://\S+|www\.\S+", " ", normalized)
    without_urls = " ".join(without_urls.split())
    if len(without_urls) < minimum_chars:
        raise DescriptionInsufficientError(
            f"官方描述去除 URL 后只有 {len(without_urls)} 个字符，少于 {minimum_chars}"
        )
    return without_urls


def load_youtube_metadata(path: Path) -> dict[str, dict[str, Any]]:
    """Index the external official metadata cache by immutable YouTube video id."""
    data = load_json(path, "YouTube 元数据缓存")
    sources = data.get("sources") if isinstance(data, dict) else None
    if not isinstance(sources, list):
        raise ValueError(f"YouTube 元数据缓存缺少 sources 数组：{path}")
    indexed: dict[str, dict[str, Any]] = {}
    for source in sources:
        if not isinstance(source, dict) or not isinstance(source.get("items"), list):
            raise ValueError(f"YouTube 元数据缓存的 source 结构不正确：{path}")
        for item in source["items"]:
            if not isinstance(item, dict) or not isinstance(item.get("videoId"), str):
                raise ValueError(f"YouTube 元数据缓存含无效视频记录：{path}")
            video_id = item["videoId"]
            if video_id in indexed:
                raise ValueError(f"YouTube 元数据缓存含重复 videoId：{video_id}")
            indexed[video_id] = item
    return indexed


def get_cached_description(metadata: dict[str, dict[str, Any]], video_id: str) -> str | None:
    record = metadata.get(video_id)
    if not record:
        return None
    raw = record.get("description")
    if not isinstance(raw, str):
        return None
    try:
        return validate_description_text(raw)
    except DescriptionInsufficientError:
        return None


def parse_json_object(text: str) -> dict[str, Any]:
    candidate = text.strip()
    if candidate.startswith("```"):
        candidate = re.sub(r"^```(?:json)?\s*|\s*```$", "", candidate, flags=re.IGNORECASE | re.DOTALL).strip()
    try:
        value = json.loads(candidate)
    except json.JSONDecodeError as exc:
        raise ModelOutputError(f"模型输出不是合法 JSON：{exc}") from exc
    if not isinstance(value, dict):
        raise ModelOutputError("模型 JSON 顶层不是对象")
    return value


def parse_vertex_response(response: dict[str, Any]) -> str:
    """Extract candidate text without treating an empty Vertex response as success."""
    if not isinstance(response, dict):
        raise VertexOutputError("Vertex 响应不是对象")
    candidates = response.get("candidates")
    if not isinstance(candidates, list) or not candidates:
        raise VertexOutputError("Vertex 响应没有 candidates")
    parts = candidates[0].get("content", {}).get("parts", [])
    if not isinstance(parts, list):
        raise VertexOutputError("Vertex candidate 没有 parts")
    text = "".join(part.get("text", "") for part in parts if isinstance(part, dict)).strip()
    if not text:
        finish_reason = candidates[0].get("finishReason")
        raise VertexOutputError(f"Vertex candidate 没有文本，finishReason={finish_reason!r}")
    return text


def parse_model_payload(
    payload: str | dict[str, Any], allowed_topics: set[str], allowed_capabilities: set[str]
) -> dict[str, Any]:
    data = parse_json_object(payload) if isinstance(payload, str) else payload
    if not isinstance(data, dict):
        raise ModelOutputError("模型结果必须是对象")
    summary = data.get("summary")
    if not isinstance(summary, dict) or not isinstance(summary.get("zh-CN"), str):
        raise ModelOutputError("缺少 summary.zh-CN")
    summary_text = summary["zh-CN"].strip()
    if not 150 <= len(summary_text) <= 250:
        raise ModelOutputError(f"summary.zh-CN 长度为 {len(summary_text)}，要求 150-250")

    def ids(name: str, allowed: set[str]) -> list[str]:
        values = data.get(name, [])
        if not isinstance(values, list) or any(not isinstance(value, str) for value in values):
            raise ModelOutputError(f"{name} 必须是字符串数组")
        if len(set(values)) != len(values):
            raise ModelOutputError(f"{name} 含重复 ID")
        unknown = sorted(set(values) - allowed)
        if unknown:
            raise ModelOutputError(f"{name} 含未知 ID：{unknown}")
        return values

    result: dict[str, Any] = {
        "summary": {"zh-CN": summary_text},
        "resourceTopicIds": ids("resourceTopicIds", allowed_topics),
        "capabilityIds": ids("capabilityIds", allowed_capabilities),
    }
    why = data.get("whyRelevant")
    if why is not None:
        if not isinstance(why, dict) or not isinstance(why.get("zh-CN"), str):
            raise ModelOutputError("whyRelevant 必须是含 zh-CN 的对象")
        why_text = why["zh-CN"].strip()
        if why_text and why_text != summary_text:
            result["whyRelevant"] = {"zh-CN": why_text}
    return result


def apply_model_result(item: dict[str, Any], result: dict[str, Any]) -> dict[str, Any]:
    updated = copy.deepcopy(item)
    updated["summary"] = result["summary"]
    updated["capabilityIds"] = list(result["capabilityIds"])
    # 目录合同要求「每个 Work Item 恰属一个主要资源主题」
    # （src/lib/catalog/validate.ts 的 RESOURCE_PRIMARY_TOPIC_MULTIPLE）。
    # 2026-08-21 踩过：施工图误写成「可多个」，导致 36 条违规、构建期校验直接挂。
    # 模型通常把最贴切的排在首位，故取第一个。
    topics = list(result["resourceTopicIds"])[:1]
    if not topics:
        old_topics = list(item.get("resourceTopicIds") or [])
        topics = old_topics[:1] or ["design-fundamentals"]
    updated["resourceTopicIds"] = topics
    updated.pop("whyRelevant", None)
    if result.get("whyRelevant"):
        updated["whyRelevant"] = result["whyRelevant"]
    return updated


def load_api_key(key_file: Path) -> str:
    key = os.environ.get("OPENROUTER_API_KEY", "").strip()
    if key:
        return key
    if key_file.exists():
        key = key_file.read_text(encoding="utf-8").strip()
    if not key:
        raise RuntimeError("没有 OPENROUTER_API_KEY 或可读的外部 key 文件")
    return key


def resolve_gcloud_binary() -> str | None:
    configured = os.environ.get("GCLOUD_BIN", "").strip()
    if configured:
        if not Path(configured).is_file() or not os.access(configured, os.X_OK):
            raise VertexChannelError(f"GCLOUD_BIN 不可执行：{configured}")
        return configured
    discovered = shutil.which("gcloud")
    if discovered:
        return discovered
    for candidate in (DEFAULT_GCLOUD, Path("/usr/local/bin/gcloud")):
        if candidate.is_file() and os.access(candidate, os.X_OK):
            return str(candidate)
    return None


def load_vertex_credentials() -> tuple[str, str]:
    """Read project and ADC token through gcloud without exposing the token."""
    binary = resolve_gcloud_binary()
    if not binary:
        raise VertexChannelError("找不到 gcloud，无法读取 ADC")

    project = os.environ.get("GOOGLE_CLOUD_PROJECT", "").strip()
    if not project:
        project_result = subprocess.run(
            [binary, "config", "get-value", "project"],
            capture_output=True,
            text=True,
            timeout=30,
            check=False,
        )
        project = project_result.stdout.strip()
    if not project or project == "(unset)":
        raise VertexChannelError("没有 GOOGLE_CLOUD_PROJECT 或 gcloud 当前项目")

    token_result = subprocess.run(
        [binary, "auth", "application-default", "print-access-token"],
        capture_output=True,
        text=True,
        timeout=30,
        check=False,
    )
    token = token_result.stdout.strip()
    if token_result.returncode != 0 or not token:
        raise VertexChannelError("无法从 ADC 获取 Vertex access token")
    return project, token


def call_vertex_audio(
    audio_path: Path,
    prompt: str,
    project: str,
    token: str,
    model: str = DEFAULT_VERTEX_MODEL,
    max_tokens: int = 4000,
    timeout: int = 120,
    max_audio_bytes: int = DEFAULT_MAX_INLINE_AUDIO_BYTES,
    opener: Callable[..., Any] = urllib.request.urlopen,
    validator: Callable[[dict[str, Any]], dict[str, Any]] | None = None,
) -> dict[str, Any]:
    """Send one external audio file to Vertex and validate its catalog result."""
    if not audio_path.exists() or not audio_path.is_file():
        raise AudioChannelError(f"音频文件不存在：{audio_path}")
    size = audio_path.stat().st_size
    if size <= 0:
        raise AudioChannelError(f"音频文件为空：{audio_path}")
    if size > max_audio_bytes:
        raise AudioInputLimitError(f"音频超过 inline 上限：{size} bytes")
    encoded = base64.b64encode(audio_path.read_bytes()).decode("ascii")
    body = json.dumps(
        {
            "contents": [
                {
                    "role": "user",
                    "parts": [
                        {"inlineData": {"mimeType": "audio/mpeg", "data": encoded}},
                        {"text": prompt},
                    ],
                }
            ],
            "generationConfig": {
                "temperature": 0,
                "maxOutputTokens": max_tokens,
                "responseMimeType": "application/json",
                "thinkingConfig": {"thinkingBudget": 0},
            },
        }
    ).encode("utf-8")
    request = urllib.request.Request(
        VERTEX_API_URL.format(project=urllib.parse.quote(project, safe=""), model=urllib.parse.quote(model, safe="")),
        data=body,
        headers={"Authorization": f"Bearer {token}", "Content-Type": "application/json"},
        method="POST",
    )
    try:
        with opener(request, timeout=timeout) as response:
            status = getattr(response, "status", 200)
            raw = response.read().decode("utf-8")
    except urllib.error.HTTPError as exc:
        raise VertexChannelError(f"Vertex HTTP {exc.code}") from exc
    except (urllib.error.URLError, TimeoutError, OSError) as exc:
        raise VertexChannelError(f"Vertex 请求失败：{type(exc).__name__}") from exc
    if status != 200:
        raise VertexChannelError(f"Vertex HTTP {status}")
    try:
        response_json = json.loads(raw)
        text = parse_vertex_response(response_json)
        payload = parse_json_object(text)
        if validator is not None:
            payload = validator(payload)
    except (json.JSONDecodeError, ModelOutputError, KeyError, TypeError) as exc:
        if isinstance(exc, VertexOutputError):
            raise
        raise VertexOutputError(f"Vertex 输出不可解析：{exc}") from exc
    return {"model": f"vertex/{model}", "payload": payload}


def call_openrouter(
    prompt: str,
    api_key: str,
    models: list[str],
    max_tokens: int = 4000,
    timeout: int = 60,
    opener: Callable[..., Any] = urllib.request.urlopen,
    validator: Callable[[dict[str, Any]], dict[str, Any]] | None = None,
) -> dict[str, Any]:
    output_errors: list[str] = []
    channel_errors: list[str] = []
    invalid_payloads: list[dict[str, Any]] = []
    for model in models:
        body = json.dumps(
            {
                "model": model,
                "temperature": 0.1,
                "max_tokens": max_tokens,
                "messages": [{"role": "user", "content": prompt}],
            }
        ).encode("utf-8")
        request = urllib.request.Request(
            OPENROUTER_URL,
            data=body,
            headers={
                "Authorization": f"Bearer {api_key}",
                "Content-Type": "application/json",
                "HTTP-Referer": "https://github.com/PlayWithExperiences/Learn-About-Games",
                "X-Title": "Learn About Games content backfill",
            },
            method="POST",
        )
        try:
            with opener(request, timeout=timeout) as response:
                status = getattr(response, "status", 200)
                raw = response.read().decode("utf-8")
        except urllib.error.HTTPError as exc:
            status = exc.code
            raw = ""
            if status == 429 or status >= 500:
                channel_errors.append(f"{model}: HTTP {status}")
            else:
                output_errors.append(f"{model}: HTTP {status}")
            continue
        except (urllib.error.URLError, TimeoutError, OSError) as exc:
            channel_errors.append(f"{model}: {type(exc).__name__}")
            continue
        if status == 429 or status >= 500:
            channel_errors.append(f"{model}: HTTP {status}")
            continue
        if status != 200:
            output_errors.append(f"{model}: HTTP {status}")
            continue
        try:
            response_json = json.loads(raw)
            choice = (response_json.get("choices") or [{}])[0]
            content = (choice.get("message") or {}).get("content")
            if not isinstance(content, str) or not content.strip():
                raise ModelOutputError(f"content 为空，finish_reason={choice.get('finish_reason')!r}")
            payload = parse_json_object(content)
            if validator is not None:
                try:
                    payload = validator(payload)
                except ModelOutputError as exc:
                    invalid_payloads.append(parse_json_object(content))
                    raise exc
            return {"model": model, "payload": payload}
        except (json.JSONDecodeError, KeyError, IndexError, TypeError, ModelOutputError) as exc:
            output_errors.append(f"{model}: {exc}")
    if channel_errors and not output_errors:
        raise ModelChannelError("所有模型调用均为通道失败：" + "; ".join(channel_errors))
    raise ModelOutputError(
        "所有模型均未产生可解析结果：" + "; ".join(output_errors + channel_errors),
        invalid_payloads=invalid_payloads,
    )


def build_text_prompt(
    item: dict[str, Any],
    source_name: str,
    evidence_text: str,
    evidence_label: str,
    topics: list[dict[str, Any]],
    capabilities: list[dict[str, Any]],
) -> str:
    topic_catalog = [
        {"id": topic["id"], "name": topic.get("title", {}).get("zh-CN", ""), "summary": topic.get("summary", {}).get("zh-CN", "")}
        for topic in topics
    ]
    capability_catalog = [
        {"id": capability["id"], "name": capability.get("name", {}).get("zh-CN", ""), "summary": capability.get("summary", {}).get("zh-CN", "")}
        for capability in capabilities
    ]
    return f"""你是一个严格的游戏设计资料编目助手。请只依据下方英文 YouTube {evidence_label}，生成该视频在 Learn About Games 目录中的派生字段。

标题：{item['title'].get('en') or item['title'].get('zh-CN')}
来源：{source_name}

{evidence_label}（完整内容，不要依据标题猜测）：
---
{evidence_text}
---

可选资源主题（只能使用这些 id）：
{json.dumps(topic_catalog, ensure_ascii=False)}

可选能力（只能使用这些 id；只有证据文本明确支持时才选，宁可为空）：
{json.dumps(capability_catalog, ensure_ascii=False)}

要求：
1. summary.zh-CN 必须是 180-205 个中文字符（以字符数计，写完后自行数一遍）。只写四句，每句约 45-50 个汉字，分别覆盖核心论点、具体例子/方法、设计含义和证据文本中的限制或结论；不要复述标题，不要写“这是一个关于……的视频”，不要补写证据文本没有的事实。少于 180 个字符的结果视为失败。
2. resourceTopicIds **只选最贴切的那一个**主题（数组里恰好一个元素）。目录规定每条资料只属一个主题。若没有足够依据，返回空数组；脚本会保留原有保守主题。
3. capabilityIds 只选择证据文本明确支持的能力，没有明确支持就返回空数组，不要凑数。
4. 只有证据文本支持一句有价值的相关性判断时才填 whyRelevant.zh-CN；写不出就省略。它不能与 summary.zh-CN 相同。
5. 只输出 JSON，不要 Markdown：{{"summary":{{"zh-CN":"..."}},"resourceTopicIds":[],"capabilityIds":[],"whyRelevant":{{"zh-CN":"..."}}}}
"""


def build_prompt(
    item: dict[str, Any], source_name: str, transcript: str, topics: list[dict[str, Any]], capabilities: list[dict[str, Any]]
) -> str:
    return build_text_prompt(item, source_name, transcript, "字幕正文", topics, capabilities)


def build_description_prompt(
    item: dict[str, Any],
    source_name: str,
    description: str,
    topics: list[dict[str, Any]],
    capabilities: list[dict[str, Any]],
) -> str:
    return build_text_prompt(item, source_name, description, "官方描述", topics, capabilities)


def build_audio_prompt(
    item: dict[str, Any], source_name: str, topics: list[dict[str, Any]], capabilities: list[dict[str, Any]]
) -> str:
    """Build the same catalog contract for a Vertex audio input."""
    topic_catalog = [
        {"id": topic["id"], "name": topic.get("title", {}).get("zh-CN", ""), "summary": topic.get("summary", {}).get("zh-CN", "")}
        for topic in topics
    ]
    capability_catalog = [
        {"id": capability["id"], "name": capability.get("name", {}).get("zh-CN", ""), "summary": capability.get("summary", {}).get("zh-CN", "")}
        for capability in capabilities
    ]
    return f"""你是一个严格的游戏设计资料编目助手。请只依据用户消息中的音频内容，生成该视频在 Learn About Games 目录中的派生字段。

标题（只用于识别，不是证据）：{item['title'].get('en') or item['title'].get('zh-CN')}
来源（只用于识别，不是证据）：{source_name}

音频是唯一内容证据。不要依据标题、来源、常识或网页记忆补写音频没有明确表达的事实。

可选资源主题（只能使用这些 id）：
{json.dumps(topic_catalog, ensure_ascii=False)}

可选能力（只能使用这些 id；只有音频明确支持时才选，宁可为空）：
{json.dumps(capability_catalog, ensure_ascii=False)}

要求：
1. summary.zh-CN 必须是 180-205 个中文字符（以字符数计）。只写四句，每句约 45-50 个汉字，分别覆盖核心论点、具体例子/方法、设计含义和音频中的限制或结论；不要复述标题，不要写“这是一个关于……的视频”。少于 180 个字符的结果视为失败。
2. resourceTopicIds 只选最贴切的一个主题（数组里恰好一个元素）；没有足够音频依据就返回空数组。
3. capabilityIds 只选择音频明确支持的能力，没有明确支持就返回空数组，不要凑数。
4. 只有音频支持一句有价值的相关性判断时才填 whyRelevant.zh-CN；写不出就省略，且不能与 summary.zh-CN 相同。
5. 只输出 JSON，不要 Markdown：{{"summary":{{"zh-CN":"..."}},"resourceTopicIds":[],"capabilityIds":[],"whyRelevant":{{"zh-CN":"..."}}}}
"""


def build_repair_prompt(item: dict[str, Any], draft: dict[str, Any]) -> str:
    current_length = len(str(draft.get("summary", {}).get("zh-CN", "")))
    minimum_addition = max(0, 180 - current_length)
    return f"""你是 JSON 输出修复器。下面是根据视频字幕生成的目录结果，事实和映射已经由上一轮模型确定。

标题：{item['title'].get('en') or item['title'].get('zh-CN')}
原始结果：
{json.dumps(draft, ensure_ascii=False)}

当前 summary.zh-CN 长度为 {current_length}，至少还需要增加 {minimum_addition} 个字符。只修复 summary.zh-CN 的长度和表达，不新增事实，不改变 resourceTopicIds、capabilityIds，也不要新增 whyRelevant。summary.zh-CN 必须是 180-205 个中文字符；只写四句，每句约 45-50 个汉字。只输出同样结构的 JSON，不要 Markdown：
{{"summary":{{"zh-CN":"..."}},"resourceTopicIds":[],"capabilityIds":[]}}
"""


def generate_model_result(
    item: dict[str, Any],
    prompt: str,
    api_key: str,
    models: list[str],
    allowed_topics: set[str],
    allowed_capabilities: set[str],
    max_tokens: int,
    timeout: int,
) -> dict[str, Any]:
    validator = lambda payload: parse_model_payload(payload, allowed_topics, allowed_capabilities)
    try:
        return call_openrouter(prompt, api_key, models, max_tokens=max_tokens, timeout=timeout, validator=validator)
    except ModelOutputError as exc:
        # A valid JSON object with an invalid summary length is repairable by a
        # subsequent model; malformed/empty responses still take the normal
        # retryable path after all configured models fail.
        for draft in exc.invalid_payloads[:1]:
            repair_prompt = build_repair_prompt(item, draft)
            try:
                return call_openrouter(
                    repair_prompt,
                    api_key,
                    models,
                    max_tokens=max_tokens,
                    timeout=timeout,
                    validator=validator,
                )
            except ModelOutputError:
                continue
        raise


def generate_vertex_audio_result(
    item: dict[str, Any],
    source_name: str,
    audio_path: Path,
    topics: list[dict[str, Any]],
    capabilities: list[dict[str, Any]],
    allowed_topics: set[str],
    allowed_capabilities: set[str],
    model: str,
    max_tokens: int,
    timeout: int,
    max_audio_bytes: int,
) -> dict[str, Any]:
    project, token = load_vertex_credentials()
    prompt = build_audio_prompt(item, source_name, topics, capabilities)
    validator = lambda payload: parse_model_payload(payload, allowed_topics, allowed_capabilities)
    return call_vertex_audio(
        audio_path,
        prompt,
        project,
        token,
        model=model,
        max_tokens=max_tokens,
        timeout=timeout,
        max_audio_bytes=max_audio_bytes,
        validator=validator,
    )


def write_failure_log(path: Path, item_id: str, failure_class: str, detail: str) -> None:
    # detail is deliberately supplied by callers without transcript or API-key material.
    line = f"{now_iso()}\t{item_id}\t{failure_class}\t{detail.replace(chr(10), ' ')}\n"
    path.parent.mkdir(parents=True, exist_ok=True)
    with path.open("a", encoding="utf-8") as handle:
        handle.write(line)


def load_state(path: Path) -> dict[str, Any]:
    if not path.exists():
        return {"version": 1, "items": {}}
    state = load_json(path, "状态文件")
    if not isinstance(state, dict) or not isinstance(state.get("items", {}), dict):
        raise ValueError(f"状态文件结构不正确：{path}")
    return state


def save_state(path: Path, state: dict[str, Any]) -> None:
    atomic_write_json(path, state)


def status_totals(state: dict[str, Any], target_ids: set[str]) -> dict[str, int]:
    records = [state.get("items", {}).get(item_id, {}) for item_id in target_ids]
    channel_failures = {"transcript_channel", "model_channel", "audio_channel", "vertex_channel"}
    model_failures = {"model_output", "vertex_output"}
    return {
        "completed": sum(record.get("status") == "completed" for record in records),
        "no_transcript": sum(record.get("status") == "no_transcript" for record in records),
        "transcript_insufficient": sum(record.get("status") == "transcript_insufficient" for record in records),
        "channel_failure": sum(record.get("failureClass") in channel_failures for record in records),
        "model_failure": sum(record.get("failureClass") in model_failures for record in records),
        "retryable_other": sum(
            record.get("status") == "retryable"
            and record.get("failureClass") not in channel_failures | model_failures
            for record in records
        ),
    }


def update_record(state: dict[str, Any], item_id: str, record: dict[str, Any], path: Path) -> None:
    state.setdefault("items", {})[item_id] = {**record, "updatedAt": now_iso()}
    save_state(path, state)


def recover_pending(resources: list[dict[str, Any]], state: dict[str, Any], resources_path: Path, state_path: Path) -> None:
    by_id = {item["id"]: item for item in resources}
    changed = False
    for item_id, record in state.get("items", {}).items():
        if record.get("status") != "pending_write":
            continue
        result = record.get("result")
        if not isinstance(result, dict) or item_id not in by_id:
            raise RuntimeError(f"状态有无法恢复的 pending_write：{item_id}")
        updated = apply_model_result(by_id[item_id], result)
        by_id[item_id].clear()
        by_id[item_id].update(updated)
        record["status"] = "completed"
        record.pop("result", None)
        record["recovered"] = True
        record["updatedAt"] = now_iso()
        changed = True
    if changed:
        atomic_write_json(resources_path, resources)
        save_state(state_path, state)


def select_candidates(
    resources: list[dict[str, Any]],
    state: dict[str, Any],
    limit: int | None,
    retryable: bool,
    candidate_ids: set[str] | None = None,
    audio_fallback: bool = False,
    description_ids: set[str] | None = None,
    description_only: bool = False,
) -> list[dict[str, Any]]:
    selected: list[dict[str, Any]] = []
    for item in resources:
        if item.get("sourceId") not in TARGET_SOURCE_IDS:
            continue
        if candidate_ids is not None and item["id"] not in candidate_ids:
            continue
        if description_only and (description_ids is None or item["id"] not in description_ids):
            continue
        record = state.get("items", {}).get(item["id"], {})
        status = record.get("status")
        if status == "completed":
            continue
        if status in {"no_transcript", "transcript_insufficient"} and not (
            audio_fallback and not record.get("audioAttempted")
        ):
            continue
        if status == "retryable" and not retryable:
            continue
        selected.append(item)
        if limit is not None and len(selected) >= limit:
            break
    return selected


def load_candidate_ids(path: Path | None) -> set[str] | None:
    if path is None:
        return None
    if not path.exists():
        raise FileNotFoundError(f"ids 文件不存在：{path}")
    values = {line.strip() for line in path.read_text(encoding="utf-8").splitlines() if line.strip()}
    if not values:
        raise ValueError(f"ids 文件为空：{path}")
    return values


def read_cache(cache_dir: Path, video_id: str) -> str | None:
    path = cache_dir / f"{video_id}.txt"
    if not path.exists():
        return None
    text = path.read_text(encoding="utf-8").strip()
    if not text:
        raise RuntimeError(f"字幕缓存为空：{path}")
    return text


def process(args: argparse.Namespace) -> int:
    resources = load_json(args.resources, "资源目录")
    topics = load_json(args.topics, "资源主题目录")
    capabilities = load_json(args.capabilities, "能力目录")
    sources = load_json(args.sources, "来源目录")
    if not isinstance(resources, list) or not isinstance(topics, list) or not isinstance(capabilities, list) or not isinstance(sources, list):
        raise ValueError("资源、主题、能力、来源目录必须都是数组")
    target_items = [item for item in resources if item.get("sourceId") in TARGET_SOURCE_IDS]
    if len(target_items) != 2311:
        raise ValueError(f"目标视频条目数为 {len(target_items)}，预期 2311；拒绝在目录变化上运行")
    target_ids = {item["id"] for item in target_items}
    state = load_state(args.state)
    recover_pending(resources, state, args.resources, args.state)
    candidate_ids = load_candidate_ids(args.ids_file)
    metadata_by_video = load_youtube_metadata(args.metadata) if args.description_fallback else {}
    description_ids: set[str] | None = None
    if args.description_only:
        if not args.description_fallback:
            raise ValueError("--description-only 必须同时启用 --description-fallback")
        description_ids = set()
        for item in target_items:
            video_id = extract_video_id(item["canonicalUrl"])
            metadata_record = metadata_by_video.get(video_id, {})
            if metadata_record.get("captionAvailability") == "false" and get_cached_description(metadata_by_video, video_id):
                description_ids.add(item["id"])
    selected = select_candidates(
        resources,
        state,
        args.limit,
        args.retryable,
        candidate_ids,
        args.audio_fallback,
        description_ids,
        args.description_only,
    )
    report: dict[str, Any] = {
        "startedAt": now_iso(),
        "sampleLabel": args.sample_label,
        "targetTotal": len(target_items),
        "selectedThisRun": len(selected),
        "circuitBreakerLimit": args.circuit_breaker,
        "circuitBreakerOpen": False,
        "processedThisRun": 0,
        "dryRun": args.dry_run,
    }
    if args.dry_run:
        report["remainingBeforeRun"] = len(selected)
        report["totals"] = status_totals(state, target_ids)
        atomic_write_json(args.report, report)
        print(json.dumps(report, ensure_ascii=False, indent=2))
        return 0

    if not selected:
        report["remainingBeforeRun"] = 0
        report["totals"] = status_totals(state, target_ids)
        report["remainingAfterRun"] = len(target_ids) - sum(report["totals"].values())
        report["finishedAt"] = now_iso()
        atomic_write_json(args.report, report)
        print(json.dumps(report, ensure_ascii=False, indent=2))
        return 0
    api_key: str | None = None
    allowed_topics = {topic["id"] for topic in topics}
    allowed_capabilities = {capability["id"] for capability in capabilities}
    source_names = {source["id"]: source.get("name", {}).get("en") or source.get("name", {}).get("zh-CN", source["id"]) for source in sources}
    consecutive_channel_failures = 0
    for item in selected:
        item_id = item["id"]
        video_id = extract_video_id(item["canonicalUrl"])
        audio_attempted = False
        input_mode = "transcript"
        try:
            source_name = source_names.get(item["sourceId"], item["sourceId"])
            model_result: dict[str, Any]
            metadata_record = metadata_by_video.get(video_id)
            description = get_cached_description(metadata_by_video, video_id) if args.description_fallback else None
            prefer_description = bool(
                description
                and metadata_record
                and metadata_record.get("captionAvailability") == "false"
            )
            if prefer_description:
                input_mode = "description"
                if api_key is None:
                    api_key = load_api_key(args.key_file)
                prompt = build_description_prompt(item, source_name, description, topics, capabilities)
                model_result = generate_model_result(
                    item,
                    prompt,
                    api_key,
                    args.models,
                    allowed_topics,
                    allowed_capabilities,
                    args.max_tokens,
                    args.model_timeout,
                )
            else:
                try:
                    transcript = read_cache(args.cache_dir, video_id)
                    if transcript is None:
                        transcript = fetch_transcript_with_fallback(video_id, timeout=args.transcript_timeout)
                        atomic_write_text(args.cache_dir / f"{video_id}.txt", transcript + "\n")
                    else:
                        transcript = validate_transcript_text(transcript)
                except (NoTranscriptFound, TranscriptInsufficientError) as transcript_error:
                    if description is not None:
                        input_mode = "description"
                        if api_key is None:
                            api_key = load_api_key(args.key_file)
                        prompt = build_description_prompt(item, source_name, description, topics, capabilities)
                        model_result = generate_model_result(
                            item,
                            prompt,
                            api_key,
                            args.models,
                            allowed_topics,
                            allowed_capabilities,
                            args.max_tokens,
                            args.model_timeout,
                        )
                    elif not args.audio_fallback:
                        raise transcript_error
                    else:
                        audio_attempted = True
                        input_mode = "audio"
                        binary = resolve_ytdlp_binary()
                        if not binary:
                            raise AudioChannelError("找不到 yt-dlp，无法进入音频路线")
                        audio_path = fetch_audio_via_ytdlp(
                            video_id,
                            binary,
                            args.audio_cache_dir,
                            timeout=args.audio_timeout,
                            max_bytes=args.vertex_max_audio_bytes,
                        )
                        model_result = generate_vertex_audio_result(
                            item,
                            source_name,
                            audio_path,
                            topics,
                            capabilities,
                            allowed_topics,
                            allowed_capabilities,
                            args.vertex_model,
                            args.max_tokens,
                            args.vertex_timeout,
                            args.vertex_max_audio_bytes,
                        )
                else:
                    if api_key is None:
                        api_key = load_api_key(args.key_file)
                    prompt = build_prompt(item, source_name, transcript, topics, capabilities)
                    model_result = generate_model_result(
                        item,
                        prompt,
                        api_key,
                        args.models,
                        allowed_topics,
                        allowed_capabilities,
                        args.max_tokens,
                        args.model_timeout,
                    )
                    input_mode = "transcript"
            result = model_result["payload"]
            updated = apply_model_result(item, result)
            # State is written before and after catalog mutation so a killed process can recover the item.
            update_record(
                state,
                item_id,
                {
                    "status": "pending_write",
                    "result": result,
                    "model": model_result["model"],
                    "inputMode": input_mode,
                },
                args.state,
            )
            item.clear()
            item.update(updated)
            atomic_write_json(args.resources, resources)
            update_record(
                state,
                item_id,
                {
                    "status": "completed",
                    "model": model_result["model"],
                    "inputMode": input_mode,
                    "summaryLength": len(result["summary"]["zh-CN"]),
                },
                args.state,
            )
            consecutive_channel_failures = 0
        except Exception as exc:
            kind = classify_transcript_exception(exc) if not isinstance(exc, (ModelOutputError, ModelChannelError, TranscriptChannelError, TranscriptRetryableError)) else "retryable"
            if isinstance(exc, VertexChannelError):
                failure_class = "vertex_channel"
                status = "retryable"
                kind = "channel_error"
            elif isinstance(exc, AudioChannelError):
                failure_class = "audio_channel"
                status = "retryable"
                kind = "channel_error"
            elif isinstance(exc, AudioInputLimitError):
                failure_class = "audio_input_limit"
                status = "retryable"
            elif isinstance(exc, VertexOutputError):
                failure_class = "vertex_output"
                status = "retryable"
            elif isinstance(exc, ModelChannelError):
                failure_class = "model_channel"
                status = "retryable"
                kind = "channel_error"
            elif isinstance(exc, (ModelOutputError,)):
                failure_class = "model_output"
                status = "retryable"
            elif isinstance(exc, TranscriptChannelError) or kind == "channel_error":
                failure_class = "transcript_channel"
                status = "retryable"
                kind = "channel_error"
            elif isinstance(exc, TranscriptInsufficientError):
                failure_class = "transcript_insufficient"
                status = "transcript_insufficient"
            elif isinstance(exc, TranscriptRetryableError):
                failure_class = "transcript_retryable"
                status = "retryable"
            elif kind == "no_transcript":
                failure_class = "no_transcript"
                status = "no_transcript"
            else:
                failure_class = "unclassified"
                status = "retryable"
            failure_record = {
                "status": status,
                "failureClass": failure_class,
                "retryable": status == "retryable",
                "inputMode": input_mode,
            }
            if audio_attempted:
                failure_record["audioAttempted"] = True
            update_record(state, item_id, failure_record, args.state)
            write_failure_log(args.log, item_id, failure_class, str(exc))
            if kind == "channel_error":
                consecutive_channel_failures += 1
                if consecutive_channel_failures >= args.circuit_breaker:
                    report["circuitBreakerOpen"] = True
                    report["circuitBreakerMessage"] = "先怀疑通道而不是内容：连续通道类失败达到熔断阈值，整轮中止。"
                    break
            else:
                consecutive_channel_failures = 0
        finally:
            report["processedThisRun"] += 1
            report["totals"] = status_totals(state, target_ids)
            report["remainingAfterRun"] = len(target_ids) - sum(report["totals"].values())
            atomic_write_json(args.report, report)
    report["finishedAt"] = now_iso()
    report["totals"] = status_totals(state, target_ids)
    report["remainingAfterRun"] = len(target_ids) - sum(report["totals"].values())
    atomic_write_json(args.report, report)
    print(json.dumps(report, ensure_ascii=False, indent=2))
    return 0


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--limit", type=int, default=None)
    parser.add_argument("--retryable", action="store_true", help="重试此前标记为 retryable 的条目")
    parser.add_argument("--ids-file", type=Path, default=None, help="只处理此文本文件中的 Work Item id，每行一个")
    parser.add_argument("--dry-run", action="store_true")
    parser.add_argument("--sample-label", default=None)
    parser.add_argument("--circuit-breaker", type=int, default=5)
    parser.add_argument("--max-tokens", type=int, default=4000)
    parser.add_argument("--model-timeout", type=int, default=60)
    parser.add_argument("--transcript-timeout", type=int, default=45)
    parser.add_argument("--audio-fallback", action="store_true", help="无可用字幕时下载音频并调用 Vertex ADC")
    parser.add_argument("--description-fallback", action="store_true", help="优先使用官方 YouTube 描述作为正文证据")
    parser.add_argument("--description-only", action="store_true", help="只处理官方描述达标的条目，不请求字幕或音频")
    parser.add_argument("--audio-timeout", type=int, default=120)
    parser.add_argument("--audio-cache-dir", type=Path, default=DEFAULT_AUDIO_CACHE)
    parser.add_argument("--vertex-model", default=os.environ.get("VERTEX_MODEL", DEFAULT_VERTEX_MODEL))
    parser.add_argument("--vertex-timeout", type=int, default=120)
    parser.add_argument("--vertex-max-audio-bytes", type=int, default=DEFAULT_MAX_INLINE_AUDIO_BYTES)
    parser.add_argument("--model", action="append", dest="models", help="可重复指定模型，按顺序 fallback")
    parser.add_argument("--resources", type=Path, default=DEFAULT_RESOURCES)
    parser.add_argument("--topics", type=Path, default=DEFAULT_TOPICS)
    parser.add_argument("--capabilities", type=Path, default=DEFAULT_CAPABILITIES)
    parser.add_argument("--sources", type=Path, default=DEFAULT_SOURCES)
    parser.add_argument("--cache-dir", type=Path, default=DEFAULT_CACHE)
    parser.add_argument("--metadata", type=Path, default=DEFAULT_METADATA)
    parser.add_argument("--state", type=Path, default=DEFAULT_STATE)
    parser.add_argument("--report", type=Path, default=DEFAULT_REPORT)
    parser.add_argument("--log", type=Path, default=DEFAULT_LOG)
    parser.add_argument("--key-file", type=Path, default=Path(os.environ.get("OPENROUTER_API_KEY_FILE", DEFAULT_KEY_FILE)))
    return parser


def main() -> int:
    args = build_parser().parse_args()
    args.models = args.models or DEFAULT_MODELS
    if args.limit is not None and args.limit <= 0:
        raise SystemExit("--limit 必须为正整数")
    if args.circuit_breaker <= 0:
        raise SystemExit("--circuit-breaker 必须为正整数")
    try:
        return process(args)
    except Exception as exc:
        # Fatal setup errors are visible and are not converted into an empty report.
        print(f"FATAL: {type(exc).__name__}: {exc}", file=sys.stderr)
        return 2


if __name__ == "__main__":
    raise SystemExit(main())
