import { expect, test } from '@playwright/test';
import resources from '../../src/data/resources.json' with { type: 'json' };

const homeMapDescription = '从 PlayWithExperiences 的 EGDS 认识游戏设计及相邻知识的整体轮廓；它是一种可讨论的视角，不是唯一答案。';
const careerDescription = '用公开依据理解职业与生产语境如何参考 PlayWithExperiences 的 EGDS；它是一种可讨论的视角，不是唯一答案或评分。';

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

test('names the authorial EGDS view in the home preview and career metadata', async ({ page }) => {
  await page.goto('./');
  await expect(page.locator('#home-map-description')).toHaveText(homeMapDescription);

  await page.goto('./careers/');
  await expect(page.locator('meta[name="description"]')).toHaveAttribute('content', careerDescription);
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
  const misleadingClaims = [
    'EGDS 是行业标准',
    'EGDS 规定必修顺序',
    'EGDS 是唯一学习路径',
    'EGDS 提供评分',
    'EGDS 生成评分',
    'EGDS is an industry standard',
    'EGDS defines a required sequence',
    'EGDS is the only learning path',
    'EGDS provides a score',
    'EGDS provides scoring',
  ];

  for (const route of ['./', './map/', './careers/']) {
    const response = await page.goto(route);
    expect(response?.status()).toBe(200);
    const bodyCopy = await page.locator('body').innerText();
    const metaDescription = await page.locator('meta[name="description"]').getAttribute('content') ?? '';
    const publicCopy = `${bodyCopy}\n${metaDescription}`.toLocaleLowerCase();

    for (const claim of misleadingClaims) {
      expect(publicCopy).not.toContain(claim.toLocaleLowerCase());
    }
  }
});
