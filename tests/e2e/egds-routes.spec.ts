import { expect, test } from '@playwright/test';
import resources from '../../src/data/resources.json' with { type: 'json' };

const homeMapDescription = '从 PlayWithExperiences 的 EGDS 认识游戏设计及相邻知识的整体轮廓；它是一种可讨论的视角，不是唯一答案。';
const mapDescription = '以 PlayWithExperiences 的 EGDS 作为可讨论、可修订的设计视角，理解设计如何成为结果。';
const misleadingEgdsClaimPatterns = [
  /EGDS\s*(?:是|作为)\s*(?:一种|一个)?\s*行业标准/i,
  /EGDS\s*(?:是|规定|要求|提供|定义)\s*(?:一个|一种)?\s*必修顺序/i,
  /EGDS\s*(?:是|提供|规定)\s*唯一(?:的)?\s*学习路径/i,
  /EGDS\s*(?:提供|生成|用于)\s*(?:个人)?\s*评分/i,
  /\bEGDS\s+is\s+(?:(?:an?|the)\s+)?industry\s+standard\b/i,
  /\bEGDS\s+(?:is|defines|requires|provides)\s+(?:(?:an?|the)\s+)?required\s+(?:learning\s+)?sequence\b/i,
  /\bEGDS\s+(?:is|defines|requires|provides)\s+(?:the\s+)?(?:only|sole)\s+learning\s+path\b/i,
  /\bEGDS\s+(?:provides|generates|uses|is\s+used\s+for)\s+(?:a\s+)?(?:personal\s+)?(?:score|scoring)\b/i,
];
const containsMisleadingEgdsClaim = (copy: string) =>
  misleadingEgdsClaimPatterns.some((pattern) => pattern.test(copy));

const publishedEgdsArticles = [
  {
    name: '情感化游戏设计系统 0：从叙事结构出发',
    href: 'https://medill-east.github.io/2024/04/13/20240413-emotional-game-design-system-0-narrative-structure/',
  },
  {
    name: '情感化游戏设计系统 1：构建系统',
    href: 'https://medill-east.github.io/2024/04/14/20240414-emotional-game-design-system-1-create-the-system/',
  },
  {
    name: '情感化游戏设计系统 2：探索感如何进入系统分析',
    href: 'https://medill-east.github.io/2024/04/28/20240428-emotional-game-design-system-2-intrinsic-feeling-exploration',
  },
  {
    name: '情感化游戏设计系统 3：BOSS 战设计框架',
    href: 'https://medill-east.github.io/2024/11/23/20241123-emotional-game-design-system-3-boss-fight-design-structure',
  },
] as const;

test('detects bounded misleading EGDS claim variants without rejecting the approved disclaimer', () => {
  for (const claim of [
    'EGDS 是一种行业标准',
    'EGDS 是唯一的学习路径',
    'EGDS 提供个人评分',
    'EGDS 要求必修顺序',
    'EGDS is the industry standard',
    'EGDS is the sole learning path',
    'EGDS defines the required sequence',
    'EGDS provides personal scoring',
  ]) {
    expect(containsMisleadingEgdsClaim(claim)).toBe(true);
  }

  expect(containsMisleadingEgdsClaim('它是一种可讨论的设计视角，不是唯一标准答案。')).toBe(false);
});

test('explains the map through the PlayWithExperiences EGDS framework', async ({ page }) => {
  const response = await page.goto('./map/');

  expect(response?.status()).toBe(200);
  await expect(page.getByRole('heading', { name: '从体验出发，理解设计如何成为结果。', exact: true })).toBeVisible();
  await expect(
    page.getByText(
      '本地图以 PlayWithExperiences 的 EGDS 为知识骨架，结合公开资料与行业实践持续修订。它是一种可讨论的设计视角，不是唯一标准答案。',
      { exact: true },
    ),
  ).toBeVisible();
});

test('publishes the current EGDS method from PKM while preserving its article history', async ({ page }) => {
  const response = await page.goto('./egds/');

  expect(response?.status()).toBe(200);
  await expect(page.getByRole('heading', { name: 'EGDS｜情感化游戏设计系统', exact: true })).toBeVisible();

  const currentModel = page.locator('[data-egds-current-model]');
  await expect(currentModel.locator('li')).toHaveCount(5);
  await expect(currentModel.locator('li')).toHaveText([
    /情绪曲线/,
    /情绪体验/,
    /主观感受/,
    /客观原因/,
    /设计杠杆/,
  ]);

  const practiceCycle = page.locator('[data-egds-practice-cycle]');
  await expect(practiceCycle.locator('li')).toHaveCount(4);
  await expect(practiceCycle.locator('li')).toHaveText([/感知/, /理解/, /解构/, /重构/]);

  await expect(page.locator('[data-egds-levers] li')).toHaveText([
    /玩法与挑战/,
    /叙事/,
    /美学与表现/,
  ]);

  const history = page.locator('[data-egds-history]');
  await expect(history.locator('article')).toHaveCount(publishedEgdsArticles.length);
  for (const article of publishedEgdsArticles) {
    await expect(history.getByRole('link', { name: article.name, exact: true })).toHaveAttribute('href', article.href);
  }

  await expect(page.getByRole('link', { name: '打开当前 EGDS Digital Garden', exact: true })).toHaveAttribute(
    'href',
    'https://play-with-experiences-digital-garden.vercel.app/',
  );
  await expect(page.getByText(/Digital Garden 是当前 EGDS 工作模型的主要来源/)).toBeVisible();
  await expect(page.getByText(/四篇文章记录的是方法形成时的真实版本/)).toBeVisible();
});

