import { describe, expect, it } from 'vitest';

import resourceIntake from '../../docs/research/2026-08-09-resource-intake.md?raw';
import contentConfigSource from '../../src/content.config.ts?raw';

import atlasEvidence from '../../src/data/atlas-evidence.json';
import atlasGenreFamilies from '../../src/data/atlas-genre-families.json';
import atlasNodes from '../../src/data/atlas-nodes.json';
import atlasRelations from '../../src/data/atlas-relations.json';
import atlasTags from '../../src/data/atlas-tags.json';
import atlasThemes from '../../src/data/atlas-themes.json';
import capabilities from '../../src/data/capabilities.json';
import capabilityRelations from '../../src/data/capability-relations.json';
import egdsFrameworkNodes from '../../src/data/egds-framework-nodes.json';
import egdsFrameworkRelations from '../../src/data/egds-framework-relations.json';
import knowledgeTopics from '../../src/data/knowledge-topics.json';
import resourceTopics from '../../src/data/resource-topics.json';
import resources from '../../src/data/resources.json';
import roleProfiles from '../../src/data/role-profiles.json';
import sources from '../../src/data/sources.json';
import catalogLoadSource from '../../src/lib/catalog/load.ts?raw';
import catalogValidateSource from '../../src/lib/catalog/validate.ts?raw';
import {
  normalizeCatalogUrl,
  validateCatalog,
  type Catalog,
} from '../../src/lib/catalog/validate';

const collections = {
  egdsFrameworkNodes,
  egdsFrameworkRelations,
  capabilities,
  knowledgeTopics,
  capabilityRelations,
  resourceTopics,
  sources,
  resources,
  roleProfiles,
  atlasGenreFamilies,
  atlasTags,
  atlasNodes,
  atlasEvidence,
  atlasRelations,
  atlasThemes,
};
const rawDataFiles = Object.keys(import.meta.glob('../../src/data/*.json'));

describe('early electronic game Atlas slice', () => {
  it('contains the approved nodes and bounded relation claims', () => {
    const nodeIds = [
      'tennis-for-two', 'spacewar', 'brown-box', 'galaxy-game', 'computer-space',
      'magnavox-odyssey', 'odyssey-table-tennis', 'pong', 'home-pong',
    ];
    expect(nodeIds.every((id) => atlasNodes.some((node) => node.id === id))).toBe(true);
    for (const tuple of [
      ['spacewar', 'galaxy-game', 'commercialized-as'],
      ['spacewar', 'computer-space', 'commercialized-as'],
      ['brown-box', 'magnavox-odyssey', 'prototype-to-product'],
      ['odyssey-table-tennis', 'pong', 'design-response'],
      ['pong', 'home-pong', 'commercialized-as'],
    ]) {
      expect(atlasRelations).toContainEqual(expect.objectContaining({
        fromId: tuple[0], toId: tuple[1], type: tuple[2],
      }));
    }
    expect(atlasRelations.some(({ fromId, toId }) => fromId === 'tennis-for-two' && toId === 'pong')).toBe(false);
    expect(JSON.stringify([...atlasNodes, ...atlasRelations])).not.toMatch(/Pong (是|为)(第一款|first video game)/i);
  });
});

