/* ==========================================================================
   Prolaio theme, the parts CSS can't do alone (local demo only).

   prTransform(root) rewrites a copy of a v02 screen into the PMA+BYOD
   library's components. It only ever runs on the "After" copy; the real
   phone is never touched. Taps still work: theme-demo.js passes a tap on
   the copy to the same [data-tap] on the real phone.

     task icons     their filled task-type icons in place of our glyphs
     checklist      each row becomes their task card: icon, title, time,
                    a full-width pill when it can start, a green check when
                    done, a violet history-style link
     errors         their error state: the red ✕ icon over a centred title
     illustrations  their line art for the cuff on the arm and the scale
     notifications  their notification card with the Prolaio app icon
   ========================================================================== */
(function () {
  var BASE = (document.currentScript && document.currentScript.src || '').replace(/[^/]*$/, '');
  var icon = function (name, cls) { return '<img class="pr-ti ' + (cls || '') + '" src="' + BASE + 'icons/' + name + '" alt="">'; };

  /* our glyphs, by their viewBox, and the library icon that replaces each.
     Bracelet and weight have no exported icon yet, so they keep our glyph
     in the Measure colour */
  var GLYPH = {
    '734.13 608.25 17.16 17.16': 'patch.png',     /* cPatch */
    '981.52 702.87 18.8 18.8': 'measure.png',     /* cBp */
    '103.75 624.02 12.03 12.03': 'quest.png'      /* cQ */
  };
  var MAGENTA = ['796.91 606.35 21.04 21.04', '1047.26 704.09 16.54 16.54'];   /* cBand, cWeight */

  /* a checklist row's type, from its name */
  var TYPES = [
    [/question|survey/i, 'quest.png'], [/blood pressure|^bp\b|bp and/i, 'measure.png'], [/patch/i, 'patch.png'],
    [/aspirin|med|pill/i, 'meds.png'], [/feedback/i, 'survey.png'], [/article|read the/i, 'edu.png'], [/walk|exercise/i, 'exercise.png']
  ];
  var glyphFor = function (name) {
    for (var i = 0; i < TYPES.length; i++) if (TYPES[i][0].test(name)) return icon(TYPES[i][1]);
    var g = /weight|scale/i.test(name) ? (typeof cWeight !== 'undefined' && cWeight) : /bracelet/i.test(name) ? (typeof cBand !== 'undefined' && cBand) : '';
    return g ? '<span class="pr-ti pr-ti--g">' + g + '</span>' : '';
  };

  /* device pictures, not task icons: the kit tiles, the setup visuals and
     the connection animation keep our drawings */
  var KEEP = '.j-stepvis, .j-kit, .j-dd, .j-cn, .j-sa, .j-er__art';

  function swapGlyphs(root) {
    root.querySelectorAll('svg.u-g').forEach(function (s) {
      if (s.closest(KEEP)) return;
      var vb = s.getAttribute('viewBox');
      /* the icon takes the glyph's classes, so each screen's own sizing and
         placement rules for .u-g still apply */
      if (GLYPH[vb]) s.outerHTML = '<img class="' + s.getAttribute('class') + ' pr-icon" src="' + BASE + 'icons/' + GLYPH[vb] + '" alt="">';
      else if (MAGENTA.indexOf(vb) > -1) s.classList.add('pr-mag');
    });
  }

  function taskCards(root) {
    root.querySelectorAll('.j-ck').forEach(function (row) {
      if (row.classList.contains('pr-card')) return;
      row.classList.add('pr-card');
      var name = (row.querySelector('.j-ck__t b') || {}).textContent || '';
      var end = row.querySelector('.j-ck__end'), check = row.querySelector('.j-ck__c');
      if (check) check.remove();
      row.insertAdjacentHTML('afterbegin', glyphFor(name) || '<span class="pr-ti"></span>');
      var go = row.querySelector('.j-ck__go');
      if (go) {
        go.classList.add('pr-go'); row.appendChild(go);
        /* a questionnaire ready to start: their "available, expiring, with
           skip" card. An expiry line with the alarm icon, then Skip (shown
           only, the prototype has no skip) beside a half-width Take */
        if (/question/i.test(name) && go.textContent.trim() === 'Start') {
          go.textContent = 'Take';
          row.classList.add('pr-card--q');
          var tx = row.querySelector('.j-ck__t');
          tx.insertAdjacentHTML('afterend', '<p class="pr-exp"><img src="' + BASE + 'icons/alarm.svg" alt="">Expires at 11:59 PM</p>');
          var acts = document.createElement('div');
          acts.className = 'pr-acts';
          acts.innerHTML = '<span class="pr-skip" aria-hidden="true">Skip</span>';
          row.appendChild(acts); acts.appendChild(go);
        }
      }
      /* a card that opens something deeper ends in a chevron, the mobile
         sign for "more inside" (a card with its own button needs none) */
      else if (row.hasAttribute('data-tap')) row.insertAdjacentHTML('beforeend', '<span class="pr-chev" aria-hidden="true"><svg viewBox="0 0 10 10"><path d="M3.6 1.8 6.8 5 3.6 8.2"/></svg></span>');
      if (end) end.remove();
      if (row.classList.contains('is-done')) row.insertAdjacentHTML('beforeend', icon('done.svg', 'pr-st'));
      /* View data becomes the card's footer: a light purple strip across the
         bottom, like their "Please use your Prolaio phone" band */
      var data = row.querySelector('.j-ck__data');
      if (data) { data.classList.add('pr-foot'); row.appendChild(data); }
      if (row.classList.contains('is-missed')) row.insertAdjacentHTML('beforeend', icon('missed.svg', 'pr-st'));
    });
  }

  function errors(root) {
    root.querySelectorAll('[data-state="error"]').forEach(function (e) {
      if (e.querySelector('.pr-err')) return;
      var h = e.querySelector('.j-rd__h') || e;
      h.insertAdjacentHTML('afterbegin', '<img class="pr-err" src="' + BASE + 'error-x.svg" alt="">');
    });
  }

  /* seven-segment digits, drawn like the placeholder numbers on their device
     art: thin purple strokes, one cell per digit, a dot for the decimal */
  var SEG = { a: 'M1 0h4', b: 'M6 1v3.5', c: 'M6 5.5V9', d: 'M1 10h4', e: 'M0 5.5V9', f: 'M0 1v3.5', g: 'M1 5h4' };
  var DIGIT = { 0: 'abcdef', 1: 'bc', 2: 'abged', 3: 'abgcd', 4: 'fgbc', 5: 'afgcd', 6: 'afgedc', 7: 'abc', 8: 'abcdefg', 9: 'abcdfg' };
  var seg = function (str, cls) {
    var x = 0, d = '', dots = '';
    String(str).split('').forEach(function (ch) {
      if (ch === '.') { dots += '<circle cx="' + (x - 1.2) + '" cy="10" r=".7"/>'; x += 1.6; return; }
      if (!DIGIT[ch]) return;
      DIGIT[ch].split('').forEach(function (s) { d += SEG[s].replace(/^M(-?[\d.]+)/, function (m, n) { return 'M' + (+n + x); }); });
      x += 9;
    });
    return '<svg class="pr-seg ' + (cls || '') + '" viewBox="-1 -1 ' + (x + 1) + ' 12" aria-hidden="true"><path d="' + d + '"/>' + dots + '</svg>';
  };

  /* their line art, in the concepts' purple (art/*-p): the cuff on the arm,
     the monitor waiting for a reading, pressing the cuff's button, the
     scale and the bracelet on the wrist. A screen showing a
     reading keeps our monitor and scale, which can show the numbers */
  var ART = function (file, cls, alt) { return '<img class="pr-art ' + (cls || '') + '" src="' + BASE + 'art/' + file + '" alt="' + (alt || '') + '">'; };
  function art(root) {
    root.querySelectorAll('img.j-bp--img').forEach(function (i) { i.src = BASE + 'art/bp-arm-p.svg'; i.classList.add('pr-art'); });
    /* the device's display: "Err" in their error red on an error screen;
       on the scale, dashes while it waits for a reading */
    var err = function (s) { return s.closest('[data-state="error"]') ? '-err' : ''; };
    root.querySelectorAll('svg.u-art--cuff.is-wait').forEach(function (s) { s.outerHTML = ART('bp-monitor' + err(s) + '-p.svg', 'pr-art--mon', 'The blood pressure monitor.'); });
    /* a screen showing a reading: their monitor and scale with the numbers
       on the device's own display */
    var val = function (s, sel) { var e = s.querySelector(sel); return e ? e.textContent.replace(/[^\d.]/g, '') : ''; };
    root.querySelectorAll('svg.u-art--cuff:not(.is-wait)').forEach(function (s) {
      var r = s.querySelectorAll('text.u-art__read');
      if (r.length < 2) return;
      var n = [].map.call(r, function (x) { return x.textContent.replace(/[^\d]/g, ''); });
      s.outerHTML = '<span class="pr-dev pr-dev--mon">' + ART('bp-monitor-read-p.svg', 'pr-art--mon', 'The monitor shows ' + n[0] + ' over ' + n[1] + ', pulse ' + (n[2] || '')) +
        seg(n[0], 'pr-mon__sys') + seg(n[1], 'pr-mon__dia') + (n[2] ? seg(n[2], 'pr-mon__pul') : '') + '</span>';
    });
    root.querySelectorAll('svg.j-sc:not(.is-wait)').forEach(function (s) {
      var v = val(s, '.j-sc__val');
      if (!v) return;
      s.outerHTML = '<span class="pr-dev pr-dev--sc">' + ART('scale-blank-p.svg', 'pr-art--sc', 'The scale shows ' + v + ' lbs') + '<span class="pr-sc__val">' + seg(v) + '<i>lbs</i></span></span>';
    });
    root.querySelectorAll('svg.j-sc.is-wait').forEach(function (s) { s.outerHTML = ART('scale' + (err(s) || '-wait') + '-p.svg', 'pr-art--sc', 'Stand on the scale with bare feet.'); });
    /* the patch on the chest: their Patch drawing */
    root.querySelectorAll('svg.j-bm').forEach(function (s) {
      var l = s.getAttribute('aria-label') || '';
      if (/patch/i.test(l)) s.outerHTML = ART('patch-p.svg', 'pr-art--patch', l);
    });
    root.querySelectorAll('svg.j-sa').forEach(function (s) {
      var l = s.getAttribute('aria-label') || '';
      /* the bracelet keeps the v02 light: a blue dot on its face that blinks */
      if (/bracelet/i.test(l)) s.outerHTML = '<span class="pr-band">' + ART('bracelet-p.png', 'pr-art--band', l) + '<i class="pr-blink" aria-hidden="true"></i></span>';
      /* step 4, taking the first blood pressure: the cuff on the arm (BP - right) */
      else if (/cuff/i.test(l)) s.outerHTML = ART('bp-arm-p.svg', 'pr-art--start', l);
    });
    /* the kit tiles keep the solid device icons, on both phones (the user's call) */
  }

  /* their device notification icons (notification-icons.svg): one row per
     device or topic, columns green (fine), orange (warning), red octagon
     (error), small inline orange. Shown by cropping the sheet's viewBox */
  var NI_COL = [39, 96, 152, 199];
  var NI_ROW = { battery: 158 + 62, data: 279, phone: 339, bracelet: 400, bluetooth: 460, signal: 582, cuff: 635, patch: 158 };
  /* the bracelet and phone have their own exports (Android UI, levels 1 to 3
     and minimized); the other devices are cropped from the sheet */
  var NI_FILE = { bracelet: 'bracelet', phone: 'phone' }, NI_LEVEL = ['1', '2', '3', 'min'];
  var ni = function (row, col, cls) {
    if (NI_FILE[row]) return '<img class="pr-ni ' + (cls || '') + '" src="' + BASE + 'icons/ni/' + NI_FILE[row] + '-' + NI_LEVEL[col] + '.svg" alt="">';
    return '<img class="pr-ni ' + (cls || '') + '" src="' + BASE + 'notification-icons.svg#svgView(viewBox(' +
      (NI_COL[col] - 20) + ',' + (NI_ROW[row] - 20) + ',40,40))" alt="">';
  };
  var rowFor = function (text) {
    return /battery/i.test(text) ? 'battery' : /not worn|bracelet back|wear/i.test(text) ? 'bracelet'
      : /data|lost|sync/i.test(text) ? 'data' : /patch/i.test(text) ? 'patch' : /cuff|blood pressure/i.test(text) ? 'cuff' : 'bracelet';
  };
  function deviceAlerts(root) {
    /* banners and the alert sheet's header: the device icon in its level */
    root.querySelectorAll('.j-al, .j-al__h').forEach(function (al) {
      var i = al.querySelector(':scope > i');
      if (!i || al.querySelector('.pr-ni')) return;
      i.outerHTML = ni(rowFor(al.textContent), al.classList.contains('is-alert') ? 2 : 1, 'pr-ni--al');
    });
    /* reading errors: the device's red icon. The scale has none: a weight
       that didn't reach the phone takes the red Bluetooth alert */
    root.querySelectorAll('[data-state="error"] .pr-err').forEach(function (x) {
      var scr = x.closest('[data-state="error"]'), txt = scr.textContent;
      x.outerHTML = ni(/scale|weight|reach the cuff|lost the connection|connection/i.test(txt) ? 'bluetooth' : 'cuff', 2, 'pr-err');
    });
  }

  function notifications(root) {
    root.querySelectorAll('.j-nt__i').forEach(function (i) { i.textContent = ''; i.classList.add('pr-app'); });
  }

  /* top bar icons, 24dp Material outlines as in the PMA-BYOD library */
  var TB_HELP = '<svg viewBox="0 0 24 24"><path d="M11 18h2v-2h-2v2zm1-16C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm0-14c-2.21 0-4 1.79-4 4h2c0-1.1.9-2 2-2s2 .9 2 2c0 2-3 1.75-3 5h2c0-2.25 3-2.5 3-5 0-2.21-1.79-4-4-4z"/></svg>';
  var TB_BELL = '<svg viewBox="0 0 24 24"><path d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.9 2 2 2zm6-6v-5c0-3.07-1.63-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.64 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2zm-2 1H8v-6c0-2.48 1.51-4.5 4-4.5s4 2.02 4 4.5v6z"/></svg>';
  var TB_GEAR = '<svg viewBox="0 0 24 24"><path d="M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.07-.94l2.03-1.58a.49.49 0 0 0 .12-.61l-1.92-3.32a.49.49 0 0 0-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54a.48.48 0 0 0-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96a.49.49 0 0 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.05.3-.09.63-.09.94s.02.64.07.94l-2.03 1.58a.49.49 0 0 0-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z"/></svg>';

  window.prTransform = function (root) {
    swapGlyphs(root);
    taskCards(root);
    errors(root);
    art(root);
    notifications(root);
    deviceAlerts(root);
    /* a plain "Help" beside a title is Help too, so it moves to the top row */
    root.querySelectorAll('.u-nav > span:not(.j-help)').forEach(function (s) { if (s.textContent.trim() === 'Help') s.classList.add('j-help'); });
    /* last: every text style onto one of 8 from their style guide (type-scale.js) */
    if (window.tsApply) window.tsApply(root, 'after');
    /* the menu icon is shown only where the real screen has no menu to open */
    /* any header whose top row has nothing on the left (no menu, back
       chevron or back link) gets the menu icon there, the user's call */
    var nav = root.querySelector('.j-hd .u-nav');
    if (nav && nav.textContent.trim() && !nav.querySelector('.j-menu') && !root.querySelector('.u-back, .j-back') && typeof gMenu !== 'undefined')
      nav.insertAdjacentHTML('afterbegin', '<span class="j-menu pr-menu" aria-hidden="true">' + gMenu + '</span>');
    /* the PMA-BYOD top bar's three trailing icons (Figma "Android UI / Top
       bar"): Help, Notifications, Settings, on the menu's row. A screen's
       own Help link becomes the ? icon, so its tap still works; the bell
       and the gear are shown, not wired */
    var menu = nav && nav.querySelector('.j-menu');
    if (menu && !menu.querySelector('.pr-tbar')) {
      var help = nav.querySelector('.j-help'), tap = help && help.getAttribute('data-tap');
      if (help) help.remove();
      menu.insertAdjacentHTML('beforeend', '<span class="pr-tbar">' +
        '<i class="pr-tbar__i"' + (tap ? ' data-tap="' + tap + '"' : '') + ' aria-label="Help">' + TB_HELP + '</i>' +
        '<i class="pr-tbar__i" aria-label="Notifications">' + TB_BELL + '</i>' +
        '<i class="pr-tbar__i" aria-label="Settings">' + TB_GEAR + '</i></span>');
    }
    /* v03 (26.OCT.2026): every app page (one with the tab bar) has the top
       bar, so a page that opens with a back link carries it on that row;
       and a page's info icon joins the bar, first, instead of the title */
    if ((window.prLogos || {}).tbarAll && nav && root.querySelector('.j-tabs')) {
      var row = root.querySelector('.j-hd .u-back, .j-hd .j-back');
      if (!root.querySelector('.pr-tbar') && row) {
        var help2 = nav.querySelector('.j-help'), tap2 = help2 && help2.getAttribute('data-tap');
        if (help2) help2.remove();
        row.classList.add('pr-tbrow');
        row.insertAdjacentHTML('beforeend', '<span class="pr-tbar">' +
          '<i class="pr-tbar__i"' + (tap2 ? ' data-tap="' + tap2 + '"' : '') + ' aria-label="Help">' + TB_HELP + '</i>' +
          '<i class="pr-tbar__i" aria-label="Notifications">' + TB_BELL + '</i>' +
          '<i class="pr-tbar__i" aria-label="Settings">' + TB_GEAR + '</i></span>');
      }
      var bar = root.querySelector('.pr-tbar'), info = nav.querySelector('.j-info');
      if (bar && info) { info.classList.add('pr-tbar__i'); bar.insertBefore(info, bar.firstChild); }
    }
    /* a Help link left as text (a reading's Back ... Help row, or a screen
       with no top bar) becomes the same ? support icon; its tap still works */
    root.querySelectorAll('.j-help:not(.pr-tbar__i), .j-rd__q:not(.pr-tbar__i)').forEach(function (h) {
      if (h.textContent.trim() !== 'Help') return;
      h.classList.add('pr-tbar__i');
      h.setAttribute('aria-label', 'Help');
      h.innerHTML = TB_HELP;
    });
    /* the welcome line, simplified (the user's call) */
    var line = root.querySelector('.j-wel__t p:last-child');
    if (line && /^90 days/.test(line.textContent)) line.textContent = 'A few minutes a day helps heart research, and your data comes back to you.';
    /* the study name breaks before "Heart Study", never inside it */
    var study = root.querySelector('.j-wel__t b');
    if (study && !study.querySelector('.pr-nw')) study.innerHTML = study.innerHTML.replace('Heart Study', '<span class="pr-nw" style="white-space:nowrap">Heart Study</span>');
    /* their Prolaio logo, in purple, wherever the brand is named: the
       welcome, the menu drawer, and the notification's app label */
    /* a page can name its own logo files (v03: the primary wordmark) */
    var LG = window.prLogos || { p: 'prolaio-logo-p.svg', w: 'prolaio-logo-w.svg' };
    var LOGO = '<img class="pr-logo" src="' + BASE + LG.p + '" alt="Prolaio">';
    /* a page can switch the logos off (v03, 22.OCT.2026: the names stay text) */
    if (!LG.off) root.querySelectorAll('.j-wel__brand, .j-drawer__k').forEach(function (b) {
      if (!b.querySelector('.pr-logo') && /^\s*Prolaio\s*$/.test(b.textContent))
        /* on the welcome's purple, the white logo */
        b.innerHTML = b.classList.contains('j-wel__brand') ? LOGO.replace(LG.p, LG.w) : LOGO;
    });
    /* (v03: the app icon is the mark, so the label stays the plain name) */
    if (LG.nt !== false) root.querySelectorAll('.j-nt__a').forEach(function (a) {
      if (!a.querySelector('.pr-logo')) a.innerHTML = a.innerHTML.replace(/^\s*Prolaio/, LOGO);
    });
  };
})();
