# Innovation Event Atlas 与资源扩展设计

**日期：** 2026-08-15  
**状态：** 已获发起人确认，进入实现

## 目标

把 Innovation Atlas 的主要阅读对象从“按时间排列的游戏作品”提升为“可核查的创新事件／机制演进”，同时保留游戏作为承载、验证和传播这些事件的作品节点。继续补充约 1000 条高质量学习资源，并修正全站长标题、说明文字和窄列造成的异常换行。

## 设计判断

Atlas 要回答的是“什么创新在什么时候出现、以什么方式被提出、转译、普及或重新定义”，而不是只列出作品年表。作品仍然重要，但不应和创新事件共用完全相同的视觉权重。

资源数量是覆盖库存，不是质量分数。新增条目必须有可核验的具体页面、真实访问方式、单一主资源主题和明确能力／知识议题映射；不能用搜索摘要、聚合页或猜测的可访问性凑数。

## Atlas 数据模型

保留现有 `atlasNodes`、`atlasRelations`、`atlasEvidence` 和 `atlasThemes`，不恢复已经退休的 Domains / mapGroups ontology。

### 节点语义

- `innovation`：创新事件或机制事件，例如 FPS 视角与空间感、锁定目标式战斗、RPG 成长与属性、开放世界非线性探索、程序生成与单局循环。
- `category`：类别命名、类别形成或市场语境事件，例如 FPS 类别形成、RPG 角色扮演语境稳定化。
- `game`：承载、验证、转译或普及创新的具体作品。
- `experimental-*` / `commercial-hardware`：保留用于早期硬件、实验程序和商业化基础历史。

创新事件用现有 `kind` 与 tags 表达事件子类，避免为每个事件引入不可复用的专用字段。事件与作品之间使用已有关系类型：`prototype-to-product`、`commercialized-as`、`design-response`、`direct-influence`、`fusion` 或 `revival`；每条关系仍需自己的 Evidence。

### 推荐首批事件

首批先补五条跨品类、证据清晰的事件切片：

1. FPS 视角与空间感；
2. Zelda Ocarina of Time 的锁定目标式战斗；
3. RPG 成长与角色属性；
4. 开放世界的非线性探索；
5. 程序生成与单局循环。

这些事件不宣称绝对“第一”，而是写成“当前数据库中有证据支持的形成／转译节点”，并在 scope note 中写清边界。

### Atlas 交互

- 全局时间网络继续保留，不复制第二张地图。
- 创新事件使用更高的视觉层级；游戏节点作为较轻的承载节点；类别事件使用独立的范围语义。
- 选择品类或 Theme 时，同时强调事件、承载作品和关系，但不隐藏或重排其他对象。
- 没有内容的品类显示“已建立入口，待补证据”，而不是显示一个看似可点击却没有结果的空面板。
- 点击创新事件打开原生详情面板，显示事件摘要、承载作品、关系和 Evidence；关闭、Escape 或再次选择恢复全图状态。
- 透镜切换保持 scale、pan、search、map mode、节点数量和关系几何不变。
- 无 JavaScript 继续输出完整节点、关系、事件详情和空 Family 说明。

## 资源扩展

将约 1000 条新增 Work Item 拆成可审计批次，优先英文和中文，日文仅在明确研究价值时加入：

- 约 450 条 GDC Vault 官方会话；
- 约 200 条 Game Developer、Lost Garden 与其他开发者复盘／原作者文章；
- 约 150 条官方课程、论文、书籍章节和机构研究页；
- 约 100 条 Unity、Unreal、Godot、FMOD 等官方学习资料；
- 约 100 条中文官方课程、行业实录、作者文章和跨专业研究资料。

每条必须满足：

- canonical URL 唯一，Source homepage 与 Work URL 分离；
- 原始语言、可消费语言、媒体类型、访问方式和 checkedAt 真实；
- 恰好一个主要 Resource Topic；
- 至少一个合法 Capability 或 Knowledge Topic 映射；
- 付费、订阅、地区限制和链接状态如实记录；
- 研究 notebook 记录后端、核验页面、纳入理由和排除项。

不新增评分、排名、质量徽章或强制学习顺序。GDC 订阅会话仍标记为 `talk` + `subscription`，不把目录页伪装成免费正文。

## 全局换行与密度

- 长段落和说明文字优先 `text-wrap: pretty`；短标签和确实需要成组的标题才使用 `balance`。
- 标题默认使用完整可用宽度；移除没有信息价值的固定窄 `max-width`。
- 1440、1024、320 三种视口均检查：第二行不得只剩 1–2 个汉字或孤立英文短词，不能出现页面横溢出。
- 保留真正表达层级的分割线；移除仅用于装饰、重复相邻边界的 divider。
- 资源 Work Item 访问版本和事实摘要尽量与主条目同一行；只有确实超出宽度时才进入自然换行或 disclosure。

## 验收

- Atlas 至少存在五类创新事件节点，且每类有 Evidence 闭包、承载作品或明确待研究说明。
- 品类透镜能同时强调事件和作品；空品类不会出现死控件。
- 事件详情不导致地图整体重排，关闭与 Escape 恢复原状态。
- 1000 条资源以可核验批次导入，所有 catalog validator、canonical ownership、one-topic 和语言／媒体计数通过。
- 全站关键页面在 Light/Dark、1440/1024/320 和 no-JS 下无异常短行或横溢出。
- fresh `npm run check`、`npm test`、`npm run build` 和完整 Playwright 通过；仓库保持 Private、Pages 保持禁用、本地预览保持可访问。
