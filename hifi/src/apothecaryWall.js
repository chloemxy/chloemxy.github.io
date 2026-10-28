// The rest of the apothecary wall, built round the glass-lidded bins at its
// centre: a long counter under everything; on each side of the bins a
// column of small labelled drawers; beyond them open shelving, its shelves
// crowded with labelled jars, potion bottles, candles, crystals, books and a
// stone mortar; and above the bins and drawers, more small drawers up to a
// cornice under the ceiling. The whole wall is one finish with the bins
// (weathered walnut, or the clean brass of ?finish=brass).
//
// It is scenery: only the bins open. The wall's face is flush with theirs.

import * as THREE from 'three';
import { Kit, jar } from './cabinet.js?v=20261028032817';
import { makeCurio } from './trinkets.js?v=20261028032817';
import { herbs } from './content.js?v=20261028032817';
import { paintLabel } from './paint.js?v=20261028032817';

const V = (x, y, z) => new THREE.Vector3(x, y, z);

function seeded(seed) {
  let s = seed >>> 0 || 1;
  return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296);
}

// old pharmacopoeia names for the small drawers, after the herbs' own
const MORE = [
  'Sem. Anisi', 'Rad. Althaeae', 'Cort. Cinnam.', 'Flor. Rosae', 'Sem. Lini', 'Fol. Sennae', 'Rad. Rhei', 'Cort. Querc.',
  'Gum. Arab.', 'Sal. Ammon.', 'Flor. Sulph.', 'Fol. Uvae Ursi', 'Rad. Gentian.', 'Herb. Absinth.', 'Myrrha', 'Camphora',
  'Cera Flava', 'Sem. Sinap.', 'Fruct. Junip.', 'Rad. Iridis', 'Cort. Chinae', 'Lign. Santal.', 'Sem. Cardam.', 'Ol. Olivae',
];
const NAMES = [...herbs.map((h) => h.label), ...MORE];

const JAR_LABELS = ['Moon Water', 'Star Dust', 'Rose Petals', 'Sea Salt', 'Mugwort', 'Lavender', 'Bay Leaf', 'Black Salt', 'Calendula', 'Chamomile', 'Elderberry', 'Rosemary', 'Sage', 'Hibiscus'];
const FILLS = ['#b9b6e6', '#e8d68a', '#b5525e', '#efeae0', '#7d8a5a', '#8f7aa3', '#6f7f4a', '#2d2a2e', '#d27a26', '#d8c98c', '#4a2a3a', '#56735a', '#8f9f84', '#a8344a'];
const LIQUIDS = ['#ff7fb2', '#5a7dff', '#c6b4ff', '#7dff8a', '#ffb347', '#e0f0ff'];
const BOOKS = ['#5b2c2a', '#2f4a3a', '#3b3550', '#7a5a2e', '#1f2b3a', '#6b3b2a', '#4a4a3a'];

// Small drawers in a grid between x0..x1, y0..y1: an outer frame, rails and
// dividers, and a front for each with a brass card frame and knob. Their
// labels are collected in `labels` and drawn afterwards from one texture.
function drawerBlock(k, labels, mats, { x0, x1, y0, y1, cols, rows, depth = 0.36 }) {
  const G = 0.014;
  const w = (x1 - x0 - (cols + 1) * G) / cols, h = (y1 - y0 - (rows + 1) * G) / rows;
  const wood = mats.wall, metal = mats.brass, knob = mats.knob ?? mats.brass;
  k.beam(V((x0 + x1) / 2, y0, -depth + 0.006), V((x0 + x1) / 2, y1, -depth + 0.006), x1 - x0, 0.012, wood, V(1, 0, 0));
  for (const x of [x0 + G / 2, x1 - G / 2]) k.beam(V(x, y0, -depth / 2), V(x, y1, -depth / 2), depth, G, wood, V(0, 0, 1));
  for (let i = 0; i <= rows; i++) {
    const y = y0 + i * (h + G) + G / 2;
    k.beam(V(x0 + G, y, -depth / 2), V(x1 - G, y, -depth / 2), depth, G, wood, V(0, 0, 1));
  }
  for (let i = 0; i < rows; i++) {
    const ya = y0 + G + i * (h + G);
    for (let j = 1; j < cols; j++) {
      const x = x0 + G + j * (w + G) - G / 2;
      k.beam(V(x, ya, -depth / 2 - 0.006), V(x, ya + h, -depth / 2 - 0.006), depth - 0.012, G, wood, V(0, 0, 1));
    }
  }
  const lw = Math.min(w * 0.55, 0.11), lh = Math.min(h * 0.3, 0.042), bar = 0.0035;
  for (let i = 0; i < rows; i++) {
    for (let j = 0; j < cols; j++) {
      const cx = x0 + G + j * (w + G) + w / 2, cy = y1 - G - i * (h + G) - h / 2;
      k.beam(V(cx - w / 2 + 0.002, cy, -0.006), V(cx + w / 2 - 0.002, cy, -0.006), h - 0.004, 0.016, wood, V(0, 1, 0));
      const ly = cy + h * 0.14;
      for (const s of [-1, 1]) {
        k.beam(V(cx - lw / 2, ly + s * (lh / 2 - bar / 2), 0.003), V(cx + lw / 2, ly + s * (lh / 2 - bar / 2), 0.003), bar, 0.002, metal, V(0, 1, 0), 1);
        k.beam(V(cx + s * (lw / 2 - bar / 2), ly - lh / 2 + bar, 0.003), V(cx + s * (lw / 2 - bar / 2), ly + lh / 2 - bar, 0.003), bar, 0.002, metal, V(1, 0, 0), 1);
      }
      labels.push({ x: cx, y: ly, w: lw - 2 * bar + 0.001, h: lh - 2 * bar + 0.001 });
      k.knob(V(cx, cy - h * 0.24, 0.002), knob, Math.min(0.0085, h * 0.075));
    }
  }
}

