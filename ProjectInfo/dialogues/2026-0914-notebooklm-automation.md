# NotebookLM 自动化对话摘录

## 0730 每日资源自动化

决策：無涘（既有自动化授权） ｜ 记录：Codex

本文件为关键原文摘录，不声称是完整聊天导出。

自动化原文：
> 每个北京时间自然日最多 10 次 distinct candidate claim/NotebookLM production attempt，逐条串行、并发 1、自动重试 0；失败也计入 10 次。
> 每条资源只有在 NotebookLM 内容、四项产物、链接和 ready JSON 都完成校验后，才可写入本地 ready 运输态；本地 ready 不是完成，也不是可消费结果。

Codex过程原文：
> 第一条已导入，但在单来源隔离阶段失败，尚未生成内容或资产。原因已定位：隔离脚本最多取消 6 个来源，而当前需要取消 7 个，最终仍选中 2 个来源。
> 该 claim 已记为 failed。我会停止本轮，保留剩余 9 次额度，避免后续候选继续受到同一脚本缺陷影响。

交付结论：尝试1、ready0、远端交付0、失败1、跳过9、剩余额度9；停止原因是来源隔离脚本缺陷，不是配额耗尽。未生成、未重试、未触发Daily Check-in。完整机器证据见本轮sessions所引report与item报告。

## 1140 收集端跑批：隔离缺陷已修，演示文稿下载阻断

更新于 2026-09-14T13:42:23+08:00 · 记录者 DSH agent

用户请求（任务内容摘录，非完整聊天转录）：按共享 collect-resources-about-game skill 继续跑收集端；沿用当日 claim 上限、串行 1、自动重试 0；每条完整验证后 ready 并立即单文件远端交付；报告 preflight／尝试／ready／交付／失败／跳过／额度／停止原因；不得触发消费端。

DSH agent 实际结果：预检 ready_to_claim（2454 候选、在列 9、当日已 claim 1、剩余 9）。attempted 1 / ready 0 / 远端交付 0 / failed 1 / skipped 0，当日 claim 用 2，**剩余 7 未动**。

先修掉早上 Codex 记录的隔离阻断：`nblm-isolate-source.cjs` 的 `pass < 6` 硬编码上限在 8 来源的 notebook 上不够（需 7 轮），第 7 个来源从未被取消勾选。改为按实测框数推导轮数、目标名全名精确匹配、匹配数不为 1 时拒绝执行；实测 8 来源 7 轮完成隔离，用不存在的名字则正确拒绝且不动 notebook。同类缺陷在 `nblm-set-sources.cjs` 一并修正。

随后发现三张产物卡被 UI 冻结：连续 80+ 分钟显示「正在生成」，刷新页面后立刻显示真实标题（产物一小时前已完成）。据此把 `wait_for_card` 的超时文案改为如实描述，并支持 `LAG_CARD_TIMEOUT_SEC`。

已生成并校验总结 6,167 B、边界 813 B、信息图 5,810,545 B / 2752×1536、思维导图 851,452 B / 2664×4896（折叠 0、层级 3、渲染稳定）。**停止原因＝演示文稿下载阻断**：PPTX 与 PDF 两条路径都在约 44–45 KB 处停滞，且该下载稳定导致自动化 Chrome 崩溃（本轮 5 次）。已排除节流、来源与卡片状态误读。演示文稿是三件必填之一，故按合同记 failed（阶段 deck-export），未写任何 ready 或 partial。

环境另发现 viewer 帧被 `ERR_BLOCKED_BY_LOCAL_NETWORK_ACCESS_CHECKS` 挡住（代理把 `*.scf.usercontent.goog` 解析成 fake-IP 198.18.5.x），已通过 `launch.cjs` 的 `LAG_CHROME_ARGS` 加 `--disable-features=LocalNetworkAccessChecks` 绕开，导图导出恢复正常；根治仍需代理/DNS。

未写 PKM、未建 Issue、未触发 Daily Check-in、未发布网站。建议在下载链路修好前不要消耗剩余 7 次 claim：新候选会停在同一阶段。

机器回执：/Users/haodong/.local/state/learn-about-games/notebooklm-daily/runs/2026-09-14T1140+0800-isolate-fix/report.json
