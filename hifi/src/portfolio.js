// The portfolio drawers: the six bins low in the middle of the studio
// wall, one for each case study, each holding the case study's book, open
// on a stand at its hero picture.
//
// `projects` is the content (in reading order, as the drawers are);
// `builders` makes the book, in the same style as trinkets.js and picked
// by `type` there. Sizes are in metres.

import * as THREE from 'three';

// ---- Helpers

const matte = (colour, roughness = 0.8) => new THREE.MeshStandardMaterial({ color: colour, roughness });

const mesh = (geo, mat, x = 0, y = 0, z = 0) => {
  const m = new THREE.Mesh(geo, mat);
  m.position.set(x, y, z);
  return m;
};

// a canvas painted by `draw(ctx, w, h)`, as a texture
function painted(w, h, draw) {
  const c = document.createElement('canvas');
  c.width = w; c.height = h;
  draw(c.getContext('2d'), w, h);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 8;
  return t;
}

// ---- The case study book, open on its stand

// Every book the same: `w` x `h` the open spread (the hero's own 16:10, one
// picture across both pages), `margin` the cover showing round it, `lean`
// how far it leans back on its stand (radians from upright), `ledge` the
// height of the stand's ledge it rests on. Real metres: the bin makes it at
// 1 / trinkets' SCALE, so it comes out this size.
export const BOOK = { w: 0.4, h: 0.25, margin: 0.002, lean: 0.3, ledge: 0.07 };
const PAPER = '#f5efe2';
const CURVE = 0.018; // how far the pages rise from the gutter

export const builders = {
  // The book, open on the hero picture: the spread bowed up from the
  // gutter as an open book's is, the cover's cloth round it. Built standing
  // on its bottom edge (the origin, at the gutter), leaning back. `face` is
  // the spread's outline, unseen, for the reader to match the book on the
  // page to.
  casebook(d) {
    const p = d.project, { w: W, h: H, margin: m, lean } = BOOK;
    const tex = painted(1000, 625, (ctx) => { ctx.fillStyle = PAPER; ctx.fillRect(0, 0, 1000, 625); });
    const img = new Image();
    img.onload = () => {
      const ctx = tex.image.getContext('2d');
      // (the picture as it is, as the book on the page shows it)
      ctx.drawImage(img, 0, 0, 1000, 625);
      tex.needsUpdate = true;
    };
    img.src = p.hero;
    const geo = new THREE.PlaneGeometry(W, H, 48, 1);
    const pos = geo.attributes.position;
    for (let i = 0; i < pos.count; i++) pos.setZ(i, CURVE * (1 - (1 - Math.abs(pos.getX(i)) / (W / 2)) ** 3));
    geo.computeVertexNormals();
    const pages = new THREE.Mesh(geo, new THREE.MeshStandardMaterial({ map: tex, roughness: 0.85 }));
    pages.position.y = H / 2 + m;
    const turn = new THREE.Group();
    turn.add(pages);
    // the page block's edges, top, bottom and at either side
    const block = matte('#e9dfc8', 0.95), depth = CURVE + 0.012;
    for (const y of [m, H + m]) turn.add(mesh(new THREE.BoxGeometry(W - 0.01, 0.002, depth), block, 0, y, CURVE - depth / 2));
    for (const x of [-1, 1]) turn.add(mesh(new THREE.BoxGeometry(0.002, H, depth), block, x * (W / 2 - 0.001), H / 2 + m, CURVE - depth / 2));
    // and the pages under the top one, a sliver of each showing at the
    // fore-edges, stepping down to the cover
    for (let i = 1; i <= 3; i++) for (const x of [-1, 1]) {
      turn.add(mesh(new THREE.BoxGeometry(0.0025, H, 0.002), block, x * (W / 2 - 0.0012), H / 2 + m, CURVE - 0.004 * i));
    }
    // the covers behind, a touch bigger all round
    const cloth = matte(p.cloth, 0.85);
    for (const x of [-1, 1]) turn.add(mesh(new THREE.BoxGeometry(W / 2 + m, H + 2 * m, 0.004), cloth, x * (W / 4 + m / 2), H / 2 + m, -0.014));
    const face = mesh(new THREE.PlaneGeometry(W, H), new THREE.MeshBasicMaterial(), 0, H / 2 + m, 0);
    face.name = 'face';
    face.visible = false;
    turn.add(face);
    turn.rotation.x = -lean; // the top goes back
    const g = new THREE.Group();
    g.add(turn);
    return g;
  },
};

