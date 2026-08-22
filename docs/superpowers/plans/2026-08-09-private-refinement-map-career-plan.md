# Private Refinement Map and Career Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the equal-weight expertise network with a five-trunk mind-map hierarchy while preserving factual capability relations, and make Career Lens priorities unmistakable in both themes.

**Architecture:** Add a small `mapGroups` catalog collection that owns only the reading hierarchy. A pure layout helper projects root, group, domain, and entity coordinates deterministically; `CapabilityMap.astro` renders strong structural paths and keeps `supports` / `complements` as a separately focused relation layer. `CareerExplorer.astro` continues to own profile projection only.

**Tech Stack:** Astro 7, TypeScript, JSON content collections, native SVG/HTML/CSS, Vitest, Playwright.

---

### Task 1: Add five map groups and validate complete Domain ownership

**Files:**
- Create: `src/data/map-groups.json`
- Modify: `src/content.config.ts`
- Modify: `src/lib/catalog/load.ts`
- Modify: `src/lib/catalog/validate.ts`
- Modify: `tests/lib/catalog-validate.test.ts`
- Modify: `tests/lib/map-geometry.test.ts`

- [ ] **Step 1: Write the failing catalog tests**

~~~ts
import mapGroups from '../../src/data/map-groups.json';

it('assigns every Domain to exactly one of five reading groups', () => {
  const ownedDomainIds = mapGroups.flatMap(({ domainIds }) => domainIds);
  expect(mapGroups).toHaveLength(5);
  expect(new Set(ownedDomainIds)).toHaveSize(domains.length);
  expect([...ownedDomainIds].sort()).toEqual(domains.map(({ id }) => id).sort());
  expect(mapGroups.map(({ order }) => order)).toEqual([1, 2, 3, 4, 5]);
});

it('rejects missing and duplicate map group ownership', () => {
  const catalog = makeValidCatalog();
  catalog.mapGroups = [
    { id: 'one', name: { 'zh-CN': '一' }, summary: { 'zh-CN': '一' }, order: 1, domainIds: [catalog.domains[0].id] },
    { id: 'two', name: { 'zh-CN': '二' }, summary: { 'zh-CN': '二' }, order: 2, domainIds: [catalog.domains[0].id] },
  ];
  expect(validateCatalog(catalog).map(({ code }) => code)).toEqual(
    expect.arrayContaining(['MAP_GROUP_DOMAIN_DUPLICATE', 'MAP_GROUP_DOMAIN_MISSING']),
  );
});
~~~

- [ ] **Step 2: Run the test and verify RED**

~~~bash
npm test -- tests/lib/catalog-validate.test.ts tests/lib/map-geometry.test.ts
~~~

Expected: FAIL because the data file, catalog field, and validation codes do not exist.

- [ ] **Step 3: Add the exact data**

Create `src/data/map-groups.json` with these ownership lists:

~~~json
[
  { "id": "experience-player", "name": { "zh-CN": "体验与玩家", "en": "Experience & Players" }, "summary": { "zh-CN": "从体验目标、玩家视角与情绪结果理解设计。", "en": "Frame design through experience goals, player perspectives, and emotional outcomes." }, "order": 1, "domainIds": ["experience-player"] },
  { "id": "play-space-expression", "name": { "zh-CN": "玩法、空间与表达", "en": "Play, Space & Expression" }, "summary": { "zh-CN": "把规则、关卡、叙事与表现组织成玩家可感知的形式。", "en": "Shape rules, levels, narrative, and presentation into perceivable forms." }, "order": 2, "domainIds": ["gameplay-systems-feel", "level-space", "narrative-expression"] },
  { "id": "research-prototype-delivery", "name": { "zh-CN": "研究、原型与交付", "en": "Research, Prototyping & Delivery" }, "summary": { "zh-CN": "通过研究、原型、取舍和迭代把意图带到可交付结果。", "en": "Move intent toward delivery through research, prototypes, tradeoffs, and iteration." }, "order": 3, "domainIds": ["research-validation-data", "prototyping-production-iteration"] },
  { "id": "collaboration-direction", "name": { "zh-CN": "协作、领导与方向", "en": "Collaboration, Leadership & Direction" }, "summary": { "zh-CN": "在多人生产中沟通、判断、促成共识并维护创意方向。", "en": "Communicate, decide, align, and steward direction in team production." }, "order": 4, "domainIds": ["collaboration-leadership-direction"] },
  { "id": "product-market-context", "name": { "zh-CN": "产品、市场与更广语境", "en": "Product, Market & Wider Context" }, "summary": { "zh-CN": "理解受众、交换价值、商业约束与游戏所处的文化语境。", "en": "Understand audiences, value exchange, commercial constraints, and cultural context." }, "order": 5, "domainIds": ["product-market-critical-context"] }
]
~~~

