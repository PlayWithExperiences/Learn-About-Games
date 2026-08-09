export type MapPoint = Readonly<{
  x: number;
  y: number;
}>;

export type MapBounds = Readonly<{
  x: number;
  y: number;
  width: number;
  height: number;
}>;

export type EgdsBoxKind =
  | 'root'
  | 'branch'
  | 'entry'
  | 'stage'
  | 'lever'
  | 'cluster'
  | 'external-entry'
  | 'capability'
  | 'knowledge-topic'
  | 'relation-endpoint';

export type EgdsMapBox = Readonly<{
  id: string;
  key: `${EgdsBoxKind}:${string}`;
  kind: EgdsBoxKind;
  frameworkNodeId?: string;
  x: number;
  y: number;
  width: number;
  height: number;
}>;

export type EgdsMapPath = Readonly<{
  id: string;
  fromKey: string;
  toKey: string;
  path: string;
}>;

export type EgdsMapLayout = Readonly<{
  width: 1180;
  height: number;
  expandedFrameworkNodeId?: string;
  frameworkBoxes: EgdsMapBox[];
  entityBoxes: EgdsMapBox[];
  relationEndpointBoxes: EgdsMapBox[];
  structuralPaths: EgdsMapPath[];
  processPaths: EgdsMapPath[];
  relationPaths: Array<EgdsMapPath & Readonly<{
    relationId: string;
    relationType: 'supports' | 'complements';
  }>>;
  expansionLeaderPath?: EgdsMapPath;
  externalEntries: Array<Readonly<{ id: string; targetPath: string }>>;
}>;

type EgdsFrameworkNodeInput = Readonly<{
  id: string;
  kind: string;
  parentNodeId?: string;
}>;

type EgdsFrameworkRelationInput = Readonly<{
  id: string;
  type: string;
  fromId: string;
  toId?: string;
  targetPath?: string;
}>;

type EgdsEntityInput = Readonly<{
  id: string;
  frameworkNodeId: string;
}>;

type EgdsCapabilityRelationInput = Readonly<{
  id: string;
  fromId: string;
  toId: string;
  type: string;
}>;

export type BuildEgdsMapLayoutInput = Readonly<{
  frameworkNodes: readonly EgdsFrameworkNodeInput[];
  frameworkRelations: readonly EgdsFrameworkRelationInput[];
  capabilities: readonly EgdsEntityInput[];
  knowledgeTopics: readonly EgdsEntityInput[];
  capabilityRelations: readonly EgdsCapabilityRelationInput[];
  expandedFrameworkNodeId?: string;
  selectedCapabilityId?: string;
}>;

type EgdsAnchor = readonly [x: number, y: number, width: number, height: number];

const egdsAnchors: Readonly<Record<string, EgdsAnchor>> = {
  'egds-root': [20, 320, 130, 60],
  'experience-design': [180, 80, 180, 54],
  'from-plan-to-ship': [180, 220, 180, 54],
  'with-team': [180, 360, 180, 54],
  'product-profit': [180, 500, 180, 54],
  'beyond-games': [180, 630, 180, 54],
  'experience-journey': [390, 15, 190, 44],
  perception: [390, 80, 125, 44],
  rationalization: [535, 80, 125, 44],
  deconstruction: [680, 80, 125, 44],
  reconstruction: [825, 80, 125, 44],
  'narrative-lever': [990, 25, 170, 42],
  'aesthetics-lever': [990, 80, 170, 42],
  'gameplay-challenges-lever': [990, 135, 170, 42],
  'mindset-problem-solving-tools': [410, 225, 170, 44],
  'prototype-production-breakdown': [600, 225, 170, 44],
  'playtest-evidence-iteration': [790, 225, 170, 44],
  'tradeoff-specification-delivery': [980, 225, 170, 44],
  'vision-direction-decisions': [410, 365, 170, 44],
  'alignment-communication': [600, 365, 170, 44],
  'leadership-management': [790, 365, 170, 44],
  'feedback-collaboration': [980, 365, 170, 44],
  'audience-positioning-cluster': [410, 505, 170, 44],
  'market-opportunity': [600, 505, 170, 44],
  'value-exchange': [790, 505, 170, 44],
  'monetization-alignment': [980, 505, 170, 44],
  'values-culture': [440, 635, 220, 44],
  'innovation-possibility-space': [720, 635, 240, 44],
};

