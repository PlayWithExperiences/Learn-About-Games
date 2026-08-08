# Learn About Games

Learn About Games 是一个公开的游戏知识地图、职业参考、学习资源导航与游戏创新沿革项目。它从三个连续问题出发：游戏设计的全貌是什么，我大致处于哪里，接下来可以学习和实践什么？

已部署网站：[https://playwithexperiences.github.io/Learn-About-Games/](https://playwithexperiences.github.io/Learn-About-Games/)

网站用“看地图、找位置、向前走”组织入口。地图提供方向，不提供资格认证；职业画像是带生产语境的参考，不是统一标准。

## 已部署的 M0

M0 是验证数据契约、GitHub Pages 子路径与核心用户旅程的可运行纵向切片，已经包含：

- 9 个领域与 9 个能力入口，其中 Playtest 已有完整学习切片。
- 从 Playtest 能力页进入基础路径，再抵达两条经过审核的具体 Work Item。
- 以 access version 表达的中文与英文可消费语言筛选。
- 一个明确带 AAA 生产语境的 `AAA / Game Designer` 参考画像。
- 仅保存在当前浏览器的 Playtest 个人学习状态，与职业画像独立，不生成分数。
- Game Innovation Atlas 的八类框架与 Roguelike 证据种子：8 个 Game、1 个 Innovation、7 条已证实关系和 9 项来源。

M0 不冒充内容完整的正式第一版。40-60 个节点、300 个候选资源、100 个已审核资源、10-15 条路径与 3-4 个画像仍属于后续内容扩展目标。

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

GitHub Pages workflow [run 31264625728](https://github.com/PlayWithExperiences/Learn-About-Games/actions/runs/31264625728) 的 build 与 deploy jobs 均成功。公开首页、地图、Playtest 能力、资源库与 Atlas 已通过 HTTP 200 抽查。

## 交接入口

- [项目入口](AGENTS.md)
- [Claude 入口](CLAUDE.md)
- [当前决策摘要](docs/journal/2026-08-08-learn-about-games-decision-summary.md)
- [产品设计](docs/superpowers/specs/2026-08-08-learn-about-games-design.md)
- [Roadmap](ROADMAP.md)
- [Changelog](CHANGELOG.md)
- [Methodology](METHODOLOGY.md)
- [Contributing](CONTRIBUTING.md)
- [Devlog](docs/devlog/2026-08-08-project-origin.md)
- [M0 milestone](docs/devlog/2026-08-08-m0-vertical-slice.md)

需要精确恢复历史时，再打开决策摘要链接的脱敏会话记录。
