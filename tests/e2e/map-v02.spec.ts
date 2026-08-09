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

const openOutlineNode = async (page: Page, nodeIds: string[]) => {
  const outline = page.locator('[data-egds-map] [data-egds-outline]');
  for (const nodeId of nodeIds) {
    const node = outline.locator(`[data-outline-framework-node="${nodeId}"]`);
    const summary = node.locator(':scope > summary');
    if (await summary.count()) {
      const open = await node.evaluate((element) => element instanceof HTMLDetailsElement && element.open);
      if (!open) await summary.click();
    }
  }
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
  await expect(map.locator('[data-egds-framework-node="egds-root"]')).toHaveCount(1);
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
  await expect(inspector.locator('[data-map-inspector-kind]')).toHaveText('能力');
  await expect(inspector.locator('[data-map-inspector-name]')).toHaveText('Playtest');
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
  const expandButton = map.getByRole('button', { name: /Playtest、证据与迭代/ });
  await map.locator('[data-map-entity-key="capability:playtesting"]')
    .getByRole('button', { name: /Playtest.*关系/ }).click();
  const returnButton = map.getByRole('button', { name: '返回全图', exact: true });
  await returnButton.focus();
  await page.keyboard.press('Enter');

  await expect(map.locator('[data-egds-framework-node][data-expanded="true"]')).toHaveCount(0);
  await expect(map.locator('[data-map-entity]:not([hidden])')).toHaveCount(0);
  await expect(map.locator('[data-capability-relation]:not([hidden])')).toHaveCount(0);
  await expect(map.locator('[data-relation-endpoint]:not([hidden])')).toHaveCount(0);
  await expect(map.locator('[data-map-inspector]')).toBeHidden();
  await expect(map).not.toHaveAttribute('data-selected-entity-key', /.+/);
  await expect(expandButton).toBeFocused();
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

test('map bootstrap keeps one state owner when its compiled module is cache-bust imported again', async ({ page }) => {
  await page.goto('./map/');
  const map = page.locator('[data-egds-map]');
  await map.evaluate((root) => {
    root.dataset.testScrollCalls = '0';
    const original = HTMLElement.prototype.scrollIntoView;
    HTMLElement.prototype.scrollIntoView = function scrollIntoView(...args) {
      root.dataset.testScrollCalls = String(Number(root.dataset.testScrollCalls) + 1);
      return original.apply(this, args as [ScrollIntoViewOptions]);
    };
  });
  await page.evaluate(async () => {
    const script = Array.from(document.querySelectorAll<HTMLScriptElement>('script[type="module"][src]'))
      .find((candidate) => candidate.src.includes('CapabilityMap.astro'));
    if (!script) throw new Error('Missing compiled CapabilityMap module');
    await import(`${script.src}?cache-bust=${crypto.randomUUID()}`);
  });

  await map.evaluate((root) => root.dispatchEvent(new CustomEvent('egds-map:focus-capability', {
    bubbles: true,
    detail: { capabilityId: 'playtesting' },
  })));
  await expect(map).toHaveAttribute('data-test-scroll-calls', '1');
  await expect(map).toHaveAttribute('data-egds-map-initialized', 'true');

  await page.reload();
  const reloadedMap = page.locator('[data-egds-map]');
  await expect(reloadedMap).toHaveAttribute('data-egds-map-initialized', 'true');
  await reloadedMap.evaluate((root) => root.dispatchEvent(new CustomEvent('egds-map:focus-capability', {
    bubbles: true,
    detail: { capabilityId: 'playtesting' },
  })));
  await expect(reloadedMap).toHaveAttribute('data-selected-entity-key', 'capability:playtesting');
});

test('responsive focus opens only the required disclosure chain and returns to stable context', async ({ page }) => {
  for (const width of [1024, 320]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto('./map/');
    const map = page.locator('[data-egds-map]');
    const errors: string[] = [];
    page.on('pageerror', (error) => errors.push(error.message));
    const unrelated = map.locator('[data-egds-outline] [data-outline-framework-node="with-team"]');
    await unrelated.locator(':scope > summary').click();

    for (let dispatch = 0; dispatch < 2; dispatch += 1) {
      await map.evaluate((element) => element.dispatchEvent(new CustomEvent('egds-map:focus-capability', {
        bubbles: true,
        detail: { capabilityId: 'playtesting' },
      })));
    }

    const branch = map.locator('[data-egds-outline] [data-outline-framework-node="from-plan-to-ship"]');
    const leaf = map.locator('[data-egds-outline] [data-outline-framework-node="playtest-evidence-iteration"]');
    await expect(branch).toHaveAttribute('open', '');
    await expect(leaf).toHaveAttribute('open', '');
    await expect(unrelated).toHaveAttribute('open', '');
    const relationButton = leaf.locator('[data-select-map-entity="capability:playtesting"]');
    await expect(relationButton).toBeVisible();
    await expect(relationButton).toBeFocused();
    expect(await relationButton.evaluate((element) => {
      const rect = element.getBoundingClientRect();
      return rect.top >= 0 && rect.bottom <= window.innerHeight;
    })).toBe(true);
    await expect(leaf.locator('[data-map-entity-key="capability:playtesting"]')).toHaveAttribute('data-selected', 'true');
    await expect(map.locator('[data-map-inspector]')).toBeVisible();

    const returnButton = map.getByRole('button', { name: '返回全图', exact: true });
    await expect(returnButton).toBeVisible();
    await returnButton.focus();
    await page.keyboard.press('Enter');

    await expect(branch).not.toHaveAttribute('open', '');
    await expect(leaf).not.toHaveAttribute('open', '');
    await expect(unrelated).toHaveAttribute('open', '');
    await expect(map.locator('[data-egds-framework-node][data-expanded="true"]')).toHaveCount(0);
    await expect(map.locator('[data-selected="true"]')).toHaveCount(0);
    await expect(map.locator('[data-capability-relation]:not([hidden])')).toHaveCount(0);
    await expect(map.locator('[data-map-inspector]')).toBeHidden();
    await expect(branch.locator(':scope > summary')).toBeFocused();
    expect(errors).toEqual([]);
  }
});

test('enhanced outline keeps only the last manually opened entity leaf while no-JS disclosures stay independent', async ({ browser, page }) => {
  for (const width of [1024, 320]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto('./map/');
    const outline = page.locator('[data-egds-map] [data-egds-outline]');
    const branch = outline.locator('[data-outline-framework-node="from-plan-to-ship"]');
    const prototypeLeaf = outline.locator('[data-outline-framework-node="prototype-production-breakdown"]');
    const playtestLeaf = outline.locator('[data-outline-framework-node="playtest-evidence-iteration"]');

    await branch.locator(':scope > summary').click();
    await prototypeLeaf.locator(':scope > summary').click();
    await expect(prototypeLeaf).toHaveAttribute('open', '');
    await playtestLeaf.locator(':scope > summary').click();

    await expect(branch).toHaveAttribute('open', '');
    await expect(prototypeLeaf).not.toHaveAttribute('open', '');
    await expect(playtestLeaf).toHaveAttribute('open', '');
    await expect(page.locator('[data-egds-framework-node][data-expanded="true"]')).toHaveCount(1);
    await expect(page.locator('[data-egds-framework-node="playtest-evidence-iteration"]')).toHaveAttribute('data-expanded', 'true');
    await expect(page.locator('[data-selected-entity-key]')).toHaveCount(0);
  }

  const context = await browser.newContext({
    javaScriptEnabled: false,
    viewport: { width: 320, height: 900 },
  });
  const noJsPage = await context.newPage();
  await noJsPage.goto('./map/');
  const outline = noJsPage.locator('[data-egds-map] [data-egds-outline]');
  const branch = outline.locator('[data-outline-framework-node="from-plan-to-ship"]');
  const prototypeLeaf = outline.locator('[data-outline-framework-node="prototype-production-breakdown"]');
  const playtestLeaf = outline.locator('[data-outline-framework-node="playtest-evidence-iteration"]');
  await branch.locator(':scope > summary').click();
  await prototypeLeaf.locator(':scope > summary').click();
  await playtestLeaf.locator(':scope > summary').click();
  await expect(prototypeLeaf).toHaveAttribute('open', '');
  await expect(playtestLeaf).toHaveAttribute('open', '');
  await context.close();
});

test('1024 outline removes recursive indentation and gives deep content a readable single column', async ({ page }) => {
  await page.setViewportSize({ width: 1024, height: 900 });
  await page.goto('./map/');
  await openOutlineNode(page, ['experience-design', 'reconstruction', 'narrative-lever']);

  const deepLeaf = page.locator('[data-egds-outline] [data-outline-framework-node="narrative-lever"]');
  const metrics = await deepLeaf.evaluate((element) => {
    const body = element.querySelector<HTMLElement>(':scope > .egds-outline-node-body');
    const paragraph = body?.querySelector<HTMLElement>(':scope > p');
    const entities = body?.querySelector<HTMLElement>('.egds-outline-entities');
    const entityName = entities?.querySelector<HTMLElement>('li > strong');
    const openMargins = Array.from(
      element.closest('[data-egds-outline]')?.querySelectorAll<HTMLDetailsElement>('details[open]') ?? [],
    ).map((details) => Number.parseFloat(getComputedStyle(details).marginLeft));
    return {
      bodyPaddingLeft: body ? Number.parseFloat(getComputedStyle(body).paddingLeft) : Number.NaN,
      paragraphWidth: paragraph?.getBoundingClientRect().width ?? 0,
      entityGridColumns: entities ? getComputedStyle(entities).gridTemplateColumns.split(' ').length : 0,
      entityNameWidth: entityName?.getBoundingClientRect().width ?? 0,
      openMargins,
    };
  });

  expect(metrics.bodyPaddingLeft).toBeLessThanOrEqual(16);
  expect(metrics.paragraphWidth).toBeGreaterThanOrEqual(500);
  expect(metrics.entityGridColumns).toBe(1);
  expect(metrics.entityNameWidth).toBeGreaterThanOrEqual(320);
  expect(metrics.openMargins.every((margin) => margin === 0)).toBe(true);
  await assertNoPageOverflow(page);
});

test('selected capability stays visible and focused when desktop becomes outline', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto('./map/');
  const map = page.locator('[data-egds-map]');
  await map.evaluate((element) => element.dispatchEvent(new CustomEvent('egds-map:focus-capability', {
    bubbles: true,
    detail: { capabilityId: 'playtesting' },
  })));
  await expect(map.locator('[data-capability-map-canvas] [data-select-map-entity="capability:playtesting"]')).toBeFocused();

  await page.setViewportSize({ width: 1024, height: 900 });
  const outlineButton = map.locator('[data-egds-outline] [data-select-map-entity="capability:playtesting"]');
  await expect(outlineButton).toBeVisible();
  await expect(outlineButton).toBeFocused();
  await expect(map.locator('[data-capability-map-canvas] [data-map-entity-key="capability:playtesting"]')).toHaveAttribute('data-selected', 'true');
  await expect(map.locator('[data-egds-outline] [data-map-entity-key="capability:playtesting"]')).toHaveAttribute('data-selected', 'true');
  await expect(map.locator('[data-map-inspector]')).toBeVisible();
  await expect(map.getByRole('button', { name: '返回全图', exact: true })).toBeVisible();

  await map.getByRole('button', { name: '返回全图', exact: true }).focus();
  await page.keyboard.press('Enter');
  await expect(map.locator('[data-outline-framework-node][open]')).toHaveCount(0);
  await expect(map.locator('[data-selected="true"]')).toHaveCount(0);
  await expect(map.locator('[data-capability-relation]:not([hidden])')).toHaveCount(0);
  await expect(map.locator('[data-map-inspector]')).toBeHidden();
  await expect(map.locator('[data-outline-framework-node="from-plan-to-ship"] > summary')).toBeFocused();
});

