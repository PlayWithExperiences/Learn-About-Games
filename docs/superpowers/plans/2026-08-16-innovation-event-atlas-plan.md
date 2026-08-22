# Innovation Event Atlas Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make Atlas genre lenses render evidence-backed innovation events as the primary left-to-right evolution timeline, with games as secondary carrier evidence and reversible event details.

**Architecture:** Keep the existing single `AtlasNetwork` and catalog collections. Extend only innovation nodes and relations with explicit event metadata; derive a filtered event timeline from the selected theme, then render carrier games in a secondary layer/detail panel. Preserve the existing full-network, no-JS outline, zoom/pan, and evidence-index contracts.

**Tech Stack:** Astro static components, TypeScript pure helpers, JSON catalog data, native `<details>`/`<dialog>`, Vitest, Playwright.

---

### Task 1: Lock the event data contract

**Files:**
- Modify: `src/content.config.ts:236-330` to validate event metadata and the new event relation role.
- Modify: `src/lib/catalog/validate.ts:171-205,1191-1350` to validate event fields, carrier endpoint kinds, and evidence closure.
- Modify: `src/data/atlas-nodes.json` to add event metadata to existing innovation nodes and add the FPS event sample.
- Modify: `src/data/atlas-relations.json` to add event-to-event and event-to-carrier roles.
- Modify: `src/data/atlas-evidence.json` only for evidence already present in the repository or newly verified official sources.
- Test: `tests/lib/atlas-network.test.ts`.

- [ ] **Step 1: Write the failing pure tests.** Add tests named `innovation nodes expose bounded event roles and theme ids`, `event relations distinguish evolution from carrier evidence`, and `fps event sample has carrier closure`. Assert that an innovation node has `eventRole`, non-empty `themeIds`, non-empty `mechanism`, and that every event relation carries `relationRole: 'evolution' | 'carrier'` with carrier roles ending at a `game` node.

- [ ] **Step 2: Run the focused tests and verify RED.** Run `npm test -- tests/lib/atlas-network.test.ts`. Expected: the new assertions fail because the current schema/data does not expose the fields.

- [ ] **Step 3: Add the minimal schema and validator fields.** Add `eventRole` (`definition | mechanism | transformation | diffusion`), `themeIds: string[]`, and `mechanism: localizedText` to innovation nodes. Add `relationRole` (`evolution | carrier`) to relations. Reject carrier relations whose `fromId` is not an innovation node or whose `toId` is not a game node; reject evolution relations whose endpoints are not innovation nodes.

- [ ] **Step 4: Add the first FPS event records.** Use the existing evidence-backed FPS material and preserve bounded claims. Add only event records whose source supports the stated mechanism; do not label any event “absolute first”. Link each event to one or more existing game carriers through `relationRole: 'carrier'`.

- [ ] **Step 5: Run the focused tests and verify GREEN.** Run `npm test -- tests/lib/atlas-network.test.ts` and `npm run check`. Expected: all Atlas unit tests pass and Astro reports 0 diagnostics.

- [ ] **Step 6: Commit the data contract.** Run `git add src/content.config.ts src/lib/catalog/validate.ts src/data/atlas-nodes.json src/data/atlas-relations.json src/data/atlas-evidence.json tests/lib/atlas-network.test.ts && git commit -m "feat: model innovation events and carrier evidence"`.

### Task 2: Build a pure event-timeline projection

**Files:**
- Modify: `src/lib/atlas-network.ts`.
- Test: `tests/lib/atlas-network.test.ts`.

- [ ] **Step 1: Write the failing helper tests.** Add tests for `buildAtlasEventTimeline` that select the FPS theme, return only innovation events as primary nodes, sort by `startYear` then stable ID, expose evolution relations only in the primary graph, and return carrier games separately.

- [ ] **Step 2: Run the helper tests and verify RED.** Run `npm test -- tests/lib/atlas-network.test.ts`. Expected: `buildAtlasEventTimeline` is missing or returns no event projection.

