import type { Catalog } from './catalog/validate';

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
  fromKey: EgdsMapBox['key'];
  toKey: EgdsMapBox['key'];
  path: string;
}>;

export type EgdsExpansionLeaderPath = Readonly<{
  id: string;
  fromKey: EgdsMapBox['key'];
  toKey: `expansion-heading:${string}`;
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
  expansionLeaderPath?: EgdsExpansionLeaderPath;
  externalEntries: Array<Readonly<{ id: string; targetPath: 'atlas/' }>>;
}>;

type EgdsFrameworkNodeInput = Catalog['egdsFrameworkNodes'][number];
type EgdsFrameworkRelationInput = Catalog['egdsFrameworkRelations'][number];
type EgdsEntityInput = Catalog['capabilities'][number] | Catalog['knowledgeTopics'][number];

export type BuildEgdsMapLayoutInput = Readonly<{
  frameworkNodes: Catalog['egdsFrameworkNodes'];
  frameworkRelations: Catalog['egdsFrameworkRelations'];
  capabilities: Catalog['capabilities'];
  knowledgeTopics: Catalog['knowledgeTopics'];
  capabilityRelations: Catalog['capabilityRelations'];
  expandedFrameworkNodeId?: string;
  selectedCapabilityId?: string;
}>;

type EgdsAnchor = readonly [x: number, y: number, width: number, height: number];

