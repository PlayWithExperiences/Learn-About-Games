# ProjectProgress

> 现状快照，覆盖写，不堆历史。历史看 `roadmap.md` 与 `sessions/`。

*更新于 2026-09-03 22:10:00 +0800 · 记录者 AI*

## 最新检查（2026-09-03 22:10:00 +0800）

- 仓库仍为 Private；v0.2 候选未推送、未部署，Pages 不恢复。
- `youtube-VnRT2R0yt6c`（Designing Shadow Complex）已交付：`retry`（`run-20260903220020-85372`，旧失败保留）→ 总结 4147 字+边界 910 字从既有 Notebook 对话重读（无新生成、不耗配额）→ 4 个 URL 发布时重验通过 → `publish` → `notebooklm-resources/2026-0903-2201-design-fundamentals.json` → 变基后 push（远端 `b2f2e01`）→ blob `1f30708a` 两端一致。消费端校验通过（ready/active）。
- 浏览器通道是本场自建的：拷贝 Profile 三探皆撞 Google 登录墙后停手删拷贝；改用全新浏览器由用户亲手登录，经 raw CDP 只读对话；交付后浏览器已关、`/tmp/lag-auto-profile` 已擦。Codex 额度耗尽，07:30 自动化不可依靠。
- push 时远端超前 3 个提交；除本文件外另有 2 个本机 main 已有留痕提交一并推上（`trace-health`、`0903` 会话留痕，无秘密），已核查。
- 9-03 预算剩余 9；下一普通候选仍为 `youtube-7R-x9NSBS2Y`。运行报告为 `runs/2026-09-03T221000+0800-shadow-complex-delivered.json`。
- PKM 抽查：21/21 历史 inbox 资源均有 marker；8-31 条双处落盘。本条的 PKM 笔记+marker 由下一个 Daily Check-in 写入。

## 最新检查（2026-09-03 21:36:00 +0800）

- 仓库仍为 Private；v0.2 候选未推送、未部署，Pages 不恢复。
- 用户确认 inbox 已空（9-01/02/03 连续 `no_ready_resource`），授权把 9-02 已验证遗留做完。今晚只做该条交付，不做新 claim、不调 NotebookLM、不改 PicGo 设置。
- `youtube-VnRT2R0yt6c`（Designing Shadow Complex，`run-20260902073459-60639`）：4 个本地产物 SHA-256 与 9-02 记录一致，已改走桌面端 github 图床（`Medill-East/IMGStorage`）上传成功，4 条远端 URL 全部 HTTP 200 且字节一致。`autoRename` 保持 `true`，远端为时间戳名（沿用 8-31 例外口径）。
- 卡点：`content_summary` + `boundary` 正文只在 9-02 直播会话里验证过、从未落盘（私有工作台正文不得进日志），ready JSON 无法组装；ledger 未动（无 claim/retry/publish/fail），剩余额度未消耗。运行报告为 `runs/2026-09-03T213600+0800-shadow-complex-delivery.json`。
- PKM 抽查：21/21 inbox 资源均有消费 marker（与 Issue 全量对账一致）；抽查 8-31 `youtube-8uE6-vIi1rQ`，PKM 资源笔记与 DailyCheckin 条目均在。已消费=已落 PKM 成立。

## 最新检查（2026-09-01 21:49:53 +0800）

