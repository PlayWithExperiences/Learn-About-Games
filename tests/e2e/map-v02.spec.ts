import { expect, test, type Page } from '@playwright/test';
import capabilities from '../../src/data/capabilities.json' with { type: 'json' };
import capabilityRelations from '../../src/data/capability-relations.json' with { type: 'json' };
import egdsFrameworkNodes from '../../src/data/egds-framework-nodes.json' with { type: 'json' };
import knowledgeTopics from '../../src/data/knowledge-topics.json' with { type: 'json' };

const basePath = '/Learn-About-Games/';
const expandableKinds = new Set(['entry', 'stage', 'lever', 'cluster']);
const frameworkTypeLabels = {
  root: 'EGDS 根节点',
  branch: '主分支',
  entry: '体验入口',
  stage: '过程阶段',
  lever: '设计杠杆',
  cluster: '能力群',
  'external-entry': '外部入口',
} as const;

const directEntityCount = (frameworkNodeId: string) =>
  capabilities.filter((item) => item.frameworkNodeId === frameworkNodeId).length
  + knowledgeTopics.filter((item) => item.frameworkNodeId === frameworkNodeId).length;

const directRelationIds = (capabilityId: string) => capabilityRelations
  .filter(({ fromId, toId }) => fromId === capabilityId || toId === capabilityId)
  .map(({ id }) => id)
  .sort();

const assertNoPageOverflow = async (page: Page) => {
  expect(await page.evaluate(() => ({
    body: document.body.scrollWidth - document.body.clientWidth,
    html: document.documentElement.scrollWidth - document.documentElement.clientWidth,
  }))).toEqual({ body: 0, html: 0 });
};

test('server renders the complete EGDS skeleton, hidden entities and stable detail links', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('./map/');

  const map = page.locator('[data-egds-map]');
  const canvas = map.locator('[data-capability-map-canvas]');
  await expect(map).toHaveCount(1);
  await expect(canvas).toHaveCount(1);
  await expect(canvas).toBeVisible();
  await expect(map.locator('[data-egds-framework-node]')).toHaveCount(28);
  await expect(map.locator('[data-egds-branch]')).toHaveCount(5);
  await expect(map.locator('[data-egds-process-path]')).toHaveCount(3);
  await expect(map.locator('[data-egds-lever]')).toHaveCount(3);
  await expect(map.locator('[data-map-group], [data-map-region]')).toHaveCount(0);
  await expect(map.locator('[data-map-entity]')).toHaveCount(54);
  await expect(map.locator('[data-map-entity]:not([hidden])')).toHaveCount(0);
  await expect(map.locator('[data-capability-relation]')).toHaveCount(capabilityRelations.length);
  await expect(map.locator('[data-capability-relation]:not([hidden])')).toHaveCount(0);
  await expect(map.locator('[data-map-entity] [data-map-entity-detail]')).toHaveCount(54);

  await expect(map.getByRole('link', { name: '前往 Innovation Atlas', exact: true })).toHaveAttribute(
    'href',
    `${basePath}atlas/`,
  );

  for (const node of egdsFrameworkNodes) {
    const frameworkNode = map.locator(`#egds-${node.id}`);
    await expect(frameworkNode).toHaveCount(1);
    await expect(frameworkNode.locator('[data-framework-type-label]')).toHaveText(
      frameworkTypeLabels[node.kind as keyof typeof frameworkTypeLabels],
    );
    await expect(frameworkNode).not.toHaveAttribute('data-career-node', /.+/);
    await expect(frameworkNode).not.toHaveAttribute('data-career-focus-target', /.+/);
    await expect(frameworkNode).not.toHaveAttribute('data-progress-state', /.+/);

    const count = directEntityCount(node.id);
    const expandButton = frameworkNode.locator('[data-expand-framework-node]');
    const shouldExpand = count > 0 && expandableKinds.has(node.kind);
    await expect(expandButton).toHaveCount(shouldExpand ? 1 : 0);
    if (shouldExpand) {
      await expect(expandButton).toHaveAttribute('data-entity-count', String(count));
      await expect(expandButton).toContainText(String(count));
    }
  }

  for (const capability of capabilities) {
    await expect(map.locator(`[data-map-entity][data-map-entity-key="capability:${capability.id}"] [data-map-entity-detail]`))
      .toHaveAttribute('href', `${basePath}capabilities/${capability.id}/`);
  }
  for (const topic of knowledgeTopics) {
    await expect(map.locator(`[data-map-entity][data-map-entity-key="knowledge-topic:${topic.id}"] [data-map-entity-detail]`))
      .toHaveAttribute('href', `${basePath}topics/${topic.id}/`);
  }
});

