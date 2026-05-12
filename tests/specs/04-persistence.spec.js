// Critical path #4: localStorage persistence survives a refresh.
// Both the AI key and the graph (autosaved under `idef5_autosave`) must be
// restored after a full page reload.

const { test, expect } = require('@playwright/test');
const { gotoApp, mockAnthropic, openAIPanel, sendPrompt, getNodeCount, getEdgeCount } = require('./helpers');

const PERSIST_GRAPH = {
  description: 'Two persisted nodes.',
  nodes: [
    { id: 'p1', type: 'kind', label: 'Persistent' },
    { id: 'p2', type: 'individual', label: 'Instance' },
  ],
  edges: [
    { id: 'e1', from: 'p2', to: 'p1', type: 'instance-of', label: '' },
  ],
};

test('AI key and generated graph survive a full page reload', async ({ page }) => {
  const KEY = 'sk-ant-persist-key-1234567890';
  await gotoApp(page, { aiKey: KEY });
  await mockAnthropic(page, PERSIST_GRAPH);
  await openAIPanel(page);

  await sendPrompt(page, 'Make two persisted concepts.');
  await page.waitForFunction(() => window.state.nodes.length === 2, null, { timeout: 10_000 });

  // Snapshot autosave to confirm it was actually written.
  const autosave = await page.evaluate(() => localStorage.getItem('idef5_autosave'));
  expect(autosave).not.toBeNull();
  const parsed = JSON.parse(autosave);
  expect(parsed.nodes).toHaveLength(2);
  expect(parsed.edges).toHaveLength(1);

  // Reload — but DO NOT clear localStorage this time (no addInitScript clear).
  await page.reload();
  await page.waitForFunction(() => typeof window.state === 'object' && Array.isArray(window.state.nodes));

  expect(await getNodeCount(page)).toBe(2);
  expect(await getEdgeCount(page)).toBe(1);

  // Open the panel and verify the key is still recognized as saved.
  await page.locator('#btn-ai').click();
  await expect(page.locator('#ai-key-stored-row')).toBeVisible();
  await expect(page.locator('#ai-key-input-row')).toBeHidden();
  const stored = await page.evaluate(() => localStorage.getItem('quiddity-ai-key-anthropic'));
  expect(stored).toBe(KEY);
});
