# ProjectProgress

> 现状快照，覆盖写，不堆历史。历史看 `roadmap.md` 与 `sessions/`。

*更新于 2026-08-30 15:31:56 +0800 · 记录者 AI*

## 最新检查（2026-08-30 15:31:56）

- 仓库仍为 Private；当前 v0.2 候选未推送、未部署，Pages 不恢复。
- 共享 `collect-resources-about-game` skill 与资源合同仍优先使用 NotebookLM viewer 的 `pageAssets.list()` → 精确匹配 → `pageAssets.bundle()` 后台导出；本轮新增的闭环规则要求每个本地 `ready` JSON 必须经单文件 Git 交付并完成远端路径/blob 回读。
- `automation/publish-notebooklm-resource.sh` 已加入 push 后的远端回读：`origin/main` 必须包含目标 inbox 路径，且远端 blob 必须与本地 JSON 的 `hash-object` 一致；失败时非零退出，不再把 push 响应或本地文件当作成功证据。
- 共享 skill、资源合同、`ProjectVision.md`、NotebookLM 设计 spec 与 roadmap 已明确：`ready` 只是运输态，远端交付成功才进入 AI-Life-Mentor 消费队列，PKM 最终笔记仍由 Daily Check-in 消费端写入。
- Codex 自动化 `learn-about-games-notebooklm` 已通过应用自动化接口更新：每个成功 ready 都必须交付，自动化不直接创建 Issue/写 PKM，也不批量补交历史本地文件。
- Learn 端新增的交付合同测试使用临时 bare remote 验证了单文件 push、远端路径存在和精确 blob 一致；自动化 6/6、生产器 16/16、发布脚本 4/4 通过。AI-Life-Mentor 消费端回归 19/19 通过。
- 历史生产事实不变：`youtube-HAvS-RwkjdA` 的 retry `run-20260830132511-54079` 已进入 ready；今日累计 claim=7、remaining_today=3；信息图配额阻断后的 3 条候选未 claim。

## 现在在哪

- 修复分支上的闭环实现与测试已通过；尚未合并到 Learn-About-Games `main`，也没有改变网站公开状态。
- AI-Life-Mentor `main` 上当前有 12 个已跟踪 ready JSON；另有 9 个本地 ready JSON 仍为未跟踪文件，因此它们尚未进入 GitHub Actions 可见的消费队列，更不能声称已归档 PKM。
- 当前消费者代码已具备“远端 ready → 每日最多一条 → 幂等 PKM 资源笔记 → Daily Check-in marker”的路径；本轮没有直接创建 Issue、写 PKM 或触发 Daily Check-in。
- 公开来源仍是 [YouTube 视频](https://www.youtube.com/watch?v=HAvS-RwkjdA)；私有 Notebook 工作台地址不写入本项目快照。

## 当前阶段

- 生产闭环的断点已定位并修复：过去的 skill/自动化把 ready 队列当作终点，导致只落本地或未跟踪 JSON 时 GitHub Actions 根本看不见资源。
- 现在分为三段并各自可验证：NotebookLM/资产校验 → 单文件远端交付与 blob 回读 → Daily Check-in 写 PKM/Issue；任何一段失败都不再伪装成下一段成功。
- 本轮只做本地合同、脚本、文档和自动化配置修复，没有新的 NotebookLM claim、重试、PicGo 上传或远端资源补交。

## 下一步

- 先审查并提交两个 worktree 的修复分支；不自动合并、推送 Learn-About-Games 或恢复 Pages。
- 若要补交现有 9 个本地未跟踪 ready JSON，需单独确认“9 次单文件远端 Git 写入”范围；执行时逐条运行交付脚本、回读路径/blob，并保留其他脏文件不混入提交。
- 补交完成后，等待既有 AI-Life-Mentor Daily Check-in 按每天 1 篇的上限消费；PKM 写入和 Issue marker 均成功后才算对应资源 `consumed`。
- NotebookLM 信息图配额恢复后，新的生产运行沿用后台页面资产导出和本次强制远端交付规则；保持仓库 Private，不公开部署。