const egdsOverviewHeight = 720;
const egdsExpansionTop = 724;
const egdsExpansionMetrics = {
  headingHeight: 72,
  bottomPadding: 24,
  x: 210,
  width: 280,
  height: 52,
  columns: 3,
  columnGap: 24,
  rowGap: 16,
} as const;

const egdsKey = (kind: EgdsBoxKind, id: string) => `${kind}:${id}` as EgdsMapBox['key'];

const egdsFrameworkBoxKinds = new Set<Extract<EgdsBoxKind,
  'root' | 'branch' | 'entry' | 'stage' | 'lever' | 'cluster' | 'external-entry'
>>([
  'root', 'branch', 'entry', 'stage', 'lever', 'cluster', 'external-entry',
]);

const isEgdsFrameworkBoxKind = (kind: string): kind is Extract<EgdsBoxKind,
  'root' | 'branch' | 'entry' | 'stage' | 'lever' | 'cluster' | 'external-entry'
> => egdsFrameworkBoxKinds.has(kind as Extract<EgdsBoxKind,
  'root' | 'branch' | 'entry' | 'stage' | 'lever' | 'cluster' | 'external-entry'
>);

const isProcessRelation = (
  relation: EgdsFrameworkRelationInput,
): relation is EgdsFrameworkRelationInput & Readonly<{ type: 'process-next'; toId: string }> => (
  relation.type === 'process-next' && typeof relation.toId === 'string'
);

const isExternalEntryRelation = (
  relation: EgdsFrameworkRelationInput,
): relation is EgdsFrameworkRelationInput & Readonly<{ type: 'links-to'; targetPath: string }> => (
  relation.type === 'links-to' && typeof relation.targetPath === 'string'
);

const isCapabilityRelationType = (
  relation: EgdsCapabilityRelationInput,
): relation is EgdsCapabilityRelationInput & Readonly<{ type: 'supports' | 'complements' }> => (
  relation.type === 'supports' || relation.type === 'complements'
);

const compareId = (left: Readonly<{ id: string }>, right: Readonly<{ id: string }>) => left.id.localeCompare(right.id);

const egdsCenterX = (box: EgdsMapBox) => box.x + box.width / 2;
const egdsCenterY = (box: EgdsMapBox) => box.y + box.height / 2;

const egdsBox = (
  id: string,
  kind: EgdsBoxKind,
  anchor: EgdsAnchor,
  frameworkNodeId?: string,
): EgdsMapBox => ({
  id,
  key: egdsKey(kind, id),
  kind,
  ...(frameworkNodeId ? { frameworkNodeId } : {}),
  x: anchor[0],
  y: anchor[1],
  width: anchor[2],
  height: anchor[3],
});

const buildExpansionPath = (from: EgdsMapBox, to: EgdsMapBox) => {
  const fromX = egdsCenterX(from);
  const toX = egdsCenterX(to);
  const fromBelow = egdsCenterY(from) < egdsCenterY(to);
  const startY = fromBelow ? from.y + from.height : from.y;
  const endY = fromBelow ? to.y : to.y + to.height;
  const railY = (startY + endY) / 2;
  return `M ${fromX} ${startY} V ${railY} H ${toX} V ${endY}`;
};

