# learn-about-games

> 按主题一份，追加不覆盖；同一场会话的节就地更新。

## 0007 游戏学习资源网站产品讨论

决策：無涘 ｜ 记录：codex（自动）｜ session 019fe0e5-eabb-7191-b9e5-defe57e4c2f8

确定了项目的产品定位：以Game Design为核心、覆盖通往Creative Direction相邻能力的知识地图+资源导航网站。核心架构分为三层——能力地图（稳定行业知识结构）、职业透镜（选择目标角色后高亮相关能力）、资源证据层（每个节点连接课程/书籍/视频等）。资源模型区分原作语言、当前版本语言、字幕和译本关系。初版采用中文界面、多语言内容模型、国际化文案结构。随后讨论转向Innovation Atlas（创新图谱）功能实现，将视觉呈现拆为三个互斥主视角：代表作品（57节点/38关系）、品类发展（25创新事件+2品类节点/20关系）、创新事件（25事件/20演进关系），关系数据共享同一全局网络。最终构建通过194个单测、40个Atlas E2E测试，提交05eda17。本地预览在http://127.0.0.1:4321/Learn-About-Games/atlas/。

原始对话：dialogues/2026-0820.md

## 0114 上线前内容补全与呈现修正

决策：無涘 ｜ 记录：codex（自动）｜ session 01a01ae6-f11a-7351-8409-bf7e935f8996

本次会话执行上线前修正三部分。任务A：dump GDC官方YouTube频道1914条视频，本地确定性匹配，exact 128条、保守接受contains 15条，实际追加139条官方免费镜像；模糊7条和歧义3条均未入库。资源总数保持3120个Work Item不变，Access Version从3134增至3273。任务B：新增集中式呈现逻辑，whyRelevant与summary相同的2650条只显示一次并标注“来自来源页面的描述”，不同470条保持原样，新增2个单元测试。任务C：外观控件改为“外观/系统/浅色/深色”，资源页新增动态中文覆盖说明。最终HEAD经仓库外独立clone验证全绿：astro check 0错0警0提示，Vitest 196/196，构建146页。本地提交3个commit，未push、未改远端、未启动浏览器伴侣。未完成项为保守未回填的模糊与歧义匹配，留待人工复核。

原始对话：dialogues/2026-0820.md

## 2312 三频道完整收录并修复验证门禁

决策：無涘 ｜ 记录：codex（自动）｜ session 01a01f98-ee0f-71f3-8c09-cf452a447cf2

本轮按要求完整收录三个已确认 YouTube 频道：GDC 官方免费频道 dump 1914 个视频、跳过已存在 139 个、新增 1775 个；GMTK dump 237 个、跳过 1 个、新增 236 个；樱井政博英文频道 dump 300 个、跳过 1 个、新增 299 个。最终目录从 3120 Work Items/41 Sources/3273 Access Versions 增至 5430 Work Items/43 Sources/5583 Access Versions。新增 2310 条中 whyRelevant 与 summary 相同比例为 0/2310，1181 条使用 design-fundamentals 作为保守主题兜底。修复了 content collection 缺失 title、测试边界类型推断及三处目录合同断言；独立仓库外 clone 验证 Astro check 0 error、Vitest 198/198、静态构建 149 pages。本地 commit 为 e5b3f73b3f155daf40b8300a87f49259e8817925，未 push。候选频道调研、字幕获取方式及 upload_date 缺失限制已写入 docs/research/2026-08-20-youtube-channel-intake.md。未在本仓库实现转录管线，未修 worktree 已知假失败。下一步可按报告候选清单继续扩充频道。

原始对话：dialogues/2026-0820.md

## 0019 编写脚本补全视频摘要，因IP封禁中断

决策：無涘 ｜ 记录：codex（自动）｜ session 01a01fc9-cd10-7731-aef3-f49d3ad56b3e

会话按给定 PLAN 实现可断点续跑的字幕抓取与摘要生成脚本，完成失败分类、熔断、状态落盘、模型 fallback 和摘要长度校验，并通过 4 项 Python 测试。先进行 30 条抽样：成功 24 条，确实无字幕 2 条，模型输出仍为 retryable 4 条；人工核对确认成功摘要均来自字幕内容，whyRelevant 与 summary 无重复。随后启动全量处理，使用 8 个独立分片并行，但很快触发 YouTube IpBlocked，各分片按熔断规则在连续 5 条通道失败后停止。最终仅成功处理 48 条，无字幕 4 条，通道失败 41 条，模型输出失败 2 条，剩余 2216 条未尝试。冷却后单条探针仍返回 IpBlocked，确认通道不可用，全量未完成。未执行独立 clone 构建验证，未创建本地 commit，未 push。Work Item 总数保持 5430，未改动非目标条目。已写入摘要的条目中 whyRelevant 与 summary 无重复，字幕未进入仓库，密钥未泄露。下一步需待通道恢复后继续处理剩余条目。

原始对话：dialogues/2026-0821.md

## 0208 内容目标审计与路线闭包

决策：無涘 ｜ 记录：AI（自动）

用户授权无人值守执行，验收基准为至少 1000 个成长资源与至少 3 条完整 Innovation Atlas 路线。主任务沿用隔离的 `codex/v02` 内容线；该线已有 5437 Work Item、5590 Access Version、84 节点、86 关系和 76 Evidence，因此新增的是审计合同而非无证据堆量。

