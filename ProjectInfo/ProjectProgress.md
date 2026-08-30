# ProjectProgress

> 现状快照，覆盖写，不堆历史。历史看 `roadmap.md` 与 `sessions/`。

*更新于 2026-08-30 14:57:52 +0800 · 记录者 AI*

## 最新检查（2026-08-30 14:57:52）

- 仓库仍为 Private；当前 v0.2 候选未推送、未部署，Pages 不恢复。
- 共享 `collect-resources-about-game` skill 与资源合同已修复为优先使用 NotebookLM viewer 的 `pageAssets.list()` → 精确匹配 → `pageAssets.bundle()` 后台导出；可见 Chrome 下载弹窗只保留为明确失败时的回退。
- `youtube-HAvS-RwkjdA` 的 retry `run-20260830132511-54079` 已进入 ready；旧失败 `run-20260830073426-50030` 仍保留在 `attempt_history`。ready JSON 为 [systems-mechanics](/Users/haodong/Documents/GitHub/AI-Life-Mentor/notebooklm-resources/2026-0830-1413-systems-mechanics.json)。
- 本场在用户确认“持续推进到今日限额”后，按固定顺序新增 4 次 claim，均已留下终态：
  - `youtube-I1yBJD4yRss` / `run-20260830142129-87995`：`asset-download / infographic` failed；
  - `youtube-o02uJ-ktCuk` / `run-20260830143309-96939`：`asset-download / infographic` failed；
  - `youtube-QBAM27YbKZg` / `run-20260830144012-99867`：`asset-download / infographic` failed；
  - `youtube-LuNH9Rz2e2k` / `run-20260830145311-11173`：NotebookLM 明确返回信息图每日配额已满，`quota_block / infographic` failed。
- 前 3 条的共同可核查现象是：目标 viewer 图片未出现在 `pageAssets` 清单，唯一可见下载回退等待 25 秒也没有产生浏览器下载事件或可验证本地文件；没有把卡片、URL 或点击无报错当作成功。
- 终止前只读预检仍返回 `ready_to_claim`：目录 2,454 个候选，本地今日 `claimed_today=7`、`remaining_today=3`；未 claim 的固定候选为 `youtube-5UdVNmbIClM`、`youtube-8uE6-vIi1rQ`、`youtube-XPPtLNkVPWY`。因 NotebookLM 明确信息图配额阻断，未继续消耗本地名额。
- PicGo `autoRename` 已恢复原值 `true`。本场没有新的 ready JSON、上传或发布。

## 现在在哪

- 当前可消费的新 ready 仍只有 [systems-mechanics ready JSON](/Users/haodong/Documents/GitHub/AI-Life-Mentor/notebooklm-resources/2026-0830-1413-systems-mechanics.json)；本场 4 个候选均失败，没有伪造 partial 或 ready。
- 公开来源仍是 [YouTube 视频](https://www.youtube.com/watch?v=HAvS-RwkjdA)；私有 Notebook 工作台地址不写入本项目快照。
- AI-Life-Mentor ready 队列仍停在既有消费者流程之前；本场没有消费 ready、写 PKM、触发 Daily Check-in、创建 Issue、推送或部署。

## 当前阶段

- Chrome 下载弹窗并非唯一出口：HAv retry 已用 page-assets 后台路径取得真实字节，证明可以绕过正在使用的窗口；本场前三条是目标新 viewer 资产未进入清单、回退下载事件也未产出。
- 第四条已触发 NotebookLM 明文信息图配额阻断，按规则停止当天剩余批次；本地 claim 上限尚未耗尽，但服务配额优先。
- 所有已 claim 候选均为 `failed` 或 `ready`，没有遗留 `generating` 状态。

## 下一步

- 等待 NotebookLM 信息图配额恢复后，先做不消耗额度的工作台就绪检查和 preflight；第 5–7 条只能在新的明确授权下继续 claim，旧失败条目只能在再次明确授权并提供准确上一轮 run id 时 retry。
- 后续若继续生产，保留 page-assets 后台导出与实际文件校验；若目标资产再次缺失，按单候选回退一次并记录失败，不把下载弹窗或 viewer URL当作文件。
- 等待既有 AI-Life-Mentor 消费流程按其自身调度消费 ready；保持仓库 Private，不恢复 Pages，不手动触发 PKM、Daily Check-in、Issue、推送或部署。