const buildEgdsStructuralPath = (from: EgdsMapBox, to: EgdsMapBox): string => {
  const startX = from.x + from.width;
  const startY = egdsCenterY(from);
  if (from.kind === 'root' && to.kind === 'branch') {
    return `M ${startX} ${startY} H 165 V ${egdsCenterY(to)} H ${to.x}`;
  }
  if (from.id === 'experience-design' && to.id === 'experience-journey') {
    return `M ${startX} ${startY} H 375 V 37 H ${to.x}`;
  }
  if (from.id === 'experience-design' && to.kind === 'stage') {
    return `M ${startX} ${startY} H 375 V 64 H ${egdsCenterX(to)} V ${to.y}`;
  }
  if (from.id === 'reconstruction' && to.kind === 'lever') {
    return `M ${startX} ${startY} H 970 V ${egdsCenterY(to)} H ${to.x}`;
  }
  const railY = to.y - 16;
  return `M ${startX} ${startY} H ${startX + 15} V ${railY} H ${egdsCenterX(to)} V ${to.y}`;
};

export function buildEgdsMapLayout({
  frameworkNodes,
  frameworkRelations,
  capabilities,
  knowledgeTopics,
  capabilityRelations,
  expandedFrameworkNodeId,
  selectedCapabilityId,
}: BuildEgdsMapLayoutInput): EgdsMapLayout {
  const frameworkNodesById = new Map<string, EgdsFrameworkNodeInput>();
  for (const node of frameworkNodes) {
    if (frameworkNodesById.has(node.id)) throw new Error(`Duplicate framework node: ${node.id}`);
    if (!egdsAnchors[node.id]) throw new Error(`Unknown framework anchor: ${node.id}`);
    if (!isEgdsFrameworkBoxKind(node.kind)) throw new Error(`Unknown framework node kind: ${node.kind}`);
    frameworkNodesById.set(node.id, node);
  }
  for (const node of frameworkNodes) {
    if (node.parentNodeId && !frameworkNodesById.has(node.parentNodeId)) {
      throw new Error(`Unknown framework parent: ${node.parentNodeId}`);
    }
  }
  if (expandedFrameworkNodeId && !frameworkNodesById.has(expandedFrameworkNodeId)) {
    throw new Error(`Unknown framework node: ${expandedFrameworkNodeId}`);
  }
  if (selectedCapabilityId && !expandedFrameworkNodeId) {
    throw new Error('Selected capability requires an expanded framework node');
  }

  const frameworkBoxes = [...frameworkNodes]
    .sort(compareId)
    .map((node) => {
      if (!isEgdsFrameworkBoxKind(node.kind)) throw new Error(`Unknown framework node kind: ${node.kind}`);
      return egdsBox(node.id, node.kind, egdsAnchors[node.id]!);
    });
  const frameworkBoxesById = new Map(frameworkBoxes.map((box) => [box.id, box]));
  const capabilityById = new Map<string, EgdsEntityInput>();
  for (const capability of capabilities) {
    if (capabilityById.has(capability.id)) throw new Error(`Duplicate capability: ${capability.id}`);
    if (!frameworkNodesById.has(capability.frameworkNodeId)) {
      throw new Error(`Unknown framework node for capability ${capability.id}: ${capability.frameworkNodeId}`);
    }
    capabilityById.set(capability.id, capability);
  }
  for (const topic of knowledgeTopics) {
    if (!frameworkNodesById.has(topic.frameworkNodeId)) {
      throw new Error(`Unknown framework node for knowledge topic ${topic.id}: ${topic.frameworkNodeId}`);
    }
  }
  if (selectedCapabilityId && !capabilityById.has(selectedCapabilityId)) {
    throw new Error(`Unknown capability: ${selectedCapabilityId}`);
  }
  if (
    selectedCapabilityId
    && capabilityById.get(selectedCapabilityId)!.frameworkNodeId !== expandedFrameworkNodeId
  ) {
    throw new Error(`Selected capability ${selectedCapabilityId} belongs to expanded framework node ${capabilityById.get(selectedCapabilityId)!.frameworkNodeId}`);
  }
  for (const relation of capabilityRelations) {
    if (!isCapabilityRelationType(relation)) throw new Error(`Unknown capability relation type: ${relation.type}`);
    if (!capabilityById.has(relation.fromId) || !capabilityById.has(relation.toId)) {
      throw new Error(`Unknown capability in relation: ${relation.id}`);
    }
  }

  const structuralPaths = [...frameworkNodes]
    .filter((node): node is EgdsFrameworkNodeInput & { parentNodeId: string } => Boolean(node.parentNodeId))
    .sort(compareId)
    .map((node) => {
      const from = frameworkBoxesById.get(node.parentNodeId);
      const to = frameworkBoxesById.get(node.id);
      if (!from || !to) throw new Error(`Cannot project structural path: ${node.parentNodeId} -> ${node.id}`);
      return {
        id: `structural:${from.key}->${to.key}`,
        fromKey: from.key,
        toKey: to.key,
        path: buildEgdsStructuralPath(from, to),
      };
    });
  const processPaths = frameworkRelations
    .filter(isProcessRelation)
    .sort(compareId)
    .map((relation) => {
      const from = frameworkBoxesById.get(relation.fromId);
      const to = frameworkBoxesById.get(relation.toId);
      if (!from || !to) throw new Error(`Unknown framework node in process relation: ${relation.id}`);
      return {
        id: relation.id,
        fromKey: from.key,
        toKey: to.key,
        path: `M ${from.x + from.width} ${egdsCenterY(from)} H ${to.x}`,
      };
    });
  const externalEntries = frameworkRelations
    .filter(isExternalEntryRelation)
    .sort(compareId)
    .map(({ fromId, targetPath }) => {
      if (!frameworkNodesById.has(fromId)) throw new Error(`Unknown framework node in external relation: ${fromId}`);
      return { id: fromId, targetPath };
    });

  if (!expandedFrameworkNodeId) {
    return {
      width: 1180,
      height: egdsOverviewHeight,
      frameworkBoxes,
      entityBoxes: [],
      relationEndpointBoxes: [],
      structuralPaths,
      processPaths,
      relationPaths: [],
      externalEntries,
    };
  }

  const expandedEntities = [
    ...capabilities.map((entity) => ({ ...entity, kind: 'capability' as const })),
    ...knowledgeTopics.map((entity) => ({ ...entity, kind: 'knowledge-topic' as const })),
  ]
    .filter((entity) => entity.frameworkNodeId === expandedFrameworkNodeId)
    .sort((left, right) => egdsKey(left.kind, left.id).localeCompare(egdsKey(right.kind, right.id)));
  const entityBoxes = expandedEntities.map((entity, index) => egdsBox(
    entity.id,
    entity.kind,
    [
      egdsExpansionMetrics.x + (index % egdsExpansionMetrics.columns) * (egdsExpansionMetrics.width + egdsExpansionMetrics.columnGap),
      egdsExpansionTop + egdsExpansionMetrics.headingHeight + Math.floor(index / egdsExpansionMetrics.columns) * (egdsExpansionMetrics.height + egdsExpansionMetrics.rowGap),
      egdsExpansionMetrics.width,
      egdsExpansionMetrics.height,
    ],
    expandedFrameworkNodeId,
  ));
  const entityBoxesByCapabilityId = new Map(
    entityBoxes.filter((box) => box.kind === 'capability').map((box) => [box.id, box]),
  );
  const selectedRelations = selectedCapabilityId
    ? capabilityRelations.filter(isCapabilityRelationType)
      .filter((relation) => relation.fromId === selectedCapabilityId || relation.toId === selectedCapabilityId)
      .sort(compareId)
    : [];
  const externalNeighborIds = [...new Set(selectedRelations
    .map((relation) => relation.fromId === selectedCapabilityId ? relation.toId : relation.fromId)
    .filter((id) => !entityBoxesByCapabilityId.has(id)))]
    .sort((left, right) => left.localeCompare(right));
  const entityRows = Math.ceil(entityBoxes.length / egdsExpansionMetrics.columns);
  const relationEndpointBoxes = externalNeighborIds.map((id, index) => egdsBox(
    id,
    'relation-endpoint',
    [
      egdsExpansionMetrics.x + (index % egdsExpansionMetrics.columns) * (egdsExpansionMetrics.width + egdsExpansionMetrics.columnGap),
      egdsExpansionTop + egdsExpansionMetrics.headingHeight + entityRows * (egdsExpansionMetrics.height + egdsExpansionMetrics.rowGap)
        + Math.floor(index / egdsExpansionMetrics.columns) * (egdsExpansionMetrics.height + egdsExpansionMetrics.rowGap),
      egdsExpansionMetrics.width,
      egdsExpansionMetrics.height,
    ],
  ));
  const relationEndpointBoxesByCapabilityId = new Map(relationEndpointBoxes.map((box) => [box.id, box]));
  const relationPathBox = (id: string) => entityBoxesByCapabilityId.get(id) ?? relationEndpointBoxesByCapabilityId.get(id);
  const relationPaths = selectedRelations.map((relation) => {
    const from = relationPathBox(relation.fromId);
    const to = relationPathBox(relation.toId);
    if (!from || !to) throw new Error(`Cannot project selected relation: ${relation.id}`);
    return {
      id: `relation:${relation.id}`,
      relationId: relation.id,
      relationType: relation.type,
      fromKey: from.key,
      toKey: to.key,
      path: buildExpansionPath(from, to),
    };
  });
  const relationEndpointRows = Math.ceil(relationEndpointBoxes.length / egdsExpansionMetrics.columns);
  const expansionHeight = egdsExpansionMetrics.headingHeight
    + entityRows * (egdsExpansionMetrics.height + egdsExpansionMetrics.rowGap)
    + relationEndpointRows * (egdsExpansionMetrics.height + egdsExpansionMetrics.rowGap)
    + egdsExpansionMetrics.bottomPadding;
  const expandedFrameworkBox = frameworkBoxesById.get(expandedFrameworkNodeId)!;

  return {
    width: 1180,
    height: egdsExpansionTop + expansionHeight,
    expandedFrameworkNodeId,
    frameworkBoxes,
    entityBoxes,
    relationEndpointBoxes,
    structuralPaths,
    processPaths,
    relationPaths,
    expansionLeaderPath: {
      id: `expansion-leader:${expandedFrameworkNodeId}`,
      fromKey: expandedFrameworkBox.key,
      toKey: `expansion-heading:${expandedFrameworkNodeId}`,
      path: `M ${egdsCenterX(expandedFrameworkBox)} ${expandedFrameworkBox.y + expandedFrameworkBox.height} V ${egdsExpansionTop}`,
    },
    externalEntries,
  };
}

