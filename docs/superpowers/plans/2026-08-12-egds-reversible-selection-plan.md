# EGDS Reversible Selection Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Keep the EGDS framework geometry stable while separating node selection, leaf expansion and relationship inspection.

**Architecture:** The overview layout becomes the only desktop framework layout. `expandedFrameworkNodeId` controls a right-side content inspector rather than recomputing framework coordinates. `selectedEntityKey` controls relationship highlighting. Every selection has direct toggle, blank-canvas, Escape and close-button dismissal paths.

**Tech Stack:** Astro, TypeScript, deterministic geometry helper, CSS, Playwright, Vitest.

---

### Task 1: Lock stable geometry and reversible dismissal

**Files:**
- Modify: `tests/lib/map-geometry.test.ts`
- Modify: `tests/e2e/map-v02.spec.ts`

- [ ] **Step 1: Write the pure geometry RED**

Assert that passing an expanded Framework Node does not change any Framework box or structural path from overview.

```ts
expect(focused.frameworkBoxes).toEqual(overview.frameworkBoxes);
expect(focused.structuralPaths).toEqual(overview.structuralPaths);
```

- [ ] **Step 2: Write browser RED for four dismissal paths**

Record all 28 Framework node rectangles, expand Playtest, and assert rectangles remain identical. Then verify current selection clears through repeated activation, blank canvas click, Escape and the inspector close button without requiring `返回全图`.

- [ ] **Step 3: Run RED**

Run: `npm test -- tests/lib/map-geometry.test.ts`

Run: `CI=1 npx playwright test tests/e2e/map-v02.spec.ts --project=chromium --grep "stable geometry|dismisses selection"`

Expected: pure test fails because focus layout moves/hides boxes; browser test fails because only `返回全图` clears state.

### Task 2: Retire focus re-layout and render a side inspector

**Files:**
- Modify: `src/lib/map-geometry.ts`
- Modify: `src/components/CapabilityMap.astro`
- Modify: `src/styles/global.css`

- [ ] **Step 1: Make expanded layout reuse overview framework geometry**

Keep `frameworkBoxes`, `structuralPaths`, `processPaths` and `branchTerritories` identical to overview. Derive only entity rows, relation endpoints and relation paths from the expanded leaf.

- [ ] **Step 2: Replace the return control with an inspector close control**

Use `data-map-inspector-close` with accessible name `关闭当前选择`. Keep the toolbar status but remove the mandatory `返回全图` action.

- [ ] **Step 3: Add one clear-selection function**

```ts
const clearSelection = ({ keepExpansion = true, restoreFocus = true } = {}) => {
  const previousKey = state.selectedEntityKey;
  delete state.selectedEntityKey;
  if (!keepExpansion) delete state.expandedFrameworkNodeId;
  render();
  if (restoreFocus && previousKey) focusEntityControl(previousKey);
};
```

Use it from repeat-click, blank canvas, Escape and close button. Framework expand buttons toggle their own leaf; opening another leaf replaces the previous one.

- [ ] **Step 4: Keep the overview visible and place entities in a side inspector**

Style the expanded content as a right-side panel inside the map shell at desktop. It may scroll vertically when necessary but must not resize or hide the framework scene. At responsive breakpoints keep the existing native outline.

- [ ] **Step 5: Run targeted GREEN**

Run: `npm test -- tests/lib/map-geometry.test.ts`

Run: `CI=1 npx playwright test tests/e2e/map-v02.spec.ts tests/e2e/career-lenses.spec.ts tests/e2e/profile-progress.spec.ts --project=chromium --project=mobile-chromium`

Expected: all selected tests pass.

### Task 3: Preserve Career and no-JS contracts

**Files:**
- Modify: `tests/e2e/map-v02.spec.ts`
- Modify: `tests/e2e/career-lenses.spec.ts`

- [ ] **Step 1: Add state-independence assertions**

Apply a Career Lens, expand a leaf, select a capability, clear selection and close the leaf. Assert Career attributes persist while expansion/selection attributes clear independently.

- [ ] **Step 2: Add responsive and no-JS assertions**

At 1024px and 320px verify native disclosure behavior, Escape dismissal of enhanced selection, all 42 Capability and 12 Knowledge Topic detail links, and no page overflow. With JavaScript disabled verify native multi-open remains possible and no inspector close control is active.

- [ ] **Step 3: Run final gates**

Run: `npm run check`

Run: `npm run build`

Run: `CI=1 npx playwright test tests/e2e/map-v02.spec.ts tests/e2e/career-lenses.spec.ts tests/e2e/profile-progress.spec.ts tests/e2e/visible-skeleton.spec.ts --project=chromium --project=mobile-chromium`

- [ ] **Step 4: Capture and inspect screenshots**

Capture 1440px Light/Dark overview, Playtest expanded and capability selected; 1024px and 320px enhanced; 320px no-JS. Confirm the 28 Framework node rectangles stay fixed, the side panel is readable, and the hierarchy remains left to right.

- [ ] **Step 5: Commit**

```bash
git add src/lib/map-geometry.ts src/components/CapabilityMap.astro src/styles/global.css tests/lib/map-geometry.test.ts tests/e2e/map-v02.spec.ts tests/e2e/career-lenses.spec.ts
git commit -m "fix: separate EGDS selection from layout"
```