产出：新增 Atlas 路线纯函数、资源目标测试和只读报告脚本；报告确认 FPS、RPG、RTS、Open World 四条路线完整，低证据透镜保持未闭合。独立 clone 通过 Astro check、204/204 全量单测和 151 pages build；同步 44 Source／5437 Work Item／5590 Access Version 后完整 E2E 为 262 passed、0 failed、22 skipped。视频涓流只执行一次并因通道冷却留下 SKIP，当前未完成 2311 条字幕回填。

原始对话：dialogues/2026-0822.md「0208 内容目标审计」

## 1252 合并与 YouTube 内容通道探测

决策：無涘 ｜ 记录：AI。按用户后续指示，先提交 main 的 Director 留痕，再以非 fast-forward 方式合并 `codex/v02`。合并提交为 `cdca3be`，随后把涓流脚本从旧 `.worktrees/v02` 切到主工作树并提交 `8c1b67f`；本地回滚锚点为 `v0.2-content-baseline`。确认 v02 worktree 干净且已被 main 吸收后，移除本地 `codex/v02` 分支和 worktree，远端分支未改。

通道探测结果：官方 Data API 无凭据请求返回 403，需要 API Key 或其他 consumer identity；未在环境中发现 YouTube API key。GMTK 频道页可读，但公开 RSS endpoint 返回 404。隔离安装的 `yt-dlp 2026.08.19` 对单条 GMTK 视频成功发现英文／简体中文字幕并取得英文 VTT；项目原有 `youtube-transcript-api` 对同一视频单请求也成功。字幕与凭据仍在仓库外，未改写大目录；现有 Work Item `a-022-why-does-celeste-feel-so-good-to-play` 的摘要与字幕抽样一致。涓流冷却没有被强制清除，实际副本已切换到 main。

原始对话：dialogues/2026-0822.md「1252 合并与 YouTube 内容通道探测」

## 1314 合并后 Playwright 归因

决策：無涘 ｜ 记录：AI。合并后的 main 通过 `npm run build`：Astro check 0/0/0、Vitest 204/204、静态构建 151 页；内容目标审计仍为 5437 Work Item、5590 Access Version、4 条完整路线。全量 Playwright 实际为 259 passed、3 failed、22 skipped。Atlas 失败的 23px 位置差异单独重跑通过，判断为运行时位置测量波动；两个 Playtest 失败在单独串行重跑中都触发 120 秒 timeout，失败资源 ID 每次不同。

根因证据是 `dist/resources/index.html` 约 12.7MB，并 server-render 约 5437 条 Work Item；Playtest 查询实际只需要 61 条，但当前仍由客户端在整页 DOM 上隐藏其余条目。该问题属于大目录筛选性能，不是合并冲突或资源缺失；未通过提高 timeout 掩盖，下一切片应优化过滤入口或初始渲染成本后再复跑浏览器门禁。

原始对话：dialogues/2026-0822.md「1314 合并后 Playwright 归因」

## 0133 资源补全至5千条与YouTube通道实验

决策：無涘 ｜ 记录：codex（自动）｜ session 01a0253e-64c9-7651-b8c7-959c8e88a1d8

按用户要求将内容补全目标提升至1000条资源和3条完整Atlas创新路线。经审计，.worktrees/v02分支已有5437条资源、84个Atlas节点、86条关系，4条路线（FPS、RPG、RTS、开放世界）满足完整闭环。在独立clone中通过类型检查、单测（204项）和构建（151页），全量E2E出现3个失败，归因为大目录渲染性能问题，非本次改动引入。将codex/v02合并到main并打回滚标签，删除旧worktree。完成YouTube通道实验：官方API无Key时403，公开RSS返回404，yt-dlp与youtube-transcript-api单视频请求成功，证明下载链路可行但批量触发限流。字幕分析链路成立。当前阻塞为YouTube API凭据缺失及资源页渲染性能。下一步需人工配置YouTube API Key或OAuth权限以稳定获取元数据与字幕，并修复资源页性能后公开站点。

原始对话：dialogues/2026-0822.md

## 1323 YouTube 通道人工配置清单

决策：無涘（待执行人工配置） ｜ 记录：codex（自动）｜ session 01a0253e-64c9-7651-b8c7-959c8e88a1d8

本次把打通内容通道所需的人工动作收束为最小清单。必做项只有：在 Google Cloud Console 选择或新建项目，启用 YouTube Data API v3，创建 API Key，并至少限制到 YouTube Data API v3；再把值放入本地运行环境的 `YOUTUBE_API_KEY`，只回复“已配置”，不把密钥发到对话、仓库、前端或日志。默认配额先按官方规则使用上传播放列表与 `videos.list`，不申请额外配额，也不使用个人 YouTube 密码或 Cookie。

OAuth 仅作为可选项：若要读取無涘本人或其有权限管理的视频的官方字幕，需要创建 OAuth 2.0 客户端并在浏览器完成一次授权，凭据与 token 只保存在本机；官方 `captions.list`/`captions.download` 不是任意第三方公开视频字幕的通用下载入口。对于公共第三方频道，AI 继续使用 API 元数据发现、低频公开字幕/自动字幕、描述/章节、创作者提供文本和文章等分层入口；能拿到就做带证据的摘要与能力/主题分析，拿不到就保留来源入口并标明缺失，不伪造分析。文章的公开页面不需要人工凭据，付费或登录内容由無涘自行提供可分析文本或文件，不提供密码和 Cookie。

人工动作之外的 API 探针、频道上传列表同步、去重、低频退避、字幕获取、摘要/分析、证据回写、失败留痕和测试均由 AI 处理。当前仍保持仓库私有；公开前另有资源页性能门禁待修复。

原始对话：dialogues/2026-0822.md「1323 YouTube 通道人工配置清单」
