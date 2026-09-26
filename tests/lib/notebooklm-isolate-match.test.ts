// @ts-expect-error The application tsconfig intentionally omits Node builtin declarations.
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

/**
 * Guard for the 2026-09-17 isolation failure.
 *
 * A freshly imported YouTube link source carries its raw URL as its source-card name until
 * NotebookLM resolves the metadata. For that window `isolate_name()` passes the *video id*
 * (a truncated URL would collide across every unresolved source), but the isolate step had
 * been changed to exact-name matching on 2026-09-14 to stop a shared prefix from keeping
 * the wrong lecture — so the id matched nothing, isolation failed, and the item was
 * recorded `failed(isolate-source)` with a claim spent and no artifact attempted.
 *
 * The rule now lives in `matchesKeep()` in `automation/browser/nblm-isolate-source.cjs`.
 * These tests load that function out of the real file (no browser, no copy of the rule) and
 * assert all three halves: the placeholder is matched by exact video id, an exact title
 * matches, the `--keep-alias` second identity matches exactly, and nothing is ever
 * matched by prefix.
 *
 * Guard for the 2026-09-27 mid-isolation flip: the card swaps its URL placeholder for the
 * real title while the deselect loop is still running, so the runner hands both the
 * video id (primary keep) and the catalog title (`--keep-alias`). The flip simulation
 * below asserts the same card is kept in either form.
 */

const source = readFileSync(
  new URL('../../automation/browser/nblm-isolate-source.cjs', import.meta.url),
  'utf8',
);

function nameOfBlock(): string {
  const m = source.match(/const nameOf = [\s\S]*?;\n/);
  expect(m, 'nameOf() must exist in nblm-isolate-source.cjs').toBeTruthy();
  return m![0];
}

function matchesKeepBlock(): string {
  const m = source.match(
    /const looksLikeVideoId[\s\S]*?return looksLikeVideoId && videoIdOf\(name\) === keep;\n {2}\};/,
  );
  expect(m, 'matchesKeep() must exist in nblm-isolate-source.cjs').toBeTruthy();
  return m![0];
}

function matcher(keep: string, alias = ''): (label: string) => boolean {
  const factory = new Function(
    'keep',
    'alias',
    `${nameOfBlock()}${matchesKeepBlock()} return matchesKeep;`,
  ) as (keep: string, alias: string) => (state: { label: string }) => boolean;
  const matches = factory(keep, alias);
  // The real function takes the checkbox state object, so wrap it for readable assertions.
  return (label: string) => matches({ label });
}

describe('NotebookLM source isolation matching', () => {
  it('matches an unresolved URL source card by its exact video id', () => {
    const matches = matcher('mnIsv2ps31U');
    expect(matches('选择“https://www.youtube.com/watch?v=mnIsv2ps31U”')).toBe(true);
  });

  it('does not match a different unresolved source', () => {
    const matches = matcher('mnIsv2ps31U');
    expect(matches('选择“https://www.youtube.com/watch?v=OTHER123456”')).toBe(false);
  });

  it('matches an exact source title', () => {
    const matches = matcher('How to Build an Indie Game Co-Working Space');
    expect(matches('选择“How to Build an Indie Game Co-Working Space”')).toBe(true);
  });

  it('never matches by prefix or fragment', () => {
    expect(matcher('How to Build an Indie Game Co-Working Space')(
      '选择“How to Build an Indie Game Co-Working Space (part 2)”')).toBe(false);
    expect(matcher('Magical Realism: The Art of Creating Everest')(
      '选择“Magical Realism: The Art of Creating Everest in Your Living Room with VR (presented by NVIDIA)”',
    )).toBe(false);
  });

  it('matches the alias second identity exactly', () => {
    const matches = matcher('DkT6oJLDXgE', 'Tokyo Jungle and Japan');
    expect(matches('选择“Tokyo Jungle and Japan”')).toBe(true);
  });

  it('does not match a neighbour by alias prefix', () => {
    const matches = matcher('DkT6oJLDXgE', 'Tokyo Jungle and Japan');
    expect(matches('选择“Tokyo Jungle and Japan\u2019s Gaming Potential”')).toBe(false);
  });

  it('keeps the same card across the 2026-09-27 metadata flip', () => {
    // Before the flip the card is a URL placeholder kept by video id; after the flip
    // the real title is kept by the catalog-title alias. One card, either form.
    const before = matcher('DkT6oJLDXgE', 'Tokyo Jungle and Japan');
    expect(before('选择“https://www.youtube.com/watch?v=DkT6oJLDXgE”')).toBe(true);
    const after = matcher('DkT6oJLDXgE', 'Tokyo Jungle and Japan\u2019s Gaming Potential');
    expect(after('选择“Tokyo Jungle and Japan\u2019s Gaming Potential”')).toBe(true);
    // …and the alias never keeps a different lecture.
    expect(after('选择“Classic Game Postmortem: Ultima Online”')).toBe(false);
  });
});
