# E｜游戏研究如何处理“总体评价 vs 具体体验”

## 总览

游戏研究没有一套共同的“词厚度量表”。现有方法大致用四种方式绕开问题：

1. **把总体评价与具体构件并列成不同分量表**（GEQ）；
2. **预先规定近因/远因层级**（PXI 的 functional vs psychosocial consequences）；
3. **把需要满足、在场与控制混合为理论分量表**（PENS）；
4. **把“好不好玩”拆成设计启发式/可测系统量**（GameFlow、Game Feel），而不是给词本身排厚薄。

BrainHex 主要分玩家偏好类型，不是一次游玩的体验词分层；PLEX 与 Quantic Foundry 已在[既有语料](../subjective-feelings-corpus/existing-wheels.md)逐项处理，本文件只保留它们在总映射中的边界。

## 1. Swink《Game Feel》：从复合感觉向可测构件拆，但没有验证“词厚度”

Swink 将 game feel 的核心定义围绕实时控制虚拟对象、模拟空间与 polish 展开，并用 input、response、context、polish、metaphor、rules 六个方面比较/度量游戏感；其中 input/response 可产生延迟、采样频率、映射、灵敏度等较硬指标，metaphor/polish 等更偏 soft metrics。[书目与目录](https://libcatalog.neit.edu/bib/41497) · [Mechanics and Metrics 摘录](https://dtc-wsuv.org/wp/dtc338-engines/files/2017/01/Mechanics-and-Metrics-of-Game-Feel-Steve-Swink.pdf) · [Principles 章节摘要](https://www.taylorfrancis.com/chapters/mono/10.1201/9781482267334-25/principles-game-feel-steve-swink)

这对 EGDS 很接近：`game feel（主观复合靶） ← input/response/context/...（可观察原因与可调杠杆）`。但局限也清楚：

- 六方面是设计分析 taxonomy，不是经大样本心理测量验证的潜变量结构；
- hard metric 只能测输入/响应等局部，不能独自证明整体“好 feel”；
- metaphor、polish 与 context 会交互，不能把六项贡献简单相加；
- 书中案例和原则用于比较与设计诊断，不提供一个跨品类、主体间校准的 game-feel reference-standard panel。

因此 Swink 证明“厚感受词可以被操作化地拆”，但没有提供“好玩—爽—打击感—枪感”的通用分级刻度。

## 2. GEQ：总体效价项与具体体验项并列，边界会重叠

GEQ Core Module 有七个 component：Competence、Sensory and Imaginative Immersion、Flow、Tension/Annoyance、Challenge、Negative Affect、Positive Affect；另有 social presence 与 post-game 模块。[TU/e GEQ 原量表](https://pure.tue.nl/ws/portalfiles/portal/21666907/Game_Experience_Questionnaire_English.pdf)

它确实同时容纳：

- **较薄/总体效价**：Positive Affect、Negative Affect；
- **较具体体验**：Competence、Challenge、Flow、Immersion、Tension/Annoyance。

但它没有把这两类排在一根轴上；七个分量表是并列维度，而且项目间可能共享效价/唤醒。后续验证并未稳定支持原七因子结构：一项 N=633 的系统综述/验证报告没有找到原结构证据；另一项 N=571 的因子分析只部分支持 GEQ 并提出修订五因子结构。[Law, Brühlmann & Mekler](https://www.researchgate.net/publication/327098420_Systematic_Review_and_Validation_of_the_Game_Experience_Questionnaire_GEQ_-_Implications_for_Citation_and_Reporting_Practice) · [Johnson, Gardner & Perry 2018](https://www.sciencedirect.com/science/article/pii/S1071581918302337)

对 EGDS 的启示是：总体评价项可以做 outcome/guardrail，具体体验项做诊断维度，但不能因为量表把它们并列就声称构念边界已解决。

## 3. PXI：最明确的“近设计—远设计”两层，但仍不是词厚度

PXI 用 Means–End 理论把 10 个构念预分为：

- **Functional consequences（直接、即时）**：Ease of Control、Progress Feedback、Audiovisual Appeal、Clarity of Goals and Rules、Challenge；
- **Psychosocial consequences（二阶情绪体验）**：Mastery、Curiosity、Immersion、Autonomy、Meaning。[PXI 理论模型](https://playerexperienceinventory.org/instrument)

开发过程含 64 名游戏用户研究专家和 529 名玩家、七项研究，并报告收敛/区分效度与 configural invariance 证据；正式量表每构念 3 项。[PXI 官方开发与验证说明](https://playerexperienceinventory.org/instrument) · [用户指南](https://playerexperienceinventory.org/docs)

PXI 是本组里最接近 EGDS 因果栈的量表，因为它明确表达“设计选择 → immediate functional consequence → second-order psychosocial consequence”。但它解决的是**结果离设计选择的理论阶次**，正是無涘已经识别为不能拿来定义词性质的判据：一个词被放在哪一层是 PXI 模型的构念选择，不是通过词汇厚薄测出来的。其 functional 项也混合可用性/反馈条件与主观 appreciation，不能直接等同 EGDS 的“客观原因”。

## 4. PENS：理论需要与体验/控制分量表的混合

PENS 以 Self-Determination Theory 的 competence、autonomy、relatedness 为核心，并加入 presence/immersion 与 intuitive controls 五个分量表。[SDT 官方 PENS 页](https://selfdeterminationtheory.org/player-experience-of-needs-satisfaction-pens/) 它区分了较上层心理需要满足与较接近交互的控制体验，但没有称其为厚薄层。

后续 N=571 验证认为理论结构大体获支持，但建议把 competence 与 intuitive controls 合并，并移除若干题项；这提醒 EGDS：玩家很可能把“我会玩/我能控制”与“控制本身直觉”混在一起，理论上分层不保证经验上可分。[Johnson et al. 2018](https://www.sciencedirect.com/science/article/pii/S1071581918302337)

## 5. BrainHex：把偏好压成类型，不处理一次体验词的厚薄

BrainHex 提出 Seeker、Survivor、Daredevil、Mastermind、Conqueror、Socialiser、Achiever 七种 archetype，并在 50,000+ 自选参与者调查中报告人口/心理取向关系；原论文也称其为假设性、用于推动后续更稳健模型的 interim model。[原论文摘要与讨论](https://www.sciencedirect.com/science/article/abs/pii/S1875952113000086)

后续研究对七型效度提出明显限制：再分析只支持三个较稳定方向，综述还指出原量表未获充分验证，不能可靠用于偏好分类。[后续效度讨论](https://link.springer.com/article/10.1007/s11257-022-09328-9) 所以 BrainHex 适合做玩家差异/抽样警报，不适合拿来给“爽/枪感”排序；类型名是动机/偏好归纳，不是主观感受的 general→specific 词表。

## 6. GameFlow：把 enjoyment 拆成启发式条件，而非体验词层级

Sweetser 与 Wyeth 以 flow 和既有游戏可用性/体验启发式综合出八元素：Concentration、Challenge、Player Skills、Control、Clear Goals、Feedback、Immersion、Social Interaction，并用专家评审比较两款 RTS 做初始 utility/validity 检查。[GameFlow 原文](https://www.valuesatplay.org/wp-content/uploads/2007/09/sweetser.pdf)

这里同时出现：

- 条件/设计要求（clear goals、feedback）；
- 玩家能力/关系（player skills、social interaction）；
- 主观体验（concentration、control、immersion）；
- 总目标（enjoyment/flow）。

它通过一套有方向的启发式结构处理“厚薄”，但不是把这些词视为同一层内的等级，也不是受训玩家词表。初始验证只是两款 RTS 的专家评审，不能承担跨品类心理量表的证据强度。[原文方法](https://www.valuesatplay.org/wp-content/uploads/2007/09/sweetser.pdf)

## 7. PLEX 与 Quantic Foundry：只引用既有结论

PLEX 的 22 类是跨场景的 playful experience categories，可用于沟通、设计、评价与设计模式；它比“枪感/打击感”宽，但没有把 22 类按厚薄排序。[PLEX 作者页](https://users.aalto.fi/~luceroa1/research/plex/) Quantic Foundry 12 是从调查/因子分析得到的玩家动机模型，回答 why people play，不等同游玩时产生了哪一种感觉。[QF 官方模型](https://quanticfoundry.com/gamer-motivation-model/) 逐项与無涘语料的对照不在这里重复，见[existing-wheels.md](../subjective-feelings-corpus/existing-wheels.md)。

## 8. 游戏框架横向比较

| 框架 | 总体评价项 | 具体体验项 | 原因/条件项 | 明示层级 | 是否给词厚度分数 |
|---|---|---|---|---|---|
| Game Feel | “good feel”作为目标，非量表分项 | aesthetic sensation/control 等 | input/response/context/polish/metaphor/rules | 分析组成 | 否 |
| GEQ | Positive/Negative Affect | competence、flow、immersion、challenge 等 | 很少直接测设计参数 | 并列分量表 | 否 |
| PXI | 无单一“好玩”总分为核心 | mastery、curiosity、immersion、autonomy、meaning | functional consequences | **功能→心理社会两层** | 否 |
| PENS | 无单一总评价 | need satisfaction、presence | intuitive controls 较近因 | 理论分量表 | 否 |
| BrainHex | 无 | 偏好/动机 archetype | 无设计因果层 | 玩家类型 | 否 |
| GameFlow | enjoyment/flow 是总目标 | concentration/control/immersion | goals/feedback/skills/social interaction | 启发式条件结构 | 否 |
| PLEX | 无单一效价总分 | 22 个宽体验类别 | 设计模式另行连接 | 分类，不排序 | 否 |
| QF | 无一次体验总评 | 12 个动机 | 人口/偏好因素 | 因子结构 | 否 |

## 9. 对 EGDS 的最小可验证借法

1. 用 PXI 的做法明确记录“直接功能后果”和“二阶心理体验”，但不要把层数命名为词厚度。
2. 用 GEQ 的教训检查总体效价项是否与具体项因子重叠；不要只凭表面命名宣称区分成功。
3. 用 Swink 六方面生成候选杠杆，再以单变量 play slice 实验验证，而不是把 taxonomy 当因果证据。
4. 用 QDA 式共同词表/参照样解决主体间复现；这正是上述游戏框架普遍没有内建的环节。
5. 用 emotion granularity 的重复经验取样检查词是否真的形成不同时间序列，而不是一套同涨同跌的近义词。
