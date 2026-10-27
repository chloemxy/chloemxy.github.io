/* ══════════════════════════════════
   INTRO GARDEN — vines and flowers grow out of each letter of the name as it
   lands. Everything is drawn from code on two canvases, one behind the letters
   and one in front, so a stem can pass behind a letter and come out over it.
   Usage: const garden = introGarden(introEl); garden.grow(letterSpan);
══════════════════════════════════ */
window.introGarden = function (intro) {
  const quiet = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (quiet || !intro) return { grow() {}, remaining() { return 0; } };

  const PETALS = ['#9b8cf8', '#f97316', '#06b6d4', '#ffffff', '#c4b5fd'];
  const STEM = '#84cc16', LEAF = ['#84cc16', '#65a30d'], VEIN = 'rgba(22,20,18,0.45)';

  /* Two layers: back sits under the name (z 0), front over it (z 2) */
  function layer(z) {
    const c = document.createElement('canvas');
    c.setAttribute('aria-hidden', 'true');
    c.style.cssText = `position:absolute;inset:0;width:100%;height:100%;pointer-events:none;z-index:${z}`;
    intro.appendChild(c);
    return c.getContext('2d');
  }
  const back = layer(0), front = layer(2);
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  function fit() {
    for (const g of [back, front]) {
      g.canvas.width = intro.clientWidth * dpr;
      g.canvas.height = intro.clientHeight * dpr;
      g.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
  }
  fit();
  window.addEventListener('resize', fit);

  /* ── Helpers ── */
  let seed = (Math.random() * 1e9) | 0;            // a different garden on every replay
  function rnd() { seed ^= seed << 13; seed ^= seed >>> 17; seed ^= seed << 5; return (seed >>> 0) / 4294967296; }
  const pick = a => a[Math.floor(rnd() * a.length)];
  const easeOut = t => t <= 0 ? 0 : t >= 1 ? 1 : 1 - Math.pow(1 - t, 3);
  const spring = t => t <= 0 ? 0 : t >= 1.6 ? 1 : 1 - Math.exp(-5 * t) * Math.cos(11 * t);  // overshoots, then settles

  /* A wandering stem: walk forward in small steps while the heading sways */
  function vine(x, y, dir, len, sway, waves, phase, n = 30) {
    const pts = [[x, y]], step = len / n;
    for (let i = 1; i <= n; i++) {
      const u = i / n, a = dir + sway * Math.sin(u * Math.PI * waves + phase) * Math.min(1, u * 2.5);
      x += Math.cos(a) * step; y += Math.sin(a) * step;
      pts.push([x, y]);
    }
    return pts;
  }
  /* An arching stem from one point to another, lifted by `lift` */
  function arch(a, b, lift, n = 30) {
    const c = [(a[0] + b[0]) / 2, Math.min(a[1], b[1]) - lift], pts = [];
    for (let i = 0; i <= n; i++) {
      const t = i / n, u = 1 - t;
      pts.push([u * u * a[0] + 2 * u * t * c[0] + t * t * b[0], u * u * a[1] + 2 * u * t * c[1] + t * t * b[1]]);
    }
    return pts;
  }
  /* Finish a stem in a little spiral */
  function curl(pts, side, r) {
    const [x, y] = pts[pts.length - 1], [px, py] = pts[pts.length - 2];
    const a = Math.atan2(y - py, x - px), cx = x - Math.sin(a) * side * r, cy = y + Math.cos(a) * side * r;
    const a0 = Math.atan2(y - cy, x - cx);
    for (let i = 1; i <= 16; i++) {
      const u = i / 16, t = a0 + side * u * Math.PI * 1.7, rr = r * (1 - 0.55 * u);
      pts.push([cx + Math.cos(t) * rr, cy + Math.sin(t) * rr]);
    }
    return pts;
  }
  const heading = (pts, i) => {
    const a = pts[Math.max(0, i - 1)], b = pts[Math.min(pts.length - 1, i + 1)];
    return Math.atan2(b[1] - a[1], b[0] - a[0]);
  };

  /* ── Garden state ── */
  const stems = [], leaves = [], flowers = [];
  let lastLetter = null, raf = 0;

  /* Split a stem into stretches that alternate behind and in front of the letters.
     It always starts behind, so it looks like it grows out of the letter. */
  function weave() {
    const cuts = [0];
    let u = 0.18 + rnd() * 0.25;
    while (u < 0.9) { cuts.push(u); u += 0.25 + rnd() * 0.35; }
    cuts.push(1);
    return cuts.slice(1).map((b, i) => ({ a: cuts[i], b, front: i % 2 === 1 }));
  }

  function addStem(pts, w, t0, dur, tip, size) {
    stems.push({ pts, w, t0, dur, runs: weave() });
    // leaves along the way, appearing as the stem reaches them
    const n = Math.floor(rnd() * 3);
    for (let k = 0; k < n; k++) {
      const u = 0.25 + rnd() * 0.55, i = Math.round(u * (pts.length - 1));
      const side = rnd() < 0.5 ? -1 : 1;
      leaves.push({ x: pts[i][0], y: pts[i][1], ang: heading(pts, i) + side * (0.7 + rnd() * 0.5),
        L: size * (0.32 + rnd() * 0.2), col: pick(LEAF), t0: t0 + dur * u, front: rnd() < 0.6 });
    }
    const end = pts[pts.length - 1], tEnd = t0 + dur * 0.85;
    if (tip === 'leaf') {
      leaves.push({ x: end[0], y: end[1], ang: heading(pts, pts.length - 1), L: size * 0.42, col: pick(LEAF), t0: tEnd, front: true });
    } else if (tip !== 'none') {
      const col = pick(PETALS);
      let col2 = pick(PETALS); if (col2 === col) col2 = '#f97316';
      flowers.push({ type: tip, x: end[0], y: end[1], R: size * (0.22 + rnd() * 0.14), rot: rnd() * Math.PI * 2,
        col, col2, t0: tEnd, front: true, sway: rnd() * 10 });    // blooms open above the name, in front of everything
    }
  }

  function grow(span) {
    const box = intro.getBoundingClientRect(), b = span.getBoundingClientRect();
    const h = b.height, w = b.width, x0 = b.left - box.left, top = b.top - box.top + h * 0.1;
    const now = performance.now(), lw = Math.max(1.6, h * 0.028);
    const flower = () => pick(['bloom', 'bloom', 'daisy', 'star', 'tulip', 'berry']);
    const inside = () => x0 + w * (0.2 + rnd() * 0.6);

    // one or two stems reaching up out of the letter
    const up = 1 + (rnd() < 0.55 ? 1 : 0);
    for (let i = 0; i < up; i++) {
      const pts = vine(inside(), top + h * (0.3 + rnd() * 0.25), -Math.PI / 2 + (rnd() - 0.5) * 0.7,
        h * (0.8 + rnd() * 0.55), 0.35 + rnd() * 0.4, 1 + rnd() * 1.5, rnd() * 6);
      addStem(pts, lw, now + i * 140, 520 + rnd() * 260, rnd() < 0.85 ? flower() : 'leaf', h);
    }
    // sometimes a short one sneaks out sideways
    if (rnd() < 0.45) {
      const side = rnd() < 0.5 ? -1 : 1;
      let pts = vine(inside(), top + h * (0.4 + rnd() * 0.3), side < 0 ? Math.PI + 0.3 : -0.3,
        h * (0.3 + rnd() * 0.2), 0.5, 1.2, rnd() * 6);
      pts = curl(pts, side < 0 ? 1 : -1, h * 0.06);
      addStem(pts, lw * 0.8, now + 220, 480, rnd() < 0.5 ? 'none' : 'berry', h);
    }
    // a vine that arches over to the previous letter
    if (lastLetter && rnd() < 0.7) {
      const a = [inside(), top + h * (0.15 + rnd() * 0.3)];
      const pb = lastLetter.getBoundingClientRect();
      const bpt = [pb.left - box.left + pb.width * (0.3 + rnd() * 0.5), pb.top - box.top + h * (0.15 + rnd() * 0.3)];
      addStem(arch(a, bpt, h * (0.3 + rnd() * 0.35)), lw * 0.9, now + 90, 600, rnd() < 0.5 ? 'leaf' : 'none', h);
    }
    lastLetter = span;
    if (!raf) raf = requestAnimationFrame(frame);
  }

  /* ── Drawing ── */
  function smooth(g, pts, i0, i1) {
    g.beginPath();
    g.moveTo(pts[i0][0], pts[i0][1]);
    for (let i = i0 + 1; i < i1; i++) {
      const mx = (pts[i][0] + pts[i + 1][0]) / 2, my = (pts[i][1] + pts[i + 1][1]) / 2;
      g.quadraticCurveTo(pts[i][0], pts[i][1], mx, my);
    }
    g.lineTo(pts[i1][0], pts[i1][1]);
    g.stroke();
  }

  function drawStem(s, now) {
    const p = easeOut((now - s.t0) / s.dur);
    if (p <= 0) return;
    const last = s.pts.length - 1, reach = p * last;
    for (const r of s.runs) {
      const i0 = Math.floor(r.a * last), i1 = Math.min(Math.ceil(r.b * last), Math.ceil(reach));
      if (i1 <= i0) continue;
      const g = r.front ? front : back;
      g.strokeStyle = STEM; g.lineWidth = s.w; g.lineCap = 'round'; g.lineJoin = 'round';
      smooth(g, s.pts, i0, i1);
    }
  }

  function drawLeaf(l, now) {
    const s = spring((now - l.t0) / 450);
    if (s <= 0) return;
    const g = l.front ? front : back, L = l.L * s, wd = L * 0.38;
    g.save(); g.translate(l.x, l.y); g.rotate(l.ang);
    g.beginPath(); g.moveTo(0, 0);
    g.quadraticCurveTo(L * 0.5, -wd, L, 0);
    g.quadraticCurveTo(L * 0.5, wd, 0, 0);
    g.fillStyle = l.col; g.fill();
    g.beginPath(); g.moveTo(L * 0.1, 0); g.lineTo(L * 0.8, 0);
    g.strokeStyle = VEIN; g.lineWidth = Math.max(1, L * 0.04); g.stroke();
    g.restore();
  }

  function petal(g, len, wid) {        // a rounded petal pointing along +x from the centre
    g.beginPath(); g.moveTo(0, 0);
    g.bezierCurveTo(len * 0.3, -wid, len, -wid * 0.8, len, 0);
    g.bezierCurveTo(len, wid * 0.8, len * 0.3, wid, 0, 0);
    g.fill();
  }

  function drawFlower(f, now) {
    const s = spring((now - f.t0) / 700);
    if (s <= 0) return;
    const g = f.front ? front : back, R = f.R * s;
    g.save(); g.translate(f.x, f.y); g.rotate(f.rot + Math.sin(now / 900 + f.sway) * 0.06);
    if (f.type === 'bloom') {                     // layered petals, darker inside
      for (let ring = 0; ring < 3; ring++) {
        const n = 5, rr = R * (1 - ring * 0.28);
        g.fillStyle = ring === 1 ? f.col2 : f.col;
        g.globalAlpha = ring === 2 ? 0.9 : 1;
        for (let k = 0; k < n; k++) { g.save(); g.rotate(k * Math.PI * 2 / n + ring * 0.6); petal(g, rr, rr * 0.55); g.restore(); }
      }
      g.globalAlpha = 1;
      g.beginPath(); g.arc(0, 0, R * 0.16, 0, Math.PI * 2); g.fillStyle = '#161412'; g.fill();
    } else if (f.type === 'daisy') {              // thin petals around a big centre
      const n = 9; g.fillStyle = f.col;
      for (let k = 0; k < n; k++) { g.save(); g.rotate(k * Math.PI * 2 / n); petal(g, R, R * 0.2); g.restore(); }
      g.beginPath(); g.arc(0, 0, R * 0.3, 0, Math.PI * 2); g.fillStyle = f.col2; g.fill();
    } else if (f.type === 'star') {               // the site's four-point sparkle, as a flower
      g.fillStyle = f.col;
      for (let k = 0; k < 4; k++) {
        g.save(); g.rotate(k * Math.PI / 2);
        g.beginPath(); g.moveTo(0, -R * 1.25); g.quadraticCurveTo(R * 0.12, -R * 0.12, 0, 0); g.quadraticCurveTo(-R * 0.12, -R * 0.12, 0, -R * 1.25); g.fill();
        g.restore();
      }
      g.beginPath(); g.arc(0, 0, R * 0.18, 0, Math.PI * 2); g.fillStyle = f.col2; g.fill();
    } else if (f.type === 'tulip') {              // a closed cup, opening upward
      g.rotate(-f.rot - Math.PI / 2 + Math.sin(f.sway) * 0.3);
      g.fillStyle = f.col2; g.save(); g.rotate(-0.5); petal(g, R * 1.1, R * 0.42); g.restore();
      g.save(); g.rotate(0.5); petal(g, R * 1.1, R * 0.42); g.restore();
      g.fillStyle = f.col; petal(g, R * 1.2, R * 0.5);
    } else {                                      // berries: a small cluster of dots
      const n = 4; g.fillStyle = f.col;
      for (let k = 0; k < n; k++) {
        const a = k * Math.PI * 2 / n;
        g.beginPath(); g.arc(Math.cos(a) * R * 0.45, Math.sin(a) * R * 0.45, R * 0.34, 0, Math.PI * 2); g.fill();
      }
      g.beginPath(); g.arc(0, 0, R * 0.3, 0, Math.PI * 2); g.fillStyle = f.col2; g.fill();
    }
    g.restore();
  }

  function frame(now) {
    if (!intro.isConnected) { window.removeEventListener('resize', fit); return; }  // intro has gone
    for (const g of [back, front]) g.clearRect(0, 0, g.canvas.width, g.canvas.height);
    stems.forEach(s => drawStem(s, now));
    leaves.forEach(l => drawLeaf(l, now));
    flowers.forEach(f => drawFlower(f, now));
    raf = requestAnimationFrame(frame);
  }

  return {
    grow,
    /* how long until the last flower has opened, in ms */
    remaining() {
      const ends = flowers.map(f => f.t0 + 700).concat(stems.map(s => s.t0 + s.dur), leaves.map(l => l.t0 + 450));
      return Math.max(0, ...ends) - performance.now();
    },
  };
};
