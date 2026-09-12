import { expect, test, type Locator, type Page } from '@playwright/test';

const atlasUrl = 'http://127.0.0.1:4321/Learn-About-Games/atlas/network/';
import atlasNodesData from '../../src/data/atlas-nodes.json' with { type: 'json' };
import atlasRelationsData from '../../src/data/atlas-relations.json' with { type: 'json' };
import atlasEvidenceData from '../../src/data/atlas-evidence.json' with { type: 'json' };
import atlasThemesData from '../../src/data/atlas-themes.json' with { type: 'json' };
const ATLAS_NODE_COUNT = atlasNodesData.length;
const ATLAS_RELATION_COUNT = atlasRelationsData.length;
const ATLAS_EVENT_COUNT = atlasNodesData.filter(n => n.kind === 'innovation').length;
const ATLAS_EVENT_PRIMARY_NODE_COUNT = ATLAS_EVENT_COUNT;
const ATLAS_CATEGORY_PRIMARY_NODE_COUNT = ATLAS_EVENT_COUNT + atlasNodesData.filter(n => n.kind === 'category').length;
const ATLAS_WORK_PRIMARY_NODE_COUNT = ATLAS_NODE_COUNT - ATLAS_CATEGORY_PRIMARY_NODE_COUNT;
const primaryKinds = { works: new Set(['game','experimental-apparatus','experimental-program','system-prototype','commercial-hardware']), category: new Set(['category','innovation']), events: new Set(['innovation']) };
const ATLAS_PRIMARY_RELATION_COUNTS = Object.fromEntries(Object.entries(primaryKinds).map(([key,kinds]) => [key, atlasRelationsData.filter(r => kinds.has(atlasNodesData.find(n => n.id === r.fromId)!.kind) && kinds.has(atlasNodesData.find(n => n.id === r.toId)!.kind)).length])) as Record<'works'|'category'|'events',number>;
const ATLAS_EVOLUTION_RELATION_COUNT = atlasRelationsData.filter(r => r.relationRole === 'evolution').length;
const ATLAS_EVIDENCE_COUNT = atlasEvidenceData.length;
const familyAssignments = atlasThemesData.filter(t => t.id !== 'early-electronic-games').reduce((sum,t) => sum + t.familyIds.length,0);
const ATLAS_THEME_BUTTON_COUNT = 3 + atlasThemesData.length + familyAssignments;
const ATLAS_THEME_ID_COUNT = atlasThemesData.length + 1;
const ATLAS_SCOPE_NOTE_COUNT = familyAssignments + 1;

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

async function openAtlasFamily(page: Page, familyId: string) {
  const details = page.locator(`[data-atlas-family="${familyId}"]`);
  if (await details.getAttribute('open') === null) await details.locator('summary').click();
}

const visibleThemeButton = (page: Page, themeId: string) =>
  page.locator(`[data-atlas-theme-button="${themeId}"]:visible`).first();

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
  await page.getByRole('link', { name: '打开精确年份坐标与完整证据网络' }).click();
  await expect(page.getByText('创新事件与承载作品时间网络', { exact: false })).toBeVisible();
});

test('server renders one fixed global event-and-carrier time network', async ({ page }, testInfo) => {
  await page.goto('./atlas/network/');

  const network = page.locator('[data-atlas-global-network]');
  const nodes = network.locator('[data-atlas-node]');
  const relations = network.locator('[data-atlas-relation]');
  await expect(network).toHaveCount(1);
  await expect(nodes).toHaveCount(ATLAS_NODE_COUNT);
  await expect(relations).toHaveCount(ATLAS_RELATION_COUNT);
  await expect(page.locator('[data-atlas-explorer]')).toHaveAttribute('data-atlas-node-count', String(await nodes.count()));
  await expect(page.locator('[data-atlas-explorer]')).toHaveAttribute('data-atlas-relation-count', String(await relations.count()));
  const scrollNote = page.getByText('左右滚动查看 1958–2030', { exact: true });
  if (testInfo.project.name === 'mobile-chromium') {
    await expect(scrollNote).toBeHidden();
  } else {
    await expect(scrollNote).toBeVisible();
  }
  expect(new Set(await entityIds(nodes)).size).toBe(ATLAS_NODE_COUNT);
  expect(new Set(await entityIds(relations)).size).toBe(ATLAS_RELATION_COUNT);
  await expect(network.locator('[data-atlas-node][data-atlas-node-kind="game"]')).toHaveCount(atlasNodesData.filter(n => n.kind === 'game').length);
  await expect(network.locator('[data-atlas-node][data-atlas-node-kind="innovation"]')).toHaveCount(ATLAS_EVENT_COUNT);
  await expect(network.locator('[data-atlas-node][data-atlas-node-kind="category"]')).toHaveCount(2);
  await expect(network.locator('[data-atlas-node][data-atlas-node-kind="experimental-apparatus"]')).toHaveCount(1);
  await expect(network.locator('[data-atlas-node][data-atlas-node-kind="experimental-program"]')).toHaveCount(1);
  await expect(network.locator('[data-atlas-node][data-atlas-node-kind="system-prototype"]')).toHaveCount(1);
  await expect(network.locator('[data-atlas-node][data-atlas-node-kind="commercial-hardware"]')).toHaveCount(5);

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

test('renders innovation events as first-class details and preserves them in theme emphasis', async ({ page }, testInfo) => {
  await page.goto('./atlas/network/');

  await expect(page.locator('[data-atlas-event-index]')).toHaveCount(1);
  await expect(page.locator('[data-atlas-event-index] article')).toHaveCount(0);
  await expect(page.locator('[data-atlas-event-navigator]')).not.toHaveAttribute('open', '');
  await expect(page.locator('[data-atlas-primary-network] [data-atlas-event-node]')).toHaveCount(ATLAS_EVENT_COUNT);
  await expect(page.locator('[data-atlas-primary-network] [data-atlas-event-relation]')).toHaveCount(ATLAS_EVOLUTION_RELATION_COUNT);
  const eventList = page.locator('[data-atlas-event-timeline]');
  await page.locator('[data-atlas-event-navigator] summary').click();
  await expect(eventList).toBeVisible();
  await expect(eventList.locator('[data-atlas-event-timeline-item]')).toHaveCount(ATLAS_EVENT_COUNT);
  await expect(page.locator('[data-atlas-event-timeline-item="lock-on-targeting-combat"]')).toContainText('锁定目标的空间战斗');
  const event = page.locator('[data-atlas-node][data-atlas-event="first-person-shooter-perspective"]');
  await expect(event).toHaveCount(1);
  await expect(event).toHaveAttribute('data-atlas-node-kind', 'innovation');
  await expect(page.locator('[data-atlas-event-detail]').filter({ hasText: '承载作品' })).toHaveCount(ATLAS_EVENT_COUNT);

  const shooterFamily = page.locator('[data-atlas-family="shooter"]');
  await shooterFamily.locator('summary').click();
  const themeButton = shooterFamily.locator('[data-atlas-theme-button="first-person-shooter-lineage"]:visible').first();
  await themeButton.click();
  await expect(event).toHaveAttribute('data-theme-match', 'true');
  const primaryNetwork = page.locator('[data-atlas-primary-network]');
  if (testInfo.project.name === 'mobile-chromium') {
    await expect(primaryNetwork).toBeVisible();
    await expect(page.locator('[data-atlas-canvas]')).toBeHidden();
    await expect(page.locator('[data-atlas-mobile-outline] [data-atlas-outline-node]')).toHaveCount(ATLAS_NODE_COUNT);
  } else {
    await expect(primaryNetwork).toBeVisible();
    await expect(primaryNetwork.locator('[data-atlas-node]:visible')).toHaveCount(ATLAS_NODE_COUNT);
  }
  await expect(primaryNetwork.locator('[data-atlas-relation]')).toHaveCount(ATLAS_RELATION_COUNT);
  const crossFamilyRelation = primaryNetwork.locator('[data-atlas-relation="spelunky-to-dead-cells"]');
  await expect(crossFamilyRelation).toBeAttached();
  await expect(crossFamilyRelation).toHaveAttribute('data-theme-match', 'false');
  if (testInfo.project.name === 'mobile-chromium') {
    await expect(page.locator('[data-atlas-mobile-outline] [data-atlas-outline-relation-ref="spelunky-to-dead-cells"]')).toHaveCount(2);
  }
  await expect(page.locator('[data-atlas-event-timeline-item]:not([hidden])')).toHaveCount(atlasNodesData.filter(n => n.kind === 'innovation' && n.tags.includes('first-person-shooter-lens')).length);
});

test('view controls provide bounded zoom, fit, center anchoring, reset and map-mode wheel zoom', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'chromium', 'Desktop viewport controls are tested once.');
  await page.goto('./atlas/network/');

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
  const nativeWidth = Number(await scene.getAttribute('data-scene-width'));
  expect(nativeWidth).toBeGreaterThan(2200);
  expect(await stage.evaluate(el => parseFloat(getComputedStyle(el).width))).toBeCloseTo(nativeWidth, 1);
  const workSceneHeight = await scene.getAttribute('data-scene-work-height');
  expect(workSceneHeight).toBeTruthy();
  await expect(stage).toHaveCSS('height', `${workSceneHeight}px`);
  expect(await scene.evaluate(el => parseFloat(getComputedStyle(el).width))).toBeCloseTo(nativeWidth, 1);
  await expect(scene).toHaveCSS('height', `${workSceneHeight}px`);
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
  expect(fitScale).toBeGreaterThan(0);
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

  for (let index = 0; index < 7; index += 1) await zoomIn.click();
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

  await page.locator('[data-atlas-map-mode]').click();
  const controlWheel = await viewport.evaluate((element) => {
    const event = new WheelEvent('wheel', { bubbles: true, cancelable: true, deltaY: -100, clientX: 120, clientY: 90 });
    const dispatched = element.dispatchEvent(event);
    return { defaultPrevented: event.defaultPrevented, dispatched };
  });
  expect(controlWheel).toEqual({ defaultPrevented: true, dispatched: false });
  await expect.poll(async () => Number(await stage.getAttribute('data-scale'))).toBeGreaterThan(1);

  await viewport.evaluate((element) => {
    const event = new WheelEvent('wheel', { bubbles: true, cancelable: true, deltaY: 100, clientX: 120, clientY: 90 });
    element.dispatchEvent(event);
  });
  await expect.poll(async () => Number(await stage.getAttribute('data-scale'))).toBeCloseTo(1, 6);
});

