# Learn About Games v0.2 Foundation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace M0's path/review-centered contract with the approved topic-based model, five-item information architecture, About hub, and three-state appearance system.

**Architecture:** Keep Astro static generation and the existing catalog loader. Add only the collections required by v0.2, migrate existing Playtest data without inventing quality status, and isolate browser-only appearance state in a small tested helper. Preserve old public routes through explicit compatibility redirects.

**Tech Stack:** Astro 7.2, TypeScript 6.0.3, Astro Content Collections, Vitest 4, Playwright 1.62, native CSS and browser APIs.

---

## File map

- Create `src/data/knowledge-topics.json`: academic and conceptual map nodes.
- Create `src/data/capability-relations.json`: explicit `supports` and `complements` edges.
- Create `src/data/resource-topics.json`: unordered thematic resource collections.
- Create `src/lib/theme.ts`: validated appearance preference parsing.
- Create `src/components/ThemeControl.astro`: System, Light and Dark control.
- Create `src/pages/about/index.astro`: project-document hub.
- Modify `src/content.config.ts`: v0.2 schemas and enum constraints.
- Modify `src/lib/catalog/validate.ts`: v0.2 TypeScript contract and reference checks.
- Modify `src/lib/catalog/load.ts`: new collection list, no core Learning Trail collection.
- Modify `src/data/resources.json`: remove `reviewStatus`, add topic/relevance/original-language fields.
- Modify `src/data/sources.json`: add Source kind, localized summary, languages and traceable external observations.
- Modify `src/data/role-profiles.json`: middle-dot title and basis metadata.
- Modify `src/layouts/BaseLayout.astro`: five-item navigation, About disclosure and theme boot script.
- Modify `src/i18n/ui.ts`: locked Chinese and English navigation terms.
- Modify `src/pages/index.astro`: current v0.2 entry wording.
- Modify `src/pages/trails/[id].astro`: compatibility redirect to a resource topic.
- Modify `src/styles/global.css`: tokenized light/dark colors and responsive navigation.
- Test `tests/lib/catalog-validate.test.ts`, `tests/lib/theme.test.ts`, `tests/e2e/foundation-v02.spec.ts`, `tests/e2e/base-path.spec.ts`.

### Task 1: Lock the v0.2 catalog contract

- [ ] **Step 1: Write the failing catalog tests**

Extend `tests/lib/catalog-validate.test.ts` so `emptyCatalog()` includes `knowledgeTopics`, `capabilityRelations`, and `resourceTopics`, and removes `learningTrails`. Add focused tests for Source fields, canonical Work Item identity, split access/region facts, Role Profile evidence metadata, per-collection ID uniqueness and capability-only relation endpoints. Use this shape:

```ts
it('reports missing topic and capability relation references', () => {
  const catalog = emptyCatalog();
  catalog.capabilityRelations.push({
    id: 'observation-supports-playtesting',
    fromId: 'missing-observation',
    toId: 'missing-playtesting',
    type: 'supports',
    summary: localized('观察能力帮助设计和解释 Playtest。'),
  });
  catalog.resources.push({
    id: 'playtest-observation-video',
    title: localized('Playtest 观察案例'),
    summary: localized('示例资源。'),
    whyRelevant: localized('展示如何观察玩家。'),
    sourceId: 'missing-source',
    canonicalUrl: 'https://example.com/playtest-observation',
    capabilityIds: [],
    knowledgeTopicIds: ['missing-topic'],
    resourceTopicIds: ['missing-resource-topic'],
    mediaType: 'video',
    originalLanguage: 'en',
    externalSignals: [],
    accessVersions: [],
  });

  expect(validateCatalog(catalog).map(({ code }) => code)).toEqual([
    'RESOURCE_SOURCE_MISSING',
    'RESOURCE_KNOWLEDGE_TOPIC_MISSING',
    'RESOURCE_TOPIC_MISSING',
    'RESOURCE_ACCESS_VERSION_MISSING',
    'CAPABILITY_RELATION_ENDPOINT_MISSING',
    'CAPABILITY_RELATION_ENDPOINT_MISSING',
  ]);
});

it('reports a self-referential capability relation', () => {
  const catalog = emptyCatalog();
  catalog.domains.push(domainFixture);
  catalog.capabilities.push(capabilityFixture);
  catalog.capabilityRelations.push({
    id: 'playtesting-self-loop',
    fromId: 'playtesting',
    toId: 'playtesting',
    type: 'supports',
    summary: localized('无效自环。'),
  });

  expect(validateCatalog(catalog)).toContainEqual({
    code: 'CAPABILITY_RELATION_SELF_LOOP',
    collection: 'capabilityRelations',
    id: 'playtesting-self-loop',
    field: 'toId',
    targetId: 'playtesting',
  });
});
```

