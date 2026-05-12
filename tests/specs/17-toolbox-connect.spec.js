// Toolbox-initiated connections: clicking a connection-tool item enters
// connection mode, then clicking source + target creates an edge of the
// chosen type. Escape cancels mid-flow.

const { test, expect } = require('@playwright/test');
const { gotoApp } = require('./helpers');
const { hideWelcome, seedKinds, nodeClientCenter } = require('./canvas-helpers');

const CONNECTION_TOOLS = [
  { type: 'relation-second', edge: 'second-order' },
  { type: 'relation-alt',    edge: 'relation-alt' },
  { type: 'connect-fwd',     edge: 'connect-fwd' },
  { type: 'connect-bwd',     edge: 'connect-bwd' },
  { type: 'connect-plain',   edge: 'connect-plain' },
  { type: 'state-weak',      edge: 'state-weak' },
  { type: 'state-strong',    edge: 'state-strong' },
];

test.describe('toolbox-initiated connections', () => {
  test.beforeEach(async ({ page }) => {
    await gotoApp(page);
    await hideWelcome(page);
    await seedKinds(page, [[-100, 0], [100, 0]]);
  });

  for (const { type, edge } of CONNECTION_TOOLS) {
    test(`${type} tool creates a ${edge} edge between two nodes`, async ({ page }) => {
      // Click the toolbox item to enter connection mode.
      await page.locator(`.toolbox-item[data-type="${type}"]`).click();

      const c1 = await nodeClientCenter(page, 'k1');
      const c2 = await nodeClientCenter(page, 'k2');
      // Phase 1: click source node.
      await page.mouse.click(c1.x, c1.y);
      // Phase 2: click target node.
      await page.mouse.click(c2.x, c2.y);

      const edges = await page.evaluate(() => window.state.edges.map(e => ({
        type: e.type, fromId: e.fromId, toId: e.toId,
      })));
      expect(edges).toHaveLength(1);
      expect(edges[0]).toMatchObject({ type: edge, fromId: 'k1', toId: 'k2' });
    });
  }

  test('Escape cancels connection mode without creating an edge', async ({ page }) => {
    await page.locator('.toolbox-item[data-type="connect-plain"]').click();
    const c1 = await nodeClientCenter(page, 'k1');
    await page.mouse.click(c1.x, c1.y); // pick source
    await page.keyboard.press('Escape');

    // Now clicking the target should NOT create an edge — connection state is cleared.
    const c2 = await nodeClientCenter(page, 'k2');
    await page.mouse.click(c2.x, c2.y);
    expect(await page.evaluate(() => window.state.edges.length)).toBe(0);
  });

  test('clicking the same node twice does not create a self-loop', async ({ page }) => {
    await page.locator('.toolbox-item[data-type="connect-plain"]').click();
    const c1 = await nodeClientCenter(page, 'k1');
    await page.mouse.click(c1.x, c1.y);
    await page.mouse.click(c1.x, c1.y);
    expect(await page.evaluate(() => window.state.edges.length)).toBe(0);
  });

  test('with a single Kind already selected, clicking a connection tool pre-seeds the source', async ({ page }) => {
    // Select k1 via direct click.
    const c1 = await nodeClientCenter(page, 'k1');
    await page.mouse.click(c1.x, c1.y);

    await page.locator('.toolbox-item[data-type="connect-fwd"]').click();
    // Now only the target click is needed.
    const c2 = await nodeClientCenter(page, 'k2');
    await page.mouse.click(c2.x, c2.y);

    const edges = await page.evaluate(() => window.state.edges);
    expect(edges).toHaveLength(1);
    expect(edges[0].fromId).toBe('k1');
    expect(edges[0].toId).toBe('k2');
  });
});
