/* ==========================================================================
   UI CONCEPTS — the 28 screens.

   Each iteration in concepts.js has an id; UI[id] returns the markup for that
   screen. Screens are static mockups built from the same tokens as the rest
   of the site (which are prolaio.com's: purple #452DA7, lavender #C6AFE9,
   Sharp Sans Display No.2 headings, Inter body, 8/16/32/100 radii).

   Light mode only. No cartoon faces, no celebration confetti, no percentages
   on the participant: R1 was clear on all three.

   Primitives live at the top. Keep screens to one idea each — the point of an
   iteration is that it is a different approach, not a restyle.
   ========================================================================== */

/* ------------------------------------------------------------ primitives */
const bar = () =>
  `<div class="u-bar"><span>9:41</span><span class="u-bar__r"><i></i><i></i><i></i></span></div>`;

const nav = (title, right = '') =>
  `<div class="u-nav"><b>${title}</b><span>${right}</span></div>`;

const tabs = (active = 0) => {
  const t = ['Home', 'Data', 'Learn', 'More'];
  return `<div class="u-tabs">${t.map((x, i) =>
    `<span class="${i === active ? 'is-on' : ''}"><i></i>${x}</span>`).join('')}</div>`;
};

/* a screen: status bar, then body, then optional tab bar */
const scr = (body, tab = 0, cls = '') =>
  `<div class="u-scr ${cls}">${bar()}<div class="u-body">${body}</div>${tab === false ? '' : tabs(tab)}</div>`;

const card = (inner, cls = '') => `<div class="u-card ${cls}">${inner}</div>`;
const btn  = (label, cls = '') => `<span class="u-btn ${cls}">${label}</span>`;
const eyebrow = (t) => `<p class="u-eyebrow">${t}</p>`;

/* seven-day strip. states: ok | part | gap | none. A quiet day is never
   flagged: `gap` carries no glyph, so nothing reads as a missed task */
const week = (states) => {
  const D = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
  const glyph = { ok: '✓', part: '◍', gap: '', none: '' };
  return `<div class="u-week">${states.map((s, i) =>
    `<span class="u-d is-${s}"><b>${D[i]}</b><i>${glyph[s]}</i></span>`).join('')}</div>`;
};

/* a small bar chart, values 0–100 */
const bars = (vals, hi = -1) =>
  `<div class="u-bars">${vals.map((v, i) =>
    `<i style="height:${v}%" class="${i === hi ? 'is-on' : ''}"></i>`).join('')}</div>`;

/* a sparkline through the given 0–100 values */
const spark = (vals) => {
  const w = 200, h = 44;
  const pts = vals.map((v, i) =>
    `${(i / (vals.length - 1) * w).toFixed(1)},${(h - (v / 100) * h).toFixed(1)}`).join(' ');
  return `<svg class="u-spark" viewBox="0 0 ${w} ${h}" preserveAspectRatio="none">
    <polyline points="${pts}"/></svg>`;
};

/* a ring that fills to pct, drawn as an arc rather than a score */
const ring = (pct, label, sub) => {
  const r = 46, c = 2 * Math.PI * r;
  return `<div class="u-ring">
    <svg viewBox="0 0 120 120">
      <circle cx="60" cy="60" r="${r}" class="u-ring__t"/>
      <circle cx="60" cy="60" r="${r}" class="u-ring__f"
        stroke-dasharray="${c.toFixed(1)}" stroke-dashoffset="${(c * (1 - pct)).toFixed(1)}"/>
    </svg>
    <div class="u-ring__c"><b>${label}</b><span>${sub}</span></div>
  </div>`;
};

const rows = (items) =>
  `<div class="u-rows">${items.map(r =>
    `<span class="u-row"><b>${r[0]}</b><i>${r[1] || ''}</i></span>`).join('')}</div>`;


/* --- device glyphs and sync-help primitives (concept 8) --- */
const gScale = `<svg viewBox="0 0 24 24" class="u-g"><rect x="2" y="6" width="20" height="13" rx="3"/><rect x="9" y="10" width="6" height="2.5" rx="1" class="u-g__f"/><path d="M5 19v2.5M19 19v2.5"/></svg>`;
const gPhone = `<svg viewBox="0 0 24 24" class="u-g"><rect x="7" y="2" width="10" height="20" rx="3"/><path d="M10.5 5h3"/></svg>`;
const gGift  = `<svg viewBox="0 0 24 24" class="u-g"><rect x="3" y="8" width="18" height="13" rx="2"/><path d="M3 12h18M12 8v13"/><path d="M12 8s-1-4-3.5-4a2 2 0 0 0 0 4zM12 8s1-4 3.5-4a2 2 0 0 1 0 4z"/></svg>`;
const gBatt  = `<svg viewBox="0 0 24 24" class="u-g"><rect x="3" y="5" width="7" height="15" rx="1.5"/><rect x="14" y="5" width="7" height="15" rx="1.5"/><path d="M5 5V3.5h3V5M16 5V3.5h3V5"/></svg>`;

/* an illustrated fix step, as the current screen shows them */
const fix = (art, text) => `<div class="u-fix"><div class="u-fix__art">${art}</div>
  <p class="u-note">${text}</p></div>`;

/* a status line: state dot, label, chevron */
const srow = (state, text) =>
  `<span class="u-srow"><i class="u-dot is-${state}"></i><b>${text}</b><em>›</em></span>`;

/* live proximity, 0 to 5 */
const meter = (level, label, sub) => `<div class="u-meter">
  <div class="u-meter__bars">${[0,1,2,3,4].map(i =>
    `<i class="${i < level ? 'is-on' : ''}"></i>`).join('')}</div>
  <b>${label}</b><span>${sub}</span></div>`;


/* --- onboarding and home-screen primitives (concepts 2 and 3) --- */

/* a commitment: what it is, how long, how often */
const commit = (name, detail, meta) => `<span class="u-cm">
  <b>${name}</b><span>${detail}</span><em>${meta}</em></span>`;

/* a moment in an ordinary day */
const when = (time, what, note) => `<div class="u-when">
  <b>${time}</b><div><span>${what}</span><em>${note}</em></div></div>`;

/* a task with a checkbox */
const check = (label, done, meta = '') => `<span class="u-ck ${done ? 'is-done' : ''}">
  <i></i><b>${label}</b><em>${meta}</em></span>`;

/* a small vital tile */
const vital = (label, value, unit, trend = '') => `<span class="u-vt">
  <span class="u-vt__k">${label}</span>
  <span class="u-vt__v">${value}<small>${unit}</small></span>
  <span class="u-vt__t">${trend}</span></span>`;

/* the report preview for 2B, turning through three page layouts: one per
   thing we ask for, with that line of "What we need" lit while its page shows */
const docCycle = () => `<div class="u-doc u-doc--cyc">
  <div class="u-doc__p">
    <span class="u-doc__h"></span>
    <span class="u-doc__t">Resting heart rate</span>
    <span class="u-doc__n">68<small>bpm</small></span>
    <span class="u-doc__l" style="width:86%"></span>
    <span class="u-doc__c"></span>
    <span class="u-doc__l" style="width:52%"></span></div>
  <div class="u-doc__p">
    <span class="u-doc__h"></span>
    <span class="u-doc__t">Sleep, nightly</span>
    <span class="u-doc__n">6h 48m</span>
    <svg class="u-doc__ln" viewBox="0 0 100 30" preserveAspectRatio="none">
      <polyline points="0,18 14,12 28,20 42,9 56,15 70,7 84,13 100,10"/></svg>
    <span class="u-doc__l" style="width:70%"></span></div>
  <div class="u-doc__p">
    <span class="u-doc__h"></span>
    <span class="u-doc__t">Symptoms, this month</span>
    <span class="u-doc__n">14<small>answers</small></span>
    <span class="u-doc__hb"><i style="width:82%"></i></span>
    <span class="u-doc__hb"><i style="width:54%"></i></span>
    <span class="u-doc__hb"><i style="width:30%"></i></span></div>
</div>
<div class="u-dots u-dots--cyc"><i></i><i></i><i></i></div>`;

/* a setting paired with the expectation that explains it */
const pair = (title, note, on) => `<div class="u-pair">
  <div><b>${title}</b><span>${note}</span></div>
  <span class="u-sw ${on ? 'is-on' : ''}"></span></div>`;


/* --- game mechanics (concept 17) --- */

/* a labelled progress bar, always a count and never a percentage */
const prog = (label, done, total, unit = '') => `<div class="u-pr">
  <span class="u-pr__t"><b>${label}</b><em>${done} of ${total}${unit}</em></span>
  <span class="u-pr__b"><i style="width:${Math.round(done / total * 100)}%"></i></span></div>`;

/* a badge, earned or still locked */
const badge = (glyph, name, locked) => `<span class="u-bdg ${locked ? 'is-locked' : ''}">
  <i>${locked ? '' : glyph}</i><b>${name}</b></span>`;

/* trivia option */
const triv = (text, picked) => `<span class="u-tv ${picked ? 'is-you' : ''}">${text}</span>`;


/* --- home-screen status (concept 7) --- */

/* the plain-language verdict, as the first thing on the screen */
const verdict = (state, line, sub) => `<div class="u-vd is-${state}">
  <span class="u-vd__d"></span><div><b>${line}</b><span>${sub}</span></div></div>`;

