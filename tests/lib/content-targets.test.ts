import { describe, expect, it } from 'vitest';

import atlasEvidence from '../../src/data/atlas-evidence.json';
import atlasNodes from '../../src/data/atlas-nodes.json';
import atlasRelations from '../../src/data/atlas-relations.json';
import resources from '../../src/data/resources.json';
import {
  normalizeCatalogUrl,
  type Catalog,
} from '../../src/lib/catalog/validate';
import { auditAtlasRoutes } from '../../src/lib/atlas-route-audit';

const typedResources = resources as Catalog['resources'];
const typedAtlasNodes = atlasNodes as Catalog['atlasNodes'];
const typedAtlasRelations = atlasRelations as Catalog['atlasRelations'];
const routeThemeIds = [
  'first-person-shooter-lineage',
  'role-playing-lineage',
  'real-time-strategy-lineage',
  'open-world-lineage',
];

describe('content targets', () => {
  it('keeps 1000+ resources addressable without duplicate canonical URLs', () => {
    expect(typedResources.length).toBeGreaterThanOrEqual(1000);
    expect(new Set(typedResources.map(({ canonicalUrl }) => normalizeCatalogUrl(canonicalUrl))).size)
      .toBe(typedResources.length);
    expect(typedResources.every(({ accessVersions, resourceTopicIds }) =>
      accessVersions.length > 0 && resourceTopicIds.length > 0,
    )).toBe(true);
  });

  it('keeps at least three complete, evidenced Atlas routes', () => {
    const audits = auditAtlasRoutes(
      typedAtlasNodes,
      typedAtlasRelations,
      atlasEvidence.map(({ id }) => id),
      routeThemeIds,
    );
    const completeRouteIds = audits.filter(({ complete }) => complete).map(({ themeId }) => themeId);

    expect(completeRouteIds.length).toBeGreaterThanOrEqual(3);
    expect(completeRouteIds).toEqual(expect.arrayContaining([
      'first-person-shooter-lineage',
      'role-playing-lineage',
      'real-time-strategy-lineage',
    ]));
  });
});
