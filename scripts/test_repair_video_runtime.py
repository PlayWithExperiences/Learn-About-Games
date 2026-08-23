import json
import tempfile
import unittest
from pathlib import Path
from unittest.mock import patch

import scripts.repair_video_runtime as repair


class TestRepairVideoRuntime(unittest.TestCase):
    def test_reconcile_verified_secondary_summary(self):
        summary = "摘要内容经过来源核对。" * 16
        item = {
            "id": "yt-secondary-example",
            "summary": {"zh-CN": summary},
            "resourceTopicIds": ["collaboration-teams"],
            "capabilityIds": ["cross-discipline-communication"],
            "externalSignals": [
                {
                    "provider": repair.EXTERNAL_ARTICLE_PROVIDER,
                    "label": repair.EXTERNAL_ARTICLE_LABEL,
                    "value": "对应专题；仅作内容旁证",
                    "observedAt": "2026-08-23",
                    "url": "https://en.senkohome.com/sakurai-game-dev-team-management/",
                }
            ],
        }
        state = {"version": 1, "items": {}}

        reconciled = repair.reconcile_external_article_results(state, [item], "2026-08-23T00:00:00+00:00")

        self.assertEqual(reconciled, ["yt-secondary-example"])
        record = state["items"]["yt-secondary-example"]
        self.assertEqual(record["status"], "completed")
        self.assertEqual(record["inputMode"], "external_article")
        self.assertEqual(record["evidenceType"], "secondary_summary")
        self.assertEqual(record["summaryLength"], len(summary))
        self.assertEqual(len(record["summarySha256"]), 64)

    def test_reconcile_verified_official_description(self):
        summary = "官方公开视频描述确认该频道面向游戏制作者、玩家与从业者，内容以短篇、易懂的方式解释游戏制作主题；这只是公开描述，不等同于字幕正文。" * 3
        item = {
            "id": "yt-official-description-example",
            "summary": {"zh-CN": summary},
            "resourceTopicIds": ["career-industry-practice"],
            "capabilityIds": ["experience-framing"],
            "externalSignals": [
                {
                    "provider": repair.OFFICIAL_DESCRIPTION_PROVIDER,
                    "label": repair.OFFICIAL_DESCRIPTION_LABEL,
                    "value": "YouTube 官方公开描述；不等同于字幕正文",
                    "observedAt": "2026-08-23",
                    "url": "https://www.youtube.com/watch?v=PUj0WzkmLf0",
                }
            ],
        }
        state = {"version": 1, "items": {}}

        reconciled = repair.reconcile_external_article_results(
            state, [item], "2026-08-23T00:00:00+00:00"
        )

        self.assertEqual(reconciled, ["yt-official-description-example"])
        record = state["items"]["yt-official-description-example"]
        self.assertEqual(record["status"], "completed")
        self.assertEqual(record["inputMode"], "description")
        self.assertEqual(record["evidenceType"], "official_description")
        self.assertEqual(record["evidenceUrl"], "https://www.youtube.com/watch?v=PUj0WzkmLf0")

    def test_reconcile_skips_existing_official_completion(self):
        summary = "二手旁证不会覆盖既有官方摘要。" * 10
        item = {
            "id": "yt-secondary-official-existing",
            "summary": {"zh-CN": summary},
            "resourceTopicIds": ["design-fundamentals"],
            "externalSignals": [
                {
                    "provider": repair.EXTERNAL_ARTICLE_PROVIDER,
                    "label": repair.EXTERNAL_ARTICLE_LABEL,
                    "value": "对应专题；仅作内容旁证",
                    "observedAt": "2026-08-23",
                    "url": "https://example.com/evidence",
                }
            ],
        }
        existing = {
            "status": "completed",
            "retryable": False,
            "inputMode": "description",
            "summaryLength": 180,
        }
        state = {"version": 1, "items": {item["id"]: existing.copy()}}
        skipped = []

        reconciled = repair.reconcile_external_article_results(
            state, [item], "2026-08-23T00:00:00+00:00", skipped_existing=skipped
        )

        self.assertEqual(reconciled, [])
        self.assertEqual(skipped, [item["id"]])
        self.assertEqual(state["items"][item["id"]], existing)

    def test_reconcile_replaces_existing_retryable_with_verified_evidence(self):
        item = {
            "id": "yt-secondary-conflict",
            "summary": {"zh-CN": "摘要" * 80},
            "resourceTopicIds": ["collaboration-teams"],
            "externalSignals": [
                {
                    "provider": repair.EXTERNAL_ARTICLE_PROVIDER,
                    "label": repair.EXTERNAL_ARTICLE_LABEL,
                    "value": "对应专题",
                    "observedAt": "2026-08-23",
                    "url": "https://example.com/evidence",
                }
            ],
        }
        state = {
            "version": 1,
            "items": {"yt-secondary-conflict": {"status": "retryable", "failureClass": "transcript_channel"}},
        }

        reconciled = repair.reconcile_external_article_results(
            state, [item], "2026-08-23T00:00:00+00:00"
        )

        self.assertEqual(reconciled, [item["id"]])
        self.assertEqual(state["items"][item["id"]]["status"], "completed")
        self.assertEqual(state["items"][item["id"]]["evidenceType"], "secondary_summary")

    def test_reconcile_summary_lengths_updates_only_stale_completed_metadata(self):
        item = {"id": "yt-length-example", "summary": {"zh-CN": "新的摘要"}}
        state = {
            "items": {
                item["id"]: {
                    "status": "completed",
                    "summaryLength": 99,
                    "model": "vertex/example",
                }
            }
        }

        changed = repair.reconcile_summary_lengths(state, [item], "2026-08-23T04:59:00+00:00")

        self.assertEqual(changed, [item["id"]])
        self.assertEqual(state["items"][item["id"]]["summaryLength"], len("新的摘要"))
        self.assertEqual(
            state["items"][item["id"]]["summaryLengthReconciledAt"],
            "2026-08-23T04:59:00+00:00",
        )
        self.assertEqual(state["items"][item["id"]]["model"], "vertex/example")

    def test_reconcile_summary_lengths_rejects_non_completed_state(self):
        item = {"id": "yt-length-retryable", "summary": {"zh-CN": "新的摘要"}}
        state = {"items": {item["id"]: {"status": "retryable"}}}

        with self.assertRaisesRegex(RuntimeError, "只接受 completed"):
            repair.reconcile_summary_lengths(state, [item], "2026-08-23T04:59:00+00:00")

    def test_repair_only_reclassifies_verified_ffmpeg_failure(self):
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            (root / "scripts").mkdir()
            (root / "src/data").mkdir(parents=True)
            source_script = root / "scripts/trickle-video-content.sh"
            source_script.write_text("updated script\n", encoding="utf-8")
            (root / "src/data/resources.json").write_text(
                json.dumps([{"id": repair.TARGET_ITEM_ID, "sourceId": "game-makers-toolkit"}]),
                encoding="utf-8",
            )
            cache = root / "cache"
            cache.mkdir()
            state_path = cache / "state.json"
            state_path.write_text(
                json.dumps(
                    {
                        "version": 1,
                        "items": {
                            repair.TARGET_ITEM_ID: {
                                "status": "retryable",
                                "failureClass": "audio_channel",
                                "retryable": True,
                                "audioAttempted": True,
                            }
                        },
                    }
                ),
                encoding="utf-8",
            )
            report_path = cache / "report.json"
            report_path.write_text(json.dumps({"totals": {}}), encoding="utf-8")
            failures_path = cache / "failures.log"
            failures_path.write_text(
                "2026-08-22T18:00:46+00:00\t"
                + repair.TARGET_ITEM_ID
                + "\taudio_channel\t音频 yt-dlp 通道失败：ERROR: Postprocessing: ffprobe and ffmpeg not found\n",
                encoding="utf-8",
            )
            cooldown_path = cache / "cooldown_until"
            cooldown_path.write_text("123\n", encoding="utf-8")
            log_path = cache / "trickle.log"
            resources = root / "src/data/resources.json"
            launchd_path = cache / "trickle.sh"
            with patch.multiple(
                repair,
                REPO_ROOT=root,
                CACHE=cache,
                STATE_PATH=state_path,
                REPORT_PATH=report_path,
                FAILURES_PATH=failures_path,
                TRICKLE_LOG_PATH=log_path,
                COOLDOWN_PATH=cooldown_path,
                LAUNCHD_SCRIPT_PATH=launchd_path,
                EXPECTED_TARGET_TOTAL=1,
            ):
                result = repair.repair(kickstart=False)

            state = json.loads(state_path.read_text(encoding="utf-8"))
            report = json.loads(report_path.read_text(encoding="utf-8"))
            self.assertEqual(result["failureClass"], "audio_tooling")
            self.assertEqual(state["items"][repair.TARGET_ITEM_ID]["failureClass"], "audio_tooling")
            self.assertFalse(cooldown_path.exists())
            self.assertEqual(launchd_path.read_text(encoding="utf-8"), "updated script\n")
            self.assertEqual(report["totals"]["retryable_other"], 1)
            self.assertEqual(report["uncompletedAfterRun"], 1)
            self.assertTrue(log_path.exists())


if __name__ == "__main__":
    unittest.main()
