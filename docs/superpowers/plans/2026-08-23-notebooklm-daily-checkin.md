# NotebookLM 学习资源到 Daily Check-in / PKM 实验计划

> 日期：2026-08-23 · 记录者：AI · 决策人：無涘

## 目标与边界

把一条已经由 NotebookLM 人工生成的学习资源结果接入 Daily Check-in，并将同一份完整文字版内容写入 `PKM/PlayWithExperiences/AI/Learn-About-Games/`。本轮只验证今天的《Designing Celeste》一条，不批量调用模型，不调用 OpenRouter，不购买订阅或触发任何付费操作。

Learn About Games 只隐藏现有资源短摘要的直接展示，不删除资源数据、不改变搜索所用字段、不把 NotebookLM 私有链接当作公开网站媒体资产。

## 实施步骤

1. 在 Learn-About-Games worktree 运行现有单测、类型检查和必要的构建基线；在 AI-Life-Mentor worktree 检查脚本可编译。记录任何先存失败，不把它们归因给本轮改动。
2. 先修改资源 E2E 契约，使资源详情不再出现“内容摘要”，但仍能看到访问版本入口；运行定向测试取得 RED。随后只移除 `ResourceResults.astro` 中资源短摘要的公开展示，保留 schema、目录数据、搜索字段和访问版本，并用定向测试与 Astro check 验证。
3. 在 AI-Life-Mentor 增加 `scripts/notebooklm_line.py`：读取已落盘的 NotebookLM 资源 JSON，区分文件缺失、空队列、格式错误和已消费状态；按 `YYYY-MMDD-HHMM-TOPIC` 形成稳定标题，渲染来源、信息图、思维导图、演示文稿和按内容密度决定篇幅的文字总结，并在正文末尾保留“来源未覆盖或无法确认的边界”。先用离线单测覆盖正常渲染、缺失/空/无效输入和重复消费。
4. 扩展 `scripts/pkm_daily_note.py`，通过现有 PKM Contents API 写入固定目录 `PlayWithExperiences/AI/Learn-About-Games/`，采用稳定文件名和幂等读取/更新规则；不记录 token 或响应中的凭据。将 NotebookLM 资源线接入 `scripts/daily_checkin.py`，作为现有信息/提问正文后的额外区块；没有待推送资源时不伪造成功，格式错误或写回失败必须留下可观察错误。
5. 增加一次性推送脚本，允许在不重新调用 OpenRouter 的前提下把指定 NotebookLM 资源追加到当天已有 Daily Check-in Issue；若当天 Issue 不存在才创建一个明确标注的资源线 Issue。资源写入 PKM 后再形成带 PKM 路径的 Daily Check-in 区块，并以资源 marker 保证重跑不重复。
6. 通过已登录的 NotebookLM 浏览器页为《Designing Celeste》分别尝试信息图、思维导图和中文详细演示文稿，使用既有完整中文总结作为文字部分；只保存成功产物的可验证链接/下载状态，清除 NotebookLM 自带的营销附文，不把不可访问的私人链接宣称为公开资产。
7. 用该 Celeste fixture 执行一次真实 PKM / Daily Check-in 写回，检查资源 marker、标题格式、来源、四类产物字段、总结和边界说明；回读目标文件/Issue 验证不是仅返回 job id 或 HTTP 200 的假成功。
8. 运行 Learn-About-Games 的 `npm run check`、`npm test`、`npm run build` 和相关 E2E；运行 AI-Life-Mentor 的 Python 编译/离线单测；扫描 diff 中的 secrets 与 `git diff --check`。更新项目进展、会话摘要和原始对话留痕，分别提交两个 worktree；不自动推送或公开 Pages。

## 验收标准

- Learn About Games 资源详情不再公开渲染已有 AI 短摘要，访问版本仍可用，资源筛选和搜索不回归。
- Daily Check-in 原有信息与提问保留，并在其后出现一条 NotebookLM 资源区块。
- Celeste 资源区块标题符合 `YYYY-MMDD-HHMM-TOPIC`，总结是连续的文字版内容总结而非短摘要或逐字稿，末尾明确来源边界。
- PKM 目标目录出现对应 Markdown 文件；文件内容与 Daily Check-in 资源区块一致或可追溯，重复执行不会生成重复文件/区块。
- 本轮真实外部调用只有用户已明确授权的单条 NotebookLM 试验；没有新增 OpenRouter 调用、付费模型、订阅或批量任务。
