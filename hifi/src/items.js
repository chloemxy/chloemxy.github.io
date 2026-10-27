// A drawer and the specimen card at the front of it. The drawer slides out
// along its slot's +Z; the card is a thin board with the front painted on
// one face and the notes on the other, inside a `flip` group that turns it
// over in the hand.
//
// The card's faces are painted when first needed (on hover, or when picked
// up from the list), so twenty cards don't all paint while the page loads.

import * as THREE from 'three';
import { tween, ease } from './anim.js?v=20261027191214';
import { makeDrawerBody, DRAWER, CARD } from './cabinet.js?v=20261027191214';
import { CARD_STOCK, paintLabel, paintCardFront, paintCardBack } from './paint.js?v=20261027191214';

let anisotropy = 4;
export function setAnisotropy(n) { anisotropy = n; }

function tex(canvas) {
  const t = new THREE.CanvasTexture(canvas);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = anisotropy;
  return t;
}

// Lets the card's shadows fade by a uniform (0 = unshadowed, 1 = fully): a
// card carried out of the sun's shadow box would otherwise show the box's
// hard edge sweeping across it. (As the newsstand's papers do.)
function fadeShadows(mat, uniform) {
  mat.onBeforeCompile = (shader) => {
    shader.uniforms.shadowMix = uniform;
    const chunk = THREE.ShaderChunk.lights_fragment_begin
      .replace(/\? (getShadow|getPointShadow)\(/g, '? mix( 1.0, $1(')
      .replace(/\) : 1\.0;/g, '), shadowMix ) : 1.0;');
    shader.fragmentShader = 'uniform float shadowMix;\n'
      + shader.fragmentShader.replace('#include <lights_fragment_begin>', chunk);
  };
  mat.customProgramCacheKey = () => 'fadeShadows';
}

export class HerbDrawer {
  constructor(data, slot, mats, index) {
    this.kind = 'drawer';
    this.data = data;
    this.slot = slot;
    this.side = 0;   // 0: front of the card, 1: the back
    this.hover = 0;
    this.painted = false;

    this.drawer = makeDrawerBody(mats, 11 + index * 17);
    this.drawer.name = `drawer_${data.id}`;
    slot.add(this.drawer);

    // the paper label behind the brass frame
    const { w, h, bar, y } = DRAWER.label;
    const label = new THREE.Mesh(
      new THREE.PlaneGeometry(w - 2 * bar + 0.001, h - 2 * bar + 0.001),
      new THREE.MeshStandardMaterial({ map: tex(paintLabel(data)), roughness: 0.9 }),
    );
    label.position.set(0, y, 0.0024);
    this.drawer.add(label);

    // the specimen card
    this.cardMount = this.drawer.userData.cardMount;
    this.cardRest = this.drawer.userData.cardRest;
    this.frontMat = new THREE.MeshStandardMaterial({ color: CARD_STOCK, roughness: 0.92 });
    this.backMat = new THREE.MeshStandardMaterial({ color: CARD_STOCK, roughness: 0.92 });
    const edge = new THREE.MeshStandardMaterial({ color: '#ddd0b2', roughness: 0.95 });
    // BoxGeometry material order: +x, -x, +y, -y, +z (front), -z (back)
    const card = new THREE.Mesh(new THREE.BoxGeometry(CARD.W, CARD.H, CARD.T), [edge, edge, edge, edge, this.frontMat, this.backMat]);
    card.castShadow = card.receiveShadow = true;
    this.flip = new THREE.Group();
    this.flip.add(card);
    this.root = new THREE.Group();
    this.root.name = `card_${data.id}`;
    this.root.add(this.flip);
    this.root.position.copy(this.cardMount);
    this.root.quaternion.copy(this.cardRest);
    this.drawer.add(this.root);
    this.card = card;

    this.shadowMix = { value: 1 };
    for (const m of [this.frontMat, this.backMat, edge]) fadeShadows(m, this.shadowMix);

    this.drawer.traverse((o) => { if (o.isMesh) o.userData.item = this; });
  }

  get title() { return this.data.common; }
  get meta() { return `${this.data.latin} · No. ${this.data.no}`; }
  get spreadCount() { return 2; }
  positionLabel() { return this.side ? 'Back' : 'Front'; }

  // the card's faces, in words, for screen readers
  readText() {
    const d = this.data;
    return this.side
      ? [`Traditional use. ${d.use}`, `Preparation. ${d.prep}`]
      : [`${d.common}, ${d.latin}, ${d.family}.`, `Part used: ${d.part}.`, `Gathered: ${d.gathered}.`];
  }

  // the area the card covers in reading space
  frame() { return { w: CARD.W, h: CARD.H, cx: 0, cy: 0 }; }

  paint() {
    if (this.painted) return;
    this.painted = true;
    for (const [mat, paint] of [[this.frontMat, paintCardFront], [this.backMat, paintCardBack]]) {
      mat.map = tex(paint(this.data));
      mat.color.set(0xffffff);
      mat.needsUpdate = true;
    }
  }

  setOut(z) { this.drawer.position.z = z; }
  setShadowMix(v) { this.shadowMix.value = v; }
  castShadows(on) { this.card.castShadow = on; }

  // turn the card over about its upright axis, lifting it toward you a
  // little as it turns so its edge never clips the view
  async flipTo(side, ms = 650) {
    if (side === this.side) return false;
    const from = this.flip.rotation.y, to = side * Math.PI;
    this.side = side;
    await tween(ms, (k) => {
      this.flip.rotation.y = THREE.MathUtils.lerp(from, to, k);
      this.flip.position.z = Math.sin(Math.PI * k) * CARD.W * 0.25;
    }, ease.inOut);
    return true;
  }
}
