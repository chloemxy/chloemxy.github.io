// Finishes for an old shop cabinet: oiled elm from a scanned veneer, paler
// unfinished wood inside the drawers, softly aged brass, blown glass, cork,
// and the dried contents of the jars. As in the Corner newsstand, the
// scanned maps are CC0 (see assets/tex/CREDITS.md) and the rest is painted
// from seeded noise, so the wear is the same on every load.

import * as THREE from 'three';
import { drawGrain } from './woodGrains.js?v=20261027185754';

let anisotropy = 4;
export function setMaterialAnisotropy(n) { anisotropy = n; }

function rng(seed) {
  let s = seed >>> 0;
  return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296);
}

// Value noise: random grids of several sizes, scaled up smoothly and stacked.
function noise(size, seed, octaves = [[4, 0.45], [16, 0.3], [64, 0.17], [256, 0.08]]) {
  const rand = rng(seed);
  const c = document.createElement('canvas');
  c.width = c.height = size;
  const ctx = c.getContext('2d');
  ctx.fillStyle = '#808080';
  ctx.fillRect(0, 0, size, size);
  for (const [cells, weight] of octaves) {
    const g = document.createElement('canvas');
    g.width = g.height = cells;
    const gx = g.getContext('2d');
    const img = gx.createImageData(cells, cells);
    for (let i = 0; i < img.data.length; i += 4) {
      const v = rand() * 255;
      img.data[i] = img.data[i + 1] = img.data[i + 2] = v; img.data[i + 3] = 255;
    }
    gx.putImageData(img, 0, 0);
    ctx.globalAlpha = weight;
    ctx.drawImage(g, 0, 0, size, size);
  }
  ctx.globalAlpha = 1;
  return c;
}

