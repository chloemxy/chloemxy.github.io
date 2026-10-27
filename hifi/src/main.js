import * as THREE from 'three';
import { CONFIG } from './config.js?v=20261027175029';
import { herbs, binContents, curios, jars } from './content.js?v=20261027175029';
import { loadFonts, loadGrain } from './paint.js?v=20261027175029';
import { HerbDrawer, setAnisotropy } from './items.js?v=20261027175029';
import { buildCabinet } from './cabinet.js?v=20261027175029';
import { Reader } from './reader.js?v=20261027175029';
import { Bin } from './bins.js?v=20261027175029';
import { projects, GROUPS } from './portfolio.js?v=20261027175029';
import { woodSheet } from './materials.js?v=20261027175029';
import { GRAINS } from './woodGrains.js?v=20261027175029';
import { buildBinCabinet } from './bincabinet.js?v=20261027175029';
import { BinReader } from './binReader.js?v=20261027175029';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { setMaterialAnisotropy, loadScans } from './materials.js?v=20261027175029';
import { makePost } from './post.js?v=20261027175029';
import { daySky } from './sky.js?v=20261027175029';
import { meadow, cloudShadowAt } from './meadow.js?v=20261027175029';
import { videoBackdrop, shadowCatcher } from './videoBackdrop.js?v=20261027175029';
import { cabin } from './cabin.js?v=20261027175029';
import { apothecaryWall } from './apothecaryWall.js?v=20261027175029';
import { shelfWall } from './shelfWall.js?v=20261027175029';
import { zenGarden } from './zenGarden.js?v=20261027175029';
import { plantedGarden } from './plantedGarden.js?v=20261027175029';
import { carpet } from './carpet.js?v=20261027175029';
import { finishMats } from './bincabinet.js?v=20261027175029';

import { renderScale } from './post.js?v=20261027175029';
import { loader, nextFrame } from './loader.js?v=20261027175029';
const canvas = document.getElementById('scene');
const loading = document.getElementById('loading');

// Two cabinets: the pull-out bins (v2, the default) and the drawers (v1,
// ?cabinet=drawers). The switch between them in the top bar is hidden for
// now (index.html); the drawers are still there by URL.
const design = new URLSearchParams(location.search).get('cabinet') === 'drawers' ? 'drawers' : 'bins';
document.querySelectorAll('.switch a').forEach((a) => {
  if (a.dataset.design === design) a.setAttribute('aria-current', 'page');
});
if (design === 'bins') {
  canvas.setAttribute('aria-label', 'A weathered pine cabinet of sixteen glass-lidded bins full of crystals, jewellery and witchy curios, against a summer sky of drifting clouds');
}

// the haze at the far edge of the meadow, and behind it
const HAZE = new THREE.Color().setRGB(0.62, 0.74, 0.86);

// The drawer cabinet: twenty drawers, one herb in each, against the sky.
function setupDrawers(scene, camera, renderer) {
  const sky = daySky(renderer);
  scene.background = sky.texture;
  const { slots, focus, shotFocus, mats, cols } = buildCabinet(scene, jars);
  const items = herbs.map((data, i) => {
    if (!slots[i]) { console.warn(`No drawer for "${data.common}".`); return null; }
    return new HerbDrawer(data, slots[i], mats, i);
  }).filter(Boolean);
  return {
    reader: new Reader({ camera, canvas, items, cols }), focus, shotFocus, shot: CONFIG.shot,
    setSize: (w, h) => sky.setSize(w, h), update: (t) => sky.update(t),
  };
}

