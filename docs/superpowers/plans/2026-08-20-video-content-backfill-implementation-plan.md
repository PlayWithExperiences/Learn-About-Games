# Video Content Backfill Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Use cached YouTube transcripts and a cheap OpenRouter model to add evidence-based Chinese summaries and conservative topic/capability mappings to the 2311 imported video Work Items.

**Architecture:** `scripts/backfill_video_content.py` loads only the three imported video sources, fetches transcripts into an external cache, classifies transcript failures, calls the model with the current topic/capability catalog, validates structured output, and atomically updates `resources.json`. A per-item state file, failure log, circuit breaker, and JSON report make retries and failures observable without storing transcript text in Git.

**Tech Stack:** Python 3.11+ standard library, `youtube-transcript-api`, OpenRouter Chat Completions, repository JSON catalogs, unittest.

---

### Task 1: Define deterministic script contracts with tests

**Files:**
- Create: `scripts/test_backfill_video_content.py`
- Create: `scripts/backfill_video_content.py`

- [ ] **Step 1: Write tests for exception classification, model output validation, and conservative resource patching.**
- [ ] **Step 2: Run `python3 -m unittest scripts/test_backfill_video_content.py -v` and confirm RED because the implementation module is missing.
- [ ] **Step 3: Implement the smallest pure helpers that satisfy the tests.
- [ ] **Step 4: Re-run the focused test and confirm GREEN.

### Task 2: Add transcript/model pipeline and per-item state

**Files:**
- Modify: `scripts/backfill_video_content.py`
- Modify: `.gitignore`

- [ ] Add external-cache defaults, API-key loading from environment or the specified external key file, transcript fetching with explicit no-transcript/channel exception classes, model fallback sequence, and JSON parsing.
- [ ] Add atomic state/report/log writes after each item, pending-result recovery, retryable selection, `--limit`, `--retryable`, `--dry-run`, `--circuit-breaker`, and no transcript content in state/log/report.
- [ ] Add a prompt that includes the full fetched transcript, current topic/capability IDs and descriptions, and requires a 150–250 Chinese-character summary plus only transcript-supported IDs.
- [ ] Run the focused tests and `python3 scripts/backfill_video_content.py --help`.

### Task 3: Run the required 30-item sample

**Files:**
- Modify: external cache/state/report only; no transcript files in the repository

- [ ] Install `youtube-transcript-api` in an external virtual environment.
- [ ] Run `python3 scripts/backfill_video_content.py --limit 30 --sample-label sample-30` unattended.
- [ ] Inspect the JSON report, resource diff, summary lengths, ID validity, fallback replacement, and duplicate `whyRelevant` invariant; record the 30-item conclusion in the final report.

### Task 4: Resume the full batch and validate data invariants

**Files:**
- Modify: `src/data/resources.json`

- [ ] Resume the script without a limit until all non-terminal items are handled, allowing retryable failures to remain explicitly retryable if the channel circuit opens.
- [ ] Run a standalone invariant report for attempted/success/no-transcript/channel/model failures, zero duplicate summary/whyRelevant pairs, Work Item count 5430, zero changed non-target resources, and final `design-fundamentals` count.
- [ ] Run `git diff --check`, a secret-pattern scan, and verify no transcript path is tracked.

### Task 5: Independent-clone build and local commit

**Files:**
- Modify: project continuity docs and changelog as a milestone record

- [ ] Update the decision summary, sanitized session record, roadmap/changelog milestone notes with system-clock timestamps and explicit assumptions.
- [ ] Commit locally on `codex/v02`; do not push.
- [ ] Clone the committed branch outside the nested worktree, run `npm ci && npm run build`, and report the fresh exit code and test counts.
