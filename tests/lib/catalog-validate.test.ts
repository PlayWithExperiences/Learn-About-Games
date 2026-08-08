import { describe, expect, it } from 'vitest';

import { validateCatalog, type Catalog } from '../../src/lib/catalog/validate';

const localized = (text: string) => ({ 'zh-CN': text });

const emptyCatalog = (): Catalog => ({
  domains: [],
  capabilities: [],
  knowledgeTopics: [],
  capabilityRelations: [],
  resourceTopics: [],
  sources: [],
  resources: [],
  roleProfiles: [],
  atlasTags: [],
  atlasNodes: [],
  atlasEvidence: [],
  atlasRelations: [],
  atlasThemes: [],
});

const emptyV02Catalog = (): Catalog => emptyCatalog();

const validV02Resource = (id: string, canonicalUrl: string) =>
  ({
    id,
    title: localized('资源'),
    summary: localized('示例资源。'),
    sourceId: 'source',
    capabilityIds: ['capability'],
    knowledgeTopicIds: ['knowledge-topic'],
    resourceTopicIds: ['resource-topic'],
    mediaType: 'video',
    canonicalUrl,
    whyRelevant: localized('它直接讲解该能力。'),
    originalLanguage: 'en',
    accessVersions: [
      {
        language: 'en',
        url: canonicalUrl,
        accessModel: 'free',
        versionRelation: 'original',
        presentationMode: 'original',
        checkedAt: '2026-08-09',
      },
    ],
  }) as unknown as Catalog['resources'][number];

const seedV02References = (catalog: Catalog) => {
  catalog.domains.push({
    id: 'domain',
    name: localized('领域'),
    summary: localized('示例领域。'),
    order: 1,
    bounds: { x: 0, y: 0, width: 50, height: 50 },
  } as unknown as Catalog['domains'][number]);
  catalog.capabilities.push({
    id: 'capability',
    name: localized('能力'),
    summary: localized('示例能力。'),
    domainId: 'domain',
    position: { x: 10, y: 10 },
  } as unknown as Catalog['capabilities'][number]);
  catalog.knowledgeTopics.push({
    id: 'knowledge-topic',
    name: localized('知识议题'),
    summary: localized('示例议题。'),
    domainId: 'domain',
    position: { x: 20, y: 20 },
  } as unknown as Catalog['knowledgeTopics'][number]);
  catalog.resourceTopics.push({
    id: 'resource-topic',
    title: localized('资源主题'),
    summary: localized('示例主题。'),
    capabilityIds: ['capability'],
    knowledgeTopicIds: ['knowledge-topic'],
  });
  catalog.sources.push({
    id: 'source',
    name: localized('来源'),
    kind: 'channel',
    summary: localized('示例来源。'),
    homepage: 'https://example.com/source',
    languages: ['en'],
  } as unknown as Catalog['sources'][number]);
};

