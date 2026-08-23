import unittest
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
SCRIPT = ROOT / "automation" / "publish-notebooklm-resource.sh"


class PublishScriptContractTests(unittest.TestCase):
    def test_script_is_narrow_and_non_force_pushing(self):
        text = SCRIPT.read_text(encoding="utf-8")
        self.assertIn("producer_status", text)
        self.assertIn("git -C \"$ai_root\" add -- \"$relative_path\"", text)
        self.assertIn("git -C \"$ai_root\" push origin main", text)
        self.assertNotIn("--force", text)
        self.assertNotIn("git pull", text)
        self.assertNotIn("retry", text.lower())

    def test_script_restricts_path_to_inbox_and_main(self):
        text = SCRIPT.read_text(encoding="utf-8")
        self.assertIn('"$inbox_real"/*.json', text)
        self.assertIn('[[ "$branch" == "main" ]]', text)
        self.assertIn('git -C "$ai_root" diff --cached --name-only', text)


if __name__ == "__main__":
    unittest.main()
