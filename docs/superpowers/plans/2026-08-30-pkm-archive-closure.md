# PKM Archive Closure Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Ensure every validated NotebookLM resource is delivered to the AI-Life-Mentor inbox and is therefore eligible for the existing PKM/Daily Check-in consumer; a local `ready` JSON alone must never be reported as completed collection.

**Architecture:** Keep producer and consumer ownership separate. Learn About Games validates and publishes a `ready` JSON, then must hand that exact file to AI-Life-Mentor `main` through the narrow single-resource publish script and verify the remote tree/blob. AI-Life-Mentor remains responsible for selecting an unmarked resource, writing the idempotent PKM note, and appending the Daily Check-in marker. Failed handoff is an explicit failure, not a silent local-only success.

**Tech Stack:** Python 3 producer/tests, zsh handoff script, Markdown project contracts, Git worktrees, existing AI-Life-Mentor PKM/Daily Check-in scripts.

---

- [ ] Add red tests for the mandatory handoff and remote readback contract.
- [ ] Update the Learn producer skill, resource contract, Project Vision, roadmap, and NotebookLM design spec so the closure invariant is explicit.
- [ ] Harden the single-resource handoff script and its tests; keep it serial, narrow, non-force-pushing, and free of browser download UI dependence.
- [ ] Update the Codex automation prompt through the app automation API so future runs cannot stop at a local ready queue.
- [ ] Verify the AI-Life-Mentor consumer contract and add only the smallest missing test/documentation coverage.
- [ ] Run focused and baseline checks, inspect diffs/secrets, commit each repository branch, and report the separately scoped existing-resource backfill.
