# ProjectProgress

> 现状快照，覆盖写，不堆历史。历史看 roadmap.md 与 sessions/。

*更新于 2026-08-24 10:31:51 · 记录者 AI*

## 现在在哪

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
- 官方配额核对（以 [Gemini Notebook 官方配额表](https://support.google.com/notebooklm/answer/16213268?hl=en) 为准）：Standard 为 100 notebooks/user、50 sources/notebook、50 chats/day、3 audio/day、3 video/day；Plus 为 200、100、200、6、6；Pro 为 500、300、500、20、20。日报、信息图、幻灯片等另有独立额度，且官方注明会变化。

## 当前阶段

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
- NotebookLM 每日生产自动化已实现（2026-08-24 01:29）：`scripts/notebooklm_producer.py` 从 2,454 个唯一 YouTube `video_id` 中按稳定顺序选择候选，使用本地 ledger、单实例锁和 `generating → ready/failed` 状态防止重复调用；`tools/notebooklm-daily-resource` 已作为版本化本机 Skill，并通过 `/Users/haodong/.codex/skills/notebooklm-daily-resource` 暴露。AI-Life-Mentor 消费端已改为全量分页扫描历史 Issue，ready-only 校验并保留旧 Celeste 记录兼容性。
- 自动化边界已落地：`automation/notebooklm-daily-preflight.sh` 与 07:30 launchd plist 保持为本地 preflight 模板、未安装以避免重复调度；Codex 本机 cron `Learn About Games — NotebookLM 每日学习资源` 已启用，每天 07:30（北京时间）只处理一条，失败留 ledger 并通知，不重试。现有 GitHub Actions Daily Check-in 仍在 08:30 消费 ready JSON。
- 本轮真实单次生产已完成并经过人工浏览器验收；后续调度会复用同一 Skill/合同，不在定时脚本内偷偷调用 NotebookLM，也不手动触发会调用 OpenRouter 的完整 Daily Check-in。
- Daily Check-in 消费故障核查（2026-08-24 10:31:51）：事实：远端 ready 资源 `youtube-hTNA84vJNEc` 存在，但已通过 NotebookLM 补发 Issue #183 写入并带 marker；Celeste 资源已由 Issue #182 标记，完整分页扫描后两条都属于已消费。Action run [32681846088](https://github.com/Medill-East/AI-Life-Mentor/actions/runs/32681846088) 先成功生成每日正文，随后在 `pick_resource` 得到空候选池时抛出 `NoNotebookLMResource`，创建失败 Issue #184；不是 NotebookLM 内容缺失，也不是消费状态查询失败。
- 同日 producer ledger 另有一条 `youtube-E4ZUgPoDrvY` 在 asset-download 阶段失败，未写 ready JSON、未上传或推送；当前本地 preflight 只报告下一个候选 `_gbJw7orSI8` 为 `ready_to_claim`，本次没有 claim 或重跑。
- 免费路由器 smoke test：仓库外临时启动 FreeLLMAPI Docker 实例，仅使用匿名免费渠道并处理一条真实《Designing Celeste》字幕；裸模型名被同名模型合并解析到 Navy，改用精确 `ovh:Qwen3.5-397B-A17B` 后确实到达 OVH，但上游返回 429；Kilo 的 `nvidia/nemotron-3-ultra-550b-a55b:free` 在 60 秒上游超时内未返回。未写回仓库、未启用付费模型或 Premium；当前结论是该路由器可作为本地兼容层候选，但免费匿名端点尚不足以承接长字幕批量总结。

## 下一步

- 内容补全目标已闭环；后续只需观察新的 YouTube 条目或凭据/平台策略变化，不再重复处理这 2,311 条。
- 每天由本机 Codex cron 按 ledger 选取一条未处理资源，完成 NotebookLM → 下载/转换 → PicGo → ready JSON → AI-Life-Mentor `main` 的链路；次日 GitHub Actions 再消费到 Daily Check-in 与 PKM。producer 的 `generating → ready/failed`、唯一 marker 和完整 Issue 分页扫描共同防止重复。
- 建议（未实施）：AI-Life-Mentor 消费端应把“目录有记录但全部 ready 资源均已被 marker 消费”当作可观察的正常 no-op；继续让坏 JSON、消费状态查询失败和 PKM 写回失败抛错，并为“排空队列”补一条 `attach_notebooklm_resource` 回归测试。资源补发 Issue 仍应计入消费，避免次日重复投递。
- 不自动对全库生成 Studio 多模态产物；任何扩大到批量、换模型、重试、订阅或可能计费的 API/云服务调用，都必须在开始前重新取得用户确认。
- 在实现多模态展示前，先确定 `artifact` 资产层和托管策略：图片/思维导图可导出后静态托管，演示文稿导出 PDF/PPTX，音频/视频不直接塞进 Git 仓库，优先使用对象存储或只保留外部分享入口。公开前需逐项审核 NotebookLM 分享权限、原始来源版权和生成内容的可公开性。
- AI Plus 适合作为每日精选和小批研究的容量升级，不足以把 2,311 条资源的文字、信息图、思维导图、演示文稿全部一次性生成；批量方案还受普通 Notebook 网页入口、浏览器自动化稳定性和版权/分享边界限制。购买或升级订阅必须另行获得确认。
- 保持仓库 Private；公开或部署仍需先处理资源页 5,437 条 Work Item 的初始 DOM/客户端筛选成本，并完成线上验收。
- 本机预览目前需要显式运行 `npm run dev -- --host 127.0.0.1`；本次没有修改网站代码、部署设置或公开状态。若要避免开发服务器进程不存在导致 URL 再次不可访问，需要另行决定是否配置常驻进程或固定启动入口。

## 阻塞 / 待定

- Vision 为 AI 草稿，待無涘确认。
- 本轮外部 state 回写与摘要长度对账已完成；无 YouTube 内容补全阻塞。
- NotebookLM→PKM/Daily Check-in 单条生产、PicGo 稳定托管与每日调度已打通；当前 NotebookLM 仍是网页端入口，不应当作批量 API。公开资产版权与托管策略仍需在未来公开前逐项核对。
- 待确认：网站是否托管 NotebookLM 导出的本地资产，还是只提供 NotebookLM 外链；当前更推荐“网站自托管可公开资产 + NotebookLM 外链作为补充”，避免私有链接导致访客无法查看或链接失效。
- 费用边界：本轮没有订阅、没有 OpenRouter 调用、没有付费 API 或大批量生成；只完成一条 NotebookLM 生产和四项资产托管。NotebookLM 账号侧实际配额/计费状态未由本机推断，任何现实金额操作仍须先询问無涘。
- 验证边界：Learn About Games 定向资源 E2E 桌面/移动的摘要隐藏测试通过；全量 E2E 为 251 passed、22 skipped、13 failed。13 项失败集中在 Atlas/Map/Career 重载单例、并发导航超时和既有质量词断言，不能宣称全量全绿；本次代码构建、Vitest 与改动相关测试通过。
- 主要产品风险仍是资源数量增长可能造成错配、重复归类或证据等级混淆；Innovation Atlas 的低证据透镜继续保持未闭合，不因资源补全自动闭合。

原始对话：dialogues/2026-0823.md「0447 官方描述回退、内容对账与外部回写边界」
