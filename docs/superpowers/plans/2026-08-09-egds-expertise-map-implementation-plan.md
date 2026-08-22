# EGDS Expertise Map Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the generic five-group capability map with a compact, authorial EGDS map that preserves all 42 capabilities, 12 knowledge topics, 64 capability relations, three Career Lenses, resource links, and no-JavaScript access without trapping page scroll.

**Architecture:** Add an explicit EGDS framework catalog beside the legacy map only long enough to migrate safely, then retire `domains` and `mapGroups` in the same implementation branch. A pure deterministic layout helper projects the 28-node EGDS skeleton and one optional branch-anchored expansion band; `CapabilityMap` owns expansion, selection, relation focus, inspector state, and Career focus requests. Server HTML always contains the complete hierarchy and links, while JavaScript progressively enhances it into a single-expanded-container map.

**Tech Stack:** Astro 7, TypeScript 6, Astro content collections, JSON catalog files, Vitest, Playwright, semantic HTML, SVG structure/relation paths, existing CSS custom properties; no new runtime dependency.

---

## Delivery rules and task graph

- Work only in `.worktrees/v02` on `codex/v02`; keep the repository Private and Pages disabled.
- Do not modify Resources or Innovation Atlas runtime behavior in this plan.
- Obtain a real RED before every behavior change, then the smallest GREEN.
- Stage exact files; never use `git add .`.
- `src/styles/global.css` has one implementation owner in Task 4. Other implementation agents must not edit it.
- Every task ends with a clean commit and a fresh targeted verification result.
- Parallel wave after Task 1:
  - Task 2 owns only the pure hierarchy/layout helper and its unit tests.
  - Task 3 owns only detail routes, page copy, and their E2E expectations.
- Task 4 waits for both Tasks 2 and 3 because Task 3 and Task 4 intentionally touch `src/pages/map/index.astro` in sequence. Task 5 waits for Task 4. Task 6 waits for Tasks 3–5. Task 7 is the root-agent acceptance gate.

Recommended capability allocation:

| Task | Difficulty | Agent recommendation | Reason |
| --- | --- | --- | --- |
| 1. Catalog contract and migration data | High | Sol, high reasoning | Cross-collection schema, exact mapping, migration invariants |
| 2. Deterministic EGDS layout | Medium-high | Terra, high reasoning | Bounded pure geometry with strong tests |
| 3. Detail routes and public copy | Medium | Terra, medium reasoning | Isolated route migration and deterministic assertions |
| 4. Interactive map and visual system | High | Sol, high reasoning | State ownership, progressive enhancement, SVG/DOM/a11y/CSS |
| 5. Career Lens bridge | Medium-high | Terra, high reasoning | Event contract, projection counts, state independence |
| 6. Legacy ontology retirement | High | Sol, high reasoning | Destructive schema cleanup and full reference audit |
| 7. Adversarial acceptance and journal | High | Root lead, high reasoning | Cross-slice verification and publication truth |

Luna is not currently exposed by the desktop subagent runtime. Do not invent a Luna dispatch path; use Terra for bounded mechanical work and Sol for ambiguous architecture and final review.

## Locked domain contract

The implementation must preserve these exact counts at the end:

```ts
expect(catalog.egdsFrameworkNodes).toHaveLength(28);
expect(catalog.egdsFrameworkRelations).toHaveLength(4);
expect(catalog.capabilities).toHaveLength(42);
expect(catalog.knowledgeTopics).toHaveLength(12);
expect(catalog.capabilityRelations).toHaveLength(64);
```

The only framework relation sets are:

```ts
const expectedProcessRelations = [
  ['perception', 'rationalization'],
  ['rationalization', 'deconstruction'],
  ['deconstruction', 'reconstruction'],
] as const;

const expectedExternalRelations = [
  ['innovation-possibility-space', 'atlas/'],
] as const;
```

Capability and Knowledge Topic IDs remain globally stable and keep their current detail URLs. A framework node is never a progress item and never receives Career priority attributes.

### Task 1: Add the EGDS catalog contract and exact placement data

**Owner:** Sol / high reasoning. No parallel edits to the catalog files in this task.

**Files:**
- Create: `src/data/egds-framework-nodes.json`
- Create: `src/data/egds-framework-relations.json`
- Modify: `src/data/capabilities.json`
- Modify: `src/data/knowledge-topics.json`
- Modify: `src/content.config.ts`
- Modify: `src/lib/catalog/load.ts`
- Modify: `src/lib/catalog/validate.ts`
- Modify: `tests/lib/catalog-data.test.ts`
- Modify: `tests/lib/catalog-validate.test.ts`

- [ ] **Step 1: Write failing raw-data tests for the approved framework topology and placements**

Add JSON imports and exact assertions to `tests/lib/catalog-data.test.ts`. Use these complete placement maps; do not derive them from the old Domain data.

