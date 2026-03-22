'use strict';

// ============================================================
// CONSTANTS & CONFIG
// ============================================================
const DEFAULTS = {
  kindRadius: 40,
  relationW: 90,
  relationH: 32,
  relationAltW: 110,
  relationAltH: 30,
  processW: 100,
  processH: 60,
  referentW: 110,
  referentH: 60,
  junctionR: 20,
  stateW: 80,
  stateH: 30,
  transitionSize: 36,
  containerW: 300,
  containerH: 200,
  keyW: 180,
  keyHeaderH: 26,
  keyEntryH: 22,
  keyPad: 6,
  portRadius: 5,
  snapGrid: 10,
};

const NODE_TYPES = {
  kind:            { label: 'Kind',             defaultLabel: 'Kind' },
  individual:      { label: 'Individual',       defaultLabel: 'Individual' },
  'relation-first':{ label: '1st-Order Rel.',   defaultLabel: '' },
  'relation-second':{ label: '2nd-Order Rel.',  defaultLabel: '' },
  'relation-alt':   { label: 'Alt. 2-Place Rel.', defaultLabel: '' },
  process:         { label: 'Process',          defaultLabel: 'Process' },
  referent:        { label: 'Referent',         defaultLabel: 'Referent' },
  'junction-xor':  { label: 'Junction (XOR)',   defaultLabel: 'XOR' },
  'junction-or':   { label: 'Junction (OR)',    defaultLabel: 'OR' },
  'junction-and':  { label: 'Junction (AND)',   defaultLabel: 'AND' },
  'state-weak':    { label: 'State Trans. (Weak)', defaultLabel: '' },
  'state-strong':  { label: 'State Trans. (Strong)', defaultLabel: '' },
  'transition-instant': { label: 'Instant. Transition', defaultLabel: 'Δ' },
  'connect-fwd':   { label: 'Connect (Forward)',  defaultLabel: '' },
  'connect-bwd':   { label: 'Connect (Backward)', defaultLabel: '' },
  'connect-plain': { label: 'Connect (Plain)',    defaultLabel: '' },
  'container':     { label: 'Container',          defaultLabel: 'Group' },
  'key':           { label: 'Key',                defaultLabel: 'Key' },
};

const EDGE_TYPE_LABELS = {
  'first-order':    '',
  'second-order':   '',
  'subkind-of':     '',
  'instance-of':    '',
  'part-of':        '',
  'state-weak':     '',
  'state-strong':   '',
  'process-connect':'',
  'relation-alt':   '',
  'connect-fwd':    '',
  'connect-bwd':    '',
  'connect-plain':  '',
};

// Toolbox types that act as connection tools (not standalone nodes)
const TOOLBOX_EDGE_TYPES = {
  'relation-second':    'second-order',
  'relation-alt':       'relation-alt',
  'state-weak':         'state-weak',
  'state-strong':       'state-strong',
  'connect-fwd':        'connect-fwd',
  'connect-bwd':        'connect-bwd',
  'connect-plain':      'connect-plain',
};

const NODE_COLORS = [
  { label: 'Default',    value: '' },
  { label: 'Red',        value: '#dc2626' },
  { label: 'Orange',     value: '#dd6b20' },
  { label: 'Yellow',     value: '#d69e2e' },
  { label: 'Green',      value: '#38a169' },
  { label: 'Teal',       value: '#319795' },
  { label: 'Cyan',       value: '#00b5d8' },
  { label: 'Blue',       value: '#3182ce' },
  { label: 'Indigo',     value: '#5a67d8' },
  { label: 'Purple',     value: '#805ad5' },
  { label: 'Pink',       value: '#d53f8c' },
  { label: 'Rose',       value: '#e53e6e' },
  { label: 'Brown',      value: '#975a16' },
  { label: 'Gray',       value: '#718096' },
  { label: 'Dark Gray',  value: '#2d3748' },
  { label: 'Black',      value: '#000000' },
];

// Descriptions drawn from the IDEF5 Schematic Language basic lexicon
const SYMBOL_INFO = {
  // Node types
  'kind': 'A natural kind — a category of things that share essential, defining properties. Kinds are depicted as circles. They represent the ontological backbone of an IDEF5 model: the classes or types whose nature the modeler is capturing.',
  'individual': 'A specific, named instance of a kind. Depicted as a circle with a filled dot at the bottom. Individuals are particular things (not categories), and the dot distinguishes them from their parent kind.',
  'relation-first': 'A first-order relation — a relationship whose arguments are kinds or individuals. Depicted as a rectangle. Relations capture how kinds and individuals are associated, such as "contains", "precedes", or "is made of".',
  'relation-second': 'A second-order (2-place) relation — a relationship that takes another relation as one of its arguments. Depicted as a rectangle with a right-pointing filled triangle on the left. The triangle\'s tip connects to the relation line, indicating that this relation is "about" another relation.',
  'relation-alt': 'An alternative depiction of a 2-place first-order relation, used when the relation connects exactly two kinds or individuals. Rather than a separate relation box, the relation name is placed directly on the connecting line.',
  'process': 'A process or activity that takes kinds or individuals as inputs and produces transformed outputs. Depicted as a rounded rectangle. Processes represent dynamic aspects of the ontology — how things change, are created, or are destroyed.',
  'referent': 'A classification schema node, used to identify and reference kinds using a structured labeling scheme. Consists of three fields: a Reference ID (top-left), a Method Name (top-right), and a Concept Label (bottom). Used when a formal naming convention governs kind identification.',
  'state-weak': 'A weak state transition node. Represents a state change that is possible but not guaranteed — the transition may or may not occur. The small open circle at the midpoint of the arrow is the transition marker. Connect incoming and outgoing arcs to the circle.',
  'state-strong': 'A strong state transition node. Represents a state change that is necessary and irreversible under the specified conditions. The double arrowhead and midpoint circle distinguish it from a weak transition. Connect incoming and outgoing arcs to the circle.',
  'junction-and': 'A logical AND junction. All incoming flows must be satisfied for the outgoing flow to proceed. Used in process connection diagrams to represent concurrent or joint conditions.',
  'junction-or': 'A logical OR junction. At least one incoming flow must be satisfied for the outgoing flow to proceed. Used in process connection diagrams to represent alternative or disjunctive conditions.',
  'junction-xor': 'A logical XOR (exclusive-or) junction. Exactly one incoming flow must be satisfied. Used in process connection diagrams to represent mutually exclusive alternatives.',
  'connect-fwd': 'A forward connecting symbol. A solid line with a forward-pointing chevron (▶) at the midpoint. Used to show directed flow or association between elements in a process or state diagram.',
  'connect-bwd': 'A backward connecting symbol. A solid line with a backward-pointing chevron (◀) at the midpoint. Used to show reverse directed flow or association between elements.',
  'connect-plain': 'A plain connecting symbol. A solid line with no directional indicator. Used to associate elements without implying a direction — for example, connecting a process to a state transition circle.',
  'key': 'A legend box that explains the symbols used in the diagram. Each entry pairs a symbol with a descriptive label, helping readers interpret the schematic without having to know the IDEF5 notation by heart.',
  'container': 'A grouping container. A dashed rectangle used to visually group related symbols together on the diagram. The label appears in the top-left corner. Containers have no semantic effect on connections — they are purely organizational.',

  // Edge types
  'first-order': 'A first-order relation edge. Connects a relation node to the kinds or individuals it relates. The arrowhead points toward the node that plays the "range" role in the relation.',
  'second-order': 'A second-order relation edge. A solid line with a filled triangle at the source end, connecting a second-order relation node to the first-order relation it is "about". The triangle tip points into the line.',
  'subkind-of': 'A subkind-of relation. Asserts that the source kind is a specialization of the target kind — every instance of the subkind is necessarily an instance of the superkind. Depicted as a dashed line with an open triangular arrowhead pointing to the parent kind.',
  'instance-of': 'An instance-of relation. Asserts that the source individual is a member of the target kind. Depicted as a dashed line with a filled arrowhead pointing to the kind.',
  'part-of': 'A part-of relation. Asserts a mereological (compositional) relationship: the source is a part, component, or constituent of the target. Depicted as a solid line with an arrowhead pointing to the whole.',
  'state-weak': 'A weak state transition edge. Connects a source state (kind or individual) through a midpoint circle to a target state, representing a possible but non-mandatory state change.',
  'state-strong': 'A strong state transition edge. Connects a source state through a midpoint circle to a target state with a double arrowhead, representing a necessary and irreversible state change.',
  'process-connect': 'A process connection edge. Links processes, junctions, and state nodes in a process flow diagram, showing the sequence or dependency between process steps.',
  'relation-alt': 'An alternative first-order relation edge. Renders the relation name directly on the line rather than in a separate rectangle, used for concise 2-place relation depictions.',
  'connect-fwd': 'A forward connecting symbol edge. A solid line with a forward chevron at the midpoint, indicating directed association or flow from source to target.',
  'connect-bwd': 'A backward connecting symbol edge. A solid line with a backward chevron at the midpoint, indicating reverse directed association or flow.',
  'connect-plain': 'A plain connecting symbol edge. A solid undirected line, used to associate elements (such as a process node and a state transition circle) without implying direction.',
};

// ============================================================
// STATE MANAGEMENT
// ============================================================
let state = {
  nodes: [],
  edges: [],
  nextId: 1,
};

let undoStack = [];
let redoStack = [];
const MAX_UNDO = 50;
let isDirty = false;

let selectedIds = new Set();
let clipboard = { nodes: [], edges: [], pasteCount: 0 };
let viewport = { x: 0, y: 0, scale: 1 };

// Interaction state
let dragState = null;           // { type: 'node'|'canvas'|'rubberband', ... }
let editingNodeId = null;
let toolboxConnectStart = null; // { edgeType, fromId } — fromId null = still picking source

function saveUndo() {
  const snapshot = JSON.stringify({ nodes: state.nodes, edges: state.edges, nextId: state.nextId });
  undoStack.push(snapshot);
  if (undoStack.length > MAX_UNDO) undoStack.shift();
  redoStack = [];
  isDirty = true;
  persistLocal();
}

function undo() {
  if (!undoStack.length) return;
  const current = JSON.stringify({ nodes: state.nodes, edges: state.edges, nextId: state.nextId });
  redoStack.push(current);
  const prev = undoStack.pop();
  const parsed = JSON.parse(prev);
  state.nodes = parsed.nodes;
  state.edges = parsed.edges;
  state.nextId = parsed.nextId;
  selectedIds.clear();
  renderAll();
}

function redo() {
  if (!redoStack.length) return;
  const current = JSON.stringify({ nodes: state.nodes, edges: state.edges, nextId: state.nextId });
  undoStack.push(current);
  const next = redoStack.pop();
  const parsed = JSON.parse(next);
  state.nodes = parsed.nodes;
  state.edges = parsed.edges;
  state.nextId = parsed.nextId;
  selectedIds.clear();
  renderAll();
}

function persistLocal() {
  try { localStorage.setItem('idef5_autosave', JSON.stringify({ nodes: state.nodes, edges: state.edges, nextId: state.nextId })); } catch(e) {}
}

function loadLocal() {
  try {
    const s = localStorage.getItem('idef5_autosave');
    if (s) { const p = JSON.parse(s); state.nodes = p.nodes || []; state.edges = p.edges || []; state.nextId = p.nextId || 1; }
  } catch(e) {}
}

function nextId() { return state.nextId++; }

// ============================================================
// GEOMETRY HELPERS
// ============================================================
function getBBox(node) {
  switch (node.type) {
    case 'kind':
    case 'individual': {
      const r = node.r || DEFAULTS.kindRadius;
      return { x: node.x - r, y: node.y - r, w: r * 2, h: r * 2, cx: node.x, cy: node.y };
    }
    case 'relation-first':
    case 'relation-second':
    case 'relation-alt': {
      const w = node.w || (node.type === 'relation-alt' ? DEFAULTS.relationAltW : DEFAULTS.relationW);
      const h = node.h || (node.type === 'relation-alt' ? DEFAULTS.relationAltH : DEFAULTS.relationH);
      return { x: node.x - w/2, y: node.y - h/2, w, h, cx: node.x, cy: node.y };
    }
    case 'process': {
      const w = node.w || DEFAULTS.processW, h = node.h || DEFAULTS.processH;
      return { x: node.x - w/2, y: node.y - h/2, w, h, cx: node.x, cy: node.y };
    }
    case 'referent': {
      const w = node.w || DEFAULTS.referentW, h = node.h || DEFAULTS.referentH;
      return { x: node.x - w/2, y: node.y - h/2, w, h, cx: node.x, cy: node.y };
    }
    case 'junction-xor':
    case 'junction-or':
    case 'junction-and': {
      const r = DEFAULTS.junctionR;
      return { x: node.x - r, y: node.y - r, w: r * 2, h: r * 2, cx: node.x, cy: node.y };
    }
    case 'state-weak':
    case 'state-strong':
      if (node.junction) {
        const r = 5;
        return { x: node.x - r, y: node.y - r, w: r * 2, h: r * 2, cx: node.x, cy: node.y };
      }
      // falls through to connect-fwd/bwd/plain for standalone arrow rendering
    case 'connect-fwd':
    case 'connect-bwd':
    case 'connect-plain': {
      const w = node.w || DEFAULTS.stateW, h = node.h || DEFAULTS.stateH;
      return { x: node.x - w/2, y: node.y - h/2, w, h, cx: node.x, cy: node.y };
    }
    case 'transition-instant': {
      const s = DEFAULTS.transitionSize;
      return { x: node.x - s/2, y: node.y - s/2, w: s, h: s, cx: node.x, cy: node.y };
    }
    case 'container': {
      const w = node.w || DEFAULTS.containerW, h = node.h || DEFAULTS.containerH;
      return { x: node.x - w/2, y: node.y - h/2, w, h, cx: node.x, cy: node.y };
    }
    case 'key': {
      const entries = node.entries || [];
      const w = DEFAULTS.keyW;
      const h = DEFAULTS.keyHeaderH + DEFAULTS.keyPad + entries.length * DEFAULTS.keyEntryH + DEFAULTS.keyPad;
      return { x: node.x - w/2, y: node.y - h/2, w, h, cx: node.x, cy: node.y };
    }
    default: {
      const w = 80, h = 40;
      return { x: node.x - w/2, y: node.y - h/2, w, h, cx: node.x, cy: node.y };
    }
  }
}

function getPortPositions(node) {
  const bb = getBBox(node);
  if (node.type === 'state-weak' || node.type === 'state-strong') {
    const r = 5;
    return {
      N: { x: bb.cx, y: bb.cy - r },
      S: { x: bb.cx, y: bb.cy + r },
      W: { x: bb.cx - r, y: bb.cy },
      E: { x: bb.cx + r, y: bb.cy },
    };
  }
  return {
    N: { x: bb.cx, y: bb.y },
    S: { x: bb.cx, y: bb.y + bb.h },
    W: { x: bb.x, y: bb.cy },
    E: { x: bb.x + bb.w, y: bb.cy },
  };
}

function getBoundaryPoint(node, tx, ty) {
  const bb = getBBox(node);
  const cx = bb.cx, cy = bb.cy;
  const dx = tx - cx, dy = ty - cy;

  if (node.type === 'kind' || node.type === 'individual' ||
      node.type === 'junction-xor' || node.type === 'junction-or' || node.type === 'junction-and') {
    const r = bb.w / 2;
    const len = Math.sqrt(dx * dx + dy * dy) || 1;
    return { x: cx + (dx / len) * r, y: cy + (dy / len) * r };
  }

  // State transitions: always connect to the circle center
  if (node.type === 'state-weak' || node.type === 'state-strong') {
    const circleR = 5;
    const len = Math.sqrt(dx * dx + dy * dy) || 1;
    return { x: cx + (dx / len) * circleR, y: cy + (dy / len) * circleR };
  }

  // Rectangle-based
  if (Math.abs(dx) < 0.001 && Math.abs(dy) < 0.001) return { x: cx, y: bb.y };
  const hw = bb.w / 2, hh = bb.h / 2;
  const absDx = Math.abs(dx), absDy = Math.abs(dy);
  let t;
  if (absDx * hh > absDy * hw) {
    t = hw / absDx;
  } else {
    t = hh / absDy;
  }
  return { x: cx + dx * t, y: cy + dy * t };
}

