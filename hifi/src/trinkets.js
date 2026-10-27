// The curios in the bins, modelled in code from simple shapes: crystal
// points and clusters, necklaces with moon and star pendants, beaded
// bracelets, gem rings, potion vials, candles, old keys, charms, tarot
// cards, rune stones, toadstools, herb bundles, a crystal ball, a tiny
// cauldron and pendulums. Sizes are in metres, close to life size (then
// scaled up a touch so they read from across the room).
//
// makeCurio(data) returns a group sitting on y = 0, centred in x and z, as
// it lies in its bin. `data.type` picks the builder; see `curios` in
// content.js for the options each one takes.

import * as THREE from 'three';
import { paintTarot, paintTarotBack, paintRune } from './paint.js?v=20261027191214';
import { builders as portfolio, sounds as portfolioSounds } from './portfolio.js?v=20261027191214';

export const SCALE = 1.35;
const TAU = Math.PI * 2;

function seeded(seed) {
  let s = seed >>> 0 || 1;
  return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296);
}
const hash = (str) => [...str].reduce((h, c) => (h * 31 + c.charCodeAt(0)) >>> 0, 7);

function tex(canvas) {
  const t = new THREE.CanvasTexture(canvas);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 8;
  return t;
}

// ---- Materials

const METALS = {
  gold: { color: '#d8ac4c', roughness: 0.28 },
  silver: { color: '#d9dadf', roughness: 0.22 },
  rose: { color: '#e3a58c', roughness: 0.28 },
  brass: { color: '#b98f45', roughness: 0.38 },
  iron: { color: '#5b3d2b', roughness: 0.75, metalness: 0.45 }, // rusty
  castIron: { color: '#2a2a2c', roughness: 0.6, metalness: 0.6 },
};
const metal = (name = 'gold') => new THREE.MeshStandardMaterial({ metalness: 1, ...METALS[name] });

// Faceted, see-through stone. Not glass with transmission: transmissive
// things vanish behind the bins' glass lids, so these are simply
// transparent, glossy and a little iridescent.
function gem(colour, { opacity = 0.8, iridescence = 0.35, flat = true } = {}) {
  return new THREE.MeshPhysicalMaterial({
    color: colour, roughness: 0.06, metalness: 0, transparent: true, opacity,
    clearcoat: 1, clearcoatRoughness: 0.04, iridescence, iridescenceIOR: 1.6,
    specularIntensity: 1, envMapIntensity: 2.2, flatShading: flat,
  });
}
const glassy = () => new THREE.MeshPhysicalMaterial({
  color: '#ffffff', roughness: 0.04, transparent: true, opacity: 0.26, clearcoat: 1,
  specularIntensity: 1, envMapIntensity: 2, side: THREE.DoubleSide, depthWrite: false,
});
const matte = (colour, roughness = 0.8) => new THREE.MeshStandardMaterial({ color: colour, roughness });
const glazed = (colour) => new THREE.MeshPhysicalMaterial({ color: colour, roughness: 0.35, clearcoat: 0.8, clearcoatRoughness: 0.2 });

const mesh = (geo, mat, x = 0, y = 0, z = 0) => {
  const m = new THREE.Mesh(geo, mat);
  m.position.set(x, y, z);
  return m;
};

// ---- Shapes for pendants and charms (flat, in the XY plane)

function crescent(R) {
  const r = R * 0.85, dx = R * 0.46;
  const x = (R * R - r * r + dx * dx) / (2 * dx), y = Math.sqrt(R * R - x * x);
  const a = Math.atan2(y, x), b = Math.atan2(y, x - dx);
  const s = new THREE.Shape();
  s.absarc(0, 0, R, a, TAU - a, false);
  s.absarc(dx, 0, r, TAU - b, b, true);
  return s;
}
function star(R, points = 5) {
  const s = new THREE.Shape();
  for (let i = 0; i <= points * 2; i++) {
    const a = Math.PI / 2 + (i / (points * 2)) * TAU, rr = i % 2 ? R * 0.45 : R;
    if (i === 0) s.moveTo(Math.cos(a) * rr, Math.sin(a) * rr); else s.lineTo(Math.cos(a) * rr, Math.sin(a) * rr);
  }
  return s;
}
function heart(R) {
  const s = new THREE.Shape();
  s.moveTo(0, -R);
  s.bezierCurveTo(R * 1.2, -R * 0.2, R * 0.9, R * 0.95, 0, R * 0.45);
  s.bezierCurveTo(-R * 0.9, R * 0.95, -R * 1.2, -R * 0.2, 0, -R);
  return s;
}
function charmShape(kind, R) {
  if (kind === 'moon') return crescent(R);
  if (kind === 'heart') return heart(R);
  return star(R);
}
function flatPiece(shape, depth, mat) {
  const g = new THREE.ExtrudeGeometry(shape, { depth, bevelEnabled: true, bevelThickness: depth * 0.3, bevelSize: depth * 0.3, bevelSegments: 2, curveSegments: 24 });
  g.center();
  return new THREE.Mesh(g, mat);
}

