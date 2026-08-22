# Learn About Games v0.2 决策摘要

更新于 2026-08-22 · 记录者 AI

- 日期：2026-08-09
- 状态：仓库保持 Private、Pages 保持禁用；`codex/v02` 已合并进 `main`（merge `cdca3be`），本地 tag `v0.2-content-baseline` 保留回滚锚点；当前本地候选包含可逆展开的左→右 EGDS 层级、10 个 Atlas Genre Family／8 条可直接选择的证据谱系与 5437 项资源目录（44 Source／5590 Access Version），并已通过至少三条完整创新路线的闭包审计；尚未推送或部署；本机以 `/Learn-About-Games/` 子路径预览
- 历史 v0.2 URL：https://playwithexperiences.github.io/Learn-About-Games/（当前 404）
- v0.2 产品设计：[2026-08-09-learn-about-games-v02-design.md](../superpowers/specs/2026-08-09-learn-about-games-v02-design.md)
- 私有完善设计：[2026-08-09-private-refinement-design.md](../superpowers/specs/2026-08-09-private-refinement-design.md)
- EGDS 能力地图重构设计：[2026-08-09-egds-expertise-map-design.md](../superpowers/specs/2026-08-09-egds-expertise-map-design.md)
- EGDS 能力地图实施计划：[2026-08-09-egds-expertise-map-implementation-plan.md](../superpowers/plans/2026-08-09-egds-expertise-map-implementation-plan.md)
- 横向 EGDS／Genre Atlas／资源扩展设计：[2026-08-11-horizontal-egds-genre-atlas-resource-expansion-design.md](../superpowers/specs/2026-08-11-horizontal-egds-genre-atlas-resource-expansion-design.md)
- 横向 EGDS 实施计划：[2026-08-11-horizontal-egds-implementation-plan.md](../superpowers/plans/2026-08-11-horizontal-egds-implementation-plan.md)
- Genre Atlas 基础计划：[2026-08-11-genre-atlas-foundation-plan.md](../superpowers/plans/2026-08-11-genre-atlas-foundation-plan.md)
- 资源下一批计划：[2026-08-11-resource-expansion-next-batch-plan.md](../superpowers/plans/2026-08-11-resource-expansion-next-batch-plan.md)
- 私有完善 Map / Career 计划：[2026-08-09-private-refinement-map-career-plan.md](../superpowers/plans/2026-08-09-private-refinement-map-career-plan.md)
- 私有完善 Resources 计划：[2026-08-09-private-refinement-resources-plan.md](../superpowers/plans/2026-08-09-private-refinement-resources-plan.md)
- 私有完善 Atlas 计划：[2026-08-09-private-refinement-atlas-plan.md](../superpowers/plans/2026-08-09-private-refinement-atlas-plan.md)
- 视觉系统：[DESIGN.md](../../DESIGN.md)
- Foundation 计划：[2026-08-09-v02-foundation-implementation-plan.md](../superpowers/plans/2026-08-09-v02-foundation-implementation-plan.md)
- Map / Career 计划：[2026-08-09-v02-map-careers-implementation-plan.md](../superpowers/plans/2026-08-09-v02-map-careers-implementation-plan.md)
- Resources 计划：[2026-08-09-v02-resources-implementation-plan.md](../superpowers/plans/2026-08-09-v02-resources-implementation-plan.md)
- Atlas / Release 计划：[2026-08-09-v02-atlas-release-implementation-plan.md](../superpowers/plans/2026-08-09-v02-atlas-release-implementation-plan.md)
- 本轮会话记录：[2026-08-09-learn-about-games-v02-transcript.md](2026-08-09-learn-about-games-v02-transcript.md)
- M0 决策摘要：[2026-08-08-learn-about-games-decision-summary.md](2026-08-08-learn-about-games-decision-summary.md)

## 当前状态

用户在查看 v0.2 后认为核心体验仍不足以公开：暗色主题下职业高亮不够明显；能力地图虽然有关系，但结构过散、缺少原思维导图那样清晰的主次和分区；成长资源的双列形态占用过宽；Innovation Atlas 缺少缩放和平移；节点详情需要按名称／时间排序和搜索。仓库因此已暂时设为 Private，未经身份验证访问仓库与原 Pages URL 均返回 404；Pages workflow 同时手动停用，避免私有完善期间的 main push 触发无效部署。

发起人随后否决了通用五分组继续作为地图主骨架，并确认能力地图必须以 PlayWithExperiences / EGDS 为作者化蓝本。当前本地候选使用 28 个 EGDS Framework Node 表达五条条件分支、体验旅程、感受 → 理解 → 解构 → 重构过程与三类设计杠杆；42 个 Capability 和 12 个 Knowledge Topic 只在一个叶容器中按需展开，64 条 `supports` / `complements` 关系只在直接聚焦时出现。EGDS 是一种可讨论的设计视角，不是唯一行业标准。

Career Lens 现在只通过公开地图事件叠加到同一张 EGDS 地图，和个人实践状态、展开状态、关系选择保持分离，不生成评分、差距或完成率。旧 Domains / mapGroups JSON、placement 字段、catalog 类型、validator、generic geometry helper、无消费者 CSS 和当前 Methodology 语义已经一起退休。普通滚轮属于页面；1024px、320px 与无 JavaScript 使用同源原生大纲，避免内部纵向滚动与页面竞争。

更早的私有完善按 Map / Career、Resources、Atlas 三个可独立验证的子系统实施；EGDS 切片则按 catalog → 纯布局／路由 → 交互地图 → Career bridge → 旧 ontology 退休的依赖顺序执行。每项行为先取得 RED，再完成最小 GREEN、规格审查、质量审查和原实现者修复闭环。资源与 Atlas 没有在 EGDS 切片中被顺手重构。

v0.2 runtime HEAD `0b6bfb462f7b697ac526a9c6bf48a95878ed642a`、GitHub Pages run `31282275108` 与 evidence commit `ff7bb3b954f52e65ede79e73103da70a1d6accab` 作为最后一次公开构建的历史证据保留。重新公开前必须完成核心体验修正并重新运行线上验收，不能把历史成功 run 描述成当前公开状态。

v0.2 开始前的 clean baseline 已实际运行：`npm run build` 完成 Astro check 0 errors / warnings / hints、Vitest 27/27 和 14 个静态页面；`CI=1 npm run test:e2e` 为 44/44。

规格、`DESIGN.md` 与四份阶段计划已经写入工作树，尚未提交或发布。`DESIGN.md` lint 为 0 errors；18 条 orphaned-token warning 是 linter 无法从 Markdown 组件示例推导 token 使用，不是运行时错误。文档更新后的首次全量 E2E 有 4 项失败，均来自仍锁定旧 M0 summary/spec 路径和旧 README 精确文案的测试；对照真实页面确认根因后只更新测试契约，定向 18/18、随后全量 44/44。完成规格对抗修正后重新执行：`npm run build` 为 Astro check 0 errors / warnings / hints、Vitest 27/27、14 pages；`CI=1 npm run test:e2e` 为 44/44；placeholder scan 与 `git diff --check` 均无命中。

本次 Foundation 导航切片已完成但尚未发布：顶层只保留能力地图、职业方向、成长资源、创新变迁与关于本项目五项用户任务；About 集中项目治理资料并保留旧路由；`/careers/` 直接复用 `AAA · Game Designer` catalog 画像、公开依据与复核日期，不复制角色知识树；首页三入口分别抵达地图、职业方向和资源。桌面导航单行，320px 改为原生 `details/summary` 紧凑菜单，JavaScript 不可用时仍可打开。行为测试先在旧导航上取得 RED，最终 `npm run build` 为 0 errors / warnings / hints、Vitest 44/44、25 个静态页面；导航定向桌面/移动 E2E 为 25 passed / 1 desktop-only skipped，完整 E2E 为 53 passed / 1 skipped。实测 320px HTML 与 body 均为 `clientWidth=320`、`scrollWidth=320`，临时 preview 已关闭。

能力地图 Tasks 2-3 已完成但尚未发布：`CapabilityMap.astro` 从同一 catalog server render 桌面地域图与移动关系大纲。桌面画布包含 8 个开放地域、42 个 Capability、12 个 Knowledge Topic 和 64 条关系；supports 使用中点方向标记，complements 使用无箭头虚线，focus 只增强相邻边与端点而不隐藏全图。移动端在 320px 直接显示全部节点链接，每个 Capability 可展开“它支持 / 受到支持 / 互补”的同源文字关系。所有 Capability 详情都有独立 `CapabilityProgress`，12 个 Knowledge Topic 均有静态详情页；fresh build 生成 70 pages。

本切片先运行 fresh build 证明测试产物可用，再在旧 bento 上取得浏览器 RED 14/14；实现后地图/base-path 桌面与移动定向为 14/14。相邻回归更新移除了已经退休的 Map 内嵌职业控件契约，并锁定每个能力页都有个人记录；最终 `npm run check` 为 0 errors / warnings / hints、Vitest 57/57、fresh build 70 pages，地图/base-path/profile-progress 定向 18/18，完整 E2E 为 77 passed / 1 desktop-only skipped。视觉验收覆盖 Map、Playtest 详情与“玩家动机与差异”议题详情在 1440px/320px、System Light/explicit Dark 共 12 张截图。对抗检查发现并修复 SVG 箭头被 viewBox 放大、移动节点详情链接藏在闭合 disclosure、4 对节点碰撞与 1 对跨域擦边；最终节点碰撞审计为 0，320px HTML/body scrollWidth 等于 clientWidth，节点链接 42/42 直接可见。临时 preview 已停止，`git diff --check` 与 secret filename scan 均无输出。

地图切片留档后的全仓复跑遇到并发资源切片正在进行的预期 TDD RED：资源测试新增 2 条、其中 4 项仍等待资源 catalog GREEN；Astro check 仍为 0/0/0，地图文件没有新增失败。本摘要不把该共享工作树瞬时状态伪装成最终全仓 GREEN；主任务会在资源提交后重新执行 fresh build、unit 与完整 E2E。

独立视觉审查随后指出地图仍有三个表达问题：Domain 四边框和 54% 底场仍像便当盒，64 条关系默认 `1px / opacity .22` 近似装饰线，320px 的 54 个常驻摘要把页面拉到 11212px。review fix 先以 computed style 与 DOM 契约取得 3 项浏览器 RED，再把 Domain 改为上边+左边的开放局部边界和 20% 极淡底场，把 supports/complements 提升到 `1.3px / opacity .46-.50` 并保留实线箭头/虚线差异，把能力摘要和关系放入同一个原生 disclosure、知识议题摘要也按需展开。全部 42 个 Capability 与 12 个 Knowledge Topic 的直达链接仍常驻，无 JavaScript 仍可展开关系。

review fix 的地图定向桌面/移动为 14/14；fresh build 完成 Astro check 0 errors / warnings / hints、Vitest 59/59 与 84 pages。1440px/320px、System Light/explicit Dark 四张原图确认两种主题下开放地域与默认关系可辨；320px HTML/body 均严格为 320px，总高从 11212px 降到 8273px，减少 2939px（约 26%）。当时完整 E2E 为 71 passed / 8 failed / 1 skipped；8 项都来自资源扩充后尚未同步的旧 `playtest-flow.spec.ts` URL、标题和非唯一 locator，不涉及地图，交回 Resources UI task 修复后重跑。最终留档复跑又遇到并发 Career Lens 的预期 TDD RED：未跟踪测试引用尚未实现的 `src/lib/career-lens`，产生 2 个 check error；地图 agent 没有修改或暂存该文件。

