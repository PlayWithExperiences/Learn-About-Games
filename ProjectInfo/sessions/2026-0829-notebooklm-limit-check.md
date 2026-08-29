# notebooklm-limit-check

> 按主题一份，追加不覆盖；同一场会话的节就地更新。

## 1144 核对官方限额并尝试今日资源收集

决策：無涘 ｜ 记录：codex（自动）｜ session 01a04b91-f7e5-7a50-a598-cf704b643bec

先核对 NotebookLM 官方公开限额，Plus 账号的公开数字未下调：200 Notebook、100 来源/Notebook、200 聊天/日、音频/视频各 6 次/日、报告/闪卡/测验/思维导图各 20 次/日；信息图和 Slide Deck 仍标注 "More limits" 无公开固定值，额度按 24 小时重置且不保证北京时间零点。随后按串行每条单独 claim 的方式尝试今日候选，第 1 条（youtube-2qrzI8YCVgI）完成了中文总结、信息图 PNG 验证和完整展开思维导图，但因浏览器内核重置导致控制权丢失，Slides 未提交，记为 failed。第 2 条（youtube-FhKjv7CPUqw）总结与信息图已生成，思维导图也完成节点校验（38 节点、层级 1-4），Slides 生成过程中多次触发通道超时，最终因浏览器适配器不稳定而终止，未继续领取后续候选。本次未遇到明确配额阻断，记录已入库 Git。今日账：1 ready + 2 failed，剩余 8 次 claim。

原始对话：dialogues/2026-0829.md「1144 notebooklm-limit-check」

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
