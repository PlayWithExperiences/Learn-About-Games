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
  learningTrails: [],
  roleProfiles: [],
  atlasCategories: [],
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
        translationKind: 'original',
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
  });
  catalog.capabilities.push({
    id: 'capability',
    name: localized('能力'),
    summary: localized('示例能力。'),
    domainId: 'domain',
  });
  catalog.knowledgeTopics.push({
    id: 'knowledge-topic',
    name: localized('知识议题'),
    summary: localized('示例议题。'),
    domainId: 'domain',
  });
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
    });

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
          translationKind: 'original',
          checkedAt: '2026-08-09',
        },
      ],
    });

    expect(validateCatalog(catalog).map(({ code }) => code)).toEqual([
      'RESOURCE_SOURCE_MISSING',
      'RESOURCE_CAPABILITY_MISSING',
    ]);
  });

  it('reports missing capability and resource references on learning trails', () => {
    const catalog = emptyCatalog();
    catalog.learningTrails.push({
      id: 'playtest-basics',
      title: localized('Playtest 基础'),
      summary: localized('示例路径。'),
      capabilityId: 'missing-capability',
      resourceIds: ['missing-resource'],
      concepts: [],
      exercises: [],
      selfChecks: [],
    });

    expect(validateCatalog(catalog).map(({ code }) => code)).toEqual([
      'TRAIL_CAPABILITY_MISSING',
      'TRAIL_RESOURCE_MISSING',
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
    catalog.atlasRelations.push({
      id: 'missing-lineage',
      fromId: 'missing-from',
      toId: 'missing-to',
      type: 'direct-influence',
      evidenceStatus: 'confirmed',
      evidenceIds: ['missing-evidence'],
      summary: localized('示例关系。'),
    });

    expect(validateCatalog(catalog).map(({ code }) => code)).toEqual([
      'ATLAS_RELATION_ENDPOINT_MISSING',
      'ATLAS_RELATION_ENDPOINT_MISSING',
      'ATLAS_RELATION_EVIDENCE_MISSING',
    ]);
  });

  it('accepts empty non-map collections', () => {
    const catalog = emptyCatalog();
    catalog.domains.push({
      id: 'iteration',
      name: localized('迭代与验证'),
      summary: localized('通过观察与反馈检验设计。'),
      order: 1,
    });
    catalog.capabilities.push({
      id: 'playtesting',
      name: localized('Playtest'),
      summary: localized('通过观察验证设计判断。'),
      domainId: 'iteration',
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
    });
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
          translationKind: 'original',
          checkedAt: '2026-08-09',
        },
      ],
    });

    expect(validateCatalog(catalog)).toContainEqual({
      code: 'RESOURCE_ACCESS_MODEL_INVALID',
      collection: 'resources',
      id: 'regional-is-not-access',
      field: 'accessVersions.accessModel',
      targetId: 'regional',
    });
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
          translationKind: 'machine',
          checkedAt: '2026-02-31',
        },
      ],
    });

    expect(validateCatalog(catalog).map(({ code }) => code)).toEqual([
      'RESOURCE_MEDIA_TYPE_INVALID',
      'RESOURCE_TRANSLATION_KIND_INVALID',
      'RESOURCE_ACCESS_VERSION_CHECKED_AT_INVALID',
    ]);
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
    catalog.capabilityRelations.push(
      {
        id: 'missing-capability',
        fromId: 'capability',
        toId: 'missing-capability',
        type: 'supports',
        summary: localized('示例关系。'),
      },
      {
        id: 'self-relation',
        fromId: 'capability',
        toId: 'capability',
        type: 'complements',
        summary: localized('示例关系。'),
      },
    );

    expect(validateCatalog(catalog).map(({ code }) => code)).toEqual([
      'CAPABILITY_RELATION_TO_CAPABILITY_MISSING',
      'CAPABILITY_RELATION_SELF_REFERENCE',
    ]);
  });
});
