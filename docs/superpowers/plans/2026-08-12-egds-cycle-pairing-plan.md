# EGDS Cycle Pairing Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the EGDS page explicitly show the one-to-one mapping between the four practice actions and the four causal layers after the emotional curve.

**Architecture:** Keep the existing server-rendered `/egds/` route and source arrays. Add the matching causal-layer label to each practice-cycle entry, render each pair in the same semantic list item, and test the text contract and responsive grid. The emotional curve remains a separate whole-experience entry and is never assigned to a practice action.

**Tech Stack:** Astro, TypeScript, native CSS, Playwright.

---

### Task 1: Lock the four author-defined pairings

**Files:**
- Modify: `tests/e2e/egds-routes.spec.ts`

- [ ] **Step 1: Write the failing browser contract**

Add a test that requires exactly four pairing rows and exact text pairs:

```ts
test('pairs each EGDS practice action with its causal layer', async ({ page }) => {
  await page.goto('./egds/');

  const pairs = page.locator('[data-egds-cycle-pair]');
  await expect(pairs).toHaveCount(4);
  await expect(pairs).toHaveText([
    /感受.*情绪体验/,
    /理解.*主观感受/,
    /解构.*客观原因/,
    /重构.*设计杠杆/,
  ]);
  await expect(page.locator('[data-egds-emotional-curve-entry]')).toContainText('情绪曲线');
});
```

- [ ] **Step 2: Run the test and verify RED**

Run:

```bash
CI=1 npx playwright test tests/e2e/egds-routes.spec.ts --project=chromium --grep 'pairs each EGDS practice action'
```

Expected: FAIL because `[data-egds-cycle-pair]` does not exist.

### Task 2: Render the paired current model

**Files:**
- Modify: `src/pages/egds/index.astro`
- Modify: `src/styles/global.css`

- [ ] **Step 1: Extend the server data**

Add `causalLayer` to each practice-cycle item:

```ts
const practiceCycle = [
  {
    name: '感受',
    english: 'Perception',
    causalLayer: '情绪体验',
    description: '先确认玩家实际经历了什么，不急于替体验下结论。',
  },
  {
    name: '理解',
    english: 'Rationalize',
    causalLayer: '主观感受',
    description: '为感受建立可讨论的解释，区分观察、推断和假设。',
  },
  {
    name: '解构',
    english: 'Deconstruct',
    causalLayer: '客观原因',
    description: '把体验拆到规则、反馈、叙事、空间和表现等可检查原因。',
  },
  {
    name: '重构',
    english: 'Reconstruct',
    causalLayer: '设计杠杆',
    description: '使用设计杠杆重新组织体验，并通过游玩证据继续修正。',
  },
];
```

- [ ] **Step 2: Mark the emotional-curve entry and render each pair**

Give the first current-model item `data-egds-emotional-curve-entry`. In each practice list item, add `data-egds-cycle-pair` and a visible pairing line:

```astro
<p class="egds-practice-cycle__pair">
  <span>{step.name}</span>
  <span aria-hidden="true">对应</span>
  <strong>{step.causalLayer}</strong>
</p>
```

Keep the English label and explanatory paragraph. Do not duplicate IDs or generate client-side content.

- [ ] **Step 3: Add scoped responsive styling**

Use the existing `.egds-practice-cycle` block. Give the pairing line a readable internal grid and existing theme tokens. At 320px the four items remain one column and the pair stays on one readable row when possible, wrapping as a unit when necessary. Do not add arrows, new colors or animation.

- [ ] **Step 4: Run the pairing test and verify GREEN**

Run:

```bash
npx astro build
CI=1 npx playwright test tests/e2e/egds-routes.spec.ts --project=chromium --project=mobile-chromium --grep 'pairs each EGDS practice action|publishes the current EGDS method|compact editorial layout|without JavaScript'
```

Expected: all selected tests pass at desktop and mobile widths.

### Task 3: Update public records and verify the full page

**Files:**
- Modify: `README.md`
- Modify: `CHANGELOG.md`
- Modify: `ROADMAP.md`
- Modify: `docs/devlog/2026-08-12-egds-method-page.md`
- Modify: `docs/journal/2026-08-09-learn-about-games-v02-decision-summary.md`
- Modify: `docs/journal/2026-08-09-learn-about-games-v02-transcript.md`

- [ ] **Step 1: Record the pairing decision**

State exactly that the emotional curve is the overall entry and the four mappings are `感受 ↔ 情绪体验`, `理解 ↔ 主观感受`, `解构 ↔ 客观原因`, and `重构 ↔ 设计杠杆`.

- [ ] **Step 2: Run verification**

Run:

```bash
npm run check
npm test
npm run build
CI=1 npx playwright test tests/e2e/egds-routes.spec.ts tests/e2e/visible-skeleton.spec.ts --project=chromium --project=mobile-chromium
git diff --check
```

Expected: zero Astro diagnostics, zero Vitest failures, successful static build, zero unexpected Playwright failures and a clean diff check.

- [ ] **Step 3: Inspect visual states**

Capture `/egds/` at 1440px Light and 320px Dark/no-JavaScript. Verify the pairing text is readable, no item is clipped, and `document.documentElement.scrollWidth === document.documentElement.clientWidth`.

- [ ] **Step 4: Commit**

```bash
git add README.md ROADMAP.md CHANGELOG.md \
  docs/devlog/2026-08-12-egds-method-page.md \
  docs/journal/2026-08-09-learn-about-games-v02-decision-summary.md \
  docs/journal/2026-08-09-learn-about-games-v02-transcript.md \
  src/pages/egds/index.astro src/styles/global.css tests/e2e/egds-routes.spec.ts
git commit -m "fix: connect the EGDS current model"
```
