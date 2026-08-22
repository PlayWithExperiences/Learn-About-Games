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

## 0133 完成资源审计并打通 YouTube 认证

决策：無涘 ｜ 记录：codex（自动）｜ session 01a0253e-64c9-7651-b8c7-959c8e88a1d8

会话始于继续补全成长资源和创新地图的目标。AI 在独立工作树 v02 上完成审计，确认已有 5,437 条资源和 4 条完整创新路线，满足至少 1000 条资源与 3 条路线基准，并更新文档。随后重点转向 YouTube Data API 的 OAuth 只读授权配置。用户执行 gcloud 命令时先后遇到缺少 cloud-platform 范围和 403 org_internal 错误，AI 诊断出 OAuth 应用受众设为 Internal 且当前账号不在测试用户列表中。指导将受众改为 External、添加测试用户后，成功通过 ADC 令牌验证并读取公开频道数据，认证链路打通。视频字幕批处理因 IP 封锁仍不可用，后续将以新认证方式分阶段获取。下一步计划将 YouTube 只读 API 接入项目频道同步。所有诊断和修复已记录到项目进度与会话档案中。

原始对话：dialogues/2026-0822.md

## 1412 YouTube OAuth/ADC 只读探针通过

决策：無涘 ｜ 记录：codex（自动）｜ session 01a0253e-64c9-7651-b8c7-959c8e88a1d8

用户完成 OAuth/ADC 授权。AI 在不打印 token 的前提下调用 YouTube Data API v3 的 `channels.list`，HTTP 200，返回 1 条公开频道记录：Game Maker's Toolkit。ADC token 未写入仓库，临时响应只留在仓库外探针路径。认证链路已打通；下一步由 AI 接入官方 API 元数据发现／同步，字幕仍按低频公开入口与失败退避处理。

原始对话：dialogues/2026-0822.md「1412 YouTube OAuth/ADC 只读探针通过」

## 1433 YouTube 官方元数据同步入口合并

决策：無涘 ｜ 记录：codex（自动）｜ session 01a0253e-64c9-7651-b8c7-959c8e88a1d8

用户确认继续推进。AI 先把范围收敛为只读元数据垂直切片：新增 scripts/sync_youtube_metadata.py，从 src/data/sources.json 的 YouTube @handle 解析频道，经过 channels.list、uploads playlist 的 playlistItems.list 与批量 videos.list 获取事实元数据；默认原子写入仓库外缓存，不自动修改 5,437 条目录。新增 7 个 Python 合同／CLI 测试，真实 ADC GMTK 探针返回 3 条视频；默认 4 个 YouTube channel Source 各取 1 条的 dry-run 全部成功。Python 回归 11/11、Astro check 0/0/0、Vitest 204/204。实现提交 37f97e1，已本地合并进 main；token、OAuth JSON 与本机缓存均未进入仓库。

下一步是从外部元数据缓存中做保守 intake：先按 canonical URL 去重并与现有 Source／Work Item 对账，再单独获取字幕、做可追溯摘要和主题／能力映射；失败继续保持可辨认，不把元数据发现成功写成内容分析完成。

原始对话：dialogues/2026-0822.md「1433 YouTube 官方元数据同步入口合并」