// every drawer label in one texture (an atlas of the same paper labels the
// drawer cabinet uses), on one merged mesh
function labelMesh(labels) {
  const LW = 512, LH = 208, per = 4;
  const rowsN = Math.ceil(labels.length / per);
  const atlas = document.createElement('canvas');
  atlas.width = LW * per; atlas.height = LH * rowsN;
  const ctx = atlas.getContext('2d');
  const geos = labels.map((l, i) => {
    const name = NAMES[i % NAMES.length];
    ctx.drawImage(paintLabel({ id: `${name}-${i}`, label: name, no: i + 1 }), (i % per) * LW, Math.floor(i / per) * LH);
    const g = new THREE.PlaneGeometry(l.w, l.h);
    const u0 = (i % per) / per, v1 = 1 - Math.floor(i / per) / rowsN, v0 = v1 - 1 / rowsN;
    const uv = g.attributes.uv;
    for (let n = 0; n < uv.count; n++) uv.setXY(n, u0 + uv.getX(n) / per, v0 + uv.getY(n) * (v1 - v0));
    return g.translate(l.x, l.y, 0.0035);
  });
  const tex = new THREE.CanvasTexture(atlas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 8;
  const merged = new THREE.BufferGeometry();
  const pos = [], uv = [], nor = [];
  for (const g of geos) {
    pos.push(...g.attributes.position.array); uv.push(...g.attributes.uv.array); nor.push(...g.attributes.normal.array);
  }
  // PlaneGeometry is indexed: expand to triangles
  const idx = [];
  geos.forEach((g, i) => { for (const n of g.index.array) idx.push(n + i * 4); });
  merged.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  merged.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
  merged.setAttribute('normal', new THREE.Float32BufferAttribute(nor, 3));
  merged.setIndex(idx);
  const m = new THREE.Mesh(merged, new THREE.MeshStandardMaterial({ map: tex, roughness: 0.9 }));
  m.receiveShadow = true;
  return m;
}

// One thing for a shelf, sitting on y = 0 and centred on x = 0. Returns it
// and how much shelf it takes.
function shelfThing(kind, r, mats, i) {
  const g = new THREE.Group();
  if (kind === 'jar') {
    const radius = 0.045 + r() * 0.022, height = 0.14 + r() * 0.12;
    g.add(jar(mats, { label: JAR_LABELS[i % JAR_LABELS.length], fill: FILLS[i % FILLS.length], height, radius, x: 0, z: 0, face: 0 }, 40 + i, 0));
    return { g, width: radius * 2 + 0.025 };
  }
  if (kind === 'bottle') {
    const b = makeCurio({ type: 'vial', liquid: LIQUIDS[i % LIQUIDS.length], ribbon: '#e9dcc0', name: `bottle ${i}` });
    b.scale.setScalar(2 + r() * 0.6);
    g.add(b);
    return { g, width: 0.085 };
  }
  if (kind === 'candle') {
    const c = makeCurio({ type: 'candle', colour: ['#efe6d2', '#cbb5e8', '#f2c860'][i % 3], name: `candle ${i}` });
    c.scale.setScalar(1.9);
    g.add(c);
    return { g, width: 0.07 };
  }
  if (kind === 'crystal') {
    const c = makeCurio({ type: 'cluster', colour: ['#9a68d6', '#f4b6cb', '#eef4fa'][i % 3], name: `crystal ${i}` });
    c.scale.setScalar(2);
    g.add(c);
    return { g, width: 0.13 };
  }
  if (kind === 'mortar') {
    const stone = new THREE.MeshStandardMaterial({ color: '#cfc8bb', roughness: 0.8 });
    const prof = [[0, 0], [0.05, 0], [0.062, 0.02], [0.064, 0.05], [0.058, 0.06], [0.05, 0.03], [0.0, 0.022]];
    g.add(new THREE.Mesh(new THREE.LatheGeometry(prof.map(([a, b]) => new THREE.Vector2(a, b)), 32), stone));
    const pestle = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.018, 0.13, 16), stone);
    pestle.position.set(0.02, 0.08, 0); pestle.rotation.z = -0.6;
    g.add(pestle);
    return { g, width: 0.15 };
  }
  // a row of old books, standing
  let x = 0;
  const n = 3 + Math.floor(r() * 4);
  for (let b = 0; b < n; b++) {
    const t = 0.028 + r() * 0.022, h = 0.17 + r() * 0.07;
    const book = new THREE.Mesh(new THREE.BoxGeometry(t, h, 0.15), new THREE.MeshStandardMaterial({ color: BOOKS[Math.floor(r() * BOOKS.length)], roughness: 0.75 }));
    book.position.set(x + t / 2, h / 2, -0.01);
    book.rotation.z = b === n - 1 && r() < 0.5 ? -0.18 : 0; // the last one leaning
    g.add(book);
    x += t + 0.002;
  }
  g.children.forEach((c) => { c.position.x -= x / 2; });
  return { g, width: x + 0.03 };
}