```ts
const expectedCapabilityPlacements: Record<string, string[]> = {
  'experience-journey': ['emotional-arc-shaping'],
  perception: ['player-perspective-taking'],
  rationalization: ['experience-framing'],
  deconstruction: ['experience-deconstruction'],
  'narrative-lever': [
    'choice-consequence-design',
    'narrative-architecture',
    'interactive-narrative-design',
    'narrative-exposition',
    'world-character-coherence',
  ],
  'aesthetics-lever': [
    'aesthetic-direction',
    'multimodal-presentation-integration',
  ],
  'gameplay-challenges-lever': [
    'core-loop-design',
    'rules-system-modeling',
    'game-feel-tuning',
    'challenge-difficulty-design',
    'pacing-control',
    'progression-economy-design',
    'level-structure-design',
    'spatial-flow-design',
    'navigation-wayfinding-design',
    'encounter-space-composition',
    'blockout-spatial-validation',
  ],
  'prototype-production-breakdown': [
    'learning-prototype-design',
    'task-breakdown',
  ],
  'playtest-evidence-iteration': [
    'research-question-framing',
    'playtesting',
    'player-behavior-observation',
    'qualitative-evidence-synthesis',
    'telemetry-interpretation',
    'iteration-planning',
  ],
  'tradeoff-specification-delivery': [
    'scope-prioritization',
    'design-specification-handoff',
  ],
  'vision-direction-decisions': [
    'constraint-aware-decision-making',
    'creative-vision-stewardship',
  ],
  'alignment-communication': [
    'cross-discipline-communication',
    'alignment-facilitation',
  ],
  'feedback-collaboration': ['design-critique-feedback'],
  'audience-positioning-cluster': ['audience-positioning'],
  'market-opportunity': ['market-reference-analysis'],
  'value-exchange': ['value-proposition-framing'],
  'monetization-alignment': ['monetization-experience-alignment'],
  'values-culture': ['ethical-cultural-evaluation'],
};

const expectedTopicPlacements: Record<string, string[]> = {
  perception: ['player-motivation-difference', 'perception-attention-emotion'],
  'narrative-lever': ['narratology-agency-authorship'],
  'aesthetics-lever': ['audiovisual-semiotics'],
  'gameplay-challenges-lever': [
    'emergence-complexity',
    'probability-randomness-fairness',
    'spatial-cognition-wayfinding',
  ],
  'prototype-production-breakdown': ['production-pipelines-constraints'],
  'playtest-evidence-iteration': ['research-ethics-bias'],
  'leadership-management': ['organizational-dynamics-power'],
  'market-opportunity': ['game-industry-platform-economics'],
  'values-culture': ['games-values-culture'],
};

const invertPlacements = (placements: Record<string, string[]>) => Object.fromEntries(
  Object.entries(placements).flatMap(([frameworkNodeId, ids]) =>
    ids.map((id) => [id, frameworkNodeId] as const)),
);

expect(Object.fromEntries(capabilities.map(({ id, frameworkNodeId }) => [id, frameworkNodeId])))
  .toEqual(invertPlacements(expectedCapabilityPlacements));
expect(Object.fromEntries(knowledgeTopics.map(({ id, frameworkNodeId }) => [id, frameworkNodeId])))
  .toEqual(invertPlacements(expectedTopicPlacements));
```

Also assert the exact 28 framework IDs, five direct children of `egds-root`, three process relations, and one Atlas link relation.

- [ ] **Step 2: Run the raw-data test to verify the feature is missing**

Run:

```bash
npm test -- tests/lib/catalog-data.test.ts
```

Expected: FAIL because `egds-framework-nodes.json`, `egds-framework-relations.json`, and `frameworkNodeId` do not exist.

- [ ] **Step 3: Write failing validator tests for invalid parentage, cycles, placements, and relation sets**

Extend `emptyCatalog()` with `egdsFrameworkNodes: []` and `egdsFrameworkRelations: []`, then add tests that independently prove these errors:

```ts
expect(codes(invalidParentCatalog)).toContain('EGDS_PARENT_NODE_MISSING');
expect(codes(cycleCatalog)).toContain('EGDS_FRAMEWORK_CYCLE');
expect(codes(secondRootCatalog)).toContain('EGDS_ROOT_COUNT_INVALID');
expect(codes(missingBranchCatalog)).toContain('EGDS_BRANCH_SET_INVALID');
expect(codes(wrongProcessSetCatalog)).toContain('EGDS_PROCESS_RELATION_SET_INVALID');
expect(codes(wrongAtlasLinkCatalog)).toContain('EGDS_LINK_RELATION_SET_INVALID');
expect(codes(missingCapabilityPlacementCatalog)).toContain('CAPABILITY_FRAMEWORK_NODE_MISSING');
expect(codes(missingTopicPlacementCatalog)).toContain('KNOWLEDGE_TOPIC_FRAMEWORK_NODE_MISSING');
expect(codes(externalEntryPlacementCatalog)).toContain('EGDS_ENTITY_CONTAINER_INVALID');
```

The fixture must use one valid root, exactly the five approved branch IDs, and the exact four approved framework relations before introducing one defect per test.

Import the real approved framework JSON into this validator test and make the shared fixture valid by default:

```ts
import egdsFrameworkNodes from '../../src/data/egds-framework-nodes.json';
import egdsFrameworkRelations from '../../src/data/egds-framework-relations.json';

const emptyCatalog = (): Catalog => ({
  egdsFrameworkNodes: structuredClone(egdsFrameworkNodes),
  egdsFrameworkRelations: structuredClone(egdsFrameworkRelations),
  domains: [],
  mapGroups: [],
  capabilities: [],
  knowledgeTopics: [],
  capabilityRelations: [],
  resourceTopics: [],
  sources: [],
  resources: [],
  roleProfiles: [],
  atlasTags: [],
  atlasNodes: [],
  atlasEvidence: [],
  atlasRelations: [],
  atlasThemes: [],
});
```

Each EGDS validator test mutates a clone of this valid framework. Unrelated resource/Atlas tests must not receive extra framework errors.

- [ ] **Step 4: Run validator tests to verify the new invariants are absent**

Run:

```bash
npm test -- tests/lib/catalog-validate.test.ts
```

Expected: FAIL on the new EGDS validation codes or missing catalog properties, while existing resource and Atlas tests remain green.

- [ ] **Step 5: Add the transitional schema and catalog types**

In `src/content.config.ts`, define the two collections and require `frameworkNodeId` on Capability and Knowledge Topic while temporarily retaining `domainId` and `position` until Task 6:

```ts
const egdsFrameworkNodes = defineCollection({
  loader: file('src/data/egds-framework-nodes.json'),
  schema: z.object({
    id: z.string().trim().min(1),
    kind: z.enum(['root', 'branch', 'entry', 'stage', 'lever', 'cluster', 'external-entry']),
    name: bilingualText,
    summary: localizedText,
    order: z.number().int().positive(),
    parentNodeId: z.string().trim().min(1).optional(),
  }).strict(),
});

const egdsFrameworkRelations = defineCollection({
  loader: file('src/data/egds-framework-relations.json'),
  schema: z.discriminatedUnion('type', [
    z.object({
      id: z.string().trim().min(1),
      type: z.literal('process-next'),
      fromId: z.string().trim().min(1),
      toId: z.string().trim().min(1),
    }).strict(),
    z.object({
      id: z.string().trim().min(1),
      type: z.literal('links-to'),
      fromId: z.string().trim().min(1),
      targetPath: z.literal('atlas/'),
    }).strict(),
  ]),
});
```

Add both collection names to `src/lib/catalog/load.ts`, `Catalog`, `collectionNames`, and `collections` in the raw-data test. Export both collections from `src/content.config.ts`.

- [ ] **Step 6: Create the exact 28-node framework and four relations**

Create `src/data/egds-framework-nodes.json` with this exact topology. Every `name` has both `zh-CN` and `en`; every `summary` has the approved Chinese method description and may add an English equivalent without making it a stronger claim. Use these exact English names in ID order:

```ts
const expectedEnglishNames = {
  'egds-root': 'Expertise / EGDS',
  'experience-design': 'Experience Design',
  'from-plan-to-ship': 'From Plan to Ship',
  'with-team': 'If We Have a Team',
  'product-profit': 'If We Want Product and Profit',
  'beyond-games': 'Beyond Games',
  'experience-journey': 'Experience Journey and Emotional Curve',
  perception: 'Perception',
  rationalization: 'Rationalization',
  deconstruction: 'Deconstruction',
  reconstruction: 'Reconstruction',
  'narrative-lever': 'Narrative',
  'aesthetics-lever': 'Aesthetics and Presentation',
  'gameplay-challenges-lever': 'Gameplay and Challenges',
  'mindset-problem-solving-tools': 'Mindset, Problem-Solving and Tools',
  'prototype-production-breakdown': 'Prototyping, Production and Task Breakdown',
  'playtest-evidence-iteration': 'Playtest, Evidence and Iteration',
  'tradeoff-specification-delivery': 'Trade-offs, Specification and Delivery',
  'vision-direction-decisions': 'Vision, Direction and Decisions',
  'alignment-communication': 'Alignment, Communication and Expression',
  'leadership-management': 'Leadership, Management and Delivery Assurance',
  'feedback-collaboration': 'Feedback, Collaboration and Consensus',
  'audience-positioning-cluster': 'Audience and Positioning',
  'market-opportunity': 'Market and Unmet Experiences',
  'value-exchange': 'Value Exchange',
  'monetization-alignment': 'Monetization and Experience Alignment',
  'values-culture': 'Values, Ethics and Culture',
  'innovation-possibility-space': 'Innovation and a Larger Possibility Space',
} as const;
```

Chinese names are the exact names in the approved topology table below. Chinese summaries are the corresponding claims in design specification §§4.1–4.5; do not add learning-order, scoring, or industry-standard language.

| ID | kind | parentNodeId | order |
| --- | --- | --- | ---: |
| `egds-root` | root | absent | 1 |
| `experience-design` | branch | `egds-root` | 1 |
| `from-plan-to-ship` | branch | `egds-root` | 2 |
| `with-team` | branch | `egds-root` | 3 |
| `product-profit` | branch | `egds-root` | 4 |
| `beyond-games` | branch | `egds-root` | 5 |
| `experience-journey` | entry | `experience-design` | 1 |
| `perception` | stage | `experience-design` | 2 |
| `rationalization` | stage | `experience-design` | 3 |
| `deconstruction` | stage | `experience-design` | 4 |
| `reconstruction` | stage | `experience-design` | 5 |
| `narrative-lever` | lever | `reconstruction` | 1 |
| `aesthetics-lever` | lever | `reconstruction` | 2 |
| `gameplay-challenges-lever` | lever | `reconstruction` | 3 |
| `mindset-problem-solving-tools` | cluster | `from-plan-to-ship` | 1 |
| `prototype-production-breakdown` | cluster | `from-plan-to-ship` | 2 |
| `playtest-evidence-iteration` | cluster | `from-plan-to-ship` | 3 |
| `tradeoff-specification-delivery` | cluster | `from-plan-to-ship` | 4 |
| `vision-direction-decisions` | cluster | `with-team` | 1 |
| `alignment-communication` | cluster | `with-team` | 2 |
| `leadership-management` | cluster | `with-team` | 3 |
| `feedback-collaboration` | cluster | `with-team` | 4 |
| `audience-positioning-cluster` | cluster | `product-profit` | 1 |
| `market-opportunity` | cluster | `product-profit` | 2 |
| `value-exchange` | cluster | `product-profit` | 3 |
| `monetization-alignment` | cluster | `product-profit` | 4 |
| `values-culture` | cluster | `beyond-games` | 1 |
| `innovation-possibility-space` | external-entry | `beyond-games` | 2 |

Create `src/data/egds-framework-relations.json` with exactly:

```json
[
  { "id": "process-perception-rationalization", "type": "process-next", "fromId": "perception", "toId": "rationalization" },
  { "id": "process-rationalization-deconstruction", "type": "process-next", "fromId": "rationalization", "toId": "deconstruction" },
  { "id": "process-deconstruction-reconstruction", "type": "process-next", "fromId": "deconstruction", "toId": "reconstruction" },
  { "id": "link-innovation-atlas", "type": "links-to", "fromId": "innovation-possibility-space", "targetPath": "atlas/" }
]
```

Add the exact `frameworkNodeId` values from Step 1 to all 42 capabilities and 12 topics. Retain their current `domainId` and `position` only until Task 6.

- [ ] **Step 7: Implement cross-collection validation**

Add these exact validation codes to `CatalogValidationCode` and implement them in `validateCatalog()`:

```ts
type EgdsValidationCode =
  | 'EGDS_PARENT_NODE_MISSING'
  | 'EGDS_FRAMEWORK_CYCLE'
  | 'EGDS_ROOT_COUNT_INVALID'
  | 'EGDS_BRANCH_SET_INVALID'
  | 'EGDS_PROCESS_RELATION_SET_INVALID'
  | 'EGDS_LINK_RELATION_SET_INVALID'
  | 'EGDS_ENTITY_CONTAINER_INVALID'
  | 'CAPABILITY_FRAMEWORK_NODE_MISSING'
  | 'KNOWLEDGE_TOPIC_FRAMEWORK_NODE_MISSING';
```

Validation rules:

1. Exactly one `kind: root`, with ID `egds-root` and no parent.
2. Every non-root has one valid `parentNodeId`.
3. Walking parent links from every node must reach the root without revisiting an ID.
4. The root's branch children are exactly `experience-design`, `from-plan-to-ship`, `with-team`, `product-profit`, and `beyond-games`, with orders 1–5.
5. Valid entity containers are only `entry`, `stage`, `lever`, and `cluster`.
6. The `process-next` tuple set and the `links-to` tuple set equal the locked sets above.
7. Role Profiles continue to resolve only against Capability IDs.

- [ ] **Step 8: Run targeted and full catalog verification**

Run:

```bash
npm test -- tests/lib/catalog-data.test.ts tests/lib/catalog-validate.test.ts
npm run check
npm test
npm run build
```

Expected: all commands exit 0; raw data reports 28 framework nodes, 4 framework relations, 42 capabilities, 12 topics, and 64 capability relations.

