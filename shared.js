/*
 * shared.js — Portfolio Global Components
 * ─────────────────────────────────────────
 * Edit here → changes apply to every page that loads this script.
 *
 * Functions:
 *   initSubNav({ title, href })   — injects the case-study nav pill
 *   initSidenav({ ids, darkIds }) — wires up the side nav dots + dark-mode switching
 *   initScrollProgress()          — drives the orange progress bar
 *   initReveal()                  — reveal-on-scroll for .reveal elements
 */

/* ══════════════════════════════════
   SUB-PAGE NAV
   Injects the shared pill nav used on every case-study page.
   Only the title changes per page — everything else is global.
══════════════════════════════════ */
function initSubNav({ title, href } = {}) {
  // Case studies are shared by both versions of the site: send "Portfolio" and
  // the switch back to whichever version the visitor came from.
  let fi = 'lofi';
  try { if (localStorage.getItem('portfolio.fi') === 'hifi') fi = 'hifi'; } catch (e) {}
  if (!href) href = fi === 'hifi' ? 'hifi/' : 'index.html';
  const lofiCurrent = fi === 'lofi' ? ' aria-current="page"' : '';
  const hifiCurrent = fi === 'hifi' ? ' aria-current="page"' : '';

  // ── Nav pill ──────────────────────────────────────────────────────────────
  const nav = document.createElement('nav');
  nav.innerHTML = `
    <a href="index.html" class="nav-brand" aria-label="Chloe Ma, home">Chloe Ma</a>
    <span class="nav-divider"></span>
    <span class="nav-case"><b>${title}</b></span>
    <a href="${href}" class="nav-back-btn">
      <svg viewBox="0 0 13 13"><path d="M10 6.5H3M6 3.5L3 6.5l3 3"/></svg>
      Portfolio
    </a>
    <div class="fi-toggle" role="group" aria-label="Site version">
      <a href="index.html"${lofiCurrent}>Lo-fi</a>
      <a href="hifi/"${hifiCurrent}>Hi-fi</a>
    </div>
    <button class="nav-hamburger" id="menuToggle" aria-label="Open menu">
      <span></span><span></span><span></span>
    </button>
  `;

  // ── Site version switch, top right on desktop (same as the hi-fi site) ────
  const fiSwitch = document.createElement('div');
  fiSwitch.className = 'fi-switch';
  fiSwitch.setAttribute('role', 'group');
  fiSwitch.setAttribute('aria-label', 'Site version');
  fiSwitch.innerHTML = `<a href="index.html"${lofiCurrent}>Lo-fi</a><a href="hifi/"${hifiCurrent}>Hi-fi</a>`;
  document.body.appendChild(fiSwitch);

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
          <li><a href="mailto:chloe@goinvo.com">Email</a></li>
        </ul>
      </div>
      <div>
        <p class="menu-col-label">Portfolio</p>
        <ul class="menu-nav-list">
          <li><a href="${href}#about"><span class="menu-dot dot-orange"></span>  About</a></li>
          <li><a href="${href}#stack"><span class="menu-dot dot-cyan"></span>    Stack</a></li>
          <li><a href="${href}#work"><span class="menu-dot dot-purple"></span>   Work</a></li>
          <li><a href="${href}#contact"><span class="menu-dot dot-lime"></span>  Contact</a></li>
        </ul>
      </div>
    </div>
    <div class="menu-bottom">
      <p class="menu-touch-label">Get in touch</p>
      <a href="mailto:chloe@goinvo.com" class="menu-touch-email">chloe@goinvo.com</a>
    </div>
  `;

  // Inject all three (overlay, panel, then nav — nav ends up first in DOM)
  document.body.prepend(overlay, panel, nav);

  // ── Toggle logic ──────────────────────────────────────────────────────────
  const toggle = nav.querySelector('#menuToggle');
  function openMenu()  {
    panel.classList.add('open'); overlay.classList.add('open'); toggle.classList.add('open');
    document.body.style.overflow = 'hidden';
  }
  function closeMenu() {
    panel.classList.remove('open'); overlay.classList.remove('open'); toggle.classList.remove('open');
    document.body.style.overflow = '';
  }
  toggle.addEventListener('click', () => panel.classList.contains('open') ? closeMenu() : openMenu());
  overlay.addEventListener('click', closeMenu);
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeMenu(); });

  // ── Deepen shadow on scroll ───────────────────────────────────────────────
  window.addEventListener('scroll', () => {
    nav.style.boxShadow = window.scrollY > 60
      ? '0 12px 40px rgba(22,20,18,0.28)'
      : '0 8px 32px rgba(22,20,18,0.18)';
  }, { passive: true });
}

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
  const io = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -6% 0px' });
  document.querySelectorAll('.reveal').forEach(el => io.observe(el));
}
