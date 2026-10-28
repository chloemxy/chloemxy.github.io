// A planted rock garden in the foreground, in place of raked sand: a carpet
// of moss over gently mounded ground, cushions of moss heaped round
// weathered rocks, clumps of fern and arching Japanese forest grass, and a
// scatter of pebbles. It is seen soft, out of focus in front of the wall,
// as a lens focused on the shelves would show it.
//
// Everything is drawn here: the moss from tiny star-shaped shoots painted in
// many greens, the fern fronds leaflet by leaflet into a cut-out, the grass
// blade by blade.

import * as THREE from 'three';
import { rock } from './zenGarden.js?v=20261028011732';

const TAU = Math.PI * 2;

function seeded(seed) {
  let s = seed >>> 0 || 1;
  return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296);
}

// Cushion moss: a dark, damp base crowded with tiny shoots, each a little
// star of a few strokes, in many greens from deep to almost yellow.
function mossCanvas(r, size = 1024) {
  const c = document.createElement('canvas');
  c.width = c.height = size;
  const ctx = c.getContext('2d');
  ctx.fillStyle = '#232a16'; ctx.fillRect(0, 0, size, size);
  // broad patches of lighter and darker growth
  ctx.filter = 'blur(30px)';
  for (let i = 0; i < 40; i++) {
    ctx.fillStyle = r() < 0.5 ? 'rgba(92,104,52,0.35)' : 'rgba(16,22,10,0.4)';
    ctx.beginPath(); ctx.ellipse(r() * size, r() * size, 40 + r() * 140, 30 + r() * 100, r() * 3, 0, TAU); ctx.fill();
  }
  ctx.filter = 'none';
  // muted, damp greens and olives, a few browns, the odd pale tip
  const greens = ['#45552a', '#53642f', '#5f6f35', '#6c7a3e', '#7f8a4c', '#3a4824', '#8e8d5a', '#5b5236'];
  for (let i = 0; i < 26000; i++) {
    const x = r() * size, y = r() * size, len = 1.5 + r() * 3.5;
    ctx.strokeStyle = greens[Math.floor(r() * greens.length)];
    ctx.globalAlpha = 0.55 + r() * 0.45;
    ctx.lineWidth = 0.8 + r() * 0.7;
    ctx.beginPath();
    for (let k = 0; k < 5; k++) {
      const a = (k / 5) * TAU + r();
      ctx.moveTo(x, y); ctx.lineTo(x + Math.cos(a) * len, y + Math.sin(a) * len);
    }
    ctx.stroke();
  }
  ctx.globalAlpha = 1;
  return c;
}

function mossMat(canvas, repeat) {
  const map = new THREE.CanvasTexture(canvas);
  map.colorSpace = THREE.SRGBColorSpace;
  map.wrapS = map.wrapT = THREE.RepeatWrapping;
  map.repeat.set(repeat, repeat);
  map.anisotropy = 8;
  const bump = new THREE.CanvasTexture(canvas);
  bump.wrapS = bump.wrapT = THREE.RepeatWrapping;
  bump.repeat.set(repeat, repeat);
  // velvety: a soft sheen at grazing angles, as moss has
  return new THREE.MeshPhysicalMaterial({
    map, bumpMap: bump, bumpScale: 3, roughness: 0.95,
    sheen: 0.35, sheenRoughness: 0.7, sheenColor: new THREE.Color('#a3ad74'),
  });
}

// A fern frond as a cut-out: a stem tapering to the tip, pinnae in pairs
// shortening toward both ends, each a row of small rounded lobes.
function frondCanvas(r) {
  const W = 256, H = 1024;
  const c = document.createElement('canvas');
  c.width = W; c.height = H;
  const ctx = c.getContext('2d');
  const n = 26;
  for (let i = 0; i < n; i++) {
    const t = i / n, y = H * (0.04 + t * 0.92);
    const len = W * 0.46 * Math.sin(Math.PI * Math.min(1, (1 - t) * 1.15 + 0.08)) * (0.9 + r() * 0.1);
    const g = Math.floor(70 + t * 50 + r() * 20);
    for (const side of [-1, 1]) {
      ctx.save();
      ctx.translate(W / 2, y);
      ctx.rotate(side * (1.05 - t * 0.25));
      // the pinna: lobes along it, each a small ellipse
      const lobes = 7;
      for (let k = 0; k < lobes; k++) {
        const s = (k + 0.5) / lobes, px = s * len, w = len * 0.11 * (1.15 - s * 0.6);
        ctx.fillStyle = `rgb(${Math.floor(g * 0.55)},${g + 35},${Math.floor(g * 0.35)})`;
        ctx.beginPath(); ctx.ellipse(px * side, 0, w * 0.75, w, 0, 0, TAU); ctx.fill();
      }
      ctx.restore();
    }
  }
  ctx.strokeStyle = '#4a5d25'; ctx.lineWidth = 6; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(W / 2, H * 0.02); ctx.lineTo(W / 2, H); ctx.stroke();
  return c;
}

