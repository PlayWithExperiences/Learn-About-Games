import type { Catalog } from './catalog/validate';

const eventRoles = new Set(['definition', 'mechanism', 'transformation', 'diffusion']);
const startRoles = new Set(['definition', 'mechanism']);
const endRoles = new Set(['transformation', 'diffusion']);

type AtlasNode = Catalog['atlasNodes'][number];
type AtlasRelation = Catalog['atlasRelations'][number];

export type AtlasRouteAudit = {
  themeId: string;
  eventIds: string[];
  chain: string[];
  evolutionRelationIds: string[];
  carrierRelationIds: string[];
  carrierCoverage: { covered: number; total: number };
  missingCarrierEventIds: string[];
  missingEvidenceIds: string[];
  complete: boolean;
};

function isInnovationEvent(node: AtlasNode | undefined): boolean {
  return node?.kind === 'innovation' && node.tags.includes('innovation-event');
}

function hasCompleteEvidence(ids: readonly string[], evidenceIds: ReadonlySet<string>): boolean {
  return ids.length > 0 && ids.every((id) => evidenceIds.has(id));
}

function addMissingEvidence(
  ids: readonly string[],
  evidenceIds: ReadonlySet<string>,
  missingEvidenceIds: Set<string>,
): boolean {
  let complete = ids.length > 0;
  for (const id of ids) {
    if (!evidenceIds.has(id)) {
      missingEvidenceIds.add(id);
      complete = false;
    }
  }
  return complete;
}

function compareNodeIds(
  left: string,
  right: string,
  nodesById: ReadonlyMap<string, AtlasNode>,
): number {
  const leftNode = nodesById.get(left);
  const rightNode = nodesById.get(right);
  return (leftNode?.startYear ?? Number.MAX_SAFE_INTEGER) -
    (rightNode?.startYear ?? Number.MAX_SAFE_INTEGER) || left.localeCompare(right);
}

function compareChains(
  left: string[],
  right: string[],
  nodesById: ReadonlyMap<string, AtlasNode>,
): number {
  if (left.length !== right.length) return right.length - left.length;
  for (let index = 0; index < left.length; index += 1) {
    const comparison = compareNodeIds(left[index], right[index], nodesById);
    if (comparison !== 0) return comparison;
  }
  return 0;
}

function chainHasValidEndpoints(
  chain: string[],
  nodesById: ReadonlyMap<string, AtlasNode>,
): boolean {
  if (chain.length < 3) return false;
  const first = nodesById.get(chain[0]);
  const last = nodesById.get(chain[chain.length - 1]);
  return Boolean(
    first?.eventRole && startRoles.has(first.eventRole) &&
    last?.eventRole && endRoles.has(last.eventRole),
  );
}

function chooseChain(
  chains: string[][],
  nodesById: ReadonlyMap<string, AtlasNode>,
): string[] {
  return [...chains]
    .sort((left, right) => {
      const leftValid = chainHasValidEndpoints(left, nodesById);
      const rightValid = chainHasValidEndpoints(right, nodesById);
      if (leftValid !== rightValid) return leftValid ? -1 : 1;
      return compareChains(left, right, nodesById);
    })[0] ?? [];
}

function enumerateChains(
  eventIds: readonly string[],
  outgoing: ReadonlyMap<string, readonly AtlasRelation[]>,
): string[][] {
  const chains: string[][] = [];

  const visit = (chain: string[]) => {
    chains.push(chain);
    const currentId = chain[chain.length - 1];
    for (const relation of outgoing.get(currentId) ?? []) {
      if (!chain.includes(relation.toId)) {
        visit([...chain, relation.toId]);
      }
    }
  };

  for (const eventId of eventIds) visit([eventId]);
  return chains;
}

function findEvolutionRelation(
  fromId: string,
  toId: string,
  outgoing: ReadonlyMap<string, readonly AtlasRelation[]>,
): AtlasRelation | undefined {
  return outgoing.get(fromId)?.find(({ toId: relationToId }) => relationToId === toId);
}

