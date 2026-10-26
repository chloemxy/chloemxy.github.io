// The backdrop: a summer sky full of fluffy cumulus drifting by. The eye
// floats high in a layer of cloud, so a sea of fluffy tops lies all round
// the cabinet and the taller heaps rise past it into the blue. The layer is
// ray-marched on the GPU through a tileable 3D noise (Perlin-Worley, built
// once at load). Each sample is lit by a high sun from the right and shadowed by the cloud between it and the sun, so the faces
// toward it go bright white and the hollows and undersides a soft
// blue-grey; distant cloud fades into the blue haze at the horizon.
//
// It renders at half resolution into a texture that becomes the scene's
// background, so it goes through the same tone mapping and film grade as
// the cabinet. It redraws every other frame (the clouds move slowly), and
// holds still for people who prefer reduced motion.

import * as THREE from 'three';

const still = matchMedia('(prefers-reduced-motion: reduce)');
const SCALE = 0.5; // of the window's CSS size

function seeded(seed) {
  let s = seed >>> 0;
  return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296);
}

// A tileable cloud noise, N³: smooth value noise for the soft billows,
// mixed with inverted Worley noise (distance to the nearest of a scatter of
// points) for the round, cauliflower bulges.
function cloudNoise(N = 64) {
  const r = seeded(7);
  const P = 8;                               // value-noise lattice
  const lattice = Float32Array.from({ length: P * P * P }, r);
  const worley = (C) => {
    const pts = Float32Array.from({ length: C * C * C * 3 }, r);
    return { C, pts };
  };
  const w1 = worley(8), w2 = worley(16);
  const wrap = (i, n) => ((i % n) + n) % n;
  const fade = (t) => t * t * t * (t * (t * 6 - 15) + 10);

  function value(x, y, z) {
    const xi = Math.floor(x), yi = Math.floor(y), zi = Math.floor(z);
    const fx = fade(x - xi), fy = fade(y - yi), fz = fade(z - zi);
    let v = 0;
    for (let c = 0; c < 8; c++) {
      const dx = c & 1, dy = (c >> 1) & 1, dz = (c >> 2) & 1;
      const g = lattice[wrap(xi + dx, P) + P * (wrap(yi + dy, P) + P * wrap(zi + dz, P))];
      v += g * (dx ? fx : 1 - fx) * (dy ? fy : 1 - fy) * (dz ? fz : 1 - fz);
    }
    return v;
  }
  function cells({ C, pts }, x, y, z) {
    const xi = Math.floor(x), yi = Math.floor(y), zi = Math.floor(z);
    let best = 9;
    for (let dz = -1; dz <= 1; dz++) for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) {
      const cx = xi + dx, cy = yi + dy, cz = zi + dz;
      const k = 3 * (wrap(cx, C) + C * (wrap(cy, C) + C * wrap(cz, C)));
      const ex = cx + pts[k] - x, ey = cy + pts[k + 1] - y, ez = cz + pts[k + 2] - z;
      best = Math.min(best, ex * ex + ey * ey + ez * ez);
    }
    return 1 - Math.min(1, Math.sqrt(best));
  }

  const data = new Uint8Array(N * N * N);
  for (let z = 0, i = 0; z < N; z++) for (let y = 0; y < N; y++) for (let x = 0; x < N; x++, i++) {
    const u = x / N, v = y / N, w = z / N;
    const vn = value(u * P, v * P, w * P);
    const wn = 0.7 * cells(w1, u * w1.C, v * w1.C, w * w1.C) + 0.3 * cells(w2, u * w2.C, v * w2.C, w * w2.C);
    const pw = Math.min(1, Math.max(0, vn * 0.5 + wn * 0.75 - 0.18));
    data[i] = Math.round(pw * 255);
  }
  const t = new THREE.Data3DTexture(data, N, N, N);
  t.format = THREE.RedFormat;
  t.minFilter = t.magFilter = THREE.LinearFilter;
  t.wrapS = t.wrapT = t.wrapR = THREE.RepeatWrapping;
  t.unpackAlignment = 1;
  t.needsUpdate = true;
  return t;
}

