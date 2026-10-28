// Stained glass doors across the front of the shelf wall: the way in from the
// password page. Three sliding leaves in the wall's own plywood (stiles, a top
// rail and a solid kick panel), each glazed with one of the illustration's
// three panels, and floral sidelights either side, under a head beam. The
// glass is real glass to the renderer: it lets the lit wall through, tinted
// by the picture and blurred by its hammered surface, and glows a little as
// light comes through it.
//
// The woodwork is made with the shelves' own Kit (cabinet.js): the same
// scanned plywood, each board at real size with the grain down its length,
// softened edges and a tone of its own, so the doors are the wall's wood.
//
// The leaves part when open() is called: the left and middle leaves slide
// left, the right one right, the sidelights with them, the head lifting away.
//
// assets/doors/glass.jpg is the whole glazed front as one picture (three
// panels between four sidelights, as made by tools/gate-doors in the
// portfolio); each pane takes its part of it. assets/doors/order.png gives
// each piece of glass its moment for the password page's loading.
import * as THREE from 'three';
import { Kit } from './cabinet.js?v=20261028020851';

// the picture's layout, in its own pixels at 1920 x 799 (the texture is 2x)
const PIC = { w: 1920, h: 799, top: 14, bottom: 785 };
const SIDE = 224;                          // one sidelight's width in the picture
const PANELS = [[448 + 17, 448 + 311], [448 + 359, 448 + 661], [448 + 708, 448 + 1019]];
const LIGHTS = [[12, 212], [SIDE + 12, SIDE + 212], [1472 + 12, 1472 + 212], [1696 + 12, 1696 + 212]];

const GLASS_H = 2.0;                        // the glass, floor to head, in metres
const STILE = 0.055, RAIL = 0.07, KICK = 0.24, DEPTH = 0.045;
const M = GLASS_H / (PIC.bottom - PIC.top); // metres per picture pixel

// hammered glass: a normal map of shallow dimples
function hammeredNormals(size = 512, cell = 22) {
  const c = document.createElement('canvas'); c.width = c.height = size;
  const g = c.getContext('2d'), img = g.createImageData(size, size), d = img.data;
  const n = Math.ceil(size / cell), pts = [];
  let s = 17;
  const rnd = () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296);
  for (let j = 0; j < n; j++) for (let i = 0; i < n; i++) pts.push([(i + rnd()) * cell, (j + rnd()) * cell]);
  const h = new Float32Array(size * size);
  for (let y = 0; y < size; y++) for (let x = 0; x < size; x++) {
    let f1 = 1e9;
    const bi = Math.floor(x / cell), bj = Math.floor(y / cell);
    for (let dj = -1; dj <= 1; dj++) for (let di = -1; di <= 1; di++) {
      const ii = (bi + di + n) % n, jj = (bj + dj + n) % n, [px, py] = pts[jj * n + ii];
      let dx = x - (px + (bi + di - ii) * cell), dy = y - (py + (bj + dj - jj) * cell);
      const dd = dx * dx + dy * dy; if (dd < f1) f1 = dd;
    }
    h[y * size + x] = Math.sqrt(f1) / cell;   // a dimple: low in the middle, rising to its rim
  }
  for (let y = 0; y < size; y++) for (let x = 0; x < size; x++) {
    const hx = h[y * size + (x + 1) % size] - h[y * size + (x - 1 + size) % size];
    const hy = h[((y + 1) % size) * size + x] - h[((y - 1 + size) % size) * size + x];
    let nx = -hx * 2.2, ny = -hy * 2.2, nz = 1; const l = Math.hypot(nx, ny, nz);
    const q = (y * size + x) * 4;
    d[q] = (nx / l * 0.5 + 0.5) * 255; d[q + 1] = (ny / l * 0.5 + 0.5) * 255; d[q + 2] = (nz / l * 0.5 + 0.5) * 255; d[q + 3] = 255;
  }
  g.putImageData(img, 0, 0);
  const t = new THREE.CanvasTexture(c);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  return t;
}

// a pane of glass showing columns [x0, x1) of the picture, GLASS_H tall
function pane(x0, x1, mat) {
  const w = (x1 - x0) * M;
  const geo = new THREE.PlaneGeometry(w, GLASS_H);
  const uv = geo.attributes.uv, u0 = x0 / PIC.w, u1 = x1 / PIC.w, v0 = 1 - PIC.bottom / PIC.h, v1 = 1 - PIC.top / PIC.h;
  for (let i = 0; i < uv.count; i++) uv.setXY(i, uv.getX(i) ? u1 : u0, uv.getY(i) ? v1 : v0);
  // the hammered surface repeats every 9 cm, whatever the pane's size
  const uv1 = geo.attributes.uv.clone();
  for (let i = 0; i < uv1.count; i++) uv1.setXY(i, (uv1.getX(i) - u0) / (u1 - u0) * w / 0.09, (uv1.getY(i) - v0) / (v1 - v0) * GLASS_H / 0.09);
  geo.setAttribute('uv1', uv1);
  const m = new THREE.Mesh(geo, mat);
  return { mesh: m, w };
}

