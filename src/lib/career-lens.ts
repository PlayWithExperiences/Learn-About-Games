import type { Catalog } from './catalog/validate';

export const careerLensPriorities = ['core', 'important', 'suggested'] as const;

type CareerLensPriority = (typeof careerLensPriorities)[number];
type CareerLensResponsibility = 'execute' | 'contribute' | 'decide' | 'direct';
type Capability = Pick<Catalog['capabilities'][number], 'id' | 'frameworkNodeId'>;
type RoleProfile = Pick<
  Catalog['roleProfiles'][number],
  'id' | 'title' | 'roleId' | 'productionContextId' | 'basisLinks' | 'reviewedAt' | 'capabilities'
>;

type MappedCareerLensNode = {
  capabilityId: string;
  priority: CareerLensPriority;
  responsibility: CareerLensResponsibility;
};

type UnlistedCareerLensNode = {
  capabilityId: string;
  priority: 'unlisted';
};

export type CareerLensProjection = {
  frameworkCounts: Record<
    string,
    { core: number; important: number; suggested: number }
  >;
  nodes: Array<MappedCareerLensNode | UnlistedCareerLensNode>;
  groups: Record<CareerLensPriority, MappedCareerLensNode[]>;
  profile: Pick<RoleProfile, 'id' | 'title' | 'roleId' | 'productionContextId' | 'basisLinks' | 'reviewedAt'>;
};

const compareRawIds = (left: string, right: string) => left < right ? -1 : left > right ? 1 : 0;

export function projectCareerLens(
  capabilities: ReadonlyArray<Capability>,
  profile: RoleProfile,
): CareerLensProjection {
  const capabilityById = new Map(capabilities.map((capability) => [capability.id, capability]));
  const seenCapabilityIds = new Set<string>();
  for (const mapping of profile.capabilities) {
    if (seenCapabilityIds.has(mapping.capabilityId)) {
      throw new Error(
        `Career profile "${profile.id}" has duplicate capability mapping "${mapping.capabilityId}".`,
      );
    }
    if (!capabilityById.has(mapping.capabilityId)) {
      throw new Error(
        `Career profile "${profile.id}" references unknown capability "${mapping.capabilityId}".`,
      );
    }
    seenCapabilityIds.add(mapping.capabilityId);
  }

  const sortedCapabilities = [...capabilities].sort((left, right) => compareRawIds(left.id, right.id));
  const sortedMappings = [...profile.capabilities].sort(
    (left, right) => compareRawIds(left.capabilityId, right.capabilityId),
  );
  const groups: CareerLensProjection['groups'] = {
    core: [],
    important: [],
    suggested: [],
  };
  const mappedCapabilities = new Map(
    sortedMappings.map((capability) => [capability.capabilityId, capability]),
  );
  const countsByFramework = new Map<
    string,
    { core: number; important: number; suggested: number }
  >();

  for (const capability of sortedMappings) {
    groups[capability.priority].push({
      capabilityId: capability.capabilityId,
      priority: capability.priority,
      responsibility: capability.responsibility,
    });
    const frameworkNodeId = capabilityById.get(capability.capabilityId)!.frameworkNodeId;
    const counts = countsByFramework.get(frameworkNodeId) ?? {
      core: 0,
      important: 0,
      suggested: 0,
    };
    counts[capability.priority] += 1;
    countsByFramework.set(frameworkNodeId, counts);
  }
  const frameworkCounts = Object.fromEntries(
    [...countsByFramework].sort(([left], [right]) => compareRawIds(left, right)),
  );

  return {
    frameworkCounts,
    nodes: sortedCapabilities.map(({ id }) => {
      const mappedCapability = mappedCapabilities.get(id);
      if (!mappedCapability) {
        return { capabilityId: id, priority: 'unlisted' };
      }

      return {
        capabilityId: id,
        priority: mappedCapability.priority,
        responsibility: mappedCapability.responsibility,
      };
    }),
    groups,
    profile: {
      id: profile.id,
      title: profile.title,
      roleId: profile.roleId,
      productionContextId: profile.productionContextId,
      basisLinks: profile.basisLinks,
      reviewedAt: profile.reviewedAt,
    },
  };
}