function texture(canvas, { srgb = false, repeat = [1, 1] } = {}) {
  const t = new THREE.CanvasTexture(canvas);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.repeat.set(...repeat);
  t.anisotropy = anisotropy;
  if (srgb) t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

// grey map squeezed into [lo, hi], used for roughness
function range(canvas, lo, hi) {
  const c = document.createElement('canvas');
  c.width = canvas.width; c.height = canvas.height;
  const ctx = c.getContext('2d');
  ctx.drawImage(canvas, 0, 0);
  const img = ctx.getImageData(0, 0, c.width, c.height);
  for (let i = 0; i < img.data.length; i += 4) {
    const v = lo * 255 + (img.data[i] / 255) * (hi - lo) * 255;
    img.data[i] = img.data[i + 1] = img.data[i + 2] = v;
  }
  ctx.putImageData(img, 0, 0);
  return c;
}

// a base colour broken up with a speckle of darker and lighter bits, for
// cork and the dried herbs in the jars
function speckled(base, seed, { dark = '#2b1d12', light = '#f4e6c4', count = 2600, size = 256 } = {}) {
  const r = rng(seed);
  const c = document.createElement('canvas');
  c.width = c.height = size;
  const ctx = c.getContext('2d');
  ctx.fillStyle = base; ctx.fillRect(0, 0, size, size);
  for (let i = 0; i < count; i++) {
    ctx.fillStyle = r() < 0.6 ? dark : light;
    ctx.globalAlpha = 0.15 + r() * 0.35;
    const w = 1 + r() * 4, h = 1 + r() * 2;
    ctx.save(); ctx.translate(r() * size, r() * size); ctx.rotate(r() * Math.PI);
    ctx.fillRect(-w / 2, -h / 2, w, h); ctx.restore();
  }
  ctx.globalAlpha = 1;
  return c;
}

const SCANS = { ashDiff: 'assets/tex/ash_diff.jpg', ashRough: 'assets/tex/ash_rough.jpg', ashNor: 'assets/tex/ash_nor.jpg' };
const scans = {};

export async function loadScans() {
  const loader = new THREE.TextureLoader();
  await Promise.all(Object.entries(SCANS).map(async ([k, url]) => {
    const t = await loader.loadAsync(url);
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    t.anisotropy = anisotropy;
    if (k.endsWith('Diff')) t.colorSpace = THREE.SRGBColorSpace;
    scans[k] = t;
  }));
}

// The scanned veneer, its maps turned a quarter so the grain runs down the
// length of each piece (cabinet.js lays UVs out in metres along it).
function scanned({ tint = '#ffffff', normal = 0.5, rough = 1 } = {}) {
  const maps = ['Diff', 'Rough', 'Nor'].map((m) => {
    const t = scans['ash' + m].clone();
    t.center.set(0.5, 0.5); t.rotation = Math.PI / 2;
    t.needsUpdate = true;
    return t;
  });
  return new THREE.MeshStandardMaterial({
    color: tint, vertexColors: true, // each piece carries its own tone (cabinet.js)
    map: maps[0], roughness: rough, roughnessMap: maps[1],
    normalMap: maps[2], normalScale: new THREE.Vector2(normal, normal),
  });
}

export function makeMaterials() {
  return {
    // oiled elm: the pale ash scan pulled down to a warm honey brown
    elm: scanned({ tint: new THREE.Color(0.56, 0.42, 0.32), normal: 0.55, rough: 0.8 }),
    // the drawer boxes inside: unfinished, paler and drier
    deal: scanned({ tint: new THREE.Color(1.15, 1.0, 0.8), normal: 0.3, rough: 1 }),
    // the bin cabinet (v2): pale knotty pine, a warm honey colour
    pine: scanned({ tint: new THREE.Color(1.02, 0.76, 0.5), normal: 0.45, rough: 0.85 }),
    // its legs: black powder-coated steel
    blackSteel: new THREE.MeshStandardMaterial({ color: '#1c1c1c', metalness: 0.5, roughness: 0.55 }),
    // brushed, softly aged brass for the knobs and label frames
    brass: new THREE.MeshStandardMaterial({
      color: '#c9a35a', metalness: 1, roughness: 1,
      roughnessMap: texture(range(noise(256, 59, [[4, 0.3], [256, 0.7]]), 0.26, 0.48)),
    }),
    // blown glass, a little green through its thickness
    glass: new THREE.MeshPhysicalMaterial({
      color: '#ffffff', metalness: 0, roughness: 0.05, transmission: 1, thickness: 0.006, ior: 1.5,
      attenuationColor: '#d4e3d6', attenuationDistance: 0.12, specularIntensity: 1, side: THREE.DoubleSide,
    }),
    cork: new THREE.MeshStandardMaterial({ map: texture(speckled('#b88d5c', 3, { dark: '#6b4a2b' }), { srgb: true }), roughness: 0.95 }),
    // the cards stacked behind the one at the front of each drawer
    stock: new THREE.MeshStandardMaterial({ color: '#e7dcc1', roughness: 0.95 }),
  };
}

// dried herbs for a jar, in its own colour
export function herbFill(colour, seed) {
  return new THREE.MeshStandardMaterial({ map: texture(speckled(colour, seed, { count: 4000 }), { srgb: true, repeat: [2, 1] }), roughness: 1 });
}

// ---- Weathering (the bin cabinet)

const WEATHER_GLSL = /* glsl */`
  varying vec3 vNPos;
  varying vec3 vONormal;
  uniform float uFade, uGrime, uMoss, uColoniesOn;
  uniform vec3 uMossLo, uMossHi;
  uniform vec4 uColonies[4];  // moss colonies: centre xyz, radius
  uniform vec3 uOutside;      // outer half-width, top height, front depth
  float wHash(vec3 p) { p = fract(p * 0.3183099 + 0.1); p *= 17.0; return fract(p.x * p.y * p.z * (p.x + p.y + p.z)); }
  float wNoise(vec3 x) {
    vec3 i = floor(x), f = fract(x);
    f = f * f * (3.0 - 2.0 * f);
    return mix(mix(mix(wHash(i), wHash(i + vec3(1, 0, 0)), f.x), mix(wHash(i + vec3(0, 1, 0)), wHash(i + vec3(1, 1, 0)), f.x), f.y),
               mix(mix(wHash(i + vec3(0, 0, 1)), wHash(i + vec3(1, 0, 1)), f.x), mix(wHash(i + vec3(0, 1, 1)), wHash(i + 1.0), f.x), f.y), f.z);
  }
  float wFbm(vec3 p) { float s = 0.0, a = 0.5; for (int i = 0; i < 4; i++) { s += a * wNoise(p); p *= 2.03; a *= 0.5; } return s / 0.9375; }
`;

// Ages a material in place: sun-bleached grey patches, grime, fine
// scratches, and moss (or, on brass, verdigris). The pattern is laid out in
// each mesh's own space plus its position across the cabinet, so it stays
// put on a bin as the bin slides, and differs from bin to bin.
//
// Without `colonies`, the moss grows in scattered patches, mostly on faces
// that point up. With them (up to four { centre, radius } in cabinet space)
// it grows only in those few clumps, and only on the outside of the
// cabinet: the top, the outer sides and the front, as `outside` describes
// ({ half: outer half-width, top: height of the top, front: depth of the
// front face }).
export function weather(mat, { fade = 0.55, grime = 0.4, moss = 1, mossLo = '#2b3d12', mossHi = '#6b8428', colonies = null, outside = null } = {}) {
  const col = Array.from({ length: 4 }, (_, i) => {
    const c = colonies?.[i];
    return c ? new THREE.Vector4(c.centre[0], c.centre[1], c.centre[2], c.radius) : new THREE.Vector4(0, -100, 0, 0.001);
  });
  const uniforms = {
    uFade: { value: fade }, uGrime: { value: grime }, uMoss: { value: moss },
    uMossLo: { value: new THREE.Color(mossLo) }, uMossHi: { value: new THREE.Color(mossHi) },
    uColoniesOn: { value: colonies ? 1 : 0 }, uColonies: { value: col },
    uOutside: { value: new THREE.Vector3(outside?.half ?? 0, outside?.top ?? 0, outside?.front ?? 0) },
  };
  mat.onBeforeCompile = (shader) => {
    Object.assign(shader.uniforms, uniforms);
    shader.vertexShader = 'varying vec3 vNPos;\nvarying vec3 vONormal;\n' + shader.vertexShader.replace(
      '#include <project_vertex>',
      '#include <project_vertex>\n  vNPos = transformed + vec3(modelMatrix[3].x, modelMatrix[3].y, 0.0);\n  vONormal = normalize(objectNormal);',
    );
    shader.fragmentShader = WEATHER_GLSL + shader.fragmentShader
      .replace('#include <map_fragment>', `#include <map_fragment>
        float wN1 = wFbm(vNPos * 7.0);
        float wN2 = wFbm(vNPos * 26.0 + 3.1);
        float wLum = dot(diffuseColor.rgb, vec3(0.3, 0.59, 0.11));
        diffuseColor.rgb = mix(diffuseColor.rgb, vec3(wLum) * vec3(0.97, 0.94, 0.88), uFade * smoothstep(0.3, 0.75, wN1));
        diffuseColor.rgb *= 1.0 - uGrime * smoothstep(0.45, 0.85, wN2);
        float wSc = wNoise(vNPos * vec3(160.0, 5.0, 160.0) + 11.0);
        diffuseColor.rgb *= 1.0 + 0.4 * uGrime * smoothstep(0.9, 0.97, wSc);
        float wUp = smoothstep(0.3, 0.95, vONormal.y);
        float wMoss;
        if (uColoniesOn > 0.5) {
          // only in the colonies, ragged at their edges, and only outside
          float wC = 0.0;
          for (int i = 0; i < 4; i++) wC = max(wC, 1.0 - distance(vNPos, uColonies[i].xyz) / uColonies[i].w);
          float wOut = max(step(0.5, vONormal.y) * step(uOutside.y, vNPos.y),
                       max(step(0.5, abs(vONormal.x)) * step(uOutside.x, abs(vNPos.x)),
                           step(0.5, vONormal.z) * step(uOutside.z, vNPos.z)));
          wMoss = smoothstep(0.05, 0.4, wC + (wFbm(vNPos * 13.0 + 7.0) - 0.5) * 0.7) * wOut * uMoss;
        } else {
          wMoss = smoothstep(0.56, 0.72, wFbm(vNPos * 11.0 + 7.0)) * mix(0.3, 1.0, wUp) * uMoss;
        }
        wMoss = clamp(wMoss * (0.75 + 0.5 * wNoise(vNPos * 220.0)), 0.0, 1.0);
        diffuseColor.rgb = mix(diffuseColor.rgb, mix(uMossLo, uMossHi, wNoise(vNPos * 140.0)), wMoss);`)
      .replace('#include <roughnessmap_fragment>', '#include <roughnessmap_fragment>\n  roughnessFactor = mix(roughnessFactor, 1.0, wMoss);')
      .replace('#include <metalnessmap_fragment>', '#include <metalnessmap_fragment>\n  metalnessFactor = mix(metalnessFactor, 0.1, wMoss);');
  };
  mat.customProgramCacheKey = () => 'weather';
  mat.needsUpdate = true;
  return mat;
}

// clumps of cushion moss
export function mossMaterial() {
  return new THREE.MeshStandardMaterial({
    map: texture(speckled('#4d6420', 41, { dark: '#1f2c0b', light: '#9bb54a', count: 6000 }), { srgb: true, repeat: [3, 3] }),
    roughness: 1,
  });
}

// what the curios rest on in each bin
export function bedMaterial({ kind = 'velvet', colour = '#3b2a4a' } = {}, seed = 1) {
  if (kind === 'velvet') {
    return new THREE.MeshPhysicalMaterial({ color: colour, roughness: 0.9, sheen: 1, sheenRoughness: 0.45, sheenColor: new THREE.Color(colour).offsetHSL(0, 0, 0.25) });
  }
  if (kind === 'moss') return mossMaterial();
  return new THREE.MeshStandardMaterial({ map: texture(speckled('#c8a866', seed, { dark: '#7a5a2a', light: '#f0dca0', count: 7000 }), { srgb: true, repeat: [2, 2] }), roughness: 1 });
}

// Brushed brass for whole surfaces (the brass demo of the bin cabinet): fine
// streaks running along each piece, and a broad mottle, both in its
// roughness, so the reflections smear along the grain. Each piece keeps its
// own slight tone (vertex colours), like separately cast and polished parts.
export function brushedBrass(colour = '#d4ad6a') {
  const c = document.createElement('canvas');
  c.width = c.height = 256;
  const ctx = c.getContext('2d');
  const base = noise(256, 71, [[4, 0.6], [16, 0.4]]);
  ctx.drawImage(base, 0, 0);
  const r = rng(73);
  for (let i = 0; i < 900; i++) {
    const v = Math.floor(80 + r() * 120);
    ctx.fillStyle = `rgba(${v},${v},${v},0.35)`;
    ctx.fillRect(r() * 256, r() * 256, 0.6 + r(), 20 + r() * 120); // streaks run along v, down each piece
  }
  return new THREE.MeshStandardMaterial({
    color: colour, metalness: 1, roughness: 1, vertexColors: true, envMapIntensity: 3.2,
    roughnessMap: texture(range(c, 0.22, 0.5)),
  });
}

// Polished white marble (the brass demo's knobs): a soft white with a faint
// cloudy mottle, and grey veins wandering across it, finer ones branching
// off, the lot blurred a touch as veins are under a polished surface.
export function whiteMarble() {
  const size = 512;
  const c = document.createElement('canvas');
  c.width = c.height = size;
  const ctx = c.getContext('2d');
  ctx.fillStyle = '#f3f1ec'; ctx.fillRect(0, 0, size, size);
  ctx.globalAlpha = 0.18;
  ctx.drawImage(noise(size, 81, [[4, 0.5], [16, 0.3], [64, 0.2]]), 0, 0);
  ctx.globalAlpha = 1;
  const r = rng(83);
  const vein = (x, y, a, len, w, alpha, depth) => {
    ctx.strokeStyle = `rgba(118,118,124,${alpha})`;
    ctx.lineWidth = w; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(x, y);
    for (let i = 0; i < 40; i++) {
      a += (r() - 0.5) * 0.35;
      x += Math.cos(a) * len / 40; y += Math.sin(a) * len / 40;
      ctx.lineTo(x, y);
      if (depth > 0 && r() < 0.05) vein(x, y, a + (r() - 0.5) * 1.6, len * 0.4, w * 0.5, alpha * 0.8, depth - 1);
    }
    ctx.stroke();
  };
  ctx.filter = 'blur(1.2px)';
  for (let i = 0; i < 5; i++) vein(r() * size, r() * size, r() * Math.PI * 2, 380 + r() * 300, 2.2, 0.55, 2);
  for (let i = 0; i < 9; i++) vein(r() * size, r() * size, r() * Math.PI * 2, 120 + r() * 160, 0.9, 0.35, 1);
  ctx.filter = 'none';
  return new THREE.MeshPhysicalMaterial({
    map: texture(c, { srgb: true }), roughness: 0.12, clearcoat: 0.8, clearcoatRoughness: 0.08, envMapIntensity: 1.4,
  });
}

// ---- Finishes for the apothecary wall (bincabinet.js FINISHES)

// a wood: the scanned veneer, tinted to the species
// knotty pine, drawn rather than scanned, after the reference photo of a
// pine shelving unit. One sheet is `size` px covering `metres` each way and
// wraps across: planks of different widths and tones, each with straight
// grain or the arched "cathedral" grain of a flat-sawn board, and knots from
// small pins to a few big ones, the grain swerving round them, never
// crowding each other.
// The look is tuned by: `knots` per m², `knotScale` (their size), `bigShare`
// (how many are big), `cathedral` (the share of planks with arched grain),
// `spacing` and `contrast` of the grain lines, `wave` (how much they wander),
// `plank` [narrowest, widest] in metres and `amber` (0 pale honey .. 1 aged).
export const PINE_PRESETS = {
  pine1: { knots: 2, knotScale: 0.6, bigShare: 0, cathedral: 0.3, spacing: 1, contrast: 0.8, plank: [0.12, 0.24] },   // clear: barely a knot
  pine2: { knots: 16, knotScale: 1, bigShare: 0.12, cathedral: 0.55, contrast: 1.4 },                                // rustic: knots everywhere
  pine3: { knots: 4, knotScale: 1.5, bigShare: 0.35, cathedral: 0.5 },                                                // a few big knots
  pine4: { knots: 40, knotScale: 0.35, bigShare: 0, cathedral: 0.4 },                                                // pin knots, scattered
  pine5: { knots: 6, cathedral: 1, contrast: 1.5, plank: [0.14, 0.26] },                                             // all cathedral arches
  pine6: { knots: 4, cathedral: 0, spacing: 0.45, contrast: 1.4, wave: 0.3 },                                         // tight straight grain
  pine7: { knots: 8, knotScale: 1.3, cathedral: 0.6, spacing: 2.4, wave: 3.5, contrast: 1.3 },                         // wide, wild grain
  pine8: { knots: 12, cathedral: 0.5, plank: [0.04, 0.08], amber: 1, contrast: 1.2 },                                  // narrow aged amber boards
  raw: { knots: 0, cathedral: 0.5, contrast: 2.4, natural: true },                                                     // raw, unfinished pine: no knots, clear grain
};

export function knottyPineMap({ seed = 11, size = 2048, metres = 0.9, knots: perM2 = 8, knotScale = 1, bigShare = 0.08,
  cathedral = 0.55, spacing = 1, contrast = 1, wave: waveK = 1, plank = [0.07, 0.21], amber = 0, natural = false } = {}) {
  const W = size, c = document.createElement('canvas');
  c.width = c.height = W;
  const g = c.getContext('2d');
  let s = seed;
  const r = () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296);
  const pxPerM = W / metres;

  // the knots first, so the grain can bend round them
  const knots = [], count = Math.round(perM2 * metres * metres);
  for (let tries = 0; knots.length < count && tries < count * 60; tries++) {
    const roll = r();
    const radM = knotScale * (roll < 0.65 ? 0.007 + r() * 0.009 : roll < 1 - bigShare ? 0.016 + r() * 0.012 : 0.03 + r() * 0.016);
    const k = { x: r() * W, y: r() * W, rad: radM * pxPerM, stretch: 1.1 + r() * 0.8, tilt: (r() - 0.5) * 0.5 };
    const clear = knots.every((o) => {
      const dx = Math.min(Math.abs(k.x - o.x), W - Math.abs(k.x - o.x)), dy = Math.min(Math.abs(k.y - o.y), W - Math.abs(k.y - o.y));
      return Math.hypot(dx, dy) > (k.rad + o.rad) * 4;
    });
    if (clear) knots.push(k);
  }
  const all = knots.flatMap((k) => [-W, 0, W].flatMap((ox) => [-W, 0, W].map((oy) => ({ ...k, x: k.x + ox, y: k.y + oy }))));
  const bend = (x, y) => {
    let dx = 0;
    for (const k of all) {
      const ex = x - k.x, ey = (y - k.y) / k.stretch, d2 = ex * ex + ey * ey, R = k.rad * 3.2;
      if (d2 < R * R * 9) dx += Math.sign(ex || 1) * k.rad * 1.9 * Math.exp(-d2 / (R * R));
    }
    return dx;
  };
  const line = (pts, colour, width) => {
    g.strokeStyle = colour; g.lineWidth = width; g.beginPath();
    pts.forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y)));
    g.stroke();
  };
  // reddish-brown lines on honey pine, or (`natural`) plain brown on pale raw wood
  const grainColour = natural
    ? (a) => `rgba(${112 + r() * 22},${94 + r() * 18},${64 + r() * 14},${a})`
    : (a) => `rgba(${140 + r() * 40},${85 + r() * 30},${40 + r() * 22},${a})`;

  // the planks, edge to edge across the sheet
  let px0 = 0;
  while (px0 < W) {
    const pw = Math.min(W - px0, (plank[0] + r() * (plank[1] - plank[0])) * pxPerM);
    const x0 = px0, x1 = px0 + pw;
    px0 = x1;
    if (W - px0 < 0.04 * pxPerM) { px0 = W; }
    const right = px0 === W ? W : x1;
    g.save(); g.beginPath(); g.rect(x0, 0, right - x0, W); g.clip();
    // each plank its own shade of honey
    const tone = natural
      ? [226 + r() * 14, 210 + r() * 14, 174 + r() * 16]
      : [218 + r() * 22 - amber * 30, 178 + r() * 26 - amber * 55, 122 + r() * 30 - amber * 70];
    g.fillStyle = `rgb(${tone[0]},${tone[1]},${tone[2]})`; g.fillRect(x0, 0, right - x0, W);
    for (let i = 0; i < 6; i++) {
      g.fillStyle = r() < 0.5 ? 'rgba(255,245,225,0.07)' : (natural ? 'rgba(130,110,80,0.08)' : 'rgba(150,95,45,0.07)');
      g.fillRect(x0 + r() * (right - x0), 0, 6 + r() * 40, W);
    }
    // straight grain: lines down the plank, unevenly spaced, wandering a little
    const wave = r() * 6 * waveK, freq = 1 + r() * 3;
    for (let x = x0 + r() * 4; x < right; x += (3 + r() * (r() < 0.2 ? 14 : 6)) * spacing) {
      const pts = [];
      for (let y = -8; y <= W + 8; y += 10) pts.push([x + Math.sin((y / W) * Math.PI * 2 * freq + x * 0.013) * wave + bend(x, y), y]);
      const strong = r() < 0.15;
      line(pts, grainColour(Math.min(0.9, (strong ? 0.28 + r() * 0.15 : 0.06 + r() * 0.18) * contrast)), strong ? 1.6 + r() * 2.2 : 0.7 + r() * 0.8);
    }
    // cathedral grain on about half the planks: nested arches, open downward
    if (r() < cathedral) {
      const arches = 1 + Math.floor(r() * 2);
      for (let k = 0; k < arches; k++) {
        const cx = x0 + (right - x0) * (0.3 + r() * 0.4), apex = r() * W, step = 7 + r() * 9;
        const n = Math.floor(((right - x0) / 2) / step);
        for (let i = 1; i <= n; i++) {
          const half = i * step, tall = half * (4 + r() * 3 + i * 0.4), pts = [];
          for (let t = -1; t <= 1.0001; t += 0.05) {
            const x = cx + t * half, y = apex + (1 - Math.cos((t * Math.PI) / 2)) * 0 + tall * t * t;
            pts.push([x + bend(x, y), y]);
          }
          line(pts, grainColour(Math.min(0.9, (0.12 + r() * 0.22) * contrast)), i % 3 === 0 ? 1.8 : 1);
        }
      }
    }
    g.restore();
    // the joint between planks
    if (right < W) line([[right, 0], [right, W]], 'rgba(120,75,35,0.18)', 1.2);
  }

  // the knots themselves: rings of darker wood, a soft brown heart
  for (const k of all) {
    if (k.x < -k.rad * 4 || k.x > W + k.rad * 4 || k.y < -k.rad * 4 || k.y > W + k.rad * 4) continue;
    g.save(); g.translate(k.x, k.y); g.rotate(k.tilt);
    const ell = (rr, fill, stroke, width) => {
      g.beginPath(); g.ellipse(0, 0, rr, rr * k.stretch, 0, 0, Math.PI * 2);
      if (fill) { g.fillStyle = fill; g.fill(); }
      if (stroke) { g.strokeStyle = stroke; g.lineWidth = width; g.stroke(); }
    };
    // fine growth rings just outside, then the knot: a clean edge, darker
    // inside, a dark heart, and a sharp outline where it meets the board
    for (let i = 3; i >= 1; i--) ell(k.rad * (1 + i * 0.32), null, `rgba(140,85,38,${0.18 + 0.08 * (3 - i)})`, Math.max(1.2, k.rad * 0.035));
    ell(k.rad, '#a8703a');
    ell(k.rad * 0.72, '#83522a');
    ell(k.rad * 0.38, '#5a3518');
    ell(k.rad, null, 'rgba(60,32,12,0.85)', Math.max(1.5, k.rad * 0.06));
    // big knots sometimes carry a fine check across them
    if (k.rad > 0.02 * pxPerM && r() < 0.5) line([[-k.rad * 0.7, -k.rad * 0.1], [k.rad * 0.6, k.rad * 0.15]], 'rgba(40,20,8,0.6)', Math.max(1.2, k.rad * 0.04));
    g.restore();
  }
  return texture(c, { srgb: true });
}

