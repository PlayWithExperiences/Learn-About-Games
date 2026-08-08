import { describe, expect, it } from 'vitest';

import capabilities from '../../src/data/capabilities.json';
import roleProfiles from '../../src/data/role-profiles.json';
import { projectCareerLens } from '../../src/lib/career-lens';

const priorityValues = ['core', 'important', 'suggested'];
const responsibilityValues = ['execute', 'contribute', 'decide', 'direct'];
const scoreLikeTerms = /评分|分数|匹配度|完成率|score|percentage|fit|completion/i;

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
  it('projects every map capability without scores, paths, or personal progress', () => {
    const profile = roleProfiles.find(({ id }) => id === 'aaa-creative-director');
    expect(profile).toBeDefined();

    const result = projectCareerLens(capabilities, profile! as Parameters<typeof projectCareerLens>[1]);

    expect(Object.keys(result).sort()).toEqual(['groups', 'nodes', 'profile']);
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
