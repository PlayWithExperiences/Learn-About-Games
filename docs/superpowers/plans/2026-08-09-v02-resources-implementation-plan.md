# Learn About Games v0.2 Learning Resources Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Publish a searchable, multilingual catalog of roughly 100-150 real game-design resources organized by capability and topic without site-authored ratings, review tiers or a mandatory learning path.

**Architecture:** Research is performed outside the runtime UI, normalized into static Source, Work Item and Access Version records, and verified at build time. Resource discovery is client-enhanced but server-readable: every item exists in HTML, while filters only alter visibility. External observations are static snapshots with provenance and dates, never live third-party calls.

**Tech Stack:** agent-reach for public-source research, Astro Content Collections, TypeScript, static JSON, native browser filters, Vitest and Playwright.

---

## File map

- Create `docs/research/2026-08-09-resource-intake.md`: research batches, inclusion facts and unresolved links.
- Modify `src/data/sources.json`: creator/channel/organization/site records.
- Modify `src/data/resources.json`: 100-150 normalized Work Items.
- Modify `src/data/resource-topics.json`: at least twelve unordered topic collections.
- Create `src/lib/resource-filter.ts`: pure multi-filter projection.
- Modify `src/components/ResourceExplorer.astro`: topic-first browsing and factual filters.
- Create `src/pages/sources/[id].astro`: discoverable Source detail and its Work Items.
- Create `src/pages/resources/topics/[id].astro`: shareable topic collection pages.
- Modify `src/pages/resources/index.astro`, `src/pages/capabilities/[id].astro`, `src/pages/topics/[id].astro`.
- Modify `src/styles/global.css`.
- Test `tests/lib/resource-filter.test.ts`, `tests/lib/catalog-validate.test.ts`, `tests/e2e/resources-v02.spec.ts`, `tests/e2e/base-path.spec.ts`.

### Task 1: Collect independent evidence-backed resource batches

- [ ] **Step 1: Freeze the intake template**

Use this exact record shape in the research notes before writing catalog JSON:

```ts
type IntakeRecord = {
  canonicalUrl: string;
  title: string;
  sourceName: string;
  sourceUrl: string;
  mediaType: 'article' | 'book' | 'course' | 'paper' | 'podcast' | 'talk' | 'video' | 'website';
  originalLanguage: string;
  accessVersions: Array<{
    language: string;
    url: string;
    accessModel: 'free' | 'paid' | 'subscription';
    regionRestrictions?: Array<{ regions: string[]; note: string }>;
    translationKind: 'original' | 'official' | 'community' | 'bilingual' | 'subtitled';
    checkedAt: string;
  }>;
  capabilityIds: string[];
  knowledgeTopicIds: string[];
  resourceTopicIds: string[];
  whyRelevant: string;
  externalSignals: Array<{
    provider: string;
    label: string;
    value: string;
    sampleSize?: string;
    observedAt: string;
    url: string;
  }>;
};
```

- [ ] **Step 2: Run three non-overlapping research batches in parallel**

Use agent-reach and prefer creator, publisher, conference, library, DOI or official platform pages. Divide ownership:

1. Fundamentals, systems, game feel, balance, level and spatial design.
2. Narrative, playtesting, user research, prototyping, production, collaboration and leadership.
3. Books, podcasts, academic research, Chinese/Japanese sources, translations and broader critical context.

Each batch should return roughly 35-55 candidates with canonical URLs and the intake fields above; this is a coverage target, not a quota that justifies weak or duplicate entries. Explicitly include or assess GMTK, GDC, Sakurai's channel, PlatinumGames/Bayonetta Bilibili lessons, Level Design Book, Will Wright MasterClass, relevant books and podcasts. Do not write files from research subagents.

- [ ] **Step 3: Verify research coverage before normalization**

Merge notes into `docs/research/2026-08-09-resource-intake.md`. Check:

- at least 12 resource topics have multiple items;
- Chinese and English consumable versions are represented;
- free and paid resources are labeled rather than compared;
- Source pages and specific Work Items are not merged;
- every external observation has a URL and date;
- no external rating is rewritten as a site-authored score.
- every accepted Work Item retains the same canonical identity recorded during intake and points to a real Source;
- at least one Access Version per accepted item has been checked, with access model and region restriction stored separately.

- [ ] **Step 4: Commit the evidence notebook**

```bash
git add docs/research/2026-08-09-resource-intake.md
git commit -m "research: document the first resource expansion batch"
```

### Task 2: Normalize and validate the first broad resource catalog

- [ ] **Step 1: Write failing identity and integrity tests**

Add actual-data tests:

