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
