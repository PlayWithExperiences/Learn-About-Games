# ProjectProgress

更新于 2026-09-24T12:20:00+08:00 · 记录者 DSH agent

## 1218 收集端收官：3 条交付，deck 限流触发 quota_block 停止

决策：無涘（2026-09-20 常规批次默认执行授权：每日 ≤10 distinct claim、串行 1、自动重试 0、同服务、无付费） ｜ 记录：DSH agent ｜ 2026-09-24T12:20:00+08:00

- 上午 1130 的 `browser-notebook-access` 阻塞经無涘确认环境已恢复后重跑：隔离 Chrome 正常落到 `notebook.google.com`，长期本 `2ce16a4b…` 可编辑，Studio 126 卡、deck/chat 三探针全过。
- 本批 attempted 4 / **ready 3 / remote_delivered 3** / failed 1 / skipped 6；当日 claim 用 4（含失败 1）、**剩余 6 未动**；ledger 无遗留 generating。
- 交付：`youtube-eZfj7LEFT98`（SimCity 探索 → `2026-0924-1144-leadership-creative-direction.json`，导图 45 节点）、`youtube-63UOLVP4dYk`（Retro/Grade 复盘 → `2026-0924-1159-game-feel-feedback.json`，47 节点）、`youtube-lH7gL3ivgFA`（SpaceChem 复盘 → `2026-0924-1218-production-iteration.json`，62 节点）；导图均为全部展开 3 级折叠 0，三件皆后台导出 + sha256 回读一致，远端逐字节核对通过（一次推送成功）。
- 失败：`youtube-A7ejh3YUbac`（Mark of the Ninja）导入标题长驻 URL 占位、隔离无唯一匹配，记 per-candidate failed，不自动重跑。
- 第 5 条 `youtube-iVBCBcEANBc` 在 claim 前 deck 门被限流（“此内容将在几小时后生成”，`claim_consumed=false`，未写 ledger）→ 按 skill 记 `quota_block(deck)` 并停止当天剩余批次。
- 浏览器已关，无残留进程。未写 PKM、未建 Issue、未触发 Daily Check-in、未发布网站。证据：`~/.local/state/learn-about-games/notebooklm-daily/runs/2026-09-24T113000-retry2/`（preflight.json、browser-readiness.json、report.json）及各条目 `runs/2026-09-24T*-item-*/` 目录。
- 另：無涘指正——阻塞轮次应明确报失败而非写成正常完成；本轮起停止原因凡阻塞一律记 `result: FAILED/BLOCKED` 语义，本次成功记 `SUCCESS`。

更新于 2026-09-24T11:15:00+08:00 · 记录者 DSH agent

## 1130 收集端：CDP 已恢复但工作台仍不可写，未领取候选

- 只读 preflight 为 `ready_to_claim`：目录候选 2454、在列 10、当日已 claim 0、剩余 10；首条 `youtube-eZfj7LEFT98`；未改写 ledger。
- 浏览器就绪是 `unavailable`：带 `LAG_CHROME_ARGS="--disable-features=LocalNetworkAccessChecks"` 的隔离 Chrome 能启动且 CDP `9222` 可达（Chrome/153.0.8010.53），但长期本直链与 `notebooklm.google.com/` 均停在 `https://notebook.google/?location=unsupported` 营销页（`Gemini Notebook`）；`nblm-studio-list` 报 `NO_PAGE_TARGET`，来源面板与 Studio 均不可验证。直连 curl 亦 `302 → https://notebooklm.google?location=unsupported`，非单纯 automation 匹配问题。
- 本轮 attempted 0 / ready 0 / remote_delivered 0 / failed 0 / skipped 10 / remaining 10；未 claim、未调用 NotebookLM、未上传或交付，也未写 PKM、建 Issue、触发 Daily Check-in 或发布网站。浏览器已关，无残留进程。
- 停止原因：`browser-notebook-access`。与今日 0732（CDP 失联）及 0823（旧本只读、同一 unsupported 落点）同源：当前无可写工作台。新增发现：全部步骤脚本硬匹配 `notebook.google.com`，而服务端现落点为 `notebook.google`/`notebooklm.google`；下一批前先评审域名迁移与可写本恢复，再做新的当日预检。
- 证据：`~/.local/state/learn-about-games/notebooklm-daily/runs/2026-09-24T113000-manual/`（preflight.json、browser-readiness.json、report.json）。

更新于 2026-09-24T07:34:13+08:00 · 记录者 codex

## 0732 收集端：CDP 启动后失联，未领取候选

- 只读 preflight 为 `ready_to_claim`：目录候选 2454、在列 10、当日已 claim 0、剩余 10；未重新预检或改写 ledger。
- 启动带既有 `--disable-features=LocalNetworkAccessChecks` 的隔离浏览器后曾记录 `BROWSER_UP`，但 CDP `9222` 随即不可连接；deck、chat 与 state 三个零配额探针均为 `fetch failed`。因此浏览器就绪是 `unavailable`，不能证明 NotebookLM 页面可编辑。
- 本轮 attempted 0 / ready 0 / remote_delivered 0 / failed 0 / skipped 10 / remaining 10；未 claim、未调用 NotebookLM、未上传或交付，也未写 PKM、建 Issue、触发 Daily Check-in 或发布网站。
- 停止原因：`browser-notebook-access`。证据与结构化报告：`~/.local/state/learn-about-games/notebooklm-daily/runs/2026-09-24T073229+0800-automation/`；下次先恢复并验证 CDP 浏览器通道，再做一次新的当日预检。

更新于 2026-09-23T12:10:00+08:00 · 记录者 DSH agent

## 1210 收集端收官：同名缺陷已修，3 条交付，deck 节流触发 quota_block 停止

决策：無涘（先修 runner 再跑批；常规批次默认执行授权：每日 ≤10 distinct claim、串行 1、自动重试 0、同服务、无付费） ｜ 记录：DSH agent ｜ 2026-09-23T12:10:00+08:00

- 修：`find_new_card`（基线 surplus 计数 + 未读优先 + 最年轻年龄）定位新卡并给出同名匹配序号，`wait_for_card` 回传 `(title, match_n)`，四件导出脚本支持 `--match-n`（默认 1，旧行为不变）。提交 `96171be`；全量单测 255 通过（+3 同名回归）；本机复演 0732 同名用例由 absent 转为 ready/match_n=1。
- 跑：preflight ready_to_claim（剩余 7）；浏览器可用（Studio 117 卡、deck/chat 可用）。attempted5 / **ready3 / remote_delivered3** / failed2 / skipped1；全日 claim 8/10；ledger **63 ready / 56 failed / 0 generating**。
- 交付：`youtube-UCtSk6wcMIo`（古墓丽影重启 → `2026-0923-1132-collaboration-teams.json`，blob `699afca`）、`youtube-vrxz3s0L8F8`（视觉小说叙事 → `2026-0923-1149-narrative-expression.json`）、`youtube-6uX6ye66NK0`（五大人格 → `2026-0923-1205-design-fundamentals.json`）；导图均为全部展开 3 级折叠 0（40/43/35 节点），三件皆后台导出 + sha256 回读一致。
- 首件首推被远端消费端 `pkm-index.json` 提交拒绝；合并后**只重跑交付脚本**（未重调 NotebookLM），远端 HEAD 一致。后两件一次推送成功。
- 失败：两条 isolate-source（`McIXKUujg8Y`、`nP5ypIUmpz0`）导入标题为 URL 占位、隔离匹配失败；同签名两次，疑似来源元数据未解析，非 runner 回归（同批另三条正常导入），计 per-candidate failed，不自动重跑。
- 第 6 条 `eZfj7LEFT98` deck 明确节流（几小时后生成，`claim_consumed=false`，未写 ledger）→ `quota_block(deck)` 停止当天；第 7 条未试。浏览器已关，无残留进程。未写 PKM、未建 Issue、未触发 Daily Check-in、未发布网站。
- 证据：`~/.local/state/learn-about-games/notebooklm-daily/runs/2026-09-23T1130-fixbatch/`（preflight.json、browser-readiness.json、batch-driver.log、report.json）及各条目 `runs/2026-09-23T*-item-*/` 目录。

## 1020 收集端检查：同名资产缺陷未修，未领取新候选

