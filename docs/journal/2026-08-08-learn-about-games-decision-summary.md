# Learn About Games 决策摘要

- 日期：2026-08-08
- 状态：M0 已完成首条 Playtest 学习纵向切片；下一步是职业透镜与本地个人状态
- 设计文档：[2026-08-08-learn-about-games-design.md](../superpowers/specs/2026-08-08-learn-about-games-design.md)
- 会话记录：[2026-08-08-learn-about-games-transcript.md](2026-08-08-learn-about-games-transcript.md)

## 当前状态

- GitHub 公开仓库 `PlayWithExperiences/Learn-About-Games` 已创建。
- 本地仓库已关联同名 `origin`。
- 仓库此前为空，尚无网站代码或历史提交。
- 产品、内容模型、首版范围、贡献机制、技术栈和部署方式已经通过对话确认。
- Game Innovation Atlas、公开 Roadmap、Changelog 与 Devlog 已加入设计。
- 设计已获用户批准，实施将在 `codex/initial-site` 隔离分支进行。
- 已完成 M0 可运行垂直切片实施计划；M0 用于验证架构和真实用户路径，不冒充达到正式第一版的内容规模。
- 对抗审查发现初稿把过多未来边界处理提前到 M0；计划已从 12 个横向基础任务缩为 7 个纵向交付任务，第 2 个任务即可看到真实地图骨架。

## 决策与理由

### 能力地图作为主干

选择“能力地图优先，职业与资源作为透镜”，避免项目退化为书签目录，也避免把职业路线描述成唯一答案。

### 增加知识议题

学术研究、游戏史、价值观和玩家研究不一定是生产能力，因此使用独立的 Knowledge Topic 表达，并允许资源同时连接知识议题与能力。

### 职业必须带生产语境

AAA 的细分岗位、独立团队的多边形能力和个人开发者的取舍不同。Role Lens 与 Production Context 共同构成参考画像。

### 单项内容是默认资源粒度

GMTK、GDC 等是来源；一期视频、一场演讲或一本书才直接连接能力。重点内容可以继续细化到时间戳或章节。

### 中文优先，多语言数据先行

首版采用中文界面，但从第一天记录原作、译本、字幕、访问版本及中英文字段，后续可增加完整英文界面。

### 广泛收录与严格推荐分层

资源状态分为已收录、已归类、已审核、编辑精选和已归档。这样可以先获得足够覆盖，又不会把抓取结果伪装成质量推荐。

### 公开反馈作为证据，不做总分

第一版人工整理公开反馈摘要、出处和采样日期，不跨平台合并播放量、点赞和评分。

### 静态优先并部署 GitHub Pages

使用 Astro、TypeScript、GitHub Actions 与 GitHub Pages。第一版无账号、数据库和 CMS，个人进度保存在浏览器本地。

### Game Innovation Atlas 是站内的次级知识视图

能力地图回答“如何学习与前进”，Innovation Atlas 回答“游戏创新如何出现和演变”。两者属于同一个 Learn About Games 产品，共享网站、品牌、资源和贡献流程。创新、游戏作品、关系与证据在数据语义上与能力对象分开；相似性不能自动证明影响关系。Atlas 优先级低于核心能力地图与资源导航。

### 公开项目自身的发展路径

Roadmap 记录 Now / Next / Later，Changelog 记录发布事实，Devlog 解释关键选择。原始会话记录继续作为跨 agent 的证据层，不直接替代面向公众的 Devlog。

### 仓库是跨 AI 连续性的事实来源

留档的核心目的之一，是让任何 AI 在没有原聊天界面的情况下继续项目。根入口、决策摘要、脱敏会话记录、Roadmap、Changelog 与 Devlog 必须共同保存项目来源、发展过程、已验证现状和下一步方向。

### M0 与正式第一版分开

M0 先验证 Astro 数据契约、Playtest 学习链路、职业与个人状态、语言筛选、公开项目历史和 Atlas 种子。40–60 节点、300/100 资源、10–15 路径与 3–4 画像仍是后续正式第一版内容扩展目标。

### 早期版本设定复杂度预算

复杂度必须由当前用户路径、真实失败、部署正确性或误导性关系证明。M0 只处理现有引用完整性、Atlas 证据、GitHub Pages 子路径、语言筛选和本地进度损坏回退；不提前实现 URL 高级去重、自动因果推断、进度导入导出、迁移框架、复杂搜索和极限边界穷举。对抗审查优先删除误导与多余机制，而不是扩大系统。

### 动态模型数据只作为分配信号

2026-08-08 核查 Codex Radar 时，其 DeepSWE 数据显示模型、effort、任务类型和成本表现差异显著，因此后续分配会记录访问时间与任务上下文，不写死单一 IQ 阈值。第三方排名不能替代任务验收；价格和“免费”必须用官方条款复核。Luna 的 ChatGPT Free 无限文本聊天不等于免费 Codex 子代理或免费 API，且当前桌面运行时只暴露 Sol 与 Terra。

### Atlas 首版种子选择 Roguelike 谱系

