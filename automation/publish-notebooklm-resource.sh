#!/bin/zsh
set -euo pipefail

usage() {
  echo "用法：$0 --resource-file /absolute/path/to/notebooklm-resources/YYYY-MMDD-HHMM-topic.json" >&2
  exit 2
}

resource_file=""
while [[ $# -gt 0 ]]; do
  case "$1" in
    --resource-file)
      [[ $# -ge 2 ]] || usage
      resource_file="$2"
      shift 2
      ;;
    *)
      usage
      ;;
  esac
done
[[ -n "$resource_file" ]] || usage

ai_root="${LAG_AI_MENTOR_ROOT:-/Users/haodong/Documents/GitHub/AI-Life-Mentor}"
inbox_dir="$ai_root/notebooklm-resources"
[[ -d "$inbox_dir" ]] || { echo "AI-Life-Mentor inbox 不存在：$inbox_dir" >&2; exit 1; }
[[ -f "$resource_file" ]] || { echo "资源 JSON 不存在：$resource_file" >&2; exit 1; }

resource_dir="$(cd "$(dirname "$resource_file")" && pwd)"
resource_name="$(basename "$resource_file")"
inbox_real="$(cd "$inbox_dir" && pwd)"
resource_real="$resource_dir/$resource_name"
case "$resource_real" in
  "$inbox_real"/*.json) ;;
  *) echo "拒绝推送 inbox 之外的文件：$resource_real" >&2; exit 1 ;;
esac

resource_id="$(python3 - "$resource_real" <<'PY'
import json
import sys
from pathlib import Path

path = Path(sys.argv[1])
try:
    value = json.loads(path.read_text(encoding="utf-8"))
except (OSError, json.JSONDecodeError) as exc:
    raise SystemExit(f"资源 JSON 不可读：{path}：{exc}")
if not isinstance(value, dict):
    raise SystemExit("资源 JSON 必须是对象")
if value.get("producer_status") != "ready":
    raise SystemExit("只有 producer_status=ready 的资源可以推送")
resource_id = value.get("resource_id")
if not isinstance(resource_id, str) or not resource_id.strip():
    raise SystemExit("资源缺少 resource_id")
for key in ("content_summary", "boundary", "artifacts", "source"):
    if not value.get(key):
        raise SystemExit(f"资源缺少必填字段：{key}")
print(resource_id)
PY
)"

branch="$(git -C "$ai_root" branch --show-current)"
[[ "$branch" == "main" ]] || { echo "拒绝从非 main 分支推送：$branch" >&2; exit 1; }
git -C "$ai_root" remote get-url origin >/dev/null
if ! git -C "$ai_root" diff --cached --quiet; then
  echo "AI-Life-Mentor 已有暂存改动，拒绝混入资源提交" >&2
  exit 1
fi

relative_path="${resource_real#"$ai_root/"}"
tracked_path="$(git -C "$ai_root" ls-tree -r --name-only HEAD -- "$relative_path")"
resource_already_committed=false
if [[ "$tracked_path" == "$relative_path" ]] && git -C "$ai_root" diff --quiet HEAD -- "$relative_path"; then
  resource_already_committed=true
else
  git -C "$ai_root" add -- "$relative_path"
  staged_paths="$(git -C "$ai_root" diff --cached --name-only)"
  if [[ "$staged_paths" != "$relative_path" ]]; then
    git -C "$ai_root" reset -- "$relative_path" >/dev/null
    echo "暂存文件不是单一目标资源，已停止：$staged_paths" >&2
    exit 1
  fi
fi

if [[ "$resource_already_committed" != true ]]; then
  git -C "$ai_root" commit -m "feat: publish NotebookLM resource $resource_id"
fi
git -C "$ai_root" push origin main
echo "已推送 NotebookLM 资源：$resource_id"
