// A floor-to-ceiling wall of open shelving, after a potter's studio: columns
// of different widths, each with its shelves at its own heights, so the grid
// never quite lines up. The wide cells hold ceramics (vases, bowls, stacks of
// plates, cylinders, bottles and cups) in cream, bone, sand and terracotta.
// The narrow columns are exactly one bin wide; here and there in them a cell
// is exactly one bin high and holds one of the glass-lidded bins, so the bins
// are scattered through the wall rather than gathered in one cabinet.
//
// Every bin cell is a slot, as in the bin cabinet: an Object3D at the bottom
// front edge of the opening, facing out along +Z, which the bins (bins.js)
// are built into. The shelving's face is at z = 0, its back at -DEPTH.

import * as THREE from 'three';
import { Kit } from './cabinet.js';
import { BIN } from './bincabinet.js';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';

const V = (x, y, z) => new THREE.Vector3(x, y, z);
const TAU = Math.PI * 2;

function seeded(seed) {
  let s = seed >>> 0 || 1;
  return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296);
}

export const DEPTH = 0.42; // deep enough for the bins' trays
const T = 0.03;        // uprights
const BT = 0.022;      // shelf boards
const BASE = 0.08;     // the plinth board's top
const TOP = 3.32;      // the crown board's underside

// The columns' inner widths, left to right; 'B' is a bin column (exactly
// one bin wide). Each bin column lists its cells from the bottom: a number
// is a display cell that tall, 'B' a bin; the rest up to the top is open.
// Mostly bins: five bin columns, two of them side by side, with just a few
// narrow display columns of short shelves between.
const COLUMNS = [
  0.3, ['B', 'B', 0.26, 'B', 'B', 0.3], 0.34, ['B', 0.28, 'B', 'B', 'B'], ['B', 'B', 'B', 0.26, 'B'],
  0.3, ['B', 0.3, 'B', 'B', 0.26, 'B'], 0.34, ['B', 'B', 0.28, 'B', 'B'],
];
// the pattern repeats out to either side, three times over (about 20 m), so
// no screen, however wide, reaches the ends; the middle copy holds the bins
const LAYOUT = [...COLUMNS, ...COLUMNS, ...COLUMNS];
const FILL = 5.5; // past this far from the middle no screen sees, so no ceramics
const wide = (c) => typeof c === 'number';
const widthOf = (c) => (wide(c) ? c : BIN.W);

// ---- Ceramics, turned on the wheel (lathe profiles), matte or softly glazed

const CLAY = ['#efe7d8', '#e6dccb', '#d9c7a8', '#c4774d', '#b8835a', '#d8c3a0', '#a9a196', '#ece4d4', '#cf9a6e', '#8f857a'];
function clay(colour, r) {
  const glazed = r() < 0.35;
  return new THREE.MeshPhysicalMaterial({ color: colour, roughness: glazed ? 0.35 : 0.85, clearcoat: glazed ? 0.6 : 0, clearcoatRoughness: 0.3, side: THREE.DoubleSide });
}
// the profile drawn as a smooth curve through its points (centripetal, so it
// never bulges past them), finely divided, and turned in many segments, so
// the silhouettes read as thrown clay rather than facets
function lathe(pts, s, mat) {
  const curve = new THREE.CatmullRomCurve3(pts.map(([a, b]) => new THREE.Vector3(a * s, b * s, 0)), false, 'centripetal');
  const profile = curve.getPoints(64).map((p) => new THREE.Vector2(Math.max(0, p.x), p.y));
  return new THREE.Mesh(new THREE.LatheGeometry(profile, 72), mat);
}

const SHAPES = {
  vase: { h: 0.26, w: 0.17, pts: [[0, 0], [0.05, 0], [0.075, 0.06], [0.082, 0.12], [0.06, 0.18], [0.03, 0.22], [0.028, 0.25], [0.035, 0.26]] },
  bottle: { h: 0.39, w: 0.12, pts: [[0, 0], [0.045, 0], [0.056, 0.08], [0.05, 0.2], [0.02, 0.3], [0.017, 0.38], [0.023, 0.39]] },
  amphora: { h: 0.46, w: 0.15, pts: [[0, 0], [0.04, 0], [0.06, 0.05], [0.072, 0.15], [0.05, 0.3], [0.028, 0.42], [0.04, 0.46]] },
  jar: { h: 0.16, w: 0.15, pts: [[0, 0], [0.06, 0], [0.072, 0.05], [0.072, 0.12], [0.05, 0.15], [0.05, 0.16]] },
  bowl: { h: 0.075, w: 0.19, pts: [[0, 0], [0.04, 0], [0.075, 0.03], [0.092, 0.07], [0.09, 0.075], [0.07, 0.04], [0.0, 0.012]] },
  urn: { h: 0.3, w: 0.24, pts: [[0, 0], [0.07, 0], [0.11, 0.08], [0.12, 0.16], [0.09, 0.25], [0.06, 0.28], [0.065, 0.3]] },
};

