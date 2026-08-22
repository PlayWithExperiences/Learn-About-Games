# Learn About Games Integrated Exploration Refinement

- Date: 2026-08-11
- Status: approved for direct implementation
- Scope: Expertise Map and Career Lens consolidation, grouped Learning Resources table, Innovation Atlas map mode, and an evidence-backed early electronic-game history slice
- Parent specifications:
  - `2026-08-09-egds-expertise-map-design.md`
  - `2026-08-09-private-refinement-design.md`
  - `2026-08-09-learn-about-games-v02-design.md`
- Implementation plans:
  - `../plans/2026-08-11-map-career-consolidation-plan.md`
  - `../plans/2026-08-11-grouped-resources-table-plan.md`
  - `../plans/2026-08-11-atlas-map-mode-plan.md`
  - `../plans/2026-08-11-atlas-early-history-plan.md`

## 1. Problem

The current local candidate is materially closer to the intended product, but four usability problems remain:

1. The Expertise Map and Career page both render the full EGDS map. Career is a viewing state of the map, not a separate primary task.
2. The Resources page places 20 Sources and 128 Work Items in one document. The resulting page is about 21,476 CSS pixels tall at 1440px and about 44,755 CSS pixels tall at 320px.
3. Innovation Atlas zoom advances in fixed 25% steps for every modified-wheel event and anchors at the viewport center. Touchpad bursts therefore feel discontinuous and the point under the pointer drifts.
4. Atlas history starts in the 1980s. The project lacks a carefully qualified early electronic-game history line leading to Pong and its commercial aftermath.

This refinement changes information architecture and interaction ownership. It does not introduce scoring, a prescribed learning path, a second career tree, or speculative historical causality.

## 2. Design read

This is a preserve-redesign of a dense public knowledge product for beginners and working game designers. It keeps the established editorial and cartographic language, native Astro rendering, CSS-variable themes, stable entity URLs, and no-JavaScript access.

- `DESIGN_VARIANCE: 5`
- `MOTION_INTENSITY: 3`
- `VISUAL_DENSITY: 9`

The map may express an authorial structure, but motion remains functional and resources remain compact. No new frontend framework, animation library, canvas renderer, or force-directed graph is introduced.

## 3. Information architecture

Primary navigation becomes:

1. 能力地图
2. 成长资源
3. 创新变迁
4. 关于本项目

职业方向 is removed as a primary navigation item because Career Lens is a state of the Expertise Map. The existing `/careers/` route remains a compatibility entry and leads to `/map/#career-lenses` without breaking old links.

Resources contains two link-based sub-navigation entries:

1. 资源表
2. 来源

They are real static routes or route-level views, not ARIA tabs that require JavaScript. Browser reload, history, base paths, and no-JavaScript navigation must continue to work.

## 4. Expertise Map and Career Lens consolidation

### 4.1 Single map ownership

`CapabilityMap` remains the only owner of:

- expanded EGDS framework node;
- selected Capability or Knowledge Topic;
- visible direct relations;
- responsive outline disclosure state;
- focus and return behavior.

Career controls dispatch the existing public map events. They do not query or mutate map nodes directly.

### 4.2 Career controls

The map page adds a section with anchor `#career-lenses` above the map canvas. It contains:

- `AAA · Game Designer`;
- `AAA · Creative Director`;
- `Indie · Solo Developer`;
- a clear action;
- one live status sentence.

The controls are compact segmented buttons or text tabs outside the map canvas. They do not appear beside individual nodes in the default map.

Selecting a profile:

- adds core, important, and suggested emphasis only to Capability nodes;
- updates collapsed EGDS branch counts;
- leaves EGDS Framework Nodes and Knowledge Topics without role attributes;
- does not change node positions;
- does not change personal practice data;
- does not compute fit, gaps, completion, or a score.

### 4.3 Evidence and profile summaries

The selected profile reveals one compact native disclosure beside the controls. It preserves:

- basis;
- caveat;
- reviewed date;
- basis links and source notes;
- grouped Capability mappings, responsibility, and related Work Item counts;
- links to Capability details and filtered Resources.

Focus actions expand only the required EGDS branch and place the target in view. They must not create a large page jump caused by expanding a long summary above the map.

Without JavaScript, all three profile summaries and evidence remain readable through native disclosures. Apply, focus, and clear controls stay disabled and explain why.

