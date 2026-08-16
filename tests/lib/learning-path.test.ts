import { describe, expect, it } from 'vitest';

import type { Catalog } from '../../src/lib/catalog/validate';
import { buildGameFeelLearningPath } from '../../src/lib/learning-paths';

type Resource = Catalog['resources'][number];

function makeResource(
  id: string,
  overrides: Partial<Resource> = {},
): Resource {
  return {
    id,
    title: { 'zh-CN': `资料 ${id}`, en: `Resource ${id}` },
    summary: { 'zh-CN': `关于手感与反馈的资料 ${id}` },
    sourceId: 'source-a',
    capabilityIds: ['game-feel-tuning'],
    knowledgeTopicIds: ['perception-attention-emotion'],
    resourceTopicIds: ['game-feel-feedback'],
    mediaType: 'article',
    canonicalUrl: `https://example.com/${id}`,
    whyRelevant: { 'zh-CN': `帮助观察和调校手感 ${id}` },
    originalLanguage: 'en',
    accessVersions: [{
      language: 'en',
      url: `https://example.com/${id}`,
      accessModel: 'free',
      versionRelation: 'original',
      presentationMode: 'original',
      checkedAt: '2026-08-09',
    }],
    ...overrides,
  };
}

const fixtureResources = Array.from({ length: 140 }, (_, index) => makeResource(
  `resource-${String(index + 1).padStart(3, '0')}`,
  index % 4 === 0
    ? { capabilityIds: ['experience-deconstruction'], mediaType: 'video' }
    : index % 4 === 1
      ? { capabilityIds: ['multimodal-presentation-integration'], mediaType: 'talk' }
      : index % 4 === 2
        ? { capabilityIds: ['pacing-control'], mediaType: 'course' }
        : {},
));

describe('game feel learning path', () => {
  it('builds six ordered stages with the approved EGDS mapping and exactly 100 resources', () => {
    const path = buildGameFeelLearningPath(fixtureResources);

    expect(path.id).toBe('game-feel');
    expect(path.stages.map(({ id }) => id)).toEqual([
      'observe',
      'understand',
      'deconstruct',
      'reconstruct',
      'integrate',
      'practice',
    ]);
    expect(path.stages.map(({ resources }) => resources.length)).toEqual([12, 18, 24, 24, 14, 8]);
    expect(path.stages.slice(0, 4).map(({ egdsAction, experienceLayer }) => [egdsAction, experienceLayer])).toEqual([
      ['感受', '情绪体验'],
      ['理解', '主观感受'],
      ['解构', '客观原因'],
      ['重构', '设计杠杆'],
    ]);
    expect(path.stages.flatMap(({ resources }) => resources)).toHaveLength(100);
  });

  it('selects only game-feel resources, never duplicates an item, and is stable under input reversal', () => {
    const path = buildGameFeelLearningPath(fixtureResources);
    const selected = path.stages.flatMap(({ resources }) => resources);
    const reversed = buildGameFeelLearningPath([...fixtureResources].reverse());

    expect(selected.every(({ resourceTopicIds }) => resourceTopicIds.includes('game-feel-feedback'))).toBe(true);
    expect(new Set(selected.map(({ id }) => id)).size).toBe(100);
    expect(reversed.stages.flatMap(({ resources }) => resources).map(({ id }) => id))
      .toEqual(selected.map(({ id }) => id));
  });

  it('fails clearly when the topic cannot provide the requested pilot size', () => {
    expect(() => buildGameFeelLearningPath(fixtureResources.slice(0, 99)))
      .toThrow('至少需要 100 条');
  });
});
