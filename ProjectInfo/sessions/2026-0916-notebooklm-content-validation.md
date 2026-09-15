# NotebookLM 每日生产

## 0732 NotebookLM 每日自动化：内容验收失败（2026-09-16）

决策：無涘（既有自动化范围授权） ｜ 记录：Codex ｜ 2026-09-16T07:56:34.889399+08:00

- preflight ready_to_claim，选出 10 条；今日初始 claim 0。复用长期 Notebook，已验证来源/Studio/编辑可用、没有遗留 generating；生成前后 deck 均提供立即生成，未确认配额耗尽。
- attempted 1 / ready 0 / remote_delivered 0 / failed 1 / skipped 9 / remaining_today 9。youtube-NpkLUoIgcXQ，run-20260916073357-77822，已由 producer fail 留痕。
- 总结与三类资产生成并导出；信息图 5,230,307B，导图 861,772B，PPTX 23,205,293B / 14 slides / ZIP CRC 通过。deck 使用页面网络栈取字节。文件存在与容器通过不等于内容合格。
- 内容验收失败：原来源说明 1.5 年是按每周 35 小时折算的开发工时（实际平均每周约 10 小时）；总结却把该数用于 65 万销量的统计期间，deck 第 2 页也遗漏折算条件。信息图人名亦无法从含识别错误的字幕确认。私有正文/资产仅保留本机，不纳入仓库。
- 上传前人工验收门拦下本条：上传 0、ready 0、交付 0。导图导出图已目视检查，但未补齐独立 live viewer 全展开验收，不声称完整通过。停止本轮属于内容质量检查决定，不是账号配额阻断；未重试、补交历史、写 PKM 或触发 Daily Check-in。
- 本机报告：/Users/haodong/.local/state/learn-about-games/notebooklm-daily/runs/2026-09-16T0732-automation/report.json；内容证据 item-1/content-validation.json。现有未提交历史记录及 cdp.cjs 改动不纳入本次提交。
- 下一步：新批次仍使用 preflight 新候选；本条 failed 不自动重试。建议后续强化来源事实与资产内容验收，特别是工时口径及未经证实的玩家效果。

session 01a0a769-bb7f-70f3-8a0d-054683ebca15
trace-user-count: 1

原始对话：dialogues/2026-0916.md「0732 NotebookLM 每日资源生产」
