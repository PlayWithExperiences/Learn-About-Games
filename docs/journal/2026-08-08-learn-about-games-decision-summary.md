# Learn About Games 决策摘要

- 日期：2026-08-08
- 状态：M0 线上发布作为历史证据保留；仓库当前 Private，最新候选只在本地预览并完成构建验收
- 当前预览：[http://127.0.0.1:4321/Learn-About-Games/](http://127.0.0.1:4321/Learn-About-Games/)
- 产品设计：[2026-08-08-learn-about-games-design.md](../superpowers/specs/2026-08-08-learn-about-games-design.md)
- M0 Devlog：[2026-08-08-m0-vertical-slice.md](../devlog/2026-08-08-m0-vertical-slice.md)
- 会话记录：[2026-08-08-learn-about-games-transcript.md](2026-08-08-learn-about-games-transcript.md)

## 2026-08-15 当前里程碑

- 成长资源已完成首个 300+ 扩展并继续增加 500 条 GDC 官方会话：当前为 41 个 Source、2120 个 Work Item、2134 个 Access Version、16 个 Resource Topic。每个 Work Item 仍恰属一个主要主题，并保留规范化 canonical URL、访问版本与检查日期。
- 扩展优先英文与中文：本轮 500 条新增内容均为英文 GDC Vault 官方会话；既有已核验中文条目继续保留，日文只在明确原页研究缺口时纳入。GDC Vault 会话统一标记为 subscription，不把搜索摘要、聚合页或完整录播可用性推断写入 catalog。
- 资源目录新增标题／简介／来源搜索框，支持 NFKC 归一化、中文与英文匹配、可分享 `q` URL 参数；主题子表与七维事实筛选、展开全表仍保留。编辑行进一步收紧，方便一屏扫描更多 Work Item。
- 证据边界已记录在 [2026-08-15-resource-500-gdc-intake.md](../research/2026-08-15-resource-500-gdc-intake.md) 与 [2026-08-09-resource-intake.md](../research/2026-08-09-resource-intake.md)。Exa 配额受限后停止重试，新增批次直接使用 GDC 官方 sitemap 与会话页 HTTP 200/HTML metadata 核验。
- 当前 fresh 门禁已通过：Astro check 0 errors / warnings / hints，Vitest 178/178，静态构建 140 pages，Resources 桌面／移动 E2E 保持通过，完整 Chromium + mobile E2E 251 passed / 21 intentional skipped / 0 failed。搜索实测、2120 条 server-rendered Work Item 与 1440/320 无横溢出均成立。本地预览固定使用 [http://127.0.0.1:4321/Learn-About-Games/resources/](http://127.0.0.1:4321/Learn-About-Games/resources/)，仓库仍 Private，未推送或部署。

## 2026-08-16 当前里程碑

- Innovation Atlas 的主语改为“品类创新事件路线”：选择 Genre Family 后，主阅读区只保留有证据的定义、机制、转译与扩散事件；游戏不再冒充创新本体，而是在事件详情中作为承载作品与原始证据入口。当前 Atlas 为 66 个节点、50 条关系、73 项 Evidence，其中 7 个节点是事件节点。
- 第一人称射击样例已形成三段事件路线：第一人称视角定义 → 垂直空间战斗 → 网络化战斗空间；Doom、Quake、Half-Life 只作为 carrier closure 展示。没有用“第一款／唯一发明者”替代来源支持，也没有把年代相邻写成因果。
- 普通页面选择品类后隐藏全局游戏网络，保留事件路线和可逆详情；地图模式仍保留完整网络、Family 透镜、缩放／平移与焦点恢复。无事件证据的品类显示明确空状态，不伪造路线。
- 事件路线进一步收敛为“地图节点优先”：移除地图前的平铺事件卡，地图中的 7 个事件节点与 2 条演进关系成为唯一主叙事；页面只保留默认收起的紧凑事件索引，便于跳转而不与地图争夺视觉主次。事件节点使用更高层级和强调线，承载作品保持次级虚线样式。
- 事件节点与关系新增构建期契约：事件必须有角色、主题与中文机制说明；事件关系必须明确为 evolution 或 carrier，并检查端点方向。纯测试覆盖事件路线排序、空状态、carrier closure 与关系角色。
- 本轮 fresh 验证：`npm run check` 0 errors / warnings / hints，Vitest 178/178，静态构建 140 pages；Atlas Chromium + mobile 41 passed / 19 intentional skipped，base-path 2/2；完整 Chromium + mobile 251 passed / 21 intentional skipped。当前预览仍固定为 [http://127.0.0.1:4321/Learn-About-Games/](http://127.0.0.1:4321/Learn-About-Games/)，仓库保持 Private，未推送或部署。

## 项目来源

Learn About Games 来自用户对“拥有地图、认识自己、持续学习与实践”的长期思考，以及文章《如何成为更好的设计师》。项目不是资源黄页或职业认证，而是把游戏知识、能力、职业语境、具体学习内容与历史证据连接起来的公开参考地图。

## 当前已验证状态

- GitHub 公开仓库是 `PlayWithExperiences/Learn-About-Games`，默认分支为 `main`。
- 首次基础部署源 HEAD 为 `7f982bbdf074e56a99ec2ee5ca2a568fe25f5fca`，对应 GitHub Pages workflow [run 31264625728](https://github.com/PlayWithExperiences/Learn-About-Games/actions/runs/31264625728)。
- Task 7 acceptance bundle 的发布 HEAD 为 `d079d83c14d2823c597d9c831c907f61fd6e62c8`，对应 [run 31265746032](https://github.com/PlayWithExperiences/Learn-About-Games/actions/runs/31265746032)；build 与 deploy jobs 均成功。
- 部署证据 metadata 对齐 HEAD 为 `9b756374292343f68fe0bac6b741b8a01c5108b8`，对应 [run 31265993889](https://github.com/PlayWithExperiences/Learn-About-Games/actions/runs/31265993889)；它只修正文档证据，不新增产品行为。
- Final-review 修复与不兼容进度版本回退测试的发布 HEAD 为 `8697a6b5fa56a7f6a5e15276b86ed36060cb32a2`，对应 [run 31266716396](https://github.com/PlayWithExperiences/Learn-About-Games/actions/runs/31266716396)；build 与 deploy jobs 均成功。
- Pages 使用 workflow build type。线上复核确认：首页包含新的 Playtest 当前态文案和 `AAA / Game Designer` 画像“只是参考、不作评分、更多画像后续扩展”的说明，Resources HTML 包含 disabled no-JS select 与说明，Devlog 索引包含 `Devlog 002`。
- Task 7 bundle 之后还有发布证据 metadata 对齐与 final-review 修正；它们拥有各自的 commit / run 证据，不被倒填为 Task 7 bundle 的发布 HEAD。
- M0 公开 9 个领域与 9 个能力入口。只有 Playtest 已形成“地图 - 能力 - 路径 - 具体 Work Item”的完整学习切片。
- Playtest 路径抵达 GMTK 的 `Valve's “Secret Weapon”` 视频与 PlayWithExperiences 的双语 Playtest 文章。它们是具体 Work Item，不是频道入口。
- 双语文章只保存为一个 Work Item，通过 `zh-CN` 与 `en` 两个可消费 access version 参与筛选。语言表示用户能实际阅读或观看的版本，不只是原作语言。
- `AAA / Game Designer` 是唯一 M0 职业参考画像，明确带维护者 AAA 背景与 indie/solo 局限。五档个人学习状态只保存在当前浏览器，和职业标签独立，不生成总分、百分比或标准答案。
- Atlas 是 Learn About Games 站内的次级历史知识视图。M0 包含八类框架、8 个 Game、1 个 Innovation、7 条已证实关系和 9 项来源；年份只排序 Game，不自动证明因果。
- M0 仍不是内容完整的正式第一版。40-60 个节点、300 个候选资源、100 个已审核资源、10-15 条路径、3-4 个画像与完整英文界面都尚未交付。

## 核心决策与理由

### 能力地图作为学习主干

用户先看全貌，再用职业和生产语境找参考位置，最后沿能力进入学习路径。这样不会把网站退化为书签目录，也不会把某条职业经历包装成唯一答案。

### 不同对象保持独立

Domain、Knowledge Topic、Capability、Practice、Role、Production Context、Source、Work Item、Access Version、Innovation、Game、Relation 与 Evidence 各自拥有稳定语义。不同对象不共享形状或分数字段，资源数量也不表示能力价值。

### 单项内容是默认资源粒度

GMTK 是 Source，一期视频才是 Work Item。重点内容未来可以细化到章节或时间戳，但 M0 不建立不需要的抽象。

### 多语言按可消费版本建模

原作、译本、字幕与双语版本保持关联。同一作品不因语言不同复制成多个资源；过滤依据是用户能消费的 access version。

### 职业语境与个人状态分开

角色必须和生产环境共同出现。职业画像说明某一语境中的重要性与责任范围，个人状态说明自己做过什么。两者不共享存储、视觉标签或评分。

### Atlas 属于同一产品，但不复用能力语义

Atlas 回答创新如何出现和演变，能力地图回答如何学习与前进。它们共享品牌、导航、资源、证据与贡献入口，但 Game、Innovation、Relation 和 Evidence 不伪装成 Capability。

### M0 与正式第一版分开

M0 用一个真实纵向切片验证数据契约、导航、语言、个人状态、Atlas 证据与部署。规模扩展必须另写计划，并由内容审核能力支撑，不能把候选数量写成推荐质量。

### 复杂度由当前失败证明

M0 只处理当前引用完整性、Pages 子路径、筛选 history、localStorage 损坏回退与证据关系。账号、云同步、复杂搜索、进度导入导出、自动因果推断、力导图和迁移框架均被延后。

## M0 改动与验收

### 基础与内容

- Astro 7.2、TypeScript 6.0.3、Content Collections、Vitest 与 Playwright 建立静态站点和构建期引用校验。
- 地图、Playtest 能力与路径、资源库、职业透镜、本地进度、Atlas、仓库文档与 Devlog 均有公开路由。
- GitHub Actions 以 Node 24 构建、测试并上传 Pages artifact；deploy job 是唯一拥有 Pages 写入与 OIDC 权限的 job。

### Task 7 对抗验收

- 1440px 与 320px 实际运行并截图检查 home、map、Playtest、trail、resources、atlas 与 devlog；所有关键页实测 `clientWidth`、document `scrollWidth` 与 body `scrollWidth` 一致，没有横向溢出。
- 新手可以从“看地图”认识 Domain 是结构区域、Capability 是可进入节点，并选择唯一显示“查看已策展路径”的 Playtest。验收修正了仍把已发布 Playtest 写成“下一步扩展”的过期文案。
- 从业者可以从 Playtest 能力页进入基础路径，并抵达两条精确外部 Work Item URL。
- `zh-CN` 只显示双语文章，`en` 显示文章和 GMTK 视频；history back 后 `pageshow` 重新应用筛选。无 JavaScript 时两条内容都可读，select 禁用并说明当前列出全部 Work Item。
- 职业透镜和个人进度以独立容器、标签与说明表达；页面没有 score、percentage、radar 或唯一答案文案。
- Atlas 关系显示方向、类型、confirmed 状态与证据链接；Innovation、Game 与 Evidence 使用不同视觉形状，并明确 chronology 不等于 causality。
- Devlog collection 使用每篇 Markdown frontmatter 的真实标题；新增第二篇 M0 Devlog，不再在索引硬编码所有标题。
- Final review 修复首页把唯一已发布的 `AAA / Game Designer` 画像写成未来功能的问题；当前文案明确它只是一种生产语境参考、不作评分，更多画像后续扩展。产品设计同时明确 M0 遇损坏或版本不兼容只回退安全空状态，迁移、导出、导入与手动清除属于正式第一版待评估范围。
- 行为修复均先取得 targeted RED；fresh build 后，no-JS 资源、已发布 Playtest 文案与两篇 Devlog 标题三项 targeted Chromium 回归通过。
- Task 7 full gate：两次 `astro check` 均为 0 errors / warnings / hints，Vitest 26/26，通过 14 个静态页面的 fresh build，desktop Chromium 21/21、mobile Chromium 21/21，`git diff --check` 退出 0。
- Final-review 首页断言在旧文案上取得 element-not-found RED，fresh build 后 targeted Chromium 1/1 GREEN；另以单元测试锁定不兼容 localStorage 版本回退安全空状态。随后 full gate 为两次 `astro check` 0 errors / warnings / hints、Vitest 27/27、14 个静态页面、desktop Chromium 22/22、mobile Chromium 22/22，`git diff --check` 退出 0。
- 按计划用 `rg -l` 执行脱敏 secret scan，排除 `node_modules`、`.git` 与 `dist` 后没有返回文件名；没有打印任何匹配值。

## 事故与教训

- 初始依赖计划使用 TypeScript 7.0.2，但 `@astrojs/check@0.9.10` 的 peer 范围只兼容 TypeScript 5/6。最终采用 TypeScript 6.0.3，不使用 `--legacy-peer-deps` 绕过契约。后续简称为 TS7 到 TS6 兼容修正。
- Astro 会重写 Markdown 内部链接。公开项目文档需要把 README、Roadmap、Changelog、Methodology、Contributing 与 Devlog 映射到站内路由；其他仓库文件必须改写为绝对 GitHub URL。
- `astro preview` 只服务现有 `dist`，不会执行 fresh build。旧产物曾制造 Atlas 假 GREEN；Task 7 又发现已启动 preview 会被 Playwright `reuseExistingServer` 复用。正确顺序是停止残留 preview，fresh build，再跑 E2E。
- 资源语言 select 与 history 会被浏览器恢复，但卡片 hidden 状态来自脚本。`pageshow` 必须重放筛选；无 JavaScript 时控件必须禁用且说明全部资源仍可读。
- bfcache 同样会恢复职业画像 select 而不恢复派生 marker。职业透镜在 `pageshow` 重放；`.role-marker[hidden]` 必须显式保持不可见，role 与 progress 的 no-JS 控件不能假装可操作。
- Atlas 测试必须锁定 relation id、fromId、toId、type 与 status 的 tuple。方向箭头桌面向右、移动向下；endpoint CSS 选择器必须收窄，避免箭头继承节点边框并变成第三种实体。
- 远端 HTTPS 曾因 macOS Keychain 凭据路径返回 403。诊断改用命令级显式 SSH URL，确认认证与连通性；没有修改 global Git 配置或仓库 `origin`。该诊断不曾被当作部署证据。
- `actions/configure-pages@v6` 在 build job 读取 Pages 配置，需要 `pages: read`。build job 只增加 `contents: read` 与 `pages: read`，deploy job 才拥有 `pages: write` 与 `id-token: write`。
- 部署配置存在不等于上线。run 31264625728 证明首次基础部署，run 31265746032 证明 Task 7 acceptance bundle，run 31266716396 与线上 HTML 抽查证明 final-review 首页修正；不同发布必须保留各自证据，不能彼此倒填。

## 未决问题

- 首批 40-60 个知识议题与能力节点的确切名单和审核顺序。
- 首批 10-15 条路径的选择标准与内容模板。
- 候选资源、人工审核与贡献流程在扩大到 300/100 规模前如何小批量验证。
- AAA 之外首个职业与生产环境画像，以及第一版最终 3-4 个画像名单。
- 完整英文界面的发布时间。
- Atlas 何时拥有足够主题证明需要时间轴或关系网络交互。

## 精确下一步

1. 保持 M0 数据语义与五条真实用户路径不回退，不立即扩展交互框架。
2. 单独编写正式第一版内容扩展计划，先确定 40-60 个节点与 10-15 条路径的分批审核顺序。
3. 用一小批候选资源验证提交、归类、审核、版本关联与归档流程，再决定如何扩大到 300/100 规模。
4. 只有在证据和维护能力足够时增加下一个角色画像或 Atlas 主题；复杂 Atlas 交互继续晚于核心地图与资源导航。