- [ ] **Step 9: Commit the contract**

```bash
git add src/data/egds-framework-nodes.json src/data/egds-framework-relations.json src/data/capabilities.json src/data/knowledge-topics.json src/content.config.ts src/lib/catalog/load.ts src/lib/catalog/validate.ts tests/lib/catalog-data.test.ts tests/lib/catalog-validate.test.ts
git commit -m "feat: define the EGDS expertise map contract"
```

### Task 2: Build the deterministic EGDS skeleton and expansion layout

**Owner:** Terra / high reasoning. May run in parallel with Task 3 after Task 1. Do not edit components or CSS.

**Files:**
- Modify: `src/lib/map-geometry.ts`
- Modify: `tests/lib/map-geometry.test.ts`

- [ ] **Step 1: Replace legacy geometry tests with EGDS layout RED tests**

Define the new public contract in `tests/lib/map-geometry.test.ts`:

```ts
const overview = buildEgdsMapLayout({
  frameworkNodes: egdsFrameworkNodes,
  frameworkRelations: egdsFrameworkRelations,
  capabilities,
  knowledgeTopics,
});

expect(overview.width).toBe(1180);
expect(overview.height).toBeLessThanOrEqual(720);
expect(overview.frameworkBoxes).toHaveLength(28);
expect(overview.entityBoxes).toHaveLength(0);
expect(overview.structuralPaths).toHaveLength(27);
expect(overview.processPaths).toHaveLength(3);
expect(overview.externalEntries).toEqual([
  expect.objectContaining({ id: 'innovation-possibility-space', targetPath: 'atlas/' }),
]);
```

For every entity-bearing framework node, build one expanded layout and assert:

```ts
const expectedEntities = [
  ...capabilities.filter(({ frameworkNodeId }) => frameworkNodeId === container.id)
    .map(({ id }) => `capability:${id}`),
  ...knowledgeTopics.filter(({ frameworkNodeId }) => frameworkNodeId === container.id)
    .map(({ id }) => `knowledge-topic:${id}`),
].sort();

expect(expanded.expandedFrameworkNodeId).toBe(container.id);
expect(expanded.entityBoxes.map(({ key }) => key).sort()).toEqual(expectedEntities);
expect(expanded.entityBoxes.every(({ frameworkNodeId }) => frameworkNodeId === container.id)).toBe(true);
```

Also assert:

- reverse every input array and receive identical coordinates and paths;
- all framework and entity boxes have unique type-prefixed keys;
- no box pair overlaps in overview or any single-container expansion;
- every structural/process path starts and ends on its endpoint boundary;
- no structural/process path intersects an unrelated box interior;
- `contains` edges are derived from `parentNodeId`, never read from a duplicate relation list.

- [ ] **Step 2: Run the geometry test to verify the old helper cannot satisfy EGDS**

Run:

```bash
npm test -- tests/lib/map-geometry.test.ts
```

Expected: FAIL because `buildEgdsMapLayout` and the EGDS layout types do not exist.

- [ ] **Step 3: Implement the new layout types and stable overview anchors**

Keep `relationSemantics`, `rectanglesOverlap`, and boundary projection utilities. Replace `MindMapBoxKind` and `buildCapabilityMindMapLayout` with:

```ts
export type EgdsBoxKind =
  | 'root'
  | 'branch'
  | 'entry'
  | 'stage'
  | 'lever'
  | 'cluster'
  | 'external-entry'
  | 'capability'
  | 'knowledge-topic'
  | 'relation-endpoint';

export type EgdsMapBox = Readonly<{
  id: string;
  key: `${EgdsBoxKind}:${string}`;
  kind: EgdsBoxKind;
  frameworkNodeId?: string;
  x: number;
  y: number;
  width: number;
  height: number;
}>;

export type EgdsMapPath = Readonly<{
  id: string;
  fromKey: EgdsMapBox['key'];
  toKey: EgdsMapBox['key'];
  path: string;
}>;

export type EgdsMapLayout = Readonly<{
  width: 1180;
  height: number;
  expandedFrameworkNodeId?: string;
  frameworkBoxes: EgdsMapBox[];
  entityBoxes: EgdsMapBox[];
  relationEndpointBoxes: EgdsMapBox[];
  structuralPaths: EgdsMapPath[];
  processPaths: EgdsMapPath[];
  relationPaths: Array<EgdsMapPath & Readonly<{
    relationId: string;
    relationType: 'supports' | 'complements';
  }>>;
  expansionLeaderPath?: EgdsMapPath;
  externalEntries: Array<Readonly<{ id: string; targetPath: 'atlas/' }>>;
}>;
```

Use this fixed 1180 × 700 authorial overview skeleton; each tuple is `[x, y, width, height]`:

```ts
const frameworkAnchors = {
  'egds-root': [20, 320, 130, 60],
  'experience-design': [180, 80, 180, 54],
  'from-plan-to-ship': [180, 220, 180, 54],
  'with-team': [180, 360, 180, 54],
  'product-profit': [180, 500, 180, 54],
  'beyond-games': [180, 630, 180, 54],
  'experience-journey': [390, 15, 190, 44],
  perception: [390, 80, 125, 44],
  rationalization: [535, 80, 125, 44],
  deconstruction: [680, 80, 125, 44],
  reconstruction: [825, 80, 125, 44],
  'narrative-lever': [990, 25, 170, 42],
  'aesthetics-lever': [990, 80, 170, 42],
  'gameplay-challenges-lever': [990, 135, 170, 42],
  'mindset-problem-solving-tools': [410, 225, 170, 44],
  'prototype-production-breakdown': [600, 225, 170, 44],
  'playtest-evidence-iteration': [790, 225, 170, 44],
  'tradeoff-specification-delivery': [980, 225, 170, 44],
  'vision-direction-decisions': [410, 365, 170, 44],
  'alignment-communication': [600, 365, 170, 44],
  'leadership-management': [790, 365, 170, 44],
  'feedback-collaboration': [980, 365, 170, 44],
  'audience-positioning-cluster': [410, 505, 170, 44],
  'market-opportunity': [600, 505, 170, 44],
  'value-exchange': [790, 505, 170, 44],
  'monetization-alignment': [980, 505, 170, 44],
  'values-culture': [440, 635, 220, 44],
  'innovation-possibility-space': [720, 635, 240, 44],
} as const;
```

