import { expect, test } from '@playwright/test';

test('old research link points to GPA without loading or forwarding personal query state', async ({ page }) => {
  const requests: string[] = [];
  page.on('request', request => requests.push(request.url()));
  await page.goto('./ecosystem/?fit=PRIVATE_SENTINEL');
  await expect(page.getByRole('heading', { name: '研究目录已迁至 GPA' })).toBeVisible();
  const link = page.getByRole('link', { name: '查看 GPA 研究组织目录 ↗', exact: true });
  await expect(link).toHaveAttribute('href', 'https://playwithexperiences.github.io/Game-Program-Atlas/ecosystem.html');
  await expect(link).toHaveAttribute('rel', 'noreferrer');
  await expect(page.locator('iframe, [data-ecosystem], [data-centre-id]')).toHaveCount(0);
  expect(requests.some(url => url.includes('research-ecosystem.json'))).toBe(false);
});
