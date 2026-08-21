# 成长资源与 Atlas 内容基准 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans (recommended) to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 在 `codex/v02` 执行线上验证 1000+ Work Item，并用证据闭包审计至少三条完整 Innovation Atlas 路线。

**Architecture:** 保留既有静态 JSON catalog 与全局 Atlas 图。新增独立的路线审计纯函数和一个只读 Node 报告脚本；不把审计逻辑放入布局或页面，不把资源数量当质量评分。当前目录已经超过数量门槛，因此只修复审计实际发现的缺口。

**Tech Stack:** Astro/TypeScript catalog、Vitest、Node.js 只读审计脚本、Git 独立 clone 验证、现有 Python YouTube 低频涓流脚本。

---

### Task 1: 固定内容目标与当前基线

**Files:**
- Create: `docs/superpowers/specs/2026-08-22-content-targets-design.md`
- Create: `docs/superpowers/plans/2026-08-22-content-targets-implementation-plan.md`

- [x] **Step 1: Record the approved target.**

  Use the current `codex/v02` worktree, not the old `main` baseline. The observed baseline is 5437 resources, 84 nodes, 86 relations, 76 Evidence, and 10 themes. Treat `>=1000` as a capacity floor and define route completeness by event/evolution/carrier/Evidence closure.

- [x] **Step 2: Self-review the design.**

  Confirm that the design does not introduce quality ranks, required learning order, a second Atlas ontology, or a fallback that turns unreadable audit output into success.

- [x] **Step 3: Commit the design checkpoint.**

  Run:

  ```bash
  git add docs/superpowers/specs/2026-08-22-content-targets-design.md docs/superpowers/plans/2026-08-22-content-targets-implementation-plan.md
  git commit -m "docs: define resource and Atlas content targets"
  ```

  Expected: only the two planning documents are committed.

### Task 2: Add the Atlas route audit helper with RED tests first

**Files:**
- Create: `src/lib/atlas-route-audit.ts`
- Create: `tests/lib/atlas-route-audit.test.ts`

- [x] **Step 1: Write fixture tests that fail because the helper does not exist.**

  Cover these exact behaviors:

  ```ts
  it('finds a deterministic three-event route and carrier closure', () => {
    const result = auditAtlasRoutes(fixture.nodes, fixture.relations, fixture.evidenceIds, ['route']);
    expect(result[0]).toMatchObject({
      themeId: 'route',
      complete: true,
      chain: ['event-a', 'event-b', 'event-c'],
      evolutionRelationIds: ['a-to-b', 'b-to-c'],
      carrierCoverage: { covered: 3, total: 3 },
    });
  });

  it('reports an incomplete route instead of silently dropping a missing carrier', () => {
    const result = auditAtlasRoutes(nodesWithoutCarrier, relations, evidenceIds, ['route']);
    expect(result[0].complete).toBe(false);
    expect(result[0].missingCarrierEventIds).toEqual(['event-b']);
  });

  it('keeps an empty theme distinct from an unreadable audit input', () => {
    expect(auditAtlasRoutes(fixture.nodes, fixture.relations, fixture.evidenceIds, ['missing'])[0])
      .toMatchObject({ themeId: 'missing', complete: false, eventIds: [], chain: [] });
  });
  ```

- [x] **Step 2: Run the focused test to verify RED.**

  Run:

  ```bash
  npm test -- tests/lib/atlas-route-audit.test.ts
  ```

  Expected: fail with the known nested-worktree Astro tsconfig resolution error before tests execute; no current data is changed.

- [x] **Step 3: Implement the smallest deterministic helper.**

  Export:

  ```ts
  export type AtlasRouteAudit = {
    themeId: string;
    eventIds: string[];
    chain: string[];
    evolutionRelationIds: string[];
    carrierRelationIds: string[];
    carrierCoverage: { covered: number; total: number };
    missingCarrierEventIds: string[];
    missingEvidenceIds: string[];
    complete: boolean;
  };

  export function auditAtlasRoutes(
    nodes: Catalog['atlasNodes'],
    relations: Catalog['atlasRelations'],
    evidenceIds: Iterable<string>,
    themeIds: string[],
  ): AtlasRouteAudit[];
  ```

  The helper must only use event nodes matching the theme, evolution relations between those events, carrier relations from those events to known non-event nodes, and evidence IDs present in the supplied set. Choose the longest valid directed chain with stable year/ID tie-breaking. A route is complete only when the chain has at least three events, valid start/end roles, adjacent evolution edges, carrier coverage for every chain event, and no evidence gap.

