// Critical paths #12–16: Multi-provider behavior.
// The provider abstraction (AI_PROVIDERS) must keep keys isolated per provider,
// dispatch each provider's wire format correctly, validate Custom-provider
// readiness, and persist the active provider across reload.

const { test, expect } = require('@playwright/test');
const {
  gotoApp,
  mockOpenAI,
  captureOpenAI,
  ANTHROPIC_URL,
  OPENAI_URL,
  openAIPanel,
  sendPrompt,
  getNodeCount,
} = require('./helpers');

const SIMPLE_GRAPH = {
  description: 'One concept.',
  nodes: [{ id: 'x', type: 'kind', label: 'Thing' }],
  edges: [],
};

test('OpenAI happy path: Bearer auth and OpenAI body shape', async ({ page }) => {
  await gotoApp(page, { provider: 'openai', openaiKey: 'sk-openai-test-key' });
  const captured = captureOpenAI(page, SIMPLE_GRAPH);
  await openAIPanel(page);

  await sendPrompt(page, 'Make a thing.');
  await page.waitForFunction(() => window.state.nodes.length === 1);

  expect(captured.requests).toHaveLength(1);
  const body = captured.requests[0];
  expect(body.model).toBe('gpt-4o-mini');
  // System prompt is delivered as the first message (OpenAI Chat Completions),
  // not as a top-level `system` field (which is the Anthropic shape).
  expect(body.messages[0].role).toBe('system');
  expect(body.system).toBeUndefined();
  expect(captured.headers[0].authorization).toBe('Bearer sk-openai-test-key');
  // Anthropic-only header must NOT leak into the OpenAI request.
  expect(captured.headers[0]['anthropic-version']).toBeUndefined();
  expect(captured.headers[0]['x-api-key']).toBeUndefined();
});

test('Custom provider blocks send when endpoint or model is missing', async ({ page }) => {
  await gotoApp(page, { provider: 'custom' });
  await openAIPanel(page);

  // No outbound calls should ever fire — fail loudly if any do.
  let calls = 0;
  await page.route('**/v1/**', async (route) => { calls += 1; await route.abort(); });

  await sendPrompt(page, 'Should be blocked');
  await expect(page.locator('.ai-error').last()).toBeVisible();
  expect(await page.locator('.ai-error').last().innerText()).toMatch(/endpoint|model/i);
  expect(calls).toBe(0);
  expect(await getNodeCount(page)).toBe(0);
});

test('Custom provider happy path: configured endpoint + model dispatch a request', async ({ page }) => {
  // Using OpenAI's URL as the "custom" endpoint so we can reuse the OpenAI mock shape.
  await gotoApp(page, {
    provider: 'custom',
    customEndpoint: OPENAI_URL,
    customModel: 'local-llama',
  });
  const captured = captureOpenAI(page, SIMPLE_GRAPH);
  await openAIPanel(page);

  await sendPrompt(page, 'Custom provider test.');
  await page.waitForFunction(() => window.state.nodes.length === 1);

  expect(captured.requests).toHaveLength(1);
  expect(captured.requests[0].model).toBe('local-llama');
  // No key set, so no Authorization header should be sent.
  expect(captured.headers[0].authorization).toBeUndefined();
});

test('keys are isolated per provider when switching back and forth', async ({ page }) => {
  await gotoApp(page, { aiKey: 'sk-ant-anthropic-key', openaiKey: 'sk-openai-key' });
  await openAIPanel(page);

  // Default provider is Anthropic — its key shows masked.
  await expect(page.locator('#ai-key-stored-row')).toBeVisible();
  let mask = await page.locator('#ai-key-mask').innerText();
  expect(mask).toContain('sk-ant-');

  // Switch to OpenAI — the OpenAI key should show, not Anthropic's.
  await page.locator('#ai-provider-select').selectOption('openai');
  await expect(page.locator('#ai-key-stored-row')).toBeVisible();
  mask = await page.locator('#ai-key-mask').innerText();
  expect(mask).toContain('sk-open');
  expect(mask).not.toContain('sk-ant-');

  // Switch back to Anthropic — original Anthropic key still there.
  await page.locator('#ai-provider-select').selectOption('anthropic');
  mask = await page.locator('#ai-key-mask').innerText();
  expect(mask).toContain('sk-ant-');

  // Both keys are still in localStorage.
  const stored = await page.evaluate(() => ({
    a: localStorage.getItem('quiddity-ai-key-anthropic'),
    o: localStorage.getItem('quiddity-ai-key-openai'),
  }));
  expect(stored.a).toBe('sk-ant-anthropic-key');
  expect(stored.o).toBe('sk-openai-key');
});

test('selected provider persists across reload', async ({ page }) => {
  await gotoApp(page, { aiKey: 'sk-ant-test-key', openaiKey: 'sk-openai-test-key' });
  await openAIPanel(page);
  await page.locator('#ai-provider-select').selectOption('openai');

  await page.reload();
  await page.waitForFunction(() => typeof window.state === 'object');
  await page.locator('#btn-ai').click();
  await expect(page.locator('#ai-provider-select')).toHaveValue('openai');
});

test('custom-only inputs are hidden for Anthropic and OpenAI', async ({ page }) => {
  await gotoApp(page);
  await openAIPanel(page);

  await expect(page.locator('#ai-custom-row')).toBeHidden();
  await page.locator('#ai-provider-select').selectOption('openai');
  await expect(page.locator('#ai-custom-row')).toBeHidden();
  await page.locator('#ai-provider-select').selectOption('custom');
  await expect(page.locator('#ai-custom-row')).toBeVisible();
});