```ts
expect(resourceTopics.length).toBeGreaterThanOrEqual(12);
expect(new Set(resources.flatMap((resource) => resource.resourceTopicIds)).size)
  .toBeGreaterThanOrEqual(12);
expect(resources.every((resource) =>
  resource.capabilityIds.length + resource.knowledgeTopicIds.length + resource.resourceTopicIds.length > 0
)).toBe(true);
expect(resources.every((resource) => !('reviewStatus' in resource))).toBe(true);
expect(resources.every((resource) => !('rating' in resource) && !('score' in resource) && !('rank' in resource)))
  .toBe(true);
expect(new Set(resources.map(({ canonicalUrl }) => canonicalUrl)).size).toBe(resources.length);
expect(resources.every((resource) =>
  intakeCanonicalUrls.has(resource.canonicalUrl) &&
  sources.some(({ id }) => id === resource.sourceId) &&
  resource.accessVersions.some(({ checkedAt }) => checkedAt)
)).toBe(true);
```

Add duplicate checks for canonical Work Item URL and duplicate Source homepage. Add schema/validator tests that reject `regional` as an access model and accept a separate region restriction. Generate a content coverage report with the actual Source, Work Item, topic, media and language counts; do not make the 100-150 reporting target a build-failing padding gate.

- [ ] **Step 2: Run and verify RED**

Run: `npm test -- tests/lib/catalog-validate.test.ts`

Expected: the catalog contains only the migrated M0 resources and topics.

- [ ] **Step 3: Normalize Sources and Work Items**

Create one Source per real creator, channel, organization, publisher or site, with kind, summary, homepage, languages and optional traceable external observations. Add Work Item records at episode/article/talk/book/paper/course granularity. Preserve the intake `canonicalUrl` on each Work Item. When the same item has multiple language or purchase links, keep one Work Item with multiple Access Versions.

For books, use publisher, author or library authority pages for identity and use separate legal purchase/subscription/access versions. For academic papers, retain DOI or stable publisher/open-access URL. For videos, prefer the creator's original upload. Do not copy protected full text, subtitles or course material.

- [ ] **Step 4: Run catalog GREEN**

Run: `npm run check && npm test -- tests/lib/catalog-validate.test.ts`

Expected: all references resolve, canonical/source/access integrity and duplicate checks pass, the coverage report states the real count, and no site-authored quality fields exist.

- [ ] **Step 5: Sample-check external links**

Check every canonical URL with bounded concurrency and a normal browser User-Agent. Treat transient timeout/403/406 as a reportable observation, not automatic deletion. Manually open a stratified sample covering each media type and language.

- [ ] **Step 6: Commit normalized content**

```bash
git add src/data/sources.json src/data/resources.json src/data/resource-topics.json tests/lib/catalog-validate.test.ts
git commit -m "content: add the first broad learning resource catalog"
```

### Task 3: Make Sources and Work Items independently discoverable

- [ ] **Step 1: Write the browser RED**

Add E2E assertions that the Resources server HTML contains both `data-result-kind="source"` and `data-result-kind="work-item"`; opening a Source reaches `/sources/[id]/`, shows its factual metadata, and lists its Work Items. A Source page and a specific Work Item must never be merged into one result merely because their URLs share a host.

- [ ] **Step 2: Run and verify RED**

Run separately:

```bash
npm run build
npx playwright test tests/e2e/resources-v02.spec.ts --project=chromium
```

Expected: Source records are not rendered as their own result and no Source detail route exists.

- [ ] **Step 3: Implement Source results and details**

Use a discriminated resource-result view model. Render Source results with entity type, summary, languages and Work Item count; render Work Item results with media/access/topic facts. Create `/sources/[id]/` from the same catalog and add every generated Source URL to the base-path sampler.

- [ ] **Step 4: Verify GREEN and commit**

Run the targeted Resources and base-path suites on desktop and mobile, then commit only the Source/result files and tests.

### Task 4: Implement factual multi-filter browsing

- [ ] **Step 1: Write pure filter RED tests**

Create `tests/lib/resource-filter.test.ts`:

```ts
it('combines topic, capability, language, medium and access filters', () => {
  const result = filterResources(fixtures, {
    resourceTopic: 'playtesting',
    knowledgeTopic: null,
    capabilityId: 'playtesting',
    language: 'zh-CN',
    mediaType: 'article',
    accessModel: 'free',
    sourceId: 'play-with-experiences',
  });
  expect(result.map(({ id }) => id)).toEqual(['playtesting-better-designer-article']);
});

it('does not sort by external observations', () => {
  expect(filterResources(fixtures, emptyFilters).map(({ id }) => id))
    .toEqual(fixtures.map(({ id }) => id));
});
```

