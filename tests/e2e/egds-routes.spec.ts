import { expect, test } from '@playwright/test';
import resources from '../../src/data/resources.json' with { type: 'json' };

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

test('does not portray EGDS as an industry standard, prescribed sequence, or sole answer', async ({ page }) => {
  for (const route of ['./', './map/', './careers/']) {
    const response = await page.goto(route);
    expect(response?.status()).toBe(200);
    await expect(page.locator('body')).not.toContainText(/industry standard|这是唯一标准|作为唯一标准|唯一学习路径|提供必修顺序/i);
  }
});
