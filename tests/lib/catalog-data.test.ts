import { describe, expect, it } from 'vitest';

import resourceIntake from '../../docs/research/2026-08-09-resource-intake.md?raw';

import atlasEvidence from '../../src/data/atlas-evidence.json';
import atlasNodes from '../../src/data/atlas-nodes.json';
import atlasRelations from '../../src/data/atlas-relations.json';
import atlasTags from '../../src/data/atlas-tags.json';
import atlasThemes from '../../src/data/atlas-themes.json';
import capabilities from '../../src/data/capabilities.json';
import capabilityRelations from '../../src/data/capability-relations.json';
import domains from '../../src/data/domains.json';
import egdsFrameworkNodes from '../../src/data/egds-framework-nodes.json';
import egdsFrameworkRelations from '../../src/data/egds-framework-relations.json';
import knowledgeTopics from '../../src/data/knowledge-topics.json';
import mapGroups from '../../src/data/map-groups.json';
import resourceTopics from '../../src/data/resource-topics.json';
import resources from '../../src/data/resources.json';
import roleProfiles from '../../src/data/role-profiles.json';
import sources from '../../src/data/sources.json';
import { validateCatalog, type Catalog } from '../../src/lib/catalog/validate';

const collections = {
  domains,
  mapGroups,
  egdsFrameworkNodes,
  egdsFrameworkRelations,
  capabilities,
  knowledgeTopics,
  capabilityRelations,
  resourceTopics,
  sources,
  resources,
  roleProfiles,
  atlasTags,
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

  it('defines the exact EGDS framework topology and relations', () => {
    expect(egdsFrameworkNodes).toHaveLength(28);
    expect(egdsFrameworkRelations).toHaveLength(4);
    expect(capabilities).toHaveLength(42);
    expect(knowledgeTopics).toHaveLength(12);
    expect(capabilityRelations).toHaveLength(64);

    expect(
      egdsFrameworkNodes.map(({ id, kind, parentNodeId, order, name }) => [
        id,
        kind,
        parentNodeId ?? null,
        order,
        name['zh-CN'],
        name.en,
      ]),
    ).toEqual([
      ['egds-root', 'root', null, 1, 'Expertise / EGDS', 'Expertise / EGDS'],
      ['experience-design', 'branch', 'egds-root', 1, '体验设计', 'Experience Design'],
      ['from-plan-to-ship', 'branch', 'egds-root', 2, '从计划到落地', 'From Plan to Ship'],
      ['with-team', 'branch', 'egds-root', 3, '如果有团队', 'If We Have a Team'],
      [
        'product-profit',
        'branch',
        'egds-root',
        4,
        '如果希望形成产品与盈利',
        'If We Want Product and Profit',
      ],
      ['beyond-games', 'branch', 'egds-root', 5, '如果讨论的不只是游戏', 'Beyond Games'],
      [
        'experience-journey',
        'entry',
        'experience-design',
        1,
        '体验旅程与情绪曲线',
        'Experience Journey and Emotional Curve',
      ],
      ['perception', 'stage', 'experience-design', 2, '感受', 'Perception'],
      ['rationalization', 'stage', 'experience-design', 3, '理解', 'Rationalization'],
      ['deconstruction', 'stage', 'experience-design', 4, '解构', 'Deconstruction'],
      ['reconstruction', 'stage', 'experience-design', 5, '重构', 'Reconstruction'],
      ['narrative-lever', 'lever', 'reconstruction', 1, '叙事', 'Narrative'],
      ['aesthetics-lever', 'lever', 'reconstruction', 2, '美学与表现', 'Aesthetics and Presentation'],
      [
        'gameplay-challenges-lever',
        'lever',
        'reconstruction',
        3,
        '玩法与挑战',
        'Gameplay and Challenges',
      ],
      [
        'mindset-problem-solving-tools',
        'cluster',
        'from-plan-to-ship',
        1,
        '心态、问题解决与工具使用',
        'Mindset, Problem-Solving and Tools',
      ],
      [
        'prototype-production-breakdown',
        'cluster',
        'from-plan-to-ship',
        2,
        '原型、生产与任务拆解',
        'Prototyping, Production and Task Breakdown',
      ],
      [
        'playtest-evidence-iteration',
        'cluster',
        'from-plan-to-ship',
        3,
        'Playtest、证据与迭代',
        'Playtest, Evidence and Iteration',
      ],
      [
        'tradeoff-specification-delivery',
        'cluster',
        'from-plan-to-ship',
        4,
        '取舍、规格与交付',
        'Trade-offs, Specification and Delivery',
      ],
      [
        'vision-direction-decisions',
        'cluster',
        'with-team',
        1,
        '愿景、方向与决策',
        'Vision, Direction and Decisions',
      ],
      [
        'alignment-communication',
        'cluster',
        'with-team',
        2,
        '对齐、沟通与表达',
        'Alignment, Communication and Expression',
      ],
      [
        'leadership-management',
        'cluster',
        'with-team',
        3,
        '领导、管理与交付保障',
        'Leadership, Management and Delivery Assurance',
      ],
      [
        'feedback-collaboration',
        'cluster',
        'with-team',
        4,
        '反馈、协作与共识促成',
        'Feedback, Collaboration and Consensus',
      ],
      [
        'audience-positioning-cluster',
        'cluster',
        'product-profit',
        1,
        '受众与定位',
        'Audience and Positioning',
      ],
      [
        'market-opportunity',
        'cluster',
        'product-profit',
        2,
        '市场与未满足体验',
        'Market and Unmet Experiences',
      ],
      ['value-exchange', 'cluster', 'product-profit', 3, '价值交换', 'Value Exchange'],
      [
        'monetization-alignment',
        'cluster',
        'product-profit',
        4,
        '商业化与体验目标协调',
        'Monetization and Experience Alignment',
      ],
      ['values-culture', 'cluster', 'beyond-games', 1, '价值观、伦理与文化', 'Values, Ethics and Culture'],
      [
        'innovation-possibility-space',
        'external-entry',
        'beyond-games',
        2,
        '创新与更大的可能性空间',
        'Innovation and a Larger Possibility Space',
      ],
    ]);

    expect(egdsFrameworkRelations).toEqual([
      {
        id: 'process-perception-rationalization',
        type: 'process-next',
        fromId: 'perception',
        toId: 'rationalization',
      },
      {
        id: 'process-rationalization-deconstruction',
        type: 'process-next',
        fromId: 'rationalization',
        toId: 'deconstruction',
      },
      {
        id: 'process-deconstruction-reconstruction',
        type: 'process-next',
        fromId: 'deconstruction',
        toId: 'reconstruction',
      },
      {
        id: 'link-innovation-atlas',
        type: 'links-to',
        fromId: 'innovation-possibility-space',
        targetPath: 'atlas/',
      },
    ]);

    expect(
      egdsFrameworkNodes
        .filter(({ parentNodeId }) => parentNodeId === 'egds-root')
        .sort((left, right) => left.order - right.order)
        .map(({ id, order }) => [id, order]),
    ).toEqual([
      ['experience-design', 1],
      ['from-plan-to-ship', 2],
      ['with-team', 3],
      ['product-profit', 4],
      ['beyond-games', 5],
    ]);

    expect(
      egdsFrameworkRelations
        .filter((relation) => relation.type === 'process-next')
        .map(({ fromId, toId }) => [fromId, toId]),
    ).toEqual([
      ['perception', 'rationalization'],
      ['rationalization', 'deconstruction'],
      ['deconstruction', 'reconstruction'],
    ]);
    expect(
      egdsFrameworkRelations
        .filter((relation) => relation.type === 'links-to')
        .map(({ fromId, targetPath }) => [fromId, targetPath]),
    ).toEqual([['innovation-possibility-space', 'atlas/']]);
  });

  it('places every Capability at its exact EGDS framework node', () => {
    const expectedPlacements = {
      'experience-journey': ['emotional-arc-shaping'],
      perception: ['player-perspective-taking'],
      rationalization: ['experience-framing'],
      deconstruction: ['experience-deconstruction'],
      'narrative-lever': [
        'choice-consequence-design',
        'narrative-architecture',
        'interactive-narrative-design',
        'narrative-exposition',
        'world-character-coherence',
      ],
      'aesthetics-lever': ['aesthetic-direction', 'multimodal-presentation-integration'],
      'gameplay-challenges-lever': [
        'core-loop-design',
        'rules-system-modeling',
        'game-feel-tuning',
        'challenge-difficulty-design',
        'pacing-control',
        'progression-economy-design',
        'level-structure-design',
        'spatial-flow-design',
        'navigation-wayfinding-design',
        'encounter-space-composition',
        'blockout-spatial-validation',
      ],
      'prototype-production-breakdown': ['learning-prototype-design', 'task-breakdown'],
      'playtest-evidence-iteration': [
        'research-question-framing',
        'playtesting',
        'player-behavior-observation',
        'qualitative-evidence-synthesis',
        'telemetry-interpretation',
        'iteration-planning',
      ],
      'tradeoff-specification-delivery': ['scope-prioritization', 'design-specification-handoff'],
      'vision-direction-decisions': [
        'constraint-aware-decision-making',
        'creative-vision-stewardship',
      ],
      'alignment-communication': ['cross-discipline-communication', 'alignment-facilitation'],
      'feedback-collaboration': ['design-critique-feedback'],
      'audience-positioning-cluster': ['audience-positioning'],
      'market-opportunity': ['market-reference-analysis'],
      'value-exchange': ['value-proposition-framing'],
      'monetization-alignment': ['monetization-experience-alignment'],
      'values-culture': ['ethical-cultural-evaluation'],
    } as const;

    const actualPlacements = Object.fromEntries(
      Object.keys(expectedPlacements).map((frameworkNodeId) => [
        frameworkNodeId,
        capabilities
          .filter((capability) => capability.frameworkNodeId === frameworkNodeId)
          .map(({ id }) => id),
      ]),
    );

    expect(actualPlacements).toEqual(expectedPlacements);
    expect(capabilities.every(({ frameworkNodeId }) => typeof frameworkNodeId === 'string')).toBe(true);
  });

  it('places every Knowledge Topic at its exact EGDS framework node', () => {
    const expectedPlacements = {
      perception: ['player-motivation-difference', 'perception-attention-emotion'],
      'narrative-lever': ['narratology-agency-authorship'],
      'aesthetics-lever': ['audiovisual-semiotics'],
      'gameplay-challenges-lever': [
        'emergence-complexity',
        'probability-randomness-fairness',
        'spatial-cognition-wayfinding',
      ],
      'prototype-production-breakdown': ['production-pipelines-constraints'],
      'playtest-evidence-iteration': ['research-ethics-bias'],
      'leadership-management': ['organizational-dynamics-power'],
      'market-opportunity': ['game-industry-platform-economics'],
      'values-culture': ['games-values-culture'],
    } as const;

    const actualPlacements = Object.fromEntries(
      Object.keys(expectedPlacements).map((frameworkNodeId) => [
        frameworkNodeId,
        knowledgeTopics
          .filter((topic) => topic.frameworkNodeId === frameworkNodeId)
          .map(({ id }) => id),
      ]),
    );

    expect(actualPlacements).toEqual(expectedPlacements);
    expect(knowledgeTopics.every(({ frameworkNodeId }) => typeof frameworkNodeId === 'string')).toBe(true);
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
