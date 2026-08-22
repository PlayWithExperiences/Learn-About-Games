import json
import io
import tempfile
import unittest
from contextlib import redirect_stdout
from pathlib import Path
from urllib.parse import parse_qs, urlparse

from scripts.sync_youtube_metadata import (
    YouTubeApiError,
    extract_youtube_handle,
    list_playlist_items,
    normalize_video,
    run,
    select_sources,
)


class FakeResponse:
    def __init__(self, payload):
        self.payload = payload

    def __enter__(self):
        return self

    def __exit__(self, *_args):
        return False

    def read(self):
        return json.dumps(self.payload).encode("utf-8")


class FakeOpener:
    def __init__(self, payloads):
        self.payloads = list(payloads)
        self.calls = []

    def __call__(self, request, timeout=None):
        del timeout
        self.calls.append({key: values[0] for key, values in parse_qs(urlparse(request.full_url).query).items()})
        return FakeResponse(self.payloads.pop(0))


class TestYouTubeMetadataContracts(unittest.TestCase):
    def test_extracts_handle(self):
        self.assertEqual(extract_youtube_handle("https://www.youtube.com/@GMTK"), "@GMTK")

    def test_rejects_non_youtube_handle(self):
        with self.assertRaises(ValueError):
            extract_youtube_handle("https://thegamedesignroundtable.com/")

    def test_paginates_playlist_items(self):
        opener = FakeOpener(
            [
                {"items": [{"contentDetails": {"videoId": "v-1"}}], "nextPageToken": "p2"},
                {"items": [{"contentDetails": {"videoId": "v-2"}}]},
            ]
        )
        items = list_playlist_items(opener, "test-token", "uploads-1", page_size=50)
        self.assertEqual([item["contentDetails"]["videoId"] for item in items], ["v-1", "v-2"])
        self.assertEqual(opener.calls[1]["pageToken"], "p2")

    def test_normalizes_metadata_without_rankings(self):
        result = normalize_video(
            {
                "id": "v-1",
                "snippet": {
                    "channelId": "channel-1",
                    "channelTitle": "GMTK",
                    "title": "A video",
                    "description": "Description",
                    "publishedAt": "2026-08-01T12:00:00Z",
                },
                "contentDetails": {"duration": "PT12M3S", "caption": "true"},
                "status": {"privacyStatus": "public"},
            },
            "game-makers-toolkit",
        )
        self.assertEqual(result["videoId"], "v-1")
        self.assertEqual(result["captionAvailability"], "true")
        self.assertNotIn("viewCount", result)
        self.assertNotIn("rank", result)

    def test_classifies_api_errors(self):
        error = YouTubeApiError(403, "quotaExceeded", "quota exhausted")
        self.assertEqual(error.failure_class, "quota")
        self.assertFalse(error.is_retryable)

    def test_default_selection_excludes_non_youtube_channels_and_dry_run_does_not_write(self):
        sources = [
            {
                "id": "yt-source",
                "kind": "channel",
                "homepage": "https://www.youtube.com/@TestChannel",
            },
            {
                "id": "other-channel",
                "kind": "channel",
                "homepage": "https://example.com/podcast",
            },
        ]
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            source_path = root / "sources.json"
            output_path = root / "metadata.json"
            source_path.write_text(json.dumps(sources), encoding="utf-8")
            opener = FakeOpener(
                [
                    {
                        "items": [
                            {
                                "id": "channel-1",
                                "snippet": {"title": "Test Channel"},
                                "contentDetails": {
                                    "relatedPlaylists": {"uploads": "uploads-1"}
                                },
                            }
                        ]
                    },
                    {
                        "items": [
                            {"contentDetails": {"videoId": "v-1"}}
                        ]
                    },
                    {
                        "items": [
                            {
                                "id": "v-1",
                                "snippet": {
                                    "channelId": "channel-1",
                                    "channelTitle": "Test Channel",
                                    "title": "A video",
                                    "description": "Description",
                                    "publishedAt": "2026-08-01T12:00:00Z",
                                },
                                "contentDetails": {
                                    "duration": "PT1M",
                                    "caption": "false",
                                },
                                "status": {"privacyStatus": "public"},
                            }
                        ]
                    },
                ]
            )
            args = type(
                "Args",
                (),
                {
                    "sources": source_path,
                    "source_ids": None,
                    "limit": 1,
                    "page_size": 50,
                    "output": output_path,
                    "dry_run": True,
                },
            )()
            stdout = io.StringIO()
            with redirect_stdout(stdout):
                self.assertEqual(
                    run(args, opener=opener, token_loader=lambda: "test-token"),
                    0,
                )
            summary = json.loads(stdout.getvalue())
            self.assertEqual(summary["sourcesSelected"], 1)
            self.assertEqual(summary["videoCount"], 1)
            self.assertFalse(output_path.exists())

    def test_unknown_source_id_and_invalid_limit_fail(self):
        with self.assertRaises(ValueError):
            select_sources(
                [{"id": "known", "kind": "channel", "homepage": "https://www.youtube.com/@Known"}],
                ["missing"],
            )
        args = type(
            "Args",
            (),
            {
                "sources": Path("/does/not/exist"),
                "source_ids": None,
                "limit": 0,
                "page_size": 50,
                "output": Path("/tmp/should-not-be-created.json"),
                "dry_run": True,
            },
        )()
        with self.assertRaises(ValueError):
            run(args, token_loader=lambda: "test-token")


if __name__ == "__main__":
    unittest.main()
