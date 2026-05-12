// Save / Load / Export. The Save JSON button triggers a browser download with
// the current state serialized to JSON. The Load JSON flow reads a chosen
// file and replaces state. Export to SVG triggers an SVG download.

const { test, expect } = require('@playwright/test');
const { gotoApp } = require('./helpers');
const { hideWelcome, dropOnCanvas, captureDownload } = require('./canvas-helpers');

test.describe('save / load / export', () => {
  test.beforeEach(async ({ page }) => {
    await gotoApp(page);
    await hideWelcome(page);
  });

  test('Save JSON downloads a file with the current state', async ({ page }) => {
    await dropOnCanvas(page, 'kind', 200, 200);
    await dropOnCanvas(page, 'process', 350, 200);

    const { name, download } = await captureDownload(page, async () => {
      await page.locator('#btn-file').click();
      await page.locator('#btn-save').click();
    });
    expect(name).toBe('idef5-diagram.json');

    // Read the downloaded file and verify it contains both nodes.
    const path = await download.path();
    const fs = require('fs');
    const data = JSON.parse(fs.readFileSync(path, 'utf-8'));
    expect(data.nodes).toHaveLength(2);
    expect(data.nodes.map(n => n.type).sort()).toEqual(['kind', 'process']);
  });

  test('Load JSON replaces the current diagram with the file contents', async ({ page }) => {
    await dropOnCanvas(page, 'kind', 200, 200);
    expect(await page.evaluate(() => window.state.nodes.length)).toBe(1);

    const payload = JSON.stringify({
      nodes: [
        { id: 'a', type: 'kind',       x: 0, y: 0, label: 'Loaded A' },
        { id: 'b', type: 'individual', x: 100, y: 0, label: 'Loaded B' },
        { id: 'c', type: 'process',    x: 200, y: 0, label: 'Loaded C' },
      ],
      edges: [
        { id: 'e1', type: 'instance-of', fromId: 'b', toId: 'a', label: '' },
      ],
      nextId: 10,
    });

    // Confirm the "replace current diagram" prompt.
    page.once('dialog', d => d.accept());
    await page.locator('#file-input').setInputFiles({
      name: 'sample.json',
      mimeType: 'application/json',
      buffer: Buffer.from(payload),
    });

    await page.waitForFunction(() => window.state.nodes.length === 3);
    const labels = await page.evaluate(() => window.state.nodes.map(n => n.label));
    expect(labels).toEqual(['Loaded A', 'Loaded B', 'Loaded C']);
    expect(await page.evaluate(() => window.state.edges.length)).toBe(1);
  });

  test('Load with malformed JSON shows an alert and leaves state untouched', async ({ page }) => {
    await dropOnCanvas(page, 'kind', 200, 200);
    page.on('dialog', d => d.accept()); // accept any prompts (replace + error alert)
    await page.locator('#file-input').setInputFiles({
      name: 'broken.json',
      mimeType: 'application/json',
      buffer: Buffer.from('{ not json'),
    });
    await page.waitForTimeout(150);
    // State preserved (saveUndo runs only inside the JSON.parse try).
    expect(await page.evaluate(() => window.state.nodes.length)).toBe(1);
  });

  test('Export to SVG triggers an SVG download', async ({ page }) => {
    await dropOnCanvas(page, 'kind', 200, 200);
    const { name } = await captureDownload(page, async () => {
      await page.locator('#btn-file').click();
      await page.locator('#btn-export-svg').click();
    });
    expect(name).toMatch(/\.svg$/);
  });
});
