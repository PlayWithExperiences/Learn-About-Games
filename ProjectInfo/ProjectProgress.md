# ProjectProgress

更新于 2026-09-12 02:29:34 +0800 · 记录者 Codex

## 发布收尾：2026-09-12

更新于 2026-09-12 12:01:19 +0800 · 记录者 Codex。用户本轮明确授权整理并上线本项目。已核对待推送提交：网站 runtime 与上一轮验收一致，新增提交只含项目记录；浏览器诊断工具不进入网页运行。保留现有已提交项目历史，未提交自动化与旧记录仍保留本地。正在通过现有 GitHub Pages workflow 发布，结果未确认前不标记成功。

发布 gate 更新（2026-09-12 12:16:29 +0800）：首次 run 34671900746 因精确网络文献返回23px偏移停止，未部署；已修复 smooth 滚动干扰，本地探针对照及两项相关回归通过，准备重新发布。原断言未放宽。

## 当前主工作段：Innovation Map 历史总览重做

用户授权重做游戏史与创新发展的整体表达。`/atlas/` 现以九个阅读区域与年代分列共显作品、机制观察和类别形成；三个比较问题入口、搜索、相邻关系与浮动来源面板支持继续追踪。精确年份网络保留于 `/atlas/network/`，与新入口消费同一份 catalog。

数据：96 历史对象 / 86 关系 / 78 Evidence。新增 12 个对象来自 CHM 与 The Strong 本轮读取的年表条目，未新增影响边；原有证据核查日期保持原值。新页面明确年代列间距不是时长、观察年份不是首次发明，并公开格斗、竞速、节奏、移动、中国游戏史与 2020s 覆盖缺口。

当前为本地候选，预览 http://127.0.0.1:4321/Learn-About-Games/atlas/ 。本轮尚未推送或部署：开始时本地 main 领先 origin/main 15 个其他任务提交，另有其他任务未提交修改，不将它们一起发布。本轮按文件范围单独提交。

验证：209 单元测试、类型检查 0/0/0、154 页 fresh build 通过。最终新版桌面/手机 18/18 通过，含旧深链、键盘、无脚本与实际遮挡断言。全站 Chromium 为 149 passed / 4 skipped / 1 failed；唯一 README 旧数量失败修复内容后定向 1/1 通过，已通过的无关检查未重复运行。完整回执见 sessions/2026-0912-innovation-history.md。

下一步：先评审本地新版。公开发布需从本轮提交中隔离相关改动，或在其他任务确认后整合现有未推送历史；不强推、不改写其他任务历史。内容继续按缺口做有界史料扩展；新增批量检索与付费调用仍需明确确认。

EGDS 与资源生产未在本轮改动。上次已验证的发布仍以 sessions/2026-0910-egds-v03-release.md 为准（runtime `7a101aa`）；本轮没有把历史上线证据当作新版部署证明。资源目录 5437 Work Items / 5590 Access Versions / 44 Sources / 16 Topics。

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
