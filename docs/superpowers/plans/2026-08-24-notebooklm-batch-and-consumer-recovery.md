# NotebookLM Daily Batch and Consumer Recovery Implementation Plan

> For agentic workers: REQUIRED SUB-SKILL: use `superpowers:executing-plans` to execute this plan task-by-task.

**Goal:** Prevent an exhausted NotebookLM inbox from failing Daily Check-in, and safely expand the daily NotebookLM production window from one to at most ten attempts without creating false-ready artifacts or exceeding the local daily guard.

**Architecture:** Keep NotebookLM browser work in the versioned Skill and keep deterministic state in `notebooklm_producer.py`. The producer will expose a read-only batch preflight, atomically claim exact candidates, count every claim against a Beijing-calendar-day cap, and leave each failed claim terminal and observable. The consumer will treat only the specific exhausted-ready-queue exception as a no-op; malformed resources and remote-state/PKM failures will still fail loudly.

**Tech Stack:** Python 3, `unittest`, JSON ledger/inbox, Codex cron automation, Markdown Skill contract.

---

## Task 1: Make an exhausted consumer queue a real no-op

**Files:**
- Modify: `/Users/haodong/Documents/GitHub/AI-Life-Mentor/scripts/daily_checkin.py`
- Modify: `/Users/haodong/Documents/GitHub/AI-Life-Mentor/scripts/test_notebooklm_line.py`

1. Add a regression test where `load_resources()` returns a valid ready resource but `pick_resource()` raises `NoNotebookLMResource` because all resource IDs are already marked in GitHub Issues.
2. Run the focused test and verify it fails at the uncaught `pick_resource()` exception.
3. Catch only `NoNotebookLMResource` around `pick_resource()`, return the original body and `None`, and leave all other errors propagating.
4. Re-run the focused test file.

## Task 2: Add a bounded, observable producer batch contract

**Files:**
- Modify: `/Users/haodong/Documents/GitHub/Learn-About-Games/scripts/notebooklm_producer.py`
- Modify: `/Users/haodong/Documents/GitHub/Learn-About-Games/scripts/test_notebooklm_producer.py`

1. Add red tests for `preflight(limit=10)`, rejecting limits outside `1..10`, exact `resource_id` claiming, and blocking an eleventh claim on the same Beijing calendar day.
2. Run the focused producer tests and verify the new tests fail before implementation.
3. Implement a read-only batch preflight that returns distinct candidates in catalog order, reports `claimed_today`/`remaining_today`, and distinguishes `daily_limit_reached` from `no_candidate`.
4. Add an optional exact-resource claim path so a batch cannot silently claim a different video after preflight.
5. Enforce the daily cap inside the locked claim transaction; count claims, including terminal failures, because each claim may already have consumed NotebookLM quota.
6. Re-run producer tests and verify the ledger remains durable and idempotent.

## Task 3: Update the runtime contract and scheduled prompt

**Files:**
- Modify: `/Users/haodong/Documents/GitHub/Learn-About-Games/tools/notebooklm-daily-resource/SKILL.md`
- Modify: `/Users/haodong/Documents/GitHub/Learn-About-Games/tools/notebooklm-daily-resource/agents/openai.yaml`
- Modify through the Codex automation connector: `learn-about-games-notebooklm`

1. Replace the one-resource wording with at most ten sequential claims per Beijing calendar day, no concurrency, no automatic retry, and continuation to the next distinct candidate after a terminal failure.
2. Require an armed browser download event and byte/type/dimension validation before an asset is considered exported; a UI click or page asset listing alone is not success.
3. Keep the normal boundary at validated `ready` JSON and make every failed phase write a terminal ledger reason.
4. Update the automation prompt while preserving its schedule, project, model, notification policy, and local execution environment.

## Task 4: Verify and record the handoff

1. Run the focused producer, automation, and AI-Life-Mentor consumer tests.
2. Run syntax/contract checks and inspect the diff for unrelated changes or secrets.
3. Read the current ledger and report actual local attempts separately from account-side Plus quota, which is not exposed by the official public quota table.
4. Do not launch the ten-call production batch in this implementation turn; obtain explicit confirmation immediately before the first external batch because the calls consume a third-party quota.
