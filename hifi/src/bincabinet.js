// The bin cabinet (v2), after a general-store bin chest: a dark walnut carcass of
// thirty bins, six across and five high, built into the middle of an
// apothecary wall (apothecaryWall.js), standing on its counter. It has seen
// some weather: the walnut is faded in places and grimy in others,
// moss has taken hold in a few clumps on the outside (over a top corner,
// down one side, along the bottom rail), the brass has gone green, and a few
// bins sit a little ajar or with a sagging lid. The glass is clear.
//
// Each bin is a tray that pulls straight out like a drawer. Its front is a
// thin strip with a brass knob, and its sides are cheeks that rise from the
// strip in a quarter circle to full height, like a bread bin. Above the
// strip, a big glazed lid hangs from a hinge along the top of the opening;
// as the tray comes out the lid swings up and out over it. Inside, the
// curios rest on a bed of velvet, moss or straw.
//
// Every opening is a slot: an Object3D at the bottom front edge of the
// opening, facing out along +Z. The tray slides along the slot's +Z; the lid
// hangs in the slot itself, not on the tray.

import * as THREE from 'three';
import { Kit, jar } from './cabinet.js?v=20261028032544';
import { makeMaterials, weather, mossMaterial, brushedBrass, whiteMarble, woodFinish, painted, knottyPine } from './materials.js?v=20261028032544';

const V = (x, y, z) => new THREE.Vector3(x, y, z);
const TILE = 0.45;

export const BINGRID = { cols: 6, rows: 5 };
export const BIN = {
  W: 0.5, H: 0.42,      // the opening
  depth: 0.36,          // the tray, front to back
  front: 0.075,         // the front strip's height; the glass takes the rest
  knobY: 0.037,
  knobR: 0.013,
  bed: 0.05,            // the height of the bed's dome
  out: 0.26,            // how far a tray pulls out when open (m)
  lid: 1.4,             // and how far its lid swings up (radians from hanging)
};

const G = 0.022;      // rails and dividers
const DEPTH = 0.38;
const LEG = 0.95; // it stands on the wall's counter, this high
const CW = BINGRID.cols * BIN.W + (BINGRID.cols + 1) * G;
const TOP = LEG + BINGRID.rows * BIN.H + (BINGRID.rows + 1) * G;
const CROWN = TOP + 0.034; // the top of the top board

function seeded(seed) {
  let s = seed >>> 0 || 1;
  return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296);
}

// a side cheek: straight up behind the strip, then a quarter circle rising
// to full height, then level to the back
function cheek(x, t) {
  const { depth, front, H } = BIN;
  const z0 = -0.021, top = H - 0.012, r = top - front;
  const s = new THREE.Shape();
  s.moveTo(z0, 0.003);
  s.lineTo(z0, front);
  s.absarc(z0 - r, front, r, 0, Math.PI / 2, false);
  s.lineTo(-depth, top);
  s.lineTo(-depth, 0.003);
  s.closePath();
  const g = new THREE.ExtrudeGeometry(s, { depth: t, bevelEnabled: false, curveSegments: 24 });
  const uv = g.attributes.uv;
  for (let i = 0; i < uv.count; i++) uv.setXY(i, uv.getX(i) / TILE, uv.getY(i) / TILE);
  g.rotateY(-Math.PI / 2).translate(x + t / 2, 0, 0);
  return g;
}

