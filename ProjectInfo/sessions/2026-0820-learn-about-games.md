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

## 0133 资源回填与三条创新路线闭环

决策：無涘 ｜ 记录：codex（自动）｜ session 01a0253e-64c9-7651-b8c7-959c8e88a1d8

本轮在 .worktrees/v02 执行线推进内容审计与视频摘要回填。起点为 5,437 条资源、84 个 Atlas 节点、86 条关系、76 项证据、10 个主题透镜；补上路线闭包审计后确认 FPS、RPG、RTS、开放世界 4 条完整创新路线，资源和 canonical URL 均唯一。修复了嵌套 worktree 的 Astro 环境假失败、README/工时统计与真实目录漂移等问题；独立 clone 验证通过，最终全量 E2E 达到 262 passed、22 skipped、0 failed。随后恢复官方视频的 description-only 回填，累计完成从 48 条推至 1,027 条，尚余 1,284 条未完成。过程中修复了模型把能力 ID 误当主题的确定性校验问题，并保留 41 条 YouTube 通道失败为可见 retryable。风险是视频通道冷却和部分早期透镜仍无证据闭合。下一步继续分批处理剩余视频，不强行补齐未经证实路线。

原始对话：dialogues/2026-0822.md
