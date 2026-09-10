# NotebookLM 只读预检（20:37 第三轮）

决策：沿用無涘授权边界 ｜ 记录：muse-spark

- 用户报告上轮 `OpenAI 400：单请求 51 images 超 50 上限`，要求注意并继续 collect。本轮未调用任何视觉模型，未复现该错误；后续图片验证必须单请求 ≤30 张、分批串行、调用前计数，禁止把全批导出图一次性拼入一个请求。
- `preflight --limit 10` 成功，状态 `ready_to_claim`：返回 9 候选（`youtube-t7VkrExQwSo` 起按目录顺序），今日已 claim 1，剩余 9。原始 JSON 与运行报告：`/Users/haodong/.local/state/learn-about-games/notebooklm-daily/runs/2026-09-09T203743+0800/`。
- ledger 对比 10:24 有进展：`youtube-YyQfP1GjdJ8`（今日）与 `youtube-tmuy9fyNUjY`（9-05）已由 generating 收口为 ready；仅剩 `youtube-1hdXDgCh8rw / run-20260904044845-6015`（9-04，5 天）仍为 generating，并发 1 下仍阻断新 claim。
- 本轮为只读预检 + 零配额浏览器就绪检查：`automation/browser/cdp.cjs state/eval` 可达，已登录 NotebookLM 页面存在（Sakurai notebook `880ad454…`），来源面板存在；但可见多来源混杂（Fast Research / VideoUniversity / 奥运滑板等），Studio 控件与单来源隔离尚未验证，故仍记 `unknown`，不直接复用。
- 用户已确认批次边界（范围/服务/剩余 9 条内/并发 1/重试 0/图片单请求 ≤30 分批），但未授权处置 9-04 stale claim，并发 1 下本轮仍零 claim、零配额消耗。
- 本轮 attempted 0 / ready 0 / delivered 0 / candidate failed 0 / run blocked 1 / skipped 9 / remaining 9。未写 ledger、未调用 NotebookLM/PicGo/Git，未改运行时代码，未推送部署。
- 当日配额阻断证据：无；停止原因 = 1 条历史 generating 未收口 + 浏览器未知。

下一步：原生产会话收口或明确交接 `youtube-1hdXDgCh8rw`、且确认可用 NotebookLM 浏览器适配器与本批授权（范围/服务/最多 10 条/并发 1/重试 0）后，再启动新批次；不自动重试，不补交历史 ready。需用户先确认本批授权才可 claim。

## 20:50 用户拍板后进展（记录：muse-spark）
- 用户明确：没成功的继续、没做完的也继续；第一条先收口 9-04（`youtube-1hdXDgCh8rw`）；笔记本复用＋选择器隔离（"理论上可以选到只有当前的那一条"）。
- 只读核实：当前本含 Merge 来源行（video_youtube）与已生成的中文总结（含来源边界：约1分钟预告片）；Studio 无 Merge 卡片 → 差信息图/思维导图/演示文稿三件。PicGo 路径沿用桌面端 github 图床（不改设置，见 0903 纠正结论）。
- 已派 subagent（`508687ff`）单条收口该项：沿用 `run-20260904044845-6015`，不新 claim、不碰其他 25 条 failed；图片铁律（单次 read 1 张）已写入 briefing。待其回执后再 publish/交付验证与 ProjectProgress 更新。

## 9-10 13:09 收口回执：failed @ mind-map-expansion（记录：muse-spark）
- ledger 已验：`youtube-1hdXDgCh8rw` 由 generating→failed（`failed_at 2026-09-10T13:09:06+08:00`，run 号不变）；全库现为 ready33 / failed26 / generating0，并发位释放。证据：`/Users/haodong/.local/state/learn-about-games/notebooklm-daily/runs/2026-09-10T130858+0800-merge-closeout/`（report.json＋两张已验证 PNG＋summary-extract.json）。
- 通过项：选择器隔离（52 源仅勾选 #18）；中文总结＋边界已提取；信息图 PASS（2752×1536 横向中文手绘，5.5MB，未上传）；思维导图卡已生成（"萌龙进化论思维导图"）并导出 PNG（3128×935，最深 4 级路径中文对应）。
- 失败点（viewer 范式，非导出失败）：新版思维导图 viewer 是跨域 iframe canvas-app，无"全部展开"入口（⋮ 菜单仅"删除"），分支">"为单焦点钻取导航，任何单视图必带">"标记，collapsed_node_count 无法归零 → 不满足 contract v2。演示文稿未建（即停，未耗配额）；PicGo/交付未动；无配额阻断；图片铁律遵守。
- 系统性预警：这是 viewer 范式问题，非单视频问题；后续凡需新建思维导图的生产（新 claim＋需重生成的 retry）都会撞同一堵墙。 需用户定夺后再动队列。