function svgPoint(evt) {
  const svg = document.getElementById('canvas');
  const pt = svg.createSVGPoint();
  pt.x = evt.clientX;
  pt.y = evt.clientY;
  const svgP = pt.matrixTransform(svg.getScreenCTM().inverse());
  return { x: (svgP.x - viewport.x) / viewport.scale, y: (svgP.y - viewport.y) / viewport.scale };
}

function clientToWorld(cx, cy) {
  const svg = document.getElementById('canvas');
  const pt = svg.createSVGPoint();
  pt.x = cx; pt.y = cy;
  const sp = pt.matrixTransform(svg.getScreenCTM().inverse());
  return { x: (sp.x - viewport.x) / viewport.scale, y: (sp.y - viewport.y) / viewport.scale };
}

function snap(v) { return Math.round(v / DEFAULTS.snapGrid) * DEFAULTS.snapGrid; }

// ============================================================
// RENDERING
// ============================================================
function applyViewport() {
  const g = document.getElementById('nodes-layer').parentElement;
  // We use two sub-layers; apply transform to both content layers
  const nodesLayer = document.getElementById('nodes-layer');
  const edgesLayer = document.getElementById('edges-layer');
  const uiLayer    = document.getElementById('ui-layer');
  const gridLayer  = document.getElementById('grid-layer');
  const t = `translate(${viewport.x}, ${viewport.y}) scale(${viewport.scale})`;
  nodesLayer.setAttribute('transform', t);
  edgesLayer.setAttribute('transform', t);
  uiLayer.setAttribute('transform', t);
  gridLayer.setAttribute('transform', t);
  document.getElementById('zoom-display').textContent = Math.round(viewport.scale * 100) + '%';
}

function renderAll() {
  renderEdges();
  renderNodes();
  applyViewport();
  updateCanvasHint();
}

function updateCanvasHint() {
  const hint = document.getElementById('canvas-hint');
  if (!hint) return;
  if (state.nodes.length === 0) hint.classList.remove('hidden');
  else hint.classList.add('hidden');
}

function renderNodes() {
  const layer = document.getElementById('nodes-layer');
  layer.innerHTML = '';
  // Render containers first so they appear behind other nodes
  for (const node of state.nodes) {
    if (node.type === 'container') {
      const g = createNodeSVG(node);
      if (aiNewNodeIds.has(node.id)) g.classList.add('ai-new-node');
      layer.appendChild(g);
    }
  }
  for (const node of state.nodes) {
    if (node.type !== 'container') {
      const g = createNodeSVG(node);
      if (aiNewNodeIds.has(node.id)) g.classList.add('ai-new-node');
      layer.appendChild(g);
    }
  }
}

function renderEdges() {
  const layer = document.getElementById('edges-layer');
  layer.innerHTML = '';
  for (const edge of state.edges) {
    const g = createEdgeSVG(edge);
    if (g) layer.appendChild(g);
  }
}

function createNodeSVG(node) {
  const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
  g.setAttribute('class', 'node-group');
  g.setAttribute('data-id', node.id);

  const isSelected = selectedIds.has(node.id);
  const strokeColor = isSelected ? '#d97706' : '#1c1917';
  const strokeW = isSelected ? 2.5 : 1.5;

  switch (node.type) {
    case 'kind':
    case 'individual': {
      const r = node.r || DEFAULTS.kindRadius;
      const borderColor = isSelected ? '#d97706' : '#1c1917';
      const fillColor = node.color ? node.color + '80' : 'white'; // 80 = 50% opacity in hex
      const circle = svgEl('circle', { cx: node.x, cy: node.y, r, fill: fillColor, stroke: borderColor, 'stroke-width': strokeW, class: 'node-shape shape-outline' });
      g.appendChild(circle);
      // (individual dot drawn below with label, after circle)
      const label = node.label || '';
      const textColor = labelColor(node.color);
      if (node.type === 'individual') {
        // Label centered inside circle, slightly above center to make room for the dot
        const fs = fitFontSize(label, r * 1.9, r * 1.1, 12);
        g.appendChild(svgWrappedText(node.x, node.y - r * 0.15, label, r * 1.9, fs, textColor));
        // Filled dot at bottom-center inside the circle
        g.appendChild(svgEl('circle', { cx: node.x, cy: node.y + r * 0.62, r: 4, fill: textColor }));
      } else {
        // Label centered inside the circle
        const fs = fitFontSize(label, r * 1.9, r * 1.6, 12);
        g.appendChild(svgWrappedText(node.x, node.y, label, r * 1.9, fs, textColor));
      }
      break;
    }
    case 'relation-first': {
      const w = node.w || DEFAULTS.relationW, h = node.h || DEFAULTS.relationH;
      const rx = h / 2;
      g.appendChild(svgEl('rect', { x: node.x - w/2, y: node.y - h/2, width: w, height: h, rx, fill: 'white', stroke: strokeColor, 'stroke-width': strokeW, class: 'node-shape shape-outline' }));
      if (node.label) g.appendChild(svgWrappedText(node.x, node.y, node.label, w * 0.82, 11, '#222'));
      break;
    }
    case 'relation-second': {
      const w = node.w || DEFAULTS.relationW, h = node.h || DEFAULTS.relationH;
      const ax1 = node.x - w / 2, ax2 = node.x + w / 2, ay = node.y + 6;
      // Invisible hit-area rect
      g.appendChild(svgEl('rect', { x: ax1, y: node.y - h/2, width: w, height: h, fill: 'transparent', stroke: isSelected ? '#d97706' : 'none', 'stroke-width': 1, 'stroke-dasharray': '3,2', class: 'node-shape shape-outline' }));
      // Filled right-pointing triangle: base on left, tip at right connecting to line
      g.appendChild(svgEl('polygon', { points: `${ax1},${ay - 5} ${ax1 + 10},${ay} ${ax1},${ay + 5}`, fill: strokeColor }));
      // Arrow line starts from triangle tip
      g.appendChild(svgEl('line', { x1: ax1 + 10, y1: ay, x2: ax2, y2: ay, stroke: strokeColor, 'stroke-width': 1.5 }));
      // Label above the arrow
      if (node.label) g.appendChild(svgWrappedText(node.x, node.y - 6, node.label, w * 0.85, 11, '#222'));
      break;
    }
    case 'relation-alt': {
      const w = node.w || DEFAULTS.relationAltW, h = node.h || DEFAULTS.relationAltH;
      const ax1 = node.x - w / 2, ax2 = node.x + w / 2, ay = node.y + 6;
      // Invisible hit-area rect
      g.appendChild(svgEl('rect', { x: ax1, y: node.y - h/2, width: w, height: h, fill: 'transparent', stroke: isSelected ? '#d97706' : 'none', 'stroke-width': 1, 'stroke-dasharray': '3,2', class: 'node-shape shape-outline' }));
      // Arrow line
      g.appendChild(svgEl('line', { x1: ax1, y1: ay, x2: ax2 - 8, y2: ay, stroke: strokeColor, 'stroke-width': 1.5 }));
      // Arrowhead at RIGHT (front) end — pointing right
      g.appendChild(svgEl('polygon', { points: `${ax2 - 8},${ay - 4} ${ax2},${ay} ${ax2 - 8},${ay + 4}`, fill: strokeColor }));
      // Label above the arrow
      if (node.label) g.appendChild(svgWrappedText(node.x, node.y - 6, node.label, w * 0.85, 11, '#222'));
      break;
    }
    case 'process': {
      const w = node.w || DEFAULTS.processW, h = node.h || DEFAULTS.processH;
      const shelfY = node.y + h/2 - 14;
      g.appendChild(svgEl('rect', { x: node.x - w/2, y: node.y - h/2, width: w, height: h, fill: 'white', stroke: strokeColor, 'stroke-width': strokeW, class: 'node-shape shape-outline' }));
      g.appendChild(svgEl('line', { x1: node.x - w/2, y1: shelfY, x2: node.x + w/2, y2: shelfY, stroke: strokeColor, 'stroke-width': 1.5 }));
      g.appendChild(svgEl('line', { x1: node.x, y1: shelfY, x2: node.x, y2: node.y + h/2, stroke: strokeColor, 'stroke-width': 1.5 }));
      // Label centered in upper area above shelf line
      g.appendChild(svgWrappedText(node.x, node.y - 7, node.label || 'Process', w * 0.85, 11, '#222'));
      break;
    }
    case 'referent': {
      const w = node.w || DEFAULTS.referentW, h = node.h || DEFAULTS.referentH;
      const bx = node.x - w/2, by = node.y - h/2;
      const barW = w * 0.12;       // narrow decorative black bar on far left
      const idW = w * 0.22;        // ID cell width (to the right of bar)
      const midH = h / 2;          // horizontal divider
      const contentX = bx + barW;  // x where content area starts
      const contentW = w - barW;   // width of content area
      // Outer rectangle
      g.appendChild(svgEl('rect', { x: bx, y: by, width: w, height: h, fill: 'white', stroke: strokeColor, 'stroke-width': strokeW, class: 'node-shape shape-outline' }));
      // Solid black decorative bar on far left (full height)
      g.appendChild(svgEl('rect', { x: bx, y: by, width: barW, height: h, fill: strokeColor }));
      // Horizontal divider (full width of content area)
      g.appendChild(svgEl('line', { x1: contentX, y1: by + midH, x2: bx + w, y2: by + midH, stroke: strokeColor, 'stroke-width': 1 }));
      // Vertical divider in top half: separates ID cell from Method Name cell
      g.appendChild(svgEl('line', { x1: contentX + idW, y1: by, x2: contentX + idW, y2: by + midH, stroke: strokeColor, 'stroke-width': 1 }));
      // ID text (top-left content cell)
      g.appendChild(svgText(contentX + idW / 2, by + midH * 0.5 + 4, node.refId || 'ID', { 'text-anchor': 'middle', 'font-size': 10, fill: '#222' }));
      // Method Name (top-right content cell)
      g.appendChild(svgWrappedText(contentX + idW + (contentW - idW) / 2, by + midH * 0.5, node.methodName || 'Method Name', (contentW - idW) * 0.85, 9, '#555'));
      // Referenced Concept Label (bottom content area)
      g.appendChild(svgWrappedText(contentX + contentW / 2, by + midH + midH * 0.5, node.label || 'Concept Label', contentW * 0.85, 10, '#444'));
      break;
    }
    case 'junction-xor':
    case 'junction-or':
    case 'junction-and': {
      const r = DEFAULTS.junctionR;
      g.appendChild(svgEl('circle', { cx: node.x, cy: node.y, r, fill: 'white', stroke: strokeColor, 'stroke-width': strokeW, class: 'node-shape shape-outline' }));
      const sym = node.type === 'junction-xor' ? 'X' : node.type === 'junction-or' ? 'O' : '&';
      g.appendChild(svgText(node.x, node.y + 5, sym, { 'text-anchor': 'middle', 'font-size': 14, fill: '#1c1917', 'font-weight': 'bold', 'font-family': 'Times New Roman, Times, serif' }));
      break;
    }
    case 'state-weak':
    case 'state-strong': {
      if (node.junction) {
        // Render as a small open circle (split junction marker, as in IDEF5 Fig. 4-37)
        const r = 5;
        g.appendChild(svgEl('circle', { cx: node.x, cy: node.y, r: r + 8, fill: 'transparent', class: 'node-shape shape-outline', stroke: isSelected ? '#d97706' : 'none', 'stroke-width': 1 }));
        if (node.instantaneous) g.appendChild(instantaneousCircle(node.x, node.y, strokeColor));
        else g.appendChild(svgEl('circle', { cx: node.x, cy: node.y, r, fill: 'white', stroke: strokeColor, 'stroke-width': 1.5 }));
        break;
      }
      const w = node.w || DEFAULTS.stateW, h = 4;
      // Draw as an arrow element on canvas (not a connector, but a standalone node-symbol)
      const arrowY = node.y;
      const x1 = node.x - w/2, x2 = node.x + w/2;
      const hitRect = svgEl('rect', { x: x1 - 2, y: arrowY - 15, width: w + 4, height: 30, fill: 'transparent', stroke: isSelected ? '#d97706' : 'none', 'stroke-width': 1, class: 'node-shape shape-outline' });
      g.appendChild(hitRect);
      g.appendChild(svgEl('line', { x1, y1: arrowY, x2: x2 - (node.type === 'state-strong' ? 8 : 0), y2: arrowY, stroke: strokeColor, 'stroke-width': 2 }));
      // arrowhead(s) at right end
      if (node.type === 'state-strong') {
        // two arrowheads side-by-side at the right
        g.appendChild(svgEl('polygon', { points: `${x2-14},${arrowY-4} ${x2-6},${arrowY} ${x2-14},${arrowY+4}`, fill: strokeColor }));
        g.appendChild(svgEl('polygon', { points: `${x2-8},${arrowY-4} ${x2},${arrowY} ${x2-8},${arrowY+4}`, fill: strokeColor }));
      } else {
        g.appendChild(svgEl('polygon', { points: `${x2-6},${arrowY-4} ${x2+2},${arrowY} ${x2-6},${arrowY+4}`, fill: strokeColor }));
      }
      // center open circle (enlarged with Δ inside if instantaneous)
      if (node.instantaneous) g.appendChild(instantaneousCircle(node.x, arrowY, strokeColor));
      else g.appendChild(svgEl('circle', { cx: node.x, cy: arrowY, r: 5, fill: 'white', stroke: strokeColor, 'stroke-width': 1.5 }));
      if (node.label) g.appendChild(svgText(node.x, arrowY - 12, node.label, { 'text-anchor': 'middle', 'font-size': 11, fill: '#444' }));
      break;
    }
    case 'transition-instant': {
      const s = DEFAULTS.transitionSize;
      const pts = `${node.x},${node.y - s/2} ${node.x + s/2},${node.y + s/2} ${node.x - s/2},${node.y + s/2}`;
      g.appendChild(svgEl('polygon', { points: pts, fill: 'white', stroke: strokeColor, 'stroke-width': strokeW, class: 'node-shape shape-outline' }));
      g.appendChild(svgText(node.x, node.y + 6, 'Δ', { 'text-anchor': 'middle', 'font-size': 16, fill: '#1c1917' }));
      if (node.label) g.appendChild(svgText(node.x, node.y + s/2 + 14, node.label, { 'text-anchor': 'middle', 'font-size': 11, fill: '#444' }));
      break;
    }
    case 'connect-fwd':
    case 'connect-bwd':
    case 'connect-plain': {
      const w = node.w || DEFAULTS.stateW;
      const ay = node.y;
      const x1 = node.x - w/2, x2 = node.x + w/2;
      // Hit area (invisible, selection border only)
      g.appendChild(svgEl('rect', { x: x1 - 2, y: ay - 10, width: w + 4, height: 20, fill: 'transparent', stroke: isSelected ? '#d97706' : 'none', 'stroke-width': 1, class: 'node-shape shape-outline' }));
      // Solid line spanning full width
      g.appendChild(svgEl('line', { x1, y1: ay, x2, y2: ay, stroke: strokeColor, 'stroke-width': 1.5 }));
      // Open chevron at center
      if (node.type === 'connect-fwd') {
        g.appendChild(svgEl('polyline', { points: `${node.x - 7},${ay - 6} ${node.x + 5},${ay} ${node.x - 7},${ay + 6}`, fill: 'none', stroke: strokeColor, 'stroke-width': 1.5 }));
      } else if (node.type === 'connect-bwd') {
        g.appendChild(svgEl('polyline', { points: `${node.x + 7},${ay - 6} ${node.x - 5},${ay} ${node.x + 7},${ay + 6}`, fill: 'none', stroke: strokeColor, 'stroke-width': 1.5 }));
      }
      if (node.label) g.appendChild(svgText(node.x, ay - 12, node.label, { 'text-anchor': 'middle', 'font-size': 11, fill: '#444' }));
      break;
    }
    case 'key': {
      const entries = node.entries || [];
      const kw = DEFAULTS.keyW;
      const kh = DEFAULTS.keyHeaderH + DEFAULTS.keyPad + entries.length * DEFAULTS.keyEntryH + DEFAULTS.keyPad;
      const bx = node.x - kw/2, by = node.y - kh/2;
      const symW = 50, pad = 6;
      // Outer box
      g.appendChild(svgEl('rect', { x: bx, y: by, width: kw, height: kh, fill: 'white', stroke: strokeColor, 'stroke-width': strokeW, class: 'node-shape shape-outline' }));
      // Header background + label
      g.appendChild(svgEl('rect', { x: bx, y: by, width: kw, height: DEFAULTS.keyHeaderH, fill: '#f4f4f4', stroke: 'none' }));
      g.appendChild(svgEl('line', { x1: bx, y1: by + DEFAULTS.keyHeaderH, x2: bx + kw, y2: by + DEFAULTS.keyHeaderH, stroke: strokeColor, 'stroke-width': 1 }));
      g.appendChild(svgText(bx + kw/2, by + DEFAULTS.keyHeaderH * 0.65, node.label || 'Key', { 'text-anchor': 'middle', 'font-size': 11, 'font-weight': 'bold', fill: '#1c1917' }));
      // Entries
      entries.forEach((entry, i) => {
        const rowY = by + DEFAULTS.keyHeaderH + DEFAULTS.keyPad + i * DEFAULTS.keyEntryH;
        const my = rowY + DEFAULTS.keyEntryH / 2;
        const lx = bx + pad, rx = bx + symW - pad;
        const mx = bx + symW / 2;
        const color = strokeColor;
        // Symbol preview
        switch (entry.symbolType) {
          case 'second-order':
            g.appendChild(svgEl('polygon', { points: `${lx},${my-4} ${lx+8},${my} ${lx},${my+4}`, fill: color }));
            g.appendChild(svgEl('line', { x1: lx+8, y1: my, x2: rx, y2: my, stroke: color, 'stroke-width': 1.5 }));
            break;
          case 'subkind-of':
            g.appendChild(svgEl('line', { x1: lx, y1: my, x2: rx-6, y2: my, stroke: color, 'stroke-width': 1.5, 'stroke-dasharray': '4,2' }));
            g.appendChild(svgEl('polygon', { points: `${rx-6},${my-3} ${rx},${my} ${rx-6},${my+3}`, fill: 'white', stroke: color, 'stroke-width': 1 }));
            break;
          case 'instance-of':
            g.appendChild(svgEl('line', { x1: lx, y1: my, x2: rx-6, y2: my, stroke: color, 'stroke-width': 1.5, 'stroke-dasharray': '4,2' }));
            g.appendChild(svgEl('polygon', { points: `${rx-6},${my-3} ${rx},${my} ${rx-6},${my+3}`, fill: color }));
            break;
          case 'state-weak':
            g.appendChild(svgEl('line', { x1: lx, y1: my, x2: rx-5, y2: my, stroke: color, 'stroke-width': 1.5 }));
            g.appendChild(svgEl('circle', { cx: mx, cy: my, r: 3, fill: 'white', stroke: color, 'stroke-width': 1.5 }));
            g.appendChild(svgEl('polygon', { points: `${rx-6},${my-3} ${rx},${my} ${rx-6},${my+3}`, fill: color }));
            break;
          case 'state-strong':
            g.appendChild(svgEl('line', { x1: lx, y1: my, x2: rx-10, y2: my, stroke: color, 'stroke-width': 1.5 }));
            g.appendChild(svgEl('circle', { cx: mx, cy: my, r: 3, fill: 'white', stroke: color, 'stroke-width': 1.5 }));
            g.appendChild(svgEl('polygon', { points: `${rx-10},${my-3} ${rx-4},${my} ${rx-10},${my+3}`, fill: color }));
            g.appendChild(svgEl('polygon', { points: `${rx-6},${my-3} ${rx},${my} ${rx-6},${my+3}`, fill: color }));
            break;
          case 'connect-fwd':
            g.appendChild(svgEl('line', { x1: lx, y1: my, x2: rx, y2: my, stroke: color, 'stroke-width': 1.5 }));
            g.appendChild(svgEl('polyline', { points: `${mx-4},${my-5} ${mx+4},${my} ${mx-4},${my+5}`, fill: 'none', stroke: color, 'stroke-width': 1.5 }));
            break;
          case 'connect-bwd':
            g.appendChild(svgEl('line', { x1: lx, y1: my, x2: rx, y2: my, stroke: color, 'stroke-width': 1.5 }));
            g.appendChild(svgEl('polyline', { points: `${mx+4},${my-5} ${mx-4},${my} ${mx+4},${my+5}`, fill: 'none', stroke: color, 'stroke-width': 1.5 }));
            break;
          case 'connect-plain':
            g.appendChild(svgEl('line', { x1: lx, y1: my, x2: rx, y2: my, stroke: color, 'stroke-width': 1.5 }));
            break;
          case 'relation-alt':
            g.appendChild(svgEl('line', { x1: lx, y1: my, x2: rx-8, y2: my, stroke: color, 'stroke-width': 1.5 }));
            g.appendChild(svgEl('polygon', { points: `${rx-8},${my-4} ${rx},${my} ${rx-8},${my+4}`, fill: color }));
            break;
          default: // first-order / part-of
            g.appendChild(svgEl('line', { x1: lx, y1: my, x2: rx-6, y2: my, stroke: color, 'stroke-width': 1.5 }));
            g.appendChild(svgEl('polygon', { points: `${rx-6},${my-3} ${rx},${my} ${rx-6},${my+3}`, fill: color }));
        }
        // Label
        g.appendChild(svgText(bx + symW + pad, my + 4, entry.label || '', { 'text-anchor': 'start', 'font-size': 10, fill: '#1c1917' }));
        // Separator line (except last)
        if (i < entries.length - 1) {
          g.appendChild(svgEl('line', { x1: bx + pad, y1: rowY + DEFAULTS.keyEntryH, x2: bx + kw - pad, y2: rowY + DEFAULTS.keyEntryH, stroke: '#ddd', 'stroke-width': 0.5 }));
        }
      });
      break;
    }
    case 'container': {
      const w = node.w || DEFAULTS.containerW, h = node.h || DEFAULTS.containerH;
      const bx = node.x - w/2, by = node.y - h/2;
      g.appendChild(svgEl('rect', { x: bx, y: by, width: w, height: h, fill: 'white', 'fill-opacity': 0.3, stroke: strokeColor, 'stroke-width': strokeW, 'stroke-dasharray': '8,4', class: 'node-shape shape-outline' }));
      if (node.label) g.appendChild(svgText(bx + 8, by + 16, node.label, { 'text-anchor': 'start', 'font-size': 12, fill: '#444', 'font-style': 'italic' }));
      // Resize handles when selected
      if (isSelected) {
        const hs = 5;
        const mx = bx + w/2, my = by + h/2;
        const handles = [
          [bx, by], [bx + w, by], [bx, by + h], [bx + w, by + h],  // corners
          [mx, by], [mx, by + h], [bx, my], [bx + w, my],           // edges
        ];
        for (const [hx, hy] of handles) {
          g.appendChild(svgEl('rect', { x: hx - hs, y: hy - hs, width: hs * 2, height: hs * 2, fill: 'white', stroke: '#d97706', 'stroke-width': 1.5 }));
        }
      }
      break;
    }
  }

  return g;
}

