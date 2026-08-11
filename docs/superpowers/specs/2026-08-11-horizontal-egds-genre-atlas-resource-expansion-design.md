# Horizontal EGDS, Genre Atlas and Resource Expansion Design

Date: 2026-08-11

## Problem

The current EGDS desktop scene still mixes several reading directions. Root-to-branch containment moves left to right, ordinary branch children sit to the right but connect through their top edges, the authored Experience process moves left to right, its design levers fold downward, and expanded entities are appended below the overview. Alignment has improved, but one axis no longer has one stable meaning.

The learning-resource catalog has reached 174 Work Items, 38 Sources and 188 Access Versions. Coverage is useful but still English-heavy, while talks account for 69 items and should not keep growing merely to increase the total.

Innovation Atlas currently contains an early-electronic-games foundation and two evidence lenses, Roguelike and Metroidvania. It does not yet give readers a common genre directory or a bounded path for extending the histories of familiar genres.

## Design read

This is a preserve-redesign of an authorial knowledge product for readers learning how game experiences are designed and how game forms change over time. EGDS remains the authored framework; the resource directory remains evidence-led rather than ranked; Atlas remains one global network rather than a set of isolated genre charts.

- `DESIGN_VARIANCE: 4`
- `MOTION_INTENSITY: 2`
- `VISUAL_DENSITY: 9`

Text and geometry must carry the meaning. Color may reinforce hierarchy or emphasis, but may not be the only encoding.

## 1. One-direction EGDS hierarchy

### 1.1 Semantic rule

Every containment relationship in the desktop EGDS scene advances from left to right:

- the root is left of every primary branch;
- every primary branch is left of its framework children;
- every process stage is left of its successor;
- Reconstruction is left of each design lever;
- an expanded Capability or Knowledge Topic region is right of its owning framework node.

Vertical position is used only to separate siblings, establish branch lanes and avoid collisions. It does not encode greater depth, sequence, importance or ownership.

Containment paths always leave the east port of the parent and enter the west port of the child. They may use vertical avoidance segments, but no horizontal segment may travel west. The directional Experience process uses its own accented arrow treatment. `supports` and `complements` remain semantic relations rather than hierarchy and are not reversed merely to make the drawing uniform.

### 1.2 Overview and focus states

The default overview remains compact enough to show the EGDS root, all five primary branches and all 28 framework nodes in one desktop scene. Siblings may occupy multiple rows inside one branch lane, but every parent still stays completely to their left. Equal visual treatment and a shared branch lane communicate sibling status; horizontal staggering must not imply a false process sequence.

Selecting a framework node enters a deterministic branch-focus state instead of appending a second map below the overview:

- the root and all five primary branch headers remain visible;
- the selected branch ancestry remains fully visible;
- non-selected branches keep their headers, counts and Career Lens facts, while their deep descendants are visually de-emphasized or temporarily omitted from the scene;
- the selected owner, its expanded entities and direct semantic relations use the space to its right;
- “return to overview” restores the exact overview geometry and focus.

The focus state does not introduce a second independent map or an internal vertical scroller. Scene height may grow naturally for a high-density entity group, but the page retains ordinary wheel scrolling.

### 1.3 Geometry invariants

For each containment edge:

```text
child.x >= parent.x + parent.width + structuralGap
fromPort = east
toPort = west
```

Additional invariants:

- raw ID plus explicit numeric order provides a locale-independent total order;
- reversing any input array does not change node coordinates, path geometry or DOM order;
- boxes do not collide and structural paths do not cross unrelated boxes or reuse their borders;
- scene width, scene height, both SVG dimensions and both SVG `viewBox` values update together;
- root, branch, framework child, process and semantic relation retain distinct line/shape semantics in Light and Dark;
- the background grid remains lower contrast than the weakest structural connector;
- no animation is added to disguise re-layout.

The framework data remains the sole semantic source. Coordinates are derived in the geometry helper and are not written into catalog JSON.

