import { describe, expect, it } from 'vitest';

import capabilities from '../../src/data/capabilities.json';
import roleProfiles from '../../src/data/role-profiles.json';
import { projectCareerLens } from '../../src/lib/career-lens';

const priorityValues = ['core', 'important', 'suggested'];
const responsibilityValues = ['execute', 'contribute', 'decide', 'direct'];
const scoreLikeTerms = /评分|分数|匹配度|完成率|适配度|score|percentage|fit|gap|completion/i;

describe('career-lens data', () => {
  it('keeps exactly three evidence-bounded profiles with the approved titles', () => {
    expect(roleProfiles).toHaveLength(3);
    expect(roleProfiles.map(({ title }) => title['zh-CN']).sort()).toEqual([
      'AAA · Creative Director',
      'AAA · Game Designer',
      'Indie · Solo Developer',
    ]);

    const capabilityIds = new Set(capabilities.map(({ id }) => id));
    for (const profile of roleProfiles) {
      expect(profile.roleId).toBeTruthy();
      expect(profile.productionContextId).toBeTruthy();
      expect(profile.basis['zh-CN']).toBeTruthy();
      expect(profile.caveats['zh-CN']).toBeTruthy();
      expect(profile.reviewedAt).toBe('2026-08-09');
      expect(profile.basisLinks.length).toBeGreaterThan(0);

      for (const basisLink of profile.basisLinks) {
        expect(basisLink.url).toMatch(/^https?:\/\//);
      }
      for (const capability of profile.capabilities) {
        expect(capabilityIds.has(capability.capabilityId)).toBe(true);
        expect(priorityValues).toContain(capability.priority);
        expect(responsibilityValues).toContain(capability.responsibility);
      }
    }
  });
});

describe('projectCareerLens', () => {
  it('fails before projection when a profile maps the same capability twice', () => {
    const profile = structuredClone(roleProfiles[0]) as Parameters<typeof projectCareerLens>[1];
    const duplicate = structuredClone(profile.capabilities[0]);
    profile.capabilities.push(duplicate);

    expect(() => projectCareerLens(capabilities, profile)).toThrow(
      new RegExp(`^Career profile "${profile.id}" has duplicate capability mapping "${duplicate.capabilityId}"\\.$`),
    );
  });

  it('fails before projection when a profile maps an unknown capability', () => {
    const profile = structuredClone(roleProfiles[0]) as Parameters<typeof projectCareerLens>[1];
    profile.capabilities.push({
      capabilityId: 'unknown-capability',
      priority: 'core',
      responsibility: 'execute',
    });

    expect(() => projectCareerLens(capabilities, profile)).toThrow(
      new RegExp(`^Career profile "${profile.id}" references unknown capability "unknown-capability"\\.$`),
    );
  });

  it('uses raw ID ordering without mutating capability or profile inputs', () => {
    const profile = structuredClone(roleProfiles[2]) as Parameters<typeof projectCareerLens>[1];
    const reversedProfile = structuredClone(profile);
    reversedProfile.capabilities.reverse();
    const reversedCapabilities = structuredClone(capabilities).reverse();
    const originalProfile = structuredClone(profile);
    const originalReversedProfile = structuredClone(reversedProfile);
    const originalCapabilities = structuredClone(capabilities);
    const originalReversedCapabilities = structuredClone(reversedCapabilities);

    const projection = projectCareerLens(capabilities, profile);
    const reversedProjection = projectCareerLens(reversedCapabilities, reversedProfile);

    expect(reversedProjection).toEqual(projection);
    expect(projection.nodes.map(({ capabilityId }) => capabilityId)).toEqual(
      capabilities.map(({ id }) => id).sort(),
    );
    expect(Object.keys(projection.frameworkCounts)).toEqual(Object.keys(projection.frameworkCounts).sort());
    for (const priority of priorityValues) {
      expect(projection.groups[priority as keyof typeof projection.groups].map(({ capabilityId }) => capabilityId))
        .toEqual([...projection.groups[priority as keyof typeof projection.groups]]
          .map(({ capabilityId }) => capabilityId)
          .sort());
    }
    expect(profile).toEqual(originalProfile);
    expect(reversedProfile).toEqual(originalReversedProfile);
    expect(capabilities).toEqual(originalCapabilities);
    expect(reversedCapabilities).toEqual(originalReversedCapabilities);
  });

  it('counts each mapped capability once inside its framework container for every profile', () => {
    for (const profile of roleProfiles) {
      const result = projectCareerLens(capabilities, profile as Parameters<typeof projectCareerLens>[1]);
      const expectedFrameworkNodeIds = new Set<string>();
      let total = 0;

      for (const mapping of profile.capabilities) {
        const capability = capabilities.find(({ id }) => id === mapping.capabilityId);
        if (!capability) throw new Error(`Missing capability ${mapping.capabilityId}`);
        expectedFrameworkNodeIds.add(capability.frameworkNodeId);
        total += 1;
        expect(result.nodes).toContainEqual({
          capabilityId: capability.id,
          priority: mapping.priority,
          responsibility: mapping.responsibility,
        });
      }

      expect(Object.keys(result.frameworkCounts).sort()).toEqual([...expectedFrameworkNodeIds].sort());
      expect(Object.values(result.frameworkCounts).reduce(
        (sum, counts) => sum + counts.core + counts.important + counts.suggested,
        0,
      )).toBe(total);
      expect(priorityValues.reduce(
        (sum, priority) => sum + result.groups[priority as keyof typeof result.groups].length,
        0,
      )).toBe(total);
      expect(result.nodes.filter(({ priority }) => priority !== 'unlisted')).toHaveLength(total);
      expect(result.nodes.every(({ capabilityId }) => capabilities.some(({ id }) => id === capabilityId))).toBe(true);
    }
  });

  it('projects every map capability and mapped framework containers without scores, paths, or personal progress', () => {
    const profile = roleProfiles.find(({ id }) => id === 'aaa-creative-director');
    expect(profile).toBeDefined();

    const result = projectCareerLens(capabilities, profile! as Parameters<typeof projectCareerLens>[1]);

    expect(Object.keys(result).sort()).toEqual(['frameworkCounts', 'groups', 'nodes', 'profile']);
    expect(result.nodes).toHaveLength(capabilities.length);
    expect(result.nodes.map(({ capabilityId }) => capabilityId).sort()).toEqual(
      capabilities.map(({ id }) => id).sort(),
    );
    expect(Object.keys(result.groups).sort()).toEqual(priorityValues);
    expect(result.groups.core.length).toBeGreaterThan(0);
    expect(result.groups.important.length).toBeGreaterThan(0);
    expect(result.groups.suggested.length).toBeGreaterThan(0);
    expect(result.nodes).toContainEqual({ capabilityId: 'core-loop-design', priority: 'unlisted' });
    expect(result.nodes).toContainEqual({
      capabilityId: 'creative-vision-stewardship',
      priority: 'core',
      responsibility: 'direct',
    });
    const mappedCapabilities = capabilities.filter((capability) =>
      profile!.capabilities.some(({ capabilityId }) => capabilityId === capability.id),
    );
    expect(Object.keys(result.frameworkCounts).sort()).toEqual(
      [...new Set(mappedCapabilities.map(({ frameworkNodeId }) => frameworkNodeId))].sort(),
    );
    expect(
      Object.values(result.frameworkCounts).reduce(
        (total, counts) => total + counts.core + counts.important + counts.suggested,
        0,
      ),
    ).toBe(profile!.capabilities.length);
    for (const capability of profile!.capabilities) {
      const frameworkNodeId = capabilities.find(({ id }) => id === capability.capabilityId)?.frameworkNodeId;
      if (!frameworkNodeId) throw new Error(`Missing framework container for ${capability.capabilityId}`);
      expect(result.frameworkCounts[frameworkNodeId][capability.priority as keyof typeof result.frameworkCounts[string]])
        .toBeGreaterThan(0);
    }
    expect(Object.keys(result.profile).sort()).toEqual([
      'basisLinks',
      'id',
      'productionContextId',
      'reviewedAt',
      'roleId',
      'title',
    ]);
    expect(JSON.stringify(result)).not.toMatch(scoreLikeTerms);
  });
});
