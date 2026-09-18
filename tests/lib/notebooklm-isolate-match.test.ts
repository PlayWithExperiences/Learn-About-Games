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
 * assert both halves: the placeholder is matched by exact video id, and nothing is ever
 * matched by prefix.
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

function matcher(keep: string): (label: string) => boolean {
  const factory = new Function(
    'keep',
    `${nameOfBlock()}${matchesKeepBlock()} return matchesKeep;`,
  ) as (keep: string) => (state: { label: string }) => boolean;
  const matches = factory(keep);
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
});