// One bin, in its slot's space. Returns the tray group, its lid group (to
// hang in the slot), and the height of the bed's surface at (x, z) in the
// tray, for setting things on it.
export function makeBinBody(mats, seed, bedMat, { flat = false } = {}) {
  const k = new Kit(seed);
  const { W, H, depth, front } = BIN;
  const w = W - 0.006, st = 0.012, top = H - 0.012;

  k.beam(V(-w / 2, 0.003 + (front - 0.003) / 2, -0.008), V(w / 2, 0.003 + (front - 0.003) / 2, -0.008), front - 0.003, 0.02, mats.pine, V(0, 1, 0));
  for (const s of [-1, 1]) k.add(cheek(s * (w / 2 - st / 2), st), mats.pine, k.pieceTone());
  k.beam(V(0, 0.009, -0.018), V(0, 0.009, -depth + st), w - 2 * st, 0.012, mats.pine, V(1, 0, 0));
  k.beam(V(-(w / 2 - st), (0.003 + top) / 2, -depth + st / 2), V(w / 2 - st, (0.003 + top) / 2, -depth + st / 2), top - 0.003, st, mats.pine, V(0, 1, 0));
  k.knob(V(0, BIN.knobY, 0.002), mats.knob ?? mats.brass, BIN.knobR);
  const bin = k.build('bin');

  // the bed, a low dome filling the tray
  const ax = w / 2 - 0.016, az = (depth - 0.04) / 2, cz = -0.018 - (depth - 0.018) / 2, y0 = 0.012;
  // (with no bed material, the tray is left bare)
  // or, `flat`, a level pad of cloth, for things that should lie flat
  const pad = 0.008;
  if (bedMat && flat) {
    const bed = new THREE.Mesh(new THREE.BoxGeometry(ax * 2, pad, az * 2), bedMat);
    bed.position.set(0, y0 + pad / 2, cz);
    bed.receiveShadow = true;
    bin.add(bed);
  } else if (bedMat) {
    const bed = new THREE.Mesh(new THREE.SphereGeometry(1, 40, 12, 0, Math.PI * 2, 0, Math.PI / 2), bedMat);
    bed.scale.set(ax, BIN.bed, az);
    bed.position.set(0, y0, cz);
    bed.receiveShadow = true;
    bin.add(bed);
  }
  const bedSurface = flat ? () => y0 + pad : (x, z) => y0 + BIN.bed * Math.sqrt(Math.max(0, 1 - (x / ax) ** 2 - ((z - cz) / az) ** 2));

  // the glazed lid, hanging from its hinge along the top of the opening;
  // slim rails, so the glass is as big as it can be
  const lk = new Kit(seed + 3);
  const lidH = H - front - 0.005, rail = 0.016;
  for (const s of [-1, 1]) {
    lk.beam(V(s * (w / 2 - rail / 2), -lidH, 0), V(s * (w / 2 - rail / 2), 0, 0), rail, 0.018, mats.pine, V(1, 0, 0));
    const y = s < 0 ? -lidH + rail / 2 : -rail / 2;
    lk.beam(V(-w / 2 + rail, y, 0), V(w / 2 - rail, y, 0), rail, 0.018, mats.pine, V(0, 1, 0));
  }
  for (const s of [-1, 1]) lk.dowel(V(s * (w / 2 - 0.06), -0.002, 0.011), V(s * (w / 2 - 0.03), -0.002, 0.011), 0.0035, mats.brass, 12);
  const lid = lk.build('lid');
  const pw = w - 2 * rail + 0.006, ph = lidH - 2 * rail + 0.006;
  const pane = new THREE.Mesh(new THREE.BoxGeometry(pw, ph, 0.003), mats.glass);
  pane.position.set(0, -lidH / 2, -0.002);
  lid.add(pane);
  lid.position.set(0, H - 0.002, -0.008);
  return { bin, lid, bedSurface };
}

