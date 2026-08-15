# Innovation Event Atlas 与资源扩展实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax.

**Goal:** 将 Atlas 的主阅读对象提升为有证据的创新事件／机制演进，继续导入约 1000 条英文与中文学习资源，并系统消除关键页面的异常换行。

**Architecture:** 保留现有全局 Atlas 网络和 `game` 作品节点，新增带 Evidence 闭包的 `innovation` / `category` 事件节点与事件—作品关系；Theme 只负责强调，不复制子图。资源仍使用现有 Work Item / Source / Access Version 模型，按可核验批次写入 catalog；换行修正只调整现有全局 CSS 和跨视口浏览器契约。

**Tech Stack:** Astro content collections、TypeScript、JSON catalog、Vitest、Playwright、Agent Reach（Exa + Jina）。

---

### Task 1: 锁定研究清单与 Atlas 事件合同

**Files:**
- Create: `docs/research/2026-08-15-atlas-innovation-events.md`
- Modify: `tests/lib/atlas-network.test.ts`
- Modify: `tests/lib/catalog-data.test.ts`
- Modify: `tests/lib/catalog-validate.test.ts`

- [ ] **Step 1: 写 RED 测试**

新增测试要求至少存在五个事件 ID，并要求事件节点有 `kind` 为 `innovation` 或 `category`、至少一个 Evidence、至少一条连接承载作品或关系。测试直接锁定事件 ID 集合：

```ts
expect(new Set(atlasNodes.filter((node) => node.kind !== 'game').map((node) => node.id))).toEqual(
  expect.arrayContaining([
    'first-person-shooter-perspective',
    'lock-on-targeting-combat',
    'rpg-character-progression',
    'open-world-nonlinear-exploration',
    'procedural-run-structure',
  ]),
);
```

新增负例：事件节点缺 Evidence、事件关系缺 Evidence、Theme tag 不存在或空品类按钮没有 `data-atlas-family-empty` 语义时必须失败。

- [ ] **Step 2: 运行 RED**

运行：

```bash
npm test -- tests/lib/atlas-network.test.ts tests/lib/catalog-data.test.ts tests/lib/catalog-validate.test.ts
```

预期：新增事件 ID、闭包和空 Family 语义测试失败；既有测试结果保持可区分。

- [ ] **Step 3: 使用 Agent Reach 核验来源**

先运行 `agent-reach doctor --json`。用 Exa 发现候选，用 Jina 读取具体页面；每个事件至少保留一条开发者／机构／同期材料。优先核验 Nintendo Iwata Asks 的 Z-targeting、FPS 参与者回顾、RPG 设计史、开放世界开发者访谈、程序生成／Roguelike 设计史。Exa 429 后停止继续调用，并在 notebook 中记录限制。

- [ ] **Step 4: 写研究 notebook**

对每个候选记录：URL、标题、作者／机构、checkedAt、sourceKind、支持的窄 claim、对应节点／关系、纳入理由和排除项。明确不把“第一款”写成无边界事实。

- [ ] **Step 5: 运行研究清单检查**

运行：

```bash
rg -n "TBD|TODO|待核验|搜索摘要" docs/research/2026-08-15-atlas-innovation-events.md
```

预期只出现明确的排除理由，不出现未决候选或搜索摘要作为证据。

### Task 2: 实现 Atlas 事件节点、关系与详情

**Files:**
- Modify: `src/data/atlas-nodes.json`
- Modify: `src/data/atlas-relations.json`
- Modify: `src/data/atlas-evidence.json`
- Modify: `src/data/atlas-themes.json`
- Modify: `src/lib/atlas-network.ts`
- Modify: `src/components/AtlasNetwork.astro`
- Modify: `src/styles/global.css`
- Test: `tests/lib/atlas-network.test.ts`
- Test: `tests/e2e/atlas.spec.ts`

- [ ] **Step 1: 保持既有节点类型合同**

继续使用 `kind: 'innovation' | 'category' | 'game'`，不新增不可复用的专用 kind。为事件补现有 tags，并为承载关系使用已存在的 `direct-influence`、`design-response`、`prototype-to-product`、`commercialized-as`、`fusion` 或 `revival`。

- [ ] **Step 2: 写事件与关系数据**

为五个事件分别加入窄摘要、年份或范围、tag、Evidence；至少连接两个已有或新增游戏承载节点。每条关系的 `summary` 必须说明“提出／转译／普及／类别形成”的具体语义，不能只写“影响”。

- [ ] **Step 3: 实现事件权重和详情数据**

在 `AtlasNetwork.astro` 建立 `eventNodes` 与 `artifactNodes` 派生集合，为事件节点添加 `data-atlas-event`、可访问名称和事件详情入口；作品节点继续保持可选的轻量样式。事件详情复用现有 native dialog／details 语义，不创建第二张地图。

- [ ] **Step 4: 实现透镜强调**

扩展 `matchAtlasTheme` 的输出或前端状态，使选中 Theme 同时标记命中的事件、作品和关系；不改变节点坐标、数量、scale、pan、search 或 map mode。空 Family 目录必须输出非交互说明属性，避免死按钮。

