// The case study's book on the page, which the book from the drawer hands
// over to. It opens on the hero picture across the spread, as the one in the
// drawer does, and reads by turning its pages: click or tap the right-hand
// page (or swipe, scroll, the arrow keys or the buttons under it) for the
// next spread, the left-hand one for the one before.
//
// What it says comes from the case study page itself, read into
// assets/cases/book/cases.json by tools/sync_cases.py (run by the dev server
// whenever a page changes, and by the portfolio's build): the title page,
// then every section in order, its words set page by page, and the link to
// the case study at the end. Every page has something to look at: the
// section's own picture, its interactive figure or its story outline, or
// else a diagram of the numbers on that page, the project's facts, or a
// line pulled from the page. The pages are laid out to the book's size, so a
// longer section runs on over more pages, and they're set again when the
// window changes size.
//
// On a narrow screen a spread is too small to read, so it shows one page at
// a time, turning over to the left: first the picture, as a plate with its
// caption, then the same pages.
//
// Each leaf is a page turning about the spine, its front the right-hand
// page and its back the left-hand page of the next spread. `page` is how
// many leaves are turned.

import { BOOK } from './portfolio.js?v=20261028032817';

const NARROW = matchMedia('(max-width: 640px), (max-aspect-ratio: 4/5)');
const still = matchMedia('(prefers-reduced-motion: reduce)');
const TURN = 900;                  // ms a page takes to turn
const BASE = 'assets/cases/book/'; // where cases.json and its pictures are

let cases = null;
const load = () => (cases ??= fetch(`${BASE}cases.json`, { cache: 'no-store' }).then((r) => r.json()).catch(() => ({})));

const el = (tag, cls, text) => {
  const e = document.createElement(tag);
  if (cls) e.className = cls;
  if (text) e.textContent = text;
  return e;
};

// ---- What a page can show

