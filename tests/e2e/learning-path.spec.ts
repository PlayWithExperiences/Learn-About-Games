import { expect, test } from '@playwright/test';

test.setTimeout(120_000);

test('exposes the game-feel learning path and its EGDS stages', async ({ page, request }) => {
  const response = await request.get('resources/paths/game-feel/');
  expect(response.status()).toBe(200);

  await page.goto('./resources/paths/game-feel/');
  await expect(page.getByRole('heading', { name: '手感与反馈成长路径', exact: true })).toBeVisible();
  await expect(page.locator('[data-learning-path-stage]')).toHaveCount(6);
  await expect(page.locator('[data-learning-path-resource]')).toHaveCount(100);
  await expect(page.locator('[data-learning-path-stage="observe"]')).toContainText('感受');
  await expect(page.locator('[data-learning-path-stage="understand"]')).toContainText('理解');
  await expect(page.locator('[data-learning-path-stage="deconstruct"]')).toContainText('归因');
  await expect(page.locator('[data-learning-path-stage="reconstruct"]')).toContainText('重构');
  await expect(page.getByRole('link', { name: '资源表', exact: true })).toHaveAttribute('href', /resources\/$/);

  const resourceLinks = page.locator('[data-learning-path-resource] a');
  expect(await resourceLinks.evaluateAll((links) => links.every((link) => {
    const url = new URL(link.getAttribute('href') ?? '', window.location.href);
    return url.pathname.endsWith('/resources/') && url.searchParams.has('q');
  }))).toBe(true);
});

test('keeps each path stage readable without JavaScript and at mobile width', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 900 });
  await page.goto('./resources/paths/game-feel/');
  await expect(page.locator('[data-learning-path-stage]')).toHaveCount(6);
  expect(await page.locator('html').evaluate((element) => element.scrollWidth)).toBe(320);

  const firstStage = page.locator('[data-learning-path-stage="observe"]');
  await expect(firstStage).toHaveAttribute('open', '');
  await firstStage.locator(':scope > summary').click();
  await expect(firstStage).not.toHaveAttribute('open', '');
});

test('narrows the path with overlapping focus facets and restores the full route', async ({ page }) => {
  await page.goto('./resources/paths/game-feel/');
  await expect(page.locator('[data-learning-path-focus]')).toHaveCount(7);
  await expect(page.locator('[data-learning-path-focus="all"]')).toHaveAttribute('aria-pressed', 'true');
  await expect(page.locator('[data-learning-path-resource]:not([hidden])')).toHaveCount(100);

  await page.locator('[data-learning-path-focus="narrative"]').click();
  await expect(page.locator('[data-learning-path-focus="narrative"]')).toHaveAttribute('aria-pressed', 'true');
  await expect(page.locator('[data-learning-path-focus-status]')).toContainText('叙事与表达');
  const narrativeRows = page.locator('[data-learning-path-resource]:not([hidden])');
  expect(await narrativeRows.count()).toBeGreaterThan(0);
  expect(await narrativeRows.evaluateAll((rows) => rows.every((row) => (
    row.getAttribute('data-learning-path-facets') ?? ''
  ).split(' ').includes('narrative')))).toBe(true);

  await page.locator('[data-learning-path-focus="all"]').click();
  await expect(page.locator('[data-learning-path-resource]:not([hidden])')).toHaveCount(100);
});

test('keeps every path resource readable without JavaScript and explains the facet controls', async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false, viewport: { width: 320, height: 900 } });
  const page = await context.newPage();
  await page.goto('http://127.0.0.1:4321/Learn-About-Games/resources/paths/game-feel/');
  await expect(page.locator('[data-learning-path-focus]')).toHaveCount(7);
  await expect(page.locator('[data-learning-path-focus]:disabled')).toHaveCount(7);
  await expect(page.locator('[data-learning-path-focus-no-js-note]')).toContainText('全部资料仍可读');
  await expect(page.locator('[data-learning-path-resource]')).toHaveCount(100);
  expect(await page.locator('html').evaluate((element) => element.scrollWidth)).toBe(320);
  await context.close();
});

test('links the resources navigation to the path without changing the resource table', async ({ page }) => {
  await page.goto('./resources/');
  await expect(page.getByRole('link', { name: '学习路径' })).toHaveAttribute('href', /resources\/paths\/game-feel\/$/);
  await page.goto('./resources/paths/game-feel/');
  await expect(page.getByRole('link', { name: '来源' })).toHaveAttribute('href', /resources\/sources\/$/);
});
