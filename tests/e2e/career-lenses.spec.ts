import { expect, test } from '@playwright/test';
import capabilities from '../../src/data/capabilities.json' with { type: 'json' };
import roleProfiles from '../../src/data/role-profiles.json' with { type: 'json' };

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

test('server keeps the complete EGDS map and disables only unavailable career actions', async ({ page, request }) => {
  const response = await request.get('careers/');
  expect(response.status()).toBe(200);
  const html = await response.text();

  expect(html.match(/data-egds-framework-node=/g)).toHaveLength(28);
  expect(html.match(/data-map-entity-kind="capability"/g)).toHaveLength(42);
  expect(html.match(/data-map-entity-kind="knowledge-topic"/g)).toHaveLength(12);
  expect(html.match(/data-capability-relation=/g)).toHaveLength(64);
  const careerPayload = html.match(/<script[^>]*data-career-lens-data[^>]*>(.*?)<\/script>/)?.[1] ?? '';
  expect(careerPayload).not.toMatch(forbiddenTerms);

  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto('./careers/');
  const explorer = page.locator('[data-career-explorer]');
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

for (const profile of roleProfiles) {
  test(`projects ${profile.title['zh-CN']} only onto its mapped capabilities and framework containers`, async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 1000 });
    await page.goto('./careers/');
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
    await expect(explorer.locator(`[data-career-summary="${profile.id}"]`)).toBeVisible();
  });
}

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
    await page.goto('./careers/');
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
      await summary.locator(':scope > summary').click();
      await expect(summary.locator('[data-career-summary-item]')).toHaveCount(profile.capabilities.length);
      await expect(summary.getByRole('link', { name: '能力详情', exact: true }).first()).toBeVisible();
      await expect(summary.getByRole('link', { name: '相关资源', exact: true }).first()).toBeVisible();
      await expect(summary.getByRole('button', { name: '在地图中聚焦', exact: true }).first()).toBeDisabled();
      await expect(summary.getByText('地图聚焦需要 JavaScript。', { exact: true })).toBeVisible();
    }
    await expect(page.locator('html').evaluate((element) => element.scrollWidth === element.clientWidth)).resolves.toBe(true);
    await context.close();
  }
});
