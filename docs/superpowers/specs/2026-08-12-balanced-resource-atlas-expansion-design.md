# Balanced Resource and Atlas Expansion Design

## Goal

Continue expanding Learn About Games in two independent evidence layers:

1. add useful learning resources from verifiable first-party or authorial sources;
2. add evidence-backed Shooter and Strategy lineages to Innovation Atlas.

“Balanced” describes search priority, not a quota. The project wants broad eventual coverage. A strong source is not excluded because another topic currently has fewer entries, and a weak source is not included merely to make category counts look similar.

## User decision

The user approved a balanced batch with one correction: final coverage matters more than equal category sizes. Research may begin with thin topics and empty Genre Families, but every candidate that meets the evidence contract may enter the batch regardless of whether its category is already comparatively large.

## Scope decomposition

The work is split into two separately reviewable slices.

### Slice A: learning resources

Start discovery from the thinnest current topics: practitioner interviews and podcasts, design fundamentals, game feel and feedback, and prototyping and experimentation. Continue accepting strong items in other topics when the same first-party source collection reveals them.

Preferred sources are official conference session pages, university course pages, publisher or institutional records, and pages published by the practitioner or author. English is the primary expansion language; verified Chinese access versions or original Chinese items remain welcome. Existing GDC Vault, Lost Garden, How To Market A Game, Game Developer and author archives may be extended, but canonical URLs must be deduplicated against the full catalog.

The batch has no per-topic quota. It uses a bounded research pass so the change remains reviewable: review a defined set of source collections, record every included and excluded candidate, then stop when the chosen collections have been exhausted or remaining candidates cannot be verified. Expected batch size is approximately 20–35 Work Items, but evidence quality may produce fewer or more.

Each Work Item must:

- represent one identifiable work rather than a platform search page or channel homepage;
- have one primary Resource Topic;
- preserve original language, media type, canonical URL and dated Access Version facts;
- map only to capabilities or knowledge topics directly supported by the work’s stated subject;
- avoid ratings, rankings, inferred quality scores and unverified regional availability;
- pass normalized URL ownership and catalog reference validation.

### Slice B: Innovation Atlas

Add two new evidence themes:

- Shooter lineage, attached to the existing Shooter Genre Family;
- Strategy lineage, attached to the existing Strategy Genre Family.

Genre Families remain broad, non-exclusive navigation. A theme is a selective evidence lens, not a complete taxonomy and not proof that every highlighted work belongs exclusively to that genre.

Research begins with historically influential works and documented transitions. Candidate nodes may include games, innovations and category formations already supported by reliable sources. A relation is added only when a developer statement, participant history, institutional archive, contemporary documentation or strong historical source supports the bounded claim. Similar mechanics, shared labels, chronological adjacency and retrospective fan consensus do not create a relation by themselves.

Every new Atlas entity must preserve:

- unique IDs, valid dates and complete tag references;
- relation endpoint closure and explicit directionality;
- one or more Evidence references for every node and relation claim;
- complete provenance metadata, including original title, language, source kind, author or institution, checked date, locator and bounded claim;
- stable global layout without hiding, moving or reclassifying existing nodes when a lens changes.

## Research workflow

Use Agent Reach for discovery and page retrieval. Run `agent-reach doctor --json` before research. Use Exa for discovery while available and Jina Reader for page-level verification. If a backend returns a quota or access error, follow its documented stop or fallback path and record the limitation instead of repeatedly retrying.

Maintain the research notebook as the audit layer. For each candidate, record the canonical page, source owner, evidence boundary, intended mappings and inclusion or exclusion reason. Search snippets alone are not evidence.

## Product behavior

This batch is content-first. It does not redesign Resources or Atlas UI. Existing topic tables, filters, Family directory, theme controls, map mode, search, no-JavaScript outlines and base-path behavior must continue working as counts grow.

The Resources page must derive counts from catalog data. Atlas controls must derive Family and theme contents from data and must not add disabled pseudo-links for empty or cross-listed themes.

## Testing and verification

Use TDD for catalog totals, exact new canonical URLs, language and media distributions, source ownership and new theme IDs. Atlas tests must lock node, relation and Evidence closure, exact theme membership and the absence of unsupported shortcut edges.

Required gates:

- targeted resource and Atlas unit tests;
- Astro check with zero diagnostics;
- full Vitest suite;
- fresh static build;
- Resources and Atlas Playwright tests at desktop and mobile widths;
- no-JavaScript reachability and horizontal-overflow probes;
- full Playwright suite;
- diff, secret-pattern and research-notebook consistency checks.

## Non-goals

- equalizing topic, language, media or Genre Family counts;
- bulk-importing hundreds of unreviewed conference or creator links;
- treating a YouTube channel, conference archive or search result as one Work Item;
- claiming complete genre history after one lineage batch;
- generating influence edges from similarity or date order;
- changing repository visibility, pushing, restoring GitHub Pages or adding analytics.
