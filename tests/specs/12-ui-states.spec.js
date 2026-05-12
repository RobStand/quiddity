// Critical paths #24–26: Smaller AI-panel UX guarantees.
// Empty-prompt no-op, blur-saves-key, panel close/reopen preserves messages.

const { test, expect } = require('@playwright/test');
const { gotoApp, mockAnthropic, ANTHROPIC_URL, openAIPanel, sendPrompt } = require('./helpers');

const KEY = 'sk-ant-test-1234567890';

test('clicking Send with an empty textarea is a no-op (no request, no error)', async ({ page }) => {
  await gotoApp(page, { aiKey: KEY });
  let calls = 0;
  await page.route(ANTHROPIC_URL, async (route) => { calls += 1; await route.abort(); });

  await openAIPanel(page);
  // Welcome message is the only AI message at this point.
  const before = await page.locator('#ai-messages .ai-msg').count();

  await page.locator('#ai-send-btn').click();
  // Give any errant async work a chance to fire.
  await page.waitForTimeout(200);

  expect(calls).toBe(0);
  await expect(page.locator('.ai-error')).toHaveCount(0);
  expect(await page.locator('#ai-messages .ai-msg').count()).toBe(before);
});

test('typing a key and blurring (without Enter) still saves it', async ({ page }) => {
  await gotoApp(page);
  await openAIPanel(page);

  const KEY_VIA_BLUR = 'sk-ant-blur-key-1234567890';
  await page.locator('#ai-key-input').fill(KEY_VIA_BLUR);
  // Move focus elsewhere to fire the blur handler.
  await page.locator('#ai-textarea').click();

  await expect(page.locator('#ai-key-stored-row')).toBeVisible();
  const stored = await page.evaluate(() => localStorage.getItem('quiddity-ai-key-anthropic'));
  expect(stored).toBe(KEY_VIA_BLUR);
});

test('closing and reopening the panel preserves the message thread', async ({ page }) => {
  await gotoApp(page, { aiKey: KEY });
  await mockAnthropic(page, {
    description: 'two concepts',
    nodes: [
      { id: 'a', type: 'kind', label: 'A' },
      { id: 'b', type: 'kind', label: 'B' },
    ],
    edges: [],
  });
  await openAIPanel(page);
  await sendPrompt(page, 'Make two.');
  await page.waitForFunction(() => window.state.nodes.length === 2);

  const before = await page.locator('#ai-messages .ai-msg').count();
  expect(before).toBeGreaterThanOrEqual(3); // welcome + user + ai

  await page.locator('#ai-panel-close').click();
  await expect(page.locator('#ai-panel')).not.toHaveClass(/open/);
  await page.locator('#btn-ai').click();
  await expect(page.locator('#ai-panel')).toHaveClass(/open/);

  // Messages survive close/reopen.
  expect(await page.locator('#ai-messages .ai-msg').count()).toBe(before);
});

test('Send button and textarea are disabled while a request is in flight', async ({ page }) => {
  await gotoApp(page, { aiKey: KEY });
  // Slow mock so we can observe the in-flight UI.
  await page.route(ANTHROPIC_URL, async (route) => {
    await new Promise((r) => setTimeout(r, 400));
    await route.fulfill({
      status: 200, contentType: 'application/json',
      body: JSON.stringify({
        id: 'm', type: 'message', role: 'assistant', model: 'claude-sonnet-4-6',
        content: [{ type: 'text', text: JSON.stringify({ description: 'x', nodes: [{ id: 'n1', type: 'kind', label: 'X' }], edges: [] }) }],
        stop_reason: 'end_turn', usage: { input_tokens: 10, output_tokens: 20 },
      }),
    });
  });

  await openAIPanel(page);
  await sendPrompt(page, 'Test in-flight UI.');

  // Mid-flight: spinner visible, both controls disabled.
  await expect(page.locator('#ai-canvas-spinner')).toBeVisible();
  await expect(page.locator('#ai-send-btn')).toBeDisabled();
  await expect(page.locator('#ai-textarea')).toBeDisabled();

  // After: re-enabled, spinner gone.
  await page.waitForFunction(() => window.state.nodes.length === 1);
  await expect(page.locator('#ai-canvas-spinner')).toBeHidden();
  await expect(page.locator('#ai-send-btn')).toBeEnabled();
  await expect(page.locator('#ai-textarea')).toBeEnabled();
});
