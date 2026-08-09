import { describe, expect, it } from 'vitest';

import capabilities from '../../src/data/capabilities.json';
import capabilityRelations from '../../src/data/capability-relations.json';
import domains from '../../src/data/domains.json';
import frameworkNodes from '../../src/data/egds-framework-nodes.json';
import frameworkRelations from '../../src/data/egds-framework-relations.json';
import knowledgeTopics from '../../src/data/knowledge-topics.json';
import mapGroups from '../../src/data/map-groups.json';
import {
  buildCapabilityMindMapLayout,
  buildEgdsMapLayout,
  isPointInsideBounds,
  projectRelationEndpoints,
  rectanglesOverlap,
  relationSemantics,
  type BuildEgdsMapLayoutInput,
  type CapabilityMindMapLayout,
} from '../../src/lib/map-geometry';
import type { Catalog } from '../../src/lib/catalog/validate';

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
  'egds-root': [20, 320, 130, 60],
  'experience-design': [180, 80, 180, 54],
  'from-plan-to-ship': [180, 220, 180, 54],
  'with-team': [180, 360, 180, 54],
  'product-profit': [180, 500, 180, 54],
  'beyond-games': [180, 630, 180, 54],
  'experience-journey': [390, 15, 190, 44],
  perception: [390, 80, 125, 44],
  rationalization: [535, 80, 125, 44],
  deconstruction: [680, 80, 125, 44],
  reconstruction: [825, 80, 125, 44],
  'narrative-lever': [990, 25, 170, 42],
  'aesthetics-lever': [990, 80, 170, 42],
  'gameplay-challenges-lever': [990, 135, 170, 42],
  'mindset-problem-solving-tools': [410, 225, 170, 44],
  'prototype-production-breakdown': [600, 225, 170, 44],
  'playtest-evidence-iteration': [790, 225, 170, 44],
  'tradeoff-specification-delivery': [980, 225, 170, 44],
  'vision-direction-decisions': [410, 365, 170, 44],
  'alignment-communication': [600, 365, 170, 44],
  'leadership-management': [790, 365, 170, 44],
  'feedback-collaboration': [980, 365, 170, 44],
  'audience-positioning-cluster': [410, 505, 170, 44],
  'market-opportunity': [600, 505, 170, 44],
  'value-exchange': [790, 505, 170, 44],
  'monetization-alignment': [980, 505, 170, 44],
  'values-culture': [440, 635, 220, 44],
  'innovation-possibility-space': [720, 635, 240, 44],
} as const;

