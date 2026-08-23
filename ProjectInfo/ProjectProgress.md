# ProjectProgress

> 现状快照，覆盖写，不堆历史。历史看 roadmap.md 与 sessions/。

*更新于 2026-08-23 19:41 · 记录者 AI*

## 现在在哪

- 现状（AI 会话 · codex，待無涘确认）：当前 v0.2 是可运行的 Astro/TypeScript 网站，包含 EGDS 能力地图、职业透镜、资源主题筛选与搜索，以及保留全局关系的 Innovation Atlas。仓库当前有 5,437 个 Work Item、5,590 个 Access Version、84 个 Atlas 节点、86 条关系和 76 项 Evidence；FPS、RPG、RTS、Open World 四条创新事件路线已满足完整闭包。仓库保持 Private，未恢复 Pages、未公开部署。
- 官方 YouTube 元数据：仓库外 ADC 缓存有 2,534 条频道元数据；现有 2,311 条目标 Work Item 100% 映射。目标中 271 条标记有字幕、2,040 条没有；`youtube.readonly` 可读取公开元数据，但不能通用解锁第三方频道字幕正文。
- 元数据一致性审计：2,311/2,311 条均能按 YouTube video ID 对回资源；来源、canonical URL、标题和 `publishedAt`/`duration`/`captionAvailability`/`privacyStatus` 均无缺失或错配，且目标记录全部为公开状态。
- 内容补全结果：2,311 条目标全部已完成并有可核对中文摘要；资源目录有 291 条可定位内容证据：237 条 Senko 二手专题摘要、1 条 Polygon 文章摘要、1 条 Nintendo Wire 文章摘要、52 条 YouTube Data API v3 官方公开描述摘要。所有摘要均带来源类型，不把文章或描述写成字幕正文。
- 长篇内容详述探针：普通 Gemini Notebook 已在用户已登录的 Google 账号中成功创建一次测试笔记本，导入公开视频 `4RlpMhBKNr0` 的 YouTube 转写，并完成一次约 3,791 字符的中文内容详述；回答包含分形叙事层级、下落方块迭代、设计取舍、玩家体验、可迁移方法和未解决边界，并带来源引用。该测试未写回仓库、未启用 Enterprise、未购买订阅。
- 内容转化路线决策：以 NotebookLM / Gemini Notebook 作为视频内容转化主力；保留现有 150–250 字 `summary` 作为网站目录摘要，另设独立的长篇内容详述与 Studio 产物，不覆盖原摘要。详述篇幅采用软目标，按内容密度决定，1800–2500 字不是硬上限，也不为凑字数扩写。
- 双层产出模型：Learn About Games 公开层只展示可核验的标题、来源、短版内容概览和经审核的产物入口；PKM 层保存完整文字版总结、引用/证据边界、信息图、思维导图、演示文稿及生成状态。Daily Check-in 每天抽取一篇并链接到 PKM 原文，不把同一长文重复灌进每日文件。
- NotebookLM 多模态托管边界：当前 Learn About Games 的严格资源 schema 只有标题、短摘要、来源、URL 和 Access Version，没有 NotebookLM 产物字段。NotebookLM 的信息图、思维导图、幻灯片、音频/视频可以通过分享链接访问，但链接依赖 Notebook 权限且删除/取消公开后会失效；正式网站不能把私有 Notebook 链接当成稳定的公开媒体地址。更稳的方向是导出文件后由网站自己的静态资源或对象存储托管，并在资源记录旁建立独立产物层。
- 官方配额核对（以 [Gemini Notebook 官方配额表](https://support.google.com/notebooklm/answer/16213268?hl=en) 为准）：Standard 为 100 notebooks/user、50 sources/notebook、50 chats/day、3 audio/day、3 video/day；Plus 为 200、100、200、6、6；Pro 为 500、300、500、20、20。日报、信息图、幻灯片等另有独立额度，且官方注明会变化。

## 当前阶段

- 资源侧已完成官方描述回退、二手旁证和剩余音频补全：49 条原本处于 `retryable` 的条目依据官方描述补齐；GDC Iwata 纪念片与 GMTK 宣传片随后通过显式音频工具链完成分析。2,311 条目标的 state 均为 `completed`，没有遗留 retryable。
- 映射保守边界：2,311 条目标均已有一个合法主要资源主题；其中 1,677 条至少有一个 capability，634 条 capability 仍为空（GDC 625、英文樱井 8、GMTK 1）。这不是用模板硬填的缺陷：公告、汇编或证据不足的条目若不能直接支持某项能力，就保留空映射，避免把标题猜测写成语义事实。
- 正式 state 已回写：2,311 条记录、2,311 `completed`、0 `retryable`、0 `unclassified`、0 `evidence_pending`。其中 1,871 条来自官方描述分析、210 条字幕分析、4 条音频分析、177 条二手旁证回写；49 条历史完成记录没有重新猜测输入通道，保留原有 model/summaryLength 事实。
- 外部回写脚本具备严格合同：只接受固定 provider/label、150–250 字中文摘要、合法 URL、唯一主要资源主题；保留已有 completed，允许审核过的证据替换 retryable。新增 `--reconcile-summary-lengths`，已修正 23 条历史 state 元数据滞后，不改摘要正文。
- 最终验证已通过：Python 回填/runtime/metadata 测试 45/45，JSON、`git diff --check`、secret scan 通过；`npm run build` 通过 Astro check 0/0/0、Vitest 204/204、静态构建 151 页。
- 免费路由器 smoke test：仓库外临时启动 FreeLLMAPI Docker 实例，仅使用匿名免费渠道并处理一条真实《Designing Celeste》字幕；裸模型名被同名模型合并解析到 Navy，改用精确 `ovh:Qwen3.5-397B-A17B` 后确实到达 OVH，但上游返回 429；Kilo 的 `nvidia/nemotron-3-ultra-550b-a55b:free` 在 60 秒上游超时内未返回。未写回仓库、未启用付费模型或 Premium；当前结论是该路由器可作为本地兼容层候选，但免费匿名端点尚不足以承接长字幕批量总结。

## 下一步

- 内容补全目标已闭环；后续只需观察新的 YouTube 条目或凭据/平台策略变化，不再重复处理这 2,311 条。
- 若继续推进长篇详述，先做一条 NotebookLM→Markdown/PKM 的最小导出链路：YouTube 公共字幕导入、固定模板查询、清理 NotebookLM 附加文案、保留引用、写入独立产物；不自动生成全量信息图/思维导图/演示文稿。新增任何模型调用前须先确认调用次数、输出上限、重试策略和潜在费用。
- 在实现多模态展示前，先确定 `artifact` 资产层和托管策略：图片/思维导图可导出后静态托管，演示文稿导出 PDF/PPTX，音频/视频不直接塞进 Git 仓库，优先使用对象存储或只保留外部分享入口。公开前需逐项审核 NotebookLM 分享权限、原始来源版权和生成内容的可公开性。
- AI Plus 适合作为每日精选和小批研究的容量升级，不足以把 2,311 条资源的文字、信息图、思维导图、演示文稿全部一次性生成；批量方案还受普通 Notebook 网页入口、浏览器自动化稳定性和版权/分享边界限制。购买或升级订阅必须另行获得确认。
- 保持仓库 Private；公开或部署仍需先处理资源页 5,437 条 Work Item 的初始 DOM/客户端筛选成本，并完成线上验收。

## 阻塞 / 待定

- Vision 为 AI 草稿，待無涘确认。
- 本轮外部 state 回写与摘要长度对账已完成；无 YouTube 内容补全阻塞。
- 待确认：NotebookLM→PKM 的正式导出实现尚未开始；当前普通 Gemini Notebook 路线已验证可用，但仍是网页端入口，不应当作批量 API。Enterprise/API 路线需要单独核对许可、项目和费用。
- 待确认：网站是否托管 NotebookLM 导出的本地资产，还是只提供 NotebookLM 外链；当前更推荐“网站自托管可公开资产 + NotebookLM 外链作为补充”，避免私有链接导致访客无法查看或链接失效。
- 费用边界：本轮只做官方网页调研，没有新增 Google/Agnes 模型调用、没有订阅、没有写回资源；任何涉及现实金额的订阅、API 或大批量生成仍须先询问無涘。
- 主要产品风险仍是资源数量增长可能造成错配、重复归类或证据等级混淆；Innovation Atlas 的低证据透镜继续保持未闭合，不因资源补全自动闭合。

原始对话：dialogues/2026-0823.md「0447 官方描述回退、内容对账与外部回写边界」
