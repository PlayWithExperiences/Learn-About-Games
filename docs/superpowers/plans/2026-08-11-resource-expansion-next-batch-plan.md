# Evidence-Backed Resource Expansion Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add 8–10 verified Chinese-first and English-second learning resources without increasing catalog ranking semantics, talk concentration or identity ambiguity.

**Architecture:** Research evidence is recorded before catalog mutation. Tests lock the accepted canonical URLs and batch quotas first; `resources.json` and `sources.json` then supply the minimal normalized records, while the existing loader, validator, grouped tables and filters remain unchanged unless a real regression is found.

**Tech Stack:** Agent Reach, Jina Reader, Astro content collections, JSON, Vitest, Playwright.

---

## File map

- Modify `docs/research/2026-08-09-resource-intake.md`: append the exact research batch, including exclusions.
- Modify `src/data/resources.json`: accepted Work Items and Access Versions.
- Modify `src/data/sources.json`: only genuinely new Source homepages.
- Modify `tests/lib/catalog-data.test.ts`: exact batch URLs, counts and distribution invariants.
- Modify `tests/e2e/resources-v02.spec.ts` only if current visible counts are hard-coded instead of catalog-derived.
- Modify milestone docs after all gates are green.

### Task 1: Complete the bounded Chinese-first research set

**Files:**
- Modify: `docs/research/2026-08-09-resource-intake.md`

- [ ] **Step 1: Verify the five pre-qualified candidates**

Use `agent-reach doctor --json`, then Jina Reader on the canonical pages. Admit no more than three entries from The Level Design Book and no more than two Tencent talk transcripts:

```text
https://book.leveldesignbook.com/process/combat/cover
https://book.leveldesignbook.com/process/combat/balance
https://book.leveldesignbook.com/process/scripting
https://book.leveldesignbook.com/process/preproduction
https://book.leveldesignbook.com/process/preproduction/research
https://gameinstitute.qq.com/course/detail/10056
https://gameinstitute.qq.com/course/detail/10123
https://gameinstitute.qq.com/course/detail/10202
https://gameinstitute.qq.com/course/detail/10200
```

For each page, record title, author/institution, canonical URL, original language, honest media type, access model, checked date, bounded content claim, primary Resource Topic and only those Capability/Knowledge Topic mappings directly supported by the page.

- [ ] **Step 2: Search for three to five non-talk Chinese candidates**

Run these exact query groups through Agent Reach; after any Exa 429, stop retrying and continue only with Jina/official pages:

```text
site:edu.cn 游戏设计 原型 课程
site:open.163.com 游戏设计 课程 交互
site:xuetangx.com 游戏设计 课程
site:gameinstitute.qq.com/course/detail 游戏 领导力 创意总监
site:gameinstitute.qq.com/course/detail 游戏 商业化 体验
site:cnki.net 游戏设计 选择 后果 叙事 摘要
游戏设计 美学 课程 官方
游戏商业化 玩家体验 作者 文章
```

Accept only official course pages, institutional paper records, author-owned articles or stable organizational sites. Reject search-result snippets, reposts, unverifiable video mirrors, pages without enough content to support mappings, and any URL already canonicalized into the catalog.

- [ ] **Step 3: Apply the stop conditions**

Stop at 8–10 accepted Work Items only when all are true:

```text
original/official Chinese >= 4
English <= 4 unless fewer than 8 total can pass evidence review
talk <= 2
one Source <= 3 items
every item has exactly one primary Resource Topic
every item improves a named coverage gap
```

If fewer than eight pass, stop with a smaller honest batch and record the gap; do not fill with talks or weak sources.

- [ ] **Step 4: Write the notebook section**

Use one row per candidate with status `include`, `exclude` or `needs-verification`. Record the actual backends, 429/403/404 events, duplicate decisions and why a mapping is bounded.

- [ ] **Step 5: Commit the research evidence**

```bash
git add docs/research/2026-08-09-resource-intake.md
git commit -m "research: verify the next resource expansion batch"
```

### Task 2: Lock raw catalog RED before editing data

**Files:**
- Modify: `tests/lib/catalog-data.test.ts`

- [ ] **Step 1: Add the accepted canonical URL list**

After Task 1, paste the accepted canonical URLs into a literal array and test exact presence. Use this shape, replacing the example array with only the notebook's `include` rows:

```ts
const nextBatchCanonicalUrls = [
  'https://book.leveldesignbook.com/process/combat/cover',
  'https://book.leveldesignbook.com/process/scripting',
  'https://gameinstitute.qq.com/course/detail/10056',
] as const;

expect(resources.filter(({ canonicalUrl }) =>
  nextBatchCanonicalUrls.includes(canonicalUrl as (typeof nextBatchCanonicalUrls)[number])
).map(({ canonicalUrl }) => canonicalUrl).sort()).toEqual([...nextBatchCanonicalUrls].sort());
```

The final literal must contain every accepted URL, not just the three examples.

- [ ] **Step 2: Add batch quota assertions**

Select the batch by the exact URL set and assert:

```ts
expect(batch.length).toBeGreaterThanOrEqual(8);
expect(batch.length).toBeLessThanOrEqual(10);
expect(batch.filter(({ originalLanguage }) => originalLanguage === 'zh-Hans').length).toBeGreaterThanOrEqual(4);
expect(batch.filter(({ mediaType }) => mediaType === 'talk').length).toBeLessThanOrEqual(2);
expect(batch.every(({ resourceTopicIds }) => resourceTopicIds.length === 1)).toBe(true);
expect(batch.every(({ capabilityIds, knowledgeTopicIds }) =>
  capabilityIds.length + knowledgeTopicIds.length > 0
)).toBe(true);
```

