# Learn About Games v0.2 决策摘要

- 日期：2026-08-09
- 状态：v0.2 已部署并完成线上契约验收
- 线上 v0.2：https://playwithexperiences.github.io/Learn-About-Games/
- v0.2 产品设计：[2026-08-09-learn-about-games-v02-design.md](../superpowers/specs/2026-08-09-learn-about-games-v02-design.md)
- 视觉系统：[DESIGN.md](../../DESIGN.md)
- Foundation 计划：[2026-08-09-v02-foundation-implementation-plan.md](../superpowers/plans/2026-08-09-v02-foundation-implementation-plan.md)
- Map / Career 计划：[2026-08-09-v02-map-careers-implementation-plan.md](../superpowers/plans/2026-08-09-v02-map-careers-implementation-plan.md)
- Resources 计划：[2026-08-09-v02-resources-implementation-plan.md](../superpowers/plans/2026-08-09-v02-resources-implementation-plan.md)
- Atlas / Release 计划：[2026-08-09-v02-atlas-release-implementation-plan.md](../superpowers/plans/2026-08-09-v02-atlas-release-implementation-plan.md)
- 本轮会话记录：[2026-08-09-learn-about-games-v02-transcript.md](2026-08-09-learn-about-games-v02-transcript.md)
- M0 决策摘要：[2026-08-08-learn-about-games-decision-summary.md](2026-08-08-learn-about-games-decision-summary.md)

## 当前状态

v0.2 runtime HEAD 为 `0b6bfb462f7b697ac526a9c6bf48a95878ed642a`，对应成功 GitHub Pages run `31282275108`。远端 `main` 与 `codex/v02` 均指向该 runtime commit；公开站已完成八条关键路由、核心交互、数据计数与 320px 页面宽度验收。M0 的最后发布 HEAD `373ef17bbcc7646e8b5183d300a7a394fe15e0ae` 与 run `31267011204` 作为历史证据保留。

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

现有两列卡片没有地图感。v0.2 使用稳定知识地域、可进入节点和有明确含义的关系。桌面是地域图，移动端是关系等价大纲；不使用无约束力导图。

### 职业方向

现有画像只显示卡片底部小字，影响不可感知。v0.2 让画像真正改变地图强调并提供可点击摘要，但不隐藏其他能力、不生成职业分数。命名使用 `AAA · Game Designer`，不使用斜杠。

### 成长资源

M0 只有两条资源，尚未开始规模收集。用户否决候选、审核、精选和统一学习路径，因为这些要求平台承担无法客观维持的强判断。v0.2 统一收录和整理资源；外部评价只按原始来源、指标与日期如实展示，不生成站内评分。

### Innovation Atlas

Atlas 是一张全局横向时间网络。时间只控制横轴，关系可以跨越很长时期。Roguelike、Metroidvania、关键词与品类是同一网络的高亮透镜，不拥有孤立子图。

### 信息架构与主题

一级导航固定为能力地图、职业方向、成长资源、创新变迁、关于本项目；英文术语固定为 Expertise Map、Career Lenses、Learning Resources、Innovation Atlas、About。项目治理资料进入 About。全站增加跟随系统、浅色、深色三态主题。

## 已实现内容范围

- 8 个 Domain、42 个 Capability、12 个 Knowledge Topic、64 条能力关系。
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

- 地图统一使用一张全局 0-100 坐标系；Domain 保存全局 bounds，节点保存全局锚点，测试同时验证地域包含和关系端点对齐，不能只靠 DOM 数量冒充地图。
- Source 与 Work Item 都是可发现实体；Work Item 保存来自研究 intake 的唯一 canonical identity，Source 有独立详情页。
- 访问模式与地区限制拆分；100-150 是内容发布目标，不是驱动填充的构建硬门槛。硬门槛是真实 Source、唯一 canonical identity、至少一个核查过的 Access Version 与可解释主题关联。
- Capability Relation 只连接 Capability；跨 collection 引用由实体类型确定，ID 在各 collection 内唯一。
- Career Lens 公开 `basisLinks` 与复核日期，priority/responsibility 使用受限枚举；投影结果不读取个人状态，也不产生中英文分数语义。
- Atlas 关系显式区分有向与无向，Node、Relation、Theme 共用同一标签 taxonomy；范围节点显示时间 span，Game 只显示发行年。
- 移动验收显式设置 320px，不把 Pixel 7 配置误写成 320px；主题矩阵覆盖系统浅/深与两种显式反向覆盖。
- 发布证据链固定为 runtime release SHA/run → live verification → 可选 evidence commit，不要求 metadata commit 无限自证。

## 精确下一步

1. 继续按 canonical Work Item 扩大资源覆盖和语言版本，不把数量或外部观察变成质量评分。
2. 为当前资源稀疏的能力补具体内容，同时保持 Capability、Knowledge Topic 与 Resource Topic 的语义边界。
3. 扩展 Atlas 主题前先补节点、关系与 Evidence，不为视觉密度添加无证据连线。
4. 根据真实使用反馈决定完整英文界面与更多专业方向的优先级；账号、后台与同步仍不预先引入。

## 当前未决风险

- 当前已收录 128 个 Work Item，但覆盖密度并不等同于主题质量认证；后续贡献仍需保持 canonical 去重、Source 归属、Access Version 与能力/议题引用完整。
- 资源筛选只表达目录事实；不能把外部公开计数或观察转译成本站推荐、评分、排名或审核结论。
- 当前中文界面与多语言资源元数据不等于完整双语产品；英文界面仍属后续范围。
- Atlas 当前只有 Roguelike 与 Metroidvania 两个证据透镜；扩展必须先增加可核查关系，不能为视觉密度补无证据边。