- preflight `ready_to_claim`（当日已 claim 3、剩余 7；在列 7 条，首条 `youtube-McIXKUujg8Y`）。本轮 attempted0 / ready0 / failed0 / skipped7；无 ledger 写、无浏览器启动、无上传交付、无 PKM/Issue/Daily Check-in/网站动作。
- 未领取原因：0732 批次 `artifact-identity` 缺陷仍未修——其后只有 docs 提交（`bf40666`），`automation/browser/cdp.cjs` 的差异是既有本地增强（clickxy/dlto），与 (icon,title) 去重无关。0732 定下的“先修复并验证资产唯一身份识别与精确导出，再继续新候选”仍有效；此时 claim 有同名错导出风险且消耗配额。
- ledger 账目沿用 0817 数据（60 ready / 54 failed），本次未动。证据在本机：`~/.local/state/learn-about-games/notebooklm-daily/runs/2026-09-23T1020-check/`（preflight.json、report.json）。
- 下一步待無涘定：修 runner（新身份信号+回归验证）后再跑批，或另行安排；三条既有 failed 不自动重跑。

## 0817 每日生产：内容校验拒绝两条，同名资产识别缺陷停止批次

决策：無涘（每日≤10次、串行1、自动重试0的既有范围授权） ｜ 记录：Codex ｜ 2026-09-23T08:16:51.419772+08:00

- preflight ready_to_claim，初始claimed0，候选10；浏览器、来源/Studio与deck入口可用，无遗留generating。复用长期Notebook，使用既有viewer兼容参数。
- attempted3 / ready0 / remote_delivered0 / failed3 / skipped7 / remaining_today7；运行级失败1。停止原因是共享资产识别缺陷，未确认配额耗尽。
- youtube-oG83i_ZvDYE：总结将讲者未见负评扩写成100%好评；信息图写禁用实时着色，而来源明确说明实时光照；content-validation拒绝上传。导图36节点/3级/折叠0，三资产已导出但不是可交付结果。
- youtube-p-8eNkUCvnw：总结合并350总数与250动画/两周，信息图又把250/两周错归给Rayman角色；原文谈Teensy。content-validation拒绝上传。导图37节点/3级/折叠0，三资产已后台导出。
- youtube-iNEe3KhMvXM：新旧两张导图同名，runner以(icon,title)去重而忽略新卡；本地调用classify_cards复现absent。停止当前runner，再用producer fail记录artifact-identity。新信息图/导图已出现，演示文稿最后仍在生成；没有导出/上传或重新生成。
- ledger回读 {'ready': 60, 'failed': 54}，无generating。没有ready发布、历史补交、PKM/Issue/Daily Check-in/网站动作。未修改生产代码和既有脏文件。
- 下一步先修复并验证资产唯一身份识别与精确导出，再继续新候选；三条failed不自动重跑。原始预检、报告、同名卡复現及私有内容证据只保存在本机：/Users/haodong/.local/state/learn-about-games/notebooklm-daily/runs/2026-09-23T073210-automation。

session 01a0cb75-f3c9-77f0-b71c-bc282af014dd
trace-user-count: 1
原始对话：dialogues/2026-0923.md「0732 （未分类）」；本机trace已保留本次用户原文，不复制私有正文到Git。


## 1200 收集端收官：解析器已修，2 条交付，deck 节流触发 quota_block 停止

决策：無涘（2026-09-20 常规批次默认执行授权：每日 ≤10 distinct claim、串行 1、自动重试 0、同服务、无付费） ｜ 记录：DSH agent ｜ 2026-09-22T11:40:00+08:00

- 先修后跑：0756 停批根因（splitter 只认“来源边界：”）已修——精确匹配优先 + 全行标题回退，5 本地用例验证；未动 ledger、未重试旧 failed。
- preflight ready_to_claim（剩余7）；浏览器可用，零配额 viewer 探针 MINDMAP_OK。证据 `runs/2026-09-22T1200-manual/`。
- attempted5 / **ready2 / remote_delivered2** / failed3 / skipped2 / remaining_today2；全日 claim 8/10；ledger **60 ready / 51 failed / 0 generating**。
- 交付：`youtube-pXGWJRV1Zoc`（Dead Space UI，导图 52 节点，blob `dc6a83a3`）、`youtube-wt2yYnBRD3U`（Journey 沙渲染，30 节点，blob `891f600f`）；皆 contract v2、全部展开 3 级折叠 0、sha256 回读一致。item3 首推被远端超前拒绝，合并后只重跑交付脚本，未重调 NotebookLM。
- 失败：两条 import-source 标题不匹配（同 URL，catalog 短标题 vs 完整导入标题，疑似匹配过严，待修，未中途改代码；不自动重跑）；一条 generation 信息图卡片明确失败。
- 第 6 条 deck 明确节流（几小时后生成，`claim_consumed=false`）→ `quota_block(deck)` 停止当天；浏览器已关，无残留进程。未写 PKM、未建 Issue、未触发 Daily Check-in、未发布网站。
- 下一步：核查 import-source 模糊匹配阈值（两条证据在 item report.json）；明日按常规批次继续（`youtube-oG83i_ZvDYE` 起）。

## 0756 每日生产：三条失败，摘要解析器误报后停批

决策：無涘（每日最多10次、串行1、自动重试0的既有授权） ｜ 记录：Codex ｜ 2026-09-22T07:57:14.595397+08:00

- preflight ready_to_claim，初始claimed0、候选10。浏览器/来源/Studio/deck可用；启动沿用已验证的LocalNetworkAccessChecks兼容参数。开始和结束均无遗留生成中ledger条目。
- attempted3 / ready0 / remote_delivered0 / failed3 / skipped7 / remaining_today7；运行级失败1。未确认配额耗尽。
- youtube-yXDEUs-RAeI / run-20260922073401-88310：导入URL行出现source error状态，未提供可选来源，isolate-source失败；未生成资产。
- youtube-a2oREGSkFgM / run-20260922073628-89292：总结、三资产已生成并后台导出；导图查看器全部展开，31节点、3级、折叠0；PPTX13页CRC通过。但信息图具体18th C.年代在当前来源中无支持，content-validation拒绝上传，producer已记failed。文件保留本机，不作为ready或交付。
- youtube-Hzt5TnynTrM / run-20260922075125-94397：来源隔离成功，回答实际有独立“来源边界”标题；共享splitter只接受“来源边界：”，误判缺失而summary失败。纯本地对照只补冒号即可拆分，证据splitter-reproduction.json；没有生产重试、没有修改代码。为避免共享缺陷继续消耗claim停止后续7条，下一步修复/验证解析器。旧failed不自动重跑。
- ledger结束58 ready / 48 failed / 0 generating；本轮无上传、ready、单文件交付或历史补交，无PKM/Issue/Daily Check-in/网站发布。
- 本机证据：/Users/haodong/.local/state/learn-about-games/notebooklm-daily/runs/2026-09-22T073237-automation/preflight.json、report.json、item-1..3/report.json、splitter-reproduction.json。私有正文与资产仅在本机运行目录，不入Git。运行约24分钟。

session 01a0c650-010b-74c3-b3ca-cf64b979c8aa
trace-user-count: 1
原始对话：dialogues/2026-0922.md「0732 （未分类）」；该文件已由本机trace采集保留用户原文。本节是本轮实际结果摘要。

## 1120 收集端收官：2 条交付，deck 节流触发 quota_block 停止

决策：無涘（2026-09-20 常规批次默认执行授权） ｜ 记录：DSH agent

- 本批 attempted 2 / **ready 2 / remote_delivered 2** / failed 0；第 3 条 deck-available 明确节流（“此内容将在几小时后生成”，`claim_consumed=false`），按 skill 记 `quota_block(deck)` 并停止当天剩余批次。全日 claim 3/10（早 1 failed + 本批 2），剩余 7 未动；ledger 早晚两条 failed 均不自动重跑。
- 交付：`youtube-8dinUbg2h70`（Braid 回溯 → `2026-0921-1044-level-spatial-design.json`，导图 47 节点）、`youtube-DVMs5_B611E`（Sims 3 个性 → `2026-0921-1101-research-player-experience.json`，39 节点）；导图均为全部展开 3 级、折叠 0，两件皆页面资产后台路径 + sha256 回读一致，远端 blob 逐字节核对通过。
- 两次首推被远端 `pkm-index.json`（消费端自有改动，零文件重叠）拒绝；合并远端后**只重跑交付脚本**（脚本识别已提交、直接 push + 回读 blob），未重调 NotebookLM，未动消费端工作区无关脏文件。
- 早 07:33 viewer 阻断根因确认：启动漏了 `LAG_CHROME_ARGS="--disable-features=LocalNetworkAccessChecks"`（运维回归）；带 flag 重启 + 零配额旧卡探针 `MINDMAP_OK` 后恢复。浏览器已关，无残留 item/driver 进程。
- 未写 PKM、未建 Issue、未触发 Daily Check-in、未发布网站。证据：`~/.local/state/learn-about-games/notebooklm-daily/runs/2026-09-21T0800-manual/`（preflight.json、browser-readiness.json、probe-artifacts/、batch-driver.log、report.json）及两条 `runs/2026-09-21T*-item-*/` 目录。

