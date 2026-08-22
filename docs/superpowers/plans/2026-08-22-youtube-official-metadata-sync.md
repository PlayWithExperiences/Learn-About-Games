# YouTube Official Metadata Sync Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (- [ ]) syntax.

**Goal:** Add a read-only YouTube Data API v3 metadata synchronizer using local ADC. Discover videos from YouTube channel Sources and write sanitized metadata to an external cache for later transcript and analysis.

**Architecture:** Keep the catalog immutable in this slice. A standalone Python script reads handles from src/data/sources.json, obtains an ADC token through gcloud auth application-default print-access-token, calls channels.list, playlistItems.list, and batched videos.list, then atomically writes ~/.cache/lag-youtube/metadata.json. Tests use a fake opener and never require credentials.

**Tech Stack:** Python 3 standard library, gcloud ADC, YouTube Data API v3 REST, unittest.

---

### Task 1: Contract tests (RED)

**Files:** Create scripts/test_sync_youtube_metadata.py and scripts/sync_youtube_metadata.py.

- [x] Write tests before implementation for handle extraction, non-YouTube rejection, playlist pagination, video normalization without ranking fields, and YouTubeApiError classification.
- [x] Use a FakeOpener that records query parameters and returns JSON through urllib.request.urlopen's context-manager shape. Do not make real HTTP requests in unit tests.
- [x] Run python3 -m unittest scripts.test_sync_youtube_metadata -v. Expected RED because the module and exports do not exist.

### Task 2: Minimal API client (GREEN)

**File:** Modify scripts/sync_youtube_metadata.py.

- [x] Export these contracts:

~~~python
def extract_youtube_handle(homepage: str) -> str: ...
def list_playlist_items(opener, token: str, playlist_id: str, page_size: int = 50) -> list[dict]: ...
def normalize_video(video: dict, source_id: str) -> dict: ...
class YouTubeApiError(RuntimeError):
    status: int
    reason: str
    failure_class: str
    is_retryable: bool
~~~

- [x] Implement api_get with urllib.parse.urlencode and an Authorization Bearer header. Every non-2xx response raises YouTubeApiError; 401 maps to auth, quotaExceeded/dailyLimitExceeded/userRateLimitExceeded to quota, 429 and 5xx to channel, and other 4xx to request. Never turn errors into empty pages.
- [x] Implement homepage -> channels.list(part=id,snippet,contentDetails,forHandle=handle) -> uploads playlist -> playlistItems.list(part=contentDetails,snippet,status) -> videos.list(part=snippet,contentDetails,status,id=up-to-50 IDs).
- [x] Normalize only sourceId, videoId, canonical watch URL, channel ID/title, title, description, publishedAt, duration, captionAvailability and privacyStatus. Do not persist tokens, etags, thumbnails, views, likes, ranks, scores or ratings. Re-run the focused unittest and require GREEN.

### Task 3: CLI, external cache, and real probe

**Files:** Modify scripts/sync_youtube_metadata.py and scripts/test_sync_youtube_metadata.py.

- [x] Support --sources PATH, repeatable --source-id, positive --limit per source (default 50), --page-size in 1..50, --output (default ~/.cache/lag-youtube/metadata.json), and --dry-run. Default selection is channel Sources whose homepage has a YouTube @handle; explicit unknown source IDs fail.
- [x] Implement load_adc_token with captured gcloud output, keeping the token in memory only. Errors must not contain the token. Write JSON with a temporary file, fsync and os.replace; dry-run must not create output.
- [x] Use output keys schemaVersion, generatedAt, api and sources. Each source has sourceId, handle, channelId, channelTitle, uploadsPlaylistId and items. Source-local handle resolution can be an explicit failure record; auth, quota, malformed-response and transport errors make the process nonzero.
- [x] Test selection, argument validation and dry-run, then run:

~~~bash
python3 -m unittest scripts.test_sync_youtube_metadata scripts.test_backfill_video_content -v
python3 scripts/sync_youtube_metadata.py --source-id game-makers-toolkit --limit 3 --output "$HOME/.cache/lag-youtube/metadata-gmtk-probe.json"
jq '{schemaVersion, api, sources: [.sources[] | {sourceId, channelTitle, itemCount: (.items | length), first: .items[0] | {videoId, title, publishedAt, duration, captionAvailability}}]}' "$HOME/.cache/lag-youtube/metadata-gmtk-probe.json"
~~~

Expected: tests pass; the probe exits 0; one source and up to three actual videos appear; no credential-shaped or ranking fields appear.

### Task 4: Verify, document, and commit

**Files:** Modify ProjectInfo/ProjectProgress.md, ProjectInfo/sessions/2026-0820-learn-about-games.md, and ProjectInfo/dialogues/2026-0822.md.

- [x] Run fresh focused unittest, npm run check, npm test and git diff --check. Do not claim completion without fresh probe evidence.
- [x] Record API behavior and external-cache path only. Never record tokens, OAuth JSON contents, client IDs, state, code challenges, transcript text or raw authorization responses. Keep catalog counts unchanged until a separate intake review proves title, URL ownership, topic and capability mapping.
- [x] Commit scripts, tests, this plan and sanitized continuity records with git commit -m "feat: add youtube official metadata sync".
