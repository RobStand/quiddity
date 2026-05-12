// Shared helpers for Quiddity end-to-end tests.
//
// All AI tests must mock the network — they should never hit a real LLM API.
// Use `mockAnthropic(page, payload)` (or `mockOpenAI` / `mockProvider`) to intercept
// outgoing AI calls.

const { expect } = require('@playwright/test');

const ANTHROPIC_URL = 'https://api.anthropic.com/v1/messages';
const OPENAI_URL    = 'https://api.openai.com/v1/chat/completions';

// Visit the app with a clean localStorage and the AI panel ready to use.
// `aiKey` (optional) is written to localStorage *before* the app boots so the
// panel comes up in the "key already saved" state.
//
// `legacyKey` (optional) seeds the pre-multi-provider `quiddity-ai-key` slot
// so migration behavior can be tested.
//
// `provider` (optional) sets `quiddity-ai-provider` (e.g. 'openai').
//
// The init script guards itself with sessionStorage so a `page.reload()` later
// in the test does not wipe the localStorage state we are trying to verify
// (sessionStorage persists across reloads but resets per browser context).
async function gotoApp(page, { aiKey, legacyKey, provider, openaiKey, customKey, customEndpoint, customModel } = {}) {
  await page.addInitScript((seed) => {
    try {
      if (sessionStorage.getItem('__quiddity_test_init__')) return;
      localStorage.clear();
      if (seed.legacyKey)     localStorage.setItem('quiddity-ai-key', seed.legacyKey);
      if (seed.aiKey)         localStorage.setItem('quiddity-ai-key-anthropic', seed.aiKey);
      if (seed.openaiKey)     localStorage.setItem('quiddity-ai-key-openai', seed.openaiKey);
      if (seed.customKey)     localStorage.setItem('quiddity-ai-key-custom', seed.customKey);
      if (seed.customEndpoint) localStorage.setItem('quiddity-ai-endpoint-custom', seed.customEndpoint);
      if (seed.customModel)   localStorage.setItem('quiddity-ai-model-custom', seed.customModel);
      if (seed.provider)      localStorage.setItem('quiddity-ai-provider', seed.provider);
      sessionStorage.setItem('__quiddity_test_init__', '1');
    } catch (e) {}
  }, { aiKey, legacyKey, provider, openaiKey, customKey, customEndpoint, customModel });
  await page.goto('/index.html');
  await page.waitForFunction(() => typeof window.state === 'object' && Array.isArray(window.state.nodes));
}

// Mock the Anthropic Messages endpoint to return a deterministic AI graph payload.
// `graph` is the inner JSON the app expects (description / nodes / edges).
async function mockAnthropic(page, graph) {
  await page.route(ANTHROPIC_URL, async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        id: 'msg_test',
        type: 'message',
        role: 'assistant',
        model: 'claude-sonnet-4-6',
        content: [{ type: 'text', text: JSON.stringify(graph) }],
        stop_reason: 'end_turn',
        usage: { input_tokens: 10, output_tokens: 20 },
      }),
    });
  });
}

// Mock the Anthropic endpoint to return a non-2xx error response.
// `body` is optional; defaults to a minimal Anthropic-style error payload.
async function mockAnthropicError(page, status, body) {
  await page.route(ANTHROPIC_URL, async (route) => {
    await route.fulfill({
      status,
      contentType: 'application/json',
      body: JSON.stringify(body || { type: 'error', error: { type: 'api_error', message: 'mocked' } }),
    });
  });
}

// Mock the Anthropic endpoint to return a 200 response whose `text` content
// is whatever raw string is provided (useful for malformed-JSON tests).
async function mockAnthropicRawText(page, rawText) {
  await page.route(ANTHROPIC_URL, async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        id: 'msg_test', type: 'message', role: 'assistant', model: 'claude-sonnet-4-6',
        content: [{ type: 'text', text: rawText }],
        stop_reason: 'end_turn', usage: { input_tokens: 10, output_tokens: 20 },
      }),
    });
  });
}

// Mock the OpenAI Chat Completions endpoint. Returns the same `graph` shape.
async function mockOpenAI(page, graph) {
  await page.route(OPENAI_URL, async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        id: 'chatcmpl_test',
        object: 'chat.completion',
        model: 'gpt-4o-mini',
        choices: [{
          index: 0,
          message: { role: 'assistant', content: JSON.stringify(graph) },
          finish_reason: 'stop',
        }],
        usage: { prompt_tokens: 10, completion_tokens: 20, total_tokens: 30 },
      }),
    });
  });
}

// Capture every request to a URL and store the parsed JSON bodies for assertions.
// Returns `{ requests }` — push happens before the response is fulfilled.
function captureAnthropic(page, graph) {
  const requests = [];
  page.route(ANTHROPIC_URL, async (route) => {
    try { requests.push(JSON.parse(route.request().postData() || '{}')); } catch (e) {}
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        id: 'msg_test', type: 'message', role: 'assistant', model: 'claude-sonnet-4-6',
        content: [{ type: 'text', text: JSON.stringify(graph) }],
        stop_reason: 'end_turn', usage: { input_tokens: 10, output_tokens: 20 },
      }),
    });
  });
  return { requests };
}

function captureOpenAI(page, graph) {
  const requests = [];
  const headers = [];
  page.route(OPENAI_URL, async (route) => {
    try { requests.push(JSON.parse(route.request().postData() || '{}')); } catch (e) {}
    headers.push(route.request().headers());
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        id: 'chatcmpl_test', object: 'chat.completion', model: 'gpt-4o-mini',
        choices: [{ index: 0, message: { role: 'assistant', content: JSON.stringify(graph) }, finish_reason: 'stop' }],
        usage: { prompt_tokens: 10, completion_tokens: 20, total_tokens: 30 },
      }),
    });
  });
  return { requests, headers };
}

// Open the AI panel and assert it is visible.
async function openAIPanel(page) {
  await page.locator('#btn-ai').click();
  await expect(page.locator('#ai-panel')).toHaveClass(/open/);
}

// Send a prompt through the AI textarea via Ctrl+Enter.
async function sendPrompt(page, prompt) {
  const ta = page.locator('#ai-textarea');
  await ta.fill(prompt);
  await ta.press('Control+Enter');
}

// Read state.nodes / state.edges from the page.
async function getNodeCount(page) { return page.evaluate(() => window.state.nodes.length); }
async function getEdgeCount(page) { return page.evaluate(() => window.state.edges.length); }

// Programmatically populate state.nodes for tests that need a large graph.
// Bypasses the toolbox/AI to keep setup fast.
async function seedNodes(page, count) {
  await page.evaluate((n) => {
    for (let i = 0; i < n; i++) {
      window.state.nodes.push({
        id: 'seed-' + i,
        type: 'kind',
        label: 'Seed ' + i,
        x: (i % 10) * 120,
        y: Math.floor(i / 10) * 100,
      });
    }
  }, count);
}

module.exports = {
  ANTHROPIC_URL,
  OPENAI_URL,
  gotoApp,
  mockAnthropic,
  mockAnthropicError,
  mockAnthropicRawText,
  mockOpenAI,
  captureAnthropic,
  captureOpenAI,
  openAIPanel,
  sendPrompt,
  getNodeCount,
  getEdgeCount,
  seedNodes,
};