describe('v0.2 map geometry', () => {
  it('assigns every Domain to exactly one of five reading groups', () => {
    const ownedDomainIds = mapGroups.flatMap(({ domainIds }) => domainIds);

    expect(mapGroups).toHaveLength(5);
    expect(new Set(ownedDomainIds).size).toBe(domains.length);
    expect([...ownedDomainIds].sort()).toEqual(domains.map(({ id }) => id).sort());
    expect(mapGroups.map(({ order }) => order)).toEqual([1, 2, 3, 4, 5]);
  });

  it('projects a deterministic collision-free five-trunk mind map with typed keys', () => {
    const layout = buildCapabilityMindMapLayout(mapGroups, domains, capabilities, knowledgeTopics);

    expect(layout.width).toBe(1180);
    expect(layout.height).toBeGreaterThan(0);
    expect(layout.root.id).toBe('expertise-map-root');
    expect(layout.root.key).toBe('root:expertise-map-root');
    expect(layout.groups).toHaveLength(5);
    expect(layout.domains).toHaveLength(8);
    expect(layout.nodes).toHaveLength(capabilities.length + knowledgeTopics.length);
    expect(layout.structuralPaths).toHaveLength(13);
    expect(new Set(layout.nodes.map(({ id }) => id)).size).toBe(54);

    const expectedGroupIds = [...mapGroups]
      .sort((left, right) => left.order - right.order || left.id.localeCompare(right.id))
      .map(({ id }) => id);
    expect(layout.groups.map(({ id }) => id)).toEqual(expectedGroupIds);

    const domainsById = new Map(domains.map((domain) => [domain.id, domain]));
    const expectedDomainIds = [...mapGroups]
      .sort((left, right) => left.order - right.order || left.id.localeCompare(right.id))
      .flatMap((group) => group.domainIds
        .map((id) => domainsById.get(id))
        .filter((domain): domain is (typeof domains)[number] => Boolean(domain))
        .sort((left, right) => left.order - right.order || left.id.localeCompare(right.id))
        .map(({ id }) => id));
    expect(layout.domains.map(({ id }) => id)).toEqual(expectedDomainIds);

    const entities = [...capabilities, ...knowledgeTopics];
    const expectedNodeIds = expectedDomainIds.flatMap((domainId) => entities
      .filter((entity) => entity.domainId === domainId)
      .sort((left, right) => left.position.y - right.position.y
        || left.position.x - right.position.x
        || left.id.localeCompare(right.id))
      .map(({ id }) => id));
    expect(layout.nodes.map(({ id }) => id)).toEqual(expectedNodeIds);

    for (const [index, left] of layout.nodes.entries()) {
      for (const right of layout.nodes.slice(index + 1)) {
        expect(rectanglesOverlap(left, right), `${left.key}:${right.key}`).toBe(false);
      }
    }

    const allBoxes = [layout.root, ...layout.groups, ...layout.domains, ...layout.nodes];
    expect(new Set(allBoxes.map(({ key }) => key)).size).toBe(allBoxes.length);
    expect(layout.groups.find(({ id }) => id === 'experience-player')?.key).toBe(
      'group:experience-player',
    );
    expect(layout.domains.find(({ id }) => id === 'experience-player')?.key).toBe(
      'domain:experience-player',
    );
    expect(layout.structuralPaths).toContainEqual(expect.objectContaining({
      fromKey: 'group:experience-player',
      toKey: 'domain:experience-player',
    }));
    expect(layout.structuralPaths.every(({ fromKey, toKey }) => fromKey !== toKey)).toBe(true);

    const reversed = buildCapabilityMindMapLayout(
      [...mapGroups].reverse(),
      [...domains].reverse(),
      [...capabilities].reverse(),
      [...knowledgeTopics].reverse(),
    );
    const coordinatesByKey = (candidate: CapabilityMindMapLayout) => Object.fromEntries(
      [candidate.root, ...candidate.groups, ...candidate.domains, ...candidate.nodes]
        .sort((left, right) => left.key.localeCompare(right.key))
        .map(({ key, x, y }) => [key, { x, y }]),
    );
    expect(coordinatesByKey(reversed)).toEqual(coordinatesByKey(layout));
    expect(reversed.structuralPaths).toEqual(layout.structuralPaths);
  });

  it('keeps capability and knowledge-topic identities distinct when their raw IDs match', () => {
    const layout = buildCapabilityMindMapLayout(
      [{ id: 'group', order: 1, domainIds: ['domain'] }],
      [{ id: 'domain', order: 1 }],
      [{ id: 'shared', domainId: 'domain', position: { x: 10, y: 10 } }],
      [{ id: 'shared', domainId: 'domain', position: { x: 20, y: 20 } }],
    );

    expect(layout.nodes.map(({ key }) => key)).toEqual([
      'capability:shared',
      'knowledge-topic:shared',
    ]);
    expect(new Set(layout.nodes.map(({ key }) => key)).size).toBe(2);
    expect(layout.nodes[0]).not.toEqual(expect.objectContaining({
      x: layout.nodes[1].x,
      y: layout.nodes[1].y,
    }));
  });

  it('keeps every node anchor inside its global domain bounds', () => {
    const domainsById = new Map(domains.map((domain) => [domain.id, domain]));

    for (const node of [...capabilities, ...knowledgeTopics]) {
      const domain = domainsById.get(node.domainId);
      expect(domain, `${node.id} references a known domain`).toBeDefined();
      expect(isPointInsideBounds(node.position, domain!.bounds), `${node.id} is inside ${node.domainId}`).toBe(
        true,
      );
    }
  });

  it('projects every relation endpoint from the exact capability anchors', () => {
    const capabilitiesById = new Map(capabilities.map((capability) => [capability.id, capability.position]));

    for (const relation of capabilityRelations) {
      const endpoints = projectRelationEndpoints(relation, capabilitiesById);
      expect(endpoints.start, `${relation.id} start`).toEqual(capabilitiesById.get(relation.fromId));
      expect(endpoints.end, `${relation.id} end`).toEqual(capabilitiesById.get(relation.toId));
    }
  });

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

  it('uses non-overlapping domain bounds in one 0..100 coordinate system', () => {
    for (const domain of domains) {
      const { x, y, width, height } = domain.bounds;
      expect(x).toBeGreaterThanOrEqual(0);
      expect(y).toBeGreaterThanOrEqual(0);
      expect(width).toBeGreaterThan(0);
      expect(height).toBeGreaterThan(0);
      expect(x + width).toBeLessThanOrEqual(100);
      expect(y + height).toBeLessThanOrEqual(100);
    }

    for (const [index, first] of domains.entries()) {
      for (const second of domains.slice(index + 1)) {
        const separated =
          first.bounds.x + first.bounds.width <= second.bounds.x ||
          second.bounds.x + second.bounds.width <= first.bounds.x ||
          first.bounds.y + first.bounds.height <= second.bounds.y ||
          second.bounds.y + second.bounds.height <= first.bounds.y;
        expect(separated, `${first.id} overlaps ${second.id}`).toBe(true);
      }
    }
  });
});

describe('EGDS expertise map geometry', () => {
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
      key: 'root:egds-root', kind: 'root', x: 20, y: 320, width: 130, height: 60,
    }));
    expect(layout.frameworkBoxes.find(({ id }) => id === 'experience-design')).toEqual(expect.objectContaining({
      key: 'branch:experience-design', kind: 'branch', x: 180, y: 80, width: 180, height: 54,
    }));
    expect(layout.frameworkBoxes.find(({ id }) => id === 'innovation-possibility-space')).toEqual(expect.objectContaining({
      key: 'external-entry:innovation-possibility-space', kind: 'external-entry', x: 720, y: 635, width: 240, height: 44,
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
      x: 390, y: 80, width: 125, height: 44,
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
      expect(pathStartsAndEndsOnBoundaries(path.path, from, to), path.id).toBe(true);
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
      expect(pathStartsAndEndsOnBoundaries(path.path, fullBoxesByKey.get(path.fromKey)!, fullBoxesByKey.get(path.toKey)!), path.id).toBe(true);
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
      'process-perception-rationalization': 'M 515 102 H 535',
      'process-rationalization-deconstruction': 'M 660 102 H 680',
      'process-deconstruction-reconstruction': 'M 805 102 H 825',
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
