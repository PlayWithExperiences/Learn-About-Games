import { expect, test, type Locator, type Page } from '@playwright/test';

const atlasUrl = 'http://127.0.0.1:4321/Learn-About-Games/atlas/';

const entityIds = async (locator: Locator) =>
  locator.evaluateAll((elements: Element[]) =>
    elements.map((element) =>
      element.getAttribute('data-atlas-node-id') ?? element.getAttribute('data-atlas-relation'),
    ),
  );

const atlasGraphSnapshot = async (page: Page) => page.evaluate(() => ({
  nodes: Array.from(document.querySelectorAll<HTMLElement>('[data-atlas-node]')).map((node) => ({
    id: node.dataset.atlasNodeId,
    style: node.getAttribute('style'),
    themeMatch: node.dataset.themeMatch,
    searchMatch: node.getAttribute('data-search-match'),
  })),
  relations: Array.from(document.querySelectorAll<SVGGElement>('[data-atlas-relation]')).map((relation) => ({
    id: relation.dataset.atlasRelation,
    path: relation.querySelector('[data-atlas-relation-path]')?.getAttribute('d'),
    themeMatch: relation.dataset.themeMatch,
    searchMatch: relation.getAttribute('data-search-match'),
  })),
  evidenceIds: Array.from(document.querySelectorAll<HTMLElement>('[data-atlas-evidence-row]'))
    .map((row) => row.dataset.atlasEvidenceRow),
}));

const visibleAtlasIndexItemCount = (items: Locator) => items.evaluateAll((elements) =>
  elements.filter((element) => !element.hasAttribute('hidden')).length,
);

function parseRgb(color: string): [number, number, number] {
  const channels = color.match(/[\d.]+/g)?.slice(0, 3).map(Number);
  if (!channels || channels.length !== 3) throw new Error(`Expected an RGB color, received ${color}`);
  return channels as [number, number, number];
}

function relativeLuminance(color: string): number {
  const channels = parseRgb(color).map((channel) => {
    const normalized = channel / 255;
    return normalized <= 0.04045 ? normalized / 12.92 : ((normalized + 0.055) / 1.055) ** 2.4;
  });
  return channels[0] * 0.2126 + channels[1] * 0.7152 + channels[2] * 0.0722;
}

function contrastRatio(foreground: string, background: string): number {
  const lighter = Math.max(relativeLuminance(foreground), relativeLuminance(background));
  const darker = Math.min(relativeLuminance(foreground), relativeLuminance(background));
  return (lighter + 0.05) / (darker + 0.05);
}

function compositeRgb(foreground: string, background: string, opacity: number): string {
  const foregroundChannels = parseRgb(foreground);
  const backgroundChannels = parseRgb(background);
  const channels = foregroundChannels.map((channel, index) =>
    channel * opacity + backgroundChannels[index] * (1 - opacity));
  return `rgb(${channels.join(' ')})`;
}

async function effectiveOpacityContrast(
  element: Locator,
  backdropSelector: string,
  compositeOwnBackground: boolean,
): Promise<number> {
  const styles = await element.evaluate((target, input) => {
    const computed = getComputedStyle(target);
    const backdrop = document.querySelector<HTMLElement>(input.backdropSelector);
    if (!backdrop) throw new Error(`Missing contrast backdrop ${input.backdropSelector}`);
    return {
      color: computed.color,
      background: computed.backgroundColor,
      backdrop: getComputedStyle(backdrop).backgroundColor,
      opacity: Number(computed.opacity),
      compositeOwnBackground: input.compositeOwnBackground,
    };
  }, { backdropSelector, compositeOwnBackground });
  const foreground = compositeRgb(styles.color, styles.backdrop, styles.opacity);
  const background = styles.compositeOwnBackground
    ? compositeRgb(styles.background, styles.backdrop, styles.opacity)
    : styles.backdrop;
  return contrastRatio(foreground, background);
}

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
  await expect(page.locator('[data-atlas-explorer]')).toHaveAttribute('data-atlas-node-count', String(await nodes.count()));
  await expect(page.locator('[data-atlas-explorer]')).toHaveAttribute('data-atlas-relation-count', String(await relations.count()));
  const scrollNote = page.getByText('左右滚动查看 1980–2020', { exact: true });
  if (testInfo.project.name === 'mobile-chromium') {
    await expect(scrollNote).toBeHidden();
  } else {
    await expect(scrollNote).toBeVisible();
  }
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

