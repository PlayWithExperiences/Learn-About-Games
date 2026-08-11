# Grouped Resources Table Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the single 148-entity Resources document with a grouped resource table whose 15 topic subtables can be opened individually or together.

**Architecture:** Each Work Item is server-rendered exactly once inside its Resource Topic disclosure. One filter controller applies the existing seven factual filters and updates group counts. Source moves to a link-based directory view.

**Tech Stack:** Astro 7, TypeScript, native details/summary, CSS Grid, Vitest, Playwright.

---

### Task 1: Enforce one Resource Topic per Work Item

**Files:**
- Modify: `tests/lib/catalog-data.test.ts`
- Modify: `tests/lib/catalog-validate.test.ts`
- Modify: `src/lib/catalog/validate.ts`

- [ ] **Step 1: Write failing validator tests**

Add fixtures for zero and multiple Resource Topic IDs and expect exact diagnostics:

```ts
expect(codes).toContain('RESOURCE_PRIMARY_TOPIC_REQUIRED');
expect(codes).toContain('RESOURCE_PRIMARY_TOPIC_MULTIPLE');
```

Assert current raw data has 128 Work Items and each has `resourceTopicIds.length === 1`.

- [ ] **Step 2: Verify RED**

```bash
npm test -- tests/lib/catalog-data.test.ts tests/lib/catalog-validate.test.ts
```

Expected: the new validator diagnostics are absent.

- [ ] **Step 3: Add minimal validation**

Reject zero or multiple primary topic associations without changing topic order or current data.

- [ ] **Step 4: Verify GREEN and commit**

```bash
npm test -- tests/lib/catalog-data.test.ts tests/lib/catalog-validate.test.ts
git add tests/lib/catalog-data.test.ts tests/lib/catalog-validate.test.ts src/lib/catalog/validate.ts
git commit -m "test: require one resource table group"
```

### Task 2: Render grouped subtables and Source navigation

**Files:**
- Create: `src/components/ResourceTable.astro`
- Create: `src/pages/resources/sources/index.astro`
- Modify: `src/components/ResourceExplorer.astro`
- Modify: `src/components/ResourceResults.astro`
- Modify: `src/pages/resources/index.astro`
- Modify: `tests/e2e/resources-v02.spec.ts`

- [ ] **Step 1: Write the grouped-table RED contract**

```ts
await expect(page.locator('[data-resource-group]')).toHaveCount(15);
await expect(page.locator('[data-resource-group] [data-result-kind="work-item"]')).toHaveCount(128);
expect(await uniqueIds(page.locator('[data-result-kind="work-item"]'))).toHaveLength(128);
await expect(page.getByRole('link', { name: '来源' })).toHaveAttribute('href', /resources\/sources\/$/);
```

The default state has all groups closed and does not render Source rows on the Resource Table route.

- [ ] **Step 2: Verify RED after a fresh build**

```bash
npm run build
CI=1 npx playwright test tests/e2e/resources-v02.spec.ts --project=chromium
```

- [ ] **Step 3: Implement server grouping**

Group by Resource Topic catalog order:

```astro
<details data-resource-group={topic.id}>
  <summary>... title, summary, total count, matching count ...</summary>
  <ResourceResults resources={items} sources={sources} />
</details>
```

Every Work Item occurs in one group. The Source directory route renders the existing 20 Source rows and links to existing Source detail pages.

- [ ] **Step 4: Preserve row detail facts**

Keep canonical access, Access Versions, checked dates, region facts, and External Observations in the native row disclosure. Do not add scores, rankings, badges, or derived ordering.

- [ ] **Step 5: Verify server GREEN and commit**

```bash
npm run build
CI=1 npx playwright test tests/e2e/resources-v02.spec.ts --project=chromium
git add src/components/ResourceTable.astro src/pages/resources/sources/index.astro src/components/ResourceExplorer.astro src/components/ResourceResults.astro src/pages/resources/index.astro tests/e2e/resources-v02.spec.ts
git commit -m "feat: group learning resources into topic tables"
```

### Task 3: Add expand-all and group-aware filtering

**Files:**
- Modify: `src/components/ResourceExplorer.astro`
- Modify: `src/lib/resource-filter.ts`
- Modify: `tests/lib/resource-filter.test.ts`
- Modify: `tests/e2e/resources-v02.spec.ts`

- [ ] **Step 1: Write controller RED tests**

```ts
await page.getByRole('button', { name: '展开全表' }).click();
await expect(page.locator('[data-resource-group][open]')).toHaveCount(15);
await page.getByRole('button', { name: '全部收起' }).click();
await expect(page.locator('[data-resource-group][open]')).toHaveCount(0);
```

Filter tests assert AND semantics, stable order, per-group matching counts, hidden zero-match groups, preserved query parameters, reload, back, and pageshow.

- [ ] **Step 2: Verify RED**

```bash
npm test -- tests/lib/resource-filter.test.ts
npm run build
CI=1 npx playwright test tests/e2e/resources-v02.spec.ts --project=chromium
```

- [ ] **Step 3: Implement minimal group-aware state**

Enable controls only after binding. Filtering hides rows, updates group matching counts, hides zero-match groups, and updates the total status. Expand-all opens every currently matching group. Collapse-all closes all groups. Neither action changes catalog order.

- [ ] **Step 4: Preserve no-JavaScript behavior**

Each native group disclosure opens normally, all Work Items remain reachable exactly once, and script-only controls are disabled with a local explanation.

- [ ] **Step 5: Verify GREEN and commit**

```bash
npm test -- tests/lib/resource-filter.test.ts
npm run build
CI=1 npx playwright test tests/e2e/resources-v02.spec.ts tests/e2e/playtest-flow.spec.ts tests/e2e/base-path.spec.ts --project=chromium --project=mobile-chromium
git add src/components/ResourceExplorer.astro src/lib/resource-filter.ts tests/lib/resource-filter.test.ts tests/e2e/resources-v02.spec.ts
git commit -m "feat: filter expandable resource subtables"
```

### Task 4: Tighten resource-table presentation

**Files:**
- Modify: `src/styles/global.css`
- Modify: `tests/e2e/resources-v02.spec.ts`

- [ ] **Step 1: Add visual-density RED assertions**

Lock one-column grouped tables, desktop scan columns, mobile vertical records, no horizontal overflow, visible focus, and compact collapsed summaries. Assert practical median row-height ceilings and minimum text widths rather than exact pixel values.

- [ ] **Step 2: Verify RED and implement CSS**

Use the existing editorial tokens. Avoid card containers for every row and do not place both top and bottom borders on every record. Preserve one accent and Light/Dark parity.

- [ ] **Step 3: Visual review**

Capture collapsed, one-group, full-table, filtered, empty, Source, and no-JavaScript states at 1440px, 1024px, and 320px in Light and Dark.

- [ ] **Step 4: Commit**

```bash
git add src/styles/global.css tests/e2e/resources-v02.spec.ts
git commit -m "fix: keep grouped resources compact and readable"
```
