// The meadow the cabinet stands in: a dense field of grass blades, with
// wildflowers here and there, bending in the wind as gusts roll across it,
// and the shadows of big clouds drifting over everything.
//
// The blades are one instanced mesh. They are scattered across the part of
// the field the camera can see (a wedge running away behind the cabinet),
// thinning with distance as the blades grow larger, so the field looks
// equally dense from front to back without drawing millions of blades.
// Close round the cabinet the grass is shorter, and none grows under it.
//
// Wind and cloud shadows come from one small tileable noise texture: its
// red channel drives the gusts, its green channel the clouds. The same
// texture is read here in JavaScript too, so cloudShadowAt() tells the
// lights exactly when a cloud is over the cabinet.

import * as THREE from 'three';

const still = matchMedia('(prefers-reduced-motion: reduce)');
const N = 256;                                   // noise texture size
const WIND = new THREE.Vector2(1, 0.35).normalize();
const GUST_TILE = 22, GUST_SPEED = 5;            // metres; metres a second
const CLOUD_TILE = 150, CLOUD_SPEED = 3.2;
const CLOUD_EDGE = [0.5, 0.62];                  // where shade starts and is full
export const ROOT = '#24391a', TIP = '#9fb85a';

function seeded(seed) {
  let s = seed >>> 0 || 1;
  return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296);
}

// tileable value noise, a few octaves of lattice periods, in 0..1
function fbm(periods, seed) {
  const r = seeded(seed);
  const out = new Float32Array(N * N);
  const fade = (t) => t * t * (3 - 2 * t);
  let total = 0;
  for (const [P, w] of periods) {
    const g = Float32Array.from({ length: P * P }, r);
    for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) {
      const fx = (x / N) * P, fy = (y / N) * P, ix = Math.floor(fx), iy = Math.floor(fy);
      const tx = fade(fx - ix), ty = fade(fy - iy);
      const at = (a, b) => g[((a % P) + P) % P + P * (((b % P) + P) % P)];
      const v = (at(ix, iy) * (1 - tx) + at(ix + 1, iy) * tx) * (1 - ty) + (at(ix, iy + 1) * (1 - tx) + at(ix + 1, iy + 1) * tx) * ty;
      out[x + y * N] += v * w;
    }
    total += w;
  }
  for (let i = 0; i < out.length; i++) out[i] /= total;
  return out;
}

const gust = fbm([[4, 0.5], [8, 0.3], [16, 0.2]], 3);
const cloud = fbm([[3, 0.55], [6, 0.3], [12, 0.15]], 9);
const data = new Uint8Array(N * N * 4);
for (let i = 0; i < N * N; i++) {
  data[i * 4] = Math.round(gust[i] * 255);
  data[i * 4 + 1] = Math.round(cloud[i] * 255);
  data[i * 4 + 3] = 255;
}
const noiseTex = new THREE.DataTexture(data, N, N);
noiseTex.wrapS = noiseTex.wrapT = THREE.RepeatWrapping;
noiseTex.magFilter = noiseTex.minFilter = THREE.LinearFilter;
noiseTex.needsUpdate = true;

const smooth = (a, b, x) => { const t = Math.min(1, Math.max(0, (x - a) / (b - a))); return t * t * (3 - 2 * t); };

const uniforms = {
  uNoise: { value: noiseTex },
  uTime: { value: 0 },
  uWind: { value: WIND },
  uCloudOff: { value: new THREE.Vector2() },
  uShadeOverride: { value: -1 }, // 0..1 to shade everything evenly instead
  uRoot: { value: new THREE.Color(ROOT) },
  uTip: { value: new THREE.Color(TIP) },
};

// the cloud shadow over a point on the ground, 0 (sun) to 1 (full shade);
// matches the shader exactly (bilinear, wrapped)
export function cloudShadowAt(x, z) {
  const off = uniforms.uCloudOff.value;
  const u = (((x + off.x) / CLOUD_TILE) % 1 + 1) % 1 * N - 0.5, v = (((z + off.y) / CLOUD_TILE) % 1 + 1) % 1 * N - 0.5;
  const ix = Math.floor(u), iy = Math.floor(v), tx = u - ix, ty = v - iy;
  const at = (a, b) => cloud[((a % N) + N) % N + N * (((b % N) + N) % N)];
  const c = (at(ix, iy) * (1 - tx) + at(ix + 1, iy) * tx) * (1 - ty) + (at(ix, iy + 1) * (1 - tx) + at(ix + 1, iy + 1) * tx) * ty;
  return smooth(CLOUD_EDGE[0], CLOUD_EDGE[1], c);
}

const CLOUD_GLSL = /* glsl */`
  uniform sampler2D uNoise;
  uniform vec2 uCloudOff;
  uniform float uShadeOverride;
  float cloudShade(vec2 xz) {
    if (uShadeOverride >= 0.0) return uShadeOverride;
    float c = texture2D(uNoise, (xz + uCloudOff) / ${CLOUD_TILE.toFixed(1)}).g;
    return smoothstep(${CLOUD_EDGE[0].toFixed(2)}, ${CLOUD_EDGE[1].toFixed(2)}, c);
  }
`;

