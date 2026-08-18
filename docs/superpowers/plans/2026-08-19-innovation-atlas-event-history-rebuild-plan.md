# Innovation Atlas Event History Rebuild Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 将 Innovation Atlas 从“作品时间网格上方叠加事件”重构为一张以创新事件为中央主带、作品为承载证据、品类为高亮透镜的全局创新史。

**Architecture:** 保留现有 Catalog collections、全局节点／关系 ID、map mode、native details/dialog 和 no-JS outline。新增一个纯函数事件视角投影与事件主带布局；页面仍只渲染一张全局 SVG/HTML 网络，视角切换只改变可见层级和强调属性，不复制或隔离品类子图。

**Tech Stack:** Astro + TypeScript、JSON catalog、原生 `<details>`/`<dialog>`、CSS scoped selectors、Vitest、Playwright、Agent Reach（Exa/Jina + 官方来源核验）。

---

## Task 1: Lock the global event projection contract

**Files:**
- Modify: `src/lib/atlas-network.ts`
- Modify: `tests/lib/atlas-network.test.ts`
- Modify: `src/lib/catalog/validate.ts` only if the new relation invariants are not already enforced

- [ ] **Step 1: Add failing pure tests for a global event projection.**

Add tests with these exact assertions:

```ts
const projection = buildAtlasEventPerspective(nodes, relations, { themeId: 'first-person-shooter-lineage' });
expect(new Set(projection.globalNodeIds)).toEqual(new Set(nodes.map(({ id }) => id)));
expect(new Set(projection.globalRelationIds)).toEqual(new Set(relations.map(({ id }) => id)));
expect(projection.eventIds).toEqual([
  'rpg-character-progression',
  'first-person-shooter-perspective',
  // remaining IDs are checked by sorted year/id, not fixture order
]);
expect(projection.evolutionRelationIds.every((id) => {
  const relation = relations.find((candidate) => candidate.id === id);
  return relation?.relationRole === 'evolution';
})).toBe(true);
expect(Object.values(projection.carriersByEvent).flat().every((id) => nodes.find((node) => node.id === id)?.kind === 'game')).toBe(true);
```

Also add a reverse-input test proving `eventIds`, `evolutionRelationIds`, and each carrier list are byte-for-byte stable when `nodes` and `relations` are reversed.

- [ ] **Step 2: Run the focused test and verify RED.**

Run `npm test -- tests/lib/atlas-network.test.ts`. Expected failure: `buildAtlasEventPerspective` is not exported.

- [ ] **Step 3: Implement the minimal pure projection.**

Export:

```ts
export type AtlasEventPerspective = {
  globalNodeIds: string[];
  globalRelationIds: string[];
  eventIds: string[];
  evolutionRelationIds: string[];
  highlightedNodeIds: string[];
  highlightedRelationIds: string[];
  carriersByEvent: Record<string, string[]>;
  emptyState: boolean;
};

export function buildAtlasEventPerspective(
  nodes: readonly AtlasNodeForPerspective[],
  relations: readonly AtlasRelationForPerspective[],
  options: { themeId?: string },
): AtlasEventPerspective;
```

Use `themeIds` as the primary match and tags as the compatibility fallback. Always return the full global ID sets. `eventIds` contains all innovation-event IDs sorted by `(startYear, id)`, while `highlightedNodeIds` and `highlightedRelationIds` are only the selected lens emphasis sets. `carriersByEvent` includes only `relationRole === 'carrier'` and valid game endpoints.

- [ ] **Step 4: Run GREEN and commit the pure contract.**

Run `npm test -- tests/lib/atlas-network.test.ts` and `npm run check`. Expected: the Atlas unit file passes and Astro has 0 diagnostics.

Commit with `git add src/lib/atlas-network.ts tests/lib/atlas-network.test.ts src/lib/catalog/validate.ts && git commit -m "feat: project Atlas events on the global network"`.

## Task 2: Add an event-centered layout without changing the works layout

**Files:**
- Modify: `src/lib/atlas-network.ts`
- Modify: `tests/lib/map-geometry.test.ts` or `tests/lib/atlas-network.test.ts`, whichever currently owns Atlas layout geometry

- [ ] **Step 1: Add failing geometry tests.**

Add an `events` perspective to the layout contract and assert:

```ts
const layout = buildAtlasLayout(nodes, relations, { perspective: 'events' });
const eventNodes = layout.nodes.filter((node) => node.kind === 'innovation');
const carrierNodes = layout.nodes.filter((node) => node.kind === 'game');
expect(eventNodes.length).toBeGreaterThan(0);
expect(Math.max(...eventNodes.map(({ centerY }) => centerY)) - Math.min(...eventNodes.map(({ centerY }) => centerY))).toBeLessThanOrEqual(140);
expect(Math.min(...eventNodes.map(({ centerY }) => centerY))).toBeGreaterThan(120);
expect(Math.min(...carrierNodes.map(({ centerY }) => centerY))).toBeGreaterThan(Math.max(...eventNodes.map(({ centerY }) => centerY)));
```

