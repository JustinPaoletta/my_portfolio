import {
  AdditiveBlending,
  BoxGeometry,
  BufferGeometry,
  CatmullRomCurve3,
  Color,
  CylinderGeometry,
  DataTexture,
  Group,
  InstancedMesh,
  LinearFilter,
  Mesh,
  MeshBasicMaterial,
  MeshStandardMaterial,
  Object3D,
  PlaneGeometry,
  RGBAFormat,
  TorusGeometry,
  TubeGeometry,
  Vector3,
} from 'three';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';

type Point = [number, number, number];
// A readable activity flash: a bright 0.3s signal followed by a distinct dark interval.
// Compact/calm mode slows this cycle with the rest of the scene.
export function indicatorBrightness(time: number, phase: number): number {
  const cycle = (((time / 1.6 + phase * 0.137) % 1) + 1) % 1;
  return cycle < 0.2 ? 3 : 0.015;
}
function createIndicatorGlow(): DataTexture {
  const size = 32,
    data = new Uint8Array(size * size * 4);
  for (let y = 0; y < size; y++)
    for (let x = 0; x < size; x++) {
      const distance = Math.hypot(
        ((x + 0.5) / size) * 2 - 1,
        ((y + 0.5) / size) * 2 - 1
      );
      const index = (y * size + x) * 4;
      data[index] = data[index + 1] = data[index + 2] = 255;
      data[index + 3] = Math.round(Math.max(0, 1 - distance) ** 2 * 255);
    }
  const texture = new DataTexture(data, size, size, RGBAFormat);
  texture.magFilter = texture.minFilter = LinearFilter;
  texture.needsUpdate = true;
  return texture;
}
export type RoomMode = 'dark' | 'light';
export const ROOM_CAMERA = {
  position: [0.35, 1.5, 4.7] as Point,
  target: [0, 2.15, -7] as Point,
  fov: 56,
};
export const FAN_POSITIONS = [-2.6, 0, 2.6];
// Every power cable starts in a module socket and ends in the wall bus socket.
export const POWER_BAYS = [1, -3.5, -6.5];
export function cableRoute(z: number, lane: number): Vector3[] {
  const offset = (lane - 1) * 0.18;
  return [
    [4.05 + offset, 1.92, z + 0.45],
    [3.95 + offset, 2.35, z + 0.35],
    [4.3 + offset, 2.9, z - 0.15],
    [4.77, 3.12, z - 0.4 + offset],
  ].map((p) => new Vector3(...(p as Point)));
}

