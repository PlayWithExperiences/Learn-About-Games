type TaggedAtlasEntity = {
  id: string;
  tags: readonly string[];
};

type AtlasThemeLens = {
  tags: readonly string[];
};

type AtlasNodeKind = 'game' | 'innovation' | 'category' | 'experimental-apparatus' | 'experimental-program' | 'system-prototype' | 'commercial-hardware';

type AtlasNodeForLayout = {
  id: string;
  kind: AtlasNodeKind;
  startYear: number;
  endYear?: number;
  lane: number;
};

type AtlasRelationForLayout = {
  id: string;
  fromId: string;
  toId: string;
  directionality: 'directed' | 'undirected';
};

export type AtlasPlacedNode = AtlasNodeForLayout & {
  yearX: number;
  spanEndX: number;
  left: number;
  top: number;
  width: number;
  height: number;
  centerX: number;
  centerY: number;
  displayLane: number;
};

type AtlasNodeBox = Pick<AtlasPlacedNode, 'left' | 'top' | 'width' | 'height'>;

export function pointOnAtlasNodeBoundary(
  point: { x: number; y: number },
  node: AtlasNodeBox,
  tolerance = 0.001,
): boolean {
  const within = (value: number, start: number, end: number) =>
    value >= start - tolerance && value <= end + tolerance;
  const onVerticalSide = (
    Math.abs(point.x - node.left) < tolerance ||
    Math.abs(point.x - (node.left + node.width)) < tolerance
  ) && within(point.y, node.top, node.top + node.height);
  const onHorizontalSide = (
    Math.abs(point.y - node.top) < tolerance ||
    Math.abs(point.y - (node.top + node.height)) < tolerance
  ) && within(point.x, node.left, node.left + node.width);
  return onVerticalSide || onHorizontalSide;
}

export type AtlasPlacedRelation = AtlasRelationForLayout & {
  start: { x: number; y: number };
  end: { x: number; y: number };
  path: string;
};

export type AtlasLayout = {
  width: number;
  height: number;
  minYear: number;
  maxYear: number;
  yearTicks: Array<{ year: number; x: number }>;
  nodes: AtlasPlacedNode[];
  relations: AtlasPlacedRelation[];
};

export type AtlasRelationAdjacency<Relation extends AtlasRelationForLayout> = {
  incoming: Relation[];
  outgoing: Relation[];
  undirected: Relation[];
};

export type AtlasThemeMatch = {
  nodeIds: string[];
  relationIds: string[];
};

export function matchAtlasTheme(
  nodes: readonly TaggedAtlasEntity[],
  relations: readonly TaggedAtlasEntity[],
  theme: AtlasThemeLens,
): AtlasThemeMatch {
  const themeTags = new Set(theme.tags);
  const matchesTheme = ({ tags }: TaggedAtlasEntity) => tags.some((tag) => themeTags.has(tag));

  return {
    nodeIds: nodes.filter(matchesTheme).map(({ id }) => id),
    relationIds: relations.filter(matchesTheme).map(({ id }) => id),
  };
}

export type AtlasEventTimelineNode = {
  id: string;
  kind: AtlasNodeKind;
  name: AtlasLocalizedText;
  summary: AtlasLocalizedText;
  startYear: number;
  tags: readonly string[];
  evidenceIds: readonly string[];
  eventRole?: 'definition' | 'mechanism' | 'transformation' | 'diffusion';
  themeIds?: readonly string[];
  mechanism?: AtlasLocalizedText;
};

export type AtlasEventTimelineRelation = {
  id: string;
  fromId: string;
  toId: string;
  relationRole?: 'evolution' | 'carrier';
  tags?: readonly string[];
};

export type AtlasEventTimeline = {
  events: AtlasEventTimelineNode[];
  evolutionRelations: AtlasEventTimelineRelation[];
  carriersByEvent: Record<string, AtlasEventTimelineNode[]>;
  emptyState: boolean;
};