// one frond, bent: a strip rising from its base and arching over
function frondGeometry(length, width, arch) {
  const g = new THREE.PlaneGeometry(width, length, 1, 16).translate(0, length / 2, 0);
  const p = g.attributes.position;
  for (let i = 0; i < p.count; i++) {
    const y = p.getY(i), t = y / length;
    // rises, then curves forward and down toward the tip
    p.setXYZ(i, p.getX(i), Math.sin(t * arch) / arch * length, (1 - Math.cos(t * arch)) / arch * length);
  }
  g.computeVertexNormals();
  return g;
}

// a clump of arching grass blades, merged into one geometry
function grassClump(r, blades = 46) {
  const pos = [], col = [], idx = [];
  let v = 0;
  for (let b = 0; b < blades; b++) {
    const yaw = r() * TAU, len = 0.18 + r() * 0.16, w = 0.007 + r() * 0.004, arch = 1.2 + r() * 1.0;
    const base = new THREE.Vector3((r() - 0.5) * 0.05, 0, (r() - 0.5) * 0.05);
    const segs = 8;
    for (let s = 0; s <= segs; s++) {
      const t = s / segs;
      const out = (1 - Math.cos(t * arch)) / arch * len, up = Math.sin(t * arch) / arch * len;
      const half = w * (1 - t * 0.85);
      for (const side of [-1, 1]) {
        const x = Math.cos(yaw) * out - Math.sin(yaw) * side * half, z = Math.sin(yaw) * out + Math.cos(yaw) * side * half;
        pos.push(base.x + x, up, base.z + z);
        // golden green, paler toward the tip
        col.push(0.36 + t * 0.32, 0.5 + t * 0.26, 0.14 + t * 0.06);
      }
      if (s) idx.push(v - 2, v - 1, v, v - 1, v + 1, v);
      v += 2;
    }
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  g.setAttribute('color', new THREE.Float32BufferAttribute(col, 3));
  g.setIndex(idx);
  g.computeVertexNormals();
  return g;
}

// Builds the bed between `x` (half-width) and `z` (near, far).
export function plantedGarden(scene, { x = 4.6, z = [0.6, 3.4], seed = 9 } = {}) {
  const r = seeded(seed);
  const group = new THREE.Group();
  group.name = 'planted_garden';
  const W = x * 2, D = z[1] - z[0], cz = (z[0] + z[1]) / 2;
  const moss = mossMat(mossCanvas(r), 6);

  // the moss carpet, over ground that rises and falls a little
  const ground = new THREE.PlaneGeometry(W, D, 160, 60).rotateX(-Math.PI / 2);
  const p = ground.attributes.position;
  for (let i = 0; i < p.count; i++) {
    const gx = p.getX(i), gz = p.getZ(i);
    const edge = Math.min(1, (x - Math.abs(gx)) / 0.3, (D / 2 - Math.abs(gz)) / 0.3);
    p.setY(i, (0.05 + Math.sin(gx * 2.1) * 0.02 + Math.sin(gz * 3.3 + gx) * 0.015 + Math.sin(gx * 7.7 + gz * 5.1) * 0.006) * Math.max(0, edge));
  }
  ground.computeVertexNormals();
  const carpet = new THREE.Mesh(ground, moss);
  carpet.position.z = cz;
  carpet.receiveShadow = true;
  group.add(carpet);

  // rocks, sunk into the moss
  const stones = [
    { at: [-1.25, -0.1], size: [0.3, 0.22, 0.24] }, { at: [-0.6, 0.45], size: [0.12, 0.08, 0.1] },
    { at: [1.1, -0.25], size: [0.24, 0.27, 0.2] }, { at: [0.35, 0.65], size: [0.09, 0.06, 0.08] },
    { at: [2.6, 0.2], size: [0.2, 0.14, 0.17] }, { at: [-2.7, 0.35], size: [0.17, 0.12, 0.14] },
  ];
  for (const s of stones) {
    const m = rock(r, s.size, ['#6d675f', '#5c5752', '#7a7368', '#625b53'][Math.floor(r() * 4)]);
    m.position.set(s.at[0], 0.03 + s.size[1] * 0.1, cz + s.at[1]);
    m.rotation.y = r() * TAU;
    group.add(m);
  }
  // pebbles, half buried
  for (let i = 0; i < 40; i++) {
    const m = rock(r, [0.02 + r() * 0.03, 0.012 + r() * 0.015, 0.02 + r() * 0.025], ['#8a837a', '#6f695f', '#9a9388'][Math.floor(r() * 3)]);
    m.position.set((r() - 0.5) * W * 0.9, 0.045, cz + (r() - 0.5) * D * 0.8);
    group.add(m);
  }

  // cushions of moss, heaped round the rocks and here and there between
  const cushion = mossMat(mossCanvas(r, 512), 2);
  const near = (s, spread) => [s.at[0] + (r() - 0.5) * spread, s.at[1] + (r() - 0.5) * spread];
  for (let i = 0; i < 46; i++) {
    const s = stones[i % stones.length];
    const [mx, mz] = i < 30 ? near(s, Math.max(s.size[0], s.size[2]) * 3.2) : [(r() - 0.5) * W * 0.85, (r() - 0.5) * D * 0.8];
    const g = new THREE.IcosahedronGeometry(1, 3);
    const gp = g.attributes.position;
    for (let k = 0; k < gp.count; k++) {
      const f = 0.85 + Math.sin(gp.getX(k) * 5 + i) * 0.08 + Math.sin(gp.getZ(k) * 7 + i * 2) * 0.06;
      gp.setXYZ(k, gp.getX(k) * f, Math.max(gp.getY(k), -0.1) * f, gp.getZ(k) * f);
    }
    g.computeVertexNormals();
    const size = 0.05 + r() * 0.12;
    const m = new THREE.Mesh(g, cushion);
    m.scale.set(size * (1 + r() * 0.6), size * (0.35 + r() * 0.2), size * (1 + r() * 0.5));
    m.position.set(mx, 0.045, cz + mz);
    m.castShadow = m.receiveShadow = true;
    group.add(m);
  }

  // ferns: rosettes of arching fronds
  const frondMap = new THREE.CanvasTexture(frondCanvas(r));
  frondMap.colorSpace = THREE.SRGBColorSpace;
  frondMap.anisotropy = 8;
  const frondMat = new THREE.MeshStandardMaterial({ map: frondMap, alphaTest: 0.5, side: THREE.DoubleSide, roughness: 0.75 });
  const fernAt = [[-1.85, 0.1], [-0.1, 0.25], [1.75, 0.35], [-3.4, -0.2], [3.3, -0.1], [0.75, -0.55]];
  for (const [fx, fz] of fernAt) {
    const fronds = 9 + Math.floor(r() * 5);
    for (let i = 0; i < fronds; i++) {
      const len = 0.3 + r() * 0.22;
      const f = new THREE.Mesh(frondGeometry(len, len * 0.42, 1.4 + r() * 0.8), frondMat);
      f.position.set(fx + (r() - 0.5) * 0.06, 0.05, cz + fz + (r() - 0.5) * 0.06);
      f.rotation.y = (i / fronds) * TAU + r() * 0.4;
      f.rotateX(0.15 + r() * 0.35); // leaning out from the crown
      f.castShadow = true; f.receiveShadow = true;
      group.add(f);
    }
  }

  // clumps of Japanese forest grass, arching and golden green
  const grassMat = new THREE.MeshStandardMaterial({ vertexColors: true, side: THREE.DoubleSide, roughness: 0.7 });
  const grassAt = [[-2.3, -0.4], [-0.95, -0.55], [0.6, 0.15], [2.15, -0.5], [-3.0, 0.6], [1.4, 0.75], [3.7, 0.5], [-1.6, 0.8]];
  for (const [gx, gz] of grassAt) {
    const m = new THREE.Mesh(grassClump(r), grassMat);
    m.position.set(gx, 0.04, cz + gz);
    m.scale.setScalar(0.9 + r() * 0.6);
    m.castShadow = true; m.receiveShadow = true;
    group.add(m);
  }

  scene.add(group);
  return group;
}