// The bin cabinet: thirty bins of witchy curios. Behind it, as
// CONFIG.binBackdrop says: 'cabin', a bright wooden cabin with big windows
// onto the sky and sun pouring in from a sunroof; 'sky', the drifting
// cumulus sky; 'film', the
// filmed meadow (assets/meadow.mp4) with a ring of grass drawn round the
// cabinet's legs; or 'meadow', a drawn meadow (also what 'film' falls back
// to if the clip won't load).
async function setupBins(scene, camera, renderer) {
  if (CONFIG.binBackdrop === 'studio') return setupStudio(scene, camera);
  const shot = CONFIG.binShot;
  // ?finish=oak (or brass, ebony, sage, mahogany, limed, copper, navy,
  // cream) dresses the whole wall in another finish; see FINISHES
  const finish = new URLSearchParams(location.search).get('finish') || 'walnut';
  const { slots, focus, shotFocus, mats, cols, size } = buildBinCabinet(scene, [], { finish, moss: CONFIG.binBackdrop !== 'cabin' });
  const items = binContents.map((data, i) => {
    if (!slots[i]) { console.warn(`No bin for "${data.name}".`); return null; }
    return new Bin(data, slots[i], mats, i);
  }).filter(Boolean);
  const clear = { x: size.width / 2, z: [-size.depth, 0.03] };
  const reader = new BinReader({ camera, canvas, bins: items, cols });

  if (CONFIG.binBackdrop === 'cabin' || CONFIG.binBackdrop === 'sky') {
    const sky = daySky(renderer);
    scene.background = sky.texture;
    // in the cabin, the bins are the middle of a whole apothecary wall,
    // under a plank ceiling with a sunroof
    const room = CONFIG.binBackdrop === 'cabin'
      ? cabin(scene, mats, { back: 1.6, windowsAt: -1.6 * Math.tan(shot.azimuth), ceiling: 3.2, shaft: false })
      : null;
    if (room) apothecaryWall(scene, mats, size);
    return {
      reader, focus, shotFocus, shot, bright: !!room,
      setSize: (w, h) => { sky.setSize(w, h); room?.setSize(w, h); },
      update: (t) => { sky.update(t); room?.update(t); },
    };
  }
  const film = CONFIG.binBackdrop === 'film' ? videoBackdrop(scene, CONFIG.meadowVideo) : null;
  if (film && !(await film.failed)) {
    shadowCatcher(scene);
    const grass = meadow(scene, { toCamera: shot.azimuth, clear, ring: 1.1 });
    return {
      reader, focus, shotFocus, shot, film,
      setSize: (w, h) => film.setSize(w, h),
      update: (t, dt) => { film.update(); grass.setShade(film.shade()); grass.update(t); },
      shade: () => film.shade(),
    };
  }
  scene.background = HAZE;
  scene.fog = new THREE.Fog(HAZE, 30, 170);
  const field = meadow(scene, { toCamera: shot.azimuth, clear });
  return {
    reader, focus, shotFocus, shot,
    update: (t) => field.update(t),
    shade: () => cloudShadowAt(0, -size.depth / 2),
  };
}