## 1030 收集端：viewer 根因找到并修复，剩余 9 条跑批中（勿另起 driver）

决策：無涘（2026-09-20 常规批次默认执行授权：每日 ≤10 distinct claim、串行 1、自动重试 0、同服务、无付费） ｜ 记录：DSH agent

- 早 07:33 那条 `failed(export)` 的根因是**运维回归，不是新缺陷**：启动自动化 Chrome 时漏了 `LAG_CHROME_ARGS="--disable-features=LocalNetworkAccessChecks"`（09-14/09-15 两次验证过的绕开），viewer 帧被 `ERR_BLOCKED_BY_LOCAL_NETWORK_ACCESS_CHECKS` 挡住（仅 shim.html）。
- 本轮零配额修复验证：带 flag 重启 headless Chrome（长期 notebook `2ce16a4b…`，无登录墙，来源 41、deck/chat 均 available），用失败条现成导图卡做探针 → `MINDMAP_OK`（55 节点、全部展开、层级 3、PNG 2664x7199 已验签名）。未 claim、未动 ledger 失败条（`youtube-6ezc_4KapiM` 仍 failed，不自动重跑；其总结/信息图内容问题也未获上传批准）。
- preflight（10:2x，只读）`ready_to_claim`：当日已 claim 1、剩余 9，在列 9 条（`youtube-8dinUbg2h70`《Braid 回溯》起按目录顺序）。证据目录 `~/.local/state/learn-about-games/notebooklm-daily/runs/2026-09-21T0800-manual/`（preflight.json、browser-readiness.json、probe-artifacts/、batch-driver.log）。
- **跑批中：`automation/run-notebooklm-batch.sh 9` 已启动（job bash-10），第 1 条 `youtube-8dinUbg2h70` 10:29 claim 并导入成功。同一时间只允许这一个 driver——启停前先确认无存活 `run-notebooklm-item` 进程（09-20 重启竞态烧掉 5 次 claim 的教训）。**
- 后续：跟进 driver 日志收尾（quota_block 即停、deck 节流只记不重试），收工后写最终报告 + sessions/dialogues 留痕 + git 备份；未写 PKM、未建 Issue、未触发 Daily Check-in、未发布网站。

## 0748 每日生产：导图查看器被阻断，未交付

决策：無涘（既有每日最多 10 次、串行 1、自动重试 0 授权） ｜ 记录：Codex

- preflight ready_to_claim，候选 10、初始 claimed_today 0；长期 Notebook 来源/Studio 与 deck 入口可用，既有 ledger 无生成中条目。
- 本轮 attempted 1 / ready 0 / remote_delivered 0 / failed 1 / skipped 9 / remaining_today 9。不是无候选，也未确认配额耗尽。
- youtube-6ezc_4KapiM（Pop-Up Arcade）/ run-20260921073319-21354：单来源隔离后取得总结并生成三张资产卡；卡片均显示 1 个来源。信息图已后台导出，但导图 viewer 仅 shim.html，正文明确提示 public page 连接 local network 被拦截，SVG 0、Expand 控件不存在，无法证明全部展开；runner 已以 export 阶段记 failed。
- 内容抽查另发现：总结省略 IKEA 桌架损坏而将移动性迭代起因归为归还借用框体；信息图把本地多人缩窄为协作。内容未获上传批准；演示文稿只有完成卡片，未导出核验。
- 为避免共享 viewer 故障继续消耗 claim，停止其余 9 条。无重试、上传、ready、远端资源交付或历史补交；未写 PKM、建 Issue、触发 Daily Check-in。ledger 回读 {'ready': 56, 'failed': 45}。
- 证据：/Users/haodong/.local/state/learn-about-games/notebooklm-daily/runs/2026-09-21T073204-automation/preflight.json、report.json、item-1/report.json、viewer-failure.txt、viewer-failure.png。私有正文仅保留本机运行目录，不入 Git。
- 下一步先修复/验证查看器访问；本条 failed 不自动重跑。生产代码和既有未提交文件未修改。


## 1320 收集端收官：resume 3/3 交付，当日 10/10 用尽

- resume 批次（`runs/2026-09-20T1240-resume/`）attempted 3 / **ready 3 / remote_delivered 3** / failed 0；单 runner 全程 verified，1145 残留 suspect 卡未碰。远端 blob 三份独立回读一致（`152ef977` / `d27c058f` / `511dd0f`）。
- 交付：`youtube-9aOrz-CHIpE`（Turing Tantrums → `2026-0920-1247-game-feel-feedback.json`，导图 53 节点）、`youtube-jARbugWnrB0`（Disney 叙事 → `2026-0920-1302-narrative-expression.json`，56 节点）、`youtube-OIOitNx9RHI`（触屏触觉 → `2026-0920-1317-design-fundamentals.json`，52 节点）；导图均为全部展开 3 级、折叠 0，三件皆页面资产后台路径 + sha256 回读一致。
- 全日：claim 10/10 用尽（早 2 failed + 1145 竞态 5 failed + resume 3 ready）；ledger **56 ready / 44 failed / 0 generating**，账目闭合。竞态 5 条与早上 2 条均不自动重跑。
- 浏览器已关。未写 PKM、未建 Issue、未触发 Daily Check-in、未发布网站。消费端（Daily Check-in 每天最多选一条）自行处理，与生产端无关。

## 1140 收集端：总结嫌疑词校验已修复，待确认后跑批

- 修掉 0730 停批的根因：总结出现“辐射4”/“Fallout”即硬失败的规则改为“触发词只是嫌疑”——命中后向同一隔离单来源追问来源原句引文，有引文即通过，否认或回避才记 `summary` 失败。验证问答只留本机 item 目录，ledger 只记 verdict，不入仓库。
- `automation/run-notebooklm-item.py` 新增 `find_suspect_terms` / `suspect_evidence_verdict` / `ask_single_source` 与 `--suspect-verdict` 自测入口；总结主路径复用同一 ask/extract 通道。新增 `tests/lib/notebooklm-summary-guard.test.ts` 6 例（含 09-20 Darkest Dungeon 误报原文复现、否认优先、回避失败、无词直通）。全量单测 252 通过（原 246）。
- 09-20 两条 failed（`youtube-errqsFUApIk` 来源不可导入、`youtube-k4ETK1C1KNs` 误报）未自动重跑，无明确授权不调用 retry。
- preflight（11:29）`ready_to_claim`：当日已 claim 2、剩余 8，候选 8 条（`youtube-VIgHW4ddHLc` 起按目录顺序）。生产批次未启动：首次真实调用前按 skill 确认范围，浏览器当前已关闭。
- 未写 PKM、未建 Issue、未触发 Daily Check-in、未发布网站。

## 1145 收集端：常规批次改为默认执行，仅异常再确认

决策：無涘 ｜ 记录：DSH agent ｜ 2026-09-20T11:45:00+08:00

- 用户批准跑满今日剩余 8 条，并授权：今后常规收集批次（每日 ≤10 distinct claim、串行 1、自动重试 0、同一 NotebookLM/PicGo/GitHub 服务、无付费操作）默认执行，不再逐批确认。
- 仍须先确认的异常：扩大数量/换服务或模型/重试与重跑 failed/任何付费操作、配额外的新增费用、偏离既有合同的新动作。
- 本轮即按此执行 8 条；09-20 两条既有 failed 仍不自动重跑（属需明确授权的重试）。

## 1240 收集端：一次重启竞态烧掉 5 次 claim，已止血并如实落账

