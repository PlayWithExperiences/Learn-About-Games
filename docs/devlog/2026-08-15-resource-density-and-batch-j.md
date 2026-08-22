---
title: Devlog 010：资源目录密度与 Batch J
---

# 资源目录密度与 Batch J

本轮根据走查反馈把资源页收敛成一个直接可扫描的目录工具：搜索、结果数、展开／收起和七项事实筛选都位于资源表头，不再额外包裹一个“按事实筛选”标签。桌面 Work Item 的访问版本摘要与首行对齐，展开后使用不透明的层级表面；移动端仍保持原生文档流和无 JavaScript 可读性。

全站说明文本增加平衡换行与中文严格断行，减少第二行只剩孤立词语或一两个汉字的情况。该规则只作用于短说明、标题与主题入口，不改正文含义，也不靠硬编码换行。

资源研究继续以英文一手资料为主，并保留中文与少量日文核验条目。Batch J 从 GDC Vault 官方 sitemap 的 1402 个新候选中筛出 1000 个标题唯一、HTTP 200 的会话页；每条记录唯一 Work Item、官方 canonical URL、单一主要 Resource Topic、英文原始语言、subscription 访问模型、检查日期和有界主张。目录达到 41 个 Source、2110 个 Work Item、2124 个 Access Version、16 个 Resource Topic。数量不是评分，也不是推荐顺序；订阅会话不被写成免费资源。

Innovation Atlas 同期增加“解谜冒险结构谱系”证据透镜。它复用已核查的解析器到图形冒险结构入口，同时挂在 Puzzle 与 Adventure Family 下，明确是非排他的研究入口而非完整品类史。全局网络的 58 个节点、42 条关系和 69 项 Evidence 不变。

本轮验证以 fresh build、catalog／Atlas 单测、资源与 Atlas 浏览器合同、全局换行截图和本地 base-path preview 为准；仓库继续 Private，未恢复 Pages。