test('keeps Atlas desktop controls independent from the wider EGDS map breakpoint', async ({ page }) => {
  for (const width of [320, 1150]) {
    await page.setViewportSize({ width, height: 800 });
    await page.goto('./atlas/network/');
    await expect(page.locator('[data-atlas-view-controls]'), `${width}px controls`).toBeHidden();
    await expect(page.locator('[data-atlas-canvas]'), `${width}px canvas`).toBeHidden();
    await expect(page.locator('[data-atlas-scroll-note]'), `${width}px scroll note`).toBeHidden();
    const outline = page.locator('[data-atlas-mobile-outline]');
    await expect(outline, `${width}px outline`).toBeVisible();
    await expect(outline.locator('[data-atlas-era]')).toHaveCount(8);
    await expect(outline.locator('[data-atlas-outline-node]')).toHaveCount(ATLAS_NODE_COUNT);
    expect(new Set(await outline.locator('[data-atlas-outline-relation-ref]').evaluateAll((elements) =>
      elements.map((element) => element.getAttribute('data-atlas-outline-relation-ref')),
    )).size).toBe(ATLAS_RELATION_COUNT);
    await expect(page.locator('[data-atlas-evidence-row]')).toHaveCount(ATLAS_EVIDENCE_COUNT);
    await expect(page.locator('html').evaluate((element) => element.scrollWidth === element.clientWidth)).resolves.toBe(true);
  }

  for (const width of [1200, 1151, 1227, 1228]) {
    await page.setViewportSize({ width, height: 800 });
    await page.goto('./atlas/network/');
    const controls = page.locator('[data-atlas-view-controls]');
    const viewport = page.locator('[data-atlas-canvas]');
    await expect(controls, `${width}px controls`).toBeVisible();
    await expect(viewport, `${width}px canvas`).toBeVisible();
    await expect(page.locator('[data-atlas-scroll-note]'), `${width}px scroll note`).toBeVisible();
    await expect(page.locator('[data-atlas-mobile-outline]'), `${width}px outline`).toBeHidden();
    await expect(viewport.locator('[data-atlas-node]')).toHaveCount(ATLAS_NODE_COUNT);
    await expect(viewport.locator('[data-atlas-relation]')).toHaveCount(ATLAS_RELATION_COUNT);
    await expect(page.locator('[data-atlas-evidence-row]')).toHaveCount(ATLAS_EVIDENCE_COUNT);

    await controls.getByRole('button', { name: '适应全图' }).click();
    const fit = await viewport.evaluate((element) => {
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
    expect(fit.scale).toBeGreaterThan(0);
    expect(fit.scene.left).toBeGreaterThanOrEqual(fit.viewport.left - 1);
    expect(fit.scene.top).toBeGreaterThanOrEqual(fit.viewport.top - 1);
    expect(fit.scene.right).toBeLessThanOrEqual(fit.viewport.right + 1);
    expect(fit.scene.bottom).toBeLessThanOrEqual(fit.viewport.bottom + 1);

    await controls.getByRole('button', { name: '重置 100%' }).click();
    await viewport.focus();
    await page.keyboard.press('ArrowRight');
    await expect.poll(() => viewport.evaluate((element) => element.scrollLeft)).toBe(80);
    await expect(page.locator('html').evaluate((element) => element.scrollWidth === element.clientWidth)).resolves.toBe(true);
  }

  for (const width of [1151, 1200, 1227]) {
    await page.setViewportSize({ width, height: 800 });
    await page.goto('./map/');
    await expect(page.locator('[data-capability-map-canvas]'), `${width}px EGDS canvas`).toBeHidden();
    await expect(page.locator('[data-egds-outline]'), `${width}px EGDS outline`).toBeVisible();
    await expect(page.locator('html').evaluate((element) => element.scrollWidth === element.clientWidth)).resolves.toBe(true);
  }
});

test('ordinary wheel scrolls the page outside map mode and zooms continuously inside it', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'chromium', 'Desktop wheel ownership is tested once.');
  await page.setViewportSize({ width: 1200, height: 800 });
  await page.goto('./atlas/network/');
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
  const scaleBeforeZoom = Number(await page.locator('[data-atlas-stage]').getAttribute('data-scale'));
  const mapMode = page.locator('[data-atlas-map-mode]');
  await expect(mapMode).toHaveAttribute('aria-pressed', 'false');
  await mapMode.click();
  await expect(mapMode).toHaveAttribute('aria-pressed', 'true');
  await viewport.scrollIntoViewIfNeeded();
  const activeBox = await viewport.boundingBox();
  expect(activeBox).not.toBeNull();
  await page.mouse.move(activeBox!.x + activeBox!.width / 2, activeBox!.y + activeBox!.height / 2);
  const pageYBeforeZoom = await page.evaluate(() => window.scrollY);
  await page.mouse.wheel(0, -120);
  await expect.poll(async () => Number(await page.locator('[data-atlas-stage]').getAttribute('data-scale')))
    .toBeGreaterThan(scaleBeforeZoom);
  expect(await page.evaluate(() => window.scrollY)).toBe(pageYBeforeZoom);
  expect(Number(await page.locator('[data-atlas-stage]').getAttribute('data-scale'))).not.toBe(1.25);
  await page.keyboard.press('Escape');
  await expect(mapMode).toHaveAttribute('aria-pressed', 'false');
});

