// The apothecary cabinet, built in code: an elm carcass of twenty small
// drawers, four across and five high, over a two-door cupboard on a plinth
// and bun feet, with a stepped cornice and three glass jars on top. Each
// drawer has a brass card frame for its label and a brass knob, and holds a
// stack of specimen cards. Every drawer opening is a slot (an Object3D at
// the centre of the opening, on the face of the cabinet, facing out), and
// a drawer slides out along the slot's +Z.

import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { makeMaterials, herbFill } from './materials.js?v=20261028032817';
import { paintJarLabel } from './paint.js?v=20261028032817';

const V = (x, y, z) => new THREE.Vector3(x, y, z);
const TILE = { u: 0.45, v: 0.45 }; // metres covered by one tile of the scanned veneer

// Collects geometry per material and merges it, so a whole carcass or
// drawer draws as a handful of meshes. Each piece gets UVs at real size,
// its own grain offset, and a slight tone of its own, as real boards do.
// (The same kit as the Corner newsstand's stands.)
export class Kit {
  constructor(seed = 1) { this.parts = new Map(); this.seed = seed; }

  rand() { this.seed = (this.seed * 9301 + 49297) % 233280; return this.seed / 233280; }

  add(geo, mat, tone = 1) {
    const n = geo.attributes.position.count, c = new Float32Array(n * 3);
    const warm = 1 + (tone - 1) * 0.6; // darker pieces are a touch warmer
    for (let i = 0; i < n; i++) c.set([tone * warm, tone, tone / warm], i * 3);
    geo.setAttribute('color', new THREE.BufferAttribute(c, 3));
    if (!this.parts.has(mat)) this.parts.set(mat, []);
    this.parts.get(mat).push(geo);
  }

  pieceTone() { return 0.86 + this.rand() * 0.2; }

  // a squared board from a to b with eased edges; `across` sets which way
  // its width runs. UVs are box-projected in the piece's own space, so the
  // grain runs down its length.
  beam(a, b, width, depth, mat, across = V(1, 0, 0), tone = this.pieceTone()) {
    const L = b.clone().sub(a);
    const len = L.length();
    L.normalize();
    const W = across.clone().sub(L.clone().multiplyScalar(across.dot(L))).normalize();
    const D = W.clone().cross(L);
    const ease = Math.min(0.0018, Math.min(width, depth, len) * 0.2);
    const g = new RoundedBoxGeometry(width, len, depth, 2, ease);
    const pos = g.attributes.position, nor = g.attributes.normal, uv = g.attributes.uv;
    const du = this.rand(), dv = this.rand();
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i), y = pos.getY(i), z = pos.getZ(i);
      const ax = Math.abs(nor.getX(i)), ay = Math.abs(nor.getY(i)), az = Math.abs(nor.getZ(i));
      const [u, v] = ax >= ay && ax >= az ? [z, y] : ay >= az ? [x, z] : [x, y];
      uv.setXY(i, u / TILE.u + du, v / TILE.v + dv);
    }
    g.applyMatrix4(new THREE.Matrix4().makeBasis(W, L, D).setPosition(a.clone().add(b).multiplyScalar(0.5)));
    this.add(g, mat, tone);
  }

  // a round rod from a to b
  dowel(a, b, r, mat, segments = 20) {
    const L = b.clone().sub(a), len = L.length();
    const g = new THREE.CylinderGeometry(r, r, len, segments, 1);
    g.applyQuaternion(new THREE.Quaternion().setFromUnitVectors(V(0, 1, 0), L.normalize()));
    g.translate(...a.clone().add(b).multiplyScalar(0.5).toArray());
    this.add(g, mat);
  }

  // a domed screw head on a face, pointing along `normal`
  screw(p, normal, mat, r = 0.0024) {
    const g = new THREE.SphereGeometry(r, 12, 6, 0, Math.PI * 2, 0, Math.PI / 2).scale(1, 0.5, 1);
    g.applyQuaternion(new THREE.Quaternion().setFromUnitVectors(V(0, 1, 0), normal));
    g.translate(p.x, p.y, p.z);
    this.add(g, mat);
  }

  // a brass knob: a round rose on the face, a short neck and a ball
  knob(p, mat, r = 0.0095) {
    const rose = new THREE.CylinderGeometry(r * 1.15, r * 1.25, 0.0025, 24).rotateX(Math.PI / 2).translate(p.x, p.y, p.z + 0.00125);
    const neck = new THREE.CylinderGeometry(r * 0.42, r * 0.55, r * 0.9, 16).rotateX(Math.PI / 2).translate(p.x, p.y, p.z + 0.0025 + r * 0.45);
    const ball = new THREE.SphereGeometry(r, 24, 14).scale(1, 1, 0.85).translate(p.x, p.y, p.z + 0.0025 + r * 0.9 + r * 0.8);
    this.add(rose, mat); this.add(neck, mat); this.add(ball, mat);
  }

  build(name) {
    const g = new THREE.Group();
    g.name = name;
    for (const [mat, geos] of this.parts) {
      const m = new THREE.Mesh(mergeGeometries(geos.map((x) => (x.index ? x.toNonIndexed() : x))), mat);
      m.castShadow = !mat.transmission; m.receiveShadow = true;
      g.add(m);
    }
    return g;
  }
}

