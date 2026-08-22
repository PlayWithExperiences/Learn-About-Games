# 同名不同物：三个必须先拆义的词

判定标准不是字面能否归入同一上位词，而是：体验主体在预测什么、闭环时间尺度是什么、失败时玩家抱怨什么、对应设计杠杆是否相同。若这些轴系统性不同，就应拆成两个可分别研究的词条；可保留共同父类，但不能共用一套原因/杠杆。

## 1. 「掌控感」：Platformer 的身体闭环 vs Strategy 的认知模型

| 维度 | Platformer / 操作类 | Strategy |
|---|---|---|
| 玩家要掌控的对象 | 自己的角色、速度、跳跃弧线、落点 | 多单位、资源、规则、对手与长期后果 |
| 闭环尺度 | 毫秒到秒：按下—运动—修正 | 秒到多回合：判断—部署—反馈—更新模型 |
| 正面词 | responsive, precise, smooth | predictable, legible, informed, strategic control |
| 典型失败 | input lag、floaty、rigid、角色惯性不合预期 | 信息不透明、反馈迟滞、规则例外、结果不可解释 |

证据：平台动作设计文章直接把 reactive/precise 与重量、重力、空中加速度联系起来，[Game Developer](https://www.gamedeveloper.com/design/platformer-controls-how-to-avoid-limpness-and-rigidity-feelings)；控制设计把玩家意图、反馈与响应性放入同一闭环。[Game Developer](https://www.gamedeveloper.com/design/designing-game-controls) 策略侧则把玩法定义为决策竞争并强调透明/清晰，[Game Developer](https://www.gamedeveloper.com/design/criteria-for-strategy-game-design)；RTS 研究明确说 mental models 给玩家预测和解释能力。[CyberPsychology & Behavior](https://journals.sagepub.com/doi/10.1089/cpb.2006.9.361)

**判定：应拆成两条。** 建议工作名分别为“身体操控感（sensorimotor control）”与“系统掌控感（systemic/epistemic control）”。二者可共挂上位 `Control`，但不可复用同一套测试：前者测输入—运动映射，后者测规则可读性与预测正确率。

## 2. 「真实感」：Racing 的物理可信 vs Open World 的世界自治

| 维度 | Racing / 写实拟真 | Open World / “真实的世界” |
|---|---|---|
| 被判断的对象 | 车辆质量、抓地、加速、碰撞、声音与驾驶反馈 | NPC/生态/社会是否持续、自洽、不会只围着玩家启动 |
| 核心预期 | “车应当这样动、这样重” | “世界没有我也会这样活” |
| 常见近词 | weight, grip, inertia, simulation, authenticity | living/breathing world, persistence, reactivity, autonomy |
| 典型杠杆 | 物理参数、轮胎模型、动画/相机/音频反馈 | AI 日程、系统互作、状态持久、事件独立性、反应性 |

证据：玩家在讨论“更重”的玩法时直接举 GT7，称能从车内感觉 power 与 weight；[Reddit](https://www.reddit.com/r/truegaming/comments/zxkk0t/i_wish_that_games_had_heavier_gameplaycombat/) Steam 赛车评测也用 heavy/weighty 描述 handling。[Steam](https://steamcommunity.com/id/Menphues/recommended/) 开放世界侧，玩家把 “world goes on whether the player is there or not” 当作 living world 标准，[Reddit](https://www.reddit.com/r/gaming/comments/1d5ekzn/)；GDC AI 讲座则指出静态 set-piece 会破坏 living, breathing world 的沉浸。[GDC Vault](https://www.gdcvault.com/play/1020110/Free-Range-AI-Creating-Compelling)

**判定：应拆成两条。** 工作名可分别为“物理真实/重量可信”和“世界真实/自治可信”。二者共享“预期一致性”父类，但客观原因和验证办法几乎完全不同。`世界观` 若只指 lore/setting，甚至不应放在主观感受层；只有“世界像自己在运转”才属于此处体验。

## 3. 「博弈感」：ACT 对系统/AI vs 格斗 PvP 对人

| 维度 | ACT 对系统/AI | Fighting PvP 对人 |
|---|---|---|
| 被读取的对象 | 招式前摇、AI 状态机、资源窗口、关卡脚本 | 会适应、欺骗、反向预测的另一名玩家 |
| 不确定性来源 | 设计好的模式、随机性、执行压力 | 对手意图与双方共同学习 |
| 学习终点 | 识别规律并稳定解题，可能趋于“破解” | 多层 yomi 持续循环，答案随对手更新 |
| 邻近词 | pattern recognition, commitment, punish window, counterplay | reads, mind games, conditioning, yomi, adaptation |

证据：中文设计内容把“博弈感、立回感、拉扯感、操作感”并列，证明行话真实存在但没有自动区分对手类型。[B 站](https://www.bilibili.com/video/BV1VKMnzEEUa) 对 PvP，Sirlin 明确定义 yomi 为读取对手意图并进入“我知道你知道”的多层反制，[Sirlin](https://www.sirlin.net/articles/designing-yomi)；Game Developer 同样以 Know Thy Enemy 讨论 yomi。[文章](https://www.gamedeveloper.com/design/know-thy-enemy-designing-for-yomi-in-games) 对 ACT/AI，本次没有找到一个公认且同名的学界构念；PLEX Challenge、QF Strategy 与一般 pattern learning 只能作为邻近证据，[QF](https://quanticfoundry.com/gamer-motivation-model/)——因此 ACT 侧的精确边界仍需后续实例拆解，不能伪装成已验证。

**判定：应拆成两条，同时保留共同父类。** 父类可暂称“预测—承诺—反制体验”；子项分别是“系统博弈（pattern/counterplay）”与“人际博弈（yomi/reads）”。理由不是 PvE 没有博弈，而是对手是否能建模并反向建模玩家，会改变体验的核心不变量。

## 总结

三个同名词都应拆：

1. 掌控感 → 身体操控 / 系统掌控；
2. 真实感 → 物理可信 / 世界自治可信；
3. 博弈感 → 对系统模式 / 对人意图。

这不是把清单机械扩张为六项：可以在展示层保留三个父词，但研究、证据和设计杠杆必须在子项层分开，否则会出现“同一词条对应两套互不相干的失败模式”。
