# ProjectProgress

更新于 2026-09-13T00:04:02+08:00 · 记录者 Codex

## 当前状态：Innovation Atlas主干补全，最终发布待验

用户已明确授权后续史料检索、实现、验证与既有网站发布直接推进，不再逐批确认。未启动付费服务。

- 本地目录195对象 / 160关系 / 172来源；13阅读区、7比较入口、15证据透镜。相对134基线新增61对象、54关系、59来源，日期实例到2026。
- 144电子游戏/版本、3桌面游戏、37创新观察、2类别与9实验/硬件对象分别表示。新增tabletop-game，不把D&D、Magic、Dominion冒充电子游戏。
- BuildCraft/DDR/Guitar Hero、MUD与竞技模组、三维格斗/平台、赛车/体感、移动平台、更多中文作品及2025–2026实例已补入。6项新机制观察有版本载体；初始深链接回落年代目录的问题已修复。
- 类型检查0/0/0、217单测、156页构建通过。最终地图检查初轮71通过/20条件跳过/3失败；桌游类型标签换行挤压年份已修复，两项多页/多透镜检查的整体时间预算按实际规模调至60秒（未放宽几何或语义断言），定向6/6通过；合并74通过/20条件跳过。
- 最新已验证线上仍为第二批 f51efa3：run34701125156成功，214单测、153 Chromium通过/4跳过，155页；两图146节点及BuildCraft关联已在线复核。195版本已推送 runtime 1b41f41328d4712649805f6a9c9d4c7f4857e8a6，Pages run 34703681445 已通过云端构建，正在全站Chromium检查；不能把本地结果当成线上验收。
- 覆盖审计：docs/research/2026-09-12-atlas-completion-audit.md；当前盘点由 scripts/audit-atlas-coverage.mjs 直接复用前端分配，输出哈希与清单。第二至第五批请求回执保留失败、重定向、定位重读失败和版本语境。

下一步：完成195版本云端及线上验收，再按原代表性主干标准逐项收口。目录不是穷尽所有游戏的历史，未收录作品和未核查影响仍显式保留。

## 资源生产工作段（保留原状态，独立于发布）

### NotebookLM 生产：2026-09-12 23:59 +0800（最新）

更新于 2026-09-12 23:59:00 +0800 · 记录者 DSH agent

- 用户授权先试一条。本条为既有 `generating` 孤儿 `youtube-QBAM27YbKZg`（Fallout 4）的修复性重跑，不在本批 10 条预检清单内；其余 9 条未动。
- **交付阻塞已解除**：AI-Life-Mentor `main` 与 `origin/main` 为纯分叉（远端 briefings/pkm-index、本地 CV/ProjectInfo/scripts，零文件重叠），安全合并后推送；原 non-fast-forward 拒绝消失。
- **导出瓶颈根因已定位并修复**：三次历史失败同因——headless 下 viewer 下载 stall、页内 fetch 被 CSP/CORS 拦、canvas 跨域不可读、adapter 无 pageAssets 能力。新增 `automation/browser/asset-capture.cjs`（CDP Fetch 响应阶段＋流式 `takeResponseBodyAsStream`＋`IO.read`）直接取回 **lh3 原始字节**；思维导图沿用 SVG 抽取渲染；演示文稿浏览器重启后下载完成。实测坑（302 同 requestId、缓冲式 getResponseBody 死锁、缓存吞请求、clip scale>2 超时、fromSurface:false 忽略 clip）写入 `automation/browser/README.md`。
- 产物均上传图床并回读 sha256 一致：信息图 5,662,026B/2752×1536；思维导图 995,618B/2664×4621（全部展开核验：折叠 0、内容节点 51、层级列 4、渲染稳定）；演示文稿 19,741,391B/13 页 PPTX（整页图片式，中文简体）。
- 结果：attempted 1 / ready 1 / remote_delivered 1 / failed 0 / skipped 9；ledger **36 ready / 24 failed / 0 generating**；当日 remaining 9。inbox `2026-0912-2357-level-spatial-design.json` 提交 `ac64039` 并推送，远端 blob `ed7eaf90…` 与本地一致。注意：AI-Life-Mentor 为**私有**仓库，未认证 raw 读取对本仓库任何文件（含 README.md）均 404，交付判据须用 fetch 后的远端 ref＋blob 比对。
- 运行级事件：headless Chrome 在 pptx 下载 stall 后崩溃，`launch.cjs` 重启复用登录态、notebook 状态无损。**次序偏差（如实记录，未改写时间）**：本轮生成动作（思维导图约 23:36、演示文稿约 23:38 发起）早于 retry claim（23:44:14），因先做不耗配额的根因定位；当日 claim 计数为 1。
- 未写 PKM、未建 Issue、未触发 Daily Check-in、未发布网站。下一批不从本条自动扩大额度；预检清单其余 9 条须另行确认。
- 证据：`/Users/haodong/.local/state/learn-about-games/notebooklm-daily/runs/2026-09-12T2344+0800-fallout-export-fix/report.json`；摘要 `sessions/2026-0912-notebooklm-fallout-export-fix.md`。

