# NotebookLM 收集端：隔离缺陷已修，演示文稿下载阻断

决策：無涘（既有连续跑批授权） ｜ 记录：DSH agent

## 1140 自动化：修好隔离缺陷后，卡在演示文稿下载（2026-09-14 11:42–13:42 +0800）

- 预检 `ready_to_claim`（2454 候选、在列 9、当日已 claim 1、剩余 9）。本轮 **attempted 1 / ready 0 / remote_delivered 0 / failed 1 / skipped 0**，当日 claim 用 2（本条两次尝试），**剩余 7 未动**。
- **先修掉了早上 07:34 的阻断根因**：`nblm-isolate-source.cjs` 里 `pass < 6` 是硬编码上限，而生产 notebook 已长到 8 个来源——取消 7 个非目标来源需要 7 轮，第 7 个（Hitman）从未被点到，于是「2 个来源仍被选中」。早上日志里正好 6 行 `toggle off` 后失败，证据吻合。
- 修法：轮数改为**按实测 checkbox 数推导**（选中数 +2），目标名改为**全名精确匹配**（原来传 28 字符片段，两张同前缀的卡就会认错，未解析的 URL 卡更会全部撞成同一段），并在目标匹配 0 个或多个时直接拒绝执行。实测 8 来源下 7 轮完成隔离；用不存在的名字测试时正确拒绝且不动 notebook。
- 同类缺陷一并修：`nblm-set-sources.cjs`（生成对话框的来源选择器）也把固定 8 轮改成按实测框数推导。
- **演示文稿卡片曾被 UI 冻结误导**：三张卡连续 80+ 分钟显示「正在生成」，刷新页面后立刻显示真实标题——产物其实一小时前就完成了。所以 `wait_for_card` 现在把超时文案改成如实描述（「未就绪（仍在生成）」），并允许用 `LAG_CARD_TIMEOUT_SEC` 调整（默认仍是 1200 秒）。
- 已生成并校验：总结 6,167 B＋边界 813 B；信息图 5,810,545 B / 2752×1536（走文档里的下载回退路径取回）；思维导图 851,452 B / 2664×4896（导出闸门全过：内容节点 44、折叠 0、层级 3、渲染稳定）。
- **阻断点＝演示文稿下载**：PPTX 与 PDF 两条路径都在约 44–45 KB 处停滞（PPTX 实测停在 23,480 / 8,259 / 45,375 B；PDF 停在 43,999 B 且 240 秒零增长），且该下载**稳定导致自动化 Chrome 崩溃（本轮 5 次）**。下载地址是 `lh3.google.com/rd-notebooklm/…`，与工作正常的图片导出同一个 host，所以问题不在域本身。已排除节流（探测显示「立即生成」可用）、来源、卡片状态误读。演示文稿是三件必填之一，故**不发布 ready**，按合同记 `failed`（阶段 deck-export），失败原因写了可核查现象。产物与总结都留在 notebook 与磁盘，环境修好后只需补导出与交付。
- **另一个环境发现（已绕开）**：NotebookLM 的 viewer 帧报 `ERR_BLOCKED_BY_LOCAL_NETWORK_ACCESS_CHECKS`——本机代理把 `*.scf.usercontent.goog` 解析成 fake-IP `198.18.5.x`，Chrome 当它是局域网设备而拦截，导致导图导出误报「没有展开按钮」。`launch.cjs` 现支持 `LAG_CHROME_ARGS` 透传，加 `--disable-features=LocalNetworkAccessChecks` 后 viewer 正常、导出成功。根治仍在代理/DNS。`gstatic` 的 404 依旧存在（HTTP 404 / fake-IP），但页面能渲染，不是本次阻断原因。
- 未写 PKM、未建 Issue、未触发 Daily Check-in、未发布网站内容；未重试其他 failed 条目。
- **建议**：在代理修好 `lh3.google.com/rd-notebooklm` 下载之前，不要用剩余 7 次 claim 跑新候选——每一条都会停在同一个阶段。
- 证据：`/Users/haodong/.local/state/learn-about-games/notebooklm-daily/runs/2026-09-14T1140+0800-isolate-fix/report.json`；本条明细 `runs/2026-09-14T130758-item-K_H6Bl4_qH0/`。
