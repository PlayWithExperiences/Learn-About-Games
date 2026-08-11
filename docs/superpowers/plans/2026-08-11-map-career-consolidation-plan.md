# Map and Career Consolidation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Render one EGDS Expertise Map and make the three Career Lenses compact, optional states of that map.

**Architecture:** `CapabilityMap` remains the single state owner. A focused Career control component renders profile summaries and dispatches the existing public map events. The map route composes both; the old career route becomes a compatibility entry.

**Tech Stack:** Astro 7, TypeScript, native HTML disclosures, CSS variables, Vitest, Playwright.

---

### Task 1: Lock the merged route contract

**Files:**
- Modify: `tests/e2e/career-lenses.spec.ts`
- Modify: `tests/e2e/visible-skeleton.spec.ts`
- Modify: `tests/e2e/base-path.spec.ts`

- [ ] **Step 1: Write failing browser tests**

Add assertions equivalent to:

```ts
await page.goto(siteUrl('map/#career-lenses'));
await expect(page.locator('[data-egds-map]')).toHaveCount(1);
await expect(page.locator('[data-career-lens-control]')).toHaveCount(1);
await expect(page.locator('[data-career-lens-button]')).toHaveCount(3);

await page.goto(siteUrl('careers/'));
await page.waitForURL(/\/map\/#career-lenses$/);
```

Also assert that the shared primary navigation contains four items and no standalone Career item.

- [ ] **Step 2: Run the tests and verify RED**

```bash
npm run build
CI=1 npx playwright test tests/e2e/career-lenses.spec.ts tests/e2e/visible-skeleton.spec.ts tests/e2e/base-path.spec.ts --project=chromium
```

Expected: failures because the map lacks Career controls, the career route still owns a full explorer, and the navigation still contains the old item.

### Task 2: Extract the Career control and compose it on the map

**Files:**
- Create: `src/components/CareerLensControl.astro`
- Modify: `src/components/CareerExplorer.astro`
- Modify: `src/pages/map/index.astro`
- Modify: `src/pages/careers/index.astro`
- Modify: `src/layouts/BaseLayout.astro`

- [ ] **Step 1: Move control and summary ownership**

Create a component with this interface:

```ts
interface Props {
  roleProfiles: Catalog['roleProfiles'];
  capabilities: Catalog['capabilities'];
  resources: Catalog['resources'];
  mapTargetId: string;
}
```

It renders the profile controls, clear action, status, native profile disclosures, evidence, Capability links, Resource links, and serialized projection payload. It dispatches only the existing public map events.

- [ ] **Step 2: Compose one map**

`src/pages/map/index.astro` loads `roleProfiles` and `resources`, renders `CareerLensControl` at `id="career-lenses"`, then renders one `MapExplorer`. `CareerExplorer.astro` must not render a second `CapabilityMap`.

- [ ] **Step 3: Preserve no-JavaScript truthfulness**

Server HTML keeps all profile summaries and basis links readable. Apply, focus, and clear controls remain disabled until binding. A local `noscript` sentence explains that profile emphasis requires JavaScript.

- [ ] **Step 4: Implement compatibility navigation**

The career route emits a static redirect to `sitePath('map/#career-lenses')` with a visible fallback link. The primary navigation removes Career without changing the other labels.

- [ ] **Step 5: Run targeted GREEN**

Run the Task 1 command. Expected: all assertions pass in Chromium before expanding to mobile.

- [ ] **Step 6: Commit**

```bash
git add src/components/CareerLensControl.astro src/components/CareerExplorer.astro src/pages/map/index.astro src/pages/careers/index.astro src/layouts/BaseLayout.astro tests/e2e/career-lenses.spec.ts tests/e2e/visible-skeleton.spec.ts tests/e2e/base-path.spec.ts
git commit -m "feat: merge career lenses into the expertise map"
```

### Task 3: Rebalance map geometry and focus movement

**Files:**
- Modify: `tests/lib/map-geometry.test.ts`
- Modify: `tests/e2e/map-v02.spec.ts`
- Modify: `src/lib/map-geometry.ts`
- Modify: `src/components/CapabilityMap.astro`
- Modify: `src/styles/global.css`

- [ ] **Step 1: Add geometry and runtime RED tests**

Lock these behaviors:

```ts
expect(layout.boxes.every(boxInsideScene)).toBe(true);
expect(maxPrimaryBranchWhitespace(layout)).toBeLessThanOrEqual(acceptedMargin);
expect(unrelatedBranchXAfterExpansion).toEqual(unrelatedBranchXBeforeExpansion);
```

Browser tests assert no inner vertical scroll ownership, no node overlap, and a Career focus action that does not expand a long summary above the map before scrolling.

- [ ] **Step 2: Verify RED**

```bash
npm test -- tests/lib/map-geometry.test.ts
npm run build
CI=1 npx playwright test tests/e2e/map-v02.spec.ts tests/e2e/career-lenses.spec.ts --project=chromium
```

- [ ] **Step 3: Apply the smallest deterministic layout adjustment**

Adjust fixed root/branch anchors and scene margins without changing the EGDS hierarchy or relationship semantics. Expansion height remains local and coordinates remain stable under reversed input order. Move selected-profile detail below or beside the control bar so applying a profile does not push the canvas downward.

- [ ] **Step 4: Verify both presentations**

```bash
npm test -- tests/lib/map-geometry.test.ts
npm run build
CI=1 npx playwright test tests/e2e/map-v02.spec.ts tests/e2e/career-lenses.spec.ts tests/e2e/profile-progress.spec.ts --project=chromium --project=mobile-chromium
```

- [ ] **Step 5: Visual and accessibility review**

Capture default, each Career Lens, focus, clear, and no-JavaScript states at 1440px, 1024px, and 320px in Light and Dark. Check overlap, overflow, focus, contrast, and disclosure text.

- [ ] **Step 6: Commit**

```bash
git add tests/lib/map-geometry.test.ts tests/e2e/map-v02.spec.ts src/lib/map-geometry.ts src/components/CapabilityMap.astro src/styles/global.css
git commit -m "fix: rebalance the EGDS map viewport"
```