describe('validateCatalog', () => {
  it('reports a capability with a missing domain', () => {
    const catalog = emptyCatalog();
    catalog.capabilities.push({
      id: 'playtesting',
      name: localized('Playtest'),
      summary: localized('通过观察验证设计判断。'),
      domainId: 'missing-domain',
      position: { x: 10, y: 10 },
    } as Catalog['capabilities'][number]);

    expect(validateCatalog(catalog)).toContainEqual({
      code: 'CAPABILITY_DOMAIN_MISSING',
      collection: 'capabilities',
      id: 'playtesting',
      field: 'domainId',
      targetId: 'missing-domain',
    });
  });

  it('reports missing source and capability references on resources', () => {
    const catalog = emptyCatalog();
    catalog.resources.push({
      id: 'observation-guide',
      title: localized('观察指南'),
      summary: localized('示例资源。'),
      sourceId: 'missing-source',
      capabilityIds: ['missing-capability'],
      knowledgeTopicIds: [],
      resourceTopicIds: [],
      mediaType: 'article',
      canonicalUrl: 'https://example.com/observation-guide',
      whyRelevant: localized('示例关联。'),
      originalLanguage: 'zh-CN',
      accessVersions: [
        {
          language: 'zh-CN',
          url: 'https://example.com/observation-guide',
          accessModel: 'free',
          versionRelation: 'original',
          presentationMode: 'original',
          checkedAt: '2026-08-09',
        },
      ],
    });

    expect(validateCatalog(catalog).map(({ code }) => code)).toEqual([
      'RESOURCE_SOURCE_MISSING',
      'RESOURCE_CAPABILITY_MISSING',
    ]);
  });

  it('reports a role profile with a missing capability', () => {
    const catalog = emptyCatalog();
    catalog.roleProfiles.push({
      id: 'designer-small-team',
      title: localized('中小团队游戏设计师'),
      roleId: 'game-designer',
      productionContextId: 'small-team',
      basis: localized('示例依据。'),
      basisLinks: [
        {
          title: localized('公开依据'),
          url: 'https://example.com/basis',
          sourceNote: localized('示例来源。'),
        },
      ],
      reviewedAt: '2026-08-09',
      caveats: localized('仅作参考。'),
      capabilities: [
        {
          capabilityId: 'missing-capability',
          priority: 'core',
          responsibility: 'execute',
        },
      ],
    });

    expect(validateCatalog(catalog)).toContainEqual({
      code: 'PROFILE_CAPABILITY_MISSING',
      collection: 'roleProfiles',
      id: 'designer-small-team',
      field: 'capabilities.capabilityId',
      targetId: 'missing-capability',
    });
  });

  it('reports missing endpoints and evidence on Atlas relations', () => {
    const catalog = emptyCatalog();
    catalog.atlasRelations.push(
      {
        id: 'missing-lineage',
        fromId: 'missing-from',
        toId: 'missing-to',
        type: 'direct-influence',
        status: 'confirmed',
        directionality: 'directed',
        evidenceIds: ['missing-evidence'],
        tags: ['missing-tag'],
        summary: localized('示例关系。'),
      } as unknown as Catalog['atlasRelations'][number],
    );

    expect(validateCatalog(catalog).map(({ code }) => code)).toEqual([
      'ATLAS_RELATION_ENDPOINT_MISSING',
      'ATLAS_RELATION_ENDPOINT_MISSING',
      'ATLAS_RELATION_EVIDENCE_MISSING',
      'ATLAS_TAG_REFERENCE_MISSING',
    ]);
  });

  it('validates Atlas shared tags across nodes, relations, and themes', () => {
    const catalog = emptyCatalog();
    catalog.atlasEvidence.push({
      id: 'evidence',
      title: localized('证据'),
      url: 'https://example.com/evidence',
      summary: localized('示例证据。'),
    });
    catalog.atlasNodes.push(
      {
        id: 'node',
        kind: 'game',
        name: localized('游戏'),
        summary: localized('示例游戏。'),
        startYear: 2000,
        lane: 1,
        tags: ['missing-node-tag'],
        evidenceIds: ['evidence'],
      } as unknown as Catalog['atlasNodes'][number],
    );
    catalog.atlasRelations.push(
      {
        id: 'self-context',
        fromId: 'node',
        toId: 'node',
        type: 'structural-similarity',
        status: 'credible',
        directionality: 'undirected',
        tags: ['missing-relation-tag'],
        evidenceIds: ['evidence'],
        summary: localized('示例关系。'),
      } as unknown as Catalog['atlasRelations'][number],
    );
    catalog.atlasThemes.push(
      {
        id: 'theme',
        title: localized('主题'),
        summary: localized('示例主题。'),
        tags: ['missing-theme-tag'],
      } as unknown as Catalog['atlasThemes'][number],
    );

    expect(validateCatalog(catalog).map(({ code }) => code)).toEqual([
      'ATLAS_TAG_REFERENCE_MISSING',
      'ATLAS_TAG_REFERENCE_MISSING',
      'ATLAS_TAG_REFERENCE_MISSING',
    ]);
  });

  it('requires valid Atlas node date ranges and evidence references', () => {
    const catalog = emptyCatalog();
    catalog.atlasNodes.push(
      {
        id: 'game-range',
        kind: 'game',
        name: localized('不应有范围的游戏'),
        summary: localized('示例游戏。'),
        startYear: 2000,
        endYear: 2001,
        lane: 1,
        tags: [],
        evidenceIds: [],
      } as unknown as Catalog['atlasNodes'][number],
      {
        id: 'category-without-range',
        kind: 'category',
        name: localized('缺少范围的类别形成'),
        summary: localized('示例类别。'),
        startYear: 2001,
        lane: 1,
        tags: [],
        evidenceIds: ['missing-evidence'],
      } as unknown as Catalog['atlasNodes'][number],
    );

    expect(validateCatalog(catalog).map(({ code }) => code)).toEqual([
      'ATLAS_NODE_DATE_RANGE_INVALID',
      'ATLAS_NODE_EVIDENCE_REQUIRED',
      'ATLAS_NODE_DATE_RANGE_INVALID',
      'ATLAS_NODE_EVIDENCE_MISSING',
    ]);
  });

  it('constrains Atlas relation type, status, and directionality enums', () => {
    const catalog = emptyCatalog();
    catalog.atlasRelations.push(
      {
        id: 'invalid-relation',
        fromId: 'missing',
        toId: 'missing',
        type: 'descendant',
        status: 'certain',
        directionality: 'both',
        tags: [],
        evidenceIds: [],
        summary: localized('无效关系。'),
      } as unknown as Catalog['atlasRelations'][number],
    );

    expect(validateCatalog(catalog).map(({ code }) => code)).toEqual([
      'ATLAS_RELATION_ENDPOINT_MISSING',
      'ATLAS_RELATION_ENDPOINT_MISSING',
      'ATLAS_RELATION_TYPE_INVALID',
      'ATLAS_RELATION_STATUS_INVALID',
      'ATLAS_RELATION_DIRECTIONALITY_INVALID',
      'ATLAS_RELATION_EVIDENCE_REQUIRED',
    ]);
  });

  it('enforces directed and undirected Atlas relation semantics', () => {
    const catalog = emptyCatalog();
    catalog.atlasRelations.push(
      {
        id: 'influence-without-arrow',
        fromId: 'missing-a',
        toId: 'missing-b',
        type: 'direct-influence',
        status: 'credible',
        directionality: 'undirected',
        tags: [],
        evidenceIds: [],
        summary: localized('方向错误。'),
      } as unknown as Catalog['atlasRelations'][number],
      {
        id: 'similarity-with-arrow',
        fromId: 'missing-a',
        toId: 'missing-b',
        type: 'structural-similarity',
        status: 'credible',
        directionality: 'directed',
        tags: [],
        evidenceIds: [],
        summary: localized('方向错误。'),
      } as unknown as Catalog['atlasRelations'][number],
    );

    expect(validateCatalog(catalog).filter(({ code }) => code.includes('DIRECTIONALITY'))).toEqual([
      expect.objectContaining({
        code: 'ATLAS_RELATION_DIRECTIONALITY_INVALID',
        id: 'influence-without-arrow',
      }),
      expect.objectContaining({
        code: 'ATLAS_RELATION_DIRECTIONALITY_INVALID',
        id: 'similarity-with-arrow',
      }),
    ]);
  });

  it('requires an explanation for confirmed direct influence that points backward in time', () => {
    const catalog = emptyCatalog();
    catalog.atlasTags.push({
      id: 'lens',
      name: localized('透镜'),
      summary: localized('示例标签。'),
    });
    catalog.atlasEvidence.push({
      id: 'evidence',
      title: localized('证据'),
      url: 'https://example.com/evidence',
      summary: localized('示例证据。'),
    });
    catalog.atlasNodes.push(
      {
        id: 'later',
        kind: 'game',
        name: localized('较晚作品'),
        summary: localized('示例游戏。'),
        startYear: 2000,
        lane: 1,
        tags: ['lens'],
        evidenceIds: ['evidence'],
      } as unknown as Catalog['atlasNodes'][number],
      {
        id: 'earlier',
        kind: 'game',
        name: localized('较早作品'),
        summary: localized('示例游戏。'),
        startYear: 1990,
        lane: 1,
        tags: ['lens'],
        evidenceIds: ['evidence'],
      } as unknown as Catalog['atlasNodes'][number],
    );
    catalog.atlasRelations.push(
      {
        id: 'backward-influence',
        fromId: 'later',
        toId: 'earlier',
        type: 'direct-influence',
        status: 'confirmed',
        directionality: 'directed',
        tags: ['lens'],
        evidenceIds: ['evidence'],
        summary: localized('时间倒置。'),
      } as unknown as Catalog['atlasRelations'][number],
    );

    expect(validateCatalog(catalog)).toContainEqual({
      code: 'ATLAS_RELATION_CHRONOLOGY_UNEXPLAINED',
      collection: 'atlasRelations',
      id: 'backward-influence',
      field: 'chronologyExplanation',
      targetId: 'later:2000>earlier:1990',
    });
  });

  it('accepts empty non-map collections', () => {
    const catalog = emptyCatalog();
    catalog.domains.push({
      id: 'iteration',
      name: localized('迭代与验证'),
      summary: localized('通过观察与反馈检验设计。'),
      order: 1,
      bounds: { x: 0, y: 0, width: 50, height: 50 },
    });
    catalog.capabilities.push({
      id: 'playtesting',
      name: localized('Playtest'),
      summary: localized('通过观察验证设计判断。'),
      domainId: 'iteration',
      position: { x: 10, y: 10 },
    });

    expect(validateCatalog(catalog)).toEqual([]);
  });

  it('requires the v0.2 Source metadata and traceable external signals', () => {
    const catalog = emptyV02Catalog();
    catalog.sources.push({
      id: 'incomplete-source',
      name: localized('不完整来源'),
      kind: '',
      summary: localized('示例来源。'),
      homepage: 'not-a-url',
      languages: [],
      externalSignals: [
        {
          provider: 'YouTube',
          label: 'Subscribers',
          value: '1M',
          observedAt: 'not-a-date',
          url: '',
          rating: 5,
        },
      ],
    } as unknown as Catalog['sources'][number]);

    expect(validateCatalog(catalog).map(({ code }) => code)).toEqual([
      'SOURCE_KIND_INVALID',
      'SOURCE_HOMEPAGE_INVALID',
      'SOURCE_LANGUAGES_REQUIRED',
      'SOURCE_EXTERNAL_SIGNAL_INVALID',
    ]);
  });

  it('keeps Source homepages unique and separate from Work Item URLs', () => {
    const catalog = emptyV02Catalog();
    seedV02References(catalog);
    catalog.sources.push({
      id: 'duplicate-source-homepage',
      name: localized('重复来源'),
      kind: 'publisher',
      summary: localized('示例来源。'),
      homepage: 'https://example.com/source',
      languages: ['en'],
    });
    catalog.resources.push(validV02Resource('work-is-not-source', 'https://example.com/source'));

    expect(validateCatalog(catalog).map(({ code }) => code)).toEqual([
      'SOURCE_HOMEPAGE_DUPLICATE',
      'SOURCE_HOMEPAGE_RESOURCE_URL_CONFLICT',
      'SOURCE_HOMEPAGE_RESOURCE_URL_CONFLICT',
    ]);
  });

  it('validates typed resource topic references and requires one topical connection', () => {
    const catalog = emptyV02Catalog();
    seedV02References(catalog);
    catalog.resources.push({
      ...validV02Resource('missing-topics', 'https://example.com/missing-topics'),
      capabilityIds: [],
      knowledgeTopicIds: ['missing-knowledge-topic'],
      resourceTopicIds: ['missing-resource-topic'],
    });

    expect(validateCatalog(catalog).map(({ code }) => code)).toEqual([
      'RESOURCE_KNOWLEDGE_TOPIC_MISSING',
      'RESOURCE_RESOURCE_TOPIC_MISSING',
    ]);
  });

  it('requires unique canonical identities, a checked access version, and factual external signals', () => {
    const catalog = emptyV02Catalog();
    seedV02References(catalog);
    catalog.resources.push(validV02Resource('one', 'https://example.com/work'));
    catalog.resources.push({
      ...validV02Resource('two', 'https://example.com/work'),
      externalSignals: [
        {
          provider: 'YouTube',
          label: 'Views',
          value: '1000',
          observedAt: '2026-08-09',
          url: 'https://example.com/work',
          score: 9,
        },
      ],
    } as unknown as Catalog['resources'][number]);
    catalog.resources.push({
      ...validV02Resource('without-access', 'https://example.com/no-access'),
      accessVersions: [],
    });

    expect(validateCatalog(catalog).map(({ code }) => code)).toEqual([
      'RESOURCE_CANONICAL_URL_DUPLICATE',
      'RESOURCE_EXTERNAL_SIGNAL_INVALID',
      'RESOURCE_ACCESS_VERSION_REQUIRED',
    ]);
  });

  it('keeps payment access models separate from optional regional restrictions', () => {
    const catalog = emptyV02Catalog();
    seedV02References(catalog);
    catalog.resources.push({
      ...validV02Resource('regional-is-not-access', 'https://example.com/region'),
      accessVersions: [
        {
          language: 'en',
          url: 'https://example.com/region',
          accessModel: 'regional',
          regionRestrictions: [
            {
              regions: ['CN'],
              note: localized('仅限中国大陆。'),
            },
          ],
          versionRelation: 'original',
          presentationMode: 'original',
          checkedAt: '2026-08-09',
        },
      ],
    } as unknown as Catalog['resources'][number]);

    expect(validateCatalog(catalog)).toContainEqual({
      code: 'RESOURCE_ACCESS_MODEL_INVALID',
      collection: 'resources',
      id: 'regional-is-not-access',
      field: 'accessVersions.accessModel',
      targetId: 'regional',
    });
  });

  it('rejects non-web URLs in resource identities and access versions', () => {
    const catalog = emptyV02Catalog();
    seedV02References(catalog);
    catalog.resources.push({
      ...validV02Resource('invalid-urls', 'mailto:hello@example.com'),
      accessVersions: [
        {
          language: 'en',
          url: 'javascript:alert(1)',
          accessModel: 'free',
          versionRelation: 'original',
          presentationMode: 'original',
          checkedAt: '2026-08-09',
        },
      ],
    });

    expect(validateCatalog(catalog).map(({ code }) => code)).toEqual([
      'RESOURCE_CANONICAL_URL_INVALID',
      'RESOURCE_ACCESS_VERSION_URL_INVALID',
    ]);
  });

  it('rejects malformed regional restrictions with one error per item', () => {
    const catalog = emptyV02Catalog();
    seedV02References(catalog);
    catalog.resources.push({
      ...validV02Resource('invalid-regions', 'https://example.com/regions'),
      accessVersions: [
        {
          language: 'en',
          url: 'https://example.com/regions',
          accessModel: 'free',
          regionRestrictions: [
            { regions: [], note: localized('无地区。') },
            { regions: [' '], note: { 'zh-CN': '' } },
          ],
          versionRelation: 'original',
          presentationMode: 'original',
          checkedAt: '2026-08-09',
        },
      ],
    } as unknown as Catalog['resources'][number]);

    expect(validateCatalog(catalog).map(({ code }) => code)).toEqual([
      'RESOURCE_REGION_RESTRICTION_INVALID',
      'RESOURCE_REGION_RESTRICTION_INVALID',
    ]);
  });

  it('restricts media, translation, and access-check dates to the catalog contract', () => {
    const catalog = emptyV02Catalog();
    seedV02References(catalog);
    catalog.resources.push({
      ...validV02Resource('invalid-enums', 'https://example.com/invalid-enums'),
      mediaType: 'stream',
      accessVersions: [
        {
          language: 'en',
          url: 'https://example.com/invalid-enums',
          accessModel: 'free',
          versionRelation: 'machine',
          presentationMode: 'machine',
          checkedAt: '2026-02-31',
        },
      ],
    } as unknown as Catalog['resources'][number]);

    expect(validateCatalog(catalog).map(({ code }) => code)).toEqual([
      'RESOURCE_MEDIA_TYPE_INVALID',
      'RESOURCE_VERSION_RELATION_INVALID',
      'RESOURCE_PRESENTATION_MODE_INVALID',
      'RESOURCE_ACCESS_VERSION_CHECKED_AT_INVALID',
    ]);
  });

  it('requires a non-empty external-signal sample size when it is present', () => {
    const catalog = emptyV02Catalog();
    seedV02References(catalog);
    catalog.resources.push({
      ...validV02Resource('empty-sample-size', 'https://example.com/empty-sample-size'),
      externalSignals: [
        {
          provider: 'Example',
          label: '公开计数',
          value: '12',
          sampleSize: ' ',
          observedAt: '2026-08-09',
          url: 'https://example.com/observation',
        },
      ],
    } as unknown as Catalog['resources'][number]);

    expect(validateCatalog(catalog)).toContainEqual({
      code: 'RESOURCE_EXTERNAL_SIGNAL_INVALID',
      collection: 'resources',
      id: 'empty-sample-size',
      field: 'externalSignals',
      targetId: '',
    });
  });

  it('uses explicit role basis and enum-only capability focus semantics', () => {
    const catalog = emptyV02Catalog();
    seedV02References(catalog);
    catalog.roleProfiles.push({
      id: 'invalid-profile',
      title: localized('无依据画像'),
      roleId: 'designer',
      productionContextId: 'aaa',
      basis: localized('示例依据。'),
      basisLinks: [],
      reviewedAt: 'not-a-date',
      caveats: localized('仅作参考。'),
      capabilities: [
        {
          capabilityId: 'missing-capability',
          priority: 'highest',
          responsibility: 'practice',
        },
      ],
    } as unknown as Catalog['roleProfiles'][number]);

    expect(validateCatalog(catalog).map(({ code }) => code)).toEqual([
      'PROFILE_BASIS_LINK_REQUIRED',
      'PROFILE_REVIEWED_AT_INVALID',
      'PROFILE_CAPABILITY_MISSING',
      'PROFILE_PRIORITY_INVALID',
      'PROFILE_RESPONSIBILITY_INVALID',
    ]);
  });

  it('requires web URLs for role-profile basis links and Source external signals', () => {
    const catalog = emptyV02Catalog();
    catalog.sources.push({
      id: 'unsafe-source',
      name: localized('不安全来源'),
      kind: 'website',
      summary: localized('示例来源。'),
      homepage: 'mailto:hello@example.com',
      languages: ['en'],
      externalSignals: [
        {
          provider: 'Example',
          label: 'Views',
          value: '100',
          observedAt: '2026-08-09',
          url: 'data:text/plain,unsafe',
        },
      ],
    } as unknown as Catalog['sources'][number]);
    catalog.roleProfiles.push({
      id: 'unsafe-profile',
      title: localized('不安全画像'),
      roleId: 'designer',
      productionContextId: 'aaa',
      basis: localized('示例依据。'),
      basisLinks: [
        {
          title: localized('非网页依据'),
          url: 'javascript:alert(1)',
          sourceNote: localized('示例来源。'),
        },
      ],
      reviewedAt: '2026-08-09',
      caveats: localized('仅作参考。'),
      capabilities: [],
    } as unknown as Catalog['roleProfiles'][number]);

    expect(validateCatalog(catalog).map(({ code }) => code)).toEqual([
      'SOURCE_HOMEPAGE_INVALID',
      'SOURCE_EXTERNAL_SIGNAL_INVALID',
      'PROFILE_BASIS_LINK_URL_INVALID',
    ]);
  });

  it('requires IDs to be unique within every collection', () => {
    const catalog = emptyV02Catalog();
    catalog.resourceTopics.push(
      {
        id: 'playtest',
        title: localized('Playtest'),
        summary: localized('主题。'),
        capabilityIds: [],
        knowledgeTopicIds: [],
      },
      {
        id: 'playtest',
        title: localized('重复 Playtest'),
        summary: localized('重复主题。'),
        capabilityIds: [],
        knowledgeTopicIds: [],
      },
    );

    expect(validateCatalog(catalog)).toContainEqual({
      code: 'COLLECTION_ID_DUPLICATE',
      collection: 'resourceTopics',
      id: 'playtest',
      field: 'id',
      targetId: 'playtest',
    });
  });

  it('allows capability relations only between distinct capabilities', () => {
    const catalog = emptyV02Catalog();
    seedV02References(catalog);
    catalog.capabilities.push({
      id: 'second-capability',
      name: localized('第二项能力'),
      summary: localized('用于关系测试。'),
      domainId: 'domain',
      position: { x: 30, y: 30 },
    });
    catalog.capabilityRelations.push(
      {
        id: 'knowledge-topic-is-not-capability',
        fromId: 'knowledge-topic',
        toId: 'capability',
        type: 'supports',
        summary: { 'zh-CN': '示例关系。', en: 'Example relation.' },
      },
      {
        id: 'missing-capability',
        fromId: 'capability',
        toId: 'missing-capability',
        type: 'supports',
        summary: { 'zh-CN': '示例关系。', en: 'Example relation.' },
      },
      {
        id: 'self-relation',
        fromId: 'capability',
        toId: 'capability',
        type: 'complements',
        summary: { 'zh-CN': '示例关系。', en: 'Example relation.' },
      },
      {
        id: 'invalid-relation-type',
        fromId: 'capability',
        toId: 'second-capability',
        type: 'prerequisite',
        summary: { 'zh-CN': '示例关系。', en: 'Example relation.' },
      } as unknown as Catalog['capabilityRelations'][number],
    );

    expect(validateCatalog(catalog).map(({ code }) => code)).toEqual([
      'CAPABILITY_RELATION_FROM_CAPABILITY_MISSING',
      'CAPABILITY_RELATION_TO_CAPABILITY_MISSING',
      'CAPABILITY_RELATION_SELF_REFERENCE',
      'CAPABILITY_RELATION_TYPE_INVALID',
    ]);
  });

  it('reports invalid map bounds and node positions outside their domains', () => {
    const catalog = emptyV02Catalog();
    catalog.domains.push({
      id: 'domain',
      name: localized('领域'),
      summary: localized('示例领域。'),
      order: 1,
      bounds: { x: 90, y: 90, width: 20, height: 20 },
    } as unknown as Catalog['domains'][number]);
    catalog.capabilities.push({
      id: 'capability',
      name: localized('能力'),
      summary: localized('示例能力。'),
      domainId: 'domain',
      position: { x: 40, y: 40 },
    } as unknown as Catalog['capabilities'][number]);
    catalog.knowledgeTopics.push({
      id: 'knowledge-topic',
      name: localized('知识议题'),
      summary: localized('示例议题。'),
      domainId: 'domain',
      position: { x: 120, y: 10 },
    } as unknown as Catalog['knowledgeTopics'][number]);

    expect(validateCatalog(catalog).map(({ code }) => code)).toEqual([
      'DOMAIN_BOUNDS_INVALID',
      'CAPABILITY_POSITION_OUTSIDE_DOMAIN',
      'KNOWLEDGE_TOPIC_POSITION_INVALID',
      'KNOWLEDGE_TOPIC_POSITION_OUTSIDE_DOMAIN',
    ]);
  });

  it('rejects duplicate undirected complements and non-bilingual rationales', () => {
    const catalog = emptyV02Catalog();
    seedV02References(catalog);
    catalog.capabilities.push({
      id: 'second-capability',
      name: localized('第二项能力'),
      summary: localized('用于关系测试。'),
      domainId: 'domain',
      position: { x: 30, y: 30 },
    } as unknown as Catalog['capabilities'][number]);
    catalog.capabilityRelations.push(
      {
        id: 'first-complement',
        fromId: 'capability',
        toId: 'second-capability',
        type: 'complements',
        summary: { 'zh-CN': '互补关系。', en: 'A complementary relation.' },
      },
      {
        id: 'reverse-complement',
        fromId: 'second-capability',
        toId: 'capability',
        type: 'complements',
        summary: { 'zh-CN': '反向重复。', en: 'The reverse duplicate.' },
      },
      {
        id: 'missing-english-rationale',
        fromId: 'capability',
        toId: 'second-capability',
        type: 'supports',
        summary: { 'zh-CN': '缺少英文说明。' },
      },
    );

    expect(validateCatalog(catalog).map(({ code }) => code)).toEqual([
      'CAPABILITY_RELATION_COMPLEMENT_DUPLICATE',
      'CAPABILITY_RELATION_RATIONALE_INVALID',
    ]);
  });
});
