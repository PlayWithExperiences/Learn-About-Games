import { expect, test } from '@playwright/test';
import capabilities from '../../src/data/capabilities.json' with { type: 'json' };
import resources from '../../src/data/resources.json' with { type: 'json' };

const valveVideoUrl = 'https://www.youtube.com/watch?v=9Yomqk0C6kE';
const playtestArticleUrl = 'https://medill-east.github.io/2025/08/24/20250824-how-to-run-a-good-playtest/';

test('guides a learner from the home page to the unordered Playtest topic collection', async ({ page }) => {
  await page.goto('./');
  await page.getByRole('link', { name: '看地图' }).click();

  const playtestLink = page.getByRole('link', { name: 'Playtest', exact: true });
  await expect(playtestLink).toHaveAttribute('href', '/Learn-About-Games/capabilities/playtesting/');
  await playtestLink.click();

  await expect(page.getByRole('heading', { name: 'Playtest', exact: true })).toBeVisible();
  await page.getByRole('link', { name: 'Playtest 主题资源集合' }).click();

  await expect(page.getByRole('heading', { name: 'Playtest 主题资源集合' })).toBeVisible();
  await expect(page.getByText('按顺序阅读或观看')).toHaveCount(0);
  await expect(page.locator(`a[href="${valveVideoUrl}"]`)).toHaveCount(1);
  await expect(page.locator(`a[href="${playtestArticleUrl}"]`)).toHaveCount(1);
  await expect(page.getByText('zh-CN · 免费 · 原版 · 原文 · 检查于 2026-08-08', { exact: true })).toBeVisible();
  await expect(page.getByText('en · 免费 · 官方译制 · 双语 · 检查于 2026-08-08', { exact: true })).toBeVisible();
});

test('filters work items by consumable access-version language', async ({ page }) => {
  await page.goto('./resources/');

  const languageSelect = page.getByLabel('可消费语言');
  const resultCount = page.getByRole('status');

  for (const language of ['zh-CN', 'en', 'all'] as const) {
    await languageSelect.selectOption(language);
    const visibleResources = resources.filter((resource) =>
      language === 'all' || resource.accessVersions.some((version) => version.language === language),
    );
    await expect(resultCount).toHaveText(`共 ${visibleResources.length} 条 Work Item`);
    await expect(page.locator('.resource-card:visible')).toHaveCount(visibleResources.length);
    for (const resource of resources) {
      const card = page.locator('.resource-card').filter({ hasText: resource.title['zh-CN'] });
      if (visibleResources.includes(resource)) {
        await expect(card).toBeVisible();
      } else {
        await expect(card).toBeHidden();
      }
    }
  }

  const playtestArticle = page.locator('.resource-card').filter({ hasText: '如何进行好的 Playtest' });
  await expect(playtestArticle.locator(`a[href="${playtestArticleUrl}"]`)).toHaveCount(1);
  await expect(playtestArticle.getByText('zh-CN · 免费 · 原版 · 原文 · 检查于 2026-08-08', { exact: true })).toBeVisible();
  await expect(playtestArticle.getByText('en · 免费 · 官方译制 · 双语 · 检查于 2026-08-08', { exact: true })).toBeVisible();
});

test('reapplies the selected language filter after history back', async ({ page }) => {
  await page.goto('./resources/');

  const languageSelect = page.getByLabel('可消费语言');
  const playtestArticle = page.locator('.resource-card').filter({ hasText: '如何进行好的 Playtest' });

  await languageSelect.selectOption('zh-CN');
  await page.getByRole('link', { name: 'Map', exact: true }).click();
  await page.goBack();

  await expect(languageSelect).toHaveValue('zh-CN');
  await expect(page.getByRole('status')).toHaveText(`共 ${resources.filter((resource) => resource.accessVersions.some((version) => version.language === 'zh-CN')).length} 条 Work Item`);
  await expect(playtestArticle).toBeVisible();
  for (const resource of resources.filter((resource) => !resource.accessVersions.some((version) => version.language === 'zh-CN'))) {
    await expect(page.locator('.resource-card').filter({ hasText: resource.title['zh-CN'] })).toBeHidden();
  }
});

test('keeps all work items available without JavaScript', async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();

  await page.goto('./resources/');
  for (const resource of resources) {
    await expect(page.locator('.resource-card').filter({ hasText: resource.title['zh-CN'] })).toBeVisible();
  }
  await expect(page.getByLabel('可消费语言')).toBeDisabled();
  await expect(page.locator('.script-required-note')).toHaveText(
    '启用 JavaScript 后可以按可消费语言筛选；当前列出全部 Work Item。',
  );

  await context.close();
});

test('keeps every capability directly reachable without trail or review semantics', async ({ page }) => {
  await page.goto('./map/');

  for (const capability of capabilities) {
    const link = page.getByRole('link', { name: capability.name['zh-CN'], exact: true });
    await expect(link).toBeVisible();
    await link.click();
    await expect(page.getByRole('heading', { name: capability.name['zh-CN'], exact: true })).toBeVisible();
    await page.goBack();
  }

  await expect(page.locator('main')).not.toContainText(/已策展|候选|审核|学习路径|按顺序/);
});

test('redirects the retired Playtest trail URL to its topic collection', async ({ page }) => {
  await page.goto('./trails/playtesting-foundations/');
  await expect(page).toHaveURL(/\/resources\/topics\/playtesting\/$/);
  await expect(page.getByRole('heading', { name: 'Playtest 主题资源集合' })).toBeVisible();
});
