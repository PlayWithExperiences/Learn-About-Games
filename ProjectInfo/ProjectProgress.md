# ProjectProgress

> 现状快照，覆盖写，不堆历史。历史看 roadmap.md 与 sessions/。

*更新于 2026-08-23 13:16 · 记录者 AI*

## 现在在哪

- 现状（AI 会话 · codex，待無涘确认）：当前 v0.2 是可运行的 Astro/TypeScript 网站，包含 EGDS 能力地图、职业透镜、资源主题筛选与搜索，以及保留全局关系的 Innovation Atlas。仓库当前有 5,437 个 Work Item、5,590 个 Access Version、84 个 Atlas 节点、86 条关系和 76 项 Evidence；FPS、RPG、RTS、Open World 四条创新事件路线已满足完整闭包。仓库保持 Private，未恢复 Pages、未公开部署。
- 官方 YouTube 元数据：仓库外 ADC 缓存有 2,534 条频道元数据；现有 2,311 条目标 Work Item 100% 映射。目标中 271 条标记有字幕、2,040 条没有；`youtube.readonly` 可读取公开元数据，但不能通用解锁第三方频道字幕正文。
- 元数据一致性审计：2,311/2,311 条均能按 YouTube video ID 对回资源；来源、canonical URL、标题和 `publishedAt`/`duration`/`captionAvailability`/`privacyStatus` 均无缺失或错配，且目标记录全部为公开状态。
- 内容补全结果：2,311 条目标全部已完成并有可核对中文摘要；资源目录有 291 条可定位内容证据：237 条 Senko 二手专题摘要、1 条 Polygon 文章摘要、1 条 Nintendo Wire 文章摘要、52 条 YouTube Data API v3 官方公开描述摘要。所有摘要均带来源类型，不把文章或描述写成字幕正文。

## 当前阶段

- 资源侧已完成官方描述回退、二手旁证和剩余音频补全：49 条原本处于 `retryable` 的条目依据官方描述补齐；GDC Iwata 纪念片与 GMTK 宣传片随后通过显式音频工具链完成分析。2,311 条目标的 state 均为 `completed`，没有遗留 retryable。
- 映射保守边界：2,311 条目标均已有一个合法主要资源主题；其中 1,677 条至少有一个 capability，634 条 capability 仍为空（GDC 625、英文樱井 8、GMTK 1）。这不是用模板硬填的缺陷：公告、汇编或证据不足的条目若不能直接支持某项能力，就保留空映射，避免把标题猜测写成语义事实。
- 正式 state 已回写：2,311 条记录、2,311 `completed`、0 `retryable`、0 `unclassified`、0 `evidence_pending`。其中 1,871 条来自官方描述分析、210 条字幕分析、4 条音频分析、177 条二手旁证回写；49 条历史完成记录没有重新猜测输入通道，保留原有 model/summaryLength 事实。
- 外部回写脚本具备严格合同：只接受固定 provider/label、150–250 字中文摘要、合法 URL、唯一主要资源主题；保留已有 completed，允许审核过的证据替换 retryable。新增 `--reconcile-summary-lengths`，已修正 23 条历史 state 元数据滞后，不改摘要正文。
- 最终验证已通过：Python 回填/runtime/metadata 测试 45/45，JSON、`git diff --check`、secret scan 通过；`npm run build` 通过 Astro check 0/0/0、Vitest 204/204、静态构建 151 页。
- 免费路由器 smoke test：仓库外临时启动 FreeLLMAPI Docker 实例，仅使用匿名免费渠道并处理一条真实《Designing Celeste》字幕；裸模型名被同名模型合并解析到 Navy，改用精确 `ovh:Qwen3.5-397B-A17B` 后确实到达 OVH，但上游返回 429；Kilo 的 `nvidia/nemotron-3-ultra-550b-a55b:free` 在 60 秒上游超时内未返回。未写回仓库、未启用付费模型或 Premium；当前结论是该路由器可作为本地兼容层候选，但免费匿名端点尚不足以承接长字幕批量总结。

## 下一步

- 内容补全目标已闭环；后续只需观察新的 YouTube 条目或凭据/平台策略变化，不再重复处理这 2,311 条。
- 保持仓库 Private；公开或部署仍需先处理资源页 5,437 条 Work Item 的初始 DOM/客户端筛选成本，并完成线上验收。

## 阻塞 / 待定

- Vision 为 AI 草稿，待無涘确认。
- 本轮外部 state 回写与摘要长度对账已完成；无 YouTube 内容补全阻塞。
- 主要产品风险仍是资源数量增长可能造成错配、重复归类或证据等级混淆；Innovation Atlas 的低证据透镜继续保持未闭合，不因资源补全自动闭合。

原始对话：dialogues/2026-0823.md「0447 官方描述回退、内容对账与外部回写边界」
