// Paints the drawer labels, the jar labels and the specimen cards onto
// canvases. A card's front is a pressed plant, drawn in ink and a
// watercolour wash and held down with paper tape, beside its names; the
// back carries notes. Everything is drawn from the herb's `plant` entry in
// content.js, seeded by its id, so a card looks the same on every load.

export const CARD_STOCK = '#efe6cf';
const INK = '#33281f';
const SEPIA = '#5a4636';

const F = {
  fell: '"IM Fell English", Georgia, serif',
  sc: '"IM Fell English SC", "IM Fell English", Georgia, serif',
};

export async function loadFonts() {
  const faces = [`400 30px ${F.fell}`, `italic 400 30px ${F.fell}`, `400 30px ${F.sc}`, '400 20px "Archivo"'];
  try { await Promise.all(faces.map((f) => document.fonts.load(f))); } catch { /* fall back to Georgia */ }
}

let grain = null;
export async function loadGrain() {
  try { grain = await loadImage('assets/tex/paper_grain.jpg'); } catch { /* plain card */ }
}

export function loadImage(url) {
  return new Promise((resolve, reject) => {
    const img = new Image(); img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img); img.onerror = reject; img.src = url;
  });
}

function canvas(w, h) {
  const c = document.createElement('canvas');
  c.width = w; c.height = h;
  return [c, c.getContext('2d')];
}

function seeded(seed) {
  let s = seed >>> 0 || 1;
  return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296);
}
export const hash = (str) => [...str].reduce((h, c) => (h * 31 + c.charCodeAt(0)) >>> 0, 7);

// a colour scaled toward black (f < 1) or white (f > 1)
function shade(hex, f) {
  const n = parseInt(hex.slice(1), 16);
  const ch = [(n >> 16) & 255, (n >> 8) & 255, n & 255].map((v) => Math.round(f < 1 ? v * f : v + (255 - v) * (f - 1)));
  return `rgb(${ch.join(',')})`;
}

// Wraps text into maxW and returns the y after the last line.
function wrap(ctx, text, x, y, maxW, lineH, maxLines = 99) {
  const words = String(text).split(/\s+/);
  let line = '', lines = 0;
  for (const word of words) {
    const test = line ? `${line} ${word}` : word;
    if (ctx.measureText(test).width > maxW && line) {
      ctx.fillText(line, x, y); y += lineH; line = word;
      if (++lines >= maxLines) return y;
    } else line = test;
  }
  if (line) { ctx.fillText(line, x, y); y += lineH; }
  return y;
}

function fitFont(ctx, text, font, maxW, start) {
  let size = start;
  do { ctx.font = font.replace('{s}', size); size -= 2; } while (ctx.measureText(text).width > maxW && size > 12);
}

// Old card: yellowing toward the edges, foxing spots and the scanned grain.
function age(ctx, w, h, seed, foxing = 26) {
  const r = seeded(seed);
  ctx.save();
  ctx.globalCompositeOperation = 'multiply';
  const g = ctx.createRadialGradient(w / 2, h / 2, Math.min(w, h) * 0.3, w / 2, h / 2, Math.max(w, h) * 0.72);
  g.addColorStop(0, 'rgba(175,135,70,0)');
  g.addColorStop(1, 'rgba(150,110,60,0.2)');
  ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
  for (let i = 0; i < foxing; i++) {
    const x = r() * w, y = r() * h, rad = 1.5 + r() * r() * 12;
    ctx.fillStyle = `rgba(150,105,55,${0.06 + r() * 0.12})`;
    ctx.beginPath(); ctx.arc(x, y, rad, 0, Math.PI * 2); ctx.fill();
  }
  if (grain) {
    ctx.globalAlpha = 0.6;
    ctx.drawImage(grain, -r() * grain.width * 0.3, -r() * grain.height * 0.3, w * 1.35, w * 1.35);
  }
  ctx.restore();
}

// ---- Labels

// The paper label behind each drawer's brass frame, 512 × 208.
export function paintLabel(herb) {
  const w = 512, h = 208;
  const [c, ctx] = canvas(w, h);
  ctx.fillStyle = '#ede3c8'; ctx.fillRect(0, 0, w, h);
  ctx.strokeStyle = SEPIA; ctx.lineWidth = 2; ctx.strokeRect(14, 14, w - 28, h - 28);
  ctx.lineWidth = 1; ctx.strokeRect(20, 20, w - 40, h - 40);
  ctx.fillStyle = INK; ctx.textAlign = 'center';
  ctx.font = `italic 400 26px ${F.fell}`;
  ctx.fillText(`No. ${herb.no}`, w / 2, 62);
  fitFont(ctx, herb.label, `400 {s}px ${F.sc}`, w - 80, 66);
  ctx.fillText(herb.label, w / 2, 142);
  ctx.textAlign = 'left';
  age(ctx, w, h, hash(herb.id) + 3, 10);
  return c;
}

