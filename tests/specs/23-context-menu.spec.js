// Right-click context menu: opens at cursor with target selected, action items
// (Delete, Duplicate, Bring to Front, Send to Back) work, Escape closes it.

const { test, expect } = require('@playwright/test');
const { gotoApp } = require('./helpers');
const { hideWelcome, seedKinds, nodeClientCenter, rightClickNode } = require('./canvas-helpers');

test.describe('context menu', () => {
  test.beforeEach(async ({ page }) => {
    await gotoApp(page);
    await hideWelcome(page);
    await seedKinds(page, [[-100, 0], [100, 0]]);
  });

  test('right-clicking a node selects it and opens the menu', async ({ page }) => {
    await rightClickNode(page, 'k1');
    await expect(page.locator('#context-menu')).toBeVisible();
    expect(await page.evaluate(() => Array.from(window.selectedIds))).toEqual(['k1']);
  });

  test('Delete item removes the right-clicked node', async ({ page }) => {
    await rightClickNode(page, 'k1');
    await page.locator('#ctx-delete').click();
    await expect(page.locator('#context-menu')).toBeHidden();
    const ids = await page.evaluate(() => window.state.nodes.map(n => n.id));
    expect(ids).toEqual(['k2']);
  });

  test('Duplicate item adds a copy of the right-clicked node', async ({ page }) => {
    await rightClickNode(page, 'k1');
    await page.locator('#ctx-duplicate').click();
    expect(await page.evaluate(() => window.state.nodes.length)).toBe(3);
  });

  test('Bring to Front moves the node to the end of state.nodes', async ({ page }) => {
    // k1 is currently first.
    await rightClickNode(page, 'k1');
    await page.locator('#ctx-front').click();
    const ids = await page.evaluate(() => window.state.nodes.map(n => n.id));
    expect(ids[ids.length - 1]).toBe('k1');
  });

  test('Send to Back moves the node to the start of state.nodes', async ({ page }) => {
    await rightClickNode(page, 'k2');
    await page.locator('#ctx-back').click();
    const ids = await page.evaluate(() => window.state.nodes.map(n => n.id));
    expect(ids[0]).toBe('k2');
  });

  test('Escape closes the context menu', async ({ page }) => {
    await rightClickNode(page, 'k1');
    await expect(page.locator('#context-menu')).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(page.locator('#context-menu')).toBeHidden();
  });

  test('any subsequent click closes the context menu', async ({ page }) => {
    await rightClickNode(page, 'k1');
    await expect(page.locator('#context-menu')).toBeVisible();
    // Click on empty toolbar area.
    await page.locator('.tb-label').click();
    await expect(page.locator('#context-menu')).toBeHidden();
  });
});
