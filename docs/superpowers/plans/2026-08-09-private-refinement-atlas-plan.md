# Private Refinement Atlas Exploration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make Innovation Atlas fully explorable with bounded zoom/pan plus a searchable, time/name-sortable node index, without changing the 27-node/25-relation evidence graph.

**Architecture:** Add pure zoom and index helpers to `atlas-network.ts`; keep the fixed 2200×900 layout as the only graph geometry. `AtlasNetwork.astro` wraps the existing scene in a scaled stage whose scroll position is the only pan state, and adds disabled-first native controls. Search filters only node-detail rows and adds an independent `data-search-match` emphasis layer to network and outline nodes.

**Tech Stack:** Astro 7, TypeScript, Pointer Events, native scroll, CSS transforms, Vitest, Playwright.

---

### Task 1: Add bounded zoom and stable index helpers

**Files:**
- Modify: `src/lib/atlas-network.ts`
- Modify: `tests/lib/atlas-network.test.ts`

- [ ] **Step 1: Write failing unit tests**

~~~ts
it('clamps Atlas scale and preserves the viewport center', () => {
  expect(clampAtlasScale(0.1)).toBe(0.5);
  expect(clampAtlasScale(2.8)).toBe(2);
  expect(stepAtlasScale(1, 1)).toBe(1.25);
  expect(stepAtlasScale(1, -1)).toBe(0.75);
  expect(fitAtlasScale({ viewportWidth: 1100, viewportHeight: 600, sceneWidth: 2200, sceneHeight: 900 })).toBe(0.5);
  expect(projectAtlasScrollAnchor({
    oldScale: 1,
    newScale: 1.5,
    scrollLeft: 400,
    scrollTop: 100,
    viewportWidth: 1000,
    viewportHeight: 600,
  })).toEqual({ scrollLeft: 850, scrollTop: 300 });
});

it('searches bilingual text and sorts nodes stably', () => {
  const indexed = buildAtlasNodeIndex(atlasNodes, atlasTags);
  expect(filterAtlasNodeIndex(indexed, '恶魔城').map(({ id }) => id)).toContain('symphony-of-the-night');
  expect(filterAtlasNodeIndex(indexed, 'metroidvania').length).toBeGreaterThan(0);
  const years = sortAtlasNodeIndex(indexed, 'time').map(({ startYear }) => startYear);
  expect(years).toEqual([...years].sort((a, b) => a - b));
  expect(sortAtlasNodeIndex(indexed, 'name')).toEqual(sortAtlasNodeIndex([...indexed].reverse(), 'name'));
});
~~~

- [ ] **Step 2: Run and verify RED**

~~~bash
npm test -- tests/lib/atlas-network.test.ts
~~~

Expected: FAIL because the helpers do not exist.

- [ ] **Step 3: Implement pure zoom helpers**

~~~ts
export const atlasScaleBounds = { min: 0.5, max: 2, step: 0.25 } as const;

export function clampAtlasScale(value: number): number {
  return Math.min(atlasScaleBounds.max, Math.max(atlasScaleBounds.min, value));
}

export function stepAtlasScale(current: number, direction: -1 | 1): number {
  return clampAtlasScale(current + atlasScaleBounds.step * direction);
}

export function fitAtlasScale(input: {
  viewportWidth: number;
  viewportHeight: number;
  sceneWidth: number;
  sceneHeight: number;
}): number {
  return clampAtlasScale(Math.min(
    input.viewportWidth / input.sceneWidth,
    input.viewportHeight / input.sceneHeight,
  ));
}

export function projectAtlasScrollAnchor(input: {
  oldScale: number;
  newScale: number;
  scrollLeft: number;
  scrollTop: number;
  viewportWidth: number;
  viewportHeight: number;
}) {
  const centerX = (input.scrollLeft + input.viewportWidth / 2) / input.oldScale;
  const centerY = (input.scrollTop + input.viewportHeight / 2) / input.oldScale;
  return {
    scrollLeft: Math.max(0, centerX * input.newScale - input.viewportWidth / 2),
    scrollTop: Math.max(0, centerY * input.newScale - input.viewportHeight / 2),
  };
}
~~~