function carcass(mats) {
  const k = new Kit(5);
  const half = CW / 2;


  // sides, back, the rails between rows and dividers between columns
  for (const s of [-1, 1]) k.beam(V(s * (half - G / 2), LEG, -DEPTH / 2), V(s * (half - G / 2), TOP, -DEPTH / 2), DEPTH, G, mats.pine, V(0, 0, 1));
  k.beam(V(0, LEG + G, -DEPTH + 0.006), V(0, TOP - G, -DEPTH + 0.006), CW - 2 * G, 0.012, mats.pine, V(1, 0, 0));
  for (let i = 0; i <= BINGRID.rows; i++) {
    const y = LEG + i * (BIN.H + G) + G / 2;
    k.beam(V(-half + G, y, -DEPTH / 2), V(half - G, y, -DEPTH / 2), DEPTH, G, mats.pine, V(0, 0, 1));
  }
  for (let i = 0; i < BINGRID.rows; i++) {
    const y0 = LEG + G + i * (BIN.H + G);
    for (let j = 1; j < BINGRID.cols; j++) {
      const x = -half + j * (BIN.W + G) + G / 2;
      k.beam(V(x, y0, -DEPTH / 2 - 0.006), V(x, y0 + BIN.H, -DEPTH / 2 - 0.006), DEPTH - 0.012, G, mats.pine, V(0, 0, 1));
    }
  }

  // a top board with a small overhang over a thin moulding
  k.beam(V(-half - 0.008, TOP + 0.006, 0.008 - (DEPTH + 0.008) / 2), V(half + 0.008, TOP + 0.006, 0.008 - (DEPTH + 0.008) / 2), 0.012, DEPTH + 0.008, mats.pine, V(0, 1, 0));
  k.beam(V(-half - 0.02, TOP + 0.023, 0.02 - (DEPTH + 0.025) / 2), V(half + 0.02, TOP + 0.023, 0.02 - (DEPTH + 0.025) / 2), 0.022, DEPTH + 0.025, mats.pine, V(0, 1, 0));
  return k.build('carcass');
}

// Where the moss has taken hold: a few colonies on the outside, in cabinet
// space. The wood's moss (weather() in materials.js) and the cushions below
// grow in the same places.
const HALF = CW / 2;
export const COLONIES = [
  { centre: [-HALF + 0.02, CROWN - 0.02, 0.0], radius: 0.27 },   // over the top left corner and down
  { centre: [HALF, 0.44, -0.05], radius: 0.24 },                 // up the right side
  { centre: [0.32, CROWN, -0.28], radius: 0.2 },                 // the back of the top
  { centre: [-0.18, LEG + 0.012, 0.0], radius: 0.15 },           // along the bottom rail
];
const OUTSIDE = { half: HALF - 0.004, top: TOP + 0.005, front: -0.03 };

// Cushions of moss: lumpy, flattened balls merged into one mesh, gathered
// in the colonies and set on whichever outside face is nearest: the top,
// the top's front edge, an outer side, or the front of a rail or divider.
function mossTufts() {
  const r = seeded(77);
  const geos = [];
  const tuft = (x, y, z, size, [fx, fy, fz]) => {
    const g = new THREE.IcosahedronGeometry(1, 2);
    const pos = g.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      const k = 0.78 + r() * 0.4;
      pos.setXYZ(i, pos.getX(i) * k, pos.getY(i) * k, pos.getZ(i) * k);
    }
    g.computeVertexNormals();
    g.scale(size * fx, size * fy, size * fz).translate(x, y, z);
    geos.push(g);
  };
  const rails = Array.from({ length: BINGRID.rows + 1 }, (_, i) => LEG + i * (BIN.H + G) + G / 2);
  const posts = Array.from({ length: BINGRID.cols + 1 }, (_, j) => -HALF + j * (BIN.W + G) + G / 2);
  const nearest = (v, list) => list.reduce((a, b) => (Math.abs(b - v) < Math.abs(a - v) ? b : a));

  for (const { centre: [cx, cy, cz], radius } of COLONIES) {
    const n = Math.round(radius * 150);
    for (let i = 0; i < n; i++) {
      // denser toward the middle of the colony
      const d = radius * Math.pow(r(), 1.6), a = r() * Math.PI * 2, b = Math.acos(2 * r() - 1);
      const x = cx + d * Math.sin(b) * Math.cos(a), y = cy + d * Math.cos(b), z = cz + d * Math.sin(b) * Math.sin(a);
      const big = 1 - d / radius;
      if (y > CROWN - 0.025 && Math.abs(x) < HALF + 0.015 && z < 0.015 && z > -DEPTH) {
        tuft(x, CROWN, z, 0.008 + 0.022 * big * (0.6 + r() * 0.4), [1, 0.5, 1]);           // on top
      } else if (y > TOP && z > -0.08) {
        tuft(THREE.MathUtils.clamp(x, -HALF - 0.01, HALF + 0.01), THREE.MathUtils.clamp(y, TOP + 0.012, CROWN - 0.004), 0.022, 0.006 + 0.012 * big, [1, 1.1, 0.55]); // over the front edge
      } else if (Math.abs(x) > HALF - 0.06 && y > LEG && y < CROWN) {
        tuft(Math.sign(x) * (HALF + 0.001), y, THREE.MathUtils.clamp(z, -DEPTH + 0.02, -0.004), 0.006 + 0.016 * big, [0.5, 1, 1]); // an outer side
      } else if (z > -0.08 && y > LEG && y < TOP) {
        // the front of the nearest rail or divider, kept small so the
        // bins slide past
        const ry = nearest(y, rails), px = nearest(x, posts);
        const onRail = Math.abs(ry - y) < Math.abs(px - x);
        tuft(onRail ? x : px, onRail ? ry : y, 0.002, 0.004 + 0.005 * big, [1, onRail ? 0.7 : 1, 0.5]);
      }
    }
  }
  const all = geos.map((g) => g.toNonIndexed());
  const count = all.reduce((sum, g) => sum + g.attributes.position.count, 0);
  const pos = new Float32Array(count * 3), nor = new Float32Array(count * 3), uv = new Float32Array(count * 2);
  let o = 0;
  for (const g of all) {
    pos.set(g.attributes.position.array, o * 3); nor.set(g.attributes.normal.array, o * 3); uv.set(g.attributes.uv.array, o * 2);
    o += g.attributes.position.count;
  }
  const merged = new THREE.BufferGeometry();
  merged.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  merged.setAttribute('normal', new THREE.BufferAttribute(nor, 3));
  merged.setAttribute('uv', new THREE.BufferAttribute(uv, 2));
  const mesh = new THREE.Mesh(merged, mossMaterial());
  mesh.name = 'moss';
  mesh.castShadow = mesh.receiveShadow = true;
  return mesh;
}

