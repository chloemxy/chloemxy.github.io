// The loading screen: a little wall of eight drawers, the portfolio's, that
// fill one by one as the scene loads, each one's hero picture sliding up
// behind its glass, the drawer it's filling pulled out a touch. It is the
// progress bar: a drawer for each share of the load, the percentage beside.
//
// Progress comes in steps (`to(p, upto)`: at least p now, and creeping on
// towards `upto` while the next step runs, so it never sits still), and
// `finish()` fills the rest and resolves once the last drawer is full.

const still = matchMedia('(prefers-reduced-motion: reduce)');

export function loader(el, heroes) {
  const drawers = [...el.querySelectorAll('.ld')];
  const pct = el.querySelector('.loader-pct');
  drawers.forEach((d, i) => { if (heroes[i]) d.querySelector('.ld-card').style.backgroundImage = `url("${heroes[i]}")`; });
  let shown = 0, target = 0, ceiling = 0, last = performance.now(), done = null, raf = 0;

  const draw = () => {
    const n = drawers.length;
    drawers.forEach((d, i) => {
      const f = Math.min(Math.max(shown * n - i, 0), 1);
      d.style.setProperty('--f', f.toFixed(3));
      d.classList.toggle('filling', f > 0 && f < 1);
      d.classList.toggle('full', f >= 1);
    });
    const v = Math.round(shown * 100);
    pct.textContent = `${v}%`;
    el.setAttribute('aria-valuenow', String(v));
  };

  const tick = (now) => {
    const dt = Math.min((now - last) / 1000, 0.1);
    last = now;
    // creep on towards the ceiling, slower the nearer it gets
    if (target < ceiling) target += (ceiling - target) * Math.min(1, dt * 0.6);
    shown += (target - shown) * (still.matches ? 1 : Math.min(1, dt * 5));
    if (done && shown > 0.998) { shown = 1; draw(); const d = done; done = null; setTimeout(d, still.matches ? 0 : 350); return; }
    draw();
    raf = requestAnimationFrame(tick);
  };
  raf = requestAnimationFrame(tick);

  return {
    to(p, upto = p) { target = Math.max(target, p); ceiling = Math.max(ceiling, upto, target); },
    // (resolves after 2 s at most, in case frames stop, in a hidden tab)
    finish() { target = ceiling = 1; return new Promise((res) => { done = res; setTimeout(res, 2000); }); },
    stop() { cancelAnimationFrame(raf); },
  };
}

// one frame, so the loader can paint between heavy steps (or a moment, in a
// hidden tab, where frames don't come)
export const nextFrame = () => new Promise((res) => { requestAnimationFrame(() => setTimeout(res, 0)); setTimeout(res, 50); });
