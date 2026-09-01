# ProjectProgress

> 现状快照，覆盖写，不堆历史。历史看 `roadmap.md` 与 `sessions/`。

*更新于 2026-09-01 12:42:13 +0800 · 记录者 AI*

## 最新检查（2026-09-01 12:42:13 +0800）

- 仓库仍为 Private；当前 v0.2 候选未推送、未部署，Pages 不恢复。
- 共享 `collect-resources-about-game` skill 与资源合同仍优先使用 NotebookLM viewer 的 `pageAssets.list()` → 精确匹配 → `pageAssets.bundle()` 后台导出；本轮新增的闭环规则要求每个本地 `ready` JSON 必须经单文件 Git 交付并完成远端路径/blob 回读。
- `automation/publish-notebooklm-resource.sh` 已加入 push 后的远端回读：`origin/main` 必须包含目标 inbox 路径，且远端 blob 必须与本地 JSON 的 `hash-object` 一致；失败时非零退出，不再把 push 响应或本地文件当作成功证据。
- 共享 skill、资源合同、`ProjectVision.md`、NotebookLM 设计 spec 与 roadmap 已明确：`ready` 只是运输态，远端交付成功才进入 AI-Life-Mentor 消费队列，PKM 最终笔记仍由 Daily Check-in 消费端写入。
- Codex 自动化 `learn-about-games-notebooklm` 已通过应用自动化接口更新：每个成功 ready 都必须交付，自动化不直接创建 Issue/写 PKM，也不批量补交历史本地文件。
- Learn 端新增的交付合同测试使用临时 bare remote 验证了单文件 push、远端路径存在和精确 blob 一致；自动化 6/6、生产器 16/16、发布脚本 4/4 通过。AI-Life-Mentor 消费端回归 19/19 通过。
- 经明确授权的历史补交，9 个 ready JSON 已逐条推送到 AI-Life-Mentor `origin/main` 并完成 PKM/marker 写回；全量 20 个资源 JSON（另有 1 个 README）复核为 20/20 PKM 正文、20/20 marker。19 条与当前规范一致，1 条旧版但身份/来源/marker 有效。
- 2026-08-31 新增首条候选 `youtube-8uE6-vIi1rQ`，`generation_run_id=run-20260831122057-23447` 已进入 producer `ready`，并交付 `AI-Life-Mentor/notebooklm-resources/2026-0831-1308-design-fundamentals.json`；AI-Life-Mentor 远端 ready JSON 现为 21 条，新增条目尚未进入 PKM/marker 消费。
- 本轮四个 NotebookLM 产物均有实际字节并完成远端哈希回读：信息图 2752×1536 PNG；思维导图 2200×4000 PNG，51 节点/4 层/0 折叠；PPTX 13 个 slide XML；PDF 13 页。PicGo 保持用户要求的 `autoRename=true`，所以资产名是时间戳形式，未满足 `YYYYMMDDHHMMSS-topic-artifact.ext` 命名硬约束；该例外已写入运行报告，未继续下一候选。
- 2026-08-31 适用日期的下一轮自动化再次遇到真实时间戳冲突：开发者基线日期要求按 `2026-08-31` 记账，但本机系统时钟与 producer 在 claim/fail/report 中写出 `2026-09-01T07:34:41+08:00`、`2026-09-01T07:54:05+08:00` 与 `2026-09-01 07:54:15 +0800`。这不是“今天”的正常值，而是 future timestamp mismatch。
- 本轮固定候选首条为 `youtube-XPPtLNkVPWY`（`Game Design Tools: For When Spreadsheets and Flowcharts Aren't Enough`），`generation_run_id=run-20260901073441-38822`。NotebookLM 浏览器预检通过，单来源隔离成功，中文总结完成并包含明确 boundary；信息图通过 viewer `pageAssets.bundle()` 导出为真实 PNG `2752×1536`，SHA-256 `c30ffc9341bb6144edb506ff416fbbe67cc5ff70b162cf900799b127b37d101e`。
- 同一候选未能闭环到 `ready`：浏览器运行时在思维导图配置页连续超时/重置，无法完成“生成”点击，且页面没有返回 NotebookLM 侧“已准备就绪”或明确配额文案。producer 已在 `mind-map-generation` 阶段落账为 `failed`；无 ready JSON、无 PicGo 上传、无远端交付。
- post-fail preflight 显示 `claimed_today=1`、`remaining_today=9`，下一条 distinct 候选为 `youtube-s_I07Iq_2XM`（`'Into the Breach' Design Postmortem`）。
- 2026-09-01 11:47:53 本轮只读 preflight 成功：目录仍有 2,454 个候选，固定清单返回 9 条，`claimed_today=1`、`remaining_today=9`；首条仍为 `youtube-s_I07Iq_2XM`。原始 JSON 与运行报告已保存到 producer 状态目录。
- claim 前浏览器就绪检查明确失败：NotebookLM 首页重定向至 Google 登录页，未取得已登录、可编辑工作台以及来源面板/Studio 控件证据。按合同记录为运行级 `browser-notebook-access: unavailable`，本轮未 claim、未新增候选失败、未调用 NotebookLM、未生成/上传/发布 ready。
- 2026-09-01 12:42:13 纠正浏览器范围：11:47 检查的是 Codex 内置浏览器；Chrome 扩展中的既有 `Gemini Notebook` 工作台实际可用。新 Chrome 标签页的 DOM 已确认来源面板、添加来源、对话和 Studio 的信息图/思维导图/演示文稿控件均存在；当前状态为 `browser-notebook-access=available`。
- 纠正后仍未 claim：本轮只是复核通道并等待手动批次授权，9 条固定候选暂记为 `deferred`，不是 `failed`；新的 fallback 运行报告已保存到 producer 状态目录。

