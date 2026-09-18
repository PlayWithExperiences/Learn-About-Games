# NotebookLM 每日资源生产

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

## 1030 卡片观测两缺陷已修，交付 2 条、恢复 1 条（跨日收口于 09-18）

决策：無涘（既有每日最多 10 次 distinct claim、串行 1、自动重试 0 授权；另明确授权两条 failed 的恢复/重跑方式） ｜ 记录：DSH agent（09-17 10:21 → 09-18 13:30 同一工作段）

- **0732 的读取差异已定位，不是一个原因是两个**：①生成中的产物行不是成品卡形状——它渲染成 `sync 正在生成信息图… 基于 1 个来源`（图标 `sync`、类型名在标题里），旧 `wait_for_card` 先比图标、不匹配就 `continue`，于是「正在生成」分支对自己那条产物永远不可达，超时文案变成"没有出现这种卡片"；②Studio 列表会与服务器脱节：07:58 的整页文本仍显示 07:46 的快照（信息图 07:47 已完成），而当日晚些时候另一次等待连续 20 分钟读到**空数组**（`studio-panel` 在、`artifact-item` 为 0），两次都等到超时。
- 修复（`automation/run-notebooklm-item.py`、`automation/browser/nblm-studio-list.cjs`）：`classify_cards()` 先按类型词识别生成中/失败行；列表指纹 240s 不变或读到空列表即强制重载页面（超时前再刷新一次，重载会重置来源勾选、只在三条产物提交后发生并留痕）；`studio_cards()` 读不到列表或面板未渲染时抛 `studio-read`，claim 前严格读一次、读不到就不领取（rc=3，不消耗 claim）；空基线直接拒绝。回归 `tests/lib/notebooklm-card-wait.test.ts` 6 例（用 `--wait-plan` 回放 09-17 真实卡片串）。
- **第二个真缺陷（当日第二条 failed 的原因）**：来源元数据未解析时卡片名是原始 URL，隔离脚本 09-14 改成全名精确匹配后，runner 传的 video id 匹配不到任何来源 → `youtube-mnIsv2ps31U` 在 isolate-source 失败并花掉 1 次 claim。修法：隔离脚本支持按精确 video id 匹配 URL 卡（仍拒绝前缀/片段匹配），并加回归 `tests/lib/notebooklm-isolate-match.test.ts` 4 例。另把 `nblm-generate-artifact.cjs` 里那份硬编码 8 轮的隔离循环改为调用独立隔离脚本（重载后 24 个来源只剩 16 个被取消、生成被拒的那次就是这么来的）。
- 交付 2 条，三件产物上传后 sha256 回读一致、远端 blob 逐字节核对：`youtube-NW4b6gP9_VY` → `2026-0917-1304-game-feel-feedback.json`（blob `811ad374…`）；`youtube-0zfm5_YqzYw` 恢复 → `2026-0917-1328-game-feel-feedback.json`（blob `53f70503…`）。思维导图的 `expansion_verification` 现在取导出脚本实测值（depth 3、折叠 0、51/48 个内容节点、渲染稳定），不再写死。
- **内容验收拦下 2 处**（每条上传前当场核对来源原句）：第一条信息图写「30万张高分照片」，两次 grounded 追问 + 一次转写原文 grep 都证实来源只说 "a lot of photos"，重生成后通过；恢复条目沿用了 09-17 的总结，把房东 16,000 美元统称押金、给反馈效果加了加强词，按同样口径重问一次总结后通过。遗留两处措辞级简化（思维导图节点仍称「1.6万美元高额押金」、信息图用 3 个钱袋表示 4 位创始人），金额与作用正确，已写入该条 `content-review.json`。
- 交付通道预置修复：AI-Life-Mentor `main` 与 origin 各有 1 个独立提交（`.claude/trace-health.json` 快照与机器人的 `pkm-index.json`，零文件重叠），合并后推送并核对 blob；用户未提交的 CV 等改动未被纳入。
- 计数：09-17 当日 claim 用 4（07:38 失败、10:32 交付、13:05 恢复 retry、13:28 失败）；09-18 用 1（13:02 retry `youtube-mnIsv2ps31U`）。未写 PKM、未建 Issue、未触发 Daily Check-in、未发布网站。
- 证据：`~/.local/state/learn-about-games/notebooklm-daily/runs/2026-09-17T1030-collect/`（preflight、item-1、recover-0zfm5_YqzWw、item-2、item-2-retry、各 `content-review.json`）；机制说明见 `automation/browser/README.md` 2026-09-17 两节。
- 下一步：`youtube-mnIsv2ps31U`（retry 后三条产物已提交）走内容验收与交付；其余候选按既有授权串行继续。

session 8ae5270c-73a8-4a98-8abb-e9d3d5443982
trace-user-count: 4

原始对话：dialogues/2026-0917.md「1030 收集端：先修卡片观测再恢复生产」

## 1300 收集端续修：来源身份、隔离取名与 deck 捕捉（09-18 下午）

决策：無涘（既有每日 10 次 claim、串行 1、自动重试 0；另明确授权恢复 `youtube-mnIsv2ps31U` 与 `youtube-lnnsDi7Sxq0`） ｜ 记录：DSH agent

- **补修今早 Codex 记录的系统性缺陷（来源身份误匹配）**：`title_matches()` 只比 token 重合度，
  `Classic Game Postmortem: Ultima Online` 与 `Classic Game Postmortem: 'Star Wars Galaxies'` 共享
  classic/game/postmortem 恰为 5 分之 3（=0.6 阈值）→ 被当成同一来源。现要求字符级相似度
  （`difflib` 比值）同时 ≥0.75：实测生产 notebook 现有 25 个来源与其候选全部为 1.0，历史记录里的
  标点/副标题差异样本为 0.81，而误匹配样本为 0.68 —— 两侧各留约 0.06 余量。