test('focus restores inline scroll behavior when scrolling fails', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.setViewportSize({ width: 1024, height: 900 });
  await page.goto('./map/');
  await page.evaluate(() => {
    document.documentElement.style.scrollBehavior = 'smooth';
    HTMLElement.prototype.scrollIntoView = () => {
      throw new Error('scroll unavailable');
    };
  });
  const map = page.locator('[data-egds-map]');
  await map.evaluate((element) => element.dispatchEvent(new CustomEvent('egds-map:focus-capability', {
    bubbles: true,
    detail: { capabilityId: 'playtesting' },
  })));
  await expect(map.locator('[data-map-inspector]')).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.style.scrollBehavior)).toBe('smooth');
  expect(errors).toEqual([]);
});

test('invalid career lens payloads are rejected atomically without page errors', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.goto('./map/');
  const map = page.locator('[data-egds-map]');
  const invalidDetails: unknown[] = [
    null,
    { profileId: 'fixture', nodes: 'playtesting' },
    { profileId: 'fixture', nodes: [{ capabilityId: 'playtesting', priority: 'required' }] },
    { profileId: 'fixture', nodes: [{ capabilityId: 'playtesting', priority: 'core', responsibility: 'own' }] },
    { profileId: 'fixture', nodes: [{ capabilityId: 'unknown-capability', priority: 'core' }] },
    { profileId: 'fixture', nodes: [
      { capabilityId: 'playtesting', priority: 'core' },
      { capabilityId: 'playtesting', priority: 'important' },
    ] },
    { profileId: '', nodes: [] },
  ];

  for (const detail of invalidDetails) {
    await map.evaluate((element, eventDetail) => element.dispatchEvent(
      eventDetail === null
        ? new CustomEvent('egds-map:apply-career-lens', { bubbles: true })
        : new CustomEvent('egds-map:apply-career-lens', { bubbles: true, detail: eventDetail }),
    ), detail);
    await expect(map).not.toHaveAttribute('data-career-profile-id', /.+/);
    await expect(map.locator('[data-role-state], [data-role-priority], [data-role-responsibility]')).toHaveCount(0);
    await expect(map.locator('[data-egds-framework-node][data-career-core-count]')).toHaveCount(0);
  }
  expect(errors).toEqual([]);
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

test('page shell uses outline until the fixed desktop scene fully fits', async ({ page }) => {
  for (const width of [1151, 1200]) {
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
    await expect(outline.locator('[data-map-entity-detail]')).toHaveCount(54);
    await assertNoPageOverflow(page);
  }

  await page.setViewportSize({ width: 1228, height: 900 });
  await page.goto('./map/');
  const map = page.locator('[data-egds-map]');
  const canvas = map.locator('[data-capability-map-canvas]');
  await expect(canvas).toBeVisible();
  await expect(map.locator('[data-egds-outline]')).toBeHidden();
  expect(await canvas.evaluate((element) => element.clientWidth)).toBeGreaterThanOrEqual(1180);
  await expect(map.locator('[data-capability-map-canvas] [data-egds-framework-node]')).toHaveCount(28);
  expect(await map.locator('[data-capability-map-canvas] [data-egds-framework-node]').evaluateAll((items) =>
    items.filter((item) => item.getBoundingClientRect().width > 0).length,
  )).toBe(28);
  await assertNoPageOverflow(page);
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
    await outline.locator('[data-outline-framework-node="from-plan-to-ship"] > summary').click();
    await outline.locator('[data-outline-framework-node="playtest-evidence-iteration"] > summary').click();
    await expect(outline.locator(
      '[data-outline-framework-node="playtest-evidence-iteration"] [data-map-entity-detail][aria-label="打开 Playtest 详情"]',
    )).toBeVisible();
    await assertNoPageOverflow(noJsPage);
    await context.close();
  }
});

