# Learn About Games v0.2 Innovation Atlas and Release Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the Roguelike card seed with one global evidence-backed time network, add Metroidvania as a second highlight lens, then complete adversarial acceptance and GitHub Pages release.

**Architecture:** All Atlas nodes and relations render in a single server-generated coordinate system. Time is the only horizontal measure; vertical lanes are explicit collision/type layout metadata with no quality meaning. Nodes, relations and themes reference one shared tag taxonomy, and themes only change emphasis. Relations explicitly encode directed or undirected semantics. Evidence remains a separate document entity shown in node/edge detail panels.

**Tech Stack:** agent-reach research, Astro static rendering, TypeScript, static JSON, native CSS/SVG data visualization, Vitest, Playwright and GitHub Actions Pages deployment.

---

## File map

- Create `docs/research/2026-08-09-metroidvania-atlas-evidence.md`.
- Create `src/components/AtlasNetwork.astro`.
- Create `src/lib/atlas-network.ts`.
- Create `src/data/atlas-tags.json` and retire `src/data/atlas-categories.json` after migration.
- Modify `src/data/atlas-nodes.json`, `src/data/atlas-relations.json`, `src/data/atlas-evidence.json`, `src/data/atlas-themes.json`.
- Modify `src/content.config.ts`, `src/lib/catalog/validate.ts`.
- Modify `src/pages/atlas/index.astro`, `src/styles/global.css`.
- Delete `src/components/AtlasSeed.astro` after replacement.
- Test `tests/lib/atlas-network.test.ts`, `tests/lib/catalog-validate.test.ts`, `tests/e2e/atlas.spec.ts`, `tests/e2e/base-path.spec.ts`.
- Modify release documents and `.github/workflows/deploy.yml` only if a failing deployment contract proves a change is needed.

### Task 1: Research the Metroidvania lens and global context

- [ ] **Step 1: Define the evidence question**

Research separately:

1. release facts and what each game demonstrably contains;
2. direct developer-reported influence;
3. later category naming and formation;
4. structural similarity where influence remains unknown;
5. disputes about origin or definition.

Do not search for a single “inventor of Metroidvania” answer.

- [ ] **Step 2: Use agent-reach with primary sources first**

Prefer developer interviews, official retrospectives, design documents, contemporary publications and academic/credible historical sources. Search candidate nodes including Metroid, Metroid II, Super Metroid, Castlevania II, Castlevania: Symphony of the Night and later branch/fusion examples only when a source supports their relevance.

Record each proposed edge as:

```ts
type EvidenceEdge = {
  fromId: string;
  toId: string;
  type: 'direct-influence' | 'derived-variant' | 'fusion' | 'revival' |
    'parallel-origin' | 'structural-similarity' | 'disputed';
  status: 'confirmed' | 'credible' | 'inferred' | 'disputed';
  directionality: 'directed' | 'undirected';
  tags: string[];
  claim: string;
  evidenceUrls: string[];
  boundary: string;
};
```

- [ ] **Step 3: Adversarially approve edges**

Keep release chronology without an edge when no source supports influence. Downgrade wording when evidence only supports similarity or later category association. Require at least one evidence URL per published edge. `direct-influence`, `derived-variant`, `fusion`, and `revival` are directed; `parallel-origin` and `structural-similarity` are undirected; `disputed` must explicitly choose and justify its directionality.

- [ ] **Step 4: Commit the evidence notebook**

Write the approved/rejected edge table and source limitations to `docs/research/2026-08-09-metroidvania-atlas-evidence.md`.

```bash
git add docs/research/2026-08-09-metroidvania-atlas-evidence.md
git commit -m "research: document the Metroidvania evidence lens"
```

### Task 2: Migrate Atlas data to a global graph

- [ ] **Step 1: Write failing schema and graph tests**

Add tests for:

```ts
expect(atlasNodes.length).toBeGreaterThanOrEqual(25);
expect(atlasNodes.length).toBeLessThanOrEqual(40);
expect(atlasRelations.length).toBeGreaterThanOrEqual(15);
expect(atlasRelations.length).toBeLessThanOrEqual(25);
expect(atlasThemes.map(({ id }) => id)).toEqual(expect.arrayContaining([
  'roguelike',
  'metroidvania',
]));
expect(atlasThemes.every((theme) =>
  !('nodeIds' in theme) && !('relationIds' in theme)
)).toBe(true);
```

