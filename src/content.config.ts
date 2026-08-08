import { defineCollection } from 'astro:content';
import { file, glob } from 'astro/loaders';
import { z } from 'astro/zod';

const localizedText = z
  .object({
    'zh-CN': z.string().trim().min(1),
    en: z.string().trim().min(1).optional(),
  })
  .strict();

const isoDate = z.iso.date();
const httpUrl = z.url().refine((value) => {
  const protocol = new URL(value).protocol;
  return protocol === 'http:' || protocol === 'https:';
}, 'Expected an http or https URL');

const externalSignal = z
  .object({
    provider: z.string().trim().min(1),
    label: z.string().trim().min(1),
    value: z.union([z.string().trim().min(1), z.number()]),
    sampleSize: z.string().trim().min(1).optional(),
    observedAt: isoDate,
    url: httpUrl,
  })
  .strict();

const accessVersion = z
  .object({
    language: z.string().trim().min(1),
    url: httpUrl,
    accessModel: z.enum(['free', 'paid', 'subscription']),
    regionRestrictions: z
      .array(
        z
          .object({
            regions: z.array(z.string().trim().min(1)).min(1),
            note: localizedText,
          })
          .strict(),
      )
      .min(1)
      .optional(),
    versionRelation: z.enum(['original', 'official', 'community']),
    presentationMode: z.enum(['original', 'translated', 'bilingual', 'subtitled', 'dubbed']),
    checkedAt: isoDate,
  })
  .strict();

const basisLink = z
  .object({
    title: localizedText,
    url: httpUrl,
    sourceNote: localizedText,
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

const knowledgeTopics = defineCollection({
  loader: file('src/data/knowledge-topics.json'),
  schema: z
    .object({
      id: z.string().trim().min(1),
      name: localizedText,
      summary: localizedText,
      domainId: z.string().trim().min(1),
    })
    .strict(),
});

const capabilityRelations = defineCollection({
  loader: file('src/data/capability-relations.json'),
  schema: z
    .object({
      id: z.string().trim().min(1),
      fromId: z.string().trim().min(1),
      toId: z.string().trim().min(1),
      type: z.enum(['supports', 'complements']),
      summary: localizedText,
    })
    .strict(),
});

const resourceTopics = defineCollection({
  loader: file('src/data/resource-topics.json'),
  schema: z
    .object({
      id: z.string().trim().min(1),
      title: localizedText,
      summary: localizedText,
      capabilityIds: z.array(z.string().trim().min(1)),
      knowledgeTopicIds: z.array(z.string().trim().min(1)),
    })
    .strict(),
});

const sources = defineCollection({
  loader: file('src/data/sources.json'),
  schema: z
    .object({
      id: z.string().trim().min(1),
      name: localizedText,
      kind: z.enum(['creator', 'channel', 'organization', 'publisher', 'website']),
      summary: localizedText,
      homepage: httpUrl,
      languages: z.array(z.string().trim().min(1)).min(1),
      externalSignals: z.array(externalSignal).optional(),
    })
    .strict(),
});

const resources = defineCollection({
  loader: file('src/data/resources.json'),
  schema: z
    .object({
      id: z.string().trim().min(1),
      title: localizedText,
      summary: localizedText,
      sourceId: z.string().trim().min(1),
      capabilityIds: z.array(z.string().trim().min(1)),
      knowledgeTopicIds: z.array(z.string().trim().min(1)),
      resourceTopicIds: z.array(z.string().trim().min(1)),
      mediaType: z.enum(['article', 'book', 'course', 'paper', 'podcast', 'talk', 'video', 'website']),
      canonicalUrl: httpUrl,
      whyRelevant: localizedText,
      originalLanguage: z.string().trim().min(1),
      externalSignals: z.array(externalSignal).optional(),
      accessVersions: z.array(accessVersion).min(1),
    })
    .strict(),
});

const roleProfiles = defineCollection({
  loader: file('src/data/role-profiles.json'),
  schema: z
    .object({
      id: z.string().trim().min(1),
      title: localizedText,
      roleId: z.string().trim().min(1),
      productionContextId: z.string().trim().min(1),
      basis: localizedText,
      basisLinks: z.array(basisLink).min(1),
      reviewedAt: isoDate,
      caveats: localizedText,
      capabilities: z.array(
        z
          .object({
            capabilityId: z.string().trim().min(1),
            priority: z.enum(['core', 'important', 'suggested']),
            responsibility: z.enum(['execute', 'contribute', 'decide', 'direct']),
          })
          .strict(),
      ),
    })
    .strict(),
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
    url: httpUrl,
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
  schema: z.object({
    title: z.string().trim().min(1),
  }),
});

export const collections = {
  domains,
  capabilities,
  knowledgeTopics,
  capabilityRelations,
  resourceTopics,
  sources,
  resources,
  roleProfiles,
  atlasCategories,
  atlasNodes,
  atlasEvidence,
  atlasRelations,
  atlasThemes,
  projectDocs,
  devlog,
};
