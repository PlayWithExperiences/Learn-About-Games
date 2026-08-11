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
  fromPort: EgdsPortSide;
  toPort: EgdsPortSide;
  path: string;
}>;

export type EgdsBranchTerritory = Readonly<{
  branchId: string;
  x: number;
  y: number;
  width: number;
  height: number;
  nestedTerritory?: Readonly<{
    id: 'experience-process';
    x: number;
    y: number;
    width: number;
    height: number;
  }>;
}>;

export type EgdsPortSide = 'north' | 'east' | 'south' | 'west';

export type EgdsMapLayout = Readonly<{
  mode: 'overview' | 'focus';
  focusedBranchId?: string;
  width: number;
  height: number;
  expandedFrameworkNodeId?: string;
  frameworkBoxes: EgdsMapBox[];
  entityBoxes: EgdsMapBox[];
  relationEndpointBoxes: EgdsMapBox[];
  branchTerritories: EgdsBranchTerritory[];
  structuralPaths: Array<EgdsMapPath & Readonly<{
    hierarchyLevel: 'root' | 'branch' | 'child';
  }>>;
  processPaths: EgdsMapPath[];
  relationPaths: Array<EgdsMapPath & Readonly<{
    relationId: string;
    relationType: 'supports' | 'complements';
  }>>;
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

export const egdsOverviewGrid = {
  childColumns: [360, 510, 660, 810],
  childWidth: 130,
  columnGap: 20,
} as const;

const childAnchor = (
  column: 0 | 1 | 2 | 3,
  y: number,
  height = 44,
): EgdsAnchor => [egdsOverviewGrid.childColumns[column], y, egdsOverviewGrid.childWidth, height];

const egdsAnchors: Readonly<Record<string, EgdsAnchor>> = {
  'egds-root': [20, 343, 130, 60],
  'experience-design': [180, 66, 160, 54],
  'from-plan-to-ship': [180, 210, 160, 54],
  'with-team': [180, 350, 160, 54],
  'product-profit': [180, 490, 160, 54],
  'beyond-games': [180, 626, 160, 54],
  'experience-journey': [360, 20, 180, 54],
  perception: childAnchor(0, 82, 44),
  rationalization: childAnchor(1, 82, 44),
  deconstruction: childAnchor(2, 82, 44),
  reconstruction: childAnchor(3, 82, 44),
  'narrative-lever': [960, 20, 200, 42],
  'aesthetics-lever': [960, 76, 200, 42],
  'gameplay-challenges-lever': [960, 132, 200, 42],
  'mindset-problem-solving-tools': [360, 195, 170, 44],
  'prototype-production-breakdown': [550, 195, 170, 44],
  'playtest-evidence-iteration': [360, 249, 170, 44],
  'tradeoff-specification-delivery': [550, 249, 170, 44],
  'vision-direction-decisions': [360, 335, 170, 44],
  'alignment-communication': [550, 335, 170, 44],
  'leadership-management': [360, 389, 170, 44],
  'feedback-collaboration': [550, 389, 170, 44],
  'audience-positioning-cluster': [360, 475, 170, 44],
  'market-opportunity': [550, 475, 170, 44],
  'value-exchange': [360, 529, 170, 44],
  'monetization-alignment': [550, 529, 170, 44],
  'values-culture': [360, 620, 170, 44],
  'innovation-possibility-space': [550, 620, 360, 44],
};

const egdsOverviewHeight = 720;
const structuralGap = 20;
const egdsFocusMetrics = {
  firstAncestryX: 360,
  ancestryWidth: 170,
  entityHeight: 58,
  columnGap: 20,
  rowGap: 12,
  top: 20,
  rightPadding: 20,
  bottomPadding: 20,
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

const frameworkPreorder = (nodes: readonly EgdsFrameworkNodeInput[]) => {
  const compareFrameworkOrder = (left: EgdsFrameworkNodeInput, right: EgdsFrameworkNodeInput) => (
    left.order - right.order || compareCodeUnits(left.id, right.id)
  );
  const childrenByParentId = new Map<string | undefined, EgdsFrameworkNodeInput[]>();
  for (const node of nodes) {
    const siblings = childrenByParentId.get(node.parentNodeId) ?? [];
    siblings.push(node);
    childrenByParentId.set(node.parentNodeId, siblings);
  }
  for (const siblings of childrenByParentId.values()) siblings.sort(compareFrameworkOrder);

  const ordered: EgdsFrameworkNodeInput[] = [];
  const visit = (node: EgdsFrameworkNodeInput) => {
    ordered.push(node);
    for (const child of childrenByParentId.get(node.id) ?? []) visit(child);
  };
  for (const root of childrenByParentId.get(undefined) ?? []) visit(root);
  if (ordered.length !== nodes.length) throw new Error('Framework hierarchy must be reachable from a root node');
  return ordered;
};

const egdsCenterX = (box: EgdsMapBox) => box.x + box.width / 2;
const egdsCenterY = (box: EgdsMapBox) => box.y + box.height / 2;

const boundsAround = (
  boxes: readonly EgdsMapBox[],
  horizontalPadding: number,
  verticalPadding: number,
  width: number,
  height: number,
) => {
  if (boxes.length === 0) throw new Error('Cannot derive territory bounds without boxes');
  const left = Math.max(0, Math.min(...boxes.map(({ x }) => x)) - horizontalPadding);
  const top = Math.max(0, Math.min(...boxes.map(({ y }) => y)) - verticalPadding);
  const right = Math.min(width, Math.max(...boxes.map(({ x, width }) => x + width)) + horizontalPadding);
  const bottom = Math.min(height, Math.max(...boxes.map(({ y, height }) => y + height)) + verticalPadding);
  return { x: left, y: top, width: right - left, height: bottom - top };
};

const deriveBranchTerritories = (
  frameworkNodes: readonly EgdsFrameworkNodeInput[],
  frameworkRelations: readonly EgdsFrameworkRelationInput[],
  frameworkBoxesById: ReadonlyMap<string, EgdsMapBox>,
  width: number,
  height: number,
): EgdsBranchTerritory[] => {
  const nodesById = new Map(frameworkNodes.map((node) => [node.id, node]));
  const owningBranchId = (node: EgdsFrameworkNodeInput) => {
    let current = node;
    while (current.parentNodeId) {
      const parent = nodesById.get(current.parentNodeId);
      if (!parent) return undefined;
      if (parent.kind === 'branch') return parent.id;
      current = parent;
    }
    return undefined;
  };
  const processNodeIds = new Set(frameworkRelations.filter(isProcessRelation).flatMap(({ fromId, toId }) => [fromId, toId]));
  const descendsFromProcessNode = (node: EgdsFrameworkNodeInput) => {
    let current: EgdsFrameworkNodeInput | undefined = node;
    while (current) {
      if (processNodeIds.has(current.id)) return true;
      current = current.parentNodeId ? nodesById.get(current.parentNodeId) : undefined;
    }
    return false;
  };

  return [...frameworkNodes]
    .filter(({ kind }) => kind === 'branch')
    .sort(compareId)
    .map((branch) => {
      const descendants = frameworkNodes.filter((node) => owningBranchId(node) === branch.id);
      const descendantBoxes = descendants
        .map(({ id }) => frameworkBoxesById.get(id))
        .filter((box): box is EgdsMapBox => Boolean(box));
      const processBoxes = descendants
        .filter(descendsFromProcessNode)
        .map(({ id }) => frameworkBoxesById.get(id))
        .filter((box): box is EgdsMapBox => Boolean(box));
      if (descendantBoxes.length === 0) return undefined;
      return {
        branchId: branch.id,
        ...boundsAround(descendantBoxes, 15, 8, width, height),
        ...(branch.id === 'experience-design' && processBoxes.length > 0
          ? {
            nestedTerritory: {
              id: 'experience-process' as const,
              ...boundsAround(processBoxes, 9, 9, width, height),
            },
          }
          : {}),
      };
    })
    .filter((territory): territory is EgdsBranchTerritory => Boolean(territory));
};

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
type OrthogonalPort = Readonly<{ side: EgdsPortSide; boundary: OrthogonalPoint; escape: OrthogonalPoint }>;
type OrthogonalSegment = Readonly<{ start: OrthogonalPoint; end: OrthogonalPoint }>;

const routeClearance = 8;

const boxPorts = (box: EgdsMapBox): OrthogonalPort[] => [
  {
    side: 'north',
    boundary: { x: egdsCenterX(box), y: box.y },
    escape: { x: egdsCenterX(box), y: box.y - routeClearance },
  },
  {
    side: 'east',
    boundary: { x: box.x + box.width, y: egdsCenterY(box) },
    escape: { x: box.x + box.width + routeClearance, y: egdsCenterY(box) },
  },
  {
    side: 'south',
    boundary: { x: egdsCenterX(box), y: box.y + box.height },
    escape: { x: egdsCenterX(box), y: box.y + box.height + routeClearance },
  },
  {
    side: 'west',
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
  let bestPorts: Readonly<{ fromPort: EgdsPortSide; toPort: EgdsPortSide }> | undefined;
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
        bestPorts = { fromPort: start.side, toPort: end.side };
        bestLength = length;
      }
    }
  }

  if (!bestRoute || !bestPorts) throw new Error('Cannot project an obstacle-free orthogonal path');
  return { ...bestPorts, path: routeToPath(bestRoute) };
};