Resources Tasks 3-4 已完成但尚未发布：主资源页把 20 个 Source 与 128 个 Work Item 作为不同结果类型全部 server render，不按域名合并；20 个 Source 均有静态详情页，15 个 Resource Topic 均有无顺序集合页。七维筛选固定使用 `resourceTopic`、`knowledgeTopic`、`capability`、`language`、`mediaType`、`accessModel`、`source` 参数，组合语义为 AND，保持 catalog 顺序且绝不读取 external signals 排序。更改会写入 history，reload、back 与 pageshow 都从 URL 重建 DOM；无 JavaScript 时七个控件禁用并明确说明，全部 Source 与 Work Item 仍可读。

本切片先取得纯函数 module-missing RED 和浏览器 8/8 RED；最终资源定向桌面/移动为 30/30，完整 E2E 为 95 passed / 1 desktop-only skipped。Astro check 为 0 errors / warnings / hints，Vitest 70/70，fresh build 生成 104 pages。视觉验收覆盖 Resources、GDC Vault Source 与 Playtest Topic 在 1440px/显式 320px、light/dark；发现并修复一条 DOI 连续文本把 Resources 撑到 334px 的问题，复测 `scrollWidth=clientWidth=320`。Source 使用目录条目形状，Work Item 使用紧凑编辑行；外部观察只按 catalog 原始顺序展示 provider/value/date，不生成站内评分、排名或质量徽章。临时 preview 已停止。

提交前再次执行目标资源 unit 17/17、直接 Astro fresh build 104 pages、资源/base-path/Playtest 桌面与移动 30/30，均通过。共享工作树的最终 `npm test` 同时读到并发 Atlas Task 2 尚未实现的 RED tests，结果为资源及既有测试 69 passed、Atlas 12 failed；失败集中在 `atlas-network.test.ts` 与 Atlas validator 新契约，本资源提交不修改或暂存这些文件。主任务将在 Atlas GREEN 后重新运行全仓 unit/build 门禁。

Career Lenses Task 4 已完成但尚未发布：`/careers/` 提供 `AAA · Game Designer`、`AAA · Creative Director` 与 `Indie · Solo Developer` 三个明确按钮；控件在 server HTML 中禁用，脚本完成绑定后才启用，无 JavaScript 时保留完整地图、禁用说明和三个可展开的公开依据。页面只组合现有 `CapabilityMap.astro` 一次，桌面地域图和移动关系大纲都继续显示 42 个 Capability、12 个 Knowledge Topic 与 64 条关系，没有复制第二棵角色树。

应用画像后，已映射 Capability 使用核心实线、重要虚线、建议了解点线与中文文字标签，并公开 responsibility；未收录能力只降低强调而不隐藏。摘要按三档列出能力、责任范围、直接关联 Work Item 的 catalog 事实数量，以及即时聚焦当前可见节点、能力详情和 `resources/?capability=<id>` 三个动作。清除会移除全部画像 DOM 属性并恢复完整地图；控制器不读取或写入个人进度 storage。依据区公开 basis、caveat、basisLinks、sourceNote 与 reviewedAt，不生成职业适配、个人评价、雷达图或建议步骤。

本切片先在旧单画像页面取得有效浏览器 RED：server HTML 没有任何职业按钮，交互测试也无法找到 Career Explorer。实现后的 career 桌面/移动定向为 12/12，叠加 map/profile-progress 回归为 34/34；同步旧 Career skeleton 后，Career 与 visible-skeleton 桌面/移动为 37 passed / 1 desktop-only skipped。视觉验收覆盖 1440px 的 System Light 默认、三个 applied、clear 与 explicit Dark，以及 320px 的 explicit Dark applied 和 no-JS；全部 HTML/body `scrollWidth` 等于 `clientWidth`。审查时发现移动聚焦虽转移键盘焦点，却受全局平滑滚动延迟而未立即进入视口；最终改为在聚焦操作内临时使用即时滚动，并新增桌面/移动 `toBeInViewport` 断言。Resources Task 5 合并后的 fresh build 完成 Astro check 0 errors / warnings / hints、Vitest 81/81 与 104 pages；完整 E2E 为 103 passed / 8 failed / 1 skipped，8 项全部来自 Atlas Task 3 尚未替换的旧 8-category / 7-edge UI 契约，Career 不再有失败。

Career 独立可读性审查随后发现未收录节点使用整节点 `opacity: .38`，会把移动端能力简介与关系说明一起压暗，实测浅色约 2.29:1、深色约 3.23:1；桌面角色标签也只有 8px。修复先取得 computed opacity `.38` 的有效 RED，再保持节点 `opacity: 1`，只以不透明的 muted 边框、背景与局部类型文字降低强调，并把桌面标签提高到 10px。两种主题、1440px/320px 下正文均锁定至少 4.5:1、边框至少 3:1；Career 定向为 16/16，Career + Map 为 34/34，最大画像下 42 个能力节点零碰撞且无横向溢出。原图已复查四个主题/断点组合。全量 `npm run build` 当时被共享工作树中并发 Atlas Task 3 的 4 个 TypeScript RED 阻断；直接 Astro fresh build 已生成 104 pages，本修复没有修改或暂存 Atlas 文件，由主任务在 Atlas 原子提交后补跑全仓 gate。

Resources Task 5 已把地图节点直接连接到具体资源，而没有恢复 Trail：全部 Capability 与 Knowledge Topic 详情按运行时 catalog 顺序列出直接关联的 Work Item；资源主题、能力与知识议题分别使用 `resourceTopic`、`capability`、`knowledgeTopic` 稳定参数进入同一个事实筛选器。没有直接资源的能力仍保留全目录筛选入口，并诚实显示空状态与贡献指南链接。测试先在旧详情页取得 2/2 预期 RED，最小实现后地图、资源、base-path 与 Playtest flow 的桌面/移动定向为 48/48。

Atlas Task 2 合并后重新执行 fresh `npm run build`：Astro check 为 0 errors / warnings / hints、Vitest 81/81、静态生成 104 pages。视觉验收覆盖 Playtest、无直接资源的 `encounter-space-composition` 与知识议题 `emergence-complexity` 在 1440px/显式 320px、light/dark 六张截图；三类页面均无横向溢出，分别确认 15、0、12 个直接关联 Work Item，空状态贡献入口可达。Task 5 的 48/48 定向保持 GREEN；随后全量 E2E 为 94 passed / 17 failed / 1 desktop-only skipped，其中 8 项来自 Atlas 新数据仍配旧 M0 UI 断言，9 项来自正在实现的 Career Lens 浏览器契约，均不涉及本切片拥有的页面与测试。临时 preview 已停止。

Atlas Task 2 把历史数据扩展为同一张证据图：27 个节点、25 条关系、40 项 Evidence、2 个 Theme 与 27 个共享 Tag；两条 Category Formation 使用真实时间 span，Dead Cells 同时属于 Roguelike 与 Metroidvania 证据透镜。独立数据审查发现 Evidence 缺原始题名/语言、`disputed` 缺方向理由、自环关系可通过三个合同缺口；修复后 40/40 Evidence 保存 `sourceTitle` 与 `originalLanguage`，争议边必须写 `directionalityNote`，self-edge 在 schema 与 validator 两层拒绝。目标单测 35/35、全量 85/85，fresh build 保持 104 pages。

Atlas Task 3 退休 `AtlasSeed.astro`，新增单一 `AtlasNetwork.astro` 与固定时间投影 helper。桌面 server render 同一份 27 节点/25 关系，横轴只编码 `startYear`、lane 只避免碰撞；Game、Innovation、Category Formation 使用三种不同形状，Evidence 只存在于节点/关系详情文献行。directed 边在目标节点外缘显示箭头，undirected 边双端对称且无箭头；320px 改为按年代分组、逐节点列 incoming/outgoing/undirected 的关系等价大纲。Roguelike / Metroidvania 切换只改 `data-theme-match` 和视觉强调，不改变实体 ID、数量、位置或顺序；无 JavaScript 时按钮禁用，但完整网络、原生详情和文献继续可读。

该切片的有效 RED 包括旧过渡页缺少全局网络、边终点最初藏在节点中心、SVG anchor 误用 HTML `.hash`、长作品名内部重叠与 SVG link bbox 中心并不保证存在可见线段。最终以边界投影、`href` attribute、节点 child rectangle 断言和 SVG path 采样点击分别修复。目标 E2E 为 12 passed / 4 project-specific skipped；全量 E2E 为 115 passed / 5 intentional skipped；Astro check 0 errors / warnings / hints、Vitest 88/88、fresh build 104 pages。14 张 1440px/320px、Light/Dark、两种 lens、详情与 no-JS 原图已复核，文档无横向溢出；桌面网络自身保留明确的局部横向滚动。

运行时整站独立审查没有发现非 Atlas 范围的 Critical/Important；唯一发布前 Important 是 README、Roadmap 与 Changelog 仍把 M0 描述成当前产品。发布留档切片因此把 README 改成 v0.2 实际规模与边界，把 Roadmap 收敛到待部署验收，把三职业透镜与全局 Atlas 补入 Changelog，并新增 `Devlog 003`。一条具体资源摘要中的旧“适于学习路径”措辞同步改为“适于结构化学习”，不改变资源分类或数量。

Atlas UI 独立审查最初判定 Not Ready，并给出 5 个 Important：非匹配边的箭头/端点/移动引用仍显得高亮；点击实体会把用户滚到数千像素后的详情；40 项 Evidence 在节点和边中重复渲染；Innovation 的可选时间范围被布局忽略；320px no-JS 页头真实碰撞。修复提交 `0deb96d` 逐项 TDD：非匹配关系改用 ≥3:1 muted + dash 且 marker/端点跟随；JS 详情进入 native dialog 并恢复焦点/page/canvas 位置；Evidence 集中为 40 个唯一实体，引用可返回网络；Innovation/Category 支持 range、Game 拒绝 range；移动 tools/nav 独占行。三个 Minor——滚动提示、方向化 ARIA/稳定关系顺序、派生计数——也一并关闭。

该修复最终 `npm run build` 为 check 0 errors / warnings / hints、Vitest 90/90、105 pages；Atlas + Theme targeted 为 27 passed / 7 expected skipped；完整 E2E 为 120 passed / 8 expected skipped。8 张新原图覆盖 1440px/320px、Light/Dark、dialog、Evidence return、outline 与 no-JS header。原 reviewer fresh 复审 target unit 12/12、Atlas/theme/base-path 29 passed / 7 expected skipped，并确认 5 Important / 3 Minor 全部关闭，最终结论 Ready；无 4321/4337 listener 残留。

主任务在所有并发实现与复审结束后又执行了一次独立串行发布门禁：`npm run check` 为 0 errors / warnings / hints，Vitest 90/90，fresh build 105 pages，完整 E2E 为 120 passed / 8 intentional skipped，0 failed；`npm audit --audit-level=high` 为 0 vulnerabilities，`git diff --check` 与 credential filename scan 均无输出。最终视觉矩阵位于 `/tmp/learn-about-games-v02-final/`，覆盖首页、能力地图、职业方向、成长资源、Innovation Atlas、About 与 Devlog 的 1440px Light 和显式 320px Dark，并额外检查 Atlas dialog 与 320px no-JS；所有页面的 HTML/body `scrollWidth` 等于 `clientWidth`。临时 4338 preview 已精确停止。以上仍是本地发布候选证据，不冒充 GitHub Pages 已部署事实。

发布候选 `b0c575712a2461ef4b72f449e7097d8b61371079` 已以 fast-forward 推送到远端 `main`。HTTPS push 因本机凭据身份 `Medill-East` 对组织仓库返回 403；SSH key 同一身份具有仓库写权限，因此改用已配置 SSH remote 完成非强制 push，没有改写历史。GitHub Pages run `31282121063` 的 build 成功，但 Chromium E2E 因 Atlas 返回位置断言在 Ubuntu 得到 3px 的垂直取整差异而失败，artifact/deploy 均未执行。运行时仍正确恢复焦点、横向画布位置与几乎同一视口；测试合同改为 pageX/canvasX 精确相等、pageY 允许不超过 4px 的浏览器取整差异，并用 CI 环境变量、5 workers、20 次重复得到 20/20。

