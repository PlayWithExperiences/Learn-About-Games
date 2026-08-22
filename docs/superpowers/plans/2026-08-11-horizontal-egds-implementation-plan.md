# Horizontal EGDS Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make every desktop EGDS containment relationship advance left to right, and place expanded entities to the right of their owner without changing the authored framework.

**Architecture:** `src/lib/map-geometry.ts` remains the single deterministic geometry owner. It returns explicit overview/focus layouts, typed ports and synchronized scene dimensions; `CapabilityMap.astro` renders that result and owns interaction state; scoped CSS only presents the geometry. Responsive and no-JavaScript outlines remain server-rendered vertical documents.

**Tech Stack:** Astro, TypeScript, Vitest, Playwright, native SVG/HTML, CSS.

---

## File map

- Modify `src/lib/map-geometry.ts`: overview/focus geometry, monotonic containment routing and dimensions.
- Modify `src/components/CapabilityMap.astro`: render focus visibility and synchronize both SVG viewBoxes.
- Modify `src/styles/global.css`: EGDS focus territory and right-side entity rows only.
- Modify `tests/lib/map-geometry.test.ts`: pure geometry invariants.
- Modify `tests/e2e/map-v02.spec.ts`: rendered geometry, state, responsive and no-JavaScript contracts.
- Modify milestone docs only after production is green.

### Task 1: Lock the left-to-right geometry contract

**Files:**
- Modify: `tests/lib/map-geometry.test.ts`

- [ ] **Step 1: Add a failing containment invariant test**

```ts
it('places every containment child completely right of its parent', () => {
  const layout = buildEgdsMapLayout(egdsInput());
  const boxes = new Map(layout.frameworkBoxes.map((box) => [box.key, box]));

  for (const path of layout.structuralPaths) {
    const parent = boxes.get(path.fromKey)!;
    const child = boxes.get(path.toKey)!;
    expect(child.x, path.id).toBeGreaterThanOrEqual(parent.x + parent.width + 20);
    expect(path.fromPort, path.id).toBe('east');
    expect(path.toPort, path.id).toBe('west');
  }
});
```

- [ ] **Step 2: Add a failing no-westward-segment test**

Parse `M/H/V/L` coordinates using the test file's existing path helpers and assert that every horizontal segment in `structuralPaths` has `nextX >= currentX`. Lock `processPaths` separately to east/west arrow semantics. Do not apply this rule to `relationPaths`.

- [ ] **Step 3: Add overview/focus result tests**

```ts
expect(buildEgdsMapLayout(egdsInput())).toMatchObject({ mode: 'overview', width: 1180 });

const focus = buildEgdsMapLayout(egdsInput({
  expandedFrameworkNodeId: 'gameplay-challenges-lever',
}));
expect(focus.mode).toBe('focus');
expect(focus.visibleFrameworkNodeIds).toEqual(expect.arrayContaining([
  'egds-root',
  'experience-design',
  'from-plan-to-ship',
  'with-team',
  'product-profit',
  'beyond-games',
]));
```

For every `entityBox`, assert `entityBox.x >= owner.x + owner.width + 20`.

- [ ] **Step 4: Add deterministic and adversarial cases**

Test reversed framework/entity/relation arrays, the 14-entity `gameplay-challenges-lever`, a lever owner, an empty-but-valid branch header, and a selected capability whose semantic relation points geometrically right-to-left. Require identical overview/focus outputs after input reversal and require that the semantic relation is not reversed.

- [ ] **Step 5: Run RED**

```bash
npm test -- tests/lib/map-geometry.test.ts
```

Expected: failures for mixed ports, westward lever paths, bottom expansion placement, and missing `mode`/`visibleFrameworkNodeIds`.

- [ ] **Step 6: Commit the test-only RED**

```bash
git add tests/lib/map-geometry.test.ts
git commit -m "test: require a horizontal EGDS hierarchy"
```

### Task 2: Implement deterministic overview and branch-focus layouts

**Files:**
- Modify: `src/lib/map-geometry.ts`
- Test: `tests/lib/map-geometry.test.ts`

- [ ] **Step 1: Make the layout result explicit**

