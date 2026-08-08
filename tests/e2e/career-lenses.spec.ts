import { expect, test } from '@playwright/test';
import capabilities from '../../src/data/capabilities.json' with { type: 'json' };
import resources from '../../src/data/resources.json' with { type: 'json' };
import roleProfiles from '../../src/data/role-profiles.json' with { type: 'json' };

const approvedTitles = [
  'AAA · Game Designer',
  'AAA · Creative Director',
  'Indie · Solo Developer',
];
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
const priorityBorderStyles = {
  core: 'solid',
  important: 'dashed',
  suggested: 'dotted',
};

test('server renders three explicit disabled choices, then enables them without changing the complete map', async ({ page, request }) => {
  const response = await request.get('careers/');
  expect(response.status()).toBe(200);
  const html = await response.text();

  const serverLensButtons = html.match(/<button[^>]*data-career-lens-button[^>]*>/g) ?? [];
  expect(serverLensButtons).toHaveLength(3);
  expect(serverLensButtons.every((button) => /\sdisabled(?:\s|>)/.test(button))).toBe(true);
  expect(html).not.toContain('data-career-lens-select');

  await page.setViewportSize({ width: 1440, height: 1100 });
  await page.goto('./careers/');

  const explorer = page.locator('[data-career-explorer]');
  const lensButtons = explorer.locator('[data-career-lens-button]');
  await expect(lensButtons).toHaveCount(3);
  await expect(lensButtons).toHaveText(approvedTitles);
  for (const title of approvedTitles) {
    await expect(explorer.getByRole('button', { name: title, exact: true })).toBeEnabled();
  }
  await expect(explorer.locator('[data-career-clear]')).toBeDisabled();
  await expect(explorer.locator('select')).toHaveCount(0);

  const desktopNodes = explorer.locator('[data-capability-map-canvas] [data-career-node]');
  const mobileNodes = explorer.locator('[data-mobile-map-outline] [data-career-node]');
  await expect(desktopNodes).toHaveCount(capabilities.length);
  await expect(mobileNodes).toHaveCount(capabilities.length);
  await expect(explorer.locator('[data-role-priority]')).toHaveCount(0);
  await expect(explorer.locator('[data-role-responsibility]')).toHaveCount(0);
  await expect(explorer.locator('[data-role-state]')).toHaveCount(0);
  await expect(explorer.locator('[data-career-summary]:not([hidden])')).toHaveCount(0);
  await expect(page.locator('main')).not.toContainText(/评分|分数|匹配度|完成率|雷达|score|percentage|\bfit\b|completion/i);
  await expect(explorer.locator('[data-learning-order], [data-career-path]')).toHaveCount(0);
});

