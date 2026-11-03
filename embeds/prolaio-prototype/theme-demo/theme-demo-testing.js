/* Testing prototype (27.OCT.2026): forked from theme-demo-v03.js for the testing plan and prototype page. */
/* ==========================================================================
   Theme demo (local only): beside the prototype phone, a second phone shows
   the same screen in the Prolaio PMA+BYOD theme (prolaio-theme.css, scoped
   to .pr). For every concept, Setup to Wrap-up.

   The twin mirrors the real phone: every change to #pt-phone is copied
   across, and a tap on the twin is passed to the same element on the real
   phone, so journey.js runs it. Each phone scrolls on its own.
   ========================================================================== */
(function () {
  var phone = document.getElementById('pt-phone');
  if (!phone) return;
  var stage = phone.parentNode;
  /* v03 (22.OCT.2026): no logos in the prototype; the app reads as Prolaio by
     name, not by an OCORO or brand mark */
  /* v04 (29.OCT.2026): tbarAll, as in v03: a page that opens with a back
     arrow keeps the top bar's help, bell and settings on that row */
  window.prLogos = { p: 'prolaio-wordmark.svg', w: 'prolaio-wordmark-w.svg', nt: false, off: true, tbarAll: true };

  /* v03 (forked 19.OCT.2026): one app, so every moment of the stream gets a
     twin; the eyebrow still keys the redraw */
  var eyebrow = document.getElementById('pt-eyebrow');
  var wanted = function () { return document.getElementById('pt').open &&
    /* a map step is a diagram, not a screen: nothing to theme */
    !document.getElementById('pt').classList.contains('is-map'); };

  var labB = document.createElement('p');
  labB.className = 'td-lab td-lab--b';
  labB.innerHTML = 'Before <em>current v02</em>';
  var twin = document.createElement('div');
  twin.className = 'td-twin pr';
  twin.innerHTML = '<p class="td-lab">After <em>Prolaio theme</em></p><div class="cn-ph pt__phone td-ph" aria-hidden="true"></div>';
  var tph = twin.querySelector('.td-ph');

  var bodyOf = function (root) { return root.querySelector('.u-body'); };
  /* each phone scrolls on its own. The twin keeps its own place when the
     real phone changes, and its "scroll to the end" gate opens from its own
     scroll, not the real phone's */
  var shown = '', lastIn = null, inAt = 0, lastMode = '', sharedKeys = null, newSeen = '';
  var todayTop = {};
  function atEnd(b) { return b && b.scrollTop + b.clientHeight >= b.scrollHeight - 4; }
  function gateTwin() {
    if (!atEnd(bodyOf(tph))) return;
    tph.querySelectorAll('[data-gate="end"].is-gated').forEach(function (g) { g.classList.remove('is-gated'); });
  }

  /* a compare step (several small screens instead of the phone): an
     "After" row of the same screens under the "Before" row */
  var dlg = document.getElementById('pt');
  var cmpTwin = document.createElement('div');
  cmpTwin.className = 'td-cmp pr';
  var cmpLab = document.createElement('p');
  cmpLab.className = 'td-lab td-lab--cmp';
  cmpLab.innerHTML = 'Before <em>current v02</em>';
  function compareRow() {
    var box = document.getElementById('pt-cmp');
    var on = wanted() && dlg.classList.contains('is-compare') && box && box.innerHTML;
    stage.classList.toggle('td-cmp-on', !!on);
    if (!on) { cmpTwin.remove(); cmpLab.remove(); return; }
    if (cmpTwin.previousElementSibling !== box) { box.before(cmpLab); box.after(cmpTwin); }
    if (window.tsApply) window.tsApply(box, 'before');
    cmpTwin.innerHTML = '<p class="td-lab">After <em>Prolaio theme</em></p><div class="pt__cmp">' + box.innerHTML + '</div>';
    cmpTwin.querySelectorAll('.pt__phone').forEach(function (ph) { if (window.prTransform) window.prTransform(ph); });
    fitCompare();
    setTimeout(fitCompare, 120);   /* again once fit() has sized the modal */
  }
  /* two rows of screens are twice as tall: shrink both rows together until
     the modal fits again, so the arrows and progress dots stay in view */
  function fitCompare() {
    var box = document.getElementById('pt-cmp'), rows = [box, cmpTwin.querySelector('.pt__cmp')];
    if (!box || !rows[1] || !stage.classList.contains('td-cmp-on')) return;
    rows.forEach(function (r) { r.style.removeProperty('--s'); });
    var s = parseFloat(getComputedStyle(box).getPropertyValue('--s')) || .47;
    /* too big while the modal scrolls, or the After row runs under the
       arrows and dots */
    var pager = dlg.querySelector('.pt__pager');
    var tooBig = function () {
      return dlg.scrollHeight > dlg.clientHeight + 1 ||
        (pager && cmpTwin.getBoundingClientRect().bottom > pager.getBoundingClientRect().top - 8);
    };
    while (tooBig() && s > .42) {   /* below this the screens are too small to read; the modal scrolls instead */
      s -= .01;
      rows.forEach(function (r) { r.style.setProperty('--s', s.toFixed(2)); });
    }
  }
  window.addEventListener('resize', function () { setTimeout(fitCompare, 50); });

  var queued = false;
  /* the top bar's icons, as pr-transform draws them (Material, 24px) */
  var TBI = {
    help: '<svg viewBox="0 0 24 24"><path d="M11 18h2v-2h-2v2zm1-16C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm0-14c-2.21 0-4 1.79-4 4h2c0-1.1.9-2 2-2s2 .9 2 2c0 2-3 1.75-3 5h2c0-2.25 3-2.5 3-5 0-2.21-1.79-4-4-4z"/></svg>',
    bell: '<svg viewBox="0 0 24 24"><path d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.9 2 2 2zm6-6v-5c0-3.07-1.63-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.64 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2zm-2 1H8v-6c0-2.48 1.51-4.5 4-4.5s4 2.02 4 4.5v6z"/></svg>',
    gear: '<svg viewBox="0 0 24 24"><path d="M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.07-.94l2.03-1.58a.49.49 0 0 0 .12-.61l-1.92-3.32a.49.49 0 0 0-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54a.48.48 0 0 0-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96a.49.49 0 0 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.05.3-.09.63-.09.94s.02.64.07.94l-2.03 1.58a.49.49 0 0 0-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z"/></svg>'
  };
  var skipOnce = false;
  function mirror() {
    queued = false;
    /* a switch flipped on the copy itself: the real phone follows, the copy isn't redrawn */
    if (skipOnce) { skipOnce = false; return; }
    /* not while a Resources block is being moved: the copy is redrawn once it's let go */
    if (window.ptModBusy && window.ptModBusy()) return;
    compareRow();
    var on = wanted() && !dlg.classList.contains('is-compare');
    stage.classList.toggle('td-on', on);
    if (!on) { if (twin.parentNode) { twin.remove(); labB.remove(); } return; }
    if (!twin.parentNode) { stage.insertBefore(labB, phone); stage.appendChild(twin); }
    /* the same screen keeps its scroll; a new one starts at the top */
    var nav = phone.querySelector('.u-nav b');
    var key = eyebrow.textContent + '|' + (nav ? nav.textContent : phone.querySelector('.u-scr') && phone.querySelector('.u-scr').className);
    var old = bodyOf(tph), top = old && key === shown ? old.scrollTop : 0;
    /* Today keeps where it was scrolled to: leaving it notes the place,
       coming back opens it there (30.OCT.2026) */
    if (old && key !== shown && tph.querySelector('.j-cks')) todayTop[shown] = old.scrollTop;
    if (key !== shown && phone.querySelector('.j-cks') && todayTop[key]) top = todayTop[key];
    shown = key;
    /* the v02 screen on its 8-style scale first (type-scale.js), then the copy */
    if (window.tsApply) window.tsApply(phone, 'before');
    /* smart animate: where everything sits now, moving or not (journey-v03.js) */
    var before = window.ptSmart ? window.ptSmart.snap(tph) : null;
    tph.innerHTML = phone.innerHTML;
    /* v03 motion: a screen's entrance plays once; a redraw of the same
       screen (a sheet, a stage in place) doesn't replay it. A redraw within
       its first 0.7s, as follows every new screen, carries it on from where
       it was instead of starting over */
    var sIn = tph.querySelector('.u-scr[data-in]'), fresh = false, el = 0;
    if (sIn) {
      if (sIn.getAttribute('data-in') !== lastIn) { lastIn = sIn.getAttribute('data-in'); inAt = Date.now(); fresh = true; }
      el = Date.now() - inAt;
      if (!fresh && el > 700) sIn.removeAttribute('data-enter');
      else if (!fresh) {
        sIn.style.setProperty('--el', el + 'ms');
        if (lastMode === 'smart') sIn.setAttribute('data-enter', 'smart');
      }
    }
    /* rebuild the copy into the library's components (pr-transform.js) */
    if (window.prTransform) window.prTransform(tph);
    /* v04 (29.OCT.2026): a reading's screen carries the same top bar as
       the app's pages: the menu on the left, help, bell and settings on the
       right; the reading's own help keeps its tap on the ? */
    tph.querySelectorAll('.j-rd__top').forEach(function (top) {
      if (top.querySelector('.j-rdbar')) return;
      var rd = top.closest('.j-rd') || top.parentNode;
      /* the reading's own how-to becomes an (i) beside its title */
      var q = top.querySelector('.j-rd__q'), tap = q && q.getAttribute('data-tap');
      if (q) q.remove();
      /* the how-to sits at the illustration's top right (else beside the title) */
      var title = rd.querySelector('.j-rd__art') || rd.querySelector('.j-rd__t');
      if (tap && title && !title.querySelector('.j-rdinfo')) title.insertAdjacentHTML('beforeend', '<span class="j-info j-rdinfo" role="button" aria-label="How to take this reading" data-tap="' + tap + '">' + (typeof gInfo !== 'undefined' ? gInfo : 'i') + '</span>');
      /* a reading is a step in a flow: a back arrow on the left, not the menu */
      top.insertAdjacentHTML('afterbegin', '<div class="j-rdbar pr-tbrow"><span class="j-rdbar__bk" data-tap="rdback" role="button" aria-label="Back"><svg viewBox="0 0 10 10" aria-hidden="true"><path d="M6.4 1.8 3.2 5l3.2 3.2"/></svg></span>' +
        '<span class="pr-tbar"><i class="pr-tbar__i" data-tap="sheet:help3" aria-label="Help">' + TBI.help + '</i>' +
        '<i class="pr-tbar__i" aria-label="Notifications">' + TBI.bell + '</i><i class="pr-tbar__i" aria-label="Settings">' + TBI.gear + '</i></span></div>');
    });
    /* v04 (29.OCT.2026): one back arrow per screen: the one on the top
       bar's row if there is one, else the first */
    tph.querySelectorAll('.u-scr').forEach(function (scr) {
      var bs = [].filter.call(scr.querySelectorAll('.j-back, .u-back, .j-rdbar__bk, .j-trv__bk'), function (b) { return !b.closest('.j-ov'); });
      if (bs.length < 2) return;
      var keep = bs.filter(function (b) { return b.closest('.pr-tbrow') || b.matches('.pr-tbrow'); })[0] || bs[0];
      bs.forEach(function (b) { if (b !== keep && !b.contains(keep) && !keep.contains(b)) b.remove(); });
    });
    /* v04 (28.OCT.2026): Resources' blocks in the order the viewer set */
    tph.querySelectorAll('.j-mods').forEach(modArrange);
    /* v04 (30.OCT.2026): every task card with a time estimate puts it on
       its button ("Start · 2 min") and drops the "About 2 minutes" line */
    tph.querySelectorAll('.j-ck.is-now:not(.pr-card--q)').forEach(function (c) {
      var em = c.querySelector('.j-ck__t em'), go = c.querySelector('.pr-go, .j-ck__go');
      var m = em && /(\d+)\s*(min|sec)/i.exec(em.textContent);
      if (!go || !m) return;
      go.textContent = go.textContent.replace(/\s*·.*$/, '').trim() + ' · ' + m[1] + ' ' + m[2].toLowerCase();
      var rest = em.textContent.replace(/(about\s*)?\d+\s*(minutes?|mins?|seconds?|secs?)\s*,?\s*/i, '').trim();
      if (!rest) em.remove(); else em.textContent = rest.charAt(0).toUpperCase() + rest.slice(1);
    });
    /* v04 (28.OCT.2026): a questionnaire card's time goes on its button
       ("Take · 2 min"), and the "About 2 minutes" line under the name goes */
    tph.querySelectorAll('.j-ck.pr-card--q').forEach(function (c) {
      var em = c.querySelector('.j-ck__t em'), go = c.querySelector('.pr-go');
      var m = em && /(\d+)\s*min/i.exec(em.textContent);
      if (go && m) go.textContent = 'Start · ' + m[1] + ' min';
      if (em) em.remove();
      /* the card says what it is, not which one: "Questionnaire" */
      var nm = c.querySelector('.j-ck__t b');
      if (nm) nm.textContent = nm.textContent.replace(/^First (\w)/, function (x, l) { return l.toUpperCase(); });
      /* the deadline joins the name's row, at the right: "Due 11:59 PM", no clock */
      var ex = c.querySelector('.pr-exp');
      if (ex) { ex.classList.add('pr-exp--row'); ex.innerHTML = ex.textContent.replace(/^\s*Expires at\s*/i, 'Due '); }
    });
    fitBoth();
    var b = bodyOf(tph);
    if (b) b.scrollTop = top;
    /* rows just opened (journey-v03.js litNew): scroll to them once */
    var nw = tph.querySelector('[data-new]');
    if (b && nw && nw.getAttribute('data-new') !== newSeen) {
      newSeen = nw.getAttribute('data-new');
      /* looked up again when it runs: a redraw in between replaces the copy */
      setTimeout(function () {
        var bb = bodyOf(tph);
        if (!bb || !tph.querySelector('.j-blink') || !window.ptNewTop) return;
        var to = window.ptNewTop(bb);
        if (window.ptGlide) window.ptGlide(bb, to); else bb.scrollTop = to;
      }, 120);
    }
    /* what was on screen before glides to where it is now; on a new screen
       with enough already there, nothing slides and only the new parts rise */
    /* a tab switch has its own motion (journey-v03.css), no glide */
    if (before && sIn && (fresh || el < 450) && !/^tab/.test(sIn.getAttribute('data-enter') || '')) {
      var res = window.ptSmart.play(tph, before, fresh ? 380 : Math.max(140, 380 - el), fresh ? null : sharedKeys);
      if (fresh) {
        sharedKeys = res.keys;
        lastMode = res.ratio >= window.ptSmart.SMART ? 'smart' : sIn.getAttribute('data-enter');
        if (lastMode === 'smart') sIn.setAttribute('data-enter', 'smart');
      }
    }
    gateTwin();
  }

  /* fit() sizes one phone to the modal's height; with two side by side,
     also cap the size so both fit across the modal */
  function fitBoth() {
    if (!stage.classList.contains('td-on')) return;
    var dlg = document.getElementById('pt');
    var wide = window.innerWidth > 860;
    /* desktop: the modal's middle column, between the 340px text column on
       the left and 210px on the right for the highlight notes (the
       columns are set to match in prolaio-theme.css) */
    var room = (wide ? dlg.clientWidth - 64 - 340 - 210 - 16 : dlg.clientWidth - 40) - 36;
    var cap = Math.max(.6, room / ((dlg.classList.contains('td-hide-before') ? 1 : 2) * 250));
    var z = Math.min(+phone.style.zoom || 1, cap).toFixed(3);
    if (phone.style.zoom !== z) phone.style.zoom = z;
    if (tph.style.zoom !== z) tph.style.zoom = z;
  }
  window.addEventListener('resize', function () { setTimeout(fitBoth, 0); });
  function queue() { if (!queued) { queued = true; setTimeout(mirror, 0); } }

  new MutationObserver(queue).observe(phone, { childList: true, subtree: true, attributes: true, characterData: true });
  /* fit() sets the zoom on resize and open */
  new MutationObserver(fitBoth).observe(phone, { attributes: true, attributeFilter: ['style'] });
  /* v04 (28.OCT.2026): draw the copy now, and again once the page has
     loaded. The first screen can be fully drawn before this script runs (a
     refresh reopens where you were), and with no change after it the copy
     never appeared: the plain phone showed until the next tap */
  queue();
  window.addEventListener('load', queue);

  tph.addEventListener('scroll', gateTwin, true);

  /* v04 (28.OCT.2026): press and hold a Resources block to arrange the
     page. Every block wobbles and shows a size button; drag any block
     (the lead too) to move it, tap its size button to cycle small, wide,
     tall and large; Done, or a tap off the blocks, ends it. The layout
     stays for the rest of the visit. Drawn from one state (order and
     sizes), so the copy can be redrawn at any time without losing it */
  var modState = null, arranging = false, drag = null, hold = null, eatClick = false;
  var SIZES = ['s', 'w', 't', 'l'], SIZE_NAME = { s: 'Small', w: 'Wide', t: 'Tall', l: 'Large' };
  /* a block's colour, tapped through in arranging: grey, lavender, sky, mint, peach */
  var COLORS = ['grey', 'lav', 'sky', 'mint', 'peach'];
  window.ptModBusy = function () { return !!drag; };
  function tileOf(n) { return n && n.closest('.j-mods > .j-mod, .j-mods > .j-spot'); }
  function modName(t) { var m = t.matches('.j-mod') ? t : t.querySelector('.j-mod'); return m ? m.getAttribute('data-name') : ''; }
  function defSize(t) { var m = t.matches('.j-mod') ? t : t.querySelector('.j-mod');
    return !m ? 's' : m.classList.contains('is-lead') ? (m.classList.contains('is-wide') ? 'w' : 't') : m.classList.contains('is-wide') ? 'w' : 's'; }
  function modArrange(box) {
    var kids = [].slice.call(box.children).filter(function (c) { return c.matches('.j-mod, .j-spot'); });
    if (modState) {
      var at = function (c) { var i = modState.order.indexOf(modName(c)); return i < 0 ? 999 + kids.indexOf(c) : i; };
      kids.sort(function (a, b) { return at(a) - at(b); }).forEach(function (c) { box.insertBefore(c, box.querySelector('.j-mods__end')); });
    }
    kids.forEach(function (c) {
      c.setAttribute('data-size', (modState && modState.size[modName(c)]) || defSize(c));
      if (!c.querySelector('.j-mods__sz')) {
        var b = document.createElement('span'); b.className = 'j-mods__sz'; b.setAttribute('role', 'button');
        (c.matches('.j-mod') ? c : c.querySelector('.j-mod')).appendChild(b);
      }
      c.querySelector('.j-mods__sz').textContent = SIZE_NAME[c.getAttribute('data-size')];
      var col = modState && modState.color[modName(c)];
      if (col) c.setAttribute('data-color', col); else c.removeAttribute('data-color');
      if (!c.querySelector('.j-mods__col')) {
        var d = document.createElement('span'); d.className = 'j-mods__col'; d.setAttribute('role', 'button'); d.setAttribute('aria-label', 'Colour');
        (c.matches('.j-mod') ? c : c.querySelector('.j-mod')).appendChild(d);
      }
    });
    box.classList.toggle('is-arranging', arranging);
    var hint = box.parentNode.querySelector('.j-mods__hint');
    if (hint) hint.innerHTML = arranging ? '<span class="j-mods__done" role="button">Done</span>' : 'Press and hold a block to arrange';
  }
  function saveState(box) {
    var kids = [].filter.call(box.children, function (c) { return c.matches('.j-mod, .j-spot'); });
    modState = { order: kids.map(modName), size: {}, color: {} };
    kids.forEach(function (c) { modState.size[modName(c)] = c.getAttribute('data-size'); if (c.getAttribute('data-color')) modState.color[modName(c)] = c.getAttribute('data-color'); });
  }
  function setArranging(on) {
    arranging = on;
    [].forEach.call(tph.querySelectorAll('.j-mods'), function (b) { saveState(b); modArrange(b); });
  }
  tph.addEventListener('pointerdown', function (e) {
    var t = tileOf(e.target); if (!t || !tph.contains(t)) return;
    var box = t.parentNode, z = parseFloat(tph.style.zoom) || 1;
    var start = function () {
      var br = box.getBoundingClientRect();
      drag = { t: t, box: box, z: z, gx: (e.clientX - br.left) / z - t.offsetLeft, gy: (e.clientY - br.top) / z - t.offsetTop, id: e.pointerId };
      t.classList.add('is-lifted');
      try { tph.setPointerCapture(e.pointerId); } catch (er) { /* fine without it */ }
    };
    if (e.target.closest('.j-mods__sz, .j-mods__col')) return;
    if (arranging) { eatClick = true; start(); return; }
    var x0 = e.clientX, y0 = e.clientY;
    hold = { x0: x0, y0: y0, t: setTimeout(function () { hold = null; eatClick = true; setArranging(true); t = tileOf(document.elementFromPoint(x0, y0)) || [].filter.call(box.children, function (c) { return modName(c) === modName(t); })[0] || t; start(); }, 450) };
  });
  tph.addEventListener('pointermove', function (e) {
    if (hold && Math.abs(e.clientX - hold.x0) + Math.abs(e.clientY - hold.y0) > 8) { clearTimeout(hold.t); hold = null; }
    if (!drag) return;
    e.preventDefault();
    var box = drag.box, br = box.getBoundingClientRect(), px = (e.clientX - br.left) / drag.z, py = (e.clientY - br.top) / drag.z;
    /* the block under the finger, from the others' places (their own
       layout boxes, so the lifted one's movement doesn't confuse it) */
    var over = [].filter.call(box.children, function (c) {
      return c !== drag.t && c.matches('.j-mod, .j-spot') && px >= c.offsetLeft && px <= c.offsetLeft + c.offsetWidth && py >= c.offsetTop && py <= c.offsetTop + c.offsetHeight;
    })[0];
    if (over) {
      var kids = [].slice.call(box.children);
      box.insertBefore(drag.t, kids.indexOf(over) > kids.indexOf(drag.t) ? over.nextSibling : over);
    }
    drag.t.style.transform = 'translate(' + (px - drag.gx - drag.t.offsetLeft) + 'px,' + (py - drag.gy - drag.t.offsetTop) + 'px) scale(1.04)';
  });
  function letGo() {
    if (hold) { clearTimeout(hold.t); hold = null; }
    if (!drag) return;
    drag.t.style.transform = ''; drag.t.classList.remove('is-lifted');
    saveState(drag.box); drag = null;
    queue();
  }
  tph.addEventListener('pointerup', letGo);
  tph.addEventListener('pointercancel', letGo);
  tph.addEventListener('click', function (e) {
    var sz = e.target.closest('.j-mods__sz');
    if (sz && arranging) {
      var t = tileOf(sz), cur = t.getAttribute('data-size');
      t.setAttribute('data-size', SIZES[(SIZES.indexOf(cur) + 1) % SIZES.length]);
      saveState(t.parentNode); modArrange(t.parentNode);
      e.stopImmediatePropagation(); e.preventDefault(); return;
    }
    var co = e.target.closest('.j-mods__col');
    if (co && arranging) {
      var tc = tileOf(co), now = tc.getAttribute('data-color') || (tc.querySelector('.is-lead') || tc.matches('.is-lead') ? 'lav' : 'grey');
      tc.setAttribute('data-color', COLORS[(COLORS.indexOf(now) + 1) % COLORS.length]);
      saveState(tc.parentNode); modArrange(tc.parentNode);
      e.stopImmediatePropagation(); e.preventDefault(); return;
    }
    if (e.target.closest('.j-mods__done') || (arranging && !e.target.closest('.j-mods'))) {
      setArranging(false); e.stopImmediatePropagation(); e.preventDefault(); return;
    }
    /* in arranging, or right after a hold, a tap doesn't open the block */
    if (eatClick || (arranging && e.target.closest('.j-mods'))) { eatClick = false; e.stopImmediatePropagation(); e.preventDefault(); }
  }, true);
  tph.addEventListener('contextmenu', function (e) { if (e.target.closest('.j-mods')) e.preventDefault(); });

  /* v04 (28.OCT.2026): a finger (or the pointer) on a vital's chart reads
     out the reading under it: a guide line, a ringed dot and a label with
     when and how much; lifting it off clears them */
  function readAt(plot, cx) {
    var pts = plot._pts || (plot._pts = JSON.parse(decodeURIComponent(plot.getAttribute('data-pts') || '%5B%5D')));
    if (!pts.length) return;
    var r = plot.getBoundingClientRect(), f = Math.max(0, Math.min(1, (cx - r.left) / r.width));
    var q = pts[Math.round(f * (pts.length - 1))];
    var g = plot.querySelector('.j-trv__guide') || plot.appendChild(document.createElement('i'));
    var d = plot.querySelector('.j-trv__hit:not(.is-dia)') || plot.appendChild(document.createElement('i'));
    var t = plot.querySelector('.j-trv__tip') || plot.appendChild(document.createElement('span'));
    g.className = 'j-trv__guide'; d.className = 'j-trv__hit'; t.className = 'j-trv__tip';
    g.style.left = d.style.left = q[2] + '%'; d.style.bottom = q[3] + '%';
    /* a second series (diastolic): its own dot on the guide */
    var d2 = plot.querySelector('.j-trv__hit.is-dia');
    if (q[4] != null) { if (!d2) { d2 = plot.appendChild(document.createElement('i')); d2.className = 'j-trv__hit is-dia'; } d2.style.left = q[2] + '%'; d2.style.bottom = q[4] + '%'; }
    t.innerHTML = q[0] + '<b>' + q[1] + '</b>';
    /* the label stays inside the chart */
    var w = t.offsetWidth, px = q[2] / 100 * plot.offsetWidth;
    t.style.left = Math.max(w / 2, Math.min(plot.offsetWidth - w / 2, px)) + 'px';
    plot.classList.add('is-reading');
    /* a bar chart: the bar under the finger lights up */
    var idx = pts.indexOf(q);
    [].forEach.call(plot.querySelectorAll('.j-bpb'), function (b) { b.classList.toggle('is-hit', +b.getAttribute('data-i') === idx); });
  }
  function readOff(plot) {
    [].forEach.call(plot.querySelectorAll('.j-trv__guide, .j-trv__hit, .j-trv__tip'), function (n) { n.remove(); });
    [].forEach.call(plot.querySelectorAll('.j-bpb.is-hit'), function (n) { n.classList.remove('is-hit'); });
    plot.classList.remove('is-reading');
  }
  tph.addEventListener('pointerdown', function (e) { var p = e.target.closest('.j-trv__plot'); if (p) { readAt(p, e.clientX); try { p.setPointerCapture(e.pointerId); } catch (er) { /* fine */ } } });
  tph.addEventListener('pointermove', function (e) { var p = e.target.closest('.j-trv__plot'); if (p && (e.buttons || e.pointerType === 'mouse')) readAt(p, e.clientX); });
  tph.addEventListener('pointerleave', function (e) { if (e.target.matches && e.target.matches('.j-trv__plot')) readOff(e.target); }, true);
  tph.addEventListener('pointerup', function (e) { var p = e.target.closest('.j-trv__plot'); if (p && e.pointerType !== 'mouse') readOff(p); });

  /* a tap on the twin runs on the real phone. The copy is rebuilt into the
     library's components, so match by what the tap does: the same data-tap
     (the nth of its kind), else the same position, else the phone itself */
  /* v03: a touch swipe up on the welcome starts, as on the real phone */
  if (window.ptSwipe) window.ptSwipe(tph);
  /* v04 (30.OCT.2026): a setting changed on the copy: kept in every screen
     that shows it and on the real phone, without a redraw */
  tph.addEventListener('change', function (e) {
    var t = e.target.closest('[data-set]');
    if (!t || !window.ptSet) return;
    var key = t.getAttribute('data-set'), real = phone.querySelector('[data-set="' + key + '"]');
    window.ptSet(key, t.value);
    if (real) { skipOnce = true; real.value = t.value; if (real.tagName === 'INPUT') real.setAttribute('value', t.value); }
  });
  /* v04 (30.OCT.2026): Library search: only the blocks that match stay, in
     a plain grid, and a line says so when none do */
  tph.addEventListener('input', function (e) {
    var s = e.target.closest('.j-lib__s input'), box = s && tph.querySelector('.j-mods');
    if (!box) return;
    var q = s.value.trim().toLowerCase(), hits = 0;
    box.classList.toggle('is-search', !!q);
    [].forEach.call(box.querySelectorAll('.j-mod'), function (m) {
      var hit = !q || (m.getAttribute('data-name') + ' ' + m.getAttribute('data-kw') + ' ' + m.textContent).toLowerCase().indexOf(q) >= 0;
      (m.closest('.j-spot') || m).hidden = !hit;
      if (hit) hits++;
    });
    tph.querySelector('.j-lib__none').hidden = !q || hits > 0;
  });
  tph.addEventListener('click', function (e) {
    /* a setting's own input opens its picker, and search takes the typing;
       nothing to pass on */
    if (e.target.closest('[data-set], .j-lib__s')) return;
    /* v04 (29.OCT.2026): a switch or an expanding row flips in place on the
       copy, and the real phone's matching one with it, without a redraw, so
       an open sheet stays where it is */
    /* only when the toggle is the nearest tap target (a link inside an
       expanding row still goes where it says) */
    var near = e.target.closest('[data-tap]'), tg = near && near.getAttribute('data-tap') === 'toggle' ? near : null;
    if (tg && tph.contains(tg)) {
      var mineT = [].slice.call(tph.querySelectorAll('[data-tap="toggle"]')), theirsT = phone.querySelectorAll('[data-tap="toggle"]');
      var on = tg.classList.toggle('is-open');
      if (tg.getAttribute('role') === 'switch') tg.setAttribute('aria-checked', String(on));
      var real = theirsT[mineT.indexOf(tg)];
      if (real) { skipOnce = true; real.classList.toggle('is-open', on); if (real.getAttribute('role') === 'switch') real.setAttribute('aria-checked', String(on)); }
      return;
    }
    /* v03: the top bar only the twin has (pr-transform.js) does what it
       shows: ☰ the views, ? help (or the screen's own help), the bell and
       the gear their sheets */
    var tb = e.target.closest('.pr-tbar__i, .pr-menu');
    if (tb && tph.contains(tb) && window.ptTap) {
      var act = tb.classList.contains('pr-menu') ? 'sheet:views'
        : tb.getAttribute('data-tap') || ({ Help: 'sheet:help3', Notifications: 'sheet:notifs3', Settings: 'sheet:settings3' })[tb.getAttribute('aria-label')];
      if (act) { window.ptTap(act); return; }
    }
    /* v03: Skip on a questionnaire card (only the twin draws it) skips
       that task on the real phone, instead of opening the card behind it */
    var sk = e.target.closest('.pr-skip');
    if (sk && tph.contains(sk) && window.ptSkipTask) {
      var cards = [].slice.call(tph.querySelectorAll('.pr-card--q'));
      var real = [].filter.call(phone.querySelectorAll('.j-ck.is-now'), function (r) { return /question/i.test(r.textContent); });
      window.ptSkipTask(real[cards.indexOf(sk.closest('.pr-card--q'))] || real[0]);
      return;
    }
    var m = null, t = e.target.closest('[data-tap]');
    /* a reading's back arrow is the copy's own: straight to the prototype */
    if (t && tph.contains(t) && t.getAttribute('data-tap') === 'rdback' && window.ptTap) { window.ptTap('rdback'); return; }
    if (t && tph.contains(t)) {
      var v = t.getAttribute('data-tap');
      var mine = [].filter.call(tph.querySelectorAll('[data-tap]'), function (x) { return x.getAttribute('data-tap') === v; });
      var theirs = [].filter.call(phone.querySelectorAll('[data-tap]'), function (x) { return x.getAttribute('data-tap') === v; });
      m = theirs[Math.max(0, mine.indexOf(t))] || null;
      /* the twin was scrolled to the end itself, so its gated button is
         open: open the real one too before passing the tap on */
      if (m && t.matches('[data-gate="end"]:not(.is-gated)')) m.classList.remove('is-gated');
    } else {
      var path = [], n = e.target;
      while (n && n !== tph) { path.unshift([].indexOf.call(n.parentNode.children, n)); n = n.parentNode; }
      m = phone;
      for (var k = 0; k < path.length && m; k++) m = m.children[path[k]];
    }
    (m || phone).click();
  });

  /* Show / Hide before: one switch for every concept that has an After
     phone, across stages. Hidden, the real phone stays in the page (it runs
     the prototype; taps on the After phone still reach it), just unseen.
     The choice is this viewer's, kept in their browser */
  /* hidden by default: the After phone stands alone until a viewer chooses
     Show before (a new key, so earlier choices don't hold the old default) */
  var KEY = 'td-show-before';
  var hidden = true;
  try { hidden = localStorage.getItem(KEY) !== '1'; } catch (e) {}
  var tools = document.querySelector('.pt__tools');
  var btn = document.createElement('button');
  btn.type = 'button';
  btn.className = 'pt__re td-toggle';
  function applyHidden() {
    dlg.classList.toggle('td-hide-before', hidden);
    btn.textContent = hidden ? 'Show before' : 'Hide before';
    btn.setAttribute('aria-pressed', String(hidden));
    btn.title = hidden ? 'Show the current v02 screens beside the Prolaio theme' : 'Show only the Prolaio theme';
    /* let the modal re-size its phones for one column or two */
    window.dispatchEvent(new Event('resize'));
    setTimeout(fitCompare, 60);
  }
  btn.addEventListener('click', function () {
    hidden = !hidden;
    try { localStorage.setItem(KEY, hidden ? '0' : '1'); } catch (e) {}
    applyHidden();
  });
  if (tools) tools.insertBefore(btn, tools.firstChild);
  applyHidden();
})();
