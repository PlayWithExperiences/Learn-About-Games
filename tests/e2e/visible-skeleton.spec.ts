import { expect, test } from '@playwright/test';
import capabilities from '../../src/data/capabilities.json' with { type: 'json' };
import capabilityRelations from '../../src/data/capability-relations.json' with { type: 'json' };
import egdsFrameworkNodes from '../../src/data/egds-framework-nodes.json' with { type: 'json' };
import knowledgeTopics from '../../src/data/knowledge-topics.json' with { type: 'json' };

test('focuses desktop navigation on exactly five Chinese user tasks', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'chromium', 'Desktop navigation is intentionally replaced by the compact menu on mobile.');
  await page.goto('./');

  const navigation = page.getByRole('navigation', { name: '主导航' });
  const links = navigation.getByRole('link');

  await expect(links).toHaveCount(5);
  await expect(links).toHaveText([
    '能力地图',
    '职业方向',
    '成长资源',
    '创新变迁',
    '关于本项目',
  ]);

  for (const [name, href] of [
    ['能力地图', '/Learn-About-Games/map/'],
    ['职业方向', '/Learn-About-Games/careers/'],
    ['成长资源', '/Learn-About-Games/resources/'],
    ['创新变迁', '/Learn-About-Games/atlas/'],
    ['关于本项目', '/Learn-About-Games/about/'],
  ] as const) {
    await expect(navigation.getByRole('link', { name, exact: true })).toHaveAttribute('href', href);
  }

  for (const oldItem of ['Roadmap', 'Changelog', 'Devlog', 'Methodology', 'Contributing']) {
    await expect(navigation.getByRole('link', { name: oldItem, exact: true })).toHaveCount(0);
  }
});

test('publishes the visible map skeleton and repository-backed project pages', async ({ page }, testInfo) => {
  await page.goto('./');

  await expect(page.getByRole('link', { name: '看全貌' })).toBeVisible();

  await page.getByRole('link', { name: '看全貌' }).click();

  const map = page.locator('[data-egds-map]');
  await expect(map.locator('[data-egds-framework-node]')).toHaveCount(egdsFrameworkNodes.length);
  const visibleBranches = testInfo.project.name === 'mobile-chromium'
    ? map.locator('[data-egds-outline] [data-outline-node-kind="branch"] > summary')
    : map.locator('[data-capability-map-canvas] [data-egds-branch]');
  await expect(visibleBranches).toHaveCount(5);

  for (const branchName of [
    '体验设计',
    '从计划到落地',
    '如果有团队',
    '如果希望形成产品与盈利',
    '如果讨论的不只是游戏',
  ]) {
    await expect(visibleBranches.filter({ hasText: branchName })).toBeVisible();
  }

  if (testInfo.project.name === 'mobile-chromium') {
    await map.locator('[data-outline-framework-node="from-plan-to-ship"] > summary').click();
    await map.locator('[data-outline-framework-node="playtest-evidence-iteration"] > summary').click();
    await expect(map.locator(
      '[data-outline-framework-node="playtest-evidence-iteration"] [data-map-entity-detail][aria-label="打开 Playtest 详情"]',
    )).toBeVisible();
  } else {
    await map.getByRole('button', { name: /Playtest、证据与迭代/ }).click();
    await expect(map.locator(
      '[data-capability-map-canvas] [data-map-entity-key="capability:playtesting"] [data-map-entity-detail]',
    )).toBeVisible();
  }

  const repositoryPages = [
    ['Roadmap', 'Learn About Games Roadmap'],
    ['Changelog', 'Changelog'],
    ['Devlog', '项目 Devlog'],
    ['Methodology', '方法论'],
    ['Contributing', '贡献指南'],
  ] as const;

  await page.goto('./about/');
  for (const [navName, heading] of repositoryPages) {
    await page.getByRole('link', { name: navName, exact: true }).click();
    await expect(page.getByRole('heading', { name: heading, exact: true })).toBeVisible();
    await page.goto('./about/');
  }
});

