// Critical path #3: Undo reverts a full AI turn.
// After an AI generation adds N nodes, a single Ctrl/Cmd+Z must remove
// all of them — the AI turn is one undoable step, not N steps.

const { test, expect } = require('@playwright/test');
const os = require('os');
const { gotoApp, mockAnthropic, openAIPanel, sendPrompt, getNodeCount, getEdgeCount } = require('./helpers');

const UNDO_GRAPH = {
  description: 'Three connected concepts.',
  nodes: [
    { id: 'a', type: 'kind', label: 'Alpha' },
    { id: 'b', type: 'kind', label: 'Beta' },
    { id: 'c', type: 'kind', label: 'Gamma' },
  ],
  edges: [
    { id: 'e1', from: 'a', to: 'b', type: 'subkind-of', label: '' },
    { id: 'e2', from: 'b', to: 'c', type: 'subkind-of', label: '' },
  ],
};

const undoModifier = os.platform() === 'darwin' ? 'Meta' : 'Control';

test('one Ctrl/Cmd+Z reverts the entire AI turn', async ({ page }) => {
  await gotoApp(page, { aiKey: 'sk-ant-test-key-1234567890' });
  await mockAnthropic(page, UNDO_GRAPH);
  await openAIPanel(page);

  await sendPrompt(page, 'Make a tiny chain.');
  await page.waitForFunction(() => window.state.nodes.length === 3, null, { timeout: 10_000 });
  expect(await getEdgeCount(page)).toBe(2);

  // Move focus to the canvas so the keyboard shortcut is captured globally,
  // not by the AI textarea.
  await page.locator('#canvas-container').click({ position: { x: 50, y: 50 } });

  await page.keyboard.press(`${undoModifier}+z`);

  await page.waitForFunction(() => window.state.nodes.length === 0, null, { timeout: 5_000 });
  expect(await getNodeCount(page)).toBe(0);
  expect(await getEdgeCount(page)).toBe(0);
});
