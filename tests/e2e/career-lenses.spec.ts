import { expect, test } from '@playwright/test';
import type { Catalog } from '../../src/lib/catalog/validate';
import capabilities from '../../src/data/capabilities.json' with { type: 'json' };
import egdsFrameworkNodes from '../../src/data/egds-framework-nodes.json' with { type: 'json' };
import rawResources from '../../src/data/resources.json' with { type: 'json' };
import roleProfiles from '../../src/data/role-profiles.json' with { type: 'json' };

const resources = rawResources as Catalog['resources'];
const progressStorageKey = 'learn-about-games:progress:v1';
const savedProgress = JSON.stringify({
  version: 1,
  capabilities: { playtesting: 'practiced' },
});
const priorityLabels = {
  core: '核心',
  important: '重要',
  suggested: '建议了解',
};
type CareerPriority = keyof typeof priorityLabels;
const forbiddenTerms = /\b(?:score|fit|gap|completion|percentage)\b|完成率|适配度|评分/i;
const displaySourceTitle = (title: string) => title.replace(/\s+[—–]\s+/g, ': ');

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

function frameworkCounts(profile: typeof roleProfiles[number]) {
  const counts = new Map<string, { core: number; important: number; suggested: number }>();
  for (const mapping of profile.capabilities) {
    const frameworkNodeId = capabilities.find(({ id }) => id === mapping.capabilityId)?.frameworkNodeId;
    if (!frameworkNodeId) throw new Error(`Missing framework container for ${mapping.capabilityId}`);
    const current = counts.get(frameworkNodeId) ?? { core: 0, important: 0, suggested: 0 };
    current[mapping.priority as CareerPriority] += 1;
    counts.set(frameworkNodeId, current);
  }
  return counts;
}

test('map route owns one EGDS map and the complete career lens control', async ({ page, request }) => {
  const response = await request.get('map/');
  expect(response.status()).toBe(200);
  const html = await response.text();

  expect(html.match(/data-egds-framework-node=/g)).toHaveLength(28);
  expect(html.match(/data-map-entity-kind="capability"/g)).toHaveLength(42);
  expect(html.match(/data-map-entity-kind="knowledge-topic"/g)).toHaveLength(12);
  expect(html.match(/data-capability-relation=/g)).toHaveLength(64);
  const careerPayload = html.match(/<script[^>]*data-career-lens-data[^>]*>(.*?)<\/script>/)?.[1] ?? '';
  expect(careerPayload).not.toMatch(forbiddenTerms);

  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto('./map/#career-lenses');
  const explorer = page.locator('[data-career-explorer]');
  await expect(page.locator('[data-egds-map]')).toHaveCount(1);
  await expect(page.locator('[data-career-lens-control]')).toHaveCount(1);
  await expect(explorer.locator('[data-career-lens-button]')).toHaveCount(3);
  await expect(explorer.locator('[data-career-lens-button]')).toHaveText(roleProfiles.map(({ title }) => title['zh-CN']));
  expect(await explorer.locator('[data-career-lens-button]').evaluateAll((buttons) =>
    buttons.every((button) => !((button as HTMLButtonElement).disabled)),
  )).toBe(true);
  await expect(explorer.locator('[data-career-clear]')).toBeDisabled();
  expect(await explorer.locator('[data-career-summary] button[data-focus-capability]').evaluateAll((buttons) =>
    buttons.every((button) => !((button as HTMLButtonElement).disabled)),
  )).toBe(true);
  await expect(explorer.locator('[data-egds-map] [data-role-priority], [data-egds-map] [data-role-responsibility]')).toHaveCount(0);
  expect(await explorer.innerText()).not.toMatch(forbiddenTerms);
});

