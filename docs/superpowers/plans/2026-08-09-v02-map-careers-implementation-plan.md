# Learn About Games v0.2 Map and Career Lenses Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the bento-like map with a semantic territory map and make three career lenses visibly useful without scoring users.

**Architecture:** The server renders one accessible catalog into two equivalent presentations: a wide desktop map with stable coordinates and a mobile domain outline. Career lenses remain data overlays on the same capability IDs. A small client controller changes emphasis and summary content; it never changes the graph membership or personal progress state.

**Tech Stack:** Astro components, static JSON collections, TypeScript, native CSS, an SVG relation layer for functional data visualization, Vitest and Playwright.

---

## File map

- Create `src/components/CapabilityMap.astro`: desktop map and mobile outline.
- Create `src/components/CareerExplorer.astro`: profile selection and actionable summary.
- Create `src/lib/career-lens.ts`: pure lens projection helper.
- Create `src/lib/map-geometry.ts`: global coordinate projection and edge endpoints.
- Modify `src/data/domains.json`, `src/data/capabilities.json`, `src/data/knowledge-topics.json`, `src/data/capability-relations.json`: approximately 44-54 nodes and explicit global layout coordinates.
- Modify `src/data/role-profiles.json`: three sourced profiles.
- Modify `src/components/MapExplorer.astro`: compose map and optional lens, remove bento grid.
- Modify `src/pages/map/index.astro`, `src/pages/careers/index.astro`, `src/pages/capabilities/[id].astro`.
- Create `src/pages/topics/[id].astro`.
- Modify `src/styles/global.css`.
- Test `tests/lib/map-geometry.test.ts`, `tests/lib/career-lens.test.ts`, `tests/e2e/map-v02.spec.ts`, `tests/e2e/profile-progress.spec.ts`, `tests/e2e/base-path.spec.ts`.

### Task 1: Expand the map content and lock semantic relations

- [ ] **Step 1: Write failing catalog assertions**

Add tests that load the actual data and assert:

```ts
expect(domains).toHaveLength(8);
expect(capabilities.length).toBeGreaterThanOrEqual(36);
expect(capabilities.length).toBeLessThanOrEqual(42);
expect(knowledgeTopics.length).toBeGreaterThanOrEqual(8);
expect(knowledgeTopics.length).toBeLessThanOrEqual(12);
expect(capabilityRelations.length).toBeGreaterThanOrEqual(50);
expect(capabilityRelations.every((relation) =>
  relation.type === 'supports' || relation.type === 'complements'
)).toBe(true);
```

Use one global normalized `0..100` coordinate system. Assert every Domain has bounded global `bounds: { x, y, width, height }`, every Capability and Knowledge Topic has a global anchor inside its Domain bounds, and every relation has non-empty localized rationale. Relation endpoints resolve against Capability only.

Create `tests/lib/map-geometry.test.ts` before the helper exists. For every catalog edge, assert the projected start/end exactly equal the anchors of its Capability endpoints; for every node, assert containment inside the declared Domain bounds. These geometry invariants prevent a DOM-only fake map from passing.

- [ ] **Step 2: Run and verify RED**

Run:

```bash
npm test -- tests/lib/catalog-validate.test.ts tests/lib/map-geometry.test.ts
```

Expected: M0 has nine domains, nine capabilities, no knowledge topics and no capability relations.

- [ ] **Step 3: Populate the approved first map**

Use these eight domains as the stable first-level regions:

1. 体验与玩家
2. 玩法、系统与手感
3. 关卡与空间
4. 叙事与表达
5. 研究、验证与数据
6. 原型、生产与迭代
7. 协作、领导与方向
8. 产品、市场与批判语境

Populate 36-42 capabilities across the regions and 8-12 separate knowledge topics. Preserve Playtest and the original expertise-map ideas such as experience deconstruction, core loop, pacing, production, task breakdown, iteration, leadership, alignment and product context. Remove Innovation as a capability domain because it belongs to Atlas.

Assign every Domain global normalized bounds and every node a global `position: { x, y }` inside that region. Do not store local coordinates that are later interpreted as global. Add 50-80 `supports` or `complements` relations with a plain-language explanation. Do not add a relation only to make the drawing dense.

- [ ] **Step 4: Verify data GREEN**

Run:

```bash
npm run check
npm test -- tests/lib/catalog-validate.test.ts tests/lib/map-geometry.test.ts
```

Expected: zero diagnostics and all map-content assertions pass.

- [ ] **Step 5: Commit the map content**

