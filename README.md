# Learn About Games

Learn About Games 是一个公开的游戏知识地图、职业参考、学习资源导航与游戏创新沿革项目。它从三个连续问题出发：游戏设计的全貌是什么，我大致处于哪里，接下来可以学习和实践什么？

网站用“看地图、找位置、向前走”组织入口。地图提供方向，不提供资格认证；职业画像是带生产语境的参考，不是统一标准。

## M0 与正式第一版

M0 是验证数据契约、GitHub Pages 子路径与核心用户旅程的可运行切片。当前地图骨架只公开 9 个领域和每个领域的一个能力入口，其中 Playtest 会在下一步扩展。其他能力明确保留“学习路径尚未策展”的状态。

正式第一版仍以公开 Roadmap 为准，目标包含更完整的能力节点、已审核资源、学习路径、职业画像，以及有证据的 Game Innovation Atlas 种子。M0 不冒充已达到该内容规模。

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

`npm run build` 会依次运行 Astro check、Vitest 与静态构建。Playwright 在构建后的预览站点上验证 GitHub Pages 基础路径。

## 部署目标

静态站点面向 GitHub Pages 项目路径：

`https://playwithexperiences.github.io/Learn-About-Games/`

仓库中的配置和所有内部链接都必须保留 `/Learn-About-Games/` 基础路径。这里描述的是部署目标，不代表当前已经部署。

## 交接入口

- [项目入口](AGENTS.md)
- [当前决策摘要](docs/journal/2026-08-08-learn-about-games-decision-summary.md)
- [产品设计](docs/superpowers/specs/2026-08-08-learn-about-games-design.md)
- [Roadmap](ROADMAP.md)
- [Changelog](CHANGELOG.md)
- [Devlog](docs/devlog/2026-08-08-project-origin.md)

需要精确恢复历史时，再打开决策摘要链接的脱敏会话记录。
