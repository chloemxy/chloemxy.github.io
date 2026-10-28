// Real plants for the shelves: eight CC0 models from Poly Haven
// (polyhaven.com, no credit required; see assets/plants/SOURCES.txt), loaded
// once each and cloned wherever they're placed. Two come in their own pots;
// the rest are set into the wall's turned clay pots by shelfWall.js. Each is
// loaded as <id>.glb, made from the 1k original by tools/optimize_plant.sh
// (512 px textures, a lighter mesh, meshopt): about 3 MB for all eight, down
// from 23 MB, so the scene opens quickly.

import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { MeshoptDecoder } from 'three/addons/libs/meshopt_decoder.module.js';

export const PLANT_MODELS = [
  { id: 'fern_02', potted: false, variants: true }, // four separate ferns
  { id: 'calathea_orbifolia_01', potted: false },
  { id: 'shrub_sorrel_01', potted: false },
  { id: 'potted_plant_02', potted: true },
  { id: 'potted_plant_04', potted: true },
  // the big ones, for the taller cells
  { id: 'potted_plant_01', potted: true, big: true },
  { id: 'pachira_aquatica_01', potted: false, variants: true, big: true }, // four money trees
  { id: 'anthurium_botany_01', potted: false, variants: true, big: true }, // six anthuriums
];

const loader = new GLTFLoader().setMeshoptDecoder(MeshoptDecoder);
const templates = new Map();

// stand an object on y = 0, centred on its own footprint, inside a holder
// that remembers its size
function stand(obj) {
  obj.updateMatrixWorld(true);
  const box = new THREE.Box3().setFromObject(obj), c = box.getCenter(new THREE.Vector3());
  obj.position.x -= c.x; obj.position.y -= box.min.y; obj.position.z -= c.z;
  const holder = new THREE.Group();
  holder.add(obj);
  holder.userData.size = box.getSize(new THREE.Vector3());
  holder.traverse((o) => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; } });
  return holder;
}

// A file holding several plants side by side (`variants`) gives one template
// per plant, its parts gathered by their letter (fern_02_a; pachira's bark_a
// with leaves_a); otherwise all the parts (pot, leaves, dirt, or a clump's
// stems) make one plant. A ground plane under a model is left out.
function load(id, variants) {
  if (!templates.has(id)) {
    templates.set(id, loader.loadAsync(`assets/plants/${id}/${id}.glb`).then((gltf) => {
      const parts = gltf.scene.children.filter((n) => !/_ground$/.test(n.name));
      if (variants) {
        const byLetter = new Map();
        for (const n of parts) {
          const k = (n.name.match(/_([a-z])$/) ?? [, n.name])[1];
          if (!byLetter.has(k)) byLetter.set(k, new THREE.Group());
          byLetter.get(k).add(n);
        }
        return [...byLetter.values()].map((grp) => stand(grp));
      }
      const whole = new THREE.Group();
      parts.forEach((n) => whole.add(n));
      return [stand(whole)];
    }));
  }
  return templates.get(id);
}

// fills `into` with a copy of one of the model's plants, as large as fits
// `width` across and `height` tall; it appears once the model has loaded
export function placePlant(into, id, { width, height, y = 0, pick = Math.random() }) {
  load(id, PLANT_MODELS.find((m) => m.id === id)?.variants).then((list) => {
    const t = list[Math.floor(pick * list.length)], s = t.userData.size;
    const m = t.clone(true);
    m.scale.setScalar(Math.min(height / s.y, width / Math.max(s.x, s.z)));
    m.position.y = y;
    m.rotation.y = pick * 37 % (Math.PI * 2);
    into.add(m);
  }).catch((e) => console.warn(`Plant model "${id}" didn't load`, e));
}
