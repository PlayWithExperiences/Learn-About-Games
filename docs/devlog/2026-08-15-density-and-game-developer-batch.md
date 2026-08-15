---
title: Devlog 011：页面密度修正与 Game Developer 复盘批次
---

# 页面密度修正与 Game Developer 复盘批次

日期：2026-08-15

## 这轮改变了什么

- 首页、EGDS、Career、Atlas 和资源页的说明文字改用更适合中文长句的 `text-wrap: pretty`，并保留严格断行，减少第二行只剩一两个字的情况。
- EGDS 长标题不再被窄列强制截断；框架节点标签使用平衡换行，让多行标签保持可读的词组分布。
- Career 依据区、地图说明和资源页表头移除重复装饰线，只保留表达真实结构的边界。资源工具栏继续把搜索、七项事实筛选、结果数与展开／收起放在资源表头。
- 资源页说明与结果标题不再被不必要的最大宽度限制，Work Item 继续使用紧凑的单行事实布局；访问版本详情仍使用不透明层级表面。

## 新增资料

本批新增 10 个 Game Developer 官方设计复盘条目：Half-Life 2、Children of Morta、Katamari Damacy、Restaurant Story 2、Neverwinter Nights、Sound Shapes、Biped、Mark of the Ninja、Thief: The Dark Project 和 Empires of the Undergrowth。每条均保存官方 canonical URL、英文原始语言、免费访问方式、主要 Resource Topic 与检查日期；不生成评分、排名或站内推荐。

目录当前为 41 个 Source、2120 个 Work Item、2134 个 Access Version、16 个 Resource Topic。Atlas 当前为 58 个节点、42 条关系、69 项 Evidence、10 个非排他 Genre Family 和 8 条可选择证据谱系；Roguelike 在角色扮演 Family 中已通过运行时测试成为可操作按钮。空 Family 仍明确保留“待研究”状态，避免用时间相邻或关键词相似伪造演化关系。

## 验证边界

资源与 Atlas 的候选都经过官方页面或可复核原页核验。当前仓库仍保持 Private，Pages workflow 保持停用；本轮只更新本地候选，预览继续使用 `http://127.0.0.1:4321/Learn-About-Games/`。
