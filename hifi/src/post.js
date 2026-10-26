// Post-processing: tone mapping, then a light photographic grade with grain
// and vignette. Screen-space AO (GTAO) was tried twice for the newsstand and
// dropped: it banded on thin dowels with an orbiting camera, and with a
// textured backdrop it shaded empty background black. The studio scene has
// neither (a fixed camera, a solid plaster wall behind), so it can ask for
// AO (`ao`), which darkens the inside corners of every cell as real light
// does, and for depth of field (`dof`), focused on the wall like a real lens.

import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import { ShaderPass } from 'three/addons/postprocessing/ShaderPass.js';
import { GTAOPass } from 'three/addons/postprocessing/GTAOPass.js';
import { BokehPass } from 'three/addons/postprocessing/BokehPass.js';

const still = matchMedia('(prefers-reduced-motion: reduce)');

// Render at least 1.5 times the screen's pixels (up to 2), then scale down:
// on an ordinary screen that is supersampling, which keeps every edge and
// texture crisp; a high-density screen already has the pixels.
export const renderScale = () => Math.min(2, Math.max(1.5, devicePixelRatio));

// A film look applied after tone mapping: faded blacks and warm, slightly
// creamy highlights, colour pulled back a little, then grain and vignette.
const Film = {
  uniforms: {
    tDiffuse: { value: null }, time: { value: 0 }, amount: { value: 0.012 }, vignette: { value: 0.4 },
    resolution: { value: new THREE.Vector2(1, 1) }, sharpen: { value: 0.35 },
  },
  vertexShader: /* glsl */`
    varying vec2 vUv;
    void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
  fragmentShader: /* glsl */`
    uniform sampler2D tDiffuse; uniform float time; uniform float amount; uniform float vignette;
    uniform vec2 resolution; uniform float sharpen;
    varying vec2 vUv;
    float rand(vec2 p) { return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453); }
    void main() {
      // a light unsharp mask, as a camera's final sharpening
      vec2 px = 1.0 / resolution;
      vec3 c = texture2D(tDiffuse, vUv).rgb;
      vec3 around = (texture2D(tDiffuse, vUv + vec2(px.x, 0.0)).rgb + texture2D(tDiffuse, vUv - vec2(px.x, 0.0)).rgb
                   + texture2D(tDiffuse, vUv + vec2(0.0, px.y)).rgb + texture2D(tDiffuse, vUv - vec2(0.0, px.y)).rgb) * 0.25;
      c = max(c + (c - around) * sharpen, 0.0);
      c = mix(vec3(0.045, 0.04, 0.035), vec3(0.995, 0.99, 0.975), c); // a slight fade at the ends
      c = c * c * (3.0 - 2.0 * c) * 0.35 + c * 0.65;                     // gentle S-curve
      float l = dot(c, vec3(0.299, 0.587, 0.114));
      c = mix(vec3(l), c, 0.92);                                          // colour pulled back a touch
      c *= vec3(1.008, 1.0, 0.99);                                         // barely warm
      c += (rand(vUv * 1024.0 + time) - 0.5) * amount;
      vec2 d = vUv - 0.5;
      c *= 1.0 - dot(d, d) * vignette;
      gl_FragColor = vec4(c, 1.0);
    }`,
};

//   ao: true for ambient occlusion
//   dof: { focus (distance in metres), aperture, maxblur } for depth of field
export function makePost(renderer, scene, camera, { ao = false, dof = null } = {}) {
  const target = new THREE.WebGLRenderTarget(1, 1, { type: THREE.HalfFloatType, samples: 4 });
  const composer = new EffectComposer(renderer, target);
  composer.addPass(new RenderPass(scene, camera));
  if (ao) {
    const gtao = new GTAOPass(scene, camera, 1, 1);
    gtao.output = GTAOPass.OUTPUT.Default;
    gtao.blendIntensity = 1;
    gtao.updateGtaoMaterial({ radius: 0.3, distanceExponent: 1.4, thickness: 1.4, scale: 1.25, samples: 16 });
    gtao.updatePdMaterial({ lumaPhi: 10, depthPhi: 2, normalPhi: 3, radius: 6, rings: 2, samples: 16 });
    composer.addPass(gtao);
  }
  let bokeh = null;
  if (dof) {
    bokeh = new BokehPass(scene, camera, { focus: dof.focus, aperture: dof.aperture, maxblur: dof.maxblur });
    composer.addPass(bokeh);
  }

  composer.addPass(new OutputPass());
  const grain = new ShaderPass(Film);
  composer.addPass(grain);

  let frame = 0;
  return {
    // refocus (metres from the camera), e.g. as the framing changes
    focusAt(d) { if (bokeh) bokeh.uniforms.focus.value = d; },
    setSize(w, h) {
      composer.setPixelRatio(renderScale());
      composer.setSize(w, h);
      grain.uniforms.resolution.value.set(w * renderScale(), h * renderScale());
    },
    render() {
      // the grain changes at 12 fps, like film; it holds still for reduced motion
      if (!still.matches && ++frame % 5 === 0) grain.uniforms.time.value = (grain.uniforms.time.value + 1.37) % 100;
      composer.render();
    },
  };
}