// Zellige: handmade glazed squares in creams and pale beiges, a sheet of
// N x N of them, each its own shade, the thick glaze pooling darker toward
// the edges and rippled across the face, thin pale grout between. Returns
// the colour map and a height map for the glaze's uneven surface.
export function zelligeMaps({ n = 4, px = 256, seed = 61 } = {}) {
  const W = n * px;
  const col = document.createElement('canvas'), hgt = document.createElement('canvas');
  col.width = col.height = hgt.width = hgt.height = W;
  const g = col.getContext('2d'), h = hgt.getContext('2d');
  let s = seed;
  const r = () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296);
  const grout = Math.max(2, Math.round(px * 0.016)); // tight joints
  g.fillStyle = '#e3d5bd'; g.fillRect(0, 0, W, W);     // the grout, a light beige
  h.fillStyle = '#202020'; h.fillRect(0, 0, W, W);     // set back below the tiles
  for (let ty = 0; ty < n; ty++) for (let tx = 0; tx < n; tx++) {
    const x0 = tx * px + grout / 2, y0 = ty * px + grout / 2, sz = px - grout;
    // each tile its own cream: some warmer, some paler, now and then a deeper beige
    // a warm, beige off-white, each tile a touch different
    const t = r(), base = t < 0.3 ? [238, 226, 205] : t < 0.7 ? [243, 233, 214] : [247, 239, 223]; // beige off-white
    const v = (r() - 0.5) * 5;
    g.fillStyle = `rgb(${base[0] + v},${base[1] + v},${base[2] + v * 0.8})`;
    g.fillRect(x0, y0, sz, sz);
    // the glaze pools darker toward the edges
    const edge = g.createRadialGradient(x0 + sz / 2, y0 + sz / 2, sz * 0.25, x0 + sz / 2, y0 + sz / 2, sz * 0.75);
    edge.addColorStop(0, 'rgba(0,0,0,0)'); edge.addColorStop(1, `rgba(200,180,150,${0.06 + r() * 0.06})`);
    g.fillStyle = edge; g.fillRect(x0, y0, sz, sz);
    // soft clouds of thicker and thinner glaze across the face
    g.save(); g.beginPath(); g.rect(x0, y0, sz, sz); g.clip(); g.filter = 'blur(14px)';
    for (let i = 0; i < 3; i++) {
      g.fillStyle = r() < 0.7 ? 'rgba(255,253,248,0.35)' : 'rgba(225,210,185,0.08)';
      g.beginPath(); g.ellipse(x0 + r() * sz, y0 + r() * sz, sz * (0.1 + r() * 0.3), sz * (0.06 + r() * 0.2), r() * 3, 0, Math.PI * 2); g.fill();
    }
    g.restore();
    // the height: a pillowed tile, higher in the middle, rippled and a little tilted
    h.save(); h.beginPath(); h.rect(x0, y0, sz, sz); h.clip();
    const pillow = h.createRadialGradient(x0 + sz * (0.4 + r() * 0.2), y0 + sz * (0.4 + r() * 0.2), 0, x0 + sz / 2, y0 + sz / 2, sz * 0.8);
    pillow.addColorStop(0, '#d0d0d0'); pillow.addColorStop(0.75, '#b8b8b8'); pillow.addColorStop(1, '#8c8c8c');
    h.fillStyle = pillow; h.fillRect(x0, y0, sz, sz);
    // a gentle, glassy undulation rather than lumps
    h.filter = 'blur(12px)';
    for (let i = 0; i < 5; i++) {
      const c = Math.round(150 + r() * 80);
      h.fillStyle = `rgba(${c},${c},${c},0.25)`;
      h.beginPath(); h.ellipse(x0 + r() * sz, y0 + r() * sz, sz * (0.05 + r() * 0.18), sz * (0.04 + r() * 0.12), r() * 3, 0, Math.PI * 2); h.fill();
    }
    h.restore();
  }
  // ripples in the glaze, as it settled: soft, uneven rings spreading from
  // a point or two on each tile, like the surface of still water
  for (let ty = 0; ty < n; ty++) for (let tx = 0; tx < n; tx++) {
    const x0 = tx * px + grout / 2, y0 = ty * px + grout / 2, sz = px - grout;
    h.save(); h.beginPath(); h.rect(x0, y0, sz, sz); h.clip(); h.filter = 'blur(5px)';
    for (let c = 0; c < 2; c++) {
      const cx = x0 + sz * (0.2 + r() * 0.6), cy = y0 + sz * (0.2 + r() * 0.6), step = 9 + r() * 7, ph = r() * 6;
      for (let rad = step; rad < sz * 1.2; rad += step) {
        const fade = Math.max(0, 1 - rad / (sz * 1.2));
        h.strokeStyle = `rgba(${rad % (step * 2) < step ? '235,235,235' : '40,40,40'},${0.08 * fade})`; h.lineWidth = step * 0.6;
        h.beginPath();
        for (let a = 0; a <= Math.PI * 2 + 0.01; a += 0.12) {
          const rr = rad * (1 + 0.08 * Math.sin(a * 3 + ph) + 0.05 * Math.sin(a * 5 + c));
          const x = cx + Math.cos(a) * rr, y = cy + Math.sin(a) * rr * 0.9;
          a === 0 ? h.moveTo(x, y) : h.lineTo(x, y);
        }
        h.stroke();
      }
    }
    h.restore();
  }
  // the height turned into a normal map, so reflections bend across the ripples
  const src = h.getImageData(0, 0, W, W).data, nrm = document.createElement('canvas');
  nrm.width = nrm.height = W;
  const nc = nrm.getContext('2d'), out = nc.createImageData(W, W), d = out.data;
  const at = (x, y) => src[(((y + W) % W) * W + ((x + W) % W)) * 4] / 255;
  const strength = 3;
  for (let y = 0; y < W; y++) for (let x = 0; x < W; x++) {
    const dx = (at(x + 1, y) - at(x - 1, y)) * strength, dy = (at(x, y + 1) - at(x, y - 1)) * strength;
    const len = Math.hypot(dx, dy, 1), i = (y * W + x) * 4;
    d[i] = Math.round((-dx / len * 0.5 + 0.5) * 255);
    d[i + 1] = Math.round((dy / len * 0.5 + 0.5) * 255);
    d[i + 2] = Math.round((1 / len * 0.5 + 0.5) * 255);
    d[i + 3] = 255;
  }
  nc.putImageData(out, 0, 0);
  const map = texture(col, { srgb: true }), bump = texture(hgt), normal = texture(nrm);
  return { map, bump, normal };
}

