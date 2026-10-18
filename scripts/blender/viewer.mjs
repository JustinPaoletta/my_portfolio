import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
const renderer = new THREE.WebGLRenderer({
  antialias: true,
  preserveDrawingBuffer: true,
});
renderer.setSize(globalThis.innerWidth, globalThis.innerHeight);
renderer.setPixelRatio(Math.min(globalThis.devicePixelRatio, 2));
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 0.9;
globalThis.document.body.append(renderer.domElement);
const scene = new THREE.Scene();
scene.background = new THREE.Color('#21172a');
scene.environment = new THREE.PMREMGenerator(renderer).fromScene(
  new RoomEnvironment(),
  0.04
).texture;
const camera = new THREE.OrthographicCamera(
  (-1.95 * globalThis.innerWidth) / globalThis.innerHeight,
  (1.95 * globalThis.innerWidth) / globalThis.innerHeight,
  1.95,
  -1.95,
  0.1,
  100
);
camera.position.set(1.35, 3.8, 8);
camera.lookAt(-0.1, 1.17, 0.1);
const key = new THREE.DirectionalLight('#fff3df', 2);
key.position.set(-3, 6, 4);
scene.add(key);
scene.add(new THREE.AmbientLight('#c5dcff', 0.2));
const gltf = await new GLTFLoader().loadAsync(
  '/models/hero/cosmic-astronaut.glb?v=' +
    new globalThis.URLSearchParams(globalThis.location.search).get('review')
);
scene.add(gltf.scene);
const mixer = new THREE.AnimationMixer(gltf.scene);
const action = mixer.clipAction(gltf.animations[0]);
action.setLoop(THREE.LoopOnce, 1);
action.clampWhenFinished = true;
action.play();
let playing = false,
  last = globalThis.performance.now();
const wrist =
  gltf.scene.getObjectByProperty('name', 'HandL') ??
  (() => {
    let b;
    gltf.scene.traverse((o) => {
      if (o.isBone && o.name.includes('Hand')) b = o;
    });
    return b;
  })();
globalThis.assetReview = {
  setTime(t) {
    action.reset().play();
    mixer.setTime(t);
    scene.updateMatrixWorld(true);
    renderer.render(scene, camera);
    return wrist.getWorldPosition(new THREE.Vector3()).toArray();
  },
  clip: gltf.animations[0].name,
  duration: gltf.animations[0].duration,
  model: gltf.scene,
  renderer,
};
globalThis.document.querySelector('#time').oninput = (e) => {
  playing = false;
  globalThis.assetReview.setTime(Number(e.target.value));
};
globalThis.document.querySelector('#play').onclick = () => {
  action.reset().play();
  mixer.setTime(0);
  playing = true;
};
globalThis.document.querySelector('#status').textContent =
  `${gltf.animations[0].name} · ${gltf.animations[0].duration.toFixed(2)} s`;
function tick(now) {
  if (playing) mixer.update(Math.min((now - last) / 1000, 0.1));
  last = now;
  renderer.render(scene, camera);
  globalThis.requestAnimationFrame(tick);
}
globalThis.requestAnimationFrame(tick);
globalThis.assetReview.setTime(0);

globalThis.addEventListener('resize', () => {
  const aspect = globalThis.innerWidth / globalThis.innerHeight;
  camera.left = -1.95 * aspect;
  camera.right = 1.95 * aspect;
  camera.updateProjectionMatrix();
  renderer.setSize(globalThis.innerWidth, globalThis.innerHeight);
});
