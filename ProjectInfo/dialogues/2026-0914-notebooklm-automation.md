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

## 1500 继续排查：修掉 --no-sandbox，演示文稿下载仍未解决

更新于 2026-09-14T15:00:00+08:00 · 记录者 DSH agent

用户请求（任务内容摘录，非完整聊天转录）：「把问题修复后跑完」——要求先把阻断修好，再把批次跑完。

DSH agent 实际结果：**找到并修掉一个真缺陷，但演示文稿下载未能修复**。

真缺陷：`launch.cjs` 一直硬传 `--no-sandbox`，在 macOS 上会让 Chrome 下载路径崩溃——同一脚本、同一浏览器，从本机 `127.0.0.1:8799` 下 3,000,000 B 文件，带该参数时浏览器死亡且文件不落盘，去掉后完整下完。现已改为按需（`LAG_NO_SANDBOX=1`）。

未解决：演示文稿（PPTX 与 PDF）下载仍在 8–59 KB 区间停在半路。已用对照实验排除 7 个假设：headless 特有（有头同样失败）、选择器写错、`setDownloadBehavior` bug、本机下载整体损坏（本机 3 MB 能下完）、代理/fake-IP（`--no-proxy-server` 仍停）、HTTP/2 与 QUIC（`--disable-http2 --disable-quic` 仍停）、需要拦 OOPIF 帧（浏览器级 Fetch 证明该请求不经页面网络栈，是浏览器进程发起的下载导航）。停住后无进程持有文件、100 秒零增长。

结论与建议：属本机 TUN 网络（部分 utun 的 mtu 仅 1000–1380）对该大响应的中途切断，仓库代码无法修复；建议调整 TUN 的 MTU/TCP 或换出口后重试同一条目。

最终状态：ledger 38 ready / 30 failed / 0 generating；本条保持 failed（阶段 deck-export），总结与两件产物留在库中。本轮 claim 用 2，当日剩余 7 未动。未写 PKM、未建 Issue、未触发 Daily Check-in、未发布网站；两个失败原型工具已删除。

## 2030 复核 Codex 修复并交付 4 条

更新于 2026-09-14T20:30:00+08:00 · 记录者 DSH agent

用户请求（任务内容摘录，非完整聊天转录）：「codex 说修好了，你再试试」——要求先复核 Codex 的修复，再继续把批次跑完。

DSH agent 实际结果：**Codex 的修复成立，我此前的结论是错的**。我上次只从 `args` 删掉 `--no-sandbox`，但 Playwright 1.62.1 会默认再注入一次，所以参数看着干净、实际仍带该开关；正解是显式 `chromiumSandbox`。实测运行中 Chrome 已无该开关，演示文稿一次导出成功 18,559,684 B，SHA-256 与 Codex 那份逐字节一致（`ffe24bbf…`）。我先前"仓库修不了、根因在 TUN/MTU"的判断已被实测推翻并更正——错在只验证了传参意图，没有验证 Playwright 实际传了什么。

随后交付 4 条（三件产物齐备、逐个回读 sha256 一致、远端 blob 比对通过）：`youtube-K_H6Bl4_qH0`、`youtube-Vre9qqoEBpE`、`youtube--skDiuvH56E`、`youtube-pa6fsPMqAmU`；ledger 42 ready / 29 failed / 0 generating，当日 10 次 claim 用尽。

过程中又找到两个会把成功记成失败的缺陷并修掉：①未读徽标 `未读` 被 `\w+` 并进图标（`\w` 不匹配中日韩字符），使刚生成的未读卡片永远匹配不上 ICON，第 1、2 条因此白等 1200 秒并各花 1 次 claim——两条产物其实都已生成，本轮用既有产物补收尾，未重新生成；②deck 闸门采样一次就报"按钮不可达"，实测数秒后即可用，已改为轮询。两处修复均有回归测试，229 单测通过、`astro check` 0 错。

交付通道另修一次分叉：AI-Life-Mentor 的 `main` 与远端各有独立提交（远端为 briefings，本地为资源文件与健康快照），零文件重叠，合并后推送并逐条比对 blob，4 条全部一致。

批次第 4 条预检时命中真实的演示文稿容量节流，claim 前闸门拦住，未浪费 claim。

未写 PKM、未建 Issue、未触发 Daily Check-in、未发布网站内容。
