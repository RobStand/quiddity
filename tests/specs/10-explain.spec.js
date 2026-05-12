// Critical paths #20–22: Explain button (graph → narration).
// The Explain button must be read-only — never modify state.nodes/edges or
// the AI conversation history — and must reject empty canvases gracefully.

const { test, expect } = require('@playwright/test');
const { gotoApp, captureAnthropic, ANTHROPIC_URL, openAIPanel, getNodeCount, getEdgeCount, seedNodes } = require('./helpers');

const KEY = 'sk-ant-test-1234567890';

test('Explain on an empty canvas shows an inline error and makes no API call', async ({ page }) => {
  await gotoApp(page, { aiKey: KEY });
  let calls = 0;
  await page.route(ANTHROPIC_URL, async (route) => { calls += 1; await route.abort(); });
  await openAIPanel(page);

  await page.locator('#ai-explain-btn').click();
  await expect(page.locator('.ai-error').last()).toBeVisible();
  expect(await page.locator('.ai-error').last().innerText()).toMatch(/nothing on the canvas/i);
  expect(calls).toBe(0);
});

test('Explain renders prose response and never mutates the graph', async ({ page }) => {
  await gotoApp(page, { aiKey: KEY });
  await seedNodes(page, 3);
  const before = { n: await getNodeCount(page), e: await getEdgeCount(page) };

  // Mock with prose (NOT JSON) — Explain expects free-form text.
  await page.route(ANTHROPIC_URL, async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        id: 'msg_explain', type: 'message', role: 'assistant', model: 'claude-sonnet-4-6',
        content: [{ type: 'text', text: 'This ontology models three kinds.\n\nThe kinds are Seed 0, Seed 1, and Seed 2.' }],
        stop_reason: 'end_turn', usage: { input_tokens: 10, output_tokens: 20 },
      }),
    });
  });

  await openAIPanel(page);
  await page.locator('#ai-explain-btn').click();

  // Wait for the prose response to render (two paragraphs).
  await expect(page.locator('#ai-messages .ai-msg.ai').last().locator('p')).toHaveCount(2);
  await expect(page.locator('#ai-messages .ai-msg.ai').last()).toContainText('This ontology models three kinds');
  await expect(page.locator('#ai-messages .ai-msg.ai').last()).toContainText('Seed 0');

  // State unchanged — Explain is read-only.
  expect(await getNodeCount(page)).toBe(before.n);
  expect(await getEdgeCount(page)).toBe(before.e);
});

test('Explain does not pollute aiConversationHistory used by Send', async ({ page }) => {
  await gotoApp(page, { aiKey: KEY });
  await seedNodes(page, 2);

  // First call is Explain (prose); second call is a normal Send (JSON).
  let callIndex = 0;
  const captured = [];
  await page.route(ANTHROPIC_URL, async (route) => {
    captured.push(JSON.parse(route.request().postData() || '{}'));
    const i = callIndex++;
    const text = i === 0
      ? 'A two-node model.'
      : JSON.stringify({ description: 'add', nodes: [{ id: 'n1', type: 'kind', label: 'New' }], edges: [] });
    await route.fulfill({
      status: 200, contentType: 'application/json',
      body: JSON.stringify({
        id: 'm', type: 'message', role: 'assistant', model: 'claude-sonnet-4-6',
        content: [{ type: 'text', text }],
        stop_reason: 'end_turn', usage: { input_tokens: 10, output_tokens: 20 },
      }),
    });
  });

  await openAIPanel(page);
  await page.locator('#ai-explain-btn').click();
  await page.waitForFunction(() => document.querySelectorAll('#ai-messages .ai-msg.ai').length >= 2);

  // Now send a normal prompt.
  const ta = page.locator('#ai-textarea');
  await ta.fill('Add one node.');
  await ta.press('Control+Enter');
  await page.waitForFunction(() => window.state.nodes.length === 3);

  // The Send call's `messages` array must NOT contain the Explain prompt
  // ("Explain this IDEF5 ontology") — i.e. Explain is ephemeral.
  expect(captured).toHaveLength(2);
  const sendMessages = captured[1].messages;
  for (const m of sendMessages) {
    expect(JSON.stringify(m)).not.toMatch(/Explain this IDEF5 ontology/i);
  }
});
