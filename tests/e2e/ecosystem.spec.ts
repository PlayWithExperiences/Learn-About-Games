import { expect, test } from '@playwright/test';

test('research navigation reuses the public catalog without forwarding private state', async ({ page }) => {
  // Do not depend on external availability in CI. Verify the integration boundary.
  await page.route('https://playwithexperiences.github.io/Game-Program-Atlas/**', route =>
    route.fulfill({ body: '<h1>Public catalog</h1>', contentType: 'text/html' }));
  await page.goto('./ecosystem/?fit=PRIVATE_SENTINEL&note=PRIVATE_NOTE');
  const catalog = page.locator('iframe');
  await expect(catalog).toHaveAttribute('src', 'https://playwithexperiences.github.io/Game-Program-Atlas/');
  await expect(catalog).toHaveAttribute('referrerpolicy', 'no-referrer');
  await expect(page.getByRole('heading', { name: '找到研究所在的地方。' })).toBeVisible();
  const outbound = await page.locator('a[href^="http"], iframe').evaluateAll(elements =>
    elements.map(element => element.getAttribute('href') || element.getAttribute('src')));
  expect(outbound.every(url => url?.startsWith('https://playwithexperiences.github.io/Game-Program-Atlas/'))).toBe(true);
  expect(outbound.join(' ')).not.toMatch(/PRIVATE_|localhost|127\.0\.0\.1/);
  await page.goto('./');
  await expect(page.getByRole('link', { name: '研究生态', exact: true }).first()).toHaveAttribute('href', '/Learn-About-Games/ecosystem/');
});
