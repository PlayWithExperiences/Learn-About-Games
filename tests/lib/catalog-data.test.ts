import { describe, expect, it } from 'vitest';

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
          knowledgeTopicIds: [],
        }),
      ]),
    );
    for (const resource of resources) {
      expect(resource.capabilityIds).toEqual(
        expect.arrayContaining(['playtesting', 'player-behavior-observation']),
      );
      expect(resource.knowledgeTopicIds).not.toContain('player-behavior-observation');
    }
  });

  it('keeps Work Items factual and canonically unique', () => {
    expect(resources.map(({ id }) => id)).toEqual(
      expect.arrayContaining(['valves-secret-weapon', 'how-to-run-a-good-playtest']),
    );
    expect(new Set(resources.map(({ canonicalUrl }) => canonicalUrl)).size).toBe(resources.length);

    for (const resource of resources) {
      expect(resource).not.toHaveProperty('reviewStatus');
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
  });

  it('keeps Sources and the AAA reference profile traceable', () => {
    expect(sources).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ id: 'game-makers-toolkit', kind: 'channel' }),
        expect.objectContaining({ id: 'play-with-experiences', kind: 'organization' }),
      ]),
    );

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
