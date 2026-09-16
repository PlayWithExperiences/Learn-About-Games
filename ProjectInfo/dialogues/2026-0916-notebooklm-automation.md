# NotebookLM 自动化对话摘录（2026-09-16 下午）

## 1045 收集端跑批：带上内容验收门，交付 3 条、验收拦下 1 条

决策：無涘（既有连续跑批授权：北京时间每日最多 10 次 distinct claim、串行 1、自动重试 0；本次未扩大范围） ｜ 记录：DSH agent

本文件为关键原文摘录，不声称是完整聊天导出。

用户请求（任务内容摘录）：执行共享 `collect-resources-about-game` skill——按 preflight 顺序取未处理候选，经 NotebookLM 生成中文总结与三件产物，**上传前完成内容验收**，通过者写 ready 并单文件交付到 AI-Life-Mentor 远端 inbox；不触发消费端。

起点：当天早上 Codex 已用 1 次 claim，那条三件产物齐全但**上传前内容验收不合格**（1.5 年工时口径被错记成销量统计期间），记 `failed(content-validation)`，并留下一套在首次上传前挂起、等 `review-approved`/`review-rejected` 的包装（`review-runner.py`）。本轮沿用同一门槛，逐条复核后才允许上传。

DSH agent 实际过程与结果：

- 准入（不消耗 claim）：preflight `ready_to_claim`（2,454 候选、在列 9、当日已 claim 1、剩余 9）；长期 notebook 正文 46,931 字、来源勾选 19、无登录墙 → `available`；演示文稿闸门 `available`。
- **attempted 4 / ready 3 / remote_delivered 3 / failed 1**；当日 claim 用 5、剩余 5 未动；ledger 47 ready / 35 failed / 0 generating。
  - `youtube-oCwQtZcLrVs` Astroneer 合成系统 → `2026-0916-1120-systems-mechanics.json`
  - `youtube-djJO1XSOwuI` 星球大战 Galaxies 复盘 → `2026-0916-1254-criticism-values-history.json`
  - `youtube-Xv5EtQHZCnI` 技术美术与 VR 渲染 → **验收不通过，未上传**
  - `youtube-Mrr4lNF7-OU` 游戏产出项目实证研究 → `2026-0916-1356-criticism-values-history.json`
- 内容验收做法：上传前挂起，用 NotebookLM 对话索取**来源原句**逐项核对（统计数字、人名职位、机制名称），并目视信息图、导图节点与抽查 deck 页面；每条结论写进 item 目录的 `content-review.json`。
- 验收拦下的那一条：总结写「GPU 单帧预算约 15 毫秒」，而来源唯一的表述是 `…we have about 50 milliseconds Budget on GPU`，二次追问确认全篇没有 15ms。60fps 单帧约 16.7ms，50ms 物理上不可能，最可能是转写把 fifteen 听成 fifty——但这是推断而非来源事实，按合同记 `failed(content-validation)`，不发布；产物与总结留在本机与 notebook，授权后重跑只需重新生成总结。
- 交付通道一次失败与修复：条目 1 推送被拒（消费端仓库又被别的进程推了新提交）。按 skill 保留 ready、只重跑交付步骤：核对两侧零文件重叠后合并，再单独跑 `publish-notebooklm-resource.sh`，远端 blob 回读一致；**未重新调用 NotebookLM**。
- 新增代码 `automation/browser/nblm-chat-available.cjs` 与 claim 前对话闸门：对话被 AI 用量限额挡住时（页面写明「已达到 AI 用量限额。12:38 PM 之后…」）总结阶段必然做不完，而限额只有提问时才暴露；该探针只读页面、发送 0 个问题，只在读到明确限额文案时阻断。条目 2 因此在验收门等待额度恢复约 70 分钟，未浪费 claim。提交 `949caa3` 已推送。
- 复核方法上的关键前提：**向 notebook 索取来源引句前必须重新隔离为单一来源**。页面重载会把来源勾选重置为全选（本轮条目 3 复核时隔离脚本报 `PASSES_USED=20/21`），未隔离时同一问题的回答会混入别的来源原句（条目 1 首次提问即出现 Kingdoms and Castles 的 35 小时/周原句）。
- 未重试任何既有 failed（含早上 Codex 那条与本轮验收不通过那条）；未写 PKM、未建 Issue、未触发 Daily Check-in、未发布网站内容。

完整叙述与证据路径见 `sessions/2026-0916-notebooklm-reviewed-batch.md`。
