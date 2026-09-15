// @ts-expect-error The application tsconfig intentionally omits Node builtin declarations.
import { execFileSync } from 'node:child_process';
// @ts-expect-error The application tsconfig intentionally omits Node builtin declarations.
import { mkdtempSync, writeFileSync } from 'node:fs';
// @ts-expect-error The application tsconfig intentionally omits Node builtin declarations.
import { tmpdir } from 'node:os';
// @ts-expect-error The application tsconfig intentionally omits Node builtin declarations.
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

/**
 * Regression guard for the 2026-09-15 deck export failure.
 *
 * The Studio card's download control is a browser-process download navigation. On this
 * machine it stalled a few KB into every attempt and then killed Chrome, so the deck —
 * one of the three required artifacts — could not be produced at all. The working route
 * asks the browser to *deny* the download (which still reports the signed asset URL) and
 * then streams those bytes through the page's own network stack.
 *
 * The failure mode that must never come back is a saved HTML error page, a sign-in page
 * or a truncated container being accepted as a deck. These tests exercise the real
 * validator in `automation/browser/nblm-capture-deck.cjs` through its `--verify` entry
 * point, so the assertion cannot drift from the code that runs in production.
 */

const SCRIPT = decodeURIComponent(
  new URL('../../automation/browser/nblm-capture-deck.cjs', import.meta.url).pathname,
);

interface VerifyResult {
  bytes: number;
  zip_signature: boolean;
  membersPresent: boolean;
}

function verify(file: string): { status: number; result: VerifyResult } {
  try {
    const stdout = execFileSync('node', [SCRIPT, '--verify', file], { encoding: 'utf8' });
    return { status: 0, result: JSON.parse(stdout) };
  } catch (error) {
    const err = error as { status: number; stdout: string };
    return { status: err.status, result: JSON.parse(err.stdout) };
  }
}

/** Build a ZIP container shaped like a real PPTX, padded past the size floor. */
function makeOoxml(directory: string, paddingBytes: number): string {
  const file = join(directory, 'deck.pptx');
  execFileSync('python3', ['-c', `
import sys, zipfile
path, pad = sys.argv[1], int(sys.argv[2])
with zipfile.ZipFile(path, 'w', zipfile.ZIP_STORED) as z:
    z.writestr('[Content_Types].xml', '<Types/>')
    z.writestr('ppt/presentation.xml', '<p:presentation/>')
    z.writestr('ppt/media/filler.bin', b'\\0' * pad)
`, file, String(paddingBytes)], { encoding: 'utf8' });
  return file;
}

describe('NotebookLM deck capture validation', () => {
  const directory = mkdtempSync(join(tmpdir(), 'lag-deck-verify-'));

  it('accepts a real PPTX-shaped container', () => {
    const file = makeOoxml(directory, 200_000);
    const { status, result } = verify(file);
    expect(status).toBe(0);
    expect(result.zip_signature).toBe(true);
    expect(result.membersPresent).toBe(true);
    expect(result.bytes).toBeGreaterThan(100_000);
  });

  it('rejects a saved sign-in page that is large enough to pass a size check', () => {
    const file = join(directory, 'signin.html');
    writeFileSync(file, `<!doctype html><html><body>${'Sign in '.repeat(20_000)}</body></html>`);
    const { status, result } = verify(file);
    expect(status).not.toBe(0);
    expect(result.zip_signature).toBe(false);
  });

  it('rejects a truncated container that has the ZIP signature but no deck members', () => {
    const file = join(directory, 'truncated.pptx');
    writeFileSync(file, `PK\u0003\u0004${'\u0000'.repeat(200_000)}`, 'latin1');
    const { status, result } = verify(file);
    expect(status).not.toBe(0);
    expect(result.membersPresent).toBe(false);
  });
});
