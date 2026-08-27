# NotebookLM 重置与 Daily Check-in 触发机制

## 1237 配额窗口与两段自动化链路

- 决策：無涘 ｜ 记录：AI。对 NotebookLM 配额重置时间和 Daily Check-in 触发机制做只读核对；不手动 dispatch、不重试、不改变调度配置、不额外消耗配额。
- 官方事实：AI。Google 官方配额说明只写 daily quotas 在 24 小时后重置、monthly quotas 在 30 天后重置，没有给出固定时区或当前账号的精确重置时刻。Plus 的信息图与 Slide Deck 配额只显示 `More limits`，没有公开固定数量；本地 producer 的每日 10 次是内部 claim 上限，不等同于 NotebookLM 官方信息图配额。
- 本次观测：AI。最近一次明确的 NotebookLM 信息图配额拦截发生在 2026-08-27 07:36:40（北京时间）。因此 2026-08-28 07:36:40 后只能作为保守的首次不消耗额度探测点，不能写成 Google 保证的重置时刻；若仍被拦截，说明服务端按资产类别或更长窗口计算。
- 触发链路：AI。Codex 本机 producer `learn-about-games-notebooklm` 每天约 07:30（北京时间）先做不消耗额度的 preflight，再串行 claim/生产并把验证通过的 JSON 放入 AI-Life-Mentor ready 队列；今天 07:33 已触发，但 07:36:40 因配额停止。AI-Life-Mentor 的 GitHub Actions `Daily Check-in` 由 `.github/workflows/daily-checkin.yml` 的 `30 0 * * *`（UTC，即北京时间 08:30）独立触发，另有 `workflow_dispatch` 手动入口。
- 消费条件：AI。Daily Check-in 运行后先生成主 Check-in，再扫描远端历史 Issue marker 和 ready-only 队列，确定性消费 1 条未消费资源，写入 PKM 并创建 Issue；没有 ready 是正常 no-op，仍可创建普通 Check-in。查询/API/PKM 写回失败则应留下可见失败状态。
- 今日边界：AI。截至 2026-08-27 12:37，GitHub API 显示该 workflow 当日 run 数为 0；workflow 与仓库 Actions 仍 active/enabled，远端仍有 5 条未消费 ready。因此今天没收到 Check-in 不能归因于“无可消费内容”，而是消费者 scheduled event 尚未创建/排队；本次未手动补跑，避免未经确认触发模型/API调用。

原始对话：dialogues/2026-0827.md「1235 NotebookLM 重置与 Daily Check-in 触发机制」

## 1255 双路径单次验证

- 决策：無涘 ｜ 记录：AI。按用户要求把 producer 收集与 Daily Check-in 消费分开各验证一次；producer 不批量重试，consumer 只 dispatch 一次。
- 生产：AI。12:46:51 claim `youtube-_sslFBVy5Lc`，复用长期 Notebook 导入并隔离唯一来源，文字总结完成；页面仍显示信息图每日配额上限，12:50:19 记为 `quota_block` failed，未调用其他 Studio 资产、未生成半成品 ready。
- 消费：AI。先以 TDD 增加无 ready 正文提示，17/18 个消费者单测分别在修复前失败、修复后通过；随后加入同日成功 Issue 幂等检查，避免手动 dispatch 与迟到 schedule 重复调用模型。修复已推送 AI-Life-Mentor `main`（最终远端 `dbf50ee`）。
- 验证：AI。手动 dispatch `33040627453` 成功（head `3f86ee9`），创建 Issue #187（`每日学习 · 2026-08-27`），消费 `youtube-XW7KvppTspc`。本次没有第二个 dispatch。
- 边界：AI。workflow YAML 的 `concurrency` 增强因当前 OAuth 凭据缺少 `workflow` scope 被撤回，未擅自扩大权限；Python 幂等检查已在远端生效。今日无 ready 分支已由单测覆盖，真实 run 因队列有内容走的是正常消费分支。

原始对话：dialogues/2026-0827.md「1240 双路径收集与消费验证」