- [ ] **Step 3: Implement the projection.** Export `buildAtlasEventTimeline(nodes, relations, themeTags)` with a result shaped as `{ events, evolutionRelations, carriersByEvent, emptyState }`. Match a theme by `themeIds` first and legacy tags second; never mutate inputs; use a total ordering of `(startYear, id)`.

- [ ] **Step 4: Verify GREEN and deterministic behavior.** Run `npm test -- tests/lib/atlas-network.test.ts`; add a reverse-input assertion to prove event IDs, relation IDs, and carrier lists remain stable.

- [ ] **Step 5: Commit the pure projection.** Run `git add src/lib/atlas-network.ts tests/lib/atlas-network.test.ts && git commit -m "feat: project event-first Atlas timelines"`.

### Task 3: Render events as the primary Atlas surface

**Files:**
- Modify: `src/components/AtlasNetwork.astro`.
- Modify: `src/styles/global.css` in Atlas-scoped selectors only.
- Test: `tests/e2e/atlas.spec.ts`.

- [ ] **Step 1: Write failing browser contracts.** Add tests that select the FPS lens and assert `[data-atlas-event-node]` is the primary node set, `[data-atlas-game-node]` is absent from the default primary scene, event cards show a mechanism label, and event relations use event endpoints. Add a second assertion that the carrier toggle is off by default.

- [ ] **Step 2: Run the focused browser tests and verify RED.** Run `npx playwright test tests/e2e/atlas.spec.ts --project=chromium --workers=1 -g "event-first"`. Expected: the old game-first DOM lacks the new event-node contract.

- [ ] **Step 3: Implement server-rendered event projection.** Use `buildAtlasEventTimeline` in `AtlasNetwork.astro`. In the selected lens scene, render event nodes and evolution paths as the primary layer, render carrier games only in the event details and hidden carrier layer, and expose `data-atlas-event-node`, `data-atlas-game-node`, `data-atlas-event-role`, and `data-atlas-carrier-count`.

- [ ] **Step 4: Add the carrier visibility control.** Add one disabled-first button/checkbox labeled `显示承载作品` with a no-JS explanation. Its state must only toggle a CSS/data attribute; it must not mutate event IDs or route geometry.

- [ ] **Step 5: Style the hierarchy.** Give event nodes the strongest border/ink and event-role label; give carrier games a smaller dashed treatment and lower emphasis. Keep event titles in one or two natural lines and use `text-wrap: pretty`, `line-break: strict`, and flexible columns rather than arbitrary fixed narrow widths.

- [ ] **Step 6: Verify GREEN and visual bounds.** Run `npx playwright test tests/e2e/atlas.spec.ts --project=chromium --workers=1 -g "event-first|carrier"` and inspect 1440px light/dark plus 320px no-JS screenshots. Expected: event nodes read before games, no page overflow, no one/two-character title orphan.

- [ ] **Step 7: Commit the UI slice.** Run `git add src/components/AtlasNetwork.astro src/styles/global.css tests/e2e/atlas.spec.ts && git commit -m "feat: render Atlas events before carrier games"`.

### Task 4: Make event details reversible and accessible

**Files:**
- Modify: `src/components/AtlasNetwork.astro`.
- Modify: `src/styles/global.css` in Atlas detail selectors only.
- Test: `tests/e2e/atlas.spec.ts`.

- [ ] **Step 1: Write failing interaction contracts.** Add tests for click event → detail open, click the same event again → clear, Escape → clear, close button → clear, and restoration of canvas scroll, page scroll, URL, and origin focus. Add mobile no-JS assertions that event details and carrier links remain native-expandable.

- [ ] **Step 2: Run the focused tests and verify RED.** Run `npx playwright test tests/e2e/atlas.spec.ts --project=chromium --workers=1 -g "reversible event detail"`. Expected: current details require a separate “返回网络” path and do not expose the event-specific state contract.

