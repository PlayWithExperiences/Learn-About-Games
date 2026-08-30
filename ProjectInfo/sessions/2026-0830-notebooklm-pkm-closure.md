# NotebookLM 资源 → PKM 归档闭环

## 1527 交付边界修复

- 决策：無涘 ｜ 记录：AI。所有完成 NotebookLM 内容与资产校验的资源都必须进入 AI-Life-Mentor 的持久化消费队列；本地 `ready` JSON 只是运输态，不是完成，也不是 PKM 归档。
- 根因：AI。共享收集 skill 将远端交付写成可选步骤，定时任务提示又明确排除了推送；AI-Life-Mentor 消费端只读取 `main` 上已跟踪的 inbox 文件，因此本地或未跟踪 ready 不会被 Daily Check-in 看见。
- 实现：AI。更新 `ProjectInfo/ProjectVision.md`、roadmap、NotebookLM 设计 spec、共享 skill 和 resource contract；生产流程现在固定为“本机 ready → 单文件 Git push → 远端路径/blob 回读 → Daily Check-in 每日最多一条 → 幂等 PKM + Issue marker”。生产端不直接写 PKM/Issue。
- 实现：AI。`automation/publish-notebooklm-resource.sh` 在 push 后检查 `origin/main` 的目标路径，并比较远端 blob 与本地 `hash-object`；缺失或不一致时非零退出。Codex 自动化提示已通过应用接口同步为强制交付规则。
- 验证：AI。Learn 自动化 6/6、生产器 16/16、发布脚本 4/4；AI-Life-Mentor 消费端 19/19。新增临时 bare remote 集成测试验证单文件交付后的远端路径和字节一致。
- 风险/边界：AI。AI-Life-Mentor `main` 当前有 12 个已跟踪 ready JSON，另有 9 个本地未跟踪 JSON 尚未进入远端，不能声称已归档 PKM。历史 9 条补交属于独立的多次远端 Git 写入，本场未执行；也没有新的 NotebookLM 调用、重试、Issue 或 PKM 写入。
- 下一步：AI。提交并审查两个隔离分支；若無涘确认补交范围，逐条推送这 9 个历史 JSON 并逐条回读，再由既有 Daily Check-in 按每天 1 篇消费。

原始对话：dialogues/2026-0830.md「1527 PKM 归档闭环修复」