// The stand the book rests on, in walnut: a base on the bed, a riser up to a
// ledge with a lip, and a back board the book leans on, held by a strut.
// Real metres; its origin is on the bed under the front of the ledge, where
// the book's bottom edge stands (BOOK.ledge up).
export function bookStand() {
  const { lean, ledge } = BOOK;
  const wood = matte('#6b4528', 0.6);
  const g = new THREE.Group();
  g.add(
    mesh(new THREE.BoxGeometry(0.34, 0.01, 0.2), wood, 0, 0.005, -0.08),
    mesh(new THREE.BoxGeometry(0.4, ledge, 0.03), wood, 0, ledge / 2, -0.014),
  );
  const tilt = new THREE.Group();
  tilt.position.y = ledge;
  tilt.rotation.x = -lean;
  tilt.add(
    mesh(new THREE.BoxGeometry(0.44, 0.012, 0.05), wood, 0, -0.006, -0.008),
    mesh(new THREE.BoxGeometry(0.44, 0.026, 0.008), wood, 0, 0.006, CURVE + 0.006),
    mesh(new THREE.BoxGeometry(0.28, 0.18, 0.01), wood, 0, 0.11, -0.026),
  );
  g.add(tilt);
  g.updateMatrixWorld(true);
  // the strut, from high on the back board down to the back of the base
  const from = new THREE.Vector3(0, 0.15, -0.031).applyMatrix4(tilt.matrixWorld);
  const to = new THREE.Vector3(0, 0.01, -0.17);
  const dir = to.clone().sub(from);
  const strut = mesh(new THREE.BoxGeometry(0.03, dir.length(), 0.008), wood);
  strut.position.copy(from).addScaledVector(dir, 0.5);
  strut.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir.normalize());
  g.add(strut);
  g.traverse((o) => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; } });
  return g;
}

// how it sounds picked up and set down
export const sounds = { casebook: 'paper' };

// (standing, the book already faces you, so it isn't tipped in hand)
export const flat = [];

const linen = { kind: 'velvet', colour: '#d9cdb9', flat: true };

// The eight drawers, in two columns with a sign of letter blocks over each:
// client work on the left, open-source and personal work on the right, each
// read top to bottom. `group` says which column. `lede` is the case study's
// own headline, word for word, and `summary` the line under it, for the card
// that comes up when the drawer opens.
export const GROUPS = { client: 'CLIENT', open: ['OPEN', 'SOURCE'] };
export const projects = [
  { id: 'ipsos-flow', group: 'client', name: 'Ipsos Flow', meta: 'Enterprise UX · 2024–2026', href: 'ipsos-flow.html', bed: linen, lede: 'From 15 tools to one', summary: 'Two years leading design on one operational platform for a research company working in 50+ countries.' },
  { id: 'ai-certification', group: 'client', name: 'AI Certification in Healthcare', meta: 'Policy design · 2024', href: 'ai-certification.html', bed: linen, soon: true, summary: 'A framework for certifying AI tools used in clinical care.' },
  { id: 'guidelines', group: 'client', name: 'Guidelines.com', meta: 'Product design · Orphic Health · 2026', href: 'guidelines.html', bed: linen, lede: 'Clinical answers, cited to the source', summary: 'A redesign concept where clinicians ask in their own words and get answers cited to the exact guideline paragraph.' },
  { id: 'sud-infovis', group: 'client', name: 'Substance Use Disorders InfoVis', meta: 'Public health · MITRE · 2024', href: 'sud-infovis.html', bed: linen, soon: true, summary: 'US substance use disorder trends, made readable for policy and public health audiences.' },
  { id: 'blood-atlas', group: 'open', name: 'The Blood Atlas', meta: 'Health data · GoInvo · 2026', href: 'blood-atlas.html', bed: linen, lede: 'What is your blood telling you?', summary: 'An open-source GoInvo prototype, made with Suchi Sundarraman, that maps 6,000+ blood tests to body systems and everyday concerns.' },
  { id: 'prism', group: 'open', name: 'PRISM', meta: 'Health communication · 2026', href: 'prism.html', bed: linen, lede: 'A second opinion for health handouts', summary: 'A free, open-source tool, made with Sonia Seto, that checks patient materials against 23 published frameworks.' },
  { id: 'waipo', group: 'open', name: 'Waipo?', meta: 'Graphic novel · 2021', href: 'waipo.html', bed: linen, lede: 'A Story of Alzheimer’s', summary: 'A 20-page graphic memoir about Alzheimer’s disease across three generations of my family.' },
  { id: 'artwork', group: 'open', name: 'Personal Art', meta: 'Personal work · Illustration', href: 'artwork.html', bed: linen, cta: 'See the artwork', summary: 'A collection of illustrations, portrait commissions, and personal pieces made outside of client work.' },
];