test('map mode occupies the visual viewport, locks the page and restores scroll and focus on exit', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'chromium', 'Desktop fullscreen ownership is tested once.');
  await page.setViewportSize({ width: 1200, height: 800 });
  await page.goto('./atlas/network/');

  const network = page.locator('[data-atlas-global-network]');
  const viewport = page.locator('[data-atlas-canvas]');
  const mapMode = page.locator('[data-atlas-map-mode]');
  await network.scrollIntoViewIfNeeded();
  const pageYBefore = await page.evaluate(() => window.scrollY);

  await mapMode.click();
  await expect(mapMode).toHaveAttribute('aria-pressed', 'true');
  await expect(network).toHaveAttribute('data-map-mode', 'true');
  await expect(viewport).toBeFocused();

  const active = await network.evaluate((element) => {
    const viewport = element.querySelector<HTMLElement>('[data-atlas-canvas]')!;
    const networkStyle = getComputedStyle(element);
    const viewportStyle = getComputedStyle(viewport);
    const networkRect = element.getBoundingClientRect();
    const viewportRect = viewport.getBoundingClientRect();
    return {
      position: networkStyle.position,
      inset: [networkRect.top, networkRect.right, networkRect.bottom, networkRect.left],
      visualViewport: {
        width: window.visualViewport?.width ?? window.innerWidth,
        height: window.visualViewport?.height ?? window.innerHeight,
      },
      network: { width: networkRect.width, height: networkRect.height },
      viewport: { top: viewportRect.top, bottom: viewportRect.bottom, height: viewportRect.height },
      viewportFlexGrow: viewportStyle.flexGrow,
      htmlOverflow: getComputedStyle(document.documentElement).overflow,
      bodyOverflow: getComputedStyle(document.body).overflow,
      pageY: window.scrollY,
    };
  });
  expect(active.position).toBe('fixed');
  expect(Math.abs(active.inset[0])).toBeLessThanOrEqual(1);
  expect(Math.abs(active.inset[1] - active.visualViewport.width)).toBeLessThanOrEqual(1);
  expect(Math.abs(active.inset[2] - active.visualViewport.height)).toBeLessThanOrEqual(1);
  expect(Math.abs(active.inset[3])).toBeLessThanOrEqual(1);
  expect(Math.abs(active.network.width - active.visualViewport.width)).toBeLessThanOrEqual(1);
  expect(Math.abs(active.network.height - active.visualViewport.height)).toBeLessThanOrEqual(1);
  expect(active.viewport.height).toBeGreaterThan(600);
  expect(active.viewport.bottom).toBeLessThanOrEqual(active.visualViewport.height);
  expect(active.viewportFlexGrow).toBe('1');
  expect(active.htmlOverflow).toBe('hidden');
  expect(active.bodyOverflow).toBe('hidden');
  expect(active.pageY).toBe(pageYBefore);

  await mapMode.focus();
  await page.keyboard.press('Shift+Tab');
  expect(await page.evaluate(() => Boolean(document.activeElement?.closest('[data-atlas-global-network]')))).toBe(true);
  await viewport.focus();

  const controlsBox = await mapMode.boundingBox();
  expect(controlsBox).not.toBeNull();
  await page.mouse.move(controlsBox!.x + controlsBox!.width / 2, controlsBox!.y + controlsBox!.height / 2);
  await page.mouse.wheel(0, 360);
  expect(await page.evaluate(() => window.scrollY)).toBe(pageYBefore);

  await page.keyboard.press('Escape');
  await expect(mapMode).toHaveAttribute('aria-pressed', 'false');
  await expect(network).not.toHaveAttribute('data-map-mode', 'true');
  await expect(mapMode).toBeFocused();
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBe(pageYBefore);
  const restored = await page.evaluate(() => ({
    htmlOverflow: getComputedStyle(document.documentElement).overflow,
    bodyOverflow: getComputedStyle(document.body).overflow,
  }));
  expect(restored.htmlOverflow).not.toBe('hidden');
  expect(restored.bodyOverflow).not.toBe('hidden');
  await expect(page.locator('[inert]')).toHaveCount(0);

  await mapMode.click();
  await mapMode.click();
  await expect(mapMode).toHaveAttribute('aria-pressed', 'false');
  await expect(mapMode).toBeFocused();
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBe(pageYBefore);
});

test('Atlas bootstrap keeps one controller owner when its compiled module runs again', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'chromium', 'Controller ownership is tested once.');
  await page.goto('./atlas/network/');
  const explorer = page.locator('[data-atlas-explorer]');

  await page.evaluate(async () => {
    const root = document.querySelector<HTMLElement>('[data-atlas-explorer]');
    const script = Array.from(document.querySelectorAll<HTMLScriptElement>('script[type="module"][src]'))
      .find((candidate) => candidate.src.includes('AtlasNetwork.astro'));
    if (!root || !script) throw new Error('Missing Atlas explorer or compiled module');

    let listenerRegistrations = 0;
    const original = EventTarget.prototype.addEventListener;
    EventTarget.prototype.addEventListener = function addEventListener(...args) {
      listenerRegistrations += 1;
      return original.apply(this, args);
    };
    try {
      await import(`${script.src}?cache-bust=${crypto.randomUUID()}`);
    } finally {
      EventTarget.prototype.addEventListener = original;
    }
    root.dataset.testAtlasListenerRegistrations = String(listenerRegistrations);
  });

  await expect(explorer).toHaveAttribute('data-atlas-initialized', 'true');
  await expect(explorer).toHaveAttribute('data-test-atlas-listener-registrations', '0');
});

