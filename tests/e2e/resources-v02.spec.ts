import { expect, test } from '@playwright/test';
import capabilities from '../../src/data/capabilities.json' with { type: 'json' };
import knowledgeTopics from '../../src/data/knowledge-topics.json' with { type: 'json' };
import resourceTopics from '../../src/data/resource-topics.json' with { type: 'json' };
import resources from '../../src/data/resources.json' with { type: 'json' };
import sources from '../../src/data/sources.json' with { type: 'json' };
import { formatLanguage } from '../../src/lib/resource-display';

const projectBasePath = '/Learn-About-Games/';

function matchingResources(target: (typeof resources)[number]) {
  const targetAccessModel = target.accessVersions[0].accessModel;
  const targetLanguage = target.accessVersions[0].language;

  return resources.filter((resource) =>
    resource.resourceTopicIds.includes(target.resourceTopicIds[0])
    && resource.knowledgeTopicIds.includes(target.knowledgeTopicIds[0])
    && resource.capabilityIds.includes(target.capabilityIds[0])
    && (resource.originalLanguage === targetLanguage
      || resource.accessVersions.some(({ language }) => language === targetLanguage))
    && resource.mediaType === target.mediaType
    && resource.accessVersions.some(({ accessModel }) => accessModel === targetAccessModel)
    && resource.sourceId === target.sourceId,
  );
}

function median(values: number[]) {
  const sorted = [...values].sort((left, right) => left - right);
  return sorted[Math.floor(sorted.length / 2)];
}

test('server renders each Work Item once in fifteen closed topic subtables and links to Sources', async ({ page, request }) => {
  const response = await request.get('resources/');
  expect(response.status()).toBe(200);
  const html = await response.text();

  expect(html.match(/<article[^>]+data-result-kind="work-item"/g) ?? []).toHaveLength(resources.length);

  await page.goto('./resources/');
  await expect(page.locator('[data-resource-group]')).toHaveCount(resourceTopics.length);
  await expect(page.locator('[data-resource-group][open]')).toHaveCount(0);
  await expect(page.locator('[data-resource-group] [data-result-kind="work-item"]')).toHaveCount(resources.length);
  await expect(page.locator('[data-result-kind="work-item"]')).toHaveCount(resources.length);
  await expect(page.locator('[data-result-kind="source"]')).toHaveCount(0);
  await expect(page.getByRole('link', { name: '来源' })).toHaveAttribute('href', /resources\/sources\/$/);

  const ids = await page.locator('[data-result-kind="work-item"]').evaluateAll((items) =>
    items.map((item) => item.getAttribute('data-result-id')),
  );
  expect(new Set(ids).size).toBe(resources.length);
});

test('opens all matching topic subtables and collapses them again', async ({ page }) => {
  await page.goto('./resources/');
  await page.getByRole('button', { name: '展开全表' }).click();
  await expect(page.locator('[data-resource-group][open]')).toHaveCount(resourceTopics.length);
  await page.getByRole('button', { name: '全部收起' }).click();
  await expect(page.locator('[data-resource-group][open]')).toHaveCount(0);
});

test('keeps collapsed topic summaries compact and switches resource rows to vertical records on mobile', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('./resources/');

  const summary = page.locator('[data-resource-group] > summary').first();
  const desktop = await summary.evaluate((element) => ({
    display: getComputedStyle(element).display,
    columns: getComputedStyle(element).gridTemplateColumns.split(' ').length,
    height: element.getBoundingClientRect().height,
  }));
  expect(desktop.display).toBe('grid');
  expect(desktop.columns).toBeGreaterThanOrEqual(2);
  expect(desktop.height).toBeLessThanOrEqual(100);

  await page.getByRole('button', { name: '展开全表' }).click();
  await page.setViewportSize({ width: 320, height: 900 });
  const mobile = await summary.evaluate((element) => getComputedStyle(element).gridTemplateColumns.split(' ').length);
  expect(mobile).toBe(1);
  expect(await page.locator('html').evaluate((element) => element.scrollWidth)).toBe(320);
});