// The label on a bin's front (v2), 512 × 208: its Latin heading large,
// the English below.
export function paintBinLabel(bin) {
  const w = 512, h = 208;
  const [c, ctx] = canvas(w, h);
  ctx.fillStyle = '#ede3c8'; ctx.fillRect(0, 0, w, h);
  ctx.strokeStyle = SEPIA; ctx.lineWidth = 2; ctx.strokeRect(14, 14, w - 28, h - 28);
  ctx.lineWidth = 1; ctx.strokeRect(20, 20, w - 40, h - 40);
  ctx.fillStyle = INK; ctx.textAlign = 'center';
  fitFont(ctx, bin.label, `400 {s}px ${F.sc}`, w - 80, 72);
  ctx.fillText(bin.label, w / 2, 112);
  ctx.font = `italic 400 30px ${F.fell}`;
  ctx.fillText(bin.name, w / 2, 160);
  ctx.textAlign = 'left';
  age(ctx, w, h, hash(bin.id) + 5, 10);
  return c;
}

// A jar label: a paper band, 1024 × 192, wrapped part way round the jar.
export function paintJarLabel(text, seed = 1) {
  const w = 1024, h = 192;
  const [c, ctx] = canvas(w, h);
  ctx.fillStyle = '#ece1c3'; ctx.fillRect(0, 0, w, h);
  ctx.strokeStyle = SEPIA; ctx.lineWidth = 3;
  ctx.beginPath(); ctx.moveTo(0, 18); ctx.lineTo(w, 18); ctx.moveTo(0, h - 18); ctx.lineTo(w, h - 18); ctx.stroke();
  ctx.fillStyle = INK; ctx.textAlign = 'center';
  fitFont(ctx, text, `400 {s}px ${F.sc}`, w * 0.42, 84);
  ctx.fillText(text, w / 2, h / 2 + 26);
  ctx.textAlign = 'left';
  age(ctx, w, h, seed, 12);
  return c;
}

// ---- Specimen cards, 1080 × 704 (a 15 × 9.8 cm card)

export const CARD_PX = { w: 1080, h: 704 };

function frame(ctx, w, h) {
  ctx.strokeStyle = SEPIA;
  ctx.lineWidth = 2.5; ctx.strokeRect(26, 26, w - 52, h - 52);
  ctx.lineWidth = 1; ctx.strokeRect(34, 34, w - 68, h - 68);
}

function rule(ctx, x, y, w) { ctx.fillStyle = SEPIA; ctx.fillRect(x, y, w, 1.5); }

export function paintCardFront(herb, place = `Drawer No. ${herb.no}`) {
  const { w, h } = CARD_PX;
  const [c, ctx] = canvas(w, h);
  ctx.fillStyle = CARD_STOCK; ctx.fillRect(0, 0, w, h);
  frame(ctx, w, h);

  drawPlant(ctx, herb, 56, 56, 430, h - 112);

  const x = 530, tw = w - x - 70;
  ctx.fillStyle = SEPIA; ctx.font = `400 22px ${F.sc}`;
  ctx.fillText(place, x, 100);
  ctx.textAlign = 'right'; ctx.fillText(herb.family, x + tw, 100); ctx.textAlign = 'left';
  rule(ctx, x, 116, tw);

  ctx.fillStyle = INK;
  fitFont(ctx, herb.latin, `italic 400 {s}px ${F.fell}`, tw, 60);
  ctx.fillText(herb.latin, x, 192);
  ctx.font = `400 34px ${F.sc}`;
  ctx.fillText(herb.common, x, 240);
  rule(ctx, x, 268, tw);

  let y = 318;
  for (const [k, v] of [['Part used', herb.part], ['Gathered', herb.gathered]]) {
    ctx.fillStyle = SEPIA; ctx.font = `400 22px ${F.sc}`;
    ctx.fillText(k, x, y);
    ctx.fillStyle = INK; ctx.font = `400 30px ${F.fell}`;
    y = wrap(ctx, v, x, y + 38, tw, 36, 2) + 22;
  }

  // the pharmacopoeia name in a small ruled box, bottom right
  ctx.font = `400 26px ${F.sc}`;
  const lw = ctx.measureText(herb.label).width + 36;
  ctx.strokeStyle = SEPIA; ctx.lineWidth = 1.5;
  ctx.strokeRect(x + tw - lw, h - 118, lw, 50);
  ctx.fillStyle = INK; ctx.textAlign = 'right';
  ctx.fillText(herb.label, x + tw - 18, h - 84);
  ctx.textAlign = 'left';
  ctx.fillStyle = SEPIA; ctx.font = `italic 400 22px ${F.fell}`;
  ctx.fillText(`fig. ${herb.no}`, x, h - 84);

  age(ctx, w, h, hash(herb.id));
  return c;
}