- [x] **Step 4: Run the focused test to verify GREEN.**

  The nested worktree cannot execute Vitest because of the known Astro resolution failure; the same focused suite passes in the independent clone.

  Run the same command. Expected: all fixture tests pass and the helper has no filesystem or network side effects.

- [x] **Step 5: Commit the helper checkpoint.**

  ```bash
  git add src/lib/atlas-route-audit.ts tests/lib/atlas-route-audit.test.ts
  git commit -m "test: define complete Atlas route closure"
  ```

### Task 3: Add the resource target and current-catalog contract

**Files:**
- Create: `tests/lib/content-targets.test.ts`
- Create: `scripts/audit-content-targets.mjs`

- [x] **Step 1: Write the target tests.**

  The test must assert the real catalog, without requiring an exact count:

  ```ts
  expect(resources.length).toBeGreaterThanOrEqual(1000);
  expect(new Set(resources.map(({ canonicalUrl }) => normalizeCatalogUrl(canonicalUrl))).size)
    .toBe(resources.length);
  expect(resources.every(({ accessVersions, resourceTopicIds }) =>
    accessVersions.length > 0 && resourceTopicIds.length > 0,
  )).toBe(true);
  ```

  It must also call `auditAtlasRoutes()` for the current route IDs and assert at least three `complete: true` results. Do not assert resource quality from an external platform count, and do not require every imported video to have a transcript-derived summary.

- [x] **Step 2: Run the target test and record the first result.**

  ```bash
  npm test -- tests/lib/content-targets.test.ts
  ```

  Expected: either GREEN with the existing 5437/three-route data, or a concrete RED identifying an actual contract gap. A missing build environment is not a data RED.

- [x] **Step 3: Implement the read-only audit script.**

  `scripts/audit-content-targets.mjs` reads the four JSON files with `fs.readFileSync`, reports `{ resources, uniqueCanonicalUrls, atlasNodes, atlasRelations, atlasEvidence, completeRoutes, incompleteRoutes }`, prints the JSON to stdout, and exits nonzero if a file cannot be read or JSON cannot be parsed. It must not rewrite any catalog file.

- [x] **Step 4: Run the script and save its output outside the repository.**

  ```bash
  node --experimental-strip-types scripts/audit-content-targets.mjs > /tmp/learn-about-games-content-targets.json
  node -e "const r=require('/tmp/learn-about-games-content-targets.json'); console.log(JSON.stringify(r,null,2))"
  ```

  Expected: `resources >= 1000` and at least three complete route IDs. If the report is absent, malformed, or the script exits nonzero, report that as an audit failure rather than a passing zero.

- [x] **Step 5: Commit the target contract.**

  ```bash
  git add tests/lib/content-targets.test.ts scripts/audit-content-targets.mjs
  git commit -m "test: audit resource and Atlas content targets"
  ```

### Task 4: Repair only evidence-backed route gaps

**Files:**
- Modify only the specific `src/data/atlas-nodes.json`, `src/data/atlas-relations.json`, or `src/data/atlas-evidence.json` entries named by the audit, if any
- Create or modify the corresponding `docs/research/2026-08-22-*.md`
- Modify `tests/lib/atlas-route-audit.test.ts` only for a newly accepted route contract

- [x] **Step 1: Classify every incomplete route.**

  Use the audit report to separate `no events`, `short chain`, `missing evolution`, `missing carrier`, and `missing evidence`. Do not add an edge for chronology alone. Existing `early-electronic-games`, `adventure-lineage`, and `puzzle-adventure-lineage` may remain incomplete and must remain visibly/explicitly unfilled.

- [x] **Step 2: Reuse existing research before opening new sources.**

  Check `docs/research/2026-08-11-atlas-platform-adventure.md`, `docs/research/2026-08-13-atlas-shooter-rts.md`, `docs/research/2026-08-15-innovation-event-atlas.md`, and `docs/research/2026-08-16-atlas-rts-events.md`. Only if a reported gap is supported there may it be repaired from the notebook; otherwise leave it incomplete and record the reason.