export type MindMapBoxKind =
  | 'root'
  | 'group'
  | 'domain'
  | 'capability'
  | 'knowledge-topic';

export type MindMapBox = Readonly<{
  id: string;
  key: `${MindMapBoxKind}:${string}`;
  kind: MindMapBoxKind;
  x: number;
  y: number;
  width: number;
  height: number;
}>;

export type CapabilityMindMapLayout = Readonly<{
  width: number;
  height: number;
  root: MindMapBox;
  groups: MindMapBox[];
  domains: MindMapBox[];
  nodes: MindMapBox[];
  structuralPaths: Array<Readonly<{
    id: string;
    fromKey: MindMapBox['key'];
    toKey: MindMapBox['key'];
    path: string;
  }>>;
}>;

type MindMapGroupInput = Readonly<{
  id: string;
  order: number;
  domainIds: readonly string[];
}>;

type MindMapDomainInput = Readonly<{
  id: string;
  order: number;
}>;

type MindMapEntityInput = Readonly<{
  id: string;
  domainId: string;
  position: MapPoint;
}>;

type TypedMindMapEntityInput = MindMapEntityInput & Readonly<{
  kind: Extract<MindMapBoxKind, 'capability' | 'knowledge-topic'>;
}>;

const mindMapMetrics = {
  width: 1180,
  topPadding: 32,
  bottomPadding: 32,
  rootX: 28,
  rootWidth: 132,
  rootHeight: 60,
  groupX: 208,
  groupWidth: 176,
  groupHeight: 60,
  domainX: 420,
  domainWidth: 170,
  domainHeight: 46,
  nodeStartX: 650,
  nodeWidth: 152,
  nodeHeight: 48,
  nodeColumns: 3,
  columnGap: 18,
  rowGap: 14,
  domainGap: 28,
  groupGap: 54,
} as const;