- [ ] **Step 2: Run the test and verify RED**

Run: `npm test -- tests/lib/catalog-validate.test.ts`

Expected: TypeScript/Vitest fails because the new collections, fields and validation codes do not exist.

- [ ] **Step 3: Implement the minimal contract**

In `src/content.config.ts`, define constrained schemas:

```ts
const capabilityRelationType = z.enum(['supports', 'complements']);
const mediaType = z.enum(['article', 'book', 'course', 'paper', 'podcast', 'talk', 'video', 'website']);
const accessModel = z.enum(['free', 'paid', 'subscription']);
const regionRestriction = z.object({
  regions: z.array(z.string().trim().min(1)).min(1),
  note: localizedText,
});
const translationKind = z.enum(['original', 'official', 'community', 'bilingual', 'subtitled']);
const sourceKind = z.enum(['creator', 'channel', 'organization', 'publisher', 'website']);
const rolePriority = z.enum(['core', 'important', 'suggested']);
const roleResponsibility = z.enum(['execute', 'contribute', 'decide', 'direct']);

const knowledgeTopics = defineCollection({
  loader: file('src/data/knowledge-topics.json'),
  schema: z.object({
    name: localizedText,
    summary: localizedText,
    domainId: z.string().trim().min(1),
  }),
});

const capabilityRelations = defineCollection({
  loader: file('src/data/capability-relations.json'),
  schema: z.object({
    fromId: z.string().trim().min(1),
    toId: z.string().trim().min(1),
    type: capabilityRelationType,
    summary: localizedText,
  }),
});

const resourceTopics = defineCollection({
  loader: file('src/data/resource-topics.json'),
  schema: z.object({
    title: localizedText,
    summary: localizedText,
    capabilityIds: z.array(z.string().trim().min(1)),
    knowledgeTopicIds: z.array(z.string().trim().min(1)),
  }),
});
```

Replace the Resource schema with unique `canonicalUrl`, `whyRelevant`, `knowledgeTopicIds`, `resourceTopicIds`, `originalLanguage`, optional traceable `externalSignals`, constrained media/access/translation fields, and at least one Access Version. Each Access Version uses `accessModel` plus optional `regionRestrictions`; do not combine region with payment state.

Expand Source with `kind`, localized `summary`, `homepage`, `languages`, and traceable `externalSignals`. Expand Role Profile with non-empty `basisLinks`, ISO `reviewedAt`, and bounded priority/responsibility enums. Update `Catalog`, validation codes and reference loops in `src/lib/catalog/validate.ts`, and update `productCollections` in `src/lib/catalog/load.ts`. IDs are unique within each collection; typed references determine their target collection. Capability Relation endpoints must resolve only against Capability IDs.

- [ ] **Step 4: Run focused tests and verify GREEN**

Run: `npm test -- tests/lib/catalog-validate.test.ts`

Expected: all catalog validation tests pass.

- [ ] **Step 5: Commit the catalog contract**

```bash
git add src/content.config.ts src/lib/catalog/validate.ts src/lib/catalog/load.ts tests/lib/catalog-validate.test.ts
git commit -m "refactor: define the v0.2 knowledge catalog"
```

### Task 2: Migrate the M0 seed without review or path semantics

- [ ] **Step 1: Add a failing data-contract test**

Add a Vitest case that loads the JSON fixtures and asserts:

