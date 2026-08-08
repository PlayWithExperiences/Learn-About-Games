# Learn About Games v0.2 会话记录

## 导出范围

本文是当前运行时可访问范围内的脱敏部分导出，不是原始聊天 UI 的完整逐字记录。M0 的早期来源、讨论、实现与发布过程保存在 [2026-08-08-learn-about-games-transcript.md](2026-08-08-learn-about-games-transcript.md)。

缺失范围包括已经压缩且未逐字暴露给当前运行时的早期消息、主代理私有推理、部分工具原始输出和子代理内部上下文。本文没有写入 token、凭据、环境变量值或私密数据。

## 1. 用户对 M0 的体验反馈

用户指出能力地图像一块块便当盒，没有地图感；职业画像放在页面上却看不出产生了什么影响；Resources 只有两条；Atlas 标签不够完整，七条 Roguelike 关系也不像一条可追踪的线。用户提出银河恶魔城适合作为另一个创新演变示例，并要求增加颜色主题切换。

用户还要求一级导航只保留关键功能，把 Roadmap、Changelog、Devlog、Contributing、Methodology 等项目辅助资料收进同一个入口。

## 2. 信息架构命名

用户提出两套名称：

- 能力地图 | 潜在路径 | 成长资源 | 创新变迁 | 关于本项目
- Expertise Map | Potential Career Lens | Learning Resources | Innovation Atlas | About

讨论后确认“潜在路径”仍容易被误解为 Learning Path，因此最终固定为：

- 能力地图 | 职业方向 | 成长资源 | 创新变迁 | 关于本项目
- Expertise Map | Career Lenses | Learning Resources | Innovation Atlas | About

职业画像命名使用中点，例如 `AAA · Game Designer`，不再使用 `AAA / Game Designer`。

## 3. Owlcat Learning 参考

用户提供 https://owlcat.games/zh/learning 作为类似项目参考。只读调研发现其价值主要在资源覆盖广、按职业与内容类型筛选、允许公众提交，并真实展示书籍封面与多种媒介。

本项目借鉴开放目录、职业/媒介筛选和贡献入口，但不照搬不透明的“推荐”概念。Learn About Games 仍需把具体内容连接到能力或议题，并保存语言和访问版本。

## 4. 用户否决强审核与统一路径

用户追问“精选学习路径由谁规定”“已审核资源由谁审核”，指出候选、审核、精选需要平台承担过重且主观的判断，难以长期维持。

最终确认：

- 资源先统一收集和整理。
- 如果能获得外部评价，就如实列出提供方、原始数据和采集时间。
- 当前不建立站内评分、排名、审核等级或精选等级。
- 资源按主题和能力组织，用户自行选择。
- Learning Path 不再是核心产品对象，因为每个人需求不同。
- M0 Playtest Path 降级为无强制顺序的主题资源集合。

## 5. Innovation Atlas

用户希望创新变迁更松散、更像一张时间网络。网络沿时间展示不同阶段出现的游戏、品类或新设计，不要求线性父子关系，可以连接到很早以前的节点。

最终确认：

- 横轴只表示时间。
- 网络中的连接表示有证据的影响、变体、融合、平行产生、结构相似或争议。
- Roguelike、Metroidvania、关键词和品类作为同一全局网络的高亮透镜。
- 点击节点或关系可以继续查看说明与证据。
- 主题高亮不会裁掉网络的其余上下文。

## 6. 颜色主题

用户确认采用三态外观：跟随系统、浅色、深色。默认跟随系统，用户选择保存在本地。视觉语义在两套主题下保持一致，并且不只依赖颜色。

## 7. 内容规模与授权

用户确认 v0.2 应从空框架进入有内容密度的版本。暂定范围为约 40-50 个能力/议题节点、三个职业透镜、约 100-150 项资源，以及包含 Roguelike 与 Metroidvania 的全局创新时间网络。

用户最后明确表示不需要再等待书面规格复核，要求设立目标并直接开始，并表示将去休息。主代理随后创建 v0.2 目标，建立 `codex/v02` 隔离工作树，从已部署 `373ef17` 运行 clean baseline，并开始写入设计与计划文档。

## 8. 规格、设计系统与实施计划

主代理把已确认方向写入 v0.2 产品规格、根目录 `DESIGN.md` 和四份阶段计划：Foundation、Map / Career、Resources、Atlas / Release。计划坚持先内容真实性与核心语义、后失败处理与发布硬化，不在早期引入账号、后台、实时抓取或复杂迁移框架。

`DESIGN.md` lint 实际完成，结果为 0 errors。工具报告 18 条 orphaned-token warning；这些 token 已用于文字化的地图、主题与组件规则，但 linter 只追踪 Markdown 中的显式组件引用，因此记录为工具局限，不伪装成零 warning。

文档更新后第一次全量 Playwright 得到 40 passed / 4 failed。四项失败都指向旧 M0 decision summary、旧设计文档路径与旧 README 精确文案；页面本身与新连续性入口一致。主代理按系统调试流程核对失败快照和源码，只更新对应测试契约。随后 `visible-skeleton` 桌面/移动定向 18/18，通过后全量桌面/移动 44/44。

## 9. 独立规格对抗审查

独立高推理审查指出四个会让实现“表面通过、实际失真”的关键问题：地图局部坐标无法支撑单一关系层；Source 只是文案概念而非可发现实体；资源 canonical identity 没进入 catalog 且硬数量测试会诱发填充；Atlas 把无向相似关系强行画成因果方向，Theme 也没有自己的边标签匹配依据。

主代理接受并修正规格与计划：统一全局地图坐标并测试节点/边几何；给 Source 和 Work Item 明确 schema、结果语义与详情路由；把 canonical URL、Source、Access Version 核查作为硬不变量，把数量改为报告目标；把访问模式与地区限制拆分；补齐职业画像的依据、日期与受限枚举；让 Atlas 的 Node、Relation、Theme 共用标签 taxonomy，并显式区分有向/无向边。

审查还促成了可执行验收修正：320px 使用显式 viewport；移动菜单覆盖 focus 与 no-JS；资源参数区分 `resourceTopic`、`knowledgeTopic`、`capability`；主题覆盖完整系统/显式矩阵；范围节点展示起止 span；RED 命令不再用 `&&` 隐藏后续失败；发布不使用 `git add .`，部署证据采用有限的 runtime/evidence 两段链。

修正后完成新的文档阶段门禁：placeholder scan 与 `git diff --check` 无输出；`DESIGN.md` lint 保持 0 errors / 18 条已解释 warning；`npm run build` 完成 Astro check 0 errors / warnings / hints、Vitest 27/27 与 14 个静态页面；`CI=1 npm run test:e2e` 完成桌面和移动共 44/44。
