/*
 * shared.js — Portfolio Global Components
 * ─────────────────────────────────────────
 * Edit here → changes apply to every page that loads this script.
 * Looks come from tokens.css, bar.css and shared.css. Motion (motion.dev),
 * loaded before this file, adds spring animation where it's available.
 *
 * Functions:
 *   initBar({ home, version })    — injects the global top bar and the menu (every lo-fi page)
 *   initSubNav({ title, href })   — old name for initBar, kept so case-study pages don't change
 *   initSidenav({ ids, darkIds }) — wires up the side nav dots + dark-mode switching
 *   initScrollProgress()          — drives the orange progress bar
 *   initReveal()                  — reveal-on-scroll for .reveal elements
 */

const prefersStill = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const motion = !prefersStill && window.Motion ? window.Motion : null;

/* ══════════════════════════════════
   GLOBAL BAR + MENU
   The same bar as the hi-fi site (see bar.css): CHLOE, the Lo-fi / Hi-fi
   switch and a Menu button, MA. The menu slides in from the right.
══════════════════════════════════ */
function initBar({ home, version } = {}) {
  // Case studies are shared by both versions of the site: send CHLOE, the menu
  // and the switch back to whichever version the visitor came from. `version`
  // is set by a page that is one version itself (the lo-fi homepage).
  const fixedHome = home;
  // The menu's section links always go to the lo-fi homepage, which has them
  const sections = 'index.html';

  const bar = document.createElement('header');
  bar.className = 'site-bar';
  bar.innerHTML = `
    <a href="index.html" class="site-bar__mark" aria-label="Chloe Ma, home">CHLOE</a>
    <div class="site-bar__tools">
      <nav class="site-bar__switch" aria-label="Site version">
        <a href="index.html" data-fi="lofi">Lo-fi</a><a href="hifi/" data-fi="hifi">Hi-fi</a>
      </nav>
      <button type="button" class="site-bar__icon" id="menuToggle" aria-label="Menu" aria-expanded="false" aria-controls="menuPanel">
        <svg class="site-bar__burger" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" aria-hidden="true">
          <line class="b1" x1="5" y1="7" x2="19" y2="7"/><line class="b2" x1="5" y1="12" x2="19" y2="12"/><line class="b3" x1="5" y1="17" x2="19" y2="17"/>
        </svg>
      </button>
    </div>
    <span class="site-bar__mark site-bar__mark--end" aria-hidden="true">MA</span>
  `;

  // ── Menu overlay ──────────────────────────────────────────────────────────
  const overlay = document.createElement('div');
  overlay.className = 'menu-overlay';
  overlay.id = 'menuOverlay';

  // ── Menu panel ────────────────────────────────────────────────────────────
  const panel = document.createElement('div');
  panel.className = 'menu-panel';
  panel.id = 'menuPanel';
  panel.innerHTML = `
    <div class="menu-cols">
      <div>
        <p class="menu-col-label">Links</p>
        <ul class="menu-links-list">
          <li><a href="https://www.linkedin.com/in/chloexyma" target="_blank" rel="noopener">LinkedIn</a></li>
          <li><a href="#" target="_blank" rel="noopener">Resume</a></li>
          <li><a href="mailto:chloexy.ma@gmail.com">Email</a></li>
        </ul>
      </div>
      <div>
        <p class="menu-col-label">Portfolio</p>
        <ul class="menu-nav-list">
          <li><a href="${sections}#about"><span class="menu-dot dot-orange"></span>About</a></li>
          <li><a href="${sections}#stack"><span class="menu-dot dot-cyan"></span>Stack</a></li>
          <li><a href="${sections}#work"><span class="menu-dot dot-purple"></span>Work</a></li>
          <li><a href="${sections}#contact"><span class="menu-dot dot-lime"></span>Contact</a></li>
        </ul>
      </div>
    </div>
    <div class="menu-bottom">
      <p class="menu-touch-label">Get in touch</p>
      <a href="mailto:chloexy.ma@gmail.com" class="menu-touch-email">chloexy.ma@gmail.com</a>
    </div>
  `;

  document.getElementById('passing-copy')?.remove();   // the password page's copy, shown until now
  document.body.prepend(overlay, panel, bar);   // bar ends up first in the DOM
  document.body.classList.add('has-bar');       // pages start below the bar (shared.css)

  // Mark the current version. Run again when the browser restores this page
  // from its back/forward cache, since the visitor may have switched since.
  function syncVersion() {
    let fi = version;
    try {
      if (fi) localStorage.setItem('portfolio.fi', fi);
      else fi = localStorage.getItem('portfolio.fi') === 'hifi' ? 'hifi' : 'lofi';
    } catch (e) { fi = fi || 'lofi'; }
    bar.querySelector('.site-bar__mark').setAttribute('href', fixedHome || (fi === 'hifi' ? 'hifi/' : 'index.html'));
    bar.querySelectorAll('.site-bar__switch a').forEach(a => {
      if (a.dataset.fi === fi) a.setAttribute('aria-current', 'page');
      else a.removeAttribute('aria-current');
    });
  }
  syncVersion();
  window.addEventListener('pageshow', e => { if (e.persisted) syncVersion(); });

  // ── Open / close ──────────────────────────────────────────────────────────
  const toggle = bar.querySelector('#menuToggle');
  const isOpen = () => panel.classList.contains('open');
  function openMenu() {
    panel.classList.add('open'); overlay.classList.add('open');
    toggle.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';
    // the links follow the panel in, one after another
    if (motion) {
      motion.animate(panel.querySelectorAll('li, .menu-bottom'),
        { opacity: [0, 1], x: [28, 0] },
        { type: 'spring', bounce: 0.2, duration: 0.7, delay: motion.stagger(0.04, { startDelay: 0.12 }) });
    }
  }
  function closeMenu() {
    panel.classList.remove('open'); overlay.classList.remove('open');
    toggle.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  }
  toggle.addEventListener('click', () => isOpen() ? closeMenu() : openMenu());
  overlay.addEventListener('click', closeMenu);
  panel.querySelectorAll('a').forEach(a => a.addEventListener('click', closeMenu));
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && isOpen()) { closeMenu(); toggle.focus(); } });
}

