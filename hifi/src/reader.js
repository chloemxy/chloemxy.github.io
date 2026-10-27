// Hover, take out, read, put back. Hovering a drawer eases it out a little.
// Taking a card out is one continuous motion: the drawer slides open, the
// card rises out of it and comes to you, straightening to face you, while
// the drawer slides shut behind it. Putting back is the reverse. Nothing
// fades: the cabinet stays in view behind the card. A small control bar
// turns the card over, and its text is mirrored for screen readers.

import * as THREE from 'three';
import { tween, ease } from './anim.js?v=20261027175029';
import { sound } from './sound.js?v=20261027175029';

// k of a stage running from a to b ms, eased; 0 before it starts, 1 after
const seg = (t, a, b, e = ease.inOut) => e(THREE.MathUtils.clamp((t - a) / (b - a), 0, 1));
const linear = (k) => k;

const OUT = 0.17;        // how far a drawer opens to take a card out (m)
const PEEK = 0.026;      // how far it eases out under the pointer
const LIFT = 0.1;        // how high the card rises out of the drawer

const $ = (id) => document.getElementById(id);

export class Reader {
  constructor({ camera, canvas, items, cols }) {
    Object.assign(this, { camera, canvas, items, cols });
    this.state = 'idle';
    this.held = null;
    this.hovered = null;
    this.opener = null;
    this.ray = new THREE.Raycaster();
    this.ndc = new THREE.Vector2();
    this.meshes = [];
    for (const it of items) it.drawer.traverse((o) => o.isMesh && this.meshes.push(o));

    this.ui = {
      tip: $('tip'), bar: $('reader'), text: $('reader-text'), count: $('reader-count'),
      turn: $('reader-turn'), close: $('reader-close'), index: $('index-list'),
    };
    this.buildIndex();
    this.bind();
  }

  // left to right across the cabinet, -1 to 1, for stereo
  pan(item) { return ((item.slot.userData.col ?? 1.5) / (this.cols - 1) - 0.5) * 1.2; }

