import { expect, test } from '@playwright/test';
import capabilities from '../../src/data/capabilities.json' with { type: 'json' };
import capabilityRelations from '../../src/data/capability-relations.json' with { type: 'json' };
import domains from '../../src/data/domains.json' with { type: 'json' };
import knowledgeTopics from '../../src/data/knowledge-topics.json' with { type: 'json' };

const basePath = '/Learn-About-Games/';

test('renders eight open territories, distinct node kinds and all functional relations', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1100 });
  await page.goto('./map/');

  const canvas = page.locator('[data-capability-map-canvas]');
  await expect(canvas).toBeVisible();
  await expect(page.locator('[data-mobile-map-outline]')).toBeHidden();
  await expect(canvas.locator('[data-map-region]')).toHaveCount(domains.length);
  await expect(canvas.locator('[data-map-node-kind="capability"]')).toHaveCount(capabilities.length);
  await expect(canvas.locator('[data-map-node-kind="knowledge-topic"]')).toHaveCount(knowledgeTopics.length);
  await expect(canvas.locator('[data-capability-relation]')).toHaveCount(capabilityRelations.length);

  const capabilityNode = canvas.locator('[data-map-node-kind="capability"]').first();
  const topicNode = canvas.locator('[data-map-node-kind="knowledge-topic"]').first();
  await expect(capabilityNode).toHaveAttribute('data-entity-label', '能力');
  await expect(topicNode).toHaveAttribute('data-entity-label', '知识议题');
  expect(await capabilityNode.evaluate((node) => getComputedStyle(node).borderStyle)).not.toBe(
    await topicNode.evaluate((node) => getComputedStyle(node).borderStyle),
  );

  await expect(canvas.locator('[data-relation-type="supports"]').first()).toHaveAttribute(
    'data-direction',
    'forward',
  );
  await expect(canvas.locator('[data-relation-type="complements"]').first()).toHaveAttribute(
    'data-direction',
    'mutual',
  );
  await expect(canvas.getByRole('link', { name: 'Playtest', exact: true })).toHaveAttribute(
    'href',
    `${basePath}capabilities/playtesting/`,
  );
  await expect(canvas.getByRole('link', { name: knowledgeTopics[0].name['zh-CN'], exact: true })).toHaveAttribute(
    'href',
    `${basePath}topics/${knowledgeTopics[0].id}/`,
  );
});

test('connects every SVG edge to the exact global anchors from the geometry catalog', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1100 });
  await page.goto('./map/');

  const canvas = page.locator('[data-capability-map-canvas]');
  for (const relation of capabilityRelations) {
    const from = capabilities.find(({ id }) => id === relation.fromId);
    const to = capabilities.find(({ id }) => id === relation.toId);
    if (!from || !to) throw new Error(`Missing endpoint for ${relation.id}`);

    const edge = canvas.locator(`[data-capability-relation="${relation.id}"]`);
    await expect(edge).toHaveAttribute('data-from', relation.fromId);
    await expect(edge).toHaveAttribute('data-to', relation.toId);
    await expect(edge).toHaveAttribute('data-start-x', String(from.position.x));
    await expect(edge).toHaveAttribute('data-start-y', String(from.position.y));
    await expect(edge).toHaveAttribute('data-end-x', String(to.position.x));
    await expect(edge).toHaveAttribute('data-end-y', String(to.position.y));
    await expect(edge).toHaveAttribute(
      'd',
      `M ${from.position.x} ${from.position.y} L ${(from.position.x + to.position.x) / 2} ${(from.position.y + to.position.y) / 2} L ${to.position.x} ${to.position.y}`,
    );

    const fromNode = canvas.locator(`[data-map-node-id="${relation.fromId}"]`);
    const toNode = canvas.locator(`[data-map-node-id="${relation.toId}"]`);
    await expect(fromNode).toHaveAttribute('data-anchor-x', String(from.position.x));
    await expect(fromNode).toHaveAttribute('data-anchor-y', String(from.position.y));
    await expect(toNode).toHaveAttribute('data-anchor-x', String(to.position.x));
    await expect(toNode).toHaveAttribute('data-anchor-y', String(to.position.y));
  }
});

