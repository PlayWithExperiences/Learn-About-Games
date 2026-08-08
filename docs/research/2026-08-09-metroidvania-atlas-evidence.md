# Metroidvania Atlas Evidence Lens

- 日期：2026-08-09
- 状态：v0.2 候选研究集；不是最终 Atlas 数据
- 范围：为单一全局时间网络补充 Metroidvania 证据透镜，并保留与现有 Roguelike 透镜的最小交叉上下文
- 本轮不做：完整品类史、唯一“第一款”判定、主观评分、无来源的相似性连线、Atlas JSON/UI 实现

## 1. 研究问题与事实边界

这个透镜要回答的不是“谁发明了 Metroidvania”，而是：在可核查证据允许的范围内，哪些作品、设计结构、命名活动与后来的类别形成发生了什么关系？

需要始终区分五类陈述：

1. **作品事实**：发行时间、系列位置、作品自身公开描述。
2. **命名史**：某个词在某时某处被使用；它不自动证明使用者发明了这个词。
3. **直接影响**：开发者、官方档案或同期一手材料明确说 A 影响了 B。
4. **结构相似**：A 与 B 有相似的空间、门锁、回访或成长结构，但现有证据不足以证明因果。
5. **融合、复兴与类别形成**：后来的作品主动组合既有结构，或行业逐渐用一个名称聚合一组作品；它们通常不是单一事件、单一作品或单一作者造成的。

因此，1980–1990 年代的节点可以进入今天的 Metroidvania 主题透镜，但节点标签必须使用当时事实或中性结构描述，例如 `metroid-lineage`、`castlevania-exploration-lineage`、`ability-gated-exploration`。**主题命中不等于当时已经存在或采用 “Metroidvania” 这个名称。**

## 2. 证据与关系规则

### 2.1 来源优先级

1. 开发者本人、工作室、发行商或平台方的官方档案与访谈；
2. 同期存档、原始帖子、演讲与采访；
3. 对原始材料有清晰链接和边界说明的历史研究；
4. 媒体回顾只用于补足类别形成背景，不单独承担强因果边。

### 2.2 Atlas 关系语义

| 字段 | 本 notebook 的用法 |
| --- | --- |
| `type` | `direct-influence`、`derived-variant`、`fusion`、`revival`、`parallel-origin`、`structural-similarity` 或 `disputed` |
| `direction` | `directed` 仅在证据支持方向时使用；`parallel-origin` 与 `structural-similarity` 应为 `undirected` |
| `status` | `confirmed` = 一手或官方材料直接支持这句窄陈述；`credible` = 多项可靠史料支持但仍是历史综合；`inferred` = 有结构或时间推断；`disputed` = 来源明确冲突 |
| `evidence` | 每条因果边至少有一个可点击来源；“时间靠近”“看起来像”不能替代证据 |
| `wording` | Atlas 可以公开展示的精确措辞；不得比来源说得更强 |

关系状态评价的是**边上这句具体陈述**，不是对整款游戏、整个来源或类别成员资格的评分。节点按年份排列也不自动产生关系。

## 3. 候选节点：v0.2 建议发布集

下面 18 个节点与现有 9 个节点合并后为 27 个节点。日期尽量只精确到本轮来源能够稳定支持的粒度。

