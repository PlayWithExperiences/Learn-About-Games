import { describe, expect, it } from 'vitest';

import atlasEvidence from '../../src/data/atlas-evidence.json';
import atlasGenreFamilies from '../../src/data/atlas-genre-families.json';
import atlasNodes from '../../src/data/atlas-nodes.json';
import atlasRelations from '../../src/data/atlas-relations.json';
import atlasTags from '../../src/data/atlas-tags.json';
import atlasThemes from '../../src/data/atlas-themes.json';
import type { Catalog } from '../../src/lib/catalog/validate';
import {
  atlasScaleBounds,
  buildAtlasNodeIndex,
  buildAtlasLayout,
  buildAtlasEventPerspective,
  buildAtlasEventTimeline,
  clampAtlasScale,
  filterAtlasNodeIndex,
  fitAtlasScale,
  groupAtlasNodesByEra,
  indexAtlasRelations,
  matchAtlasTheme,
  pointOnAtlasNodeBoundary,
  projectAtlasScrollAnchor,
  projectAtlasPointerAnchor,
  scaleAtlasWheelTarget,
  sortAtlasNodeIndex,
  stepAtlasScale,
} from '../../src/lib/atlas-network';

const typedAtlasNodes = atlasNodes as Catalog['atlasNodes'];
const typedAtlasRelations = atlasRelations as Catalog['atlasRelations'];

type EventNodeContract = {
  id: string;
  kind: string;
  tags: string[];
  eventRole?: 'definition' | 'mechanism' | 'transformation' | 'diffusion';
  themeIds?: string[];
  mechanism?: { 'zh-CN': string };
};

type EventRelationContract = {
  id: string;
  fromId: string;
  toId: string;
  relationRole?: 'evolution' | 'carrier';
};