Test enums, date ranges, evidence references, explicit relation directionality and a validator error for unexplained chronological inversion on confirmed direct influence. Test that every node/relation/theme tag resolves against `atlas-tags.json`. Add a pure `matchAtlasTheme()` test proving the same taxonomy independently marks both nodes and relations without changing either list.

- [ ] **Step 2: Run and verify RED**

Run: `npm test -- tests/lib/catalog-validate.test.ts tests/lib/atlas-network.test.ts`

Expected: Atlas has 9 nodes, 7 relations, one owning theme, the old category collection, and no explicit directionality/shared-tag/date-range support.

- [ ] **Step 3: Implement the global data contract**

Update Atlas Node:

```ts
type AtlasNode = {
  id: string;
  kind: 'game' | 'innovation' | 'category';
  name: LocalizedText;
  summary: LocalizedText;
  startYear: number;
  endYear?: number;
  lane: number;
  tags: string[];
};
```

Replace the old Atlas category taxonomy with `atlas-tags.json`. Update Node, Relation and Theme so each references this shared tag collection. Theme contains `title`, `summary`, and `tags` only; it must not list node or relation IDs. Relations retain evidence IDs and gain constrained `type`, `status`, `directionality`, `tags`, plus optional chronology explanation. Validators enforce directed types, undirected types, and an explicit justified choice for disputed relations.

- [ ] **Step 4: Populate and validate the union graph**

Migrate all approved Roguelike nodes/relations, add Metroidvania nodes/relations from the evidence notebook, and include only the minimum shared context needed for a coherent global graph. Use category nodes for later category formation rather than retroactively labeling early games as if the term already existed.

- [ ] **Step 5: Verify GREEN and commit**

Run: `npm run check && npm test -- tests/lib/catalog-validate.test.ts tests/lib/atlas-network.test.ts`

```bash
git add src/content.config.ts src/lib/catalog src/lib/atlas-network.ts src/data/atlas-* tests/lib
git commit -m "content: expand Atlas into a global evidence graph"
```

### Task 3: Render the global horizontal time network

- [ ] **Step 1: Replace old E2E expectations with RED v0.2 invariants**

Update `tests/e2e/atlas.spec.ts` to assert:

```ts
const graph = page.locator('[data-atlas-global-network]');
await expect(graph.locator('[data-atlas-node]')).toHaveCount(expectedNodeCount);
await expect(graph.locator('[data-atlas-relation]')).toHaveCount(expectedRelationCount);
await expect(page.getByRole('button', { name: 'Roguelike' })).toBeVisible();
await expect(page.getByRole('button', { name: 'Metroidvania' })).toBeVisible();
```

Capture initial node/relation IDs, apply each theme and assert the ID lists remain identical while `data-theme-match` changes on both matching nodes and matching relations. Assert Game, Innovation and Category nodes have distinct kind attributes; relation details expose directionality/type/status/evidence. Assert a range node renders both start and end years as a visible interval while every Game renders only its release year.

- [ ] **Step 2: Run and verify RED**

Run separately:

```bash
npm run build
npx playwright test tests/e2e/atlas.spec.ts --project=chromium --project=mobile-chromium
```

Expected: the old page renders a single theme as chronology cards plus relation cards and has no Metroidvania control.

- [ ] **Step 3: Implement `AtlasNetwork.astro`**

Server render all nodes and relations once. Compute horizontal position from `startYear` within the global range and render an Innovation/Category interval through `endYear`; Game rejects `endYear` and renders one release marker. Vertical position comes from the explicit `lane`. Render functional SVG edges behind HTML/SVG nodes with direct data attributes. Directed relations show an arrow from `fromId` to `toId`; undirected relations use a symmetric line and related-endpoint language. Use a readable detail panel for the selected node or edge; keep every evidence link server-rendered.

Theme buttons may toggle `data-active-theme` and per-node/per-edge match attributes only. They must not add/remove nodes, alter chronological position or rewrite evidence status.

- [ ] **Step 4: Implement mobile relation-equivalent view**

At an explicitly set 320px viewport, replace the large canvas with time-period groups. Each node lists incoming/outgoing directed relations, undirected related nodes, and evidence links, so the same network can be followed without horizontal panning. The desktop canvas may use contained horizontal scrolling only when the viewport cannot display the minimum readable scale.

- [ ] **Step 5: Verify GREEN**

Run: `npm run build && npx playwright test tests/e2e/atlas.spec.ts tests/e2e/base-path.spec.ts --project=chromium --project=mobile-chromium`

