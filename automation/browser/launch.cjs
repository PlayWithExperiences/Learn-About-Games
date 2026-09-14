// Launch (or reattach to) the persistent automation Chrome.
// Usage: LAG_BROWSER_PROFILE=<dir> LAG_CDP_PORT=9222 node launch.js [start-url] [--headless]
// The profile dir holds the Google login session. First run: headed, user logs in
// by hand in the opened window. Later runs reuse the session without any login.
// Never point the profile at a live user Chrome profile; never commit it to git.
const { chromium } = require('@playwright/test');

(async () => {
  const profile = process.env.LAG_BROWSER_PROFILE
    || (process.env.HOME + '/.local/state/learn-about-games/browser-profile');
  const port = process.env.LAG_CDP_PORT || '9222';
  const headless = process.argv.includes('--headless');
  const startUrl = process.argv.find((a) => /^https?:\/\//.test(a))
    || 'https://notebook.google.com/';
  // Extra Chrome switches, space separated. Needed on this machine because the local
  // proxy answers DNS with fake-IP addresses inside 198.18.0.0/15, which Chrome treats as
  // a local-network destination and blocks for the NotebookLM viewer origin with
  // ERR_BLOCKED_BY_LOCAL_NETWORK_ACCESS_CHECKS (observed 2026-09-14).
  const extraArgs = (process.env.LAG_CHROME_ARGS || '').split(' ').filter(Boolean);
  const ctx = await chromium.launchPersistentContext(profile, {
    channel: 'chrome',
    headless,
    // Playwright adds --no-sandbox by default unless this option is explicitly true.
    chromiumSandbox: process.env.LAG_NO_SANDBOX !== '1',
    args: [
      `--remote-debugging-port=${port}`,
      '--disable-blink-features=AutomationControlled',
      ...extraArgs,
    ],
  });
  const page = ctx.pages()[0] || await ctx.newPage();
  await page.goto(startUrl, { waitUntil: 'domcontentloaded', timeout: 60000 }).catch(() => {});
  console.log(`BROWSER_UP profile=${profile} port=${port} headless=${headless}`);
  await new Promise(() => {});
})().catch((e) => { console.error('LAUNCH_FAIL:', e.message.split('\n')[0]); process.exit(1); });