- [ ] **Step 4: Add schema, type, loader, and validation**

~~~ts
const mapGroups = defineCollection({
  loader: file('src/data/map-groups.json'),
  schema: z.object({
    id: z.string().trim().min(1),
    name: localizedText,
    summary: localizedText,
    order: z.number().int().positive(),
    domainIds: z.array(z.string().trim().min(1)).min(1),
  }).strict(),
});
~~~

Add `mapGroups` to `collections`, `ProductCollection`, `Catalog`, and `productCollections`. In `validateCatalog`, count Domain owners and emit `MAP_GROUP_DOMAIN_MISSING` or `MAP_GROUP_DOMAIN_DUPLICATE`. Reject unknown Domain IDs as `MAP_GROUP_DOMAIN_MISSING_REFERENCE`.

- [ ] **Step 5: Run GREEN and commit**

~~~bash
npm test -- tests/lib/catalog-validate.test.ts tests/lib/map-geometry.test.ts
npm run check
git diff --check
git add src/data/map-groups.json src/content.config.ts src/lib/catalog/load.ts src/lib/catalog/validate.ts tests/lib/catalog-validate.test.ts tests/lib/map-geometry.test.ts
git commit -m "feat: define expertise map reading groups"
~~~

Expected: all targeted tests PASS and Astro reports 0 errors, warnings, and hints.

### Task 2: Project and render the hierarchical mind map

**Files:**
- Modify: `src/lib/map-geometry.ts`
- Modify: `tests/lib/map-geometry.test.ts`
- Modify: `src/components/MapExplorer.astro`
- Modify: `src/components/CapabilityMap.astro`
- Modify: `src/components/CareerExplorer.astro`
- Modify: `src/pages/map/index.astro`
- Modify: `src/pages/careers/index.astro`
- Modify: `tests/e2e/map-v02.spec.ts`
- Modify: `src/styles/global.css`

- [ ] **Step 1: Write failing geometry tests**

~~~ts
const layout = buildCapabilityMindMapLayout(mapGroups, domains, capabilities, knowledgeTopics);
expect(layout.root.id).toBe('expertise-map-root');
expect(layout.groups).toHaveLength(5);
expect(layout.domains).toHaveLength(8);
expect(layout.nodes).toHaveLength(capabilities.length + knowledgeTopics.length);
expect(layout.structuralPaths).toHaveLength(13);
expect(new Set(layout.nodes.map(({ id }) => id))).toHaveSize(54);

for (const [index, left] of layout.nodes.entries()) {
  for (const right of layout.nodes.slice(index + 1)) {
    expect(rectanglesOverlap(left, right), left.id + ':' + right.id).toBe(false);
  }
}
~~~

Also reverse every input array and require the same entity IDs to retain the same coordinates.

- [ ] **Step 2: Run the test and verify RED**

~~~bash
npm test -- tests/lib/map-geometry.test.ts
~~~

Expected: FAIL because the layout helper and collision predicate do not exist.

- [ ] **Step 3: Implement deterministic projection**