| ID | 日期 | 类型 | 主题标签建议 | 一句话事实边界 | 主要来源 |
| --- | --- | --- | --- | --- | --- |
| `metroid` | 1986 | Game | `metroid-lineage`, `ability-gated-exploration`, `2d-platform-adventure` | Nintendo 回顾将初代描述为系列第一款 2D 作品，并把迷宫式区域、取得能力后到达新地点列为其基础结构；这不是“发明整个品类”的声明。 | [Nintendo：Metroid Dread Report Vol. 4](https://metroid.nintendo.com/dread/news/metroid-dread-report-vol-4/) |
| `metroid-ii-return-of-samus` | 1991 | Game | `metroid-lineage`, `2d-platform-adventure` | Nintendo 将其列为第二款 2D Metroid；本节点只记录系列与故事连续性，不把所有机制都归因于前作。 | [Nintendo：Metroid Dread Report Vol. 4](https://metroid.nintendo.com/dread/news/metroid-dread-report-vol-4/) |
| `super-metroid` | 1994 | Game | `metroid-lineage`, `ability-gated-exploration`, `backtracking` | Nintendo 将其列为第三款 2D Metroid；它可作为后来作品明确提及的影响源，但不能仅凭相似性推定所有后继作品都受其影响。 | [Nintendo：Metroid Dread Report Vol. 4](https://metroid.nintendo.com/dread/news/metroid-dread-report-vol-4/), [Nintendo 开发者访谈](https://www.nintendo.com/en-za/News/2017/September/Nintendo-Classic-Mini-SNES-developer-interview-Volume-3-Super-Metroid-1285309.html) |
| `castlevania-ii-simons-quest` | 1987-08-28 | Game | `castlevania-exploration-lineage`, `action-rpg`, `nonlinear-context` | Konami 官方历史把它描述为从 stage-clear 改为 RPG 式的城镇、迷宫、道具与昼夜结构；本轮没有验证它与 Metroid 的直接影响或“平行发明”关系。 | [Konami：Castlevania II history](https://www.konami.com/games/castlevania/jp/ja/page/history_1987_fcd) |
| `zelda-ii-adventure-of-link` | 1987 | Game | `zelda-lineage`, `action-rpg`, `platform-adventure` | 这里作为 Team Cherry 明确提到的灵感来源进入网络，不把它改写为 Metroidvania 类别成员。 | [Nintendo：Zelda II](https://www.nintendo.com/jp/software/zelda2/index.html), [Nintendo AU：Team Cherry interview](https://www.nintendo.com/au/news-and-articles/the-metamorphosis-of-hollow-knight-with-team-cherry-aussie-developer-interview/) |
| `faxanadu` | 1987 | Game | `action-rpg`, `platform-adventure` | 官方页面将其描述为 action RPG；它因 Team Cherry 的直接灵感陈述进入网络，而不是因为今天的标签回填。 | [Nintendo UK：Faxanadu](https://www.nintendo.com/en-gb/Games/Virtual-Console-Wii-/Faxanadu-277259.html), [MobyGames：1987 release record](https://www.mobygames.com/game/7331/faxanadu/) |
| `zelda-a-link-to-the-past` | 1991 | Game | `zelda-lineage`, `item-gated-exploration`, `action-adventure` | Nintendo 将其描述为通过道具解开场地与迷宫谜题的 action adventure；Igarashi 明确把 Zelda 式探索和解锁下一区域作为 SOTN 的灵感。 | [Nintendo：A Link to the Past](https://www.nintendo.com/jp/titles/50010000039699.html), [Game Developer：Igarashi interview](https://www.gamedeveloper.com/design/-i-castlevania-i-s-koji-igarashi-offers-advice-to-today-s-metroidvania-devs) |
| `castlevania-symphony-of-the-night` | 1997 | Game | `castlevania-exploration-lineage`, `rpg-progression`, `ability-gated-exploration` | Konami 记录其武器、秘密与变身；Igarashi 把 Zelda 说成有意设计来源，并承认成品与 Metroid 存在结构上的相似。 | [Konami：SOTN history](https://www.konami.com/games/castlevania/us/en-us/page/history_1997_ps), [Game Developer：Igarashi interview](https://www.gamedeveloper.com/design/-i-castlevania-i-s-koji-igarashi-offers-advice-to-today-s-metroidvania-devs) |
| `castlevania-circle-of-the-moon` | 2001 | Game | `castlevania-exploration-lineage`, `term-history-context`, `map-completion` | Konami 记录其探索、DSS、地图完成度与收集；2001 年存档帖将 “Metroidvania” 用于这款作品，但不证明发帖者创造了该词。 | [Konami：Circle of the Moon history](https://www.konami.com/games/castlevania/eu/en/page/history_2001_gba), [2001 Google Groups 存档](https://groups.google.com/g/rec.games.video.nintendo/c/Iq7Q2fqdkIE/m/hOLAJKzHR8QJ) |
| `metroidvania-term-category-formation` | 2001–2015 | Category Formation | `term-history`, `category-formation`, `metroidvania-name` | 该时间段表示从目前找到的 2001 年存档用例，到媒体与开发者逐步扩展、稳定使用该名称；它不是一个可归给唯一作者的瞬时发明事件。 | [2001 Google Groups 存档](https://groups.google.com/g/rec.games.video.nintendo/c/Iq7Q2fqdkIE/m/hOLAJKzHR8QJ), [A Critical Hit：命名档案研究](https://www.acriticalhit.com/exploring-metroidvania-meaning-history/), [Game Developer：2015 genre synthesis](https://www.gamedeveloper.com/design/the-undying-allure-of-the-metroidvania) |
| `cave-story` | 2004 | Game | `indie`, `metroid-influence`, `exploration-platformer` | Amaya 明确说 Metroid 与 Dragon Quest 是最强灵感；本节点不把 Cave Story 写成独自开启独立游戏运动或唯一复兴者。 | [Cave Story archive：Amaya interview](https://archive.cavestory.org/onetwork/), [GDC Vault：The Story of CAVE](https://gdcvault.com/play/1014621/The-Story-of-CAVE) |
| `indie-metroidvania-expansion` | 2004–2015 | Category Formation | `indie`, `category-expansion`, `revival-context` | 这是历史综合节点：从 Cave Story 到 2015 年开发者与媒体已能讨论一个广泛、持续的独立创作场域；它不把扩张归因于单一游戏。 | [Game Developer：2015 genre synthesis](https://www.gamedeveloper.com/design/the-undying-allure-of-the-metroidvania) |
| `shadow-complex` | 2009-08-19 | Game | `revival`, `super-metroid-influence`, `nonlinear-world` | Donald Mustard 明确说团队要处理 Metroid 式问题，并称 Super Metroid 是个人最爱；这支持具体影响，不支持它单独“拯救”品类。 | [Game Developer：Donald Mustard interview](https://www.gamedeveloper.com/design/making-i-shadow-complex-i-donald-mustard-speaks), [Xbox Wire：release](https://news.xbox.com/en-us/2009/08/19/arcade-shadow-complex/) |
| `axiom-verge` | 2015-03-31 | Game | `indie`, `metroid-influence`, `retro-sci-fi` | 创作者 Tom Happ 把 Metroid 列入多项灵感来源；只能陈述“其中之一”，不能改写为唯一血统。 | [PlayStation Blog：Tom Happ](https://blog.playstation.com/2014/04/30/axiom-verge-sci-fi-sidescroller-coming-to-ps4-vita/), [Axiom Verge：release announcement](https://www.axiomverge.com/blog/axiom-verge-releases-march-31st-on-ps4) |
| `ori-and-the-blind-forest` | 2015 | Game | `metroidvania-self-description`, `platforming`, `super-metroid-influence`, `sotn-influence` | Moon Studios 的 postmortem 把原型描述为 Metroidvania 与 platformer 的混合，并明确列出 Super Metroid、SOTN 与 Super Meat Boy 等影响。 | [Game Developer：Moon Studios postmortem](https://www.gamedeveloper.com/audio/postmortem-moon-studios-heartfelt-i-ori-and-the-blind-forest-i-), [Xbox Wire：release](https://news.xbox.com/en-us/2015/03/10/ori-blind-forest-now-available-xbox/) |
| `hollow-knight` | 2017-02-24 | Game | `indie`, `exploration-platformer`, `multiple-direct-influences` | Team Cherry 明确提到 Metroid、Faxanadu 与 Zelda II 带来的感受；本节点保留多来源构成，不把作品压成单一谱系。 | [Nintendo AU：Team Cherry interview](https://www.nintendo.com/au/news-and-articles/the-metamorphosis-of-hollow-knight-with-team-cherry-aussie-developer-interview/), [Nintendo Life：Team Cherry interview](https://www.nintendolife.com/news/2018/01/feature_bugging_out_with_hollow_knights_team_cherry), [Team Cherry：2017 release post](https://www.teamcherry.com.au/blog/2017-begins-with-a-switch) |
| `dead-cells` | 2018-08-07 | Game | `roguelite`, `metroidvania-self-description`, `fusion`, `cross-theme` | Motion Twin 官方资料把 Dead Cells 描述为现代 Roguelite 与旧式 MetroidVania 的混合，并列出 Spelunky、SOTN 等多个“亲本”；这提供两个透镜的明确桥接。 | [Motion Twin：official press kit](https://motiontwin.com/presskit/), [Dead Cells：products](https://deadcells.com/products) |
| `bloodstained-ritual-of-the-night` | 2019-06-18 | Game | `revival`, `igavania-self-description`, `sotn-lineage` | Igarashi 把项目定位为其 2D Castlevania/SOTN 工作的精神续作；“精神续作”不等于法定系列续作或复制全部设计。 | [Kickstarter：Bloodstained](https://www.kickstarter.com/projects/iga/bloodstained-ritual-of-the-night), [Game Developer：Igarashi interview](https://www.gamedeveloper.com/business/koji-igarashi-on-the-power-and-responsibility-of-being-kickstarter-funded), [PlayStation：launch trailer](https://www.youtube.com/watch?v=d79KArgmgcc) |

## 4. 候选关系：建议写入的 18 条边

这些边加上现有 Roguelike 的 7 条 `confirmed` 边后，共 25 条。`from → to` 仅表示有向关系；`from ↔ to` 表示无向关系。

| # | From / To | Type | Direction | Status | Evidence | 建议公开措辞与边界 |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | `metroid` → `metroid-ii-return-of-samus` | `derived-variant` | directed | confirmed | [Nintendo：Metroid Dread Report Vol. 4](https://metroid.nintendo.com/dread/news/metroid-dread-report-vol-4/) | **Nintendo 将 Metroid II 列为第二款 2D Metroid，并延续初代之后的任务。** 只表达官方系列与故事延续，不宣称所有机制都由初代直接派生。 |
| 2 | `metroid-ii-return-of-samus` → `super-metroid` | `derived-variant` | directed | confirmed | [Nintendo：Metroid Dread Report Vol. 4](https://metroid.nintendo.com/dread/news/metroid-dread-report-vol-4/) | **Nintendo 将 Super Metroid 列为第三款 2D Metroid，其故事承接 Metroid II。** 不把系列次序扩大成排他的设计因果。 |
| 3 | `zelda-a-link-to-the-past` → `castlevania-symphony-of-the-night` | `direct-influence` | directed | confirmed | [Game Developer：Igarashi interview](https://www.gamedeveloper.com/design/-i-castlevania-i-s-koji-igarashi-offers-advice-to-today-s-metroidvania-devs), [GameSpot：Igarashi recorded interview summary](https://www.gamespot.com/articles/castlevanias-koji-igarashi-explains-the-influence-/1100-6481658/) | **Igarashi 说明团队喜爱 Zelda，并把探索、取得物品后解锁下一区域的结构用于 SOTN 的方向。** 不宣称 Zelda 是唯一来源。 |
| 4 | `super-metroid` ↔ `castlevania-symphony-of-the-night` | `structural-similarity` | undirected | confirmed | [Game Developer：Igarashi interview](https://www.gamedeveloper.com/design/-i-castlevania-i-s-koji-igarashi-offers-advice-to-today-s-metroidvania-devs) | **Igarashi 承认两者在获得新能力后回访、继续探索的结构上相似，同时把 SOTN 的有意灵感指向 Zelda。** 这是相似性边，不能显示成 `Super Metroid → SOTN` 的直接影响。 |
| 5 | `roguelike-run-structure` → `dead-cells` | `fusion` | directed | confirmed | [Motion Twin：official press kit](https://motiontwin.com/presskit/), [Xbox Wire France：Motion Twin interview](https://news.xbox.com/fr-fr/2018/06/25/made-in-france-entretien-exclusif-avec-motion-twin/) | **Motion Twin 明确说 Dead Cells 有意混合 Roguelite 与 Metroidvania；现有 run-based 结构节点可作为前者的设计概念来源。** 这不宣称所有 Roguelite 结构相同，也不替代第 16、17 条的具体作品来源。 |
| 6 | `metroid` → `cave-story` | `direct-influence` | directed | confirmed | [Cave Story archive：Amaya interview](https://archive.cavestory.org/onetwork/) | **Amaya 把 Metroid 与 Dragon Quest 说成 Cave Story 最强的两项灵感。** Metroid 是多项来源之一。 |
| 7 | `cave-story` → `indie-metroidvania-expansion` | `revival` | directed | credible | [Game Developer：2015 genre synthesis](https://www.gamedeveloper.com/design/the-undying-allure-of-the-metroidvania), [GDC Vault：The Story of CAVE](https://gdcvault.com/play/1014621/The-Story-of-CAVE) | **历史回顾把 2004 年 Cave Story 视为后来独立探索平台游戏扩张的重要早期转折点之一。** `credible` 表示这是跨资料历史综合，不是作品独自造成整个运动。 |
| 8 | `super-metroid` → `shadow-complex` | `direct-influence` | directed | confirmed | [Game Developer：Donald Mustard interview](https://www.gamedeveloper.com/design/making-i-shadow-complex-i-donald-mustard-speaks) | **Donald Mustard 明确说 Super Metroid 是个人最爱，并说明 Shadow Complex 有意处理 Metroid 式的非线性世界。** 不宣称两作之外没有其他来源。 |
| 9 | `shadow-complex` → `indie-metroidvania-expansion` | `revival` | directed | credible | [Game Developer：Donald Mustard interview](https://www.gamedeveloper.com/design/making-i-shadow-complex-i-donald-mustard-speaks), [Game Developer：2015 genre synthesis](https://www.gamedeveloper.com/design/the-undying-allure-of-the-metroidvania) | **同期访谈与后来的历史回顾把 Shadow Complex 视为一次有意面向当时较少见结构的商业复兴，并显示其仍有受众。** 不写成“单独复活品类”。 |
| 10 | `metroid` → `axiom-verge` | `direct-influence` | directed | confirmed | [PlayStation Blog：Tom Happ](https://blog.playstation.com/2014/04/30/axiom-verge-sci-fi-sidescroller-coming-to-ps4-vita/) | **Tom Happ 明确把 Metroid 列为 Axiom Verge 的多项灵感之一。** 不把视觉或机制相似进一步解释成复制。 |
| 11 | `super-metroid` → `ori-and-the-blind-forest` | `direct-influence` | directed | confirmed | [Game Developer：Moon Studios postmortem](https://www.gamedeveloper.com/audio/postmortem-moon-studios-heartfelt-i-ori-and-the-blind-forest-i-) | **Moon Studios 的 postmortem 明确把 Super Metroid 列为 Ori 的参考来源之一。** |
| 12 | `castlevania-symphony-of-the-night` → `ori-and-the-blind-forest` | `direct-influence` | directed | confirmed | [Game Developer：Moon Studios postmortem](https://www.gamedeveloper.com/audio/postmortem-moon-studios-heartfelt-i-ori-and-the-blind-forest-i-) | **同一 postmortem 明确把 SOTN 列为 Ori 的参考来源之一。** 与上一条并存以保留多源事实。 |
| 13 | `faxanadu` → `hollow-knight` | `direct-influence` | directed | confirmed | [Nintendo AU：Team Cherry interview](https://www.nintendo.com/au/news-and-articles/the-metamorphosis-of-hollow-knight-with-team-cherry-aussie-developer-interview/), [Nintendo Life：Team Cherry interview](https://www.nintendolife.com/news/2018/01/feature_bugging_out_with_hollow_knights_team_cherry) | **Team Cherry 说明工作室由对 Faxanadu 与 Zelda II 等作品的喜爱聚合，并希望唤起玩 Faxanadu 时的感受。** 不宣称是唯一或逐项机制来源。 |
| 14 | `zelda-ii-adventure-of-link` → `hollow-knight` | `direct-influence` | directed | confirmed | [Nintendo AU：Team Cherry interview](https://www.nintendo.com/au/news-and-articles/the-metamorphosis-of-hollow-knight-with-team-cherry-aussie-developer-interview/), [Nintendo Life：Team Cherry interview](https://www.nintendolife.com/news/2018/01/feature_bugging_out_with_hollow_knights_team_cherry) | **Team Cherry 明确把 Zelda II 列入工作室共同喜爱的作品与 Hollow Knight 希望唤起的体验来源。** |
| 15 | `metroid` → `hollow-knight` | `direct-influence` | directed | confirmed | [Nintendo Life：Team Cherry interview](https://www.nintendolife.com/news/2018/01/feature_bugging_out_with_hollow_knights_team_cherry) | **Team Cherry 明确说 Hollow Knight 希望唤起玩 Metroid、Faxanadu 或 Zelda II 时的感受。** 这里保留原话中的多来源结构，不写成唯一谱系。 |
| 16 | `castlevania-symphony-of-the-night` → `dead-cells` | `fusion` | directed | confirmed | [Motion Twin：official press kit](https://motiontwin.com/presskit/), [Xbox Wire France：Motion Twin interview](https://news.xbox.com/fr-fr/2018/06/25/made-in-france-entretien-exclusif-avec-motion-twin/) | **Motion Twin 把 Dead Cells 描述为现代 Roguelite 与旧式 MetroidVania 的融合，并明确列出 SOTN。** SOTN 是官方列出的多个“亲本”之一。 |
| 17 | `spelunky` → `dead-cells` | `fusion` | directed | confirmed | [Motion Twin：official press kit](https://motiontwin.com/presskit/) | **同一官方描述把 Spelunky 列入 Dead Cells 的现代 Roguelite 来源组。** 这是与现有 Roguelike 透镜的证据桥，不宣称 Spelunky 单独决定 Dead Cells。 |
| 18 | `castlevania-symphony-of-the-night` → `bloodstained-ritual-of-the-night` | `revival` | directed | confirmed | [Kickstarter：Bloodstained](https://www.kickstarter.com/projects/iga/bloodstained-ritual-of-the-night), [Game Developer：Igarashi interview](https://www.gamedeveloper.com/business/koji-igarashi-on-the-power-and-responsibility-of-being-kickstarter-funded) | **Igarashi 把 Bloodstained 定位为其 2D Castlevania/SOTN 创作线的精神续作。** “精神续作”不表示法定系列续作，也不表示设计完全相同。 |

### 4.1 数量与状态核算

| 项目 | 现有 Roguelike | 本轮新增 | 合并后 |
| --- | ---: | ---: | ---: |
| 节点 | 9 | 18 | 27 |
| 关系 | 7 | 18 | 25 |
| `confirmed` 关系 | 7 | 16 | 23 |
| `credible` 关系 | 0 | 2 | 2 |

合并结果满足首发 **25–40 个节点、15–25 条有证据关系** 的范围，同时只使用一个全局网络。`dead-cells` 同时带 Roguelike 与 Metroidvania 相关标签，`spelunky → dead-cells` 是两个主题透镜之间的明确证据桥。

## 5. 透镜与全局网络的实现含义

- **时间只决定 x 轴**；主题不建立第二张图，也不能移动、复制或删除节点。
- Metroidvania 透镜只高亮匹配节点和关系，顶部总数仍显示全局的 27/25；旁边另列“当前高亮数”。
- 早期作品使用中性、可解释标签。只有开发者或官方后来明确自称时，才使用 `metroidvania-self-description`。
- Game、Innovation、Category Formation 必须使用不同形状。上述两个时间段节点属于 Category Formation，不得画成一款游戏或一个瞬间。
- 有向边必须显示箭头；`structural-similarity` 必须无向。边的类型、状态与来源要能在详情面板中同时看到。
- 没有边的上下文节点仍可发布。`castlevania-ii-simons-quest` 在本轮就是有意保留的例子：**相关时间与结构背景不自动变成因果。**
- `confirmed` 不应被视觉编码成“更好的游戏”；它只表示当前窄陈述有直接证据。

## 6. Rejected / Needs Verification

| 候选说法或边 | 处理 | 原因与继续验证方式 |
| --- | --- | --- |
| “Metroid 发明了 Metroidvania” | Reject | “发明”混合了作品机制、后来的名称与类别形成；现有来源只支持具体作品结构与后续影响。 |
| “存在唯一第一款 Metroidvania” | Reject | 分类标准与名称均后置，多个早期作品可呈现部分结构。Atlas 应展示证据网络，不裁定单一祖先。 |
| “Richard Hutnik / Scott Sharkey / Jeremy Parish 创造了这个词” | Reject | 2001 帖只是目前找到的早期存档用例；丢失的论坛、口头用法与更早记录使唯一作者无法证明。[档案研究](https://www.acriticalhit.com/exploring-metroidvania-meaning-history/)也明确保留不确定性。 |
| `castlevania-circle-of-the-moon` → `metroidvania-term-category-formation` | Reject under current schema | 原始帖子能证明词被用于作品，却不能证明类别由作品“直接影响”或“派生”。现有关系枚举缺少非因果的 `term-applied-to`；应把存档放在命名节点证据中，而不是借错关系类型连线。 |
| `super-metroid` → `castlevania-symphony-of-the-night` as `direct-influence` | Reject for v0.2 | Igarashi 明确指向 Zelda 作为有意灵感，同时承认与 Metroid 的结构相似；因此只发布无向 `structural-similarity`。若找到设计期原始访谈再升级。 |
| `metroid` ↔ `castlevania-ii-simons-quest` as `parallel-origin` | Needs verification | 年份接近不等于独立起源。尚未找到双方开发者或同期资料证明二者在未知彼此的情况下形成相似结构。两个节点可以共存但不连线。 |
| `castlevania-ii-simons-quest` → `castlevania-symphony-of-the-night` as `direct-influence` | Needs verification | 二手文章常引用旧攻略本或团队对前作评价，但本轮没有直接核对原始日文材料。不要用二手转述承担强因果边。 |
| Dark Souls ↔ Metroidvania / Dark Souls → Hollow Knight | Needs verification | 常见比较不足以建立因果；本轮没有找到范围明确的开发者原话。可在后续 Soulslike 透镜研究中单独验证。 |
| Aquaria、La-Mulana、Guacamelee、Salt and Sanctuary、Rogue Legacy、Blasphemous 等 | Hold | 都可能扩展网络，但本轮没有在节点预算内为其建立足够窄的一手证据边。后续应按作品逐项找开发者材料，不能只凭商店标签。 |
| “Cave Story 开启了整个独立游戏运动” | Reject wording | 2015 年历史回顾支持“重要早期转折点之一”，不支持单一原因。关系保留为 `credible revival`。 |
| “Shadow Complex 单独复活了品类” | Reject wording | 同期意图与商业可见度可验证，但类别复兴由多个作品、平台和开发者共同形成。关系保留为 `credible revival`。 |
| 把官方商店的 genre tag 当作客观归类 | Reject method | 商店或宣传文本只能证明当事方如何自我描述；它不能替代机制分析或历史关系证据。 |

## 7. 后续研究队列

按价值与可验证性排序：

1. 找到并核对 Igarashi 团队关于 Castlevania II、SOTN 设计过程的原始日文攻略本或采访扫描，决定是否建立系列内直接影响边。
2. 对 2001 年前后 Usenet、论坛与纸媒进行更系统的存档检索，继续寻找更早的 “Metroidvania” 用例；发现更早记录时更新“目前找到的最早存档”，仍不轻易宣称首创者。
3. 为 Cave Story、Shadow Complex 之外的 2000–2010 年代独立作品建立一手采访证据，观察 `indie-metroidvania-expansion` 是否应拆成多个更精确的类别形成节点。
4. 单独研究 Dark Souls、La-Mulana 与 Hollow Knight 的结构相似、直接影响和玩家文化解释，避免把社区常识误画成开发因果。
5. 当新增边超过首发 25 条预算时，优先保留一手因果边与跨主题桥；把纯结构对照留给详情页或下一版。

## 8. 研究方法与限制

- 本轮按 `agent-reach` 路由执行：先尝试 Exa 搜索，再用 Jina/网页读取直接核对来源页面。Exa 免费端点在本轮持续返回 HTTP 429，因此来源发现需要网页搜索补充，但最终候选边尽量回到开发者、官方或原始存档。
- 来源包含英语、日语、西班牙语与法语页面。公开数据应保存原始标题、语言和 URL；中文摘要是边界明确的转述，不应假装是原文标题。
- 某些官方站点会改版、地区重定向或阻挡自动请求。发布时保留稳定 URL；若页面消失，应先找官方镜像或 Web Archive 存档，而不是无提示换成弱二手来源。
- 本 notebook 是研究输入，不是对候选节点的主观评分，也不表示所有候选都必须永久留在 Atlas。

## 9. 实现交接清单

- [ ] 节点总数为 27，关系总数为 25；主题切换不改变这两个全局数字。
- [ ] 18 条新增边都有至少一个可点击来源；没有以“年份相邻”代替因果证据。
- [ ] `Super Metroid ↔ SOTN` 是无向 `structural-similarity`，不是直接影响箭头。
- [ ] 2001 年记录显示为“目前找到的最早存档用例”，不显示“词语发明者”。
- [ ] Circle of the Moon 与命名形成节点之间不借用因果关系类型；2001 年存档从命名节点详情中访问。
- [ ] `metroidvania-term-category-formation` 与 `indie-metroidvania-expansion` 使用 Category Formation 形状与时间跨度。
- [ ] `dead-cells` 同时可被 Roguelike 与 Metroidvania 透镜高亮，`spelunky → dead-cells` 保持为跨主题证据桥。
- [ ] 详情面板同时暴露 relation type、direction、status、边界措辞与来源。
- [ ] `castlevania-ii-simons-quest` 没有因时间或表面相似而被自动连边。
