import { describe, expect, it } from 'vitest';

import resourceIntake from '../../docs/research/2026-08-09-resource-intake.md?raw';

import atlasCategories from '../../src/data/atlas-categories.json';
import atlasEvidence from '../../src/data/atlas-evidence.json';
import atlasNodes from '../../src/data/atlas-nodes.json';
import atlasRelations from '../../src/data/atlas-relations.json';
import atlasThemes from '../../src/data/atlas-themes.json';
import capabilities from '../../src/data/capabilities.json';
import capabilityRelations from '../../src/data/capability-relations.json';
import domains from '../../src/data/domains.json';
import knowledgeTopics from '../../src/data/knowledge-topics.json';
import resourceTopics from '../../src/data/resource-topics.json';
import resources from '../../src/data/resources.json';
import roleProfiles from '../../src/data/role-profiles.json';
import sources from '../../src/data/sources.json';
import { validateCatalog, type Catalog } from '../../src/lib/catalog/validate';

const collections = {
  domains,
  capabilities,
  knowledgeTopics,
  capabilityRelations,
  resourceTopics,
  sources,
  resources,
  roleProfiles,
  atlasCategories,
  atlasNodes,
  atlasEvidence,
  atlasRelations,
  atlasThemes,
};

describe('raw product catalog data', () => {
  it('keeps raw IDs unique before Astro content loading', () => {
    for (const [name, entries] of Object.entries(collections)) {
      const ids = entries.map(({ id }) => id);
      expect(new Set(ids).size, `${name} has duplicate raw IDs`).toBe(ids.length);
    }
  });

  it('keeps every raw catalog reference valid during the map migration', () => {
    expect(validateCatalog(collections as unknown as Catalog)).toEqual([]);
  });

  it('provides the approved first v0.2 expertise map', () => {
    expect(domains).toHaveLength(8);
    expect(capabilities).toHaveLength(42);
    expect(knowledgeTopics).toHaveLength(12);
    expect(capabilityRelations).toHaveLength(64);
    expect(domains.some(({ id }) => id === 'innovation')).toBe(false);
    expect(capabilities).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ id: 'playtesting', domainId: 'research-validation-data' }),
        expect.objectContaining({
          id: 'player-behavior-observation',
          domainId: 'research-validation-data',
        }),
      ]),
    );
    expect(knowledgeTopics.some(({ id }) => id === 'player-behavior-observation')).toBe(false);
    expect(resourceTopics).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: 'playtesting',
          capabilityIds: expect.arrayContaining(['playtesting', 'player-behavior-observation']),
        }),
      ]),
    );
  });

  it('normalizes a broad, unordered and evidence-backed resource catalog', () => {
    const acceptedIntake = resourceIntake.slice(
      resourceIntake.indexOf('## 接受候选'),
      resourceIntake.indexOf('## 拒绝与待核证据'),
    );
    const intakeCanonicalUrls = new Set(
      [...acceptedIntake.matchAll(/canonicalUrl=([^<\n|]+)/g)].map((match) => match[1]),
    );
    const capabilityIds = new Set(capabilities.map(({ id }) => id));
    const knowledgeTopicIds = new Set(knowledgeTopics.map(({ id }) => id));
    const resourceTopicIds = new Set(resourceTopics.map(({ id }) => id));
    const sourceIds = new Set(sources.map(({ id }) => id));
    const workUrls = new Set(
      resources.flatMap((resource) => [
        resource.canonicalUrl,
        ...resource.accessVersions.map(({ url }) => url),
      ]),
    );

    expect(resourceTopics.length).toBeGreaterThanOrEqual(12);
    expect(new Set(resources.flatMap(({ resourceTopicIds }) => resourceTopicIds)).size).toBeGreaterThanOrEqual(
      12,
    );
    expect(new Set(resources.map(({ canonicalUrl }) => canonicalUrl)).size).toBe(resources.length);
    expect(new Set(sources.map(({ homepage }) => homepage)).size).toBe(sources.length);

    for (const resource of resources) {
      expect(intakeCanonicalUrls.has(resource.canonicalUrl), resource.canonicalUrl).toBe(true);
      expect(sourceIds.has(resource.sourceId), resource.sourceId).toBe(true);
      expect(resource.accessVersions.length).toBeGreaterThan(0);
      expect(
        resource.capabilityIds.length + resource.knowledgeTopicIds.length + resource.resourceTopicIds.length,
      ).toBeGreaterThan(0);
      expect(resource.capabilityIds.every((id) => capabilityIds.has(id))).toBe(true);
      expect(resource.knowledgeTopicIds.every((id) => knowledgeTopicIds.has(id))).toBe(true);
      expect(resource.resourceTopicIds.every((id) => resourceTopicIds.has(id))).toBe(true);
      expect(resource).not.toHaveProperty('reviewStatus');
      expect(resource).not.toHaveProperty('rating');
      expect(resource).not.toHaveProperty('score');
      expect(resource).not.toHaveProperty('rank');
      expect(resource).not.toHaveProperty('featured');
      expect(resource).toHaveProperty('canonicalUrl');
      expect(resource).toHaveProperty('whyRelevant');
      expect(resource).toHaveProperty('originalLanguage');
      for (const version of resource.accessVersions) {
        expect(version).toHaveProperty('accessModel');
        expect(version).not.toHaveProperty('access');
        expect(version).toHaveProperty('versionRelation');
        expect(version).toHaveProperty('presentationMode');
        expect(version).not.toHaveProperty('translationKind');
        expect(version).toHaveProperty('checkedAt');
      }
    }

    for (const topic of resourceTopics) {
      expect(topic.capabilityIds.every((id) => capabilityIds.has(id))).toBe(true);
      expect(topic.knowledgeTopicIds.every((id) => knowledgeTopicIds.has(id))).toBe(true);
    }

    for (const source of sources) {
      expect(workUrls.has(source.homepage), `${source.id} homepage is a Work Item`).toBe(false);
    }

    const coverage = {
      sources: sources.length,
      workItems: resources.length,
      topics: resourceTopics.length,
      media: Object.fromEntries(
        [...new Set(resources.map(({ mediaType }) => mediaType))]
          .sort()
          .map((mediaType) => [
            mediaType,
            resources.filter((resource) => resource.mediaType === mediaType).length,
          ]),
      ),
      languages: Object.fromEntries(
        [...new Set(resources.flatMap(({ accessVersions }) => accessVersions.map(({ language }) => language)))]
          .sort()
          .map((language) => [
            language,
            resources.filter(({ accessVersions }) =>
              accessVersions.some((version) => version.language === language),
            ).length,
          ]),
      ),
    };
    console.info('Resource catalog coverage', coverage);
  });

  it('merges known language versions and applies conservative access facts', () => {
    const valuesAtPlay = resources.find(({ canonicalUrl }) =>
      canonicalUrl.includes('/values-at-play-in-digital-games/'),
    );
    expect(valuesAtPlay?.accessVersions).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          language: 'en',
          versionRelation: 'original',
          presentationMode: 'original',
        }),
        expect.objectContaining({
          language: 'zh-Hans',
          versionRelation: 'official',
          presentationMode: 'translated',
        }),
      ]),
    );

    const sakurai = resources.find(({ canonicalUrl }) => canonicalUrl.includes('watch?v=hTNA84vJNEc'));
    expect(sakurai?.accessVersions).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ language: 'ja', versionRelation: 'original' }),
        expect.objectContaining({ language: 'en', versionRelation: 'official' }),
      ]),
    );

    const appleLocalizedUi = resources.find(({ canonicalUrl }) =>
      canonicalUrl.includes('i=1000757781449'),
    );
    expect(appleLocalizedUi?.accessVersions.map(({ language }) => language)).toEqual(['en']);

    for (const resource of resources.filter(({ canonicalUrl }) =>
      canonicalUrl.includes('gdcvault.com/play/'),
    )) {
      expect(resource.accessVersions.every(({ accessModel }) => accessModel === 'subscription')).toBe(true);
    }

    const eaSession = resources.filter(({ canonicalUrl, accessVersions }) =>
      [canonicalUrl, ...accessVersions.map(({ url }) => url)].some((url) =>
        /gdcvault\.com\/play\/101455[12]\//.test(url),
      ),
    );
    expect(eaSession).toHaveLength(1);
    expect(eaSession[0].accessVersions.map(({ url }) => url)).toEqual(
      expect.arrayContaining([
        'https://www.gdcvault.com/play/1014551/The-Science-of-Play-Testing',
        'https://www.gdcvault.com/play/1014552/The-Science-of-Play-Testing',
      ]),
    );

    expect(resources).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          canonicalUrl: 'https://www.gdcvault.com/play/1027680/AI-in-Game-Development',
          title: expect.objectContaining({
            'zh-CN': 'Production Essentials Summit: The Agile vs Waterfall Myth',
          }),
        }),
      ]),
    );

    expect(resources.map(({ canonicalUrl }) => canonicalUrl)).not.toEqual(
      expect.arrayContaining([
        'https://www.routledge.com/Game-Mechanics-Advanced-Game-Design/Adams-Dormans/p/book/9780321820273',
        'https://doi.org/10.1145/1371216.1371232',
      ]),
    );
  });

  it('keeps Sources and the AAA reference profile traceable', () => {
    for (const source of sources) {
      expect(source.summary['zh-CN']).toBeTruthy();
      expect(source.languages.length).toBeGreaterThan(0);
    }

    expect(roleProfiles).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: 'aaa-game-designer',
          title: expect.objectContaining({ 'zh-CN': 'AAA · Game Designer' }),
          reviewedAt: '2026-08-09',
          basisLinks: expect.arrayContaining([
            expect.objectContaining({ url: expect.stringMatching(/^https:\/\//) }),
          ]),
        }),
      ]),
    );
  });
});