const boundaryPoint = (box: EgdsMapBox, side: EgdsPortSide): OrthogonalPoint => {
  if (side === 'north') return { x: egdsCenterX(box), y: box.y };
  if (side === 'east') return { x: box.x + box.width, y: egdsCenterY(box) };
  if (side === 'south') return { x: egdsCenterX(box), y: box.y + box.height };
  return { x: box.x, y: egdsCenterY(box) };
};

const buildEgdsStructuralPath = (
  from: EgdsMapBox,
  to: EgdsMapBox,
  obstacles: readonly EgdsMapBox[],
  width: number,
  height: number,
): Pick<EgdsMapPath, 'fromPort' | 'toPort' | 'path'> => {
  const start = boundaryPoint(from, 'east');
  const end = boundaryPoint(to, 'west');
  if (end.x - start.x < structuralGap) {
    throw new Error(`Containment child must clear parent by ${structuralGap}px: ${from.id} -> ${to.id}`);
  }
  const startEscapeX = start.x + routeClearance;
  const endEscapeX = end.x - routeClearance;
  const localObstacles = obstacles.filter(({ key }) => key !== from.key && key !== to.key);
  const laneYs = [...new Set([
    start.y,
    end.y,
    routeClearance,
    height - routeClearance,
    ...localObstacles.flatMap((box) => [box.y - routeClearance, box.y + box.height + routeClearance]),
  ])]
    .filter((y) => y >= routeClearance && y <= height - routeClearance)
    .sort((left, right) => (
      Math.abs(left - end.y) - Math.abs(right - end.y) || left - right
    ));

  const candidates = [
    normalizeRoutePoints([start, { x: startEscapeX, y: start.y }, { x: startEscapeX, y: end.y }, end]),
    ...laneYs.map((laneY) => normalizeRoutePoints([
      start,
      { x: startEscapeX, y: start.y },
      { x: startEscapeX, y: laneY },
      { x: endEscapeX, y: laneY },
      { x: endEscapeX, y: end.y },
      end,
    ])),
  ];
  const route = candidates.find((points) => routeIsClear(points, localObstacles, width, height));
  if (!route) throw new Error(`Cannot project monotonic containment path: ${from.id} -> ${to.id}`);
  return { fromPort: 'east', toPort: 'west', path: routeToPath(route) };
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

  const focusChain: EgdsFrameworkNodeInput[] = [];
  let focusCursor = expandedFrameworkNodeId ? frameworkNodesById.get(expandedFrameworkNodeId) : undefined;
  while (focusCursor) {
    focusChain.unshift(focusCursor);
    focusCursor = focusCursor.parentNodeId ? frameworkNodesById.get(focusCursor.parentNodeId) : undefined;
  }
  const focusedBranchId = focusChain.find(({ kind }) => kind === 'branch')?.id;
  const frameworkBoxes = frameworkPreorder(frameworkNodes)
    .map((node) => egdsBox(
      node.id,
      node.kind,
      egdsAnchors[node.id]!,
    ));
  const frameworkBoxesById = new Map(frameworkBoxes.map((box) => [box.id, box]));
  const layoutWidth = 1180;

  const structuralPaths = [...frameworkNodes]
    .filter((node): node is EgdsFrameworkNodeInput & { parentNodeId: string } => (
      Boolean(node.parentNodeId) && frameworkBoxesById.has(node.parentNodeId!)
    ))
    .sort(compareId)
    .map((node) => {
      const from = frameworkBoxesById.get(node.parentNodeId);
      const to = frameworkBoxesById.get(node.id);
      if (!from || !to) throw new Error(`Cannot project structural path: ${node.parentNodeId} -> ${node.id}`);
      const projection = buildEgdsStructuralPath(from, to, frameworkBoxes, layoutWidth, egdsOverviewHeight);
      return {
        id: `structural:${from.key}->${to.key}`,
        fromKey: from.key,
        toKey: to.key,
        hierarchyLevel: from.kind === 'root' ? 'root' as const : from.kind === 'branch' ? 'branch' as const : 'child' as const,
        ...projection,
      };
    });
  const processPaths = frameworkRelations
    .filter(isProcessRelation)
    .filter(({ fromId, toId }) => frameworkBoxesById.has(fromId) && frameworkBoxesById.has(toId))
    .sort(compareId)
    .map((relation) => {
      const from = frameworkBoxesById.get(relation.fromId);
      const to = frameworkBoxesById.get(relation.toId);
      if (!from || !to) throw new Error(`Unknown framework node in process relation: ${relation.id}`);
      return {
        id: relation.id,
        fromKey: from.key,
        toKey: to.key,
        fromPort: 'east' as const,
        toPort: 'west' as const,
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
  const overviewTerritories = deriveBranchTerritories(
    frameworkNodes,
    frameworkRelations,
    frameworkBoxesById,
    layoutWidth,
    egdsOverviewHeight,
  );

  if (!expandedFrameworkNodeId) {
    return {
      mode: 'overview',
      width: layoutWidth,
      height: egdsOverviewHeight,
      frameworkBoxes,
      entityBoxes: [],
      relationEndpointBoxes: [],
      branchTerritories: overviewTerritories,
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
  const entityStartX = egdsFocusMetrics.rightPadding;
  const entityStartY = egdsOverviewHeight + 48;
  const entityAvailableWidth = layoutWidth - egdsFocusMetrics.rightPadding * 2;
  const entityColumns = 4;
  const entityWidth = (
    entityAvailableWidth - egdsFocusMetrics.columnGap * (entityColumns - 1)
  ) / entityColumns;
  const entityBoxes = expandedEntities.map((entity, index) => egdsBox(
    entity.id,
    entity.kind,
    [
      entityStartX + (index % entityColumns) * (entityWidth + egdsFocusMetrics.columnGap),
      entityStartY + Math.floor(index / entityColumns) * (egdsFocusMetrics.entityHeight + egdsFocusMetrics.rowGap),
      entityWidth,
      egdsFocusMetrics.entityHeight,
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
  const entityRows = Math.ceil(entityBoxes.length / entityColumns);
  const relationEndpointBoxes = externalNeighborIds.map((id, index) => egdsBox(
    id,
    'relation-endpoint',
    [
      entityStartX + (index % entityColumns) * (entityWidth + egdsFocusMetrics.columnGap),
      entityStartY + entityRows * (egdsFocusMetrics.entityHeight + egdsFocusMetrics.rowGap)
        + Math.floor(index / entityColumns) * (egdsFocusMetrics.entityHeight + egdsFocusMetrics.rowGap),
      entityWidth,
      egdsFocusMetrics.entityHeight,
    ],
  ));
  const relationEndpointBoxesByCapabilityId = new Map(relationEndpointBoxes.map((box) => [box.id, box]));
  const relationPathBox = (id: string) => entityBoxesByCapabilityId.get(id) ?? relationEndpointBoxesByCapabilityId.get(id);
  const relationEndpointRows = Math.ceil(relationEndpointBoxes.length / entityColumns);
  const focusContentHeight = entityStartY
    + (entityRows + relationEndpointRows) * (egdsFocusMetrics.entityHeight + egdsFocusMetrics.rowGap)
    + egdsFocusMetrics.bottomPadding;
  const layoutHeight = Math.max(egdsOverviewHeight, focusContentHeight);
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
      ...buildObstacleAvoidingPath({
        starts: boxPorts(from),
        ends: boxPorts(to),
        obstacles: expansionObstacles,
        width: layoutWidth,
        height: layoutHeight,
      }),
    };
  });
  return {
    mode: 'focus',
    focusedBranchId,
    width: layoutWidth,
    height: layoutHeight,
    expandedFrameworkNodeId,
    frameworkBoxes,
    entityBoxes,
    relationEndpointBoxes,
    branchTerritories: overviewTerritories,
    structuralPaths,
    processPaths,
    relationPaths,
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
