# EGDS Hierarchy, Atlas Lenses and Resource Expansion Design

Date: 2026-08-11

## Problem

The current EGDS scene is geometrically aligned, but alignment alone does not explain ownership. Root, primary branches, process stages, design levers and capability groups still use similar open-box geometry and similar connector weight. The background grid competes with those connectors, so the viewer must infer parent and child relationships from line tracing.

Innovation Atlas now has a true full-screen map mode, but its evidence-lens controls remain outside the full-screen workspace. Entering the mode therefore removes an important exploration action.

The resource catalog has grown to 148 Work Items and is now grouped and filterable, but it is not complete. The next content slice should improve language, medium and capability coverage without turning quantity into a quality score.

## Design read

This is a preserve-redesign of a dense authorial knowledge map for beginners and working game designers. It keeps EGDS content, entity URLs, native Astro rendering, the current neutral palette, compact cartographic language and complete no-JavaScript outline.

- `DESIGN_VARIANCE: 4`
- `MOTION_INTENSITY: 2`
- `VISUAL_DENSITY: 9`

The scene should resemble a readable annotated framework, not a dashboard, card grid or decorative network.

## 1. EGDS hierarchy grammar

The semantic hierarchy remains unchanged:

1. EGDS root;
2. five primary branches;
3. framework children such as process stages, design levers and capability groups;
4. expandable Capability and Knowledge Topic entities;
5. direct semantic relations shown only during focus.

The desktop scene adds five subtle branch territories derived from existing layout geometry. A territory is a background lane and local connector field, not a new catalog entity and not a clickable card. Each territory contains the visual bounds of its branch descendants.

Visual encodings have one meaning each:

- root: highest-contrast solid block and strongest trunk;
- primary branch: filled header attached to one low-contrast territory lane;
- process stage: open node with process label;
- design lever: stronger accent edge than a process stage, without sharing the branch fill;
- capability group: neutral open node;
- root-to-branch connector: strongest structural line;
- branch-to-child connector: medium structural line;
- process sequence: directional/accented line;
- capability semantic relation: remains a separate focus-only relation layer;
- background grid: orientation aid only, lower contrast than every structural connector.

The five territory lanes may alternate only a very small neutral tint or edge treatment. They do not introduce five arbitrary category colors, scores or importance rankings.

The Experience Design branch keeps its deeper authored sequence: journey entry, Feeling to Understanding to Deconstruction to Reconstruction, then the three design levers. Its nesting is communicated by a local sub-lane and directional process line, not by changing the underlying EGDS hierarchy.

Responsive and no-JavaScript presentations remain native hierarchical outlines. The territory treatment applies only to the desktop fixed scene.

## 2. Atlas full-screen evidence lenses

The full-screen map workspace includes the same evidence-lens controls available in the page view. At minimum this preserves All Network, Roguelike and Metroidvania; labels are derived from the catalog rather than duplicated strings.

Selecting a lens while full-screen:

- changes emphasis only;
- does not exit map mode;
- does not alter scale, pan, node positions, relation order or search query;
- leaves all nodes, relations and Evidence reachable;
- remains keyboard accessible and announces the selected state.

There is one logical control set and one theme state owner. The implementation must not create duplicate accessible buttons, duplicate IDs or independent listeners that can drift.

At widths where the canvas is replaced by the complete period outline, full-screen controls remain hidden. Without JavaScript, disabled controls and the complete network/outline remain honest and readable.

## 3. Next bounded resource expansion

The current 148 Work Items are a verified milestone, not a completeness claim. Add a second bounded batch of 15 to 25 Work Items, chosen by evidence and coverage gaps rather than a round target.

Priorities:

1. Chinese and Japanese original or officially translated material;
2. courses, papers, articles and durable websites, because talks remain over-represented;
3. the lowest-coverage Resource Topics and Capability IDs after the current batch;
4. first-party developer material, institutional research, established publishers and author-owned canonical pages.

Every included Work Item must have one canonical identity, exactly one primary Resource Topic, honest media/language/access facts and at least one useful Capability or Knowledge Topic relation. A translated or subtitled version remains an Access Version of the same Work Item.

The research notebook records inclusion evidence, exclusions, unresolved identity questions, checked dates and the search backend. The site adds no score, rank, editorial tier or prescribed learning order.

## Acceptance

- Five desktop branch territories are derived from layout geometry and contain their descendants.
- Root, branch, child and process lines have measurably distinct visual weights in Light and Dark.
- The background grid has lower contrast than structural lines.
- Existing 28 framework nodes, 42 Capabilities, 12 Knowledge Topics and 64 relations remain unchanged.
- All supported expansions preserve zero box/label collision and declared path endpoints.
- Atlas full-screen exposes the evidence lenses without changing viewport geometry or leaving map mode.
- Atlas mobile/no-JavaScript outline contracts remain unchanged.
- Resource additions pass canonical, Source/Work Item separation, one-topic and reference-closure validation.
- Fresh check, unit, static build and full Playwright suite pass.
- Visual verification covers 1440px Light/Dark for the EGDS default and expanded scenes, Atlas full-screen with two lenses, and 1024px/320px outline regressions.

This work does not push, deploy, make the repository public, enable Pages, add scores or replace EGDS content.