Route root-to-branch containment through the clear `x=165` gutter. Route same-row branch-to-cluster containment through a rail 16px above the child boxes, with vertical drops to each child top boundary; do not draw a horizontal line through earlier siblings. Route the experience branch-to-stage containment through a rail at `y=64`, the three process paths directly between adjacent stage boundaries at `y=102`, and reconstruction-to-lever containment through the clear `x=970` gutter. Unknown IDs must throw instead of receiving an arbitrary fallback position.

- [ ] **Step 4: Implement one branch-anchored expansion band**

When `expandedFrameworkNodeId` is present:

1. Keep all overview framework coordinates unchanged.
2. Append one expansion band at `x=180`, `y=724`, `width=980`; its height is `72 + entityRows * 68 + relationEndpointRows * 68 + 24`.
3. Place only that container's Capability and Knowledge Topic boxes in stable ID order, using three columns starting at `x=210`, each `280 × 52`, with a 24px column gap and 16px row gap.
4. Add one elbow leader from the selected framework node boundary to the expansion-band heading.
5. Increase total layout height by the exact rows required; do not create an internal vertical scroll area.

When `selectedCapabilityId` is also present:

1. Require the selected Capability to belong to the expanded container.
2. Collect only relations where it is `fromId` or `toId`.
3. Reuse an existing visible entity box when the other endpoint is in the same container.
4. Project every other direct neighbor once as a `relation-endpoint:<capabilityId>` chip after the entity rows, using the same three-column metrics; an endpoint chip is not a second expanded home container.
5. Return one `relationPath` per direct relation from the selected Capability boundary to the visible entity/endpoint boundary.
6. Keep `supports` direction and `complements` symmetry in relation metadata; do not infer prerequisites.

The function signature is:

```ts
export function buildEgdsMapLayout(input: Readonly<{
  frameworkNodes: Catalog['egdsFrameworkNodes'];
  frameworkRelations: Catalog['egdsFrameworkRelations'];
  capabilities: Catalog['capabilities'];
  knowledgeTopics: Catalog['knowledgeTopics'];
  capabilityRelations: Catalog['capabilityRelations'];
  expandedFrameworkNodeId?: string;
  selectedCapabilityId?: string;
}>): EgdsMapLayout
```

- [ ] **Step 5: Run pure geometry verification**

Run:

```bash
npm test -- tests/lib/map-geometry.test.ts
npm run check
```

Expected: all EGDS geometry tests pass and Astro reports 0 diagnostics.

- [ ] **Step 6: Commit the helper**

```bash
git add src/lib/map-geometry.ts tests/lib/map-geometry.test.ts
git commit -m "feat: project the EGDS expertise map layout"
```

### Task 3: Migrate detail routes and public copy to EGDS

**Owner:** Terra / medium reasoning. May run in parallel with Task 2 after Task 1. Do not edit `CapabilityMap.astro`, `CareerExplorer.astro`, or `global.css`.

**Files:**
- Modify: `src/pages/map/index.astro`
- Modify: `src/pages/capabilities/[id].astro`
- Modify: `src/pages/topics/[id].astro`
- Modify: `src/pages/careers/index.astro`
- Modify: `src/pages/index.astro`
- Modify: `tests/e2e/visible-skeleton.spec.ts`
- Create: `tests/e2e/egds-routes.spec.ts`

- [ ] **Step 1: Write route RED tests**

Add tests that require:

```ts
await page.goto('./map/');
await expect(page.getByRole('heading', { name: '从体验出发，理解设计如何成为结果。' })).toBeVisible();
await expect(page.getByText(/PlayWithExperiences 的 EGDS/)).toBeVisible();
await expect(page.getByText(/不是唯一标准答案/)).toBeVisible();

await page.goto('./capabilities/playtesting/');
await expect(page.getByLabel('面包屑')).toContainText('Playtest、证据与迭代');
await expect(page.getByLabel('面包屑').getByRole('link', { name: 'Playtest、证据与迭代' }))
  .toHaveAttribute('href', '/Learn-About-Games/map/#egds-playtest-evidence-iteration');

await page.goto('./topics/perception-attention-emotion/');
await expect(page.getByLabel('面包屑')).toContainText('感受');
```

Update `visible-skeleton.spec.ts` so public counts come from `egdsFrameworkNodes`, capabilities, topics, and relations rather than Domains/mapGroups.

- [ ] **Step 2: Run route tests to verify old Domain language is still public**

Run:

```bash
npm run build
CI=1 npx playwright test tests/e2e/visible-skeleton.spec.ts tests/e2e/egds-routes.spec.ts --project=chromium
```

Expected: FAIL on old headings, old Domain breadcrumbs, or missing EGDS author statement.

- [ ] **Step 3: Resolve framework breadcrumbs from the catalog**

In both detail routes, replace Domain lookup with:

```ts
const frameworkNode = catalog.egdsFrameworkNodes.find(
  ({ id }) => id === capability.frameworkNodeId,
);
if (!frameworkNode) throw new Error(`Missing EGDS framework node for capability ${capability.id}`);
```

Use the same pattern for Knowledge Topic. Link the breadcrumb to:

```ts
`${sitePath('map/')}#egds-${frameworkNode.id}`
```

Keep existing detail URLs, progress state, resource filters, and relation sections unchanged.

- [ ] **Step 4: Replace generic map copy with the approved author statement**

Use these exact Chinese strings on the map route:

```text
从体验出发，理解设计如何成为结果。
本地图以 PlayWithExperiences 的 EGDS 为知识骨架，结合公开资料与行业实践持续修订。它是一种可讨论的设计视角，不是唯一标准答案。
```

Update the homepage preview and Career page description to name EGDS without describing it as an industry-standard sequence or learning path.

- [ ] **Step 5: Run route verification and commit**

Run:

```bash
npm run build
CI=1 npx playwright test tests/e2e/visible-skeleton.spec.ts tests/e2e/egds-routes.spec.ts --project=chromium --project=mobile-chromium
```

Expected: both projects pass; capability/topic URLs and resource links remain unchanged.

```bash
git add src/pages/map/index.astro 'src/pages/capabilities/[id].astro' 'src/pages/topics/[id].astro' src/pages/careers/index.astro src/pages/index.astro tests/e2e/visible-skeleton.spec.ts tests/e2e/egds-routes.spec.ts
git commit -m "feat: explain the map through EGDS"
```

### Task 4: Render and progressively enhance the EGDS map

**Owner:** Sol / high reasoning. This task is the sole implementation owner of map CSS in `global.css`.

**Files:**
- Create: `src/components/MapInspector.astro`
- Modify: `src/components/CapabilityMap.astro`
- Modify: `src/components/MapExplorer.astro`
- Modify: `src/pages/map/index.astro`
- Modify: `src/styles/global.css`
- Replace behavior assertions in: `tests/e2e/map-v02.spec.ts`

- [ ] **Step 1: Write desktop and outline RED tests for the new server contract**

Replace the old five-group/Domain expectations with:

```ts
const map = page.locator('[data-egds-map]');
await expect(map.locator('[data-egds-framework-node]')).toHaveCount(28);
await expect(map.locator('[data-egds-branch]')).toHaveCount(5);
await expect(map.locator('[data-egds-process-path]')).toHaveCount(3);
await expect(map.locator('[data-egds-lever]')).toHaveCount(3);
await expect(map.locator('[data-map-entity]:not([hidden])')).toHaveCount(0);
await expect(map.locator('[data-capability-relation]:not([hidden])')).toHaveCount(0);
await expect(map.getByRole('link', { name: '前往 Innovation Atlas' }))
  .toHaveAttribute('href', '/Learn-About-Games/atlas/');