test('view controls provide bounded zoom, fit, center anchoring, reset and modified-wheel zoom', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'chromium', 'Desktop viewport controls are tested once.');
  await page.goto('./atlas/');

  const controls = page.locator('[data-atlas-view-controls]');
  const fit = controls.getByRole('button', { name: '适应全图' });
  const zoomOut = controls.getByRole('button', { name: '缩小' });
  const zoomIn = controls.getByRole('button', { name: '放大' });
  const reset = controls.getByRole('button', { name: '重置 100%' });
  const status = controls.locator('[data-atlas-scale-status]');
  const viewport = page.locator('[data-atlas-canvas]');
  const stage = page.locator('[data-atlas-stage]');
  const scene = page.locator('[data-atlas-scene]');

  await expect(controls).toBeVisible();
  for (const button of [fit, zoomOut, zoomIn, reset]) await expect(button).toBeEnabled();
  await expect(status).toHaveText('100%');
  await expect(stage).toHaveAttribute('data-scale', '1');
  await expect(stage).toHaveCSS('width', '2200px');
  await expect(stage).toHaveCSS('height', '900px');
  await expect(scene).toHaveCSS('width', '2200px');
  await expect(scene).toHaveCSS('height', '900px');
  expect(await scene.evaluate((element) => element.style.transform)).toBe('scale(1)');

  await zoomIn.click();
  await expect(status).toHaveText('125%');
  await expect(stage).toHaveAttribute('data-scale', '1.25');

  await reset.click();
  await viewport.evaluate((element) => {
    element.scrollLeft = 320;
    element.scrollTop = 140;
  });
  const centerBefore = await viewport.evaluate((element) => ({
    x: (element.scrollLeft + element.clientWidth / 2),
    y: (element.scrollTop + element.clientHeight / 2),
  }));
  await zoomIn.click();
  const centerAfter = await viewport.evaluate((element) => ({
    x: (element.scrollLeft + element.clientWidth / 2) / 1.25,
    y: (element.scrollTop + element.clientHeight / 2) / 1.25,
  }));
  expect(Math.abs(centerAfter.x - centerBefore.x)).toBeLessThanOrEqual(1);
  expect(Math.abs(centerAfter.y - centerBefore.y)).toBeLessThanOrEqual(1);

  await fit.click();
  const fitScale = Number(await stage.getAttribute('data-scale'));
  expect(fitScale).toBeGreaterThanOrEqual(0.5);
  expect(fitScale).toBeLessThanOrEqual(2);
  const fitBounds = await viewport.evaluate((element) => {
    const scene = element.querySelector<HTMLElement>('[data-atlas-scene]')!;
    const viewportRect = element.getBoundingClientRect();
    const sceneRect = scene.getBoundingClientRect();
    return {
      viewport: {
        left: viewportRect.left + element.clientLeft,
        top: viewportRect.top + element.clientTop,
        right: viewportRect.left + element.clientLeft + element.clientWidth,
        bottom: viewportRect.top + element.clientTop + element.clientHeight,
      },
      scene: { left: sceneRect.left, top: sceneRect.top, right: sceneRect.right, bottom: sceneRect.bottom },
    };
  });
  expect(fitBounds.scene.left).toBeGreaterThanOrEqual(fitBounds.viewport.left - 1);
  expect(fitBounds.scene.top).toBeGreaterThanOrEqual(fitBounds.viewport.top - 1);
  expect(fitBounds.scene.right).toBeLessThanOrEqual(fitBounds.viewport.right + 1);
  expect(fitBounds.scene.bottom).toBeLessThanOrEqual(fitBounds.viewport.bottom + 1);

  for (let index = 0; index < 6; index += 1) await zoomIn.click();
  await expect(stage).toHaveAttribute('data-scale', '2');
  await expect(status).toHaveText('200%');
  await expect(zoomIn).toBeDisabled();
  for (let index = 0; index < 6; index += 1) await zoomOut.click();
  await expect(stage).toHaveAttribute('data-scale', '0.5');
  await expect(status).toHaveText('50%');
  await expect(zoomOut).toBeDisabled();

  await reset.click();
  await expect(stage).toHaveAttribute('data-scale', '1');
  await expect(status).toHaveText('100%');
  await expect.poll(() => viewport.evaluate((element) => ({ left: element.scrollLeft, top: element.scrollTop })))
    .toEqual({ left: 0, top: 0 });

  const ordinaryWheel = await viewport.evaluate((element) => {
    const event = new WheelEvent('wheel', { bubbles: true, cancelable: true, deltaY: 100 });
    const dispatched = element.dispatchEvent(event);
    return { defaultPrevented: event.defaultPrevented, dispatched };
  });
  expect(ordinaryWheel).toEqual({ defaultPrevented: false, dispatched: true });
  await expect(stage).toHaveAttribute('data-scale', '1');

  const controlWheel = await viewport.evaluate((element) => {
    const event = new WheelEvent('wheel', { bubbles: true, cancelable: true, ctrlKey: true, deltaY: -100 });
    const dispatched = element.dispatchEvent(event);
    return { defaultPrevented: event.defaultPrevented, dispatched };
  });
  expect(controlWheel).toEqual({ defaultPrevented: true, dispatched: false });
  await expect(stage).toHaveAttribute('data-scale', '1.25');

  await viewport.evaluate((element) => {
    const event = new WheelEvent('wheel', { bubbles: true, cancelable: true, metaKey: true, deltaY: 100 });
    element.dispatchEvent(event);
  });
  await expect(stage).toHaveAttribute('data-scale', '1');
});