```bash
git add src/data src/content.config.ts src/lib/catalog tests/lib/catalog-validate.test.ts
git commit -m "content: expand the game design expertise map"
```

### Task 2: Render a real semantic map

- [ ] **Step 1: Write the failing map E2E**

Create `tests/e2e/map-v02.spec.ts` with assertions like:

```ts
test('renders territories, distinct node kinds and meaningful relations', async ({ page }) => {
  await page.goto('./map/');
  await expect(page.locator('[data-map-region]')).toHaveCount(8);
  expect(await page.locator('[data-map-node-kind="capability"]').count()).toBeGreaterThanOrEqual(36);
  expect(await page.locator('[data-map-node-kind="knowledge-topic"]').count()).toBeGreaterThanOrEqual(8);
  expect(await page.locator('[data-capability-relation]').count()).toBeGreaterThanOrEqual(50);
  await expect(page.locator('[data-relation-type="supports"]').first()).toHaveAttribute('data-direction', 'forward');
  await expect(page.locator('[data-relation-type="complements"]').first()).toHaveAttribute('data-direction', 'mutual');
  await expect(page.getByRole('link', { name: 'Playtest', exact: true })).toHaveAttribute(
    'href',
    '/Learn-About-Games/capabilities/playtesting/',
  );
});
```

Add a 320px test that expects the desktop canvas hidden, the relationship-equivalent outline visible, and no horizontal overflow.

The compact-width test must call `page.setViewportSize({ width: 320, height: 900 })`; the configured Pixel 7 project is wider and is not evidence for 320px.

- [ ] **Step 2: Run and verify RED**

Run separately:

```bash
npm run build
npx playwright test tests/e2e/map-v02.spec.ts --project=chromium --project=mobile-chromium
```

Expected: the old page exposes bento cards and no regions/relations/topic nodes.

- [ ] **Step 3: Implement `CapabilityMap.astro`**

Render:

- an accessible legend;
- one server-rendered desktop canvas;
- named region containers placed by global Domain bounds;
- linked capability and knowledge-topic nodes;
- one functional SVG relation layer whose paths are computed by `map-geometry.ts` from the same global node anchors;
- one mobile outline grouped by Domain with the same relation labels.

Use explicit data attributes for node kind, relation type and direction. SVG paths are functional visualization, not decorative artwork. Every relation also appears as readable text in the mobile outline and in node details.

- [ ] **Step 4: Replace the old bento grid and verify GREEN**

Run: `npm run build && npx playwright test tests/e2e/map-v02.spec.ts tests/e2e/base-path.spec.ts --project=chromium --project=mobile-chromium`

Expected: all assertions and geometry tests pass; 1440px shows a connected territory map whose paths terminate at their referenced nodes, and an explicitly set 320px viewport shows an outline without scaling the map.

- [ ] **Step 5: Commit the visualization**

```bash
git add src/components/CapabilityMap.astro src/components/MapExplorer.astro src/pages/map src/styles/global.css tests/e2e
git commit -m "feat: render the expertise map as connected territories"
```

### Task 3: Make every node useful

- [ ] **Step 1: Write failing route tests**

Add E2E coverage that opens one capability and one knowledge topic and verifies definition, region breadcrumb, related nodes and related resources. Extend the base-path route sampler to request every generated capability/topic URL and expect 200.

- [ ] **Step 2: Run and verify RED**

Run separately:

```bash
npm run build
npx playwright test tests/e2e/map-v02.spec.ts tests/e2e/base-path.spec.ts --project=chromium
```

Expected: only Playtest currently generates a capability page and no knowledge-topic route exists.

- [ ] **Step 3: Generalize static routes**

Change `src/pages/capabilities/[id].astro` so `getStaticPaths()` returns every capability. Remove Learning Trail sections and render direct related resources plus `supports`/`complements` relations. Create `src/pages/topics/[id].astro` with the same breadcrumb and resource behavior, but no personal capability state.

Keep `CapabilityProgress` available for every capability through its existing versioned localStorage contract. Do not aggregate progress across capabilities.

- [ ] **Step 4: Verify GREEN**

Run: `npm run build && npx playwright test tests/e2e/map-v02.spec.ts tests/e2e/profile-progress.spec.ts tests/e2e/base-path.spec.ts --project=chromium --project=mobile-chromium`

Expected: all node routes return 200 and progress remains local and unscored.

- [ ] **Step 5: Commit node details**