function createEdgeSVG(edge) {
  const fromNode = state.nodes.find(n => n.id === edge.fromId);
  const toNode   = state.nodes.find(n => n.id === edge.toId);
  if (!fromNode || !toNode) return null;

  const isSelected = selectedIds.has(edge.id);

  // Compute center targets for boundary intersection
  const toBB   = getBBox(toNode);
  const fromBB = getBBox(fromNode);
  const p1 = getBoundaryPoint(fromNode, toBB.cx, toBB.cy);
  const p2 = getBoundaryPoint(toNode, fromBB.cx, fromBB.cy);

  const midX = (p1.x + p2.x) / 2;
  const midY = (p1.y + p2.y) / 2;

  const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
  g.setAttribute('class', 'edge-group');
  g.setAttribute('data-id', edge.id);

  const strokeColor = isSelected ? '#d97706' : '#555';
  const arrowMarker = isSelected ? 'url(#arrowhead-blue)' : 'url(#arrowhead)';

  switch (edge.type) {
    case 'first-order': {
      // Line from source to mid, relation label box in middle, line to target
      g.appendChild(svgEl('line', { x1: p1.x, y1: p1.y, x2: midX, y2: midY, stroke: strokeColor, 'stroke-width': 1.5, class: 'edge-line' }));
      g.appendChild(svgEl('line', { x1: midX, y1: midY, x2: p2.x, y2: p2.y, stroke: strokeColor, 'stroke-width': 1.5, 'marker-end': arrowMarker, class: 'edge-line' }));
      // Label box
      const lbl = edge.label || 'R';
      const lw = Math.max(50, lbl.length * 8 + 16);
      g.appendChild(svgEl('rect', { x: midX - lw/2, y: midY - 11, width: lw, height: 22, rx: 11, fill: 'white', stroke: strokeColor, 'stroke-width': 1 }));
      g.appendChild(svgText(midX, midY + 4, lbl, { 'text-anchor': 'middle', 'font-size': 11, fill: '#1c1917' }));
      break;
    }
    case 'second-order': {
      // Solid line with filled triangle at source end (►────────), base at node boundary
      const startMarker = isSelected ? 'url(#arrowhead-start-blue)' : 'url(#arrowhead-start)';
      g.appendChild(svgEl('line', { x1: p1.x, y1: p1.y, x2: p2.x, y2: p2.y, stroke: strokeColor, 'stroke-width': 1.5, 'marker-start': startMarker, class: 'edge-line' }));
      if (edge.label) g.appendChild(edgeLabel(midX, midY, edge.label, strokeColor));
      break;
    }
    case 'relation-alt': {
      // Simple arrow from source to target with label (Alt. 2-place first-order relation)
      g.appendChild(svgEl('line', { x1: p1.x, y1: p1.y, x2: p2.x, y2: p2.y, stroke: strokeColor, 'stroke-width': 1.5, 'marker-end': arrowMarker, class: 'edge-line' }));
      if (edge.label) g.appendChild(edgeLabel(midX, midY, edge.label, strokeColor));
      break;
    }
    case 'subkind-of': {
      g.appendChild(svgEl('line', { x1: p1.x, y1: p1.y, x2: p2.x, y2: p2.y, stroke: strokeColor, 'stroke-width': 1.5, 'marker-end': arrowMarker, class: 'edge-line' }));
      g.appendChild(edgeLabel(midX, midY, edge.label || 'Subkind-of', strokeColor));
      break;
    }
    case 'instance-of': {
      g.appendChild(svgEl('line', { x1: p1.x, y1: p1.y, x2: p2.x, y2: p2.y, stroke: strokeColor, 'stroke-width': 1.5, 'stroke-dasharray': '8,4', 'marker-end': arrowMarker, class: 'edge-line' }));
      g.appendChild(edgeLabel(midX, midY, edge.label || 'Instance-of', strokeColor));
      break;
    }
    case 'part-of': {
      g.appendChild(svgEl('line', { x1: p1.x, y1: p1.y, x2: p2.x, y2: p2.y, stroke: strokeColor, 'stroke-width': 1.5, 'marker-end': arrowMarker, class: 'edge-line' }));
      g.appendChild(edgeLabel(midX, midY, edge.label || 'Part-of', strokeColor));
      break;
    }
    case 'state-weak': {
      g.appendChild(svgEl('line', { x1: p1.x, y1: p1.y, x2: p2.x, y2: p2.y, stroke: strokeColor, 'stroke-width': 1.5, 'marker-end': arrowMarker, class: 'edge-line' }));
      if (!fromNode.junction) {
        if (edge.instantaneous) g.appendChild(instantaneousCircle(midX, midY, strokeColor));
        else g.appendChild(svgEl('circle', { cx: midX, cy: midY, r: 5, fill: 'white', stroke: strokeColor, 'stroke-width': 1.5 }));
      }
      if (edge.label) g.appendChild(edgeLabel(midX, midY - 14, edge.label, strokeColor));
      break;
    }
    case 'state-strong': {
      const doubleMarker = isSelected ? 'url(#arrowhead-double-blue)' : 'url(#arrowhead-double)';
      g.appendChild(svgEl('line', { x1: p1.x, y1: p1.y, x2: p2.x, y2: p2.y, stroke: strokeColor, 'stroke-width': 1.5, 'marker-end': doubleMarker, class: 'edge-line' }));
      if (!fromNode.junction) {
        if (edge.instantaneous) g.appendChild(instantaneousCircle(midX, midY, strokeColor));
        else g.appendChild(svgEl('circle', { cx: midX, cy: midY, r: 5, fill: 'white', stroke: strokeColor, 'stroke-width': 1.5 }));
      }
      if (edge.label) g.appendChild(edgeLabel(midX, midY - 14, edge.label, strokeColor));
      break;
    }
    case 'process-connect': {
      g.appendChild(svgEl('line', { x1: p1.x, y1: p1.y, x2: p2.x, y2: p2.y, stroke: strokeColor, 'stroke-width': 1.5, 'stroke-dasharray': '4,2', 'marker-end': arrowMarker, class: 'edge-line' }));
      if (edge.label) g.appendChild(edgeLabel(midX, midY, edge.label, strokeColor));
      break;
    }
    case 'connect-fwd':
    case 'connect-bwd':
    case 'connect-plain': {
      // Solid line with open chevron at midpoint (or plain)
      g.appendChild(svgEl('line', { x1: p1.x, y1: p1.y, x2: p2.x, y2: p2.y, stroke: strokeColor, 'stroke-width': 1.5, class: 'edge-line' }));
      if (edge.type !== 'connect-plain') {
        // Perpendicular vector for chevron arms
        const len = Math.hypot(p2.x - p1.x, p2.y - p1.y) || 1;
        const ux = (p2.x - p1.x) / len, uy = (p2.y - p1.y) / len; // unit vector along line
        const px = -uy, py = ux; // perpendicular
        const armLen = 7;
        // Chevron tip offset: forward for fwd, backward for bwd
        const tipOffset = edge.type === 'connect-fwd' ? 6 : -6;
        const tx = midX + ux * tipOffset, ty = midY + uy * tipOffset;
        const b1x = midX - ux * 2 + px * armLen, b1y = midY - uy * 2 + py * armLen;
        const b2x = midX - ux * 2 - px * armLen, b2y = midY - uy * 2 - py * armLen;
        g.appendChild(svgEl('polyline', { points: `${b1x},${b1y} ${tx},${ty} ${b2x},${b2y}`, fill: 'none', stroke: strokeColor, 'stroke-width': 1.5, 'stroke-linejoin': 'round' }));
      }
      if (edge.label) g.appendChild(edgeLabel(midX, midY - 12, edge.label, strokeColor));
      break;
    }
    default: {
      g.appendChild(svgEl('line', { x1: p1.x, y1: p1.y, x2: p2.x, y2: p2.y, stroke: strokeColor, 'stroke-width': 1.5, 'marker-end': arrowMarker, class: 'edge-line' }));
      if (edge.label) g.appendChild(edgeLabel(midX, midY, edge.label, strokeColor));
    }
  }

  // Invisible hit area
  const hit = svgEl('line', { x1: p1.x, y1: p1.y, x2: p2.x, y2: p2.y, stroke: 'transparent', 'stroke-width': 12, class: 'edge-hit' });
  g.appendChild(hit);

  return g;
}

