// Critical paths #17–19: Large-graph context truncation.
// When the graph exceeds AI_CONTEXT_NODE_LIMIT (50), the panel surfaces a
// warning chip AND the request payload is actually capped — only ~50 nodes
// nearest the viewport center are sent in `existing_nodes`.

const { test, expect } = require('@playwright/test');
const { gotoApp, captureAnthropic, openAIPanel, sendPrompt, seedNodes } = require('./helpers');

const KEY = 'sk-ant-test-1234567890';
const TINY_GRAPH = {
  description: 'one more concept',
  nodes: [{ id: 'new1', type: 'kind', label: 'Added' }],
  edges: [],
};

test('warning chip is hidden for small graphs and visible for large ones', async ({ page }) => {
  await gotoApp(page, { aiKey: KEY });
  await openAIPanel(page);
  await expect(page.locator('#ai-context-warning')).toBeHidden();

  // Seed 60 nodes — over the 50 limit. Re-open the panel to re-run the badge sync.
  await seedNodes(page, 60);
  await page.evaluate(() => window.updateAIContextBadge && window.updateAIContextBadge());
  // Even without exposing the function, closing+reopening triggers the sync.
  await page.locator('#ai-panel-close').click();
  await page.locator('#btn-ai').click();
  await expect(page.locator('#ai-context-warning')).toBeVisible();
  await expect(page.locator('#ai-context-warning')).toContainText(/truncated to 50/i);
});

test('outgoing request payload is capped at 50 existing_nodes for a large graph', async ({ page }) => {
  await gotoApp(page, { aiKey: KEY });
  await seedNodes(page, 200);
  const captured = captureAnthropic(page, TINY_GRAPH);
  await openAIPanel(page);

  await sendPrompt(page, 'Add one more.');
  await page.waitForFunction(() => window.state.nodes.length === 201);

  expect(captured.requests).toHaveLength(1);
  const lastMsg = captured.requests[0].messages.at(-1);
  // The context message body is a string: parse the embedded JSON.
  const match = lastMsg.content.match(/\{[\s\S]*\}/);
  expect(match).not.toBeNull();
  const ctx = JSON.parse(match[0]);
  expect(ctx.existing_nodes).toHaveLength(50);
  expect(lastMsg.content).toMatch(/truncated to 50 of 200/i);
});

test('truncation note is absent for small graphs', async ({ page }) => {
  await gotoApp(page, { aiKey: KEY });
  await seedNodes(page, 5);
  const captured = captureAnthropic(page, TINY_GRAPH);
  await openAIPanel(page);

  await sendPrompt(page, 'Add one more.');
  await page.waitForFunction(() => window.state.nodes.length === 6);

  const lastMsg = captured.requests[0].messages.at(-1);
  expect(lastMsg.content).not.toMatch(/truncated/i);
});
