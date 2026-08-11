import { describe, expect, it } from 'vitest';
// @ts-expect-error The application tsconfig intentionally omits Node builtin declarations.
import { readFileSync } from 'node:fs';

import capabilities from '../../src/data/capabilities.json';
import capabilityRelations from '../../src/data/capability-relations.json';
import capabilityMapSource from '../../src/components/CapabilityMap.astro?raw';
import mapGeometrySource from '../../src/lib/map-geometry.ts?raw';
import frameworkNodes from '../../src/data/egds-framework-nodes.json';
import frameworkRelations from '../../src/data/egds-framework-relations.json';
import knowledgeTopics from '../../src/data/knowledge-topics.json';
import {
  buildEgdsMapLayout,
  relationSemantics,
  type BuildEgdsMapLayoutInput,
} from '../../src/lib/map-geometry';
import type { Catalog } from '../../src/lib/catalog/validate';

const globalCssSource = readFileSync(new URL('../../src/styles/global.css', import.meta.url), 'utf8');

const egdsInput = (overrides: Partial<BuildEgdsMapLayoutInput> = {}): BuildEgdsMapLayoutInput => ({
  frameworkNodes: frameworkNodes as unknown as Catalog['egdsFrameworkNodes'],
  frameworkRelations: frameworkRelations as unknown as Catalog['egdsFrameworkRelations'],
  capabilities: capabilities as unknown as Catalog['capabilities'],
  knowledgeTopics: knowledgeTopics as unknown as Catalog['knowledgeTopics'],
  capabilityRelations: capabilityRelations as unknown as Catalog['capabilityRelations'],
  ...overrides,
});

const isOverlapping = (
  left: { x: number; y: number; width: number; height: number },
  right: { x: number; y: number; width: number; height: number },
) => left.x < right.x + right.width
  && left.x + left.width > right.x
  && left.y < right.y + right.height
  && left.y + left.height > right.y;

const allSegments = (path: string) => {
  const tokens = path.match(/[MHV]|-?\d+(?:\.\d+)?/g) ?? [];
  const segments: Array<{ x1: number; y1: number; x2: number; y2: number }> = [];
  let cursor = { x: 0, y: 0 };
  for (let index = 0; index < tokens.length;) {
    const command = tokens[index++];
    if (command === 'M') {
      cursor = { x: Number(tokens[index++]), y: Number(tokens[index++]) };
    } else if (command === 'H') {
      const next = { x: Number(tokens[index++]), y: cursor.y };
      segments.push({ x1: cursor.x, y1: cursor.y, x2: next.x, y2: next.y });
      cursor = next;
    } else if (command === 'V') {
      const next = { x: cursor.x, y: Number(tokens[index++]) };
      segments.push({ x1: cursor.x, y1: cursor.y, x2: next.x, y2: next.y });
      cursor = next;
    }
  }
  return segments;
};

const pathStartsAndEndsOnBoundaries = (
  path: string,
  from: { x: number; y: number; width: number; height: number },
  to: { x: number; y: number; width: number; height: number },
) => {
  const segments = allSegments(path);
  const first = segments[0];
  const last = segments.at(-1);
  if (!first || !last) return false;
  const onBoundary = (point: { x: number; y: number }, box: typeof from) => (
    ((point.x === box.x || point.x === box.x + box.width) && point.y >= box.y && point.y <= box.y + box.height)
    || ((point.y === box.y || point.y === box.y + box.height) && point.x >= box.x && point.x <= box.x + box.width)
  );
  return onBoundary({ x: first.x1, y: first.y1 }, from)
    && onBoundary({ x: last.x2, y: last.y2 }, to);
};

const pathStartsAndEndsAtDeclaredPorts = (
  path: string,
  fromPort: 'north' | 'east' | 'south' | 'west',
  toPort: 'north' | 'east' | 'south' | 'west',
  from: { x: number; y: number; width: number; height: number },
  to: { x: number; y: number; width: number; height: number },
) => {
  const segments = allSegments(path);
  const first = segments[0];
  const last = segments.at(-1);
  if (!first || !last) return false;
  const portPoint = (
    box: typeof from,
    side: 'north' | 'east' | 'south' | 'west',
  ) => {
    if (side === 'north') return { x: box.x + box.width / 2, y: box.y };
    if (side === 'east') return { x: box.x + box.width, y: box.y + box.height / 2 };
    if (side === 'south') return { x: box.x + box.width / 2, y: box.y + box.height };
    return { x: box.x, y: box.y + box.height / 2 };
  };
  const start = portPoint(from, fromPort);
  const end = portPoint(to, toPort);
  return first.x1 === start.x && first.y1 === start.y && last.x2 === end.x && last.y2 === end.y;
};