test('family directory and fullscreen theme controls stay synchronized and keyboard-accessible without changing map state', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'chromium', 'Fullscreen lens ownership is tested once.');
  await page.setViewportSize({ width: 1200, height: 800 });
  await page.goto('./atlas/network/');

  const explorer = page.locator('[data-atlas-explorer]');
  const network = page.locator('[data-atlas-global-network]');
  const viewport = page.locator('[data-atlas-canvas]');
  const stage = page.locator('[data-atlas-stage]');
  const mapMode = page.locator('[data-atlas-map-mode]');
  const search = page.getByRole('searchbox', { name: '搜索节点' });
  const familyDirectory = explorer.locator('[data-atlas-family-directory]');
  await expect(familyDirectory).toHaveCount(1);
  await expect(familyDirectory.locator('[data-atlas-family]')).toHaveCount(10);
  await expect(familyDirectory.locator('[data-atlas-foundation-lens]')).toHaveCount(1);
  await expect(explorer.locator('[data-atlas-theme-button]')).toHaveCount(ATLAS_THEME_BUTTON_COUNT);
  await expect(explorer.locator('[data-atlas-lens-status]')).toHaveCount(1);
  expect(new Set(await explorer.locator('[data-atlas-theme-button]').evaluateAll((buttons) =>
    buttons.map((button) => button.getAttribute('data-atlas-theme-button')),
  )).size).toBe(ATLAS_THEME_ID_COUNT);
  await openAtlasFamily(page, 'role-playing');
  await expect(familyDirectory.locator('[data-atlas-family="role-playing"] [data-atlas-theme-button="roguelike"]'))
    .toBeEnabled();
  await search.fill('Dead Cells');
  await page.getByRole('button', { name: '放大' }).click();
  await viewport.evaluate((element) => {
    element.scrollLeft = 320;
    element.scrollTop = 140;
  });
  const stateBefore = await page.evaluate(() => ({
    scale: document.querySelector<HTMLElement>('[data-atlas-stage]')?.dataset.scale,
    viewport: (() => {
      const canvas = document.querySelector<HTMLElement>('[data-atlas-canvas]')!;
      return { left: canvas.scrollLeft, top: canvas.scrollTop };
    })(),
    search: (document.querySelector<HTMLInputElement>('[data-atlas-node-search]')?.value),
    nodes: Array.from(document.querySelectorAll<HTMLElement>('[data-atlas-node]')).map((node) => ({
      id: node.dataset.atlasNodeId,
      style: node.getAttribute('style'),
    })),
    relations: Array.from(document.querySelectorAll<SVGGElement>('[data-atlas-relation]')).map((relation) => ({
      id: relation.dataset.atlasRelation,
      path: relation.querySelector('[data-atlas-relation-path]')?.getAttribute('d'),
    })),
  }));

  await mapMode.click();
  await expect(network).toHaveAttribute('data-map-mode', 'true');
  const lensControl = network.locator('.atlas-lens-control');
  await expect(lensControl).toBeVisible();
  await expect(lensControl.locator('[data-atlas-family-directory]')).toBeHidden();
  await expect(lensControl.locator('[data-atlas-fullscreen-lenses] [data-atlas-theme-button]')).toHaveCount(ATLAS_THEME_ID_COUNT);
  await expect(explorer.locator('[data-atlas-theme-button]')).toHaveCount(ATLAS_THEME_BUTTON_COUNT);
  await expect(explorer.locator('#atlas-lens-status')).toHaveCount(1);

  const metroidvania = lensControl.locator('[data-atlas-fullscreen-lenses]')
    .getByRole('button', { name: 'Metroidvania', exact: true });
  await metroidvania.focus();
  await page.keyboard.press('Space');
  await expect(metroidvania).toHaveAttribute('aria-pressed', 'true');
  await expect(network).toHaveAttribute('data-map-mode', 'true');
  await expect(stage).toHaveAttribute('data-scale', stateBefore.scale!);
  await expect.poll(() => viewport.evaluate((element) => ({ left: element.scrollLeft, top: element.scrollTop })))
    .toEqual(stateBefore.viewport);
  await expect(search).toHaveValue(stateBefore.search!);
  expect(await page.evaluate(() => ({
    nodes: Array.from(document.querySelectorAll<HTMLElement>('[data-atlas-node]')).map((node) => ({
      id: node.dataset.atlasNodeId,
      style: node.getAttribute('style'),
    })),
    relations: Array.from(document.querySelectorAll<SVGGElement>('[data-atlas-relation]')).map((relation) => ({
      id: relation.dataset.atlasRelation,
      path: relation.querySelector('[data-atlas-relation-path]')?.getAttribute('d'),
    })),
  }))).toEqual({ nodes: stateBefore.nodes, relations: stateBefore.relations });
  await expect(page.locator('[data-atlas-node-id="dead-cells"]')).toHaveAttribute('data-search-match', 'true');
});

test('cross-Family lineages activate directly and fullscreen uses a compact lens strip', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'chromium', 'Desktop family and fullscreen behavior is tested once.');
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('./atlas/network/');

  const directory = page.locator('[data-atlas-family-directory]');
  const rolePlaying = directory.locator('[data-atlas-family="role-playing"]');
  await rolePlaying.locator('summary').click();
  const rolePlayingRoguelike = rolePlaying.locator('[data-atlas-theme-button="roguelike"]');
  await expect(rolePlayingRoguelike).toBeEnabled();
  await rolePlayingRoguelike.click();
  await expect(directory.locator('[data-atlas-theme-button="roguelike"][aria-pressed="true"]')).toHaveCount(2);
  await expect(page.locator('[data-atlas-lens-status]')).toContainText('Roguelike');

  const familyBodyMetrics = await rolePlaying.locator('.atlas-family-directory__body').evaluate((body) => {
    const style = getComputedStyle(body);
    const rect = body.getBoundingClientRect();
    const familyRect = body.closest('[data-atlas-family]')!.getBoundingClientRect();
    return {
      position: style.position,
      overflowY: style.overflowY,
      containedByFamily: rect.bottom <= familyRect.bottom + 1,
    };
  });
  expect(familyBodyMetrics).toEqual({ position: 'static', overflowY: 'visible', containedByFamily: true });

  await page.locator('[data-atlas-map-mode]').click();
  const network = page.locator('[data-atlas-global-network][data-map-mode="true"]');
  const fullscreenLenses = network.locator('[data-atlas-fullscreen-lenses]');
  await expect(fullscreenLenses).toBeVisible();
  await expect(fullscreenLenses.locator('[data-atlas-theme-button]')).toHaveCount(ATLAS_THEME_ID_COUNT);
  await expect(network.locator('[data-atlas-family-directory]')).toBeHidden();
  await expect(fullscreenLenses.locator('[data-atlas-theme-button="roguelike"]')).toHaveAttribute('aria-pressed', 'true');
  await expect(page.locator('[data-atlas-canvas]')).toHaveAttribute('data-map-mode', 'true');
});