// ---- Sizes (metres)

export const GRID = { cols: 4, rows: 5 };
export const DRAWER = {
  W: 0.19, H: 0.115,   // the opening
  depth: 0.3,
  front: 0.018,        // front board thickness; it stands 2 mm proud of the face
  label: { w: 0.078, h: 0.036, bar: 0.0045, y: 0.017 },
  knobY: -0.03,
};
// a specimen card, 14 cm × 9.1 cm (the canvas's 1080 × 704 proportions)
export const CARD = { W: 0.14, H: 0.14 * 704 / 1080, T: 0.0009, lean: 0.14 };

const G = 0.016;        // rails and dividers between the drawers
const DEPTH = 0.36;     // carcass, front to back
const CW = GRID.cols * DRAWER.W + (GRID.cols + 1) * G;
const BH = GRID.rows * DRAWER.H + (GRID.rows + 1) * G;
const Y = { feet: 0.05, plinth: 0.12, cupboard: 0.6, bank: 0.63 };
Y.top = Y.bank + BH;
Y.cornice = Y.top + 0.04;

// ---- One drawer: its front, box, label frame and knob, in its own space
// (origin at the centre of the opening, on the face, +Z out of the cabinet)

export function makeDrawerBody(mats, seed) {
  const k = new Kit(seed);
  const { W, H, depth, front, label: lb } = DRAWER;
  const fw = W - 0.004, fh = H - 0.004;
  k.beam(V(-fw / 2, 0, 0.002 - front / 2), V(fw / 2, 0, 0.002 - front / 2), fh, front, mats.elm, V(0, 1, 0));

  // the box: sides, bottom and back in plain wood
  const iw = W - 0.014, st = 0.007, sh = H - 0.03, yb = -H / 2 + 0.004, yc = yb + sh / 2, z0 = 0.002 - front;
  for (const s of [-1, 1]) k.beam(V(s * (iw / 2 - st / 2), yc, z0), V(s * (iw / 2 - st / 2), yc, -depth), sh, st, mats.deal, V(0, 1, 0));
  k.beam(V(0, yb + 0.003, z0), V(0, yb + 0.003, -depth + st), iw - 2 * st, 0.006, mats.deal, V(1, 0, 0));
  k.beam(V(-(iw / 2 - st), yc, -depth + st / 2), V(iw / 2 - st, yc, -depth + st / 2), sh, st, mats.deal, V(0, 1, 0));

  // the brass card frame, screwed on at each end, and the knob below it
  const zf = 0.002 + 0.001, { w, h, bar, y } = lb;
  for (const s of [-1, 1]) {
    k.beam(V(-w / 2, y + s * (h / 2 - bar / 2), zf), V(w / 2, y + s * (h / 2 - bar / 2), zf), bar, 0.002, mats.brass, V(0, 1, 0), 1);
    k.beam(V(s * (w / 2 - bar / 2), y - h / 2 + bar, zf), V(s * (w / 2 - bar / 2), y + h / 2 - bar, zf), bar, 0.002, mats.brass, V(1, 0, 0), 1);
    k.screw(V(s * (w / 2 + 0.0045), y, 0.002), V(0, 0, 1), mats.brass);
  }
  k.knob(V(0, DRAWER.knobY, 0.002), mats.brass);

  const g = k.build('drawer');
  // where the front card stands: on the floor of the box near the front,
  // leaning back against the stack behind it
  g.userData.cardMount = new THREE.Vector3(0, yb + 0.006 + (CARD.H / 2) * Math.cos(CARD.lean), -0.045 - (CARD.H / 2) * Math.sin(CARD.lean));
  g.userData.cardRest = new THREE.Quaternion().setFromAxisAngle(V(1, 0, 0), -CARD.lean);
  // the rest of the stack, behind the front card
  const stack = new THREE.Mesh(new THREE.BoxGeometry(CARD.W, CARD.H * 0.97, 0.04), mats.stock);
  stack.quaternion.copy(g.userData.cardRest);
  stack.position.copy(g.userData.cardMount).add(V(0, -0.0015, -0.0215).applyQuaternion(g.userData.cardRest));
  stack.castShadow = stack.receiveShadow = true;
  g.add(stack);
  return g;
}

