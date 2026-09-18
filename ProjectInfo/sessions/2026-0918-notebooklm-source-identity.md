# NotebookLM 每日生产

## 0738 NotebookLM 每日生产：来源身份误匹配，已停止

决策：無涘（既有每日 10 次上限、串行 1、自动重试 0 授权） ｜ 记录：Codex ｜ 2026-09-18T10:09:00.609192+08:00

- preflight ready_to_claim，初始 claimed_today 0，候选 10；浏览器已登录、来源/Studio 可读、存在启用的对话输入框、deck 可立即生成。ledger 无遗留 generating。
- attempted 1 / ready 0 / remote_delivered 0 / failed 1 / skipped 9 / remaining_today 9；run_failed 1。NotebookLM 总结与资产生成请求 0。
- youtube-lnnsDi7Sxq0 / run-20260918100021-62538：候选 Classic Game Postmortem: Ultima Online 被现有 source_identity_ok 错误匹配为 Classic Game Postmortem: 'Star Wars Galaxies'，在来源隔离阶段终止运行器及其子进程，并通过 producer fail 留痕。
- 本地直接调用 --identity-check 复现返回 true；候选 5 个有效词中共同模板词 classic/game/postmortem 占 3 个，恰好达到 0.6 阈值。标题词重叠不能证明来源身份。系统性缺陷未修复，本批停止，不继续消耗 claim。
- 未重试失败条目、上传、写 ready、资源远端交付、补交历史、写 PKM、建 Issue 或触发 Daily Check-in。现有浏览器由更早会话启动，未关闭；工作区已有未提交适配器改动，未覆盖或混入本轮提交。
- 证据：/Users/haodong/.local/state/learn-about-games/notebooklm-daily/runs/2026-09-18T0738-automation/preflight.json、studio.json、item-1.log、report.json。后续先修正并验证来源身份校验，再恢复新的普通候选；本条 failed 不得自动重跑。

session 01a0b1bc-752d-79a0-815e-36839a205fb4
trace-user-count: 1

原始对话：dialogues/2026-0918.md「0738 NotebookLM 每日生产」。
