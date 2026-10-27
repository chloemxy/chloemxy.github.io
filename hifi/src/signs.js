// The signs on the shelves over the two portfolio columns (CLIENT, OPEN
// SOURCE), spelled out in one of several ways; pick one with ?sign=… :
//   blocks    painted wooden alphabet cubes (the default)
//   lego      toy bricks with the letters printed on, studs on top
//   tiles     cream letter tiles standing in a wooden rack
//   woodtype  tall printer's wood type, inked letters on end grain
//   cutout    freestanding 3D letters in glazed clay, like the pots around them
//   board     a hand-lettered board leaning against the back of the shelf
// Each builder gets the words (top row first), the cell's span x0..x1, the
// shelf's height y and the wall's seeded random, and returns meshes
// (or a group that fills in once its typeface has loaded).

import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { FontLoader } from 'three/addons/loaders/FontLoader.js';
import { TextGeometry } from 'three/addons/geometries/TextGeometry.js';

export const SIGN_STYLES = ['blocks', 'lego', 'tiles', 'woodtype', 'cutout', 'board'];

// ---- A painted face: a canvas texture with a letter (or words) on it,
// drawn again once its typeface has loaded

const faces = new Map();
function face(key, w, h, paint, fonts = []) {
  if (faces.has(key)) return faces.get(key);
  const c = document.createElement('canvas');
  c.width = w; c.height = h;
  const g = c.getContext('2d');
  paint(g, w, h);
  const map = new THREE.CanvasTexture(c);
  map.colorSpace = THREE.SRGBColorSpace;
  map.anisotropy = 4;
  if (fonts.length && document.fonts) {
    Promise.all(fonts.map((f) => document.fonts.load(f))).then(() => { paint(g, w, h); map.needsUpdate = true; }).catch(() => {});
  }
  faces.set(key, map);
  return map;
}
const letterFace = (key, ch, { bg, fg, font, border, sub, w = 128, h = 128, grain }) => face(key, w, h, (g) => {
  g.fillStyle = bg; g.fillRect(0, 0, w, h);
  if (grain) {
    // end grain: faint rings
    g.strokeStyle = grain; g.lineWidth = 1.5;
    for (let r = 10; r < w * 1.2; r += 7) { g.beginPath(); g.arc(w * 0.2, h * 1.1, r, 0, Math.PI * 2); g.stroke(); }
  }
  if (border) { g.strokeStyle = border; g.lineWidth = 5; g.strokeRect(12, 12, w - 24, h - 24); }
  g.fillStyle = fg; g.font = font; g.textAlign = 'center'; g.textBaseline = 'middle';
  g.fillText(ch, w / 2, h * 0.55);
  if (sub) { g.font = `600 ${Math.round(w * 0.2)}px Archivo, Helvetica, sans-serif`; g.textAlign = 'right'; g.fillText(sub, w * 0.88, h * 0.84); }
}, [font]);

// all six sides painted `side`, the front (+z) with the letter
const sixSides = (front, side) => [side, side, side, side, front, side];

// lay the words out: each letter a box s wide, the lower rows under the
// upper, centred in the cell; `place(ch, x, row, i)` makes each one
function layout(rows, x0, x1, { s, gap, rowH = s, place }) {
  const out = [];
  [...rows].reverse().forEach((word, j) => {
    const width = word.length * s + (word.length - 1) * gap;
    [...word].forEach((ch, i) => {
      if (ch === ' ') return;
      const m = place(ch, (x0 + x1) / 2 - width / 2 + s / 2 + i * (s + gap), j * rowH, i, j);
      if (m) out.push(m);
    });
  });
  return out;
}
const sizeFor = (rows, x0, x1, gap, max) => {
  const n = Math.max(...rows.map((w) => w.length));
  return Math.min(max, (x1 - x0 - 0.05 - gap * (n - 1)) / n);
};

// ---- blocks: painted wooden alphabet cubes

const BLOCK_COLOURS = ['#e8743b', '#2a9fb8', '#8a6fd6', '#7aa630', '#e2557a', '#e3a93a'];
function blocks(rows, x0, x1, y, r, z) {
  const gap = 0.004, s = sizeFor(rows, x0, x1, gap, 0.085);
  const geo = new RoundedBoxGeometry(s, s, s, 3, s * 0.08);
  let k = Math.floor(r() * BLOCK_COLOURS.length);
  return layout(rows, x0, x1, { s, gap, place: (ch, x, dy) => {
    const colour = BLOCK_COLOURS[k++ % BLOCK_COLOURS.length];
    const map = letterFace(ch + colour, ch, { bg: colour, fg: '#fffaf0', border: 'rgba(255,250,240,0.45)', font: '800 84px Archivo, "Arial Black", Helvetica, sans-serif' });
    const paint = new THREE.MeshStandardMaterial({ color: colour, roughness: 0.55 });
    const b = new THREE.Mesh(geo, sixSides(new THREE.MeshStandardMaterial({ map, roughness: 0.55 }), paint));
    b.position.set(x + (r() - 0.5) * 0.004, y + s / 2 + dy, z + (r() - 0.5) * 0.01);
    b.rotation.y = (r() - 0.5) * 0.14; // set down by hand, not quite square
    return b;
  } });
}

