# 第二批史料入口：本地预整理

更新于 2026-09-12T18:08:11+08:00 · 记录者 Codex

状态：批次待批准。本轮只读取 resources.json、atlas-evidence.json 和第一批研究回执；未访问外部页面，未将资源摘要提升为已核验历史证据。

## 优先利用已有入口

| 入口 | 本地记录 | 能解决的问题与限制 |
|---|---|---|
| [From COUNTER-STRIKE to LEFT 4 DEAD: Creating Replayable Cooperative Experiences](https://www.gdcvault.com/play/1422/From-COUNTER-STRIKE-to-LEFT) | `batch1000-gdc-1422` | 寻找作者对竞技与合作结构变化的回顾；不是 Counter-Strike 初始模组发布日期证明。目录标记订阅访问，不购买或绕过；只有实际取得的公开正文可使用。 |
| [Prototype Through Production: Pro Guitar in Rock Band 3](https://www.youtube.com/watch?v=HrZWGGl5duk) | `yt-20260820-gdc-HrZWGGl5duk` | 寻找 Rock Band 3 的真实乐器输入设计；不是 Guitar Hero 初代的发布日期或影响证据。已有本地摘要，尚未核对原演讲正文，不下载或转写视频。 |

## 已核查与尚缺材料

| 对象/问题 | 现有材料的有效范围 | 仍须取得 |
|---|---|---|
| BuildCraft → Factorio | 第一批回执记有作者影响陈述，未建立 BuildCraft 早期日期 | 具体版本与可核查日期；不能用未改装 Minecraft 顶替 |
| Guitar Hero | 第一批博物馆请求 tool_error；Harmonix 页面未提供足够初代事实 | 初代版本日期、控制器/规则设计及后续关系 |
| DDR | 第一批官方历史请求失败，限定域查询为空 | 官方作品档案或作者资料；空查询不代表没有史料 |
| Warcraft III / DotA → 后续团队竞技 | 当前只有 LoL、Dota 2 作品锚点；Dota 2 商品页不支持影响方向 | 原模组版本、作者、机制变化和关系两端的明确材料 |
| Rock Band | 现有 batch-rock-band 证据支持 2007 北美初代的周年日期语境 | 与 Guitar Hero 或其他音乐作品的具体设计关系 |
| Counter-Strike 与模组文化 | 本地有合作设计演讲入口 | 模组起源及具体版本资料；不可从 CS:GO 后期机制倒填初代 |

## 不作为本批起源证据的本地命中

- `resource-c-062`：CS:GO 经济内容生产，偏后期经济系统。
- `gd-next-7c563a788c16`：CS:GO 大逃杀/免费化标题记录，只是待阅读线索。
- `gd-next-89c1c9755da1`：灯光与着色更新，不能支持模组起源。
- `yt-20260820-gdc-kTiP0zKF9bc`：反作弊工程，不能支持模组起源。

本轮按作品英文名匹配本地资源标题，共命中 6 条资源；选出上述 2 条较相关入口，其余 4 条列明排除理由。该检索不是全库语义穷举，也未查看外部全文。

## 获批后的执行顺序

先核查能解开明确断点的版本/作者资料，再读关系来源。优先分配 BuildCraft、DDR/Guitar Hero、Warcraft III/DotA 和竞技模组四组；每组先判断来源是否可取得。总上限沿用待确认的 24 查询 / 60 页面读取，并发最多 2、无自动重试。失败后保留具体原因，不用无关材料凑数。此文不新增批准，不改变第三、第四阶段范围。
