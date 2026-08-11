# Genre Atlas Foundation and First Lineages Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a non-exclusive ten-family genre directory and use it to organize existing Atlas lenses plus the first evidence-backed Platform and Adventure histories.

**Architecture:** Genre Families are a small navigation collection, while Atlas Themes remain evidence lineages and nodes keep non-exclusive tags. Schema and validation land before UI; the UI groups one existing control set by Family without changing the global graph; Platform and Adventure content lands only after a research notebook proves every node and relation claim.

**Tech Stack:** Agent Reach, Astro content collections, TypeScript, JSON, Vitest, Playwright, SVG/HTML Atlas.

---

## File map

- Create `src/data/atlas-genre-families.json`: ten broad navigation entries.
- Modify `src/content.config.ts`: Family collection and Theme `familyIds`/`scopeNote`.
- Modify `src/lib/catalog/load.ts`: load the Family collection.
- Modify `src/lib/catalog/validate.ts`: types and Family/Theme reference validation.
- Modify `tests/lib/catalog-validate.test.ts` and `tests/lib/catalog-data.test.ts`: schema contracts.
- Modify `src/data/atlas-themes.json`: family mappings, scope notes and foundation lens.
- Modify `src/data/atlas-tags.json`: only evidence-lens tags actually used by themes.
- Modify `src/components/AtlasNetwork.astro` and `src/styles/global.css`: grouped lens directory.
- Modify `tests/lib/atlas-network.test.ts` and `tests/e2e/atlas.spec.ts`: emphasis-only and geometry preservation.
- Modify `src/data/atlas-nodes.json`, `src/data/atlas-relations.json`, `src/data/atlas-evidence.json`: Platform/Adventure batch.
- Create `docs/research/2026-08-11-atlas-platform-adventure.md`: evidence and exclusions.
- Modify milestone docs after all gates pass.

### Task 1: Add the Genre Family catalog contract

**Files:**
- Create: `src/data/atlas-genre-families.json`
- Modify: `src/content.config.ts`
- Modify: `src/lib/catalog/load.ts`
- Modify: `src/lib/catalog/validate.ts`
- Modify: `tests/lib/catalog-validate.test.ts`
- Modify: `tests/lib/catalog-data.test.ts`

- [ ] **Step 1: Write schema/reference RED**

Extend the test fixture with `atlasGenreFamilies` and add failures for an unknown Theme family, duplicate `familyIds`, duplicate Family order and empty `scopeNote`. Require exactly ten raw Family IDs:

```ts
expect(atlasGenreFamilies.map(({ id }) => id)).toEqual([
  'action',
  'shooter',
  'adventure',
  'role-playing',
  'strategy',
  'simulation-management',
  'sports-racing',
  'puzzle',
  'sandbox-survival',
  'rhythm-party',
]);
```

- [ ] **Step 2: Run RED**

```bash
npm test -- tests/lib/catalog-validate.test.ts tests/lib/catalog-data.test.ts
```

Expected: collection/type is missing and Theme family references cannot be validated.

- [ ] **Step 3: Add the collection schema**

```ts
const atlasGenreFamilies = defineCollection({
  loader: file('src/data/atlas-genre-families.json'),
  schema: z.object({
    id: z.string().trim().min(1),
    title: localizedText,
    summary: localizedText,
    order: z.number().int().positive(),
  }).strict(),
});
```

Extend `atlasThemes` with:

```ts
familyIds: z.array(z.string().trim().min(1)),
scopeNote: localizedText,
```

An empty `familyIds` is valid for the foundation lens; lineage themes require one or more valid Family IDs.

- [ ] **Step 4: Add the ten Family records**

Use sequential `order: 1..10`, Chinese and English titles, and one-sentence summaries that explicitly describe navigation rather than exclusive membership.

- [ ] **Step 5: Add validator codes and exact diagnostics**

Add:

