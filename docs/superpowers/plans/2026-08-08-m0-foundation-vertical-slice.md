# M0 Foundation Vertical Slice Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: use `superpowers:subagent-driven-development` (recommended) or `superpowers:executing-plans`. Use `superpowers:test-driven-development` for behavior changes and `superpowers:verification-before-completion` before any completion claim.

**Goal:** Deploy the smallest real Learn About Games site that proves four decisions: a newcomer can see a useful map, a practitioner can reach a specific learning item, a role/context lens remains a reference rather than a score, and Game Innovation Atlas can show evidence-backed evolution inside the same product.

**Architecture:** Astro 7 generates a static Chinese-first site for the GitHub Pages project path `/Learn-About-Games/`. Build-time JSON collections keep different entity types separate, but M0 validates only references that current pages use. Native browser scripts handle language filtering and local progress; no framework island, account, database, CMS, analytics, hosted search, or graph library is introduced.

**Tech stack:** Astro 7.2.0, TypeScript 7.0.2, Astro Content Collections, Vitest 4.1.10, Playwright 1.62.1, npm, GitHub Actions, GitHub Pages.

---

## What M0 proves

1. The homepage explains 看地图、找位置、向前走 and exposes a real map skeleton.
2. A visitor can follow 迭代与验证 → Playtest → Playtest 基础 → the exact GMTK video and bilingual PlayWithExperiences article.
3. Language filtering uses consumable access versions: the bilingual article appears under Chinese and English; the GMTK video appears under English only.
4. An `AAA / Game Designer` reference profile labels selected capabilities without calculating a person or role score.
5. Personal Playtest progress survives refresh in localStorage and remains visually independent from role importance.
6. Atlas shows all eight framework categories and one Roguelike seed with eight games, one Innovation node, relation types, evidence states, and source links.
7. Roadmap, Changelog, Devlog, Methodology, contribution guidance, decision summary, and transcript keep the project publicly resumable.
8. The built site and browser tests work under `/Learn-About-Games/`.

M0 is not the formal content-complete first release. It does not claim 40–60 nodes, 300 candidate resources, 100 reviewed resources, 10–15 trails, 3–4 curated profiles, a full English interface, or a generalized Atlas network.

## Simplicity budget

Complexity must be justified by a current user journey, an already observed failure, GitHub Pages deployment, or a misleading data relationship. M0 therefore includes only:

- schema checks for fields rendered now;
- reference checks for missing IDs and missing Atlas evidence;
- one deterministic language filter;
- one versioned local progress record with safe corrupt-data fallback;
- browser tests for the four real journeys above.

M0 explicitly defers URL canonicalization beyond exact-string comparison, automatic causal/time inference, progress import/export, account sync, schema migration machinery, generalized scoring, recommendation ranking, third-party feedback aggregation, force graphs, and exhaustive impossible-state handling. Add any of these only after real data or a failing acceptance test proves the need.

Adversarial review is a subtraction tool here: remove misleading scores, false causal claims, mixed visual meanings, and unnecessary machinery. It is not permission to enumerate every theoretical edge case.

## Entity and visual invariants

- Domain is a map region; Capability is an actionable node; Resource is a concrete work item; Source is its creator/publisher.
- An access version answers which language and URL can actually be consumed.
- A role profile references capabilities in one production context; it is not a standard answer.
- Role importance and personal progress never share color, shape, label, or storage.
- Atlas Game, Innovation, Relation, and Evidence remain different objects.
- Similarity never implies influence; every displayed Atlas relation has evidence and a status.
- Atlas remains a section of Learn About Games.
- Roadmap records direction, Changelog records shipped facts, and Devlog explains material choices.
- The repository is the continuity source; the original chat UI is not required.

## Model-routing rule