```

At 320px and 1024px, require the desktop scene to be hidden and the EGDS outline to expose all 28 framework nodes, 42 Capability links, 12 Topic links, and 64 textual capability relations without page overflow.

- [ ] **Step 2: Write interaction RED tests**

Cover all of these behaviors before implementation:

1. Activating `Playtest、证据与迭代` expands exactly that container and six capabilities plus one topic.
2. Activating `叙事` closes the previous container and exposes five capabilities plus one topic.
3. Every visible entity has sibling controls in this order: relation button, detail link; no button contains an anchor and no anchor contains a button.
4. Selecting `Playtest` opens the inspector and exposes only Playtest's direct relations and endpoint chips.
5. `supports` uses an arrow/solid line; `complements` is undirected/dashed.
6. `返回全图` clears expansion, selected entity, inspector, and visible capability relations.
7. Normal wheel over blank map space, framework nodes, and an expanded entity increases `window.scrollY` and does not change an internal `scrollTop`.
8. no-JavaScript shows the full native outline; relationship buttons are disabled with an explanation while detail links remain usable.

Run the RED:

```bash
npm run build
CI=1 npx playwright test tests/e2e/map-v02.spec.ts --project=chromium --project=mobile-chromium
```

Expected: FAIL because the old map renders all 54 entities, all 64 faint lines, legacy hierarchy nodes, and a nested `overflow:auto` canvas.

- [ ] **Step 3: Create the minimal inspector component**

`MapInspector.astro` accepts all catalog entities and renders one server-owned panel shell:

```ts
interface Props {
  capabilities: Catalog['capabilities'];
  knowledgeTopics: Catalog['knowledgeTopics'];
  capabilityRelations: Catalog['capabilityRelations'];
}
```

The panel starts hidden and contains these exact targets:

```html
<aside data-map-inspector hidden>
  <p data-map-inspector-kind></p>
  <h2 data-map-inspector-name></h2>
  <p data-map-inspector-summary></p>
  <ul data-map-inspector-relations></ul>
  <a data-map-inspector-resources>查看相关资源</a>
  <a data-map-inspector-detail>打开详情页</a>
</aside>
```

It must not duplicate the full capability/topic detail page and must not read or write personal progress.

- [ ] **Step 4: Rewrite `CapabilityMap` around the EGDS catalog**

Use this Props contract:

```ts
interface Props {
  frameworkNodes: Catalog['egdsFrameworkNodes'];
  frameworkRelations: Catalog['egdsFrameworkRelations'];
  capabilities: Catalog['capabilities'];
  knowledgeTopics: Catalog['knowledgeTopics'];
  capabilityRelations: Catalog['capabilityRelations'];
}
```

Server markup rules:

- one `data-egds-map` root and one desktop `data-capability-map-canvas`;
- 28 framework nodes with `data-egds-kind`, stable `id="egds-<id>"`, and type labels;
- only `entry`, `stage`, `lever`, and `cluster` nodes with directly assigned entities receive an expand button and count;
- the external entry is a normal link created with `sitePath('atlas/')`;
- all 54 entity rows exist in server HTML but are hidden in the enhanced desktop scene until their container expands;
- a separate native `<details>` outline contains the complete hierarchy and the existing textual relation breakdown for no-JavaScript and `≤1150px`;
- method nodes never receive `data-career-node`, `data-role-priority`, or progress attributes.

- [ ] **Step 5: Implement one state owner and public map events**

The enhanced controller inside `CapabilityMap` owns only:

```ts
type EgdsMapState = {
  expandedFrameworkNodeId?: string;
  selectedEntityKey?: `capability:${string}` | `knowledge-topic:${string}`;
};
```

Implement these root events for Task 5 without exposing internal selectors:

```ts
mapRoot.addEventListener('egds-map:focus-capability', focusCapabilityRequest);
mapRoot.addEventListener('egds-map:apply-career-lens', applyCareerLensRequest);
mapRoot.addEventListener('egds-map:clear-career-lens', clearCareerLensRequest);
```

The event detail types are:

```ts
type FocusCapabilityDetail = { capabilityId: string };
type ApplyCareerLensDetail = {
  profileId: string;
  nodes: Array<{
    capabilityId: string;
    priority: 'core' | 'important' | 'suggested' | 'unlisted';
    responsibility?: 'execute' | 'contribute' | 'decide' | 'direct';
  }>;
};
```

Expansion reprojects positions with `buildEgdsMapLayout`. Selection passes `selectedCapabilityId` into the helper and renders only its returned direct `relationPaths` and `relationEndpointBoxes`; the inspector lists the same relation IDs. Use instantaneous scrolling by temporarily setting `document.documentElement.style.scrollBehavior = 'auto'`; restore the previous inline value immediately.

- [ ] **Step 6: Replace the old map CSS with one-screen hierarchy styles**

Delete the old `map-root-label`, `map-group-label`, `map-domain-label`, full 54-node canvas, and low-opacity 64-line styles. Implement:

- default scene height from layout, maximum 720px at 1440px;
- no `overflow-y:auto` or `overflow:auto` on the map canvas;
- type-redundant framework, Capability, Topic, and external-entry treatments;
- minimum type sizes: root/branch 16px, stage/lever 14px, cluster 13px, entity 12px;
- relation paths hidden unless selected;
- `supports` solid with arrow, `complements` dashed without direction;
- `>1150px` desktop scene; `≤1150px` equivalent outline;
- Light/Dark focus, selected, Career priority, and unlisted text contrast at WCAG AA for normal text;
- no transition on state that a test must read immediately after programmatic Career focus.

- [ ] **Step 7: Run targeted map verification**

Run:

```bash
npm run build
CI=1 npx playwright test tests/e2e/map-v02.spec.ts tests/e2e/egds-routes.spec.ts --project=chromium --project=mobile-chromium
```

Expected: all tests pass; 1440 default scene is at most 720px high, 1024/320 use the outline, and normal wheel scrolls the page.

- [ ] **Step 8: Capture and inspect the map matrix**

Create original-resolution screenshots for:

- 1440 Light default;
- 1440 Dark default;
- 1440 Light Playtest expansion;
- 1440 Dark narrative expansion with a selected capability;
- 1024 Light outline;
- 320 Dark outline;
- 1440 Light no-JavaScript expanded native outline;
- 320 Dark no-JavaScript outline.

For every screenshot and runtime probe, record: page/body horizontal overflow, scene height, visible framework/entity/relation counts, box overlaps, path/box intersections, and minimum computed font sizes.

- [ ] **Step 9: Commit the interactive map**

```bash
git add src/components/MapInspector.astro src/components/CapabilityMap.astro src/components/MapExplorer.astro src/pages/map/index.astro src/styles/global.css tests/e2e/map-v02.spec.ts
git commit -m "feat: render the EGDS expertise map"
```

### Task 5: Bridge Career Lenses into EGDS state without DOM ownership

**Owner:** Terra / high reasoning. Do not edit `global.css`.

**Files:**
- Modify: `src/lib/career-lens.ts`
- Modify: `src/components/CareerExplorer.astro`
- Modify: `src/pages/careers/index.astro`
- Modify: `tests/lib/career-lens.test.ts`
- Modify: `tests/e2e/career-lenses.spec.ts`
- Modify: `tests/e2e/profile-progress.spec.ts`

- [ ] **Step 1: Write pure RED tests for collapsed-container counts**

Extend `CareerLensProjection` with framework counts only, never scores:

```ts
expect(result.frameworkCounts['playtest-evidence-iteration']).toEqual({
  core: expect.any(Number),
  important: expect.any(Number),
  suggested: expect.any(Number),
});
expect(JSON.stringify(result.frameworkCounts)).not.toMatch(/score|fit|gap|completion|percentage/i);
```

For each profile, verify the sum of all count buckets equals exactly the number of mapped profile capabilities, and Knowledge Topics/framework nodes never appear in the projection.

Run:

```bash
npm test -- tests/lib/career-lens.test.ts
```

Expected: FAIL because `frameworkCounts` does not exist.

- [ ] **Step 2: Implement pure framework counts**

Change the Capability input type to include `frameworkNodeId` and add:

```ts
type FrameworkPriorityCounts = Record<
  string,
  { core: number; important: number; suggested: number }