describe('global Atlas graph contract', () => {
  it('innovation nodes expose bounded event roles and theme ids', () => {
    const innovationEvents = atlasNodes.filter(({ kind, tags }) =>
      kind === 'innovation' && tags.includes('innovation-event')) as EventNodeContract[];

    expect(innovationEvents.length).toBeGreaterThan(0);
    for (const event of innovationEvents) {
      expect(event.eventRole, event.id).toMatch(/^(definition|mechanism|transformation|diffusion)$/);
      expect(event.themeIds?.length, event.id).toBeGreaterThan(0);
      expect(event.mechanism?.['zh-CN']?.trim().length, event.id).toBeGreaterThan(0);
    }
  });

  it('event relations distinguish evolution from carrier evidence', () => {
    const eventIds = new Set(
      (atlasNodes as EventNodeContract[])
        .filter(({ kind, tags }) => kind === 'innovation' && tags.includes('innovation-event'))
        .map(({ id }) => id),
    );
    const gameIds = new Set(atlasNodes.filter(({ kind }) => kind === 'game').map(({ id }) => id));
    const eventRelations = atlasRelations.filter(({ fromId, toId }) => eventIds.has(fromId) || eventIds.has(toId)) as EventRelationContract[];

    expect(eventRelations.length).toBeGreaterThan(0);
    for (const relation of eventRelations) {
      expect(relation.relationRole, relation.id).toMatch(/^(evolution|carrier)$/);
      if (relation.relationRole === 'carrier') {
        expect(eventIds.has(relation.fromId), relation.id).toBe(true);
        expect(gameIds.has(relation.toId), relation.id).toBe(true);
      }
      if (relation.relationRole === 'evolution') {
        expect(eventIds.has(relation.fromId), relation.id).toBe(true);
        expect(eventIds.has(relation.toId), relation.id).toBe(true);
      }
    }
  });

  it('FPS event sample has carrier closure', () => {
    const eventIds = new Set(
      (atlasNodes as EventNodeContract[])
        .filter(({ kind, tags }) => kind === 'innovation' && tags.includes('innovation-event'))
        .map(({ id }) => id),
    );
    const shooterEvents = (atlasNodes as Array<EventNodeContract & { themeIds?: string[] }>)
      .filter((node) => eventIds.has(node.id) && node.themeIds?.includes('first-person-shooter-lineage'));
    const gameIds = new Set(atlasNodes.filter(({ kind }) => kind === 'game').map(({ id }) => id));
    const carrierRelations = (atlasRelations as EventRelationContract[])
      .filter(({ relationRole, fromId }) => relationRole === 'carrier' && shooterEvents.some((event) => event.id === fromId));

    expect(shooterEvents.length).toBeGreaterThanOrEqual(2);
    expect(new Set(carrierRelations.map(({ fromId }) => fromId))).toEqual(
      new Set(shooterEvents.map(({ id }) => id)),
    );
    expect(carrierRelations.every(({ toId }) => gameIds.has(toId))).toBe(true);
  });

  it('builds a theme-filtered event timeline with evolution and carrier closure', () => {
    const timeline = buildAtlasEventTimeline(typedAtlasNodes, typedAtlasRelations, [
      'first-person-shooter-lineage',
      'first-person-shooter-lens',
    ]);

    expect(timeline.emptyState).toBe(false);
    expect(timeline.events.map(({ id }) => id)).toEqual([
      'fps-early-networked-space',
      'first-person-shooter-perspective',
      'fps-texture-mapped-first-person',
      'fps-fast-run-and-gun',
      'fps-open-modding-and-deathmatch',
      'fps-vertical-space-combat',
      'fps-networked-combat-space',
    ]);
    expect(timeline.evolutionRelations.map(({ id }) => id)).toEqual([
      'fps-early-space-to-perspective',
      'fps-fast-to-vertical-space',
      'fps-perspective-to-texture-space',
      'fps-perspective-to-vertical-space-combat',
      'fps-texture-to-fast-run-and-gun',
      'fps-vertical-to-open-modding',
      'vertical-space-combat-to-networked-space',
    ]);
    expect(timeline.carriersByEvent['fps-vertical-space-combat'].map(({ id }) => id)).toEqual(['doom']);
    expect(timeline.carriersByEvent['fps-networked-combat-space'].map(({ id }) => id)).toEqual(['half-life']);
  });

  it('returns an explicit empty timeline for a theme without events', () => {
    const timeline = buildAtlasEventTimeline(typedAtlasNodes, typedAtlasRelations, ['missing-genre']);

    expect(timeline.events).toEqual([]);
    expect(timeline.evolutionRelations).toEqual([]);
    expect(timeline.carriersByEvent).toEqual({});
    expect(timeline.emptyState).toBe(true);
  });

  it('projects a genre lens onto the complete event-first graph', () => {
    const projection = buildAtlasEventPerspective(typedAtlasNodes, typedAtlasRelations, {
      themeId: 'first-person-shooter-lineage',
    });
    const expectedEventIds = typedAtlasNodes
      .filter(({ kind, tags }) => kind === 'innovation' && tags.includes('innovation-event'))
      .sort((left, right) => left.startYear - right.startYear || left.id.localeCompare(right.id))
      .map(({ id }) => id);

    expect(projection.globalNodeIds).toEqual(typedAtlasNodes.map(({ id }) => id).sort());
    expect(projection.globalRelationIds).toEqual(typedAtlasRelations.map(({ id }) => id).sort());
    expect(projection.eventIds).toEqual(expectedEventIds);
    expect(projection.evolutionRelationIds).toEqual(
      typedAtlasRelations
        .filter(({ relationRole }) => relationRole === 'evolution')
        .map(({ id }) => id)
        .sort(),
    );
    expect(projection.highlightedNodeIds).toEqual(expect.arrayContaining([
      'first-person-shooter-perspective',
      'fps-vertical-space-combat',
      'fps-networked-combat-space',
    ]));
    expect(projection.highlightedRelationIds).toEqual(expect.arrayContaining([
      'fps-perspective-to-vertical-space-combat',
      'vertical-space-combat-to-networked-space',
    ]));
    expect(projection.carriersByEvent['fps-vertical-space-combat']).toEqual(['doom']);
    expect(projection.emptyState).toBe(false);
    expect(buildAtlasEventPerspective([...typedAtlasNodes].reverse(), [...typedAtlasRelations].reverse(), {
      themeId: 'first-person-shooter-lineage',
    })).toEqual(projection);
  });

  it('publishes the EGDS-aligned innovation events as first-class, evidenced nodes', () => {
    const eventIds = [
      'first-person-shooter-perspective',
      'lock-on-targeting-combat',
      'rpg-character-progression',
      'open-world-nonlinear-exploration',
      'procedural-run-structure',
    ];
    const events = atlasNodes.filter(({ id }) => eventIds.includes(id));

    expect(new Set(events.map(({ id }) => id))).toEqual(new Set(eventIds));
    expect(events.every(({ kind }) => kind === 'innovation' || kind === 'category')).toBe(true);
    expect(events.every(({ evidenceIds }) => evidenceIds.length > 0)).toBe(true);
    expect(events.every(({ tags }) => tags.includes('innovation-event'))).toBe(true);
    for (const event of events) {
      expect(atlasEvidence.some(({ id }) => event.evidenceIds.includes(id)), event.id).toBe(true);
      expect(
        atlasRelations.some(({ fromId, toId }) => fromId === event.id || toId === event.id),
        event.id,
      ).toBe(true);
    }
  });

  it('keeps RTS innovation mechanisms as first-class events with carrier works', () => {
    const eventIds = [
      'rts-resource-and-base-production',
      'rts-direct-unit-control',
      'rts-asymmetric-faction-design',
    ];
    const events = atlasNodes.filter(({ id }) => eventIds.includes(id));
    const evolutionRelations = atlasRelations.filter(
      ({ relationRole, fromId, toId }) =>
        relationRole === 'evolution' && eventIds.includes(fromId) && eventIds.includes(toId),
    );
    const carrierRelations = atlasRelations.filter(
      ({ relationRole, fromId, toId }) =>
        relationRole === 'carrier' && eventIds.includes(fromId) && !eventIds.includes(toId),
    );

    expect(events.map(({ id }) => id)).toEqual(eventIds);
    expect(events.every(({ eventRole, themeIds, mechanism, evidenceIds }) =>
      eventRole && themeIds.includes('real-time-strategy-lineage') && mechanism && evidenceIds.length > 0,
    )).toBe(true);
    expect(evolutionRelations.map(({ id }) => id)).toEqual([
      'rts-resource-to-direct-control',
      'rts-direct-control-to-asymmetric-factions',
    ]);
    expect(carrierRelations.map(({ toId }) => toId)).toEqual([
      'dune-ii',
      'warcraft-orcs-humans',
      'starcraft',
    ]);
  });

  it('keeps the event history broad enough to compare four development routes', () => {
    const events = atlasNodes.filter(({ kind, tags }) =>
      kind === 'innovation' && tags.includes('innovation-event'),
    );
    const evolutionRelations = atlasRelations.filter(({ relationRole }) => relationRole === 'evolution');
    const routeThemes = new Set(events.flatMap(({ themeIds = [] }) => themeIds));

    expect(events.length).toBeGreaterThanOrEqual(24);
    expect(evolutionRelations.length).toBeGreaterThanOrEqual(16);
    for (const route of [
      'first-person-shooter-lineage',
      'role-playing-lineage',
      'real-time-strategy-lineage',
      'open-world-lineage',
    ]) {
      expect(routeThemes.has(route), route).toBe(true);
    }
  });

  it('keeps the release-sized union graph within the approved bounds', () => {
    expect(atlasNodes.length).toBeGreaterThanOrEqual(84);
    expect(atlasRelations.length).toBeGreaterThanOrEqual(86);
    expect(atlasNodes).toHaveLength(84);
    expect(atlasRelations).toHaveLength(86);
  });

  it('adds bounded first-person shooter and RTS development lineages', () => {
    const nodeIds = new Set([
      'maze-war', 'catacomb-3d', 'wolfenstein-3d', 'doom', 'quake', 'half-life',
      'dune-ii', 'warcraft-orcs-humans', 'warcraft-ii', 'starcraft',
    ]);
    const relationIds = new Set([
      'catacomb-3d-to-wolfenstein-3d', 'wolfenstein-3d-to-doom',
      'doom-to-quake', 'quake-to-half-life', 'dune-ii-to-warcraft',
      'warcraft-ii-to-starcraft',
    ]);
    const evidenceIds = new Set([
      'acmi-maze-war', 'gdc-wolfenstein-postmortem', 'gdc-doom-postmortem',
      'gdc-quake-postmortem', 'valve-cabal-half-life', 'acmi-dune-ii',
      'patrick-wyatt-making-warcraft', 'blizzard-starcraft-20',
    ]);

    expect(new Set(atlasNodes.filter(({ id }) => nodeIds.has(id)).map(({ id }) => id))).toEqual(nodeIds);
    expect(new Set(atlasRelations.filter(({ id }) => relationIds.has(id)).map(({ id }) => id))).toEqual(relationIds);
    expect(new Set(atlasEvidence.filter(({ id }) => evidenceIds.has(id)).map(({ id }) => id))).toEqual(evidenceIds);
    expect(atlasThemes.find(({ id }) => id === 'first-person-shooter-lineage')?.familyIds).toEqual(['shooter']);
    expect(atlasThemes.find(({ id }) => id === 'real-time-strategy-lineage')?.familyIds).toEqual(['strategy']);
    expect(atlasRelations.some(({ fromId, toId }) =>
      fromId === 'spacewar' && toId === 'maze-war')).toBe(false);
    expect(atlasRelations.some(({ fromId, toId }) =>
      fromId === 'maze-war' && ['wolfenstein-3d', 'doom'].includes(toId))).toBe(false);
    expect(atlasNodes.filter(({ id }) => nodeIds.has(id)).every(({ summary }) =>
      !/第一款|绝对起点|the first/i.test(summary['zh-CN']))).toBe(true);
  });

  it('adds the evidence-bounded Platform and Adventure lineage batch', () => {
    const newNodeIds = new Set([
      'space-panic',
      'donkey-kong',
      'mario-bros',
      'super-mario-bros',
      'sonic-the-hedgehog',
      'celeste',
      'colossal-cave-adventure',
      'zork',
      'mystery-house',
      'kings-quest',
      'maniac-mansion',
      'secret-of-monkey-island',
    ]);
    const newRelationIds = new Set([
      'donkey-kong-to-super-mario-bros',
      'mario-bros-to-super-mario-bros',
      'colossal-cave-to-zork',
      'colossal-cave-to-mystery-house',
      'kings-quest-to-maniac-mansion',
      'maniac-mansion-to-secret-of-monkey-island',
    ]);
    const newEvidenceIds = new Set([
      'museum-of-game-space-panic',
      'strong-donkey-kong',
      'nintendo-original-super-mario-developers',
      'strong-sonic-the-hedgehog',
      'celeste-official-site',
      'strong-colossal-cave-adventure',
      'strong-kings-quest',
      'gamedeveloper-maniac-mansion-gdc',
      'lucasfilm-scumm-history',
      'nintendo-celeste-release',
      'acmi-zork',
      'strong-sierra-collection',
    ]);
    expect(new Set(atlasNodes.filter(({ id }) => newNodeIds.has(id)).map(({ id }) => id))).toEqual(newNodeIds);
    expect(new Set(atlasRelations.filter(({ id }) => newRelationIds.has(id)).map(({ id }) => id))).toEqual(newRelationIds);
    expect(new Set(atlasEvidence.filter(({ id }) => newEvidenceIds.has(id)).map(({ id }) => id))).toEqual(newEvidenceIds);
    expect(atlasNodes.find(({ id }) => id === 'celeste')?.evidenceIds).toContain(
      'nintendo-celeste-release',
    );
    expect(atlasNodes.find(({ id }) => id === 'zork')?.evidenceIds).toContain('acmi-zork');
    expect(atlasNodes.find(({ id }) => id === 'mystery-house')?.evidenceIds).toContain(
      'strong-sierra-collection',
    );
    expect(atlasNodes.find(({ id }) => id === 'space-panic')?.summary['zh-CN']).not.toMatch(
      /第一款|first platform/i,
    );
    expect(atlasRelations.some(({ fromId, toId }) =>
      fromId === 'space-panic' && toId === 'donkey-kong')).toBe(false);
    expect(atlasRelations.some(({ fromId, toId }) =>
      fromId === 'super-mario-bros' && toId === 'celeste')).toBe(false);
    expect(atlasRelations.some(({ fromId, toId }) =>
      fromId === 'super-mario-bros' && toId === 'sonic-the-hedgehog')).toBe(false);

    for (const evidence of atlasEvidence.filter(({ id }) => newEvidenceIds.has(id))) {
      expect(evidence.sourceKind, evidence.id).toBeTruthy();
      expect(evidence.institutionOrAuthor?.trim().length, evidence.id).toBeGreaterThan(0);
      expect(evidence.publicationDate?.trim().length, evidence.id).toBeGreaterThan(0);
      expect(evidence.checkedAt, evidence.id).toBe('2026-08-11');
      expect(evidence.stableId?.trim().length, evidence.id).toBeGreaterThan(0);
      expect(evidence.locator?.trim().length, evidence.id).toBeGreaterThan(0);
      expect(evidence.boundedClaim?.['zh-CN']?.trim().length, evidence.id).toBeGreaterThan(0);
    }
    for (const node of atlasNodes.filter(({ id }) => newNodeIds.has(id))) {
      expect(node.evidenceIds.some((id) => newEvidenceIds.has(id)), node.id).toBe(true);
    }
    for (const relation of atlasRelations.filter(({ id }) => newRelationIds.has(id))) {
      expect(relation.evidenceIds.some((id) => newEvidenceIds.has(id)), relation.id).toBe(true);
    }
    expect(new Set(atlasRelations
      .filter(({ id }) => newRelationIds.has(id))
      .map(({ id, status }) => `${id}:${status}`))).toEqual(new Set([
        'donkey-kong-to-super-mario-bros:confirmed',
        'mario-bros-to-super-mario-bros:confirmed',
        'colossal-cave-to-zork:credible',
        'colossal-cave-to-mystery-house:credible',
        'kings-quest-to-maniac-mansion:confirmed',
        'maniac-mansion-to-secret-of-monkey-island:confirmed',
      ]));
  });

  it('preserves the original source title and language for every evidence item', () => {
    const originalLanguages = new Set(['en', 'ja', 'fr', 'es']);

    expect(atlasEvidence).toHaveLength(76);
    for (const evidence of atlasEvidence) {
      expect(evidence).toHaveProperty('sourceTitle');
      expect(evidence).toHaveProperty('originalLanguage');
      expect(evidence.sourceTitle?.trim().length ?? 0, evidence.id).toBeGreaterThan(0);
      expect(originalLanguages.has(evidence.originalLanguage), evidence.id).toBe(true);
    }
    expect(new Set(atlasEvidence.map(({ originalLanguage }) => originalLanguage))).toEqual(
      new Set(['en', 'ja', 'fr', 'es']),
    );
    expect(atlasEvidence).toContainEqual(
      expect.objectContaining({
        id: 'konami-castlevania-ii-history',
        sourceTitle: 'ドラキュラII 呪いの封印',
        originalLanguage: 'ja',
      }),
    );
  });

  it('keeps every published Evidence item reproducibly traceable', () => {
    for (const evidence of atlasEvidence) {
      expect(evidence.url, evidence.id).toMatch(/^https?:\/\//);
      expect(evidence.sourceKind, evidence.id).toBeTruthy();
      expect(evidence.institutionOrAuthor.trim(), evidence.id).not.toBe('');
      expect(evidence.checkedAt, evidence.id).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(evidence.locator.trim(), evidence.id).not.toBe('');
      expect(evidence.boundedClaim['zh-CN'].trim(), evidence.id).not.toBe('');
    }
  });

  it('defines foundation and seven evidence lineages as tag-only lenses', () => {
    expect(atlasGenreFamilies).toHaveLength(10);
    expect(atlasThemes.map(({ id }) => id)).toEqual([
      'early-electronic-games',
      'roguelike',
      'metroidvania',
      'platform-lineage',
      'adventure-lineage',
      'first-person-shooter-lineage',
      'real-time-strategy-lineage',
      'puzzle-adventure-lineage',
      'role-playing-lineage',
      'open-world-lineage',
    ]);
    expect(
      atlasThemes.every((theme) => !('nodeIds' in theme) && !('relationIds' in theme)),
    ).toBe(true);
    expect(atlasThemes.every((theme) => Array.isArray(theme.tags) && theme.tags.length > 0)).toBe(
      true,
    );
    expect(atlasThemes.every((theme) => theme.scopeNote['zh-CN'].trim().length > 0)).toBe(true);
    expect(atlasThemes.find(({ id }) => id === 'early-electronic-games')?.familyIds).toEqual([]);
    expect(atlasThemes.find(({ id }) => id === 'early-electronic-games')?.tags).toEqual([
      'early-electronic-games-lens',
    ]);
    expect(atlasThemes.find(({ id }) => id === 'roguelike')?.familyIds).toEqual([
      'action',
      'role-playing',
    ]);
    expect(atlasThemes.find(({ id }) => id === 'metroidvania')?.familyIds).toEqual([
      'action',
      'adventure',
    ]);
  });

  it('uses one year for Games and a required range for Category Formation', () => {
    const games = atlasNodes.filter(({ kind }) => kind === 'game');
    const categories = atlasNodes.filter(({ kind }) => kind === 'category');

    expect(games.length).toBeGreaterThan(0);
    expect(categories).toHaveLength(2);
    for (const game of games) {
      expect(game).toHaveProperty('startYear');
      expect(game).not.toHaveProperty('endYear');
      expect(game).not.toHaveProperty('year');
    }
    for (const category of categories) {
      expect(category).toHaveProperty('startYear');
      expect(category).toHaveProperty('endYear');
      expect(category.endYear).toBeGreaterThan(category.startYear);
    }
  });

  it('stores explicit relation semantics and evidence references', () => {
    const relationTypes = new Set([
      'direct-influence',
      'derived-variant',
      'fusion',
      'revival',
      'parallel-origin',
      'structural-similarity',
      'prototype-to-product',
      'commercialized-as',
      'design-response',
      'disputed',
    ]);
    const evidenceStatuses = new Set(['confirmed', 'credible', 'inferred', 'disputed']);
    const directionality = new Set(['directed', 'undirected']);

    for (const relation of atlasRelations) {
      expect(relationTypes.has(relation.type), relation.id).toBe(true);
      expect(evidenceStatuses.has(relation.status), relation.id).toBe(true);
      expect(directionality.has(relation.directionality), relation.id).toBe(true);
      expect(relation.evidenceIds.length, relation.id).toBeGreaterThan(0);
      expect(relation.tags.length, relation.id).toBeGreaterThan(0);
      expect(relation).not.toHaveProperty('evidenceStatus');
    }

    expect(atlasRelations).toContainEqual(
      expect.objectContaining({
        id: 'super-metroid-and-sotn',
        type: 'structural-similarity',
        directionality: 'undirected',
      }),
    );
  });

  it('makes every node traceable and Dead Cells part of both lenses', () => {
    for (const node of atlasNodes) {
      expect(node).toHaveProperty('evidenceIds');
      expect(node).toHaveProperty('tags');
      expect(node.evidenceIds?.length, node.id).toBeGreaterThan(0);
      expect(node.tags?.length, node.id).toBeGreaterThan(0);
      expect(Number.isInteger(node.lane), node.id).toBe(true);
    }

    expect(atlasNodes).toContainEqual(
      expect.objectContaining({
        id: 'dead-cells',
        tags: expect.arrayContaining(['roguelike-lens', 'metroidvania-lens']),
      }),
    );
  });

  it('matches node and relation tags without changing either global list', () => {
    const nodes = structuredClone(atlasNodes) as Array<{ id: string; tags: string[] }>;
    const relations = structuredClone(atlasRelations) as Array<{ id: string; tags: string[] }>;
    const beforeNodes = structuredClone(nodes);
    const beforeRelations = structuredClone(relations);
    const roguelike = atlasThemes.find(({ id }) => id === 'roguelike');
    const metroidvania = atlasThemes.find(({ id }) => id === 'metroidvania');
    const platform = atlasThemes.find(({ id }) => id === 'platform-lineage');
    const adventure = atlasThemes.find(({ id }) => id === 'adventure-lineage');
    const layoutsBefore = buildAtlasLayout(typedAtlasNodes, typedAtlasRelations);

    expect(roguelike).toBeDefined();
    expect(metroidvania).toBeDefined();
    expect(platform).toBeDefined();
    expect(adventure).toBeDefined();
    const roguelikeMatches = matchAtlasTheme(nodes, relations, roguelike!);
    const metroidvaniaMatches = matchAtlasTheme(nodes, relations, metroidvania!);
    const platformMatches = matchAtlasTheme(nodes, relations, platform!);
    const adventureMatches = matchAtlasTheme(nodes, relations, adventure!);

    for (const theme of atlasThemes) {
      const matches = matchAtlasTheme(nodes, relations, theme);
      expect(matches.nodeIds.length, `${theme.id} has no matching node`).toBeGreaterThan(0);
      expect(matches.relationIds.length, `${theme.id} has no matching relation`).toBeGreaterThan(0);
    }

    expect(roguelikeMatches.nodeIds).toEqual(expect.arrayContaining(['rogue', 'dead-cells']));
    expect(roguelikeMatches.relationIds).toEqual(
      expect.arrayContaining(['run-structure-to-dead-cells', 'spelunky-to-dead-cells']),
    );
    expect(metroidvaniaMatches.nodeIds).toEqual(expect.arrayContaining(['metroid', 'dead-cells']));
    expect(metroidvaniaMatches.relationIds).toEqual(
      expect.arrayContaining(['super-metroid-and-sotn', 'spelunky-to-dead-cells']),
    );
    expect(platformMatches.nodeIds).toEqual(
      expect.arrayContaining(['space-panic', 'super-mario-bros', 'celeste']),
    );
    expect(platformMatches.relationIds).toEqual(
      expect.arrayContaining([
        'donkey-kong-to-super-mario-bros',
        'mario-bros-to-super-mario-bros',
      ]),
    );
    expect(adventureMatches.nodeIds).toEqual(
      expect.arrayContaining(['colossal-cave-adventure', 'maniac-mansion', 'secret-of-monkey-island']),
    );
    expect(adventureMatches.relationIds).toEqual(
      expect.arrayContaining([
        'colossal-cave-to-zork',
        'kings-quest-to-maniac-mansion',
        'maniac-mansion-to-secret-of-monkey-island',
      ]),
    );
    expect(roguelikeMatches.globalNodeIds).toEqual(nodes.map(({ id }) => id));
    expect(roguelikeMatches.globalRelationIds).toEqual(relations.map(({ id }) => id));
    expect(roguelikeMatches.globalRelationIds).toContain('super-metroid-and-sotn');
    expect(nodes).toEqual(beforeNodes);
    expect(relations).toEqual(beforeRelations);
    expect(buildAtlasLayout(typedAtlasNodes, typedAtlasRelations)).toEqual(layoutsBefore);
    expect(nodes).toHaveLength(84);
    expect(relations).toHaveLength(86);
  });
});

describe('global Atlas presentation geometry', () => {
  it('labels the complete chronological projection from its 1958 origin', () => {
    const layout = buildAtlasLayout(typedAtlasNodes, typedAtlasRelations);

    expect(layout.yearTicks.map(({ year }) => year)).toEqual([
      1958,
      1960,
      1970,
      1980,
      1990,
      2000,
      2010,
      2020,
    ]);
  });

  it('maps start years monotonically and preserves the current category ranges', () => {
    const layout = buildAtlasLayout(typedAtlasNodes, typedAtlasRelations);
    const ordered = [...layout.nodes].sort(
      (left, right) => left.startYear - right.startYear || left.id.localeCompare(right.id),
    );

    for (let index = 1; index < ordered.length; index += 1) {
      const previous = ordered[index - 1];
      const current = ordered[index];
      if (current.startYear === previous.startYear) {
        expect(current.yearX, current.id).toBe(previous.yearX);
      } else {
        expect(current.yearX, current.id).toBeGreaterThan(previous.yearX);
      }
    }

    const games = layout.nodes.filter(({ kind }) => kind === 'game');
    const categories = layout.nodes.filter(({ kind }) => kind === 'category');
    expect(games.every(({ spanEndX, yearX }) => spanEndX === yearX)).toBe(true);
    expect(categories).toHaveLength(2);
    expect(categories.every(({ spanEndX, yearX }) => spanEndX > yearX)).toBe(true);
  });

  it('projects ranges for non-Game entities and rejects a ranged Game', () => {
    const rangedInnovation = buildAtlasLayout([
      {
        id: 'synthetic-ranged-innovation',
        kind: 'innovation',
        startYear: 1980,
        endYear: 1990,
        lane: 0,
      },
    ], []);
    const placedInnovation = rangedInnovation.nodes[0];

    expect(placedInnovation.spanEndX).toBeGreaterThan(placedInnovation.yearX);
    expect(placedInnovation.left).toBe(placedInnovation.yearX);
    expect(placedInnovation.width).toBeGreaterThanOrEqual(
      placedInnovation.spanEndX - placedInnovation.yearX,
    );
    expect(() => buildAtlasLayout([
      {
        id: 'invalid-ranged-game',
        kind: 'game',
        startYear: 1980,
        endYear: 1981,
        lane: 0,
      },
    ], [])).toThrow(/Game.*range/i);
  });

  it('places all nodes without collisions and terminates relations at visible node boundaries', () => {
    const layout = buildAtlasLayout(typedAtlasNodes, typedAtlasRelations);

    for (let leftIndex = 0; leftIndex < layout.nodes.length; leftIndex += 1) {
      const left = layout.nodes[leftIndex];
      for (let rightIndex = leftIndex + 1; rightIndex < layout.nodes.length; rightIndex += 1) {
        const right = layout.nodes[rightIndex];
        const overlaps =
          left.left < right.left + right.width &&
          left.left + left.width > right.left &&
          left.top < right.top + right.height &&
          left.top + left.height > right.top;
        expect(overlaps, `${left.id} overlaps ${right.id}`).toBe(false);
      }
    }

    const nodeById = new Map(layout.nodes.map((node) => [node.id, node]));
    for (const relation of layout.relations) {
      const from = nodeById.get(relation.fromId);
      const to = nodeById.get(relation.toId);
      expect(from, relation.id).toBeDefined();
      expect(to, relation.id).toBeDefined();
      const startsOnBoundary = from && pointOnAtlasNodeBoundary(relation.start, from);
      const endsOnBoundary = to && pointOnAtlasNodeBoundary(relation.end, to);
      expect(startsOnBoundary, `${relation.id} start is hidden under its source node`).toBe(true);
      expect(endsOnBoundary, `${relation.id} arrow is hidden under its target node`).toBe(true);
      expect(relation.start, relation.id).not.toEqual({ x: from?.centerX, y: from?.centerY });
      expect(relation.end, relation.id).not.toEqual({ x: to?.centerX, y: to?.centerY });
    }

    const node = layout.nodes[0];
    expect(pointOnAtlasNodeBoundary({ x: node.left, y: node.top - 1 }, node)).toBe(false);
    expect(pointOnAtlasNodeBoundary({ x: node.left + node.width + 1, y: node.top }, node)).toBe(false);
  });

  it('centers Innovation Events as the main band in category-development layout', () => {
    const worksLayout = buildAtlasLayout(typedAtlasNodes, typedAtlasRelations);
    const categoryLayout = buildAtlasLayout(typedAtlasNodes, typedAtlasRelations, {
      perspective: 'category',
    });
    const eventIds = new Set(
      typedAtlasNodes
        .filter(({ kind, tags }) => kind === 'innovation' && tags.includes('innovation-event'))
        .map(({ id }) => id),
    );
    const categoryEvents = categoryLayout.nodes.filter(({ id }) => eventIds.has(id));
    const categoryWorks = categoryLayout.nodes.filter(({ kind }) => kind !== 'innovation' && kind !== 'category');

    expect(categoryLayout.nodes.map(({ id }) => id)).toEqual(worksLayout.nodes.map(({ id }) => id));
    expect(new Set(categoryLayout.relations.map(({ id }) => id))).toEqual(
      new Set(worksLayout.relations.map(({ id }) => id)),
    );
    expect(categoryLayout.relations.map(({ id }) => id)).toContain('spelunky-to-dead-cells');

    expect(Math.min(...categoryEvents.map(({ top }) => top))).toBeGreaterThan(400);
    expect(Math.max(...categoryEvents.map(({ top, height }) => top + height))).toBeLessThan(
      Math.min(...categoryWorks.map(({ top }) => top)),
    );
    expect(Math.min(...categoryWorks.map(({ top }) => top))).toBeGreaterThan(
      Math.max(...categoryEvents.map(({ top, height }) => top + height)),
    );

    for (let leftIndex = 0; leftIndex < categoryLayout.nodes.length; leftIndex += 1) {
      const left = categoryLayout.nodes[leftIndex];
      for (let rightIndex = leftIndex + 1; rightIndex < categoryLayout.nodes.length; rightIndex += 1) {
        const right = categoryLayout.nodes[rightIndex];
        const overlaps =
          left.left < right.left + right.width &&
          left.left + left.width > right.left &&
          left.top < right.top + right.height &&
          left.top + left.height > right.top;
        expect(overlaps, `${left.id} overlaps ${right.id} in category view`).toBe(false);
      }
    }

    const nodeById = new Map(categoryLayout.nodes.map((node) => [node.id, node]));
    for (const relation of categoryLayout.relations) {
      const from = nodeById.get(relation.fromId);
      const to = nodeById.get(relation.toId);
      expect(from && pointOnAtlasNodeBoundary(relation.start, from), `${relation.id} category start`).toBe(true);
      expect(to && pointOnAtlasNodeBoundary(relation.end, to), `${relation.id} category end`).toBe(true);
    }
  });

  it('keeps Innovation Events in a central primary band with works below as evidence', () => {
    const layout = buildAtlasLayout(typedAtlasNodes, typedAtlasRelations, { perspective: 'events' });
    const eventIds = new Set(
      typedAtlasNodes
        .filter(({ kind, tags }) => kind === 'innovation' && tags.includes('innovation-event'))
        .map(({ id }) => id),
    );
    const events = layout.nodes.filter(({ id }) => eventIds.has(id));
    const works = layout.nodes.filter(({ id }) => !eventIds.has(id) && id !== 'metroidvania-term-category-formation' && id !== 'indie-metroidvania-expansion');

    expect(Math.min(...events.map(({ top }) => top))).toBeGreaterThan(200);
    expect(Math.min(...works.map(({ top }) => top))).toBeGreaterThan(
      Math.max(...events.map(({ top, height }) => top + height)),
    );
    expect(new Set(layout.nodes.map(({ id }) => id))).toEqual(new Set(typedAtlasNodes.map(({ id }) => id)));
    expect(new Set(layout.relations.map(({ id }) => id))).toEqual(new Set(typedAtlasRelations.map(({ id }) => id)));

    for (let leftIndex = 0; leftIndex < layout.nodes.length; leftIndex += 1) {
      const left = layout.nodes[leftIndex];
      for (let rightIndex = leftIndex + 1; rightIndex < layout.nodes.length; rightIndex += 1) {
        const right = layout.nodes[rightIndex];
        const overlaps =
          left.left < right.left + right.width &&
          left.left + left.width > right.left &&
          left.top < right.top + right.height &&
          left.top + left.height > right.top;
        expect(overlaps, `${left.id} overlaps in event view with ${right.id}`).toBe(false);
      }
    }

    const nodeById = new Map(layout.nodes.map((node) => [node.id, node]));
    for (const relation of layout.relations) {
      const from = nodeById.get(relation.fromId);
      const to = nodeById.get(relation.toId);
      expect(from && pointOnAtlasNodeBoundary(relation.start, from), `${relation.id} event start`).toBe(true);
      expect(to && pointOnAtlasNodeBoundary(relation.end, to), `${relation.id} event end`).toBe(true);
    }
  });

  it('requires the companion coordinate to remain within the contacted node side', () => {
    const node = { left: 120, top: 80, width: 96, height: 86 };

    expect(pointOnAtlasNodeBoundary({ x: node.left, y: node.top + node.height / 2 }, node)).toBe(true);
    expect(pointOnAtlasNodeBoundary({ x: node.left + node.width, y: node.top + node.height / 2 }, node)).toBe(true);
    expect(pointOnAtlasNodeBoundary({ x: node.left + node.width / 2, y: node.top }, node)).toBe(true);
    expect(pointOnAtlasNodeBoundary({ x: node.left + node.width / 2, y: node.top + node.height }, node)).toBe(true);

    expect(pointOnAtlasNodeBoundary({ x: node.left, y: node.top - 1 }, node)).toBe(false);
    expect(pointOnAtlasNodeBoundary({ x: node.left + node.width, y: node.top + node.height + 1 }, node)).toBe(false);
    expect(pointOnAtlasNodeBoundary({ x: node.left - 1, y: node.top }, node)).toBe(false);
    expect(pointOnAtlasNodeBoundary({ x: node.left + node.width + 1, y: node.top + node.height }, node)).toBe(false);
  });

  it('keeps relation render and outline focus order stable when source data order changes', () => {
    const reversedRelations = [...typedAtlasRelations].reverse();
    const renderedIds = buildAtlasLayout(typedAtlasNodes, typedAtlasRelations).relations.map(({ id }) => id);
    const reversedRenderedIds = buildAtlasLayout(typedAtlasNodes, reversedRelations).relations.map(({ id }) => id);
    const adjacency = indexAtlasRelations(typedAtlasNodes, typedAtlasRelations);
    const reversedAdjacency = indexAtlasRelations(typedAtlasNodes, reversedRelations);

    expect(reversedRenderedIds).toEqual(renderedIds);
    for (const node of typedAtlasNodes) {
      expect(reversedAdjacency.get(node.id)).toEqual(adjacency.get(node.id));
    }
  });

  it('builds a complete era outline with incoming, outgoing and undirected relations', () => {
    const eras = groupAtlasNodesByEra(typedAtlasNodes);
    const adjacency = indexAtlasRelations(typedAtlasNodes, typedAtlasRelations);
    const outlinedNodeIds = eras.flatMap(({ nodes }) => nodes.map(({ id }) => id));
    const outlinedRelationIds = new Set(
      [...adjacency.values()].flatMap(({ incoming, outgoing, undirected }) =>
        [...incoming, ...outgoing, ...undirected].map(({ id }) => id),
      ),
    );

    expect(eras.map(({ label }) => label)).toEqual([
      '1950-1959',
      '1960-1969',
      '1970-1979',
      '1980-1989',
      '1990-1999',
      '2000-2009',
      '2010-2019',
      '2020-2029',
    ]);
    expect(outlinedNodeIds).toHaveLength(84);
    expect(new Set(outlinedNodeIds).size).toBe(84);
    expect(outlinedRelationIds.size).toBe(86);
    expect(adjacency.get('super-metroid')?.undirected.map(({ id }) => id)).toContain(
      'super-metroid-and-sotn',
    );
    expect(adjacency.get('castlevania-symphony-of-the-night')?.undirected.map(({ id }) => id)).toContain(
      'super-metroid-and-sotn',
    );
    expect(adjacency.get('rogue')?.outgoing.map(({ id }) => id)).toContain('rogue-to-hack');
    expect(adjacency.get('hack')?.incoming.map(({ id }) => id)).toContain('rogue-to-hack');
  });
});

describe('Atlas viewport helpers', () => {
  it('maps wheel delta continuously within the Atlas bounds', () => {
    expect(scaleAtlasWheelTarget({ currentScale: 1, deltaY: -120 })).toBeCloseTo(1.1275, 3);
    expect(scaleAtlasWheelTarget({ currentScale: 1, deltaY: 120 })).toBeCloseTo(0.8869, 3);
    expect(scaleAtlasWheelTarget({ currentScale: 1, deltaY: 0 })).toBe(1);
    expect(scaleAtlasWheelTarget({ currentScale: 2, deltaY: -120 })).toBe(2);
    expect(scaleAtlasWheelTarget({ currentScale: 0.5, deltaY: 120 })).toBe(0.5);
  });

  it('preserves the logical point beneath the wheel pointer', () => {
    const before = { x: 720, y: 360 };
    const next = projectAtlasPointerAnchor({
      oldScale: 1,
      newScale: 1.2,
      scrollLeft: 300,
      scrollTop: 120,
      pointerX: 420,
      pointerY: 240,
    });
    expect((next.scrollLeft + 420) / 1.2).toBeCloseTo(before.x);
    expect((next.scrollTop + 240) / 1.2).toBeCloseTo(before.y);
  });

  it('bounds scale changes to 50% through 200% in 25% steps', () => {
    expect(atlasScaleBounds).toEqual({ min: 0.5, max: 2, step: 0.25 });
    expect(clampAtlasScale(0.1)).toBe(0.5);
    expect(clampAtlasScale(2.8)).toBe(2);
    expect(stepAtlasScale(1, -1)).toBe(0.75);
    expect(stepAtlasScale(1, 1)).toBe(1.25);
    expect(stepAtlasScale(0.5, -1)).toBe(0.5);
    expect(stepAtlasScale(2, 1)).toBe(2);
  });

  it('fits the complete scene even when that requires going below the manual zoom floor', () => {
    expect(fitAtlasScale({
      viewportWidth: 1100,
      viewportHeight: 600,
      sceneWidth: 2200,
      sceneHeight: 900,
    })).toBe(0.5);
    expect(fitAtlasScale({
      viewportWidth: 1650,
      viewportHeight: 1000,
      sceneWidth: 2200,
      sceneHeight: 900,
    })).toBe(0.75);
    expect(fitAtlasScale({
      viewportWidth: 1178,
      viewportHeight: 525,
      sceneWidth: 2200,
      sceneHeight: 1240,
    })).toBeCloseTo(525 / 1240);
    expect(fitAtlasScale({
      viewportWidth: 4400,
      viewportHeight: 1800,
      sceneWidth: 2200,
      sceneHeight: 900,
    })).toBe(2);
  });

  it('preserves the viewport center when projecting a new scale', () => {
    expect(projectAtlasScrollAnchor({
      oldScale: 1,
      newScale: 1.5,
      scrollLeft: 400,
      scrollTop: 100,
      viewportWidth: 1000,
      viewportHeight: 600,
    })).toEqual({ scrollLeft: 850, scrollTop: 300 });
  });
});

describe('Atlas node index helpers', () => {
  it('indexes localized names and bilingual searchable node and tag text', () => {
    const indexed = buildAtlasNodeIndex(atlasNodes, atlasTags);
    const runStructure = indexed.find(({ id }) => id === 'procedural-run-structure');

    expect(indexed).toHaveLength(84);
    expect(runStructure).toMatchObject({
      id: 'procedural-run-structure',
      startYear: 1980,
      name: '程序生成与单局结构',
    });
    expect(runStructure?.searchText).toContain('roguelike evidence lens');
    expect(filterAtlasNodeIndex(indexed, '单局永久死亡').map(({ id }) => id)).toContain('rogue');
    expect(filterAtlasNodeIndex(indexed, 'METROIDVANIA-LENS').map(({ id }) => id)).toContain('metroid');
  });

  it('includes optional English summaries in normalized substring search', () => {
    const indexed = buildAtlasNodeIndex([
      {
        id: 'synthetic-node',
        startYear: 2000,
        name: { 'zh-CN': '中文名称', en: 'English name' },
        summary: { 'zh-CN': '中文摘要', en: 'English summary' },
        tags: ['synthetic-tag'],
      },
    ], [
      {
        id: 'synthetic-tag',
        name: { 'zh-CN': '中文标签', en: 'English tag' },
      },
    ]);

    expect(filterAtlasNodeIndex(indexed, 'english summary').map(({ id }) => id)).toEqual([
      'synthetic-node',
    ]);
    expect(filterAtlasNodeIndex(indexed, 'english tag').map(({ id }) => id)).toEqual([
      'synthetic-node',
    ]);
  });

  it('finds localized Chinese terms', () => {
    const indexed = buildAtlasNodeIndex(atlasNodes, atlasTags);

    expect(filterAtlasNodeIndex(indexed, '恶魔城').map(({ id }) => id)).toContain(
      'castlevania-symphony-of-the-night',
    );
  });

  it('normalizes Unicode compatibility forms', () => {
    const indexed = buildAtlasNodeIndex(atlasNodes, atlasTags);

    expect(filterAtlasNodeIndex(indexed, '  ＭＥＴＲＯＩＤＶＡＮＩＡ  ').map(({ id }) => id)).toEqual(
      filterAtlasNodeIndex(indexed, 'metroidvania').map(({ id }) => id),
    );
  });

  it('preserves the complete multi-match result set', () => {
    const indexed = buildAtlasNodeIndex(atlasNodes, atlasTags);

    expect(filterAtlasNodeIndex(indexed, '单局永久死亡')).toHaveLength(6);
  });

  it('sorts time and names deterministically regardless of input order', () => {
    const indexed = buildAtlasNodeIndex(atlasNodes, atlasTags);
    const reversed = [...indexed].reverse();

    const timeSorted = sortAtlasNodeIndex(indexed, 'time');
    expect(timeSorted.map(({ startYear }) => startYear)).toEqual(
      [...timeSorted.map(({ startYear }) => startYear)].sort((left, right) => left - right),
    );
    expect(sortAtlasNodeIndex(reversed, 'time')).toEqual(timeSorted);
    expect(sortAtlasNodeIndex(reversed, 'name')).toEqual(sortAtlasNodeIndex(indexed, 'name'));
  });
});
