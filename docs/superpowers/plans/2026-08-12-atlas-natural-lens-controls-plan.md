# Atlas Natural Lens Controls Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the overlaying Genre Family control with an honest inline directory on the page and a compact direct Evidence Lens toolbar in fullscreen map mode.

**Architecture:** `AtlasNetwork.astro` continues to server-render one catalog-derived network and one Family directory. Evidence Lens buttons may appear in multiple Family rows but share the same `data-atlas-theme-button` value and one controller state. CSS switches fullscreen to a lens-only toolbar without changing graph geometry.

**Tech Stack:** Astro, TypeScript, native disclosure/button semantics, CSS, Playwright.

---

### Task 1: Lock the broken cross-Family and fullscreen contracts

**Files:**
- Modify: `tests/e2e/atlas.spec.ts`

- [ ] **Step 1: Write the failing tests**

Add browser assertions that the Role-playing disclosure contains an enabled Roguelike button, clicking it sets every Roguelike control to `aria-pressed=true`, fullscreen contains a compact lens strip but no Family disclosures, and opening a normal-page Family keeps its body in document flow.

```ts
await page.locator('[data-atlas-family="role-playing"] summary').click();
const rolePlayingRoguelike = page.locator('[data-atlas-family="role-playing"] [data-atlas-theme-button="roguelike"]');
await expect(rolePlayingRoguelike).toBeEnabled();
await rolePlayingRoguelike.click();
await expect(page.locator('[data-atlas-theme-button="roguelike"][aria-pressed="true"]')).toHaveCount(2);

await page.locator('[data-atlas-map-mode]').click();
await expect(page.locator('[data-atlas-global-network][data-map-mode="true"] [data-atlas-fullscreen-lenses]')).toBeVisible();
await expect(page.locator('[data-atlas-global-network][data-map-mode="true"] [data-atlas-family]')).toHaveCount(0);
```

- [ ] **Step 2: Run the tests to verify RED**

Run: `CI=1 npx playwright test tests/e2e/atlas.spec.ts --project=chromium --grep "cross-Family|fullscreen lens strip"`

Expected: FAIL because Role-playing contains an anchor reference and fullscreen still contains Family disclosures.

### Task 2: Render direct lens controls and synchronize duplicates

**Files:**
- Modify: `src/components/AtlasNetwork.astro`
- Modify: `src/styles/global.css`

- [ ] **Step 1: Replace reference links with lens buttons**

Render every Family-associated theme through the same button markup and remove `primaryFamilyByTheme` references. Do not assign duplicate DOM IDs.

```astro
<button
  type="button"
  data-atlas-theme-button={theme.id}
  aria-pressed="false"
  disabled
>
  {theme.title['zh-CN']}
</button>
```

- [ ] **Step 2: Add one fullscreen-only direct lens strip**

Render a catalog-derived strip inside the global network with `data-atlas-fullscreen-lenses`; include `all` and every theme exactly once. Keep it hidden outside map mode and hide the Family directory inside map mode.

- [ ] **Step 3: Make active-button lookup duplicate-safe**

Use the first matching button only for the status label while updating every matching control.

```ts
buttons.forEach((button) => {
  button.setAttribute('aria-pressed', String(button.dataset.atlasThemeButton === themeId));
});
const activeButton = buttons.find(({ dataset }) => dataset.atlasThemeButton === themeId);
```

- [ ] **Step 4: Remove fullscreen overlay CSS**

Delete fullscreen absolute `.atlas-family-directory__body`, `:has(...open)` padding and ten-column Family rules. Add a compact wrapping lens strip and keep normal-page bodies in flow.

- [ ] **Step 5: Run GREEN tests**

Run: `CI=1 npx playwright test tests/e2e/atlas.spec.ts tests/e2e/theme.spec.ts tests/e2e/base-path.spec.ts --project=chromium --project=mobile-chromium`

Expected: all assertions pass, with only existing project-specific skips.

### Task 3: Verify visual and no-JS behavior

**Files:**
- Modify: `tests/e2e/atlas.spec.ts`

- [ ] **Step 1: Add empty-Family and no-JS assertions**

Assert Strategy shows `0 条已核查谱系，待研究`, has no theme button, and server-rendered Family disclosures and the complete 48/36/61 network remain present without JavaScript.

- [ ] **Step 2: Run final Atlas gates**

Run: `npm run check`

Run: `npm test -- tests/lib/atlas-network.test.ts tests/lib/catalog-validate.test.ts`

Run: `npm run build`

Run: `CI=1 npx playwright test tests/e2e/atlas.spec.ts tests/e2e/theme.spec.ts tests/e2e/base-path.spec.ts --project=chromium --project=mobile-chromium`

- [ ] **Step 3: Capture and inspect screenshots**

Capture 1440px Light/Dark normal page with Role-playing open, 1440px Light/Dark fullscreen with Roguelike active, and 320px no-JS. Verify no overlay, no internal Family scroll, no page overflow, and the graph canvas retains at least 600px height at 900px viewport height.

- [ ] **Step 4: Commit**

```bash
git add src/components/AtlasNetwork.astro src/styles/global.css tests/e2e/atlas.spec.ts
git commit -m "fix: make Atlas lenses directly selectable"
```

