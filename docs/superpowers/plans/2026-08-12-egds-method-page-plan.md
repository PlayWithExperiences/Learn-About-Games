# EGDS Method Page Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Publish a source-bounded EGDS introduction page and connect it from About and the capability map.

**Architecture:** Add one server-rendered Astro route that owns the current EGDS explanation and first-party source links. Keep the four-item global navigation unchanged; About and Map provide contextual entry points. Reuse the existing BaseLayout, sitePath helper, theme tokens, and E2E infrastructure.

**Tech Stack:** Astro, TypeScript, native CSS, Playwright, Vitest.

---

### Task 1: Lock the public route and evidence contract

**Files:**
- Modify: `tests/e2e/egds-routes.spec.ts`
- Modify: `tests/e2e/visible-skeleton.spec.ts`

- [x] **Step 1: Write the failing route test**

Add a Playwright test that opens `./egds/` and requires:

```ts
await expect(page.getByRole('heading', { name: 'EGDS｜情感化游戏设计系统' })).toBeVisible();
await expect(page.locator('[data-egds-current-model]')).toContainText('情绪曲线');
await expect(page.locator('[data-egds-practice-cycle]')).toContainText('感受');
await expect(page.locator('[data-egds-history] article')).toHaveCount(4);
await expect(page.getByRole('link', { name: '打开当前 EGDS Digital Garden' })).toHaveAttribute(
  'href',
  'https://play-with-experiences-digital-garden.vercel.app/',
);
```

- [x] **Step 2: Write failing contextual-entry tests**

Require `/about/` and `/map/` to expose base-path-safe `/Learn-About-Games/egds/` links while keeping the desktop top navigation at four items.

- [x] **Step 3: Run the tests and verify RED**

Run:

```bash
CI=1 npx playwright test tests/e2e/egds-routes.spec.ts tests/e2e/visible-skeleton.spec.ts --project=chromium --grep 'EGDS method|EGDS 方法入口'
```

Expected: FAIL because `/egds/` and both contextual links do not exist.

### Task 2: Implement the EGDS page and entries

**Files:**
- Create: `src/pages/egds/index.astro`
- Modify: `src/pages/about/index.astro`
- Modify: `src/pages/map/index.astro`

- [x] **Step 1: Create the server-rendered page**

Use `BaseLayout` and arrays declared in frontmatter for the five current-model layers, four practice-cycle verbs, three lever families, and four published articles. Include the current-authority, history, map relationship, and boundary copy defined by the design spec.

- [x] **Step 2: Add contextual links**

Use `sitePath('egds/')` in About and Map. Do not alter `BaseLayout` navigation.

- [x] **Step 3: Run the targeted tests and verify GREEN**

Run the same Playwright command from Task 1. Expected: PASS.

### Task 3: Add responsive editorial styling

**Files:**
- Modify: `src/styles/global.css`
- Modify: `tests/e2e/egds-routes.spec.ts`

- [x] **Step 1: Add failing visual-structure assertions**

Require the current model to render five ordered items, the practice cycle to render four ordered items, all external links to be visible, and `document.documentElement.scrollWidth === document.documentElement.clientWidth` at 1440px and 320px.

- [x] **Step 2: Run the assertions and verify RED**

Expected: the unstyled mobile structure or required data hooks fail.

- [x] **Step 3: Add scoped `.egds-page` CSS**

Use existing tokens only. Implement a compact asymmetric intro, five-step linear model, four-part practice cycle, sparse history grid, single-column mobile collapse, and Light/Dark parity. Do not add external dependencies, new fonts, decorative SVG, scroll listeners, or animation libraries.

- [x] **Step 4: Run desktop/mobile tests and verify GREEN**

```bash
CI=1 npx playwright test tests/e2e/egds-routes.spec.ts --project=chromium --project=mobile-chromium
```

Expected: all EGDS route tests pass.

### Task 4: Update public records and project continuity

**Files:**
- Modify: `README.md`
- Modify: `ROADMAP.md`
- Modify: `CHANGELOG.md`
- Create: `docs/devlog/2026-08-12-egds-method-page.md`
- Modify: `docs/journal/2026-08-09-learn-about-games-v02-decision-summary.md`
- Modify: `docs/journal/2026-08-09-learn-about-games-v02-transcript.md`

- [x] **Step 1: Record the product decision**

State that PKM is the current EGDS authority, the four articles are historical evidence, `/egds/` is the public introduction, and the global navigation remains four items.

- [x] **Step 2: Record verification and limitations**

Record source URLs, local-only status, test counts, no-JS behavior, and the fact that the repository does not mirror the full PKM.

- [x] **Step 3: Run public-copy tests**

```bash
CI=1 npx playwright test tests/e2e/visible-skeleton.spec.ts tests/e2e/egds-routes.spec.ts --project=chromium --project=mobile-chromium
```

Expected: PASS with no misleading EGDS claims.

### Task 5: Complete visual and repository verification

**Files:**
- Verify only.

- [x] **Step 1: Run build gates**

```bash
npm run check
npm test
npm run build
```

Expected: zero diagnostics, zero unit failures, successful static build.

- [x] **Step 2: Run the complete browser suite**

```bash
CI=1 npm run test:e2e
```

Expected: zero unexpected failures.

- [x] **Step 3: Inspect visual states**

Capture and inspect `/egds/` at 1440px and 320px in Light and Dark, plus a 320px no-JS state. Check heading hierarchy, copy, focus, link wrapping, contrast, and horizontal overflow.

- [x] **Step 4: Run final static gates**

```bash
git diff --check
rg -n '—|–' src/pages/egds/index.astro
git status --short
```

Expected: clean diff check, no forbidden dash characters on the page, and only intended project files changed before commit.
