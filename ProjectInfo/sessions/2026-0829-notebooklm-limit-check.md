# notebooklm-limit-check

> 按主题一份，追加不覆盖；同一场会话的节就地更新。

## 1324 完成续产候选

决策：無涘 ｜ 记录：AI。

- 事实：在用户明确允许打开新 Chrome 配置窗口后，继续处理预检固定清单下一条 `youtube-FhKjv7CPUqw`（`Level Design Workshop: A Narrative Approach to Level Design`），`generation_run_id=run-20260829122447-1992`；来源已在长期 Notebook 中保持唯一选中。
- 产出：NotebookLM 回答取回后得到 6,561 字符正文和 778 字符来源边界；信息图 PNG 为 2,752×1,536；思维导图执行 viewer「全部展开」，38 节点、深度 4、折叠 0；演示文稿查看器逐页资产为 14 页。
- 导出：NotebookLM 原生下载事件未在 30 秒内产出可验证文件；按查看器真实渲染资产重建 PPTX/PDF，PPTX ZIP 校验无损且含 14 个 slide XML，PDF 可解析且为 14 页，结果 JSON 对此作了明确说明。
- 托管：四项产物以 `20260829131742-narrative-expression-*` 语义文件名经 PicGo 串行上传；四条 Raw 地址 HTTP 200，远端字节与本地 SHA-256 完全一致。`autoRename` 已恢复为原值 `true`。
- 写回：`notebooklm_producer.py publish` 成功写入 `/Users/haodong/Documents/GitHub/AI-Life-Mentor/notebooklm-resources/2026-0829-1323-narrative-expression.json`，本条 ledger 状态为 `ready`。
- 验证：Learn-About-Games 生产器、预检自动化、发布脚本合同测试共 20/20 通过；没有写 PKM、触发 Daily Check-in、运行远端推送或部署。
- 账目：今日累计 3 次 claim，2 条 `ready`、1 条 `failed`（LEGO 条目的 `browser_control / slide_deck`），`remaining_today=7`。固定清单后续 7 条保持未 claim；本场在本地 ready 队列收口。

原始对话：dialogues/2026-0829.md「1324 续」

## 1408 五小时限额确认与浏览器阻塞收口

决策：無涘 ｜ 记录：AI。

- 结论：Google 官方新帮助页说明 Gemini Notebook 将于 2026-09-02 起采用按计算量的使用限制，达到限制后每 5 小时刷新，但直到触及每周上限；没有说明每个 5 小时窗口固定恢复 6 条。信息图和 Slide Deck 没有公开固定条数，Plus 旧表的 6/day 对应音频/视频概览，思维导图为 20/day。
- 本轮按用户要求继续使用今日本地 claim 位，领取 `youtube-CkHGuHd9BgU`（`run-20260829135125-72099`），但在来源 URL 提交前 Chrome 控制通道连续超时。扩展、native host、旧/新标签页恢复路径均已核验；内置浏览器未登录，未输入账号或绕过登录。
- producer 已如实将本条标记为 `failed`，阶段 `browser_control / source_add`；没有 NotebookLM 产物、PicGo 上传或 ready JSON。收口后今日 4 次 claim（2 ready、2 failed），剩余 6 条未 claim；停止原因是浏览器通道失稳，不是明确配额阻断。
- 风险：官方 5 小时说明尚未给出信息图/Slide Deck 的每窗口数值；后续必须以工作台显示的剩余量、恢复时刻和明文 quota block 为准，不能将 6 条推算为每 5 小时固定 6 条。
- 下一步：待 Chrome 控制通道恢复后，重新只读 preflight；仅从未 claim 的固定清单开始，不能重占本条失败 claim。

原始对话：dialogues/2026-0829.md「1408 确认五小时限额并收口今日批次」

## 1144 确认官方5小时刷新规则并完成今日收集

决策：無涘 ｜ 记录：codex（自动）｜ session 01a04b91-f7e5-7a50-a598-cf704b643bec