// One square tile of the back of the cells: honed white marble with a
// thin grout line round it, and a quarter of a mother-of-pearl quatrefoil
// in each corner, so wherever four tiles meet a whole quatrefoil forms.
export function pearlTileMap({ size = 512 } = {}) {
  const W = size, c = document.createElement('canvas');
  c.width = c.height = W;
  const g = c.getContext('2d');
  let s = 53;
  const r = () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296);
  // the marble: warm white, faint grey veins, a little cloud
  g.fillStyle = '#f2e7d6'; g.fillRect(0, 0, W, W);
  g.save(); g.filter = 'blur(10px)';
  for (let i = 0; i < 14; i++) { g.fillStyle = r() < 0.5 ? 'rgba(222,204,178,0.18)' : 'rgba(255,250,240,0.35)'; g.beginPath(); g.ellipse(r() * W, r() * W, 30 + r() * 90, 20 + r() * 60, r() * 3, 0, Math.PI * 2); g.fill(); }
  g.restore();
  g.strokeStyle = 'rgba(180,160,130,0.22)'; g.lineWidth = 1;
  for (let i = 0; i < 4; i++) {
    let x = r() * W, y = r() * W, a = r() * Math.PI * 2;
    g.beginPath(); g.moveTo(x, y);
    for (let k = 0; k < 30; k++) { a += (r() - 0.5) * 0.5; x += Math.cos(a) * 14; y += Math.sin(a) * 14; g.lineTo(x, y); }
    g.stroke();
  }
  // the quatrefoils: four lobes round each corner, filled with pearl
  const R = W * 0.1; // one lobe's radius
  const lobes = (cx, cy) => [[1, 0], [-1, 0], [0, 1], [0, -1]].map(([dx, dy]) => [cx + dx * R * 0.95, cy + dy * R * 0.95]);
  const pearl = (cx, cy) => {
    const grad = g.createLinearGradient(cx - R * 2, cy - R * 2, cx + R * 2, cy + R * 2);
    grad.addColorStop(0, '#fbf8f2'); grad.addColorStop(0.3, '#ece7f0'); grad.addColorStop(0.5, '#fdfcf8');
    grad.addColorStop(0.7, '#e6efec'); grad.addColorStop(1, '#f6eee6');
    g.fillStyle = grad;
    for (const [x, y] of lobes(cx, cy)) { g.beginPath(); g.arc(x, y, R, 0, Math.PI * 2); g.fill(); }
    // the shell's layered sheen: a few soft bands, and the pieces' seams
    g.save(); g.beginPath(); for (const [x, y] of lobes(cx, cy)) { g.moveTo(x + R, y); g.arc(x, y, R, 0, Math.PI * 2); } g.clip();
    for (let i = 0; i < 6; i++) { g.strokeStyle = `rgba(${r() < 0.5 ? '210,200,225' : '255,255,255'},0.5)`; g.lineWidth = 2 + r() * 4; g.beginPath(); g.moveTo(cx - R * 2, cy - R * 2 + i * R * 0.8); g.lineTo(cx + R * 2, cy - R * 1.2 + i * R * 0.8); g.stroke(); }
    g.strokeStyle = 'rgba(190,182,170,0.6)'; g.lineWidth = 1.2;
    g.beginPath(); g.moveTo(cx - R * 2, cy); g.lineTo(cx + R * 2, cy); g.moveTo(cx, cy - R * 2); g.lineTo(cx, cy + R * 2); g.stroke();
    g.restore();
    // the grout round the inlay
    g.strokeStyle = '#c6b499'; g.lineWidth = 5;
    for (const [x, y] of lobes(cx, cy)) { g.beginPath(); g.arc(x, y, R, 0, Math.PI * 2); g.stroke(); }
  };
  for (const [x, y] of [[0, 0], [W, 0], [0, W], [W, W]]) pearl(x, y);
  // the grout between tiles, along the edges (half on each tile)
  g.fillStyle = '#cdbb9f';
  g.fillRect(0, 0, W, 3); g.fillRect(0, W - 3, W, 3); g.fillRect(0, 0, 3, W); g.fillRect(W - 3, 0, 3, W);
  const t = texture(c, { srgb: true });
  return t;
}