export function paintCardBack(herb, place = `Drawer No. ${herb.no}`) {
  const { w, h } = CARD_PX;
  const [c, ctx] = canvas(w, h);
  ctx.fillStyle = CARD_STOCK; ctx.fillRect(0, 0, w, h);
  frame(ctx, w, h);
  const x = 90, tw = w - 180;

  ctx.fillStyle = SEPIA; ctx.font = `400 22px ${F.sc}`;
  ctx.fillText(place, x, 100);
  ctx.textAlign = 'right'; ctx.fillText(herb.common, x + tw, 100); ctx.textAlign = 'left';
  rule(ctx, x, 116, tw);

  let y = 178;
  for (const [k, v] of [['Traditional use', herb.use], ['Preparation', herb.prep]]) {
    ctx.fillStyle = INK; ctx.font = `italic 400 34px ${F.fell}`;
    ctx.fillText(k, x, y);
    ctx.font = `400 30px ${F.fell}`;
    y = wrap(ctx, v, x, y + 44, tw, 38, 4) + 34;
  }

  rule(ctx, x, h - 112, tw);
  ctx.fillStyle = SEPIA; ctx.font = `italic 400 24px ${F.fell}`; ctx.textAlign = 'center';
  ctx.fillText('For curiosity, not prescription.', w / 2, h - 76);
  ctx.textAlign = 'left';
  age(ctx, w, h, hash(herb.id) + 11);
  return c;
}

// ---- The pressed plant

// a point and the direction of travel along a quadratic curve a → b via c
function quad(a, c, b, t) {
  const u = 1 - t;
  return {
    x: u * u * a.x + 2 * u * t * c.x + t * t * b.x,
    y: u * u * a.y + 2 * u * t * c.y + t * t * b.y,
    angle: Math.atan2(2 * u * (c.y - a.y) + 2 * t * (b.y - c.y), 2 * u * (c.x - a.x) + 2 * t * (b.x - c.x)),
  };
}

// ink over a wash: the fill, a darker bleed at the edge, then a fine line
function wash(ctx, colour, r) {
  ctx.save();
  ctx.globalAlpha = 0.78 + r() * 0.12;
  ctx.fillStyle = colour; ctx.fill();
  ctx.globalAlpha = 0.35;
  ctx.strokeStyle = shade(colour, 0.7); ctx.lineWidth = 3; ctx.stroke();
  ctx.globalAlpha = 0.85;
  ctx.strokeStyle = INK; ctx.lineWidth = 1.1; ctx.stroke();
  ctx.restore();
}

// A serrated or lobed outline along +x, as a closed path.
function toothedPath(ctx, L, W, lobed) {
  const n = lobed ? 6 : Math.max(6, Math.round(L / 10));
  const pts = [];
  for (let i = 0; i <= 2 * n; i++) {
    const s = i / (2 * n);
    const body = Math.pow(Math.sin(Math.PI * Math.min(1, s * 1.04)), lobed ? 0.5 : 0.75) * (lobed ? 1 - 0.35 * s : 1);
    const tip = i % 2 === 1;
    const k = tip ? 1 : lobed ? 0.35 : 0.8;
    const lean = tip ? (lobed ? -1 : 1) * L / (5 * n) : 0; // lobes point back to the base, teeth forward
    pts.push([s * L + lean, W * body * k]);
  }
  ctx.beginPath(); ctx.moveTo(0, 0);
  for (const [x, y] of pts) ctx.lineTo(x, -y);
  for (let i = pts.length - 1; i >= 0; i--) ctx.lineTo(pts[i][0], pts[i][1]);
  ctx.closePath();
}

function leafPath(ctx, shape, L, W) {
  ctx.beginPath(); ctx.moveTo(0, 0);
  if (shape === 'oval' || shape === 'small') {
    ctx.bezierCurveTo(L * 0.12, -W * 1.2, L * 0.78, -W * 1.05, L, 0);
    ctx.bezierCurveTo(L * 0.78, W * 1.05, L * 0.12, W * 1.2, 0, 0);
  } else if (shape === 'heart') {
    ctx.bezierCurveTo(-L * 0.18, -W * 1.3, L * 0.68, -W * 1.25, L, 0);
    ctx.bezierCurveTo(L * 0.68, W * 1.25, -L * 0.18, W * 1.3, 0, 0);
  } else {
    ctx.quadraticCurveTo(L * 0.4, -W * 1.25, L, 0);
    ctx.quadraticCurveTo(L * 0.4, W * 1.25, 0, 0);
  }
  ctx.closePath();
}

