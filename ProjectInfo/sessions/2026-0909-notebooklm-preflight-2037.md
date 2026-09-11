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

## 9-10 21:25 Breach ready＋已交付，派 Fallout4（记录：muse-spark）
- triple验：ledger ready35/failed24（`youtube-s_I07Iq_2XM` run-20260910190705-59640，history=2）；inbox `2026-0910-2119-systems-mechanics.json`（11460B）；远端 `180ffbb` 发布＋`dfb9392` 合并推送（首推被顶、变基被他人脏改挡，改 merge，未碰他人文件）。四件：总结3178＋边界459；信息图 2752×1536 中文；思维导图复用 9-01 中文旧卡（Expand-all：162文本/0折叠/目视4级，PNG 3507×14334）；14页 deck。PicGo 4/4。今日 claimed3/remaining7。选择器恢复 52 全选。
- 新教训（记入通道记忆）：①新建思维导图节点全英文（纯中文主题亦然，机制未明）→ 后续优先复用旧中文卡；②"列表不可见≠不存在"第二例（旧三卡被虚拟列表隐藏）→ "找不到"结论前换三种以上定位方式。
- 已派 subagent（`d0a5cebb`）显式 retry `youtube-QBAM27YbKZg`（Fallout 4 模块化，prev run-20260830144012-99867，疑有 9 天前旧卡"开放世界模块化关卡设计指南"）：同 recipe＋新教训＋语言红线（新建全英文即 fail）。

## 9-10 22:37 QBAM fail＠chat-thread-stuck，主会话接管收尾（记录：muse-spark）
- 子智能体中期后未等指令即收工（run 悬 generating、面板 Fallout-only、草稿 174 字残留）。主会话接管：reload 恢复 52 全选＋清草稿（已验 52/52/draft0）；producer fail 落盘（run-20260910215530-11420，failed_at 22:37:21，reason 完整，history=1；一次重复 fail 调用被正确拒绝，无污染）。全库 ready35/failed24，并发位释放。
- salvage：对话历史无 Fallout 总结（仅 XCOM＋Breach 拒文）；旧三卡三定位法确认缺失。QBAM 需新总结＋三件全新建，但 Chat 线程粘 Breach（新请求被拒，pill/menu/新对话入口均失效）→ 本子内无法合规开工，非单条问题。
- 复用面速查（loaded DOM）：Heaven/Vault、Sunless、Saints Row、Deus Ex、League 有 mentions；Titanfall/Horizon/Celeste 无。mentions≠总结，具体 salvage 留待逐条 retry 时深查。
- 下一步需用户定夺：A 磨旧本 Chat 换源（低概率，不耗 claim 但烧时间）；B 轮换新本（单本承接剩余队列，需明确授权＋记录原因，复用策略变更）。

## 9-10 22:45 用户授权轮换，新本已建（记录：muse-spark）
- 轮换原因：旧本（880ad454）Chat 线程粘住 Breach 无法切换来源，新对话入口失效，逐条单源隔离不可验证；用户明确授权开新本承接剩余队列。单本复用、不逐条建本；旧本 52 源保留不动。
- 新本：https://notebook.google.com/notebook/2ce16a4b-c41a-42f4-8e03-d387494cdd17（"创建笔记本" DOM 点击建成，落地 addSource 态）。

## 9-11 12:35 下载通道判别探针：环境级故障实锤（记录：muse-spark）
- QBAM 新本 fail 已验（ledger failed history=2，证据 runs/2026-09-11T111848+0800-fallout-newnb/）。
- 主会话亲测（零配额，复用 Merge 旧卡）：viewer 打开正常（MindmapApp OOPIF 存活）→ Download 点击成功 → /tmp/dlprobe 75s+ 零文件 → 浏览器随即崩溃（CDP fetch failed×3）；~/Downloads 留 `Unconfirmed 80752.crdownload` 177KB 残体（12:33）。与 QBAM 的 1.1MB stall 同签名。
- 结论：viewer 下载即崩 headless Chrome（153.0.8010.36），与条目无关；继续烧 claim 必败。队列暂停，新 claim/重试一律停。候选出路（零配额）：Page.printToPDF 直取 OOPIF 渲染字节（绕下载链路）；headed 模式（需显示器，会弹窗口）；降级 Chrome；等 NotebookLM/Chrome 修复。
- 诊断 registra：内存 free 约 760MB（偏紧但未 OOM）；磁盘 86%/62Gi；无 crashpad 落盘；自动化 profile 与用户 Chrome 隔离（未碰用户进程）。