const egdsAnchors: Readonly<Record<string, EgdsAnchor>> = {
  'egds-root': [20, 352, 130, 60],
  'experience-design': [180, 80, 180, 54],
  'from-plan-to-ship': [180, 220, 180, 54],
  'with-team': [180, 360, 180, 54],
  'product-profit': [180, 500, 180, 54],
  'beyond-games': [180, 630, 180, 54],
  'experience-journey': [390, 20, 190, 44],
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

const compareCodeUnits = (left: string, right: string) => left < right ? -1 : left > right ? 1 : 0;

const compareId = (left: Readonly<{ id: string }>, right: Readonly<{ id: string }>) => compareCodeUnits(left.id, right.id);

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

type OrthogonalPoint = Readonly<{ x: number; y: number }>;
type OrthogonalPort = Readonly<{ boundary: OrthogonalPoint; escape: OrthogonalPoint }>;
type OrthogonalSegment = Readonly<{ start: OrthogonalPoint; end: OrthogonalPoint }>;

const routeClearance = 8;

const boxPorts = (box: EgdsMapBox): OrthogonalPort[] => [
  {
    boundary: { x: egdsCenterX(box), y: box.y },
    escape: { x: egdsCenterX(box), y: box.y - routeClearance },
  },
  {
    boundary: { x: box.x + box.width, y: egdsCenterY(box) },
    escape: { x: box.x + box.width + routeClearance, y: egdsCenterY(box) },
  },
  {
    boundary: { x: egdsCenterX(box), y: box.y + box.height },
    escape: { x: egdsCenterX(box), y: box.y + box.height + routeClearance },
  },
  {
    boundary: { x: box.x, y: egdsCenterY(box) },
    escape: { x: box.x - routeClearance, y: egdsCenterY(box) },
  },
];

const positiveOverlap = (firstStart: number, firstEnd: number, secondStart: number, secondEnd: number) => (
  Math.max(Math.min(firstStart, firstEnd), secondStart) < Math.min(Math.max(firstStart, firstEnd), secondEnd)
);

const segmentHitsBox = (segment: OrthogonalSegment, box: EgdsMapBox) => {
  const horizontal = segment.start.y === segment.end.y;
  const vertical = segment.start.x === segment.end.x;
  const crossesInterior = (
    horizontal
    && segment.start.y > box.y
    && segment.start.y < box.y + box.height
    && positiveOverlap(segment.start.x, segment.end.x, box.x, box.x + box.width)
  ) || (
    vertical
    && segment.start.x > box.x
    && segment.start.x < box.x + box.width
    && positiveOverlap(segment.start.y, segment.end.y, box.y, box.y + box.height)
  );
  const overlapsBoundary = (
    horizontal
    && (segment.start.y === box.y || segment.start.y === box.y + box.height)
    && positiveOverlap(segment.start.x, segment.end.x, box.x, box.x + box.width)
  ) || (
    vertical
    && (segment.start.x === box.x || segment.start.x === box.x + box.width)
    && positiveOverlap(segment.start.y, segment.end.y, box.y, box.y + box.height)
  );
  return crossesInterior || overlapsBoundary;
};

const normalizeRoutePoints = (points: readonly OrthogonalPoint[]) => points.filter((point, index) => (
  index === 0 || point.x !== points[index - 1]!.x || point.y !== points[index - 1]!.y
));

const routeLength = (points: readonly OrthogonalPoint[]) => points.slice(1).reduce(
  (length, point, index) => length
    + Math.abs(point.x - points[index]!.x)
    + Math.abs(point.y - points[index]!.y),
  0,
);

const routeIsClear = (
  points: readonly OrthogonalPoint[],
  obstacles: readonly EgdsMapBox[],
  width: number,
  height: number,
) => points.every((point) => point.x >= 0 && point.x <= width && point.y >= 0 && point.y <= height)
  && points.slice(1).every((point, index) => {
    const segment = { start: points[index]!, end: point };
    return (segment.start.x === segment.end.x || segment.start.y === segment.end.y)
      && obstacles.every((box) => !segmentHitsBox(segment, box));
  });

const routeToPath = (points: readonly OrthogonalPoint[]) => points.slice(1).reduce(
  (path, point, index) => `${path} ${point.x === points[index]!.x ? 'V' : 'H'} ${point.x === points[index]!.x ? point.y : point.x}`,
  `M ${points[0]!.x} ${points[0]!.y}`,
);

const buildObstacleAvoidingPath = ({
  starts,
  ends,
  obstacles,
  width,
  height,
}: Readonly<{
  starts: readonly OrthogonalPort[];
  ends: readonly OrthogonalPort[];
  obstacles: readonly EgdsMapBox[];
  width: number;
  height: number;
}>) => {
  const verticalLanes = [...new Set([
    routeClearance,
    width - routeClearance,
    ...obstacles.flatMap((box) => [box.x - routeClearance, box.x + box.width + routeClearance]),
  ])].filter((x) => x >= 0 && x <= width).sort((left, right) => left - right);
  const horizontalLanes = [...new Set([
    routeClearance,
    height - routeClearance,
    ...obstacles.flatMap((box) => [box.y - routeClearance, box.y + box.height + routeClearance]),
  ])].filter((y) => y >= 0 && y <= height).sort((left, right) => left - right);
  let bestRoute: OrthogonalPoint[] | undefined;
  let bestLength = Number.POSITIVE_INFINITY;

  for (const start of starts) {
    for (const end of ends) {
      const middles: OrthogonalPoint[][] = [
        [{ x: end.escape.x, y: start.escape.y }],
        [{ x: start.escape.x, y: end.escape.y }],
        ...verticalLanes.map((x) => [
          { x, y: start.escape.y },
          { x, y: end.escape.y },
        ]),
        ...horizontalLanes.map((y) => [
          { x: start.escape.x, y },
          { x: end.escape.x, y },
        ]),
      ];
      for (const middle of middles) {
        const points = normalizeRoutePoints([
          start.boundary,
          start.escape,
          ...middle,
          end.escape,
          end.boundary,
        ]);
        const length = routeLength(points);
        if (length >= bestLength || !routeIsClear(points, obstacles, width, height)) continue;
        bestRoute = points;
        bestLength = length;
      }
    }
  }

  if (!bestRoute) throw new Error('Cannot project an obstacle-free orthogonal path');
  return routeToPath(bestRoute);
};

const buildEgdsStructuralPath = (from: EgdsMapBox, to: EgdsMapBox): string => {
  const startX = from.x + from.width;
  const startY = egdsCenterY(from);
  if (from.kind === 'root' && to.kind === 'branch') {
    return `M ${startX} ${startY} H 165 V ${egdsCenterY(to)} H ${to.x}`;
  }
  if (from.id === 'experience-design' && to.id === 'experience-journey') {
    return `M ${startX} ${startY} H 375 V ${egdsCenterY(to)} H ${to.x}`;
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
  const knowledgeTopicById = new Map<string, EgdsEntityInput>();
  for (const topic of knowledgeTopics) {
    if (knowledgeTopicById.has(topic.id)) throw new Error(`Duplicate knowledge topic: ${topic.id}`);
    if (!frameworkNodesById.has(topic.frameworkNodeId)) {
      throw new Error(`Unknown framework node for knowledge topic ${topic.id}: ${topic.frameworkNodeId}`);
    }
    knowledgeTopicById.set(topic.id, topic);
  }
  if (
    expandedFrameworkNodeId
    && !capabilities.some(({ frameworkNodeId }) => frameworkNodeId === expandedFrameworkNodeId)
    && !knowledgeTopics.some(({ frameworkNodeId }) => frameworkNodeId === expandedFrameworkNodeId)
  ) {
    throw new Error(`Expanded framework node ${expandedFrameworkNodeId} does not contain capabilities or knowledge topics`);
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
    .sort((left, right) => compareCodeUnits(egdsKey(left.kind, left.id), egdsKey(right.kind, right.id)));
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
    ? capabilityRelations
      .filter((relation) => relation.fromId === selectedCapabilityId || relation.toId === selectedCapabilityId)
      .sort(compareId)
    : [];
  const externalNeighborIds = [...new Set(selectedRelations
    .map((relation) => relation.fromId === selectedCapabilityId ? relation.toId : relation.fromId)
    .filter((id) => !entityBoxesByCapabilityId.has(id)))]
    .sort(compareCodeUnits);
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
  const relationEndpointRows = Math.ceil(relationEndpointBoxes.length / egdsExpansionMetrics.columns);
  const expansionHeight = egdsExpansionMetrics.headingHeight
    + entityRows * (egdsExpansionMetrics.height + egdsExpansionMetrics.rowGap)
    + relationEndpointRows * (egdsExpansionMetrics.height + egdsExpansionMetrics.rowGap)
    + egdsExpansionMetrics.bottomPadding;
  const layoutHeight = egdsExpansionTop + expansionHeight;
  const expansionObstacles = [
    ...frameworkBoxes,
    ...entityBoxes,
    ...relationEndpointBoxes,
  ];
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
      path: buildObstacleAvoidingPath({
        starts: boxPorts(from),
        ends: boxPorts(to),
        obstacles: expansionObstacles,
        width: 1180,
        height: layoutHeight,
      }),
    };
  });
  const expandedFrameworkBox = frameworkBoxesById.get(expandedFrameworkNodeId)!;

  return {
    width: 1180,
    height: layoutHeight,
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
      toKey: `expansion-heading:${expandedFrameworkNodeId}` as const,
      path: buildObstacleAvoidingPath({
        starts: boxPorts(expandedFrameworkBox),
        ends: [{
          boundary: { x: egdsExpansionMetrics.x, y: egdsExpansionTop },
          escape: { x: egdsExpansionMetrics.x, y: egdsExpansionTop - routeClearance },
        }],
        obstacles: expansionObstacles,
        width: 1180,
        height: layoutHeight,
      }),
    },
    externalEntries,
  };
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
