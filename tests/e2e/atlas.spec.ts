import { expect, test, type Locator, type Page } from '@playwright/test';

const atlasUrl = 'http://127.0.0.1:4321/Learn-About-Games/atlas/';

const entityIds = async (locator: Locator) =>
  locator.evaluateAll((elements: Element[]) =>
    elements.map((element) =>
      element.getAttribute('data-atlas-node-id') ?? element.getAttribute('data-atlas-relation'),
    ),
  );

async function clickVisibleRelationSegment(page: Page, relationId: string) {
  const relation = page.locator(`[data-atlas-relation="${relationId}"]`);
  await relation.locator('[data-atlas-relation-path]').scrollIntoViewIfNeeded();
  const point = await relation.evaluate((group) => {
    const path = group.querySelector<SVGPathElement>('[data-atlas-relation-path]');
    const matrix = path?.getScreenCTM();
    if (!path || !matrix) return null;
    const length = path.getTotalLength();
    for (let index = 1; index < 20; index += 1) {
      const pathPoint = path.getPointAtLength((length * index) / 20);
      const screenPoint = new DOMPoint(pathPoint.x, pathPoint.y).matrixTransform(matrix);
      const hit = document.elementFromPoint(screenPoint.x, screenPoint.y);
      if (hit?.closest('[data-atlas-relation]') === group) {
        return { x: screenPoint.x, y: screenPoint.y };
      }
    }
    return null;
  });
  expect(point, `${relationId} has no visible clickable segment`).not.toBeNull();
  await page.mouse.click(point!.x, point!.y);
}

test('reaches the global Innovation Atlas through shared navigation', async ({ page }) => {
  await page.goto('./');
  const compactMenu = page.locator('details.site-nav__compact');
  if (await compactMenu.isVisible()) {
    await compactMenu.locator('summary').click();
    await compactMenu.getByRole('link', { name: '创新变迁', exact: true }).click();
  } else {
    await page.getByRole('navigation', { name: '主导航' }).getByRole('link', { name: '创新变迁', exact: true }).click();
  }

  await expect(page).toHaveURL(/\/Learn-About-Games\/atlas\/$/);
  await expect(page.getByRole('heading', { name: 'Game Innovation Atlas', exact: true })).toBeVisible();
  await expect(page.getByText('同一张全局时间网络', { exact: false })).toBeVisible();
});