### 1.4 Responsive and no-JavaScript behavior

At the existing responsive threshold, the fixed desktop scene is replaced by the complete native hierarchical outline. The outline is not a squeezed horizontal diagram and may use vertical document flow.

Without JavaScript:

- all 28 framework nodes, 42 Capabilities, 12 Knowledge Topics, 64 relations and 54 detail links remain server rendered;
- native disclosures may be opened independently;
- relation actions remain disabled with an explanation;
- no content depends on a generated client-side tree.

## 2. Bounded resource expansion

### 2.1 Current baseline

- 174 Work Items
- 38 Sources
- 188 Access Versions
- original languages: English 147, Simplified Chinese 18, Japanese 9
- media: talk 69, book 29, paper 17, course 16, website 15, article 12, podcast 11, video 5

This is a coverage inventory, not a quality score or completeness claim.

### 2.2 Next batch

The next batch contains 8 to 10 Work Items. Selection order is:

1. original Chinese or official Chinese versions;
2. English material that fills a verified content gap;
3. already-vetted Japanese material only when relevant, without prioritizing new Japanese discovery;
4. courses, papers, author articles and durable websites before talks;
5. the lowest-coverage Resource Topics, Capabilities and Knowledge Topics.

Priority gaps include prototyping and experimentation, creative leadership, monetization and experience alignment, aesthetic direction, choice and consequence, encounter-space composition and navigation/wayfinding.

At most three entries in this batch may come from one Source. At most two may be Chinese conference-talk transcripts. A transcript remains `talk` even when its page contains a complete written record; it is not relabeled as an article to improve the media distribution.

Every new Work Item must have:

- one canonical identity and exactly one primary Resource Topic;
- Source homepage and Work Item URL separation;
- honest media type, original language, access model and checked date;
- at least one useful Capability or Knowledge Topic relation supported by the source content;
- translated or subtitled access represented as another Access Version of the same Work Item;
- inclusion, exclusion and unresolved identity notes in the research notebook.

No score, ranking, badge, required reading order or unverifiable recommendation is added.

## 3. Two-level genre navigation for Innovation Atlas

### 3.1 Family and lineage are different entities

Atlas gains two navigation levels:

- **Genre Family** is a familiar, broad entry point for readers.
- **Evidence Lineage** is a bounded research lens composed of reusable nodes, relationships and Evidence.

Neither is an exclusive classification. One Theme may belong to more than one Family, and one game may participate in multiple lineages. Mechanics, perspective, subject matter, business model, platform and production context remain non-exclusive tags rather than being collapsed into genre.

The first Family directory is:

1. Action
2. Shooter
3. Adventure
4. Role-playing
5. Strategy
6. Simulation and Management
7. Sports and Racing
8. Puzzle
9. Sandbox and Survival
10. Rhythm and Party

“Early electronic games and commercialization” remains a foundation lens, not a genre family.

### 3.2 Lineage rollout

Existing lenses remain:

- Early electronic games and commercialization
- Roguelike and run-based translation
- Metroidvania and exploration-platform structures

New histories are added in evidence-sized batches, never as one speculative mass import:

1. Platform and jumping-game lineage
2. Parser adventure to graphical adventure
3. One-on-one fighting
4. Survival horror and category formation
5. First-person shooter
6. Real-time strategy
7. Early CRPG and Japanese console RPG
8. Falling-block puzzle dissemination

Simulation, racing, stealth action, sandbox and survival-crafting are listed in the Family directory but remain later research batches until their relationship evidence is ready.

Each implementation batch contains no more than two new lineages and roughly 8 to 14 deduplicated nodes. Platform plus Adventure is the first content batch because its institutional and participant-history evidence is currently strongest. Fighting plus Survival Horror follows; FPS plus RTS follows; RPG plus Falling-block Puzzle is last because identity and “origin” disputes are more complex.

### 3.3 Evidence and language rules