test('uses whitespace instead of duplicate career and map divider rules', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto('./map/');

  const rules = await page.evaluate(() => {
    const read = (selector: string) => {
      const element = document.querySelector<HTMLElement>(selector);
      if (!element) return null;
      const style = getComputedStyle(element);
      return {
        top: style.borderTopWidth,
        bottom: style.borderBottomWidth,
      };
    };
    return {
      lens: read('.career-lens-control'),
      summaries: read('.career-summaries'),
      mapKey: read('.map-key'),
    };
  });

  expect(rules.lens).toEqual({ top: '0px', bottom: '0px' });
  expect(rules.summaries).toEqual({ top: '0px', bottom: '0px' });
  expect(rules.mapKey).toEqual({ top: '0px', bottom: '1px' });
});

test('legacy careers route redirects to the map career lens anchor', async ({ page }) => {
  await page.goto('./careers/');
  await expect(page).toHaveURL(/\/map\/#career-lenses$/);
  await expect(page.locator('[data-career-lens-control]')).toHaveCount(1);
  await expect(page.locator('[data-egds-map]')).toHaveCount(1);
});

test('collapses absent career evidence and reveals one full-width natural-height profile before the map', async ({ page }) => {
  const profile = roleProfiles[0];
  const capabilityId = profile.capabilities[0].capabilityId;
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('./careers/');
  const explorer = page.locator('[data-career-explorer]');
  const controls = explorer.locator('.career-lens-control');
  const disclosures = explorer.locator('.career-profile-disclosures');
  const map = page.locator('[data-egds-map]');
  const documentTop = () => map.evaluate((element) => element.getBoundingClientRect().top + window.scrollY);
  const before = await documentTop();

  await expect(disclosures).toBeHidden();
  await expect(explorer.locator('[data-career-disclosure-placeholder]')).toHaveCount(0);

  await explorer.getByRole('button', { name: profile.title['zh-CN'], exact: true }).click();
  const selectedProfile = explorer.locator(`[data-career-summary="${profile.id}"]:visible`);
  await expect(disclosures).toBeVisible();
  await expect(explorer.locator('[data-career-summary]:visible')).toHaveCount(1);
  expect(await explorer.evaluate((root) => {
    const selected = root.querySelector('[data-career-summary]:not([hidden])');
    const mapRoot = root.querySelector('[data-egds-map]');
    return Boolean(selected && mapRoot && (selected.compareDocumentPosition(mapRoot) & Node.DOCUMENT_POSITION_FOLLOWING));
  })).toBe(true);
  const controlsBox = await controls.boundingBox();
  const disclosuresBox = await disclosures.boundingBox();
  const selectedBox = await selectedProfile.boundingBox();
  if (!controlsBox || !disclosuresBox || !selectedBox) throw new Error('Missing career controls or selected profile bounds');
  expect(selectedBox.y - (controlsBox.y + controlsBox.height)).toBeLessThanOrEqual(64);
  expect(disclosuresBox.width).toBeGreaterThanOrEqual(controlsBox.width - 2);
  expect(selectedBox.width).toBeGreaterThanOrEqual(disclosuresBox.width - 2);
  expect(await disclosures.evaluate((element) => {
    const style = getComputedStyle(element);
    return {
      overflowY: style.overflowY,
      fillsContent: Math.abs(element.scrollHeight - element.clientHeight) <= 1,
    };
  })).toEqual({ overflowY: 'visible', fillsContent: true });
  await expect(selectedProfile).toContainText(profile.caveats['zh-CN']);
  await expect(selectedProfile).toContainText(profile.reviewedAt);
  await expect(selectedProfile.locator('.career-evidence__sources a')).not.toHaveCount(0);
  expect((await documentTop()) - before).toBeGreaterThan(100);

  await explorer.locator(`[data-career-summary-item="${capabilityId}"]`)
    .getByRole('button', { name: '在地图中聚焦', exact: true }).click();

  await expect(map).toHaveAttribute('data-selected-entity-key', `capability:${capabilityId}`);
});

for (const profile of roleProfiles) {
  test(`projects ${profile.title['zh-CN']} only onto its mapped capabilities and framework containers`, async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 1000 });
    await page.goto('./map/#career-lenses');
    const explorer = page.locator('[data-career-explorer]');
    const map = explorer.locator('[data-egds-map]');
    await explorer.getByRole('button', { name: profile.title['zh-CN'], exact: true }).click();

    await expect(map).toHaveAttribute('data-career-profile-id', profile.id);
    await expect(map.locator('[data-career-node][data-role-priority]')).toHaveCount(profile.capabilities.length * 2);
    await expect(map.locator('[data-career-node][data-role-state="unlisted"]')).toHaveCount(
      (capabilities.length - profile.capabilities.length) * 2,
    );
    const topics = map.locator('[data-map-entity-kind="knowledge-topic"]');
    await expect(topics).toHaveCount(12);
    await expect(topics.locator('[data-role-priority], [data-role-responsibility], [data-role-label]:not([hidden])')).toHaveCount(0);
    await expect(map.locator('[data-egds-framework-node][data-role-priority], [data-egds-framework-node][data-role-responsibility]')).toHaveCount(0);

    for (const mapping of profile.capabilities) {
      const nodes = map.locator(`[data-career-node][data-capability-id="${mapping.capabilityId}"]`);
      await expect(nodes).toHaveCount(2);
      expect(await nodes.evaluateAll((elements, expected) => elements.every((element) =>
        element.dataset.rolePriority === expected.priority
        && element.dataset.roleResponsibility === expected.responsibility
        && element.querySelector('[data-role-label]')?.textContent === expected.label,
      ), {
        priority: mapping.priority,
        responsibility: mapping.responsibility,
        label: priorityLabels[mapping.priority as CareerPriority],
      })).toBe(true);
    }

    const expectedCounts = frameworkCounts(profile);
    await expect(map.locator('[data-egds-framework-node][data-career-core-count]')).toHaveCount(28);
    for (const [frameworkNodeId, counts] of expectedCounts) {
      const framework = map.locator(`[data-egds-framework-node="${frameworkNodeId}"]`);
      await expect(framework).toHaveAttribute('data-career-core-count', String(counts.core));
      await expect(framework).toHaveAttribute('data-career-important-count', String(counts.important));
      await expect(framework).toHaveAttribute('data-career-suggested-count', String(counts.suggested));
      await expect(framework.locator('[data-career-collapsed-count]')).toHaveText(
        `核心 ${counts.core}，重要 ${counts.important}，建议了解 ${counts.suggested}`,
      );
      await expect(framework.locator('[data-career-collapsed-count]')).toBeVisible();
    }
    await expect(map.locator('[data-egds-framework-node] [data-career-collapsed-count]:not([hidden])')).toHaveCount(expectedCounts.size);
    const summary = explorer.locator(`[data-career-summary="${profile.id}"]`);
    await expect(summary).toBeVisible();
    await expect(summary).toContainText(profile.basis['zh-CN']);
    for (const mapping of profile.capabilities) {
      const count = resources.filter(({ capabilityIds }) => capabilityIds.includes(mapping.capabilityId)).length;
      await expect(summary.locator(`[data-career-summary-item="${mapping.capabilityId}"]`))
        .toContainText(`直接相关 Work Item ${count} 条`);
    }

    const evidence = explorer.locator(`[data-career-evidence="${profile.id}"]`);
    await expect(evidence).toHaveAttribute('open', '');
    await expect(evidence).toContainText(profile.basis['zh-CN']);
    await expect(evidence).toContainText(profile.caveats['zh-CN']);
    await expect(evidence).toContainText(`最近复核：${profile.reviewedAt}`);
    for (const basisLink of profile.basisLinks) {
      const link = evidence.getByRole('link', {
        name: displaySourceTitle(basisLink.title['zh-CN']),
        exact: true,
      });
      await expect(link).toBeVisible();
      await expect(link).toHaveAttribute('href', basisLink.url);
      await expect(link.locator('..')).toContainText(basisLink.sourceNote['zh-CN']);
    }
  });
}

