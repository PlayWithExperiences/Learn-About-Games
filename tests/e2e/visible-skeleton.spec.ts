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

test('describes the shipped Playtest slice as available now', async ({ page }) => {
  await page.goto('./');
  await expect(
    page.getByText(
      '当前 M0 公开 9 个领域和 9 个能力入口。Playtest 已提供可走通的学习切片；其他路径不会伪装成已经完成。',
      { exact: true },
    ),
  ).toBeVisible();

  await page.getByRole('link', { name: '打开能力地图' }).click();
  await expect(
    page.getByText('通过观察玩家检验设计判断，沿能力页进入 Playtest 基础路径。', { exact: true }),
  ).toBeVisible();
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

test('lists each Devlog entry with its own title', async ({ page }) => {
  await page.goto('./devlog/');

  await expect(page.getByRole('link', { name: /Devlog 001：Learn About Games 从哪里来/ })).toBeVisible();
  await expect(page.getByRole('link', { name: /Devlog 002：M0 为什么从纵向切片开始/ })).toBeVisible();
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

test('does not claim that M0 reached the formal first-release scale', async ({ page }) => {
  await page.goto('./project/readme/');

  await expect(
    page.getByText(/M0 不冒充内容完整的正式第一版。40-60 个节点/),
  ).toBeVisible();
});

test('records the verified M0 deployment', async ({ page }) => {
  await page.goto('./project/changelog/');

  await expect(
    page.getByRole('link', { name: 'https://playwithexperiences.github.io/Learn-About-Games/' }),
  ).toBeVisible();
  await expect(page.getByText(/31264625728/)).toBeVisible();
});