const V = (x, y, z) => new THREE.Vector3(x, y, z);
let seed = 41;

// a plain box, for the brass
function box(w, h, d, mat) {
  const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat);
  m.castShadow = true; m.receiveShadow = true;
  return m;
}

// One framed leaf (or sidelight): stiles, a top rail, a kick panel below the
// glass; brass pull on one edge if `pull` is -1 or 1
function leaf(glass, wood, brass, pull) {
  const g = new THREE.Group(), w = glass.w + 2 * STILE;
  const glassY = KICK + GLASS_H / 2;
  glass.mesh.position.set(0, glassY, 0);
  g.add(glass.mesh);
  const H = KICK + GLASS_H + RAIL, k = new Kit(seed += 7), X = V(1, 0, 0), Y = V(0, 1, 0);
  // the door fronts face the sun square on, where most of the shelves' wood
  // is turned from it: a touch deeper in tone, so the two read as one honey
  const base = k.pieceTone.bind(k); k.pieceTone = () => base() * 0.9;
  const iw = w - 2 * STILE, ix = iw / 2;
  // two stiles full height, a top rail and a deep kick rail between them
  for (const sx of [-1, 1]) k.beam(V(sx * (w - STILE) / 2, 0, 0), V(sx * (w - STILE) / 2, H, 0), STILE, DEPTH, wood, X);
  k.beam(V(-ix, KICK + GLASS_H + RAIL / 2, 0), V(ix, KICK + GLASS_H + RAIL / 2, 0), RAIL, DEPTH, wood, Y);
  k.beam(V(-ix, KICK / 2, 0), V(ix, KICK / 2, 0), KICK, DEPTH, wood, Y);
  // a fine glazing bead round the glass
  const bz = DEPTH / 2 + 0.005, b = 0.012;
  k.beam(V(-ix, KICK + b / 2, bz), V(ix, KICK + b / 2, bz), b, 0.01, wood, Y);
  k.beam(V(-ix, KICK + GLASS_H - b / 2, bz), V(ix, KICK + GLASS_H - b / 2, bz), b, 0.01, wood, Y);
  for (const sx of [-1, 1]) k.beam(V(sx * (ix - b / 2), KICK, bz), V(sx * (ix - b / 2), KICK + GLASS_H, bz), b, 0.01, wood, X);
  // a raised panel moulding on the kick rail, as a door has
  const px = ix - 0.04, p0 = 0.04, p1 = KICK - 0.04, m = 0.014;
  k.beam(V(-px, p0 + m / 2, bz), V(px, p0 + m / 2, bz), m, 0.01, wood, Y);
  k.beam(V(-px, p1 - m / 2, bz), V(px, p1 - m / 2, bz), m, 0.01, wood, Y);
  for (const sx of [-1, 1]) k.beam(V(sx * (px - m / 2), p0, bz), V(sx * (px - m / 2), p1, bz), m, 0.01, wood, X);
  g.add(k.build('door-frame'));
  if (pull) {
    // a long brass bar pull on standoffs, near the edge the leaf is drawn by
    const px = pull * (w / 2 - STILE - 0.05), bar = new THREE.Mesh(new THREE.CylinderGeometry(0.011, 0.011, 0.42, 20), brass);
    bar.position.set(px, 1.05, DEPTH / 2 + 0.05); bar.castShadow = true; g.add(bar);
    for (const dy of [-0.17, 0.17]) {
      const st = new THREE.Mesh(new THREE.CylinderGeometry(0.007, 0.007, 0.05, 12), brass);
      st.rotation.x = Math.PI / 2; st.position.set(px, 1.05 + dy, DEPTH / 2 + 0.025); g.add(st);
    }
  }
  g.userData.w = w; g.userData.h = H;
  return g;
}

