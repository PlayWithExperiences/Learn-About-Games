// @ts-expect-error The application tsconfig intentionally omits Node builtin declarations.
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

// Execute the production readiness block with a controlled DOM state and clock.
const source = readFileSync(new URL('../../automation/browser/nblm-isolate-source.cjs', import.meta.url), 'utf8');
const start = source.indexOf('  let before = await state();');
const end = source.indexOf("  console.log('BEFORE:'", start);
const AsyncFunction = Object.getPrototypeOf(async () => {}).constructor;
const waitForSource = new AsyncFunction('state', 'matchesKeep', 'setTimeout', 'Date',
  source.slice(start, end) + '\nreturn before;');
const immediate = (fn: () => void) => fn();
const matches = (s: { label: string }) => s.label === 'target';

describe('NotebookLM selectable-source readiness', () => {
  it('waits when the source title precedes its checkbox', async () => {
    expect(start).toBeGreaterThan(0);
    let reads = 0;
    const result = await waitForSource(async () => ++reads < 3 ? [] : [{ label: 'target' }], matches, immediate, Date);
    expect(reads).toBe(3);
    expect(result).toEqual([{ label: 'target' }]);
  });
  it('returns a missing target for the existing failure guard after a bounded wait', async () => {
    let clock = 0;
    const result = await waitForSource(async () => [{ label: 'other' }], matches, immediate, { now: () => clock += 20000 });
    expect(result).toEqual([{ label: 'other' }]);
    expect(clock).toBeLessThanOrEqual(100000);
  });
});