## 现在在哪

- 闭环修复已合并到 Learn-About-Games `main`（本地 `93ba5b2`），没有改变网站公开状态；Learn `main` 仍不推送、不部署。
- AI-Life-Mentor `origin/main` 当前有 21 个已跟踪 ready JSON；此前 20 条已消费资源仍有 20/20 PKM 正文、20/20 marker，新交付的 `youtube-8uE6-vIi1rQ` 尚未消费。更早的 11 条中，10 条与当前规范一致、1 条保留旧版正文但身份/marker 有效。
- 普通消费者仍遵循“远端 ready → 每日最多一条 → 幂等 PKM 资源笔记 → Daily Check-in marker”；本次 9 条是经单独确认的历史补交，串行执行、无重试，不改变日常生产上限。
- 公开来源仍是 [YouTube 视频](https://www.youtube.com/watch?v=HAvS-RwkjdA)；私有 Notebook 工作台地址不写入本项目快照。
- 当前最新失败条目不是“无候选”也不是“配额耗尽”，而是浏览器提交链路不稳定：总结和信息图成功，思维导图提交未完成，producer 已准确留为 `failed`。
- 本轮新增阻塞发生在 claim 前的访问门槛，和上一轮已 claim 的思维导图失败分开记账；9 条固定候选均为 `skipped`，不是候选级 `failed`。
- 上述 11:47 的“访问门槛阻塞”仅针对当时选中的 Codex 内置浏览器；Chrome fallback 已取得工作台可用证据，当前真正的下一门槛是用户确认生产范围，不再把两套浏览器状态混为一谈。

## 当前阶段

- 生产闭环的断点已定位并修复：过去的 skill/自动化把 ready 队列当作终点，导致只落本地或未跟踪 JSON 时 GitHub Actions 根本看不见资源。
- 现在分为三段并各自可验证：NotebookLM/资产校验 → 单文件远端交付与 blob 回读 → Daily Check-in 写 PKM/Issue；任何一段失败都不再伪装成下一段成功。
- 本轮完成了首条新资源的 NotebookLM 生成、资产/远端哈希验证、ready 写入和单文件远端交付；未写 PKM、未创建 Daily Check-in marker、未推送 Learn-About-Games 或部署网站。由于用户要求不改 PicGo 设置而产生命名约束冲突，已停止本批下一候选。
- 当前失败模式进一步收缩到 NotebookLM 浏览器交互本身：在 summary 和 infographic 已经拿到实证后，mind-map creation 仍可能因控制内核超时而停在配置页，导致无法继续到 `ready`。这属于真实通道失败，不得伪装成 `no_candidate`、`quota_block` 或成功 ready。

## 下一步

- 继续保持 Learn-About-Games Private，不推送本地候选、不恢复 Pages；AI-Life-Mentor 保留 21 条 ready JSON，其中新增首条等待消费，旧版但身份/marker 有效的 1 条继续不覆盖。
- 后续新资源必须在 ready 之后逐条交付并完成远端路径/blob 回读；普通 Daily Check-in 继续按每天 1 篇消费，PKM 写入和 Issue marker 均成功后才算 `consumed`。
- 在用户未改变“不改 PicGo 设置”的约束前，不继续领取固定清单下一候选；需先决定不改设置前提下的合规命名托管路径。NotebookLM 信息图配额恢复后仍沿用后台页面资产导出和强制远端交付规则；保持仓库 Private，不公开部署。
- 下一轮若继续生产，先复核两个前置条件：`2026-09-01` 系统时钟为何落在适用日期 `2026-08-31` 之后；NotebookLM mind-map 提交为何在配置页连续超时/重置。未解决前，不应把后续失败归因到内容本身或候选本身。
- 若要继续本批，先明确确认最多 10 条、逐条串行、并发 1、自动重试 0，以及当前 NotebookLM/已配置上传器服务边界；确认后从固定清单首条 `youtube-s_I07Iq_2XM` 开始，不重复 preflight 或改换候选。
