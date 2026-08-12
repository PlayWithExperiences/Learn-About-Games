# Learn About Games v0.2 决策摘要

- 日期：2026-08-09
- 状态：仓库保持 Private、Pages 保持禁用；当前本地候选包含可逆展开的左→右 EGDS 层级、10 个 Atlas Genre Family／5 条可直接选择的证据谱系与 209 项资源目录，尚未推送或部署；本机以 `/Learn-About-Games/` 子路径预览
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

本轮整合截图保存在 `/tmp/lag-reversible-review/`，已按原始分辨率检查 Atlas Family／全屏、EGDS 总览／展开、Resources 默认／单表展开六种状态。fresh build 为 Astro 0 diagnostics、Vitest 160/160、127 pages；完整 Playwright 为 219 passed／21 project-specific skipped／0 failed；高危依赖审计为 0 vulnerabilities，提交差异敏感模式扫描无命中。仓库只读核验仍为 Private；本地候选保留在 `codex/v02`，未 push、未部署。

## EGDS 独立方法介绍页

发起人确认能力地图虽然采用 EGDS，方法本身不应只藏在体验设计分支。当前理论内容应以 PlayWithExperiences PKM 为先，2024 年四篇已发布文章则保留为过去真实版本与演进证据。主任务据此选择独立 `/egds/` 页面，而不是 About 内长文或第五个全局导航项；About 与能力地图各提供一个上下文入口，顶层用户任务仍为四项。

当前页面明确两组结构：情绪曲线 → 情绪体验 → 主观感受 → 客观原因 → 设计杠杆的体验因果链，以及感知 → 理解 → 解构 → 重构的工作循环。玩法与挑战、叙事、美学与表现作为可共同使用的设计杠杆。页面同时解释 EGDS Framework Node、Capability 与 Knowledge Topic 的边界，以及生产、协作、产品和更广语境属于 Learn About Games 的应用扩展。

证据层使用四个作者已发布页面和当前 Digital Garden 入口。Learn About Games 不镜像完整 PKM，不把历史文章写成当前模型的上限，也不把 EGDS 写成行业标准、认证、必修顺序、唯一道路或个人评分。页面全部服务器渲染，并以 1440px／320px、Light／Dark、无 JavaScript 和 base path 浏览器合同验收。

最终 fresh 验证为 Astro 68 files 0 errors／warnings／hints、Vitest 160/160、129 pages、完整 Playwright 227 passed／21 project-specific skipped／0 failed，高危依赖审计 0 vulnerabilities。五张原图位于 `/tmp/lag-egds-method/`，均已按原始分辨率检查，页面横向溢出为 0。本轮仍只存在本地 `codex/v02`，不 push、不恢复 Pages。
