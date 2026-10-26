// The case study's book on the page, which the book from the drawer hands
// over to. It opens on the hero picture across the spread, as the one in the
// drawer does, and reads by turning its pages: click or tap the right-hand
// page (or swipe, scroll, the arrow keys or the buttons under it) for the
// next spread, the left-hand one for the one before. The pages: the
// picture, then the title and summary with the link to the case study, the
// longer read two sections a page, and the link again at the end.
//
// On a narrow screen a spread is too small to read, so it shows one page at
// a time, turning over to the left: first the picture, as a plate with its
// caption, then the same pages one section each.
//
// Each leaf is a page turning about the spine, its front the right-hand
// page and its back the left-hand page of the next spread. `page` is how
// many leaves are turned.

import { BOOK } from './portfolio.js';

const NARROW = matchMedia('(max-width: 640px), (max-aspect-ratio: 4/5)');
const still = matchMedia('(prefers-reduced-motion: reduce)');
const TURN = 900; // ms a page takes to turn

const el = (tag, cls, text) => {
  const e = document.createElement(tag);
  if (cls) e.className = cls;
  if (text) e.textContent = text;
  return e;
};

export class FlipBook {
  constructor(root, { href, onTurn }) {
    Object.assign(this, { root, href, onTurn });
    this.book = root.querySelector('.book');
    this.left = root.querySelector('.book-left');
    this.leavesEl = root.querySelector('.book-leaves');
    this.count = root.querySelector('.book-count');
    this.prevBtn = root.querySelector('.book-prev');
    this.nextBtn = root.querySelector('.book-next');
    this.leaves = [];
    this.page = 0;
    this.data = null;
    const { w, h, margin } = BOOK;
    root.style.setProperty('--book-ar', String((w + 2 * margin) / (h + 2 * margin)));
    root.style.setProperty('--book-pad', `${(margin / (w + 2 * margin)) * 100}%`);
    this.bind();
  }

  get narrow() { return NARROW.matches; }