- [ ] **Step 4: Implement the stable node index**

`buildAtlasNodeIndex` stores ID, start year, localized display name, and a normalized search string made from Chinese/English name, Chinese/English summary, tag IDs, and localized tag names. `filterAtlasNodeIndex` performs case-insensitive substring matching. `sortAtlasNodeIndex` uses:

~~~ts
const atlasNameCollator = new Intl.Collator(['zh-CN', 'en'], {
  numeric: true,
  sensitivity: 'base',
});

const timeOrder = (left: AtlasIndexNode, right: AtlasIndexNode) =>
  left.startYear - right.startYear
  || atlasNameCollator.compare(left.name, right.name)
  || left.id.localeCompare(right.id);

const nameOrder = (left: AtlasIndexNode, right: AtlasIndexNode) =>
  atlasNameCollator.compare(left.name, right.name)
  || left.startYear - right.startYear
  || left.id.localeCompare(right.id);
~~~

- [ ] **Step 5: Run GREEN and commit**

~~~bash
npm test -- tests/lib/atlas-network.test.ts
git diff --check
git add src/lib/atlas-network.ts tests/lib/atlas-network.test.ts
git commit -m "feat: define Atlas viewport and index helpers"
~~~

### Task 2: Add zoom, fit, reset, drag, wheel, and keyboard pan

**Files:**
- Modify: `src/components/AtlasNetwork.astro`
- Modify: `src/styles/global.css`
- Modify: `tests/e2e/atlas.spec.ts`

- [ ] **Step 1: Write the disabled-first and interaction RED**

~~~ts
const controls = page.locator('[data-atlas-view-controls]');
await expect(controls.getByRole('button', { name: '适应全图' })).toBeEnabled();
await expect(controls.getByRole('button', { name: '缩小' })).toBeEnabled();
await expect(controls.getByRole('button', { name: '放大' })).toBeEnabled();
await expect(controls.getByRole('button', { name: '重置 100%' })).toBeEnabled();
await expect(controls.locator('[data-atlas-scale-status]')).toHaveText('100%');

await controls.getByRole('button', { name: '放大' }).click();
await expect(controls.locator('[data-atlas-scale-status]')).toHaveText('125%');
await expect(page.locator('[data-atlas-stage]')).toHaveAttribute('data-scale', '1.25');

await controls.getByRole('button', { name: '适应全图' }).click();
expect(Number(await page.locator('[data-atlas-stage]').getAttribute('data-scale'))).toBeGreaterThanOrEqual(.5);
await controls.getByRole('button', { name: '重置 100%' }).click();
await expect(page.locator('[data-atlas-stage]')).toHaveAttribute('data-scale', '1');
~~~

Add pointer-drag and ArrowRight tests that require `scrollLeft` to increase without changing 27 node IDs or 25 relation IDs. In a no-JS context require every control disabled and the explanation visible.

After `适应全图`, assert the transformed scene bounds fit inside the viewport within one device pixel. At 320px assert the zoom controls and desktop viewport are hidden while the complete period outline remains visible.

- [ ] **Step 2: Run and verify RED**

~~~bash
npm run build
CI=1 npx playwright test tests/e2e/atlas.spec.ts --project=chromium --grep "zoom|pan|view controls"
~~~

Expected: FAIL because the controls and stage do not exist.

- [ ] **Step 3: Add server controls and a scaled stage**

~~~astro
<div class="atlas-view-controls" data-atlas-view-controls>
  <button type="button" data-atlas-fit disabled>适应全图</button>
  <button type="button" data-atlas-zoom-out aria-label="缩小" disabled>−</button>
  <output data-atlas-scale-status aria-live="polite">100%</output>
  <button type="button" data-atlas-zoom-in aria-label="放大" disabled>＋</button>
  <button type="button" data-atlas-reset disabled>重置 100%</button>