test('uses the complete outline until the viewport can honor the 50% minimum scale', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'chromium', 'Responsive Atlas viewport ownership is tested once.');

  for (const width of [800, 1024, 1150]) {
    await page.setViewportSize({ width, height: 800 });
    await page.goto('./atlas/');
    await expect(page.locator('[data-atlas-view-controls]'), `${width}px controls`).toBeHidden();
    await expect(page.locator('[data-atlas-canvas]'), `${width}px canvas`).toBeHidden();
    const outline = page.locator('[data-atlas-mobile-outline]');
    await expect(outline, `${width}px outline`).toBeVisible();
    await expect(outline.locator('[data-atlas-era]')).toHaveCount(5);
    await expect(outline.locator('[data-atlas-outline-node]')).toHaveCount(27);
    expect(new Set(await outline.locator('[data-atlas-outline-relation-ref]').evaluateAll((elements) =>
      elements.map((element) => element.getAttribute('data-atlas-outline-relation-ref')),
    )).size).toBe(25);
    await expect(page.locator('html').evaluate((element) => element.scrollWidth === element.clientWidth)).resolves.toBe(true);
  }

  await page.setViewportSize({ width: 1200, height: 800 });
  await page.goto('./atlas/');
  await expect(page.locator('[data-atlas-view-controls]')).toBeVisible();
  await expect(page.locator('[data-atlas-canvas]')).toBeVisible();
  await expect(page.locator('[data-atlas-mobile-outline]')).toBeHidden();
  await page.getByRole('button', { name: '适应全图' }).click();
  const fit = await page.locator('[data-atlas-canvas]').evaluate((element) => {
    const scene = element.querySelector<HTMLElement>('[data-atlas-scene]')!;
    const viewportRect = element.getBoundingClientRect();
    const sceneRect = scene.getBoundingClientRect();
    return {
      scale: Number(element.querySelector<HTMLElement>('[data-atlas-stage]')?.dataset.scale),
      viewport: {
        left: viewportRect.left + element.clientLeft,
        top: viewportRect.top + element.clientTop,
        right: viewportRect.left + element.clientLeft + element.clientWidth,
        bottom: viewportRect.top + element.clientTop + element.clientHeight,
      },
      scene: { left: sceneRect.left, top: sceneRect.top, right: sceneRect.right, bottom: sceneRect.bottom },
    };
  });
  expect(fit.scale).toBeGreaterThanOrEqual(0.5);
  expect(fit.scene.left).toBeGreaterThanOrEqual(fit.viewport.left - 1);
  expect(fit.scene.top).toBeGreaterThanOrEqual(fit.viewport.top - 1);
  expect(fit.scene.right).toBeLessThanOrEqual(fit.viewport.right + 1);
  expect(fit.scene.bottom).toBeLessThanOrEqual(fit.viewport.bottom + 1);
});

test('ordinary wheel chains vertically to the page while modified wheel only zooms the Atlas', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'chromium', 'Desktop wheel ownership is tested once.');
  await page.setViewportSize({ width: 1200, height: 800 });
  await page.goto('./atlas/');
  await page.getByRole('button', { name: '适应全图' }).click();

  const viewport = page.locator('[data-atlas-canvas]');
  await viewport.scrollIntoViewIfNeeded();
  const box = await viewport.boundingBox();
  expect(box).not.toBeNull();
  expect(await viewport.evaluate((element) => element.scrollHeight <= element.clientHeight + 1)).toBe(true);
  await page.mouse.move(box!.x + box!.width / 2, box!.y + box!.height / 2);
  const pageYBeforeWheel = await page.evaluate(() => window.scrollY);
  await page.mouse.wheel(0, 320);
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBeGreaterThan(pageYBeforeWheel);
  expect(await viewport.evaluate((element) => element.scrollTop)).toBe(0);

  await viewport.scrollIntoViewIfNeeded();
  const zoomBox = await viewport.boundingBox();
  expect(zoomBox).not.toBeNull();
  await page.mouse.move(zoomBox!.x + zoomBox!.width / 2, zoomBox!.y + zoomBox!.height / 2);
  const pageYBeforeZoom = await page.evaluate(() => window.scrollY);
  const scaleBeforeZoom = Number(await page.locator('[data-atlas-stage]').getAttribute('data-scale'));
  await page.keyboard.down('Control');
  await page.mouse.wheel(0, -120);
  await page.keyboard.up('Control');
  await expect.poll(async () => Number(await page.locator('[data-atlas-stage]').getAttribute('data-scale')))
    .toBeGreaterThan(scaleBeforeZoom);
  expect(await page.evaluate(() => window.scrollY)).toBe(pageYBeforeZoom);
});

test('fit follows viewport resizing until manual zoom or reset takes ownership', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'chromium', 'Fit resize ownership is tested once.');
  await page.setViewportSize({ width: 1200, height: 800 });
  await page.goto('./atlas/');
  const stage = page.locator('[data-atlas-stage]');
  await page.getByRole('button', { name: '适应全图' }).click();
  const initialFit = Number(await stage.getAttribute('data-scale'));

  await page.setViewportSize({ width: 1440, height: 900 });
  await expect.poll(async () => Number(await stage.getAttribute('data-scale'))).toBeGreaterThan(initialFit);

  await page.getByRole('button', { name: '放大' }).click();
  const manualScale = Number(await stage.getAttribute('data-scale'));
  await page.setViewportSize({ width: 1300, height: 820 });
  await expect.poll(async () => Number(await stage.getAttribute('data-scale'))).toBe(manualScale);

  await page.getByRole('button', { name: '重置 100%' }).click();
  await page.setViewportSize({ width: 1200, height: 800 });
  await expect.poll(async () => Number(await stage.getAttribute('data-scale'))).toBe(1);
});