/* Old name: case-study pages call initSubNav({ title }); the title used to sit in the nav pill */
function initSubNav({ href } = {}) { initBar({ home: href }); }

/* ══════════════════════════════════
   SIDE NAVIGATION
   ids     — ordered array of section IDs matching .sn-item order
   darkIds — section IDs that have a dark background
══════════════════════════════════ */
function initSidenav({ ids = [], darkIds = [] } = {}) {
  const snItems   = Array.from(document.querySelectorAll('.sn-item'));
  const snSects   = ids.map(id => document.getElementById(id)).filter(Boolean);
  const snNav     = document.getElementById('sidenav');
  const darkSects = darkIds.map(id => document.getElementById(id)).filter(Boolean);

  // ── Floating tooltip (single shared element, position:fixed) ──────────────
  const tip = document.createElement('div');
  tip.className = 'sn-tip';
  document.body.appendChild(tip);

  let tipTimeout;

  function showTip(item) {
    clearTimeout(tipTimeout);
    const label = item.querySelector('.sn-label');
    if (!label) return;
    tip.textContent = label.textContent;

    // Position vertically centred on the dot
    const dot  = item.querySelector('.sn-dot');
    const rect = (dot || item).getBoundingClientRect();
    const tipH = tip.offsetHeight || 22;
    tip.style.top = Math.round(rect.top + rect.height / 2 - tipH / 2) + 'px';

    // Dark-mode tint when sidenav is in dark mode
    tip.classList.toggle('sn-tip--dark', snNav ? snNav.classList.contains('sidenav--dark') : false);
    tip.classList.add('sn-tip--visible');
  }

  function hideTip() {
    tipTimeout = setTimeout(() => tip.classList.remove('sn-tip--visible'), 80);
  }

  snItems.forEach(item => {
    item.addEventListener('mouseenter', () => showTip(item));
    item.addEventListener('mouseleave', hideTip);
    item.addEventListener('focus',      () => showTip(item));
    item.addEventListener('blur',       hideTip);
  });

  // ── Active / filled state ─────────────────────────────────────────────────
  let prevActiveIdx = -1;
  const STAGGER = 350; // ms between each bar starting — less than duration so bars overlap

  function setActive(id) {
    const activeIdx = ids.indexOf(id);
    if (activeIdx === prevActiveIdx) return;

    const goingForward = activeIdx > prevActiveIdx;

    snItems.forEach((item, i) => {
      const willFill  = i <= activeIdx;
      const wasFilled = item.classList.contains('sn-filled');
      let delay = 0;

      if (goingForward && willFill && !wasFilled) {
        // Growing: bars grow in order from prevActiveIdx+1 upward
        delay = (i - (prevActiveIdx + 1)) * STAGGER;
      } else if (!goingForward && !willFill && wasFilled) {
        // Erasing: bars erase in reverse order from prevActiveIdx downward
        delay = (prevActiveIdx - i) * STAGGER;
      }

      item.style.setProperty('--sn-bar-delay', Math.max(0, delay) + 'ms');
      item.classList.toggle('sn-active', i === activeIdx);
      item.classList.toggle('sn-filled', willFill);
    });

    prevActiveIdx = activeIdx;
  }

  // Activate section when it occupies ≥30 % of the viewport
  const snObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) setActive(entry.target.id);
    });
  }, { threshold: 0.3 });
  snSects.forEach(s => snObserver.observe(s));

  // ── Dark-section mode ─────────────────────────────────────────────────────
  if (darkSects.length) {
    const darkObserver = new IntersectionObserver(() => {
      const mid = window.innerHeight / 2;
      const anyDark = darkSects.some(s => {
        const r = s.getBoundingClientRect();
        return r.top <= mid && r.bottom >= mid;
      });
      if (snNav) snNav.classList.toggle('sidenav--dark', anyDark);
    }, { threshold: 0, rootMargin: '-50% 0px -50% 0px' });
    darkSects.forEach(s => darkObserver.observe(s));
  }

  // Reveal after a short delay (lets page settle)
  setTimeout(() => { if (snNav) snNav.classList.add('ready'); }, 600);
}

