// Critical paths #6–10: AI error handling.
// The panel must surface every distinct failure mode as an inline error chip
// in the AI message thread, never silently or as an unhandled rejection,
// and must NOT mutate the canvas state on failure.

const { test, expect } = require('@playwright/test');
const { gotoApp, mockAnthropic, mockAnthropicError, mockAnthropicRawText, openAIPanel, sendPrompt, getNodeCount } = require('./helpers');

const KEY = 'sk-ant-test-key-1234567890';

async function lastErrorText(page) {
  return page.locator('.ai-error').last().innerText();
}

test('401 from API renders an "API key rejected" error and leaves canvas empty', async ({ page }) => {
  await gotoApp(page, { aiKey: KEY });
  await mockAnthropicError(page, 401);
  await openAIPanel(page);

  await sendPrompt(page, 'Test 401');
  await expect(page.locator('.ai-error').last()).toBeVisible();
  expect(await lastErrorText(page)).toMatch(/API key rejected/i);
  expect(await getNodeCount(page)).toBe(0);
});

test('429 from API renders a rate-limit error', async ({ page }) => {
  await gotoApp(page, { aiKey: KEY });
  await mockAnthropicError(page, 429);
  await openAIPanel(page);

  await sendPrompt(page, 'Test 429');
  await expect(page.locator('.ai-error').last()).toBeVisible();
  expect(await lastErrorText(page)).toMatch(/Rate limited/i);
});

test('generic 500 from API renders a generic API error', async ({ page }) => {
  await gotoApp(page, { aiKey: KEY });
  await mockAnthropicError(page, 500);
  await openAIPanel(page);

  await sendPrompt(page, 'Test 500');
  await expect(page.locator('.ai-error').last()).toBeVisible();
  expect(await lastErrorText(page)).toMatch(/API error 500/i);
});

test('non-JSON response renders an "unexpected response" error', async ({ page }) => {
  await gotoApp(page, { aiKey: KEY });
  await mockAnthropicRawText(page, 'this is not JSON, just prose');
  await openAIPanel(page);

  await sendPrompt(page, 'Test malformed');
  await expect(page.locator('.ai-error').last()).toBeVisible();
  expect(await lastErrorText(page)).toMatch(/unexpected response/i);
  expect(await getNodeCount(page)).toBe(0);
});

test('valid JSON with empty nodes+edges renders a "empty graph" error', async ({ page }) => {
  await gotoApp(page, { aiKey: KEY });
  await mockAnthropic(page, { description: 'nothing', nodes: [], edges: [] });
  await openAIPanel(page);

  await sendPrompt(page, 'Test empty');
  await expect(page.locator('.ai-error').last()).toBeVisible();
  expect(await lastErrorText(page)).toMatch(/empty graph|unexpected response/i);
});

test('valid JSON with an unknown node type renders a validation error', async ({ page }) => {
  await gotoApp(page, { aiKey: KEY });
  await mockAnthropic(page, {
    description: 'bad type',
    nodes: [{ id: 'n1', type: 'sandwich', label: 'Reuben' }],
    edges: [],
  });
  await openAIPanel(page);

  await sendPrompt(page, 'Test bad type');
  await expect(page.locator('.ai-error').last()).toBeVisible();
  expect(await lastErrorText(page)).toMatch(/unknown node type/i);
  expect(await getNodeCount(page)).toBe(0);
});

test('error path preserves the textarea contents so the user can retry', async ({ page }) => {
  await gotoApp(page, { aiKey: KEY });
  await mockAnthropicError(page, 500);
  await openAIPanel(page);

  const PROMPT = 'My carefully crafted prompt';
  await sendPrompt(page, PROMPT);
  await expect(page.locator('.ai-error').last()).toBeVisible();
  await expect(page.locator('#ai-textarea')).toHaveValue(PROMPT);
});