Keep the existing `works` and `category` snapshots unchanged. Add a collision assertion for all event boxes and carrier boxes and a boundary assertion for every relation endpoint.

- [ ] **Step 2: Run the focused geometry tests and verify RED.**

Run `npm test -- tests/lib/atlas-network.test.ts tests/lib/map-geometry.test.ts`. Expected failure: the `events` perspective is not part of the current union and event nodes still use the top lane.

- [ ] **Step 3: Implement event layout semantics.**

Extend `AtlasLayoutPerspective` to `'works' | 'category' | 'events'`. For `events`, place all innovation nodes in the central event band with a stable lane allocation inside that band, place non-event nodes in carrier/context lanes below it, and keep the same `projectAtlasYear`, width, height, relation endpoint projection and global scene dimensions. Do not remove or re-order nodes; only change `displayLane`, `top`, and the derived canvas height for the events perspective.

- [ ] **Step 4: Run GREEN and commit the layout.**

Run the two focused unit files, then `npm run check`. Commit with `git add src/lib/atlas-network.ts tests/lib/atlas-network.test.ts tests/lib/map-geometry.test.ts && git commit -m "feat: center Atlas innovation events"`.

## Task 3: Make the two views share one global network in the UI

**Files:**
- Modify: `src/components/AtlasNetwork.astro`
- Modify: `src/styles/global.css` only in Atlas-scoped selectors
- Modify: `tests/e2e/atlas.spec.ts`

- [ ] **Step 1: Add failing browser contracts.**

Add a desktop test that:

1. enters map mode;
2. selects `data-atlas-perspective="category"` and the FPS lens;
3. asserts `[data-atlas-primary-network]` remains visible;
4. asserts node and relation counts still equal the full `data-atlas-node-count` and `data-atlas-relation-count`;
5. asserts event nodes are in the central band, event nodes precede carrier nodes in the DOM layer order, and the cross-family relation `spelunky-to-dead-cells` remains present;
6. asserts the status text says the global network is retained.

Add a second test switching back to `works` and assert node IDs, relation IDs, year data and layout dimensions are unchanged.

- [ ] **Step 2: Run the focused browser tests and verify RED.**

Run `npx playwright test tests/e2e/atlas.spec.ts --project=chromium --workers=1 -g "global event network|shared perspectives"`. Expected failure: the current category route still uses the old category projection and the event layer remains a separate top strip.

- [ ] **Step 3: Implement server-side shared layouts.**

Build `eventLayout = buildAtlasLayout(nodes, relations, { perspective: 'events' })` alongside the existing layouts. Render one primary scene with all nodes and relations; use `data-atlas-perspective` plus CSS custom properties/data attributes to select the work/category/events placement. Keep every node and relation rendered in the global DOM. Add `data-atlas-event-layer`, `data-atlas-carrier-layer`, `data-atlas-global-node-id`, and `data-atlas-global-relation-id` attributes.

Change the perspective controls to include `events` labeled `创新事件`, while preserving `代表作品` and `品类发展`. The lens button handler must only set `data-theme-match`, `data-atlas-highlight`, and status text; it must never set `hidden` on the primary network.

- [ ] **Step 4: Style the hierarchy and remove duplicated event index prominence.**

Use event nodes as the strongest visual layer in events perspective: solid border, clear role label, readable title, and central-band placement. Use carrier nodes as smaller secondary cards with a quieter border and lower opacity only when a non-matching lens is active. Keep event-to-event paths visually stronger than carrier paths. Move the event index into a compact optional navigator below the map controls; it must not render as a large independent strip above the main graph.

Use flexible widths and `text-wrap: pretty`; do not introduce fixed narrow columns that create one- or two-character orphan lines. Retain only dividers that separate controls, map, details, and evidence.

- [ ] **Step 5: Run GREEN and inspect visual evidence.**

Run the focused browser tests in Chromium and mobile Chromium. Capture 1440 light/dark, 1024, 320, and 320 no-JS screenshots. Verify the event band is central, the carrier layer is visibly subordinate, cross-family edges remain, and `html.scrollWidth === html.clientWidth` at all widths.

- [ ] **Step 6: Commit the shared UI perspective.**

Run `git diff --check`, then commit with `git add src/components/AtlasNetwork.astro src/styles/global.css tests/e2e/atlas.spec.ts && git commit -m "feat: add global event-history Atlas perspective"`.

## Task 4: Make event selection the primary reversible interaction

