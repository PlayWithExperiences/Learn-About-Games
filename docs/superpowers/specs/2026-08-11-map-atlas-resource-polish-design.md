# Map, Atlas and Resource Polish Design

Date: 2026-08-11

## Problem statement

The current candidate is structurally closer to the intended product, but three presentation choices still work against comprehension:

- the EGDS map uses internally consistent boxes without a sufficiently visible shared alignment system, so rows read as individually offset fragments;
- the Career Lens evidence area reserves a large empty block before selection and compresses selected evidence into a narrow internal scroller;
- Innovation Atlas calls its embedded interaction a map mode without giving the map the viewport it needs;
- the resource catalog has useful grouping and filters, but its content coverage is still incomplete.

This is a preserve-redesign of a dense editorial knowledge product for newcomers and practitioners. The visual language remains cartographic and restrained, with EGDS as an explicit authorial framework rather than a neutral industry taxonomy. Design dials: `DESIGN_VARIANCE 4`, `MOTION_INTENSITY 3`, `VISUAL_DENSITY 9`.

## 1. EGDS alignment

The desktop scene uses one declared horizontal grid. Comparable framework levels share the same column centers and connection ports. Rows may contain different numbers of nodes, but they may not invent independent x-origins or ad-hoc spacing.

Invariants:

- root, branch, process stage, lever and capability-group positions remain typed and deterministic;
- every structural connector terminates at a declared box port;
- repeated columns align within a small geometric tolerance;
- no box, label or unrelated connector overlaps after any single supported expansion;
- responsive and no-JavaScript outlines retain the same hierarchy and content.

## 2. Career Lens evidence

Career Lenses remain optional tags over the single Expertise Map.

- With no selection, the page shows the controls and concise status only. It does not reserve a blank evidence viewport.
- With a selection, one full-width native disclosure appears immediately after the controls and before the map.
- The selected disclosure uses natural document height. It has no fixed block size and no internal vertical scrolling.
- Mapping, boundary, review date and public sources remain readable and no score, fit or completion estimate is introduced.
- Applying, switching, focusing and clearing continue through the existing public map events.

## 3. Atlas full-screen map mode

The explicit map mode becomes a temporary full-viewport workspace on desktop.

- The mode layer is fixed to the visual viewport and uses `100dvh` with a compact toolbar and a flexing map viewport.
- Entering stores page position and focus, locks background page scrolling, and preserves current canvas scale and pan.
- Wheel zoom and blank-canvas drag remain pointer anchored and frame batched.
- Exit, Escape, breakpoint changes and teardown restore page scroll, canvas scroll and focus without leaving stale body styles.
- Dialog and Evidence navigation continue to return to the same map state.
- At outline widths and without JavaScript, the complete text-equivalent Atlas remains the presentation; no fake full-screen control is exposed.

## 4. Resource expansion

Add a bounded evidence-backed batch chosen from current coverage gaps.

- Prefer official, primary or established high-quality learning material.
- Keep Source and Work Item identities separate and canonical URLs deterministically deduplicated.
- Every Work Item has exactly one primary Resource Topic and honest language, media and access facts.
- External observations may be preserved as attributed facts, but the site adds no score, ranking or quality badge.
- Research notes record inclusion, exclusion, unresolved claims and verification dates.

## Acceptance

- Fresh Astro check, unit suite, static build and full Playwright suite pass.
- Map visual probes cover 1440, 1024 and 320 pixels in Light and Dark, with no overlap or page overflow.
- Career unselected state has no blank evidence block; selected state has no internal vertical scroller.
- Atlas active map mode covers the viewport, locks the background and restores state on every exit path.
- Resource counts, unique canonical URLs, references and the one-topic invariant are verified from raw catalog data.