- [ ] **Step 5: 写浏览器 RED→GREEN 合同**

新增 E2E：

```ts
await expect(page.locator('[data-atlas-event="first-person-shooter-perspective"]')).toHaveCount(1);
await expect(page.locator('[data-atlas-event-detail]')).toContainText('承载作品');
await page.getByRole('button', { name: 'Roguelike' }).click();
await expect(page.locator('[data-atlas-event][data-theme-match="true"]')).not.toHaveCount(0);
```

同时锁定空 Family 的“待补证据”文本、点击事件不改变 scene bbox、Escape 恢复原节点焦点，以及 no-JS 事件详情仍可达。

### Task 3: 全局换行与地图可读性修正

**Files:**
- Modify: `src/styles/global.css`
- Modify: `tests/e2e/egds-routes.spec.ts`
- Modify: `tests/e2e/career-lenses.spec.ts`
- Modify: `tests/e2e/resources-v02.spec.ts`
- Modify: `tests/e2e/atlas.spec.ts`

- [ ] **Step 1: 写跨页面 RED**

对 `/egds/`、`/map/`、`/resources/`、`/atlas/`、`/about/` 的主要 h1、lede、section heading 逐字测量行分组；当第二行只有 1–2 个中文字符或一个孤立英文词时失败。同步检查 1440、1024、320 三种宽度的 `scrollWidth === clientWidth`。

- [ ] **Step 2: 只调整真实窄列**

优先把长说明从 `balance` 改为 `pretty`，移除没有信息含义的 `max-width` 和重复 divider；保留地图节点短标签的 `balance`，避免把短卡片弄散。不要全局禁用换行，也不要使用 overflow hidden 截断内容。

- [ ] **Step 3: 验证视觉状态**

采集 Light/Dark × 1440/1024/320 的关键页面截图，目检 h1、资源表工具条、Atlas 事件详情和地图节点；对长文本使用自然两行而不是孤立短行。

### Task 4: 导入约 1000 条英文／中文学习资源

**Files:**
- Modify: `src/data/resources.json`
- Modify: `src/data/sources.json`
- Modify: `tests/lib/catalog-data.test.ts`
- Modify: `docs/research/2026-08-15-resource-expansion-batches.md`

- [ ] **Step 1: 写批次 RED**

在测试中声明目标增量为 1000（允许最后一批在核验不足时停止并记录实际数量），并锁定每批 canonical 唯一、one-topic、合法 capability／knowledgeTopic、语言和媒体分布。先运行得到期望的数量差异。

- [ ] **Step 2: 导入第一批官方 GDC／Game Developer**

使用官方 GDC Vault sitemap／session pages 与 Game Developer 原文；每条用稳定 URL、真实 subscription/free、`checkedAt` 和窄 claim。导入前按 normalized URL 和 GDC play ID 去重。

- [ ] **Step 3: 导入课程、论文和官方工具资料**

优先 MIT OCW、大学公开课程、Game AI Pro、Level Design Book、Game Accessibility Guidelines、Unity／Unreal／Godot／FMOD 官方学习页；平台聚合页、无法确认标题／作者或仅有搜索摘要的条目排除。

- [ ] **Step 4: 导入中文资料**

优先腾讯游戏学堂、官方开发者文章、中文正式课程／实录与作者公开文章；中文条目不足时不伪造翻译或把 talk 改成 article，保留英文高质量补充。

- [ ] **Step 5: 每批运行 catalog 验证**

每批运行：

```bash
npm test -- tests/lib/catalog-data.test.ts tests/lib/catalog-validate.test.ts
npm run check
```

只在该批通过后继续下一批，研究 notebook 记录实际数量和排除项。

### Task 5: Fresh gates、留痕和本地交付

**Files:**
- Modify: `docs/journal/2026-08-09-learn-about-games-v02-decision-summary.md`
- Modify: `docs/journal/2026-08-09-learn-about-games-v02-transcript.md`
- Modify: `ROADMAP.md`
- Modify: `CHANGELOG.md`
- Create: `docs/devlog/2026-08-15-innovation-events-and-resource-expansion.md`

- [ ] **Step 1: 更新项目留痕**

记录事件模型、资源实际计数、证据限制、未完成的 Atlas lineage 和换行修正；不把历史 GitHub Pages 或 Private 仓库写成当前公开部署。

- [ ] **Step 2: 运行完整门禁**

按顺序运行：

```bash
npm run check
npm test
npm run build
npx playwright test --workers=1 --reporter=line
git diff --check
```

预期：check 无 error/warning/hint，unit 和 E2E 无失败，Astro build 成功，工作树只包含本计划文件。

- [ ] **Step 3: 核验本地预览**

保持 `127.0.0.1:4321` 预览进程不被停止，逐一确认 `/Learn-About-Games/`、`/resources/`、`/map/`、`/atlas/`、`/egds/` 返回 200；不 push、不启用 Pages。

- [ ] **Step 4: 提交**

```bash
git diff --cached --check
git commit -m "feat: center Atlas on innovation events"
```

提交前只 stage 本计划涉及的文件，并确认没有 `.env`、token 或临时研究输出进入提交。
