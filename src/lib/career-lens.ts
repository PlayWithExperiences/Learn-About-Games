import type { Catalog } from './catalog/validate';

export const careerLensPriorities = ['core', 'important', 'suggested'] as const;

type CareerLensPriority = (typeof careerLensPriorities)[number];
type CareerLensResponsibility = 'execute' | 'contribute' | 'decide' | 'direct';
type Capability = Pick<Catalog['capabilities'][number], 'id'>;
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
  nodes: Array<MappedCareerLensNode | UnlistedCareerLensNode>;
  groups: Record<CareerLensPriority, MappedCareerLensNode[]>;
  profile: Pick<RoleProfile, 'id' | 'title' | 'roleId' | 'productionContextId' | 'basisLinks' | 'reviewedAt'>;
};

export function projectCareerLens(
  capabilities: ReadonlyArray<Capability>,
  profile: RoleProfile,
): CareerLensProjection {
  const groups: CareerLensProjection['groups'] = {
    core: [],
    important: [],
    suggested: [],
  };
  const mappedCapabilities = new Map(
    profile.capabilities.map((capability) => [capability.capabilityId, capability]),
  );

  for (const capability of profile.capabilities) {
    groups[capability.priority].push({
      capabilityId: capability.capabilityId,
      priority: capability.priority,
      responsibility: capability.responsibility,
    });
  }

  return {
    nodes: capabilities.map(({ id }) => {
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