// ---- The carcass

function carcass(mats) {
  const k = new Kit(7);
  const half = CW / 2;

  // bun feet and the plinth
  for (const x of [-half + 0.03, half - 0.03]) for (const z of [-0.03, -DEPTH + 0.04]) {
    const foot = new THREE.SphereGeometry(0.034, 24, 12).scale(1, 0.75, 1).translate(x, 0.026, z);
    k.add(foot, mats.elm, 0.8);
  }
  const pd = DEPTH + 0.025;
  k.beam(V(-half - 0.015, (Y.feet + Y.plinth) / 2, 0.015 - pd / 2), V(half + 0.015, (Y.feet + Y.plinth) / 2, 0.015 - pd / 2), Y.plinth - Y.feet, pd, mats.elm, V(0, 1, 0));

  // sides and back, from the plinth to the top
  for (const s of [-1, 1]) k.beam(V(s * (half - G / 2), Y.plinth, -DEPTH / 2), V(s * (half - G / 2), Y.top, -DEPTH / 2), DEPTH, G, mats.elm, V(0, 0, 1));
  k.beam(V(0, Y.plinth, -DEPTH + 0.006), V(0, Y.top, -DEPTH + 0.006), CW - 2 * G, 0.012, mats.elm, V(1, 0, 0));

  // the drawer bank: full-depth rails, and dividers between them, so the
  // faces never overlap
  for (let i = 0; i <= GRID.rows; i++) {
    const y = Y.bank + i * (DRAWER.H + G) + G / 2;
    k.beam(V(-half + G, y, -DEPTH / 2), V(half - G, y, -DEPTH / 2), DEPTH - 0.012, G, mats.elm, V(0, 0, 1));
  }
  for (let i = 0; i < GRID.rows; i++) {
    const y0 = Y.bank + G + i * (DRAWER.H + G);
    for (let j = 1; j < GRID.cols; j++) {
      const x = -half + j * (DRAWER.W + G) + G / 2;
      k.beam(V(x, y0, -DEPTH / 2), V(x, y0 + DRAWER.H, -DEPTH / 2), DEPTH - 0.012, G, mats.elm, V(0, 0, 1));
    }
  }

  // a proud moulding between the cupboard and the drawers
  k.beam(V(-half - 0.006, (Y.cupboard + Y.bank) / 2, -0.003), V(half + 0.006, (Y.cupboard + Y.bank) / 2, -0.003), Y.bank - Y.cupboard, 0.03, mats.elm, V(0, 1, 0));

  // two panelled doors with a knob each by the meeting edge
  const dw = (CW - 2 * G - 0.012) / 2, dh = Y.cupboard - Y.plinth - 0.006, dy = (Y.plinth + Y.cupboard) / 2;
  for (const s of [-1, 1]) {
    const cx = s * (dw / 2 + 0.003), stile = 0.055, rail = 0.065, z = -0.008;
    for (const e of [-1, 1]) {
      const x = cx + e * (dw / 2 - stile / 2);
      k.beam(V(x, dy - dh / 2, z), V(x, dy + dh / 2, z), stile, 0.02, mats.elm, V(1, 0, 0));
      const y = dy + e * (dh / 2 - rail / 2);
      k.beam(V(cx - dw / 2 + stile, y, z), V(cx + dw / 2 - stile, y, z), rail, 0.02, mats.elm, V(0, 1, 0));
    }
    // the sunk panel, with a raised field in its middle
    k.beam(V(cx, dy - dh / 2 + rail, -0.012), V(cx, dy + dh / 2 - rail, -0.012), dw - 2 * stile, 0.008, mats.elm, V(1, 0, 0));
    k.beam(V(cx, dy - dh / 2 + rail + 0.025, -0.006), V(cx, dy + dh / 2 - rail - 0.025, -0.006), dw - 2 * stile - 0.05, 0.008, mats.elm, V(1, 0, 0));
    k.knob(V(cx - s * (dw / 2 - 0.03), dy + 0.04, 0.002), mats.brass, 0.011);
  }

  // a stepped cornice
  k.beam(V(-half - 0.012, Y.top + 0.009, 0.012 - (DEPTH + 0.012) / 2), V(half + 0.012, Y.top + 0.009, 0.012 - (DEPTH + 0.012) / 2), 0.018, DEPTH + 0.012, mats.elm, V(0, 1, 0));
  k.beam(V(-half - 0.025, Y.top + 0.029, 0.025 - (DEPTH + 0.03) / 2), V(half + 0.025, Y.top + 0.029, 0.025 - (DEPTH + 0.03) / 2), 0.022, DEPTH + 0.03, mats.elm, V(0, 1, 0));

  return k.build('carcass');
}

