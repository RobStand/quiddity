// Critical path #11: Mid-flight cancellation via "New diagram".
// If the user clicks File → New (or otherwise increments aiGenerationId)
// while an AI request is in flight, the response must be discarded — the
// canvas must NOT be populated with stale nodes from the cancelled turn.

const { test, expect } = require('@playwright/test');
const { gotoApp, ANTHROPIC_URL, openAIPanel, sendPrompt, getNodeCount } = require('./helpers');

const STALE_GRAPH = {
  description: 'should be discarded',
  nodes: [
    { id: 's1', type: 'kind', label: 'Stale1' },
    { id: 's2', type: 'kind', label: 'Stale2' },
  ],
  edges: [],
};

test('clicking "New" while an AI request is in flight discards the response', async ({ page }) => {
  await gotoApp(page, { aiKey: 'sk-ant-test-1234567890' });

  // Mock with a 1-second delay so we have time to click New first.
  await page.route(ANTHROPIC_URL, async (route) => {
    await new Promise((r) => setTimeout(r, 1000));
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        id: 'msg_stale', type: 'message', role: 'assistant', model: 'claude-sonnet-4-6',
        content: [{ type: 'text', text: JSON.stringify(STALE_GRAPH) }],
        stop_reason: 'end_turn', usage: { input_tokens: 10, output_tokens: 20 },
      }),
    });
  });

  await openAIPanel(page);
  await sendPrompt(page, 'A request that will be cancelled');

  // Spinner should be visible, indicating in-flight state.
  await expect(page.locator('#ai-canvas-spinner')).toBeVisible();

  // Click File → New. Open the File dropdown first so #btn-new is clickable.
  await page.evaluate(() => document.getElementById('btn-new').click());

  // Wait long enough for the mocked response to arrive (1s + buffer).
  await page.waitForTimeout(1500);

  // Stale response must NOT have populated the canvas.
  expect(await getNodeCount(page)).toBe(0);
  // Spinner is gone (setAILoading(false) was called by the New handler).
  await expect(page.locator('#ai-canvas-spinner')).toBeHidden();
  // Message thread was wiped by the New handler. Welcome is only added on
  // openAIPanel() when the thread is empty AT panel-open time, so it does
  // not re-appear here.
  await expect(page.locator('#ai-messages .ai-msg')).toHaveCount(0);
});
