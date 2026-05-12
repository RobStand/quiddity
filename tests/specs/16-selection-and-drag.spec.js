// Selection and drag: click selects, shift toggles, click empty deselects,
// dragging a selected node moves it (snapped) and saves an undo step,
// rubber-band selection covers nodes whose centers fall inside the box.

const { test, expect } = require('@playwright/test');
const { gotoApp } = require('./helpers');
const { hideWelcome, seedKinds, nodeClientCenter, canvasRect } = require('./canvas-helpers');

async function selectedIds(page) {
  return await page.evaluate(() => Array.from(window.selectedIds));
}

test.describe('selection and drag', () => {
  test.beforeEach(async ({ page }) => {
    await gotoApp(page);
    await hideWelcome(page);
    await seedKinds(page, [[-200, 0], [0, 0], [200, 0]]);
  });

  test('clicking a node selects it and shows props', async ({ page }) => {
    const c = await nodeClientCenter(page, 'k1');
    await page.mouse.click(c.x, c.y);
    await expect(page.locator('#props-content h3')).toBeVisible();
    expect(await selectedIds(page)).toEqual(['k1']);
  });

  test('shift-clicking a second node adds it to the selection', async ({ page }) => {
    const c1 = await nodeClientCenter(page, 'k1');
    const c2 = await nodeClientCenter(page, 'k2');
    await page.mouse.click(c1.x, c1.y);
    await page.keyboard.down('Shift');
    await page.mouse.click(c2.x, c2.y);
    await page.keyboard.up('Shift');
    await expect(page.locator('#props-content .prop-empty')).toContainText('2 elements selected');
    expect(new Set(await selectedIds(page))).toEqual(new Set(['k1', 'k2']));
  });

  test('shift-clicking a selected node deselects it', async ({ page }) => {
    const c1 = await nodeClientCenter(page, 'k1');
    const c2 = await nodeClientCenter(page, 'k2');
    await page.mouse.click(c1.x, c1.y);
    await page.keyboard.down('Shift');
    await page.mouse.click(c2.x, c2.y);
    await page.mouse.click(c1.x, c1.y);
    await page.keyboard.up('Shift');
    expect(await selectedIds(page)).toEqual(['k2']);
  });

  test('clicking empty canvas deselects all', async ({ page }) => {
    const c = await nodeClientCenter(page, 'k1');
    await page.mouse.click(c.x, c.y);
    expect(await selectedIds(page)).toEqual(['k1']);

    const r = await canvasRect(page);
    // Click far below all seeded nodes (they're at y=200).
    await page.mouse.click(r.x + 100, r.y + r.height - 50);
    expect(await selectedIds(page)).toEqual([]);
    await expect(page.locator('#props-content .prop-empty')).toContainText('Select an element');
  });

  test('dragging a selected node moves it and saves an undo step', async ({ page }) => {
    const before = await page.evaluate(() => ({ x: window.state.nodes[0].x, y: window.state.nodes[0].y }));
    const c = await nodeClientCenter(page, 'k1');

    await page.mouse.move(c.x, c.y);
    await page.mouse.down();
    await page.mouse.move(c.x + 100, c.y + 60, { steps: 10 });
    await page.mouse.up();

    const after = await page.evaluate(() => ({ x: window.state.nodes[0].x, y: window.state.nodes[0].y }));
    expect(after.x).not.toBe(before.x);
    expect(after.y).not.toBe(before.y);
    // Coordinates are snapped to a 10px grid.
    expect(Math.abs(after.x % 10)).toBe(0);
    expect(Math.abs(after.y % 10)).toBe(0);

    // The drag pushed an undo step (pointerup → saveUndo when moved).
    const undoLen = await page.evaluate(() => window.undoStack.length);
    expect(undoLen).toBeGreaterThan(0);
  });

  test('rubber-band drag from empty space selects all enclosed nodes', async ({ page }) => {
    const r = await canvasRect(page);
    const c1 = await nodeClientCenter(page, 'k1');
    const c3 = await nodeClientCenter(page, 'k3');

    // Start above-left of k1, drag to below-right of k3 — should enclose all 3.
    const startX = Math.min(c1.x, c3.x) - 60;
    const startY = c1.y - 80;
    const endX   = Math.max(c1.x, c3.x) + 60;
    const endY   = c1.y + 80;

    await page.mouse.move(startX, startY);
    await page.mouse.down();
    await page.mouse.move(endX, endY, { steps: 10 });
    await page.mouse.up();

    expect(new Set(await selectedIds(page))).toEqual(new Set(['k1', 'k2', 'k3']));
  });
});
