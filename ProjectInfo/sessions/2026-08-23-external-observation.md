# 外部观察语义核查

更新于 2026-08-23 22:10 · 记录者 AI

## 2210 资源页“外部事实”字段解释

- 结论：AI（解释）。截图中的“外部事实”不是评分、排序、推荐或官方视频正文，而是资源记录里的 `externalSignals`：带来源 URL、标签和观察日期的第三方旁证。
- 示例：AI。`Don’t Put Decisions Off [Team Management]` 的 `externalSignals` 指向 Senko's Activity Log 的 Team Management 专题，值为“对应专题：Don't defer decisions；仅作内容旁证”，标签明确写作“二手专题摘要（非视频正文）”，观察日期为 2026-08-23。
- 页面来源：AI。`ResourceResults.astro` 在资源存在 `externalSignals` 时，把折叠入口显示为“查看访问版本与外部事实”，并渲染“外部公开观察”区块；数据 schema 要求它有 provider、label、value、observedAt 和 URL，并拒绝 score/rank/rating 字段。
- 判断：AI（产品语义）。数据边界本身是明确的，但“外部事实”容易被理解为本站确认的内容事实；“外部旁证”或“第三方来源注记”会更准确。本次只记录问题，不改 UI 或 catalog。

原始对话：dialogues/2026-0823.md「2210 资源页“外部事实”字段解释」