test('responsive selected state keeps a keyboard-operable return action', async ({ page }) => {
  for (const width of [1024, 320]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto('./map/');
    const map = page.locator('[data-egds-map]');
    const unrelated = map.locator('[data-egds-outline] [data-outline-framework-node="with-team"]');
    await unrelated.locator(':scope > summary').click();
    await openOutlineNode(page, ['from-plan-to-ship', 'playtest-evidence-iteration']);
    await map.locator('[data-egds-outline] [data-map-entity-key="capability:playtesting"]')
      .getByRole('button', { name: /Playtest.*关系/ }).click();

    const branch = map.locator('[data-egds-outline] [data-outline-framework-node="from-plan-to-ship"]');
    const leaf = map.locator('[data-egds-outline] [data-outline-framework-node="playtest-evidence-iteration"]');
    await expect(branch).toHaveAttribute('data-map-state-owned', 'true');
    await expect(leaf).toHaveAttribute('data-map-state-owned', 'true');
    await expect(unrelated).not.toHaveAttribute('data-map-state-owned', /.+/);
    await expect(map.locator('[data-map-inspector]')).toBeVisible();
    const returnButton = map.getByRole('button', { name: '返回全图', exact: true });
    await expect(returnButton).toBeVisible();
    await returnButton.focus();
    await expect(returnButton).toBeFocused();
    await page.keyboard.press('Enter');

    await expect(map.locator('[data-egds-framework-node][data-expanded="true"]')).toHaveCount(0);
    await expect(map.locator('[data-map-entity][data-selected="true"]')).toHaveCount(0);
    await expect(map.locator('[data-capability-relation]:not([hidden])')).toHaveCount(0);
    await expect(map.locator('[data-map-inspector]')).toBeHidden();
    await expect(branch).not.toHaveAttribute('open', '');
    await expect(leaf).not.toHaveAttribute('open', '');
    await expect(map.locator('[data-map-state-owned]')).toHaveCount(0);
    await expect(unrelated).toHaveAttribute('open', '');
    await expect(branch.locator(':scope > summary')).toBeFocused();

    await page.evaluate(() => window.scrollTo(0, 0));
    const before = await page.evaluate(() => window.scrollY);
    const box = await map.locator('[data-egds-outline]').boundingBox();
    if (!box) throw new Error('Missing responsive outline box');
    await page.mouse.move(box.x + 8, box.y + 8);
    await page.mouse.wheel(0, 240);
    await expect.poll(() => page.evaluate(() => window.scrollY)).toBeGreaterThan(before);
    await assertNoPageOverflow(page);
  }
});