// ---- Jars on top: blown glass, dried herbs inside, a cork and a paper label

export function jar(mats, { label, fill, height: h, radius: r, x, z, face = -0.45 }, i, y = Y.cornice) {
  const g = new THREE.Group();
  g.name = `jar_${i}`;
  const profile = [
    [0, 0], [r * 0.9, 0], [r, 0.008], [r, h * 0.78], [r * 0.86, h * 0.86], [r * 0.64, h * 0.9], [r * 0.64, h * 0.98], [r * 0.69, h],
  ].map(([a, b]) => new THREE.Vector2(a, b));
  const glass = new THREE.Mesh(new THREE.LatheGeometry(profile, 48), mats.glass);
  const herbs = new THREE.Mesh(new THREE.CylinderGeometry(r * 0.9, r * 0.9, h * 0.6, 40), herbFill(fill, 11 + i));
  herbs.position.y = 0.004 + h * 0.3;
  const cork = new THREE.Mesh(new THREE.CylinderGeometry(r * 0.62, r * 0.56, 0.034, 32), mats.cork);
  cork.position.y = h + 0.006;
  // the label faces the camera (`face`: its angle round the jar, 0 = straight out)
  const tex = new THREE.CanvasTexture(paintJarLabel(label, 31 + i));
  tex.colorSpace = THREE.SRGBColorSpace;
  const band = new THREE.Mesh(
    new THREE.CylinderGeometry(r + 0.0008, r + 0.0008, h * 0.26, 48, 1, true, face - 1.1, 2.2),
    new THREE.MeshStandardMaterial({ map: tex, roughness: 0.9 }),
  );
  band.position.y = h * 0.45;
  herbs.castShadow = cork.castShadow = band.castShadow = true;
  for (const m of [glass, herbs, cork, band]) m.receiveShadow = true;
  g.add(herbs, band, cork, glass);
  g.position.set(x, y, z);
  return g;
}

// Builds the cabinet. Returns its drawer slots (top-left first, along each
// row), the group the camera frames, a function giving the camera's aim
// point, and the materials (the drawers need them).
export function buildCabinet(scene, jars = []) {
  const mats = makeMaterials();
  const cabinet = new THREE.Group();
  cabinet.name = 'focus';
  cabinet.add(carcass(mats));
  jars.forEach((j, i) => cabinet.add(jar(mats, j, i)));

  const slots = [];
  for (let r = 0; r < GRID.rows; r++) {
    for (let c = 0; c < GRID.cols; c++) {
      const s = new THREE.Object3D();
      s.name = `slot_drawer_${String(slots.length + 1).padStart(2, '0')}`;
      s.position.set(-CW / 2 + G + c * (DRAWER.W + G) + DRAWER.W / 2, Y.top - G - r * (DRAWER.H + G) - DRAWER.H / 2, 0);
      s.userData.col = c;
      cabinet.add(s);
      slots.push(s);
    }
  }
  scene.add(cabinet);
  const shotFocus = (x, y) => cabinet.localToWorld(V(x, y, 0));
  return { slots, focus: cabinet, shotFocus, mats, cols: GRID.cols };
}