```ts
| 'ATLAS_GENRE_FAMILY_ORDER_DUPLICATE'
| 'ATLAS_THEME_FAMILY_MISSING'
| 'ATLAS_THEME_FAMILY_DUPLICATE'
| 'ATLAS_THEME_SCOPE_INVALID'
```

Diagnostics must identify `collection: 'atlasThemes'`, the Theme ID and exact field/index. Preserve all existing Theme tag validation.

- [ ] **Step 6: Run GREEN and commit**

```bash
npm test -- tests/lib/catalog-validate.test.ts tests/lib/catalog-data.test.ts
npm run check
git add src/data/atlas-genre-families.json src/content.config.ts src/lib/catalog/load.ts src/lib/catalog/validate.ts tests/lib/catalog-validate.test.ts tests/lib/catalog-data.test.ts
git commit -m "feat: define Atlas genre families"
```

### Task 2: Map existing lenses and expose a foundation lens

**Files:**
- Modify: `src/data/atlas-themes.json`
- Modify: `src/data/atlas-tags.json`
- Modify: `src/data/atlas-nodes.json`
- Modify: `src/data/atlas-relations.json`
- Modify: `tests/lib/atlas-network.test.ts`
- Modify: `tests/lib/catalog-data.test.ts`

- [ ] **Step 1: Write Theme RED**

Require these mappings:

```ts
expect(themeById.get('early-electronic-games')?.familyIds).toEqual([]);
expect(themeById.get('roguelike')?.familyIds).toEqual(['action', 'role-playing']);
expect(themeById.get('metroidvania')?.familyIds).toEqual(['action', 'adventure']);
```

Require every Theme to have a non-empty localized `scopeNote`, at least one matching node, and at least one matching relation unless it is explicitly the foundation lens.

- [ ] **Step 2: Run RED**

```bash
npm test -- tests/lib/atlas-network.test.ts tests/lib/catalog-data.test.ts
```

- [ ] **Step 3: Add the foundation Theme**

Add an `early-electronic-games-lens` Tag, apply it to the existing early-history nodes and relations that already use `early-electronic-games`, and add:

```json
{
  "id": "early-electronic-games",
  "title": { "zh-CN": "早期电子游戏与商业化", "en": "Early electronic games and commercialization" },
  "summary": { "zh-CN": "强调实验装置、程序、系统原型与早期商业化关系，不宣称唯一第一款电子游戏。" },
  "scopeNote": { "zh-CN": "这是历史基础透镜，不是品类家族；时间相邻不自动形成影响关系。" },
  "familyIds": [],
  "tags": ["early-electronic-games-lens"]
}
```

Add `familyIds` and bounded `scopeNote` to Roguelike and Metroidvania. Do not change their current matching tags.

- [ ] **Step 4: Prove emphasis remains stable**

For all three themes, require stable node/relation ordering and position before/after matching; all-network still matches every node/relation.

- [ ] **Step 5: Run GREEN and commit**

```bash
npm test -- tests/lib/atlas-network.test.ts tests/lib/catalog-data.test.ts
git add src/data/atlas-themes.json src/data/atlas-tags.json src/data/atlas-nodes.json src/data/atlas-relations.json tests/lib/atlas-network.test.ts tests/lib/catalog-data.test.ts
git commit -m "content: organize existing Atlas lenses"
```

### Task 3: Group the single lens control set by Family

**Files:**
- Modify: `src/components/AtlasNetwork.astro`
- Modify: `src/styles/global.css`
- Modify: `tests/e2e/atlas.spec.ts`

- [ ] **Step 1: Write browser RED**

```ts
await expect(page.locator('[data-atlas-family-directory]')).toHaveCount(1);
await expect(page.locator('[data-atlas-family]')).toHaveCount(10);
await expect(page.locator('[data-atlas-theme-button]')).toHaveCount(4);
await expect(page.locator('[data-atlas-lens-status]')).toHaveCount(1);
```

