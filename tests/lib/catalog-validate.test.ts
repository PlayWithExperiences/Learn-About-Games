import { describe, expect, it } from 'vitest';

import { validateCatalog, type Catalog } from '../../src/lib/catalog/validate';

const localized = (text: string) => ({ 'zh-CN': text });

const emptyCatalog = (): Catalog => ({
  domains: [],
  capabilities: [],
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
      mediaType: 'article',
      reviewStatus: 'collected',
      accessVersions: [],
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
      caveats: localized('仅作参考。'),
      capabilities: [
        {
          capabilityId: 'missing-capability',
          priority: 'core',
          responsibility: 'practice',
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
});