for (const profile of roleProfiles) {
  test(`applies and clears ${profile.title['zh-CN']} as a factual overlay`, async ({ page }) => {
    await page.addInitScript(({ key, value }) => window.localStorage.setItem(key, value), {
      key: progressStorageKey,
      value: savedProgress,
    });
    await page.setViewportSize({ width: 1440, height: 1100 });
    await page.goto('./careers/');

    const explorer = page.locator('[data-career-explorer]');
    const desktopMap = explorer.locator('[data-capability-map-canvas]');
    const desktopNodes = desktopMap.locator('[data-career-node]');
    const selectedButton = explorer.getByRole('button', { name: profile.title['zh-CN'], exact: true });
    await selectedButton.click();

    await expect(selectedButton).toHaveAttribute('aria-pressed', 'true');
    await expect(desktopNodes).toHaveCount(capabilities.length);
    await expect(desktopMap.locator('[data-role-priority]')).toHaveCount(profile.capabilities.length);
    await expect(desktopMap.locator('[data-role-state="unlisted"]')).toHaveCount(
      capabilities.length - profile.capabilities.length,
    );
    await expect(desktopMap.locator('[data-role-state="unlisted"][data-role-priority]')).toHaveCount(0);
    expect(
      await desktopNodes.evaluateAll((nodes) => nodes.every((node) => {
        const style = getComputedStyle(node);
        return style.display !== 'none' && style.visibility !== 'hidden';
      })),
    ).toBe(true);

    for (const priority of ['core', 'important', 'suggested'] as const) {
      const expected = profile.capabilities.filter((item) => item.priority === priority).length;
      const mappedNodes = desktopMap.locator(`[data-role-priority="${priority}"]`);
      await expect(mappedNodes).toHaveCount(expected);
      await expect(mappedNodes.locator('[data-role-label]:not([hidden])')).toHaveCount(expected);
      await expect(mappedNodes.locator('[data-role-label]').first()).toHaveText(priorityLabels[priority]);
      expect(await mappedNodes.first().evaluate((node) => getComputedStyle(node).borderTopStyle)).toBe(
        priorityBorderStyles[priority],
      );
    }

    for (const mappedCapability of profile.capabilities) {
      const node = desktopMap.locator(`[data-career-node][data-capability-id="${mappedCapability.capabilityId}"]`);
      await expect(node).toHaveAttribute('data-role-priority', mappedCapability.priority);
      await expect(node).toHaveAttribute('data-role-responsibility', mappedCapability.responsibility);
    }

    const summary = explorer.locator(`[data-career-summary="${profile.id}"]`);
    await expect(summary).toBeVisible();
    await expect(summary.locator('[data-career-summary-group]')).toHaveCount(3);
    await expect(summary.locator('[data-career-summary-item]')).toHaveCount(profile.capabilities.length);

    const firstMapped = profile.capabilities[0];
    const firstCapability = capabilities.find(({ id }) => id === firstMapped.capabilityId);
    if (!firstCapability) throw new Error(`Missing capability ${firstMapped.capabilityId}`);
    const directResourceCount = resources.filter(({ capabilityIds }) =>
      capabilityIds.includes(firstMapped.capabilityId),
    ).length;
    const firstSummaryItem = summary.locator(`[data-career-summary-item="${firstMapped.capabilityId}"]`);
    await expect(firstSummaryItem).toContainText(`直接相关 Work Item ${directResourceCount} 条`);
    await expect(firstSummaryItem.getByRole('link', { name: '能力详情', exact: true })).toHaveAttribute(
      'href',
      `/Learn-About-Games/capabilities/${firstMapped.capabilityId}/`,
    );
    await expect(firstSummaryItem.getByRole('link', { name: '相关资源', exact: true })).toHaveAttribute(
      'href',
      `/Learn-About-Games/resources/?capability=${firstMapped.capabilityId}`,
    );
    await firstSummaryItem.getByRole('button', { name: '在地图中聚焦', exact: true }).click();
    const desktopFocusTarget = desktopMap.locator(`[data-career-focus-target][data-capability-id="${firstMapped.capabilityId}"]`);
    await expect(desktopFocusTarget).toBeFocused();
    await expect(desktopFocusTarget).toBeInViewport();

    const evidence = explorer.locator(`[data-career-evidence="${profile.id}"]`);
    await expect(evidence).toBeVisible();
    await expect(evidence).toContainText(profile.basis['zh-CN']);
    await expect(evidence).toContainText(profile.caveats['zh-CN']);
    await expect(evidence).toContainText(`最近复核：${profile.reviewedAt}`);
    await expect(evidence.getByRole('link')).toHaveCount(profile.basisLinks.length);
    expect(await page.evaluate((key) => window.localStorage.getItem(key), progressStorageKey)).toBe(savedProgress);

    await explorer.locator('[data-career-clear]').click();
    await expect(desktopNodes).toHaveCount(capabilities.length);
    await expect(explorer.locator('[data-role-priority]')).toHaveCount(0);
    await expect(explorer.locator('[data-role-responsibility]')).toHaveCount(0);
    await expect(explorer.locator('[data-role-state]')).toHaveCount(0);
    await expect(explorer.locator('[data-role-label]:not([hidden])')).toHaveCount(0);
    await expect(summary).toBeHidden();
    await expect(selectedButton).toHaveAttribute('aria-pressed', 'false');
    await expect(explorer.locator('[data-career-clear]')).toBeDisabled();
    expect(await page.evaluate((key) => window.localStorage.getItem(key), progressStorageKey)).toBe(savedProgress);
  });
}