test('closing a selected outline disclosure clears hidden map state without affecting unrelated toggles', async ({ page }) => {
  for (const width of [1024, 320]) {
    for (const targetNodeId of ['playtest-evidence-iteration', 'from-plan-to-ship']) {
      await page.setViewportSize({ width, height: 900 });
      await page.goto('./map/');
      const errors: string[] = [];
      page.on('pageerror', (error) => errors.push(error.message));
      const map = page.locator('[data-egds-map]');
      await map.evaluate((element) => element.dispatchEvent(new CustomEvent('egds-map:focus-capability', {
        bubbles: true,
        detail: { capabilityId: 'playtesting' },
      })));

      const unrelated = map.locator('[data-egds-outline] [data-outline-framework-node="with-team"]');
      await unrelated.locator(':scope > summary').click();
      await expect(unrelated).toHaveAttribute('open', '');
      await expect(map).toHaveAttribute('data-selected-entity-key', 'capability:playtesting');
      await expect(map.locator('[data-map-inspector]')).toBeVisible();

      const target = map.locator(`[data-egds-outline] [data-outline-framework-node="${targetNodeId}"]`);
      const summary = target.locator(':scope > summary');
      await summary.click();

      await expect(target).not.toHaveAttribute('open', '');
      await expect(map).not.toHaveAttribute('data-selected-entity-key', /.+/);
      await expect(map.locator('[data-egds-framework-node][data-expanded="true"]')).toHaveCount(0);
      await expect(map.locator('[data-selected="true"]')).toHaveCount(0);
      await expect(map.locator('[data-capability-relation]:not([hidden])')).toHaveCount(0);
      await expect(map.locator('[data-map-inspector]')).toBeHidden();
      await expect(map.getByRole('button', { name: '返回全图', exact: true })).toBeHidden();
      await expect(map.locator('[data-map-state-owned]')).toHaveCount(0);
      await expect(unrelated).toHaveAttribute('open', '');
      await expect(summary).toBeVisible();
      await expect(summary).toBeFocused();
      expect(errors).toEqual([]);
    }
  }
});

