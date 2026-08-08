# Changelog

Learn About Games 的上线行为记录在这里。未来计划请看 [ROADMAP.md](ROADMAP.md)。

## [Unreleased]

- 新增跟随系统、浅色、深色三态外观：显式选择在当前浏览器保存，并在样式绘制前恢复；无 JavaScript 时继续跟随系统且控件明确不可操作。
- 一级导航收敛为能力地图、职业方向、成长资源、创新变迁与关于本项目五项用户任务；项目治理资料不再与学习动作同级。
- 新增 About 项目资料入口，集中链接 Roadmap、Changelog、Devlog、Methodology、Contributing 与 README，同时保留既有公开 URL。
- 新增 `AAA · Game Designer` 职业方向入口，公开其参考边界、依据链接和复核日期，并链接回同一张能力地图而不复制角色知识树。
- 首页三个入口现在分别进入能力地图、职业方向和成长资源；320px 使用可键盘操作、无 JavaScript 仍可达的原生紧凑导航。

## [M0] - 2026-08-08

### Deployed

- GitHub Pages workflow [run 31266716396](https://github.com/PlayWithExperiences/Learn-About-Games/actions/runs/31266716396) 成功发布 final-review commit `8697a6b5fa56a7f6a5e15276b86ed36060cb32a2`；线上首页已复核新的 `AAA / Game Designer` 当前态说明。
- GitHub Pages workflow [run 31265746032](https://github.com/PlayWithExperiences/Learn-About-Games/actions/runs/31265746032) 成功发布 Task 7 acceptance bundle commit `d079d83c14d2823c597d9c831c907f61fd6e62c8`，站点位于 [https://playwithexperiences.github.io/Learn-About-Games/](https://playwithexperiences.github.io/Learn-About-Games/)。
- 线上复核确认：首页包含已发布 Playtest 文案，Resources HTML 包含 disabled no-JS select 与说明，Devlog 索引包含 `Devlog 002`。
- 较早的 [run 31264625728](https://github.com/PlayWithExperiences/Learn-About-Games/actions/runs/31264625728) 是首次基础部署历史，不包含后续 Task 7 验收修复。
- 公开页面保留 `/Learn-About-Games/` 项目子路径。

### Added

- 发布 9 个领域与 9 个能力入口的能力地图骨架，只有已策展的 Playtest 节点进入学习路径。
- 发布 Playtest 能力页、基础学习路径、两条已审核 Work Item，以及按可消费 access version 工作的中文与英文筛选。
- 发布 `AAA / Game Designer` 参考画像与浏览器本地个人学习状态；两者独立表达，不计算职业或个人分数。
- 发布站内 Game Innovation Atlas 八类框架与 Roguelike 证据种子，包含 8 个 Game、1 个 Innovation、7 条已证实关系和 9 项来源。
- 发布 Roadmap、Changelog、Devlog、Methodology、Contributing 与跨 AI 连续性记录。

### Fixed

- 修复首页把已发布的单一 `AAA / Game Designer` 参考画像写成未来功能；文案现明确它只用于理解一种生产语境、不作评分，更多画像后续扩展。
- 修复未应用或已清除画像时仍可见的职业标签，并让依赖脚本的职业、个人进度与语言筛选控件在无 JavaScript 时保持可信的禁用状态与说明。
- 修复浏览器 history 与 bfcache 返回后职业透镜或资源语言筛选未重放派生状态的问题。
- 修复移动端共享导航溢出、Atlas 关系方向不明确、箭头误继承节点样式，以及 Devlog 索引重复显示同一标题的问题。
- 为 Pages build job 增加 `pages: read` 最小读取权限，同时保留 deploy job 独有的写入与 OIDC 权限。