- 1145 批次启动时，我先用 nohup 起 driver 又为改 supervised 而 kill——kill 只杀了 driver，其 item 进程存活并已 claim，随后 supervisd driver 又 claim 下一条：**两个 item 进程同驾一个浏览器**（12:29:32–12:32:43）。这是我的编排失误，不是 pipeline 缺陷。
- 后果：attempted 5 / ready 0 / failed 5 / 当日已用 7 / 剩余 3。`gDva` 在 isolate 失败（孤儿留 Bootcamp 单选，14 轮解不掉）、`Q5tyX` 在 summary 失败（composer 被争用）；孤儿 `VIgHW` 在争用下提交了信息图+导图（两卡 suspect，永不导出）；`HsmY`（summary 问到一半）、`VM7j`（claim 后数秒）被我 SIGKILL 止损。三条无 runner 记录的 claim 已用 producer fail 手工落账，原因如实写“restart race + 实际停在的阶段”。
- 止血确认：item/browser 进程零残留、driver 已停、浏览器健康（panel=true、78 卡、deck/chat available）。suspect 卡列入本批 report.json，永不导出。
- 五条 failed 不自动重跑（含被竞态污染的两条，需你明确授权才 retry）。残余 3 次 claim 按既有授权继续常规串行。
- 证据：`runs/2026-09-20T1145-batch/`（preflight.json、browser-readiness.json、batch-driver.log、report.json）。教训：下次启停 driver 前先 `ps` 确认 `run-notebooklm-item` 单实例。

决策：無涘 ｜ 记录：DSH agent ｜ 2026-09-20T11:45:00+08:00

- 用户批准跑满今日剩余 8 条，并授权：今后常规收集批次（每日 ≤10 distinct claim、串行 1、自动重试 0、同一 NotebookLM/PicGo/GitHub 服务、无付费操作）默认执行，不再逐批确认。
- 仍须先确认的异常：扩大数量/换服务或模型/重试与重跑 failed/任何付费操作、配额外的新增费用、偏离既有合同的新动作。
- 本轮即按此执行 8 条；09-20 两条既有 failed 仍不自动重跑（属需明确授权的重试）。

## 0730 每日生产：来源失败与总结误报，停止新领取

决策：無涘（每日最多 10 次 distinct claim、串行 1、自动重试 0） ｜ 记录：Codex ｜ 2026-09-20T07:40:04.446177+08:00

- preflight `ready_to_claim`，选中 10；长期 Notebook 浏览器和 deck 即时生成入口可用。
- 本轮 attempted 2 / ready 0 / remote_delivered 0 / failed 2 / skipped 8 / remaining_today 8。不是无候选，未确认配额耗尽。
- `youtube-errqsFUApIk` / `run-20260920073223-17236` 在 isolate-source 失败。回读来源错误说明为“无法导入此视频，也无法获取转写内容”；URL 卡片出现不代表来源可用。
- `youtube-k4ETK1C1KNs` / `run-20260920073447-17643` 完成单来源隔离和总结提问，脚本随后因总结含“辐射4”而记 summary failed。已打开该讲座 source viewer 确认原文确有 Fallout 4 示例；硬编码关键词匹配不能证明串源，这是已确认的校验器误报。其他总结断言尚未完整验收。
- 为避免校验器误报继续消耗 claim，停止其余 8 条。未修改生产代码，未自动重试；修复总结来源校验后再运行新候选。两条 failed 不得自动重跑。
- ledger 回读：53 ready / 39 failed / 0 generating；本轮未生成三项资产、上传、ready 发布或远端资源交付，未补交历史文件、写 PKM、建 Issue 或触发 Daily Check-in。
- 本机证据：`/Users/haodong/.local/state/learn-about-games/notebooklm-daily/runs/2026-09-20T073109-automation/report.json`、`preflight.json`、两条 item report、item-1/source-error.txt、item-2/content-check.json。私有来源正文不入仓库。

原始对话：dialogues/2026-0920.md（session 01a0bc01-e3bd-7242-b47b-0f186c0715b5；自动捕获已核对含本次用户原文与进度）。


## 1205 收集端：串行交付 3 条，deck 限流触发 quota_block 停止

决策：無涘（既有每日 10 次 claim、串行 1、自动重试 0；本批按预检顺序串行已确认） ｜ 记录：DSH agent ｜ 2026-09-19T12:05:00+0800

- attempted 4 / **ready 3 / remote_delivered 3** / failed 0（本批）；当日 claim 用 4（含早前 `youtube-hG9SzQxaCm8` failed(generation) 1）、**剩余 6 未动**；ledger 无遗留 generating。
- 交付：`youtube-58WUEtoAlSw`（Level Design in a Day → `2026-0919-1118-level-spatial-design.json`）、`youtube-38xLmlomvyE`（Galak-Z → `2026-0919-1133-game-feel-feedback.json`）、`youtube-Lu-RjxeDpU8`（Idle Games → `2026-0919-1149-balance-economy.json`）；导图全展开验证（3 级、折叠 0；35/51/65 节点），三件后台导出 + sha256 回读一致，远端 blob 逐字节一致。
- 条目 1 首次推送被远端 `a37376b`（仅改 `pkm-index.json`）拒绝；零文件重叠核对后合并（`4dffe06`），只重跑交付脚本成功，未重调 NotebookLM，未动消费端工作区无关脏文件。
- 第 4 条 `youtube-errqsFUApIk` 在 claim 前 deck-availability 门被限流（“此内容将在几小时后生成”，`claim_consumed=false`，未写 ledger）；只读重探针确认系统性，按 skill 记 `quota_block(deck)` 并停止当天剩余批次。
- 未写 PKM、未建 Issue、未触发 Daily Check-in、未发布网站。证据：`~/.local/state/learn-about-games/notebooklm-daily/runs/2026-09-19T0000-collect/`（preflight.json、item-1…4.log、report.json）及各条目 `runs/2026-09-19T*-item-*/` 目录；摘要 `sessions/2026-0919-notebooklm-collect.md`；原始对话 `dialogues/2026-0919.md`。

## 1300 收集端：卡片观测、来源身份、隔离取名、deck 捕捉四处缺陷已修并交付 3 条

决策：無涘（既有每日 10 次 claim、串行 1、自动重试 0；另明确授权恢复 2 条 failed） ｜ 记录：DSH agent ｜ 2026-09-18T14:41:19+0800

- 修复四处导致生产停摆/白花 claim 的缺陷：①`wait_for_card` 认不出「生成中」行、也不处理面板冻结/空读（09-17 卡片观测问题）；②`title_matches` 只比 token 重合度，GDC 同模板标题会误匹配（09-18 早上 Codex 停批的原因）；③隔离用的来源名取自导入时刻，元数据解析后名字已变（`youtube-lnnsDi7Sxq0` 14:25 失败原因）；④`nblm-capture-deck.cjs` 取了第一个下载事件，拿到的是缩略图而不是 PPTX。
- 每条都配了回归测试（`--wait-plan` / `--identity-check` / `--isolate-name` / capture 事件选择），全量单测 246 通过、`astro check` 0 错。
- 交付 3 条并远端逐字节核对：`youtube-NW4b6gP9_VY`（珠峰 VR，09-17）、`youtube-0zfm5_YqzYw`（独立游戏共享空间，恢复）、`youtube-mnIsv2ps31U`（Stugan，09-18）。内容验收拦下 2 处（信息图杜撰照片张数、总结把 16,000 美元统称押金并加加强词），重生成/重问后通过。
- `youtube-lnnsDi7Sxq0`（Ultima Online）恢复运行中：来源身份与隔离取名修复后已正常生成，三条产物已提交，待演示文稿与内容验收。
- 未写 PKM、未建 Issue、未触发 Daily Check-in、未发布网站。证据：`~/.local/state/learn-about-games/notebooklm-daily/runs/2026-09-17T1030-collect/`；机制见 `automation/browser/README.md` 09-17/09-18 两节。

## 1540 收集端现状：3 条已交付，Ultima Online 内容通过但卡在上传体积上限

更新于 2026-09-18T15:50:17+0800 · 记录者 DSH agent

- 已交付（远端 blob 逐字节核对）：`youtube-NW4b6gP9_VY`、`youtube-0zfm5_YqzWw`、`youtube-mnIsv2ps31U`。ledger 50 ready / 36 failed / 0 generating。
- `youtube-lnnsDi7Sxq0`（Ultima Online）：三件产物已生成并**通过内容验收**（三轮来源原句核对；第一轮两个“未出现”经定向复核确认来源确有原句），但 21,883,508 B 的演示文稿被 PicGo 的 GitHub contents API 以 400 拒绝（同日 17.2 MB 与 20.55 MB 的 deck 均可上传），故按 `failed(upload)` 留痕、未发布。换用能传更大文件的上传方式后，用 `finish-notebooklm-item.py --reuse-artifacts` 只需再开一张票即可补完，不必重新生成。
- 本段修掉的缺陷（均已加回归）：卡片观测（生成中行识别、面板冻结/空读刷新、严格读取）、来源身份（token 重合 + 字符相似度 ≥0.75）、隔离取名（隔离前按当前来源列表现算）、deck 捕捉（优先取 `.pptx` 文件的下载事件）。
- 未写 PKM、未建 Issue、未触发 Daily Check-in、未发布网站。