// limestone for the back of the shelving: pale dressed blocks laid in
// courses, finely speckled, with faint bedding lines and soft patches of
// darker and lighter stone, the joints thin. `size` px covering `metres`.
export function limestoneMap({ seed = 41, size = 2048, metres = 1.8 } = {}) {
  const W = size, c = document.createElement('canvas');
  c.width = c.height = W;
  const g = c.getContext('2d');
  let s = seed;
  const r = () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296);
  const pxPerM = W / metres;
  g.fillStyle = '#eadcc1'; g.fillRect(0, 0, W, W);
  // the courses: rows 0.3 m high, blocks 0.45-0.8 m long, each a shade of its own
  const rowH = 0.3 * pxPerM, rows = Math.round(W / rowH), rh = W / rows;
  for (let row = 0; row < rows; row++) {
    let x = -r() * 0.5 * pxPerM;
    while (x < W) {
      const bw = (0.45 + r() * 0.35) * pxPerM, y = row * rh, t = (r() - 0.5) * 16;
      g.fillStyle = `rgb(${234 + t},${220 + t},${193 + t * 0.9})`;
      g.fillRect(x, y, bw, rh);
      // the block drawn again a sheet away too, so the edges wrap
      if (x + bw > W) g.fillRect(x - W, y, bw, rh);
      // joints: a thin shadowed line along the top and the left of each block
      g.fillStyle = 'rgba(120,105,82,0.55)';
      g.fillRect(x, y, bw, 2); g.fillRect(x, y, 2, rh);
      if (x + bw > W) { g.fillRect(x - W, y, bw, 2); g.fillRect(x - W, y, 2, rh); }
      g.fillStyle = 'rgba(255,252,244,0.5)';
      g.fillRect(x, y + 2, bw, 1);
      x += bw;
    }
  }
  // soft clouds of darker and lighter stone
  g.save(); g.filter = 'blur(26px)';
  for (let i = 0; i < 70; i++) {
    g.fillStyle = r() < 0.5 ? 'rgba(170,150,118,0.12)' : 'rgba(250,246,236,0.16)';
    g.beginPath(); g.ellipse(r() * W, r() * W, 40 + r() * 160, 20 + r() * 60, 0, 0, Math.PI * 2); g.fill();
  }
  g.restore();
  // faint bedding lines running across, and the fine speckle of the stone
  for (let i = 0; i < 40; i++) {
    const y = r() * W;
    g.strokeStyle = `rgba(175,150,110,${0.03 + r() * 0.05})`; g.lineWidth = 1 + r() * 2; g.beginPath();
    for (let x = 0; x <= W; x += 32) g.lineTo(x, y + Math.sin(x * 0.004 + i) * 4);
    g.stroke();
  }
  for (let i = 0; i < 26000; i++) {
    g.fillStyle = r() < 0.6 ? `rgba(140,122,95,${0.15 + r() * 0.25})` : `rgba(255,252,245,${0.25 + r() * 0.3})`;
    g.fillRect(r() * W, r() * W, 1 + r() * 1.6, 1 + r() * 1.6);
  }
  // a few tiny fossil pits
  for (let i = 0; i < 60; i++) {
    g.fillStyle = 'rgba(120,102,78,0.45)';
    g.beginPath(); g.ellipse(r() * W, r() * W, 1.5 + r() * 4, 1 + r() * 2.5, r() * 3, 0, Math.PI * 2); g.fill();
  }
  return texture(c, { srgb: true });
}

