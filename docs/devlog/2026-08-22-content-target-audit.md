---
title: Devlog 016：成长资源与 Innovation Atlas 目标审计
---

# Devlog 016：成长资源与 Innovation Atlas 目标审计

2026-08-22

本轮没有继续为了“1000 条”盲目扩充目录，而是把数量基准转成可观察合同。当前 `codex/v02` 目录包含 44 个 Source、5437 个 Work Item、5590 个 Access Version、84 个 Atlas 节点、86 条关系和 76 项 Evidence；5437 个 Work Item 的规范化 canonical URL 为 5437 个唯一值。每条资源都有至少一个 Access Version 和一个 Resource Topic，目录没有引入评分、排名、精选或强制学习顺序。

新增 `auditAtlasRoutes()` 纯函数与 `scripts/audit-content-targets.mjs` 只读报告。路线完整性要求事件节点、相邻有向演进关系、每个链上事件的承载作品、事件／关系 Evidence 闭包，以及合法的起始／结束事件角色；报告遇到文件读取或 JSON 解析失败时退出非零，不把问不到伪装成空结果。

按该合同，当前至少有四条完整路线：

- FPS：`fps-early-networked-space → first-person-shooter-perspective → fps-texture-mapped-first-person → fps-fast-run-and-gun → fps-vertical-space-combat → fps-open-modding-and-deathmatch`
- RPG：`rpg-party-and-quest-identity → rpg-procedural-character-risk → rpg-real-time-action-progression → rpg-cross-run-narrative-continuity`
- RTS：`rts-resource-and-base-production → rts-direct-unit-control → rts-worker-economy-feedback → rts-global-faction-counterplay`
- Open World：`open-world-systemic-rules → open-world-self-directed-goals → open-world-physics-and-climb`

早期电子游戏、冒险、益智冒险没有事件节点；Metroidvania 与 Platform 当前只有单个事件；Roguelike 虽有事件节点，但当前最长候选链没有同时满足合法起始／结束角色。它们保持明确未闭合状态，不因年代相邻、共同标签或名称相似补关系。没有新的来源证据支持本轮修复，因此没有改写 Atlas 数据。

验证结果：独立 clone 的 `npm run check` 为 0 errors／warnings／hints；目标路线、资源契约与 catalog validator 58/58 通过；全量 Vitest 203/203；静态构建生成 150 pages。完整 Playwright 为 255 passed、7 failed、22 skipped。7 项失败集中在既有 Career Lens 交互稳定性、Playtest 大目录浏览器会话，以及 README 统计文案过期；README 的 5430/5583 已同步为真实 5437/5590，前两类未在本轮扩大成 UI 重构，等待单独归因。

视频涓流任务本轮按冷却规则执行一次，留下 `SKIP` 日志；当前外部状态为 48 completed、4 no_transcript、44 retryable，累计 channel_failure 42、model_failure 2，剩余 2215 条，冷却至 2026-08-23 00:50。该状态不表示 2311 条字幕补全已完成；字幕与凭据仍不进入仓库。

本轮只在本地 `codex/v02` 提交，未 push、未恢复 Public、未启用 Pages。下一步优先是独立处理 Playtest／Career 的浏览器稳定性与大目录渲染成本，再决定是否继续视频通道或为未闭合透镜寻找一手证据。
