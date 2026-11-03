/* Testing prototype (27.OCT.2026): forked from journey-ui-v03.js for the testing plan and prototype page. Edits for testing go here; Concepts v03 stays as it is. */
/* ==========================================================================
   Journey prototype screens (Concepts v03, forked from v02 on 19.OCT.2026; v02 keeps the originals).

   GUIDELINE: v02 phone screens are drawn here, never in concepts-ui.js.
   concepts-ui.js holds the v01 mockups; the v01 page and the Figma deck's
   per-concept captures are built from it, so it stays frozen.

   UI2[id] is what the journey's prototype modal shows for that id (see
   JR_AREAS flows in journey.js); an id missing here falls back to UI[id].
   Each entry below started as a copy of its v01 screen and is redesigned
   one at a time. Reuse the primitives from concepts-ui.js (loaded first);
   add v02-only primitives here, and v02-only styles to the "v02 screens"
   section at the end of journey.css, scoped to .is-v2 or a j- class.

   Same rules as v01: light mode, no confetti or faces, no percentages shown
   to the participant, and a reading is never given a verdict.
   ========================================================================== */

/* Samsung Galaxy status bar (One UI, 28.OCT.2026: interviewees hold a
   Samsung phone): the time on the left, the camera's punch hole in the
   middle, then Wi-Fi, signal and the battery with its percentage on the
   right. The glyphs are drawn to One UI's proportions, not Samsung's assets */
const sbWifi = `<svg width="9" height="7" viewBox="0 0 18 14"><path d="M9 14 0 3.6C2.4 1.4 5.6 0 9 0s6.6 1.4 9 3.6z"/></svg>`;
const sbSig  = `<svg width="8" height="8" viewBox="0 0 14 14"><path d="M14 0v14H0z"/></svg>`;
const sbBatt = `<svg width="13" height="7" viewBox="0 0 24 13"><rect x=".75" y=".75" width="20" height="11.5" rx="3" fill="none" stroke="currentColor" stroke-width="1.5"/><rect x="2.75" y="2.75" width="13" height="7.5" rx="1.5"/><rect x="22" y="4.5" width="2" height="4" rx="1"/></svg>`;
const phoneBar = () => `<div class="j-sb"><span class="j-sb__t">9:41</span><span class="j-sb__di"></span>` +
  `<span class="j-sb__r">${sbWifi}${sbSig}<em class="j-sb__p">87%</em>${sbBatt}</span></div>`;

/* the v02 tab bar: line icons, the active one filled on a soft pill */
/* two tabs: Home (today and its checklist) and Resources (your data,
   earnings, badges, community, the study). A screen drawn for an old
   third or fourth tab sits under Resources */
/* v04 (30.OCT.2026): two tabs, Today and Library (Resources until now); no views menu. The
   roadmap is a toggle on Today's top bar, where the menu was (topToggle) */
const TABS2 = [
  ['Today', '<path d="M4 11 12 4l8 7v8.5a1 1 0 0 1-1 1h-4.5V15h-5v5.5H5a1 1 0 0 1-1-1z"/>'],
  ['Library', '<path d="M4 5.5C6.5 4.3 9.5 4.3 12 6c2.5-1.7 5.5-1.7 8-.5v13c-2.5-1.2-5.5-1.2-8 .5-2.5-1.7-5.5-1.7-8-.5z"/><path d="M12 6v13.5"/>'],
];
const tabs2 = (active = 0) => `<div class="j-tabs">${TABS2.map(([t, g], i) =>
  /* v03: each tab carries its own action, so a tap works on either phone
     (the Prolaio twin passes taps on by data-tap) */
  `<span class="${i === (active === 'road' ? 0 : Math.min(active, 1)) ? 'is-on' : ''}${i === 0 ? ' j-tabs__today' : ''}" data-tap="tab:${i}"><i><svg viewBox="0 0 24 24">${g}</svg></i>${t}</span>`).join('')}</div>`;

/* a v02 screen: the phone's status bar, body, optional tab bar, home indicator.
   Every one carries .is-v2, so its styles never reach v01 */
/* the lit part, its pointer, and where a tap goes (none: the lit part keeps its own) */
/* LIT off: build a screen with no highlights (setup steps 3 on) */
let LIT = true;
const spot = (inner, tip, to) => !LIT ? inner : `<div class="j-spot"${to ? ` data-tap="view:${to}"` : ''}>${inner}
  <p class="j-spot__tip">${tip}</p></div>`;
/* v03 (22.OCT.2026): a longer note that goes with the screen's buttons
   (the study team checks every post...) takes no room: it becomes an (i)
   beside the title, and a tap shows it. A short one ("Next: blood
   pressure, Friday") stays above the buttons */
const gSearchH = `<svg viewBox="0 0 24 24" class="u-g" aria-hidden="true"><circle cx="11" cy="11" r="6.5"/><path d="m16 16 4.5 4.5"/></svg>`;
const gInfo = `<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M12 11v5"/><circle cx="12" cy="7.8" r=".6"/></svg>`;
const infoNote = (body) => {
  const m = /<p class="[^"]*\bj-thumb__note">([^<]{40,})<\/p>/.exec(body);
  if (!m || !body.includes('<div class="u-nav"><b>')) return body;
  return body.replace(m[0], '').replace(/(<div class="u-nav"><b>)([\s\S]*?)(<\/b>)/,
    (x, a, t, z) => `${a}${t}<span class="j-info" role="button" aria-label="About this screen" data-tap="toast:${m[1]}">${gInfo}</span>${z}`);
};
/* v04 (29.OCT.2026): a back link is the back arrow alone, the same as on
   every page with the top bar ("‹ Today" text links go) */
const BACK_I = '<i class="u-back__i" aria-hidden="true"><svg viewBox="0 0 10 10"><path d="M6.4 1.8 3.2 5l3.2 3.2"/></svg></i>';
const BACK_P = (tap, label) => `<p class="j-back" data-tap="${tap}" aria-label="Back to ${label}"><svg class="j-chev " viewBox="0 0 10 10" aria-hidden="true"><path d="M3.6 1.8 6.8 5 3.6 8.2"/></svg></p>`;
const backIcon = (h) => h.replace(/<div class="u-back" data-tap="([^"]*)">‹\s*([^<]*)<\/div>/g, (m, tap, label) => BACK_P(tap, label.trim()));
const scr2 = (body, tab = 0, cls = '') =>
  `<div class="u-scr is-v2 ${cls}">${phoneBar()}<div class="u-body">${stickHead(oneHead(infoNote(backIcon(body))))}</div>` +
  `${tab === false ? '' : tabs2(tab)}<span class="j-hi"></span></div>`;

/* the title stays at the top while the screen scrolls under it: only the
   way back and the title row; status lines under it scroll with the rest */
/* one header format on every screen: row 1 is the title alone (a link
   such as Help may sit at its right); row 2 is the time or status, as one
   subline; then any progress bar */
const oneHead = (body) => body
  /* a time or status at the title's right moves under it: steps and
     dates in purple bold, times in grey regular */
  .replace(/<div class="u-nav"><b>([^<]*)<\/b><span>(?!Help<)([^<]+)<\/span><\/div>/, (m, t, note) =>
    /* a day or a date stays at the top right, where Help sits elsewhere */
    /* v04 (28.OCT.2026): the study day too ("Day 1 of 90", "8 days left",
       "Cycle 2 · Day 5 of 90"): title left, day right, one row */
    /^(Day \d+( of \d+)?|\d+ days left( in cycle \d+)?|Last day( of .*)?|Cycle \d+ · Day \d+ of \d+|(Cycle \d+ · )?Week \d+|(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)( \d+(–\d+)?)?)$/.test(note) ? `<div class="u-nav"><b>${t}</b><span class="j-day">${note}</span></div>` :
    `<div class="u-nav"><b>${t}</b><span></span></div><p class="j-sub">${note.split(' · ')
      .map((part) => /minute/.test(part) ? part : `<b>${part}</b>`).join(' · ')}</p>`)
  /* a setup step's line goes under the title, above its bar */
  .replace(/(<div class="j-seg[^"]*">[\s\S]*?<\/div>)\s*<p class="j-cheer">([\s\S]*?)<\/p>/,
    '<p class="j-sub">$2</p>\n    $1');

const stickHead = (body) => {
  const m = /^\s*(?:<p class="j-back"[\s\S]*?<\/p>\s*)?<div class="u-nav">[\s\S]*?<\/div>/.exec(body);
  return m ? `<div class="j-hd">${m[0]}</div>${body.slice(m[0].length)}` : body;
};

/* ------------------------------------------------- prototype interactions
   Anything with data-tap is a hotspot; journey.js runs it. Actions:
     view:<id>    swap the phone to UI2[id], staying on the same flow step
     sheet:<id>   slide up the overlay UI2X[id] (a sheet or a notification)
     toggle       open or close the hotspot itself (an expanding row)
     back         where you were before this screen (or the step before, at the start)
     open:<id>    open the expanding row with that id, and scroll to it
     on:<class>   switch a mode on for the whole screen; off:<class> switches it off
     close        dismiss the overlay
     toast:<text> a short message at the top of the screen
   A screen element with data-auto="<action>;<ms>" runs the action by itself
   after that delay (a splash screen moving on).
   Tapping anything else on a screen with hotspots highlights them. */
/* a dropdown's down caret */
const gDown = `<svg viewBox="0 0 16 16" class="j-caret" aria-hidden="true"><path d="M4 6l4 4 4-4"/></svg>`;
const sheet = (body) => `<div class="j-ov"><span class="j-ov__bg" data-tap="close"></span>
  <div class="j-sh"><span class="j-sh__h" data-tap="close"></span>
  <span class="j-sh__x" data-tap="close">✕</span>${body}</div></div>`;

/* a lock-screen notification, as One UI draws it: the clock, the date
   under it, then the card; tapping it opens `to` */
const notif = (time, day, title, body, to) => `<div class="j-ov j-ov--lock"><span class="j-ov__bg" data-tap="close"></span>
  <div class="j-lock"><p class="j-lock__t">${time.replace(/ ?[AP]M$/, '')}</p><p class="j-lock__d">${day}</p>
  <div class="j-nt" data-tap="sheet:${to}"><i class="j-nt__i">P</i><div><p class="j-nt__a">Prolaio <em>· now</em></p>
  <b>${title}</b><span>${body}</span></div></div>
  <p class="j-lock__h">Tap the notification</p></div></div>`;

/* --- 2A: the month on one screen --- */
/* --- the client's icons (Prolaio PMA 6.0, Figma "Homepage | Tasks lists") ---
   Device glyphs from their device tiles, without the tile's circle, since
   our rows supply the backing. The questionnaire is their task-list icon,
   recoloured to the same purple as the devices. Class c-g keeps our line-icon stroke off them. */
const cPatch = `<svg viewBox="734.13 608.25 17.16 17.16" class="u-g c-g"><path fill-rule="evenodd" clip-rule="evenodd" d="M735.268 609.389C736.598 608.06 738.99 607.795 740.319 609.124C741.379 610.183 742.007 611.846 742.548 613.278C742.958 614.361 743.317 615.311 743.774 615.769C744.232 616.227 745.183 616.586 746.265 616.995C747.697 617.536 749.36 618.165 750.42 619.225C751.749 620.554 751.483 622.946 750.154 624.275C748.825 625.604 746.433 625.87 745.104 624.541C743.979 623.416 743.243 621.515 742.66 620.011C742.279 619.026 741.963 618.211 741.648 617.895C741.332 617.58 740.518 617.264 739.533 616.883C738.028 616.301 736.127 615.564 735.003 614.44C733.674 613.111 733.939 610.718 735.268 609.389ZM748.063 622.183C748.577 621.669 748.985 621.089 749.287 620.47L749.928 620.871C749.594 621.536 749.149 622.159 748.594 622.714C748.039 623.27 747.416 623.714 746.751 624.048L746.35 623.407C746.969 623.105 747.549 622.697 748.063 622.183ZM747.632 621.752C747.151 622.233 746.607 622.612 746.025 622.888L745.624 622.245C746.159 622.003 746.661 621.661 747.101 621.221C747.541 620.781 747.883 620.279 748.125 619.744L748.768 620.146C748.492 620.727 748.113 621.271 747.632 621.752ZM746.67 620.79C747.078 620.383 747.389 619.916 747.604 619.418L746.957 619.014C746.778 619.467 746.505 619.892 746.139 620.259C745.772 620.626 745.347 620.898 744.894 621.077L745.298 621.724C745.796 621.509 746.263 621.198 746.67 620.79ZM744.644 618.765C744.351 619.059 743.875 619.059 743.581 618.765C743.287 618.472 743.287 617.996 743.581 617.702C743.875 617.408 744.351 617.408 744.644 617.702C744.938 617.996 744.938 618.472 744.644 618.765ZM738.132 614.911C738.352 615.131 738.709 615.131 738.929 614.911C739.149 614.691 739.149 614.334 738.929 614.113C738.709 613.893 738.352 613.893 738.132 614.113C737.912 614.334 737.912 614.691 738.132 614.911Z" fill="#6142BD"/></svg>`;
const cBand = `<svg viewBox="796.91 606.35 21.04 21.04" class="u-g c-g"><path fill-rule="evenodd" clip-rule="evenodd" d="M804.595 609.281L807.899 610.238C808.183 610.321 808.487 610.227 808.692 610.013C810.158 608.488 812.996 606.691 814.837 609.591C814.769 608.592 813.636 606.359 807.855 606.355C807.001 606.355 805.414 606.806 804.223 608.222C803.907 608.597 804.124 609.144 804.595 609.281ZM810.148 610.601C810.277 613.726 809.576 619.16 806.03 623.603C805.682 624.039 805.445 624.585 805.593 625.124C805.894 626.218 806.814 627.352 809.013 626.583C812.521 625.357 816.676 618.41 814.837 609.964C814.314 609.128 812.944 607.921 811.137 608.652C810.396 608.952 810.116 609.802 810.148 610.601ZM800.538 620.48L804.072 621.363C804.413 621.448 804.647 621.757 804.659 622.108C804.737 624.316 805.493 627.693 808.128 627.196C804.966 627.807 799.045 627.376 799.642 621.091C799.684 620.655 800.113 620.373 800.538 620.48ZM806.29 610.452L803.599 609.784C803.2 609.685 802.774 609.809 802.515 610.129C800.301 612.869 799.65 616.509 799.578 618.619C799.561 619.104 799.895 619.52 800.363 619.652L802.942 620.378C803.597 620.562 804.268 620.13 804.426 619.468C804.995 617.083 806.183 614.054 807.059 612.028C807.341 611.378 806.978 610.623 806.29 610.452Z" fill="#6142BD"/></svg>`;
const cBp = `<svg viewBox="981.52 702.87 18.8 18.8" class="u-g c-g"><path fill-rule="evenodd" clip-rule="evenodd" d="M990.543 708.605C990.543 711.096 988.524 713.116 986.032 713.116C983.541 713.116 981.521 711.096 981.521 708.605C981.521 706.114 983.541 704.094 986.032 704.094C988.524 704.094 990.543 706.114 990.543 708.605ZM986.408 705.222C986.408 705.429 986.24 705.598 986.032 705.598C985.825 705.598 985.656 705.429 985.656 705.222C985.656 705.014 985.825 704.846 986.032 704.846C986.24 704.846 986.408 705.014 986.408 705.222ZM986.032 706.725C985.825 706.725 985.656 706.894 985.656 707.101V708.981C985.656 709.189 985.825 709.357 986.032 709.357C986.24 709.357 986.408 709.189 986.408 708.981V707.101C986.408 706.894 986.24 706.725 986.032 706.725ZM982.649 708.981C982.857 708.981 983.025 708.813 983.025 708.605C983.025 708.397 982.857 708.229 982.649 708.229C982.441 708.229 982.273 708.397 982.273 708.605C982.273 708.813 982.441 708.981 982.649 708.981ZM989.416 708.981C989.623 708.981 989.791 708.813 989.791 708.605C989.791 708.397 989.623 708.229 989.416 708.229C989.208 708.229 989.04 708.397 989.04 708.605C989.04 708.813 989.208 708.981 989.416 708.981ZM984.153 706.349C984.153 706.557 983.984 706.725 983.777 706.725C983.569 706.725 983.401 706.557 983.401 706.349C983.401 706.142 983.569 705.974 983.777 705.974C983.984 705.974 984.153 706.142 984.153 706.349ZM983.777 711.236C983.984 711.236 984.153 711.068 984.153 710.86C984.153 710.653 983.984 710.485 983.777 710.485C983.569 710.485 983.401 710.653 983.401 710.86C983.401 711.068 983.569 711.236 983.777 711.236ZM988.664 706.349C988.664 706.557 988.495 706.725 988.288 706.725C988.08 706.725 987.912 706.557 987.912 706.349C987.912 706.142 988.08 705.974 988.288 705.974C988.495 705.974 988.664 706.142 988.664 706.349ZM988.288 711.236C988.495 711.236 988.664 711.068 988.664 710.86C988.664 710.653 988.495 710.485 988.288 710.485C988.08 710.485 987.912 710.653 987.912 710.86C987.912 711.068 988.08 711.236 988.288 711.236ZM992.423 708.229C992.008 708.229 991.671 708.566 991.671 708.981V716.875C991.671 717.29 992.008 717.627 992.423 717.627H997.31C997.933 717.627 998.438 717.122 998.438 716.499V709.357C998.438 708.734 997.933 708.229 997.31 708.229H992.423ZM999.565 717.627H998.814C999.05 717.313 999.189 716.922 999.189 716.499V709.357C999.189 708.934 999.05 708.543 998.814 708.229H999.565C999.981 708.229 1000.32 708.566 1000.32 708.981V716.875C1000.32 717.29 999.981 717.627 999.565 717.627ZM986.596 713.868V716.123C986.596 717.888 988.027 719.319 989.791 719.319H993.175C993.694 719.319 994.115 718.898 994.115 718.379H995.242C995.242 719.521 994.317 720.446 993.175 720.446H989.791C987.404 720.446 985.468 718.511 985.468 716.123V713.868H986.596Z" fill="#6142BD"/></svg>`;
const cWeight = `<svg viewBox="1047.26 704.09 16.54 16.54" class="u-g c-g"><path fill-rule="evenodd" clip-rule="evenodd" d="M1059.66 708.229C1059.66 710.513 1057.81 712.364 1055.53 712.364C1053.24 712.364 1051.39 710.513 1051.39 708.229C1051.39 705.945 1053.24 704.094 1055.53 704.094C1057.81 704.094 1059.66 705.945 1059.66 708.229ZM1055.9 705.598C1055.9 705.805 1055.73 705.974 1055.53 705.974C1055.32 705.974 1055.15 705.805 1055.15 705.598C1055.15 705.39 1055.32 705.222 1055.53 705.222C1055.73 705.222 1055.9 705.39 1055.9 705.598ZM1055.53 707.101C1055.32 707.101 1055.15 707.27 1055.15 707.477V708.981C1055.15 709.189 1055.32 709.357 1055.53 709.357C1055.73 709.357 1055.9 709.189 1055.9 708.981V707.477C1055.9 707.27 1055.73 707.101 1055.53 707.101ZM1052.9 708.605C1053.1 708.605 1053.27 708.437 1053.27 708.229C1053.27 708.021 1053.1 707.853 1052.9 707.853C1052.69 707.853 1052.52 708.021 1052.52 708.229C1052.52 708.437 1052.69 708.605 1052.9 708.605ZM1058.16 708.605C1058.37 708.605 1058.53 708.437 1058.53 708.229C1058.53 708.021 1058.37 707.853 1058.16 707.853C1057.95 707.853 1057.78 708.021 1057.78 708.229C1057.78 708.437 1057.95 708.605 1058.16 708.605ZM1054.02 706.349C1054.02 706.557 1053.86 706.725 1053.65 706.725C1053.44 706.725 1053.27 706.557 1053.27 706.349C1053.27 706.142 1053.44 705.974 1053.65 705.974C1053.86 705.974 1054.02 706.142 1054.02 706.349ZM1057.41 706.725C1057.61 706.725 1057.78 706.557 1057.78 706.349C1057.78 706.142 1057.61 705.974 1057.41 705.974C1057.2 705.974 1057.03 706.142 1057.03 706.349C1057.03 706.557 1057.2 706.725 1057.41 706.725ZM1060.79 708.229C1060.79 711.136 1058.43 713.492 1055.53 713.492C1052.62 713.492 1050.26 711.136 1050.26 708.229H1049.19C1048.54 708.229 1048.03 708.764 1048.06 709.406L1048.5 719.555C1048.53 720.159 1049.02 720.634 1049.63 720.634H1055.15V714.62H1055.9V720.634H1061.43C1062.03 720.634 1062.53 720.159 1062.56 719.555L1062.99 709.406C1063.02 708.764 1062.51 708.229 1061.87 708.229H1060.79Z" fill="#6142BD"/></svg>`;
const cQ = `<svg viewBox="103.75 624.02 12.03 12.03" class="u-g c-g"><path fill-rule="evenodd" clip-rule="evenodd" d="M107.512 624.023C107.305 624.023 107.137 624.192 107.137 624.399V625.151C107.137 625.566 107.473 625.903 107.888 625.903H111.648C112.063 625.903 112.399 625.566 112.399 625.151V624.399C112.399 624.192 112.231 624.023 112.023 624.023H107.512ZM106.009 624.775H106.385V625.151C106.385 625.982 107.058 626.655 107.888 626.655H111.648C112.478 626.655 113.151 625.982 113.151 625.151V624.775H113.527C114.15 624.775 114.655 625.28 114.655 625.903V634.925C114.655 635.548 114.15 636.053 113.527 636.053H106.009C105.386 636.053 104.881 635.548 104.881 634.925V625.903C104.881 625.28 105.386 624.775 106.009 624.775ZM107.888 628.535C107.888 628.327 108.057 628.159 108.264 628.159H112.775C112.983 628.159 113.151 628.327 113.151 628.535C113.151 628.742 112.983 628.91 112.775 628.91H108.264C108.057 628.91 107.888 628.742 107.888 628.535ZM106.761 628.159C106.553 628.159 106.385 628.327 106.385 628.535C106.385 628.742 106.553 628.91 106.761 628.91C106.968 628.91 107.137 628.742 107.137 628.535C107.137 628.327 106.968 628.159 106.761 628.159ZM107.888 631.166C107.888 630.958 108.057 630.79 108.264 630.79H112.775C112.983 630.79 113.151 630.958 113.151 631.166C113.151 631.374 112.983 631.542 112.775 631.542H108.264C108.057 631.542 107.888 631.374 107.888 631.166ZM106.761 630.79C106.553 630.79 106.385 630.958 106.385 631.166C106.385 631.374 106.553 631.542 106.761 631.542C106.968 631.542 107.137 631.374 107.137 631.166C107.137 630.958 106.968 630.79 106.761 630.79ZM107.888 633.797C107.888 633.59 108.057 633.421 108.264 633.421H112.775C112.983 633.421 113.151 633.59 113.151 633.797C113.151 634.005 112.983 634.173 112.775 634.173H108.264C108.057 634.173 107.888 634.005 107.888 633.797ZM106.761 633.421C106.553 633.421 106.385 633.59 106.385 633.797C106.385 634.005 106.553 634.173 106.761 634.173C106.968 634.173 107.137 634.005 107.137 633.797C107.137 633.59 106.968 633.421 106.761 633.421Z" fill="#6142BD"/></svg>`;

const gPatch = cPatch;
/* the phone, drawn to match the client's device icons: solid #6142BD, the
   screen cut out, a home bar */
/* what the devices record, in the same filled style and the symbols health
   apps use: a heart for heart rate, a bed for sleep, footprints for steps */
const cHeart = `<svg viewBox="0 0 24 24" class="u-g c-g"><path d="M12 20.6c-.3 0-.6-.1-.8-.3C7.6 17.4 3 13.6 3 9.2 3 6.3 5.2 4 8 4c1.6 0 3 .8 4 2 1-1.2 2.4-2 4-2 2.8 0 5 2.3 5 5.2 0 4.4-4.6 8.2-8.2 11.1-.2.2-.5.3-.8.3Z" fill="#6142BD"/></svg>`;
const cBed = `<svg viewBox="0 0 24 24" class="u-g c-g"><path fill-rule="evenodd" clip-rule="evenodd" d="M3.5 5c.6 0 1 .4 1 1v6H20a2 2 0 0 1 2 2v4.5a1 1 0 1 1-2 0V17H4.5v1.5a1 1 0 1 1-2 0V6c0-.6.4-1 1-1ZM6 9.2C6 8.5 6.5 8 7.2 8h3.1c.7 0 1.2.5 1.2 1.2V11H6V9.2Zm6.5.8c0-.6.4-1 1-1h4a3 3 0 0 1 3 3H12.5v-2Z" fill="#6142BD"/></svg>`;
const cSteps = `<svg viewBox="0 0 24 24" class="u-g c-g"><path d="M8.2 2.5c2 0 3.1 2.2 3.1 4.8 0 2.3-.8 3.8-1.1 5.1H6.2c-.3-1.3-1.1-2.8-1.1-5.1 0-2.6 1.1-4.8 3.1-4.8ZM6.4 13.6h3.6v1.3a1.8 1.8 0 0 1-3.6 0v-1.3ZM15.8 7.5c2 0 3.1 2.2 3.1 4.8 0 2.3-.8 3.8-1.1 5.1h-4c-.3-1.3-1.1-2.8-1.1-5.1 0-2.6 1.1-4.8 3.1-4.8ZM14 18.6h3.6v1.3a1.8 1.8 0 0 1-3.6 0v-1.3Z" fill="#6142BD"/></svg>`;
const cPhone = `<svg viewBox="0 0 24 24" class="u-g c-g"><path fill-rule="evenodd" clip-rule="evenodd" d="M9 2h6a3 3 0 0 1 3 3v14a3 3 0 0 1-3 3H9a3 3 0 0 1-3-3V5a3 3 0 0 1 3-3Zm-.8 3.6c0-.5.4-.9.9-.9h5.8c.5 0 .9.4.9.9v11.5c0 .5-.4.9-.9.9H9.1a.9.9 0 0 1-.9-.9V5.6Zm2.6 14.1c0-.3.2-.5.5-.5h1.4c.3 0 .5.2.5.5s-.2.5-.5.5h-1.4a.5.5 0 0 1-.5-.5Z" fill="#6142BD"/></svg>`;
/* report: drawn to match the client's set (one solid #6142BD shape, details
   cut out): a page with a clipped corner and three bars of readings */
const cReport = `<svg viewBox="0 0 24 24" class="u-g c-g"><path fill-rule="evenodd" clip-rule="evenodd" d="M7.5 2H14.2C14.6 2 15 2.16 15.28 2.44L19.56 6.72C19.84 7 20 7.4 20 7.8V19.5C20 20.88 18.88 22 17.5 22H7.5C6.12 22 5 20.88 5 19.5V4.5C5 3.12 6.12 2 7.5 2ZM8.6 6.2C8.27 6.2 8 6.47 8 6.8V7.4C8 7.73 8.27 8 8.6 8H12.4C12.73 8 13 7.73 13 7.4V6.8C13 6.47 12.73 6.2 12.4 6.2H8.6ZM8.75 14C8.34 14 8 14.34 8 14.75V18.25C8 18.66 8.34 19 8.75 19H9.75C10.16 19 10.5 18.66 10.5 18.25V14.75C10.5 14.34 10.16 14 9.75 14H8.75ZM12.25 10.5C11.84 10.5 11.5 10.84 11.5 11.25V18.25C11.5 18.66 11.84 19 12.25 19H13.25C13.66 19 14 18.66 14 18.25V11.25C14 10.84 13.66 10.5 13.25 10.5H12.25ZM15.75 12.5C15.34 12.5 15 12.84 15 13.25V18.25C15 18.66 15.34 19 15.75 19H16.75C17.16 19 17.5 18.66 17.5 18.25V13.25C17.5 12.84 17.16 12.5 16.75 12.5H15.75Z" fill="#6142BD"/></svg>`;
/* status: a check in a circle, "everything is working", in the same solid style
   (the Status row on Resources) */
const cStatus = `<svg viewBox="0 0 24 24" class="u-g c-g"><path fill-rule="evenodd" clip-rule="evenodd" fill="#6142BD" d="M12 2a10 10 0 1 1 0 20 10 10 0 0 1 0-20Zm4.7 7.3a1 1 0 0 0-1.4-1.4l-4.8 4.8-1.8-1.8a1 1 0 0 0-1.4 1.4l2.5 2.5a1 1 0 0 0 1.4 0l5.5-5.5Z"/></svg>`;
/* v03: icons for the app's own features, so each row has its own instead of
   borrowing a device or report icon. Material Symbols Rounded, filled
   (Apache-2.0), the Android set Prolaio is built on, in the task-icon purple */
const mDevices = `<svg viewBox="0 -960 960 960" class="u-g c-g" aria-hidden="true"><path d="M471-160H110q-13 0-21.5-8.5T80-190q0-13 8.5-21.5T110-220h361q13 0 21.5 8.5T501-190q0 13-8.5 21.5T471-160ZM180-280q-24 0-42-18t-18-42v-400q0-24 18-42t42-18h600q24 0 42 18t18 42H606q-42 0-73.5 31.5T501-635v325q0 13-8.5 21.5T471-280H180Zm426 120q-18 0-31.5-13.5T561-205v-430q0-18 13.5-31.5T606-680h229q18 0 31.5 13.5T880-635v430q0 18-13.5 31.5T835-160H606Zm115-360q12 0 21-9t9-21q0-12-9-21t-21-9q-12 0-21 9t-9 21q0 12 9 21t21 9Z" fill="#6142BD"/></svg>`;
const mHealth = `<svg viewBox="0 -960 960 960" class="u-g c-g" aria-hidden="true"><path d="M140-160q-24 0-42-18t-18-42v-200q0-13 8.5-21.5T110-450h191l72 144q4 8 11.5 12t15.5 4q8 0 15.5-4t11.5-12l133-266 53 106q4 8 11.5 12t15.5 4h210q13 0 21.5 8.5T880-420v200q0 24-18 42t-42 18H140ZM80-740q0-24 18-42t42-18h680q24 0 42 18t18 42v200q0 13-8.5 21.5T850-510H659l-72-143q-4-8-11.5-11.5T560-668q-8 0-15.5 3.5T533-653L400-388l-53-106q-4-8-11.5-12t-15.5-4H110q-13 0-21.5-8.5T80-540v-200Z" fill="#6142BD"/></svg>`;
const mWeekDone = `<svg viewBox="0 -960 960 960" class="u-g c-g" aria-hidden="true"><path d="m433-313 163-163q9-9 21-8.5t21 9.5q9 9 9 21.2 0 12.19-9 20.8L454-249q-9 9-21 9t-21-9l-96-95q-9-8.61-9-20.8 0-12.2 9-21.2t21-8.5q12 .5 21 8.5l75 73ZM180-80q-24 0-42-18t-18-42v-620q0-24 18-42t42-18h65v-28q0-13.6 9-22.8 9-9.2 23.02-9.2t23.5 9.2Q310-861.6 310-848v28h340v-28q0-13.6 9-22.8 9-9.2 23.02-9.2t23.5 9.2Q715-861.6 715-848v28h65q24 0 42 18t18 42v620q0 24-18 42t-42 18H180Zm0-60h600v-430H180v430Z" fill="#6142BD"/></svg>`;
const mDone = `<svg viewBox="0 -960 960 960" class="u-g c-g" aria-hidden="true"><path d="M480-80q-85 0-158-30.5T195-195q-54-54-84.5-127T80-480q0-84 30.5-157T195-764q54-54 127-85t158-31q60 0 117 17.5T704-811q11 7 13.5 19t-5.5 22q-8 10-20 11t-23-6q-42-27-90-41t-99-14q-145 0-242.5 97.5T140-480q0 145 97.5 242.5T480-140q145 0 242.5-97.5T820-480q0-19-1.5-37t-5.5-35q-2-13 4-24t18-13q13-3 24 4.5t13 20.5q4 20 6 41t2 43q0 85-31 158t-85 127q-54 54-127 84.5T480-80Zm-59-309 392-392q9-9 22-9t23 9q10 10 10 23t-10 23L442-319q-9 9-21 9t-21-9L278-442q-9-9-8.5-22.5T279-487q9-9 22.5-9t22.5 9l97 98Z" fill="#6142BD"/></svg>`;
const mPay = `<svg viewBox="0 -960 960 960" class="u-g c-g" aria-hidden="true"><path d="M100-160q-24.75 0-42.37-17.63Q40-195.25 40-220v-430q0-12.75 8.68-21.38 8.67-8.62 21.5-8.62 12.82 0 21.32 8.62 8.5 8.63 8.5 21.38v430h670q12.75 0 21.38 8.68 8.62 8.67 8.62 21.5 0 12.82-8.62 21.32-8.63 8.5-21.38 8.5H100Zm120-120q-24.75 0-42.37-17.63Q160-315.25 160-340v-400q0-24.75 17.63-42.38Q195.25-800 220-800h640q24.75 0 42.38 17.62Q920-764.75 920-740v400q0 24.75-17.62 42.37Q884.75-280 860-280H220Zm100-60q0-42-29-71t-71-29v100h100Zm440 0h100v-100q-42 0-71 29t-29 71Zm-220-80q50 0 85-35t35-85q0-50-35-85t-85-35q-50 0-85 35t-35 85q0 50 35 85t85 35ZM220-640q42 0 71-29t29-71H220v100Zm640 0v-100H760q0 42 29 71t71 29Z" fill="#6142BD"/></svg>`;
const mFlame = `<svg viewBox="0 -960 960 960" class="u-g c-g" aria-hidden="true"><path d="M160-400q0-116 71.5-225T428-811q17-11 34.5-.5T480-780v72q0 34 23.5 57t57.5 23q18 0 33.5-7.5T622-658q8-9 18-12.5t19 2.5q66 45 103.5 116T800-400q0 95-49 171.5T622-113q23-26 35.5-58t12.5-67q0-38-14-71.5T615-370L480-502 346-370q-28 27-42 60.5T290-238q0 35 12.5 67t35.5 58q-80-39-129-115.5T160-400Zm320-18 92 90q18 18 28 41t10 49q0 53-38 90.5T480-110q-54 0-92-37.5T350-238q0-26 9.5-49t28.5-41l92-90Z" fill="#6142BD"/></svg>`;
const mQuiz = `<svg viewBox="0 -960 960 960" class="u-g c-g" aria-hidden="true"><path d="M572-352q12-12 12-29t-12-29q-12-12-29-12t-29 12q-12 12-12 29t12 29q12 12 29 12t29-12Zm-30-114q10 0 16.5-6.5T567-489q2-14 11-27.5t28-31.5q28-27 38-46t10-45q0-46-31.5-75T540-743q-32 0-59 15t-43 42q-5 8-1 17t14 14q9 4 18 .5t15-11.5q11-16 25-23.5t31-7.5q29 0 48 17t19 43q0 19-9 33.5T566-570q-22 18-33.5 38.5T519-489q-1 9 6 16t17 7ZM260-200q-24 0-42-18t-18-42v-560q0-24 18-42t42-18h560q24 0 42 18t18 42v560q0 24-18 42t-42 18H260ZM140-80q-24 0-42-18t-18-42v-590q0-13 8.5-21.5T110-760q13 0 21.5 8.5T140-730v590h590q13 0 21.5 8.5T760-110q0 13-8.5 21.5T730-80H140Z" fill="#6142BD"/></svg>`;
const mTrend = `<svg viewBox="0 -960 960 960" class="u-g c-g" aria-hidden="true"><path d="M102-252q-9-9-9-21.5t9-21.5l228-227q16.93-17 41.97-17Q397-539 414-522l125 125 241-241h-97q-12.75 0-21.37-8.68-8.63-8.67-8.63-21.5 0-12.82 8.63-21.32 8.62-8.5 21.37-8.5h167q12.75 0 21.38 8.62Q880-680.75 880-668v167q0 12-8.27 21t-20.5 9Q839-471 830-480t-9-21v-93L580-354q-16.93 17-41.97 17Q513-337 496-354L371-478 145-252q-9 9-21.5 9t-21.5-9Z" fill="#6142BD"/></svg>`;
const mForum = `<svg viewBox="0 -960 960 960" class="u-g c-g" aria-hidden="true"><path d="M850-123q-5 0-10.5-2t-10.5-7L721-240H300q-25 0-42.5-17.5T240-300v-80h440q25 0 42.5-17.5T740-440v-280h80q25 0 42.5 17.5T880-660v507q0 14-9.5 22t-20.5 8ZM110-322q-11 0-20.5-8T80-352v-468q0-25 17.5-42.5T140-880h480q25 0 42.5 17.5T680-820v320q0 25-17.5 42.5T620-440H240L131-331q-5 5-10.5 7t-10.5 2Z" fill="#6142BD"/></svg>`;
const mImpact = `<svg viewBox="0 -960 960 960" class="u-g c-g" aria-hidden="true"><path d="M549-53q8 2 17 2t17-2l297-91q0-54-30.5-80.5T762-251H587q-45 0-69.5-4.5T477-265l-61-21q-6-2-8.5-7.5T407-305q2-6 7.5-8.5t11.5-.5l59 19q24 8 44 11t46 3h73q8 0 13-5t5-13q0-23-16-45.5T604-378l-245-92q-5-2-10.5-3t-10.5-1h-83v337l294 84ZM40-140q0 25 17.5 42.5T100-80h34q25 0 42.5-17.5T194-140v-274q0-25-17.5-42.5T134-474h-34q-25 0-42.5 17.5T40-414v274Zm584-344.5q-11-4.5-20-12.5L482-616q-30-29-50-64.5T412-758q0-51 35.5-86.5T534-880q34 0 62 17.5t50 43.5q22-26 50-43.5t62-17.5q51 0 86.5 35.5T880-758q0 42-20 77.5T810-616L688-497q-9 8-20 12.5t-22 4.5q-11 0-22-4.5Z" fill="#6142BD"/></svg>`;
/* a house, for a shipping address (v04) */
const gHome = `<svg viewBox="0 -960 960 960" class="u-g c-g" aria-hidden="true"><path d="M160-120v-480l320-240 320 240v480H560v-280H400v280H160Z" fill="#6142BD"/></svg>`;
const mRefer = `<svg viewBox="0 -960 960 960" class="u-g c-g" aria-hidden="true"><path d="M474-486q26-32 38.5-66t12.5-79q0-45-12.5-79T474-776q76-17 133.5 23T665-631q0 82-57.5 122T474-486Zm202 326q5-15 9.5-29.5T690-220v-34q0-51-26-95t-90-74q173 22 236.5 64T874-254v34q0 24.75-17.62 42.37Q838.75-160 814-160H676Zm124-389h-70q-12.75 0-21.37-8.68-8.63-8.67-8.63-21.5 0-12.82 8.63-21.32 8.62-8.5 21.37-8.5h70v-70q0-12.75 8.68-21.38 8.67-8.62 21.5-8.62 12.82 0 21.32 8.62 8.5 8.63 8.5 21.38v70h70q12.75 0 21.38 8.68 8.62 8.67 8.62 21.5 0 12.82-8.62 21.32-8.63 8.5-21.38 8.5h-70v70q0 12.75-8.68 21.37-8.67 8.63-21.5 8.63-12.82 0-21.32-8.63-8.5-8.62-8.5-21.37v-70Zm-593 26q-42-42-42-108t42-108q42-42 108-42t108 42q42 42 42 108t-42 108q-42 42-108 42t-108-42ZM0-220v-34q0-35 18.5-63.5T68-360q72-32 128.5-46T315-420q62 0 118 14t128 46q31 14 50 42.5t19 63.5v34q0 24.75-17.62 42.37Q594.75-160 570-160H60q-24.75 0-42.37-17.63Q0-195.25 0-220Z" fill="#6142BD"/></svg>`;
const mHelp = `<svg viewBox="0 -960 960 960" class="u-g c-g" aria-hidden="true"><path d="M511-258.03q11-11.03 11-27T510.97-312q-11.03-11-27-11T457-311.97q-11 11.03-11 27T457.03-258q11.03 11 27 11T511-258.03ZM480.27-80q-82.74 0-155.5-31.5Q252-143 197.5-197.5t-86-127.34Q80-397.68 80-480.5t31.5-155.66Q143-709 197.5-763t127.34-85.5Q397.68-880 480.5-880t155.66 31.5Q709-817 763-763t85.5 127Q880-563 880-480.27q0 82.74-31.5 155.5Q817-252 763-197.68q-54 54.31-127 86Q563-80 480.27-80Zm2.5-580Q513-660 536-641.5q23 18.5 23 47.2 0 26.3-15.65 45.73Q527.7-529.14 508-512q-23 19-40 42.38-17 23.39-17 52.62 0 11 8.4 17.5T479-393q12 0 19.88-8 7.87-8 10.12-20 3-21 16-38t30.23-30.78Q580-510 596-537q16-27 16-58.61 0-50.39-37.5-83.89T485.55-713Q450-713 417-698t-54 44q-7 10-6.5 21.5t9.47 18.5q11.41 8 23.65 5 12.23-3 20.38-14 12.75-17.9 31.88-27.45Q461-660 482.77-660Z" fill="#6142BD"/></svg>`;
const mSettings = `<svg viewBox="0 -960 960 960" class="u-g c-g" aria-hidden="true"><path d="M421-80q-14 0-25-9t-13-23l-15-94q-19-7-40-19t-37-25l-86 40q-14 6-28 1.5T155-226L97-330q-8-13-4.5-27t15.5-23l80-59q-2-9-2.5-20.5T185-480q0-9 .5-20.5T188-521l-80-59q-12-9-15.5-23t4.5-27l58-104q8-13 22-17.5t28 1.5l86 40q16-13 37-25t40-18l15-95q2-14 13-23t25-9h118q14 0 25 9t13 23l15 94q19 7 40.5 18.5T669-710l86-40q14-6 27.5-1.5T804-734l59 104q8 13 4.5 27.5T852-580l-80 57q2 10 2.5 21.5t.5 21.5q0 10-.5 21t-2.5 21l80 58q12 8 15.5 22.5T863-330l-58 104q-8 13-22 17.5t-28-1.5l-86-40q-16 13-36.5 25.5T592-206l-15 94q-2 14-13 23t-25 9H421Zm59-270q54 0 92-38t38-92q0-54-38-92t-92-38q-54 0-92 38t-38 92q0 54 38 92t92 38Z" fill="#6142BD"/></svg>`;
const mTeam = `<svg viewBox="0 -960 960 960" class="u-g c-g" aria-hidden="true"><path d="M470-120q-12.75 0-21.37-8.68-8.63-8.67-8.63-21.5 0-12.82 8.63-21.32 8.62-8.5 21.37-8.5h310v-304q0-123.69-87.32-209.84Q605.36-780 480-780q-125.36 0-212.68 86.16Q180-607.69 180-484v224q0 8.5-5.75 14.25T160-240q-33 0-56.5-23.5T80-320v-80q0-21 10.5-39.5T120-469l3-53q8-68 39.5-126t79-101q47.5-43 109-67T480-840q68 0 129 24t109 66.5Q766-707 797-649t40 126l3 52q19 9 29.5 27t10.5 38v92q0 20-10.5 38T840-249v69q0 24.75-17.62 42.37Q804.75-120 780-120H470ZM338.5-418.68q-8.5-8.67-8.5-21.5 0-12.82 8.68-21.32 8.67-8.5 21.5-8.5 12.82 0 21.32 8.68 8.5 8.67 8.5 21.5 0 12.82-8.68 21.32-8.67 8.5-21.5 8.5-12.82 0-21.32-8.68Zm240 0q-8.5-8.67-8.5-21.5 0-12.82 8.68-21.32 8.67-8.5 21.5-8.5 12.82 0 21.32 8.68 8.5 8.67 8.5 21.5 0 12.82-8.68 21.32-8.67 8.5-21.5 8.5-12.82 0-21.32-8.68ZM241-462q-7-106 64-182t177-76q87 0 151 57.5T711-519q-89-1-162.5-50T434.72-698Q419-618 367.5-555.5T241-462Z" fill="#6142BD"/></svg>`;
const mRenew = `<svg viewBox="0 -960 960 960" class="u-g c-g" aria-hidden="true"><path d="M220-478q0 20 2.5 39t7.5 36q3 12-1.5 24T213-362q-11 5-22.5 0T175-378q-8-25-11.5-49.5T160-478q0-131 94.5-225.5T480-798h43l-61-61q-8-8-8-19t8-19q8-8 19.5-8t19.5 8l109 108q9 9 9 21t-9 21L502-639q-8 8-20 8t-20-8q-8-8-8-20t8-20l59-59h-41q-107 0-183.5 76.5T220-478Zm520-1q0-20-2.5-39t-7.5-37q-4-12 .5-24t15.5-17q11-5 22 0t15 16q9 25 13 50t4 51q0 131-94.5 225.5T480-159h-45l61 61q8 8 8 19t-8 19q-8 8-19.5 8T457-60L348-168q-9-9-9-21t9-21l109-109q8-8 19.5-8t19.5 8q8 8 8 19.5t-8 19.5l-61 61h45q107 0 183.5-76.5T740-479Z" fill="#6142BD"/></svg>`;
const mMedal = `<svg viewBox="0 -960 960 960" class="u-g c-g" aria-hidden="true"><path d="m480-161-73 54q-9 7-17.5.5T384-124l28-90-73-54q-9-7-5.5-17t14.5-10h90l25-97-140-82q-20-12-31.5-31T280-547v-273q0-25 17.5-42.5T340-880h280q25 0 42.5 17.5T680-820v273q0 23-11.5 42T637-474l-141 82 26 97h89q11 0 14.5 10t-5.5 17l-73 54 28 90q3 11-5.5 17t-17.5-1l-72-53Zm-26-659v350l30 16 30-16v-350h-60Z" fill="#6142BD"/></svg>`;
const mMood = `<svg viewBox="0 -960 960 960" class="u-g c-g" aria-hidden="true"><path d="M626-533q22.5 0 38.25-15.5T680-587q0-23-15.75-38.5T626-641q-22.5 0-38.25 15.5T572-587q0 23 15.75 38.5T626-533Zm-292 0q22.5 0 38.25-15.5T388-587q0-23-15.75-38.5T334-641q-22.5 0-38.25 15.5T280-587q0 23 15.75 38.5T334-533Zm-10 421.5Q251-143 197-197t-85.5-127Q80-397 80-480t31.5-156Q143-709 197-763t127-85.5Q397-880 480-880t156 31.5Q709-817 763-763t85.5 127Q880-563 880-480t-31.5 156Q817-251 763-197t-127 85.5Q563-80 480-80t-156-31.5ZM479.5-261q57.5 0 106-26t78.5-72.4q6-11.6-.75-22.6-6.75-11-20.25-11H316.92q-13.92 0-20.42 11-6.5 11-.5 22.6 30 46.4 78.5 72.4 48.5 26 105 26Z" fill="#6142BD"/></svg>`;
const gCal = `<svg viewBox="0 0 24 24" class="u-g"><rect x="4" y="5" width="16" height="15" rx="2.5"/><path d="M4 10h16M9 3v4M15 3v4"/></svg>`;
const gBell = `<svg viewBox="0 0 24 24" class="u-g"><path d="M6 16V11a6 6 0 0 1 12 0v5l1.5 2h-15z"/><path d="M10 20.5a2 2 0 0 0 4 0"/></svg>`;

/* what the month asks, one bar per day. Day 1 is setup and the tallest;
   the rest of week one is the patch, worn for that week only. After that,
   blood pressure and weight every day, and a questionnaire 3 times a week.
   Day 30 is the report. */
/* the questionnaire falls on the 2nd, 4th and 6th day of each week, so the
   first one comes the day after setup */
const isQ = (d) => [1, 3, 5].includes((d - 1) % 7);
const effort = () => {
  const bars = Array.from({ length: 30 }, (_, i) => {
    const d = i + 1, q = isQ(d);
    if (d === 30) return `<i class="is-goal">★</i>`;
    const h = d === 1 ? 100 : d <= 7 ? (q ? 52 : 40) : q ? 24 : 14;
    return `<i class="${d <= 7 ? 'is-wk' : ''}" style="height:${h}%"></i>`;
  }).join('');
  return `<div class="j-ef"><div class="j-ef__bars">${bars}</div>
    <div class="j-ef__k"><span class="is-wk">Week 1</span><span>Weeks 2 to 4</span><span>Day 30</span></div></div>`;
};

/* a commitment that opens its own sheet: icon, name and detail, then how
   often in a fixed right-aligned column, so every row lines up */
const cmRow = (key, g, name, detail, meta) => `<div class="j-cr" data-row="${key}" data-tap="sheet:2A.${key}">
  <i class="j-cr__g">${g}</i><div class="j-cr__t"><b>${name}</b><span>${detail}</span></div>
  <em>${meta}</em>${chev()}</div>`;

/* the month's four patches, one per week, the first `done` already worn */
const patchWeeks = (done = 0, now = 0) => `<div class="j-pw">${[1, 8, 15, 22].map((d, i) =>
  `<span class="${i < done ? 'is-on' : ''} ${i + 1 === now ? 'is-now' : ''}"><i>${i < done ? '✓' : gPatch}</i><b>Week ${i + 1}</b><em>Day ${d}</em></span>`).join('')}</div>`;

/* a check-in in the "when we'll check in" list; it opens as a notification */
const ping = (day, what, id) => `<div class="j-ping" data-tap="sheet:2A.n${id}"><b>${day}</b><span>${what}</span>${chev()}</div>`;

/* the moment a check-in opens to: one mark, one sentence, what's next */
const moment = (mark, title, line, extra = '') => sheet(`<div class="j-mo">${mark}
  <p class="u-lead u-lead--big">${title}</p><p class="u-note u-note--c">${line}</p>${extra}</div>
  <span class="u-btn u-btn--xl" data-tap="sheet:2A.ready">Back to check-ins</span>`);

/* --- 1A: a roadmap you can see --- */

/* repeat: two arrows round a loop, for the month that comes round again */
const gRepeat = `<svg viewBox="0 0 24 24" class="j-rep"><path d="M17 3l3 3-3 3"/><path d="M4 12v-2a4 4 0 0 1 4-4h12"/><path d="M7 21l-3-3 3-3"/><path d="M20 12v2a4 4 0 0 1-4 4H4"/></svg>`;

/* one step on the roadmap. state: done | now | next. Tapping a step opens
   it in place; `more` is what it says when open, `act` an optional button */
/* v04 (29.OCT.2026): a done step folds too, its tasks a tap away */
const roadStep = ({ name, when, time = '', more = '', act = '', tasks = [], note = '', cycle = false, focus = false }, state, open) => {
  const fold = tasks.length && ((state === 'next' && !focus) || state === 'done');
  return `<div class="j-st is-${state} ${cycle ? 'is-cycle' : ''} ${focus ? 'is-focus' : ''} ${open ? 'is-open' : ''}
    ${fold ? 'is-fold' : ''}" ${state !== 'now' && (more || fold) ? 'data-tap="toggle"' : ''}>
    <i class="j-st__d">${cycle ? gRepeat : state === 'done' ? '✓' : ''}</i>
    <div class="j-st__t"><b>${name}</b><span>${state === 'now' ? '<em>You are here</em> · ' : ''}${when}</span></div>
    <span class="j-st__m">${state === 'done' ? '' : time}${fold ? chev('down') : ''}</span>
    ${note ? `<p class="j-st__note">${note}</p>` : ''}
    ${tasks.length ? `<div class="j-st__tasks">${tasks.map(([g, what, days, t = '', tap = '']) =>
      `<span${tap ? ` class="is-tap" data-tap="${tap}"` : ''}>${g}<b>${what}</b><i>${t}</i>${Array.isArray(days) ? dayStrip(days) : `<em>${days}</em>`}${tap ? `<u class="j-st__go">${chev()}</u>` : ''}</span>`).join('')}</div>` : ''}
    ${more || act ? `<div class="j-st__more">${more ? `<p>${more}</p>` : ''}${act}</div>` : ''}</div>`;
};

/* the seven days of a week as numbered cells, the task's days filled.
   `days` is [from, to, [days the task falls on]] */
const dayStrip = ([from, to, on]) => `<em class="j-days">${Array.from({ length: to - from + 1 }, (_, i) =>
  `<b class="${on.includes(from + i) ? 'is-on' : ''}">${from + i}</b>`).join('')}</em>`;

/* week one: the patch (this week only), blood pressure and weight, and
   the questionnaire 3 times in the week */
const weekStep = (w) => {
  const from = w * 7 - 6;
  /* week one is the heavy week, so it keeps full colour even before it starts */
  return { name: `Week ${w}`, when: `Days ${from}–${w * 7}`, focus: w === 1, tasks: [
    [`<div class="j-gs">${gPatch}${cBand}</div>`, 'Patch + bracelet', 'Wear all week'],
    [cBp, 'BP + weight', 'Daily', '2 minutes'],
    [cQ, 'Questionnaire', '3× a week', '2 minutes'],
  ] };
};
/* weeks 2 to 4 are the same, so they are one step */
const restStep = { name: 'Weeks 2 to 4', when: 'Days 8–28', tasks: [
  [cBand, 'Bracelet', 'Always on'],
  [cBp, 'BP + weight', 'Daily', '2 minutes'],
  [cQ, 'Questionnaire', '3× a week', '2 minutes'],
] };

/* the month's steps, in short phrases: a name, when, and how long only
   where there is a real number */
const ROAD = [
  { name: 'Kit arrives', when: 'Done, Sep 19' },
  { name: 'Set up devices', when: 'Today', time: '20 minutes',
    act: `<span class="u-btn" data-tap="view:1B">Start setup</span>` },
  weekStep(1),
  restStep,
  { name: 'Your report', when: 'Day 30' },
  /* not the end: the month repeats. The patch comes back for its first
     week; there is no setup again */
  { name: 'Next month', when: 'From day 31', cycle: true,
    tasks: [[gPatch, 'Patch', 'Week 1 again'], [cBp, 'BP + weight', 'Daily', '2 minutes'], [cQ, 'Questionnaire', '3× a week', '2 minutes']] },
];

/* the roadmap's header: where you are */
const roadHead = (line) => `<div class="u-nav"><b>Your roadmap</b><span class="j-rh__a" data-tap="view:2A">The month</span></div>
  <p class="j-sub">${line}</p>`;

/* where setup sits in the list: the roadmap opens with it as "you are here" */
const SETUP = ROAD.findIndex(r => r.name === 'Set up devices');
const MONTH1 = ROAD.filter(r => !r.cycle).length;

/* the roadmap with `at` steps done; the step at `at` is where you are */
/* `tips`: steps to light up, by position, each with its note beside it */
const roadmap = (at, tips = {}) => `<div class="j-road2">${ROAD.map((s, k) => {
  const st = roadStep(s, k < at ? 'done' : k === at ? 'now' : 'next', k === at);
  return tips[k] ? spot(st, tips[k]) : st;
}).join('')}</div>`;

/* the patch week as seven dots, one per day, the days worn so far filled
   and today ringed */
const patchDots = (day) => `<div class="j-pdots" aria-label="Day ${day} of 7">${
  Array.from({ length: 7 }, (_, k) => `<i class="${k < day - 1 ? 'is-on' : k === day - 1 ? 'is-now' : ''}"></i>`).join('')}</div>`;

/* --- 1B: where the patch goes --- */
/* the upper body, front on, as if facing you: so the participant's left is
   on the right of the drawing. Collarbones, the centre of the chest, the
   patch angled just under the left collarbone, and the gap measured */
const bodyMap = () => `<svg class="j-bm" viewBox="0 0 220 196" role="img"
  aria-label="Front of the upper body. The patch starts two finger widths below the notch at the base of the neck and runs out to your left.">
  <path class="j-bm__skin" d="M110 8C126 8 137 21 137 38C140 37 142 40 141 44C140 49 139 54 135 56C133 61 130 64 128 66V82C142 88 160 94 170 99C180 104 184 115 184 128C185 146 188 160 190 175L194 200H26L30 175C32 160 35 146 36 128C36 115 40 104 50 99C60 94 78 88 92 82V66C90 64 87 61 85 56C81 54 80 49 79 44C78 40 80 37 83 38C83 21 94 8 110 8Z"/>
  <path class="j-bm__arm" d="M157 158C158 172 158 186 159 200M63 158C62 172 62 186 61 200"/>
  <path class="j-bm__bone" d="M61 104.5C75 102 92 103 104 108L106.5 110.5C106 113 103.5 114.5 101 113.5C90 109.5 75 107.5 62 108C59 108 58.5 105 61 104.5Z"/>
  <path class="j-bm__bone" transform="matrix(-1 0 0 1 220 0)" d="M61 104.5C75 102 92 103 104 108L106.5 110.5C106 113 103.5 114.5 101 113.5C90 109.5 75 107.5 62 108C59 108 58.5 105 61 104.5Z"/>
  <path d="M110 128.4v70" class="j-bm__mid"/>
  <!-- measured from the neck (suprasternal) notch: two finger widths straight
       down, then the patch runs out to the left, nearly level, sloping a
       little down, the sensor end outermost -->
  <path d="M110 115.4v12M106 115.4h8M106 127.4h8" class="j-bm__dim"/>
  <text x="103" y="124.4" class="j-bm__t j-bm__t--dim" text-anchor="end">2 fingers</text>
  <g transform="rotate(-29 133 141)">${cPatch.replace(' class="u-g c-g"', '').replace('<svg ', '<svg x="117" y="125" width="32" height="32" ')}</g>
  <path d="M70 105.5l-16 -14" class="j-bm__lead"/><text x="8" y="89" class="j-bm__t">Collarbone</text>
</svg>`;

/* the top of a setup step: which step, the bar, one line of encouragement */
const setupHead = (done, line) => `
    <p class="j-back" data-tap="view:ck-1-0">${chev()} Today</p>
    <div class="u-nav"><b>Patch on</b><span></span></div>
    <div class="j-seg j-seg--6">${[0, 1, 2, 3].map(k => `<i class="${k < done ? 'is-on' : k === done ? 'is-now' : ''}"></i>`).join('')}</div>
    <p class="j-cheer">${line}</p>`;

/* what to try when the patch light stays off, in order */
const fixList = () => `<ol class="j-fixes">
  <li><b>Press it again</b> firmly for 10 seconds, edges too.</li>
  <li><b>Check the skin</b> is clean and dry, with no lotion. If not, use a new patch.</li>
  <li><b>Bring your phone close</b>, within arm's reach, and keep the app open.</li>
</ol>`;

/* the one chevron used across the prototype: right for "opens", down for
   "unfolds here" (it turns up once open). Same size and stroke everywhere */
const chev = (dir = 'right') => `<svg class="j-chev ${dir === 'down' ? 'is-down' : ''}" viewBox="0 0 10 10" aria-hidden="true"><path d="M3.6 1.8 6.8 5 3.6 8.2"/></svg>`;

/* a setup step's buttons: Previous beside the way forward */
/* v03 (21.OCT.2026): no Back button (the top arrow goes back); under the
   step's own action, Finish later leaves setup for Today, where
   it waits where it stopped. The last step has nothing to save */
const LATER = '<span class="u-btn u-btn--xl u-btn--ghost j-later" data-tap="view:ck-1-resume">Finish later</span>';
/* v04 (30.OCT.2026): a setting you can change: a real time or list input.
   ptSet writes the new value into every screen that shows it, so it holds
   when the sheet is closed and opened again */
const setTime = (key, label, v) => `<div class="j-set"><span>${label}</span><input class="j-inp" type="time" data-set="${key}" value="${v}" aria-label="${label}"></div>`;
const setDays = (key, label, opts) => `<div class="j-set"><span>${label}</span><select class="j-inp" data-set="${key}" aria-label="${label}">${opts.map((o, k) => `<option${k ? '' : ' selected'}>${o}</option>`).join('')}</select></div>`;
window.ptSet = (key, val) => [UI2, UI2X].forEach((store) => Object.keys(store).forEach((k) => {
  if (typeof store[k] !== 'string' || !store[k].includes(`data-set="${key}"`)) return;
  store[k] = store[k]
    .replace(new RegExp(`(<input[^>]*data-set="${key}"[^>]*value=")[^"]*`, 'g'), `$1${val}`)
    .replace(new RegExp(`<select[^>]*data-set="${key}".*?</select>`, 'g'), (m) => m.replace(/ selected/g, '').replace(`<option>${val}<`, `<option selected>${val}<`));
}));
const stepNav = (prev, fwd, later = true) => later
  ? `<div class="u-thumb j-pair j-pair--even">${LATER}${fwd}</div>` : `<div class="u-thumb">${fwd}</div>`;
/* putting on the patch is four parts; this row shows which one you are on.
   Done parts are filled; tapping one recalls what it was */
const PATCH_PARTS = [
  ['Peel covers', 'Peel both plastic covers off the sticky side'],
  ['Switch on', 'Press the button until the light turns green'],
  ['Stick on', ''],
  ['Connect', 'Your phone connects to it by itself'],
];
const partDots = (names, now) => `<p class="j-parts" aria-label="Part ${now} of ${names.length}: ${names[now - 1]}"><span>${names.map((_, k) =>
  `<i class="${k + 1 < now ? 'is-done' : k + 1 === now ? 'is-now' : ''}"></i>`).join('')}</span></p>`;
const patchParts = (now) => partDots(PATCH_PARTS.map((p) => p[0]), now);
const BAND_PARTS = ['Put on', 'Connect'], CUFF_PARTS = ['Pair', 'Connect'], SCALE_PARTS = ['Wake', 'Connect'];

/* a setup step's main area: the title, then the picture as large as the
   screen allows, out of any box, then the one line of what to do */
const stepBody = (title, art, how, side = '', vid = 'Watch video') => `<p class="u-lead j-step__t">${title}</p>
    ${art ? `<div class="j-stepvis${vid && LIT ? ' j-spot j-spot--box' : ''}">${vid ? `<span class="j-vid j-vid--c" data-tap="toast:The video plays here">▶ ${vid}</span>` : ''}${side ? `<p class="j-you">${side}</p>` : ''}${art}${vid && LIT ? `<p class="j-spot__tip">A large visual takes up a major part of the screen and can loop as an animation, with a video of real people for every step and directions given as your left or right</p>` : ''}</div>` : ''}
    ${how ? `<p class="u-note j-step__how">${how}</p>` : ''}`;
/* in place of Next while the phone works by itself: a spinner and what it
   is doing; `auto` moves on when it is done (data-auto) */
const statusPill = (text, auto = '', tapTo = '') => `<span class="j-status" role="status" ${auto ? `data-auto="${auto}"` : ''}${tapTo ? ` data-tap="${tapTo}"` : ''}><i></i>${text}</span>`;
const fwdBtn = (to, label = 'Next') => `<span class="u-btn u-btn--xl" data-tap="view:${to}">${label}</span>`;

/* one room: a house outline round the patch, the bracelet and the phone,
   with the readings travelling from the devices to the phone */
const nest = (g, x, y, size) => g.replace(' class="u-g c-g"', '').replace('<svg ', `<svg x="${x}" y="${y}" width="${size}" height="${size}" `);
const oneRoom = () => `<svg class="j-room" viewBox="0 0 220 96" role="img" aria-label="The patch, the bracelet and your phone together in one room.">
  <path d="M30 40 110 8l80 32" class="j-room__roof"/>
  <rect x="36" y="38" width="148" height="52" rx="8" class="j-room__wall"/>
  <text x="110" y="31" class="j-room__t" text-anchor="middle">Same room</text>
  ${nest(gPatch, 50, 50, 26)}
  ${nest(cBand, 82, 50, 26)}
  ${nest(cPhone, 146, 47, 30)}
  <path d="M112 63h28" class="j-room__sig"/>
  <path d="M136 59l5 4-5 4" class="j-room__head"/>
</svg>`;

/* staying a year keeps the study phone (F4), drawn as the phone itself: a
   Galaxy-style handset (punch-hole camera, slim bezels, no logo) whose
   screen fills from the bottom as the days add up to 365. Faint lines mark
   each 90-day cycle; the fill rises in when the screen opens (21.OCT.2026) */
const yearPhone = (day, title, note) => {
  const pct = Math.max(2, Math.min(100, day / 365 * 100)), h = 106 * pct / 100, left = Math.max(0, 365 - day);
  return `<div class="j-yp">
    <svg class="j-yp__ph" viewBox="0 0 62 122" aria-hidden="true">
      <defs><clipPath id="yp-scr-${day}"><rect x="6" y="6" width="50" height="110" rx="8"/></clipPath></defs>
      <rect x="61" y="30" width="1.6" height="16" rx=".8" class="j-yp__key"/><rect x="61" y="52" width="1.6" height="9" rx=".8" class="j-yp__key"/>
      <rect x="1.5" y="1.5" width="59" height="119" rx="12" class="j-yp__body"/>
      <rect x="6" y="6" width="50" height="110" rx="8" class="j-yp__scr"/>
      <g clip-path="url(#yp-scr-${day})">
        <rect x="6" y="${(116 - h).toFixed(1)}" width="50" height="${h.toFixed(1)}" class="j-yp__fill"/>
        ${[90, 180, 270].map((d) => `<line x1="6" x2="56" y1="${(116 - 106 * d / 365).toFixed(1)}" y2="${(116 - 106 * d / 365).toFixed(1)}" class="j-yp__cy${d <= day ? ' is-past' : ''}"/>`).join('')}
      </g>
      <circle cx="31" cy="12" r="2.2" class="j-yp__cam"/>
    </svg>
    <div class="j-yp__t">
      ${/* v04 (29.OCT.2026): two lines, one treatment each: what it is, and
         where you are (plain, no bold); a cycle's own note replaces the second */ ''}
      <p class="j-yp__k">${title}</p>
      <p class="j-yp__m">${note ? note.replace(/<\/?b>/g, '') : `Day ${day} of 365 · ${left} days to go`}</p>
    </div>
  </div>`;
};

/* short facts, label and answer, instead of a paragraph */
/* the month-on-month changes, a section of month two's report on */
const changesSec = () => spot(`${sec('Changes since last month<span>vs month 1</span>')}
      <div class="u-dls j-dls--rcpt">
        ${delta('Heart rate', '68 bpm', 'down', '↓ 3')}
        ${delta('Sleep', '6h 48m', 'down', '↓ 22m')}
        ${delta('Steps per day', '5,420', 'up', '↑ 610')}
        ${delta('Days of data', '28 of 30', 'up', '↑ 4')}
      </div>`, 'Changes since last month, which each study can choose to hide');
const facts = (rows) => `<div class="j-facts">${rows.map(([k, v]) => `<span><b>${k}</b><em>${v}</em></span>`).join('')}</div>`;

/* report sections: a titled block, a line with your usual range shaded
   behind it, and four weekly bars */
const rpSec = (g, title, body) => `<div class="j-rpx"><p class="j-rpx__h">${g}${title}</p>${body}</div>`;
const rangeLine = (vals, lo, hi, label, from, to) => {
  const w = 200, h = 44, pts = vals.map((v, i) => `${(i / (vals.length - 1) * w).toFixed(1)},${(h - v / 100 * h).toFixed(1)}`).join(' ');
  return `<svg class="j-rpx__line" viewBox="0 0 ${w} ${h}" preserveAspectRatio="none" role="img" aria-label="${label}">
    <rect x="0" y="${h - hi / 100 * h}" width="${w}" height="${(hi - lo) / 100 * h}" class="j-rpx__band"/>
    <polyline points="${pts}"/></svg>
    <p class="j-rpx__k"><span>${from}</span><span>${to}</span></p>
    <p class="j-rpx__band-k"><i></i>${label}</p>`;
};
const weekBars = (vals) => `<div class="j-rpx__bars">${vals.map((v, k) =>
  `<span><i style="height:${v}%"></i><em>W${k + 1}</em></span>`).join('')}</div>`;

/* the scale, in the setup drawings' style: white body with a lavender
   edge, a small purple display, and two footprints where you stand.
   `value` fills the display; without it the display waits with dashes.
   (scaleArt in concepts-ui.js stays as v01 draws it) */
const FOOT = 'M13 50C7 50 4 46 4 40C4 34 6 31 5 26C3 20 2 15 4 10C6 5 10 4 14 4C20 4 23 8 23 14C23 20 20 24 19 30C18 35 21 38 21 42C21 47 18 50 13 50Z';
const TOES = '<ellipse cx="19.5" cy="-2.5" rx="3.6" ry="4.2"/><ellipse cx="13.5" cy="-4" rx="2.6" ry="3"/><ellipse cx="8.8" cy="-2.8" rx="2.3" ry="2.7"/><ellipse cx="5.2" cy="-0.2" rx="2" ry="2.3"/><ellipse cx="2.8" cy="3.6" rx="1.7" ry="2"/>';
const scaleArt2 = (value = '') => `<svg class="j-sa j-sc ${value ? '' : 'is-wait'}" viewBox="0 0 200 150" role="img" aria-label="The scale${value ? `, showing ${value} lbs` : ''}. Stand on the two footprints.">
  <rect x="34" y="10" width="132" height="128" rx="24" class="j-bm__skin"/>
  <rect x="40" y="16" width="120" height="116" rx="19" class="j-sc__plate"/>
  ${value
    /* a reading: a bigger screen, and the number large on it */
    /* the screen reaches over the plate's top edge, so no line shows above it */
    ? `<rect x="54" y="13" width="92" height="42" rx="9" class="j-sc__screen"/>
       <text x="100" y="42" class="j-sc__val j-sc__val--big" text-anchor="middle">${value}<tspan class="j-sc__unit" dx="3">lbs</tspan></text>`
    : '<rect x="74" y="25" width="52" height="20" rx="6" class="j-sc__screen"/><path d="M84 35h8M96 35h8M108 35h8" class="j-sc__dash"/>'}
  <g class="j-sc__foot" transform="translate(72 66)"><path d="${FOOT}"/>${TOES}</g>
  <g class="j-sc__foot" transform="translate(128 66) scale(-1 1)"><path d="${FOOT}"/>${TOES}</g>
  <rect x="52" y="137" width="20" height="4" rx="2" class="j-sc__leg"/><rect x="128" y="137" width="20" height="4" rx="2" class="j-sc__leg"/>
</svg>`;

/* putting the cuff on: the reference drawing itself, its background made
   transparent so the screen's light purple shows through */
const cuffOnArt = () => `<img class="j-bp j-bp--img" src="assets/cuff-on.png" alt="The cuff on your bare left arm, just above the elbow, with the tube running to the monitor.">`;

const UI2 = {

  /* ---- 1 · Setup, days 1 to 3 */
  /* 2A, a prototype: the month as effort (heavy week one, light after),
     each commitment opening a sheet, and check-ins at the points in the
     month where they help, previewed as notifications. No rewards here;
     that is another concept. */
  /* v03: no roadmap during onboarding (it opens from the ☰ menu, This month,
     once setup is done), so no Roadmap link here and check-ins go straight to setup */
  '2A': scr2(`
    <div class="u-nav"><b>Your first month</b></div>
    ${/* v04 (28.OCT.2026): the time as two numbers over the same bars, and
       the phone tip as one row under them, its (i) opening the sheet. On
       the page, no card; the list below reads as a receipt */ ''}
    ${spot(`<div class="j-efc j-efc--flat"><div class="j-efn"><span><b class="u-num">40 min</b><em>week 1</em></span>
      <span class="is-after"><b class="u-num">20 min</b><em>each week after</em></span></div>
      ${effort()}
</div>`,
      'The month as time, heavy in week one and light after; the phone tip, the one thing that keeps readings syncing, a tap away')}
    <p class="j-helps__k">What you’ll do</p>
    ${spot(`<div class="j-crs j-crs--rcpt">
      ${cmRow('patch', gPatch, 'Patch', 'First week/month', '1 week')}
      ${cmRow('band', cBand, 'Bracelet', 'Always worn', '30 days')}
      ${cmRow('bp', cBp, 'BP and weight', 'About 2 minutes', 'Daily')}
      ${cmRow('q', cQ, 'Questionnaire', 'About 2 minutes', '3× a week')}
    </div>`,
      'Every device and task with how long it takes and how often, before anything starts')}
    ${/* v04 (30.OCT.2026): the report isn't a task, it's what comes back */ ''}
    <p class="j-helps__k">What you’ll get</p>
    <div class="j-crs j-crs--rcpt">
      ${cmRow('report', cReport, 'Report', 'About 3 minutes to read', 'Day 30')}
    </div>
    ${/* v04 (29.OCT.2026): the phone tip at the foot, one plain line with its (i) */ ''}
    <div class="j-efn__tip" data-row="phone" data-tap="sheet:2A.phone"><i>${cPhone}</i><b>Phone by your bed each night, to sync</b>
      <span class="j-info" role="button" aria-label="Why keep your phone by your bed">${gInfo}</span></div>
    <div class="u-thumb j-pair"><span class="u-btn u-btn--xl u-btn--ghost" data-tap="view:ck-1-skip">Later</span>${spot(`<span class="u-btn u-btn--xl" data-tap="view:1B">I'm ready</span>`,
      'Everything fits on one screen now, so the button is ready from the start (v04)')}</div>`, false, 'is-spotlit'),

  /* 1A, a prototype: the roadmap, with where you are open and
     highlighted. Upcoming steps fold; tap one to unfold it. */
  '1A': scr2(`
    ${roadHead(`<b>Step ${SETUP + 1} of ${MONTH1}</b> · 20 minutes today`)}
    ${roadmap(SETUP, {
      [SETUP]: 'The first action comes up front with where you are, how long it takes and a button to start',
      [SETUP + 1]: 'A preview of the week ahead, task by task, with the coming week in full colour',
      [SETUP + 2]: 'The weeks after sit folded and lighter, there when you want them but not competing with this week' })}`, 0, 'is-spotlit'),


  /* 1B: one setup step. Where you are in setup and that you are halfway,
     where the patch goes, what to do if the light stays off, and how it
     comes off at the end of the week. Fixes and removal steps are general
     adhesive-patch advice: check them against VitalConnect's instructions. */
  '1B': scr2(`
    <div class="u-nav"><b>Step 3 of 6</b><span class="j-help" data-tap="sheet:1B.help">Help</span></div>
    <div class="j-seg j-seg--6"><i class="is-on"></i><i class="is-on"></i><i class="is-now"></i><i></i><i></i><i></i></div>
    <p class="j-cheer">About 16 minutes left.</p>
    ${stepBody('Put on your patch', bodyMap(), 'Stick it <b>two finger widths below the dip</b> at the base of your neck, running to your left, then press it flat for 10 seconds.', 'Your left →')
      .replace('</p>', `</p>${patchParts(3)}`)}

    ${stepNav('1B-s2c', statusPill('Finding patch', '', 'view:1B-s3c'))}`, false),
  '8A': scr2(`
    ${nav('Weight Scale')}
    ${card(`<p class="u-num">197.5<small>lbs</small></p>
      <p class="u-note">↓ 1.3 lbs from yesterday</p>`, 'u-card--edge')}
    ${srow('ok', 'Weight recorded 4 minutes ago')}
    ${srow('bad', 'Scale not synced')}
    ${fix(`${cWeight}<em class="u-arr">→ ←</em>${gPhone}`, 'Bring the scale and this phone closer together.')}
    ${fix(`${gBatt}<em class="u-arr">→</em>${cWeight}`, 'If that does not work, change the four AAA batteries.')}`, false),
  '7A': scr2(`
    ${nav('You are on track', 'Sep 21')}
    <p class="j-sub"><b>Day 2 of 30</b> · Sunday</p>
    <p class="u-note j-on__l">Everything from your first day is in.</p>
    ${spot(`<p class="j-helps__k">Received since setup</p>
    <div class="j-today">
      <span>${cBp}<em>BP cuff</em><b>119 / 77</b><i>Last night</i></span>
      <span>${cWeight}<em>Scale</em><b>197.5 lbs</b><i>Yesterday</i></span>
      <span>${cBand}<em>Bracelet</em><b>7h 05m</b><i>Sleep, last night</i></span>
      <span>${gPatch}<em>Patch</em><b>22 hours</b><i>No gaps</i></span>
    </div>`, 'Each reading that has arrived since setup, with when it came in, so you can see your data arriving')}
    ${card(`<p class="u-k">Coming up</p>
      ${rows([['Patch', '6 more days'], ['Questionnaire', 'Monday'], ['Your report', 'Day 30']])}`)}`, 0, 'is-spotlit'),

  /* ---- 2 · First week, days 2 to 7 */
  '4D': scr2(`
    ${nav('')}
    <div class="u-task">
      ${eyebrow('Next')}
      <span class="u-task__g">${cQ}</span>
      <p class="u-lead u-lead--big">Six questions about this week</p>
      <p class="u-note u-note--c">About 2 minutes</p>
    </div>
    <div class="u-thumb"><p class="u-note u-note--c j-thumb__note">Next: blood pressure, Friday</p>${btn('Start', 'u-btn--xl')}</div>`, false),
  '6A': scr2(`
    ${nav('This week', 'Sep 21–27')}
    ${spot(week(['ok', 'ok', 'none', 'ok', 'part', 'none', 'none']), 'Each day shows its status, done, partly in or missed, so the week reads at a glance')}
    ${card(`<p class="u-lead">2 questionnaires and 1 BP reading received</p>
      <p class="u-note">Missed days won't count against you.</p>`)}
    ${card(`<p class="u-k">Next</p>
      ${rows([['Questionnaire', 'Friday, 2 minutes'], ['Weight', 'Sunday']])}`)}`, 0, 'is-spotlit'),

  /* ---- 3 · Routine, weeks 2 to 6 */
  '5B': scr2(`
    ${shut()}
    ${stepper(['Blood pressure', 'Weight'], 0)}
    ${readout('Measuring', '', 'Stay still and quiet for about 40 seconds.', false)}
    <div class="u-stage">${cuffArt()}</div>
    <p class="u-note u-note--c">Next: weight</p>`, false),
  '5B-next': scr2(`
    ${shut()}
    ${stepper(['Blood pressure', 'Weight'], 1)}
    ${readout('Step on', '', 'Blood pressure is in. Take the cuff off, then step on the scale.', false)}
    <div class="u-stage">${scaleArt2()}</div>`, false),
  '10C': scr2(`
    ${shut()}
    ${readout('118/76', '', 'Blood pressure recorded.')}
    <div class="u-stage u-stage--sm">${cuffArt('118', '76', '64')}</div>
    ${card(`${eyebrow('Did you know')}
      <p class="u-lead">Blood pressure rises and falls through the day</p>
      <p class="u-note">It is at its lowest during sleep, which is why readings are taken at the same time each evening.</p><cite class="j-fact__src" data-tap="toast:Opens ahajournals.org in your browser" title="Laffin et al., Hypertension, 2018"><u><span class="j-fact__nm">Laffin et al., 2018</span></u></cite>`, 'u-card--edge')}
    <div class="u-thumb">${btn('Done', 'u-btn--xl')}</div>`, false),
  '10C-data': scr2(`
    ${shut()}
    ${readout('118/76', '', 'Blood pressure recorded.')}
    <div class="u-stage u-stage--sm">${cuffArt('118', '76', '64')}</div>
    ${card(`${eyebrow('Blood pressure')}
      <p class="u-lead">This month's trend</p>
      ${spark([48, 60, 52, 44, 58, 50, 46, 55, 49, 53])}
      <p class="u-note">Your readings have ranged 112 to 124 over 72 to 80.</p>`, 'u-card--edge')}
    <div class="u-thumb">${btn('Done', 'u-btn--xl')}</div>`, false),
  '16A': scr2(`
    ${nav('Your earnings')}
    ${card(`<p class="u-num u-num--c">$44</p>
      <p class="u-note u-note--c">earned so far</p>
      <div class="u-prog"><i style="width:24%"></i></div>
      <p class="u-note u-note--c">Next: $30 when you reach day 30</p>`, 'u-card--edge')}
    ${rows([['Patch week', '$40'], ['Badge bonuses', '$4'], ['Day 30', '$30'], ['Day 60', '$50'], ['Day 90', '$60']])}
    <p class="u-note u-note--c">$180 total across the study, plus bonuses</p>`, 3),

  /* ---- 4 · Check-ins and reports, day 30 to 90 */
  '12A': scr2(`
    ${nav('')}
    <div class="u-earn">
      <span class="u-earn__b">✓</span>
      <p class="u-lead u-lead--big">Questionnaire done</p>
      <p class="u-note u-note--c">12 days on track</p>
    </div>
    ${rows([['Collected this week', '6 symptom answers'], ['Compared with', 'Heart rhythm data']])}`, false),
  '11A': scr2(`
    ${nav('Your data', 'Sep')}
    ${card(`<p class="u-k">Resting heart rate</p>
      <p class="u-num">68<small>bpm</small></p>
      <p class="u-note">Measured 6:12 AM</p>
      ${spark([52, 58, 49, 62, 55, 60, 54, 58])}`, 'u-card--edge')}
    ${rows([['Heart rhythm', '7 days'], ['Steps', '5,420'], ['Sleep', '6h 48m'], ['Blood pressure', '118 / 76']])}
    <p class="u-note u-note--c">Tap any metric for its full history</p>`, 1),
  /* month two's report: rebuilt from the day-30 report below (one report) */
  '14A': scr2(`
    ${nav('Your report')}
    ${changesSec()}`, 1, 'is-spotlit'),
  '9D': scr2(`
    ${nav('Report in 12 days')}
    ${card(`${prog('Study cycle', 18, 30, ' days')}`, 'u-card--edge')}
    ${card(cycle({ today: 18, quiet: [4, 10, 15], goal: '★' }))}`),
  '19B': scr2(`
    ${nav('Study updates')}
    ${card(`${eyebrow('September update')}
      <p class="u-lead">Night readings are the most accurate</p>
      <p class="u-note">Night data is cleaner than daytime data, so patch week matters most.</p>
      <p class="u-note"><b>From</b> 1,240 participants, including you.</p>`, 'u-card--edge')}
    ${card(`${eyebrow('August update')}<p class="u-lead">Who is taking part</p>
      <p class="u-note">1,240 people across Massachusetts, aged 28 to 84, a little over half of them women.</p>`)}
    ${card(`${eyebrow('July update')}<p class="u-lead">What we set out to answer</p>
      <p class="u-note">Whether a patch, a bracelet and a few minutes of readings a day can spot heart rhythm changes early.</p>`)}`, 2),
  /* v04 (29.OCT.2026): the monthly report in the app, after the real 30-day
     PSR the study sends: the period (30 / 60 / 90 days), how well the
     protocol was followed, each measure with its chart, your average and
     the normal range, a summary table, the symptom questionnaire by week,
     and the research-use note. Sections as receipts, as in the example on
     Your first month */
  '15D': scr2(`
    ${nav('Your report', 'Day 30')}
    <p class="j-sub">Sep 20 – Oct 19 · first 30 days</p>
    <div class="j-rpp" role="tablist"><span class="is-on">30 days</span><span class="is-off" aria-disabled="true">60 days</span><span class="is-off" aria-disabled="true">90 days</span></div>
    ${sec('Following the plan')}
    <div class="j-rpad">
      <div class="j-rpad__r"><i>${gPatch}</i><span><b>Patch</b><em>All of week one, 168 hours</em></span><s>7 of 7 days</s></div>
      <div class="j-rpad__r"><i>${cBand}</i><span><b>Bracelet</b><em>One night missed, Oct 3</em></span><s>29 of 30 days</s></div>
      <div class="j-rpad__r"><i>${cBp}</i><span><b>Blood pressure</b><em>Morning and evening</em></span><s>58 of 60</s></div>
      <div class="j-rpad__r"><i>${cWeight}</i><span><b>Weight</b><em>Each morning</em></span><s>30 of 30</s></div>
      <div class="j-rpad__r"><i>${cQ}</i><span><b>Questionnaires</b><em>3 a week</em></span><s>13 of 13</s></div>
    </div>
    ${rpSec(cHeart, 'Sleeping heart rate', `
      <div class="j-rpx__n"><b>66</b><small>bpm</small><em>Your average, lowest overnight</em></div>
      ${rangeLine([62, 58, 60, 55, 57, 52, 54, 50, 51, 48, 50, 47], 30, 70, 'Normal at rest, 60 to 100', 'Sep 20', 'Oct 19')}
      <p class="j-rpx__tip">Being dehydrated can raise your sleeping heart rate.</p>`)}
    ${rpSec(cBp, 'Blood pressure', `
      <div class="j-rpx__n"><b>118 / 76</b><small>mmHg</small><em>Your average, 58 readings</em></div>
      ${rangeLine([50, 56, 48, 52, 46, 50, 44, 48, 45, 47, 43, 46], 20, 62, 'Normal, under 130 / 80', 'Sep 20', 'Oct 19')}
      ${facts([['Highest', '131 / 80, Sep 23'], ['Lowest', '112 / 72, Oct 12']])}`)}
    ${rpSec(cWeight, 'Weight', `
      <div class="j-rpx__n"><b>196.2</b><small>lbs</small><em>Your average</em></div>
      ${facts([['Change', '↓ 1.3 since day 1'], ['Range', '195.8 to 197.5']])}`)}
    ${rpSec(cBed, 'Sleep and activity', `
      <div class="j-rpx__two">
        <div><div class="j-rpx__n"><b>6h 48m</b><em>Sleep a night</em></div>${weekBars([62, 70, 66, 74])}</div>
        <div><div class="j-rpx__n"><b>5,420</b><em>Steps a day</em></div>${weekBars([48, 56, 61, 66])}</div>
      </div>`)}
    ${rpSec(cQ, 'How you felt', `
      <div class="j-rpq"><p><span>Week</span><i>1</i><i>2</i><i>3</i><i>4</i></p>
        <p><span>Feeling good, a few minor issues</span><i>✓</i><i>✓</i><i>✓</i><i>✓</i></p>
        <p><span>New or worse symptoms</span><i>–</i><i>–</i><i>–</i><i>–</i></p>
        <p><span>Medication changed</span><i>–</i><i>–</i><i>–</i><i>–</i></p></div>`)}
    ${sec('Summary<span>average · low to high</span>')}
    ${rows([['Sleeping heart rate', '66 · 61–72 bpm'], ['Blood pressure', '118/76 · 112–131'], ['Weight', '196.2 · 195.8–197.5'], ['Sleep', '6h 48m · 5h 20m–8h 05m'], ['Steps', '5,420 · 3,100–8,200']])}
    <p class="u-note j-trv__note">For research use only. Not a diagnosis or a replacement for your doctor’s advice.</p>`, 1),
};

/* ---------------------------------------------------------------- overlays
   Sheets and notifications, opened by a data-tap="sheet:<id>" hotspot. */
/* sleep and steps, for the bracelet's sheet */
/* one page of the report walkthrough: page dots, a heading, the page,
   and back / next (the last page closes) */
/* one page of the report walkthrough, inside the report sheet: Back and
   Next turn the page in place (page:n); the last page closes */
const reportPage = (n, title, body) => `<section class="j-rp__p" data-p="${n}">
    <p class="j-sh__k">${cReport}Report · ${n} of 3</p>
    <p class="u-lead u-lead--big">${title}</p>
    ${body}
    <div class="j-rp__nav">
      <span class="j-rp__dots">${[1, 2, 3].map(k => `<i class="${k === n ? 'is-on' : ''}"></i>`).join('')}</span>
      <span class="u-btn u-btn--ghost" data-tap="page:${n - 1}">Back</span>
      <span class="u-btn" data-tap="${n === 3 ? 'close' : 'page:' + (n + 1)}">${n === 3 ? 'Done' : 'Next'}</span>
    </div></section>`;

const UI2X = {
  /* 1A: the printed card in the kit carries the same roadmap */
  '1A.kit': sheet(`<p class="j-sh__k">${gCal}In your kit</p>
    <p class="u-lead u-lead--big">The same roadmap, on paper</p>
    <p class="u-note">The card in your kit and your welcome e-mail show these same steps.</p>
    <div class="j-card">
      <p class="j-card__h">Your first month</p>
      ${ROAD.filter(r => !r.cycle).map((r, k) => `<span><b>${k + 1}</b>${r.name}<em>${r.when.replace('Done, ', '')}</em></span>`).join('')}
    </div>`),
  /* 2A: one sheet per commitment, in the participant's terms */
  '2A.patch': sheet(`<p class="j-sh__k">${gPatch}Patch</p>
    ${facts([['When', 'Days 1 to 7 of each month'], ['Wear', 'Day and night, showers too'], ['Off', 'Day 8, until next month']])}
    <p class="j-calm">Most people stop feeling it after about 2 days.</p>
    <span class="u-btn u-btn--ghost" data-tap="toast:The 40-second video plays here">▶ Watch how it goes on</span>`),

  /* 4.8: look at another area of the study than your own */
  'region.cities': sheet(`<p class="j-sh__k">Your region</p>
    <div class="j-srch"><svg viewBox="0 0 16 16" aria-hidden="true"><circle cx="7" cy="7" r="4.5"/><path d="M10.5 10.5L14 14"/></svg><span>Search a city or town</span></div>
    <div class="j-cities">
      ${[['Boston area', '214 people', true], ['Worcester', '163 people'], ['Springfield', '128 people'], ['Lowell', '97 people'], ['Cape Cod', '74 people'], ['Pittsfield', '41 people']].map(([c, n, on]) =>
        `<span class="${on ? 'is-on' : ''}" data-tap="${on ? 'close' : `toast:Shows the ${c} area`}"><b>${c}${on ? ' <em>Yours</em>' : ''}</b><i>${n}</i></span>`).join('')}
    </div>`),

  '2A.band': sheet(`<p class="j-sh__k">${cBand}Bracelet</p>
    <p class="u-note">Wear it to bed too, since your sleep readings are part of the study.</p>
    <p class="j-crs__k">What it records</p>
    <div class="j-feeds"><span>${cHeart}Heart rate</span><span>${cBed}Sleep</span><span>${cSteps}Steps</span></div>
    <p class="u-note">It sends everything through your phone, so there’s nothing to tap or log.</p>`),

  '2A.bp': sheet(`<p class="j-sh__k">${cBp}Blood pressure and weight</p>
    <p class="u-note">The app takes you from the cuff to the scale and shows each reading as it comes in.</p>
    <div class="j-pick" data-tap="toast:You pick the time in setup"><span>Remind me at</span><b>7:30 PM ${chev()}</b></div>`),

  '2A.q': sheet(`<p class="j-sh__k">${cQ}Questionnaire</p>
    <p class="u-note">Short questions about how you have been. Here are two:</p>
    <div class="j-qs"><b>How did you sleep last night?</b>
      <span>Well</span><span class="is-on">Okay</span><span>Badly</span></div>
    <div class="j-qs"><b>Any chest discomfort today?</b>
      <span class="is-on">None</span><span>A little</span><span>A lot</span></div>
    <div class="j-pick" data-tap="toast:You pick the time in setup"><span>Remind me at</span><b>7:00 PM ${chev()}</b></div>`),

  /* the report, in one sheet: it opens on the report itself, then walks
     through it a page at a time without the sheet closing. Sample
     values; never a verdict */
  /* the report, as an example on day 1: what it will show on day 30, from
     your own readings. One page; numbers show direction, never a verdict */
  '2A.report': sheet(`<p class="j-sh__k">${cReport}Example day 30 report</p>
    <p class="u-lead u-lead--big">September, from your own readings</p>
    <p class="u-note">It has a section for each thing you measure.</p>
    ${rpSec(cHeart, 'Heart', `
      <div class="j-rpx__n"><b>68</b><small>bpm</small><em>Resting heart rate</em></div>
      ${rangeLine([62, 58, 60, 55, 57, 52, 54, 50, 51, 48, 50, 47], 30, 70, 'Your usual range, 64 to 72', 'Sep 1', 'Sep 30')}
      ${facts([['Change', '↓ 3 since week one'], ['Rhythm', '168 hours from your patch, week one']])}`)}
    ${rpSec(cBp, 'Blood pressure and weight', `
      ${facts([['BP', '118 / 76 on average, 28 readings'], ['Weight', '196.2 lbs, ↓ 1.3 since day 1']])}`)}
    ${rpSec(cBed, 'Sleep and activity', `
      <div class="j-rpx__two">
        <div><div class="j-rpx__n"><b>6h 48m</b><em>Sleep a night</em></div>${weekBars([62, 70, 66, 74])}</div>
        <div><div class="j-rpx__n"><b>5,420</b><em>Steps a day</em></div>${weekBars([48, 56, 61, 66])}</div>
      </div>
      ${facts([['Longest', '8h 05m, a Saturday'], ['Shortest', '5h 20m, a Tuesday']])}`)}
    ${rpSec(mMood, 'How you felt', `
      <div class="j-rp__bars">
        <span><em>Energy</em><i style="--w:70%"></i><b>Mostly okay</b></span>
        <span><em>Sleep quality</em><i style="--w:55%"></i><b>Mixed</b></span>
        <span><em>Symptoms</em><i style="--w:25%"></i><b>Few</b></span>
      </div>
      <p class="j-calm">From your 13 questionnaires this month.</p>`)}`),

  /* v04 (28.OCT.2026): no picture, the facts in the same rows as the patch sheet */
  '2A.phone': sheet(`<p class="j-sh__k">${cPhone}Your phone</p>
    <p class="u-lead u-lead--big">Keep it in the same room</p>
    ${facts([['Why', 'Your devices send readings through it'], ['Away', 'Readings wait until you’re back'], ['Every night', 'On the nightstand, so the bracelet syncs your sleep']])}`),

  /* when we check in: the points in the month where a nudge helps. Each
     row previews as the notification, which opens the moment itself */
  '2A.ready': sheet(`<p class="j-sh__k">${gBell}Check-ins</p>
    ${spot(`<div class="j-pings j-pings--rcpt">
      ${ping('Day 1', 'Your first readings arrive', 1)}
      ${ping('Day 2', 'Phone on the nightstand', 2)}
      ${ping('Day 3', 'The patch gets easier', 3)}
      ${ping('Day 8', 'The patch comes off', 8)}
      ${ping('Day 30', 'Your report is ready', 30)}
    </div>`, 'Reminders only at the moments that matter, mostly in week one, and each one can be previewed')}
    <div class="j-pair j-pair--sh">
      <span class="u-btn u-btn--xl u-btn--ghost" data-tap="view:1B">Later</span>
      <span class="u-btn u-btn--xl" data-tap="sheet:2A.allow" data-fresh>Turn on check-ins</span>
    </div>
    <p class="u-note u-note--c">You can turn them on any time in Settings.</p>`),

  /* Turn on check-ins asks the phone first, as the real app must: the
     system's notification prompt, then what was decided, then on to setup */
  /* Android's own prompt (One UI): a card at the foot of the screen, a
     bell, the question, then Allow over Don't allow */
  '2A.allow': `<div class="j-ov j-ov--sys"><span class="j-ov__bg"></span>
    <div class="j-sys" role="alertdialog" aria-label="Allow notifications">
      <svg class="j-sys__i" viewBox="0 0 24 24" aria-hidden="true"><path d="M6 16.5V11a6 6 0 0 1 12 0v5.5l1.5 1.5h-15zM10 20.5a2 2 0 0 0 4 0"/></svg>
      <p class="j-sys__t">Allow <b>Prolaio</b> to send you notifications?</p>
      <div class="j-sys__a"><span data-tap="sheet:2A.on">Allow</span><span data-tap="sheet:2A.off">Don’t allow</span></div>
    </div></div>`,
  '2A.on': sheet(`<div class="j-mo"><span class="j-ok"></span>
      <p class="u-lead u-lead--big">Check-ins are on</p>
      <p class="u-note u-note--c">The first comes tonight at about 8 PM, when your first readings arrive. You’ll get five in your first month, most of them this week.</p></div>
    <span class="u-btn u-btn--xl" data-tap="view:1B">Continue setup</span>`),
  '2A.off': sheet(`<div class="j-mo"><span class="j-mo__g">${gBell}</span>
      <p class="u-lead u-lead--big">Check-ins are off</p>
      <p class="u-note u-note--c">You won’t get reminders. You can turn them on any time in Settings.</p></div>
    <span class="u-btn u-btn--xl" data-tap="view:1B">Continue setup</span>`),

  /* skipping today's questionnaire: what it means, before it happens */
  'q-skip': sheet(`<p class="u-lead u-lead--big">Skip today’s questionnaire?</p>
    <p class="u-note">It won’t count toward your 10-questionnaire bonus, and the study won’t have your answers for today. Your streak and other tasks aren’t affected.</p>
    <p class="u-note">You can still take it until 11:59 PM tonight.</p>
    <div class="j-pair j-pair--sh">
      <span class="u-btn u-btn--xl u-btn--ghost" data-tap="skipq:skip">Skip for today</span>
      <span class="u-btn u-btn--xl" data-tap="skipq:take">Take it now</span>
    </div>`),

  '2A.n1': notif('8:12 PM', 'Day 1', 'Your first readings are in', 'Your patch and bracelet are working.', '2A.m1'),
  '2A.n2': notif('10:05 PM', 'Day 2', 'Phone on the nightstand?', 'That way tonight’s sleep comes through.', '2A.m2'),
  '2A.n3': notif('9:00 AM', 'Day 3', 'Noticing the patch less?', 'Most people stop feeling it around now.', '2A.m3'),
  '2A.n8': notif('8:00 AM', 'Day 8', 'The patch comes off today', 'Week one is done. From now on it’s about 2 minutes a day.', '2A.m8'),
  '2A.n30': notif('9:00 AM', 'Day 30', 'Your report is ready', 'Built from your first month of readings.', '2A.m30'),

  '2A.m1': moment(`<span class="j-ok"></span>`, 'Your devices are working',
    'Your first readings arrived at 8:12 PM, and there’s nothing else to do tonight.'),
  '2A.m2': moment(`<span class="j-mo__g">${gPhone}</span>`, 'Phone on the nightstand',
    'Your bracelet sends sleep readings through your phone while you sleep.'),
  '2A.m3': moment(`<span class="j-mo__g">${gPatch}</span>`, 'The patch gets easier',
    'Most people stop feeling it after about 2 days, and it can stay on in the shower.'),
  '2A.m8': moment(`<span class="j-mo__g">${gPatch}</span>`, 'Week one is done',
    'Take the patch off today and put the next one on at the start of next month.'),
  '2A.m30': moment(`<span class="j-ok"></span>`, 'Your first month is done',
    'Your report is ready, built from your own readings.'),
};
/* ==========================================================================
   v02 prototypes, one per journey card (07.OCT.2026).

   Built from the Week 4 review deck: its next step is "pick 1 or 2 concepts
   per player type and prototype them from the shared base". Each card's flow
   in journey.js runs the shared base first, then a layer per player type,
   tagged on the flow entry. The guardrails come from the deck's
   recommendations: fast beats friendly, work not a game (no XP, levels or
   celebratory language), comparison only when turned on, a named person when
   something goes wrong, and a reading never gets a verdict.

   Names on screen are placeholders: Sam is the participant, Dana the study
   coordinator, Dr. Patel their own doctor.
   ========================================================================== */

/* the named study coordinator, with one way to reach her */
const coord = (line, action) => `<div class="j-co"><span class="j-co__av">D</span>
  <div><b>Dana, your study coordinator</b><em>${line}</em></div>
  ${action ? `<span class="j-co__a">${action}</span>` : ''}</div>`;

/* a device that has been confirmed, with when its first data arrived */
/* `data`: a "View data" link to what the device has sent (sheet ck.<data>) */
const okDev = (g, name, note, state = 'ok', data = '') => `<span class="j-dv is-${state}">
  <i>${g}</i><div><b>${name}</b><em>${note}</em>${data ? `<span class="j-ck__data" data-tap="sheet:ck.${data}">View data ${chev()}</span>` : ''}</div><s>${state === 'ok' ? '✓' : ''}</s></span>`;

Object.assign(UI2, {

  /* ---- 1 · Setup, days 1 to 3 ------------------------------------------ */

  /* base: set up by doing, each step confirmed before the next */
  'v2-1-patch': scr2(`
    ${nav('Step 2 of 4', 'Help')}
    ${player('Placing the patch, 40 seconds')}
    <p class="u-lead">Press it below your left collarbone for 10 seconds.</p>
    ${card(`<div class="u-dev"><span class="u-dot is-ok"></span>
      <div><b>Patch connected</b><span>First heart data arrived 9:12 AM</span></div></div>`)}
    <div class="u-thumb">${btn('Next: BP cuff', 'u-btn--xl')}</div>`, false),

  /* reassurance-seeker: when a device will not pair, the fix and a person */
  'v2-1-pair': scr2(`
    ${nav('Step 1 of 4', 'Help')}
    ${srow('bad', 'Bracelet not found yet')}
    ${fix(`${cBand}<em class="u-arr">→ ←</em>${gPhone}`, 'Hold the bracelet next to this phone.')}
    ${fix(`${cBand}`, 'Press its button until the light blinks blue.')}
    ${coord('Available now. Most calls take about 5 minutes.', 'Call')}
    <p class="u-note u-note--c">Nothing is lost while you wait.</p>`, false),

  /* base + earner: every device confirmed, and the pay it unlocked */
  'v2-1-done': scr2(`
    ${nav('Setup complete')}
    <div class="j-dvs">
      ${okDev(cBand, 'Bracelet', 'Data arriving since 9:04 AM')}
      ${okDev(gPatch, 'Heart patch', 'Data arriving since 9:12 AM')}
      ${okDev(cBp, 'BP cuff', 'Test reading received')}
      ${okDev(cWeight, 'Scale', 'Test reading received')}
    </div>
    ${card(`<p class="u-k">Earned</p>
      <p class="u-num">$0<small>so far</small></p>
      <p class="u-note">Next: $40 at the end of your first week.</p>`, 'u-card--edge')}`),

  /* achiever + explorer: your own numbers, from day one */
  'v2-1-first': scr2(`
    ${nav('Your data', 'Day 1')}
    <p class="u-lead">Your first readings</p>
    <div class="j-vts">
      ${vital('Resting heart rate', '68', 'bpm')}
      ${vital('Blood pressure', '118/76', '')}
      ${vital('Weight', '197.5', 'lbs')}
      ${vital('Sleep', 'Tonight', '')}
    </div>
    ${card(`<p class="u-k">Your starting point</p>
      <p class="u-note">These become your baseline. From week two you'll see how each one moves.</p>`)}`, 1),

  /* ---- 2 · First week, days 4 to 10 ------------------------------------ */

  /* base: the home is a receipt. Every source says when its data arrived */
  'v2-2-home': scr2(`
    ${nav('Today', 'Day 6')}
    ${verdict('ok', 'All your data arrived', 'Last checked 8:15 AM')}
    <div class="u-srs">
      ${statRow('ok', 'Bracelet', 'Synced 7:58 AM')}
      ${statRow('ok', 'Heart patch', 'Synced 7:58 AM')}
      ${statRow('ok', 'Questionnaire', 'Sent 8:10 AM')}
      ${statRow('wait', 'Blood pressure', 'Due tonight, 40 seconds')}
    </div>
    <p class="u-note u-note--c">Nothing to fix today.</p>`),

  /* base: the reading, and the moment the study has it */
  'v2-2-recv': scr2(`
    ${shut()}
    <div class="u-stage u-stage--top">${cuffArt('118', '76', '64')}</div>
    <p class="u-done">Blood pressure recorded</p>
    <div class="j-rcs">
      ${receipt('8:02 PM', 'Received by the study', 'Your 6th reading this week')}
      ${receipt('Tomorrow', 'Next reading', 'Any time after 6 PM')}
    </div>
    <div class="u-thumb">${btn('Done', 'u-btn--xl')}</div>`, false),

  /* reassurance-seeker: a sync gap is never shown as a missed task, and the
     study reaches out before the participant notices */
  'v2-2-gap': scr2(`
    ${nav('Today', 'Day 7')}
    ${alertBand('Bracelet has not synced since 2:14 AM', 'Fix')}
    <p class="u-note">This is not a missed task. Your bracelet keeps its data until it syncs.</p>
    ${coord('Messaged you at 8:30 AM')}
    <div class="j-msgs">
      ${msg('Hi Sam, your bracelet stopped syncing overnight. Leaving your phone next to it for a minute usually fixes it. I’ll check again at noon.')}
      ${msg('Thanks, trying now', true)}
    </div>`),

  /* achiever + earner: the first week, complete, what it paid, what's next */
  'v2-2-week': scr2(`
    ${nav('Your first week', 'Sep 21–27')}
    ${card(`<p class="u-lead">7 of 7 days received</p>
      ${week(['ok', 'ok', 'ok', 'ok', 'ok', 'ok', 'ok'])}`, 'u-card--edge')}
    ${card(`<p class="u-k">Earned</p>
      <p class="u-num">$40<small>for week one</small></p>`)}
    ${card(`<p class="u-k">Tomorrow</p>
      <p class="u-note">The patch comes off until next month. The bracelet carries on.</p>`)}`),

  /* ---- 3 · Routine, weeks 2 to 6 -------------------------------- */

  /* base: the home changes by week, so week three doesn't look like week one */
  'v2-3-home': scr2(`
    ${nav('Week 3', 'Tue')}
    ${card(`${eyebrow('New this week')}
      <p class="u-lead">Your sleep is now in your data</p>
      <p class="u-note">The bracelet has two weeks of nights, enough to show a pattern.</p>
      <span class="j-link">See your sleep →</span>`, 'u-card--edge')}
    ${sec('Today')}
    ${task(cBp, 'Blood pressure, then weight', 'About 2 minutes, together', 'now')}
    ${task(cQ, 'Questionnaire', 'Thursday')}`),

  /* achiever: their own number moving, against where they started */
  'v2-3-trend': scr2(`
    ${shut()}
    ${readout('196.1', 'lbs', 'Weight recorded.')}
    ${card(`${eyebrow('Since you started')}
      <p class="u-lead">↓ 1.4 lbs over 3 weeks</p>
      ${baseline([62, 58, 60, 54, 52, 55, 50, 47, 49, 44], '197.5', '195.0', 'Sep 21', 'Today')}`, 'u-card--edge')}
    <div class="u-thumb"><p class="u-note u-note--c j-thumb__note">The study doesn’t rate your readings as good or bad.</p>${btn('Done', 'u-btn--xl')}</div>`, false),

  /* explorer: something to learn each week, about the devices and the data,
     with no clinical claims */
  'v2-3-learn': scr2(`
    ${nav('Learn')}
    ${card(`${eyebrow('Week 3 · 2-minute read')}
      <p class="u-lead">Why a patch and a bracelet both measure your heart</p>
      <p class="u-note">The patch records every heartbeat. The bracelet adds your sleep and activity. The study looks at both to see how your heart rhythm changes with sleep and activity.</p>`, 'u-card--edge')}
    ${sec('Earlier')}
    ${rows([['What the cuff listens for', 'Week 2'], ['Where your data goes', 'Week 1']])}
    <p class="u-note u-note--c">Next week: what sleep data can and can't tell you</p>`, 2),

  /* competitor: comparison is off until they turn it on, and only ever
     against the average, and only for effort, never for health */
  'v2-3-compare': scr2(`
    ${nav('Compare', 'Settings')}
    ${pair('Compare with the study average', 'This compares effort only, not health numbers. No one else can see yours.', true)}
    ${card(`${eyebrow('This month so far')}
      ${cmp('Days of complete data', 84, 64, '21 days', 'Average 17')}
      ${cmp('Questionnaires sent', 90, 72, '10', 'Average 8')}`, 'u-card--edge')}
    <p class="u-note u-note--c">1,240 people are taking part.</p>`, 3),

  /* socializer: questions from other participants, answered by the team.
     Moderated and cheap, as the deck recommends */
  'v2-3-ask': scr2(`
    ${nav('Questions', 'Ask')}
    ${card(`<p class="u-lead">Does the patch itch after day 4?</p>
      <p class="u-note"><b>38 people</b> asked this. <b>Study team:</b> some itching is common. Press the edges down; if the skin turns red, message Dana.</p>`, 'u-card--edge')}
    ${card(`<p class="u-lead">Can I take the bracelet off to swim?</p>
      <p class="u-note"><b>21 people</b> asked this. <b>Study team:</b> yes, for up to an hour.</p>`)}
    ${card(`${eyebrow('Thursday, 7 PM')}<p class="u-note">Live Q&amp;A with the study team. Questions are read out without names.</p>`)}`, 2),

  /* ---- 4 · Wrap-up, day 30 to 90 ---------------------------------- */

  /* base: the check-in, alone or with a person */
  'v2-4-ready': scr2(`
    ${nav('Day 30 check-in')}
    ${card(`<p class="u-lead u-lead--big">Your first month is done</p>
      <p class="u-note">The check-in is 10 minutes: a longer questionnaire and one blood pressure reading. Your report follows the next day.</p>`, 'u-card--edge')}
    ${coord('Free Thu 7 PM or Sat 10 AM, by video')}
    <div class="u-btns">${btn('Start the check-in')}${btn('Do it on a call with Dana', 'u-btn--ghost')}</div>`, false),

  /* explorer: the report in pieces, each against their own baseline and the
     study's expected range, with how it is measured, and a clinician to ask */
  'v2-4-piece': scr2(`
    ${nav('September report', '1 of 5')}
    ${card(`<p class="u-k">Resting heart rate</p>
      <p class="u-num">68<small>bpm</small></p>
      ${pinScale(36, 42, '68', 'Your start, 71', '50 bpm', '100 bpm')}
      <p class="u-note">Your September average, next to where you started. Measured each morning before you get up.</p>`, 'u-card--edge')}
    <p class="u-note">Questions about a number? <span class="j-link">Ask the study clinician →</span></p>
    <div class="u-dots"><i class="is-on"></i><i></i><i></i><i></i><i></i></div>`, 1),

  /* reassurance-seeker: they choose what their own doctor sees */
  'v2-4-share': scr2(`
    ${nav('Share with your doctor')}
    <p class="u-note">Pick what Dr. Patel sees. You can change this before every report.</p>
    ${pair('Heart rate and rhythm', '30 days', true)}
    ${pair('Blood pressure', '28 readings', true)}
    ${pair('Weight', '26 readings', false)}
    ${pair('Questionnaire answers', 'Symptoms and mood', false)}
    <div class="u-thumb">${btn('Send to Dr. Patel', 'u-btn--xl')}</div>`, false),

  /* base + earner: the end of the cycle. Paid in full, and what happens next */
  'v2-4-end': scr2(`
    ${nav('Day 90')}
    ${card(`<p class="u-k">Paid in full</p>
      <p class="u-num">$206</p>
      <p class="u-note">Sent to your bank on Dec 2.</p>`, 'u-card--edge')}
    ${card(`<p class="u-k">What happens next</p>
      ${rows([['Your final report', 'Tomorrow'], ['What the study found', 'Spring 2027'], ['Return the bracelet', 'Prepaid box']])}`)}
    <div class="u-btns">${btn('Take part for another 90 days')}${btn('Finish here', 'u-btn--ghost')}</div>`, false),
});

/* ==========================================================================
   The daily checklist, one per chapter, plus what you've done and your
   vitals (weekly routine). 07.OCT.2026.

   The checklist is the home screen's spine and changes with the phase:
   setup steps on day 1, the full daily round in week one, a shorter list
   once the routine settles, and the check-in at day 30. A finished item
   shows a completed state and a "View data" link, which opens
   what the study received from it. Counts, never percentages; a reading
   never gets a verdict.
   ========================================================================== */

/* one checklist item. state: done | now | later. One mark on the left:
   the device icon, swapped for a check once it's done. `data` names the
   sheet (UI2X 'ck.<data>') that shows what was collected */
/* where an unfinished item leads when tapped: the task itself, or the
   device's sheet. Every tappable item carries a chevron */
const ckGo = (name) =>
  /questionnaire/i.test(name) ? 'view:4D'
  : /weigh/i.test(name) ? 'view:5B'
  : /blood pressure|^BP/i.test(name) ? 'view:10B-ready'
  : /scale/i.test(name) ? 'view:8A'
  : /^patch on/i.test(name) ? 'view:1B-s3'
  : /^patch/i.test(name) ? 'sheet:2A.patch'
  : /bracelet/i.test(name) ? 'sheet:2A.band'
  : /report/i.test(name) ? 'sheet:2A.report' : '';

/* a checklist row: an open circle on the left that fills with a check when
   done, the task, and the device's icon on the right (with Start on the
   task that is up now) */
/* v04 (28.OCT.2026): a task that's later is a receipt line, its value the
   short form: the first part, minutes as "min" ("Tonight, 40 seconds" →
   "Tonight", "About 2 minutes" → "2 min") */
const laterValue = (meta) => meta.split(',')[0].replace(/^About (\d+) minutes?$/, '$1 min').replace(/^(\d+) seconds$/, '$1 sec');
const ckItem = (g, name, meta, state, data = '', to = '') => {
  /* to as null: the row shows but doesn't open its task */
  /* v04 (28.OCT.2026): a later task is pending, so it opens nothing (no
     chevron); once it's ready to act on, it's a task card with its button */
  const go = state === 'done' || state === 'later' || to === null ? '' : (to || ckGo(name));
  /* v04 (28.OCT.2026): a done task opens nothing; what it collected shows
     as a line of Today's readings. data-ck names the sheet the line reads */
  const tap = go;
  return `<div class="j-ck is-${state} ${tap ? 'is-tap' : ''}" ${tap ? `data-tap="${tap}"` : ''}${state === 'done' && data ? ` data-ck="ck.${data}"` : ''}>
  <span class="j-ck__c" aria-label="${state === 'done' ? 'Done' : 'Not done'}">${state === 'done' ? '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M4 8.4l2.6 2.6L12 5.4"/></svg>' : ''}</span>
  <div class="j-ck__t"><b>${name}</b><em>${state === 'later' ? laterValue(meta) : meta}</em>
</div>
  <span class="j-ck__end">${state === 'now' ? '<span class="j-ck__go">Start</span>' : `<span class="j-ck__i">${g}</span>`}</span></div>`;
};

/* the checklist's header: the day, and how many are done, as a count */
const ckBar = (done, total, bar = true) => `<div class="j-ckh"><b>${done} of ${total} done</b>${bar ? `<span class="j-ckh__bar">${
    Array.from({ length: total }, (_, k) => `<i class="${k < done ? 'is-on' : ''}"></i>`).join('')}</span>` : ''}</div>`;
const ckHead = (title, day, done, total, line, bar = true) => `${nav(title, day)}
  ${ckBar(done, total, bar)}
  ${line ? `<p class="u-note">${line}</p>` : ''}`;

/* what came in from one source: when, how much, and that the study has it */
const collected = (g, name, when, rows, foot) => sheet(`<p class="j-sh__k">${g}${name}</p>
  <p class="u-lead u-lead--big">Collected ${when}</p>
  <div class="j-cd">${rows.map(([k, v]) => `<span><em>${k}</em><b>${v}</b></span>`).join('')}</div>
  <p class="j-cd__ok">Received by the study</p>
  ${foot ? (foot.startsWith('<') ? foot : `<p class="u-note">${foot}</p>`) : ''}`);

/* when the patch comes off: off until next month, a new one comes then;
   how to take it off and throw it away is one tap deeper */
const patchOff = (when) => `<p class="u-note">${when} it comes off until next month, when you get a new patch.</p>
  <div class="j-fix" data-tap="toggle">
    <p class="j-fix__q">How to take it off and throw it away${chev('down')}</p>
    <div class="j-fix__a"><ol class="j-fixes">
      <li><b>Lift one end</b> with your fingernail.</li>
      <li><b>Peel slowly, low and close to your skin</b>, folding it back on itself.</li>
      <li>Put it in <b>the trash, not the recycling</b>.</li>
    </ol></div>
  </div>`;

/* a running total of what you've given the study */
const tally2 = (g, n, what) => `<span class="j-tl"><i>${g}</i><b>${n}</b><em>${what}</em></span>`;

/* a dashboard tile: the latest value, a short line of the last weeks, and
   the change since you started. Direction only, never a verdict */
const trendOf = (label) => (/sleep/i.test(label) ? 'sleep' : /heart rate|hr\b/i.test(label) ? 'hr' : /blood/i.test(label) ? 'bp'
  : /weight/i.test(label) ? 'weight' : /steps/i.test(label) ? 'steps' : '');
/* v04 (28.OCT.2026), the tile as a chart: the name (the whole tile opens
   the trend, so no chevron), the value, the line over a dashed day-1
   baseline with today as a dot, so the change under it reads against
   where it started */
/* v04 (29.OCT.2026): each tile draws what its number means, not the same
   line six times:
   - resting heart rate: where it sits on a 40 to 100 scale, the normal
     range (60 to 100) shaded
   - blood pressure: the systolic on the normal / elevated / high bands
   - sleep and steps: the last seven days as bars against the goal
     (7 hours, 7,000 steps)
   - heart rhythm: one square per day of the month, filled when recorded
   - weight (and anything else): the line since day 1 over a dashed baseline */
const pctOf = (v, lo, hi) => Math.max(0, Math.min(100, (v - lo) / (hi - lo) * 100)).toFixed(1);
const dbRange = (v, lo, hi, a, z, ticks) => `<span class="j-dbv j-dbv--range"><span class="j-dbv__trk"><s style="left:${pctOf(a, lo, hi)}%;right:${(100 - pctOf(z, lo, hi)).toFixed(1)}%"></s><i style="left:${pctOf(v, lo, hi)}%"></i></span>
  <span class="j-dbv__tk">${ticks.map((t) => `<em style="left:${pctOf(t, lo, hi)}%">${t}</em>`).join('')}</span></span>`;
const dbBands = (v, lo, hi, bands) => `<span class="j-dbv j-dbv--bands"><span class="j-dbv__seg">${bands.map(([n, a, z]) => `<s style="flex:${z - a}"${v >= a && v < z ? ' class="is-in"' : ''}></s>`).join('')}<i style="left:${pctOf(v, lo, hi)}%"></i></span>
  <span class="j-dbv__bl">${bands.map(([n, a, z]) => `<em style="flex:${z - a}">${n}</em>`).join('')}</span></span>`;
const dbBars = (vals, lo, hi, goal) => `<span class="j-dbv j-dbv--bars"><span class="j-dbv__bars">${vals.map((v, k) => `<i style="height:${pctOf(v, lo, hi)}%"${v >= goal ? ' class="is-goal"' : ''}${k === vals.length - 1 ? ' data-now' : ''}></i>`).join('')}<s style="bottom:${pctOf(goal, lo, hi)}%"></s></span></span>`;
const dbDays = (n, total) => `<span class="j-dbv j-dbv--days">${Array.from({ length: total }, (_, k) => `<i class="${k < n ? 'is-on' : ''}"></i>`).join('')}</span>`;
const dbLine = (vals) => `<span class="j-db__plot">${spark(vals)}<s class="j-db__base" style="bottom:${vals[0]}%"></s><s class="j-db__dot" style="bottom:${vals[vals.length - 1]}%"></s></span>`;
const dbViz = (label, value, unit, vals) => {
  const n = parseFloat(String(value).replace(/,/g, ''));
  if (/heart rate|resting hr/i.test(label)) return dbRange(n, 40, 100, 60, 100, [40, 60, 100]);
  if (/blood/i.test(label)) return dbBands(n, 90, 160, [['Normal', 90, 120], ['Elevated', 120, 130], ['High', 130, 160]]);
  if (/sleep/i.test(label)) return dbBars(vals.map((v) => 5.5 + v / 100 * 3), 5, 9, 7);
  if (/steps/i.test(label)) return dbBars(vals.map((v) => 3000 + v * 70), 0, 9000, 7000);
  if (/rhythm/i.test(label) && unit === 'days') return dbDays(n, 30);
  if (/rhythm/i.test(label)) return dbDays(7, 7);
  return dbLine(vals);
};
const dash = (label, value, unit, vals, since) => `<span class="j-db" data-tap="${trendOf(label) ? `view:tr-${trendOf(label)}` : `toast:Opens the full history of ${label.toLowerCase()}`}">
  <em>${label}</em>
  <b>${value}<small>${unit}</small></b>
  ${dbViz(label, value, unit, vals)}
  <i>${since}</i></span>`;

/* the weekly-routine home's header: the day of the 30-day cycle sits in
   the top right corner. Far from the end it counts up; within ten days
   of it, it counts down */
const cycleNav = (title, day, of) => {
  const left = of - day;
  return `<div class="u-nav"><b>${title}</b><span class="j-day">${
    left <= 10 ? `${left} day${left === 1 ? '' : 's'} left` : `Day ${day} of ${of}`}</span></div>`;
};
/* below the day's checklist (the checklist always comes first): your
   health from the devices */
/* "since day 1" sits once in the heading, so each card's change fits one
   line (21.OCT.2026: "vs. day 1" wrapped, leaving the 1 on its own line) */
/* v04 (30.OCT.2026): Collected this week stays on Today from day 2 on,
   above the trends */
const homeBelow = (day, of) => `${weekOneBelow()}${sec('Your health since day 1')}
  ${spot(`<div class="j-dbs">
    ${dash('Avg sleep', '6h 48m', '', [40, 55, 48, 60, 52, 58, 62], '↑ 20 min')}
    ${dash('Resting HR', '68', 'bpm', [60, 55, 58, 52, 50, 48, 50], '↓ 3 bpm')}
  </div>`, 'Trends since day 1, which each study can turn off')}`;

/* day 30: the report is the biggest thing on the home screen. Locked, it
   shows a blurred preview and what unlocks it, the final reading; once
   that is in, it opens */
const lockG = `<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="5" y="10.5" width="14" height="10" rx="2.5"/><path d="M8.5 10.5V8a3.5 3.5 0 0 1 7 0v2.5" fill="none"/></svg>`;
const report30 = (open, month = 1) => `<div class="j-r30 ${open ? 'is-open' : 'is-locked'}" data-tap="${open ? 'view:14A' : 'view:rd30'}">
  <div class="j-r30__t">
    <p class="j-r30__k">${open ? 'Unlocked' : 'Locked'}</p>
    <b>${open ? `Your month ${month} report is ready` : `Your month ${month} report`}</b>
    <p>${open ? `Built from ${month * 30} days of your own readings.` : 'Unlocks with your final reading.'}</p>
    <span class="j-r30__btn">${open ? 'Open report' : 'Take final reading'}</span>
  </div>
  <div class="j-r30__doc" aria-hidden="true">
    <div class="j-r30__pg"><i></i><i></i>
      <svg viewBox="0 0 60 26" preserveAspectRatio="none"><path d="M0 20 8 16 16 18 24 10 32 13 40 7 48 9 60 4"/></svg>
      <span><em style="height:40%"></em><em style="height:70%"></em><em style="height:55%"></em><em style="height:85%"></em><em style="height:65%"></em></span></div>
    <span class="j-r30__lock">${open ? '✓' : lockG}</span>
  </div>
</div>`;

/* ==========================================================================
   v03, one app (19.OCT.2026): every moment's home is the same screen,
   home3(). Top to bottom: Today and how far into the 90 days; one card,
   the most important thing right now (alert > report > unlock > streak >
   trivia > next report); the strip of what you've built up (streak, days
   of data, earnings), once each has opened; the day's checklist, what's up
   now first; then the data below (this week's in week one, your health
   after). Features live here and in Resources, never on screens of their own.
   ========================================================================== */
const STUDY_DAYS = 90;
/* v03 (22.OCT.2026): past day 90 the study renews in 90-day cycles, to two
   years: eight cycles, day 720. Cycle 2 is the first renewal, cycle 3 the
   second, and so on; a year is day 360, the end of cycle 4 */
const MAX_DAY = 720, CYCLES = MAX_DAY / STUDY_DAYS;
const cycleOf = (d) => Math.ceil(d / STUDY_DAYS);
const dayIn = (d) => d - (cycleOf(d) - 1) * STUDY_DAYS;
const ORD = ['', 'first', 'second', 'third', 'fourth', 'fifth', 'sixth', 'seventh'];
window.MAX_DAY = MAX_DAY;
/* a week as the app says it (23.OCT.2026): inside its 3-month cycle,
   weeks 1 to 13, never a running count ("Week 58") */
const weekOf = (d) => `Cycle ${cycleOf(d)} · Week ${Math.ceil(dayIn(d) / 7)}`;
const dayLine = (d) => {
  if (d <= STUDY_DAYS) return d >= STUDY_DAYS ? 'Last day' : STUDY_DAYS - d <= 10 ? `${STUDY_DAYS - d} days left` : `Day ${d} of ${STUDY_DAYS}`;
  const c = cycleOf(d), n = dayIn(d);
  return d >= MAX_DAY ? 'Last day of the study' : n === STUDY_DAYS ? `Last day of cycle ${c}`
    : STUDY_DAYS - n <= 10 ? `${STUDY_DAYS - n} days left in cycle ${c}` : `Cycle ${c} · Day ${n} of ${STUDY_DAYS}`;
};
/* what you've earned by a day, the one money scheme every screen uses:
   payments $40 for patch week (after week one), then $30, $50 and $60 at
   the day 30, 60 and 90 check-ins ($180 in all); milestone bonuses $2 for
   the first week, a three-week streak (day 21) and 10 questionnaires, $5 for the first
   month and for two months, $10 for all 90 days (up to $26) */
const cyclePaid = (n) => n >= 90 ? 180 : n >= 60 ? 120 : n >= 30 ? 70 : n >= 8 ? 40 : 0;
const earnedBy = (d) => d > 90 ? 206 + (cycleOf(d) - 2) * 180 + cyclePaid(dayIn(d)) : d >= 90 ? 206 : d >= 60 ? 136 : d >= 31 ? 81 : d >= 21 ? 44 : d >= 8 ? 42 : 0;
/* three counts, told apart (23.OCT.2026): the day in the study counts every
   day; the streak, days in a row your readings came in, starts again after
   a day with none (day 20 in this story); days of data, every day the study
   has data from you, keeps adding, less that day */
const MISSED = 20;
const streakBy = (d) => (d > MISSED ? d - MISSED : d);
const daysOfData = (d) => Math.max(0, d - 1 - (d > MISSED ? 1 : 0));
/* v04 (28.OCT.2026): Today keeps only the streak, as a chip by the day;
   days of data and earnings live in Resources (What you’ve done, Earnings) */
/* the next monthly report, as a bar (all that stays of 4.6) */
const nextReport = (d) => {
  const into = ((d - 1) % 30) + 1;
  return card(`${prog('Next monthly report', into, 30, ' days')}
    <p class="u-note">Ready in ${30 - into} days, from your own readings.</p>`, 'u-card--edge j-nr');
};
/* week one's data below the list: what came in, so you see it arriving */
/* v04 (28.OCT.2026): as a receipt report, what was measured and its value;
   a line still opens its trend */
const weekOneBelow = () => `<div class="j-rcpt"><p class="j-cks__k j-rcpt__k">Collected this week</p>
    <div class="j-rcpt__l">
      <div class="j-rcpt__r" data-tap="view:tr-sleep"><span>Sleep, last night</span><b>6h 52m</b></div>
      <div class="j-rcpt__r" data-tap="view:tr-hr"><span>Resting heart rate</span><b>66<small>bpm</small></b></div>
      <div class="j-rcpt__r" data-tap="view:tr-bp"><span>Blood pressure, last night</span><b>119/77<small>mmHg</small></b></div>
      <div class="j-rcpt__r" data-tap="view:tr-weight"><span>Weight, last night</span><b>197.0<small>lb</small></b></div>
    </div></div>`;
/* v03 (22.OCT.2026): what opens when, the one table the home screen,
   Resources and the features list share. Trivia from day 3, the community
   at the end of week one, the rest once it has something to show */
const UNLOCKS = [[3, 'Daily trivia'], [3, 'Your streak'], [1, 'Community'], [7, 'What you’ve done'], [8, 'Earnings'], [8, 'Your first week'], [90, 'Impact']];
/* the name a feature shows under (30.OCT.2026): What you’ve done is Data sent */
const shownName = (n) => (n === 'What you’ve done' ? 'Data sent' : n);
const ON_TODAY = ['Your streak', 'What you’ve done', 'Earnings', 'Community'];
const unlockedOn = (d) => UNLOCKS.filter((u) => u[0] === d).map((u) => u[1]);
window.unlockedOn = unlockedOn;
const listOf = (n) => n.length < 3 ? n.join(' and ') : `${n.slice(0, -1).join(', ')} and ${n[n.length - 1]}`;
/* on the day something opens, one line that says so and opens Resources;
   in the week before, the same line counts down to it */
const unlockLine = (d) => {
  /* the trivia card itself is on the same screen from day 3, so its
     unlock needs no line of its own */
  const now = unlockedOn(d).filter((n) => n !== 'Daily trivia');
  /* one feature that already shows on Today (the streak, days of data,
     earnings, the community) is seen there; no line for it (22.OCT.2026) */
  const seen = now.length === 1 && ON_TODAY.includes(now[0]);
  /* a tap opens Resources at what just opened, its rows blinking (newin, journey-v03.js) */
  if (now.length && !seen) return `<div class="j-new" data-tap="newin:${d}">
    <span class="j-new__i" aria-hidden="true">✦</span><b>${now.length > 2 ? `${now.length} features` : listOf(now.map(shownName))} unlocked</b>
    <span class="j-new__go" aria-label="See what’s new">${chev()}</span></div>`;
  /* What changed opens with the report, which has its own countdown */
  const next = UNLOCKS.find((u) => u[0] > d && u[1] !== 'What changed');
  if (!next || next[0] - d > 7) return '';
  const left = next[0] - d;
  /* more than one: a count, not a list of names (22.OCT.2026) */
  const soon = unlockedOn(next[0]), NUM = ['', 'One', 'Two', 'Three', 'Four'];
  return `<div class="j-new j-new--soon" data-tap="view:res-hub">
    <span class="j-new__i" aria-hidden="true">${lockG}</span><b>${soon.length > 1 ? `${NUM[soon.length] || soon.length} new features` : shownName(soon[0])} open${soon.length > 1 ? '' : 's'} ${left === 1 ? 'tomorrow' : `in ${left} days`}</b></div>`;
};
/* the daily trivia, from day 3: one question a day on the home screen; a
   tap answers it and shows how everyone did.
   v04 (30.OCT.2026): worded about hearts in general, not "your heart", and
   each one ends with its source: [question, answers, right, why, source] */
const TRIVIA = [
  ['How many times does the average heart beat in a day?', ['About 10,000', 'About 100,000', 'About 1 million'], 1, 'About 100,000, at a resting rate of around 70 beats a minute.', 'Cleveland Clinic'],
  ['How much blood does the heart pump in a minute at rest?', ['About a cup', 'About 5 liters', 'About 50 liters'], 1, 'About 5 liters, roughly all the blood in an adult body.', 'OpenStax, Anatomy and Physiology'],
  ['What counts as normal blood pressure for adults?', ['Under 120 / 80', 'Under 140 / 90', 'Under 160 / 100'], 0, 'Under 120 over 80, by American Heart Association guidelines.', 'American Heart Association'],
  ['How much sleep do most adults need a night?', ['5 hours or more', '7 hours or more', '10 hours or more'], 1, '7 hours or more, for adults aged 18 to 60.', 'CDC'],
  ['When is resting heart rate best measured?', ['Just after waking', 'After a coffee', 'After a walk'], 0, 'Just after waking, before getting up, when the body is most at rest.', 'American Heart Association'],
  ['What is the most sodium a day the American Heart Association advises?', ['1,000 mg', '2,300 mg', '5,000 mg'], 1, '2,300 mg, about a teaspoon of salt, and ideally 1,500 mg for most adults.', 'American Heart Association'],
  ['How much moderate activity a week is advised for adults?', ['50 minutes', '150 minutes', '500 minutes'], 1, '150 minutes, such as a brisk 30-minute walk five days a week.', 'American Heart Association'],
];
/* day 18's is the heart beats question, as drawn for that moment */
const triviaOf = (d) => TRIVIA[(d + 3) % TRIVIA.length];
/* v04 (29.OCT.2026): past trivia under today's, a receipt: the day, the
   question, and the answer with a tick when you had it right (a made-up
   record, missing every fifth); the heading keeps the score */
const triviaPast = (day, n = 6) => {
  const ds = Array.from({ length: Math.min(n, day - 3) }, (_, k) => day - 1 - k);
  const ok = (d) => d % 5 !== 2;
  return ds.length ? `${sec(`Past trivia<span>${ds.filter(ok).length} of ${ds.length} right</span>`)}
    <div class="j-tvh">${ds.map((d) => { const [q, as, right, , src] = triviaOf(d);
      /* folded: the question, right or missed, the day; a tap opens your
         answer and the right one */
      const mine = ok(d) ? as[right] : as[(right + 1) % as.length];
      return `<div class="j-tvh__r${ok(d) ? '' : ' is-miss'}" data-tap="toggle" role="button" aria-expanded="false">
        <b>${q}</b><s class="j-tvh__m">${ok(d) ? '✓' : '✗'}</s><em>Day ${d}</em>
        <span class="j-tvh__a"><i>Your answer</i>${mine}</span>${ok(d) ? '' : `<span class="j-tvh__a is-right"><i>Right answer</i>${as[right]}</span>`}<span class="j-tvh__a"><i>Source</i>${src}</span></div>`; }).join('')}</div>` : '';
};
/* the card reads as a quick game, not a task: a ? badge on a lavender
   wash, and the answers stacked one per row (A, B, C), so a longer answer
   wraps on its own row instead of squeezing into a third of the card.
   v03 (22.OCT.2026): it is answered right there. A tap on an answer turns
   the card over in place (tv:<day>.<answer>, journey-v03.js): how everyone
   answered, yours marked, and why, with no page to open */
const triviaBody = (q, as, d) => `<p class="j-tvc__k"><i aria-hidden="true">?</i>Today’s trivia</p>
    <p class="u-lead">${q}</p><ol class="j-tvl">${as.map((a, k) => `<li${d ? ` data-tap="tv:${d}.${k}"` : ''}><b>${'ABC'[k]}</b><span>${a}</span></li>`).join('')}</ol>`;
const triviaCard = (d) => {
  const [q, as] = triviaOf(d);
  return `<div class="u-card u-card--edge j-tvc">${triviaBody(q, as, d)}</div>`;
};
/* the card once answered: the share who picked each answer, the right one
   ticked and yours marked, then the answer in a line */
window.triviaResult = (d, pick) => {
  const [q, as, right, why, src] = triviaOf(d);
  const votes = as.map((_, k) => k === right ? 612 : 150 + (k * 97 + d * 31) % 200), all = votes.reduce((a, b) => a + b, 0);
  return `<p class="j-tvc__k"><i aria-hidden="true">${pick === right ? '✓' : '?'}</i>${pick === right ? 'You got it' : 'Not quite'}<span>${all.toLocaleString('en-US')} answered</span></p>
    <p class="u-lead">${q}</p>
    <ol class="j-tvr">${as.map((a, k) => `<li class="${k === right ? 'is-right' : ''} ${k === pick ? 'is-you' : ''}">
      <i style="--w:${Math.round(votes[k] / all * 100)}%"></i><b>${a}${k === right ? ' ✓' : ''}${k === pick ? ' <em>You</em>' : ''}</b><s>${Math.round(votes[k] / all * 100)}%</s></li>`).join('')}</ol>
    <p class="u-note">${why}</p>${src ? factCite(src) : ''}`;
};
/* from day 7: the community, one row under your health */
/* v04 (28.OCT.2026): the newest question itself, as a quote; the heading
   carries the count and the way in */
const communityBelow = () => `<p class="u-sec j-cmh">Community<span data-tap="view:v2-3-community">3 new ${chev()}</span></p>
  <div class="j-cmq" data-tap="view:v2-3-community"><p>“Anyone else itchy under the patch?”</p><em>Quiet Heron · 12 replies</em></div>`;
/* the next monthly report's bar only shows in the month's last week */
const reportSoon = (d) => { const into = ((d - 1) % 30) + 1; return into >= 24 && into < 30; };

/* the routine's tasks, the same every day of weeks 2 to 12 */
const routineTasks = (bpTo) => [
  ckItem(cBp, 'Blood pressure and weight', 'About 2 minutes', 'now', '', bpTo),
  ckItem(cQ, 'Questionnaire', 'Wednesday', 'later'),
  ckItem(cBand, 'Bracelet', 'Synced overnight', 'done', 'band3'),
];
const ckRank = (h) => /j-ck is-now/.test(h) ? 0 : /j-ck is-done/.test(h) ? 2 : 1;
/* v03 (22.OCT.2026): the day's list comes first. The report, its bar and
   the trivia sit under the checklist, before your health; what opened and
   any cycle or setup card stay on top. top is split into its blocks */
const blocksOf = (html) => {
  const out = [], re = /<\/?div\b[^>]*>/g;
  let depth = 0, start = 0, m;
  while ((m = re.exec(html))) {
    if (m[0][1] !== '/') { if (!depth) start = m.index; depth++; }
    else if (--depth === 0) out.push(html.slice(start, re.lastIndex));
  }
  return out;
};
const AFTER_LIST = /class="[^"]*\b(j-r30|j-tvc|j-nr)\b/;
const home3 = ({ day, tasks = [], top = '', note = '', below = '', skip = '', bar = true, label = '', spotlit = false }) => {
  if (tasks.length && AFTER_LIST.test(top)) {
    const parts = blocksOf(top), later = parts.filter((p) => AFTER_LIST.test(p));
    top = parts.filter((p) => !AFTER_LIST.test(p)).join('');
    below = later.join('') + below;
  }
  const done = tasks.filter((h) => /j-ck is-done/.test(h)).length;
  const sorted = tasks.slice().sort((a, b) => ckRank(a) - ckRank(b));
  /* v03 (23.OCT.2026): what's done folds into one row under what's left, so
     the rest of the page is a short scroll away; a tap opens it. A done task
     that carries a highlight keeps the fold open, so the highlight shows */
  const left = sorted.filter((h) => !/j-ck is-done/.test(h)), fin = sorted.filter((h) => /j-ck is-done/.test(h));
  const lit = fin.some((h) => /j-spot/.test(h));
  /* v04 (28.OCT.2026): the upcoming-features line joins the pending list as
     its last row (a lock, what, when, a chevron to Resources) */
  let soonRow = '';
  if (tasks.length) top = top.replace(/<div class="j-new j-new--soon"[\s\S]*?<\/div>/, (m) => { soonRow = m.replace('class="j-new j-new--soon"', 'class="j-new j-new--soon j-new--row"'); return ''; });
  /* v04 (28.OCT.2026): "... unlocked" keeps its banner, under the task to
     do now and above Later today */
  let newRow = '';
  if (tasks.length) top = top.replace(/<div class="j-new" data-tap="newin:[\s\S]*?<\/div>/, (m) => { newRow = m.replace('class="j-new"', 'class="j-new j-new--after"'); return ''; });
  /* the first later task starts the receipt list (its dashed rule) */
  let firstLater = true;
  /* with its heading (v04, 28.OCT.2026), named by the furthest of them: Later today, Later
     this week (tomorrow, a weekday, or features opening within the week),
     Later this month */
  const away = (h) => { const w = (/<em>([^<,]*)/.exec(h) || [])[1] || '';
    return /^Day (\d+)/.test(w) ? +w.slice(4) - day : /^(Tomorrow|Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday)/.test(w) ? 1 : 0; };
  const far = Math.max(soonRow ? 1 : 0, ...left.filter((h) => /class="j-ck is-later/.test(h)).map(away));
  const laterHead = far === 0 ? 'Later today' : far <= 7 ? 'Later this week' : 'Later this month';
  /* "... unlocked" goes between the task to do now and the later ones */
  const leftHtml = left.map((h) => (firstLater && /class="j-ck is-later/.test(h) ? (firstLater = false, `${newRow}<p class="j-cks__k">${laterHead}</p>` + h.replace('class="j-ck is-later', 'class="j-ck is-later is-later1')) : h)).join('')
    + (soonRow ? (firstLater ? `${newRow}<p class="j-cks__k">${laterHead}</p>` + soonRow.replace('j-new--row', 'j-new--row is-later1') : soonRow) : '')
    + (firstLater && !soonRow ? newRow : '');
  /* v04 (28.OCT.2026): what's done is a receipt report, Today's readings,
     filled in at the end of this file from each task's data sheet (built
     later); here it leaves which sheets, and the names */
  const doneKeys = fin.map((h) => `${(/data-ck="(ck\.[\w-]+)"/.exec(h) || [])[1] || ''}|${(/<b>([^<]+)<\/b>/.exec(h) || [])[1] || ''}`).join(';');
  /* v04 (28.OCT.2026): with everything done, the count moves into the
     report's heading ("Today's readings · 4 of 4") */
  const allDone = tasks.length && !left.length;
  const list = leftHtml + (fin.length ? `</div><div class="j-rcpt" data-rcpt="${doneKeys}" data-of="${allDone ? fin.length : ''}">` : '');
  /* v04 (28.OCT.2026): the study day is the title ("Day 6 of 90"), not
     "Today"; the streak is a chip at the title row's right;
     the strip keeps only days of data and earnings */
  const chip = day >= 3 && skip !== 'streak' ? `<span class="j-skchip" data-tap="view:res.v2-3-streak-full" aria-label="${streakBy(day)}-day streak">${mFlame}${streakBy(day)}</span>` : '';
  return scr2(`
    ${nav(dayLine(day).replace(/^Cycle \d+ · | (in|of) cycle \d+$/g, '').replace(/ (of \d+)$/, ' <small class="j-of">$1</small>'))}
    ${note || day > STUDY_DAYS ? `<p class="j-sub">${[day > STUDY_DAYS && `Cycle ${cycleOf(day)}`, note].filter(Boolean).join(' · ')}</p>` : ''}
    ${top}
    ${label ? `<p class="j-helps__k">${label}</p>` : tasks.length && !allDone ? ckBar(done, tasks.length, bar) : ''}
    ${tasks.length ? `<div class="j-cks">${list}</div>` : ''}
    ${below}`, 0, spotlit || /class="j-spot"/.test(top + below + list) ? 'is-spotlit' : '')
    .replace(/(<div class="u-nav"><b>.*?<\/b>)<span><\/span>/, (m, t) => chip ? `${t}<span class="j-navr">${chip}</span>` : m);
};

/* 1.1, the welcome splash: the first thing the app shows, before it asks
   anything. Kept simple: Prolaio in the centre, the study's name one line
   below in a lighter type, and one way on */
/* v03 (21.OCT.2026): no lock screen. The study phone runs Prolaio as its
   only app on a locked device, so this is the app already open, never a
   swipe-to-unlock splash: the brand, the study's name (set when the phone
   is personalized) and Get started. 22.OCT.2026: a Prolaio app, no logo */
UI2['welcome'] = scr2(`<div class="j-wel">
    <div class="j-wel__c">
      <p class="j-wel__brand u-lead--big">Prolaio Heart Study</p>
    </div>
    <span class="u-btn u-btn--xl j-wel__go" data-tap="view:ac-confirm">Get started</span>
  </div>`, false, 'j-wel-scr');

Object.assign(UI2, {

  /* ---- the checklist, through the four phases ------------------------- */

  /* every home moment is home3(), so the app reads as one (v03) */
  'ck-1-0': home3({ day: 1, note: 'Set up one device at a time.', tasks: [
      ckItem(gPatch, 'Patch on', 'About 5 minutes', 'now'),
      ckItem(cBand, 'Bracelet on', 'About 2 minutes', 'later'),
      ckItem(cWeight, 'Connect the scale', 'About 3 minutes', 'later'),
      ckItem(cBp, 'First blood pressure', '40 seconds', 'later')] }),
  /* Day 6, patch week's morning */
  'ck-2-0': home3({ day: 6, top: unlockLine(6) + triviaCard(6), below: weekOneBelow() + communityBelow(), tasks: [
      ckItem(cQ, 'Questionnaire', 'About 2 minutes', 'now'),
      ckItem(cBp, 'Blood pressure', 'Tonight, 40 seconds', 'later'),
      ckItem(cBand, 'Bracelet', 'Synced 7:02 AM', 'done', 'band6'),
      ckItem(gPatch, 'Patch', 'Worn today, 1 day left', 'done', 'patch6')] }),
  /* Day 15: what opened since week one leads */
  'ck-3-0': home3({ day: 15, top: unlockLine(15) + triviaCard(15), below: homeBelow(15, 30) + communityBelow(), tasks: routineTasks() }),
  /* Day 30: the report leads, locked until the final reading */
  'ck-4-0': home3({ day: 30, top: report30(false) + triviaCard(30), below: homeBelow(30, 30) + communityBelow(), tasks: [
      ckItem(cBp, 'Final blood pressure', '40 seconds, unlocks your report', 'now', '', 'view:rd30'),
      ckItem(cQ, 'Check-in questionnaire', 'About 10 minutes', 'later', '', 'view:12A'),
      ckItem(cBand, 'Bracelet', 'Syncs on its own', 'later')] }),

  /* Day 1, setup done: the setup steps are the list */
  'ck-1': home3({ day: 1, spotlit: true, below: communityBelow(), tasks: [
      spot(ckItem(cQ, 'First questionnaire', 'About 2 minutes', 'now'), 'What is still to do sits at the top, the next one first'),
      ckItem(cBp, 'Second blood pressure', 'Tonight, 40 seconds', 'later'),
      spot(ckItem(gPatch, 'Patch', 'Connected 10:16 AM', 'done', 'patch1'), 'Completed items move to the bottom, each with the data it sent'),
      ckItem(cBand, 'Bracelet', 'Connected 10:12 AM', 'done', 'band1'),
      ckItem(cBp, 'Blood pressure', '121 / 78, 10:21 AM', 'done', 'cuff1'),
      ckItem(cWeight, 'Weight', '197.5 lbs, 10:24 AM', 'done', 'scale1')] }),
  /* back from the scale: it is ticked, with the weight it sent */
  'ck-1-scale': home3({ day: 7, note: 'Only tonight’s blood pressure is left.', below: weekOneBelow() + communityBelow(), tasks: [
      ckItem(cBp, 'Blood pressure', '40 seconds', 'later'),
      ckItem(gPatch, 'Patch', 'Last day, it comes off tomorrow', 'done', 'patch7'),
      ckItem(cBand, 'Bracelet', 'Synced 8:02 AM', 'done', 'band7'),
      ckItem(cWeight, 'Weight', 'Recorded 8:10 AM', 'done', 'scale7')] }),
  /* Day 6, evening: the day's list complete */
  'ck-2': home3({ day: 6, spotlit: true, bar: false, below: weekOneBelow() + communityBelow(), tasks: [
      spot(ckItem(cQ, 'Questionnaire', 'Completed', 'done', 'q'), 'Each finished task is checked off as completed, and its arrow opens the results and what was collected, live'),
      ckItem(cBp, 'Blood pressure', 'Completed', 'done', 'bp'),
      ckItem(cBand, 'Bracelet', 'Synced', 'done', 'band'),
      ckItem(gPatch, 'Patch', 'Worn today, 1 day left', 'done', 'patch')] }),
  /* Day 15, the routine */
  'ck-3': home3({ day: 15, top: unlockLine(15) + triviaCard(15), below: homeBelow(15, 30) + communityBelow(), tasks: routineTasks() }),
  /* Day 30, later: the final reading is in, so the report opens */
  'ck-4': home3({ day: 30, top: report30(true) + triviaCard(30), below: homeBelow(30, 30) + communityBelow(), tasks: [
      ckItem(cQ, 'Check-in questionnaire', 'About 10 minutes', 'now', '', 'view:12A'),
      ckItem(cBp, 'Final blood pressure', '118 / 76, report unlocked', 'done', 'bp4'),
      ckItem(cBand, 'Bracelet', 'Synced', 'done', 'band4')] }),

  /* ---- weekly routine: what you've done, and your vitals --------------- */

  /* achiever: everything given so far, as counts */
  /* two views on one screen: the tower (a Jenga layer a day, 3.6's
     variant) or the counts; the switch at the top swaps them in place */
  'v2-3-tally': scr2(`
    ${nav('Data sent', 'Day 19')}
    <div data-morph>${tallyView('tower')}</div>`, 1),

  /* explorer + achiever: your vitals on one screen, each tile opening its
     history */
  'v2-3-dash': scr2(`
    ${nav('Your health', 'Last 3 weeks')}
    ${spot(`<div class="j-dbs">
      ${dash('Resting heart rate', '68', 'bpm', [60, 55, 58, 52, 50, 48, 50], 'Normal range · ↓ 3')}
      ${dash('Blood pressure', '118/76', '', [50, 56, 48, 52, 46, 50, 44], 'Normal · ↓ 2 systolic')}
      ${dash('Weight', '196.1', 'lbs', [62, 58, 60, 54, 52, 50, 47], '↓ 1.4 lbs since day 1')}
      ${dash('Sleep', '6h 48m', '', [40, 55, 48, 60, 52, 58, 62], '4 of 7 nights over 7h')}
      ${dash('Steps', '5,420', 'a day', [45, 50, 42, 58, 55, 60, 57], 'Goal 7,000 · ↑ 610')}
      ${dash('Heart rhythm', '19', 'days', [70, 70, 70, 70, 70, 70, 70], 'Every day so far')}
    </div>`, 'Each trend and its history can be hidden for studies that don’t show past readings')}
    <p class="u-note u-note--c">Tap any one for its full history</p>`, 1, 'is-spotlit'),
});

/* what each checklist item collected, opened from "View data" */
Object.assign(UI2X, {
  'ck.cuff1': collected(cBp, 'BP cuff', 'at 10:21 AM', [['Blood pressure', '121 / 78'], ['Synced', '10:21 AM']],
    'Your next reading is tonight, sitting down.'),
  'ck.patch6': collected(gPatch, 'Patch', 'this week', [['Heart rhythm', '5 days, 22 hours'], ['Heartbeats', 'About 580,000'], ['Gaps', 'None'], ['Synced', '7:02 AM']],
    patchOff('Tomorrow')),
  'ck.band6': collected(cBand, 'Bracelet', 'last night', [['Sleep', '6h 52m'], ['Heart rate', '96 readings'], ['Synced', '7:02 AM']]),
  'ck.patch7': collected(gPatch, 'Patch', 'this week', [['Heart rhythm', '6 days, 22 hours'], ['Heartbeats', 'About 680,000'], ['Gaps', 'None'], ['Synced', '8:02 AM']],
    patchOff('Tomorrow')),
  'ck.band7': collected(cBand, 'Bracelet', 'last night', [['Sleep', '7h 05m'], ['Heart rate', '96 readings'], ['Synced', '8:02 AM']]),
  'ck.scale7': collected(cWeight, 'Scale', 'at 8:10 AM', [['Weight', '196.8 lbs'], ['Change', '↓ 0.7 since day 1'], ['Readings', '7 this week']]),
  'ck.band1': collected(cBand, 'Bracelet', 'at 10:12 AM', [['Heart rate', '72 bpm'], ['Synced', '10:12 AM']]),
  'ck.scale1': collected(cWeight, 'Scale', 'at 10:24 AM', [['Weight', '197.5 lbs'], ['Synced', '10:24 AM']],
    'Take your weight each day, before breakfast if you can.'),
  'ck.patch1': collected(gPatch, 'Patch', 'at 10:16 AM', [['Heart rhythm', 'Recording, 71 bpm'], ['Synced', '10:16 AM']],
    'It records for as long as you wear it.'),
  'ck.patch': collected(gPatch, 'Patch', 'today', [['Heart rhythm', '24 hours'], ['Heartbeats', 'About 98,000'], ['Gaps', 'None'], ['Synced', '7:58 PM']],
    patchOff('Tomorrow')),
  'ck.band': collected(cBand, 'Bracelet', 'today', [['Sleep', '6h 52m last night'], ['Steps', '5,180'], ['Heart rate', '288 readings'], ['Synced', '7:58 PM']]),
  'ck.q': collected(cQ, 'Questionnaire', 'at 8:10 AM', [['Questions', '6 of 6 answered'], ['Time', '1 minute 50 seconds']],
    'The study reads your answers alongside your heart data from the same days.'),
  'ck.bp': collected(cBp, 'Blood pressure', 'at 8:02 PM', [['Reading', '118 / 76'], ['Pulse', '64 bpm'], ['This week', '6 readings']]),
  'ck.band3': collected(cBand, 'Bracelet', 'overnight', [['Sleep', '7h 05m'], ['Heart rate', '96 readings'], ['Synced', '7:30 AM']],
    'It syncs on its own when your phone is nearby.'),
  'ck.band4': collected(cBand, 'Bracelet', 'this month', [['Days worn', '30'], ['Nights of sleep', '29'], ['Synced', '7:40 AM']],
    'This month’s data goes into tomorrow’s report.'),
  'ck.bp4': collected(cBp, 'Blood pressure', 'at 7:45 AM', [['Reading', '116 / 75'], ['Pulse', '66 bpm'], ['This month', '28 readings']]),
});

/* ==========================================================================
   1.4 · finding the scale by distance (08.OCT.2026)

   Replaces the static fix list on 8A. The screen shows how far the phone
   is from the device: the rings round the scale take the colour of the
   distance, the phone on screen moves in with the real one, and a bar
   from far to close marks where you are. The prototype steps itself
   through far, closer, close and connected; the last one waits.
   ========================================================================== */

/* one state. temp (far to close): cold | warm | hot | done; `at` is the marker on the bar
   (0 to 100); `next` is the state the prototype moves on to by itself.
   `o` sets the device, the title, a way back and the finish; the scale is the
   default */
const hotCold = (temp, word, line, at, next, o = {}) => scr2(`
    ${o.back || ''}${nav(o.title || 'Connect the scale', o.title ? '' : 'Help')}
    <div class="j-hc is-${temp}" ${next ? `data-auto="view:${next};1700"` : ''}>
      <div class="j-hc__stage">
        <span class="j-hc__r"></span><span class="j-hc__r"></span><span class="j-hc__r"></span>
        <span class="j-hc__dev">${temp === 'done' ? '✓' : (o.dev || cWeight)}</span>
        <span class="j-hc__ph">${gPhone}</span>
      </div>
      <p class="j-hc__w">${word}</p>
      <p class="j-hc__l">${line}</p>
      <div class="j-hc__bar"><i style="left:${at}%"></i></div>
      <div class="j-hc__k"><span>Far</span><span>Close</span></div>
    </div>
    ${temp === 'done'
      ? `<div class="u-thumb">${o.done || `<span class="u-btn u-btn--xl" data-tap="view:ck-1-scale">Back</span>`}</div>`
      : `<p class="j-hc__help" data-tap="toast:Calls Dana, your study coordinator">Still stuck? Call Dana</p>`}`, false);

/* connecting the patch, the last of its four parts, on its own screen: the
   patch, a line of dots, the phone. It runs by itself (morph: swaps the
   block in place), fewer dots and red to blue to green as the phone gets
   closer; once connected, Next comes on */
const ddBlock = (g, temp, word, line, n, next, extra = '') => {
  const dd = `
  <div class="j-dd is-${temp}" ${next ? `data-tap="step" data-step="morph:${next}"` : 'data-auto="unlock:connect;300"'}>
    <span class="j-dd__dev">${g}</span>
    <span class="j-dd__dots">${'<i></i>'.repeat(n)}</span>
    <span class="j-dd__ph">${temp === 'done' ? '✓' : gPhone}</span>
  </div>
  <p class="j-dd__w">${word}</p>
  <p class="j-dd__l">${line}</p>`;
  /* while it is still finding the device, the distance is lit */
  return (temp === 'done' ? dd : spot(dd, 'A distance indicator shows how close the phone is, so it gets near enough to connect')) + extra;
};

/* the patch, found by distance the same way: setup step 3, then on to step 4 */
const PATCH = { dev: gPatch, title: 'Connect the patch',
  back: `<p class="j-back" data-tap="view:1B-s3">${chev()} Put on the patch</p>`,
  done: `<span class="u-btn u-btn--xl" data-tap="view:1B-s4">Next</span>` };

Object.assign(UI2, {
  '1B.far':  hotCold('cold', 'About 10 ft away', 'Too far to connect.<br>Bring your phone toward the patch.', 10, '1B.warm', PATCH),
  '1B.warm': hotCold('warm', 'About 3 ft away', 'Getting closer.<br>Keep going.', 48, '1B.hot', PATCH),
  '1B.hot':  hotCold('hot', 'Right next to it', 'Close enough.<br>Hold your phone still.', 84, '1B.ok', PATCH),
  '1B.ok':   hotCold('done', 'Connected', 'Your patch is working.<br>First reading at 10:16 AM.', 100, '', PATCH),
  '8A':      hotCold('cold', 'About 10 ft away', 'Too far to connect.<br>Bring your phone toward the scale.', 10, '8A-warm'),
  '8A-warm': hotCold('warm', 'About 3 ft away', 'Getting closer.<br>Keep going.', 48, '8A-hot'),
  '8A-hot':  hotCold('hot', 'Right next to it', 'Close enough.<br>Hold your phone still.', 84, '8A-done'),
  '8A-done': hotCold('done', 'Connected', 'Your scale is synced.<br>197.5 lbs recorded.', 100, ''),
});

/* 3D, patch week (2.1): the patch first, then today as a checklist, in the
   same format as the daily checklists. Defined here, after ckItem */
Object.assign(UI2, {
  '3D': scr2(`
    ${nav('')}
    ${card(`${eyebrow('Patch week · day 5 of 7')}
      <p class="u-lead u-lead--big">Keep the patch on</p>
      ${patchDots(5)}
      <p class="u-note">2 days left. We'll tell you when to remove it.</p>`, 'u-card--edge')}
    ${sec('Today')}
    <div class="j-cks">
      ${ckItem(cQ, 'Questionnaire', 'About 2 minutes', 'now')}
      ${ckItem(cBp, 'Blood pressure and weight', 'About 2 minutes', 'later')}
    </div>`),
});

/* 2.4 and 2.5, taking blood pressure: one layout for both, so the cuff
   stays the same size in the same place while it measures and when it's
   done. Title block on top, the cuff in a fixed stage, then what's below
   it, then the button. Defined last, over the v01 copies */
/* the blood pressure monitor on its own, cropped from the cuff drawing so
   it can be drawn bigger; the cuff and tube are hidden by the j-rd styles */
const monitorArt = (...v) => cuffArt(...v).replace('viewBox="0 0 200 200"', 'viewBox="106 40 90 130"');

/* the reading as the app shows it, not the machine: two half rings, the
   top one for systolic, the bottom one for diastolic, each from the left
   round to its value with a dot at the end. While measuring, both fill and
   ease back (the cuff inflating and letting go) */
const bpGauge = (sys = '', dia = '', pulse = '') => {
  const r = 78;
  const ticks = Array.from({ length: 36 }, (_, k) => {
    const t = k * 10 * Math.PI / 180;
    return `M${(100 + 90 * Math.cos(t)).toFixed(1)} ${(100 + 90 * Math.sin(t)).toFixed(1)}L${(100 + 94 * Math.cos(t)).toFixed(1)} ${(100 + 94 * Math.sin(t)).toFixed(1)}`;
  }).join('');
  /* a half ring's share of its half, and where its dot lands */
  const end = (share, up) => {
    const a = Math.PI + (up ? 1 : -1) * share * Math.PI;
    return [(100 + r * Math.cos(a)).toFixed(1), (100 + r * Math.sin(a)).toFixed(1)];
  };
  const top = `M${100 - r} 100A${r} ${r} 0 0 1 ${100 + r} 100`;
  const bottom = `M${100 - r} 100A${r} ${r} 0 0 0 ${100 + r} 100`;
  const s1 = sys ? Math.min(+sys / 180, 1) : 0, s2 = dia ? Math.min(+dia / 120, 1) : 0;
  const [x1, y1] = end(s1, true), [x2, y2] = end(s2, false);
  return `<div class="j-gauge ${sys ? 'is-done' : 'is-measuring'}" role="img" aria-label="${sys ? `Blood pressure ${sys} over ${dia}, pulse ${pulse}` : 'Measuring'}">
    <svg viewBox="0 0 200 200" aria-hidden="true">
      <path d="${ticks}" class="j-gauge__tick"/>
      <circle cx="100" cy="100" r="${r}" class="j-gauge__track"/>
      <path d="${top}" pathLength="100" class="j-gauge__arc j-gauge__arc--sys" style="stroke-dasharray:${(s1 * 100).toFixed(1)} 100"/>
      <path d="${bottom}" pathLength="100" class="j-gauge__arc j-gauge__arc--dia" style="stroke-dasharray:${(s2 * 100).toFixed(1)} 100"/>
      ${sys ? `<circle cx="${x1}" cy="${y1}" r="6.5" class="j-gauge__dot"/><circle cx="${x2}" cy="${y2}" r="6.5" class="j-gauge__dot j-gauge__dot--dia"/>` : ''}
    </svg>
    <div class="j-gauge__v">
      <p><b ${sys ? '' : 'class="is-wait"'}>${sys || '118'}</b><span>sys</span></p><i></i><p><b ${dia ? '' : 'class="is-wait"'}>${dia || '76'}</b><span>dia</span></p>
      <em ${pulse ? '' : 'class="is-wait"'}>♥ ${pulse || '64'} bpm</em>
    </div></div>`;
};

/* today's reading against earlier ones, as a small chart: systolic and
   diastolic across last month, last week, yesterday and today, today's
   values marked. What the two numbers mean opens from a small "?" */
const bpCompare = (pts) => {
  const W = 220, H = 74;
  /* each number in its own band (systolic above, diastolic below), scaled to
     its own range, so a change of a few points shows */
  const band = { 1: [10, 24], 2: [36, 50] };
  const rng = (n) => [Math.min(...pts.map((q) => q[n])) - 1.5, Math.max(...pts.map((q) => q[n])) + 1.5];
  const x = (k) => 18 + k * (W - 46) / (pts.length - 1);
  const y = (v, n) => { const [a, b] = rng(n), [t, u] = band[n]; return (u - (v - a) / (b - a) * (u - t)).toFixed(1); };
  const line = (n) => pts.map((q, k) => `${k ? 'L' : 'M'}${x(k).toFixed(1)} ${y(q[n], n)}`).join('');
  const dots = (n, cls) => pts.map((q, k) => `<circle cx="${x(k).toFixed(1)}" cy="${y(q[n], n)}" r="${k === pts.length - 1 ? 3.6 : 2.4}" class="${cls}${k === pts.length - 1 ? ' is-now' : ''}"/>`).join('');
  const last = pts[pts.length - 1], lx = x(pts.length - 1) + 7;
  return `<div class="j-cmp">
    <div class="j-cmp__hd"><span class="j-cmp__key"><i class="is-sys"></i>Sys<i class="is-dia"></i>Dia</span>
      <span class="j-cmp__q" data-tap="toggle">?<span class="j-cmp__tip"><b>Sys</b>, systolic: the pressure as your heart beats. <b>Dia</b>, diastolic: the pressure between beats.</span></span></div>
    <svg viewBox="0 0 ${W} ${H}" class="j-cmp__svg" role="img" aria-label="Systolic and diastolic, last month to today">
      <path d="${line(1)}" class="j-cmp__l is-sys"/><path d="${line(2)}" class="j-cmp__l is-dia"/>
      ${dots(1, 'j-cmp__d is-sys')}${dots(2, 'j-cmp__d is-dia')}
      <text x="${lx}" y="${+y(last[1], 1) + 3}" class="j-cmp__v is-sys">${last[1]}</text>
      <text x="${lx}" y="${+y(last[2], 2) + 3}" class="j-cmp__v is-dia">${last[2]}</text>
      ${[1, 2].map((n) => pts.slice(0, -1).map((q, k) => {
        /* how far this point sits from today's value: −4 is 4 below today */
        const dd = q[n] - last[n];
        const yy = +y(q[n], n) + (n === 1 ? -5 : 9);
        return `<text x="${x(k).toFixed(1)}" y="${yy}" class="j-cmp__dv" text-anchor="middle">${dd > 0 ? '+' : dd < 0 ? '−' : ''}${Math.abs(dd)}</text>`;
      }).join('')).join('')}
      ${pts.map((q, k) => `<text x="${x(k).toFixed(1)}" y="${H - 2}" class="j-cmp__x" text-anchor="middle">${q[0]}</text>`).join('')}
    </svg></div>`;
};

/* a reading's change since yesterday, as a few bold numbers and almost no
   words: an arrow, how much, the unit, then "since yesterday" once. Week
   one has nothing older, so no last week or last month. Tiles are
   [amount, unit, 'up' | 'down'] */
const sinceYday = (tiles) => `<div class="j-yd"><div class="j-yd__ts">${tiles.map(([amt, unit, dir]) =>
  `<span class="j-yd__t is-${dir}"><i aria-hidden="true">${dir === 'up' ? '↑' : '↓'}</i><b class="u-num">${amt}</b><em>${unit}</em></span>`).join('')}</div>
  <p class="j-yd__k">since yesterday</p></div>`;
/* optional context on a reading (21.OCT.2026): some people want to say
   what was different ("I weighed myself with shoes on"). One quiet row
   under the result: tap any that apply, or write a note. Never required,
   and nothing is asked again if they skip it */
const NOTE_CHIPS = {
  bp: [['☕', 'Had coffee'], ['🏃', 'Just moved'], ['😣', 'Stressed'], ['🗣️', 'Talked during it']],
  sc: [['👟', 'Shoes on'], ['🧥', 'Heavier clothes'], ['🍽️', 'Just ate']],
};
const readNote = (kind) => `<div class="j-rn2">
    <p class="j-rn2__k">Anything different today? <span>Optional</span></p>
    <div class="j-rn2__c"><span class="j-rn2__chip j-rn2__chip--w" data-tap="sheet:note.${kind}" role="button"><i aria-hidden="true">✏️</i>Write a note</span>
      ${NOTE_CHIPS[kind].map(([e, t]) => `<span class="j-rn2__chip" data-tap="toggle" role="button" aria-pressed="false"><i aria-hidden="true">${e}</i>${t}</span>`).join('')}</div>
  </div>`;
const reading = (title, line, art, below, button, done, extra = '') => {
  /* a help link in the body moves up to a quiet "Help" in the top-right corner */
  const help = (below.match(/data-tap="(sheet:ins\.[a-z]+)"/) || [])[1];
  below = below.replace(/<span class="j-rd__how"[\s\S]*?<\/span>/, '');
  return scr2(`
    <div class="j-rd__top"><p class="j-back" data-tap="back">${chev()} Back</p>${help ? `<span class="j-rd__q" data-tap="${help}" aria-label="How to take this reading">Help</span>` : ''}</div>
    <div class="j-rd ${done ? 'is-done' : ''}" ${extra}>
      <div class="j-rd__h"><p class="j-rd__t">${title}</p><p class="j-rd__l">${line}</p></div>
      <div class="j-rd__art">${art}</div>
      <div class="j-rd__b">${below}</div>
      <div class="u-thumb">${button}</div>
    </div>`, false);
};

/* while the cuff measures: five heart facts, one per tap; the tap after
   the fifth shows the reading. v04 (30.OCT.2026): Measuring… goes straight
   on to the reading, however many facts have shown */
const gRefresh = `<svg viewBox="0 0 24 24" class="u-g" aria-hidden="true"><path d="M19.5 12a7.5 7.5 0 1 1-2.2-5.3"/><path d="M19.5 4.5v4.2h-4.2"/></svg>`;
/* each fact is [fact, source], and the source shows under it (21.OCT.2026).
   The blood-vessels-round-the-world fact was swapped out: its 60,000 miles
   goes back to a disputed 1929 estimate with no primary source to cite */
const HEART_FACTS = [
  ['The human heart pumps about 2,000 gallons of blood a day, enough to fill a hot tub.', 'American Heart Association'],
  ['The average heart beats about 100,000 times a day.', 'American Heart Association'],
  ['The sound of a heartbeat is the heart’s valves closing.', 'OpenStax, Anatomy and Physiology'],
  ['A resting heart beats 60 to 100 times a minute, and a fitter heart often beats slower.', 'American Heart Association'],
  ['A good laugh relaxes blood vessels and helps blood flow.', 'University of Maryland School of Medicine, 2005'],
];
/* each source links to where the fact comes from (the prototype says where
   it would open): one quiet line, just the name (no "Source:"), and a small ↗
   that marks it opens elsewhere (21.OCT.2026: no book icon, no underline) */
const FACT_URL = { 'American Heart Association': 'heart.org', 'OpenStax, Anatomy and Physiology': 'openstax.org',
  'University of Maryland School of Medicine, 2005': 'medschool.umaryland.edu', 'Goldbogen et al., PNAS, 2019': 'pnas.org',
  'Cleveland Clinic': 'clevelandclinic.org', 'CDC': 'cdc.gov', 'Laffin et al., Hypertension, 2018': 'ahajournals.org' };
const gSrc = `<svg viewBox="0 0 24 24" class="u-g" aria-hidden="true"><path d="M8 16 16 8M10 8h6v6"/></svg>`;
/* the source on one line: a short name for the long ones, and past the
   card's width it ends in … with the ↗ still there */
const FACT_SHORT = { 'OpenStax, Anatomy and Physiology': 'OpenStax, Anatomy & Physiology',
  'University of Maryland School of Medicine, 2005': 'Univ. of Maryland, 2005', 'Goldbogen et al., PNAS, 2019': 'Goldbogen et al., 2019',
  'Laffin et al., Hypertension, 2018': 'Laffin et al., 2018' };
const factCite = (src) => `<cite class="j-fact__src" data-tap="toast:Opens ${FACT_URL[src] || 'the source'} in your browser" title="${src}"><u><span class="j-fact__nm">${FACT_SHORT[src] || src}</span>${gSrc}</u></cite>`;
HEART_FACTS.forEach((f, k) => {
  /* ↻ draws another fact from the bank, without moving on */
  UI2X[`fact.${k + 1}`] = `<div class="j-rd__fact" data-step="${k < 4 ? `morph:fact.${k + 2}` : 'view:10B-done'}"><b>Fun fact</b>
    <span class="j-fact__new" data-tap="morph:fact.${(k + 1) % 5 + 1}" aria-label="Another fact">${gRefresh}</span><p>${f[0]}</p>${factCite(f[1])}</div>`;
});
/* the evening readings (2.7) draw from the same bank, the blue whale first;
   ↻ shows another, and the measuring still moves on by itself */
/* v03 (21.OCT.2026): the two "Did you know" lines from the result screens
   join the bank, so facts come while it measures and results show change */
const RD_FACTS = [['On a deep dive, a blue whale’s heart can slow to just 2 beats a minute.', 'Goldbogen et al., PNAS, 2019'],
  ['Talking during a blood pressure reading can raise it by about 10 points.', 'American Heart Association'],
  ['Blood pressure is at its lowest during sleep.', 'Laffin et al., Hypertension, 2018'], ...HEART_FACTS];
RD_FACTS.forEach((f, k) => {
  UI2X[`rfact.${k + 1}`] = `<div class="j-rd__fact" data-step="${k < RD_FACTS.length - 1 ? `morph:rfact.${k + 2}` : 'view:rd-bp-done'}"><b>Fun fact</b>
    <span class="j-fact__new" data-tap="morph:rfact.${(k + 1) % RD_FACTS.length + 1}" aria-label="Another fact">${gRefresh}</span><p>${f[0]}</p>${factCite(f[1])}</div>`;
});

/* one concept, clicked through: get ready, then Start; it measures by
   itself, then shows the reading. Done goes back to the start */
Object.assign(UI2, {
  /* how it starts: the evening reminder on the lock screen; tapping it
     opens the app at "Put the cuff on" */
  'bp-lock': scr2(notif('8:00 PM', 'Thursday, September 25', 'Time for your blood pressure',
    'Sit for 5 minutes first, then it takes 40 seconds.', 'x')
    .replace('<span class="j-ov__bg" data-tap="close"></span>', '<span class="j-ov__bg"></span>')
    .replace('data-tap="sheet:x"', 'data-tap="view:10B-ready"')
    .replace(/<div class="j-nt"[\s\S]*?<\/div><\/div>/, (nt) => spot(nt, 'A reminder at the time it is due, with how long it takes, and one tap opens it')), false, 'is-spotlit'),
  '10B-ready': reading('Put the cuff on', 'Left arm, just above the elbow.', `${cuffOnArt()}`,
    `<p class="j-rd__wait">Sit with your back supported and your arm resting on a table.</p><span class="j-rd__how" data-tap="sheet:ins.bp">How to take your blood pressure ${chev()}</span>`,
    `<span class="u-btn u-btn--xl" data-tap="view:10B">Start</span>`, false, 'data-state="ready"'),
  '10B': reading('Measuring', 'Stay still and quiet for about 40 seconds.', spot(bpGauge(), 'The ring moves while the cuff measures, so the wait shows something is happening'),
    spot(`<div data-morph>${UI2X['fact.1']}</div>`, 'Tap to refresh for another fun fact, to keep you engaged while it measures'),
    `<span class="u-btn u-btn--xl u-btn--ghost" data-tap="view:10B-done">Measuring…</span>`, false, 'data-tap="step"'),
  '10B-done': reading('Reading complete', 'Recorded, your <b>6th</b> this week.', bpGauge('118', '76', '64'),
    spot(sinceYday([['2', 'sys', 'up'], ['1', 'dia', 'up']]), 'Today’s reading next to yesterday’s, a comparison each study can choose to hide') + readNote('bp'),
    `<span class="u-btn u-btn--xl" data-tap="view:ck-2">Done</span>`, true),
  /* day 30's final reading: the same cuff, and at the end the report unlocks */
  'rd30': reading('Your final reading', 'Left arm, just above the elbow.', monitorArt(),
    `<p class="j-rd__wait">This one unlocks your month 1 report.</p><span class="j-rd__how" data-tap="sheet:ins.bp">How to take your blood pressure ${chev()}</span>`,
    `<span class="u-btn u-btn--xl" data-tap="view:rd30-m">Start</span>`, false, 'data-state="ready"'),
  'rd30-m': reading('Measuring', 'Stay still and quiet for about 40 seconds.', monitorArt(),
    `<div class="j-rd__fact"><b>Almost there</b><p>Thirty days of readings go into your report.</p></div>`,
    `<span class="u-btn u-btn--xl u-btn--ghost" data-tap="view:rd30-done">Measuring…</span>`, false, 'data-auto="view:rd30-done;10000"'),
  'rd30-done': reading('Report unlocked', 'Final reading recorded.', monitorArt('118', '76', '64'),
    `<p class="j-rd__tip"><b>Your month 1 report is ready.</b> It’s at the top of today.</p>`,
    `<span class="u-btn u-btn--xl" data-tap="view:ck-4">See your report</span>`, true),
});

/* ==========================================================================
   Wrap-up: who else is in it, and what it all made possible
   (08.OCT.2026). Specifics, not "advancing research": counts of people and
   data, what is being learned, and when the results come back. Effort and
   cohort numbers only; no one's health is ranked.
   ========================================================================== */
/* one poll answer or cohort band, with how many people picked it */
const pollBar = (label, n, max, you) => `<span class="j-pl ${you ? 'is-you' : ''}">
  <i style="--w:${Math.round(n / max * 100)}%"></i><b>${label}${you ? ' <em>You</em>' : ''}</b><s>${n}</s></span>`;

/* an area average, with yours under it */
const avgTile = (g, n, what, you) => `<span class="j-tl j-tl--avg"><b>${n}</b><em>${what}</em>${you ? `<span class="j-tl__you">${you}</span>` : ''}</span>`;

Object.assign(UI2, {

  /* socializer + competitor: the cohort near you, on a map, with averages */
  /* v03 (23.OCT.2026): back in, as part of Impact, and only once the study
     is done: legal won't show who else takes part while it runs (F3). It
     looks back on the study, from Impact */
  'v2-4-region': scr2(`
    <p class="j-back" data-tap="back">${chev()}</p>
    ${nav('Your region', 'The study has ended')}
    <div class="j-city" data-tap="sheet:region.cities"><span>Showing</span><b>Boston area ${gDown}</b></div>
    ${card(`<p class="u-lead">214 people took part near Boston</p>
      ${dotMap([
        '                   ..       ',
        '                   bb.      ',
        '   ................bbb      ',
        '  .............bbbbybbbb..  ',
        '  ............bbbbbbbbbb..  ',
        '  ............bbbbb bbbb... ',
        '                     bb     ',
      ])}`, 'u-card--edge')}
    ${sec('Over the study, on average near Boston')}
    <div class="j-tls">
      ${avgTile(cBand, '26', 'days of data', 'You: 28')}
      ${avgTile(cQ, '12', 'questionnaires', 'You: 13')}
    </div>
    ${sec('Who took part near Boston')}
    <div class="j-tls">
      ${avgTile(cBand, '58', 'average age', 'You: 61')}
      ${avgTile(cQ, '116 / 98', 'women and men', '')}
    </div>
    ${card(`<p class="u-k">By age</p>
      <div class="j-pls">
        ${pollBar('Under 45', 38, 82, false)}
        ${pollBar('45 to 59', 72, 82, false)}
        ${pollBar('60 to 74', 82, 82, true)}
        ${pollBar('75 and over', 22, 82, false)}
      </div>`)}
    <p class="u-note u-note--c">1,240 took part across Massachusetts</p>`, 1),

  /* Impact (v03): what your 90 days added up to, about you only. Results
     for the whole study (Study updates, merged in) come only when the study
     ends, which can take years, so until then every report is personal
     (F1); an example from a finished study shows what they will look like.
     One patch week a cycle (every 90 days): 168 patch hours */
  'v2-4-impact': scr2(`
    ${nav('Impact')}
    ${card(`${eyebrow('Your 90 days')}
      <div class="j-sts">${[['168', 'patch hours'], ['90', 'blood pressure readings'], ['39', 'questionnaires']].map(([n, w]) =>
        `<span><b>${n}</b><em>${w}</em></span>`).join('')}</div>`, 'u-card--edge')}
    ${card(`${eyebrow('Results for the whole study')}
      <p class="u-note">Shared when the study ends. Some studies run for years, so until then every report you get is about you.</p>`, 'j-imp__lock')}
    <div class="u-rows">
      <div class="u-row"><b>Your cycle 1 report</b><i>Tomorrow</i></div>
      <div class="u-row" data-tap="view:v2-4-region"><b>Who took part near you</b><i>At the end ${chev()}</i></div>
    </div>
    ${sec('What they look like')}
    ${card(`<p class="j-imp__ex"><span>Example</span>A finished heart study, 2022 to 2024</p>
      <div class="j-imp__f"><b>What it set out to answer</b><p>Whether a patch, a bracelet and a few minutes of readings a day can spot heart rhythm changes early.</p></div>
      <div class="j-imp__f"><b>Who took part</b><p>860 people across Massachusetts, aged 28 to 84, a little over half of them women.</p></div>
      <div class="j-imp__f"><b>What it found</b><p>Night readings were the most accurate. Night data was cleaner than daytime data, so patch weeks mattered most.</p></div>`, 'j-imp__card')}`, 2),
});

/* ==========================================================================
   Routine: a streak, a daily poll, and badges that pay
   (08.OCT.2026). The streak never punishes a gap (R1: missing a task felt
   like "getting an F"). The poll shows how others answered, in counts.
   Every badge adds a small cash bonus, since a badge alone is a sticker.
   ========================================================================== */

/* one day of the streak: done, today, or still to come */
const stDay = (d, state) => `<span class="j-sk__d is-${state}"><b>${state === 'done' ? '✓' : d}</b></span>`;

/* a badge and the cash bonus it adds; locked ones show what it takes */
const gBadge = (mark, name, bonus, state) => `<span class="j-bg is-${state}">
  <i>${state === 'locked' ? '' : mark}</i><b>${name}</b><em>${bonus}</em></span>`;

Object.assign(UI2, {

  /* achiever: a streak of days with data, gentle about gaps */
  'v2-3-streak': scr2(`
    ${nav('Your streak', 'Day 17')}
    <div class="j-sk">
      <span class="j-sk__n">17</span>
      <p class="j-sk__t">days on study in a row</p>
    </div>
    ${card(`<p class="u-k">This week</p>
      <div class="j-sk__w">${['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((d, k) =>
        stDay(d, k < 3 ? 'done' : k === 3 ? 'now' : 'next')).join('')}</div>`, 'u-card--edge')}
    ${card(`<div class="j-sk__bonus"><span class="j-sk__cash">$2</span>
      <p class="u-note"><b>4 more days</b> to a three-week streak. That adds a <b>$2 bonus</b> to your earnings.</p></div>
      ${prog('Three-week streak', 17, 21, ' days')}`)}`),

  /* socializer: one question a day, and how everyone answered */
  /* 3.4, where the trivia lives: on the home screen, above the day's
     checklist, spotlit the first time so you see it in context */
  'v2-3-poll': home3({ day: 18, spotlit: true, below: homeBelow(18, 30), tasks: routineTasks(null),
    top: `<div class="j-spot" data-tap="view:v2-3-trivia">
      ${card(triviaBody(TRIVIA[0][0], TRIVIA[0][1], 18), 'u-card--edge j-tvc')}
      <p class="j-spot__tip">A new daily trivia question takes one tap, then shows how everyone did</p>
    </div>` }),

  'v2-3-trivia': scr2(`
    <div class="u-back" data-tap="view:v2-3-poll">‹ Today</div>
    ${nav('Today’s trivia', 'Day 18')}
    ${card(`<p class="u-lead">${TRIVIA[0][0]}</p>
      <div class="j-pls">
        ${pollBar('About 10,000', 214, 612, false)}
        ${pollBar('About 100,000 ✓', 612, 612, true)}
        ${pollBar('About 1 million', 286, 612, false)}
      </div>
      <p class="u-note">That’s right. ${TRIVIA[0][3]}</p>${factCite(TRIVIA[0][4])}`, 'u-card--edge j-tvp')}
    ${triviaPast(18)}`),

  /* earner + achiever: badges, each one a small cash bonus */
  'v2-3-badges': scr2(`
    ${nav('Badges', 'Day 21')}
    <p class="u-note">Each badge adds a cash bonus to your earnings.</p>
    <div class="j-bgs">
      ${gBadge('7', 'First week', '$2 bonus', 'got')}
      ${gBadge('14', 'Streak', '$2 bonus', 'got')}
      ${gBadge('10', 'Question&shy;naires', '$2 bonus', 'next')}
      ${gBadge('30', 'First month', '$5 bonus', 'locked')}
      ${gBadge('60', 'Two months', '$5 bonus', 'locked')}
      ${gBadge('90', 'All 90 days', '$10 bonus', 'locked')}
    </div>
    ${card(`<p class="u-note"><b>Next:</b> one more questionnaire for your 10-questionnaire badge.</p>`)}`, 3),
});

/* ==========================================================================
   Quiet community (deck concept 21, 08.OCT.2026): support and a self-check,
   not a competition. A moderated peer space in the routine, and a way to
   pass the study on at the end. (Its poll is 3.6; its opt-in comparison
   is "Your region".)
   ========================================================================== */

/* one thread: the question and how many have replied */
/* a thread: the question, who asked it under their random name (never a
   real one), the replies, and whether the study team answered */
/* v04 (29.OCT.2026): a post, as a feed reads it: the random name's
   initials in a coloured circle, name and age, the question, a first line,
   then replies, helpful votes and the study team's answer as a badge */
const TH_EXTRA = {
  'Anyone else itchy under the patch?': ['2h', 'Mine itches a bit on day three. Is that normal or should I move it?', 24],
  'Best way to sleep with it on': ['5h', 'Side sleeper here. Wondering what works for everyone else.', 41],
  'How long until the results?': ['1d', 'Do we get anything back before the end of the 90 days?', 15],
  'Tips for remembering the evening reading': ['6d', 'I keep the cuff next to my toothbrush. What works for you?', 57],
  'What happens to our data after the study?': ['4d', 'Is it deleted, or kept for other research?', 38],
};
const CM_THUMB = `<div class="u-thumb"><p class="u-note u-note--c j-thumb__note">Joining is optional. Everyone posts under a random name, never their own, and the study team checks every post and removes anything that could identify someone.</p><span class="u-btn u-btn--xl u-btn--ghost" data-tap="sheet:cm-new">Start a thread</span></div>`;
const cmPage = (tab) => scr2(`
    ${nav('Community', 'Moderated')}
    <div class="j-hs2 j-cm__s" data-tap="toast:Search threads and common questions" role="search">${gSearchH}<em>Search threads and questions</em></div>
    <div class="j-cm__tabs" role="tablist"><span class="${tab === 'latest' ? 'is-on' : ''}" data-tap="view:v2-3-community">Latest</span><span class="${tab === 'popular' ? 'is-on' : ''}" data-tap="view:v2-3-community-pop">Popular</span><b data-tap="toast:Opens all 48 threads">View all 48 ${chev()}</b></div>
    <div class="j-ths">
      ${tab === 'latest' ? `${thread('Anyone else itchy under the patch?', 12, true, 'Quiet Heron')}
      ${thread('Best way to sleep with it on', 31, false, 'Blue Maple')}
      ${thread('How long until the results?', 8, true, 'Calm River')}`
      : `${thread('Tips for remembering the evening reading', 46, false, 'Bright Fern')}
      ${thread('Best way to sleep with it on', 31, false, 'Blue Maple')}
      ${thread('What happens to our data after the study?', 22, true, 'Still Lake')}`}
    </div>
    ${CM_THUMB}`, 2);
const thread = (q, n, team, who = '') => {
  const [age, line, up] = TH_EXTRA[q] || ['', '', 0];
  const ini = (who || 'P').split(' ').map((w) => w[0]).join('').slice(0, 2);
  const hue = [...(who || q)].reduce((a, c) => a + c.charCodeAt(0), 0) % 3;
  return `<span class="j-th j-post"><span class="j-post__h"><i class="j-post__av is-h${hue}">${ini}</i><em>${who || 'Participant'}${age ? ` · ${age}` : ''}</em></span>
  <b>${q}</b>${line ? `<p class="j-post__l">${line}</p>` : ''}
  <span class="j-post__f"><span>💬 ${n}</span>${up ? `<span>▲ ${up}</span>` : ''}${team ? '<span class="j-post__team">✓ Study team answered</span>' : ''}</span></span>`;
};

Object.assign(UI2, {

  /* socializer: a moderated peer space, quiet by default */
  /* v04 (29.OCT.2026): a search for threads and common questions, then
     Latest or Popular (three each) with a way to see them all */
  'v2-3-community': cmPage('latest'),
  'v2-3-community-pop': cmPage('popular'),

  /* everyone: pass the study on to someone it might help */
  'v2-4-share-study': scr2(`
    ${nav('Referral')}
    ${card(`<p class="u-lead u-lead--big">Know someone with a heart condition?</p>
      <p class="u-note">Send them the study page. They can read about it and decide for themselves.</p>
      <div class="j-link2"><span>prolaio.com/study</span><b data-tap="toast:Link copied">Copy link</b></div>`, 'u-card--edge j-share')}`, 3),
});

/* study updates (30.OCT.2026, was renewal): nobody is asked to re-up; the
   next cycle simply starts. Day 80 is when the app says what is changing,
   apart from the daily tasks, and any new consent sits here. No step takes
   more than a look, unless a consent needs an answer */
Object.assign(UI2, {
  'rn': scr2(`
    ${nav('Study updates', 'Day 80')}
    <p class="u-note">Cycle 2 starts on its own on day 91. Nothing to set up again, and your routine stays the same.</p>
    <p class="j-helps__k">Your agreement needed</p>
    <div class="j-crs j-crs--rcpt">
      <div class="j-cr" data-tap="view:rc-1"><i class="j-cr__g">${gBell}</i><div class="j-cr__t"><b>Consent update</b></div><em>1 change</em><span>${chev()}</span></div>
    </div>
    <p class="j-helps__k">What’s coming up</p>
    <div class="j-crs j-crs--rcpt">
      <div class="j-cr"><i class="j-cr__g">${gPatch}</i><div class="j-cr__t"><b>Patch week</b></div><em>Days 91 to 97</em><span></span></div>
      <div class="j-cr"><i class="j-cr__g">${gPatch}</i><div class="j-cr__t"><b>New patch arrives</b></div><em>By day 89</em><span></span></div>
      <div class="j-cr" data-tap="toast:Edit your address"><i class="j-cr__g">${gHome}</i><div class="j-cr__t"><b>Ship to</b></div><em>12 Elm St, Boston</em><span>${chev()}</span></div>
    </div>
    <div class="u-thumb"><span class="u-btn u-btn--xl" data-tap="home">Got it</span></div>`, false),
});

/* 1D, week one in review (2.8): the checklist again, each item with how
   the week went for it, day by day. Counts, never a grade; a missed day is
   explained, not marked as a failure. Defined last, after ckItem */
const weekRow = (g, name, line, days) => `<div class="j-wr">
  <span class="j-ck__g">${g}</span>
  <div class="j-wr__t"><b>${name}</b><em>${line}</em></div>
  <span class="j-wr__d">${days.map(d => `<i class="is-${d}"></i>`).join('')}</span></div>`;

Object.assign(UI2, {
  '1D': scr2(`
    ${nav('Week one, done', 'Sep 20–26')}
    <p class="u-note">How each part of your checklist went.</p>
    <div class="j-wrs">
      ${weekRow(gPatch, 'Patch', 'Worn all 7 days', ['ok', 'ok', 'ok', 'ok', 'ok', 'ok', 'ok'])}
      ${weekRow(cBand, 'Bracelet', '6 of 7 days synced', ['ok', 'ok', 'gap', 'ok', 'ok', 'ok', 'ok'])}
      ${weekRow(cBp, 'BP and weight', '7 of 7 readings', ['ok', 'ok', 'ok', 'ok', 'ok', 'ok', 'ok'])}
      ${weekRow(cQ, 'Questionnaire', '3 of 3 done', ['ok', 'off', 'ok', 'off', 'ok', 'off', 'off'])}
    </div>`),
});

/* 2.7, the evening readings as one clicked-through concept: blood
   pressure, its reading, then you tap on to the scale, then the weight
   reading with something new to learn. Same layout as 2.4; only the
   measuring moves on by itself, every next step is a tap.
   v03 (21.OCT.2026): Start measures (it used to skip to the result). While
   it measures the ring moves and a fun fact shows; a result shows only how
   it changed since yesterday, as week one has nothing older to compare */
Object.assign(UI2, {
  /* v04 (30.OCT.2026): the start shows how to sit and where the cuff goes */
  '5B': reading('Blood pressure', 'Cuff on your left arm, above the elbow.', cuffOnArt(),
    `<p class="j-rd__wait">Sit with your back supported and your arm resting on a table.</p><span class="j-rd__how" data-tap="sheet:ins.bp">How to take your blood pressure ${chev()}</span>`,
    `<span class="u-btn u-btn--xl" data-tap="view:rd-bp">Start</span>`, false, 'data-state="ready"'),
  'rd-bp': reading('Measuring', 'Stay still and quiet for about 40 seconds.', bpGauge(),
    `<div data-morph>${UI2X['rfact.1']}</div>`,
    `<span class="u-btn u-btn--xl u-btn--ghost" data-tap="view:rd-bp-done">Measuring…</span>`, false, 'data-auto="view:rd-bp-done;30000"'),
  'rd-bp-done': reading('Reading complete', 'Recorded. Take the cuff off.', bpGauge('118', '76', '64'),
    sinceYday([['2', 'sys', 'up'], ['1', 'dia', 'up']]) + readNote('bp'),
    `<span class="u-btn u-btn--xl" data-tap="view:rd-sc">Next: weight</span>`, true),
  'rd-sc': reading('Step on the scale', 'Bare feet, standing still.', scaleArt2(),
    `<p class="j-rd__wait">Your weight shows here as soon as you step on.</p><span class="j-rd__how" data-tap="sheet:ins.sc">How to take your weight ${chev()}</span>`,
    `<span class="u-btn u-btn--xl" data-tap="view:rd-sc-done">I’m on the scale</span>`, false),
  'rd-sc-done': reading('Reading complete', 'Weight recorded, so both readings are in.', scaleArt2('196.1'),
    sinceYday([['0.4', 'lbs', 'down']]) + readNote('sc'),
    `<span class="u-btn u-btn--xl" data-tap="home">Done</span>`, true),
  /* the day 7 weigh-in, from that day's checklist and back to it */
  'rd-sc7': reading('Step on the scale', 'Bare feet, standing still.', scaleArt2(),
    `<p class="j-rd__wait">Your weight shows here as soon as you step on.</p><span class="j-rd__how" data-tap="sheet:ins.sc">How to take your weight ${chev()}</span>`,
    `<span class="u-btn u-btn--xl" data-tap="view:rd-sc7-done">I’m on the scale</span>`, false),
  'rd-sc7-done': reading('Reading complete', 'Recorded, 0.7 lbs down since day 1.', scaleArt2('196.8'), '',
    `<span class="u-btn u-btn--xl" data-tap="view:ck-1-scale">Done</span>`, true),
});

/* every concept leads on: the questionnaire start goes to the finished
   list, and the check-in card closes back to the day's checklist */
UI2['12A'] = UI2['12A'].replace('<span class="j-hi"></span>', `<div class="u-thumb"><span class="u-btn u-btn--xl" data-tap="view:ck-4">Done</span></div><span class="j-hi"></span>`);

/* ==========================================================================
   1.3 setup, all six steps (08.OCT.2026). The concept opens on the steps
   at a glance, then walks them in order; step 3 is the patch screens
   (1B-s3, 1B.far/near/ok), which hand on to step 4. Same header and
   segment bar on every step.
   ========================================================================== */
const SETUP_STEPS = ['Check your kit', 'Put on your bracelet', 'Put on your patch', 'Take your first blood pressure', 'Take your first weight', 'Set your notifications'];
const SETUP_MIN = [1, 3, 7, 5, 3, 1];

/* the kit, lighting up as each device connects: bracelet, patch, cuff, scale.
   `lit` is how many are connected so far */
const KIT = [['Bracelet', 'cBand'], ['Patch', 'gPatch'], ['BP cuff', 'cBp'], ['Scale', 'cWeight']];
const kitStrip = (lit) => `<div class="j-kitbar" aria-label="${lit} of 4 devices connected">${KIT.map(([name], k) =>
  `<span class="${k < lit ? 'is-on' : ''}">${[cBand, gPatch, cBp, cWeight][k]}<em>${name}</em></span>`).join('')}</div>`;

/* a step's header: step n of 6 and the bar, the step done ones filled */
/* `tip`: light up the bar and its line, with that note beside them */
const stepHead = (n, line, tip) => {
  const bar = `<div class="j-seg j-seg--6">${[1, 2, 3, 4, 5, 6].map(k => `<i class="${k < n ? 'is-on' : k === n ? 'is-now' : ''}"></i>`).join('')}</div>
    ${line ? `<p class="j-cheer">${line}</p>` : ''}`;
  return `
    <div class="u-nav"><b>Step ${n} of 6</b><span class="j-help" data-tap="toast:Help for this step opens here">Help</span></div>
    ${tip ? spot(bar, tip) : bar}`;
};

/* a step, connected: what to do, then the device confirmed */
/* step illustrations, drawn in the body diagram's style */
/* the bracelet, from the client's wear guide turned on its side: the sleeve
   on the left, the fist pointing right (fingers curled at the right, the
   thumb along the bottom), the bracelet 1 cm above the wrist bone; its lower
   end is the button. Labels sit clear of the drawing */
const braceletArt = () => `<svg class="j-sa" viewBox="0 0 200 112" role="img" aria-label="The bracelet on your left wrist, 1 cm above the wrist bone. Press its button until the light blinks blue.">
  <path d="M58 42C80 42 96 42 104 41C112 34 124 26 140 25C156 24 170 26 178 30C186 32 188 40 184 44C190 46 191 55 185 58C191 61 191 70 185 72C189 76 187 84 180 85C176 92 168 96 158 96C140 96 122 90 110 84C106 82 104 82 100 82C84 82 70 82 58 82Z" class="j-bm__skin"/>
  <path d="M179 85C168 87 156 87 146 84" class="j-sa__line"/>
  <rect x="10" y="32" width="50" height="60" rx="4" class="j-sa__sleeve"/><path d="M46 32V92" class="j-sa__line"/>
  <rect x="83" y="37" width="14" height="50" rx="3.5" class="j-sa__strap"/>
  <rect x="84.5" y="45" width="11" height="30" rx="2" class="j-sa__face"/>
  <circle cx="90" cy="53" r="2.6" class="j-sa__blue"/><circle cx="90" cy="53" r="2.6" class="j-sa__pulse"/>
  <path d="M97 94h7M97 90v8M104 90v8" class="j-bm__dim"/>
  <text x="100.5" y="108" class="j-bm__t j-bm__t--dim" text-anchor="middle">1 cm</text>
  <text x="66" y="16" class="j-sa__t j-sa__t--blue" text-anchor="end">blinks blue</text><path d="M68 17l19 33" class="j-sa__lead"/>
  <text x="66" y="108" class="j-sa__t" text-anchor="end">press</text><path d="M68 104l16 -18" class="j-sa__lead"/>
</svg>`;
const cuffPairArt = () => `<svg class="j-sa" viewBox="0 0 220 104" role="img" aria-label="Hold the cuff's button for 3 seconds, until its screen shows a phone.">
  <rect x="20" y="20" width="62" height="70" rx="12" class="j-sa__cuff"/>
  <path d="M32 38h38M32 50h38M32 62h38" class="j-sa__line"/>
  <path d="M82 70c18 0 14 18 32 18" class="j-sa__line j-sa__tube"/>
  <rect x="112" y="12" width="74" height="84" rx="12" class="j-sa__dev"/>
  <rect x="122" y="22" width="54" height="40" rx="5" class="j-sa__screen"/>
  <rect x="142" y="30" width="14" height="24" rx="3" class="j-sa__ph"/>
  <circle cx="149" cy="78" r="7" class="j-sa__btnfill"/>
  <circle cx="149" cy="78" r="12" class="j-sa__ring"/>
  <text x="189" y="81" class="j-sa__t">hold 3 s</text>
</svg>`;
const stepArt = (art) => art ? `<div class="j-stepart">${art}</div>` : '';

/* highlights on the first device step only (the bracelet, step 2) */
const stepScreen = (n, line, title, how, parts, what, back, art = '', side = '') => { LIT = n <= 2; const h = scr2(`
    ${stepHead(n, line)}
    ${stepBody(title, art, how, side).replace('</p>', `</p>${spot(partDots(parts, 1), 'Each step splits into a couple of small parts, and the dots show which one you are on')}`)}
    ${stepNav(back, spot(statusPill(`Finding ${what}`, '', `view:1B-s${n}c`), 'Once the device is pairing, the phone scans and finds it on its own'))}`, false, LIT ? 'is-spotlit' : ''); LIT = true; return h; };

(() => {
  /* the patch screens become step 3, with no highlights (the bracelet step
     shows them); their Continue leads to step 4 */
  UI2['1B'] = UI2['1B'].replace(' j-spot j-spot--box', '').replace(/<p class="j-spot__tip">[\s\S]*?<\/p>/, '');
  UI2['1B-s3'] = UI2['1B'];
  UI2['1B.ok'] = UI2['1B.ok'].replace('data-tap="toast:Step 4 starts here"', 'data-tap="view:1B-s4"');
  Object.assign(UI2, {
    /* all six steps at a glance, then start */
    '1B': scr2(`
      ${nav('Set up your devices', '6 steps · About 20 minutes')}
      ${/* v04 (28.OCT.2026): the six steps as a receipt, one line each */ ''}
      ${spot(`<ol class="j-steps6 j-steps6--rcpt">${SETUP_STEPS.map((s, k) => `<li class="${k === 0 ? 'is-now' : ''}"><b>${k + 1}</b><span>${s}</span><em>${SETUP_MIN[k]} min</em></li>`).join('')}</ol>`,
        'Six small steps, each one a single action with its own time, so 20 minutes feels doable')}
      <div class="u-thumb j-thumb--top"><p class="j-skip" data-tap="view:ck-1-skip">Skip setup</p>
        ${/* v04 (28.OCT.2026): help is a named person, the study's doctor, as a
           receipt line: her photo, name and role, the number, a call button.
           Dr. Okafor is a placeholder, like Dana and Dr. Patel */ ''}
        <div class="j-co j-co--help"><img class="j-co__av j-co__ph" src="theme-demo/art/dr-okafor.jpg" alt="">
          <div><b>Dr. Maya Okafor</b><em>Study cardiologist</em></div></div>
        ${callOpts('Dr. Okafor')}
        <div class="j-pair j-pair--even"><span class="u-btn u-btn--xl u-btn--ghost j-later" data-tap="view:ck-1-resume">Finish later</span>
        <span class="u-btn u-btn--xl" data-tap="view:1B-s1">Start</span></div></div>`, false, 'is-spotlit'),
    '1B-s1': scr2(`
      ${stepHead(1, 'This takes up to 20 minutes.', 'Where you are in setup and how long is left, updated at every step')}
      ${stepBody('Check your kit', spot(`<div class="j-kit"><span>${cBand}Bracelet</span><span>${gPatch}Patch</span><span>${cBp}BP cuff</span><span>${cWeight}Scale</span></div>`, 'Big pictures and one word each, so checking the kit feels like an easy task'),
        '', '', '')}
      ${stepNav('1B', fwdBtn('1B-s2', 'I have all four'))}`, false, 'is-spotlit'),
    '1B-s2': stepScreen(2, 'About 19 minutes left.', 'Put on your bracelet',
      'Wear it snug on your left wrist and press its button until the light blinks blue.', BAND_PARTS, 'bracelet', '1B-s1', braceletArt(), 'Your left wrist'),
    '1B-s4': stepScreen(4, 'About 9 minutes left.', 'Take your first blood pressure',
      'Hold the button on the cuff for 3 seconds, until the screen shows a phone.', CUFF_PARTS, 'cuff', '1B-s3c', cuffPairArt()),
    '1B-s5': stepScreen(5, 'About 4 minutes left.', 'Take your first weight',
      'Step on it once to wake it, then step off.', SCALE_PARTS, 'scale', '1B-s4c', scaleArt2()),
    '1B-s6': scr2(`
      ${stepHead(6, 'Setup done.').replace('is-now', 'is-on')}
      ${stepBody('You’re all set', '', '')}
      ${spot(`<div class="j-today j-today--dev">
        <span>${cBand}<em>Bracelet</em><b>72 bpm</b><i>12 minutes ago</i><s>✓</s></span>
        <span>${gPatch}<em>Patch</em><b>71 bpm</b><i>8 minutes ago</i><s>✓</s></span>
        <span>${cBp}<em>BP cuff</em><b>121 / 78</b><i>3 minutes ago</i><s>✓</s></span>
        <span>${cWeight}<em>Scale</em><b>197.5 lbs</b><i>Just now</i><s>✓</s></span>
      </div>`, 'Every device checked off with its first reading and when it actually came in')}
      ${stepNav('1B-s6b', fwdBtn('ck-1', 'Done'), false)}`, false, 'is-spotlit'),
  });
})();

/* step-by-step instructions, opened from each reading's start screen */
Object.assign(UI2X, {
  /* v04 (29.OCT.2026): the steps as a numbered receipt under a heading,
     the video as a row, so it matches the app's other sheets */
  'ins.bp': sheet(`<p class="j-sh__k">${cBp}Blood pressure</p>
    <p class="j-helps__k">How to take it</p>
    <ol class="j-fixes">
      <li><b>Sit for 5 minutes first</b>, back supported, feet flat on the floor.</li>
      <li><b>Cuff on your bare left arm</b>, about an inch above the elbow, tube down the middle.</li>
      <li><b>Rest your arm on a table</b> at heart height.</li>
      <li><b>Press Start</b>, then stay still and quiet until it’s done.</li>
    </ol>
    <div class="j-crs--rcpt j-shl j-vidrow"><div class="j-cr" data-tap="toast:The 40-second video plays here"><i class="j-cr__g"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5.5v13l10.5-6.5z"/></svg></i><div class="j-cr__t"><b>Watch how</b></div><em>40 sec</em><span>${chev()}</span></div></div>`),
  'ins.sc': sheet(`<p class="j-sh__k">${cWeight}Weight</p>
    <p class="j-helps__k">How to take it</p>
    <ol class="j-fixes">
      <li><b>Put the scale on a hard, flat floor</b>, not a rug.</li>
      <li><b>Bare feet</b>, and the same time each day if you can.</li>
      <li><b>Step on and stand still</b> until the number stops changing.</li>
      <li><b>Keep your phone nearby</b> so the reading comes through.</li>
    </ol>`),
});

/* ==========================================================================
   The questionnaire, clicked through (08.OCT.2026): the study's four
   check-in questions, one per screen, with big tap targets. Tapping an
   answer moves on; the multi-select ones toggle, then Next. Q4 only shows
   if your medication changed. It ends with complete and how your
   check-ins have gone.
   ========================================================================== */

/* weather marks for how you've been feeling: no faces, just the sky */
const skyG = {
  great: `<svg viewBox="0 0 24 24" class="u-g"><circle cx="12" cy="12" r="4.5"/><path d="M12 2.5v2.5M12 19v2.5M2.5 12H5M19 12h2.5M5.3 5.3l1.8 1.8M16.9 16.9l1.8 1.8M5.3 18.7l1.8-1.8M16.9 7.1l1.8-1.8"/></svg>`,
  good: `<svg viewBox="0 0 24 24" class="u-g"><path d="M7.25 12.03A3.5 3.5 0 1 1 12.29 7.8"/><path d="M9 2.5v1.5M2.5 9H4M4.4 4.4l1.1 1.1M13.6 4.4l-1.1 1.1"/><path d="M8 19.5h9.5a3.5 3.5 0 0 0 .3-7 5 5 0 0 0-9.6 1.2A2.9 2.9 0 0 0 8 19.5z"/></svg>`,
  low: `<svg viewBox="0 0 24 24" class="u-g"><path d="M6.5 17h11a4 4 0 0 0 .4-8 6 6 0 0 0-11.6 1.5A3.3 3.3 0 0 0 6.5 17z"/><path d="M8.5 20l-.8 1.5M12.5 20l-.8 1.5M16.5 20l-.8 1.5"/></svg>`,
};

/* a question screen: close, progress, the question, the answers */
/* one question: Back to the one before (no ✕), and a note that answers are
   saved as you go, so stopping halfway loses nothing. `next`: a Next button
   for questions where you tick several */
/* the question's header: Back, where you are, and the bar */
const qHead = (n, total) => `<div class="j-hd j-qhd"><div class="j-rd__top"><p class="j-back" data-tap="back">${chev()} Back</p><span class="j-qp">Question ${n} of ${total}</span></div>
    <div class="j-seg j-seg--${total}">${Array.from({ length: total }, (_, k) => `<i class="${k < n - 1 ? 'is-on' : k === n - 1 ? 'is-now' : ''}"></i>`).join('')}</div></div>`;
const qScreen = (n, total, q, answers, next = '') => scr2(`
    ${qHead(n, total)}
    ${spot(`<p class="j-q__t">${q}</p>`, 'One question at a time, big and on its own, so it is quick to read and answer')}
    <div class="j-qas">${answers}</div>
    <div class="u-thumb j-qfoot">${spot('<p class="j-qsave">Answers save as you go.</p>', 'Answers save as you go, so stopping halfway loses nothing')}${next ? qNext(next) : ''}</div>`, false, 'is-spotlit');

/* an answer that moves on when tapped */
const qGo = (label, to, g = '') => `<span class="j-qa" data-tap="view:${to}">${g ? `<i>${g}</i>` : ''}<b>${label}</b></span>`;
/* an answer you can tick, among several */
const qTick = (label, on) => `<span class="j-qa j-qa--tick ${on ? 'is-open' : ''}" data-tap="toggle"><s></s><b>${label}</b></span>`;
/* Next sits in the question's bottom bar, under the note that answers save */
const qNext = (to) => `<span class="u-btn u-btn--xl" data-tap="view:${to}">Next</span>`;

Object.assign(UI2, {
  /* the start: four questions, about 2 minutes */
  /* what it asks. v03 (21.OCT.2026): no "last time" card. Seeing how you
     answered before can bias today's answer, so past answers aren't shown */
  '4D': reading('Questionnaire', 'About 2 minutes', `<div class="j-qpre">
      <p class="j-helps__k">What it asks</p>
      <ol class="j-qlist j-qlist--rcpt"><li><b>1</b>How you feel</li><li><b>2</b>New symptoms</li><li><b>3</b>Medication changes</li></ol>
    </div>`,
    '',
    `<span class="u-btn u-btn--xl" data-tap="view:q1">Start</span>`, false),


  /* question 1 goes straight to the complete screen in the prototype;
     questions 2 to 4 (symptoms, medication) are kept below but not shown */
  'q1': qScreen(1, 4, 'Over the past 7 days, how have you been feeling overall?',
    qGo('I feel great, with no health issues', 'q-done', skyG.great) +
    qGo('I feel good, with a few minor health issues', 'q-done', skyG.good) +
    qGo('I don’t feel very well', 'q-done', skyG.low)),

});
UI2['q2'] = qScreen(2, 4, 'Since your last questionnaire, any new or worse symptoms?',
  qTick('No, I feel the same', true) +
  qTick('Shortness of breath') +
  qTick('Swelling in ankles, feet or legs') +
  qTick('Dizziness or feeling faint') +
  qTick('More tired than usual'), 'q3');
Object.assign(UI2, {
  'q3': qScreen(3, 4, 'Any changes to your heart or blood pressure medication?',
    qGo('No', 'q-done') + qGo('Yes', 'q4')),
  'q4': qScreen(4, 4, 'What changed? Select all that apply.',
    qTick('I started a new medication', true) +
    qTick('I stopped a medication') +
    qTick('My dose changed') +
    qTick('I’m not sure'), 'q-done'),

  /* done: complete (no history of past answers, see 4D; 30.OCT.2026: no fun fact) */
  'q-done': scr2(`
    ${qHead(4, 4)}
    <p class="j-rd__t">Questionnaire complete</p>
    <p class="j-rd__l">Thanks. Your answers are saved with your heart data.</p>
    <div class="u-thumb"><span class="u-btn u-btn--xl" data-tap="view:ck-2">Done</span></div>`, false),
});

/* Previous beside the main button wherever going back makes sense:
   instructions and steps in progress. Results, "done" screens and the
   first screen of a concept keep their one button */
/* v03: not the setup overview (1B), whose top arrow already goes back */
['4D', '5B', '10B-ready', 'rd-sc', 'rd-sc7', 'v2-1-patch', 'v2-4-share'].forEach((id) => {
  if (!UI2[id]) return;
  UI2[id] = UI2[id].replace(/<p class="j-back" data-tap="back">[\s\S]*?<\/p>/, '<span></span>')
    .replace(/<div class="u-thumb( j-thumb--note)?">([\s\S]*?)(<span class="u-btn u-btn--xl")/,
    '<div class="u-thumb j-pair$1">$2<span class="u-btn u-btn--xl u-btn--ghost" data-tap="back">Back</span>$3');
});

/* each device's connect screen, the last of its parts: the scanner runs on
   its own for 3 seconds, then Connecting turns into Next */
const waitNext = (to, near, retry = '') => `<span class="u-btn u-btn--xl is-gated j-wait-btn" data-gate="connect" ${retry ? `data-retry="${retry}" ` : ''}data-gate-tap="step" data-tap="view:${to}"><span class="j-wait-btn__s" role="status"><i></i>Connecting</span><span class="j-wait-btn__e">Try again</span><span class="j-wait-btn__go">Next</span></span>`;
/* `short`: the device is already close, so it starts at Almost there (a quicker demo) */
/* SHOW_DISTANCE (21.OCT.2026): the "Too far" and "Getting closer" states
   are off for now, so every connect starts at Almost there. Kept, not
   deleted: set true to bring the distance screens back */
const SHOW_DISTANCE = false;
/* `got`: the first reading the device sent, shown once connected so you can
   see the data arrived: [what it is, the value, when] */
const gotCard = ([k, v, when]) => spot(`<div class="j-got"><em>${k}</em><b>${v}</b><span>Received ${when}</span></div>`, 'The first reading shows up right away, so you know the device works and you did it right');
/* `fail`: the first try drops out partway (an error, with Try again and
   Call Dana); trying again then connects as normal */
const ddError = (g, key, what, fix) => `
  <div class="j-dd is-err">
    <span class="j-dd__dev">${g}</span>
    <span class="j-dd__x" aria-hidden="true">✕</span>
    <span class="j-dd__ph">!</span>
  </div>
  <p class="j-dd__w">Couldn’t connect</p>
  <p class="j-dd__l">The ${what} stopped responding. ${fix}</p>
  <div class="j-dd__help">${danaCard()}</div>`;
/* help from a real person: Dana, the study coordinator, one tap to message.
   Her photo is a free Unsplash stock portrait (photo-1573497019940), linked */
const DANA_PHOTO = 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=120&h=120&fit=crop&crop=faces&q=80';
const danaAv = () => `<span class="j-dana__av j-dana__av--ph" aria-hidden="true"><img src="${DANA_PHOTO}" alt=""></span>`;
const gMsgD = `<svg viewBox="0 0 24 24" class="u-g" aria-hidden="true"><path d="M4.5 5.5h15a1 1 0 0 1 1 1v9a1 1 0 0 1-1 1H10l-4.5 3.5v-3.5h-1a1 1 0 0 1-1-1v-9a1 1 0 0 1 1-1Z"/></svg>`;
const danaCard = () => `<div class="j-dana" data-tap="view:tm-new">
    ${danaAv()}
    <div><em>Message</em><b>Dana Reyes</b><span>Study coordinator</span></div>
    <i class="j-dana__msg" aria-label="Message Dana">${gMsgD}</i></div>`;
/* the study team's phone line, beside messaging Dana (v03) */
const gCallF = `<svg viewBox="0 -960 960 960" class="u-g" aria-hidden="true"><path d="M795-120q-116 0-236.5-56T335-335Q232-438 176-558.5T120-795q0-19 13-32t32-13h140q14 0 24 10t14 25l27 126q2 14-.5 25.5T359-634L259-533q26 44 55 82t64 72q37 38 78 69.5t86 55.5l95-98q10-11 23-15t26-2l119 26q15 4 25 16t10 27v135q0 19-13 32t-32 13Z"/></svg>`;
/* v04 (30.OCT.2026): the study phone can't make phone calls, so a contact
   has two ways to call, as two receipt rows: in the app (the messages'
   call button, over Wi-Fi), or from your own phone to the number, where a
   voicemail gets a call back within 2 hours. A function, so screens drawn
   before this point can use it */
function callOpts(who) {
  /* 30.OCT.2026: a message is the main way in. The team gets it as an
     email and replies by email; the reply shows here in the app. Calling
     from your own phone is the fallback, a link under the button */
  const Who = who[0].toUpperCase() + who.slice(1);
  return `<div class="j-cop" role="group" aria-label="Ways to reach ${who}">
    <span class="j-cop__msg" role="button" data-tap="toast:Message received. ${Who} will reply here within 2 hours"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4.5 4h15A1.5 1.5 0 0 1 21 5.5v10a1.5 1.5 0 0 1-1.5 1.5H10l-4.6 3.6c-.4.3-.9 0-.9-.4V17h0A1.5 1.5 0 0 1 3 15.5v-10A1.5 1.5 0 0 1 4.5 4z"/></svg>Message ${who}</span>
    <p class="j-cop__alt">Reply in 2 hrs, or call <b role="button" data-tap="toast:Call (617) 555-0142 from your own phone. Leave a voicemail, back in 2 hrs">(617) 555-0142</b></p></div>`;
}
const callCard = () => callOpts('the study team');
const connectScreen = ({ key, g, what, head, title, parts, near, back, next, short = false, got, fail = '', kit = 0 }) => {
  /* highlights on the bracelet's connect screen only */
  LIT = key === 'cn.band';
  /* the kit shows only once connected, with this device newly lit */
  const was = '', now = spot(kitStrip(kit + 1), 'Each connected device lights up and gets a tick, so you can see how far along setup is');
  Object.assign(UI2X, {
    ...(fail ? {
      [`${key}.warm1`]: ddBlock(g, 'warm', 'Getting closer', 'Keep going.', 5, `${key}.err`) + was,
      [`${key}.err`]: ddError(g, key, what, fail) + was,
    } : {}),
    [`${key}.warm`]: ddBlock(g, 'warm', 'Getting closer', 'Keep going.', 5, `${key}.hot`) + was,
    [`${key}.hot`]:  ddBlock(g, 'hot', 'Almost there', 'Hold your phone still.', 2, `${key}.ok`) + was,
    [`${key}.ok`]:   ddBlock(g, 'done', 'Connected', `Your ${what} is working.`, 0, '', got ? gotCard(got) : '') + now,
  });
  const h = scr2(`
    ${head}
    <p class="u-lead j-step__t">${title}</p>${partDots(parts, parts.length)}
    <div class="j-stepvis"><div class="j-cn" data-morph>${short || !SHOW_DISTANCE ? UI2X[`${key}.hot`] : ddBlock(g, 'cold', 'Too far', `Bring your phone toward the ${what}.`, 9, fail ? `${key}.warm1` : `${key}.warm`) + was}</div></div>
    ${stepNav(back, waitNext(next, `hold your phone ${near}`, fail ? `morph:${key}.warm` : ''))}`, false, LIT ? 'is-spotlit' : '');
  LIT = true;
  return h;
};
Object.assign(UI2, {
  '1B-s2c': connectScreen({ key: 'cn.band', g: cBand, what: 'bracelet', head: stepHead(2, 'About 15 minutes left.'),
    title: 'Put on your bracelet', kit: 0, parts: BAND_PARTS, near: 'near your wrist', back: '1B-s2', next: '1B-s3', got: ['Heart rate', '72 bpm', 'just now'] }),
  '1B-s3c': connectScreen({ key: 'cn.patch', g: gPatch, what: 'patch', head: `
    <div class="u-nav"><b>Step 3 of 6</b><span class="j-help" data-tap="sheet:1B.help">Help</span></div>
    <div class="j-seg j-seg--6"><i class="is-on"></i><i class="is-on"></i><i class="is-now"></i><i></i><i></i><i></i></div>
    <p class="j-cheer">About 16 minutes left.</p>`,
    title: 'Put on your patch', kit: 1, parts: PATCH_PARTS.map((p) => p[0]), near: 'near your chest', back: '1B-s3', next: '1B-s4', short: true, got: ['Heart rhythm', 'Recording, 71 bpm', 'just now'] }),
  '1B-s4c': connectScreen({ key: 'cn.cuff', g: cBp, what: 'cuff', head: stepHead(4, 'About 6 minutes left.'),
    title: 'Take your first blood pressure', kit: 2, parts: CUFF_PARTS, near: 'near the cuff', back: '1B-s4', next: '1B-s5', short: true, got: ['Blood pressure', '121 / 78', 'just now'] }),
  '1B-s5c': connectScreen({ key: 'cn.scale', g: cWeight, what: 'scale', head: stepHead(5, 'About 3 minutes left.'),
    title: 'Take your first weight', kit: 3, parts: SCALE_PARTS, near: 'near the scale', back: '1B-s5', next: '1B-s6a', short: true, got: ['Weight', '197.5 lbs', 'just now'] }),
});

/* step 6 (30.OCT.2026): with the devices in, two choices about notifications:
   whether they're read aloud, with a sample to help decide, and the sleep
   window, when they stay silent. Both can change later in Settings */
Object.assign(UI2, {
  '1B-s6a': scr2(`
    ${stepHead(6, 'About 1 minute left.')}
    ${stepBody('Hear your notifications read aloud?', '', 'The phone can read each notification to you, so you don’t need to look at the screen.')}
    <div class="j-tgl" data-tap="toggle" role="switch" aria-checked="false"><span><b>Read notifications aloud</b><em>You can change this in Settings</em></span><i aria-hidden="true"></i></div>
    <span class="j-rd__how" data-tap="toast:Plays “Time for your evening blood pressure”">Play a sample ${chev()}</span>
    ${stepNav('1B-s5c', fwdBtn('1B-s6b', 'Next'), false)}`, false),
  '1B-s6b': scr2(`
    ${stepHead(6, 'Almost done.')}
    ${stepBody('Set your sleep window', '', 'Notifications stay silent during these hours. You can change this in Settings.')}
    ${setTime('sleep-from', 'Silent from', '22:00')}
    ${setTime('sleep-to', 'Until', '07:00')}
    ${stepNav('1B-s6a', fwdBtn('1B-s6', 'Next'), false)}`, false),
});

/* step 3's help, behind the Help button at the top right */
Object.assign(UI2X, {
  '1B.help': sheet(`<p class="j-sh__k">${gPatch}Help with the patch</p>
    <div class="j-helps">
    <div class="j-fix" id="j-fix-1" data-tap="toggle">
      <p class="j-fix__q"><i class="j-fix__i">?</i>Light not green after a minute?${chev('down')}</p>
      <div class="j-fix__a"><p class="j-fix__k">Do this instead</p>
        ${fixList()}
        <span class="j-st__a" data-tap="toast:A message to the study team opens here">Still nothing? Message the study team</span></div>
    </div>
    <div class="j-fix" data-tap="toggle">
      <p class="j-fix__q"><i class="j-fix__i">i</i>Taking it off at the end of the week${chev('down')}</p>
      <div class="j-fix__a">
        <ol class="j-fixes">
          <li><b>Lift one end</b> with your fingernail.</li>
          <li><b>Peel slowly, low and close to your skin</b>, folding it back on itself.</li>
          <li>Put it in <b>the trash, not the recycling</b>.</li>
        </ol>
        <p class="j-fix__tip"><b>Tip:</b> after a warm shower it comes off more easily.</p></div>
    </div></div>
  `),
});

/* ==========================================================================
   Spotlights (09.OCT.2026): a feature shown where it lives, lit like an
   onboarding coach mark, the rest of the real screen dimmed. Tapping the
   lit part opens the full screen, which has a way back. 3.6 trivia (home),
   3.5 streak (home), and badges (Resources).
   ========================================================================== */



/* a back link at the top of a full screen, to where it was opened from */
const withBack = (html, to, label) => html.replace('<div class="u-body">', `<div class="u-body">${BACK_P(`view:${to}`, label)}`);

/* the Resources tab: everything you look back on, one row each */
/* a receipt line in a sheet: icon, name, short value, chevron (v04) */
const rcRow = (g, name, val, tap) => `<div class="j-cr" data-tap="${tap}"><i class="j-cr__g">${g}</i><div class="j-cr__t"><b>${name}</b></div><em>${val}</em><span>${chev()}</span></div>`;
const resRow = (g, name, line, to) => `<span class="j-res" ${to ? `data-tap="view:${to}"` : ''}><i>${g}</i><span><b>${name}</b><em>${line}</em></span><s>${chev()}</s></span>`;
const resources = (lit, tip) => {
  const rows = [
    ['health', mHealth, 'Your health', 'Vitals, last 3 weeks', 'v2-3-dash'],
    ['done', mDone, 'What you’ve done', 'Everything sent so far', 'v2-3-tally'],
    ['badges', mMedal, 'Badges', '2 earned, $4 in bonuses', 'v2-3-badges-full'],
    ['earn', mPay, 'Earnings', '$44 so far', '16A'],
    ['community', mForum, 'Community', 'Questions from other participants', 'v2-3-community'],
  ];
  return scr2(`
    ${nav('Library')}
    <div class="j-ress">${rows.map(([k, g, n, l, to]) => k === lit
      ? spot(resRow(g, n, l, ''), tip, to)
      : resRow(g, n, l, to)).join('')}</div>`, 1, 'is-spotlit');
};

(() => {
  /* full screens keep their content, with a way back */
  UI2['v2-3-streak-full'] = withBack(UI2['v2-3-streak'], 'v2-3-streak', 'Today');
  UI2['v2-3-badges-full'] = withBack(UI2['v2-3-badges'], 'v2-3-badges', 'Library');
  Object.assign(UI2, {
    /* 3.3: the streak, on the home screen above the checklist */
    'v2-3-streak': home3({ day: 17, spotlit: true, skip: 'streak', below: homeBelow(17, 30), tasks: routineTasks(null),
      top: spot(card(`<div class="j-sk__mini"><span class="j-sk__n j-sk__n--sm">17</span>
        <div><p class="u-lead">17-day streak, readings in every day</p><p class="u-note">4 more days to a $2 bonus</p></div></div>`, 'u-card--edge'),
        'Your streak counts every day your data comes through', 'v2-3-streak-full') }),
    /* badges, on the Resources tab */
    'v2-3-badges': resources('badges', 'Badges live here, and each one adds a small cash bonus'),
  });
})();

/* ==========================================================================
   The Resources tab, as one page (09.OCT.2026): everything you look back
   on or reach for, grouped, each row opening its screen. The Resources
   tab always opens this page; Home opens the day's checklist.
   ========================================================================== */
/* v03: badges fold into earnings as milestone bonuses (R1: "a sticker"
   alone means nothing), and staying a year keeps the study phone (F4) */
UI2['16A'] = scr2(`
  ${nav('Your earnings', 'Cycle 1 · Week 5')}
  ${card(`<p class="u-num u-num--c">$44</p>
    <p class="u-note u-note--c">earned so far</p>
    <div class="u-prog"><i style="width:24%"></i></div>
    <p class="u-note u-note--c">Next: $30 at your day 30 check-in</p>`, 'u-card--edge')}
  ${sec('Payments')}
  ${rows([['Patch week', 'Paid, $40'], ['Day 30', '$30'], ['Day 60', '$50'], ['Day 90', '$60']])}
  ${sec('Milestone bonuses')}
  <div class="j-bgs">
    ${gBadge('7', 'First week', '$2 added', 'got')}
    ${gBadge('14', 'Streak', '$2 added', 'got')}
    ${gBadge('10', 'Question&shy;naires', '$2, 1 to go', 'next')}
    ${gBadge('30', 'First month', '$5', 'locked')}
    ${gBadge('60', 'Two months', '$5', 'locked')}
    ${gBadge('90', 'All 90 days', '$10', 'locked')}
  </div>
  ${card(yearPhone(29, 'Stay a year, keep the phone'), 'j-yr')}`, 1);
/* Day 54: the next report's bar on the home screen is all 4.6 keeps; it
   shows in the month's last week, counting down to the check-in */
UI2['9D'] = home3({ day: 54, top: spot(nextReport(54), 'How far you are from your next monthly report') + triviaCard(54), below: homeBelow(54, 30) + communityBelow(), tasks: routineTasks() });

/* v03: a vital's own screen, opened from its tile on the home screen
   (Resources no longer has a readings row). Its trend since day 1, then
   every reading with its time, newest first, and all of it as a file to
   keep (participants asked for their own stats, F-11A). Drawn for the day
   it is opened on, so the latest reading matches the tile */
const TRENDS = {
  /* name, device, column heads, latest, wobble, drift a day (back in time),
     a reading from a number, readings a day */
  sleep: ['Sleep', 'Bracelet', ['Night', 'Asleep', 'Bedtime'], 412, 24, -1.4,
    (v, k) => [`${Math.floor(v / 60)}h ${String(Math.round(v % 60)).padStart(2, '0')}m`, `${10 + (k % 3 === 1 ? 1 : 0)}:${String((k * 17) % 60).padStart(2, '0')} PM`], 1],
  hr: ['Resting heart', 'Bracelet', ['Day', 'Resting', 'Lowest'], 66, 1.6, 0.14,
    (v) => [`${Math.round(v)} bpm`, `${Math.round(v) - 7} bpm`], 1],
  bp: ['Blood pressure', 'BP cuff', ['When', 'Reading', 'Pulse'], 119, 2.4, 0.1,
    (v, k) => [`${Math.round(v)} / ${Math.round(v * .65)}`, `${64 + (k % 4)}`], 2],
  weight: ['Weight', 'Scale', ['When', 'Weight', 'Change'], 197.0, .3, .05,
    (v, k, prev) => [`${v.toFixed(1)} lbs`, prev == null ? '' : `${v - prev >= 0 ? '+' : '−'}${Math.abs(v - prev).toFixed(1)}`], 1],
  steps: ['Steps', 'Bracelet', ['Day', 'Steps', 'Active'], 5420, 700, -18,
    (v) => [Math.round(v).toLocaleString('en-US'), `${Math.round(v / 160)} min`], 1],
};
const trendView = (m, day) => {
  const [name, device, head, last, wob, drift, fmt, perDay] = TRENDS[m];
  /* the same made-up history every time: a gentle wobble on a slow drift */
  const at = (k) => last + (k ? wob * (Math.sin(k * 1.7) * .6 + Math.sin(k * .9 + 1) * .4) : 0) + drift * k;
  const when = (d) => (d === day ? 'Today' : d === day - 1 ? 'Yesterday' : shortDate(dateOf(d)));
  const rows = [];
  for (let d = day; d >= 1 && rows.length < 14; d--) {
    const k = day - d, v = at(k);
    for (let r = perDay; r >= 1 && rows.length < 14; r--) {
      const t = perDay > 1 ? `, ${r === 2 ? '8:02 PM' : '7:41 AM'}` : m === 'weight' ? ', 7:45 AM' : '';
      rows.push([when(d) + t, ...fmt(perDay > 1 && r === 1 ? v + 1.5 : v, k, d > 1 ? at(k + 1) : null)]);
    }
  }
  const nowV = fmt(last, 0, null)[0];
  /* v04 (28.OCT.2026): latest, the summary since day 1 (average, low,
     high) and the chart in one block. The chart plots every reading (two a
     day for blood pressure) on a y-axis with its high and low, the average
     dashed across; a finger on it reads out the reading under it */
  const pts = [];
  for (let d = 1; d <= day; d++) {
    const k = day - d;
    for (let r = 1; r <= perDay; r++) {
      const v = perDay > 1 && r === 1 ? at(k) + 1.5 : at(k);
      const t = perDay > 1 ? `, ${r === 1 ? '7:41 AM' : '8:02 PM'}` : '';
      pts.push([when(d) + t, fmt(v, k, d > 1 ? at(k + 1) : null)[0], v]);
    }
  }
  if (pts.length === 1) pts.unshift(pts[0]);
  const vs = pts.map((x) => x[2]), lo = Math.min(...vs), hi = Math.max(...vs), avg = vs.reduce((a, v) => a + v, 0) / vs.length;
  const fmtV = (v) => fmt(v, 0, null)[0];
  /* the axis numbers, short: the top reading (systolic for blood pressure) */
  const tick = (v) => m === 'sleep' ? `${Math.floor(v / 60)}h${String(Math.round(v % 60)).padStart(2, '0')}`
    : m === 'weight' ? v.toFixed(1) : m === 'steps' ? `${(v / 1000).toFixed(1)}k` : `${Math.round(v)}`;
  /* blood pressure draws both numbers on one mmHg axis: systolic in
     Prolaio purple, diastolic in a lighter purple, each named at its end */
  const two = m === 'bp', dia = (v) => v * .65;
  const cLo = two ? Math.min(...vs.map(dia)) : lo, cHi = hi;
  const y = (v) => 10 + 80 * (v - cLo) / ((cHi - cLo) || 1), x = (i) => i / (pts.length - 1) * 100;
  const lineOf = (f) => pts.map((q, i) => `${(x(i) * 2).toFixed(1)},${(64 - y(f(q[2])) * .64).toFixed(1)}`).join(' ');
  const line = lineOf((v) => v), line2 = two ? lineOf(dia) : '';
  const data = encodeURIComponent(JSON.stringify(pts.map((q, i) => [q[0], q[1], +x(i).toFixed(2), +y(q[2]).toFixed(2)].concat(two ? [+y(dia(q[2])).toFixed(2)] : []))));
  const dotsOf = (f, c) => pts.length <= 16 ? pts.map((q, i) => `<i class="j-trv__pt${c}" style="left:${x(i).toFixed(2)}%;bottom:${y(f(q[2])).toFixed(2)}%"></i>`).join('') : '';
  const dots = dotsOf((v) => v, '') + (two ? dotsOf(dia, ' is-dia') : '');
  const lastV = vs[vs.length - 1];
  /* the summary as a range strip: low to high since day 1, the average a
     tick on it, the latest reading a dot, so where today sits reads at once */
  const at01 = (v) => (hi - lo ? (v - lo) / (hi - lo) * 100 : 50).toFixed(1);
  const vsAvg = vs[vs.length - 1] - avg, near = Math.abs(vsAvg) < (hi - lo) * .15 || hi === lo;
  const top = `<div class="j-trv__top"><p class="j-trv__k">Latest</p><b class="j-trv__n">${nowV}</b>
      <em class="j-trv__vs">${near ? 'Close to your average' : vsAvg > 0 ? 'Above your average' : 'Below your average'}</em></div>
    <div class="j-trv__rng" role="img" aria-label="Since day 1: low ${fmtV(lo)}, average ${fmtV(avg)}, high ${fmtV(hi)}; latest ${nowV}">
      <p class="j-trv__lnow" style="left:${Math.min(90, Math.max(10, +at01(vs[vs.length - 1])))}%">Latest</p>
      <div class="j-trv__bar"><i class="j-trv__bavg" style="left:${at01(avg)}%"></i><i class="j-trv__bnow" style="left:${at01(vs[vs.length - 1])}%"></i></div>
      <p class="j-trv__rl"><span>Low <b>${fmtV(lo)}</b></span><span class="j-trv__lavg" style="left:${Math.min(64, Math.max(36, +at01(avg)))}%">Your average <b>${fmtV(avg)}</b></span><span>High <b>${fmtV(hi)}</b></span></p>
    </div>`;
  return scr2(`
  <div class="j-trv__nav"><span class="j-trv__bk" data-tap="back" role="button" aria-label="Back to Today"><svg viewBox="0 0 10 10" aria-hidden="true"><path d="M6.4 1.8 3.2 5l3.2 3.2"/></svg></span>
    <span class="j-trv__acts"><i data-tap="toast:Every ${name.toLowerCase()} reading downloads as a CSV file" role="button" aria-label="Download">${gDl}</i><i data-tap="sheet:tr.share" role="button" aria-label="Share">${gShr}</i></span></div>
  ${nav(name, `<i class="j-trv__dev" role="img" aria-label="${device}">${({ Bracelet: cBand, 'BP cuff': cBp, Scale: cWeight })[device] || device}</i>`)}
  ${card(`${top}
    <div class="j-trv__ch">
      <div class="j-trv__y" aria-hidden="true"><span style="bottom:${y(cHi)}%">${tick(cHi)}</span>${tick(cLo) !== tick(cHi) ? `<span style="bottom:${y(cLo)}%">${tick(two ? Math.round(cLo) : cLo)}</span>` : ''}</div>
      <div class="j-trv__plot${two ? ' is-two' : ''}" data-pts="${data}" role="img" aria-label="${name} since day 1, from ${fmtV(lo)} to ${fmtV(hi)}, now ${nowV}">
        <s class="j-trv__grid" style="bottom:${y(cHi)}%"></s><s class="j-trv__grid" style="bottom:${y(cLo)}%"></s>
        ${two
    /* v04 (29.OCT.2026): blood pressure as one bar per reading on the one
       mmHg axis, diastolic at its foot and systolic at its top: a soft bar
       with its top edge dark purple and its foot light purple; Sys and Dia
       named level with the last bar's ends; a touch lights the bar under it */
    ? `${pts.map((q, i) => `<i class="j-bpb${i === pts.length - 1 ? ' is-now' : ''}" data-i="${i}" style="left:${x(i).toFixed(2)}%;bottom:${y(dia(q[2])).toFixed(2)}%;height:${(y(q[2]) - y(dia(q[2]))).toFixed(2)}%"></i>`).join('')}
        <b class="j-trv__lab" style="bottom:${y(lastV).toFixed(1)}%">Sys</b><b class="j-trv__lab is-dia" style="bottom:${y(dia(lastV)).toFixed(1)}%">Dia</b>`
    : `<svg class="j-trv__svg" viewBox="0 0 200 64" preserveAspectRatio="none"><polyline points="${line}"/></svg>
        <i class="j-trv__avg" style="bottom:${y(avg).toFixed(1)}%"></i>${dots}<i class="j-trv__dot" style="bottom:${y(lastV).toFixed(1)}%"></i>`}
      </div>
    </div>
    <p class="j-trv__ax"><span>Day 1</span><span>${two ? 'mmHg' : 'Average, dashed'}</span><span>Today</span></p>`, 'j-trv')}
  ${sec('Every reading')}
  ${card(`<table class="j-raw">
      <thead><tr>${head.map((h) => `<th>${h}</th>`).join('')}</tr></thead>
      <tbody>${rows.map((r) => `<tr>${r.map((c) => `<td>${c}</td>`).join('')}</tr>`).join('')}</tbody>
    </table>`, 'j-trv__raw')}
  <p class="u-note j-trv__note">Each study decides whether trends and past readings show.</p>`, 0);
};
/* v04 (28.OCT.2026): download and share sit in the back row of a vital's
   screen; share slides up where to send it */
const gDl = `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 4v11M7 10l5 5 5-5M5 19h14"/></svg>`;
const gShr = `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 15V4M8 8l4-4 4 4M7 11H6a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-6a2 2 0 0 0-2-2h-1"/></svg>`;
const shrRow = (d, name, val, toast) => `<div class="j-cr" data-tap="toast:${toast}"><i class="j-cr__g j-shr__g"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="${d}"/></svg></i><div class="j-cr__t"><b>${name}</b></div><em>${val}</em><span></span></div>`;
UI2X['tr.share'] = sheet(`<p class="j-sh__k"><i class="j-shr__g">${gShr}</i>Share your readings</p>
  <div class="j-crs--rcpt j-shl">
    ${shrRow('M4 6h16v12H4zM4 7l8 6 8-6', 'Email me a PDF', 'PDF', 'A PDF of your readings is on its way to your email')}
    ${shrRow('M7 4v5a4 4 0 0 0 8 0V4M11 13v2a4 4 0 0 0 8 0v-2M19 11a2 2 0 1 0 0 .01', 'Send to my doctor', 'PDF', 'Choose your doctor’s email or fax')}
    ${shrRow('M8 3h8a1 1 0 0 1 1 1v16a1 1 0 0 1-1 1H8a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1zM11 18h2', 'Send to my phone', 'Link', 'A link to your readings is sent to your phone by text')}
    ${shrRow('M9 11a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM3 20a6 6 0 0 1 12 0M16 5a3 3 0 0 1 0 6M18 14a5 5 0 0 1 3 6', 'Share with friends', 'Image', 'Opens your phone’s share menu with a picture of the chart')}
  </div>`);

/* study updates from Library (v03): the same page, without the day-80
   label, since it can be opened on any day; its Library copy adds the
   way back */
UI2['rn-res'] = UI2['rn'].replace(/(<div class="u-nav"><b>Study updates<\/b>)<span[^>]*>[^<]*<\/span>/, '$1<span></span>');

/* each row: icon, name, line, screen, the day it opens. Cut in v03:
   badges (now in earnings), your region (legal, F3), the next report row
   (its bar is on the home screen). Share the study stays from day 1 (F5).
   Day 1 is kept short: status, the setup readings and referral. Each row
   opens when there is something behind it: earnings
   after week one */
const RES_GROUPS = [
  /* v03: no Getting started. Your first month, the roadmap and this week
     are the ☰ drawer's views, and device setup is in Help. Readings and
     their history open from the health tiles on the home screen */
  ['Your data', [
    [mWeekDone, 'Your first week', 'How each part went', '1D', 8],
    [mDone, 'What you’ve done', 'Everything sent so far', 'v2-3-tally', 7],
  ]],
  ['Your participation', [
    [mPay, 'Earnings', 'Payments and milestone bonuses', '16A', 8],
    [mFlame, 'Your streak', 'Days in a row with readings in', 'v2-3-streak-full', 3],
    [mQuiz, 'Daily trivia', 'One question a day', 'v2-3-poll', 3],
  ]],
  ['Reports', [
    [cReport, 'Monthly reports', 'Yours, a piece at a time', '15D', 30],
  ]],
  ['The study', [
    [mForum, 'Community', 'Questions from other participants', 'v2-3-community', 1],
    [mImpact, 'Impact', 'What your 90 days added up to', 'v2-4-impact', 90],
    [gBell, 'Study updates', 'Changes to the study', 'rn-res', 1],
    [mRefer, 'Referral', 'Pass the study on to someone', 'v2-4-share-study', 1],
  ]],
];
/* every row opens a copy of its screen under Resources: the Resources
   tab lit and a way back to this page, so looking something up never
   lands you on the home screen or leaves you without a back link. Trivia
   opens the question itself, not the home screen it is spotlit on */
const RES_VIA = { 'v2-3-poll': 'v2-3-trivia' };
const RES_TITLE = { '7A': 'Status' };
const asRes = (id, html) => html
    .replace(/<div class="u-back"[^>]*>[^<]*<\/div>/, '')
    /* inside the sticky header, so it stays in view as the screen scrolls;
       v04 (29.OCT.2026): a plain back chevron on the top bar's row, like the
       other pages with a back arrow, not a "‹ Resources" text link */
    .replace(html.includes('<div class="j-hd">') ? '<div class="j-hd">' : '<div class="u-body">', (m) => `${m}<p class="j-back" data-tap="view:res-hub" aria-label="Back to Library">${chev()}</p>`)
    .replace(/<div class="j-tabs">[\s\S]*?<\/div>/, tabs2(1))
    .replace(/(<div class="u-nav"><b>)Home(<\/b>)/, `$1${RES_TITLE[id] || 'Home'}$2`);
RES_GROUPS.forEach(([, rows]) => rows.forEach((r) => {
  const id = RES_VIA[r[3]] || r[3], html = UI2[id];
  if (!html) return;
  UI2['res.' + id] = asRes(id, html);
  r[3] = 'res.' + id;
}));
/* links between them stay inside Resources too: Your first month's
   Roadmap opens the roadmap's Resources copy, not the Home one */
Object.keys(UI2).filter((k) => k.startsWith('res.')).forEach((k) => {
  UI2[k] = UI2[k].replace(/data-tap="view:([^"]+)"/g, (m, to) => UI2['res.' + to] && 'res.' + to !== k ? `data-tap="view:res.${to}"` : m);
});
/* the page, with one row optionally lit as a coach mark; lit, it opens
   scrolled to that row's group so the light is in view */
/* v03: the page as it is on a given day; a row not open yet isn't shown.
   Live figures follow the day */
const resLine = (n, l, day) => n === 'Earnings' && day >= 8 ? `$${earnedBy(day)} so far, with bonuses`
  : n === 'Your streak' ? `${streakBy(day)} days in a row with readings in` : l;
/* v03: three rows look like what they do, not like the menu rows around
   them. Status is a live state (a dot and a line), Your readings previews
   the newest numbers, and referral is an invitation with its own button */
const resRead = (day) => day < 2 ? [['BP', '121/78'], ['Weight', '197.5'], ['Heart', '72']]
  : [['BP', '118/76'], ['Weight', '196.1'], ['Sleep', '6h 48m']];
const RES_LOOK = {
  /* v03 (22.OCT.2026): the state on two lines, the devices on the right.
     When one stops syncing the line says which and since when, its icon is
     flagged, and Fix opens the steps to try (ts-1) */
  'Status': (g, n, l, to, day = 16) => syncIssue(day)
    ? `<span class="j-res j-res--status is-warn" data-tap="view:ts-1">
    <i class="j-res__dot" aria-hidden="true"></i><span class="j-st__t"><b>Bracelet isn’t syncing</b><em>Last synced yesterday, 9:12 PM</em></span>
    <span class="j-st__devs"><i class="is-warn">${cBand}</i></span><span class="j-st__fix">Fix</span></span>`
    : `<span class="j-res j-res--status" ${to ? `data-tap="view:${to}"` : ''}>
    <i class="j-res__dot" aria-hidden="true"></i><span class="j-st__t"><b>All devices syncing</b><em>Last sync 7:45 AM</em></span>
    <span class="j-st__devs" aria-label="Bracelet, cuff and scale">${[cBand, cBp, cWeight].map((x) => `<i>${x}</i>`).join('')}</span></span>`,
  'Your readings': (g, n, l, to, day) => `<span class="j-res j-res--data" ${to ? `data-tap="view:${to}"` : ''}>
    <i>${g}</i><span><b>${n}</b><em>${l}</em></span><s>${chev()}</s>
    <span class="j-res__vals">${resRead(day).map(([k, v]) => `<span><em>${k}</em><b>${v}</b></span>`).join('')}</span></span>`,
  /* Impact shows from day 1 as a countdown to the end of cycle 1, and opens on day 90 */
  'Impact': (g, n, l, to, day = 1) => day >= 90 ? resRow(g, n, l, to)
    /* still to come: a grey card, its icon locked, and a Locked tag, so it
       reads as not open yet (22.OCT.2026) */
    : `<span class="j-res j-res--soon" aria-disabled="true"><i>${g}<em class="j-res__lock">${lockG}</em></i><span><b>${n}</b><em>Opens in ${90 - day} day${90 - day === 1 ? '' : 's'}, at the end of cycle 1</em>
      <span class="j-res__bar"><i style="width:${Math.round(day / 90 * 100)}%"></i></span></span></span>`,
  'Referral': (g, n, l, to) => `<span class="j-res j-res--refer" ${to ? `data-tap="view:${to}"` : ''}>
    <i>${g}</i><span><b>${n}</b><em>Share the study with someone</em></span><span class="j-res__share"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 15V4M8 8l4-4 4 4M7 11H6a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-6a2 2 0 0 0-2-2h-1"/></svg>Share</span></span>`,
};
const resRowFor = (g, n, l, to, day) => RES_LOOK[n] ? RES_LOOK[n](g, n, l, to, day) : resRow(g, n, l, to);
/* Status isn't a section row: it sits under the title as one line, the
   state of things before anything to look up */
/* a few days the bracelet has stopped syncing, to show what that looks like */
const syncIssue = (day) => day > 8 && day % 25 === 12;
/* v04 (28.OCT.2026): no Status row or line; the readings on Today already
   show what arrived. Only a device that stopped syncing says so here */
const resStatus = (day) => syncIssue(day) ? RES_LOOK.Status(cStatus, 'Status', '', '', day) : '';
/* v04 (28.OCT.2026): the page as module blocks, a bento. One lead block,
   tall and lavender with its figure, changes with the day: what opened in
   the last week (newest first), else the streak; the rest are small grey
   blocks, each its name and one short value. Impact waits, faded, until
   day 90. No group headings */
const MOD_LEAD = ['Impact', 'Monthly reports', 'What changed', 'Earnings', 'Community', 'What you’ve done', 'Your streak', 'Your first week', 'Daily trivia'];
const modFig = (n, day) => ({
  'Your streak': [streakBy(day), 'Day streak', 'Readings in every day'],
  'What you’ve done': [daysOfData(day), 'Days of data', 'Everything sent so far'],
  'Earnings': [`$${earnedBy(day)}`, 'Earned so far', 'Payments and bonuses'],
  'Community': ['3', 'New questions', 'From other participants'],
  'Monthly reports': ['New', 'Monthly report', 'Yours, ready to read'],
  'Impact': [`${day}`, 'Days in the study', 'What they added up to'],
})[n];
/* a block's value says something the title doesn't (a count, a date, a
   state), or there is none (28.OCT.2026) */
const modVal = (n, l, day) => ({
  'Your streak': `${streakBy(day)} days`, 'What you’ve done': `${daysOfData(day)} days`,
  'Earnings': `$${earnedBy(day)}`, 'Daily trivia': `${day - 2} answered`, 'Community': '3 new',
  'Monthly reports': `Month ${Math.max(1, Math.floor(day / 30))} ready`,
  'Your first week': 'Sep 21–27',
  /* each cycle's offer opens on its day 80 */
  'Study updates': dayIn(day) >= 80 ? '1 new' : 'Nothing new',
})[n] || '';
/* a block's title, two words at most */
const MOD_NAME = { 'What you’ve done': 'Data sent', 'Your first week': 'Week one', 'Your streak': 'Streak', 'Daily trivia': 'Trivia', 'Monthly reports': 'Reports', 'What changed': 'Changes' };
const resPage = (lit = '', tip = '', day = 16) => {
  /* the first week's recap stays through the first month, then leaves */
  const open = RES_GROUPS.flatMap(([, rows]) => rows).filter((r) => r[1] !== 'Status' && (r[4] <= day || r[1] === 'Impact')
    && !(r[1] === 'Your first week' && day > 30));
  /* a monthly report is new again every 30 days */
  const since = (r) => r[1] === 'Monthly reports' ? Math.floor(day / 30) * 30 : r[4];
  const fresh = open.filter((r) => since(r) > 1 && since(r) <= day && day - since(r) < 7).sort((a, b) => since(b) - since(a) || MOD_LEAD.indexOf(a[1]) - MOD_LEAD.indexOf(b[1]));
  const lead = fresh.find((r) => modFig(r[1], day)) || open.find((r) => r[1] === 'Your streak') || null;
  const rest = open.filter((r) => r !== lead).sort((a, b) => (a[1] === 'Impact' && day < 90) - (b[1] === 'Impact' && day < 90));
  const block = ([g, n, l, to], cls = '') => {
    const soon = n === 'Impact' && day < 90;
    const fig = cls.includes('is-lead') ? modFig(n, day) : null;
    const html = `<span class="j-res j-mod${cls}${soon ? ' is-soon' : ''}" data-name="${n}" data-kw="${l}"${to && !soon && n !== lit ? ` data-tap="view:${to}"` : ''}${soon ? ' aria-disabled="true"' : ''}>
      <i>${g}${soon ? `<em class="j-res__lock">${lockG}</em>` : ''}</i>${fig
        ? `<b>${MOD_NAME[n] || n}</b><strong>${fig[0]}</strong><span>${fig[1]}</span><em>${fig[2]}</em>`
        : `<b>${MOD_NAME[n] || n}</b>${soon ? `<em>In ${90 - day} day${90 - day === 1 ? '' : 's'}</em>` : modVal(n, l, day) ? `<em>${modVal(n, l, day)}</em>` : ''}`}</span>`;
    return n === lit ? spot(html, tip, to) : html;
  };
  /* an odd block out spans the row, so the grid ends square */
  const small = rest.map((r, k) => block(r, rest.length % 2 && k === rest.length - 1 ? ' is-wide' : ''));
  return scr2(`
  ${nav('Library', dayLine(day))}
  ${/* v04 (30.OCT.2026): search filters the blocks as you type (theme-demo-testing.js) */ ''}
  <label class="j-hs2 j-lib__s" role="search">${gSearchH}<input type="search" placeholder="Search Library" aria-label="Search Library" autocomplete="off"></label>
  ${lit ? '' : resStatus(day)}
  <div class="j-mods">${lead ? block(lead, rest.length >= 2 ? ' is-lead' : ' is-lead is-wide') : ''}${small.join('')}</div>
  <p class="j-lib__none" hidden>Nothing in Library matches that.</p>
  <p class="j-mods__hint">Press and hold a block to move it</p>
  ${/* v04 (30.OCT.2026): the study ID card at the foot of Resources, no
     background, now the views menu is gone */ ''}
  <div class="j-idc j-idc--plain" role="group" aria-label="Your study ID card">
    <p class="j-idc__k">Prolaio Heart Study</p>
    <p class="j-idc__l">Participant ID</p>
    <b class="j-idc__n">PR-2291</b>
    <div class="j-idc__f"><span><em>Enrolled</em>Sep 20</span><span><em>Device</em>Study phone</span><span><em>Cycle</em>${cycleOf(day)} of 8</span></div>
  </div>`, 1, lit ? 'is-spotlit' : '');
};
UI2['res-hub'] = resPage();
/* elsewhere the Resources tab opens resPage() for that moment's day,
   built by the engine (journey-v03.js goTo) */
/* 1.6, pick up where you left off. The checklist keeps setup where it
   stopped: what is done, what is next, the devices connected so far and
   the time left. The stream's moment stops after the patch (3 of 6); in
   v03 the card follows wherever setup was really left (journey-v03.js
   leaveSetup), one home per point: 0 to 4 steps done */
const resumeHome = (done, lit = false, note = done ? 'Welcome back. Setup is saved where you stopped.' : '') => {
  const card = `<div class="j-resume" data-tap="view:${done === 0 ? '1B-s1' : `1B-s${done + 1}`}">
      <p class="j-resume__k">Setup · ${done} of 6 done${done ? '' : '<span class="j-nochip"><i></i>None syncing</span>'}</p>
      <p class="j-resume__t">Next: ${SETUP_STEPS[done]}</p>
      <div class="j-seg j-seg--6">${[0, 1, 2, 3, 4, 5].map((k) => `<i class="${k < done ? 'is-on' : ''}"></i>`).join('')}</div>
      ${kitStrip(Math.max(0, done - 1))}
      <div class="j-resume__go"><em>About ${SETUP_MIN.slice(done).reduce((a, b) => a + b, 0)} min left</em><span class="u-btn">${done ? 'Continue' : 'Start setup'}</span></div>
    </div>`;
  return home3({ day: 1, spotlit: lit, label: 'Later today',
    /* v04 (28.OCT.2026): no welcome line before setup starts; the card says it all */
    note,
    top: lit ? spot(card, 'Setup picks up where you left off, with what is done, what is next and the time left') : card,
    /* v04 (28.OCT.2026): what's later today as receipt lines, one line each
       with the time on the right; the heading already says they're waiting */
    below: `<div class="j-crs j-crs--rcpt j-crs--later">${[
      ['q', cQ, 'First questionnaire', '2 min'],
      ['bp', cBp, done >= 4 ? 'Blood pressure' : 'First blood pressure', done >= 4 ? 'Tonight' : 'In setup']].map(([k, g, name, v]) =>
      `<div class="j-cr" data-row="${k}" data-tap="${ckGo(name)}"><i class="j-cr__g">${g}</i><div class="j-cr__t"><b>${name}</b></div><em>${v}</em><span></span></div>`).join('')}</div>` })
    /* v03: until setup is done, Resources is locked; a tap says why */
    .replace(/<span class="" data-tap="tab:1"><i>/, `<span class="is-lock" aria-disabled="true" data-tap="toast:Library opens once setup is done"><i><em class="j-tabs__lock">${lockG}</em>`);
    /* (before any device is set up, the amber "No data coming in" chip sits
       in the setup card's first line, so the problem and its fix are one card) */
};
UI2['ck-1-resume'] = resumeHome(3, true);
/* Skip setup, from the overview (21.OCT.2026): Today with setup waiting at
   the top, and a plain reminder that nothing records until the devices are
   connected */
/* (its "No data coming in" chip comes with resumeHome(0)) */
UI2['ck-1-skip'] = resumeHome(0);
[0, 1, 2, 3, 4].forEach((n) => { UI2['ck-1-resume@' + n] = resumeHome(n); });

/* the questionnaire's start has Back at the bottom, so no ✕ at the top */
UI2['4D'] = UI2['4D'].replace('<div class="u-x">✕</div>', '');
/* the measuring wait is lit: the ring shows it is working */
UI2['10B'] = UI2['10B'].replace('class="u-scr is-v2 ', 'class="u-scr is-v2 is-spotlit ');
/* Patch Week stops at its checklist: the questionnaire task is shown but
   doesn't open (One-Tap Questions is hidden), so → moves on to the next concept */
UI2['ck-2-0'] = UI2['ck-2-0'].replace(/(<div class="j-ck is-now) is-tap" data-tap="view:4D"/, '$1"');
/* v03: Resume Setup is a detour from the wizard, so its Continue works
   again: it picks setup up at step 4 and Done returns to the day-one checklist */
/* the final reading (4.x) skips the measuring (2.3 shows it): Start goes
   straight to Report unlocked */
UI2['rd30'] = UI2['rd30'].replace('data-tap="view:rd30-m">Start', 'data-tap="view:rd30-done">Start');
/* the Routine checklist (3.2) also stops at itself: its tasks don't open
   the BP or questionnaire flows again (2.3 shows them), so → moves on */
UI2['ck-3'] = UI2['ck-3'].replace(/(<div class="j-ck is-(?:now|later)) is-tap" data-tap="view:(?:5B|4D)"/g, '$1"');
UI2['10B-done'] = UI2['10B-done'].replace('class="u-scr is-v2 ', 'class="u-scr is-v2 is-spotlit ');
/* putting the cuff on: how to sit stays anchored over Back and Start */
{
  const sit = '<p class="j-rd__wait">Sit with your back supported and your arm resting on a table.</p>';
  if (UI2['10B-ready'].includes(sit) && UI2['10B-ready'].includes('<div class="u-thumb j-pair">'))
    UI2['10B-ready'] = UI2['10B-ready'].replace(sit, '').replace('<div class="u-thumb j-pair">', `<div class="u-thumb j-pair j-thumb--note">${sit}`);
}

/* Switching views, as Google Calendar does it: ☰ beside the title opens a
   drawer from the left with Today, This week and This month (the roadmap),
   the current one highlighted. Today is the phase's own checklist */
const gMenu = `<svg viewBox="0 0 24 24" class="u-g" aria-hidden="true"><path d="M4 7h16M4 12h16M4 17h16"/></svg>`;
/* v04 (30.OCT.2026): where the menu was, Today and the roadmap toggle: on
   Today the roadmap's icon opens it, on the roadmap Today's icon comes back */
const gRoad = `<svg viewBox="0 0 24 24" class="u-g" aria-hidden="true"><circle cx="6" cy="18" r="2"/><circle cx="18" cy="6" r="2"/><path d="M8 18h7.5a3 3 0 0 0 0-6h-7a3 3 0 0 1 0-6H16"/></svg>`;
const gToday = `<svg viewBox="0 0 24 24" class="u-g" aria-hidden="true"><path d="M4 11 12 4l8 7v8.5a1 1 0 0 1-1 1h-4.5V15h-5v5.5H5a1 1 0 0 1-1-1z"/></svg>`;
const topToggle = (v) => v === 'today' ? `<span class="j-menu j-tog" data-v="today" data-tap="tab:2" aria-label="Roadmap" role="button">${gRoad}</span>`
  : v === 'month' ? `<span class="j-menu j-tog" data-v="month" data-tap="tab:0" aria-label="Today" role="button">${gToday}</span>`
  : `<span class="j-menu" data-v="${v}" aria-hidden="true">${gMenu}</span>`;
const gDay = `<svg viewBox="0 0 24 24" class="u-g" aria-hidden="true"><rect x="4" y="5" width="16" height="15" rx="2.5"/><path d="M4 9.5h16M8.5 3v4M15.5 3v4"/><rect x="10" y="12.5" width="4" height="4" rx="1"/></svg>`;
const gWeek = `<svg viewBox="0 0 24 24" class="u-g" aria-hidden="true"><rect x="4" y="5" width="16" height="15" rx="2.5"/><path d="M4 9.5h16M8.5 3v4M15.5 3v4M8 9.5V20M12 9.5V20M16 9.5V20"/></svg>`;
const gMonth = `<svg viewBox="0 0 24 24" class="u-g" aria-hidden="true"><rect x="4" y="5" width="16" height="15" rx="2.5"/><path d="M4 9.5h16M8.5 3v4M15.5 3v4M4 13h16M4 16.5h16M9.3 9.5V20M14.7 9.5V20"/></svg>`;
const gRefer = `<svg viewBox="0 0 24 24" class="u-g" aria-hidden="true"><circle cx="9" cy="8" r="3.2"/><path d="M3.5 19.5c.6-3 2.8-4.9 5.5-4.9s4.9 1.9 5.5 4.9M15.5 5a3.2 3.2 0 0 1 0 6M17.2 14.8c1.7.7 2.8 2.3 3.2 4.7"/></svg>`;
const gRenew = `<svg viewBox="0 0 24 24" class="u-g" aria-hidden="true"><path d="M19.5 12a7.5 7.5 0 1 1-2.2-5.3"/><path d="M19.5 4v3.6h-3.6"/><path d="M9.5 12.2l1.8 1.8 3.4-3.6"/></svg>`;
const viewsDrawer = () => `<div class="j-ov j-ov--drawer"><span class="j-ov__bg" data-tap="close"></span>
  <nav class="j-drawer" aria-label="Views">
    <p class="j-drawer__k">Prolaio</p>
    <span class="j-drawer__i" data-v="today" data-tap="today">${gDay}Today</span>
    <span class="j-drawer__i" data-v="month" data-tap="view:1A">${gMonth}Roadmap</span>
    <hr class="j-drawer__hr">
    <span class="j-drawer__i" data-tap="view:res.v2-4-share-study">${gRefer}Referral</span>
    <span class="j-drawer__i" data-tap="view:rn-menu">${gBell}Study updates</span>
    ${/* v04 (29.OCT.2026): the study ID card at the menu's foot, the thing
       you'd read out on a call to the study team */ ''}
    <div class="j-idc" role="group" aria-label="Your study ID card">
      <p class="j-idc__k">Prolaio Heart Study</p>
      <p class="j-idc__l">Participant ID</p>
      <b class="j-idc__n">PR-2291</b>
      <div class="j-idc__f"><span><em>Enrolled</em>Sep 20</span><span><em>Device</em>Study phone</span><span><em>Cycle</em>1 of 8</span></div>
    </div>
  </nav></div>`;
Object.assign(UI2X, { views: viewsDrawer() });
/* study updates from the drawer, any time: the same page, with a way back to the
   view it was opened from and without the day-80 label */
UI2['rn-menu'] = UI2['rn'].replace(/<div class="u-nav"><b>Study updates<\/b><span[^>]*>[^<]*<\/span><\/div>/, `<p class="j-back" data-tap="back">${chev()}</p><div class="u-nav"><b>Study updates</b><span></span></div>`);
/* v03 (F5): referral is open at all times, from the drawer on every home
   view as well as Resources. It is a Resources page (that tab lit), so the
   drawer opens the Resources copy and its back link goes to Resources */
/* the ☰ on each view's title; `v` marks which view is showing */
[['ck-1', 'today'], ['ck-1-resume', 'today'], ['ck-1-skip', 'today'], ['1A', 'month'],
 ...[0, 1, 2, 3, 4].map((n) => ['ck-1-resume@' + n, 'today']),
 ['ck-2-0', 'today'], ['ck-2', 'today'], ['6A', 'week'],
 /* v03: the same menu on every home moment, so Home is one screen */
 ['ck-3', 'today'], ['ck-3-0', 'today'], ['v2-3-streak', 'today'], ['v2-3-poll', 'today'],
 ['ck-4-0', 'today'], ['ck-4', 'today'], ['9D', 'today']].forEach(([id, v]) => {
  if (!UI2[id]) return;
  UI2[id] = UI2[id].replace('<div class="u-nav"><b>',
    `<div class="u-nav j-nav--menu">${topToggle(v)}<b>`);
});

/* checklists in 1.x and 2.x: what to do now on top, then what is still to
   come, then what is done */
['ck-1', 'ck-1-scale', 'ck-1-resume', 'ck-1-skip', 'ck-1-resume@0', 'ck-1-resume@1', 'ck-1-resume@2', 'ck-1-resume@3', 'ck-1-resume@4', 'ck-2-0', 'ck-2'].forEach((id) => {
  if (!UI2[id]) return;
  const t = document.createElement('template');
  t.innerHTML = UI2[id];
  const rank = (el) => el.classList.contains('is-now') ? 0 : el.classList.contains('is-done') ? 2 : 1;
  t.content.querySelectorAll('.j-cks').forEach((list) => {
    [...list.children].sort((a, b) => rank(a) - rank(b)).forEach((el) => list.append(el));
  });
  UI2[id] = t.innerHTML;
});

/* setup, when the bracelet won't connect (22.OCT.2026): a "What if" off the
   setup wizard. Plain words as for the other errors (what happened, the
   fixes to try, Try again) and the study team right there */
UI2['cn-band-err'] = scr2(`
    ${stepHead(2, 'About 15 minutes left.')}
    <p class="u-lead j-step__t">Put on your bracelet</p>${partDots(BAND_PARTS, BAND_PARTS.length)}
    <div class="j-stepvis"><div class="j-cn">
      <div class="j-dd is-err"><span class="j-dd__dev">${cBand}</span><span class="j-dd__x" aria-hidden="true">✕</span><span class="j-dd__ph">!</span></div>
      <p class="j-dd__w">Couldn’t connect to your bracelet</p>
    </div></div>
    <div class="j-bt">
      <p class="j-helps__k">Try these, then try again</p>
      <ol class="j-fixes">
        <li><b>Charge it for 5 minutes.</b> A low battery can stop it pairing.</li>
        <li><b>Press its button</b> until the light blinks blue.</li>
        <li><b>Hold your phone right next to it</b> while it connects.</li>
      </ol>
      <p class="j-helps__k">Still not connecting?</p>
      <div class="j-tm">${danaCard()}${callCard()}</div>
    </div>
    ${stepNav('1B-s2c', fwdBtn('1B-s2c', 'Try again'))}`, false);

/* every setup step: a back arrow before "Step n of 6", to the screen before
   (21.OCT.2026; it used to leave setup for home, which is now Save and
   finish later) */
['1B-s1', '1B-s2', '1B-s2c', '1B-s3', '1B-s3c', '1B-s4', '1B-s4c', '1B-s5', '1B-s5c', '1B-s6a', '1B-s6b', '1B-s6', 'cn-band-err'].forEach((id) => {
  if (!UI2[id]) return;
  UI2[id] = UI2[id].replace('<div class="u-nav"><b>Step',
    `<div class="u-nav j-nav--menu"><span class="j-menu j-home" data-tap="back" aria-label="Back">${chev()}</span><b>Step`);
});
/* the overview before step 1 and the patch's connect screens leave the
   same way; Today then shows setup where it stopped (journey-v03.js) */
/* the overview's arrow goes back to the screen before (21.OCT.2026); leaving
   setup is its own button there, Finish later */
UI2['1B'] = UI2['1B'].replace('<div class="u-nav"><b>',
  `<div class="u-nav j-nav--menu"><span class="j-menu j-home" data-tap="back" aria-label="Back">${chev()}</span><b>`);
['1B.far', '1B.warm', '1B.hot', '1B.ok'].forEach((id) => {
  if (!UI2[id]) return;
  UI2[id] = UI2[id].replace('<div class="u-nav"><b>',
    `<div class="u-nav j-nav--menu"><span class="j-menu j-home" data-tap="view:ck-1-resume" aria-label="Home">${chev()}</span><b>`);
});

/* ==========================================================================
   When a reading or the bracelet goes wrong (14.OCT.2026): alternate
   scenarios in the first week, at the evening readings. Moved here from
   setup, which now connects first time. After iHealth's BP3L error screens
   and Corsano's bracelet notifications, in plain words: what happened, the
   one fix, Try again, and a person to reach. Each reading error keeps its
   code small at the bottom, for the study team.
   ========================================================================== */

/* the study team, on one sheet: call Dana, send a message, the hours, and
   where to go for anything medical */
const gMsg = `<svg viewBox="0 0 24 24" class="u-g" aria-hidden="true"><path d="M4.5 5.5h15a1 1 0 0 1 1 1v9a1 1 0 0 1-1 1H10l-4.5 3.5v-3.5h-1a1 1 0 0 1-1-1v-9a1 1 0 0 1 1-1Z"/></svg>`;
Object.assign(UI2X, {
  /* v04 (29.OCT.2026): a back arrow returns to the sheet this came from
     (Help, Settings); messaging only, the call lives on Help's doctor row */
  team: sheet(`<p class="j-sh__k"><span class="j-sh__bk" data-tap="sheetback" role="button" aria-label="Back">${chev()}</span>Study team</p>
    <div class="j-dm">
      <div class="j-dm__who">${danaAv()}<span><b>Dana Reyes</b><em>Study coordinator · <i>Online</i></em></span></div>
      <div class="j-dm__box" data-tap="view:tm-new" role="textbox" aria-label="Message Dana"><span>Type a message to Dana…</span><b class="j-dm__send" aria-label="Send"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 19V5M6 11l6-6 6 6"/></svg></b></div>
      <p class="j-dm__meta">Replies within 1–2 hours · Your ID <b>PR-2291</b></p>
    </div>
    <p class="j-tm__urgent">Feeling unwell? Call your doctor, or 911 in an emergency. The study team can’t give medical advice.</p>`),
});

/* a reading that didn't finish: the reading's own layout, the device
   marked, the one fix; under Try again, Troubleshoot and the study team,
   always in view */
const errRead = (title, line, art, fix, code, help, retry) => reading(title, line,
  `<div class="j-er__art">${art}<span class="j-er__x" aria-hidden="true">!</span></div>`,
  `<p class="j-rd__wait">${fix}</p>`,
  `<span class="u-btn u-btn--xl" data-tap="view:${retry}">Try again</span>
   <div class="j-er__links"><span data-tap="sheet:${help}">Troubleshoot</span>${spot('<span data-tap="sheet:team">Contact the study team</span>', 'A real person on the study team is always one tap away')}</div>`, false, 'data-state="error"');

Object.assign(UI2, {
  /* the one played through: the cuff was loose; Try again measures, and
     the evening carries on as usual */
  'rd-err': errRead('Too loose', 'The cuff was too loose to measure.', cuffOnArt(),
    '<b>Wrap it snug on your bare arm</b>, so just two fingers fit under the edge.', '4', 'ins.bp', 'rd-bp'),
  'rd-err-conn': errRead('Couldn’t reach the cuff', 'Your phone lost the connection.', monitorArt(),
    '<b>Bring your phone next to the cuff.</b> If its screen stays blank, plug it in with the USB cable until the green light stays on.', '10', 'ins.bp', 'rd-bp'),
  'rd-err-move': errRead('Hold still', 'You moved while it was measuring.', cuffOnArt(),
    '<b>Sit back and rest your arm on the table</b>, then stay still and quiet until it’s done.', '0', 'ins.bp', 'rd-bp'),
  'rd-err-unk': errRead('Reading stopped', 'The cuff couldn’t finish this reading.', monitorArt(),
    '<b>Wait 5 minutes, then try again.</b> If it happens twice, contact the study team.', '9', 'ins.bp', 'rd-bp'),
  'rd-err-sc': errRead('Your weight didn’t come through', 'The scale didn’t send it to your phone.', scaleArt2(),
    '<b>Step off and wait for the screen to go dark</b>, then step on again with bare feet. Keep your phone in the same room.', 'S2', 'ins.sc', 'rd-sc'),
});

/* 2.8's click-through shows the study team first: the first Next opens
   the contact sheet, the next carries on with Try again */
UI2['rd-err'] = UI2['rd-err'].replace('data-tap="sheet:team"', 'data-tap="sheet:team" data-first="sheet:team"');
/* 2.7 is only the error state: Try again doesn't play the reading again
   (2.3 shows it), so → moves on to the next concept */
UI2['rd-err'] = UI2['rd-err'].replace('data-tap="view:rd-bp">Try again', 'data-tap="toast:This measures once more" data-end>Try again');
/* the error screens light the way to a real person */
['rd-err', 'rd-err-conn', 'rd-err-move', 'rd-err-unk', 'rd-err-sc'].forEach((k) => { UI2[k] = UI2[k].replace('class="u-scr is-v2 ', 'class="u-scr is-v2 is-spotlit '); });

/* the bracelet, as Corsano flags it: a banner on the home screen that
   opens a short sheet. Amber when it can wait, red when data is being missed */
const alertBar = (lvl, text, to) => `<div class="j-al is-${lvl}" data-tap="sheet:${to}"><i aria-hidden="true">!</i><span>${text} <u>Learn more</u></span></div>`;
const alertSheet = (lvl, title, body) => sheet(`<p class="j-sh__k">${cBand}Bracelet</p>
  <div class="j-al__h is-${lvl}"><i aria-hidden="true">!</i><p class="u-lead u-lead--big">${title}</p></div>
  <p class="u-note">${body}</p>
  <div class="j-al__go"><span class="u-btn u-btn--xl" data-tap="close">Got it</span>
  <span class="j-er__team" data-tap="sheet:team">Contact the study team</span></div>`);
Object.assign(UI2X, {
  'al.batt': alertSheet('warn', 'Charge your bracelet tonight', 'Its battery is low. Charge it for about an hour, then put it back on. It stops recording when the battery runs out.'),
  'al.lost': alertSheet('warn', 'Keep your phone nearby', 'Your bracelet is holding data it hasn’t sent yet. Keep your phone within about 30 feet, with the app open for a minute, so none of it is lost.'),
  'al.worn': alertSheet('alert', 'Put your bracelet back on', 'It isn’t recording right now. Wear it snug, a finger’s width above your wrist bone, so it sits flat against your skin.'),
});
/* a home screen with a banner under its title, and the same with its sheet open */
const withAlert = (id, bar) => UI2[id].replace(/(<div class="j-hd">[\s\S]*?<\/div><\/div>)/, `$1${bar}`);
const withSheet = (html, key) => html.replace(/<\/div>$/, `${UI2X[key]}</div>`);
Object.assign(UI2, {
  'al-batt': withAlert('ck-2-0', alertBar('warn', 'Bracelet battery low.', 'al.batt')),
  'al-lost': withAlert('ck-2-0', alertBar('warn', 'Bracelet data may be lost.', 'al.lost')),
});
UI2['al-worn'] = withSheet(withAlert('ck-2-0', alertBar('alert', 'Bracelet not worn.', 'al.worn')), 'al.worn');
UI2['al-team'] = withSheet(UI2['rd-err'], 'team');

/* ==========================================================================
   The study team reaches out (14.OCT.2026): when data stops for a couple
   of days, a person writes, not the system. R1: "I didn't know that there
   was a problem. They contacted me." Never a warning or a missed-task mark:
   what the team noticed, that a break is fine, one ask, and a way to say
   what's wrong. The same thread is where "Send a message" goes.
   ========================================================================== */

/* the conversation's header: who you're writing to, and that they're in */
const dmHead = (back = 'back') => `<div class="j-dm__hd"><div class="j-dm__top"><p class="j-back" data-tap="${back}">${chev()} Back</p></div>
  <div class="j-dm__who">${danaAv()}
    <div><b>Dana Reyes</b><em>Study coordinator, replies on weekdays</em></div></div></div>`;
/* one-tap replies; each shows your answer and Dana's, in place */
const qReplies = (opts) => `<div class="j-qr">${opts.map(([t, to]) => `<span data-tap="morph:${to}">${t}</span>`).join('')}</div>`;
const dmBox = `<div class="j-dm__box" data-tap="toast:The keyboard opens here"><span>Message Dana</span><i>${gMsg}</i></div>`;
/* what the team noticed, as a card in the thread, so the ask is concrete */
const dmData = `<div class="j-dm__data">${cBand}<div><b>Bracelet</b><em>Last data Wednesday, 11:40 PM</em></div></div>`;

const dmNudge = `${msg('Hi Sam, it’s Dana from the study team. We haven’t had data from your bracelet since Wednesday night.')}
  ${dmData}
  ${msg('No problem if it needed a break. Could you put it back on today?')}`;
Object.assign(UI2X, {
  'dm.on': `${dmNudge}${msg('Putting it on now', true)}
    ${msg('Thank you. I’ll check this afternoon that it’s coming through. You don’t need to do anything else.')}`,
  'dm.broken': `${dmNudge}${msg('It’s not working', true)}
    ${msg('Sorry about that. Hold its button for 10 seconds, until the light blinks blue. If it still won’t sync, I’ll mail you a new one, at no cost.')}
    ${qReplies([['That fixed it', 'dm.on'], ['Please call me', 'dm.call']])}`,
  'dm.call': `${dmNudge}${msg('Please call me', true)}
    ${msg('Of course. I’ll call you today between 2 and 4 PM. Reply here if another time is better.')}`,
  /* writing in from an error or the contact sheet: pick what it's about */
  'dm.new.r': `${msg('Hi Sam, what can I help with?')}${msg('My reading keeps failing', true)}
    ${msg('Thanks for telling me. Tell me what the screen says and I’ll reply by tomorrow.')}`,
  'dm.new.d': `${msg('Hi Sam, what can I help with?')}${msg('A device isn’t working', true)}
    ${msg('Sorry about that. Which one? I’ll walk you through it, or mail you a new one.')}`,
});

Object.assign(UI2, {
  /* how it reaches you: a notification from Dana, by name */
  'tm-lock': scr2(notif('10:15 AM', 'Friday, September 26', 'Dana, study team',
    'Hi Sam, we haven’t had data from your bracelet since Wednesday night. Is everything OK?', 'x')
    .replace('<span class="j-ov__bg" data-tap="close"></span>', '<span class="j-ov__bg"></span>')
    .replace('data-tap="sheet:x"', 'data-tap="view:tm-thread"'), false),
  'tm-thread': scr2(`${dmHead()}
    <p class="j-dm__day">Today, 10:15 AM</p>
    <div class="u-msgs j-dm" data-morph="end">${dmNudge}
      ${qReplies([['Putting it on now', 'dm.on'], ['It’s not working', 'dm.broken'], ['Please call me', 'dm.call']])}</div>
    <div class="u-thumb">${dmBox}</div>`, false),
  /* from "Send a message": the same thread, started by you */
  'tm-new': scr2(`${dmHead()}
    <div class="u-msgs j-dm" data-morph="end">${msg('Hi Sam, what can I help with?')}
      ${qReplies([['My reading keeps failing', 'dm.new.r'], ['A device isn’t working', 'dm.new.d']])}</div>
    <div class="u-thumb">${dmBox}</div>`, false),
});

/* 2.3's "how you felt last time" coach mark is gone with the card itself
   (21.OCT.2026: past answers can bias today's) */

/* ==========================================================================
   3.6's variant, the tower (14.OCT.2026): progress you can see fill up.
   Each day your data comes through adds a Jenga layer, alternating three
   block ends and one long block, toward the month's top at day 30. A
   missed sync is one block missing from its layer; nothing falls, so a gap
   never reads as failing. "Watch it build" drops the layers in again.
   Function declarations, so the screen above can use them.
   ========================================================================== */
function jengaTower(day, of, gaps) {
  const layer = (k) => {
    const state = k < day - 1 ? 'is-on' : k === day - 1 ? 'is-now' : 'is-next';
    const ends = k % 2 === 0;
    const blocks = ends ? [0, 1, 2].map((b) => `<i class="${gaps[k + 1] === b ? 'is-gap' : ''}"></i>`).join('') : '<i></i>';
    return `<span class="j-jg__l ${ends ? 'is-ends' : 'is-long'} ${state}" style="--k:${k}">${blocks}</span>`;
  };
  return `<div class="j-jg">
    <div class="j-jg__t">${Array.from({ length: of }, (_, k) => layer(k)).join('')}</div>
    <p class="j-jg__m j-jg__m--top" style="--k:${of - 1}"><b>Day ${of}</b>Your report</p>
    <p class="j-jg__m" style="--k:${day - 1}"><b>Today</b>Day ${day}</p>
  </div>`;
}
function tallyView(v, day = 19) {
  /* the replay icon, here because the facts' ↻ is declared after the screen */
  const gRefreshT = '<svg viewBox="0 0 24 24" class="u-g" aria-hidden="true"><path d="M19.5 12a7.5 7.5 0 1 1-2.2-5.3"/><path d="M19.5 4.5v4.2h-4.2"/></svg>';
  const at = day === 19 ? '' : '@' + day;
  const sw = `<div class="j-sw" role="tablist">${[['tower', 'Tower'], ['counts', 'Counts']].map(([k, t]) =>
    `<span class="${k === v ? 'is-on' : ''}" data-tap="morph:tally.${k}${at}">${t}</span>`).join('')}</div>`;
  /* the tower is this month's: the day into the cycle; month 1 has the
     night the bracelet didn't sync (day 11) */
  const into = ((day - 1) % 30) + 1, gap = day <= 30 && into > 11;
  /* how the tower works sits behind an (i) by the day, to save room (a
     comment inside the template showed on screen; 22.OCT.2026) */
  if (v === 'tower') return `${sw}
    <div class="j-tlm"><p><em><b>Day ${into}</b> of 30<span class="j-info" role="button" aria-label="How the tower works" data-tap="toast:Each day your data comes through adds a layer.${gap ? ' Day 11 is missing a block, the night the bracelet didn’t sync. A missing block doesn’t undo the rest.' : ''}">${gInfo}</span></em><span>${30 - into} days to the top</span></p></div>
    <div class="j-tlw">${jengaTower(into, 30, gap ? { 11: 2 } : {})}
      <span class="j-jg__play" data-tap="morph:tally.tower${at}">${gRefreshT}Watch it build</span></div>
    ${sec('This month')}
    <div class="j-tlr">${[[cBand, 'Full days', String(into - 1 - (gap ? 1 : 0))],
      gap ? [cBand, 'Day with a gap', '1'] : [cBand, 'Months done', String(Math.floor((day - 1) / 30))],
      [cBand, 'Days to the top', String(30 - into)]].map(([g, n, v]) => `<div class="j-tlr__r"><i>${g}</i><span>${n}</span><b>${v}</b></div>`).join('')}</div>`;
  /* v04 (29.OCT.2026): the counts as a receipt. The month as one slim bar
     of 30 days (today ringed), then each kind of data with its icon and
     count, and a total of what reached the study */
  const qn = Math.max(0, Math.round(9 + (day - 19) * 30 / 71));
  const rowsT = [[gPatch, 'Patch heart data', `${Math.min(day - 1, 7) * 24} hours`], [cBed, 'Sleep', `${day} nights`],
    [cBp, 'Blood pressure', `${day - 1} readings`], [cWeight, 'Weight', `${Math.max(0, day - 2)} readings`],
    [cQ, 'Questionnaires', `${qn}`], [cHeart, 'Heart rate', `${day} days`]];
  const total = (day - 1) + Math.max(0, day - 2) + qn + day * 2;
  return `${sw}
    <div class="j-tlm"><p><b>Day ${into}</b> of 30<span>${30 - into} days to your report</span></p>
      <div class="j-tlm__bar">${Array.from({ length: 30 }, (_, k) => `<i class="${k < into - 1 ? 'is-on' : k === into - 1 ? 'is-now' : ''}"></i>`).join('')}</div></div>
    ${sec('So far')}
    <div class="j-tlr">${rowsT.map(([g, n, v]) => `<div class="j-tlr__r"><i>${g}</i><span>${n}</span><b>${v}</b></div>`).join('')}
      <div class="j-tlr__t"><span>Received by the study</span><b>${total} readings</b></div></div>`;
}
Object.assign(UI2X, { 'tally.tower': tallyView('tower'), 'tally.counts': tallyView('counts') });

/* the Help sheet's search icon, and one common question that opens its
   answer; `kw` is what the search matches */
const faq = (kw, q, a, link = '') => `<div class="j-fix j-faq" data-kw="${kw}" data-tap="toggle">
    <p class="j-fix__q">${q}${chev('down')}</p>
    <div class="j-fix__a">${a}${link}</div>
  </div>`;

/* ==========================================================================
   v03, the top bar (19.OCT.2026): ☰ views, ? help, the bell and the gear
   work on every screen that shows them. One help sheet (fix it yourself
   first, then the study team, F10); notifications up to this moment's
   day; settings. The engine opens notifs3 for the day (journey-v03.js)
   ========================================================================== */
Object.assign(UI2X, {
  /* v03 (22.OCT.2026): help as a search, then the common questions, each
     opening its answer (30.OCT.2026: no Redo setup; devices stay connected). Tapping the search shows it filtering, typed "bracelet" */
  help3: sheet(`<p class="j-sh__k">${mHelp}Help</p>
    <div class="j-hs2" data-tap="toggle" role="search" aria-label="Search help">${gSearchH}<em>Search help</em><b>bracelet</b></div>
    <p class="j-helps__k j-hs2__k"><span class="j-hs2__all">Common questions</span><span class="j-hs2__res">Results for “bracelet”</span></p>
    <div class="j-helps j-faqs">
      ${faq('bracelet sync phone', 'My bracelet isn’t syncing', '<p>Keep your phone within about 30 feet, with the app open, for a minute.</p>', '<span class="j-st__a" data-tap="view:ts-1">Try the 3 quick steps</span>')}
      ${faq('patch light green', 'My patch light isn’t green', '<p>Press its button until the light turns green. Still not green after a minute?</p>', '<span class="j-st__a" data-tap="swap:1B.help">Open patch help</span>')}
      ${faq('blood pressure cuff reading failed error', 'My blood pressure reading failed', '<p>Check the cuff is snug on your bare upper arm. Sit still and quiet, then try again.</p>')}
      ${faq('miss missed day reading streak', 'What if I miss a day?', '<p>Nothing you have already sent is lost. Pick up again the next day.</p>')}
      ${faq('paid payment earnings money', 'When do I get paid?', '<p>After patch week and after each check-in, on days 30, 60 and 90.</p>', '<span class="j-st__a" data-tap="view:res.16A">See your earnings</span>')}
      ${faq('data privacy share who', 'Who can see my data?', '<p>Only the study team, for this study.</p>')}
    </div>
    <p class="j-helps__k">Still stuck?</p>
    <div class="j-co j-co--help"><img class="j-co__av j-co__ph" src="theme-demo/art/dr-okafor.jpg" alt="">
          <div><b>Dr. Maya Okafor</b><em>Study cardiologist</em></div></div>
        ${callOpts('Dr. Okafor')}
    <div class="j-crs--rcpt j-shl">${rcRow(mForum, 'Message the study team', '', 'swap:team')}</div>
    <p class="j-tm__urgent">Feeling unwell? Call your doctor, or 911 in an emergency.</p>`),
  settings3: sheet(`<p class="j-sh__k">${mSettings}Settings</p>
    <p class="j-helps__k">Reminders</p>
    <div class="j-tgl is-open" data-tap="toggle" role="switch" aria-checked="true">
      <span><b>Check-ins</b><em>Mostly in week one</em></span><i aria-hidden="true"></i></div>
    ${/* v04 (29.OCT.2026): the reminder times sit in the same section as
       their switch, each value an input you can change (a picker) */ ''}
    ${setTime('bp', 'BP and weight', '20:00')}
    ${setDays('q-days', 'Questionnaire days', ['M W F', 'T Th S', 'S T Th'])}
    ${setTime('q-time', 'Questionnaire time', '08:00')}
    <p class="j-helps__k">Notifications</p>
    <div class="j-tgl is-open" data-tap="toggle" role="switch" aria-checked="true"><span><b>On this phone</b></span><i aria-hidden="true"></i></div>
    <div class="j-tgl" data-tap="toggle" role="switch" aria-checked="false"><span><b>By email</b></span><i aria-hidden="true"></i></div>
    <div class="j-tgl" data-tap="toggle" role="switch" aria-checked="false"><span><b>Read aloud</b></span><i aria-hidden="true"></i></div>
    ${setTime('sleep-from', 'Silent from', '22:00')}
    ${setTime('sleep-to', 'Until', '07:00')}
    ${/* v04 (30.OCT.2026): no referral card here; Referral is in Resources */ ''}
    <span class="j-st__a" data-tap="swap:team">Thinking of leaving the study?<br>Talk to the study team</span>`),
});
/* what the app has told you, newest first, up to this day: [day, time, title, line] */
const NOTIFS = [
  [1, '10:31 AM', 'You’re all set', 'Setup is done. Your first questionnaire is ready.'],
  [1, '11:00 AM', 'The community is open', 'Ask other participants, under a random name. Joining is optional.'],
  [2, '8:00 AM', 'Your data arrived', 'Yesterday’s readings and last night’s sleep came through.'],
  [3, '8:00 AM', 'Daily trivia is here', 'One quick heart question a day, on Today.'],
  [6, '7:30 AM', 'Patch week', 'Wear your patch all week. Today: a questionnaire, then blood pressure tonight.'],
  [6, '8:00 PM', 'Time for your blood pressure', 'It takes 40 seconds. Open the app when you’re at the cuff.'],
  [8, '9:00 AM', 'Your patch comes off today', 'Open the app to see how to take it off.'],
  [7, '8:00 AM', 'Data sent unlocked', 'Everything you’ve sent so far, in Library.'],
  [21, '9:00 AM', 'Three-week streak', '$2 added to your earnings.'],
  [30, '7:00 AM', 'Check-in day', 'One final reading unlocks your monthly report.'],
  [31, '10:00 AM', 'Payment sent', 'Your $30 day 30 payment is on its way.'],
  [80, '6:00 PM', 'Study update', 'See what’s changing before cycle 2.'],
];
/* v04 (28.OCT.2026): a receipt, newest first: each one its title with the
   time at the right and its line under it; Today and Earlier as headings,
   the newest marked with a dot */
const notifSheet = (day) => {
  const all = NOTIFS.filter((n) => n[0] <= day).sort((a, b) => b[0] - a[0] || (b[1] < a[1] ? -1 : 1)).slice(0, 6);
  const item = ([d, t, title, line], k) => `<div class="j-nl__i${k === 0 ? ' is-new' : ''}"><b>${title}</b><em>${d === day ? t : `Day ${d}`}</em><p>${line}</p></div>`;
  const today = all.filter((n) => n[0] === day), before = all.filter((n) => n[0] !== day);
  return sheet(`<p class="j-sh__k">${gBell}Notifications</p>
  ${today.length ? `<p class="j-helps__k">Today</p><div class="j-nl j-nl--rcpt">${today.map(item).join('')}</div>` : ''}
  ${before.length ? `<p class="j-helps__k">Earlier</p><div class="j-nl j-nl--rcpt">${before.map((n, k) => item(n, today.length + k)).join('')}</div>` : ''}`);
};
UI2X.notifs3 = notifSheet(16);

/* v03: the home screen on any day 1 to 90, for sliding the day line on the
   journey map. A day that has a designed home uses it; any other day is
   drawn from the same parts, so the screen grows as the study goes on:
   patch week's list and its data, then the routine with the streak, days of
   data, earnings and the next report's bar */
const HOME_DESIGNED = { 1: 'ck-1', 6: 'ck-2-0', 15: 'ck-3', 30: 'ck-4-0', 54: '9D' };
window.homeAt = (d) => {
  d = Math.max(1, Math.min(MAX_DAY, Math.round(d)));
  if (d > STUDY_DAYS) return renewalHome(d);
  if (HOME_DESIGNED[d] && UI2[HOME_DESIGNED[d]]) return HOME_DESIGNED[d];
  const id = 'home@' + d;
  if (UI2[id]) return id;
  /* the top, most important first: the report (check-in day, or its bar in
     the month's last week), what opens or is about to, then the trivia */
  const check = d % 30 === 0;
  const top = (check ? report30(true, d / 30) : reportSoon(d) ? nextReport(d) : '') + unlockLine(d) + (d >= 3 ? triviaCard(d) : '');
  if (d <= 7) {
    UI2[id] = home3({ day: d, top, below: weekOneBelow() + communityBelow(), tasks: [
      ckItem(cQ, 'Questionnaire', 'About 2 minutes', 'now'),
      ckItem(cBp, 'Blood pressure', 'Tonight, 40 seconds', 'later'),
      ckItem(cBand, 'Bracelet', 'Synced overnight', 'done', 'band6'),
      ckItem(gPatch, 'Patch', d === 7 ? 'Last day, it comes off tomorrow' : `Worn today, ${7 - d} days left`, 'done', 'patch6')] });
  } else {
    UI2[id] = home3({ day: d, top, below: homeBelow(d, 30) + communityBelow(), tasks: check ? [
      ckItem(cBp, 'Blood pressure and weight', 'About 2 minutes', 'now'),
      ckItem(cQ, 'Check-in questionnaire', 'About 10 minutes', 'later', '', 'view:12A'),
      ckItem(cBand, 'Bracelet', 'Synced overnight', 'done', 'band3')] : routineTasks() });
  }
  /* the views menu, as on every home */
  UI2[id] = UI2[id].replace('<div class="u-nav"><b>',
    `<div class="u-nav j-nav--menu">${topToggle('today')}<b>`);
  return id;
};

/* the home on a renewal day (22.OCT.2026): the same screen, its top card
   following where the cycle is. Days 1 to 7 of a cycle are patch week
   again; days 30 and 60 bring that month's report; day 80 tells what's changing in the
   next cycle (in the last cycle, says how the study ends) and after it
   a line says the new patch is on its way; day 90 closes the cycle, a
   year on day 360 and the whole study on day 720 */
const cycleTop = (k, lead, note, more = '') => card(`<p class="u-k">${k}</p><p class="u-lead">${lead}</p><p class="u-note">${note}</p>${more}`, 'u-card--edge j-cyc');
const cycleEnd = (d) => {
  const c = cycleOf(d);
  if (d >= MAX_DAY) return card(`<div class="j-mo"><span class="j-ok"></span><p class="u-lead u-lead--big">Two years. You did it</p>
    <p class="u-note u-note--c">The study is complete. Your final report is in Library, and a prepaid box for the devices is on its way.</p></div>`, 'u-card--edge');
  if (d === 360) return cycleTop('One year in the study', 'The study phone is yours',
    `Cycle ${c} is done, and so is your first year. Cycle ${c + 1} starts tomorrow with patch week.`,
    '<span class="u-btn" data-tap="view:yr">What this means</span>');
  return cycleTop(`Cycle ${c} complete`, 'Your 90-day report is ready',
    `Built from all ${d} days. Cycle ${c + 1} starts tomorrow with patch week.`,
    '<span class="u-btn" data-tap="view:14A">Open report</span>');
};
/* the study updates for the next cycle, drawn per cycle */
const renewOffer = (c) => {
  const id = 'rn@' + c, from = STUDY_DAYS * c + 1, to = STUDY_DAYS * (c + 1);
  if (UI2[id]) return id;
  UI2[id] = scr2(`
    <p class="j-back" data-tap="back">${chev()}</p>
    ${nav('Study updates', `Day ${from - 11}`)}
    ${card(`<p class="u-note">Cycle ${c + 1}, days ${from} to ${to}, starts on its own. Your devices stay connected and your routine doesn’t change.</p>`, 'u-card--edge')}
    ${to <= 360 ? card(yearPhone(from - 11, 'Stay a year, keep the phone', to === 360 ? `Cycle ${c + 1} takes you to day 360: <b>a year</b>, and the phone is yours.` : `Cycle ${c + 1} takes you to day ${to}.`), 'j-yr') : ''}
    ${rows([['New patch arrives', `By day ${from - 2}`], ['Patch week', `Days ${from} to ${from + 6}`], ['Monthly reports', `Days ${from + 29}, ${from + 59}, ${to}`], [`Cycle ${c + 1} ends`, c + 1 === CYCLES ? `Day ${to}, two years` : `Day ${to}`]])}
    <div class="u-thumb"><span class="u-btn u-btn--xl" data-tap="home">Got it</span></div>`, false);
  return id;
};
const renewalHome = (d) => {
  const id = 'home@' + d;
  if (UI2[id]) return id;
  const c = cycleOf(d), n = dayIn(d), last = c === CYCLES;
  let top = '';
  if (n === 1) top = cycleTop(`Cycle ${c}`, 'Patch week again', `Wear your new patch until day ${d + 6}. Everything else stays as it was.`);
  else if (n === 30 || n === 60) top = report30(true, (c - 1) * 3 + n / 30);
  else if (n === 80) top = last
    ? cycleTop('10 days to go', `The study ends on day ${MAX_DAY}`, 'Your final report comes that day, and a prepaid box for the bracelet, cuff and scale.')
    : cycleTop('Study update', `Cycle ${c + 1} starts on day ${d + 11}`, 'Nothing to set up again.', `<span class="u-btn" data-tap="view:${renewOffer(c)}">See what’s changing</span>`);
  else if (n === STUDY_DAYS) top = cycleEnd(d);
  else if (reportSoon(d)) top = nextReport(d);
  const note = n > 80 && n < STUDY_DAYS && !last ? `Cycle ${c + 1} starts on day ${STUDY_DAYS * c + 1}. Your new patch arrives by day ${STUDY_DAYS * c - 1}.` : '';
  const tasks = n <= 7 ? [
    ckItem(cBp, 'Blood pressure and weight', 'About 2 minutes', 'now'),
    ckItem(cQ, 'Questionnaire', 'Wednesday', 'later'),
    ckItem(cBand, 'Bracelet', 'Synced overnight', 'done', 'band3'),
    ckItem(gPatch, 'Patch', n === 7 ? 'Last day, it comes off tomorrow' : `Worn today, ${7 - n} days left`, 'done')]
    : n % 30 === 0 ? [
    ckItem(cBp, 'Blood pressure and weight', 'About 2 minutes', 'now'),
    ckItem(cQ, 'Check-in questionnaire', 'About 10 minutes', 'later', '', 'view:12A'),
    ckItem(cBand, 'Bracelet', 'Synced overnight', 'done', 'band3')] : routineTasks();
  UI2[id] = withMenu(home3({ day: d, top: top + triviaCard(d), note, below: homeBelow(d, 30) + communityBelow(), tasks }), 'today');
  return id;
};

/* ==========================================================================
   v03: the views menu follows the timeline (20.OCT.2026). This week and This
   month are drawn for the day of the moment you opened them from: the week
   strip covers that day's week with real dates and what came in so far;
   the roadmap marks that day's stage as now. Day 1 is Saturday, Sep 20.
   The engine opens these (journey-v03.js goTo); 6A and 1A stay as drawn
   for their own moments
   ========================================================================== */
const STUDY_START = new Date(2026, 8, 20);
const dateOf = (d) => { const t = new Date(STUDY_START); t.setDate(t.getDate() + d - 1); return t; };
const shortDate = (t) => t.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
const withMenu = (html, v) => html.replace('<div class="u-nav"><b>',
  `<div class="u-nav j-nav--menu">${topToggle(v)}<b>`);
/* v04 (29.OCT.2026): this week as a block (strip and note), for the roadmap */
const weekBlock = (day) => {
  const from = day - ((day - 1) % 7), to = from + 6;
  const slots = Array.from({ length: 7 }, () => 'none');
  for (let d = from; d <= to; d++) slots[(dateOf(d).getDay() + 6) % 7] = d < day ? (d % 9 === 4 ? 'part' : 'ok') : 'none';
  const doneDays = Math.max(0, day - from), a = dateOf(from), b = dateOf(to);
  const range = a.getMonth() === b.getMonth() ? `${shortDate(a)}–${b.getDate()}` : `${shortDate(a)}–${shortDate(b)}`;
  return `${sec(`This week<span>${range}</span>`)}${week(slots)}
    <p class="u-note j-wk__n">${doneDays ? `${doneDays} day${doneDays === 1 ? '' : 's'} in so far` : 'Starts today'}. Missed days don’t count.</p>`;
};
const weekView = (day) => {
  const from = day - ((day - 1) % 7), to = from + 6;
  /* the strip runs Monday to Sunday: place each study day on its weekday */
  const slots = Array.from({ length: 7 }, () => 'none');
  for (let d = from; d <= to; d++) {
    const wd = (dateOf(d).getDay() + 6) % 7;
    slots[wd] = d < day ? (d % 9 === 4 ? 'part' : 'ok') : 'none';
  }
  const doneDays = Math.max(0, day - from);
  const a = dateOf(from), b = dateOf(to);
  const range = a.getMonth() === b.getMonth() ? `${shortDate(a)}–${b.getDate()}` : `${shortDate(a)}–${shortDate(b)}`;
  return withMenu(scr2(`
    ${nav('This week', range)}
    ${week(slots)}
    <p class="u-note j-wk__n">${doneDays ? `${doneDays} day${doneDays === 1 ? '' : 's'} in so far` : 'Starts today'}. Missed days don’t count.</p>
    ${card(`<p class="u-k">Next</p>
      ${rows([['BP and weight', 'Tonight, 2 minutes'], ['Questionnaire', day <= 7 ? 'Friday, 2 minutes' : 'Wednesday, 2 minutes']])}`)}`), 'week');
};
/* the roadmap's stage for a day: week 1 (setup is done by the time the
   menu, and so the roadmap, is there), weeks 2 to 4, the report on day 30,
   then the next month */
const roadAt = (day) => day <= 7 ? SETUP + 1 : day <= 29 ? SETUP + 2 : day === 30 ? SETUP + 3 : SETUP + 4;
/* This month, one screen (merged roadmap and month preview, 20.OCT.2026):
   where you are in the month's stages, what last month added up to (from
   month 2), how much it asks, and what's involved. Follows the 90-day
   cycle: month 1 has setup and the patch week; month 2 is the routine and
   the day 60 check-in; month 3 ends with the choice to continue and the
   90-day report */
const MONTHS = [
  { name: 'first', stages: [['Setup and patch week', 'Days 1 to 7', 1, 7], ['Weeks 2 to 4', 'Days 8 to 29', 8, 29], ['Your monthly report', 'Day 30', 30, 30]],
    involved: [['Patch', 'Week 1'], ['Bracelet', 'Always'], ['Blood pressure and weight', 'Daily'], ['Questionnaire', '3× a week'], ['Monthly report', 'Day 30']] },
  { name: 'second', stages: [['The routine', 'Days 31 to 59', 31, 59], ['Check-in and report', 'Day 60', 60, 60]],
    involved: [['Bracelet', 'Always'], ['Blood pressure and weight', 'Daily'], ['Questionnaire', '3× a week'], ['Check-in', 'Day 60'], ['Monthly report', 'Day 60']] },
  { name: 'third', stages: [['The routine', 'Days 61 to 79', 61, 79], ['Study updates', 'Day 80', 80, 80], ['The routine', 'Days 81 to 89', 81, 89], ['Final check-in and 90-day report', 'Day 90', 90, 90]],
    involved: [['Daily routine', 'As before'], ['Study updates', 'Day 80'], ['Final check-in', 'Day 90'], ['90-day report', 'Day 90'], ['Next cycle', 'Patch week again']] },
];
const monthView = (day) => {
  /* a renewal cycle's months are the first cycle's, days moved on: patch
     week instead of setup, and the last cycle ends the study instead of
     asking to continue */
  const c = cycleOf(day), off = (c - 1) * STUDY_DAYS, mi = Math.min(2, Math.floor((day - off - 1) / 30)), m0 = MONTHS[mi];
  const span = (a, z) => (a === z ? `Day ${a}` : `Days ${a} to ${z}`);
  const m = off ? { name: m0.name, stages: m0.stages.map(([nm, , a, z]) => [
      nm.replace('Setup and patch week', 'Patch week').replace('Study updates', c === CYCLES ? 'Get ready for the end' : 'Study updates')
        .replace('Final check-in and 90-day report', c === CYCLES ? 'Final check-in and report' : `Cycle ${c} check-in and report`), span(a + off, z + off), a + off, z + off]),
    involved: m0.involved.map(([k, v]) => [k, v.replace(/Day (\d+)/, (x, n) => `Day ${+n + off}`).replace('Patch week again', c === CYCLES ? 'The study ends' : 'Patch week again')]) } : m0;
  const from = off + mi * 30 + 1, to = from + 29;
  /* one "You are here" only: if stages overlap, the latest one that has
     started is now and any earlier one counts as done */
  const nowAt = m.stages.reduce((k, [, , a], i) => (day >= a ? i : k), -1);
  const stages = m.stages.map(([name, when, a, z], i) => {
    const st = i < nowAt || day > z ? 'done' : i === nowAt ? 'now' : 'next';
    return `<li class="is-${st}"><i aria-hidden="true"></i><span><b>${name}</b><em>${when}</em></span>${st === 'now' ? '<s>You are here</s>' : ''}</li>`;
  }).join('');
  const recap = mi ? card(`<p class="u-k">Last month, in short</p>
      <p class="u-note">${from - 2} of ${from - 1} days of data · $${earnedBy(from)} earned</p>
      <p class="u-note">Your month ${(c - 1) * 3 + mi} report is in Library.</p>`, 'j-mrecap') : '';
  const ask = mi === 0
    ? card(`<p class="u-lead">Most of the work is in week one</p><p class="u-note"><b>About 40 minutes</b> in week one, then <b>about 20 minutes a week</b>.</p>${effort()}`, 'u-card--edge')
    : card(`<p class="u-lead">${mi === 1 ? 'A steady month' : 'The last month of this cycle'}</p><p class="u-note">${mi === 1 ? 'About 20 minutes a week, no patch and no setup.' : 'The same routine, then your 90-day report and a choice to continue.'}</p>`, 'u-card--edge');
  /* v04 (29.OCT.2026): This week and This month merge into one Roadmap,
     drawn as the roadmap concept (1A): a timeline of steps, done ones
     ticked, where you are open in its card with "You are here", and the
     coming steps folded. Month one keeps its own steps (kit, setup, week
     one and its tasks, weeks 2 to 4, the report, the month coming round);
     later months use that month's stages on the same timeline */
  const first = !off && mi === 0;
  /* each stage carries its tasks, and the open one says where you are in
     it on this day: day N of M and how many to go */
  const TASKS = {
    routine: [[cBand, 'Bracelet', 'Always on'], [cBp, 'BP + weight', 'Daily', '2 minutes'], [cQ, 'Questionnaire', '3× a week', '2 minutes']],
    patch: [[`<div class="j-gs">${gPatch}${cBand}</div>`, 'Patch + bracelet', 'Wear all week'], [cBp, 'BP + weight', 'Daily', '2 minutes'], [cQ, 'Questionnaire', '3× a week', '2 minutes']],
    check: [[cBp, 'Final reading', 'Unlocks the report', '40 seconds'], [cReport, 'Your report', 'Ready the same day', '3 minutes']],
    decide: [[gBell, 'Study updates', 'In the app', '1 minute'], [cBp, 'Routine', 'Carries on']],
  };
  const kind = (n) => /routine|Weeks 2/i.test(n) ? 'routine' : /patch week/i.test(n) ? 'patch' : /check-in|report/i.test(n) ? 'check' : /updates|end/i.test(n) ? 'decide' : '';
  const prog = (a, z) => day < a ? '' : a === z ? 'Today' : `Day ${day - a + 1} of ${z - a + 1} · ${z - day ? `${z - day} day${z - day === 1 ? '' : 's'} to go` : 'last day'}`;
  const FIRST_SPAN = { 'Week 1': [1, 7], 'Weeks 2 to 4': [8, 29], 'Your report': [30, 30] };
  const road = first
    ? ROAD.map((r) => (r.name === 'Set up devices' ? { ...r, when: 'Done, Sep 20', act: '' } : FIRST_SPAN[r.name] ? { ...r, note: prog(...FIRST_SPAN[r.name]) } : r))
    : m.stages.map(([name, when, a, z]) => ({ name, when, tasks: TASKS[kind(name)] || [], note: prog(a, z) }))
      .concat([{ name: mi === 2 ? (c === CYCLES ? 'The study ends' : `Cycle ${c + 1}`) : 'Next month', when: `From day ${to + 1}`, cycle: mi < 2 || c < CYCLES }]);
  /* what's behind you comes first, done and folded: earlier cycles, then
     this cycle's earlier months with their reports */
  const MNAME = ['First month', 'Second month', 'Third month'];
  const past = first ? [] : [
    ...(c > 1 ? [{ name: c > 2 ? `Cycles 1 to ${c - 1}` : 'Cycle 1', when: `Done, days 1 to ${off}` }] : []),
    ...Array.from({ length: mi }, (_, k) => ({ name: MNAME[k], when: `Done, days ${off + k * 30 + 1} to ${off + k * 30 + 30}`,
      tasks: [[cReport, `Month ${(c - 1) * 3 + k + 1} report`, 'Ready to read', '', k % 2 ? 'view:14A' : 'view:15D']] })),
  ];
  road.unshift(...past);
  const at = first ? roadAt(day) : past.length + Math.max(0, nowAt);
  /* only the open step shows how far along you are */
  road.forEach((r, k) => { if (k !== at && r.note) r.note = ''; });
  const steps = `<div class="j-road2">${road.map((r, k) => roadStep(r, k < at ? 'done' : k === at ? 'now' : 'next', k === at)).join('')}</div>`;
  const real = road.filter((r) => !r.cycle);
  return withMenu(scr2(`
    <div class="u-nav"><b>Your roadmap</b><span class="j-day">${dayLine(day).replace(/^Cycle \d+ · /, '')}</span></div>
    <p class="j-sub"><b>Step ${Math.min(at, real.length - 1) + 1} of ${real.length}</b> · ${road[at].name}</p>
    ${steps}
    ${first ? '' : recap}`, 'road'), 'month');
};
/* v04 (30.OCT.2026): before anything else, confirm the account, then set a
   4-digit code. The code guards the app's health data, in place of the
   password each report used to ask for. A key press adds a dot, as a view
   of its own (ac-code.1 to .4); the last one opens Set code */
UI2['ac-confirm'] = scr2(`
  <div class="u-nav"><b>Confirm your account</b></div>
  <p class="u-note">Check that this is you before you start.</p>
  ${rows([['Name', 'Sam'], ['Study ID', 'PR-2291'], ['Study', 'Prolaio Heart Study']])}
  <div class="u-thumb"><p class="j-sup" data-tap="toast:Call (617) 555-0142 from your personal phone">Not you? Call from your personal phone<br><b>(617) 555-0142</b></p>
    <span class="u-btn u-btn--xl" data-tap="view:ac-code">That’s me</span></div>`, false);
const acCode = (n) => {
  const to = n < 4 ? `view:ac-code.${n + 1}` : 'toast:That’s all four digits';
  const key = (k) => `<span class="j-key${n < 4 && k === String(n + 1) ? ' j-key--next' : ''}" data-tap="${to}" role="button">${k}</span>`;
  return scr2(`
  <div class="u-nav"><b>Set a code</b></div>
  <div class="j-rpl">
    <span class="j-rpl__i" aria-hidden="true">${lockG}</span>
    <p class="u-lead u-lead--big">Choose a 4-digit code</p>
    <p class="u-note u-note--c">You’ll enter it to open the app, so your health data stays private.</p>
    <div class="j-dots" role="img" aria-label="${n} of 4 digits">${[0, 1, 2, 3].map((k) => `<i${k < n ? ' class="is-on"' : ''}></i>`).join('')}</div>
    <div class="j-keys">${[1, 2, 3, 4, 5, 6, 7, 8, 9].map((k) => key(String(k))).join('')}<span></span>${key('0')}<span class="j-key j-key--del" data-tap="view:${n > 1 ? `ac-code.${n - 1}` : 'ac-code'}" role="button" aria-label="Delete">⌫</span></div>
  </div>
  <div class="u-thumb"><span class="u-btn u-btn--xl${n < 4 ? ' is-gated' : ''}"${n < 4 ? '' : ' data-tap="view:2A"'}>Set code</span></div>`, false);
};
UI2['ac-code'] = acCode(0);
[1, 2, 3, 4].forEach((n) => { UI2[`ac-code.${n}`] = acCode(n); });
/* onboarding has no views menu: the roadmap opens from it only once setup is done */
['ac-confirm', 'ac-code', 'ac-code.1', 'ac-code.2', 'ac-code.3', 'ac-code.4', '2A', '1B'].forEach((id) => { UI2[id] = UI2[id].replace('class="u-scr is-v2 ', 'class="u-scr is-v2 j-onb '); });

/* ==========================================================================
   Scenarios (22.OCT.2026): what if setup is left unfinished or isn't
   needed, day one has nothing to do, tasks go in any order, a participant
   fixes a problem themselves, the consent changes, a year is reached, or
   the participant uses their own phone (BYOD, outlined). Each is a detour
   off the main line (journey-v03.js), drawn from the main screens' parts
   ========================================================================== */
Object.assign(UI2, {
  /* 1 · setup left unfinished: the next morning, Today still holds it, and
     says plainly what can't reach the study until it is done */
  'sc-skip': withMenu(resumeHome(2)
    .replace(dayLine(1), dayLine(2))
    .replace('Welcome back. Setup is saved where you stopped.', 'Setup isn’t finished. Until the cuff and scale are connected, their readings can’t reach the study.'), 'today'),
  /* 3 · nothing is due on day one: Today says so, and what comes next */
  'sc-free': withMenu(home3({ day: 1, label: 'Coming up',
    top: card(`<p class="u-lead">Nothing to do today</p>
      <p class="u-note">Keep your bracelet and patch on. Your first questionnaire opens tomorrow at 8:00 AM.</p>`, 'u-card--edge'),
    tasks: [
      ckItem(cQ, 'First questionnaire', 'Tomorrow, 8:00 AM', 'later'),
      ckItem(cBp, 'Blood pressure', 'Tomorrow evening', 'later')] }), 'today'),
  /* 4 · no set order: every task can be started now, one already done */
  'sc-any': withMenu(home3({ day: 1, note: 'Do these in any order, whenever suits you today.',
    tasks: [
      ckItem(cQ, 'First questionnaire', 'About 2 minutes', 'now'),
      ckItem(cBp, 'Blood pressure', '40 seconds', 'now'),
      ckItem(cWeight, 'Weight', '197.5 lbs, 9:40 AM', 'done', 'scale1')] }), 'today'),
});

/* 5 · fixing it yourself: the bracelet hasn't synced. Three steps, a minute
   each; after each, it synced or it didn't. If none works, the study team */
const tsStep = (n, title, how, next) => scr2(`
  <p class="j-back" data-tap="back">${chev()}</p>
  ${nav('Bracelet not syncing', `Step ${n} of 3`)}
  ${card(`<p class="u-lead">${title}</p><p class="u-note">${how}</p>`, 'u-card--edge')}
  <div class="u-thumb j-pair"><p class="u-note j-thumb__note">Your bracelet keeps its data for up to 7 days, so nothing is lost while you try.</p><span class="u-btn u-btn--xl u-btn--ghost" data-tap="view:${next}">Still not syncing</span><span class="u-btn u-btn--xl" data-tap="view:ts-ok">It synced</span></div>`, false);
Object.assign(UI2, {
  'ts-1': tsStep(1, 'Bring your phone close', 'Hold your phone next to the bracelet with the app open for a minute.', 'ts-2'),
  'ts-2': tsStep(2, 'Turn Bluetooth off and on', 'In your phone’s settings, turn Bluetooth off, wait 5 seconds, then turn it back on.', 'ts-3'),
  'ts-3': tsStep(3, 'Restart the bracelet', 'Hold its button for 10 seconds, until the light blinks blue.', 'ts-team'),
  'ts-ok': scr2(`
    ${nav('Bracelet synced')}
    ${card(`<div class="j-mo"><span class="j-ok"></span><p class="u-lead u-lead--big">It’s working again</p>
      <p class="u-note u-note--c">Your bracelet synced at 8:14 AM, and last night’s sleep is in.</p></div>`, 'u-card--edge')}
    <div class="u-thumb"><span class="u-btn u-btn--xl" data-tap="home">Done</span></div>`, false),
  'ts-team': scr2(`
    <p class="j-back" data-tap="back">${chev()}</p>
    ${nav('Bracelet not syncing')}
    <p class="u-note">None of the steps worked. The study team can sort it out with you, or send a new bracelet.</p>
    <div class="j-tm">${danaCard()}${callCard()}</div>
    <p class="u-note">Your bracelet keeps its data for up to 7 days, so nothing is lost yet.</p>`, false),
});

/* 6 · the consent changes mid-study: what is different, marked; agree,
   ask first, or see what saying no means */
Object.assign(UI2, {
  'rc-1': scr2(`
    ${nav('Consent update')}
    <p class="u-note">The study’s consent has changed since you agreed to it. Here’s the one difference.</p>
    <div class="j-rn__cs">
      <p class="is-new"><span>New</span>Your readings may also be used to improve the study’s devices, with your name and details removed.</p>
      <p>Everything else stays the same. Your readings go only to the study team, and you can leave at any time.</p>
    </div>
    <span class="j-rd__how" data-tap="toast:Opens the full consent">Read the full consent ${chev()}</span>
    <span class="j-rn__no" data-tap="view:rc-no">I don’t agree</span>
    <div class="u-thumb j-pair"><span class="u-btn u-btn--xl u-btn--ghost" data-tap="sheet:team">Ask first</span><span class="u-btn u-btn--xl" data-tap="view:rc-done">I agree</span></div>`, false),
  'rc-done': scr2(`
    ${nav('Consent update')}
    ${card(`<div class="j-mo"><span class="j-ok"></span><p class="u-lead u-lead--big">You’re up to date</p>
      <p class="u-note u-note--c">We saved your agreement on Nov 10. You can read it any time in Settings.</p></div>`, 'u-card--edge')}
    <div class="u-thumb"><span class="u-btn u-btn--xl" data-tap="home">Done</span></div>`, false),
  'rc-no': scr2(`
    <p class="j-back" data-tap="back">${chev()}</p>
    ${nav('If you don’t agree')}
    <p class="u-note">Nothing changes for now. The study team will call you to talk it through, and you can still leave the study at any time.</p>
    ${rows([['Your readings so far', 'Used as agreed'], ['Your payments', 'Paid up to today']])}
    <div class="u-thumb j-pair"><span class="u-btn u-btn--xl u-btn--ghost" data-tap="back">Back</span><span class="u-btn u-btn--xl" data-tap="sheet:team">Contact the team</span></div>`, false),
});

/* 7 · a year in the study: the study phone is the participant's, unlocked */
UI2['yr'] = scr2(`
  ${nav('One year')}
  ${card(`<div class="j-mo"><span class="j-ok"></span><p class="u-lead u-lead--big">The study phone is yours</p>
    <p class="u-note u-note--c">You’ve taken part for a year, so you keep the phone. We’ll unlock it, so it works with any carrier like any other phone.</p></div>`, 'u-card--edge')}
  ${rows([['Unlocked', 'From Oct 1'], ['Your photos and apps', 'Stay on the phone'], ['Your study data', 'Stays with the study']])}
  <p class="u-note u-note--c">If you keep taking part, the study app stays on it and nothing else changes.</p>`, false);

/* BYOD, outlined: taking part on your own phone. The phone closing the
   app in the background, and moving to a new phone */
Object.assign(UI2, {
  'byod-4': scr2(`
    ${nav('Readings are waiting')}
    <p class="u-note">Your phone closed Prolaio in the background, so last night’s readings haven’t been sent. Opening the app for a minute sends them.</p>
    ${card(`<p class="u-k">So it doesn’t happen again</p>
      <ol class="j-fixes"><li>Open your phone’s <b>battery settings</b>.</li><li>Find <b>Prolaio</b>.</li><li>Turn off <b>battery saving</b> for it.</li></ol>`, 'u-card--edge')}
    <div class="u-thumb"><span class="u-btn u-btn--xl" data-tap="toast:Opens your battery settings">Open battery settings</span></div>`, false),
  'byod-5': scr2(`
    <p class="j-back" data-tap="back">${chev()}</p>
    ${nav('Moving to a new phone')}
    ${card(`<ol class="j-fixes"><li><b>Install Prolaio</b> on the new phone.</li><li>Sign in with your study code, <b>PR-2291</b>.</li><li>Your devices <b>reconnect on their own</b>, and nothing is lost.</li></ol>`, 'u-card--edge')}
    <p class="u-note">Keep the old phone nearby until the new one shows all four devices as connected.</p>`, false),
});

/* the community composer: what to leave out, so posts stay anonymous */
UI2X['cm-new'] = sheet(`<p class="u-lead u-lead--big">Start a thread</p>
  <div class="j-cm__in" aria-label="Your question">Ask the others in the study…</div>
  <div class="j-cm__rule"><b>Keep it anonymous</b><p>Leave out names, phone numbers, addresses, photos of faces, and details like your doctor’s or employer’s name. The study team checks each post before it appears.</p></div>
  <p class="u-note">You post as <b>Gentle Fern</b>, a random name that isn’t linked to you on screen.</p>
  <span class="u-btn u-btn--xl" data-tap="toast:Sent for review. It appears once the study team checks it">Post for review</span>`);

/* ==========================================================================
   v03: Status, Earnings and What you've done follow the day (22.OCT.2026).
   Opened on a day other than the one they were drawn for (the day line
   slid, or a later moment), they are drawn for that day, so the numbers
   match the home screen's strip and the timeline. The engine asks
   pageAt(id, day) before it opens one (journey-v03.js goTo)
   ========================================================================== */
const statusAt = (d) => {
  const t = dateOf(d), next = Math.min(MAX_DAY, (Math.floor(d / 30) + 1) * 30), pw = dayIn(d);
  return scr2(`
    ${nav('You are on track', shortDate(t))}
    <p class="j-sub"><b>${dayLine(d)}</b> · ${t.toLocaleDateString('en-US', { weekday: 'long' })}</p>
    <p class="u-note j-on__l">Everything up to this morning is in.</p>
    <p class="j-helps__k">Latest from each device</p>
    <div class="j-today">
      <span>${cBp}<em>BP cuff</em><b>118 / 76</b><i>Last night</i></span>
      <span>${cWeight}<em>Scale</em><b>196.1 lbs</b><i>This morning</i></span>
      <span>${cBand}<em>Bracelet</em><b>6h 48m</b><i>Sleep, last night</i></span>
      ${d <= 7 ? `<span>${gPatch}<em>Patch</em><b>${d > 1 ? `${(d - 1) * 24 - 2} hours` : 'Just started'}</b><i>No gaps</i></span>` : ''}
    </div>
    ${card(`<p class="u-k">Coming up</p>
      ${rows([pw <= 7 ? ['Patch', `${8 - pw} more days`] : ['Questionnaire', 'Wednesday'],
        pw <= 7 ? ['Questionnaire', 'Wednesday'] : ['Blood pressure', 'Tonight'],
        [d >= MAX_DAY ? 'Your last report' : `Your day ${next} report`, d >= MAX_DAY ? 'Today' : `In ${next - d} days`]])}`)}`, 0);
};
const earningsAt = (d) => {
  const got = (on, amt) => on ? `Paid, ${amt}` : amt;
  if (d > STUDY_DAYS) return renewalEarnings(d);
  const next = d < 8 ? '$40 after patch week' : d < 31 ? '$30 at your day 30 check-in' : d < 60 ? '$50 at your day 60 check-in' : d < 90 ? '$60 at your day 90 check-in' : '';
  return scr2(`
  ${nav('Your earnings', weekOf(d))}
  ${card(`<p class="u-num u-num--c">$${earnedBy(d)}</p>
    <p class="u-note u-note--c">${next ? 'earned so far' : 'Thank you for taking part'}</p>
    <div class="u-prog"><i style="width:${Math.round(earnedBy(d) / 206 * 100)}%"></i></div>
    ${next ? `<p class="u-note u-note--c">Next: ${next}</p>` : ''}`, 'u-card--edge')}
  ${/* v04 (29.OCT.2026): payments and milestone bonuses in one receipt,
     in the order they come; a bonus says Added once it's yours */ ''}
  ${sec('Payments and bonuses')}
  ${/* payments and bonuses told apart: a payment has the pay icon and its
     amount, "Paid" under it once sent; a bonus has the medal icon and its
     amount as "+$2" in green once added; what's still to come is grey */ ''}
  <div class="j-earn">${[
    ['pay', 'Patch week', '$40', d >= 8], ['bonus', 'First week bonus', '$2', d >= 8],
    ['bonus', 'Three-week streak', '$2', d >= 21, d >= 8 ? 'Nearly there' : ''], ['pay', 'Day 30 check-in', '$30', d >= 31],
    ['bonus', '10 questionnaires', '$2', d >= 31, d >= 21 ? '1 to go' : ''], ['bonus', 'First month', '$5', d >= 31],
    ['pay', 'Day 60 check-in', '$50', d >= 60], ['bonus', 'Two months', '$5', d >= 60],
    ['pay', 'Day 90 check-in', '$60', d >= 90], ['bonus', 'All 90 days', '$10', d >= 90],
  ].map(([k, n, amt, on, soon]) => `<div class="j-earn__r is-${k}${on ? ' is-done' : ''}"><i>${k === 'pay' ? mPay : mMedal}</i><span>${n}${soon && !on ? `<em>${soon}</em>` : ''}</span><b>${k === 'bonus' && on ? '+' : ''}${amt}${k === 'pay' && on ? '<em>Paid</em>' : ''}</b></div>`).join('')}</div>
  ${card(yearPhone(d, 'Stay a year, keep the phone'), 'j-yr')}`, 1);
};
/* a renewal cycle pays as the first did: $40 after patch week, then $30,
   $50 and $60 at its check-ins */
const renewalEarnings = (d) => {
  const c = cycleOf(d), n = dayIn(d), off = (c - 1) * STUDY_DAYS, got = (on, amt) => on ? `Paid, ${amt}` : amt;
  const before = 206 + (c - 2) * 180, all = 206 + (CYCLES - 1) * 180;
  const next = d >= MAX_DAY ? '' : n < 8 ? `$40 after patch week, day ${off + 7}` : n < 30 ? `$30 at your day ${off + 30} check-in`
    : n < 60 ? `$50 at your day ${off + 60} check-in` : n < 90 ? `$60 at your day ${off + 90} check-in` : '$40 after next patch week';
  return scr2(`
  ${nav('Your earnings', weekOf(d))}
  ${card(`<p class="u-num u-num--c">$${earnedBy(d)}</p>
    <p class="u-note u-note--c">${next ? 'earned so far' : 'Thank you for taking part'}</p>
    <div class="u-prog"><i style="width:${Math.round(earnedBy(d) / all * 100)}%"></i></div>
    ${next ? `<p class="u-note u-note--c">Next: ${next}</p>` : ''}`, 'u-card--edge')}
  ${sec(`Cycle ${c} payments`)}
  ${rows([['Patch week', got(n >= 8, '$40')], [`Day ${off + 30}`, got(n >= 30, '$30')], [`Day ${off + 60}`, got(n >= 60, '$50')], [`Day ${off + 90}`, got(n >= 90, '$60')]])}
  ${sec('Before this cycle')}
  ${rows([['Cycle 1, with bonuses', 'Paid, $206'], ...(c > 2 ? [[`Cycles 2 to ${c - 1}`, `Paid, $${(c - 2) * 180}`]] : [])])}
  <p class="u-note u-note--c">$${before} before cycle ${c}. Each 90-day cycle pays $180</p>`, 1);
};
const tallyAt = (d) => {
  UI2X['tally.tower@' + d] = tallyView('tower', d);
  UI2X['tally.counts@' + d] = tallyView('counts', d);
  return scr2(`
    ${nav('Data sent', `Day ${d}`)}
    <div data-morph>${tallyView('tower', d)}</div>`, 1);
};
/* each page, the day it was drawn for, and how to draw it for another */
const DAY_PAGES = { '7A': [2, statusAt], '16A': [29, earningsAt], 'v2-3-tally': [19, tallyAt] };
window.pageAt = (id, d) => {
  const res = id.startsWith('res.'), base = id.replace(/^res\./, '').replace(/@\d+$/, ''), pg = DAY_PAGES[base];
  if (!pg || !d) return id;
  if (d === pg[0]) return res ? 'res.' + base : base;
  const k = (res ? 'res.' : '') + base + '@' + d;
  if (!UI2[k]) UI2[k] = res ? asRes(base, pg[1](d)) : pg[1](d);
  return k;
};

/* the free-text note behind "Write a note" on a reading (21.OCT.2026). The
   box shows an example once tapped; Save closes and keeps it with the reading */
const noteSheet = (what, example) => sheet(`<p class="j-sh__k">Add a note</p>
    <p class="u-note">Anything that might have changed this ${what}. Only the study team sees it.</p>
    <span class="j-nbox" data-tap="toggle" role="textbox" aria-label="Note"><em>For example: I had a big lunch</em><b>${example}</b></span>
    <span class="u-btn u-btn--xl" data-tap="close">Save note</span>`);
Object.assign(UI2X, {
  'note.bp': noteSheet('reading', 'I rushed home and sat down right before it. I usually rest first.'),
  'note.sc': noteSheet('weight', 'I weighed myself with shoes on today. I normally don’t.'),
});

/* with the distance screens off (SHOW_DISTANCE), the scale and patch
   connects open at "Right next to it" instead of "About 10 ft away" */
/* the archive (Archived designs, under the prototype) keeps every distance
   state: the scale's three, and the bracelet's setup step at each distance */
const ARCH_BAND = UI2['1B-s2c'];
UI2X['arch.scale'] = [['About 10 ft away', UI2['8A']], ['About 3 ft away', UI2['8A-warm']], ['Right next to it', UI2['8A-hot']]];
UI2X['arch.band'] = [
  ['Too far', ARCH_BAND.replace(UI2X['cn.band.hot'], ddBlock(cBand, 'cold', 'Too far', 'Bring your phone toward the bracelet.', 9, 'cn.band.warm'))],
  ['Getting closer', ARCH_BAND.replace(UI2X['cn.band.hot'], UI2X['cn.band.warm'])],
  ['Almost there', ARCH_BAND]];
if (!SHOW_DISTANCE) Object.assign(UI2, { '8A': UI2['8A-hot'], '1B.far': UI2['1B.hot'] });

/* the trivia question for any day (from the home screen's card): answered,
   with how everyone did */
window.triviaAt = (d) => {
  const id = 'trivia@' + d;
  if (!UI2[id]) {
    const [q, as, right, why, src] = triviaOf(d);
    const votes = as.map((_, k) => k === right ? 612 : 150 + (k * 97 + d * 31) % 200);
    UI2[id] = scr2(`
    <div class="u-back" data-tap="today">‹ Today</div>
    ${nav('Today’s trivia', `Day ${d}`)}
    ${card(`<p class="u-lead">${q}</p>
      <div class="j-pls">${as.map((a, k) => pollBar(k === right ? `${a} ✓` : a, votes[k], 612, k === right)).join('')}</div>
      <p class="u-note">The answer: ${why}</p>${src ? factCite(src) : ''}`, 'u-card--edge')}`);
  }
  return id;
};
for (let d = 3; d <= STUDY_DAYS; d++) window.triviaAt(d);

/* ==========================================================================
   v03 (23.OCT.2026): three counts told apart. The day in the study (Today's
   "Day 17 of 90"), the streak (days in a row your readings came in) and
   days of data (every day the study has data from you). The streak page
   says so, and follows the day line
   ========================================================================== */
const streakAt = (d) => {
  const s = streakBy(d), next = Math.ceil((s + 1) / 7) * 7, to = Math.max(1, next - s);
  return scr2(`
    ${nav('Your streak', `Day ${d}`)}
    <div class="j-sk">
      <span class="j-sk__n">${s}</span>
      <p class="j-sk__t">days in a row with your readings in</p>
    </div>
    ${card(`<p class="u-k">This week</p>
      <div class="j-sk__w">${['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((x, k) =>
        stDay(x, k < 3 ? 'done' : k === 3 ? 'now' : 'next')).join('')}</div>`, 'u-card--edge')}
    ${card(`<p class="u-k">How these differ</p>
      ${rows([[`Day ${d}`, 'Time in the study'], [`${s}-day streak`, 'Days in a row, readings in'], [`${daysOfData(d)} days of data`, 'Every day with your data']])}`, 'u-card--edge j-sk__how')}
    ${card(`<div class="j-sk__bonus"><span class="j-sk__cash">$2</span>
      <p class="u-note"><b>${to} more day${to === 1 ? '' : 's'}</b> to a ${next / 7}-week streak. That adds a <b>$2 bonus</b> to your earnings.</p></div>
      ${prog(`${next / 7}-week streak`, s, next, ' days')}`)}`);
};
UI2['v2-3-streak'] = streakAt(17);
UI2['v2-3-streak-full'] = withBack(UI2['v2-3-streak'], 'v2-3-streak', 'Today');
DAY_PAGES['v2-3-streak-full'] = [17, (d) => withBack(streakAt(d), 'v2-3-streak', 'Today')];

/* v04 (29.OCT.2026): every monthly report is the same report. Month two
   (14A, "What changed") is the day-30 report's layout for days 31 to 60,
   the 60-day tab on, with the changes since last month as one more section
   after Following the plan (spotlit, as each study can hide it) */
UI2['14A'] = UI2['15D']
  .replace('<span class="j-day">Day 30</span>', '<span class="j-day">Day 60</span>')
  .replace('Sep 20 – Oct 19 · first 30 days', 'Oct 20 – Nov 18 · days 31 to 60')
  .replace('<span class="is-on">30 days</span><span class="is-off" aria-disabled="true">60 days</span>', '<span>30 days</span><span class="is-on">60 days</span>')
  .replace(/(<div class="j-rpad">[\s\S]*?<\/div>\s*<\/div>)/, (m) => m + changesSec())
  .replace('class="u-scr is-v2 ', 'class="u-scr is-v2 is-spotlit ');
/* an opened report keeps a copy: one Share report button (30.OCT.2026),
   and its sheet sends it by text or to the email on file. No download */
UI2X['rp.share'] = sheet(`<p class="j-sh__k"><i class="j-shr__g">${gShr}</i>Share report</p>
  <div class="j-crs--rcpt j-shl">
    ${shrRow('M8 3h8a1 1 0 0 1 1 1v16a1 1 0 0 1-1 1H8a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1zM11 18h2', 'Text it to me', 'Link', 'Texted to the number on file')}
    ${shrRow('M4 6h16v12H4zM4 7l8 6 8-6', 'Email it to me', 'PDF', 'Sent to c•••@gmail.com')}
  </div>`);
const pdfBar = `<div class="u-thumb"><span class="u-btn u-btn--xl" data-tap="sheet:rp.share">Share report</span></div>`;
['14A', '15D'].forEach((id) => { UI2[id] = UI2[id].replace(/<\/div>(<div class="j-tabs|<span class="j-hi")/, `${pdfBar}</div>$1`); });
/* the Resources copies were made from the old screens: made again */
['v2-3-streak-full', '14A', '15D'].forEach((id) => { if (UI2['res.' + id]) UI2['res.' + id] = asRes(id, UI2[id]); });

/* FDA (27.OCT.2026): Prolaio's devices and app are FDA cleared, which is
   what sets it apart from a consumer wearable. Said once up front (the
   welcome), marked on each device as it is set up, and said again where a
   reading fails, when trust in the device is in question. Not on Home or
   the daily cards. FDA_WORD is the one place to change if Prolaio confirms
   "approved" rather than "cleared" */
const FDA_WORD = 'FDA cleared';
const fdaG = `<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M8 1.5 13.5 3.6v4c0 3.3-2.3 5.8-5.5 6.9C4.8 13.4 2.5 10.9 2.5 7.6v-4z"/><path d="m5.6 8 1.7 1.7 3.2-3.4"/></svg>`;
const FDA_DEV = { 'Put on your bracelet': 'bracelet', 'Put on your patch': 'patch', 'Take your first blood pressure': 'cuff', 'Take your first weight': 'scale' };
[UI2, UI2X].forEach((store) => Object.keys(store).forEach((k) => {
  let h = store[k];
  if (typeof h !== 'string') return;
  /* the welcome: one line under the study's name (back on 27.OCT.2026) */
  h = h.replace(/(<p class="j-wel__brand[^"]*">[^<]*<\/p>)/, `$1<p class="j-wel__fda">${fdaG}Medical-grade devices and app, ${FDA_WORD}</p>`);
  /* each device step: a mark under the step's title */
  h = h.replace(/(<p class="u-lead j-step__t">([^<]*)<\/p>)/, (m, p, t) => FDA_DEV[t] ? `${p}<p class="j-fda">${fdaG}Medical device, ${FDA_WORD}</p>` : m);
  /* a failed reading: why the device is strict, under the fix */
  if (/data-state="error"/.test(h)) h = h.replace(/(<p class="j-rd__wait">[\s\S]*?<\/p>)/, (m) =>
    `${m}<p class="j-fda-note">${fdaG}Your ${/weight|scale/i.test(h.slice(0, h.indexOf(m))) ? 'scale' : 'cuff'} is a medical device, ${FDA_WORD}. It only saves a reading it can trust.</p>`);
  store[k] = h;
}));

/* a grouped card of labelled rows (from Concepts v03), used by the FDA designs */
const cmtCard = (rows) => `<div class="j-cmt">${rows.map(([k, v]) => `<div class="j-cmt__r"><em>${k}</em><div>${v}</div></div>`).join('')}</div>`;

/* ==========================================================================
   FDA emphasized designs (27.OCT.2026): partner feedback said the app looks
   like general wellness while offering less than a wellness app does. Three
   concepts, drawn for their section under the prototype, outside the flow:
   trend screens at the level people expect, a report a study clinician has
   reviewed that you can give your own doctor, and what a study that hides
   readings says instead of a blank */
/* a line chart with axes: series as 0-100 values, your usual range as a
   band, a gap where a device was not used, and an optional held day */
const fdChart = ({ series, band = [], gap, yl, xl, hold }) => {
  const W = 240, H = 104, L = 22, T = 6, B = 88, n = series[0][0].length;
  const x = (i) => L + i * (W - L) / (n - 1), y = (v) => B - v / 100 * (B - T);
  const lines = (vals) => {
    const segs = [[]];
    vals.forEach((v, i) => {
      if (gap && i >= gap[0] && i <= gap[1]) { if (segs[segs.length - 1].length) segs.push([]); }
      else segs[segs.length - 1].push(`${x(i).toFixed(1)},${y(v).toFixed(1)}`);
    });
    return segs.filter((s) => s.length);
  };
  return `<svg class="j-fdc" viewBox="0 0 ${W} ${H}" role="img" aria-label="Chart">
    ${band.map(([lo, hi]) => `<rect x="${L}" y="${y(hi)}" width="${W - L}" height="${y(lo) - y(hi)}" class="j-fdc__band"/>`).join('')}
    ${yl.map(([v, t]) => `<line x1="${L}" x2="${W}" y1="${y(v)}" y2="${y(v)}" class="j-fdc__grid"/><text x="0" y="${y(v) + 3}">${t}</text>`).join('')}
    ${gap ? `<rect x="${x(gap[0] - 1) + 3}" y="${T}" width="${x(gap[1] + 1) - x(gap[0] - 1) - 6}" height="${B - T}" class="j-fdc__gap"/>` : ''}
    ${series.map(([vals, cls]) => lines(vals).map((s) => `<polyline points="${s.join(' ')}" class="j-fdc__l ${cls}"/>`).join('')).join('')}
    ${hold == null ? series.map(([vals, cls]) => `<circle cx="${x(n - 1)}" cy="${y(vals[n - 1])}" r="2.6" class="j-fdc__d ${cls}"/>`).join('') : ''}
    ${hold != null ? `<line x1="${x(hold)}" x2="${x(hold)}" y1="${T}" y2="${B}" class="j-fdc__hold"/>${series.map(([vals, cls]) => `<circle cx="${x(hold)}" cy="${y(vals[hold])}" r="3.2" class="j-fdc__d is-ring ${cls}"/>`).join('')}` : ''}
    ${xl.map(([i, t], k) => `<text x="${x(i)}" y="${H - 2}" text-anchor="${k === 0 ? 'start' : k === xl.length - 1 ? 'end' : 'middle'}">${t}</text>`).join('')}
  </svg>`;
};
/* nightly bars, for sleep */
const fdBars = (vals, band, labels) => {
  const W = 240, H = 104, L = 22, T = 6, B = 88, bw = (W - L) / vals.length;
  const y = (v) => B - v / 100 * (B - T);
  return `<svg class="j-fdc" viewBox="0 0 ${W} ${H}" role="img" aria-label="Chart">
    <rect x="${L}" y="${y(band[1])}" width="${W - L}" height="${y(band[0]) - y(band[1])}" class="j-fdc__band"/>
    ${[[100, '9h'], [50, '6h'], [0, '3h']].map(([v, t]) => `<line x1="${L}" x2="${W}" y1="${y(v)}" y2="${y(v)}" class="j-fdc__grid"/><text x="0" y="${y(v) + 3}">${t}</text>`).join('')}
    ${vals.map((v, i) => `<rect x="${L + i * bw + bw * .22}" y="${y(v)}" width="${bw * .56}" height="${B - y(v)}" rx="3" class="j-fdc__bar${i === vals.length - 1 ? ' is-now' : ''}"/>
      <text x="${L + i * bw + bw / 2}" y="${H - 2}" text-anchor="middle">${labels[i]}</text>`).join('')}
  </svg>`;
};
const fdSeg = (on) => `<div class="j-fds">${['7 days', '30 days', 'All study'].map((t) =>
  `<span${t === on ? ' class="is-on"' : ''} data-tap="toast:Shows ${t === 'All study' ? 'the whole study' : `the last ${t}`}">${t}</span>`).join('')}</div>`;
const fdStats = (cells) => `<div class="j-fdst">${cells.map(([k, v]) => `<span><em>${k}</em><b>${v}</b></span>`).join('')}</div>`;
const fdKey = (items) => `<p class="j-fdk">${items.map(([cls, t]) => `<span><i class="${cls}"></i>${t}</span>`).join('')}</p>`;
const fdPill = (t) => `<em class="j-fdp">${t}</em>`;
/* a sheet over a screen, for a still in the section */
const fdOver = (scr, sh) => scr.replace(/<\/div>$/, `${sh}</div>`);

/* 1. trend screens: blood pressure over 30 days (top and bottom number,
   the cuff's gap marked), the same chart held on one day, and sleep as
   nightly bars */
const FD_SYS = [52, 58, 46, 55, 60, 50, 56, 62, 54, 49, 57, 60, 53, 58, 0, 0, 55, 51, 59, 56, 52, 57, 61, 54, 50, 56, 58, 53, 55, 57];
const FD_DIA = FD_SYS.map((v, i) => 12 + v * .3 + (i % 3) * 1.5);
const fdBp = (hold) => scr2(`
  <div class="u-back" data-tap="back">‹ Today</div>
  ${nav('Blood pressure', 'BP cuff')}
  ${fdSeg('30 days')}
  ${card(`<div class="j-fdh"><p class="j-trv__k">${hold != null ? 'Oct 7, 8:02 PM' : '30-day average'}</p>${hold != null ? '' : fdPill('In your usual range')}</div>
    <b class="j-trv__n">${hold != null ? '121 / 78' : '118 / 76'}<small class="j-fdu">mmHg</small></b>
    ${hold != null ? '<p class="j-fdn">Pulse 66 · Sitting · Evening reading</p>' : ''}
    ${fdChart({ series: [[FD_SYS, 'is-a'], [FD_DIA, 'is-b']], band: [[47, 62], [24, 34]], gap: [14, 15], hold,
      yl: [[90, '140'], [50, '110'], [10, '80']], xl: [[0, 'Sep 28'], [14, 'Oct 12'], [29, 'Today']] })}
    ${fdKey([['is-a', 'Top'], ['is-b', 'Bottom'], ['is-band', 'Usual'], ['is-gap', 'No reading']])}`, 'j-fdcard')}
  ${fdStats([['Lowest', '109 / 70'], ['Average', '118 / 76'], ['Highest', '127 / 82']])}
  <p class="j-fdn">Your usual range comes from your first week. Hold the chart to read any day.</p>
  <span class="j-fdrow" data-tap="toast:Every reading, newest first">Every reading <em>58</em>${chev()}</span>`, 0);
const fdSleep = scr2(`
  <div class="u-back" data-tap="back">‹ Today</div>
  ${nav('Sleep', 'Bracelet')}
  ${fdSeg('7 days')}
  ${card(`<div class="j-fdh"><p class="j-trv__k">Nightly average</p>${fdPill('↑ 20 min since day 1')}</div>
    <b class="j-trv__n">6h 48m</b>
    ${fdBars([58, 44, 62, 55, 49, 66, 60], [45, 62], ['Th', 'Fr', 'Sa', 'Su', 'Mo', 'Tu', 'We'])}
    ${fdKey([['is-bar', 'Asleep'], ['is-band', 'Your usual']])}`, 'j-fdcard')}
  ${fdStats([['Shortest', '5h 39m'], ['Bedtime', '10:52 PM'], ['Longest', '7h 50m']])}
  <span class="j-fdrow" data-tap="toast:Every night, newest first">Every night <em>19</em>${chev()}</span>`, 0);

/* 3. the monthly report, reviewed by the study's clinician, with a way to
   give it to your own doctor: a link that expires, a PDF, or on paper */
const fdMini = (vals) => `<span class="j-fdm">${spark(vals)}</span>`;
const fdReport = scr2(`
  <div class="u-back" data-tap="back">‹ Library</div>
  ${nav('October report', 'Days 1–30')}
  ${card(`<div class="j-fdrv"><span class="j-fdav">SC</span><div><b>Reviewed by the study cardiologist</b><em>Oct 31 · ECG and blood pressure</em></div></div>
    <p class="j-fdq">Nothing needed follow-up this month. Your readings were steady.</p>`, 'j-fdcard')}
  ${sec('In this report, with sleep and weight')}
  <div class="j-fdls">
    <span class="j-fdl">${cHeart}<b>Heart rhythm<em>312 hours, ECG patch</em></b>${fdMini([50, 50, 50, 50, 50, 50, 50])}</span>
    <span class="j-fdl">${cBp}<b>Blood pressure<em>58 readings, cuff</em></b>${fdMini([52, 58, 46, 55, 60, 50, 56])}</span>
  </div>
  <div class="u-thumb"><span class="u-btn u-btn--xl" data-tap="sheet:fd-share">Share with your doctor</span>
    <span class="j-rn__no" data-tap="toast:Saved to Files as a PDF">Download PDF</span></div>`, 2);
const fdOpt = (t, s, on) => `<span class="j-fdo${on ? ' is-on' : ''}"><i></i><b>${t}<em>${s}</em></b></span>`;
const fdTick = (t, on = true) => `<span class="j-fdt${on ? ' is-on' : ''}"><i></i>${t}</span>`;
UI2X['fd-share'] = sheet(`<p class="j-sh__k">${cReport}Share with your doctor</p>
  <p class="j-sh__sub">October report</p>
  <div class="j-fdos">
    ${fdOpt('A private link', 'Opens for 30 days. You can turn it off', true)}
    ${fdOpt('Email the PDF', 'To an address you type in')}
    ${fdOpt('Print it', 'For a visit in person')}
  </div>
  <p class="j-fdk2">What it includes</p>
  <div class="j-fdts">${fdTick('Charts for each reading')}${fdTick('The cardiologist’s note')}${fdTick('Every reading, as a table', false)}</div>
  <p class="j-fdn">Not a diagnosis. Your doctor sees the same charts you do.</p>
  <span class="u-btn u-btn--xl" data-tap="view:fd-shared">Create link</span>`);
const fdShared = scr2(`
  <div class="u-back" data-tap="back">‹ October report</div>
  <div class="j-fdok"><span class="j-ok"></span><b>Link ready for your doctor</b><em>Send it any way you like, or show the code at your visit.</em></div>
  ${card(`<div class="j-fdlink"><b>prolaio.link/r/7KQ2-M9</b><span data-tap="toast:Link copied">Copy</span></div>`, 'j-fdcard')}
  ${cmtCard([['Opens until', 'Nov 30, then stops by itself'], ['Includes', 'Charts and the cardiologist’s note'], ['Opened', 'Not yet. You’ll see when it is']])}
  <div class="u-thumb j-pair j-pair--even"><span class="u-btn u-btn--xl u-btn--ghost" data-tap="toast:Link turned off">Turn off link</span>
    <span class="u-btn u-btn--xl" data-tap="back">Done</span></div>`, 2);
UI2['fd-shared'] = fdShared;

/* 4. a study that hides readings: the reason instead of a blank, proof the
   devices are recording, what you get at the end; then the end itself */
const fdDev = (g, t, s) => `<span class="j-fdd">${g}<b>${t}</b><em>${s}</em></span>`;
const fdHidden = scr2(`
  ${nav('Your health', 'Day 19')}
  ${card(`<div class="j-fdlock"><span class="j-fdlock__i">${lockG}</span><b>Your readings stay hidden for now</b>
    <em>Results show when the study ends, so seeing them doesn’t change what people do.</em>
    <span class="j-fdrow j-fdrow--in" data-tap="sheet:fd-why">Why studies do this ${chev()}</span></div>`, 'j-fdcard')}
  ${sec('Still recording, all synced')}
  <div class="j-fdds">${fdDev(cBand, 'Bracelet', '8:14 AM')}${fdDev(cPatch, 'ECG patch', '8:14 AM')}${fdDev(cBp, 'BP cuff', 'Last night')}${fdDev(cWeight, 'Scale', '7:45 AM')}</div>
  ${cmtCard([['When the study ends, Mar 2027', 'Every reading, the charts, and a report you can give your doctor.']])}`, 0);
UI2X['fd-why'] = sheet(`<p class="j-sh__k">${cStatus}Why your readings are hidden</p>
  <p class="j-sh__sub">How blinded studies work</p>
  ${cmtCard([['If people see their numbers', 'They often change how they sleep, eat or move. Then the study can’t tell what the treatment did.'],
    ['What stays the same', 'Your devices record everything. The study team still checks it, and calls you if something needs a doctor.'],
    ['What you get', 'All of it when the study ends: every reading, the charts and a report.']])}
  <span class="u-btn u-btn--xl" data-tap="close">Got it</span>`);
const fdEnded = scr2(`
  ${nav('Your health', 'The study has ended')}
  <div class="j-fdok j-fdok--row"><span class="j-ok"></span><div><b>Your readings are ready</b><em>All 90 days, from every device</em></div></div>
  <div class="j-dbs">
    ${dash('Heart rhythm', '1,402', 'hours', [50, 50, 50, 50, 50, 50, 50], 'From the ECG patch')}
    ${dash('Blood pressure', '117/75', '', [56, 50, 54, 48, 52, 46, 47], '↓ 3 systolic')}
    ${dash('Resting heart rate', '66', 'bpm', [60, 55, 58, 52, 50, 48, 47], '↓ 4 since day 1')}
    ${dash('Sleep', '6h 55m', '', [40, 55, 48, 60, 52, 58, 64], '↑ 27 minutes')}
  </div>
  <div class="u-thumb"><span class="u-btn u-btn--xl" data-tap="toast:Opens the final report">See your final report</span></div>`, 0);

UI2X['fd.trend'] = [['Blood pressure, 30 days', fdBp()], ['Holding on one day', fdBp(7)]];
UI2X['fd.report'] = [['A reviewed report', fdReport], ['Choosing how to share', fdOver(fdReport, UI2X['fd-share'])]];
UI2X['fd.hidden'] = [['Readings hidden', fdHidden], ['Why studies do this', fdOver(fdHidden, UI2X['fd-why'])], ['When the study ends', fdEnded]];

/* the welcome with its FDA line, shown in the FDA section too */
UI2X['fd.welcome'] = [['Welcome, FDA cleared', UI2['welcome']]];

/* v04 (28.OCT.2026): check-ins are notifications, which only a participant's
   own phone gets (BYOD): out of the main flow, where I'm ready now goes
   straight to setup, and shown in the BYOD section instead: the sheet, the
   phone's own prompt, then what was decided */
UI2X['byod.checkins'] = [['Check-ins', fdOver(UI2['2A'], UI2X['2A.ready'])],
  ['The phone asks first', fdOver(UI2['2A'], UI2X['2A.allow'])],
  ['Check-ins on', fdOver(UI2['2A'], UI2X['2A.on'])]];

/* Today's readings (v04, 28.OCT.2026): the completed tasks as a receipt
   report. Each line is what was measured and its value, from the task's
   data sheet (ck.*), and the total line says it all reached the study. A
   line still opens its sheet */
const rcptTime = (t) => { const m = /(\d+):(\d+)\s*(AM|PM)/.exec(t || ''); return m ? (+m[1] % 12 + (m[3] === 'PM' ? 12 : 0)) * 60 + +m[2] : -1; };
const rcptValue = (label, v) => {
  v = v.replace(/\s*\/\s*/, '/').replace(/\blbs\b/, 'lb');
  if (/^\d+\/\d+$/.test(v)) v += ' mmHg';
  const word = /^([A-Za-z][^,]*),\s*(.+)$/.exec(v);
  if (word) return `${word[1]}<small>${word[2]}</small>`;
  /* a value in words and numbers ("5 days, 22 hours") stays one weight */
  if (/^\d.*,/.test(v)) return v;
  /* a duration ("6 h 52m") is one value too: "6h 52m" */
  if (/^\d+\s*h(?![a-z])/.test(v)) return v.replace(/^(\d+)\s*h/, '$1h');
  const num = /^([\d.,/]+)\s*(.*)$/.exec(v);
  return num ? `${num[1]}${num[2] ? `<small>${num[2]}</small>` : ''}` : v;
};
const rcptBody = (keys, of) => {
  let last = '';
  const rows = keys.split(';').filter(Boolean).map((kn) => {
    const [key, name] = kn.split('|');
    const cd = [...(UI2X[key] || '').matchAll(/<span><em>([^<]*)<\/em><b>([^<]*)<\/b><\/span>/g)].map((x) => [x[1], x[2]]);
    const got = cd.find((r) => r[0] !== 'Synced'), sync = cd.find((r) => r[0] === 'Synced');
    if (sync && rcptTime(sync[1]) > rcptTime(last)) last = sync[1];
    const label = got ? got[0] : name;
    /* v04 (28.OCT.2026): no slide-up behind a line; the line already says
       what its sheet did (the sheets stay, as the source of these values) */
    return `<div class="j-rcpt__r"><span><svg class="j-rcpt__c" viewBox="0 0 16 16" aria-label="Done"><path d="M3.4 8.4l3 3L12.6 5"/></svg>${label}</span><b>${got ? rcptValue(label, got[1]) : 'Done'}</b></div>`;
  }).join('');
  return `<p class="j-cks__k j-rcpt__k">Today’s readings${of ? ` · ${of} of ${of}` : ''}</p>
    <div class="j-rcpt__l">${rows}<div class="j-rcpt__t"><span>Sent to the study team</span><b>${last || 'Received'}</b></div></div>`;
};
const fillRcpt = (id) => {
  if (typeof UI2[id] !== 'string' || !UI2[id].includes('data-rcpt="')) return;
  UI2[id] = UI2[id].replace(/<div class="j-rcpt" data-rcpt="([^"]*)" data-of="(\d*)">/g, (m, keys, of) => `<div class="j-rcpt">${rcptBody(keys, of)}`);
};
/* Day 1 after the first questionnaire (30.OCT.2026): its Done comes back
   to day 1, the questionnaire checked off, not to day 6 */
UI2['ck-1-q'] = home3({ day: 1, below: communityBelow(), tasks: [
  ckItem(cBp, 'Second blood pressure', 'Tonight, 40 seconds', 'later'),
  ckItem(cQ, 'First questionnaire', 'Completed', 'done', 'q'),
  ckItem(gPatch, 'Patch', 'Connected 10:16 AM', 'done', 'patch1'),
  ckItem(cBand, 'Bracelet', 'Connected 10:12 AM', 'done', 'band1'),
  ckItem(cBp, 'Blood pressure', '121 / 78, 10:21 AM', 'done', 'cuff1'),
  ckItem(cWeight, 'Weight', '197.5 lbs, 10:24 AM', 'done', 'scale1')] });
Object.keys(UI2).forEach(fillRcpt);
/* the day screens are built when first opened, so they fill theirs then */
const homeAtBuild = window.homeAt;
window.homeAt = (d) => { const id = homeAtBuild(d); fillRcpt(id); return id; };
/* a week-one day after its questionnaire (30.OCT.2026): the same home with
   the questionnaire checked off, for its Done to come back to. Day 1 and
   day 6 have their own (ck-1-q, ck-2); later days give the day's home */
window.homeDoneQ = (d) => {
  d = Math.max(1, Math.min(MAX_DAY, Math.round(d)));
  if (d === 1) return UI2['ck-1-q'] ? 'ck-1-q' : 'ck-1';
  if (d === 6) return 'ck-2';
  if (d > 7) return window.homeAt(d);
  const id = 'home@' + d + '-q';
  if (!UI2[id]) {
    /* drawn like homeAt's week-one day, the questionnaire done */
    const top = unlockLine(d) + (d >= 3 ? triviaCard(d) : '');
    UI2[id] = home3({ day: d, top, below: weekOneBelow() + communityBelow(), tasks: [
      ckItem(cBp, 'Blood pressure', 'Tonight, 40 seconds', 'later'),
      ckItem(cQ, 'Questionnaire', 'Completed', 'done', 'q'),
      ckItem(cBand, 'Bracelet', 'Synced overnight', 'done', 'band6'),
      ckItem(gPatch, 'Patch', d === 7 ? 'Last day, it comes off tomorrow' : `Worn today, ${7 - d} days left`, 'done', 'patch6')] })
      .replace('<div class="u-nav"><b>', `<div class="u-nav j-nav--menu">${topToggle('today')}<b>`);
    fillRcpt(id);
  }
  return id;
};

/* v04 (29.OCT.2026): the report's 30 / 60 / 90 days tabs work. Each tab
   opens that period's report; a period that hasn't ended yet on this day
   is greyed and can't be opened, and the tabs follow the day slider */
const RP_BASE = UI2['15D'];
const RP_IDS = ['15D', '14A', 'rp-90'];
const RP_SPAN = ['Sep 20 – Oct 19 · first 30 days', 'Oct 20 – Nov 18 · days 31 to 60', 'Nov 19 – Dec 18 · days 61 to 90'];
const rpPeriod = (n, d0) => {
  /* a report is open, so its own period has ended at least */
  const d = Math.max(d0 || 0, n * 30);
  const tabs = [1, 2, 3].map((k) => k === n ? `<span class="is-on">${k * 30} days</span>`
    : d >= k * 30 ? `<span data-tap="view:${RP_IDS[k - 1]}">${k * 30} days</span>`
    : `<span class="is-off" aria-disabled="true">${k * 30} days</span>`).join('');
  let h = RP_BASE
    .replace('<span class="j-day">Day 30</span>', `<span class="j-day">Day ${n * 30}</span>`)
    .replace(RP_SPAN[0], RP_SPAN[n - 1])
    .replace(/<div class="j-rpp" role="tablist">[\s\S]*?<\/div>/, `<div class="j-rpp" role="tablist">${tabs}</div>`);
  /* a report is a page you open, so it has a back arrow, not the menu
     (30.OCT.2026) */
  if (!/class="(j-back|u-back)"/.test(h)) h = h.replace('<div class="u-body">', `<div class="u-body">${BACK_P('back', 'Back')}`);
  if (n > 1) h = h.replace(/(<div class="j-rpad">[\s\S]*?<\/div>\s*<\/div>)/, (m) => m + changesSec()).replace('class="u-scr is-v2 ', 'class="u-scr is-v2 is-spotlit ');
  return h;
};
UI2['15D'] = rpPeriod(1, 30);
UI2['14A'] = rpPeriod(2, 60);
UI2['rp-90'] = rpPeriod(3, 90);
DAY_PAGES['15D'] = [30, (d) => rpPeriod(1, d)];
DAY_PAGES['14A'] = [60, (d) => rpPeriod(2, d)];
DAY_PAGES['rp-90'] = [90, (d) => rpPeriod(3, d)];
['15D', '14A'].forEach((id) => { if (UI2['res.' + id]) UI2['res.' + id] = asRes(id, UI2[id]); });
