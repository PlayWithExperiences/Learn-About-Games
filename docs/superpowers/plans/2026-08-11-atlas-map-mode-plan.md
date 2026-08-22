# Innovation Atlas Map Mode Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make desktop Atlas zoom and pan feel continuous while preserving normal page scrolling outside an explicit map mode.

**Architecture:** Viewport scroll remains the only pan state. Pure helpers convert wheel delta and pointer coordinates into bounded scale and scroll targets. The DOM controller batches wheel and drag writes with `requestAnimationFrame` and owns an explicit map-mode lifecycle.

**Tech Stack:** Astro 7, TypeScript, DOM Pointer/Wheel APIs, CSS transforms, Vitest, Playwright.

---

### Task 1: Define continuous pointer-anchored viewport math

**Files:**
- Modify: `src/lib/atlas-network.ts`
- Modify: `tests/lib/atlas-network.test.ts`

- [ ] **Step 1: Write failing pure tests**

Define wished-for helpers:

```ts
const scale = scaleAtlasWheelTarget({ currentScale: 1, deltaY: -120 });
expect(scale).toBeGreaterThan(1);
expect(scale).toBeLessThanOrEqual(2);

const next = projectAtlasPointerAnchor({
  oldScale: 1,
  newScale: 1.2,
  scrollLeft: 300,
  scrollTop: 120,
  pointerX: 420,
  pointerY: 240,
});
expect(logicalPoint(next, 1.2, 420, 240)).toEqual(logicalPointBefore);
```

Cover positive/negative delta, 50%-200% bounds, pointer invariance, zero delta, and deterministic output.

- [ ] **Step 2: Verify RED**

```bash
npm test -- tests/lib/atlas-network.test.ts
```

Expected: the new helper exports do not exist.

- [ ] **Step 3: Implement minimal pure helpers**

Use a continuous exponential or proportional mapping with a bounded result. Do not encode DOM state or animation timing in the helper.

- [ ] **Step 4: Verify GREEN and commit**

```bash
npm test -- tests/lib/atlas-network.test.ts
git add src/lib/atlas-network.ts tests/lib/atlas-network.test.ts
git commit -m "feat: define continuous Atlas viewport math"
```

### Task 2: Add explicit map mode and frame-batched input

**Files:**
- Modify: `src/components/AtlasNetwork.astro`
- Modify: `tests/e2e/atlas.spec.ts`

- [ ] **Step 1: Write map-mode browser RED tests**

Cover this lifecycle:

```ts
await expect(mapModeButton).toHaveAttribute('aria-pressed', 'false');
await wheelOverCanvas(240);
expect(await pageScrollY()).toBeGreaterThan(beforePageY);

await mapModeButton.click();
await expect(mapModeButton).toHaveAttribute('aria-pressed', 'true');
await wheelAtNode(-120);
expect(await scale()).toBeGreaterThan(1);
expect(await logicalPointUnderPointer()).toEqual(beforeLogicalPoint);
await page.keyboard.press('Escape');
await expect(mapModeButton).toHaveAttribute('aria-pressed', 'false');
```

Also cover burst events producing one frame commit, drag on blank canvas, no drag from links/buttons/details, limit behavior, button zoom, fit, reset, dialog return, and no-JavaScript disabled controls.

- [ ] **Step 2: Verify RED after fresh build**

```bash
npm run build
CI=1 npx playwright test tests/e2e/atlas.spec.ts --project=chromium
```

- [ ] **Step 3: Implement the state lifecycle**

Add one `mapMode` boolean and one button with `aria-pressed`. Outside map mode, wheel returns without preventing default. Inside map mode, wheel prevents default, computes target scale from the pure helper, and schedules one frame commit.

The scheduled commit updates scene transform, stage size, pointer-anchored scroll, scale output, and button bounds exactly once. Drag deltas use the same frame queue.

- [ ] **Step 4: Exit safely**

Exit on `Esc`, explicit button, breakpoint where the canvas becomes hidden, and teardown/page lifecycle as appropriate. At a scale boundary, continued outward wheel input must allow page escape or provide an explicit exit without trapping focus.

- [ ] **Step 5: Honor reduced motion**

Reduced motion uses immediate target values while retaining frame coalescing and pointer anchoring. No inertial animation is required.

- [ ] **Step 6: Verify GREEN and commit**

```bash
npm run build
CI=1 npx playwright test tests/e2e/atlas.spec.ts tests/e2e/theme.spec.ts tests/e2e/base-path.spec.ts --project=chromium --project=mobile-chromium
git add src/components/AtlasNetwork.astro tests/e2e/atlas.spec.ts
git commit -m "feat: add an explicit Atlas map mode"
```

### Task 3: Clarify map-mode presentation

**Files:**
- Modify: `src/styles/global.css`
- Modify: `tests/e2e/atlas.spec.ts`

- [ ] **Step 1: Write presentation RED assertions**

Assert visible map-mode state, grab/grabbing cursor only in the active mode, hidden controls at responsive outline widths, AA text contrast, visible focus, and no page overflow.

- [ ] **Step 2: Implement CSS with existing tokens**

Use border, surface, label, and cursor changes for state. Do not add glows, decorative animation, or a second accent. Keep current node shapes and relation encodings.

- [ ] **Step 3: Visual and performance probe**

Capture default, active, zoomed, panned, fit, dialog, Dark, Light, reduced-motion, no-JavaScript, and responsive outline states. Exercise a real burst of wheel events and record long tasks or frame gaps if available; do not claim a performance improvement only from final state tests.

- [ ] **Step 4: Commit**

```bash
git add src/styles/global.css tests/e2e/atlas.spec.ts
git commit -m "fix: make Atlas input ownership visible"
```
