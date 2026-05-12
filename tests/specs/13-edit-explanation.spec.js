// Critical paths #27–32: Bidirectional editing — edit Explain prose,
// AI returns a JSON delta, graph mutates accordingly.

const { test, expect } = require('@playwright/test');
const {
  gotoApp,
  ANTHROPIC_URL,
  openAIPanel,
  seedNodes,
  getNodeCount,
  getEdgeCount,
} = require('./helpers');

const KEY = 'sk-ant-test-1234567890';

// Stage an Explain response, then return the editable .ai-msg-explain locator
// and a `requests` array that captures all subsequent Anthropic POSTs.
async function setupExplainAndCapture(page, explanationText) {
  let callIndex = 0;
  const requests = [];
  await page.route(ANTHROPIC_URL, async (route) => {
    requests.push(JSON.parse(route.request().postData() || '{}'));
    const i = callIndex++;
    let text;
    if (i === 0) {
      // First call is the Explain.
      text = explanationText;
    } else {
      // Second call is the delta — handlers can override per-test by re-routing.
      text = JSON.stringify({ description: 'no-op', add_nodes: [], add_edges: [], update_nodes: [], remove_node_ids: [], remove_edge_ids: [] });
    }
    await route.fulfill({
      status: 200, contentType: 'application/json',
      body: JSON.stringify({
        id: 'm', type: 'message', role: 'assistant', model: 'claude-sonnet-4-6',
        content: [{ type: 'text', text }],
        stop_reason: 'end_turn', usage: { input_tokens: 10, output_tokens: 20 },
      }),
    });
  });
  return requests;
}

test('Explain message shows an Edit button; Cancel restores the original prose', async ({ page }) => {
  await gotoApp(page, { aiKey: KEY });
  await seedNodes(page, 2);
  await setupExplainAndCapture(page, 'A simple two-kind ontology.');
  await openAIPanel(page);
  await page.locator('#ai-explain-btn').click();

  const explainMsg = page.locator('.ai-msg-explain');
  await expect(explainMsg).toBeVisible();
  await expect(explainMsg.locator('.ai-edit-btn')).toBeVisible();

  await explainMsg.locator('.ai-edit-btn').click();
  await expect(explainMsg.locator('.ai-msg-editor')).toBeVisible();
  await expect(explainMsg.locator('.ai-edit-save-btn')).toBeVisible();
  await expect(explainMsg.locator('.ai-edit-cancel-btn')).toBeVisible();

  await explainMsg.locator('.ai-edit-cancel-btn').click();
  await expect(explainMsg.locator('.ai-msg-editor')).toHaveCount(0);
  await expect(explainMsg.locator('.ai-msg-body')).toContainText('A simple two-kind ontology');
  await expect(explainMsg.locator('.ai-edit-btn')).toBeVisible();
});

test('saving an unchanged edit is a no-op and makes no API call', async ({ page }) => {
  await gotoApp(page, { aiKey: KEY });
  await seedNodes(page, 2);
  let callCount = 0;
  await page.route(ANTHROPIC_URL, async (route) => {
    callCount++;
    await route.fulfill({
      status: 200, contentType: 'application/json',
      body: JSON.stringify({
        id: 'm', type: 'message', role: 'assistant', model: 'claude-sonnet-4-6',
        content: [{ type: 'text', text: 'Original explanation here.' }],
        stop_reason: 'end_turn', usage: { input_tokens: 10, output_tokens: 20 },
      }),
    });
  });
  await openAIPanel(page);
  await page.locator('#ai-explain-btn').click();
  await expect(page.locator('.ai-msg-explain')).toBeVisible();
  expect(callCount).toBe(1);

  await page.locator('.ai-msg-explain .ai-edit-btn').click();
  // Don't change the text — just save.
  await page.locator('.ai-msg-explain .ai-edit-save-btn').click();

  // No second call.
  await page.waitForTimeout(200);
  expect(callCount).toBe(1);
  // Editor closed, Edit button restored.
  await expect(page.locator('.ai-msg-explain .ai-msg-editor')).toHaveCount(0);
  await expect(page.locator('.ai-msg-explain .ai-edit-btn')).toBeVisible();
});