test('expands exactly one framework container and preserves entity control semantics', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto('./map/');
  const map = page.locator('[data-egds-map]');

  await map.getByRole('button', { name: /Playtest、证据与迭代/ }).click();
  await expect(map.locator('[data-egds-framework-node][data-expanded="true"]')).toHaveCount(1);
  await expect(map.locator('#egds-playtest-evidence-iteration')).toHaveAttribute('data-expanded', 'true');
  await expect(map.locator('[data-map-entity-kind="capability"]:not([hidden])')).toHaveCount(6);
  await expect(map.locator('[data-map-entity-kind="knowledge-topic"]:not([hidden])')).toHaveCount(1);

  const visibleRows = map.locator('[data-map-entity]:not([hidden])');
  for (let index = 0; index < await visibleRows.count(); index += 1) {
    const controls = visibleRows.nth(index).locator('[data-map-entity-controls]');
    await expect(controls.locator(':scope > button')).toHaveCount(1);
    await expect(controls.locator(':scope > a')).toHaveCount(1);
    expect(await controls.locator(':scope > *').evaluateAll((items) => items.map(({ tagName }) => tagName)))
      .toEqual(['BUTTON', 'A']);
    await expect(controls.locator('button a, a button')).toHaveCount(0);
  }

  await map.getByRole('button', { name: /叙事，展开/ }).click();
  await expect(map.locator('#egds-playtest-evidence-iteration')).not.toHaveAttribute('data-expanded', 'true');
  await expect(map.locator('#egds-narrative-lever')).toHaveAttribute('data-expanded', 'true');
  await expect(map.locator('[data-map-entity-kind="capability"]:not([hidden])')).toHaveCount(5);
  await expect(map.locator('[data-map-entity-kind="knowledge-topic"]:not([hidden])')).toHaveCount(1);
});

test('selecting Playtest opens the inspector and projects only direct relationships', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1100 });
  await page.goto('./map/');
  const map = page.locator('[data-egds-map]');
  await map.getByRole('button', { name: /Playtest、证据与迭代/ }).click();

  const playtest = map.locator('[data-map-entity-key="capability:playtesting"]');
  await playtest.getByRole('button', { name: /Playtest.*关系/ }).click();

  const inspector = map.locator('[data-map-inspector]');
  await expect(inspector).toBeVisible();
  await expect(inspector.locator('[data-inspector-kind]')).toHaveText('能力');
  await expect(inspector.locator('[data-inspector-name]')).toHaveText('Playtest');
  await expect(inspector.getByRole('link', { name: '查看相关资源', exact: true })).toHaveAttribute(
    'href',
    `${basePath}resources/?capability=playtesting`,
  );
  await expect(inspector.getByRole('link', { name: '打开详情页', exact: true })).toHaveAttribute(
    'href',
    `${basePath}capabilities/playtesting/`,
  );

  const expectedIds = directRelationIds('playtesting');
  expect(await inspector.locator('[data-inspector-relation-id]').evaluateAll((items) =>
    items.map((item) => (item as HTMLElement).dataset.inspectorRelationId).sort(),
  )).toEqual(expectedIds);
  expect(await map.locator('[data-capability-relation]:not([hidden])').evaluateAll((items) =>
    items.map((item) => (item as HTMLElement).dataset.capabilityRelation).sort(),
  )).toEqual(expectedIds);
  await expect(map.locator('[data-relation-endpoint]:not([hidden])')).not.toHaveCount(0);
  await expect(map.locator('[data-capability-relation]:not([hidden])')).toHaveCount(expectedIds.length);
  await expect(map).not.toContainText(/先修|prerequisite/i);

  const supports = map.locator('[data-capability-relation][data-relation-type="supports"]:not([hidden])').first();
  await expect(supports).toHaveAttribute('data-direction', 'forward');
  expect(await supports.evaluate((item) => getComputedStyle(item).strokeDasharray)).toBe('none');
  expect(await supports.evaluate((item) => getComputedStyle(item).markerEnd)).not.toBe('none');

  const complements = map.locator('[data-capability-relation][data-relation-type="complements"]:not([hidden])').first();
  await expect(complements).toHaveAttribute('data-direction', 'mutual');
  expect(await complements.evaluate((item) => getComputedStyle(item).strokeDasharray)).not.toBe('none');
  expect(await complements.evaluate((item) => getComputedStyle(item).markerEnd)).toBe('none');
});

