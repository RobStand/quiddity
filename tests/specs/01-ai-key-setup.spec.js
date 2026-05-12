// Critical path #1: API key setup flow.
// User opens the AI panel without a stored key, types one, and confirms it
// is saved (masked) in localStorage under the active provider's storage key.

const { test, expect } = require('@playwright/test');
const { gotoApp, openAIPanel } = require('./helpers');

test.describe('AI key setup', () => {
  test('typing a key and pressing Enter saves and masks it', async ({ page }) => {
    await gotoApp(page);
    await openAIPanel(page);

    // No-key state visible, stored-key state hidden.
    await expect(page.locator('#ai-key-input-row')).toBeVisible();
    await expect(page.locator('#ai-key-stored-row')).toBeHidden();

    const key = 'sk-ant-test-1234567890abcdef';
    const input = page.locator('#ai-key-input');
    await input.fill(key);
    await input.press('Enter');

    // Stored-key state now visible, raw key not in DOM.
    await expect(page.locator('#ai-key-stored-row')).toBeVisible();
    await expect(page.locator('#ai-key-input-row')).toBeHidden();

    const mask = await page.locator('#ai-key-mask').textContent();
    expect(mask).toContain('sk-ant-');
    expect(mask).not.toContain(key);
    expect(mask).toMatch(/•+/);

    // Persisted under the provider-aware storage key.
    const stored = await page.evaluate(() => localStorage.getItem('quiddity-ai-key-anthropic'));
    expect(stored).toBe(key);

    // Textarea hint should no longer prompt for a key.
    const placeholder = await page.locator('#ai-textarea').getAttribute('placeholder');
    expect(placeholder).not.toMatch(/API key/i);
  });

  test('clear button removes the stored key', async ({ page }) => {
    await gotoApp(page, { aiKey: 'sk-ant-existing-key-1234567890' });
    await openAIPanel(page);

    await expect(page.locator('#ai-key-stored-row')).toBeVisible();
    await page.locator('#ai-key-clear').click();

    await expect(page.locator('#ai-key-input-row')).toBeVisible();
    await expect(page.locator('#ai-key-stored-row')).toBeHidden();

    const stored = await page.evaluate(() => localStorage.getItem('quiddity-ai-key-anthropic'));
    expect(stored).toBeNull();
  });
});
