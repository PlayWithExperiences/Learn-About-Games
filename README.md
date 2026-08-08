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

M0 不冒充内容完整的正式第一版。v0.2 已进入实施，将把卡片骨架改造成语义地图，扩充约 100-150 项资源，提供三个职业透镜，并把 Innovation Atlas 改成可按主题高亮的全局时间网络。

v0.2 不建立候选、已审核、精选或站内评分层级，也不把学习路径作为统一答案。资源只按能力、议题、语言、媒介与访问事实组织；可核验的外部评价会保留来源和观察日期，不合并成平台分数。

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

首次基础部署由 GitHub Pages workflow [run 31264625728](https://github.com/PlayWithExperiences/Learn-About-Games/actions/runs/31264625728) 完成。Task 7 acceptance bundle commit `d079d83c14d2823c597d9c831c907f61fd6e62c8` 由 [run 31265746032](https://github.com/PlayWithExperiences/Learn-About-Games/actions/runs/31265746032) 成功构建并部署。Final-review 修复与不兼容进度版本回退测试所在 commit `8697a6b5fa56a7f6a5e15276b86ed36060cb32a2` 由 [run 31266716396](https://github.com/PlayWithExperiences/Learn-About-Games/actions/runs/31266716396) 成功构建并部署。

线上复核确认：首页包含 Playtest 已可走通的当前态文案，以及 `AAA / Game Designer` 画像“只是参考、不作评分、更多画像后续扩展”的当前态说明；Resources HTML 包含 no-JS 的 disabled select 与说明，Devlog 索引包含 `Devlog 002`。

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

需要精确恢复历史时，再打开决策摘要链接的脱敏会话记录。