// in the shadow of a cloud: darker, and a little cooler
const SHADE = 'diffuseColor.rgb *= mix(vec3(1.0), vec3(0.42, 0.46, 0.55), cloudShade(vWorld.xz));';

// Grass and flowers share one shader: each instance is placed, then bent
// downwind by a steady lean, a gentle sway and the passing gusts, more the
// higher up the blade. Flowers sit on top of their stalks (uv.y = 1).
function grassMaterial(flower) {
  const mat = new THREE.MeshStandardMaterial({ color: '#ffffff', roughness: 0.85, side: THREE.DoubleSide });
  mat.onBeforeCompile = (shader) => {
    Object.assign(shader.uniforms, uniforms);
    shader.vertexShader = `
      uniform sampler2D uNoise; uniform float uTime; uniform vec2 uWind;
      varying vec3 vWorld; varying float vH; varying float vGust;
    ` + shader.vertexShader.replace('#include <project_vertex>', /* glsl */`
      vec4 mvPosition = vec4(transformed, 1.0);
      #ifdef USE_INSTANCING
        mvPosition = instanceMatrix * mvPosition;
      #endif
      float h = uv.y;
      vec2 at = mvPosition.xz;
      float g = texture2D(uNoise, (at - uWind * uTime * ${GUST_SPEED.toFixed(1)}) / ${GUST_TILE.toFixed(1)}).r;
      g = smoothstep(0.3, 0.8, g);
      float sway = sin(uTime * 1.7 + at.x * 0.8 + at.y * 0.6) * 0.18 + sin(uTime * 2.9 + at.x * 2.1 - at.y * 1.3) * 0.07;
      float bend = (0.22 + g * 0.95 + sway) * h * h;
      float tall = mvPosition.y;
      mvPosition.xz += uWind * bend * tall;
      mvPosition.y -= bend * bend * tall * 0.3;
      vWorld = mvPosition.xyz; vH = h; vGust = g;
      mvPosition = modelViewMatrix * mvPosition;
      gl_Position = projectionMatrix * mvPosition;
    `);
    shader.fragmentShader = `
      varying vec3 vWorld; varying float vH; varying float vGust;
      uniform vec3 uRoot, uTip;
    ` + CLOUD_GLSL + shader.fragmentShader.replace('#include <color_fragment>', `#include <color_fragment>
      ${flower ? '' : 'diffuseColor.rgb *= mix(uRoot, uTip, pow(vH, 0.85));'}
      // the gusts flatten the grass and turn its paler side to the light
      diffuseColor.rgb *= 1.0 + vGust * 0.4 * vH;
      ${SHADE}`)
      // both faces of a blade take the same, upward normal, so none goes dark
      .replace('#include <normal_fragment_begin>', '#include <normal_fragment_begin>\n      normal = normalize(vNormal);');
  };
  mat.customProgramCacheKey = () => (flower ? 'meadow-flower' : 'meadow-grass');
  return mat;
}

// a tapering blade, 1 tall and 1 wide at the root, curving a little forward
function bladeGeometry() {
  const pos = [], uv = [], nor = [];
  const rows = 4;
  for (let i = 0; i < rows; i++) {
    const y = i / rows, w = 0.5 * Math.pow(1 - y, 0.9), z = y * y * 0.12;
    pos.push(-w, y, z, w, y, z); uv.push(0, y, 1, y);
  }
  pos.push(0, 1, 0.12); uv.push(0.5, 1);
  for (let i = 0; i < pos.length / 3; i++) nor.push(0, 1, 0);  // lit like a lawn, not like paper
  const index = [];
  for (let i = 0; i < rows - 1; i++) { const a = i * 2; index.push(a, a + 1, a + 2, a + 1, a + 3, a + 2); }
  const last = (rows - 1) * 2;
  index.push(last, last + 1, last + 2);
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  g.setAttribute('normal', new THREE.Float32BufferAttribute(nor, 3));
  g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
  g.setIndex(index);
  return g;
}

const GREENS = ['#6f8f3a', '#7f9a44', '#5d7f33', '#8ea64e', '#a6a85a', '#c2b26a', '#6a8a3f'];
const FLOWERS = ['#ffffff', '#fff6c8', '#f4d23c', '#b99ae6', '#f2a8c4', '#ffffff', '#e8e2ff'];

