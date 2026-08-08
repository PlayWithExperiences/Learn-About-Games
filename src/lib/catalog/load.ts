import { getCollection } from 'astro:content';

import { validateCatalog, type Catalog } from './validate';

type ProductCollection = keyof Catalog;

const productCollections: ProductCollection[] = [
  'domains',
  'capabilities',
  'knowledgeTopics',
  'capabilityRelations',
  'resourceTopics',
  'sources',
  'resources',
  'learningTrails',
  'roleProfiles',
  'atlasCategories',
  'atlasNodes',
  'atlasEvidence',
  'atlasRelations',
  'atlasThemes',
];

export async function loadCatalog(): Promise<Catalog> {
  const catalog = Object.fromEntries(
    await Promise.all(
      productCollections.map(async (collection) => {
        const entries = await getCollection(collection);
        return [
          collection,
          entries.map((entry) => ({ id: entry.id, ...entry.data })),
        ];
      }),
    ),
  ) as Catalog;

  const errors = validateCatalog(catalog);
  if (errors.length > 0) {
    throw new Error(`Catalog reference validation failed:\n${JSON.stringify(errors, null, 2)}`);
  }

  return catalog;
}
