# ProjectProgress

更新于 2026-09-12 12:30:16 +0800 · 记录者 Codex

## 内容补全（2026-09-12 12:38:17 +0800）

用户要求继续补全。已完成本地基线与资源入口检查，首批候选及80任务检索上限在 docs/research/2026-09-12-atlas-coverage-expansion.md；批量检索待明确确认。仅做1次网页最小探针，未修改历史事实或启动批量采集。以下保留当前已上线状态。

## 当前状态：Innovation Atlas 已公开上线

用户授权“整理整理上线”后，已审核并推送本项目提交。runtime `1daa942f59f7490b1736ea5cb3579476bf3d92d6` 由 [GitHub Pages run 34672575872](https://github.com/PlayWithExperiences/Learn-About-Games/actions/runs/34672575872) 成功部署。

网站：https://playwithexperiences.github.io/Learn-About-Games/ 。新版历史总览：https://playwithexperiences.github.io/Learn-About-Games/atlas/ 。精确年份网络：同站 `/atlas/network/`。

- 云端 209 单元测试、150 Chromium 检查通过，4 项条件跳过；构建 154 页。
- 线上首页、历史总览、精确年份网络、资源页 HTTP 200；总览与网络各96对象，总览9个阅读区域，资源5437项，浏览器模块可取得。实际操作确认搜索 Hades、打开来源、跳转 Spelunky 正常；320px 视口中 Dead Cells 与详情面板可读。
- 首轮发布因文献返回23px位置偏移停止，没有部署。已修复平滑滚动干扰，原误差断言保持不变；第二轮全量云端验证通过。两轮记录均保留。
- 本地未提交的 NotebookLM 自动化和旧记录保留，不纳入本次新增提交；现有已提交历史已随发布推送。生产流水线的阻塞状态独立于网站上线。

Atlas 为96对象 / 86关系 / 78 Evidence；新增12个博物馆年表锚点未生成影响边。地区、品类和2020s覆盖仍不完整，后续按有界专题核查来源。资源目录仍为5437 Work Items / 5590 Access Versions / 44 Sources / 16 Topics，EGDS 四层未在本轮改变。

下一步：依据公开版反馈迭代；批量史料扩展和新增付费调用仍需明确确认。发布详情与检查边界见 sessions/2026-0912-innovation-history.md、evidence/2026-0912-innovation-publication.json。收尾提交只更新仓库回执，使用 skip-ci，不替代上述已部署 runtime。

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