test('returning to the overview clears expansion, selection, inspector and projected relations', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto('./map/');
  const map = page.locator('[data-egds-map]');
  await map.getByRole('button', { name: /Playtest、证据与迭代/ }).click();
  await map.locator('[data-map-entity-key="capability:playtesting"]')
    .getByRole('button', { name: /Playtest.*关系/ }).click();
  await map.getByRole('button', { name: '返回全图', exact: true }).click();

  await expect(map.locator('[data-egds-framework-node][data-expanded="true"]')).toHaveCount(0);
  await expect(map.locator('[data-map-entity]:not([hidden])')).toHaveCount(0);
  await expect(map.locator('[data-capability-relation]:not([hidden])')).toHaveCount(0);
  await expect(map.locator('[data-relation-endpoint]:not([hidden])')).toHaveCount(0);
  await expect(map.locator('[data-map-inspector]')).toBeHidden();
  await expect(map).not.toHaveAttribute('data-selected-entity-key', /.+/);
});

test('public map events apply capability-only career roles and focus through the root owner', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto('./map/');
  const map = page.locator('[data-egds-map]');

  await map.evaluate((element) => element.dispatchEvent(new CustomEvent('egds-map:apply-career-lens', {
    bubbles: true,
    detail: {
      profileId: 'fixture-profile',
      nodes: [
        { capabilityId: 'playtesting', priority: 'core', responsibility: 'execute' },
        { capabilityId: 'narrative-architecture', priority: 'important', responsibility: 'contribute' },
      ],
    },
  })));
  await expect(map.locator('[data-map-entity][data-map-entity-key="capability:playtesting"]')).toHaveAttribute('data-role-priority', 'core');
  await expect(map.locator('[data-map-entity][data-map-entity-key="capability:narrative-architecture"]')).toHaveAttribute('data-role-priority', 'important');
  await expect(map.locator('[data-map-entity-kind="knowledge-topic"][data-role-priority]')).toHaveCount(0);
  await expect(map.locator('[data-egds-framework-node][data-role-priority]')).toHaveCount(0);

  await map.evaluate((element) => element.dispatchEvent(new CustomEvent('egds-map:focus-capability', {
    bubbles: true,
    detail: { capabilityId: 'playtesting' },
  })));
  await expect(map.locator('#egds-playtest-evidence-iteration')).toHaveAttribute('data-expanded', 'true');
  await expect(map.locator('[data-map-entity][data-map-entity-key="capability:playtesting"]')).toHaveAttribute('data-selected', 'true');
  await expect(map.locator('[data-map-inspector]')).toBeVisible();
  await expect(map.locator('[data-map-entity][data-map-entity-key="capability:playtesting"] [data-select-map-entity]')).toBeFocused();

  await map.evaluate((element) => element.dispatchEvent(new CustomEvent('egds-map:clear-career-lens', { bubbles: true })));
  await expect(map.locator('[data-map-entity][data-role-priority]')).toHaveCount(0);
  await expect(map.locator('[data-map-entity][data-role-state]')).toHaveCount(0);
});

