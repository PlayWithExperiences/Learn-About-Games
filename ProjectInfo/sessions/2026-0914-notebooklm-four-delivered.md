# NotebookLM 收集端：下载修复后交付 4 条

决策：無涘（既有连续跑批授权；并转达「codex 说修好了，你再试试」） ｜ 记录：DSH agent

## 1901–2030 自动化：验证 Codex 修复 → 交付 4 条 → 修掉未读徽标缺陷

- **先独立复核 Codex 的修复，结论是他对、我先前错**。我上次只从 `args` 里删掉 `--no-sandbox`，但 Playwright 1.62.1 会**默认再注入一次**，所以参数看着干净、实际仍带该开关；必须显式 `chromiumSandbox: !LAG_NO_SANDBOX`。实测：运行中 Chrome 参数已无该开关，演示文稿**一次导出成功 18,559,684 B**，zip 校验通过、14 页/14 媒体，SHA-256 `ffe24bbf…` 与 Codex 那份**逐字节一致**。我此前"仓库修不了、根因是 TUN/MTU"的结论**已被推翻并更正**——当时的错误在于只验证了传参意图，没有验证 Playwright 实际传了什么。
- **交付 4 条**（每条三件产物齐备、上传后逐个回读 sha256 一致、远端 blob 比对通过）：
  - `youtube-K_H6Bl4_qH0` A Long Dark Road → `2026-0914-1906-narrative-expression.json`
  - `youtube-Vre9qqoEBpE` The Division 的 NPC 自主性 → `2026-0914-2022-design-fundamentals.json`
  - `youtube--skDiuvH56E` EA 的 UX 研究与生产整合 → `2026-0914-2026-playtesting.json`
  - `youtube-pa6fsPMqAmU` 无障碍玩家体验 → `2026-0914-2028-research-player-experience.json`
  - ledger：**42 ready / 29 failed / 0 generating**；当日 10 次 claim 用尽。
- **找到并修掉两个会让成功被记成失败的缺陷**：
  1. **未读徽标污染图标**：卡片串是 `stacked_bar_chart未读 标题 1 个来源`，而 `\w+` 不匹配中日韩字符，`未读` 被并进图标，得到 `icon='stacked_bar_chart未读'`，与 `ICON['infographic']` 永不相等 → `wait_for_card` 认定"该类卡片从未出现"。**刚生成的卡片必然是未读的**，所以它专打本该成功的情况，已读旧卡反而正常，因而长期未被发现。第 1、2 条就是这样各白等 1200 秒并各花掉 1 次 claim（产物其实都已生成，本轮已用既有产物补收尾，未重新生成）。
  2. **deck 闸门假阴性**：导出刚结束时 Studio 面板尚未重绘，闸门采样一次就报"按钮不可达"并停下批次；实测数秒后复探即为 `available`。已改为轮询等待（各 20 次/10 次），并给 `wait_for_card` 加每 5 分钟重读列表（`LAG_CARD_REREAD_SEC`）——Studio 列表也会长时间卡在「正在生成」，重读属于等待的一部分。
- 修复验证：卡片图标直方图现为干净的 `stacked_bar_chart/flowchart/tablet/sync`；未读信息图卡正确匹配；**229 单测通过**、`astro check` 0 错。
- **交付通道修复**：AI-Life-Mentor `main` 再次与 `origin/main` 分叉（远端 `briefings/2026-0914.md`，本地资源文件＋健康快照），推送被拒。核对两侧改动**零文件重叠**后合并推送，随后逐条比对远端 blob，4 条全部一致。
- 批次在第 4 条预检时遇到**真实的演示文稿容量节流**（「此内容将在几小时后生成」）。闸门在 claim 前拦住，**未浪费 claim**，符合设计。
- 未写 PKM、未建 Issue、未触发 Daily Check-in、未发布网站内容。新增 `automation/browser/README.md` 补记④与两项入口回归测试。
- 证据：`runs/2026-09-14T190455-item-K_H6Bl4_qH0/`、`2026-09-14T202030-item-*`、`runs/2026-09-14T1805-sandbox-fix/report.json`（Codex）。