export function buildAtlasEventTimeline(
  nodes: readonly AtlasEventTimelineNode[],
  relations: readonly AtlasEventTimelineRelation[],
  themeTags: readonly string[] = [],
): AtlasEventTimeline {
  const requestedTags = new Set(themeTags);
  const allEvents = nodes.filter(
    (node) => node.kind === 'innovation' && node.tags.includes('innovation-event'),
  );
  const events = allEvents
    .filter((node) =>
      requestedTags.size === 0 ||
      node.themeIds?.some((themeId) => requestedTags.has(themeId)) ||
      node.tags.some((tag) => requestedTags.has(tag)),
    )
    .sort((left, right) => left.startYear - right.startYear || left.id.localeCompare(right.id));
  const eventIds = new Set(events.map(({ id }) => id));
  const nodeById = new Map(nodes.map((node) => [node.id, node]));
  const evolutionRelations = relations
    .filter(({ relationRole, fromId, toId }) =>
      relationRole === 'evolution' && eventIds.has(fromId) && eventIds.has(toId),
    )
    .slice()
    .sort((left, right) => left.id.localeCompare(right.id));
  const carriersByEvent: Record<string, AtlasEventTimelineNode[]> = {};

  for (const event of events) {
    carriersByEvent[event.id] = relations
      .filter(({ relationRole, fromId }) => relationRole === 'carrier' && fromId === event.id)
      .map(({ toId }) => nodeById.get(toId))
      .filter((node): node is AtlasEventTimelineNode => node?.kind === 'game')
      .sort((left, right) => left.startYear - right.startYear || left.id.localeCompare(right.id));
  }

  return {
    events,
    evolutionRelations,
    carriersByEvent,
    emptyState: events.length === 0,
  };
}

export const atlasScaleBounds = { min: 0.5, max: 2, step: 0.25 } as const;

export function clampAtlasScale(value: number): number {
  return Math.min(atlasScaleBounds.max, Math.max(atlasScaleBounds.min, value));
}

export function stepAtlasScale(current: number, direction: -1 | 1): number {
  return clampAtlasScale(current + atlasScaleBounds.step * direction);
}

export function scaleAtlasWheelTarget(input: { currentScale: number; deltaY: number }): number {
  if (input.deltaY === 0) return clampAtlasScale(input.currentScale);
  return clampAtlasScale(input.currentScale * Math.exp(-input.deltaY * 0.001));
}

export function projectAtlasPointerAnchor(input: {
  oldScale: number;
  newScale: number;
  scrollLeft: number;
  scrollTop: number;
  pointerX: number;
  pointerY: number;
}) {
  const logicalX = (input.scrollLeft + input.pointerX) / input.oldScale;
  const logicalY = (input.scrollTop + input.pointerY) / input.oldScale;
  return {
    scrollLeft: Math.max(0, logicalX * input.newScale - input.pointerX),
    scrollTop: Math.max(0, logicalY * input.newScale - input.pointerY),
  };
}

export function fitAtlasScale(input: {
  viewportWidth: number;
  viewportHeight: number;
  sceneWidth: number;
  sceneHeight: number;
}): number {
  return Math.min(atlasScaleBounds.max, Math.max(0.1, Math.min(
    input.viewportWidth / input.sceneWidth,
    input.viewportHeight / input.sceneHeight,
  )));
}

export function projectAtlasScrollAnchor(input: {
  oldScale: number;
  newScale: number;
  scrollLeft: number;
  scrollTop: number;
  viewportWidth: number;
  viewportHeight: number;
}) {
  const centerX = (input.scrollLeft + input.viewportWidth / 2) / input.oldScale;
  const centerY = (input.scrollTop + input.viewportHeight / 2) / input.oldScale;
  return {
    scrollLeft: Math.max(0, centerX * input.newScale - input.viewportWidth / 2),
    scrollTop: Math.max(0, centerY * input.newScale - input.viewportHeight / 2),
  };
}

type AtlasLocalizedText = {
  'zh-CN': string;
  en?: string;
};

type AtlasNodeForIndex = {
  id: string;
  startYear: number;
  name: AtlasLocalizedText;
  summary: AtlasLocalizedText;
  tags: readonly string[];
};

type AtlasTagForIndex = {
  id: string;
  name: AtlasLocalizedText;
};

export type AtlasIndexNode = {
  id: string;
  startYear: number;
  name: string;
  searchText: string;
};

function normalizeAtlasSearchText(parts: Array<string | undefined>): string {
  return parts
    .filter((part): part is string => typeof part === 'string')
    .join(' ')
    .normalize('NFKC')
    .toLocaleLowerCase()
    .trim();
}

export function buildAtlasNodeIndex(
  nodes: readonly AtlasNodeForIndex[],
  tags: readonly AtlasTagForIndex[],
): AtlasIndexNode[] {
  const tagById = new Map(tags.map((tag) => [tag.id, tag]));

  return nodes.map((node) => ({
    id: node.id,
    startYear: node.startYear,
    name: node.name['zh-CN'],
    searchText: normalizeAtlasSearchText([
      node.name['zh-CN'],
      node.name.en,
      node.summary['zh-CN'],
      node.summary.en,
      ...node.tags.flatMap((tagId) => {
        const tag = tagById.get(tagId);
        return [tagId, tag?.name['zh-CN'], tag?.name.en];
      }),
    ]),
  }));
}