</div>
<noscript>
  <p class="script-required-note">启用 JavaScript 后可以缩放和拖拽平移；完整网络与时期大纲仍可阅读。</p>
</noscript>

<div class="atlas-network__viewport" data-atlas-canvas tabindex="0" aria-label="可缩放和平移的全局时间网络">
  <div class="atlas-network__stage" data-atlas-stage data-scale="1">
    <div class="atlas-network__canvas" data-atlas-scene></div>
  </div>
</div>
~~~

The empty `data-atlas-scene` element in the structural snippet marks the wrapper boundary: move the current `.atlas-network__canvas` children (`.atlas-network__years`, `.atlas-network__relations`, and `.atlas-network__nodes`) into it without changing their markup. Set its inline width and height from `layout`; set the stage's initial inline width and height to the same values.

- [ ] **Step 4: Implement the controller**

Maintain a single `scale` number. `applyScale` uses `projectAtlasScrollAnchor`, updates the scene transform, stage dimensions, `data-scale`, status text, and viewport scroll. Fit uses current viewport dimensions; reset uses 100% and origin 0/0.

Pointer drag starts only outside `a, button, input, select, summary, details`. Capture the pointer and adjust scroll from the start coordinates. Arrow keys pan by 80px. `Ctrl/Meta + wheel` steps zoom and prevents default; ordinary wheel is untouched.

- [ ] **Step 5: Add CSS**

~~~css
.atlas-view-controls { display: flex; flex-wrap: wrap; align-items: center; gap: .45rem; }
.atlas-network__viewport { overflow: auto; cursor: grab; touch-action: pan-x pan-y; }
.atlas-network__viewport[data-dragging='true'] { cursor: grabbing; user-select: none; }
.atlas-network__stage { position: relative; }
.atlas-network__canvas { position: absolute; inset: 0 auto auto 0; transform-origin: 0 0; }
~~~

Keep the current mobile rule that hides the desktop viewport and shows the full outline.

Also hide `.atlas-view-controls` at ≤760px so the mobile outline never exposes controls for a hidden canvas.

- [ ] **Step 6: Run GREEN and commit**

~~~bash
npm run build
CI=1 npx playwright test tests/e2e/atlas.spec.ts tests/e2e/base-path.spec.ts --project=chromium --project=mobile-chromium
git diff --check
git add src/components/AtlasNetwork.astro src/styles/global.css tests/e2e/atlas.spec.ts
git commit -m "feat: add bounded Atlas zoom and pan"
~~~

### Task 3: Add node search and time/name sorting

**Files:**
- Modify: `src/components/AtlasNetwork.astro`
- Modify: `src/styles/global.css`
- Modify: `tests/e2e/atlas.spec.ts`

- [ ] **Step 1: Write browser RED**

~~~ts
const index = page.locator('[data-atlas-node-index]');
const search = index.getByRole('searchbox', { name: '搜索节点' });
const sort = index.getByLabel('节点排序');
await expect(search).toBeEnabled();
await expect(sort).toHaveValue('time');
await expect(index.locator('[data-atlas-index-item]')).toHaveCount(27);

await search.fill('恶魔城');
await expect(index.locator('[data-atlas-index-item]:visible')).toHaveCount(1);
await expect(page.locator('[data-atlas-node][data-search-match="true"]')).toHaveCount(1);
await expect(page.locator('[data-atlas-node]')).toHaveCount(27);
await expect(page.locator('[data-atlas-relation]')).toHaveCount(25);
~~~

Add empty-state/clear-search, name sort, mobile outline emphasis, theme+search composition, and no-JS disabled/full-index assertions.

- [ ] **Step 2: Run and verify RED**