```ts
expect(resources.every((resource) => !('reviewStatus' in resource))).toBe(true);
expect(resourceTopics.map(({ id }) => id)).toContain('playtesting');
expect(resources.every((resource) => resource.accessVersions.length > 0)).toBe(true);
expect(new Set(resources.map(({ canonicalUrl }) => canonicalUrl)).size).toBe(resources.length);
expect(roleProfiles.find(({ id }) => id === 'aaa-game-designer')?.title['zh-CN'])
  .toBe('AAA · Game Designer');
expect(roleProfiles.every(({ basisLinks, reviewedAt }) => basisLinks.length > 0 && reviewedAt)).toBe(true);
```

- [ ] **Step 2: Run and verify RED**

Run: `npm test -- tests/lib/catalog-validate.test.ts`

Expected: old data still contains `reviewStatus`, no resource topic exists, and the role title uses a slash.

- [ ] **Step 3: Apply the minimal data migration**

Create initial JSON arrays for `knowledge-topics.json`, `capability-relations.json`, and `resource-topics.json`. Migrate the existing Sources and both Playtest Work Items to the new Source/canonical/access contracts. Change `AAA / Game Designer` to `AAA · Game Designer`, add its public basis metadata, and constrain its entries to the approved enums. Remove `learningTrails` from the catalog loader but retain the old JSON until the compatibility route is replaced.

- [ ] **Step 4: Verify schema, references and build**

Run: `npm run build`

Expected: Astro check reports 0 errors/warnings/hints, Vitest passes, and static generation succeeds.

- [ ] **Step 5: Commit the migration**

```bash
git add src/data src/content.config.ts src/lib/catalog tests/lib/catalog-validate.test.ts
git commit -m "refactor: migrate the Playtest seed to topics"
```

### Task 3: Add the five-item navigation and About hub

- [ ] **Step 1: Write the failing browser contract**

Create `tests/e2e/foundation-v02.spec.ts`:

```ts
test('uses the approved five product destinations and groups project documents under About', async ({ page }) => {
  await page.goto('./');
  const primary = page.getByRole('navigation', { name: '主导航' });
  await expect(primary.getByRole('link')).toHaveCount(5);
  for (const [name, href] of [
    ['能力地图', '/Learn-About-Games/map/'],
    ['职业方向', '/Learn-About-Games/careers/'],
    ['成长资源', '/Learn-About-Games/resources/'],
    ['创新变迁', '/Learn-About-Games/atlas/'],
    ['关于本项目', '/Learn-About-Games/about/'],
  ] as const) {
    await expect(primary.getByRole('link', { name, exact: true })).toHaveAttribute('href', href);
  }

  await primary.getByRole('link', { name: '关于本项目' }).click();
  for (const name of ['Roadmap', 'Changelog', 'Devlog', 'Methodology', 'Contributing']) {
    await expect(page.getByRole('link', { name, exact: true })).toBeVisible();
  }
});
```

- [ ] **Step 2: Run and verify RED**

Run these separately so a build failure does not hide the browser RED:

```bash
npm run build
npx playwright test tests/e2e/foundation-v02.spec.ts --project=chromium
```

Expected: navigation has eight old links and `/careers/` plus `/about/` do not exist.

- [ ] **Step 3: Implement navigation, About and compatibility route**

Move labels into `src/i18n/ui.ts`, render exactly five top-level links in `BaseLayout.astro`, create `/about/`, create the initial `/careers/` page shell, and turn `/trails/playtesting-foundations/` into a static compatibility redirect to `/resources/topics/playtesting/`. Do not add a duplicate project-document menu at the top level. The compact navigation must open/close with named controls, return focus when closed, and leave all five destinations reachable without JavaScript. Enumerate every former top-level project-document URL and the old Trail URL in base-path coverage; each must return 200 or an intentional redirect.

- [ ] **Step 4: Verify GREEN on desktop and mobile**

Run: `npm run build && npx playwright test tests/e2e/foundation-v02.spec.ts tests/e2e/base-path.spec.ts --project=chromium --project=mobile-chromium`