test('lost pointer capture clears drag state without waiting for pointerup', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'chromium', 'Pointer capture cleanup is tested once.');
  await page.setViewportSize({ width: 1200, height: 800 });
  await page.goto('./atlas/');
  const viewport = page.locator('[data-atlas-canvas]');
  await viewport.scrollIntoViewIfNeeded();
  const box = await viewport.boundingBox();
  expect(box).not.toBeNull();
  await page.mouse.move(box!.x + 28, box!.y + 38);
  await page.mouse.down();
  await expect(viewport).toHaveAttribute('data-dragging', 'true');
  await viewport.dispatchEvent('lostpointercapture', { pointerId: 1 });
  await expect(viewport).not.toHaveAttribute('data-dragging', 'true');
  await page.mouse.up();
});

test('pan inputs preserve graph identity, interactive targets and dialog return positions', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'chromium', 'Desktop pan and detail flow are tested once.');
  await page.goto('./atlas/');
  await page.locator('[data-atlas-theme-button="metroidvania"]').click();

  const controls = page.locator('[data-atlas-view-controls]');
  const viewport = page.locator('[data-atlas-canvas]');
  await controls.getByRole('button', { name: '放大' }).click();
  await controls.getByRole('button', { name: '放大' }).click();
  await viewport.evaluate((element) => {
    element.scrollLeft = 180;
    element.scrollTop = 120;
  });
  const graphBefore = await atlasGraphSnapshot(page);
  expect(graphBefore.nodes).toHaveLength(27);
  expect(graphBefore.relations).toHaveLength(25);
  expect(graphBefore.evidenceIds).toHaveLength(40);
  expect(graphBefore.nodes.every(({ searchMatch }) => searchMatch === null)).toBe(true);

  await viewport.focus();
  const keyboardStart = await viewport.evaluate((element) => ({ left: element.scrollLeft, top: element.scrollTop }));
  await page.keyboard.press('ArrowRight');
  await page.keyboard.press('ArrowDown');
  await expect.poll(() => viewport.evaluate((element) => ({ left: element.scrollLeft, top: element.scrollTop })))
    .toEqual({ left: keyboardStart.left + 80, top: keyboardStart.top + 80 });

  await viewport.scrollIntoViewIfNeeded();
  const viewportBox = await viewport.boundingBox();
  expect(viewportBox).not.toBeNull();
  const dragStart = await viewport.evaluate((element) => ({ left: element.scrollLeft, top: element.scrollTop }));
  await page.mouse.move(viewportBox!.x + 32, viewportBox!.y + 42);
  await page.mouse.down();
  await page.mouse.move(viewportBox!.x - 28, viewportBox!.y + 2, { steps: 4 });
  await page.mouse.up();
  await expect.poll(() => viewport.evaluate((element) => ({ left: element.scrollLeft, top: element.scrollTop })))
    .toEqual({ left: dragStart.left + 60, top: dragStart.top + 40 });

  const nodeLink = page.locator('[data-atlas-node-id="dead-cells"] [data-atlas-node-link]');
  await nodeLink.scrollIntoViewIfNeeded();
  const beforeInteractiveDrag = await viewport.evaluate((element) => ({ left: element.scrollLeft, top: element.scrollTop }));
  await nodeLink.dispatchEvent('pointerdown', { bubbles: true, button: 0, clientX: 400, clientY: 300, pointerId: 1 });
  await nodeLink.dispatchEvent('pointermove', { bubbles: true, buttons: 1, clientX: 330, clientY: 230, pointerId: 1 });
  await nodeLink.dispatchEvent('pointerup', { bubbles: true, button: 0, clientX: 330, clientY: 230, pointerId: 1 });
  expect(await viewport.evaluate((element) => ({ left: element.scrollLeft, top: element.scrollTop }))).toEqual(beforeInteractiveDrag);

  await nodeLink.click();
  const dialog = page.locator('dialog[data-atlas-selected-detail]');
  await expect(dialog).toBeVisible();
  await expect(dialog.locator('[data-atlas-dialog-title]')).toContainText('Dead Cells');
  await dialog.getByRole('button', { name: '返回网络' }).click();
  await expect(dialog).not.toBeVisible();
  await expect(nodeLink).toBeFocused();
  await expect.poll(() => viewport.evaluate((element) => ({ left: element.scrollLeft, top: element.scrollTop })))
    .toEqual(beforeInteractiveDrag);

  expect(await atlasGraphSnapshot(page)).toEqual(graphBefore);
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

