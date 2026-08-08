import { describe, expect, it } from 'vitest';

import atlasEvidence from '../../src/data/atlas-evidence.json';
import atlasNodes from '../../src/data/atlas-nodes.json';
import atlasRelations from '../../src/data/atlas-relations.json';
import atlasThemes from '../../src/data/atlas-themes.json';
import { matchAtlasTheme } from '../../src/lib/atlas-network';

describe('global Atlas graph contract', () => {
  it('keeps the release-sized union graph within the approved bounds', () => {
    expect(atlasNodes.length).toBeGreaterThanOrEqual(25);
    expect(atlasNodes.length).toBeLessThanOrEqual(40);
    expect(atlasRelations.length).toBeGreaterThanOrEqual(15);
    expect(atlasRelations.length).toBeLessThanOrEqual(25);
    expect(atlasNodes).toHaveLength(27);
    expect(atlasRelations).toHaveLength(25);
  });

  it('preserves the original source title and language for every evidence item', () => {
    const originalLanguages = new Set(['en', 'ja', 'fr', 'es']);

    expect(atlasEvidence).toHaveLength(40);
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

  it('defines Roguelike and Metroidvania as tag-only lenses', () => {
    expect(atlasThemes.map(({ id }) => id)).toEqual(['roguelike', 'metroidvania']);
    expect(
      atlasThemes.every((theme) => !('nodeIds' in theme) && !('relationIds' in theme)),
    ).toBe(true);
    expect(atlasThemes.every((theme) => Array.isArray(theme.tags) && theme.tags.length > 0)).toBe(
      true,
    );
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

    expect(roguelike).toBeDefined();
    expect(metroidvania).toBeDefined();
    const roguelikeMatches = matchAtlasTheme(nodes, relations, roguelike!);
    const metroidvaniaMatches = matchAtlasTheme(nodes, relations, metroidvania!);

    expect(roguelikeMatches.nodeIds).toEqual(expect.arrayContaining(['rogue', 'dead-cells']));
    expect(roguelikeMatches.relationIds).toEqual(
      expect.arrayContaining(['run-structure-to-dead-cells', 'spelunky-to-dead-cells']),
    );
    expect(metroidvaniaMatches.nodeIds).toEqual(expect.arrayContaining(['metroid', 'dead-cells']));
    expect(metroidvaniaMatches.relationIds).toEqual(
      expect.arrayContaining(['super-metroid-and-sotn', 'spelunky-to-dead-cells']),
    );
    expect(nodes).toEqual(beforeNodes);
    expect(relations).toEqual(beforeRelations);
    expect(nodes).toHaveLength(27);
    expect(relations).toHaveLength(25);
  });
});
