import { defineCollection } from 'astro:content';
import { file, glob } from 'astro/loaders';
import { z } from 'astro/zod';

const localizedText = z
  .object({
    'zh-CN': z.string().trim().min(1),
    en: z.string().trim().min(1).optional(),
  })
  .strict();

const domains = defineCollection({
  loader: file('src/data/domains.json'),
  schema: z.object({
    name: localizedText,
    summary: localizedText,
    order: z.number().int(),
  }),
});

const capabilities = defineCollection({
  loader: file('src/data/capabilities.json'),
  schema: z.object({
    name: localizedText,
    summary: localizedText,
    domainId: z.string().trim().min(1),
  }),
});

const sources = defineCollection({
  loader: file('src/data/sources.json'),
  schema: z.object({
    name: localizedText,
    homepage: z.url(),
  }),
});

const resources = defineCollection({
  loader: file('src/data/resources.json'),
  schema: z.object({
    title: localizedText,
    summary: localizedText,
    sourceId: z.string().trim().min(1),
    capabilityIds: z.array(z.string().trim().min(1)),
    mediaType: z.string().trim().min(1),
    reviewStatus: z.string().trim().min(1),
    accessVersions: z.array(
      z.object({
        language: z.string().trim().min(1),
        url: z.url(),
        access: z.string().trim().min(1),
        translationKind: z.string().trim().min(1),
        checkedAt: z.string().trim().min(1),
      }),
    ),
  }),
});

const learningTrails = defineCollection({
  loader: file('src/data/learning-trails.json'),
  schema: z.object({
    title: localizedText,
    summary: localizedText,
    capabilityId: z.string().trim().min(1),
    resourceIds: z.array(z.string().trim().min(1)),
    concepts: z.array(z.string().trim().min(1)),
    exercises: z.array(z.string().trim().min(1)),
    selfChecks: z.array(z.string().trim().min(1)),
  }),
});

const roleProfiles = defineCollection({
  loader: file('src/data/role-profiles.json'),
  schema: z.object({
    title: localizedText,
    roleId: z.string().trim().min(1),
    productionContextId: z.string().trim().min(1),
    basis: localizedText,
    caveats: localizedText,
    capabilities: z.array(
      z.object({
        capabilityId: z.string().trim().min(1),
        priority: z.string().trim().min(1),
        responsibility: z.string().trim().min(1),
      }),
    ),
  }),
});

const atlasCategories = defineCollection({
  loader: file('src/data/atlas-categories.json'),
  schema: z.object({
    name: localizedText,
    summary: localizedText,
    order: z.number().int(),
  }),
});

const atlasNodes = defineCollection({
  loader: file('src/data/atlas-nodes.json'),
  schema: z.object({
    kind: z.enum(['game', 'innovation']),
    name: localizedText,
    summary: localizedText,
    year: z.number().int(),
  }),
});

const atlasEvidence = defineCollection({
  loader: file('src/data/atlas-evidence.json'),
  schema: z.object({
    title: localizedText,
    url: z.url(),
    summary: localizedText,
  }),
});

const atlasRelations = defineCollection({
  loader: file('src/data/atlas-relations.json'),
  schema: z.object({
    fromId: z.string().trim().min(1),
    toId: z.string().trim().min(1),
    type: z.string().trim().min(1),
    evidenceStatus: z.string().trim().min(1),
    evidenceIds: z.array(z.string().trim().min(1)).min(1),
    summary: localizedText,
  }),
});

const atlasThemes = defineCollection({
  loader: file('src/data/atlas-themes.json'),
  schema: z.object({
    title: localizedText,
    summary: localizedText,
    nodeIds: z.array(z.string().trim().min(1)),
    relationIds: z.array(z.string().trim().min(1)),
  }),
});

const projectDocs = defineCollection({
  loader: glob({
    base: '.',
    pattern: '{README,METHODOLOGY,CONTRIBUTING,ROADMAP,CHANGELOG}.md',
  }),
});

const devlog = defineCollection({
  loader: glob({
    base: 'docs/devlog',
    pattern: '**/*.md',
  }),
});

export const collections = {
  domains,
  capabilities,
  sources,
  resources,
  learningTrails,
  roleProfiles,
  atlasCategories,
  atlasNodes,
  atlasEvidence,
  atlasRelations,
  atlasThemes,
  projectDocs,
  devlog,
};
