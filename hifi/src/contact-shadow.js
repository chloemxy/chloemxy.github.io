// A soft contact shadow for the seamless studio backdrop, after three.js's
// "shadow contact" example: an orthographic camera looks up from the floor,
// renders whatever is close to the ground as darkness, blurs it, and lays the
// result on a transparent plane. There is no floor to catch a real shadow, so
// this is what grounds the stand, like the soft shadow under a product photo.

import * as THREE from 'three';
import { HorizontalBlurShader } from 'three/addons/shaders/HorizontalBlurShader.js';
import { VerticalBlurShader } from 'three/addons/shaders/VerticalBlurShader.js';

export class ContactShadow {
  constructor(renderer, scene, {
    center = new THREE.Vector3(), width = 1.4, depth = 1, height = 0.9,
    blur = 3, darkness = 1.6, opacity = 0.6, size = 512,
  } = {}) {
    Object.assign(this, { renderer, scene, blur });
    this.group = new THREE.Group();
    this.group.position.set(center.x, 0.001, center.z);
    scene.add(this.group);

    this.rt = new THREE.WebGLRenderTarget(size, size);
    this.rtBlur = new THREE.WebGLRenderTarget(size, size);
    this.rt.texture.generateMipmaps = this.rtBlur.texture.generateMipmaps = false;

    const geo = new THREE.PlaneGeometry(width, depth).rotateX(Math.PI / 2);
    this.plane = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ map: this.rt.texture, opacity, transparent: true, depthWrite: false }));
    this.plane.renderOrder = 1;
    this.plane.scale.y = -1;
    this.blurPlane = new THREE.Mesh(geo);
    this.blurPlane.visible = false;

    this.camera = new THREE.OrthographicCamera(-width / 2, width / 2, depth / 2, -depth / 2, 0, height);
    this.camera.rotation.x = Math.PI / 2; // looking up
    this.group.add(this.plane, this.blurPlane, this.camera);

    // depth rendered as black with alpha falling off with height
    const darknessUniform = { value: darkness };
    this.depth = new THREE.MeshDepthMaterial({ depthTest: false, depthWrite: false });
    this.depth.onBeforeCompile = (shader) => {
      shader.uniforms.darkness = darknessUniform;
      shader.fragmentShader = `uniform float darkness;\n${shader.fragmentShader.replace(
        'gl_FragColor = vec4( vec3( 1.0 - fragCoordZ ), opacity );',
        'gl_FragColor = vec4( vec3( 0.0 ), ( 1.0 - fragCoordZ ) * darkness );',
      )}`;
    };
    this.hBlur = new THREE.ShaderMaterial({ ...HorizontalBlurShader, uniforms: THREE.UniformsUtils.clone(HorizontalBlurShader.uniforms), depthTest: false });
    this.vBlur = new THREE.ShaderMaterial({ ...VerticalBlurShader, uniforms: THREE.UniformsUtils.clone(VerticalBlurShader.uniforms), depthTest: false });
  }

  blurPass(amount) {
    const r = this.renderer;
    this.blurPlane.visible = true;
    this.blurPlane.material = this.hBlur;
    this.hBlur.uniforms.tDiffuse.value = this.rt.texture;
    this.hBlur.uniforms.h.value = amount / 256;
    r.setRenderTarget(this.rtBlur);
    r.render(this.blurPlane, this.camera);
    this.blurPlane.material = this.vBlur;
    this.vBlur.uniforms.tDiffuse.value = this.rtBlur.texture;
    this.vBlur.uniforms.v.value = amount / 256;
    r.setRenderTarget(this.rt);
    r.render(this.blurPlane, this.camera);
    this.blurPlane.visible = false;
  }

  update() {
    const { renderer: r, scene } = this;
    const background = scene.background, alpha = r.getClearAlpha();
    scene.background = null;
    scene.overrideMaterial = this.depth;
    this.plane.visible = false;
    r.setClearAlpha(0);
    r.setRenderTarget(this.rt);
    r.clear();
    r.render(scene, this.camera);
    scene.overrideMaterial = null;
    this.blurPass(this.blur);
    this.blurPass(this.blur * 0.4); // a second, finer pass smooths the steps
    r.setRenderTarget(null);
    r.setClearAlpha(alpha);
    scene.background = background;
    this.plane.visible = true;
  }
}