// One leaf, pointing along +x from the origin.
function leaf(ctx, spec, L, W, r, shape = spec.shape) {
  const colour = spec.colour;
  ctx.save();
  ctx.lineCap = 'round';
  if (shape === 'needle') {
    ctx.strokeStyle = colour; ctx.lineWidth = W; ctx.globalAlpha = 0.9;
    ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(L, 0); ctx.stroke();
    ctx.strokeStyle = INK; ctx.lineWidth = 0.9; ctx.globalAlpha = 0.6;
    ctx.beginPath(); ctx.moveTo(0, -W / 2); ctx.lineTo(L, 0); ctx.lineTo(0, W / 2); ctx.stroke();
  } else if (shape === 'feather') {
    ctx.strokeStyle = colour; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(L, 0); ctx.stroke();
    for (let i = 1; i <= 12; i++) {
      const s = i / 13, x = s * L, len = W * 1.5 * (1 - s * 0.6);
      for (const side of [-1, 1]) {
        ctx.strokeStyle = colour; ctx.lineWidth = 2.6; ctx.globalAlpha = 0.9;
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x + len * 0.55, side * len); ctx.stroke();
        ctx.strokeStyle = INK; ctx.lineWidth = 0.7; ctx.globalAlpha = 0.55; ctx.stroke();
      }
    }
  } else if (shape === 'thread') {
    // fennel: fine leaves forking again and again
    const branch = (x, y, a, len, depth) => {
      const ex = x + Math.cos(a) * len, ey = y + Math.sin(a) * len;
      ctx.strokeStyle = colour; ctx.lineWidth = 1.6; ctx.globalAlpha = 0.9;
      ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(ex, ey); ctx.stroke();
      if (depth > 0) for (const d of [-1, 1]) branch(ex, ey, a + d * (0.45 + r() * 0.3), len * 0.68, depth - 1);
    };
    branch(0, 0, 0, L * 0.38, 4);
  } else if (shape === 'compound') {
    ctx.strokeStyle = INK; ctx.lineWidth = 1.4; ctx.globalAlpha = 0.8;
    ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(L * 0.82, 0); ctx.stroke();
    const lf = spec.leaflet || 'oval', ll = L * 0.3, lw = W;
    for (const s of [0.28, 0.5, 0.72]) {
      for (const side of [-1, 1]) {
        ctx.save(); ctx.translate(s * L, 0); ctx.rotate(side * 0.95);
        leaf(ctx, spec, ll * (1.1 - s * 0.3), lw, r, lf);
        ctx.restore();
      }
    }
    ctx.save(); ctx.translate(L * 0.8, 0); leaf(ctx, spec, ll, lw, r, lf); ctx.restore();
  } else {
    if (shape === 'toothed' || shape === 'lobed') toothedPath(ctx, L, W, shape === 'lobed');
    else leafPath(ctx, shape, L, W);
    wash(ctx, colour, r);
    // midrib and a few veins
    ctx.strokeStyle = INK; ctx.globalAlpha = 0.4; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(L * 0.9, 0); ctx.stroke();
    if (shape !== 'small' && shape !== 'reed') {
      ctx.globalAlpha = 0.22;
      for (let i = 1; i <= 4; i++) {
        const x = (i / 5) * L * 0.85, v = W * 0.7 * Math.sin(Math.PI * i / 5);
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x + v * 0.8, -v); ctx.moveTo(x, 0); ctx.lineTo(x + v * 0.8, v); ctx.stroke();
      }
    }
  }
  ctx.restore();
}

function dot(ctx, x, y, rad, colour, outline = 0.5) {
  ctx.beginPath(); ctx.arc(x, y, rad, 0, Math.PI * 2);
  ctx.fillStyle = colour; ctx.globalAlpha = 0.92; ctx.fill();
  if (outline) { ctx.strokeStyle = INK; ctx.lineWidth = 0.7; ctx.globalAlpha = outline; ctx.stroke(); }
  ctx.globalAlpha = 1;
}

function daisy(ctx, x, y, R, f, r, tilt = 0.8) {
  ctx.save();
  ctx.translate(x, y); ctx.scale(1, tilt);
  const fine = f.ray === 'fine';
  const n = fine ? 34 : 16 + Math.floor(r() * 5);
  for (let ring = 0; ring < (fine ? 2 : 1); ring++) {
    for (let i = 0; i < n; i++) {
      const a = (i / n) * Math.PI * 2 + ring * 0.09;
      ctx.save(); ctx.rotate(a);
      ctx.beginPath(); ctx.ellipse(R * (fine ? 0.55 : 0.6) * (1 - ring * 0.25), 0, R * (fine ? 0.48 : 0.42) * (1 - ring * 0.25), R * (fine ? 0.07 : 0.13), 0, 0, Math.PI * 2);
      ctx.fillStyle = f.colour; ctx.globalAlpha = 0.95; ctx.fill();
      ctx.strokeStyle = INK; ctx.lineWidth = 0.8; ctx.globalAlpha = 0.6; ctx.stroke();
      ctx.restore();
    }
  }
  ctx.globalAlpha = 1;
  ctx.beginPath(); ctx.arc(0, 0, R * 0.32, 0, Math.PI * 2);
  ctx.fillStyle = f.disc || '#e3b02c'; ctx.fill();
  ctx.strokeStyle = INK; ctx.lineWidth = 1; ctx.globalAlpha = 0.7; ctx.stroke();
  ctx.fillStyle = shade(f.disc || '#e3b02c', 0.6);
  for (let i = 0; i < 26; i++) {
    const a = r() * Math.PI * 2, d = Math.sqrt(r()) * R * 0.28;
    ctx.globalAlpha = 0.5; ctx.fillRect(Math.cos(a) * d, Math.sin(a) * d, 2, 2);
  }
  ctx.restore();
}

function star(ctx, x, y, R, f, r) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(r() * Math.PI);
  for (let i = 0; i < 5; i++) {
    ctx.save(); ctx.rotate((i / 5) * Math.PI * 2);
    ctx.beginPath(); ctx.ellipse(R * 0.52, 0, R * 0.52, R * 0.36, 0, 0, Math.PI * 2);
    ctx.fillStyle = f.colour; ctx.globalAlpha = 0.92; ctx.fill();
    ctx.strokeStyle = INK; ctx.lineWidth = 0.9; ctx.globalAlpha = 0.6; ctx.stroke();
    ctx.restore();
  }
  // stamens
  ctx.globalAlpha = 0.8; ctx.strokeStyle = '#a7791c'; ctx.lineWidth = 0.8;
  for (let i = 0; i < 18; i++) {
    const a = r() * Math.PI * 2, d = R * (0.2 + r() * 0.2);
    ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(Math.cos(a) * d, Math.sin(a) * d); ctx.stroke();
    dot(ctx, Math.cos(a) * d, Math.sin(a) * d, 1.4, '#d39b22', 0);
  }
  ctx.restore();
}

