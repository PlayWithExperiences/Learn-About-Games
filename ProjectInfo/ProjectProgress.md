# ProjectProgress

> 现状快照，覆盖写，不堆历史。历史看 `roadmap.md` 与 `sessions/`。

*更新于 2026-08-31 13:12:28 +0800 · 记录者 AI*

## 最新检查（2026-08-31 13:12:28）

- 仓库仍为 Private；当前 v0.2 候选未推送、未部署，Pages 不恢复。
- 共享 `collect-resources-about-game` skill 与资源合同仍优先使用 NotebookLM viewer 的 `pageAssets.list()` → 精确匹配 → `pageAssets.bundle()` 后台导出；本轮新增的闭环规则要求每个本地 `ready` JSON 必须经单文件 Git 交付并完成远端路径/blob 回读。
- `automation/publish-notebooklm-resource.sh` 已加入 push 后的远端回读：`origin/main` 必须包含目标 inbox 路径，且远端 blob 必须与本地 JSON 的 `hash-object` 一致；失败时非零退出，不再把 push 响应或本地文件当作成功证据。
- 共享 skill、资源合同、`ProjectVision.md`、NotebookLM 设计 spec 与 roadmap 已明确：`ready` 只是运输态，远端交付成功才进入 AI-Life-Mentor 消费队列，PKM 最终笔记仍由 Daily Check-in 消费端写入。
- Codex 自动化 `learn-about-games-notebooklm` 已通过应用自动化接口更新：每个成功 ready 都必须交付，自动化不直接创建 Issue/写 PKM，也不批量补交历史本地文件。
- Learn 端新增的交付合同测试使用临时 bare remote 验证了单文件 push、远端路径存在和精确 blob 一致；自动化 6/6、生产器 16/16、发布脚本 4/4 通过。AI-Life-Mentor 消费端回归 19/19 通过。
- 经明确授权的历史补交，9 个 ready JSON 已逐条推送到 AI-Life-Mentor `origin/main` 并完成 PKM/marker 写回；全量 20 个资源 JSON（另有 1 个 README）复核为 20/20 PKM 正文、20/20 marker。19 条与当前规范一致，1 条旧版但身份/来源/marker 有效。
- 2026-08-31 新增首条候选 `youtube-8uE6-vIi1rQ`，`generation_run_id=run-20260831122057-23447` 已进入 producer `ready`，并交付 `AI-Life-Mentor/notebooklm-resources/2026-0831-1308-design-fundamentals.json`；AI-Life-Mentor 远端 ready JSON 现为 21 条，新增条目尚未进入 PKM/marker 消费。
- 本轮四个 NotebookLM 产物均有实际字节并完成远端哈希回读：信息图 2752×1536 PNG；思维导图 2200×4000 PNG，51 节点/4 层/0 折叠；PPTX 13 个 slide XML；PDF 13 页。PicGo 保持用户要求的 `autoRename=true`，所以资产名是时间戳形式，未满足 `YYYYMMDDHHMMSS-topic-artifact.ext` 命名硬约束；该例外已写入运行报告，未继续下一候选。

## 现在在哪

- 闭环修复已合并到 Learn-About-Games `main`（本地 `93ba5b2`），没有改变网站公开状态；Learn `main` 仍不推送、不部署。
- AI-Life-Mentor `origin/main` 当前有 21 个已跟踪 ready JSON；此前 20 条已消费资源仍有 20/20 PKM 正文、20/20 marker，新交付的 `youtube-8uE6-vIi1rQ` 尚未消费。更早的 11 条中，10 条与当前规范一致、1 条保留旧版正文但身份/marker 有效。
- 普通消费者仍遵循“远端 ready → 每日最多一条 → 幂等 PKM 资源笔记 → Daily Check-in marker”；本次 9 条是经单独确认的历史补交，串行执行、无重试，不改变日常生产上限。
- 公开来源仍是 [YouTube 视频](https://www.youtube.com/watch?v=HAvS-RwkjdA)；私有 Notebook 工作台地址不写入本项目快照。

## 当前阶段

- 生产闭环的断点已定位并修复：过去的 skill/自动化把 ready 队列当作终点，导致只落本地或未跟踪 JSON 时 GitHub Actions 根本看不见资源。
- 现在分为三段并各自可验证：NotebookLM/资产校验 → 单文件远端交付与 blob 回读 → Daily Check-in 写 PKM/Issue；任何一段失败都不再伪装成下一段成功。
- 本轮完成了首条新资源的 NotebookLM 生成、资产/远端哈希验证、ready 写入和单文件远端交付；未写 PKM、未创建 Daily Check-in marker、未推送 Learn-About-Games 或部署网站。由于用户要求不改 PicGo 设置而产生命名约束冲突，已停止本批下一候选。

## 下一步

- 继续保持 Learn-About-Games Private，不推送本地候选、不恢复 Pages；AI-Life-Mentor 保留 21 条 ready JSON，其中新增首条等待消费，旧版但身份/marker 有效的 1 条继续不覆盖。
- 后续新资源必须在 ready 之后逐条交付并完成远端路径/blob 回读；普通 Daily Check-in 继续按每天 1 篇消费，PKM 写入和 Issue marker 均成功后才算 `consumed`。
- 在用户未改变“不改 PicGo 设置”的约束前，不继续领取固定清单下一候选；需先决定不改设置前提下的合规命名托管路径。NotebookLM 信息图配额恢复后仍沿用后台页面资产导出和强制远端交付规则；保持仓库 Private，不公开部署。