test('outline is a collapsed parentNodeId hierarchy with independent relationships', async ({ page }) => {
  await page.setViewportSize({ width: 1024, height: 900 });
  await page.goto('./map/');
  const outline = page.locator('[data-egds-map] [data-egds-outline]');
  const root = outline.locator('[data-outline-framework-node="egds-root"]');
  await expect(root).toHaveCount(1);
  const branches = outline.locator(
    '[data-outline-children="egds-root"] > li > [data-outline-framework-node][data-outline-node-kind="branch"]',
  );
  await expect(branches).toHaveCount(5);
  for (let index = 0; index < 5; index += 1) await expect(branches.nth(index).locator(':scope > summary')).toBeVisible();
  await expect(outline.locator('[data-outline-framework-node]')).toHaveCount(28);
  await expect(outline.locator('[data-outline-entity-kind="capability"]')).toHaveCount(42);
  await expect(outline.locator('[data-outline-entity-kind="knowledge-topic"]')).toHaveCount(12);
  await expect(outline.locator('[data-outline-relation]')).toHaveCount(64);

  const relationships = outline.locator('[data-outline-relations-disclosure]');
  await expect(relationships).toHaveCount(1);
  await expect(relationships).not.toHaveAttribute('open', '');
  await expect(outline.locator('[data-outline-entity-kind]:visible')).toHaveCount(0);
  const collapsedHeight = await outline.evaluate((element) => element.getBoundingClientRect().height);
  await outline.locator('details').evaluateAll((items) => items.forEach((item) => {
    (item as HTMLDetailsElement).open = true;
  }));
  const expandedHeight = await outline.evaluate((element) => element.getBoundingClientRect().height);
  expect(expandedHeight).toBeGreaterThan(collapsedHeight * 2);

  await outline.locator('details').evaluateAll((items) => items.forEach((item) => {
    (item as HTMLDetailsElement).open = false;
  }));
  await openOutlineNode(page, ['from-plan-to-ship', 'playtest-evidence-iteration']);
  await expect(outline.locator(
    '[data-outline-framework-node="playtest-evidence-iteration"] [data-outline-entity-kind]:visible',
  )).toHaveCount(7);
});

