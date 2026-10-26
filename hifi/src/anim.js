const reduced = matchMedia('(prefers-reduced-motion: reduce)');

export const ease = {
  out: (t) => 1 - Math.pow(1 - t, 3),
  inOut: (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2),
  in: (t) => t * t * t,
};

// Runs fn(k) with k eased from 0 to 1 over ms. Resolves when done.
// With reduced motion on, it jumps straight to the end.
export function tween(ms, fn, easing = ease.inOut) {
  return new Promise((resolve) => {
    if (reduced.matches || ms <= 0) { fn(1); resolve(); return; }
    const t0 = performance.now();
    const step = (now) => {
      const k = Math.min(1, (now - t0) / ms);
      fn(easing(k));
      if (k < 1) requestAnimationFrame(step); else resolve();
    };
    requestAnimationFrame(step);
  });
}
