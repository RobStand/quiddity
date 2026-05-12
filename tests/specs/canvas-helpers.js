// Helpers for non-AI canvas/UX tests.
// These exercise the real DOM interactions (drag-drop, clicks, keyboard) but
// also provide programmatic shortcuts for setup so individual tests stay fast.

const { expect } = require('@playwright/test');

// Hide the welcome screen so its centered card doesn't intercept clicks at the
// canvas center. The screen would auto-hide as soon as a node exists, but for
// tests that start from an empty canvas we hide it explicitly.
async function hideWelcome(page) {
  await page.evaluate(() => {
    const el = document.getElementById('welcome-screen');
    if (el) el.classList.add('hidden');
  });
}

// Bounding rect of #canvas-container in the page (client coords).
async function canvasRect(page) {
  return await page.evaluate(() => {
    const r = document.getElementById('canvas-container').getBoundingClientRect();
    return { x: r.left, y: r.top, width: r.width, height: r.height };
  });
}

// Simulate a successful HTML5 drag-and-drop of a toolbox item onto the canvas
// at the given client offset (relative to canvas-container's top-left).
//
// We dispatch a synthetic `drop` event with a real DataTransfer carrying the
// `node-type` payload — the app's drop listener reads exactly this and calls
// placeToolboxItem(type, clientX, clientY).
async function dropOnCanvas(page, type, dx, dy) {
  await page.evaluate(({ type, dx, dy }) => {
    const cc = document.getElementById('canvas-container');
    const rect = cc.getBoundingClientRect();
    const dt = new DataTransfer();
    dt.setData('node-type', type);
    const ev = new DragEvent('drop', {
      bubbles: true,
      cancelable: true,
      clientX: rect.left + dx,
      clientY: rect.top + dy,
      dataTransfer: dt,
    });
    cc.dispatchEvent(ev);
  }, { type, dx, dy });
}

// Seed N kind nodes at known world coordinates and re-render.
// Returns the array of node ids in insertion order.
async function seedKinds(page, positions) {
  return await page.evaluate((coords) => {
    const ids = [];
    for (let i = 0; i < coords.length; i++) {
      const id = 'k' + (i + 1);
      window.state.nodes.push({
        id,
        type: 'kind',
        label: 'K' + (i + 1),
        x: coords[i][0],
        y: coords[i][1],
      });
      ids.push(id);
    }
    window.renderAll();
    return ids;
  }, positions);
}

// Compute the client (page) coordinates of a node's center, accounting for the
// current viewport transform. Useful for real mouse interactions.
async function nodeClientCenter(page, id) {
  return await page.evaluate((nid) => {
    const n = window.state.nodes.find(x => x.id === nid);
    if (!n) throw new Error('no node ' + nid);
    const v = window.viewport;
    const cc = document.getElementById('canvas-container').getBoundingClientRect();
    return { x: cc.left + v.x + n.x * v.scale, y: cc.top + v.y + n.y * v.scale };
  }, id);
}

// Right-click a node by id (uses real mouse click).
async function rightClickNode(page, id) {
  const { x, y } = await nodeClientCenter(page, id);
  await page.mouse.click(x, y, { button: 'right' });
}

// Wait for the AI canvas/init to be ready (state + viewport exist).
async function waitForReady(page) {
  await page.waitForFunction(() => typeof window.state === 'object' && Array.isArray(window.state.nodes));
}

// Promise that resolves to the file the next download triggers (data URL or path).
// Reads the suggested filename only.
async function captureDownload(page, action) {
  const [download] = await Promise.all([page.waitForEvent('download'), action()]);
  return { name: download.suggestedFilename(), download };
}

module.exports = {
  hideWelcome,
  canvasRect,
  dropOnCanvas,
  seedKinds,
  nodeClientCenter,
  rightClickNode,
  waitForReady,
  captureDownload,
};
