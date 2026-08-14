# 300 条成长资源扩充计划

日期：2026-08-15

## 目标

在现有 225 个 Work Item 的基础上，至少新增 300 个经过来源核验的 Work Item。新增条目必须有独立 canonical identity、Source 归属、唯一主要 Resource Topic、至少一个 Capability 或 Knowledge Topic 关联、原始语言、访问方式和检查日期。

最终目标数量至少为 525 Work Item；Access Version 数量随合法版本入口增加，不把同一作品的语言版本或平台入口重复算作 Work Item。

## 证据边界

- 优先官方／作者／机构原页：GDC Vault、Game Developer、开发者博客、大学课程和论文作者版本、研究机构数据库、官方技术文档、正式播客页面。
- Exa 只负责发现，不能作为证据；最终每条必须由 Jina Reader 或可直接访问的原页面核验标题、作者／机构、正文或摘要与访问事实。
- 聚合页、频道首页、搜索结果、搬运、未经权利方确认的字幕／扫描件、404、证书错误和只能看标题的页面不入库。
- 英文与中文资料并列为第一优先级；日文作为较低优先级的补充覆盖，只在填补明确能力／主题缺口且原页证据充分时纳入。没有足够中文原页证据时用高置信英文资料补足；不为满足语言配额降低证据门槛。
- 不新增评分、排名、审核等级或外部平台指标；`externalSignals` 只在已有可核验事实时保留。

## 批次拆分

| 批次 | 重点 | 目标新增 | 预期来源 |
|---|---|---:|---|
| A | GDC、Game Developer、主要创作者与工作室原页 | 80–110 | GDC Vault、Game Developer、作者站、官方开发日志 |
| B | 学术论文、开放课程、研究机构、可访问 syllabus 与方法文档 | 80–110 | 大学、期刊、作者版本、机构资料库 |
| C | 中文官方资料与全球补缺，日文低优先补充 | 80–110 | 中文机构、开发者官方页、英文一手资料、必要时 J-STAGE |
| D | 仅在前三批不足 300 时启用，专门补低覆盖能力与主题 | 至少补足 | 由 A–C 的真实缺口决定 |

各批以 80 条为最低有效产出；若某批证据不足，允许提前停止并把缺口记录在研究 notebook，不使用弱条目填充。三批合计必须达到新增 300 条才可关闭目标。

## 数据合同

每个 Work Item：

1. 只出现一个 `canonicalUrl` identity，并通过统一 URL normalization 与已有 catalog 比对。
2. `resourceTopicIds` 长度严格为 1；`sourceId`、Capability／Knowledge Topic 和 Access Version 全部闭包有效。
3. 至少一个 Capability 或 Knowledge Topic 关联；映射理由只能来自来源实际覆盖内容。
4. `originalLanguage`、`mediaType`、`accessModel`、`versionRelation`、`presentationMode` 和 `checkedAt` 与来源页面一致。
5. 同一作品的译本、作者版本和合法平台入口进入 `accessVersions`，不复制 Work Item。

每批先在 `tests/lib/catalog-data.test.ts` 锁定准确 canonical URL 集合和新增数量，取得 RED 后再写 JSON。每批独立运行 targeted unit、Astro check、Resources／Playtest E2E，批次之间保留可回退提交。

## 研究记录

在 `docs/research/2026-08-15-resource-300-intake.md` 中逐批记录：候选 URL、最终 canonical、标题、作者／机构、语言、媒体、Source、主题、能力映射、bounded claim、核验日期、include／exclude 原因、访问限制和重复决策。不得把搜索摘要或未经核验的候选写成已收录事实。

## 完成门禁

- 目标：新增 Work Item >= 300，现有 225 项保全，Source／Access Version／唯一主题合同通过。
- `npm run check`：0 errors / warnings / hints。
- `npm test`：全量通过，catalog-data、catalog-validate、资源过滤合同覆盖新增批次。
- `npm run build`：静态构建通过。
- `CI=1 npx playwright test tests/e2e/resources-v02.spec.ts tests/e2e/playtest-flow.spec.ts tests/e2e/base-path.spec.ts --project=chromium --project=mobile-chromium`：0 failures，包含 no-JS、筛选、展开、链接和无横溢出。
- 完整 E2E、`git diff --check`、secret filename/content scan、canonical uniqueness 和依赖审计通过。
- 更新 README、ROADMAP、CHANGELOG、Devlog、decision summary 与 sanitized transcript；保留仓库 Private，不 push、不启用 Pages，继续提供 `/Learn-About-Games/` 本地预览。
