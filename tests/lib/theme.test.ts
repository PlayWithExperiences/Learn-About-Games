import { describe, expect, it } from 'vitest';
import { parseThemePreference, THEME_STORAGE_KEY } from '../../src/lib/theme';

describe('parseThemePreference', () => {
  it.each(['system', 'light', 'dark'] as const)('accepts %s', (value) => {
    expect(parseThemePreference(value)).toBe(value);
  });

  it('falls back to system for missing, corrupt, and non-string values', () => {
    expect(parseThemePreference(null)).toBe('system');
    expect(parseThemePreference(undefined)).toBe('system');
    expect(parseThemePreference('contrast')).toBe('system');
    expect(parseThemePreference('{"theme":"dark"}')).toBe('system');
  });

  it('uses the stable browser storage key', () => {
    expect(THEME_STORAGE_KEY).toBe('learn-about-games:theme:v1');
  });
});
