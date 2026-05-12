// Critical path #23: Legacy `quiddity-ai-key` migration.
// Users who set their key before the multi-provider refactor stored it under
// `quiddity-ai-key`. On first load after upgrade, this key must be migrated
// to `quiddity-ai-key-anthropic` and the legacy slot cleared.

const { test, expect } = require('@playwright/test');
const { gotoApp, openAIPanel } = require('./helpers');

test('legacy quiddity-ai-key migrates to quiddity-ai-key-anthropic on first load', async ({ page }) => {
  const LEGACY = 'sk-ant-legacy-key-9876543210';
  await gotoApp(page, { legacyKey: LEGACY });
  await openAIPanel(page);

  // Migration runs lazily on the first call to getActiveProviderId(),
  // which fires when the AI panel opens (syncAIKeySection). After that
  // the panel must show the stored-key state.
  await expect(page.locator('#ai-key-stored-row')).toBeVisible();
  await expect(page.locator('#ai-key-input-row')).toBeHidden();

  const stored = await page.evaluate(() => ({
    legacy: localStorage.getItem('quiddity-ai-key'),
    anthropic: localStorage.getItem('quiddity-ai-key-anthropic'),
  }));
  expect(stored.anthropic).toBe(LEGACY);
  expect(stored.legacy).toBeNull();
});

test('legacy key does NOT overwrite an existing anthropic key', async ({ page }) => {
  const LEGACY = 'sk-ant-legacy';
  const NEW    = 'sk-ant-new-already-set';
  await gotoApp(page, { legacyKey: LEGACY, aiKey: NEW });
  await openAIPanel(page);

  const stored = await page.evaluate(() => ({
    legacy: localStorage.getItem('quiddity-ai-key'),
    anthropic: localStorage.getItem('quiddity-ai-key-anthropic'),
  }));
  // Legacy slot is cleared either way.
  expect(stored.legacy).toBeNull();
  // The new key wins — legacy must not clobber it.
  expect(stored.anthropic).toBe(NEW);
});
