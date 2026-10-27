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
import { signPieces, plaqueFace, castPlaque, platePlaque, stylePlaque, PLAQUE_KINDS } from './signs.js';
import { woodSheet, brushedBrass } from './materials.js';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { PLANT_MODELS, placePlant } from './plantModels.js';

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
const TOP = 2.33;      // the crown board's underside: level with the tops of the name drawers

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

// ---- Green plants in clay pots, among the ceramics: a snake plant's
// upright blades, a pilea's round leaves on fine stems, a fern's arching
// fronds, or a pothos trailing over the shelf's front edge

const GREENS = ['#3f6b35', '#4f7a3c', '#5f8f4e', '#6e9a48', '#2f5a2e'];
const leafMats = GREENS.map((c) => new THREE.MeshStandardMaterial({ color: c, roughness: 0.6, side: THREE.DoubleSide }));
const stemMat = new THREE.MeshStandardMaterial({ color: '#6b7f3a', roughness: 0.7 });
const soilMat = new THREE.MeshStandardMaterial({ color: '#3b2a1e', roughness: 1 });
const leafGeo = new THREE.SphereGeometry(1, 12, 8);              // scaled flat into a leaf
const bladeGeo = new THREE.ConeGeometry(1, 1, 6, 1).translate(0, 0.5, 0);