export function auditAtlasRoutes(
  nodes: Catalog['atlasNodes'],
  relations: Catalog['atlasRelations'],
  evidenceIds: Iterable<string>,
  themeIds: string[],
): AtlasRouteAudit[] {
  const evidenceIdSet = new Set(evidenceIds);
  const nodesById = new Map(nodes.map((node) => [node.id, node]));
  const eventNodes = nodes.filter(isInnovationEvent);
  const eventNodeIds = new Set(eventNodes.map(({ id }) => id));
  const sortedRelations = [...relations].sort((left, right) => left.id.localeCompare(right.id));
  const evolutionRelations = sortedRelations.filter(({ fromId, toId, relationRole, directionality }) =>
    relationRole === 'evolution' && directionality === 'directed' &&
    eventNodeIds.has(fromId) && eventNodeIds.has(toId),
  );

  return [...new Set(themeIds)].map((themeId) => {
    const routeEvents = eventNodes
      .filter((node) => node.themeIds?.includes(themeId))
      .sort((left, right) => compareNodeIds(left.id, right.id, nodesById));
    const routeEventIds = routeEvents.map(({ id }) => id);
    const routeEventIdSet = new Set(routeEventIds);
    const routeEvolutionOutgoing = new Map<string, AtlasRelation[]>();
    for (const relation of evolutionRelations) {
      if (routeEventIdSet.has(relation.fromId) && routeEventIdSet.has(relation.toId)) {
        const bucket = routeEvolutionOutgoing.get(relation.fromId) ?? [];
        bucket.push(relation);
        routeEvolutionOutgoing.set(relation.fromId, bucket);
      }
    }
    const chain = chooseChain(enumerateChains(routeEventIds, routeEvolutionOutgoing), nodesById);
    const chainNodeSet = new Set(chain);
    const evolutionRelationIds = chain.slice(0, -1)
      .map((fromId, index) => findEvolutionRelation(fromId, chain[index + 1], routeEvolutionOutgoing)?.id)
      .filter((id): id is string => Boolean(id));
    const chainOrder = new Map(chain.map((id, index) => [id, index]));
    const carrierRelations = sortedRelations
      .filter(({ fromId, toId, relationRole }) => {
        const target = nodesById.get(toId);
        return relationRole === 'carrier' && chainNodeSet.has(fromId) &&
          Boolean(target) && !isInnovationEvent(target);
      })
      .sort((left, right) =>
        (chainOrder.get(left.fromId) ?? Number.MAX_SAFE_INTEGER) -
          (chainOrder.get(right.fromId) ?? Number.MAX_SAFE_INTEGER) ||
        left.id.localeCompare(right.id),
      );
    const carrierEventIds = new Set(carrierRelations.map(({ fromId }) => fromId));
    const missingCarrierEventIds = chain.filter((id) => !carrierEventIds.has(id));
    const missingEvidenceIds = new Set<string>();
    let evidenceComplete = true;
    for (const eventId of chain) {
      evidenceComplete = addMissingEvidence(
        nodesById.get(eventId)?.evidenceIds ?? [],
        evidenceIdSet,
        missingEvidenceIds,
      ) && evidenceComplete;
    }
    for (const relationId of evolutionRelationIds) {
      const relation = sortedRelations.find(({ id }) => id === relationId);
      evidenceComplete = addMissingEvidence(
        relation?.evidenceIds ?? [],
        evidenceIdSet,
        missingEvidenceIds,
      ) && evidenceComplete;
    }
    for (const relation of carrierRelations) {
      evidenceComplete = addMissingEvidence(
        relation.evidenceIds,
        evidenceIdSet,
        missingEvidenceIds,
      ) && evidenceComplete;
    }
    const eventMetadataComplete = chain.every((eventId) => {
      const event = nodesById.get(eventId);
      return Boolean(
        event?.eventRole && eventRoles.has(event.eventRole) &&
        event.themeIds?.includes(themeId) &&
        event.mechanism?.['zh-CN']?.trim() &&
        hasCompleteEvidence(event.evidenceIds, evidenceIdSet),
      );
    });
    const complete = chain.length >= 3 &&
      chainHasValidEndpoints(chain, nodesById) &&
      evolutionRelationIds.length === Math.max(0, chain.length - 1) &&
      missingCarrierEventIds.length === 0 &&
      eventMetadataComplete && evidenceComplete;

    return {
      themeId,
      eventIds: routeEventIds,
      chain,
      evolutionRelationIds,
      carrierRelationIds: carrierRelations.map(({ id }) => id),
      carrierCoverage: {
        covered: carrierEventIds.size,
        total: chain.length,
      },
      missingCarrierEventIds,
      missingEvidenceIds: [...missingEvidenceIds].sort(),
      complete,
    };
  });
}