Expected: global counts remain constant under both theme lenses, edges are traceable through shared nodes, and mobile preserves direction/evidence.

- [ ] **Step 6: Commit the Atlas UI**

```bash
git add src/components/AtlasNetwork.astro src/pages/atlas src/styles/global.css tests/e2e
git rm src/components/AtlasSeed.astro
git commit -m "feat: render Innovation Atlas as a global time network"
```

### Task 4: Full product adversarial acceptance

- [ ] **Step 1: Re-read the approved spec and build a requirement matrix**

Map every requirement in `docs/superpowers/specs/2026-08-09-learn-about-games-v02-design.md` to a test, source file or manual inspection. Add missing tests before fixing any gap.

- [ ] **Step 2: Run the fresh full gate**

Use `CI=1` so Playwright owns a fresh preview process and does not reuse an existing server. If a prior project-owned process ID was recorded by this task, stop only that PID. Then run:

```bash
npm run check
npm test
npm run build
CI=1 npm run test:e2e
git diff --check
```

Record exact counts and full exit status. Do not reuse an old `dist` or preview.

- [ ] **Step 3: Inspect all critical visual states**

At 1440px and an explicit 320px viewport, inspect in Light and Dark:

- home and five-item navigation;
- About hub;
- full map and mobile outline;
- all three Career Lenses;
- capability and knowledge-topic details;
- Resources default, narrow filters, empty results, no-JS;
- Atlas default, Roguelike lens, Metroidvania lens, node detail and edge evidence.

Measure document/body/client widths and reject horizontal overflow. Verify focus order, skip link, single h1, named controls and no duplicate IDs.

- [ ] **Step 4: Run copy and semantics audit**

Search visible source content for stale M0 or rejected semantics:

```bash
rg -n "AAA /|已审核|已策展|候选资源|编辑精选|按顺序|学习路径|Atlas</a>" src README.md METHODOLOGY.md CONTRIBUTING.md ROADMAP.md
```

Historical Changelog/Devlog references may remain only when clearly labeled as M0 history. Current UI must not contain resource quality tiers or mandatory path wording.

- [ ] **Step 5: Request final specification and quality reviews**

Dispatch a high-capability spec reviewer against the complete v0.2 diff, then a separate code/visual-quality reviewer. Fix all Critical and Important findings with failing tests first, then re-run the same review until approved.

### Task 5: Continuity, release and live verification

- [ ] **Step 1: Update handoff and public history**

Update `AGENTS.md`, `CLAUDE.md`, the v0.2 decision summary and partial transcript with exact current state, decisions, incidents, evidence, limitations and next step. Add a v0.2 Devlog explaining the move from paths/review tiers to maps/topics/external observations. Update Roadmap and Unreleased Changelog without claiming deployment.

- [ ] **Step 2: Run the final clean verification after documentation**

Run the complete check/test/build/E2E/diff gate again. Run a secret filename scan that excludes `.git`, `node_modules` and `dist` and does not print matched values.

- [ ] **Step 3: Commit and push the verified branch**

Inspect `git status --short`, then stage only the explicitly reviewed v0.2 runtime, test and continuity paths; never use `git add .` for the release commit.

```bash
git add AGENTS.md CLAUDE.md README.md ROADMAP.md CHANGELOG.md DESIGN.md docs src tests .github/workflows/deploy.yml
git commit -m "docs: record the verified v0.2 release"
git push -u origin codex/v02
```

Do not force-push or modify global Git configuration.

- [ ] **Step 4: Integrate through the repository's accepted branch flow**

If the project continues to use direct `main` publication, update `main` only through a non-destructive fast-forward or reviewed PR as allowed by the current repository state. Do not rewrite remote history.

- [ ] **Step 5: Verify GitHub Pages deployment**

Wait for the workflow triggered by the runtime `main` commit. Confirm build and deploy jobs succeed and record `runtimeReleaseSha` plus `runtimeRunId`. Fetch the live pages and verify exact contracts for navigation, theme boot markup, map nodes, the published real resource count, all three career lens names, global Atlas, and Metroidvania.

- [ ] **Step 6: Close the release evidence loop**

If a later metadata-only continuity commit is needed, record it as `evidenceCommitSha` and do not require that commit to prove its own workflow recursively. Push it once, confirm its workflow succeeds, and verify that the live runtime contracts are unchanged. The finite evidence chain is: runtime release SHA/run → live runtime verification → optional evidence commit SHA/run. Only then mark the v0.2 goal complete.
