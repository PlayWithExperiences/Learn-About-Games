# YouTube 免费频道收录与字幕获取记录

更新于 2026-08-20 · 记录者 AI

## 范围与口径

本轮只收录三个频道的官方 YouTube 上传：GDC Festival of Gaming、Game Maker's Toolkit、Masahiro Sakurai on Creating Games（英文频道）。访问检查日期为 `2026-08-20`，清单由 `yt-dlp 2026.08.19` 的 `--flat-playlist --dump-json` 取得；频道页、视频页和字幕检查均为无头命令行操作。

`--flat-playlist` 的三类输出均已跑完，没有按数量截断：`id`、`title`、`duration` 在全部 2451 条视频行中存在且三个视频清单各自无重复。该模式对 2451 条都没有返回 `upload_date`；本轮没有用不完整的二次抓取或猜测值填充它。目录 schema 也没有上传日期字段，所以 `upload_date` 只作为未取得的导出字段留痕，不能把本轮描述成已写入上传日期。

## 已收录

| 官方频道 | handle | `/videos` dump | `/streams` | `/playlists` | 已存在 | 新 Work Item | Source | 媒介 |
|---|---|---:|---:|---:|---:|---:|---|---|
| [GDC Festival of Gaming](https://www.youtube.com/@GDCFestivalofGaming) | `@GDCFestivalofGaming` | 1914（1914 unique） | 4 | 11 | 139 | 1775 | 新建 `gdc-festival-of-gaming` | `talk` |
| [Game Maker's Toolkit](https://www.youtube.com/@GMTK) | `@GMTK` | 237（237 unique） | 0 | 27 | 1 | 236 | 复用 `game-makers-toolkit` | `video` |
| [Masahiro Sakurai on Creating Games](https://www.youtube.com/@sora_sakurai_en) | `@sora_sakurai_en` | 300（300 unique） | 0 | 19 | 1 | 299 | 新建 `masahiro-sakurai-on-creating-games-en` | `talk` |

GDC 的 streams 清单确实返回了 4 行；GMTK 与樱井英文频道的 streams 端点返回“没有 streams tab”，因此计数为 0。Playlists 是频道导航清单，没有在 Work Item 中重复灌入。已有数按 YouTube video id 去重；樱井日文频道的既有条目不算英文 handle 的重叠项。

新增 2310 个 Work Item，各有一个 `en` / `free` / `original` / `original` Access Version，URL 为对应的 `youtube.com/watch?v=`，检查日期为 `2026-08-20`。现有条目与已有 Access Version 没有改写或删除。

合并后精确计数：**43 个 Source、5430 个 Work Item、5583 个 Access Version**（原有 41 / 3120 / 3273，加上本轮 2 / 2310 / 2310）。

### 保守标注

- 新条目的 `whyRelevant` 全部省略：2310 / 2310。
- 新条目中 `whyRelevant` 与 `summary` 相同：0 / 2310，即 **0%**。既有目录中的相同文案不在本轮改写范围，呈现层仍会隐藏重复相关性。
- `summary` 只陈述官方频道、视频标题、英文免费播放页和“未外推未观看内容”；不把标题当成视频正文摘要。
- `resourceTopicIds` 每条恰有一个。仅凭标题明确命中主题的有 **1129** 条；标题不足以支持更细主题而保守落到 `design-fundamentals` 的有 **1181** 条（GDC 712、GMTK 116、樱井英文 154）。这 1181 条是 schema 所需主题的保守兜底，不是人工阅读全文后的语义判定。
- 标题明确支持时才设置 `capabilityIds` / `knowledgeTopicIds`；本轮分别有 872 条和 703 条至少一个映射，其余保持空数组。

## 仅提议，未收录

以下频道均有公开播放页，视频可直接观看不等于对内容版权或永久免费政策作额外保证。订阅数是 `2026-08-20` 通过频道 metadata 观察到的易变数字；视频数是同一日期的频道 `/videos` flat dump。它们都没有写入本轮 catalog，等待后续对“游戏设计向”的范围决策。

| 频道（handle） | 视频数 / 观察订阅数 | 内容定位与相关性 | 字幕观察 | 公开证据 |
|---|---:|---|---|---|
| Adam Millard – The Architect of Games (`@ArchitectofGames`) | 170 / 436K | 长篇游戏设计分析；代表视频讨论电子游戏经济系统的失衡，和本目录的系统、平衡、设计批评主题直接相关。 | 代表视频有人工 `en-GB`，也有自动 `en`。 | [频道](https://www.youtube.com/@ArchitectofGames) · [代表视频](https://www.youtube.com/watch?v=GMtIAXtAGxw) |
| Noclip (`@NoclipDocs`) | 222 / 900K | 游戏开发纪录片；代表视频记录《Dredge》的设计过程，适合生产、设计决策与开发者访谈语境。 | 代表视频有人工 `en`，也有自动 `en`。 | [频道](https://www.youtube.com/@NoclipDocs) · [代表视频](https://www.youtube.com/watch?v=yXQipk_mBAo) |
| Extra Credits (`@extracredits`) | 588 / 302K | 游戏设计、行业与历史的教育视频；代表视频讨论自由度与制作范围。 | 代表视频有 `es-419`、`it` 人工轨，英文为自动字幕。 | [频道](https://www.youtube.com/@extracredits) · [代表视频](https://www.youtube.com/watch?v=45PdtGDGhac) |
| Game Dev Guide (`@GameDevGuide`) | 70 / 121K | 频道自述聚焦 Unity editor scripting、game design、UI 与 custom tools，适合实现和工具工作流。 | 代表视频有自动 `en`，未见人工英文轨。 | [频道](https://www.youtube.com/@GameDevGuide) · [代表视频](https://www.youtube.com/watch?v=sB8jryDaaXE) |
| Unreal Engine (`@UnrealEngine`) | 3061 / 1.27M | 官方实时 3D 工具频道，包含引擎、技术与开发者演讲；相关性强但范围明显超出纯游戏设计。 | 代表视频有自动 `en`，未见人工英文轨。 | [频道](https://www.youtube.com/@UnrealEngine) · [代表视频](https://www.youtube.com/watch?v=F79Ft9b77_w) |
| Unity (`@unity`) | 3024 / 1.22M | 官方 Unity 开发平台频道，包含工具、引擎与游戏开发内容；相关性强但同样是宽口径官方频道。 | 代表视频有自动 `en`，未见人工英文轨。 | [频道](https://www.youtube.com/@unity) · [代表视频](https://www.youtube.com/watch?v=PNm_JUJY6fw) |

## 字幕与正文获取

三组已收录频道的样本都能找到英文自动字幕，没有把人工字幕当作稳定频道级承诺。检查时 GMTK 某条视频的 `subtitles` 区也出现了英文轨，但其 URL 带 `caps=asr`，属于自动语音识别轨；因此不能只按 yt-dlp 字段名把它误报成人工字幕。下游应按轨道来源识别，而不是把“存在 `subtitles.en`”直接当成人工校订。

不要用 `yt-dlp --write-auto-sub` 作为正文抽取方案：实测同一 GMTK 视频的 VTT 约 17470 字符，滚动窗口造成大量逐行重复，并夹有 `[music]`。推荐使用仍在更新、无需 API key 或 headless browser 的 [`jdepoix/youtube-transcript-api`](https://github.com/jdepoix/youtube-transcript-api)；截至检查时 GitHub API 显示 8078 stars、`updated_at=2026-08-20T13:54:28Z`。下游调用形式：

```python
from youtube_transcript_api import YouTubeTranscriptApi

t = YouTubeTranscriptApi().fetch(video_id, languages=['en'])
text = ' '.join(s.text for s in t)
```

同一 GMTK 视频用该 API 得到约 8502 字符的干净文本，已带标点和大小写、没有 VTT 的滚动重复。这里仅记录取料方式；本仓库没有实现转录管线，也没有把字幕正文写入 catalog。

## 可复核的边界

本轮处理完整的是三个 `/videos` flat 清单及所要求的 streams / playlists 探测，共 2451 条视频行；没有静默保留子集。唯一未取得的字段是 flat 输出没有提供的 `upload_date`，没有把它伪造成当前条目字段。候选频道全部保持“仅提议”状态。