test('server renders one fixed 27-node and 25-relation time network', async ({ page }, testInfo) => {
  await page.goto('./atlas/');

  const network = page.locator('[data-atlas-global-network]');
  const nodes = network.locator('[data-atlas-node]');
  const relations = network.locator('[data-atlas-relation]');
  await expect(network).toHaveCount(1);
  await expect(nodes).toHaveCount(27);
  await expect(relations).toHaveCount(25);
  expect(new Set(await entityIds(nodes)).size).toBe(27);
  expect(new Set(await entityIds(relations)).size).toBe(25);
  await expect(network.locator('[data-atlas-node][data-atlas-node-kind="game"]')).toHaveCount(24);
  await expect(network.locator('[data-atlas-node][data-atlas-node-kind="innovation"]')).toHaveCount(1);
  await expect(network.locator('[data-atlas-node][data-atlas-node-kind="category"]')).toHaveCount(2);

  const nodeGeometry = await nodes.evaluateAll((elements) =>
    elements.map((element) => ({
      id: element.getAttribute('data-atlas-node-id'),
      year: Number(element.getAttribute('data-start-year')),
      x: Number(element.getAttribute('data-year-x')),
    })),
  );
  const ordered = [...nodeGeometry].sort((left, right) => left.year - right.year || String(left.id).localeCompare(String(right.id)));
  for (let index = 1; index < ordered.length; index += 1) {
    if (ordered[index].year === ordered[index - 1].year) {
      expect(ordered[index].x).toBe(ordered[index - 1].x);
    } else {
      expect(ordered[index].x).toBeGreaterThan(ordered[index - 1].x);
    }
  }

  await expect(network.locator('[data-atlas-node][data-atlas-node-id="metroidvania-term-category-formation"] time')).toContainText('2001-2015');
  await expect(network.locator('[data-atlas-node][data-atlas-node-id="indie-metroidvania-expansion"] time')).toContainText('2004-2015');

  if (testInfo.project.name === 'chromium') {
    const overflowingLabels = await nodes.evaluateAll((elements) =>
      elements.flatMap((element) => {
        const link = element.querySelector<HTMLElement>('[data-atlas-node-link]');
        const type = link?.querySelector<HTMLElement>('.atlas-network-node__type');
        const title = link?.querySelector<HTMLElement>('strong');
        const time = link?.querySelector<HTMLElement>('time');
        if (!link || !type || !title || !time) return [element.getAttribute('data-atlas-node-id')];
        const linkBox = link.getBoundingClientRect();
        const typeBox = type.getBoundingClientRect();
        const titleBox = title.getBoundingClientRect();
        const timeBox = time.getBoundingClientRect();
        const isCategory = element.getAttribute('data-atlas-node-kind') === 'category';
        const fits =
          link.scrollWidth <= link.clientWidth &&
          titleBox.left >= linkBox.left &&
          titleBox.right <= linkBox.right &&
          typeBox.top >= linkBox.top &&
          timeBox.bottom <= linkBox.bottom &&
          (isCategory
            ? typeBox.right <= titleBox.left && titleBox.right <= timeBox.left
            : typeBox.bottom <= titleBox.top && titleBox.bottom <= timeBox.top);
        return fits ? [] : [element.getAttribute('data-atlas-node-id')];
      }),
    );
    expect(overflowingLabels).toEqual([]);

    const boxes = await nodes.evaluateAll((elements) =>
      elements.map((element) => {
        const rect = element.getBoundingClientRect();
        return { id: element.getAttribute('data-atlas-node-id'), left: rect.left, right: rect.right, top: rect.top, bottom: rect.bottom };
      }),
    );
    for (let leftIndex = 0; leftIndex < boxes.length; leftIndex += 1) {
      for (let rightIndex = leftIndex + 1; rightIndex < boxes.length; rightIndex += 1) {
        const left = boxes[leftIndex];
        const right = boxes[rightIndex];
        const overlaps = left.left < right.right && left.right > right.left && left.top < right.bottom && left.bottom > right.top;
        expect(overlaps, `${left.id} overlaps ${right.id}`).toBe(false);
      }
    }
  }
});

test('theme controls only change emphasis without changing graph identity or geometry', async ({ page }) => {
  await page.goto('./atlas/');

  const nodes = page.locator('[data-atlas-global-network] [data-atlas-node]');
  const relations = page.locator('[data-atlas-global-network] [data-atlas-relation]');
  const buttons = page.locator('[data-atlas-theme-button]');
  await expect(buttons).toHaveCount(3);
  for (const button of await buttons.all()) {
    await expect(button).toBeEnabled();
  }
  await expect(page.locator('[data-atlas-theme-button="all"]')).toHaveAttribute('aria-pressed', 'true');

  const beforeNodes = await nodes.evaluateAll((elements) =>
    elements.map((element) => ({ id: element.getAttribute('data-atlas-node-id'), style: element.getAttribute('style') })),
  );
  const beforeRelations = await relations.evaluateAll((elements) =>
    elements.map((element) => ({ id: element.getAttribute('data-atlas-relation'), path: element.querySelector('[data-atlas-relation-path]')?.getAttribute('d') })),
  );

  for (const lens of ['roguelike', 'metroidvania']) {
    await page.locator(`[data-atlas-theme-button="${lens}"]`).click();
    await expect(page.locator(`[data-atlas-theme-button="${lens}"]`)).toHaveAttribute('aria-pressed', 'true');
    expect(await nodes.evaluateAll((elements) => elements.map((element) => ({ id: element.getAttribute('data-atlas-node-id'), style: element.getAttribute('style') })))).toEqual(beforeNodes);
    expect(await relations.evaluateAll((elements) => elements.map((element) => ({ id: element.getAttribute('data-atlas-relation'), path: element.querySelector('[data-atlas-relation-path]')?.getAttribute('d') })))).toEqual(beforeRelations);
    await expect(page.locator('[data-atlas-global-network] [data-atlas-node][data-theme-match="true"]')).not.toHaveCount(27);
    await expect(page.locator('[data-atlas-global-network] [data-atlas-relation][data-theme-match="true"]')).not.toHaveCount(25);
    await expect(page.locator('[data-atlas-global-network] [data-atlas-node][data-atlas-node-id="dead-cells"]')).toHaveAttribute('data-theme-match', 'true');
  }

  await page.locator('[data-atlas-theme-button="all"]').click();
  await expect(page.locator('[data-atlas-global-network] [data-atlas-node][data-theme-match="true"]')).toHaveCount(27);
  await expect(page.locator('[data-atlas-global-network] [data-atlas-relation][data-theme-match="true"]')).toHaveCount(25);
});

