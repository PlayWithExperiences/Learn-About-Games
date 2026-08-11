# Innovation Atlas Early History Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add an evidence-backed 1950s-1970s Atlas slice leading to Pong without inventing firsts or unsupported causal edges.

**Architecture:** Research claims are normalized into the existing node, relation, Evidence, Tag, and Theme collections. The schema gains only the entity and relation distinctions required by the verified slice. Validators keep claim and reference boundaries explicit.

**Tech Stack:** JSON data, Zod content schema, TypeScript validator, Vitest, Astro, Playwright.

---

### Task 1: Finish and document source verification

**Files:**
- Create: `docs/research/2026-08-11-early-electronic-games-atlas.md`

- [ ] **Step 1: Verify sources with Agent Reach**

Run:

```bash
agent-reach doctor --json
```

Use Exa search and Jina or the official page to verify Brookhaven, Computer History Museum, Smithsonian, Stanford, patent, and oral-history sources. Save temporary raw output only under `/tmp/`.

- [ ] **Step 2: Record one bounded claim per evidence row**

The notebook records source title, institution/author, language, publication date when known, checked date, stable URL or archive URL, locator, supported claim, and rejected overclaims.

- [ ] **Step 3: Run notebook static checks and commit**

```bash
rg -n "TBD|TODO|Pong.*first video game|first commercial video game" docs/research/2026-08-11-early-electronic-games-atlas.md
git diff --check
git add docs/research/2026-08-11-early-electronic-games-atlas.md
git commit -m "research: document the early electronic game line"
```

Expected: no placeholders or unqualified first claims.

### Task 2: Extend the smallest honest ontology

**Files:**
- Modify: `src/content.config.ts`
- Modify: `src/lib/catalog/validate.ts`
- Modify: `tests/lib/catalog-validate.test.ts`
- Modify: `tests/lib/atlas-network.test.ts`

- [ ] **Step 1: Write schema and validator RED tests**

Add the entity kinds needed by the approved slice and explicit relation types such as:

```ts
type AtlasNodeKind =
  | 'experimental-apparatus'
  | 'experimental-program'
  | 'system-prototype'
  | 'commercial-hardware'
  | 'game'
  | 'innovation'
  | 'category';
```

Add only relation types demonstrated by notebook claims, for example `prototype-to-product`, `commercialized-as`, and `design-response`. Test directionality, evidence requirement, date constraints, and invalid kind/type rejection.

- [ ] **Step 2: Verify RED**

```bash
npm test -- tests/lib/catalog-validate.test.ts tests/lib/atlas-network.test.ts
```

- [ ] **Step 3: Implement schema and validator GREEN**

Keep existing node and relation values valid. Add no migration layer and no generic free-form kind.

- [ ] **Step 4: Verify and commit**

```bash
npm test -- tests/lib/catalog-validate.test.ts tests/lib/atlas-network.test.ts
git add src/content.config.ts src/lib/catalog/validate.ts tests/lib/catalog-validate.test.ts tests/lib/atlas-network.test.ts
git commit -m "feat: distinguish early Atlas entity types"
```

### Task 3: Add nodes, relations, and Evidence

**Files:**
- Modify: `src/data/atlas-nodes.json`
- Modify: `src/data/atlas-relations.json`
- Modify: `src/data/atlas-evidence.json`
- Modify: `src/data/atlas-tags.json`
- Modify: `src/data/atlas-themes.json`
- Modify: `tests/lib/catalog-data.test.ts`

- [ ] **Step 1: Write exact data RED tests**

Lock the approved IDs, kinds, dates, relation tuples, Evidence references, and no-overclaim copy. Assert that every new Evidence is used and every new relation has one or more supporting Evidence IDs.

- [ ] **Step 2: Verify RED**

```bash
npm test -- tests/lib/catalog-data.test.ts tests/lib/catalog-validate.test.ts
```

- [ ] **Step 3: Add the evidence-complete slice**

Add Tennis for Two, Spacewar!, Brown Box / TV Game Unit #7, Galaxy Game, Computer Space, Magnavox Odyssey, Odyssey Table Tennis, Pong, Home Pong, and only a supported formation node. Add only relations supported by the notebook.

- [ ] **Step 4: Verify data closure and commit**

```bash
npm test -- tests/lib/catalog-data.test.ts tests/lib/catalog-validate.test.ts tests/lib/atlas-network.test.ts
npm run check
git add src/data/atlas-nodes.json src/data/atlas-relations.json src/data/atlas-evidence.json src/data/atlas-tags.json src/data/atlas-themes.json tests/lib/catalog-data.test.ts
git commit -m "content: add the early electronic game history slice"
```

### Task 4: Render new kinds without losing Atlas semantics

**Files:**
- Modify: `src/components/AtlasNetwork.astro`
- Modify: `src/lib/atlas-network.ts`
- Modify: `src/styles/global.css`
- Modify: `tests/e2e/atlas.spec.ts`

- [ ] **Step 1: Write browser RED tests**

Assert all new node kinds have unique textual labels and explainable shapes, the chronological projection includes the 1950s-1970s, each new relation detail exposes its Evidence references, and the mobile outline reaches every new node and relation exactly once.

- [ ] **Step 2: Verify RED after fresh build**

```bash
npm run build
CI=1 npx playwright test tests/e2e/atlas.spec.ts --project=chromium --project=mobile-chromium
```

- [ ] **Step 3: Implement minimal render support**

Extend node class and legend mapping. Do not change existing Game, Innovation, Category, relation direction, theme, dialog, Evidence index, search, sort, or viewport ownership contracts.

- [ ] **Step 4: Verify and visually inspect**

Run the targeted tests and capture both ends of the desktop time network plus the mobile period outline in Light and Dark. Confirm text, shapes, dates, arrows, relations, and evidence are readable without collisions or page overflow.

- [ ] **Step 5: Commit**

```bash
git add src/components/AtlasNetwork.astro src/lib/atlas-network.ts src/styles/global.css tests/e2e/atlas.spec.ts
git commit -m "feat: render the early Atlas history line"
```
