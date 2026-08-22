---
title: 全局审计：资源目录、地图与页面运行态
---

# 全局审计：资源目录、地图与页面运行态

日期：2026-08-16
范围：当前 Private v0.2 候选（本地 `codex/v02`）

## 结论

没有发现会阻止继续使用的结构性错误。资源目录的引用、URL ownership、主题归属约束和页面路由均通过；本轮补上了此前缺失的构建期保护：同一个 Work Item 内，完全相同身份的 Access Version 现在会被拒绝。合法的同 URL 不同付费模型、语言、呈现方式或地区限制仍可以并存。

本轮没有凭启发式批量改写 `capabilityIds` / `knowledgeTopicIds`。这些字段目前是可审计的声明式元数据，但并不等于 3120 条资料都已经逐篇阅读并完成语义复核；这一限制必须保留在公开记录中。

## 结构与数据检查

当前 catalog 计数：

- 3120 个 Work Item、41 个 Source、3134 个 Access Version；
- 42 个 Capability、12 个 Knowledge Topic、16 个 Resource Topic；
- Innovation Atlas 为 69 个节点、55 条关系、76 项 Evidence、10 个非排他 Genre Family。

机器审计结果：

- 所有集合 ID 唯一；Capability、Knowledge Topic、Resource Topic、Source 引用均闭合；
- 规范化 canonical URL 无重复，跨 Work Item 的 URL ownership 冲突为 0，Source homepage 冲突为 0；
- 每个 Work Item 恰有一个主要 Resource Topic；新增的 `RESOURCE_ACCESS_VERSION_DUPLICATE` 诊断与 raw-catalog 检查均通过；
- 现有 2539 条主题元数据与直接标签不完全相同、88 条与主题元数据完全不相交。这些是“主题集合描述”与“条目直接证据标签”的语义差异信号，不自动判错；后续应按来源批次人工复核，而不是用关键词猜测覆盖；
- 媒介分布仍明显偏向演讲／会话（talk 1835）与文章（article 1075）；原始语言为英文 3065、中文 38、日文 17。英文优先符合当前已核验来源分布，但中文入口和可消费版本仍应继续补充。

## 映射审计边界

资源的 `capabilityIds` 与 `knowledgeTopicIds` 来自入库时记录的直接元数据映射，并由 validator 检查 ID 合法性；它们不是运行时根据标题自动推导的结果。当前审计发现两个需要人工队列化的问题：

1. 资源主题是宽口径入口，不能替代条目级能力／知识标签。高频 `topicMismatch` 不应直接改成错误；应优先检查多标签条目、付费摘要型条目和跨支柱资料。
2. 批量导入中存在模板化映射风险，尤其是 2026-08-15 的 500 条批次。下一轮应从 `docs/research/2026-08-15-resource-500-gdc-intake.md` 与 `docs/research/2026-08-16-resource-1000-gamedeveloper-intake.md` 中抽样复核标题、简介、来源正文和已有标签是否一致，再决定是否逐条修改。

本轮只记录高置信抽查队列，不把关键词相似当作修复证据。审计队列示例包括：求职／招聘类会话是否落入“职业与行业实践”、无障碍设计是否落入“设计基础”或“手感与反馈”、音频／视觉技术会话是否落入对应的美学／实现方向。

## 页面与交互检查

在本地 1280px 视口对首页、能力地图、资源页、Innovation Atlas 和 About 生成了新截图并逐张检查：

- 页面没有横向溢出；资源表默认折叠、搜索和七项事实筛选在资源表头可达；
- EGDS 地图保持单一从左到右层级，职业透镜仍投影到同一张地图；
- Atlas 保持全局网络与两种视角，品类发展视角强调 Innovation Event，作品保留为事件详情中的承载证据；无证据的 Genre Family 显示空状态；
- 首页、地图和 Atlas 的首屏留白与结构分隔线仍偏编辑化、密度较低，这是后续视觉收敛项，不是数据或可达性阻断。

截图证据：

- ![首页](/tmp/learn-about-games-global-audit-home.png)
- ![能力地图](/tmp/learn-about-games-global-audit-map.png)
- ![成长资源](/tmp/learn-about-games-global-audit-resources.png)
- ![Innovation Atlas](/tmp/learn-about-games-global-audit-atlas.png)
- ![关于本项目](/tmp/learn-about-games-global-audit-about.png)

## 验证门禁

- `npm run check`：0 errors / 0 warnings / 0 hints；
- `npm test`：12 files、188 tests passed；
- `npm run build`：145 pages；
- `npm audit --audit-level=high --omit=dev`：0 vulnerabilities；
- 并行 Playwright：261 passed / 22 intentional skipped / 1 timing-sensitive failure；该失败是 Atlas dialog 返回 pageY 偶发 9px 偏移。单独运行、Atlas 串行（40 passed / 20 intentional skipped）和完整串行回归（262 passed / 22 intentional skipped）均通过，暂不判为产品回归。

## 下一轮

1. 按来源批次抽查资源标签，优先处理模板化导入与跨支柱资料，不按数量批量重写。
2. 在资源页继续补充英文与中文高质量来源，但每条必须保留 canonical、来源、检查日期和可回溯的映射依据。
3. 继续补齐 Atlas 的 Genre Family 事件路线；保持一个互相影响的全局网络，选择品类只高亮，不隔离节点。
4. 若 Atlas 返回位置的并行波动在串行复测中复现，再调整恢复滚动的时序合同。

## 2026-08-17：增量资源证据复核与 Atlas 全局透镜

- 目录中已有三批英文扩展（1000 条 GDC、1000 条 Game Developer、500 条 GDC），当前仍为 3120 个 Work Item；这次不重复导入同一批 URL。
- 离线 GDC sitemap 去重后发现 402 个候选：310 个返回 200，但其中 22 个实际是登录页，另 92 个不是可核验的 200 页面。因此本轮没有把 310 个候选直接写入目录；后续只有在取得真实标题、正文元数据和逐条能力／知识映射后才会入库。
- Atlas 品类透镜现在只改变全图的强调：完整节点和关系集合保持在同一张网络，跨品类关系仍可见；桌面显示 SVG 全图，移动端使用同源 69 节点／55 关系文字大纲。选择品类不会再把网络伪装成孤立子图。