// ---- lego: glossy toy bricks, a letter printed on each, studs on top,
// the upper row stacked half a stud along, like brickwork

const BRICK_COLOURS = ['#c91a09', '#f2cd37', '#0055bf', '#237841', '#f4f4f4', '#fe8a18'];
function lego(rows, x0, x1, y, r, z) {
  const gap = 0, s = sizeFor(rows, x0, x1, gap, 0.085), h = s * 0.72;
  const body = new RoundedBoxGeometry(s - 0.001, h, s * 0.62, 2, 0.0025);
  const stud = new THREE.CylinderGeometry(s * 0.16, s * 0.16, s * 0.11, 24);
  let k = Math.floor(r() * BRICK_COLOURS.length);
  return layout(rows, x0, x1, { s, gap, rowH: h, place: (ch, x, dy) => {
    const colour = BRICK_COLOURS[k++ % BRICK_COLOURS.length];
    const light = colour === '#f4f4f4' || colour === '#f2cd37';
    const map = letterFace('L' + ch + colour, ch, { bg: colour, fg: light ? '#1b1b1b' : '#ffffff', font: '900 92px Archivo, "Arial Black", Helvetica, sans-serif', h: 92 });
    const plastic = new THREE.MeshPhysicalMaterial({ color: colour, roughness: 0.28, clearcoat: 0.5 });
    const g = new THREE.Group();
    g.add(new THREE.Mesh(body, sixSides(new THREE.MeshPhysicalMaterial({ map, roughness: 0.28, clearcoat: 0.5 }), plastic)));
    for (const sx of [-0.25, 0.25]) {
      const st = new THREE.Mesh(stud, plastic);
      st.position.set(sx * s, h / 2 + s * 0.055, 0);
      g.add(st);
    }
    g.position.set(x, y + h / 2 + dy, z);
    return g;
  } });
}

// ---- tiles: cream letter tiles with little scores, in a wooden rack

const SCORE = { A: 1, E: 1, I: 1, O: 1, U: 1, L: 1, N: 1, S: 1, T: 1, R: 1, D: 2, G: 2, B: 3, C: 3, M: 3, P: 3, F: 4, H: 4, V: 4, W: 4, Y: 4, K: 5, J: 8, X: 8, Q: 10, Z: 10 };
function tiles(rows, x0, x1, y, r, z, wood) {
  const gap = 0.003, s = sizeFor(rows, x0, x1, gap, 0.07), t = s * 0.22, lean = -0.22;
  const tile = new RoundedBoxGeometry(s, s, t, 2, 0.003);
  const ivory = new THREE.MeshStandardMaterial({ color: '#efe1bd', roughness: 0.45 });
  const out = [];
  const rackH = s * 0.32, rowH = s + rackH + 0.01;
  // one rack per row, the lower ones nearer the front
  rows.forEach((word, i) => {
    const j = rows.length - 1 - i, width = word.length * (s + gap) + 0.02;
    const rz = z + 0.06 - j * 0.0, ry = y + j * rowH;
    const rack = new THREE.Mesh(new THREE.BoxGeometry(width, rackH, s * 0.55), wood);
    rack.position.set((x0 + x1) / 2, ry + rackH / 2, rz);
    const lip = new THREE.Mesh(new THREE.BoxGeometry(width, rackH * 0.55, 0.006), wood);
    lip.position.set((x0 + x1) / 2, ry + rackH + rackH * 0.27, rz + s * 0.27);
    out.push(rack, lip);
  });
  out.push(...layout(rows, x0, x1, { s, gap, rowH, place: (ch, x, dy) => {
    const map = letterFace('T' + ch, ch, { bg: '#efe1bd', fg: '#2a2118', font: '700 80px Archivo, Helvetica, sans-serif', sub: String(SCORE[ch] ?? 1) });
    const m = new THREE.Mesh(tile, sixSides(new THREE.MeshStandardMaterial({ map, roughness: 0.45 }), ivory));
    m.position.set(x, y + dy + rackH * 0.6 + s / 2 * Math.cos(lean), z + 0.06 + s / 2 * Math.sin(-lean) * 0.4);
    m.rotation.x = lean;
    return m;
  } }));
  return out;
}

// ---- woodtype: tall printer's type, inked letters on pale end grain,
// the blocks' sides a dark worn maple