- [x] **Step 3: Verify any new external source through agent-reach.**

  No new external source was required; the existing research notebooks already supported the four complete routes and did not justify a new repair.

  Run `agent-reach doctor --json` before platform-specific retrieval. Prefer official, developer, museum, institutional, participant, or archival sources. Record URL, original title, language, checked date from `date`, bounded claim, locator and rejected overclaim. Never paste protected full text or subtitles into the repository.

- [x] **Step 4: Run catalog validator and route tests after each data repair.**

  No data repair was justified; the independent clone passed the route, content-target and catalog-validator suites.

  ```bash
  npm test -- tests/lib/atlas-route-audit.test.ts tests/lib/content-targets.test.ts tests/lib/catalog-validate.test.ts
  ```

  Expected: no missing endpoints, no orphan Evidence, no relation without a role or evidence, and the complete route count does not rely on a newly invented quality label.

- [x] **Step 5: Commit only an evidence-backed repair.**

  No Atlas data commit was made; the audit record is documented in the 2026-08-22 Devlog and continuity files.

  ```bash
  git add src/data/atlas-* docs/research tests/lib
  git commit -m "content: close evidence-backed Atlas route gaps"
  ```

  If no repair is justified, make no data commit; commit the audit record instead.

### Task 5: Run the low-frequency video continuation without claiming completion

**Files:**
- Runtime cache only: `~/.cache/lag-video-content/`
- No transcript files or credentials in the repository

- [x] **Step 1: Check the existing state before triggering one item.**

  Read `~/.cache/lag-video-content/state.json`, `report.json`, `cooldown_until`, and `trickle.log` without printing secrets. Distinguish missing report from zero failures.

- [x] **Step 2: Trigger the existing one-item script once.**

  ```bash
  bash scripts/trickle-video-content.sh
  ```

  Expected: one completed item, one terminal no-transcript item, one retryable item, or an explicit channel failure/cooldown. It must never be described as full 2311-item completion.

- [x] **Step 3: Verify repository scope.**

  ```bash
  git status --short --untracked-files=all
  git diff --check
  ```

  Expected: only intentionally updated catalog/doc files are present; external transcript cache and reports remain outside Git.

### Task 6: Fresh independent verification and continuity handoff

**Files:**
- Modify: `docs/journal/2026-08-09-learn-about-games-v02-decision-summary.md`
- Modify: `docs/journal/2026-08-09-learn-about-games-v02-transcript.md`
- Create: `docs/devlog/2026-08-22-content-target-audit.md`
- Modify: `ROADMAP.md` and `CHANGELOG.md` only if the verified current direction changes

- [x] **Step 1: Commit all runtime changes before cloning.**

  ```bash
  git status --short
  git log -5 --oneline
  ```

- [x] **Step 2: Clone outside the nested worktree and install dependencies.**

  ```bash
  VERIFY_DIR=$(mktemp -d /tmp/lag-v02-verify.XXXXXX)
  git clone --branch codex/v02 /Users/haodong/Documents/GitHub/Learn-About-Games "$VERIFY_DIR"
  cd "$VERIFY_DIR"
  npm ci
  ```

  Expected: the clone has no parent-worktree tsconfig leakage.

- [x] **Step 3: Run the full gate in separate commands.**

  Independent clone: check 0/0/0, full Vitest 203/203, build 150 pages; Playwright 255 passed / 7 failed / 22 skipped. The E2E failures remain explicit and are not converted into a content pass.

  ```bash
  npm run check
  npm test
  npm run build
  CI=1 npm run test:e2e
  git diff --check
  ```

  Record exact exits and counts. A failure must retain its actual category; do not convert an environment error into a content pass.

- [x] **Step 4: Write the content audit devlog and decision summary update.**

  Include exact resource count, unique URL count, complete route IDs and chains, incomplete route IDs, video backfill state, independent clone command results, and the next safe direction. Mark any inference as inference.

- [x] **Step 5: Commit continuity docs locally and do not push.**

  ```bash
  git add docs/journal docs/devlog ROADMAP.md CHANGELOG.md
  git commit -m "docs: record content target audit"
  ```

  Expected: branch remains private and no Pages workflow is enabled.