// The studio: a potter's-studio wall of irregular open shelving in knotty pine (or
// ?finish=…), crowded with ceramics, glass-lidded bins scattered through it,
// the middle eight holding the portfolio; warm plaster behind, a white wool
// carpet underfoot;
// low sun from the left. After the reference photo's layout and colours.
function setupStudio(scene, camera) {
  const shot = CONFIG.studioShot;
  const finish = new URLSearchParams(location.search).get('finish') || 'knotty';
  const mats = finishMats(finish, { moss: false });
  // the wall's wood: knotty pine with a few big knots (pine3), or ?grain=… for another (woodGrains.js)
  const grain = new URLSearchParams(location.search).get('grain') || 'pine3';
  if (finish === 'knotty' && grain !== 'knotty' && GRAINS.includes(grain)) {
    const sheet = woodSheet(grain);
    sheet.repeat.copy(mats.wall.map.repeat);
    mats.wall.map = sheet; mats.wall.needsUpdate = true;
  }
  scene.background = new THREE.Color('#e7dccb');
  // only the eight bins in the two middle columns are kept, four in each,
  // with a sign of letter blocks on the shelf above: CLIENT over the left
  // column, OPEN SOURCE over the right. Every other bin cell is an open
  // shelf of ceramics.
  const middle = -0.265; // between the two columns
  const { slots, focus } = shelfWall(scene, mats, {
    bins: Infinity,
    binAt: (x, y) => Math.abs(x - middle) < 0.6 && y < 1.8,
    sign: (x, y) => Math.abs(x - middle) < 0.6 && y < 2.3 ? (x < middle ? GROUPS.client : GROUPS.open) : null,
    signStyle: new URLSearchParams(location.search).get('sign') || 'plaque',
    // every plaque's words at the size the longest label fits
    signFit: Object.values(GROUPS).map((w) => [].concat(w).join(' ')).sort((a, b) => b.length - a.length)[0],
    backStone: true,  // limestone behind it all
    backTiles: new URLSearchParams(location.search).get('tiles') || 'zellige', // glossy zellige, or ?tiles=pearl
    grain,
    plaqueKind: new URLSearchParams(location.search).get('plaque') || 'painted',
  });
  // the case studies in reading order: the left column top to bottom, then the right
  slots.sort((a, b) => a.position.x - b.position.x || b.position.y - a.position.y);
  const bins = slots.map((slot, i) => new Bin(projects[i] ?? { id: `bin-${i + 1}`, name: '', items: [] }, slot, mats, i));
  const items = bins.slice(0, projects.length);
  // a planted bed of moss, ferns and grasses round the rocks, or raked sand
  // optionally a garden in front: planted (moss, ferns, grasses) or raked sand
  if (CONFIG.garden === 'sand') zenGarden(scene);
  else if (CONFIG.garden === 'planted') plantedGarden(scene, { z: [0.15, 2.4] });

  // the floor: a white shag carpet, or polished concrete
  if (CONFIG.floor === 'carpet') carpet(scene);
  else {
    // polished concrete, warm grey, faintly clouded
    const c = document.createElement('canvas');
    c.width = c.height = 512;
    const ctx = c.getContext('2d');
    ctx.fillStyle = '#bdb2a3'; ctx.fillRect(0, 0, 512, 512);
    ctx.filter = 'blur(20px)';
    for (let i = 0; i < 60; i++) {
      const v = Math.random() < 0.5 ? 235 : 150;
      ctx.fillStyle = `rgba(${v},${v - 8},${v - 18},0.06)`;
      ctx.beginPath(); ctx.ellipse(Math.random() * 512, Math.random() * 512, 40 + Math.random() * 120, 30 + Math.random() * 90, Math.random() * 3, 0, Math.PI * 2); ctx.fill();
    }
    const tex = new THREE.CanvasTexture(c);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(8, 8);
    const floor = new THREE.Mesh(new THREE.PlaneGeometry(40, 40).rotateX(-Math.PI / 2), new THREE.MeshStandardMaterial({ map: tex, roughness: 0.42 }));
    floor.receiveShadow = true;
    scene.add(floor);
  }

  const shotFocus = (x, y) => new THREE.Vector3(x, y, 0);
  return {
    reader: new BinReader({ camera, canvas, bins: items, cols: 7 }), focus, shotFocus, shot,
    // shot like a photograph: ambient occlusion in every corner; a lens
    // focused on the wall only when there's a garden in front to soften
    post: { ao: true, dof: CONFIG.garden === 'none' ? null : { focus: 7, aperture: 0.0022, maxblur: 0.01 } },
    // low, warm sun from the left, as in the photo
    // from high on the left and a little in front, so it lands in patches on
    // the plaster at the back of the cells, part shaded by uprights and shelves
    light: { sun: new THREE.Vector3(-2.4, 2.7, 2.6), colour: '#ffd29a', intensity: 6, sky: ['#fff1de', '#b8a283', 0.62], reach: 4.6 },
  };
}