test('focus enhances adjacent relations and endpoints without hiding the graph', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1100 });
  await page.goto('./map/');

  const focusId = 'playtesting';
  const adjacentRelationIds = capabilityRelations
    .filter(({ fromId, toId }) => fromId === focusId || toId === focusId)
    .map(({ id }) => id);
  const canvas = page.locator('[data-capability-map-canvas]');
  const edges = canvas.locator('[data-capability-relation]');
  const total = await edges.count();

  await canvas.locator(`[data-map-node-id="${focusId}"]`).focus();
  await expect(canvas.locator('[data-capability-relation][data-adjacent="true"]')).toHaveCount(
    adjacentRelationIds.length,
  );
  await expect(canvas.locator('[data-map-node][data-adjacent="true"]')).not.toHaveCount(0);
  await expect(edges).toHaveCount(total);
  expect(
    await edges.evaluateAll((paths) =>
      paths.every((path) => {
        const style = getComputedStyle(path);
        return style.display !== 'none' && style.visibility !== 'hidden' && Number(style.opacity) > 0;
      }),
    ),
  ).toBe(true);

  await canvas.locator(`[data-map-node-id="${focusId}"]`).evaluate((node) => (node as HTMLElement).blur());
  await expect(canvas.locator('[data-capability-relation][data-adjacent="true"]')).toHaveCount(0);
  await expect(edges).toHaveCount(total);
});

test('uses a relationship-equivalent outline at an explicit 320px without overflow', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 900 });
  await page.goto('./map/');

  await expect(page.locator('[data-capability-map-canvas]')).toBeHidden();
  const outline = page.locator('[data-mobile-map-outline]');
  await expect(outline).toBeVisible();
  await expect(outline.locator('[data-outline-region]')).toHaveCount(domains.length);
  await expect(outline.locator('[data-outline-node-kind="capability"]')).toHaveCount(capabilities.length);
  await expect(outline.locator('[data-outline-node-kind="knowledge-topic"]')).toHaveCount(knowledgeTopics.length);
  const playtestLink = outline.getByRole('link', { name: 'Playtest', exact: true });
  const playtestNode = playtestLink.locator('../..');
  await playtestNode.getByText('查看关系', { exact: true }).click();
  await expect(playtestNode.getByText('它支持', { exact: true })).toBeVisible();
  await expect(playtestNode.getByText('受到支持', { exact: true })).toBeVisible();
  await expect(playtestNode.getByText('互补', { exact: true })).toBeVisible();
  await expect(playtestLink).toHaveAttribute(
    'href',
    `${basePath}capabilities/playtesting/`,
  );
  await expect(page.locator('html').evaluate((element) => element.scrollWidth === element.clientWidth)).resolves.toBe(true);
  await expect(page.locator('body').evaluate((element) => element.scrollWidth === element.clientWidth)).resolves.toBe(true);
});

test('keeps the complete map readable without JavaScript in light and dark themes', async ({ browser }) => {
  for (const colorScheme of ['light', 'dark'] as const) {
    const context = await browser.newContext({ javaScriptEnabled: false, colorScheme, viewport: { width: 320, height: 900 } });
    const page = await context.newPage();
    await page.goto('./map/');

    const outline = page.locator('[data-mobile-map-outline]');
    await expect(outline.locator('[data-outline-node-kind="capability"]')).toHaveCount(capabilities.length);
    await expect(outline.locator('[data-outline-node-kind="knowledge-topic"]')).toHaveCount(knowledgeTopics.length);
    await expect(outline.locator('[data-node-relation]')).toHaveCount(capabilityRelations.length * 2);
    await expect(outline).toContainText('有向支持不表示必修或固定学习顺序');
    await expect(outline).toContainText('互补关系不表示先后');
    await expect(outline).toHaveCSS('color', colorScheme === 'light' ? 'rgb(24, 33, 43)' : 'rgb(232, 238, 244)');
    await context.close();
  }
});

test('opens a capability and a knowledge topic with region and related content', async ({ page }) => {
  await page.goto('./capabilities/playtesting/');
  await expect(page.getByRole('heading', { name: 'Playtest', exact: true })).toBeVisible();
  await expect(page.getByLabel('面包屑')).toContainText('研究、验证与数据');
  await expect(page.getByRole('heading', { name: '它支持', exact: true })).toBeVisible();
  await expect(page.getByRole('heading', { name: '受到支持', exact: true })).toBeVisible();
  await expect(page.getByRole('heading', { name: '互补', exact: true })).toBeVisible();
  await expect(page.getByRole('heading', { name: '相关具体资源', exact: true })).toBeVisible();
  await expect(page.getByLabel('个人学习状态')).toBeVisible();

  const topic = knowledgeTopics[0];
  const domain = domains.find(({ id }) => id === topic.domainId);
  if (!domain) throw new Error(`Missing domain for ${topic.id}`);
  await page.goto(`./topics/${topic.id}/`);
  await expect(page.getByRole('heading', { name: topic.name['zh-CN'], exact: true })).toBeVisible();
  await expect(page.getByLabel('面包屑')).toContainText(domain.name['zh-CN']);
  await expect(page.getByText(topic.summary['zh-CN'], { exact: true })).toBeVisible();
  await expect(page.getByRole('heading', { name: '相关资源', exact: true })).toBeVisible();
});
