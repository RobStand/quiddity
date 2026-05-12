// Toolbox placement: dragging a toolbox item onto the canvas creates the
// corresponding node, and saves an undoable step. transition-instant is a
// special case — it toggles the `instantaneous` flag on an existing state
// transition node rather than creating a new node.

const { test, expect } = require('@playwright/test');
const { gotoApp } = require('./helpers');
const { hideWelcome, dropOnCanvas, seedKinds } = require('./canvas-helpers');

// Every "placeable" toolbox type — i.e. those that should add a node on drop.
// The connection-tool types (relation-second, relation-alt, connect-*, state-*)
// enter connection mode instead of placing a node — covered in spec 17.
const PLACEABLE_TYPES = [
  'kind',
  'individual',
  'relation-first',
  'process',
  'referent',
  'junction-xor',
  'junction-or',
  'junction-and',
  'container',
  'key',
];

test.describe('toolbox placement', () => {
  test.beforeEach(async ({ page }) => {
    await gotoApp(page);
    await hideWelcome(page);
  });

  for (const type of PLACEABLE_TYPES) {
    test(`drops a ${type} onto the canvas as a new node`, async ({ page }) => {
      expect(await page.evaluate(() => window.state.nodes.length)).toBe(0);
      await dropOnCanvas(page, type, 300, 200);
      const nodes = await page.evaluate(() => window.state.nodes.map(n => ({ type: n.type, id: n.id })));
      expect(nodes).toHaveLength(1);
      expect(nodes[0].type).toBe(type);
      // Newly placed node is selected (selection is rendered via stroke color,
      // not a CSS class — assert against the properties panel instead).
      await expect(page.locator('#props-content h3')).toBeVisible();
    });
  }

  test('placement is undoable in one step', async ({ page }) => {
    await dropOnCanvas(page, 'kind', 200, 200);
    await dropOnCanvas(page, 'kind', 400, 200);
    expect(await page.evaluate(() => window.state.nodes.length)).toBe(2);
    await page.locator('#btn-undo').click();
    expect(await page.evaluate(() => window.state.nodes.length)).toBe(1);
    await page.locator('#btn-undo').click();
    expect(await page.evaluate(() => window.state.nodes.length)).toBe(0);
  });

  test('placement is persisted to localStorage autosave', async ({ page }) => {
    await dropOnCanvas(page, 'kind', 250, 250);
    await dropOnCanvas(page, 'process', 400, 250);
    // Autosave runs synchronously inside saveUndo on every mutation.
    const saved = await page.evaluate(() => {
      const raw = localStorage.getItem('idef5_autosave');
      return raw ? JSON.parse(raw) : null;
    });
    expect(saved).not.toBeNull();
    expect(saved.nodes.length).toBeGreaterThanOrEqual(1);
    expect(saved.nodes.map(n => n.type)).toContain('kind');
  });

  test('welcome screen hides after first placement', async ({ page }) => {
    // Re-show welcome (we hid it in beforeEach for click safety).
    await page.evaluate(() => document.getElementById('welcome-screen').classList.remove('hidden'));
    await expect(page.locator('#welcome-screen')).not.toHaveClass(/hidden/);
    await dropOnCanvas(page, 'kind', 300, 300);
    await expect(page.locator('#welcome-screen')).toHaveClass(/hidden/);
  });

  test('transition-instant toggles instantaneous on a state-weak node', async ({ page }) => {
    // Seed a state-weak standalone node (not a midpoint junction).
    await page.evaluate(() => {
      window.state.nodes.push({ id: 's1', type: 'state-weak', label: '', x: 200, y: 200, w: 80, h: 40 });
      window.renderAll();
    });
    expect(await page.evaluate(() => window.state.nodes[0].instantaneous)).toBeFalsy();

    // Drop the transition-instant tool ON the state-weak node — toggles flag.
    await page.evaluate(() => {
      const n = window.state.nodes[0];
      const v = window.viewport;
      const cc = document.getElementById('canvas-container').getBoundingClientRect();
      const cx = cc.left + v.x + n.x * v.scale;
      const cy = cc.top + v.y + n.y * v.scale;
      const dt = new DataTransfer();
      dt.setData('node-type', 'transition-instant');
      const ev = new DragEvent('drop', { bubbles: true, cancelable: true, clientX: cx, clientY: cy, dataTransfer: dt });
      document.getElementById('canvas-container').dispatchEvent(ev);
    });
    expect(await page.evaluate(() => window.state.nodes[0].instantaneous)).toBe(true);
  });

  test('placed node renders into nodes-layer with matching data-id', async ({ page }) => {
    await dropOnCanvas(page, 'process', 300, 300);
    const id = await page.evaluate(() => window.state.nodes[0].id);
    await expect(page.locator(`#nodes-layer [data-id="${id}"]`)).toHaveCount(1);
  });
});
