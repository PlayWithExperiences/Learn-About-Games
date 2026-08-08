# Changelog

Learn About Games 的上线行为记录在这里。未来计划请看 [ROADMAP.md](ROADMAP.md)。

## [Unreleased]

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