// one piece (or a little group) for a cell; sits on y = 0, centred; fits
// within `maxH` high. Returns it and its width.
function ceramic(r, maxH) {
  const g = new THREE.Group();
  const pick = r();
  const colour = () => CLAY[Math.floor(r() * CLAY.length)];
  if (pick < 0.16) {
    // a stack of plates
    const n = 4 + Math.floor(r() * 6), rad = 0.08 + r() * 0.04, mat = clay(colour(), r);
    for (let i = 0; i < n && (i + 1) * 0.016 < maxH; i++) {
      const p = new THREE.Mesh(new THREE.CylinderGeometry(rad, rad * 0.8, 0.012, 64), mat);
      p.position.y = 0.006 + i * 0.016;
      g.add(p);
    }
    return { g, w: rad * 2 };
  }
  if (pick < 0.3) {
    // stacked cylinders, like turned blocks
    let y = 0;
    const rad = 0.06 + r() * 0.035, mat = clay(r() < 0.6 ? '#ece6da' : colour(), r);
    for (let i = 0; i < 3; i++) {
      const h = 0.08 + r() * 0.1;
      if (y + h > maxH) break;
      const c = new THREE.Mesh(new THREE.CylinderGeometry(rad * (1 - i * 0.08), rad * (1 - i * 0.08), h, 64), mat);
      c.position.y = y + h / 2;
      g.add(c);
      y += h + 0.004;
    }
    return { g, w: rad * 2 };
  }
  if (pick < 0.42) {
    // a few cups
    const n = 2 + Math.floor(r() * 2), mat = clay(colour(), r);
    for (let i = 0; i < n; i++) {
      const cup = new THREE.Mesh(new THREE.CylinderGeometry(0.032, 0.027, 0.07, 48), mat);
      cup.position.set(i * 0.075, 0.035, (r() - 0.5) * 0.04);
      g.add(cup);
    }
    g.children.forEach((c) => { c.position.x -= ((n - 1) * 0.075) / 2; });
    return { g, w: n * 0.075 };
  }
  const fits = Object.entries(SHAPES).filter(([, s]) => s.h * 0.85 < maxH);
  if (!fits.length) return { g, w: 0.05 };
  const [, shape] = fits[Math.floor(r() * fits.length)];
  const s = Math.min(1.25, (maxH - 0.02) / shape.h, 0.8 + r() * 0.45);
  const m = lathe(shape.pts, s, clay(colour(), r));
  g.add(m);
  // a bowl now and then holds a second, smaller one
  if (shape === SHAPES.bowl && r() < 0.4) {
    const inner = lathe(shape.pts, s * 0.7, clay(colour(), r));
    inner.position.y = 0.014 * s;
    g.add(inner);
  }
  return { g, w: shape.w * s };
}

// ---- Letter blocks: painted wooden alphabet cubes, spelling a sign on a shelf

const BLOCK_COLOURS = ['#e8743b', '#2a9fb8', '#8a6fd6', '#7aa630', '#e2557a', '#e3a93a'];
const blockMats = new Map();
// one material set per letter and colour: the letter painted on the front,
// plain paint on the other five sides
function blockMaterials(ch, colour) {
  const key = ch + colour;
  if (blockMats.has(key)) return blockMats.get(key);
  const c = document.createElement('canvas');
  c.width = c.height = 128;
  const g = c.getContext('2d');
  const draw = () => {
    g.fillStyle = colour; g.fillRect(0, 0, 128, 128);
    g.strokeStyle = 'rgba(255,250,240,0.45)'; g.lineWidth = 5; g.strokeRect(12, 12, 104, 104);
    g.fillStyle = '#fffaf0';
    g.font = '800 84px Archivo, "Arial Black", Helvetica, sans-serif';
    g.textAlign = 'center'; g.textBaseline = 'middle';
    g.fillText(ch, 64, 70);
  };
  draw();
  const map = new THREE.CanvasTexture(c);
  map.colorSpace = THREE.SRGBColorSpace;
  map.anisotropy = 4;
  // the letters' typeface may still be loading: paint them again once it's in
  document.fonts?.load('800 84px Archivo').then(() => { draw(); map.needsUpdate = true; }).catch(() => {});
  const paint = new THREE.MeshStandardMaterial({ color: colour, roughness: 0.55 });
  const mats = [paint, paint, paint, paint, new THREE.MeshStandardMaterial({ map, roughness: 0.55 }), paint];
  blockMats.set(key, mats);
  return mats;
}