// What each drawer's book holds: its hero picture (cropped to 16:10, the
// open spread's shape), and the longer read that
// its pages turn to, in the case study's own order
// (context, problem, process, outcome, reflection), shortened from its page.
const cases = {
  'ipsos-flow': { hero: 'assets/cases/ipsos-flow.jpg', details: [
    ['Context', 'Ipsos grew by buying companies, so by the time we started 15 tools were in use, and every country, division and team ran things its own way. The real record lived in Excel.'],
    ['My role', 'GoInvo’s design team was two people. I owned the design system, the visual and interaction direction, and consistency across pods, and mentored the designers who joined along the way.'],
    ['Process', 'I mapped how work got done first: an 8-stage, 152-step workflow full of duplicated work and broken handoffs. The data model then took two years of evidence and clickable prototypes to agree on.'],
    ['Outcome', 'A working MVP, piloted in February 2026 on one of Ipsos’s most complex service lines, with the whole workflow in one place.'],
    ['Reflection', 'The hardest problems weren’t on screen. Most of the work was agreeing on shared definitions and who owned what across a spread-out company.'],
  ] },
  prism: { hero: 'assets/cases/prism.jpg', details: [
    ['Context', 'People who design patient materials often hear “this looks great” at handoff, and then nothing, though published score sheets exist for judging whether a handout works.'],
    ['The rule', 'PRISM can grade the work, but never write it. Only frameworks in a fixed list are used, every score quotes the passage it’s based on, and each check links to its source.'],
    ['Process', 'Designed as a proofing desk: set a brief, add a draft, pick the frameworks, review the scores. Everything stays in the browser.'],
    ['Outcome', 'Live as a free, open-source prototype that checks drafts against 23 frameworks across clarity, interaction, behaviour and outcomes.'],
    ['Reflection', 'Deciding what the AI was allowed to do mattered more than any single feature. For patient materials, a tool earns trust by showing its evidence.'],
  ] },
  'blood-atlas': { hero: 'assets/cases/blood-atlas.jpg', details: [
    ['Context', 'A routine annual panel measures fewer than 30 markers, out of more than 6,000 blood tests. Most of what blood can tell you is never looked at.'],
    ['Process', 'We built the catalogue first, from LOINC, tagging every test by body system and concern, and marked plainly which descriptions are quoted from a named source.'],
    ['From list to map', 'Early versions worked like a search. The Atlas now starts from results you already have: your panel, the concerns it points to, and the tests that would follow up.'],
    ['Outcome', 'Live as an open-source prototype. You can upload a lab report PDF and it’s read on your device, never sent anywhere.'],
    ['Reflection', 'Showing what we don’t know made the tool easier to trust.'],
  ] },
  waipo: { hero: 'assets/cases/waipo.jpg', details: [
    ['Context', 'When my grandmother was diagnosed with Alzheimer’s, our family didn’t talk about it openly. My mom carried it mostly on her own.'],
    ['Goal', 'Help people understand how common Alzheimer’s is, and show a calm, open way to respond to a frightening diagnosis.'],
    ['Process', 'It started with conversations with my mom. Every page went from loose sketch to clean line to full colour, in teal, warm salmon and cream.'],
    ['Reflection', 'A comic can stay with uncertainty and grief and still give people useful information. The more specific the story, the more people recognize themselves in it.'],
  ] },
  'sud-infovis': { hero: 'assets/cases/sud-infovis.jpg', details: [] },
  'ai-certification': { hero: 'assets/cases/ai-certification.jpg', details: [] },
  guidelines: { hero: 'assets/cases/guidelines.jpg', details: [] },
  artwork: { hero: 'assets/cases/artwork.jpg', details: [] },
};
// and each book's cover cloth
const CLOTH = ['#5a1f1b', '#2f4a3a', '#23344d', '#7d6236', '#3d2a3f', '#4b3326'];
projects.forEach((p, i) => Object.assign(p, { items: [], cloth: CLOTH[i % CLOTH.length] }, cases[p.id]));