Atlas does not infer a relationship from date proximity, store tags, structural similarity or membership in the same family.

- every node has at least one Evidence item;
- every relation has Evidence that supports that specific relationship;
- confirmed direct influence requires participant testimony, a documented code/version lineage or comparably direct evidence;
- museum and institutional histories normally support node facts or `credible` relations unless they explicitly document influence;
- structural comparisons remain undirected;
- disputed directions include a public directionality note;
- cross-lineage works reuse one node rather than being duplicated;
- every lens publishes its scope, exclusions, disputes and what it does not claim.

Claims such as “first video game,” “first platformer,” “invented the genre,” “Rogue was the first roguelike” or “Metroid was the first Metroidvania” are prohibited unless the definition, geographic/platform boundary and archival limitation are stated in the bounded claim.

### 3.4 Schema and interaction

The minimal model adds a Genre Family directory and lets each Atlas Theme reference one or more Family IDs plus a scope note. Nodes do not receive a single `genreId`.

The Atlas interface groups lens controls by Family while retaining one theme-state owner. Selecting a lens changes emphasis only:

- it never hides or repositions nodes or relations;
- it preserves pan, scale, search query and map mode;
- all nodes, relations and Evidence remain reachable;
- no-JavaScript output remains complete;
- switching lenses in full-screen uses the same control set rather than a duplicate toolbar.

## 4. Adversarial review

Known failure modes and defenses:

- **False sequence among siblings:** same-shape siblings share a branch lane and lack process arrows; only authored process relations use arrows.
- **Compactness destroying legibility:** do not compress type or name text below the existing verified floors merely to retain a 720px scene.
- **Focus hiding important material:** all five branch headers, counts and Career facts remain visible; only non-selected deep descendants may be temporarily omitted.
- **Semantic relations rewritten for neatness:** supports/complements keep their actual meaning and direction.
- **Genre taxonomy pretending to be objective:** Families are navigation labels, not exclusive ontological truth or popularity rankings.
- **Chronology masquerading as influence:** unproven temporal neighbors remain unconnected.
- **Content count masquerading as quality:** resource and Atlas additions are bounded by evidence and coverage, not round-number targets.
- **Talk-heavy or single-source catalog growth:** batch quotas prevent another concentration spike.
- **Dynamic scene drift:** browser tests compare HTML node bounds, SVG endpoints and synchronized viewBoxes after overview, focus and return transitions.

## 5. Acceptance

### EGDS

- every containment child is completely right of its parent;
- every containment path is east-to-west and has no westward horizontal segment;
- Experience stages and design levers form one continuous left-to-right authored path;
- default overview exposes all 28 framework nodes without collision;
- focus state places expanded entities right of their owner and preserves the five branch headers;
- returning restores exact overview geometry and focus;
- 1440px Light/Dark, responsive outline and no-JavaScript contracts pass with no page overflow.

### Resources

- 8 to 10 additions follow the language, medium, Source and evidence quotas;
- canonical URLs, Source/Work separation, one-topic, references and access-version merging pass raw validation;
- the research notebook records actual search backends, checked dates, inclusions and exclusions;
- grouped tables, filters, URL history and no-JavaScript output continue to work.

### Atlas

- ten Genre Families are available as navigation and are not written as exclusive node ownership;
- existing three lenses remain valid and map to zero or more Families as designed;
- the first new batch adds no more than two lineages and validates every node/relation Evidence closure;
- theme switching changes emphasis only and preserves full-screen viewport, search and geometry;
- desktop has zero node collision and boundary-correct relation endpoints;
- the complete responsive/no-JavaScript outline remains equivalent.

### Repository

- fresh Astro check, unit suite, static build and full Playwright suite pass;
- the decision summary, sanitized transcript, roadmap, changelog and public devlog describe the implemented milestone honestly;
- the repository remains private, Pages remains disabled, and nothing is pushed or deployed;
- the local preview is refreshed at `/Learn-About-Games/` for user review.
