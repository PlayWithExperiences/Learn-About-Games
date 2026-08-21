import { describe, expect, it } from 'vitest';

import type { Catalog } from '../../src/lib/catalog/validate';
import { auditAtlasRoutes } from '../../src/lib/atlas-route-audit';

const localized = (value: string) => ({ 'zh-CN': value });

const makeEvent = (
  id: string,
  startYear: number,
  eventRole: 'definition' | 'mechanism' | 'transformation' | 'diffusion',
) => ({
  id,
  kind: 'innovation' as const,
  name: localized(id),
  summary: localized(`${id} summary`),
  startYear,
  lane: 0,
  tags: ['innovation-event'],
  evidenceIds: ['evidence'],
  eventRole,
  themeIds: ['route'],
  mechanism: localized(`${id} mechanism`),
});

const makeCarrierNode = (id: string, startYear: number) => ({
  id,
  kind: 'game' as const,
  name: localized(id),
  summary: localized(`${id} summary`),
  startYear,
  lane: 1,
  tags: [],
  evidenceIds: ['evidence'],
});

const makeRelation = (
  id: string,
  fromId: string,
  toId: string,
  relationRole: 'evolution' | 'carrier',
) => ({
  id,
  fromId,
  toId,
  type: 'direct-influence' as const,
  status: 'confirmed' as const,
  directionality: 'directed' as const,
  evidenceIds: ['evidence'],
  tags: [],
  summary: localized(`${id} summary`),
  relationRole,
});

const fixtureNodes = [
  makeEvent('event-a', 1980, 'definition'),
  makeEvent('event-b', 1985, 'mechanism'),
  makeEvent('event-c', 1990, 'transformation'),
  makeCarrierNode('game-a', 1980),
  makeCarrierNode('game-b', 1985),
  makeCarrierNode('game-c', 1990),
] as Catalog['atlasNodes'];

const fixtureRelations = [
  makeRelation('a-to-b', 'event-a', 'event-b', 'evolution'),
  makeRelation('b-to-c', 'event-b', 'event-c', 'evolution'),
  makeRelation('carrier-a', 'event-a', 'game-a', 'carrier'),
  makeRelation('carrier-b', 'event-b', 'game-b', 'carrier'),
  makeRelation('carrier-c', 'event-c', 'game-c', 'carrier'),
] as Catalog['atlasRelations'];

describe('auditAtlasRoutes', () => {
  it('finds a deterministic three-event route and carrier closure', () => {
    const result = auditAtlasRoutes(fixtureNodes, fixtureRelations, ['evidence'], ['route']);

    expect(result[0]).toMatchObject({
      themeId: 'route',
      complete: true,
      chain: ['event-a', 'event-b', 'event-c'],
      evolutionRelationIds: ['a-to-b', 'b-to-c'],
      carrierCoverage: { covered: 3, total: 3 },
    });
    expect(result[0].carrierRelationIds).toEqual(['carrier-a', 'carrier-b', 'carrier-c']);
  });

  it('reports an incomplete route instead of silently dropping a missing carrier', () => {
    const nodesWithoutCarrier = fixtureNodes.filter(({ id }) => id !== 'game-b');
    const relationsWithoutCarrier = fixtureRelations.filter(({ id }) => id !== 'carrier-b');
    const result = auditAtlasRoutes(
      nodesWithoutCarrier,
      relationsWithoutCarrier,
      ['evidence'],
      ['route'],
    );

    expect(result[0].complete).toBe(false);
    expect(result[0].missingCarrierEventIds).toEqual(['event-b']);
  });

  it('reports an evidence gap instead of treating an unreadable evidence set as empty proof', () => {
    const result = auditAtlasRoutes(fixtureNodes, fixtureRelations, [], ['route']);

    expect(result[0].complete).toBe(false);
    expect(result[0].missingEvidenceIds).toEqual(['evidence']);
  });

  it('keeps an empty theme distinct from an unreadable audit input', () => {
    expect(auditAtlasRoutes(fixtureNodes, fixtureRelations, ['evidence'], ['missing'])[0])
      .toMatchObject({ themeId: 'missing', complete: false, eventIds: [], chain: [] });
  });
});
