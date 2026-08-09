# EGDS Expertise Map 重构设计

- 状态：核心方向已由发起人确认，待书面规格复核
- 日期：2026-08-09
- 基线：private branch `codex/v02` at `d982ceb`
- 前置规格：[私有完善阶段设计](2026-08-09-private-refinement-design.md)
- 原始蓝本：发起人的 PlayWithExperiences / EGDS Expertise Map

## 1. 本轮只解决什么

本切片只重构能力地图。成长资源的媒介类型编码与进一步压缩、Innovation Atlas 的直接滚轮缩放与历史扩充，分别进入后续规格；不与地图同时施工。

本轮需要解决四个已经被真实使用暴露的问题：

1. 当前“体验与玩家 / 玩法、空间与表达 / 研究、原型与交付 / 协作、领导与方向 / 产品、市场与更广语境”是一套通用内容分组，不是发起人的设计方法。它把设计对象、工作阶段、组织条件和商业语境放在同一层，因而产生重叠。
2. 当前地图把大量概念平铺为相似方框，用户无法知道分类从何而来，也无法区分方法步骤、可实践能力和知识议题。
3. 当前桌面画布设置为页面内部的双向 `overflow: auto` 容器；触控板的斜向手势会在页面和内部画布之间竞争，形成滚动发卡感。
4. 为了容纳全部叶节点，当前地图仍然很高。用户希望一眼看见完整结构，而不是先进入局部滚动画布。

本轮不争论 EGDS 是否是唯一行业标准。它是 PlayWithExperiences 对游戏设计能力的作者化解释框架，公开项目应如实呈现这一来源，并允许后续版本在证据与实践反馈下修订。

## 2. 第一性原理

### 2.1 地图首先回答的决定

用户进入地图时首先需要回答：

- 游戏设计能力的整体结构是什么？
- EGDS 如何从体验出发，走到理解、解构和重构？
- 把设计意图变成结果，还需要哪些生产、协作和产品能力？
- 某个具体能力位于哪条思考链中，又与哪些其他能力相关？

地图默认不尝试一次回答“这个节点的全部说明、资源和个人状态”。这些内容属于选中后的详情或现有独立页面。

### 2.2 作者性声明

地图页需要持续显示以下等价说明：

> 本地图以 PlayWithExperiences 的 EGDS 为知识骨架，结合公开资料与行业实践持续修订。它是一种可讨论的设计视角，不是唯一标准答案。

这段说明不是免责声明式页脚，而是地图解释的一部分。后续贡献可以补充节点、关系和证据，但不能把 EGDS 主骨架在无决策记录的情况下替换成无作者来源的通用分类。

## 3. 三种知识对象

地图必须区分三种实体，不能继续共享同一种方框语义。

### 3.1 EGDS 方法节点

方法节点表达作者框架，包括主分支、思考阶段和设计杠杆。它们不参与个人进度，也不被 Career Lens 评价。

方法节点包括：

- 主分支：体验设计、从计划到落地、如果有团队、如果希望形成产品与盈利、如果讨论的不只是游戏。
- 思考阶段：感受、理解、解构、重构。
- 设计杠杆：叙事、美学与表现、玩法与挑战。
- 方法入口：情绪曲线与体验目标、创新与更大的可能性空间。

### 3.2 Capability

Capability 是可以通过实践逐步形成的能力，例如情绪曲线设计、叙事架构、核心循环设计、Playtest、任务拆解、愿景对齐和受众定位。

Capability 保留现有独立详情页、个人实践状态、职业画像映射和资源深链。每个 Capability 在 EGDS 中只有一个主要展示位置，以保证图可读；跨分支意义继续由 `supports` / `complements` 关系表达。主要展示位置不表示排他所有权或唯一成长路径。

### 3.3 Knowledge Topic

