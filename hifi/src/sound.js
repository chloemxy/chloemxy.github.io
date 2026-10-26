// Wood and card sounds, synthesised: no audio files. A drawer sliding is
// noise shaped by stick-slip chatter, the grain of wood running on wood,
// filtered into a dry, hollow mid range; it shuts with a knock that has a
// low thump from the carcass. The card is a short rustle of stiff paper.
// As in the Corner newsstand, sound starts as the page loads where the
// browser allows it, otherwise on the first click, tap or key press, and
// the Sound button mutes it.

let ctx = null, out = null, muted = false;
const VOLUME = 0.5;
const button = document.getElementById('sound');

function render() {
  if (!button) return;
  const on = !muted;
  button.textContent = on ? 'Sound on' : 'Sound off';
  button.setAttribute('aria-pressed', String(on));
}

function unlock() {
  if (!ctx) {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;
    ctx = new AC();
    // a gentle limiter, so sounds that pile up never clip
    const limit = new DynamicsCompressorNode(ctx, { threshold: -10, knee: 6, ratio: 8, attack: 0.002, release: 0.1 });
    out = new GainNode(ctx, { gain: muted ? 0 : VOLUME });
    out.connect(limit).connect(ctx.destination);
  }
  if (ctx.state === 'suspended') ctx.resume();
  render();
}
unlock(); // try straight away
for (const type of ['pointerdown', 'touchstart', 'keydown']) addEventListener(type, unlock, true);
button?.addEventListener('click', () => {
  muted = !muted;
  out?.gain.setTargetAtTime(muted ? 0 : VOLUME, ctx.currentTime, 0.02);
  render();
});
render();

// only while the audio is actually running: sounds started while the
// browser holds it would all play at once when it starts
const live = () => ctx && ctx.state === 'running' && !muted;

const panner = (pan) => new StereoPannerNode(ctx, { pan: Math.max(-1, Math.min(1, pan)) });

// wood sliding on wood: a soft swell of noise, roughened by many small
// catches (the chatter), in a hollow band around `tone`
function slide({ duration = 0.4, level = 0.3, tone = 700, chatter = 1, pan = 0, delay = 0 } = {}) {
  if (!live()) return;
  const sr = ctx.sampleRate, n = Math.floor(duration * sr);
  const buf = ctx.createBuffer(1, n, sr), d = buf.getChannelData(0);
  const env = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    const x = i / n;
    env[i] = 0.35 * Math.min(1, x * 8) * Math.pow(1 - x, 1.4);
  }
  const catches = Math.floor(duration * 140 * chatter);
  for (let g = 0; g < catches; g++) {
    const at = Math.floor(Math.random() * n), len = Math.floor((0.002 + Math.random() * 0.006) * sr);
    const a = (0.2 + Math.random() * 0.5) * chatter * Math.pow(1 - at / n, 0.6);
    for (let i = 0; i < len && at + i < n; i++) env[at + i] += a * Math.exp((-5 * i) / len);
  }
  for (let i = 0; i < n; i++) d[i] = (Math.random() * 2 - 1) * env[i];

  const src = new AudioBufferSourceNode(ctx, { buffer: buf });
  const band = new BiquadFilterNode(ctx, { type: 'bandpass', frequency: tone, Q: 0.8 });
  const body = new BiquadFilterNode(ctx, { type: 'peaking', frequency: tone * 2.4, Q: 1.2, gain: 4 });
  const soft = new BiquadFilterNode(ctx, { type: 'lowpass', frequency: 4200 });
  src.connect(band).connect(body).connect(soft).connect(new GainNode(ctx, { gain: level * 2.2 })).connect(panner(pan)).connect(out);
  src.start(ctx.currentTime + delay);
}

// a drawer front meeting the carcass: a short bright knock over a low,
// boxy thump
function knock({ level = 0.4, pitch = 1, pan = 0, delay = 0 } = {}) {
  if (!live()) return;
  const t = ctx.currentTime + delay;
  const side = panner(pan);
  side.connect(out);
  const sr = ctx.sampleRate, n = Math.floor(0.03 * sr);
  const buf = ctx.createBuffer(1, n, sr), d = buf.getChannelData(0);
  for (let i = 0; i < n; i++) d[i] = (Math.random() * 2 - 1) * Math.exp((-9 * i) / n);
  const src = new AudioBufferSourceNode(ctx, { buffer: buf });
  src.connect(new BiquadFilterNode(ctx, { type: 'bandpass', frequency: 1300 * pitch, Q: 4 }))
    .connect(new GainNode(ctx, { gain: level * 1.5 })).connect(side);
  src.start(t);
  const tone = (freq, gain, decay) => {
    const o = new OscillatorNode(ctx, { frequency: freq * pitch });
    const g = new GainNode(ctx, { gain: 0 });
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(gain * level, t + 0.003);
    g.gain.exponentialRampToValueAtTime(0.0001, t + decay);
    o.connect(g).connect(side);
    o.start(t); o.stop(t + decay + 0.02);
  };
  tone(140, 0.9, 0.12);  // the carcass
  tone(520, 0.35, 0.06); // the drawer front
}

