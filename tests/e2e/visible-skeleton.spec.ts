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

test('maps repository-backed Markdown links to public site routes', async ({ page }) => {
  await page.goto('./project/readme/');
  const document = page.locator('article.prose');

  for (const [label, href] of [
    ['Roadmap', '/Learn-About-Games/project/roadmap/'],
    ['Changelog', '/Learn-About-Games/project/changelog/'],
    ['Methodology', '/Learn-About-Games/project/methodology/'],
    ['Contributing', '/Learn-About-Games/project/contributing/'],
    ['Devlog', '/Learn-About-Games/devlog/2026-08-08-project-origin/'],
  ] as const) {
    await expect(document.getByRole('link', { name: label, exact: true })).toHaveAttribute('href', href);
  }

  await page.goto('./project/roadmap/');
  await expect(page.locator('article.prose').getByRole('link', { name: 'CHANGELOG.md' })).toHaveAttribute(
    'href',
    '/Learn-About-Games/project/changelog/',
  );
});

test('maps non-public Markdown links to absolute repository URLs', async ({ page }) => {
  await page.goto('./project/readme/');
  const document = page.locator('article.prose');

  for (const [label, repoPath] of [
    ['项目入口', 'AGENTS.md'],
    ['Claude 入口', 'CLAUDE.md'],
    ['当前决策摘要', 'docs/journal/2026-08-08-learn-about-games-decision-summary.md'],
    ['产品设计', 'docs/superpowers/specs/2026-08-08-learn-about-games-design.md'],
  ] as const) {
    await expect(document.getByRole('link', { name: label, exact: true })).toHaveAttribute(
      'href',
      `https://github.com/PlayWithExperiences/Learn-About-Games/blob/main/${repoPath}`,
    );
  }
});

test('does not claim that the M0 skeleton is already published', async ({ page }) => {
  await page.goto('./project/changelog/');

  await expect(
    page.getByText('发布 M0 的首个可见能力地图骨架，展示 9 个领域与 9 个能力入口，并明确尚未策展的路径状态。', {
      exact: true,
    }),
  ).toHaveCount(0);
});