Knowledge Topic 是值得理解的概念与语境，例如知觉与情绪、概率与公平感、游戏产业经济、伦理与文化。它不参与 Career Lens 或个人进度，但可以关联资源和 Capability。

知识议题使用不同于 Capability 的形状和明确文字标签。它是能力的理解背景，不是较低等级的能力。

### 3.4 固定视觉冗余编码

- EGDS 方法节点使用开放的文字标签与结构线，不使用可点击内容卡片的完整外框；节点旁持续显示“方法”“阶段”或“设计杠杆”的类型文字。
- Capability 使用可点击的圆角描边节点，名称是主要文字；只有它可以承载 Career priority 与个人状态标记。
- Knowledge Topic 使用直角虚线节点，并持续显示“知识议题”；不继承 Career 颜色。
- Innovation Atlas 入口使用明确的站内文本链接和“前往 Innovation Atlas”动作，不伪装成 Capability。
- 颜色只加强分支和交互状态，不单独承担实体类型、优先级或选择状态。

## 4. EGDS 主骨架

### 4.1 体验设计

体验设计是地图的第一主分支，也是 EGDS 的核心方法链：

1. **体验旅程与情绪曲线**：游戏过程可以被理解为多个情绪体验构成的曲线。
2. **感受 / Perception**：确认某种体验确实发生。
3. **理解 / Rationalize**：识别玩家的主观感受是什么。
4. **解构 / Deconstruction**：理解产生体验的客观原因。
5. **重构 / Reconstruction**：在可能性空间中选择设计杠杆，重新把目标体验传达给玩家。

重构阶段持续显示三类设计杠杆：

- **叙事**：叙事架构与叙事呈现。
- **美学与表现**：美学方向与美学表达。
- **玩法与挑战**：核心循环、规则与系统、手感、节奏、关卡与空间等。

这些杠杆不是彼此排斥的专业部门，而是实现体验目标的不同手段。

### 4.2 从计划到落地

这一分支解释如何把意图变成可交付结果，第二层能力群固定为：

- 心态、问题解决与工具使用；
- 原型、生产与任务拆解；
- Playtest、数据分析与迭代；
- 取舍、规格与交付。

### 4.3 如果有团队

这一分支只在存在多人协作语境时展开其完整意义，但相关能力对独立开发者仍可能有效。第二层能力群固定为：

- 愿景持有、创意方向与决策；
- 对齐、沟通与可视化表达；
- 领导、管理与交付保障；
- 团队协作、反馈与共识促成。

### 4.4 如果希望形成产品与盈利

这一分支不把商业化当作所有游戏的必经目标。第二层能力群固定为：

- 受众与定位；
- 市场与未满足体验；
- 价值交换；
- 商业化与体验目标协调。

### 4.5 如果讨论的不只是游戏

这一分支在本轮保持紧凑，只保留一个能力群和一个创新入口：

- 价值观、伦理与文化；
- 创新：创造或寻找更大的可能性空间；
- 通往 Innovation Atlas 的明确入口。

学术和社会研究继续作为 Knowledge Topic 关联到相应能力；在 EGDS 尚未形成更明确的作者结构前，不把它们提升为新的通用主干。

### 4.6 框架节点与方法关系

根节点是正式数据实体 `egds-root`，`kind: root`。五条主分支、体验阶段、设计杠杆、能力群和 Atlas 入口也都是正式框架节点，而不是组件根据标题推断出来的层级。

框架边必须显式区分三种语义：

- `contains`：表达地图归属，例如根包含五条主分支、重构包含三类设计杠杆；
- `process-next`：只表达 EGDS 方法流，固定为感受 → 理解 → 解构 → 重构；
- `links-to`：表达站内入口，当前只用于创新节点通往 Innovation Atlas。

`process-next` 不能由 `parentId` 或数组相邻位置推断，也不能被描述成学习先修顺序。体验旅程／情绪曲线是体验设计分支中的方法入口，不是四阶段之前必须完成的步骤。

