# notebooklm-empty-queue

> 按主题一份，追加不覆盖；同一场会话的节就地更新。

## 1034 排查 NotebookLM 队列报错并制定修复计划

决策：無涘 ｜ 记录：codex（自动）｜ session 01a03195-9a08-7001-b1c4-c722da0d65ed

用户反馈 daily checkin 报错「无可消耗 notebooklm 内容」。AI 排查确认根因：资源 `youtube-hTNA84vJNEc` 已写入 Issue #183，消费扫描正确识别为已消费，但 `attach_notebooklm_resource()` 只处理「目录为空」的正常跳过，未处理「资源全部已消费」的情况，导致 `NoNotebookLMResource` 异常被抛成 workflow failure（Issue #184，run 32681846088）。今日 Producer 任务在资产下载阶段失败、未生成 ready JSON，是独立问题，非本次报错主因。诊断已留痕三份项目档案，本地提交 8d2468b，消费逻辑未修改。用户要求彻底修复，并将每日生产量从 1 提升至 10，充分利用 Plus 额度（目标消耗 80%）。AI 核实官方配额：Plus 含 200 chats/day、6 audio/day、6 video/day、20 reports/flashcards/quizzes/mind maps per day，日报/信息图/幻灯片无公开固定上限。每日 10 条资源在 chats/mind maps/reports 维度仅占 50%，非 80%。任务已拆分为消费端恢复语义 + producer 批量生产两个子系统，采用 TDD 先写红测，尚未启动真实 NotebookLM 生产。

原始对话：dialogues/2026-0824.md「1034 notebooklm-empty-queue」

## 1056 消费端恢复与 NotebookLM 每日十条上限

决策：無涘 ｜ 记录：codex（自动）｜ session 01a03195-9a08-7001-b1c4-c722da0d65ed

结论：本次 Check-in 报错与 producer 下载失败是两个独立问题。消费端根因是 ready 资源存在但全部被 marker 消费后，`pick_resource()` 抛出的 `NoNotebookLMResource` 没有在 `attach_notebooklm_resource()` 上层处理；已改为可观察 no-op，保持远端消费查询、资源校验和 PKM 写回失败显式失败。producer 的下载失败不应生成 ready JSON，正确产物是 ledger 中带 phase/reason 的 terminal failed。

实现：`scripts/notebooklm_producer.py` 增加只读 `preflight --limit 10`，按 catalog 顺序返回最多十条候选；`claim --resource-id` 保证批次按预检对象精确占用；锁内按北京时间自然日计数所有 claim（包括失败），第 11 次拒绝，状态区分 `no_candidate` 与 `daily_limit_reached`。Skill、preflight shell 和 Codex cron 同步为最多十条、串行、自动重试为零；失败写账后继续 distinct candidate，并要求真实 download event + 字节/类型/尺寸校验。

验证：Learn-About-Games producer 14/14、automation 3/3；AI-Life-Mentor NotebookLM 15/15；两边 Python 编译检查通过。当前真实 ledger 今日有 2 次 claim：`youtube-hTNA84vJNEc` ready，`youtube-E4ZUgPoDrvY` asset-download failed；只读 preflight 返回 8 条剩余候选，本轮未调用 NotebookLM、未上传 PicGo、未 push。

配额边界：官方 Plus 表可核实 200 chats/day、20 reports/day、20 flashcards/day、20 quizzes/day、20 mind maps/day，信息图/幻灯片固定额度未公开；不能从本机得到账号当前用量或诚实宣称已消耗 80%。每日十条是这条自动化的安全上限与目标，不把未知的 Plus 额度当作可用余额。

原始对话：dialogues/2026-0824.md「1056 NotebookLM 消费恢复与每日批量上限修复」