```bash
git add src/pages/capabilities src/pages/topics src/components/CapabilityProgress.astro tests/e2e
git commit -m "feat: make every map node directly explorable"
```

### Task 4: Add three evidence-bounded career lenses

- [ ] **Step 1: Write the pure projection RED test**

Create `tests/lib/career-lens.test.ts`:

```ts
it('projects a role profile without scoring or removing map nodes', () => {
  const result = projectCareerLens(allCapabilities, aaaDesignerProfile);
  expect(result.nodes).toHaveLength(allCapabilities.length);
  expect(result.groups.core.length).toBeGreaterThan(0);
  expect(result.groups.important.length).toBeGreaterThan(0);
  expect(result.groups.suggested.length).toBeGreaterThan(0);
  expect(JSON.stringify(result)).not.toMatch(/score|percentage|fit|completion/i);
  expect(Object.keys(result).sort()).toEqual(['groups', 'nodes', 'profile'].sort());
});
```

Also test that the pure result contains only the whitelisted projection fields, Chinese and English score-like terms (`评分|分数|匹配度|完成率|score|percentage|fit|completion`) never appear in the projection, and changing personal progress cannot change lens groups. Write E2E assertions for exactly three profiles, the exact middle-dot titles, visible changes to map node attributes, a grouped clickable summary, public basis links/reviewed date, and unchanged map node count.

- [ ] **Step 2: Run and verify RED**

Run separately so unit, build and browser RED evidence remain distinguishable:

```bash
npm test -- tests/lib/career-lens.test.ts
npm run build
npx playwright test tests/e2e/profile-progress.spec.ts --project=chromium
```

Expected: the helper is missing, only one profile exists, and the current lens only reveals small footer labels.

- [ ] **Step 3: Add profile evidence and projection**

Populate `role-profiles.json` with `AAA · Game Designer`, `AAA · Creative Director`, and `Indie · Solo Developer`. Each record must include non-empty `basisLinks`, context, caveats, ISO `reviewedAt`, and bounded capability entries. Priority is restricted to `core | important | suggested`; responsibility is restricted to `execute | contribute | decide | direct`. If evidence does not support a claimed priority, omit it.

Implement `projectCareerLens()` as a pure function that returns all nodes plus grouped role metadata. It must not read or write personal progress.

- [ ] **Step 4: Implement `CareerExplorer.astro`**

Render the three lenses as explicit choices, not a one-option select. `CareerExplorer.astro` must compose the same `CapabilityMap.astro` and catalog used by `/map/`; it must not maintain a second role-specific tree. Applying a lens updates `data-role-priority` and `data-role-responsibility` on mapped nodes, dims but does not hide unlisted nodes, and fills a three-group summary with capability links and factual resource counts. A clear action restores the full map.

Use border pattern plus text for Core, Important and Suggested. Do not use a filled progress track, radar chart, percentage, match score or suggested learning order.

- [ ] **Step 5: Verify separation and GREEN**

Run: `npm test -- tests/lib/career-lens.test.ts && npm run build && npx playwright test tests/e2e/profile-progress.spec.ts tests/e2e/map-v02.spec.ts --project=chromium --project=mobile-chromium`

Expected: all three lenses change emphasis and summary; node count remains constant; personal progress persists independently; no score-like copy exists.

- [ ] **Step 6: Commit career lenses**

```bash
git add src/data/role-profiles.json src/lib/career-lens.ts src/components/CareerExplorer.astro src/pages/careers src/styles/global.css tests
git commit -m "feat: add three contextual career lenses"
```

### Task 5: Map and career quality gate

- [ ] **Step 1: Run fresh full verification**

Run:

```bash
npm run check
npm test
npm run build
CI=1 npm run test:e2e
git diff --check
```

- [ ] **Step 2: Inspect visual states**

Capture 1440px and explicit 320px screenshots of the full map, one capability detail, one knowledge-topic detail, Careers with no lens, each of the three applied lenses, and one capability with personal progress. Inspect Light and Dark. Confirm visual encoding matches `DESIGN.md`, relation lines visibly meet their nodes, lens emphasis is unmistakable without color alone, and no bento grid remains.

- [ ] **Step 3: Update continuity and commit**

Record exact node/relation/profile counts, verification output, screenshots inspected, adversarial findings and remaining content gaps in the decision summary and partial transcript. Update Roadmap and Unreleased Changelog truthfully, then commit.

```bash
git add docs ROADMAP.md CHANGELOG.md
git commit -m "docs: record the v0.2 map and career milestone"
```