修复 commit `0b6bfb462f7b697ac526a9c6bf48a95878ed642a` 随后快进到 `main`。GitHub Pages run `31282275108` 的 build、Chromium E2E、artifact upload 与 deploy 全部成功。公开站浏览器验收确认：首页当前态、54 个 Map 节点与 64 条关系、3 个 Career Lenses、20 个 Source 与 128 个 Work Item、七维资源筛选、27 个 Atlas 节点／25 条关系／40 项 Evidence、Metroidvania 透镜、Atlas“当前选择”dialog、About 与 Devlog 003 都可用；八条关键路由为 HTTP 200。首页、Map、Career、Resources、Atlas、About、Devlog 的 320px HTML/body 均无页面级横向溢出。v0.2 至此完成发布验收。

## 用户反馈与结论

### 能力地图

通用地域图和后续五条阅读分组都没有充分表达 PlayWithExperiences 的方法来源。当前地图以 EGDS 为唯一知识骨架：体验旅程和情绪曲线进入感受、理解、解构、重构，再由重构进入叙事、美学与表现、玩法与挑战；其余分支分别说明从计划到落地、团队、产品／盈利与更广语境。一屏先看完整方法骨架，具体 Capability / Knowledge Topic 按需展开。

### 职业方向

现有画像只显示卡片底部小字，影响不可感知。v0.2 让画像真正改变地图强调并提供可点击摘要，但不隐藏其他能力、不生成职业分数。命名使用 `AAA · Game Designer`，不使用斜杠。

### 成长资源

M0 只有两条资源，尚未开始规模收集。用户否决候选、审核、精选和统一学习路径，因为这些要求平台承担无法客观维持的强判断。v0.2 统一收录和整理资源；外部评价只按原始来源、指标与日期如实展示，不生成站内评分。

### Innovation Atlas

Atlas 是一张全局横向时间网络。时间只控制横轴，关系可以跨越很长时期。Roguelike、Metroidvania、关键词与品类是同一网络的高亮透镜，不拥有孤立子图。

### 信息架构与主题

一级导航固定为能力地图、职业方向、成长资源、创新变迁、关于本项目；英文术语固定为 Expertise Map、Career Lenses、Learning Resources、Innovation Atlas、About。项目治理资料进入 About。全站增加跟随系统、浅色、深色三态主题。

## 已实现内容范围

- 28 个 EGDS Framework Node、4 条显式方法关系、42 个 Capability、12 个 Knowledge Topic、64 条能力关系。
- `AAA · Game Designer`、`AAA · Creative Director`、`Indie · Solo Developer` 三个参考画像。
- 20 个 Source、128 个真实 Work Item、15 个无顺序资源主题，保留 Source 与 Work Item 粒度。
- 全局 Atlas 27 个节点、25 条有证据关系、40 项 Evidence，首批透镜为 Roguelike 与 Metroidvania。

## 对抗性边界

- 不把资源收录状态伪装成质量认证。
- 不把学习主题集合改名后继续偷偷规定顺序。
- 不把职业画像和个人状态合并成差距、分数或完成率。
- 不让主题筛选删除 Atlas 上下文。
- 不添加没有关系说明的装饰连线。
- 不让年份或相邻位置自动暗示历史因果。
- 不为了极端边界提前引入后台、账号、同步、实时抓取或复杂迁移框架。

## 规格对抗审查后的修正

- 地图使用确定性的 1180px EGDS 骨架布局；框架节点、实体扩展和关系路径有独立几何合同，测试同时验证输入反转稳定、零盒碰撞、结构／过程线不穿无关节点和一屏高度预算，不能只靠 DOM 数量冒充地图。
- Source 与 Work Item 都是可发现实体；Work Item 保存来自研究 intake 的唯一 canonical identity，Source 有独立详情页。
- 访问模式与地区限制拆分；100-150 是内容发布目标，不是驱动填充的构建硬门槛。硬门槛是真实 Source、唯一 canonical identity、至少一个核查过的 Access Version 与可解释主题关联。
- Capability Relation 只连接 Capability；跨 collection 引用由实体类型确定，ID 在各 collection 内唯一。
- Career Lens 公开 `basisLinks` 与复核日期，priority/responsibility 使用受限枚举；投影结果不读取个人状态，也不产生中英文分数语义。
- Atlas 关系显式区分有向与无向，Node、Relation、Theme 共用同一标签 taxonomy；范围节点显示时间 span，Game 只显示发行年。
- 移动验收显式设置 320px，不把 Pixel 7 配置误写成 320px；主题矩阵覆盖系统浅/深与两种显式反向覆盖。
- 发布证据链固定为 runtime release SHA/run → live verification → 可选 evidence commit，不要求 metadata commit 无限自证。

## 2026-08-11 整合探索完善

发起人确认三项调整可以并行实施：职业方向不再拥有第二张地图，而是作为能力地图内的三个职业标签；成长资源改为可展开全表或单个主题子表；Innovation Atlas 只有明确进入地图模式后才接管普通滚轮，并继续补充通往 Pong 的早期史材料。书面设计与四份实施计划保存在 `docs/superpowers/specs/2026-08-11-integrated-exploration-refinement-design.md` 及同日 plans 目录。

地图切片将顶层导航收敛为能力地图、成长资源、创新变迁、关于本项目四项。`/careers/` 构建为指向 `/map/#career-lenses` 的静态兼容页，三份画像复用唯一 CapabilityMap。布局测试发现根节点与五分支视觉中心偏 32px，修复后对齐；职业应用曾使地图向下跳 545.5px，最终选中画像使用 controls 后、map 前的固定 17rem 紧凑 disclosure，应用／切换／聚焦的 map top 位移均为 0。独立审查发现初版把 evidence 放在地图之后；`cc81bf8` 已把 mapping、basis、caveat、reviewedAt 与 sources 合并回标签旁，无 JavaScript 仍保留三份自然高度原生 disclosure。

Resources 切片以 15 个 Resource Topic 作为无顺序子表。默认页面高度从 1440px 的约 21,476px 降至 2,378px，320px 从约 44,755px 降至 4,055px；用户可以只展开一个主题，也可以展开全部后使用七维事实筛选。20 个 Source 进入 `/resources/sources/`，128 个 Work Item 保持唯一渲染。独立审查发现 `resourceTopicIds[0]` 缺构建保障；`5ed1ff7` 现在以 `RESOURCE_PRIMARY_TOPIC_REQUIRED` / `MULTIPLE` 拒绝零主题或多主题条目，raw 128 项均恰属一个主题。

Atlas 切片增加显式地图模式：模式外 wheel 滚页面；模式内 wheel 依据 delta 围绕指针连续缩放，wheel 与 drag 写入均由 rAF 合并，Esc 退出；按钮、键盘、no-JS 和 `<=1150px` 完整时期大纲继续存在。早期史新增 9 节点、5 条关系、9 项 Evidence 和 1 Tag，总量为 36/30/49。对象类型扩展为实验装置、实验程序、系统原型与商业硬件；没有 Tennis for Two → Pong 伪边，也没有无条件“Pong 第一”的表述。独立审查发现新类型的逆序 endYear 可绕过 validator，且时间轴缺早期刻度；`209ae9c` 统一校验所有范围并补 1958、1960、1970。

所有这些行为均为本地 Private 候选，没有 push、没有恢复 Public、没有启用 Pages。用户要求的可访问交付是 fresh build 后的本机预览 `http://127.0.0.1:4321/Learn-About-Games/`。

连续性文档与 Devlog 写入后的最终 fresh gate 为：Astro check 67 files、0 errors / warnings / hints；Vitest 139/139；静态 build 107 pages；完整 Playwright 216 项中 201 passed / 15 intentional skipped / 0 failed。第一次完整 E2E 有 4 个失败，全部是 `visible-skeleton` 仍锁旧的 Atlas 27/25/40 与旧 Changelog 句子；产品断言均已通过。测试更新为当前 36/30/49 与“本轮尚未推送或部署”后，定向 29 passed / 1 skipped，完整套件原样重跑得到上述 GREEN。

## 2026-08-11 EGDS 层级、全屏透镜与多语言资源扩展

发起人复核共享列版本后确认：几何对齐并没有自动产生清晰层级。根、主分支、过程阶段、设计杠杆与能力群仍使用近似的开放框和细线，背景网格也在争夺注意力，因此父级和子级需要靠逐线追踪才能辨认。发起人同时要求 Atlas 在全屏地图模式内继续保留证据透镜，并继续扩展尚未覆盖的学习资料。

本轮文字规格选择“主干、分支领地、子节点”作为唯一层级语法，而不是再加一组随意分类色或封闭卡片。五条领地由现有 parentNodeId 与确定性盒几何派生，体验设计内部另有过程子带；根主干、分支轨、子级轨、过程箭头和背景网格分别使用不同可测权重。领地只用于解释当前 EGDS 作者结构，不增加数据实体、重要性、评分或学习顺序。

Atlas 保留唯一一组 catalog-derived 透镜控件，并把它移入会成为全屏的 network workspace。键盘切换 Roguelike／Metroidvania 后，地图模式、scale、scrollLeft／scrollTop、搜索文本、节点 style 与关系 path 均保持；没有复制 button、ID、payload 或 listener。Light／Dark 的 1440px 全屏原图已经复核。

资源研究第二批用 Agent Reach 的 Exa via mcporter 发现候选、Jina Reader 与官方页面核验。Exa 第 12 次精确查询触发免费额度 429 后停止使用；没有把搜索摘要当成收录证据。第二批新增 16 个 Work Item：10 项中文、6 项日文；发起人随后明确后续顺序应为中文优先、英文其次，已经核验的日文资料继续保留。第三批据此补入 10 项英文课程、文章、网站与论文，不用演讲填充数量。总量成为 38 Source／174 Work Item／188 Access Version。canonical 重复、Source／Work URL 冲突与多主题错误均为 0；没有评分、排名、review status 或 external signal。

本轮规格和计划是 `2026-08-11-egds-hierarchy-atlas-lenses-resource-expansion-*`。实现按三个低重合切片并行：高推理 Sol 负责层级几何与视觉，高推理 Terra 负责 Atlas 控件状态，高推理 Sol 负责多语言研究；主任务保留整合、对抗审查、文档和最终门禁。所有提交都只存在于本地 Private 候选，没有 push、没有启用 Pages。

英文补充合并后的最终 fresh gate 为：Astro check 67 files、0 errors／warnings／hints；Vitest 144／144；静态 build 125 pages；完整 Playwright 208 passed／18 intentional skipped／0 failed。独立数据探针确认 174 Work Item／38 Source／188 Access Version，canonical URL、Source homepage 均无重复，Source／Work URL 无碰撞，Source 引用与单一主要资源主题均完整。

## 精确下一步

1. 由发起人在本地预览真实使用合并后的地图职业标签、资源子表与 Atlas 地图模式；本地候选不自动推送。
2. 继续收集、去重和归类资源，优先补现有主题覆盖、Access Version 与可核查 Source，不增加站内评分或强制路径。
3. 沿早期电子游戏史补充 1970s 商业化、家用系统与 arcade 分化；先补 Evidence，再补关系，不为视觉密度造边。
4. 用真实触控板持续验证 Atlas 模式的连续缩放、边界释放和长时间帧稳定；模式外普通滚轮必须继续属于页面。
5. 只有用户确认核心体验达到可用门槛后，才另行决定是否推送候选、恢复 Public、重新启用 Pages workflow并执行线上验收。

## 当前未决风险

