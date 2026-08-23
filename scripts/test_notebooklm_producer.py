import json
import tempfile
import unittest
from pathlib import Path

import notebooklm_producer as producer


NOW = "2026-08-24T01:31:00+08:00"


def _catalog(*resources: dict) -> list[dict]:
    return list(resources)


def _resource(resource_id: str, url: str, *, access_url: str | None = None) -> dict:
    versions = [{"language": "en", "url": access_url or url}]
    return {
        "id": resource_id,
        "title": {"en": resource_id.title()},
        "resourceTopicIds": ["design-fundamentals"],
        "canonicalUrl": url,
        "accessVersions": versions,
    }


class NotebookLMProducerTests(unittest.TestCase):
    def test_load_candidates_deduplicates_urls_and_keeps_catalog_order(self):
        catalog = _catalog(
            _resource(
                "resource-1",
                "https://www.youtube.com/watch?v=ABCDEFGHIJK",
                access_url="https://youtu.be/ABCDEFGHIJK",
            ),
            _resource("resource-2", "https://example.com/article"),
            _resource("resource-3", "https://www.youtube.com/shorts/LMNOPQRSTUV"),
        )

        with tempfile.TemporaryDirectory() as temp_dir:
            path = Path(temp_dir) / "resources.json"
            path.write_text(json.dumps(catalog), encoding="utf-8")

            candidates = producer.load_candidates(path)

        self.assertEqual([candidate.video_id for candidate in candidates], ["ABCDEFGHIJK", "LMNOPQRSTUV"])
        self.assertEqual(candidates[0].resource_id, "youtube-ABCDEFGHIJK")
        self.assertEqual(candidates[0].source_url, "https://www.youtube.com/watch?v=ABCDEFGHIJK")

    def test_conflicting_catalog_records_for_one_video_fail_loudly(self):
        catalog = _catalog(
            _resource("resource-1", "https://www.youtube.com/watch?v=ABCDEFGHIJK"),
            _resource("resource-2", "https://youtu.be/ABCDEFGHIJK"),
        )

        with tempfile.TemporaryDirectory() as temp_dir:
            path = Path(temp_dir) / "resources.json"
            path.write_text(json.dumps(catalog), encoding="utf-8")

            with self.assertRaises(producer.ProducerError):
                producer.load_candidates(path)

    def test_claim_persists_generating_and_rejects_second_claim(self):
        candidate = producer.Candidate(
            resource_id="youtube-ABCDEFGHIJK",
            video_id="ABCDEFGHIJK",
            source_url="https://www.youtube.com/watch?v=ABCDEFGHIJK",
            catalog_id="resource-1",
            title="Example",
            topic="design-fundamentals",
        )

        with tempfile.TemporaryDirectory() as temp_dir:
            state_dir = Path(temp_dir)
            ledger_path = state_dir / "ledger.json"
            claim = producer.claim_candidate(candidate, ledger_path, NOW)

            self.assertEqual(claim["status"], "generating")
            self.assertEqual(producer.read_ledger(ledger_path)["entries"][candidate.resource_id]["video_id"], "ABCDEFGHIJK")
            with self.assertRaises(producer.AlreadyProcessed):
                producer.claim_candidate(candidate, ledger_path, "2026-08-24T01:32:00+08:00")

    def test_claim_refuses_existing_inbox_record_for_same_video(self):
        candidate = producer.Candidate(
            resource_id="youtube-ABCDEFGHIJK",
            video_id="ABCDEFGHIJK",
            source_url="https://www.youtube.com/watch?v=ABCDEFGHIJK",
            catalog_id="resource-1",
            title="Example",
            topic="design-fundamentals",
        )

        with tempfile.TemporaryDirectory() as temp_dir:
            root = Path(temp_dir)
            inbox = root / "inbox"
            inbox.mkdir()
            (inbox / "existing.json").write_text(
                json.dumps(
                    {
                        "resource_id": "legacy-resource",
                        "producer_status": "ready",
                        "source": {"url": candidate.source_url, "video_id": candidate.video_id},
                    }
                ),
                encoding="utf-8",
            )

            with self.assertRaises(producer.AlreadyProcessed):
                producer.claim_candidate(candidate, root / "ledger.json", NOW, inbox_dir=inbox)

    def test_lock_is_single_instance_and_releases_after_context(self):
        with tempfile.TemporaryDirectory() as temp_dir:
            lock_path = Path(temp_dir) / "producer.lock"
            with producer.producer_lock(lock_path):
                self.assertTrue(lock_path.exists())
                with self.assertRaises(producer.AlreadyRunning):
                    with producer.producer_lock(lock_path):
                        pass
            self.assertFalse(lock_path.exists())

    def test_preflight_is_read_only_and_selects_first_unseen_candidate(self):
        catalog = _catalog(
            _resource("resource-1", "https://www.youtube.com/watch?v=ABCDEFGHIJK"),
            _resource("resource-2", "https://youtu.be/LMNOPQRSTUV"),
        )
        with tempfile.TemporaryDirectory() as temp_dir:
            root = Path(temp_dir)
            catalog_path = root / "resources.json"
            catalog_path.write_text(json.dumps(catalog), encoding="utf-8")
            inbox = root / "inbox"
            inbox.mkdir()
            ledger_path = root / "ledger.json"

            result = producer.preflight(catalog_path, inbox, ledger_path)

            self.assertEqual(result["status"], "ready_to_claim")
            self.assertEqual(result["candidate"]["video_id"], "ABCDEFGHIJK")
            self.assertFalse(ledger_path.exists())

    def test_publish_ready_writes_metadata_and_is_idempotent(self):
        candidate = producer.Candidate(
            resource_id="youtube-ABCDEFGHIJK",
            video_id="ABCDEFGHIJK",
            source_url="https://www.youtube.com/watch?v=ABCDEFGHIJK",
            catalog_id="resource-1",
            title="Example",
            topic="design-fundamentals",
        )
        raw_result = {
            "title": "Example NotebookLM Result",
            "topic": "design-fundamentals",
            "source": {"label": "YouTube", "url": candidate.source_url},
            "artifacts": {
                "infographic": {"label": "Info", "url": "https://example.com/info.png"},
                "mind_map": {"label": "Map", "url": "https://example.com/map.png"},
                "slide_deck": {"label": "Slides", "url": "https://example.com/slides.pptx"},
            },
            "content_summary": "按来源顺序整理出的完整文字版总结。",
            "boundary": "来源没有覆盖的范围已明确说明。",
        }

        with tempfile.TemporaryDirectory() as temp_dir:
            root = Path(temp_dir)
            ledger_path = root / "ledger.json"
            inbox = root / "inbox"
            inbox.mkdir()
            producer.claim_candidate(candidate, ledger_path, NOW)

            first = producer.publish_ready(
                candidate,
                raw_result,
                inbox,
                ledger_path,
                generation_run_id="run-20260824-0130",
                now=NOW,
            )
            saved = json.loads(first.read_text(encoding="utf-8"))
            self.assertEqual(saved["resource_id"], candidate.resource_id)
            self.assertEqual(saved["source"]["video_id"], candidate.video_id)
            self.assertEqual(saved["producer_status"], "ready")
            self.assertEqual(saved["generation_run_id"], "run-20260824-0130")
            self.assertTrue(saved["output_fingerprint"])
            self.assertEqual(producer.read_ledger(ledger_path)["entries"][candidate.resource_id]["status"], "ready")

            second = producer.publish_ready(
                candidate,
                raw_result,
                inbox,
                ledger_path,
                generation_run_id="run-20260824-0130",
                now=NOW,
            )
            self.assertEqual(second, first)
            self.assertEqual(len(list(inbox.glob("*.json"))), 1)

            changed = dict(raw_result, content_summary="不同的内容，不能覆盖原结果。")
            with self.assertRaises(producer.ProducerError):
                producer.publish_ready(
                    candidate,
                    changed,
                    inbox,
                    ledger_path,
                    generation_run_id="run-20260824-0131",
                    now="2026-08-24T01:32:00+08:00",
                )

    def test_publish_rejects_empty_or_partial_result_and_never_marks_ready(self):
        candidate = producer.Candidate(
            resource_id="youtube-ABCDEFGHIJK",
            video_id="ABCDEFGHIJK",
            source_url="https://www.youtube.com/watch?v=ABCDEFGHIJK",
            catalog_id="resource-1",
            title="Example",
            topic="design-fundamentals",
        )

        with tempfile.TemporaryDirectory() as temp_dir:
            root = Path(temp_dir)
            ledger_path = root / "ledger.json"
            inbox = root / "inbox"
            inbox.mkdir()
            producer.claim_candidate(candidate, ledger_path, NOW)

            with self.assertRaises(producer.ProducerError):
                producer.publish_ready(
                    candidate,
                    {"title": "Incomplete", "content_summary": ""},
                    inbox,
                    ledger_path,
                    generation_run_id="run-20260824-0130",
                    now=NOW,
                )

            entry = producer.read_ledger(ledger_path)["entries"][candidate.resource_id]
            self.assertEqual(entry["status"], "failed")
            self.assertIn("content_summary", entry["failure_reason"])
            self.assertEqual(list(inbox.glob("*.json")), [])

    def test_publish_rejects_invalid_topic_instead_of_filling_a_default(self):
        candidate = producer.Candidate(
            resource_id="youtube-ABCDEFGHIJK",
            video_id="ABCDEFGHIJK",
            source_url="https://www.youtube.com/watch?v=ABCDEFGHIJK",
            catalog_id="resource-1",
            title="Example",
            topic="design-fundamentals",
        )
        raw_result = {
            "title": "Example NotebookLM Result",
            "topic": "Not A Safe Topic",
            "source": {"label": "YouTube", "url": candidate.source_url},
            "artifacts": {
                "infographic": {"label": "Info", "url": "https://example.com/info.png"},
                "mind_map": {"label": "Map", "url": "https://example.com/map.png"},
                "slide_deck": {"label": "Slides", "url": "https://example.com/slides.pptx"},
            },
            "content_summary": "按来源顺序整理出的完整文字版总结。",
            "boundary": "来源没有覆盖的范围已明确说明。",
        }

        with tempfile.TemporaryDirectory() as temp_dir:
            root = Path(temp_dir)
            ledger_path = root / "ledger.json"
            inbox = root / "inbox"
            inbox.mkdir()
            producer.claim_candidate(candidate, ledger_path, NOW)

            with self.assertRaises(producer.ProducerError):
                producer.publish_ready(
                    candidate,
                    raw_result,
                    inbox,
                    ledger_path,
                    generation_run_id="run-20260824-0130",
                    now=NOW,
                )

            self.assertEqual(
                producer.read_ledger(ledger_path)["entries"][candidate.resource_id]["status"],
                "failed",
            )


if __name__ == "__main__":
    unittest.main()