// mats: the scene's materials (mats.wall is the shelf wall's plywood)
export function glassDoors(scene, mats, { centre = -0.265, z = 0.36, loaded } = {}) {
  const loader = new THREE.TextureLoader();
  let pending = 2;
  const done = () => { if (--pending === 0) loaded?.(); };
  const map = loader.load('assets/doors/glass.jpg', done);
  map.colorSpace = THREE.SRGBColorSpace;
  map.anisotropy = 8;
  const order = loader.load('assets/doors/order.png', done);
  order.magFilter = order.minFilter = THREE.NearestFilter;
  order.generateMipmaps = false;
  const normal = hammeredNormals();
  normal.channel = 1;

  // stained glass: lit from behind, so the picture glows; the hammered
  // surface catches the window light in front. (Not transmissive: that would
  // render the whole room a second time each frame, and the doors must move
  // smoothly; the glow gives the light-through look.)
  const glassMat = new THREE.MeshPhysicalMaterial({
    map, color: new THREE.Color('#d9cbb4'), roughness: 0.3,
    normalMap: normal, normalScale: new THREE.Vector2(0.55, 0.55),
    emissive: new THREE.Color('#fff0d8'), emissiveMap: map, emissiveIntensity: 0.5,
    specularIntensity: 0.9, clearcoat: 0.45, clearcoatRoughness: 0.16,
  });
  const wood = mats.wall, brass = mats.brass ?? new THREE.MeshStandardMaterial({ color: '#c9a35a', metalness: 1, roughness: 0.4 });

  const root = new THREE.Group();
  root.name = 'glass-doors';
  const left = new THREE.Group(), right = new THREE.Group(), head = new THREE.Group();
  root.add(left, right, head);

  // the three leaves, side by side; the middle one on its own track, a
  // touch behind, so it can slide behind the left
  const leaves = PANELS.map(([x0, x1], i) => leaf(pane(x0, x1, glassMat), wood, brass, i === 0 ? 1 : i === 2 ? -1 : 0));
  const widths = leaves.map((l) => l.userData.w), total = widths.reduce((a, b) => a + b, 0);
  let x = centre - total / 2;
  leaves.forEach((l, i) => {
    l.position.set(x + widths[i] / 2, 0, z + (i === 1 ? -0.05 : 0));
    x += widths[i];
    (i === 2 ? right : left).add(l);
  });
  // sidelights: two each side, fixed panes framed the same way
  const lights = LIGHTS.map(([x0, x1]) => leaf(pane(x0, x1, glassMat), wood, brass, 0));
  let lx = centre - total / 2, rx = centre + total / 2;
  for (const i of [1, 0]) { const l = lights[i]; l.position.set(lx - l.userData.w / 2, 0, z); lx -= l.userData.w; left.add(l); }
  for (const i of [2, 3]) { const l = lights[i]; l.position.set(rx + l.userData.w / 2, 0, z); rx += l.userData.w; right.add(l); }
  // and a third pair of sidelights beyond, for very wide screens
  for (const [i, side] of [[0, -1], [3, 1]]) {
    const l = leaf(pane(LIGHTS[i][0], LIGHTS[i][1], glassMat), wood, brass, 0);
    if (side < 0) { l.position.set(lx - l.userData.w / 2, 0, z); left.add(l); lx -= l.userData.w; }
    else { l.position.set(rx + l.userData.w / 2, 0, z); right.add(l); rx += l.userData.w; }
  }
  // the head beam over it all, and a brass track along the floor
  const H = leaves[0].userData.h, beamW = rx - lx + 0.4;
  // (it casts no shadow: the sun comes in high, and would shade the whole front)
  const hk = new Kit(97), cx = (lx + rx) / 2;
  hk.beam(V(cx - beamW / 2, H + 0.25, z - 0.02), V(cx + beamW / 2, H + 0.25, z - 0.02), 0.5, 0.1, wood, V(0, 1, 0));
  const beam = hk.build('door-head'); beam.traverse((o) => { o.castShadow = false; }); head.add(beam);
  const track = box(beamW, 0.012, 0.09, brass); track.position.set(cx, 0.006, z - 0.02); track.castShadow = false; root.add(track);
  scene.add(root);

  // opening: by the clock, not by frames, so a slow frame never makes it
  // stutter or race; a long, soft ease in and out. The middle leaf slides
  // behind the left one first, then the two sides glide apart.
  let t0 = -1, dur = 3.4;
  const ease = (k) => 0.5 - 0.5 * Math.cos(Math.PI * k);           // sine in-out
  const middle = leaves[1], middleX = middle.position.x;
  return {
    root, map, order, glassMat,
    get opening() { return t0 >= 0; },
    open(seconds = 3.4) { dur = seconds; t0 = performance.now(); },
    // returns true once fully open (and gone from the scene)
    update() {
      if (t0 < 0) return false;
      const k = Math.min(1, (performance.now() - t0) / 1000 / dur);
      middle.position.x = middleX - ease(Math.min(1, k / 0.45)) * widths[1];
      const kk = ease(Math.max(0, (k - 0.15) / 0.85));
      left.position.x = -kk * 3.8;
      right.position.x = kk * 3.2;
      head.position.y = kk * 0.9;
      if (k >= 1) { scene.remove(root); return true; }
      return false;
    },
    dispose() { scene.remove(root); },
  };
}
