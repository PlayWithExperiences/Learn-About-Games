---
title: Devlog 012：把 Innovation Atlas 的主语改成创新事件
---

# 把 Innovation Atlas 的主语改成创新事件

## 决策

Atlas 不再只让读者看到一串按年份排列的游戏卡片。用户真正想追踪的是：某种视角、机制、空间结构或进展方式何时成为可讨论的设计事件，它如何被不同作品承载，后来又怎样进入更大的语境。因此本轮新增独立的 Innovation event 节点，游戏保留为 carrier（承载作品），两者通过有证据关系连接。

## 实现

- 事件索引先于网络图显示，卡片同时给出事件年份、中文摘要和承载作品链接。
- 桌面网络与移动端原生大纲都保留事件/承载标识；事件使用独立强调，承载作品使用虚线边界，避免两种实体混成同一类卡片。
- 在原有五个事件节点上新增两个第一人称射击事件节点、两条事件演进关系和两条事件到作品的 carrier 关系；总量变为 66 nodes / 50 relations / 73 Evidence。事件路线按品类筛选，作品留在事件详情中作为承载证据。
- 证据摘要明确写出边界，不使用“第一个”“唯一发明者”等未经来源支持的强断言。
- 资源表继续使用紧凑工具栏：搜索、结果数、展开/收起和七项事实筛选在同一表头，访问版本详情用不透明层级表面，避免透出相邻条目。

## 验证

- `npm run check`：0 errors / 0 warnings / 0 hints。
- `npm test -- tests/lib/atlas-network.test.ts tests/lib/catalog-validate.test.ts`：86/86。
- `npm run build`：Astro check 0 diagnostics、Vitest 178/178、140 pages。
- Atlas innovation-event E2E：FPS 选择后 3 个事件、2 条演进关系与 Doom/Half-Life carrier closure 可达；无事件品类显示空状态；完整 Atlas 双视口回归 41 passed / 19 intentional skips。
- 资源页 Chromium E2E：20/20；1440px 资源表展开态确认标题、Source、事实列、访问原页与访问版本入口在同一紧凑行流中，移动端仍退化为单列可读结构。

## 后续

下一步继续补充常见 Genre Family 的事件—承载作品—证据三元组，并对中文/英文学习资源做来源核验和主题错配抽查。数字增长不能替代证据质量；当前仓库保持 Private，仅通过本地 `http://127.0.0.1:4321/Learn-About-Games/` 预览。