test('non-matching desktop edges keep neutral direction semantics and 3:1 contrast in light and dark', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'chromium', 'Desktop edge styling is tested once.');

  for (const appearance of ['light', 'dark']) {
    await page.goto('./atlas/');
    await page.getByLabel('Appearance').selectOption(appearance);
    await page.locator('[data-atlas-theme-button="metroidvania"]').click();

    const directed = page.locator('[data-atlas-relation="rogue-to-hack"]');
    const directedPath = directed.locator('[data-atlas-relation-path]');
    await expect(directed).toHaveAttribute('data-theme-match', 'false');
    const directedStyle = await directedPath.evaluate((element) => ({
      stroke: getComputedStyle(element).stroke,
      dash: getComputedStyle(element).strokeDasharray,
      background: getComputedStyle(document.querySelector('[data-atlas-canvas]')!).backgroundColor,
      markerFill: getComputedStyle(document.querySelector('#atlas-direction-arrow path')!).fill,
    }));
    expect(contrastRatio(directedStyle.stroke, directedStyle.background), appearance).toBeGreaterThanOrEqual(3);
    expect(directedStyle.dash).not.toBe('none');
    expect(directedStyle.markerFill).toBe('context-stroke');

    await page.locator('[data-atlas-theme-button="roguelike"]').click();
    const undirected = page.locator('[data-atlas-relation="super-metroid-and-sotn"]');
    const undirectedStyle = await undirected.evaluate((element) => ({
      stroke: getComputedStyle(element.querySelector('[data-atlas-relation-path]')!).stroke,
      endpointFills: Array.from(element.querySelectorAll('[data-undirected-endpoint]')).map(
        (endpoint) => getComputedStyle(endpoint).fill,
      ),
    }));
    await expect(undirected).toHaveAttribute('data-theme-match', 'false');
    expect(new Set(undirectedStyle.endpointFills)).toEqual(new Set([undirectedStyle.stroke]));
  }
});

test('mobile relation references participate in theme emphasis with readable non-color styling', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'mobile-chromium', 'Mobile relation emphasis is tested once.');
  await page.setViewportSize({ width: 320, height: 760 });

  for (const appearance of ['light', 'dark']) {
    await page.goto('./atlas/');
    await page.getByLabel('Appearance').selectOption(appearance);
    await page.locator('[data-atlas-theme-button="metroidvania"]').click();
    const relationRef = page.locator('[data-atlas-outline-relation-ref="rogue-to-hack"]').first();
    await expect(relationRef).toHaveAttribute('data-theme-tags', /\S+/);
    await expect(relationRef).toHaveAttribute('data-theme-match', 'false');
    const styles = await relationRef.evaluate((element) => ({
      color: getComputedStyle(element).color,
      background: getComputedStyle(document.body).backgroundColor,
      decoration: getComputedStyle(element).textDecorationStyle,
    }));
    expect(contrastRatio(styles.color, styles.background), appearance).toBeGreaterThanOrEqual(3);
    expect(styles.decoration).toBe('dashed');
  }
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
  await expect(network.locator('[data-atlas-relation="rogue-to-hack"] [data-atlas-relation-link]')).toHaveAttribute('aria-label', /→/);
  await expect(comparison.locator('[data-atlas-relation-link]')).toHaveAttribute('aria-label', /↔/);
  await expect(page.locator('[data-atlas-outline-relation-ref="rogue-to-hack"]').first()).toHaveAttribute('aria-label', /→/);
  await expect(page.locator('[data-atlas-outline-relation-ref="super-metroid-and-sotn"]').first()).toHaveAttribute('aria-label', /↔/);
});