~~~bash
CI=1 npx playwright test tests/e2e/atlas.spec.ts --project=chromium --project=mobile-chromium --grep "search|sort"
~~~

Expected: FAIL because index controls and search attributes do not exist.

- [ ] **Step 3: Render time-sorted server details and disabled-first controls**

~~~astro
<section class="atlas-node-index" data-atlas-node-index>
  <div class="atlas-node-index__controls">
    <label>搜索节点 <input type="search" data-atlas-node-search disabled /></label>
    <label>节点排序
      <select data-atlas-node-sort disabled>
        <option value="time">按时间</option>
        <option value="name">按名称</option>
      </select>
    </label>
    <output data-atlas-node-count>{nodeIndex.length} 个节点</output>
  </div>
  <p data-atlas-node-empty hidden>
    没有匹配节点。<button type="button" data-atlas-search-clear disabled>清除搜索</button>
  </p>
</section>
~~~

Each node detail gets `data-atlas-index-item`, `data-index-name`, `data-index-year`, and `data-search-text`. Keep all detail IDs unchanged.

- [ ] **Step 4: Implement search/sort without mutating the graph**

On input/change:

1. calculate matching IDs with `filterAtlasNodeIndex`;
2. set `hidden` only on node-detail index items;
3. set `data-search-match` on desktop and outline nodes;
4. reorder only node-detail elements according to `sortAtlasNodeIndex`;
5. update result count and empty state;
6. leave relations, positions, theme attributes, and Evidence rows unchanged.

Clearing search restores every row and removes `data-search-match` so the active theme remains authoritative.

- [ ] **Step 5: Style controls and composed emphasis**

~~~css
.atlas-node-index__controls {
  display: grid;
  grid-template-columns: minmax(14rem, 1fr) 12rem auto;
  gap: .75rem;
}
[data-atlas-node][data-search-match='false'] a,
[data-atlas-outline-node][data-search-match='false'] > header { opacity: .42; }
[data-atlas-node][data-search-match='true'] a { box-shadow: 0 0 0 3px var(--accent); }
~~~

Use an outline/weight change in addition to color. Stack controls at 320px and keep all outline nodes reachable.

- [ ] **Step 6: Run GREEN and commit**

~~~bash
npm run build
CI=1 npx playwright test tests/e2e/atlas.spec.ts tests/e2e/theme.spec.ts tests/e2e/base-path.spec.ts --project=chromium --project=mobile-chromium
git diff --check
git add src/components/AtlasNetwork.astro src/styles/global.css tests/e2e/atlas.spec.ts
git commit -m "feat: search and sort Atlas nodes"
~~~

Expected: graph counts remain 27/25 and Evidence remains 40 before and after every interaction.

### Task 4: Final Atlas acceptance and journal

**Files:**
- Modify: `CHANGELOG.md`
- Modify: `docs/journal/2026-08-09-learn-about-games-v02-decision-summary.md`
- Modify: `docs/journal/2026-08-09-learn-about-games-v02-transcript.md`

- [ ] **Step 1: Capture the visual matrix**

Capture 1440 Light/Dark at fit, 100%, 150%, panned right, search result, name sort, node dialog, and relation dialog; capture 320 Light/Dark outline, search, sort, and no-JS. Inspect every original image.

- [ ] **Step 2: Run complete verification**

~~~bash
npm run check
npm test
npm run build
CI=1 npm run test:e2e
npm audit --audit-level=high
git diff --check
~~~

Expected: 0 diagnostics, all 27 nodes/25 relations/40 Evidence preserved, full E2E PASS except intentional project skips, and no high-severity vulnerabilities.

- [ ] **Step 3: Record exact evidence and commit**

~~~bash
git add CHANGELOG.md docs/journal/2026-08-09-learn-about-games-v02-decision-summary.md docs/journal/2026-08-09-learn-about-games-v02-transcript.md
git commit -m "docs: record the explorable Atlas milestone"
~~~