- **新缺陷一（隔离取名）**：导入时卡片名是原始 URL（`isolate_name()` 返回 video id），但导入与隔离之间
  元数据已解析成真实标题，于是隔离脚本按精确名/精确 video id 都匹配不到 → `isolate-source` 失败、白花一次 claim。
  新增 `resolve_isolate_name()`：隔离前用当前来源列表现算，恰好一个匹配才继续（URL 卡给 video id、已解析卡给真实标题）。
- **新缺陷二（deck 捕捉取错下载事件）**：`nblm-capture-deck.cjs` 原先只取第一个
  `Browser.downloadWillBegin` 事件，实测拿到的是 128×128 PNG 缩略图；改成优先选文件名以 `.pptx` 结尾的事件后，
  一次取回 17,206,190 B 合法 PPTX。回退的 viewer 下载当天以 ~1.2 KB/s 前进（835 KB/20 分钟），不可用作交付路径。
- 回归：`tests/lib/notebooklm-source-identity.test.ts` 增至 10 例（误匹配、同模板正确单集、隔离取名三态）；
  全量单测 246 通过；`astro check` 0 错。
- **交付 1 条（09-18）**：`youtube-mnIsv2ps31U`（Stugan 非营利游戏加速器）→
  `notebooklm-resources/2026-0918-1423-narrative-expression.json`，三件产物上传后 sha256 回读一致
  （信息图 6,359,318 B、导图 1,042,240 B、演示文稿 17,206,190 B），远端 blob `88d30b62…` 逐字节核对。
  内容验收做了两轮 grounded 追问，逐条核对了 23 人/8 周/15 万美元预算/不收股权/1978 年瑞典首个商业游戏命名/
  Warhol Factory 与 Oulu 工作坊/Prism 与 Clint Siu/Mojang 导师/90 秒视频申请/YouTuber 拒绝等来源原句。
- 期间两次交付通道分叉（机器人推送 `pkm-index.json` 与简报提交，零文件重叠），合并后推送并核对 blob；
  用户未提交的 CV 等改动未纳入。
- 当日 claim：`youtube-lnnsDi7Sxq0` 10:00（Codex）、`youtube-mnIsv2ps31U` 13:02、13:52（其中一次 deck 修复后恢复）、
  `youtube-lnnsDi7Sxq0` 14:25、14:33（隔离取名修复后恢复）。`youtube-lnnsDi7Sxq0` 恢复运行中（三条产物已提交，待演示文稿与验收）。
- 证据：`runs/2026-09-17T1030-collect/`（recover-stugan 含 `content-review.json`、recover-ultima、item-2-retry、各日志）；
  机制说明见 `automation/browser/README.md` 2026-09-18 一节。

## 1540 Ultima Online 恢复：内容通过验收，卡在上传器体积上限

决策：無涘（授权恢复 `youtube-lnnsDi7Sxq0`） ｜ 记录：DSH agent

- 恢复过程连撞两个已修缺陷（来源身份误匹配、隔离取名取自导入时刻）后跑通：单来源导入/隔离、总结 2512 字＋边界 333 字、三件产物生成、导图 viewer 全部展开核验（60 内容节点、折叠 0、层级 3、渲染稳定）。
- **内容验收通过**：三轮 grounded 追问核对来源原句——33 MHz/16MB/1MB 显存/260MB 硬盘、25 万美元原型预算、5 美元付费测试与 3 万份预期/5 万报名、首月破 100 万份、8 人 MUD 团队、Lord British 走进火墙、5 楼走廊与恒温器导致的戴手套写代码；**第一轮把「30/70 GaaS 分工」和「7 次系统重构」判为“未出现”，第二轮定向追问查出原句**（`30 percent is the game and 70 percent is a service layer`、`seven complete redesigns of flagging systems notoriety systems karma systems bounty systems`）——单次否定追问不能当作“来源没有”，要定向复核。玩家名 `Rainz` 在转写里拼作 `reigns`，属同人异拼。
- **导图栅格化一次空白**：第一次导出的 PNG 只有彩色节点框、没有任何文字（422,162 B），而导出脚本自身的门槛（内容节点数、折叠数、渲染稳定性）全部通过；同一份 SVG 重渲染仍然空白，重新导出一张后正常（1,098,499 B，2664×7726）。已用合格图替换待上传文件，并把 `finish-notebooklm-item.py` 增加 `--reuse-artifacts`（已导出并验收的产物不再重渲染，避免用坏图覆盖好图）。
- **停止原因＝上传器体积上限**：最终演示文稿 21,883,508 B 被 PicGo 的 GitHub contents API 以 400 "malformed request" 拒绝（日志 `PUT /repos/Medill-East/IMGStorage/contents/…`）；同日 17,206,190 B 与 20,552,982 B 的 deck 均上传成功，因此不是网络或凭证问题，而是该上传路径的体积边界。信息图与导图已上传成功，deck 无法交付 → 本条按 producer 记 `failed(upload)` 并写明原因，未发布 ready、未交付。
- 当日 claim 5 次（10:00、13:02、13:52、14:25、14:33、15:35 中的 5 次属于本条与 Stugan 条），ledger 50 ready / 36 failed、无遗留 generating。
- 证据：`runs/2026-09-17T1030-collect/recover-ultima/`（artifacts、content-review.json、日志）；待办＝换用能传 >20.5 MB 的上传方式后，本条只需再开票并跑 upload-only（`--reuse-artifacts`）。
