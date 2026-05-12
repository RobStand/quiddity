// Hover-driven edge creation: hover a node → popup palette → pick edge type → click target.

const { test, expect } = require('@playwright/test');
const { gotoApp } = require('./helpers');

const SHOW_DELAY = 350;

// Seed two kind nodes via evaluate, then re-render so they appear in the SVG layer.
async function seedTwoKinds(page) {
  await page.evaluate(() => {
    window.state.nodes.push(
      { id: 'k1', type: 'kind', label: 'Animal', x: 200, y: 200 },
      { id: 'k2', type: 'kind', label: 'Mammal', x: 400, y: 200 },
    );
    window.renderAll();
  });
}

async function hoverNode(page, id) {
  // Hover the SVG group for the given node id (uses its current screen bbox).
  const handle = await page.evaluateHandle((nid) => {
    return document.querySelector(`#nodes-layer [data-id="${nid}"]`);
  }, id);
  const el = handle.asElement();
  expect(el).not.toBeNull();
  await el.hover();
}

test('hovering a kind node shows the quick-edge palette after a short delay', async ({ page }) => {
  await gotoApp(page);
  await seedTwoKinds(page);

  const palette = page.locator('#quick-edge-palette');
  await expect(palette).toBeHidden();

  await hoverNode(page, 'k1');

  // Hidden immediately…
  await expect(palette).toBeHidden();
  // …shown after the show-delay window.
  await expect(palette).toBeVisible({ timeout: SHOW_DELAY + 500 });

  // All 11 edge-type buttons rendered.
  const buttons = palette.locator('button.qe-btn');
  await expect(buttons).toHaveCount(11);
});

test('container nodes do NOT show the quick-edge palette', async ({ page }) => {
  await gotoApp(page);
  await page.evaluate(() => {
    window.state.nodes.push({ id: 'c1', type: 'container', label: 'Group', x: 200, y: 200, w: 200, h: 150 });
    window.renderAll();
  });

  await hoverNode(page, 'c1');
  // Wait past the show delay; palette must remain hidden.
  await page.waitForTimeout(SHOW_DELAY + 200);
  await expect(page.locator('#quick-edge-palette')).toBeHidden();
});

test('clicking an edge-type button enters connection mode pre-seeded with the hovered node as source', async ({ page }) => {
  await gotoApp(page);
  await seedTwoKinds(page);

  await hoverNode(page, 'k1');
  await expect(page.locator('#quick-edge-palette')).toBeVisible({ timeout: SHOW_DELAY + 500 });

  await page.locator('#quick-edge-palette button[data-edge-type="subkind-of"]').click();

  // Palette is gone; we are now in phase-2 of the connection flow.
  await expect(page.locator('#quick-edge-palette')).toBeHidden();
  const connectStart = await page.evaluate(() => window.toolboxConnectStart);
  expect(connectStart).toEqual({ edgeType: 'subkind-of', fromId: 'k1' });

  // Hint banner is shown asking for the target node.
  await expect(page.locator('#toolbox-connect-hint')).toBeVisible();
});

test('after picking an edge type, clicking the target node creates the edge with the chosen type', async ({ page }) => {
  await gotoApp(page);
  await seedTwoKinds(page);

  await hoverNode(page, 'k1');
  await expect(page.locator('#quick-edge-palette')).toBeVisible({ timeout: SHOW_DELAY + 500 });
  await page.locator('#quick-edge-palette button[data-edge-type="part-of"]').click();

  // Click the target node (k2) to complete the connection.
  const k2 = await page.evaluateHandle(() => document.querySelector('#nodes-layer [data-id="k2"]'));
  await k2.asElement().click();

  // Edge created with the picked type. (Exactly one edge.)
  const edges = await page.evaluate(() => window.state.edges.map(e => ({
    fromId: e.fromId, toId: e.toId, type: e.type,
  })));
  expect(edges).toEqual([{ fromId: 'k1', toId: 'k2', type: 'part-of' }]);

  // Connection mode cleared.
  expect(await page.evaluate(() => window.toolboxConnectStart)).toBeNull();
});

test('Escape hides the palette', async ({ page }) => {
  await gotoApp(page);
  await seedTwoKinds(page);

  await hoverNode(page, 'k1');
  await expect(page.locator('#quick-edge-palette')).toBeVisible({ timeout: SHOW_DELAY + 500 });

  await page.keyboard.press('Escape');
  await expect(page.locator('#quick-edge-palette')).toBeHidden();
});

test('panning the canvas hides the palette', async ({ page }) => {
  await gotoApp(page);
  await seedTwoKinds(page);

  await hoverNode(page, 'k1');
  await expect(page.locator('#quick-edge-palette')).toBeVisible({ timeout: SHOW_DELAY + 500 });

  // Mutate the viewport directly and re-apply — same path as wheel/space-pan.
  await page.evaluate(() => {
    window.viewport.x += 50;
    window.applyViewport();
  });

  await expect(page.locator('#quick-edge-palette')).toBeHidden();
});

test('palette is suppressed while another connection is in progress', async ({ page }) => {
  await gotoApp(page);
  await seedTwoKinds(page);

  // Enter connection mode via the toolbox path before hovering.
  await page.evaluate(() => {
    window.toolboxConnectStart = { edgeType: 'connect-plain', fromId: null };
  });

  await hoverNode(page, 'k1');
  await page.waitForTimeout(SHOW_DELAY + 200);
  await expect(page.locator('#quick-edge-palette')).toBeHidden();
});
