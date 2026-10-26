// Hover, take out, look, put back, for the bin cabinet (v2). Hovering a bin
// draws it out a little, its lid lifting. Clicking pulls it right out with
// the lid swung up over it, and its front curio rises off the bed and comes
// to you, turning slowly in your hand; drag to turn it yourself. A caption
// names it. The bin stays open while you look, so ‹ and › swap what you're
// holding for the bin's other pieces. Putting back returns it and pushes
// the bin shut, the lid dropping closed in front of it.
//
// The portfolio bins open differently ("staging"): each holds the case
// study's book, open on a stand at its hero picture. The drawer pulls out
// where it is (the camera stays put) and the book flies out of it to the
// middle of the screen, where it hands over to a book on the page
// (flipbook.js), open at the same picture, whose pages turn to the case
// study's title, summary and longer read, with the link straight to the
// case study. A click off the book, or Back, puts it away again.

import * as THREE from 'three';
import { tween, ease } from './anim.js';
import { sound } from './sound.js';
import { CONFIG } from './config.js';
import { FlipBook } from './flipbook.js';

const seg = (t, a, b, e = ease.inOut) => e(THREE.MathUtils.clamp((t - a) / (b - a), 0, 1));
const linear = (k) => k;
const still = matchMedia('(prefers-reduced-motion: reduce)');

const PEEK = 0.16;   // how far open a bin tips under the pointer (0..1)
const LIFT = 0.025;  // how high a curio rises off the bed before it flies (it
                     // stays under the raised lid, then heads out forward)
const SPIN = 0.45;   // radians a second it turns in your hand
// a portfolio drawer, ms: it opens while its book is set on the page, and the
// book flies out as soon as it is, the drawer still sliding; back, the
// drawer starts to shut as the book comes down into it
const OPEN = 420, FLY = 620, FLY_BACK = 480, SHUT = 420;

const $ = (id) => document.getElementById(id);

export class BinReader {
  constructor({ camera, canvas, bins, cols }) {
    Object.assign(this, { camera, canvas, bins, cols });
    this.state = 'idle';
    this.bin = null;      // the open bin
    this.held = null;     // the curio in hand
    this.hovered = null;
    this.opener = null;
    this.drag = null;
    this.idleSpin = 0;    // seconds until it turns by itself again after a drag
    this.ray = new THREE.Raycaster();
    this.ndc = new THREE.Vector2();
    this.meshes = [];
    for (const b of bins) for (const part of [b.group, b.lid]) part.traverse((o) => o.isMesh && this.meshes.push(o));

    this.ui = {
      tip: $('tip'), bar: $('reader'), text: $('reader-text'), count: $('reader-count'),
      turn: $('reader-turn'), close: $('reader-close'), prev: $('reader-prev'), next: $('reader-next'),
      index: $('index-list'), caption: $('caption'),
      stage: $('stage'), title: $('stage-title'), back: $('stage-back'), veil: $('veil'), dim: $('stage-dim'),
    };
    this.bookOut = false; // the drawer's book out on the page
    this.flip = new FlipBook(this.ui.stage, {
      // (the page the book was read from, or the drawer's own link)
      href: (d, c) => new URL(c?.page ?? d.href, CONFIG.caseStudies).href,
      onTurn: () => sound.flip(),
    });
    this.stage = null;    // the portfolio bin standing open
    this.ui.prev.hidden = this.ui.next.hidden = false;
    this.ui.prev.setAttribute('aria-label', 'Previous piece in this bin');
    this.ui.next.setAttribute('aria-label', 'Next piece in this bin');
    this.ui.turn.hidden = true;
    this.buildIndex();
    // empty bins (no curios anywhere): nothing to list, so no list
    this.empty = bins.every((b) => !b.items.length && !b.book);
    if (this.empty) document.querySelector('.index')?.setAttribute('hidden', '');
    this.opened = new Set(); // empty bins standing open
    this.bind();
  }

  pan(bin) { return ((bin.slot.userData.col ?? 0.5) / (this.cols - 1) - 0.5) * 1.2; }