// The finishes the whole wall can take: what its wood (or metal) is, the
// colour of its hardware (hinges, card frames, knobs), and the knobs' own
// material if they differ. 'walnut' is the weathered original; the rest are
// clean, every bin sitting square.
const C = (r, g, b) => new THREE.Color(r, g, b);
export const FINISHES = {
  walnut: { name: 'Weathered walnut' },
  brass: { name: 'Brushed brass, marble knobs', body: () => brushedBrass(), hardware: '#d8b36a', knob: () => whiteMarble() },
  // pale, creamy and close-grained, the grain pressed flat (the newsstand's maple)
  maple: { name: 'Maple', body: () => woodFinish(C(1.32, 1.24, 1.08), { rough: 0.55, normal: 0.3 }), hardware: '#c9a35a' },
  // pale knotty pine, the knots dark and the grain swerving round them
  knotty: { name: 'Knotty pine', body: () => knottyPine(), hardware: '#c9a35a' },
  oak: { name: 'Light oak', body: () => woodFinish(C(1.05, 0.8, 0.55), { rough: 0.62 }), hardware: '#c9a35a' },
  ebony: { name: 'Ebony', body: () => woodFinish(C(0.17, 0.14, 0.13), { rough: 0.42, normal: 0.55 }), hardware: '#d9b25e' },
  sage: { name: 'Sage green paint', body: () => painted('#8b9c7c'), hardware: '#c9a35a' },
  mahogany: { name: 'Mahogany', body: () => woodFinish(C(0.56, 0.22, 0.14), { rough: 0.4 }), hardware: '#d9b25e' },
  limed: { name: 'Limed pine', body: () => woodFinish(C(1.22, 1.3, 1.42), { rough: 0.8, normal: 0.45 }), hardware: '#9c9c9a' },
  copper: { name: 'Brushed copper, walnut knobs', body: () => brushedBrass('#c9774e'), hardware: '#b86a44', knob: (walnut) => walnut.clone() },
  navy: { name: 'Navy lacquer', body: () => painted('#23314a', { rough: 0.3 }), hardware: '#d9b25e' },
  cream: { name: 'Cream paint', body: () => painted('#ece3cf'), hardware: '#b8955a' },
};

