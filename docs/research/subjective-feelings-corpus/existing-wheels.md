# 既有轮子与無涘清单逐项对照

映射等级：**覆盖** = 無涘基线中有相当直接的目标；**部分覆盖** = 只覆盖该框架构念的一部分，或需跨语言/跨粒度解释；**无对应** = 無涘基线没有清楚目标。这里的“无对应”不是缺陷评分，也不替無涘决定是否增加。

無涘基线以 [README](README.md#对表基线原样保留) 为准；框架的作者、年份、完整清单和测量性质见 [C 层](layer-c-academic.md)。

## PLEX 22 类逐项映射

[PLEX 作者页](https://users.aalto.fi/~luceroa1/research/plex/)明确将 22 类做成供设计师与研究者使用的卡片，并列出设计模式和专家启发式评估等后续用途。

| PLEX 类目 | 映射等级 | 無涘清单中的相邻项 | 映射说明 |
|---|---|---|---|
| Captivation | 部分覆盖 | 代入感、在场感（Claude） | 被吸住/专注可能是沉浸的一部分，但不等于角色代入或空间在场。 |
| Challenge | 部分覆盖 | 博弈感、成长感、顿悟感（Claude） | 挑战是条件/体验；三个候选分别取其对抗、能力增长与解题突破。 |
| Competition | 部分覆盖 | 博弈感、社交感、读心（Claude） | 格斗读心直接邻近；ACT 对 AI 不必然是竞争。 |
| Completion | 部分覆盖 | 成长感、build 成型（Claude） | 完成目标可带来成长/成型，但两者还包含力量曲线和能力变化。 |
| Control | 覆盖 | 操控感、掌控感、自由感 | PLEX 一个 Control 同时触及身体、系统和选择；EGDS 必须拆义。 |
| Cruelty | 无对应 | — | 基线没有以施加残酷/恶意为目标的感受。 |
| Discovery | 部分覆盖 | 顿悟感、自由感、“真实的世界” | 顿悟是发现关系的一种峰值；开放世界探索也可产生发现。 |
| Eroticism | 无对应 | — | 基线没有情色/性感体验。 |
| Exploration | 部分覆盖 | 自由感、“真实的世界” | 自由移动和可信世界可支持探索，但探索本身未单列。 |
| Expression | 覆盖（Claude） | 表达感 | 词义最直接的一组。 |
| Fantasy | 部分覆盖 | 代入感、世界观 | fantasy 指进入不可能/想象世界；代入与世界设定只覆盖部分。 |
| Fellowship | 覆盖 | 陪伴感、社交感 | 关系联结直接相邻，但 MMO 社交也包含竞争、交易和组织。 |
| Humor | 无对应 | — | 基线无幽默/滑稽。 |
| Nurture | 部分覆盖 | 陪伴感 | 照料与共同陪伴可以重叠，但照料对象和责任感未被清单表达。 |
| Relaxation | 覆盖 | cozy（舒适感） | 直接邻近；cozy 仍比 relaxation 多安全、柔软、熟悉、丰足。 |
| Sensation | 部分覆盖 | 枪感、打击感、真实感、同步感（Claude） | PLEX 是宽感官刺激；清单把它细分为几个高度工艺化的复合感觉。 |
| Simulation | 部分覆盖 | 真实感、“真实的世界” | 物理模拟接近赛车真实；社会/生态自治不等于 simulation。 |
| Submission | 无对应 | — | “让自己交给游戏/消磨时间”的体验没有直接项。 |
| Subversion | 无对应 | — | 破坏规则/越界体验没有直接项。 |
| Suffering | 部分覆盖 | 恐怖、匮乏→稳定、孤独（Claude） | 恐惧、匮乏、孤独可含受苦，但各自也可能转为愉悦、宁静或安全。 |
| Sympathy | 部分覆盖 | 陪伴感、后果感（Claude） | 对角色的同情可能加强陪伴与叙事后果，但不是同一体验。 |
| Thrill | 部分覆盖 | 恐怖、枪感、打击感 | 兴奋/惊险可能来自战斗或恐怖，但清单没有把 thrill 单列。 |

PLEX 的明显空白反向看也很重要：無涘基线没有 Cruelty、Eroticism、Humor、Submission、Subversion 的直接位置；而無涘的枪感、打击感、build 成型、匮乏→稳定等又比 PLEX 的 Sensation/Control/Completion/Suffering 更具体。

## Quantic Foundry 12 动机逐项映射

QF 官方强调这是因子分析得到的“玩家为什么玩”的动机模型，并报告 14 万+ 样本；不能把“喜欢某动机”自动写成“游玩中产生某感受”。[官方模型](https://quanticfoundry.com/gamer-motivation-model/) [方法](https://quanticfoundry.com/2015/07/20/how-we-developed-the-gamer-motivation-profile-v2/)

| QF 动机 | 所属簇 | 映射等级 | 無涘清单中的相邻项 | 边界 |
|---|---|---|---|---|
| Destruction | Action | 部分覆盖 | 打击感、爽感（清单外语料） | 喜欢破坏可能追求冲击/力量，但动机不等于打击感。 |
| Excitement | Action | 部分覆盖 | 恐怖、枪感、打击感 | 快节奏惊险可由这些产生；没有专门“兴奋感”。 |
| Competition | Social | 部分覆盖 | 博弈感、读心（Claude）、社交感 | PvP 读心接近；社交感也可完全非竞争。 |
| Community | Social | 覆盖 | 社交感、陪伴感 | 对群体归属覆盖较直接，但“陪伴”更强调持续关系。 |
| Challenge | Mastery | 部分覆盖 | 博弈感、顿悟感（Claude）、成长感 | 分别对应策略困难、解题突破和能力提升。 |
| Strategy | Mastery | 部分覆盖 | 掌控感（Strategy）、宏观感、读心（Claude） | 动机是享受决策；清单是决策时的目标感觉。 |
| Completion | Achievement | 部分覆盖 | 成长感、build 成型（Claude） | 完成收集/目标与角色成长和 build 成型不完全相同。 |
| Power | Achievement | 覆盖/部分覆盖 | 成长感、滚雪球/build 成型（Claude） | 成型后的力量体验直接，成长感还包括过程。 |
| Fantasy | Immersion | 部分覆盖 | 代入感、世界观 | 想象身份/世界可支持代入，但不能覆盖在场或世界自治。 |
| Story | Immersion | 部分覆盖 | 陪伴感、后果感（Claude）、代入感 | 叙事可制造三者，但“有故事”不是任一感觉本身。 |
| Design | Creativity | 覆盖（Claude） | 表达感 | 创造/定制动机与表达直接相邻。 |
| Discovery | Creativity | 部分覆盖 | 顿悟感、自由感、“真实的世界” | 发现内容/关系能产生顿悟与探索自由，但粒度不同。 |

## GEQ 逐项映射

GEQ 的模块和构念出处见 [TU/e](https://research.tue.nl/en/publications/the-game-experience-questionnaire/)、[开放综述](https://pmc.ncbi.nlm.nih.gov/articles/PMC8045398/)与[后续验证](https://www.sciencedirect.com/science/article/pii/S1071581918302337)。

| GEQ 构念 | 模块 | 映射等级 | 相邻项 |
|---|---|---|---|
| Competence | Core | 部分覆盖 | 成长感、掌控感、build 成型 |
| Sensory and Imaginative Immersion | Core | 覆盖/部分覆盖 | 代入感、在场感、真实的世界 |
| Flow | Core | 部分覆盖 | 同步感、操控感；心流是清单外高频词 |
| Tension/Annoyance | Core | 部分覆盖 | 恐怖；annoyance 无直接项 |
| Challenge | Core | 部分覆盖 | 博弈感、顿悟感、成长感 |
| Negative Affect | Core | 部分覆盖 | 恐怖、孤独、匮乏阶段 |
| Positive Affect | Core | 部分覆盖 | 舒适感、成长感、打击/枪感的正反馈；过宽 |
| Psychological Involvement–Empathy | Social Presence | 部分覆盖 | 陪伴感、后果感 |
| Psychological Involvement–Negative Feelings | Social Presence | 无对应/部分覆盖 | 对他者的负面情绪未单列；PvP 博弈只弱相关 |
| Behavioral Involvement | Social Presence | 部分覆盖 | 社交感、陪伴感 |
| Positive Experience | Post-game | 部分覆盖 | 多个正效价候选；过宽 |
| Negative Experience | Post-game | 部分覆盖 | 恐怖、孤独；过宽 |
| Tiredness | Post-game | 无对应 | — |
| Returning to Reality | Post-game | 部分覆盖 | 代入/在场消退后的状态；清单无直接项 |

## PXI 逐项映射

[PXI 官方指南](https://playerexperienceinventory.org/docs)给出十个构念；原始论文说明其专家与玩家验证过程。[论文](https://www.sciencedirect.com/science/article/pii/S1071581919301302)

| PXI 构念 | 组别 | 映射等级 | 相邻项 |
|---|---|---|---|
| Ease of Control | Functional | 覆盖 | 操控感、身体掌控感 |
| Progress Feedback | Functional | 部分覆盖 | 成长感、build 成型、后果感 |
| Audiovisual Appeal | Functional | 部分覆盖 | 枪感、打击感、真实感；它是感官品质而非同一感觉 |
| Clarity of Goals and Rules | Functional | 部分覆盖 | 系统掌控感、宏观感、博弈感 |
| Challenge | Functional | 部分覆盖 | 博弈感、顿悟感、成长感 |
| Mastery | Psychosocial | 覆盖/部分覆盖 | 掌控感、成长感 |
| Curiosity | Psychosocial | 部分覆盖 | 顿悟感、自由感、真实的世界 |
| Immersion | Psychosocial | 覆盖/部分覆盖 | 代入感、在场感 |
| Autonomy | Psychosocial | 覆盖 | 自由感、后果感 |
| Meaning | Psychosocial | 部分覆盖 | 后果感、陪伴感；敬畏/被触动是清单外邻近项 |

## BrainHex 逐项映射

BrainHex 是玩家类型，不是体验量表；七型及 50,000+ 样本由机构页报告。[University of Bolton](https://ub-ir.bolton.ac.uk/esploro/outputs/journalArticle/BrainHex-A-neurobiological-gamer-typology-survey/9911971008841)

| BrainHex 类型 | 映射等级 | 相邻项 |
|---|---|---|
| Seeker | 部分覆盖 | 自由感、真实的世界、顿悟感 |
| Survivor | 覆盖/部分覆盖 | 恐怖、匮乏→稳定 |
| Daredevil | 部分覆盖 | 枪感、打击感、真实感（速度/物理）；兴奋未单列 |
| Mastermind | 覆盖/部分覆盖 | 博弈感、宏观感、顿悟感 |
| Conqueror | 部分覆盖 | 成长感、掌控感、build 成型 |
| Socialiser | 覆盖 | 社交感、陪伴感 |
| Achiever | 部分覆盖 | 成长感、build 成型 |

## Four Keys to Fun 逐项映射

四键清单与含义来自 [Game Developer 对 Lazzaro 模型的介绍](https://www.gamedeveloper.com/design/gamification-user-types-and-the-4-keys-2-fun)。

| Four Key | 映射等级 | 相邻项 |
|---|---|---|
| Hard Fun | 覆盖/部分覆盖 | 博弈感、顿悟感、成长感、掌控感 |
| Easy Fun | 部分覆盖 | 自由感、真实的世界、舒适感 |
| People Fun | 覆盖 | 社交感、陪伴感、读心（竞争侧） |
| Serious Fun | 部分覆盖 | 后果感、陪伴感；意义/改变未在無涘基线单列 |

## GameFlow 逐项映射

八元素来自 Sweetser & Wyeth 的 [GameFlow 模型](https://www.readkong.com/page/gameflow-a-model-for-evaluating-player-enjoyment-in-games-4126799)。

| GameFlow 元素 | 映射等级 | 相邻项 |
|---|---|---|
| Concentration | 部分覆盖 | 代入感、在场感、同步感 |
| Challenge | 部分覆盖 | 博弈感、顿悟感、成长感 |
| Player Skills | 部分覆盖 | 操控感、成长感、掌控感 |
| Control | 覆盖 | 操控感、掌控感、自由感 |
| Clear Goals | 部分覆盖 | 系统掌控感、宏观感；它是条件而非目标感受 |
| Feedback | 部分覆盖 | 枪感、打击感、成长感、后果感；它是条件 |
| Immersion | 覆盖/部分覆盖 | 代入感、在场感 |
| Social Interaction | 覆盖 | 社交感、陪伴感 |

## PENS 逐项映射

理论来源见 [SDT 官方页](https://selfdeterminationtheory.org/player-experience-of-needs-satisfaction-pens/)，五分量表结构见[后续验证](https://www.sciencedirect.com/science/article/abs/pii/S1071581918302337)。

| PENS 分量表 | 映射等级 | 相邻项 |
|---|---|---|
| Competence | 覆盖/部分覆盖 | 成长感、掌控感、build 成型 |
| Autonomy | 覆盖 | 自由感、后果感 |
| Relatedness | 覆盖 | 社交感、陪伴感 |
| Presence/Immersion | 覆盖/部分覆盖 | 在场感、代入感、真实的世界 |
| Intuitive Controls | 覆盖 | 操控感、身体掌控感 |

## Brown & Cairns、Swink 与 cozy 研究

| 体系/构念 | 映射等级 | 相邻项 | 关键边界 |
|---|---|---|---|
| Engagement | 部分覆盖 | 代入感、在场感 | 是进入沉浸的初阶，不等于代入。[来源](https://pmc.ncbi.nlm.nih.gov/articles/PMC6134042/) |
| Engrossment | 部分覆盖 | 代入感、在场感 | 情绪投入与注意吸收加深。 |
| Total Immersion | 覆盖/部分覆盖 | 在场感、代入感 | 极深投入；不是所有“代入”都达到此阶段。 |
| Swink: aesthetic sensation of control | 覆盖 | 操控感、身体掌控感 | 最直接对齐。[来源](https://eolt.org/articles/game-feel/) |
| Swink: learning/practice/mastery pleasure | 覆盖/部分覆盖 | 成长感、掌控感 | 技能掌握与数值成长需区分。 |
| Swink: extension of senses | 部分覆盖 | 枪感、打击感、真实感、同步感 | 感官—工具延伸是多个工艺感受的共同上位。 |
| Swink: extension of identity | 部分覆盖 | 代入感 | 接近但不等于叙事角色认同。 |
| Swink: interaction with unique physical reality | 覆盖/部分覆盖 | 真实感（物理）、枪感、打击感 | 直接支持“感觉来自一套可学习物理”。 |
| Cozy: comfort/safety/softness/tranquility | 覆盖/部分覆盖 | cozy（舒适感）、匮乏→稳定 | cozy 是体验簇，不是单刻度。[研究 1](https://eludamos.org/index.php/eludamos/article/view/7938) [研究 2](https://link.springer.com/article/10.1007/s44538-026-00003-y) |

## 無涘相对 PLEX 的差异化在哪里？

### 先推翻一个过强说法

“PLEX 只负责玩家体验到什么，無涘才负责设计师要做出什么、怎么做出来”这个说法**不能原样成立**。PLEX 作者页明确说卡片面向 designers and researchers，用于 communicating、designing 和 evaluating playful experiences，并列出 PLEX Design Patterns 与专家启发式评估论文。[Aalto 作者页](https://users.aalto.fi/~luceroa1/research/plex/) 因而 PLEX 已经不只是描述性分类，它也主动服务设计构思和评估。

### 证据支持的真实差异

1. **粒度不同：跨情境体验类目 vs 品类工艺目标。** PLEX 用 Sensation、Control、Simulation 等宽类别跨应用场景复用；無涘用枪感、打击感、build 成型、匮乏→稳定等“可拿具体作品来比”的复合靶子。中文设计语料中，打击感与枪感确实是独立高热主题：[打击感](https://www.bilibili.com/video/BV1xG4y1f7ai/) [枪感](https://www.bilibili.com/video/BV1A9kMBqEVL/)。这一工艺粒度是当前最清楚的差异化。
2. **语言入口不同：中文设计者准术语 vs 英文通用分类。** PLEX 的英文类目易跨产品沟通，却不能无损容纳“手感/枪感/爽感/博弈感”的压缩语义；英文资料往往把它们拆成 responsiveness、weight、impact、yomi、agency 等。[中英不对称证据](layer-b-designers.md#中英不对称本次最重要的观察) EGDS 若保留这些本土行话并建立可核验定义，就是实际差异，而不只是改名。
3. **预定的因果位置不同，但尚待实现验证。** 無涘给出的 EGDS 栈是“主观感受 ← 客观原因 ← 设计杠杆”；若每个靶子最终都连接到可观察原因和可操纵杠杆，它会比 PLEX 卡片更强调逐层因果追踪。不过本次只调研了公开语料，**尚未验证** EGDS 已经为每一项建成有效因果链。因此这是有潜力的产品定位，不是已经被证据证明的优势。
4. **取舍面不同。** PLEX 主动容纳 Cruelty、Eroticism、Submission、Subversion、Suffering 等边缘/负面玩乐；無涘基线集中在主要游戏品类的招牌体验，暂未覆盖这些领域。反过来，無涘在战斗、操作和 build 过程上的分辨率高得多。两者是覆盖面与工艺深度的交换，而非谁更完整。
5. **规模本身不是差异。** “不超过 20 个”与 PLEX 的 22 个、QF 的 12 个处于同一数量级，[PLEX](https://users.aalto.fi/~luceroa1/research/plex/) [QF](https://quanticfoundry.com/gamer-motivation-model/)；仅靠较短清单不能构成新颖性。

### 最短回答

無涘相对 PLEX 最可信的差异化，不是“第一次给体验分类”，也不是“第一次把框架给设计师用”，而是：**以中文游戏设计者已经实际使用的、品类特异的复合感觉为靶子，并计划把每个靶子向下连到客观原因和设计杠杆。** 前半句已有公开语料支持；后半句仍是 EGDS 要通过后续拆解案例证明的承诺。PLEX 应作为上位覆盖检查与漏项报警器，而不应被当成需要重造或简单替换的旧轮子。