function plant(r, maxH) {
  const g = new THREE.Group();
  const leaf = () => leafMats[Math.floor(r() * leafMats.length)];
  // most plants are real models (plantModels.js); the rest drawn here
  const useModel = r() < 0.75, model = PLANT_MODELS[Math.floor(r() * PLANT_MODELS.length)];
  if (useModel && model.potted) {
    // it comes in its own pot: just give it the room
    const w = 0.16 + r() * 0.06;
    placePlant(g, model.id, { width: w * 1.6, height: Math.min(maxH - 0.02, 0.44), pick: r() });
    return { g, w };
  }
  // the pot: a small turned jar with soil in the top
  const ps = 0.75 + r() * 0.3, potH = SHAPES.jar.h * ps, potR = 0.072 * ps;
  g.add(lathe(SHAPES.jar.pts, ps, clay(CLAY[Math.floor(r() * CLAY.length)], r)));
  const soil = new THREE.Mesh(new THREE.CylinderGeometry(potR * 0.68, potR * 0.68, 0.004, 32), soilMat);
  soil.position.y = potH - 0.012;
  g.add(soil);
  const top = potH - 0.01, room = Math.max(0.06, maxH - top - 0.02);
  if (useModel) {
    // a model plant set into the clay pot, its leaves spreading past the rim
    placePlant(g, model.id, { width: Math.max(potR * 5.6, 0.36), height: Math.min(room, 0.4), y: top - 0.004, pick: r() });
    // and often a second, smaller plant tucked in beside it, so the pot overflows
    if (r() < 0.5) {
      const extra = new THREE.Group();
      extra.position.set((r() < 0.5 ? -1 : 1) * potR * 0.6, 0, potR * 0.3);
      placePlant(extra, PLANT_MODELS[Math.floor(r() * 3)].id, { width: 0.2, height: Math.min(room * 0.7, 0.22), y: top - 0.004, pick: r() });
      g.add(extra);
    }
    return { g, w: Math.max(potR * 3.2, 0.2) };
  }
  // drawn plants: mostly pothos trailing over the edge, now and then a pilea
  const kind = r() < 0.65 ? 0.9 : 0.4;
  if (kind < 0.28) {
    // snake plant: stiff upright blades, a little splayed
    const n = 8 + Math.floor(r() * 5);
    for (let i = 0; i < n; i++) {
      const b = new THREE.Mesh(bladeGeo, leaf());
      const h = Math.min(room, 0.34) * (0.5 + r() * 0.5);
      b.scale.set(0.018 + r() * 0.01, h, 0.004);
      b.position.set((r() - 0.5) * potR, top, (r() - 0.5) * potR);
      b.rotation.set((r() - 0.5) * 0.5, r() * Math.PI, (r() - 0.5) * 0.5);
      g.add(b);
    }
  } else if (kind < 0.55) {
    // pilea: round leaves held out on fine stems
    const n = 16 + Math.floor(r() * 8), reach = Math.min(room * 0.8, 0.2);
    for (let i = 0; i < n; i++) {
      const a = r() * TAU, tilt = 0.2 + r() * 0.9, len = reach * (0.5 + r() * 0.5);
      const end = V(Math.sin(tilt) * Math.cos(a) * len, top + Math.cos(tilt) * len, Math.sin(tilt) * Math.sin(a) * len);
      const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.0012, 0.0016, len, 5), stemMat);
      stem.position.set(end.x / 2, (top + end.y) / 2, end.z / 2);
      stem.lookAt(end.x, end.y, end.z); stem.rotateX(Math.PI / 2);
      g.add(stem);
      const l = new THREE.Mesh(leafGeo, leaf());
      const rad = 0.026 + r() * 0.018;
      l.scale.set(rad, 0.002, rad);
      l.position.copy(end);
      l.rotation.set((r() - 0.5) * 1.2, r() * TAU, (r() - 0.5) * 1.2);
      g.add(l);
    }
  } else if (kind < 0.8) {
    // fern: fronds arching up and out, leaflets along each
    const n = 11 + Math.floor(r() * 5), reach = Math.min(room * 0.9, 0.26);
    for (let i = 0; i < n; i++) {
      const a = r() * TAU, len = reach * (0.6 + r() * 0.4), lift = 0.5 + r() * 0.5;
      for (let k = 1; k <= 9; k++) {
        const u = k / 9, out = Math.sin(u * 1.4) * len * 0.75, up = (Math.sin(u * Math.PI * 0.85) * lift) * len * 0.8;
        const l = new THREE.Mesh(leafGeo, leaf());
        const sz = 0.022 * (1 - u * 0.55);
        l.scale.set(sz * 1.6, 0.0015, sz * 0.55);
        l.position.set(Math.cos(a) * out, top + up, Math.sin(a) * out);
        l.rotation.set(0, -a + Math.PI / 2, (u - 0.4) * 0.8);
        g.add(l);
      }
    }
  } else {
    // pothos: a few leaves on top, vines spilling forward over the shelf edge
    for (let i = 0; i < 12; i++) {
      const l = new THREE.Mesh(leafGeo, leaf());
      l.scale.set(0.032, 0.002, 0.025);
      l.position.set((r() - 0.5) * potR * 1.6, top + 0.01 + r() * 0.03, (r() - 0.5) * potR * 1.6);
      l.rotation.set((r() - 0.5) * 0.8, r() * TAU, (r() - 0.5) * 0.8);
      g.add(l);
    }
    const vines = 2 + Math.floor(r() * 2);
    for (let v = 0; v < vines; v++) {
      const side = (r() - 0.5) * 0.12, drop = 0.12 + r() * 0.16;
      const curve = new THREE.CatmullRomCurve3([V(side * 0.3, top, potR * 0.5), V(side * 0.7, top + 0.01, DEPTH * 0.35), V(side, -0.01, DEPTH * 0.55), V(side * 1.2, -drop, DEPTH * 0.6)]);
      g.add(new THREE.Mesh(new THREE.TubeGeometry(curve, 24, 0.0013, 4), stemMat));
      for (let k = 2; k <= 12; k++) {
        const p = curve.getPoint(k / 12);
        const l = new THREE.Mesh(leafGeo, leaf());
        const sz = 0.024 * (1 - k / 30);
        l.scale.set(sz, 0.0018, sz * 0.8);
        l.position.copy(p);
        l.rotation.set(1.1 + (r() - 0.5) * 0.6, r() * TAU, (r() - 0.5) * 0.6);
        g.add(l);
      }
    }
    g.userData.facing = true; // keep the vines towards the front
  }
  return { g, w: Math.max(potR * 2, 0.1) };
}