test('responsive outline summaries mirror career fact counts and clear them without role leakage', async ({ page }) => {
  const profile = roleProfiles[0];
  const expectedCounts = frameworkCounts(profile);
  const capabilityFrameworkNodeIds = new Set(capabilities.map(({ frameworkNodeId }) => frameworkNodeId));
  const rootNodeId = egdsFrameworkNodes.find(({ kind }) => kind === 'root')?.id;
  if (!rootNodeId) throw new Error('Missing EGDS root node');
  const primaryBranchIds = egdsFrameworkNodes
    .filter(({ kind, parentNodeId }) => kind === 'branch' && parentNodeId === rootNodeId)
    .map(({ id }) => id);

  expect(primaryBranchIds).toHaveLength(5);

  for (const width of [1024, 320]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto('./careers/');
    const explorer = page.locator('[data-career-explorer]');
    const map = explorer.locator('[data-egds-map]');
    const outline = map.locator('[data-egds-outline]');
    await expect(outline.locator('[data-outline-framework-node] > summary [data-career-collapsed-count]'))
      .toHaveCount(capabilityFrameworkNodeIds.size + primaryBranchIds.length);
    for (const branchId of primaryBranchIds) {
      await expect(outline.locator(
        `[data-outline-framework-node="${branchId}"] > summary [data-career-collapsed-count]`,
      ), branchId).toHaveCount(1);
    }

    await explorer.getByRole('button', { name: profile.title['zh-CN'], exact: true }).click();
    for (const [frameworkNodeId, counts] of expectedCounts) {
      const count = outline.locator(
        `[data-outline-framework-node="${frameworkNodeId}"] > summary [data-career-collapsed-count]`,
      );
      await expect(count).toHaveText(
        `核心 ${counts.core}，重要 ${counts.important}，建议了解 ${counts.suggested}`,
      );
      await expect(count).not.toHaveAttribute('hidden', '');
    }
    await outline.locator('[data-outline-framework-node="experience-design"] > summary').click();
    await outline.locator('[data-outline-framework-node="reconstruction"] > summary').click();
    await outline.locator('[data-outline-framework-node="gameplay-challenges-lever"] > summary').click();
    await expect(outline.locator(
      '[data-outline-framework-node="gameplay-challenges-lever"] > summary [data-career-collapsed-count]',
    )).toBeVisible();
    await expect(outline.locator('[data-outline-entity-kind="knowledge-topic"] [data-role-priority], [data-outline-entity-kind="knowledge-topic"] [data-role-responsibility]'))
      .toHaveCount(0);
    await expect(outline.locator('[data-outline-framework-node][data-role-priority], [data-outline-framework-node][data-role-responsibility]'))
      .toHaveCount(0);

    await explorer.locator('[data-career-clear]').click();
    await expect(outline.locator('[data-career-collapsed-count]:not([hidden])')).toHaveCount(0);
    expect(await outline.locator('[data-career-collapsed-count]').evaluateAll((labels) =>
      labels.every((label) => label.textContent === ''),
    )).toBe(true);
  }
});