// Numbers in a page's words, with what they count: "15 tools", "an 8-stage,
// 152-step workflow", "50+ countries". Years, figures and ordinals are left.
function numbersIn(text) {
  const words = { two: 2, three: 3, four: 4, five: 5, six: 6, seven: 7, eight: 8, nine: 9, ten: 10, twelve: 12, twenty: 20 };
  const out = [];
  const re = /(\$?\b(?:\d[\d,.]*\+?|two|three|four|five|six|seven|eight|nine|ten|twelve|twenty)\b(?:M|%)?)[\s-]+((?:[a-z][a-z’'-]*\s?){1,2})/gi;
  for (const m of text.matchAll(re)) {
    const raw = m[1], n = words[raw.toLowerCase()] ?? parseFloat(raw.replace(/[$,+M%]/g, ''));
    if (!Number.isFinite(n) || (n >= 1900 && n <= 2100) || /^(of|and|to|in|the|a|or|is|was|were|on|at|years?)$/i.test(m[2].trim())) continue;
    const label = m[2].trim().replace(/[,.;:]$/, '');
    if (out.some((o) => o.raw === raw)) continue;
    out.push({ raw: /^\d/.test(raw) || raw.startsWith('$') ? raw : String(n), n, label });
    if (out.length === 3) break;
  }
  return out;
}

const visuals = {
  img(f) {
    const v = el('figure', `visual pictures n${Math.min(f.srcs.length, 3)}`);
    const row = el('div', 'pics');
    for (const src of f.srcs.slice(0, 3)) {
      const img = el('img');
      img.src = BASE + src; img.alt = f.alt ?? ''; img.loading = 'lazy'; img.decoding = 'async';
      row.append(img);
    }
    v.append(row);
    if (f.caption) v.append(el('figcaption', 'label', f.caption));
    return v;
  },
  // a live figure from the page (the timeline, the workflow), drawn at a
  // desk's width and shrunk to fit; turning pages, not using it
  embed(f) {
    const v = el('figure', 'visual embed');
    const box = el('div', 'embed-box');
    const frame = el('iframe');
    frame.src = BASE + f.srcs[0]; frame.title = f.alt || f.caption || 'Figure'; frame.tabIndex = -1;
    frame.loading = 'lazy'; frame.setAttribute('scrolling', 'no');
    box.append(frame);
    v.append(box);
    if (f.caption) v.append(el('figcaption', 'label', f.caption));
    return v;
  },
  steps(f) {
    const v = el('figure', 'visual steps');
    const ol = el('ol', f.steps.length > 5 ? 'two' : '');
    for (const [chapter, title, pages] of f.steps) {
      const li = el('li');
      li.append(el('span', 'dot'), el('small', 'label', chapter), el('b', '', title), el('span', 'pages', pages));
      ol.append(li);
    }
    v.append(ol);
    return v;
  },
  numbers(list) {
    const v = el('figure', `visual numbers n${list.length}`);
    for (const { raw, n, label } of list) {
      const tile = el('div', 'tile');
      tile.append(el('b', '', raw), el('span', 'label', label));
      // a dot for each one, when there are few enough to count
      if (n >= 2 && n <= 160 && Number.isInteger(n)) {
        const dots = el('div', 'units');
        dots.style.setProperty('--cols', String(Math.ceil(Math.sqrt(n * 2.2))));
        for (let i = 0; i < n; i++) dots.append(el('i'));
        tile.append(dots);
      }
      v.append(tile);
    }
    return v;
  },
  facts(facts) {
    const v = el('figure', 'visual facts');
    const dl = el('dl');
    for (const [k, val] of facts) dl.append(el('dt', 'label', k), el('dd', '', val));
    v.append(dl);
    return v;
  },
  // a close-up of one of the project's pictures, somewhere else each time
  detail(src, caption, k) {
    const v = el('figure', 'visual detail');
    const lens = el('div', 'lens');
    lens.style.backgroundImage = `url("${BASE + src}")`;
    lens.style.backgroundPosition = `${[20, 80, 50, 15, 85][k % 5]}% ${[30, 70, 20, 80, 50][k % 5]}%`;
    v.append(lens, el('figcaption', 'label', `Detail${caption ? ` · ${caption}` : ''}`));
    return v;
  },
  quote(text) {
    const v = el('figure', 'visual quote');
    v.append(el('blockquote', '', text));
    return v;
  },
};

// the line on a page most worth pulling out: a short whole sentence
function pull(blocks) {
  const sentences = blocks.filter((b) => b.t === 'p').flatMap((b) => b.text.match(/[^.!?]+[.!?]+/g) ?? []).map((s) => s.trim());
  return sentences.filter((s) => s.length > 30 && s.length < 130).sort((a, b) => a.length - b.length)[0] ?? sentences[0] ?? '';
}

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
    // the open spread, the hero's own shape, so it's never stretched
    root.style.setProperty('--book-ar', String(BOOK.w / BOOK.h));
    load();
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
    // the pages are set to the book's size, so set them again when it changes
    let timer = 0, size = 0;
    addEventListener('resize', () => {
      clearTimeout(timer);
      timer = setTimeout(() => {
        if (!this.data || this.root.hidden || this.book.offsetWidth === size) return;
        this.open(this.data, this.page / Math.max(1, this.leaves.length - 1));
      }, 250);
    });
    this.sized = () => { size = this.book.offsetWidth; };
  }

  // ---- The pages

  // A page of the story: a running head, something to look at, and words.
  story(c, s, visual, blocks, first) {
    const p = el('div', 'page story');
    const head = el('div', 'running label');
    head.append(el('span', 'rh-l', c.title), el('span', 'rh-r', s ? s.label : c.title));
    const body = el('div', 'page-body');
    if (s && first) {
      body.append(el('h3', 'sec-title', s.heading));
    }
    for (const b of blocks) body.append(el(b.t === 'h' ? 'h4' : 'p', b.t === 'h' ? 'sub' : '', b.text));
    p.append(head);
    if (visual) p.append(visual);
    else p.classList.add('words');
    p.append(body);
    return p;
  }

  // Sets a section's words over as many pages as they need, each with
  // something to look at, measured in `probe` (a page-sized box).
  section(c, s, probe, used) {
    const pages = [];
    const figures = [...s.figures];
    const next = (pageBlocks, first) => {
      if (figures.length) return visuals[figures[0].kind](figures.shift());
      const text = (first ? `${s.heading} ` : '') + pageBlocks.map((b) => b.text).join(' ');
      const nums = numbersIn(text);
      if (nums.length) return visuals.numbers(nums);
      if (!used.facts && c.facts?.length) { used.facts = true; return visuals.facts(c.facts.slice(0, 6)); }
      // then a line from the page and a close-up of the project, by turns
      used.n = (used.n ?? 0) + 1;
      const line = pull(pageBlocks), pics = used.pics;
      if (pics.length && (used.n % 2 === 0 || !line)) {
        const [src, caption] = pics[used.n % pics.length];
        return visuals.detail(src, caption, used.n);
      }
      return line ? visuals.quote(line) : null;
    };
    const fits = (blocks, first) => {
      // try the words with the figure the page would have (without using it up)
      const peek = figures.length ? visuals[figures[0].kind](figures[0]) : visuals.quote('A line pulled out of the page, for size.');
      probe.replaceChildren(this.story(c, s, peek, blocks, first));
      const body = probe.querySelector('.page-body');
      return body.scrollHeight <= body.clientHeight + 1;
    };
    let queue = s.blocks.map((b) => ({ ...b }));
    let first = true;
    while (queue.length || first) {
      const take = [];
      while (queue.length) {
        take.push(queue[0]);
        if (fits(take, first)) { queue.shift(); continue; }
        take.pop();
        // a paragraph too long for an empty page: split it between sentences
        if (!take.length) {
          const sentences = queue[0].text.match(/[^.!?]+[.!?]+\s*/g) ?? [queue[0].text];
          let n = sentences.length - 1;
          while (n > 1 && !fits([{ t: 'p', text: sentences.slice(0, n).join('') }], first)) n--;
          take.push({ t: 'p', text: sentences.slice(0, n).join('').trim() });
          queue[0] = { t: 'p', text: sentences.slice(n).join('').trim() };
          if (!queue[0].text) queue.shift();
        }
        break;
      }
      pages.push(this.story(c, s, next(take, first), take, first));
      first = false;
    }
    // figures left over get pages of their own
    while (figures.length) pages.push(this.story(c, s, visuals[figures[0].kind](figures.shift()), [], false));
    probe.replaceChildren();
    return pages;
  }

  pages(d, c) {
    const read = (label, cls = '') => {
      if (d.soon) {
        const b = el('span', `book-read ${cls}`, 'Case study coming soon');
        b.setAttribute('aria-disabled', 'true');
        return b;
      }
      const a = el('a', `book-read ${cls}`, label);
      a.href = this.href(d, c);
      return a;
    };
    const page = (cls, ...kids) => { const p = el('div', `page ${cls}`); p.append(...kids); return p; };
    const hero = c?.hero ? BASE + c.hero : d.hero;
    const title = page('title',
      el('h2', 'page-title', d.name),
      ...((c?.lede && c.sections.length) || d.lede ? [el('p', 'page-lede', (c?.sections.length && c.lede) || d.lede)] : []),
      el('p', 'page-summary', c?.blurb || d.summary || ''),
      read(d.cta ?? 'Read the case study'),
      el('p', 'page-meta label', (c?.meta?.length ? c.meta : [d.meta]).join(' · ')));
    // the project's own pictures, for close-ups
    const used = { pics: [...(c?.hero ? [[c.hero, '']] : []), ...(c?.sections ?? []).flatMap((s) => s.figures.filter((f) => f.kind === 'img').flatMap((f) => f.srcs.map((src) => [src, f.caption ?? ''])))] };
    const probe = el('div', 'face front probe');
    this.leavesEl.append(probe);
    const story = (c?.sections ?? []).flatMap((s) => this.section(c, s, probe, used));
    probe.remove();
    const links = (c?.sections ?? []).flatMap((s) => s.links);
    const end = story.length ? [page('end',
      Object.assign(el('img', 'end-img'), { src: hero, alt: '' }),
      el('p', 'page-lede', 'The rest is in the case study.'),
      read(d.cta ?? 'Read the full case study'),
      ...links.map((l) => Object.assign(el('a', 'end-link label', `${l.text} ↗`), { href: l.href, target: '_blank', rel: 'noopener' })))] : [];

    if (this.narrow) {
      const img = el('img', 'plate-img');
      img.src = hero; img.alt = '';
      return [page('plate', img, el('p', 'plate-caption label', d.name)), title, ...story, ...end];
    }
    // the hero across both pages: the drawer's own cover, already cropped to
    // the spread's 16:10 where the picture matters (tools/sync_cases.py).
    // Each half holds the whole picture, twice the page's width, set to fill
    // the spread without stretching, and shows its own side.
    const spread = d.hero || hero;
    const half = (side) => {
      const p = page(`hero-half ${side}`);
      p.append(Object.assign(el('img', 'hero-half-img'), { src: spread, alt: '' }));
      return p;
    };
    const list = [half('left'), half('right'), title, ...story, ...end];
    if (list.length % 2) list.push(page('blank', el('span', 'monogram', 'MA')));
    return list;
  }

  // ---- Open, and turn

  // `at` is how far through (0..1) to open it, when it's set again
  async open(d, at = 0) {
    this.data = d;
    const c = (await load())[d.id];
    this.root.classList.toggle('narrow', this.narrow);
    this.book.style.setProperty('--cloth', d.cloth);
    this.sized();
    this.leavesEl.replaceChildren();
    const pages = this.pages(d, c);
    const fronts = [], backs = [];
    if (this.narrow) {
      this.left.replaceChildren();
      pages.forEach((p) => { fronts.push(p); backs.push(el('div', 'page blank')); });
    } else {
      this.left.replaceChildren(pages[0]);
      for (let i = 1; i < pages.length; i += 2) { fronts.push(pages[i]); backs.push(pages[i + 1] ?? el('div', 'page blank')); }
    }
    // page numbers at the outer corners, on the pages of the story
    const folio = (face, page, n) => { if (page.classList.contains('story')) face.append(el('span', 'folio', String(n))); };
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
    this.page = Math.round(at * (this.leaves.length - 1));
    this.leaves.forEach((l, i) => l.classList.toggle('turned', i < this.page));
    this.stack();
    this.show();
    this.fitEmbeds();
  }

  // the live figures, drawn at a desk's width and shrunk to their box
  fitEmbeds() {
    for (const box of this.leavesEl.querySelectorAll('.embed-box')) {
      const w = box.clientWidth, h = box.clientHeight, frame = box.firstChild;
      const s = w / 1000;
      Object.assign(frame.style, { width: '1000px', height: `${h / s}px`, transform: `scale(${s})` });
    }
  }

  // back to the picture at once, for the book to go back in its drawer
  close() {
    for (const l of this.leaves) { l.classList.add('instant'); l.classList.remove('turned', 'moving'); }
    this.page = 0;
    this.stack();
    this.show();
    void this.book.offsetWidth;
    for (const l of this.leaves) l.classList.remove('instant');
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
  // on the right, the next to turn on top. The edges of the pages show at
  // either side, thicker where more of the book is.
  stack() {
    const n = this.leaves.length;
    this.leaves.forEach((l, i) => { if (!l.classList.contains('moving')) l.style.zIndex = String(i < this.page ? i + 1 : n - i + 1); });
    const k = n > 1 ? this.page / (n - 1) : 0;
    this.book.style.setProperty('--left-edge', `${1 + 2 * k}px`);
    this.book.style.setProperty('--right-edge', `${1 + 2 * (1 - k)}px`);
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