- `mindset-problem-solving-tools` 与 `leadership-management` 仍是作者地图中的有效 landmark，但当前分别没有或很少直接 Capability；界面如实显示内容缺口，不能用不相关能力填满。
- 当前已收录 209 个 Work Item，但覆盖密度并不等同于主题质量认证；后续贡献仍需维持 canonical 去重、Source 归属、Access Version 与能力/议题引用完整。中文资料在能逐页核验时优先补充，英文一手资料不再因数量较多而暂停。
- 资源筛选只表达目录事实；不能把外部公开计数或观察转译成本站推荐、评分、排名或审核结论。
- 当前中文界面与多语言资源元数据不等于完整双语产品；英文界面仍属后续范围。
- Atlas 当前有 10 个非排他 Genre Family 和 5 条证据透镜；尚无谱系的 Family 必须先增加可核查节点、关系与 Evidence，不能把浏览目录当成已完成的历史沿革，也不能为视觉密度补无证据边。

## 私有完善实现状态

较早的五项私有完善已经在远端 `codex/v02` 留档；当前远端头为 `d982ceb0f0cd2cf342f8b80d5256b2f69ba90d42`。其 Resources 保持 20 个 Source、128 个 Work Item、140 个 Access Version 与 12 条外部观察的单列目录；Atlas 保持 50%–200% 受约束视口、适应全图、拖拽、键盘平移，以及 27 节点索引的中英文搜索和时间／名称排序。

EGDS 本地候选从 implementation base `84e36d55171cafcdf8e809e53d4e4871479732dc` 演进到 runtime `fce67d18947020f292d9384f6164baf2ab69699f`，尚未推送或部署。它完成 28/4/42/12/64 数据合同、确定性布局、公开详情路由、交互地图、三 Career Lens 事件桥和旧 ontology 退休。逐任务审查修复包括悬空关系、locale 不稳定排序、路径穿盒、outline 可访问性、响应式焦点所有权、无效 public event、Career duplicate mapping、Atlas breakpoint 耦合、当前 Methodology 旧语义和 7.7KB 无消费者 CSS。

实施中的对抗审查修复了 typed ID 冲突、桌面 no-JS 缺少关系文字等价物、Career 整节点降透明度、资源事实区错误退化为单列、Atlas 中间宽度无法诚实适应全图、普通滚轮被内部画布截获、lost pointer capture 残留、节点索引无 JavaScript 缺局部说明等问题。最终质量审查又发现搜索输入需要 NFKC 归一化且中文 `恶魔城` 标签缺失，以及搜索与主题双重弱化会把可点击节点压到 4.5:1 以下；修复提交 `08be06d` 统一使用 NFKC / locale lowercase / trim，补充中文 Tag，并用不透明 token、虚线边框与局部强调替代整节点 opacity。Light / Dark、1440px / 320px 的搜索+主题组合已由真实 computed contrast 锁定至少 4.5:1。

主任务随后串行执行最终本地门禁：`npm run check` 为 0 errors / warnings / hints；Vitest 为 105/105；fresh build 生成 105 pages；完整 Playwright 为 142 passed / 16 intentional skipped / 0 failed；`npm audit --audit-level=high` 为 0 vulnerabilities，`git diff --check` 与脱敏 secret filename scan 均无输出。首次完整 E2E 曾有桌面／移动各 1 项失败：旧 skeleton 测试用全局 heading 文本寻找“体验与玩家”，而新地图中主干与同名 Domain 都是合法 heading；根因确认后只把断言收窄到可见的 Domain 容器，定向为 25 passed / 1 desktop-only skipped，完整 E2E 复跑得到上述 142/16。产品 DOM、命名和视觉层级没有为测试改写。

独立总审查对 `05beed7..1a1e2d1` 给出 Ready，0 Critical / Important / Minor；reviewer 自行复跑 fresh build、105/105 unit、142 passed / 16 intentional skipped E2E，并核验 Light / Dark、1440px / 320px、无 JavaScript、typed identity、27/25/40、repo PRIVATE 与 workflow `disabled_manually`。主任务随后以 SSH 非强制快进远端 `codex/v02` 从 `d758bd5` 到 `1a1e2d1`；GitHub API 复核分支 SHA 精确匹配，没有更新 `main`、没有触发 Pages、没有改变仓库可见性。

## EGDS 能力地图重构方向

发起人在私有复核后进一步指出，五条通用阅读主干虽然比地域便当盒清楚，但仍把一组行业概念平铺在一起，缺少 PlayWithExperiences 自身的方法论来源。“体验与玩家”与“玩法、空间与表达”也存在语义重叠。能力地图应直接以发起人原有 EGDS Expertise Map 为蓝本，而不是继续修饰任何人都可能得到的通用分类。

已确认的新主骨架沿用原图的条件与过程：体验设计、从计划到落地、如果有团队、如果希望形成产品与盈利、如果讨论的不只是游戏。体验设计内部固定为体验旅程／情绪曲线以及感受 → 理解 → 解构 → 重构；重构再进入叙事、美学与表现、玩法与挑战三类设计杠杆。创新在第五分支保留简短入口并连接 Innovation Atlas，历史网络不复制回能力地图。

地图现在明确区分 EGDS 方法节点、Capability 与 Knowledge Topic。方法节点承载作者框架，不参与个人进度或 Career Lens；Capability 才能记录实践状态、接受画像投影并连接资源；Knowledge Topic 只提供理解背景。默认采用“一屏骨架 + 按需展开”：根、五主分支、EGDS 核心链、三类杠杆和所有第二层能力群持续可见，同一时间只展开一个能力群的具体节点。折叠能力群可以显示职业画像的事实计数，但不生成匹配度、完成率或差距。

代码审计确认当前滚动发卡有具体结构诱因：`.capability-map__canvas` 同时使用页面内双向 `overflow: auto`，页面本身又可滚动，触控板斜向手势会在两层滚动上下文间竞争。新设计取消地图纵向内部滚动；默认总览按可用宽度稳定布局，展开只增加页面高度，中间宽度与 320px 使用关系等价大纲。普通滚轮始终属于页面，地图不复制 Atlas 的滚轮缩放。

本次只形成书面设计，不改运行时。成长资源的媒介类型标签／进一步压缩、Atlas 的普通滚轮缩放方式与从早期游戏史继续扩充，均拆为后续独立切片。

## 并行设计研究结论

发起人提醒三个子系统在设计阶段没有高重合度，可以由 sub-agents 并行研究、主任务最终审核。主任务据此保留 EGDS 架构与整合判断，把 EGDS 规格对抗审查交给高推理 Terra，把资源真实数据／密度合同交给中等推理 Terra，把 Atlas 交互与早期历史证据交给高推理 Sol；三个任务均只读，不争抢共享 CSS 或修改工作树。

EGDS reviewer 首轮指出三项核心缺口：没有 54 个实体的主要归属表；`parentNodeId` 无法表达感受 → 理解 → 解构 → 重构的过程边；Career 从折叠状态聚焦能力时缺少地图状态协议。规格修正后新增正式 root、固定框架 ID、`contains`／`process-next`／`links-to` 语义、42 Capability + 12 Knowledge Topic 精确映射、原图 landmark 去向、旧 Domain/mapGroups 原子退休、Career 原子聚焦、叶节点双动作、滚动与几何门禁。第三轮 reviewer 结论为 Ready；唯一 Minor 也已转成三条固定 process edge 和唯一 Atlas link 的精确构建断言。

Resources 只读研究确认真实 catalog 为 128 Work Item、20 Source、140 Access Version、12 外部观察；媒介分布为演讲 68、书籍 27、论文 8、网站 8、播客 5、视频 5、文章 4、课程 3。推荐后续使用“单主列 + 行首类型轨道 + 事实短带”：媒介与 Source 类型同时使用明确文字 tag、边框／低饱和色冗余，默认保留标题、Source、关联原因、语言和访问摘要，完整版本与外部观察进入原生 disclosure。建议把 desktop P50 行高从当前约 142px 进一步压到不高于 112px、320px P50 不高于 190px；不改变筛选、顺序、实体边界或站内无评分原则。

Atlas 研究不建议无条件劫持普通 wheel。推荐 cooperative 默认 + 明确“进入地图模式”：默认普通滚轮滚页面，进入模式后普通 wheel 围绕指针连续缩放、拖动平移，Esc／离开区域退出；未进入时 Ctrl/Command + wheel 继续可用，达到缩放边界后把滚动还给页面。早期历史研究明确 PONG 不能写成“第一个电子游戏”，而应区分文档化设计、实验装置／程序、系统原型、量产商业产品和商业突破。首批候选包括 CRT Amusement Device、Nimrod、OXO、Tennis for Two、Spacewar!、TV Game Unit #1、Brown Box、Galaxy Game、Computer Space、Magnavox Odyssey、Pong 与 Home Pong；只有得到直接证据的影响／派生／原型谱系才进入关系图。Agent Reach `v1.5.0` 已核为最新版。

## EGDS 实施里程碑与根级验收

EGDS implementation range 是 `84e36d55171cafcdf8e809e53d4e4871479732dc..fce67d18947020f292d9384f6164baf2ab69699f`。数据切片先新增并锁定 28 个 framework node、3 条 `process-next` 和 1 条 `links-to`；42 个 Capability 与 12 个 Knowledge Topic 各有唯一 `frameworkNodeId`，64 条 Capability relation 保持原语义。纯布局 helper 以稳定 code-unit order 生成 1180px 骨架、一个可选展开带和 obstacle-aware 关系路径；输入反转、重复 ID、无效端点、碰撞与穿盒都有失败合同。

交互地图由 `CapabilityMap` 独占 `expandedFrameworkNodeId` 与 `selectedEntityKey`。默认只显示 28 个 EGDS 方法节点，实体和 64 条关系都在 server HTML 中但不抢占视线；一次只展开一个叶容器，选中 Capability 后只显示直接关系。Career Explorer 不直接改地图 DOM，只发送经过验证的 apply / focus / clear 事件；Career priority、个人实践状态、展开和关系选择互不覆盖。无 JavaScript 时，原生层级大纲保留 42 个 Capability、12 个 Knowledge Topic、64 条关系说明、详情链接和三份 Career 画像摘要。

旧 generic ontology 已原子退休：删除 `domains.json`、`map-groups.json`、`domainId`、手工 position、旧 catalog/validator/type、generic geometry helper、422 行无消费者样式和当前 Methodology 里的旧实体定义。精确 source gate 对旧字段、helper 与 selector 为 exit 1、零输出；42/12 数据与迁移前比较只删除退休字段，ID、顺序、内容和 EGDS placement 不变。

逐任务采用实现 → 规格审查 → 质量审查 → 原实现者修复 → 原 reviewer 复审的闭环。实际发现并关闭的错误包括：EGDS relation 端点可悬空、locale-sensitive 排序、关系路径穿节点、展开 leader 覆盖节点边、响应式状态与焦点失去所有权、invalid public event 部分写入、Career duplicate mapping 造成计数漂移、double bootstrap、Atlas breakpoint 被 EGDS media query 耦合、公开 Methodology 仍定义旧实体，以及生产 bundle 保留 7.7KB 无消费者 CSS。最后一轮 Task6 review 结论为 Approved，0 Critical / Important / Minor。

根级浏览器验收截图位于 `/tmp/learn-about-games-egds-final/`，已按 original resolution 逐张查看。1440px Light / Dark 默认画布完整显示五条分支，scene height 为 720，28 个 framework node 零重叠；默认可见实体 0、可见 Capability relation 0。展开 Playtest 容器后只出现 6 个 Capability + 1 个 Knowledge Topic，仍为零重叠；选择 Playtest 后只出现其 4 条直接关系。普通滚轮分别落在空白画布、framework node 和实体上时，页面 Y 都增加 220px。1024px 与 320px 使用大纲、canvas 隐藏且无页面横向溢出；1440px / 320px 无 JavaScript 均保留 42 个 Capability 链接、12 个 Topic 链接和 54 个 disabled 关系控件。

