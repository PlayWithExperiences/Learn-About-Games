# Learn About Games 收集端每日摘要

## 0740 批次（2026-11-12）

记录者：DSH。按 `collect-resources-about-game` 共享技能执行（含视频阶段与批次清理）。本记录不含 NotebookLM 私有正文、工作台 URL、凭据或 token。

### 前置核对

- 本地 `main` 比 `origin/main` 多 1 个未推送提交（`4ee4d5d` "Clean local NotebookLM duplicates after verified delivery"，含本技能新要求用的 `prune-delivered-notebooklm.py`）；本场沿用并在推送时一并发布（已在报告中注明）。
- 唯一一次只读 preflight：`ready_to_claim`，2454 个目录候选，取前 10（`claimed_today=0`、`remaining_today=10`），首项承接 11-11 未处理的 `da2MK5qPRRg`；10 个 ID 远程去重 0 命中。
- 零配额标题碰撞前置检查：开跑前 66 个来源 vs 10 候选，最高 0.53、0 高风险；第 2 条新增 GDCA 来源后，对余下候选用实时来源表重算仍 0 高风险（0.72 阈值）。
- claim 前通道：headed 隔离画像打开长期本 `available`（来源 66、Studio 控件 9 个、chat 可写、演示文稿可立即生成）；PicGo 存活；AI-Life-Mentor `main` 干净；干净发布克隆 `0dba180`。

### 基本资源结果（1 条交付、3 条失败）

- `youtube-da2MK5qPRRg`（`run-20261112074350-33714`）：ready 并远端交付。信息图 5,769,768 B、导图 912,143 B、PPTX 15,662,352 B；导图深度 3、折叠 0（50 节点）；blob `59a0978b…`。
- `youtube-BWPpAccQt3k`（`run-20261112075530-50903`）：**思维导图深度不足**——展开后 depth 2 below root（需 ≥3）、contentNodes=14、折叠 0、渲染稳定；短公告视频产出浅层导图，硬门槛失败。
- `youtube-L10d3953FnU`（`run-20261112080400-63819`）：**来源身份误配**——pre-claim 匹配到本批第 2 条刚新增的「GDCA 2024 Host Announcement」，而非「IGF 2024 Host Announcement」；import reused=true、隔离仍指向 GDCA，生成前停止并记 fail。
- `youtube-OvT0lpaQhsk`（`run-20261112081133-74464`）：**卡片身份误配**——信息图等待匹配到第 2 条已生成的同名旧卡「2024年GDC颁奖典礼指南」，与本候选 summary（3420 字符）不符；导出前停止并记 fail。
- 判定：同批次内连续两次身份异常（source-identity + card-identity），为系统性缺陷，停批；当时演示文稿额度仍可用（08:11 probe 通过）。
- 远端 `origin/main` 验证时为 `d95b0a5581d15d48ed081d8a9b7bc8b8bf4a61b5`。

### 可选视频阶段（策略开启 → 生成成功、导出失败）

- `learning-video.mjs next` → `ready_to_generate`（候选 `youtube-shXiIlgJnec-short-20261112`）→ `begin` 成功。
- 长期本中把生成对话框来源隔离为唯一「Art of 'Thirsty Suitors'」，确认简洁版 9:16、中文（简体）、1 个来源后点「立即生成」；该次对话框点击后即关闭（生成已开始）。
- 约 10 分钟后出现新视频卡「动画师如何在第一人称里演戏」1:07、简短、1 个来源；viewer 内 video 元素 `duration=67.57s` 可播放，页面文本含「查看提示和 1 个来源」。
- 导出失败：下载目录监控 2 分钟无文件、无 `.crdownload` 残体；页面资产后台路径对该 viewer 不可用。未取得可验证 mp4，故**不注册、不冒充成功**，用 `learning-video.mjs fail` 登记（stage=export），零自动重做。

### 批次清理（技能收尾要求）

- 写完整 `batch-report.json` 后运行 `automation/prune-delivered-notebooklm.py --batch-dir <本轮 runs> --apply`：preview 显示 7 项 verified、634,576,896 B、issues 空；apply 结果 `removed:7`（artifact 6 + publisher-clone 1），回执 `~/.local/state/learn-about-games/notebooklm-daily/retention-20261112T083612443566.json`。
- 失败/未交付文件、报告、账本与浏览器资料均保留。

### 停止与下一步

- 停止原因：`identity-systematic`。attempted 4（4 claim）/ **ready 1 / remote_delivered 1** / failed 3 / skipped 6；今日 claim 4/10、剩余 6。
- 未重试既有 failed；未写 PKM 或 Issue marker、未触发 Daily Check-in、未发布网站、未改生产代码。无 429、无 HTTP 500。费用计量不可见。浏览器用后已关闭。
- 下一步：① 优先修 `source_identity_ok` 与卡片身份等待（video_id 硬校验 + 同标题多卡去歧义），否则同类系列候选会持续失败；② 未处理 6 项：`h2iKIVRLv3U`、`y7DSWCnGInA`、`chY8bfGa5rU`、`TO23gOGZkcA`、`SXQT4J110Dg`、`WDK4FBm3DDY`；③ 视频导出路径需排查下载控件为何不落盘（可考虑页面资产/浏览器下载事件监听）。
- 证据：`runs/batch-20261112T0740-scheduled/{batch-report.json,preflight.json,browser-workbench-state.json,deck-probe.json,source-titles.json,source-titles-now.json,video-cards-before.json}` 与 `item-01` 至 `item-04` 报告、`retention-*` 回执。

原始对话：`dialogues/2026-1112.md「0740 收集资源自动化」`（仅保存可核验的请求/结果摘录；完整 DSH transcript 未找到，不声称逐回合覆盖）。
