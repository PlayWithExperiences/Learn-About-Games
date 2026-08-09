# Private Refinement Resources Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make Learning Resources scan as one compact vertical directory without changing catalog facts, filters, order, or no-JS access.

**Architecture:** Keep `ResourceExplorer` filtering untouched. Restructure only `ResourceResults.astro`: Sources become single-row directory entries, Work Items keep one-row semantics with three fact zones, and long access/external details move into native disclosures. CSS remains responsive and follows the existing editorial system.

**Tech Stack:** Astro 7, semantic HTML, native `details`, CSS Grid, Playwright.

---

### Task 1: Lock the single-column result contract with browser RED

**Files:**
- Modify: `tests/e2e/resources-v02.spec.ts`

- [ ] **Step 1: Add the failing desktop density test**

~~~ts
test('uses one compact editorial row per Source and Work Item', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1100 });
  await page.goto('./resources/');

  const sourceList = page.locator('.source-result-list');
  const sourceColumns = await sourceList.evaluate((element) => getComputedStyle(element).gridTemplateColumns);
  expect(sourceColumns.split(' ')).toHaveLength(1);

  const sourceRow = page.locator('.source-result').first();
  const workRow = page.locator('.work-item-result').first();
  await expect(sourceRow.locator('[data-source-row-main]')).toHaveCount(1);
  await expect(sourceRow.locator('[data-source-row-facts]')).toHaveCount(1);
  await expect(workRow.locator('[data-work-row-main]')).toHaveCount(1);
  await expect(workRow.locator('[data-work-row-facts]')).toHaveCount(1);
  await expect(workRow.locator('[data-work-row-access]')).toHaveCount(1);
});
~~~

Add a test that opens every `work-item-result__more` disclosure for a Work Item with external signals and confirms all access versions and observations remain in catalog order.

- [ ] **Step 2: Run and verify RED**

~~~bash
npm run build
CI=1 npx playwright test tests/e2e/resources-v02.spec.ts --project=chromium --grep "compact editorial row"
~~~

Expected: FAIL because Source is a two-column grid and the row-zone attributes do not exist.

### Task 2: Restructure Source and Work Item rows

**Files:**
- Modify: `src/components/ResourceResults.astro`
- Modify: `src/styles/global.css`
- Modify: `tests/e2e/resources-v02.spec.ts`

- [ ] **Step 1: Render each Source as one directory row**

~~~astro
<article class="source-result" data-result-kind="source" data-result-id={source.id} data-source-id={source.id}>
  <div class="source-result__identity">Source · {formatSourceKind(source.kind)}</div>
  <div class="source-result__main" data-source-row-main>
    <h3><a href={sitePath('sources/' + source.id + '/')}>{source.name['zh-CN']}</a></h3>
    <p>{source.summary['zh-CN']}</p>
  </div>
  <dl class="source-result__facts" data-source-row-facts>
    <div><dt>语言</dt><dd>{source.languages.map(formatLanguage).join('、')}</dd></div>
    <div><dt>Work Item</dt><dd>{workCountBySource.get(source.id) ?? 0}</dd></div>
  </dl>
</article>
~~~

- [ ] **Step 2: Split each Work Item into main, facts, access, and disclosure zones**

Keep all existing article filter attributes. Render:

~~~astro
<div class="work-item-result__main" data-work-row-main>
  <h3>{resource.title['zh-CN']}</h3>
  {source && <p>Source：<a href={sitePath('sources/' + source.id + '/')}>{source.name['zh-CN']}</a></p>}
  <p class="work-item-result__relevance">{resource.whyRelevant['zh-CN']}</p>
</div>
<dl class="work-item-result__facts" data-work-row-facts>
  <div><dt>媒介</dt><dd>{formatMediaType(resource.mediaType)}</dd></div>
  <div><dt>原始语言</dt><dd>{formatLanguage(resource.originalLanguage)}</dd></div>
  <div><dt>可消费语言</dt><dd>{languages.map(formatLanguage).join('、')}</dd></div>
</dl>
<div class="work-item-result__access" data-work-row-access>
  <a href={resource.canonicalUrl}>打开资源原页</a>
  <span>{accessModels.map(formatAccessModel).join('、')}</span>