// Renders the instantaneous transition marker: a slightly larger circle with Δ centered inside.
// Call this INSTEAD of the plain circle when edge/node has instantaneous=true.
function instantaneousCircle(cx, cy, color) {
  const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
  g.appendChild(svgEl('circle', { cx, cy, r: 9, fill: 'white', stroke: color, 'stroke-width': 1.5 }));
  g.appendChild(svgText(cx, cy + 5, 'Δ', { 'text-anchor': 'middle', 'font-size': 10, fill: color }));
  return g;
}

function edgeLabel(x, y, text, color) {
  const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
  const lw = Math.max(40, text.length * 7 + 12);
  g.appendChild(svgEl('rect', { x: x - lw/2, y: y - 9, width: lw, height: 17, fill: 'white', stroke: '#ddd', 'stroke-width': 1, rx: 3 }));
  g.appendChild(svgText(x, y + 4, text, { 'text-anchor': 'middle', 'font-size': 10, fill: color || '#555' }));
  return g;
}

// Returns '#fff' or '#222' depending on which contrasts better against the given hex fill color.
// Accounts for the 50% opacity blend over white: effectiveLuminance = 0.5 * colorLuminance + 0.5
function labelColor(hexColor) {
  if (!hexColor) return '#222';
  const r = parseInt(hexColor.slice(1, 3), 16) / 255;
  const g = parseInt(hexColor.slice(3, 5), 16) / 255;
  const b = parseInt(hexColor.slice(5, 7), 16) / 255;
  const lin = c => c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  const lum = 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
  const effective = 0.5 * lum + 0.5; // blend over white at 50% opacity
  return effective < 0.4 ? '#fff' : '#222';
}

function svgEl(tag, attrs) {
  const el = document.createElementNS('http://www.w3.org/2000/svg', tag);
  for (const [k, v] of Object.entries(attrs)) el.setAttribute(k, v);
  return el;
}

function svgText(x, y, text, attrs) {
  const el = document.createElementNS('http://www.w3.org/2000/svg', 'text');
  el.setAttribute('x', x);
  el.setAttribute('y', y);
  for (const [k, v] of Object.entries(attrs)) el.setAttribute(k, v);
  el.textContent = text;
  return el;
}

// Returns the largest font size <= startSize at which `text`, word-wrapped to maxWidth,
// fits within both maxWidth and maxHeight. Uses the same char-width estimate as svgWrappedText.
function fitFontSize(text, maxWidth, maxHeight, startSize, minSize = 7) {
  const words = (text || '').split(/\s+/).filter(w => w.length > 0);
  if (words.length === 0) return startSize;
  for (let fs = startSize; fs >= minSize; fs -= 0.5) {
    const charW = fs * 0.62;
    const lines = [];
    let current = '';
    for (const word of words) {
      const test = current ? current + ' ' + word : word;
      if (test.length * charW <= maxWidth) { current = test; }
      else { if (current) lines.push(current); current = word; }
    }
    if (current) lines.push(current);
    const maxLineW = Math.max(...lines.map(l => l.length * charW));
    const totalH = lines.length * fs * 1.35;
    if (maxLineW <= maxWidth && totalH <= maxHeight) return fs;
  }
  return minSize;
}

// Wraps text into multiple <tspan> lines centered at (cx, cy).
// maxWidth is approximate pixel width; charW = fontSize * 0.6 per character.
function svgWrappedText(cx, cy, text, maxWidth, fontSize, fill) {
  const el = document.createElementNS('http://www.w3.org/2000/svg', 'text');
  el.setAttribute('text-anchor', 'middle');
  el.setAttribute('font-size', fontSize);
  el.setAttribute('fill', fill || '#222');
  el.setAttribute('font-family', "-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif");

  const charW = fontSize * 0.62;
  const words = (text || '').split(/\s+/).filter(w => w.length > 0);
  if (words.length === 0) words.push('');

  const lines = [];
  let current = '';
  for (const word of words) {
    const test = current ? current + ' ' + word : word;
    if (test.length * charW <= maxWidth) {
      current = test;
    } else {
      if (current) lines.push(current);
      current = word;
    }
  }
  if (current) lines.push(current);
  if (lines.length === 0) lines.push('');

  const lineH = fontSize * 1.35;
  const totalH = (lines.length - 1) * lineH;
  const startY = cy - totalH / 2;

  lines.forEach((line, i) => {
    const tspan = document.createElementNS('http://www.w3.org/2000/svg', 'tspan');
    tspan.setAttribute('x', cx);
    tspan.setAttribute('y', startY + i * lineH);
    tspan.setAttribute('text-anchor', 'middle');
    tspan.textContent = line;
    el.appendChild(tspan);
  });

  return el;
}

// ============================================================
// NODE CREATION
// ============================================================
function createNode(type, x, y) {
  const id = 'n' + nextId();
  const def = NODE_TYPES[type] || {};
  const node = { id, type, x: snap(x), y: snap(y), label: def.defaultLabel !== undefined ? def.defaultLabel : type, notes: '' };
  if (type === 'kind' || type === 'individual') node.r = DEFAULTS.kindRadius;
  if (type === 'relation-first' || type === 'relation-second') { node.w = DEFAULTS.relationW; node.h = DEFAULTS.relationH; }
  if (type === 'process') { node.w = DEFAULTS.processW; node.h = DEFAULTS.processH; }
  if (type === 'referent') { node.w = DEFAULTS.referentW; node.h = DEFAULTS.referentH; node.refId = 'ID'; node.methodName = 'Method'; }
  if (type === 'state-weak' || type === 'state-strong') { node.w = DEFAULTS.stateW; }
  if (type === 'container') { node.w = DEFAULTS.containerW; node.h = DEFAULTS.containerH; }
  if (type === 'key') { node.entries = []; }
  return node;
}

function createEdge(fromId, toId, type, label) {
  const id = 'e' + nextId();
  const edgeLabel = label !== undefined ? label : (EDGE_TYPE_LABELS[type] || '');
  return { id, fromId, toId, type: type || 'first-order', label: edgeLabel };
}

// ============================================================
// SELECTION
// ============================================================
function selectElement(id, addToSelection = false) {
  if (!addToSelection) selectedIds.clear();
  if (id) selectedIds.add(id);
  renderAll();
  updateProperties();
}

function clearSelection() {
  selectedIds.clear();
  renderAll();
  updateProperties();
}

function deleteSelected() {
  if (selectedIds.size === 0) return;
  saveUndo();
  const ids = new Set(selectedIds);
  state.nodes = state.nodes.filter(n => !ids.has(n.id));
  state.edges = state.edges.filter(e => !ids.has(e.id) && !ids.has(e.fromId) && !ids.has(e.toId));
  selectedIds.clear();
  renderAll();
  updateProperties();
}

function copySelected() {
  if (selectedIds.size === 0) return;
  clipboard.nodes = [];
  clipboard.edges = [];
  clipboard.pasteCount = 0;
  for (const id of selectedIds) {
    const node = state.nodes.find(n => n.id === id);
    if (node) clipboard.nodes.push(JSON.parse(JSON.stringify(node)));
  }
  for (const edge of state.edges) {
    if (selectedIds.has(edge.fromId) && selectedIds.has(edge.toId)) {
      clipboard.edges.push(JSON.parse(JSON.stringify(edge)));
    }
  }
}

function cutSelected() {
  if (selectedIds.size === 0) return;
  copySelected();
  deleteSelected();
}

function pasteClipboard() {
  if (clipboard.nodes.length === 0) return;
  saveUndo();
  const idMap = {};
  const newIds = new Set();
  for (const node of clipboard.nodes) {
    const newNode = JSON.parse(JSON.stringify(node));
    const oldId = newNode.id;
    newNode.id = 'n' + nextId();
    newNode.x += 20;
    newNode.y += 20;
    idMap[oldId] = newNode.id;
    state.nodes.push(newNode);
    newIds.add(newNode.id);
  }
  for (const edge of clipboard.edges) {
    const newEdge = JSON.parse(JSON.stringify(edge));
    newEdge.id = 'e' + nextId();
    newEdge.fromId = idMap[edge.fromId];
    newEdge.toId = idMap[edge.toId];
    if (newEdge.fromId && newEdge.toId) state.edges.push(newEdge);
  }
  // Update clipboard positions so repeated pastes cascade; reset after 5 pastes
  clipboard.pasteCount = (clipboard.pasteCount || 0) + 1;
  if (clipboard.pasteCount <= 5) {
    clipboard.nodes.forEach(n => { n.x += 20; n.y += 20; });
  } else {
    clipboard.pasteCount = 1;
    clipboard.nodes.forEach(n => { n.x -= 80; n.y -= 80; }); // reset toward origin
  }
  selectedIds.clear();
  newIds.forEach(id => selectedIds.add(id));
  renderAll();
  updateProperties();
  persistLocal();
}

function duplicateSelected() {
  if (selectedIds.size === 0) return;
  saveUndo();
  const newIds = new Set();
  for (const id of selectedIds) {
    const node = state.nodes.find(n => n.id === id);
    if (node) {
      const newNode = JSON.parse(JSON.stringify(node));
      newNode.id = 'n' + nextId();
      newNode.x += 30;
      newNode.y += 30;
      state.nodes.push(newNode);
      newIds.add(newNode.id);
    }
  }
  selectedIds.clear();
  newIds.forEach(id => selectedIds.add(id));
  renderAll();
  updateProperties();
}

// ============================================================
// PROPERTIES PANEL
// ============================================================
function updateProperties() {
  const panel = document.getElementById('props-content');
  if (selectedIds.size === 0) {
    panel.innerHTML = '<p class="prop-empty">Select an element to view properties</p>';
    return;
  }
  if (selectedIds.size > 1) {
    panel.innerHTML = `<p class="prop-empty">${selectedIds.size} elements selected</p>`;
    return;
  }
  const id = [...selectedIds][0];
  const node = state.nodes.find(n => n.id === id);
  const edge = state.edges.find(e => e.id === id);

  if (node) renderNodeProps(panel, node);
  else if (edge) renderEdgeProps(panel, edge);
}

function renderNodeProps(panel, node) {
  const def = NODE_TYPES[node.type] || {};
  panel.innerHTML = `<h3>${def.label || node.type}</h3>`;

  const addProp = (lbl, html) => {
    const d = document.createElement('div');
    d.className = 'prop-group';
    d.innerHTML = `<label class="prop-label">${lbl}</label>${html}`;
    panel.appendChild(d);
    return d;
  };

  // Label
  if (node.type !== 'junction-xor' && node.type !== 'junction-or' && node.type !== 'junction-and') {
    const d = addProp('Label', `<input class="prop-input" id="prop-label" value="${escHtml(node.label || '')}"/>`);
    d.querySelector('#prop-label').addEventListener('input', e => {
      node.label = e.target.value;
      renderAll();
      persistLocal();
    });
  }

  // Individual toggle
  if (node.type === 'kind' || node.type === 'individual') {
    const isInd = node.type === 'individual';
    const d = document.createElement('div');
    d.className = 'prop-group';
    d.innerHTML = `<div class="prop-checkbox-row"><input type="checkbox" id="prop-individual" ${isInd ? 'checked' : ''}/><label for="prop-individual" class="prop-label" style="margin:0">Individual (has instance dot)</label></div>`;
    panel.appendChild(d);
    d.querySelector('#prop-individual').addEventListener('change', e => {
      node.type = e.target.checked ? 'individual' : 'kind';
      renderAll();
      updateProperties();
      persistLocal();
    });
  }

  // Border color for kind/individual
  if (node.type === 'kind' || node.type === 'individual') {
    const dc = document.createElement('div');
    dc.className = 'prop-group';
    dc.innerHTML = '<label class="prop-label">Color</label>';
    const grid = document.createElement('div');
    grid.className = 'color-picker';
    NODE_COLORS.forEach(c => {
      const sw = document.createElement('div');
      sw.className = 'color-swatch' + (c.value === '' ? ' color-swatch-default' : '');
      if (c.value) sw.style.background = c.value;
      if ((node.color || '') === c.value) sw.classList.add('selected');
      sw.title = c.label;
      sw.addEventListener('click', () => {
        grid.querySelectorAll('.color-swatch').forEach(s => s.classList.remove('selected'));
        sw.classList.add('selected');
        node.color = c.value;
        renderAll();
        persistLocal();
      });
      grid.appendChild(sw);
    });
    dc.appendChild(grid);
    panel.appendChild(dc);
  }

  // Referent fields
  if (node.type === 'referent') {
    const d2 = addProp('Reference ID', `<input class="prop-input" id="prop-refid" value="${escHtml(node.refId || '')}"/>`);
    d2.querySelector('#prop-refid').addEventListener('input', e => { node.refId = e.target.value; renderAll(); persistLocal(); });
    const d3 = addProp('Method Name', `<input class="prop-input" id="prop-method" value="${escHtml(node.methodName || '')}"/>`);
    d3.querySelector('#prop-method').addEventListener('input', e => { node.methodName = e.target.value; renderAll(); persistLocal(); });
  }

  // Notes
  const dn = addProp('Notes', `<textarea class="prop-input" id="prop-notes">${escHtml(node.notes || '')}</textarea>`);
  dn.querySelector('#prop-notes').addEventListener('input', e => {
    node.notes = e.target.value;
    persistLocal();
  });

  // Key entry management
  if (node.type === 'key') {
    if (!node.entries) node.entries = [];
    const dEntries = document.createElement('div');
    dEntries.className = 'prop-group';
    const renderEntryList = () => {
      dEntries.innerHTML = '<label class="prop-label">Entries</label>';
      if (node.entries.length === 0) {
        dEntries.innerHTML += '<p style="font-size:11px;color:#999;margin:3px 0">No entries yet.</p>';
      }
      node.entries.forEach((entry, i) => {
        const row = document.createElement('div');
        row.className = 'key-entry-row';
        row.innerHTML = `<span class="key-entry-type">${entry.symbolType}</span><span class="key-entry-lbl">${escHtml(entry.label)}</span><button class="key-entry-del" title="Remove">✕</button>`;
        row.querySelector('.key-entry-del').addEventListener('click', () => {
          saveUndo();
          node.entries.splice(i, 1);
          renderAll();
          renderEntryList();
          persistLocal();
        });
        dEntries.appendChild(row);
      });
      // Add entry row
      const symOpts = [
        ['first-order','First-Order Rel.'],['second-order','2nd-Order Rel.'],
        ['relation-alt','Alt. 2-Place Rel.'],['subkind-of','Subkind-of'],
        ['instance-of','Instance-of'],['part-of','Part-of'],
        ['state-weak','State Trans. (Weak)'],['state-strong','State Trans. (Strong)'],
        ['connect-fwd','Connect (Forward)'],['connect-bwd','Connect (Backward)'],
        ['connect-plain','Connect (Plain)'],
      ].map(([v,l]) => `<option value="${v}">${l}</option>`).join('');
      const addRow = document.createElement('div');
      addRow.className = 'key-add-row';
      addRow.innerHTML = `<select id="key-add-type">${symOpts}</select><input class="key-add-lbl" id="key-add-label" placeholder="Label" /><button class="key-add-btn">Add</button>`;
      addRow.querySelector('.key-add-btn').addEventListener('click', () => {
        const t = addRow.querySelector('#key-add-type').value;
        const l = addRow.querySelector('#key-add-label').value.trim();
        if (!l) return;
        saveUndo();
        node.entries.push({ symbolType: t, label: l });
        addRow.querySelector('#key-add-label').value = '';
        renderAll();
        renderEntryList();
        persistLocal();
      });
      dEntries.appendChild(addRow);
    };
    renderEntryList();
    panel.appendChild(dEntries);
  }

  addInfoSection(panel, node.type);
}