test('ordinary wheel scrolls the page over blank map, framework nodes and expanded entities', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 560 });
  await page.goto('./map/');
  const map = page.locator('[data-egds-map]');
  const canvas = map.locator('[data-capability-map-canvas]');

  const wheelOver = async (locator: ReturnType<Page['locator']>) => {
    await locator.scrollIntoViewIfNeeded();
    const box = await locator.boundingBox();
    if (!box) throw new Error('Missing wheel target box');
    const before = await page.evaluate(() => window.scrollY);
    await page.mouse.move(box.x + Math.min(box.width / 2, 12), box.y + Math.min(box.height / 2, 12));
    await page.mouse.wheel(0, 240);
    await expect.poll(() => page.evaluate(() => window.scrollY)).toBeGreaterThan(before);
    await expect(canvas).toHaveJSProperty('scrollTop', 0);
  };

  await wheelOver(canvas);
  await page.evaluate(() => window.scrollTo(0, 0));
  await wheelOver(map.locator('#egds-experience-design'));
  await page.evaluate(() => window.scrollTo(0, 0));
  await map.getByRole('button', { name: /Playtest、证据与迭代/ }).click();
  await wheelOver(map.locator('[data-map-entity][data-map-entity-key="capability:playtesting"]'));
  expect(await canvas.evaluate((element) => {
    const style = getComputedStyle(element);
    return [style.overflow, style.overflowY];
  })).not.toContain('auto');
});

test('responsive and no-JS modes expose the complete relationship-equivalent native outline', async ({ browser, page }) => {
  for (const width of [1024, 320]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto('./map/');
    const map = page.locator('[data-egds-map]');
    await expect(map.locator('[data-capability-map-canvas]')).toBeHidden();
    const outline = map.locator('[data-egds-outline]');
    await expect(outline).toBeVisible();
    await expect(outline.locator('[data-outline-framework-node]')).toHaveCount(28);
    await expect(outline.locator('[data-outline-entity-kind="capability"]')).toHaveCount(42);
    await expect(outline.locator('[data-outline-entity-kind="knowledge-topic"]')).toHaveCount(12);
    await expect(outline.locator('[data-outline-relation]')).toHaveCount(64);
    await assertNoPageOverflow(page);
  }

  for (const viewport of [{ width: 1440, height: 900 }, { width: 320, height: 900 }]) {
    const context = await browser.newContext({ javaScriptEnabled: false, colorScheme: 'dark', viewport });
    const noJsPage = await context.newPage();
    await noJsPage.goto('./map/');
    const map = noJsPage.locator('[data-egds-map]');
    const outline = map.locator('[data-egds-outline]');
    await expect(outline).toBeVisible();
    await expect(map.locator('[data-capability-map-canvas]')).toBeHidden();
    await expect(outline.locator('[data-outline-framework-node]')).toHaveCount(28);
    await expect(outline.locator('[data-outline-entity-kind="capability"]')).toHaveCount(42);
    await expect(outline.locator('[data-outline-entity-kind="knowledge-topic"]')).toHaveCount(12);
    await expect(outline.locator('[data-outline-relation]')).toHaveCount(64);
    await expect(outline.locator('[data-select-map-entity]')).toHaveCount(54);
    await expect(outline.locator('[data-select-map-entity]:disabled')).toHaveCount(54);
    await expect(outline).toContainText('关系查看需要 JavaScript，详情链接仍可使用。');
    await expect(outline.locator('[data-map-entity-detail]')).toHaveCount(54);
    await assertNoPageOverflow(noJsPage);
    await context.close();
  }
});

test('desktop overview stays within the approved one-screen scene height', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto('./map/');
  const map = page.locator('[data-egds-map]');
  await expect(map.locator('[data-capability-map-canvas]')).toBeVisible();
  await expect(map.locator('[data-egds-outline]')).toBeHidden();
  expect(await map.locator('[data-egds-scene]').evaluate((element) => element.getBoundingClientRect().height))
    .toBeLessThanOrEqual(720);
  await assertNoPageOverflow(page);
});