// Builds the wall round the bins. `bins` is the bin cabinet's size
// ({ width, depth, base, top }); `half` the wall's half-width; `top` where
// the cornice is; `fill` how far out from the middle the shelves get
// filled (past it they're out of shot).
export function apothecaryWall(scene, mats, bins, { half = 3.75, top = 2.98, fill = 2.7 } = {}) {
  const r = seeded(19);
  const k = new Kit(23);
  const labels = [], things = [];
  const wood = mats.wall;
  const B = bins.width / 2, base = bins.base, D = 0.36;
  const COL = 0.42; // the small-drawer column either side of the bins

  // the counter everything stands on, overhanging a little
  k.beam(V(-half, base - 0.018, -D / 2 + 0.03), V(half, base - 0.018, -D / 2 + 0.03), 0.036, D + 0.1, wood, V(0, 1, 0));
  k.beam(V(-half, (base - 0.036) / 2, -0.04), V(half, (base - 0.036) / 2, -0.04), base - 0.036, 0.04, wood, V(0, 1, 0));

  // small drawers beside the bins, and across above them up to the cornice
  for (const s of [-1, 1]) {
    const [x0, x1] = s < 0 ? [-B - COL, -B] : [B, B + COL];
    drawerBlock(k, labels, mats, { x0, x1, y0: base, y1: bins.top, cols: 2, rows: 6 });
  }
  drawerBlock(k, labels, mats, { x0: -B - COL, x1: B + COL, y0: bins.top, y1: top, cols: 9, rows: 3 });

  // open shelving out to the walls: uprights, shelves, a back
  const shelves = [1.3, 1.66, 2.02, 2.38, 2.74];
  for (const s of [-1, 1]) {
    const xa = B + COL, xb = half;
    const bays = Math.max(1, Math.round((xb - xa) / 0.8));
    const bay = (xb - xa) / bays;
    k.beam(V(s * (xa + xb) / 2, base, -D + 0.006), V(s * (xa + xb) / 2, top, -D + 0.006), xb - xa, 0.012, wood, V(1, 0, 0));
    for (let i = 0; i <= bays; i++) {
      const x = s * (xa + i * bay);
      k.beam(V(x, base, -D / 2), V(x, top, -D / 2), D, 0.026, wood, V(0, 0, 1));
    }
    for (let b = 0; b < bays; b++) {
      const bx0 = xa + b * bay + 0.013, bx1 = xa + (b + 1) * bay - 0.013;
      for (const y of shelves) k.beam(V(s * bx0, y - 0.011, -D / 2), V(s * bx1, y - 0.011, -D / 2), D, 0.022, wood, V(0, 0, 1));
      if (Math.min(bx0, bx1) > fill) continue;
      // fill each shelf (and the counter) left to right with whatever fits
      for (const y of [base, ...shelves]) {
        if (y >= top - 0.2) continue;
        let x = bx0 + 0.02;
        for (let n = 0; n < 8; n++) {
          const kinds = ['jar', 'jar', 'bottle', 'books', 'candle', 'crystal', 'jar', 'mortar', 'bottle'];
          const kind = kinds[Math.floor(r() * kinds.length)];
          const { g, width } = shelfThing(kind, r, mats, labels.length + Math.floor(r() * 50));
          if (x + width > bx1 - 0.01) break;
          g.position.set(s * (x + width / 2), y, -D / 2 + 0.01 + (r() - 0.5) * 0.04);
          g.rotation.y = kind === 'jar' || kind === 'books' ? 0 : (r() - 0.5) * 1.2;
          g.traverse((o) => { if (o.isMesh) { o.castShadow = !o.material.transparent; o.receiveShadow = true; } });
          things.push(g);
          x += width + 0.01 + r() * 0.03;
        }
      }
    }
  }

  // a cornice along the top
  k.beam(V(-half, top + 0.02, 0.0 - (D + 0.04) / 2 + 0.02), V(half, top + 0.02, 0.0 - (D + 0.04) / 2 + 0.02), 0.04, D + 0.04, wood, V(0, 1, 0));
  k.beam(V(-half, top + 0.055, 0.035 - (D + 0.07) / 2), V(half, top + 0.055, 0.035 - (D + 0.07) / 2), 0.03, D + 0.07, wood, V(0, 1, 0));

  const wall = k.build('apothecary_wall');
  wall.add(labelMesh(labels), ...things);
  scene.add(wall);
  return wall;
}
