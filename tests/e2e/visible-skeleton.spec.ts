import { expect, test } from '@playwright/test';

test('publishes the visible map skeleton and repository-backed project pages', async ({ page }) => {
  await page.goto('./');

  await expect(page.getByRole('link', { name: '看地图' })).toBeVisible();
  await expect(page.getByText('找位置', { exact: true })).toBeVisible();
  await expect(page.getByText('向前走', { exact: true })).toBeVisible();

  await page.getByRole('link', { name: '看地图' }).click();

  for (const heading of [
    '体验设计',
    '玩法与挑战',
    '叙事',
    '美学与表现',
    '生产与落地',
    '迭代与验证',
    '领导与协作',
    '产品与商业',
    '创新与沿革',
  ]) {
    await expect(page.getByRole('heading', { name: heading, exact: true })).toBeVisible();
  }

  await expect(page.getByRole('link', { name: 'Playtest' })).toBeVisible();

  const repositoryPages = [
    ['Roadmap', 'Learn About Games Roadmap'],
    ['Changelog', 'Changelog'],
    ['Devlog', '项目 Devlog'],
    ['Methodology', '方法论'],
    ['Contributing', '贡献指南'],
  ] as const;

  for (const [navName, heading] of repositoryPages) {
    await page.getByRole('link', { name: navName, exact: true }).click();
    await expect(page.getByRole('heading', { name: heading, exact: true })).toBeVisible();
  }
});

test('keeps every shared navigation link in the 320px viewport', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 720 });
  await page.goto('./');

  for (const navName of [
    'Map',
    'Roadmap',
    'Changelog',
    'Devlog',
    'Methodology',
    'Contributing',
  ]) {
    await expect(page.getByRole('navigation').getByRole('link', { name: navName, exact: true })).toBeInViewport();
  }
});
