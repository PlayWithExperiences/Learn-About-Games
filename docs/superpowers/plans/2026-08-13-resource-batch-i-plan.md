# Resource Batch I Implementation Plan

**Goal:** Add sixteen independently verified English learning resources from GDC Vault and Game Developer without changing the Resources interface.

**Architecture:** Extend the existing Source → Work Item → Access Version catalog. Reuse the existing `gdc-vault` and `game-developer` Sources, keep exactly one primary Resource Topic per Work Item, and map only capabilities stated by the source page. Record the research boundary in the intake notebook and lock exact canonical identities in unit tests.

**Tech Stack:** JSON catalog, TypeScript/Vitest validation, Astro static build, Playwright.

## Task 1: Lock the batch contract

- [x] Add a failing catalog-data test for the sixteen exact canonical URLs.
- [x] Require totals of 225 Work Items, 38 Sources and 239 Access Versions.
- [x] Require seven talks, nine articles, sixteen English originals and one primary Resource Topic per item.
- [x] Verify normalized URL uniqueness and dated original Access Versions.

## Task 2: Add the verified Work Items

- [x] Append `i-001` through `i-016` to `src/data/resources.json`.
- [x] Reuse `gdc-vault` and `game-developer`; do not create new Sources.
- [x] Use conservative `subscription` access for GDC Vault and `free` for public Game Developer articles.
- [x] Keep capability mappings narrow and leave knowledge-topic mappings empty unless the source explicitly needs one.

## Task 3: Preserve the research audit layer

- [x] Add Batch I to `docs/research/2026-08-09-resource-intake.md` with authors, bounded claims, access facts and exclusions.
- [x] Update all dynamic coverage lines and the A–I batch summary.
- [x] Record that Agent Reach discovery encountered backend limitations while every included page was verified from its official page.

## Task 4: Verify and commit

- [x] Run targeted catalog tests, Astro check, full Vitest and a fresh build.
- [x] Run Resources desktop/mobile and no-JavaScript Playwright checks.
- [ ] Check notebook counts, normalized URL ownership, diff formatting and secret patterns.
- [ ] Commit only the resource data, intake notebook, test and this plan.
