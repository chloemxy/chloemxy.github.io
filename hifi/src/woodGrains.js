// Wood grains for the shelf wall, drawn on a canvas, picked with ?grain=…
// (knotty pine is the default and lives in materials.js). Each sheet is
// `size` px covering `metres` each way and wraps across; the grain runs
// down the sheet, as down a board's length.

export const GRAINS = ['knotty', 'riftoak', 'walnut', 'burl', 'zebrawood', 'barnwood', 'spalted', 'charred',
  'pine1', 'pine2', 'pine3', 'pine4', 'pine5', 'pine6', 'pine7', 'pine8', 'raw']; // pine1-8: knotty pine variations (materials.js PINE_PRESETS)

export function drawGrain(style, g, W, r) {
  const fill = (c) => { g.fillStyle = c; g.fillRect(0, 0, W, W); };
  const rgba = (rgb, a) => `rgba(${rgb},${a})`;
  // a line down the sheet, wandering by `wave`
  const run = (x, colour, width, wave = 3, freq = 2) => {
    g.strokeStyle = colour; g.lineWidth = width; g.beginPath();
    for (let y = -10; y <= W + 10; y += 12) g.lineTo(x + Math.sin((y / W) * Math.PI * 2 * freq + x * 0.01) * wave, y);
    g.stroke();
  };
  const arches = (cx, apex, n, step, colour) => {
    for (let i = 1; i <= n; i++) {
      const half = i * step, tall = half * (5 + i * 0.3);
      g.strokeStyle = colour; g.lineWidth = 1 + (i % 3 === 0 ? 1 : 0); g.beginPath();
      for (let t = -1; t <= 1.0001; t += 0.05) g.lineTo(cx + t * half, apex + tall * t * t);
      g.stroke();
    }
  };
  const blots = (n, colours, rMin, rMax, blur) => {
    g.save(); g.filter = `blur(${blur}px)`;
    for (let i = 0; i < n; i++) {
      g.fillStyle = colours[Math.floor(r() * colours.length)];
      g.beginPath(); g.ellipse(r() * W, r() * W, rMin + r() * (rMax - rMin), (rMin + r() * (rMax - rMin)) * 2.5, 0, 0, Math.PI * 2); g.fill();
    }
    g.restore();
  };

  if (style === 'riftoak') {
    // pale and close: dense straight lines, little silvery ray flecks across them
    fill('#dcc6a2');
    for (let x = 0; x < W; x += 2 + r() * 3) run(x, rgba('150,115,70', 0.1 + r() * 0.25), 0.6 + r() * 1.2, 1.5, 1);
    for (let i = 0; i < 900; i++) { g.fillStyle = rgba('250,238,215', 0.35 + r() * 0.3); g.fillRect(r() * W, r() * W, 6 + r() * 20, 1.5 + r() * 2); }
  } else if (style === 'walnut') {
    // dark chocolate with purple and honey streaks, big flowing arches
    fill('#4f3424');
    blots(30, [rgba('90,60,70', 0.25), rgba('140,95,55', 0.25), rgba('30,18,12', 0.3)], 30, 90, 30);
    for (let x = 0; x < W; x += 4 + r() * 8) run(x, rgba('25,14,8', 0.15 + r() * 0.3), 0.8 + r() * 1.6, 8, 1.5);
    for (let i = 0; i < 6; i++) arches(r() * W, r() * W, 14 + Math.floor(r() * 10), 9 + r() * 6, rgba('20,10,6', 0.35));
  } else if (style === 'burl') {
    // swirling figure round clusters of small dark eyes
    fill('#b8834f');
    blots(40, [rgba('120,70,35', 0.3), rgba('220,170,110', 0.25)], 20, 70, 18);
    for (let c = 0; c < 70; c++) {
      const cx = r() * W, cy = r() * W;
      for (let k = 1; k < 14; k++) {
        g.strokeStyle = rgba('75,38,14', 0.3 + r() * 0.35); g.lineWidth = 1.5 + r() * 2.5; g.beginPath();
        const rad = k * (5 + r() * 5);
        for (let a = 0; a <= Math.PI * 2 + 0.01; a += 0.15) {
          const wob = 1 + Math.sin(a * 3 + k) * 0.18 + Math.sin(a * 5 + c) * 0.1;
          g.lineTo(cx + Math.cos(a) * rad * wob, cy + Math.sin(a) * rad * wob * 0.8);
        }
        g.stroke();
      }
      for (let e = 0; e < 8; e++) { g.fillStyle = rgba('45,22,8', 0.7); g.beginPath(); g.arc(cx + (r() - 0.5) * 40, cy + (r() - 0.5) * 40, 1.5 + r() * 3.5, 0, Math.PI * 2); g.fill(); }
    }
  } else if (style === 'zebrawood') {
    // straw-gold with bold, wavy near-black stripes of uneven width
    fill('#dcb877');
    for (let x = 0; x < W; x += 10 + r() * 26) {
      const w = 3 + r() * 12;
      g.fillStyle = rgba('50,32,18', 0.65 + r() * 0.3); g.beginPath();
      for (let y = -10; y <= W + 10; y += 12) g.lineTo(x + Math.sin(y * 0.01 + x) * 6, y);
      for (let y = W + 10; y >= -10; y -= 12) g.lineTo(x + w + Math.sin(y * 0.012 + x * 2) * 6, y);
      g.closePath(); g.fill();
    }
    for (let x = 0; x < W; x += 3) run(x, rgba('120,85,40', 0.08), 0.8, 4, 2);
  } else if (style === 'barnwood') {
    // grey and silvered, the grain raised by weather, cracks and old nail holes
    fill('#8e877b');
    blots(50, [rgba('60,55,48', 0.25), rgba('170,162,150', 0.25), rgba('120,95,70', 0.18)], 20, 80, 20);
    for (let x = 0; x < W; x += 3 + r() * 6) run(x, rgba(r() < 0.5 ? '45,40,35' : '190,185,175', 0.15 + r() * 0.25), 0.7 + r() * 1.5, 5, 2);
    for (let i = 0; i < 40; i++) { // checks: thin dark splits along the grain
      const x = r() * W, y = r() * W, len = 40 + r() * 200;
      g.strokeStyle = rgba('25,22,18', 0.8); g.lineWidth = 1.5 + r() * 2; g.beginPath(); g.moveTo(x, y); g.lineTo(x + (r() - 0.5) * 6, y + len); g.stroke();
    }
    for (let i = 0; i < 30; i++) { // nail holes with a rust stain
      const x = r() * W, y = r() * W;
      g.fillStyle = rgba('120,60,25', 0.35); g.beginPath(); g.arc(x, y + 6, 9, 0, Math.PI * 2); g.fill();
      g.fillStyle = '#1b1712'; g.beginPath(); g.arc(x, y, 3.5, 0, Math.PI * 2); g.fill();
    }
  } else if (style === 'spalted') {
    // pale maple marked by fungus: black zone lines wandering across, grey-brown patches
    fill('#ecdfc6');
    for (let x = 0; x < W; x += 4 + r() * 8) run(x, rgba('190,160,115', 0.1 + r() * 0.2), 0.8, 3, 2);
    blots(30, [rgba('150,135,120', 0.3), rgba('180,150,110', 0.25)], 30, 90, 22);
    for (let i = 0; i < 22; i++) {
      let x = r() * W, y = r() * W, a = r() * Math.PI * 2;
      g.strokeStyle = rgba('25,20,16', 0.85); g.lineWidth = 1.5 + r() * 2.5; g.beginPath(); g.moveTo(x, y);
      for (let k = 0; k < 60; k++) { a += (r() - 0.5) * 0.9; x += Math.cos(a) * 9; y += Math.sin(a) * 9; g.lineTo(x, y); }
      g.stroke();
    }
  } else if (style === 'charred') {
    // shou sugi ban: burnt black, cracked into a fine alligator pattern, the
    // ridges catching a little light
    fill('#1d1916');
    for (let x = 0; x < W; x += 5 + r() * 10) run(x, rgba('70,60,52', 0.25 + r() * 0.25), 1 + r() * 2, 4, 2);
    for (let i = 0; i < 1800; i++) {
      const x = r() * W, y = r() * W, len = 8 + r() * 26;
      g.strokeStyle = rgba(r() < 0.3 ? '110,95,80' : '5,4,3', 0.6); g.lineWidth = 1 + r() * 1.5;
      g.beginPath(); g.moveTo(x, y); g.lineTo(x + len * (r() < 0.5 ? 1 : 0.2), y + len * (r() < 0.5 ? 0.15 : 1)); g.stroke();
    }
  }
}
