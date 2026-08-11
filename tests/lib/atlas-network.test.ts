import { describe, expect, it } from 'vitest';

import atlasEvidence from '../../src/data/atlas-evidence.json';
import atlasNodes from '../../src/data/atlas-nodes.json';
import atlasRelations from '../../src/data/atlas-relations.json';
import atlasTags from '../../src/data/atlas-tags.json';
import atlasThemes from '../../src/data/atlas-themes.json';
import type { Catalog } from '../../src/lib/catalog/validate';
import {
  atlasScaleBounds,
  buildAtlasNodeIndex,
  buildAtlasLayout,
  clampAtlasScale,
  filterAtlasNodeIndex,
  fitAtlasScale,
  groupAtlasNodesByEra,
  indexAtlasRelations,
  matchAtlasTheme,
  projectAtlasScrollAnchor,
  projectAtlasPointerAnchor,
  scaleAtlasWheelTarget,
  sortAtlasNodeIndex,
  stepAtlasScale,
} from '../../src/lib/atlas-network';

const typedAtlasNodes = atlasNodes as Catalog['atlasNodes'];
const typedAtlasRelations = atlasRelations as Catalog['atlasRelations'];

describe('global Atlas graph contract', () => {
  it('keeps the release-sized union graph within the approved bounds', () => {
    expect(atlasNodes.length).toBeGreaterThanOrEqual(25);
    expect(atlasNodes.length).toBeLessThanOrEqual(45);
    expect(atlasRelations.length).toBeGreaterThanOrEqual(15);
    expect(atlasRelations.length).toBeLessThanOrEqual(35);
    expect(atlasNodes).toHaveLength(36);
    expect(atlasRelations).toHaveLength(30);
  });

  it('preserves the original source title and language for every evidence item', () => {
    const originalLanguages = new Set(['en', 'ja', 'fr', 'es']);

    expect(atlasEvidence).toHaveLength(49);
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
    expect(nodes).toHaveLength(36);
    expect(relations).toHaveLength(30);
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
      const startsOnBoundary = from && (
        Math.abs(relation.start.x - from.left) < 0.001 ||
        Math.abs(relation.start.x - (from.left + from.width)) < 0.001 ||
        Math.abs(relation.start.y - from.top) < 0.001 ||
        Math.abs(relation.start.y - (from.top + from.height)) < 0.001
      );
      const endsOnBoundary = to && (
        Math.abs(relation.end.x - to.left) < 0.001 ||
        Math.abs(relation.end.x - (to.left + to.width)) < 0.001 ||
        Math.abs(relation.end.y - to.top) < 0.001 ||
        Math.abs(relation.end.y - (to.top + to.height)) < 0.001
      );
      expect(startsOnBoundary, `${relation.id} start is hidden under its source node`).toBe(true);
      expect(endsOnBoundary, `${relation.id} arrow is hidden under its target node`).toBe(true);
      expect(relation.start, relation.id).not.toEqual({ x: from?.centerX, y: from?.centerY });
      expect(relation.end, relation.id).not.toEqual({ x: to?.centerX, y: to?.centerY });
    }
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
    expect(outlinedNodeIds).toHaveLength(36);
    expect(new Set(outlinedNodeIds).size).toBe(36);
    expect(outlinedRelationIds.size).toBe(30);
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

  it('fits legal viewport dimensions inside the scale bounds', () => {
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
    const runStructure = indexed.find(({ id }) => id === 'roguelike-run-structure');

    expect(indexed).toHaveLength(36);
    expect(runStructure).toMatchObject({
      id: 'roguelike-run-structure',
      startYear: 1980,
      name: 'Roguelike run-based 单局结构',
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