>;
```

Initialize a bucket only for framework nodes with at least one mapped profile capability. Increment exactly once per profile mapping. Do not derive a total, percentage, fit, gap, or completion value.

- [ ] **Step 3: Write browser RED tests for the event bridge and state independence**

Require all of the following:

1. Applying each profile leaves all 28 framework nodes and all 54 entity links in server HTML.
2. Collapsed entity containers show exact `核心 / 重要 / 建议了解` counts for the active profile.
3. Method and Topic nodes never receive role attributes.
4. A Career summary focus button expands the target Capability's framework container, selects the Capability, opens the inspector, focuses the visible relation button, and brings it into view immediately.
5. Focusing a second Capability closes the old expansion.
6. Clearing the Career Lens removes only role projection and count labels; the current map expansion/selection and local progress value remain unchanged.
7. no-JavaScript disables Career apply/focus controls with explanations while preserving all links and the full outline.

Run:

```bash
npm run build
CI=1 npx playwright test tests/e2e/career-lenses.spec.ts tests/e2e/profile-progress.spec.ts --project=chromium --project=mobile-chromium
```

Expected: FAIL because the current Career script directly searches/focuses map DOM and has no EGDS container counts.

- [ ] **Step 4: Replace direct map mutation with the public event contract**

Keep Career button, evidence, summary, and status ownership in `CareerExplorer`. Replace direct `careerNodes` mutation and direct target lookup with dispatches to the map root:

```ts
mapRoot.dispatchEvent(new CustomEvent('egds-map:apply-career-lens', {
  detail: projection,
}));

mapRoot.dispatchEvent(new CustomEvent('egds-map:focus-capability', {
  detail: { capabilityId },
}));

