export type LocalizedText = {
  'zh-CN': string;
  en?: string;
};

export type ExternalSignal = {
  provider: string;
  label: string;
  value: string | number;
  sampleSize?: string;
  observedAt: string;
  url: string;
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
  knowledgeTopics: Array<{
    id: string;
    name: LocalizedText;
    summary: LocalizedText;
    domainId: string;
  }>;
  capabilityRelations: Array<{
    id: string;
    fromId: string;
    toId: string;
    type: 'supports' | 'complements';
    summary: LocalizedText;
  }>;
  resourceTopics: Array<{
    id: string;
    title: LocalizedText;
    summary: LocalizedText;
    capabilityIds: string[];
    knowledgeTopicIds: string[];
  }>;
  sources: Array<{
    id: string;
    name: LocalizedText;
    kind: 'creator' | 'channel' | 'organization' | 'publisher' | 'website';
    summary: LocalizedText;
    homepage: string;
    languages: string[];
    externalSignals?: ExternalSignal[];
  }>;
  resources: Array<{
    id: string;
    title: LocalizedText;
    summary: LocalizedText;
    sourceId: string;
    capabilityIds: string[];
    knowledgeTopicIds: string[];
    resourceTopicIds: string[];
    mediaType: 'article' | 'book' | 'course' | 'paper' | 'podcast' | 'talk' | 'video' | 'website';
    canonicalUrl: string;
    whyRelevant: LocalizedText;
    originalLanguage: string;
    externalSignals?: ExternalSignal[];
    accessVersions: Array<{
      language: string;
      url: string;
      accessModel: 'free' | 'paid' | 'subscription';
      regionRestrictions?: Array<{
        regions: string[];
        note: LocalizedText;
      }>;
      versionRelation: 'original' | 'official' | 'community';
      presentationMode: 'original' | 'translated' | 'bilingual' | 'subtitled' | 'dubbed';
      checkedAt: string;
    }>;
  }>;
  roleProfiles: Array<{
    id: string;
    title: LocalizedText;
    roleId: string;
    productionContextId: string;
    basis: LocalizedText;
    basisLinks: Array<{
      title: LocalizedText;
      url: string;
      sourceNote: LocalizedText;
    }>;
    reviewedAt: string;
    caveats: LocalizedText;
    capabilities: Array<{
      capabilityId: string;
      priority: 'core' | 'important' | 'suggested';
      responsibility: 'execute' | 'contribute' | 'decide' | 'direct';
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
  | 'COLLECTION_ID_DUPLICATE'
  | 'CAPABILITY_DOMAIN_MISSING'
  | 'KNOWLEDGE_TOPIC_DOMAIN_MISSING'
  | 'CAPABILITY_RELATION_FROM_CAPABILITY_MISSING'
  | 'CAPABILITY_RELATION_TO_CAPABILITY_MISSING'
  | 'CAPABILITY_RELATION_SELF_REFERENCE'
  | 'CAPABILITY_RELATION_TYPE_INVALID'
  | 'RESOURCE_TOPIC_CAPABILITY_MISSING'
  | 'RESOURCE_TOPIC_KNOWLEDGE_TOPIC_MISSING'
  | 'RESOURCE_SOURCE_MISSING'
  | 'RESOURCE_CAPABILITY_MISSING'
  | 'RESOURCE_KNOWLEDGE_TOPIC_MISSING'
  | 'RESOURCE_RESOURCE_TOPIC_MISSING'
  | 'RESOURCE_TOPIC_REFERENCE_REQUIRED'
  | 'RESOURCE_CANONICAL_URL_DUPLICATE'
  | 'RESOURCE_CANONICAL_URL_INVALID'
  | 'RESOURCE_ACCESS_VERSION_REQUIRED'
  | 'RESOURCE_ACCESS_MODEL_INVALID'
  | 'RESOURCE_ACCESS_VERSION_URL_INVALID'
  | 'RESOURCE_ACCESS_VERSION_CHECKED_AT_INVALID'
  | 'RESOURCE_REGION_RESTRICTION_INVALID'
  | 'RESOURCE_MEDIA_TYPE_INVALID'
  | 'RESOURCE_VERSION_RELATION_INVALID'
  | 'RESOURCE_PRESENTATION_MODE_INVALID'
  | 'RESOURCE_EXTERNAL_SIGNAL_INVALID'
  | 'SOURCE_KIND_INVALID'
  | 'SOURCE_HOMEPAGE_INVALID'
  | 'SOURCE_LANGUAGES_REQUIRED'
  | 'SOURCE_EXTERNAL_SIGNAL_INVALID'
  | 'PROFILE_BASIS_LINK_REQUIRED'
  | 'PROFILE_BASIS_LINK_URL_INVALID'
  | 'PROFILE_REVIEWED_AT_INVALID'
  | 'PROFILE_CAPABILITY_MISSING'
  | 'PROFILE_PRIORITY_INVALID'
  | 'PROFILE_RESPONSIBILITY_INVALID'
  | 'ATLAS_RELATION_ENDPOINT_MISSING'
  | 'ATLAS_RELATION_EVIDENCE_MISSING';

export type CatalogValidationError = {
  code: CatalogValidationCode;
  collection: keyof Catalog;
  id: string;
  field: string;
  targetId: string;
};

const sourceKinds = new Set(['creator', 'channel', 'organization', 'publisher', 'website']);
const capabilityRelationTypes = new Set(['supports', 'complements']);
const accessModels = new Set(['free', 'paid', 'subscription']);
const mediaTypes = new Set(['article', 'book', 'course', 'paper', 'podcast', 'talk', 'video', 'website']);
const versionRelations = new Set(['original', 'official', 'community']);
const presentationModes = new Set(['original', 'translated', 'bilingual', 'subtitled', 'dubbed']);
const profilePriorities = new Set(['core', 'important', 'suggested']);
const profileResponsibilities = new Set(['execute', 'contribute', 'decide', 'direct']);
const isoDatePattern = /^\d{4}-\d{2}-\d{2}$/;

const collectionNames = [
  'domains',
  'capabilities',
  'knowledgeTopics',
  'capabilityRelations',
  'resourceTopics',
  'sources',
  'resources',
  'roleProfiles',
  'atlasCategories',
  'atlasNodes',
  'atlasEvidence',
  'atlasRelations',
  'atlasThemes',
] as const satisfies ReadonlyArray<keyof Catalog>;

function isUrl(value: unknown): value is string {
  if (typeof value !== 'string' || value.trim().length === 0) {
    return false;
  }

  try {
    const protocol = new URL(value).protocol;
    return protocol === 'http:' || protocol === 'https:';
  } catch {
    return false;
  }
}

function isRegionRestriction(value: unknown): boolean {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    return false;
  }

  const restriction = value as Record<string, unknown>;
  const note = restriction.note;
  const localizedNote = note as Record<string, unknown>;
  const zhNote = localizedNote['zh-CN'];
  return (
    Array.isArray(restriction.regions) &&
    restriction.regions.length > 0 &&
    restriction.regions.every((region) => typeof region === 'string' && region.trim().length > 0) &&
    typeof note === 'object' &&
    note !== null &&
    !Array.isArray(note) &&
    typeof zhNote === 'string' &&
    zhNote.trim().length > 0
  );
}

function isIsoDate(value: unknown): value is string {
  if (typeof value !== 'string' || !isoDatePattern.test(value)) {
    return false;
  }

  const [year, month, day] = value.split('-').map(Number);
  const parsed = new Date(Date.UTC(year, month - 1, day));
  return (
    parsed.getUTCFullYear() === year &&
    parsed.getUTCMonth() === month - 1 &&
    parsed.getUTCDate() === day
  );
}

function isExternalSignal(value: unknown): value is ExternalSignal {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    return false;
  }

  const signal = value as Record<string, unknown>;
  const hasForbiddenScoreField = ['score', 'rank', 'rating'].some((field) => field in signal);
  const hasValue =
    (typeof signal.value === 'string' && signal.value.trim().length > 0) ||
    (typeof signal.value === 'number' && Number.isFinite(signal.value));
  const hasValidSampleSize =
    signal.sampleSize === undefined ||
    (typeof signal.sampleSize === 'string' && signal.sampleSize.trim().length > 0);

  return (
    !hasForbiddenScoreField &&
    typeof signal.provider === 'string' &&
    signal.provider.trim().length > 0 &&
    typeof signal.label === 'string' &&
    signal.label.trim().length > 0 &&
    hasValue &&
    hasValidSampleSize &&
    isIsoDate(signal.observedAt) &&
    isUrl(signal.url)
  );
}

function appendError(
  errors: CatalogValidationError[],
  code: CatalogValidationCode,
  collection: keyof Catalog,
  id: string,
  field: string,
  targetId: string,
) {
  errors.push({ code, collection, id, field, targetId });
}

export function validateCatalog(catalog: Catalog): CatalogValidationError[] {
  const errors: CatalogValidationError[] = [];
  const domainIds = new Set(catalog.domains.map(({ id }) => id));
  const capabilityIds = new Set(catalog.capabilities.map(({ id }) => id));
  const knowledgeTopicIds = new Set(catalog.knowledgeTopics.map(({ id }) => id));
  const resourceTopicIds = new Set(catalog.resourceTopics.map(({ id }) => id));
  const sourceIds = new Set(catalog.sources.map(({ id }) => id));
  const atlasNodeIds = new Set(catalog.atlasNodes.map(({ id }) => id));
  const atlasEvidenceIds = new Set(catalog.atlasEvidence.map(({ id }) => id));

  for (const collection of collectionNames) {
    const seen = new Set<string>();
    for (const entry of catalog[collection]) {
      if (seen.has(entry.id)) {
        appendError(errors, 'COLLECTION_ID_DUPLICATE', collection, entry.id, 'id', entry.id);
      }
      seen.add(entry.id);
    }
  }

  for (const capability of catalog.capabilities) {
    if (!domainIds.has(capability.domainId)) {
      appendError(
        errors,
        'CAPABILITY_DOMAIN_MISSING',
        'capabilities',
        capability.id,
        'domainId',
        capability.domainId,
      );
    }
  }

  for (const topic of catalog.knowledgeTopics) {
    if (!domainIds.has(topic.domainId)) {
      appendError(
        errors,
        'KNOWLEDGE_TOPIC_DOMAIN_MISSING',
        'knowledgeTopics',
        topic.id,
        'domainId',
        topic.domainId,
      );
    }
  }

  for (const relation of catalog.capabilityRelations) {
    if (!capabilityRelationTypes.has(relation.type)) {
      appendError(
        errors,
        'CAPABILITY_RELATION_TYPE_INVALID',
        'capabilityRelations',
        relation.id,
        'type',
        relation.type,
      );
    }
    if (!capabilityIds.has(relation.fromId)) {
      appendError(
        errors,
        'CAPABILITY_RELATION_FROM_CAPABILITY_MISSING',
        'capabilityRelations',
        relation.id,
        'fromId',
        relation.fromId,
      );
    }
    if (!capabilityIds.has(relation.toId)) {
      appendError(
        errors,
        'CAPABILITY_RELATION_TO_CAPABILITY_MISSING',
        'capabilityRelations',
        relation.id,
        'toId',
        relation.toId,
      );
    }
    if (relation.fromId === relation.toId) {
      appendError(
        errors,
        'CAPABILITY_RELATION_SELF_REFERENCE',
        'capabilityRelations',
        relation.id,
        'toId',
        relation.toId,
      );
    }
  }

  for (const resourceTopic of catalog.resourceTopics) {
    for (const capabilityId of resourceTopic.capabilityIds) {
      if (!capabilityIds.has(capabilityId)) {
        appendError(
          errors,
          'RESOURCE_TOPIC_CAPABILITY_MISSING',
          'resourceTopics',
          resourceTopic.id,
          'capabilityIds',
          capabilityId,
        );
      }
    }
    for (const knowledgeTopicId of resourceTopic.knowledgeTopicIds) {
      if (!knowledgeTopicIds.has(knowledgeTopicId)) {
        appendError(
          errors,
          'RESOURCE_TOPIC_KNOWLEDGE_TOPIC_MISSING',
          'resourceTopics',
          resourceTopic.id,
          'knowledgeTopicIds',
          knowledgeTopicId,
        );
      }
    }
  }

  for (const source of catalog.sources) {
    if (!sourceKinds.has(source.kind)) {
      appendError(errors, 'SOURCE_KIND_INVALID', 'sources', source.id, 'kind', source.kind);
    }
    if (!isUrl(source.homepage)) {
      appendError(errors, 'SOURCE_HOMEPAGE_INVALID', 'sources', source.id, 'homepage', source.homepage);
    }
    if (source.languages.length === 0) {
      appendError(errors, 'SOURCE_LANGUAGES_REQUIRED', 'sources', source.id, 'languages', '');
    }
    for (const signal of source.externalSignals ?? []) {
      if (!isExternalSignal(signal)) {
        appendError(errors, 'SOURCE_EXTERNAL_SIGNAL_INVALID', 'sources', source.id, 'externalSignals', '');
      }
    }
  }

  const canonicalUrls = new Set<string>();
  for (const resource of catalog.resources) {
    if (canonicalUrls.has(resource.canonicalUrl)) {
      appendError(
        errors,
        'RESOURCE_CANONICAL_URL_DUPLICATE',
        'resources',
        resource.id,
        'canonicalUrl',
        resource.canonicalUrl,
      );
    }
    canonicalUrls.add(resource.canonicalUrl);

    if (!isUrl(resource.canonicalUrl)) {
      appendError(
        errors,
        'RESOURCE_CANONICAL_URL_INVALID',
        'resources',
        resource.id,
        'canonicalUrl',
        resource.canonicalUrl,
      );
    }

    if (!mediaTypes.has(resource.mediaType)) {
      appendError(
        errors,
        'RESOURCE_MEDIA_TYPE_INVALID',
        'resources',
        resource.id,
        'mediaType',
        resource.mediaType,
      );
    }

    if (!sourceIds.has(resource.sourceId)) {
      appendError(
        errors,
        'RESOURCE_SOURCE_MISSING',
        'resources',
        resource.id,
        'sourceId',
        resource.sourceId,
      );
    }

    for (const capabilityId of resource.capabilityIds) {
      if (!capabilityIds.has(capabilityId)) {
        appendError(
          errors,
          'RESOURCE_CAPABILITY_MISSING',
          'resources',
          resource.id,
          'capabilityIds',
          capabilityId,
        );
      }
    }
    for (const knowledgeTopicId of resource.knowledgeTopicIds) {
      if (!knowledgeTopicIds.has(knowledgeTopicId)) {
        appendError(
          errors,
          'RESOURCE_KNOWLEDGE_TOPIC_MISSING',
          'resources',
          resource.id,
          'knowledgeTopicIds',
          knowledgeTopicId,
        );
      }
    }
    for (const resourceTopicId of resource.resourceTopicIds) {
      if (!resourceTopicIds.has(resourceTopicId)) {
        appendError(
          errors,
          'RESOURCE_RESOURCE_TOPIC_MISSING',
          'resources',
          resource.id,
          'resourceTopicIds',
          resourceTopicId,
        );
      }
    }
    if (
      resource.capabilityIds.length === 0 &&
      resource.knowledgeTopicIds.length === 0 &&
      resource.resourceTopicIds.length === 0
    ) {
      appendError(errors, 'RESOURCE_TOPIC_REFERENCE_REQUIRED', 'resources', resource.id, 'topicIds', '');
    }
    if (resource.accessVersions.length === 0) {
      appendError(errors, 'RESOURCE_ACCESS_VERSION_REQUIRED', 'resources', resource.id, 'accessVersions', '');
    }
    for (const accessVersion of resource.accessVersions) {
      if (!accessModels.has(accessVersion.accessModel)) {
        appendError(
          errors,
          'RESOURCE_ACCESS_MODEL_INVALID',
          'resources',
          resource.id,
          'accessVersions.accessModel',
          accessVersion.accessModel,
        );
      }
      if (!isUrl(accessVersion.url)) {
        appendError(
          errors,
          'RESOURCE_ACCESS_VERSION_URL_INVALID',
          'resources',
          resource.id,
          'accessVersions.url',
          accessVersion.url,
        );
      }
      if (!versionRelations.has(accessVersion.versionRelation)) {
        appendError(
          errors,
          'RESOURCE_VERSION_RELATION_INVALID',
          'resources',
          resource.id,
          'accessVersions.versionRelation',
          accessVersion.versionRelation,
        );
      }
      if (!presentationModes.has(accessVersion.presentationMode)) {
        appendError(
          errors,
          'RESOURCE_PRESENTATION_MODE_INVALID',
          'resources',
          resource.id,
          'accessVersions.presentationMode',
          accessVersion.presentationMode,
        );
      }
      if (!isIsoDate(accessVersion.checkedAt)) {
        appendError(
          errors,
          'RESOURCE_ACCESS_VERSION_CHECKED_AT_INVALID',
          'resources',
          resource.id,
          'accessVersions.checkedAt',
          accessVersion.checkedAt,
        );
      }
      for (const restriction of accessVersion.regionRestrictions ?? []) {
        if (!isRegionRestriction(restriction)) {
          appendError(
            errors,
            'RESOURCE_REGION_RESTRICTION_INVALID',
            'resources',
            resource.id,
            'accessVersions.regionRestrictions',
            '',
          );
        }
      }
    }
    for (const signal of resource.externalSignals ?? []) {
      if (!isExternalSignal(signal)) {
        appendError(errors, 'RESOURCE_EXTERNAL_SIGNAL_INVALID', 'resources', resource.id, 'externalSignals', '');
      }
    }
  }

  for (const profile of catalog.roleProfiles) {
    if (profile.basisLinks.length === 0) {
      appendError(errors, 'PROFILE_BASIS_LINK_REQUIRED', 'roleProfiles', profile.id, 'basisLinks', '');
    }
    if (!isIsoDate(profile.reviewedAt)) {
      appendError(
        errors,
        'PROFILE_REVIEWED_AT_INVALID',
        'roleProfiles',
        profile.id,
        'reviewedAt',
        profile.reviewedAt,
      );
    }
    for (const basisLink of profile.basisLinks) {
      if (!isUrl(basisLink.url)) {
        appendError(
          errors,
          'PROFILE_BASIS_LINK_URL_INVALID',
          'roleProfiles',
          profile.id,
          'basisLinks.url',
          basisLink.url,
        );
      }
    }
    for (const capability of profile.capabilities) {
      if (!capabilityIds.has(capability.capabilityId)) {
        appendError(
          errors,
          'PROFILE_CAPABILITY_MISSING',
          'roleProfiles',
          profile.id,
          'capabilities.capabilityId',
          capability.capabilityId,
        );
      }
      if (!profilePriorities.has(capability.priority)) {
        appendError(
          errors,
          'PROFILE_PRIORITY_INVALID',
          'roleProfiles',
          profile.id,
          'capabilities.priority',
          capability.priority,
        );
      }
      if (!profileResponsibilities.has(capability.responsibility)) {
        appendError(
          errors,
          'PROFILE_RESPONSIBILITY_INVALID',
          'roleProfiles',
          profile.id,
          'capabilities.responsibility',
          capability.responsibility,
        );
      }
    }
  }

  for (const relation of catalog.atlasRelations) {
    for (const [field, targetId] of [
      ['fromId', relation.fromId],
      ['toId', relation.toId],
    ] as const) {
      if (!atlasNodeIds.has(targetId)) {
        appendError(
          errors,
          'ATLAS_RELATION_ENDPOINT_MISSING',
          'atlasRelations',
          relation.id,
          field,
          targetId,
        );
      }
    }

    for (const evidenceId of relation.evidenceIds) {
      if (!atlasEvidenceIds.has(evidenceId)) {
        appendError(
          errors,
          'ATLAS_RELATION_EVIDENCE_MISSING',
          'atlasRelations',
          relation.id,
          'evidenceIds',
          evidenceId,
        );
      }
    }
  }

  return errors;
}
