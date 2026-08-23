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

## 1606 主观感受靶子清单三层调研

决策：無涘 ｜ 记录：codex（自动）｜ session 01a0286c-4cce-76a3-b4d9-bfa44a19af4c

按任务要求完成公开语料调研与文档化。在docs/research/subjective-feelings-corpus/下新增7个文件：README说明方法、检索边界（YouTube字幕后端不可用、小黑盒站点限定查询零结果）及能力限制；A层从Steam/TapTap/Reddit/B站评论区抓取玩家原话，区分感受词与品质词，并在复核时纠正了将创作者语料混入玩家层的错误；B层从GDC/设计博客/B站/知乎/X抓取设计者行话，重点标注了中英不对称（枪感/打击感/操控感等中文压缩词在英文中被拆分）；C层补齐PLEX/Quantic Foundry/GEQ/PXI/BrainHex/Lazzaro/GameFlow/Game Feel/cozy games/awe等学界框架的类目清单、测量目标与出处。crosswalk.md以無涘基线与Claude补充共28个词形建对表，逐行标注三层有无及同名同物判定，表后三段结论分别列举了语料低保有词、高频但未选词、三层共现词。same-name-different-thing.md基于语料证据判定掌控感、真实感、博弈感应拆分为子类。existing-wheels.md将PLEX 22类、Quantic Foundry 12动机等框架与清单逐条映射，结论为EGDS的差异化在于品类特异中文工艺词与向下扩展客观原因/设计杠杆的路径，而非重新发明体验分类。所有未能取到的来源均已标注失败/受限/不存在的原因。验收确认7文件非空、对表全覆盖、结论条目达标，git变更仅限目标目录。

原始对话：dialogues/2026-0822.md

## 1809 第四轮描述回写与口径修正（2026-08-22）

- 结论：第四轮 `description-only` 最终 100/100 完成；2 条初次模型输出失败均单独重试成功，当前 model failure 为 0。
- 状态：2,311 条目标中 527 completed、4 no_transcript、2 transcript_insufficient、41 channel_failure。完成入口为 476 description、1 transcript、1 audio，另有 49 条历史回写无入口字段。
- 关键修正：真正未完成为 1,784 条；`remainingAfterRun=1,737` 仅表示尚未分类。回填器新增 `uncompletedAfterRun`，测试已补充，避免报告把已尝试失败误报为未尝试。
- 下一步：跑全量构建与目录对账，提交本轮代码／数据／留痕后继续第五轮 100 条描述批次。

原始对话：dialogues/2026-0822.md「1809 第四轮收尾与报告口径修正」

## 1844 第五轮描述回写与 ID 边界修正（2026-08-22）

- 结论：第五轮 `description-only` 最终 100/100 完成；1 条模型输出因把能力 ID 当资源主题而失败，提示修复后定向重试成功。
- 状态：当前 627 completed、4 no_transcript、2 transcript_insufficient、41 channel_failure、model failure 0；完成入口为 576 description、1 transcript、1 audio，另有 49 条历史回写无入口字段。
- 修正：提示明确区分 `resourceTopicIds` 与 `capabilityIds`，新增合同测试；失败条目最终写入合法主题 `narrative-expression` 和能力 `aesthetic-direction`，未做猜测性 ID 映射。
- 口径：真正未完成 1,684 条，其中 1,637 条尚未分类，47 条已尝试但仍未完成；报告同时保留两种计数。
- 下一步：提交第五批数据与提示修复后继续第六轮描述批次。

原始对话：dialogues/2026-0822.md「1844 第五轮描述回写与 ID 边界修正」

## 1909 第六轮描述回写与定向重试（2026-08-22）

- 结论：第六轮 `description-only` 最终 100/100 完成；1 条模型输出因摘要过短和未知主题 ID 失败，定向重试成功。
- 状态：当前 727 completed、4 no_transcript、2 transcript_insufficient、41 channel_failure、model failure 0；完成入口为 676 description、1 transcript、1 audio，另有 49 条历史回写无入口字段。
- 口径：真正未完成 1,584 条，其中 1,537 条尚未分类，47 条已尝试但仍未完成；报告继续区分 `remainingAfterRun` 与 `uncompletedAfterRun`。
- 下一步：跑门禁、提交第六批数据和留痕后继续第七轮描述批次。

原始对话：dialogues/2026-0822.md「1909 第六轮描述回写与定向重试」

## 1931 第七轮描述回写（2026-08-22）

- 结论：第七轮 `description-only` 100/100 完成，无新增模型或通道失败。
- 状态：当前 827 completed、4 no_transcript、2 transcript_insufficient、41 channel_failure、model failure 0；完成入口为 776 description、1 transcript、1 audio，另有 49 条历史回写无入口字段。
- 口径：真正未完成 1,484 条，其中 1,437 条尚未分类，47 条已尝试但仍未完成。
- 下一步：提交第七批数据与留痕后继续第八轮描述批次。

原始对话：dialogues/2026-0822.md「1931 第七轮描述回写」

## 1957 第八轮描述回写与跨字段归一化（2026-08-22）

