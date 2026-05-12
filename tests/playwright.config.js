// Playwright config for Quiddity end-to-end tests.
//
// Quiddity is a static site, so we spin up `python3 -m http.server` on port 8765
// against the repository root (the parent of this `tests/` directory).
//
// Run from the `tests/` folder:
//   npm install
//   npx playwright install chromium
//   npm test

const { defineConfig, devices } = require('@playwright/test');
const path = require('path');

const PORT = 47821;
const REPO_ROOT = path.resolve(__dirname, '..');

module.exports = defineConfig({
  testDir: './specs',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  reporter: process.env.CI ? 'github' : [['list'], ['html', { open: 'never' }]],
  use: {
    baseURL: `http://127.0.0.1:${PORT}`,
    trace: 'on-first-retry',
    // Quiddity is desktop-first; the AI panel layout collapses below 900px.
    viewport: { width: 1280, height: 800 },
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
  ],
  webServer: {
    command: `python3 -m http.server ${PORT} --bind 127.0.0.1`,
    cwd: REPO_ROOT,
    url: `http://127.0.0.1:${PORT}/index.html`,
    reuseExistingServer: !process.env.CI,
    stdout: 'ignore',
    stderr: 'pipe',
    timeout: 30_000,
  },
});