首版稳定框架 ID 如下；实施不得在组件中另造同义节点：

| 类型 | 稳定 ID | 中文名称 |
| --- | --- | --- |
| root | `egds-root` | Expertise / EGDS |
| branch | `experience-design` | 体验设计 |
| branch | `from-plan-to-ship` | 从计划到落地 |
| branch | `with-team` | 如果有团队 |
| branch | `product-profit` | 如果希望形成产品与盈利 |
| branch | `beyond-games` | 如果讨论的不只是游戏 |
| entry | `experience-journey` | 体验旅程与情绪曲线 |
| stage | `perception` | 感受 |
| stage | `rationalization` | 理解 |
| stage | `deconstruction` | 解构 |
| stage | `reconstruction` | 重构 |
| lever | `narrative-lever` | 叙事 |
| lever | `aesthetics-lever` | 美学与表现 |
| lever | `gameplay-challenges-lever` | 玩法与挑战 |
| cluster | `mindset-problem-solving-tools` | 心态、问题解决与工具使用 |
| cluster | `prototype-production-breakdown` | 原型、生产与任务拆解 |
| cluster | `playtest-evidence-iteration` | Playtest、证据与迭代 |
| cluster | `tradeoff-specification-delivery` | 取舍、规格与交付 |
| cluster | `vision-direction-decisions` | 愿景、方向与决策 |
| cluster | `alignment-communication` | 对齐、沟通与表达 |
| cluster | `leadership-management` | 领导、管理与交付保障 |
| cluster | `feedback-collaboration` | 反馈、协作与共识促成 |
| cluster | `audience-positioning-cluster` | 受众与定位 |
| cluster | `market-opportunity` | 市场与未满足体验 |
| cluster | `value-exchange` | 价值交换 |
| cluster | `monetization-alignment` | 商业化与体验目标协调 |
| cluster | `values-culture` | 价值观、伦理与文化 |
| external-entry | `innovation-possibility-space` | 创新与更大的可能性空间 |

`mindset-problem-solving-tools` 与 `leadership-management` 首版可能没有直接 Capability；它们仍保留为原始 EGDS landmark，并明确显示“能力内容待补充”，不能用不相关节点填满以掩盖内容缺口。

### 4.7 原始 EGDS landmark 去向

| 原图 landmark | 首版去向 |
| --- | --- |
| Game design is about experience design | `experience-design` 分支的核心说明 |
| Emotional journey / curve | `experience-journey` 方法入口 |
| 感受、理解、解构、重构 | 四个 stage + 三条 `process-next` |
| 分享体验 / 在可能性空间寻找方案 | `reconstruction` 的方法说明 |
| Narrative architecture / exposition | `narrative-lever` 下的 Capability |
| Artistic direction / presentation | `aesthetics-lever` 下的 Capability；当前表现能力缺口如实保留 |
| Core loop / game feel / pacing | `gameplay-challenges-lever` 下的 Capability |
| Mindset / problem-solving / tool usage | `mindset-problem-solving-tools` 框架说明；当前问题解决与工具能力缺口如实保留 |
| Production / task breakdown | `prototype-production-breakdown` |
| Playtest / data / iteration | `playtest-evidence-iteration` |
| Vision holder / do correct things | `vision-direction-decisions` 的方法说明与创意愿景 Capability |
| Alignment 的 timing / content / format | `alignment-communication` 的方法说明，不拆成虚假的三项能力 |
| Management / Teamplay | `leadership-management` 与 `feedback-collaboration`；缺失能力不凭空补造 |
| Audience / Market / Monetization | 产品与盈利分支的四个能力群 |
| Innovation / bigger possibility space | `innovation-possibility-space` + Innovation Atlas 入口 |

## 5. 默认阅读层级

### 5.1 推荐方案

采用“一屏骨架 + 按需展开”，而不是全量静态图或总览／完整图双模式。

