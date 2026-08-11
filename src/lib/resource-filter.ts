import type { Catalog } from './catalog/validate';

type Resource = Catalog['resources'][number];

export type ResourceFilters = {
  resourceTopic?: string;
  knowledgeTopic?: string;
  capabilityId?: string;
  language?: string;
  mediaType?: Resource['mediaType'];
  accessModel?: Resource['accessVersions'][number]['accessModel'];
  sourceId?: string;
};

export function filterResources(
  resources: readonly Resource[],
  filters: ResourceFilters,
): Resource[] {
  return resources.filter((resource) => {
    if (filters.resourceTopic && !resource.resourceTopicIds.includes(filters.resourceTopic)) {
      return false;
    }

    if (filters.knowledgeTopic && !resource.knowledgeTopicIds.includes(filters.knowledgeTopic)) {
      return false;
    }

    if (filters.capabilityId && !resource.capabilityIds.includes(filters.capabilityId)) {
      return false;
    }

    if (
      filters.language &&
      resource.originalLanguage !== filters.language &&
      !resource.accessVersions.some(({ language }) => language === filters.language)
    ) {
      return false;
    }

    if (filters.mediaType && resource.mediaType !== filters.mediaType) {
      return false;
    }

    if (
      filters.accessModel &&
      !resource.accessVersions.some(({ accessModel }) => accessModel === filters.accessModel)
    ) {
      return false;
    }

    if (filters.sourceId && resource.sourceId !== filters.sourceId) {
      return false;
    }

    return true;
  });
}

export function countResourcesByTopic(
  resources: readonly Resource[],
  topicIds: readonly string[],
): Map<string, number> {
  const counts = new Map(topicIds.map((topicId) => [topicId, 0]));

  for (const resource of resources) {
    const topicId = resource.resourceTopicIds[0];
    if (topicId && counts.has(topicId)) {
      counts.set(topicId, (counts.get(topicId) ?? 0) + 1);
    }
  }

  return counts;
}