// a sheet of wood for the wall in any of the grains (woodGrains.js); knotty
// pine is drawn above
export function woodSheet(style = 'knotty', { seed = 11, size = 2048, metres = 0.9 } = {}) {
  if (style === 'knotty') return knottyPineMap({ seed, size, metres });
  if (PINE_PRESETS[style]) return knottyPineMap({ seed, size, metres, ...PINE_PRESETS[style] });
  const c = document.createElement('canvas');
  c.width = c.height = size;
  let s = seed;
  drawGrain(style, c.getContext('2d'), size, () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296));
  return texture(c, { srgb: true });
}

export function knottyPine() {
  const nor = scans.ashNor.clone();
  nor.center.set(0.5, 0.5); nor.rotation = Math.PI / 2; nor.needsUpdate = true;
  // the boards' UVs run one unit per 0.45 m (cabinet.js); the sheet covers 0.9 m
  const map = knottyPineMap();
  map.repeat.set(0.45 / 0.9, 0.45 / 0.9);
  return new THREE.MeshStandardMaterial({
    color: '#ffffff', vertexColors: true, // each piece keeps its own tone (cabinet.js)
    map, roughness: 0.72,
    normalMap: nor, normalScale: new THREE.Vector2(0.25, 0.25),
  });
}

export function woodFinish(tint, { normal = 0.5, rough = 0.7 } = {}) {
  return scanned({ tint, normal, rough });
}

// painted wood: a flat colour, the grain just showing through the paint as
// texture in the surface, a soft eggshell sheen
export function painted(colour, { rough = 0.55 } = {}) {
  const nor = scans.ashNor.clone();
  nor.center.set(0.5, 0.5); nor.rotation = Math.PI / 2; nor.needsUpdate = true;
  return new THREE.MeshStandardMaterial({
    color: colour, vertexColors: true, roughness: rough,
    normalMap: nor, normalScale: new THREE.Vector2(0.22, 0.22),
  });
}
