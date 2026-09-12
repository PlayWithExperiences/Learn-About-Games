# Innovation Atlas 内容补全：首批核查清单

更新于 2026-09-12 12:38:17 +0800 · 记录者 Codex

状态：用户已批准；首批检索、数据、验证与发布均完成。以下是候选研究范围，不是已证实的游戏归类或影响关系。用户已授权继续补全；具体批量调用仍按全局规则单独确认。

## 基线与交付

当前96对象、86关系、78证据；61款游戏，2021年以后无节点。19对象无已收录关系，本轮新增12锚点均在其中。首批核查约40–50个候选对象（含已有对象），优先建立可以解释变化的证据路线。不得用达到数量目标作为纳入理由。

每项新增对象须有具体日期语境、可核查来源及机制/结构描述；每条关系须有能支持两个端点及关系性质的具体材料，明确直接影响、设计回应、相似或争议。节目简介只能支持其明确写出的事实，不能当成已读取完整演讲。无来源或通道失败分别记录。全部对象继续消费同一个catalog。

## 候选范围（研究问题，非已证实谱系）

| 范围 | 首批候选例子 | 要核查的变化 |
|---|---|---|
| RPG与角色扮演 | Ultima、Wizardry、Dragon Quest、Final Fantasy、Baldur's Gate、Disco Elysium、Baldur's Gate 3 | 数值/队伍、叙事选择、角色表达；补既有Rogue/Diablo路线的偏重 |
| 策略、模拟与建造 | SimCity、Civilization、Theme Park、The Sims、Dwarf Fortress、Factorio | 从预设胜负到系统模拟、自由目标与玩家建造 |
| 格斗、竞速与节奏 | Street Fighter II、Virtua Fighter、Gran Turismo、Dance Dance Revolution、Guitar Hero | 对战机制、空间表现、操作装置与身体输入 |
| 联网与竞技 | MUD、Ultima Online、EverQuest、Warcraft III、DotA、League of Legends、Dota 2、PUBG、Fortnite | 持续世界、模组、协作/竞技与跨类型转译 |
| 卡牌与近年组合 | Magic: The Gathering、Slay the Spire、Balatro、Vampire Survivors | 卡组构筑、单局结构与机制重组；核清桌游与电子游戏对象类型 |
| 中国与近年作品 | 仙剑奇侠传、剑网3、原神、黑神话：悟空 | 中国作品语境、跨地区设计回应及2020s覆盖 |

既有未连边对象（特别是SimCity相关模拟、在线世界、Portal、Minecraft锚点）优先寻找关系证据；找不到就保留无已核查关系，不补猜测边。可据实际来源调整首批候选，保持50对象核查上限；整个游戏史仍需后续批次。

## 已完成的最小探针

- 本地资源目录已提供 Diablo、Ultima Online 与 Civilization 的作者复盘入口，但当前只确认其目录记录，尚未读取演讲正文。
- 单次网页搜索确认 [GDC Civilization作者复盘页面](https://www.gdcvault.com/play/1024294/Classic-Game-Postmortem-Sid-Meier) 可检索；页面摘要明确两位作者参与及设计背景，不用于推断具体作品间影响。

## 已批准的调用边界

- 服务：当前内置网页搜索/阅读工具；优先GDC、开发者/发行商官方资料与博物馆文献。
- 首批最多20个搜索查询、60个页面读取任务，合计最多80个任务（不含已完成的1次探针）。工具底层HTTP次数与内部配额记账不可见。
- 并发最多2；不自动重试；403/429/付费墙记为受阻，停止该来源。到上限后停止检索并报告覆盖和未解决项，不自动追加下一批。
- 不启动外部付费模型API、语音转写、批量视频下载或购买服务；新增付费预算为0，出现收费需求先停。内置工具的账号配额消耗无法精确估计，不承诺零消耗。
- 确认后执行：来源核查→数据与关系写入→必要布局适配→数据/浏览器验证→沿用既有发布流程更新网站。只发布通过证据校验的内容，不以完整游戏史名义交付本批。

## 首批执行回执

实际执行20次搜索、50次页面读取，无自动重试。新增38对象（32游戏/版本、6机制观察）、20关系、35来源；目录134/106/113。请求与延期原因见同目录2026-09-12-atlas-expansion-receipt.json。

原提案候选按实际来源适配，未逐一补齐所有提案游戏。四个明确延期项为BuildCraft、DDR、Guitar Hero和Magic；Theme Park、Virtua Fighter、Warcraft III及DotA没有在本批形成足以纳入的条目。本次不宣称完成其历史核查。既有对象中The Sims、EverQuest、World of Warcraft、Minecraft获得了新的关系上下文，其余旧节点与来源保留原核查日期。

关系审查补充：Ultima/Dragon Quest的馆方表述未锁定具体代数，因此本图以无向比较保留这组初代锚点，而不声称核实了1981原作到1986作品的直接影响。Wizardry的具体原作与Dragon Quest参考关系有额外的重制开发者说明。

发布回执：runtime `887c09a`，[run 34676484044](https://github.com/PlayWithExperiences/Learn-About-Games/actions/runs/34676484044) 成功；213单测/152浏览器通过（4跳过），线上数据与关联导航已验证。
