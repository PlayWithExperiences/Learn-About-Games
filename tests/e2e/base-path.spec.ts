import { expect, test } from '@playwright/test';
import atlasNodes from '../../src/data/atlas-nodes.json' with { type: 'json' };
import atlasRelations from '../../src/data/atlas-relations.json' with { type: 'json' };
import capabilities from '../../src/data/capabilities.json' with { type: 'json' };
import knowledgeTopics from '../../src/data/knowledge-topics.json' with { type: 'json' };
import resourceTopics from '../../src/data/resource-topics.json' with { type: 'json' };
import sources from '../../src/data/sources.json' with { type: 'json' };

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
    'resources/topics/playtesting/',
    'resources/',
    'atlas/',
    'project/roadmap/',
  ];

  for (const route of routes) {
    const response = await request.get(route);
    expect(response.status(), route).toBe(200);
  }

  for (const capability of capabilities) {
    const response = await request.get(`capabilities/${capability.id}/`);
    expect(response.status(), capability.id).toBe(200);
  }

  for (const topic of knowledgeTopics) {
    const response = await request.get(`topics/${topic.id}/`);
    expect(response.status(), topic.id).toBe(200);
  }

  for (const topic of resourceTopics) {
    const response = await request.get(`resources/topics/${topic.id}/`);
    expect(response.status(), topic.id).toBe(200);
  }

  for (const source of sources) {
    const response = await request.get(`sources/${source.id}/`);
    expect(response.status(), source.id).toBe(200);
  }

  const retiredTrailArtifact = await request.get('trails/playtesting-foundations/');
  expect(retiredTrailArtifact.status()).toBe(200);
  await page.goto('./trails/playtesting-foundations/');
  await expect(page).toHaveURL(/\/resources\/topics\/playtesting\/$/);

  const unknownTrail = await request.get('trails/not-a-real-trail/');
  expect(unknownTrail.status()).toBe(404);

  await page.goto('./careers/');
  await expect(page).toHaveURL(/\/Learn-About-Games\/map\/#career-lenses$/);

  const stylesheetHref = await page.locator('link[rel="stylesheet"]').first().getAttribute('href');
  if (!stylesheetHref) {
    throw new Error('The homepage does not link to a built stylesheet.');
  }

  const stylesheet = await request.get(stylesheetHref);
  expect(stylesheet.status(), stylesheetHref).toBe(200);

  await page.goto('./atlas/network/');
  const atlasDetailHrefs = await page.locator('[data-atlas-node-link], [data-atlas-relation-link]').evaluateAll((links) =>
    links.map((link) => link.getAttribute('href')),
  );
  expect(atlasDetailHrefs).toHaveLength(atlasNodes.length + atlasRelations.length);
  expect(atlasDetailHrefs.every((href) => href?.startsWith('#atlas-'))).toBe(true);
});