## 9-10 13:20 用户定夺＋第二条派工（记录：muse-spark）
- 用户："这个肯定是要，就是确保按照规则正确产出才行" → 不放宽合同，特批选项否决；按规则实产。
- 策略：10 条导出失败项已有旧 viewer 验证过的思维导图，只重做下载导出、不新生成思维导图，可合规绕墙；配额类需新建思维导图（撞墙）排后；`1wyToyTk3D0`（视频无法导入）放最后。
- 已派 subagent（`aeae9fdb`）显式 retry 首条 `youtube-s_I07Iq_2XM`（Into the Breach，prev run-20260901153845-39506，旧 viewer 验证 81节点/4级/0折叠，卡 asset-download）：先 retry 拿新 run，再盘点三卡、补导出、上传、publish、交付；展开证明沿用历史证据＋如实标注，伪造即 fail。今日 9-10 claimed0 起计。

## 9-10 14:14 第二条回执：failed @ mind-map-expansion（记录：muse-spark）
- `youtube-s_I07Iq_2XM` retry（run-20260901153845-39506 → run-20260910135253-56675，旧失败保留 attempt_history=1）已 fail 落盘（ledger 已验）；今日 claimed1 / remaining9。证据：`runs/2026-09-10T141405+0800-breach-retry/`（report.json＋viewer-collapsed.png＋6 份 eval）。
- 本次实证：viewer 渲染根＋7 一级分支、每分支带">"折叠标记；⋮ 菜单仅"删除"；悬浮下载 2 次点击、70s+ 落盘 0 文件。9-01 旧证据仅记历史，未伪造成本次 expansion_verification；无 publish/PicGo/交付；图片纪律遵守。
- Viewer 改版后第二例，结论升级为系统性：contract v2"全部展开＋零折叠"在当前 viewer 下不可过；配额类/导出类重跑都会撞墙。今日剩余 9 claim 位建议保留，不再耗。

## 9-10 16:35 新框架等效路径探索启动（记录：muse-spark）
- 用户："如果这是 NotebookLM 整体升级，应该探索怎么在新框架下实现跟原来一样的效果" → 不等不绕，正面探索；合同不放宽。
- 事故：web_search 后端 402 Insufficient Balance（endpoint/余额配置问题，已如实记录，未伪造外部结论）；只做本地探针。
- 本机进展：headless Chrome 已重起并进工作本；确认 viewer 为 scf.usercontent.goog 跨域 iframe；已写 /tmp/frame-probe.cjs（getFrameTree→createIsolatedWorld→带 contextId 求值），验证可进帧执行。卡片坐标点击 fragile（误触表情符号面板一次），改 DOM .click() 方案。
- 已派 subagent（`a707d365`）按清单探索：开 viewer→帧内省→缩放/快捷键/右键实验→等效操作复现或穷尽证据；铁律：截图落 /tmp、单次 read 1 张、不 claim 不建卡不动选择器。待回执。

## 9-10 17:50 探索回执已验：等效路径存在（记录：muse-spark）
- 结论：viewer 内工具栏有 `Expand all nodes` 按钮，一键全展开；萌龙卡实测 DOM（svg 文本 12→74，">"→0）＋单张目视（至少 4 级，无折叠标记）双验证通过。证据 /tmp/exp-report.json、exp24-expand.json、exp28-zoomed.png。
- 关键技术：viewer 是 OOPIF，getFrameTree 不可见，直连独立 websocket（已沉淀 `automation/browser/oopif-probe.cjs`＋README 补记）；开卡用行内 button DOM.click()。
- 更正：两例 failed 的"无全部展开入口"不准确（只查了外层 ⋮ 菜单）——ledger 旧失败保留为历史，不改写；Merge/Breach 可凭此路径合规重跑过门槛。
- 约束：viewer 内下载本次 stall（时好时坏，生产仍双路径＋字节校验）；另一会话正在产 Great Level Design 条目，选择器不动，队列暂冻，剩 9 claim 位保留。

## 9-10 18:05 用户说继续：现场空闲，派 Merge 重跑（记录：muse-spark）
- 只读确认：无"正在生成/生成中"标记，无分钟级新卡，Great Level Design 摘要静置于对话区 → 判现场空闲。
- 已派 subagent（`64674a93`）显式 retry `youtube-1hdXDgCh8rw`（prev run-20260904044845-6015）：先确认选择器无争用；复用总结＋已验证信息图；思维导图走 Expand-all 新步骤；演示文稿新建；上传/publish/交付。铁律同前。

## 9-10 19:00 Merge ready＋已交付（首条产出），派 Breach（记录：muse-spark）
- triple验：ledger ready34/failed25（`youtube-1hdXDgCh8rw` run-20260910181916-43520，history=1）；inbox `2026-0910-1857-design-fundamentals.json`（8243B）；远端 `a59f087` 发布＋`3ece40a` 合并推送。四件：总结1796＋边界586；信息图 2752×1536；思维导图本 run Expand-all（74文本/0折叠/目视4级）＋新鲜导出 3278×5937；12页 deck CRC clean。PicGo 4/4 SHA 一致未改设置。今日 claimed2/remaining8。
- 现场教训：checkbox 索引漂移（label 原子＋重查）；dlto headless 无效（~/Downloads 即时搬运）；deck 按钮曾跳新本（重试 stayed）；误建空白本 08729983 未动留待定夺。
- 已派 subagent（`407efe78`）显式 retry `youtube-s_I07Iq_2XM`（prev 用最新 run-20260910135253-56675）：同 recipe＋教训；先确认现场无争用。