test('genre lenses promote innovation events and keep carrier games in reversible detail', async ({ page }, testInfo) => {
  await page.goto('./atlas/network/');
  await openAtlasFamily(page, 'shooter');
  await visibleThemeButton(page, 'first-person-shooter-lineage').click();

  await expect(page.locator('[data-atlas-lens-status]')).toContainText('第一人称射击开发谱系');
  const primaryNetwork = page.locator('[data-atlas-primary-network]');
  await expect(primaryNetwork).toBeVisible();
  if (testInfo.project.name === 'mobile-chromium') {
    await expect(page.locator('[data-atlas-canvas]')).toBeHidden();
    await expect(page.locator('[data-atlas-mobile-outline] [data-atlas-outline-node]')).toHaveCount(ATLAS_NODE_COUNT);
  } else {
    await expect(primaryNetwork.locator('[data-atlas-node]:visible')).toHaveCount(ATLAS_NODE_COUNT);
  }
  await expect(primaryNetwork.locator('[data-atlas-relation]')).toHaveCount(ATLAS_RELATION_COUNT);
  await expect(primaryNetwork.locator('[data-atlas-relation="spelunky-to-dead-cells"]')).toBeAttached();
  const timeline = page.locator('[data-atlas-event-timeline]');
  await expect(timeline).toBeVisible();
  await expect(timeline.locator('[data-atlas-event-timeline-item]:not([hidden])')).toHaveCount(atlasNodesData.filter(n => n.kind === 'innovation' && n.tags.includes('first-person-shooter-lens')).length);
  await expect(timeline.locator('[data-atlas-event-timeline-item][data-atlas-event-role]:not([hidden])')).toHaveCount(7);
  await expect(page.locator('[data-atlas-primary-network] [data-atlas-event-relation][data-theme-match="true"]')).toHaveCount(7);

  await timeline.locator('[data-atlas-event-timeline-item="fps-vertical-space-combat"] a[data-atlas-event-link]').click();
  const dialog = page.locator('dialog[data-atlas-selected-detail]');
  await expect(dialog).toBeVisible();
  await expect(dialog).toContainText('引入方式');
  await expect(dialog).toContainText('承载作品');
  await expect(dialog.locator('[data-atlas-event-evolution-links]')).toBeVisible();
  await expect(dialog.locator('a[href="#atlas-node-detail-doom"]')).toBeVisible();
  await dialog.getByRole('button', { name: '返回网络' }).click();
  await expect(dialog).toBeHidden();

  await visibleThemeButton(page, 'all').click();
  await expect(page.locator('[data-atlas-primary-network]')).toBeVisible();
  await expect(timeline.locator('[data-atlas-event-timeline-item]:not([hidden])')).toHaveCount(ATLAS_EVENT_COUNT);
});

test('Atlas offers representative-work, event-history, and category-development map perspectives', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'chromium', 'The two map perspectives are tested once at a desktop viewport.');
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('./atlas/network/');
  await openAtlasFamily(page, 'shooter');
  await page.locator('[data-atlas-map-mode]').click();
  const noLensNetwork = page.locator('[data-atlas-global-network][data-map-mode="true"]');
  await expect(noLensNetwork.locator('[data-atlas-perspective="category"]')).toBeEnabled();
  await noLensNetwork.locator('[data-atlas-perspective="category"]').click();
  await expect(noLensNetwork).toHaveAttribute('data-atlas-route-mode', 'category');
  await noLensNetwork.locator('[data-atlas-perspective="works"]').click();
  await page.locator('[data-atlas-map-mode]').click();
  await visibleThemeButton(page, 'first-person-shooter-lineage').click();
  await page.locator('[data-atlas-map-mode]').click();

  const network = page.locator('[data-atlas-global-network][data-map-mode="true"]');
  const primary = network.locator('[data-atlas-primary-network]');
  const perspectives = network.locator('[data-atlas-perspective-controls]');
  await expect(network).toHaveAttribute('data-atlas-perspective', 'works');
  await expect(network).toHaveAttribute('data-atlas-route-mode', 'full');
  await expect(page.locator('[data-atlas-lens-status]')).toContainText(`代表作品视角：显示 ${ATLAS_WORK_PRIMARY_NODE_COUNT} 个作品/载体节点与 ${ATLAS_PRIMARY_RELATION_COUNTS.works} 条关系`);
  await expect(perspectives.locator('[data-atlas-perspective="works"]')).toHaveAttribute('aria-pressed', 'true');
  await expect(primary.locator('[data-atlas-node]:visible')).toHaveCount(ATLAS_WORK_PRIMARY_NODE_COUNT);
  await expect(primary.locator('[data-atlas-node][data-atlas-game-node]:visible')).not.toHaveCount(0);
  await expect(primary.locator('[data-atlas-node][data-atlas-event-node]:visible')).toHaveCount(0);
  await expect(primary.locator('[data-atlas-node][data-atlas-node-kind="category"]:visible')).toHaveCount(0);
  await expect(primary.locator('[data-atlas-relation][data-atlas-perspective-visible="true"]')).toHaveCount(ATLAS_PRIMARY_RELATION_COUNTS.works);

  await perspectives.locator('[data-atlas-perspective="category"]').click();
  await expect(network).toHaveAttribute('data-atlas-perspective', 'category');
  await expect(network).toHaveAttribute('data-atlas-route-mode', 'category');
  await expect(page.locator('[data-atlas-lens-status]')).toContainText(`品类发展视角：显示 ${ATLAS_CATEGORY_PRIMARY_NODE_COUNT} 个品类/事件节点与 ${ATLAS_PRIMARY_RELATION_COUNTS.category} 条关系`);
  await expect(primary.locator('[data-atlas-node]:visible')).toHaveCount(ATLAS_CATEGORY_PRIMARY_NODE_COUNT);
  await expect(primary.locator('[data-atlas-node][data-atlas-node-kind="innovation"]:visible')).toHaveCount(ATLAS_EVENT_PRIMARY_NODE_COUNT);
  await expect(primary.locator('[data-atlas-node][data-atlas-node-kind="category"]:visible')).toHaveCount(2);
  await expect(primary.locator('[data-atlas-node][data-atlas-game-node]:visible')).toHaveCount(0);
  await expect(primary.locator('[data-atlas-node][data-atlas-event][data-theme-match="true"]:visible')).toHaveCount(7);
  await expect(primary.locator('[data-atlas-relation][data-atlas-perspective-visible="true"]')).toHaveCount(ATLAS_PRIMARY_RELATION_COUNTS.category);
  await expect(primary.locator('[data-atlas-event-relation][data-theme-match="true"]')).toHaveCount(7);
  const categoryBand = await primary.evaluate((element) => {
    const readBox = (node: HTMLElement) => ({
      top: Number(node.dataset.nodeTop),
      bottom: Number(node.dataset.nodeTop) + Number(node.dataset.nodeHeight),
    });
    const events = Array.from(element.querySelectorAll<HTMLElement>('[data-atlas-node][data-atlas-event][data-theme-match="true"]'));
    const eventBoxes = events.map(readBox);
    return {
      eventTop: Math.min(...eventBoxes.map(({ top }) => top)),
      eventBottom: Math.max(...eventBoxes.map(({ bottom }) => bottom)),
    };
  });
  expect(categoryBand.eventTop).toBeGreaterThanOrEqual(400);
  expect(categoryBand.eventBottom).toBeGreaterThan(categoryBand.eventTop);

  await perspectives.locator('[data-atlas-perspective="events"]').click();
  await expect(network).toHaveAttribute('data-atlas-perspective', 'events');
  await expect(network).toHaveAttribute('data-atlas-route-mode', 'events');
  await expect(page.locator('[data-atlas-lens-status]')).toContainText(`创新事件视角：显示 ${ATLAS_EVENT_PRIMARY_NODE_COUNT} 个事件节点与 ${ATLAS_EVOLUTION_RELATION_COUNT} 条演进关系`);
  await expect(primary.locator('[data-atlas-node]:visible')).toHaveCount(ATLAS_EVENT_PRIMARY_NODE_COUNT);
  await expect(primary.locator('[data-atlas-node][data-atlas-node-kind="innovation"]:visible')).toHaveCount(ATLAS_EVENT_PRIMARY_NODE_COUNT);
  await expect(primary.locator('[data-atlas-node][data-atlas-game-node]:visible')).toHaveCount(0);
  await expect(primary.locator('[data-atlas-node][data-atlas-node-kind="category"]:visible')).toHaveCount(0);
  await expect(primary.locator('[data-atlas-relation][data-atlas-perspective-visible="true"]')).toHaveCount(ATLAS_PRIMARY_RELATION_COUNTS.events);
  const eventBand = await primary.evaluate((element) => {
    const readBox = (node: HTMLElement) => ({
      top: Number(node.dataset.nodeTop),
      bottom: Number(node.dataset.nodeTop) + Number(node.dataset.nodeHeight),
    });
    const events = Array.from(element.querySelectorAll<HTMLElement>('[data-atlas-node][data-atlas-event]'));
    const eventBoxes = events.map(readBox);
    return {
      eventTop: Math.min(...eventBoxes.map(({ top }) => top)),
      eventBottom: Math.max(...eventBoxes.map(({ bottom }) => bottom)),
    };
  });
  expect(eventBand.eventTop).toBeGreaterThan(200);
  expect(eventBand.eventBottom).toBeGreaterThan(eventBand.eventTop);
  await expect(primary.locator('[data-atlas-event-relation][data-relation-role="evolution"]')).toHaveCount(ATLAS_EVOLUTION_RELATION_COUNT);

  await primary.locator('[data-atlas-node-id="fps-vertical-space-combat"] [data-atlas-node-link]').click();
  const dialog = page.locator('dialog[data-atlas-selected-detail]');
  await expect(dialog).toBeVisible();
  await expect(dialog).toContainText('承载作品');
  await expect(dialog.locator('a[href="#atlas-node-detail-doom"]')).toBeVisible();
  await dialog.getByRole('button', { name: '返回网络' }).click();
  await expect(dialog).toBeHidden();

  await perspectives.locator('[data-atlas-perspective="works"]').click();
  await expect(network).toHaveAttribute('data-atlas-perspective', 'works');
  await expect(network).toHaveAttribute('data-atlas-route-mode', 'full');
  await expect(primary.locator('[data-atlas-node]:visible')).toHaveCount(ATLAS_WORK_PRIMARY_NODE_COUNT);
});

