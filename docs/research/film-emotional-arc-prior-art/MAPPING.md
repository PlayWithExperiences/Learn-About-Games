# 影视既有体系 × EGDS 五层映射

更新于 2026-08-22 · 记录者 Codex

标记含义：**覆盖**＝该体系明确产出该层的对象；**部分**＝能间接触及，但变量或粒度不完整；**无**＝体系本身不处理该层。映射是对已有体系的描述，不是替無涘命名或选择 EGDS 节点。

## 映射矩阵

| 影视侧体系 | 情绪曲线 | 情绪体验／转折点 | 主观感受 | 客观原因 | 设计杠杆 |
| --- | --- | --- | --- | --- | --- |
| McKee value charge／scene turn／sequence／act | 部分 | 覆盖（价值状态翻转） | 部分（角色价值，不是观众自报） | 部分（冲突行动是原因框架） | 无（不规定镜头、声音等实现） |
| Syd Field 三幕／plot points | 部分 | 覆盖（叙事方向改变） | 无 | 部分（事件与目标） | 无 |
| Save the Cat 15 beats | 部分（位置模板） | 覆盖（功能节点） | 无 | 部分 | 无 |
| Freytag 金字塔 | 覆盖（宏观升降结构） | 部分（climax／catastrophe） | 无 | 部分 | 无 |
| 起承转结 | 部分 | 覆盖（转的结构功能） | 无 | 部分 | 无 |
| 序破急／能剧组织 | 部分 | 部分（段落／速度／势的变化） | 无 | 部分 | 部分（表演与曲目组织，但非现代镜头词表） |
| Vonnegut／Reagan 六弧 | 覆盖（文本 valence 形状） | 无（没有事件定义） | 无（不是观众测量） | 无 | 无 |
| 连续性剪辑／180 度／match on action | 无 | 部分（切点可改变感知连续性） | 部分（注意与理解） | 覆盖（空间、时间、动作因果） | 覆盖（镜头与剪辑规则） |
| Murch Rule of Six | 部分（情绪是剪辑目标） | 部分（cut 的情绪时机） | 部分 | 部分 | 覆盖（六项剪辑优先级） |
| Cohen congruence-associationist model | 无 | 部分（声音／画面整合的时刻） | 覆盖（意义与吸收） | 覆盖（声音、画面、语言线索） | 覆盖（音乐、音效、对话的协同／反差） |
| Program Analyzer／dial testing | 覆盖（按钮／旋钮随时间） | 部分（峰谷是测量标记，不是价值定义） | 部分（like／dislike 或连续评价） | 无（需另做内容标注） | 无（只能为修改提供证据） |
| Preview screening／focus group | 无或部分 | 部分（观众指出场景问题） | 覆盖（事后自述） | 部分（反馈涉及场景但常需研究者编码） | 部分（可指导重剪／补拍） |
| CinemaScore | 无 | 无 | 部分（总体 appeal／grade） | 无 | 无 |
| Nielsen 时序收视 | 无 | 无 | 无 | 部分（观看／流失行为） | 无（只能间接提示节奏或内容问题） |
| LIRIS-ACCEDE／MediaEval | 覆盖（valence/arousal 片段或连续预测） | 部分（峰谷可检测但需规则） | 部分（观众影响标签） | 部分（影片特征可作为预测输入，不等于因果） | 部分（用于比较版本／训练模型） |
| EEG／GSR／面部／心率 | 覆盖（生理时间序列） | 部分（事件边界需另定义） | 部分（自评可补足） | 无或部分（波形不是原因） | 部分（A/B 实验可比较制作变量） |
| Mateas–Stern Façade drama manager | 覆盖（desired tension arc） | 覆盖（beat 选择与状态推进） | 部分（角色／玩家状态模型） | 覆盖（玩家行动、story memory、beat 条件） | 覆盖（可选 beat／行为／对话） |

## 四个核心回答

### (1) 影视侧比游戏侧成熟在哪里？六弧能否直接借用？

