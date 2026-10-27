export const CONFIG = {
  // A fixed camera, set up like a product photograph: from the front left
  // and a little above, on a long lens, cropping through the cupboard so the
  // drawers fill the frame.
  //   azimuth: radians round from straight on (negative = from the left)
  //   elevation: radians above level
  //   focus: the point aimed at on the cabinet's face (x, y in metres)
  //   span: metres that fit top to bottom; minWidth: metres always kept across
  //   fov: lens angle; a narrow one flattens perspective like a long lens
  //   lowest: on tall screens, the lowest height the frame reaches down to
  shot: { azimuth: -0.5, elevation: 0.2, fov: 15, focus: [0, 1.02], span: 1.34, minWidth: 1.12, lowest: 0.16 },

  // where the case studies live: each drawer's "Read the case study" link
  // is its page (portfolio.js, `href`) on this site
  caseStudies: 'https://chloemxy.github.io/',

  // the studio's floor: 'carpet' (white wool) or 'concrete' (polished)
  floor: 'carpet',

  // the studio's foreground: 'none' (just the floor),
  // 'planted' (moss, ferns, grasses round rocks) or 'sand' (raked gravel)
  garden: 'none',

  // the studio's bins stand empty (no curios, no lining); a click just
  // opens and shuts them
  emptyBins: true,

  // the potter's-studio wall (setupStudio in main.js): straight on and
  // level, from eye height (`eye`), the frame shifted like a shift lens, so
  // every upright stays vertical. `view` is what it shows, [x0, y0, x1, y1]
  // on the wall (m), below the top bar: the two portfolio columns in the
  // middle up to the name drawers at the wall's top, a column and a half
  // either side, a sliver of carpet below. Always its full height; a
  // narrower screen crops the sides, but never into `keep`, the two
  // portfolio columns and their signs, which stay whole however narrow.
  studioShot: { azimuth: 0, elevation: 0, eye: 1.6, fov: 27.5, focus: [-0.285, 1.2], view: [-1.85, -0.06, 1.28, 2.43], keep: [-0.94, -0.02, 0.41, 2.43] },

  // what stands behind the bin cabinet: 'studio' (the bins scattered through
  // a wall of open shelving, a zen garden in front), 'cabin' (a bright wooden cabin with
  // big windows onto the sky and a sunroof), 'sky' (drifting cumulus), 'film'
  // (the filmed meadow below, with drawn grass round the legs) or 'meadow'
  // (a drawn meadow)
  binBackdrop: 'studio',
  meadowVideo: 'assets/meadow.mp4',

  // The bin cabinet (v2), the middle of a whole apothecary wall: seen
  // straight on, from the counter (about a third of the way up the wall) to
  // the cornice, so the floor is never in shot. On tall screens the frame
  // grows upward from the counter (`lowest`), up to the ceiling
  // (`maxSpan`), and past that crops the sides instead.
  binShot: { azimuth: 0, elevation: 0.03, fov: 15, focus: [0, 2.05], span: 2.16, minWidth: 3.2, lowest: 0.97, maxSpan: 2.3 },
};
