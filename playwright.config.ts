import { defineConfig, devices } from '@playwright/test';

declare const process: { env: Record<string, string | undefined> };

const baseURL = 'http://127.0.0.1:4321/Learn-About-Games/';

export default defineConfig({
  testDir: 'tests/e2e',
  use: {
    baseURL,
    trace: 'retain-on-failure',
  },
  webServer: {
    command: 'npm run preview -- --host 127.0.0.1',
    env: {
      ASTRO_PREVIEW_BACKGROUND: '0',
    },
    url: baseURL,
    reuseExistingServer: !process.env.CI,
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'mobile-chromium',
      use: { ...devices['Pixel 7'] },
    },
  ],
});
