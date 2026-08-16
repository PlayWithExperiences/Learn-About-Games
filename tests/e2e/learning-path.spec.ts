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
  await expect(page.locator('[data-learning-path-stage="deconstruct"]')).toContainText('解构');
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

test('links the resources navigation to the path without changing the resource table', async ({ page }) => {
  await page.goto('./resources/');
  await expect(page.getByRole('link', { name: '学习路径' })).toHaveAttribute('href', /resources\/paths\/game-feel\/$/);
  await page.goto('./resources/paths/game-feel/');
  await expect(page.getByRole('link', { name: '来源' })).toHaveAttribute('href', /resources\/sources\/$/);
});