// Builds the meadow round the cabinet. `toCamera` is the camera's azimuth
// (radians, as in config.js): the field runs away from the camera.
// `clear` is the cabinet's footprint { x: half-width, z: [back, front] }.
// With `ring` (metres), only a patch of grass that far round the cabinet is
// grown, and no ground: for standing the cabinet in grass in front of a
// filmed meadow.
export function meadow(scene, { toCamera = 0, clear = { x: 0.6, z: [-0.4, 0.05] }, small = innerWidth < 700, ring = 0 } = {}) {
  const group = new THREE.Group();
  group.name = 'meadow';
  const r = seeded(17);
  const away = new THREE.Vector2(-Math.sin(toCamera), -Math.cos(toCamera)); // from the cabinet, away from the camera
  const side = new THREE.Vector2(-away.y, away.x);

  // the ground under it all, out to the haze
  const ground = new THREE.Mesh(new THREE.PlaneGeometry(1200, 1200).rotateX(-Math.PI / 2), new THREE.MeshStandardMaterial({ color: '#2f4419', roughness: 1 }));
  ground.material.onBeforeCompile = (shader) => {
    Object.assign(shader.uniforms, uniforms);
    shader.vertexShader = 'varying vec3 vWorld;\n' + shader.vertexShader.replace('#include <worldpos_vertex>', '#include <worldpos_vertex>\n vWorld = (modelMatrix * vec4(transformed, 1.0)).xyz;');
    shader.fragmentShader = 'varying vec3 vWorld;\n' + CLOUD_GLSL + shader.fragmentShader.replace('#include <color_fragment>', `#include <color_fragment>\n ${SHADE}`);
  };
  ground.receiveShadow = true;
  if (!ring) group.add(ground);

  const count = ring ? (small ? 9000 : 16000) : small ? 70000 : 150000;
  const blades = new THREE.InstancedMesh(bladeGeometry(), grassMaterial(false), count);
  const flowers = new THREE.InstancedMesh(
    (() => { const g = new THREE.IcosahedronGeometry(0.5, 0); const uv = g.attributes.uv; for (let i = 0; i < uv.count; i++) uv.setXY(i, 0.5, 1); return g; })(),
    grassMaterial(true), ring ? 180 : small ? 2500 : 6000,
  );
  const m = new THREE.Matrix4(), q = new THREE.Quaternion(), s = new THREE.Vector3(), p = new THREE.Vector3(), up = new THREE.Vector3(0, 1, 0);
  const colour = new THREE.Color();

  // a spot in the wedge behind the cabinet; nearer spots more often, so the
  // field looks evenly dense on screen
  const D0 = 3.5, D1 = 80, LEAD = 6;
  const spot = () => {
    if (ring) {
      // evenly round the cabinet, out to `ring`
      const a = r() * Math.PI * 2, d = Math.sqrt(r()) * ring;
      return { x: Math.cos(a) * d * 1.3, z: Math.sin(a) * d + (clear.z[0] + clear.z[1]) / 2, k: 1 };
    }
    const D = D0 * Math.pow(D1 / D0, r());
    const f = D - LEAD;                       // distance beyond the cabinet
    const half = 0.8 + Math.max(0, D) * 0.36; // the wedge widens with distance
    const l = (r() * 2 - 1) * half;
    return { x: away.x * f + side.x * l, z: away.y * f + side.y * l, k: Math.max(0.6, D / 6) };
  };
  const nearCabinet = (x, z) => Math.hypot(x / (clear.x + 0.6), (z - (clear.z[0] + clear.z[1]) / 2) / 0.9);
  const under = (x, z) => Math.abs(x) < clear.x + 0.05 && z > clear.z[0] - 0.05 && z < clear.z[1] + 0.05;

  let n = 0;
  while (n < count) {
    const { x, z, k } = spot();
    if (under(x, z)) continue;
    const mown = ring ? 0.5 : nearCabinet(x, z) < 1 ? 0.45 : 1; // shorter round the cabinet
    const h = (0.3 + r() * 0.32) * (1 + 0.12 * Math.log(k)) * mown;
    const w = 0.011 * Math.pow(k, 0.85) * (0.7 + r() * 0.6);
    q.setFromAxisAngle(up, r() * Math.PI * 2);
    m.compose(p.set(x, 0, z), q, s.set(w, h, w));
    blades.setMatrixAt(n, m);
    blades.setColorAt(n, colour.set(GREENS[Math.floor(r() * GREENS.length)]).multiplyScalar(0.85 + r() * 0.3));
    n++;
  }
  for (let i = 0; i < flowers.count;) {
    const { x, z, k } = spot();
    if (under(x, z)) continue;
    const mown = nearCabinet(x, z) < 1 ? 0.5 : 1;
    const size = 0.022 * Math.pow(k, 0.8) * (0.7 + r() * 0.6);
    m.compose(p.set(x, (0.32 + r() * 0.28) * mown, z), q.identity(), s.setScalar(size));
    flowers.setMatrixAt(i, m);
    flowers.setColorAt(i, colour.set(FLOWERS[Math.floor(r() * FLOWERS.length)]));
    i++;
  }
  for (const mesh of [blades, flowers]) {
    mesh.instanceMatrix.needsUpdate = true;
    mesh.instanceColor.needsUpdate = true;
    mesh.frustumCulled = false;
    mesh.receiveShadow = true;
  }
  group.add(blades, flowers);
  scene.add(group);

  return {
    // shade everything evenly (0..1), or null to go back to drawn clouds
    setShade(v) { uniforms.uShadeOverride.value = v ?? -1; },
    update(seconds) {
      const t = still.matches ? 0 : seconds;
      uniforms.uTime.value = t;
      uniforms.uCloudOff.value.copy(WIND).multiplyScalar(-t * CLOUD_SPEED);
    },
  };
}