// ---- Builders

function crystalPoint(colour, r, h, mat = gem(colour)) {
  const g = new THREE.Group();
  g.add(mesh(new THREE.CylinderGeometry(r, r * 1.08, h, 6), mat, 0, h / 2, 0));
  g.add(mesh(new THREE.ConeGeometry(r, h * 0.45, 6), mat, 0, h + h * 0.225, 0));
  return g;
}

const BUILD = {
  // a single point, lying on its side
  point(d) {
    const p = crystalPoint(d.colour, 0.0085, 0.042);
    p.rotation.z = Math.PI / 2 - 0.15;
    return p;
  },

  // points of all sizes growing from a lump of matrix rock
  cluster(d, r) {
    const g = new THREE.Group();
    const rock = mesh(new THREE.DodecahedronGeometry(0.026, 0).scale(1, 0.42, 0.85), matte('#77707a', 0.9), 0, 0.008, 0);
    g.add(rock);
    const mat = gem(d.colour, { opacity: 0.85 });
    for (let i = 0; i < 11; i++) {
      const a = r() * TAU, rad = r() * 0.017;
      const p = crystalPoint(d.colour, 0.003 + r() * 0.005, 0.012 + r() * 0.03, mat);
      p.position.set(Math.cos(a) * rad, 0.008, Math.sin(a) * rad * 0.8);
      p.rotation.set(Math.sin(a) * (0.2 + r() * 0.5), r() * TAU, -Math.cos(a) * (0.2 + r() * 0.5));
      g.add(p);
    }
    return g;
  },

  // a fine chain lying in a loose teardrop, the pendant at its point
  necklace(d) {
    const g = new THREE.Group();
    const m = metal(d.metal);
    const pts = [];
    for (let i = 0; i < 48; i++) {
      const t = (i / 48) * TAU;
      pts.push(new THREE.Vector3(Math.sin(t) * 0.032 * (1 - 0.25 * Math.cos(t)), 0.0012, -Math.cos(t) * 0.028 + 0.004));
    }
    const curve = new THREE.CatmullRomCurve3(pts, true);
    g.add(new THREE.Mesh(new THREE.TubeGeometry(curve, 200, 0.001, 6, true), m));
    const pend = flatPiece(charmShape(d.charm, 0.011), 0.0025, m);
    pend.rotation.x = -Math.PI / 2;
    pend.position.set(0, 0.0018, 0.045);
    if (d.charm === 'moon') pend.rotation.z = Math.PI / 2;
    g.add(pend, mesh(new THREE.TorusGeometry(0.002, 0.0006, 6, 16), m, 0, 0.0015, 0.033));
    if (d.stone) g.add(mesh(new THREE.OctahedronGeometry(0.0035), gem(d.stone), 0, 0.004, 0.045));
    return g;
  },

  // a stretch of round beads in two colours
  bracelet(d, r) {
    const g = new THREE.Group();
    const mats = d.colours.map((c) => new THREE.MeshPhysicalMaterial({
      color: c, roughness: 0.2, clearcoat: 1, iridescence: d.iridescent ? 1 : 0.1, iridescenceIOR: 1.5,
    }));
    const n = 22, R = 0.026, br = 0.0042;
    for (let i = 0; i < n; i++) {
      const a = (i / n) * TAU;
      const s = br * (0.9 + r() * 0.2);
      g.add(mesh(new THREE.SphereGeometry(s, 16, 12), mats[(i + (r() < 0.2 ? 1 : 0)) % mats.length], Math.cos(a) * R, br, Math.sin(a) * R));
    }
    if (d.charm) {
      const c = flatPiece(charmShape(d.charm, 0.006), 0.0015, metal('gold'));
      c.rotation.x = -Math.PI / 2;
      c.position.set(0, 0.002, R + 0.01);
      g.add(c);
    }
    return g;
  },

  // a band standing up in the velvet, a faceted stone in a raised setting
  ring(d) {
    const g = new THREE.Group();
    const m = metal(d.metal);
    g.add(mesh(new THREE.TorusGeometry(0.0115, 0.0021, 14, 48), m, 0, 0.0136, 0));
    g.add(mesh(new THREE.CylinderGeometry(0.0038, 0.0024, 0.003, 12), m, 0, 0.0136 * 2 + 0.0008, 0));
    const stone = mesh(new THREE.OctahedronGeometry(0.0055, d.opal ? 1 : 0).scale(1, 0.8, 1), gem(d.gem, { opacity: d.opal ? 0.95 : 0.82, iridescence: d.opal ? 1 : 0.3, flat: !d.opal }), 0, 0.0136 * 2 + 0.0045, 0);
    g.add(stone);
    return g;
  },

  // a little round-shouldered bottle, a glowing potion, a cork and a ribbon
  vial(d) {
    const g = new THREE.Group();
    const prof = [[0, 0], [0.011, 0], [0.0125, 0.002], [0.0125, 0.032], [0.009, 0.039], [0.0045, 0.042], [0.0045, 0.051], [0.0056, 0.052]];
    g.add(new THREE.Mesh(new THREE.LatheGeometry(prof.map(([x, y]) => new THREE.Vector2(x, y)), 32), glassy()));
    const liquid = new THREE.MeshStandardMaterial({ color: d.liquid, emissive: d.liquid, emissiveIntensity: 0.35, roughness: 0.15 });
    g.add(mesh(new THREE.CylinderGeometry(0.011, 0.0105, 0.026, 28), liquid, 0, 0.015, 0));
    g.add(mesh(new THREE.CylinderGeometry(0.0049, 0.0043, 0.011, 16), matte('#b08452', 0.95), 0, 0.053, 0));
    const ribbon = mesh(new THREE.TorusGeometry(0.0053, 0.0009, 6, 24), matte(d.ribbon || '#d8b8e8', 0.7), 0, 0.044, 0);
    ribbon.rotation.x = Math.PI / 2;
    g.add(ribbon);
    return g;
  },

  // a short pillar candle on a brass dish, wax run down its sides, lit
  candle(d, r) {
    const g = new THREE.Group();
    g.add(mesh(new THREE.CylinderGeometry(0.017, 0.015, 0.003, 32), metal('brass'), 0, 0.0015, 0));
    const wax = new THREE.MeshStandardMaterial({ color: d.colour, roughness: 0.55, emissive: d.colour, emissiveIntensity: 0.08 });
    const h = 0.04;
    g.add(mesh(new THREE.CylinderGeometry(0.0105, 0.011, h, 32), wax, 0, 0.003 + h / 2, 0));
    for (let i = 0; i < 7; i++) {
      const a = r() * TAU, len = 0.004 + r() * 0.012;
      const drip = mesh(new THREE.SphereGeometry(1, 10, 8), wax, Math.cos(a) * 0.0104, 0.003 + h - len / 2, Math.sin(a) * 0.0104);
      drip.scale.set(0.0019, len / 2, 0.0019);
      g.add(drip);
    }
    g.add(mesh(new THREE.CylinderGeometry(0.0006, 0.0006, 0.006, 6), matte('#222'), 0, 0.003 + h + 0.003, 0));
    const flame = mesh(new THREE.SphereGeometry(1, 16, 12), new THREE.MeshBasicMaterial({ color: '#ffc867' }), 0, 0.003 + h + 0.011, 0);
    flame.scale.set(0.0033, 0.0085, 0.0033);
    const core = mesh(new THREE.SphereGeometry(1, 12, 8), new THREE.MeshBasicMaterial({ color: '#fff6dc' }), 0, 0.003 + h + 0.0085, 0);
    core.scale.set(0.0016, 0.004, 0.0016);
    g.add(flame, core);
    return g;
  },

  // an old key lying flat: a ring bow, a long shaft, a toothed bit
  key(d) {
    const g = new THREE.Group();
    const m = metal(d.metal);
    const bow = mesh(new THREE.TorusGeometry(0.0085, 0.0019, 10, 32), m, -0.026, 0.0019, 0);
    bow.rotation.x = Math.PI / 2;
    const inner = mesh(new THREE.TorusGeometry(0.0035, 0.0012, 8, 20), m, -0.026, 0.0019, 0);
    inner.rotation.x = Math.PI / 2;
    const shaft = mesh(new THREE.CylinderGeometry(0.0017, 0.0017, 0.044, 12), m, 0.004, 0.0019, 0);
    shaft.rotation.z = Math.PI / 2;
    const collar = mesh(new THREE.TorusGeometry(0.0022, 0.0011, 8, 16), m, -0.014, 0.0019, 0);
    collar.rotation.y = Math.PI / 2;
    g.add(bow, inner, shaft, collar,
      mesh(new THREE.BoxGeometry(0.0045, 0.0024, 0.009), m, 0.021, 0.0019, 0.0055),
      mesh(new THREE.BoxGeometry(0.003, 0.0024, 0.006), m, 0.0255, 0.0019, 0.0045));
    return g;
  },

  // a flat charm on a jump ring
  charm(d) {
    const g = new THREE.Group();
    const m = metal(d.metal);
    const c = flatPiece(charmShape(d.shape, 0.014), 0.003, m);
    c.rotation.x = -Math.PI / 2;
    if (d.shape === 'moon') c.rotation.z = -Math.PI / 4;
    c.position.y = 0.002;
    const ring = mesh(new THREE.TorusGeometry(0.003, 0.0007, 8, 20), m, 0, 0.001, -0.017);
    ring.rotation.x = Math.PI / 2;
    g.add(c, ring);
    if (d.stone) g.add(mesh(new THREE.OctahedronGeometry(0.003), gem(d.stone), 0, 0.0045, 0));
    return g;
  },

  // a tarot card leaning back in the velvet, painted face out
  tarot(d) {
    const g = new THREE.Group();
    const edge = matte('#e9dcc0', 0.9);
    const face = new THREE.MeshStandardMaterial({ map: tex(paintTarot(d)), roughness: 0.6 });
    const back = new THREE.MeshStandardMaterial({ map: tex(paintTarotBack()), roughness: 0.6 });
    const card = mesh(new THREE.BoxGeometry(0.05, 0.085, 0.0009), [edge, edge, edge, edge, face, back], 0, 0.0425, 0);
    const lean = new THREE.Group();
    lean.add(card);
    lean.rotation.x = -0.32;
    g.add(lean);
    return g;
  },

  // a smooth river pebble with a rune painted into it
  rune(d, r) {
    const g = new THREE.Group();
    const stone = mesh(new THREE.SphereGeometry(1, 32, 20), matte(['#8c8a86', '#77736d', '#9a958c'][Math.floor(r() * 3)], 0.7), 0, 0.0055, 0);
    stone.scale.set(0.014, 0.0058, 0.012);
    const glyph = mesh(new THREE.PlaneGeometry(0.016, 0.016), new THREE.MeshStandardMaterial({ map: tex(paintRune(d.glyph)), transparent: true, roughness: 0.6, depthWrite: false }), 0, 0.01145, 0);
    glyph.rotation.x = -Math.PI / 2;
    g.add(stone, glyph);
    return g;
  },

  // a glazed clay toadstool
  mushroom(d, r) {
    const g = new THREE.Group();
    const cream = glazed('#efe4cf');
    g.add(mesh(new THREE.CylinderGeometry(0.0045, 0.006, 0.02, 20), cream, 0, 0.01, 0));
    const cap = mesh(new THREE.SphereGeometry(0.014, 32, 16, 0, TAU, 0, Math.PI / 2), glazed(d.cap), 0, 0.018, 0);
    cap.scale.set(1, 0.68, 1);
    const gills = mesh(new THREE.CircleGeometry(0.0138, 32), matte('#e5d6bb'), 0, 0.0181, 0);
    gills.rotation.x = Math.PI / 2;
    g.add(cap, gills);
    if (d.dots) {
      for (let i = 0; i < 9; i++) {
        const th = 0.25 + r() * 1.0, ph = r() * TAU;
        const dot = mesh(new THREE.SphereGeometry(1, 10, 6), cream,
          Math.sin(th) * Math.cos(ph) * 0.014, 0.018 + Math.cos(th) * 0.014 * 0.68, Math.sin(th) * Math.sin(ph) * 0.014);
        // flattened against the cap, facing out from its centre
        dot.scale.set(0.0019, 0.0019, 0.0008);
        const centre = new THREE.Vector3(0, 0.018, 0);
        dot.lookAt(dot.position.clone().sub(centre).multiplyScalar(2).add(centre));
        g.add(dot);
      }
    }
    if (d.small) {
      const kid = BUILD.mushroom({ cap: d.cap, dots: d.dots }, r);
      kid.scale.setScalar(0.55);
      kid.position.set(0.016, 0, 0.006);
      g.add(kid);
    }
    return g;
  },

  // a smudge bundle: stems tied with twine, flowers or leaves at one end
  bundle(d, r) {
    const g = new THREE.Group();
    const stem = matte('#7d8a52', 0.9);
    const flower = new THREE.MeshStandardMaterial({ color: d.flower, roughness: 0.85 });
    for (let i = 0; i < 16; i++) {
      const a = r() * TAU, rad = Math.sqrt(r()) * 0.006;
      const y = 0.0065 + Math.sin(a) * rad, z = Math.cos(a) * rad;
      const s = mesh(new THREE.CylinderGeometry(0.0009, 0.0009, 0.07, 5), stem, -0.002, y, z);
      s.rotation.z = Math.PI / 2 + (r() - 0.5) * 0.08;
      g.add(s);
      if (d.leaves) {
        for (let k = 0; k < 4; k++) {
          const leaf = mesh(new THREE.SphereGeometry(1, 8, 6), flower, 0.006 + k * 0.007, y + (r() - 0.5) * 0.004, z + (r() - 0.5) * 0.006);
          leaf.scale.set(0.009, 0.0016, 0.0042);
          leaf.rotation.y = (r() - 0.5) * 0.8;
          g.add(leaf);
        }
      } else {
        const head = mesh(new THREE.SphereGeometry(1, 8, 6), flower, 0.036 + r() * 0.004, y, z);
        head.scale.set(0.009, 0.0024, 0.0024);
        g.add(head);
      }
    }
    for (const x of [-0.012, -0.006]) {
      const tw = mesh(new THREE.TorusGeometry(0.0078, 0.0008, 6, 24), matte('#c9a874'), x, 0.0065, 0);
      tw.rotation.y = Math.PI / 2;
      g.add(tw);
    }
    return g;
  },

  // a glass ball on a brass stand, a violet mist inside
  sphere() {
    const g = new THREE.Group();
    const prof = [[0, 0], [0.017, 0], [0.018, 0.002], [0.012, 0.006], [0.0135, 0.011], [0.0, 0.011]];
    g.add(new THREE.Mesh(new THREE.LatheGeometry(prof.map(([x, y]) => new THREE.Vector2(x, y)), 32), metal('brass')));
    g.add(mesh(new THREE.SphereGeometry(0.022, 48, 32), gem('#eef3ff', { opacity: 0.32, iridescence: 0.7, flat: false }), 0, 0.031, 0));
    const mist = new THREE.MeshStandardMaterial({ color: '#b18cff', emissive: '#8a5cff', emissiveIntensity: 0.6, transparent: true, opacity: 0.45, depthWrite: false });
    const swirl = mesh(new THREE.TorusKnotGeometry(0.007, 0.0022, 64, 8, 2, 3), mist, 0, 0.031, 0);
    g.add(swirl);
    return g;
  },

  // a pot-bellied iron cauldron on three stubby legs, something green inside
  cauldron(d) {
    const g = new THREE.Group();
    const iron = metal('castIron');
    iron.side = THREE.DoubleSide;
    const prof = [[0.0, 0.004], [0.012, 0.004], [0.019, 0.008], [0.0225, 0.016], [0.022, 0.024], [0.019, 0.03], [0.0195, 0.032]];
    g.add(new THREE.Mesh(new THREE.LatheGeometry(prof.map(([x, y]) => new THREE.Vector2(x, y)), 36), iron));
    const rim = mesh(new THREE.TorusGeometry(0.0195, 0.0014, 8, 36), iron, 0, 0.032, 0);
    rim.rotation.x = Math.PI / 2;
    const brew = mesh(new THREE.CircleGeometry(0.019, 32), new THREE.MeshBasicMaterial({ color: d.glow }), 0, 0.027, 0);
    brew.rotation.x = -Math.PI / 2;
    const handle = mesh(new THREE.TorusGeometry(0.019, 0.001, 6, 24, Math.PI), iron, 0, 0.032, 0);
    g.add(rim, brew, handle);
    for (let i = 0; i < 3; i++) {
      const a = (i / 3) * TAU;
      g.add(mesh(new THREE.CylinderGeometry(0.0026, 0.0016, 0.006, 8), iron, Math.cos(a) * 0.013, 0.003, Math.sin(a) * 0.013));
    }
    for (let i = 0; i < 4; i++) {
      g.add(mesh(new THREE.SphereGeometry(0.0018 + i * 0.0004, 10, 8), new THREE.MeshBasicMaterial({ color: '#c8ffc8' }), (i - 1.5) * 0.007, 0.0275, (i % 2) * 0.006 - 0.003));
    }
    return g;
  },

  // a double-pointed crystal on a little chain, lying in a coil
  pendulum(d) {
    const g = new THREE.Group();
    const m = gem(d.colour, { opacity: 0.85 });
    const top = mesh(new THREE.ConeGeometry(0.0055, 0.012, 6), m, 0, 0.006, 0);
    const bottom = mesh(new THREE.ConeGeometry(0.0055, 0.022, 6), m, 0, -0.011, 0);
    bottom.rotation.x = Math.PI;
    const crystal = new THREE.Group();
    crystal.add(top, bottom, mesh(new THREE.CylinderGeometry(0.0022, 0.0028, 0.004, 12), metal('silver'), 0, 0.014, 0));
    crystal.rotation.z = Math.PI / 2;
    crystal.position.set(0.02, 0.0055, 0);
    const pts = [];
    for (let i = 0; i <= 40; i++) {
      const t = i / 40;
      pts.push(new THREE.Vector3(0.004 - t * 0.04, 0.0012, Math.sin(t * 9) * 0.008 * (1 - t * 0.3)));
    }
    const chain = new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 120, 0.0008, 5), metal('silver'));
    const ring = mesh(new THREE.TorusGeometry(0.0045, 0.001, 8, 20), metal('silver'), -0.04, 0.0012, 0);
    ring.rotation.x = Math.PI / 2;
    g.add(crystal, chain, ring);
    return g;
  },
};

// Builds a curio, scaled and set down on y = 0, centred in x and z.
export function makeCurio(data) {
  const build = BUILD[data.type] ?? portfolio[data.type];
  if (!build) throw new Error(`No curio builder for "${data.type}"`);
  const model = build(data, seeded(hash(data.name)));
  model.scale.multiplyScalar(SCALE * (data.scale ?? 1));
  const holder = new THREE.Group();
  holder.add(model);
  holder.updateMatrixWorld(true);
  const box = new THREE.Box3().setFromObject(holder);
  const c = box.getCenter(new THREE.Vector3());
  model.position.sub(new THREE.Vector3(c.x, box.min.y, c.z));
  holder.traverse((o) => { if (o.isMesh) { o.castShadow = !o.material.transparent; o.receiveShadow = true; } });
  return holder;
}

// how each kind sounds when picked up and set down
export function curioSound(type) {
  if (portfolioSounds[type]) return portfolioSounds[type];
  if (['point', 'cluster', 'vial', 'sphere', 'pendulum', 'bracelet'].includes(type)) return 'glass';
  if (['necklace', 'ring', 'key', 'charm', 'cauldron'].includes(type)) return 'metal';
  if (['tarot', 'bundle'].includes(type)) return 'paper';
  return 'stone';
}