function umbel(ctx, x, y, angle, R, f, r) {
  const rays = f.flat ? 13 : 10;
  for (let i = 0; i < rays; i++) {
    const a = angle + (i / (rays - 1) - 0.5) * (f.flat ? 1.5 : 2.0);
    const len = R * (f.flat ? 0.75 + 0.25 * Math.cos((i / (rays - 1) - 0.5) * Math.PI) : 0.85 + r() * 0.15);
    let ex = x + Math.cos(a) * len, ey = y + Math.sin(a) * len;
    if (f.flat) ey = y + (ey - y) * 0.45 - R * 0.35;
    ctx.strokeStyle = '#5f7448'; ctx.lineWidth = 1.2; ctx.globalAlpha = 0.85;
    ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(ex, ey); ctx.stroke();
    for (let k = 0; k < 7; k++) {
      const da = r() * Math.PI * 2, d = r() * R * 0.11;
      dot(ctx, ex + Math.cos(da) * d, ey + Math.sin(da) * d * 0.7, R * (0.035 + r() * 0.02), f.colour);
    }
  }
}

function spike(ctx, stem, from, f, r, size) {
  for (let i = 0; i <= 18; i++) {
    const t = from + (1 - from) * (i / 18), p = stem(t), s = size * (1 - 0.35 * (i / 18));
    for (const side of [-1, 1]) {
      const a = p.angle + side * 0.75;
      ctx.save(); ctx.translate(p.x + Math.cos(a) * s * 0.7, p.y + Math.sin(a) * s * 0.7); ctx.rotate(a);
      ctx.beginPath(); ctx.ellipse(0, 0, s, s * 0.55, 0, 0, Math.PI * 2);
      ctx.fillStyle = f.colour; ctx.globalAlpha = 0.9; ctx.fill();
      ctx.strokeStyle = INK; ctx.lineWidth = 0.7; ctx.globalAlpha = 0.5; ctx.stroke();
      ctx.restore();
    }
  }
  ctx.globalAlpha = 1;
}

function root(ctx, kind, x, y, w, h, r) {
  ctx.save();
  ctx.lineCap = 'round';
  if (kind === 'fibrous') {
    for (let i = 0; i < 22; i++) {
      const a = Math.PI / 2 + (r() - 0.5) * 1.6, len = h * (0.5 + r() * 0.5);
      ctx.strokeStyle = '#8a6a48'; ctx.lineWidth = 1.2 + r() * 1.2; ctx.globalAlpha = 0.85;
      ctx.beginPath(); ctx.moveTo(x, y);
      ctx.quadraticCurveTo(x + Math.cos(a) * len * 0.5 + (r() - 0.5) * 30, y + Math.sin(a) * len * 0.5, x + Math.cos(a) * len, y + Math.sin(a) * len);
      ctx.stroke();
    }
  } else if (kind === 'rhizome') {
    // knobby hands of ginger, a ring scar at each joint
    let cx = x - w * 0.28;
    for (let i = 0; i < 5; i++) {
      const rw = 26 + r() * 16, rh = 17 + r() * 8, cy = y + 12 + (i % 2) * 6;
      ctx.beginPath(); ctx.ellipse(cx, cy, rw, rh, (r() - 0.5) * 0.6, 0, Math.PI * 2);
      wash(ctx, '#c9a46a', r);
      ctx.strokeStyle = INK; ctx.globalAlpha = 0.35; ctx.lineWidth = 1;
      for (let k = -1; k <= 1; k++) { ctx.beginPath(); ctx.ellipse(cx + k * rw * 0.45, cy, 3, rh * 0.8, 0, 0, Math.PI * 2); ctx.stroke(); }
      ctx.globalAlpha = 1;
      cx += rw * 1.3;
    }
  } else {
    // a tapering taproot with a few side roots and hairs
    const L = h * 0.95;
    ctx.beginPath();
    ctx.moveTo(x - 9, y);
    ctx.bezierCurveTo(x - 12, y + L * 0.4, x + 8, y + L * 0.7, x + 4, y + L);
    ctx.bezierCurveTo(x + 10, y + L * 0.7, x + 14, y + L * 0.4, x + 9, y);
    ctx.closePath();
    wash(ctx, '#a9835a', r);
    ctx.strokeStyle = '#7a5b3c'; ctx.lineWidth = 1;
    for (let i = 0; i < 14; i++) {
      const t = 0.15 + r() * 0.8, sx = x + (r() - 0.3) * 8, sy = y + L * t, side = r() < 0.5 ? -1 : 1;
      ctx.globalAlpha = 0.7;
      ctx.beginPath(); ctx.moveTo(sx, sy); ctx.quadraticCurveTo(sx + side * 20, sy + 6, sx + side * (24 + r() * 26), sy + 18 + r() * 20); ctx.stroke();
    }
    ctx.globalAlpha = 1;
  }
  ctx.restore();
}

