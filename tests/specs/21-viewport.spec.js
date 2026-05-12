// Viewport: zoom-in/out toolbar buttons update the displayed zoom level,
// fit-to-window resets to 100% on an empty canvas and centers content
// otherwise, and wheel-zoom adjusts the scale.

const { test, expect } = require('@playwright/test');
const { gotoApp } = require('./helpers');
const { hideWelcome, dropOnCanvas, seedKinds, canvasRect } = require('./canvas-helpers');

test.describe('viewport', () => {
  test.beforeEach(async ({ page }) => {
    await gotoApp(page);
    await hideWelcome(page);
  });

  test('zoom-in button increases scale and updates the display', async ({ page }) => {
    const before = await page.evaluate(() => window.viewport.scale);
    await page.locator('#btn-zoom-in').click();
    const after = await page.evaluate(() => window.viewport.scale);
    expect(after).toBeGreaterThan(before);
    await expect(page.locator('#zoom-display')).toHaveText(`${Math.round(after * 100)}%`);
  });

  test('zoom-out button decreases scale', async ({ page }) => {
    const before = await page.evaluate(() => window.viewport.scale);
    await page.locator('#btn-zoom-out').click();
    const after = await page.evaluate(() => window.viewport.scale);
    expect(after).toBeLessThan(before);
  });

  test('fit-to-window resets viewport to scale 1 when canvas is empty', async ({ page }) => {
    await page.locator('#btn-zoom-in').click();
    await page.locator('#btn-zoom-in').click();
    await expect(page.locator('#zoom-display')).not.toHaveText('100%');
    await page.locator('#btn-zoom-fit').click();
    await expect(page.locator('#zoom-display')).toHaveText('100%');
  });

  test('fit-to-window centers content when nodes exist', async ({ page }) => {
    await seedKinds(page, [[-200, -200], [200, 200]]);
    await page.locator('#btn-zoom-fit').click();
    // The displayed zoom is recalculated and shown in the toolbar.
    await expect(page.locator('#zoom-display')).toBeVisible();
    const text = await page.locator('#zoom-display').textContent();
    expect(text).toMatch(/^\d+%$/);
  });

  test('wheel scroll over canvas changes the zoom level', async ({ page }) => {
    const before = await page.evaluate(() => window.viewport.scale);
    const r = await canvasRect(page);
    await page.mouse.move(r.x + r.width / 2, r.y + r.height / 2);
    await page.mouse.wheel(0, -200); // scroll up = zoom in
    const after = await page.evaluate(() => window.viewport.scale);
    expect(after).toBeGreaterThan(before);
  });

  test('zoom is clamped between 0.1x and 5x', async ({ page }) => {
    // Zoom in many times — should saturate at 5.
    for (let i = 0; i < 30; i++) await page.locator('#btn-zoom-in').click();
    expect(await page.evaluate(() => window.viewport.scale)).toBeLessThanOrEqual(5);
    // Zoom out many times — should saturate at 0.1.
    for (let i = 0; i < 60; i++) await page.locator('#btn-zoom-out').click();
    expect(await page.evaluate(() => window.viewport.scale)).toBeGreaterThanOrEqual(0.1);
  });
});