test('a genre without event evidence shows an honest empty state', async ({ page }, testInfo) => {
  await page.goto('./atlas/network/');
  await page.locator('[data-atlas-foundation-lens] [data-atlas-theme-button="early-electronic-games"]').click();

  await expect(page.locator('[data-atlas-primary-network]')).toBeVisible();
  if (testInfo.project.name === 'mobile-chromium') {
    await expect(page.locator('[data-atlas-canvas]')).toBeHidden();
    await expect(page.locator('[data-atlas-mobile-outline] [data-atlas-outline-node]')).toHaveCount(ATLAS_NODE_COUNT);
  } else {
    await expect(page.locator('[data-atlas-primary-network] [data-atlas-node]:visible')).toHaveCount(ATLAS_NODE_COUNT);
  }
  await expect(page.locator('[data-atlas-primary-network] [data-atlas-relation]')).toHaveCount(ATLAS_RELATION_COUNT);
  await expect(page.locator('[data-atlas-event-empty]')).toBeVisible();
  await expect(page.locator('[data-atlas-event-index-status]')).toContainText('0 个创新事件');
});

test('new Strategy lineage and empty Genre Families expose honest status', async ({ page }) => {
  await page.goto('./atlas/network/');
  const strategy = page.locator('[data-atlas-family="strategy"]');
  await expect(strategy.locator('summary')).toContainText('2 条已核查谱系');
  await strategy.locator('summary').click();
  await expect(strategy.locator('[data-atlas-theme-button="real-time-strategy-lineage"]')).toBeEnabled();

  const simulation = page.locator('[data-atlas-family="rhythm-party"]');
  await expect(simulation.locator('summary')).toContainText('0 条已核查谱系，待研究');
  await expect(simulation.locator('[data-atlas-theme-button]')).toHaveCount(0);
  await simulation.locator('summary').click();
  await expect(simulation.locator('.atlas-family-directory__empty')).toContainText('尚无达到证据门槛的谱系');

  const puzzle = page.locator('[data-atlas-family="puzzle"]');
  await expect(puzzle.locator('summary')).toContainText('2 条已核查谱系');
  await puzzle.locator('summary').click();
  await expect(puzzle.locator('[data-atlas-theme-button="puzzle-adventure-lineage"]')).toBeEnabled();
});

test('fullscreen lens strip does not cover the map controls or canvas', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'chromium', 'Desktop fullscreen lens layout is tested once.');

  for (const width of [1151, 1200, 1440]) {
    await page.setViewportSize({ width, height: 800 });
    await page.goto('./atlas/network/');
    await page.locator('[data-atlas-map-mode]').click();

    const overlap = await page.evaluate(() => {
      const body = document.querySelector<HTMLElement>('[data-atlas-fullscreen-lenses]')!;
      const controls = document.querySelector<HTMLElement>('[data-atlas-view-controls]')!;
      const viewport = document.querySelector<HTMLElement>('[data-atlas-canvas]')!;
      const bodyRect = body.getBoundingClientRect();
      const controlsRect = controls.getBoundingClientRect();
      const viewportRect = viewport.getBoundingClientRect();
      const intersects = (target: DOMRect) => bodyRect.left < target.right
        && bodyRect.right > target.left
        && bodyRect.top < target.bottom
        && bodyRect.bottom > target.top;
      return {
        controls: intersects(controlsRect),
        viewport: intersects(viewportRect),
      };
    });

    expect(overlap).toEqual({ controls: false, viewport: false });
  }
});

test('fullscreen detail evidence temporarily releases the page and resumes the same map context', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'chromium', 'Desktop fullscreen detail return is tested once.');
  await page.setViewportSize({ width: 1200, height: 800 });
  await page.goto('./atlas/network/');

  const network = page.locator('[data-atlas-global-network]');
  const viewport = page.locator('[data-atlas-canvas]');
  const mapMode = page.locator('[data-atlas-map-mode]');
  await mapMode.click();
  await page.getByRole('button', { name: '放大' }).click();
  await viewport.evaluate((element) => {
    element.scrollLeft = 240;
    element.scrollTop = 110;
  });

  const nodeLink = page.locator('[data-atlas-node-id="dead-cells"] [data-atlas-node-link]');
  await nodeLink.scrollIntoViewIfNeeded();
  const selectedPosition = await viewport.evaluate((element) => ({ left: element.scrollLeft, top: element.scrollTop }));
  await nodeLink.click();
  const dialog = page.locator('dialog[data-atlas-selected-detail]');
  await expect(dialog).toBeVisible();
  const evidenceTarget = await dialog.locator('[data-atlas-evidence-ref]').first().getAttribute('href');
  await dialog.locator('[data-atlas-evidence-ref]').first().click();

  await expect(mapMode).toHaveAttribute('aria-pressed', 'false');
  await expect(network).not.toHaveAttribute('data-map-mode', 'true');
  await expect(page.locator(evidenceTarget!)).toBeVisible();
  const returnButton = page.locator(`${evidenceTarget} [data-atlas-evidence-return]`);
  await expect(returnButton).toBeVisible();
  await returnButton.click();

  await expect(mapMode).toHaveAttribute('aria-pressed', 'true');
  await expect(network).toHaveAttribute('data-map-mode', 'true');
  await expect(nodeLink).toBeFocused();
  await expect.poll(() => viewport.evaluate((element) => ({ left: element.scrollLeft, top: element.scrollTop })))
    .toEqual(selectedPosition);
});