// Builds the bin cabinet. Returns its slots (top left first, along each
// row), the group to frame, the camera's aim point and the materials.
//   finish: one of FINISHES ('walnut' if unknown)
//   moss: false leaves the moss out (built into a wall, it doesn't grow)
// The materials for a finish: `pine` for the bins' trays and lids, `carcass`
// for what frames them, `brass` (hardware), `knob`, and clear `glass`.
// Also used by the shelving wall (shelfWall.js).
export function finishMats(finish = 'walnut', { moss = true } = {}) {
  const mats = makeMaterials();
  // dark walnut: the scanned grain pulled down to a deep, warm brown, a
  // little glossier, the grain pressed in a touch harder
  mats.pine.color.setRGB(0.36, 0.22, 0.14);
  mats.pine.roughness = 0.62;
  mats.pine.normalScale.setScalar(0.6);
  const walnut = mats.pine;

  const f = FINISHES[finish]?.body ? FINISHES[finish] : null;
  const pristine = !!f;
  let binBody;
  if (f) {
    // one clean finish for carcass, bins and wall; hardware to match
    mats.pine = f.body();
    binBody = mats.pine;
    mats.brass.color.set(f.hardware);
    if (f.knob) mats.knob = f.knob(walnut);
    if (finish === 'brass') mats.blackSteel = whiteMarble(); // the legs, in marble to match the knobs
  } else {
    // the hardware, tarnished green
    mats.brass.color.set('#9a7a40');
    weather(mats.brass, { fade: 0, grime: 0.5, moss: 0.9, mossLo: '#3f7564', mossHi: '#7fb3a0' });
    // the bins get the same wear as the carcass but no moss: it only grows outside
    binBody = walnut.clone();
    weather(walnut, { fade: 0.22, grime: moss ? 0.4 : 0.25, moss: moss ? 1 : 0, colonies: COLONIES, outside: OUTSIDE });
    weather(binBody, { fade: 0.22, grime: moss ? 0.4 : 0.25, moss: 0 });
  }
  // clear, clean glass: barely there, with just a faint glint of
  // reflection, so you see straight in and what's inside isn't washed out.
  // Plain transparency rather than transmission, which would draw the whole
  // meadow a second time every frame.
  mats.glass = new THREE.MeshPhysicalMaterial({
    color: '#ffffff', transparent: true, opacity: 0.02, roughness: 0.02, metalness: 0,
    specularIntensity: 0.3, envMapIntensity: 0.25, clearcoat: 0.3, clearcoatRoughness: 0.02, depthWrite: false,
  });
  return { ...mats, carcass: mats.pine, pine: binBody, wall: binBody, pristine };
}

export function buildBinCabinet(scene, jars = [], { finish = 'walnut', moss = true } = {}) {
  const all = finishMats(finish, { moss });
  const pristine = all.pristine, binBody = all.pine;
  const mats = { ...all, pine: all.carcass };

  const cabinet = new THREE.Group();
  cabinet.name = 'focus';
  cabinet.add(carcass(mats));
  if (!pristine && moss) cabinet.add(mossTufts());
  jars.forEach((j, i) => cabinet.add(jar(mats, j, i, CROWN)));

  const slots = [];
  for (let r = 0; r < BINGRID.rows; r++) {
    for (let c = 0; c < BINGRID.cols; c++) {
      const s = new THREE.Object3D();
      s.name = `slot_bin_${slots.length + 1}`;
      s.position.set(-CW / 2 + G + c * (BIN.W + G) + BIN.W / 2, LEG + G + (BINGRID.rows - 1 - r) * (BIN.H + G), 0);
      s.userData.col = c;
      cabinet.add(s);
      slots.push(s);
    }
  }
  scene.add(cabinet);
  const shotFocus = (x, y) => cabinet.localToWorld(V(x, y, 0));
  return { slots, focus: cabinet, shotFocus, mats: { ...mats, pine: binBody, carcass: mats.pine, wall: binBody, pristine }, cols: BINGRID.cols, size: { width: CW, depth: DEPTH, base: LEG, top: CROWN } };
}