三份 Career Lens 在 Light / Dark 都能应用；framework node 与 Knowledge Topic 的 Career attributes 始终为 0。清除 Career 后，已展开的 `playtest-evidence-iteration`、已选择的 `capability:playtesting` 与 localStorage 个人实践记录都保持，只有画像属性消失。1024px / 320px 聚焦打开正确的原生祖先 disclosure；320px no-JS 有 3 个 disabled 画像按钮、3 份原生摘要和 62 个依据／能力／资源链接。

根级初次 fresh gate 为：Astro check 64 files、0 errors / warnings / hints；Vitest 130/130；静态 build 105 pages；完整 Playwright 200 tests 中 185 passed / 15 intentional skipped / 0 failed。最终全局 reviewer 随后在 1024px / 320px 真实交互中发现三个测试盲区：JS 原生大纲可同时手动打开多个叶、1024px 递归缩进把深层文字压成近似逐字竖排、折叠叶缺少 Career 三档事实计数。修复提交 `fce67d1` 让 JS 只保留当前叶而 no-JS 继续原生多开，在 `<=1227px` 使用单列紧凑大纲，并把同源 Career count 投影到响应式 summary。复审结论为 Approved，0 Critical / Important / Minor；fresh build 仍为 0 diagnostics、130/130、105 pages，完整 Playwright 更新为 191 passed / 15 intentional skipped / 0 failed。

仓库 API 仍返回 `PRIVATE`，deploy workflow 仍为 `disabled_manually`；远端 `codex/v02` 是 `d982ceb0f0cd2cf342f8b80d5256b2f69ba90d42`，本地 runtime `fce67d18947020f292d9384f6164baf2ab69699f` 与本里程碑后续文档均未推送。下一步不是自动发布，而是发起人私有复核；资源媒介／密度、Atlas engaged wheel mode 与早期电子游戏史 ontology 是三个独立后续切片。

## 地图对齐、画像阅读区、Atlas 全屏与资源扩充

发起人用两张本地预览截图指出三个仍可直接看见的问题：EGDS 各行并未共享同一列系统；Career 的“画像、边界与依据”未选择时留下大面积空白，选择后又被压进固定高度的窄内滚动区；Atlas 虽名为地图模式，却仍只是页面中的小窗口。发起人同时要求继续补充尚未覆盖的学习资源。

地图修复先用纯几何测试确认旧实现确实存在两套列中心：体验阶段为 `[390,535,680,825]`，其他四节点行为 `[410,600,790,980]`。提交 `66abc47` 统一为 `[390,580,770,960]`、170px 宽和 20px gap，并让 structural、process 与 capability relation path 保存 `fromPort` / `toPort`，测试起点和终点是否命中对应 box boundary center。未选 Career Lens 时整个依据区现在 hidden；选中后只显示一份整宽、自然高度 disclosure，取消 17rem 固定高度、内部滚动和 placeholder。no-JS 仍可展开三份完整画像。

Atlas 提交 `757ff22` 把显式地图模式改为固定 `inset:0`、`100dvh` 的全视口工作区；工具条占固定行，地图 viewport 填满剩余空间。进入时保存页面位置和焦点、锁定 html/body overflow 并让背景 inert；Esc、退出按钮或断点变化恢复页面、画布和焦点。native dialog 继续位于 top layer；从弹窗前往 Evidence 会临时释放全屏，返回时恢复同一地图模式、画布位置与节点焦点。

资源研究使用 Agent Reach。doctor 确认 Exa via mcporter 和 Jina Reader 可用；Exa 免费额度中途返回 429 后，不用搜索摘要替代证据，而以 Jina、官方／作者／出版社页面逐条核验。提交 `ece3285` 新增 20 个 Work Item、9 个 Source 与 21 个 Access Version，目录总量为 148／29／161。新增媒介为文章 4、书籍 2、课程 1、论文 2、播客 6、网站 5；不新增评分、排名、审核状态或 externalSignals。`encounter-space-composition` 从零增至 3 条直接资源，`monetization-experience-alignment` 从零增至 4 条。Owlcat Learning 作为一个 Work Item 保存英文原始版本与官方简体中文 Access Version。

主任务同步当前 README、Roadmap、Changelog、Devlog 与三个公开 E2E 数量合同。整合后的 fresh `npm run build` 为 Astro check 0 errors / warnings / hints、Vitest 141/141、116 pages；完整 Playwright 为 203 passed / 17 intentional skipped / 0 failed。地图、Career 与 Atlas 的 Light／Dark、多断点原图由实现者和主任务分别以 original resolution 检查，未发现页面级横向溢出。当前提交均只存在本地 `codex/v02`，没有 push、没有启用 Pages；本机重新启动 base-path preview 后由发起人继续查看。

## 横向 EGDS、Genre Atlas 与资源 stop-condition 扩展

发起人进一步明确三项方向：EGDS 既然采用从左向右阅读，就不应再混用上下展开；成长资源继续补充；Innovation Atlas 应先列常见 genre，再逐步补全常见品类的历史沿革。书面设计把真实用户决定拆成三层：EGDS 的 x 轴只表达父→子包含进展，Capability relation 不伪装成结构线；Genre Family 只提供宽泛、非排他入口；Theme 才是需要节点、关系与 Evidence 共同支撑的历史谱系。

EGDS 提交 `13ae80c` 将所有 parent-child 结构统一为从父节点东口连向子节点西口的左→右布局，总览和聚焦共用同一方向语法；`bea3a76` 与 `66cc087` 保留 Career 聚焦事实、响应式五主分支计数和边界避让。几何单测最终为 24/24，Map／Career／Profile 双项目为 90/90；独立规格与质量复审均为 Approved，未发现剩余 Critical／Important／Minor。

Atlas 数据提交 `829b718` 建立 10 个常见 Genre Family，并新增 Platform 与 Adventure 两条谱系切片。UI 提交 `a0b0fab` 把 Family 原生 disclosure 和唯一一组透镜控件放进同一网络／全屏工作区；Family disclosure 使用原生互斥，避免面板同时展开互相覆盖。当前 5 条 Theme 是早期电子游戏与商业化、Roguelike、Metroidvania、平台与跳跃游戏、解析器冒险到图形冒险；总量为 48 nodes／36 relations／61 Evidence。透镜只改变强调，不隐藏、不重排、不移动节点，scale、pan、search 和 map mode 保持。规格审查结论 Ready；质量审查发现同 DOM 二次执行会绑定第二套 controller、扩展 provenance 可留下半套字段、端点测试只验单一坐标三个缺口。修复提交 `a7d694c` 增加幂等 guard、原子 provenance bundle 和完整边界线段断言；target unit 91/91，Atlas／Theme／Base 双项目 45 passed／19 intentional skipped。

资源研究按中文优先、英文其次执行，但证据门槛高于预设批量。Exa 在第一轮指定查询即返回 429 后停止；Jina 与具体官方页面只确认三篇 Level Design Book 原页和两篇腾讯完整实录。MOOC 搜索页只有平台说明，CNKI 页面证书失败，因此没有凑满原定数量。提交 `2a1e9ee` 把 catalog 扩为 38 Source／179 Work Item／193 Access Version；`f51a5cd` 收窄两项过度议题映射并修正研究记录；`5375b54` 与 `ac4f441` 增加统一 URL 归一化、跨 Work ownership 和 notebook 对账／mutation contracts。最终资源 reviewer 结论 Approved，目标测试 65/65、全量 unit 158/158、Resources 双项目 28/28。

本轮没有 push、没有恢复 Pages、没有改变仓库 Private 状态。公开 README、Roadmap、Changelog、Devlog 005 与 visible-skeleton 合同只更新当前候选数字，历史部署段继续保留当时真实的 20／128 与 27／25／40，不改写过去。

最终 root 级 fresh gate：`npm run build` 为 Astro check 67 files、0 errors／warnings／hints，Vitest 159/159，126 个静态页面；完整 Playwright 为 214 passed／20 intentional skipped／0 failed；`npm audit --audit-level=high --omit=dev` 为 0 vulnerabilities。GitHub 只读核验继续返回 Private，deploy workflow 为 `disabled_manually`，Pages API 为 404。最终提交后只重新启动本机 `127.0.0.1:4321` base-path preview，不 push、不部署。

## 可逆地图交互与 GDC／作者资源扩展

发起人用本地截图确认两个交互问题。Atlas 的角色扮演 Family 中，Roguelike 看起来可点却不是按钮；选中 Family 后目录形成悬浮内滚区域，空 Family 又没有明确说明。EGDS 虽已统一左→右，展开一个能力群时仍会隐藏并重排总览，且只能依赖“返回全图”恢复。发起人授权主任务按推荐方案直接完成，不再等待逐项审查。

Atlas 提交 `c0382a6` 将每个 Family 内的 Theme 引用都改为共享唯一状态的真实按钮；空 Family 显示“0 条已核查谱系，待研究”。普通页面保留 Family 目录，全屏地图只显示紧凑的六谱系按钮，不再让目录覆盖 controls 或 canvas。Roguelike 在角色扮演入口可直接选择；切换仍只改变强调，不改变 scale、pan、search、节点／关系位置或数量。

EGDS 提交 `9ac9abb` 把 overview geometry 固定为展开不变量。28 个 framework node、五条 branch territory、structural path 与 process path 在展开前后保持数量、顺序和坐标；具体 Capability／Knowledge Topic 进入独立下方 expansion band。同一“数量”按钮可再次收起，Escape 可撤销展开或当前选择并恢复触发焦点，“返回全图”改为准确的“收起条目”。

资源扩展使用 Agent Reach；Exa 返回 429 后停止，Jina Reader 与 GDC／作者原页用于逐页核验。提交 `c1641d8` 新增 30 个 Work Item 与 30 个 Access Version：20 条 GDC Vault 2025 会话、5 篇 Lost Garden、5 篇 How To Market A Game；Source 总量仍为 38。当前目录为 209 Work Item／223 Access Version，全部继续恰属一个主要 Resource Topic，并保留 canonical ownership、访问方式与检查日期；没有站内评分、排名或审核等级。

本段是脱敏连续性记录，不补造不可访问的逐字对话。仓库与 Pages 状态未改变；本轮提交尚未 push 或部署。对应公开决策见 [Devlog 006](../devlog/2026-08-12-reversible-maps-and-resource-depth.md)，精确过程证据见本文链接的脱敏 transcript。

## 资源表密度、全站换行与新一轮目录扩展

发起人要求资源页默认把事实筛选全部列出，不再让“按事实筛选”成为额外的可开关标签，并希望搜索、计数、展开／收起和筛选尽量同处资源表头。实现移除了外层筛选 `details`，七项事实筛选直接进入常驻紧凑工具条；访问版本仍使用原生 `details`，但桌面关闭态摘要位于 Work Item 同一行末端，打开后的详情使用不透明 `surface-strong` 层，避免透出相邻条目。移动端保留自然文档流和无 JavaScript 的完整可读性。

全站短说明文本增加平衡换行与中文严格断行，重点覆盖首页、EGDS、Career、Atlas、资源页和主题入口，避免第二行只剩一个词或一两个汉字。资源页标题与说明设置有限阅读宽度，避免超大标题在窄列中产生孤立尾行。

本轮按“英文优先、中文继续补、日文低优先级”的方向从 GDC Vault 官方 sitemap 与会话页补入 1000 个新的英文 Work Item。每条使用唯一 batch ID、官方 canonical URL、单一主要 Resource Topic、subscription 访问方式和 2026-08-15 检查日期；不把搜索摘要或录播可用性推断成免费事实。目录当前为 41 Source、2110 Work Item、2124 Access Version、16 Resource Topic；Batch J 的 1000 条会话已写入研究 notebook 并通过 catalog URL／主题／唯一性合同。