- 仓库仍为 Private；当前 v0.2 候选未推送、未部署，Pages 不恢复。
- `collect-resources-about-game` 的生产合同仍是：来源收敛为单条、中文总结带“来源边界：”、信息图/思维导图/演示文稿均须有可验证真实资产；思维导图必须执行“全部展开”并观察到至少三级且无折叠节点；`ready` 后还必须逐文件交付并回读远端 blob。
- 本次续跑前的固定预检于 20:42:22 返回 `ready_to_claim`：目录候选 2,454 条，前一条失败记录后今日已领取 2 条、剩余 8 次；用户确认最多 9 条、逐条串行、并发 1、自动重试 0，仅使用当前 NotebookLM 与已配置上传器，不调用付费 API、不写 PKM/Daily Check-in、不发布网站。
- Chrome NotebookLM 工作台已复核可用，来源面板、对话和 Studio 的信息图/思维导图/演示文稿控件均可见。
- 本次固定剩余清单前 5 条均已 claim，但没有一条达到 `ready`：
  - `youtube-ke_kOD2D-bs`（Designing Games for Game Designers，`run-20260901204456-96174`）：总结 8,519 字符且有边界段；信息图 PNG 已验为 `2752×1536`；思维导图 46 节点、最大层级 4、无折叠节点，但页面资产清单没有目标文件，唯一下载回退 3,000ms 超时，阶段 `asset-download / mind_map` 失败。
  - `youtube-neuRe4WWiKs`（Can You Make a Good Game Without Good Play Mechanics?，`run-20260901205840-1940`）：总结 3,991 字符且有边界段；信息图 PNG 已验为 `2752×1536`；思维导图 50 节点、最大层级 4、无折叠节点，但目标文件未出现在页面资产清单，唯一下载回退 3,000ms 超时，阶段 `asset-download / mind_map` 失败。
  - `youtube-fBRTIwymDyY`（Designing Over the Top - Saints Row: The Third Postmortem，`run-20260901211112-7298`）：总结 6,867 字符且有边界段；信息图页面真实加载为 `2752×1536`，但资产索引没有目标 PNG，官方下载回退 3,000ms 超时，阶段 `asset-download / info_graph` 失败。
  - `youtube-I5wwviUJV9M`（Reimagining a Classic: The Design Challenges of Deus Ex: Human Revolution，`run-20260901211927-11140`）：总结 7,498 字符且有边界段；信息图 PNG 已验为 `2752×1536`；思维导图 64 节点、最大层级 4、无折叠节点，但页面资产清单没有目标文件，唯一下载回退 3,000ms 超时，阶段 `asset-download / mind_map` 失败。
  - `youtube-qie4My7zOgI`（Player-Driven Stories: How Do We Get There?，`run-20260901213012-15398`）：总结 5,367 字符且有边界段；Studio 明确提示“您已达到每日信息图数量上限，改日再来吧！或进行升级。”，阶段 `quota / info_graph` 失败。
- 明确配额阻断后停止整批，未领取固定清单的后三条：`youtube-VnRT2R0yt6c`（Designing Shadow Complex）、`youtube-7R-x9NSBS2Y`（The Design of 'Subnautica'）、`youtube-JyuR2fKvQ20`（To Err is to Play: Human Error and Game Design）。停批后预检于 21:45:04 仍为 `ready_to_claim`，目录候选 2,454 条，`claimed_today=7`、`remaining_today=3`；这 3 次名额没有继续消耗。
- 本次续跑账目为 `attempted=5`、`ready=0`、`failed=5`、`skipped=3`、`remaining_today=3`。没有生成 ready JSON，没有写 AI-Life-Mentor inbox，没有调用 PicGo，没有写 PKM/Daily Check-in，也没有发布网站。
- 本次结构化批次报告为 `/Users/haodong/.local/state/learn-about-games/notebooklm-daily/runs/2026-09-01T214525+0800-remaining-batch.json`；原始续跑预检为 `/Users/haodong/.local/state/learn-about-games/notebooklm-daily/preflight/2026-09-01T204222+0800-preflight.json`，停批后预检为 `/Users/haodong/.local/state/learn-about-games/notebooklm-daily/preflight/2026-09-01T214504+0800-preflight.json`。

## 现在在哪

- producer ledger 已将本次 5 个 claim 全部落为明确 `failed`，没有悬挂的 `generating`、假 `ready` 或 `quota_block` 状态；此前首条 `youtube-s_I07Iq_2XM` 也仍是独立的 `failed`。
- 其中 3 张信息图 PNG 曾通过页面资产包完成本地硬校验，但因对应思维导图未形成可交付文件，不能冒充完整资源交付；另外一条信息图只在页面加载、未通过资产索引/下载回读。所有临时资产均未上传。
- 当日批次已因 NotebookLM 明确的每日信息图配额阻断停止。失败候选不自动重试，未领取候选不因停批写入 claim。

## 当前阶段

- 生产闭环保持“失败可辨认”：正文边界、信息图/思维导图节点证据和实际下载通道分别记录；页面显示“已准备就绪”或节点展开本身不替代真实资产文件。
- 远端交付链未启动，AI-Life-Mentor、PKM、Daily Check-in 和网站发布状态均未被本次续跑改变。

## 下一步

- 明早 08:30 的 Daily Check-in 会自动消费池中唯一一条（Shadow Complex）并写 PKM+marker；跑完后核对邮件与 PKM 即可。
- 新生产的下一条从 `youtube-7R-x9NSBS2Y`（The Design of Subnautica）开始，需先只读 `preflight`；9-03 剩余额度 9；9-01 的 5 条失败同日不重试。
- 浏览器自建通道脚本留存在 `/tmp/lag-*.js`（无秘密），是否沉淀为仓库工具待定；PicGo Cloud 登录不需要，已确认不走该上传器。
