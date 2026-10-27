// The signs on the shelves over the two portfolio columns (CLIENT, OPEN
// SOURCE), spelled out in one of several ways; pick one with ?sign=… :
//   blocks    painted wooden alphabet cubes (the default)
//   lego      toy bricks with the letters printed on, studs on top
//   tiles     cream letter tiles standing in a wooden rack
//   woodtype  tall printer's wood type, inked letters on end grain
//   cutout    freestanding 3D letters in glazed clay, like the pots around them
//   board     a hand-lettered board leaning against the back of the shelf
//   plaque    a slim drawer with a plate of aged brass, words in cream (built by shelfWall.js,
//             using platePlaque); ?plaque=cast shows a cast brass name plate (castPlaque), and
//             ?plaque=tiles the gilded, flower-painted tiles under a picture light
// Each builder gets the words (top row first), the cell's span x0..x1, the
// shelf's height y and the wall's seeded random, and returns meshes
// (or a group that fills in once its typeface has loaded).

import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { FontLoader, Font } from 'three/addons/loaders/FontLoader.js';
import { TTFLoader } from 'three/addons/loaders/TTFLoader.js';
import { TextGeometry } from 'three/addons/geometries/TextGeometry.js';

export const SIGN_STYLES = ['plaque', 'blocks', 'lego', 'tiles', 'woodtype', 'cutout', 'board'];

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
function tiles(rows, x0, x1, y, r, z) {
  const gap = 0.003, s = sizeFor(rows, x0, x1, gap, 0.07), t = s * 0.22, lean = -0.2;
  const tile = new RoundedBoxGeometry(s, s, t, 2, 0.003);
  const ivory = new THREE.MeshStandardMaterial({ color: '#efe1bd', roughness: 0.45 });
  const wood = new THREE.MeshStandardMaterial({ color: '#a8743f', roughness: 0.6 });
  const out = [];
  const rackH = s * 0.32, rise = s * 0.82, depth = s * 0.6, step = depth + 0.01;
  // one rack per row, tiered like seats: the upper ones further back, each
  // standing on a block of wood
  const tilesAt = [];
  [...rows].reverse().forEach((word, j) => {
    const width = word.length * (s + gap) + 0.02, cx = (x0 + x1) / 2;
    const rz = z + 0.06 - j * step, ry = y + j * rise;
    if (j) {
      const riser = new THREE.Mesh(new THREE.BoxGeometry(width, j * rise, depth), wood);
      riser.position.set(cx, y + (j * rise) / 2, rz);
      out.push(riser);
    }
    const rack = new THREE.Mesh(new RoundedBoxGeometry(width, rackH, depth, 2, 0.003), wood);
    rack.position.set(cx, ry + rackH / 2, rz);
    out.push(rack);
    tilesAt.push({ ry: ry + rackH * 0.55, rz });
  });
  out.push(...layout(rows, x0, x1, { s, gap, rowH: 0, place: (ch, x, dy, i, j) => {
    const map = letterFace('T' + ch, ch, { bg: '#efe1bd', fg: '#2a2118', font: '700 80px Archivo, Helvetica, sans-serif', sub: String(SCORE[ch] ?? 1) });
    const m = new THREE.Mesh(tile, sixSides(new THREE.MeshStandardMaterial({ map, roughness: 0.45 }), ivory));
    const { ry, rz } = tilesAt[j];
    m.position.set(x, ry + (s / 2) * Math.cos(lean), rz - depth * 0.1 + (s / 2) * Math.sin(-lean));
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
    // set at 0.1 m, then all the rows shrunk alike until the longest fits
    const size = 0.1;
    const geos = [...rows].reverse().map((word) => {
      const geo = new TextGeometry(word, { font, size, depth: size * 0.3, curveSegments: 6, bevelEnabled: true, bevelThickness: size * 0.03, bevelSize: size * 0.02, bevelSegments: 2 });
      geo.computeBoundingBox();
      const b = geo.boundingBox;
      geo.translate(-(b.max.x + b.min.x) / 2, -b.min.y, -(b.max.z + b.min.z) / 2);
      return { geo, w: b.max.x - b.min.x };
    });
    const k = Math.min(1, (x1 - x0 - 0.06) / Math.max(...geos.map((g) => g.w))), lineH = size * k * 1.1;
    geos.forEach(({ geo }, j) => {
      geo.scale(k, k, k);
      const m = new THREE.Mesh(geo, mat);
      m.position.set((x0 + x1) / 2, y + j * lineH, z + 0.02 - j * 0.02);
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

// ---- plaque: the face of a gilded sign, `aspect` wide to 1 high, after
// a gold-leaf exit sign: a row of gilded tiles painted with peonies, leaves
// and sprigs in coral, blue and green, the words in red across them, lit
// from above by a picture light. The words are set at the size that fits
// `fit` (the longest label), so every plaque's lettering matches.

export function plaqueFace(text, aspect, fit = text) {
  const W = 1024, H = Math.round(W / aspect);
  const FONT = (px) => `500 ${px}px Archivo, "Helvetica Neue", Helvetica, sans-serif`;
  let seed = [...text].reduce((h, c) => (h * 31 + c.charCodeAt(0)) >>> 0, 7);
  const r = () => ((seed = (seed * 1664525 + 1013904223) >>> 0) / 4294967296);
  // the painting is fixed once; only the lettering is redrawn when the font arrives
  const art = document.createElement('canvas');
  art.width = W; art.height = H;
  const p = art.getContext('2d');

  // gold leaf: overlapping square sheets, each a slightly different gold
  const lg = p.createLinearGradient(0, 0, W, H);
  lg.addColorStop(0, '#c9973a'); lg.addColorStop(0.5, '#e4c26a'); lg.addColorStop(1, '#b8892f');
  p.fillStyle = lg; p.fillRect(0, 0, W, H);
  for (let i = 0; i < 260; i++) {
    const sz = 30 + r() * 60;
    p.fillStyle = `rgba(${200 + r() * 55},${150 + r() * 60},${50 + r() * 40},${0.08 + r() * 0.12})`;
    p.fillRect(r() * W - sz / 2, r() * H - sz / 2, sz, sz);
  }
  for (let i = 0; i < 1600; i++) {   // the leaf's crackle and grit
    p.fillStyle = r() < 0.5 ? 'rgba(90,55,10,0.25)' : 'rgba(255,240,190,0.3)';
    p.fillRect(r() * W, r() * H, 1 + r() * 2, 1);
  }

  // painted flowers, in the manner of chinoiserie wallpaper
  const leaf = (x, y, len, ang, colour) => {
    p.save(); p.translate(x, y); p.rotate(ang);
    p.beginPath(); p.moveTo(0, 0);
    p.quadraticCurveTo(len * 0.5, -len * 0.28, len, 0); p.quadraticCurveTo(len * 0.5, len * 0.28, 0, 0);
    p.fillStyle = colour; p.fill();
    p.strokeStyle = 'rgba(30,40,40,0.55)'; p.lineWidth = 1.5; p.stroke();
    p.beginPath(); p.moveTo(0, 0); p.lineTo(len * 0.9, 0); p.strokeStyle = 'rgba(240,235,210,0.5)'; p.lineWidth = 1; p.stroke();
    p.restore();
  };
  const stem = (x0, y0, x1, y1) => {
    p.beginPath(); p.moveTo(x0, y0); p.quadraticCurveTo((x0 + x1) / 2 + (r() - 0.5) * 60, (y0 + y1) / 2, x1, y1);
    p.strokeStyle = 'rgba(70,90,60,0.8)'; p.lineWidth = 2.5; p.stroke();
  };
  const peony = (x, y, rad) => {
    for (let ring = 3; ring >= 0; ring--) {
      const n = 7 + ring * 2, rr = rad * (0.35 + ring * 0.22);
      for (let i = 0; i < n; i++) {
        const a = (i / n) * Math.PI * 2 + ring * 0.4 + r() * 0.2;
        p.save(); p.translate(x + Math.cos(a) * rr * 0.55, y + Math.sin(a) * rr * 0.55); p.rotate(a);
        p.beginPath(); p.ellipse(0, 0, rr * 0.55, rr * 0.38, 0, 0, Math.PI * 2);
        p.fillStyle = ['#e8a487', '#d4694d', '#c4503a', '#a8382a'][ring];
        p.fill(); p.strokeStyle = 'rgba(110,35,25,0.55)'; p.lineWidth = 1.3; p.stroke();
        p.restore();
      }
    }
    p.beginPath(); p.arc(x, y, rad * 0.14, 0, Math.PI * 2); p.fillStyle = '#e9c34f'; p.fill();
  };
  const blossom = (x, y, rad, colour) => {
    for (let i = 0; i < 5; i++) {
      const a = (i / 5) * Math.PI * 2;
      p.beginPath(); p.arc(x + Math.cos(a) * rad, y + Math.sin(a) * rad, rad * 0.75, 0, Math.PI * 2);
      p.fillStyle = colour; p.fill(); p.strokeStyle = 'rgba(120,60,40,0.4)'; p.lineWidth = 1; p.stroke();
    }
    p.beginPath(); p.arc(x, y, rad * 0.4, 0, Math.PI * 2); p.fillStyle = '#c98b2e'; p.fill();
  };
  const LEAVES = ['#4f7fa8', '#6f9cc0', '#5f8a62', '#7aa07a', '#3f6f8f'];
  const spray = (cx, cy, scale) => {
    for (let i = 0; i < 9; i++) {
      const a = r() * Math.PI * 2, d = scale * (0.4 + r() * 0.9);
      stem(cx, cy, cx + Math.cos(a) * d, cy + Math.sin(a) * d);
      leaf(cx + Math.cos(a) * d * 0.6, cy + Math.sin(a) * d * 0.6, scale * (0.35 + r() * 0.3), a + (r() - 0.5), LEAVES[Math.floor(r() * LEAVES.length)]);
    }
  };
  const mum = (x, y, rad, colour) => {      // a chrysanthemum: many fine petals
    for (let ring = 2; ring >= 0; ring--) {
      const n = 22 - ring * 4, rr = rad * (0.45 + ring * 0.28);
      for (let i = 0; i < n; i++) {
        const a = (i / n) * Math.PI * 2 + ring * 0.3;
        p.save(); p.translate(x, y); p.rotate(a);
        p.beginPath(); p.ellipse(rr * 0.55, 0, rr * 0.5, rr * 0.09, 0, 0, Math.PI * 2);
        p.fillStyle = colour[ring]; p.fill(); p.strokeStyle = 'rgba(60,40,60,0.35)'; p.lineWidth = 1; p.stroke();
        p.restore();
      }
    }
    p.beginPath(); p.arc(x, y, rad * 0.16, 0, Math.PI * 2); p.fillStyle = '#d9a63c'; p.fill();
  };
  const lily = (x, y, rad, ang) => {        // a lily: long pointed petals, cream flushed pink
    for (let i = 0; i < 5; i++) {
      const a = ang + (i - 2) * 0.45;
      p.save(); p.translate(x, y); p.rotate(a);
      p.beginPath(); p.moveTo(0, 0);
      p.quadraticCurveTo(rad * 0.5, -rad * 0.22, rad, 0); p.quadraticCurveTo(rad * 0.5, rad * 0.22, 0, 0);
      const lg2 = p.createLinearGradient(0, 0, rad, 0); lg2.addColorStop(0, '#e79a8c'); lg2.addColorStop(1, '#f6e9d6');
      p.fillStyle = lg2; p.fill(); p.strokeStyle = 'rgba(140,70,60,0.5)'; p.lineWidth = 1.2; p.stroke();
      p.restore();
    }
  };
  const vine = (x0, y0, x1, y1) => {        // a stem with leaves along it
    stem(x0, y0, x1, y1);
    for (let i = 1; i < 5; i++) {
      const u = i / 5, x = x0 + (x1 - x0) * u, y = y0 + (y1 - y0) * u, a = Math.atan2(y1 - y0, x1 - x0);
      leaf(x, y, H * (0.1 + r() * 0.08), a + (i % 2 ? 0.9 : -0.9), LEAVES[Math.floor(r() * LEAVES.length)]);
    }
  };
  const T = W / 5; // one tile
  // end tiles: the big flowers, full of leaves
  spray(T * 0.45, H * 0.62, H * 0.42); peony(T * 0.45, H * 0.5, H * 0.24);
  mum(T * 0.15, H * 0.12, H * 0.1, ['#3f6f9a', '#6f9cc0', '#c9dceb']);
  spray(W - T * 0.45, H * 0.4, H * 0.42); peony(W - T * 0.5, H * 0.58, H * 0.22);
  lily(W - T * 0.2, H * 0.18, H * 0.2, Math.PI * 0.75);
  // the middle tiles: lighter painting round the edges, so the words read
  for (let t = 1; t < 4; t++) {
    const x = T * t;
    vine(x + T * 0.05, H * 0.95, x + T * 0.6, H * 0.78);
    vine(x + T * 0.95, H * 0.05, x + T * 0.4, H * 0.2);
    if (t === 2) lily(x + T * 0.5, H * 0.1, H * 0.16, Math.PI * 0.5);
    else mum(x + T * (t === 1 ? 0.2 : 0.8), H * 0.86, H * 0.08, ['#c4503a', '#e08a6a', '#f3cdb6']);
    for (let i = 0; i < 3; i++) blossom(x + T * (0.15 + r() * 0.7), H * (r() < 0.5 ? 0.1 : 0.9), H * 0.025, r() < 0.5 ? '#f3e2cf' : '#e9b2a0');
  }
  // the glaze: a fine crackle over everything, and each tile's own soft edge
  p.strokeStyle = 'rgba(90,60,20,0.16)'; p.lineWidth = 0.8;
  for (let i = 0; i < 70; i++) {
    let x = r() * W, y = r() * H;
    p.beginPath(); p.moveTo(x, y);
    for (let k = 0; k < 4; k++) { x += (r() - 0.5) * 60; y += (r() - 0.5) * 40; p.lineTo(x, y); }
    p.stroke();
  }
  for (let t = 0; t < 5; t++) {
    const eg = p.createLinearGradient(T * t, 0, T * (t + 1), 0);
    eg.addColorStop(0, 'rgba(70,40,10,0.22)'); eg.addColorStop(0.06, 'rgba(70,40,10,0)');
    eg.addColorStop(0.94, 'rgba(70,40,10,0)'); eg.addColorStop(1, 'rgba(70,40,10,0.22)');
    p.fillStyle = eg; p.fillRect(T * t, 0, T, H);
  }
  // the picture light's wash: bright along the top, falling off downward
  const wash = p.createLinearGradient(0, 0, 0, H);
  wash.addColorStop(0, 'rgba(255,245,215,0.38)'); wash.addColorStop(0.45, 'rgba(255,245,215,0)'); wash.addColorStop(1, 'rgba(40,20,0,0.25)');
  p.fillStyle = wash; p.fillRect(0, 0, W, H);

  return face('P' + text + '|' + fit + aspect.toFixed(2), W, H, (g) => {
    g.drawImage(art, 0, 0);
    // the words, in red, at the size that fits the longest label
    let px = Math.round(H * 0.6);
    const set = () => { g.font = FONT(px); if ('letterSpacing' in g) g.letterSpacing = `${Math.round(px * 0.06)}px`; };
    set();
    // between the end tiles' flowers (measured with the spacing, which measureText may leave out)
    const wide = () => g.measureText(fit).width + ('letterSpacing' in g ? 0 : fit.length * px * 0.06);
    while (wide() > W * 0.64 && px > 20) { px -= 2; set(); }
    g.textAlign = 'center'; g.textBaseline = 'middle';
    g.fillStyle = 'rgba(60,10,10,0.45)'; g.fillText(text, W / 2 + 3, H / 2 + 7);   // a soft shadow under the paint
    g.fillStyle = '#b3141c'; g.fillText(text, W / 2, H / 2 + 4);
    g.strokeStyle = 'rgba(90,8,12,0.8)'; g.lineWidth = 2; g.strokeText(text, W / 2, H / 2 + 4);
  }, [FONT(80)]);
}

// ---- cast: a cast brass name plate, after a house sign: a long hexagon
// with clipped ends, a raised polished rim, a darker stippled field, a
// screw hole at each end and raised polished serif letters. Returns a group
// centred on its face's middle, front at z = 0; the letters arrive once
// their typeface has loaded, all plates sized to fit `fit`.

let serifPromise = null;
const loadSerif = () => (serifPromise ??= new FontLoader().loadAsync('https://cdn.jsdelivr.net/npm/three@0.169.0/examples/fonts/gentilis_bold.typeface.json'));
const castMats = {};
function castMaterials() {
  if (castMats.polished) return castMats;
  // the stipple: fine random pits, as cast
  const c = document.createElement('canvas');
  c.width = c.height = 256;
  const g = c.getContext('2d'), img = g.createImageData(256, 256);
  for (let i = 0; i < img.data.length; i += 4) { const v = 90 + Math.random() * 120; img.data[i] = img.data[i + 1] = img.data[i + 2] = v; img.data[i + 3] = 255; }
  g.putImageData(img, 0, 0);
  const bump = new THREE.CanvasTexture(c);
  bump.wrapS = bump.wrapT = THREE.RepeatWrapping; bump.repeat.set(10, 3);
  castMats.polished = new THREE.MeshStandardMaterial({ color: '#f0d184', metalness: 0.85, roughness: 0.2, envMapIntensity: 5 });
  // the field darker and duller than the rim and letters, so they stand out from across the room
  castMats.field = new THREE.MeshStandardMaterial({ color: '#5a4422', metalness: 0.6, roughness: 0.8, bumpMap: bump, bumpScale: 0.6, envMapIntensity: 1.1 });
  castMats.hole = new THREE.MeshStandardMaterial({ color: '#1d150c', roughness: 0.9 });
  return castMats;
}
function hexagon(w, h, clip) {
  const s = new THREE.Shape();
  s.moveTo(-w / 2, 0); s.lineTo(-w / 2 + clip, h / 2); s.lineTo(w / 2 - clip, h / 2);
  s.lineTo(w / 2, 0); s.lineTo(w / 2 - clip, -h / 2); s.lineTo(-w / 2 + clip, -h / 2); s.closePath();
  return s;
}
export function castPlaque(text, w, h, fit = text) {
  const m = castMaterials(), g = new THREE.Group();
  const clip = h * 0.36, rim = h * 0.07, T = 0.006;
  const extrude = (shape, depth) => new THREE.ExtrudeGeometry(shape, { depth, bevelEnabled: true, bevelThickness: 0.0006, bevelSize: 0.0006, bevelSegments: 2 });
  // the rim: the outline with the field cut out, standing proud
  const outer = hexagon(w, h, clip), inner = hexagon(w - rim * 2.4, h - rim * 2, clip - rim * 0.4);
  const ring = hexagon(w, h, clip); ring.holes.push(inner);
  const rimMesh = new THREE.Mesh(extrude(ring, T), m.polished);
  const field = new THREE.Mesh(extrude(inner, T * 0.6), m.field);
  rimMesh.position.z = field.position.z = -T;
  g.add(rimMesh, field);
  // a screw hole at each end, ringed in polished brass
  for (const sx of [-1, 1]) {
    const x = sx * (w / 2 - clip * 0.62);
    const boss = new THREE.Mesh(new THREE.CylinderGeometry(h * 0.11, h * 0.11, 0.0016, 28).rotateX(Math.PI / 2), m.polished);
    boss.position.set(x, 0, -T * 0.4 + 0.0008);
    const hole = new THREE.Mesh(new THREE.CylinderGeometry(h * 0.055, h * 0.055, 0.0018, 20).rotateX(Math.PI / 2), m.hole);
    hole.position.set(x, 0, -T * 0.4 + 0.001);
    g.add(boss, hole);
  }
  // the letters, raised from the field, as wide as the longest label allows
  loadSerif().then((font) => {
    const geo = (str) => {
      const t = new TextGeometry(str, { font, size: 1, depth: 0.12, curveSegments: 6, bevelEnabled: true, bevelThickness: 0.02, bevelSize: 0.015, bevelSegments: 2 });
      t.computeBoundingBox();
      return t;
    };
    const span = (b) => b.max.x - b.min.x;
    const room = w - clip * 2 - h * 0.12, fitBox = geo(fit).boundingBox;
    const size = Math.min(h * 0.5, room / span(fitBox));
    const t = geo(text), b = t.boundingBox;
    t.translate(-(b.max.x + b.min.x) / 2, -(fitBox.max.y + fitBox.min.y) / 2, 0);
    t.scale(size, size, 0.02);  // a shallow relief: 2.4 mm proud
    const letters = new THREE.Mesh(t, m.polished);
    letters.position.z = -T * 0.4;
    letters.castShadow = true;
    g.add(letters);
  }).catch(() => {});
  g.traverse((o) => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; } });
  return g;
}

// ---- plate: a flat panel of aged brass, after a salon's sign: mottled
// patina and soft brushing, held a little off the wood on four corner
// screws, the words painted in cream, lowercase, quietly centred. Returns
// a group centred on the plate's face, front at z = 0; every plate sets its
// words at the size that fits `fit`, so they match.

export function platePlaque(text, w, h, fit = text) {
  const W = 1024, H = Math.round(W * h / w);
  const FONT = (px) => `400 ${px}px Archivo, "Helvetica Neue", Helvetica, sans-serif`;
  let seed = 97;
  const r = () => ((seed = (seed * 1664525 + 1013904223) >>> 0) / 4294967296);
  const brass = document.createElement('canvas');
  brass.width = W; brass.height = H;
  const p = brass.getContext('2d');
  p.fillStyle = '#a88a52'; p.fillRect(0, 0, W, H);
  // patina: soft darker and lighter clouds
  p.filter = 'blur(18px)';
  for (let i = 0; i < 60; i++) {
    p.fillStyle = r() < 0.55 ? `rgba(90,70,40,${0.12 + r() * 0.18})` : `rgba(215,190,130,${0.1 + r() * 0.2})`;
    p.beginPath(); p.ellipse(r() * W, r() * H, 30 + r() * 140, 20 + r() * 70, r() * 3, 0, Math.PI * 2); p.fill();
  }
  p.filter = 'none';
  // brushing, side to side
  for (let i = 0; i < 500; i++) {
    p.fillStyle = r() < 0.5 ? 'rgba(255,240,200,0.07)' : 'rgba(60,45,20,0.07)';
    p.fillRect(r() * W - 200, r() * H, 200 + r() * 600, 1 + r());
  }
  // a darker edge where hands and weather have reached it least
  const edge = p.createRadialGradient(W / 2, H / 2, Math.min(W, H) * 0.3, W / 2, H / 2, W * 0.62);
  edge.addColorStop(0, 'rgba(0,0,0,0)'); edge.addColorStop(1, 'rgba(50,35,15,0.35)');
  p.fillStyle = edge; p.fillRect(0, 0, W, H);

  const map = face('PL' + text + '|' + fit + w.toFixed(3), W, H, (g) => {
    g.drawImage(brass, 0, 0);
    let px = Math.round(H * 0.42);
    const set = () => { g.font = FONT(px); if ('letterSpacing' in g) g.letterSpacing = `${Math.round(px * 0.04)}px`; };
    set();
    while (g.measureText(fit).width > W * 0.72 && px > 20) { px -= 2; set(); }
    g.textAlign = 'center'; g.textBaseline = 'middle';
    g.fillStyle = 'rgba(40,28,10,0.35)'; g.fillText(text, W / 2 + 1, H / 2 + 3);    // the paint's slight edge
    g.fillStyle = '#f4eee0'; g.fillText(text, W / 2, H / 2);
  }, [FONT(80)]);

  const g = new THREE.Group();
  const edgeMat = new THREE.MeshStandardMaterial({ color: '#8a6d3e', metalness: 0.7, roughness: 0.45 });
  const plate = new THREE.Mesh(new RoundedBoxGeometry(w, h, 0.003, 2, 0.0006),
    sixSides(new THREE.MeshStandardMaterial({ map, metalness: 0.55, roughness: 0.5, envMapIntensity: 2 }), edgeMat));
  plate.position.z = -0.0015;
  g.add(plate);
  // four small screws near the corners
  const screw = new THREE.CylinderGeometry(0.0028, 0.0028, 0.0012, 16).rotateX(Math.PI / 2);
  const screwMat = new THREE.MeshStandardMaterial({ color: '#b8995e', metalness: 0.85, roughness: 0.35, envMapIntensity: 3 });
  for (const [sx, sy] of [[-1, 1], [1, 1], [-1, -1], [1, -1]]) {
    const sc = new THREE.Mesh(screw, screwMat);
    sc.position.set(sx * (w / 2 - 0.012), sy * (h / 2 - 0.012), 0.0004);
    g.add(sc);
  }
  g.traverse((o) => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; } });
  return g;
}

// ---- material plaques: one plate in stone, concrete or dark wood, each
// with its own outline and lettering. `kind` picks one of PLAQUE_KINDS;
// returns a group centred on the face, front at z = 0, words sized to `fit`.

export const PLAQUE_KINDS = ['marble', 'blackmarble', 'concrete', 'limestone', 'slate', 'walnut', 'travertine', 'oak'];

// outlines, w by h, centred; 'rough' jitters a stone's edge as if split
function outline(kind, w, h, r) {
  const s = new THREE.Shape();
  if (kind === 'pill') {
    const rad = h / 2;
    s.moveTo(-w / 2 + rad, -h / 2); s.lineTo(w / 2 - rad, -h / 2);
    s.absarc(w / 2 - rad, 0, rad, -Math.PI / 2, Math.PI / 2, false);
    s.lineTo(-w / 2 + rad, h / 2);
    s.absarc(-w / 2 + rad, 0, rad, Math.PI / 2, Math.PI * 1.5, false);
  } else if (kind === 'oval') {
    s.absellipse(0, 0, w / 2, h / 2, 0, Math.PI * 2, false, 0);
  } else if (kind === 'arch') {
    // a flat bottom, the top a shallow arch
    const rise = h * 0.28;
    s.moveTo(-w / 2, -h / 2); s.lineTo(w / 2, -h / 2); s.lineTo(w / 2, h / 2 - rise);
    s.quadraticCurveTo(0, h / 2 + rise, -w / 2, h / 2 - rise); s.closePath();
  } else if (kind === 'notched') {
    // the corners cut in with quarter circles, like an old ticket
    const n = h * 0.18;
    s.moveTo(-w / 2 + n, -h / 2); s.lineTo(w / 2 - n, -h / 2);
    s.absarc(w / 2, -h / 2, n, Math.PI, Math.PI / 2, true);
    s.lineTo(w / 2, h / 2 - n);
    s.absarc(w / 2, h / 2, n, -Math.PI / 2, -Math.PI, true);
    s.lineTo(-w / 2 + n, h / 2);
    s.absarc(-w / 2, h / 2, n, 0, -Math.PI / 2, true);
    s.lineTo(-w / 2, -h / 2 + n);
    s.absarc(-w / 2, -h / 2, n, Math.PI / 2, 0, true);
  } else if (kind === 'rounded') {
    const rad = h * 0.16;
    s.moveTo(-w / 2 + rad, -h / 2); s.lineTo(w / 2 - rad, -h / 2); s.quadraticCurveTo(w / 2, -h / 2, w / 2, -h / 2 + rad);
    s.lineTo(w / 2, h / 2 - rad); s.quadraticCurveTo(w / 2, h / 2, w / 2 - rad, h / 2);
    s.lineTo(-w / 2 + rad, h / 2); s.quadraticCurveTo(-w / 2, h / 2, -w / 2, h / 2 - rad);
    s.lineTo(-w / 2, -h / 2 + rad); s.quadraticCurveTo(-w / 2, -h / 2, -w / 2 + rad, -h / 2);
  } else if (kind === 'chipped') {
    // a cast slab: square-ish, its edges a little uneven, a few chips out of them
    const pts = [], j = h * 0.012;
    const side = (x0, y0, x1, y1, n) => {
      for (let i = 0; i < n; i++) {
        const u = i / n, chip = r() < 0.07 ? h * (0.02 + r() * 0.03) : 0;
        const nx = -(y1 - y0), ny = x1 - x0, len = Math.hypot(nx, ny);
        pts.push([x0 + (x1 - x0) * u + (r() - 0.5) * j + (nx / len) * chip, y0 + (y1 - y0) * u + (r() - 0.5) * j + (ny / len) * chip]); // chips bite inward
      }
    };
    side(-w / 2, -h / 2, w / 2, -h / 2, 40); side(w / 2, -h / 2, w / 2, h / 2, 12);
    side(w / 2, h / 2, -w / 2, h / 2, 40); side(-w / 2, h / 2, -w / 2, -h / 2, 12);
    pts.forEach(([x, y], i) => (i ? s.lineTo(x, y) : s.moveTo(x, y)));
    s.closePath();
  } else if (kind === 'rough') {
    // split stone: the rectangle's edge walked in small uneven steps
    const pts = [], j = h * 0.035;
    const side = (x0, y0, x1, y1, n) => {
      for (let i = 0; i < n; i++) { const u = i / n; pts.push([x0 + (x1 - x0) * u + (r() - 0.5) * j, y0 + (y1 - y0) * u + (r() - 0.5) * j]); }
    };
    side(-w / 2, -h / 2, w / 2, -h / 2, 26); side(w / 2, -h / 2, w / 2, h / 2, 8);
    side(w / 2, h / 2, -w / 2, h / 2, 26); side(-w / 2, h / 2, -w / 2, -h / 2, 8);
    pts.forEach(([x, y], i) => (i ? s.lineTo(x, y) : s.moveTo(x, y)));
    s.closePath();
  } else {
    s.moveTo(-w / 2, -h / 2); s.lineTo(w / 2, -h / 2); s.lineTo(w / 2, h / 2); s.lineTo(-w / 2, h / 2); s.closePath();
  }
  return s;
}

// each kind: its outline, the face's paint, the lettering, the surface
const SERIF = '"Libre Caslon Text", Georgia, serif', SANS = 'Archivo, Helvetica, sans-serif';
const STYLES = {
  marble:      { shape: 'rect',    depth: 0.012, bevel: 0.003, side: '#e9e6e1', rough: 0.22, coat: 0.6, letters: 'carved', ink: '#7d7a76', weight: 400, family: SERIF, caps: true },
  blackmarble: { shape: 'rounded', depth: 0.01,  bevel: 0.002, side: '#1d1d20', rough: 0.18, coat: 0.9, letters: 'filled', ink: '#d9b45f', weight: 400, family: SERIF, caps: true },
  concrete:    { shape: 'chipped',    depth: 0.03,  bevel: 0.004, side: '#9d9992', rough: 0.9,  coat: 0,   letters: 'brass', ink: '#5d5a55', weight: 500, family: SANS, caps: true },
  limestone:   { shape: 'rough',   depth: 0.016, bevel: 0.002, side: '#d8ccb5', rough: 0.85, coat: 0,   letters: 'carved', ink: '#7b6f5c', weight: 400, family: SANS, caps: false },
  slate:       { shape: 'rough',   depth: 0.01,  bevel: 0.001, side: '#34383d', rough: 0.7,  coat: 0.2, letters: 'filled', ink: '#ece8df', weight: 400, family: SERIF, caps: true },
  walnut:      { shape: 'arch',    depth: 0.012, bevel: 0.002, side: '#3e2717', rough: 0.55, coat: 0.3, letters: 'filled', ink: '#efe2c4', weight: 400, family: SERIF, caps: true },
  travertine:  { shape: 'oval',    depth: 0.012, bevel: 0.003, side: '#ddcdb0', rough: 0.75, coat: 0,   letters: 'carved', ink: '#8a7552', weight: 500, family: SANS, caps: false },
  oak:         { shape: 'notched', depth: 0.01,  bevel: 0.002, side: '#4a3120', rough: 0.6,  coat: 0.2, letters: 'filled', ink: '#d8b46a', weight: 700, family: SANS, caps: true },
};
// how much of the width the words may take: less inside an oval or a pill
const ROOM = { travertine: 0.6, concrete: 0.74, limestone: 0.66 };

// the face of each material, painted on a canvas
function paintMaterial(kind, g, W, H, r) {
  const fill = (c) => { g.fillStyle = c; g.fillRect(0, 0, W, H); };
  const speck = (n, colours, max = 2) => {
    for (let i = 0; i < n; i++) { g.fillStyle = colours[Math.floor(r() * colours.length)]; g.fillRect(r() * W, r() * H, 1 + r() * max, 1 + r() * max); }
  };
  const veins = (n, colour, width, blur) => {
    g.save(); g.filter = blur ? 'blur(' + blur + 'px)' : 'none'; g.strokeStyle = colour; g.lineWidth = width;
    for (let i = 0; i < n; i++) {
      let x = r() * W, y = r() * H, a = r() * Math.PI * 2;
      g.beginPath(); g.moveTo(x, y);
      for (let k = 0; k < 40; k++) { a += (r() - 0.5) * 0.6; x += Math.cos(a) * 18; y += Math.sin(a) * 9; g.lineTo(x, y); }
      g.stroke();
    }
    g.restore();
  };
  const grain = (base, lines, dark) => {
    fill(base);
    for (let y = 0; y < H; y += 2 + r() * 5) {
      g.strokeStyle = r() < 0.2 ? dark : lines; g.lineWidth = 0.8 + r() * 1.8; g.beginPath();
      for (let x = -10; x <= W + 10; x += 20) g.lineTo(x, y + Math.sin(x * 0.006 + y * 0.05) * 6);
      g.stroke();
    }
  };
  if (kind === 'marble') { fill('#f3f1ed'); veins(10, 'rgba(150,150,155,0.35)', 6, 6); veins(14, 'rgba(110,110,115,0.45)', 1.2, 0); }
  else if (kind === 'blackmarble') { fill('#1e1e22'); veins(8, 'rgba(255,255,255,0.12)', 6, 5); veins(12, 'rgba(230,225,215,0.5)', 1, 0); veins(3, 'rgba(210,175,90,0.6)', 1.5, 0); }
  else if (kind === 'concrete') {
    fill('#aaa69f');
    g.save(); g.filter = 'blur(20px)';
    for (let i = 0; i < 40; i++) {
      g.fillStyle = r() < 0.5 ? 'rgba(80,78,72,0.12)' : 'rgba(230,228,222,0.12)';
      g.beginPath(); g.ellipse(r() * W, r() * H, 40 + r() * 120, 30 + r() * 70, 0, 0, Math.PI * 2); g.fill();
    }
    g.restore();
    speck(5000, ['rgba(60,58,54,0.35)', 'rgba(235,232,225,0.35)']);
    for (let i = 0; i < 90; i++) { g.fillStyle = 'rgba(50,48,44,0.55)'; g.beginPath(); g.arc(r() * W, r() * H, 1 + r() * 3, 0, Math.PI * 2); g.fill(); }
  } else if (kind === 'limestone') {
    fill('#e9dfcd'); speck(6000, ['rgba(150,135,110,0.25)', 'rgba(255,250,240,0.4)'], 1.5);
    // the hewn border: a band of chiselled facets round a smooth dressed field
    const band = Math.min(W, H) * 0.16;
    for (let i = 0; i < 260; i++) {
      const edge = Math.floor(r() * 4), t = r();
      const x = edge === 0 ? t * W : edge === 1 ? W - r() * band : edge === 2 ? t * W : r() * band;
      const y = edge === 0 ? r() * band : edge === 1 ? t * H : edge === 2 ? H - r() * band : t * H;
      g.fillStyle = r() < 0.5 ? 'rgba(120,105,80,' + (0.12 + r() * 0.2) + ')' : 'rgba(255,252,245,' + (0.2 + r() * 0.3) + ')';
      g.beginPath(); g.moveTo(x, y);
      for (let k = 0; k < 4; k++) g.lineTo(x + (r() - 0.5) * band * 0.9, y + (r() - 0.5) * band * 0.7);
      g.closePath(); g.fill();
    }
  } else if (kind === 'slate') {
    fill('#3a3e44');
    for (let y = 0; y < H; y += 3 + r() * 10) { g.fillStyle = (r() < 0.5 ? 'rgba(20,22,26,' : 'rgba(120,125,132,') + (0.08 + r() * 0.12) + ')'; g.fillRect(0, y, W, 1 + r() * 4); }
    speck(2000, ['rgba(150,155,160,0.2)']);
  } else if (kind === 'walnut') grain('#4a2e1b', 'rgba(30,16,8,0.35)', 'rgba(15,8,4,0.6)');
  else if (kind === 'travertine') {
    fill('#e4d6bb');
    for (let y = 0; y < H; y += 4 + r() * 14) { g.fillStyle = (r() < 0.5 ? 'rgba(170,145,105,' : 'rgba(250,240,220,') + (0.15 + r() * 0.2) + ')'; g.fillRect(0, y, W, 2 + r() * 6); }
    for (let i = 0; i < 160; i++) { g.fillStyle = 'rgba(120,95,60,0.45)'; g.beginPath(); g.ellipse(r() * W, r() * H, 2 + r() * 10, 1 + r() * 2.5, 0, 0, Math.PI * 2); g.fill(); }
  } else if (kind === 'oak') grain('#5b3c24', 'rgba(35,20,10,0.3)', 'rgba(20,10,4,0.55)');
}

const titleCase = (t) => t.replace(/\b\w/g, (c) => c.toUpperCase());

// Raised brass letters in Libre Caslon Text, the wordmark's face, spaced
// wide like CHLOE MA; built from the site's own font file
let caslonPromise = null;
const loadCaslon = () => (caslonPromise ??= new TTFLoader().loadAsync('assets/fonts/LibreCaslonText-Regular.ttf').then((json) => new Font(json)));
const brassMat = new THREE.MeshStandardMaterial({ color: '#dcb66a', metalness: 0.9, roughness: 0.26, envMapIntensity: 4 });
const TRACK = 0.22; // letter spacing, as a share of the size
function lettersWidth(font, text, size) {
  const res = font.data.resolution;
  return [...text].reduce((w, ch) => w + ((font.data.glyphs[ch]?.ha ?? res * 0.3) / res) * size + TRACK * size, -TRACK * size);
}
function brassLetters(font, text, size, depth) {
  const g = new THREE.Group(), res = font.data.resolution;
  let x = -lettersWidth(font, text, size) / 2;
  for (const ch of text) {
    const adv = ((font.data.glyphs[ch]?.ha ?? res * 0.3) / res) * size;
    if (ch !== ' ') {
      const geo = new THREE.ExtrudeGeometry(font.generateShapes(ch, size), { depth, curveSegments: 10, bevelEnabled: true, bevelThickness: depth * 0.2, bevelSize: size * 0.012, bevelSegments: 2 });
      const m = new THREE.Mesh(geo, brassMat);
      m.position.x = x;
      m.castShadow = true;
      g.add(m);
    }
    x += adv + TRACK * size;
  }
  g.position.y = -size * 0.35; // capitals centred on the line
  return g;
}
export function stylePlaque(kind, text, w, h, fit = text) {
  const st = STYLES[kind] ?? STYLES.marble;
  let seed = [...kind].reduce((a, c) => (a * 31 + c.charCodeAt(0)) >>> 0, 5);
  const r = () => ((seed = (seed * 1664525 + 1013904223) >>> 0) / 4294967296);
  const label = st.caps ? text.toUpperCase() : titleCase(text);
  const fitLabel = st.caps ? fit.toUpperCase() : titleCase(fit);
  const W = 1024, H = Math.round(W * h / w);
  const FONT = (px) => st.weight + ' ' + px + 'px ' + st.family;
  const base = document.createElement('canvas');
  base.width = W; base.height = H;
  paintMaterial(kind, base.getContext('2d'), W, H, r);
  const map = face('S' + kind + label + '|' + fitLabel + w.toFixed(3), W, H, (g) => {
    g.drawImage(base, 0, 0);
    if (st.letters === 'brass') return;
    let px = Math.round(H * 0.4);
    const set = () => { g.font = FONT(px); if ('letterSpacing' in g) g.letterSpacing = Math.round(px * (st.caps ? 0.1 : 0.03)) + 'px'; };
    set();
    while (g.measureText(fitLabel).width > W * (ROOM[kind] ?? 0.76) && px > 20) { px -= 2; set(); }
    g.textAlign = 'center'; g.textBaseline = 'middle';
    const y = H / 2 + (kind === 'walnut' ? H * 0.06 : 0);
    if (st.letters === 'carved') {
      // cut into the surface: shadowed along the top edge, lit along the bottom
      g.fillStyle = 'rgba(255,255,255,0.55)'; g.fillText(label, W / 2, y + 2);
      g.fillStyle = 'rgba(0,0,0,0.45)'; g.fillText(label, W / 2, y - 1.5);
      g.fillStyle = st.ink; g.fillText(label, W / 2, y);
    } else {
      // filled with paint or gilt, a hair of shadow beneath
      g.fillStyle = 'rgba(0,0,0,0.35)'; g.fillText(label, W / 2, y + 2);
      g.fillStyle = st.ink; g.fillText(label, W / 2, y);
    }
  }, [FONT(80)]);
  const geo = new THREE.ExtrudeGeometry(outline(st.shape, w, h, r), { depth: st.depth, bevelEnabled: true, bevelThickness: st.bevel, bevelSize: st.bevel, bevelSegments: 3, curveSegments: 32 });
  // the front's UVs are its x, y in metres: stretch the painting over the outline
  const faceMap = map.clone();
  faceMap.repeat.set(1 / w, 1 / h); faceMap.offset.set(0.5, 0.5);
  const front = new THREE.MeshPhysicalMaterial({ map: faceMap, roughness: st.rough, clearcoat: st.coat, clearcoatRoughness: 0.15 });
  const side = new THREE.MeshStandardMaterial({ color: st.side, roughness: Math.min(1, st.rough + 0.1) });
  const plate = new THREE.Mesh(geo, [front, side]);
  plate.position.z = st.bevel;                 // its back against the drawer front
  const grp = new THREE.Group();
  grp.add(plate);
  if (st.letters === 'brass') {
    const front = st.depth + st.bevel * 2;
    loadCaslon().then((font) => {
      // both plaques at the size that fits the longer label, a little under a third of the height
      const size = Math.min(h * 0.28, (w * (ROOM[kind] ?? 0.76)) / lettersWidth(font, fitLabel, 1));
      const letters = brassLetters(font, label, size, 0.0025);
      letters.position.z = front;
      grp.add(letters);
    }).catch((e) => console.warn('Brass letters', e));
  }
  grp.traverse((o) => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; } });
  return grp;
}

// ---- painted: a sign of hand-painted tiles, after a Mediterranean house
// sign: speckled cream tiles (six by two here, the sign being long), a
// rough terracotta border, a wobbly hand-drawn blue line curling into
// scrolls at the corners, orange fans in the corners, a blue palmette with gold scrolls above the words and a small
// sprig below, the words in navy old-style capitals and lower case, the
// paint a little worn so the tile shows through. Returns a group centred on
// its face, back at z = 0; every plaque sets its words at the size that
// fits `fit`, so they match.

export function paintedPlaque(text, w, h, fit = text) {
  const W = 2048, H = Math.round(W * h / w);
  const FONT = (px) => `400 ${px}px "Libre Caslon Text", Georgia, serif`;
  let seed = 71;
  const r = () => ((seed = (seed * 1664525 + 1013904223) >>> 0) / 4294967296);
  const art = document.createElement('canvas');
  art.width = W; art.height = H;
  const p = art.getContext('2d');
  const NAVY = '#24346d', NAVY_D = '#18234d', TERRA = '#b65c36', TERRA_D = '#8e4325', ORANGE = '#d8723a', ORANGE_D = '#9b4320';
  const GOLD = '#c79a3e';
  const u = H / 100; // one unit: a hundredth of the sign's height

  // ---- the tiles: speckled cream, each a slightly different tint
  const COLS = 6, ROWS = 2, B = 7.5 * u; // border width
  for (let ty = 0; ty < ROWS; ty++) for (let tx = 0; tx < COLS; tx++) {
    const x0 = (W / COLS) * tx, y0 = (H / ROWS) * ty, t = (r() - 0.5) * 10;
    p.fillStyle = `rgb(${236 + t},${224 + t},${199 + t})`;
    p.fillRect(x0, y0, W / COLS + 1, H / ROWS + 1);
  }
  p.save(); p.filter = 'blur(18px)';
  for (let i = 0; i < 60; i++) { p.fillStyle = r() < 0.5 ? 'rgba(205,185,150,0.2)' : 'rgba(250,244,230,0.3)'; p.beginPath(); p.ellipse(r() * W, r() * H, 20 + r() * 120, 15 + r() * 60, r() * 3, 0, Math.PI * 2); p.fill(); }
  p.restore();
  const speckle = (n, colours, max) => { for (let i = 0; i < n; i++) { p.fillStyle = colours[Math.floor(r() * colours.length)]; const s = 0.6 + r() * max; p.fillRect(r() * W, r() * H, s, s); } };
  speckle(110000, ['rgba(150,125,90,0.45)', 'rgba(115,95,65,0.35)', 'rgba(255,250,238,0.6)'], 2.8);

  // ---- paint helpers
  const fillStroke = (fill, stroke, width) => { if (fill) { p.fillStyle = fill; p.fill(); } if (stroke) { p.strokeStyle = stroke; p.lineWidth = width; p.lineJoin = 'round'; p.stroke(); } };
  // a hand-drawn line through points, a little unsteady
  const wobbly = (pts, colour, width) => {
    p.beginPath();
    pts.forEach(([x, y], i) => { const jx = (r() - 0.5) * u * 0.35, jy = (r() - 0.5) * u * 0.35; i ? p.lineTo(x + jx, y + jy) : p.moveTo(x + jx, y + jy); });
    fillStroke(null, colour, width);
  };
  // a fan in a corner: veined petals spreading from the corner
  const fan = (x, y, size, ang, n = 6) => {
    for (let i = 0; i < n; i++) {
      const a = ang + (i - (n - 1) / 2) * 0.27;
      p.save(); p.translate(x, y); p.rotate(a);
      p.beginPath(); p.moveTo(0, 0); p.quadraticCurveTo(size * 0.4, -size * 0.2, size, -size * 0.08); p.quadraticCurveTo(size * 1.05, 0, size, size * 0.08); p.quadraticCurveTo(size * 0.4, size * 0.2, 0, 0);
      fillStroke(ORANGE, ORANGE_D, u * 0.45);
      p.beginPath(); p.moveTo(size * 0.2, 0); p.lineTo(size * 0.85, 0); fillStroke(null, 'rgba(240,170,120,0.85)', u * 0.4);
      p.restore();
    }
  };
  // a palmette: tall blue petals fanning up from a point
  const palmette = (x, y, size, dir = -1) => {
    const n = 7;
    for (let i = 0; i < n; i++) {
      const a = -Math.PI / 2 * -dir + (i - (n - 1) / 2) * 0.32;
      const len = size * (1 - Math.abs(i - (n - 1) / 2) * 0.12);
      p.save(); p.translate(x, y); p.rotate(a);
      p.beginPath(); p.moveTo(0, 0); p.quadraticCurveTo(len * 0.55, -len * 0.16, len, 0); p.quadraticCurveTo(len * 0.55, len * 0.16, 0, 0);
      fillStroke(NAVY, NAVY_D, u * 0.35);
      p.beginPath(); p.moveTo(len * 0.15, 0); p.lineTo(len * 0.75, 0); fillStroke(null, 'rgba(120,145,200,0.6)', u * 0.3);
      p.restore();
    }
  };
  // a gold C-scroll ending in a small ball
  const cscroll = (x, y, size, flip, dir = -1) => {
    p.beginPath(); p.moveTo(x, y);
    p.bezierCurveTo(x + flip * size * 0.6, y + dir * size * 0.5, x + flip * size * 1.2, y + dir * size * 0.1, x + flip * size * 1.3, y + dir * size * 0.6);
    fillStroke(null, GOLD, u * 0.9);
    p.beginPath(); p.arc(x + flip * size * 1.3, y + dir * size * 0.6, u * 1.1, 0, Math.PI * 2); fillStroke(GOLD, '#8c6a22', u * 0.3);
  };
  // a corner scroll: the blue line curling into a loop
  const cornerScroll = (x, y, fx, fy) => {
    const s = u * 9;
    wobbly([[x + fx * s * 1.4, y], [x + fx * s * 0.5, y + fy * s * 0.05], [x + fx * s * 0.1, y + fy * s * 0.4], [x, y + fy * s * 1.2]], NAVY, u * 1.1);
    p.beginPath(); p.arc(x + fx * s * 1.4, y + fy * s * 0.35, s * 0.35, 0, Math.PI * 2); fillStroke(null, NAVY, u * 1);
    p.beginPath(); p.arc(x + fx * s * 0.35, y + fy * s * 1.35, s * 0.3, 0, Math.PI * 2); fillStroke(null, NAVY, u * 1);
  };

  // ---- the border: terracotta, its inner edge rough, darker at the rim
  p.fillStyle = TERRA;
  p.beginPath(); p.rect(0, 0, W, H);
  const inner = [];
  const edgeRun = (x0, y0, x1, y1, n) => { for (let i = 0; i < n; i++) { const t = i / n; inner.push([x0 + (x1 - x0) * t + (r() - 0.5) * u * 1.2, y0 + (y1 - y0) * t + (r() - 0.5) * u * 1.2]); } };
  edgeRun(B, B, W - B, B, 120); edgeRun(W - B, B, W - B, H - B, 30); edgeRun(W - B, H - B, B, H - B, 120); edgeRun(B, H - B, B, B, 30);
  inner.forEach(([x, y], i) => (i ? p.lineTo(x, y) : p.moveTo(x, y)));
  p.closePath(); p.fill('evenodd');
  p.save(); p.globalAlpha = 0.5;
  for (let i = 0; i < 9000; i++) { const x = r() * W, y = r() * H; if (x > B * 1.1 && x < W - B * 1.1 && y > B * 1.1 && y < H - B * 1.1) continue; p.fillStyle = r() < 0.5 ? TERRA_D : '#d08a62'; p.fillRect(x, y, 1 + r() * 2.5, 1 + r() * 2.5); }
  p.restore();
  p.strokeStyle = 'rgba(90,40,20,0.55)'; p.lineWidth = u * 0.8; p.strokeRect(u * 0.4, u * 0.4, W - u * 0.8, H - u * 0.8);

  // ---- tile seams, drawn over the border too (it's painted across the tiles)
  p.strokeStyle = 'rgba(140,120,92,0.6)'; p.lineWidth = u * 0.45;
  for (let i = 1; i < COLS; i++) { const x = (W / COLS) * i; p.beginPath(); p.moveTo(x, 0); p.lineTo(x, H); p.stroke(); }
  p.beginPath(); p.moveTo(0, H / 2); p.lineTo(W, H / 2); p.stroke();

  // ---- the blue line inside the border, and its corner scrolls
  const L = B + u * 3.5;
  wobbly([[L + u * 12, L], [W - L - u * 12, L]], NAVY, u * 1.1);
  wobbly([[L + u * 12, H - L], [W - L - u * 12, H - L]], NAVY, u * 1.1);
  wobbly([[L, L + u * 12], [L, H - L - u * 12]], NAVY, u * 1.1);
  wobbly([[W - L, L + u * 12], [W - L, H - L - u * 12]], NAVY, u * 1.1);
  for (const [x, y, fx, fy] of [[L, L, 1, 1], [W - L, L, -1, 1], [L, H - L, 1, -1], [W - L, H - L, -1, -1]]) {
    // the fan tucked in the corner, the scroll curling out beside it
    fan(x + fx * u * 1.5, y + fy * u * 1.5, u * 11, Math.atan2(fy, fx));
    cornerScroll(x + fx * u * 12, y + fy * u * 3, fx, fy);
  }


  // ---- the ornaments above and below the words
  palmette(W / 2, L + u * 22, u * 18);
  cscroll(W / 2 - u * 2, L + u * 17, u * 16, -1, -1);
  cscroll(W / 2 + u * 2, L + u * 17, u * 16, 1, -1);
  p.beginPath(); p.moveTo(W / 2, L + u * 18); p.lineTo(W / 2 + u * 1.8, L + u * 21); p.lineTo(W / 2, L + u * 24); p.lineTo(W / 2 - u * 1.8, L + u * 21); p.closePath(); fillStroke(ORANGE, ORANGE_D, u * 0.3);
  fan(W / 2, H - L - u * 4, u * 8, -Math.PI / 2, 5);
  for (const fl of [-1, 1]) {
    p.beginPath(); p.moveTo(W / 2 + fl * u * 3, H - L - u * 4); p.quadraticCurveTo(W / 2 + fl * u * 12, H - L - u * 9, W / 2 + fl * u * 20, H - L - u * 6); fillStroke(null, NAVY, u * 0.8);
    for (let k = 1; k <= 3; k++) {
      const x = W / 2 + fl * u * (4 + k * 5), y = H - L - u * (5 + Math.sin(k) * 2);
      p.save(); p.translate(x, y); p.rotate(fl > 0 ? -0.9 : Math.PI + 0.9);
      p.beginPath(); p.moveTo(0, 0); p.quadraticCurveTo(u * 2.5, -u * 1.2, u * 5, 0); p.quadraticCurveTo(u * 2.5, u * 1.2, 0, 0); fillStroke(NAVY, NAVY_D, u * 0.3);
      p.restore();
    }
    p.beginPath(); p.arc(W / 2 + fl * u * 20, H - L - u * 6, u * 1, 0, Math.PI * 2); fillStroke(GOLD, '#8c6a22', u * 0.3);
  }

  const map = face('PT2' + text + '|' + fit + w.toFixed(3), W, H, (g) => {
    g.drawImage(art, 0, 0);
    // the words, painted in navy between the branches
    let px = Math.round(H * 0.34);
    g.font = FONT(px);
    while (g.measureText(fit).width > W * 0.52 && px > 20) { px -= 2; g.font = FONT(px); }
    g.textAlign = 'center'; g.textBaseline = 'middle';
    const y = H * 0.56;
    g.fillStyle = 'rgba(24,35,77,0.35)'; g.fillText(text, W / 2 + 3, y + 4);   // the brush's softer edge
    g.fillStyle = NAVY; g.fillText(text, W / 2, y);
    // the paint worn a little, the tile's speckle showing through everywhere
    let ws = 977;
    const wr = () => ((ws = (ws * 1664525 + 1013904223) >>> 0) / 4294967296);
    for (let i = 0; i < 52000; i++) { g.fillStyle = wr() < 0.7 ? 'rgba(240,230,208,0.6)' : 'rgba(120,100,70,0.35)'; const s = 0.6 + wr() * 2.4; g.fillRect(wr() * W, wr() * H, s, s); }
  }, [FONT(80)]);

  // The relief: a gritty, stuccoed tile face, the seams sunk, the border's
  // rough edge and the paint's edges catching the light; built from the
  // painting itself over a coarse noise, again once the lettering is in.
  const relief = document.createElement('canvas');
  relief.width = W; relief.height = H;
  const rg = relief.getContext('2d');
  const bump = new THREE.CanvasTexture(relief);
  const drawRelief = () => {
    let rs = 313;
    const rr = () => ((rs = (rs * 1664525 + 1013904223) >>> 0) / 4294967296);
    rg.filter = 'none'; rg.globalAlpha = 1;
    rg.fillStyle = '#808080'; rg.fillRect(0, 0, W, H);
    rg.filter = 'blur(3px)';
    for (let i = 0; i < 2600; i++) { const c = Math.round(60 + rr() * 140); rg.fillStyle = `rgba(${c},${c},${c},0.5)`; rg.beginPath(); rg.arc(rr() * W, rr() * H, 2 + rr() * 9, 0, Math.PI * 2); rg.fill(); }
    rg.filter = 'none';
    for (let i = 0; i < 70000; i++) { const c = rr() < 0.5 ? 40 : 220; rg.fillStyle = `rgba(${c},${c},${c},0.35)`; rg.fillRect(rr() * W, rr() * H, 1 + rr() * 2.2, 1 + rr() * 2.2); }
    // the painting itself, darker paint sitting a little proud of the tile
    rg.globalAlpha = 0.55; rg.filter = 'grayscale(1) invert(1) contrast(1.4)';
    rg.drawImage(map.image, 0, 0);
    rg.globalAlpha = 1; rg.filter = 'none';
    // the seams sunk between the tiles
    rg.strokeStyle = '#1a1a1a'; rg.lineWidth = u * 1.1;
    for (let i = 1; i < COLS; i++) { const x = (W / COLS) * i; rg.beginPath(); rg.moveTo(x, 0); rg.lineTo(x, H); rg.stroke(); }
    rg.beginPath(); rg.moveTo(0, H / 2); rg.lineTo(W, H / 2); rg.stroke();
    bump.needsUpdate = true;
  };
  drawRelief();
  document.fonts?.load(FONT(80)).then(() => setTimeout(drawRelief, 0)).catch(() => {});
  // a rough, satin glaze over a hand-made surface
  // lifted and warmed: set into the back of a shelf, it sits in shade
  const glaze = new THREE.MeshPhysicalMaterial({ map, color: new THREE.Color(1.45, 1.36, 1.22), bumpMap: bump, bumpScale: 3, roughness: 0.68, clearcoat: 0.25, clearcoatRoughness: 0.55 });
  const edge = new THREE.MeshPhysicalMaterial({ color: '#a9573a', roughness: 0.7 });
  const depth = 0.014;
  const slab = new THREE.Mesh(new RoundedBoxGeometry(w, h, depth, 3, 0.0025), sixSides(glaze, edge));
  slab.position.z = depth / 2;
  const grp = new THREE.Group();
  grp.add(slab);
  grp.traverse((o) => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; } });
  return grp;
}

const BUILDERS = { blocks, lego, tiles, woodtype, cutout, board };

// z is the middle of the shelf's depth, measured from the wall's face
export function signPieces(style, words, x0, x1, y, r, z, wood) {
  const rows = [].concat(words);
  return (BUILDERS[style] ?? blocks)(rows, x0, x1, y, r, z, wood);
}