// stiff card: a short swish with a few crisp creases
function rustle({ duration = 0.35, level = 0.25, grains = 10, swish = 0.4, tone = 2600, crackle = 0.5, air = 6500, delay = 0 } = {}) {
  if (!live()) return;
  const sr = ctx.sampleRate, n = Math.floor(duration * sr);
  const buf = ctx.createBuffer(1, n, sr), d = buf.getChannelData(0);
  const env = new Float32Array(n);
  for (let i = 0; i < n; i++) env[i] = swish * Math.sin((Math.PI * i) / n) ** 1.5;
  for (let g = 0; g < grains; g++) {
    const at = Math.floor(((Math.random() + Math.random()) / 2) * n);
    const len = Math.floor((0.003 + Math.random() * 0.02) * sr), a = (0.25 + Math.random() * 0.75) * crackle;
    for (let i = 0; i < len && at + i < n; i++) env[at + i] += a * Math.exp((-6 * i) / len);
  }
  for (let i = 0; i < n; i++) d[i] = (Math.random() * 2 - 1) * env[i];
  const src = new AudioBufferSourceNode(ctx, { buffer: buf });
  src.connect(new BiquadFilterNode(ctx, { type: 'highpass', frequency: 500 }))
    .connect(new BiquadFilterNode(ctx, { type: 'peaking', frequency: tone, Q: 0.7, gain: 6 }))
    .connect(new BiquadFilterNode(ctx, { type: 'lowpass', frequency: air }))
    .connect(new GainNode(ctx, { gain: level })).connect(out);
  src.start(ctx.currentTime + delay);
}

// a struck chime: a few inharmonic sine partials ringing down, slightly
// detuned so they shimmer; high and long for glass and crystal, shorter
// and lower for metal
function chime({ level = 0.2, base = 2600, partials = [1, 2.32, 4.25], decay = 0.7, delay = 0 } = {}) {
  if (!live()) return;
  const t = ctx.currentTime + delay;
  partials.forEach((p, i) => {
    const o = new OscillatorNode(ctx, { frequency: base * p * (1 + (Math.random() - 0.5) * 0.01) });
    const g = new GainNode(ctx, { gain: 0 });
    const a = level / (1 + i * 0.8), d = decay / (1 + i * 0.5);
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(a, t + 0.003);
    g.gain.exponentialRampToValueAtTime(0.0001, t + d);
    o.connect(g).connect(out);
    o.start(t); o.stop(t + d + 0.05);
  });
}

const touch = {
  glass: (soft) => { chime({ level: soft ? 0.1 : 0.16, base: 2400 + Math.random() * 600 }); chime({ level: 0.06, base: 3300, delay: 0.07, decay: 0.4 }); },
  metal: (soft) => chime({ level: soft ? 0.1 : 0.15, base: 1500 + Math.random() * 300, partials: [1, 2.76, 5.4], decay: 0.35 }),
  stone: (soft) => knock({ level: soft ? 0.22 : 0.3, pitch: 1.7 }),
  paper: () => rustle({ duration: 0.3, level: 0.18, grains: 8, swish: 0.4, tone: 2400, crackle: 0.4, air: 5500 }),
};

let lastPeek = 0;

export const sound = {
  get state() { return ctx ? ctx.state : 'none'; },
  // a drawer easing out under the pointer: a brief, light slide
  peek(pan = 0) {
    const now = performance.now();
    if (now - lastPeek < 90) return;
    lastPeek = now;
    slide({ duration: 0.16, level: 0.22, tone: 900, chatter: 0.7, pan });
  },
  // and back in, with a soft tap as it seats
  unpeek(pan = 0) {
    slide({ duration: 0.14, level: 0.16, tone: 820, chatter: 0.6, pan });
    knock({ level: 0.16, pitch: 1.15, pan, delay: 0.11 });
  },
  // pulled open properly
  pull(pan = 0) {
    slide({ duration: 0.5, level: 0.34, tone: 680, pan });
  },
  // the card lifted out from the front of the stack
  lift() {
    rustle({ duration: 0.45, level: 0.22, grains: 10, swish: 0.45, tone: 2400, crackle: 0.45, air: 5500 });
  },
  // turned over in the hand
  flip() {
    rustle({ duration: 0.4, level: 0.2, grains: 6, swish: 0.6, tone: 1900, crackle: 0.3, air: 4500 });
    rustle({ duration: 0.12, level: 0.1, grains: 4, swish: 0.3, tone: 3000, crackle: 0.5, air: 6000, delay: 0.42 });
  },
  // a curio lifted off its bed, and set back down: a chime for crystal and
  // glass, a clink for metal, a tap for stone and clay, a rustle for paper
  pickup(kind = 'stone') { touch[kind]?.(false); },
  setDown(kind = 'stone') { touch[kind]?.(true); },
  // pushed shut: a slide, then the knock as it closes
  shut(pan = 0) {
    slide({ duration: 0.42, level: 0.3, tone: 620, pan });
    knock({ level: 0.42, pitch: 0.95, pan, delay: 0.4 });
  },
};