const compareOrderAndId = (
  left: Readonly<{ order: number; id: string }>,
  right: Readonly<{ order: number; id: string }>,
) => left.order - right.order || left.id.localeCompare(right.id);

const compareEntityPosition = (left: MindMapEntityInput, right: MindMapEntityInput) =>
  left.position.y - right.position.y
  || left.position.x - right.position.x
  || left.id.localeCompare(right.id);

const boxCenterY = (box: MindMapBox) => box.y + box.height / 2;

const buildElbowPath = (from: MindMapBox, to: MindMapBox) => {
  const startX = from.x + from.width;
  const startY = boxCenterY(from);
  const endX = to.x;
  const endY = boxCenterY(to);
  const elbowX = (startX + endX) / 2;
  return `M ${startX} ${startY} H ${elbowX} V ${endY} H ${endX}`;
};

export function buildCapabilityMindMapLayout(
  mapGroups: readonly MindMapGroupInput[],
  domains: readonly MindMapDomainInput[],
  capabilities: readonly MindMapEntityInput[],
  knowledgeTopics: readonly MindMapEntityInput[],
): CapabilityMindMapLayout {
  const orderedGroups = [...mapGroups].sort(compareOrderAndId);
  const domainsById = new Map(domains.map((domain) => [domain.id, domain]));
  const entities: TypedMindMapEntityInput[] = [
    ...capabilities.map((entity) => ({ ...entity, kind: 'capability' as const })),
    ...knowledgeTopics.map((entity) => ({ ...entity, kind: 'knowledge-topic' as const })),
  ];
  const groupBoxes: MindMapBox[] = [];
  const domainBoxes: MindMapBox[] = [];
  const nodeBoxes: MindMapBox[] = [];
  const domainOwnerKey = new Map<string, MindMapBox['key']>();
  let cursorY = mindMapMetrics.topPadding;

  for (const [groupIndex, group] of orderedGroups.entries()) {
    const groupKey = `group:${group.id}` as const;
    const groupStartY = cursorY;
    const orderedDomains = group.domainIds
      .map((domainId) => domainsById.get(domainId))
      .filter((domain): domain is MindMapDomainInput => Boolean(domain))
      .sort(compareOrderAndId);

    for (const [domainIndex, domain] of orderedDomains.entries()) {
      const domainKey = `domain:${domain.id}` as const;
      const orderedEntities = entities
        .filter((entity) => entity.domainId === domain.id)
        .sort(compareEntityPosition);
      const rowCount = Math.ceil(orderedEntities.length / mindMapMetrics.nodeColumns);
      const nodeRowsHeight = rowCount === 0
        ? 0
        : rowCount * mindMapMetrics.nodeHeight + (rowCount - 1) * mindMapMetrics.rowGap;
      const domainBlockHeight = Math.max(mindMapMetrics.domainHeight, nodeRowsHeight);
      const nodeTop = cursorY + (domainBlockHeight - nodeRowsHeight) / 2;

      domainOwnerKey.set(domain.id, groupKey);
      domainBoxes.push({
        id: domain.id,
        key: domainKey,
        kind: 'domain',
        x: mindMapMetrics.domainX,
        y: cursorY + (domainBlockHeight - mindMapMetrics.domainHeight) / 2,
        width: mindMapMetrics.domainWidth,
        height: mindMapMetrics.domainHeight,
      });

      orderedEntities.forEach((entity, index) => {
        nodeBoxes.push({
          id: entity.id,
          key: `${entity.kind}:${entity.id}`,
          kind: entity.kind,
          x: mindMapMetrics.nodeStartX
            + (index % mindMapMetrics.nodeColumns)
              * (mindMapMetrics.nodeWidth + mindMapMetrics.columnGap),
          y: nodeTop
            + Math.floor(index / mindMapMetrics.nodeColumns)
              * (mindMapMetrics.nodeHeight + mindMapMetrics.rowGap),
          width: mindMapMetrics.nodeWidth,
          height: mindMapMetrics.nodeHeight,
        });
      });

      cursorY += domainBlockHeight;
      if (domainIndex < orderedDomains.length - 1) cursorY += mindMapMetrics.domainGap;
    }

    const groupEndY = cursorY;
    groupBoxes.push({
      id: group.id,
      key: groupKey,
      kind: 'group',
      x: mindMapMetrics.groupX,
      y: (groupStartY + groupEndY - mindMapMetrics.groupHeight) / 2,
      width: mindMapMetrics.groupWidth,
      height: mindMapMetrics.groupHeight,
    });
    if (groupIndex < orderedGroups.length - 1) cursorY += mindMapMetrics.groupGap;
  }

  const height = cursorY + mindMapMetrics.bottomPadding;
  const root: MindMapBox = {
    id: 'expertise-map-root',
    key: 'root:expertise-map-root',
    kind: 'root',
    x: mindMapMetrics.rootX,
    y: (height - mindMapMetrics.rootHeight) / 2,
    width: mindMapMetrics.rootWidth,
    height: mindMapMetrics.rootHeight,
  };
  const boxesByKey = new Map(
    [root, ...groupBoxes, ...domainBoxes].map((box) => [box.key, box]),
  );
  const structuralPairs: Array<readonly [MindMapBox['key'], MindMapBox['key']]> = [
    ...groupBoxes.map((group) => [root.key, group.key] as const),
    ...domainBoxes.map((domain) => [domainOwnerKey.get(domain.id), domain.key] as const)
      .filter((pair): pair is readonly [MindMapBox['key'], MindMapBox['key']] => Boolean(pair[0])),
  ];
  const structuralPaths = structuralPairs.map(([fromKey, toKey]) => {
    const from = boxesByKey.get(fromKey);
    const to = boxesByKey.get(toKey);
    if (!from || !to) throw new Error(`Cannot project structural path: ${fromKey} -> ${toKey}`);
    return {
      id: `structural:${fromKey}->${toKey}`,
      fromKey,
      toKey,
      path: buildElbowPath(from, to),
    };
  });

  return {
    width: mindMapMetrics.width,
    height,
    root,
    groups: groupBoxes,
    domains: domainBoxes,
    nodes: nodeBoxes,
    structuralPaths,
  };
}

