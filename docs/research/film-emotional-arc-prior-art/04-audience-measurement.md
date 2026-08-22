# 04｜观众侧的实时测量

更新于 2026-08-22 · 记录者 Codex

本章先给一个判断：观众测量可以产出“随播放时间变化的反应序列”，但只有在变量、采样率、时间码和事件标注都明确时，才可称为一条可解释的观众侧曲线。它通常不是单一的“情绪真值”。

## 方法对照

| 方法 | 产出物形态 | 时间粒度／采样率 | 接回制作决策 | 已知局限 |
| --- | --- | --- | --- | --- |
| Lazarsfeld–Stanton Program Analyzer（Little Annie／Big Annie） | 多人按下 like／dislike／indifferent 的同步纸带或时间轨迹 | 事件触发；早期装置不是连续生理采样，后来的 dial 才近似逐秒 | 对齐广播内容时间码，找集体喜欢／不喜欢段，再访谈原因 | 三值按钮把复杂反应压缩；按钮动作可能改变观看；原始语境主要是广播研究 |
| Dial testing／Perception Analyzer | 每位观众的连续旋钮曲线、群体均值、分位数和峰谷 | 常见每秒或更细；实际由设备／软件设定 | 标出反应突变时间，回看对应对白、镜头、音乐、广告版本，做删改或重剪假设 | 量的是当下评价／engagement proxy；群体均值隐藏个体差异，快速判断可能是偏见或疲劳 |
| Preview screening／focus group | 总体问卷、开放反馈、分段回忆、场后讨论，有时配 dial | 通常整片前后；若加 dial 才有逐时序列 | 按时间码把“困惑／无聊／笑／哭／离场”与版本差异合并，形成剪辑诊断 | 样本与影院环境未必代表正式观众；回忆和社会压力影响答案 |
| CinemaScore | 开场夜离场问卷、人口属性、A+ 到 F 的总体 grade | 影片级，不是逐分钟 | 评估预期满足、口碑和发行表现；不能直接定位哪一场需要改 | 官方称其为 theatre audience appeal 与 grade，私有调查细节不公开；不是情绪曲线 |
| Nielsen TV measurement | 节目／广告的观众人数、reach、平均 minute audience 等 | 现代系统可到 subminute watermark；核心是观看行为而非情绪 | 找流失、换台、时段表现和广告暴露；与剪辑事件对齐只能间接推断 | 观看／留存不是情绪；面板与大数据的代表性、谁在看、时移都影响解释 |
| LIRIS-ACCEDE／MediaEval | 片段级 affective impact、valence/arousal 标注或连续预测模型 | 片段或连续时间窗，取决于数据集／任务 | 比较版本的情绪影响预测，训练内容特征到观众反应的模型 | 任务标签和实验样本不是影院全体；预测输出不自动解释因果杠杆 |
| EEG／GSR／EDA／面部／心率 | 生理波形、面部动作、同步自评与融合后的 arousal/engagement 分类 | EEG/GSR 可高频采样；公开研究常按 clip 或时间窗汇总 | 在实验控制下比较颜色、音乐、剪辑、镜头版本，定位唤醒／投入变化 | 生理信号非情绪专属；设备负担、个体差异、运动伪迹、伦理与影院生态效度 |

## 1. Program Analyzer 到 dial testing

