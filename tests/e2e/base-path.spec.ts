import { expect, test } from '@playwright/test';

const projectBasePath = '/Learn-About-Games/';

test('serves the static site and its visible internal links from the project base path', async ({ page, request }) => {
  await page.goto('./');

  const visibleInternalHrefs = await page.locator('a:visible[href^="/"]').evaluateAll((links) =>
    links.map((link) => link.getAttribute('href')),
  );

  expect(visibleInternalHrefs).not.toHaveLength(0);
  for (const href of visibleInternalHrefs) {
    expect(href?.startsWith(projectBasePath)).toBe(true);
  }

  const routes = [
    'map/',
    'capabilities/playtesting/',
    'trails/playtesting-foundations/',
    'resources/',
    'atlas/',
    'project/roadmap/',
  ];

  for (const route of routes) {
    const response = await request.get(route);
    expect(response.status(), route).toBe(200);
  }

  const stylesheetHref = await page.locator('link[rel="stylesheet"]').first().getAttribute('href');
  if (!stylesheetHref) {
    throw new Error('The homepage does not link to a built stylesheet.');
  }

  const stylesheet = await request.get(stylesheetHref);
  expect(stylesheet.status(), stylesheetHref).toBe(200);
});