## 0738 NotebookLM 每日生产：来源身份误匹配，已停止

决策：無涘（既有每日 10 次上限、串行 1、自动重试 0 授权） ｜ 记录：Codex ｜ 2026-09-18T10:09:00.609192+08:00

- preflight ready_to_claim，初始 claimed_today 0，候选 10；浏览器已登录、来源/Studio 可读、存在启用的对话输入框、deck 可立即生成。ledger 无遗留 generating。
- attempted 1 / ready 0 / remote_delivered 0 / failed 1 / skipped 9 / remaining_today 9；run_failed 1。NotebookLM 总结与资产生成请求 0。
- youtube-lnnsDi7Sxq0 / run-20260918100021-62538：候选 Classic Game Postmortem: Ultima Online 被现有 source_identity_ok 错误匹配为 Classic Game Postmortem: 'Star Wars Galaxies'，在来源隔离阶段终止运行器及其子进程，并通过 producer fail 留痕。
- 本地直接调用 --identity-check 复现返回 true；候选 5 个有效词中共同模板词 classic/game/postmortem 占 3 个，恰好达到 0.6 阈值。标题词重叠不能证明来源身份。系统性缺陷未修复，本批停止，不继续消耗 claim。
- 未重试失败条目、上传、写 ready、资源远端交付、补交历史、写 PKM、建 Issue 或触发 Daily Check-in。现有浏览器由更早会话启动，未关闭；工作区已有未提交适配器改动，未覆盖或混入本轮提交。
- 证据：/Users/haodong/.local/state/learn-about-games/notebooklm-daily/runs/2026-09-18T0738-automation/preflight.json、studio.json、item-1.log、report.json。后续先修正并验证来源身份校验，再恢复新的普通候选；本条 failed 不得自动重跑。

session 01a0b1bc-752d-79a0-815e-36839a205fb4
trace-user-count: 1

原始对话：dialogues/2026-0918.md「0738 NotebookLM 每日生产」。

## 0732 NotebookLM 每日生产：卡片读取不一致

决策：無涘（既有每日最多 10 次、串行 1、自动重试 0 授权） ｜ 记录：Codex ｜ 2026-09-17T08:03:42.708102+08:00

- preflight ready_to_claim，初始 claimed_today 0、候选 10；长期 Notebook 来源、Studio、可编辑对话框及 deck 即时生成均可用；无遗留 generating。
- 本轮 attempted 1 / ready 0 / remote_delivered 0 / failed 1 / skipped 9 / remaining_today 9；run_failed 1。当前 ledger 47 ready / 36 failed / 0 generating。
- youtube-0zfm5_YqzWw / run-20260917073819-96254：单来源导入和隔离完成，总结 2486 字、边界 325 字，三类资产提交。运行器等待 900 秒后报告未出现信息图，producer 已记录 failed(generation)。
- 失败后 Studio 复查显示本条三张完成卡片；同一 studio_cards/parser 现场读取 56 张并可正确解析前三张。根因尚未确认，不能把此前读取失败解释为服务端没有产物。停止进一步 claim，以免同类观测问题重复消耗次数；未确认配额耗尽。
- 生成总结另有待核事实口径：将房东入场款统称押金、对反馈效果加上强程度表述；尚未验收。原始来源片段及生成正文仅留本机，未上传或纳入仓库。
- 未导出、上传、ready 发布、远端资源交付、重跑失败、补交历史、写 PKM、建 Issue 或触发 Daily Check-in。已有卡片不是交付证明；失败条目的后续恢复须遵守显式授权规则。
- 原始 preflight、item-1/report.json、studio-after-failure.json 和总报告：/Users/haodong/.local/state/learn-about-games/notebooklm-daily/runs/2026-09-17T073235-automation。后续先定位等待期间的卡片观测差异，再恢复生产。

session 01a0ac90-2785-7440-9095-4b17ba2ca942
trace-user-count: 1

原始对话：dialogues/2026-0917.md「0732 NotebookLM 每日生产」。

## 资源生产最新：2026-09-16 带上内容验收门，交付 3 条、拦下 1 条

决策：無涘（既有连续跑批授权：每日最多 10 次 distinct claim、串行 1、自动重试 0；未扩大范围） ｜ 记录：DSH agent

- preflight `ready_to_claim`（2454 候选、在列 9、当日已 claim 1、剩余 9）。本轮 attempted 4 / **ready 3 / remote_delivered 3** / failed 1；当日 claim 用 5、**剩余 5 未动**；ledger 47 ready / 35 failed / 0 generating。
- 交付：`youtube-oCwQtZcLrVs`（Astroneer 合成系统 → `2026-0916-1120-systems-mechanics.json`）、`youtube-djJO1XSOwuI`（星球大战 Galaxies 复盘 → `2026-0916-1254-criticism-values-history.json`）、`youtube-Mrr4lNF7-OU`（游戏产出项目实证研究 → `2026-0916-1356-criticism-values-history.json`）；三件产物上传后 sha256 回读一致、远端 blob 逐字节一致，deck 全走页面网络栈。
- **每条都在上传前做内容验收**（沿用早上 Codex 的门）：用 NotebookLM 对话索取来源原句核对统计数字/人名/机制，并目视信息图、导图与抽查 deck。验收记录写在各 item 目录 `content-review.json`。
- **验收拦下 1 条**：`youtube-Xv5EtQHZCnI`（技术美术与 VR 渲染）总结写「GPU 单帧预算约 15 毫秒」，而来源唯一表述是 "about 50 milliseconds Budget on GPU"，二次追问确认全篇无 15ms；60fps 单帧约 16.7ms 使 50ms 不可能，最可能是转写 fifteen→fifty，但那是推断不是来源事实，按合同记 `failed(content-validation)`、未上传未发布（产物留在 notebook，授权后重跑只需重生成总结）。
- **新增 claim 前对话闸门** `automation/browser/nblm-chat-available.cjs`：对话被 AI 用量限额挡住时总结阶段必然做不完，而限额只在提问时才暴露；探针只读页面、发 0 个问题，只在明确限额文案时阻断。本轮条目 2 因此在验收门等待额度恢复约 70 分钟，未浪费 claim。提交 `949caa3` 已推送；234 单测通过、`astro check` 106 文件 0 错误。
- 交付通道一次失败并已修复：条目 1 推送被拒（消费端仓库被别的进程推了新提交），核对零文件重叠后合并、单独重跑交付脚本、远端 blob 回读一致；未重新调用 NotebookLM。
- **复核方法的前提**：向 notebook 索取来源引句前必须重新隔离为单一来源（页面重载会把勾选重置为全选），否则回答会混入别的来源原句；隔离脚本打印的 `ISOLATED:` 名可作确认。
- 未重试任何既有 failed；未写 PKM、未建 Issue、未触发 Daily Check-in、未发布网站。证据：`runs/2026-09-16T1024-collect2/item-1…item-4/`；摘要 `sessions/2026-0916-notebooklm-reviewed-batch.md`；原始对话 `dialogues/2026-0916-notebooklm-automation.md`。

## 0732 NotebookLM 每日自动化：内容验收失败（2026-09-16）

决策：無涘（既有自动化范围授权） ｜ 记录：Codex ｜ 2026-09-16T07:56:34.889399+08:00

- preflight ready_to_claim，选出 10 条；今日初始 claim 0。复用长期 Notebook，已验证来源/Studio/编辑可用、没有遗留 generating；生成前后 deck 均提供立即生成，未确认配额耗尽。
- attempted 1 / ready 0 / remote_delivered 0 / failed 1 / skipped 9 / remaining_today 9。youtube-NpkLUoIgcXQ，run-20260916073357-77822，已由 producer fail 留痕。
- 总结与三类资产生成并导出；信息图 5,230,307B，导图 861,772B，PPTX 23,205,293B / 14 slides / ZIP CRC 通过。deck 使用页面网络栈取字节。文件存在与容器通过不等于内容合格。
- 内容验收失败：原来源说明 1.5 年是按每周 35 小时折算的开发工时（实际平均每周约 10 小时）；总结却把该数用于 65 万销量的统计期间，deck 第 2 页也遗漏折算条件。信息图人名亦无法从含识别错误的字幕确认。私有正文/资产仅保留本机，不纳入仓库。
- 上传前人工验收门拦下本条：上传 0、ready 0、交付 0。导图导出图已目视检查，但未补齐独立 live viewer 全展开验收，不声称完整通过。停止本轮属于内容质量检查决定，不是账号配额阻断；未重试、补交历史、写 PKM 或触发 Daily Check-in。
- 本机报告：/Users/haodong/.local/state/learn-about-games/notebooklm-daily/runs/2026-09-16T0732-automation/report.json；内容证据 item-1/content-validation.json。现有未提交历史记录及 cdp.cjs 改动不纳入本次提交。
- 下一步：新批次仍使用 preflight 新候选；本条 failed 不自动重试。建议后续强化来源事实与资产内容验收，特别是工时口径及未经证实的玩家效果。


