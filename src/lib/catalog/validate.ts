export type LocalizedText = {
  'zh-CN': string;
  en?: string;
};

export type Catalog = {
  domains: Array<{
    id: string;
    name: LocalizedText;
    summary: LocalizedText;
    order: number;
  }>;
  capabilities: Array<{
    id: string;
    name: LocalizedText;
    summary: LocalizedText;
    domainId: string;
  }>;
  sources: Array<{
    id: string;
    name: LocalizedText;
    homepage: string;
  }>;
  resources: Array<{
    id: string;
    title: LocalizedText;
    summary: LocalizedText;
    sourceId: string;
    capabilityIds: string[];
    mediaType: string;
    reviewStatus: string;
    accessVersions: Array<{
      language: string;
      url: string;
      access: string;
      translationKind: string;
      checkedAt: string;
    }>;
  }>;
  learningTrails: Array<{
    id: string;
    title: LocalizedText;
    summary: LocalizedText;
    capabilityId: string;
    resourceIds: string[];
    concepts: string[];
    exercises: string[];
    selfChecks: string[];
  }>;
  roleProfiles: Array<{
    id: string;
    title: LocalizedText;
    roleId: string;
    productionContextId: string;
    basis: LocalizedText;
    caveats: LocalizedText;
    capabilities: Array<{
      capabilityId: string;
      priority: string;
      responsibility: string;
    }>;
  }>;
  atlasCategories: Array<{
    id: string;
    name: LocalizedText;
    summary: LocalizedText;
    order: number;
  }>;
  atlasNodes: Array<{
    id: string;
    kind: 'game' | 'innovation';
    name: LocalizedText;
    summary: LocalizedText;
    year: number;
  }>;
  atlasEvidence: Array<{
    id: string;
    title: LocalizedText;
    url: string;
    summary: LocalizedText;
  }>;
  atlasRelations: Array<{
    id: string;
    fromId: string;
    toId: string;
    type: string;
    evidenceStatus: string;
    evidenceIds: string[];
    summary: LocalizedText;
  }>;
  atlasThemes: Array<{
    id: string;
    title: LocalizedText;
    summary: LocalizedText;
    nodeIds: string[];
    relationIds: string[];
  }>;
};

export type CatalogValidationCode =
  | 'CAPABILITY_DOMAIN_MISSING'
  | 'RESOURCE_SOURCE_MISSING'
  | 'RESOURCE_CAPABILITY_MISSING'
  | 'TRAIL_CAPABILITY_MISSING'
  | 'TRAIL_RESOURCE_MISSING'
  | 'PROFILE_CAPABILITY_MISSING'
  | 'ATLAS_RELATION_ENDPOINT_MISSING'
  | 'ATLAS_RELATION_EVIDENCE_MISSING';

export type CatalogValidationError = {
  code: CatalogValidationCode;
  collection: keyof Catalog;
  id: string;
  field: string;
  targetId: string;
};

export function validateCatalog(catalog: Catalog): CatalogValidationError[] {
  const errors: CatalogValidationError[] = [];
  const domainIds = new Set(catalog.domains.map(({ id }) => id));
  const capabilityIds = new Set(catalog.capabilities.map(({ id }) => id));
  const sourceIds = new Set(catalog.sources.map(({ id }) => id));
  const resourceIds = new Set(catalog.resources.map(({ id }) => id));
  const atlasNodeIds = new Set(catalog.atlasNodes.map(({ id }) => id));
  const atlasEvidenceIds = new Set(catalog.atlasEvidence.map(({ id }) => id));

  for (const capability of catalog.capabilities) {
    if (!domainIds.has(capability.domainId)) {
      errors.push({
        code: 'CAPABILITY_DOMAIN_MISSING',
        collection: 'capabilities',
        id: capability.id,
        field: 'domainId',
        targetId: capability.domainId,
      });
    }
  }

  for (const resource of catalog.resources) {
    if (!sourceIds.has(resource.sourceId)) {
      errors.push({
        code: 'RESOURCE_SOURCE_MISSING',
        collection: 'resources',
        id: resource.id,
        field: 'sourceId',
        targetId: resource.sourceId,
      });
    }

    for (const capabilityId of resource.capabilityIds) {
      if (!capabilityIds.has(capabilityId)) {
        errors.push({
          code: 'RESOURCE_CAPABILITY_MISSING',
          collection: 'resources',
          id: resource.id,
          field: 'capabilityIds',
          targetId: capabilityId,
        });
      }
    }
  }

  for (const trail of catalog.learningTrails) {
    if (!capabilityIds.has(trail.capabilityId)) {
      errors.push({
        code: 'TRAIL_CAPABILITY_MISSING',
        collection: 'learningTrails',
        id: trail.id,
        field: 'capabilityId',
        targetId: trail.capabilityId,
      });
    }

    for (const resourceId of trail.resourceIds) {
      if (!resourceIds.has(resourceId)) {
        errors.push({
          code: 'TRAIL_RESOURCE_MISSING',
          collection: 'learningTrails',
          id: trail.id,
          field: 'resourceIds',
          targetId: resourceId,
        });
      }
    }
  }

  for (const profile of catalog.roleProfiles) {
    for (const capability of profile.capabilities) {
      if (!capabilityIds.has(capability.capabilityId)) {
        errors.push({
          code: 'PROFILE_CAPABILITY_MISSING',
          collection: 'roleProfiles',
          id: profile.id,
          field: 'capabilities.capabilityId',
          targetId: capability.capabilityId,
        });
      }
    }
  }

  for (const relation of catalog.atlasRelations) {
    for (const [field, targetId] of [
      ['fromId', relation.fromId],
      ['toId', relation.toId],
    ] as const) {
      if (!atlasNodeIds.has(targetId)) {
        errors.push({
          code: 'ATLAS_RELATION_ENDPOINT_MISSING',
          collection: 'atlasRelations',
          id: relation.id,
          field,
          targetId,
        });
      }
    }

    for (const evidenceId of relation.evidenceIds) {
      if (!atlasEvidenceIds.has(evidenceId)) {
        errors.push({
          code: 'ATLAS_RELATION_EVIDENCE_MISSING',
          collection: 'atlasRelations',
          id: relation.id,
          field: 'evidenceIds',
          targetId: evidenceId,
        });
      }
    }
  }

  return errors;
}
