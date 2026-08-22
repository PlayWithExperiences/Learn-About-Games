# 「主观感受词汇分层」既有研究与前身方法论

> 调研日期：2026-08-22  
> 范围：词的评价性、抽象层级、情绪分化、感性工学、描述性感官分析、产品情绪/UX 词表，以及游戏体验量表。  
> 结论性质：文献映射，不是 EGDS 命名决策。

## 研究问题与判准

本调研不把“更容易继续往下拆”当成词本身更厚，因为那会把既有分析投入误当作词汇属性。检索时把问题拆成四个可分别核验的变量：

1. **评价—描述的纠缠程度**：词是否同时给出好坏判断与“是哪一种东西”的描述；两者是否可分。
2. **分类抽象层级**：词位于上位／基本／下位哪一级；使用者的专业经验会不会改变默认命名层。
3. **个体分辨率**：同一人能否在真实情境中稳定地区分相近感受。
4. **从词到可操纵参数的经验映射**：词有没有通过样本、参照物、实验和统计连接到原因或设计变量。

这四个变量互不等价。“很强烈”不等于“很具体”，“很典型”不等于“很具体”，“专家常说”也不等于词天然更厚。Appraisal 的 FORCE/FOCUS、Rosch 的分类层级和 emotion granularity 分别测不同对象，不能合并成一根未经验证的轴。[Appraisal 概览](https://www.languageofevaluation.info/appraisal/appraisaloutline/unframed/appraisaloutline.htm) · [Rosch et al. 1976](https://www.cns.nyu.edu/~msl/courses/2223/Readings/Rosch-CogPsych1976.pdf) · [Hoemann et al. 2021](https://pmc.ncbi.nlm.nih.gov/articles/PMC8355493/)

## 方法

### 来源优先级

优先使用原论文/原书出版页、作者或研究机构页面、ISO 与国家标准平台；其次使用同行评审综述；只有在原始材料不可读时才使用出版社摘要或学术书评。每个关键推论尽量由“原方法 + 后续验证/批评”成对支撑。PLEX 22 与 Quantic Foundry 12 只引用既有对照，不重做，见[仓库既有语料](../subjective-feelings-corpus/existing-wheels.md)。

### 代表性查询式

英文：

- `Väyrynen thick concepts semantic pragmatic separability evaluation`
- `Appraisal Graduation FORCE FOCUS gradability category prototypicality`
- `Rosch basic level expertise Tanaka Taylor bird dog experts`
- `emotion granularity experience sampling ICC covariance measurement`
- `Kansei Engineering Kansei words semantic differential Quantification Theory Type I validation criticism`
- `QDA trained panel lexicon reference standards assessor agreement ANOVA`
- `ISO 13299 sensory profile`、`ISO 11132 panel performance`
- `Swink Game Feel metrics input response context polish metaphor rules`
- `GEQ PXI PENS validation factor structure`、`BrainHex validation`、`GameFlow expert review`

中文/日文入口：

- `感性工学 感性词 语义差异法 数量化一类`
- `感官分析 建立感官剖面 国家标准`
- `白酒感官品评 国家标准`、`咖啡 感官词典 中文`
- `日本感性工学会 Kansei Engineering game`
- `主观感受 厚薄轴 游戏设计`、`游戏感 词表 参照样`

### 覆盖状态如何记

- **已查证**：正文中有可访问的直接来源。
- **未查证**：检索到线索，但无法从可访问材料确认所需细节。
- **未查尽**：查询覆盖不足，不能下“不存在”结论。
- **查询失败**：通道或权限明确报错；不能解释成“没有”。
- **零结果**：一次具体查询返回零条；只说明该查询式没找到，不说明对象不存在。

## 查询失败、零结果与未查证清单

| 状态 | 对象/查询 | 实际结果 | 本文处理 |
|---|---|---|---|
| 查询失败 | Exa：`Pekka Väyrynen ... separability ...` | 2026-08-22 返回明确的 `HTTP 429 free MCP rate limit`；同批其他查询仍有结果，故不是全网无材料 | 改由 OUP 章节、SEP 与 Notre Dame 书评核验；README 保留失败记录。[OUP](https://academic.oup.com/book/10479/chapter/158366272) · [SEP](https://plato.stanford.edu/entries/thick-ethical-concepts/) · [NDPR](https://ndpr.nd.edu/reviews/the-lewd-the-rude-and-the-nasty/) |
| 零结果 | 精确短语 `"subjective feeling" "thickness axis" game design` | 本轮网页搜索没有返回该精确组合的结果条目 | 只能说该查询式零结果；不能说游戏研究不存在类似分层。改搜构念名与量表名。 |
| 零结果 | `"厚薄轴" "主观感受" 游戏设计` | 本轮网页搜索没有返回结果条目 | 同上，不作为不存在证据。 |
| 零结果 | `"game feel lexicon" "reference standard" panel` | 本轮网页搜索没有返回精确命中 | 改查 Game Feel 与 sensory lexicon 两条独立文献链；目前未发现二者已形成同一标准。此处结论为**未查尽**。 |
| 未查证 | Stone & Sidel 原始 1974 QDA 论文的全文逐页核对 | 找到后续权威章节对其方法史的说明，但原论文全文未取得 | QDA 流程依 ISO 13299、ISO 11132、Wiley 方法章节与 Stone/Sidel 书系摘要交叉核验；不声称逐字复原 1974 版本。[Wiley](https://onlinelibrary.wiley.com/doi/10.1002/9781118991657.ch8) |
| 未查证 | WSET 中文 SAT 的当前完整受控词表 | 官方确认 SAT 有多语言版本，但公开检索主要取得英文词表和中文课程页，未取得可核对的当前中文 SAT 全文 | 只报告其系统化品鉴与词表传统，不把具体中文译词写成标准术语。[WSET SAT](https://www.wsetglobal.com/knowledge-centre/wset-systematic-approach-to-tasting-sat/) · [WSET 中文站](https://www.wsetglobal.cn/%E8%B5%84%E6%A0%BC%E8%AE%A4%E8%AF%81/%E7%AC%AC%E4%BA%8C%E7%BA%A7%E7%83%88%E9%85%92%E8%AE%A4%E8%AF%81/) |
| 未查尽 | “感性工学能否直接搬到完整电子游戏” | 找到 Pokémon GO、DOTA 2、手势游戏与认知训练游戏应用，但样本不构成全游戏类型/长时动态体验的普遍验证 | 写成“已应用、不可直接无条件搬用”，不写“尚无人做过”。[Pokémon GO](https://link.springer.com/article/10.1007/s42452-019-1763-y) · [DOTA 2](https://ejournal3.undip.ac.id/index.php/ieoj/article/view/20409) · [手势游戏综述](https://pmc.ncbi.nlm.nih.gov/articles/PMC5069401/) |

## 文件导航

- [01-thickness.md](01-thickness.md)：厚/薄概念、separability、Appraisal GRADUATION。
- [02-granularity.md](02-granularity.md)：basic level、专家化、emotion granularity、alexithymia。
- [03-kansei-and-sensory.md](03-kansei-and-sensory.md)：感性工学与描述性感官分析的完整流程、验证和迁移边界。
- [04-games.md](04-games.md)：Game Feel、GEQ、PXI、PENS、BrainHex、GameFlow。
- [MAPPING.md](MAPPING.md)：所有方法对 EGDS 五层与四步的总映射，以及三问答案。

## 阅读本报告时的三个防误用约束

1. 表中的“覆盖”表示某方法有直接对应的研究对象或操作，不表示它赞成 EGDS 的层级本体。
2. 文献给出的量表分数通常测**人、词的用法或一次产品评价**，不能自动转写成词的永久属性。
3. 任何从既有方法到 EGDS 的对应关系均标为“本调研映射/推论”；这不是原作者对 EGDS 的主张。
