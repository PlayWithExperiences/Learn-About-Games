import { expect, test } from '@playwright/test';

test('reaches the evidence-backed Atlas seed through shared navigation', async ({ page }) => {
  await page.goto('./');
  await page.getByRole('navigation').getByRole('link', { name: 'Atlas', exact: true }).click();

  await expect(page).toHaveURL(/\/Learn-About-Games\/atlas\/$/);
  await expect(page.getByRole('heading', { name: 'Game Innovation Atlas', exact: true })).toBeVisible();
  await expect(page.getByText('Learn About Games 站内的历史与创新观察维度', { exact: true })).toBeVisible();
  await expect(page.getByRole('heading', { name: /独立项目/ })).toHaveCount(0);
});

test('shows the complete framework without implying balanced M0 coverage', async ({ page }) => {
  await page.goto('./atlas/');

  const categories = page.locator('[data-atlas-category]');
  await expect(categories).toHaveCount(8);
  await expect(categories).toHaveText([
    '玩法',
    '技术',
    '控制与界面',
    '叙事',
    '视听',
    '社交',
    '生产方式',
    '发行与商业',
  ]);
  await expect(page.getByText('八类只定义未来的组织维度，不表示 M0 已均衡覆盖。', { exact: true })).toBeVisible();
});

test('separates one Innovation concept from eight chronologically ordered Games', async ({ page }) => {
  await page.goto('./atlas/');

  await expect(
    page.getByRole('heading', {
      name: '从 Rogue 的随机地城与单局死亡，到跨类型的 run-based 变体',
      exact: true,
    }),
  ).toBeVisible();

  const innovation = page.locator('[data-atlas-node-kind="innovation"]');
  await expect(innovation).toHaveCount(1);
  await expect(innovation).toHaveAttribute('data-atlas-node-id', 'roguelike-run-structure');
  await expect(innovation.getByText('Innovation', { exact: true })).toBeVisible();

  const games = page.locator('[data-atlas-node-kind="game"]');
  await expect(games).toHaveCount(8);
  await expect(games.locator('[data-atlas-node-name]')).toHaveText([
    'Rogue',
    'Hack',
    'Moria',
    'NetHack',
    'Angband',
    'Diablo',
    'Spelunky',
    'Hades',
  ]);
  await expect(games.locator('time')).toHaveText(['1980', '1982', '1983', '1987', '1990', '1996', '2008', '2020']);
  await expect(
    page.getByText('年份仅用于排列 Game，不用于证明“第一款”或创新起源。', { exact: true }),
  ).toBeVisible();
});

test('publishes exactly seven confirmed causal relations with evidence links and boundaries', async ({ page }) => {
  await page.goto('./atlas/');

  const relations = page.locator('[data-atlas-relation]');
  await expect(relations).toHaveCount(7);
  await expect(relations.locator('[data-evidence-status="confirmed"]')).toHaveCount(7);
  await expect(
    relations.evaluateAll((elements) =>
      elements.map((element) => [
        element.getAttribute('data-atlas-relation'),
        element.getAttribute('data-from-id'),
        element.getAttribute('data-to-id'),
        element.getAttribute('data-relation-type'),
        element.querySelector('[data-evidence-status]')?.getAttribute('data-evidence-status'),
      ]),
    ),
  ).resolves.toEqual([
    ['rogue-to-hack', 'rogue', 'hack', 'derived-variant', 'confirmed'],
    ['hack-to-nethack', 'hack', 'nethack', 'derived-variant', 'confirmed'],
    ['rogue-to-moria', 'rogue', 'moria', 'direct-influence', 'confirmed'],
    ['moria-to-angband', 'moria', 'angband', 'derived-variant', 'confirmed'],
    ['angband-to-diablo', 'angband', 'diablo', 'fusion', 'confirmed'],
    ['run-structure-to-spelunky', 'roguelike-run-structure', 'spelunky', 'fusion', 'confirmed'],
    ['spelunky-to-hades', 'spelunky', 'hades', 'direct-influence', 'confirmed'],
  ]);

  for (const relation of await relations.all()) {
    await expect(relation.locator('a[data-atlas-evidence-link]')).not.toHaveCount(0);
    const directionArrow = relation.locator('[data-atlas-direction-arrow]');
    await expect(directionArrow).toHaveText('→');
    await expect(directionArrow).toHaveCSS('border-top-width', '0px');
  }

  const evidence = page.locator('[data-atlas-evidence]');
  await expect(evidence).toHaveCount(9);
  await expect(evidence.locator('a[data-atlas-evidence-link]')).toHaveCount(9);

  for (const url of [
    'https://wichman.org/roguehistory.html',
    'https://www.nethack.org/download/LICENSE_HISTORY.html',
    'https://github.com/NetHack/NetHack/blob/NetHack-5.0.0_Released/dat/history',
    'https://umoria.org/history',
    'https://raw.githubusercontent.com/angband/angband/master/docs/version.rst',
    'https://www.rpgfan.com/feature/david-brevik-interview/',
    'https://www.rockpapershotgun.com/igf-factor-2012-spelunky',
    'https://www.gamedeveloper.com/design/roguelikes-and-narrative-design-with-i-hades-i-creative-director-greg-kasavin',
    'https://www.supergiantgames.com/blog/hades-faq/',
  ]) {
    await expect(evidence.locator(`a[href="${url}"]`)).toHaveCount(1);
  }
  await expect(page.getByText('Diablo 是融合与转译，不是完整传统 Roguelike 的直系继承。', { exact: true })).toBeVisible();
  await expect(
    page.getByText('Spelunky 对 Hades 的关系是有记录的设计与叙事启发，不是代码继承。', { exact: true }),
  ).toBeVisible();
  await expect(
    page.getByText('传统 Roguelike 常以回合制推进；Hades 是跨类型的动作变体。', { exact: true }),
  ).toBeVisible();
});

test('keeps relation arrows horizontal on desktop and rotates them downward on mobile', async ({ page }, testInfo) => {
  await page.goto('./atlas/');

  const arrows = page.locator('[data-atlas-direction-arrow]');
  await expect(arrows).toHaveCount(7);
  const transforms = await arrows.evaluateAll((elements) =>
    elements.map((element) => getComputedStyle(element).transform),
  );

  if (testInfo.project.name === 'mobile-chromium') {
    expect(transforms).toEqual(Array(7).fill('matrix(0, 1, -1, 0, 0, 0)'));
  } else {
    expect(transforms).toEqual(Array(7).fill('none'));
  }
});