/* a band that only exists when something is wrong */
const alertBand = (line, action) => `<div class="u-al">
  <b>${line}</b><span class="u-al__a">${action}</span></div>`;

/* a home row carrying its own state */
const statRow = (state, name, note) => `<span class="u-sr is-${state}">
  <i></i><div><b>${name}</b><em>${note}</em></div></span>`;


/* --- collective fund (concept 18) --- */

/* a place and what it has raised */
const place = (name, amount, pct, you) => `<span class="u-pl ${you ? 'is-you' : ''}">
  <b>${name}</b><i style="width:${pct}%"></i><em>${amount}</em></span>`;

/* a cause the participant can choose or vote for */
const org = (name, what, picked) => `<span class="u-org ${picked ? 'is-on' : ''}">
  <span class="u-org__r"></span><div><b>${name}</b><em>${what}</em></div></span>`;


/* --- pieces instead of a report, and report formats (concepts 12 and 15) --- */

/* a timestamped receipt for data that arrived */
const receipt = (time, what, detail) => `<span class="u-rc">
  <b>${time}</b><div><em>${what}</em><span>${detail}</span></div></span>`;

/* a video with chapters */
const player = (caption) => `<div class="u-vid"><span class="u-vid__p"></span>
  <span class="u-vid__c">${caption}</span></div>`;

/* a message in a conversation */
const msg = (text, mine) => `<span class="u-msg ${mine ? 'is-mine' : ''}">${text}</span>`;

/* --- ambient data pile (6D) --- */

/* bricks stacking up behind the screen, one per reading that arrived. The
   newest drops in; nothing ever comes out. Sits under the content. */
const bricks = (n) => `<div class="u-bricks" aria-hidden="true">${
  Array.from({ length: n }, (_, i) =>
    `<i class="${i === n - 1 ? 'is-new' : ''}"></i>`).join('')}</div>`;


/* --- live proximity (8C) --- */

/* the device stays put; the phone on screen moves with the real phone. The
   line between them is the signal: red when far, yellow midway, green close */
const prox = () => `<div class="u-prox">
  <span class="u-prox__dev">${gScale}</span>
  <span class="u-prox__line"></span>
  <span class="u-prox__ph">${gPhone}</span></div>`;

/* connected: one big check, nothing else to read */
const bigCheck = () => `<div class="u-bigok"><span></span></div>`;


/* --- flat architecture (concept 4) --- */
const gQ    = `<svg viewBox="0 0 24 24" class="u-g"><rect x="5" y="3" width="14" height="18" rx="2.5"/><path d="M8.5 8.5h7M8.5 12h7M8.5 15.5h4"/></svg>`;
const gCuff = `<svg viewBox="0 0 24 24" class="u-g"><rect x="3" y="7" width="12" height="10" rx="2.5"/><path d="M15 12h3a3 3 0 0 1 3 3v4"/><path d="M6.5 10.5v3M9 10.5v3M11.5 10.5v3"/></svg>`;
const gBand = `<svg viewBox="0 0 24 24" class="u-g"><rect x="8" y="7" width="8" height="10" rx="2.5"/><path d="M9.5 7V3h5v4M9.5 17v4h5v-4"/></svg>`;

/* the only way out of a task */
const back = () => `<div class="u-back">‹ Back</div>`;

/* a home row that opens straight into its task. states: now | done | quiet */
const task = (g, name, meta, state = '') => `<span class="u-tk ${state ? 'is-' + state : ''}">
  <i>${g}</i><div><b>${name}</b><em>${meta}</em></div><s>›</s></span>`;

/* a big action in the thumb zone, where the tab bar used to be */
const act = (g, label, hot) => `<span class="u-act ${hot ? 'is-hot' : ''}">
  <i>${g}</i><b>${label}</b></span>`;

/* a section heading on a single long page */
const sec = (t) => `<p class="u-sec">${t}</p>`;


/* --- progress views (concept 9) --- */

/* a month calendar. A day with data gets a check; a quiet day stays a plain
   number, never flagged. `next` spills that many days of the following month
   onto the grid; with `goal` set, the last of them carries it (the report day). */
const cal = ({ offset, days, start, today, quiet = [], from = 1, next = 0, goal = '' }) => {
  const head = ['S', 'M', 'T', 'W', 'T', 'F', 'S'].map(d => `<b>${d}</b>`).join('');
  const pad = '<span></span>'.repeat(offset);
  const cells = Array.from({ length: days - from + 1 }, (_, i) => {
    const d = i + from;
    let st = 'future', txt = d;
    if (d < start) st = 'out';
    else if (d === today) st = 'today';
    else if (d < today) { st = quiet.includes(d) ? 'quiet' : 'ok'; if (st === 'ok') txt = '✓'; }
    return `<span class="u-cd is-${st}">${txt}</span>`;
  }).join('');
  const spill = Array.from({ length: next }, (_, i) => goal && i === next - 1
    ? `<span class="u-cd is-goal">${goal}</span>`
    : `<span class="u-cd is-future">${i + 1}</span>`).join('');
  return `<div class="u-cal">${head}${pad}${cells}${spill}</div>`;
};

/* counts per week of the cycle, one row per kind of task, with a total.
   `soon` fills a cell for the week in progress that is still ahead, so an
   empty week never reads as a miss. */
const tally = (weeks, lines) => `<div class="u-tly" style="--n:${weeks.length}">
  <span></span>${weeks.map(w => `<b>${w}</b>`).join('')}<b>Total</b>
  ${lines.map(([label, vals, total]) => `<em>${label}</em>${vals.map(v =>
    `<i class="${typeof v === 'string' ? 'is-soon' : ''}">${v}</i>`).join('')}<strong>${total}</strong>`).join('')}
</div>`;

/* the thirty days of a cycle as numbered cells, no weekdays */
const cycle = ({ total = 30, today, quiet = [], goal = '' }) => `<div class="u-cyc">${
  Array.from({ length: total }, (_, i) => {
    const d = i + 1;
    if (goal && d === total) return `<span class="u-cd is-goal">${goal}</span>`;
    const st = d === today ? 'today' : d > today ? 'future' : quiet.includes(d) ? 'quiet' : 'ok';
    return `<span class="u-cd is-${st}">${st === 'ok' ? '✓' : d}</span>`;
  }).join('')}</div>`;

/* thirty thin segments, one per day, with today marked */
const segs = ({ total = 30, today, quiet = [] }) => `<div class="u-segs">${
  Array.from({ length: total }, (_, i) => {
    const d = i + 1;
    const st = d === today ? 'today' : d > today ? 'future' : quiet.includes(d) ? 'quiet' : 'ok';
    return `<i class="is-${st}"></i>`;
  }).join('')}</div>`;

/* --- device illustrations for a reading (concept 10) --- */

/* a bathroom scale seen from above: display on top, two footprints. With no
   value the display waits and the footprints pulse to say "stand here" */
const foot = (x, flip) => {
  const s = flip ? -1 : 1;
  return `<g transform="translate(${x} 0) scale(${s} 1)">
    <ellipse cx="0" cy="140" rx="15" ry="28"/>
    <circle cx="-9" cy="104" r="7.5"/><circle cx="3" cy="100" r="5.5"/>
    <circle cx="12" cy="102" r="4.5"/><circle cx="19" cy="107" r="3.8"/><circle cx="23" cy="114" r="3.2"/></g>`;
};
const scaleArt = (value = '') => `<svg class="u-art u-art--scale ${value ? '' : 'is-wait'}" viewBox="0 0 200 200">
  <rect x="18" y="18" width="164" height="160" rx="28" class="u-art__body"/>
  <rect x="44" y="176" width="20" height="6" rx="2" class="u-art__ink"/><rect x="136" y="176" width="20" height="6" rx="2" class="u-art__ink"/>
  <rect x="62" y="36" width="76" height="32" rx="6" class="u-art__screen"/>
  <text x="100" y="59" class="u-art__read">${value || '– – –'}</text>
  <g class="u-art__feet">${foot(72, true)}${foot(128, false)}</g></svg>`;

/* a blood pressure cuff, its tube, and the monitor. While measuring, a bar
   in the screen inflates and falls; when done the screen shows the reading */
const cuffArt = (sys = '', dia = '', pulse = '') => `<svg class="u-art u-art--cuff ${sys ? '' : 'is-wait'}" viewBox="0 0 200 200">
  <rect x="14" y="34" width="74" height="126" rx="16" class="u-art__cuff"/>
  <path d="M30 56h42M30 70h42M30 84h42" class="u-art__line"/>
  <path d="M88 118c22 0 16 26 34 26" class="u-art__tube"/>
  <rect x="112" y="46" width="78" height="118" rx="16" class="u-art__body"/>
  <rect x="122" y="58" width="58" height="66" rx="6" class="u-art__screen"/>
  ${sys
    ? `<text x="151" y="86" class="u-art__read">${sys}</text>
       <text x="151" y="106" class="u-art__read u-art__read--sm">${dia}</text>
       <text x="151" y="119" class="u-art__read u-art__read--xs">♥ ${pulse}</text>`
    : `<rect x="132" y="68" width="10" height="46" rx="2" class="u-art__gauge-t"/>
       <rect x="132" y="68" width="10" height="46" rx="2" class="u-art__gauge"/>
       <text x="164" y="96" class="u-art__read u-art__read--sm">···</text>`}
  <circle cx="151" cy="143" r="9" class="u-art__btn"/></svg>`;