test('relation geometry preserves endpoints, arrows and an undirected structural comparison', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'chromium', 'Desktop geometry is tested once.');
  await page.goto('./atlas/');

  const network = page.locator('[data-atlas-global-network]');
  const nodes = await network.locator('[data-atlas-node]').evaluateAll((elements) =>
    Object.fromEntries(elements.map((element) => [
      element.getAttribute('data-atlas-node-id'),
      {
        centerX: Number(element.getAttribute('data-center-x')),
        centerY: Number(element.getAttribute('data-center-y')),
        left: Number(element.getAttribute('data-node-left')),
        top: Number(element.getAttribute('data-node-top')),
        width: Number(element.getAttribute('data-node-width')),
        height: Number(element.getAttribute('data-node-height')),
      },
    ])),
  );
  const relations = network.locator('[data-atlas-relation]');
  const relationGeometry = await relations.evaluateAll((elements) =>
    elements.map((element) => ({
      id: element.getAttribute('data-atlas-relation'),
      fromId: element.getAttribute('data-from-id'),
      toId: element.getAttribute('data-to-id'),
      directionality: element.getAttribute('data-relation-directionality'),
      start: { x: Number(element.getAttribute('data-start-x')), y: Number(element.getAttribute('data-start-y')) },
      end: { x: Number(element.getAttribute('data-end-x')), y: Number(element.getAttribute('data-end-y')) },
      markerEnd: element.querySelector('[data-atlas-relation-path]')?.getAttribute('marker-end'),
    })),
  );

  for (const relation of relationGeometry) {
    const from = nodes[relation.fromId ?? ''];
    const to = nodes[relation.toId ?? ''];
    const startOnBoundary =
      Math.abs(relation.start.x - from.left) < 0.001 ||
      Math.abs(relation.start.x - (from.left + from.width)) < 0.001 ||
      Math.abs(relation.start.y - from.top) < 0.001 ||
      Math.abs(relation.start.y - (from.top + from.height)) < 0.001;
    const endOnBoundary =
      Math.abs(relation.end.x - to.left) < 0.001 ||
      Math.abs(relation.end.x - (to.left + to.width)) < 0.001 ||
      Math.abs(relation.end.y - to.top) < 0.001 ||
      Math.abs(relation.end.y - (to.top + to.height)) < 0.001;
    expect(startOnBoundary, `${relation.id} starts under its source node`).toBe(true);
    expect(endOnBoundary, `${relation.id} ends under its target node`).toBe(true);
    expect(relation.start, relation.id ?? '').not.toEqual({ x: from.centerX, y: from.centerY });
    expect(relation.end, relation.id ?? '').not.toEqual({ x: to.centerX, y: to.centerY });
    if (relation.directionality === 'directed') {
      expect(relation.markerEnd, relation.id ?? '').toContain('atlas-direction-arrow');
    } else {
      expect(relation.markerEnd, relation.id ?? '').toBeNull();
    }
  }

  const comparison = network.locator('[data-atlas-relation="super-metroid-and-sotn"]');
  await expect(comparison).toHaveAttribute('data-relation-directionality', 'undirected');
  await expect(comparison.locator('[data-atlas-relation-path]')).not.toHaveAttribute('marker-end', /.+/);
  await expect(comparison.locator('[data-undirected-endpoint]')).toHaveCount(2);
});

