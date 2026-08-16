---
title: Devlog 014：资源目录与 RTS 创新事件扩展
---

# 资源目录与 RTS 创新事件扩展

2026-08-16

本轮按“英文优先、中文持续保留、只纳入可核验页面”的规则，从 Game Developer 官方页面新增 1000 个学习资源。每条资源使用唯一 canonical URL、一个主要资源主题、有限能力映射、访问模型和检查日期；不把搜索摘要、评分或订阅内容误写成免费事实。目录现在包含 41 个 Source、3120 个 Work Item、3134 个 Access Version 和 16 个主题。

Innovation Atlas 新增三条 RTS 事件主线：资源与基地生产、直接单位控制、非对称阵营设计。事件作为时间网络的节点，关系分别表达事件如何演进，以及哪些代表作品承载了该变化；作品是证据入口，不取代创新事件本身。Atlas 当前为 69 nodes、55 relations、76 Evidence。

验证：`npm run check` 0/0/0；Vitest 180/180；Astro build 141 pages；Atlas、Resources、Playtest 和 visible-skeleton 定向浏览器测试 121 passed／21 intentional skipped；完整 E2E 为 252 passed／22 intentional skipped／0 failed。本地预览保持在 `http://127.0.0.1:4321/Learn-About-Games/`，仓库仍为 Private，未 push 或部署。