test('selected detail dialog preserves the network position and returns focus to its origin', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'chromium', 'Desktop detail flow is tested once.');
  await page.goto('./atlas/');

  const nodeLink = page.locator('[data-atlas-node-id="dead-cells"][data-atlas-node] [data-atlas-node-link]');
  await nodeLink.scrollIntoViewIfNeeded();
  const before = await page.evaluate(() => ({
    pageX: window.scrollX,
    pageY: window.scrollY,
    canvasX: document.querySelector<HTMLElement>('[data-atlas-canvas]')?.scrollLeft ?? 0,
  }));
  await nodeLink.click();

  const dialog = page.locator('dialog[data-atlas-selected-detail]');
  await expect(dialog).toBeVisible();
  await expect(dialog.getByText('当前选择', { exact: true })).toBeVisible();
  await expect(dialog.locator('[data-atlas-dialog-title]')).toContainText('Dead Cells');
  await expect(dialog.locator('[data-atlas-node-tags]')).toContainText('Roguelike');
  await expect(dialog.locator('[data-atlas-evidence-ref]')).not.toHaveCount(0);
  await expect(page.locator('#atlas-node-detail-dead-cells')).not.toHaveAttribute('open', '');

  const evidenceTarget = await dialog.locator('[data-atlas-evidence-ref]').first().getAttribute('href');
  await dialog.locator('[data-atlas-evidence-ref]').first().click();
  await expect(dialog).not.toBeVisible();
  await expect(page.locator(evidenceTarget!)).toBeVisible();
  await expect(page.locator(evidenceTarget!)).toBeFocused();
  const returnFromEvidence = page.locator(`${evidenceTarget} [data-atlas-evidence-return]`);
  await expect(returnFromEvidence).toBeVisible();
  await returnFromEvidence.click();
  const after = await page.evaluate(() => ({
    pageX: window.scrollX,
    pageY: window.scrollY,
    canvasX: document.querySelector<HTMLElement>('[data-atlas-canvas]')?.scrollLeft ?? 0,
  }));
  expect(after.pageX).toBe(before.pageX);
  expect(after.canvasX).toBe(before.canvasX);
  expect(Math.abs(after.pageY - before.pageY)).toBeLessThanOrEqual(4);
  await expect(nodeLink).toBeFocused();

  await nodeLink.click();
  await expect(dialog).toBeVisible();
  await dialog.getByRole('button', { name: '返回网络' }).click();
  await expect(dialog).not.toBeVisible();
  await expect(nodeLink).toBeFocused();

  await clickVisibleRelationSegment(page, 'super-metroid-and-sotn');
  await expect(dialog).toBeVisible();
  await expect(dialog.locator('[data-atlas-dialog-title]')).toContainText('Super Metroid');
  await expect(dialog.locator('[data-relation-detail-type]')).toContainText('结构相似');
  await expect(dialog.locator('[data-relation-detail-status]')).toContainText('已直接支持');
  await expect(dialog.locator('[data-relation-detail-direction]')).toContainText('无向');
  await expect(dialog.locator('[data-relation-detail-summary]')).not.toBeEmpty();
});

