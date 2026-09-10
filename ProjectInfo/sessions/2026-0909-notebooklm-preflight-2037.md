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