function renderEdgeProps(panel, edge) {
  panel.innerHTML = '<h3>Connection</h3>';

  const addProp = (lbl, html) => {
    const d = document.createElement('div');
    d.className = 'prop-group';
    d.innerHTML = `<label class="prop-label">${lbl}</label>${html}`;
    panel.appendChild(d);
    return d;
  };

  const d1 = addProp('Label', `<input class="prop-input" id="prop-edge-label" value="${escHtml(edge.label || '')}"/>`);
  d1.querySelector('#prop-edge-label').addEventListener('input', e => { edge.label = e.target.value; renderAll(); persistLocal(); });

  const types = Object.keys(EDGE_TYPE_LABELS);
  const opts = types.map(t => `<option value="${t}" ${edge.type === t ? 'selected' : ''}>${t}</option>`).join('');
  const d2 = addProp('Type', `<select class="prop-input" id="prop-edge-type">${opts}</select>`);
  d2.querySelector('#prop-edge-type').addEventListener('change', e => { edge.type = e.target.value; renderAll(); persistLocal(); });

  addProp('From → To', `<span style="font-size:11px;color:#888">${edge.fromId} → ${edge.toId}</span>`);
  addProp('ID', `<span style="font-size:11px;color:#aaa">${edge.id}</span>`);

  addInfoSection(panel, edge.type);
}

function addInfoSection(panel, type) {
  const text = SYMBOL_INFO[type];
  if (!text) return;
  const d = document.createElement('div');
  d.className = 'prop-info';
  d.innerHTML = `<div class="prop-info-title">Symbol Definition</div><p class="prop-info-text">${escHtml(text)}</p>`;
  panel.appendChild(d);
}