- 结论：第八轮 `description-only` 最终 100/100 完成；1 条模型输出把能力 ID 放进主题字段，归一化后定向重试成功。
- 修正：仅当主题字段的未知 ID 同时是合法能力 ID 时丢弃该误放，由脚本保留原主题；其它未知 ID 仍失败并留痕。Python 合同测试增至 16/16。
- 状态：当前 927 completed、4 no_transcript、2 transcript_insufficient、41 channel_failure、model failure 0；完成入口为 876 description、1 transcript、1 audio，另有 49 条历史回写无入口字段。
- 口径：真正未完成 1,384 条，其中 1,337 条尚未分类，47 条已尝试但仍未完成。

原始对话：dialogues/2026-0822.md「1957 第八轮描述回写与跨字段归一化」

## 2018 第九轮描述回写（2026-08-22）

- 结论：第九轮 `description-only` 100/100 完成，无新增模型或通道失败。
- 状态：当前 1,027 completed、4 no_transcript、2 transcript_insufficient、41 channel_failure、model failure 0；完成入口为 976 description、1 transcript、1 audio，另有 49 条历史回写无入口字段。
- 口径：真正未完成 1,284 条，其中 1,237 条尚未分类，47 条已尝试但仍未完成。
- 下一步：提交第九批数据与留痕后继续第十轮描述批次。

原始对话：dialogues/2026-0822.md「2018 第九轮描述回写」

## 2038 第十轮描述百条回写

决策：無涘 ｜ 记录：AI。第十轮 `description-only` 生产批次最终 100/100 完成，运行约 17.6 分钟；未请求字幕、未下载音频，也未新增模型或通道失败。最终状态为 1,127 completed、4 no_transcript、2 transcript_insufficient、41 channel_failure、model failure 0。完成入口为 1,076 `inputMode=description`、1 条 `transcript`、1 条 `audio`，另有 49 条历史回写没有入口字段。2,311 条目标中真正未完成 1,184 条，其中 1,137 条尚未分类，47 条已尝试但仍未完成。下一步完成门禁并继续下一轮；原始内容与凭据继续留在仓库外。

原始对话：dialogues/2026-0822.md「2038 第十轮描述回写续」

## 2108 第十一轮描述百条回写与页脚误判修正

决策：無涘 ｜ 记录：AI。第十一轮首次 `description-only` 处理 100 条时 99 条成功、1 条因模型将 GDC 频道统一页脚 `visual-arts` 误判为资源主题而失败；核对官方描述确认它不是视频证据，错误结果未写回。新增窄规则仅忽略已观察的 GDC 页脚标签 `visual-arts` 与 `business-management`，其它未知 ID 仍硬失败；回归测试 17/17。第三次定向重试成功，最终 100/100 完成。当前为 1,227 completed、4 no_transcript、2 transcript_insufficient、41 channel_failure、model failure 0；完成入口为 1,176 `description`、1 `transcript`、1 `audio`，另有 49 条历史回写。真正未完成 1,084 条，其中 1,037 条尚未分类，47 条已尝试但仍未完成。端到端约 28.1 分钟，下一步跑门禁并提交后继续下一轮。

原始对话：dialogues/2026-0822.md「2108 第十一轮描述回写与页脚误判修正」

## 2134 第十二轮描述百条回写

决策：無涘 ｜ 记录：AI。第十二轮 `description-only` 生产批次 100/100 完成，约 23.4 分钟；未请求字幕、未下载音频，也未新增模型或通道失败。最终状态为 1,327 completed、4 no_transcript、2 transcript_insufficient、41 channel_failure、model failure 0。完成入口为 1,276 `description`、1 `transcript`、1 `audio`，另有 49 条历史回写没有入口字段。2,311 条目标中真正未完成 984 条，其中 937 条尚未分类，47 条已尝试但仍未完成。下一步完成门禁并继续第十三轮。

原始对话：dialogues/2026-0822.md「2134 第十二轮描述回写」

## 2156 第十三轮描述百条回写

决策：無涘 ｜ 记录：AI。第十三轮 `description-only` 生产批次 100/100 完成，约 20.7 分钟；未请求字幕、未下载音频，也未新增模型或通道失败。最终状态为 1,427 completed、4 no_transcript、2 transcript_insufficient、41 channel_failure、model failure 0。完成入口为 1,376 `description`、1 `transcript`、1 `audio`，另有 49 条历史回写没有入口字段。2,311 条目标中真正未完成 884 条，其中 837 条尚未分类，47 条已尝试但仍未完成。下一步完成门禁并继续第十四轮。

原始对话：dialogues/2026-0822.md「2156 第十三轮描述回写」

## 2215 第十四轮描述百条回写

决策：無涘 ｜ 记录：AI。第十四轮 `description-only` 生产批次 100/100 完成，约 17.7 分钟；未请求字幕、未下载音频，也未新增模型或通道失败。最终状态为 1,527 completed、4 no_transcript、2 transcript_insufficient、41 channel_failure、model failure 0。完成入口为 1,476 `description`、1 `transcript`、1 `audio`，另有 49 条历史回写没有入口字段。2,311 条目标中真正未完成 784 条，其中 737 条尚未分类，47 条已尝试但仍未完成。下一步完成门禁并继续第十五轮。

