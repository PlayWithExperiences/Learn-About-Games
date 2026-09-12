#!/usr/bin/env bash
# Wait for the NotebookLM slide-deck time gate to open, then exit.
#
# Context: on 2026-09-13 the deck feature became capacity-throttled (no immediate
# generation; queuing promised output "after 4am"). Every remaining resource needs a
# deck, so the queue cannot advance until the gate opens. Polling this from goal rounds
# would mean dozens of empty rounds, so the waiting lives in a background job instead:
# it settles exactly once, and its completion is the signal to resume the batch.
#
# Exit codes: 0 = gate open, 3 = still throttled at deadline, 1 = probe failed repeatedly.
#
# Usage: wait-for-deck-gate.sh [max-minutes] [interval-seconds]
set -uo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
MAX_MIN="${1:-240}"
INTERVAL="${2:-300}"
PROBE="$ROOT/automation/browser/nblm-deck-available.cjs"

echo "GATE_WAIT_START $(date '+%Y-%m-%dT%H:%M:%S%z') max_minutes=$MAX_MIN interval_s=$INTERVAL"
deadline=$(( $(date +%s) + MAX_MIN * 60 ))
failures=0

while [[ "$(date +%s)" -lt "$deadline" ]]; do
  out=$(LAG_CDP_PORT="${LAG_CDP_PORT:-9222}" node "$PROBE" 2>/dev/null)
  rc=$?
  echo "$(date '+%H:%M:%S') rc=$rc $out"
  if [[ "$rc" == "0" ]]; then
    echo "GATE_OPEN $(date '+%Y-%m-%dT%H:%M:%S%z')"
    exit 0
  elif [[ "$rc" == "3" ]]; then
    failures=0
  else
    failures=$((failures + 1))
    if [[ "$failures" -ge 6 ]]; then
      echo "GATE_WAIT_FAILED: probe failed $failures consecutive times (browser channel?)"
      exit 1
    fi
  fi
  sleep "$INTERVAL"
done

echo "GATE_STILL_CLOSED $(date '+%Y-%m-%dT%H:%M:%S%z') after ${MAX_MIN} minutes"
exit 3