**Files:**
- Modify: `src/components/AtlasNetwork.astro`
- Modify: `src/styles/global.css` in Atlas detail selectors only
- Modify: `tests/e2e/atlas.spec.ts`

- [ ] **Step 1: Add failing interaction contracts.**

Test event node click, second click, Escape, close button, and focus restoration. The selected detail must expose `data-atlas-selected-event`, show event role/mechanism, show previous/next event links, show carrier links, and show evidence links. Assert that selecting an event does not change page scroll or map document position.

Add mobile no-JS assertions that the event outline opens natively and carrier/evidence links remain reachable.

- [ ] **Step 2: Run the focused tests and verify RED.**

Run `npx playwright test tests/e2e/atlas.spec.ts --project=chromium --project=mobile-chromium --workers=1 -g "reversible event selection"`. Expected failure: current details are generic node details and “返回网络” is the only explicit exit path.

- [ ] **Step 3: Implement one event selection owner.**

Reuse the existing dialog snapshot/focus owner, but add event-specific state. Clicking the selected event toggles it closed; Escape and the close button clear it; evidence return restores the same event, perspective, theme, scale, pan and origin focus. The selected panel must contain only one event’s information and must not duplicate the full event index.

- [ ] **Step 4: Run GREEN and commit.**

Run the focused tests in both projects, then commit with `git add src/components/AtlasNetwork.astro src/styles/global.css tests/e2e/atlas.spec.ts && git commit -m "feat: make Atlas event details reversible"`.

## Task 5: Complete the first four evidence-backed event routes

**Files:**
- Modify: `src/data/atlas-nodes.json`
- Modify: `src/data/atlas-relations.json`
- Modify: `src/data/atlas-evidence.json`
- Modify: `src/data/atlas-themes.json` only when an existing lens needs a precise scope note
- Modify: `tests/lib/atlas-network.test.ts`
- Test: `tests/e2e/atlas.spec.ts`

- [ ] **Step 1: Start research with an observable backend check.**

Announce use of Agent Reach. Run `agent-reach doctor --json`, then use Exa for discovery and Jina/official pages for page-level verification. Record successful and failed routes in a research note under `docs/research/` without treating empty search output as proof of absence.

- [ ] **Step 2: Add the FPS event route first.**

Add only events whose sources support the bounded claim: first-person spatial view, vertical space/weapon feedback, networked combat space, and situated narrative. Add event-to-event evolution relations and event-to-game carrier relations for Wolfenstein 3D, DOOM, Quake and Half-Life where the source supports the carrier claim. Do not use absolute-first language without a source that explicitly supports it.

- [ ] **Step 3: Add RPG, RTS, and open-world/action-adventure routes.**

Extend the same schema with event nodes for persistent progression, resources/base/real-time production, direct unit control, asymmetric factions, target lock/spatial combat, and nonlinear/open-air exploration. Use existing verified evidence first; research new relations only when the page supports the exact direction and mechanism. Leave a theme’s empty state explicit when it lacks enough evidence.

- [ ] **Step 4: Add pure coverage and evidence closure tests.**

Assert at least 24 innovation-event nodes, at least 16 event-evolution relations, every event has one or more evidence IDs, every carrier relation points from innovation to game, every evidence ID resolves, and the four selected themes each have at least one event. Assert no duplicate event IDs, no self-relations, and stable output under reverse input.

- [ ] **Step 5: Run the data gates and commit the content batch.**

Run `npm test -- tests/lib/atlas-network.test.ts tests/lib/catalog-data.test.ts tests/lib/catalog-validate.test.ts`, `npm run check`, and `npx astro build`. Commit only verified data/tests/research files with `git diff --check` clean.

## Task 6: Full verification and local handoff

**Files:**
- Verify all changed files; do not enable GitHub Pages or push.

- [ ] **Step 1: Run fresh static gates.**

Run `npm run check`, `npm test`, and `npm run build`. Expected: zero Astro diagnostics, all unit tests pass, and a fresh page count.

- [ ] **Step 2: Run the complete browser matrix.**

Run `CI=1 npx playwright test --workers=1 --reporter=line` against a freshly built local preview. Expected: zero failures and only intentionally skipped projects.

- [ ] **Step 3: Perform adversarial visual/DOM checks.**

At 1440 light/dark, 1024, 320 and 320 no-JS verify: global graph is intact, event layer is central, carrier layer is secondary, category selection only highlights, event details are reversible, all event/relation IDs are unique, evidence links resolve, no horizontal overflow exists, and no title wraps into a one- or two-character orphan line.

- [ ] **Step 4: Finish hygiene and local preview.**

Run `git diff --check`, filename/content secret scans that print no values, `git status --short`, and confirm `http://127.0.0.1:4321/Learn-About-Games/atlas/` serves the fresh build. Keep the repository Private and Pages disabled unless the user separately authorizes deployment.