Add these public types and metrics to `src/lib/map-geometry.ts`:

~~~ts
export type MindMapBox = { id: string; x: number; y: number; width: number; height: number };
export type CapabilityMindMapLayout = {
  width: number;
  height: number;
  root: MindMapBox;
  groups: MindMapBox[];
  domains: MindMapBox[];
  nodes: MindMapBox[];
  structuralPaths: Array<{ id: string; fromId: string; toId: string; path: string }>;
};

const mindMapMetrics = {
  width: 1180,
  rootX: 28,
  rootWidth: 132,
  groupX: 208,
  groupWidth: 176,
  domainX: 420,
  domainWidth: 170,
  nodeStartX: 650,
  nodeWidth: 152,
  nodeHeight: 48,
  nodeColumns: 3,
  columnGap: 18,
  rowGap: 14,
  domainPadding: 28,
  domainGap: 28,
  groupGap: 54,
} as const;
~~~

`buildCapabilityMindMapLayout` must sort groups/domains by `order`, sort each Domain's nodes by `position.y` / `position.x` / ID, lay nodes in three columns, derive Domain and Group vertical centers from content height, center the root, and return elbow paths for root→group and group→domain.

~~~ts
export function rectanglesOverlap(left: MindMapBox, right: MindMapBox): boolean {
  return left.x < right.x + right.width
    && left.x + left.width > right.x
    && left.y < right.y + right.height
    && left.y + left.height > right.y;
}
~~~

- [ ] **Step 4: Write browser RED**

~~~ts
await expect(canvas.locator('[data-map-root]')).toHaveCount(1);
await expect(canvas.locator('[data-map-group]')).toHaveCount(5);
await expect(canvas.locator('[data-map-region]')).toHaveCount(domains.length);
await expect(canvas.locator('[data-map-structural-path]')).toHaveCount(13);
await expect(canvas.locator('[data-capability-relation]')).toHaveCount(capabilityRelations.length);

const defaultOpacity = await canvas.locator('[data-capability-relation]').first()
  .evaluate((edge) => Number(getComputedStyle(edge).opacity));
expect(defaultOpacity).toBeLessThanOrEqual(0.18);
~~~

Keep the existing focus test, but require adjacent edges ≥0.85 opacity while unrelated edges remain ≤0.18.

- [ ] **Step 5: Render the hierarchy**

Pass `mapGroups` through both Map and Careers routes. Build the layout once in `CapabilityMap.astro`. Render one root, five group labels, eight Domain labels, 13 structural SVG paths, the unchanged 64 semantic relations, and all 54 linked nodes. Use the helper's pixel viewBox and placed node centers. Preserve every href, relation direction, title, entity kind, Career data attribute, and focus listener.

- [ ] **Step 6: Style the hierarchy**

~~~css
.capability-map__canvas { overflow: auto; }
.capability-map__scene { position: relative; min-width: 100%; isolation: isolate; }
.capability-map__structure path { fill: none; stroke: var(--ink-soft); stroke-width: 2px; }
.map-group-label { border-left: 4px solid var(--accent); background: var(--surface-strong); }
.map-domain-label { border-top: 1px solid var(--line); color: var(--ink); }
.map-relation { opacity: .12; stroke-width: 1.15px; }
.map-relation[data-adjacent='true'] { opacity: .92; stroke-width: 2.2px; }
~~~

At ≤760px, keep the relation-equivalent outline but nest Domain sections under five Map Group headings. Do not render a shrunken desktop canvas.

- [ ] **Step 7: Run GREEN and commit**

~~~bash
npm test -- tests/lib/map-geometry.test.ts
npm run build
CI=1 npx playwright test tests/e2e/map-v02.spec.ts tests/e2e/profile-progress.spec.ts --project=chromium --project=mobile-chromium
git diff --check
git add src/lib/map-geometry.ts tests/lib/map-geometry.test.ts src/components/MapExplorer.astro src/components/CapabilityMap.astro src/components/CareerExplorer.astro src/pages/map/index.astro src/pages/careers/index.astro tests/e2e/map-v02.spec.ts src/styles/global.css
git commit -m "feat: organize the expertise map around five trunks"
~~~