  bind() {
    this.prevBtn.addEventListener('click', () => this.turn(-1));
    this.nextBtn.addEventListener('click', () => this.turn(1));
    // a click on a page turns it: the left-hand side back, the right on
    let swiped = false, down = null;
    this.book.addEventListener('pointerdown', (e) => { down = { x: e.clientX, y: e.clientY }; swiped = false; });
    this.book.addEventListener('pointerup', (e) => {
      if (!down) return;
      const dx = e.clientX - down.x, dy = e.clientY - down.y;
      down = null;
      if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy)) { swiped = true; this.turn(dx < 0 ? 1 : -1); }
    });
    this.book.addEventListener('click', (e) => {
      if (swiped || e.target.closest('a, button')) return;
      const r = this.book.getBoundingClientRect(), at = (e.clientX - r.left) / r.width;
      this.turn(at < (this.narrow ? 0.3 : 0.5) ? -1 : 1);
    });
    // a page a scroll, and not faster than they turn
    let last = 0;
    this.wheel = (e) => {
      if (Math.abs(e.deltaY) < 8 || performance.now() - last < TURN * 0.6) return;
      last = performance.now();
      this.turn(e.deltaY > 0 ? 1 : -1);
    };
    NARROW.addEventListener('change', () => { if (this.data) this.open(this.data); });
  }

  // ---- The pages

  pages(d) {
    const read = (label) => {
      if (d.soon) {
        const b = el('span', 'btn label book-read', 'Case study coming soon');
        b.setAttribute('aria-disabled', 'true');
        return b;
      }
      const a = el('a', 'btn label book-read', label);
      a.href = this.href(d);
      return a;
    };
    const page = (cls, ...kids) => { const p = el('div', `page ${cls}`); p.append(...kids); return p; };
    const half = (side) => {
      const p = page(`hero-half ${side}`);
      p.style.backgroundImage = `url("${d.hero}")`;
      return p;
    };
    const info = () => {
      const title = el('h3', 'page-title', d.name);
      return page('text info',
        el('p', 'page-meta label', d.meta),
        title,
        ...(d.lede ? [el('p', 'page-lede', d.lede)] : []),
        el('p', 'page-summary', d.summary ?? ''),
        read(d.cta ?? 'Read the case study'));
    };
    const section = ([h, text]) => { const s = el('section'); s.append(el('h4', 'label', h), el('p', '', text)); return s; };
    const per = this.narrow ? 1 : 2;
    const details = [];
    for (let i = 0; i < (d.details ?? []).length; i += per) details.push(page('text details', ...d.details.slice(i, i + per).map(section)));
    const end = () => page('text end', el('p', 'page-lede', 'The rest is in the case study.'), read(d.cta ?? 'Read the full case study'));
    const blank = () => page('blank', el('span', 'monogram', 'MA'));

    if (this.narrow) {
      const img = el('img', 'plate-img');
      img.src = d.hero; img.alt = '';
      const plate = page('plate', img, el('p', 'plate-caption label', d.name));
      return [plate, info(), ...details, ...(details.length ? [end()] : [])];
    }
    const list = [half('left'), half('right'), info(), ...details, ...(details.length ? [end()] : [])];
    if (list.length % 2) list.push(blank());
    return list;
  }

  // ---- Open, and turn

  open(d) {
    this.data = d;
    this.root.classList.toggle('narrow', this.narrow);
    this.book.style.setProperty('--cloth', d.cloth);
    const pages = this.pages(d);
    const fronts = [], backs = [];
    if (this.narrow) {
      this.left.replaceChildren();
      pages.forEach((p) => { fronts.push(p); backs.push(el('div', 'page blank')); });
    } else {
      this.left.replaceChildren(pages[0]);
      for (let i = 1; i < pages.length; i += 2) { fronts.push(pages[i]); backs.push(pages[i + 1] ?? el('div', 'page blank')); }
    }
    // page numbers at the outer corners, on the pages of text
    const folio = (face, page, n) => { if (page.classList.contains('text')) face.append(el('span', 'folio', String(n))); };
    this.leaves = fronts.map((front, i) => {
      const leaf = el('div', 'leaf');
      const f = el('div', 'face front'), b = el('div', 'face back');
      f.append(front); b.append(backs[i]);
      folio(f, front, this.narrow ? i + 1 : 2 * i + 2);
      folio(b, backs[i], 2 * i + 3);
      leaf.append(f, b);
      return leaf;
    });
    this.leavesEl.replaceChildren(...this.leaves);
    this.page = 0;
    this.stack();
    this.show();
  }

  get last() { return this.leaves.length - 1; }

  turn(dir) {
    const to = this.page + dir;
    if (!this.data || to < 0 || to > this.last) return;
    const leaf = this.leaves[dir > 0 ? this.page : to];
    leaf.classList.toggle('turned', dir > 0);
    // over the others while it turns
    leaf.style.zIndex = String(this.leaves.length + 2);
    leaf.classList.add('moving');
    clearTimeout(leaf.done);
    leaf.done = setTimeout(() => { leaf.classList.remove('moving'); this.stack(); }, still.matches ? 0 : TURN);
    this.page = to;
    this.show();
    this.onTurn?.();
  }

  // the turned leaves pile up on the left, the last turned on top; the rest
  // on the right, the next to turn on top
  stack() {
    const n = this.leaves.length;
    this.leaves.forEach((l, i) => { if (!l.classList.contains('moving')) l.style.zIndex = String(i < this.page ? i + 1 : n - i + 1); });
  }

  // only the pages in view can be read or tabbed to
  show() {
    const p = this.page;
    this.leaves.forEach((l, i) => {
      l.querySelector('.front').inert = i !== p;
      l.querySelector('.back').inert = this.narrow || i !== p - 1;
    });
    this.left.inert = p !== 0;
    const n = this.leaves.length;
    this.count.textContent = `${p + 1} / ${n}`;
    this.prevBtn.disabled = p === 0;
    this.nextBtn.disabled = p === n - 1;
  }

  // where the book from the drawer should land: the whole book, or on a
  // narrow screen the plate on its first page
  target() {
    return (this.narrow ? this.leaves[0]?.querySelector('.plate-img') : this.book)?.getBoundingClientRect();
  }
}
