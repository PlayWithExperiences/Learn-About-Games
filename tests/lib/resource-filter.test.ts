import { describe, expect, it } from 'vitest';

import type { Catalog } from '../../src/lib/catalog/validate';
import { filterResources } from '../../src/lib/resource-filter';

type Resource = Catalog['resources'][number];

function makeResource(
  id: string,
  overrides: Partial<Resource> = {},
): Resource {
  return {
    id,
    title: { 'zh-CN': id },
    summary: { 'zh-CN': `${id} summary` },
    sourceId: 'source-a',
    capabilityIds: ['capability-a'],
    knowledgeTopicIds: ['knowledge-a'],
    resourceTopicIds: ['topic-a'],
    mediaType: 'article',
    canonicalUrl: `https://example.com/${id}`,
    whyRelevant: { 'zh-CN': `${id} relevance` },
    originalLanguage: 'en',
    accessVersions: [
      {
        language: 'en',
        url: `https://example.com/${id}`,
        accessModel: 'free',
        versionRelation: 'original',
        presentationMode: 'original',
        checkedAt: '2026-08-09',
      },
    ],
    ...overrides,
  };
}

const resources: Resource[] = [
  makeResource('first-match', {
    externalSignals: [
      {
        provider: 'Public counter',
        label: 'views',
        value: '1',
        observedAt: '2026-08-09',
        url: 'https://example.com/first-match',
      },
    ],
  }),
  makeResource('different-topic', {
    resourceTopicIds: ['topic-b'],
  }),
  makeResource('different-facts', {
    sourceId: 'source-b',
    capabilityIds: ['capability-b'],
    knowledgeTopicIds: ['knowledge-b'],
    mediaType: 'video',
    originalLanguage: 'ja',
    accessVersions: [
      {
        language: 'zh-Hans',
        url: 'https://example.com/different-facts-zh',
        accessModel: 'subscription',
        versionRelation: 'official',
        presentationMode: 'subtitled',
        checkedAt: '2026-08-09',
      },
    ],
  }),
  makeResource('second-match', {
    externalSignals: [
      {
        provider: 'Public counter',
        label: 'views',
        value: '999999',
        observedAt: '2026-08-09',
        url: 'https://example.com/second-match',
      },
    ],
  }),
];

describe('resource factual filtering', () => {
  it.each([
    ['resourceTopic', { resourceTopic: 'topic-b' }, ['different-topic']],
    ['knowledgeTopic', { knowledgeTopic: 'knowledge-b' }, ['different-facts']],
    ['capabilityId', { capabilityId: 'capability-b' }, ['different-facts']],
    ['language', { language: 'zh-Hans' }, ['different-facts']],
    ['mediaType', { mediaType: 'video' }, ['different-facts']],
    ['accessModel', { accessModel: 'subscription' }, ['different-facts']],
    ['sourceId', { sourceId: 'source-b' }, ['different-facts']],
  ] as const)('filters by %s', (_label, filters, expectedIds) => {
    expect(filterResources(resources, filters).map(({ id }) => id)).toEqual(expectedIds);
  });

  it('combines filters with AND semantics', () => {
    expect(
      filterResources(resources, {
        resourceTopic: 'topic-a',
        knowledgeTopic: 'knowledge-b',
        capabilityId: 'capability-b',
        language: 'zh-Hans',
        mediaType: 'video',
        accessModel: 'subscription',
        sourceId: 'source-b',
      }).map(({ id }) => id),
    ).toEqual(['different-facts']);
  });

  it('preserves catalog order and never uses external observations to rank results', () => {
    expect(filterResources(resources, {}).map(({ id }) => id)).toEqual([
      'first-match',
      'different-topic',
      'different-facts',
      'second-match',
    ]);
  });
});
