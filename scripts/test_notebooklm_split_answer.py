import importlib.util
import unittest
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
SCRIPT = ROOT / "automation" / "notebooklm-split-answer.py"

spec = importlib.util.spec_from_file_location("notebooklm_split_answer", SCRIPT)
module = importlib.util.module_from_spec(spec)
assert spec.loader is not None
spec.loader.exec_module(module)


class SplitAnswerTests(unittest.TestCase):
    def split(self, raw):
        return module.split_answer(raw)

    def test_exact_inline_marker(self):
        summary, boundary = self.split("中文总结。\n来源边界：\n未覆盖：A。")
        self.assertEqual(summary, "中文总结。")
        self.assertEqual(boundary, "未覆盖：A。")

    def test_halfwidth_inline_marker(self):
        summary, boundary = self.split("中文总结。\n来源边界:\n未覆盖：A。")
        self.assertEqual(summary, "中文总结。")
        self.assertEqual(boundary, "未覆盖：A。")

    def test_plain_heading_line(self):
        summary, boundary = self.split("中文总结。\n来源边界\n未覆盖：A。")
        self.assertEqual(summary, "中文总结。")
        self.assertEqual(boundary, "未覆盖：A。")

    def test_markdown_heading_with_colon(self):
        summary, boundary = self.split("中文总结。\n## 来源边界：\n未覆盖：A。")
        self.assertEqual(summary, "中文总结。")
        self.assertEqual(boundary, "未覆盖：A。")

    def test_bilingual_heading_20261104(self):
        """NotebookLM 2026-11-04 emitted 来源边界（Source Boundaries）."""
        raw = "中文总结。\n来源边界（Source Boundaries）\n说明来源未覆盖或无法确认的内容：\n未覆盖：A。"
        summary, boundary = self.split(raw)
        self.assertEqual(summary, "中文总结。")
        self.assertEqual(boundary, "说明来源未覆盖或无法确认的内容：\n未覆盖：A。")

    def test_bilingual_heading_ascii_parentheses(self):
        raw = "中文总结。\n来源边界 (Source Boundaries)\n未覆盖：A。"
        summary, boundary = self.split(raw)
        self.assertEqual(summary, "中文总结。")
        self.assertEqual(boundary, "未覆盖：A。")

    def test_heading_trailing_english_without_parentheses(self):
        summary, boundary = self.split("中文总结。\n来源边界 Source Boundaries\n未覆盖：A。")
        self.assertEqual(summary, "中文总结。")
        self.assertEqual(boundary, "未覆盖：A。")

    def test_heading_with_bullets_after_is_not_heading(self):
        """A body line that merely starts with the phrase must not be split on."""
        with self.assertRaises(SystemExit):
            self.split("中文总结，其中提到来源边界（Source Boundaries）这个说法。")

    def test_prose_mention_without_marker_is_refused(self):
        with self.assertRaises(SystemExit):
            self.split("中文总结。\n最后说明来源边界，但这不是独立标记。")

    def test_trailing_suggestion_is_stripped(self):
        raw = "中文总结。\n来源边界（Source Boundaries）\n未覆盖：A。\n💡 如果你需要，我可以生成幻灯片。"
        summary, boundary = self.split(raw)
        self.assertEqual(summary, "中文总结。")
        self.assertEqual(boundary, "未覆盖：A。")

    def test_empty_summary_is_refused(self):
        with self.assertRaises(SystemExit):
            self.split("来源边界：\n未覆盖：A。")


if __name__ == "__main__":
    unittest.main()
