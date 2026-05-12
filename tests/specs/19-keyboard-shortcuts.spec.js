// Keyboard shortcuts: Ctrl/Cmd+Z/Y/D/C/X/V, Delete/Backspace, and Escape.
// Shortcuts must be ignored when the user is typing in an input/textarea.

const { test, expect } = require('@playwright/test');
const { gotoApp } = require('./helpers');
const { hideWelcome, dropOnCanvas, seedKinds, nodeClientCenter } = require('./canvas-helpers');

const isMac = process.platform === 'darwin';
const MOD = isMac ? 'Meta' : 'Control';

test.describe('keyboard shortcuts', () => {
  test.beforeEach(async ({ page }) => {
    await gotoApp(page);
    await hideWelcome(page);
  });

  test('Ctrl/Cmd+Z undoes; Ctrl/Cmd+Y redoes', async ({ page }) => {
    await dropOnCanvas(page, 'kind', 200, 200);
    expect(await page.evaluate(() => window.state.nodes.length)).toBe(1);

    await page.keyboard.press(`${MOD}+z`);
    expect(await page.evaluate(() => window.state.nodes.length)).toBe(0);

    await page.keyboard.press(`${MOD}+y`);
    expect(await page.evaluate(() => window.state.nodes.length)).toBe(1);
  });

  test('Delete key removes the selected node', async ({ page }) => {
    await seedKinds(page, [[-100, 0]]);
    const c = await nodeClientCenter(page, 'k1');
    await page.mouse.click(c.x, c.y);
    await page.keyboard.press('Delete');
    expect(await page.evaluate(() => window.state.nodes.length)).toBe(0);
  });

  test('Backspace key also removes the selected node', async ({ page }) => {
    await seedKinds(page, [[-100, 0]]);
    const c = await nodeClientCenter(page, 'k1');
    await page.mouse.click(c.x, c.y);
    await page.keyboard.press('Backspace');
    expect(await page.evaluate(() => window.state.nodes.length)).toBe(0);
  });

  test('Ctrl/Cmd+D duplicates the selected node', async ({ page }) => {
    await seedKinds(page, [[-100, 0]]);
    const c = await nodeClientCenter(page, 'k1');
    await page.mouse.click(c.x, c.y);
    await page.keyboard.press(`${MOD}+d`);
    expect(await page.evaluate(() => window.state.nodes.length)).toBe(2);
  });

  test('Ctrl/Cmd+C then Ctrl/Cmd+V copies and pastes the selected node', async ({ page }) => {
    await seedKinds(page, [[-100, 0]]);
    const c = await nodeClientCenter(page, 'k1');
    await page.mouse.click(c.x, c.y);
    await page.keyboard.press(`${MOD}+c`);
    await page.keyboard.press(`${MOD}+v`);
    expect(await page.evaluate(() => window.state.nodes.length)).toBe(2);
  });

  test('Ctrl/Cmd+X cuts (delete + clipboard); subsequent paste restores it', async ({ page }) => {
    await seedKinds(page, [[-100, 0]]);
    const c = await nodeClientCenter(page, 'k1');
    await page.mouse.click(c.x, c.y);
    await page.keyboard.press(`${MOD}+x`);
    expect(await page.evaluate(() => window.state.nodes.length)).toBe(0);
    await page.keyboard.press(`${MOD}+v`);
    expect(await page.evaluate(() => window.state.nodes.length)).toBe(1);
  });

  test('shortcuts are ignored when typing in a text input', async ({ page }) => {
    await seedKinds(page, [[-100, 0]]);
    const c = await nodeClientCenter(page, 'k1');
    await page.mouse.click(c.x, c.y);
    // Focus the label input in the properties panel.
    const labelInput = page.locator('#prop-label');
    await labelInput.click();
    await labelInput.fill('Animal');

    // Pressing Delete in the input edits the input, NOT the canvas.
    await labelInput.press('End');
    await labelInput.press('Backspace');
    expect(await labelInput.inputValue()).toBe('Anima');
    expect(await page.evaluate(() => window.state.nodes.length)).toBe(1);
  });

  test('Escape cancels in-progress toolbox connection', async ({ page }) => {
    await seedKinds(page, [[-100, 0], [100, 0]]);
    await page.locator('.toolbox-item[data-type="connect-plain"]').click();
    expect(await page.evaluate(() => !!window.toolboxConnectStart)).toBe(true);
    await page.keyboard.press('Escape');
    expect(await page.evaluate(() => !!window.toolboxConnectStart)).toBe(false);
  });
});
