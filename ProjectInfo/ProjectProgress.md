# ProjectProgress

更新于 2026-09-12 14:04:27 +0800 · 记录者 Codex

## 当前状态：第一批历史证据扩充已上线

用户批准的首批检索和网站更新已完成。runtime `887c09afccc5b2ae0024ea33dc93358ae7e0e41b` 由 [Pages run 34676484044](https://github.com/PlayWithExperiences/Learn-About-Games/actions/runs/34676484044) 成功部署。总览：https://playwithexperiences.github.io/Learn-About-Games/atlas/ ，精确年份网络位于 `/atlas/network/`。

- 目录134对象（93游戏/版本、31机制观察、2类别、8其他对象）/ 106关系 / 113来源。新增32游戏/版本、6机制观察、20关系、35来源；13阅读区，日期实例至2024年。
- 采集实际20搜索/50页面读取任务，未超批准的20/60上限；并发最多2，无自动重试失败URL，无外部付费模型、转写或视频下载。来源、失败与延期记录在 docs/research/2026-09-12-atlas-expansion-receipt.json。
- 云端213单测、152 Chromium检查通过（4条件跳过），155页构建与部署成功；本地地图桌面/手机62检查通过（20设备条件跳过）。
- 线上首页、总览、精确网络、资源页均200；两图各134对象，总览13阅读区，新作品存在，精确画布宽2522.58px，资源5437项。实际操作确认Balatro→Luck be a Landlord关联追踪及一代宗师的2011年资料片与中文来源。
- 保持旧年份每年像素间距，延长精确画布；全屏透镜单行滚动；右端节点的来源面板自动停靠到另一侧。中文来源支持简体/繁体，不将抢先体验、资料片与重制版年份倒填成原作诞生。

仍待补全：BuildCraft的早期日期、DDR/Guitar Hero原始材料、桌游前身的独立建模，以及更多格斗、音乐、模组、移动平台、中文作品之间的影响证据和2025年后的内容。本批不冒充完整游戏史，后续批次不自动扩大额度。

未提交NotebookLM自动化与旧记录原样保留；网页上线不代表生产流水线完成。EGDS与5437资源目录未作内容改动。回执：sessions/2026-0912-innovation-history.md、evidence/2026-0912-atlas-expansion-publication.json。最终仓库回执用skip-ci推送，不改变上述已部署runtime。

## 资源生产工作段（保留原状态，独立于发布）

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
