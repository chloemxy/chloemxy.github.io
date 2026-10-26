// A low zen rock garden in the foreground: a bed of pale raked gravel inside
// a low dark border, a few weathered rocks set in it with the gravel raked
// in rings round each, and cushions of moss at their feet. The raking is
// drawn per pixel: straight furrows across the bed, bending into concentric
// rings near each rock, used for both the gravel's colour and its relief, so
// the furrows catch the low sun.

import * as THREE from 'three';
import { mossMaterial } from './materials.js';

function seeded(seed) {
  let s = seed >>> 0 || 1;
  return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296);
}

// a lumpy boulder: an icosphere pushed in and out by a few smooth waves,
// flattened at the bottom where it sits in the gravel
export function rock(r, size, colour) {
  const g = new THREE.IcosahedronGeometry(1, 6);
  const p = g.attributes.position;
  const waves = Array.from({ length: 5 }, () => [new THREE.Vector3(r() - 0.5, r() - 0.5, r() - 0.5).normalize(), 1.5 + r() * 3, r() * 6, 0.05 + r() * 0.1]);
  const v = new THREE.Vector3();
  for (let i = 0; i < p.count; i++) {
    v.fromBufferAttribute(p, i);
    let k = 1;
    for (const [dir, f, ph, a] of waves) k += Math.sin(v.dot(dir) * f + ph) * a;
    v.multiplyScalar(k);
    v.y = Math.max(v.y, -0.25);
    p.setXYZ(i, v.x, v.y, v.z);
  }
  g.computeVertexNormals();
  g.scale(size[0], size[1], size[2]);
  const m = new THREE.Mesh(g, new THREE.MeshStandardMaterial({ color: colour, roughness: 0.92, flatShading: false }));
  m.castShadow = m.receiveShadow = true;
  return m;
}

// Builds the garden: `x` its half-width, `z` its near and far edges (the far
// edge toward the shelving).
export function zenGarden(scene, { x = 4.6, z = [0.7, 3.4], seed = 3 } = {}) {
  const r = seeded(seed);
  const group = new THREE.Group();
  group.name = 'zen_garden';
  const W = x * 2, D = z[1] - z[0], cz = (z[0] + z[1]) / 2;

  // rocks, in bed coordinates (metres from the bed's centre)
  const stones = [
    { at: [-1.15, -0.05], size: [0.24, 0.17, 0.19], ring: 0.48 },
    { at: [-0.62, 0.38], size: [0.1, 0.07, 0.085], ring: 0.24 },
    { at: [1.05, -0.2], size: [0.19, 0.21, 0.16], ring: 0.42 },
    { at: [0.3, 0.62], size: [0.08, 0.055, 0.07], ring: 0.2 },
  ];

  // the raking: furrows along x, bending into rings round each rock
  const PX = 2048, PY = Math.round(PX * D / W);
  const c = document.createElement('canvas');
  c.width = PX; c.height = PY;
  const ctx = c.getContext('2d');
  const img = ctx.createImageData(PX, PY);
  const spacing = 0.045; // metres between furrows
  for (let j = 0; j < PY; j++) {
    for (let i = 0; i < PX; i++) {
      const bx = (i / PX - 0.5) * W, bz = (j / PY - 0.5) * D;
      let phase = bz / spacing, near = Infinity;
      for (const s of stones) {
        const d = Math.hypot(bx - s.at[0], bz - s.at[1]);
        const edge = Math.max(s.size[0], s.size[2]) * 1.05;
        if (d < s.ring && d - edge < near) { near = d - edge; phase = Math.max(0, d - edge) / spacing; }
      }
      const groove = 0.5 + 0.5 * Math.cos(phase * Math.PI * 2);
      const grain = (Math.random() - 0.5) * 18;
      const v = 188 + groove * 58 + grain;
      const o = (j * PX + i) * 4;
      img.data[o] = v; img.data[o + 1] = v - 6; img.data[o + 2] = v - 18; img.data[o + 3] = 255;
    }
  }
  ctx.putImageData(img, 0, 0);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 8;
  const bump = new THREE.CanvasTexture(c);
  const gravel = new THREE.Mesh(
    new THREE.PlaneGeometry(W, D).rotateX(-Math.PI / 2),
    new THREE.MeshStandardMaterial({ map: tex, bumpMap: bump, bumpScale: 4, roughness: 0.95 }),
  );
  gravel.position.set(0, 0.07, cz);
  gravel.receiveShadow = true;
  group.add(gravel);

  // a low border of dark stained timber
  const border = new THREE.MeshStandardMaterial({ color: '#3b332c', roughness: 0.7 });
  const edge = (w, d, px, pz) => {
    const m = new THREE.Mesh(new THREE.BoxGeometry(w, 0.1, d), border);
    m.position.set(px, 0.05, pz);
    m.castShadow = m.receiveShadow = true;
    group.add(m);
  };
  edge(W + 0.2, 0.1, 0, z[0] - 0.05);
  edge(W + 0.2, 0.1, 0, z[1] + 0.05);
  edge(0.1, D, -x - 0.05, cz);
  edge(0.1, D, x + 0.05, cz);

  // the rocks, sunk a little into the gravel, with moss at their feet
  const moss = mossMaterial();
  for (const s of stones) {
    const m = rock(r, s.size, ['#6d675f', '#5c5752', '#7a7368', '#625b53'][Math.floor(r() * 4)]);
    m.position.set(s.at[0], 0.07 + s.size[1] * 0.15, cz + s.at[1]);
    m.rotation.y = r() * Math.PI * 2;
    group.add(m);
    for (let i = 0; i < 4; i++) {
      const a = r() * Math.PI * 2, d = Math.max(s.size[0], s.size[2]) * (0.85 + r() * 0.2);
      const tuft = new THREE.Mesh(new THREE.SphereGeometry(1, 16, 8, 0, Math.PI * 2, 0, Math.PI / 2), moss);
      tuft.scale.set(0.05 + r() * 0.06, 0.025 + r() * 0.02, 0.04 + r() * 0.05);
      tuft.position.set(s.at[0] + Math.cos(a) * d, 0.07, cz + s.at[1] + Math.sin(a) * d);
      tuft.receiveShadow = true;
      group.add(tuft);
    }
  }
  scene.add(group);
  return group;
}
