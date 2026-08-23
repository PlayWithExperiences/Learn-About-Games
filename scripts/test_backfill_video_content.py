import json
import tempfile
import unittest
from pathlib import Path
from unittest.mock import patch

import scripts.backfill_video_content as backfill

from scripts.backfill_video_content import (
    AudioToolingError,
    ModelOutputError,
    DescriptionInsufficientError,
    apply_model_result,
    build_audio_prompt,
    build_description_prompt,
    classify_transcript_exception,
    fetch_transcript,
    initialize_pending_records,
    parse_model_payload,
    parse_vertex_response,
    select_candidates,
    select_description_ids,
    should_prefer_description,
    update_report_totals,
    validate_description_text,
)


class TranscriptsDisabled(Exception):
    pass


class NoTranscriptFound(Exception):
    pass


class FakeTranscriptApi:
    def fetch(self, _video_id, languages=None):
        del languages
        return [type("Segment", (), {"text": "[Music] [Music] got you [Music]"})()]


class TestBackfillContracts(unittest.TestCase):
    def test_initializes_missing_items_without_marking_them_complete(self):
        state = {"items": {"done": {"status": "completed"}}}
        resources = [
            {"id": "done", "sourceId": "game-makers-toolkit"},
            {"id": "pending", "sourceId": "game-makers-toolkit"},
        ]
        with tempfile.TemporaryDirectory() as directory:
            state_path = Path(directory) / "state.json"
            self.assertEqual(initialize_pending_records(state, resources, state_path), 1)
            record = state["items"]["pending"]
            self.assertEqual(record["status"], "evidence_pending")
            self.assertFalse(record["retryable"])
            self.assertIn("尚未调用分析模型", record["nextStep"])
            persisted = json.loads(state_path.read_text(encoding="utf-8"))
            self.assertEqual(persisted["items"]["pending"]["status"], "evidence_pending")
            dry_state = {"items": {}}
            dry_path = Path(directory) / "dry-state.json"
            self.assertEqual(initialize_pending_records(dry_state, resources, dry_path, persist=False), 2)
            self.assertFalse(dry_path.exists())

    def test_resolves_explicit_ffmpeg_toolchain_directory(self):
        with tempfile.TemporaryDirectory() as directory:
            tool_dir = Path(directory)
            for name in ("ffmpeg", "ffprobe"):
                tool = tool_dir / name
                tool.write_text("#!/bin/sh\n", encoding="utf-8")
                tool.chmod(0o755)
            with patch.dict(backfill.os.environ, {"FFMPEG_LOCATION": directory}):
                self.assertEqual(backfill.resolve_ffmpeg_location(), directory)

    def test_audio_route_reports_missing_local_tooling_before_download(self):
        with tempfile.TemporaryDirectory() as directory:
            with patch.object(backfill, "resolve_ffmpeg_location", return_value=None):
                with patch.object(backfill.subprocess, "run") as run:
                    with self.assertRaises(AudioToolingError):
                        backfill.fetch_audio_via_ytdlp(
                            "video-1",
                            "/bin/false",
                            Path(directory),
                        )
                    run.assert_not_called()

    def test_classifies_missing_transcript_as_terminal(self):
        self.assertEqual(classify_transcript_exception(TranscriptsDisabled()), "no_transcript")
        self.assertEqual(classify_transcript_exception(NoTranscriptFound()), "no_transcript")

    def test_classifies_rate_limit_as_channel_failure(self):
        error = RuntimeError("YouTube returned HTTP 429: too many requests")
        self.assertEqual(classify_transcript_exception(error), "channel_error")

    def test_transcript_channel_errors_can_enter_explicit_audio_fallback(self):
        self.assertTrue(backfill.should_try_audio_fallback(backfill.TranscriptChannelError("blocked")))
        self.assertTrue(backfill.should_try_audio_fallback(backfill.TranscriptRetryableError("temporary")))
        self.assertFalse(backfill.should_try_audio_fallback(RuntimeError("unrelated")))

    def test_rejects_transcript_that_is_only_audio_markers(self):
        with self.assertRaisesRegex(RuntimeError, "字幕正文过短或只有音频标记"):
            fetch_transcript("video-1", api_factory=lambda: FakeTranscriptApi())

    def test_normalizes_external_missing_transcript_for_audio_fallback(self):
        ExternalMissing = type("NoTranscriptFound", (RuntimeError,), {})
        with self.assertRaises(backfill.NoTranscriptFound):
            fetch_transcript("video-1", api_factory=lambda: (_ for _ in ()).throw(ExternalMissing("no track")))

    def test_cleans_repeated_vtt_cues_before_analysis(self):
        parser = getattr(backfill, "parse_vtt", None)
        self.assertIsNotNone(parser)
        vtt = """WEBVTT

00:00.000 --> 00:01.000
<c>Hello</c> world

00:01.000 --> 00:02.000
<c>Hello</c> world

00:02.000 --> 00:03.000
The next point
        """
        self.assertEqual(parser(vtt), "Hello world The next point")

    def test_prompt_sets_a_strict_summary_length_contract(self):
        prompt = backfill.build_prompt(
            {"title": {"en": "Test video"}},
            "Test source",
            "The transcript contains enough detail to support a careful summary. " * 20,
            [],
            [],
        )
        self.assertIn("180-205", prompt)
        self.assertIn("每句约 45-50 个汉字", prompt)

    def test_repair_prompt_distinguishes_short_and_long_summaries(self):
        item = {"title": {"en": "Test video"}}
        short = backfill.build_repair_prompt(item, {"summary": {"zh-CN": "短"}})
        long = backfill.build_repair_prompt(item, {"summary": {"zh-CN": "长" * 221}})
        self.assertIn("过短", short)
        self.assertIn("过长", long)
        self.assertIn("不要过度压缩", long)

    def test_prompt_separates_topic_ids_from_capability_ids(self):
        prompt = backfill.build_prompt(
            {"title": {"en": "Test video"}},
            "Test source",
            "Evidence text",
            [{"id": "design-fundamentals", "title": {"zh-CN": "设计基础"}, "summary": {"zh-CN": ""}}],
            [{"id": "aesthetic-direction", "name": {"zh-CN": "审美方向"}, "summary": {"zh-CN": ""}}],
        )
        self.assertIn("aesthetic-direction", prompt)
        self.assertIn("绝不能放进 `resourceTopicIds`", prompt)
        self.assertIn("频道统一页脚", prompt)

    def test_audio_prompt_keeps_audio_as_the_only_evidence(self):
        prompt = build_audio_prompt(
            {"title": {"en": "Test video"}},
            "Test source",
            [],
            [],
        )
        self.assertIn("音频是唯一内容证据", prompt)
        self.assertIn("180-205", prompt)

    def test_description_prompt_marks_official_description_as_evidence(self):
        prompt = build_description_prompt(
            {"title": {"en": "Test video"}},
            "Test source",
            "The official description explains a game design method in enough detail. " * 8,
            [],
            [],
        )
        self.assertIn("YouTube 官方描述", prompt)
        self.assertIn("只依据下方", prompt)

    def test_description_validation_removes_urls_and_rejects_link_only_text(self):
        with self.assertRaises(DescriptionInsufficientError):
            validate_description_text("https://example.com/" * 100)
        text = validate_description_text("A concrete design explanation. " * 12 + " https://example.com")
        self.assertNotIn("https://", text)

    def test_vertex_response_requires_text_candidate(self):
        response = {
            "candidates": [{"content": {"parts": [{"text": '{"ok":true}'}]}}]
        }
        self.assertEqual(parse_vertex_response(response), '{"ok":true}')
        with self.assertRaises(ModelOutputError):
            parse_vertex_response({"candidates": [{"content": {"role": "model"}}]})

    def test_vertex_audio_call_sends_inline_audio_and_validates_response(self):
        class FakeResponse:
            status = 200

            def __enter__(self):
                return self

            def __exit__(self, *_args):
                return False

            def read(self):
                return json.dumps(
                    {"candidates": [{"content": {"parts": [{"text": '{"ok":true}'}]}}]}
                ).encode("utf-8")

        seen = {}

        def opener(request, timeout):
            del timeout
            seen.update(json.loads(request.data.decode("utf-8")))
            return FakeResponse()

        with tempfile.TemporaryDirectory() as directory:
            path = Path(directory) / "sample.mp3"
            path.write_bytes(b"audio")
            result = backfill.call_vertex_audio(
                path,
                "prompt",
                "project",
                "token",
                opener=opener,
                validator=lambda payload: payload,
            )
        self.assertEqual(result["payload"], {"ok": True})
        self.assertEqual(seen["contents"][0]["parts"][0]["inlineData"]["mimeType"], "audio/mpeg")
        self.assertEqual(seen["generationConfig"]["thinkingConfig"]["thinkingBudget"], 0)

    def test_vertex_audio_preserves_invalid_payload_for_repair(self):
        class FakeResponse:
            status = 200

            def __enter__(self):
                return self

            def __exit__(self, *_args):
                return False

            def read(self):
                return json.dumps(
                    {"candidates": [{"content": {"parts": [{"text": '{"summary":{"zh-CN":"短"}}'}]}}]}
                ).encode("utf-8")

        def opener(_request, timeout):
            del timeout
            return FakeResponse()

        def reject(_payload):
            raise ModelOutputError("summary 太短")

        with tempfile.TemporaryDirectory() as directory:
            path = Path(directory) / "sample.mp3"
            path.write_bytes(b"audio")
            with self.assertRaises(backfill.VertexOutputError) as context:
                backfill.call_vertex_audio(
                    path,
                    "prompt",
                    "project",
                    "token",
                    opener=opener,
                    validator=reject,
                )
        self.assertEqual(context.exception.invalid_payloads, [{"summary": {"zh-CN": "短"}}])

    def test_vertex_text_call_sends_text_and_validates_response(self):
        class FakeResponse:
            status = 200

            def __enter__(self):
                return self

            def __exit__(self, *_args):
                return False

            def read(self):
                return json.dumps(
                    {"candidates": [{"content": {"parts": [{"text": '{"ok":true}'}]}}]}
                ).encode("utf-8")

        seen = {}

        def opener(request, timeout):
            del timeout
            seen.update(json.loads(request.data.decode("utf-8")))
            return FakeResponse()

        result = backfill.call_vertex_text(
            "prompt",
            "project",
            "token",
            opener=opener,
            validator=lambda payload: payload,
        )
        self.assertEqual(result["payload"], {"ok": True})
        self.assertEqual(seen["contents"][0]["parts"][0]["text"], "prompt")
        self.assertEqual(seen["generationConfig"]["responseMimeType"], "application/json")

    def test_vertex_text_preserves_invalid_payload_for_repair(self):
        class FakeResponse:
            status = 200

            def __enter__(self):
                return self

            def __exit__(self, *_args):
                return False

            def read(self):
                return json.dumps(
                    {"candidates": [{"content": {"parts": [{"text": '{"summary":{"zh-CN":"短"}}'}]}}]}
                ).encode("utf-8")

        def opener(_request, timeout=None):
            del timeout
            return FakeResponse()

        def reject(_payload):
            raise ModelOutputError("summary 太短")

        with self.assertRaises(backfill.VertexOutputError) as context:
            backfill.call_vertex_text("prompt", "project", "token", opener=opener, validator=reject)
        self.assertEqual(context.exception.invalid_payloads, [{"summary": {"zh-CN": "短"}}])

    def test_vertex_text_result_retries_repair_from_latest_draft(self):
        invalid_one = {"summary": {"zh-CN": "第一版"}, "resourceTopicIds": [], "capabilityIds": []}
        invalid_two = {"summary": {"zh-CN": "第二版"}, "resourceTopicIds": [], "capabilityIds": []}
        valid = {"summary": {"zh-CN": "通过"}, "resourceTopicIds": [], "capabilityIds": []}
        calls = []

        def fake_call(prompt, *_args, **_kwargs):
            calls.append(prompt)
            if len(calls) == 1:
                raise backfill.VertexOutputError("short", invalid_payloads=[invalid_one])
            if len(calls) == 2:
                raise backfill.VertexOutputError("short", invalid_payloads=[invalid_two])
            return {"model": "vertex/gemini-2.5-flash", "payload": valid}

        with patch.object(backfill, "load_vertex_credentials", return_value=("project", "token")):
            with patch.object(backfill, "call_vertex_text", side_effect=fake_call):
                result = backfill.generate_vertex_text_result(
                    {"title": {"en": "Test video"}},
                    "prompt",
                    set(),
                    set(),
                    "gemini-2.5-flash",
                    768,
                    120,
                )

        self.assertEqual(result["payload"], valid)
        self.assertEqual(len(calls), 3)
        self.assertIn("第二版", calls[2])

    def test_vertex_audio_result_repairs_invalid_draft_with_text_endpoint(self):
        draft = {"summary": {"zh-CN": "音频草稿"}, "resourceTopicIds": [], "capabilityIds": []}
        valid = {"summary": {"zh-CN": "通过"}, "resourceTopicIds": [], "capabilityIds": []}
        with patch.object(backfill, "load_vertex_credentials", return_value=("project", "token")):
            with patch.object(
                backfill,
                "call_vertex_audio",
                side_effect=backfill.VertexOutputError("too long", invalid_payloads=[draft]),
            ):
                with patch.object(
                    backfill,
                    "generate_vertex_text_result",
                    return_value={"model": "vertex/gemini-2.5-flash", "payload": valid},
                ) as repair:
                    result = backfill.generate_vertex_audio_result(
                        {"title": {"en": "Test video"}},
                        "Test source",
                        Path("/tmp/test.mp3"),
                        [],
                        [],
                        set(),
                        set(),
                        "gemini-2.5-flash",
                        768,
                        120,
                        1024,
                    )

        self.assertEqual(result["payload"], valid)
        self.assertEqual(repair.call_count, 1)

    def test_description_only_selection_does_not_include_other_items(self):
        resources = [
            {"id": "description-item", "sourceId": "game-makers-toolkit"},
            {"id": "other-item", "sourceId": "game-makers-toolkit"},
        ]
        selected = select_candidates(
            resources,
            {"items": {}},
            limit=None,
            retryable=False,
            description_ids={"description-item"},
            description_only=True,
        )
        self.assertEqual([item["id"] for item in selected], ["description-item"])

    def test_description_only_modes_can_include_caption_available_items(self):
        resources = [
            {
                "id": "caption-item",
                "canonicalUrl": "https://www.youtube.com/watch?v=caption-item",
            },
            {
                "id": "short-item",
                "canonicalUrl": "https://www.youtube.com/watch?v=short-item",
            },
        ]
        metadata = {
            "caption-item": {
                "captionAvailability": "true",
                "description": "A concrete official explanation. " * 12,
            },
            "short-item": {
                "captionAvailability": "true",
                "description": "Too short",
            },
        }
        self.assertEqual(
            select_description_ids(resources, metadata, include_caption_available=True),
            {"caption-item"},
        )
        self.assertEqual(select_description_ids(resources, metadata), set())

    def test_description_only_mode_prefers_selected_description_over_transcript(self):
        record = {"captionAvailability": "true"}
        self.assertTrue(
            should_prefer_description(
                "An official description",
                record,
                "caption-item",
                {"caption-item"},
                description_only=True,
                description_only_all=False,
            )
        )
        self.assertFalse(
            should_prefer_description(
                "An official description",
                record,
                "caption-item",
                {"caption-item"},
                description_only=False,
                description_only_all=False,
            )
        )

    def test_report_distinguishes_uncompleted_from_unclassified(self):
        report = {}
        state = {
            "items": {
                "done": {"status": "completed"},
                "failed": {"status": "retryable", "failureClass": "transcript_channel"},
            }
        }
        update_report_totals(report, state, {"done", "failed", "pending"})
        self.assertEqual(report["remainingAfterRun"], 1)
        self.assertEqual(report["uncompletedAfterRun"], 2)
        self.assertEqual(report["unclassifiedAfterRun"], 1)
        self.assertEqual(report["evidencePendingAfterRun"], 0)

    def test_rejects_unknown_ids_and_short_summary(self):
        with self.assertRaises(ModelOutputError):
            parse_model_payload(
                {"summary": {"zh-CN": "太短"}, "resourceTopicIds": ["not-a-topic"], "capabilityIds": []},
                {"game-feel-feedback"},
                {"game-feel-tuning"},
            )

    def test_drops_capability_id_misplaced_as_topic(self):
        summary = "摘要内容" * 50
        result = parse_model_payload(
            {
                "summary": {"zh-CN": summary},
                "resourceTopicIds": ["aesthetic-direction"],
                "capabilityIds": ["aesthetic-direction"],
            },
            {"systems-mechanics"},
            {"aesthetic-direction"},
        )
        self.assertEqual(result["resourceTopicIds"], [])
        self.assertEqual(result["capabilityIds"], ["aesthetic-direction"])

    def test_drops_topic_id_misplaced_as_capability(self):
        summary = "摘要内容" * 50
        result = parse_model_payload(
            {
                "summary": {"zh-CN": summary},
                "resourceTopicIds": ["systems-mechanics"],
                "capabilityIds": ["production-iteration"],
            },
            {"systems-mechanics", "production-iteration"},
            {"game-feel-tuning"},
        )
        self.assertEqual(result["resourceTopicIds"], ["systems-mechanics"])
        self.assertEqual(result["capabilityIds"], [])

    def test_drops_observed_gdc_boilerplate_topic_id(self):
        summary = "摘要内容" * 50
        result = parse_model_payload(
            {
                "summary": {"zh-CN": summary},
                "resourceTopicIds": ["visual-arts"],
                "capabilityIds": [],
            },
            {"systems-mechanics"},
            set(),
        )
        self.assertEqual(result["resourceTopicIds"], [])

    def test_replaces_fallback_topic_and_drops_duplicate_why_relevant(self):
        summary = "摘要内容" * 50
        item = {
            "summary": {"zh-CN": "旧摘要", "en": "旧英文摘要"},
            "resourceTopicIds": ["design-fundamentals"],
            "capabilityIds": [],
        }
        result = parse_model_payload(
            {
                "summary": {"zh-CN": summary},
                "resourceTopicIds": ["game-feel-feedback"],
                "capabilityIds": ["game-feel-tuning"],
                "whyRelevant": {"zh-CN": summary},
            },
            {"game-feel-feedback"},
            {"game-feel-tuning"},
        )
        updated = apply_model_result(item, result)
        self.assertEqual(updated["summary"], {"zh-CN": summary})
        self.assertEqual(updated["resourceTopicIds"], ["game-feel-feedback"])
        self.assertEqual(updated["capabilityIds"], ["game-feel-tuning"])
        self.assertNotIn("whyRelevant", updated)


if __name__ == "__main__":
    unittest.main()