export function rectanglesOverlap(left: MindMapBox, right: MindMapBox): boolean {
  return left.x < right.x + right.width
    && left.x + left.width > right.x
    && left.y < right.y + right.height
    && left.y + left.height > right.y;
}

export const relationSemantics = {
  supports: {
    direction: 'forward',
    prerequisite: false,
    description: {
      'zh-CN': 'A 经常有助于 B，但不表示 A 是 B 的必修或先修能力。',
      en: 'A often helps B, but A is not a prerequisite for B.',
    },
  },
  complements: {
    direction: 'mutual',
    description: {
      'zh-CN': 'A 与 B 经常协同使用，关系不表示顺序。',
      en: 'A and B often work together; the relation does not imply an order.',
    },
  },
} as const;

export function isPointInsideBounds(point: MapPoint, bounds: MapBounds): boolean {
  return (
    point.x >= bounds.x &&
    point.x <= bounds.x + bounds.width &&
    point.y >= bounds.y &&
    point.y <= bounds.y + bounds.height
  );
}

export function projectRelationEndpoints(
  relation: Readonly<{ fromId: string; toId: string }>,
  positionsByCapabilityId: ReadonlyMap<string, MapPoint>,
): { start: MapPoint; end: MapPoint } {
  const start = positionsByCapabilityId.get(relation.fromId);
  const end = positionsByCapabilityId.get(relation.toId);

  if (!start || !end) {
    throw new Error(`Cannot project relation with missing capability: ${relation.fromId} -> ${relation.toId}`);
  }

  return { start, end };
}