在 1440 × 900 的桌面 viewport 中，用户滚动到地图区域后，应在同一个可见区域内读到：

- 根节点；
- 五条主分支；
- 体验设计的感受 → 理解 → 解构 → 重构链；
- 重构下的三类设计杠杆；
- 其他四条分支的第二层能力群；
- 每个可展开叶子容器包含的 Capability / Knowledge Topic 数量。

默认不展示全部叶节点的摘要、资源数、个人状态或职业标签。

### 5.2 展开规则

- **可展开叶子容器**是任何直接包含 Capability / Knowledge Topic 的 entry、stage、lever 或 cluster。点击或键盘激活叶子容器，会在原分支附近展开其中的实体。
- 同一时间最多展开一个叶子容器，避免地图重新变成全量长图。
- 展开新的叶子容器会关闭旧容器；返回全图会清除展开与聚焦状态。
- 每个展开叶节点使用一个非交互容器承载两个同级动作：明确的“在地图中查看关系”按钮负责选中并打开检查器，独立的实体名称链接进入已有详情页。不能把 button 与 anchor 互相嵌套。
- 键盘顺序固定为关系按钮 → 详情链接；两者都有包含实体名称的可访问名称。无 JavaScript 时关系按钮禁用并说明，详情链接继续可用。
- 检查器只显示名称、实体类型、简短说明、直接资源入口和详情页入口，不复制完整详情页。
- 无 JavaScript 时，完整的 EGDS 层级、Capability、Knowledge Topic 与关系通过原生文字大纲访问，不依赖检查器。

增强交互使用两项唯一状态：`expandedFrameworkNodeId` 与 `selectedEntityKey`，都由 `CapabilityMap` 拥有。Career 摘要不能自行操作 DOM；它只能通过公开的 capability-id 请求入口要求地图聚焦。一次请求必须原子执行“关闭旧叶子容器 → 展开目标容器 → 选中目标 Capability → 即时把目标带入视口”。清除 Career Lens 不改变这两项地图状态。

“返回全图”是持续可见且可键盘操作的明确控件。它清除展开、选中、检查器和关系聚焦，但保留当前 Career Lens 与个人状态。无 JavaScript 时，单展开约束不适用：各叶子容器使用原生 disclosure，可以分别打开；Career 聚焦按钮禁用并说明，详情链接仍然可达。

### 5.3 关系显示

- EGDS 主干与阶段连接持续可见，表达作者方法结构。
- `supports` 与 `complements` 仍来自 catalog 的真实关系，不参与生成 EGDS 父子结构。
- 默认总览不显示 64 条跨能力关系，避免装饰线和信息竞争。
- 聚焦一个 Capability 时，仅显示其直接关系与端点；`supports` 使用有向实线，`complements` 使用无向虚线。
- 关闭聚焦后，跨能力关系再次隐藏，而不是残留为低透明度线网。

## 6. 布局与滚动合同

### 6.1 桌面

- 地图不再使用同时接管 X/Y 的内部 `overflow: auto` 容器。
- 默认总览按可用宽度计算稳定布局，不需要纵向内部滚动。
- 展开叶子容器时，由页面自然增加高度；滚轮继续滚动页面，不在地图内部形成第二个纵向滚动上下文。
- 总览布局不能使用随机或 force-directed 位置；同一份数据在输入顺序变化后仍产生相同位置。
- 主干、阶段、能力群、Capability 与 Knowledge Topic 的视觉大小逐级减弱；节点文字保持正常可读尺寸，不以整体缩小字体换取“全量一屏”。
- 桌面思维导图断点固定为 `> 1150px`；`≤ 1150px` 使用关系等价大纲，避免在中间宽度硬塞缩小画布。
- 1440px 下地图可用布局宽度以现有正文容器为上限，默认骨架高度不得超过 720px。
- 根／主分支文字不得小于 16px，阶段／杠杆不得小于 14px，能力群不得小于 13px，展开叶节点不得小于 12px；常驻标签最多两行且不得省略。
- 默认和每一个单群展开状态都必须满足节点盒零重叠；结构边不能穿过非端点节点；边的端点必须落在对应节点边界而不是节点中心。