// `rows` is a word or a list of words, top row first; they stand centred on
// the shelf at y between x0 and x1, the lower rows holding up the upper ones
function letterBlocks(rows, x0, x1, y, r) {
  rows = [].concat(rows);
  const n = Math.max(...rows.map((w) => w.length));
  const gap = 0.004, s = Math.min(0.085, (x1 - x0 - 0.05 - gap * (n - 1)) / n);
  const geo = new RoundedBoxGeometry(s, s, s, 3, s * 0.08);
  const out = [];
  let k = Math.floor(r() * BLOCK_COLOURS.length);
  [...rows].reverse().forEach((word, j) => {
    const width = word.length * s + (word.length - 1) * gap;
    [...word].forEach((ch, i) => {
      k++;
      if (ch === ' ') return;
      const b = new THREE.Mesh(geo, blockMaterials(ch, BLOCK_COLOURS[k % BLOCK_COLOURS.length]));
      b.position.set((x0 + x1) / 2 - width / 2 + s / 2 + i * (s + gap) + (r() - 0.5) * 0.004, y + s / 2 + j * s, -DEPTH / 2 + 0.06 + (r() - 0.5) * 0.01);
      b.rotation.y = (r() - 0.5) * 0.14; // set down by hand, not quite square
      out.push(b);
    });
  });
  return out;
}

// ---- The wall