Innovation Atlas 本轮没有凭时间或相似性编造新边，而是增加“解谜冒险结构谱系”作为 Puzzle 与 Adventure Family 的非排他研究入口，复用已核查的解析器到图形冒险结构证据，并明确说明它不是完整品类史。全局网络仍为 58 nodes、42 relations、69 Evidence；谱系入口数量更新为 8。

当前阶段的验证记录：资源 catalog 定向测试 22/22，Atlas unit 与 catalog 定向 50/50；资源工具条与 Atlas 新入口在 fresh dist 上通过对应 Chromium 合同；最终提交前仍需串行重跑 `npm run check`、全量 unit、`npm run build` 和完整 Playwright，并重启本地 `/Learn-About-Games/` preview。

本轮整合截图保存在 `/tmp/lag-reversible-review/`，已按原始分辨率检查 Atlas Family／全屏、EGDS 总览／展开、Resources 默认／单表展开六种状态。fresh build 为 Astro 0 diagnostics、Vitest 160/160、127 pages；完整 Playwright 为 219 passed／21 project-specific skipped／0 failed；高危依赖审计为 0 vulnerabilities，提交差异敏感模式扫描无命中。仓库只读核验仍为 Private；本地候选保留在 `codex/v02`，未 push、未部署。

## EGDS 独立方法介绍页

发起人确认能力地图虽然采用 EGDS，方法本身不应只藏在体验设计分支。当前理论内容应以 PlayWithExperiences PKM 为先，2024 年四篇已发布文章则保留为过去真实版本与演进证据。主任务据此选择独立 `/egds/` 页面，而不是 About 内长文或第五个全局导航项；About 与能力地图各提供一个上下文入口，顶层用户任务仍为四项。

当前页面明确两组结构：情绪曲线 → 情绪体验 → 主观感受 → 客观原因 → 设计杠杆的体验因果链，以及感受 → 理解 → 解构 → 重构的工作循环。玩法与挑战、叙事、美学与表现作为可共同使用的设计杠杆。页面同时解释 EGDS Framework Node、Capability 与 Knowledge Topic 的边界，以及生产、协作、产品和更广语境属于 Learn About Games 的应用扩展。

证据层使用四个作者已发布页面和当前 Digital Garden 入口。Learn About Games 不镜像完整 PKM，不把历史文章写成当前模型的上限，也不把 EGDS 写成行业标准、认证、必修顺序、唯一道路或个人评分。页面全部服务器渲染，并以 1440px／320px、Light／Dark、无 JavaScript 和 base path 浏览器合同验收。

最终 fresh 验证为 Astro 68 files 0 errors／warnings／hints、Vitest 160/160、129 pages、完整 Playwright 227 passed／21 project-specific skipped／0 failed，高危依赖审计 0 vulnerabilities。五张原图位于 `/tmp/lag-egds-method/`，均已按原始分辨率检查，页面横向溢出为 0。本轮仍只存在本地 `codex/v02`，不 push、不恢复 Pages。

## 下一轮资料与 Atlas 扩展边界

发起人批准继续补充学习资料以及 Innovation Atlas，并明确“均衡”只能作为检索优先级，不能成为数量配额。最终目标是尽可能覆盖；已核验的好资料不因所属主题已有较多条目而被拒绝，薄弱主题也不能靠弱资料凑数。

本轮拆成两个独立切片：学习资料从从业者访谈、设计基础、手感反馈和原型实验等薄弱主题开始，但同一批一手来源中通过证据门槛的其他资料也可纳入；Atlas 先研究当前为空的 Shooter 与 Strategy 两条谱系。Family 继续只是非排他导航，关系只由开发者、参与者、机构档案、同期文档或可靠历史资料支持，不由相似性和时间相邻生成。对应设计见 [balanced resource and Atlas expansion design](../superpowers/specs/2026-08-12-balanced-resource-atlas-expansion-design.md)。

发起人进一步校正 EGDS 当前模型：情绪曲线是整体体验入口；感受、理解、解构、重构与情绪体验、主观感受、客观原因、设计杠杆一一对应。页面不再把两组结构显示成彼此无关的列表，而是在每个工作动作中直接写出对应层；中文作者术语继续使用“感受”，英文辅助标签保留 `Perception`。

## GDC／Game Developer 资料与 Shooter／RTS 谱系

本批把“均衡”继续限定为发现顺序，而不是各主题数量配额。资源研究使用 Agent Reach 检查 Exa 与 Jina；Exa 出现 405 后停止继续请求，最终纳入项全部由 GDC Vault 或 Game Developer 官方原页逐条核验。提交 `c701241` 新增 16 个 Work Item：7 条 GDC Vault 原始会话和 9 篇 Game Developer 作者文章，重点补原型、玩法测试、生产协作和系统设计。当前资源目录为 38 Source／225 Work Item／239 Access Version；每项仍恰属一个主要 Resource Topic，不新增站内评分、排名或审核等级。

Atlas 研究建立第一人称射击与即时战略两条选择性 Theme，而不是宣称完整品类史。Shooter 新增 Maze War、Catacomb 3-D、Wolfenstein 3D、Doom、Quake 与 Half-Life；RTS 新增 Dune II、Warcraft、Warcraft II 与 StarCraft。只纳入开发者回顾、机构馆藏或同期材料能够支持的 6 条有向关系；不连接 Spacewar!／Maze War 到 1990 年代 FPS，不把 Dune II 写成无条件“第一款 RTS”。提交 `fa8ac11` 后 Atlas 为 58 nodes／42 relations／69 Evidence／7 themes／10 families。

内容增加把 Atlas scene height 从 1120px 提高到 1240px，并暴露旧的 fit 语义错误：手动缩放下限 50% 会让“适应全图”仍裁掉底部。修复先以 unit 和 browser 取得 RED，再让 fit 在必要时低于手动下限；加减按钮、普通 wheel 与重置仍保持 50%–200%。Light Shooter 与 Dark RTS 全屏实测 scale 为 0.60645、四边完整落在 viewport 内；320px no-JS 保留 58／42／69 且页面横向溢出为 0。

Evidence provenance 审查提交 `7893272` 将 `sourceKind`、`institutionOrAuthor`、`checkedAt`、`locator` 与 `boundedClaim` 设为每条必填，`publicationDate` 与 `stableId` 只在可核实时填写，并为既有 Evidence 补齐来源上下文；关系端点测试同时锁定完整边界线段。最终 fresh build 为 Astro 68 files、0 diagnostics，Vitest 165/165，130 pages；Atlas／Theme／Base 双项目 48 passed／20 project-specific skipped，Resources／Playtest 40/40，完整 Playwright 250 项为 229 passed／21 project-specific skipped／0 failed。四张视觉证据位于 `/tmp/lag-final-review/`。仓库仍 Private、Pages 仍禁用，本轮不 push；提交后重新启动 base-path 本地预览。

## 资源目录单行密度修正

发起人继续指出资源页的 Work Item 行仍然过宽、访问版本入口独占第二行，要求尽量在同一行看见更多事实。主任务保留原生 `details` 和无 JavaScript 可读性，只把“查看访问版本”移入桌面行末端；展开内容进入该行下方的独立详情区，不再把关闭态行撑成两行。移动端仍按标题、事实、访问和详情顺序自然堆叠。

本次只改 `ResourceResults.astro`、资源页 scoped CSS 与资源 E2E。新增浏览器合同要求 1440px 下每个版本入口摘要距行顶不超过 24px、落在访问列右侧；详情顺序、搜索、筛选、Source 路由、无 JavaScript 与 320px 横向溢出合同保持不变。fresh 门禁为 Astro check 0/0/0、Vitest 169/169、135 pages；Resources Chromium／mobile 34/34。仓库仍 Private，本地预览固定为 `/Learn-About-Games/resources/`，未 push 或部署。

## 42. 资源主题映射审计与职业条目修正

发起人指出 `Your Game Career – What You Need to Get Hired` 被放进“手感与反馈”。核对 GDC Vault 官方页面后确认它属于 `Game Career Seminar`，并带有 `Game Career / Education` 标签；原条目的视听反馈摘要、能力映射与主题均是批量导入模板错配。主任务对 1110 条资源做标题、摘要、来源和现有主题的高置信冲突扫描，先修正 8 条明确的职业／教育转行业／工作环境会话，新增 `career-industry-practice`（职业与行业实践）主题；其余仅凭标题无法确定主主题的营销、奖项、AI、社区等候选保留待来源页复核，不做自动挪动。