### 4.4 Map alignment and scrolling

The default 1180px desktop scene is rebalanced so that the root, five primary branches, and reading direction occupy the available canvas with intentional margins. Layout positions remain deterministic and relationship paths remain derived from the same geometry helper.

Expanding a leaf adds local vertical space to that branch. It must not shift unrelated trunks horizontally or create a second vertical scroll container. Ordinary wheel input continues to scroll the page.

Responsive outlines remain the complete equivalent presentation at widths where the fixed scene cannot fit.

## 5. Grouped Learning Resources table

### 5.1 One resource, one group

The 15 Resource Topics define 15 collapsible subtables. Every Work Item must appear in exactly one Resource Topic subtable. Build-time validation fails if a Work Item has zero or multiple primary Resource Topic assignments.

The grouped table renders all 128 current Work Items once. It does not duplicate rows to create a separate full-table DOM.

### 5.2 Expand behavior

The Resources page defaults to 15 collapsed native disclosures. Each summary shows:

- topic title;
- short summary;
- total Work Item count;
- current matching count when filters are active.

Users can:

- open one or several topic subtables;
- choose 展开全表 to open all topic disclosures;
- choose 全部收起 to close all topic disclosures.

Opening all subtables is the full resource table. Opening one disclosure is a subtable. The state is presentational and does not reorder catalog data.

### 5.3 Filters and rows

A single control area above the grouped table retains the seven factual filters:

- Resource Topic;
- Knowledge Topic;
- Capability;
- Source;
- media type;
- consumable language;
- access model.

Filtering uses AND semantics and retains catalog order. No external observation participates in ranking or sorting. Groups with zero matches are hidden in the enhanced state; groups with matches show their count. The empty state preserves active filters and explains how to broaden them.

Each collapsed Work Item row keeps only the scanning facts:

- title;
- Source;
- media type;
- original and consumable language;
- access model and canonical access action.

Why-relevant text, Access Versions, checked dates, region facts, and External Observations remain available in a native row disclosure.

At narrow widths the same row becomes a compact vertical record. The design does not force a wide horizontal table into 320px.

### 5.4 Source directory and no-JavaScript behavior

Source is a separate static directory entry because Source and Work Item are different entities. The existing 20 Source detail pages remain unchanged.

Without JavaScript:

- each Resource Topic disclosure can be opened natively;
- all 128 Work Items remain reachable exactly once;
- filter controls and expand-all controls are disabled and explained;
- Source navigation remains a normal link.

## 6. Innovation Atlas map mode

### 6.1 Input ownership

Atlas gains an explicit 进入地图模式 control. Outside map mode, ordinary wheel input scrolls the page. Inside map mode:

- ordinary wheel continuously zooms around the pointer position;
- dragging blank canvas pans the scroll viewport;
- `Esc` and 退出地图模式 return wheel ownership to the page;
- interactive targets never start a drag;
- buttons retain bounded, deterministic zoom steps;
- fit and reset retain their current meanings.

The active state is visibly and programmatically announced. At scale limits, wheel input does not trap the user indefinitely.

### 6.2 Smooth zoom pipeline

Wheel delta maps to a continuous target scale within 50%-200%. A burst of wheel events is merged so scale, stage size, and scroll correction are committed at most once per animation frame.

Pointer anchoring preserves the logical point under the pointer. Button zoom may continue to use viewport-center anchoring. Drag updates are also frame-batched.

The viewport scroll position remains the single pan state. The implementation does not introduce a separate camera state, Canvas, WebGL, or a third-party graph library.

`prefers-reduced-motion` disables visual interpolation but retains correct frame-batched input and pointer anchoring.

### 6.3 Responsive and no-JavaScript behavior

The existing complete period outline remains the primary mobile and intermediate-width presentation. Map-mode controls are hidden where the desktop canvas is hidden.

Without JavaScript, view controls remain disabled and the network, period outline, details, relations, and Evidence index remain readable.

## 7. Early electronic-game history slice

### 7.1 Scope

The first added slice covers:

- Tennis for Two;
- Spacewar!;
- Brown Box / TV Game Unit #7;
- Galaxy Game;
- Computer Space;
- Magnavox Odyssey;
- Odyssey Table Tennis;
- Pong;
- Home Pong;
- an early arcade and home-commercialization formation node when supported by evidence.