原始对话：dialogues/2026-0822.md「2215 第十四轮描述回写」

## 2239 第十五轮描述百条回写

决策：無涘 ｜ 记录：AI。第十五轮 `description-only` 生产批次 100/100 完成，约 20.4 分钟；未请求字幕、未下载音频，也未新增模型或通道失败。最终状态为 1,627 completed、4 no_transcript、2 transcript_insufficient、41 channel_failure、model failure 0。完成入口为 1,576 `description`、1 `transcript`、1 `audio`，另有 49 条历史回写没有入口字段。2,311 条目标中真正未完成 684 条，其中 637 条尚未分类，47 条已尝试但仍未完成。下一步完成门禁并继续第十六轮。

原始对话：dialogues/2026-0822.md「2239 第十五轮描述回写」

## 2258 第十六轮通道切换与 Vertex 文本验证

决策：無涘 ｜ 记录：AI。第十六轮初次描述批次处理到 63/100，其中 61 条成功，2 条因 OpenRouter 所有模型返回 HTTP 402 而失败；错误结果未写回，进程在重复相同通道失败后中止，已落盘状态可恢复。新增 `call_vertex_text`/`--vertex-text`，用用户 ADC 项目中的 `gemini-2.5-flash` 复用结构化结果校验；两条 402 条目定向重试成功，模型记录为 `vertex/gemini-2.5-flash`。描述涓流与 launchd 副本已切换到 Vertex 文本，合同测试 18/18。当前 1,692 completed、4 no_transcript、2 transcript_insufficient、41 channel_failure、model failure 0；真正未完成 619 条，其中 572 条尚未分类，47 条已尝试但仍未完成。

原始对话：dialogues/2026-0822.md「2258 第十六轮通道切换与 Vertex 文本验证」

## 2327 Vertex 批次收尾与音频回退修复

决策：無涘 ｜ 记录：AI。Vertex 描述批次 100/100 完成；首轮 63 条成功，37 条摘要长度失败均经草稿保留、修复提示和定向重试完成。当前状态为 1,792 completed、4 no_transcript、2 transcript_insufficient、41 channel_failure、model failure 0；真正未完成 519 条，其中 472 条尚未分类、47 条为显式非完成状态。

补齐了 Vertex 文本多轮修复、音频 invalid payload 保留，以及第三方字幕异常向本地 `NoTranscriptFound` 的归一化。一个只有日语自动字幕且英语可翻译、但字幕通道受阻的条目已通过仓库外音频缓存和 Vertex 音频分析完成。合同测试 24/24；资源目录只接受通过摘要长度、主题/能力白名单的派生字段。

原始对话：dialogues/2026-0822.md「2327 Vertex 批次收尾与音频回退修复」

## 0054 动作游戏设计知识库旁证（2026-08-23）