test('career and map bootstraps remain single owners when compiled modules run again on the same DOM', async ({ page }) => {
  await page.goto('./careers/');
  const explorer = page.locator('[data-career-explorer]');
  const map = explorer.locator('[data-egds-map]');
  await map.evaluate((root) => {
    root.dataset.testApplyEvents = '0';
    root.dataset.testFocusEvents = '0';
    root.addEventListener('egds-map:apply-career-lens', () => {
      root.dataset.testApplyEvents = String(Number(root.dataset.testApplyEvents) + 1);
    });
    root.addEventListener('egds-map:focus-capability', () => {
      root.dataset.testFocusEvents = String(Number(root.dataset.testFocusEvents) + 1);
    });
  });
  await page.evaluate(async () => {
    const script = Array.from(document.querySelectorAll<HTMLScriptElement>('script[type="module"]'))
      .find((candidate) => !candidate.src && candidate.textContent?.includes('data-career-explorer'));
    if (!script?.textContent) throw new Error('Missing compiled CareerExplorer module');
    await import(`data:text/javascript;charset=utf-8,${encodeURIComponent(script.textContent)}#${crypto.randomUUID()}`);
  });

  const profile = roleProfiles[0];
  await explorer.getByRole('button', { name: profile.title['zh-CN'], exact: true }).click();
  await explorer.locator(`[data-career-summary-item="${profile.capabilities[0].capabilityId}"]`)
    .getByRole('button', { name: '在地图中聚焦', exact: true }).click();
  await expect(map).toHaveAttribute('data-test-apply-events', '1');
  await expect(map).toHaveAttribute('data-test-focus-events', '1');
  await expect(explorer).toHaveAttribute('data-career-initialized', 'true');

  await page.reload();
  const reloadedExplorer = page.locator('[data-career-explorer]');
  await expect(reloadedExplorer).toHaveAttribute('data-career-initialized', 'true');
  await reloadedExplorer.getByRole('button', { name: roleProfiles[1].title['zh-CN'], exact: true }).click();
  await expect(reloadedExplorer.locator('[data-egds-map]')).toHaveAttribute('data-career-profile-id', roleProfiles[1].id);
});