test('node and relation details retain source titles, languages and evidence links', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'chromium', 'Detail interactions are tested once.');
  await page.goto('./atlas/');

  await page.locator('[data-atlas-node-id="dead-cells"][data-atlas-node] [data-atlas-node-link]').click();
  const nodeDetail = page.locator('#atlas-node-detail-dead-cells');
  await expect(nodeDetail).toHaveAttribute('open', '');
  await expect(nodeDetail.locator('time').first()).toContainText('2018');
  await expect(nodeDetail.locator('[data-atlas-node-tags]')).toContainText('Roguelike');
  await expect(nodeDetail.locator('[data-atlas-node-relation-ref]')).not.toHaveCount(0);
  await expect(nodeDetail.locator('[data-evidence-source-title]')).not.toHaveCount(0);
  await expect(nodeDetail.locator('[data-evidence-language]')).not.toHaveCount(0);
  await expect(nodeDetail.locator('a[data-atlas-evidence-link]')).not.toHaveCount(0);

  await clickVisibleRelationSegment(page, 'metroid-ii-to-super-metroid');
  await expect(page.locator('#atlas-relation-detail-metroid-ii-to-super-metroid')).toHaveAttribute('open', '');
  const comparisonLink = page.locator('[data-atlas-relation="super-metroid-and-sotn"] [data-atlas-relation-link]');
  await comparisonLink.focus();
  await page.keyboard.press('Enter');
  const relationDetail = page.locator('#atlas-relation-detail-super-metroid-and-sotn');
  await expect(relationDetail).toHaveAttribute('open', '');
  await expect(relationDetail.locator('[data-relation-detail-type]')).toContainText('结构相似');
  await expect(relationDetail.locator('[data-relation-detail-status]')).toContainText('已直接支持');
  await expect(relationDetail.locator('[data-relation-detail-direction]')).toContainText('无向');
  await expect(relationDetail.locator('[data-relation-detail-summary]')).not.toBeEmpty();
  await expect(relationDetail.locator('[data-evidence-source-title]')).not.toHaveCount(0);
  await expect(relationDetail.locator('[data-evidence-public-label]')).not.toHaveCount(0);
  await expect(relationDetail.locator('[data-evidence-language]')).not.toHaveCount(0);
  await expect(relationDetail.locator('a[data-atlas-evidence-link]')).not.toHaveCount(0);
});

test('mobile uses a relation-equivalent era outline without horizontal overflow', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'mobile-chromium', 'Mobile outline is tested once.');
  await page.setViewportSize({ width: 320, height: 760 });
  await page.goto('./atlas/');

  await expect(page.locator('[data-atlas-canvas]')).toBeHidden();
  const outline = page.locator('[data-atlas-mobile-outline]');
  await expect(outline).toBeVisible();
  await expect(outline.locator('[data-atlas-era]')).toHaveCount(5);
  await expect(outline.locator('[data-atlas-outline-node]')).toHaveCount(27);
  const relationIds = await outline.locator('[data-atlas-outline-relation-ref]').evaluateAll((elements) =>
    elements.map((element) => element.getAttribute('data-atlas-outline-relation-ref')),
  );
  expect(new Set(relationIds).size).toBe(25);
  for (const direction of ['incoming', 'outgoing', 'undirected']) {
    await expect(outline.locator(`[data-outline-direction="${direction}"]`)).toHaveCount(27);
  }

  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
  expect(overflow).toBeLessThanOrEqual(0);

  await outline.locator('[data-atlas-outline-node="dead-cells"] summary').click();
  await outline.locator('[data-atlas-outline-node="dead-cells"] [data-atlas-node-detail-link]').click();
  await expect(page.locator('#atlas-node-detail-dead-cells')).toHaveAttribute('open', '');
  await outline.locator('[data-atlas-outline-node="dead-cells"] [data-atlas-outline-relation-ref="spelunky-to-dead-cells"]').click();
  await expect(page.locator('#atlas-relation-detail-spelunky-to-dead-cells')).toHaveAttribute('open', '');
});

test('without JavaScript the complete graph, native details and evidence remain readable', async ({ browser }, testInfo) => {
  test.skip(testInfo.project.name !== 'chromium', 'No-JavaScript rendering is tested once.');
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  await page.goto(atlasUrl);

  for (const button of await page.locator('[data-atlas-theme-button]').all()) {
    await expect(button).toBeDisabled();
  }
  await expect(page.locator('[data-atlas-no-js-note]')).toBeVisible();
  await expect(page.locator('[data-atlas-global-network] [data-atlas-node]')).toHaveCount(27);
  await expect(page.locator('[data-atlas-global-network] [data-atlas-relation]')).toHaveCount(25);
  const detail = page.locator('#atlas-relation-detail-super-metroid-and-sotn');
  await detail.locator('summary').click();
  await expect(detail.locator('[data-evidence-source-title]')).not.toHaveCount(0);
  await expect(detail.locator('a[data-atlas-evidence-link]')).not.toHaveCount(0);

  await context.close();
});