export function createEngineerRoom(mode: RoomMode) {
  const root = new Group();
  const light = mode === 'light';
  const materials = {
    shell: new MeshStandardMaterial({
      color: light ? '#59717b' : '#142a36',
      roughness: 0.68,
      metalness: 0.3,
    }),
    steel: new MeshStandardMaterial({
      color: light ? '#738a91' : '#334d5b',
      roughness: 0.42,
      metalness: 0.65,
    }),
    silver: new MeshStandardMaterial({
      color: '#9eadb4',
      roughness: 0.38,
      metalness: 0.7,
    }),
    black: new MeshStandardMaterial({
      color: light ? '#34464b' : '#14232c',
      roughness: 0.58,
      metalness: 0.25,
    }),
    green: new MeshStandardMaterial({
      color: light ? '#357561' : '#185440',
      roughness: 0.68,
      metalness: 0.2,
    }),
    gold: new MeshStandardMaterial({
      color: '#d3b563',
      roughness: 0.4,
      metalness: 0.65,
    }),
    trace: new MeshStandardMaterial({
      color: light ? '#c6e1d6' : '#99c5be',
      roughness: 0.5,
      metalness: 0.45,
    }),
  };
  type MaterialKey = keyof typeof materials;
  const batches = new Map<MaterialKey, BufferGeometry[]>();
  function add(
    geometry: BufferGeometry,
    key: MaterialKey,
    position: Point,
    rotation: Point = [0, 0, 0]
  ) {
    const transform = new Object3D();
    transform.position.set(...position);
    transform.rotation.set(...rotation);
    transform.updateMatrix();
    geometry.applyMatrix4(transform.matrix);
    const batch = batches.get(key) ?? [];
    batch.push(geometry);
    batches.set(key, batch);
  }
  function box(size: Point, position: Point, key: MaterialKey) {
    add(new BoxGeometry(...size), key, position);
  }
  function cyl(
    radius: number,
    height: number,
    position: Point,
    key: MaterialKey,
    rotation: Point = [0, 0, 0]
  ) {
    add(
      new CylinderGeometry(radius, radius, height, 12),
      key,
      position,
      rotation
    );
  }
  const lights: { position: Point; phase: number; color: string }[] = [];
  function led(position: Point, phase: number, color = '#56eff0') {
    lights.push({ position, phase, color });
  }

  // Continuous shell; the front wall is behind the internal camera.
  box([10.2, 0.22, 14.2], [0, -0.11, -2], 'green');
  box([0.25, 5.4, 14.2], [-5.1, 2.6, -2], 'shell');
  box([0.25, 5.4, 14.2], [5.1, 2.6, -2], 'shell');
  box([10.4, 5.4, 0.25], [0, 2.6, -9.05], 'shell');
  box([10.4, 5.4, 0.25], [0, 2.6, 5.05], 'shell');
  box([10.4, 0.2, 14.4], [0, 5.3, -2], 'shell');
  for (let z = -8; z <= 4; z += 2) {
    box([10, 0.18, 0.18], [0, 5.12, z], 'steel');
    for (const x of [-4.94, 4.94]) {
      box([0.14, 5.2, 0.18], [x, 2.6, z], 'steel');
      cyl(0.055, 0.05, [x, 4.72, z + 0.12], 'gold', [Math.PI / 2, 0, 0]);
    }
  }
  for (const x of [-3, 0, 3]) box([0.15, 0.16, 14], [x, 5.12, -2], 'steel');

  // Grounded sockets and fin stacks; repeated fins are merged, not separate draw calls.
  for (const z of POWER_BAYS) {
    box([1.65, 0.2, 1.8], [-2.85, 0.1, z], 'black');
    box([1.45, 0.24, 1.55], [-2.85, 0.42, z], 'gold');
    for (let i = 0; i < 13; i++)
      box([0.065, 2.15, 1.55], [-3.57 + i * 0.12, 1.55, z], 'silver');
    for (const x of [-3.45, -2.25]) {
      cyl(0.11, 0.52, [x, 0.34, z - 0.65], 'gold');
      box([0.2, 0.12, 0.2], [x, 0.64, z - 0.65], 'black');
    }
    for (let i = 0; i < 3; i++) {
      const x = -4.42 + i * 0.34;
      box([0.2, 0.14, 2.1], [x, 0.07, z], 'black');
      box([0.1, 2.55, 1.9], [x, 1.4, z], 'green');
      for (const zz of [-0.62, 0, 0.62])
        for (const y of [0.65, 1.4, 2.15])
          box([0.16, 0.48, 0.44], [x + 0.06, y, z + zz], 'black');
      for (let j = 0; j < 8; j++)
        box([0.12, 0.14, 0.1], [x, 0.2, z - 0.85 + j * 0.24], 'gold');
    }

    // Power-management chassis, front controller board, air vents and status strip.
    box([1.05, 1.85, 1.65], [4.15, 0.925, z], 'steel');
    box([1.1, 0.14, 1.7], [4.15, 1.85, z], 'black');
    box([0.82, 0.55, 0.07], [4.15, 1.08, z + 0.86], 'green');
    box([0.72, 0.17, 0.08], [4.15, 1.48, z + 0.86], 'black');
    box([0.25, 0.26, 0.1], [4.02, 1.1, z + 0.92], 'black');
    for (let i = 0; i < 5; i++)
      box([0.68, 0.04, 0.055], [4.15, 0.25 + i * 0.1, z + 0.86], 'black');
    for (let i = 0; i < 3; i++) {
      const x = 4.05 + (i - 1) * 0.18;
      box([0.16, 0.12, 0.2], [x, 1.92, z + 0.45], 'gold');
      box([0.21, 0.12, 0.26], [x, 1.85, z + 0.45], 'black');
      const points = cableRoute(z, i);
      add(
        new TubeGeometry(new CatmullRomCurve3(points), 18, 0.052, 6, false),
        i === 1 ? 'gold' : 'black',
        [0, 0, 0]
      );
      const end = points.at(-1)!;
      box([0.23, 0.14, 0.17], [end.x, end.y, end.z], 'gold');
      box([0.2, 0.24, 0.28], [4.87, 3.12, end.z], 'black');
      led(
        [3.96 + i * 0.19, 1.48, z + 0.925],
        i + z,
        i === 2 ? '#f6bb56' : '#56eff0'
      );
    }
    box([0.8, 0.1, 0.25], [4.06, 2.49, z + 0.22], 'steel'); // cable saddle between sockets and bus
  }
  box([0.14, 0.38, 12.7], [4.89, 3.12, -2.3], 'steel'); // wall-mounted distribution bus

  const rotors: Group[] = [];
  for (const x of FAN_POSITIONS) {
    const z = -8.84,
      y = 3.48;
    for (const side of [-1, 1]) {
      box([0.17, 2.15, 0.22], [x + side, y, z], 'steel');
      box([2.15, 0.17, 0.22], [x, y + side, z], 'steel');
    }
    add(new TorusGeometry(0.9, 0.08, 6, 32), 'black', [x, y, z]);
    for (const xx of [-0.94, 0.94])
      for (const yy of [-0.94, 0.94])
        cyl(0.055, 0.09, [x + xx, y + yy, z + 0.15], 'gold', [
          Math.PI / 2,
          0,
          0,
        ]);
    const rotor = new Group();
    rotor.position.set(x, y, z);
    root.add(rotor);
    rotors.push(rotor);
    const blades: BufferGeometry[] = [];
    for (let i = 0; i < 7; i++) {
      const a = (i * Math.PI * 2) / 7;
      const m = new Object3D();
      m.position.set(Math.sin(a) * 0.5, Math.cos(a) * 0.5, 0.03);
      m.rotation.z = -a + 0.38;
      m.updateMatrix();
      blades.push(new BoxGeometry(0.37, 0.7, 0.08).applyMatrix4(m.matrix));
    }
    const merged = mergeGeometries(blades)!;
    blades.forEach((g) => g.dispose());
    rotor.add(new Mesh(merged, materials.steel));
    cyl(0.28, 0.24, [x, y, z + 0.17], 'black', [Math.PI / 2, 0, 0]);
    box([0.65, 0.18, 0.12], [x, 4.8, z], 'black');
    for (let i = 0; i < 3; i++)
      led([x - 0.18 + i * 0.18, 4.8, z + 0.09], i + x);
  }

  for (const z of [-7, -4, -1, 2, 4])
    for (const x of [-1.7, 1.6, 3]) {
      if (z > 0 && x > 0) {
        cyl(0.25, 0.08, [x, 0.04, z], 'gold');
        cyl(0.23, 0.68, [x, 0.42, z], 'black');
        cyl(0.23, 0.04, [x, 0.78, z], 'gold');
      } else {
        box([0.85, 0.3, 0.65], [x, 0.2, z], 'black');
        for (const side of [-0.45, 0.45])
          for (let i = 0; i < 5; i++)
            box(
              [0.14, 0.1, 0.06],
              [x + side, 0.05, z - 0.25 + i * 0.12],
              'gold'
            );
      }
    }
  for (let i = 0; i < 10; i++) {
    const x = -4.4 + i * 0.95,
      z = 4 - (i % 4) * 0.6;
    box([0.035, 0.018, 11], [x, 0.018, -2], 'trace');
    box([0.7, 0.018, 0.035], [x + 0.33, 0.018, z], 'trace');
    for (const zz of [z, -3, -6])
      add(
        new TorusGeometry(0.1, 0.023, 6, 12),
        'trace',
        [x, 0.04, zz],
        [Math.PI / 2, 0, 0]
      );
  }
  // Low-power wall indicator strips, fed by the same bus as the controller modules.
  for (const x of [-4.94, 4.94])
    for (const z of [-6, -2, 2]) {
      box([0.1, 0.6, 0.17], [x, 3.65, z], 'black');
      for (let i = 0; i < 3; i++)
        led([x + (x < 0 ? 0.07 : -0.07), 3.46 + i * 0.17, z], z + i);
    }

  // A motherboard diagnostic controller keeps activity lamps visible in portrait framing.
  box([1, 0.2, 0.6], [0, 0.1, 0.5], 'black');
  box([0.85, 0.04, 0.48], [0, 0.22, 0.5], 'green');
  box([0.2, 0.06, 0.22], [-0.23, 0.27, 0.5], 'black');
  for (let i = 0; i < 3; i++)
    led([0.05 + i * 0.17, 0.3, 0.5], i + 0.7, i === 2 ? '#ffc054' : '#48ffff');

  for (const [key, geometries] of batches) {
    const geometry = mergeGeometries(geometries)!;
    geometries.forEach((g) => g.dispose());
    const mesh = new Mesh(geometry, materials[key]);
    root.add(mesh);
  }
  const indicatorMaterial = new MeshBasicMaterial({
    color: '#ffffff',
    toneMapped: false,
  });
  const indicators = new InstancedMesh(
    new BoxGeometry(0.13, 0.12, 0.07),
    indicatorMaterial,
    lights.length
  );
  const dummy = new Object3D(),
    color = new Color();
  root.add(indicators);
  const glowTexture = createIndicatorGlow();
  const glowMaterial = new MeshBasicMaterial({
    map: glowTexture,
    transparent: true,
    opacity: 0.6,
    blending: AdditiveBlending,
    depthWrite: false,
    toneMapped: false,
  });
  const glows = new InstancedMesh(
    new PlaneGeometry(0.65, 0.65),
    glowMaterial,
    lights.length
  );
  root.add(glows);
  lights.forEach((l, i) => {
    dummy.rotation.set(0, 0, 0);
    dummy.position.set(...l.position);
    dummy.updateMatrix();
    indicators.setMatrixAt(i, dummy.matrix);
    indicators.setColorAt(i, new Color(l.color));
    dummy.lookAt(...ROOM_CAMERA.position);
    dummy.updateMatrix();
    glows.setMatrixAt(i, dummy.matrix);
    glows.setColorAt(i, new Color(l.color));
  });
  function animate(time: number) {
    rotors.forEach((r, i) => (r.rotation.z = -time * (2.1 + i * 0.25)));
    lights.forEach((l, i) => {
      const strength = indicatorBrightness(time, l.phase);
      color.set(l.color).multiplyScalar(strength);
      indicators.setColorAt(i, color);
      glows.setColorAt(i, color);
    });
    if (indicators.instanceColor) indicators.instanceColor.needsUpdate = true;
    if (glows.instanceColor) glows.instanceColor.needsUpdate = true;
  }
  animate(0);
  function dispose() {
    root.traverse((o) => {
      if (o instanceof Mesh) o.geometry.dispose();
      if (o instanceof InstancedMesh) o.dispose();
    });
    Object.values(materials).forEach((m) => m.dispose());
    indicatorMaterial.dispose();
    glowMaterial.dispose();
    glowTexture.dispose();
  }
  return { root, animate, dispose, rotors, indicators, glows };
}