- 事实：知乎文章指向公开项目 [ActionGameDesign.ByAI](https://jskyzero.github.io/ActionGameDesign.ByAI/)。截至本次核查，首页显示 51 篇，按年份时间轴和卡片入口浏览；条目内容来自 GDC、CEDEC、视频、文章与原创方法论，每篇提供 AI 摘要、标签、原始来源与参考链接。
- 结构核查：其仓库 README、`src/content.config.ts` 与一篇完整 MDX 条目显示，核心 schema 是 `article`、`source`、`references`，技术形态是 Astro 内容集合 + 一条目一 MDX；它没有本项目的 EGDS 方法节点、Capability／Knowledge Topic、职业透镜、资源 Access Version 或 Innovation Atlas 关系闭包。
- 对齐判断（推断）：双方在“设计资源被收集并以更易读的入口呈现”这一层相邻；对方偏动作游戏设计分享的阅读与速览，本项目偏跨领域能力地图、职业视角、可追溯资源与创新谱系。它可作为资源发现渠道和动作设计专题的外部旁证，但不改变当前产品边界。
- 风险与未知：本次只核查了首页、README、schema 和一篇完整条目，未对 51 篇全部事实、读者使用数据或长期更新能力做审计；不能据此判断其内容质量或用户规模。
- 决策：无新产品决策，待無涘确认 ｜ 记录：AI。下一步保持当前实体边界，不复制其 article/tag 站点模型；若未来引入其中资源，按本项目既有 Source／Work Item／Access Version／Capability 证据合同逐条核验。

原始对话：dialogues/2026-0823.md「0054 动作游戏知识库旁证」

## 0102 Vertex 字幕批次收束与 ADC 阻塞（2026-08-23）

决策：無涘 ｜ 记录：AI。上一轮 Vertex 字幕批次完整处理 100/100，随后涓流任务又用合格官方描述恢复 1 条；当前 2,001 条资源已经写回并通过摘要、主题与能力合同。外部正式状态剩余 254 条未分类，显式非完成为 56 条（4 无字幕、2 字幕过短、49 字幕通道、1 模型输出）。描述证据筛选为 0。

决策：無涘 ｜ 记录：AI。新字幕批次在 5/100 连续遭遇 ADC `vertex_channel` 后熔断；音频回退小批在 5/10 也因 ADC 取 token 失败停止。10 条探针没有资源写入，临时状态逐条记录失败；不能把“模型通道不可用”写成“视频没有内容”。

验证：26/26 Python 合同测试通过；当前完成入口为 1,759 description、191 transcript、2 audio、49 条历史回写。正式 state 与临时 state 的差异已在 roadmap 和 ProjectProgress 标明，等待认证和仓库外缓存写权限恢复后同步。

原始对话：dialogues/2026-0823.md「0102 Vertex 字幕批次收束与 ADC 阻塞」

## 0115 官方描述全量候选模式（2026-08-23）

- 决策：無涘 ｜ 记录：AI。对外部正式 state 的 254 条未分类项重新盘点，确认 75 条 GMTK 中有 74 条官方描述达到证据门槛；179 条樱井视频目前没有合格描述、字幕或音频证据。
- 决策：無涘 ｜ 记录：AI。新增 `--description-only-all`，使官方描述在“字幕标记可用”时仍能作为明确输入；保留旧 `--description-only` 语义。dry-run 选出 74 条且未写资源，合同测试 27/27。
- 决策：無涘 ｜ 记录：AI。唯一真源涓流脚本已切换新模式，但当前沙盒无法同步仓库外 launchd 副本；正式 state 仍为 2,001 completed，待正常终端同步和 ADC 可用后继续。
- 推断：AI。74 条描述候选约为 1–2 小时模型运行量，受无人值守每 4 小时 20 条限制会拉长到数天；179 条无正文证据项不作完成时间承诺。
- 验证：AI。最终对账确认 2,001 条完成资源均有 150–250 字中文摘要，状态中的 `summaryLength` 全部一致，`pending_write=0`；合同测试 27/27，Astro check 0/0/0、Vitest 204/204、静态构建 151 页。

原始对话：dialogues/2026-0823.md「0115 官方描述全量候选模式」

## 0137 官方描述涓流真实批次（2026-08-23）

- 决策：無涘 ｜ 记录：AI。触发既有 launchd 后，真实批次选中 20 条并最终 20/20 写回；完成数由 2,001 增至 2,021，`no_transcript`、`transcript_insufficient`、通道失败和模型失败均未增加。
- 决策：無涘 ｜ 记录：AI。发现旧副本仍使用 `--description-only` 时，Python 回填器只在新别名下强制描述优先；已统一两个参数的描述优先语义，并新增 `should_prefer_description` 合同测试，避免下一批因旧副本参数回退到 YouTube 字幕。
- 验证：AI。修复后旧参数 dry-run 选出 74 条，合同测试 28/28；真实批次的 state/report/resources 更新时间均为 01:36:21，正式 state 记录为 2,021 completed、234 未分类、50 retryable、4 no_transcript、2 transcript_insufficient。
- 验证：AI。批次后完整构建再次通过：Astro check 0/0/0、Vitest 204/204、静态构建 151 页；2,021 条完成资源的摘要、长度和 `summaryLength` 三方对账无差异。

原始对话：dialogues/2026-0823.md「0137 官方描述涓流真实批次」

## 0145 第二轮官方描述涓流真实批次（2026-08-23）

- 决策：無涘 ｜ 记录：AI。再次触发 launchd 后，第二轮描述批次 20/20 成功，累计完成 2,041；中途出现的 1 条 `pending_write` 正常收敛，最终没有新增失败或残留 pending write。
- 验证：AI。state/report/resources 更新时间均为 01:44:42；正式 state 为 2,041 completed、214 未分类、50 retryable、4 no_transcript、2 transcript_insufficient。2,041 条完成资源摘要、长度和 `summaryLength` 三方一致。
- 推断：AI。剩余 34 条仍有合格官方描述，179 条樱井视频仍没有可核验正文证据。

原始对话：dialogues/2026-0823.md「0145 第二轮官方描述涓流真实批次」

## 0154 描述队列清空与回退恢复（2026-08-23）

- 决策：無涘 ｜ 记录：AI。第三轮描述 20/20、第四轮描述 14/14 成功，累计完成 2,075，剩余官方描述候选为 0。
- 决策：無涘 ｜ 记录：AI。随后两次单条回退各恢复 1 条原 `transcript_insufficient`；核对 state 后确认两条实际使用合格官方描述，不是音频分析成功。当前完成 2,077、未分类 180、retryable 50、no_transcript 4、transcript_insufficient 0。
- 验证：AI。2,077 条完成资源摘要、长度与 `summaryLength` 一致，`pending_write=0`；剩余 180 条全部需要单条字幕/音频或新的正文入口。

原始对话：dialogues/2026-0823.md「0154 描述队列清空与回退恢复」

## 0201 单条终态恢复与音频通道熔断（2026-08-23）

- 决策：無涘 ｜ 记录：AI。描述队列清空后连续单条回退恢复 3 条 `no_transcript`，均实际使用官方描述；完成数达到 2,080，`no_transcript` 与 `transcript_insufficient` 均为 0。
- 决策：無涘 ｜ 记录：AI。下一条进入真正音频入口后，`yt-20260820-gdc-9YG9INjO91Y` 明确记为 `audio_channel` retryable，未写资源摘要；通道冷却规则已生效。
- 验证：AI。当前正式 state 为 2,080 completed、180 未分类、50 条通道失败、1 条模型输出失败；`pending_write=0`，资源没有因失败新增内容。

原始对话：dialogues/2026-0823.md「0201 单条终态恢复与音频通道熔断」

## 0204 剩余未分类证据盘点（2026-08-23）

- 核查：AI。180 条未分类项中，1 条 GMTK 的字幕标记为可用但描述不足；179 条樱井视频字幕标记不可用且描述不足。未分类项没有字幕文本缓存，音频缓存只对应已完成条目。
- 决策：無涘 ｜ 记录：AI。冷却期间不解除通道保护；冷却结束后先定向重试 `audio_channel` 条目，再逐条处理剩余未分类项，不能凭标题生成摘要。

原始对话：dialogues/2026-0823.md「0204 剩余未分类证据盘点」

## 0212 官方字幕接口边界与 retryable 调度修复（2026-08-23）

核查官方 YouTube Data API 文档确认：`captions.list` 只列出字幕轨道且需要更高 YouTube OAuth scope；`captions.download` 还要求当前用户拥有视频编辑权限。因此它不能解锁三个第三方频道的字幕正文，项目继续把它定位为权限边界核查，不作为通用下载路线。

发现涓流脚本在描述/音频候选都耗尽后不会进入已记录 `retryable` 的重试队列，已在仓库内唯一真源 `scripts/trickle-video-content.sh` 增加每轮最多 1 条的重试分支；24 小时冷却与逐条失败留痕不变。当前仍为 2,080/2,311，冷却期间未触发新通道请求。

验证已完成：`bash -n`、28/28 Python 合同测试和 `git diff --check` 均通过；未触发冷却中的 YouTube/音频请求。agent-reach 版本检查显示当前 v1.5.0 已是最新。Exa 小样本找到了与个别樱井视频标题对应的外部文章，但覆盖和可追溯性不足，本轮没有把搜索片段写入资源。最终对账与构建仍以 2,080 条已写回摘要为准，目标保持进行中。

原始对话：dialogues/2026-0823.md「0212 官方字幕接口边界与 retryable 调度修复」

## 0224 音频通道根因定位与工具链修复（2026-08-23）

外部失败日志把首个音频探针的根因明确为 yt-dlp 后处理缺少 `ffmpeg/ffprobe`，不是已证实的 YouTube IP 限流；本机已有 Homebrew 的两个可执行文件。回填脚本已显式传入 `/opt/homebrew/bin`，并新增 `audio_tooling` 分类，避免将本地依赖故障计入通道熔断。

代码验证为 31/31 回填合同测试、Python 编译、shell 语法和 diff 检查通过；runtime 维护脚本隔离测试为 1/1。回填器现在会为缺失 state 条目建立 `evidence_pending` 记录并在 report 区分两类未完成状态。当前沙盒不能写仓库外 launchd 副本、state 或 cooldown，所以没有伪造外部状态已修正；正常终端执行 `repair_video_runtime.py --apply --kickstart` 后再验证实际音频下载。

最终门禁复核：`npm run build` 通过，Astro check 0/0/0、Vitest 204/204、静态输出 151 页；秘密扫描和 `git diff --check` 也通过。外部正式 state 仍未执行 apply，目标保持进行中。

原始对话：dialogues/2026-0823.md「0224 音频通道根因定位与工具链修复」

## 0307 二手正文入口小批验证与安全回写合同

- 决策：無涘 ｜ 记录：AI。继续处理 179 条樱井视频缺少官方正文证据的问题，先使用 Senko's Activity Log 两个专题页做逐条、可追溯的二手旁证小批；完成 Team Management 6 条、Planning & Game Design 19 条，共 25 条。
- 产出：AI。25 条资源已写入 `src/data/resources.json` 的中文摘要、能力/资源主题映射和 `externalSignals`。摘要长度为 181–204 字，来源标签固定为“二手专题摘要（非视频正文）”，保留专题页 URL。
- 修复：AI。runtime 对账脚本现在能在显式 `--apply` 时识别这些经过审核的仓库记录，把它们镜像进仓库外 state；不覆盖已有非 `evidence_pending` 状态，并写入证据类型、URL、摘要长度和哈希。缺失记录随后初始化为 `evidence_pending`。
- 验证：AI。JSON 逐条校验通过，回填测试 31/31，runtime 测试 3/3，Python 编译、diff 检查、Astro check 0/0/0、Vitest 204/204、静态构建 151 页通过。当前没有执行外部 `--apply`，因此正式 state 仍保持 2,080 completed、51 retryable、180 条未分类。
- 下一步：AI。用户在正常终端运行 `PYTHONPATH=... python3 scripts/repair_video_runtime.py --apply --kickstart` 后，再观察 25 条 external_article 状态、155 条 evidence_pending 初始化和音频工具链重试结果；未获得正文的条目继续保留可辨认状态。

原始对话：dialogues/2026-0823.md「0307 二手正文入口小批验证与安全回写合同」

## 0319 Work Attitude 专题二十三条旁证补全

- 决策：無涘 ｜ 记录：AI。沿已验证的二手文章路线继续推进，对 Senko's Activity Log Work Attitude 专题的 23 个小节逐条对齐 YouTube 资源；专题明确提示其内容是原视频的入口式整理，不能替代原视频。
- 产出：AI。23 条资源更新为中文摘要，补充合法能力和资源主题映射，并写入固定二手来源标记与 URL。连同 Team Management 6 条、Planning & Game Design 19 条，累计 48 条资源已准备好在显式 apply 后同步到外部 state。
- 失败可辨认：AI。一次生成中发现一条摘要只有 133 字，长度合同阻止补丁应用；补足后再写入。完整构建又发现 3 条把主题 ID 放入能力数组，修正后 204/204 单测通过。
- 验证：AI。累计 48 条摘要长度 150–204 字；回填合同 31/31、runtime 测试 3/3、Vitest 204/204、Astro check 0/0/0、静态构建 151 页通过。当前外部 state 没有被改写，仍为 2,080 completed、51 retryable、180 条缺失记录。
- 下一步：AI。用户在正常终端执行维护命令后，核对 48 条 `external_article` 完成、132 条 `evidence_pending` 初始化及音频工具链重试；之后继续查找剩余未分类条目的逐条可核验入口。

原始对话：dialogues/2026-0823.md「0319 Work Attitude 专题二十三条旁证补全」

## 0324 Gameplay 专题二十九条旁证补全

- 决策：無涘 ｜ 记录：AI。继续处理樱井视频的二手正文入口，核对 Senko's Activity Log Gameplay 专题的 29 个编号和对应视频链接；页面明确把 gameplay 作为风险与奖励的博弈，同时承认游戏乐趣不只来自 gameplay。
- 产出：AI。29 条资源更新为中文摘要，补充合法能力和资源主题映射，并写入固定二手来源标记与 URL。连同前三批，累计 77 条资源已准备好在显式 apply 后同步到外部 state。
- 失败可辨认：AI。第一次完整构建发现 4 条把 `challenge-difficulty-design`、`progression-economy-design` 或 `world-character-coherence` 能力 ID误放进资源主题字段，修正后回归通过；未把失败构建当作成功。
- 验证：AI。Gameplay 29 条摘要长度 150–169 字，累计 77 条逐条校验通过；回填合同 31/31、runtime 测试 3/3、Vitest 204/204、Astro check 0/0/0、静态构建 151 页通过。当前外部 state 仍未改写，保持 2,080 completed、51 retryable、180 条缺失记录。
- 下一步：AI。用户在正常终端执行维护命令后，核对 77 条 `external_article` 完成、103 条 `evidence_pending` 初始化及音频工具链重试；之后继续查找剩余未分类条目的逐条可核验入口。

原始对话：dialogues/2026-0823.md「0324 Gameplay 专题二十九条旁证补全」

## 0346 五组专题扩展与旁证对账边界修复

- 决策：無涘 ｜ 记录：AI。继续按已核对的二手专题入口扩展，新增 Design Specifics 18、UI 15、Graphics 20、Effects 11、Game Concepts 12、Motion/Animation 18 条，共新增 94 条；连同前四批，资源侧累计 171 条二手旁证。
- 产出：AI。171 条均写入 150–205 字中文摘要、合法 `capabilityIds`、唯一 `resourceTopicIds` 与固定 Senko's Activity Log 来源标记；没有把二手文章冒充官方字幕或视频全文。
- 发现与修复：AI。只读 state 对账发现 43 条旁证对应条目已由官方 `description/audio` 完成，不能覆盖。为 `reconcile_external_article_results` 增加“保留既有 completed、记录跳过 ID”的分支；真正 retryable 冲突仍拒绝覆盖。新增测试先按预期失败，再恢复为 4/4 runtime 测试通过。
- 验证：AI。摘要、URL、主题/能力白名单检查通过；Python 回填合同 31/31、runtime 4/4、Astro check 0/0/0、Vitest 204/204、静态构建 151 页通过。外部正式 state 未在当前沙盒写回。
- 当前边界：AI。171 条中 128 条是 apply 后可新增的 `external_article / secondary_summary`，43 条只保留资源侧旁证并在 report 的 `externalArticleSkippedExisting` 留痕；预期剩余 52 条为 `evidence_pending`。当前正式 state 仍为 2,080 completed、51 retryable、180 个目标缺失记录。

原始对话：dialogues/2026-0823.md「0346 五组专题扩展与旁证对账边界修复」

## 0408 Sound、Programming、PR 旁证扩展与最终 state 投影

- 结论：资源侧累计 203 条 Senko's Activity Log 二手专题旁证，新增 Sound 14、Programming 9、PR/Marketing 9；每条有 150–205 字中文摘要、合法映射和来源 URL。
- 状态：外部 state 只读对账为 2,131 条记录（2,080 completed、51 retryable）。203 条旁证中 53 条命中已有官方完成，150 条可新增；其余 30 个目标在 apply 后写入 `evidence_pending`。外部 `--apply` 尚未执行。
- 修复/验证：repair 运行时保留已有官方完成并记录 `externalArticleSkippedExisting`；JSON、diff、回填 31/31、runtime 4/4、Astro 0/0/0、Vitest 204/204、151 页构建通过。Chat 31 条因长度门槛未全部通过而暂缓。

原始对话：dialogues/2026-0823.md「0408 Sound、Programming、PR 旁证扩展与最终 state 投影」

## 0413 一手摘要保护复核

- 发现：203 条二手旁证与官方完成 state 重合 53 条；其中 39 条资源原来已有有效一手摘要，14 条原来是占位摘要。
- 修复：恢复 39 条原摘要，仅保留二手 URL 作为补充证据；14 条占位项继续保留二手摘要。state 投影不变：150 条可新增、30 条 `evidence_pending`。
- 验证：回填合同 31/31、runtime 4/4、Astro 0/0/0、Vitest 204/204、151 页构建通过。

原始对话：dialogues/2026-0823.md「0413 一手摘要保护复核」

## 0418 Chat 专题补全与最终 state 投影

- 产出：Chat 31 条通过摘要长度合同后写入资源，旁证累计 234 条；每条有来源 URL、二手证据标记和合法映射。
- 保护：与官方完成 state 重合 62 条不覆盖；其中 39 条原有一手摘要已恢复，二手内容只保留为补充。172 条可新增，8 条在 apply 后进入 `evidence_pending`。
- 验证：JSON、diff、回填 31/31、runtime 4/4、Astro 0/0/0、Vitest 204/204、151 页构建通过；外部 `--apply` 尚未执行。

原始对话：dialogues/2026-0823.md「0418 Chat 专题补全与最终 state 投影」

## 0447 官方描述回退、内容对账与外部回写边界

- 决策：無涘 ｜ 记录：AI。继续把可获得内容写回成长资源；官方公开视频描述、已核对的二手文章摘要、字幕/音频失败必须保持不同证据层。
- 产出：AI。资源侧累计 291 条可定位内容证据：237 条 Senko 二手专题、Polygon 1 条、Nintendo Wire 1 条、YouTube Data API v3 官方公开描述 52 条。49 条原先 retryable 的条目依据官方描述补齐中文摘要、能力映射和资源主题。
- 映射边界：AI。2,311 条目标均有一个合法主要资源主题；1,676 条至少有一个 capability，635 条保持空 capability。公告、汇编或公开描述不能直接支持某项能力时宁可留空，不用标题模板凑满。
- 对账：AI。2,311 条目标的内存投影为 2,309 `completed`、2 `retryable`、0 `unclassified`、0 `evidence_pending`；正式 apply 会新增/替换 229 条，保留已有完成记录 62 条。当前外部 state 尚未变化，仍是 2,080 completed、51 retryable。
- 失败可辨认：AI。GMTK 商店宣传片和 GDC Iwata 致谢片没有足够教学正文，继续保留 retryable；后者的音频失败仍需工具链重试，不因官方描述摘要被伪装成字幕完成。
- 验证：AI。Python 36/36、JSON、secret scan、diff 检查、Astro check 0/0/0、Vitest 204/204、静态构建 151 页全部通过。
- 阻塞：AI。当前沙盒与 Computer Use 安全策略不允许写仓库外缓存，未执行 `--apply --kickstart`。正常终端执行后需核对 report；仓库仍 Private。

原始对话：dialogues/2026-0823.md「0447 官方描述回退、内容对账与外部回写边界」

## 0457 官方元数据与资源记录一致性审计

- 审计：AI。按 YouTube video ID 对照仓库目标资源与仓库外 ADC 元数据缓存，2,311/2,311 条均成功映射；来源、canonical URL、标题及 `publishedAt`、`duration`、`captionAvailability`、`privacyStatus` 均无缺失或错配，目标记录均为公开状态。
- 状态：AI。外部 runtime 尚未被用户执行 `--apply --kickstart`，仍为 2,080 `completed`、51 `retryable`；仓库资源侧的 2,309/2 投影继续只作投影，不写成外部事实。
- 验证：AI。官方元数据、资源字段、43 个 Python 合同测试和 `git diff --check` 均通过；没有写入凭据或外部缓存。

原始对话：dialogues/2026-0823.md「0457 官方元数据与资源记录一致性审计」

## 1149 2,311 条目标正式回写与最终闭环

- 正式状态：AI。用户贴出的终端输出确认 `--apply --kickstart` 成功，launchd 返回码 0；运行后 Iwata 音频条目完成，手动显式 ffmpeg 路径重试 GMTK 条目也完成。state 最终为 2,311 `completed`、0 retryable、0 unclassified、0 evidence_pending。
- 一致性：AI。2,311 个 state ID 与资源 ID完全一致；每条中文摘要非空，摘要长度与 state 相等，唯一主要资源主题存在；官方元数据 2,311/2,311 对齐且均为公开状态。
- 证据与映射：AI。资源侧 291 条固定证据标记保持来源层级；1,677 条有 capability，634 条保守留空。23 条历史摘要长度元数据由 `--reconcile-summary-lengths` 对账，未触碰摘要内容。
- 验证：AI。45 个 Python 合同测试、Astro check、Vitest 204、151 页静态构建、JSON、密保和 diff 检查全部通过。内容补全目标完成；网站仍保持 Private。

原始对话：dialogues/2026-0823.md「1149 2,311 条目标正式回写与最终闭环」

## 1159 批量调用与现实金额确认规则回写

- 决策：無涘 ｜ 记录：AI。今后任何大量外部/模型/API/搜索/下载调用必须在开始前先询问并取得明确确认；任何可能产生现实金额或消耗付费额度的操作也必须先确认。
- 规则：AI。确认前只做本地读取、静态检查、dry-run 或单次不产生现实费用的最小验证；确认请求必须说明目的、调用量、服务/模型、重试上限、配额/限流风险和费用边界。
- 产出：AI。规则已写入 Director 唯一真源 `GlobalInfo/GlobalGuideline.md`，并在 Director 仓库本地提交 `d1c206a`；本项目没有产品代码或资源数据变更。

原始对话：dialogues/2026-0823.md「1159 批量调用与现实金额确认规则回写」

## 0133 补全成长资源与创新地图

决策：無涘 ｜ 记录：codex（自动）｜ session 01a0253e-64c9-7651-b8c7-959c8e88a1d8

本场会话完成 Learn-About-Games 项目的成长资源和创新地图补全。基于 v02 工作树已有的 5,437 条资源，进行审计和证据闭环，确认至少 3 条完整创新路线（FPS、RPG、RTS、开放世界）满足事件、演化、载体和证据闭包要求。随后处理 YouTube 视频元数据映射与摘要生成，成功回写 2,311 条资源状态为 completed，0 条 retryable，全部具有中文摘要和资源主题。过程中发现并修复了外部 state 与资源摘要长度不一致问题，补充了音频工具路径修复。最终构建、测试全部通过，本地备份提交。同时，会话中明确规则：大量外部调用或可能产生费用的操作必须事先询问用户确认，并将该规则写入 GlobalGuideline。风险方面，视频处理通道冷却和工具缺失已解决；下一步无剩余阻塞，项目保持 Private 未部署。服务器状态待查，但本场主要内容已闭环。

原始对话：dialogues/2026-0823.md

## 1217 线上部署状态核查

- 事实：AI。GitHub 仓库 `PlayWithExperiences/Learn-About-Games` 当前为 Private，GitHub API 返回 `has_pages=false`；`.github/workflows/deploy.yml` 状态为 `disabled_manually`，最后更新于 2026-08-09 10:59（中国标准时间）。
- 事实：AI。公开地址 `https://playwithexperiences.github.io/Learn-About-Games/` 与根域名均于 2026-08-23 12:16（中国标准时间）返回 HTTP 404；最近一次 GitHub Pages 工作流成功运行是 2026-08-09。结论是公开站点被主动下线/未部署，不是临时服务器宕机的证据。
- 影响：AI。本地代码与本地预览仍可用；本次只做读取核查，没有恢复 Pages、公开仓库、推送代码或执行任何可能产生费用的操作。若要恢复公开访问，需無涘另行明确确认。

原始对话：dialogues/2026-0823.md「1215 续」

## 1218 本机预览服务核查

- 更正：AI。用户所指的是本机预览地址 `http://127.0.0.1:4321/Learn-About-Games/`，不是公网 GitHub Pages。
- 事实：AI。2026-08-23 12:18（中国标准时间）对该地址执行 HTTP 检查返回 `curl: (7) Failed to connect`；`lsof` 未发现 4321 端口监听，进程检查也未发现 Astro/npm dev 进程。结论是本地开发服务器已停止；尚未执行自动重启。
- 恢复：AI。项目已有 `npm run dev` 脚本，可在仓库目录运行 `npm run dev -- --host 127.0.0.1 --port 4321`，并保持终端进程运行。

原始对话：dialogues/2026-0823.md「1218 续」

## 1229 直接启动本机预览服务

- 产出：AI。按用户要求直接执行 `npm run dev -- --host 127.0.0.1 --port 4321`，Astro 开发服务器启动成功（PID 68615）。
- 验证：AI。访问 `http://127.0.0.1:4321/Learn-About-Games/` 返回 HTTP 200；未修改代码、部署配置或执行外部/付费调用。

原始对话：dialogues/2026-0823.md「1229 续」

## 1232 资源摘要展示位置核查

- 事实：AI。模型回写正文位于 `src/data/resources.json` 每个资源对象的 `summary.zh-CN`；按 canonical URL 统计，仓库有 2,314 个 YouTube Work Item，其中 2,311 条达到本轮回写的完整摘要目标。
- 事实：AI。`src/components/ResourceResults.astro` 当前只把 `resource.summary` 放入搜索文本，不在资源列表正文渲染；“查看访问版本”展开区显示访问版本、可选的 `whyRelevant` 和外部观察。因此截图中的资源表看不到完整模型摘要。
- 下一步：AI。若要在网页直接阅读这些摘要，需要新增 Work Item 摘要展示区；本次只做核查，没有改产品代码。

原始对话：dialogues/2026-0823.md「1232 续」