## 资源生产最新：2026-09-15 演示文稿改走页面网络栈，交付 2 条后止于节流

决策：無涘（既有连续跑批授权：每日最多 10 次 distinct claim、串行 1、自动重试 0；未扩大范围） ｜ 记录：DSH agent

- preflight `ready_to_claim`（2454 候选、在列 8、当日已 claim 2、剩余 8）。本轮 attempted 4 / ready 2 / remote_delivered 2 / failed 2 / skipped 0，另 1 次在 claim 前被闸门拦下（0 消耗）。当日 claim 用 6，**剩余 4 未动**。
- 交付：`youtube-aX8f1lE09uY`（Albion Online 经济平衡 → `2026-0915-1213-balance-economy.json`）、`youtube-o2C4z_apu2I`（Offworld Trading Company → `2026-0915-1228-systems-mechanics.json`）；三件产物上传后 sha256 回读一致、远端 blob 逐字节一致。
- **修掉早上两条阻断**：①导图 viewer 的 `ERR_BLOCKED_BY_LOCAL_NETWORK_ACCESS_CHECKS` 以 `LAG_CHROME_ARGS="--disable-features=LocalNetworkAccessChecks"` 启动即恢复，用现成旧卡做零配额探针得 `MINDMAP_OK`（49 内容节点、折叠 0、层级 3）；②演示文稿下载控件当天连崩 5 次（停滞 0/16,685/16,686/31,408/39,985 B，有头无头都复现，含 09-14 刚成功下过的旧卡），而本机 6,000,000 B 下载完整成功 → 坏的是那条资产传输，不是下载机制。新增 `automation/browser/nblm-capture-deck.cjs` 改走页面网络栈取字节（实测 17,526,368 B、两次 sha256 一致、`unzip -t` 零错误）。
- 流水线三处修正：deck 先页面路径、失败才回退下载控件并在 `export_note` 记录实际路径；claim 前先跑 `nblm-studio-list.cjs` 归位 Studio 面板（上一条留下的查看器会让闸门报假 `unavailable`，11:21 实测把整批停在 claim 之前）；卡片上限 1200→2700s，错误卡片与"提交时无生成按钮"两处改为带真实原因失败。
- **停止原因＝演示文稿账号级容量节流**（「此内容将在几小时后生成」）：12:29 闸门仍 available，12:32 提交已不可用，同一 item 内翻转；按 skill 记 `quota_block` 语义并停止当天剩余批次，未再消耗 claim。不是无候选、不是通道失败、不是浏览器不可用。
- 失败 2 条都与 deck 有关且**不是内容失败**：`youtube-gd_Qe9uATA`（deck 服务端「未能生成演示文稿」）、`youtube-IiDPa50bgNg`（deck 节流）。ledger 44 ready / 33 failed / 0 generating。
- 未重试任何既有 failed（skill 要求显式授权，含早上两条与本轮两条）；未写 PKM、未建 Issue、未触发 Daily Check-in、未发布网站。
- 验证：234 单测通过（新增 `tests/lib/notebooklm-deck-capture.test.ts` 3 例）；`astro check` 106 文件 0 错误。证据：`runs/2026-09-15T115158-item-aX8f1lE09uY/` 等；摘要 `sessions/2026-0915-notebooklm-deck-capture-fix.md`；原始对话 `dialogues/2026-0915-notebooklm-automation.md`。

## 当前状态：Innovation Atlas 全量主张复核已上线

