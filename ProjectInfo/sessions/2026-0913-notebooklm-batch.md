# NotebookLM 批量生产：2 条交付，演示文稿节流后停止

决策：無涘（「跑吧，后续也无需确认」＝授权连续跑批且不再逐批确认） ｜ 记录：DSH agent

## NotebookLM 自动化：2026-09-13 00:23–01:15 +0800

更新于 2026-09-13 01:15:00 +0800 · 记录者 DSH agent

- 预检 ready_to_claim（2454 候选、10 条在列）。本轮 **attempted 4 / ready 2 / 远端交付 2 / failed 2 / skipped 4 / remaining_today 4**（当日 claim 用 6：其中 2 次是第 2 条的 bug 重试）。
- **交付**：`youtube-hc8_W2PERZE`（HITMAN 关卡设计）→ `2026-0913-0044-level-spatial-design.json`，远端 blob `b9b5d75d…`；`youtube-U-dtYFPoDlU`（叙事导师计划）→ `2026-0913-0102-narrative-expression.json`，远端 blob `b533aa35…`。两条均 fetch 后 blob 比对一致。ledger 38 ready / 26 failed / 0 generating。
- **停止原因＝演示文稿容量节流**：NotebookLM 演示文稿对话框出现「此内容将在几小时后生成。或者，升级可缩短等待时间。」，且「立即生成」按钮消失（仅剩「稍后生成」）；两次独立打开均复现。演示文稿是合同必填三件之一，故所有剩余候选都无法完成，批次整体停止，**未消耗剩余 4 次 claim**。
- `youtube-gPV0qmyGs-o`（叙事驱动留存）ledger=failed，但信息图与思维导图已生成并留在 notebook 中；节流解除后只需补演示文稿再用 `finish-notebooklm-item.py` 收尾，不必重做图像类产物。`youtube-ykPZcG8_mPU` 在批次停止时刚导入来源、未生成任何产物。
- **本轮新增可复用流水线**（`automation/`）：`run-notebooklm-item.py`（单条端到端）、`run-notebooklm-batch.sh`（串行跑批）、`finish-notebooklm-item.py`（产物已在、只补导出发布）、`notebooklm-split-answer.py`，以及 `automation/browser/` 下 11 个 NotebookLM 步骤工具（导入来源／隔离／提问／取答案／生成三类产物／归位列表／导出图片·导图·PPTX）。
- **本轮修掉的 7 个致错点**（都会伪装成别的症状）：①新增来源按列表末位识别，误判成上一候选；②Studio 生成对话框**有独立来源选择器且默认全选**，会静默产出「基于 N 个来源」的串源产物（已删卡并重生成）；③页面重载把来源勾选重置为全选，重载后必须重新隔离；④产物卡片文本含相对时间，整串比较会漏判已知卡片，把上一候选成品当新产物；⑤信息图查看器只有 ✕，导出前不归位 Studio 列表就报 card not found；⑥演示文稿语言是 mat-select，点击会弹遮罩遮住提交按钮；⑦未等笔记本空闲就取基线，上一候选卡片可能在基线后完成并被误认。
- 未写 PKM、未建 Issue、未触发 Daily Check-in、未发布网站内容。第 2 条的两处失败（来源误判、导出取错卡片）与其修复过程均保留在 ledger 与运行报告里，未改写。
- 证据：`/Users/haodong/.local/state/learn-about-games/notebooklm-daily/runs/2026-09-13T0115+0800-batch-report.json`；各条明细在同目录 `batch-*-youtube-*.log` 与 `*-item-*/report.json`。

原始对话：dialogues/2026-0913-notebooklm-automation.md「0023 批量生产与演示文稿节流」

## 补充：节流范围确认与 claim 闸门（2026-09-13 01:14–01:26 +0800）

- **节流是账号级、不是单 notebook**：在长期本 `880ad454` 复核，同样显示「此内容将在几小时后生成。」且无「立即生成」按钮。**换 notebook 绕不开**，因此没有采用轮换笔记本的做法。
- 01:16–01:26 每 90 秒采样一次，连续 6 次均为节流；文案为「几小时后」，不适合在本轮内等待。
- **新增 claim 前闸门**：`automation/browser/nblm-deck-available.cjs` 在生成前探测演示文稿能否立即生成（只开关对话框，不消耗配额也不消耗 claim）；`run-notebooklm-item.py` 把它放在 **claim 之前**，不可用则直接返回 rc=3 且不写 ledger；`run-notebooklm-batch.sh` 收到 rc=3 即停止批次。
- 实测：`claimed_today` 在整次批次尝试前后均为 **6**，**未消耗任何 claim**。此前第 3、4 条正是在 claim 之后才发现节流而被白白占用的。
- 结论：在节流解除前不再重复领取；解除后先为 `youtube-gPV0qmyGs-o` 补演示文稿收尾，再继续预检清单（当日剩余 4 次 claim 保留）。

## 存量 failed 分诊（2026-09-13 01:28 +0800）

ledger 共 **26 条 failed**。以下是按失败阶段的分析，**分析不等于已重跑**：skill 规定重跑 failed/partial 必须由你明确授权，本轮没有重跑任何一条。