test('visible career labels and unlisted names keep AA contrast and redundant priority shapes', async ({ page }) => {
  const seenPriorities = new Set<string>();
  for (const colorScheme of ['light', 'dark'] as const) {
    await page.emulateMedia({ colorScheme });
    for (const width of [1440, 320]) {
      await page.setViewportSize({ width, height: 900 });
      for (const profile of roleProfiles) {
        await page.goto('./careers/');
        const explorer = page.locator('[data-career-explorer]');
        const map = explorer.locator('[data-egds-map]');
        await explorer.getByRole('button', { name: profile.title['zh-CN'], exact: true }).click();
        const capabilityIds = [...new Map(profile.capabilities.map((mapping) => [
          capabilities.find(({ id }) => id === mapping.capabilityId)?.frameworkNodeId,
          mapping.capabilityId,
        ])).values()];

        for (const capabilityId of capabilityIds) {
          await explorer.locator(`[data-career-summary-item="${capabilityId}"]`)
            .getByRole('button', { name: '在地图中聚焦', exact: true }).click();
          const samples = await map.locator('[data-career-node]').evaluateAll((nodes) => nodes
            .filter((node) => (node as HTMLElement).checkVisibility())
            .flatMap((node) => {
              const element = node as HTMLElement;
              const target = element.dataset.roleState === 'unlisted'
                ? element.querySelector<HTMLElement>(':scope > strong')
                : element.querySelector<HTMLElement>('[data-role-label]:not([hidden])');
              if (!target?.checkVisibility()) return [];
              const targetStyle = getComputedStyle(target);
              const nodeStyle = getComputedStyle(element);
              return [{
                label: target.textContent?.trim() ?? '',
                color: targetStyle.color,
                background: nodeStyle.backgroundColor,
                priority: element.dataset.rolePriority,
                borderStyle: nodeStyle.borderTopStyle,
              }];
            }));
          expect(samples.length, `${colorScheme}/${width}/${profile.id}/${capabilityId}`).toBeGreaterThan(0);
          for (const sample of samples) {
            expect.soft(
              contrastRatio(sample.color, sample.background),
              `${colorScheme}/${width}/${profile.id}/${sample.label}`,
            ).toBeGreaterThanOrEqual(4.5);
            if (sample.priority) {
              seenPriorities.add(sample.priority);
              expect(sample.borderStyle).toBe({ core: 'solid', important: 'dashed', suggested: 'dotted' }[
                sample.priority as 'core' | 'important' | 'suggested'
              ]);
            }
          }
        }
      }
    }
  }
  expect([...seenPriorities].sort()).toEqual(['core', 'important', 'suggested']);
});

