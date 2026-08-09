# Learn About Games

Learn About Games 的目标是成为一个公开的游戏知识地图、职业参考、学习资源导航与游戏创新沿革项目。它从三个连续问题出发：游戏设计的全貌是什么，我大致处于哪里，接下来可以学习和实践什么？

当前状态：仓库在产品完善期间暂时设为 Private；公开 GitHub Pages 已下线并返回 404。历史 URL 为 `https://playwithexperiences.github.io/Learn-About-Games/`，重新公开前会再次完成线上验收。

网站用“看地图、找位置、向前走”组织入口。地图提供方向，不提供资格认证；职业画像是带生产语境的参考，不是统一标准。

## 当前版本｜v0.2

v0.2 把 M0 的纵向切片扩展成一张可以继续生长的公开知识网络：

- 能力地图包含 8 个开放领域、42 个可实践能力、12 个知识议题和 64 条 `supports` / `complements` 关系；桌面使用相连地域图，移动端使用关系等价大纲。
- `AAA · Game Designer`、`AAA · Creative Director` 与 `Indie · Solo Developer` 是三种带生产语境和公开依据的参考透镜。它们只在同一张地图上改变强调，不评分、不隐藏节点，也不生成统一成长路线。
- 成长资源收录 20 个 Source、128 个具体 Work Item 与 15 个无顺序资源主题，可按主题、知识议题、能力、可消费语言、媒介、访问方式和来源筛选。
- Innovation Atlas 是一张 27 节点、25 条有证据关系与 40 项文献构成的全局时间网络；Roguelike 与 Metroidvania 只作为高亮透镜，不拥有或过滤节点。
- 外观支持跟随系统、浅色和深色三种模式；无 JavaScript 时，地图、资源、依据与原生详情仍可阅读。

本站不建立候选、已审核、精选、星级或站内评分层级，也不把学习路径规定成统一答案。收录只表示某条公开资料存在并与主题相关；可核验的外部观察会保留来源与日期，但不参与排序或平台评分。

当前界面以中文为主，资源可以保留英文、日文、中文等原始语言及可消费版本。完整英文界面属于后续工作。

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

需要精确恢复历史时，再打开决策摘要链接的脱敏会话记录。