export function filterAtlasNodeIndex(
  nodes: readonly AtlasIndexNode[],
  query: string,
): AtlasIndexNode[] {
  const normalizedQuery = normalizeAtlasSearchText([query]);
  return nodes.filter(({ searchText }) => searchText.includes(normalizedQuery));
}

const atlasNameCollator = new Intl.Collator(['zh-CN', 'en'], {
  numeric: true,
  sensitivity: 'base',
});

export function sortAtlasNodeIndex(
  nodes: readonly AtlasIndexNode[],
  order: 'time' | 'name',
): AtlasIndexNode[] {
  return [...nodes].sort((left, right) => {
    if (order === 'time') {
      return left.startYear - right.startYear
        || atlasNameCollator.compare(left.name, right.name)
        || left.id.localeCompare(right.id);
    }

    return atlasNameCollator.compare(left.name, right.name)
      || left.startYear - right.startYear
      || left.id.localeCompare(right.id);
  });
}

const atlasLayoutDefaults = {
  width: 2200,
  height: 900,
  minYear: 1958,
  maxYear: 2020,
  horizontalInset: 100,
  firstLaneY: 100,
  laneGap: 104,
} as const;

function projectAtlasYear(year: number): number {
  const { width, minYear, maxYear, horizontalInset } = atlasLayoutDefaults;
  const usableWidth = width - horizontalInset * 2;
  return horizontalInset + ((year - minYear) / (maxYear - minYear)) * usableWidth;
}

function relationPath(
  start: AtlasPlacedRelation['start'],
  end: AtlasPlacedRelation['end'],
): string {
  const horizontalDistance = end.x - start.x;
  const firstControlX = start.x + horizontalDistance * 0.36;
  const secondControlX = end.x - horizontalDistance * 0.36;
  return `M ${start.x} ${start.y} C ${firstControlX} ${start.y}, ${secondControlX} ${end.y}, ${end.x} ${end.y}`;
}

function nodeBoundaryAnchor(
  node: AtlasPlacedNode,
  toward: Pick<AtlasPlacedNode, 'centerX' | 'centerY'>,
): AtlasPlacedRelation['start'] {
  const deltaX = toward.centerX - node.centerX;
  const deltaY = toward.centerY - node.centerY;
  const normalizedDistance = Math.max(
    Math.abs(deltaX) / (node.width / 2),
    Math.abs(deltaY) / (node.height / 2),
  );
  if (normalizedDistance === 0) {
    throw new Error(`Atlas node ${node.id} cannot project a boundary anchor to itself.`);
  }
  return {
    x: node.centerX + deltaX / normalizedDistance,
    y: node.centerY + deltaY / normalizedDistance,
  };
}

