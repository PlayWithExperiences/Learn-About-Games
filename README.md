# Learn About Games

Learn About Games 的目标是成为一个公开的游戏知识地图、职业参考、学习资源导航与游戏创新沿革项目。它从三个连续问题出发：游戏设计的全貌是什么，我大致处于哪里，接下来可以学习和实践什么？

当前状态：仓库在产品完善期间暂时设为 Private；公开 GitHub Pages 已下线并返回 404。当前候选只通过本机 `http://127.0.0.1:4321/Learn-About-Games/` 预览，历史线上 URL 不代表当前可访问状态。

网站用“看地图、找位置、向前走”组织入口。地图提供方向，不提供资格认证；职业画像是带生产语境的参考，不是统一标准。

## 当前版本｜v0.2

v0.2 把 M0 的纵向切片扩展成一张可以继续生长的游戏知识网络；当前 EGDS 完善版只在本地 Private 分支形成候选，尚未推送或部署：

- 能力地图包含 28 个 EGDS 方法节点、42 个可实践能力、12 个知识议题和 64 条 `supports` / `complements` 关系。它以 PlayWithExperiences 的 EGDS 为作者化骨架：从体验旅程与情绪曲线出发，从感受、理解、解构走向重构，再进入叙事、美学与表现、玩法与挑战等设计杠杆；生产、团队、产品与更广语境形成其余四条条件分支。桌面所有父子包含关系统一从左向右展开，并用五条中性分支领地、不同权重的主干／分支／子级线和独立过程箭头表达层级；中间宽度、移动端与无 JavaScript 使用同源原生大纲。
- 独立的 [EGDS 方法介绍页](src/pages/egds/index.astro) 说明能力地图采用的作者方法基础。正文以 PlayWithExperiences Digital Garden 的当前工作模型为先：情绪曲线是整体入口；感受 ↔ 情绪体验、理解 ↔ 主观感受、解构 ↔ 客观原因、重构 ↔ 设计杠杆构成四组明确对应；2024 年四篇已发布文章作为真实演进记录保留。
- `AAA · Game Designer`、`AAA · Creative Director` 与 `Indie · Solo Developer` 是能力地图内的三种职业标签。它们只在唯一一张地图上改变强调，并在标签旁公开映射、依据和局限；不评分、不隐藏节点，也不生成统一成长路线。旧 `/careers/` 只保留到地图标签区的兼容跳转。
- 成长资源收录 41 个 Source、3120 个具体 Work Item、3134 个 Access Version 与 16 个无顺序资源主题。主目录默认折叠为 16 个可独立展开的主题子表，也可展开全表；搜索框与七项事实筛选直接位于资源表头，筛选不再包在额外的“按事实筛选”折叠框里。Source 目录拥有独立子入口。本轮新增 1000 条经 Game Developer 官方页面核验的英文文章；此前英文 GDC 会话、中文与少量日文核验条目继续保留。每条仍逐页核验、规范化去重、恰属一个主题，不为凑数量收录证据不足的候选；GDC 会话保守标记为 subscription。
- Innovation Atlas 是一张 69 节点、55 条有证据关系与 76 项 Evidence 构成的全局时间网络。10 个常见 Genre Family 只负责非排他的浏览入口；网络同时把“创新事件”和“承载作品”分开标记：例如第一人称射击视角、锁定目标的空间战斗、即时战略的资源生产与非对称阵营，再连接到支持这些事件的作品。事件卡先解释发生了什么、何时出现和由哪些作品承载，不宣称唯一发明者；Genre 谱系仍只是可核查的选择性透镜，不冒充完整品类史。桌面只有明确进入全屏“地图模式”后，普通滚轮才围绕指针连续缩放并允许拖动；“适应全图”会以完整内容为先，必要时可以低于手动缩放的 50% 下限。
- 外观支持跟随系统、浅色和深色三种模式；无 JavaScript 时，地图、资源、依据与原生详情仍可阅读。

本站不建立候选、已审核、精选、星级或站内评分层级，也不把学习路径规定成统一答案。收录只表示某条公开资料存在并与主题相关；可核验的外部观察会保留来源与日期，但不参与排序或平台评分。