test('happy path: edit prose → AI delta adds a node and an edge to the existing graph', async ({ page }) => {
  await gotoApp(page, { aiKey: KEY });
  await seedNodes(page, 2);
  const beforeIds = await page.evaluate(() => window.state.nodes.map(n => n.id));
  expect(beforeIds).toHaveLength(2);

  let callIndex = 0;
  const requests = [];
  await page.route(ANTHROPIC_URL, async (route) => {
    requests.push(JSON.parse(route.request().postData() || '{}'));
    const i = callIndex++;
    let text;
    if (i === 0) {
      text = 'Two kinds: Seed 0 and Seed 1.';
    } else {
      text = JSON.stringify({
        description: 'Added a Doctor.',
        add_nodes: [{ id: 'n1', type: 'kind', label: 'Doctor' }],
        add_edges: [{ id: 'e1', from: beforeIds[0], to: 'n1', type: 'subkind-of', label: '' }],
      });
    }
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
  await expect(page.locator('.ai-msg-explain')).toBeVisible();

  await page.locator('.ai-msg-explain .ai-edit-btn').click();
  // Replace the editable body with new prose.
  await page.locator('.ai-msg-explain .ai-msg-editor').evaluate((el) => {
    el.innerText = 'Three kinds: Seed 0, Seed 1, and Doctor (a subkind of Seed 0).';
  });
  await page.locator('.ai-msg-explain .ai-edit-save-btn').click();

  // Wait for delta to apply.
  await page.waitForFunction(() => window.state.nodes.length === 3);
  expect(await getEdgeCount(page)).toBe(1);

  // Existing node IDs preserved (positions intact).
  const afterIds = await page.evaluate(() => window.state.nodes.map(n => n.id));
  for (const id of beforeIds) expect(afterIds).toContain(id);

  // New edge resolves the prefixed new-node id and references the existing one.
  const edge = await page.evaluate(() => window.state.edges[0]);
  expect(edge.fromId).toBe(beforeIds[0]);
  expect(afterIds).toContain(edge.toId);

  // The delta request body must include all three pieces of context.
  const deltaReq = requests[1];
  const lastMsg = deltaReq.messages.at(-1).content;
  expect(lastMsg).toMatch(/Original graph/);
  expect(lastMsg).toMatch(/Original explanation/);
  expect(lastMsg).toMatch(/Edited explanation/);
  expect(lastMsg).toMatch(/Doctor/);
});

test('delta with update_nodes mutates label in place and preserves x/y', async ({ page }) => {
  await gotoApp(page, { aiKey: KEY });
  await seedNodes(page, 2);
  const target = await page.evaluate(() => ({ id: window.state.nodes[0].id, x: window.state.nodes[0].x, y: window.state.nodes[0].y }));

  let i = 0;
  await page.route(ANTHROPIC_URL, async (route) => {
    const idx = i++;
    const text = idx === 0
      ? 'Two seeds.'
      : JSON.stringify({ description: 'Renamed.', update_nodes: [{ id: target.id, label: 'RenamedNode' }] });
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
  await expect(page.locator('.ai-msg-explain')).toBeVisible();
  await page.locator('.ai-msg-explain .ai-edit-btn').click();
  await page.locator('.ai-msg-explain .ai-msg-editor').evaluate((el) => { el.innerText = 'Two seeds; the first is named RenamedNode.'; });
  await page.locator('.ai-msg-explain .ai-edit-save-btn').click();

  await page.waitForFunction((id) => window.state.nodes.find(n => n.id === id)?.label === 'RenamedNode', target.id);
  const after = await page.evaluate((id) => window.state.nodes.find(n => n.id === id), target.id);
  expect(after.label).toBe('RenamedNode');
  expect(after.x).toBe(target.x);
  expect(after.y).toBe(target.y);
});

test('delta with remove_node_ids removes the node and any edges referencing it', async ({ page }) => {
  await gotoApp(page, { aiKey: KEY });
  // Seed two nodes plus an edge between them so we can verify cascading removal.
  await seedNodes(page, 2);
  await page.evaluate(() => {
    window.state.edges.push({
      id: 'pre-edge-1',
      fromId: window.state.nodes[0].id,
      toId:   window.state.nodes[1].id,
      type: 'subkind-of', label: '',
    });
  });
  const targetId = await page.evaluate(() => window.state.nodes[1].id);

  let i = 0;
  await page.route(ANTHROPIC_URL, async (route) => {
    const idx = i++;
    const text = idx === 0
      ? 'A connected pair.'
      : JSON.stringify({ description: 'Removed second node.', remove_node_ids: [targetId] });
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
  await expect(page.locator('.ai-msg-explain')).toBeVisible();
  await page.locator('.ai-msg-explain .ai-edit-btn').click();
  await page.locator('.ai-msg-explain .ai-msg-editor').evaluate((el) => { el.innerText = 'A single concept.'; });
  await page.locator('.ai-msg-explain .ai-edit-save-btn').click();

  await page.waitForFunction(() => window.state.nodes.length === 1);
  // Cascading: the edge that referenced the removed node is gone too.
  expect(await getEdgeCount(page)).toBe(0);
});

test('delta referencing a non-existent node id surfaces a validation error and does not mutate state', async ({ page }) => {
  await gotoApp(page, { aiKey: KEY });
  await seedNodes(page, 2);

  let i = 0;
  await page.route(ANTHROPIC_URL, async (route) => {
    const idx = i++;
    const text = idx === 0
      ? 'A pair.'
      : JSON.stringify({ description: 'bad', update_nodes: [{ id: 'no-such-id', label: 'X' }] });
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
  await expect(page.locator('.ai-msg-explain')).toBeVisible();

  const before = { n: await getNodeCount(page), e: await getEdgeCount(page) };

  await page.locator('.ai-msg-explain .ai-edit-btn').click();
  await page.locator('.ai-msg-explain .ai-msg-editor').evaluate((el) => { el.innerText = 'modified'; });
  await page.locator('.ai-msg-explain .ai-edit-save-btn').click();

  await expect(page.locator('.ai-error').last()).toBeVisible();
  expect(await page.locator('.ai-error').last().innerText()).toMatch(/unknown node id/i);
  expect(await getNodeCount(page)).toBe(before.n);
  expect(await getEdgeCount(page)).toBe(before.e);
});

test('after a successful delta apply, the explanation becomes static (no more Edit button)', async ({ page }) => {
  await gotoApp(page, { aiKey: KEY });
  await seedNodes(page, 2);
  let i = 0;
  await page.route(ANTHROPIC_URL, async (route) => {
    const idx = i++;
    const text = idx === 0
      ? 'Two seeds.'
      : JSON.stringify({ description: 'add one', add_nodes: [{ id: 'n1', type: 'kind', label: 'Three' }] });
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
  await expect(page.locator('.ai-msg-explain')).toBeVisible();
  await page.locator('.ai-msg-explain .ai-edit-btn').click();
  await page.locator('.ai-msg-explain .ai-msg-editor').evaluate((el) => { el.innerText = 'Three things now.'; });
  await page.locator('.ai-msg-explain .ai-edit-save-btn').click();

  await page.waitForFunction(() => window.state.nodes.length === 3);
  // The explain message now shows the edited prose, with no Edit affordance.
  await expect(page.locator('.ai-msg-explain .ai-msg-body')).toContainText('Three things now');
  await expect(page.locator('.ai-msg-explain .ai-edit-btn')).toHaveCount(0);
  await expect(page.locator('.ai-msg-explain .ai-msg-actions')).toHaveCount(0);
});

test('delta apply is undoable in one step', async ({ page }) => {
  await gotoApp(page, { aiKey: KEY });
  await seedNodes(page, 2);
  // Push a baseline undo entry so the test isn't bottoming out on an empty stack.
  await page.evaluate(() => window.saveUndo && window.saveUndo());

  let i = 0;
  await page.route(ANTHROPIC_URL, async (route) => {
    const idx = i++;
    const text = idx === 0
      ? 'Two.'
      : JSON.stringify({ description: 'add', add_nodes: [{ id: 'n1', type: 'kind', label: 'Added' }] });
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
  await expect(page.locator('.ai-msg-explain')).toBeVisible();
  await page.locator('.ai-msg-explain .ai-edit-btn').click();
  await page.locator('.ai-msg-explain .ai-msg-editor').evaluate((el) => { el.innerText = 'edit'; });
  await page.locator('.ai-msg-explain .ai-edit-save-btn').click();
  await page.waitForFunction(() => window.state.nodes.length === 3);

  // Move focus off the textarea (Undo guard: isTyping check) before Ctrl+Z.
  await page.locator('#canvas-container').click({ position: { x: 5, y: 5 } });
  const isMac = process.platform === 'darwin';
  await page.keyboard.press((isMac ? 'Meta' : 'Control') + '+KeyZ');
  await page.waitForFunction(() => window.state.nodes.length === 2);
});