test('visible node type, name and action text respects category font floors', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto('./map/');
  const map = page.locator('[data-egds-map]');
  await map.getByRole('button', { name: /Playtest、证据与迭代/ }).click();
  const violations = await map.locator(
    '[data-capability-map-canvas] [data-egds-framework-node], [data-capability-map-canvas] [data-map-entity]:not([hidden])',
  ).evaluateAll((nodes) => {
    const floors: Record<string, number> = {
      root: 16,
      branch: 16,
      entry: 14,
      stage: 14,
      lever: 14,
      cluster: 13,
      'external-entry': 13,
      capability: 12,
      'knowledge-topic': 12,
    };
    return nodes.flatMap((node) => {
      const element = node as HTMLElement;
      const kind = element.dataset.egdsKind
        ?? element.dataset.egdsNodeKind
        ?? element.dataset.mapEntityKind
        ?? '';
      const floor = floors[kind];
      const labels = element.matches('[data-map-entity]')
        ? element.querySelectorAll<HTMLElement>(':scope > .map-entity__type, :scope > strong, :scope > [data-map-entity-controls] > button, :scope > [data-map-entity-controls] > a')
        : element.querySelectorAll<HTMLElement>(':scope > .egds-framework-node__type, :scope > h3, :scope > button, :scope > a');
      return Array.from(labels)
        .filter((label) => label.getClientRects().length > 0)
        .map((label) => ({
          kind,
          text: label.textContent?.trim(),
          size: Number.parseFloat(getComputedStyle(label).fontSize),
          floor,
        }))
        .filter(({ size }) => !floor || size + 0.01 < floor);
    });
  });
  expect(violations).toEqual([]);
});

test('desktop framework names remain complete within at most two natural lines', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto('./map/');
  const failures = await page.locator(
    '[data-egds-map] [data-capability-map-canvas] [data-egds-framework-node]',
  ).evaluateAll((nodes) => nodes.flatMap((node) => {
    const name = node.querySelector<HTMLElement>(':scope > h3');
    if (!name || name.getClientRects().length === 0) return [];
    const style = getComputedStyle(name);
    const lineHeight = Number.parseFloat(style.lineHeight);
    const lineCount = Math.round(name.getBoundingClientRect().height / lineHeight);
    const issues = [];
    if (style.textOverflow === 'ellipsis') issues.push('ellipsis');
    if (style.whiteSpace === 'nowrap') issues.push('nowrap');
    if (style.webkitLineClamp !== 'none') issues.push(`line-clamp:${style.webkitLineClamp}`);
    if (name.scrollWidth > name.clientWidth) issues.push(`${name.scrollWidth}>${name.clientWidth}:width`);
    if (name.scrollHeight > name.clientHeight + 1) issues.push(`${name.scrollHeight}>${name.clientHeight}:height`);
    if (lineCount > 2) issues.push(`${lineCount}:lines`);
    return issues.map((issue) => ({
      id: (node as HTMLElement).dataset.egdsFrameworkNode,
      name: name.textContent?.trim(),
      issue,
    }));
  }));
  expect(failures).toEqual([]);
});

test('fixed framework labels stay inside their geometry without colliding', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto('./map/');
  const failures = await page.locator(
    '[data-egds-map] [data-capability-map-canvas] [data-egds-framework-node]',
  ).evaluateAll((nodes) => nodes.flatMap((node) => {
    const bounds = node.getBoundingClientRect();
    const labels = Array.from(node.querySelectorAll<HTMLElement>(
      ':scope > .egds-framework-node__type, :scope > h3, :scope > button, :scope > a, :scope > [data-framework-empty]',
    )).filter((label) => label.getClientRects().length > 0);
    const issues = labels.flatMap((label) => {
      const rect = label.getBoundingClientRect();
      return rect.left < bounds.left - 0.5
        || rect.right > bounds.right + 0.5
        || rect.top < bounds.top - 0.5
        || rect.bottom > bounds.bottom + 0.5
        ? [`${(node as HTMLElement).dataset.egdsFrameworkNode}:${label.textContent?.trim()}:outside`]
        : [];
    });
    labels.forEach((left, leftIndex) => {
      const leftRect = left.getBoundingClientRect();
      labels.slice(leftIndex + 1).forEach((right) => {
        const rightRect = right.getBoundingClientRect();
        const verticalOverlap = leftRect.top < rightRect.bottom - 0.5
          && leftRect.bottom > rightRect.top + 0.5;
        if (verticalOverlap && leftRect.left < rightRect.right - 0.5 && leftRect.right > rightRect.left + 0.5) {
          issues.push(`${(node as HTMLElement).dataset.egdsFrameworkNode}:${left.textContent?.trim()}->${right.textContent?.trim()}`);
        } else if (verticalOverlap) {
          const gap = Math.max(rightRect.left - leftRect.right, leftRect.left - rightRect.right);
          if (gap < 3.5) {
            issues.push(`${(node as HTMLElement).dataset.egdsFrameworkNode}:${left.textContent?.trim()}~${right.textContent?.trim()}:cramped`);
          }
        }
      });
    });
    return issues;
  }));
  expect(failures).toEqual([]);
});

