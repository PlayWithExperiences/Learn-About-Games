// @ts-expect-error The application tsconfig intentionally omits Node builtin declarations.
import { execFileSync } from 'node:child_process';
import { describe, expect, it } from 'vitest';

/**
 * Regression guard for the 2026-09-13 production loss.
 *
 * NotebookLM renders a freshly added link source with its raw URL as the source card
 * title and only swaps in the real YouTube title once metadata resolves. The pipeline
 * compared that placeholder against the catalog title with token fuzzy matching, got
 * zero overlap, and recorded a CORRECT import as an `import-source` failure. All three
 * items of that batch failed that way and each one burned a daily NotebookLM claim
 * (the day's ten were then gone).
 *
 * The rule now lives in one place: `source_identity_ok()` in
 * automation/run-notebooklm-item.py. These tests call that function through its
 * `--identity-check` mode rather than re-implementing it, so the assertion cannot
 * drift away from the code that actually runs in production.
 */

const RUNNER = decodeURIComponent(
  new URL('../../automation/run-notebooklm-item.py', import.meta.url).pathname,
);

interface IdentityCase {
  catalog_title: string;
  video_id: string;
  source_title: string;
}

function identity(cases: IdentityCase[]): boolean[] {
  const stdout = execFileSync('python3', [RUNNER, '--identity-check'], {
    input: JSON.stringify(cases),
    encoding: 'utf8',
  });
  return JSON.parse(stdout);
}

describe('NotebookLM source identity', () => {
  it('accepts a URL placeholder that carries the candidate video id', () => {
    // The exact strings observed in production on 2026-09-13 20:04-20:05.
    const [first, second, third] = identity([
      {
        catalog_title:
          "Google Maps, Not Greyboxes: Digital Location Scouting for 'Untitled Goose Game'",
        video_id: 'tA-64QuWgLk',
        source_title: 'https://www.youtube.com/watch?v=tA-64QuWgLk',
      },
      {
        catalog_title: 'Force and Fire: Making Your Game More Metal',
        video_id: 'XH2FTItPd9k',
        source_title: 'https://www.youtube.com/watch?v=XH2FTItPd9k',
      },
      {
        catalog_title: "Procedurally Crafting Manhattan for 'Marvel's Spider-Man'",
        video_id: '4aw9uyj9MAE',
        source_title: 'https://www.youtube.com/watch?v=4aw9uyj9MAE',
      },
    ]);

    expect(first).toBe(true);
    expect(second).toBe(true);
    expect(third).toBe(true);
  });

  it('accepts a resolved real title, including punctuation differences', () => {
    const [exact, punctuated] = identity([
      {
        catalog_title: 'Force and Fire: Making Your Game More Metal',
        video_id: 'XH2FTItPd9k',
        source_title: 'Force and Fire: Making Your Game More Metal',
      },
      {
        catalog_title:
          "Google Maps, Not Greyboxes: Digital Location Scouting for 'Untitled Goose Game'",
        video_id: 'tA-64QuWgLk',
        source_title: 'Google Maps, Not Greyboxes - Digital Location Scouting',
      },
    ]);

    expect(exact).toBe(true);
    expect(punctuated).toBe(true);
  });

  it('still refuses a URL placeholder carrying a different video id', () => {
    const [different] = identity([
      {
        catalog_title: 'Force and Fire: Making Your Game More Metal',
        video_id: 'XH2FTItPd9k',
        source_title: 'https://www.youtube.com/watch?v=SOMEONEELSE',
      },
    ]);

    expect(different).toBe(false);
  });

  it('still refuses another lecture taken from the same notebook', () => {
    const [other, unrelated] = identity([
      {
        catalog_title: 'Google Maps, Not Greyboxes',
        video_id: 'tA-64QuWgLk',
        source_title: "Fallout 4's Modular Level Design",
      },
      {
        catalog_title: 'Force and Fire: Making Your Game More Metal',
        video_id: 'XH2FTItPd9k',
        source_title: 'Level Design in Hitman: Guiding Players in a Non-Linear Sandbox',
      },
    ]);

    expect(other).toBe(false);
    expect(unrelated).toBe(false);
  });

  it('refuses empty cards and URL cards that expose no video id', () => {
    const [empty, idless, whitespace] = identity([
      { catalog_title: 'Force and Fire', video_id: 'XH2FTItPd9k', source_title: '' },
      { catalog_title: 'Force and Fire', video_id: 'XH2FTItPd9k', source_title: 'https://example.com/watch' },
      { catalog_title: 'Force and Fire', video_id: 'XH2FTItPd9k', source_title: '   ' },
    ]);

    expect(empty).toBe(false);
    expect(idless).toBe(false);
    expect(whitespace).toBe(false);
  });

  it('accepts youtu.be and shorts URL forms as placeholders', () => {
    const [short, shorts] = identity([
      { catalog_title: 'Force and Fire', video_id: 'XH2FTItPd9k', source_title: 'https://youtu.be/XH2FTItPd9k' },
      { catalog_title: 'Force and Fire', video_id: 'XH2FTItPd9k', source_title: 'https://www.youtube.com/shorts/XH2FTItPd9k' },
    ]);

    expect(short).toBe(true);
    expect(shorts).toBe(true);
  });
});
