---
title: Devlog 013：让 Innovation Atlas 先讲事件，再展示作品
---

# 让 Innovation Atlas 先讲事件，再展示作品

## 背景

用户指出，创新地图真正要回答的不是“哪些游戏在这里”，而是“某个品类如何被定义、哪些机制被引入、后来怎样转译和扩散”。游戏是重要材料，但不是主语。继续把游戏卡片作为主节点，会把载体误读成创新本身。

## 决策

Atlas 的主线现在由 `Innovation Event` 组成，事件使用四种有限角色：定义、机制、转译、扩散。作品通过 `carrier` 关系进入事件详情；事件之间通过 `evolution` 关系组成品类路线。没有达到证据门槛的品类保留空状态，不用年份相邻或标签相似伪造演进。

## 当前样例

第一人称射击路线先展示三段事件：第一人称视角定义、垂直空间战斗、网络化战斗空间。Doom、Quake 与 Half-Life 作为承载作品和证据入口出现。事件详情保留中文“引入方式”、角色、承载作品与原始证据深链，关闭后返回原网络位置和焦点。

## 验证与边界

事件元数据和事件关系由 catalog validator 检查；纯测试锁定稳定年份排序、空路线与 carrier closure。当前 Atlas 为 66 节点、50 条关系、73 项 Evidence；fresh build 为 140 pages，Atlas 双视口为 41 passed / 19 intentional skipped。完整 Chromium + mobile 回归为 251 passed / 21 intentional skipped。该结构仍是可修订的作者化研究视图，不是品类历史的唯一标准，也不把“第一”写进没有来源支持的标题。

本地预览保持在 `http://127.0.0.1:4321/Learn-About-Games/atlas/`；仓库仍 Private，未推送或部署。
