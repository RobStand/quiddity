// Inline label edit (double-click → input → Enter saves / Escape cancels)
// and example-loading from the Help → Examples submenu.

const { test, expect } = require('@playwright/test');
const { gotoApp } = require('./helpers');
const { hideWelcome, seedKinds, nodeClientCenter } = require('./canvas-helpers');

test.describe('inline edit + examples', () => {
  test.beforeEach(async ({ page }) => {
    await gotoApp(page);
    await hideWelcome(page);
  });

  test('double-clicking a node opens an inline editor; Enter saves the new label', async ({ page }) => {
    await seedKinds(page, [[-100, 0]]);
    const c = await nodeClientCenter(page, 'k1');
    await page.mouse.dblclick(c.x, c.y);
    const input = page.locator('#inline-edit-fo input, #inline-edit-fo textarea').first();
    await expect(input).toBeVisible();
    await input.fill('Mammal');
    await input.press('Enter');
    expect(await page.evaluate(() => window.state.nodes[0].label)).toBe('Mammal');
    await expect(page.locator('#inline-edit-fo')).toHaveCount(0);
  });

  test('Escape after dblclick removes the inline editor without saving the new text', async ({ page }) => {
    await seedKinds(page, [[-100, 0]]);
    await page.evaluate(() => { window.state.nodes[0].label = 'Original'; window.renderAll(); });
    const c = await nodeClientCenter(page, 'k1');
    await page.mouse.dblclick(c.x, c.y);
    // Press Escape immediately so the textarea contents are still the original label.
    await page.keyboard.press('Escape');
    await expect(page.locator('#inline-edit-fo')).toHaveCount(0);
    expect(await page.evaluate(() => window.state.nodes[0].label)).toBe('Original');
  });

  async function pickExample(page, key) {
    await page.locator('#btn-help-menu').click();
    await page.locator('.tb-dropdown-item-has-sub').hover();
    await page.locator(`[data-example="${key}"]`).click();
  }

  test('loading the Ballpoint Pen example populates 7 nodes and 6 part-of edges', async ({ page }) => {
    await pickExample(page, 'ballpoint-pen');
    await page.waitForFunction(() => window.state.nodes.length > 0);
    expect(await page.evaluate(() => window.state.nodes.length)).toBe(7);
    const edgeTypes = await page.evaluate(() => window.state.edges.map(e => e.type));
    expect(edgeTypes).toEqual(Array(6).fill('part-of'));
  });

  test('loading an example with existing content prompts before replacing', async ({ page }) => {
    await page.evaluate(() => {
      window.state.nodes.push({ id: 'old', type: 'kind', label: 'OldNode', x: 0, y: 0 });
      window.renderAll();
    });

    let dialogShown = false;
    page.once('dialog', d => { dialogShown = true; d.accept(); });
    await pickExample(page, 'vehicle-classification');

    await page.waitForFunction(() => window.state.nodes.length > 1);
    expect(dialogShown).toBe(true);
    const labels = await page.evaluate(() => window.state.nodes.map(n => n.label));
    expect(labels).not.toContain('OldNode');
  });

  test('all six examples each load a non-empty graph', async ({ page }) => {
    page.on('dialog', d => d.accept());
    const keys = ['ballpoint-pen', 'water-transitions', 'vehicle-classification', 'fastener-classification', 'agent-ontology', 'library-system'];
    for (const key of keys) {
      await pickExample(page, key);
      await page.waitForFunction(() => window.state.nodes.length > 0);
      const counts = await page.evaluate(() => ({ n: window.state.nodes.length, e: window.state.edges.length }));
      expect(counts.n, `${key} nodes`).toBeGreaterThan(0);
      expect(counts.e, `${key} edges`).toBeGreaterThan(0);
    }
  });
});