影视／叙事研究在“跨整部作品的曲线形状描述”和“可重复的内容分析方法”上更成熟：Reagan 等人用 1,327 本小说、10,000 词滑窗、Hedonometer、SVD 与三种聚类交叉得到 rise、fall、fall–rise、rise–fall、rise–fall–rise、fall–rise–fall 六类描述性形状。[论文](https://doi.org/10.1140/epjds/s13688-016-0093-1)

但这不是“影视工业已经采用六弧”。电影脚本／字幕复现存在噪声，字幕缺少非对白信息；MediaEval 更接近观众的 valence/arousal 预测，但仍是任务与数据集，不是剧作标准。[电影 sentiment arc 研究](https://pure.rug.nl/ws/portalfiles/portal/240056984/Annotation_and_Prediction_of_Movie_Sentiment_Arcs_final_abstract_.pdf)

因此六弧可以直接借用为 EGDS 的**描述性形状标签**，不能直接借用为转折点定义、情绪词表或制作处方。最小借用方式是保留形状名、时间归一化和曲线比较，同时另存 scene/sequence 的事件与观众测量。

### (2) 最准确的既有“转折点”定义是什么？McKee value charge 是否就是它？

若问题是“一个叙事单位内部何时发生了可辨认的状态翻转”，最精确、最接近 EGDS 的既有定义是 McKee 的 scene：连续时间／空间中的冲突行动使至少一个价值状态发生有意义的正负翻转。[McKee 官方原文](https://mckeestory.com/do-your-scenes-turn/)

但 **value charge 不是 EGDS 情绪体验的同义词**。它是角色／叙事价值的结构变量；EGDS 还要记录观众的主观感受、客观原因和设计杠杆。Field 的 plot point 是更宏观的“行动转向”，Snyder beat 是功能位置，dial 峰值是观众反应标记：它们都可叫 turning point，语义却不同。

### (3) Chen 的章节级单位叫什么？剥离成时刻级后丢失什么？

在影视理论里最稳妥的现成名称是 **sequence**（一组围绕统一短目标／子任务的场景）；若它承担一集或一章的独立闭合，也可称 episode／chapter-level segment。Chen 的 GDC 页面确认 emotional arc 设计目标，公开二手材料确认按 level/section 绘制 intensity graph，但本轮未取得足以逐项核对的完整讲稿，因此不宣称 Chen 原词就是 sequence。[GDC](https://www.gdcvault.com/play/1017700/Designing)、[图表二手材料](https://eprints.hud.ac.uk/id/eprint/32614/1/FINAL_THESIS-%20GOOSEY.pdf)

把章节级单位剥离成时刻级转折点，丢失的是：局部体验如何被铺垫、反复、对比、回收；一个中程目标如何改变；情绪强度与情绪价向如何在多个 scene 间组织；以及制作团队可用于分配镜头、空间、音乐与节奏的“段落预算”。现成补法不是恢复 Chen 的命名，而是保留 beat／scene／sequence／act 五级表：时刻级用于诊断转折，中间 sequence 用于承载一组转折的体验，act/story 用于全局弧。

### (4) 影视侧缺什么是游戏侧天然有的？

证据支持的差异不是“影视不能做”，而是媒介默认条件不同：

- 影视通常是一条由创作者控制的固定播放路径；游戏天然有输入、状态、重试和多次运行。Façade 通过 drama manager 根据 story state 与玩家行为选择尚未使用的 beats，明确展示了互动叙事把 desired arc 与运行时状态接起来的做法。[Mateas & Stern](https://www.cp.eng.chula.ac.th/~vishnu/gameResearch/story_november_2005/MateasSternAIIDE05.pdf)
- 因而“可调参数、可重复运行、玩家侧变异”不是游戏独有的逻辑可能性，但在游戏体验中是默认存在的设计变量；电影若要获得它们，必须引入互动版本、分支版本、A/B 试映或多次观众实验。
- 影视测量往往有观众样本、版本和生理设备，但没有一个自动把“观众曲线”变成“下一次运行的设计输入”的运行时闭环。游戏侧可以把状态、触发条件、参数、日志和玩家变异直接纳入设计系统；这仍需实际项目证据，不应因此假设所有游戏都能稳定控制情绪。

结论是“部分支持”：游戏天然更接近可重复运行和玩家变异；“可调参数”需看具体系统。影视侧拥有更成熟的剪辑／声音专业杠杆与试映测量，游戏侧则更容易把这些杠杆做成状态化、可重放、可比较的运行时变量。
