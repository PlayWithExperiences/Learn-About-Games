# NotebookLM 收集端：带内容验收门的跑批（2026-09-16）

决策：無涘（既有连续跑批授权：北京时间每日最多 10 次 distinct claim、串行 1、自动重试 0；本次未扩大范围） ｜ 记录：DSH agent

更新于 2026-09-16 · 本文件在批次收尾后定稿

## 起点

- 北京时间新的一天。早上 Codex 已用掉 1 次 claim：`youtube-NpkLUoIgcXQ` 三件产物全部生成并导出，但**上传前的人工内容验收判定不合格**（把按 35 小时/周折算的 1.5 年工时口径错记成 65 万销量的统计期间等），本条记 `failed(content-validation)`，未上传、未写 ready。他还留下一套 `review-runner.py` 包装：在第一次上传前把 item 挂起，等 `review-approved` / `review-rejected`。
- 本轮 preflight：`ready_to_claim`，2,454 候选、在列 9（`claimed_today=1`、剩余 9）。准入前完成三项**不消耗配额**的检查：
  - 浏览器就绪：长期 notebook `2ce16a4b…` 正文 46,931 字、来源勾选框 19、Studio 可见、无登录墙 → `available`；
  - 演示文稿闸门 `nblm-deck-available.cjs` → `available`；
  - （中途新增）对话闸门 `nblm-chat-available.cjs` → 见下。

## 交付结果

| 条目 | 资源 | 结果 |
| --- | --- | --- |
| 1 | `youtube-oCwQtZcLrVs` Mining Your Own Design: Crafting the Crafting System in Astroneer | ready＋远端交付 `2026-0916-1120-systems-mechanics.json` |
| 2 | `youtube-djJO1XSOwuI` Classic Game Postmortem: Star Wars Galaxies | ready＋远端交付 `2026-0916-1254-criticism-values-history.json` |
| 3 | `youtube-Xv5EtQHZCnI` Fast and Flexible: Technical Art and Rendering For The Unknown | **内容验收不通过**，未上传、未写 ready（理由见下） |
| 4 | `youtube-Mrr4lNF7-OU` The Game Outcomes Project: How Teamwork, Leadership and Culture Drive Results | ready＋远端交付 `2026-0916-1356-criticism-values-history.json` |

三条交付均：三件产物上传后回读 sha256 一致、`publish-notebooklm-resource.sh` 远端回读路径与 blob 一致（`e65ea209…`、`abbb4623…`、`3dc853f7…`），deck 全部走页面网络栈取字节（`page-asset-capture`，14.6–26.3 MB）。

**口径**：attempted 4 / ready 3 / remote_delivered 3 / failed 1；当日 claim 用 5（含早上 Codex 1 条）、**剩余 5 未动**；ledger 46→47 ready / 34→35 failed / 0 generating。

## 内容验收（本轮的真门槛）

每一条都在**上传前**按 Codex 的包装挂起，然后逐项核对，记录写在 item 目录的 `content-review.json`：

- 条目 1（Astroneer）：来源原句确认演讲者（Aaron Bittelman / Elijah O'Rear 及各自职位）、物品数「since release … more than doubled」且未新增模块、「thanks to the stable foundation … without having to overhaul it at all」、Automation Update 确在来源中；信息图目视、导图 50 节点（49 中文）、deck 抽查 2 页。**批准**。
- 条目 2（SWG）：来源原句确认 2 年 9 个月、612 技能框取 5、2.5GB→每星球 30KB、每服 125 城市、每服 15,000 商店、演讲者 Raph Koster（转写作 ralph coster）与 Rich Fogel、JTL 80% 购买率、NGE 一个月流失 25%、唯一两次 Coaster of the Year、Porter Robinson《Goodbye To A World》、发售时只有 1 个手工任务。**批准**。
- 条目 3（技术美术/VR 渲染）：已核对的项（1.4 倍中心分辨率、60fps 渲染＋120Hz 重投影、25%/50%/75% 分辨率梯度遮罩与约 25% GPU 时间节省）都与来源原句逐字一致，信息图、导图（52 节点）、15 页 deck 容器均正常；但总结写的「GPU 单帧预算仅剩约 **15 毫秒**」在来源里找不到依据——转写文本唯一的预算是 `…we have about 50 milliseconds Budget on GPU`，二次追问也确认全篇没有 fifteen/15 milliseconds/15 ms。**按合同记内容验收失败**，不上传、不发布。