核对 Google 官方说明后发现：自 2026-09-02 起，Gemini Notebook 改为按计算量计费，5 小时为刷新窗口，受提示词复杂度、功能、对话长度和每周上限共同影响，官方未公布每 5 小时固定恢复 6 条。旧表中的 Plus 6/day 仅针对音频/视频概览，信息图和演示文稿仍标注 More limits，思维导图为 20/day。今日实际执行 4 次 claim：2 条 ready（LEGO Horizon 边际收益、叙事关卡设计），2 条因浏览器控制通道不稳定失败。已停止继续领取，剩余 6 个位未消耗。项目留痕已提交。用户确认登录后，可恢复继续处理剩余候选。

原始对话：dialogues/2026-0829.md「1144 notebooklm-limit-check」

## 1423 登录成功但控制通道未稳定

决策：無涘 ｜ 记录：AI。

- 用户已在正确的 Chrome 配置中登录；只读 DOM 确认 Google 账号和 Google One 会员，目标 Notebook 工作台标签页可见。
- 进入/认领工作台时，CDP `Page.getFrameTree` 超时；一次受控重连后 Chrome 控制端报告不可用。没有把登录成功误判成页面已可操作。
- 没有新增 claim 或任何 NotebookLM 生成。本日仍为 4 次 claim（2 ready、2 failed），剩余 6 条固定候选未领取；不得重试已失败条目。
- 下一步：等待 Chrome 控制通道恢复后，只读确认工作台，再从固定清单继续；若通道仍不可用，继续保持可辨认阻塞。

原始对话：dialogues/2026-0829.md「1423 登录态恢复但浏览器通道再次阻塞」

## 1853 今日固定批次收口

决策：無涘 ｜ 记录：AI。