test('career summary focus delegates selection to the map and replacing a profile does not accumulate state', async ({ page }) => {
  const firstProfile = roleProfiles[0];
  const secondProfile = roleProfiles[1];
  const firstCapabilityId = firstProfile.capabilities[0].capabilityId;

  for (const width of [1440, 1024, 320]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto('./careers/');
    const explorer = page.locator('[data-career-explorer]');
    const map = explorer.locator('[data-egds-map]');
    await explorer.getByRole('button', { name: firstProfile.title['zh-CN'], exact: true }).click();
    await explorer.locator(`[data-career-summary-item="${firstCapabilityId}"]`).getByRole('button', { name: '在地图中聚焦', exact: true }).click();

    const selectedControl = map.locator(`[data-select-map-entity="capability:${firstCapabilityId}"]`).filter({ visible: true });
    await expect(map).toHaveAttribute('data-selected-entity-key', `capability:${firstCapabilityId}`);
    await expect(map.locator('[data-map-inspector]')).toBeVisible();
    await expect(selectedControl).toBeFocused();
    await expect(selectedControl).toBeInViewport();

    const secondCapabilityId = 'playtesting';
    const firstFrameworkNodeId = capabilities.find(({ id }) => id === firstCapabilityId)?.frameworkNodeId;
    const secondFrameworkNodeId = capabilities.find(({ id }) => id === secondCapabilityId)?.frameworkNodeId;
    await explorer.locator(`[data-career-summary-item="${secondCapabilityId}"]`).getByRole('button', { name: '在地图中聚焦', exact: true }).click();
    const secondControl = map.locator(`[data-select-map-entity="capability:${secondCapabilityId}"]`).filter({ visible: true });
    await expect(map).toHaveAttribute('data-selected-entity-key', `capability:${secondCapabilityId}`);
    await expect(map.locator('[data-map-inspector]')).toBeVisible();
    await expect(secondControl).toBeFocused();
    await expect(secondControl).toBeInViewport();
    if (firstFrameworkNodeId) await expect(map.locator(`[data-egds-framework-node="${firstFrameworkNodeId}"]`)).not.toHaveAttribute('data-expanded');
    if (secondFrameworkNodeId) await expect(map.locator(`[data-egds-framework-node="${secondFrameworkNodeId}"]`)).toHaveAttribute('data-expanded', 'true');

    await explorer.getByRole('button', { name: secondProfile.title['zh-CN'], exact: true }).click();
    await expect(map).toHaveAttribute('data-career-profile-id', secondProfile.id);
    await expect(map.locator('[data-career-node][data-role-priority]')).toHaveCount(secondProfile.capabilities.length * 2);
    for (const mapping of firstProfile.capabilities.filter((item) => !secondProfile.capabilities.some(
      ({ capabilityId }) => capabilityId === item.capabilityId,
    ))) {
      expect(await map.locator(`[data-career-node][data-capability-id="${mapping.capabilityId}"]`).evaluateAll(
        (elements) => elements.every((element) => !element.hasAttribute('data-role-priority')),
      )).toBe(true);
    }
  }
});

