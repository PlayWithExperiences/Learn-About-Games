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
