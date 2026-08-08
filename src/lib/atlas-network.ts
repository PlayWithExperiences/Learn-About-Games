type TaggedAtlasEntity = {
  id: string;
  tags: readonly string[];
};

type AtlasThemeLens = {
  tags: readonly string[];
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
