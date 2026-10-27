// A bright wooden cabin for the bin cabinet to stand in: pale plank walls,
// honey floorboards, and two tall windows in the wall behind it looking out
// on the sky. Above, out of shot, a sunroof lets the sun straight in: it
// shows as the light itself, a soft shaft falling through the room with dust
// turning slowly in it.
//
// The windows are real openings in the plank wall, so whatever is behind the
// scene (the drifting cloud sky) shows through them. The camera looks a
// little down, so the ceiling is never in frame and isn't built.

import * as THREE from 'three';
import { Kit } from './cabinet.js?v=20261027185754';

const still = matchMedia('(prefers-reduced-motion: reduce)');
const V = (x, y, z) => new THREE.Vector3(x, y, z);

function seeded(seed) {
  let s = seed >>> 0 || 1;
  return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296);
}

// the stretches of [a, b] left after cutting out the given spans
function between(a, b, cuts) {
  const out = [];
  let at = a;
  for (const [c0, c1] of [...cuts].sort((p, q) => p[0] - q[0])) {
    if (c0 > at) out.push([at, Math.min(c0, b)]);
    at = Math.max(at, c1);
  }
  if (at < b) out.push([at, b]);
  return out.filter(([p, q]) => q - p > 0.02);
}

// Builds the room round the cabinet. `back` is how far behind the cabinet's
// face the back wall stands, `half` the room's half-width, `windowsAt` the
// x the windows centre on (where the camera's view meets the back wall).
// `ceiling` (a height) adds a plank ceiling with a sunroof cut in it, for
// when the camera can see that high; `shaft: false` leaves out the sunbeam
// and its dust (when something stands right in front of where it would fall).
export function cabin(scene, mats, { back = 1.6, half = 3.8, windowsAt = 0.7, sun = V(2.2, 3.4, 2.2).normalize(), ceiling = 0, shaft: withShaft = true } = {}) {
  const r = seeded(5);
  const room = new THREE.Group();
  room.name = 'cabin';

  // pale, sun-bleached planks for the walls; honey boards underfoot
  const wall = mats.deal.clone();
  wall.color.setRGB(1.2, 1.06, 0.88);
  const floor = mats.deal.clone();
  floor.color.setRGB(1.02, 0.76, 0.5);
  floor.roughness = 0.7;
  const trim = mats.deal.clone();
  trim.color.setRGB(1.05, 0.86, 0.64);

  const k = new Kit(9);
  const H = 3.2, PLANK = 0.2, Z = -back;

  // two tall windows in the back wall
  const windows = [-1, 1].map((s) => ({ x0: windowsAt + s * 1.3 - 0.55, x1: windowsAt + s * 1.3 + 0.55, y0: 1.0, y1: 2.7 }));

  // the back wall, plank by plank, each run broken where a window cuts it
  for (let y = 0; y < H; y += PLANK) {
    const cuts = windows.filter((w) => y + PLANK > w.y0 && y < w.y1).map((w) => [w.x0, w.x1]);
    for (const [a, b] of between(-half, half, cuts)) {
      k.beam(V(a, y + PLANK / 2, Z - 0.02), V(b, y + PLANK / 2, Z - 0.02), PLANK - 0.004, 0.04, wall, V(0, 1, 0));
    }
  }
  // the side walls
  for (const s of [-1, 1]) {
    for (let y = 0; y < H; y += PLANK) {
      k.beam(V(s * (half + 0.02), y + PLANK / 2, Z), V(s * (half + 0.02), y + PLANK / 2, 7), PLANK - 0.004, 0.04, wall, V(0, 1, 0));
    }
  }
  // the windows: a casing round each, a deep sill, a cross of glazing bars
  for (const w of windows) {
    const zc = Z + 0.012, c = 0.09;
    k.beam(V(w.x0 - c / 2, w.y0 - 0.05, zc), V(w.x0 - c / 2, w.y1 + c, zc), c, 0.05, trim, V(1, 0, 0));
    k.beam(V(w.x1 + c / 2, w.y0 - 0.05, zc), V(w.x1 + c / 2, w.y1 + c, zc), c, 0.05, trim, V(1, 0, 0));
    k.beam(V(w.x0, w.y1 + c / 2, zc), V(w.x1, w.y1 + c / 2, zc), c, 0.05, trim, V(0, 1, 0));
    k.beam(V(w.x0 - c - 0.04, w.y0 - 0.02, Z + 0.07), V(w.x1 + c + 0.04, w.y0 - 0.02, Z + 0.07), 0.16, 0.04, trim, V(0, 0, 1));
    const mx = (w.x0 + w.x1) / 2, my = w.y0 + (w.y1 - w.y0) * 0.62;
    k.beam(V(mx, w.y0, Z - 0.01), V(mx, w.y1, Z - 0.01), 0.045, 0.04, trim, V(1, 0, 0));
    k.beam(V(w.x0, my, Z - 0.01), V(w.x1, my, Z - 0.01), 0.045, 0.04, trim, V(0, 1, 0));
  }
  // a skirting board along the back wall
  for (const [a, b] of between(-half, half, [])) k.beam(V(a, 0.07, Z + 0.012), V(b, 0.07, Z + 0.012), 0.14, 0.025, trim, V(0, 1, 0));

  // floorboards running away from the window wall, in staggered lengths
  for (let x = -half; x < half; x += 0.16) {
    let z = Z;
    while (z < 7) {
      const len = Math.min(7 - z, 1.4 + r() * 2.2);
      k.beam(V(x + 0.08, -0.015, z), V(x + 0.08, -0.015, z + len - 0.004), 0.156, 0.03, floor, V(1, 0, 0));
      z += len;
    }
  }
  // a plank ceiling with the sunroof in it: an opening onto the sky, framed
  if (ceiling) {
    const roof = { x0: -1.3, x1: 1.3, z0: 0.4, z1: 2.6 };
    for (let x = -half; x < half; x += PLANK) {
      const xc = x + PLANK / 2;
      const cuts = xc > roof.x0 && xc < roof.x1 ? [[roof.z0, roof.z1]] : [];
      for (const [a, b] of between(Z, 7, cuts)) k.beam(V(xc, ceiling + 0.02, a), V(xc, ceiling + 0.02, b), PLANK - 0.004, 0.04, wall, V(1, 0, 0));
    }
    for (const z of [roof.z0, roof.z1]) k.beam(V(roof.x0, ceiling - 0.04, z), V(roof.x1, ceiling - 0.04, z), 0.12, 0.08, trim, V(0, 1, 0));
    for (const x of [roof.x0, roof.x1]) k.beam(V(x, ceiling - 0.04, roof.z0), V(x, ceiling - 0.04, roof.z1), 0.12, 0.08, trim, V(0, 1, 0));
  }
  const built = k.build('cabin');
  built.traverse((o) => { if (o.isMesh) { o.castShadow = false; o.receiveShadow = true; } });
  room.add(built);

  // the faintest glass in the windows, just enough to catch a reflection
  const glass = new THREE.MeshPhysicalMaterial({ color: '#ffffff', transparent: true, opacity: 0.05, roughness: 0.02, clearcoat: 1, depthWrite: false });
  for (const w of windows) {
    const pane = new THREE.Mesh(new THREE.PlaneGeometry(w.x1 - w.x0, w.y1 - w.y0), glass);
    pane.position.set((w.x0 + w.x1) / 2, (w.y0 + w.y1) / 2, Z - 0.03);
    room.add(pane);
  }

  let dustMat = null;
  if (withShaft) {
    // The sunbeam from the sunroof: a long soft-edged column of light along
    // the sun's direction, brightest in its core and fading at its ends.
    const LEN = 5, W = 1.1;
    const beamMat = new THREE.ShaderMaterial({
      uniforms: { uColor: { value: new THREE.Color('#fff1d6') }, uStrength: { value: 0.12 } },
      vertexShader: 'varying vec3 vP; void main() { vP = position; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }',
      fragmentShader: /* glsl */`
        uniform vec3 uColor; uniform float uStrength; varying vec3 vP;
        void main() {
          float across = length(vP.xz) / ${(W / 2).toFixed(3)};
          float along = vP.y / ${(LEN / 2).toFixed(3)};
          float a = smoothstep(1.0, 0.15, across) * smoothstep(1.0, 0.55, abs(along));
          gl_FragColor = vec4(uColor * a * uStrength, 1.0);
        }`,
      transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide,
    });
    const shaft = new THREE.Group();
    for (let i = 0; i < 6; i++) {
      // a few crossed planes, so it reads as a volume from any angle
      const plane = new THREE.Mesh(new THREE.PlaneGeometry(W, LEN), beamMat);
      plane.rotation.y = (i / 6) * Math.PI;
      shaft.add(plane);
    }
    // it lands at the foot of the back wall, so it falls behind the cabinet
    // and shows in the air above it, never across its front
    const foot = V(-1.5, 0, -back + 0.05);
    shaft.position.copy(foot).addScaledVector(sun, LEN / 2);
    shaft.quaternion.setFromUnitVectors(V(0, 1, 0), sun);
    room.add(shaft);

    // dust turning slowly in the light
    const N = 260;
    const pos = new Float32Array(N * 3), seeds = new Float32Array(N);
    for (let i = 0; i < N; i++) {
      const t = r() * LEN * 0.8, a = r() * Math.PI * 2, d = Math.sqrt(r()) * W * 0.4;
      const p = foot.clone().addScaledVector(sun, t + 0.2);
      pos.set([p.x + Math.cos(a) * d, p.y, p.z + Math.sin(a) * d], i * 3);
      seeds[i] = r() * 100;
    }
    const dustGeo = new THREE.BufferGeometry();
    dustGeo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    dustGeo.setAttribute('seed', new THREE.BufferAttribute(seeds, 1));
    dustMat = new THREE.ShaderMaterial({
      uniforms: { uTime: { value: 0 }, uScale: { value: 1 } },
      vertexShader: /* glsl */`
        uniform float uTime, uScale; attribute float seed; varying float vA;
        void main() {
          vec3 p = position + vec3(sin(uTime * 0.13 + seed) * 0.12, sin(uTime * 0.07 + seed * 1.7) * 0.18, cos(uTime * 0.11 + seed * 0.6) * 0.12);
          vec4 mv = modelViewMatrix * vec4(p, 1.0);
          gl_Position = projectionMatrix * mv;
          gl_PointSize = uScale * (1.0 + fract(seed) * 1.6) / -mv.z;
          vA = 0.35 + 0.65 * (0.5 + 0.5 * sin(uTime * 0.6 + seed * 3.0)); // glinting as they turn
        }`,
      fragmentShader: /* glsl */`
        varying float vA;
        void main() {
          float d = length(gl_PointCoord - 0.5);
          gl_FragColor = vec4(vec3(1.0, 0.95, 0.85) * smoothstep(0.5, 0.0, d) * vA * 0.9, 1.0);
        }`,
      transparent: true, blending: THREE.AdditiveBlending, depthWrite: false,
    });
    const dust = new THREE.Points(dustGeo, dustMat);
    dust.frustumCulled = false;
    room.add(dust);
  }

  scene.add(room);
  return {
    // points stay a constant size on screen whatever the canvas height
    setSize(w, h) { if (dustMat) dustMat.uniforms.uScale.value = h * 0.022 * Math.min(devicePixelRatio, 2); },
    update(t) { if (dustMat && !still.matches) dustMat.uniforms.uTime.value = t; },
  };
}