// paper tape holding the specimen to the card
function tape(ctx, x, y, angle, r) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(angle + (r() - 0.5) * 0.3);
  ctx.globalAlpha = 0.82; ctx.fillStyle = '#f5eedb';
  ctx.fillRect(-26, -8, 52, 16);
  ctx.globalAlpha = 0.25; ctx.strokeStyle = SEPIA; ctx.lineWidth = 1; ctx.strokeRect(-26, -8, 52, 16);
  ctx.restore();
}

function drawPlant(ctx, herb, x, y, w, h) {
  const p = herb.plant, f = p.flower || { type: 'none' };
  const r = seeded(hash(herb.id) * 7 + 3);
  const groundY = p.root ? y + h * 0.66 : y + h * 0.97;
  const cx = x + w * 0.5;
  const top = { x: cx + (r() - 0.5) * w * 0.2, y: y + h * 0.08 };
  const base = { x: cx, y: groundY };
  const ctrl = { x: cx + (r() - 0.5) * w * 0.35, y: (groundY + top.y) / 2 };
  const main = (t) => quad(base, ctrl, top, t);
  const L = (s) => p.leaf.len * h * s, W = (s) => p.leaf.wid * h * s;
  ctx.save();
  ctx.lineCap = 'round'; ctx.lineJoin = 'round';

  if (p.root) root(ctx, p.root, cx, groundY, w, y + h - groundY, r);

  // side branches carrying extra flower heads
  const heads = [];
  const branches = [];
  for (let i = 1; i < (p.heads || 1); i++) {
    const t0 = 0.4 + r() * 0.3, s0 = main(t0), side = i % 2 ? 1 : -1;
    const tip = { x: s0.x + side * w * (0.18 + r() * 0.14), y: top.y + h * (0.06 + r() * 0.16) };
    const c2 = { x: s0.x + side * w * 0.05, y: (s0.y + tip.y) / 2 };
    branches.push((t) => quad(s0, c2, tip, t));
  }

  const stems = p.rosette ? [] : [main, ...branches];
  if (p.rosette) {
    // leaves fan from the crown; a bare flower stalk rises from its middle
    const n = p.nodes || 7;
    for (let i = 0; i < n; i++) {
      const a = -Math.PI / 2 + (i / (n - 1) - 0.5) * (p.reeds ? 1.1 : 2.6);
      ctx.save(); ctx.translate(cx, groundY); ctx.rotate(a);
      leaf(ctx, p.leaf, L(0.75 + r() * 0.3), W(0.9 + r() * 0.2), r);
      ctx.restore();
    }
    if (f.type !== 'none') stems.push(main);
  }

  for (const stem of stems) {
    ctx.strokeStyle = '#66733f'; ctx.lineWidth = stem === main ? 3.2 : 2.4; ctx.globalAlpha = 0.95;
    const s0 = stem(0), s1 = stem(1);
    ctx.beginPath(); ctx.moveTo(s0.x, s0.y);
    for (let i = 1; i <= 24; i++) { const s = stem(i / 24); ctx.lineTo(s.x, s.y); }
    ctx.stroke();
    ctx.strokeStyle = INK; ctx.lineWidth = 0.8; ctx.globalAlpha = 0.5; ctx.stroke();
    ctx.globalAlpha = 1;
    heads.push([stem, s1]);
  }

  // leaves up the stems, smaller toward the top
  if (!p.rosette) {
    const stop = f.type === 'spike' ? 0.62 : f.type === 'whorl' ? 0.95 : 0.8;
    stems.forEach((stem, si) => {
      const n = si ? Math.ceil((p.nodes || 6) / 2) : p.nodes || 6;
      for (let i = 0; i < n; i++) {
        const t = (si ? 0.2 : 0.06) + (i / Math.max(1, n - 1)) * (stop - (si ? 0.2 : 0.06)), s = stem(t), k = 1 - 0.5 * t;
        const sides = p.arrange === 'opposite' ? [-1, 1] : [i % 2 ? 1 : -1];
        for (const side of sides) {
          ctx.save(); ctx.translate(s.x, s.y); ctx.rotate(s.angle + side * (0.85 + r() * 0.25));
          leaf(ctx, p.leaf, L(k * (si ? 0.7 : 1)), W(k * (si ? 0.7 : 1)), r);
          ctx.restore();
        }
        if (f.type === 'whorl' && t > 0.45) for (let d = 0; d < 9; d++) {
          const a = (d / 9) * Math.PI * 2;
          dot(ctx, s.x + Math.cos(a) * 9, s.y + Math.sin(a) * 5, 3.6, f.colour);
        }
        if (f.type === 'scatter' && t > 0.3 && r() < 0.6) {
          const a = s.angle + (r() < 0.5 ? -1 : 1) * 0.8;
          dot(ctx, s.x + Math.cos(a) * 10, s.y + Math.sin(a) * 10, 5, f.colour);
          dot(ctx, s.x + Math.cos(a) * 15, s.y + Math.sin(a) * 15, 4, f.colour);
        }
        if (f.type === 'catkin' && t > 0.3) {
          for (const side of [-1, 1]) {
            ctx.strokeStyle = '#7f915a'; ctx.lineWidth = 1;
            for (let d = 0; d < 9; d++) {
              const px = s.x + side * (6 + d * 2.2), py = s.y + d * 4.2;
              dot(ctx, px, py, 2.2, f.colour, 0.3);
            }
          }
        }
      }
    });
  }

  // flowers at the tips
  const size = (f.size || 0.05) * h;
  for (const [stem, tip] of heads) {
    if (f.type === 'spike') spike(ctx, stem, 0.66, f, r, h * 0.011);
    else if (f.type === 'daisy') {
      ctx.strokeStyle = '#66733f'; ctx.lineWidth = 2.4;
      daisy(ctx, tip.x, tip.y, size, f, r);
    } else if (f.type === 'umbel') umbel(ctx, tip.x, tip.y, tip.angle, size, f, r);
    else if (f.type === 'star') {
      star(ctx, tip.x, tip.y, size, f, r);
      if (f.hips) {
        const s = stem(0.82), a = s.angle + 1.2;
        ctx.beginPath(); ctx.ellipse(s.x + Math.cos(a) * 18, s.y + Math.sin(a) * 18, 9, 13, a, 0, Math.PI * 2);
        wash(ctx, '#c8331f', r);
        dot(ctx, s.x + Math.cos(a) * 30, s.y + Math.sin(a) * 30, 3, '#3d4a2a');
      }
    } else if (f.type === 'tilia') {
      // a pale strap-shaped bract, with a little cluster hanging from it
      ctx.save(); ctx.translate(tip.x, tip.y); ctx.rotate(tip.angle + 0.5);
      leaf(ctx, { shape: 'lance', colour: '#d3d79c' }, h * 0.12, h * 0.013, r);
      ctx.restore();
      const hx = tip.x + Math.cos(tip.angle + 0.5) * h * 0.06, hy = tip.y + Math.sin(tip.angle + 0.5) * h * 0.06;
      ctx.strokeStyle = '#66733f'; ctx.lineWidth = 1.2;
      for (let k = 0; k < 4; k++) {
        const fx = hx + (k - 1.5) * 14, fy = hy + 34 + (k % 2) * 8;
        ctx.beginPath(); ctx.moveTo(hx, hy); ctx.lineTo(fx, fy); ctx.stroke();
        star(ctx, fx, fy, 12, f, r);
      }
    }
  }

  // tape across the main stem and the root
  if (!p.rosette) { const s = main(0.18); tape(ctx, s.x, s.y, s.angle + Math.PI / 2, r); }
  else tape(ctx, cx, groundY - 6, 0, r);
  if (p.root) tape(ctx, cx, groundY + (y + h - groundY) * 0.5, 0.3, r);
  ctx.restore();
}