## 9-11 12:57 printToPDF 不可用，SVG 链路走通（记录：muse-spark）
- `Page.printToPDF`/`captureScreenshot` 在 OOPIF 上均不可用（仅顶层 target 可执行）——此路证死。
- 新链路走通（Merge 旧卡，零配额）：Expand-all → 帧内取 SVG＋内联 computed 样式＋getBBox viewBox → 去 15 个纯`<`/`>`导航文本（59 内容节点保留）→ 独立 Chrome 渲染 2664×4428 PNG（510KB），单张目视：整树＋中文清晰＋零折叠标记。证据 /tmp/mm-render5.png、mm-clean.svg。工具记 automation/browser/README.md。
- 待用户点头后，用此链路（export_note 如实标注 SVG-extract＋raster）续跑 QBAM 新本 retry；信息图 viewer 同理（若 SVG/DOM 渲染）或顶层 clip＋DSF。

## 9-11 13:05 用户采用 SVG 链路，派 QBAM 新本续跑（记录：muse-spark）
- 已派 subagent（`6b37b353`）retry `youtube-QBAM27YbKZg`（prev run-20260911102250-33885）：复用来源/总结/已验证信息图；信息图＋思维导图走 SVG 链路（严禁点下载）；语言红线；publish＋交付；export_note 如实标注方法。

## 9-12 00:08 上一棒异常终止，派接力（记录：muse-spark）
- 状态：`youtube-QBAM27YbKZg` run-20260911205631-38417 仍 generating（9-11 20:56 claim）；9-12 新自然日 claimed0/10；浏览器已死。交接语"配置框已开"因浏览器死而不可靠。
- 已派 subagent（`e57699`）沿用旧 run 接力：重起浏览器→盘点新本实际→续跑（SVG 链路、语言红线）；不新 claim 不 retry。

## 9-12 01:15 主会话亲自下场：断点记录（记录：muse-spark）
- 背景：两棒子智能体连续异常终止；run-20260911205631-38417 仍 generating（保持，不悬空无人认领——主会话接管中）。
- 已确认银行资产（新本 2ce16a4b）：来源 1 个 Fallout；对话区有总结＋边界（9-11）；信息图卡"游戏模块化关卡设计解析"已生成，viewer 打开可见完整中文手绘（shot 存证 /tmp/lag-state.png），自然 2752×1536，lh3 直链需凭证（curl 56、页内 fetch 被 CORS 拦）。
- 通道结论：viewer 下载必崩（实锤）；clip 截图链路可用（scale1/2 出字节）但 modal 会无故关闭＋Studio 虚拟列表反复吞卡（" Building" 匹配落 title、真卡靠 chip/文本枚举），坐标/行点击五次三番误触（表情面板、误建空白本 cf1899e8——未动任何来源，已离开）。
- 下一步（续跑 recipe）：开 viewer→立即 clip（同链路零间隔，rect 现测现用，shot 先验）取信息图字节→单张目视→建思维导图（中文，语言红线）→Expand-all→SVG 链路→建 deck→上传→publish（沿用 run）→交付。浏览器若死直接重起。
- 教训：cdp.cjs eval 抛异常即写文件崩（他人文件的已知坑，动前先包 try 返回字符串）；卡片行点击禁用坐标，统一"文本枚举→行内 button DOM.click→URL 不变"三验。

## 9-12 01:45 信息图字节战：证死两条，收兵（记录：muse-spark）
- lh3 直链：curl 56；页内 fetch 无凭证 400/1555B、有凭证 CORS "Failed to fetch"——直取证死。
- 缓存取证：大文件为压缩数据，无 PNG 魔数（4 字节命中系偶然），证死。
- clip 链路可用但 modal 存活窗口短（开后数十秒自关，原因未明；与 viewer 下载崩溃不同，截图本身不崩）。最佳单次：race4x 局部大图（右半 crisp 中文手绘）；native rect（g 缩放锁＋视口撑大）曾一次打出 2752×1536 但内容偏移（app 回写 transform）。
- 现场：run-20260911205631-38417 generating（主会话持有）；新本源/总结/信息图卡俱在；mindmap/deck 未建；浏览器活着停在新本。
- 续跑 recipe（晨起）：开 viewer→6s 内 clip（固定 rect 150,135,980,500 scale3 先验内容）→ 若 modal 配合则拼大图/调 g 锁；建思维导图（语言红线）→SVG→deck→上传→publish→交付。