function woodtype(rows, x0, x1, y, r, z) {
  const gap = 0.002, s = sizeFor(rows, x0, x1, gap, 0.08), h = s * 1.25, d = s * 0.9;
  const geo = new RoundedBoxGeometry(s, h, d, 2, 0.002);
  const side = new THREE.MeshStandardMaterial({ color: '#8a5a33', roughness: 0.7 });
  return layout(rows, x0, x1, { s, gap, rowH: h, place: (ch, x, dy) => {
    const map = letterFace('W' + ch, ch, { bg: '#d9c19a', fg: '#1d1712', font: '400 120px "IM Fell English SC", "Libre Caslon Text", Georgia, serif', grain: 'rgba(120,80,40,0.18)', w: 128, h: 160 });
    const m = new THREE.Mesh(geo, sixSides(new THREE.MeshStandardMaterial({ map, roughness: 0.75 }), side));
    m.position.set(x, y + h / 2 + dy, z + (r() - 0.5) * 0.006);
    m.rotation.y = (r() - 0.5) * 0.05;
    return m;
  } });
}

// ---- cutout: freestanding 3D letters in glazed clay, the words side by
// side or stacked, each row on its own little plinth

let fontPromise = null;
const loadFont = () => (fontPromise ??= new FontLoader().loadAsync('https://cdn.jsdelivr.net/npm/three@0.169.0/examples/fonts/helvetiker_bold.typeface.json'));
const CLAYS = ['#c4774d', '#efe7d8', '#b8835a', '#8f9f84'];
function cutout(rows, x0, x1, y, r, z) {
  const g = new THREE.Group();
  const colour = CLAYS[Math.floor(r() * CLAYS.length)];
  const mat = new THREE.MeshPhysicalMaterial({ color: colour, roughness: 0.4, clearcoat: 0.5, clearcoatRoughness: 0.3 });
  loadFont().then((font) => {
    const n = Math.max(...rows.map((w) => w.length));
    const size = Math.min(0.1, (x1 - x0 - 0.06) / (n * 0.72)), lineH = size * 1.15;
    [...rows].reverse().forEach((word, j) => {
      const geo = new TextGeometry(word, { font, size, depth: size * 0.3, curveSegments: 6, bevelEnabled: true, bevelThickness: size * 0.03, bevelSize: size * 0.02, bevelSegments: 2 });
      geo.computeBoundingBox();
      const b = geo.boundingBox;
      geo.translate(-(b.max.x + b.min.x) / 2, -b.min.y, -(b.max.z + b.min.z) / 2);
      const m = new THREE.Mesh(geo, mat);
      m.position.set((x0 + x1) / 2, y + j * lineH, z + 0.02 - j * 0.05);
      m.rotation.y = (r() - 0.5) * 0.08;
      m.castShadow = m.receiveShadow = true;
      g.add(m);
    });
  }).catch(() => {});
  return [g];
}

// ---- board: a hand-lettered board leaning against the back of the shelf

function board(rows, x0, x1, y, r, z, wood) {
  const w = x1 - x0 - 0.06, h = Math.min(0.24, 0.1 + rows.length * 0.07), t = 0.014, tilt = 0.12;
  const map = face('B' + rows.join('|'), 512, Math.round(512 * h / w), (g, W, H) => {
    g.fillStyle = '#26302a'; g.fillRect(0, 0, W, H);                          // a painted green-black ground
    g.strokeStyle = 'rgba(232,220,190,0.5)'; g.lineWidth = 4; g.strokeRect(14, 14, W - 28, H - 28);
    g.fillStyle = '#efe4c8'; g.textAlign = 'center'; g.textBaseline = 'middle';
    const lineH = (H - 40) / rows.length;
    rows.forEach((word, i) => {
      let px = Math.min(lineH * 0.78, 140);
      g.font = `400 ${px}px "IM Fell English SC", "Libre Caslon Text", Georgia, serif`;
      while (g.measureText(word).width > W - 70 && px > 20) { px -= 4; g.font = `400 ${px}px "IM Fell English SC", "Libre Caslon Text", Georgia, serif`; }
      g.fillText(word, W / 2, 20 + lineH * (i + 0.55));
    });
  }, ['400 60px "IM Fell English SC"']);
  const sign = new THREE.Mesh(new RoundedBoxGeometry(w, h, t, 2, 0.004), sixSides(new THREE.MeshStandardMaterial({ map, roughness: 0.8 }), wood));
  sign.position.set((x0 + x1) / 2, y + (h / 2) * Math.cos(tilt), z - 0.08 + (h / 2) * -Math.sin(tilt));
  sign.rotation.x = -tilt;
  return [sign];
}

const BUILDERS = { blocks, lego, tiles, woodtype, cutout, board };

// z is the middle of the shelf's depth, measured from the wall's face
export function signPieces(style, words, x0, x1, y, r, z, wood) {
  const rows = [].concat(words);
  return (BUILDERS[style] ?? blocks)(rows, x0, x1, y, r, z, wood);
}
