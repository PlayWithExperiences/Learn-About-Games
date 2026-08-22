# Game Feel Path Focus Facets Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add non-exclusive focus facets to the game-feel learning path so readers can narrow the 100-item route without breaking its EGDS sequence or changing resource ownership.

**Architecture:** Keep the six-stage path and its 100 selected resources unchanged. Derive a small, explicit facet taxonomy from existing Capability and Knowledge Topic IDs: three EGDS pillars (`gameplay`, `narrative`, `aesthetics`) plus two supporting lenses (`implementation`, `research`) and a computed `integrated` lens for resources that span multiple pillars. The server renders every item and its facet IDs; a small inline module only toggles `hidden`, updates counts, and preserves a no-JavaScript full-list fallback.

**Tech Stack:** Astro, TypeScript, native HTML buttons/details, scoped CSS, Vitest, Playwright.

---

### Task 1: Lock the facet data contract

**Files:**
- Modify: `tests/lib/learning-path.test.ts`
- Modify: `src/lib/learning-paths.ts`

- [x] **Step 1: Write the failing pure tests**

Add assertions that the path exposes the exact ordered facets `all`, `gameplay`, `narrative`, `aesthetics`, `implementation`, `research`, `integrated`; every selected item has at least one facet; a fixture carrying gameplay, narrative, and aesthetics capability IDs receives all three plus `integrated`; and facet counts are derived from unique resources rather than summing mutually overlapping labels.

- [x] **Step 2: Run the focused test and verify RED**

Run:

```bash
npm test -- --run tests/lib/learning-path.test.ts
```

Expected: failure because `LearningPath` has no facet metadata and selected resources have no facet IDs.

- [x] **Step 3: Implement the smallest pure classifier**

In `src/lib/learning-paths.ts`, add typed facet definitions and capability/topic ID sets. Return selected resources with `focusIds`, preserving the existing stable stage selection and the original catalog fields. Mark `integrated` only when a resource matches all three primary pillars; keep supporting lenses independent so a technical or research item can also belong to a pillar.

- [x] **Step 4: Run the focused test and verify GREEN**

Run the same Vitest command and expect all learning-path unit tests to pass without changing the six stage quotas.

### Task 2: Add browser contracts for filtering

**Files:**
- Modify: `tests/e2e/learning-path.spec.ts`

- [x] **Step 1: Write the failing browser tests**

Add a desktop test that finds the seven facet buttons, selects `叙事与表达`, verifies the URL remains the path route, checks every visible resource has the narrative facet, confirms the status and stage counts match visible DOM rows, then selects `全部` and restores 100 rows. Add a no-JavaScript/mobile test that keeps all 100 resources readable, shows the explanation that facets require JavaScript, and asserts `scrollWidth === clientWidth` at 320px.

- [x] **Step 2: Run the focused browser tests and verify RED**

Run:

```bash
npx playwright test tests/e2e/learning-path.spec.ts --project=chromium --project=mobile-chromium --workers=1
```

Expected: failure because facet controls, facet metadata, and the no-JavaScript explanation do not exist.

### Task 3: Render facet controls and filtering behavior

**Files:**
- Modify: `src/components/LearningPath.astro`
- Modify: `src/styles/global.css`

- [x] **Step 1: Add server-rendered controls and metadata**

Render a compact focus section before the stage list. Use native buttons with `aria-pressed`, a live status line, counts, and a `<noscript>` note. Render each resource’s `data-learning-path-focus` as a space-separated token list and add per-stage count/empty-state targets.

- [x] **Step 2: Add the minimal inline module**

Bind one listener per focus button. On selection, hide only non-matching resource rows, update the overall status and stage counts, hide empty nested disclosures, and keep `全部` selected by default. Do not mutate the path order, URL, or catalog data.

- [x] **Step 3: Add dense responsive styling**

Use the existing dark editorial tokens. Keep facets in one compact row on desktop, wrap them at the 900px breakpoint, and stack them at 760px. Avoid new decorative separators or card-heavy treatment; the controls should read as one tool row attached to the path.

- [x] **Step 4: Run focused browser tests and verify GREEN**

Run the focused Playwright command from Task 2 and confirm desktop, mobile, and no-JavaScript contracts pass.

### Task 4: Regression and project records

**Files:**
- Modify: `CHANGELOG.md`
- Modify: `ROADMAP.md`
- Add: `docs/devlog/2026-08-16-game-feel-path-facets.md`
- Modify: `docs/journal/2026-08-08-learn-about-games-decision-summary.md`
- Modify: `docs/journal/2026-08-08-learn-about-games-transcript.md`

- [x] **Step 1: Record the facet decision**

Document that facets are overlapping views, not a replacement taxonomy: the three EGDS pillars remain mutually supportive, while implementation and research are supporting lenses.

- [x] **Step 2: Run the fresh verification matrix**

Run:

```bash
npm run check
npm test
npm run build
npx playwright test tests/e2e/learning-path.spec.ts --project=chromium --project=mobile-chromium --workers=1
git diff --check
```

Expected: zero Astro diagnostics, all unit tests passing, fresh static build, focused path E2E passing, and no diff whitespace errors. Confirm the local preview route returns HTTP 200 after the build.

- [x] **Step 3: Commit the focused change**

Stage only the facet implementation, tests, plan, and project records, then commit with:

```bash
git commit -m "feat: add focus facets to game feel path"
```
