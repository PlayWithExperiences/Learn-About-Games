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

  it('keeps source-linked reading routes without inventing complete causal chains', () => {
    const audits = auditAtlasRoutes(
      typedAtlasNodes,
      typedAtlasRelations,
      atlasEvidence.map(({ id }) => id),
      routeThemeIds,
    );
    // The old directed-chain audit must not count editorial comparisons as causes.
    for (const themeId of ['first-person-shooter-lineage', 'real-time-strategy-lineage']) {
      expect(audits.find(audit => audit.themeId === themeId)?.complete).toBe(false);
    }
    const evidenceIds = new Set(atlasEvidence.map(({ id }) => id));
    for (const themeId of routeThemeIds) {
      const events = typedAtlasNodes.filter(node => node.themeIds?.includes(themeId));
      expect(events.length, themeId).toBeGreaterThanOrEqual(3);
      for (const event of events) {
        expect(event.mechanism?.['zh-CN']?.trim(), event.id).toBeTruthy();
        expect(event.evidenceIds.length, event.id).toBeGreaterThan(0);
        expect(event.evidenceIds.every(id => evidenceIds.has(id)), event.id).toBe(true);
        expect(typedAtlasRelations.some(relation =>
          relation.relationRole === 'carrier' && relation.fromId === event.id &&
          typedAtlasNodes.some(node => node.id === relation.toId &&
            (node.kind === 'game' || node.kind === 'tabletop-game')),
        ), event.id).toBe(true);
      }
    }
  });
});