// Builds the shelving with its ceramics; returns the bin slots (nearest the
// middle first), the group, and the wall's extent. `binAt(x, y)`, if given,
// says which bin cells keep their bin (by the middle of the cell's foot);
// the rest become open shelves.
// `sign(x, y)`, if given, can return a word (or words, one per row) for the
// open cell at the top of a bin column, spelled in letter blocks.
export function shelfWall(scene, mats, { back = '#e2cba6', seed = 7, bins = 16, binAt = null, sign = null } = {}) {
  const r = seeded(seed);
  const k = new Kit(31);
  const wood = mats.wall;
  const group = new THREE.Group();
  group.name = 'focus';

  const total = LAYOUT.reduce((sum, c) => sum + widthOf(c), 0) + T * (LAYOUT.length + 1);
  const half = total / 2;
  const things = [], slots = [], binCells = [];

  // plaster behind the shelves, warm and faintly mottled
  const c = document.createElement('canvas');
  c.width = c.height = 512;
  const ctx = c.getContext('2d');
  ctx.fillStyle = back; ctx.fillRect(0, 0, 512, 512);
  ctx.filter = 'blur(14px)';
  for (let i = 0; i < 70; i++) {
    const v = r() < 0.5 ? 255 : 120;
    ctx.fillStyle = `rgba(${v},${v - 6},${v - 16},0.05)`;
    ctx.beginPath(); ctx.ellipse(r() * 512, r() * 512, 30 + r() * 110, 20 + r() * 80, r() * Math.PI, 0, TAU); ctx.fill();
  }
  const plasterTex = new THREE.CanvasTexture(c);
  plasterTex.colorSpace = THREE.SRGBColorSpace;
  plasterTex.wrapS = plasterTex.wrapT = THREE.RepeatWrapping;
  plasterTex.repeat.set(4, 2);
  // it runs on past the shelving either side, for wide screens
  plasterTex.repeat.set(10, 2);
  const plaster = new THREE.Mesh(new THREE.PlaneGeometry(total + 12, TOP + 0.4), new THREE.MeshStandardMaterial({ map: plasterTex, roughness: 0.95 }));
  plaster.position.set(0, (TOP + 0.4) / 2, -DEPTH - 0.005);
  plaster.receiveShadow = true;
  group.add(plaster);

  // uprights, plinth and crown
  let x = -half;
  const edges = [x];
  for (const col of LAYOUT) { x += T + widthOf(col); edges.push(x); }
  for (const e of edges) k.beam(V(e + T / 2, 0, -DEPTH / 2), V(e + T / 2, TOP + BT, -DEPTH / 2), DEPTH, T, wood, V(0, 0, 1));
  k.beam(V(-half, BASE / 2, -0.02), V(half + T, BASE / 2, -0.02), BASE, 0.04, wood, V(0, 1, 0));
  k.beam(V(-half, TOP + BT / 2, -DEPTH / 2), V(half + T, TOP + BT / 2, -DEPTH / 2), DEPTH, BT, wood, V(0, 0, 1));
  k.beam(V(-half - 0.01, TOP + BT + 0.03, 0.01 - (DEPTH + 0.02) / 2), V(half + T + 0.01, TOP + BT + 0.03, 0.01 - (DEPTH + 0.02) / 2), 0.06, DEPTH + 0.02, wood, V(0, 1, 0));

  const board = (x0, x1, y) => k.beam(V(x0, y - BT / 2, -DEPTH / 2), V(x1, y - BT / 2, -DEPTH / 2), DEPTH, BT, wood, V(0, 0, 1));
  const display = (x0, x1, y0, y1) => {
    // fill a cell with ceramics, left to right, leaving some air
    if (Math.min(Math.abs(x0), Math.abs(x1)) > FILL) return;
    let at = x0 + 0.03 + r() * 0.04;
    for (let n = 0; n < 5; n++) {
      const { g, w } = ceramic(r, y1 - y0 - 0.03);
      if (!g.children.length || at + w > x1 - 0.03) break;
      g.position.set(at + w / 2, y0, -DEPTH / 2 + (r() - 0.5) * 0.06);
      g.rotation.y = r() * TAU;
      things.push(g);
      at += w + 0.03 + r() * 0.08;
      if (r() < 0.3) break; // some cells hold just one or two pieces
    }
  };

  LAYOUT.forEach((col, i) => {
    const x0 = edges[i] + T, x1 = edges[i + 1];
    board(x0, x1, BASE);
    if (wide(col)) {
      // shelves at this column's own heights
      let y = BASE;
      for (;;) {
        const h = [0.24, 0.27, 0.3, 0.34, 0.38][Math.floor(r() * 5)];
        const top = Math.min(y + BT + h, TOP);
        display(x0, x1, y, top - BT);
        if (top >= TOP) break;
        board(x0, x1, top);
        y = top;
      }
      return;
    }
    // a bin column: bin cells exactly one bin high, display cells between
    let y = BASE;
    for (const cell of col) {
      const h = cell === 'B' ? BIN.H : cell;
      if (y + h + BT > TOP) break;
      if (cell === 'B') binCells.push({ x0, x1, y, h });
      else display(x0, x1, y, y + h);
      y += h;
      board(x0, x1, y + BT);
      y += BT;
    }
    if (TOP - y > 0.12) {
      // over a column of portfolio bins, a sign of letter blocks instead of pots
      const words = sign?.((x0 + x1) / 2, y);
      if (words) things.push(...letterBlocks(words, x0, x1, y, r));
      else display(x0, x1, y, TOP);
    }
  });

  // the bin cells nearest the middle take the bins (they're the ones in
  // view); any left over hold ceramics like the rest. `col` places each bin
  // left to right, for its sound.
  binCells.sort((a, b) => Math.hypot((a.x0 + a.x1) / 2, a.y - 1.4) - Math.hypot((b.x0 + b.x1) / 2, b.y - 1.4));
  binCells.forEach((cell, i) => {
    // (and none past where any screen can see)
    const cx = (cell.x0 + cell.x1) / 2;
    if (i >= bins || Math.abs(cx) > FILL || (binAt && !binAt(cx, cell.y))) { display(cell.x0, cell.x1, cell.y, cell.y + cell.h); return; }
    const s = new THREE.Object3D();
    s.position.set((cell.x0 + cell.x1) / 2, cell.y, 0);
    s.userData.col = THREE.MathUtils.clamp((s.position.x / half + 1) * 3, 0, 6);
    slots.push(s);
    group.add(s);
  });

  const built = k.build('shelving');
  built.traverse((o) => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; } });
  group.add(built, ...things);
  things.forEach((t) => t.traverse((o) => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; } }));

  scene.add(group);
  return { slots, focus: group, half, top: TOP };
}