test('uses About as the project-materials entry point while preserving legacy document routes', async ({ page }) => {
  await page.goto('./about/');

  await expect(page.getByRole('heading', { name: '关于本项目', exact: true })).toBeVisible();
  for (const [name, href] of [
    ['Roadmap', '/Learn-About-Games/project/roadmap/'],
    ['Changelog', '/Learn-About-Games/project/changelog/'],
    ['Devlog', '/Learn-About-Games/devlog/'],
    ['Methodology', '/Learn-About-Games/project/methodology/'],
    ['Contributing', '/Learn-About-Games/project/contributing/'],
    ['README', '/Learn-About-Games/project/readme/'],
  ] as const) {
    await expect(page.getByRole('link', { name, exact: true })).toHaveAttribute('href', href);
    await page.goto(href);
    await expect(page.locator('main')).toBeVisible();
    await page.goto('./about/');
  }
});

test('publishes the current EGDS entity semantics in the methodology', async ({ page }) => {
  await page.goto('./project/methodology/');
  const methodology = page.locator('article.prose');

  await expect(methodology.getByText(
    'EGDS Framework Node 承载 PlayWithExperiences 的作者方法结构；它不参与个人进度或 Career Lens。',
    { exact: true },
  )).toBeVisible();
  await expect(methodology.getByText(
    'Capability 描述可以通过实践逐步掌握的能力。',
    { exact: true },
  )).toBeVisible();
  await expect(methodology.getByText(
    'Knowledge Topic 描述用于理解背景、但不直接作为可实践能力的议题。',
    { exact: true },
  )).toBeVisible();
  await expect(methodology).not.toContainText('Domain 组织');
  await expect(methodology).toContainText('不是行业标准或资格认证');
});

test('makes three career lenses useful without creating a separate map', async ({ page }) => {
  await page.goto('./careers/');

  await expect(page.getByRole('heading', { name: '把职业语境叠加到同一张地图。', exact: true })).toBeVisible();
  const explorer = page.locator('[data-career-explorer]');
  await expect(explorer.locator('[data-career-lens-button]')).toHaveCount(3);
  await expect(explorer.locator('[data-career-node]')).toHaveCount(capabilities.length * 2);

  await explorer.getByRole('button', { name: 'AAA · Game Designer', exact: true }).click();
  const evidence = explorer.locator('[data-career-evidence="aaa-game-designer"]');
  await expect(evidence).toHaveAttribute('open', '');
  await expect(evidence.getByText(/不是行业标准或唯一答案/)).toBeVisible();
  await expect(evidence.getByText('最近复核：2026-08-09', { exact: true })).toBeVisible();
  await expect(evidence.getByRole('link', { name: 'Ubisoft Massive：Senior AI Game Designer', exact: true })).toBeVisible();
});

test('sends the three home actions to map, careers, and resources', async ({ page }) => {
  await page.goto('./');
  const journeyIndex = page.getByLabel('三个入口');

  for (const [name, href] of [
    ['看全貌', '/Learn-About-Games/map/'],
    ['职业方向', '/Learn-About-Games/careers/'],
    ['成长资源', '/Learn-About-Games/resources/'],
  ] as const) {
    await expect(journeyIndex.getByRole('link', { name, exact: true })).toHaveAttribute('href', href);
  }
});

test('describes the public map through its EGDS framework nodes', async ({ page }) => {
  await page.goto('./');
  await expect(
    page.getByText(
      `当前公开 ${egdsFrameworkNodes.length} 个 EGDS 方法节点、${capabilities.length} 个能力与 ${knowledgeTopics.length} 个知识议题，并用 ${capabilityRelations.length} 条有明确含义的关系连接全图。`,
      { exact: true },
    ),
  ).toBeVisible();

  await page.getByRole('link', { name: '打开能力地图' }).click();
  await expect(
    page.getByText(/框架节点表达作者方法，能力与知识议题按需展开/).first(),
  ).toBeVisible();
});

