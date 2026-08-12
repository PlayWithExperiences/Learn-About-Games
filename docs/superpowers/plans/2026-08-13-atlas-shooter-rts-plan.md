# Atlas Shooter and RTS Lineages Plan

**Goal:** Add two selective, evidence-backed Atlas lenses for first-person shooter development and real-time strategy development.

**Architecture:** Reuse the global graph and Genre Family navigation. Add tag-only themes, a bounded set of game nodes, and only developer-, institution-, or conference-supported directed relations. Do not hide or reposition the existing graph when a lens changes, and do not call the RTS slice a complete history of all strategy games.

**Tech Stack:** JSON catalog, TypeScript/Vitest validation, deterministic Atlas layout, Astro/Playwright.

## Task 1: Lock content and absence contracts

- [x] RED-test exact Shooter/RTS theme IDs, node IDs, relation IDs and Evidence IDs.
- [x] Require complete provenance and valid family/tag/evidence closure.
- [x] Explicitly reject unsupported Spacewar/Maze War shortcut influence edges and any claim of an absolute first FPS/RTS.

## Task 2: Add the two lineages

- [x] Add Shooter context and id/Valve development nodes with only supported relations.
- [x] Add Dune II, Warcraft, Warcraft II and StarCraft as a bounded RTS line.
- [x] Add complete Evidence provenance and narrow Chinese bounded claims.
- [x] Add one lens tag and one tag-only theme for each lineage.

## Task 3: Verify the existing product behavior

- [x] Run Atlas unit tests, validator tests, Astro check, full Vitest and fresh build.
- [x] Run Atlas/theme/base-path Playwright at desktop and mobile widths.
- [x] Verify no-JavaScript reachability, family controls, full-screen map mode and zero page overflow.
- [x] Record research decisions, update public counts and commit the Atlas slice independently.