Before an implementation wave, the lead may consult current task-specific data from [Codex Radar](https://deng.codexradar.com/) and official availability/pricing pages. Record the check date and model/effort/task context. Third-party IQ or aggregate rank is only an initial routing signal; task ambiguity, verification cost, permissions, current tool availability, and concrete failures control escalation.

As of 2026-08-08 this environment exposes Sol and Terra, not Luna. Luna may be used later only if the runtime actually exposes it; its suitable work is mechanical classification, extraction, formatting, and narrow QA with Terra/Sol sampling. “Unlimited text chats” for ChatGPT Free does not mean a free Codex sub-agent or free API.

| Work | Initial owner | Reason |
|---|---|---|
| Product semantics, schema boundary, visual meaning, final acceptance | lead / Sol | ambiguous cross-cutting judgment |
| Scaffold, deterministic helpers, CI | Terra / medium | bounded official configuration |
| Visual shell and responsive map | Sol / high with frontend design skill | one coherent visual owner |
| Playtest content wiring, profile, local progress | Terra / high | fixed interfaces and browser-observable acceptance |
| Atlas source extraction | Terra / medium, read-only | bounded evidence collection |
| Atlas causal wording and status approval | lead / Sol | evidence strength cannot be delegated mechanically |

Agents must not edit overlapping files concurrently. A failed test or missing evidence may justify escalation; theoretical difficulty alone does not.

## File map

### Foundation

- `package.json`, `package-lock.json`, `.nvmrc`
- `astro.config.mjs`, `tsconfig.json`, `src/env.d.ts`
- `vitest.config.ts`, `playwright.config.ts`
- `src/lib/site-path.ts`, `src/i18n/ui.ts`

### Build-time data

- `src/content.config.ts`
- `src/data/domains.json`
- `src/data/capabilities.json`
- `src/data/sources.json`
- `src/data/resources.json`
- `src/data/learning-trails.json`
- `src/data/role-profiles.json`
- `src/data/atlas-categories.json`
- `src/data/atlas-nodes.json`
- `src/data/atlas-evidence.json`
- `src/data/atlas-relations.json`
- `src/data/atlas-themes.json`
- `src/lib/catalog/load.ts`, `src/lib/catalog/validate.ts`

### Pages and behavior

- `src/layouts/BaseLayout.astro`, `src/styles/global.css`
- `src/pages/index.astro`, `src/pages/map/index.astro`
- `src/pages/capabilities/[id].astro`, `src/pages/trails/[id].astro`
- `src/pages/resources/index.astro`, `src/pages/atlas/index.astro`
- `src/pages/project/[id].astro`, `src/pages/devlog/index.astro`, `src/pages/devlog/[id].astro`
- `src/components/MapExplorer.astro`, `ResourceExplorer.astro`, `CapabilityProgress.astro`, `AtlasSeed.astro`
- `src/lib/progress.ts`

### Public continuity

- `README.md`, `METHODOLOGY.md`, `CONTRIBUTING.md`
- `ROADMAP.md`, `CHANGELOG.md`, `docs/devlog/`
- `AGENTS.md`, `CLAUDE.md`, `docs/journal/`

---

### Task 1: Establish a testable GitHub Pages foundation

**Files:**
- Create: `package.json`, `package-lock.json`, `.nvmrc`
- Create: `astro.config.mjs`, `tsconfig.json`, `src/env.d.ts`
- Create: `vitest.config.ts`, `playwright.config.ts`
- Create: `src/lib/site-path.ts`, `src/i18n/ui.ts`
- Test: `tests/lib/site-path.test.ts`

- [ ] **Step 1: Create the pinned manifest**

Use this direct dependency set and no UI framework or server adapter:

```json
{
  "name": "learn-about-games",
  "version": "0.0.0",
  "private": true,
  "type": "module",
  "engines": { "node": ">=24 <26" },
  "scripts": {
    "dev": "astro dev",
    "check": "astro check",
    "test": "vitest run",
    "build": "npm run check && npm run test && astro build",
    "preview": "astro preview",
    "test:e2e": "playwright test"
  },
  "dependencies": { "astro": "7.2.0" },
  "devDependencies": {
    "@astrojs/check": "0.9.10",
    "@playwright/test": "1.62.1",
    "typescript": "7.0.2",
    "vitest": "4.1.10"
  }
}
```

Write `24` to `.nvmrc`, run `npm install`, and keep the generated lockfile.

- [ ] **Step 2: Write the failing project-path test**

`tests/lib/site-path.test.ts` must assert:

```ts
expect(joinBase('/Learn-About-Games/', '')).toBe('/Learn-About-Games/');
expect(joinBase('/Learn-About-Games/', '/map/')).toBe('/Learn-About-Games/map/');
expect(joinBase('/Learn-About-Games/', 'resources/')).toBe('/Learn-About-Games/resources/');
```

Run `npm test -- tests/lib/site-path.test.ts`; expect failure because the module does not exist.

- [ ] **Step 3: Implement only the deployment contract**

`astro.config.mjs` uses:

```js
export default defineConfig({
  site: 'https://playwithexperiences.github.io',
  base: '/Learn-About-Games',
  output: 'static',
  trailingSlash: 'always',
});
```

`src/lib/site-path.ts` exports the pure `joinBase(base, path)` used by the test and `sitePath(path)` using `import.meta.env.BASE_URL`. It strips only leading/trailing slashes needed for the join; it does not attempt URL canonicalization.

`src/i18n/ui.ts` defines `zh-CN` and `en` labels for product name, 看地图、找位置、向前走、资源库、游戏创新沿革、路线图. Chinese remains the active interface.

`playwright.config.ts` uses a preview server and base URL `http://127.0.0.1:4321/Learn-About-Games/`, with desktop Chromium and Pixel 7 projects.

- [ ] **Step 4: Verify and commit**

Run:

```bash
npm test -- tests/lib/site-path.test.ts
npm run check
```

Expected: both exit 0.

```bash
git add package.json package-lock.json .nvmrc astro.config.mjs tsconfig.json src/env.d.ts vitest.config.ts playwright.config.ts src/lib/site-path.ts src/i18n/ui.ts tests/lib/site-path.test.ts
git commit -m "chore: scaffold static Astro site"
```

### Task 2: Put a real map skeleton on screen immediately

**Files:**
- Create: `src/content.config.ts`
- Create: `src/data/domains.json`, `src/data/capabilities.json`
- Create empty arrays in the remaining `src/data/*.json` files from the file map
- Create: `src/lib/catalog/load.ts`, `src/lib/catalog/validate.ts`
- Create: `src/layouts/BaseLayout.astro`, `src/styles/global.css`
- Create: `src/components/MapExplorer.astro`
- Create: `src/pages/index.astro`, `src/pages/map/index.astro`
- Create: `README.md`, `METHODOLOGY.md`, `CONTRIBUTING.md`
- Create: `src/pages/project/[id].astro`, `src/pages/devlog/index.astro`, `src/pages/devlog/[id].astro`
- Test: `tests/e2e/visible-skeleton.spec.ts`

- [ ] **Step 1: Invoke `design-taste-frontend` before visual work**

State the visual contract before editing: Domain is a section, Capability is a node/card, Resource is a card, Atlas Relation is an evidence-labelled connection. Career labels and progress states require separate encodings. Mobile is an outline, never a scaled-down desktop graph. No remote font or generated decoration is required for M0.

- [ ] **Step 2: Define the minimum data contract**

Use Astro `file()` loaders and Zod in `src/content.config.ts`. Every array entry has a stable `id`. Required rendered fields are exact:

| Collection | Required fields |
|---|---|
| domains | `id`, localized `name`, localized `summary`, integer `order` |
| capabilities | `id`, localized `name`, localized `summary`, `domainId` |
| sources | `id`, localized `name`, `homepage` |
| resources | `id`, localized `title`, localized `summary`, `sourceId`, `capabilityIds`, `mediaType`, `reviewStatus`, `accessVersions[]` with `language`, `url`, `access`, `translationKind`, `checkedAt` |
| learningTrails | `id`, localized `title`, localized `summary`, `capabilityId`, `resourceIds`, `concepts`, `exercises`, `selfChecks` |
| roleProfiles | `id`, localized `title`, `roleId`, `productionContextId`, localized `basis`, localized `caveats`, `capabilities[]` with `capabilityId`, `priority`, `responsibility` |
| atlasCategories | `id`, localized `name`, localized `summary`, integer `order` |
| atlasNodes | `id`, `kind` (`game` or `innovation`), localized `name`, localized `summary`, integer `year` |
| atlasEvidence | `id`, localized `title`, `url`, localized `summary` |
| atlasRelations | `id`, `fromId`, `toId`, `type`, `evidenceStatus`, non-empty `evidenceIds`, localized `summary` |
| atlasThemes | `id`, localized `title`, localized `summary`, `nodeIds`, `relationIds` |

Localized text is exactly `{ "zh-CN": string, "en"?: string }`. Register a `projectDocs` glob for `{README,METHODOLOGY,CONTRIBUTING,ROADMAP,CHANGELOG}.md` at repository root and a `devlog` glob for `docs/devlog/**/*.md`; these two Markdown collections need no product-data fields beyond their existing frontmatter and body.

`validateCatalog()` checks only: capability domain IDs; resource source/capability IDs; trail capability/resource IDs; profile capability IDs; Atlas relation endpoint/evidence IDs. Return all current issues with stable codes and fail the build. Do not add duplicate-URL, chronology, migration, or fuzzy-identity logic.

- [ ] **Step 3: Add the visible framework**

Seed these nine ordered domains: `experience-design`, `gameplay-challenges`, `narrative`, `aesthetics`, `production`, `iteration`, `leadership-collaboration`, `product-business`, `innovation`.

Seed these nine capability nodes so every domain has a visible direction:

| ID | Chinese label | Domain |
|---|---|---|
| experience-framing | 体验目标与拆解 | experience-design |
| core-loop | 核心循环 | gameplay-challenges |
| narrative-architecture | 叙事架构 | narrative |
| aesthetic-direction | 美学与表现方向 | aesthetics |
| task-breakdown | 任务拆解与落地 | production |
| playtesting | Playtest | iteration |
| cross-discipline-communication | 跨职能沟通 | leadership-collaboration |
| audience-positioning | 受众与定位 | product-business |
| innovation-literacy | 游戏创新沿革素养 | innovation |

Only Playtest is expanded in M0; the other cards clearly say the learning trail is not yet curated. They are a map skeleton, not fake completeness.

- [ ] **Step 4: Write the failing visible-page test, then implement**

The browser test checks that `/Learn-About-Games/` contains 看地图、找位置、向前走, all nine domain headings, and a Playtest link. It also checks navigation to Roadmap, Changelog, Devlog, Methodology, and Contributing.

Run:

```bash
npx playwright install chromium
npm run build
npm run test:e2e -- tests/e2e/visible-skeleton.spec.ts --project=chromium
```

Expect failure before the pages exist. Then implement `BaseLayout`, homepage, map, repository-backed project-doc/devlog routes, `README.md`, `METHODOLOGY.md`, and `CONTRIBUTING.md`. The homepage must call `loadCatalog()` so invalid references fail every production build.

- [ ] **Step 5: Keep the first design restrained and usable**

Use one warm neutral background, one text scale, one accent for navigation, semantic borders, visible keyboard focus, a skip link, and `prefers-reduced-motion`. Confirm content is usable at 320px. Do not introduce animation choreography, a graph canvas, remote imagery, or a design-system abstraction beyond CSS tokens actually used by these pages.

- [ ] **Step 6: Verify the first visible result and commit**

Run `npm run build` and the visible skeleton test. Open the built page in the browser for visual inspection before continuing.

```bash
git add src README.md METHODOLOGY.md CONTRIBUTING.md tests/e2e/visible-skeleton.spec.ts
git commit -m "feat: publish the initial capability map skeleton"
```

### Task 3: Complete the Playtest learning vertical slice

**Files:**
- Modify: `src/data/sources.json`, `resources.json`, `learning-trails.json`
- Create: `src/pages/capabilities/[id].astro`, `src/pages/trails/[id].astro`, `src/pages/resources/index.astro`
- Create: `src/components/ResourceExplorer.astro`
- Test: `tests/e2e/playtest-flow.spec.ts`

- [ ] **Step 1: Add only verified seed items**

Create two Source entries: Game Maker's Toolkit and PlayWithExperiences.

Create two Work Item entries:

1. GMTK, `Valve's “Secret Weapon”`, `https://www.youtube.com/watch?v=9Yomqk0C6kE`, original/available language `en`, access `free`, capability `playtesting`.
2. PlayWithExperiences, `如何进行好的 Playtest`, `https://medill-east.github.io/2025/08/24/20250824-how-to-run-a-good-playtest/`, original language `zh-CN`, consumable languages `zh-CN` and `en`, translation kind `bilingual`, access `free`, capability `playtesting`.

Use `checkedAt: 2026-08-08`. Keep Source and Work Item separate. Do not add public scores, invented comments, or whole-channel links as learning steps.

- [ ] **Step 2: Add one trail with executable learning content**

Create `playtesting-foundations` with:

- concepts: 明确测试目标、尽早且频繁地测试、闭嘴观察避免干预、把反馈当作数据而非设计命令;
- resources in order: GMTK case first, bilingual practical framework second;
- exercises: write one observable falsifiable test goal; conduct one five-minute observation without prompting;
- self-checks: separate player feeling/problem diagnosis/solution suggestion; explain how participant and timing affect results;
- a visible caveat that this is a starting reference, not certification.

- [ ] **Step 3: Write the failing real-journey test**

The test follows homepage → map → Playtest → Playtest 基础 and asserts both exact outbound resource URLs. It then visits Resources and verifies:

- `zh-CN` shows the bilingual article but hides GMTK;
- `en` shows both;
- no-JavaScript content still lists all resources.

- [ ] **Step 4: Implement pages and the smallest filter**

Generate capability and trail routes from validated collections. `ResourceExplorer.astro` renders all items server-side and uses one native `<select>` plus `data-languages` for client filtering. Announce the result count. Do not create a search service, search index, fuzzy matcher, tag grammar, or pagination in M0.

- [ ] **Step 5: Verify and commit**

Run `npm run build` and the Playtest browser test.

```bash
git add src/data src/pages/capabilities src/pages/trails src/pages/resources src/components/ResourceExplorer.astro tests/e2e/playtest-flow.spec.ts
git commit -m "feat: add the Playtest learning vertical slice"
```

### Task 4: Add a reference lens and independent local progress

**Files:**
- Modify: `src/data/role-profiles.json`, `src/components/MapExplorer.astro`, `src/pages/capabilities/[id].astro`
- Create: `src/lib/progress.ts`, `src/components/CapabilityProgress.astro`
- Test: `tests/lib/progress.test.ts`, `tests/e2e/profile-progress.spec.ts`

- [ ] **Step 1: Encode one explicitly contextual profile**

Create `aaa-game-designer` with `roleId: game-designer`, `productionContextId: aaa`, basis and caveats explaining the maintainer's AAA background and that indie/solo capability polygons differ. Use only categorical labels:

- Playtest: `core`, `execute-and-interpret`;
- 核心循环: `core`, `execute`;
- 体验目标与拆解: `important`, `execute`;
- 任务拆解与落地: `important`, `contribute`;
- 跨职能沟通: `important`, `contribute`;
- 叙事架构 and 美学与表现方向: `suggested`, `understand`.

No total, percentage, radar area, or person score is allowed.

- [ ] **Step 2: Test and implement a minimal progress record**

Progress states are exactly `unseen`, `understood`, `practiced`, `used-in-project`, `can-guide`. The storage key is `learn-about-games:progress:v1`. `parseProgressStore(null)` and corrupt JSON return an empty version-1 store; valid states survive. Do not add import, export, cloud sync, migrations beyond the version field, or cross-device behavior.

- [ ] **Step 3: Prove the encodings remain independent**

The browser test applies `AAA / Game Designer`, verifies categorical role labels, sets Playtest to `practiced`, refreshes, and verifies it remains. It must assert the progress control remains visible when the role lens is cleared and that no numeric score appears.

- [ ] **Step 4: Verify and commit**

Run the progress unit test, build, and profile/progress browser test.

```bash
git add src/data/role-profiles.json src/lib/progress.ts src/components src/pages/capabilities tests/lib/progress.test.ts tests/e2e/profile-progress.spec.ts
git commit -m "feat: add reference profile and local progress"
```

### Task 5: Add one evidence-backed Atlas seed

**Files:**
- Modify: `src/data/atlas-categories.json`, `atlas-nodes.json`, `atlas-evidence.json`, `atlas-relations.json`, `atlas-themes.json`
- Create: `src/components/AtlasSeed.astro`, `src/pages/atlas/index.astro`
- Test: `tests/e2e/atlas.spec.ts`

- [ ] **Step 1: Add the complete category framework**

Use exactly eight categories: 玩法、技术、控制与界面、叙事、视听、社交、生产方式、发行与商业. Categories are a framework; M0 does not imply equal content coverage.

- [ ] **Step 2: Add the reviewed theme**

Theme title: `从 Rogue 的随机地城与单局死亡，到跨类型的 run-based 变体`.

Game nodes: Rogue, Hack, NetHack, Moria, Angband, Diablo, Spelunky, Hades. Innovation node: `roguelike-run-structure`. Use simple release years for ordering; do not claim historical primacy from the year field.

Use these reviewed evidence URLs:

- `https://wichman.org/roguehistory.html`
- `https://www.nethack.org/download/LICENSE_HISTORY.html`
- `https://github.com/NetHack/NetHack/blob/NetHack-5.0.0_Released/dat/history`
- `https://umoria.org/history`
- `https://raw.githubusercontent.com/angband/angband/master/docs/version.rst`
- `https://www.rpgfan.com/feature/david-brevik-interview/`
- `https://www.rockpapershotgun.com/igf-factor-2012-spelunky`
- `https://www.gamedeveloper.com/design/roguelikes-and-narrative-design-with-i-hades-i-creative-director-greg-kasavin`
- `https://www.supergiantgames.com/blog/hades-faq/`

- [ ] **Step 3: Encode only seven defensible relations**

| From | To | Type | Status |
|---|---|---|---|
| Rogue | Hack | derived-variant | confirmed |
| Hack | NetHack | derived-variant | confirmed |
| Rogue | Moria | direct-influence | confirmed |
| Moria | Angband | derived-variant | confirmed |
| Angband | Diablo | fusion | confirmed |
| roguelike-run-structure | Spelunky | fusion | confirmed |
| Spelunky | Hades | direct-influence | confirmed |

The lead manually approves every causal verb. Do not call Rogue the absolute first Roguelike; do not describe Diablo as a complete traditional Roguelike descendant; describe Spelunky → Hades as documented design/narrative inspiration, not code inheritance.

- [ ] **Step 4: Test and implement the simple evidence view**

The browser test reaches Atlas through shared navigation, sees all eight categories, eight Game labels, one Innovation label, seven relation cards, evidence-status labels, and source links. It asserts no heading calls Atlas a separate project.

Render a chronological list plus relation cards. Game, Innovation, and Evidence use distinct labels/shapes. Do not add graph physics, zoom/pan, automatic layout, or speculative similarity edges.

- [ ] **Step 5: Verify and commit**

Run `npm run build` and the Atlas browser test.

```bash
git add src/data/atlas-*.json src/components/AtlasSeed.astro src/pages/atlas tests/e2e/atlas.spec.ts
git commit -m "feat: add evidence-backed Atlas seed"
```

### Task 6: Verify and deploy the same static output

**Files:**
- Create: `tests/e2e/base-path.spec.ts`
- Create: `.github/workflows/deploy.yml`
- Modify only if a real test requires it: `playwright.config.ts`, `package.json`, `package-lock.json`

- [ ] **Step 1: Add one project-path acceptance test**

Check visible internal homepage links begin with `/Learn-About-Games/`. Request map, one capability, one trail, resources, Atlas, one project document, and one built asset; each must return 200. This is the only M0 link-integrity test—do not build a crawler.

- [ ] **Step 2: Add the GitHub Pages workflow**

Use checkout, Node 24 with npm cache, `npm ci`, Chromium installation, `npm run build`, Chromium tests, Pages configure/upload/deploy. Use current official action majors already verified during planning: `actions/checkout@v7`, `actions/setup-node@v7`, `actions/configure-pages@v6`, `actions/upload-pages-artifact@v5`, `actions/deploy-pages@v5`. Grant `pages: write` and `id-token: write` only to deployment.

- [ ] **Step 3: Run the full local gate**

```bash
npm run check
npm test
npm run build
npm run test:e2e -- --project=chromium
npm run test:e2e -- --project=mobile-chromium
git diff --check
```

Expected: every command exits 0 under the project base path.

- [ ] **Step 4: Commit**

```bash
git add tests/e2e/base-path.spec.ts .github/workflows/deploy.yml playwright.config.ts package.json package-lock.json
git commit -m "ci: verify and deploy GitHub Pages site"
```

### Task 7: Adversarial acceptance and continuity handoff

**Files:**
- Modify: `README.md`, `ROADMAP.md`, `CHANGELOG.md`, `AGENTS.md`, `CLAUDE.md`
- Create: `docs/devlog/2026-08-08-m0-vertical-slice.md`
- Modify: `docs/journal/2026-08-08-learn-about-games-decision-summary.md`
- Modify: `docs/journal/2026-08-08-learn-about-games-transcript.md`

- [ ] **Step 1: Inspect the real rendered result**

Verify desktop and 320px/mobile rendering. Answer with screenshots or browser evidence:

- Can a newcomer explain the map and choose Playtest without instruction?
- Can a practitioner reach an exact item rather than a whole channel?
- Does language filtering describe consumable access?
- Are role labels and progress unmistakably independent?
- Does Atlas expose evidence and uncertainty inside the same product?

Fix misleading wording, inaccessible navigation, or broken current paths. Do not expand scope while reviewing.

- [ ] **Step 2: Update the public and AI histories**

- Changelog: only shipped behavior.
- Roadmap: move an item only after deployment evidence exists.
- Devlog: why M0 deliberately used a thin slice and what remains deferred.
- Decision summary: state, decisions/reasons, changed files, verification, incidents, unresolved questions, exact next actions.
- Transcript: append the accessible dialogue range; label any unavailable range as partial.
- `AGENTS.md` and `CLAUDE.md`: keep the latest summary as the first handoff link.

The handoff test is that a fresh AI without chat access can explain origin → history → current verified state → next direction without guessing.

- [ ] **Step 3: Scan filenames without printing secret values**

```bash
secret_scan_pattern='api[_-]?''key|client[_-]?''secret|pass''word|private ''key|BEGIN [A-Z ]+ ''KEY'
rg -l -i "$secret_scan_pattern" . -g '!node_modules/**' -g '!.git/**' -g '!dist/**'
```

Investigate any returned filename; never print matching values.

- [ ] **Step 4: Re-run the Task 6 gate and commit the verified milestone**

```bash
git add README.md ROADMAP.md CHANGELOG.md docs AGENTS.md CLAUDE.md
git commit -m "docs: record verified M0 milestone"
```

## Completion evidence

M0 is complete only after:

- the GitHub Pages workflow deploys the project-path build;
- unit, desktop Chromium, and mobile Chromium checks pass;
- the Playtest flow reaches both verified items and filters their access languages correctly;
- the profile has no score and progress survives refresh independently;
- Atlas contains eight categories, eight Game nodes, one Innovation node, seven reviewed relations, and evidence links;
- public project history and AI handoff documents reflect the deployed state;
- no deferred complexity was added without a failing current requirement.

## Follow-on plans after M0

Write separate plans only after the M0 interface is observed in real use:

1. Expand the map to 40–60 reviewed knowledge/capability nodes and 10–15 trails.
2. Build the 300-candidate / 100-reviewed resource pipeline and contribution review loop.
3. Add further role × production-context profiles, including Creative Director and indie/solo perspectives.
4. Add more Atlas themes and only then evaluate timeline/network interaction.
5. Add a complete English interface.