test('fit follows viewport resizing until manual zoom or reset takes ownership', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'chromium', 'Fit resize ownership is tested once.');
  await page.setViewportSize({ width: 1200, height: 800 });
  await page.goto('./atlas/network/');
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
  await page.goto('./atlas/network/');
  const viewport = page.locator('[data-atlas-canvas]');
  await page.locator('[data-atlas-map-mode]').click();
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
  await page.goto('./atlas/network/');
  await openAtlasFamily(page, 'action');
  await visibleThemeButton(page, 'metroidvania').click();

  const controls = page.locator('[data-atlas-view-controls]');
  const viewport = page.locator('[data-atlas-canvas]');
  await page.locator('[data-atlas-map-mode]').click();
  // Carrier interaction is verified in the full network; a selected lens uses
  // the event route and intentionally hides carrier works from the canvas.
  await visibleThemeButton(page, 'all').click();
  await controls.getByRole('button', { name: '放大' }).click();
  await controls.getByRole('button', { name: '放大' }).click();
  await viewport.evaluate((element) => {
    element.scrollLeft = 180;
    element.scrollTop = 120;
  });
  const graphBefore = await atlasGraphSnapshot(page);
  expect(graphBefore.nodes).toHaveLength(ATLAS_NODE_COUNT);
  expect(graphBefore.relations).toHaveLength(ATLAS_RELATION_COUNT);
  expect(graphBefore.evidenceIds).toHaveLength(ATLAS_EVIDENCE_COUNT);
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
  // The standalone works view now starts with real work nodes in the first
  // viewport. Begin the drag in the intentionally empty gutter so the
  // interactive-target guard does not treat it as a node click.
  await page.mouse.move(viewportBox!.x + 10, viewportBox!.y + 10);
  await page.mouse.down();
  await page.mouse.move(viewportBox!.x - 50, viewportBox!.y - 30, { steps: 4 });
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
  await page.setViewportSize({ width: 1200, height: 800 });
  await page.goto('./atlas/network/');

  const buttons = page.locator('[data-atlas-theme-button]');
  const viewport = page.locator('[data-atlas-canvas]');
  const search = page.getByRole('searchbox', { name: '搜索节点' });
  await expect(buttons).toHaveCount(ATLAS_THEME_BUTTON_COUNT);
  for (const button of await buttons.all()) {
    await expect(button).toBeEnabled();
  }
  await expect(visibleThemeButton(page, 'all')).toHaveAttribute('aria-pressed', 'true');
  await search.fill('Dead Cells');
  await page.getByRole('button', { name: '放大' }).click();
  await viewport.evaluate((element) => {
    element.scrollLeft = 260;
    element.scrollTop = 120;
  });

  const stableState = () => page.evaluate(() => {
    const canvas = document.querySelector<HTMLElement>('[data-atlas-canvas]')!;
    const network = document.querySelector<HTMLElement>('[data-atlas-global-network]')!;
    return {
      scale: document.querySelector<HTMLElement>('[data-atlas-stage]')?.dataset.scale,
      pan: { left: canvas.scrollLeft, top: canvas.scrollTop },
      search: document.querySelector<HTMLInputElement>('[data-atlas-node-search]')?.value,
      mapMode: network.getAttribute('data-map-mode'),
      nodes: Array.from(document.querySelectorAll<HTMLElement>('[data-atlas-node]')).map((node) => ({
        id: node.dataset.atlasNodeId,
        box: [node.dataset.nodeLeft, node.dataset.nodeTop, node.dataset.nodeWidth, node.dataset.nodeHeight],
      })),
      relations: Array.from(document.querySelectorAll<SVGGElement>('[data-atlas-relation]')).map((relation) => ({
        id: relation.dataset.atlasRelation,
        path: relation.querySelector('[data-atlas-relation-path]')?.getAttribute('d'),
      })),
    };
  });
  const before = await stableState();

  const lensNodes = {
    'early-electronic-games': 'pong',
    roguelike: 'dead-cells',
    metroidvania: 'dead-cells',
    'platform-lineage': 'celeste',
    'adventure-lineage': 'zork',
    'first-person-shooter-lineage': 'doom',
    'real-time-strategy-lineage': 'starcraft',
  } as const;
  const lensFamilies: Partial<Record<keyof typeof lensNodes, string>> = {
    roguelike: 'action',
    metroidvania: 'action',
    'platform-lineage': 'action',
    'adventure-lineage': 'adventure',
    'first-person-shooter-lineage': 'shooter',
    'real-time-strategy-lineage': 'strategy',
  };
  for (const [lens, matchingNode] of Object.entries(lensNodes)) {
    const familyId = lensFamilies[lens as keyof typeof lensNodes];
    if (familyId) await openAtlasFamily(page, familyId);
    await visibleThemeButton(page, lens).click();
    expect(await page.locator(`[data-atlas-theme-button="${lens}"]`).evaluateAll((controls) =>
      controls.every((control) => control.getAttribute('aria-pressed') === 'true'),
    )).toBe(true);
    await expect(page.locator('[data-atlas-primary-network]')).toBeVisible();
    await expect(page.locator('[data-atlas-primary-network] [data-atlas-node]:visible')).toHaveCount(ATLAS_NODE_COUNT);
    await expect(page.locator('[data-atlas-primary-network] [data-atlas-relation]')).toHaveCount(ATLAS_RELATION_COUNT);
    await expect(page.locator('[data-atlas-lens-status]')).toContainText('地图模式可在代表作品与品类发展两种视角间切换');
    await expect(page.locator('[data-atlas-global-network] [data-atlas-node][data-theme-match="true"]')).not.toHaveCount(ATLAS_NODE_COUNT);
    await expect(page.locator('[data-atlas-global-network] [data-atlas-relation][data-theme-match="true"]')).not.toHaveCount(ATLAS_RELATION_COUNT);
    await expect(page.locator(`[data-atlas-global-network] [data-atlas-node][data-atlas-node-id="${matchingNode}"]`))
      .toHaveAttribute('data-theme-match', 'true');
  }

  await visibleThemeButton(page, 'all').click();
  await expect(page.locator('[data-atlas-primary-network]')).toBeVisible();
  await expect.poll(() => stableState()).toEqual(before);
  await expect(page.locator('[data-atlas-global-network] [data-atlas-node][data-theme-match="true"]')).toHaveCount(ATLAS_NODE_COUNT);
  await expect(page.locator('[data-atlas-global-network] [data-atlas-relation][data-theme-match="true"]')).toHaveCount(ATLAS_RELATION_COUNT);
});

