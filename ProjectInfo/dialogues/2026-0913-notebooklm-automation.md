# NotebookLM 自动化回合记录（2026-09-13）

## 0023 批量生产与演示文稿节流

决策：無涘（原文：「跑吧，后续也无需确认」） ｜ 记录：DSH agent

自动化输入摘要（不是完整逐字 transcript）：执行共享 collect-resources-about-game skill 的连续跑批；北京时间每日最多 10 次 distinct claim、串行 1、自动重试 0；每条 ready 立即单文件发布并回读远端 blob；不写 PKM、不建 Issue、不触发 Daily Check-in、不发布网站。

实际答复：预检 ready_to_claim。本轮 attempted 4 / ready 2 / 远端交付 2 / failed 2 / skipped 4。交付两条：HITMAN 关卡设计（`2026-0913-0044-level-spatial-design.json`，远端 blob b9b5d75d…）与叙事导师计划（`2026-0913-0102-narrative-expression.json`，远端 blob b533aa35…），均经 fetch 后 blob 比对确认。

停止原因是**演示文稿容量节流**：对话框给出「此内容将在几小时后生成。或者，升级可缩短等待时间。」且「立即生成」按钮消失，两次独立打开均复现。演示文稿是三件必填产物之一，剩余候选都无法完成，因此整体停止并保留当日剩余 4 次 claim 未用。

本轮同时把流水线工程化：新增单条端到端 runner、串行跑批 driver、只补导出发布的 finish 脚本，以及 11 个浏览器步骤工具；过程中修掉 7 个会伪装成其他症状的致错点（来源按末位识别、生成对话框独立来源选择器默认全选造成串源、重载重置勾选、卡片相对时间导致误认旧卡片、查看器无归位按钮、语言 mat-select 遮住提交按钮、未等空闲即取基线）。

`youtube-gPV0qmyGs-o` 的信息图与思维导图已生成并留在 notebook，节流解除后补演示文稿即可收尾。

证据：/Users/haodong/.local/state/learn-about-games/notebooklm-daily/runs/2026-09-13T0115+0800-batch-report.json
时间：2026-09-13 01:15:00 +0800


# NotebookLM 自动化对话记录

## 0734 每日资源自动化

更新于 2026-09-13T07:40:24+08:00 · 记录者 Codex

用户自动化请求（任务内容摘录，非完整聊天转录）：执行共享collect-resources-about-game skill；北京时间每日最多10次claim，串行、重试0；完整验证后逐条ready并立即单文件远端交付；报告preflight、尝试、ready、交付、失败、跳过、额度与停止原因；不得触发消费者。

Codex实际结果：预检ready_to_claim，今日已用7、剩余3；页面正文为空且来源/Studio不可用；claim前停止。本轮attempted0、ready0、交付0、候选失败0、运行失败1、跳过3。完整机器回执：/Users/haodong/.local/state/learn-about-games/notebooklm-daily/runs/2026-09-13T073456+0800-automation/report.json。

## 1955 收集端跑批：3 条「假失败」，当日 claim 用尽

更新于 2026-09-13T20:10:00+08:00 · 记录者 DSH agent

用户请求（任务内容摘录，非完整聊天转录）：按共享 collect-resources-about-game skill 继续跑收集端批次；北京时间每日最多 10 次 distinct claim、串行 1、自动重试 0；每条完整验证后 ready 并立即单文件远端交付；报告 preflight／尝试／ready／交付／失败／跳过／额度／停止原因；不得触发消费端。

DSH agent 实际结果：预检 ready_to_claim（2454 候选、在列 3、当日已 claim 7、剩余 3）。环境较清晨恢复——06:54–07:40 的 gstatic 故障不再复现，浏览器就绪检查 available、演示文稿闸门 available，两项都在 claim 前完成。随后 attempted 3 / ready 0 / 远端交付 0 / failed 3 / skipped 0，**停止原因＝当日 10 次 claim 用尽**（remaining_today 0）。

三条失败都在 `import-source` 阶段，但经复核是**假失败**：NotebookLM 对新加链接来源先显示原始 URL 作卡片标题，元数据解析完才换成真实标题；`title_matches()` 用 URL 与目录标题模糊匹配得 0 重叠，于是把已成功导入的来源判成错来源。实际上三条的来源都已在生产 notebook 中。代价是当日 claim 全部用尽。

已修 `automation/run-notebooklm-item.py`：新增 `source_identity_ok()`（URL 卡片只认精确 video id；真实标题仍模糊匹配；反向对照全部拒绝），并加 claim 前只读来源查找。9 用例全通过。

未产出 ready／上传／交付；未写 PKM、未建 Issue、未触发 Daily Check-in、未发布网站。重跑这三条 failed 需用户明确授权，且受当日 claim 上限约束。

机器回执：/Users/haodong/.local/state/learn-about-games/notebooklm-daily/runs/2026-09-13T1955+0800-import-identity-fix/report.json