1930 年代 Lazarsfeld 与 Stanton 的 Program Analyzer 用按钮实时记录听众喜欢／不喜欢；后来设备发展出更多级别和旋钮。MIT HDSR 的历史综述记录了 Little Annie 的 green/red/无按键语义、约 1937 年原型与它在电影业中被称作 reactograph／audience analyzer 的后续变体。[历史综述](https://hdsr.mitpress.mit.edu/pub/nf9bhik3/release/1)

这类数据确实是一条“反应随时间变化”的折线：横轴是节目时间，纵轴是按钮比例或旋钮值。但它的转折点通常由分析者定义为斜率突变、局部峰谷或群体分歧，不是理论上预先定义的 McKee value charge。要接回杠杆，必须把每个时间码与 shot list、scene／beat 表、对白、音乐 cue 和版本号 join 起来，然后做“这个变化在多版本是否重复”的对照。

## 2. 试映与 CinemaScore

preview screening 的行业价值在于让创作者得到版本级反馈：观众在看完后报告困惑、喜欢、节奏和角色问题，研究团队再把答案按场景或时间码回放。若只做场后问卷，产出是离散的“片后判断”，不是实时曲线；若同步加 dial／按钮，才出现逐时序列。

CinemaScore 官方页面确认其主要做 opening-night theatre audience survey，收集人口信息并计算电影 grade；私有调查结果通常属于制片方。因此它适合回答“目标观众总体是否满意／预期是否被满足”，不适合回答“第 42 分钟哪一个剪辑造成了转折”。[CinemaScore 官方](https://www.cinemascore.com/)

## 3. Nielsen：有时间轴，但不是情绪轴

Nielsen 现代 TV measurement 使用 panel + big data、音频 watermark／signature 识别内容，媒体交易指标包括 average commercial minute ratings；官方说明也提到 watermark 可到 subminute level。[Nielsen 方法说明](https://www.nielsen.com/insights/2023/how-to-measure-tv-audiences/)

所以 Nielsen 产生的是“观看／留存／到达”时间序列：可把换台、退出、回看与节目 timecode 对齐，发现观众行为的转折窗口；但“人还在看”不能直接解释为开心、紧张或理解。它对 EGDS 的情绪曲线覆盖属于无或部分，取决于是否有独立情感测量。

## 4. 生理与情感计算

LIRIS-ACCEDE 提供电影片段及 affective impact 任务资源；MediaEval 2018 的目标是连续预测电影中的 expected valence 与 arousal。[LIRIS 官方页](https://liris-accede.ec-lyon.fr/)、[MediaEval 论文](https://arxiv.org/abs/1911.12361)

影院／实验室研究也把 EEG、GSR、自动面部追踪和自评结合起来。一个多模态 affective cinema 研究让 15 名参与者观看短片序列，收集每段 engagement 自评与 EEG/GSR/面部特征；三种模态合用表现最好，但其研究单位仍是片段／参与者，不是工业统一标准。[研究记录](https://iris.unitn.it/handle/11572/33039)

另一项公开数据研究用 27 人观看 20 个 35–117 秒 clip，记录 EEG、ECG、GSR、正面视频和 1–9 的 valence/arousal 自评。[MAHNOB-HCI 研究说明](https://pmc.ncbi.nlm.nih.gov/articles/PMC6841664/)

这些方法能形成高时间分辨率的 arousal／valence／engagement 曲线，但不能单凭波形命名为“悲伤”“希望”或“转折点”。转折点要由预注册的事件边界、曲线斜率／峰谷规则和自评／叙事标注共同定义；否则只是在反应曲线上找事后显眼的位置。

## 5. 从观众曲线回接镜头、剪辑、配乐

可复核的最小闭环如下：

1. 给影片建立唯一 timecode；同时标注 scene、sequence、shot、cut、对白、音乐 cue、音效 cue、镜头运动和版本。
2. 采集观众序列，保存原始个体轨迹与群体统计，不只保存一条平滑均值。
3. 预先规定转折检测：例如群体均值相对基线的显著变化、持续窗口、个体一致性；并把“无数据／测量失败”与“没有反应”分开。
4. 将候选峰谷映射到同一时间码内的制作变量；用 A/B 版本或删除／重排实验验证是哪个杠杆改变了反应。
5. 用访谈或自评命名主观感受，再回到客观原因与设计杠杆；不能从生理峰值直接跳到“音乐导致恐惧”。

这条闭环说明了工业测量最接近 EGDS 的地方，也说明它尚未自动完成 EGDS：测量系统提供观众侧时间序列，制作分析仍需语义分层、因果对照与可追溯版本管理。
