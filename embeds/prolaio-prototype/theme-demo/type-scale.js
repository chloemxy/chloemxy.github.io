/* ==========================================================================
   Type scale: every text style on a phone collapses to one of 6 treatments.

   tsApply(root, 'before') maps the v02 screens onto the v02 scale (ts-b1..6);
   tsApply(root, 'after') maps the Prolaio theme onto 6 styles from their
   style guide (ts-a1..6). Each element is placed by its current family,
   size, weight and case, so a style that isn't in the 6 can't survive.

   Left alone: the system status bar, the lock-screen clock and date, and
   text drawn inside device illustrations (SVG text, seven-segment digits),
   and the done check, a symbol, not text.
   The treatments themselves are in prolaio-theme.css ("Type scale").
   ========================================================================== */
(function () {
  /* the streak count keeps its own size: it's sized to fill its circle (22.OCT.2026) */
  var SKIP = '.j-sb, .j-lock__t, .j-lock__d, svg, .pr-seg, .j-hi, .u-earn__b, .j-sk__n';
  var CLASSES = /\bts-[ab][1-8]\b/g;

  var ownText = function (e) {
    for (var n = e.firstChild; n; n = n.nextSibling) if (n.nodeType === 3 && n.nodeValue.trim()) return true;
    return false;
  };

  /* the biggest style is for titles only: screen, reading and done titles,
     the welcome name, question titles, hero numbers. A big value inside a
     card (a reading, a tile number) takes the card-level style instead */
  var TITLE = '.u-nav b, .j-rd__t, .u-lead--big, .j-wel__t b, .j-q__t, .j-hc__w, .u-num';
  var isTitle = function (e) { return e.matches(TITLE) || !!e.closest('.u-nav b, .j-wel__t b'); };

  /* the v02 scale, 6 treatments: Sharp Sans for titles, Inter for the rest */
  function before(c, e) {
    var size = parseFloat(c.fontSize), bold = parseInt(c.fontWeight, 10) >= 550;
    var sharp = /Sharp Sans|Jakarta/i.test(c.fontFamily);
    if (c.textTransform === 'uppercase') return 6;                 /* section labels: Caption strong */
    if (sharp || size >= 14.5) return size >= 19.5 && isTitle(e) ? 1 : 2;   /* Display 22 / Title 14 */
    if (size >= 10.25) return bold ? 4 : 3;                         /* Label / Body 10.5 */
    return bold ? 6 : 5;                                            /* Caption strong / Caption 9.5 */
  }

  /* their style guide, 6 of its styles, at the mockup's scale (x0.645) */
  function after(c, e) {
    var size = parseFloat(c.fontSize), bold = parseInt(c.fontWeight, 10) >= 550;
    var sharp = /Sharp Sans|Jakarta/i.test(c.fontFamily);
    if ((sharp || size >= 17.5) && isTitle(e)) return 1;            /* Large Title 34dp */
    if (sharp || size >= 17.5) return 2;                            /* a big value in a card: Title 3 */
    if (size >= 12.5) return 2;                                     /* Title 3 Emphasized 20dp */
    if (size >= 10.6) return bold ? 3 : 4;                          /* Headline / Body 17dp */
    return bold ? 5 : 6;                                            /* Subhead Emphasized / Regular 15dp */
  }

  window.tsApply = function (root, scale) {
    if (!root) return;
    var els = [].filter.call(root.querySelectorAll('*'), function (e) {
      return ownText(e) && !e.closest(SKIP);
    });
    if (scale === 'after') {
      /* a copy of a before phone arrives with the before classes: read the
         theme's own styles first, without them */
      els.forEach(function (e) {
        [].slice.call(e.classList).forEach(function (c) { if (/^ts-b[1-8]$/.test(c)) e.classList.remove(c); });
      });
    }
    var prefix = scale === 'after' ? 'ts-a' : 'ts-b';
    /* read every element first, then write, so one change can't skew the next */
    var plan = els.filter(function (e) { return !new RegExp('\\b' + prefix + '[1-8]\\b').test(e.className); })
      .map(function (e) { var c = getComputedStyle(e); return [e, scale === 'after' ? after(c, e) : before(c, e)]; });
    /* the "Received ..." time on a reading card takes the status line's style */
    var line = root.querySelector('.j-dd__l');
    plan.forEach(function (p) {
      if (line && p[0].matches('.j-got span')) {
        var m = plan.filter(function (q) { return q[0] === line; })[0];
        if (m) p[1] = m[1];
      }
    });
    plan.forEach(function (p) { p[0].classList.add(prefix + p[1]); });
  };
})();
