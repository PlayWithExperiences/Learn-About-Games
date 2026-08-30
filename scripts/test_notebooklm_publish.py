import json
import os
import subprocess
import tempfile
import unittest
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
SCRIPT = ROOT / "automation" / "publish-notebooklm-resource.sh"


class PublishScriptContractTests(unittest.TestCase):
    def test_script_is_narrow_and_non_force_pushing(self):
        text = SCRIPT.read_text(encoding="utf-8")
        self.assertIn("producer_status", text)
        self.assertIn("git -C \"$ai_root\" add -- \"$relative_path\"", text)
        self.assertIn("git -C \"$ai_root\" ls-tree -r --name-only HEAD", text)
        self.assertIn("git -C \"$ai_root\" push origin main", text)
        self.assertNotIn("--force", text)
        self.assertNotIn("git pull", text)
        self.assertNotIn("retry", text.lower())

    def test_script_restricts_path_to_inbox_and_main(self):
        text = SCRIPT.read_text(encoding="utf-8")
        self.assertIn('"$inbox_real"/*.json', text)
        self.assertIn('[[ "$branch" == "main" ]]', text)
        self.assertIn('git -C "$ai_root" diff --cached --name-only', text)

    def test_script_verifies_remote_path_and_exact_blob_after_push(self):
        text = SCRIPT.read_text(encoding="utf-8")
        self.assertIn('git -C "$ai_root" ls-tree -r --name-only origin/main -- "$relative_path"', text)
        self.assertIn('git -C "$ai_root" rev-parse "origin/main:$relative_path"', text)
        self.assertIn('git -C "$ai_root" hash-object "$resource_real"', text)
        self.assertIn("远端回读确认", text)

    def test_script_pushes_one_ready_json_and_reads_back_the_exact_remote_blob(self):
        with tempfile.TemporaryDirectory() as temp_dir:
            root = Path(temp_dir)
            remote = root / "ai-life-mentor.git"
            ai_root = root / "ai-life-mentor"
            inbox = ai_root / "notebooklm-resources"

            subprocess.run(
                ["git", "init", "--bare", str(remote)],
                check=True,
                capture_output=True,
                text=True,
            )
            subprocess.run(
                ["git", "init", "-b", "main", str(ai_root)],
                check=True,
                capture_output=True,
                text=True,
            )
            for key, value in (("user.name", "Test User"), ("user.email", "test@example.com")):
                subprocess.run(
                    ["git", "-C", str(ai_root), "config", key, value],
                    check=True,
                    capture_output=True,
                    text=True,
                )
            subprocess.run(
                ["git", "-C", str(ai_root), "remote", "add", "origin", str(remote)],
                check=True,
                capture_output=True,
                text=True,
            )
            inbox.mkdir(parents=True)
            (ai_root / "README.md").write_text("fixture\n", encoding="utf-8")
            subprocess.run(
                ["git", "-C", str(ai_root), "add", "README.md"],
                check=True,
                capture_output=True,
                text=True,
            )
            subprocess.run(
                ["git", "-C", str(ai_root), "commit", "-m", "init"],
                check=True,
                capture_output=True,
                text=True,
            )

            resource = inbox / "2026-0830-1521-design-fundamentals.json"
            resource.write_text(
                json.dumps(
                    {
                        "resource_id": "youtube-ABCDEFGHIJK",
                        "producer_status": "ready",
                        "source": {
                            "url": "https://www.youtube.com/watch?v=ABCDEFGHIJK",
                            "video_id": "ABCDEFGHIJK",
                        },
                        "content_summary": "已验证的内容总结。",
                        "boundary": "来源没有覆盖或无法确认的内容。",
                        "artifacts": {"infographic": {}, "mind_map": {}, "slide_deck": {}},
                    },
                    ensure_ascii=False,
                ),
                encoding="utf-8",
            )

            env = os.environ.copy()
            env["LAG_AI_MENTOR_ROOT"] = str(ai_root)
            result = subprocess.run(
                ["/bin/zsh", str(SCRIPT), "--resource-file", str(resource)],
                env=env,
                capture_output=True,
                text=True,
                check=False,
            )

            relative_path = "notebooklm-resources/2026-0830-1521-design-fundamentals.json"
            remote_path = subprocess.run(
                ["git", "--git-dir", str(remote), "ls-tree", "-r", "--name-only", "main", "--", relative_path],
                check=True,
                capture_output=True,
                text=True,
            ).stdout.strip()
            local_blob = subprocess.run(
                ["git", "-C", str(ai_root), "hash-object", str(resource)],
                check=True,
                capture_output=True,
                text=True,
            ).stdout.strip()
            remote_blob = subprocess.run(
                ["git", "--git-dir", str(remote), "rev-parse", f"main:{relative_path}"],
                check=True,
                capture_output=True,
                text=True,
            ).stdout.strip()

        self.assertEqual(result.returncode, 0, result.stderr)
        self.assertIn("远端回读确认", result.stdout)
        self.assertEqual(remote_path, relative_path)
        self.assertEqual(remote_blob, local_blob)


if __name__ == "__main__":
    unittest.main()