修正后目录仍为 41 Source／1110 Work Item／1124 Access Version，Resource Topic 为 16；新增回归测试确保 8 条职业会话各自只有该主题且不再落入 `game-feel-feedback`。定向 catalog 73/73、Astro check 0/0/0、fresh build 170/170（136 pages）通过；相关浏览器回归中同步了公开 README 的旧 15 主题文案。官方依据：[GDC Vault session page](https://www.gdcvault.com/play/1011932/Your-Game-Career-ndash-What)。本地预览保持在 `http://127.0.0.1:4321/Learn-About-Games/resources/`，仓库仍 Private、未 push。

## 43. 资源表头工具栏与访问版本面板

发起人指出事实筛选独占大面板、搜索和资源表割裂，且访问版本浮层会透出后面的条目。主任务把搜索、事实筛选、总 Work Item 数和展开／收起操作移入资源表头：桌面同一工具栏横向排列，事实筛选折叠为可展开 details；初始无筛选时增强态收起，URL 带筛选时保留打开，移动端自然折行。访问版本详情使用 `surface-strong` 不透明表面和独立层级，移动端仍回到文档流。

先以 2 条浏览器 RED 锁定表头归属与面板颜色，再 GREEN。最终 Resources／Playtest 桌面与移动 50/50，新增合同通过；fresh `npm run build` 保持 Astro check 0/0/0、Vitest 170/170、136 pages。本地预览继续为 `http://127.0.0.1:4321/Learn-About-Games/resources/`，仓库仍 Private、未 push。
# 2026-08-15 checkpoint：事件优先 Atlas 与资源目录密度

- 当前本地候选继续保持 Private；预览入口为 `http://127.0.0.1:4321/Learn-About-Games/`，不把 GitHub Pages 404 描述成部署失败。
- Atlas 的主语改为“创新事件 → 承载作品”：64 nodes、46 relations、73 Evidence；新增五个事件节点（程序生成单局结构、第一人称射击视角、锁定目标空间战斗、角色成长与持续进展、开放世界非线性探索），事件卡先解释发生了什么，再链接承载作品。绝对首创与完整品类史继续排除。
- 资源目录当前为 41 Sources、2120 Work Items、2134 Access Versions；此前英文优先的 1000 条 GDC Vault 会话与 10 条 Game Developer 复盘已入库，本轮不重复导入。资源表搜索、结果数、展开/收起与七项事实筛选共用紧凑表头，访问版本详情使用不透明背景。
- 已验证：`npm run check` 0/0/0；Atlas unit 29/29；fresh Astro build 138 pages；资源 Chromium 20/20；Atlas event 单项 E2E 1/1。下一步继续按事件—承载作品—证据三元组扩展 Atlas，并按英文优先、中文补充的证据门槛继续扩充资源。

## 2026-08-16：Game Developer 千条资源与 RTS 创新事件

- 资源批次使用 Agent Reach 与官方 Game Developer sitemap／文章页核验；新增 1000 条唯一英文 Work Item，均为可访问的官方文章，保留 canonical URL、单一主要 Resource Topic、能力映射、免费访问模型与 2026-08-16 检查日期。中文既有条目继续保留，未用弱证据凑中文数量。当前目录为 41 Source、3120 Work Item、3134 Access Version、16 Resource Topic。
- Atlas 增加三枚以“事件”为主语的 RTS 节点：资源与基地生产、直接单位控制、非对称阵营设计；新增五条事件演进／事件—承载作品关系与三条 Evidence。全局网络为 69 nodes、55 relations、76 Evidence；分类视角为事件预留主带，承载作品下移，避免事件与作品重叠。
- 本批修正了搜索测试对 URL 隐含文本的误判，并同步更新 README、Roadmap、Changelog 的公开规模事实。fresh `npm run check` 为 0/0/0，Vitest 180/180，Astro build 141 pages；Atlas／Resources／Playtest／visible-skeleton 定向 E2E 为 121 passed／21 intentional skipped；完整 E2E 为 252 passed／22 intentional skipped／0 failed。

## 48. 上线前内容补全与呈现修正（2026-08-20）

- 决策：無涘 ｜ 记录：AI。只接入官方 GDC Festival of Gaming YouTube 频道的免费镜像，不接入第三方搬运；对 1820 个 GDC Vault Work Item 做一次性频道清单与本地确定性标题匹配。
- 频道 dump 为 1914 条视频。原始候选为 exact 128、contains 36、模糊 7、歧义 contains 3；保守接受 exact 128 与 contains 15，因跨 Work Item URL ownership 跳过 4 条，最终追加 139 条 `en` / `free` / `official` / `original` Access Version。目录保持 3120 Work Item，Access Version 从 3134 增至 3273。
- `whyRelevant` 与 `summary` 相同的 2650 条不再以独立相关性判断呈现，统一显示一次并标注“来自来源页面的描述”；不同的 470 条保持原有相关性文案。逻辑集中在 `src/lib/resource-display.ts`，资源表、知识议题页和能力页共用。
- 外观控件与三个选项改为“外观／系统／浅色／深色”。资源页动态显示“当前目录以英文资料为主；40 / 3120 个 Work Item 提供中文可消费版本。”
- 独立 clone fresh gate：Astro check 73 files、0 errors／warnings／hints；Vitest 196/196；静态构建 146 pages。仓库继续 Private，Pages workflow 继续禁用；本轮无 push、无部署。
- 未决风险：标题无法确定的 1646 条未命中、7 条模糊候选和 3 组多年份歧义仍未回填；上述官方频道清单保存在本机 `/tmp/gdc-channel.jsonl`，不作为仓库文件。

## 49. 三个官方 YouTube 频道完整收录（2026-08-20）

- 决策：無涘 ｜ 记录：AI。只接入 GDC Festival of Gaming、Game Maker's Toolkit 与 Masahiro Sakurai on Creating Games 英文频道的官方公开视频；第三方搬运和本轮调研的其他频道不进入 catalog。
- 三个 `/videos` flat 清单完整取得 1914、237、300 条 unique 视频；streams / playlists 也分别探测并记录。按 video id 跳过既有 139、1、1 条，新增 1775、236、299 条，共 2310 个 Work Item、2310 个 `en` / `free` Access Version；复用 GMTK Source，新建 GDC 与樱井英文 Source。目录达到 43 Source、5430 Work Item、5583 Access Version。
- 决策：無涘 ｜ 记录：AI。新条目不写没有独立依据的 `whyRelevant`；2310 条中 `whyRelevant` 与 `summary` 相同为 0 条（0%）。标题明确支持的主题为 1129 条，schema 所需的保守 `design-fundamentals` 兜底为 1181 条；不凭标题之外的内容扩写摘要。
- 公开证据足够的其他频道只列为候选，不擅自导入；候选与订阅数、视频数、代表视频、字幕观察和证据链接见 [YouTube 频道收录与字幕获取记录](../research/2026-08-20-youtube-channel-intake.md)。该记录也说明 flat 输出对全部 2451 条没有提供 `upload_date`，没有伪造或静默截断。
- 为支持缺少 `whyRelevant` 的诚实呈现，schema、validator、资源过滤与三处资源相关性渲染改为可选字段；已有条目保留原样。字幕正文获取方式只记录 `youtube-transcript-api`，没有在本仓库实现转录管线。
- 最终提交后的仓库外独立 clone 已通过 `npm ci`、Astro check 0 errors／warnings／hints、Vitest 198/198 与静态构建 149 pages；本地嵌套 worktree 的已知 tsconfig 假失败没有被修复或混入产品结论。分支保持 `codex/v02`，未 push、未部署。

## 50. 成长资源与创新路线目标审计（2026-08-22）

- 决策：無涘 ｜ 记录：AI。用户把本轮基准定为至少 1000 条成长资源和至少 3 条完整 Innovation Atlas 路线；审计沿用最新 `codex/v02`，不把旧 `main` 的 128 条目录与 v02 内容线混合。
- 当前资源为 44 Source／5437 Work Item／5590 Access Version；规范化 canonical URL 5437/5437 唯一，每条 Work Item 至少有一个 Access Version 与一个 Resource Topic。数量被作为容量下限，不作为质量分、排名或学习顺序。
- 新增 `auditAtlasRoutes()` 与只读 `scripts/audit-content-targets.mjs`。按事件、相邻演进、承载作品、起止事件角色和 Evidence 闭包判定，FPS、RPG、RTS、Open World 四条路线完整；早期电子游戏、冒险、益智冒险为空，Metroidvania／Platform 只有单事件，Roguelike 当前没有合法起止角色链，均保持未闭合，不用时间或标签造边。
- 独立 clone 验证：Astro check 0/0/0；新增路线／资源／目录合同 59/59；全量 Vitest 204/204；静态构建 151 pages。初轮 Playwright 暴露过期 Source／资源统计文案与交互稳定性问题；同步为 44／5437／5590 后最终完整 Playwright 为 262 passed／0 failed／22 skipped。当前没有构建或页面回归，视频冷却和 Private 发布状态仍按原边界保留。
- 视频涓流只执行一次，因外部通道冷却留下可观察的 `SKIP`；当前累计 48 completed、4 no_transcript、44 retryable、42 channel_failure、2 model_failure，剩余 2215 条，冷却至 2026-08-23 00:50。未把该状态写成字幕补全完成，字幕与凭据没有进入仓库。
- 本轮审计最初在 `codex/v02` 完成，随后已合并至本地 `main`；未 push、未恢复 Public、未启用 Pages。下一步先独立修复职业探索／Playtest 的浏览器稳定性和大目录渲染成本，再继续低频视频通道或为未闭合透镜补充一手证据。

## 51. 合并与 YouTube 内容通道探测（2026-08-22）

- 决策：無涘 ｜ 记录：AI。按用户指示，先提交 main 的 Director 留痕（`bddce37`），再将 `codex/v02` 无冲突合并进 `main`（`cdca3be`），创建本地回滚 tag `v0.2-content-baseline`，并把涓流脚本从旧 v02 worktree 切换到 main（`8c1b67f`）。确认 v02 已被吸收后删除本地分支和 worktree，远端分支不动。
- 官方 Data API 无凭据请求返回 HTTP 403，需要 API Key 或其他 consumer identity；当前环境没有 `YOUTUBE_API_KEY`。GMTK 频道页可读，公开 RSS endpoint 返回 404，因此 RSS 暂不作为主通道。
- 隔离安装 `yt-dlp 2026.08.19` 后，单条 GMTK 视频 `yorTG9at90g` 成功发现英文／简体中文字幕并取得英文自动字幕；项目既有 `youtube-transcript-api` 对同一视频单请求也成功。现有 Work Item `a-022-why-does-celeste-feel-so-good-to-play` 的中文摘要与字幕抽样一致，确认“取得文字后做证据摘要与分析”的最小链路成立。
- 冷却状态没有被强制清除，失败仍保留为失败、`SKIP` 仍保留为 `SKIP`。新增通道结果详见 [YouTube 内容通道探测](../research/2026-08-22-youtube-content-channel-probe.md)。

## 52. 合并后浏览器门禁归因（2026-08-22）

- 决策：無涘 ｜ 记录：AI。合并后的 `main` 通过 Astro check 0/0/0、Vitest 204/204、静态构建 151 页和内容目标审计；全量 Playwright 为 259 passed、3 failed、22 skipped。
- Atlas 失败的 23px 位置差异在单独重跑中通过，属于运行时位置测量波动。两个 Playtest 失败在串行重跑中都触发 120 秒 timeout，且每次卡在不同 Work Item。
- 根因证据：`dist/resources/index.html` 约 12.7MB，全部 5437 个 Work Item 先 server-render，Playtest 查询实际只需要 61 条，之后才由客户端隐藏其余 DOM。该问题是资源筛选的初始渲染性能瓶颈，不是合并冲突或数据缺失；未用延长 timeout 伪装通过。公开前需另开性能切片。

## 53. YouTube 元数据全量校验与内容回写边界（2026-08-22）

- 决策：無涘 ｜ 记录：AI。用户授权以 2,311 条现有 YouTube Work Item 为全量内容补全目标；本轮用 ADC 调用官方 YouTube Data API v3，仓库外缓存得到 2,534 条频道视频元数据，现有目标 2,311/2,311 全部映射，额外 223 条后来上传的视频不自动扩目录。目标元数据中 271 条标记有字幕、2,040 条没有。
- 决策：無涘 ｜ 记录：AI。确认官方元数据同步与正文分析／回写是两条独立通道：能取得正文且通过摘要长度、主题 ID、能力 ID 校验的派生字段可以写回资源目录；原始字幕、凭据、失败日志和中间缓存留在仓库外。临时目录实测一条完整字幕条目经过 `pending_write`、原子写入和 `completed` 状态闭环，生产目录仍只保留此前真实验证的 48 条。
- 决策：無涘 ｜ 记录：AI。本轮发现两个缓存只有 `[Music]` 等音频标记，新增 `transcript_insufficient` 分类，避免调用模型或生成猜测摘要；随后接入仓库外 `yt-dlp` 获取英文 VTT，清洗重复 cue 后沿用严格摘要／主题／能力校验，第一条生产条目已完成回写。当前生产状态为 49 completed、4 no_transcript、2 transcript_insufficient、41 transcript_channel，剩余 2,215 条。官方 Captions API 需要更高 YouTube scope 且下载要求视频编辑权限，不能作为三个第三方频道的通用正文入口。
- 时间估算：AI 推断。当前涓流每约 4 小时尝试 1 条，通道失败触发 24 小时冷却；元数据中仍有约 240 条有字幕标记且未完成，按约 6 条／天粗估约 40 天；其余约 2,022 条没有可用字幕标记或尚未完成字幕路线，必须另接音频转写，暂不能给出可信的全量完成日期。官方 Data API 配额不是当前主瓶颈，正文获取和分析通道才是。

## 54. Vertex 音频路线接入与首条生产回写（2026-08-22）

- 决策：無涘 ｜ 记录：AI。ADC 文本探针第一次返回项目服务未启用；在用户项目范围启用 `aiplatform.googleapis.com` 后，`gemini-2.5-flash` 文本和短音频调用均返回 200。Agent/Vertex 仍被限定为“已取得内容后的理解/分析入口”，不被误写成 YouTube 数据入口。
- 决策：無涘 ｜ 记录：AI。回填器新增可选音频 fallback：字幕正文不存在或只有音频标记时，才由仓库外 `yt-dlp` 下载 MP3，再调用 ADC/Vertex 生成结构化目录字段；下载、Vertex 通道、输入大小和输出解析分别有显式失败分类，原始音频继续不入仓库。
- `yt-20260820-gmtk-chWr87u3Gdc` 实际验证了完整生产链路：字幕双通道不可分析，音频下载成功，Vertex 返回合法字段，摘要长度 209，状态为 `completed / inputMode=audio / vertex/gemini-2.5-flash`，主题和能力已写入 `src/data/resources.json`。当前状态为 51 completed、4 no_transcript、2 transcript_insufficient、41 channel_failure，剩余 2,213 条。
- `scripts/trickle-video-content.sh` 及其 launchd 外部副本已加入 `--audio-fallback`；原有 24 小时冷却没有强制清除，当前仍以约 6 条／天作为保守吞吐。AI 推断：239 条有字幕未完成条目约 40 天；全剩余 2,213 条若均按同速成功，理论约 369 天，音频路线还需小批样本才能重新估算。
- 验证：Python 17/17、Astro check 0/0/0、Vitest 204/204、静态构建 151 页、`git diff --check` 通过。

## 55. 官方描述正文路线与首批批处理（2026-08-22）

- 决策：無涘 ｜ 记录：AI。官方 YouTube API 返回的公开视频描述属于可追溯内容证据，但不能与“已取得字幕”混为一类。审计目标 2,311 条后发现约 2,096 条描述去除 URL 后至少 240 个字符；新增 `inputMode=description`，只对描述足够具体的条目使用它，短广告／链接描述继续进入音频或失败路线。
- 首条描述生产样本 `yt-20260820-gdc-s30pjYV8aBM` 完成写回；随后 5、20、50 和三轮 100 条描述批次完成。第一轮 100 条中 99 条成功、1 条模型输出失败并重试成功，第二、三轮均 100/100 成功；累计 376 条 `completed / inputMode=description`，当前状态为 427 completed、4 no_transcript、2 transcript_insufficient、41 channel_failure，剩余 1,837 条。
- 描述路线先检查官方元数据中的 `captionAvailability=false`，因此不发起字幕请求；描述模型结果仍经过摘要长度、主题／能力 ID 白名单、`pending_write` 和原子写回。`--description-only` 已加入涓流脚本：每 4 小时先取最多 20 条描述候选，描述队列为空才退回单条字幕／音频路线。
- 验证：回填与元数据 Python 合同测试 20/20，shell 语法和 `git diff --check` 通过；全量 Astro/build 门禁仍需在本轮提交前复跑。全量目标仍未完成，不能用描述覆盖审计或当前样本代替最终对账。

## 56. 描述批量模式与失败留痕修正（2026-08-22）

- 决策：無涘 ｜ 记录：AI。发现 100 条描述批次中的模型失败记录把 `inputMode` 留成默认 `transcript`，原因是模式在模型调用后才赋值；已将 description/audio 模式提前到调用前，并成功重试该条，避免失败原因与实际入口错位。
- 决策：無涘 ｜ 记录：AI。涓流现在先运行 `--description-only`，确保官方描述批量分析不触碰 YouTube；只有本轮描述候选为零时才退回单条字幕／音频路线。描述路线仍受模型输出校验、原子回写和显式失败分类约束。
- 时间估算：AI 推断。最近 50 条约 10 分钟，第二轮 100 条约 26.5 分钟，第三轮 100 条约 20.5 分钟；当前 376 条描述样本中仅 1 条模型输出失败且已重试成功。若剩余 1,837 条都能走描述路线，按每 4 小时最多 20 条理论约 15–16 天；不能据此承诺音频／字幕失败条目的最终日期。

## 57. 官方描述第二轮百条回写（2026-08-22）

- 决策：無涘 ｜ 记录：AI。第二轮 `description-only` 生产批次完整处理 100/100 条，未触发字幕、音频或 YouTube 请求；状态与资源目录最终对账一致，累计 327 completed、剩余 1,937 条，model failure 仍为 0。
- 这批从 16:44 左右运行至 17:10 左右，约 26.5 分钟；个别摘要长度不合格时进入既有修复／fallback，因此吞吐低于上一批。描述正文仍只是输入证据，不被写成字幕或官方完整 transcript。

## 58. 官方描述第三轮百条回写（2026-08-22）

- 决策：無涘 ｜ 记录：AI。第三轮 `description-only` 生产批次完整处理 100/100 条，未触发字幕、音频或 YouTube 请求；状态与资源目录最终对账一致，累计 427 completed、剩余 1,837 条，model failure 仍为 0。
- 这批约 20.5 分钟完成，较第二轮快；仍保留多个模型 fallback 与摘要校验，未把暂时未处理的条目算作完成。

## 59. 官方描述第四轮、定向重试与未完成口径（2026-08-22）

- 决策：無涘 ｜ 记录：AI。第四轮 `description-only` 批次最终 100/100 完成：98 条首轮成功，2 条因模型输出中的未知主题 ID／摘要长度校验失败而保留为可重试，之后定向重试全部成功。当前生产状态为 527 completed、4 no_transcript、2 transcript_insufficient、41 channel_failure，model failure 为 0。
- 决策：無涘 ｜ 记录：AI。完成入口为 476 条 `description`、1 条 `transcript`、1 条 `audio`，加上 49 条历史回写。2,311 条目标中真正未完成为 1,784 条；其中 1,737 条尚未进入任何已分类状态，47 条已经尝试但仍是显式非完成状态。回填器报告新增 `uncompletedAfterRun`，保留 `remainingAfterRun` 作为兼容字段并明确其含义。
- 时间估算：AI 推断。第四轮约 27.7 分钟完成；描述路线不触碰 YouTube 请求，按每 4 小时最多 20 条运行。若 1,737 条尚未分类条目都能使用合格官方描述，理论约 14–15 天；描述不足、字幕通道失败和音频路线不纳入该乐观估算。

## 60. 官方描述第五轮与主题/能力 ID 边界修正（2026-08-22）

- 决策：無涘 ｜ 记录：AI。第五轮 `description-only` 最终 100/100 完成；首轮 1 条模型输出失败，错误是把能力 ID `aesthetic-direction` 当成 `resourceTopicIds`，未通过白名单校验，因此没有写回错误字段。提示增加两组 ID 的明确边界后，该条定向重试成功。
- 决策：無涘 ｜ 记录：AI。当前状态为 627 completed、4 no_transcript、2 transcript_insufficient、41 channel_failure，model failure 为 0。完成入口为 576 description、1 transcript、1 audio，另有 49 条历史回写；真正未完成 1,684 条，其中 1,637 条尚未分类，47 条已尝试但仍未完成。
- 决策：無涘 ｜ 记录：AI。回填提示现在明确规定资源主题只能来自资源主题列表、能力只能来自能力列表；未知主题不做猜测性映射，脚本保留原有主题。新增合同测试覆盖这一边界。
- 时间估算：AI 推断。第五轮约 24.9 分钟完成；若 1,637 条尚未分类条目都能走描述路线，按每 4 小时最多 20 条理论约 13–14 天，字幕/音频失败条目仍需独立处理。

## 61. 官方描述第六轮与定向重试（2026-08-22）

- 决策：無涘 ｜ 记录：AI。第六轮 `description-only` 最终 100/100 完成；首轮 1 条模型输出同时出现摘要过短和未知主题 `business-management`，白名单拒绝且未写回，定向重试后成功。当前 model failure 为 0。
- 决策：無涘 ｜ 记录：AI。当前状态为 727 completed、4 no_transcript、2 transcript_insufficient、41 channel_failure。完成入口为 676 description、1 transcript、1 audio，另有 49 条历史回写；真正未完成 1,584 条，其中 1,537 条尚未分类，47 条已尝试但仍未完成。
- 时间估算：AI 推断。第六轮约 21.6 分钟；若 1,537 条尚未分类条目都能走描述路线，按每 4 小时最多 20 条理论约 12–13 天，字幕/音频失败条目仍需独立处理。

## 62. 官方描述第七轮百条回写（2026-08-22）

- 决策：無涘 ｜ 记录：AI。第七轮 `description-only` 100/100 完成，未请求字幕、未下载音频，也未增加模型或通道失败。当前状态为 827 completed、4 no_transcript、2 transcript_insufficient、41 channel_failure，model failure 为 0。
- 决策：無涘 ｜ 记录：AI。完成入口为 776 description、1 transcript、1 audio，另有 49 条历史回写；真正未完成 1,484 条，其中 1,437 条尚未分类，47 条已尝试但仍未完成。
- 时间估算：AI 推断。本轮约 20.3 分钟；若 1,437 条尚未分类条目都能走描述路线，按每 4 小时最多 20 条理论约 12 天，字幕/音频失败条目仍需独立处理。

## 63. 官方描述第八轮与跨字段 ID 归一化（2026-08-22）

- 决策：無涘 ｜ 记录：AI。第八轮 `description-only` 最终 100/100 完成；1 条模型输出把合法能力 ID `aesthetic-direction` 放进主题字段，白名单先拒绝，确定性归一化后重试成功。该规则只丢弃主题字段中的合法能力 ID，不把它映射成主题；其它未知 ID 仍失败并留痕。
- 决策：無涘 ｜ 记录：AI。当前状态为 927 completed、4 no_transcript、2 transcript_insufficient、41 channel_failure，model failure 为 0。完成入口为 876 description、1 transcript、1 audio，另有 49 条历史回写；真正未完成 1,384 条，其中 1,337 条尚未分类，47 条已尝试但仍未完成。
- 时间估算：AI 推断。本轮约 20.3 分钟；若 1,337 条尚未分类条目都能走描述路线，按每 4 小时最多 20 条理论约 11–12 天，字幕/音频失败条目仍需独立处理。

## 64. 官方描述第九轮百条回写（2026-08-22）

- 决策：無涘 ｜ 记录：AI。第九轮 `description-only` 100/100 完成，未请求字幕、未下载音频，也未增加模型或通道失败。当前状态为 1,027 completed、4 no_transcript、2 transcript_insufficient、41 channel_failure，model failure 为 0。
- 决策：無涘 ｜ 记录：AI。完成入口为 976 description、1 transcript、1 audio，另有 49 条历史回写；真正未完成 1,284 条，其中 1,237 条尚未分类，47 条已尝试但仍未完成。
- 时间估算：AI 推断。本轮约 18.9 分钟；若 1,237 条尚未分类条目都能走描述路线，按每 4 小时最多 20 条理论约 10–11 天，字幕/音频失败条目仍需独立处理。

## 65. 官方描述第十轮百条回写（2026-08-22）

- 决策：無涘 ｜ 记录：AI。第十轮 `description-only` 100/100 完成，未请求字幕、未下载音频，也未增加模型或通道失败；运行约 17.6 分钟。
- 决策：無涘 ｜ 记录：AI。当前状态为 1,127 completed、4 no_transcript、2 transcript_insufficient、41 channel_failure，model failure 0。完成入口为 1,076 description、1 transcript、1 audio，另有 49 条历史回写；真正未完成 1,184 条，其中 1,137 条尚未分类，47 条已尝试但仍未完成。
- 时间估算：AI 推断。若 1,137 条尚未分类条目都能走合格描述路线，按每 4 小时最多 20 条理论约 9–10 天；字幕/音频失败条目仍需独立处理。

## 66. 官方描述第十一轮与 GDC 页脚误判修正（2026-08-22）

- 决策：無涘 ｜ 记录：AI。第十一轮初次 100 条中 99 条成功、1 条因模型把 GDC 频道统一页脚的 `visual-arts` 当成主题而失败；核对该视频官方描述后确认它不是视频证据，错误结果未写回。
- 决策：無涘 ｜ 记录：AI。新增窄白名单外标签忽略规则，仅处理已观察的 GDC 通用页脚 `visual-arts`／`business-management`，其它未知主题仍失败。新增合同测试后为 17/17；第三次定向重试成功，最终本轮 100/100，model failure 0。
- 决策：無涘 ｜ 记录：AI。当前状态为 1,227 completed、4 no_transcript、2 transcript_insufficient、41 channel_failure；完成入口为 1,176 description、1 transcript、1 audio，另有 49 条历史回写。真正未完成 1,084 条，其中 1,037 条尚未分类，47 条已尝试但仍未完成。
- 时间估算：AI 推断。含两次失败重试、证据核对和修复后的最终收尾约 28.1 分钟；若 1,037 条尚未分类条目都能走合格描述路线，按每 4 小时最多 20 条理论约 8–9 天。
