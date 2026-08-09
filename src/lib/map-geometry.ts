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