- [ ] **Step 2: Write browser RED tests**

Extend `tests/e2e/resources-v02.spec.ts` asserting:

- every accepted Source and Work Item is present in the unfiltered server HTML;
- at least 12 topic controls exist;
- combined filters update visible cards and count;
- the distinct `resourceTopic`, `knowledgeTopic`, and `capability` query parameters create shareable filtered states;
- history back and `pageshow` restore derived card visibility;
- results expose no site-authored quality badge/field and catalog order never changes because of external observations; transparency copy such as“本站不评分”is allowed;
- no-JS displays all resources and disables filters with an explanation.

- [ ] **Step 3: Run and verify RED**

Run separately:

```bash
npm test -- tests/lib/resource-filter.test.ts
npm run build
npx playwright test tests/e2e/resources-v02.spec.ts --project=chromium
```

Expected: helper and filters are missing and only two cards exist.

- [ ] **Step 4: Implement the pure filter helper**

`filterResources()` must preserve catalog order and use Access Version fields for language/access filtering. Region restrictions are a separate filter/fact from `accessModel`. It must not inspect `externalSignals` for ordering.

- [ ] **Step 5: Rebuild `ResourceExplorer.astro`**

Render topic navigation first, then compact factual filters. Each result identifies Source vs Work Item, topic relevance, media, language/access versions and optional traceable external observations. Do not render a quality badge.

Server render all results. The client binds disabled controls, reads/writes URL query parameters with `history.replaceState`, updates `hidden`, and replays state on `pageshow`. Provide a useful zero-result message without silently changing filters.

- [ ] **Step 6: Verify GREEN**

Run the unit test, build, and browser suite as three separate commands on both configured projects.

Expected: all filter, history, no-JS and quality-semantics assertions pass.

- [ ] **Step 7: Commit the resource explorer**

```bash
git add src/lib/resource-filter.ts src/components/ResourceExplorer.astro src/pages/resources src/styles/global.css tests
git commit -m "feat: browse resources by topic and access facts"
```

### Task 5: Connect resources directly to map nodes

- [ ] **Step 1: Write failing navigation tests**

From a capability page and a knowledge-topic page, assert that relevant resource cards and a link to the corresponding Resource filter are visible. Assert that no route or copy calls the result a required sequence.

- [ ] **Step 2: Run and verify RED**

Run separately:

```bash
npm run build
npx playwright test tests/e2e/map-v02.spec.ts tests/e2e/resources-v02.spec.ts --project=chromium
```

Expected: the new map pages do not yet expose filtered resource navigation.

- [ ] **Step 3: Render direct resource sections**

On each Capability/Knowledge Topic page, show related Work Items in catalog order and link to `/resources/?capability=<id>` or `/resources/?knowledgeTopic=<id>`. Resource Topic links use `/resources/?resourceTopic=<id>`. If none exist, show an honest empty state and contribution link. Do not insert a Learning Trail between the node and resources.

- [ ] **Step 4: Verify GREEN and base paths**

Run: `npm run build && npx playwright test tests/e2e/map-v02.spec.ts tests/e2e/resources-v02.spec.ts tests/e2e/base-path.spec.ts --project=chromium --project=mobile-chromium`

- [ ] **Step 5: Commit map-resource integration**

```bash
git add src/pages/capabilities src/pages/topics src/components tests/e2e
git commit -m "feat: connect map nodes directly to learning resources"
```

### Task 6: Resource quality gate

- [ ] **Step 1: Run fresh full verification**

Run:

```bash
npm run check
npm test
npm run build
CI=1 npm run test:e2e
git diff --check
```

- [ ] **Step 2: Perform content spot checks**

Randomly sample at least two records per resource topic plus every item with multiple Access Versions or external observations. Compare rendered metadata to the source URL. Record broken, blocked or region-limited links without deleting them solely for one transient failure.

- [ ] **Step 3: Perform visual review**

Inspect Resources at 1440px and an explicit `page.setViewportSize({ width: 320, height: 900 })` viewport in Light and Dark with: all items, a Source result/detail, a Work Item, a narrow topic filter, combined filters, no results, an external observation, and no JavaScript. Confirm the real catalog remains navigable at its published count and does not look like a score table.

- [ ] **Step 4: Update continuity and commit**

Record exact counts, topic/media/language coverage, source limitations, link-check date, tests and screenshots in the journal. Update Roadmap and Unreleased Changelog with only actual behavior.

```bash
git add docs ROADMAP.md CHANGELOG.md
git commit -m "docs: record the v0.2 resource milestone"
```