test('describes the careers entry as a reference rather than future work', async ({ page }) => {
  await page.goto('./');

  await expect(
    page.getByText(
      '用 AAA · Game Designer 参考画像理解一种生产语境。它不作个人评分，也不提供唯一答案。',
      { exact: true },
    ),
  ).toBeVisible();
});

test('uses a keyboard-accessible compact menu without horizontal overflow at 320px', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 720 });
  await page.goto('./');

  const compactMenu = page.locator('details.site-nav__compact');
  const summary = compactMenu.locator('summary');

  await expect(compactMenu).not.toHaveAttribute('open', '');
  await expect(summary).toHaveText('主导航');
  await summary.focus();
  await page.keyboard.press('Enter');
  await expect(compactMenu).toHaveAttribute('open', '');
  await expect(compactMenu.getByRole('link', { name: '关于本项目', exact: true })).toBeInViewport();
  await page.keyboard.press('Enter');
  await expect(compactMenu).not.toHaveAttribute('open', '');

  await expect(page.locator('html').evaluate((element) => element.scrollWidth === element.clientWidth)).resolves.toBe(true);
  await expect(page.locator('body').evaluate((element) => element.scrollWidth === element.clientWidth)).resolves.toBe(true);
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
    ['v0.2 milestone', '/Learn-About-Games/devlog/2026-08-09-v02-knowledge-network/'],
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
  await expect(page.getByRole('link', { name: /Devlog 003：v0.2 为什么改成知识网络/ })).toBeVisible();
});

test('maps non-public Markdown links to absolute repository URLs', async ({ page }) => {
  await page.goto('./project/readme/');
  const document = page.locator('article.prose');

  for (const [label, repoPath] of [
    ['项目入口', 'AGENTS.md'],
    ['Claude 入口', 'CLAUDE.md'],
    ['当前决策摘要', 'docs/journal/2026-08-09-learn-about-games-v02-decision-summary.md'],
    ['产品设计', 'docs/superpowers/specs/2026-08-09-learn-about-games-v02-design.md'],
  ] as const) {
    await expect(document.getByRole('link', { name: label, exact: true })).toHaveAttribute(
      'href',
      `https://github.com/PlayWithExperiences/Learn-About-Games/blob/main/${repoPath}`,
    );
  }
});

test('publishes the current v0.2 scope without retaining the M0 roadmap as current', async ({ page }) => {
  await page.goto('./project/readme/');

  await expect(page.getByRole('heading', { name: '当前版本｜v0.2', exact: true })).toBeVisible();
  await expect(page.getByText(/8 个领域、42 个可实践能力、12 个知识议题和 64 条/)).toBeVisible();
  await expect(page.getByText(/20 个 Source、128 个具体 Work Item 与 15 个无顺序资源主题/)).toBeVisible();
  await expect(page.getByText(/27 节点、25 条有证据关系与 40 项文献/)).toBeVisible();
  await expect(page.locator('article.prose')).not.toContainText('v0.2 已进入实施');
  await expect(page.locator('article.prose')).not.toContainText('AAA / Game Designer');
});

test('records the verified deployment chain through the final-review fix', async ({ page }) => {
  await page.goto('./project/changelog/');

  await expect(
    page.getByRole('link', { name: 'https://playwithexperiences.github.io/Learn-About-Games/' }),
  ).toBeVisible();
  await expect(page.getByText(/31265746032/)).toBeVisible();
  await expect(page.getByText(/d079d83c14d2823c597d9c831c907f61fd6e62c8/)).toBeVisible();
  await expect(page.getByText(/31266716396/)).toBeVisible();
  await expect(page.getByText(/8697a6b5fa56a7f6a5e15276b86ed36060cb32a2/)).toBeVisible();
});