describe('raw product catalog data', () => {
  it('defines the approved ordered Atlas Genre Family directory', () => {
    expect(atlasGenreFamilies.map(({ id, order }) => [id, order])).toEqual([
      ['action', 1],
      ['shooter', 2],
      ['adventure', 3],
      ['role-playing', 4],
      ['strategy', 5],
      ['simulation-management', 6],
      ['sports-racing', 7],
      ['puzzle', 8],
      ['sandbox-survival', 9],
      ['rhythm-party', 10],
    ]);
  });

  it('fully retires the generic map catalog and entity placement fields', () => {
    const retiredCollectionKeys = [
      ['domain', 's'].join(''),
      ['map', 'Groups'].join(''),
    ];
    const retiredEntityKeys = [
      ['domain', 'Id'].join(''),
      ['pos', 'ition'].join(''),
    ];
    const retiredDataFiles = [
      ['domain', 's.json'].join(''),
      ['map', '-groups.json'].join(''),
    ];
    const retiredCatalogTypeTokens = [
      ['Map', 'Point'].join(''),
      ['Map', 'Bounds'].join(''),
    ];

    expect.soft(Object.keys(collections)).not.toEqual(expect.arrayContaining(retiredCollectionKeys));
    for (const entries of [capabilities, knowledgeTopics]) {
      for (const entry of entries) {
        expect.soft(Object.keys(entry)).not.toEqual(expect.arrayContaining(retiredEntityKeys));
      }
    }
    for (const filename of retiredDataFiles) {
      expect.soft(rawDataFiles.some((path) => path.endsWith(`/${filename}`)), filename).toBe(false);
    }

    const catalogSources = [contentConfigSource, catalogLoadSource, catalogValidateSource].join('\n');
    for (const token of [...retiredCollectionKeys, ...retiredEntityKeys, ...retiredCatalogTypeTokens]) {
      expect.soft(catalogSources, token).not.toContain(token);
    }
  });

  it('keeps raw IDs unique before Astro content loading', () => {
    for (const [name, entries] of Object.entries(collections)) {
      const ids = entries.map(({ id }) => id);
      expect(new Set(ids).size, `${name} has duplicate raw IDs`).toBe(ids.length);
    }
  });

  it('keeps every raw catalog reference valid during the map migration', () => {
    expect(validateCatalog(collections as unknown as Catalog)).toEqual([]);
  });

  it('provides the approved EGDS expertise map entities', () => {
    expect(capabilities).toHaveLength(42);
    expect(knowledgeTopics).toHaveLength(12);
    expect(capabilityRelations).toHaveLength(64);
    expect(capabilities).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ id: 'playtesting', frameworkNodeId: 'playtest-evidence-iteration' }),
        expect.objectContaining({
          id: 'player-behavior-observation',
          frameworkNodeId: 'playtest-evidence-iteration',
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
      ]).map(normalizeCatalogUrl),
    );

    expect(resourceTopics.length).toBeGreaterThanOrEqual(12);
    expect(resources).toHaveLength(225);
    expect(resources.every(({ resourceTopicIds }) => resourceTopicIds.length === 1)).toBe(true);
    expect(new Set(resources.flatMap(({ resourceTopicIds }) => resourceTopicIds)).size).toBeGreaterThanOrEqual(
      12,
    );
    expect(new Set(resources.map(({ canonicalUrl }) => normalizeCatalogUrl(canonicalUrl))).size).toBe(
      resources.length,
    );
    expect(new Set(sources.map(({ homepage }) => normalizeCatalogUrl(homepage))).size).toBe(
      sources.length,
    );

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
      expect(
        workUrls.has(normalizeCatalogUrl(source.homepage)),
        `${source.id} homepage is a Work Item`,
      ).toBe(false);
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

  it('adds a bounded evidence-backed resource expansion to low-coverage areas', () => {
    const expansionCanonicalUrls = [
      'https://ocw.mit.edu/courses/cms-608-game-design-fall-2010/',
      'https://aaai.org/papers/ws04-04-001-mda-a-formal-approach-to-game-design-and-game-research/',
      'https://gameaccessibilityguidelines.com/full-list/',
      'https://research.chalmers.se/en/publication/177148',
      'https://www.gamedeveloper.com/business/ethical-free-to-play-game-design-and-why-it-matters-',
      'https://book.leveldesignbook.com/process/combat',
      'https://book.leveldesignbook.com/process/combat/encounter',
      'https://book.leveldesignbook.com/process/combat/enemy',
      'https://thegamedesignroundtable.com/episode/303-darkest-dungeon-2-with-chris-bourassa-and-tyler-sigman/',
      'https://thegamedesignroundtable.com/episode/305-thirsty-suitors-with-chandana-ekanayake/',
      'https://thegamedesignroundtable.com/episode/298-tchia-with-phil-crifo/',
      'https://thegamedesignroundtable.com/episode/293-interview-with-mark-rosewater/',
      'https://thegamedesignroundtable.com/episode/297-gerson-da-silva-talks-kingdom-rush/',
      'https://thegamedesignroundtable.com/episode/design-talk-nyt-games-with-rohit-crasta/',
      'https://owlcat.games/learning',
      'https://mud.co.uk/richard/hcds.htm',
      'https://www.lizengland.com/blog/2014/04/the-door-problem/',
      'https://www.routledge.com/Building-Blocks-of-Tabletop-Game-Design-An-Encyclopedia-of-Mechanisms/Engelstein-Shalev/p/book/9781032015811',
      'https://mitpress.mit.edu/9780262017138/characteristics-of-games/',
      'https://www.directingvideogames.com/2017/07/05/5-essential-qualities-video-game-creative-director/',
    ];
    const expansion = resources.filter(({ canonicalUrl }) =>
      expansionCanonicalUrls.includes(canonicalUrl),
    );

    expect(expansion).toHaveLength(expansionCanonicalUrls.length);
    expect(new Set(expansion.map(({ canonicalUrl }) => canonicalUrl))).toEqual(
      new Set(expansionCanonicalUrls),
    );
    expect(expansion.every(({ resourceTopicIds }) => resourceTopicIds.length === 1)).toBe(true);
    expect(expansion.every(({ accessVersions }) => accessVersions.length >= 1)).toBe(true);

    const countBy = (field: 'mediaType' | 'originalLanguage', value: string) =>
      resources.filter((resource) => resource[field] === value).length;
    const topicCount = (topicId: string) =>
      resources.filter(({ resourceTopicIds }) => resourceTopicIds.includes(topicId)).length;
    const capabilityCount = (capabilityId: string) =>
      resources.filter(({ capabilityIds }) => capabilityIds.includes(capabilityId)).length;
    const consumableLanguageCount = (language: string) =>
      resources.filter(({ accessVersions }) =>
        accessVersions.some((version) => version.language === language),
      ).length;

    expect(topicCount('systems-mechanics')).toBeGreaterThanOrEqual(8);
    expect(topicCount('leadership-creative-direction')).toBeGreaterThanOrEqual(6);
    expect(topicCount('practitioner-interviews-podcasts')).toBeGreaterThanOrEqual(7);
    expect(countBy('mediaType', 'article')).toBeGreaterThanOrEqual(7);
    expect(countBy('mediaType', 'course')).toBeGreaterThanOrEqual(4);
    expect(countBy('mediaType', 'paper')).toBeGreaterThanOrEqual(10);
    expect(countBy('mediaType', 'podcast')).toBeGreaterThanOrEqual(11);
    expect(countBy('mediaType', 'website')).toBeGreaterThanOrEqual(13);
    expect(consumableLanguageCount('zh-Hans')).toBeGreaterThanOrEqual(10);
    expect(capabilityCount('encounter-space-composition')).toBeGreaterThanOrEqual(3);
    expect(capabilityCount('monetization-experience-alignment')).toBeGreaterThanOrEqual(3);
  });

  it('adds a second bounded multilingual expansion without growing the talk catalog', () => {
    const expansionCanonicalUrls = [
      'https://gameinstitute.qq.com/course/detail/10029',
      'https://gameinstitute.qq.com/course/detail/10033',
      'https://gameinstitute.qq.com/course/detail/10034',
      'https://gameinstitute.qq.com/course/detail/10028',
      'https://gameinstitute.qq.com/course/detail/10025',
      'https://gameinstitute.qq.com/course/detail/10003',
      'https://gameinstitute.qq.com/course/detail/10010',
      'https://gameinstitute.qq.com/course/detail/10243',
      'https://www.icourse163.org/course/CUC-1003769001',
      'https://gameinstitute.qq.com/course/detail/10191',
      'https://www.jstage.jst.go.jp/article/digraj/2/1/2_56/_article/-char/ja',
      'https://www.jstage.jst.go.jp/article/digraj/10/0/10_9/_article/-char/ja',
      'https://www.jstage.jst.go.jp/article/digraj/13/1/13_21/_article/-char/ja',
      'https://www.jstage.jst.go.jp/article/digraj/3/1/3_51/_article/-char/ja',
      'https://www.jstage.jst.go.jp/article/digraj/4/2/4_1/_article/-char/ja',
      'https://www.jstage.jst.go.jp/article/digraj/17/1/17_1/_article/-char/ja',
    ];
    const expansion = resources.filter(({ canonicalUrl }) =>
      expansionCanonicalUrls.includes(canonicalUrl),
    );
    const countBy = (field: 'mediaType' | 'originalLanguage', value: string) =>
      resources.filter((resource) => resource[field] === value).length;
    const capabilityCount = (capabilityId: string) =>
      resources.filter(({ capabilityIds }) => capabilityIds.includes(capabilityId)).length;
    const consumableLanguageCount = (language: string) =>
      resources.filter(({ accessVersions }) =>
        accessVersions.some((version) => version.language === language),
      ).length;
    const accessVersionLanguageCount = (language: string) =>
      resources.flatMap(({ accessVersions }) => accessVersions)
        .filter((version) => version.language === language).length;

    expect(resources.length).toBeGreaterThanOrEqual(164);
    expect(sources.length).toBeGreaterThanOrEqual(31);
    expect(resources.flatMap(({ accessVersions }) => accessVersions).length).toBeGreaterThanOrEqual(177);
    expect(expansion).toHaveLength(16);
    expect(new Set(expansion.map(({ canonicalUrl }) => canonicalUrl))).toEqual(
      new Set(expansionCanonicalUrls),
    );
    expect(expansion.every(({ resourceTopicIds }) => resourceTopicIds.length === 1)).toBe(true);
    expect(expansion.every(({ accessVersions }) => accessVersions.length === 1)).toBe(true);
    expect(expansion.filter(({ mediaType }) => mediaType === 'course')).toHaveLength(9);
    expect(expansion.filter(({ mediaType }) => mediaType === 'paper')).toHaveLength(6);
    expect(expansion.filter(({ mediaType }) => mediaType === 'talk')).toHaveLength(1);
    expect(expansion.filter(({ originalLanguage }) => originalLanguage === 'zh-Hans')).toHaveLength(10);
    expect(expansion.filter(({ originalLanguage }) => originalLanguage === 'ja')).toHaveLength(6);

    expect(countBy('mediaType', 'course')).toBeGreaterThanOrEqual(13);
    expect(countBy('mediaType', 'paper')).toBeGreaterThanOrEqual(16);
    expect(countBy('mediaType', 'talk')).toBe(98);
    expect(countBy('originalLanguage', 'en')).toBeGreaterThanOrEqual(137);
    expect(countBy('originalLanguage', 'zh-Hans')).toBe(20);
    expect(countBy('originalLanguage', 'ja')).toBe(9);
    expect(consumableLanguageCount('en')).toBeGreaterThanOrEqual(138);
    expect(consumableLanguageCount('zh-Hans')).toBe(22);
    expect(consumableLanguageCount('ja')).toBe(9);
    expect(accessVersionLanguageCount('en')).toBeGreaterThanOrEqual(148);
    expect(accessVersionLanguageCount('zh-Hans')).toBe(22);
    expect(accessVersionLanguageCount('ja')).toBe(9);

    expect(capabilityCount('choice-consequence-design')).toBeGreaterThanOrEqual(3);
    expect(capabilityCount('player-behavior-observation')).toBeGreaterThanOrEqual(5);
    expect(capabilityCount('market-reference-analysis')).toBeGreaterThanOrEqual(3);
    expect(capabilityCount('narrative-exposition')).toBeGreaterThanOrEqual(5);
    expect(capabilityCount('navigation-wayfinding-design')).toBeGreaterThanOrEqual(3);
    expect(capabilityCount('emotional-arc-shaping')).toBeGreaterThanOrEqual(5);
    expect(capabilityCount('interactive-narrative-design')).toBeGreaterThanOrEqual(5);
    expect(capabilityCount('qualitative-evidence-synthesis')).toBeGreaterThanOrEqual(6);
    expect(capabilityCount('value-proposition-framing')).toBeGreaterThanOrEqual(4);
  });

  it('adds a compact English expansion from durable learning formats', () => {
    const expansionCanonicalUrls = [
      'https://ocw.mit.edu/courses/cms-611j-creating-video-games-fall-2014/',
      'https://gamedesignconcepts.wordpress.com/2009/03/31/what-is-game-design-concepts/',
      'https://gamebalanceconcepts.wordpress.com/2010/06/17/hello-world/',
      'https://lostgarden.home.blog/2022/11/12/the-workshopping-skill/',
      'https://lostgarden.home.blog/2011/05/03/game-design-logs/',
      'https://heterogenoustasks.wordpress.com/2015/01/26/standard-patterns-in-choice-based-games/',
      'https://partner.steamgames.com/doc/marketing/visibility',
      'https://howtomarketagame.com/2021/07/12/how-to-market-your-indie-game-a-10-step-plan/',
      'https://doi.org/10.1145/2889160.2889253',
      'https://www.choiceofgames.com/make-your-own-games/choicescript-intro/',
    ];
    const expansion = resources.filter(({ canonicalUrl }) =>
      expansionCanonicalUrls.includes(canonicalUrl),
    );
    const countBy = (field: 'mediaType' | 'originalLanguage', value: string) =>
      resources.filter((resource) => resource[field] === value).length;
    const capabilityCount = (capabilityId: string) =>
      resources.filter(({ capabilityIds }) => capabilityIds.includes(capabilityId)).length;
    const consumableLanguageCount = (language: string) =>
      resources.filter(({ accessVersions }) =>
        accessVersions.some((version) => version.language === language),
      ).length;
    const accessVersionLanguageCount = (language: string) =>
      resources.flatMap(({ accessVersions }) => accessVersions)
        .filter((version) => version.language === language).length;

    expect(resources).toHaveLength(225);
    expect(sources).toHaveLength(38);
    expect(resources.flatMap(({ accessVersions }) => accessVersions)).toHaveLength(239);
    expect(expansion).toHaveLength(10);
    expect(new Set(expansion.map(({ canonicalUrl }) => canonicalUrl))).toEqual(
      new Set(expansionCanonicalUrls),
    );
    expect(expansion.every(({ resourceTopicIds }) => resourceTopicIds.length === 1)).toBe(true);
    expect(expansion.every(({ originalLanguage }) => originalLanguage === 'en')).toBe(true);
    expect(expansion.filter(({ mediaType }) => mediaType === 'course')).toHaveLength(3);
    expect(expansion.filter(({ mediaType }) => mediaType === 'article')).toHaveLength(4);
    expect(expansion.filter(({ mediaType }) => mediaType === 'website')).toHaveLength(2);
    expect(expansion.filter(({ mediaType }) => mediaType === 'paper')).toHaveLength(1);
    expect(expansion.filter(({ mediaType }) => mediaType === 'talk')).toHaveLength(0);
    expect(expansion.flatMap(({ accessVersions }) => accessVersions)).toHaveLength(11);

    expect(countBy('mediaType', 'article')).toBe(31);
    expect(countBy('mediaType', 'course')).toBe(16);
    expect(countBy('mediaType', 'paper')).toBe(17);
    expect(countBy('mediaType', 'website')).toBe(18);
    expect(countBy('mediaType', 'talk')).toBe(98);
    expect(countBy('originalLanguage', 'en')).toBe(196);
    expect(countBy('originalLanguage', 'zh-Hans')).toBe(20);
    expect(countBy('originalLanguage', 'ja')).toBe(9);
    expect(consumableLanguageCount('en')).toBe(197);
    expect(consumableLanguageCount('zh-Hans')).toBe(22);
    expect(consumableLanguageCount('ja')).toBe(9);
    expect(accessVersionLanguageCount('en')).toBe(208);
    expect(accessVersionLanguageCount('zh-Hans')).toBe(22);
    expect(accessVersionLanguageCount('ja')).toBe(9);

    expect(capabilityCount('choice-consequence-design')).toBeGreaterThanOrEqual(5);
    expect(capabilityCount('market-reference-analysis')).toBeGreaterThanOrEqual(5);
    expect(capabilityCount('value-proposition-framing')).toBeGreaterThanOrEqual(5);
    expect(capabilityCount('alignment-facilitation')).toBeGreaterThanOrEqual(7);
    expect(capabilityCount('design-specification-handoff')).toBeGreaterThanOrEqual(8);
    expect(capabilityCount('qualitative-evidence-synthesis')).toBeGreaterThanOrEqual(7);
    expect(capabilityCount('narrative-exposition')).toBeGreaterThanOrEqual(7);
    expect(capabilityCount('interactive-narrative-design')).toBeGreaterThanOrEqual(7);
    expect(capabilityCount('player-behavior-observation')).toBeGreaterThanOrEqual(7);
    expect(capabilityCount('monetization-experience-alignment')).toBeGreaterThanOrEqual(4);
  });

  it('adds only the evidence-verified five-item stop-condition resource batch', () => {
    const expansionCanonicalUrls = [
      'https://book.leveldesignbook.com/process/preproduction',
      'https://book.leveldesignbook.com/process/research',
      'https://book.leveldesignbook.com/process/preproduction/scope',
      'https://gameinstitute.qq.com/course/detail/10056',
      'https://gameinstitute.qq.com/course/detail/10123',
    ];
    const expansion = resources.filter(({ canonicalUrl }) =>
      expansionCanonicalUrls.includes(canonicalUrl),
    );

    expect(resources).toHaveLength(225);
    expect(sources).toHaveLength(38);
    expect(resources.flatMap(({ accessVersions }) => accessVersions)).toHaveLength(239);

    const intakeHeader = resourceIntake.slice(
      0,
      resourceIntake.indexOf('## 当前正规化 catalog coverage'),
    );
    const readHeaderWorkItemCount = (pattern: RegExp) => {
      const match = intakeHeader.match(pattern);
      if (!match) throw new Error(`Missing intake Work Item count: ${pattern.source}`);
      return Number(match[1]);
    };
    expect([
      readHeaderWorkItemCount(/Batch A–I 已正规化为 (\d+) 个 catalog Work Item/),
      readHeaderWorkItemCount(/正规化后为 \*\*(\d+) 个 Work Item\*\*/),
    ]).toEqual([resources.length, resources.length]);

    const coverageSection = resourceIntake.slice(
      resourceIntake.indexOf('## 当前正规化 catalog coverage'),
      resourceIntake.indexOf('## 接受候选'),
    );
    const captureCoverageLine = (label: string) => {
      const match = coverageSection.match(new RegExp(`^- ${label}：([^。\\n]+)`, 'm'));
      if (!match) throw new Error(`Missing coverage line: ${label}`);
      return match[1];
    };
    const parseCoverageCounts = (value: string) => {
      const entries = value.split(/[、；]/).map((part): [string, number] => {
        const match = part.trim().match(/^(.+?)(?:：|\s+)(\d+)$/);
        if (!match) throw new Error(`Invalid coverage count: ${part}`);
        return [match[1], Number(match[2])];
      });
      expect(entries).toHaveLength(new Set(entries.map(([key]) => key)).size);
      return Object.fromEntries(entries);
    };
    const countValues = (values: string[]) =>
      Object.fromEntries(
        [...new Set(values)].sort().map((value) => [
          value,
          values.filter((candidate) => candidate === value).length,
        ]),
      );

    expect(parseCoverageCounts(`Work Item：${captureCoverageLine('Work Item')}`)).toEqual({
      'Work Item': resources.length,
      Source: sources.length,
      'Access Version': resources.flatMap(({ accessVersions }) => accessVersions).length,
      'Resource Topic': resourceTopics.length,
    });
    expect(parseCoverageCounts(captureCoverageLine('原始语言'))).toEqual(
      countValues(resources.map(({ originalLanguage }) => originalLanguage)),
    );
    expect(parseCoverageCounts(captureCoverageLine('可消费语言（Work Item 计，可重叠）'))).toEqual(
      Object.fromEntries(
        [...new Set(resources.flatMap(({ accessVersions }) => accessVersions.map(({ language }) => language)))]
          .sort()
          .map((language) => [
            language,
            resources.filter(({ accessVersions }) =>
              accessVersions.some((version) => version.language === language),
            ).length,
          ]),
      ),
    );
    expect(parseCoverageCounts(captureCoverageLine('Access Version 语言'))).toEqual(
      countValues(resources.flatMap(({ accessVersions }) => accessVersions.map(({ language }) => language))),
    );
    expect(parseCoverageCounts(captureCoverageLine('媒介'))).toEqual(
      countValues(resources.map(({ mediaType }) => mediaType)),
    );

    const topicRows = [...coverageSection.matchAll(/^\| ([^|]+?) \| (\d+) \|$/gm)]
      .map(([, title, count]): [string, number] => [title, Number(count)]);
    expect(topicRows).toHaveLength(resourceTopics.length + 1);
    expect(topicRows.filter(([title]) => title === '合计')).toHaveLength(1);
    expect(topicRows).toHaveLength(new Set(topicRows.map(([title]) => title)).size);
    const topicCoverage = Object.fromEntries(
      topicRows.filter(([title]) => title !== '合计'),
    );
    expect(topicCoverage).toEqual(
      Object.fromEntries(
        resourceTopics.map((topic) => [
          topic.title['zh-CN'],
          resources.filter(({ resourceTopicIds }) => resourceTopicIds.includes(topic.id)).length,
        ]),
      ),
    );
    expect(topicCoverage).toHaveProperty('设计基础与概念');
    expect(Object.keys(topicCoverage)).toHaveLength(resourceTopics.length);
    expect(
      Number(coverageSection.match(/^\| 合计 \| (\d+) \|$/m)?.[1]),
    ).toBe(resources.length);
    expect(expansion).toHaveLength(expansionCanonicalUrls.length);
    expect(new Set(expansion.map(({ canonicalUrl }) => canonicalUrl))).toEqual(
      new Set(expansionCanonicalUrls),
    );
    expect(expansion.every(({ resourceTopicIds }) => resourceTopicIds.length === 1)).toBe(true);
    expect(expansion.filter(({ mediaType }) => mediaType === 'website')).toHaveLength(3);
    expect(expansion.filter(({ mediaType }) => mediaType === 'talk')).toHaveLength(2);
    expect(expansion.filter(({ originalLanguage }) => originalLanguage === 'en')).toHaveLength(3);
    expect(expansion.filter(({ originalLanguage }) => originalLanguage === 'zh-Hans')).toHaveLength(2);
    expect(new Set(expansion.map(({ sourceId }) => sourceId))).toEqual(
      new Set(['level-design-book', 'tencent-games-academy']),
    );

    const expectedBatchG = {
      'https://book.leveldesignbook.com/process/preproduction': {
        sourceId: 'level-design-book',
        mediaType: 'website',
        originalLanguage: 'en',
        capabilityIds: ['scope-prioritization', 'learning-prototype-design'],
        knowledgeTopicIds: ['production-pipelines-constraints'],
        resourceTopicIds: ['production-iteration'],
      },
      'https://book.leveldesignbook.com/process/research': {
        sourceId: 'level-design-book',
        mediaType: 'website',
        originalLanguage: 'en',
        capabilityIds: ['experience-deconstruction', 'research-question-framing'],
        knowledgeTopicIds: [],
        resourceTopicIds: ['research-player-experience'],
      },
      'https://book.leveldesignbook.com/process/preproduction/scope': {
        sourceId: 'level-design-book',
        mediaType: 'website',
        originalLanguage: 'en',
        capabilityIds: ['scope-prioritization', 'learning-prototype-design'],
        knowledgeTopicIds: ['production-pipelines-constraints'],
        resourceTopicIds: ['prototyping-experimentation'],
      },
      'https://gameinstitute.qq.com/course/detail/10056': {
        sourceId: 'tencent-games-academy',
        mediaType: 'talk',
        originalLanguage: 'zh-Hans',
        capabilityIds: ['research-question-framing', 'player-behavior-observation'],
        knowledgeTopicIds: ['player-motivation-difference'],
        resourceTopicIds: ['research-player-experience'],
      },
      'https://gameinstitute.qq.com/course/detail/10123': {
        sourceId: 'tencent-games-academy',
        mediaType: 'talk',
        originalLanguage: 'zh-Hans',
        capabilityIds: ['player-perspective-taking', 'game-feel-tuning'],
        knowledgeTopicIds: ['player-motivation-difference', 'perception-attention-emotion'],
        resourceTopicIds: ['chinese-industry-cross-discipline'],
      },
    };

    for (const [canonicalUrl, expected] of Object.entries(expectedBatchG)) {
      const resource = expansion.find((candidate) => candidate.canonicalUrl === canonicalUrl);
      expect(resource).toMatchObject({
        sourceId: expected.sourceId,
        mediaType: expected.mediaType,
        originalLanguage: expected.originalLanguage,
      });
      for (const mappingField of [
        'capabilityIds',
        'knowledgeTopicIds',
        'resourceTopicIds',
      ] as const) {
        expect(resource?.[mappingField]).toHaveLength(expected[mappingField].length);
        expect(new Set(resource?.[mappingField])).toEqual(new Set(expected[mappingField]));
      }
    }

    for (const resource of expansion) {
      expect(resource.accessVersions).toEqual([
        expect.objectContaining({
          language: resource.originalLanguage,
          url: resource.canonicalUrl,
          accessModel: 'free',
          versionRelation: 'original',
          presentationMode: 'original',
          checkedAt: '2026-08-11',
        }),
      ]);
      expect(resource).not.toHaveProperty('externalSignals');
    }

    const normalizedCanonicalUrls = resources.map(({ canonicalUrl }) =>
      normalizeCatalogUrl(canonicalUrl),
    );
    expect(new Set(normalizedCanonicalUrls).size).toBe(resources.length);
  });

  it('adds a verified GDC and author-site expansion without inventing source identities', () => {
    const expansionCanonicalUrls = [
      'https://www.gdcvault.com/play/1035480/-Honkai-Star-Rail-Reimagining',
      'https://www.gdcvault.com/play/1035518/-Prince-of-Persia-The',
      'https://www.gdcvault.com/play/1035528/Avoiding-the-Historical-Accuracy-Trap',
      'https://www.gdcvault.com/play/1035113/Babygirls-Daddies-and-Himbos-Updating',
      'https://www.gdcvault.com/play/1035544/Bear-Hugs-and-Dev-Tears',
      'https://www.gdcvault.com/play/1035529/Building-Big-Impact-One-Brick',
      'https://www.gdcvault.com/play/1035366/Collaboration-and-Creativity-Building-Original',
      'https://www.gdcvault.com/play/1035540/Designing-10-000-Handcrafted-Puzzles',
      'https://www.gdcvault.com/play/1035527/Designing-Relationships-How-to-Make',
      'https://www.gdcvault.com/play/1035147/Developing-Metaphor-ReFantazio-and-the',
      'https://www.gdcvault.com/play/1035541/Process-Lite-Less-Time-on',
      'https://www.gdcvault.com/play/1035520/Production-Traps-How-Producers-and',
      'https://www.gdcvault.com/play/1035407/Tencent-Games-Developer-Summit-Large',
      'https://www.gdcvault.com/play/1035410/Tencent-Games-Developer-Summit-Noise',
      'https://www.gdcvault.com/play/1035152/The-Challenges-in-Developing-an',
      'https://www.gdcvault.com/play/1035510/The-Four-One-Page-Design',
      'https://www.gdcvault.com/play/1035156/The-Secret-to-Narrative-Driven',
      'https://www.gdcvault.com/play/1035490/Three-Mindset-Shifts-to-Lead',
      'https://www.gdcvault.com/play/1035406/Unity-Developer-Summit-Player-First',
      'https://www.gdcvault.com/play/1035483/Using-ARGs-to-Communicate-What',
      'https://lostgarden.com/2023/07/08/kind-games-designing-for-prosocial-multiplayer/',
      'https://lostgarden.com/2023/04/07/a-design-practice-for-social-systems/',
      'https://lostgarden.com/2021/12/12/value-chains/',
      'https://lostgarden.com/2021/01/04/designing-game-content-architectures/',
      'https://lostgarden.com/2018/01/24/cozy-games/',
      'https://howtomarketagame.com/2026/08/11/the-state-of-virtual-3rd-party-festivals-2026/',
      'https://howtomarketagame.com/2026/06/25/how-the-steam-personal-calendar-affects-your-launch/',
      'https://howtomarketagame.com/2026/04/13/making-sense-of-the-february-2026-steam-next-fest/',
      'https://howtomarketagame.com/2026/03/03/benchmark-how-much-money-can-you-make-from-dlc/',
      'https://howtomarketagame.com/2026/02/12/only-28-games-recovered-from-a-bad-launch-in-2024-what-do-they-have-in-common/',
    ];
    const expansion = resources.filter(({ canonicalUrl }) => expansionCanonicalUrls.includes(canonicalUrl));

    expect(expansion).toHaveLength(30);
    expect(new Set(expansion.map(({ canonicalUrl }) => canonicalUrl))).toEqual(new Set(expansionCanonicalUrls));
    expect(expansion.every(({ originalLanguage }) => originalLanguage === 'en')).toBe(true);
    expect(expansion.every(({ resourceTopicIds }) => resourceTopicIds.length === 1)).toBe(true);
    expect(expansion.filter(({ sourceId }) => sourceId === 'gdc-vault')).toHaveLength(20);
    expect(expansion.filter(({ sourceId }) => sourceId === 'lost-garden')).toHaveLength(5);
    expect(expansion.filter(({ sourceId }) => sourceId === 'how-to-market-a-game')).toHaveLength(5);
    expect(expansion.filter(({ mediaType }) => mediaType === 'talk')).toHaveLength(20);
    expect(expansion.filter(({ mediaType }) => mediaType === 'article')).toHaveLength(10);
    expect(expansion.flatMap(({ accessVersions }) => accessVersions)).toHaveLength(30);
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

  it('adds the verified GDC and Game Developer resource batch', () => {
    const batchCanonicalUrls = [
      'https://www.gdcvault.com/play/1014938/Where-s-the-Fun-How',
      'https://www.gdcvault.com/play/1021660/Learning-from-Feedback-with-Gunhouse',
      'https://www.gdcvault.com/play/1027870/Early-Stage-Game-Evaluation-Lessons',
      'https://www.gdcvault.com/play/1021181/Where-are-the-Sharks-User',
      'https://www.gdcvault.com/play/1019938/Dynamics-for',
      'https://www.gdcvault.com/play/1027615/Give-Your-Players-a-Seat',
      'https://www.gdcvault.com/play/1023059/Improving-Playtesting-Through-Workshops-Focusing',
      'https://www.gamedeveloper.com/design/tips-for-encouraging-embracing-and-processing-game-design-feedback',
      'https://www.gamedeveloper.com/design/how-supporting-core-loops-and-early-prototyping-are-key-to-your-game-s-success',
      'https://www.gamedeveloper.com/design/reminder-use-rapid-prototyping',
      'https://www.gamedeveloper.com/design/an-approach-to-game-design',
      'https://www.gamedeveloper.com/design/the-imposter-s-guide-to-taking-feedback',
      'https://www.gamedeveloper.com/design/on-prototyping-and-coding-your-own-ideas',
      'https://www.gamedeveloper.com/design/prototypes-the-lego-blocks-of-game-development',
      'https://www.gamedeveloper.com/design/rapid-prototyping-tips-for-running-an-effective-r-d-process',
      'https://www.gamedeveloper.com/programming/prototyping-and-code-quality',
    ];
    const batch = resources.filter(({ canonicalUrl }) =>
      batchCanonicalUrls.includes(canonicalUrl),
    );

    expect(resources).toHaveLength(225);
    expect(sources).toHaveLength(38);
    expect(resources.flatMap(({ accessVersions }) => accessVersions)).toHaveLength(239);
    expect(new Set(batch.map(({ canonicalUrl }) => canonicalUrl))).toEqual(
      new Set(batchCanonicalUrls),
    );
    expect(batch).toHaveLength(16);
    expect(batch.filter(({ mediaType }) => mediaType === 'talk')).toHaveLength(7);
    expect(batch.filter(({ mediaType }) => mediaType === 'article')).toHaveLength(9);
    expect(batch.every(({ originalLanguage }) => originalLanguage === 'en')).toBe(true);
    expect(batch.every(({ resourceTopicIds }) => resourceTopicIds.length === 1)).toBe(true);
    expect(batch.every(({ accessVersions }) =>
      accessVersions.length === 1
      && accessVersions[0].language === 'en'
      && accessVersions[0].versionRelation === 'original'
      && accessVersions[0].presentationMode === 'original'
      && accessVersions[0].checkedAt === '2026-08-12'
      && accessVersions[0].url.length > 0,
    )).toBe(true);
    expect(batch.filter(({ sourceId }) => sourceId === 'gdc-vault').every(({ accessVersions }) =>
      accessVersions[0].accessModel === 'subscription',
    )).toBe(true);
    expect(batch.filter(({ sourceId }) => sourceId === 'game-developer').every(({ accessVersions }) =>
      accessVersions[0].accessModel === 'free',
    )).toBe(true);
  });
});