mapRoot.dispatchEvent(new CustomEvent('egds-map:clear-career-lens'));
```

Pass `egdsFrameworkNodes` and `egdsFrameworkRelations` to `CapabilityMap`. Preserve evidence disclosures, resource counts, profile titles, basis links, reviewed dates, and localStorage independence.

- [ ] **Step 5: Run Career and map regression tests**

Run:

```bash
npm test -- tests/lib/career-lens.test.ts
npm run build
CI=1 npx playwright test tests/e2e/career-lenses.spec.ts tests/e2e/profile-progress.spec.ts tests/e2e/map-v02.spec.ts --project=chromium --project=mobile-chromium
```

Expected: all tests pass; the projection contains no score-like key or visible copy.

- [ ] **Step 6: Commit the Career bridge**

```bash
git add src/lib/career-lens.ts src/components/CareerExplorer.astro src/pages/careers/index.astro tests/lib/career-lens.test.ts tests/e2e/career-lenses.spec.ts tests/e2e/profile-progress.spec.ts
git commit -m "feat: project career lenses onto EGDS"
```

### Task 6: Retire Domains and generic map groups completely

**Owner:** Sol / high reasoning. This is the only destructive catalog cleanup task.

**Files:**
- Delete: `src/data/domains.json`
- Delete: `src/data/map-groups.json`
- Modify: `src/data/capabilities.json`
- Modify: `src/data/knowledge-topics.json`
- Modify: `src/content.config.ts`
- Modify: `src/lib/catalog/load.ts`
- Modify: `src/lib/catalog/validate.ts`
- Modify: `src/lib/map-geometry.ts`
- Modify: `tests/lib/catalog-data.test.ts`
- Modify: `tests/lib/catalog-validate.test.ts`
- Modify: `tests/lib/map-geometry.test.ts`
- Modify: `tests/e2e/visible-skeleton.spec.ts`

- [ ] **Step 1: Write a repository-level RED contract for legacy removal**

Add unit assertions that `Catalog` and raw entries have no `domains`, `mapGroups`, `domainId`, `position`, `MapBounds`, or legacy mind-map exports. Add a shell gate to the plan execution log:

```bash
rg -n "catalog\.domains|catalog\.mapGroups|domainId|mapGroups|domains\.json|map-groups\.json|map-region|buildCapabilityMindMapLayout" src tests
```

Expected before cleanup: the command prints legacy references and the new unit contract fails.

- [ ] **Step 2: Remove the legacy schema and data**

Delete the two JSON files. Remove `domains` and `mapGroups` from:

- Astro content collection exports;
- `Catalog`;
- `productCollections`;
- raw catalog test collections;
- `collectionNames`;
- all Domain/map-group validator codes and validation loops.

Remove `domainId` and `position` from every Capability and Knowledge Topic JSON object and schema/type. Delete legacy bounds/anchor geometry and tests. Keep `frameworkNodeId` required.

- [ ] **Step 3: Prove all public consumers use EGDS only**

Run:

```bash
rg -n "catalog\.domains|catalog\.mapGroups|domainId|mapGroups|domains\.json|map-groups\.json|map-region|buildCapabilityMindMapLayout" src tests
```

Expected: exit 1 with no output. Do not weaken this by adding compatibility aliases or hidden legacy collections.

- [ ] **Step 4: Run the complete build and E2E gate**

Run:

```bash
npm run check
npm test
npm run build
CI=1 npm run test:e2e
git diff --check
```

Expected: 0 diagnostics, 0 unit failures, 0 build failures, 0 unexpected Playwright failures, and no whitespace errors.

- [ ] **Step 5: Commit the retirement**

```bash
git add src/data/domains.json src/data/map-groups.json src/data/capabilities.json src/data/knowledge-topics.json src/content.config.ts src/lib/catalog/load.ts src/lib/catalog/validate.ts src/lib/map-geometry.ts tests/lib/catalog-data.test.ts tests/lib/catalog-validate.test.ts tests/lib/map-geometry.test.ts tests/e2e/visible-skeleton.spec.ts
git commit -m "refactor: retire the generic map ontology"
```

### Task 7: Root-agent adversarial acceptance, continuity, and milestone commit

**Owner:** Root lead / high reasoning. Do not delegate the final judgment.

**Files:**
- Modify: `README.md`
- Modify: `ROADMAP.md`
- Modify: `CHANGELOG.md`
- Modify: `docs/journal/2026-08-09-learn-about-games-v02-decision-summary.md`
- Modify: `docs/journal/2026-08-09-learn-about-games-v02-transcript.md`
- Modify: `AGENTS.md`
- Modify: `CLAUDE.md`
- Modify only if a proven current-scope defect exists: implementation files from Tasks 1–6

- [ ] **Step 1: Review every task commit against the approved design**

Check the diff from the pre-EGDS implementation base to HEAD and answer with evidence:

1. Is the author statement visible and truthful?
2. Are method nodes, capabilities, and topics distinguishable without color?
3. Does default desktop show the complete EGDS skeleton in one screen-height region?
4. Is only one leaf container expanded at a time?
5. Are the 64 capability relations hidden by default and direct-only on selection?
6. Does normal wheel always move the page rather than a nested vertical map scroller?
7. Do Career Lens and progress remain separate and score-free?
8. Are all 42/12/64 entities and relations reachable with and without JavaScript?
9. Are Domains/mapGroups absent from runtime, public copy, tests, and catalog types?
10. Are Private repository and disabled Pages workflow facts unchanged?

- [ ] **Step 2: Run the fresh final gate**

Run exactly:

```bash
npm run check
npm test
npm run build
CI=1 npm run test:e2e
git diff --check
```

Then run a filename-only secret scan without printing matched values:

```bash
rg -l --hidden -g '!node_modules/**' -g '!.git/**' -g '!dist/**' '(api[_-]?key|secret|token|password|private[_-]?key)' .
```

Expected: the first five commands succeed; the secret scan returns no newly changed file requiring investigation.

- [ ] **Step 3: Perform the final visual and behavior matrix**

Use fresh preview output and inspect original-resolution screenshots for Map and Careers at:

- 1440 × 900 Light and Dark: default, one expansion, one selected relation, each Career Lens, clear;
- 1024 Light: EGDS outline and Career Lens;
- 320 × 900 Light and Dark: outline, Career Lens, no-JavaScript;
- 1440 no-JavaScript: native EGDS outline expanded.

Probe exact computed/runtime facts:

- page and body `scrollWidth === clientWidth`;
- default scene height `<= 720`;
- zero visible box overlaps;
- no structure/process path intersects an unrelated node;
- minimum computed font sizes meet the design contract;
- normal wheel over three map target types increases page Y;
- no visible method/topic node has Career attributes;
- clearing Career keeps expansion/selection and localStorage progress;
- server DOM counts are 28 framework nodes, 42 capabilities, 12 topics, 64 capability relations.

- [ ] **Step 4: Update continuity truthfully**

Record:

- current state and exact commit range;
- why generic groups were retired;
- EGDS entity/relation/state semantics;
- RED/GREEN evidence and screenshot paths;
- scroll-trap root cause and minimal fix;
- any unresolved content gaps such as empty `mindset-problem-solving-tools`;
- exact next independent slices: resource density/media encoding, Atlas engaged wheel mode, early-history ontology/publication.

The transcript must be labeled partial if the full chat export is unavailable. Do not claim deployment or publication; the repository remains Private and this branch is not pushed unless the user separately asks.

- [ ] **Step 5: Commit the milestone documentation**

```bash
git add README.md ROADMAP.md CHANGELOG.md AGENTS.md CLAUDE.md docs/journal/2026-08-09-learn-about-games-v02-decision-summary.md docs/journal/2026-08-09-learn-about-games-v02-transcript.md
git commit -m "docs: record the EGDS map milestone"
```

## Execution handoff

Recommended execution is **Subagent-Driven** with the dependency waves above. The root lead reviews the diff and fresh verification after every task; Task 7 remains a root-only adversarial gate. Do not run Tasks 1–6 concurrently in one shared worktree unless their file ownership is disjoint exactly as specified.