Also assert unique canonical URLs, Source/Work URL separation and no score/rank/recommendation fields.

- [ ] **Step 3: Run RED**

```bash
npm test -- tests/lib/catalog-data.test.ts
```

Expected: exact accepted URLs are missing; all prior catalog invariants remain green.

- [ ] **Step 4: Commit test-only RED**

```bash
git add tests/lib/catalog-data.test.ts
git commit -m "test: lock the next resource evidence batch"
```

### Task 3: Add normalized Sources and Work Items

**Files:**
- Modify: `src/data/sources.json`
- Modify: `src/data/resources.json`
- Test: `tests/lib/catalog-data.test.ts`
- Test: `tests/lib/catalog-validate.test.ts`

- [ ] **Step 1: Reuse Sources before creating new ones**

Canonicalize host, `www`, fragment, trailing slash and stable query according to the existing validator/test helpers. Reuse an existing Source when its homepage identity matches. A Source homepage may not equal any Work Item canonical URL.

- [ ] **Step 2: Add each Work Item using the existing schema**

Use this exact object shape and fill every value from the notebook evidence:

```json
{
  "id": "stable-kebab-case-id",
  "title": { "zh-CN": "公开标题", "en": "English title when sourced" },
  "summary": { "zh-CN": "只陈述来源实际覆盖的内容。" },
  "sourceId": "existing-or-new-source-id",
  "canonicalUrl": "https://canonical.example/work",
  "resourceTopicIds": ["one-resource-topic-id"],
  "mediaType": "course",
  "capabilityIds": ["supported-capability-id"],
  "knowledgeTopicIds": [],
  "originalLanguage": "zh-Hans",
  "accessVersions": [
    {
      "url": "https://canonical.example/work",
      "language": "zh-Hans",
      "accessModel": "free",
      "presentationMode": "original",
      "versionRelation": "canonical",
      "checkedAt": "2026-08-11"
    }
  ]
}
```

Use the repository's actual enum values as confirmed by nearby records. Do not invent an access fact when the page does not state it.

- [ ] **Step 3: Merge language versions instead of duplicating works**

When Chinese and English pages are the same intellectual work, keep one Work Item and add another `accessVersions` entry. Preserve catalog order from canonical/original to translated or authorized alternate access.

- [ ] **Step 4: Run targeted GREEN**

```bash
npm test -- tests/lib/catalog-data.test.ts tests/lib/catalog-validate.test.ts
npm run check
```

Expected: exact URL, quota, reference-closure, language and one-topic tests pass with zero diagnostics.

- [ ] **Step 5: Commit catalog data**

```bash
git add src/data/resources.json src/data/sources.json tests/lib/catalog-data.test.ts
git commit -m "content: add the next learning resource batch"
```

### Task 4: Verify the grouped resource experience

**Files:**
- Modify only if RED proves necessary: `tests/e2e/resources-v02.spec.ts`
- Modify only if RED proves necessary: `tests/e2e/playtest-flow.spec.ts`

- [ ] **Step 1: Build fresh output and run browser tests**

```bash
npm run build
CI=1 npx playwright test tests/e2e/resources-v02.spec.ts tests/e2e/playtest-flow.spec.ts tests/e2e/base-path.spec.ts --project=chromium --project=mobile-chromium
```

- [ ] **Step 2: Fix only stale hard-coded counts**

If a test locks `174`, replace it with a count derived from the raw imported resource array or rendered server count. Do not change filtering, grouping or UI unless a real behavior regression is reproduced.

- [ ] **Step 3: Verify no-JavaScript and density**

At 1440 and 320, require all Work Item rows in server HTML, default collapsed topic groups, native disclosures usable without JavaScript, filters disabled with an explanation, and no document-level horizontal overflow.

- [ ] **Step 4: Commit test synchronization if needed**

```bash
git add tests/e2e/resources-v02.spec.ts tests/e2e/playtest-flow.spec.ts
git commit -m "test: derive resource counts from the catalog"
```

Skip this commit when no files changed.

### Task 5: Final verification and milestone documentation

**Files:**
- Modify: `CHANGELOG.md`
- Modify: `docs/journal/2026-08-09-learn-about-games-v02-decision-summary.md`
- Modify: `docs/journal/2026-08-09-learn-about-games-v02-transcript.md`
- Create: `docs/devlog/2026-08-11-resource-expansion-next-batch.md`

- [ ] **Step 1: Recompute and record distributions**

Record Sources, Work Items, Access Versions, media types, original/consumable languages, topic counts and lowest capability/topic coverage from raw data. Do not hand-maintain a number that a test can derive.

- [ ] **Step 2: Run full gates**

```bash
npm run check
npm test
npm run build
CI=1 npm run test:e2e
git diff --check
```

- [ ] **Step 3: Scan the research export without printing secrets**

Search filenames and red-flag key names only. Do not print token or environment-variable values.

- [ ] **Step 4: Commit docs**

```bash
git add CHANGELOG.md docs/journal/2026-08-09-learn-about-games-v02-decision-summary.md docs/journal/2026-08-09-learn-about-games-v02-transcript.md docs/devlog/2026-08-11-resource-expansion-next-batch.md
git commit -m "docs: record the next resource expansion"
```