### 6.2 中间宽度与移动端

- 当横向思维导图不能在正常字号下成立时，切换为 EGDS 层级大纲，不提供被压缩的桌面图。
- 大纲顺序与桌面图相同，先显示五条主分支，再显示阶段／能力群，最后按需展开具体实体。
- 移动端所有 Capability 与 Knowledge Topic 的直接链接持续可达；关系进入原生 disclosure。
- 页面级 HTML/body 不产生横向溢出。

### 6.3 滚动故障验收

- 鼠标滚轮或触控板在地图任意空白、节点和连接线区域上，都应自然推动页面纵向滚动。
- 键盘聚焦展开的节点时，只在确有需要时进行一次即时滚动，不叠加全局 smooth scroll 延迟。
- 地图不使用普通滚轮缩放；这一交互只属于 Innovation Atlas。

## 7. Career Lens 与个人状态

- Career Lens 只投影到 Capability，不改变 EGDS 方法节点或 Knowledge Topic。
- 应用画像后，所有折叠的可展开叶子容器显示事实计数，例如“2 核心 · 3 重要”，但不计算完成率、匹配度或差距。
- 展开叶子容器后，Capability 延续核心／重要／建议了解的填充、边框、线型和中文标签；方法节点不继承这些颜色。
- 清除画像只清除画像投影，不改变当前展开分支、个人实践状态或资源筛选。
- 个人状态继续只属于 Capability，并且不汇总到 EGDS 阶段或职业适配分数。

## 8. 数据与迁移合同

新增或重塑一份 EGDS framework 数据，至少保存：

- 稳定 ID；
- 中英文名称与简短说明；
- 节点种类：根、主分支、阶段、设计杠杆、能力群、外部入口；
- 父节点 ID；
- 稳定顺序；
- 显式的 `process-next` 与 `links-to` 框架关系。

数据只有一份归属真源：

- 每个非根 framework node 的 `parentNodeId` 是结构归属真源；运行时 `contains` 关系从它构建，不在 JSON 重复保存。
- 每个 Capability / Knowledge Topic 的 `frameworkNodeId` 是实体主要展示位置的真源；叶子容器的实体列表从 catalog 反向派生，不在 framework node 重复保存。
- 规格中的 54 项映射表是迁移与验收基线，不成为第二份 runtime 数据。

构建期必须验证：

- 根节点唯一；
- 五条主分支完整且顺序稳定；
- 方法节点无循环、无孤儿；
- 每个非根 framework node 恰好有一个有效 `parentNodeId`，派生后恰好一条入站 `contains`；
- 每个 Capability 与 Knowledge Topic 恰好有一个主要展示位置；
- 每个叶子容器的派生实体列表与全体实体 `frameworkNodeId` 严格互逆；
- `process-next` 精确为 `perception → rationalization`、`rationalization → deconstruction`、`deconstruction → reconstruction` 三条，不允许缺失、增加或反向；
- `links-to` 精确为 `innovation-possibility-space → Innovation Atlas` 一条，目标通过现有 base-path helper 解析到站内 Atlas 路由；
- 跨 collection 同名 ID 使用类型命名空间；
- Career Profile 只引用 Capability；
- Innovation 入口使用站内稳定 URL；
- 当前 42 个 Capability、12 个 Knowledge Topic 和 64 条能力关系不因迁移被静默丢失。

当前五条通用 `mapGroups` 与 8 个通用 Domain 在本切片中正式退休，而不是作为隐藏的第二套真相长期保留：