</div>
<details class="work-item-result__more">
  <summary>{resource.externalSignals?.length ? '查看访问版本与外部事实' : '查看访问版本'}</summary>
  <ul class="access-version-list" aria-label={resource.title['zh-CN'] + ' 的访问版本'}>
    {resource.accessVersions.map((version) => (
      <li>
        <div class="access-version-list__facts">
          <span>{formatLanguage(version.language)}</span>
          <span>{formatVersionRelation(version.versionRelation)}</span>
          <span>{formatPresentationMode(version.presentationMode)}</span>
          <span>{formatAccessModel(version.accessModel)}</span>
          <span>检查于 {version.checkedAt}</span>
        </div>
        <a href={version.url}>访问此版本</a>
        {version.regionRestrictions?.map((restriction) => (
          <p class="access-version-list__restriction">{formatRegionRestriction(restriction)}</p>
        ))}
      </li>
    ))}
  </ul>
  {resource.externalSignals?.length ? (
    <section class="external-observations" aria-label={resource.title['zh-CN'] + ' 的外部观察'}>
      <h4>外部公开观察</h4>
      <ul>
        {resource.externalSignals.map((signal) => (
          <li data-external-observation>
            <a href={signal.url}>
              <span>{signal.provider}</span>
              <span>{signal.label}：{signal.value}</span>
              {signal.sampleSize && <span>样本：{signal.sampleSize}</span>}
              <span>观察于 {signal.observedAt}</span>
            </a>
          </li>
        ))}
      </ul>
    </section>
  ) : null}
</details>
~~~

- [ ] **Step 3: Apply compact one-column CSS**

~~~css
.source-result-list,
.work-item-result-list {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: 0;
}

.source-result {
  display: grid;
  grid-template-columns: 7rem minmax(16rem, .7fr) minmax(12rem, .3fr);
  gap: 1rem;
  padding-block: .8rem;
  border-bottom: 1px solid var(--line);
  background: transparent;
}

.work-item-result {
  display: grid;
  grid-template-columns: 5.5rem minmax(18rem, 1fr) minmax(11rem, .38fr) 9rem;
  gap: .75rem 1rem;
  padding-block: .85rem;
}

.work-item-result__more {
  grid-column: 2 / -1;
}
~~~

At ≤760px, set both article grids and `work-item-result__more` to one column. Preserve long-link wrapping and visible primary links.

- [ ] **Step 4: Run focused GREEN**

~~~bash
npm run build
CI=1 npx playwright test tests/e2e/resources-v02.spec.ts tests/e2e/playtest-flow.spec.ts --project=chromium --project=mobile-chromium
git diff --check
~~~

Expected: PASS with 20 Sources, 128 Work Items, seven filters, unchanged URL behavior, and no 320px overflow.

- [ ] **Step 5: Commit**

~~~bash
git add src/components/ResourceResults.astro src/styles/global.css tests/e2e/resources-v02.spec.ts
git commit -m "feat: compact the learning resource directory"
~~~

### Task 3: Visual and no-JS acceptance

**Files:**
- Modify: `CHANGELOG.md`
- Modify: `docs/journal/2026-08-09-learn-about-games-v02-decision-summary.md`
- Modify: `docs/journal/2026-08-09-learn-about-games-v02-transcript.md`

- [ ] **Step 1: Capture Resources at 1440 and 320 in Light and Dark**

Inspect one scan column, horizontal eye travel, disclosure labels, access actions, and document overflow.

- [ ] **Step 2: Verify no-JS and the complete regression gate**

~~~bash
npm run check
npm test
npm run build
CI=1 npm run test:e2e
git diff --check
~~~

Expected: complete gate PASS; no-JS still renders all Sources, Work Items, access links, and external observations.

- [ ] **Step 3: Record and commit verified behavior**

~~~bash
git add CHANGELOG.md docs/journal/2026-08-09-learn-about-games-v02-decision-summary.md docs/journal/2026-08-09-learn-about-games-v02-transcript.md
git commit -m "docs: record the compact resource directory"
~~~