### 条目 3 的判断依据（值得单独记一笔）

- **不予发布的理由**：合同写明总结"不补外部事实"，而 15ms 是模型自行推算的结果，来源文本并不支持；这正是内容验收门要拦的一类断言。
- **同一处的反证**：60fps 单帧约 16.7ms，"50ms 的 GPU 预算"物理上不成立；这份转写的另一处人名也有错（`ralph coster` = Raph Koster）。所以**很可能**是转写把 fifteen 听成 fifty、15ms 才是演讲者的真实数字——但这是推断，不是来源事实，因此记失败并把判断留给無涘决定；产物与总结留在本机与 notebook，授权后重跑只需重新生成总结。
- **可复用的教训**：核对数字时应顺带检查"来源里到底有没有这个数"，而不是只检查"这个数是否合理"。
- 条目 4（Game Outcomes Project）：来源原句确认 2014 年秋季调查与 273 份有效回复、加班最少 25%（64 个数据点）均分 62 与最多加班组（71 点）均分 48、最强制 49 与最自愿 67、30 个文化因子回归 r=0.82 与去掉加班因子 r=0.81、最强制且最多加班组比无加班模型预测低 3.91 分、"共同愿景"r=0.50 且为全研究最强相关。信息图目视、导图 65 节点、deck 抽查 1 页。**批准**。

### 验收方法上两个必须记住的坑

1. **引句来源会被「全选」污染**：页面重载会把来源勾选重置为全选，此时向对话索取「来源原句」会**同时引到别的来源**——本轮首次给 Astroneer 提问时，回答里混进了 Kingdoms and Castles 的 35 小时/周那段原句。**提问前必须先跑 `nblm-isolate-source.cjs`**，并用它打印的 `ISOLATED:` 名称确认；本次条目 2 复核时它报 `PASSES_USED: 0`，说明隔离一直有效。
2. **对话有 AI 用量限额，而且只有提问时才发现**：本轮复核提问把额度用尽后，页面显示「已达到 AI 用量限额。12:38 PM 之后，所有功能都将可用。」且输入框禁用。总结阶段本质就是提问，所以限额期间任何候选都做不完——但它在 claim 之后才暴露。据此新增 `nblm-chat-available.cjs`（**只读页面、发送 0 个问题、不消耗配额**，只在读到明确限额文案时判阻断；输入框被来源面板挤出视野不算阻断），并接进 claim 前的 gate，与演示文稿闸门并列。条目 2 因此在上传前挂起了约 70 分钟等额度恢复，未浪费 claim。

## 交付通道的一次失败与修复

条目 1 的 `publish-notebooklm-resource.sh` 推送被拒（`! [rejected] main -> main (fetch first)`）——消费端仓库 `AI-Life-Mentor` 在我提交之后又被别的进程推了新提交。按 skill「交付失败保留 ready、只重跑交付步骤」处理：本地 ready 与失败证据保留、ledger 未被伪改成 failed（包装脚本对 `deliver:` 阶段的 `producer fail` 做了保留处理），核对两侧改动零文件重叠（本地 `.claude/trace-health.json` ＋ 资源 JSON，远端 `pkm-index.json`）后合并，再单独重跑 `publish-notebooklm-resource.sh`，远端 blob 回读一致。**未重新调用 NotebookLM。**

## 代码改动（本轮提交）

- 新增 `automation/browser/nblm-chat-available.cjs`：只读的对话可用性探针。
- `automation/run-notebooklm-item.py`：claim 前新增对话闸门（阶段名 `chat-availability`），只在明确限额时阻断。
- `automation/browser/README.md`：新增「2026-09-16 补记」，写清限额现象与复核时的隔离前提。
- 提交 `949caa3`（已推送）。验证：`npm run test` 234 通过；`astro check` 106 文件 0 错误。

## 未做

- 未重试任何既有 `failed`/`partial`（含早上 Codex 判定不合格的那条与本轮失败条目）——skill 要求显式授权。
- 未写 PKM、未建 Issue、未触发 Daily Check-in、未发布网站内容。
- 未上传或发布任何未通过内容验收的产物；未逐页目视全部 15 页演示文稿（每条抽查 2 页）。
