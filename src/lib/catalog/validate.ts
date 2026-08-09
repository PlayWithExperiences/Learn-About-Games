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

export type MapPoint = {
  x: number;
  y: number;
};

export type MapBounds = MapPoint & {
  width: number;
  height: number;
};

export type AtlasRelationType =
  | 'direct-influence'
  | 'derived-variant'
  | 'fusion'
  | 'revival'
  | 'parallel-origin'
  | 'structural-similarity'
  | 'disputed';

export type AtlasEvidenceStatus = 'confirmed' | 'credible' | 'inferred' | 'disputed';

export type AtlasDirectionality = 'directed' | 'undirected';

export type AtlasEvidenceOriginalLanguage = 'en' | 'ja' | 'fr' | 'es';

export type EgdsFrameworkNodeKind =
  | 'root'
  | 'branch'
  | 'entry'
  | 'stage'
  | 'lever'
  | 'cluster'
  | 'external-entry';

export type Catalog = {
  domains: Array<{
    id: string;
    name: LocalizedText;
    summary: LocalizedText;
    order: number;
    bounds: MapBounds;
  }>;
  mapGroups: Array<{
    id: string;
    name: LocalizedText;
    summary: LocalizedText;
    order: number;
    domainIds: string[];
  }>;
  egdsFrameworkNodes: Array<{
    id: string;
    kind: EgdsFrameworkNodeKind;
    name: LocalizedText & { en: string };
    summary: LocalizedText;
    order: number;
    parentNodeId?: string;
  }>;
  egdsFrameworkRelations: Array<
    | {
        id: string;
        type: 'process-next';
        fromId: string;
        toId: string;
      }
    | {
        id: string;
        type: 'links-to';
        fromId: string;
        targetPath: 'atlas/';
      }
  >;
  capabilities: Array<{
    id: string;
    name: LocalizedText;
    summary: LocalizedText;
    frameworkNodeId: string;
    domainId: string;
    position: MapPoint;
  }>;
  knowledgeTopics: Array<{
    id: string;
    name: LocalizedText;
    summary: LocalizedText;
    frameworkNodeId: string;
    domainId: string;
    position: MapPoint;
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
  atlasTags: Array<{
    id: string;
    name: LocalizedText;
    summary: LocalizedText;
  }>;
  atlasNodes: Array<{
    id: string;
    kind: 'game' | 'innovation' | 'category';
    name: LocalizedText;
    summary: LocalizedText;
    startYear: number;
    endYear?: number;
    lane: number;
    tags: string[];
    evidenceIds: string[];
  }>;
  atlasEvidence: Array<{
    id: string;
    title: LocalizedText;
    sourceTitle: string;
    originalLanguage: AtlasEvidenceOriginalLanguage;
    url: string;
    summary: LocalizedText;
  }>;
  atlasRelations: Array<{
    id: string;
    fromId: string;
    toId: string;
    type: AtlasRelationType;
    status: AtlasEvidenceStatus;
    directionality: AtlasDirectionality;
    evidenceIds: string[];
    tags: string[];
    summary: LocalizedText;
    chronologyExplanation?: LocalizedText;
    directionalityNote?: LocalizedText;
  }>;
  atlasThemes: Array<{
    id: string;
    title: LocalizedText;
    summary: LocalizedText;
    tags: string[];
  }>;
};

export type CatalogValidationCode =
  | 'COLLECTION_ID_DUPLICATE'
  | 'DOMAIN_BOUNDS_INVALID'
  | 'MAP_GROUP_DOMAIN_MISSING'
  | 'MAP_GROUP_DOMAIN_DUPLICATE'
  | 'MAP_GROUP_DOMAIN_MISSING_REFERENCE'
  | 'EGDS_PARENT_NODE_MISSING'
  | 'EGDS_FRAMEWORK_CYCLE'
  | 'EGDS_ROOT_COUNT_INVALID'
  | 'EGDS_BRANCH_SET_INVALID'
  | 'EGDS_PROCESS_RELATION_SET_INVALID'
  | 'EGDS_LINK_RELATION_SET_INVALID'
  | 'EGDS_RELATION_ENDPOINT_MISSING'
  | 'EGDS_ENTITY_CONTAINER_INVALID'
  | 'CAPABILITY_DOMAIN_MISSING'
  | 'CAPABILITY_FRAMEWORK_NODE_MISSING'
  | 'CAPABILITY_POSITION_INVALID'
  | 'CAPABILITY_POSITION_OUTSIDE_DOMAIN'
  | 'KNOWLEDGE_TOPIC_DOMAIN_MISSING'
  | 'KNOWLEDGE_TOPIC_FRAMEWORK_NODE_MISSING'
  | 'KNOWLEDGE_TOPIC_POSITION_INVALID'
  | 'KNOWLEDGE_TOPIC_POSITION_OUTSIDE_DOMAIN'
  | 'CAPABILITY_RELATION_FROM_CAPABILITY_MISSING'
  | 'CAPABILITY_RELATION_TO_CAPABILITY_MISSING'
  | 'CAPABILITY_RELATION_SELF_REFERENCE'
  | 'CAPABILITY_RELATION_TYPE_INVALID'
  | 'CAPABILITY_RELATION_COMPLEMENT_DUPLICATE'
  | 'CAPABILITY_RELATION_RATIONALE_INVALID'
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
  | 'SOURCE_HOMEPAGE_DUPLICATE'
  | 'SOURCE_HOMEPAGE_RESOURCE_URL_CONFLICT'
  | 'SOURCE_LANGUAGES_REQUIRED'
  | 'SOURCE_EXTERNAL_SIGNAL_INVALID'
  | 'PROFILE_BASIS_LINK_REQUIRED'
  | 'PROFILE_BASIS_LINK_URL_INVALID'
  | 'PROFILE_REVIEWED_AT_INVALID'
  | 'PROFILE_CAPABILITY_MISSING'
  | 'PROFILE_PRIORITY_INVALID'
  | 'PROFILE_RESPONSIBILITY_INVALID'
  | 'ATLAS_TAG_REFERENCE_MISSING'
  | 'ATLAS_NODE_DATE_RANGE_INVALID'
  | 'ATLAS_NODE_EVIDENCE_REQUIRED'
  | 'ATLAS_NODE_EVIDENCE_MISSING'
  | 'ATLAS_EVIDENCE_SOURCE_TITLE_INVALID'
  | 'ATLAS_EVIDENCE_ORIGINAL_LANGUAGE_INVALID'
  | 'ATLAS_RELATION_ENDPOINT_MISSING'
  | 'ATLAS_RELATION_SELF_REFERENCE'
  | 'ATLAS_RELATION_TYPE_INVALID'
  | 'ATLAS_RELATION_STATUS_INVALID'
  | 'ATLAS_RELATION_DIRECTIONALITY_INVALID'
  | 'ATLAS_RELATION_EVIDENCE_REQUIRED'
  | 'ATLAS_RELATION_EVIDENCE_MISSING'
  | 'ATLAS_RELATION_DIRECTIONALITY_NOTE_REQUIRED'
  | 'ATLAS_RELATION_CHRONOLOGY_UNEXPLAINED';

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
const atlasRelationTypes = new Set<AtlasRelationType>([
  'direct-influence',
  'derived-variant',
  'fusion',
  'revival',
  'parallel-origin',
  'structural-similarity',
  'disputed',
]);
const atlasEvidenceStatuses = new Set<AtlasEvidenceStatus>([
  'confirmed',
  'credible',
  'inferred',
  'disputed',
]);
const atlasEvidenceOriginalLanguages = new Set<AtlasEvidenceOriginalLanguage>([
  'en',
  'ja',
  'fr',
  'es',
]);
const directedAtlasRelationTypes = new Set<AtlasRelationType>([
  'direct-influence',
  'derived-variant',
  'fusion',
  'revival',
]);
const undirectedAtlasRelationTypes = new Set<AtlasRelationType>([
  'parallel-origin',
  'structural-similarity',
]);
const isoDatePattern = /^\d{4}-\d{2}-\d{2}$/;
const egdsEntityContainerKinds = new Set<EgdsFrameworkNodeKind>([
  'entry',
  'stage',
  'lever',
  'cluster',
]);
const approvedEgdsRootBranches = [
  'experience-design:1:branch',
  'from-plan-to-ship:2:branch',
  'with-team:3:branch',
  'product-profit:4:branch',
  'beyond-games:5:branch',
];
const approvedEgdsProcessRelations = [
  'perception:rationalization',
  'rationalization:deconstruction',
  'deconstruction:reconstruction',
].sort();
const approvedEgdsLinkRelations = ['innovation-possibility-space:atlas/'];

const collectionNames = [
  'domains',
  'mapGroups',
  'egdsFrameworkNodes',
  'egdsFrameworkRelations',
  'capabilities',
  'knowledgeTopics',
  'capabilityRelations',
  'resourceTopics',
  'sources',
  'resources',
  'roleProfiles',
  'atlasTags',
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

function isMapPoint(value: unknown): value is MapPoint {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) return false;
  const point = value as Record<string, unknown>;
  return (
    typeof point.x === 'number' &&
    Number.isFinite(point.x) &&
    point.x >= 0 &&
    point.x <= 100 &&
    typeof point.y === 'number' &&
    Number.isFinite(point.y) &&
    point.y >= 0 &&
    point.y <= 100
  );
}

function isMapBounds(value: unknown): value is MapBounds {
  if (!isMapPoint(value)) return false;
  const bounds = value as MapBounds;
  return (
    Number.isFinite(bounds.width) &&
    bounds.width > 0 &&
    Number.isFinite(bounds.height) &&
    bounds.height > 0 &&
    bounds.x + bounds.width <= 100 &&
    bounds.y + bounds.height <= 100
  );
}

function isInsideDomain(position: unknown, bounds: unknown): boolean {
  if (!isMapPoint(position) || typeof bounds !== 'object' || bounds === null || Array.isArray(bounds)) {
    return false;
  }
  const candidate = bounds as Partial<MapBounds>;
  if (
    typeof candidate.x !== 'number' ||
    typeof candidate.y !== 'number' ||
    typeof candidate.width !== 'number' ||
    typeof candidate.height !== 'number'
  ) {
    return false;
  }
  return (
    position.x >= candidate.x &&
    position.x <= candidate.x + candidate.width &&
    position.y >= candidate.y &&
    position.y <= candidate.y + candidate.height
  );
}

function hasBilingualRationale(summary: LocalizedText): boolean {
  return summary['zh-CN'].trim().length > 0 && typeof summary.en === 'string' && summary.en.trim().length > 0;
}

function hasExactStringSet(actual: string[], expected: string[]): boolean {
  return actual.length === expected.length && actual.every((value, index) => value === expected[index]);
}

export function validateCatalog(catalog: Catalog): CatalogValidationError[] {
  const errors: CatalogValidationError[] = [];
  const domainIds = new Set(catalog.domains.map(({ id }) => id));
  const domainsById = new Map(catalog.domains.map((domain) => [domain.id, domain]));
  const egdsFrameworkNodeIds = new Set(catalog.egdsFrameworkNodes.map(({ id }) => id));
  const egdsFrameworkNodesById = new Map(catalog.egdsFrameworkNodes.map((node) => [node.id, node]));
  const capabilityIds = new Set(catalog.capabilities.map(({ id }) => id));
  const knowledgeTopicIds = new Set(catalog.knowledgeTopics.map(({ id }) => id));
  const resourceTopicIds = new Set(catalog.resourceTopics.map(({ id }) => id));
  const sourceIds = new Set(catalog.sources.map(({ id }) => id));
  const atlasNodeIds = new Set(catalog.atlasNodes.map(({ id }) => id));
  const atlasNodesById = new Map(catalog.atlasNodes.map((node) => [node.id, node]));
  const atlasEvidenceIds = new Set(catalog.atlasEvidence.map(({ id }) => id));
  const atlasTagIds = new Set(catalog.atlasTags.map(({ id }) => id));

  for (const collection of collectionNames) {
    const seen = new Set<string>();
    for (const entry of catalog[collection]) {
      if (seen.has(entry.id)) {
        appendError(errors, 'COLLECTION_ID_DUPLICATE', collection, entry.id, 'id', entry.id);
      }
      seen.add(entry.id);
    }
  }

  const egdsRoots = catalog.egdsFrameworkNodes.filter(({ kind }) => kind === 'root');
  if (
    egdsRoots.length !== 1 ||
    egdsRoots[0]?.id !== 'egds-root' ||
    egdsRoots[0]?.parentNodeId !== undefined
  ) {
    appendError(
      errors,
      'EGDS_ROOT_COUNT_INVALID',
      'egdsFrameworkNodes',
      'egds-root',
      'kind/parentNodeId',
      egdsRoots.map(({ id }) => id).join(','),
    );
  }

  for (const node of catalog.egdsFrameworkNodes) {
    if (node.kind === 'root') continue;
    if (!node.parentNodeId || !egdsFrameworkNodeIds.has(node.parentNodeId)) {
      appendError(
        errors,
        'EGDS_PARENT_NODE_MISSING',
        'egdsFrameworkNodes',
        node.id,
        'parentNodeId',
        node.parentNodeId ?? '',
      );
    }
  }

  for (const node of catalog.egdsFrameworkNodes) {
    const visited = new Set<string>();
    let current = node;
    while (current.id !== 'egds-root') {
      if (visited.has(current.id)) {
        appendError(
          errors,
          'EGDS_FRAMEWORK_CYCLE',
          'egdsFrameworkNodes',
          node.id,
          'parentNodeId',
          current.id,
        );
        break;
      }
      visited.add(current.id);
      if (!current.parentNodeId) break;
      const parent = egdsFrameworkNodesById.get(current.parentNodeId);
      if (!parent) break;
      current = parent;
    }
  }

  const actualEgdsRootBranches = catalog.egdsFrameworkNodes
    .filter(({ parentNodeId }) => parentNodeId === 'egds-root')
    .sort((left, right) => left.order - right.order || left.id.localeCompare(right.id))
    .map(({ id, order, kind }) => `${id}:${order}:${kind}`);
  if (!hasExactStringSet(actualEgdsRootBranches, approvedEgdsRootBranches)) {
    appendError(
      errors,
      'EGDS_BRANCH_SET_INVALID',
      'egdsFrameworkNodes',
      'egds-root',
      'parentNodeId/order',
      actualEgdsRootBranches.join(','),
    );
  }

  const actualEgdsProcessRelations = catalog.egdsFrameworkRelations
    .filter((relation) => relation.type === 'process-next')
    .map(({ fromId, toId }) => `${fromId}:${toId}`)
    .sort();
  if (!hasExactStringSet(actualEgdsProcessRelations, approvedEgdsProcessRelations)) {
    appendError(
      errors,
      'EGDS_PROCESS_RELATION_SET_INVALID',
      'egdsFrameworkRelations',
      'process-next',
      'fromId/toId',
      actualEgdsProcessRelations.join(','),
    );
  }

  const actualEgdsLinkRelations = catalog.egdsFrameworkRelations
    .filter((relation) => relation.type === 'links-to')
    .map(({ fromId, targetPath }) => `${fromId}:${targetPath}`)
    .sort();
  if (!hasExactStringSet(actualEgdsLinkRelations, approvedEgdsLinkRelations)) {
    appendError(
      errors,
      'EGDS_LINK_RELATION_SET_INVALID',
      'egdsFrameworkRelations',
      'links-to',
      'fromId/targetPath',
      actualEgdsLinkRelations.join(','),
    );
  }

  for (const relation of catalog.egdsFrameworkRelations) {
    const endpoints =
      relation.type === 'process-next'
        ? ([
            ['fromId', relation.fromId],
            ['toId', relation.toId],
          ] as const)
        : ([['fromId', relation.fromId]] as const);
    for (const [field, targetId] of endpoints) {
      if (!egdsFrameworkNodeIds.has(targetId)) {
        appendError(
          errors,
          'EGDS_RELATION_ENDPOINT_MISSING',
          'egdsFrameworkRelations',
          relation.id,
          field,
          targetId,
        );
      }
    }
  }

  for (const capability of catalog.capabilities) {
    const frameworkNode = egdsFrameworkNodesById.get(capability.frameworkNodeId);
    if (!frameworkNode) {
      appendError(
        errors,
        'CAPABILITY_FRAMEWORK_NODE_MISSING',
        'capabilities',
        capability.id,
        'frameworkNodeId',
        capability.frameworkNodeId ?? '',
      );
    } else if (!egdsEntityContainerKinds.has(frameworkNode.kind)) {
      appendError(
        errors,
        'EGDS_ENTITY_CONTAINER_INVALID',
        'capabilities',
        capability.id,
        'frameworkNodeId',
        capability.frameworkNodeId,
      );
    }
  }

  for (const topic of catalog.knowledgeTopics) {
    const frameworkNode = egdsFrameworkNodesById.get(topic.frameworkNodeId);
    if (!frameworkNode) {
      appendError(
        errors,
        'KNOWLEDGE_TOPIC_FRAMEWORK_NODE_MISSING',
        'knowledgeTopics',
        topic.id,
        'frameworkNodeId',
        topic.frameworkNodeId ?? '',
      );
    } else if (!egdsEntityContainerKinds.has(frameworkNode.kind)) {
      appendError(
        errors,
        'EGDS_ENTITY_CONTAINER_INVALID',
        'knowledgeTopics',
        topic.id,
        'frameworkNodeId',
        topic.frameworkNodeId,
      );
    }
  }

  for (const domain of catalog.domains) {
    if (!isMapBounds(domain.bounds)) {
      appendError(errors, 'DOMAIN_BOUNDS_INVALID', 'domains', domain.id, 'bounds', '');
    }
  }

  const mapGroupDomainOwners = new Map<string, string>();
  for (const mapGroup of catalog.mapGroups) {
    for (const domainId of mapGroup.domainIds) {
      if (!domainIds.has(domainId)) {
        appendError(
          errors,
          'MAP_GROUP_DOMAIN_MISSING_REFERENCE',
          'mapGroups',
          mapGroup.id,
          'domainIds',
          domainId,
        );
        continue;
      }
      if (mapGroupDomainOwners.has(domainId)) {
        appendError(errors, 'MAP_GROUP_DOMAIN_DUPLICATE', 'mapGroups', mapGroup.id, 'domainIds', domainId);
        continue;
      }
      mapGroupDomainOwners.set(domainId, mapGroup.id);
    }
  }

  for (const domain of catalog.domains) {
    if (!mapGroupDomainOwners.has(domain.id)) {
      appendError(errors, 'MAP_GROUP_DOMAIN_MISSING', 'domains', domain.id, 'mapGroups', '');
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
    if (!isMapPoint(capability.position)) {
      appendError(errors, 'CAPABILITY_POSITION_INVALID', 'capabilities', capability.id, 'position', '');
    }
    const domain = domainsById.get(capability.domainId);
    if (domain && !isInsideDomain(capability.position, domain.bounds)) {
      appendError(
        errors,
        'CAPABILITY_POSITION_OUTSIDE_DOMAIN',
        'capabilities',
        capability.id,
        'position',
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
    if (!isMapPoint(topic.position)) {
      appendError(errors, 'KNOWLEDGE_TOPIC_POSITION_INVALID', 'knowledgeTopics', topic.id, 'position', '');
    }
    const domain = domainsById.get(topic.domainId);
    if (domain && !isInsideDomain(topic.position, domain.bounds)) {
      appendError(
        errors,
        'KNOWLEDGE_TOPIC_POSITION_OUTSIDE_DOMAIN',
        'knowledgeTopics',
        topic.id,
        'position',
        topic.domainId,
      );
    }
  }

  const complementPairs = new Set<string>();
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
    if (!hasBilingualRationale(relation.summary)) {
      appendError(
        errors,
        'CAPABILITY_RELATION_RATIONALE_INVALID',
        'capabilityRelations',
        relation.id,
        'summary',
        '',
      );
    }
    if (relation.type === 'complements') {
      const pair = [relation.fromId, relation.toId].sort().join('::');
      if (complementPairs.has(pair)) {
        appendError(
          errors,
          'CAPABILITY_RELATION_COMPLEMENT_DUPLICATE',
          'capabilityRelations',
          relation.id,
          'fromId/toId',
          pair,
        );
      }
      complementPairs.add(pair);
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

  const sourceHomepages = new Set<string>();
  for (const source of catalog.sources) {
    if (sourceHomepages.has(source.homepage)) {
      appendError(
        errors,
        'SOURCE_HOMEPAGE_DUPLICATE',
        'sources',
        source.id,
        'homepage',
        source.homepage,
      );
    }
    sourceHomepages.add(source.homepage);
  }

  const resourceUrls = new Set(
    catalog.resources.flatMap((resource) => [
      resource.canonicalUrl,
      ...resource.accessVersions.map(({ url }) => url),
    ]),
  );
  for (const source of catalog.sources) {
    if (!sourceKinds.has(source.kind)) {
      appendError(errors, 'SOURCE_KIND_INVALID', 'sources', source.id, 'kind', source.kind);
    }
    if (!isUrl(source.homepage)) {
      appendError(errors, 'SOURCE_HOMEPAGE_INVALID', 'sources', source.id, 'homepage', source.homepage);
    }
    if (resourceUrls.has(source.homepage)) {
      appendError(
        errors,
        'SOURCE_HOMEPAGE_RESOURCE_URL_CONFLICT',
        'sources',
        source.id,
        'homepage',
        source.homepage,
      );
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

  for (const evidence of catalog.atlasEvidence) {
    if (typeof evidence.sourceTitle !== 'string' || evidence.sourceTitle.trim().length === 0) {
      appendError(
        errors,
        'ATLAS_EVIDENCE_SOURCE_TITLE_INVALID',
        'atlasEvidence',
        evidence.id,
        'sourceTitle',
        '',
      );
    }
    if (!atlasEvidenceOriginalLanguages.has(evidence.originalLanguage)) {
      appendError(
        errors,
        'ATLAS_EVIDENCE_ORIGINAL_LANGUAGE_INVALID',
        'atlasEvidence',
        evidence.id,
        'originalLanguage',
        evidence.originalLanguage,
      );
    }
  }

  for (const node of catalog.atlasNodes) {
    const hasInvalidDateRange =
      !Number.isInteger(node.startYear) ||
      (node.kind === 'game' && node.endYear !== undefined) ||
      (node.kind === 'category' &&
        (!Number.isInteger(node.endYear) || (node.endYear as number) <= node.startYear)) ||
      (node.kind === 'innovation' &&
        node.endYear !== undefined &&
        (!Number.isInteger(node.endYear) || node.endYear < node.startYear));
    if (hasInvalidDateRange) {
      appendError(errors, 'ATLAS_NODE_DATE_RANGE_INVALID', 'atlasNodes', node.id, 'startYear/endYear', '');
    }

    if (node.evidenceIds.length === 0) {
      appendError(errors, 'ATLAS_NODE_EVIDENCE_REQUIRED', 'atlasNodes', node.id, 'evidenceIds', '');
    }
    for (const evidenceId of node.evidenceIds) {
      if (!atlasEvidenceIds.has(evidenceId)) {
        appendError(
          errors,
          'ATLAS_NODE_EVIDENCE_MISSING',
          'atlasNodes',
          node.id,
          'evidenceIds',
          evidenceId,
        );
      }
    }
    for (const tag of node.tags) {
      if (!atlasTagIds.has(tag)) {
        appendError(errors, 'ATLAS_TAG_REFERENCE_MISSING', 'atlasNodes', node.id, 'tags', tag);
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

    if (relation.fromId === relation.toId) {
      appendError(
        errors,
        'ATLAS_RELATION_SELF_REFERENCE',
        'atlasRelations',
        relation.id,
        'fromId/toId',
        relation.fromId,
      );
    }

    if (!atlasRelationTypes.has(relation.type)) {
      appendError(
        errors,
        'ATLAS_RELATION_TYPE_INVALID',
        'atlasRelations',
        relation.id,
        'type',
        relation.type,
      );
    }

    if (!atlasEvidenceStatuses.has(relation.status)) {
      appendError(
        errors,
        'ATLAS_RELATION_STATUS_INVALID',
        'atlasRelations',
        relation.id,
        'status',
        relation.status,
      );
    }

    const directionalityIsInvalid =
      !['directed', 'undirected'].includes(relation.directionality) ||
      (directedAtlasRelationTypes.has(relation.type) && relation.directionality !== 'directed') ||
      (undirectedAtlasRelationTypes.has(relation.type) && relation.directionality !== 'undirected');
    if (directionalityIsInvalid) {
      appendError(
        errors,
        'ATLAS_RELATION_DIRECTIONALITY_INVALID',
        'atlasRelations',
        relation.id,
        'directionality',
        relation.directionality,
      );
    }

    if (relation.type === 'disputed' && !relation.directionalityNote?.['zh-CN']?.trim()) {
      appendError(
        errors,
        'ATLAS_RELATION_DIRECTIONALITY_NOTE_REQUIRED',
        'atlasRelations',
        relation.id,
        'directionalityNote',
        relation.directionality,
      );
    }

    if (relation.evidenceIds.length === 0) {
      appendError(
        errors,
        'ATLAS_RELATION_EVIDENCE_REQUIRED',
        'atlasRelations',
        relation.id,
        'evidenceIds',
        '',
      );
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

    for (const tag of relation.tags) {
      if (!atlasTagIds.has(tag)) {
        appendError(errors, 'ATLAS_TAG_REFERENCE_MISSING', 'atlasRelations', relation.id, 'tags', tag);
      }
    }

    const fromNode = atlasNodesById.get(relation.fromId);
    const toNode = atlasNodesById.get(relation.toId);
    if (
      relation.type === 'direct-influence' &&
      relation.status === 'confirmed' &&
      fromNode &&
      toNode &&
      fromNode.startYear > toNode.startYear &&
      !relation.chronologyExplanation?.['zh-CN']?.trim()
    ) {
      appendError(
        errors,
        'ATLAS_RELATION_CHRONOLOGY_UNEXPLAINED',
        'atlasRelations',
        relation.id,
        'chronologyExplanation',
        `${fromNode.id}:${fromNode.startYear}>${toNode.id}:${toNode.startYear}`,
      );
    }
  }

  for (const theme of catalog.atlasThemes) {
    for (const tag of theme.tags) {
      if (!atlasTagIds.has(tag)) {
        appendError(errors, 'ATLAS_TAG_REFERENCE_MISSING', 'atlasThemes', theme.id, 'tags', tag);
      }
    }
  }

  return errors;
}
