# EGDS Hierarchy, Atlas Lenses and Resource Expansion Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make EGDS parent-child ownership immediately legible, retain Atlas evidence lenses in full-screen map mode, and add the next evidence-backed learning-resource batch.

**Architecture:** Three independent slices share no production-file ownership. The EGDS slice derives presentation territories from the existing deterministic layout without changing catalog data. The Atlas slice moves the existing lens controls into the full-screen workspace without creating a second state owner. The resource slice changes only research/catalog data and raw-data tests.

**Tech Stack:** Astro, TypeScript, native CSS, Vitest, Playwright, JSON catalogs, Agent Reach with Exa/Jina.

---

### Task 1: Encode EGDS hierarchy as territories and weighted structure

**Files:**
- Modify: `src/lib/map-geometry.ts`
- Modify: `src/components/CapabilityMap.astro`
- Modify: `src/styles/global.css` (EGDS-scoped rules only)
- Test: `tests/lib/map-geometry.test.ts`
- Test: `tests/e2e/map-v02.spec.ts`

- [ ] **Step 1: Write failing pure geometry tests**

Add assertions that the layout returns five branch-territory bounds, that every descendant box center lies inside its owning territory, and that reversing all input arrays does not change territory geometry.

- [ ] **Step 2: Run the pure test and verify RED**

Run: `npm test -- tests/lib/map-geometry.test.ts`

Expected: failure because branch territory geometry is not exported.

- [ ] **Step 3: Write failing browser hierarchy tests**

Assert five `[data-egds-territory]` elements, one territory per branch, root-to-branch stroke wider than branch-to-child stroke, process lines separately encoded, and grid contrast lower than structural lines in Light and Dark. Retain the existing collision and responsive outline assertions.

- [ ] **Step 4: Run the browser test and verify RED**

Run: `CI=1 npx playwright test tests/e2e/map-v02.spec.ts --project=chromium`

Expected: failure because territories and semantic structural line classes do not exist.

- [ ] **Step 5: Implement the minimal hierarchy grammar**

Derive territory bounds from existing boxes, render them below connectors and nodes, attach semantic path classes/data attributes, and recalibrate only EGDS-scoped CSS tokens. Do not change `egds-framework-nodes.json`, relation data, URLs or controller state.

- [ ] **Step 6: Verify GREEN and visual invariants**

Run the pure test, Map desktop/mobile E2E, fresh build, and 1440px Light/Dark screenshot probes. Confirm 28/42/12/64 counts, zero collisions, no page overflow and unchanged 1024px/320px outline behavior.

- [ ] **Step 7: Commit the slice**

Commit message: `fix: clarify the EGDS hierarchy`

### Task 2: Keep Atlas evidence lenses in full-screen mode

**Files:**
- Modify: `src/components/AtlasNetwork.astro`
- Modify: `src/styles/global.css` (Atlas-scoped rules only)
- Test: `tests/e2e/atlas.spec.ts`

- [ ] **Step 1: Write the failing full-screen lens test**

Enter map mode, assert the catalog-derived lens controls are visible and accessible, select Metroidvania, and record scale, scrollLeft, scrollTop and representative node geometry before and after.

- [ ] **Step 2: Run the Atlas test and verify RED**

Run: `CI=1 npx playwright test tests/e2e/atlas.spec.ts --project=chromium`

Expected: failure because the existing lens controls sit outside the fixed full-screen workspace.

- [ ] **Step 3: Move the single control set into the workspace**

Place the existing theme controls inside the same wrapper that becomes full-screen. Preserve one controller, one `aria-pressed` state, one catalog payload and one focus order. Switching lenses must not call viewport reset or exit map mode.

- [ ] **Step 4: Verify map-state preservation**

Run Atlas desktop/mobile and Theme/Base-path regressions. Confirm full-screen remains active, scale/pan/geometry remain stable, focus is usable, and the <=1150px/no-JavaScript outline remains complete.

- [ ] **Step 5: Commit the slice**

Commit message: `feat: keep Atlas lenses in map mode`

### Task 3: Add the next evidence-backed resource batch

**Files:**
- Modify: `src/data/resources.json`
- Modify: `src/data/sources.json`
- Modify: `docs/research/2026-08-09-resource-intake.md`
- Test: `tests/lib/catalog-data.test.ts`

- [ ] **Step 1: Measure current gaps and write the failing data contract**

Compute topic, media, original/consumable language and Capability coverage from raw JSON. Add assertions for the approved new canonical URLs and the resulting exact totals before changing data.

- [ ] **Step 2: Run the raw-data test and verify RED**

Run: `npm test -- tests/lib/catalog-data.test.ts`

Expected: failure because the researched Work Items are not in the catalog.

- [ ] **Step 3: Research with Agent Reach**

Run `agent-reach doctor --json`, use Exa for discovery and Jina/official pages for verification, and record the actual backend. Prefer official Chinese/Japanese versions, courses, papers, articles and durable websites. Reject unverifiable, duplicate, aggregator-only or weakly attributable candidates.

- [ ] **Step 4: Add normalized Sources and Work Items**

Add 15 to 25 canonical Work Items with exactly one `resourceTopicId` each, correct Access Versions, checked dates and useful capability/topic links. Do not add ratings, review statuses or ranking signals.

- [ ] **Step 5: Verify data GREEN**

Run catalog-data and validator tests, `npm run check`, fresh build, canonical uniqueness scripts and resource page E2E. Report exact counts, distributions, excluded candidates and unresolved limitations.

- [ ] **Step 6: Commit the slice**

Commit message: `content: expand multilingual learning resources`

### Task 4: Integrate, document and preview

**Files:**
- Modify: `README.md`
- Modify: `ROADMAP.md`
- Modify: `CHANGELOG.md`
- Modify: `docs/devlog/` milestone entry
- Modify: `docs/journal/2026-08-09-learn-about-games-v02-decision-summary.md`
- Modify: `docs/journal/2026-08-09-learn-about-games-v02-transcript.md`
- Modify: count-sensitive E2E tests if the raw catalog total changes

- [ ] **Step 1: Review three commits adversarially**

Check visual encodings, DOM/state ownership, catalog provenance, cross-surface CSS, exact file ownership and no unrelated changes.

- [ ] **Step 2: Update public facts and journal**

Record the new resource counts, hierarchy rationale, Atlas full-screen lens behavior, limitations, incidents and verification evidence. Keep the transcript sanitized and mark it partial if the runtime cannot export complete UI history.

- [ ] **Step 3: Run final gates**

Run:

```bash
npm run check
npm test
npm run build
CI=1 npm run test:e2e
git diff --check
```

Expected: zero diagnostics, zero failing tests and zero diff whitespace errors.

- [ ] **Step 4: Commit and restart local preview**

Commit message: `docs: record hierarchy and catalog expansion`

Start the fresh base-path preview on port 4321 and leave `/Learn-About-Games/map/` available for inspection. Do not push or enable Pages.
