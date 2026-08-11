import { expect, test } from '@playwright/test';
import capabilities from '../../src/data/capabilities.json' with { type: 'json' };

test('renders independent local progress for every capability beside the embedded career lenses', async ({ page, request }) => {
  for (const capability of capabilities) {
    const response = await request.get(`capabilities/${capability.id}/`);
    expect(response.status(), capability.id).toBe(200);
    expect(await response.text()).toContain(`data-capability-id="${capability.id}"`);
  }

  await page.goto('./map/');
  await expect(page.locator('[data-career-lens-button]')).toHaveCount(3);
  await expect(page.locator('[data-role-marker]')).toHaveCount(0);

  await page.goto('./capabilities/core-loop-design/');
  const firstProgress = page.getByLabel('个人学习状态');
  await expect(firstProgress).toBeEnabled();
  await firstProgress.selectOption('can-guide');
  await expect(page.locator('.progress-panel__current')).toHaveText('能够指导或评审他人');

  await page.goto('./capabilities/experience-framing/');
  const secondProgress = page.getByLabel('个人学习状态');
  await expect(secondProgress).toHaveValue('unseen');
  await secondProgress.selectOption('understood');
  await page.reload();
  await expect(secondProgress).toHaveValue('understood');

  await page.goto('./capabilities/core-loop-design/');
  await expect(page.getByLabel('个人学习状态')).toHaveValue('can-guide');
  await expect(page.locator('main')).not.toContainText(/\d+(?:\.\d+)?\s*(?:%|分)|\d+\s*\/\s*\d+/);
});

test('keeps the complete map and personal record contract usable without JavaScript', async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false, viewport: { width: 320, height: 900 } });
  const page = await context.newPage();

  await page.goto('./map/');
  await expect(page.getByRole('heading', { name: '从体验出发，理解设计如何成为结果。', exact: true })).toBeVisible();
  await expect(page.locator('[data-career-lens-button]:disabled')).toHaveCount(3);
  const relationships = page.locator('[data-egds-map] [data-outline-relations-disclosure]');
  await relationships.locator(':scope > summary').click();
  await expect(relationships).toContainText('Playtest');
  await expect(relationships.getByRole('link', { name: '玩家行为观察', exact: true }).first()).toBeVisible();

  await relationships.getByRole('link', { name: 'Playtest', exact: true }).first().click();
  await expect(page.getByRole('heading', { name: 'Playtest', exact: true })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Playtest 主题资源集合' })).toBeVisible();
  await expect(page.getByLabel('个人学习状态')).toBeDisabled();
  await expect(page.getByText('启用 JavaScript 后可以保存个人学习状态。', { exact: true })).toBeVisible();

  await context.close();
});