test('renders one 40-item Evidence index and keeps node and relation references reachable', async ({ page }) => {
  await page.goto('./atlas/');

  const index = page.locator('[data-atlas-evidence-index]');
  const rows = index.locator('[data-atlas-evidence-row]');
  await expect(rows).toHaveCount(40);
  await expect(index.locator('a[data-atlas-evidence-link]')).toHaveCount(40);
  const evidenceIds = await rows.evaluateAll((elements) => elements.map((element) => element.id));
  expect(new Set(evidenceIds).size).toBe(40);
  expect(evidenceIds.every((id) => id.startsWith('atlas-evidence-'))).toBe(true);
  await expect(page.locator('[data-atlas-evidence-row]')).toHaveCount(40);

  for (const detailSelector of ['#atlas-node-detail-dead-cells', '#atlas-relation-detail-super-metroid-and-sotn']) {
    const refs = page.locator(`${detailSelector} [data-atlas-evidence-ref]`);
    await expect(refs).not.toHaveCount(0);
    await expect(page.locator(`${detailSelector} a[data-atlas-evidence-link]`)).toHaveCount(0);
    const target = await refs.first().getAttribute('href');
    expect(target).toMatch(/^#atlas-evidence-/);
    await expect(page.locator(target!)).toHaveCount(1);
  }
});

test('node index searches bilingual metadata, sorts locally and preserves the fixed graph', async ({ page }) => {
  await page.goto('./atlas/');

  const index = page.locator('[data-atlas-node-index]');
  const search = index.getByRole('searchbox', { name: '搜索节点' });
  const sort = index.getByLabel('节点排序');
  const clear = index.getByRole('button', { name: '清除搜索' });
  const items = index.locator('[data-atlas-index-item]');
  const graphBefore = await atlasGraphSnapshot(page);

  await expect(search).toBeEnabled();
  await expect(sort).toHaveValue('time');
  await expect(items).toHaveCount(27);
  await expect(index.locator('[data-atlas-node-empty]')).toBeHidden();
  await expect(clear).toBeDisabled();

  const serverYears = await items.evaluateAll((elements) =>
    elements.map((element) => Number(element.getAttribute('data-index-year'))),
  );
  expect(serverYears).toEqual([...serverYears].sort((left, right) => left - right));

  await search.fill('恶魔城');
  await expect.poll(() => visibleAtlasIndexItemCount(items)).toBe(4);
  await expect(index.locator('output[data-atlas-node-count]')).toHaveText('4 个节点');
  await expect(page.locator('[data-atlas-node][data-search-match="true"]')).toHaveCount(4);

  await search.fill('ＭＥＴＲＯＩＤＶＡＮＩＡ');
  await expect.poll(() => visibleAtlasIndexItemCount(items)).toBe(18);
  await expect(index.locator('output[data-atlas-node-count]')).toHaveText('18 个节点');
  await expect(page.locator('[data-atlas-outline-node][data-search-match="true"]')).toHaveCount(18);

  await search.fill('单局永久死亡');
  await expect.poll(() => visibleAtlasIndexItemCount(items)).toBe(6);
  await expect(index.locator('output[data-atlas-node-count]')).toHaveText('6 个节点');

  await search.fill('法定系列续作');
  await expect.poll(() => visibleAtlasIndexItemCount(items)).toBe(1);
  await expect(page.locator('[data-atlas-node][data-search-match="true"]')).toHaveCount(1);
  await expect(page.locator('[data-atlas-outline-node="bloodstained-ritual-of-the-night"]')).toHaveAttribute('data-search-match', 'true');
  await expect(clear).toBeEnabled();
  const graphAfterSearch = await atlasGraphSnapshot(page);
  expect({
    nodes: graphAfterSearch.nodes.map(({ id, style }) => ({ id, style })),
    relations: graphAfterSearch.relations,
    evidenceIds: graphAfterSearch.evidenceIds,
  }).toEqual({
    nodes: graphBefore.nodes.map(({ id, style }) => ({ id, style })),
    relations: graphBefore.relations,
    evidenceIds: graphBefore.evidenceIds,
  });

  await page.locator('[data-atlas-theme-button="metroidvania"]').click();
  await expect(page.locator('[data-atlas-node][data-atlas-node-id="bloodstained-ritual-of-the-night"]'))
    .toHaveAttribute('data-theme-match', 'true');
  await expect(page.locator('[data-atlas-node][data-atlas-node-id="bloodstained-ritual-of-the-night"]'))
    .toHaveAttribute('data-search-match', 'true');

  await search.fill('单局永久死亡');
  await expect(page.locator('[data-atlas-node][data-atlas-node-id="rogue"]')).toHaveAttribute('data-search-match', 'true');
  await search.fill('METROIDVANIA');
  await expect.poll(() => visibleAtlasIndexItemCount(items)).toBeGreaterThan(0);
  await search.fill('no matching atlas node');
  await expect.poll(() => visibleAtlasIndexItemCount(items)).toBe(0);
  await expect(index.locator('[data-atlas-node-empty]')).toBeVisible();

  await clear.click();
  await expect.poll(() => visibleAtlasIndexItemCount(items)).toBe(27);
  await expect(index.locator('[data-atlas-node-empty]')).toBeHidden();
  await expect(clear).toBeDisabled();
  await expect(page.locator('[data-atlas-node][data-search-match]')).toHaveCount(0);
  await expect(page.locator('[data-atlas-theme-button="metroidvania"]')).toHaveAttribute('aria-pressed', 'true');
  await expect(page.locator('[data-atlas-node][data-atlas-node-id="rogue"]')).toHaveAttribute('data-theme-match', 'false');

  await sort.selectOption('name');
  const nameOrder = await items.evaluateAll((elements) =>
    elements.map((element) => element.getAttribute('data-index-name') ?? ''),
  );
  expect(nameOrder).toEqual([...nameOrder].sort(new Intl.Collator(['zh-CN', 'en'], {
    numeric: true,
    sensitivity: 'base',
  }).compare));
  const graphAfterSort = await atlasGraphSnapshot(page);
  expect({
    nodes: graphAfterSort.nodes.map(({ id, style }) => ({ id, style })),
    relations: graphAfterSort.relations.map(({ id, path }) => ({ id, path })),
    evidenceIds: graphAfterSort.evidenceIds,
  }).toEqual({
    nodes: graphBefore.nodes.map(({ id, style }) => ({ id, style })),
    relations: graphBefore.relations.map(({ id, path }) => ({ id, path })),
    evidenceIds: graphBefore.evidenceIds,
  });
});

test('search and theme emphasis keep context text readable in both themes and representations', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'chromium', 'The desktop project checks both responsive representations.');

  for (const colorScheme of ['light', 'dark'] as const) {
    await page.emulateMedia({ colorScheme });
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('./atlas/');
    await page.locator('[data-atlas-node-search]').fill('法定系列续作');
    await page.locator('[data-atlas-theme-button="metroidvania"]').click();

    const desktopContext = page.locator('[data-atlas-node-id="rogue"]');
    await expect(desktopContext).toHaveAttribute('data-theme-match', 'false');
    await expect(desktopContext).toHaveAttribute('data-search-match', 'false');
    const desktopContrast = await effectiveOpacityContrast(
      desktopContext.locator('a'),
      '[data-atlas-canvas]',
      true,
    );
    expect.soft(desktopContrast, `${colorScheme} desktop context contrast`).toBeGreaterThanOrEqual(4.5);

    await page.setViewportSize({ width: 320, height: 760 });
    const outlineContext = page.locator('[data-atlas-outline-node="rogue"]');
    await expect(outlineContext).toHaveAttribute('data-theme-match', 'false');
    await expect(outlineContext).toHaveAttribute('data-search-match', 'false');
    const outlineContrast = await effectiveOpacityContrast(
      outlineContext.locator('> header'),
      'body',
      false,
    );
    expect.soft(outlineContrast, `${colorScheme} mobile context contrast`).toBeGreaterThanOrEqual(4.5);
  }
});