### A. 每日信息图配额（跨日重置） —— 9 条
- 可行动作：**可重跑**（新的一天配额重置），每条消耗 1 次 claim。
- 授权状态：未授权，需你确认
  - `youtube-8FgBctI5ulU` — Writing and Narrative Design: A Relationship
  - `youtube-LuNH9Rz2e2k` — Level Design Saga: Creating Levels for Casual Ga
  - `youtube-TawhcWao9ls` — 'Horizon Zero Dawn': A Game Design Postmortem
  - `youtube-_sslFBVy5Lc` — Sunless Skies: A Narrative Postmortem
  - `youtube-a-zKMzboOec` — Animation Bootcamp: Animation Prototyping for Ga
  - `youtube-ii_Q4OCoHvU` — Balancing League of Legends for Every Player, fr
  - `youtube-j_Ez3RpJUtw` — The Design Direction of 'I Expect You To Die 2'
  - `youtube-mncyepcgJO8` — The Forest Paths Method for Accessible Narrative
  - …另有 1 条

### B. 导出通道（pageAssets／下载 stall／canvas 跨域） —— 8 条
- 可行动作：**今天已具备修复手段**：导出走 `asset-capture.cjs` 流式取原始字节、思维导图走 SVG 抽取渲染；当时多数条目产物已生成并验证过，重跑主要花在导出与发布。
- 授权状态：未授权，需你确认
  - `youtube-5UdVNmbIClM` — Game Design Case Studies - One Designer | One Ga
  - `youtube-E4ZUgPoDrvY` — C: 企画・ゲーム設計1（まとめ動画）#01～#09
  - `youtube-I1yBJD4yRss` — Level Design Workshop: Level Flow for a Video Ga
  - `youtube-I5wwviUJV9M` — Reimagining a Classic: The Design Challenges of 
  - `youtube-fBRTIwymDyY` — Designing Over the Top - Saints Row: The Third P
  - `youtube-ke_kOD2D-bs` — Designing Games for Game Designers
  - `youtube-neuRe4WWiKs` — Can You Make a Good Game Without Good Play Mecha
  - `youtube-o02uJ-ktCuk` — 'Heaven's Vault': Creating a Dynamic Detective S

### C. 演示文稿生成失败或超时 —— 3 条
- 可行动作：当前仍被账号级容量节流挡住，节流解除后再逐条看现象。
- 授权状态：未授权，需你确认
  - `youtube-2qrzI8YCVgI` — Building Big Impact, One Brick at a Time: Margin
  - `youtube-gPV0qmyGs-o` — Getting Players to Care: Using Narrative to Driv
  - `youtube-ykPZcG8_mPU` — Building Non-linear Narratives in 'Horizon: Zero

### D. 来源不可用（视频无法导入转写） —— 1 条
- 可行动作：**不可修复**（来源侧），应保持 failed，不要反复重试。
- 授权状态：建议永久排除，无需授权
  - `youtube-1wyToyTk3D0` — Believable Make-Believe: Putting the Player at t

### E. 产物语言不合规 —— 1 条
- 可行动作：已在生成提示中强制中文简体并核验正文语言，可重跑。
- 授权状态：未授权，需你确认
  - `youtube-t7VkrExQwSo` — Environment Design as Visual Storytelling: Theor

### F. 浏览器通道／访问权限 —— 2 条
- 可行动作：环境类，需先确认登录态与权限；部分条目已过时。
- 授权状态：未授权，需你确认
  - `youtube-CkHGuHd9BgU` — Designing Unforgettable 'Titanfall' Single Playe
  - `youtube-yorTG9at90g` — Why Does Celeste Feel So Good to Play?

### G. 其他 —— 2 条
- 可行动作：逐条判断。
- 授权状态：未授权，需你确认
  - `youtube-XPPtLNkVPWY` — Game Design Tools: For When Spreadsheets and Flo
  - `youtube-f8VIlfTtypg` — The Design in Narrative Design

**小结**：26 条里 8 条（31%）属导出通道，已被今天的修复覆盖；9 条为跨日重置的每日配额；1 条来源本身不可用、不应再试；其余 8 条依赖节流解除或环境确认。

## 补充：演示文稿节流的真实形态＝**时间闸门**，不是拒绝（2026-09-13 01:36–01:40 +0800）

- 连续三轮（01:16 / 01:27 / 01:36）复核，演示文稿均无「立即生成」，只给「稍后生成」。
- **关键实验**：对 item 3（`gPV0qmyGs-o`，信息图与思维导图已在库）先隔离到其来源，再填写描述并点「稍后生成」。结果**队列确实生效**：Studio 出现卡片
  `tablet … 已安排在 4上午之后生成`。即：内容会在 **约 4:00 之后**由服务端排期产出，而不是被拒绝。
- 结论：这不是「做不了」，而是**当晚 4 点前拿不到演示文稿**。合同规定单条演示文稿最多等 15 分钟，因此在此之前无法按合同完成任何一条，本轮不消耗剩余 claim。
- item 3 的演示文稿已进入队列；4 点后应先导出它并用 `finish-notebooklm-item.py` 收尾，再继续预检清单（当日剩余 4 次 claim 保留）。
- 隔离动作已复核：导航／重载会把来源勾选重置为全选，补生成前必须重新隔离（本轮再次实测确认）。
