import { describe, expect, it } from 'vitest';

import egdsFrameworkNodes from '../../src/data/egds-framework-nodes.json';
import egdsFrameworkRelations from '../../src/data/egds-framework-relations.json';
import capabilities from '../../src/data/capabilities.json';
import roleProfiles from '../../src/data/role-profiles.json';
import {
  normalizeCatalogUrl,
  validateCatalog,
  type Catalog,
} from '../../src/lib/catalog/validate';

const localized = (text: string) => ({ 'zh-CN': text });

const emptyCatalog = (): Catalog => ({
  egdsFrameworkNodes: structuredClone(egdsFrameworkNodes) as unknown as Catalog['egdsFrameworkNodes'],
  egdsFrameworkRelations: structuredClone(
    egdsFrameworkRelations,
  ) as unknown as Catalog['egdsFrameworkRelations'],
  capabilities: [],
  knowledgeTopics: [],
  capabilityRelations: [],
  resourceTopics: [],
  sources: [],
  resources: [],
  roleProfiles: [],
  atlasGenreFamilies: [],
  atlasTags: [],
  atlasNodes: [],
  atlasEvidence: [],
  atlasRelations: [],
  atlasThemes: [],
});

const emptyV02Catalog = (): Catalog => emptyCatalog();

const rawCareerCatalog = (): Catalog => ({
  ...emptyCatalog(),
  capabilities: structuredClone(capabilities) as Catalog['capabilities'],
  roleProfiles: structuredClone(roleProfiles) as Catalog['roleProfiles'],
});

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
  catalog.capabilities.push({
    id: 'capability',
    name: localized('能力'),
    summary: localized('示例能力。'),
    frameworkNodeId: 'perception',
  } as unknown as Catalog['capabilities'][number]);
  catalog.knowledgeTopics.push({
    id: 'knowledge-topic',
    name: localized('知识议题'),
    summary: localized('示例议题。'),
    frameworkNodeId: 'perception',
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
  it('validates Atlas Genre Family orders and Theme family references', () => {
    const catalog = emptyCatalog();
    catalog.atlasGenreFamilies.push(
      {
        id: 'action',
        title: localized('动作'),
        summary: localized('强调实时输入与动作执行。'),
        order: 1,
      },
      {
        id: 'adventure',
        title: localized('冒险'),
        summary: localized('强调探索、叙事与问题求解。'),
        order: 1,
      },
    );
    catalog.atlasThemes.push({
      id: 'invalid-lineage',
      title: localized('无效谱系'),
      summary: localized('用于验证 family 引用。'),
      familyIds: ['action', 'action', 'missing-family'],
      scopeNote: localized(' '),
      tags: [],
    });

    expect(validateCatalog(catalog).filter(({ code }) => code.startsWith('ATLAS_'))).toEqual([
      {
        code: 'ATLAS_GENRE_FAMILY_ORDER_DUPLICATE',
        collection: 'atlasGenreFamilies',
        id: 'adventure',
        field: 'order',
        targetId: '1',
      },
      {
        code: 'ATLAS_THEME_FAMILY_DUPLICATE',
        collection: 'atlasThemes',
        id: 'invalid-lineage',
        field: 'familyIds.1',
        targetId: 'action',
      },
      {
        code: 'ATLAS_THEME_FAMILY_MISSING',
        collection: 'atlasThemes',
        id: 'invalid-lineage',
        field: 'familyIds.2',
        targetId: 'missing-family',
      },
      {
        code: 'ATLAS_THEME_SCOPE_INVALID',
        collection: 'atlasThemes',
        id: 'invalid-lineage',
        field: 'scopeNote',
        targetId: '',
      },
    ]);
  });

  it('allows only the foundation Atlas Theme to omit Genre Families', () => {
    const catalog = emptyCatalog();
    catalog.atlasThemes.push(
      {
        id: 'early-electronic-games',
        title: localized('早期电子游戏与商业化'),
        summary: localized('非类型的基础历史透镜。'),
        familyIds: [],
        scopeNote: localized('追踪实验、原型与商业产品，不将其归为单一类型。'),
        tags: [],
      },
      {
        id: 'lineage-without-family',
        title: localized('缺少 Family 的谱系'),
        summary: localized('用于验证非基础透镜必须引用 Family。'),
        familyIds: [],
        scopeNote: localized('只验证 family 约束。'),
        tags: [],
      },
    );

    expect(validateCatalog(catalog).filter(({ code }) => code === 'ATLAS_THEME_FAMILY_MISSING'))
      .toEqual([
        {
          code: 'ATLAS_THEME_FAMILY_MISSING',
          collection: 'atlasThemes',
          id: 'lineage-without-family',
          field: 'familyIds',
          targetId: '',
        },
      ]);
  });

  it('reports a framework node with a missing parent', () => {
    const catalog = emptyCatalog();
    const node = catalog.egdsFrameworkNodes.find(({ id }) => id === 'experience-journey');
    expect(node).toBeDefined();
    node!.parentNodeId = 'missing-parent';

    expect(validateCatalog(catalog)).toContainEqual({
      code: 'EGDS_PARENT_NODE_MISSING',
      collection: 'egdsFrameworkNodes',
      id: 'experience-journey',
      field: 'parentNodeId',
      targetId: 'missing-parent',
    });
  });

  it('reports a cycle in the EGDS framework parent chain', () => {
    const catalog = emptyCatalog();
    const node = catalog.egdsFrameworkNodes.find(({ id }) => id === 'experience-journey');
    expect(node).toBeDefined();
    node!.parentNodeId = 'experience-journey';

    expect(validateCatalog(catalog)).toContainEqual({
      code: 'EGDS_FRAMEWORK_CYCLE',
      collection: 'egdsFrameworkNodes',
      id: 'experience-journey',
      field: 'parentNodeId',
      targetId: 'experience-journey',
    });
  });

  it('requires exactly one egds-root framework root', () => {
    const catalog = emptyCatalog();
    catalog.egdsFrameworkNodes.push({
      ...structuredClone(catalog.egdsFrameworkNodes[0]),
      id: 'second-root',
    });

    expect(validateCatalog(catalog)).toContainEqual({
      code: 'EGDS_ROOT_COUNT_INVALID',
      collection: 'egdsFrameworkNodes',
      id: 'egds-root',
      field: 'kind/parentNodeId',
      targetId: 'egds-root,second-root',
    });
  });

  it('requires the exact five ordered root branches', () => {
    const catalog = emptyCatalog();
    const branch = catalog.egdsFrameworkNodes.find(({ id }) => id === 'experience-design');
    expect(branch).toBeDefined();
    branch!.order = 6;

    expect(validateCatalog(catalog)).toContainEqual({
      code: 'EGDS_BRANCH_SET_INVALID',
      collection: 'egdsFrameworkNodes',
      id: 'egds-root',
      field: 'parentNodeId/order',
      targetId:
        'from-plan-to-ship:2:branch,with-team:3:branch,product-profit:4:branch,beyond-games:5:branch,experience-design:6:branch',
    });
  });

  it('requires the exact EGDS process relation tuple set', () => {
    const catalog = emptyCatalog();
    const relation = catalog.egdsFrameworkRelations.find(
      ({ id }) => id === 'process-perception-rationalization',
    );
    expect(relation?.type).toBe('process-next');
    if (relation?.type === 'process-next') relation.toId = 'deconstruction';

    expect(validateCatalog(catalog)).toContainEqual({
      code: 'EGDS_PROCESS_RELATION_SET_INVALID',
      collection: 'egdsFrameworkRelations',
      id: 'process-next',
      field: 'fromId/toId',
      targetId:
        'deconstruction:reconstruction,perception:deconstruction,rationalization:deconstruction',
    });
  });

  it('requires the exact EGDS Atlas link relation tuple set', () => {
    const catalog = emptyCatalog();
    const relation = catalog.egdsFrameworkRelations.find(({ id }) => id === 'link-innovation-atlas');
    expect(relation?.type).toBe('links-to');
    if (relation?.type === 'links-to') Object.assign(relation, { targetPath: 'map/' });

    expect(validateCatalog(catalog)).toContainEqual({
      code: 'EGDS_LINK_RELATION_SET_INVALID',
      collection: 'egdsFrameworkRelations',
      id: 'links-to',
      field: 'fromId/targetPath',
      targetId: 'innovation-possibility-space:map/',
    });
  });

  it('reports a missing process relation endpoint without changing the approved tuple set', () => {
    const catalog = emptyCatalog();
    catalog.egdsFrameworkNodes = catalog.egdsFrameworkNodes.filter(({ id }) => id !== 'perception');

    expect(validateCatalog(catalog)).toEqual([
      {
        code: 'EGDS_RELATION_ENDPOINT_MISSING',
        collection: 'egdsFrameworkRelations',
        id: 'process-perception-rationalization',
        field: 'fromId',
        targetId: 'perception',
      },
    ]);
  });

  it('reports a missing links-to source without treating targetPath as a framework endpoint', () => {
    const catalog = emptyCatalog();
    catalog.egdsFrameworkNodes = catalog.egdsFrameworkNodes.filter(
      ({ id }) => id !== 'innovation-possibility-space',
    );

    expect(validateCatalog(catalog)).toEqual([
      {
        code: 'EGDS_RELATION_ENDPOINT_MISSING',
        collection: 'egdsFrameworkRelations',
        id: 'link-innovation-atlas',
        field: 'fromId',
        targetId: 'innovation-possibility-space',
      },
    ]);
  });

  it('rejects entity placement on a non-container EGDS node', () => {
    const catalog = emptyV02Catalog();
    seedV02References(catalog);
    catalog.capabilities[0].frameworkNodeId = 'innovation-possibility-space';

    expect(validateCatalog(catalog)).toContainEqual({
      code: 'EGDS_ENTITY_CONTAINER_INVALID',
      collection: 'capabilities',
      id: 'capability',
      field: 'frameworkNodeId',
      targetId: 'innovation-possibility-space',
    });
  });

  it('reports a Capability placement that references a missing framework node', () => {
    const catalog = emptyV02Catalog();
    seedV02References(catalog);
    catalog.capabilities[0].frameworkNodeId = 'missing-framework-node';

    expect(validateCatalog(catalog)).toContainEqual({
      code: 'CAPABILITY_FRAMEWORK_NODE_MISSING',
      collection: 'capabilities',
      id: 'capability',
      field: 'frameworkNodeId',
      targetId: 'missing-framework-node',
    });
  });

  it('reports a Knowledge Topic placement that references a missing framework node', () => {
    const catalog = emptyV02Catalog();
    seedV02References(catalog);
    catalog.knowledgeTopics[0].frameworkNodeId = 'missing-framework-node';

    expect(validateCatalog(catalog)).toContainEqual({
      code: 'KNOWLEDGE_TOPIC_FRAMEWORK_NODE_MISSING',
      collection: 'knowledgeTopics',
      id: 'knowledge-topic',
      field: 'frameworkNodeId',
      targetId: 'missing-framework-node',
    });
  });

  it('reports missing source and capability references on resources', () => {
    const catalog = emptyCatalog();
    seedV02References(catalog);
    catalog.resources.push({
      id: 'observation-guide',
      title: localized('观察指南'),
      summary: localized('示例资源。'),
      sourceId: 'missing-source',
      capabilityIds: ['missing-capability'],
      knowledgeTopicIds: [],
      resourceTopicIds: ['resource-topic'],
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

  it('reports a duplicate capability mapping with the full nested target', () => {
    const catalog = rawCareerCatalog();
    const profile = catalog.roleProfiles[0];
    const duplicate = structuredClone(profile.capabilities[0]);
    profile.capabilities.push(duplicate);

    expect(validateCatalog(catalog)).toEqual([
      {
        code: 'PROFILE_CAPABILITY_DUPLICATE',
        collection: 'roleProfiles',
        id: profile.id,
        field: 'capabilities',
        targetId: duplicate.capabilityId,
      },
    ]);
  });

  it('accepts the three raw role profiles', () => {
    const catalog = rawCareerCatalog();

    expect(catalog.roleProfiles).toHaveLength(3);
    expect(validateCatalog(catalog)).toEqual([]);
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
    catalog.atlasTags.push({
      id: 'valid-tag',
      name: localized('有效标签'),
      summary: localized('示例标签。'),
    });
    catalog.atlasEvidence.push({
      id: 'evidence',
      title: localized('证据'),
      sourceTitle: 'Evidence',
      originalLanguage: 'en',
      url: 'https://example.com/evidence',
      summary: localized('示例证据。'),
      sourceKind: 'institutional-history',
      institutionOrAuthor: 'Example Institution',
      checkedAt: '2026-08-13',
      locator: 'Example record',
      boundedClaim: localized('只支持示例节点和标签测试。'),
    } as Catalog['atlasEvidence'][number]);
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
      {
        id: 'other-node',
        kind: 'game',
        name: localized('另一款游戏'),
        summary: localized('另一款示例游戏。'),
        startYear: 2001,
        lane: 2,
        tags: ['valid-tag'],
        evidenceIds: ['evidence'],
      } as unknown as Catalog['atlasNodes'][number],
    );
    catalog.atlasRelations.push(
      {
        id: 'self-context',
        fromId: 'node',
        toId: 'other-node',
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
        familyIds: ['family'],
        scopeNote: localized('示例范围。'),
        tags: ['missing-theme-tag'],
      } as unknown as Catalog['atlasThemes'][number],
    );
    catalog.atlasGenreFamilies.push({
      id: 'family',
      title: localized('Family'),
      summary: localized('示例 Family。'),
      order: 1,
    });

    expect(validateCatalog(catalog).map(({ code }) => code)).toEqual([
      'ATLAS_TAG_REFERENCE_MISSING',
      'ATLAS_TAG_REFERENCE_MISSING',
      'ATLAS_TAG_REFERENCE_MISSING',
    ]);
  });

  it('requires event metadata and an explicit role for event relations', () => {
    const catalog = emptyCatalog();
    catalog.atlasEvidence.push({
      id: 'event-evidence',
      title: localized('事件证据'),
      sourceTitle: 'Example archive',
      originalLanguage: 'en',
      url: 'https://example.com/event',
      summary: localized('支持示例事件。'),
      sourceKind: 'institutional-history',
      institutionOrAuthor: 'Example archive',
      checkedAt: '2026-08-13',
      locator: 'Example record',
      boundedClaim: localized('只用于事件元数据校验。'),
    } as Catalog['atlasEvidence'][number]);
    catalog.atlasTags.push(
      { id: 'innovation-event', name: localized('创新事件'), summary: localized('事件标签。') },
      { id: 'event-theme', name: localized('事件主题'), summary: localized('主题标签。') },
    );
    catalog.atlasNodes.push(
      {
        id: 'event-node',
        kind: 'innovation',
        name: localized('事件节点'),
        summary: localized('示例事件。'),
        startYear: 1993,
        lane: 0,
        tags: ['innovation-event'],
        evidenceIds: ['event-evidence'],
      } as unknown as Catalog['atlasNodes'][number],
      {
        id: 'carrier-game',
        kind: 'game',
        name: localized('承载作品'),
        summary: localized('示例作品。'),
        startYear: 1993,
        lane: 1,
        tags: ['event-theme'],
        evidenceIds: ['event-evidence'],
      } as unknown as Catalog['atlasNodes'][number],
    );
    catalog.atlasRelations.push({
      id: 'event-carrier',
      fromId: 'event-node',
      toId: 'carrier-game',
      type: 'design-response',
      status: 'confirmed',
      directionality: 'directed',
      tags: ['event-theme'],
      evidenceIds: ['event-evidence'],
      summary: localized('示例事件关系。'),
    } as unknown as Catalog['atlasRelations'][number]);

    expect(validateCatalog(catalog).map(({ code }) => code)).toEqual([
      'ATLAS_EVENT_ROLE_REQUIRED',
      'ATLAS_EVENT_THEME_REQUIRED',
      'ATLAS_EVENT_MECHANISM_REQUIRED',
      'ATLAS_RELATION_ROLE_REQUIRED',
    ]);
  });

  it('requires original provenance fields on Atlas evidence', () => {
    const catalog = emptyCatalog();
    catalog.atlasEvidence.push(
      {
        id: 'missing-provenance',
        title: localized('证据'),
        sourceTitle: ' ',
        originalLanguage: 'de',
        url: 'not-a-url',
        summary: localized('示例证据。'),
      } as unknown as Catalog['atlasEvidence'][number],
    );

    expect(validateCatalog(catalog).map(({ code }) => code)).toEqual([
      'ATLAS_EVIDENCE_SOURCE_TITLE_INVALID',
      'ATLAS_EVIDENCE_ORIGINAL_LANGUAGE_INVALID',
      'ATLAS_EVIDENCE_URL_INVALID',
      'ATLAS_EVIDENCE_PROVENANCE_INVALID',
      'ATLAS_EVIDENCE_PROVENANCE_INVALID',
      'ATLAS_EVIDENCE_PROVENANCE_INVALID',
      'ATLAS_EVIDENCE_PROVENANCE_INVALID',
      'ATLAS_EVIDENCE_PROVENANCE_INVALID',
    ]);
  });

  it('requires traceable provenance on every Atlas evidence item', () => {
    const catalog = emptyCatalog();
    catalog.atlasEvidence.push({
      id: 'untraceable-evidence',
      title: localized('证据'),
      sourceTitle: 'Evidence',
      originalLanguage: 'en',
      url: 'https://example.com/evidence',
      summary: localized('示例证据。'),
    } as Catalog['atlasEvidence'][number]);

    expect(validateCatalog(catalog)).toEqual([
      {
        code: 'ATLAS_EVIDENCE_PROVENANCE_INVALID',
        collection: 'atlasEvidence',
        id: 'untraceable-evidence',
        field: 'sourceKind',
        targetId: '',
      },
      {
        code: 'ATLAS_EVIDENCE_PROVENANCE_INVALID',
        collection: 'atlasEvidence',
        id: 'untraceable-evidence',
        field: 'institutionOrAuthor',
        targetId: '',
      },
      {
        code: 'ATLAS_EVIDENCE_PROVENANCE_INVALID',
        collection: 'atlasEvidence',
        id: 'untraceable-evidence',
        field: 'checkedAt',
        targetId: '',
      },
      {
        code: 'ATLAS_EVIDENCE_PROVENANCE_INVALID',
        collection: 'atlasEvidence',
        id: 'untraceable-evidence',
        field: 'locator',
        targetId: '',
      },
      {
        code: 'ATLAS_EVIDENCE_PROVENANCE_INVALID',
        collection: 'atlasEvidence',
        id: 'untraceable-evidence',
        field: 'boundedClaim',
        targetId: '',
      },
    ]);
  });

  it('requires every critical field when Atlas evidence opts into extended provenance', () => {
    const provenanceEvidence = {
      id: 'extended-provenance',
      title: localized('证据'),
      sourceTitle: 'Evidence',
      originalLanguage: 'en' as const,
      url: 'https://example.com/evidence',
      summary: localized('示例证据。'),
      sourceKind: 'institutional-history' as const,
      institutionOrAuthor: 'Example Institution',
      checkedAt: '2026-08-12',
      locator: 'History section',
      boundedClaim: localized('只支持这条有限主张。'),
    } satisfies Catalog['atlasEvidence'][number];

    for (const [field, invalidValue] of [
      ['sourceKind', undefined],
      ['institutionOrAuthor', ' '],
      ['checkedAt', '2026-02-30'],
      ['locator', ' '],
      ['boundedClaim', localized(' ')],
    ] as const) {
      const catalog = emptyCatalog();
      catalog.atlasEvidence.push({
        ...provenanceEvidence,
        [field]: invalidValue,
      } as Catalog['atlasEvidence'][number]);

      expect(validateCatalog(catalog), field).toContainEqual({
        code: 'ATLAS_EVIDENCE_PROVENANCE_INVALID',
        collection: 'atlasEvidence',
        id: provenanceEvidence.id,
        field,
        targetId: '',
      });
    }
  });

  it('requires disputed Atlas relations to justify their explicit directionality', () => {
    const catalog = emptyCatalog();
    catalog.atlasTags.push({
      id: 'lens',
      name: localized('透镜'),
      summary: localized('示例标签。'),
    });
    catalog.atlasEvidence.push({
      id: 'evidence',
      title: localized('证据'),
      sourceTitle: 'Evidence',
      originalLanguage: 'en',
      url: 'https://example.com/evidence',
      summary: localized('示例证据。'),
    } as Catalog['atlasEvidence'][number]);
    for (const [id, startYear] of [
      ['one', 2000],
      ['two', 2001],
    ] as const) {
      catalog.atlasNodes.push({
        id,
        kind: 'game',
        name: localized(id),
        summary: localized('示例节点。'),
        startYear,
        lane: 1,
        tags: ['lens'],
        evidenceIds: ['evidence'],
      });
    }
    catalog.atlasRelations.push({
      id: 'unjustified-dispute',
      fromId: 'one',
      toId: 'two',
      type: 'disputed',
      status: 'disputed',
      directionality: 'undirected',
      evidenceIds: ['evidence'],
      tags: ['lens'],
      summary: localized('存在争议。'),
    } as Catalog['atlasRelations'][number]);

    expect(validateCatalog(catalog)).toContainEqual({
      code: 'ATLAS_RELATION_DIRECTIONALITY_NOTE_REQUIRED',
      collection: 'atlasRelations',
      id: 'unjustified-dispute',
      field: 'directionalityNote',
      targetId: 'undirected',
    });
  });

  it('rejects Atlas self-edges even when every other field is valid', () => {
    const catalog = emptyCatalog();
    catalog.atlasTags.push({
      id: 'lens',
      name: localized('透镜'),
      summary: localized('示例标签。'),
    });
    catalog.atlasEvidence.push({
      id: 'evidence',
      title: localized('证据'),
      sourceTitle: 'Evidence',
      originalLanguage: 'en',
      url: 'https://example.com/evidence',
      summary: localized('示例证据。'),
    } as Catalog['atlasEvidence'][number]);
    catalog.atlasNodes.push({
      id: 'node',
      kind: 'game',
      name: localized('节点'),
      summary: localized('示例节点。'),
      startYear: 2000,
      lane: 1,
      tags: ['lens'],
      evidenceIds: ['evidence'],
    });
    catalog.atlasRelations.push({
      id: 'self-edge',
      fromId: 'node',
      toId: 'node',
      type: 'structural-similarity',
      status: 'credible',
      directionality: 'undirected',
      evidenceIds: ['evidence'],
      tags: ['lens'],
      summary: localized('自环。'),
    });

    expect(validateCatalog(catalog)).toContainEqual({
      code: 'ATLAS_RELATION_SELF_REFERENCE',
      collection: 'atlasRelations',
      id: 'self-edge',
      field: 'fromId/toId',
      targetId: 'node',
    });
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

  it('rejects reversed ranges for every extended Atlas node kind', () => {
    const catalog = emptyCatalog();
    const extendedKinds = [
      'experimental-apparatus',
      'experimental-program',
      'system-prototype',
      'commercial-hardware',
    ] as const;
    catalog.atlasNodes.push(...extendedKinds.map((kind) => ({
      id: `reversed-${kind}`,
      kind,
      name: localized('逆序范围'),
      summary: localized('结束年份早于开始年份。'),
      startYear: 1975,
      endYear: 1958,
      lane: 1,
      tags: [],
      evidenceIds: [],
    })));

    expect(validateCatalog(catalog).filter(({ code }) => code === 'ATLAS_NODE_DATE_RANGE_INVALID'))
      .toEqual(extendedKinds.map((kind) => ({
        code: 'ATLAS_NODE_DATE_RANGE_INVALID',
        collection: 'atlasNodes',
        id: `reversed-${kind}`,
        field: 'startYear/endYear',
        targetId: '',
      })));
  });

  it('constrains Atlas relation type, status, and directionality enums', () => {
    const catalog = emptyCatalog();
    catalog.atlasRelations.push(
      {
        id: 'invalid-relation',
        fromId: 'missing-from',
        toId: 'missing-to',
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
      sourceTitle: 'Evidence',
      originalLanguage: 'en',
      url: 'https://example.com/evidence',
      summary: localized('示例证据。'),
      sourceKind: 'institutional-history',
      institutionOrAuthor: 'Example Institution',
      checkedAt: '2026-08-13',
      locator: 'Example record',
      boundedClaim: localized('只支持时间顺序测试。'),
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

  it('accepts empty optional collections', () => {
    const catalog = emptyCatalog();
    catalog.capabilities.push({
      id: 'playtesting',
      name: localized('Playtest'),
      summary: localized('通过观察验证设计判断。'),
      frameworkNodeId: 'perception',
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

  it('normalizes catalog URLs before comparing Source and Work ownership', () => {
    const catalog = emptyV02Catalog();
    seedV02References(catalog);
    catalog.sources[0].homepage = 'https://www.EXAMPLE.com/work/?b=2&a=1#source';
    catalog.resources.push(validV02Resource('work', 'https://example.com/work?a=1&b=2'));

    expect(normalizeCatalogUrl(catalog.sources[0].homepage)).toBe(
      'https://example.com/work?a=1&b=2',
    );
    expect(normalizeCatalogUrl('https://example.com/?tag=z&b=2&tag=a&a=1')).toBe(
      'https://example.com/?a=1&b=2&tag=z&tag=a',
    );
    expect(validateCatalog(catalog)).toContainEqual({
      code: 'SOURCE_HOMEPAGE_RESOURCE_URL_CONFLICT',
      collection: 'sources',
      id: 'source',
      field: 'homepage',
      targetId: 'https://www.EXAMPLE.com/work/?b=2&a=1#source',
    });
  });

  it('rejects normalized duplicate Source homepages', () => {
    const catalog = emptyV02Catalog();
    seedV02References(catalog);
    catalog.sources.push({
      ...structuredClone(catalog.sources[0]),
      id: 'normalized-duplicate-source',
      homepage: 'https://www.EXAMPLE.com/source/#duplicate',
    });

    expect(validateCatalog(catalog)).toContainEqual({
      code: 'SOURCE_HOMEPAGE_DUPLICATE',
      collection: 'sources',
      id: 'normalized-duplicate-source',
      field: 'homepage',
      targetId: 'https://www.EXAMPLE.com/source/#duplicate',
    });
  });

  it('rejects one normalized Access URL owned by two Work Items', () => {
    const catalog = emptyV02Catalog();
    seedV02References(catalog);
    const first = validV02Resource('first-work', 'https://example.com/first');
    first.accessVersions[0].url = 'https://www.EXAMPLE.com/shared/?b=2&a=1#first';
    const second = validV02Resource('second-work', 'https://example.com/second');
    second.accessVersions[0].url = 'https://example.com/shared?a=1&b=2';
    catalog.resources.push(first, second);

    expect(validateCatalog(catalog)).toContainEqual({
      code: 'RESOURCE_URL_OWNERSHIP_CONFLICT',
      collection: 'resources',
      id: 'second-work',
      field: 'canonicalUrl/accessVersions.url',
      targetId: 'https://example.com/shared?a=1&b=2',
    });
  });

  it('rejects normalized duplicate canonical URLs when Access URLs are distinct', () => {
    const catalog = emptyV02Catalog();
    seedV02References(catalog);
    const first = validV02Resource(
      'first-canonical-work',
      'https://www.EXAMPLE.com/shared-canonical/?b=2&a=1#first',
    );
    first.accessVersions[0].url = 'https://example.com/first-access';
    const second = validV02Resource(
      'second-canonical-work',
      'https://example.com/shared-canonical?a=1&b=2',
    );
    second.accessVersions[0].url = 'https://example.com/second-access';
    catalog.resources.push(first, second);

    expect(validateCatalog(catalog)).toContainEqual({
      code: 'RESOURCE_CANONICAL_URL_DUPLICATE',
      collection: 'resources',
      id: 'second-canonical-work',
      field: 'canonicalUrl',
      targetId: 'https://example.com/shared-canonical?a=1&b=2',
    });
  });

  it('rejects one Work canonical URL reused by another Work Access URL after normalization', () => {
    const catalog = emptyV02Catalog();
    seedV02References(catalog);
    const canonicalOwner = validV02Resource(
      'canonical-owner',
      'https://www.EXAMPLE.com/shared-identity/?b=2&a=1#canonical',
    );
    canonicalOwner.accessVersions[0].url = 'https://example.com/canonical-owner-access';
    const accessOwner = validV02Resource('access-owner', 'https://example.com/access-owner');
    accessOwner.accessVersions[0].url = 'https://example.com/shared-identity?a=1&b=2';
    catalog.resources.push(canonicalOwner, accessOwner);

    expect(validateCatalog(catalog)).toContainEqual({
      code: 'RESOURCE_URL_OWNERSHIP_CONFLICT',
      collection: 'resources',
      id: 'access-owner',
      field: 'canonicalUrl/accessVersions.url',
      targetId: 'https://example.com/shared-identity?a=1&b=2',
    });
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

  it('requires a primary Resource Topic for every Work Item', () => {
    const catalog = emptyV02Catalog();
    seedV02References(catalog);
    catalog.resources.push({
      ...validV02Resource('missing-primary-topic', 'https://example.com/missing-primary-topic'),
      resourceTopicIds: [],
    });

    expect(validateCatalog(catalog)).toContainEqual({
      code: 'RESOURCE_PRIMARY_TOPIC_REQUIRED',
      collection: 'resources',
      id: 'missing-primary-topic',
      field: 'resourceTopicIds',
      targetId: '',
    });
  });

  it('rejects multiple primary Resource Topics on one Work Item', () => {
    const catalog = emptyV02Catalog();
    seedV02References(catalog);
    catalog.resourceTopics.push({
      ...structuredClone(catalog.resourceTopics[0]),
      id: 'second-resource-topic',
    });
    catalog.resources.push({
      ...validV02Resource('multiple-primary-topics', 'https://example.com/multiple-primary-topics'),
      resourceTopicIds: ['resource-topic', 'second-resource-topic'],
    });

    expect(validateCatalog(catalog)).toContainEqual({
      code: 'RESOURCE_PRIMARY_TOPIC_MULTIPLE',
      collection: 'resources',
      id: 'multiple-primary-topics',
      field: 'resourceTopicIds',
      targetId: 'resource-topic,second-resource-topic',
    });
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
      'RESOURCE_URL_OWNERSHIP_CONFLICT',
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
      frameworkNodeId: 'perception',
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

  it('rejects duplicate undirected complements and non-bilingual rationales', () => {
    const catalog = emptyV02Catalog();
    seedV02References(catalog);
    catalog.capabilities.push({
      id: 'second-capability',
      name: localized('第二项能力'),
      summary: localized('用于关系测试。'),
      frameworkNodeId: 'perception',
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