test('mobile uses a relation-equivalent era outline without horizontal overflow', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'mobile-chromium', 'Mobile outline is tested once.');
  await page.setViewportSize({ width: 320, height: 760 });
  await page.goto('./atlas/');

  await expect(page.locator('[data-atlas-canvas]')).toBeHidden();
  await expect(page.locator('[data-atlas-view-controls]')).toHaveCount(1);
  await expect(page.locator('[data-atlas-view-controls]')).toBeHidden();
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
  const dialog = page.locator('dialog[data-atlas-selected-detail]');
  await expect(dialog).toBeVisible();
  await expect(dialog.locator('[data-atlas-dialog-title]')).toContainText('Dead Cells');
  await dialog.getByRole('button', { name: '返回网络' }).click();
  await outline.locator('[data-atlas-outline-node="dead-cells"] [data-atlas-outline-relation-ref="spelunky-to-dead-cells"]').click();
  await expect(dialog).toBeVisible();
  await expect(dialog.locator('[data-atlas-dialog-title]')).toContainText('Spelunky');
});

test('without JavaScript the complete graph, native details and evidence remain readable', async ({ browser }, testInfo) => {
  test.skip(testInfo.project.name !== 'chromium', 'No-JavaScript rendering is tested once.');
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  await page.goto(atlasUrl);

  for (const button of await page.locator('[data-atlas-theme-button]').all()) {
    await expect(button).toBeDisabled();
  }
  const viewControls = page.locator('[data-atlas-view-controls]');
  await expect(viewControls).toBeVisible();
  for (const button of await viewControls.getByRole('button').all()) {
    await expect(button).toBeDisabled();
  }
  await expect(viewControls.locator('[data-atlas-scale-status]')).toHaveText('100%');
  await expect(page.locator('[data-atlas-view-no-js-note]')).toBeVisible();
  await expect(page.locator('[data-atlas-no-js-note]')).toBeVisible();
  await expect(page.locator('[data-atlas-stage]')).toHaveAttribute('data-scale', '1');
  await expect(page.locator('[data-atlas-scene]')).toBeVisible();
  await expect(page.locator('[data-atlas-global-network] [data-atlas-node]')).toHaveCount(27);
  await expect(page.locator('[data-atlas-global-network] [data-atlas-relation]')).toHaveCount(25);
  const nodeIndex = page.locator('[data-atlas-node-index]');
  await expect(nodeIndex.locator('[data-atlas-index-item]')).toHaveCount(27);
  await expect(nodeIndex.getByRole('searchbox', { name: '搜索节点' })).toBeDisabled();
  await expect(nodeIndex.getByLabel('节点排序')).toBeDisabled();
  await expect(nodeIndex.getByRole('button', { name: '清除搜索' })).toBeDisabled();
  await expect(nodeIndex.locator('[data-atlas-node-index-no-js-note]'))
    .toHaveText('启用 JavaScript 后可以搜索、排序和清除搜索；完整节点索引仍按时间列出。');
  await expect(nodeIndex.locator('[data-atlas-node-index-no-js-note]')).toBeVisible();
  const detail = page.locator('#atlas-relation-detail-super-metroid-and-sotn');
  await detail.locator('summary').click();
  const evidenceRef = detail.locator('[data-atlas-evidence-ref]').first();
  await expect(evidenceRef).toBeVisible();
  const evidenceTarget = await evidenceRef.getAttribute('href');
  await evidenceRef.click();
  await expect(page.locator(evidenceTarget!)).toBeVisible();
  await expect(page.locator(`${evidenceTarget} a[data-atlas-evidence-link]`)).toBeVisible();

  await context.close();
});

test('320px no-JavaScript hides view controls and keeps the complete period outline readable', async ({ browser }, testInfo) => {
  test.skip(testInfo.project.name !== 'mobile-chromium', 'The mobile no-JavaScript viewport fallback is tested once.');
  const context = await browser.newContext({
    javaScriptEnabled: false,
    viewport: { width: 320, height: 760 },
  });
  const page = await context.newPage();
  await page.goto(atlasUrl);

  const controls = page.locator('[data-atlas-view-controls]');
  await expect(controls).toHaveCount(1);
  await expect(controls).toBeHidden();
  for (const button of await controls.getByRole('button').all()) await expect(button).toBeDisabled();
  await expect(page.locator('[data-atlas-canvas]')).toBeHidden();
  const nodeIndex = page.locator('[data-atlas-node-index]');
  await expect(nodeIndex.locator('[data-atlas-index-item]')).toHaveCount(27);
  await expect(nodeIndex.getByRole('searchbox', { name: '搜索节点' })).toBeDisabled();
  await expect(nodeIndex.getByLabel('节点排序')).toBeDisabled();
  await expect(nodeIndex.getByRole('button', { name: '清除搜索' })).toBeDisabled();
  await expect(nodeIndex.locator('[data-atlas-node-index-no-js-note]')).toBeVisible();
  const outline = page.locator('[data-atlas-mobile-outline]');
  await expect(outline).toBeVisible();
  await expect(outline.locator('[data-atlas-era]')).toHaveCount(5);
  await expect(outline.locator('[data-atlas-outline-node]')).toHaveCount(27);
  expect(new Set(await outline.locator('[data-atlas-outline-relation-ref]').evaluateAll((elements) =>
    elements.map((element) => element.getAttribute('data-atlas-outline-relation-ref')),
  )).size).toBe(25);
  await expect(page.locator('html').evaluate((element) => element.scrollWidth === element.clientWidth)).resolves.toBe(true);

  await context.close();
});
