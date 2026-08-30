import os
import plistlib
import subprocess
import tempfile
import unittest
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
RUNNER = ROOT / "automation" / "notebooklm-daily-preflight.sh"
PLIST = ROOT / "automation" / "com.lag.notebooklm-daily-preflight.plist"
SKILL = ROOT / ".agents" / "skills" / "collect-resources-about-game" / "SKILL.md"
CONTRACT = ROOT / ".agents" / "skills" / "collect-resources-about-game" / "references" / "resource-contract.md"
VISION = ROOT / "ProjectInfo" / "ProjectVision.md"


class NotebookLMAutomationTests(unittest.TestCase):
    def test_runner_is_preflight_only_and_uses_overridable_roots(self):
        script = RUNNER.read_text(encoding="utf-8")

        self.assertIn("preflight", script)
        self.assertIn("LAG_LEARN_ROOT", script)
        self.assertIn("LAG_AI_MENTOR_ROOT", script)
        self.assertNotIn("notebooklm_producer.py publish", script)
        self.assertNotIn("codex exec", script)

    def test_runner_can_execute_a_local_fake_preflight_without_network(self):
        with tempfile.TemporaryDirectory() as temp_dir:
            root = Path(temp_dir)
            fake_learn = root / "learn"
            fake_ai = root / "ai"
            (fake_learn / "scripts").mkdir(parents=True)
            (fake_ai / "notebooklm-resources").mkdir(parents=True)
            fake_producer = fake_learn / "scripts" / "notebooklm_producer.py"
            fake_producer.write_text(
                "import json\nprint(json.dumps({'status': 'ready_to_claim'}))\n",
                encoding="utf-8",
            )
            env = os.environ.copy()
            env.update({
                "LAG_LEARN_ROOT": str(fake_learn),
                "LAG_AI_MENTOR_ROOT": str(fake_ai),
                "LAG_NOTEBOOKLM_STATE_DIR": str(root / "state"),
            })

            result = subprocess.run(
                ["/bin/zsh", str(RUNNER)],
                env=env,
                capture_output=True,
                text=True,
                check=False,
            )

        self.assertEqual(result.returncode, 0, result.stderr)
        self.assertIn("ready_to_claim", result.stdout)

    def test_launchd_template_is_not_run_at_load_and_schedules_one_probe(self):
        payload = plistlib.loads(PLIST.read_bytes())

        self.assertFalse(payload["RunAtLoad"])
        self.assertEqual(payload["StartCalendarInterval"], {"Hour": 7, "Minute": 30})
        self.assertIn("preflight", " ".join(payload["ProgramArguments"]))
        self.assertNotIn("codex exec", " ".join(payload["ProgramArguments"]))
        self.assertIn("notebooklm-daily", payload["StandardOutPath"])
        self.assertIn("notebooklm-daily", payload["StandardErrorPath"])

    def test_skill_documents_background_page_asset_export_without_download_prompt(self):
        skill = SKILL.read_text(encoding="utf-8")
        contract = CONTRACT.read_text(encoding="utf-8")

        self.assertIn("pageAssets", skill)
        self.assertIn("bundle", skill)
        self.assertIn("不要依赖 Chrome 下载弹窗", skill)
        self.assertIn("页面资产列表本身不算成功", skill)
        self.assertIn("页面资产后台路径", contract)
        self.assertIn("不要依赖 Chrome 下载弹窗", contract)

    def test_skill_documents_explicit_retry_without_automatic_reclaim(self):
        skill = SKILL.read_text(encoding="utf-8")

        self.assertIn("显式重跑", skill)
        self.assertIn("previous-generation-run-id", skill)
        self.assertIn("保留旧失败尝试", skill)

    def test_skill_requires_remote_handoff_after_ready(self):
        skill = SKILL.read_text(encoding="utf-8")
        contract = CONTRACT.read_text(encoding="utf-8")
        vision = VISION.read_text(encoding="utf-8")

        self.assertIn("`ready` 只是待交付运输态", skill)
        self.assertIn("每个成功的 ready JSON 都必须", skill)
        self.assertIn("远端回读", skill)
        self.assertNotIn("当前任务明确包含远端交付时", skill)
        self.assertNotIn("默认边界停在 ready 队列", skill)
        self.assertIn("`ready` is a validated transport state", contract)
        self.assertIn("只写入本机 `ready` JSON 不算完成", vision)
        self.assertIn("先幂等写入 PKM", vision)


if __name__ == "__main__":
    unittest.main()