function escHtml(s) {
  return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

// ============================================================
// INLINE EDITING
// ============================================================
function startInlineEdit(nodeId) {
  const node = state.nodes.find(n => n.id === nodeId);
  if (!node) return;
  if (node.type === 'junction-xor' || node.type === 'junction-or' || node.type === 'junction-and') return;
  editingNodeId = nodeId;
  const bb = getBBox(node);

  // Size the editor to fit snugly within the node shape
  let edW, edH, edX, edY;
  if (node.type === 'kind' || node.type === 'individual') {
    const r = node.r || DEFAULTS.kindRadius;
    edW = Math.round(r * 1.5);
    edH = Math.round(r * 1.0);
    edX = bb.cx - edW / 2;
    edY = bb.cy - edH / 2;
  } else if (node.type === 'relation-alt' || node.type === 'relation-second') {
    // Arrow-style nodes: editor sits above the arrow line
    edW = Math.round(bb.w * 0.85);
    edH = 22;
    edX = bb.cx - edW / 2;
    edY = bb.y;
  } else {
    edW = Math.round(bb.w * 0.88);
    edH = Math.round(bb.h * 0.82);
    edX = bb.cx - edW / 2;
    edY = bb.cy - edH / 2;
  }

  const fo = document.createElementNS('http://www.w3.org/2000/svg', 'foreignObject');
  fo.setAttribute('x', edX);
  fo.setAttribute('y', edY);
  fo.setAttribute('width', edW);
  fo.setAttribute('height', edH);
  fo.setAttribute('class', 'inline-edit-fo');
  fo.setAttribute('id', 'inline-edit-fo');

  // Use textarea so spaces are naturally supported and text can wrap visually
  const inp = document.createElement('textarea');
  inp.value = node.label || '';
  inp.style.cssText = [
    'width:100%', 'height:100%', 'border:1.5px solid #d97706', 'border-radius:3px',
    'text-align:center', 'font-size:12px', 'background:white', 'padding:3px 4px',
    'box-sizing:border-box', 'resize:none', 'overflow:hidden', 'line-height:1.35',
    'font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif',
    'vertical-align:middle', 'display:block'
  ].join(';');
  fo.appendChild(inp);

  document.getElementById('ui-layer').appendChild(fo);
  inp.focus();
  inp.select();

  const finish = () => {
    saveUndo();
    node.label = inp.value.replace(/\n/g, ' ').trim();
    const el = document.getElementById('inline-edit-fo');
    if (el) el.remove();
    editingNodeId = null;
    renderAll();
    updateProperties();
  };
  inp.addEventListener('blur', finish);
  inp.addEventListener('keydown', e => {
    // Enter confirms; Shift+Enter would insert newline but we collapse to space on save anyway
    if (e.key === 'Enter') { e.preventDefault(); finish(); }
    if (e.key === 'Escape') {
      const el = document.getElementById('inline-edit-fo');
      if (el) el.remove();
      editingNodeId = null;
    }
    e.stopPropagation();
  });
}

// ============================================================
// EVENT HANDLERS
// ============================================================
const canvas = document.getElementById('canvas');
const canvasContainer = document.getElementById('canvas-container');

// Toolbox drag
document.querySelectorAll('.toolbox-item').forEach(item => {
  item.addEventListener('dragstart', e => {
    e.dataTransfer.setData('node-type', item.dataset.type);
    e.dataTransfer.effectAllowed = 'copy';
  });
  // Click a connection tool to enter connection mode (no drag needed)
  const edgeType = TOOLBOX_EDGE_TYPES[item.dataset.type];
  if (edgeType) {
    item.addEventListener('click', () => {
      cancelToolboxConnect();
      // If a single Kind/Individual is already selected, use it as the source
      let fromId = null;
      if (selectedIds.size === 1) {
        const sel = state.nodes.find(n => n.id === [...selectedIds][0]);
        if (sel && (sel.type === 'kind' || sel.type === 'individual')) fromId = sel.id;
      }
      toolboxConnectStart = { edgeType, fromId };
      canvasContainer.style.cursor = 'crosshair';
      showToolboxConnectHint(!fromId);
    });
  }
});

// Shared handler for placing a toolbox item at a canvas client position (mouse drop or touch).
function placeToolboxItem(type, clientX, clientY) {
  const pos = clientToWorld(clientX, clientY);

  // Connection tool: enter connection mode
  const edgeType = TOOLBOX_EDGE_TYPES[type];
  if (edgeType) {
    const sourceNode = hitTestNode(pos.x, pos.y);
    toolboxConnectStart = { edgeType, fromId: sourceNode ? sourceNode.id : null };
    canvasContainer.style.cursor = 'crosshair';
    showToolboxConnectHint(!sourceNode);
    return;
  }

  // Instantaneous transition marker: toggles on an existing state transition circle
  if (type === 'transition-instant') {
    const transHit = hitTestTransitionCircle(pos.x, pos.y);
    if (transHit) {
      saveUndo();
      transHit.edge.instantaneous = !transHit.edge.instantaneous;
      renderAll();
      persistLocal();
    } else {
      const stateNode = hitTestNode(pos.x, pos.y);
      if (stateNode && (stateNode.type === 'state-weak' || stateNode.type === 'state-strong')) {
        saveUndo();
        stateNode.instantaneous = !stateNode.instantaneous;
        renderAll();
        persistLocal();
      }
    }
    return;
  }

  saveUndo();
  const node = createNode(type, pos.x, pos.y);
  state.nodes.push(node);
  selectedIds.clear();
  selectedIds.add(node.id);
  renderAll();
  updateProperties();
}

canvasContainer.addEventListener('dragover', e => { e.preventDefault(); e.dataTransfer.dropEffect = 'copy'; });
canvasContainer.addEventListener('drop', e => {
  e.preventDefault();
  const type = e.dataTransfer.getData('node-type');
  if (type) placeToolboxItem(type, e.clientX, e.clientY);
});

// Touch drag support for toolbox items (iOS/iPadOS doesn't support HTML5 drag-and-drop)
let touchDragType = null;
let touchDragGhost = null;

document.querySelectorAll('.toolbox-item').forEach(item => {
  item.addEventListener('touchstart', e => {
    touchDragType = item.dataset.type;
    const touch = e.touches[0];
    touchDragGhost = item.cloneNode(true);
    touchDragGhost.style.cssText = `position:fixed;left:${touch.clientX - 30}px;top:${touch.clientY - 20}px;opacity:0.75;pointer-events:none;z-index:9999;`;
    document.body.appendChild(touchDragGhost);
    e.preventDefault();
  }, { passive: false });
});

document.addEventListener('touchmove', e => {
  if (!touchDragGhost) return;
  const touch = e.touches[0];
  touchDragGhost.style.left = (touch.clientX - 30) + 'px';
  touchDragGhost.style.top  = (touch.clientY - 20) + 'px';
  e.preventDefault();
}, { passive: false });

document.addEventListener('touchend', e => {
  if (!touchDragType) return;
  const touch = e.changedTouches[0];
  touchDragGhost.remove();
  touchDragGhost = null;
  const type = touchDragType;
  touchDragType = null;

  const rect = canvasContainer.getBoundingClientRect();
  if (touch.clientX < rect.left || touch.clientX > rect.right ||
      touch.clientY < rect.top  || touch.clientY > rect.bottom) return;

  placeToolboxItem(type, touch.clientX, touch.clientY);
});

function showToolboxConnectHint(pickingSource) {
  let hint = document.getElementById('toolbox-connect-hint');
  if (!hint) {
    hint = document.createElement('div');
    hint.id = 'toolbox-connect-hint';
    hint.style.cssText = 'position:fixed;bottom:24px;left:50%;transform:translateX(-50%);background:#333;color:#fff;padding:8px 18px;border-radius:8px;font-size:13px;pointer-events:none;z-index:9999;opacity:0.92';
    document.body.appendChild(hint);
  }
  hint.textContent = pickingSource
    ? 'Click the source node — or press Escape to cancel'
    : 'Click the target node to create the connection — or press Escape to cancel';
  hint.style.display = 'block';
}

function hideToolboxConnectHint() {
  const hint = document.getElementById('toolbox-connect-hint');
  if (hint) hint.style.display = 'none';
}

function cancelToolboxConnect() {
  toolboxConnectStart = null;
  canvasContainer.style.cursor = '';
  hideToolboxConnectHint();
}

// ---- Pointer events on SVG ----
canvas.addEventListener('pointerdown', onCanvasPointerDown);
canvas.addEventListener('pointermove', onCanvasPointerMove);
canvas.addEventListener('pointerup', onCanvasPointerUp);
canvas.addEventListener('dblclick', onCanvasDblClick);
canvas.addEventListener('contextmenu', onCanvasContextMenu);

// Resize cursor feedback on hover
const HANDLE_CURSORS = { nw: 'nwse-resize', se: 'nwse-resize', ne: 'nesw-resize', sw: 'nesw-resize', n: 'ns-resize', s: 'ns-resize', e: 'ew-resize', w: 'ew-resize' };
canvas.addEventListener('pointermove', e => {
  if (dragState) return;
  if (toolboxConnectStart) return;
  const wp = clientToWorld(e.clientX, e.clientY);
  const rh = hitTestResizeHandle(wp.x, wp.y);
  canvasContainer.style.cursor = rh ? HANDLE_CURSORS[rh.handle] : '';
});

function hitTestNode(wx, wy) {
  // Test in reverse order (top-most first), but skip containers on first pass
  let containerHit = null;
  for (let i = state.nodes.length - 1; i >= 0; i--) {
    const node = state.nodes[i];
    const bb = getBBox(node);
    if (node.type === 'container') {
      if (!containerHit && wx >= bb.x && wx <= bb.x + bb.w && wy >= bb.y && wy <= bb.y + bb.h) containerHit = node;
      continue;
    }
    if (node.type === 'kind' || node.type === 'individual' ||
        node.type === 'junction-xor' || node.type === 'junction-or' || node.type === 'junction-and') {
      const r = bb.w / 2;
      const dx = wx - bb.cx, dy = wy - bb.cy;
      if (dx*dx + dy*dy <= r*r) return node;
    } else {
      if (wx >= bb.x && wx <= bb.x + bb.w && wy >= bb.y && wy <= bb.y + bb.h) return node;
    }
  }
  return containerHit;
}

// Returns { node, handle } if near a resize handle of a selected container
// handle is one of: 'nw','ne','sw','se','n','s','e','w'
function hitTestResizeHandle(wx, wy) {
  const margin = 8;
  for (const id of selectedIds) {
    const node = state.nodes.find(n => n.id === id);
    if (!node || node.type !== 'container') continue;
    const bb = getBBox(node);
    const l = bb.x, r = bb.x + bb.w, t = bb.y, b = bb.y + bb.h;
    const mx = (l + r) / 2, my = (t + b) / 2;
    // Corners first
    if (Math.abs(wx - l) < margin && Math.abs(wy - t) < margin) return { node, handle: 'nw' };
    if (Math.abs(wx - r) < margin && Math.abs(wy - t) < margin) return { node, handle: 'ne' };
    if (Math.abs(wx - l) < margin && Math.abs(wy - b) < margin) return { node, handle: 'sw' };
    if (Math.abs(wx - r) < margin && Math.abs(wy - b) < margin) return { node, handle: 'se' };
    // Edge midpoints
    if (Math.abs(wx - mx) < margin && Math.abs(wy - t) < margin) return { node, handle: 'n' };
    if (Math.abs(wx - mx) < margin && Math.abs(wy - b) < margin) return { node, handle: 's' };
    if (Math.abs(wx - l) < margin && Math.abs(wy - my) < margin) return { node, handle: 'w' };
    if (Math.abs(wx - r) < margin && Math.abs(wy - my) < margin) return { node, handle: 'e' };
  }
  return null;
}

function hitTestEdge(wx, wy) {
  for (let i = state.edges.length - 1; i >= 0; i--) {
    const edge = state.edges[i];
    const fn = state.nodes.find(n => n.id === edge.fromId);
    const tn = state.nodes.find(n => n.id === edge.toId);
    if (!fn || !tn) continue;
    const p1 = getBoundaryPoint(fn, getBBox(tn).cx, getBBox(tn).cy);
    const p2 = getBoundaryPoint(tn, getBBox(fn).cx, getBBox(fn).cy);
    if (pointToSegmentDist(wx, wy, p1.x, p1.y, p2.x, p2.y) < 8) return edge;
  }
  return null;
}

// Returns { edge, midX, midY } if click is within 18px of a state-transition edge's circle
function hitTestTransitionCircle(wx, wy) {
  for (let i = state.edges.length - 1; i >= 0; i--) {
    const edge = state.edges[i];
    if (edge.type !== 'state-weak' && edge.type !== 'state-strong') continue;
    const fn = state.nodes.find(n => n.id === edge.fromId);
    const tn = state.nodes.find(n => n.id === edge.toId);
    if (!fn || !tn) continue;
    const fbb = getBBox(fn), tbb = getBBox(tn);
    const p1 = getBoundaryPoint(fn, tbb.cx, tbb.cy);
    const p2 = getBoundaryPoint(tn, fbb.cx, fbb.cy);
    const midX = (p1.x + p2.x) / 2, midY = (p1.y + p2.y) / 2;
    if (Math.hypot(wx - midX, wy - midY) <= 18) return { edge, midX, midY };
  }
  return null;
}

// Splits a state-transition edge by inserting a standalone node at its circle,
// then connects sourceNodeId to that new node with the given edgeType.
function splitTransitionAndConnect(transHit, sourceNodeId, edgeType) {
  const { edge, midX, midY } = transHit;
  const nodeType = edge.type; // 'state-weak' or 'state-strong'
  const transNode = createNode(nodeType, snap(midX), snap(midY));
  transNode.junction = true;
  state.nodes.push(transNode);
  state.edges = state.edges.filter(e => e.id !== edge.id);
  state.edges.push(createEdge(edge.fromId, transNode.id, 'connect-plain'));
  state.edges.push(createEdge(transNode.id, edge.toId, edge.type));
  state.edges.push(createEdge(sourceNodeId, transNode.id, edgeType));
  renderAll();
  updateProperties();
  persistLocal();
}

function pointToSegmentDist(px, py, ax, ay, bx, by) {
  const dx = bx - ax, dy = by - ay;
  const lenSq = dx*dx + dy*dy;
  if (lenSq < 0.001) return Math.hypot(px-ax, py-ay);
  const t = Math.max(0, Math.min(1, ((px-ax)*dx + (py-ay)*dy) / lenSq));
  return Math.hypot(px - (ax + t*dx), py - (ay + t*dy));
}

let pointerDownPos = null;
let rubberBandRect = null;

function onCanvasPointerDown(e) {
  if (e.button === 1) { // middle mouse = pan
    dragState = { type: 'pan', startX: e.clientX, startY: e.clientY, vpStart: { x: viewport.x, y: viewport.y } };
    canvas.setPointerCapture(e.pointerId);
    e.preventDefault();
    return;
  }
  if (e.button !== 0) return;
  if (editingNodeId) return;

  // Handle toolbox-initiated connection (two-phase: pick source then target)
  // Clicking empty space does NOT cancel — only Escape does.
  if (toolboxConnectStart) {
    const wp = clientToWorld(e.clientX, e.clientY);
    const clickedNode = hitTestNode(wp.x, wp.y);
    if (!toolboxConnectStart.fromId) {
      // Phase 1: pick source — must click a node
      if (clickedNode) {
        toolboxConnectStart.fromId = clickedNode.id;
        showToolboxConnectHint(false);
      }
      // ignore clicks on empty space — keep waiting
    } else {
      // Phase 2: pick target — node or transition edge circle
      if (clickedNode && clickedNode.id !== toolboxConnectStart.fromId) {
        saveUndo();
        state.edges.push(createEdge(toolboxConnectStart.fromId, clickedNode.id, toolboxConnectStart.edgeType));
        renderAll();
        updateProperties();
        persistLocal();
        cancelToolboxConnect();
      } else if (!clickedNode) {
        const transHit = hitTestTransitionCircle(wp.x, wp.y);
        if (transHit) {
          saveUndo();
          splitTransitionAndConnect(transHit, toolboxConnectStart.fromId, toolboxConnectStart.edgeType);
          cancelToolboxConnect();
        }
        // otherwise ignore — keep waiting
      }
    }
    e.preventDefault();
    return;
  }

  const wp = clientToWorld(e.clientX, e.clientY);
  pointerDownPos = { x: e.clientX, y: e.clientY };

  // Check for container resize handle first
  const resizeHit = hitTestResizeHandle(wp.x, wp.y);
  if (resizeHit) {
    const bb = getBBox(resizeHit.node);
    dragState = { type: 'resize', node: resizeHit.node, handle: resizeHit.handle, origBB: { x: bb.x, y: bb.y, w: bb.w, h: bb.h }, moved: false };
    canvas.setPointerCapture(e.pointerId);
    e.preventDefault();
    return;
  }

  // Hit test
  const node = hitTestNode(wp.x, wp.y);
  if (node) {
    if (e.shiftKey) {
      if (selectedIds.has(node.id)) selectedIds.delete(node.id);
      else selectedIds.add(node.id);
      renderAll();
      updateProperties();
    } else {
      if (!selectedIds.has(node.id)) { selectedIds.clear(); selectedIds.add(node.id); renderAll(); updateProperties(); }
    }
    // Start drag
    const nodeOffsets = {};
    for (const id of selectedIds) {
      const n = state.nodes.find(x => x.id === id);
      if (n) nodeOffsets[id] = { dx: wp.x - n.x, dy: wp.y - n.y };
    }
    dragState = { type: 'node', nodeOffsets, moved: false };
    canvas.setPointerCapture(e.pointerId);
    e.preventDefault();
    return;
  }

  const edge = hitTestEdge(wp.x, wp.y);
  if (edge) {
    if (e.shiftKey) { selectedIds.add(edge.id); } else { selectedIds.clear(); selectedIds.add(edge.id); }
    renderAll();
    updateProperties();
    e.preventDefault();
    return;
  }

  // Empty space: start rubber band selection (pan via middle mouse)
  rubberBandRect = { x: wp.x, y: wp.y, w: 0, h: 0, startX: wp.x, startY: wp.y };
  dragState = { type: 'rubberband' };
  canvas.setPointerCapture(e.pointerId);
  e.preventDefault();
}

function onCanvasPointerMove(e) {
  if (!dragState) return;

  if (dragState.type === 'pan') {
    viewport.x = dragState.vpStart.x + (e.clientX - dragState.startX);
    viewport.y = dragState.vpStart.y + (e.clientY - dragState.startY);
    applyViewport();
    return;
  }

  if (dragState.type === 'resize') {
    const wp = clientToWorld(e.clientX, e.clientY);
    const n = dragState.node, h = dragState.handle, o = dragState.origBB;
    const minW = 60, minH = 40;
    let newL = o.x, newT = o.y, newR = o.x + o.w, newB = o.y + o.h;
    if (h.includes('w')) newL = Math.min(snap(wp.x), newR - minW);
    if (h.includes('e')) newR = Math.max(snap(wp.x), newL + minW);
    if (h.includes('n')) newT = Math.min(snap(wp.y), newB - minH);
    if (h.includes('s')) newB = Math.max(snap(wp.y), newT + minH);
    n.w = newR - newL;
    n.h = newB - newT;
    n.x = newL + n.w / 2;
    n.y = newT + n.h / 2;
    dragState.moved = true;
    renderAll();
    return;
  }

  if (dragState.type === 'node') {
    const wp = clientToWorld(e.clientX, e.clientY);
    for (const [id, off] of Object.entries(dragState.nodeOffsets)) {
      const node = state.nodes.find(n => String(n.id) === id);
      if (node) { node.x = snap(wp.x - off.dx); node.y = snap(wp.y - off.dy); }
    }
    dragState.moved = true;
    renderAll();
    updateProperties();
    return;
  }

  if (dragState.type === 'rubberband' && rubberBandRect) {
    const wp = clientToWorld(e.clientX, e.clientY);
    rubberBandRect.w = wp.x - rubberBandRect.startX;
    rubberBandRect.h = wp.y - rubberBandRect.startY;
    renderRubberBand();
    return;
  }
}

function renderRubberBand() {
  const layer = document.getElementById('ui-layer');
  let rb = document.getElementById('rubberband-rect');
  if (!rb) {
    rb = svgEl('rect', { id: 'rubberband-rect', class: 'rubberband' });
    layer.appendChild(rb);
  }
  const r = rubberBandRect;
  rb.setAttribute('x', r.w < 0 ? r.startX + r.w : r.startX);
  rb.setAttribute('y', r.h < 0 ? r.startY + r.h : r.startY);
  rb.setAttribute('width', Math.abs(r.w));
  rb.setAttribute('height', Math.abs(r.h));
}

function onCanvasPointerUp(e) {
  if (dragState) {
    if ((dragState.type === 'node' || dragState.type === 'resize') && dragState.moved) {
      saveUndo();
    }
    if (dragState.type === 'rubberband' && rubberBandRect) {
      const r = rubberBandRect;
      const wasDrag = Math.abs(r.w) > 4 || Math.abs(r.h) > 4;
      if (wasDrag) {
        // Select all nodes whose center falls within the rubber band rect
        const x1 = Math.min(r.startX, r.startX + r.w);
        const y1 = Math.min(r.startY, r.startY + r.h);
        const x2 = Math.max(r.startX, r.startX + r.w);
        const y2 = Math.max(r.startY, r.startY + r.h);
        if (!e.shiftKey) selectedIds.clear();
        for (const node of state.nodes) {
          const bb = getBBox(node);
          if (bb.cx >= x1 && bb.cx <= x2 && bb.cy >= y1 && bb.cy <= y2) selectedIds.add(node.id);
        }
      } else {
        // Plain click on empty space — deselect all
        selectedIds.clear();
      }
      rubberBandRect = null;
      const el = document.getElementById('rubberband-rect');
      if (el) el.remove();
      renderAll();
      updateProperties();
    }
    dragState = null;
    canvas.releasePointerCapture(e.pointerId);
    persistLocal();
  }
}

document.addEventListener('click', e => {
  hideContextMenu();
});

function onCanvasDblClick(e) {
  const wp = clientToWorld(e.clientX, e.clientY);
  const node = hitTestNode(wp.x, wp.y);
  if (node) startInlineEdit(node.id);
}

function onCanvasContextMenu(e) {
  e.preventDefault();
  const wp = clientToWorld(e.clientX, e.clientY);
  const node = hitTestNode(wp.x, wp.y);
  const edge = hitTestEdge(wp.x, wp.y);
  if (node) { if (!selectedIds.has(node.id)) { selectedIds.clear(); selectedIds.add(node.id); renderAll(); updateProperties(); } }
  else if (edge) { if (!selectedIds.has(edge.id)) { selectedIds.clear(); selectedIds.add(edge.id); renderAll(); updateProperties(); } }
  if (selectedIds.size > 0) showContextMenu(e.clientX, e.clientY);
}

function showContextMenu(x, y) {
  const menu = document.getElementById('context-menu');
  menu.style.left = x + 'px';
  menu.style.top = y + 'px';
  menu.style.display = 'block';
  // Focus the first actionable item for keyboard nav
  const first = menu.querySelector('.ctx-item:not(.ctx-sep)');
  if (first) { first.setAttribute('tabindex', '0'); first.focus(); }
}

function hideContextMenu() {
  document.getElementById('context-menu').style.display = 'none';
}

document.getElementById('context-menu').addEventListener('click', e => {
  const action = e.target.dataset.action;
  if (!action) return;
  hideContextMenu();
  if (action === 'delete') deleteSelected();
  if (action === 'duplicate') duplicateSelected();
  if (action === 'front') bringToFront();
  if (action === 'back') sendToBack();
});

// Context menu keyboard navigation
document.getElementById('context-menu').addEventListener('keydown', e => {
  const menu = document.getElementById('context-menu');
  const items = Array.from(menu.querySelectorAll('.ctx-item[data-action]'));
  const focused = document.activeElement;
  const idx = items.indexOf(focused);
  if (e.key === 'Escape') { hideContextMenu(); e.preventDefault(); return; }
  if (e.key === 'ArrowDown') {
    e.preventDefault();
    const next = items[(idx + 1) % items.length];
    items.forEach(i => i.setAttribute('tabindex', '-1'));
    next.setAttribute('tabindex', '0');
    next.focus();
  } else if (e.key === 'ArrowUp') {
    e.preventDefault();
    const prev = items[(idx - 1 + items.length) % items.length];
    items.forEach(i => i.setAttribute('tabindex', '-1'));
    prev.setAttribute('tabindex', '0');
    prev.focus();
  } else if (e.key === 'Enter' && focused && focused.dataset.action) {
    focused.click();
  }
});

function bringToFront() {
  for (const id of selectedIds) {
    const idx = state.nodes.findIndex(n => n.id === id);
    if (idx !== -1) { const [n] = state.nodes.splice(idx, 1); state.nodes.push(n); }
  }
  renderAll();
}

function sendToBack() {
  for (const id of selectedIds) {
    const idx = state.nodes.findIndex(n => n.id === id);
    if (idx !== -1) { const [n] = state.nodes.splice(idx, 1); state.nodes.unshift(n); }
  }
  renderAll();
}

// Mouse wheel zoom
canvasContainer.addEventListener('wheel', e => {
  e.preventDefault();
  const factor = e.deltaY < 0 ? 1.1 : 1 / 1.1;
  const rect = canvasContainer.getBoundingClientRect();
  const mx = e.clientX - rect.left;
  const my = e.clientY - rect.top;
  // Zoom toward cursor
  viewport.x = mx - (mx - viewport.x) * factor;
  viewport.y = my - (my - viewport.y) * factor;
  viewport.scale = Math.max(0.1, Math.min(5, viewport.scale * factor));
  applyViewport();
}, { passive: false });

// Space+drag pan
let spaceDown = false;
document.addEventListener('keydown', e => {
  // Never intercept keyboard shortcuts when a text input/textarea has focus
  const tag = document.activeElement && document.activeElement.tagName.toLowerCase();
  const isTyping = tag === 'input' || tag === 'textarea' || !!editingNodeId;
  if (isTyping) return;
  if (e.key === 'Escape') { cancelToolboxConnect(); hideContextMenu(); }
  if (e.key === ' ') { spaceDown = true; canvasContainer.style.cursor = toolboxConnectStart ? 'crosshair' : 'grab'; e.preventDefault(); }
  if (e.key === 'Delete' || e.key === 'Backspace') deleteSelected();
  const mod = e.ctrlKey || e.metaKey;
  if (mod && e.key === 'z') { e.preventDefault(); undo(); }
  if (mod && (e.key === 'y' || e.key === 'Z')) { e.preventDefault(); redo(); }
  if (mod && e.key === 'd') { e.preventDefault(); duplicateSelected(); }
  if (mod && e.key === 'c') { e.preventDefault(); copySelected(); }
  if (mod && e.key === 'x') { e.preventDefault(); cutSelected(); }
  if (mod && e.key === 'v') { e.preventDefault(); pasteClipboard(); }
});
document.addEventListener('keyup', e => {
  if (e.key === ' ') { spaceDown = false; canvasContainer.style.cursor = 'default'; }
});

// ============================================================
// TOOLBAR ACTIONS
// ============================================================

// ===== FILE DROPDOWN =====
document.getElementById('btn-file').addEventListener('click', e => {
  e.stopPropagation();
  const menu = document.getElementById('file-menu');
  const wasOpen = menu.classList.contains('open');
  closeAllDropdowns();
  if (!wasOpen) menu.classList.add('open');
});

// ===== EDIT DROPDOWN =====
document.getElementById('btn-edit').addEventListener('click', e => {
  e.stopPropagation();
  const menu = document.getElementById('edit-menu');
  const wasOpen = menu.classList.contains('open');
  closeAllDropdowns();
  if (!wasOpen) menu.classList.add('open');
});
document.getElementById('edit-menu').addEventListener('click', e => {
  const item = e.target.closest('.tb-dropdown-item');
  if (!item) return;
  document.getElementById('edit-menu').classList.remove('open');
});
document.getElementById('btn-cut').addEventListener('click', cutSelected);
document.getElementById('btn-copy').addEventListener('click', copySelected);
document.getElementById('btn-paste').addEventListener('click', pasteClipboard);
document.getElementById('btn-delete').addEventListener('click', deleteSelected);

function closeAllDropdowns() {
  document.getElementById('file-menu').classList.remove('open');
  document.getElementById('edit-menu').classList.remove('open');
  document.getElementById('help-menu').classList.remove('open');
}

document.getElementById('btn-new').addEventListener('click', () => {
  if (state.nodes.length > 0 || state.edges.length > 0) {
    if (!confirm('Clear the current diagram?')) return;
  }
  saveUndo();
  state.nodes = [];
  state.edges = [];
  state.nextId = 1;
  selectedIds.clear();
  viewport = { x: 0, y: 0, scale: 1 };
  // Reset AI state for new diagram
  isFirstAIGeneration = true;
  aiConversationHistory = [];
  aiNewNodeIds = new Set();
  setAILoading(false);   // restore UI if a request was in-flight
  aiGenerationId++;      // discard any in-flight response (checked in finally)
  const aiThread = document.getElementById('ai-messages');
  if (aiThread) aiThread.innerHTML = '';
  renderAll();
  updateProperties();
  persistLocal();
  isDirty = false;  // new diagram is clean
});

document.getElementById('btn-undo').addEventListener('click', undo);
document.getElementById('btn-redo').addEventListener('click', redo);

document.getElementById('btn-zoom-in').addEventListener('click', () => {
  viewport.scale = Math.min(5, viewport.scale * 1.2);
  applyViewport();
});
document.getElementById('btn-zoom-out').addEventListener('click', () => {
  viewport.scale = Math.max(0.1, viewport.scale / 1.2);
  applyViewport();
});
document.getElementById('btn-zoom-fit').addEventListener('click', fitToWindow);

function fitToWindow() {
  if (state.nodes.length === 0) { viewport = { x: 0, y: 0, scale: 1 }; applyViewport(); return; }
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  for (const n of state.nodes) {
    const bb = getBBox(n);
    minX = Math.min(minX, bb.x); minY = Math.min(minY, bb.y);
    maxX = Math.max(maxX, bb.x + bb.w); maxY = Math.max(maxY, bb.y + bb.h);
  }
  const pad = 60;
  const rect = canvasContainer.getBoundingClientRect();
  const scaleX = rect.width / (maxX - minX + pad * 2);
  const scaleY = rect.height / (maxY - minY + pad * 2);
  viewport.scale = Math.min(scaleX, scaleY, 2);
  viewport.x = rect.width / 2 - ((minX + maxX) / 2) * viewport.scale;
  viewport.y = rect.height / 2 - ((minY + maxY) / 2) * viewport.scale;
  applyViewport();
}

// ============================================================
// SAVE / LOAD
// ============================================================
document.getElementById('btn-save').addEventListener('click', () => {
  const data = JSON.stringify({ nodes: state.nodes, edges: state.edges, nextId: state.nextId }, null, 2);
  const blob = new Blob([data], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'idef5-diagram.json';
  a.click();
  URL.revokeObjectURL(url);
  isDirty = false;
});

document.getElementById('btn-load').addEventListener('click', () => {
  document.getElementById('file-input').click();
});

document.getElementById('file-input').addEventListener('change', e => {
  const file = e.target.files[0];
  if (!file) { e.target.value = ''; return; }
  if ((state.nodes.length > 0 || state.edges.length > 0) && !confirm('Load "' + file.name + '"?\nThis will replace the current diagram.')) {
    e.target.value = '';
    return;
  }
  const reader = new FileReader();
  reader.onload = ev => {
    try {
      const data = JSON.parse(ev.target.result);
      saveUndo();
      state.nodes = data.nodes || [];
      state.edges = data.edges || [];
      state.nextId = data.nextId || 1;
      selectedIds.clear();
      isDirty = false;
      renderAll();
      updateProperties();
      fitToWindow();
    } catch(err) { alert('Error loading file: ' + err.message); }
  };
  reader.readAsText(file);
  e.target.value = '';
});

document.getElementById('btn-export-svg').addEventListener('click', exportSVG);

// ===== EXAMPLES =====
const EXAMPLES = {
  'ballpoint-pen': {
    label: 'Ballpoint Pen Components',
    nodes: [
      { id: 1, type: 'kind', x: 300, y: 80,  label: 'Ballpoint Pen' },
      { id: 2, type: 'kind', x: 120, y: 220, label: 'Lower Body' },
      { id: 3, type: 'kind', x: 300, y: 220, label: 'Cartridge' },
      { id: 4, type: 'kind', x: 480, y: 220, label: 'Upper Body' },
      { id: 5, type: 'kind', x: 60,  y: 360, label: 'Spring' },
      { id: 6, type: 'kind', x: 300, y: 360, label: 'Ink Supply' },
      { id: 7, type: 'kind', x: 480, y: 360, label: 'Ball Tip' },
    ],
    edges: [
      { id: 101, type: 'part-of', fromId: 2, toId: 1, label: '' },
      { id: 102, type: 'part-of', fromId: 3, toId: 1, label: '' },
      { id: 103, type: 'part-of', fromId: 4, toId: 1, label: '' },
      { id: 104, type: 'part-of', fromId: 5, toId: 2, label: '' },
      { id: 105, type: 'part-of', fromId: 6, toId: 3, label: '' },
      { id: 106, type: 'part-of', fromId: 7, toId: 3, label: '' },
    ],
    nextId: 200,
  },
  'water-transitions': {
    label: 'Water Phase Transitions',
    nodes: [
      { id: 1, type: 'kind',       x: 80,  y: 230, label: 'Ice' },
      { id: 2, type: 'kind',       x: 360, y: 230, label: 'Liquid Water' },
      { id: 3, type: 'kind',       x: 640, y: 230, label: 'Steam' },
      { id: 4, type: 'state-weak', x: 220, y: 230, label: '', junction: true },
      { id: 5, type: 'state-weak', x: 500, y: 230, label: '', junction: true },
      { id: 6, type: 'process',    x: 220, y: 80,  label: 'Melt Ice' },
      { id: 7, type: 'process',    x: 500, y: 80,  label: 'Boil Water' },
    ],
    edges: [
      { id: 101, type: 'connect-plain', fromId: 1, toId: 4, label: '' },
      { id: 102, type: 'state-weak',    fromId: 4, toId: 2, label: '' },
      { id: 103, type: 'connect-plain', fromId: 6, toId: 4, label: '' },
      { id: 104, type: 'connect-plain', fromId: 2, toId: 5, label: '' },
      { id: 105, type: 'state-weak',    fromId: 5, toId: 3, label: '' },
      { id: 106, type: 'connect-plain', fromId: 7, toId: 5, label: '' },
    ],
    nextId: 200,
  },
  'vehicle-classification': {
    label: 'Vehicle Classification',
    nodes: [
      { id: 1, type: 'kind', x: 480, y: 60,  label: 'Vehicle' },
      { id: 2, type: 'kind', x: 270, y: 200, label: 'Land Vehicle' },
      { id: 3, type: 'kind', x: 690, y: 200, label: 'Water Vehicle' },
      { id: 4, type: 'kind', x: 60,  y: 360, label: 'Car' },
      { id: 5, type: 'kind', x: 200, y: 360, label: 'Truck' },
      { id: 6, type: 'kind', x: 340, y: 360, label: 'Bicycle' },
      { id: 7, type: 'kind', x: 480, y: 360, label: 'Motorcycle' },
      { id: 8, type: 'kind', x: 620, y: 360, label: 'Boat' },
      { id: 9, type: 'kind', x: 760, y: 360, label: 'Ship' },
    ],
    edges: [
      { id: 101, type: 'subkind-of', fromId: 2, toId: 1, label: '' },
      { id: 102, type: 'subkind-of', fromId: 3, toId: 1, label: '' },
      { id: 103, type: 'subkind-of', fromId: 4, toId: 2, label: '' },
      { id: 104, type: 'subkind-of', fromId: 5, toId: 2, label: '' },
      { id: 105, type: 'subkind-of', fromId: 6, toId: 2, label: '' },
      { id: 106, type: 'subkind-of', fromId: 7, toId: 2, label: '' },
      { id: 107, type: 'subkind-of', fromId: 8, toId: 3, label: '' },
      { id: 108, type: 'subkind-of', fromId: 9, toId: 3, label: '' },
    ],
    nextId: 200,
  },
  'agent-ontology': {
    label: 'Agent Classification',
    nodes: [
      { id: 1,  type: 'kind',       x: 300, y: 180, label: 'Agent' },
      { id: 2,  type: 'kind',       x: 580, y: 60,  label: 'Environment' },
      { id: 3,  type: 'kind',       x: 580, y: 180, label: 'Perception' },
      { id: 4,  type: 'kind',       x: 580, y: 340, label: 'Action' },
      { id: 5,  type: 'kind',       x: 120, y: 340, label: 'Autonomous Agent' },
      { id: 6,  type: 'kind',       x: 460, y: 340, label: 'Reactive Agent' },
      { id: 7,  type: 'kind',       x: 60,  y: 500, label: 'Software Agent' },
      { id: 8,  type: 'kind',       x: 240, y: 500, label: 'Human Agent' },
      { id: 9,  type: 'kind',       x: 60,  y: 660, label: 'AI Agent' },
      { id: 10, type: 'individual', x: 240, y: 660, label: 'Ada Lovelace' },
    ],
    edges: [
      { id: 101, type: 'subkind-of',  fromId: 5,  toId: 1,  label: '' },
      { id: 102, type: 'subkind-of',  fromId: 6,  toId: 1,  label: '' },
      { id: 103, type: 'subkind-of',  fromId: 7,  toId: 5,  label: '' },
      { id: 104, type: 'subkind-of',  fromId: 8,  toId: 5,  label: '' },
      { id: 105, type: 'subkind-of',  fromId: 9,  toId: 7,  label: '' },
      { id: 106, type: 'part-of',     fromId: 3,  toId: 1,  label: '' },
      { id: 107, type: 'part-of',     fromId: 4,  toId: 1,  label: '' },
      { id: 108, type: 'relation-alt', fromId: 1,  toId: 2,  label: 'operates in' },
      { id: 109, type: 'instance-of', fromId: 10, toId: 8,  label: '' },
    ],
    nextId: 200,
  },
  'fastener-classification': {
    label: 'Fastener Classification',
    nodes: [
      { id: 1,  type: 'kind', x: 380, y: 60,  label: 'Fastener' },
      { id: 2,  type: 'kind', x: 160, y: 200, label: 'Threaded Fastener' },
      { id: 3,  type: 'kind', x: 560, y: 200, label: 'Non-Threaded Fastener' },
      { id: 4,  type: 'kind', x: 80,  y: 340, label: 'Bolt' },
      { id: 5,  type: 'kind', x: 220, y: 340, label: 'Screw' },
      { id: 6,  type: 'kind', x: 440, y: 340, label: 'Nail' },
      { id: 7,  type: 'kind', x: 580, y: 340, label: 'Rivet' },
      { id: 8,  type: 'kind', x: 720, y: 340, label: 'Staple' },
      { id: 9,  type: 'kind', x: 60,  y: 480, label: 'Hex Bolt' },
      { id: 10, type: 'kind', x: 200, y: 480, label: 'Carriage Bolt' },
    ],
    edges: [
      { id: 101, type: 'subkind-of', fromId: 2,  toId: 1, label: '' },
      { id: 102, type: 'subkind-of', fromId: 3,  toId: 1, label: '' },
      { id: 103, type: 'subkind-of', fromId: 4,  toId: 2, label: '' },
      { id: 104, type: 'subkind-of', fromId: 5,  toId: 2, label: '' },
      { id: 105, type: 'subkind-of', fromId: 6,  toId: 3, label: '' },
      { id: 106, type: 'subkind-of', fromId: 7,  toId: 3, label: '' },
      { id: 107, type: 'subkind-of', fromId: 8,  toId: 3, label: '' },
      { id: 108, type: 'subkind-of', fromId: 9,  toId: 4, label: '' },
      { id: 109, type: 'subkind-of', fromId: 10, toId: 4, label: '' },
    ],
    nextId: 200,
  },
  'library-system': {
    label: 'Library System',
    nodes: [
      { id: 1, type: 'kind',           x: 120, y: 120, label: 'Library' },
      { id: 2, type: 'kind',           x: 120, y: 300, label: 'Member' },
      { id: 3, type: 'kind',           x: 560, y: 120, label: 'Book' },
      { id: 4, type: 'relation-first', x: 340, y: 120, label: 'holds' },
      { id: 5, type: 'relation-first', x: 340, y: 300, label: 'borrows' },
      { id: 6, type: 'kind',           x: 460, y: 300, label: 'Fiction' },
      { id: 7, type: 'kind',           x: 660, y: 300, label: 'Non-Fiction' },
      { id: 8, type: 'individual',     x: 120, y: 460, label: 'Alice' },
    ],
    edges: [
      { id: 101, type: 'first-order', fromId: 4, toId: 1, label: '' },
      { id: 102, type: 'first-order', fromId: 4, toId: 3, label: '' },
      { id: 103, type: 'first-order', fromId: 5, toId: 2, label: '' },
      { id: 104, type: 'first-order', fromId: 5, toId: 3, label: '' },
      { id: 105, type: 'subkind-of',  fromId: 6, toId: 3, label: '' },
      { id: 106, type: 'subkind-of',  fromId: 7, toId: 3, label: '' },
      { id: 107, type: 'instance-of', fromId: 8, toId: 2, label: '' },
    ],
    nextId: 200,
  },
};

function loadExample(key) {
  const ex = EXAMPLES[key];
  if (!ex) return;
  const hasContent = state.nodes.length > 0 || state.edges.length > 0;
  if (hasContent && !confirm(`Load example "${ex.label}"?\nThis will replace the current diagram.`)) return;
  saveUndo();
  state.nodes = ex.nodes.map(n => ({ ...n }));
  state.edges = ex.edges.map(e => ({ ...e }));
  state.nextId = ex.nextId;
  selectedIds.clear();
  renderAll();
  updateProperties();
  persistLocal();
  fitToWindow();
}

document.getElementById('btn-help-menu').addEventListener('click', e => {
  e.stopPropagation();
  const menu = document.getElementById('help-menu');
  const wasOpen = menu.classList.contains('open');
  closeAllDropdowns();
  if (!wasOpen) menu.classList.add('open');
});

document.getElementById('examples-menu').addEventListener('click', e => {
  const item = e.target.closest('[data-example]');
  if (!item) return;
  closeAllDropdowns();
  loadExample(item.dataset.example);
});

document.addEventListener('click', () => {
  closeAllDropdowns();
});

function exportSVG() {
  // Compute bounding box of all nodes
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  for (const n of state.nodes) {
    const bb = getBBox(n);
    minX = Math.min(minX, bb.x); minY = Math.min(minY, bb.y);
    maxX = Math.max(maxX, bb.x + bb.w); maxY = Math.max(maxY, bb.y + bb.h);
  }
  if (!isFinite(minX)) { minX = 0; minY = 0; maxX = 400; maxY = 300; }
  const pad = 30;
  const vbX = minX - pad, vbY = minY - pad;
  const vbW = (maxX - minX) + pad * 2;
  const vbH = (maxY - minY) + pad * 2;

  const svgNS = 'http://www.w3.org/2000/svg';
  const exportSvg = document.createElementNS(svgNS, 'svg');
  exportSvg.setAttribute('xmlns', svgNS);
  exportSvg.setAttribute('viewBox', `${vbX} ${vbY} ${vbW} ${vbH}`);
  exportSvg.setAttribute('width', vbW);
  exportSvg.setAttribute('height', vbH);

  // Copy defs
  const defs = document.getElementById('canvas').querySelector('defs').cloneNode(true);
  exportSvg.appendChild(defs);

  // Re-render without selection and without grid
  const origSelected = new Set(selectedIds);
  selectedIds.clear();

  const edgesG = document.createElementNS(svgNS, 'g');
  for (const edge of state.edges) { const g = createEdgeSVG(edge); if (g) edgesG.appendChild(g); }
  exportSvg.appendChild(edgesG);

  const nodesG = document.createElementNS(svgNS, 'g');
  for (const node of state.nodes) nodesG.appendChild(createNodeSVG(node));
  exportSvg.appendChild(nodesG);

  // Restore selection
  origSelected.forEach(id => selectedIds.add(id));

  const serializer = new XMLSerializer();
  const svgStr = serializer.serializeToString(exportSvg);
  const blob = new Blob([svgStr], { type: 'image/svg+xml' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'idef5-diagram.svg';
  a.click();
  URL.revokeObjectURL(url);
}

// ============================================================
// AI PANEL
// ============================================================

const AI_MODEL       = 'claude-sonnet-4-6';
const AI_ENDPOINT    = 'https://api.anthropic.com/v1/messages';
const AI_MAX_TOKENS  = 4096;
const AI_TIMEOUT_MS  = 45000;
const AI_HISTORY_MAX = 20;  // messages (10 turns)
const AI_SYSTEM_PROMPT = `You are a knowledge engineering assistant for Quiddity, a browser-based IDEF5 ontology editor.

IDEF5 symbol types you may use:
  Nodes: kind, individual, relation-first, relation-second, relation-alt, process,
         referent, junction-xor, junction-or, junction-and, state-weak, state-strong,
         transition-instant, connect-fwd, connect-bwd, connect-plain, container, key
  Edges: subkind-of, instance-of, part-of, first-order, second-order,
         state-weak, state-strong, connect-plain, connect-fwd, connect-bwd, relation-alt

Respond ONLY with valid JSON — no prose, no markdown fences, just raw JSON:
{
  "description": "one-sentence summary of what was modeled",
  "nodes": [
    { "id": "n1", "type": "kind", "label": "Patient" }
  ],
  "edges": [
    { "id": "e1", "from": "n1", "to": "n2", "type": "subkind-of", "label": "" }
  ]
}

Rules:
- Node IDs: use short identifiers like "n1", "n2" — the client remaps these to globally unique IDs.
- Use "kind" for categories, "individual" for specific named instances.
- Ensure all node labels are unique within each response.
- Do not include x, y, w, h, color — the client handles layout.
- Generate no more than 20 nodes per response.
- For extensions: you will receive existing node and edge context. Reference existing node IDs
  in edge from/to fields to connect new nodes to existing ones.`;

// AI state variables
let aiConversationHistory = [];
let aiPanelOpen = false;
let isFirstAIGeneration = true;
let aiNewNodeIds = new Set();
let aiGenerationId = 0;

// ---- utility: mask an API key for display ----
function maskApiKey(key) {
  if (!key || key.length < 10) return key;
  return key.slice(0, 7) + '\u2022'.repeat(8);
}

// ---- show/hide panel ----
function openAIPanel() {
  aiPanelOpen = true;
  document.getElementById('ai-panel').classList.add('open');
  document.getElementById('btn-ai').classList.add('ai-active');
  syncAIKeySection();
  syncAITextareaPlaceholder();
  if (document.getElementById('ai-messages').children.length === 0) {
    appendAIMessage('ai', 'Describe a domain and I\'ll build an IDEF5 knowledge graph on the canvas. Try: <em>Model how a hospital manages patients.</em>');
  }
}

function closeAIPanel() {
  aiPanelOpen = false;
  document.getElementById('ai-panel').classList.remove('open');
  document.getElementById('btn-ai').classList.remove('ai-active');
}

function syncAIKeySection() {
  const key = localStorage.getItem('quiddity-ai-key') || '';
  const inputRow  = document.getElementById('ai-key-input-row');
  const storedRow = document.getElementById('ai-key-stored-row');
  const maskEl    = document.getElementById('ai-key-mask');
  if (key) {
    inputRow.style.display  = 'none';
    storedRow.style.display = 'flex';
    maskEl.textContent = '\uD83D\uDD13 ' + maskApiKey(key);
  } else {
    inputRow.style.display  = '';
    storedRow.style.display = 'none';
  }
}

function syncAITextareaPlaceholder() {
  const key = localStorage.getItem('quiddity-ai-key') || '';
  const ta = document.getElementById('ai-textarea');
  ta.placeholder = key
    ? 'Add concepts, refine, or ask questions\u2026'
    : 'Paste your Anthropic API key above to get started.';
}

// ---- append a message bubble to the thread ----
function appendAIMessage(role, html, chip) {
  const thread = document.getElementById('ai-messages');
  const div = document.createElement('div');
  div.className = 'ai-msg ' + role;
  const roleLabel = document.createElement('div');
  roleLabel.className = 'ai-msg-role';
  roleLabel.textContent = role === 'user' ? 'You' : 'AI';
  const body = document.createElement('div');
  body.className = 'ai-msg-body';
  body.innerHTML = html;
  div.appendChild(roleLabel);
  div.appendChild(body);
  if (chip) {
    const chipEl = document.createElement('div');
    chipEl.className = 'ai-confirm-chip';
    chipEl.textContent = chip;
    div.appendChild(chipEl);
  }
  thread.appendChild(div);
  thread.scrollTop = thread.scrollHeight;
  return body;
}

// ---- set in-flight UI state ----
function setAILoading(loading) {
  const btn = document.getElementById('ai-send-btn');
  const ta  = document.getElementById('ai-textarea');
  if (loading) {
    btn.innerHTML = '<span class="ai-spinner"></span>';
    btn.disabled = true;
    btn.setAttribute('aria-busy', 'true');
    btn.setAttribute('aria-disabled', 'true');
    ta.disabled = true;
    document.getElementById('ai-canvas-spinner').style.display = 'flex';
  } else {
    btn.innerHTML = 'Send';
    btn.disabled = false;
    btn.removeAttribute('aria-busy');
    btn.removeAttribute('aria-disabled');
    ta.disabled = false;
    document.getElementById('ai-canvas-spinner').style.display = 'none';
  }
}

// ---- callClaudeAPI ----
async function callClaudeAPI(userMessage) {
  const key = localStorage.getItem('quiddity-ai-key') || '';
  if (!key) {
    appendAIMessage('ai', '<span class="ai-error">Enter your Anthropic API key above to get started.</span>');
    return;
  }

  const myId = ++aiGenerationId;

  // Build context message (not stored in history)
  const contextMessage = {
    role: 'user',
    content: `Current graph state:\n${JSON.stringify({
      existing_nodes: state.nodes.map(n => ({ id: n.id, type: n.type, label: n.label })),
      existing_edges: state.edges.map(e => ({ id: e.id, from: e.fromId, to: e.toId, type: e.type, label: e.label }))
    }, null, 2)}\n\nUser request: ${userMessage}`
  };
  const messages = [...aiConversationHistory, contextMessage];

  // Show user bubble + thinking state
  appendAIMessage('user', escapeHtml(userMessage));
  const thinkingBody = appendAIMessage('ai', '<span class="ai-thinking">Thinking\u2026</span>');
  setAILoading(true);

  // Timeout controller
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), AI_TIMEOUT_MS);

  let rawText = '';
  try {
    const resp = await fetch(AI_ENDPOINT, {
      method: 'POST',
      signal: controller.signal,
      headers: {
        'content-type': 'application/json',
        'x-api-key': key,
        'anthropic-version': '2023-06-01',
        'anthropic-dangerous-direct-browser-access': 'true',
      },
      body: JSON.stringify({
        model: AI_MODEL,
        max_tokens: AI_MAX_TOKENS,
        system: AI_SYSTEM_PROMPT,
        messages,
      }),
    });
    clearTimeout(timer);

    if (myId !== aiGenerationId) return;  // stale — new diagram clicked mid-flight

    if (resp.status === 401) throw Object.assign(new Error('API key rejected. Check your key and try again.'), { aiError: true });
    if (resp.status === 429) throw Object.assign(new Error('Rate limited \u2014 wait a moment and try again.'), { aiError: true });
    if (!resp.ok) throw Object.assign(new Error(`API error ${resp.status}. Try again.`), { aiError: true });

    const data = await resp.json();
    rawText = data.content?.[0]?.text ?? '';

    // Strip markdown fences if present
    rawText = rawText.replace(/^```json?\n?/, '').replace(/\n?```$/, '').trim();

    const payload = JSON.parse(rawText);
    mergeAIGraph(payload);

    // Update history only on success
    aiConversationHistory.push({ role: 'user', content: userMessage });
    aiConversationHistory.push({ role: 'assistant', content: rawText });
    if (aiConversationHistory.length > AI_HISTORY_MAX) aiConversationHistory.splice(0, 2);

    const chip = `\u2713 ${payload.nodes.length} node${payload.nodes.length !== 1 ? 's' : ''} \u00B7 ${payload.edges.length} edge${payload.edges.length !== 1 ? 's' : ''} added`;
    thinkingBody.closest('.ai-msg').remove();
    appendAIMessage('ai', escapeHtml(payload.description || 'Done.'), chip);
    document.getElementById('ai-textarea').value = '';

  } catch (err) {
    clearTimeout(timer);
    if (myId !== aiGenerationId) return;

    let msg;
    if (err.name === 'AbortError') {
      msg = 'Request timed out. Try again.';
    } else if (err.aiError) {
      msg = err.message;
    } else if (err instanceof SyntaxError) {
      msg = 'AI returned an unexpected response. Try rephrasing your prompt.';
      console.warn('[AI] Non-JSON response:', rawText);
    } else {
      msg = 'Network error. Check your connection.';
    }
    thinkingBody.innerHTML = `<span class="ai-error">\u26A0 ${escapeHtml(msg)}</span>`;
    thinkingBody.classList.remove('ai-thinking');
    // textarea preserved on error so user can retry
  } finally {
    if (myId === aiGenerationId) setAILoading(false);
  }
}

// ---- escapeHtml helper ----
function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// ---- validateAIPayload ----
function validateAIPayload(payload) {
  if (!Array.isArray(payload.nodes) || !Array.isArray(payload.edges)) {
    throw new Error('AI returned an unexpected response. Try rephrasing your prompt.');
  }
  if (payload.nodes.length === 0 && payload.edges.length === 0) {
    throw new Error('AI returned an empty graph. Try a more specific description.');
  }
  for (const n of payload.nodes) {
    if (!n.id || !n.type || !n.label) {
      throw new Error('AI returned malformed nodes. Try again.');
    }
  }
  const VALID_EDGE_TYPES = new Set([
    'subkind-of', 'instance-of', 'part-of', 'first-order', 'second-order',
    'state-weak', 'state-strong', 'connect-plain', 'connect-fwd', 'connect-bwd', 'relation-alt',
  ]);
  const VALID_NODE_TYPES = new Set([
    'kind', 'individual', 'relation-first', 'relation-second', 'relation-alt', 'process',
    'referent', 'junction-xor', 'junction-or', 'junction-and', 'state-weak', 'state-strong',
    'transition-instant', 'connect-fwd', 'connect-bwd', 'connect-plain', 'container', 'key',
  ]);
  for (const n of payload.nodes) {
    if (!VALID_NODE_TYPES.has(n.type)) {
      throw new Error(`AI returned unknown node type "${n.type}". Try again.`);
    }
  }
  for (const e of payload.edges) {
    if (!e.id || !e.from || !e.to || !e.type) {
      throw new Error('AI returned malformed edges. Try again.');
    }
    if (!VALID_EDGE_TYPES.has(e.type)) {
      throw new Error(`AI returned unknown edge type "${e.type}". Try again.`);
    }
  }
  // Edge references: warn + omit bad ones rather than rejecting entire payload
  const validIds = new Set([
    ...payload.nodes.map(n => n.id),
    ...state.nodes.map(n => n.id)
  ]);
  for (const e of payload.edges) {
    if (!validIds.has(e.from) || !validIds.has(e.to)) {
      console.warn('[AI] Edge references unknown node, will be omitted:', e);
    }
  }
}

// ---- computeBoundingBox ----
function computeBoundingBox() {
  if (!state.nodes.length) return { x: 80, y: 80, w: 0, h: 0 };
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  for (const n of state.nodes) {
    minX = Math.min(minX, n.x);
    minY = Math.min(minY, n.y);
    maxX = Math.max(maxX, n.x + (n.w ?? 80));
    maxY = Math.max(maxY, n.y + (n.h ?? 40));
  }
  return { x: minX, y: minY, w: maxX - minX, h: maxY - minY };
}

// ---- computeAILayout ----
function computeAILayout(count) {
  const positions = [];
  if (state.nodes.length === 0) {
    // Initial generation: column-major grid, max 10 columns
    for (let i = 0; i < count; i++) {
      positions.push({ x: 80 + (i % 10) * 180, y: 80 + Math.floor(i / 10) * 150 });
    }
  } else {
    // Extension: place right of existing bounding box
    const bbox = computeBoundingBox();
    let startX = bbox.x + bbox.w + 120;
    let startY = bbox.y;
    if (startX > 1200) { startX = bbox.x; startY = bbox.y + bbox.h + 120; }
    for (let i = 0; i < count; i++) {
      positions.push({ x: startX + (i % 4) * 180, y: startY + Math.floor(i / 4) * 150 });
    }
  }
  return positions;
}

// ---- mergeAIGraph ----
function mergeAIGraph(payload) {
  const turnPrefix = 't-' + Date.now() + '-' + Math.random().toString(36).slice(2, 10);
  const idMap = {};

  validateAIPayload(payload);  // throws if invalid — saveUndo NOT called yet
  saveUndo();                  // only reached if payload is valid

  const layout = computeAILayout(payload.nodes.length);
  aiNewNodeIds = new Set();

  for (let i = 0; i < payload.nodes.length; i++) {
    const node = payload.nodes[i];
    const newId = turnPrefix + '-' + node.id;
    idMap[node.id] = newId;
    aiNewNodeIds.add(newId);
    state.nodes.push({ id: newId, type: node.type, label: node.label,
                       x: layout[i].x, y: layout[i].y });
  }

  // Hoist validIds before edge loop — O(n+m) not O(n×m)
  const validIds = new Set(state.nodes.map(n => n.id));
  for (const edge of payload.edges) {
    const resolvedFrom = idMap[edge.from] ?? edge.from;
    const resolvedTo   = idMap[edge.to]   ?? edge.to;
    if (!validIds.has(resolvedFrom) || !validIds.has(resolvedTo)) continue;
    state.edges.push({
      id: turnPrefix + '-e-' + Math.random().toString(36).slice(2, 10),
      fromId: resolvedFrom,
      toId:   resolvedTo,
      type: edge.type,
      label: edge.label ?? ''
    });
  }

  renderAll();
  persistLocal();

  if (isFirstAIGeneration) {
    fitToWindow();
    isFirstAIGeneration = false;
  }

  // Clear highlight after 2s
  setTimeout(() => { aiNewNodeIds = new Set(); renderAll(); }, 2000);
}

// ---- Toolbar AI button ----
document.getElementById('btn-ai').addEventListener('click', () => {
  if (aiPanelOpen) closeAIPanel(); else openAIPanel();
});

// ---- Panel close button ----
document.getElementById('ai-panel-close').addEventListener('click', closeAIPanel);

// ---- Escape key closes panel when focused inside ----
document.getElementById('ai-panel').addEventListener('keydown', e => {
  if (e.key === 'Escape') { closeAIPanel(); document.getElementById('btn-ai').focus(); }
});

// ---- API key input: save on Enter or blur ----
document.getElementById('ai-key-input').addEventListener('keydown', e => {
  if (e.key === 'Enter') { e.preventDefault(); saveAIKey(); }
});
document.getElementById('ai-key-input').addEventListener('blur', saveAIKey);
function saveAIKey() {
  const input = document.getElementById('ai-key-input');
  const key = input.value.trim();
  if (key) {
    localStorage.setItem('quiddity-ai-key', key);
    input.value = '';
    syncAIKeySection();
    syncAITextareaPlaceholder();
  }
}

// ---- API key clear button ----
document.getElementById('ai-key-clear').addEventListener('click', () => {
  localStorage.removeItem('quiddity-ai-key');
  syncAIKeySection();
  syncAITextareaPlaceholder();
});

// ---- Send button ----
document.getElementById('ai-send-btn').addEventListener('click', handleAISend);

// ---- Ctrl+Enter in textarea ----
document.getElementById('ai-textarea').addEventListener('keydown', e => {
  if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
    e.preventDefault();
    handleAISend();
  }
});

function handleAISend() {
  const ta = document.getElementById('ai-textarea');
  const msg = ta.value.trim();
  if (!msg) return;
  callClaudeAPI(msg);
}

// ============================================================
// TOOLBOX KEYBOARD: Enter key to place / activate
// ============================================================
document.getElementById('toolbox').addEventListener('keydown', e => {
  if (e.key !== 'Enter') return;
  const item = e.target.closest('.toolbox-item');
  if (!item) return;
  e.preventDefault();
  const type = item.dataset.type;
  if (!type) return;
  // For edge-type tools: same as clicking the item (enter connection mode)
  if (TOOLBOX_EDGE_TYPES[type]) {
    cancelToolboxConnect();
    toolboxConnectStart = { edgeType: TOOLBOX_EDGE_TYPES[type], fromId: null };
    canvasContainer.style.cursor = 'crosshair';
    showToolboxConnectHint(true);
    return;
  }
  // For node-type tools: place at canvas center
  const rect = canvasContainer.getBoundingClientRect();
  placeToolboxItem(type, rect.left + rect.width / 2, rect.top + rect.height / 2);
});

// ============================================================
// PROPERTIES PANEL TOGGLE (tablet)
// ============================================================
const propsToggle = document.getElementById('props-toggle');
if (propsToggle) {
  propsToggle.addEventListener('click', () => {
    const panel = document.getElementById('properties');
    const open = panel.classList.toggle('open');
    propsToggle.textContent = open ? '\u25B6' : '\u25C4';
  });
}

// ============================================================
// INIT
// ============================================================
function init() {
  loadLocal();
  renderAll();
  updateProperties();

  // Center viewport
  const rect = canvasContainer.getBoundingClientRect();
  if (state.nodes.length === 0) {
    viewport.x = rect.width / 2;
    viewport.y = rect.height / 2;
  } else {
    fitToWindow();
  }
  applyViewport();
}

// Wait for layout
requestAnimationFrame(init);