test('keeps the Source directory as a separate static route', async ({ page }) => {
  await page.goto('./resources/sources/');
  await expect(page.locator('[data-result-kind="source"]')).toHaveCount(sources.length);
  await expect(page.locator('[data-result-kind="work-item"]')).toHaveCount(0);
});

test('exposes fifteen unordered topic entries and combines factual filters in a shareable URL', async ({ page }) => {
  const target = resources[0];
  const expected = matchingResources(target);

  await page.goto('./resources/');
  await expect(page.locator('[data-resource-topic-control]')).toHaveCount(resourceTopics.length);
  await expect(page.locator('[data-resource-topic-control]')).toHaveCount(15);

  await page.getByLabel('资源主题', { exact: true }).selectOption(target.resourceTopicIds[0]);
  await page.getByLabel('知识主题').selectOption(target.knowledgeTopicIds[0]);
  await page.getByLabel('能力').selectOption(target.capabilityIds[0]);
  await page.getByLabel('可消费语言').selectOption(target.accessVersions[0].language);
  await page.getByLabel('媒介').selectOption(target.mediaType);
  await page.getByLabel('访问方式').selectOption(target.accessVersions[0].accessModel);
  await page.getByLabel('Source').selectOption(target.sourceId);

  const url = new URL(page.url());
  expect(url.searchParams.get('resourceTopic')).toBe(target.resourceTopicIds[0]);
  expect(url.searchParams.get('knowledgeTopic')).toBe(target.knowledgeTopicIds[0]);
  expect(url.searchParams.get('capability')).toBe(target.capabilityIds[0]);
  expect(url.searchParams.get('language')).toBe(target.accessVersions[0].language);
  expect(url.searchParams.get('mediaType')).toBe(target.mediaType);
  expect(url.searchParams.get('accessModel')).toBe(target.accessVersions[0].accessModel);
  expect(url.searchParams.get('source')).toBe(target.sourceId);

  await expect(page.locator('[data-result-kind="work-item"]:visible')).toHaveCount(expected.length);
  await expect(page.getByRole('status')).toHaveText(
    `共 ${expected.length} 条 Work Item`,
  );
});

test('restores filter state from reload, history and pageshow', async ({ page }) => {
  const target = resources[0];
  const expectedTopicCount = resources.filter(({ resourceTopicIds }) =>
    resourceTopicIds.includes(target.resourceTopicIds[0]),
  ).length;

  await page.goto(`./resources/?resourceTopic=${target.resourceTopicIds[0]}`);
  await expect(page.getByLabel('资源主题', { exact: true })).toHaveValue(target.resourceTopicIds[0]);
  await expect(page.locator('[data-result-kind="work-item"]:visible')).toHaveCount(expectedTopicCount);

  await page.getByLabel('媒介').selectOption(target.mediaType);
  await page.reload();
  await expect(page.getByLabel('资源主题', { exact: true })).toHaveValue(target.resourceTopicIds[0]);
  await expect(page.getByLabel('媒介')).toHaveValue(target.mediaType);

  await page.getByLabel('Source').selectOption(target.sourceId);
  await page.goBack();
  await expect(page.getByLabel('Source')).toHaveValue('all');
  await expect(page.getByLabel('资源主题', { exact: true })).toHaveValue(target.resourceTopicIds[0]);
  await expect(page.getByLabel('媒介')).toHaveValue(target.mediaType);
});

