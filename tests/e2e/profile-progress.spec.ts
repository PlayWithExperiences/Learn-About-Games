import { expect, test } from '@playwright/test';
import capabilities from '../../src/data/capabilities.json' with { type: 'json' };
import roleProfiles from '../../src/data/role-profiles.json' with { type: 'json' };

const aaaGameDesigner = roleProfiles.find(({ id }) => id === 'aaa-game-designer');
if (!aaaGameDesigner) throw new Error('Expected the AAA · Game Designer seed profile.');

const priorityLabels: Record<string, string> = { core: '核心', important: '重要', suggested: '建议了解' };
const responsibilityLabels: Record<string, string> = { execute: '亲自执行', contribute: '协作贡献', decide: '判断', direct: '指导' };

test('keeps a contextual role lens separate from local Playtest progress', async ({ page }) => {
  await page.goto('./map/');

  const profileSelect = page.getByLabel('参考职业画像');
  const visibleRoleMarkers = page.locator('[data-role-marker]:visible');
  await expect(visibleRoleMarkers).toHaveCount(0);
  await expect(profileSelect).toBeEnabled();
  await profileSelect.selectOption('aaa-game-designer');
  await expect(visibleRoleMarkers).toHaveCount(aaaGameDesigner.capabilities.length);
  await expect(page.locator('[data-role-context="aaa-game-designer"]:not([hidden]) strong')).toHaveText(
    aaaGameDesigner.title['zh-CN'],
  );
  for (const entry of aaaGameDesigner.capabilities) {
    const capability = capabilities.find(({ id }) => id === entry.capabilityId);
    if (!capability) throw new Error(`Missing seeded capability ${entry.capabilityId}.`);
    const marker = page.locator(`[data-role-marker="${entry.capabilityId}"]`);
    await expect(marker).toHaveText(`${priorityLabels[entry.priority]} · ${responsibilityLabels[entry.responsibility]}`);
  }
  await expect(page.getByText(`最近复核：${aaaGameDesigner.reviewedAt}`, { exact: true })).toBeVisible();
  for (const basisLink of aaaGameDesigner.basisLinks) {
    const link = page.getByRole('link', { name: basisLink.title['zh-CN'], exact: true });
    await expect(link).toHaveAttribute('href', basisLink.url);
    await expect(link.locator('..')).toContainText(basisLink.sourceNote['zh-CN']);
  }
  await expect(page.locator('main')).not.toContainText(/\d+(?:\.\d+)?\s*(?:%|分)|\d+\s*\/\s*\d+/);

  await page.getByRole('link', { name: 'Playtest', exact: true }).click();
  const progressSelect = page.getByLabel('个人学习状态');
  await progressSelect.selectOption('practiced');
  await expect(page.locator('.progress-panel__current')).toHaveText('做过练习');

  await page.reload();
  await expect(progressSelect).toHaveValue('practiced');

  await page.goBack();
  await expect(profileSelect).toHaveValue('aaa-game-designer');
  await expect(profileSelect).toBeEnabled();
  await page.getByRole('button', { name: '清除参考画像' }).click();
  await expect(profileSelect).toHaveValue('');
  await expect(visibleRoleMarkers).toHaveCount(0);
  await expect(page.getByText(`${priorityLabels.core} · ${responsibilityLabels.execute}`, { exact: true })).toBeHidden();

  await page.getByRole('link', { name: 'Playtest', exact: true }).click();
  await expect(page.getByLabel('个人学习状态')).toHaveValue('practiced');
  await expect(page.locator('.progress-panel__current')).toHaveText('做过练习');
  await expect(page.locator('body')).not.toContainText(/\d+(?:\.\d+)?\s*(?:%|分)|\d+\s*\/\s*\d+/);
});

test('keeps JavaScript-only controls visible but unavailable without JavaScript', async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();

  await page.goto('./map/');
  await expect(page.getByRole('heading', { name: '用领域建立方向，用能力选择行动。' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Playtest', exact: true })).toBeVisible();
  await expect(page.getByRole('navigation').getByRole('link', { name: 'Resources', exact: true })).toBeVisible();
  await expect(page.getByLabel('参考职业画像')).toBeDisabled();
  await expect(page.getByText('启用 JavaScript 后可以应用或清除参考职业画像。', { exact: true })).toBeVisible();

  await page.goto('./capabilities/playtesting/');
  await expect(page.getByRole('heading', { name: 'Playtest', exact: true })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Playtest 主题资源集合' })).toBeVisible();
  await expect(page.getByLabel('个人学习状态')).toBeDisabled();
  await expect(page.getByText('启用 JavaScript 后可以保存个人学习状态。', { exact: true })).toBeVisible();

  await context.close();
});
