#!/usr/bin/env bash
# Drive the NotebookLM resource queue: take preflight candidates one at a time and run
# each through automation/run-notebooklm-item.py until the daily claim limit is reached
# or no unprocessed candidate remains.
#
# Serial by design (the contract is concurrency 1, auto-retry 0). Each item's own
# failures are recorded by the item runner through the producer's `fail`; the driver
# then moves to the next distinct candidate rather than retrying the same one.
#
# Usage: run-notebooklm-batch.sh [max-items]
set -uo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
STATE_DIR="${LAG_NOTEBOOKLM_STATE_DIR:-$HOME/.local/state/learn-about-games/notebooklm-daily}"
INBOX="${LAG_AI_MENTOR_ROOT:-/Users/haodong/Documents/GitHub/AI-Life-Mentor}/notebooklm-resources"
MAX_ITEMS="${1:-10}"
LOG_DIR="$STATE_DIR/runs"
mkdir -p "$LOG_DIR"

echo "BATCH_START $(date '+%Y-%m-%dT%H:%M:%S%z') max_items=$MAX_ITEMS"

processed=0
while [[ "$processed" -lt "$MAX_ITEMS" ]]; do
  preflight=$(python3 "$ROOT/scripts/notebooklm_producer.py" preflight \
      --catalog "$ROOT/src/data/resources.json" --inbox "$INBOX" \
      --state-dir "$STATE_DIR" --limit 1 2>&1)
  status=$(printf '%s' "$preflight" | python3 -c 'import sys,json; print(json.load(sys.stdin)["status"])' 2>/dev/null || echo "preflight_error")

  if [[ "$status" != "ready_to_claim" ]]; then
    echo "BATCH_STOP status=$status"
    printf '%s\n' "$preflight" | tail -20
    break
  fi

  rid=$(printf '%s' "$preflight" | python3 -c 'import sys,json; print(json.load(sys.stdin)["candidate"]["resource_id"])')
  title=$(printf '%s' "$preflight" | python3 -c 'import sys,json; print(json.load(sys.stdin)["candidate"]["title"])')
  echo "=== ITEM $((processed + 1)): $rid | $title | $(date '+%H:%M:%S')"

  log="$LOG_DIR/batch-$(date '+%Y%m%dT%H%M%S')-$rid.log"
  python3 "$ROOT/automation/run-notebooklm-item.py" --resource-id "$rid" --state-dir "$STATE_DIR" 2>&1 | tee "$log"
  rc=${PIPESTATUS[0]}
  echo "=== ITEM $rid finished rc=$rc ($(date '+%H:%M:%S'))"

  if [[ "$rc" == "3" ]]; then
    echo "BATCH_STOP deck_unavailable (no claim consumed)"
    break
  fi

  processed=$((processed + 1))
  sleep 5
done

echo "BATCH_END processed=$processed at $(date '+%Y-%m-%dT%H:%M:%S%z')"