test('keeps the same lens semantics in the 320px relationship outline', async ({ page }) => {
  const profile = roleProfiles.find(({ id }) => id === 'aaa-creative-director');
  if (!profile) throw new Error('Missing AAA Creative Director profile');

  await page.setViewportSize({ width: 320, height: 900 });
  await page.goto('./careers/');
  const explorer = page.locator('[data-career-explorer]');
  await explorer.getByRole('button', { name: profile.title['zh-CN'], exact: true }).click();

  const outline = explorer.locator('[data-mobile-map-outline]');
  const outlineNodes = outline.locator('[data-career-node]');
  await expect(outline).toBeVisible();
  await expect(outlineNodes).toHaveCount(capabilities.length);
  await expect(outline.locator('[data-role-priority]')).toHaveCount(profile.capabilities.length);
  await expect(outline.locator('[data-role-state="unlisted"]')).toHaveCount(
    capabilities.length - profile.capabilities.length,
  );

  for (const priority of ['core', 'important', 'suggested'] as const) {
    const node = outline.locator(`[data-role-priority="${priority}"]`).first();
    await expect(node.locator('[data-role-label]')).toBeVisible();
    await expect(node.locator('[data-role-label]')).toHaveText(priorityLabels[priority]);
    expect(await node.evaluate((element) => getComputedStyle(element).borderTopStyle)).toBe(
      priorityBorderStyles[priority],
    );
  }

  const focusId = profile.capabilities[0].capabilityId;
  await explorer
    .locator(`[data-career-summary-item="${focusId}"]`)
    .getByRole('button', { name: '在地图中聚焦', exact: true })
    .click();
  const mobileFocusTarget = outline.locator(`[data-career-focus-target][data-capability-id="${focusId}"]`);
  await expect(mobileFocusTarget).toBeFocused();
  await expect(mobileFocusTarget).toBeInViewport();
  await expect(page.locator('html').evaluate((element) => element.scrollWidth === element.clientWidth)).resolves.toBe(true);
  await expect(page.locator('body').evaluate((element) => element.scrollWidth === element.clientWidth)).resolves.toBe(true);
});

test('keeps evidence and the full map readable without JavaScript', async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false, viewport: { width: 320, height: 900 } });
  const page = await context.newPage();
  await page.goto('./careers/');

  const explorer = page.locator('[data-career-explorer]');
  await expect(explorer.locator('[data-career-lens-button]')).toHaveCount(3);
  for (const title of approvedTitles) {
    await expect(explorer.getByRole('button', { name: title, exact: true })).toBeDisabled();
  }
  await expect(explorer.getByText('启用 JavaScript 后可以应用或清除职业画像；完整地图与公开依据仍可阅读。', { exact: true })).toBeVisible();
  await expect(explorer.locator('[data-mobile-map-outline] [data-career-node]')).toHaveCount(capabilities.length);
  await expect(explorer.locator('[data-role-priority]')).toHaveCount(0);

  for (const profile of roleProfiles) {
    const evidence = explorer.locator(`[data-career-evidence="${profile.id}"]`);
    await evidence.locator('summary').click();
    await expect(evidence).toContainText(profile.basis['zh-CN']);
    await expect(evidence).toContainText(profile.caveats['zh-CN']);
    await expect(evidence.getByRole('link')).toHaveCount(profile.basisLinks.length);
  }
  await expect(page.locator('html').evaluate((element) => element.scrollWidth === element.clientWidth)).resolves.toBe(true);
  await context.close();
});
