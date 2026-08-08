import { expect, test } from '@playwright/test';
import capabilities from '../../src/data/capabilities.json' with { type: 'json' };
import capabilityRelations from '../../src/data/capability-relations.json' with { type: 'json' };
import domains from '../../src/data/domains.json' with { type: 'json' };
import knowledgeTopics from '../../src/data/knowledge-topics.json' with { type: 'json' };
import resourceTopics from '../../src/data/resource-topics.json' with { type: 'json' };
import resources from '../../src/data/resources.json' with { type: 'json' };

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

  expect(
    await canvas.locator('[data-map-region]').evaluateAll((regions) =>
      regions.every((region) => {
        const style = getComputedStyle(region);
        return style.borderTopStyle !== 'none'
          && style.borderLeftStyle !== 'none'
          && style.borderRightStyle === 'none'
          && style.borderBottomStyle === 'none';
      }),
    ),
  ).toBe(true);

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

test('keeps supports and complements legible by default in both themes', async ({ browser }) => {
  for (const colorScheme of ['light', 'dark'] as const) {
    const context = await browser.newContext({
      colorScheme,
      viewport: { width: 1440, height: 1100 },
    });
    const page = await context.newPage();
    await page.goto('./map/');

    const canvas = page.locator('[data-capability-map-canvas]');
    const relationStyles = await canvas.evaluate((element) => {
      const supports = element.querySelector<SVGPathElement>('[data-relation-type="supports"]');
      const complements = element.querySelector<SVGPathElement>('[data-relation-type="complements"]');
      if (!supports || !complements) throw new Error('Missing relation type');
      const supportsStyle = getComputedStyle(supports);
      const complementsStyle = getComputedStyle(complements);
      return {
        supports: {
          markerMid: supportsStyle.markerMid,
          opacity: Number(supportsStyle.opacity),
          strokeWidth: Number.parseFloat(supportsStyle.strokeWidth),
        },
        complements: {
          dashArray: complementsStyle.strokeDasharray,
          markerMid: complementsStyle.markerMid,
          opacity: Number(complementsStyle.opacity),
          strokeWidth: Number.parseFloat(complementsStyle.strokeWidth),
        },
      };
    });

    expect(relationStyles.supports.opacity).toBeGreaterThanOrEqual(0.4);
    expect(relationStyles.supports.strokeWidth).toBeGreaterThanOrEqual(1.25);
    expect(relationStyles.supports.markerMid).not.toBe('none');
    expect(relationStyles.complements.opacity).toBeGreaterThanOrEqual(0.4);
    expect(relationStyles.complements.strokeWidth).toBeGreaterThanOrEqual(1.25);
    expect(relationStyles.complements.dashArray).not.toBe('none');
    expect(relationStyles.complements.markerMid).toBe('none');

    await context.close();
  }
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
  const defaultStyle = await edges.first().evaluate((edge) => {
    const style = getComputedStyle(edge);
    return {
      opacity: Number(style.opacity),
      strokeWidth: Number.parseFloat(style.strokeWidth),
    };
  });

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
  const focusedStyle = await canvas
    .locator('[data-capability-relation][data-adjacent="true"]')
    .first()
    .evaluate((edge) => {
      const style = getComputedStyle(edge);
      return {
        opacity: Number(style.opacity),
        strokeWidth: Number.parseFloat(style.strokeWidth),
      };
    });
  expect(focusedStyle.opacity).toBeGreaterThan(defaultStyle.opacity);
  expect(focusedStyle.strokeWidth).toBeGreaterThan(defaultStyle.strokeWidth);

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
  await expect(outline.locator('[data-outline-node-kind="capability"] > .map-outline-node__heading a')).toHaveCount(capabilities.length);
  await expect(outline.locator('[data-outline-node-kind="knowledge-topic"] > .map-outline-node__heading a')).toHaveCount(knowledgeTopics.length);
  await expect(outline.locator('[data-outline-node-kind] > p')).toHaveCount(0);
  await expect(outline.locator('[data-outline-node-kind="capability"] > details:not([open])')).toHaveCount(capabilities.length);
  await expect(outline.locator('[data-outline-node-kind="knowledge-topic"] > details:not([open])')).toHaveCount(knowledgeTopics.length);
  const playtestLink = outline.getByRole('link', { name: 'Playtest', exact: true });
  const playtestNode = playtestLink.locator('../..');
  await playtestNode.getByText('查看关系', { exact: true }).click();
  await expect(playtestNode.getByText(capabilities.find(({ id }) => id === 'playtesting')?.summary['zh-CN'] ?? '', { exact: true })).toBeVisible();
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
    const playtestNode = outline.getByRole('link', { name: 'Playtest', exact: true }).locator('../..');
    await playtestNode.getByText('查看关系', { exact: true }).click();
    await expect(playtestNode.getByText('它支持', { exact: true })).toBeVisible();
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

test('connects every map node directly to catalog-ordered resources and factual filters', async ({ request }) => {
  const idsFromHtml = (html: string, attribute: string) =>
    [...html.matchAll(new RegExp(`${attribute}="([^"]+)"`, 'g'))].map((match) => match[1]);
  const resourceIds = new Set(resources.map(({ id }) => id));
  const catalogResponse = await request.get('resources/');
  expect(catalogResponse.status()).toBe(200);
  const catalogResourceIds = idsFromHtml(await catalogResponse.text(), 'data-result-id')
    .filter((id) => resourceIds.has(id));

  for (const capability of capabilities) {
    const response = await request.get(`capabilities/${capability.id}/`);
    expect(response.status(), capability.id).toBe(200);
    const html = await response.text();
    const expectedResourceIds = catalogResourceIds.filter((id) =>
      resources.find((resource) => resource.id === id)?.capabilityIds.includes(capability.id),
    );
    const expectedTopics = resourceTopics.filter(({ capabilityIds }) => capabilityIds.includes(capability.id));

    expect(idsFromHtml(html, 'data-node-resource-id'), capability.id).toEqual(
      expectedResourceIds,
    );
    expect(idsFromHtml(html, 'data-node-resource-topic-id').sort(), capability.id).toEqual(
      expectedTopics.map(({ id }) => id).sort(),
    );
    for (const topic of expectedTopics) {
      expect(html, `${capability.id}:${topic.id}`).toContain(
        `href="${basePath}resources/?resourceTopic=${topic.id}"`,
      );
    }

    expect(html, capability.id).toContain(
      `href="${basePath}resources/?capability=${capability.id}"`,
    );
    if (expectedResourceIds.length === 0) {
      expect(html, capability.id).toContain('当前目录还没有与这个能力直接关联的 Work Item。');
      expect(html, capability.id).toContain(`href="${basePath}project/contributing/"`);
    }
  }

  for (const topic of knowledgeTopics) {
    const response = await request.get(`topics/${topic.id}/`);
    expect(response.status(), topic.id).toBe(200);
    const html = await response.text();
    const expectedResourceIds = catalogResourceIds.filter((id) =>
      resources.find((resource) => resource.id === id)?.knowledgeTopicIds.includes(topic.id),
    );
    const expectedTopics = resourceTopics.filter(({ knowledgeTopicIds }) => knowledgeTopicIds.includes(topic.id));

    expect(idsFromHtml(html, 'data-node-resource-id'), topic.id).toEqual(
      expectedResourceIds,
    );
    expect(idsFromHtml(html, 'data-node-resource-topic-id').sort(), topic.id).toEqual(
      expectedTopics.map(({ id }) => id).sort(),
    );
    for (const resourceTopic of expectedTopics) {
      expect(html, `${topic.id}:${resourceTopic.id}`).toContain(
        `href="${basePath}resources/?resourceTopic=${resourceTopic.id}"`,
      );
    }
    expect(html, topic.id).toContain(
      `href="${basePath}resources/?knowledgeTopic=${topic.id}"`,
    );
  }
});

test('keeps node resource sections free of required-sequence semantics', async ({ page }) => {
  await page.goto('./capabilities/playtesting/');
  const capabilityResources = page.locator('[data-node-resources]');
  await expect(capabilityResources).toBeVisible();
  await expect(capabilityResources).not.toContainText(/学习路径|必修|按顺序/);

  await page.goto(`./topics/${knowledgeTopics[0].id}/`);
  const topicResources = page.locator('[data-node-resources]');
  await expect(topicResources).toBeVisible();
  await expect(topicResources).not.toContainText(/学习路径|必修|按顺序/);
});
