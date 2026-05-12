// Properties panel: empty/multi-select states, label edit syncs to render,
// kind ↔ individual toggle, color picker, referent fields.

const { test, expect } = require('@playwright/test');
const { gotoApp } = require('./helpers');
const { hideWelcome, dropOnCanvas, seedKinds, nodeClientCenter } = require('./canvas-helpers');

test.describe('properties panel', () => {
  test.beforeEach(async ({ page }) => {
    await gotoApp(page);
    await hideWelcome(page);
  });

  test('shows empty state when nothing is selected', async ({ page }) => {
    await expect(page.locator('#props-content .prop-empty')).toContainText('Select an element');
  });

  test('shows multi-select count when 2+ items are selected', async ({ page }) => {
    await seedKinds(page, [[-100, 0], [100, 0]]);
    const c1 = await nodeClientCenter(page, 'k1');
    const c2 = await nodeClientCenter(page, 'k2');
    await page.mouse.click(c1.x, c1.y);
    await page.keyboard.down('Shift');
    await page.mouse.click(c2.x, c2.y);
    await page.keyboard.up('Shift');
    await expect(page.locator('#props-content .prop-empty')).toContainText('2 elements selected');
  });

  test('editing the label input updates state and re-renders', async ({ page }) => {
    await seedKinds(page, [[-100, 0]]);
    const c = await nodeClientCenter(page, 'k1');
    await page.mouse.click(c.x, c.y);

    await page.locator('#prop-label').fill('Animal');
    expect(await page.evaluate(() => window.state.nodes[0].label)).toBe('Animal');
    // The rendered SVG text reflects the new label.
    await expect(page.locator(`#nodes-layer [data-id="k1"]`)).toContainText('Animal');
  });

  test('Individual checkbox toggles node type between kind and individual', async ({ page }) => {
    await seedKinds(page, [[-100, 0]]);
    const c = await nodeClientCenter(page, 'k1');
    await page.mouse.click(c.x, c.y);

    expect(await page.evaluate(() => window.state.nodes[0].type)).toBe('kind');
    await page.locator('#prop-individual').check();
    expect(await page.evaluate(() => window.state.nodes[0].type)).toBe('individual');
    await page.locator('#prop-individual').uncheck();
    expect(await page.evaluate(() => window.state.nodes[0].type)).toBe('kind');
  });

  test('clicking a color swatch sets node.color', async ({ page }) => {
    await seedKinds(page, [[-100, 0]]);
    const c = await nodeClientCenter(page, 'k1');
    await page.mouse.click(c.x, c.y);

    // The first non-default swatch is at index 1 (red).
    const swatches = page.locator('.color-picker .color-swatch');
    await expect(swatches).toHaveCount(await swatches.count());
    await swatches.nth(1).click();
    const color = await page.evaluate(() => window.state.nodes[0].color);
    expect(color).toBeTruthy();
    expect(typeof color).toBe('string');
    expect(color.startsWith('#')).toBe(true);
  });

  test('referent props expose Reference ID and Method Name fields', async ({ page }) => {
    await dropOnCanvas(page, 'referent', 0, 0);
    await expect(page.locator('#prop-refid')).toBeVisible();
    await expect(page.locator('#prop-method')).toBeVisible();

    await page.locator('#prop-refid').fill('TAX-001');
    await page.locator('#prop-method').fill('Linnaean');
    expect(await page.evaluate(() => window.state.nodes[0].refId)).toBe('TAX-001');
    expect(await page.evaluate(() => window.state.nodes[0].methodName)).toBe('Linnaean');
  });
});