test('non-matching desktop edges keep neutral direction semantics and 3:1 contrast in light and dark', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'chromium', 'Desktop edge styling is tested once.');

  for (const appearance of ['light', 'dark']) {
    await page.goto('./atlas/network/');
    await page.getByLabel('外观').selectOption(appearance);
    await openAtlasFamily(page, 'action');
    await visibleThemeButton(page, 'metroidvania').click();

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

    await visibleThemeButton(page, 'roguelike').click();
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
    await page.goto('./atlas/network/');
    await page.getByLabel('外观').selectOption(appearance);
    await openAtlasFamily(page, 'action');
    await visibleThemeButton(page, 'metroidvania').click();
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
  await page.goto('./atlas/network/');

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
    const pointOnBoundary = (
      point: { x: number; y: number },
      box: { left: number; top: number; width: number; height: number },
    ) => {
      const within = (value: number, start: number, end: number) =>
        value >= start - 0.001 && value <= end + 0.001;
      const onVerticalSide = (
        Math.abs(point.x - box.left) < 0.001 ||
        Math.abs(point.x - (box.left + box.width)) < 0.001
      ) && within(point.y, box.top, box.top + box.height);
      const onHorizontalSide = (
        Math.abs(point.y - box.top) < 0.001 ||
        Math.abs(point.y - (box.top + box.height)) < 0.001
      ) && within(point.x, box.left, box.left + box.width);
      return onVerticalSide || onHorizontalSide;
    };
    const startOnBoundary = pointOnBoundary(relation.start, from);
    const endOnBoundary = pointOnBoundary(relation.end, to);
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
  await page.goto('./atlas/network/');

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

test('renders the Evidence index and keeps node and relation references reachable', async ({ page }) => {
  await page.goto('./atlas/network/');

  const index = page.locator('[data-atlas-evidence-index]');
  const rows = index.locator('[data-atlas-evidence-row]');
  await expect(rows).toHaveCount(ATLAS_EVIDENCE_COUNT);
  await expect(index.locator('a[data-atlas-evidence-link]')).toHaveCount(ATLAS_EVIDENCE_COUNT);
  const evidenceIds = await rows.evaluateAll((elements) => elements.map((element) => element.id));
  expect(new Set(evidenceIds).size).toBe(ATLAS_EVIDENCE_COUNT);
  expect(evidenceIds.every((id) => id.startsWith('atlas-evidence-'))).toBe(true);
  await expect(page.locator('[data-atlas-evidence-row]')).toHaveCount(ATLAS_EVIDENCE_COUNT);

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
  await page.goto('./atlas/network/');

  const index = page.locator('[data-atlas-node-index]');
  const search = index.getByRole('searchbox', { name: '搜索节点' });
  const sort = index.getByLabel('节点排序');
  const clear = index.getByRole('button', { name: '清除搜索' });
  const items = index.locator('[data-atlas-index-item]');
  const graphBefore = await atlasGraphSnapshot(page);

  await expect(search).toBeEnabled();
  await expect(sort).toHaveValue('time');
  await expect(items).toHaveCount(ATLAS_NODE_COUNT);
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

  await openAtlasFamily(page, 'action');
  await visibleThemeButton(page, 'metroidvania').click();
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
  await expect.poll(() => visibleAtlasIndexItemCount(items)).toBe(ATLAS_NODE_COUNT);
  await expect(index.locator('[data-atlas-node-empty]')).toBeHidden();
  await expect(clear).toBeDisabled();
  await expect(page.locator('[data-atlas-node][data-search-match]')).toHaveCount(0);
  expect(await page.locator('[data-atlas-theme-button="metroidvania"]').evaluateAll((controls) =>
    controls.every((control) => control.getAttribute('aria-pressed') === 'true'),
  )).toBe(true);
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
    await page.goto('./atlas/network/');
    await page.locator('[data-atlas-node-search]').fill('法定系列续作');
    await openAtlasFamily(page, 'action');
    await visibleThemeButton(page, 'metroidvania').click();

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
  await page.goto('./atlas/network/');

  await expect(page.locator('[data-atlas-canvas]')).toBeHidden();
  await expect(page.locator('[data-atlas-view-controls]')).toHaveCount(1);
  await expect(page.locator('[data-atlas-view-controls]')).toBeHidden();
  const outline = page.locator('[data-atlas-mobile-outline]');
  await expect(outline).toBeVisible();
  await expect(outline.locator('[data-atlas-era]')).toHaveCount(8);
  await expect(outline.locator('[data-atlas-outline-node]')).toHaveCount(ATLAS_NODE_COUNT);
  const relationIds = await outline.locator('[data-atlas-outline-relation-ref]').evaluateAll((elements) =>
    elements.map((element) => element.getAttribute('data-atlas-outline-relation-ref')),
  );
  expect(new Set(relationIds).size).toBe(ATLAS_RELATION_COUNT);
  for (const direction of ['incoming', 'outgoing', 'undirected']) {
    await expect(outline.locator(`[data-outline-direction="${direction}"]`)).toHaveCount(ATLAS_NODE_COUNT);
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
  const familyDirectory = page.locator('[data-atlas-family-directory]');
  await expect(familyDirectory).toHaveCount(1);
  await expect(familyDirectory.locator('details[data-atlas-family]')).toHaveCount(10);
  await expect(familyDirectory.locator('[data-atlas-foundation-lens]')).toHaveCount(1);
  await expect(familyDirectory.locator('[data-atlas-scope-note]')).toHaveCount(ATLAS_SCOPE_NOTE_COUNT);
  await familyDirectory.locator('[data-atlas-family="action"] summary').click();
  await expect(familyDirectory.locator('[data-atlas-family="action"] [data-atlas-scope-note]')).toHaveCount(3);
  await expect(familyDirectory.locator('[data-atlas-family="action"] [data-atlas-scope-note]').first()).toBeVisible();
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
  await expect(page.locator('[data-atlas-global-network] [data-atlas-node]')).toHaveCount(ATLAS_NODE_COUNT);
  await expect(page.locator('[data-atlas-global-network] [data-atlas-relation]')).toHaveCount(ATLAS_RELATION_COUNT);
  const nodeIndex = page.locator('[data-atlas-node-index]');
  await expect(nodeIndex.locator('[data-atlas-index-item]')).toHaveCount(ATLAS_NODE_COUNT);
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
  const familyDirectory = page.locator('[data-atlas-family-directory]');
  await expect(familyDirectory.locator('details[data-atlas-family]')).toHaveCount(10);
  await expect(familyDirectory.locator('[data-atlas-scope-note]')).toHaveCount(ATLAS_SCOPE_NOTE_COUNT);
  await familyDirectory.locator('[data-atlas-family="adventure"] summary').click();
  await expect(familyDirectory.locator('[data-atlas-family="adventure"] [data-atlas-scope-note]').first()).toBeVisible();
  const nodeIndex = page.locator('[data-atlas-node-index]');
  await expect(nodeIndex.locator('[data-atlas-index-item]')).toHaveCount(ATLAS_NODE_COUNT);
  await expect(nodeIndex.getByRole('searchbox', { name: '搜索节点' })).toBeDisabled();
  await expect(nodeIndex.getByLabel('节点排序')).toBeDisabled();
  await expect(nodeIndex.getByRole('button', { name: '清除搜索' })).toBeDisabled();
  await expect(nodeIndex.locator('[data-atlas-node-index-no-js-note]')).toBeVisible();
  const outline = page.locator('[data-atlas-mobile-outline]');
  await expect(outline).toBeVisible();
  await expect(outline.locator('[data-atlas-era]')).toHaveCount(8);
  await expect(outline.locator('[data-atlas-outline-node]')).toHaveCount(ATLAS_NODE_COUNT);
  expect(new Set(await outline.locator('[data-atlas-outline-relation-ref]').evaluateAll((elements) =>
    elements.map((element) => element.getAttribute('data-atlas-outline-relation-ref')),
  )).size).toBe(ATLAS_RELATION_COUNT);
  await expect(page.locator('html').evaluate((element) => element.scrollWidth === element.clientWidth)).resolves.toBe(true);

  await context.close();
});