- 用户确认登录后继续今日固定收集。NotebookLM 工作台控制已恢复；按稳定顺序新增处理 `youtube-PxpjRuATxKE`、`youtube-rXm5zCdiNT0`、`youtube-WFu1utKAZ18`、`youtube-brByJ5EVBn4` 四条，均完成唯一来源隔离、中文总结、信息图、思维导图、Slides/PPTX/PDF，并通过思维导图查看器“全部展开”（观察深度 3、折叠节点 0）、文件格式和远端字节/SHA-256 核验。
- 四份 ready JSON：`/Users/haodong/Documents/GitHub/AI-Life-Mentor/notebooklm-resources/2026-0829-1659-level-spatial-design.json`、`/Users/haodong/Documents/GitHub/AI-Life-Mentor/notebooklm-resources/2026-0829-1753-design-fundamentals.json`、`/Users/haodong/Documents/GitHub/AI-Life-Mentor/notebooklm-resources/2026-0829-1820-level-spatial-design.json`、`/Users/haodong/Documents/GitHub/AI-Life-Mentor/notebooklm-resources/2026-0829-1844-level-spatial-design.json`。每份 JSON 均保存四项稳定 Raw 地址；对应 PPTX/PDF 页数为 13/15/13/12。
- 第五条 `youtube-j_Ez3RpJUtw`（`run-20260829184427-45772`）已 claim，来源导入和总结完成；信息图阶段读取到“您已达到每日信息图数量上限，改日再来吧！ 或进行升级。”，于 18:50:01 按 `quota_block / infographic` 记为 `failed`，没有继续生成、上传或写 ready JSON。
- 失败后的只读 preflight 为 `claimed_today=9`、`remaining_today=1`，最后候选 `youtube-HAvS-RwkjdA` 保持未 claim。按明确服务配额护栏停止当天批次；没有触发 PKM、Daily Check-in、远端推送或部署。
- 官方规则结论保持：5 小时刷新按计算量限制运行，并受每周上限影响；官方没有公开信息图/Slide Deck 每个窗口的固定数量，也没有证据证明每次刷新补回 6 条。参考：[官方使用限制说明](https://support.google.com/gemininotebook/answer/17670842?hl=en)、[官方限额表](https://support.google.com/gemininotebook/answer/16213268?hl=en)。

原始对话：dialogues/2026-0829.md「1853 今日固定批次收口」

## 2026-08-30 1149 预检与工作台就绪检查

决策：待無涘确认 ｜ 记录：codex

- 只读 `preflight --limit 10` 成功，返回 `ready_to_claim`：2,454 个目录候选，按目录顺序固定返回 9 条；今日本地 ledger 已有 1 次 claim，`remaining_today=9`。首条为 `youtube-0xVYVP0hxME`（`Weaving 13 Prototypes into 1 Game: Lessons from 'Edith Finch'`）。本次原始 JSON 保存于 producer 状态目录的本日 preflight 快照。
- 今日更早的 `youtube-HAvS-RwkjdA` 已由前一轮以 `run-20260830073426-50030` claim，并在 `asset-download / infographic` 阶段失败；本次未重试。
- Chrome/NotebookLM 只读就绪检查为 `available`：已登录的长期 Notebook 可接管，来源面板、添加来源、查询框、信息图、思维导图、演示文稿控件均可用。未提交来源、未生成、未下载、未上传、未 publish。
- 本场停在首次真实 NotebookLM/PicGo 调用前，等待明确的手动批次授权；拟处理范围最多 9 条、串行并发 1、自动重试 0。没有修改网站代码、没有消费 ready、没有创建 Issue 或写 PKM。

原始对话：dialogues/2026-0830.md「1149 预检与 NotebookLM 工作台就绪检查」

## 2026-08-30 1249 Edith Finch 原型复盘 ready

决策：無涘 ｜ 记录：AI（在场模型）。

- 前次 `youtube-HAvS-RwkjdA` 的失败原因已核清：NotebookLM 信息图卡片实际生成，但两条允许的浏览器/viewer 下载路径都没有产出可验证的本地非零字节文件，因此按 `asset-download / infographic` 留痕；不是候选缺失、登录失败或总结生成失败。
- 用户确认后，沿用 1149 预检固定清单，不重新预检、不重试旧失败条目；精确 claim `youtube-0xVYVP0hxME`，`generation_run_id=run-20260830115819-91345`。同一长期 Notebook 中完成唯一来源隔离，中文总结 5,704 字符、来源边界 1,124 字符。
- NotebookLM 资产已实质核验：信息图 2,752×1,536 PNG；思维导图 viewer 执行“全部展开”，59 个节点、深度 4、折叠 0；演示文稿为 15 页。原生下载事件未落盘时，按合同允许的第二路径取得真实 viewer/page-assets，重建 PPTX/PDF，并在结果中保留该导出边界。
- 四项资产以语义时间戳文件名经 PicGo 串行上传；四个 Raw 地址均 HTTP 200，远端字节数与本地 SHA-256 一致，PicGo `autoRename` 已恢复 `true`。`producer publish` 成功写入 `/Users/haodong/Documents/GitHub/AI-Life-Mentor/notebooklm-resources/2026-0830-1246-prototyping-experimentation.json`。
- 发布后今日 ledger 为 2 次 claim：1 条此前 `failed`、本条 `ready`，`remaining_today=8`；固定清单余下 8 条未 claim。本场不消费 ready，不写 PKM/Daily Check-in，不推送、不部署；生产器、预检自动化、发布合同测试 20/20 通过。

原始对话：dialogues/2026-0830.md「1249 确认执行：Edith Finch 原型复盘 ready 与前次失败解释」

## 2026-08-30 1310 下载弹窗隔离修复

决策：無涘 ｜ 记录：AI（在场模型）。

- 根因边界：`youtube-HAvS-RwkjdA` 的失败日志只证明两条可见下载路径都没有产生可验证本地文件，不能证明用户一定点击了 Chrome 的 Cancel；但可见下载弹窗/事件桥是会被当前窗口或人工操作打断的脆弱主路径。
- 修复：共享收集 skill 与资源合同改为优先使用当前 viewer 的页面资产后台能力，按 `list()` → 精确资产选择 → `bundle()` 将实际字节导出到全新临时目录；页面资产列表、viewer URL、job id、HTTP 响应或点击无报错均不算成功。可见下载仅在后台能力不可用或明确失败时回退，且不要求用户操作弹窗。
- 实测：当前 NotebookLM 标签的单张页面资产后台探针 `requested=1`、`downloaded=1`、`failed=0`，本地得到非零字节 JPEG（64×64）；没有生成、claim 或消耗 NotebookLM 配额。
- 验证：先让合同测试在缺少后台导出规则时失败，再补齐文档后转绿；自动化 4/4、生产器 15/15、发布 2/2，共 21/21，`git diff --check` 通过。
- 状态：旧 `youtube-HAvS-RwkjdA` 仍保持 `asset-download / infographic` failed，没有伪造 ready；本轮不重跑，若重跑需另行确认一次新的单条 NotebookLM claim。

原始对话：dialogues/2026-0830.md「1310 下载弹窗导致的候选失败：根因确认与后台导出修复」

## 2026-08-30 1414 HAv 失败候选 retry ready

决策：無涘 ｜ 记录：AI（在场模型）。

- 用户明确确认只完整推进旧失败候选 `youtube-HAvS-RwkjdA`；本轮新 claim 为 `run-20260830132511-54079`，旧失败 `run-20260830073426-50030` 保留在 `attempt_history`，没有自动扩展到其他候选。
- 同一长期 Notebook 中保持 Studio 各产物的唯一来源选择；文字总结清理为 5,155 字符正文、782 字符来源边界。信息图为 2,752×1,536 PNG；思维导图 viewer 执行“全部展开”，实测 48 节点、深度 4、折叠 0；演示文稿为 13 页。
- 导出已验证绕过可见 Chrome 下载弹窗：信息图和思维导图使用 page-assets 后台 bundle；演示文稿用 13 张当前 viewer 页面资产重建 PPTX/PDF，并通过 PNG/OOXML/PDF 校验。
- 四项资产按 `20260830141001-systems-mechanics-*` 语义文件名经 PicGo 串行上传并回读；四个 Raw 地址均 HTTP 200，远端字节和本地 SHA-256 一致。PicGo `autoRename` 已恢复 `true`。
- producer 已发布 `/Users/haodong/Documents/GitHub/AI-Life-Mentor/notebooklm-resources/2026-0830-1413-systems-mechanics.json`，状态 `ready`；发布结果保留总结、来源边界、资产地址和思维导图展开证明，私有 Notebook 地址不进入本项目留痕。
- 验证通过：自动化合同 5/5、生产器 16/16、发布合同 2/2、`git diff --check`；本场未消费 ready、未写 PKM/Daily Check-in、未创建 Issue、未推送或部署。

原始对话：dialogues/2026-0830.md「1414 HAv 失败候选重试并进入 ready」

## 2026-08-30 1457 今日限额续产

决策：無涘 ｜ 记录：AI（在场模型）。

- 本场收到“持续推进到今日限额”确认，沿用先前只读预检的固定顺序，最多继续 7 条、串行并发 1、自动重试 0；没有重新预检来改换候选，也没有重试旧失败条目。
- 新增 4 次 claim。`youtube-I1yBJD4yRss`（`run-20260830142129-87995`）、`youtube-o02uJ-ktCuk`（`run-20260830143309-96939`）和 `youtube-QBAM27YbKZg`（`run-20260830144012-99867`）均在信息图阶段发现当前 viewer 图片不在 `pageAssets` 清单，且唯一可见下载回退等待 25 秒没有产生浏览器下载事件或可验证本地文件，正式记录 `asset-download / infographic` 失败。
- `youtube-LuNH9Rz2e2k`（`run-20260830145311-11173`）已完成唯一来源隔离和中文总结（正文 5,595 字符、来源边界 834 字符），但 NotebookLM 信息图界面明确返回“您已达到每日信息图数量上限，改日再来吧！或进行升级”，按 `quota_block / infographic` 失败并停止当天批次。
- 终止时本地 producer 只读预检为 `ready_to_claim`，`claimed_today=7`、`remaining_today=3`；未 claim 的固定候选为 `youtube-5UdVNmbIClM`、`youtube-8uE6-vIi1rQ`、`youtube-XPPtLNkVPWY`。本地名额未满不等于可以继续调用；明确服务配额优先，未升级、未自动重试。
- 本场没有新的 ready JSON 或 PicGo 上传。前一条 `youtube-HAvS-RwkjdA` 的 retry ready 仍为 `/Users/haodong/Documents/GitHub/AI-Life-Mentor/notebooklm-resources/2026-0830-1413-systems-mechanics.json`；本场未消费 ready、未写 PKM/Daily Check-in、未创建 Issue、未推送或部署。
- 根因边界进一步明确：后台 page-assets 已被 HAv retry 证明可以绕过正在使用的 Chrome 窗口；本场 3 条失败不是把下载弹窗点击当作成功，而是目标 viewer 图片未进入可导出资产清单，随后真实下载事件也没有产出。第 4 条则是服务端信息图配额的明文阻断。

原始对话：dialogues/2026-0830.md「1457 持续推进至今日限额并遇 NotebookLM 信息图配额」
