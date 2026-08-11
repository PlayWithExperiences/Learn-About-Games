import { expect, test } from '@playwright/test';
import capabilities from '../../src/data/capabilities.json' with { type: 'json' };
import resources from '../../src/data/resources.json' with { type: 'json' };

const playtestingResources = resources.filter(({ resourceTopicIds }) => resourceTopicIds.includes('playtesting'));

test('guides a learner from the home page to the unordered Playtest topic collection', async ({ page }) => {
  await page.goto('./');
  await page.getByRole('link', { name: '看全貌' }).click();

  const map = page.locator('[data-egds-map]');
  await expect(map.locator('[data-expand-framework-node]').first()).toBeEnabled();
  await map.evaluate((root) => root.dispatchEvent(new CustomEvent('egds-map:focus-capability', {
    bubbles: true,
    detail: { capabilityId: 'playtesting' },
  })));
  const playtestLink = map
    .locator('[data-map-entity-key="capability:playtesting"] [data-map-entity-detail]')
    .filter({ visible: true });
  await expect(playtestLink).toHaveAttribute('href', '/Learn-About-Games/capabilities/playtesting/');
  await playtestLink.click();

  await expect(page.getByRole('heading', { name: 'Playtest', exact: true })).toBeVisible();
  const topicFilterLink = page.getByRole('link', { name: 'Playtest 主题资源集合' });
  await expect(topicFilterLink).toHaveAttribute(
    'href',
    '/Learn-About-Games/resources/?resourceTopic=playtesting',
  );
  await topicFilterLink.click();

  await expect(page).toHaveURL(/\/resources\/\?resourceTopic=playtesting$/);
  await expect(page.getByRole('heading', { name: '按主题与事实浏览游戏学习资源' })).toBeVisible();
  await expect(page.getByLabel('资源主题', { exact: true })).toHaveValue('playtesting');
  await expect(page.getByText('按顺序阅读或观看')).toHaveCount(0);
  await expect(page.locator('[data-result-kind="work-item"]:visible')).toHaveCount(playtestingResources.length);
  for (const resource of playtestingResources) {
    const row = page.locator(`[data-result-id="${resource.id}"]`);
    await expect(row.getByRole('heading', { name: resource.title['zh-CN'], exact: true })).toBeVisible();
    await expect(row.locator(`a[href="${resource.canonicalUrl}"]`).first()).toBeVisible();
  }
});

test('filters work items by consumable access-version language', async ({ page }) => {
  await page.goto('./resources/');

  const languageSelect = page.getByLabel('可消费语言');
  const resultCount = page.getByRole('status');

  const languages = [...new Set(resources.flatMap(({ accessVersions }) => accessVersions.map(({ language }) => language)))];
  for (const language of [...languages, 'all']) {
    await languageSelect.selectOption(language);
    const visibleResources = resources.filter((resource) =>
      language === 'all' || resource.accessVersions.some((version) => version.language === language),
    );
    await expect(resultCount).toHaveText(`共 ${visibleResources.length} 条 Work Item`);
    for (const resource of resources) {
      const card = page.locator(`[data-result-kind="work-item"][data-result-id="${resource.id}"]`);
      if (visibleResources.includes(resource)) {
        await expect(card).not.toHaveAttribute('hidden', '');
      } else {
        await expect(card).toHaveAttribute('hidden', '');
      }
    }
  }

  const firstResource = resources[0];
  await page.getByRole('button', { name: '展开全表' }).click();
  const firstResourceRow = page.locator(`[data-result-id="${firstResource.id}"]`);
  await expect(firstResourceRow.locator(`a[href="${firstResource.canonicalUrl}"]`).first()).toBeVisible();
});

test('reapplies the selected language filter after history back', async ({ page }) => {
  await page.goto('./resources/');

  const languageSelect = page.getByLabel('可消费语言');
  const firstMatchingResource = resources.find((resource) =>
    resource.accessVersions.some((version) => version.language === 'zh-Hans'),
  );
  expect(firstMatchingResource).toBeTruthy();
  const matchingRow = page.locator(`[data-result-id="${firstMatchingResource?.id}"]`);

  await languageSelect.selectOption('zh-Hans');
  const compactMenu = page.locator('details.site-nav__compact');
  if (await compactMenu.isVisible()) {
    await compactMenu.locator('summary').click();
    await compactMenu.getByRole('link', { name: '能力地图', exact: true }).click();
  } else {
    await page.getByRole('navigation', { name: '主导航' }).getByRole('link', { name: '能力地图', exact: true }).click();
  }
  await page.goBack();

  const matchingResources = resources.filter((resource) =>
    resource.originalLanguage === 'zh-Hans'
    || resource.accessVersions.some((version) => version.language === 'zh-Hans'),
  );
  await expect(languageSelect).toHaveValue('zh-Hans');
  await expect(page.getByRole('status')).toHaveText(
    `共 ${matchingResources.length} 条 Work Item`,
  );
  await expect(matchingRow).toBeVisible();
  for (const resource of resources.filter((resource) => !matchingResources.includes(resource))) {
    await expect(page.locator(`[data-result-kind="work-item"][data-result-id="${resource.id}"]`)).toBeHidden();
  }
});

test('keeps all work items available without JavaScript', async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();

  await page.goto('./resources/');
  for (const resource of resources) {
    await expect(page.locator(`[data-result-kind="work-item"][data-result-id="${resource.id}"]`)).toHaveCount(1);
  }
  await expect(page.getByLabel('可消费语言')).toBeDisabled();
  await expect(page.locator('.script-required-note')).toContainText(
    `当前可逐个展开 15 个资源主题，全部 ${resources.length} 条 Work Item 均可访问`,
  );

  await context.close();
});

test('keeps every capability directly reachable without trail or review semantics', async ({ page }) => {
  for (const capability of capabilities) {
    await page.goto('./map/');
    const map = page.locator('[data-egds-map]');
    await expect(map.locator('[data-expand-framework-node]').first()).toBeEnabled();
    await map.evaluate((root, capabilityId) => root.dispatchEvent(new CustomEvent('egds-map:focus-capability', {
      bubbles: true,
      detail: { capabilityId },
    })), capability.id);
    const link = map
      .locator(`[data-map-entity-key="capability:${capability.id}"] [data-map-entity-detail]`)
      .filter({ visible: true });
    await expect(link).toHaveAttribute('href', `/Learn-About-Games/capabilities/${capability.id}/`);
    await link.click();
    await expect(page.getByRole('heading', { name: capability.name['zh-CN'], exact: true })).toBeVisible();
  }

  await expect(page.locator('main')).not.toContainText(/已策展|候选|审核|学习路径|按顺序/);
});

test('redirects the retired Playtest trail URL to its topic collection', async ({ page }) => {
  await page.goto('./trails/playtesting-foundations/');
  await expect(page).toHaveURL(/\/resources\/topics\/playtesting\/$/);
  await expect(page.getByRole('heading', { name: 'Playtest 主题资源集合' })).toBeVisible();
});