// one piece (or a little group) for a cell; sits on y = 0, centred; fits
// within `maxH` high; more than half are green plants. Returns it and its width.
function ceramic(r, maxH) {
  if (maxH > 0.2 && r() < 0.55) return plant(r, maxH);
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

// ---- The wall

// Builds the shelving with its ceramics; returns the bin slots (nearest the
// middle first), the group, and the wall's extent. `binAt(x, y)`, if given,
// says which bin cells keep their bin (by the middle of the cell's foot);
// the rest become open shelves.
// `sign(x, y)`, if given, can return a word (or words, one per row) for the
// open cell at the top of a bin column, spelled out in `signStyle` (signs.js).
export function shelfWall(scene, mats, { back = '#e2cba6', backWood = false, seed = 7, bins = 16, binAt = null, sign = null, signStyle = 'blocks', signFit = null, plaqueKind = 'concrete', grain = 'knotty' } = {}) {
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
  // or (`backWood`) panelled in the shelving's own wood, a shade darker, so
  // its knots and grain show across the back of every cell
  let backMat = new THREE.MeshStandardMaterial({ map: plasterTex, roughness: 0.95 });
  if (backWood && mats.wall.map) {
    // its own sheet (2.7 m square, a different seed) so the pattern doesn't
    // visibly repeat cell to cell or match the boards in front
    const map = woodSheet(grain, { seed: 23, size: 2048, metres: 2.7 });
    map.repeat.set((total + 12) / 2.7, (TOP + 0.4) / 2.7);
    backMat = new THREE.MeshStandardMaterial({ map, color: '#efd6c4', roughness: 0.8, normalMap: mats.wall.normalMap, normalScale: new THREE.Vector2(0.2, 0.2) });
  }
  const plaster = new THREE.Mesh(new THREE.PlaneGeometry(total + 12, TOP + 0.4), backMat);
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
      g.rotation.y = g.userData.facing ? (r() - 0.5) * 0.6 : r() * TAU;
      things.push(g);
      at += w + 0.03 + r() * 0.08;
      if (r() < 0.2) break; // some cells hold just one or two pieces
    }
  };

  // a slim drawer filling a cell DH high: a plain wooden front flush with
  // the shelving, no knob, and a brass plaque nearly its full width with the
  // words engraved large enough to read across the room
  // The name drawers: both the same height, hung from the crown so their
  // tops, plaques and lights line up (the columns under them end a little
  // apart; any gap below is a thicker shelf). On each, a plaque of five
  // glazed porcelain tiles, gilded and painted with flowers (signs.js
  // plaqueFace), set in a brushed brass frame and lit by a brass picture
  // light. Every plaque sets its words at the size that fits `signFit`, the
  // longest, so they all match.
  const DRAWER_H = 0.175;
  // brushed brass, brighter than the knobs' so it catches the light
  const brushed = brushedBrass('#e2bf72');
  brushed.vertexColors = false;
  brushed.metalness = 0.85; brushed.envMapIntensity = 4.5;
  const RoundBox = (w, h, d, rad) => new RoundedBoxGeometry(w, h, d, 3, rad);
  const slimDrawer = (words, x0, x1, y, DH) => {
    const g = 0.004, w = x1 - x0, cx = (x0 + x1) / 2;
    const gap = Math.max(0, DH - DRAWER_H), bottom = TOP - Math.min(DH, DRAWER_H);
    if (gap > 0.001) k.beam(V(x0, y + gap / 2, -DEPTH / 2), V(x1, y + gap / 2, -DEPTH / 2), DEPTH, gap, wood, V(0, 0, 1));
    k.beam(V(x0 + g, (bottom + TOP) / 2, -0.012), V(x1 - g, (bottom + TOP) / 2, -0.012), TOP - bottom - 2 * g, 0.022, wood, V(0, 1, 0));

    const text = [].concat(words).join(' ');
    if (plaqueKind === 'cast') {
      // a cast brass name plate, screwed to the middle of the drawer front
      const plate = castPlaque(text, w - 0.05, 0.11, signFit ?? text);
      plate.position.set(cx, (bottom + TOP) / 2, 0.006);
      things.push(plate);
      return;
    }
    if (PLAQUE_KINDS.includes(plaqueKind)) {
      // a plaque in stone, concrete or dark wood (signs.js stylePlaque)
      const plate = stylePlaque(plaqueKind, text.toLowerCase(), w - 0.05, 0.13, (signFit ?? text).toLowerCase());
      plate.position.set(cx, (bottom + TOP) / 2, 0.006);
      things.push(plate);
      return;
    }
    if (plaqueKind !== 'tiles') {
      // a plate of aged brass, the words lowercase in cream, standing a few
      // millimetres off the drawer front so it throws a thin shadow
      const fit = (signFit ?? text).toLowerCase();
      const plate = platePlaque(text.toLowerCase(), w - 0.05, 0.12, fit);
      plate.position.set(cx, (bottom + TOP) / 2, 0.006);
      things.push(plate);
      return;
    }
    const pw = w - 0.05, ph = 0.1, py = bottom + 0.018 + ph / 2, rim = 0.009;
    const frame = new THREE.Mesh(RoundBox(pw + 2 * rim, ph + 2 * rim, 0.006, 0.002), brushed);
    frame.position.set(cx, py, 0.003);
    things.push(frame);
    // the tiles, each showing its fifth of the painting, thin gaps between
    const art = plaqueFace(text, pw / ph, signFit ?? text);
    const N = 5, seam = 0.0016, tw = (pw - seam * (N - 1)) / N;
    const tileGeo = RoundBox(tw, ph, 0.006, 0.0018);
    const glazeEdge = new THREE.MeshPhysicalMaterial({ color: '#e6c77d', roughness: 0.3, metalness: 0.3, clearcoat: 1, clearcoatRoughness: 0.08 });
    for (let i = 0; i < N; i++) {
      const map = art.clone();
      map.repeat.set(1 / N, 1); map.offset.set(i / N, 0);
      const glaze = new THREE.MeshPhysicalMaterial({ map, roughness: 0.32, metalness: 0.25, clearcoat: 1, clearcoatRoughness: 0.06 });
      const t = new THREE.Mesh(tileGeo, [glazeEdge, glazeEdge, glazeEdge, glazeEdge, glaze, glazeEdge]);
      t.position.set(cx - pw / 2 + tw / 2 + i * (tw + seam), py, 0.0075);
      things.push(t);
    }
    // the picture light: a brushed brass tube over the plaque on two short
    // arms, glowing warm along its underside
    const lightY = py + ph / 2 + rim + 0.017, tubeL = pw * 0.94;
    const tube = new THREE.Mesh(new THREE.CylinderGeometry(0.011, 0.011, tubeL, 32).rotateZ(Math.PI / 2), brushed);
    tube.position.set(cx, lightY, 0.03);
    const glow = new THREE.Mesh(new THREE.PlaneGeometry(tubeL * 0.96, 0.006).rotateX(Math.PI / 2), new THREE.MeshBasicMaterial({ color: '#fff1c8' }));
    glow.position.set(cx, lightY - 0.0112, 0.03);
    things.push(tube, glow);
    for (const sx of [-0.3, 0.3]) {
      const arm = new THREE.Mesh(new THREE.CylinderGeometry(0.0028, 0.0028, 0.03, 12).rotateX(Math.PI / 2), brushed);
      arm.position.set(cx + sx * pw, lightY, 0.015);
      things.push(arm);
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
    const words = TOP - y > 0.12 && sign?.((x0 + x1) / 2, y);
    if (words && signStyle === 'plaque') {
      // over a column of portfolio bins, the wall's top row: a slim drawer
      // with a brass plaque naming the column
      const DH = TOP - y; // the two columns end a little apart; their drawers both run up to the crown
      slimDrawer(words, x0, x1, y, DH);
    } else if (words) {
      // or a sign (signs.js) standing on the shelf instead of pots
      things.push(...signPieces(signStyle, words, x0, x1, y, r, -DEPTH / 2 + 0.06, wood));
    } else if (TOP - y > 0.12) display(x0, x1, y, TOP);
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
