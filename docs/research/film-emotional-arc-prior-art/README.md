# 影视／叙事工业里的「情绪曲线 + 转折点 + 杠杆」既有体系

更新于 2026-08-22 · 记录者 Codex

## 研究问题与边界

本轮不是把影视理论改名成 EGDS，也不是把“好故事”压成一种模板。问题是：影视／叙事工业如何描述动态时间线中的情绪、转折与实现手段；哪些方法能对应 EGDS 的“情绪曲线 ← 情绪体验 ← 主观感受 ← 客观原因 ← 设计杠杆”；以及观众实时测量是否真的会产出可回接制作的曲线。

上一轮已覆盖感性工学、QDA、PLEX、QF、thick/thin、basic level，见 [`docs/research/feeling-lexicon-prior-art/`](../feeling-lexicon-prior-art/)，本轮不重复它们。

## 查询与证据规则

- 优先级：原始论文／数据集／机构页面／作者或行业原文；二手解释只用于定位，不能单独支撑关键数字。
- 每个结论在正文附近放来源链接。书籍页码只在能核对到可读版本或书目记录时写明；无法核对写“未查证”，不补猜测。
- “曲线”严格区分三类产物：结构模板（作者预设的单位和位置）、文本／影片内容推断的时间序列、观众反应测量的时间序列。三者不是同一变量。
- “转折点”严格区分价值状态变化、叙事方向改变、观众反应峰值／谷值和制作人员的诊断标记。

## 查询记录：失败与确无结果分开

### 查询失败（通道失败，不得推出“不存在”）

本轮使用 `agent-reach doctor --json`，结果显示 Exa 与 Jina Reader 可用。并行发出首批 Exa 查询后，Exa MCP 返回 HTTP 429（free MCP rate limit）；因此 McKee、Snyder、六弧、观众测量等查询的 Exa 结果为空是“查询失败”，不是零结果。随后改用网页搜索，并以页面内容逐项核验。

YouTube 字幕后端体检为 off（`yt-dlp` 未安装）。因此没有把任何视频字幕或视频自动转录当作已查证材料；Chen 的一手入口使用 GDC Vault 页面，具体图表的逐字稿／完整视频内容仍标记为受限。

### 当前检索到的零结果／未查证（不是“不存在”）

- 未查到一篇能证明“影视工业普遍使用统一的情绪词表 + 标准参照片段库”的公开、跨公司标准。现有做法分散在镜头语言教材、剪辑／声音理论、试映研究与公司内部工具中；因此文档写“未查证有统一行业标准”，不写成“没有任何词表或片段库”。
- 未查到公开、可复核的“Chen 的 7 章清单与清晨—重生七个中文标签”一手逐字稿。GDC 页面确认 talk 的目标是实现 Journey 的 emotional arc；二手材料确认按 level/section 绘制 emotional intensity，但具体用户所述标签仍标为“未查证”。
- 未查到公开资料证明 CinemaScore 本身输出逐分钟情绪曲线；官方描述是开场夜观众调查与总体 grade，所以它归入“总体评价”，不是 moment-by-moment 曲线。

## 文件导航

- [`01-turning-points.md`](01-turning-points.md)：转折点定义、影视结构模板、日本术语，以及 beat→scene→sequence→act→story 层级。
- [`02-arc-shapes.md`](02-arc-shapes.md)：Vonnegut、Reagan 等六弧方法、样本量、批评与影视复现。
- [`03-levers.md`](03-levers.md)：Murch 六法则、连续性剪辑、镜头／声音杠杆与片段库问题。
- [`04-audience-measurement.md`](04-audience-measurement.md)：Program Analyzer、dial testing、试映、CinemaScore、Nielsen、生理测量和回接制作。
- [`MAPPING.md`](MAPPING.md)：影视体系对 EGDS 五层的覆盖矩阵与四个核心回答。

## 结论先行

影视侧最成熟的不是一条统一“情绪真值曲线”，而是多层结构单位、可操作的转折定义、剪辑／声音／镜头的杠杆词汇，以及逐渐成熟的观众时间序列测量。McKee 的 value charge 是“场景内价值状态翻转”的强定义，接近 EGDS 的“情绪体验＝转折点”，但不是同义词：它描述的是叙事价值关系，不直接测量观众感受。观众曲线可以定位反应峰谷，却仍需把时间码、事件和制作版本对齐，才可能回接“客观原因→设计杠杆”。

## 链接健康抽检（Claude 审查，2026-08-22）

全量 32 条外部链接逐条 HTTP 检查：**23 条 200**；3 条 403/406 属已知反爬（hdsr.mitpress.mit.edu、iris.unitn.it、konan-wu.repo.nii.ac.jp），页面应为真实。

**4 条确认失效（404），其中两条承载关键数字，引用前必须换源：**

| 链接 | 用途 | 状态 |
|---|---|---|
| `tlu.ee/~rajaleid/montaazh/In-the-Blink-of-an-Eye.pdf` | **Murch Rule of Six 的 51/23/10/7/5/4 与页码 18–19** | 404 · 数字本身广为引用，但此出处不可达 |
| `cp.eng.chula.ac.th/.../McKee-and-Vogler-Structure.pdf` | **beat→scene→sequence→act→story 层级定义** | 404 · 需换源 |
| `eprints.hud.ac.uk/.../FINAL_THESIS-%20GOOSEY.pdf` | Chen 的 intensity graph 二手材料 | 404 |
| `sydfield.com/wp-content/uploads/2013/07/paradigm.pdf` | Syd Field 三幕范式 | 404 |

**结论**：本轮的事实判断（Murch 六项权重、McKee 五级层级、Reagan 六弧与 1,327 本样本）与文献常识一致，但**上表两条的一手出处尚未取得可达链接**，写进 proposal 前须补。这是链接可达性问题，不是内容被推翻。