async function start() {
  // the drawers on the loading screen fill as each step comes in
  const progress = loader(loading, projects.map((p) => p.hero));
  progress.to(0.04, 0.25);
  await Promise.all([loadFonts(), loadGrain()]);
  progress.to(0.25, 0.45);

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
  renderer.setPixelRatio(renderScale());
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFShadowMap;
  renderer.toneMapping = THREE.NeutralToneMapping;
  renderer.toneMappingExposure = 1.12;
  const aniso = renderer.capabilities.getMaxAnisotropy();
  setAnisotropy(aniso); setMaterialAnisotropy(aniso);
  await loadScans();
  progress.to(0.45, 0.6);
  await nextFrame();

  const scene = new THREE.Scene();
  // a soft room for the oiled wood, the brass and the glass to catch highlights from
  const pmrem = new THREE.PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
  scene.environmentIntensity = 0.28;

  const camera = new THREE.PerspectiveCamera(15, 1, 0.03, 400);
  scene.add(camera); // the piece in hand rides along with it

  const setup = design === 'bins' ? await setupBins(scene, camera, renderer) : setupDrawers(scene, camera, renderer);
  progress.to(0.7, 0.92);
  await nextFrame();
  const { reader, focus, shotFocus, shot } = setup;
  const lights = addLights(scene, { bright: setup.bright, target: shotFocus(...shot.focus), ...setup.light });
  camera.fov = shot.fov;

  const post = makePost(renderer, scene, camera, setup.post);
  window.cabinet = { scene, camera, reader, post, design, film: setup.film }; // handy in the devtools console

  focus.updateWorldMatrix(true, true);
  const viewDir = new THREE.Vector3(
    Math.sin(shot.azimuth) * Math.cos(shot.elevation),
    Math.sin(shot.elevation),
    Math.cos(shot.azimuth) * Math.cos(shot.elevation),
  );
  const aim = shotFocus(...shot.focus);

  // Fixed framing: `span` metres top to bottom, never less than `minWidth`
  // across, so narrow phones still see the whole width. On tall screens the
  // extra height is shared above and below, keeping the cabinet centred,
  // unless the shot gives a `lowest` height: then the frame grows downward
  // to it first, and the rest shows what's above.
  function frameScene() {
    const tanH = Math.tan(THREE.MathUtils.degToRad(camera.fov) / 2);
    if (shot.view) {
      // the view's height, top to bottom, more wall either side on a wide
      // screen and less on a narrow one, but never cropped into `keep`
      // (then it shows more height instead); centred on the view, or moved
      // just enough to keep `keep` in
      // The top bar covers the top of the canvas, so the view is fitted to
      // the part below it: the frame grows by the bar's share and moves up.
      const [x0, y0, x1, y1] = shot.view, [k0, j0, k1, j1] = shot.keep, a0 = camera.aspect;
      const barFrac = Math.min(0.3, (document.querySelector('.bar')?.offsetHeight ?? 0) / innerHeight);
      const a = a0 / (1 - barFrac); // the aspect of what shows below the bar
      const seen = Math.max(y1 - y0, j1 - j0, (k1 - k0) / a), w = seen * a;
      const clamp = (v, lo, hi) => Math.min(Math.max(v, lo), hi);
      // on a tall screen the extra height goes to the floor, the wall's top staying under the bar
      const cx = clamp((x0 + x1) / 2, k1 - w / 2, k0 + w / 2), cSeen = y1 - seen / 2;
      const h = seen / (1 - barFrac), cy = cSeen + (h - seen) / 2;
      const d = h / 2 / tanH;
      camera.position.set(cx, shot.eye, aim.z + d);
      camera.lookAt(cx, shot.eye, aim.z);
      const shift = (cy - shot.eye) / d;
      camera.userData.shift = shift;
      camera.setViewOffset(innerWidth, innerHeight, 0, -shift / (2 * tanH) * innerHeight, innerWidth, innerHeight);
      return;
    }
    // `maxSpan` caps the height shown, so on a tall, narrow screen the sides
    // are cropped rather than the view rising past the ceiling
    const d = Math.min(Math.max(shot.span / 2 / tanH, shot.minWidth / 2 / (tanH * camera.aspect)), (shot.maxSpan ?? Infinity) / 2 / tanH);
    if (shot.eye !== undefined) {
      // a level camera at eye height, the frame shifted up or down to the
      // aim as a shift lens would, so uprights stay truly vertical
      camera.position.set(aim.x + viewDir.x * d, shot.eye, aim.z + viewDir.z * d);
      camera.lookAt(aim.x, shot.eye, aim.z);
      const shift = (aim.y - shot.eye) / d; // the frame centre's rise, as a slope
      camera.userData.shift = shift;
      camera.setViewOffset(innerWidth, innerHeight, 0, -shift / (2 * tanH) * innerHeight, innerWidth, innerHeight);
      return;
    }
    camera.userData.shift = 0;
    camera.clearViewOffset();
    const extra = shot.lowest === undefined ? 0 : Math.max(0, d * tanH - (aim.y - shot.lowest));
    const target = aim.clone().add(new THREE.Vector3(0, extra, 0));
    camera.position.copy(target).addScaledVector(viewDir, d);
    camera.lookAt(target);
  }

  function resize() {
    const w = innerWidth, h = innerHeight;
    renderer.setSize(w, h, false);
    post.setSize(w, h);
    setup.setSize?.(w, h);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    if (reader.state === 'idle') frameScene();
    post.focusAt(camera.position.distanceTo(aim)); // the lens focuses on the wall
    reader.onResize();
  }
  addEventListener('resize', resize);
  resize();

  // the shaders built off the main thread where it can (so the drawers keep
  // filling), before the first frame
  await Promise.race([renderer.compileAsync(scene, camera).catch(() => {}), new Promise((res) => setTimeout(res, 5000))]);
  progress.to(0.92, 0.97);
  await nextFrame();

  const clock = new THREE.Clock();
  renderer.setAnimationLoop(() => {
    const dt = Math.min(clock.getDelta(), 0.05);
    reader.update(dt);
    setup.update?.(clock.elapsedTime, dt);
    lights.shade(setup.shade?.() ?? 0, dt);
    post.render();
  });

  await progress.finish();
  progress.stop();
  loading.classList.add('done');
  setTimeout(() => loading.remove(), 600);
}