test('publishes the exact inspector and framework DOM contract', async ({ page }) => {
  await page.goto('./map/');
  const map = page.locator('[data-egds-map]');
  await expect(map.locator('[data-egds-framework-node][data-egds-kind]')).toHaveCount(28);
  await expect(map.locator('[data-egds-node-kind]')).toHaveCount(0);
  const inspector = map.locator('[data-map-inspector]');
  for (const target of ['kind', 'name', 'summary', 'relations', 'resources', 'detail']) {
    await expect(inspector.locator(`[data-map-inspector-${target}]`)).toHaveCount(1);
    await expect(inspector.locator(`[data-inspector-${target}]`)).toHaveCount(0);
  }
  await expect(inspector.locator('[data-map-inspector-data]')).toHaveCount(0);
});

test('entity actions expose entity-specific accessible names without nesting', async ({ page }) => {
  await page.goto('./map/');
  const rows = page.locator('[data-egds-map] [data-map-entity], [data-egds-map] [data-outline-entity-kind]');
  expect(await rows.count()).toBe(108);
  const failures = await rows.evaluateAll((items) => items.flatMap((item) => {
    const name = item.querySelector(':scope > strong')?.textContent?.trim() ?? '';
    const controls = item.querySelector<HTMLElement>(':scope > [data-map-entity-controls]');
    const button = controls?.querySelector(':scope > button');
    const link = controls?.querySelector(':scope > a');
    const order = controls ? Array.from(controls.children).map(({ tagName }) => tagName) : [];
    const issues = [];
    if (!button?.getAttribute('aria-label')?.includes(name)) issues.push('relation-name');
    if (link?.getAttribute('aria-label') !== `打开 ${name} 详情`) issues.push('detail-name');
    if (JSON.stringify(order) !== JSON.stringify(['BUTTON', 'A'])) issues.push('order');
    if (controls?.querySelector('button a, a button')) issues.push('nested');
    return issues.map((issue) => ({ name, issue }));
  }));
  expect(failures).toEqual([]);
});

test('shape and line treatments redundantly distinguish map entity kinds', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto('./map/');
  const map = page.locator('[data-egds-map]');
  const methodFrames = await map.locator(
    '[data-egds-framework-node]:is([data-egds-kind="entry"], [data-egds-node-kind="entry"]), [data-egds-framework-node]:is([data-egds-kind="stage"], [data-egds-node-kind="stage"]), [data-egds-framework-node]:is([data-egds-kind="lever"], [data-egds-node-kind="lever"]), [data-egds-framework-node]:is([data-egds-kind="cluster"], [data-egds-node-kind="cluster"])',
  ).evaluateAll((items) => items.map((item) => {
    const style = getComputedStyle(item);
    return { right: style.borderRightWidth, bottom: style.borderBottomWidth };
  }));
  expect(methodFrames.every(({ right, bottom }) => right === '0px' && bottom === '0px')).toBe(true);

  await map.getByRole('button', { name: /Playtest、证据与迭代/ }).click();
  const capability = map.locator('[data-map-entity-kind="capability"]:not([hidden])').first();
  const topic = map.locator('[data-map-entity-kind="knowledge-topic"]:not([hidden])').first();
  const shape = async (locator: typeof capability) => locator.evaluate((item) => {
    const style = getComputedStyle(item);
    return {
      widths: [style.borderTopWidth, style.borderRightWidth, style.borderBottomWidth, style.borderLeftWidth],
      styles: [style.borderTopStyle, style.borderRightStyle, style.borderBottomStyle, style.borderLeftStyle],
      radius: Number.parseFloat(style.borderTopLeftRadius),
    };
  });
  const capabilityShape = await shape(capability);
  expect(capabilityShape.widths.every((width) => width !== '0px')).toBe(true);
  expect(capabilityShape.styles.every((style) => style === 'solid')).toBe(true);
  expect(capabilityShape.radius).toBeGreaterThan(0);
  const topicShape = await shape(topic);
  expect(topicShape.widths.every((width) => width !== '0px')).toBe(true);
  expect(topicShape.styles.every((style) => style === 'dashed')).toBe(true);
  expect(topicShape.radius).toBe(0);

  const topicLegend = await map.locator('.map-key__topic').evaluate((item) => {
    const style = getComputedStyle(item);
    return {
      transform: style.transform,
      borderStyle: style.borderStyle,
      radius: Number.parseFloat(style.borderRadius),
    };
  });
  expect(topicLegend).toEqual({ transform: 'none', borderStyle: 'dashed', radius: 0 });

  const externalLink = map.locator('[data-egds-framework-node]:is([data-egds-kind="external-entry"], [data-egds-node-kind="external-entry"]) a');
  const externalTreatment = await externalLink.evaluate((item) => ({
    display: getComputedStyle(item).display,
    decoration: getComputedStyle(item).textDecorationLine,
  }));
  expect(['flex', 'inline-flex']).toContain(externalTreatment.display);
  expect(externalTreatment.decoration).toBe('underline');
});

