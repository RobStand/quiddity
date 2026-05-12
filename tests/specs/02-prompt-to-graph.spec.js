// Critical path #2: Happy path prompt → graph.
// With a key configured and the Anthropic API mocked, sending a prompt
// should add the returned nodes and edges to state and render them.

const { test, expect } = require('@playwright/test');
const { gotoApp, mockAnthropic, openAIPanel, sendPrompt, getNodeCount, getEdgeCount } = require('./helpers');

const HOSPITAL_GRAPH = {
  description: 'A minimal hospital model with patients, doctors, and treatment.',
  nodes: [
    { id: 'n1', type: 'kind', label: 'Patient' },
    { id: 'n2', type: 'kind', label: 'Doctor' },
    { id: 'n3', type: 'process', label: 'Treats' },
  ],
  edges: [
    { id: 'e1', from: 'n2', to: 'n3', type: 'connect-fwd', label: '' },
    { id: 'e2', from: 'n3', to: 'n1', type: 'connect-fwd', label: '' },
  ],
};

test('prompt → graph adds returned nodes and edges to the canvas', async ({ page }) => {
  await gotoApp(page, { aiKey: 'sk-ant-test-key-1234567890' });
  await mockAnthropic(page, HOSPITAL_GRAPH);
  await openAIPanel(page);

  expect(await getNodeCount(page)).toBe(0);
  expect(await getEdgeCount(page)).toBe(0);

  await sendPrompt(page, 'Model how a hospital manages patients.');

  // Wait for the merge to complete (state.nodes populated).
  await page.waitForFunction(() => window.state.nodes.length > 0, null, { timeout: 10_000 });

  expect(await getNodeCount(page)).toBe(3);
  expect(await getEdgeCount(page)).toBe(2);

  // Confirmation chip rendered with correct counts.
  const chip = page.locator('.ai-confirm-chip').last();
  await expect(chip).toBeVisible();
  await expect(chip).toContainText('3 nodes');
  await expect(chip).toContainText('2 edges');

  // Description text rendered as the AI message.
  await expect(page.locator('#ai-messages .ai-msg.ai').last())
    .toContainText('A minimal hospital model');

  // Spinner is gone.
  await expect(page.locator('#ai-canvas-spinner')).toBeHidden();

  // Nodes are actually rendered as SVG groups in the nodes layer.
  const renderedNodes = await page.locator('#nodes-layer > g').count();
  expect(renderedNodes).toBeGreaterThanOrEqual(3);
});