Expected: both configured projects pass. Add an explicit `page.setViewportSize({ width: 320, height: 900 })` compact-width assertion rather than assuming the Pixel 7 mobile project is 320px.

- [ ] **Step 5: Commit the IA**

```bash
git add src/layouts src/pages src/i18n tests/e2e
git commit -m "feat: focus the site navigation on five user tasks"
```

### Task 4: Add System, Light and Dark appearance

- [ ] **Step 1: Write parser and browser RED tests**

Create `tests/lib/theme.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { parseThemePreference } from '../../src/lib/theme';

describe('parseThemePreference', () => {
  it.each(['system', 'light', 'dark'] as const)('accepts %s', (value) => {
    expect(parseThemePreference(value)).toBe(value);
  });

  it('falls back to system for missing or corrupt values', () => {
    expect(parseThemePreference(null)).toBe('system');
    expect(parseThemePreference('contrast')).toBe('system');
  });
});
```

Add Playwright assertions for the three options, `data-theme`, reload persistence, corrupt localStorage fallback, and no-JS system fallback.

- [ ] **Step 2: Run and verify RED**

Run each command separately:

```bash
npm test -- tests/lib/theme.test.ts
npm run build
npx playwright test tests/e2e/foundation-v02.spec.ts --project=chromium
```

Expected: `src/lib/theme.ts` and the appearance control do not exist.

- [ ] **Step 3: Implement the minimal theme system**

Use this contract in `src/lib/theme.ts`:

```ts
export type ThemePreference = 'system' | 'light' | 'dark';

export function parseThemePreference(value: string | null): ThemePreference {
  return value === 'light' || value === 'dark' || value === 'system' ? value : 'system';
}
```

Render a server-disabled select in `ThemeControl.astro`, enable it only after binding, store `learn-about-games:theme:v1`, and update `document.documentElement.dataset.theme`. Add a small inline head script in `BaseLayout.astro` so explicit light/dark choice is applied before the stylesheet paints. Under no JavaScript, CSS follows `prefers-color-scheme`.

Convert `global.css` color literals to the exact semantic tokens in `DESIGN.md`. Do not change map layout in this task.

- [ ] **Step 4: Verify GREEN in all three states**

Run: `npm test -- tests/lib/theme.test.ts && npm run build && npx playwright test tests/e2e/foundation-v02.spec.ts --project=chromium --project=mobile-chromium`

Expected: unit and E2E tests pass, select and focus contrast remain readable, and no-JS content remains available. Browser tests cover System under both light/dark `emulateMedia`, explicit Light while the system is dark, explicit Dark while the system is light, reload persistence, and the no-JS system fallback.

- [ ] **Step 5: Commit the theme system**

```bash
git add DESIGN.md src/lib/theme.ts src/components/ThemeControl.astro src/layouts/BaseLayout.astro src/styles/global.css tests
git commit -m "feat: add system light and dark appearance"
```

### Task 5: Foundation verification and continuity

- [ ] **Step 1: Update public and continuity documents**

Update `README.md`, `METHODOLOGY.md`, `CONTRIBUTING.md`, `ROADMAP.md`, `CHANGELOG.md`, the v0.2 decision summary and partial transcript with actual completed behavior and exact verification counts. Do not move changes into a released Changelog section before deployment.

- [ ] **Step 2: Run the complete foundation gate**

Run:

```bash
npm run check
npm test
npm run build
CI=1 npm run test:e2e
git diff --check
```

Expected: zero diagnostics, zero failed tests, a successful static build, and no diff whitespace errors.

- [ ] **Step 3: Perform visual review**

Capture and inspect 1440px and an explicitly set 320px viewport of home, About, Resources and the theme control in System-resolved Light and explicit Dark. Check exact navigation labels, single-line desktop nav, mobile menu, contrast and horizontal overflow.

- [ ] **Step 4: Commit the verified foundation milestone**

```bash
git add README.md METHODOLOGY.md CONTRIBUTING.md ROADMAP.md CHANGELOG.md AGENTS.md CLAUDE.md docs DESIGN.md src tests
git commit -m "docs: record the v0.2 foundation milestone"
```
