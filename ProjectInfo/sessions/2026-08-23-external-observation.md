# 外部观察语义核查

更新于 2026-08-23 22:28 · 记录者 AI

## 2210 资源页“外部事实”字段解释

- 结论：AI（解释）。截图中的“外部事实”不是评分、排序、推荐或官方视频正文，而是资源记录里的 `externalSignals`：带来源 URL、标签和观察日期的第三方旁证。
- 示例：AI。`Don’t Put Decisions Off [Team Management]` 的 `externalSignals` 指向 Senko's Activity Log 的 Team Management 专题，值为“对应专题：Don't defer decisions；仅作内容旁证”，标签明确写作“二手专题摘要（非视频正文）”，观察日期为 2026-08-23。
- 页面来源：AI。`ResourceResults.astro` 在资源存在 `externalSignals` 时，把折叠入口显示为“查看访问版本与外部事实”，并渲染“外部公开观察”区块；数据 schema 要求它有 provider、label、value、observedAt 和 URL，并拒绝 score/rank/rating 字段。
- 判断：AI（产品语义）。数据边界本身是明确的，但“外部事实”容易被理解为本站确认的内容事实；“外部旁证”或“第三方来源注记”会更准确。本次只记录问题，不改 UI 或 catalog。

原始对话：dialogues/2026-0823.md「2210 资源页“外部事实”字段解释」

## 2228 外部旁证文案统一与资源页回归

- 决策：無涘 ｜ 记录：AI。将用户可见的“外部事实 / 外部公开观察”统一改为“外部旁证”，保留来源、标签和观察日期；不迁移内部 `externalSignals` 字段。
- 审计：AI。复查资源行、Source 详情页、共享资源文案、README、活跃内容基准和实现计划；当前源码与活跃文档不再使用旧的用户可见命名，历史对话与历史 changelog 保留原样。
- 实现：AI。新增共享 `externalObservationCopy`，资源页折叠入口、旁证标题、目录说明和 Source 说明共用同一套文案；说明第三方旁证不等同于原始内容，不用于评分、排序或推荐。
- 测试：AI。先写回归测试并确认旧文案导致红测；实现后 Vitest 205/205、Astro check 0/0/0、静态构建 151 页通过。Resources E2E 桌面/移动 44/44 通过；同时修正一个把隐藏资源正文普通词误判为站内质量标签的旧测试断言。
- 边界：AI。本次没有修改 `resources.json` 的旁证数据，没有删除第三方链接，没有改变排序、筛选或资源证据等级。

原始对话：dialogues/2026-0823.md「2228 外部旁证文案统一与资源页回归」