```ts
export type EgdsMapLayout = Readonly<{
  mode: 'overview' | 'focus';
  width: number;
  height: number;
  expandedFrameworkNodeId?: string;
  visibleFrameworkNodeIds: string[];
  frameworkBoxes: EgdsMapBox[];
  entityBoxes: EgdsMapBox[];
  relationEndpointBoxes: EgdsMapBox[];
  branchTerritories: EgdsBranchTerritory[];
  structuralPaths: Array<EgdsMapPath & { hierarchyLevel: 'root' | 'branch' | 'child' }>;
  processPaths: EgdsMapPath[];
  relationPaths: Array<EgdsMapPath & {
    relationId: string;
    relationType: 'supports' | 'complements';
  }>;
  externalEntries: Array<Readonly<{ id: string; targetPath: 'atlas/' }>>;
}>;
```

Delete `EgdsExpansionLeaderPath` and `expansionLeaderPath` after all callers move to the focus layout.

- [ ] **Step 2: Rebuild overview anchors and ordering**

Keep root and branch columns stable, guarantee every child is right of its branch, and move the three design levers to a column strictly right of Reconstruction. Use raw code-unit ID as the final ordering tie-breaker:

```ts
const rawIdOrder = (a: { id: string }, b: { id: string }) =>
  a.id < b.id ? -1 : a.id > b.id ? 1 : 0;
```

- [ ] **Step 3: Replace structural routing**

```ts
const horizontalContainmentPath = (parent: EgdsMapBox, child: EgdsMapBox): EgdsMapPath => {
  const start = portPoint(parent, 'east');
  const end = portPoint(child, 'west');
  const elbowX = Math.max(start.x + 10, start.x + (end.x - start.x) / 2);
  return {
    id: `contains:${parent.id}:${child.id}`,
    fromKey: parent.key,
    toKey: child.key,
    fromPort: 'east',
    toPort: 'west',
    path: `M ${start.x} ${start.y} H ${elbowX} V ${end.y} H ${end.x}`,
  };
};
```

Use existing collision probes to choose a farther-east elbow when the first route intersects an unrelated box; never route west of `start.x`.

- [ ] **Step 4: Build branch-focus geometry**

Derive the selected branch ancestry from `parentNodeId`. Keep root plus all five branch headers. Keep the selected ancestry and owner visible. Place a two-column entity region to the owner's right with 12px gaps and compact 64px rows. Derive height with:

```ts
const focusHeight = Math.max(720, 96 + Math.ceil(entityBoxes.length / 2) * 76 + 24);
```

Derive territories only from visible descendants.

- [ ] **Step 5: Run GREEN and mutation probes**

```bash
npm test -- tests/lib/map-geometry.test.ts
```

Expected: all geometry tests pass, including reversed inputs, 14 entities, zero box collision and honest right-to-left semantic relations.

- [ ] **Step 6: Commit geometry**

```bash
git add src/lib/map-geometry.ts tests/lib/map-geometry.test.ts
git commit -m "feat: lay out EGDS as a horizontal hierarchy"
```

### Task 3: Render focus mode and synchronize the scene

**Files:**
- Modify: `src/components/CapabilityMap.astro`
- Modify: `tests/e2e/map-v02.spec.ts`

- [ ] **Step 1: Write browser RED**

Add desktop tests that read actual bounding boxes and structural attributes:

```ts
const paths = await map.locator('[data-structural-path]').evaluateAll((items) =>
  items.map((path) => ({
    fromPort: path.getAttribute('data-from-port'),
    toPort: path.getAttribute('data-to-port'),
  })),
);
expect(paths.every(({ fromPort, toPort }) => fromPort === 'east' && toPort === 'west')).toBe(true);
```

After expanding `gameplay-challenges-lever`, assert that every visible entity is right of its owner, five branch headers remain visible, and the canvas/SVG dimensions and viewBoxes match.

- [ ] **Step 2: Run browser RED**

```bash
npx astro build
CI=1 npx playwright test tests/e2e/map-v02.spec.ts --project=chromium
```

Expected: mixed ports, bottom entity placement and stale SVG dimensions fail.

- [ ] **Step 3: Render from `visibleFrameworkNodeIds`**

Add `data-layout-mode`, hide only non-visible deep descendants in focus mode, retain the five branch headers, and render entity boxes at their returned x/y coordinates. Do not create a second map tree.

