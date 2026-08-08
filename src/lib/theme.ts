export type ThemePreference = 'system' | 'light' | 'dark';

export const THEME_STORAGE_KEY = 'learn-about-games:theme:v1';

export function parseThemePreference(value: unknown): ThemePreference {
  return value === 'system' || value === 'light' || value === 'dark' ? value : 'system';
}