const pathCrossesBoxInterior = (
  path: string,
  box: { x: number; y: number; width: number; height: number },
) => allSegments(path).some((segment) => {
  const horizontalThroughInterior = segment.y1 === segment.y2
    && segment.y1 > box.y && segment.y1 < box.y + box.height
    && Math.max(Math.min(segment.x1, segment.x2), box.x) < Math.min(Math.max(segment.x1, segment.x2), box.x + box.width);
  const verticalThroughInterior = segment.x1 === segment.x2
    && segment.x1 > box.x && segment.x1 < box.x + box.width
    && Math.max(Math.min(segment.y1, segment.y2), box.y) < Math.min(Math.max(segment.y1, segment.y2), box.y + box.height);
  return horizontalThroughInterior || verticalThroughInterior;
});

it('exports only EGDS geometry after the generic layout retirement', () => {
  const retiredSymbols = [
    ['Map', 'Point'].join(''),
    ['Map', 'Bounds'].join(''),
    ['Mind', 'Map'].join(''),
    ['Capability', 'Mind', 'Map', 'Layout'].join(''),
    ['build', 'Capability', 'Mind', 'Map', 'Layout'].join(''),
    ['rectangles', 'Overlap'].join(''),
    ['isPoint', 'InsideBounds'].join(''),
    ['project', 'RelationEndpoints'].join(''),
  ];

  for (const symbol of retiredSymbols) {
    expect.soft(mapGeometrySource, symbol).not.toContain(symbol);
  }
});

it('keeps component DOM ordering independent of the host locale', () => {
  expect(capabilityMapSource).not.toContain('localeCompare');
});

it('does not ship retired generic map presentation selectors', () => {
  const retiredSelectors = [
    '.map-root-label',
    '.map-group-label',
    '.map-domain-label',
    '#support-arrow',
    ".map-relation[data-adjacent='true']",
    '.capability-map__nodes',
    '.map-node',
    '.capability-map__text',
    '.map-text-',
    '.map-outline-group',
    '.map-outline-region',
    '.map-outline-node',
  ];

  for (const selector of retiredSelectors) {
    expect.soft(globalCssSource.includes(selector), selector).toBe(false);
  }
});

describe('capability relation semantics', () => {
  it('uses directed support without declaring prerequisites and undirected complements', () => {
    expect(relationSemantics.supports.direction).toBe('forward');
    expect(relationSemantics.supports.prerequisite).toBe(false);
    expect(relationSemantics.supports.description['zh-CN']).toMatch(/不.*先修/);
    expect(relationSemantics.supports.description.en).toMatch(/not a prerequisite/i);
    expect(relationSemantics.complements.direction).toBe('mutual');
  });

  it('keeps relation rationales bilingual and complementary pairs unique', () => {
    const complementPairs = new Set<string>();

    for (const relation of capabilityRelations) {
      expect(relation.summary['zh-CN'].trim(), `${relation.id} Chinese rationale`).not.toBe('');
      expect(relation.summary.en.trim(), `${relation.id} English rationale`).not.toBe('');
      if (relation.type !== 'complements') continue;

      const pair = [relation.fromId, relation.toId].sort().join('::');
      expect(complementPairs.has(pair), `${relation.id} duplicates an undirected complement`).toBe(false);
      complementPairs.add(pair);
    }
  });

});