在 Jumping、Roguelike 和 Valve Playtesting 三个候选中，Roguelike 具有最完整的可核查关系证据。首版使用 Rogue、Hack、NetHack、Moria、Angband、Diablo、Spelunky、Hades，并严格区分直接影响、派生、融合和设计启发。

## 第一版范围

- Game Design 为核心，包含通往 Creative Direction 的相邻能力。
- 40–60 个知识议题与能力节点。
- 300 个以上候选资源，至少 100 个完成审核。
- 10–15 条重点学习路径。
- 3–4 个职业与生产环境参考画像。
- 中文和英文资源筛选均可用。
- 学术资源优先覆盖与游戏设计、玩家体验和设计方法直接相关的内容。
- Game Innovation Atlas 在第一版列出八类框架，并提供至少 1 个含 6–10 个节点和证据状态的种子主题。

## 已完成的验证

- 读取并核对用户的《如何成为更好的设计师》文章，确认“拥有地图—认识自己—持续准备”的产品主线。
- 通过 GitHub CLI 确认远程仓库公开、为空，且本地 `origin` 正确关联。
- 通过官方文档确认 Astro 可用 GitHub Actions 部署至 GitHub Pages，并需正确处理项目子路径。
- 通过本地 Astro 7.2 loader 源码和实际 `astro check` / build 确认，JSON 数组的 `id` 用作 collection entry 保留字段，schema 校验普通 data 字段，`loadCatalog()` 再聚合 entry id。
- Task 2 validator 单测 6 项通过；完整 Vitest 9 项通过；Astro check 0 errors；静态构建生成 9 个页面；Chromium visible skeleton E2E 通过。
- Task 3 新增 Playtest 能力详情、基础路径、两条已审核 Work Item 与资源语言筛选；同一双语文章以一个 Work Item 和两个 access version 表达。测试先观察到目标路由和地图链接缺失而失败，随后 Chromium Playtest E2E 4 项、移动 Chromium Playtest E2E 4 项、既有 visible skeleton Chromium E2E 5 项均通过；`npm run check`、`npm test`、`npm run build` 通过。桌面与 320px 的 capability、trail、resources 截图已人工复查。
- 通过公开搜索核对 GMTK 的 `Valve's “Secret Weapon”` 示例，验证单条内容映射能力的需求。
- 通过 Carnegie Mellon University 官方资料确认 Game Innovation Database 自 2004 年起探索游戏创新、关系可视化与公众贡献。
- 通过 Digital Ludeme Project 官方资料确认 ludeme、游戏传播、独立产生与历史不确定性是创新沿革建模的重要参考。
- 核查 [Codex Radar](https://deng.codexradar.com/) 的动态 DeepSWE 指标与 OpenAI 官方 Luna 可用性：[产品公告](https://openai.com/index/improving-gpt-5-6-sol-in-chatgpt/) 和 [帮助页](https://help.openai.com/en/articles/20001354-gpt-56-in-chatgpt) 说明 Luna 对 ChatGPT Free 的文本聊天有条件免费；[API 模型页](https://developers.openai.com/api/docs/models/gpt-5.6-luna) 明确 Free 不受支持，当前也不属于免费 Codex 子代理。

## 事故与教训

- 一次 Exa 搜索命令因英文撇号与 shell 引号冲突而未执行；移除撇号后成功。后续搜索参数避免把未转义撇号嵌入单引号。
- 巨型思维导图如果混合领域、能力、方法、原则和资源，会失去可解释性。网站数据与视觉必须区分对象类型。
- 第一份 M0 计划虽可验证，但把未来数据规模所需的全量 schema、防御性校验和进度功能过早前置，延迟了可见结果。修订后先交付真实纵向切片，再由失败证据增加复杂度。
- Task 1 首次安装暴露真实 peer 冲突：`@astrojs/check@0.9.10` 只接受 TypeScript 5/6，而原计划锁定 7.0.2。npm 官方 registry 确认 6.0.3 为当前兼容版本，因此只下调 TypeScript，不使用 `--legacy-peer-deps` 绕过依赖契约。
- Task 2 建立了 Astro file loader 与 Zod 数据契约、稳定引用错误码、构建期 `loadCatalog()` 阻断、9 个领域与 9 个能力入口，以及仓库文档和 Devlog 静态页面。
- 首个可见设计采用单一浅色、冷中性色与钴蓝强调色。Domain 使用结构分区，Capability 使用可点击矩形节点；移动端退化为严格单列大纲，不缩小桌面地图。

## 未决问题

以下问题已明确延后到实现计划或后续版本，不阻塞第一版设计：

- 第一版最终视觉语言与品牌样式。
- 首批 40–60 个节点的确切分类名称。
- 首批 3–4 个职业与生产环境画像的最终名单。
- 英文界面发布时间。
- Codex Radar 与模型价格会持续变化；每轮重要分配需要重新取样，不能把本次数据固化为永久结论。

## 下一步

1. 增加角色透镜和与角色重要性分离的本地个人状态。
2. 发布 Atlas 八类框架与 Roguelike 证据种子。
3. 验证 M0 后再编写正式第一版内容扩展计划。
