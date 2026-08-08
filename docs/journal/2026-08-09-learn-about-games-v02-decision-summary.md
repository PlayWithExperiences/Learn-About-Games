# Learn About Games v0.2 决策摘要

- 日期：2026-08-09
- 状态：设计已确认，用户已授权直接实施
- 线上 M0：https://playwithexperiences.github.io/Learn-About-Games/
- v0.2 产品设计：[2026-08-09-learn-about-games-v02-design.md](../superpowers/specs/2026-08-09-learn-about-games-v02-design.md)
- 视觉系统：[DESIGN.md](../../DESIGN.md)
- Foundation 计划：[2026-08-09-v02-foundation-implementation-plan.md](../superpowers/plans/2026-08-09-v02-foundation-implementation-plan.md)
- Map / Career 计划：[2026-08-09-v02-map-careers-implementation-plan.md](../superpowers/plans/2026-08-09-v02-map-careers-implementation-plan.md)
- Resources 计划：[2026-08-09-v02-resources-implementation-plan.md](../superpowers/plans/2026-08-09-v02-resources-implementation-plan.md)
- Atlas / Release 计划：[2026-08-09-v02-atlas-release-implementation-plan.md](../superpowers/plans/2026-08-09-v02-atlas-release-implementation-plan.md)
- 本轮会话记录：[2026-08-09-learn-about-games-v02-transcript.md](2026-08-09-learn-about-games-v02-transcript.md)
- M0 决策摘要：[2026-08-08-learn-about-games-decision-summary.md](2026-08-08-learn-about-games-decision-summary.md)

## 当前状态

M0 发布 HEAD 为 `373ef17bbcc7646e8b5183d300a7a394fe15e0ae`，对应 GitHub Pages run `31267011204`。v0.2 使用独立工作树 `.worktrees/v02` 和分支 `codex/v02`。

v0.2 开始前的 clean baseline 已实际运行：`npm run build` 完成 Astro check 0 errors / warnings / hints、Vitest 27/27 和 14 个静态页面；`CI=1 npm run test:e2e` 为 44/44。

规格、`DESIGN.md` 与四份阶段计划已经写入工作树，尚未提交或发布。`DESIGN.md` lint 为 0 errors；18 条 orphaned-token warning 是 linter 无法从 Markdown 组件示例推导 token 使用，不是运行时错误。文档更新后的首次全量 E2E 有 4 项失败，均来自仍锁定旧 M0 summary/spec 路径和旧 README 精确文案的测试；对照真实页面确认根因后只更新测试契约，定向 18/18、随后全量 44/44。完成规格对抗修正后重新执行：`npm run build` 为 Astro check 0 errors / warnings / hints、Vitest 27/27、14 pages；`CI=1 npm run test:e2e` 为 44/44；placeholder scan 与 `git diff --check` 均无命中。

本次 Foundation 导航切片已完成但尚未发布：顶层只保留能力地图、职业方向、成长资源、创新变迁与关于本项目五项用户任务；About 集中项目治理资料并保留旧路由；`/careers/` 直接复用 `AAA · Game Designer` catalog 画像、公开依据与复核日期，不复制角色知识树；首页三入口分别抵达地图、职业方向和资源。桌面导航单行，320px 改为原生 `details/summary` 紧凑菜单，JavaScript 不可用时仍可打开。行为测试先在旧导航上取得 RED，最终 `npm run build` 为 0 errors / warnings / hints、Vitest 44/44、25 个静态页面；导航定向桌面/移动 E2E 为 25 passed / 1 desktop-only skipped，完整 E2E 为 53 passed / 1 skipped。实测 320px HTML 与 body 均为 `clientWidth=320`、`scrollWidth=320`，临时 preview 已关闭。

能力地图 Tasks 2-3 已完成但尚未发布：`CapabilityMap.astro` 从同一 catalog server render 桌面地域图与移动关系大纲。桌面画布包含 8 个开放地域、42 个 Capability、12 个 Knowledge Topic 和 64 条关系；supports 使用中点方向标记，complements 使用无箭头虚线，focus 只增强相邻边与端点而不隐藏全图。移动端在 320px 直接显示全部节点链接，每个 Capability 可展开“它支持 / 受到支持 / 互补”的同源文字关系。所有 Capability 详情都有独立 `CapabilityProgress`，12 个 Knowledge Topic 均有静态详情页；fresh build 生成 70 pages。

本切片先运行 fresh build 证明测试产物可用，再在旧 bento 上取得浏览器 RED 14/14；实现后地图/base-path 桌面与移动定向为 14/14。相邻回归更新移除了已经退休的 Map 内嵌职业控件契约，并锁定每个能力页都有个人记录；最终 `npm run check` 为 0 errors / warnings / hints、Vitest 57/57、fresh build 70 pages，地图/base-path/profile-progress 定向 18/18，完整 E2E 为 77 passed / 1 desktop-only skipped。视觉验收覆盖 Map、Playtest 详情与“玩家动机与差异”议题详情在 1440px/320px、System Light/explicit Dark 共 12 张截图。对抗检查发现并修复 SVG 箭头被 viewBox 放大、移动节点详情链接藏在闭合 disclosure、4 对节点碰撞与 1 对跨域擦边；最终节点碰撞审计为 0，320px HTML/body scrollWidth 等于 clientWidth，节点链接 42/42 直接可见。临时 preview 已停止，`git diff --check` 与 secret filename scan 均无输出。

地图切片留档后的全仓复跑遇到并发资源切片正在进行的预期 TDD RED：资源测试新增 2 条、其中 4 项仍等待资源 catalog GREEN；Astro check 仍为 0/0/0，地图文件没有新增失败。本摘要不把该共享工作树瞬时状态伪装成最终全仓 GREEN；主任务会在资源提交后重新执行 fresh build、unit 与完整 E2E。

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

## 内容范围

- 约 8 个 Domain、36-42 个 Capability、8-12 个 Knowledge Topic、50-80 条能力关系。
- `AAA · Game Designer`、`AAA · Creative Director`、`Indie · Solo Developer` 三个参考画像。
- 约 100-150 项真实资源，至少覆盖 12 个主题，保留 Source 与 Work Item 粒度。
- 全局 Atlas 约 25-40 个节点、15-25 条有证据关系，首批透镜为 Roguelike 与 Metroidvania。

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

1. 重新运行文档阶段的 build、E2E、lint 与 diff gate，并提交 v0.2 规格、`DESIGN.md` 与四份可执行计划。
2. 导航、About、三态主题与能力地图 Tasks 2-3 已完成；首页和地图显示数量从 catalog 派生，不把当前 42/12/64 写成未来上限。
3. 下一步完成 Map / Career 计划 Task 4：三个有公开依据、边界与复核日期的职业透镜必须复用同一张地图并保持个人状态独立。
4. 每阶段执行 RED-GREEN、规格审查、代码质量审查、连续性留档与独立提交。
5. 最后完成桌面/移动、双主题、无 JavaScript、Pages 子路径与线上部署验收。

## 当前未决风险

- 三个职业画像的公开依据需要逐项收集并保留适用边界。
- 当前只有 Playtest 有直接资源，其他能力和多数知识议题详情会诚实显示仍在整理；资源切片完成前不能把可达页面误写成内容覆盖完成。
- 100-150 项资源必须真实去重和核查，不能让数量目标压过元数据质量。
- Metroidvania 的命名史、机制史与直接影响证据必须分开表达。
- 全局时间网络需要可解释的固定布局，不能退化为横向卡片列表或不可控力导图。
