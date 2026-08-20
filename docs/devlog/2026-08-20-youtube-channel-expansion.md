# Devlog 015：完整收录官方 YouTube 游戏开发频道

2026-08-20

本轮把成长资源的免费 YouTube 范围从少量镜像扩展为三个官方频道的完整 `/videos` 清单：GDC Festival of Gaming 1914 条、Game Maker's Toolkit 237 条、Masahiro Sakurai on Creating Games 英文频道 300 条。按 YouTube video id 去重后，139、1、1 条已有 Access Version 被跳过，新增 2310 个 Work Item、2310 个英文免费 Access Version，并新建两个 Source；GMTK 继续复用既有 Source。目录当前为 43 个 Source、5430 个 Work Item、5583 个 Access Version。

本轮明确不把频道标题包装成正文摘要：新条目只保存标题、官方频道、公开播放页与访问事实，`whyRelevant` 全部省略。每条只保留一个主要 Resource Topic；1129 条由标题直接支持，1181 条因 schema 需要主题而保守落到 `design-fundamentals`。新条目 `whyRelevant === summary` 的比例为 0%，既有条目不做批量改写。

另外调研了 Adam Millard、Noclip、Extra Credits、Game Dev Guide、Unreal Engine 与 Unity 六个频道。它们保持“仅提议”状态，未因为订阅数或视频量而自动进入目录；公开定位、样本字幕和证据链接见 [研究记录](../research/2026-08-20-youtube-channel-intake.md)。该记录也保留了 flat dump 不返回 `upload_date` 的限制，以及下游使用 `youtube-transcript-api` 而不是滚动重复 VTT 的取料建议。

本轮不恢复 Public、不启用 Pages workflow、不 push，也不在本仓库实现转录管线。
