import { expect, test } from '@playwright/test';
import capabilities from '../../src/data/capabilities.json' with { type: 'json' };

test('renders independent local progress for every capability without an embedded career control', async ({ page, request }) => {
  for (const capability of capabilities) {
    const response = await request.get(`capabilities/${capability.id}/`);
    expect(response.status(), capability.id).toBe(200);
    expect(await response.text()).toContain(`data-capability-id="${capability.id}"`);
  }

  await page.goto('./map/');
  await expect(page.getByLabel('参考职业画像')).toHaveCount(0);
  await expect(page.locator('[data-role-marker]')).toHaveCount(0);

  await page.getByRole('link', { name: '核心循环设计', exact: true }).click();
  const firstProgress = page.getByLabel('个人学习状态');
  await expect(firstProgress).toBeEnabled();
  await firstProgress.selectOption('can-guide');
  await expect(page.locator('.progress-panel__current')).toHaveText('能够指导或评审他人');

  await page.getByLabel('面包屑').getByRole('link', { name: '能力地图', exact: true }).click();
  await page.getByRole('link', { name: '体验目标建构', exact: true }).click();
  const secondProgress = page.getByLabel('个人学习状态');
  await expect(secondProgress).toHaveValue('unseen');
  await secondProgress.selectOption('understood');
  await page.reload();
  await expect(secondProgress).toHaveValue('understood');

  await page.getByLabel('面包屑').getByRole('link', { name: '能力地图', exact: true }).click();
  await page.getByRole('link', { name: '核心循环设计', exact: true }).click();
  await expect(page.getByLabel('个人学习状态')).toHaveValue('can-guide');
  await expect(page.locator('main')).not.toContainText(/\d+(?:\.\d+)?\s*(?:%|分)|\d+\s*\/\s*\d+/);
});

test('keeps the complete map and personal record contract usable without JavaScript', async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false, viewport: { width: 320, height: 900 } });
  const page = await context.newPage();

  await page.goto('./map/');
  await expect(page.getByRole('heading', { name: '用领域建立方向，用能力选择行动。' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Playtest', exact: true })).toBeVisible();
  await expect(page.getByLabel('参考职业画像')).toHaveCount(0);
  const playtestNode = page.getByRole('link', { name: 'Playtest', exact: true }).locator('../..');
  await playtestNode.getByText('查看关系', { exact: true }).click();
  await expect(playtestNode.getByText('它支持', { exact: true })).toBeVisible();
  await expect(playtestNode.getByText('受到支持', { exact: true })).toBeVisible();
  await expect(playtestNode.getByText('互补', { exact: true })).toBeVisible();

  await page.getByRole('link', { name: 'Playtest', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Playtest', exact: true })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Playtest 主题资源集合' })).toBeVisible();
  await expect(page.getByLabel('个人学习状态')).toBeDisabled();
  await expect(page.getByText('启用 JavaScript 后可以保存个人学习状态。', { exact: true })).toBeVisible();

  await context.close();
});
