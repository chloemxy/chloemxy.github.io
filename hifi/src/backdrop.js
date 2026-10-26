// The zen backdrop: an off-white stone-and-washi wall, lighter at the top,
// with the soft shadow of a bamboo sprig falling across it from an unseen
// window. The shadow sways very slowly, like dappled light; it holds still
// for people who prefer reduced motion.

import * as THREE from 'three';

const still = matchMedia('(prefers-reduced-motion: reduce)');
const SIZE = 1024;

function seeded(seed) {
  let s = seed >>> 0;
  return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296);
}

// The wall itself: a calm gradient with a faint mottle, like limewash.
function paintWall() {
  const c = document.createElement('canvas');
  c.width = c.height = SIZE;
  const ctx = c.getContext('2d');
  const g = ctx.createLinearGradient(0, 0, 0, SIZE);
  g.addColorStop(0, '#f1eee8');
  g.addColorStop(0.6, '#e9e5dd');
  g.addColorStop(1, '#ddd8ce');
  ctx.fillStyle = g; ctx.fillRect(0, 0, SIZE, SIZE);
  const r = seeded(5);
  ctx.filter = 'blur(18px)';
  for (let i = 0; i < 90; i++) {
    const v = r() < 0.5 ? 255 : 120;
    ctx.fillStyle = `rgba(${v},${v - 4},${v - 10},0.035)`;
    ctx.beginPath(); ctx.ellipse(r() * SIZE, r() * SIZE, 40 + r() * 140, 30 + r() * 90, r() * Math.PI, 0, Math.PI * 2); ctx.fill();
  }
  ctx.filter = 'none';
  return c;
}

// Bamboo sprigs as a soft shadow: thin stems with clusters of long, narrow
// leaves, blurred as a distant shadow would be.
function paintBamboo() {
  const c = document.createElement('canvas');
  c.width = c.height = SIZE;
  const ctx = c.getContext('2d');
  const r = seeded(11);
  ctx.fillStyle = '#000'; ctx.strokeStyle = '#000';
  ctx.filter = 'blur(9px)';
  const sprig = (x, y, angle, len) => {
    const ex = x + Math.cos(angle) * len, ey = y + Math.sin(angle) * len;
    ctx.lineWidth = 5; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(x, y); ctx.quadraticCurveTo((x + ex) / 2 + 30, (y + ey) / 2, ex, ey); ctx.stroke();
    for (let i = 0; i < 9; i++) {
      const t = 0.25 + (i / 9) * 0.75;
      const px = x + (ex - x) * t, py = y + (ey - y) * t;
      const n = 2 + Math.floor(r() * 3);
      for (let k = 0; k < n; k++) {
        const a = angle + (r() < 0.5 ? -1 : 1) * (0.5 + r() * 0.9) + Math.PI * 0.08;
        const L = 70 + r() * 70, W = 9 + r() * 6;
        ctx.save();
        ctx.translate(px, py); ctx.rotate(a);
        ctx.beginPath(); ctx.ellipse(L / 2, 0, L / 2, W / 2, 0, 0, Math.PI * 2); ctx.fill();
        ctx.restore();
      }
    }
  };
  sprig(1060, -40, 2.25, 560);
  sprig(980, 120, 2.55, 470);
  sprig(1100, 300, 2.85, 380);
  ctx.filter = 'none';
  return c;
}

// Sunlight through leaves: a canopy of leaf cut-outs that draws nothing on
// screen (no colour, no depth) but still goes into the sun's shadow map, so
// it dapples the stand and the papers with real shadows. It sways slowly,
// like the shadow on the wall, and holds still for reduced motion.

export function leafCanopy(size = 2.4) {
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = SIZE;
  const lc = canvas.getContext('2d');
  const r = seeded(23);
  lc.fillStyle = '#000'; lc.strokeStyle = '#000';
  // sprigs reaching in from all sides, leaving gaps of open sunlight
  for (let s = 0; s < 46; s++) {
    const x = r() * SIZE, y = r() * SIZE, a = r() * Math.PI * 2, len = 180 + r() * 200;
    const ex = x + Math.cos(a) * len, ey = y + Math.sin(a) * len;
    lc.lineWidth = 3; lc.lineCap = 'round';
    lc.beginPath(); lc.moveTo(x, y); lc.lineTo(ex, ey); lc.stroke();
    for (let i = 0; i < 10; i++) {
      const t = 0.15 + (i / 10) * 0.85, px = x + (ex - x) * t, py = y + (ey - y) * t;
      for (let k = 0, n = 2 + Math.floor(r() * 3); k < n; k++) {
        const la = a + (r() < 0.5 ? -1 : 1) * (0.5 + r() * 0.9);
        const L = 34 + r() * 40, W = 7 + r() * 5;
        lc.save(); lc.translate(px, py); lc.rotate(la);
        lc.beginPath(); lc.ellipse(L / 2, 0, L / 2, W / 2, 0, 0, Math.PI * 2); lc.fill();
        lc.restore();
      }
    }
  }
  const texture = new THREE.CanvasTexture(canvas);
  const mesh = new THREE.Mesh(
    new THREE.PlaneGeometry(size, size),
    new THREE.MeshBasicMaterial({ map: texture, alphaTest: 0.5, side: THREE.DoubleSide, colorWrite: false, depthWrite: false }),
  );
  mesh.name = 'leaf_canopy';
  mesh.castShadow = true;
  const rest = { position: new THREE.Vector3(), quaternion: new THREE.Quaternion() };
  return {
    mesh,
    // call once the canopy is placed, to remember its resting pose
    settle() { rest.position.copy(mesh.position); rest.quaternion.copy(mesh.quaternion); },
    update(t) {
      if (still.matches) return;
      mesh.position.copy(rest.position);
      mesh.translateX(Math.sin(t * 0.45) * 0.012);
      mesh.translateY(Math.cos(t * 0.37) * 0.008);
      mesh.quaternion.copy(rest.quaternion);
      mesh.rotateZ(Math.sin(t * 0.3) * 0.015 + Math.sin(t * 0.85) * 0.005);
    },
  };
}

export function zenBackdrop() {
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = SIZE;
  const ctx = canvas.getContext('2d');
  const wall = paintWall(), leaves = paintBamboo();
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;

  let last = -1;
  function draw(t) {
    ctx.globalCompositeOperation = 'source-over';
    ctx.globalAlpha = 1;
    ctx.drawImage(wall, 0, 0);
    // the sprig sways about its top-right corner, a degree or so each way
    ctx.save();
    ctx.translate(SIZE, 0);
    ctx.rotate(Math.sin(t * 0.35) * 0.018 + Math.sin(t * 0.9) * 0.005);
    ctx.translate(-SIZE + Math.sin(t * 0.5) * 6, Math.cos(t * 0.4) * 4);
    ctx.globalCompositeOperation = 'multiply';
    ctx.globalAlpha = 0.12;
    ctx.drawImage(leaves, 0, 0);
    ctx.restore();
    texture.needsUpdate = true;
  }
  draw(0);

  return {
    texture,
    // redraws at about 12 fps; skipped entirely for reduced motion
    update(seconds) {
      if (still.matches) return;
      const frame = Math.floor(seconds * 12);
      if (frame === last) return;
      last = frame;
      draw(seconds);
    },
  };
}
