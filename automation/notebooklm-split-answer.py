#!/usr/bin/env python3
"""Split a raw NotebookLM chat answer into content_summary and boundary.

The answer ends with an offer to continue ("💡 如果你需要…" / "🎯 既然笔记本中…").
That is assistant chatter, not source content, and it can mention OTHER sources in
the notebook — which would look like cross-source contamination in the delivered
JSON (observed 2026-09-13: a Hitman summary trailed off into "the notebook also has
Fallout 4"). Strip it.

Usage: notebooklm-split-answer.py <raw-answer.txt> <summary-out.txt> <boundary-out.txt>
"""
import re
import sys
from pathlib import Path

BOUNDARY_MARKER = "来源边界："
# An offer-to-continue line: starts with an emoji/symbol, or uses second-person
# follow-up phrasing. Cut from there to the end.
SUGGESTION_RE = re.compile(
    r"^\s*(?:[\U0001F300-\U0001FAFF\u2600-\u27BF]|如果你想|如果你需要|你是否想|需要我|我可以为你)"
)


def split_answer(raw: str) -> tuple[str, str]:
    text = raw.strip()

    # drop the "Thoughts / expand_more" affordance if it survived
    text = re.sub(r"^Thoughts\s*\n?\s*expand_more\s*\n?", "", text).strip()

    idx = text.find(BOUNDARY_MARKER)
    if idx < 0:
        raise SystemExit("no 来源边界 marker: refusing to guess the boundary split")

    summary = text[:idx].strip()
    rest = text[idx + len(BOUNDARY_MARKER):]

    # keep only up to the first offer-to-continue line
    kept: list[str] = []
    for line in rest.split("\n"):
        if line.strip() and SUGGESTION_RE.match(line):
            break
        kept.append(line)
    boundary = "\n".join(kept).strip()

    if not summary:
        raise SystemExit("empty content summary")
    if not boundary:
        raise SystemExit("empty boundary")
    return summary, boundary


def main() -> int:
    if len(sys.argv) != 4:
        print(__doc__)
        return 2
    raw = Path(sys.argv[1]).read_text(encoding="utf-8")
    summary, boundary = split_answer(raw)
    Path(sys.argv[2]).write_text(summary, encoding="utf-8")
    Path(sys.argv[3]).write_text(boundary, encoding="utf-8")

    print(f"summary chars: {len(summary)}")
    print(f"boundary chars: {len(boundary)}")
    sections = ["核心问题", "案例与迭代", "设计取舍", "玩家影响", "可迁移方法"]
    missing = [s for s in sections if s not in summary]
    print("sections:", "all present" if not missing else f"MISSING {missing}")
    emoji_tail = [l for l in boundary.split("\n") if SUGGESTION_RE.match(l)]
    print("trailing suggestion stripped:", bool(emoji_tail) or "none found")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
