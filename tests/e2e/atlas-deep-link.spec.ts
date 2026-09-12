import { expect, test } from '@playwright/test';

test('initial history deep link keeps the selected object in the map viewport', async ({ page }) => {
  await page.setViewportSize({width:390,height:844});
  await page.goto('./atlas/#atlas-node-detail-slay-the-spire-2-ea');
  const selected = page.locator('[data-history-node="slay-the-spire-2-ea"]');
  await expect(page.locator('[data-history-inspector]')).toContainText('不是完整1.0');
  await expect(selected).toBeInViewport();
  const node = await selected.boundingBox();
  const panel = await page.locator('[data-history-inspector]').boundingBox();
  expect(node!.y + node!.height).toBeLessThanOrEqual(panel!.y);
});

test('music innovation lens exposes an observation with its carrier', async ({ page }) => {
  await page.setViewportSize({width:1280,height:800});
  await page.goto('./atlas/network/');
  const family = page.locator('[data-atlas-family="rhythm-party"]');
  await family.locator('summary').click();
  await family.locator('[data-atlas-theme-button="music-performance-history"]').click();
  await expect(page.locator('[data-atlas-event-empty]')).toBeHidden();
  await expect(page.locator('[data-atlas-node-id="ensemble-performance"]')).toHaveAttribute('data-theme-match','true');
});

test('tabletop predecessors remain distinct and lead to their digital influence', async ({ page }) => {
  await page.goto('./atlas/#atlas-node-detail-dominion');
  const inspector = page.locator('[data-history-inspector]');
  await expect(inspector).toContainText('桌面游戏');
  await expect(inspector).toContainText('2008');
  await inspector.locator('[data-history-jump="slay-the-spire"]').click();
  await expect(page).toHaveURL(/#atlas-node-detail-slay-the-spire$/);
});
