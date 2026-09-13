# NotebookLM 每日资源自动化

## 0734 每日资源生产：来源隔离脚本阻断

决策：無涘（既有自动化范围授权） ｜ 记录：Codex

- 2026-09-14T07:34:07.665459+08:00：preflight ready_to_claim，候选10、当日初始claimed0；浏览器以已有持久配置启动，长期Notebook来源面板和Studio可用，演示文稿即时生成入口可用。ledger开始38 ready / 29 failed / 0 generating。
- 本轮 attempted1 / ready0 / remote_delivered0 / failed1 / skipped9 / remaining_today9；运行级失败1。唯一claim youtube-K_H6Bl4_qH0 / run-20260914073243-31674，来源导入成功，隔离失败后producer fail已落账。当前ledger38 ready / 30 failed / 0 generating。
- 根因实证：nblm-isolate-source.cjs的取消勾选循环固定pass<6；8个已选来源需取消7个，执行6次后仍选中目标与Hitman，共2个。未达到单来源要求，未发起总结/资产生成。为避免相同适配器缺陷继续消耗claim，停止批次；不是配额耗尽，不是无候选。
- 未重试失败条目、上传、ready发布、远端交付、补交历史文件、写PKM或触发Daily Check-in。后续先修复隔离循环并验证超过7来源的场景；本条failed仍需显式重跑授权。本轮未修改生产代码。
- 原始预检响应内容与报告：/Users/haodong/.local/state/learn-about-games/notebooklm-daily/runs/2026-09-14T073000+0800-automation/preflight.json、report.json；候选失败原始输出：item-1/report.json。首个preflight响应在工具输出中取得，preflight.json按该响应字段落盘，未再次预检。

原始对话：dialogues/2026-0914-notebooklm-automation.md「0730 每日资源自动化」。