test('keeps Source facts and their Work Items available on static Source pages', async ({ page }) => {
  const source = sources[0];
  const sourceResources = resources.filter(({ sourceId }) => sourceId === source.id);

  await page.goto(`./sources/${source.id}/`);
  await expect(page.getByRole('heading', { name: source.name['zh-CN'], exact: true })).toBeVisible();
  await expect(page.getByText(source.summary['zh-CN'], { exact: true })).toBeVisible();
  await expect(
    page.locator('.source-detail-page__facts').getByText(source.languages.map(formatLanguage).join('、'), { exact: true }),
  ).toBeVisible();
  await expect(page.getByRole('link', { name: '访问 Source 主页' })).toHaveAttribute('href', source.homepage);
  await expect(page.locator('[data-result-kind="work-item"]')).toHaveCount(sourceResources.length);

  const externalSignals = 'externalSignals' in source && Array.isArray(source.externalSignals)
    ? source.externalSignals
    : [];
  for (const signal of externalSignals) {
    await expect(page.locator(`a[href="${signal.url}"]`)).toContainText(String(signal.value));
  }
});

test('renders raw external observations in catalog order without quality badges', async ({ page }) => {
  const resource = resources.find(({ externalSignals }) => (externalSignals?.length ?? 0) > 1);
  expect(resource).toBeTruthy();

  await page.goto('./resources/');
  const row = page.locator(`[data-result-id="${resource?.id}"]`);
  const observations = row.locator('[data-external-observation]');
  await expect(observations).toHaveCount(resource?.externalSignals?.length ?? 0);

  for (const [index, signal] of (resource?.externalSignals ?? []).entries()) {
    await expect(observations.nth(index)).toContainText(signal.provider);
    await expect(observations.nth(index)).toContainText(String(signal.value));
    await expect(observations.nth(index)).toContainText(signal.observedAt);
  }

  await expect(page.locator('main')).not.toContainText(/本站评分|排名|精选|已审核/);
});

test('uses one compact editorial row per Source and Work Item', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1100 });
  await page.goto('./resources/sources/');

  const sourceList = page.locator('.source-result-list');
  const sourceColumns = await sourceList.evaluate((element) => getComputedStyle(element).gridTemplateColumns);
  expect(sourceColumns.split(' ')).toHaveLength(1);

  const sourceRow = page.locator('.source-result').first();
  await expect(sourceRow.locator('[data-source-row-main]')).toHaveCount(1);
  await expect(sourceRow.locator('[data-source-row-facts]')).toHaveCount(1);

  await page.goto('./resources/');
  await page.getByRole('button', { name: '展开全表' }).click();
  const workRow = page.locator('.work-item-result').first();
  await expect(workRow.locator('[data-work-row-main]')).toHaveCount(1);
  await expect(workRow.locator('[data-work-row-facts]')).toHaveCount(1);
  await expect(workRow.locator('[data-work-row-access]')).toHaveCount(1);
});

test('keeps all collapsed Work Item facts compact at desktop and mobile widths', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1100 });
  await page.goto('./resources/');
  await page.getByRole('button', { name: '展开全表' }).click();

  const rows = page.locator('.work-item-result');
  await expect(rows).toHaveCount(resources.length);
  const desktopRows = await rows.evaluateAll((elements) => elements.map((row) => {
    const facts = row.querySelector<HTMLElement>('[data-work-row-facts]');
    return {
      zoneCounts: [
        row.querySelectorAll('[data-work-row-main]').length,
        row.querySelectorAll('[data-work-row-facts]').length,
        row.querySelectorAll('[data-work-row-access]').length,
      ],
      factColumns: facts ? getComputedStyle(facts).gridTemplateColumns.split(' ').length : 0,
      height: row.getBoundingClientRect().height,
    };
  }));

  expect(desktopRows.every(({ zoneCounts }) => zoneCounts.every((count) => count === 1))).toBe(true);
  expect(desktopRows.every(({ factColumns }) => factColumns >= 2)).toBe(true);
  expect(median(desktopRows.map(({ height }) => height))).toBeLessThanOrEqual(180);

  await page.setViewportSize({ width: 320, height: 900 });
  const mobileRows = await rows.evaluateAll((elements) => elements.map((row) => {
    const facts = row.querySelector<HTMLElement>('[data-work-row-facts]');
    return {
      factColumns: facts ? getComputedStyle(facts).gridTemplateColumns.split(' ').length : 0,
      height: row.getBoundingClientRect().height,
    };
  }));

  expect(mobileRows).toHaveLength(resources.length);
  expect(mobileRows.every(({ factColumns }) => factColumns >= 2)).toBe(true);
  expect(median(mobileRows.map(({ height }) => height))).toBeLessThanOrEqual(340);
});

