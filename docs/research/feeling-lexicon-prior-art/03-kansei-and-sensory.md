# D｜两支最接近 EGDS 的工业前身

## 结论先行

- **感性工学（Kansei Engineering, KE）**已经把“用户感性词评分 → 产品属性/设计要素”做成可重复的工程流程；它是“主观感受 → 设计杠杆”最直接的前身，但其输出通常是限定人群、样本空间与时间的统计关联/预测模型，不是跨游戏的词义本体。[Nagamachi 1995](https://www.researchgate.net/publication/223435879_Kansei_Engineering_A_new_ergonomic_consumer-oriented_technology_for_product_development) · [Schütte et al. 方法综述](https://www.researchgate.net/publication/233349460_Concepts_methods_and_tools_in_Kansei_Engineering)
- **描述性感官分析/QDA**已经把“不给抽象定义、通过共同样本与实物参照校准词义”制度化，并把区分力、一致性、重复性作为评审团性能指标；它是 EGDS 做主体间验证最成熟的前身。[ISO 13299](https://www.iso.org/standard/58042.html) · [ISO 11132](https://www.iso.org/standard/76669.html)
- 两者互补：KE 擅长**词—参数映射**，sensory profiling 擅长**词—样本校准与主体间一致性**。两者都没有天然解决游戏的长时动态、交互策略、玩家技能与历史依赖。

---

# I. 感性工学 Kansei Engineering

## 1. 原始目标与边界

长町三生把 KE 定义为把消费者对产品的 feeling/image 翻译为设计要素的消费者导向技术，并区分 Type I（类别分解）、Type II（专家系统/神经网络/遗传算法等计算技术）与 Type III（数学模型）等类型。[Nagamachi 1995 出版信息与摘要](https://www.researchgate.net/publication/223435879_Kansei_Engineering_A_new_ergonomic_consumer-oriented_technology_for_product_development) 这一定义的关键不是“收集情绪词”，而是同时建立：

1. **Semantic Space**：目标用户如何感受/评价产品；
2. **Space of Product Properties**：产品由哪些可编码属性与属性水平构成；
3. **Synthesis**：两空间之间的经验关系。[Schütte et al.](https://www.researchgate.net/publication/233349460_Concepts_methods_and_tools_in_Kansei_Engineering)

Osgood 的 semantic differential（SD）是常见测量底座：让参与者在成对双极形容词构成的量尺上评价对象，再通过因子分析等方法研究意义空间；经典跨概念维度是 Evaluation、Potency、Activity（EPA）。[Osgood, Suci & Tannenbaum 1957 书目](https://books.google.com/books/about/The_Measurement_of_Meaning.html?id=Qj8GeUrKZdAC) · [语义差异法综述资料](https://files.eric.ed.gov/fulltext/ED039615.pdf)

EPA 不是感性工学的完整输出，更不是目标“厚薄轴”：Evaluation 是好坏，Potency 是强弱/力量，Activity 是动静/活跃；它们可描述感受空间，却不直接表示一个词的适用域有多具体。

## 2. 完整流程

下列步骤综合 Nagamachi 的定义、Schütte 等方法框架、感性工学系统综述及中国设计研究的实际程序；具体项目可以替换统计工具，但不能省掉语义空间、属性空间和验证之间的区别。[Schütte et al.](https://www.researchgate.net/publication/233349460_Concepts_methods_and_tools_in_Kansei_Engineering) · [1995–2020 系统综述](https://www.mdpi.com/1424-8220/21/19/6532) · [中文方法实例](https://xuebaosk.ahut.edu.cn/cn/article/pdf/preview/10.3969/j.issn.1671-9247.2023.04.007.pdf)

### 步骤 1：界定 domain、目标人群与决策

限定产品类型、市场/文化、用户段、使用情境和要做的设计决策。Schütte 等指出，很多研究的 domain 与目标群体仍由厂商经验预先决定，相关方法支持不足；因此这一步本身是主要偏差源。[Schütte et al.](https://www.researchgate.net/publication/233349460_Concepts_methods_and_tools_in_Kansei_Engineering)

### 步骤 2：扩展并收敛 Kansei words（语义空间）

从访谈、开放问卷、评论、杂志/广告、专家和竞品描述中广泛收集感性词；再通过亲和图/KJ、聚类、主成分/因子分析、专家与用户筛选等方式去重和降维。中文研究也常用“访谈/问卷 → KJ/专家论证 → SD/Likert”的组合。[中国导医机器人研究](https://xuebaosk.ahut.edu.cn/cn/article/pdf/preview/10.3969/j.issn.1671-9247.2023.04.007.pdf)

收敛不是在词典里挑“正确词”，而是为给定 domain 建立可测的代表性语义空间；研究综述显示不同项目的关键词数量、量尺与情绪/类别区分做法并不统一。[KE 系统综述](https://www.mdpi.com/1424-8220/21/19/6532)

### 步骤 3：采集并编码代表性产品样本（属性空间）

选择覆盖设计空间的现有产品、原型或组合刺激，把它们分解成可编码的 design elements 与 levels，例如形状、材质、颜色、布局、交互方式。样本必须覆盖足够的组合变化，否则后续模型无法区分变量贡献。KE 方法综述指出，属性空间的选择与有效性检验相对语义空间更缺工具。[Schütte et al.](https://www.researchgate.net/publication/233349460_Concepts_methods_and_tools_in_Kansei_Engineering)

### 步骤 4：实验评价

让目标用户在控制条件下对多个样本逐一评价 Kansei words，常用 5/7 点 SD 或 Likert 强度量尺；设计应随机化呈现、控制顺序效应，并记录参与者背景。SD 的现实限制包括一些感性词找不到自然反义词，强行配对可能改变构念。[2025 KE 包装研究](https://www.tandfonline.com/doi/full/10.1080/23311916.2025.2555340)

### 步骤 5：建立“词 ↔ 设计要素”模型（synthesis）

常见工具包括线性/多元回归、Quantification Theory Type I（QT1）、GLM、PCA/因子分析、PLS、粗糙集、神经网络、遗传算法等。QT1 可把名义类别的设计变量作为预测变量，估计其与 Kansei 评分的关系；方法选型依样本规模、变量类型、非线性与交互而定。[庭园 KE 研究](https://onlinelibrary.wiley.com/doi/10.1155/2011/295074) · [Schütte et al.](https://www.researchgate.net/publication/233349460_Concepts_methods_and_tools_in_Kansei_Engineering) · [属性—语义链接方法](https://ep.liu.se/en/conference-article.aspx?Article_No=89&issue=26&series=)

这里得到的是“在此样本/人群中，哪些属性水平与某 Kansei 评分共同变化或可预测它”，不是自动得到必要充分因果律。Schütte 等明确说这些工具描述的是 Kansei words 与 product properties 如何相关。[Schütte et al.](https://www.researchgate.net/publication/233349460_Concepts_methods_and_tools_in_Kansei_Engineering)

### 步骤 6：生成/选择新方案

把模型中贡献方向较强的属性水平组合为新概念或用于筛选备选方案；若使用正交设计/联合分析等，应确保新组合在技术与语义上可实现。此步把统计模型转成设计决策，但组合变量之间可能产生训练数据未覆盖的交互。

### 步骤 7：验证与迭代

至少需要两种验证：

- **模型内/留出验证**：预测误差、交叉验证、解释度、稳健性、变量共线性/交互检查；
- **新原型外部验证**：让新的目标用户评价按模型生成的原型，比较目标 Kansei 是否真的提升，并检查副作用。

Schütte 等提出可用合成前后因子结构比较来回馈语义空间，同时明确指出属性空间的有效性与模型有效范围仍难确定。[Schütte et al.](https://www.researchgate.net/publication/233349460_Concepts_methods_and_tools_in_Kansei_Engineering) 近期服务设计论文继续把“采集到的 Kansei 是否有效、方案是否稳健”列为批评点，尤其当用户需要和服务场景动态变化时。[Kansei service design 2023](https://www.tandfonline.com/doi/full/10.1080/1463922X.2023.2261995)

## 3. 验证方式与常见失败

| 风险 | 为什么会失败 | 可辨认的验证 |
|---|---|---|
| 词由研究者预设 | 语义空间不代表用户真实用语 | 开放语料与用户词先行；报告删除/合并路径；对新用户复核 |
| 产品样本过少、属性过多 | QT1/回归不可识别或过拟合 | 预先做样本量/变量审计；留出样本；报告不稳定系数 |
| 多重共线性与属性交互 | 贡献被错误归因 | VIF/相关、交互项、分组模型或适当非线性模型；庭园研究明确列出这两项限制。[来源](https://onlinelibrary.wiley.com/doi/10.1155/2011/295074) |
| SD 强迫反义 | 两端不是同一连续构念 | 允许单极强度量尺或先验证双极性。[来源](https://www.tandfonline.com/doi/full/10.1080/23311916.2025.2555340) |
| 相关被写成因果 | 共同变化可能来自遗漏变量 | 操纵单一设计变量的 A/B 原型与预注册假设 |
| 模型只对当前文化/时代有效 | Kansei 与产品语义会变 | 分层抽样、跨文化测量等值、时间复测；明确有效域 |
| 新组合超出样本空间 | 模型外推失真 | 新原型盲测，不以“模型有输出”当验证 |

## 4. 感性工学流程 → EGDS 五层映射

> 下表为本调研映射，不是 KE 原作者使用 EGDS 术语。

| KE 流程步骤 | 情绪曲线 | 情绪体验 | 主观感受 | 客观原因 | 设计杠杆 |
|---|---|---|---|---|---|
| domain/用户/情境界定 | 部分：可限定旅程时段 | 部分：限定目标体验 | 部分：限定语境 | 部分：限定候选系统 | 部分：限定可改范围 |
| 收集/收敛 Kansei words | 无 | 部分：有些词是离散情绪 | **覆盖：核心语义空间** | 无 | 无 |
| 产品样本与属性分解 | 无 | 无 | 无 | **覆盖：可观察属性/状态** | **覆盖：可编码属性水平** |
| 用户对样本做 SD/Likert 评价 | 部分：若逐时点采样 | 部分 | **覆盖：量化评分** | 部分：刺激已知 | 部分：样本参数已知 |
| QT1/回归/粗糙集等 synthesis | 无/部分 | 部分 | **覆盖：因变量** | **覆盖：统计解释变量** | **覆盖：属性贡献/规则** |
| 新方案与外部验证 | 部分：若做动态测试 | 部分 | **覆盖：是否达到目标感受** | **覆盖：模型能否复现** | **覆盖：操纵方案** |

KE 最强地覆盖 EGDS 右侧三层；传统静态产品研究往往弱覆盖情绪曲线与长时情绪体验。

## 5. 能否直接搬到游戏？

**不能原样直接搬，但不是“尚无人尝试”。** 已有研究把 KE 用于 Pokémon GO 交互模型，使用 Evaluation Grid Method 与 QT1；DOTA 2 研究收集 game-specific Kansei words 并聚类；手势游戏研究也把 KE 放进问卷、行为观察、think-aloud、试玩和分析流程。[Pokémon GO](https://link.springer.com/article/10.1007/s42452-019-1763-y) · [DOTA 2](https://ejournal3.undip.ac.id/index.php/ieoj/article/view/20409) · [手势游戏综述](https://pmc.ncbi.nlm.nih.gov/articles/PMC5069401/)

游戏迁移必须增加的最小结构：

1. **刺激单位从产品图变成可复现 play slice**：固定关卡、武器、角色配置、帧率/延迟、输入设备与玩家任务。
2. **属性必须含时序与交互**：输入延迟、动作窗口、反馈同步、敌人反应、相机、音画、数值与规则；不能只截静态画面。
3. **把玩家技能/策略/历史作为条件变量**：同一杠杆对新手和专家可能方向不同。
4. **先做单变量最小原型**：一次验证一个“杠杆是否改变目标感受”的假设，再扩展交互；避免完整游戏同时变十项导致不可归因。
5. **做跨作品外部验证**：在一把枪上预测到“枪感”不等于得到整个 FPS 类型的词义模型。

---

# II. 描述性感官分析 / QDA 与词表—风味轮传统

## 1. 它解决的核心问题

描述性感官分析把一组经筛选和训练的人当作测量仪器：评审团使用共同属性词与强度尺度描述样品，而不是投票“喜不喜欢”。ISO 13299 给出建立 sensory profile 的总体流程，适用于视觉、嗅觉、味觉、触觉与听觉可评价的产品；QDA 的标志性做法包括由评审团生成描述词、用线性量尺记录个体数据、重复评价并用 ANOVA 分析。[ISO 13299:2016](https://www.iso.org/standard/58042.html) · [QDA 方法章节](https://onlinelibrary.wiley.com/doi/10.1002/9781118991657.ch8)

它不是用“客观仪器取代主观”；而是把主体训练、参照、重复测量和主体间偏差都显式纳入方法。

## 2. 完整流程

### 步骤 1：定义产品空间、目的与取样

明确要区分哪些产品/版本、服务哪个决策，并选取足以暴露差异的样品。ISO 13299 列出的用途包括定义产品/生产标准、比较产品、开发/修改产品与货架期研究。[ISO 13299](https://www.iso.org/standard/58042.html)

### 步骤 2：招募、筛选和训练评审员

筛选感官能力、可用性、动机与量尺使用能力；训练评审员在统一环境、制样与顺序控制下识别差异、复现评分。QDA 资料常见 8–15 人左右的筛选/训练小组，但人数是方法传统的经验范围，不是所有项目的硬标准。[Wiley 感官分析书摘](https://catalogimages.wiley.com/images/db/pdf/9780470671399.excerpt.pdf)

### 步骤 3：让小组从样品中生成词汇

评审员实际观察/闻/尝/触/听覆盖产品空间的样品，提出能描述差异的词；小组在主持下合并同义、拆开混义、删除评价性/模糊词，形成共同属性清单。QDA 的要点是 panel-generated language，而非只把研究者词表交给评审员。[QDA 方法章节](https://onlinelibrary.wiley.com/doi/10.1002/9781118991657.ch8)

### 步骤 4：为每个词建立定义、评价程序与 reference standard

每个条目至少包含：

- 名称与非循环描述；
- 在什么感觉通道、何时、怎样评价；
- 一个或多个可重复取得的参照样/配方；
- 参照在强度量尺上的锚点与制备/呈现方法。

“参照标准”并不一定是目标产品本身。它可以是具有较纯感官特征的化合物、食品或配方；啤酒术语系统研究为各标准选择供应来源与纯化方法以获得可接受的感官纯度。[Meilgaard et al. Reference Standards](https://www.tandfonline.com/doi/abs/10.1094/ASBCJ-40-0119) WCR 咖啡词典为 110 个风味、香气与质构属性提供强度参照，2.0 又补充更全球可得的 24 项参照。[WCR 官方介绍](https://worldcoffeeresearch.org/read-more/news/174-world-coffee-research-sensory-lexicon)

因此，“不给定义、给样本”更准确的说法是：**不只给抽象定义，还给可制备参照样和强度锚点**。工业方法通常两者都要。

### 步骤 5：校准量尺与共同语言

评审员反复评价参照与训练样品，讨论“是否在测同一个属性”和尺度端点如何使用，直到能稳定区分、排序并复现。训练不要求每个人给完全相同的数值；它要求差异方向、相对强度和量尺使用达到可监控水平。

### 步骤 6：盲化、随机化、重复评价正式样品

在受控环境中以编码样品、平衡/随机顺序、重复批次采集每位评审员的每个属性强度。保留个体数据很关键，因为一致性不能从小组均值 alone 判断。[QDA 方法章节](https://onlinelibrary.wiley.com/doi/10.1002/9781118991657.ch8)

### 步骤 7：统计产品差异与评审团性能

ISO 11132 把定量描述小组性能分为三项：

- **discrimination**：能否在产品间检出该属性差异；
- **agreement**：个体的产品评分模式是否与小组对齐、评审员间是否一致；
- **repeatability**：同一评审员/小组对同一样品重复评分是否稳定。[ISO 11132:2021](https://www.iso.org/standard/76669.html)

常见统计实现包括产品、评审员及 product × assessor 的 ANOVA；产品效应检验区分力，显著交互提示评审员对产品排序/量尺使用不一致，误差均方/重复评分变异用于重复性。相关/回归斜率与截距、RV/RV2 系数、Tucker-1 图等可作补充，但单一指标不应独自决定淘汰评审员。[ISO 11132 预览信息](https://standards.iteh.ai/catalog/standards/iso/26f329e7-ab5d-4eca-823d-bb485361a8d0/iso-11132-2021) · [性能指标论文](https://www.sciencedirect.com/science/article/pii/S0950329312001267) · [评审团性能综述](https://www.mdpi.com/2076-3417/11/24/11977)

### 步骤 8：形成 profile、词典或层级轮，并持续维护

把显著属性及强度组成产品剖面；为沟通可把词按 general → specific 排成层级轮，但层级通常表示语义分类，不表示强度或质量。WCR 词典基于 105 个 Arabica 样品开发，官方明确称它是 living document、价值中立，未覆盖所有咖啡，也仍可扩展参照。[WCR Lexicon 2.0](https://worldcoffeeresearch.org/es/download/bf904452-fc8c-488f-b591-c0b20d9bcab2)

## 3. general → specific 到底如何分级

风味轮常以 2–3 级径向层级组织：从 broad families（如 fruity）进入子类（berry），再到具体描述词（blackberry）。最近的 coffee wheel 方法论文明确描述了三层 radial hierarchy，层级依据“description level”，而不是评价好坏或感受强度。[Coffea canephora 风味轮研究](https://pmc.ncbi.nlm.nih.gov/articles/PMC12075734/)

这与無涘的现象高度相邻：general → specific 是一根可读的“宽—窄”结构。但它有三个限定：

1. 它建立在一个**共同感官模态与产品 domain**内；“fruity → berry → blackberry”比“好玩 → 爽 → 打击感”更接近严格 taxonomy。
2. 层级由词义和样本共现/相似性组织，不是通过“离设计参数几步”决定。
3. 同一个具体词还要另有强度量尺；树的半径不等于评分大小。

## 4. 描述性感官分析流程 → EGDS 五层映射

> 下表为本调研映射。

| sensory/QDA 流程步骤 | 情绪曲线 | 情绪体验 | 主观感受 | 客观原因 | 设计杠杆 |
|---|---|---|---|---|---|
| 定义产品空间/取样 | 部分：若样品是过程切片 | 无/部分 | 部分：限定报告域 | **覆盖：样品事实** | 部分：样品版本可操纵 |
| 评审员筛选训练 | 无 | 部分：训练识别 | **覆盖：命名/区分能力** | 无 | 无 |
| 从样品生成共同词表 | 无 | 部分 | **覆盖：核心** | 部分：词受可观察样品约束 | 无 |
| 定义 + reference standard + 强度锚点 | 无 | 部分 | **覆盖：词—样本校准** | **覆盖：可复现实物参照** | 部分：参照配方可操纵 |
| 盲化、重复强度评价 | 若连续取样则覆盖 | 部分 | **覆盖：强度剖面** | 部分 | 部分 |
| discrimination/agreement/repeatability 统计 | 部分 | 部分 | **覆盖：主体间/主体内验证** | 无 | 无 |
| 产品剖面/层级轮 | 部分：多个时点可成曲线 | 部分 | **覆盖：general→specific 词表** | 部分：产品差异可关联 | 无/部分 |

## 5. 失败与批评

| 风险 | 后果 | 对 EGDS 的防线 |
|---|---|---|
| 参照物地域不可得 | 词无法跨地区复现 | 使用配方、多个替代参照与采购版本；WCR 2.0 专门增加更全球可得参照。[WCR](https://worldcoffeeresearch.org/read-more/news/174-world-coffee-research-sensory-lexicon) |
| 训练把差异“训练没了” | 小组共识可能反映实验室文化，而非一般玩家语言 | 专家/玩家小组分开；另设未训练玩家外部验证 |
| 小组均值掩盖交互 | 平均剖面看似稳定，个体其实反向排序 | 必查 product × assessor、个体相关、重复性；不只看均值。[ISO 11132](https://www.iso.org/standard/76669.html) |
| 层级轮被当成因果图 | general→specific 只表达分类，不说明为什么产生 | 与 EGDS 的原因/杠杆边分开存 |
| 描述与喜好混合 | “好喝/高级”污染价值中立属性 | 分离 descriptive 与 affective assessment；SCA 当前 CVA 也明确分成描述性、情感性与外在评估。[SCA CVA](https://sca.coffee/value-assessment/) |
| 静态终点评价 | 漏掉游戏过程中转折、适应和技能学习 | 对标准化 play slice 做事件标记/多时点采样，而不是只在结束后打一次分 |

## 6. 风味轮/行业词表的三个实例

### SCA/WCR Coffee Taster's Flavor Wheel

WCR 感官词典识别 110 个咖啡风味、香气与质构属性并给强度参照；SCA/WCR 用它更新咖啡风味轮。官方提供英文词典及日文、中文介绍入口；词典明确是 value-neutral，而 SCA 当前 Coffee Value Assessment 另把 descriptive 与 affective assessment 分开。[WCR 官方页](https://worldcoffeeresearch.org/read-more/news/174-world-coffee-research-sensory-lexicon) · [SCA CVA（含简体中文表单）](https://sca.coffee/value-assessment/)

### Beer Flavor Wheel / Meilgaard

Meilgaard 的 beer flavor terminology system 不止画轮：后续工作为术语建立 reference standards，并控制供应来源与感官纯度；ASBC 当前仍把 Beer Flavor Wheel 描述为评酒者、酿酒师、研究者和营销人员的共同词汇。[参照标准论文](https://www.tandfonline.com/doi/abs/10.1094/ASBCJ-40-0119) · [ASBC 官方商店说明](https://my.asbcnet.org/ASBCStore/ASBCStore/Store-Category.aspx?Category=TASTING&WebsiteKey=c6851855-80ea-47cf-9f71-647744bd0529)

### WSET 与中文行业标准

WSET 的 Systematic Approach to Tasting 以资格等级逐步训练系统化描述，并提供 wine/spirits/sake/beer 的 SAT 与多语言版本；本轮未取得当前中文 SAT 完整公开词表，因此不逐项复述译词。[WSET SAT 官方页](https://www.wsetglobal.com/knowledge-centre/wset-systematic-approach-to-tasting-sat/) 中国标准体系已有等同采用 ISO 13299:2016 的《感官分析 方法学 建立感官剖面的导则》国家标准项目，另有 GB/T 33404-2016《白酒感官品评导则》；这证明中文行业语境不只存在民间“轮”，也有正式的剖面/品评方法标准。[全国标准信息公共服务平台：感官剖面](https://std.samr.gov.cn/gb/search/gbDetailed?id=7723527539FAEAB5E05397BE0A0A2EBC) · [GB/T 33404-2016](https://openstd.samr.gov.cn/bzgk/std/newGbInfo?hcno=100DFB31FE8F4D16E42F402039E1EEBC)

---

# III. 相邻方法：Osgood、PrEmo 与 UX 词卡

## Osgood semantic differential（1957）

流程是“概念/对象 × 多组双极形容词量尺 → 数值评价 → 因子/距离结构”，经典 EPA 三因子提供跨词的低维坐标。[The Measurement of Meaning](https://books.google.com/books/about/The_Measurement_of_Meaning.html?id=Qj8GeUrKZdAC) 它能给每个样本在好坏、强弱、活跃度上的位置，但不能判断“打击感”比“好玩”更具体；它更适合作为 KE 的评价界面或 EGDS 的附加维度。

## Desmet PrEmo / product emotion

PrEmo 是产品诱发情绪的非语言自陈工具，以动画人物表达 14 个离散情绪；当前版本将其分在 general well-being、expectation-based、social context、material context 四个 domain。它为不易言说或跨语言场景绕开部分词汇障碍，但测的是产品诱发的情绪类别/强度，不把感受映射到设计参数，也不提供厚薄层级。[Delft 官方 PrEmo 页](https://diopd.org/premo/) · [Desmet 方法章节](https://diopd.org/wp-content/uploads/2002/05/Desmet-2018-Measuring-Emotion-author-version.pdf)

## Microsoft Desirability Toolkit / Product Reaction Cards

Benedek 与 Miner 的方法给用户 118 个正、负或中性描述词，使用后选出符合体验的词，再收敛到 top five 并解释原因；结果可按选择频次汇总，但主要价值是引出定性说明。[Microsoft 方法的出版物综述](https://www.sciencedirect.com/topics/computer-science/product-reaction-card) 该词卡比开放访谈更容易帮助 ①→② 命名，却没有参照样、评审员训练或 psychometric scale 的严格验证；方法评论也明确称其比心理测量量表更不正式，且 118 个词与“desirability”构念的关系并未被逐项证明。[MeasuringU 方法评述](https://measuringu.com/microsoft-desirability/)

## 四种方法如何组合而不混义

| 方法 | 最合适的任务 | 不该被误用成 |
|---|---|---|
| Semantic Differential | 给既定词/维度做强度坐标 | 词的具体性尺度 |
| PrEmo | 降低纯文字自陈门槛、测离散产品情绪 | 客观原因/杠杆模型 |
| Product Reaction Cards | 帮参与者选词并引出解释 | 经校准的共同词典 |
| QDA/reference standards | 用样本训练稳定辨别与主体间复现 | 玩家偏好排名 |
| Kansei Engineering | 估计词评分与设计属性的关系 | 跨品类必要充分词义定义 |

对 EGDS 最接近的组合不是择一，而是：词卡/开放访谈扩展词 → QDA 式样本参照与一致性校准 → KE 式受控变量建模 → 新 play slice 外部验证。每一步解决不同假设，失败时也能知道是“词不稳定”“样本不可区分”还是“杠杆不产生目标感受”。
