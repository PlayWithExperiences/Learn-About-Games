#!/usr/bin/env bash
# 低频涓流：每次只补 1 条视频内容，绝不批量。
#
# 为什么是这个形状（2026-08-21 無涘 拍板：宁可慢，不许冒封 IP 的风险）：
#   Codex 一次性连发跑到第 95 条时被 YouTube 封 IP（41 次 IpBlocked）。
#   出口是机场/数据中心 IP（AS134972 东京），正是 youtube-transcript-api 文档
#   点名的第二类成因，阈值本就远低于住宅 IP。
#   所以策略是「远低于观测到的失败点」+「一撞就长退避」：
#     · 每次运行只取 1 条，脚本内不会有连续请求
#     · launchd 每 4 小时触发一次 → 约 6 条/天
#     · 报告里出现任何通道类失败，立刻写 24 小时冷却，期间所有运行直接跳过
#
#   诚实说明：没有公开的「绝对安全速率」。这里能做的是把速率压到观测失败点的
#   几百分之一，并保证一旦触发就长退避、失败留痕可查。
#
# 观察产出（对表用）：
#   日志      ~/.cache/lag-video-content/trickle.log
#   冷却标记  ~/.cache/lag-video-content/cooldown_until
#   进度      ~/.cache/lag-video-content/state.json
# ⚠️ 部署位置：launchd 实际执行的是 ~/.cache/lag-video-content/trickle.sh 的副本，不是本文件。
#    原因是 macOS TCC：launchd 拉起的 /bin/bash 没有 ~/Documents 访问权，
#    直接指向仓库内路径会得到 "Operation not permitted"（退出码 126，一行日志都写不出来）。
#    本文件是**唯一真源**，改完必须同步：
#        cp scripts/trickle-video-content.sh ~/.cache/lag-video-content/trickle.sh
#    （2026-08-22 实测：移出 Documents 后 launchd 可正常执行。但冷却检查在 cd 进仓库之前，
#      所以「从 launchd 读仓库数据文件」这一步尚未被真实验证，等首次真跑才知道。）

set -uo pipefail

REPO="$HOME/Documents/GitHub/Learn-About-Games"
CACHE="$HOME/.cache/lag-video-content"
PY="$CACHE/venv/bin/python"
LOG="$CACHE/trickle.log"
COOLDOWN="$CACHE/cooldown_until"
REPORT="$CACHE/report.json"
PRIORITY_IDS="$CACHE/priority-ids.txt"
COOLDOWN_SECONDS=86400          # 撞封禁后退避 24 小时

mkdir -p "$CACHE"
log() { printf '%s\t%s\n' "$(date '+%Y-%m-%d %H:%M:%S%z')" "$*" >> "$LOG"; }

[ -x "$PY" ] || { log "ABORT	venv 不存在：$PY"; exit 1; }

# ── 冷却检查 ───────────────────────────────────────────────
now=$(date +%s)
if [ -f "$COOLDOWN" ]; then
  until_ts=$(cat "$COOLDOWN" 2>/dev/null || echo 0)
  if [ "$now" -lt "$until_ts" ]; then
    log "SKIP	冷却中，还剩 $(( (until_ts - now) / 60 )) 分钟"
    exit 0
  fi
  rm -f "$COOLDOWN"
  log "INFO	冷却结束，恢复涓流"
fi

cd "$REPO" || { log "ABORT	进不去 $REPO"; exit 1; }

# ── 优先级：先补 GMTK 与樱井（Daily 素材线），耗尽后自动放开到全量目标 ──
ARGS=(--limit 1 --description-fallback --audio-fallback)
if [ -s "$PRIORITY_IDS" ]; then
  priority_remaining="$("$PY" - "$PRIORITY_IDS" "$REPO/src/data/resources.json" "$CACHE/state.json" <<'PY'
import json
import sys
from pathlib import Path

priority_path, resources_path, state_path = map(Path, sys.argv[1:])
priority_ids = [line.strip() for line in priority_path.read_text(encoding="utf-8").splitlines() if line.strip()]
resources = {item["id"] for item in json.loads(resources_path.read_text(encoding="utf-8"))}
state = json.loads(state_path.read_text(encoding="utf-8")).get("items", {})
remaining = 0
for item_id in priority_ids:
    if item_id not in resources:
        continue
    record = state.get(item_id, {})
    status = record.get("status")
    if status is None or (status in {"no_transcript", "transcript_insufficient"} and not record.get("audioAttempted")):
        remaining += 1
print(remaining)
PY
  )" || priority_remaining="unknown"
  case "$priority_remaining" in
    ''|*[!0-9]*)
      log "WARN	无法判断 priority 队列剩余量，继续使用优先级过滤"
      ARGS+=(--ids-file "$PRIORITY_IDS")
      ;;
    0)
      log "INFO	priority 队列已耗尽，切换到全部 YouTube Work Item"
      ;;
    *)
      ARGS+=(--ids-file "$PRIORITY_IDS")
      ;;
  esac
fi

count_cf() { "$PY" -c "
import json,pathlib
try:
    d=json.loads((pathlib.Path.home()/'.cache/lag-video-content/report.json').read_text())
    print((d.get('totals') or {}).get('channel_failure') or 0)
except Exception:
    print(-1)" 2>/dev/null; }

cf_before="$(count_cf)"
out="$("$PY" scripts/backfill_video_content.py "${ARGS[@]}" 2>&1)"
rc=$?
cf_after="$(count_cf)"
[ "$rc" -ne 0 ] && log "ERROR	脚本退出码 $rc: $(printf '%s' "$out" | tail -1 | cut -c1-160)"

# report.json 里的 totals 是**从 state 累计**的，不是本轮的。
# 直接判 channel_failure > 0 会因为历史上那 41 次失败而永远为真 →
# 任务永久冷却、看起来在跑实际一条不补。所以必须比对运行前后的增量。
# 2026-08-21 dry-run 时抓到，未上线就修掉。
if [ "$cf_after" = "-1" ] || [ "$cf_before" = "-1" ]; then
  blocked="unknown"
elif [ "$cf_after" -gt "$cf_before" ]; then
  blocked="blocked"
else
  blocked="ok"
fi

case "$blocked" in
  blocked)
    echo $(( now + COOLDOWN_SECONDS )) > "$COOLDOWN"
    log "BLOCKED	出现通道类失败，进入 24 小时冷却。详见 $REPORT"
    ;;
  unknown)
    # 读不到报告 ≠ 一切正常。这是「问不到」，必须区别于「没问题」
    log "WARN	读不到 report.json，无法判断是否被封——记为异常，不写冷却"
    ;;
  *)
    stat="$("$PY" -c "
import json,pathlib,collections
s=json.loads((pathlib.Path.home()/'.cache/lag-video-content/state.json').read_text())
c=collections.Counter(v.get('status') for v in s['items'].values())
print(f\"completed={c['completed']} no_transcript={c['no_transcript']} retryable={c['retryable']}\")" 2>/dev/null)"
    log "OK	本轮结束。累计 ${stat:-读取失败}"
    ;;
esac