- runtime `dfe63a33a9b971b1efa2518275b69eb7c6ffef40` 经 [Pages run34708564937](https://github.com/PlayWithExperiences/Learn-About-Games/actions/runs/34708564937) 成功部署。云端219单测、159 Chromium通过（4条件跳过），157页。上一轮因README旧计数失败、没有部署；已修复并由此成功run收口。
- 已逐项复核现有195对象、160关系与172原证据（168原URL），补26材料，现为195/160/198。42对象、56关系补证或勘误；95关系直接来源支持、65历史综合。复核完成不等于所有历史影响都可证实。
- 补正VF→Tekken、Portal→Monument Valley、TF→TF2、VF2→VF4、MUD经AberMUD到Diku及Ultima→DQ的引用与范围；保留Magic/Dominion作者明确的反例。19条编辑比较撤去因果箭头，且观察关系徽标与其方向一致。
- 修正MazeWar1973/74、BrownBox1967–68、队伍RPG1981Wizardry、DuneII揭图与HalfLife叙事。GDC摘要/元数据不冒充完整演讲；版本、早期体验、更新日期与最早发明分开。
- 5组直接影响仍证据不足，保留已核对机制的无向比较；4原来源入口无法直接读取，但相应主张已有可读替代论证，限制逐项保留，不写成“没有影响”。
- 本地图谱检查合并76通过/20设备条件跳过，项目说明另2设备通过。CUA本地390px核验与线上回读确认；临时视口已复原。
- live总览与精确网络各195对象、精确证据索引198；新来源/关系ID、观察关联标签和README198均生效。线上从1981队伍观察跳到Wizardry成功，原版与重制边界仍可读。
- 逐项核查：docs/research/2026-09-13-atlas-full-verification.md / .json；发布回执：evidence/2026-0913-atlas-full-verification-publication.json。原始请求与过程：sessions/2026-0913-atlas-full-verification.md。

范围为当前目录全部主张，不是穷举全部游戏、地区或潜在配对。NotebookLM资源生产及其他未提交历史记录与此独立；本次只提交Atlas相关改动。后续直接推进授权持续有效，没有新增付费服务。

## 资源生产最新：2026-09-15 每日自动化阻断

决策：無涘（既有自动化范围授权） ｜ 记录：Codex ｜ 2026-09-15T07:49:42.674247+08:00

- preflight ready_to_claim；初始今日 claim 0、候选 10。当前浏览器来源/Studio/编辑可用，演示文稿闸门 available。
- 本轮 attempted 2 / ready 0 / remote_delivered 0 / failed 2 / skipped 8 / remaining_today 8；停止原因是思维导图 viewer 被 Chrome 本地网络访问检查阻断，不是配额耗尽或无候选。
- 第一条 youtube-buofGNw88rc 在 isolate-source 失败：标题已出现而 checkbox 尚未渲染。后续回读证明 checkbox 出现。增加最长 60 秒就绪等待；真实 12 来源隔离成功，第二条导入隔离通过；10 项针对性测试通过，astro check 104 文件 0 错误/警告。
- 第二条 youtube-apfNODay1_s 总结与三类卡片生成完成（均 1 来源），仅信息图成功导出。思维导图只出现 shim.html，页面明确显示本地网络连接被阻断，svg=false / expand=false；无法证明全部展开，producer 已记 failed。未改变浏览器安全设置，未继续消耗后续 claim。
- 信息图另有待核对内容：将总结中的既有 20% 预算消耗写成节省 20% 成本；未通过内容验收。总结与资产均保留本机，未上传或发布 ready。
- ledger 当前 {'ready': 42, 'failed': 31}。无遗留 generating。没有重试、历史补交、PKM 写入或 Daily Check-in 触发。
- 本机原始预检、单条错误与报告：/Users/haodong/.local/state/learn-about-games/notebooklm-daily/runs/2026-09-15T0730-automation/preflight.json、item-1/report.json、item-2/report.json、viewer-failure.json、report.json。修复仅涉及来源等待与回归测试；既有其他改动未纳入。

原始对话：dialogues/2026-0915.md「0732 NotebookLM 每日生产：2 次失败，来源就绪等待已修复」

## 上一工作段：下载修复已验证并交付 4 条


决策：無涘（既有连续跑批授权） ｜ 记录：DSH agent

- 2026-09-14T19:01–20:30+08:00：**复核 Codex 的修复，结论是他对、我先前错**。正解是 `chromiumSandbox: true`——Playwright 1.62.1 会默认再注入 `--no-sandbox`，我上次只从 `args` 删除并没有真正去掉它。实测演示文稿一次导出成功 18,559,684 B，SHA-256 `ffe24bbf…` 与 Codex 那份逐字节一致。**先前"仓库修不了、根因在 TUN/MTU"的结论已推翻并更正**（错在只验证传参意图，未验证 Playwright 实际传了什么）。
- **交付 4 条**，每条三件产物齐备、上传后逐个回读 sha256 一致、远端 blob 比对通过：`youtube-K_H6Bl4_qH0`（`2026-0914-1906-narrative-expression.json`）、`youtube-Vre9qqoEBpE`（`2026-0914-2022-design-fundamentals.json`）、`youtube--skDiuvH56E`（`2026-0914-2026-playtesting.json`）、`youtube-pa6fsPMqAmU`（`2026-0914-2028-research-player-experience.json`）。ledger **42 ready / 29 failed / 0 generating**，当日 10 次 claim 用尽。
- **修掉两个会把成功记成失败的缺陷**：①未读徽标 `未读` 被 `\w+` 并进图标（`\w` 不匹配中日韩字符），刚生成的未读卡片永远匹配不上 `ICON`，第 1、2 条因此白等 1200 秒并各花 1 次 claim——两条产物其实都已生成，本轮用既有产物补收尾、未重新生成；②deck 闸门导出后采样一次即报"按钮不可达"，实测数秒后即可用，已改为轮询。均加回归测试：**229 单测通过**、`astro check` 0 错。
- 交付通道另修一次分叉：AI-Life-Mentor `main` 与远端各有独立提交（远端 briefings、本地资源文件＋健康快照），**零文件重叠**，合并推送后逐条比对 blob，4 条全部一致。
- 批次第 4 条预检命中**真实的演示文稿容量节流**（「此内容将在几小时后生成」），claim 前闸门拦住，**未浪费 claim**。未写 PKM、未建 Issue、未触发 Daily Check-in、未发布网站。
- 证据：`runs/2026-09-14T190455-item-K_H6Bl4_qH0/` 等；摘要 `sessions/2026-0914-notebooklm-four-delivered.md`；原始对话 `dialogues/2026-0914-notebooklm-automation.md`「2030 复核 Codex 修复并交付 4 条」。


## 1805 下载修复复核（2026-09-14）

决策：無涘（要求检查并修复采集流程） ｜ 记录：Codex

- **已修复并实测通过**：旧改动只删 `args` 中的 `--no-sandbox`，但 Playwright 1.62.1 默认又加入它。现在通过 `chromiumSandbox: process.env.LAG_NO_SANDBOX !== '1'` 在实际 API 边界启用沙箱；运行中的 Chrome 参数已确认不含该开关。
- 同一长期 notebook、同一卡片 The Long Dark Narrative Blueprint，默认 `nblm-export-deck.cjs` 单次导出成功：18,559,684 B，14 slides / 14 media，ZIP CRC 与全部 slide XML 解析通过，Chrome 下载后仍可达。SHA-256 `ffe24bbfd481de6696b77e6c747031b039cacfcbfe50d1ffb34bf77e44b14437`。
- **更正旧结论**：“仓库修不了、必须调 TUN/MTU”证据不足，已被本次成功下载反驳。本次未改系统网络；沿用既有 viewer 的 LocalNetworkAccessChecks 绕开配置。不能由一次成功断言所有网络条件均无问题，也不能把旧实验视为已排除未被隔离的因素。
- 新增两项入口回归测试，直接执行真实 launch.cjs 并检查传给 Playwright 的选项，覆盖默认启用及显式禁用；已通过。
- 修复验证未 claim/retry、生成、上传、publish 或远端交付，既有 failed 未伪改为 ready。下载已保存在本机 `notebooklm-daily/runs/2026-09-14T1805-sandbox-fix/`，可供后续恢复验收；本次完成的是下载缺陷修复，不是生产交付。
- 本机证据：上述目录 report.json；完整 PPTX 留在同目录，不提交私人生成材料。

以下为早期状态，下载阻断与 TUN 根因判断已由上述复核更正。

## 1342 自动化：隔离缺陷已修，卡在演示文稿下载

决策：無涘（既有连续跑批授权） ｜ 记录：DSH agent

- 2026-09-14T11:42–13:42+08:00：预检 ready_to_claim（2454 候选、在列 9、当日已 claim 1、剩余 9）。本轮 **attempted 1 / ready 0 / remote_delivered 0 / failed 1 / skipped 0**，当日 claim 用 2，**剩余 7 未动**。
- **早上 07:34 的阻断已修**：`nblm-isolate-source.cjs` 的 `pass < 6` 是硬编码上限，8 来源的 notebook 需 7 轮才能取消 7 个非目标来源，第 7 个（Hitman）从未被点到。现改为按实测框数推导轮数、目标名**全名精确匹配**（原来传 28 字符片段，同前缀卡片会认错、未解析的 URL 卡会全部撞成同一段）、匹配数不为 1 时拒绝执行。实测 8 来源 7 轮完成隔离；同类缺陷在 `nblm-set-sources.cjs` 一并修正。
- **产物卡片曾被 UI 冻结误导**：三张卡连续 80+ 分钟显示「正在生成」，刷新后立刻显示真实标题（产物一小时前已完成）。`wait_for_card` 超时文案改为如实描述，并支持 `LAG_CARD_TIMEOUT_SEC`。
- 已生成并校验：总结 6,167 B＋边界 813 B；信息图 5,810,545 B / 2752×1536；思维导图 851,452 B / 2664×4896（折叠 0、层级 3、渲染稳定）。**停止原因＝演示文稿下载阻断**：PPTX 与 PDF 两条路径都在约 44–45 KB 处停滞，且该下载稳定导致自动化 Chrome 崩溃（本轮 5 次）；下载 host 与工作正常的图片导出相同，故非域问题。已排除节流、来源与卡片误读。演示文稿为三件必填之一，故按合同记 `failed`（阶段 deck-export），未写任何 ready/partial；产物与总结留在 notebook 与磁盘，环境修好后只需补导出与交付。
- 环境发现（已绕开）：viewer 帧报 `ERR_BLOCKED_BY_LOCAL_NETWORK_ACCESS_CHECKS`（代理把 `*.scf.usercontent.goog` 解析成 fake-IP 198.18.5.x），`launch.cjs` 新增 `LAG_CHROME_ARGS` 透传，加 `--disable-features=LocalNetworkAccessChecks` 后 viewer 正常、导出成功。根治仍需代理/DNS。`gstatic` 404 仍在，但页面可渲染。
- ledger **38 ready / 30 failed / 0 generating**。未写 PKM、未建 Issue、未触发 Daily Check-in、未发布网站。
- **建议：在 `lh3.google.com/rd-notebooklm` 下载链路修好前，不要用剩余 7 次 claim 跑新候选**——每条都会停在同一阶段。
- 证据：`/Users/haodong/.local/state/learn-about-games/notebooklm-daily/runs/2026-09-14T1140+0800-isolate-fix/report.json`；摘要 `sessions/2026-0914-notebooklm-download-blocked.md`；原始对话 `dialogues/2026-0914-notebooklm-automation.md`「1140 收集端跑批」。

### 1500 追加：修掉 `--no-sandbox`，演示文稿下载仍未解决

- 按「把问题修复后跑完」继续排查。**找到并修掉一个真缺陷**：`launch.cjs` 一直硬传 `--no-sandbox`，在 macOS 上会让 Chrome 下载路径崩溃——同一脚本同一浏览器，从本机 `127.0.0.1:8799` 下 3,000,000 B，带该参数时浏览器死亡且文件不落盘，去掉后**完整下完**。现改为按需 `LAG_NO_SANDBOX=1`。
- **演示文稿下载仍未修复**：PPTX/PDF 都在 8–59 KB 处中断（PPTX 实测 23,480 / 8,259 / 45,375 / 59,004 / 15,452 / 11,772 / 41,250 B；PDF 43,999 B）。停住后 `lsof` 无进程持有、100 秒字节数不变。
- 已用对照实验排除 7 个假设：headless 特有（有头同样失败）、选择器写错（`OPEN/MENU` 正常）、`setDownloadBehavior` bug（两种 API 一致）、本机下载整体损坏（本机 3 MB 能下完）、代理/fake-IP（`--no-proxy-server` 仍停 11,772 B）、HTTP/2 与 QUIC（`--disable-http2 --disable-quic` 仍停 41,250 B）、需拦 OOPIF（浏览器级 Fetch 证明该请求不经页面网络栈，是浏览器进程发起的下载导航）。
- 判断：属本机 TUN 网络（部分 utun 的 mtu 仅 1000–1380）对该大响应的中途切断，仓库代码修不了。建议调 TUN 的 MTU/TCP 或换出口后重试；链路一通，本条只需补导出与交付。
- 最终：ledger **38 ready / 30 failed / 0 generating**；本轮 claim 用 2，**当日剩余 7 未动**；未写 PKM、未建 Issue、未触发 Daily Check-in、未发布网站；两个失败原型工具已删除。提交 `e99d85f` 已推送。

## 0734 每日资源生产：来源隔离脚本阻断

决策：無涘（既有自动化范围授权） ｜ 记录：Codex

- 2026-09-14T07:34:07.665459+08:00：preflight ready_to_claim，候选10、当日初始claimed0；浏览器以已有持久配置启动，长期Notebook来源面板和Studio可用，演示文稿即时生成入口可用。ledger开始38 ready / 29 failed / 0 generating。
- 本轮 attempted1 / ready0 / remote_delivered0 / failed1 / skipped9 / remaining_today9；运行级失败1。唯一claim youtube-K_H6Bl4_qH0 / run-20260914073243-31674，来源导入成功，隔离失败后producer fail已落账。当前ledger38 ready / 30 failed / 0 generating。
- 根因实证：nblm-isolate-source.cjs的取消勾选循环固定pass<6；8个已选来源需取消7个，执行6次后仍选中目标与Hitman，共2个。未达到单来源要求，未发起总结/资产生成。为避免相同适配器缺陷继续消耗claim，停止批次；不是配额耗尽，不是无候选。
- 未重试失败条目、上传、ready发布、远端交付、补交历史文件、写PKM或触发Daily Check-in。后续先修复隔离循环并验证超过7来源的场景；本条failed仍需显式重跑授权。本轮未修改生产代码。
- 原始预检响应内容与报告：/Users/haodong/.local/state/learn-about-games/notebooklm-daily/runs/2026-09-14T073000+0800-automation/preflight.json、report.json；候选失败原始输出：item-1/report.json。首个preflight响应在工具输出中取得，preflight.json按该响应字段落盘，未再次预检。

原始对话：dialogues/2026-0914-notebooklm-automation.md「0730 每日资源自动化」。


## 2005 自动化：3 条「假失败」耗尽当日 claim（环境已恢复）

决策：無涘（既有连续跑批授权） ｜ 记录：DSH agent

- 2026-09-13T19:55–20:14+08:00：预检 ready_to_claim（2454 候选、在列 3、当日已 claim 7、剩余 3）。本轮 **attempted 3 / ready 0 / remote_delivered 0 / failed 3 / skipped 0**，**停止原因＝当日 10 次 claim 用尽**（`remaining_today: 0`）。
- 环境较清晨恢复：06:54–07:40 的 gstatic fake-ip／404 故障不再复现，浏览器就绪 **available**（notebook `2ce16a4b` 正文 26,107 字、来源 checkbox 6、Studio 三件控件齐全、无登录墙），演示文稿闸门 **available**；两项都在 claim 前完成。
- **三条失败是假失败**：来源卡片在元数据解析前先显示原始 URL，runner 拿 URL 与目录标题模糊匹配＝0 重叠，把**已成功导入**的来源判成错来源。复核来源面板：三条来源都在生产 notebook 中。**不是**网络、节流、配额或来源问题。
- **已修**并加回归测试：`automation/run-notebooklm-item.py` 新增 `source_identity_ok()`（URL 卡片只认精确 video id）＋ claim 前只读来源查找；`tests/lib/notebooklm-source-identity.test.ts` 走 `--identity-check` 调真身，6 用例（含反向对照）通过。全量 **225 单测通过**（原 219）、`astro check` 0 错。
- ledger **38 ready / 29 failed / 0 generating**（账目闭合，无孤儿 claim）。三条失败的来源已在生产 notebook，重跑只需生成＋导出，不再碰导入。未产出 ready／上传／交付；未写 PKM、未建 Issue、未触发 Daily Check-in、未发布网站。
- **下一步需你明确授权**：重跑这三条 failed（skill 规定 failed 重跑须显式授权），且须等北京时间自然日翻转 claim 上限。上一场遗留的 `youtube-gPV0qmyGs-o` 补演示文稿收尾同样未做。
- 证据：`/Users/haodong/.local/state/learn-about-games/notebooklm-daily/runs/2026-09-13T1955+0800-import-identity-fix/report.json`；摘要 `sessions/2026-0913-notebooklm-batch.md`「1955 自动化」；原始对话 `dialogues/2026-0913-notebooklm-automation.md`「1955 收集端跑批」。

## 0740 自动化：NotebookLM 页面不可用

决策：無涘（既有自动化授权） ｜ 记录：Codex

- 2026-09-13T07:40:24+08:00：preflight ready_to_claim，今日已claim7、剩余3；本轮 attempted0 / ready0 / remote_delivered0 / candidate failed0 / run failed1 / skipped3。
- 当前ledger38 ready / 26 failed / 0 generating。最新失败记录称04:46节流闸门已开，05:06重试后浏览器崩溃；这是既有记录，不计入本轮尝试。
- 当前最小浏览器检查：probe退出1，slides create button not reachable；NotebookLM首页readyState complete但正文长度0、来源checkbox0、Studio不可见。browser-notebook-access unavailable，在claim前停止；不将通道失败写成无候选。当前未确认配额耗尽。
- 未claim/retry、生成、上传、交付、改ledger、写PKM或触发Daily Check-in。修复浏览器后才可继续；旧失败不自动重试。
- 原始预检与报告：/Users/haodong/.local/state/learn-about-games/notebooklm-daily/runs/2026-09-13T073456+0800-automation/preflight.json、report.json。
- 原始对话：dialogues/2026-0913-notebooklm-automation.md「0734 每日资源自动化」。


### NotebookLM 生产：2026-09-13 01:15 +0800（最新）

更新于 2026-09-13 01:15:00 +0800 · 记录者 DSH agent

- 用户授权连续跑批（「跑吧，后续也无需确认」）。本轮 attempted 4 / ready 2 / 远端交付 2 / failed 2 / skipped 4；当日 claim 用 6（含第 2 条的 2 次 bug 重试），**remaining 4 未消耗**。
- 交付：`youtube-hc8_W2PERZE`（HITMAN 关卡设计）→ `2026-0913-0044-level-spatial-design.json`（远端 blob `b9b5d75d…`）；`youtube-U-dtYFPoDlU`（叙事导师计划）→ `2026-0913-0102-narrative-expression.json`（远端 blob `b533aa35…`）。均经 fetch 后 blob 比对。ledger **38 ready / 26 failed / 0 generating**。
- **停止原因＝演示文稿容量节流**：演示文稿对话框出现「此内容将在几小时后生成。或者，升级可缩短等待时间。」且「立即生成」按钮消失（两次独立打开均复现）。演示文稿是必填三件之一，剩余候选都无法完成，故批次整体停止，未再消耗 claim。
- 流水线已工程化：新增单条端到端 `run-notebooklm-item.py`、串行跑批 `run-notebooklm-batch.sh`、只补导出发布的 `finish-notebooklm-item.py`、`notebooklm-split-answer.py`，以及 `automation/browser/` 下 11 个步骤工具。修掉 7 个会伪装成其他症状的致错点，最严重的是 **Studio 生成对话框有独立来源选择器且默认全选**，会静默产出「基于 N 个来源」的串源产物（已删卡重生成，并加提交前「必须 1 个来源」断言）。
- `youtube-gPV0qmyGs-o`（叙事驱动留存）信息图与思维导图已生成并留在 notebook，节流解除后只需补演示文稿再用 finish 脚本收尾；`youtube-ykPZcG8_mPU` 在停止时刚导入来源、无产物，已按阶段记 failed。
- 未写 PKM、未建 Issue、未触发 Daily Check-in、未发布网站内容。
- **节流范围已确认＝账号级**：长期本 `880ad454` 同样被节流，换 notebook 无用；01:16–01:26 连续 6 次采样均未恢复（文案「几小时后」）。已新增 **claim 前闸门** `nblm-deck-available.cjs`：不可用则不领取（实测 claimed_today 前后均为 6，未浪费 claim）。
- 证据：`/Users/haodong/.local/state/learn-about-games/notebooklm-daily/runs/2026-09-13T0115+0800-batch-report.json`；摘要 `sessions/2026-0913-notebooklm-batch.md`。

### NotebookLM 生产：2026-09-12 23:59 +0800

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