// Daylight: a high, clean white sun from the front right, so soft shadows
// fall below and to the left of every knob and lid; blue sky light from
// above, a warm bounce from the ground, a cool fill on the camera side and
// a rim from behind. When a cloud's shadow passes over the cabinet the sun
// dims and the light turns a little cooler, as it does outdoors.
// In the cabin (`bright`), sun pours in from the sunroof and bounces off
// pale wood all round, so the sky and the bounce are stronger and warmer.
function addLights(scene, { bright = false, target = new THREE.Vector3(0, 0.7, -0.15), sun = null, colour = null, intensity = null, sky: skyTone = null, reach = 2.6 } = {}) {
  const SKY = skyTone ? skyTone[2] : bright ? 1.1 : 0.6;
  const sky = skyTone ? new THREE.HemisphereLight(skyTone[0], skyTone[1], SKY) : bright ? new THREE.HemisphereLight('#fff4e2', '#d9b98a', SKY) : new THREE.HemisphereLight('#cfe0ff', '#9aa47a', SKY);
  scene.add(sky);
  if (bright) scene.environmentIntensity = 0.45;

  const SUN = intensity ?? (bright ? 3.8 : 3.4);
  const key = new THREE.DirectionalLight(colour ?? '#fff4e4', SUN);
  const sunDir = (sun ?? new THREE.Vector3(2.2, 3.4, 2.2)).clone().normalize();
  key.position.copy(sunDir).multiplyScalar(4.6);
  key.target.position.copy(target).add(new THREE.Vector3(0, 0, -0.15));
  key.position.add(key.target.position);
  key.castShadow = true;
  key.shadow.mapSize.setScalar(innerWidth < 700 ? 2048 : 4096);
  Object.assign(key.shadow.camera, { left: -reach, right: reach, top: reach * 0.92, bottom: -reach * 0.92, near: 0.5, far: 18 });
  key.position.copy(key.target.position).addScaledVector(sunDir, 8);
  key.shadow.radius = 5;
  key.shadow.blurSamples = 20;
  key.shadow.bias = -0.0004;
  key.shadow.normalBias = 0.01;
  scene.add(key, key.target);

  const fill = new THREE.DirectionalLight('#dfe8ff', 0.55);
  fill.position.set(-2.6, 1.4, 2.4);
  scene.add(fill);

  const rim = new THREE.DirectionalLight('#ffffff', 0.7);
  rim.position.set(0.6, 2.6, -2.4);
  scene.add(rim);

  let shade = 0;
  return {
    // `target` 0 in sun, 1 under a cloud; eased so it never snaps
    shade(target, dt) {
      shade += (target - shade) * Math.min(1, dt * 3);
      key.intensity = SUN * (1 - 0.68 * shade);
      sky.intensity = SKY + 0.15 * shade;
      fill.intensity = 0.55 + 0.1 * shade;
    },
  };
}

start().catch((err) => {
  console.error(err);
  loading.querySelector('.loader-text').textContent = 'The cabinet could not be loaded. Check the console for details.';
});
