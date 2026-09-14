// @ts-expect-error The application tsconfig omits Node builtin declarations.
import { readFileSync } from 'node:fs';
// @ts-expect-error The application tsconfig omits Node builtin declarations.
import { runInNewContext } from 'node:vm';
import { describe, expect, it } from 'vitest';

const source = readFileSync(new URL('../../automation/browser/launch.cjs', import.meta.url), 'utf8');

// Execute the real entrypoint and inspect the options passed across the Playwright
// boundary. Removing a switch from args alone cannot enable Playwright's sandbox.
function launchOptions(env: Record<string, string>) {
  let options: { chromiumSandbox?: boolean; args: string[] } | undefined;
  runInNewContext(source, {
    require: () => ({ chromium: {
      launchPersistentContext: (_profile: string, value: typeof options) => {
        options = value;
        return new Promise(() => {});
      },
    } }),
    process: { env: { HOME: '/tmp/lag-test', ...env }, argv: ['node', 'launch.cjs', '--headless'] },
  });
  return options!;
}

describe('NotebookLM browser sandbox', () => {
  it('explicitly enables the sandbox at the Playwright boundary by default', () => {
    const options = launchOptions({});
    expect(options.chromiumSandbox).toBe(true);
    expect(options.args).not.toContain('--no-sandbox');
  });
  it('disables the sandbox only with the documented opt-in value', () => {
    expect(launchOptions({ LAG_NO_SANDBOX: '1' }).chromiumSandbox).toBe(false);
    expect(launchOptions({ LAG_NO_SANDBOX: '0' }).chromiumSandbox).toBe(true);
    expect(launchOptions({ LAG_NO_SANDBOX: 'false' }).chromiumSandbox).toBe(true);
  });
});
