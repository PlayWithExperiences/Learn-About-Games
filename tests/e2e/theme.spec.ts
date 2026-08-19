import { expect, test } from '@playwright/test';

const themeStorageKey = 'learn-about-games:theme:v1';
const lightPage = 'rgb(243, 245, 247)';
const darkPage = 'rgb(17, 24, 32)';

async function seedTheme(page: import('@playwright/test').Page, value: string | null) {
  await page.goto('./');
  await page.evaluate(({ key, preference }) => {
    if (preference === null) {
      window.localStorage.removeItem(key);
    } else {
      window.localStorage.setItem(key, preference);
    }
  }, { key: themeStorageKey, preference: value });
  await page.reload();
}

test('offers a disabled-until-bound 系统、浅色、深色外观控件', async ({ page }) => {
  await page.goto('./');

  const control = page.getByLabel('外观');
  await expect(control).toBeEnabled();
  await expect(control.locator('option')).toHaveText(['系统', '浅色', '深色']);
  expect(await control.locator('option').evaluateAll((options) => options.map((option) => option.getAttribute('value')))).toEqual([
    'system',
    'light',
    'dark',
  ]);
});

test('uses system light and dark when no explicit preference is stored', async ({ page }) => {
  await seedTheme(page, null);
  await page.emulateMedia({ colorScheme: 'light' });
  await expect(page.locator('html')).not.toHaveAttribute('data-theme');
  await expect(page.locator('body')).toHaveCSS('background-color', lightPage);

  await page.emulateMedia({ colorScheme: 'dark' });
  await page.reload();
  await expect(page.locator('html')).not.toHaveAttribute('data-theme');
  await expect(page.locator('body')).toHaveCSS('background-color', darkPage);
});

test('overrides an opposing system preference and persists after reload', async ({ page }) => {
  await seedTheme(page, null);
  await page.emulateMedia({ colorScheme: 'dark' });

  const control = page.getByLabel('外观');
  await control.selectOption('light');
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
  await expect(page.locator('body')).toHaveCSS('background-color', lightPage);
  expect(await page.evaluate((key) => window.localStorage.getItem(key), themeStorageKey)).toBe('light');

  await page.reload();
  await expect(control).toHaveValue('light');
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
  await expect(page.locator('body')).toHaveCSS('background-color', lightPage);

  await page.emulateMedia({ colorScheme: 'light' });
  await control.selectOption('dark');
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  await expect(page.locator('body')).toHaveCSS('background-color', darkPage);
});

test('falls back safely from corrupt storage and reapplies state on pageshow', async ({ page }) => {
  await seedTheme(page, '{"theme":"dark"}');
  await page.emulateMedia({ colorScheme: 'dark' });

  const control = page.getByLabel('外观');
  await expect(control).toHaveValue('system');
  await expect(page.locator('html')).not.toHaveAttribute('data-theme');
  await expect(page.locator('body')).toHaveCSS('background-color', darkPage);

  await control.selectOption('dark');
  expect(await page.evaluate((key) => window.localStorage.getItem(key), themeStorageKey)).toBe('dark');
  await page.goto('./about/');
  await page.goBack();
  await expect(control).toHaveValue('dark');
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
});

test('keeps the appearance control and all four navigation destinations within 320px', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 720 });
  await page.goto('./');

  await expect(page.getByLabel('外观')).toBeInViewport();
  const compactMenu = page.locator('details.site-nav__compact');
  await compactMenu.locator('summary').click();
  await expect(compactMenu.getByRole('link')).toHaveCount(4);
  await expect(page.locator('html').evaluate((element) => element.scrollWidth === element.clientWidth)).resolves.toBe(true);
  await expect(page.locator('body').evaluate((element) => element.scrollWidth === element.clientWidth)).resolves.toBe(true);
});

test('uses readable system colors and an honestly disabled control without JavaScript', async ({ browser }) => {
  // The no-JS resources page intentionally renders every Work Item; keep this
  // contract from timing out when the full browser matrix is under load.
  test.setTimeout(120_000);
  for (const [colorScheme, expectedPage] of [['light', lightPage], ['dark', darkPage]] as const) {
    const context = await browser.newContext({ colorScheme, javaScriptEnabled: false });
    const page = await context.newPage();
    await page.goto('./resources/');

    await expect(page.locator('body')).toHaveCSS('background-color', expectedPage);
    const compactMenu = page.locator('details.site-nav__compact');
    if (await compactMenu.isVisible()) {
      await compactMenu.locator('summary').click();
      await expect(compactMenu.getByRole('link', { name: '成长资源', exact: true })).toBeVisible();
    } else {
      await expect(page.getByRole('navigation', { name: '主导航' })).toBeVisible();
      await expect(page.getByRole('link', { name: '成长资源', exact: true })).toBeVisible();
    }
    await expect(page.getByLabel('外观')).toBeDisabled();
    await expect(page.getByText('启用 JavaScript 后可以保存外观偏好。', { exact: true })).toBeVisible();
    await context.close();
  }
});

test('keeps the 320px no-JavaScript brand, appearance control and note in non-overlapping rows', async ({ browser }, testInfo) => {
  test.skip(testInfo.project.name !== 'mobile-chromium', 'The 320px no-JavaScript header is tested once.');
  const context = await browser.newContext({
    colorScheme: 'light',
    javaScriptEnabled: false,
    viewport: { width: 320, height: 760 },
  });
  const page = await context.newPage();
  await page.goto('./atlas/');

  const boxes = await page.locator('.site-header').evaluate((header) => {
    const box = (selector: string) => {
      const rect = header.querySelector(selector)?.getBoundingClientRect();
      return rect && { left: rect.left, right: rect.right, top: rect.top, bottom: rect.bottom };
    };
    return {
      brand: box('.brand'),
      tools: box('.site-header__tools'),
      select: box('.theme-control select'),
      note: box('.theme-control__note'),
    };
  });
  expect(boxes.brand).not.toBeNull();
  expect(boxes.tools).not.toBeNull();
  expect(boxes.select).not.toBeNull();
  expect(boxes.note).not.toBeNull();
  expect(boxes.tools!.top).toBeGreaterThanOrEqual(boxes.brand!.bottom);
  for (const candidate of [boxes.brand!, boxes.tools!, boxes.select!, boxes.note!]) {
    expect(candidate.left).toBeGreaterThanOrEqual(0);
    expect(candidate.right).toBeLessThanOrEqual(320);
  }
  const selectOverlapsNote = boxes.select!.left < boxes.note!.right
    && boxes.select!.right > boxes.note!.left
    && boxes.select!.top < boxes.note!.bottom
    && boxes.select!.bottom > boxes.note!.top;
  expect(selectOverlapsNote).toBe(false);
  await expect(page.getByText('启用 JavaScript 后可以保存外观偏好。', { exact: true })).toBeVisible();
  await expect(page.locator('html').evaluate((element) => element.scrollWidth === element.clientWidth)).resolves.toBe(true);

  await context.close();
});