/* everyone else who did the same task today, as dots. One is you. No
   names, no order, no ranking: just company */
const crowd = (n, you) => `<div class="u-crowd">${
  Array.from({ length: n }, (_, i) => `<i class="${i === you ? 'is-you' : ''}"></i>`).join('')}</div>`;

/* the finish: a check that lands, rings that spread, and labels for the
   sound and haptic the drawing cannot play */
const finish = () => `<div class="u-fin"><span class="u-fin__r"></span><span class="u-fin__r"></span>
  <span class="u-fin__c"></span></div>`;

/* a stacked flow's position: one pill per task, done ones checked */
const stepper = (labels, at) => `<div class="u-stp">${labels.map((l, i) =>
  `<span class="${i < at ? 'is-done' : i === at ? 'is-now' : ''}"><i>${i < at ? '✓' : i + 1}</i>${l}</span>`).join('')}</div>`;

/* the top of a reading screen: close, then a check and the value */
const shut = () => `<div class="u-x">✕</div>`;
const readout = (value, unit, line, done = true) => `<div class="u-ro">
  <p class="u-ro__v">${done ? '<i>✓</i>' : ''}${value}${unit ? `<small>${unit}</small>` : ''}</p>
  <p class="u-ro__l">${line}</p></div>`;


/* --- comparison and report contents (concepts 4 and 9) --- */

/* you against a reference value on a shared scale */
const cmp = (label, youPct, refPct, youTxt, refTxt) => `<div class="u-cmp">
  <span class="u-cmp__k">${label}</span>
  <span class="u-cmp__t"><i class="u-cmp__ref" style="left:${refPct}%"></i>
    <i class="u-cmp__you" style="left:${youPct}%"></i></span>
  <span class="u-cmp__l"><b>You ${youTxt}</b><em>${refTxt}</em></span></div>`;

/* --- comparison charts (concept 13) --- */

/* a range bar with you pinned on it and the reference marked below */
const pinScale = (youPct, refPct, you, ref, lo, hi) => `<div class="u-pin">
  <span class="u-pin__tip" style="left:${youPct}%"><em>You</em>${you}</span>
  <span class="u-pin__t"><i class="u-pin__ref" style="left:${refPct}%"></i>
    <i class="u-pin__you" style="left:${youPct}%"></i></span>
  <span class="u-pin__rl" style="left:${refPct}%">${ref}</span>
  <span class="u-pin__k"><em>${lo}</em><em>${hi}</em></span></div>`;

/* the state drawn in dots: y = you, b = your area, . = the rest */
const dotMap = (rows) => `<div class="u-map" style="--c:${rows[0].length}">${
  rows.join('').split('').map((c) =>
    `<i class="${{ y: 'is-you', b: 'is-area', '.': '' }[c] ?? 'is-off'}"></i>`).join('')}</div>
  <div class="u-lgd"><span class="is-you">You</span><span class="is-area">Boston area</span><span>Rest of state</span></div>`;

/* a distribution: one bar per band, yours filled, the group average dashed */
const hist = (vals, you, avgPct, youTxt, lo, avg, hi) => `<div class="u-hst">
  <span class="u-pin__tip" style="left:${(you + .5) / vals.length * 100}%;bottom:${vals[you] + 6}%"><em>You</em>${youTxt}</span>
  <span class="u-hst__avg" style="left:${avgPct}%"></span>
  ${vals.map((v, i) => `<i class="${i === you ? 'is-you' : ''}" style="height:${v}%"></i>`).join('')}</div>
  <span class="u-pin__k"><em>${lo}</em><b>${avg}</b><em>${hi}</em></span>`;

/* two rings, you outside and the study average inside */
const rings = (you, avg, big, sub) => {
  const arc = (r, pct, cls) => `<circle class="u-rg__t" r="${r}" cx="50" cy="50"/>
    <circle class="${cls}" r="${r}" cx="50" cy="50" pathLength="100"
      stroke-dasharray="${pct} 100" transform="rotate(-90 50 50)"/>`;
  return `<div class="u-rg"><svg viewBox="0 0 100 100">${arc(44, you, 'u-rg__you')}${arc(32, avg, 'u-rg__avg')}</svg>
    <span class="u-rg__c"><b>${big}</b><em>${sub}</em></span></div>`;
};

/* your own line, with your usual range shaded behind it */
const baseline = (vals, hi, lo, from, to) => {
  const w = 200, h = 44;
  const pts = vals.map((v, i) =>
    `${(i / (vals.length - 1) * w).toFixed(1)},${(h - (v / 100) * h).toFixed(1)}`).join(' ');
  return `<span class="u-bl__v">${hi}</span>
  <div class="u-bl"><svg class="u-spark" viewBox="0 0 ${w} ${h}" preserveAspectRatio="none">
    <polyline points="${pts}"/></svg><i class="u-bl__end" style="top:${100 - vals[vals.length - 1]}%"></i></div>
  <span class="u-bl__v">${lo}</span>
  <span class="u-pin__k"><em>${from}</em><em>${to}</em></span>`;
};

/* a month-over-month change */
const delta = (label, value, dir, change) => `<span class="u-dl">
  <b>${label}</b><em>${value}</em><i class="is-${dir}">${change}</i></span>`;

/* a past report on the shelf */
const past = (month, note, current) => `<span class="u-sh ${current ? 'is-now' : ''}">
  <b>${month}</b><em>${note}</em></span>`;


/* under a recorded reading: the change since last time, this month's line
   and last month's average. Direction only; never a verdict. */
const trend = (since, sinceDir, sinceWhen, vals, prev) => {
  const w = 200, h = 30;
  const pts = vals.map((v, i) =>
    `${(i / (vals.length - 1) * w).toFixed(1)},${(h - (v / 100) * h).toFixed(1)}`).join(' ');
  const last = pts.split(' ').pop().split(',');
  return `<div class="u-card u-tr2">
  <p class="u-tr2__s"><i class="is-${sinceDir}">${since}</i> since ${sinceWhen}</p>
  <svg viewBox="0 0 ${w} ${h}" preserveAspectRatio="none">
    <line x1="0" x2="${w}" y1="${h - prev / 100 * h}" y2="${h - prev / 100 * h}" class="u-tr2__avg"/>
    <polyline points="${pts}"/></svg>
  <i class="u-tr2__end" style="left:100%;top:${(last[1] / h * 100).toFixed(1)}%"></i>
  <p class="u-tr2__k">This month <em>- -</em> Last month avg, about the same</p></div>`;
};