test('links the EGDS method from About and the capability map without adding a fifth top task', async ({ page }, testInfo) => {
  await page.goto('./about/');
  await expect(page.getByRole('link', { name: '系统了解 EGDS', exact: true })).toHaveAttribute(
    'href',
    '/Learn-About-Games/egds/',
  );

  await page.goto('./map/');
  await expect(page.getByRole('link', { name: '了解 EGDS 方法', exact: true })).toHaveAttribute(
    'href',
    '/Learn-About-Games/egds/',
  );

  if (testInfo.project.name === 'chromium') {
    await expect(page.getByRole('navigation', { name: '主导航' }).getByRole('link')).toHaveCount(4);
  }
});

test('gives the EGDS method a compact editorial layout without page overflow', async ({ page }, testInfo) => {
  await page.goto('./egds/');

  const metrics = await page.evaluate(() => {
    const model = document.querySelector<HTMLElement>('[data-egds-current-model]');
    const cycle = document.querySelector<HTMLElement>('[data-egds-practice-cycle]');
    if (!model || !cycle) throw new Error('Missing EGDS method structures');

    return {
      modelColumns: getComputedStyle(model).gridTemplateColumns.split(' ').filter(Boolean).length,
      cycleColumns: getComputedStyle(cycle).gridTemplateColumns.split(' ').filter(Boolean).length,
      overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
    };
  });

  expect(metrics.overflow).toBe(0);
  if (testInfo.project.name === 'mobile-chromium') {
    expect(metrics.modelColumns).toBe(1);
    expect(metrics.cycleColumns).toBe(1);
  } else {
    expect(metrics.modelColumns).toBe(5);
    expect(metrics.cycleColumns).toBe(4);
  }
});

test('keeps the full EGDS explanation readable without JavaScript', async ({ browser }) => {
  for (const viewport of [{ width: 1440, height: 900 }, { width: 320, height: 900 }]) {
    const context = await browser.newContext({
      javaScriptEnabled: false,
      colorScheme: viewport.width === 320 ? 'dark' : 'light',
      viewport,
    });
    const page = await context.newPage();
    await page.goto('./egds/');

    await expect(page.locator('[data-egds-current-model] li')).toHaveCount(5);
    await expect(page.locator('[data-egds-practice-cycle] li')).toHaveCount(4);
    await expect(page.locator('[data-egds-history] article')).toHaveCount(4);
    expect(await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)).toBe(0);

    await context.close();
  }
});

test('names the authorial EGDS view in the home preview and integrated career entry', async ({ page }) => {
  await page.goto('./');
  await expect(page.locator('#home-map-description')).toHaveText(homeMapDescription);

  await page.goto('./careers/');
  await expect(page).toHaveURL(/\/map\/#career-lenses$/);
  await expect(page.locator('meta[name="description"]')).toHaveAttribute('content', mapDescription);
  await expect(page.locator('[data-career-lens-control]')).toHaveCount(1);
});

test('keeps capability and topic detail routes while linking breadcrumbs to their EGDS nodes', async ({ page }) => {
  const capabilityResponse = await page.goto('./capabilities/playtesting/');
  expect(capabilityResponse?.status()).toBe(200);

  const capabilityBreadcrumb = page.getByRole('navigation', { name: '面包屑' });
  await expect(capabilityBreadcrumb.getByRole('link', { name: 'Playtest、证据与迭代', exact: true })).toHaveAttribute(
    'href',
    '/Learn-About-Games/map/#egds-playtest-evidence-iteration',
  );
  await expect(page.getByRole('link', { name: '在全部资源中继续筛选', exact: true })).toHaveAttribute(
    'href',
    '/Learn-About-Games/resources/?capability=playtesting',
  );

  const playtestResource = resources.find((resource) => resource.capabilityIds.includes('playtesting'));
  expect(playtestResource).toBeDefined();
  await expect(page.locator('[data-node-resources]').getByRole('link', { name: playtestResource!.title['zh-CN'], exact: true })).toHaveAttribute(
    'href',
    playtestResource!.canonicalUrl,
  );

  const topicResponse = await page.goto('./topics/perception-attention-emotion/');
  expect(topicResponse?.status()).toBe(200);

  const topicBreadcrumb = page.getByRole('navigation', { name: '面包屑' });
  await expect(topicBreadcrumb.getByRole('link', { name: '感受', exact: true })).toHaveAttribute(
    'href',
    '/Learn-About-Games/map/#egds-perception',
  );
});

test('does not portray EGDS as a standard, prescribed sequence, sole path, or score', async ({ page }) => {
  for (const route of ['./', './egds/', './map/', './careers/']) {
    const response = await page.goto(route);
    expect(response?.status()).toBe(200);
    const bodyCopy = await page.locator('body').innerText();
    const metaDescription = await page.locator('meta[name="description"]').getAttribute('content') ?? '';
    expect(containsMisleadingEgdsClaim(`${bodyCopy}\n${metaDescription}`)).toBe(false);
  }
});
