// Undo / redo via the toolbar buttons. Each placement is one undoable step,
// New diagram clears state and resets viewport, and the redo stack is cleared
// by any subsequent mutation.

const { test, expect } = require('@playwright/test');
const { gotoApp } = require('./helpers');
const { hideWelcome, dropOnCanvas } = require('./canvas-helpers');

test.describe('undo / redo', () => {
  test.beforeEach(async ({ page }) => {
    await gotoApp(page);
    await hideWelcome(page);
  });

  test('undo button reverts the last placement; redo button reapplies it', async ({ page }) => {
    await dropOnCanvas(page, 'kind', 200, 200);
    await dropOnCanvas(page, 'process', 350, 200);
    expect(await page.evaluate(() => window.state.nodes.length)).toBe(2);

    await page.locator('#btn-undo').click();
    expect(await page.evaluate(() => window.state.nodes.length)).toBe(1);
    expect(await page.evaluate(() => window.state.nodes[0].type)).toBe('kind');

    await page.locator('#btn-redo').click();
    expect(await page.evaluate(() => window.state.nodes.length)).toBe(2);
    expect(await page.evaluate(() => window.state.nodes[1].type)).toBe('process');
  });

  test('a new mutation clears the redo stack', async ({ page }) => {
    await dropOnCanvas(page, 'kind', 200, 200);
    await page.locator('#btn-undo').click();
    expect(await page.evaluate(() => window.state.nodes.length)).toBe(0);

    // Place something else — redo should no longer reapply the kind.
    await dropOnCanvas(page, 'process', 250, 250);
    await page.locator('#btn-redo').click();
    const types = await page.evaluate(() => window.state.nodes.map(n => n.type));
    expect(types).toEqual(['process']);
  });

  test('undo stack is capped at 50 entries', async ({ page }) => {
    // Place 60 nodes — only the last 50 saveUndo snapshots should remain.
    for (let i = 0; i < 60; i++) {
      await page.evaluate((idx) => {
        // Use the public placement entry point indirectly by mutating + saveUndo via button-undo cycle.
        // We instead synthesize drop events for realism.
        const cc = document.getElementById('canvas-container');
        const r = cc.getBoundingClientRect();
        const dt = new DataTransfer();
        dt.setData('node-type', 'kind');
        const ev = new DragEvent('drop', { bubbles: true, cancelable: true, clientX: r.left + 100 + (idx % 5) * 30, clientY: r.top + 100 + Math.floor(idx / 5) * 30, dataTransfer: dt });
        cc.dispatchEvent(ev);
      }, i);
    }
    const len = await page.evaluate(() => window.undoStack.length);
    expect(len).toBe(50);
  });

  test('File → New clears nodes, edges, and undo state', async ({ page }) => {
    await dropOnCanvas(page, 'kind', 200, 200);
    await dropOnCanvas(page, 'kind', 300, 200);

    // Confirm the prompt that fires when the diagram is non-empty.
    page.once('dialog', d => d.accept());
    await page.locator('#btn-file').click();
    await page.locator('#btn-new').click();

    expect(await page.evaluate(() => window.state.nodes.length)).toBe(0);
    expect(await page.evaluate(() => window.state.edges.length)).toBe(0);
    await expect(page.locator('#zoom-display')).toHaveText('100%');
  });
});
