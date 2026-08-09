import { describe, expect, it } from 'vitest';

import capabilities from '../../src/data/capabilities.json';
import capabilityRelations from '../../src/data/capability-relations.json';
import domains from '../../src/data/domains.json';
import knowledgeTopics from '../../src/data/knowledge-topics.json';
import mapGroups from '../../src/data/map-groups.json';
import {
  isPointInsideBounds,
  projectRelationEndpoints,
  relationSemantics,
} from '../../src/lib/map-geometry';

describe('v0.2 map geometry', () => {
  it('assigns every Domain to exactly one of five reading groups', () => {
    const ownedDomainIds = mapGroups.flatMap(({ domainIds }) => domainIds);

    expect(mapGroups).toHaveLength(5);
    expect(new Set(ownedDomainIds).size).toBe(domains.length);
    expect([...ownedDomainIds].sort()).toEqual(domains.map(({ id }) => id).sort());
    expect(mapGroups.map(({ order }) => order)).toEqual([1, 2, 3, 4, 5]);
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
