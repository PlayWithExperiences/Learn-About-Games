# Changelog

Learn About Games 的上线行为记录在这里。未来计划请看 [ROADMAP.md](ROADMAP.md)。

## [Unreleased]

- 成长资源目录新增搜索框（支持标题、简介与来源的中英文检索、NFKC 归一化与可分享 `q` URL 参数），并将 Work Item 改为更窄的编辑型行；桌面展开态中位行高约 94px，移动端继续保持单列可读。
- 按“英文与中文优先、日文低优先级”的方向新增 500 个经 GDC Vault 官方 sitemap 与会话页逐条核验的英文 Work Item；目录达到 41 个 Source、1110 个 Work Item 与 1124 个 Access Version。GDC Vault 会话统一保守标记为 subscription，不把搜索摘要或完整录播可用性当作事实。
- 成长资源扩充完成首个 300+ 目标批次：净增 385 个经过官方页面或可复核原页核验的 Work Item，目录达到 41 个 Source、610 个 Work Item 与 624 个 Access Version。新增以英文 GDC Vault／Game Developer、学术章节、课程与方法指南为主，另补 18 条中文 Work Item 与 8 条日文研究；所有条目规范化 URL 去重、恰属一个资源主题并保留检查日期，不添加评分或排名。
- 将 `PlayWithExperiences/Learn-About-Games` 暂时从 Public 改为 Private；未经身份验证的仓库 URL 与原 GitHub Pages URL 均返回 404，并手动停用 Pages workflow，避免私有完善期间触发无效部署。历史发布证据继续保留，重新公开前需完成当前核心体验修正、重新启用 workflow 与线上验收。
- EGDS 取代通用分组成为能力地图的唯一知识骨架：28 个方法节点表达体验设计、从计划到落地、团队、产品／盈利与更广语境；体验设计内部固定显示体验旅程以及感受 → 理解 → 解构 → 重构，并由重构进入叙事、美学与表现、玩法与挑战三类设计杠杆。
- 新增独立 `/egds/` 方法介绍页，并从 About 与能力地图提供上下文入口。页面以 Digital Garden 当前工作模型为先，公开情绪曲线作为整体入口，以及感受 ↔ 情绪体验、理解 ↔ 主观感受、解构 ↔ 客观原因、重构 ↔ 设计杠杆四组对应关系；四篇已发布文章保留历史位置，顶层导航继续保持四项。
- 42 个 Capability 与 12 个 Knowledge Topic 只在一个叶容器中按需展开；64 条 `supports` / `complements` 关系默认不显示，只在选中 Capability 时显示其直接关系。桌面取消纵向嵌套滚动，1024px、320px 与无 JavaScript 使用同源原生层级和关系大纲。
- `AAA · Game Designer`、`AAA · Creative Director` 与 `Indie · Solo Developer` 通过地图公开事件叠加到 EGDS；Career priority、个人实践状态、展开／关系选择各自独立，不生成职业适配、差距、完成率或总分。无 JavaScript 时三份画像摘要、依据、详情与资源链接仍可访问。
- 删除旧 Domains / mapGroups JSON、placement 字段、catalog 类型、validator、generic geometry helper、无消费者样式与公开方法论残留；EGDS Framework Node、Capability、Knowledge Topic 成为当前三类地图实体。
- 最终全局复审修复响应式 EGDS 大纲的三个盲区：JavaScript 增强态只保留一个展开叶，1024px 深层实体恢复单列横向可读，折叠叶直接显示 Career 三档事实计数；无 JavaScript 仍保留原生多开能力。
- 将三个 Career Lens 合并为能力地图内的职业标签，顶层导航从五项收敛为能力地图、成长资源、创新变迁、关于本项目四项；`/careers/` 保留静态兼容跳转。选中画像的映射、依据、限制、复核日期和来源紧邻标签控件显示，应用、切换和聚焦不再推移地图。
- 深色 Career Lens 以不透明填充、2px 边框、实线／虚线／点线和中文标签共同表达核心／重要／建议了解；未收录节点仍完整可读，不隐藏、不评分。
- 成长资源改为 15 个默认收起、可独立展开的主题子表，并提供展开全表／全部收起；七维筛选会自动打开有匹配结果的组。38 个 Source 进入独立目录，225 个 Work Item、239 个 Access Version 与 12 条外部观察保持完整；构建期强制每个 Work Item 恰属一个主要资源主题。最新批次新增 7 条 GDC Vault 原始会话与 9 篇 Game Developer 作者文章；不添加站内评分、排名或审核等级。
- EGDS 桌面地图改用一套共享四列网格；过程阶段和三个四节点主行共用列中心，结构线公开并命中明确的方位端口。Career 未选时不再保留空白依据区，选中后使用整宽、自然高度内容，不再放进固定高度内滚动盒。
- EGDS 桌面地图增加由现有父子几何派生的五条中性分支领地与体验过程子带；根主干、分支线、子级线、过程箭头和背景网格使用不同且可测试的视觉权重。数据仍是同一组 28／42／12／64，领地不是新分类或评分。
- EGDS 的所有父子包含关系统一为从左向右展开；总览与聚焦态共享同一方向语法，Career 聚焦时五条主分支的同源事实计数仍可见。结构线不再用上下方向混合表达所有权。
- Innovation Atlas 增加显式地图模式：模式内普通滚轮按连续 delta 围绕指针缩放，wheel 与 drag 写入按帧合并；当前地图模式使用固定全视口工作区并锁定背景滚动，Esc／退出会恢复页面、画布与焦点。早期史新增 9 节点、5 条有证据关系和 9 项 Evidence，总量为 36／30／49，并补充 1958、1960、1970 时间刻度与所有范围节点的日期校验。
- Innovation Atlas 的唯一证据透镜控件现在属于同一个全屏工作区；切换 Roguelike／Metroidvania 只改变强调，不退出地图模式，也不重置缩放、平移、搜索或节点几何。
- Innovation Atlas 新增 10 个非排他 Genre Family 浏览入口，并把谱系扩为早期电子游戏、Roguelike、Metroidvania、平台与跳跃、解析器冒险到图形冒险、第一人称射击、即时战略 7 条证据透镜。Atlas 现有 58 节点、42 条关系和 69 项 Evidence；Family 不生成关系，透镜切换不隐藏、不重排或移动全局网络。
- Atlas 新增 Maze War、Catacomb 3-D、Wolfenstein 3D、Doom、Quake、Half-Life、Dune II、Warcraft、Warcraft II 与 StarCraft；只连接开发者、机构馆藏或同期材料能够支持的 6 条关系，不用年代接近补推断边。“适应全图”现在可在必要时低于 50% 手动缩放下限，避免高画布底部被裁切。
- Atlas 最终质量审查补上客户端幂等启动、扩展 Evidence provenance 原子校验和关系端点线段边界合同；同一模块重复执行不再产生第二套 listener／state owner，新研究证据不能留下半套来源元数据。
- Atlas 的 Family 面板不再把不可操作的谱系名称伪装成链接：同一 Theme 在不同 Family 中都是可直接选择的真实按钮，空 Family 明确显示“0 条已核查谱系，待研究”；全屏地图改用紧凑谱系条，不再让浮动目录遮挡工具和画布。
- EGDS 展开不再重排或隐藏总览骨架；28 个方法节点、五条分支领地、结构线和过程线在展开前后保持原位，具体 Capability／Knowledge Topic 进入独立下方带。同一数量按钮可再次收起，Escape 也可撤销当前展开或选择。
- 资源 stop-condition 批次只纳入 5 项可逐页核验资料，使目录达到 38 个 Source、179 个 Work Item 与 193 个 Access Version；因 Exa 免费额度返回 429、中文非演讲原页证据不足，没有用平台搜索页或证书失败页面凑满原定数量。URL 归一化、跨 Work ownership 和研究 notebook 对账都增加构建期保护。
- 较早的私有完善 runtime 已推送到远端 `codex/v02`；当前本地候选包含地图／Career、Atlas 与资源扩充的未推送提交。本轮尚未推送或部署，Pages workflow 仍保持手动停用。