Test the same counts inside full-screen map mode; no duplicate toolbar may appear.

- [ ] **Step 2: Run RED**

```bash
npx astro build
CI=1 npx playwright test tests/e2e/atlas.spec.ts --project=chromium --grep "family|theme controls"
```

- [ ] **Step 3: Render the directory with native disclosure**

Render Families in catalog `order`. Each Family disclosure lists only Themes whose `familyIds` include that ID. Render the foundation lens in a separate “历史基础” group. Reuse the same button elements and existing `applyTheme` listener.

- [ ] **Step 4: Keep state and geometry invariant**

Extend the existing theme test to record scale, pan, search value, node boxes, relation paths, node/relation order and `data-map-mode` before each lens change. Require exact equality afterward except for `data-theme-match`, `aria-pressed` and status text.

- [ ] **Step 5: Style for density and no-JavaScript honesty**

Use compact neutral disclosure rows, not Family-colored pills. At mobile outline widths, keep the Family directory readable above the complete outline. Without JavaScript, buttons remain disabled and scope notes remain server-readable.

- [ ] **Step 6: Run GREEN, inspect and commit**

```bash
npm run build
CI=1 npx playwright test tests/e2e/atlas.spec.ts tests/e2e/theme.spec.ts tests/e2e/base-path.spec.ts --project=chromium --project=mobile-chromium
git add src/components/AtlasNetwork.astro src/styles/global.css tests/e2e/atlas.spec.ts
git commit -m "feat: browse Atlas lenses by genre family"
```

Capture 1440 Light/Dark page and full-screen states plus 320 no-JavaScript. Verify zero duplicate IDs and no document overflow.

### Task 4: Research Platform and Adventure lineages

**Files:**
- Create: `docs/research/2026-08-11-atlas-platform-adventure.md`

- [ ] **Step 1: Verify the Platform candidate set**

Research these candidate identities through official, museum, archive or participant sources:

```text
Space Panic
Donkey Kong
Mario Bros.
Super Mario Bros.
Sonic the Hedgehog
Celeste
```

Begin with The Strong's Donkey Kong institutional page, then seek Nintendo/Sega/developer archival material for series and influence claims. Do not connect Space Panic to Donkey Kong or Super Mario Bros. to Sonic/Celeste without direct evidence.

- [ ] **Step 2: Verify the Adventure candidate set**

Research:

```text
Colossal Cave Adventure
Zork
Mystery House
King's Quest
Maniac Mansion
The Secret of Monkey Island
```

Use The Strong's Colossal Cave history for its explicitly documented influence on Zork and Roberta Williams. Seek Sierra/Lucasfilm participant or company archives for later relations; do not infer them from chronology.

- [ ] **Step 3: Record one evidence row per bounded claim**

Each row includes candidate node/relation ID, source title, original language, institution/author, publication date when known, canonical URL, locator, checked date, bounded claim, proposed status and include/exclude decision.

- [ ] **Step 4: Apply stop conditions**

Admit 8–14 deduplicated new nodes across both lineages. Every included node needs Evidence. Every included relation needs Evidence for that relationship. If a relation lacks direct support, retain the node without the relation or record an undirected structural comparison; never fill the graph for visual continuity.

- [ ] **Step 5: Commit research**

```bash
git add docs/research/2026-08-11-atlas-platform-adventure.md
git commit -m "research: verify Platform and Adventure lineages"
```

### Task 5: Add Platform and Adventure data with TDD

**Files:**
- Modify: `src/data/atlas-tags.json`
- Modify: `src/data/atlas-themes.json`
- Modify: `src/data/atlas-nodes.json`
- Modify: `src/data/atlas-relations.json`
- Modify: `src/data/atlas-evidence.json`
- Modify: `tests/lib/catalog-data.test.ts`
- Modify: `tests/lib/catalog-validate.test.ts`
- Modify: `tests/lib/atlas-network.test.ts`