const fragmentShader = /* glsl */`
  precision highp sampler3D;
  uniform sampler3D tNoise;
  uniform float uTime;
  uniform float uAspect;
  uniform vec3 uSun;
  varying vec2 vUv;

  // a layer of fair-weather cumulus, in kilometres; the eye floats in its
  // upper part, so there is a sea of cloud tops below the horizon and the
  // taller heaps rise around it into the blue
  const float H0 = 0.3, H1 = 5.0, EYE = 1.7;
  const float COVER = 0.68;
  const float NEAR = 3.0, FAR = 34.0; // no cloud closer than NEAR, so none fills the view
  const int STEPS = 64;

  float n3(vec3 p) { return texture(tNoise, p).r; }

  vec3 wind() { return vec3(uTime * 0.05, 0.0, uTime * 0.02); }

  // density at p; detail eats into the edges for the cauliflower look
  float cloud(vec3 p, bool detail) {
    float h = (p.y - H0) / (H1 - H0);
    if (h < 0.0 || h > 1.0) return 0.0;
    vec3 q = (p + wind()) * 0.055;
    float base = n3(q) * 0.55 + n3(q * 2.03 + 0.37) * 0.3 + n3(q * 4.11 + 0.71) * 0.15;
    // flat bottoms and rounded tops; where the broad noise is high the
    // heaps build into towers that rise well past the eye
    float big = n3(q * 0.3 + 0.2);
    float top = mix(0.35, 1.0, smoothstep(0.3, 0.62, big));
    float shape = smoothstep(0.0, 0.05, h) * smoothstep(top, top * 0.35, h);
    // a steep ramp at the threshold gives crisp, defined edges
    float d = smoothstep(0.0, 0.22, (base * mix(0.7, 1.0, shape) - (1.0 - COVER)) / COVER) * shape;
    if (detail && d > 0.0) {
      vec3 w = (p + wind() * 1.6) * 0.7;
      float e = n3(w) * 0.5 + n3(w * 2.7 + 0.5) * 0.3 + n3(w * 6.1 + 0.9) * 0.2;
      d = max(0.0, d - (1.0 - e) * 0.42 * (1.0 - d * 0.8));
    }
    return d;
  }

  float hg(float c, float g) {
    float g2 = g * g;
    return (1.0 - g2) / (12.566 * pow(1.0 + g2 - 2.0 * g * c, 1.5));
  }

  float hash(vec2 p) { return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453); }

  const vec3 HORIZON = vec3(0.66, 0.79, 0.94);

  vec3 sky(vec3 rd) {
    float s = max(dot(rd, uSun), 0.0);
    vec3 zenith = vec3(0.1, 0.28, 0.72);
    vec3 c = mix(HORIZON, zenith, pow(clamp(rd.y, 0.0, 1.0), 0.55));
    if (rd.y < 0.0) c = mix(HORIZON, vec3(0.44, 0.55, 0.7), smoothstep(0.0, -0.35, rd.y));
    c += vec3(0.5, 0.48, 0.42) * pow(s, 10.0) * 0.4 + vec3(4.0, 3.8, 3.4) * pow(s, 400.0);
    return c;
  }

  void main() {
    // a wide virtual lens, looking out level with a slight tilt up
    vec2 ndc = vUv * 2.0 - 1.0;
    float th = 0.45;
    vec3 rd = normalize(vec3(ndc.x * th * uAspect, ndc.y * th, -1.0));
    float pitch = 0.0, cp = cos(pitch), sp = sin(pitch);
    rd = vec3(rd.x, rd.y * cp - rd.z * sp, rd.y * sp + rd.z * cp);
    vec3 ro = vec3(0.0, EYE, 0.0);

    vec3 col = sky(rd);
    // where the ray runs through the cloud layer
    float ta = 0.0, tb = FAR;
    if (rd.y > 0.001) tb = (H1 - EYE) / rd.y;
    else if (rd.y < -0.001) tb = (H0 - EYE) / rd.y;
    ta = NEAR; tb = min(tb, FAR);
    if (tb > ta) {
      float dt = (tb - ta) / float(STEPS);
      float t = ta + dt * hash(gl_FragCoord.xy);
      float cosA = dot(rd, uSun);
      float phase = mix(hg(cosA, 0.55), hg(cosA, -0.2), 0.4);
      vec3 sunCol = vec3(1.0, 0.97, 0.92) * 5.5;
      float T = 1.0, tw = 0.0;
      vec3 acc = vec3(0.0);
      for (int i = 0; i < STEPS; i++) {
        vec3 p = ro + rd * t;
        float d = cloud(p, true);
        if (d > 0.003) {
          // how much cloud lies between this point and the sun
          float ld = cloud(p + uSun * 0.2, false) * 0.2
                   + cloud(p + uSun * 0.6, false) * 0.4
                   + cloud(p + uSun * 1.2, false) * 0.6
                   + cloud(p + uSun * 2.4, false) * 1.2;
          float Tl = exp(-ld * 3.5);
          float powder = 1.0 - exp(-d * 6.0);
          float h = (p.y - H0) / (H1 - H0);
          vec3 amb = mix(vec3(0.17, 0.22, 0.33), vec3(0.46, 0.53, 0.68), h);
          // sunlit faces go white, shadowed ones a soft blue-grey
          vec3 S = sunCol * Tl * (phase * 3.0 + 0.2) * mix(0.5, 1.0, powder) + amb;
          float Ts = exp(-d * 9.0 * dt);
          float a = T * (1.0 - Ts);
          acc += a * S;
          tw += a * t;
          T *= Ts;
          if (T < 0.02) break;
        }
        t += dt;
      }
      // distant cloud fades into the blue haze
      float a = 1.0 - T;
      float f = exp(-(tw / max(a, 1e-3)) * 0.02);
      col = col * T + mix(HORIZON * a, acc, f);
    }
    gl_FragColor = vec4(col, 1.0);
  }`;