## [v0.2] - 2026-08-09

### Deployed

- GitHub Pages workflow [run 31282275108](https://github.com/PlayWithExperiences/Learn-About-Games/actions/runs/31282275108) 成功发布 runtime commit `0b6bfb462f7b697ac526a9c6bf48a95878ed642a`；build、Chromium E2E、artifact 与 deploy 全部成功。
- 线上复核确认 8 条关键路由均为 HTTP 200；地图 54 个节点／64 条关系、3 个 Career Lenses、20 个 Source／128 个 Work Item、Atlas 27 个节点／25 条关系／40 项 Evidence 与 320px 无横向溢出合同均成立。
- 较早的 [run 31282121063](https://github.com/PlayWithExperiences/Learn-About-Games/actions/runs/31282121063) 因 Ubuntu 浏览器产生 3px 垂直滚动取整差异而在单条 E2E 断言失败，没有上传 artifact 或部署；测试改为保留横向位置精确合同，并允许不超过 4px 的纵向取整差异。

### Added and changed

- 新增 `AAA · Game Designer`、`AAA · Creative Director` 与 `Indie · Solo Developer` 三个带生产语境、依据和复核日期的 Career Lenses；它们复用同一张能力地图，只改变强调，不生成评分、缺口、完成率或统一建议步骤。
- Innovation Atlas 从 Roguelike 种子列表重构为一张可横向浏览的全局时间网络，包含 27 个节点、25 条有证据关系和 40 项文献；Roguelike 与 Metroidvania 透镜只改变强调，不隐藏、不重排、不移动实体。
- Atlas 的 Game、Innovation 与 Category Formation 使用不同形状；有向关系在目标节点边界显示箭头，无向关系双端对称。320px 使用按年代组织的关系等价大纲，并保留节点、关系与原始题名／语种证据详情。
- Atlas 节点与关系在 JavaScript 可用时打开原生选中详情，关闭后恢复网络焦点、页面位置和横向位置；无 JavaScript 时继续使用原生详情。40 项 Evidence 集中为唯一文献索引，实体详情只保留可返回网络的引用。
- 修复 Atlas 主题切换后非匹配箭头、无向端点与移动关系引用仍保持高亮的问题；非匹配关系现在使用满足对比要求的中性色和非颜色线型反馈。修复 320px 无 JavaScript 页头中品牌、外观控件与说明发生碰撞的问题。
- 新增 `Devlog 003`，记录 v0.2 为什么从卡片、单一画像、两条资源与独立时间线转向知识网络、事实资源目录和证据透镜。
- 能力与知识议题详情现在直接按运行时 catalog 顺序显示关联 Work Item，并提供 `capability`、`knowledgeTopic`、`resourceTopic` 稳定筛选深链；没有直接资源的能力诚实显示空状态与贡献入口，不经过 Trail 或规定学习顺序。
- 成长资源现在把 20 个 Source 与 128 个 Work Item 作为两类独立、可发现的实体：主资源页服务端输出完整目录，20 个 Source 均有静态详情页，15 个无顺序资源主题继续保留独立入口。
- 新增资源主题、知识主题、能力、可消费语言、媒介、访问方式与 Source 七维事实筛选；筛选状态写入稳定 URL 参数并支持 reload、history back 与 pageshow，无 JavaScript 时仍可阅读全部目录。
- Work Item 改为紧凑编辑列表，逐项展示来源、媒介、原始语言、访问版本、关联说明、地区限制与带日期的外部公开观察；外部观察不参与站内评分、排名或排序。
- 修正能力地图的开放网络表达：领域改用不封闭的局部边界与极淡底场，提高支持/互补关系的默认可见度，并把 320px 节点摘要移入原生 disclosure，保留所有直接详情链接与无 JavaScript 可达性。
- 能力地图从两列卡片替换为同一 catalog 的两种等价呈现：桌面使用 8 个开放知识地域、42 个能力节点、12 个知识议题节点与 64 条可解释关系，320px 使用可直接进入节点并展开文字关系的大纲。
- 新增 12 个知识议题静态详情页，并让全部能力详情显示领域、支持/受到支持/互补关系、相关资源与独立的浏览器个人实践记录；地图页不再内嵌旧职业下拉控件。
- 新增跟随系统、浅色、深色三态外观：显式选择在当前浏览器保存，并在样式绘制前恢复；无 JavaScript 时继续跟随系统且控件明确不可操作。
- 一级导航收敛为能力地图、职业方向、成长资源、创新变迁与关于本项目五项用户任务；项目治理资料不再与学习动作同级。
- 新增 About 项目资料入口，集中链接 Roadmap、Changelog、Devlog、Methodology、Contributing 与 README，同时保留既有公开 URL。
- 新增 `AAA · Game Designer` 职业方向入口，公开其参考边界、依据链接和复核日期，并链接回同一张能力地图而不复制角色知识树。
- 首页三个入口现在分别进入能力地图、职业方向和成长资源；320px 使用可键盘操作、无 JavaScript 仍可达的原生紧凑导航。

## [M0] - 2026-08-08

### Deployed

- GitHub Pages workflow [run 31266716396](https://github.com/PlayWithExperiences/Learn-About-Games/actions/runs/31266716396) 成功发布 final-review commit `8697a6b5fa56a7f6a5e15276b86ed36060cb32a2`；线上首页已复核当时的 `AAA · Game Designer` 当前态说明。
- GitHub Pages workflow [run 31265746032](https://github.com/PlayWithExperiences/Learn-About-Games/actions/runs/31265746032) 成功发布 Task 7 acceptance bundle commit `d079d83c14d2823c597d9c831c907f61fd6e62c8`，站点位于 [https://playwithexperiences.github.io/Learn-About-Games/](https://playwithexperiences.github.io/Learn-About-Games/)。
- 线上复核确认：首页包含已发布 Playtest 文案，Resources HTML 包含 disabled no-JS select 与说明，Devlog 索引包含 `Devlog 002`。
- 较早的 [run 31264625728](https://github.com/PlayWithExperiences/Learn-About-Games/actions/runs/31264625728) 是首次基础部署历史，不包含后续 Task 7 验收修复。
- 公开页面保留 `/Learn-About-Games/` 项目子路径。

### Added

- 发布 9 个领域与 9 个能力入口的能力地图骨架；Playtest 作为当时唯一完整纵向切片进入具体内容。
- 发布 Playtest 能力页、基础主题页、两条具体 Work Item，以及按可消费 access version 工作的中文与英文筛选。
- 发布 `AAA · Game Designer` 参考画像与浏览器本地个人学习状态；两者独立表达，不计算职业或个人分数。
- 发布站内 Game Innovation Atlas 八类框架与 Roguelike 证据种子，包含 8 个 Game、1 个 Innovation、7 条已证实关系和 9 项来源。
- 发布 Roadmap、Changelog、Devlog、Methodology、Contributing 与跨 AI 连续性记录。

### Fixed

- 修复首页把已发布的单一 `AAA · Game Designer` 参考画像写成未来功能；文案现明确它只用于理解一种生产语境、不作评分，更多画像后续扩展。
- 修复未应用或已清除画像时仍可见的职业标签，并让依赖脚本的职业、个人进度与语言筛选控件在无 JavaScript 时保持可信的禁用状态与说明。
- 修复浏览器 history 与 bfcache 返回后职业透镜或资源语言筛选未重放派生状态的问题。
- 修复移动端共享导航溢出、Atlas 关系方向不明确、箭头误继承节点样式，以及 Devlog 索引重复显示同一标题的问题。
- 为 Pages build job 增加 `pages: read` 最小读取权限，同时保留 deploy job 独有的写入与 OIDC 权限。