test('empty framework containers disclose that capability content is pending', async ({ page }) => {
  await page.setViewportSize({ width: 1024, height: 900 });
  await page.goto('./map/');
  const map = page.locator('[data-egds-map]');
  const desktopNode = map.locator('#egds-mindset-problem-solving-tools');
  await expect(desktopNode.locator('[data-expand-framework-node]')).toHaveCount(0);
  await expect(desktopNode.locator('[data-framework-empty]')).toHaveText('能力内容待补充');
  await openOutlineNode(page, ['from-plan-to-ship', 'mindset-problem-solving-tools']);
  const outlineNode = map.locator('[data-egds-outline] [data-outline-framework-node="mindset-problem-solving-tools"]');
  await expect(outlineNode.locator('[data-outline-empty]')).toBeVisible();
  await expect(outlineNode.locator('[data-outline-empty]')).toHaveText('能力内容待补充');
  await expect(outlineNode.locator('[data-expand-framework-node]')).toHaveCount(0);
});

test('all 19 projected expansions avoid box overlaps and unrelated path intersections', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto('./map/');
  const map = page.locator('[data-egds-map]');
  const expandButtons = map.locator('[data-capability-map-canvas] [data-expand-framework-node]');
  await expect(expandButtons).toHaveCount(19);

  for (let index = 0; index < 19; index += 1) {
    await expandButtons.nth(index).click();
    const overlapPairs = await map.locator(
      '[data-capability-map-canvas] [data-egds-framework-node], [data-capability-map-canvas] [data-map-entity]:not([hidden]), [data-capability-map-canvas] [data-relation-endpoint]:not([hidden])',
    ).evaluateAll((items) => {
      const boxes = items.map((item) => {
        const rect = item.getBoundingClientRect();
        const element = item as HTMLElement;
        return {
          key: element.dataset.mapEntityKey ?? element.dataset.egdsFrameworkNode ?? element.dataset.relationEndpoint,
          left: rect.left,
          right: rect.right,
          top: rect.top,
          bottom: rect.bottom,
        };
      });
      return boxes.flatMap((left, leftIndex) => boxes.slice(leftIndex + 1).flatMap((right) => (
        left.left < right.right - 0.5
        && left.right > right.left + 0.5
        && left.top < right.bottom - 0.5
        && left.bottom > right.top + 0.5
          ? [`${left.key}->${right.key}`]
          : []
      )));
    });
    expect(overlapPairs).toEqual([]);

    const capabilityButton = map.locator(
      '[data-capability-map-canvas] [data-map-entity-kind="capability"]:not([hidden]) [data-select-map-entity]',
    ).first();
    if (await capabilityButton.count()) {
      await capabilityButton.click();
      const intersections = await map.locator('[data-egds-scene]').evaluate((scene) => {
        const sceneRect = scene.getBoundingClientRect();
        const boxes = Array.from(scene.querySelectorAll<HTMLElement>(
          '[data-egds-framework-node], [data-map-entity]:not([hidden]), [data-relation-endpoint]:not([hidden])',
        )).map((item) => {
          const rect = item.getBoundingClientRect();
          return {
            key: item.dataset.capabilityId ?? item.dataset.relationEndpoint ?? item.dataset.egdsFrameworkNode ?? '',
            left: rect.left - sceneRect.left,
            right: rect.right - sceneRect.left,
            top: rect.top - sceneRect.top,
            bottom: rect.bottom - sceneRect.top,
          };
        });
        return Array.from(scene.querySelectorAll<SVGPathElement>('[data-capability-relation]:not([hidden])'))
          .flatMap((path) => {
            const from = path.dataset.from;
            const to = path.dataset.to;
            const length = path.getTotalLength();
            for (let distance = 2; distance < length - 2; distance += 2) {
              const point = path.getPointAtLength(distance);
              const hit = boxes.find((box) => (
                box.key !== from
                && box.key !== to
                && point.x > box.left + 1
                && point.x < box.right - 1
                && point.y > box.top + 1
                && point.y < box.bottom - 1
              ));
              if (hit) return [`${path.dataset.capabilityRelation}->${hit.key}`];
            }
            return [];
          });
      });
      expect(intersections).toEqual([]);
    }
    await map.getByRole('button', { name: '返回全图', exact: true }).click();
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