- [ ] **Step 4: Synchronize dimensions in `renderState`**

```ts
scene.style.width = `${layout.width}px`;
scene.style.height = `${layout.height}px`;
for (const svg of [structureSvg, relationSvg]) {
  svg.setAttribute('width', String(layout.width));
  svg.setAttribute('height', String(layout.height));
  svg.setAttribute('viewBox', `0 0 ${layout.width} ${layout.height}`);
}
```

- [ ] **Step 5: Restore exact overview state**

The return action clears selected/expanded state, restores overview geometry, focuses the triggering framework control and preserves Career Lens role state.

- [ ] **Step 6: Run targeted GREEN**

```bash
npx astro build
CI=1 npx playwright test tests/e2e/map-v02.spec.ts tests/e2e/career-lenses.spec.ts tests/e2e/profile-progress.spec.ts --project=chromium --project=mobile-chromium
```

- [ ] **Step 7: Commit rendering**

```bash
git add src/components/CapabilityMap.astro tests/e2e/map-v02.spec.ts
git commit -m "feat: focus EGDS branches to the right"
```

### Task 4: Clarify the horizontal hierarchy visually

**Files:**
- Modify: `src/styles/global.css`
- Test: `tests/e2e/map-v02.spec.ts`

- [ ] **Step 1: Add visual-contract RED**

At 1440px in Light and Dark, assert distinct computed line widths for root, branch, child and process paths; grid contrast below the weakest structural line; minimum verified type/name font sizes; and zero text/box collision. Add a 1228px regression that proves no inaccessible clipped canvas.

- [ ] **Step 2: Replace bottom expansion CSS**

Remove selectors that position an expansion heading at `top: 724px` or entity rows below the map. Add scoped focus styles using returned absolute coordinates, two-line entity cards and no internal vertical scrolling. Keep branch territories neutral and avoid per-branch colors.

- [ ] **Step 3: Preserve responsive/no-JavaScript CSS**

Do not alter the complete outline hierarchy. Verify 1024px, 320px and 320px no-JavaScript expose the same 28/42/12/64 facts with no horizontal overflow.

- [ ] **Step 4: Capture and inspect screenshots**

Capture 1440 Light/Dark overview, ordinary focus, 14-entity lever focus and selected relation; plus 1024, 320 and no-JavaScript. Inspect original-size images.

- [ ] **Step 5: Run targeted and fresh gates**

```bash
npm run check
npm test -- tests/lib/map-geometry.test.ts
npm run build
CI=1 npx playwright test tests/e2e/map-v02.spec.ts tests/e2e/career-lenses.spec.ts tests/e2e/profile-progress.spec.ts tests/e2e/visible-skeleton.spec.ts --project=chromium --project=mobile-chromium
```

- [ ] **Step 6: Commit presentation**

```bash
git add src/styles/global.css tests/e2e/map-v02.spec.ts
git commit -m "fix: make EGDS hierarchy direction unambiguous"
```

### Task 5: Document and integrate the milestone

**Files:**
- Modify: `CHANGELOG.md`
- Modify: `docs/journal/2026-08-09-learn-about-games-v02-decision-summary.md`
- Modify: `docs/journal/2026-08-09-learn-about-games-v02-transcript.md`
- Create: `docs/devlog/2026-08-11-horizontal-egds.md`

- [ ] **Step 1: Record decisions and tradeoffs**

Document that x encodes containment progression, y only separates siblings, focus may omit non-selected deep descendants, and semantic relations retain true direction.

- [ ] **Step 2: Run repository-wide verification**

```bash
npm run check
npm test
npm run build
CI=1 npm run test:e2e
git diff --check
```

Expected: zero failures; only explicitly documented project-specific skips.

- [ ] **Step 3: Check privacy and local preview**

Confirm the GitHub repository remains private and Pages workflow disabled. Restart local preview at `/Learn-About-Games/` and verify `/map/` in the in-app browser.

- [ ] **Step 4: Commit docs**

```bash
git add CHANGELOG.md docs/journal docs/devlog/2026-08-11-horizontal-egds.md
git commit -m "docs: record the horizontal EGDS milestone"
```
