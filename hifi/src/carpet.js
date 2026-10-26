// A plain white wool carpet: short cut pile, so from across the room it is a
// soft, matt surface with only a fine grain and faint patches where the pile
// lies differently. One plane: a colour texture of tiny fibre-ends and a bump
// map from the same field, mipmapped so it stays smooth in the distance, and
// a velvety sheen at grazing angles, as wool has.

import * as THREE from 'three';

function seeded(seed) {
  let s = seed >>> 0 || 1;
  return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296);
}

// The pile's surface as one tile: `colour` (near-white, faintly mottled) and
// `bump` (the fibre-ends standing up from the backing). Whole waves per
// tile, so it repeats without seams.
function pile(r, size = 512) {
  // broad patches, a hand's width or two across
  const waves = Array.from({ length: 4 }, () => [2 + Math.floor(r() * 4), 2 + Math.floor(r() * 4), r() * 7, r() * 7]);
  const patch = (x, y) => waves.reduce((s, [kx, ky, px, py]) =>
    s + Math.sin(x / size * Math.PI * 2 * kx + px) * Math.sin(y / size * Math.PI * 2 * ky + py), 0) / waves.length;
  // smooth noise on a grid of `cell` pixels, wrapped: the yarn clumps
  const noise = (cell) => {
    const n = size / cell, g = Array.from({ length: n * n }, () => r() - 0.5);
    const at = (i, j) => g[((j + n) % n) * n + ((i + n) % n)];
    return (x, y) => {
      const fx = x / cell, fy = y / cell, i = Math.floor(fx), j = Math.floor(fy);
      const u = fx - i, v = fy - j, su = u * u * (3 - 2 * u), sv = v * v * (3 - 2 * v);
      return (at(i, j) * (1 - su) + at(i + 1, j) * su) * (1 - sv) + (at(i, j + 1) * (1 - su) + at(i + 1, j + 1) * su) * sv;
    };
  };
  const tufts = noise(4), clumps = noise(16);
  const colour = new ImageData(size, size), bump = new ImageData(size, size);
  const c = colour.data, b = bump.data;
  for (let y = 0; y < size; y++) for (let x = 0; x < size; x++) {
    const k = (y * size + x) * 4, p = patch(x, y);
    // the yarn's tufts, a few millimetres across, gathered in larger clumps,
    // and each pixel a fibre-end a little higher or lower
    const tip = tufts(x, y) * 0.7 + clumps(x, y) * 0.5 + (r() - 0.5) * 0.25;
    const v = 226 + p * 10 + tip * 70;
    c[k] = v; c[k + 1] = v - 2; c[k + 2] = v - 6; c[k + 3] = 255;
    const h = 128 + tip * 250 + p * 20;
    b[k] = b[k + 1] = b[k + 2] = h; b[k + 3] = 255;
  }
  const tex = (img, srgb) => {
    const cv = document.createElement('canvas');
    cv.width = cv.height = size;
    cv.getContext('2d').putImageData(img, 0, 0);
    const t = new THREE.CanvasTexture(cv);
    if (srgb) t.colorSpace = THREE.SRGBColorSpace;
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    t.anisotropy = 16;
    return t;
  };
  return { colour: tex(colour, true), bump: tex(bump, false) };
}

// Lays the carpet: `x` its half-width, `z` its back and front edges, `tile`
// the metres one texture covers.
export function carpet(scene, { x = 8, z = [-0.5, 7.5], tile = 0.6, seed = 4 } = {}) {
  const W = x * 2, D = z[1] - z[0];
  const geo = new THREE.PlaneGeometry(W, D).rotateX(-Math.PI / 2);
  const uv = geo.attributes.uv;
  for (let i = 0; i < uv.count; i++) uv.setXY(i, uv.getX(i) * W / tile, uv.getY(i) * D / tile);
  const { colour, bump } = pile(seeded(seed));
  const mat = new THREE.MeshPhysicalMaterial({
    color: '#ebe7e1', map: colour, bumpMap: bump, bumpScale: 5, roughness: 1,
    sheen: 0.6, sheenRoughness: 0.8, sheenColor: new THREE.Color('#ffffff'),
  });
  const floor = new THREE.Mesh(geo, mat);
  floor.name = 'carpet';
  floor.position.set(0, 0, (z[0] + z[1]) / 2);
  floor.receiveShadow = true;
  scene.add(floor);
  return floor;
}