The slice fills the 1950s-1970s gap. It does not attempt to complete all video-game history in one change.

### 7.2 Entity types

The Atlas ontology must be able to distinguish at least:

- experimental apparatus;
- experimental program;
- system prototype;
- commercial hardware;
- game;
- innovation;
- category or commercialization formation.

Different kinds require explainable visual shapes and text labels. A hardware platform and a specific game cannot share one ambiguous node.

### 7.3 Relation boundaries

Only narrow claims supported by the attached Evidence are allowed. Initial candidates include:

- `Spacewar! → Galaxy Game` as a reimplementation or derived commercial installation;
- `Spacewar! → Computer Space` as documented commercial motivation;
- `Brown Box → Magnavox Odyssey` as prototype-to-product;
- `Odyssey Table Tennis → Pong` as documented direct inspiration;
- `Pong → Home Pong` as a commercial home derivation.

The relation taxonomy may add explicit `prototype-to-product`, `commercialized-as`, or `design-response` types when current relation types cannot express the evidence honestly.

The slice must not add:

- `Tennis for Two → Pong` as direct influence without evidence;
- parallel-origin based only on a shared year;
- an unqualified claim that Pong was the first video game or first commercial video game.

### 7.4 Evidence provenance

Evidence continues to record original title, original language, URL, and a bounded summary. This slice adds or validates:

- source kind;
- author or institution;
- publication date when known;
- checked date;
- archive URL or stable identifier when available;
- locator such as page, section, patent number, or transcript passage;
- a bounded claim summary.

Institutional and primary candidates include Brookhaven National Laboratory, Computer History Museum, Smithsonian, Stanford, the Baer/Rusch/Harrison patent, and developer oral histories. Oral history claims are cross-checked against contemporary records or institutional artifacts when possible.

## 8. Error handling and invariants

- Career Lens applies only to known Capability IDs and rejects duplicate mappings.
- A Work Item belongs to exactly one Resource Topic subtable.
- Filtering never changes catalog order or reads External Observations as a score.
- Atlas nodes, relations, tags, and Evidence preserve referential closure.
- Atlas relations reject self-edges, missing Evidence, unsupported direction, and temporal inversion where the relation type requires chronology.
- Historical claims use qualified wording. `confirmed` means the narrow stored claim is directly supported, not that the full historical interpretation is undisputed.
- Existing Capability, Knowledge Topic, Source, Work Item, and Atlas detail URLs remain stable.
- `/careers/` remains a compatibility entry to the map Career section.

## 9. Verification

Automated verification covers:

- one `CapabilityMap` instance on the map page and no duplicate map on `/careers/`;
- Career tag apply, switch, focus, clear, history, no-JavaScript summaries, and personal-state independence;
- deterministic map geometry, zero node collisions, stable relation endpoints, no internal vertical wheel ownership, and no unrelated branch shift;
- exactly 15 Resource Topic groups and exactly 128 unique Work Item IDs across them;
- expand one, expand all, collapse all, seven-filter AND behavior, group counts, empty state, history, and no-JavaScript reachability;
- Atlas map-mode entry and exit, ordinary page wheel outside, pointer-anchored continuous wheel zoom inside, drag, buttons, fit, reset, scale bounds, keyboard, reduced motion, dialog return, and no-JavaScript state;
- early-history node, relation, Evidence, type, date, source, and claim-boundary contracts.

Visual verification covers 1440px, 1024px, and 320px in Light and Dark, plus no-JavaScript states for Map/Career, Resources, and Atlas. Required checks include horizontal overflow, contrast, keyboard focus, copy clarity, default and expanded density, map-mode indication, and pointer/scroll ownership.

Final gates are:

```bash
npm run check
npm test
npm run build
CI=1 npm run test:e2e
git diff --check
```

The local preview is rebuilt and kept available at `http://127.0.0.1:4321/Learn-About-Games/`. This work does not make the repository public, enable Pages, push, or deploy.

## 10. Out of scope

- Career scoring, recommendations, gaps, or completion metrics.
- A second role-specific knowledge tree.
- Resource ratings, site-authored quality tiers, or mandatory learning paths.
- A database, account system, or server-side search.
- Force-directed Atlas layout, infinite canvas, minimap, Canvas, WebGL, or 3D.
- Completing the entire history of video games in this slice.
- Making the private repository or GitHub Pages public.