  buildIndex() {
    for (const it of this.items) {
      const li = document.createElement('li');
      const b = document.createElement('button');
      b.type = 'button';
      const meta = document.createElement('small');
      meta.textContent = it.data.latin;
      b.append(it.title, meta);
      b.setAttribute('aria-label', `Take out the card for ${it.title}, drawer ${it.data.no}`);
      b.addEventListener('click', () => { this.closeIndex(); this.pick(it, b); });
      li.append(b);
      this.ui.index.append(li);
    }
    const count = document.getElementById('index-count');
    if (count) count.textContent = String(this.items.length);

    // the list closes on a click anywhere outside it, or Escape; that
    // click only closes the list, it doesn't also open a drawer
    this.details = this.ui.index.closest('details');
    const summary = this.details?.querySelector('summary');
    this.details?.addEventListener('toggle', () => {
      if (summary) summary.textContent = this.details.open ? 'Close' : 'Browse the cabinet';
      if (this.details.open) this.setHover(null);
    });
    document.addEventListener('pointerdown', (e) => {
      if (!this.details?.open || this.details.contains(e.target)) return;
      this.closeIndex();
      e.stopPropagation();
    }, true);
    addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.details?.open) { this.closeIndex(); summary?.focus(); }
    });
  }

  closeIndex() { if (this.details) this.details.open = false; }

  bind() {
    const c = this.canvas;
    let down = null;
    c.addEventListener('pointerdown', (e) => { down = { x: e.clientX, y: e.clientY }; this.setHover(null, true); });
    c.addEventListener('pointerup', (e) => {
      if (!down || Math.hypot(e.clientX - down.x, e.clientY - down.y) > 6) return;
      down = null;
      this.click(e);
    });
    c.addEventListener('pointermove', (e) => this.move(e));
    c.addEventListener('pointerleave', () => this.setHover(null));
    this.ui.turn.addEventListener('click', () => this.turn(this.held?.side ? -1 : 1));
    this.ui.close.addEventListener('click', () => this.putBack());
    addEventListener('keydown', (e) => {
      if (this.state !== 'reading') return;
      if (e.key === 'Escape') this.putBack();
      else if (e.key === 'ArrowRight') this.turn(1);
      else if (e.key === 'ArrowLeft') this.turn(-1);
    });
  }

  hit(e, meshes) {
    const r = this.canvas.getBoundingClientRect();
    this.ndc.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
    this.ray.setFromCamera(this.ndc, this.camera);
    return this.ray.intersectObjects(meshes, false)[0] || null;
  }

  move(e) {
    if (this.state !== 'idle' || e.pointerType === 'touch' || e.buttons || this.details?.open) return;
    const h = this.hit(e, this.meshes);
    this.setHover(h ? h.object.userData.item : null);
    if (this.hovered) {
      // a small card by the cursor: the herb's name, its Latin name and
      // drawer, flipped to the other side of the cursor near the edges
      const tip = this.ui.tip;
      if (tip.dataset.id !== this.hovered.data.id) {
        tip.dataset.id = this.hovered.data.id;
        const meta = document.createElement('small');
        meta.textContent = this.hovered.meta;
        tip.replaceChildren(this.hovered.title, meta);
      }
      const gap = 20, w = tip.offsetWidth, h = tip.offsetHeight;
      const x = e.clientX + gap + w > innerWidth ? e.clientX - gap - w : e.clientX + gap;
      const y = e.clientY + gap + h > innerHeight ? e.clientY - gap - h : e.clientY + gap;
      tip.style.transform = `translate(${x}px, ${y}px)`;
    }
  }

  setHover(item, quiet = false) {
    // the drawer slides out a touch as the pointer arrives, and back when left
    if (item && item !== this.hovered) { sound.peek(this.pan(item)); item.paint(); }
    if (!quiet && this.hovered && item !== this.hovered && this.state === 'idle') sound.unpeek(this.pan(this.hovered));
    this.hovered = item;
    this.ui.tip.hidden = !item;
    this.canvas.classList.toggle('over', !!item); // the scene's cursor (style.css)
  }

  click(e) {
    if (this.state === 'idle') {
      const h = this.hit(e, this.meshes);
      if (h) this.pick(h.object.userData.item, null);
    } else if (this.state === 'reading') {
      // the card itself turns it over; anywhere else puts it back
      const h = this.hit(e, [this.held.card]);
      if (h) this.turn(this.held.side ? -1 : 1);
      else this.putBack();
    }
  }

  // Where the card sits in camera space: as large as fits between the top
  // bar and the control bar, centred.
  heldPose(item) {
    const f = item.frame();
    const vw = innerWidth, vh = innerHeight;
    const top = document.querySelector('.bar').offsetHeight;
    const bottom = vh - (this.ui.bar.offsetHeight || 72) - 24;
    const tanH = Math.tan(THREE.MathUtils.degToRad(this.camera.fov) / 2);
    const availH = (bottom - top) / vh;
    const fill = 0.8;
    const d = Math.max(f.h / (2 * tanH * availH * fill), f.w / (2 * tanH * this.camera.aspect * fill));
    const sy = (0.5 - (top + bottom) / 2 / vh) * 2 * d * tanH;
    return { position: new THREE.Vector3(-f.cx, sy - f.cy, -d), quaternion: new THREE.Quaternion(), scale: 1 };
  }

  // the card's place in camera space with its drawer open `out` metres and
  // the card raised `lift` above its seat (and a little forward with it)
  cardPoint(item, out, lift) {
    const p = item.cardMount.clone();
    p.y += lift; p.z += out + lift * 0.3;
    return this.camera.worldToLocal(item.slot.localToWorld(p));
  }

  // the card's resting turn, in camera space
  cardQuat(item) {
    const q = item.slot.getWorldQuaternion(new THREE.Quaternion()).multiply(item.cardRest);
    return this.camera.getWorldQuaternion(new THREE.Quaternion()).invert().multiply(q);
  }

  async pick(item, opener) {
    if (this.state !== 'idle') return;
    this.state = 'busy';
    this.opener = opener;
    this.setHover(null, true);
    document.body.classList.add('reading');
    this.held = item;
    item.paint();
    item.castShadows(false); // in hand: lit, but no self-shadowing flicker

    const root = item.root;
    this.camera.updateMatrixWorld();
    this.camera.attach(root);
    const q0 = root.quaternion.clone();
    const z0 = item.drawer.position.z;
    const held = this.heldPose(item);
    const pan = this.pan(item);
    sound.pull(pan);

    // One timeline, its stages overlapping so nothing pauses (ms):
    //   0–550     the drawer slides open
    //   300–800   the card rises out of it
    //   650–1400  and comes to you, turning to face you; its shadows fade
    //             as it leaves the cabinet's light
    //   1000–1500 the drawer slides shut behind it
    let lifted = false, shut = false;
    await tween(1500, (k) => {
      const t = k * 1500;
      const O = seg(t, 0, 550), L = seg(t, 300, 800, ease.out), F = seg(t, 650, 1400), C = seg(t, 1000, 1500);
      const out = THREE.MathUtils.lerp(z0, OUT, O);
      item.setOut(C > 0 ? OUT * (1 - C) : out);
      root.position.lerpVectors(this.cardPoint(item, out, LIFT * L), held.position, F);
      root.position.y += Math.sin(Math.PI * F) * 0.015;
      root.quaternion.slerpQuaternions(q0, held.quaternion, F);
      item.setShadowMix(1 - seg(t, 650, 950));
      if (!lifted && t >= 300) { lifted = true; sound.lift(); }
      if (!shut && t >= 1000) { shut = true; sound.shut(pan); }
    }, linear);
    item.setOut(0);
    this.showControls();
    this.state = 'reading';
  }

  async putBack() {
    if (this.state !== 'reading') return;
    this.state = 'busy';
    const item = this.held, root = item.root;
    this.hideControls();
    const pan = this.pan(item);
    sound.pull(pan);
    const turning = item.flipTo(0);

    this.camera.updateMatrixWorld();
    const p0 = root.position.clone(), q0 = root.quaternion.clone();
    const qHome = this.cardQuat(item);

    // One timeline, the reverse of taking out (ms):
    //   0–500     the drawer slides open (the card turns back to its front)
    //   250–1000  the card flies back to just above the open drawer
    //   1000–1300 and drops into its place at the front of the stack
    //   1300–1750 the drawer slides shut with it
    let shut = false;
    await tween(1750, (k) => {
      const t = k * 1750;
      const O = seg(t, 0, 500), B = seg(t, 250, 1000), D = seg(t, 1000, 1300), C = seg(t, 1300, 1750);
      item.setOut(C > 0 ? OUT * (1 - C) : OUT * O);
      if (t < 1000) {
        root.position.lerpVectors(p0, this.cardPoint(item, OUT, LIFT), B);
        root.position.y += Math.sin(Math.PI * B) * 0.015;
      } else root.position.copy(this.cardPoint(item, OUT * (1 - C), LIFT * (1 - D)));
      root.quaternion.slerpQuaternions(q0, qHome, B);
      item.setShadowMix(seg(t, 700, 1000));
      if (!shut && t >= 1300) { shut = true; sound.shut(pan); }
    }, linear);
    await turning;

    item.drawer.add(root);
    root.position.copy(item.cardMount);
    root.quaternion.copy(item.cardRest);
    item.castShadows(true);
    item.setOut(0);
    item.hover = 0;
    this.held = null;
    this.state = 'idle';
    document.body.classList.remove('reading');
    (this.opener || this.canvas).focus({ preventScroll: true });
  }

  async turn(dir) {
    if (this.state !== 'reading') return;
    const item = this.held;
    const side = THREE.MathUtils.clamp(item.side + dir, 0, 1);
    if (side === item.side) return;
    this.state = 'busy';
    sound.flip();
    await item.flipTo(side);
    this.renderControls();
    this.state = 'reading';
  }

  showControls() {
    this.renderControls();
    this.ui.bar.hidden = false;
    this.ui.turn.focus({ preventScroll: true });
  }

  hideControls() { this.ui.bar.hidden = true; }

  renderControls() {
    const it = this.held, ui = this.ui;
    ui.count.textContent = it.positionLabel();
    ui.turn.setAttribute('aria-label', it.side ? 'Turn the card back to its front' : 'Turn the card over');
    ui.text.replaceChildren(...[it.title, ...it.readText()].map((t) => Object.assign(document.createElement('p'), { textContent: t })));
  }

  onResize() {
    if (this.state !== 'reading' || !this.held) return;
    this.held.root.position.copy(this.heldPose(this.held).position);
  }

  update(dt) {
    const k = 1 - Math.exp(-dt * 10);
    for (const it of this.items) {
      if (it === this.held) continue;
      const goal = it === this.hovered ? 1 : 0;
      if (Math.abs(it.hover - goal) < 0.0005) continue;
      it.hover += (goal - it.hover) * k;
      it.setOut(PEEK * it.hover);
    }
  }
}