- 删除它们作为 catalog collection、布局输入和公开计数的角色；
- Capability / Knowledge Topic 的 `domainId` 与手工 `position` 迁移为 EGDS 的主要 `frameworkNodeId`；
- Capability / Topic 详情 breadcrumb、首页与地图页说明统一指向 EGDS 能力群或方法节点；
- 旧 Domain bounds、锚点和 `#map-region-*` 不再生成；如果实施期间需要一次性迁移脚本，它不能成为 runtime 依赖；
- 现有 capability/topic URL 保持不变；旧 map fragment 不承诺兼容，因为它从未代表稳定实体详情 URL。

### 8.1 首版 54 个主要展示位置

主要展示位置只决定总览中的唯一渲染位置，不否认跨分支关系。

| Framework Node | Capability IDs |
| --- | --- |
| `experience-journey` | `emotional-arc-shaping` |
| `perception` | `player-perspective-taking` |
| `rationalization` | `experience-framing` |
| `deconstruction` | `experience-deconstruction` |
| `narrative-lever` | `choice-consequence-design`, `narrative-architecture`, `interactive-narrative-design`, `narrative-exposition`, `world-character-coherence` |
| `aesthetics-lever` | `aesthetic-direction`, `multimodal-presentation-integration` |
| `gameplay-challenges-lever` | `core-loop-design`, `rules-system-modeling`, `game-feel-tuning`, `challenge-difficulty-design`, `pacing-control`, `progression-economy-design`, `level-structure-design`, `spatial-flow-design`, `navigation-wayfinding-design`, `encounter-space-composition`, `blockout-spatial-validation` |
| `prototype-production-breakdown` | `learning-prototype-design`, `task-breakdown` |
| `playtest-evidence-iteration` | `research-question-framing`, `playtesting`, `player-behavior-observation`, `qualitative-evidence-synthesis`, `telemetry-interpretation`, `iteration-planning` |
| `tradeoff-specification-delivery` | `scope-prioritization`, `design-specification-handoff` |
| `vision-direction-decisions` | `constraint-aware-decision-making`, `creative-vision-stewardship` |
| `alignment-communication` | `cross-discipline-communication`, `alignment-facilitation` |
| `feedback-collaboration` | `design-critique-feedback` |
| `audience-positioning-cluster` | `audience-positioning` |
| `market-opportunity` | `market-reference-analysis` |
| `value-exchange` | `value-proposition-framing` |
| `monetization-alignment` | `monetization-experience-alignment` |
| `values-culture` | `ethical-cultural-evaluation` |

| Framework Node | Knowledge Topic IDs |
| --- | --- |
| `perception` | `player-motivation-difference`, `perception-attention-emotion` |
| `narrative-lever` | `narratology-agency-authorship` |
| `aesthetics-lever` | `audiovisual-semiotics` |
| `gameplay-challenges-lever` | `emergence-complexity`, `probability-randomness-fairness`, `spatial-cognition-wayfinding` |
| `prototype-production-breakdown` | `production-pipelines-constraints` |
| `playtest-evidence-iteration` | `research-ethics-bias` |
| `leadership-management` | `organizational-dynamics-power` |
| `market-opportunity` | `game-industry-platform-economics` |
| `values-culture` | `games-values-culture` |

首版几个跨义项的主要位置需要在数据说明中保留理由：`choice-consequence-design` 以互动叙事结构为主，和玩法系统的联系由真实关系表达；`blockout-spatial-validation` 以空间设计杠杆为主，和原型生产的联系由真实关系表达；`research-question-framing` 以 Playtest／证据循环为主；`iteration-planning` 以反馈驱动迭代为主；`constraint-aware-decision-making` 以愿景与方向决策为主；`ethical-cultural-evaluation` 归入更广游戏语境而不是商业分支。

## 9. 组件边界

