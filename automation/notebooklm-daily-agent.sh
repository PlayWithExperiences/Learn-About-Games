#!/usr/bin/env bash
# launchd 触发器：每天 boot 一个和交互会话同模型的 headless DSH agent 跑收集批量。
# 模型为 agent-default-model（opencode-go-muse / muse-spark-1.3-contributor），与日常会话一致。
# 本脚本只做互斥与启动；批次行为由 automation/notebooklm-daily-prompt.md + skill 合同决定。
set -uo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
STATE_DIR="${LAG_NOTEBOOKLM_STATE_DIR:-$HOME/.local/state/learn-about-games/notebooklm-daily}"
LOG_DIR="$STATE_DIR/runs"
mkdir -p "$LOG_DIR"
STAMP="$(TZ=Asia/Shanghai date +%Y%m%d)"
TRIGGER_LOG="$LOG_DIR/daily-$STAMP-trigger.log"

log() { echo "$(TZ=Asia/Shanghai date '+%Y-%m-%dT%H:%M:%S%z') $*" | tee -a "$TRIGGER_LOG"; }

# 单实例（macOS 无 flock：mkdir 原子性；pid 存活才算持有，无 pid/死 pid 视为过期回收）。
LOCK_DIR="$STATE_DIR/daily-agent.lockdir"
if mkdir "$LOCK_DIR" 2>/dev/null; then
  echo $$ >"$LOCK_DIR/pid"
else
  OLD_PID="$(cat "$LOCK_DIR/pid" 2>/dev/null || echo unknown)"
  if [[ "$OLD_PID" =~ ^[0-9]+$ ]] && kill -0 "$OLD_PID" 2>/dev/null; then
    log "TRIGGER_STOP already-running (holder pid $OLD_PID)"
    exit 0
  fi
  rm -rf "$LOCK_DIR"
  mkdir "$LOCK_DIR" 2>/dev/null || { log "TRIGGER_STOP lock-failed"; exit 1; }
  echo $$ >"$LOCK_DIR/pid"
fi
trap 'rm -rf "$LOCK_DIR"' EXIT

log "TRIGGER_START root=$ROOT"
cd "$ROOT" || { log "TRIGGER_STOP no-project-root"; exit 1; }

# prompt 文件即任务文本；headless agent 与交互会话同模型、同 skill、同脚本。
# 推理进 stderr，全进 trigger 日志；最终答复打印到 stdout。
dsh --profile headless "$(cat "$ROOT/automation/notebooklm-daily-prompt.md")" >>"$TRIGGER_LOG" 2>&1
RC="$?"
log "TRIGGER_END rc=$RC"
exit "$RC"
