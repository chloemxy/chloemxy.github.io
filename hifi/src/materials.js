// Finishes for an old shop cabinet: oiled elm from a scanned veneer, paler
// unfinished wood inside the drawers, softly aged brass, blown glass, cork,
// and the dried contents of the jars. As in the Corner newsstand, the
// scanned maps are CC0 (see assets/tex/CREDITS.md) and the rest is painted
// from seeded noise, so the wear is the same on every load.

import * as THREE from 'three';

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
// knotty pine, drawn rather than scanned: pale honey boards, the grain
// running down their length and swerving round dark knots, after the
// reference photo of a pine shelving unit. One tile is 0.45 m square
// (cabinet.js TILE) and wraps seamlessly.
// `size` px for `tiles` tiles each way, with `knots` knots across it
export function knottyPineMap({ seed = 11, size = 1024, knots: count = 5 } = {}) {
  const W = size, c = document.createElement('canvas');
  c.width = c.height = W;
  const g = c.getContext('2d');
  let s = seed;
  const r = () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296);
  g.fillStyle = '#dcb98a'; g.fillRect(0, 0, W, W);
  // soft lighter and darker streaks along the boards
  for (let i = 0; i < 40; i++) {
    g.fillStyle = r() < 0.5 ? 'rgba(255,240,215,0.08)' : 'rgba(160,105,55,0.07)';
    g.fillRect(r() * W, 0, 10 + r() * 60, W);
  }
  // the knots, each drawn again a tile away so the edges wrap
  const knots = Array.from({ length: count }, () => ({ x: r() * W, y: r() * W, rad: (12 + r() * 16) * (W / 1024) ** 0.5, stretch: 1.15 + r() * 0.6 }));
  const near = (x, y) => knots.flatMap((k) => [-W, 0, W].flatMap((ox) => [-W, 0, W].map((oy) => ({ ...k, x: k.x + ox, y: k.y + oy }))));
  const all = near();
  // grain lines: each runs top to bottom, pushed sideways round the knots
  for (let x = 0; x < W; x += 3 + r() * 5) {
    const a = 0.08 + r() * 0.3, wide = r() < 0.14;
    g.strokeStyle = `rgba(${150 + r() * 30},${92 + r() * 25},${45 + r() * 20},${wide ? a * 1.4 : a})`;
    g.lineWidth = wide ? 2 + r() * 2 : 0.8 + r() * 0.9;
    g.beginPath();
    for (let y = -4; y <= W + 4; y += 8) {
      let dx = Math.sin(y / W * Math.PI * 2 * 2 + x * 0.01) * 3;
      for (const k of all) {
        const ex = x - k.x, ey = (y - k.y) / k.stretch, d2 = ex * ex + ey * ey, R = k.rad * 4;
        if (d2 < R * R * 9) dx += Math.sign(ex || 1) * k.rad * 2.2 * Math.exp(-d2 / (R * R));
      }
      if (y < 0) g.moveTo(x + dx, y); else g.lineTo(x + dx, y);
    }
    g.stroke();
  }
  for (const k of all) {
    if (k.x < -60 || k.x > W + 60 || k.y < -60 || k.y > W + 60) continue;
    // rings of darker wood round the knot, then the knot itself
    for (let i = 3; i >= 1; i--) {
      g.strokeStyle = `rgba(150,90,40,${0.12 + 0.06 * (3 - i)})`; g.lineWidth = 2;
      g.beginPath(); g.ellipse(k.x, k.y, k.rad * (1 + i * 0.55), k.rad * k.stretch * (1 + i * 0.7), 0, 0, Math.PI * 2); g.stroke();
    }
    // a soft brown knot, darkest in a small heart, not a hole
    const grad = g.createRadialGradient(k.x, k.y, 0, k.x, k.y, k.rad * 1.15);
    grad.addColorStop(0, '#4a2a12'); grad.addColorStop(0.3, '#6e4220'); grad.addColorStop(0.65, '#9a6634'); grad.addColorStop(1, 'rgba(175,115,60,0)');
    g.fillStyle = grad;
    g.beginPath(); g.ellipse(k.x, k.y, k.rad * 1.15, k.rad * 1.15 * k.stretch, 0, 0, Math.PI * 2); g.fill();
  }
  return texture(c, { srgb: true });
}

export function knottyPine() {
  const nor = scans.ashNor.clone();
  nor.center.set(0.5, 0.5); nor.rotation = Math.PI / 2; nor.needsUpdate = true;
  return new THREE.MeshStandardMaterial({
    color: '#ffffff', vertexColors: true, // each piece keeps its own tone (cabinet.js)
    map: knottyPineMap(), roughness: 0.72,
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
