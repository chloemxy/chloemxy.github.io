// A pull-out bin (v2) and the curios resting in it. `setOpen(k)` slides
// the tray out and swings its lid up together: 0 shut, 1 fully open. Some
// bins are a little beaten up: they rest slightly ajar, or their lid sags.
//
// Each curio has three nested groups: `root` places it (in its bin, or in
// your hand), `spin` turns it about its own upright, and the model inside
// is offset so its centre sits at root's origin, so it turns in place.

import * as THREE from 'three';
import { makeBinBody, BIN } from './bincabinet.js?v=20261027191214';
import { makeCurio, curioSound, SCALE } from './trinkets.js?v=20261027191214';
import { bedMaterial } from './materials.js?v=20261027191214';
import { flat, BOOK, bookStand } from './portfolio.js?v=20261027191214';

function seeded(seed) {
  let s = seed >>> 0 || 1;
  return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296);
}

export class Curio {
  constructor(data, bin, mount, yaw) {
    Object.assign(this, { data, bin, mount, yaw });
    this.sound = data.sound ?? curioSound(data.type);
    // the view in hand: flat things tip toward you so you see their faces
    this.tilt = data.tilt ?? (['necklace', 'bracelet', 'key', 'charm', 'rune', 'bundle', 'pendulum', 'point', ...flat].includes(data.type) ? 0.95 : 0.22);
    const model = makeCurio(data);
    const box = new THREE.Box3().setFromObject(model);
    const centre = box.getCenter(new THREE.Vector3());
    this.radius = box.getBoundingSphere(new THREE.Sphere()).radius;
    this.lift = centre.y; // how far root sits above the bed
    model.position.sub(centre);
    this.spin = new THREE.Group();
    this.spin.add(model);
    this.root = new THREE.Group();
    this.root.name = `curio_${data.name}`;
    this.root.add(this.spin);
    this.meshes = [];
    model.traverse((o) => o.isMesh && this.meshes.push(o));
    this.seat();
  }

  get title() { return this.data.name; }

  // back in its place in the bin
  seat() {
    this.bin.group.add(this.root);
    this.root.position.copy(this.mount).add(new THREE.Vector3(0, this.lift, 0));
    this.root.quaternion.identity();
    this.root.scale.set(1, 1, 1);
    this.spin.rotation.set(0, this.yaw, 0);
    this.castShadows(true);
  }

  castShadows(on) { for (const m of this.meshes) m.castShadow = on && !m.material.transparent; }
}

export class Bin {
  constructor(data, slot, mats, index) {
    this.kind = 'bin';
    this.data = data;
    this.slot = slot;
    this.hover = 0;
    this.open = 0;
    const r = seeded(31 + index * 7);
    // wear and tear: a few rest a touch ajar, and some lids sag (not on a
    // pristine cabinet, where every bin sits square)
    this.ajar = !mats.pristine && r() < 0.3 ? 0.004 + r() * 0.01 : 0;
    this.sag = !mats.pristine && r() < 0.45 ? r() * 0.07 : 0;
    const body = makeBinBody(mats, 21 + index * 13, data.bed ? bedMaterial(data.bed, 5 + index) : null, { flat: data.bed?.flat });
    this.group = body.bin;
    this.group.name = `bin_${data.id}`;
    this.lid = body.lid;
    slot.add(this.group, this.lid);

    // the curios side by side across the bed, the middle one set back
    const n = data.items.length;
    this.items = data.items.map((d, i) => {
      // placed by hand (`at`), or set out in a row
      if (d.at) {
        const [x, z] = d.at;
        return new Curio(d, this, new THREE.Vector3(x, body.bedSurface(x, z), z), d.yaw ?? 0);
      }
      const x = (i - (n - 1) / 2) * (n > 2 ? 0.095 : 0.11);
      const z = -0.09 - (n > 2 && i === 1 ? 0.035 : 0) - r() * 0.01;
      const mount = new THREE.Vector3(x, body.bedSurface(x, z) - 0.002, z);
      return new Curio(d, this, mount, (r() - 0.5) * 1.2);
    });
    // a portfolio drawer holds its case study's book, open on a stand near
    // the front (the book isn't one of `items`: the reader brings it out on
    // its own, and the stand stays)
    if (data.hero) {
      const front = -0.06, y = body.bedSurface(0, front);
      const stand = bookStand();
      stand.position.set(0, y, front);
      this.group.add(stand);
      this.book = new Curio({ type: 'casebook', name: `${data.name} book`, project: data, tilt: BOOK.lean, scale: 1 / SCALE }, this, new THREE.Vector3(), 0);
      // mounted so its bottom edge stands on the ledge (the model is offset
      // by its own centre, so allow for that)
      const c = this.book.spin.children[0].position;
      this.book.mount.set(-c.x, y + BOOK.ledge, front - c.z);
      this.book.seat();
    }
    for (const part of [this.group, this.lid]) part.traverse((o) => { if (o.isMesh) o.userData.bin = this; });
    this.setOpen(0);
  }

  get title() { return this.data.name; }
  get meta() { return this.data.meta ?? (this.items.length > 1 ? `${this.items.length} pieces` : '1 piece'); }

  // 0 shut (or as shut as it gets), 1 pulled fully out with the lid swung
  // up. The lid leads the tray a little, so it always clears the strip.
  setOpen(k) {
    this.open = k;
    this.group.position.z = this.ajar + (BIN.out - this.ajar) * k;
    this.lid.rotation.x = -(this.sag + (BIN.lid - this.sag) * Math.min(1, k * 1.15));
    this.group.updateWorldMatrix(true, false);
  }
}