- [ ] **Step 3: Implement one reversible event-detail owner.** Reuse the current native dialog snapshot logic, but key it by event ID and add toggle-close behavior for the originating event. Keep Evidence return behavior intact; returning from Evidence must restore the same event selection and carrier visibility state.

- [ ] **Step 4: Verify GREEN across desktop/mobile.** Run the focused test with `--project=chromium --project=mobile-chromium`; expected 0 failures and stable focus/scroll assertions.

- [ ] **Step 5: Commit reversible details.** Run `git add src/components/AtlasNetwork.astro src/styles/global.css tests/e2e/atlas.spec.ts && git commit -m "feat: make Atlas event details reversible"`.

### Task 5: Migrate the remaining genre lenses honestly

**Files:**
- Modify: `src/data/atlas-nodes.json` and `src/data/atlas-relations.json` only when evidence-backed records exist.
- Modify: `src/components/AtlasNetwork.astro` empty-state copy if needed.
- Test: `tests/lib/atlas-network.test.ts` and `tests/e2e/atlas.spec.ts`.
- Update: `docs/research/2026-08-15-innovation-event-atlas.md`, `ROADMAP.md`, `CHANGELOG.md`, and the v0.2 journal summary/transcript.

- [ ] **Step 1: Add pure coverage checks.** Assert every selectable theme returns either one or more event nodes or an explicit `emptyState`, and that no event with missing evidence is rendered as a primary node.

- [ ] **Step 2: Migrate existing innovation nodes.** Assign theme IDs and event roles to existing Roguelike, Metroidvania, RPG, and open-world records only where the current evidence supports the mechanism. Keep games as carriers.

- [ ] **Step 3: Add honest empty states.** For a theme without enough event evidence, render `尚无达到证据门槛的创新事件；现有作品仅作为待研究上下文。` and retain its family entry.

- [ ] **Step 4: Run the migration tests.** Run `npm test -- tests/lib/atlas-network.test.ts` and the Atlas Chromium/mobile event suite. Expected: deterministic counts, no duplicate IDs, no missing endpoints, and no horizontal overflow.

- [ ] **Step 5: Update public project records.** Record the event-first decision, explicit non-absolute claims, and the FPS pilot in the journal, research note, roadmap, and changelog.

- [ ] **Step 6: Commit the migration.** Run `git add src/data/atlas-nodes.json src/data/atlas-relations.json src/components/AtlasNetwork.astro tests/lib/atlas-network.test.ts tests/e2e/atlas.spec.ts docs/research/2026-08-15-innovation-event-atlas.md ROADMAP.md CHANGELOG.md docs/journal/2026-08-09-learn-about-games-v02-decision-summary.md docs/journal/2026-08-09-learn-about-games-v02-transcript.md && git commit -m "feat: migrate Atlas lenses to innovation events"`.

### Task 6: Full verification and local handoff

**Files:**
- Verify all changed files; do not add deployment files or enable GitHub Pages.

- [ ] **Step 1: Run fresh static checks.** Run `npm run check`, `npm test`, and `npm run build`; expected 0 diagnostics, all unit tests passing, and a fresh static page count.

- [ ] **Step 2: Run browser verification.** With the existing local preview on `127.0.0.1:4321`, run `npx playwright test --workers=1 --reporter=line`; expected 0 failures and only project-marked skips.

- [ ] **Step 3: Perform visual and adversarial checks.** Capture 1440px light/dark, 1024px, 320px, and 320px no-JS Atlas screenshots. Check event-first hierarchy, carrier secondary treatment, empty states, focus/scroll restoration, HTML/body overflow, unique IDs, and no one/two-character orphan lines.

- [ ] **Step 4: Run repository hygiene checks.** Run `git diff --check`, a filename/content secret scan that prints no values, verify `git status --short` is clean after commit, and confirm the preview PID is still running.

- [ ] **Step 5: Commit the final verified result.** Use `git log -1 --oneline` to record the final SHA; do not push or deploy. Keep the local preview URL in the handoff.
