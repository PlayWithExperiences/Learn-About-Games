# ProjectProgress

> 现状快照，覆盖写，不堆历史。历史看 roadmap.md 与 sessions/。

*更新于 2026-08-28 23:23:32 +0800 · 记录者 AI*

## 现在在哪

- 本轮续产（2026-08-28 23:16–23:21）：重新执行只读 `preflight --limit 10`，在上一条 ready 之后固定返回 9 条候选；精确 claim `youtube-a-zKMzboOec`，`generation_run_id=run-20260828231614-96167`。来源导入成功且唯一来源隔离通过，中文内容总结已生成；进入信息图阶段时，NotebookLM Studio 明确显示“您已达到每日信息图数量上限，改日再来吧！”，因此按 `quota_block / infographic` 留痕为 `failed`，未继续生成思维导图/Slides、未上传、未发布半成品。
- 本日生产账（截至 2026-08-28 23:21）：ledger 已记录 2 次 claim（1 条 `ready`、1 条 `failed`），`remaining_today=8`。本次固定清单剩余 8 条未 claim；因 NotebookLM 明确信息图日配额阻断，按合同停止当天后续生产，不把它们写成失败。
- 本轮真实生产（2026-08-28 20:13–22:19）：按已确认的最多 10 条、串行并发 1、自动重试 0，仅处理固定清单首条 `youtube-JGZQSFvcQzo`，`generation_run_id=run-20260828201328-3640`。同一长期 Notebook 中完成唯一来源隔离、中文内容总结、中文简体横向手绘笔记信息图（2752×1536）、查看器“全部展开”思维导图（65 个节点、最深第 4 层、折叠 0）和中文简体详细演示文稿（12 页）。
- 本轮导出与托管（2026-08-28 22:05–22:19）：NotebookLM 可见下载控件的浏览器事件桥未产出可验证本地文件；逐页读取工作台渲染图后，用本机演示文稿工具重建 PPTX/PDF，二者分别通过 OOXML 与 12 页 PDF 校验。信息图、思维导图、PPTX、PDF 四个 PicGo 地址逐一回读 HTTP 200；PNG/文件签名正确，四份远端字节与本地 SHA-256 完全一致。正式 ready JSON 已写入 `AI-Life-Mentor/notebooklm-resources/2026-0828-2219-narrative-expression.json`，本轮未写 PKM/Daily Check-in、未推送、未部署。
- 最新收集端预检（2026-08-28 19:59:35 +0800）：`notebooklm_producer.py preflight --limit 10` 成功，目录共有 2,454 个未留痕候选，今日当时 `claimed_today=0`、`remaining_today=10`，按目录顺序固定返回 10 条候选；原始 JSON 已保存到 producer 状态目录的 `preflight/2026-08-28T195935-preflight.json`。本次生产完成后 ledger 为 1 条 `ready`、今日剩余 9 次 claim。
- 现状（AI 会话 · codex，待無涘确认）：当前 v0.2 是可运行的 Astro/TypeScript 网站，包含 EGDS 能力地图、职业透镜、资源主题筛选与搜索，以及保留全局关系的 Innovation Atlas。仓库当前有 5,437 个 Work Item、5,590 个 Access Version、84 个 Atlas 节点、86 条关系和 76 项 Evidence；FPS、RPG、RTS、Open World 四条创新事件路线已满足完整闭包。仓库保持 Private，未恢复 Pages、未公开部署。
- 官方 YouTube 元数据：仓库外 ADC 缓存有 2,534 条频道元数据；现有 2,311 条目标 Work Item 100% 映射。目标中 271 条标记有字幕、2,040 条没有；`youtube.readonly` 可读取公开元数据，但不能通用解锁第三方频道字幕正文。
- 元数据一致性审计：2,311/2,311 条均能按 YouTube video ID 对回资源；来源、canonical URL、标题和 `publishedAt`/`duration`/`captionAvailability`/`privacyStatus` 均无缺失或错配，且目标记录全部为公开状态。
- 内容补全结果：2,311 条目标全部已完成并有可核对中文摘要；资源目录有 291 条可定位内容证据：237 条 Senko 二手专题摘要、1 条 Polygon 文章摘要、1 条 Nintendo Wire 文章摘要、52 条 YouTube Data API v3 官方公开描述摘要。所有摘要均带来源类型，不把文章或描述写成字幕正文。
- 长篇内容详述探针：普通 Gemini Notebook 已在用户已登录的 Google 账号中成功创建一次测试笔记本，导入公开视频 `4RlpMhBKNr0` 的 YouTube 转写，并完成一次 4,407 字符的中文内容详述；回答按演讲推进展开了分形叙事层级、下落方块迭代、设计取舍、玩家体验、可迁移方法和来源边界。结果经过人工清理，只保留正文，不把 NotebookLM 的附加引导文案当成内容。
- 内容转化路线决策：以 NotebookLM / Gemini Notebook 作为视频内容转化主力；保留现有 `summary` 数据作为目录事实，但本轮已将站内 Work Item 的 AI 摘要展示隐藏，未删除数据。完整文字版详述与 Studio 产物独立写入 PKM/每日精选；详述篇幅按内容密度决定，1800–2500 字不是硬上限，也不为凑字数扩写。
- 双层产出模型：Learn About Games 公开层只展示事实元数据、来源和访问版本，不直接暴露 PKM 长文或私有 Notebook 链接；PKM 层保存完整文字版总结、引用/证据边界、信息图、思维导图、演示文稿及明确生成状态。Daily Check-in 每天抽取一篇并链接到 PKM 原文，不把同一长文重复灌进网站目录。
- NotebookLM 多模态托管边界：本轮已按固定模板完成 Celeste 四项 Studio 产物：中文简体、横向、手绘笔记、详细 Beta 信息图；中文简体完整展开（三级结构）思维导图；中文简体默认时长详细演示文稿（12 页 PowerPoint）及本地免费转换的 PDF。四份文件均从 NotebookLM/本机转换链下载或生成并经格式核验，再通过 PicGo 上传到 `Medill-East/IMGStorage`；PNG/PPTX/PDF 稳定地址均回读 HTTP 200。正式记录使用带当前时间戳和语义文件名的 PicGo 地址，不把可能失效的 NotebookLM 私有链接当成媒体托管地址。
- NotebookLM 资产模板修复（2026-08-23 23:31）：PKM 与 Daily Check-in 的来源、信息图、思维导图、演示文稿、内容总结和来源边界统一为 H3 无冒号；PNG 使用 `![...](...)`，演示文稿保留 PPTX 普通链接，PDF 使用普通 `[...](...)` 链接，不把 Slides 转成图片。旧 PicGo 文件未删除，只由新地址替代。
- NotebookLM Slides 入口同步（2026-08-23 23:54）：资源记录没有独立的 Slides 直达链接，只有 NotebookLM 工作台地址；渲染器、PKM 和 Daily Check-in #182 在现有 PPTX 链接正下方追加 `[NotebookLM 工作台（Slides）](...)`，并保留后续 PDF 普通链接。该私有工作台链接只出现在 PKM/每日精选，不进入 Learn About Games 公开层。
- NotebookLM 页面入口纠正（2026-08-24 00:06）：确认 `gemini.google.com/notebook/...` 不是用户查看 NotebookLM 产物的实际页面，Celeste 资源 fixture、PKM 来源与 Slides 入口、Daily Check-in #182 已统一改为 `notebook.google.com/notebook/...`；公开网站层仍不暴露该私有入口。
- 官方配额核对（以 [Gemini Notebook 官方配额表](https://support.google.com/geminotebook/answer/16213268?hl=en) 为准）：Plus 为 200 notebooks/user、100 sources/notebook、200 chats/day、6 audio/day、6 video/day、20 reports/day、20 flashcards/day、20 quizzes/day、20 mind maps/day、3 次 Deep Research/day；信息图与幻灯片页面显示为 More limits，没有公开固定数字，且官方注明会变化。账号当前已用量不由本机 ledger 代表。
- 配额重置与消费者触发核对（2026-08-27 12:37）：官方只说明 daily quotas 在 24 小时后重置、monthly quotas 在 30 天后重置，没有承诺北京时间零点或公开当前账号的精确重置时刻；本次最后一次明确配额拦截为 07:36:40，因此 08-28 07:36:40 后只能作为保守的首次探测点，不是服务端保证的固定重置点。NotebookLM producer 的每日 07:30 自动收集与 AI-Life-Mentor GitHub Actions 的 08:30（UTC 00:30）Daily Check-in 是两条独立链路；后者每次只消费 1 条 ready 资源，支持 `workflow_dispatch`，无 ready 时仍可创建普通 Check-in。08-27 截至 12:37 仍无该 workflow run。

## 当前阶段

- 首条 `youtube-JGZQSFvcQzo` 的 contract v2 资源仍在本地 ready 队列，包含总结、来源边界、三类 Studio 产物和思维导图展开证明；本轮续产的 `youtube-a-zKMzboOec` 已按信息图日配额阻断记为 `failed`，没有生成 ready 或半成品。
- 当前工作台仍可访问，但账号侧信息图日配额是本轮实际阻塞；今日剩余 8 次 claim 位不再使用。默认边界仍停在 `AI-Life-Mentor/notebooklm-resources`，没有触发远端推送或 Daily Check-in 消费。
- 浏览器就绪阻塞与批次授权等待均已解除（2026-08-28 20:07–20:13）：同一长期 Notebook 的来源面板、唯一来源隔离和 Studio 控件均可见可操作。后续若继续生产，必须重新进行当天的只读 preflight，不得复用本次已固定清单之外的候选。
- 资源侧已完成官方描述回退、二手旁证和剩余音频补全：49 条原本处于 `retryable` 的条目依据官方描述补齐；GDC Iwata 纪念片与 GMTK 宣传片随后通过显式音频工具链完成分析。2,311 条目标的 state 均为 `completed`，没有遗留 retryable。
- 映射保守边界：2,311 条目标均已有一个合法主要资源主题；其中 1,677 条至少有一个 capability，634 条 capability 仍为空（GDC 625、英文樱井 8、GMTK 1）。这不是用模板硬填的缺陷：公告、汇编或证据不足的条目若不能直接支持某项能力，就保留空映射，避免把标题猜测写成语义事实。
- 正式 state 已回写：2,311 条记录、2,311 `completed`、0 `retryable`、0 `unclassified`、0 `evidence_pending`。其中 1,871 条来自官方描述分析、210 条字幕分析、4 条音频分析、177 条二手旁证回写；49 条历史完成记录没有重新猜测输入通道，保留原有 model/summaryLength 事实。
- 外部回写脚本具备严格合同：只接受固定 provider/label、150–250 字中文摘要、合法 URL、唯一主要资源主题；保留已有 completed，允许审核过的证据替换 retryable。新增 `--reconcile-summary-lengths`，已修正 23 条历史 state 元数据滞后，不改摘要正文。
- 最终验证已通过：Python 回填/runtime/metadata 测试 45/45，JSON、`git diff --check`、secret scan 通过；`npm run build` 通过 Astro check 0/0/0、Vitest 204/204、静态构建 151 页。
- 本机预览诊断（2026-08-23 22:03）：初次访问 `http://127.0.0.1:4321/Learn-About-Games/resources/` 与站点根路径均为 connection refused，4321 没有监听进程；这证明本次故障边界是开发服务器未运行，不是资源路由 404。执行 `npm run dev -- --host 127.0.0.1` 后，Astro v7.2.0 以后台进程运行，`astro dev status` 显示正常；资源页及带 `resourceTopic` 参数的 URL 均返回 HTTP 200，`npm run check` 为 0 errors / 0 warnings。没有现有日志证据能判定上一次进程为何消失，不能把它写成已确认的崩溃。
- 资源页当前单次 HTML 响应约 13.9 MB（5,437 个 Work Item）；这是独立的初始加载性能风险，本次探针已与“端口无服务”区分记录，未把它误判成宕机。
- 外部观察语义核查（2026-08-23 22:10）：资源页截图中的“外部事实”实际对应 `externalSignals`，是第三方来源的可追溯旁证，不是官方视频正文、本站评分或推荐等级。示例资源 `Don’t Put Decisions Off [Team Management]` 的记录指向 Senko's Activity Log 的 Team Management 专题，并明确标为“二手专题摘要（非视频正文）”；页面当前将其显示为“查看访问版本与外部事实 / 外部公开观察”，该命名容易让用户误解为本站确认的内容事实，尚未做 UI 改名或隐藏决定。
- 外部旁证语义修正（2026-08-23 22:28）：全仓审计确认 `externalSignals` 是第三方来源的可追溯旁证，不是官方视频正文、本站评分或推荐等级。用户可见的“查看访问版本与外部事实 / 外部公开观察”已统一为“查看访问版本与外部旁证 / 外部旁证”，并补充“不等同于原始内容、不用于评分、排序或推荐”的说明；内部字段和 catalog 数据结构保持不迁移。Vitest 205/205、Astro check 0/0/0、静态构建 151 页、Resources E2E 桌面/移动 44/44 通过。
- 官方描述旁证对象修正（2026-08-23 22:45）：复查发现 52 条记录把取证通道 `YouTube Data API v3` 当作用户可见来源，并用统一免责声明代替具体证据。现已改为 `YouTube` 来源、`视频简介首段（原文摘录，非字幕正文）` 对象，并从本机官方元数据缓存写入各视频实际简介首段；保留视频页 URL、观察日期和非字幕正文边界。最终 `npm run build` 为 Astro 0/0/0、Vitest 206/206、静态构建 151 页；Resources E2E 桌面/移动 46/46。
- NotebookLM 每日精选线已接通：`AI-Life-Mentor` 用 reviewed JSON inbox 接收人工生成结果，空目录是可见的正常 no-op，坏 JSON、消费状态查询失败和 PKM 写回失败都会抛出；不会在定时脚本内偷偷调用 NotebookLM 或模型。Celeste fixture 已更新为三项 `generated` 产物，Daily Check-in #182 的旧 `not-generated` 行已替换并回读确认；PKM `PlayWithExperiences/AI/Learn-About-Games/2026-0823-2051-designing-celeste.md` 也已写入三条 PicGo 链接。
- 本轮新增真实外部操作严格限定为一条候选资源 `youtube-hTNA84vJNEc`：NotebookLM 内容详述、信息图、完整思维导图和演示文稿各生成一次；PPTX 在本机转换为 PDF；四项资产各通过 PicGo 上传一次并回读校验。没有重试、没有 OpenRouter 新批量调用、没有订阅或其他付费操作。
- 单条产出已写入 `AI-Life-Mentor/notebooklm-resources/2026-0824-0258-design-fundamentals.json`，由 `publish-notebooklm-resource.sh` 保护性提交并推送到 AI-Life-Mentor `main`；PKM 笔记与 Daily Check-in #183 已回读确认。NotebookLM 工作台链接只保留在 PKM/每日精选，媒体使用 PicGo 稳定地址。
- 两个 `codex/notebooklm-daily` feature 分支已分别以非快进方式合并到 Learn-About-Games `main` 与 AI-Life-Mentor `main`；Learn-About-Games 保持私有且未推送，AI-Life-Mentor 已推送到远端。已合并工作树已清理，本机 Skill 入口已切回 Learn-About-Games `main`。
- 本次自动化验证已通过：producer 测试 15/15、preflight runner 测试 3/3、publish 测试 2/2、AI-Life-Mentor NotebookLM 测试 14/14；NotebookLM 产物、PicGo 四个 URL、PDF/PPTX/PNG 文件格式和远端内容一致性均已核验。网站相关既有构建基线仍为 Astro check 0/0/0、Vitest 206/206；未把未相关的全量 E2E 历史失败写成已修复。
- NotebookLM 每日精选线已接通：`AI-Life-Mentor` 用 reviewed JSON inbox 接收人工生成结果，空目录是可见的正常 no-op，坏 JSON、消费状态查询失败和 PKM 写回失败都会抛出；不会在定时脚本内偷偷调用 NotebookLM 或模型。Celeste fixture 已通过本地校验，Daily Check-in #182 与 PKM `PlayWithExperiences/AI/Learn-About-Games/2026-0823-2051-designing-celeste.md` 均已回读确认。
- NotebookLM 每日生产自动化已实现（2026-08-24 01:29）：`scripts/notebooklm_producer.py` 从 2,454 个唯一 YouTube `video_id` 中按稳定顺序选择候选，使用本地 ledger、单实例锁和 `generating → ready/failed` 状态防止重复调用；收集流程的唯一真源现为项目级 `.agents/skills/collect-resources-about-game/`，原 `tools/notebooklm-daily-resource` 只保留兼容别名，07:30 自动化已切换到共享入口。AI-Life-Mentor 消费端已改为全量分页扫描历史 Issue，ready-only 校验并保留旧 Celeste 记录兼容性。
- 跨 AI 收集 skill 已落地（2026-08-27 13:20）：标准 slug 为 `collect-resources-about-game`，用户可见调用名保留 `/Collect-Resources-About-Game`；核心 `SKILL.md`、v2 资源合同和平台无关的失败/证据/Notebook 复用规则进入仓库，可被支持 Agent Skills 的客户端从 `.agents/skills/` 读取。本机 `.agents`、`.claude`、`.codex` 三个入口均指向同一份真源，客户端差异只留在浏览器、下载监听和上传适配器；本轮没有触发真实 NotebookLM 生产。
- 自动化边界已落地：`automation/notebooklm-daily-preflight.sh` 与 07:30 launchd plist 保持为本地 preflight 模板、未安装以避免重复调度；Codex 本机 cron `Learn About Games — NotebookLM 每日学习资源` 已启用，每天 07:30（北京时间）最多串行处理十条，失败留 ledger 并通知，不重试同一视频。现有 GitHub Actions Daily Check-in 仍在 08:30 消费 ready JSON。
- 本轮真实单次生产已完成并经过人工浏览器验收；后续调度会复用同一 Skill/合同，不在定时脚本内偷偷调用 NotebookLM，也不手动触发会调用 OpenRouter 的完整 Daily Check-in。
- Daily Check-in 消费故障核查（2026-08-24 10:31:51）：事实：远端 ready 资源 `youtube-hTNA84vJNEc` 存在，但已通过 NotebookLM 补发 Issue #183 写入并带 marker；Celeste 资源已由 Issue #182 标记，完整分页扫描后两条都属于已消费。Action run [32681846088](https://github.com/Medill-East/AI-Life-Mentor/actions/runs/32681846088) 先成功生成每日正文，随后在 `pick_resource` 得到空候选池时抛出 `NoNotebookLMResource`，创建失败 Issue #184；不是 NotebookLM 内容缺失，也不是消费状态查询失败。
- 同日 producer ledger 另有一条 `youtube-E4ZUgPoDrvY` 在 asset-download 阶段失败，未写 ready JSON、未上传或推送；当前本地 preflight 只报告下一个候选 `_gbJw7orSI8` 为 `ready_to_claim`，本次没有 claim 或重跑。
- NotebookLM 队列与批量上限修复（2026-08-24 10:56）：`AI-Life-Mentor/scripts/daily_checkin.py` 现在只把“ready 资源全部已消费”的 `NoNotebookLMResource` 当作可观察 no-op；消费状态查询失败、坏 JSON、非 ready 资源和 PKM 写回失败仍会抛错。`Learn-About-Games/scripts/notebooklm_producer.py` 增加只读 `--limit 10` 批量预检、精确 `--resource-id` claim，以及按北京时间自然日最多 10 次 claim 的锁内上限；失败 claim 也计数，避免实际已消耗 NotebookLM 配额却被重试。版本化 Skill 与 Codex cron 已同步为串行最多 10 条、失败留痕后继续、不自动重试。
- 2026-08-24 修复后的只读 preflight 显示目录共有 2,454 个唯一候选；当日已有 2 次 claim（`youtube-hTNA84vJNEc` ready、`youtube-E4ZUgPoDrvY` failed），因此当日还剩 8 次本地生产尝试额度。该次预检返回 8 条候选，没有 claim、没有 NotebookLM 外部调用。
- 免费路由器 smoke test：仓库外临时启动 FreeLLMAPI Docker 实例，仅使用匿名免费渠道并处理一条真实《Designing Celeste》字幕；裸模型名被同名模型合并解析到 Navy，改用精确 `ovh:Qwen3.5-397B-A17B` 后确实到达 OVH，但上游返回 429；Kilo 的 `nvidia/nemotron-3-ultra-550b-a55b:free` 在 60 秒上游超时内未返回。未写回仓库、未启用付费模型或 Premium；当前结论是该路由器可作为本地兼容层候选，但免费匿名端点尚不足以承接长字幕批量总结。
- NotebookLM 批量续做（2026-08-24 14:39）：在同一长期工作 Notebook 中完成并发布 3 条新的 ready 资源：`youtube-_gbJw7orSI8`、`youtube-tR-9oXiytsk`、`youtube-7rqfbvnO_H0`；每条均完成当前来源单选、中文总结、信息图、思维导图、Slides、PPTX/PDF 下载校验、PicGo 回读和受保护推送。第 4 条 `youtube-ii_Q4OCoHvU` 已完成总结与思维导图，但 NotebookLM 明确显示“已达到每日信息图数量上限”，未生成信息图，已在 ledger 以 `failed` 留痕，未写 ready JSON、未继续生成无法消费的 Slides。
- 2026-08-24 当日 ledger 共 6 次 claim：4 条 ready（含此前 `youtube-hTNA84vJNEc`）、2 条 failed（含此前下载失败与本次信息图配额失败）。ready JSON 是 PKM 的持久化资源队列；Daily Check-in 每天只选择 1 条未消费资源写入 `AI/DailyCheckin/` 并附到 Issue，不会删除 ready JSON。已将自动化更新为：明确命中 NotebookLM 某类资产的当日配额时记录 `quota_block` 并停止当天剩余 claim；Slides 单条允许最长等待 15 分钟。
- 思维导图根因核查（2026-08-25 12:52）：Daily Check-in #185 消费的 `youtube-tR-9oXiytsk` 对应 PNG 为 2049×1337，图像本身只有根节点和 7 个一级分支，分支右侧仍有 `>` 折叠指示；故障发生在 NotebookLM 默认导出未执行查看器“全部展开”，不是 PKM 渲染裁切。Learn-About-Games commit `7aad100` 将 ready 合同升级为 v2：必须记录查看器操作、至少三级节点和 0 个剩余折叠节点，生产器缺一即拒绝；AI-Life-Mentor consumer commit `2ddbe10` 已合并远端并推送（merge `533de75`），新 v2 资源再次消费时也会拒绝假成功，旧资源保持兼容读取。
- 自动化运行核对（2026-08-25 12:52）：Codex cron 仍为 ACTIVE、每天 07:30、单日最多 10 次串行 claim；今天实际触发并 claim `youtube-yorTG9at90g`，但在 NotebookLM 工作台写权限检查处以 `browser-notebook-access` 失败，未生成 ready JSON。Daily Check-in Action [32799530766](https://github.com/Medill-East/AI-Life-Mentor/actions/runs/32799530766) 于 08:30 成功，Issue #185 正确消费昨天队列中的一条。当前只读 preflight 为 2,454 个候选、今日已 claim 1、剩余本地尝试 9；没有为验证而额外调用 NotebookLM。
- 旧队列隔离（2026-08-25 12:58）：只读下载确认未消费的 `youtube-_gbJw7orSI8` 思维导图为 1875×938、`youtube-7rqfbvnO_H0` 为 1549×936，均仍有 `>` 折叠指示；已在 AI-Life-Mentor 中标记 `delivery_status: quarantined` 并推送 commit `4d15fc3`，消费端现跳过它们。Celeste 的 4134×13238 图保留为已验证完整展开资源；现存队列没有再发现未隔离的折叠未消费图。
- NotebookLM 批量生产收尾（2026-08-25 16:02）：今天 ledger 共 8 次 distinct claim/production attempt，6 条 `ready`、2 条 `failed`，达到 10 次日上限的 80%。`youtube-yorTG9at90g` 在工作台写权限预检处失败；`youtube-f8VIlfTtypg` 在信息图阶段收到 NotebookLM 明确的每日数量上限，已停止该条 Slides 和后续候选，未生成 ready JSON。6 条 ready（`youtube-pmSAG51BybY`、`youtube-3Omb5exWpd4`、`youtube-XW7KvppTspc`、`youtube-GZ99gAb4T0o`、`youtube-SpRJuinc9AM`、`youtube-VZ4xevskMCI`）均通过 contract v2；思维导图 proof 为查看器“全部展开”、深度 4–5、折叠 0，四项远端资产逐个字节回读一致，6 个 ready JSON 均已在 `AI-Life-Mentor` `origin/main` 可读。全部 6 条复用了同一个 Notebook，没有为单条材料新建笔记本。
- 自动化当前事实（2026-08-25 16:08）：Codex 定时任务 `learn-about-games-notebooklm` 为 `ACTIVE`，每天 07:30（北京时间）串行最多 10 次、失败不重试并在明确配额耗尽时停止；本机没有重复 cron，仓库内 launchd plist 是备用 preflight 模板，当前未加载以避免双重调度。Daily Check-in 仍由 `AI-Life-Mentor` 的 GitHub Actions 在 08:30 每天消费 1 条 ready。
- NotebookLM 今日批次停止（2026-08-26 07:33，时间取自系统 `date`）：本次只读 preflight 返回 10 条候选、`claimed_today=0`、`remaining_today=10`；Chrome 中的长期工作 Notebook `https://notebook.google.com/notebook/880ad454-f2a0-4246-85c3-40a8b2f54af2` 通过了可编辑性预检，来源面板与 Studio 控件均存在。随后精确 claim 首条 `youtube-mncyepcgJO8`，但在当前可见 Studio 区域立即读到 NotebookLM 明文提示“您已达到每日信息图数量上限，改日再来吧！”。该条已按 `quota_block` 记入 ledger 为 `failed`，没有继续导入来源、没有生成任何新摘要/信息图/思维导图/Slides、没有 PicGo 上传、没有 ready JSON、没有运行 `publish-notebooklm-resource.sh`。停止后再次只读 preflight 显示 `claimed_today=1`、`remaining_today=9`，下一条候选是 `youtube-8FgBctI5ulU`，但按配额护栏本日不再继续 claim。
- 2026-08-27 NotebookLM / Daily Check-in 链路核对（12:30）：Codex 自动任务于 07:33 自动运行，精确 claim `youtube-8FgBctI5ulU`，在导入来源并提交新总结查询后收到 NotebookLM 明文“您已达到每日信息图数量上限，改日再来吧！”，07:36:40 记为 `quota_block` failed，未生成新 ready。GitHub Actions 的 Daily Check-in workflow 仍为 active、仓库 Actions 仍 enabled，但 GitHub API 查询 2026-08-27 的该 workflow run 数为 0，远端最新 Daily Check-in 仍是 8 月 26 日成功的 Issue #186；因此今天未发的直接原因是消费者没有被 GitHub scheduled event 创建/排队，而不是无 ready 内容。远端当前仍有 5 条未被历史 Issue marker 消费的 ready 资源。
- 双路径单次验证（2026-08-27 12:55）：按用户要求，producer 只对下一候选 `youtube-_sslFBVy5Lc` 做了一次精确 claim；同一长期 Notebook 导入成功、唯一来源隔离成功、文字总结完成，但信息图配额仍被明确拦截，已在 ledger 记为 `quota_block` failed，未生成半成品 ready。随后单次手动 dispatch `33040627453` 成功创建 Daily Check-in Issue #187，并消费一条既有 ready（`youtube-XW7KvppTspc`）。消费端已加入 `no_ready_resource` 正文提示和同日成功 Issue 幂等检查，远端 Python 修复已推送到 `main`；workflow YAML 的并发增强因当前 OAuth 缺少 `workflow` scope 未推送。

## 下一步

- 当前已有 1 条 ready、1 条 quota-block failed；若在配额恢复后启动下一次生产，先重新做不消耗额度的工作台就绪检查和 preflight，再从新的固定清单继续，不能自动重试 `youtube-a-zKMzboOec`。今日 ledger 已使用 2 次 claim、剩余 8 次；本场不再领取其余候选。
- NotebookLM 恢复生产前，先重新执行不消耗额度的工作台就绪检查；只有同时看到已登录可编辑页面、来源面板和 Studio 控件，才可按本次固定候选顺序 claim。当前首条是 `youtube-JGZQSFvcQzo`，本次未领取；普通运行级阻塞不应改写候选状态。
- 内容补全目标已闭环；后续只需观察新的 YouTube 条目或凭据/平台策略变化，不再重复处理这 2,311 条。
- 2026-08-27 的收集已自动触发，并按用户要求对下一候选做了一次受限探针；信息图配额仍未恢复，producer 已停止。Daily Check-in 已通过单次手动 dispatch 成功生成 Issue #187 并消费 1 条 ready；远端队列剩余内容继续由后续每日消费者各消费 1 条。
- 消费端现已把“无 ready”作为成功的可见状态（`no_ready_resource`），并在同日已有成功 Issue 时跳过重复模型调用；同日 workflow 延迟与手动补跑的并发锁增强仍待取得 GitHub `workflow` scope 后再推送，当前不影响已推送的 Python 幂等护栏。
- 今天（系统时钟 2026-08-26）已在首条 claim 前完成 NotebookLM 工作台访问预检，并在首条 claim 后命中信息图明确配额提示；因此本日外部生产已停止。下一自然日从不消耗额度的预检重新开始，再从 `youtube-8FgBctI5ulU` 继续，不回头重试 `youtube-mncyepcgJO8`。
- 每天由本机 Codex cron 按 ledger 最多串行选取 10 条未处理资源，完成 NotebookLM → 下载/转换 → PicGo → ready JSON → AI-Life-Mentor `main` 的链路；次日 GitHub Actions 每天只消费 1 条到 Daily Check-in 与 PKM。producer 的 `generating → ready/failed`、北京时间 10 次 claim guard、唯一 marker 和完整 Issue 分页扫描共同防止重复或假成功；若 NotebookLM 明确返回某类资产的当日配额耗尽，则记录 `quota_block` 并停止当天批次。
- 下次生产先做不消耗额度的 NotebookLM 工作台就绪预检；本次已确认 `notebook.google.com/notebook/...` 可编辑且来源/Studio 控件存在。每条思维导图必须在查看器执行“更多选项 → 全部展开”并通过 v2 合同门槛。今天已收到的 #185 资源本身仍是旧合同的折叠图，待下一自然日配额恢复后按 v2 单条补发，不能把重新生成伪装成已修复。
- 两条已隔离旧资源（`youtube-_gbJw7orSI8`、`youtube-7rqfbvnO_H0`）待下一自然日配额恢复后各做一次单条 v2 补发；`youtube-f8VIlfTtypg` 已明确失败，不自动重试、不为单条材料新建 Notebook。
- “排空队列”已落为 `attach_notebooklm_resource` 回归测试并修复；资源补发 Issue 仍计入消费，避免次日重复投递。调度提示已要求先监听真实下载事件，再做字节/类型/尺寸校验；页面点击、pageAssets 列表或 HTTP 响应不再作为下载成功判据。
- 不自动对全库生成 Studio 多模态产物；任何扩大到批量、换模型、重试、订阅或可能计费的 API/云服务调用，都必须在开始前重新取得用户确认。
- 在实现多模态展示前，先确定 `artifact` 资产层和托管策略：图片/思维导图可导出后静态托管，演示文稿导出 PDF/PPTX，音频/视频不直接塞进 Git 仓库，优先使用对象存储或只保留外部分享入口。公开前需逐项审核 NotebookLM 分享权限、原始来源版权和生成内容的可公开性。
- AI Plus 适合作为每日精选和小批研究的容量升级，不足以把 2,311 条资源的文字、信息图、思维导图、演示文稿全部一次性生成；批量方案还受普通 Notebook 网页入口、浏览器自动化稳定性和版权/分享边界限制。购买或升级订阅必须另行获得确认。
- 保持仓库 Private；公开或部署仍需先处理资源页 5,437 条 Work Item 的初始 DOM/客户端筛选成本，并完成线上验收。
- 本机预览目前需要显式运行 `npm run dev -- --host 127.0.0.1`；本次没有修改网站代码、部署设置或公开状态。若要避免开发服务器进程不存在导致 URL 再次不可访问，需要另行决定是否配置常驻进程或固定启动入口。

## 阻塞 / 待定

- 首条资源的浏览器工作台、唯一来源、四项产物、PicGo 回读和 ready JSON 均已验证；本轮续产在第二条的信息图阶段遇到明确的 NotebookLM 日配额阻断，已写入 ledger 的 `failed`，没有继续当天批次。NotebookLM 直接下载事件桥仍未落盘文件，首条已用逐页渲染图重建 PPTX/PDF，并把这一导出边界写入会话留痕；若未来要求原生可编辑 PPTX，需要另行修复下载适配器。
- 当前新增阻塞（2026-08-28 23:21）：`youtube-a-zKMzboOec` 在来源导入和文字总结成功后，进入信息图阶段时读取到 Studio 明文提示“您已达到每日信息图数量上限，改日再来吧！”。该 claim 已按 `quota_block / infographic` 失败留痕，未调用替代模型、付费 API 或自动重试；当天其余 8 条固定候选全部保持未 claim。
- Vision 为 AI 草稿，待無涘确认。
- 本轮外部 state 回写与摘要长度对账已完成；无 YouTube 内容补全阻塞。
- NotebookLM→PKM/Daily Check-in 批量生产、PicGo 稳定托管与每日单条消费已打通；ready JSON 先进入 PKM 资源队列，Daily Check-in 再逐日消费。当前 NotebookLM 仍是网页端入口，不应当作批量 API；本日已触达信息图配额，剩余候选留到下一自然日。公开资产版权与托管策略仍需在未来公开前逐项核对。
- 当前新增阻塞：本日 NotebookLM 在第 7 条的信息图阶段明确返回每日数量上限，故停止当天剩余 2 个内部 claim 位；该失败已写入 ledger，未生成空 JSON、未继续调用 Slides、未领取后续候选。此前的工作台访问失败也已单独留痕；当前工作台已恢复可写，下一自然日从不消耗额度的预检开始。
- 当前新增阻塞（系统时钟 2026-08-26 07:33）：今天新的首条 claim `youtube-mncyepcgJO8` 在尚未导入当前来源前，就从当前可见 Studio 区域读到 NotebookLM 明文提示“您已达到每日信息图数量上限，改日再来吧！”。该条已按 `quota_block` 失败留痕，今天剩余 9 个本地 claim 位不再使用，以免把明确的服务配额耗尽伪装成普通超时或继续制造无法 ready 的半成品。
- 当前新增阻塞（2026-08-27 12:55）：NotebookLM 生产自动任务与一次受限候选探针均被信息图日配额拦截，未生成新 ready；该阻塞已分别写入 ledger。Daily Check-in 的手动 run `33040627453` 已成功创建 Issue #187，故“未发”阻塞已解除；当前只剩 NotebookLM 配额未恢复，以及 workflow 并发增强因 OAuth scope 暂未推送。
- 待确认：网站是否托管 NotebookLM 导出的本地资产，还是只提供 NotebookLM 外链；当前更推荐“网站自托管可公开资产 + NotebookLM 外链作为补充”，避免私有链接导致访客无法查看或链接失效。
- 费用边界：本轮（2026-08-25）只执行了用户确认范围内的 8 次 NotebookLM 网页生产尝试，成功写回 6 条 ready；没有 OpenRouter、付费 API、订阅、充值或其他现实金额操作。NotebookLM 账号侧实际配额仍以服务端显示为准，任何现实金额操作仍须先询问無涘。
- 验证边界：Learn About Games 定向资源 E2E 桌面/移动的摘要隐藏测试通过；全量 E2E 为 251 passed、22 skipped、13 failed。13 项失败集中在 Atlas/Map/Career 重载单例、并发导航超时和既有质量词断言，不能宣称全量全绿；本次代码构建、Vitest 与改动相关测试通过。
- 主要产品风险仍是资源数量增长可能造成错配、重复归类或证据等级混淆；Innovation Atlas 的低证据透镜继续保持未闭合，不因资源补全自动闭合。

原始对话：dialogues/2026-0825.md「1253 思维导图根因修复与每日生产核对」