test('clear only removes career state while preserving the selected map context and local progress', async ({ page }) => {
  const profile = roleProfiles[0];
  const capabilityId = profile.capabilities[0].capabilityId;
  await page.addInitScript(({ key, value }) => window.localStorage.setItem(key, value), {
    key: progressStorageKey,
    value: savedProgress,
  });
  await page.setViewportSize({ width: 1024, height: 900 });
  await page.goto('./careers/');
  const explorer = page.locator('[data-career-explorer]');
  const map = explorer.locator('[data-egds-map]');
  await explorer.getByRole('button', { name: profile.title['zh-CN'], exact: true }).click();
  await explorer.locator(`[data-career-summary-item="${capabilityId}"]`).getByRole('button', { name: '在地图中聚焦', exact: true }).click();
  const selectedKey = `capability:${capabilityId}`;
  const selectedFramework = capabilities.find(({ id }) => id === capabilityId)?.frameworkNodeId;

  await explorer.locator('[data-career-clear]').click();
  await expect(map).not.toHaveAttribute('data-career-profile-id');
  await expect(map.locator('[data-role-state], [data-role-priority], [data-role-responsibility]')).toHaveCount(0);
  await expect(map.locator('[data-egds-framework-node] [data-career-collapsed-count]:not([hidden])')).toHaveCount(0);
  await expect(map).toHaveAttribute('data-selected-entity-key', selectedKey);
  if (selectedFramework) await expect(map.locator(`[data-egds-framework-node="${selectedFramework}"]`)).toHaveAttribute('data-expanded', 'true');
  await expect(map.locator('[data-map-inspector]')).toBeVisible();
  expect(await page.evaluate((key) => window.localStorage.getItem(key), progressStorageKey)).toBe(savedProgress);
});

test('no-JS keeps the full outline, details, resources, and evidence readable while disabling career actions', async ({ browser }) => {
  for (const viewport of [{ width: 1440, height: 1000 }, { width: 320, height: 900 }]) {
    const context = await browser.newContext({ javaScriptEnabled: false, viewport });
    const page = await context.newPage();
    await page.goto('./map/#career-lenses');
    const explorer = page.locator('[data-career-explorer]');
    expect(await explorer.locator('[data-career-lens-button]').evaluateAll((buttons) =>
      buttons.every((button) => (button as HTMLButtonElement).disabled),
    )).toBe(true);
    await expect(explorer.locator('[data-career-clear]')).toBeDisabled();
    expect(await explorer.locator('[data-focus-capability]').evaluateAll((buttons) =>
      buttons.every((button) => (button as HTMLButtonElement).disabled),
    )).toBe(true);
    await expect(explorer.getByText('启用 JavaScript 后可以应用或清除职业画像；完整地图与公开依据仍可阅读。', { exact: true })).toBeVisible();
    await expect(explorer.locator('[data-egds-outline] [data-outline-entity-kind="capability"]')).toHaveCount(42);
    await expect(explorer.locator('[data-egds-outline] [data-outline-entity-kind="knowledge-topic"]')).toHaveCount(12);
    await expect(explorer.locator('[data-egds-outline] [data-map-entity-detail]')).not.toHaveCount(0);
    await expect(explorer.locator('[data-career-evidence] a')).not.toHaveCount(0);
    const summaries = explorer.locator('[data-career-summary]');
    await expect(summaries).toHaveCount(3);
    for (const profile of roleProfiles) {
      const summary = explorer.locator(`[data-career-summary="${profile.id}"]`);
      await expect(summary.locator(':scope > summary')).toBeVisible();
      await summary.locator(':scope > summary').evaluate((element) => (element as HTMLElement).click());
      await expect(summary.locator('[data-career-summary-item]')).toHaveCount(profile.capabilities.length);
      await expect(summary.getByRole('link', { name: '能力详情', exact: true }).first()).toBeVisible();
      await expect(summary.getByRole('link', { name: '相关资源', exact: true }).first()).toBeVisible();
      await expect(summary.getByRole('button', { name: '在地图中聚焦', exact: true }).first()).toBeDisabled();
      await expect(summary.getByText('地图聚焦需要 JavaScript。', { exact: true })).toBeVisible();
      await expect(summary).toContainText(profile.caveats['zh-CN']);
      await expect(summary).toContainText(profile.reviewedAt);
      await expect(summary.locator('.career-evidence__sources a')).not.toHaveCount(0);
    }
    await expect(page.locator('html').evaluate((element) => element.scrollWidth === element.clientWidth)).resolves.toBe(true);
    await context.close();
  }
});