describe('EGDS expertise map geometry', () => {
  it('advances every containment child to the right through east-to-west ports only', () => {
    const layout = buildEgdsMapLayout(egdsInput());
    const boxesByKey = new Map(layout.frameworkBoxes.map((box) => [box.key, box]));

    for (const path of layout.structuralPaths) {
      const parent = boxesByKey.get(path.fromKey)!;
      const child = boxesByKey.get(path.toKey)!;
      expect(child.x, `${path.id} child clears parent`).toBeGreaterThanOrEqual(parent.x + parent.width + 20);
      expect(path.fromPort, `${path.id} leaves east`).toBe('east');
      expect(path.toPort, `${path.id} enters west`).toBe('west');
      expect(pathStartsAndEndsAtDeclaredPorts(path.path, path.fromPort, path.toPort, parent, child), path.id).toBe(true);
      for (const segment of allSegments(path.path).filter(({ y1, y2 }) => y1 === y2)) {
        expect(segment.x2, `${path.id} has no westward horizontal segment`).toBeGreaterThanOrEqual(segment.x1);
      }
    }
  });

  it('keeps the authored process and reconstruction levers on one continuous left-to-right path', () => {
    const layout = buildEgdsMapLayout(egdsInput());
    const boxesById = new Map(layout.frameworkBoxes.map((box) => [box.id, box]));
    const reconstruction = boxesById.get('reconstruction')!;

    expect(layout.processPaths.map(({ fromPort, toPort }) => [fromPort, toPort]))
      .toEqual([['east', 'west'], ['east', 'west'], ['east', 'west']]);
    for (const path of layout.processPaths) {
      const from = boxesById.get(path.fromKey.split(':').at(-1)!)!;
      const to = boxesById.get(path.toKey.split(':').at(-1)!)!;
      expect(to.x).toBeGreaterThanOrEqual(from.x + from.width + 20);
    }
    for (const leverId of ['narrative-lever', 'aesthetics-lever', 'gameplay-challenges-lever']) {
      expect(boxesById.get(leverId)!.x, leverId).toBeGreaterThanOrEqual(reconstruction.x + reconstruction.width + 20);
    }
  });

  it('uses deterministic overview and focus modes with expanded entities to the owner right', () => {
    const overview = buildEgdsMapLayout(egdsInput());
    const focus = buildEgdsMapLayout(egdsInput({ expandedFrameworkNodeId: 'gameplay-challenges-lever' }));
    const reversedFocus = buildEgdsMapLayout({
      frameworkNodes: [...frameworkNodes].reverse() as unknown as Catalog['egdsFrameworkNodes'],
      frameworkRelations: [...frameworkRelations].reverse() as unknown as Catalog['egdsFrameworkRelations'],
      capabilities: [...capabilities].reverse(),
      knowledgeTopics: [...knowledgeTopics].reverse(),
      capabilityRelations: [...capabilityRelations].reverse() as unknown as Catalog['capabilityRelations'],
      expandedFrameworkNodeId: 'gameplay-challenges-lever',
    });
    const owner = focus.frameworkBoxes.find(({ id }) => id === 'gameplay-challenges-lever')!;

    expect(overview).toEqual(buildEgdsMapLayout(egdsInput()));
    expect(overview).toEqual(buildEgdsMapLayout({
      frameworkNodes: [...frameworkNodes].reverse() as unknown as Catalog['egdsFrameworkNodes'],
      frameworkRelations: [...frameworkRelations].reverse() as unknown as Catalog['egdsFrameworkRelations'],
      capabilities: [...capabilities].reverse(),
      knowledgeTopics: [...knowledgeTopics].reverse(),
      capabilityRelations: [...capabilityRelations].reverse() as unknown as Catalog['capabilityRelations'],
    }));
    expect(overview.mode).toBe('overview');
    expect(focus.mode).toBe('focus');
    expect(focus.focusedBranchId).toBe('experience-design');
    expect(focus.frameworkBoxes.filter(({ kind }) => kind === 'branch')).toHaveLength(5);
    expect(focus.entityBoxes).toHaveLength(14);
    expect(focus.entityBoxes.every(({ x }) => x >= owner.x + owner.width + 20)).toBe(true);
    expect(reversedFocus).toEqual(focus);
  });

  it('preserves supports and complements source-to-target semantics in focus mode', () => {
    const selectedCapabilityId = 'rules-system-modeling';
    const layout = buildEgdsMapLayout(egdsInput({
      expandedFrameworkNodeId: 'gameplay-challenges-lever',
      selectedCapabilityId,
    }));

    for (const projected of layout.relationPaths) {
      const authored = capabilityRelations.find(({ id }) => id === projected.relationId)!;
      expect(projected.fromKey.endsWith(`:${authored.fromId}`), `${authored.id} source`).toBe(true);
      expect(projected.toKey.endsWith(`:${authored.toId}`), `${authored.id} target`).toBe(true);
      expect(projected.relationType).toBe(authored.type);
    }
  });

  it('centers the root against the primary branch field with intentional scene margins', () => {
    const layout = buildEgdsMapLayout(egdsInput());
    const root = layout.frameworkBoxes.find(({ id }) => id === 'egds-root');
    const branches = layout.frameworkBoxes.filter(({ kind }) => kind === 'branch');
    if (!root || branches.length === 0) throw new Error('Missing root or primary branches');

    const branchTop = Math.min(...branches.map(({ y }) => y));
    const branchBottom = Math.max(...branches.map(({ y, height }) => y + height));
    const rootCenter = root.y + root.height / 2;
    const branchFieldCenter = (branchTop + branchBottom) / 2;

    expect(Math.abs(rootCenter - branchFieldCenter)).toBeLessThanOrEqual(4);
    expect(layout.frameworkBoxes.every(({ x, y, width, height }) => (
      x >= 20
      && y >= 20
      && x + width <= layout.width - 20
      && y + height <= layout.height - 20
    ))).toBe(true);
  });

  it('derives five stable branch territories that contain every owned descendant', () => {
    const layout = buildEgdsMapLayout(egdsInput());
    const reversed = buildEgdsMapLayout({
      frameworkNodes: [...frameworkNodes].reverse() as unknown as Catalog['egdsFrameworkNodes'],
      frameworkRelations: [...frameworkRelations].reverse() as unknown as Catalog['egdsFrameworkRelations'],
      capabilities: [...capabilities].reverse(),
      knowledgeTopics: [...knowledgeTopics].reverse(),
      capabilityRelations: [...capabilityRelations].reverse() as unknown as Catalog['capabilityRelations'],
    });
    const nodesById = new Map(frameworkNodes.map((node) => [node.id, node]));
    const boxesById = new Map(layout.frameworkBoxes.map((box) => [box.id, box]));
    const owningBranchId = (nodeId: string) => {
      let node = nodesById.get(nodeId);
      while (node?.parentNodeId) {
        const parent = nodesById.get(node.parentNodeId);
        if (parent?.kind === 'branch') return parent.id;
        node = parent;
      }
      return undefined;
    };

    expect(layout.branchTerritories).toHaveLength(5);
    expect(reversed.branchTerritories).toEqual(layout.branchTerritories);
    expect(layout.branchTerritories.map(({ branchId }) => branchId).sort()).toEqual(
      frameworkNodes.filter(({ kind }) => kind === 'branch').map(({ id }) => id).sort(),
    );

    for (const territory of layout.branchTerritories) {
      const descendants = frameworkNodes
        .filter(({ id }) => owningBranchId(id) === territory.branchId)
        .map(({ id }) => boxesById.get(id)!);
      const descendantKeys = new Set(descendants.map(({ key }) => key));
      expect(descendants.length, territory.branchId).toBeGreaterThan(0);
      for (const box of descendants) {
        expect(box.x, `${territory.branchId} contains ${box.id} left`).toBeGreaterThanOrEqual(territory.x);
        expect(box.y, `${territory.branchId} contains ${box.id} top`).toBeGreaterThanOrEqual(territory.y);
        expect(box.x + box.width, `${territory.branchId} contains ${box.id} right`)
          .toBeLessThanOrEqual(territory.x + territory.width);
        expect(box.y + box.height, `${territory.branchId} contains ${box.id} bottom`)
          .toBeLessThanOrEqual(territory.y + territory.height);
      }
      const localPaths = [...layout.structuralPaths, ...layout.processPaths]
        .filter(({ toKey }) => descendantKeys.has(toKey));
      for (const path of localPaths) {
        const localPoints = allSegments(path.path)
          .flatMap(({ x1, y1, x2, y2 }) => [{ x: x1, y: y1 }, { x: x2, y: y2 }])
          .filter(({ x }) => x >= territory.x && x <= territory.x + territory.width);
        expect(localPoints.length, `${territory.branchId} owns ${path.id}`).toBeGreaterThan(0);
        for (const point of localPoints) {
          expect(point.y, `${territory.branchId} contains ${path.id} field top`).toBeGreaterThanOrEqual(territory.y);
          expect(point.y, `${territory.branchId} contains ${path.id} field bottom`)
            .toBeLessThanOrEqual(territory.y + territory.height);
        }
      }
    }

    for (const [index, territory] of layout.branchTerritories.entries()) {
      for (const other of layout.branchTerritories.slice(index + 1)) {
        expect(isOverlapping(territory, other), `${territory.branchId} overlaps ${other.branchId}`).toBe(false);
      }
    }

    const experienceTerritory = layout.branchTerritories.find(({ branchId }) => branchId === 'experience-design');
    expect(experienceTerritory?.nestedTerritory).toEqual(expect.objectContaining({
      id: 'experience-process',
    }));
    const nested = experienceTerritory!.nestedTerritory!;
    for (const id of [
      'perception',
      'rationalization',
      'deconstruction',
      'reconstruction',
      'narrative-lever',
      'aesthetics-lever',
      'gameplay-challenges-lever',
    ]) {
      const box = boxesById.get(id)!;
      expect(box.x, `${nested.id} contains ${id} left`).toBeGreaterThanOrEqual(nested.x);
      expect(box.y, `${nested.id} contains ${id} top`).toBeGreaterThanOrEqual(nested.y);
      expect(box.x + box.width, `${nested.id} contains ${id} right`).toBeLessThanOrEqual(nested.x + nested.width);
      expect(box.y + box.height, `${nested.id} contains ${id} bottom`).toBeLessThanOrEqual(nested.y + nested.height);
    }
  });

  it('projects the fixed overview skeleton without entities', () => {
    const layout = buildEgdsMapLayout(egdsInput());

    expect(layout.width).toBe(1180);
    expect(layout.height).toBeLessThanOrEqual(720);
    expect(layout.frameworkBoxes).toHaveLength(28);
    expect(layout.entityBoxes).toEqual([]);
    expect(layout.relationEndpointBoxes).toEqual([]);
    expect(layout.structuralPaths).toHaveLength(27);
    expect(layout.processPaths).toHaveLength(3);
    expect(layout.relationPaths).toEqual([]);
    expect(layout.externalEntries).toEqual([
      { id: 'innovation-possibility-space', targetPath: 'atlas/' },
    ]);
    expect(layout.frameworkBoxes.find(({ id }) => id === 'egds-root')).toEqual(expect.objectContaining({
      key: 'root:egds-root', kind: 'root', x: 20, y: 343, width: 130, height: 60,
    }));
    expect(layout.frameworkBoxes.find(({ id }) => id === 'experience-design')).toEqual(expect.objectContaining({
      key: 'branch:experience-design', kind: 'branch', x: 180, y: 66, width: 160, height: 54,
    }));
    expect(layout.frameworkBoxes.find(({ id }) => id === 'innovation-possibility-space')).toEqual(expect.objectContaining({
      key: 'external-entry:innovation-possibility-space', kind: 'external-entry', x: 550, y: 620, width: 360, height: 44,
    }));
  });

  it('expands exactly one framework container in stable typed-key order', () => {
    const expandedFrameworkNodeId = 'perception';
    const layout = buildEgdsMapLayout({ ...egdsInput(), expandedFrameworkNodeId });
    const expectedKeys = [...capabilities, ...knowledgeTopics]
      .filter((entity) => entity.frameworkNodeId === expandedFrameworkNodeId)
      .map((entity) => `${capabilities.includes(entity as (typeof capabilities)[number]) ? 'capability' : 'knowledge-topic'}:${entity.id}`)
      .sort();

    expect(layout.expandedFrameworkNodeId).toBe(expandedFrameworkNodeId);
    expect(layout.entityBoxes.map(({ key }) => key)).toEqual(expectedKeys);
    expect(layout.entityBoxes.every((box) => box.frameworkNodeId === expandedFrameworkNodeId)).toBe(true);
    expect(layout.frameworkBoxes.find(({ id }) => id === expandedFrameworkNodeId)).toEqual(expect.objectContaining({
      x: 360, width: 170, height: 48,
    }));
    const owner = layout.frameworkBoxes.find(({ id }) => id === expandedFrameworkNodeId)!;
    expect(layout.entityBoxes.every(({ x }) => x >= owner.x + owner.width + 20)).toBe(true);
  });

  it('is invariant to reversed input order and keeps every overview or expansion box disjoint', () => {
    const input = {
      ...egdsInput(),
      expandedFrameworkNodeId: 'rationalization',
      selectedCapabilityId: 'experience-framing',
    };
    const layout = buildEgdsMapLayout(input);
    const reversed = buildEgdsMapLayout({
      frameworkNodes: [...frameworkNodes].reverse() as unknown as Catalog['egdsFrameworkNodes'],
      frameworkRelations: [...frameworkRelations].reverse() as unknown as Catalog['egdsFrameworkRelations'],
      capabilities: [...capabilities].reverse(),
      knowledgeTopics: [...knowledgeTopics].reverse(),
      capabilityRelations: [...capabilityRelations].reverse() as unknown as Catalog['capabilityRelations'],
      expandedFrameworkNodeId: input.expandedFrameworkNodeId,
      selectedCapabilityId: input.selectedCapabilityId,
    });
    const boxes = [...layout.frameworkBoxes, ...layout.entityBoxes, ...layout.relationEndpointBoxes];

    expect(reversed).toEqual(layout);
    expect(new Set(boxes.map(({ key }) => key)).size).toBe(boxes.length);
    for (const [index, box] of boxes.entries()) {
      for (const other of boxes.slice(index + 1)) {
        expect(isOverlapping(box, other), `${box.key} overlaps ${other.key}`).toBe(false);
      }
    }
  });

  it('uses a raw code-unit total order for collation-equivalent IDs', () => {
    const decomposedId = 'e\u0301';
    const composedId = 'é';
    const selected = { ...capabilities[0]!, id: 'selected', frameworkNodeId: 'perception' };
    const decomposed = { ...capabilities[1]!, id: decomposedId, frameworkNodeId: 'rationalization' };
    const composed = { ...capabilities[2]!, id: composedId, frameworkNodeId: 'rationalization' };
    const decomposedRelation = {
      ...capabilityRelations[0]!, id: decomposedId, fromId: 'selected', toId: decomposedId,
    };
    const composedRelation = {
      ...capabilityRelations[1]!, id: composedId, fromId: 'selected', toId: composedId,
    };
    const fixture = egdsInput({
      capabilities: [selected, composed, decomposed] as unknown as Catalog['capabilities'],
      knowledgeTopics: [],
      capabilityRelations: [composedRelation, decomposedRelation] as unknown as Catalog['capabilityRelations'],
      expandedFrameworkNodeId: 'perception',
      selectedCapabilityId: 'selected',
    });
    const forward = buildEgdsMapLayout(fixture);
    const reversed = buildEgdsMapLayout({
      ...fixture,
      frameworkNodes: [...fixture.frameworkNodes].reverse(),
      frameworkRelations: [...fixture.frameworkRelations].reverse(),
      capabilities: [...fixture.capabilities].reverse(),
      capabilityRelations: [...fixture.capabilityRelations].reverse(),
    });

    expect(forward.relationEndpointBoxes.map(({ key }) => key)).toEqual([
      `relation-endpoint:${decomposedId}`,
      `relation-endpoint:${composedId}`,
    ]);
    expect(forward.relationPaths.map(({ relationId }) => relationId)).toEqual([
      decomposedId,
      composedId,
    ]);
    expect(reversed).toEqual(forward);
  });

  it('projects every populated container as exactly its typed, non-overlapping entity set', () => {
    const entityKey = (entity: (typeof capabilities)[number] | (typeof knowledgeTopics)[number]) => (
      `${capabilities.includes(entity as (typeof capabilities)[number]) ? 'capability' : 'knowledge-topic'}:${entity.id}`
    );
    const populatedFrameworkNodeIds = [...new Set([...capabilities, ...knowledgeTopics]
      .map(({ frameworkNodeId }) => frameworkNodeId))]
      .sort();

    for (const expandedFrameworkNodeId of populatedFrameworkNodeIds) {
      const layout = buildEgdsMapLayout({ ...egdsInput(), expandedFrameworkNodeId });
      const expectedKeys = [...capabilities, ...knowledgeTopics]
        .filter((entity) => entity.frameworkNodeId === expandedFrameworkNodeId)
        .map(entityKey)
        .sort();
      const boxes = [...layout.frameworkBoxes, ...layout.entityBoxes];

      expect(layout.entityBoxes.map(({ key }) => key), expandedFrameworkNodeId).toEqual(expectedKeys);
      for (const [index, box] of boxes.entries()) {
        for (const other of boxes.slice(index + 1)) {
          expect(isOverlapping(box, other), `${expandedFrameworkNodeId}:${box.key} overlaps ${other.key}`).toBe(false);
        }
      }
    }
  });

  it('rejects expansion of a known framework node that owns no entities', () => {
    expect(() => buildEgdsMapLayout(egdsInput({ expandedFrameworkNodeId: 'egds-root' }))).toThrow(
      /does not contain capabilities or knowledge topics/i,
    );
    expect(() => buildEgdsMapLayout(egdsInput({
      expandedFrameworkNodeId: 'innovation-possibility-space',
    }))).toThrow(/does not contain capabilities or knowledge topics/i);
  });

  it('rejects duplicate topic identities while preserving distinct typed keys for matching raw entity IDs', () => {
    const duplicateTopics = [...knowledgeTopics, knowledgeTopics[0]!];
    expect(() => buildEgdsMapLayout(egdsInput({
      knowledgeTopics: duplicateTopics as unknown as Catalog['knowledgeTopics'],
    }))).toThrow(/duplicate knowledge topic/i);

    const sharedCapability = { ...capabilities[0]!, id: 'shared-egds-entity', frameworkNodeId: 'perception' };
    const sharedTopic = { ...knowledgeTopics[0]!, id: 'shared-egds-entity', frameworkNodeId: 'perception' };
    const layout = buildEgdsMapLayout(egdsInput({
      capabilities: [sharedCapability] as unknown as Catalog['capabilities'],
      knowledgeTopics: [sharedTopic] as unknown as Catalog['knowledgeTopics'],
      capabilityRelations: [],
      expandedFrameworkNodeId: 'perception',
    }));

    expect(layout.entityBoxes.map(({ key }) => key)).toEqual([
      'capability:shared-egds-entity',
      'knowledge-topic:shared-egds-entity',
    ]);
  });

  it('derives containment only from parentNodeId and routes structural and process paths through clear boundaries', () => {
    const unrelatedRelations = frameworkRelations.filter(({ type }) => type !== 'process-next');
    const layout = buildEgdsMapLayout(egdsInput({
      frameworkRelations: unrelatedRelations as unknown as Catalog['egdsFrameworkRelations'],
    }));
    const boxesByKey = new Map<string, (typeof layout.frameworkBoxes)[number]>(
      layout.frameworkBoxes.map((box) => [box.key, box]),
    );

    expect(layout.structuralPaths).toHaveLength(27);
    expect(layout.processPaths).toEqual([]);
    for (const path of layout.structuralPaths) {
      const from = boxesByKey.get(path.fromKey)!;
      const to = boxesByKey.get(path.toKey)!;
      const declared = path as typeof path & {
        fromPort?: 'north' | 'east' | 'south' | 'west';
        toPort?: 'north' | 'east' | 'south' | 'west';
      };
      expect(declared.fromPort, `${path.id} from port`).toBeDefined();
      expect(declared.toPort, `${path.id} to port`).toBeDefined();
      expect(pathStartsAndEndsOnBoundaries(path.path, from, to), path.id).toBe(true);
      expect(pathStartsAndEndsAtDeclaredPorts(path.path, declared.fromPort!, declared.toPort!, from, to), path.id)
        .toBe(true);
      for (const box of layout.frameworkBoxes.filter((candidate) => candidate.key !== path.fromKey && candidate.key !== path.toKey)) {
        expect(allSegments(path.path).some((segment) => {
          const horizontalThroughInterior = segment.y1 === segment.y2
            && segment.y1 > box.y && segment.y1 < box.y + box.height
            && Math.max(Math.min(segment.x1, segment.x2), box.x) < Math.min(Math.max(segment.x1, segment.x2), box.x + box.width);
          const verticalThroughInterior = segment.x1 === segment.x2
            && segment.x1 > box.x && segment.x1 < box.x + box.width
            && Math.max(Math.min(segment.y1, segment.y2), box.y) < Math.min(Math.max(segment.y1, segment.y2), box.y + box.height);
          return horizontalThroughInterior || verticalThroughInterior;
        }), `${path.id} crosses ${box.key}`).toBe(false);
      }
    }
    expect(layout.processPaths).toHaveLength(0);

    const fullLayout = buildEgdsMapLayout(egdsInput());
    const fullBoxesByKey = new Map<string, (typeof fullLayout.frameworkBoxes)[number]>(
      fullLayout.frameworkBoxes.map((box) => [box.key, box]),
    );
    for (const path of fullLayout.processPaths) {
      const declared = path as typeof path & {
        fromPort?: 'north' | 'east' | 'south' | 'west';
        toPort?: 'north' | 'east' | 'south' | 'west';
      };
      expect(declared.fromPort, `${path.id} from port`).toBe('east');
      expect(declared.toPort, `${path.id} to port`).toBe('west');
      expect(pathStartsAndEndsOnBoundaries(path.path, fullBoxesByKey.get(path.fromKey)!, fullBoxesByKey.get(path.toKey)!), path.id).toBe(true);
      expect(pathStartsAndEndsAtDeclaredPorts(
        path.path,
        declared.fromPort!,
        declared.toPort!,
        fullBoxesByKey.get(path.fromKey)!,
        fullBoxesByKey.get(path.toKey)!,
      ), path.id).toBe(true);
      for (const box of fullLayout.frameworkBoxes.filter((candidate) => candidate.key !== path.fromKey && candidate.key !== path.toKey)) {
        expect(allSegments(path.path).some((segment) => {
          const horizontalThroughInterior = segment.y1 === segment.y2
            && segment.y1 > box.y && segment.y1 < box.y + box.height
            && Math.max(Math.min(segment.x1, segment.x2), box.x) < Math.min(Math.max(segment.x1, segment.x2), box.x + box.width);
          const verticalThroughInterior = segment.x1 === segment.x2
            && segment.x1 > box.x && segment.x1 < box.x + box.width
            && Math.max(Math.min(segment.y1, segment.y2), box.y) < Math.min(Math.max(segment.y1, segment.y2), box.y + box.height);
          return horizontalThroughInterior || verticalThroughInterior;
        }), `${path.id} crosses ${box.key}`).toBe(false);
      }
    }
    expect(fullLayout.processPaths.every(({ path }) => (
      allSegments(path).filter(({ y1, y2 }) => y1 === y2).every(({ x1, x2 }) => x2 >= x1)
    ))).toBe(true);
  });

  it('projects only direct selected relations, preserving their declared direction and type', () => {
    const selectedCapabilityId = 'experience-framing';
    const expandedFrameworkNodeId = 'rationalization';
    const layout = buildEgdsMapLayout({ ...egdsInput(), expandedFrameworkNodeId, selectedCapabilityId });
    const selectedRelations = capabilityRelations
      .filter((relation) => relation.fromId === selectedCapabilityId || relation.toId === selectedCapabilityId)
      .sort((left, right) => left.id < right.id ? -1 : left.id > right.id ? 1 : 0);
    const expectedExternalNeighbors = [...new Set(selectedRelations
      .map((relation) => relation.fromId === selectedCapabilityId ? relation.toId : relation.fromId)
      .filter((id) => ![...capabilities, ...knowledgeTopics].some((entity) => entity.id === id && entity.frameworkNodeId === expandedFrameworkNodeId)))]
      .sort();

    expect(layout.entityBoxes.some(({ key }) => key === `capability:${selectedCapabilityId}`)).toBe(true);
    expect(layout.relationEndpointBoxes.map(({ key }) => key)).toEqual(
      expectedExternalNeighbors.map((id) => `relation-endpoint:${id}`),
    );
    expect(layout.relationPaths).toHaveLength(selectedRelations.length);
    expect(layout.relationPaths.map(({ relationId, relationType }) => ({ relationId, relationType }))).toEqual(
      selectedRelations.map(({ id, type }) => ({ relationId: id, relationType: type })),
    );
    for (const relation of selectedRelations) {
      const path = layout.relationPaths.find(({ relationId }) => relationId === relation.id)!;
      const keyForCapability = (id: string) => (
        [...capabilities, ...knowledgeTopics].some((entity) => entity.id === id && entity.frameworkNodeId === expandedFrameworkNodeId)
          ? `capability:${id}`
          : `relation-endpoint:${id}`
      );
      expect(path.fromKey).toBe(keyForCapability(relation.fromId));
      expect(path.toKey).toBe(keyForCapability(relation.toId));
    }
  });

  it('routes every selected capability relation from boundary to boundary without crossing chips', () => {
    const knownLayout = buildEgdsMapLayout(egdsInput({
      expandedFrameworkNodeId: 'rationalization',
      selectedCapabilityId: 'experience-framing',
    }));
    const knownPath = knownLayout.relationPaths.find(
      ({ relationId }) => relationId === 'experience-deconstruction-supports-experience-framing',
    )!;
    const knownCrossings = [
      ...knownLayout.frameworkBoxes,
      ...knownLayout.entityBoxes,
      ...knownLayout.relationEndpointBoxes,
    ]
      .filter(({ key }) => key !== knownPath.fromKey && key !== knownPath.toKey)
      .filter((box) => pathCrossesBoxInterior(knownPath.path, box))
      .map(({ key }) => key);

    expect(knownCrossings).toEqual([]);

    let selectedCapabilityProbeCount = 0;
    let relationPathProbeCount = 0;
    for (const capability of capabilities) {
      const layout = buildEgdsMapLayout(egdsInput({
        expandedFrameworkNodeId: capability.frameworkNodeId,
        selectedCapabilityId: capability.id,
      }));
      const boxes = [
        ...layout.frameworkBoxes,
        ...layout.entityBoxes,
        ...layout.relationEndpointBoxes,
      ];
      const boxesByKey = new Map<string, (typeof boxes)[number]>(
        boxes.map((box) => [box.key, box]),
      );
      const directRelations = capabilityRelations.filter(
        (relation) => relation.fromId === capability.id || relation.toId === capability.id,
      );

      selectedCapabilityProbeCount += 1;
      expect(layout.relationPaths, capability.id).toHaveLength(directRelations.length);
      for (const path of layout.relationPaths) {
        const from = boxesByKey.get(path.fromKey)!;
        const to = boxesByKey.get(path.toKey)!;
        relationPathProbeCount += 1;
        expect(pathStartsAndEndsOnBoundaries(path.path, from, to), path.id).toBe(true);
        expect(pathStartsAndEndsAtDeclaredPorts(path.path, path.fromPort, path.toPort, from, to), path.id).toBe(true);
        expect(pathCrossesBoxInterior(path.path, from), `${path.id} re-enters ${from.key}`).toBe(false);
        expect(pathCrossesBoxInterior(path.path, to), `${path.id} enters ${to.key}`).toBe(false);
        for (const box of boxes.filter(({ key }) => key !== path.fromKey && key !== path.toKey)) {
          expect(pathCrossesBoxInterior(path.path, box), `${path.id} crosses ${box.key}`).toBe(false);
        }
      }
    }

    expect(selectedCapabilityProbeCount).toBe(42);
    expect(relationPathProbeCount).toBe(capabilityRelations.length * 2);
  });

  it('reuses a same-container neighbor box for each direct relation', () => {
    const selectedCapabilityId = 'rules-system-modeling';
    const relationId = 'rules-system-modeling-supports-core-loop-design';
    const layout = buildEgdsMapLayout(egdsInput({
      expandedFrameworkNodeId: 'gameplay-challenges-lever',
      selectedCapabilityId,
    }));
    const relation = layout.relationPaths.find((candidate) => candidate.relationId === relationId)!;

    expect(layout.entityBoxes.map(({ key }) => key)).toContain('capability:core-loop-design');
    expect(layout.relationEndpointBoxes.map(({ key }) => key)).not.toContain('relation-endpoint:core-loop-design');
    expect(relation.fromKey).toBe('capability:rules-system-modeling');
    expect(relation.toKey).toBe('capability:core-loop-design');
    expect(layout.relationPaths.filter(({ relationId: id }) => id === relationId)).toHaveLength(1);
  });

  it('rejects unknown IDs and incompatible selected expansion combinations', () => {
    expect(() => buildEgdsMapLayout({ ...egdsInput(), expandedFrameworkNodeId: 'missing' })).toThrow(/unknown framework/i);
    expect(() => buildEgdsMapLayout({ ...egdsInput(), expandedFrameworkNodeId: 'perception', selectedCapabilityId: 'missing' })).toThrow(/unknown capability/i);
    expect(() => buildEgdsMapLayout({
      ...egdsInput(),
      expandedFrameworkNodeId: 'perception',
      selectedCapabilityId: 'experience-framing',
    })).toThrow(/belongs to expanded framework node/i);
    expect(() => buildEgdsMapLayout({ ...egdsInput(), selectedCapabilityId: 'experience-framing' })).toThrow(/requires an expanded framework node/i);
  });
});