- [ ] **Step 1: Write exact RED from accepted notebook rows**

Add literal arrays for accepted node IDs, relation IDs, Evidence IDs and both Theme IDs. Require exact presence, unique IDs, reference closure, at least one Evidence per node/relation and no unsupported relation. Theme contracts:

```ts
expect(themeById.get('platform-lineage')?.familyIds).toEqual(['action']);
expect(themeById.get('adventure-lineage')?.familyIds).toEqual(['adventure']);
```

- [ ] **Step 2: Run RED**

```bash
npm test -- tests/lib/catalog-data.test.ts tests/lib/catalog-validate.test.ts tests/lib/atlas-network.test.ts
```

- [ ] **Step 3: Add only proven data**

Reuse existing nodes instead of duplicating them. Every Evidence entry fills `sourceKind`, `institutionOrAuthor`, `checkedAt`, `locator`, `boundedClaim`, `sourceTitle` and `originalLanguage`. Use `confirmed` only for participant testimony or documented version/code lineage; otherwise use the existing conservative status.

- [ ] **Step 4: Recompute layout bounds**

Do not hand-place nodes. Extend `minYear`/`maxYear` only if accepted evidence requires it, then run the fixed-layout helper. Prove zero node collision, boundary-correct relation endpoints and deterministic order after reversed inputs.

- [ ] **Step 5: Run GREEN and commit data**

```bash
npm test -- tests/lib/catalog-data.test.ts tests/lib/catalog-validate.test.ts tests/lib/atlas-network.test.ts
npm run check
git add src/data/atlas-tags.json src/data/atlas-themes.json src/data/atlas-nodes.json src/data/atlas-relations.json src/data/atlas-evidence.json tests/lib/catalog-data.test.ts tests/lib/catalog-validate.test.ts tests/lib/atlas-network.test.ts
git commit -m "content: add Platform and Adventure Atlas lineages"
```

### Task 6: Verify Atlas interaction and document the milestone

**Files:**
- Modify: `tests/e2e/atlas.spec.ts`
- Modify: `CHANGELOG.md`
- Modify: `docs/journal/2026-08-09-learn-about-games-v02-decision-summary.md`
- Modify: `docs/journal/2026-08-09-learn-about-games-v02-transcript.md`
- Create: `docs/devlog/2026-08-11-genre-atlas.md`

- [ ] **Step 1: Add browser coverage for both new lenses**

For Platform and Adventure, require matching/non-matching nodes and relations, all-network restoration, preserved scale/pan/search/full-screen state, stable geometry, unique Evidence rows and complete responsive outline.

- [ ] **Step 2: Run Atlas and repository gates**

```bash
npm run check
npm test
npm run build
CI=1 npx playwright test tests/e2e/atlas.spec.ts tests/e2e/theme.spec.ts tests/e2e/base-path.spec.ts --project=chromium --project=mobile-chromium
CI=1 npm run test:e2e
git diff --check
```

- [ ] **Step 3: Capture and inspect visual evidence**

Inspect 1440 Light/Dark all-network, Platform and Adventure in page/full-screen modes; 1024 and 320 complete outline; 320 no-JavaScript. Confirm no collisions, no duplicated controls, no horizontal page overflow and legible Family grouping.

- [ ] **Step 4: Record claims and exclusions**

Public docs state that Families are navigation, lineage edges are evidence claims, and the release does not claim any absolute first platformer or first adventure game.

- [ ] **Step 5: Commit docs and refresh preview**

```bash
git add tests/e2e/atlas.spec.ts CHANGELOG.md docs/journal docs/devlog/2026-08-11-genre-atlas.md
git commit -m "docs: record the Genre Atlas foundation"
```

Restart the local preview and verify `/Learn-About-Games/atlas/` in the in-app browser. Do not push, enable Pages or change repository visibility.
