# 成长资源来源级扩充设计

- 日期：2026-08-12
- 状态：已获发起人批准，可直接实施
- 范围：GDC Vault 与主要作者/机构的英文资源扩充和可重复 intake 流程

## 当前基线

目录现有 38 个 Source、179 个 Work Item、193 个 Access Version。GDC Vault 已有 60 项，但 Game Maker's Toolkit 只有 1 项、Lost Garden 2 项、Liz England 1 项、How To Market A Game 1 项。当前问题不是完全没有资源，而是来源覆盖深度失衡，且批次过小。

## 收录原则

- 英文是默认扩充语言；中文有官方或作者原页时优先关联，但不因中文不足阻塞英文。
- 只纳入官方、作者、出版社、机构或稳定档案原页能确认题名和来源的 Work Item。
- 不把搜索结果页、频道首页或聚合摘要当作具体 Work Item。
- 每个 Work Item 恰属一个主要 Resource Topic，可以关联多个 Capability / Knowledge Topic，但映射必须由内容主题直接支持。
- 订阅、付费与登录内容可以收录，访问事实必须诚实标注；不把可访问性当质量分。
- 不使用站内评分、排名、精选或“必读”标签。

## 来源级工作流

建立一个只读审计脚本，按 Source 输出当前数量、canonical URL 集合、媒介、语言和主题覆盖。研究 notebook 以 Source 为批次记录候选、已收录、排除和原因。每批目标 30-50 项，不再用 5 项左右的小批次代表“扩充完成”。

第一批聚焦 GDC Vault 免费档案与现有薄覆盖作者：

- GDC Vault：从官方 free archive 的 Design、Narrative、Production、Leadership、Business & Marketing 等栏目补充去重后的具体 session。
- Lost Garden：补系统设计、社交系统、设计过程和原型相关文章。
- Liz England：补设计职责、叙事设计和跨职能协作文章。
- How To Market A Game：补市场验证、Steam 页面、愿望单和产品定位文章。
- Game Developer / GMTK：只在官方文章或具体视频页可核验时纳入；YouTube 无字幕后端时不根据未核验转录扩大能力映射。

## 数据与验证

- canonical URL 使用现有 `normalizeCatalogUrl`，禁止跨 Work Item ownership。
- 新增条目在测试中锁定 exact ID、canonical、Source、媒介、原始语言、主要 Topic 与最小必要 Capability 映射。
- notebook 顶部统计由数据动态对账，不手写陈旧总数。
- 页面继续由现有 15 个主题子表、七维筛选和 Source 子入口承载，不因目录增长渲染第二套资源 UI。

## 验收条件

1. 先落一个 30-50 项的英文批次，而不是 5-10 项。
2. 新条目 canonical 归一化后零重复，且不与 Source homepage 冲突。
3. 每项恰好一个 Resource Topic，所有引用的 Capability / Knowledge Topic / Source 存在。
4. GDC 与主要作者的新增数量、语言、媒介和主题覆盖在 notebook 可审计。
5. Resources 默认折叠页、展开全表、筛选、no-JS 和 320px 仍可用。