- **EGDS 数据与 validator**：只负责框架、归属和引用闭包。
- **纯布局 helper**：只根据可见框架节点与一个展开叶子容器生成稳定坐标。
- **CapabilityMap**：只渲染总览、展开分支、关系聚焦和无 JavaScript 大纲。
- **Map Inspector**：只显示当前选中实体的最小摘要与现有链接。
- **CareerExplorer**：只计算 Capability 画像投影与叶子容器计数，不拥有 EGDS 结构。
- **CapabilityProgress**：继续只在具体 Capability 语境中读写本地状态。

不引入画布渲染器、第三方图布局库、全局状态管理器、数据库、账号、同步或新的评分模型。

## 10. 验收标准

### 10.1 语义

- 页面明确展示 PlayWithExperiences / EGDS 来源与非唯一答案边界。
- server HTML 可以区分方法节点、Capability 与 Knowledge Topic。
- 感受、理解、解构、重构不出现个人状态或职业优先级属性。
- 重构明确连接叙事、美学与表现、玩法与挑战三类杠杆。
- “如果讨论的不只是游戏”保留 Innovation Atlas 入口，但不复制 Atlas 历史网络。

### 10.2 总览与展开

- 1440 × 900 的地图区域默认可见根、五主分支、EGDS 核心链、三类设计杠杆及全部第二层能力群。
- 默认没有任何叶节点摘要或 64 条关系线挤占总览。
- 激活任一可展开叶子容器只展开该容器；展开另一个后前者关闭。
- 聚焦 Capability 时只出现它的直接真实关系；返回全图恢复干净骨架。
- 输入数组反转后，默认总览和同一展开状态的坐标与顺序保持一致。
- 每个展开实体同时提供独立的关系按钮与详情链接，键盘可依次到达，DOM 中不存在嵌套交互控件。

### 10.3 滚动与响应式

- 桌面地图没有纵向内部滚动容器。
- 在地图上连续执行普通 wheel / trackpad 手势，页面滚动不会被地图截获或卡在内部边界。
- 320px 和中间宽度显示关系等价的 EGDS 大纲，不缩小桌面画布。
- 1440px / 320px、Light / Dark、JavaScript / no-JS 均无页面级横向溢出。

### 10.4 Career 与内容完整性

- 三个现有 Career Lens 在折叠叶子容器和展开 Capability 两层表达一致，且不产生分数。
- 42 个 Capability、12 个 Knowledge Topic、64 条能力关系及其详情／资源链接全部可达。
- 无 JavaScript 时完整层级和关系文字仍可访问；依赖脚本的展开与检查器控件禁用并说明。

### 10.5 工程门禁

- 先以纯数据／布局测试和浏览器行为测试取得旧实现 RED，再实现最小 GREEN。
- Astro check、Vitest、fresh build 和 Map / Career desktop/mobile E2E 全绿。
- 最终视觉检查覆盖 Map 与 Career 的 1440px / 320px、Light / Dark、默认／展开／画像／no-JS 状态。
- 仓库保持 Private，Pages workflow 保持禁用；本切片不发布。

## 11. 明确不做

- 不在本切片修改成长资源行或增加资源。
- 不在本切片改变 Innovation Atlas 的缩放语义或增加历史节点。
- 不把 EGDS 方法阶段变成可完成任务、学习路径或职业评分维度。
- 不为了容纳所有文字而缩小整张图或引入无限画布。
- 不为每个职业复制一张地图。
- 不恢复 Public、Pages 或自动部署。

## 12. 后续独立切片

1. **成长资源密度与媒介编码**：默认采用更紧凑的单行目录，并以文字标签、边框／色条冗余区分书籍、论文、演讲、视频、播客、课程与网站；继续不建立站内评分。
2. **Innovation Atlas 地图式交互**：评估普通滚轮缩放与页面滚动的明确接管方式，继续保留拖动、适应全图和无 JavaScript 大纲。
3. **Innovation Atlas 内容扩充**：从早期实验、商业里程碑、普及节点和后续创新关系分别建证，不能把常见叙述直接写成“第一个电子游戏”。