当前界面以中文为主，资源可以保留英文、日文、中文等原始语言及可消费版本。完整英文界面属于后续工作。

EGDS 是 PlayWithExperiences 提出并持续修订的一种设计视角，不是唯一行业标准。EGDS Framework Node 只表达方法结构；Capability 才参与个人实践状态和职业画像；Knowledge Topic 只提供理解背景。

当前方法入口位于本地站点 `/Learn-About-Games/egds/`。站内只保存可核查摘要和原始链接，不镜像完整 PKM；最新概念关系仍以 [PlayWithExperiences Digital Garden](https://play-with-experiences-digital-garden.vercel.app/) 为准。

## 本地命令

需要 Node.js 24。

```sh
npm ci
npm run dev
npm run check
npm test
npm run build
npm run test:e2e
```

`npm run build` 会依次运行 Astro check、Vitest 与静态构建。Playwright 在 fresh build 后的预览站点上验证 `/Learn-About-Games/` 基础路径。`npm run preview` 本身不会自动重新构建 `dist`。

## 部署证据

以下是历史发布证据，不代表当前站点仍公开可访问。

v0.2 runtime commit `0b6bfb462f7b697ac526a9c6bf48a95878ed642a` 由 GitHub Pages workflow [run 31282275108](https://github.com/PlayWithExperiences/Learn-About-Games/actions/runs/31282275108) 成功完成 build、Chromium E2E、artifact 与 deploy。线上复核确认 8 条关键路由均为 HTTP 200；地图为 54 个可进入节点与 64 条关系，职业方向包含 3 个画像，资源目录包含 20 个 Source 与 128 个 Work Item，Atlas 包含 27 个节点、25 条关系和 40 项 Evidence。320px 关键页面无页面级横向溢出。

首次基础部署由 GitHub Pages workflow [run 31264625728](https://github.com/PlayWithExperiences/Learn-About-Games/actions/runs/31264625728) 完成。Task 7 acceptance bundle commit `d079d83c14d2823c597d9c831c907f61fd6e62c8` 由 [run 31265746032](https://github.com/PlayWithExperiences/Learn-About-Games/actions/runs/31265746032) 成功构建并部署。Final-review 修复与不兼容进度版本回退测试所在 commit `8697a6b5fa56a7f6a5e15276b86ed36060cb32a2` 由 [run 31266716396](https://github.com/PlayWithExperiences/Learn-About-Games/actions/runs/31266716396) 成功构建并部署。

M0 线上复核确认：首页包含当时的 Playtest 纵向切片与 `AAA · Game Designer` 参考说明；Resources HTML 包含 no-JS 的 disabled select 与说明，Devlog 索引包含 `Devlog 002`。这些 run 保留为历史证据，不代表当前内容规模。

## 交接入口

- [项目入口](AGENTS.md)
- [Claude 入口](CLAUDE.md)
- [当前决策摘要](docs/journal/2026-08-09-learn-about-games-v02-decision-summary.md)
- [产品设计](docs/superpowers/specs/2026-08-09-learn-about-games-v02-design.md)
- [视觉系统](DESIGN.md)
- [Roadmap](ROADMAP.md)
- [Changelog](CHANGELOG.md)
- [Methodology](METHODOLOGY.md)
- [Contributing](CONTRIBUTING.md)
- [Devlog](docs/devlog/2026-08-08-project-origin.md)
- [M0 milestone](docs/devlog/2026-08-08-m0-vertical-slice.md)
- [v0.2 milestone](docs/devlog/2026-08-09-v02-knowledge-network.md)
- [私有完善：整合探索入口](docs/devlog/2026-08-11-integrated-exploration-refinement.md)
- [私有完善：统一地图方向与扩展品类谱系](docs/devlog/2026-08-12-horizontal-egds-genre-atlas.md)
- [私有完善：让地图状态可逆，并补充一手学习资料](docs/devlog/2026-08-12-reversible-maps-and-resource-depth.md)
- [私有完善：把成长资源扩到 300+](docs/devlog/2026-08-15-resource-300-expansion.md)

需要精确恢复历史时，再打开决策摘要链接的脱敏会话记录。