Expected: all tests PASS, every node remains reachable, and 1440/320 documents have no horizontal overflow.

### Task 3: Strengthen Career Lens encoding in both themes

**Files:**
- Modify: `tests/e2e/career-lenses.spec.ts`
- Modify: `src/styles/global.css`

- [ ] **Step 1: Write the dark-theme RED**

For each priority at 1440 and 320, require a ≥2px border, visible Chinese label, a node surface distinct from its surroundings, `core=solid`, `important=solid`, and `suggested=dashed`. Retain `opacity === 1` and WCAG AA text / 3:1 boundary assertions for unlisted nodes.

- [ ] **Step 2: Run and verify RED**

~~~bash
CI=1 npx playwright test tests/e2e/career-lenses.spec.ts --project=chromium --grep "priority encoding"
~~~

Expected: FAIL because important/suggested rely primarily on line style and all priority surfaces are nearly identical in Dark.

- [ ] **Step 3: Add explicit surface tokens and CSS**

~~~css
:root {
  --career-core-surface: color-mix(in srgb, var(--accent) 24%, var(--page));
  --career-important-surface: color-mix(in srgb, var(--accent) 12%, var(--surface));
  --career-suggested-surface: var(--page);
}

[data-theme='dark'],
:root:not([data-theme='light']) {
  --career-core-surface: color-mix(in srgb, var(--accent) 42%, var(--page));
  --career-important-surface: color-mix(in srgb, var(--accent) 22%, var(--surface));
  --career-suggested-surface: color-mix(in srgb, var(--surface) 88%, var(--page));
}

[data-role-priority='core'] { border: 2px solid var(--accent-strong); background: var(--career-core-surface); }
[data-role-priority='important'] { border: 2px solid var(--accent); background: var(--career-important-surface); }
[data-role-priority='suggested'] { border: 2px dashed var(--accent-strong); background: var(--career-suggested-surface); }
~~~

Apply the same state semantics to desktop nodes and mobile outline nodes. Keep responsibility as text in the summary, not a second node color.

Place the `:root:not([data-theme='light'])` override inside the existing `@media (prefers-color-scheme: dark)` block so explicit Dark and System Dark share the same tokens without forcing Dark in a light system.

- [ ] **Step 4: Run GREEN and commit**

~~~bash
npm run build
CI=1 npx playwright test tests/e2e/career-lenses.spec.ts tests/e2e/map-v02.spec.ts --project=chromium --project=mobile-chromium
git diff --check
git add tests/e2e/career-lenses.spec.ts src/styles/global.css
git commit -m "fix: make career priorities clear in dark mode"
~~~

### Task 4: Final Map/Career acceptance and journal

**Files:**
- Modify: `CHANGELOG.md`
- Modify: `docs/journal/2026-08-09-learn-about-games-v02-decision-summary.md`
- Modify: `docs/journal/2026-08-09-learn-about-games-v02-transcript.md`

- [ ] **Step 1: Capture 1440/320 Light/Dark Map and Careers plus 320 no-JS**

Inspect original images for trunk readability, collision, priority distinction, and overflow.

- [ ] **Step 2: Run the complete gate**

~~~bash
npm run check
npm test
npm run build
CI=1 npm run test:e2e
npm audit --audit-level=high
git diff --check
~~~

Expected: 0 diagnostics, all tests PASS except intentional project skips, no high-severity vulnerabilities, and clean diff check.

- [ ] **Step 3: Record verified behavior and commit**

~~~bash
git add CHANGELOG.md docs/journal/2026-08-09-learn-about-games-v02-decision-summary.md docs/journal/2026-08-09-learn-about-games-v02-transcript.md
git commit -m "docs: record the hierarchical map milestone"
~~~
