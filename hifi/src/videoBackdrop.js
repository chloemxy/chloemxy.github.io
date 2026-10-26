// A real meadow, filmed: a locked-off video clip behind the cabinet, the way
// a product photo is shot against a real location. The camera never moves,
// so the footage sits behind the scene like a painted backdrop.
//
// - It fills the screen whatever its shape, cropping rather than stretching.
// - Two copies of the clip play in turn and crossfade over the last second,
//   so the loop never jumps, even if the clip itself doesn't loop cleanly.
// - It goes through the same tone mapping and film grade as the cabinet.
// - shade() reports how much darker the footage is than its brightest, so
//   when a cloud shadow passes over the field, the light on the cabinet can
//   dim with it.
//
// If the clip can't be loaded, `failed` resolves true and the caller falls
// back to the drawn meadow.

import * as THREE from 'three';

const FADE = 1.0; // seconds of crossfade at each loop

function makeVideo(src) {
  const v = document.createElement('video');
  Object.assign(v, { src, muted: true, playsInline: true, loop: false, preload: 'auto', crossOrigin: 'anonymous' });
  v.setAttribute('playsinline', '');
  return v;
}

export function videoBackdrop(scene, src) {
  const a = makeVideo(src), b = makeVideo(src);
  const texA = new THREE.VideoTexture(a), texB = new THREE.VideoTexture(b);
  for (const t of [texA, texB]) t.colorSpace = THREE.SRGBColorSpace;

  const material = new THREE.ShaderMaterial({
    uniforms: {
      tA: { value: texA }, tB: { value: texB }, uMix: { value: 0 },
      uScreen: { value: 16 / 9 }, uVideo: { value: 16 / 9 },
    },
    vertexShader: 'varying vec2 vUv; void main() { vUv = uv; gl_Position = vec4(position.xy, 1.0, 1.0); }',
    fragmentShader: /* glsl */`
      uniform sampler2D tA, tB; uniform float uMix, uScreen, uVideo;
      varying vec2 vUv;
      void main() {
        // cover: crop whichever way the screen is narrower than the video
        vec2 uv = vUv - 0.5;
        if (uScreen > uVideo) uv.y *= uVideo / uScreen; else uv.x *= uScreen / uVideo;
        uv += 0.5;
        vec4 c = mix(texture2D(tA, uv), texture2D(tB, uv), uMix);
        gl_FragColor = vec4(c.rgb, 1.0);
        #include <colorspace_fragment>
      }`,
    depthTest: false, depthWrite: false,
  });
  // drawn first, behind everything, at the far plane
  const quad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), material);
  quad.frustumCulled = false;
  quad.renderOrder = -1000;
  scene.add(quad);

  // a small canvas to read the footage's brightness from now and then
  const probe = document.createElement('canvas');
  probe.width = 32; probe.height = 18;
  const pctx = probe.getContext('2d', { willReadFrequently: true });
  let brightest = 0, level = 0, frame = 0;

  let front = a, back = b, fading = false;
  const failed = new Promise((resolve) => {
    a.addEventListener('loadeddata', () => {
      material.uniforms.uVideo.value = a.videoWidth / a.videoHeight;
      a.play().catch(() => {}); // muted video may autoplay; if not, the first click starts it
      resolve(false);
    }, { once: true });
    a.addEventListener('error', () => resolve(true), { once: true });
  });
  // whichever copy runs out hands straight over to the other, even if no
  // frame was drawn in between (a background tab, say), so it never stops
  for (const v of [a, b]) {
    v.addEventListener('ended', () => {
      if (v !== front) return;
      if (back.paused) { back.currentTime = 0; back.play().catch(() => {}); }
      [front, back] = [back, front];
      fading = false;
      material.uniforms.uMix.value = front === a ? 0 : 1;
    });
  }
  // browsers that hold autoplay start it on the first interaction
  const kick = () => { if (front.paused) front.play().catch(() => {}); };
  addEventListener('pointerdown', kick, { once: true });

  return {
    videos: [a, b], // for debugging
    failed,
    setSize(w, h) { material.uniforms.uScreen.value = w / h; },
    update() {
      const d = front.duration;
      if (!d || !isFinite(d)) return;
      const left = d - front.currentTime;
      // start the other copy from the top and fade across to it
      if (!fading && left < FADE) {
        fading = true;
        back.currentTime = 0;
        back.play().catch(() => {});
      }
      if (fading) {
        const k = THREE.MathUtils.clamp(1 - left / FADE, 0, 1);
        material.uniforms.uMix.value = front === a ? k : 1 - k;
        if (front.ended || left <= 0.02) {
          front.pause();
          [front, back] = [back, front];
          fading = false;
          material.uniforms.uMix.value = front === a ? 0 : 1;
        }
      }
      // how bright the field is now, against the brightest it's been lately
      if (++frame % 8 === 0 && front.readyState >= 2) {
        pctx.drawImage(front, 0, 0, probe.width, probe.height);
        const px = pctx.getImageData(0, 0, probe.width, probe.height).data;
        let sum = 0;
        for (let i = 0; i < px.length; i += 4) sum += px[i] * 0.3 + px[i + 1] * 0.59 + px[i + 2] * 0.11;
        level = sum / (px.length / 4) / 255;
        brightest = Math.max(level, brightest * 0.999);
      }
    },
    // 0 when the field is in full sun, toward 1 as a cloud shadow darkens it
    shade() { return brightest ? THREE.MathUtils.clamp((brightest - level) / (brightest * 0.3), 0, 1) : 0; },
  };
}

// An invisible floor that only shows shadows, so the cabinet casts a soft
// shadow onto the filmed grass.
export function shadowCatcher(scene, size = 4, opacity = 0.35) {
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(size, size).rotateX(-Math.PI / 2), new THREE.ShadowMaterial({ opacity, color: '#1c2a10' }));
  floor.receiveShadow = true;
  floor.position.y = 0.001;
  scene.add(floor);
  return floor;
}