/* ================================================================ screens */
const UI = {
  /* --------------------- 1 · the first thirty days ---------------------- */
  '1A': scr(`
    ${nav('Your first month')}
    <div class="u-steps">
      <div class="u-step is-done"><b>Consent</b><span>15 min, done</span></div>
      <div class="u-step is-done"><b>Kit arrives</b><span>Day 2, done</span></div>
      <div class="u-step is-now"><b>Set up devices</b><span>About 20 min</span></div>
      <div class="u-step"><b>Patch week</b><span>Days 4 to 10</span></div>
      <div class="u-step"><b>First check-in</b><span>Day 30, 10 min</span></div>
    </div>
    ${card(`<p class="u-note">Step 3 of 5. Nothing else due today.</p>`)}`),
  '1B': scr(`
    ${nav('Step 3 of 6', 'Help')}
    ${card(`<p class="u-lead">Place the patch</p>
      <div class="u-illo"></div>
      <p class="u-note">Just below the collarbone, left side. Press for 10 seconds.</p>`, 'u-card--edge')}
    ${card(`<div class="u-dev"><span class="u-dot is-wait"></span>
      <div><b>Waiting for the first reading</b><span>The light turns green when it starts</span></div></div>`)}
    <div class="u-btns">${btn('Watch the 40-second video', 'u-btn--ghost')}</div>
    <p class="u-note u-note--c">Continue once the patch connects</p>`, false),
  '1C': scr(`
    ${nav('Consent', '3 of 9')}
    ${card(`<p class="u-k">Consent form</p>
      <p class="u-note u-note--q">Participants will undergo ambulatory rhythm monitoring for a period of seven consecutive days.</p>`)}
    ${card(`<p class="u-lead">In plain terms</p>
      <p class="u-note">A patch the size of a plaster sits on your chest for a week. You shower with it. It does not beep. Most people forget it is there by day two.</p>
      <p class="u-note"><b>Takes</b> about 2 minutes to put on.</p>`, 'u-card--edge')}
    <div class="u-btns">${btn('Next')}${btn('Talk to a person', 'u-btn--ghost')}</div>`, false),
  '1D': scr(`
    ${nav('Week one')}
    ${card(`<p class="u-lead">How the first week went</p>
      ${week(['ok', 'ok', 'none', 'ok', 'ok', 'ok', 'ok'])}
      <p class="u-note">6 of 7 days received.</p>`, 'u-card--edge')}
    ${card(`<p class="u-k">Tip</p>
      <p class="u-note">Wednesday's sync failed. Open the app for a minute after you wake up.</p>`)}
    ${card(`<p class="u-note">You'll see fewer tips after week 1.</p>`)}`),

  /* ----------------- 2 · day one, what the month holds ------------------ */
  '2A': scr(`
    ${nav('Your first month')}
    <div class="u-cms">
      ${commit('Heart patch', 'Worn without a break', '7 days')}
      ${commit('Bracelet', 'Day and night, including sleep', '90 days')}
      ${commit('Questionnaire', 'About 2 minutes each', 'Every 2 days')}
      ${commit('Your report', 'Built from your own readings', 'Day 30')}
    </div>
    ${card(`<p class="u-k">Important</p>
      <p class="u-lead">Keep your phone in the same room as your devices.</p>`, 'u-card--edge')}`, false),
  '2B': scr(`
    ${nav('')}
    ${eyebrow('Your first report: Day 30')}
    ${docCycle()}
    ${card(`<p class="u-lead">Your monthly participant summary report</p>
      <p class="u-note">What we need:</p>
      <div class="u-rows--cyc">${rows([['The patch', '7 days'], ['The bracelet', 'Day and night'], ['A questionnaire', 'Every 2 days']])}</div>`, 'u-card--edge')}`, false),
  '2C': scr(`
    ${nav('A typical day')}
    <div class="u-days">
      ${when('7:00', 'No tasks', 'Keep the bracelet on.')}
      ${when('12:30', 'Questionnaire', 'Six questions, about 2 minutes. Every other day.')}
      ${when('6:00', 'No tasks', 'Keep the patch on.')}
      ${when('10:00', 'Phone on the nightstand', 'Keeps your data syncing overnight.')}
    </div>`, false),

  /* ---------------- 3 · what the home screen leads with ----------------- */
  '3A': scr(`
    ${nav('This week', 'Sep 21–27')}
    ${card(`<p class="u-k">3 of 5 done</p>
      <div class="u-prog"><i style="width:60%"></i></div>`)}
    <div class="u-cks">
      ${check('Questionnaire', true, 'Mon')}
      ${check('Blood pressure', true, 'Tue')}
      ${check('Questionnaire', true, 'Wed')}
      ${check('Questionnaire', false, 'Fri')}
      ${check('Weigh in', false, 'Sun')}
    </div>
    <p class="u-note u-note--c">Nothing overdue</p>`),
  '3B': scr(`
    ${nav('Good morning', 'Sep 23')}
    <div class="u-vts">
      ${vital('Heart rate', '68', 'bpm', '↓ 2')}
      ${vital('Blood pressure', '118', '/76', '→')}
      ${vital('Sleep', '6h 48', 'm', '↓ 20m')}
      ${vital('Weight', '197.5', 'lb', '↓ 1.3')}
    </div>
    ${card(`<p class="u-k">Today</p>
      ${rows([['Questionnaire', '2 min'], ['Blood pressure', 'Tonight']])}`)}`, 0),
  '3C': scr(`
    ${nav('Today')}
    <div class="u-seg"><span class="is-on">Today</span><span>This week</span></div>
    ${card(`<p class="u-lead">1 task due</p>
      ${rows([['Questionnaire', '2 min']])}
      ${btn('Start')}`, 'u-card--edge')}
    ${card(`<p class="u-k">Devices</p>
      ${rows([['Patch', 'Day 3 of 7'], ['Bracelet', 'Connected']])}`)}`, 0),
  '3D': scr(`
    ${nav('')}
    ${card(`${eyebrow('Patch week · day 3 of 7')}
      <p class="u-lead u-lead--big">Keep the patch on</p>
      <div class="u-band"><i style="left:0;width:43%"></i></div>
      <p class="u-note">4 days left. We'll tell you when to remove it.</p>`, 'u-card--edge')}
    ${card(`<p class="u-k">Today</p>
      ${rows([['Questionnaire', '2 min']])}`)}`),

  /* ----------------- 4 · zero depth, one task at a time ----------------- */
  '4A': scr(`
    ${nav('Today', 'Sep 23')}
    <div class="u-tks">
      ${task(gQ, 'Questionnaire', 'Due today, 2 min', 'now')}
      ${task(gCuff, 'Blood pressure', 'Tonight')}
      ${task(gScale, 'Weigh in', 'Done this morning', 'done')}
      ${task(gBand, 'Bracelet', 'Sending. Nothing to do', 'quiet')}
    </div>`, false),
  '4B': scr(`
    ${back()}
    <div class="u-task">
      <span class="u-task__g">${gCuff}</span>
      <p class="u-lead u-lead--big">Blood pressure</p>
      <p class="u-note u-note--c">Sit with your arm resting on a table. Stay still and quiet for a minute.</p>
      <span class="u-task__s"><i class="u-dot is-ok"></i>Cuff connected</span>
    </div>
    <div class="u-thumb">${btn('Start reading', 'u-btn--xl')}</div>`, false),
  '4B-fix': scr(`
    ${back()}
    <div class="u-task">
      <span class="u-task__g">${gCuff}</span>
      <p class="u-lead u-lead--big">Blood pressure</p>
      <p class="u-note u-note--c">The cuff is not answering yet. Hold it next to your phone and press its button once.</p>
      <span class="u-task__s"><i class="u-dot is-wait"></i>Looking for the cuff</span>
    </div>
    <div class="u-thumb">${btn('Start reading', 'u-btn--xl u-btn--off')}</div>`, false),
  '4C': scr(`
    ${nav('Today', 'Sep 23')}
    ${card(`<p class="u-k">Latest</p>
      ${rows([['Blood pressure', '118 / 76'], ['Weight', '197.5 lb'], ['Heart', 'Sending']])}`)}
    <div class="u-acts">
      ${act(gQ, 'Questionnaire', true)}
      ${act(gCuff, 'Blood pressure')}
      ${act(gScale, 'Weigh in')}
    </div>`, false),
  '4D': scr(`
    ${nav('')}
    <div class="u-task">
      ${eyebrow('Next')}
      <span class="u-task__g">${gQ}</span>
      <p class="u-lead u-lead--big">Six questions about this week</p>
      <p class="u-note u-note--c">About 2 minutes</p>
    </div>
    <p class="u-note u-note--c">Next: blood pressure, Friday</p>
    <div class="u-thumb">${btn('Start', 'u-btn--xl')}</div>`, false),
  '4E': scr(`
    ${nav('Today', 'Sep 23')}
    ${card(`<p class="u-k">Now</p>
      <p class="u-lead">Questionnaire, 2 min</p>${btn('Start')}`, 'u-card--edge')}
    ${sec('So far')}
    ${rows([['Questionnaires', '21'], ['Blood pressure', '18 readings']])}
    ${sec('Your readings')}
    <div class="u-vts">
      ${vital('Blood pressure', '118', '/76')}
      ${vital('Weight', '197.5', 'lb')}
    </div>
    ${sec('Need help?')}
    ${rows([['Device issue? Contact Dana', '']])}`, false),

  /* ------------------------ 5 · stack the tasks ------------------------- */
  '5A': scr(`
    ${nav('This evening')}
    ${card(`${eyebrow('Two readings due')}
      <p class="u-lead u-lead--big">2 readings, about 3 min</p>
      <div class="u-tks u-tks--flat">
        ${task(gCuff, 'Blood pressure', 'First, while you are sitting', '')}
        ${task(gScale, 'Weigh in', 'Then step on the scale', '')}
      </div>`, 'u-card--edge')}
    <div class="u-thumb">${btn('Start both', 'u-btn--xl')}</div>`, false),
  '5B': scr(`
    ${shut()}
    ${stepper(['Blood pressure', 'Weigh in'], 0)}
    ${readout('Measuring', '', 'Stay still and quiet. About 40 seconds.', false)}
    <div class="u-stage">${cuffArt()}</div>
    <p class="u-note u-note--c">Next: weigh in</p>`, false),
  '5B-next': scr(`
    ${shut()}
    ${stepper(['Blood pressure', 'Weigh in'], 1)}
    ${readout('Step on', '', 'Blood pressure is in. Take the cuff off, then step on the scale.', false)}
    <div class="u-stage">${scaleArt()}</div>`, false),
  '5C': scr(`
    ${shut()}
    <div class="u-stage u-stage--sm">${finish()}</div>
    <p class="u-lead u-lead--big u-lead--c">Both done</p>
    <p class="u-note u-note--c">2 minutes 40 seconds</p>
    ${card(rows([['Blood pressure', '118 / 76'], ['Weight', '197.1 lbs']]))}
    <p class="u-note u-note--c">Next task: Friday</p>
    <div class="u-thumb">${btn('Done', 'u-btn--xl')}</div>`, false),
  '5D': scr(`
    ${nav('Today', 'Sep 23')}
    ${card(`${eyebrow('Evening check, 7 PM')}
      <p class="u-lead">Blood pressure, weigh in and a questionnaire</p>
      <p class="u-note">About 5 minutes, all in one go.</p>
      ${btn('Start', 'u-btn--xl')}`, 'u-card--edge')}
    ${card(`<p class="u-k">Schedule</p>
      ${rows([['Morning', 'Nothing due'], ['Evening check', '7 PM'], ['Sunday', 'Weekly questions']])}`)}`, false),

  /* -------------------- 6 · knowing you are on track -------------------- */
  '6A': scr(`
    ${nav('This week', 'Sep 21–27')}
    ${week(['ok', 'ok', 'none', 'ok', 'part', 'none', 'none'])}
    ${card(`<p class="u-lead">2 questionnaires and 1 BP reading received</p>
      <p class="u-note">Missed days won't count against you.</p>`)}
    ${card(`<p class="u-k">Next</p>
      ${rows([['Questionnaire', 'Fri, 2 min'], ['Weigh in', 'Sun']])}`)}`),
  '6B': scr(`
    ${nav('Your device')}
    ${card(`<div class="u-dev"><span class="u-dot is-ok"></span>
      <div><b>Corsano connected</b><span>Last synced 9:14 AM</span></div></div>
      ${rows([['Battery', '82%'], ['Data received through', '9:00 AM']])}`, 'u-card--edge')}
    ${card(`<p class="u-lead">All data received</p>
      <p class="u-note">We'll contact you if a sync fails.</p>`)}
    ${card(`<div class="u-person"><span class="u-av"></span>
      <div><b>Dana R.</b><span>Your coordinator</span></div></div>
      <div class="u-btns">${btn('Message Dana')}${btn('Troubleshoot', 'u-btn--ghost')}</div>`)}`, 3),
  '6C': scr(`
    ${nav('Patch week')}
    ${card(`${eyebrow('Days 1–7')}
      <p class="u-lead">This week's data is complete</p>
      <div class="u-band"><i style="left:0;width:71.4%"></i><i class="is-gap" style="left:71.4%;width:28.6%"></i></div>
      <p class="u-note">5 of 7 days recorded. That's enough.</p>`, 'u-card--edge')}
    ${card(`<p class="u-k">Next steps</p>
      ${rows([['Patch week', 'Complete'], ['Next up', 'Wristband, day 8']])}
      ${btn('What we collected')}`)}`),
  '6D': scr(`
    ${bricks(29)}
    ${nav('Good morning', 'Sep 23')}
    ${card(`<p class="u-k">Next</p>
      <p class="u-lead">Blood pressure, this evening</p>${btn('Start')}`, 'u-card--edge')}
    ${card(`<p class="u-k">So far</p>
      ${rows([['Questionnaires', '21'], ['Blood pressure readings', '18'], ['Weigh-ins', '9']])}`)}`, 0, 'u-scr--bricks'),

  /* ------------ 7 · am i doing this right, answered on home ------------- */
  '7A': scr(`
    ${nav('Home', 'Sep 23')}
    <div class="u-ok">
      <span class="u-ok__b"></span>
      <p class="u-lead u-lead--big">You are on track</p>
      <p class="u-note u-note--c">All data received. Nothing due today.</p>
    </div>
    ${card(`<p class="u-k">Status</p>
      ${rows([['Questionnaire', 'Next on Friday'], ['Blood pressure', 'Tonight'], ['Bracelet', 'Syncing']])}`)}`),
  '7A-off': scr(`
    ${nav('Home', 'Sep 23')}
    <div class="u-ok is-off">
      <span class="u-ok__b"><svg viewBox="0 0 48 44" aria-hidden="true">
        <path d="M24 5.5 44 39H4z" rx="4"/><path class="u-ok__x" d="M24 17.5v9.5"/>
        <circle class="u-ok__dot" cx="24" cy="32.5" r="1.9"/></svg></span>
      <p class="u-lead u-lead--big">Action needed</p>
      <p class="u-note u-note--c">Your bracelet has not sent data since Monday.</p>
      ${btn('Fix now', 'u-btn--xl')}
    </div>
    ${card(`<p class="u-k">Up to date</p>
      ${rows([['Questionnaire', 'Next on Friday'], ['Blood pressure', 'Tonight']])}`)}`),
  '7B': scr(`
    ${nav('Home', 'Sep 23')}
    ${alertBand('Your bracelet has not synced for 3 days', '')}
    ${card(`<div class="u-try"><span class="u-try__n">1</span>
        <div><b>Put your phone next to it</b><span>Then tap Sync now.</span></div></div>
      ${btn('Sync now', 'u-btn--xl')}`, 'u-card--edge')}
    <p class="u-note">Everything else is up to date.</p>`),
  '7C': scr(`
    ${nav('Home', 'Sep 23')}
    <div class="u-srs">
      ${statRow('ok', 'Questionnaires', 'Up to date')}
      ${statRow('wait', 'Blood pressure', 'Tonight')}
      ${statRow('ok', 'Weight scale', 'In for this week')}
      ${statRow('bad', 'Bracelet', 'No data since Monday')}
    </div>`),

  /* ----------------- 8 · when the device will not sync ------------------ */
  '8A': scr(`
    ${nav('Weight Scale')}
    ${card(`<p class="u-num">197.5<small>lbs</small></p>
      <p class="u-note">↓ 1.3 lbs from yesterday</p>`, 'u-card--edge')}
    ${srow('ok', 'Weight recorded 4 minutes ago')}
    ${srow('bad', 'Scale not synced')}
    ${fix(`${gScale}<em class="u-arr">→ ←</em>${gPhone}`, 'Bring the scale and this phone closer together.')}
    ${fix(`${gBatt}<em class="u-arr">→</em>${gScale}`, 'If that does not work, change the four AAA batteries.')}`, false),
  '8C': scr(`
    ${nav('Finding your scale')}
    ${prox()}
    <p class="u-lead u-lead--big u-lead--c">Getting closer</p>
    <p class="u-note u-note--c">Walk toward the scale.</p>`, false, 'u-scr--pulse'),
  '8C-on': scr(`
    ${nav('Finding your scale')}
    ${bigCheck()}
    <p class="u-lead u-lead--big u-lead--c">Connected</p>`, false, 'u-scr--glow'),

  /* ---------------------- 9 · seeing your progress ---------------------- */
  '9A': scr(`
    ${nav('Your cycle', 'Sep 6 to Oct 5')}
    ${card(`${prog('Study cycle', 18, 30, ' days')}
      <p class="u-note">★ Your report, in 12 days</p>`, 'u-card--edge')}
    ${card(cal({ offset: 0, from: 6, days: 30, start: 6, today: 23, quiet: [9, 15, 20], next: 5, goal: '★' }))}
    ${card(`<p class="u-k">What you have done</p>
      ${tally(['Wk 1', 'Wk 2', 'Wk 3'], [
        ['Readings', [6, 6, 2], 14],
        ['Questionnaires', [1, 1, 'Fri'], 2],
      ])}`)}`),
  '9C': scr(`
    ${nav('Your cycle')}
    ${card(`<p class="u-k">Day</p>
      <p class="u-num">18<small>of 30</small></p>
      ${segs({ today: 18, quiet: [4, 10, 15] })}
      <span class="u-segs__k"><em>Sep 6</em><em>Oct 5</em></span>`, 'u-card--edge')}
    ${card(`<p class="u-k">Upcoming</p>
      ${rows([['Questionnaire', 'Friday'], ['Blood pressure', 'Sunday'], ['Your report', 'Day 30']])}`)}`),
  '9D': scr(`
    ${nav('Report in 12 days')}
    ${card(`${prog('Study cycle', 18, 30, ' days')}`, 'u-card--edge')}
    ${card(cycle({ today: 18, quiet: [4, 10, 15], goal: '★' }))}`),

  /* --------------------- 10 · readings you can see ---------------------- */
  '10A': scr(`
    ${shut()}
    ${readout('Step on', '', 'Barefoot, one foot on each mark. It records on its own.', false)}
    <div class="u-stage">${scaleArt()}</div>`, false),
  '10A-done': scr(`
    ${shut()}
    <div class="u-stage u-stage--top">${scaleArt('197.1')}</div>
    <div class="u-seg u-seg--unit"><span class="is-on">lb</span><span>kg</span></div>
    <p class="u-done">Weight recorded</p>
    ${trend('↓ 1.3 lb', 'down', 'Monday', [70, 62, 66, 56, 64, 58, 60, 54, 58, 52, 56, 54, 44, 36, 26], 52)}
    <div class="u-thumb">${btn('Done', 'u-btn--xl')}</div>`, false),
  '10B': scr(`
    ${shut()}
    ${readout('Measuring', '', 'Stay still and quiet. About 40 seconds.', false)}
    <div class="u-stage">${cuffArt()}</div>`, false),
  '10B-done': scr(`
    ${shut()}
    <div class="u-stage u-stage--top">${cuffArt('118', '76', '64')}</div>
    <p class="u-done">Blood pressure recorded</p>
    ${trend('↑ 4 systolic', 'up', 'Monday', [44, 56, 40, 62, 48, 58, 38, 54, 46, 60, 50, 42, 56, 52, 66], 50)}
    <div class="u-thumb">${btn('Done', 'u-btn--xl')}</div>`, false),

  /* 10C: the same recorded screen, but what sits under the reading changes
     every time: a fact one day, a piece of your own data back the next */
  '10C': scr(`
    ${shut()}
    ${readout('118/76', '', 'Blood pressure recorded.')}
    <div class="u-stage u-stage--sm">${cuffArt('118', '76', '64')}</div>
    ${card(`${eyebrow('Did you know')}
      <p class="u-lead">Blood pressure rises and falls through the day</p>
      <p class="u-note">It's lowest during sleep, so measure at the same time each evening.</p>`, 'u-card--edge')}
    <div class="u-thumb">${btn('Done', 'u-btn--xl')}</div>`, false),
  '10C-data': scr(`
    ${shut()}
    ${readout('118/76', '', 'Blood pressure recorded.')}
    <div class="u-stage u-stage--sm">${cuffArt('118', '76', '64')}</div>
    ${card(`${eyebrow('Blood pressure')}
      <p class="u-lead">This month's trend</p>
      ${spark([48, 60, 52, 44, 58, 50, 46, 55, 49, 53])}
      <p class="u-note">Your readings have ranged 112 to 124 over 72 to 80.</p>`, 'u-card--edge')}
    <div class="u-thumb">${btn('Done', 'u-btn--xl')}</div>`, false),
  '10D': scr(`
    ${shut()}
    ${readout('118/76', '', 'Blood pressure recorded.')}
    ${card(`${eyebrow('Cohort')}
      <p class="u-lead">412 others also measured today</p>
      ${crowd(84, 37)}`, 'u-card--edge')}
    <div class="u-thumb">${btn('Done', 'u-btn--xl')}</div>`, false),
  '10E': scr(`
    ${shut()}
    <div class="u-stage">${finish()}</div>
    <p class="u-lead u-lead--big u-lead--c">197.1 lbs</p>
    <p class="u-note u-note--c">Weight recorded</p>
    <div class="u-thumb">${btn('Done', 'u-btn--xl')}</div>`, false),

  /* -------------------- 11 · getting your data back --------------------- */
  '11A': scr(`
    ${nav('Your data', 'Sep')}
    ${card(`<p class="u-k">Resting heart rate</p>
      <p class="u-num">68<small>bpm</small></p>
      <p class="u-note">Measured 6:12 AM</p>
      ${spark([52, 58, 49, 62, 55, 60, 54, 58])}`, 'u-card--edge')}
    ${rows([['Heart rhythm', '7 days'], ['Steps', '5,420'], ['Sleep', '6h 48m'], ['Blood pressure', '118 / 76']])}
    <p class="u-note u-note--c">Tap any metric for its full history</p>`, 1),
  '11B': scr(`
    ${nav('Your study')}
    ${card(`${eyebrow('Yesterday')}
      <p class="u-lead">Patch week complete</p>
      <div class="u-sts">
        <span><b>6d 14h</b>heart rhythm collected</span>
        <span><b>68 bpm</b>your resting average</span>
        <span><b>1 of 1,240</b>records in the study</span>
      </div>`, 'u-card--edge')}
    ${card(`${eyebrow('Day 5')}<p class="u-lead">Morning survey: 4-day streak</p>
      <p class="u-note">Added to your symptom timeline.</p>`)}
    ${card(`${eyebrow('Day 1')}<p class="u-lead">Setup complete.</p>`)}`),
  '11C': scr(`
    ${nav('Resting heart rate')}
    ${card(`<p class="u-num">68<small>bpm</small></p>
      <p class="u-k">Your 30-day range</p>
      <div class="u-scale"><span class="u-scale__band"></span><span class="u-scale__you" style="left:46%"></span></div>
      <p class="u-note">Your range: 61 to 79</p>`, 'u-card--edge')}
    ${card(`<p class="u-k">About this measure</p>
      <p class="u-note">The lowest sustained rate over a 10-minute window while you are still.</p>`)}
    ${card(`<p class="u-note">Questions about your results? Ask your care team.</p>
      ${btn('Ask your coordinator', 'u-btn--ghost')}`)}`, 1),
  '11D': scr(`
    ${nav('September report')}
    ${card(`${eyebrow('Monthly participant summary report')}
      <p class="u-lead">Ready for you</p>
      ${rows([['Your readings', '4 metrics'], ['What changed', 'Month over month']])}`, 'u-card--edge')}
    ${card(`<p class="u-k">Share with your doctor</p>
      <div class="u-tog"><div><b>Heart rhythm</b></div><span class="u-sw is-on"></span></div>
      <div class="u-tog"><div><b>Food log</b></div><span class="u-sw"></span></div>
      <p class="u-note">Choose what to share.</p>`)}
    <div class="u-btns">${btn('Download PDF')}${btn('Cadence', 'u-btn--ghost')}</div>`, 1),

  /* ------------------- 12 · pieces, never a composite ------------------- */
  '12A': scr(`
    ${nav('')}
    <div class="u-earn">
      <span class="u-earn__b">✓</span>
      <p class="u-lead u-lead--big">Questionnaire done</p>
      <p class="u-note u-note--c">12 days on track</p>
    </div>
    ${card(`<p class="u-k">What we collected</p>
      <p class="u-note">6 symptom answers this week</p>`, 'u-card--edge')}
    ${card(`<p class="u-k">How it's used</p>
      <p class="u-note">Compared with your heart rhythm data.</p>`)}`, false),
  '12B': scr(`
    ${nav('Received')}
    <div class="u-rcs">
      ${receipt('9:14', 'Bracelet', '18 hours of rhythm, 42,000 beats')}
      ${receipt('7:02', 'Weight scale', 'One reading, 197.5 lb')}
      ${receipt('Tue', 'Questionnaire', 'Six answers')}
      ${receipt('Mon', 'Bracelet', '24 hours of rhythm, 58,000 beats')}
    </div>`, 1),
  '12C': scr(`
    ${nav('This week')}
    ${card(`${eyebrow('This week\'s highlight')}
      <p class="u-lead">Your resting heart rate</p>
      <p class="u-num">68<small>bpm</small></p>
      ${spark([52, 58, 49, 62, 55, 60, 54, 58])}
      <p class="u-note">Steady this week</p>`, 'u-card--edge')}`, 1),
  '12D': scr(`
    ${nav('Ask about your data')}
    <div class="u-msgs">
      ${msg('How did I sleep last week?', true)}
      <span class="u-msg">You averaged 6h 48m across 7 nights.
        <span class="u-mbars">${['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((d, i) =>
          `<span><i class="${i === 3 ? 'is-on' : ''}" style="height:${[70, 62, 76, 42, 66, 80, 70][i]}%"></i><em>${d}</em></span>`).join('')}</span></span>
      ${msg('Which night was shortest?', true)}
      ${msg('Thursday, at 5h 10m.', false)}
      <span class="u-msg u-msg--dots"><i></i><i></i><i></i></span>
    </div>
    <div class="u-sugs"><span>Steps this week</span><span>Patch wear</span><span>Last reading</span></div>
    <div class="u-ask">Ask about your data…<i>↑</i></div>`, 1),

  /* ------------------- 13 · what you compare against -------------------- */
  '13A': scr(`
    ${nav('Resting heart rate')}
    ${card(`<p class="u-k">September average</p>
      ${pinScale(30, 49, '68 bpm', 'Boston avg 72', '55', '90 bpm')}
      <p class="u-note u-note--src">Adults 45 to 54. Source: Massachusetts BRFSS, 2024</p>`)}
    ${card(`<p class="u-k">Your area</p>
      ${dotMap([
        '                   ..       ',
        '                   bb.      ',
        '   ................bbb      ',
        '  .............bbbbybbbb..  ',
        '  ............bbbbbbbbbb..  ',
        '  ............bbbbb bbbb... ',
        '                     bb     ',
      ])}`)}`, 1),
  '13B': scr(`
    ${nav('Resting heart rate')}
    ${card(`<p class="u-k">People like you</p>
      <div class="u-chps"><span>Women</span><span>45–54</span><span>Type 2</span></div>
      ${hist([4, 10, 22, 40, 62, 82, 92, 74, 46, 26, 12, 4], 4, 50, '68 bpm', '56', 'Group avg 74', '95 bpm')}`)}`, 1),
  '13C': scr(`
    ${nav('The cohort')}
    ${card(`<p class="u-k">Wear time, last 7 days</p>
      ${rings(94, 81, '+4.3 h', 'a day over average')}
      <div class="u-lgr">
        <span class="is-you"><b>You</b><em>23.4 h a day, 94%</em></span>
        <span><b>Study average</b><em>19.1 h a day, 81%</em></span>
      </div>`)}`, 3),
  '13D': scr(`
    ${nav('Resting heart rate')}
    ${card(`<p class="u-num">68<small>bpm</small></p>`, 'u-card--edge')}
    ${card(`<p class="u-k">Last 90 days</p>
      ${baseline([62, 74, 74, 64, 66, 54, 36, 50, 44, 50, 70, 70, 52, 56, 46, 30, 48, 58, 54, 70, 70, 48, 50, 34, 52, 70, 64, 68, 70, 48, 40, 48, 40, 34, 52, 70, 66, 24], '79', '61', 'July', 'Today')}
      <p class="u-note">Shaded: your usual range, 61 to 79</p>`)}`, 1),

  /* ----------------- 14 · what the monthly report says ------------------ */
  '14A': scr(`
    ${nav('September')}
    ${card(`${eyebrow('Changes since August')}
      <div class="u-dls">
        ${delta('Heart rate', '68 bpm', 'down', '↓ 3')}
        ${delta('Sleep', '6h 48m', 'down', '↓ 22m')}
        ${delta('Steps per day', '5,420', 'up', '↑ 610')}
        ${delta('Days of data', '28 of 30', 'up', '↑ 4')}
      </div>`, 'u-card--edge')}`, 1),
  '14B': scr(`
    ${nav('September')}
    ${card(`<p class="u-k">You, beside the averages</p>
      ${cmp('Resting heart rate', 34, 52, 'at 68', 'Boston average 72')}
      ${cmp('Sleep', 40, 62, 'at 6h 48m', 'Average 7h 20m')}
      <p class="u-note u-note--src">Source: published population data</p>`, 'u-card--edge')}`, 1),
  '14C': scr(`
    ${nav('September', 'Next steps')}
    ${card(`<p class="u-k">Study tasks</p>
      ${rows([['Wear the bracelet overnight', '4 nights missed'], ['Questionnaire on Fridays', 'Most often skipped']])}`, 'u-card--edge')}
    ${card(`<p class="u-k">Questions for your doctor</p>
      <p class="u-note">Your sleep fell 22 minutes this month while your resting heart rate fell 3 bpm. Both are within your usual range.</p>
      ${btn('Add to doctor report', 'u-btn--ghost')}`)}`, 1),
  '14D': scr(`
    ${nav('Your reports')}
    <div class="u-shs">
      ${past('September', 'New, ready now', true)}
      ${past('August', 'Sleep down, steps up', false)}
      ${past('July', 'First full month', false)}
    </div>
    ${card(`<p class="u-k">Compare reports</p>
      ${rows([['September', 'vs'], ['July', 'Compare']])}`)}`, 1),

  /* ----------------- 15 · other ways to give the report ----------------- */
  '15A': scr(`
    ${nav('September')}
    ${player('Your month in 90 seconds')}
    ${card(`<p class="u-k">Chapters</p>
      ${rows([['What you did', '0:12'], ['What we collected', '0:34'], ['What it means for the study', '1:02']])}
      <p class="u-note u-note--src">Captions available</p>`)}`, 1),
  '15B': scr(`
    ${nav('Your report')}
    ${card(`<div class="u-person u-person--lg"><span class="u-av"></span>
      <div><b>Dana R.</b><span>Your coordinator</span></div></div>
      <p class="u-lead">Review your report</p>
      <p class="u-note">15-minute phone or video call.</p>
      ${btn('Book a call')}`, 'u-card--edge')}`, 1),
  '15C': scr(`
    ${nav('Your report')}
    ${card(`${eyebrow('Posted Tuesday')}
      <div class="u-fix__art">${gGift}</div>
      <p class="u-lead">Printed copy shipped</p>
      <p class="u-note">Large print. Arrives in about a week.</p>`, 'u-card--edge')}
    ${card(`<p class="u-k">Also</p>
      ${rows([['Read it here', 'Now'], ['Email a PDF', 'Now']])}`)}`, 1),
  '15D': scr(`
    ${nav('September')}
    ${card(`<p class="u-k">September summary</p>
      <p class="u-num">68<small>bpm</small></p>
      <p class="u-note">Resting heart rate, averaged across September.</p>
      <div class="u-dots"><i class="is-on"></i><i></i><i></i><i></i><i></i></div>`, 'u-card--edge')}`, 1),

  /* ---------------- 16 · milestones, earnings and thanks ---------------- */
  '16A': scr(`
    ${nav('Your earnings')}
    ${card(`<p class="u-num u-num--c">$120</p>
      <p class="u-note u-note--c">earned so far</p>
      <div class="u-prog"><i style="width:30%"></i></div>
      <p class="u-note u-note--c">Next: $60 when you reach day 30</p>`, 'u-card--edge')}
    ${rows([['Setup complete', '$40'], ['Patch week', '$80'], ['Day 30', '$60'], ['Day 60', '$100'], ['Day 90', '$120']])}
    <p class="u-note u-note--c">$400 total across the study</p>`, 3),
  '16B': scr(`
    ${nav('')}
    ${card(`${eyebrow('Milestone')}
      <p class="u-lead u-lead--big">Patch week complete</p>
      <p class="u-note">6 days 14 hours of heart data added to the study.</p>`, 'u-card--edge')}
    ${card(`<p class="u-k">Next up</p>
      <p class="u-note">Wristband starts on day 8.</p>
      ${btn('See what we collected')}`)}`, false),
  '16C': scr(`
    ${nav('')}
    ${card(`${eyebrow('Shipped')}
      <div class="u-illo u-illo--gift">${gGift}</div>
      <p class="u-lead">Thank-you gift on its way</p>
      <p class="u-note">For finishing your first month. No action needed.</p>`, 'u-card--edge')}
    <div class="u-cms">
      ${commit('Patch comfort kit', 'Adhesive wipes, gentle lotion', 'Day 1')}
      ${commit('Heart-healthy cookbook', 'Low-salt recipes', 'Month 1')}
      ${commit('Weekly pill organizer', 'Morning and evening', 'Month 2')}
    </div>`),
  '16D': scr(`
    ${nav('Rewards', 'Optional')}
    <div class="u-tiles">
      <span class="u-tile"><i></i>Coffee card</span>
      <span class="u-tile"><i></i>Pharmacy credit</span>
      <span class="u-tile"><i></i>Grocery card</span>
      <span class="u-tile"><i></i>Donate it</span>
    </div>
    ${card(`<p class="u-note">Choose a reward instead of cash for any milestone.</p>`)}`, 3),

  /* ------------------- 17 · game mechanics, drawn out ------------------- */
  '17A': scr(`
    ${nav('Your progress')}
    ${card(`<p class="u-k">So far</p>
      ${rows([['Questionnaires answered', '21'], ['Blood pressure readings', '18'], ['Days of heart data', '34']])}`, 'u-card--edge')}
    ${card(`<p class="u-k">Next</p>
      ${prog('Patch week', 3, 7, ' days')}
      ${rows([['Questionnaire', 'Friday']])}`)}`, 3),
  '17B': scr(`
    ${nav('Your run')}
    ${card(`<p class="u-num u-num--c">12</p>
      <p class="u-note u-note--c">days of data in a row</p>
      ${week(['ok', 'ok', 'ok', 'ok', 'ok', 'ok', 'ok'])}
      <p class="u-note u-note--c">Longest so far, 18 days</p>`, 'u-card--edge')}
    ${card(`<p class="u-k">Missed days</p>
      <p class="u-note">Missing a day pauses your streak. It won't reset.</p>`)}`, 3),
  '17C': scr(`
    ${nav('Milestones', '3 of 6')}
    <div class="u-bdgs">
      ${badge('✓', 'Setup done', false)}
      ${badge('◔', 'Patch week', false)}
      ${badge('★', 'First month', false)}
      ${badge('', '1,000 hours', true)}
      ${badge('', 'Half way', true)}
      ${badge('', 'Study complete', true)}
    </div>`, 3),
  '17D': scr(`
    ${nav('Question of the day')}
    ${card(`<p class="u-lead">How many times does an average heart beat in a day?</p>
      <div class="u-tvs">
        ${triv('About 10,000', false)}
        ${triv('About 100,000', true)}
        ${triv('About 1,000,000', false)}
      </div>
      <p class="u-note"><b>Correct.</b> Around 100,000 beats, which is why a week of rhythm data is a lot of beats to read.</p>`, 'u-card--edge')}`, 2),


  /* 17E and 17F: the two the client asked to see — a feedback version tied
     to the Corsano connection, and a version that cashes out into a gift */
  '17E': scr(`
    ${nav('Corsano Connection')}
    <div class="u-earn">
      <span class="u-earn__b">✓</span>
      <p class="u-lead u-lead--big">A complete week</p>
      <p class="u-note u-note--c">Your bracelet sent data on all 7 days</p>
    </div>
    ${card(`<p class="u-k">Why it matters</p>
      <p class="u-note">7 full days of heart data. Nothing missing.</p>`, 'u-card--edge')}
    <div class="u-cks">
      ${check('3 questionnaires', true)}
      ${check('Weekly check-in', true)}
    </div>`, 3),
  '17F': scr(`
    ${nav('')}
    <div class="u-earn">
      <span class="u-earn__b">★</span>
      <p class="u-lead u-lead--big">Patch week</p>
      <p class="u-note u-note--c">Badge earned today</p>
    </div>
    ${card(`${eyebrow('Plus a gift')}
      <div class="u-fix__art">${gGift}</div>
      <p class="u-lead">Thank-you gift on its way</p>
      <p class="u-note">Arriving in about a week. No action needed.</p>`, 'u-card--edge')}`, 3),

  /* ---------------------- 18 · the collective fund ---------------------- */
  '18A': scr(`
    ${nav('This quarter')}
    ${card(`<p class="u-num u-num--c">$18,400</p>
      <p class="u-note u-note--c">raised by everyone staying with the study</p>
      <p class="u-note u-note--c"><b>Your part, $45</b></p>`, 'u-card--edge')}
    ${card(`<p class="u-k">Vote for a charity</p>
      <div class="u-orgs">
        ${org('American Heart Association', 'Research and education', true)}
        ${org('Mended Hearts', 'Peer support after cardiac events', false)}
      </div>
      <p class="u-note">Voting closes 20 December</p>`)}`, 3),
  '18B': scr(`
    ${nav('Your earnings', 'Q4')}
    ${card(`<p class="u-k">Your earnings</p>
      <p class="u-num">$120</p>
      <p class="u-note">Paid to you in full.</p>`, 'u-card--edge')}
    ${card(`<p class="u-k">Added by Prolaio</p>
      <p class="u-num" style="color:var(--purple)">$45</p>
      <p class="u-note">Paid by Prolaio. Not taken from your earnings.</p>`)}`, 3),
  '18C': scr(`
    ${nav('Your impact')}
    ${card(`<p class="u-lead">Your 7 days of patch data generated</p>
      <p class="u-num u-num--c">$15</p>
      <p class="u-note u-note--c">toward cardiovascular research</p>`, 'u-card--edge')}
    ${card(`<p class="u-k">By city</p>
      <div class="u-pls">
        ${place('Boston', '$2,140', 100, true)}
        ${place('Chicago', '$1,780', 83, false)}
        ${place('Phoenix', '$1,220', 57, false)}
      </div>`)}`, 3),
  '18D': scr(`
    ${nav('Choose your cause', 'Setup')}
    ${card(`<p class="u-lead">Where should your contribution go?</p>
      <p class="u-note">You can change this any time.</p>`, 'u-card--edge')}
    <div class="u-orgs u-orgs--card">
      ${org('American Heart Association', '4-star rated, 81% to programs', true)}
      ${org('Mended Hearts', '4-star rated, 88% to programs', false)}
      ${org('WomenHeart', '3-star rated, 76% to programs', false)}
    </div>`, false),

  /* ----------------------- 19 · why this matters ------------------------ */
  '19A': scr(`
    ${nav('The study')}
    ${card(`<p class="u-num u-num--c">1,240</p>
      <p class="u-note u-note--c">people are in this cohort with you</p>`, 'u-card--edge')}
    ${card(`<p class="u-k">Study totals</p>
      ${rows([['Days of heart data', '8,900'], ['Patch weeks completed', '1,010'], ['Surveys answered', '24,300']])}`)}
    ${card(`<p class="u-note">Updated daily. Includes your latest data.</p>`)}`, 3),
  '19B': scr(`
    ${nav('Study updates')}
    ${card(`${eyebrow('Update 3 · September')}
      <p class="u-lead">Night readings are the most accurate</p>
      <p class="u-note">Night data is cleaner than daytime data, so patch week matters most.</p>
      <p class="u-note"><b>From</b> 1,240 participants, including you.</p>`, 'u-card--edge')}
    ${card(`${eyebrow('Update 2 · August')}<p class="u-lead">Who is taking part</p>`)}
    ${card(`${eyebrow('Update 1 · July')}<p class="u-lead">What we set out to answer</p>`)}`, 2),
  '19C': scr(`
    ${nav('Your study team')}
    ${card(`<div class="u-person u-person--lg"><span class="u-av"></span>
      <div><b>Dr. Amara Osei</b><span>Principal investigator</span></div></div>
      <p class="u-note">“I read the rhythm records every week. Yours is one of them.”</p>`, 'u-card--edge')}
    ${card(`<p class="u-k">Results session</p>
      <p class="u-note">20 November, 6 PM. Amara walks through what the study found and takes questions.</p>
      ${btn('Save my place')}`)}
    ${card(`<p class="u-k">Your coordinator</p>
      <div class="u-person"><span class="u-av"></span><div><b>Dana R.</b><span>For anything day to day</span></div></div>`)}`, 3),
  '19D': scr(`
    ${nav('Where your data goes')}
    <div class="u-flow">
      <div class="u-fl"><b>Your patch</b><span>Thursday, 3:12 AM</span></div>
      <div class="u-fl"><b>Encrypted upload</b><span>Nothing identifying attached</span></div>
      <div class="u-fl"><b>Cohort dataset</b><span>Pooled with 1,240 others</span></div>
      <div class="u-fl is-end"><b>Night-rhythm finding</b><span>Published update 3</span></div>
    </div>`, 2),
  '19E': scr(`
    ${nav('How your data is used')}
    ${card(`${eyebrow('Digital biomarkers')}
      <p class="u-lead">A clinic test, read from everyday data</p>`, 'u-card--edge')}
    <div class="u-flow">
      <div class="u-fl"><b>Your readings</b><span>Heart rhythm, blood pressure</span></div>
      <div class="u-fl"><b>Pooled with 1,240 others</b><span>Nothing identifying attached</span></div>
      <div class="u-fl"><b>A new biomarker is checked</b><span>Against the clinic test</span></div>
      <div class="u-fl is-end"><b>A future patient</b><span>Skips the clinic visit</span></div>
    </div>`, 2),
  '19F': scr(`
    ${nav('How the study works')}
    ${card(`${eyebrow('What we measure')}
      <p class="u-lead">eVO2peak</p>
      <p class="u-note">Heart and lung fitness, measured from daily activity.</p>`, 'u-card--edge')}
    ${card(`<div class="u-try"><span class="u-try__n">1</span>
        <div><b>Your devices record</b><span>Heart rhythm and vital signs through the day</span></div></div>
      <div class="u-try"><span class="u-try__n">2</span>
        <div><b>An algorithm reads the pattern</b><span>How your heart responds to walking, stairs, rest</span></div></div>
      <div class="u-try"><span class="u-try__n">3</span>
        <div><b>It estimates your peak VO₂</b><span>The most oxygen your body can use</span></div></div>`)}`, 2),

  /* -------------------- 20 · learning without claims -------------------- */
  '20A': scr(`
    ${nav('Resting heart rate')}
    ${card(`<p class="u-num">68<small>bpm</small></p>`)}
    ${card(`<p class="u-k">Resting heart rate <span class="u-q">?</span></p>
      <p class="u-note">The number of times your heart beats per minute when you are still and awake.</p>
      <p class="u-note u-note--src">Adapted from the American Heart Association</p>`, 'u-card--edge')}`, 1),
  '20B': scr(`
    ${nav('Learn')}
    ${card(`<p class="u-lead">4 short reads, 14 min</p>`, 'u-card--edge')}
    ${rows([['What a heart rhythm record shows', '3 min'], ['How the patch collects data', '2 min'], ['Why studies need a control group', '4 min'], ['Reading your monthly report', '5 min']])}`, 2),
  '20C': scr(`
    ${nav('Learn', 'Week 5')}
    ${card(`${eyebrow('New this week')}
      <p class="u-lead">Reading your monthly report</p>
      <p class="u-note">Your first report arrives Friday.</p>`, 'u-card--edge')}
    <div class="u-steps u-steps--sm">
      <div class="u-step is-done"><b>Week 1</b><span>How the patch works</span></div>
      <div class="u-step is-done"><b>Week 3</b><span>What we measure and why</span></div>
      <div class="u-step is-now"><b>Week 5</b><span>Reading your report</span></div>
      <div class="u-step"><b>Week 9</b><span>What happens to your data after</span></div>
    </div>`, 2),
  '20D': scr(`
    ${nav('Live sessions')}
    ${card(`${eyebrow('Thursday, 6 PM')}
      <p class="u-lead">Reading your report, with Dana</p>
      <p class="u-note">30-minute live walkthrough with Q&amp;A.</p>
      ${btn('Save my place')}
      <p class="u-note u-note--src">Recorded, if you cannot make it</p>`, 'u-card--edge')}
    ${card(`<p class="u-k">Past sessions</p>
      ${rows([['Setting up your kit', '28 min'], ['What the study is for', '22 min']])}`)}`, 2),

  /* ------------------------ 21 · quiet community ------------------------ */
  '21A': scr(`
    ${nav('Monthly poll')}
    ${card(`<p class="u-lead">What is the hardest part of wearing the patch?</p>
      <div class="u-poll">
        <span class="u-opt"><b>Sleeping with it</b><i style="width:41%"></i><em>41%</em></span>
        <span class="u-opt is-you"><b>Showering</b><i style="width:28%"></i><em>28%</em></span>
        <span class="u-opt"><b>Remembering to check it</b><i style="width:19%"></i><em>19%</em></span>
        <span class="u-opt"><b>Nothing, it is fine</b><i style="width:12%"></i><em>12%</em></span>
      </div>
      <p class="u-note">840 responses. Your answer is highlighted.</p>`, 'u-card--edge')}`, 2),
  '21B': scr(`
    ${nav('Settings', 'Comparison')}
    ${card(`<div class="u-tog"><div><b>Show cohort average</b></div>
      <span class="u-sw is-on"></span></div>`, 'u-card--edge')}
    ${card(`<p class="u-k">With it on</p>
      <p class="u-note">Wear time, you and the cohort average</p>
      ${bars([62, 70, 58, 74, 66, 80, 72], 5)}`)}`, 3),
  '21C': scr(`
    ${nav('Community', 'Moderated')}
    ${rows([['Anyone else itchy under the patch?', '12'], ['Best way to sleep with it', '31'], ['How long till results?', '8']])}
    ${card(`<p class="u-note">Moderated by the study team.</p>
      ${btn('Start a thread', 'u-btn--ghost')}`)}`, 3),
  '21D': scr(`
    ${nav('Share the study')}
    ${card(`<p class="u-lead">Know someone with a heart condition?</p>
      <p class="u-note">Send them the study page.</p>
      <div class="u-link">prolaio.com/study</div>
      ${btn('Copy link')}`, 'u-card--edge')}`, 3),

};