// ---- Curios (the bin cabinet)

// A tarot card face, 360 × 612: a night-blue field in a gold double border,
// the card's numeral at the top, its emblem in the middle, its name below.
export function paintTarot(card) {
  const w = 360, h = 612;
  const [c, ctx] = canvas(w, h);
  const gold = '#d9b25e';
  const g = ctx.createLinearGradient(0, 0, 0, h);
  g.addColorStop(0, '#1d2350'); g.addColorStop(1, '#3a2458');
  ctx.fillStyle = '#efe4cc'; ctx.fillRect(0, 0, w, h);
  ctx.fillStyle = g; ctx.fillRect(16, 16, w - 32, h - 32);
  ctx.strokeStyle = gold; ctx.lineWidth = 3; ctx.strokeRect(24, 24, w - 48, h - 48);
  ctx.lineWidth = 1; ctx.strokeRect(32, 32, w - 64, h - 64);
  ctx.fillStyle = gold; ctx.textAlign = 'center';
  ctx.font = `400 34px ${F.sc}`; ctx.fillText(card.numeral, w / 2, 80);

  // a scatter of small stars over the field
  const r = seeded(hash(card.card));
  for (let i = 0; i < 40; i++) {
    ctx.globalAlpha = 0.3 + r() * 0.6;
    ctx.beginPath(); ctx.arc(40 + r() * (w - 80), 100 + r() * (h - 220), 0.8 + r() * 1.6, 0, Math.PI * 2); ctx.fill();
  }
  ctx.globalAlpha = 1;
  const cx = w / 2, cy = h * 0.47;
  const starPath = (x, y, R, n = 5, inner = 0.45) => {
    ctx.beginPath();
    for (let i = 0; i <= n * 2; i++) {
      const a = -Math.PI / 2 + (i / (n * 2)) * Math.PI * 2, rr = i % 2 ? R * inner : R;
      if (i) ctx.lineTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr); else ctx.moveTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr);
    }
    ctx.closePath();
  };
  if (card.card === 'moon') {
    ctx.fillStyle = '#f3e7b8';
    ctx.beginPath(); ctx.arc(cx, cy, 90, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#25264f';
    ctx.beginPath(); ctx.arc(cx + 42, cy - 18, 82, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = gold; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.arc(cx, cy, 104, 0, Math.PI * 2); ctx.stroke();
    // two towers and a path to the water, small at the foot
    ctx.fillStyle = gold;
    ctx.fillRect(70, cy + 120, 26, 70); ctx.fillRect(w - 96, cy + 120, 26, 70);
  } else if (card.card === 'star') {
    ctx.fillStyle = '#f6e9b0';
    starPath(cx, cy - 20, 92, 8, 0.38); ctx.fill();
    for (const [x, y] of [[90, 150], [270, 170], [110, 360], [250, 380], [180, 120], [70, 260], [290, 280]]) { starPath(x, y, 14); ctx.fill(); }
    ctx.strokeStyle = gold; ctx.lineWidth = 2;
    for (let i = 0; i < 5; i++) { ctx.beginPath(); ctx.arc(cx, cy + 170, 20 + i * 14, Math.PI * 1.1, Math.PI * 1.9); ctx.stroke(); }
  } else {
    // the sun: a face of rays round a warm disc
    ctx.strokeStyle = '#f2c14e'; ctx.lineWidth = 6; ctx.lineCap = 'round';
    for (let i = 0; i < 16; i++) {
      const a = (i / 16) * Math.PI * 2, l = i % 2 ? 128 : 112;
      ctx.beginPath(); ctx.moveTo(cx + Math.cos(a) * 80, cy + Math.sin(a) * 80); ctx.lineTo(cx + Math.cos(a) * l, cy + Math.sin(a) * l); ctx.stroke();
    }
    const sg = ctx.createRadialGradient(cx, cy, 10, cx, cy, 74);
    sg.addColorStop(0, '#ffe9a0'); sg.addColorStop(1, '#f0a83c');
    ctx.fillStyle = sg; ctx.beginPath(); ctx.arc(cx, cy, 72, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#8a4a1a';
    ctx.beginPath(); ctx.arc(cx - 24, cy - 10, 6, 0, Math.PI * 2); ctx.arc(cx + 24, cy - 10, 6, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = '#8a4a1a'; ctx.lineWidth = 4;
    ctx.beginPath(); ctx.arc(cx, cy + 10, 22, 0.2 * Math.PI, 0.8 * Math.PI); ctx.stroke();
  }
  ctx.fillStyle = '#efe4cc'; ctx.fillRect(48, h - 112, w - 96, 56);
  ctx.strokeStyle = gold; ctx.lineWidth = 2; ctx.strokeRect(48, h - 112, w - 96, 56);
  ctx.fillStyle = '#2b2348'; ctx.font = `400 32px ${F.sc}`;
  ctx.fillText(card.title, w / 2, h - 74);
  ctx.textAlign = 'left';
  age(ctx, w, h, hash(card.card) + 2, 8);
  return c;
}

// the back every card shares: deep purple, a gold sun-and-moon medallion
// and a lattice of little stars
export function paintTarotBack() {
  const w = 360, h = 612;
  const [c, ctx] = canvas(w, h);
  ctx.fillStyle = '#efe4cc'; ctx.fillRect(0, 0, w, h);
  ctx.fillStyle = '#3b1f4f'; ctx.fillRect(16, 16, w - 32, h - 32);
  ctx.strokeStyle = '#d9b25e'; ctx.lineWidth = 3; ctx.strokeRect(24, 24, w - 48, h - 48);
  ctx.fillStyle = '#d9b25e';
  for (let y = 60; y < h - 40; y += 44) for (let x = 56 + ((y / 44) % 2) * 22; x < w - 40; x += 44) {
    ctx.globalAlpha = 0.5; ctx.beginPath(); ctx.arc(x, y, 2.2, 0, Math.PI * 2); ctx.fill();
  }
  ctx.globalAlpha = 1;
  ctx.beginPath(); ctx.arc(w / 2, h / 2, 60, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#3b1f4f';
  ctx.beginPath(); ctx.arc(w / 2 + 26, h / 2 - 10, 54, 0, Math.PI * 2); ctx.fill();
  age(ctx, w, h, 99, 6);
  return c;
}

// A rune, painted dark into a pebble: 256 × 256, transparent round it.
const RUNES = {
  fehu: [[[0.35, 0.15], [0.35, 0.85]], [[0.35, 0.3], [0.65, 0.15]], [[0.35, 0.48], [0.65, 0.33]]],
  algiz: [[[0.5, 0.15], [0.5, 0.85]], [[0.5, 0.45], [0.25, 0.18]], [[0.5, 0.45], [0.75, 0.18]]],
  berkano: [[[0.35, 0.15], [0.35, 0.85]], [[0.35, 0.15], [0.65, 0.32], [0.35, 0.5], [0.65, 0.68], [0.35, 0.85]]],
};
export function paintRune(name) {
  const [c, ctx] = canvas(256, 256);
  ctx.strokeStyle = 'rgba(70,32,24,0.92)'; ctx.lineWidth = 18; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  for (const stroke of RUNES[name] || RUNES.fehu) {
    ctx.beginPath();
    stroke.forEach(([x, y], i) => (i ? ctx.lineTo(x * 256, y * 256) : ctx.moveTo(x * 256, y * 256)));
    ctx.stroke();
  }
  return c;
}
