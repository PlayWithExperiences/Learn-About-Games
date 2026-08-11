import { describe, expect, it } from 'vitest';
// @ts-expect-error The application tsconfig intentionally omits Node builtin declarations.
import { readFileSync } from 'node:fs';

import capabilities from '../../src/data/capabilities.json';
import capabilityRelations from '../../src/data/capability-relations.json';
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

const pathOverlapsBoxBoundary = (
  path: string,
  box: { x: number; y: number; width: number; height: number },
) => allSegments(path).some((segment) => {
  const horizontalBoundaryOverlap = segment.y1 === segment.y2
    && (segment.y1 === box.y || segment.y1 === box.y + box.height)
    && Math.max(Math.min(segment.x1, segment.x2), box.x) < Math.min(Math.max(segment.x1, segment.x2), box.x + box.width);
  const verticalBoundaryOverlap = segment.x1 === segment.x2
    && (segment.x1 === box.x || segment.x1 === box.x + box.width)
    && Math.max(Math.min(segment.y1, segment.y2), box.y) < Math.min(Math.max(segment.y1, segment.y2), box.y + box.height);
  return horizontalBoundaryOverlap || verticalBoundaryOverlap;
});

const expectedEgdsAnchors = {
  'egds-root': [20, 352, 130, 60],
  'experience-design': [180, 80, 180, 54],
  'from-plan-to-ship': [180, 220, 180, 54],
  'with-team': [180, 360, 180, 54],
  'product-profit': [180, 500, 180, 54],
  'beyond-games': [180, 630, 180, 54],
  'experience-journey': [390, 20, 170, 44],
  perception: [390, 85, 170, 44],
  rationalization: [580, 85, 170, 44],
  deconstruction: [770, 85, 170, 44],
  reconstruction: [960, 85, 170, 44],
  'narrative-lever': [580, 145, 170, 42],
  'aesthetics-lever': [770, 145, 170, 42],
  'gameplay-challenges-lever': [960, 145, 170, 42],
  'mindset-problem-solving-tools': [390, 225, 170, 44],
  'prototype-production-breakdown': [580, 225, 170, 44],
  'playtest-evidence-iteration': [770, 225, 170, 44],
  'tradeoff-specification-delivery': [960, 225, 170, 44],
  'vision-direction-decisions': [390, 365, 170, 44],
  'alignment-communication': [580, 365, 170, 44],
  'leadership-management': [770, 365, 170, 44],
  'feedback-collaboration': [960, 365, 170, 44],
  'audience-positioning-cluster': [390, 505, 170, 44],
  'market-opportunity': [580, 505, 170, 44],
  'value-exchange': [770, 505, 170, 44],
  'monetization-alignment': [960, 505, 170, 44],
  'values-culture': [390, 635, 170, 44],
  'innovation-possibility-space': [770, 635, 360, 44],
} as const;

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

  it('places comparable framework rows on one declared four-column grid', () => {
    const layout = buildEgdsMapLayout(egdsInput());
    const boxes = new Map(layout.frameworkBoxes.map((box) => [box.id, box]));
    const expectedColumns = [390, 580, 770, 960];
    const rows = [
      ['perception', 'rationalization', 'deconstruction', 'reconstruction'],
      ['mindset-problem-solving-tools', 'prototype-production-breakdown', 'playtest-evidence-iteration', 'tradeoff-specification-delivery'],
      ['vision-direction-decisions', 'alignment-communication', 'leadership-management', 'feedback-collaboration'],
      ['audience-positioning-cluster', 'market-opportunity', 'value-exchange', 'monetization-alignment'],
    ];

    for (const row of rows) {
      expect(row.map((id) => boxes.get(id)?.x), row.join(' -> ')).toEqual(expectedColumns);
      expect(row.map((id) => boxes.get(id)?.width), row.join(' widths')).toEqual([170, 170, 170, 170]);
    }
    expect(['narrative-lever', 'aesthetics-lever', 'gameplay-challenges-lever'].map((id) => boxes.get(id)?.x))
      .toEqual(expectedColumns.slice(1));
    expect(boxes.get('values-culture')).toEqual(expect.objectContaining({ x: expectedColumns[0], width: 170 }));
    expect(boxes.get('innovation-possibility-space')).toEqual(expect.objectContaining({ x: expectedColumns[2], width: 360 }));
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
    expect(Object.fromEntries(layout.frameworkBoxes.map(({ id, x, y, width, height }) => [id, [x, y, width, height]]))).toEqual(
      expectedEgdsAnchors,
    );

    expect(layout.frameworkBoxes.find(({ id }) => id === 'egds-root')).toEqual(expect.objectContaining({
      key: 'root:egds-root', kind: 'root', x: 20, y: 352, width: 130, height: 60,
    }));
    expect(layout.frameworkBoxes.find(({ id }) => id === 'experience-design')).toEqual(expect.objectContaining({
      key: 'branch:experience-design', kind: 'branch', x: 180, y: 80, width: 180, height: 54,
    }));
    expect(layout.frameworkBoxes.find(({ id }) => id === 'innovation-possibility-space')).toEqual(expect.objectContaining({
      key: 'external-entry:innovation-possibility-space', kind: 'external-entry', x: 770, y: 635, width: 360, height: 44,
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
      x: 390, y: 85, width: 170, height: 44,
    }));
    expect(layout.height).toBe(724 + 72 + Math.ceil(expectedKeys.length / 3) * 68 + 24);
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

  it('routes every expansion leader through a clear elbow instead of crossing the overview column', () => {
    const perceptionLayout = buildEgdsMapLayout(egdsInput({ expandedFrameworkNodeId: 'perception' }));
    const perceptionCrossings = perceptionLayout.frameworkBoxes
      .filter(({ id }) => id !== 'perception')
      .filter((box) => pathCrossesBoxInterior(perceptionLayout.expansionLeaderPath!.path, box))
      .map(({ id }) => id);
    const perceptionBoundaryOverlaps = perceptionLayout.frameworkBoxes
      .filter(({ id }) => id !== 'perception')
      .filter((box) => pathOverlapsBoxBoundary(perceptionLayout.expansionLeaderPath!.path, box))
      .map(({ id }) => id);

    expect(perceptionCrossings).toEqual([]);
    expect(perceptionBoundaryOverlaps).toEqual([]);
    expect(perceptionLayout.expansionLeaderPath?.path).toMatch(/ H /);
    expect(perceptionLayout.expansionLeaderPath?.path).toMatch(/ V /);
    expect(perceptionLayout.expansionLeaderPath?.path).toMatch(/ V 724$/);

    for (const { id: expandedFrameworkNodeId } of frameworkNodes) {
      const probeTopic = {
        ...knowledgeTopics[0]!,
        id: `leader-probe:${expandedFrameworkNodeId}`,
        frameworkNodeId: expandedFrameworkNodeId,
      };
      const layout = buildEgdsMapLayout(egdsInput({
        expandedFrameworkNodeId,
        capabilities: [],
        knowledgeTopics: [probeTopic] as unknown as Catalog['knowledgeTopics'],
        capabilityRelations: [],
      }));
      const leader = layout.expansionLeaderPath!;
      const boxes = [
        ...layout.frameworkBoxes,
        ...layout.entityBoxes,
        ...layout.relationEndpointBoxes,
      ].filter((box) => box.key !== leader.fromKey);

      expect(pathCrossesBoxInterior(leader.path, layout.frameworkBoxes.find(({ key }) => key === leader.fromKey)!), expandedFrameworkNodeId).toBe(false);
      for (const box of boxes) {
        expect(pathCrossesBoxInterior(leader.path, box), `${expandedFrameworkNodeId} leader crosses ${box.key}`).toBe(false);
        expect(pathOverlapsBoxBoundary(leader.path, box), `${expandedFrameworkNodeId} leader overlaps ${box.key}`).toBe(false);
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
    expect(Object.fromEntries(fullLayout.processPaths.map(({ id, path }) => [id, path]))).toEqual({
      'process-perception-rationalization': 'M 560 107 H 580',
      'process-rationalization-deconstruction': 'M 750 107 H 770',
      'process-deconstruction-reconstruction': 'M 940 107 H 960',
    });
  });

  it('projects only direct selected relations, preserving their declared direction and type', () => {
    const selectedCapabilityId = 'experience-framing';
    const expandedFrameworkNodeId = 'rationalization';
    const layout = buildEgdsMapLayout({ ...egdsInput(), expandedFrameworkNodeId, selectedCapabilityId });
    const selectedRelations = capabilityRelations
      .filter((relation) => relation.fromId === selectedCapabilityId || relation.toId === selectedCapabilityId)
      .sort((left, right) => left.id.localeCompare(right.id));
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
    expect(layout.expansionLeaderPath?.path).toMatch(/ H /);
    expect(layout.expansionLeaderPath?.path).toMatch(/ V 724$/);
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
