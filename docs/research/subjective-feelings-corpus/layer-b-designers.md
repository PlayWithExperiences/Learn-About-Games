# B 层：设计者语域

本层区分三种对象：目标感受、承载多个感受的束词、以及制作手段。设计者常把三者混在一句话里，EGDS 若要可操作，必须在入库时拆开。

## 中文行话

| 原词 | 设计语境与来源 | 粗略热度 | 层级判断 |
|---|---|---|---|
| 枪感 / 射击手感 | “是什么造就顶级枪械手感”把武器动画、声音、反馈等归为一个目标束。[B 站](https://www.bilibili.com/video/BV1A9kMBqEVL/)；GameTube 课程直接用“射击手感”。[B 站](https://www.bilibili.com/video/BV1j34y157uV/) | 约 9.9 万、3 万播放；另一次 `枪感 游戏设计` 检索的头部结果约 34.4 万、22.3 万播放 | 目标束词：不是单一情绪，而是响应、重量、冲击、准确性与声音的合成知觉。 |
| 打击感 | 多个教程把它作为独立设计目标。[B 站 1](https://www.bilibili.com/video/BV1xG4y1f7ai/)；[B 站 2](https://www.bilibili.com/video/BV1fR4y1y7vT/) | 约 3.5 万、2 万播放；定向搜索另见约 28.2 万、23.6 万播放结果 | 成熟中文准术语；比英文 `impact/weight/hit feedback` 更压缩。 |
| 手感 / 操作感 | 中文课程用“手感”指输入到角色响应的整体品质。[B 站](https://www.bilibili.com/video/BV1G34y1i7Nt) | 约 9.2 万播放；同次检索另有约 4.1 万、1.7 万播放 | 上位束词，可能吞并枪感、打击感、操控感；不宜与它们重复计数。 |
| 爽感 | 内容标题直接以“爽感”作为要设计的结果。[B 站](https://www.bilibili.com/video/BV1np4y1J7FC) | 约 304 万播放；同次检索另有约 59.3 万、12.3 万播放 | 高频宽结果词；正效价太宽，但确实是设计者语域中的稳定目标。 |
| 顿帧 / 卡肉 | 教程把顿帧列为制造打击感的关键。[B 站](https://www.bilibili.com/video/BV16T4y1B7uK/)；另一个视频并列“弹刀、粘刀、顿帧”。[B 站](https://www.bilibili.com/video/BV1fR4y1y7vT/) | 约 3.2 万、2 万播放 | **设计杠杆/客观原因**，不是与打击感并列的主观感受。 |
| 博弈感 / 立回感 / 拉扯感 / 读心 | 一条动作/格斗讨论把四词并列。[B 站](https://www.bilibili.com/video/BV1VKMnzEEUa) | 约 0.23 万播放 | B 层直接命中但样本热度低；“对 AI”与“对人”必须拆义，见[同名不同物](same-name-different-thing.md)。 |
| 节奏感 / 关卡节奏 | 关卡设计内容用空间、节奏、引导解释情绪塑造。[B 站](https://www.bilibili.com/video/BV13jQdB6Efd/)；GDC 也把音乐结构用于关卡 pacing。[GDC slides](https://media.gdcvault.com/GDC%2B2022/Speaker%2BSlides/1%2C2%2C3%2BAction%2BInspiring%2BLevel%2BDesign%2BPacing%2Bfrom%2BMusic_Rasouli_Taha.pdf) | B 站约 1.7 万播放 | 多为时序结构/客观原因；玩家体验可表现为紧张、松弛、期待或心流。 |
| 沉浸感 / 代入感 | 中文设计内容直接问“游戏怎样营造沉浸感”。[B 站](https://www.bilibili.com/video/BV16L41177Xx) | 约 0.49 万播放 | 宽束词；中文常不区分角色认同、注意吸收与空间在场。 |

## 英文行话

| 原词 | 设计语境与来源 | 粗略热度 | 层级判断 |
|---|---|---|---|
| game feel | Swink 将其界定为对模拟空间中虚拟物体的实时控制并由 polish 强调；后续综述覆盖 200+ 来源。[EoLT 条目](https://eolt.org/articles/game-feel/)；[设计综述](https://arxiv.org/abs/2011.09201) | 综述来源规模 200+；非社媒热度 | 上位设计概念，不是单一主观感受。X 精确词查询也出现设计师称 “good gamefeel is key”。[X](https://x.com/i/status/1587557915656847362)（573 赞快照） |
| juice / juiciness | Game Developer 把 juice 描述为在不改核心机制时用动画、音频等让交互更 responsive/satisfying。[文章 1](https://www.gamedeveloper.com/design/squeezing-more-juice-out-of-your-game-design-)；[文章 2](https://www.gamedeveloper.com/design/3-game-juice-techniques-from-slime-road) | 热度未查证 | 制作策略/反馈密度，不是主观感受词；可能制造爽感、打击感与可读性。 |
| gun feel / gunplay | GDC 的 Battlefield 讲座把目标写成 responsive、kinetic gun feel，并讨论玩家意图、感知延迟、视觉与音频反馈。[GDC](https://schedule.gdconf.com/session/battlefield-6-game-feel-is-the-message/915257)；Destiny 讲座讨论第一人称武器动画。[GDC Vault](https://www.gdcvault.com/play/1022297/The-Art-of-First-Person) | 热度未查证 | 英文仍可说 gun feel，但常被展开成 recoil、snap、impact、response 等变量。 |
| responsiveness / precision / weight | 平台动作设计文章把 responsive/precise 与重量、重力、空中加速度放在同一权衡中。[Game Developer](https://www.gamedeveloper.com/design/platformer-controls-how-to-avoid-limpness-and-rigidity-feelings)；另文讨论 responsive input 与 realistic weight。[Game Developer](https://www.gamedeveloper.com/design/run-jump-and-climb-designing-fun-movement-in-games-with-video-) | 热度未查证 | 前两者是操控感构成；weight 是身体化结果，也可能服务物理真实。 |
| impact / satisfying feedback | 控制设计文章把反馈、响应、动画重量与玩家意图连接。[Game Developer](https://www.gamedeveloper.com/design/designing-game-controls)；虚拟感官原则强调 predictable results、feedback 与 impact。[Game Developer](https://www.gamedeveloper.com/design/principles-of-virtual-sensation) | 热度未查证 | 对应“打击感”的一部分；英文通常没有一个词覆盖中文全部语义。 |
| readability / clarity | 战斗与控制设计常要求让玩家读懂输入结果；GameFlow 也把 clear goals/feedback 列为条件。[GameFlow 原文镜像](https://www.readkong.com/page/gameflow-a-model-for-evaluating-player-enjoyment-in-games-4126799) | 热度未查证 | 可感知条件/品质，不是目标情绪；可能支撑掌控、博弈和公平。 |
| agency / meaningful choice | 设计文章以 Murray 的 agency 讨论“采取有意义行动并看到选择结果”，并关联自由探索。[Game Developer](https://www.gamedeveloper.com/design/designing-for-meaningfulness-player-freedom-and-prototyping-exploration-mechanics) | 热度未查证 | 接近自由感与后果感，但 agency 是行动—结果结构，不只是主观自由。 |
| yomi / reads | Sirlin 把 yomi 写成读取对手意图、进入多层反制。[Sirlin](https://www.sirlin.net/articles/designing-yomi)；Game Developer 也以“Know Thy Enemy”讨论设计 yomi。[文章](https://www.gamedeveloper.com/design/know-thy-enemy-designing-for-yomi-in-games) | 热度未查证 | 明确偏向人类/对手建模；不宜无条件等同所有 ACT 的“博弈感”。 |
| mental model / systemic feedback | 策略设计强调决策竞争、透明与清晰；RTS 研究把 mental model 的价值写成预测与解释系统。[Game Developer](https://www.gamedeveloper.com/design/criteria-for-strategy-game-design)；[RTS 研究](https://journals.sagepub.com/doi/10.1089/cpb.2006.9.361) | 热度未查证 | “策略掌控感”的认知基础，与平台动作的即时输入响应不同。 |
| living, breathing world | GDC AI 讲座指出静态 set-piece 会破坏 living/breathing world 的沉浸。[GDC Vault](https://www.gdcvault.com/play/1020110/Free-Range-AI-Creating-Compelling) | 热度未查证 | 对应开放世界“真实的世界”，重点是实体自治与持续运转，而非物理拟真。 |
| coziness / cozy design | 设计者把 coziness 明确称为可作用于任何游戏的 aesthetic goal，并拆成 safety、abundance、softness。[Game Developer](https://www.gamedeveloper.com/design/designing-for-coziness) | 热度未查证 | 直接支持把 cozy 当目标体验簇；同时反驳 `cozy = 慢节奏` 的单因解释。 |
| synergy / build | Roguelite 设计复盘把 card synergy、发现组合与 power players 寻找最优策略放在核心。[Game Developer](https://www.gamedeveloper.com/design/tackling-deckbuilding-design-in-abrakam-s-roguebook) | 热度未查证 | `build 成型` 是组合关系进入自维持/高效阶段的过程结果，不只是 Power。 |
| music syncing / in sync | 音游实现文章强调动作、移动、输入必须与音乐直接同步，偏差会被人敏锐察觉。[Game Developer](https://www.gamedeveloper.com/audio/coding-to-the-beat---under-the-hood-of-a-rhythm-game-in-unity) | 热度未查证 | 这是制造“同步感”的客观时序条件；主观 flow 仍是另一层。 |

## 中英不对称：本次最重要的观察

| 中文压缩词 | 英文语料的常见展开 | 是否可直译 |
|---|---|---|
| 打击感 | impact, hit feedback, hit-stop, weight, punch, audiovisual feedback, enemy reaction | **否**。`impact feel` 只能覆盖一部分；顿帧又是手段，不是感受。 |
| 枪感 | gun feel/gunplay + recoil, kick, snap, accuracy, report, animation, perceived latency | **部分**。英文有 gun feel，但实际讨论更常拆解。 |
| 手感 | controls feel, responsiveness, precision, weight, game feel | **否**。`game feel` 比中文“手感”更宽，`controls feel` 又更窄。 |
| 爽感 | satisfaction, power fantasy, catharsis, exhilaration, juiciness | **否**。这些词分别指满足、强力幻想、宣泄、兴奋或反馈密度。 |
| 代入感 / 沉浸感 | identification, absorption/engagement, presence, immersion | **否**。英文研究明确存在分层；中文日常语域常混用。 |
| 博弈感 | mind games, yomi, reads, counterplay, decision-making, pattern learning | **否**。对人和对系统的对象不同。 |
| 同步感（音游） | being in sync/on beat, entrainment, sensorimotor synchronization, flow | **存疑**。同步是机制—身体耦合，flow 是更宽的体验状态。 |
| 后果感 | meaningful consequence, agency, reactivity, choice impact | **部分**。英文更像结构与可见证据，不常名词化为 feeling。 |

反方向也存在不对称：英文 `readability`、`agency`、`presence`、`juiciness` 在中文没有一个稳定单词能无损对应。故对表必须先对**所指机制/体验**，不能只对词典翻译。
