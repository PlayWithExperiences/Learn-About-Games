# 成长资源与 Innovation Atlas 内容基准设计

**日期：** 2026-08-22  
**状态：** 已获发起人授权，进入无人值守执行  
**执行线：** `codex/v02`（当前本地 HEAD `cef3343`）

## 1. 目标与第一性原理

这轮要验证的不是“目录看起来很大”，而是两个用户事实：

1. 成长资源是否已经达到可供检索的内容密度，同时每条仍是一个可追溯的 Work Item；
2. Innovation Atlas 是否至少有三条能从事件起点、经过有证据的演进关系、抵达承载作品或后续转译的完整路线。

当前执行线已有 5437 条 Work Item、84 个 Atlas 节点、86 条关系和 76 项 Evidence。因此，1000 条资源是最低容量门槛，不是质量分；这轮工作的重点从“继续堆数量”转为“把已经达到的数量变成可观察、可复核的基准”。

## 2. 资源基准

### 2.1 接受条件

资源基准成立需要同时满足：

- Work Item 总数 `>= 1000`；
- `canonicalUrl` 经过现有 catalog URL 归一化后没有重复；
- 每条 Work Item 引用存在的 Source，并至少拥有一个合法 Access Version；
- 每条 Work Item 至少属于一个现有 Resource Topic；当前目录约定的单一主要主题继续由既有 validator 守护；
- 资源目录不以站内评分、排名、精选或学习顺序表达质量；
- 外部旁证必须标明具体对象（例如视频简介首段、文章摘要或公开指标），并带来源与日期；它不参与排序。

### 2.2 失败语义

审计输出区分：

- `0`：没有发现违规；
- `[]`：查询确实没有匹配项；
- `null`：审计通道或输入读取失败，不得被解释为“没有问题”；
- 文件不存在：没有可审计的报告输入，不等于资源为空。

视频摘要回填仍遵守现有熔断约定：无字幕、通道失败、模型输出失败分别记录；YouTube `IpBlocked` 不能被写成“视频没有字幕”。低频涓流只允许每次处理一条，通道失败后进入显式冷却。

## 3. 完整创新路线

### 3.1 路线实体

路线由一个 Atlas Theme ID 定义。路线事件是同时满足以下条件的 `innovation` 节点：

- 包含 `innovation-event` 标签；
- `themeIds` 包含该 Theme ID；
- 有事件角色、机制说明和至少一个 Evidence。

路线关系只使用 `relationRole: "evolution"` 的事件→事件关系。承载作品通过 `relationRole: "carrier"` 的事件→作品关系连接；作品、硬件和实验程序不能被错误地当作事件。

### 3.2 “完整”的可检验定义

一个 Theme 被计为完整路线，必须存在一条确定性的事件链，满足：

1. 链上至少 3 个事件；
2. 第一个事件有 `definition` 或 `mechanism` 角色；
3. 最后一个事件有 `transformation` 或 `diffusion` 角色；
4. 相邻事件之间存在有向 `evolution` 关系；
5. 链上每个事件都有至少一个 `carrier` 关系指向可识别的作品／历史对象；
6. 链上每个事件和每条演进／承载关系引用的 Evidence 都存在；
7. 链上事件按 `startYear` 非递减排列；发生时间倒置时必须由既有 chronology 说明解释。

审计器选择最长链；长度相同按年份、事件 ID 的稳定顺序解决，不把输入数组顺序当作历史意义。路线之外的分支仍保留在全局图中，但不为“完整”计数。

本轮至少验证以下三条已存在路线：

- `first-person-shooter-lineage`：第一人称空间 → 纹理化空间／高速行动 → 垂直空间与网络化战斗；
- `role-playing-lineage`：队伍身份与任务 → 程序生成风险 → 实时动作成长 → 跨单局叙事连续性；
- `real-time-strategy-lineage`：资源、基地与生产 → 单位调度／经济反馈 → 阵营差异与反制。

开放世界路线和其他透镜继续接受审计，但不为了凑满三条而添加没有来源的边。

## 4. 实现边界

新增纯函数 `auditAtlasRoutes()`，放在独立的 `src/lib/atlas-route-audit.ts`，避免把路线质量判断混入 SVG 布局代码。它接收 Atlas nodes、relations、evidence IDs 与候选 Theme IDs，返回每条路线的事件集合、最长链、演进关系、carrier 覆盖、Evidence 缺口和 `complete` 布尔值。

新增 `scripts/audit-content-targets.mjs` 作为可观察入口，读取当前 catalog，输出 JSON 报告和一行可扫描摘要；读取失败必须以非零退出码结束。报告不写入资源正文，也不修改 catalog。

测试分两层：

- 纯 helper fixtures 覆盖空路线、分支、缺 carrier、缺 Evidence、时间倒置和稳定排序；
- 当前 catalog contract 锁定资源 `>=1000`、URL 唯一、三条路线的完整闭包和全局计数不被 audit 改写。

## 5. 不做的事

- 不把 `codex/v02` 以外的分支或 `main` 的旧 128 条目录合并进当前执行线；
- 不为了达到 1000 条重新导入重复 URL；
- 不把 2311 条 YouTube 标题目录伪装成已完成的正文语义审计；
- 不在本轮改页面布局、地图缩放、透镜交互或退休 ontology；
- 不把路线审计结果解释为游戏质量、历史正统或唯一谱系；
- 不启用 Pages、不恢复 Public、不 push。

## 6. 验证与留痕

先在嵌套 worktree 运行纯单测和数据脚本；Astro check/build 必须在仓库外独立 clone 执行，以避开已确认的父仓库 `tsconfig` 解析假失败。每个阶段落盘后做小 commit；最终更新 v0.2 决策摘要、脱敏会话记录、研究／devlog 记录，并留下资源总量、路线闭包、失败通道和独立 clone 验证的准确数字。
