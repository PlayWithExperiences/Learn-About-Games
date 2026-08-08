import { expect, test } from '@playwright/test';

test('keeps a contextual role lens separate from local Playtest progress', async ({ page }) => {
  await page.goto('./map/');

  const profileSelect = page.getByLabel('参考职业画像');
  await profileSelect.selectOption('aaa-game-designer');
  await expect(page.locator('[data-role-context="aaa-game-designer"]:not([hidden]) strong')).toHaveText(
    'AAA / Game Designer',
  );
  await expect(page.getByText('核心 · 执行与解读', { exact: true })).toBeVisible();
  await expect(page.getByText('重要 · 协作贡献', { exact: true })).toHaveCount(2);
  await expect(page.getByText('建议了解 · 理解判断', { exact: true })).toHaveCount(2);

  await page.getByRole('link', { name: 'Playtest', exact: true }).click();
  const progressSelect = page.getByLabel('个人学习状态');
  await progressSelect.selectOption('practiced');
  await expect(page.locator('.progress-panel__current')).toHaveText('做过练习');

  await page.reload();
  await expect(progressSelect).toHaveValue('practiced');

  await page.goBack();
  await expect(profileSelect).toHaveValue('aaa-game-designer');
  await page.getByRole('button', { name: '清除参考画像' }).click();
  await expect(profileSelect).toHaveValue('');

  await page.getByRole('link', { name: 'Playtest', exact: true }).click();
  await expect(page.getByLabel('个人学习状态')).toHaveValue('practiced');
  await expect(page.locator('.progress-panel__current')).toHaveText('做过练习');
  await expect(page.locator('body')).not.toContainText(/\d+(?:\.\d+)?\s*(?:%|分)|\d+\s*\/\s*\d+/);
});
