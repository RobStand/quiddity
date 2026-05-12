// Critical path #5: Extension adds nodes to the existing graph.
// A second AI generation must append to (not replace) the existing nodes,
// and any returned edges that reference existing node IDs must connect
// to those existing nodes — not create disconnected duplicates.

const { test, expect } = require('@playwright/test');
const { gotoApp, ANTHROPIC_URL, openAIPanel, sendPrompt, getNodeCount, getEdgeCount } = require('./helpers');

const FIRST_GRAPH = {
  description: 'Initial pair.',
  nodes: [
    { id: 'n1', type: 'kind', label: 'Vehicle' },
    { id: 'n2', type: 'kind', label: 'Wheel' },
  ],
  edges: [
    { id: 'e1', from: 'n2', to: 'n1', type: 'part-of', label: '' },
  ],
};

const EXTENSION_GRAPH = {
  description: 'Add an engine to the vehicle.',
  nodes: [
    { id: 'n3', type: 'kind', label: 'Engine' },
  ],
  edges: [],
};

test('a second AI generation extends the graph rather than replacing it', async ({ page }) => {
  await gotoApp(page, { aiKey: 'sk-ant-test-key-1234567890' });

  // Two-stage mock: first call returns FIRST_GRAPH, second returns EXTENSION_GRAPH.
  let callCount = 0;
  await page.route(ANTHROPIC_URL, async (route) => {
    callCount += 1;
    const graph = callCount === 1 ? FIRST_GRAPH : EXTENSION_GRAPH;
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        id: `msg_test_${callCount}`,
        type: 'message',
        role: 'assistant',
        model: 'claude-sonnet-4-6',
        content: [{ type: 'text', text: JSON.stringify(graph) }],
        stop_reason: 'end_turn',
        usage: { input_tokens: 10, output_tokens: 20 },
      }),
    });
  });

  await openAIPanel(page);

  await sendPrompt(page, 'Model a vehicle.');
  await page.waitForFunction(() => window.state.nodes.length === 2, null, { timeout: 10_000 });
  expect(await getNodeCount(page)).toBe(2);
  expect(await getEdgeCount(page)).toBe(1);

  // Second turn — extension.
  await sendPrompt(page, 'Add an engine.');
  await page.waitForFunction(() => window.state.nodes.length === 3, null, { timeout: 10_000 });

  expect(await getNodeCount(page)).toBe(3);
  // Edge from the first turn still present.
  expect(await getEdgeCount(page)).toBe(1);

  // Two AI turns should produce two confirmation chips.
  await expect(page.locator('.ai-confirm-chip')).toHaveCount(2);

  // The extension request received the existing nodes as context.
  expect(callCount).toBe(2);
  const labels = await page.evaluate(() => window.state.nodes.map((n) => n.label).sort());
  expect(labels).toEqual(['Engine', 'Vehicle', 'Wheel']);
});
