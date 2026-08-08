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