test('keeps access versions and external observations in catalog order inside the disclosure', async ({ page }) => {
  const resource = resources.find(({ externalSignals }) => (externalSignals?.length ?? 0) > 1);
  expect(resource).toBeTruthy();

  await page.goto('./resources/');
  await page.getByRole('button', { name: '展开全表' }).click();
  const row = page.locator(`[data-result-id="${resource?.id}"]`);
  const disclosure = row.locator('.work-item-result__more');
  await expect(disclosure).toHaveCount(1);
  await disclosure.locator('summary').click();
  await expect(disclosure).toHaveAttribute('open', '');

  const versions = disclosure.locator('.access-version-list > li');
  await expect(versions).toHaveCount(resource?.accessVersions.length ?? 0);
  for (const [index, version] of (resource?.accessVersions ?? []).entries()) {
    await expect(versions.nth(index)).toContainText(formatLanguage(version.language));
    await expect(versions.nth(index).getByRole('link', { name: '访问此版本' })).toHaveAttribute('href', version.url);
  }

  const observations = disclosure.locator('[data-external-observation]');
  await expect(observations).toHaveCount(resource?.externalSignals?.length ?? 0);
  for (const [index, signal] of (resource?.externalSignals ?? []).entries()) {
    await expect(observations.nth(index)).toContainText(signal.provider);
    await expect(observations.nth(index)).toContainText(String(signal.value));
    await expect(observations.nth(index)).toContainText(signal.observedAt);
  }
});

test('keeps all Sources and Work Items readable without JavaScript while controls explain their state', async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();

  await page.goto(`${projectBasePath}resources/`);
  await expect(page.locator('[data-resource-group]')).toHaveCount(resourceTopics.length);
  await expect(page.locator('[data-result-kind="work-item"]')).toHaveCount(resources.length);
  await expect(page.locator('[data-resource-filter]')).toHaveCount(7);
  for (const control of await page.locator('[data-resource-filter]').all()) {
    await expect(control).toBeDisabled();
  }
  await expect(page.locator('[data-resource-table-control]')).toHaveCount(2);
  for (const control of await page.locator('[data-resource-table-control]').all()) {
    await expect(control).toBeDisabled();
  }
  await expect(page.locator('.script-required-note')).toContainText('当前可逐个展开 15 个资源主题，全部 148 条 Work Item 均可访问');

  await context.close();
});

test('keeps topic collection pages available with their complete factual result set', async ({ page }) => {
  const topic = resourceTopics.find(({ id }) => id === 'playtesting');
  expect(topic).toBeTruthy();
  const topicResources = resources.filter(({ resourceTopicIds }) => resourceTopicIds.includes(topic?.id ?? ''));

  await page.goto('./resources/topics/playtesting/');
  await expect(page.getByRole('heading', { name: topic?.title['zh-CN'], exact: true })).toBeVisible();
  await expect(page.locator('[data-result-kind="work-item"]')).toHaveCount(topicResources.length);
  await expect(page.getByRole('link', { name: '在全部资源中继续筛选' })).toHaveAttribute(
    'href',
    `${projectBasePath}resources/?resourceTopic=playtesting`,
  );
});

test('filter option sets come from the catalog', async ({ page }) => {
  await page.goto('./resources/');

  await expect(page.getByLabel('资源主题').locator('option:not([value="all"])')).toHaveCount(resourceTopics.length);
  await expect(page.getByLabel('知识主题').locator('option:not([value="all"])')).toHaveCount(knowledgeTopics.length);
  await expect(page.getByLabel('能力').locator('option:not([value="all"])')).toHaveCount(capabilities.length);
  await expect(page.getByLabel('Source').locator('option:not([value="all"])')).toHaveCount(sources.length);
});