### 历史快照

更新于 2026-09-10 19:05:00 +0800 · 记录者 muse-spark

## 当前状态

- 9-04 stale（`youtube-1hdXDgCh8rw`）经 retry（run-20260904044845-6015 → run-20260910181916-43520）已 **ready＋远端交付**：inbox `2026-0910-1857-design-fundamentals.json`，远端 `a59f087` 发布＋`3ece40a` 推送，blob 回读一致。四件：总结1796＋边界586；信息图 2752×1536；思维导图本 run Expand-all（74文本/0折叠/目视4级）＋新鲜导出 3278×5937；12页 deck。PicGo 4/4 未改设置。全库 ready34 / failed25 / generating0。
- viewer 定论已反转：等效路径存在（viewer 内 `Expand all nodes`，DOM＋目视双验），工具沉淀 `automation/browser/oopif-probe.cjs`；两例旧"无入口"结论已更正（ledger 历史不改写）。
- 现场教训：checkbox 索引漂移（label 原子＋重查）；dlto headless 无效（~/Downloads 即时搬运）；deck 按钮曾跳新本；误建空白本 08729983 未动。
- 今日 claimed2 / remaining8；图片铁律全程遵守；web_search 后端 402（未用外部结论）。
- 用户授权：失败的继续、没做完的继续；按规则实产（不放宽合同）；批次边界并发 1。

## 下一步

- 已派 `youtube-s_I07Iq_2XM` retry（prev 用最新 run-20260910135253-56675），同 recipe＋教训；回执后验 ledger＋blob。
- 其后：其余导出失败类 → 配额类 → 其他，`1wyToyTk3D0` 放最后；不写 PKM/Issue，不触发 Daily Check-in。
- 证据：runs/2026-09-10T182500+0800-merge-retry/report.json；ProjectInfo/sessions/2026-0909-notebooklm-preflight-2037.md。

## NotebookLM 自动化本轮：2026-09-11 07:46 +0800

更新于 2026-09-11 07:46:11 +0800 · 记录者 Codex

- 当前 ledger 35 ready / 25 failed / 0 generating；昨日旧阻塞已关闭，本轮不沿用其阻塞结论。
- preflight ready_to_claim，浏览器 available；尝试 1，ready 0，远端交付 0，failed 1，跳过 9，当日剩余 9。
- `youtube-t7VkrExQwSo` / `run-20260911073336-85741` 在长期 Notebook 单来源生产；导图已全部展开（4级、0折叠），但实际节点为英文，违反简体中文合同，已调用 fail。停止本轮，无重试，无确认的配额阻断。
- 总结回复未验收；信息图和 deck 最后观察到仍在生成，未导出/上传/ready/交付。不写 PKM、不触发 Daily Check-in。
- 下一轮继续预检新候选；生成导图前应明确填写简体中文主题要求，并验正文语言，不只看中文标题。失败资源不可自动重跑。
- 证据：本机 producer runs/2026-09-11T073225+0800/report.json；本轮记录见 sessions/2026-0911-notebooklm-language-failed.md。

## NotebookLM 自动化：2026-09-12 07:33 +0800

更新于 2026-09-12 07:34:17 +0800 · 记录者 Codex

- preflight ready_to_claim，候选10；本轮 attempted0 / ready0 / remote_delivered0 / candidate failed0 / run failed1 / skipped10 / remaining_today10。未确认资产配额耗尽。
- 当前 ledger 35 ready / 24 failed / 1 generating。既有 `youtube-QBAM27YbKZg` / `run-20260911205631-38417`（9-11 20:56领取）仍 generating；本轮未找到关闭或所有权交接证据，不能断言其仍在执行，也不覆盖此记录。
- 浏览器 CDP 可达；当前为空白 Notebook 与添加来源对话框，既有生产 Notebook 的来源/Studio 就绪状态 unknown。本轮 browser-notebook-access 运行级阻塞，同时保留串行生产约束。
- 未 claim/retry、生成、上传、交付、修改 ledger、写 PKM 或触发 Daily Check-in。下一步先关闭或明确交接既有生产，再运行新批次；不自动重试旧失败。
- 本机证据：/Users/haodong/.local/state/learn-about-games/notebooklm-daily/runs/2026-09-12T073339+0800/report.json；同目录 preflight.json 保留本次预检响应内容。