  // one entry a drawer, straight to it opened
  buildIndex() {
    for (const bin of this.bins) {
      if (!bin.items.length && !bin.book) continue;
      const li = document.createElement('li');
      const b = document.createElement('button');
      b.type = 'button';
      const meta = document.createElement('small');
      meta.textContent = bin.meta;
      b.append(bin.title, meta);
      b.setAttribute('aria-label', `Open ${bin.title}`);
      b.addEventListener('click', () => { this.closeIndex(); if (bin.book) this.present(bin, b); else this.pick(bin, 0, b); });
      li.append(b);
      this.ui.index.append(li);
    }
    const count = document.getElementById('index-count');
    if (count) count.textContent = String(this.ui.index.children.length);
    const head = document.querySelector('.index-head span');
    if (head) head.textContent = 'Case studies';

    this.details = this.ui.index.closest('details');
    const summary = this.details?.querySelector('summary');
    if (summary) summary.textContent = 'All work';
    this.details?.addEventListener('toggle', () => {
      if (summary) summary.textContent = this.details.open ? 'Close' : 'All work';
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
    c.addEventListener('pointerdown', (e) => {
      down = { x: e.clientX, y: e.clientY };
      this.setHover(null, true);
      if (this.state === 'reading') { this.drag = { x: e.clientX, y: e.clientY }; c.setPointerCapture(e.pointerId); }
    });
    c.addEventListener('pointerup', (e) => {
      this.drag = null;
      if (!down || Math.hypot(e.clientX - down.x, e.clientY - down.y) > 6) { down = null; return; }
      down = null;
      this.click(e);
    });
    c.addEventListener('pointermove', (e) => {
      if (this.drag && this.held) {
        // drag to turn it: across spins it, up and down tips it
        this.held.spin.rotation.y += (e.clientX - this.drag.x) * 0.012;
        this.held.root.rotateX((e.clientY - this.drag.y) * 0.008);
        this.drag = { x: e.clientX, y: e.clientY };
        this.idleSpin = 2.5;
        return;
      }
      this.move(e);
    });
    c.addEventListener('pointerleave', () => this.setHover(null));
    this.ui.prev.addEventListener('click', () => this.step(-1));
    this.ui.next.addEventListener('click', () => this.step(1));
    this.ui.close.addEventListener('click', () => this.putBack());
    this.ui.back.addEventListener('click', () => this.dismiss());
    // a scroll anywhere, once the book's out, turns its pages
    addEventListener('wheel', (e) => {
      if (this.state === 'presenting' && this.bookOut) this.flip.wheel(e);
    }, { passive: true });
    this.ui.stage.addEventListener('click', (e) => {
      const a = e.target.closest('a.book-read');
      if (a) this.go(e, a);
    });
    // back from a case study (the page kept as it was): lift the veil
    addEventListener('pageshow', () => this.ui.veil.classList.remove('on'));
    addEventListener('keydown', (e) => {
      if (this.state === 'presenting') {
        if (e.key === 'Escape') this.dismiss();
        else if (['ArrowRight', 'PageDown'].includes(e.key)) this.flip.turn(1);
        else if (['ArrowLeft', 'PageUp'].includes(e.key)) this.flip.turn(-1);
        return;
      }
      if (this.state !== 'reading') return;
      if (e.key === 'Escape') this.putBack();
      else if (e.key === 'ArrowRight') this.step(1);
      else if (e.key === 'ArrowLeft') this.step(-1);
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
    this.setHover(h ? h.object.userData.bin : null);
    if (this.hovered) {
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

  setHover(bin, quiet = false) {
    if (bin && bin !== this.hovered && !this.opened?.has(bin)) sound.peek(this.pan(bin));
    if (!quiet && this.hovered && bin !== this.hovered && this.state === 'idle' && !this.opened?.has(this.hovered)) sound.unpeek(this.pan(this.hovered));
    this.hovered = bin;
    this.ui.tip.hidden = !bin || !bin.title; // an empty, unnamed bin has nothing to say
    this.canvas.classList.toggle('over', !!bin);
  }

  click(e) {
    if (this.state === 'idle') {
      const h = this.hit(e, this.meshes);
      const bin = h?.object.userData.bin;
      if (bin?.book) this.present(bin, null);
      else if (bin && !bin.items.length) this.toggle(bin);
      else if (bin) this.pick(bin, 0, null);
    } else if (this.state === 'presenting') {
      // anywhere off the book puts it away
      this.dismiss();
    } else if (this.state === 'reading') {
      // a click on the curio itself does nothing (that's for turning it);
      // anywhere else puts it back
      if (!this.hit(e, this.held.meshes)) this.putBack();
    }
  }

  // Where a curio sits in camera space when held: big enough to see well,
  // centred between the top bar and the controls (and above the caption).
  heldPosition(item) {
    const vh = innerHeight;
    const top = document.querySelector('.bar').offsetHeight;
    const bottom = vh - (this.ui.bar.offsetHeight || 72) - (this.ui.caption?.offsetHeight || 64) - 40;
    const tanH = Math.tan(THREE.MathUtils.degToRad(this.camera.fov) / 2);
    const availH = (bottom - top) / vh;
    const d = Math.max(item.radius / (tanH * availH * 1.15), item.radius / (tanH * this.camera.aspect * 0.5));
    // a shifted lens (main.js) moves the screen's middle off the camera's axis
    const shift = (this.camera.userData.shift || 0) * d;
    return new THREE.Vector3(0, (0.5 - (top + bottom) / 2 / vh) * 2 * d * tanH + shift, -d);
  }

  // how it's held: tipped toward you so you see its face
  heldQuat(item) { return new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1, 0, 0), item.tilt); }

  // a curio's seat in camera space, raised `lift` off the bed
  seatPoint(item, lift) {
    const p = item.mount.clone();
    p.y += item.lift + lift; p.z += lift * 0.3;
    return this.camera.worldToLocal(item.bin.group.localToWorld(p));
  }

  seatQuat(item) {
    const q = item.bin.group.getWorldQuaternion(new THREE.Quaternion());
    return this.camera.getWorldQuaternion(new THREE.Quaternion()).invert().multiply(q);
  }

  // It rises off the bed and flies to you. `at` is when it starts to rise.
  bringIn(item, at) {
    this.camera.updateMatrixWorld();
    this.camera.attach(item.root);
    item.castShadows(false);
    const q0 = item.root.quaternion.clone(), to = this.heldPosition(item), q1 = this.heldQuat(item);
    let lifted = false;
    return (t) => {
      const L = seg(t, at, at + 400, ease.out), F = seg(t, at + 250, at + 1000);
      item.root.position.lerpVectors(this.seatPoint(item, LIFT * L), to, F);
      item.root.position.y += Math.sin(Math.PI * F) * 0.015;
      item.root.quaternion.slerpQuaternions(q0, q1, F);
      if (!lifted && t >= at) { lifted = true; sound.pickup(item.sound); }
    };
  }

  // and back: from your hand to just above its seat, then down onto the bed
  sendBack(item, at) {
    this.camera.updateMatrixWorld();
    const p0 = item.root.position.clone(), q0 = item.root.quaternion.clone();
    const s0 = item.spin.rotation.y;
    // turn the shortest way back to how it lay
    const s1 = item.yaw + Math.round((s0 - item.yaw) / (Math.PI * 2)) * Math.PI * 2;
    let landed = false;
    return (t) => {
      const B = seg(t, at, at + 750), D = seg(t, at + 750, at + 1000);
      if (t < at + 750) {
        item.root.position.lerpVectors(p0, this.seatPoint(item, LIFT), B);
        item.root.position.y += Math.sin(Math.PI * B) * 0.015;
      } else item.root.position.copy(this.seatPoint(item, LIFT * (1 - D)));
      item.root.quaternion.slerpQuaternions(q0, this.seatQuat(item), B);
      item.spin.rotation.y = THREE.MathUtils.lerp(s0, s1, B);
      if (!landed && t >= at + 980) { landed = true; sound.setDown(item.sound); }
    };
  }

  async pick(bin, index, opener) {
    if (this.state !== 'idle') return;
    this.state = 'busy';
    this.opener = opener ?? this.opener;
    this.setHover(null, true);
    document.body.classList.add('reading');
    this.bin = bin;
    const item = bin.items[index];
    this.held = item;
    const k0 = bin.open;
    sound.pull(this.pan(bin));
    this.renderControls();
    this.ui.caption.hidden = false; // measured for the held position

    // 0–650 the bin pulls out, its lid swinging up; 350–1350 the curio
    // rises and comes to you
    let fly = null;
    await tween(1350, (k) => {
      const t = k * 1350;
      bin.setOpen(THREE.MathUtils.lerp(k0, 1, seg(t, 0, 650)));
      if (!fly && t >= 350) fly = this.bringIn(item, 350);
      fly?.(t);
    }, linear);
    this.showControls();
    this.state = 'reading';
  }

  // swap what's in hand for the next (or previous) piece in the bin
  async step(dir) {
    if (this.state !== 'reading') return;
    const items = this.bin.items;
    const i = items.indexOf(this.held), n = (i + dir + items.length) % items.length;
    if (n === i) return;
    this.state = 'busy';
    const old = this.held, next = items[n];
    const back = this.sendBack(old, 0);
    let fly = null;
    await tween(1500, (k) => {
      const t = k * 1500;
      back(t);
      if (!fly && t >= 450) fly = this.bringIn(next, 450);
      fly?.(t);
    }, linear);
    old.seat();
    this.held = next;
    this.renderControls();
    this.state = 'reading';
  }

  async putBack() {
    if (this.state !== 'reading') return;
    this.state = 'busy';
    const bin = this.bin, item = this.held;
    this.hideControls();
    const back = this.sendBack(item, 0);
    let shut = false;
    // 0–1000 the curio goes back to its bed; 950–1550 the bin slides shut
    await tween(1550, (k) => {
      const t = k * 1550;
      back(t);
      bin.setOpen(1 - seg(t, 950, 1550));
      if (!shut && t >= 950) { shut = true; sound.shut(this.pan(bin)); }
    }, linear);
    item.seat();
    bin.hover = 0;
    this.held = this.bin = null;
    this.state = 'idle';
    document.body.classList.remove('reading');
    (this.opener || this.canvas).focus({ preventScroll: true });
  }

  showControls() {
    this.renderControls();
    this.ui.bar.hidden = false;
    this.ui.caption.hidden = false;
    (this.bin.items.length > 1 ? this.ui.next : this.ui.close).focus({ preventScroll: true });
  }

  hideControls() { this.ui.bar.hidden = true; this.ui.caption.hidden = true; }

  renderControls() {
    const item = this.held, items = this.bin.items, ui = this.ui;
    const i = items.indexOf(item);
    ui.count.textContent = `${i + 1} / ${items.length}`;
    ui.prev.disabled = ui.next.disabled = items.length < 2;
    const name = document.createElement('strong');
    name.textContent = item.title;
    const blurb = document.createElement('span');
    blurb.textContent = item.data.blurb;
    ui.caption.replaceChildren(name, blurb);
    ui.text.replaceChildren(...[`${item.title}, ${i + 1} of ${items.length} in ${this.bin.data.name.toLowerCase()}.`, item.data.blurb]
      .map((t) => Object.assign(document.createElement('p'), { textContent: t })));
  }

  onResize() {
    // (where the book would fly back from)
    if (this.bookOut && this.state === 'presenting' && this.flip.narrow) {
      const { p, q } = this.bookTarget(this.flip.target());
      this.stage.book.root.position.copy(p); this.stage.book.root.quaternion.copy(q);
    }
    if (this.state !== 'reading' || !this.held) return;
    this.held.root.position.copy(this.heldPosition(this.held));
  }

  // ---- Staging: a portfolio drawer opened, its book out

  // the drawer pulls out where it is, and at the same time the book on the
  // page is laid out (unseen) and flies out of it
  async present(bin, opener) {
    if (this.state !== 'idle') return;
    this.state = 'busy';
    this.opener = opener;
    this.setHover(null, true);
    this.closeIndex();
    document.body.classList.add('staging');
    this.stage = bin;
    const d = bin.data, ui = this.ui, k0 = bin.open;
    sound.pull(this.pan(bin));
    const opening = tween(OPEN, (k) => bin.setOpen(THREE.MathUtils.lerp(k0, 1, k)));
    ui.title.textContent = d.name;
    ui.stage.hidden = false;
    await this.flip.open(d);
    if (this.stage !== bin) return; // (put away meanwhile)
    ui.back.hidden = false;
    ui.text.textContent = `${d.name}${d.lede ? `: ${d.lede}` : ''}. ${d.summary ?? ''}`;
    await Promise.all([this.bringBook(), opening]);
  }

  async bringBook() {
    const book = this.stage.book, ui = this.ui;
    this.state = 'busy';
    if (book && !this.flip.narrow) {
      // the book on the page flies out of the drawer itself, from just where
      // the one in the drawer stands, so its picture never changes colour
      // (the scene's film grade would tint a 3D book on its way)
      const from = this.seatRect(book);
      book.root.visible = false;
      ui.stage.classList.add('flying', 'on');
      ui.dim.classList.add('on');
      sound.pickup('paper');
      await this.flyBook(from, false);
      ui.stage.classList.remove('flying');
    } else if (book) {
      this.camera.updateMatrixWorld();
      this.camera.attach(book.root);
      book.castShadows(false);
      const p0 = book.root.position.clone(), q0 = book.root.quaternion.clone();
      const { p, q } = this.bookTarget(this.flip.target());
      book.root.position.copy(p0); book.root.quaternion.copy(q0);
      sound.pickup('paper');
      await tween(FLY, (k) => {
        book.root.position.lerpVectors(p0, p, k);
        book.root.position.y += Math.sin(Math.PI * k) * 0.02;
        book.root.quaternion.slerpQuaternions(q0, q, k);
      });
    }
    this.bookOut = true;
    ui.stage.classList.add('on');
    ui.dim.classList.add('on');
    this.state = 'presenting';
    ui.stage.querySelector('.book-next').focus({ preventScroll: true });
    // (the book on the page is over it by now)
    setTimeout(() => { if (book && this.bookOut) book.root.visible = false; }, 300);
  }

  // where the drawer's book goes, in front of the camera, so its cover
  // covers `rect` on screen exactly: found by moving it and looking again
  bookTarget(rect) {
    const book = this.stage.book, c = this.camera, root = book.root;
    const face = root.getObjectByName('face');
    const q = this.heldQuat(book), tanH = Math.tan(THREE.MathUtils.degToRad(c.fov) / 2), aspect = innerWidth / innerHeight;
    face.geometry.computeBoundingBox();
    const bb = face.geometry.boundingBox;
    const measure = () => {
      root.updateMatrixWorld(true);
      let x0 = Infinity, x1 = -Infinity, y0 = Infinity, y1 = -Infinity;
      for (let i = 0; i < 8; i++) {
        const v = new THREE.Vector3(i & 1 ? bb.max.x : bb.min.x, i & 2 ? bb.max.y : bb.min.y, i & 4 ? bb.max.z : bb.min.z)
          .applyMatrix4(face.matrixWorld).project(c);
        const x = (v.x + 1) / 2 * innerWidth, y = (1 - v.y) / 2 * innerHeight;
        x0 = Math.min(x0, x); x1 = Math.max(x1, x); y0 = Math.min(y0, y); y1 = Math.max(y1, y);
      }
      return { cx: (x0 + x1) / 2, cy: (y0 + y1) / 2, w: x1 - x0 };
    };
    root.quaternion.copy(q);
    root.position.set(0, 0, -0.6);
    for (let i = 0; i < 4; i++) {
      let m = measure();
      root.position.z *= m.w / rect.width;
      m = measure();
      const d = -root.position.z;
      root.position.x += ((rect.left + rect.width / 2) - m.cx) / innerWidth * 2 * d * tanH * aspect;
      root.position.y -= ((rect.top + rect.height / 2) - m.cy) / innerHeight * 2 * d * tanH;
    }
    return { p: root.position.clone(), q };
  }

  // the drawer's book, where it stands on screen, from its seat
  seatRect(book) {
    this.camera.updateMatrixWorld();
    book.root.updateMatrixWorld(true);
    const face = book.root.getObjectByName('face');
    face.geometry.computeBoundingBox();
    const bb = face.geometry.boundingBox;
    let x0 = Infinity, x1 = -Infinity, y0 = Infinity, y1 = -Infinity;
    for (let i = 0; i < 4; i++) {
      const v = new THREE.Vector3(i & 1 ? bb.max.x : bb.min.x, i & 2 ? bb.max.y : bb.min.y, 0).applyMatrix4(face.matrixWorld).project(this.camera);
      const x = (v.x + 1) / 2 * innerWidth, y = (1 - v.y) / 2 * innerHeight;
      x0 = Math.min(x0, x); x1 = Math.max(x1, x); y0 = Math.min(y0, y); y1 = Math.max(y1, y);
    }
    return { left: x0, top: y0, width: x1 - x0, height: y1 - y0 };
  }

  // the book on the page between the drawer (`rect`) and its place, out
  // (`back` false) or in; squashed a little at the drawer as the leaning
  // book is
  async flyBook(rect, back) {
    const el = this.flip.book, to = el.getBoundingClientRect();
    const dx = rect.left + rect.width / 2 - (to.left + to.width / 2), dy = rect.top + rect.height / 2 - (to.top + to.height / 2);
    const at = `translate(${dx}px, ${dy}px) scale(${rect.width / to.width}, ${rect.height / to.height})`;
    const frames = back ? [{ transform: 'none' }, { transform: at }] : [{ transform: at }, { transform: 'none' }];
    await el.animate(frames, { duration: still.matches ? 0 : back ? FLY_BACK : FLY, easing: back ? 'cubic-bezier(0.5, 0, 0.75, 0.3)' : 'cubic-bezier(0.16, 0.8, 0.24, 1)' }).finished;
  }

  // the book back into the drawer, from wherever it stands on screen; `shut`
  // starts the drawer shutting as it comes down into it
  async returnBook(shut) {
    const book = this.stage?.book;
    let shutting = null;
    const soon = (ms) => setTimeout(() => { shutting = shut(); }, still.matches ? 0 : ms);
    if (book && this.bookOut && !this.flip.narrow) {
      // the book on the page flies back in, open at its picture again
      this.bookOut = false;
      this.flip.close();
      this.ui.dim.classList.remove('on');
      this.ui.stage.classList.add('flying');
      const timer = soon(FLY_BACK * 0.85);
      await this.flyBook(this.seatRect(book), true);
      book.root.visible = true;
      this.hideStage();
      this.ui.stage.classList.remove('flying');
      sound.setDown('paper');
      await new Promise((res) => setTimeout(res, 0));
      if (!shutting) { clearTimeout(timer); shutting = shut(); }
      return shutting;
    }
    this.hideStage();
    if (!book || !this.bookOut) { this.bookOut = false; return shut(); }
    this.bookOut = false;
    book.root.visible = true;
    const back = this.sendBack(book, 0);
    const timer = soon(FLY_BACK * 0.85);
    await tween(FLY_BACK, (k) => back(k * 1000), linear);
    book.seat();
    if (!shutting) { clearTimeout(timer); shutting = shut(); }
    return shutting;
  }

  hideStage() {
    this.shown = false;
    this.ui.stage.classList.remove('on');
    this.ui.dim.classList.remove('on');
    this.ui.stage.hidden = true;
    this.ui.back.hidden = true;
  }

  // through to the case study: the page fades to its sand, then goes
  go(e, a) {
    const d = this.stage?.data;
    if (!d || d.soon) { e.preventDefault(); return; }
    if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || d.href.startsWith('mailto:')) return;
    e.preventDefault();
    this.ui.veil.classList.add('on');
    setTimeout(() => { location.href = a.href; }, still.matches ? 0 : 450);
  }

  // back to the wall: the book goes back into the drawer as it shuts
  async dismiss() {
    if (this.state !== 'presenting') return;
    this.state = 'busy';
    const bin = this.stage;
    await this.returnBook(() => {
      sound.shut(this.pan(bin));
      return tween(SHUT, (k) => bin.setOpen(1 - k));
    });
    bin.hover = 0;
    this.stage = null;
    this.state = 'idle';
    document.body.classList.remove('staging');
    (this.opener || this.canvas).focus({ preventScroll: true });
  }

  // an empty bin: pull it right out (lid up), or push it back in
  async toggle(bin) {
    if (bin.busy) return;
    bin.busy = true;
    const opening = !this.opened.has(bin);
    if (opening) this.opened.add(bin);
    const from = bin.open, to = opening ? 1 : 0;
    if (opening) sound.pull(this.pan(bin)); else sound.shut(this.pan(bin));
    await tween(opening ? 650 : 600, (k) => bin.setOpen(THREE.MathUtils.lerp(from, to, k)));
    if (!opening) { this.opened.delete(bin); bin.hover = 0; }
    bin.busy = false;
  }

  update(dt) {
    const k = 1 - Math.exp(-dt * 10);
    for (const b of this.bins) {
      if (b === this.bin || b === this.stage || b.busy || this.opened?.has(b)) continue;
      const goal = b === this.hovered ? 1 : 0;
      if (Math.abs(b.hover - goal) < 0.0005) continue;
      b.hover += (goal - b.hover) * k;
      b.setOpen(PEEK * b.hover);
    }
    // the piece in hand turns slowly, unless you've just turned it yourself
    if (this.state === 'reading' && this.held && !this.drag && !still.matches) {
      if (this.idleSpin > 0) this.idleSpin -= dt;
      else this.held.spin.rotation.y += SPIN * dt;
    }
  }
}
