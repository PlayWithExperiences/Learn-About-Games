# 300 条成长资源扩充研究记录

检查日期：2026-08-15

状态：研究进行中。现有基线为 225 Work Item、38 Source、239 Access Version；目标是在保持 evidence-backed catalog 合同的前提下新增至少 300 个 Work Item。

## 调研工具与限制

- Agent Reach doctor：Exa via mcporter、Jina Reader、GitHub CLI、RSS 可用。
- YouTube 字幕后端未启用，因此不把视频搜索摘要或自动字幕当作页面证据。
- Exa 用于发现；每条候选必须再用 Jina Reader 或官方原页核验。任何 HTTP 429／405 后停止无意义重试，并在对应批次记录限制。
- 英文与中文是第一优先级；日文优先级较低，仅用于填补明确缺口。本记录只写候选 identity、核验事实和排除原因，不复制原文或受版权保护内容。

## 批次状态

| 批次 | 目标 | 已核验 include | exclude / needs-verification | 状态 |
|---|---:|---:|---:|---|
| A：GDC／创作者 | 80–110 | 0 | 0 | 研究中 |
| B：学术／课程 | 80–110 | 0 | 0 | 研究中 |
| C：中文／日文／全球补缺 | 80–110 | 0 | 0 | 研究中 |
| D：缺口补足 | 按需 | 0 | 0 | 未启用 |

## 接受表

后续逐条追加，字段至少包括：`id`、title、author/institution、canonicalUrl、Source、originalLanguage、mediaType、accessModel、resourceTopicId、capability／knowledge mappings、boundedClaim、checkedAt、核验 URL 与 include 理由。

## 排除表

后续逐条追加。排除原因必须具体到：搜索结果／聚合身份、404、证书错误、只有标题、来源无法确认、重复 canonical、Source/Work 冲突、无足够内容支持映射、权利链不明或超出本项目学习范围。
