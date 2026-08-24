#!/bin/zsh
set -euo pipefail

script_dir="$(cd "$(dirname "$0")" && pwd)"
learn_root="${LAG_LEARN_ROOT:-$(cd "$script_dir/.." && pwd)}"
ai_root="${LAG_AI_MENTOR_ROOT:-/Users/haodong/Documents/GitHub/AI-Life-Mentor}"
state_dir="${LAG_NOTEBOOKLM_STATE_DIR:-/Users/haodong/.local/state/learn-about-games/notebooklm-daily}"
daily_limit="${LAG_NOTEBOOKLM_DAILY_LIMIT:-10}"

mkdir -p "$state_dir"
exec python3 "$learn_root/scripts/notebooklm_producer.py" preflight \
  --catalog "$learn_root/src/data/resources.json" \
  --inbox "$ai_root/notebooklm-resources" \
  --state-dir "$state_dir" \
  --limit "$daily_limit"