export function buildAtlasLayout(
  nodes: readonly AtlasNodeForLayout[],
  relations: readonly AtlasRelationForLayout[],
): AtlasLayout {
  const categoryLaneById = new Map(
    nodes
      .filter(({ kind }) => kind === 'category')
      .sort((left, right) => left.startYear - right.startYear || left.id.localeCompare(right.id))
      .map(({ id }, index) => [id, index + 1]),
  );

  const placedNodes = nodes.map((node): AtlasPlacedNode => {
    if (node.kind === 'game' && node.endYear !== undefined) {
      throw new Error(`Atlas Game ${node.id} cannot define a time range.`);
    }
    const yearX = projectAtlasYear(node.startYear);
    const rangeEndYear = node.kind === 'game' ? undefined : node.endYear;
    const hasRange = rangeEndYear !== undefined;
    const spanEndX = hasRange
      ? projectAtlasYear(rangeEndYear)
      : yearX;
    const displayLane = node.kind === 'innovation'
      ? node.lane
      : node.kind === 'category'
        ? (categoryLaneById.get(node.id) ?? 1)
        : Math.max(3, node.lane + 1);
    const width = hasRange
      ? Math.max(200, spanEndX - yearX)
      : node.kind === 'innovation'
        ? 180
        : 96;
    const height = node.kind === 'category' ? 46 : node.kind === 'innovation' ? 84 : 86;
    const centerY = atlasLayoutDefaults.firstLaneY + displayLane * atlasLayoutDefaults.laneGap;
    const left = hasRange ? yearX : yearX - width / 2;
    const top = centerY - height / 2;

    return {
      ...node,
      yearX,
      spanEndX,
      left,
      top,
      width,
      height,
      centerX: left + width / 2,
      centerY,
      displayLane,
    };
  });

  const nodeById = new Map(placedNodes.map((node) => [node.id, node]));
  const placedRelations = relations
    .map((relation): AtlasPlacedRelation => {
      const from = nodeById.get(relation.fromId);
      const to = nodeById.get(relation.toId);
      if (!from || !to) {
        throw new Error(`Atlas layout relation ${relation.id} has a missing endpoint.`);
      }
      const start = nodeBoundaryAnchor(from, to);
      const end = nodeBoundaryAnchor(to, from);
      return { ...relation, start, end, path: relationPath(start, end) };
    })
    .sort((left, right) => {
      const leftMinX = Math.min(left.start.x, left.end.x);
      const rightMinX = Math.min(right.start.x, right.end.x);
      const leftMaxX = Math.max(left.start.x, left.end.x);
      const rightMaxX = Math.max(right.start.x, right.end.x);
      const leftMinY = Math.min(left.start.y, left.end.y);
      const rightMinY = Math.min(right.start.y, right.end.y);
      const leftMaxY = Math.max(left.start.y, left.end.y);
      const rightMaxY = Math.max(right.start.y, right.end.y);
      return leftMinX - rightMinX
        || leftMaxX - rightMaxX
        || leftMinY - rightMinY
        || leftMaxY - rightMaxY
        || left.id.localeCompare(right.id);
    });

  return {
    width: atlasLayoutDefaults.width,
    height: atlasLayoutDefaults.height,
    minYear: atlasLayoutDefaults.minYear,
    maxYear: atlasLayoutDefaults.maxYear,
    yearTicks: [1958, 1960, 1970, 1980, 1990, 2000, 2010, 2020].map((year) => ({
      year,
      x: projectAtlasYear(year),
    })),
    nodes: placedNodes,
    relations: placedRelations,
  };
}

export function groupAtlasNodesByEra<Node extends AtlasNodeForLayout>(nodes: readonly Node[]) {
  const groups = new Map<number, Node[]>();
  for (const node of nodes) {
    const startYear = Math.floor(node.startYear / 10) * 10;
    const group = groups.get(startYear) ?? [];
    group.push(node);
    groups.set(startYear, group);
  }

  return [...groups.entries()]
    .sort(([left], [right]) => left - right)
    .map(([startYear, groupNodes]) => ({
      startYear,
      endYear: startYear + 9,
      label: `${startYear}-${startYear + 9}`,
      nodes: [...groupNodes].sort(
        (left, right) => left.startYear - right.startYear || left.lane - right.lane || left.id.localeCompare(right.id),
      ),
    }));
}

export function indexAtlasRelations<
  Node extends { id: string; startYear?: number; lane?: number },
  Relation extends AtlasRelationForLayout,
>(nodes: readonly Node[], relations: readonly Relation[]) {
  const adjacency = new Map<string, AtlasRelationAdjacency<Relation>>(
    nodes.map(({ id }) => [id, { incoming: [], outgoing: [], undirected: [] }]),
  );

  for (const relation of relations) {
    const from = adjacency.get(relation.fromId);
    const to = adjacency.get(relation.toId);
    if (!from || !to) continue;
    if (relation.directionality === 'undirected') {
      from.undirected.push(relation);
      to.undirected.push(relation);
    } else {
      from.outgoing.push(relation);
      to.incoming.push(relation);
    }
  }

  const nodeById = new Map(nodes.map((node) => [node.id, node]));
  const sortForNode = (nodeId: string) => (left: Relation, right: Relation) => {
    const leftOtherId = left.fromId === nodeId ? left.toId : left.fromId;
    const rightOtherId = right.fromId === nodeId ? right.toId : right.fromId;
    const leftOther = nodeById.get(leftOtherId);
    const rightOther = nodeById.get(rightOtherId);
    return (leftOther?.startYear ?? 0) - (rightOther?.startYear ?? 0)
      || (leftOther?.lane ?? 0) - (rightOther?.lane ?? 0)
      || leftOtherId.localeCompare(rightOtherId)
      || left.id.localeCompare(right.id);
  };
  adjacency.forEach((relationGroups, nodeId) => {
    relationGroups.incoming.sort(sortForNode(nodeId));
    relationGroups.outgoing.sort(sortForNode(nodeId));
    relationGroups.undirected.sort(sortForNode(nodeId));
  });

  return adjacency;
}
