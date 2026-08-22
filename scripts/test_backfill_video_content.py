import unittest

from scripts.backfill_video_content import (
    ModelOutputError,
    apply_model_result,
    classify_transcript_exception,
    fetch_transcript,
    parse_model_payload,
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
    def test_classifies_missing_transcript_as_terminal(self):
        self.assertEqual(classify_transcript_exception(TranscriptsDisabled()), "no_transcript")
        self.assertEqual(classify_transcript_exception(NoTranscriptFound()), "no_transcript")

    def test_classifies_rate_limit_as_channel_failure(self):
        error = RuntimeError("YouTube returned HTTP 429: too many requests")
        self.assertEqual(classify_transcript_exception(error), "channel_error")

    def test_rejects_transcript_that_is_only_audio_markers(self):
        with self.assertRaisesRegex(RuntimeError, "字幕正文过短或只有音频标记"):
            fetch_transcript("video-1", api_factory=lambda: FakeTranscriptApi())

    def test_rejects_unknown_ids_and_short_summary(self):
        with self.assertRaises(ModelOutputError):
            parse_model_payload(
                {"summary": {"zh-CN": "太短"}, "resourceTopicIds": ["not-a-topic"], "capabilityIds": []},
                {"game-feel-feedback"},
                {"game-feel-tuning"},
            )

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