/* ══════════════════════════════════
   SUB-PAGE FOOTER
   Injects the canonical footer on every case-study page.
   Edit here → all pages update.
══════════════════════════════════ */
function initSubFooter() {
  const footer = document.createElement('footer');
  footer.innerHTML = `
    <div class="foot-inner">
      <p class="foot-copy">&copy;2026 Chloe Ma &middot; Healthcare Designer</p>
      <div class="foot-links">
        <a href="https://www.linkedin.com/in/chloexyma" target="_blank" rel="noopener">LinkedIn</a>
        <a href="mailto:chloe@goinvo.com">Email</a>
      </div>
    </div>
  `;
  document.body.appendChild(footer);
}

/* ══════════════════════════════════
   SCROLL PROGRESS BAR
══════════════════════════════════ */
function initScrollProgress() {
  const bar = document.querySelector('.scroll-progress');
  if (!bar) return;
  window.addEventListener('scroll', () => {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    bar.style.width = (window.scrollY / max * 100) + '%';
  }, { passive: true });
}

/* ══════════════════════════════════
   REVEAL ON SCROLL
══════════════════════════════════ */
function initReveal() {
  const els = document.querySelectorAll('.reveal');
  // With Motion: a spring rise, staggered when several arrive together.
  // reveal-d1/d2/d3 still add their extra delay.
  if (motion) {
    document.documentElement.classList.add('has-motion');
    const extra = el => el.classList.contains('reveal-d3') ? 0.32 : el.classList.contains('reveal-d2') ? 0.2 : el.classList.contains('reveal-d1') ? 0.1 : 0;
    let batch = 0, batchTimer = null;
    motion.inView(els, entry => {
      const el = entry.target || entry;
      const order = batch++;
      clearTimeout(batchTimer);
      batchTimer = setTimeout(() => { batch = 0; }, 60);
      motion.animate(el, { opacity: [0, 1], y: [32, 0] },
        { type: 'spring', bounce: 0.18, duration: 0.9, delay: extra(el) + Math.min(order, 6) * 0.06 })
        .then(() => el.classList.add('in'));
    }, { amount: 0.1, margin: '0px 0px -6% 0px' });
    return;
  }
  const io = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -6% 0px' });
  els.forEach(el => io.observe(el));
}
