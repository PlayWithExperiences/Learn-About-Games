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

## 1558 历史资源合并并回写 PKM

- 决策：無涘 ｜ 记录：AI。确认合并修复并回写 PKM；范围锁定为此前 9 个本地未跟踪 ready JSON，不重新调用 NotebookLM、不扩大候选、不重试。
- 产出：AI。9 条资源逐条经 `publish-notebooklm-resource.sh` 推送到 AI-Life-Mentor `main`，随后通过现有消费桥接写入 9 个规范 PKM 资源笔记并补齐 9 个 Daily Check-in marker。
- 验证：AI。远端路径/blob 9/9、PKM 正文 9/9、Daily Check-in marker 9/9；AI-Life-Mentor 远端 `notebooklm-resources/` 共 21 个已跟踪 JSON，9 个资源不再是 untracked。自动化 6/6、生产器 16/16、发布合同 4/4、消费端 19/19 通过。
- 纠偏：AI。第一次 PKM 反向核验误把资源文件名直接当 API 路径，产生“首条缺失”的校验器假警报；改用 `resource_note_path()` 后 9/9 通过，未修改或重写任何 PKM 内容。
- 边界：AI。Learn-About-Games 修复已合并到本地 `main`，仓库仍 Private，未推送网站、未恢复 Pages；AI-Life-Mentor 资源提交已推到远端，用户原有的 `.claude/trace-health.json` 与对话脏改动保持未提交。

原始对话：dialogues/2026-0830.md「1558 合并并回写 PKM」

## 1606 全量对账纠偏

- 核查：AI。对 AI-Life-Mentor `origin/main` 的资源目录做全量盘点时发现，之前的“21 个资源”统计把 `README.md` 也计入了；实际为 20 个 JSON。
- 结果：AI。20 个 JSON 中，16 个 PKM 正文与当前规范完全一致，1 个更早的 PKM 正文虽为旧版但资源身份与 marker 有效，3 个更早资源缺 PKM 正文且缺 marker。
- 边界：AI。本场不覆盖旧版有效笔记，也不在未确认新增范围前补写这 3 条；此前明确授权的 9 条仍保持远端/PKM/marker 9/9。

原始对话：dialogues/2026-0830.md「1606 全量对账纠偏」

## 1617 补齐历史 PKM 缺口

- 决策：無涘 ｜ 记录：AI。确认把全量盘点出的 3 条历史缺口补回 PKM；范围只包含 `youtube-_gbJw7orSI8`、`youtube-7rqfbvnO_H0`、`youtube-GZ99gAb4T0o`，串行执行、零重试。
- 产出：AI。3 条均通过现有消费桥接写入 PKM 资源正文并追加 Daily Check-in marker；未调用 NotebookLM、模型、Chrome 下载或 PicGo。
- 验证：AI。全量 20 个资源 JSON 现为 20/20 PKM 正文、20/20 marker；其中 19 条与当前规范一致，Celeste 1 条保留旧版但身份/来源/marker 有效。消费者回归 19/19 通过。

原始对话：dialogues/2026-0830.md「1617 补齐历史 PKM 缺口」