export function daySky(renderer) {
  const target = new THREE.WebGLRenderTarget(2, 2, { type: THREE.HalfFloatType, depthBuffer: false });
  target.texture.minFilter = target.texture.magFilter = THREE.LinearFilter;
  // high and to the right, a little behind the eye, so the heaps are lit on
  // their right and shaded on their left
  const sun = new THREE.Vector3(0.8, 0.62, 0.18).normalize();
  const material = new THREE.ShaderMaterial({
    uniforms: { tNoise: { value: cloudNoise() }, uTime: { value: 0 }, uAspect: { value: 1 }, uSun: { value: sun } },
    vertexShader: 'varying vec2 vUv; void main() { vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }',
    fragmentShader,
    depthTest: false, depthWrite: false,
  });
  const quad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), material);
  quad.frustumCulled = false;
  const scene = new THREE.Scene();
  scene.add(quad);
  const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

  let frame = 0, drawn = false;
  function draw() {
    const prev = renderer.getRenderTarget();
    renderer.setRenderTarget(target);
    renderer.render(scene, camera);
    renderer.setRenderTarget(prev);
    drawn = true;
  }

  return {
    texture: target.texture,
    setSize(w, h) {
      target.setSize(Math.max(2, Math.round(w * SCALE)), Math.max(2, Math.round(h * SCALE)));
      material.uniforms.uAspect.value = w / h;
      drawn = false;
    },
    // the clouds start part way through their drift, so the first frame
    // already has a full sky
    update(seconds) {
      if (still.matches) { if (!drawn) { material.uniforms.uTime.value = 60; draw(); } return; }
      if (drawn && ++frame % 2) return;
      material.uniforms.uTime.value = 60 + seconds;
      draw();
    },
  };
}
