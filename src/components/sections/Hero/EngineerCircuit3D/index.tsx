import { Suspense, useEffect, useLayoutEffect, useMemo, useRef } from 'react';
import { Canvas, useFrame, useLoader, useThree } from '@react-three/fiber';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import {
  AdditiveBlending,
  Color,
  type Group,
  type InstancedMesh,
  Mesh,
  MeshStandardMaterial,
  Object3D,
  Vector3,
} from 'three';
import './EngineerCircuit3D.css';

const MODEL_PATH = '/models/hero/circuit-board.glb';

// Board constants mirror scripts/blender/create_circuit_board.py.
const BOARD_W = 7.2;
const BOARD_D = 4.8;
const BOARD_T = 0.12;
const SX = BOARD_W / 1200;
const SY = BOARD_D / 760;
const FLOW_Z = BOARD_T + 0.04;

// Silver traces are generated at runtime (not baked into the GLB) from the same
// path data as the data packets, so the lights always ride exactly on a line.
const TRACE_Y = BOARD_T + 0.014;
const TRACE_WIDTH = 0.055;
const TRACE_HEIGHT = 0.022;

// Central CPU socket extents as actually rendered (measured from the GLB: the
// Blender boxes export at half their nominal size, so the socket is ~1.0 x 0.9,
// i.e. half-extents 0.5 x 0.45 in this coordinate space).
const CHIP_HALF_X = 0.5;
const CHIP_HALF_Z = 0.45;
// Treat a trace as chip-connected when its first vertex is near the centre.
const CHIP_DETECT = 1.0;
// Gull-wing chip leads (right angles): a shoulder leaving the chip body at the
// top, a knee dropping to the board at the line's chip-end vertex, and a foot
// running outward along the line.
const LEAD_BOARD_Y = TRACE_Y + 0.01;
const LEAD_TOP_Y = 0.3;
// How far the shoulder tucks back under the chip body so it reads as attached.
const LEAD_OVERLAP = 0.06;
// How far the foot extends outward along the line past the knee.
const LEAD_TIP = 0.08;
const LEAD_WIDTH = 0.07;
const LEAD_THICK = 0.04;

// Board lies flat; the camera is placed at a fixed elevation above it so the
// viewing angle is controlled precisely (see CAMERA_* below).
const ASSEMBLY_ROTATION: [number, number, number] = [0, 0.12, 0];
const ASSEMBLY_SCALE = 1.4;
const ASSEMBLY_POSITION: [number, number, number] = [0, 0, 0];

// Camera elevation: 60 degrees above the (horizontal) board plane.
const CAMERA_ELEVATION_DEG = 60;
const CAMERA_DISTANCE = 7.4;
const CAMERA_TARGET: [number, number, number] = [0, 0.1, 0];
const CAMERA_POSITION: [number, number, number] = [
  0,
  CAMERA_TARGET[1] +
    CAMERA_DISTANCE * Math.sin((CAMERA_ELEVATION_DEG * Math.PI) / 180),
  CAMERA_TARGET[2] +
    CAMERA_DISTANCE * Math.cos((CAMERA_ELEVATION_DEG * Math.PI) / 180),
];

type Mode = 'dark' | 'light';

// 2D SVG point -> three.js scene point (Blender export_yup maps x,y,z -> x,z,-y)
function toScene(px: number, py: number): Vector3 {
  const bx = (px - 600) * SX;
  const by = -((py - 380) * SY);
  return new Vector3(bx, FLOW_Z, -by);
}

// Mirrors TRACES_2D in the Blender script and EngineerCircuitBoard.tsx.
const TRACES_2D: [number, number][][] = [
  [
    [500, 320],
    [360, 320],
    [360, 182],
    [150, 182],
  ],
  [
    [500, 358],
    [300, 358],
    [300, 300],
    [96, 300],
  ],
  [
    [500, 408],
    [262, 408],
    [262, 520],
    [104, 520],
  ],
  [
    [500, 446],
    [340, 446],
    [340, 620],
    [186, 620],
  ],
  [
    [700, 320],
    [858, 320],
    [858, 172],
    [1070, 172],
  ],
  [
    [700, 358],
    [820, 358],
    [820, 300],
    [1096, 300],
  ],
  [
    [700, 408],
    [900, 408],
    [900, 520],
    [1092, 520],
  ],
  [
    [700, 446],
    [840, 446],
    [840, 610],
    [1006, 610],
  ],
];

type Polyline = { points: Vector3[]; segLen: number[]; total: number };
type Packet = { line: number; speed: number; phase0: number; variant: 0 | 1 };

function buildPolylines(): Polyline[] {
  return TRACES_2D.map((trace) => {
    const points = trace.map(([px, py]) => toScene(px, py));
    const segLen: number[] = [];
    let total = 0;
    for (let i = 0; i < points.length - 1; i += 1) {
      const len = points[i].distanceTo(points[i + 1]);
      segLen.push(len);
      total += len;
    }
    return { points, segLen, total };
  });
}

function buildPackets(lines: Polyline[]): Packet[] {
  const packets: Packet[] = [];
  lines.forEach((line, lineIndex) => {
    const count = Math.max(1, Math.round(line.total / 2.4));
    for (let i = 0; i < count; i += 1) {
      packets.push({
        line: lineIndex,
        speed: 0.55 + Math.random() * 0.5,
        phase0: i / count + Math.random() * 0.05,
        variant: ((lineIndex + i) % 2) as 0 | 1,
      });
    }
  });
  return packets;
}

function pointAtDistance(line: Polyline, distance: number, out: Vector3): void {
  let remaining = distance;
  for (let i = 0; i < line.segLen.length; i += 1) {
    const len = line.segLen[i];
    if (remaining <= len || i === line.segLen.length - 1) {
      const t = len > 0 ? Math.min(remaining / len, 1) : 0;
      out.copy(line.points[i]).lerp(line.points[i + 1], t);
      return;
    }
    remaining -= len;
  }
}

const FLOW_COLORS: Record<Mode, [Color, Color]> = {
  dark: [new Color('#38e8ff'), new Color('#4dffb0')],
  light: [new Color('#00b4d8'), new Color('#1fb866')],
};

const PCB_COLOR: Record<Mode, Color> = {
  dark: new Color('#0a201d'),
  light: new Color('#7fb6b4'),
};

const TRACE_BASE_COLOR = new Color('#cdd2dc');
const TRACE_EMISSIVE_COLOR = new Color('#9aa3b4');

const LEAD_BASE_COLOR = new Color('#dde1e9');
const LEAD_EMISSIVE_COLOR = new Color('#aeb6c6');

type LeadBox = {
  position: [number, number, number];
  size: [number, number, number];
};

// Build right-angle (gull-wing) leads where each trace meets the CPU. The lead
// exits the chip side at LEAD_TOP_Y, drops to the board (knee), and lands a
// small foot on top of the connecting trace.
function buildChipLeads(): LeadBox[] {
  const leads: LeadBox[] = [];
  const kneeY = (LEAD_BOARD_Y + LEAD_TOP_Y) / 2;
  const kneeH = LEAD_TOP_Y - LEAD_BOARD_Y + LEAD_THICK;
  const footY = LEAD_BOARD_Y;

  TRACES_2D.forEach((trace) => {
    const p0 = toScene(trace[0][0], trace[0][1]);
    // Only traces whose first vertex sits on the chip get a lead.
    if (Math.abs(p0.x) > CHIP_DETECT || Math.abs(p0.z) > CHIP_DETECT) {
      return;
    }

    if (Math.abs(p0.x) >= Math.abs(p0.z)) {
      // Left/right edge.
      const sx = p0.x < 0 ? -1 : 1;
      const coord = p0.z;
      const shoulderInner = CHIP_HALF_X - LEAD_OVERLAP;
      const kneeR = Math.abs(p0.x);
      leads.push({
        position: [sx * ((shoulderInner + kneeR) / 2), LEAD_TOP_Y, coord],
        size: [kneeR - shoulderInner, LEAD_THICK, LEAD_WIDTH],
      });
      leads.push({
        position: [sx * kneeR, kneeY, coord],
        size: [LEAD_THICK, kneeH, LEAD_WIDTH],
      });
      leads.push({
        position: [sx * (kneeR + LEAD_TIP / 2), footY, coord],
        size: [LEAD_TIP, LEAD_THICK, LEAD_WIDTH],
      });
    } else {
      // Front/back edge.
      const sz = p0.z < 0 ? -1 : 1;
      const coord = p0.x;
      const shoulderInner = CHIP_HALF_Z - LEAD_OVERLAP;
      const kneeR = Math.abs(p0.z);
      leads.push({
        position: [coord, LEAD_TOP_Y, sz * ((shoulderInner + kneeR) / 2)],
        size: [LEAD_WIDTH, LEAD_THICK, kneeR - shoulderInner],
      });
      leads.push({
        position: [coord, kneeY, sz * kneeR],
        size: [LEAD_WIDTH, kneeH, LEAD_THICK],
      });
      leads.push({
        position: [coord, footY, sz * (kneeR + LEAD_TIP / 2)],
        size: [LEAD_WIDTH, LEAD_THICK, LEAD_TIP],
      });
    }
  });
  return leads;
}

type TraceMesh = {
  position: [number, number, number];
  size: [number, number, number];
};

type TracesProps = { mode: Mode };

function Traces({ mode }: TracesProps): React.ReactElement {
  const lines = useMemo(() => buildPolylines(), []);

  const { segments, vias } = useMemo(() => {
    const segs: TraceMesh[] = [];
    const viaSet = new Map<string, [number, number]>();
    const addVia = (x: number, z: number): void => {
      const key = `${x.toFixed(3)},${z.toFixed(3)}`;
      if (!viaSet.has(key)) {
        viaSet.set(key, [x, z]);
      }
    };
    lines.forEach((line) => {
      const pts = line.points;
      for (let i = 0; i < pts.length - 1; i += 1) {
        const a = pts[i];
        const b = pts[i + 1];
        const cx = (a.x + b.x) / 2;
        const cz = (a.z + b.z) / 2;
        const dx = Math.abs(b.x - a.x);
        const dz = Math.abs(b.z - a.z);
        // Extend along the run so adjacent segments overlap at corners.
        const sx =
          dx >= dz ? Math.max(dx, TRACE_WIDTH) + TRACE_WIDTH : TRACE_WIDTH;
        const sz =
          dx >= dz ? TRACE_WIDTH : Math.max(dz, TRACE_WIDTH) + TRACE_WIDTH;
        segs.push({ position: [cx, 0, cz], size: [sx, TRACE_HEIGHT, sz] });
      }
      // Round via pad at every vertex (endpoints + corners), except the ones
      // that sit on the CPU — those are replaced by the gull-wing chip leads.
      pts.forEach((p) => {
        if (
          Math.abs(p.x) <= CHIP_HALF_X + 0.16 &&
          Math.abs(p.z) <= CHIP_HALF_Z + 0.16
        ) {
          return;
        }
        addVia(p.x, p.z);
      });
    });
    return { segments: segs, vias: Array.from(viaSet.values()) };
  }, [lines]);

  const traceMat = useMemo(
    () =>
      new MeshStandardMaterial({
        color: TRACE_BASE_COLOR,
        metalness: 0.5,
        roughness: 0.4,
        emissive: TRACE_EMISSIVE_COLOR,
        emissiveIntensity: mode === 'dark' ? 0.5 : 0.14,
      }),
    [mode]
  );

  // Board-coloured disc that fills each ring's hole so the trace underneath
  // doesn't show through the hollow centre.
  const maskMat = useMemo(
    () =>
      new MeshStandardMaterial({
        color: PCB_COLOR[mode],
        metalness: 0,
        roughness: 0.75,
      }),
    [mode]
  );

  return (
    <group position={[0, TRACE_Y, 0]}>
      {segments.map((seg, index) => (
        <mesh key={`seg-${index}`} position={seg.position} material={traceMat}>
          <boxGeometry args={seg.size} />
        </mesh>
      ))}
      {vias.map(([x, z], index) => (
        <mesh
          key={`via-mask-${index}`}
          position={[x, 0.016, z]}
          material={maskMat}
        >
          <cylinderGeometry args={[0.044, 0.044, 0.02, 18]} />
        </mesh>
      ))}
      {vias.map(([x, z], index) => (
        <mesh
          key={`via-${index}`}
          position={[x, 0.02, z]}
          rotation={[Math.PI / 2, 0, 0]}
          material={traceMat}
        >
          <torusGeometry args={[0.06, 0.018, 8, 20]} />
        </mesh>
      ))}
    </group>
  );
}

type ChipLeadsProps = { mode: Mode };

function ChipLeads({ mode }: ChipLeadsProps): React.ReactElement {
  const leads = useMemo(() => buildChipLeads(), []);
  const leadMat = useMemo(
    () =>
      new MeshStandardMaterial({
        color: LEAD_BASE_COLOR,
        metalness: 0.9,
        roughness: 0.3,
        emissive: LEAD_EMISSIVE_COLOR,
        emissiveIntensity: mode === 'dark' ? 0.3 : 0.08,
      }),
    [mode]
  );

  return (
    <group>
      {leads.map((lead, index) => (
        <mesh key={`lead-${index}`} position={lead.position} material={leadMat}>
          <boxGeometry args={lead.size} />
        </mesh>
      ))}
    </group>
  );
}

type DataFlowProps = { flowSpeed: number; mode: Mode };

function DataFlow({ flowSpeed, mode }: DataFlowProps): React.ReactElement {
  const coreRef = useRef<InstancedMesh>(null);
  const haloRef = useRef<InstancedMesh>(null);
  const lines = useMemo(() => buildPolylines(), []);
  const packets = useMemo(() => buildPackets(lines), [lines]);
  const dummy = useMemo(() => new Object3D(), []);
  const cursor = useMemo(() => new Vector3(), []);
  const distRef = useRef<Float32Array | null>(null);

  useLayoutEffect(() => {
    const core = coreRef.current;
    const halo = haloRef.current;
    if (!core || !halo) {
      return;
    }
    const colors = FLOW_COLORS[mode];
    distRef.current = Float32Array.from(
      packets,
      (packet) => packet.phase0 * lines[packet.line].total
    );
    packets.forEach((packet, index) => {
      core.setColorAt(index, colors[packet.variant]);
      halo.setColorAt(index, colors[packet.variant]);
    });
    if (core.instanceColor) core.instanceColor.needsUpdate = true;
    if (halo.instanceColor) halo.instanceColor.needsUpdate = true;
  }, [packets, lines, mode]);

  useFrame((_, delta) => {
    const core = coreRef.current;
    const halo = haloRef.current;
    const dists = distRef.current;
    if (!core || !halo || !dists) {
      return;
    }
    for (let i = 0; i < packets.length; i += 1) {
      const packet = packets[i];
      const line = lines[packet.line];
      let d = dists[i] + delta * packet.speed * flowSpeed;
      if (line.total > 0) {
        d %= line.total;
        if (d < 0) d += line.total;
      }
      dists[i] = d;

      pointAtDistance(line, d, cursor);
      dummy.position.copy(cursor);
      dummy.scale.setScalar(1);
      dummy.updateMatrix();
      core.setMatrixAt(i, dummy.matrix);

      dummy.scale.setScalar(1.7);
      dummy.updateMatrix();
      halo.setMatrixAt(i, dummy.matrix);
    }
    core.instanceMatrix.needsUpdate = true;
    halo.instanceMatrix.needsUpdate = true;
  });

  return (
    <group>
      <instancedMesh
        ref={haloRef}
        args={[undefined, undefined, packets.length]}
        frustumCulled={false}
      >
        <sphereGeometry args={[0.05, 10, 10]} />
        <meshBasicMaterial
          transparent
          opacity={0.16}
          blending={AdditiveBlending}
          depthWrite={false}
          toneMapped={false}
        />
      </instancedMesh>
      <instancedMesh
        ref={coreRef}
        args={[undefined, undefined, packets.length]}
        frustumCulled={false}
      >
        <sphereGeometry args={[0.03, 10, 10]} />
        <meshBasicMaterial
          transparent
          opacity={0.95}
          blending={AdditiveBlending}
          depthWrite={false}
          toneMapped={false}
        />
      </instancedMesh>
    </group>
  );
}

type SceneProps = {
  isActive: boolean;
  flowSpeed: number;
  mode: Mode;
};

function BoardScene({
  isActive,
  flowSpeed,
  mode,
}: SceneProps): React.ReactElement {
  const groupRef = useRef<Group>(null);
  const gltf = useLoader(GLTFLoader, MODEL_PATH);
  const model = useMemo(() => gltf.scene.clone(true), [gltf.scene]);
  const pointer = useRef({ x: 0, y: 0 });

  // Recolor PCB / copper per theme.
  useEffect(() => {
    model.traverse((child) => {
      if (!(child instanceof Mesh)) {
        return;
      }
      const material = child.material;
      if (!(material instanceof MeshStandardMaterial)) {
        return;
      }
      if (material.name === 'PCB') {
        material.color.copy(PCB_COLOR[mode]);
      }
    });
  }, [model, mode]);

  useFrame((state, delta) => {
    const group = groupRef.current;
    if (!group) {
      return;
    }
    // Gentle pointer parallax for interactivity (no spin).
    pointer.current.x = state.pointer.x;
    pointer.current.y = state.pointer.y;
    const targetY = ASSEMBLY_ROTATION[1] + pointer.current.x * 0.16;
    const targetX = ASSEMBLY_ROTATION[0] + pointer.current.y * -0.1;
    const lerp = Math.min(delta * 2.5, 1);
    group.rotation.y += (targetY - group.rotation.y) * lerp;
    group.rotation.x += (targetX - group.rotation.x) * lerp;
  });

  return (
    <group
      ref={groupRef}
      position={ASSEMBLY_POSITION}
      rotation={ASSEMBLY_ROTATION}
      scale={ASSEMBLY_SCALE}
    >
      <primitive object={model} />
      <Traces mode={mode} />
      <ChipLeads mode={mode} />
      <DataFlow flowSpeed={isActive ? flowSpeed : 0} mode={mode} />
    </group>
  );
}

type SceneReadyNotifierProps = {
  onSceneReady?: () => void;
};

function SceneReadyNotifier({ onSceneReady }: SceneReadyNotifierProps): null {
  const frameCountRef = useRef(0);
  const hasNotifiedRef = useRef(false);
  const invalidate = useThree((state) => state.invalidate);

  useFrame(() => {
    if (hasNotifiedRef.current) {
      return;
    }

    frameCountRef.current += 1;

    if (frameCountRef.current < 2) {
      invalidate();
      return;
    }

    hasNotifiedRef.current = true;
    onSceneReady?.();
  });

  return null;
}

function CameraRig(): null {
  const camera = useThree((state) => state.camera);
  const invalidate = useThree((state) => state.invalidate);

  useLayoutEffect(() => {
    camera.position.set(...CAMERA_POSITION);
    camera.lookAt(...CAMERA_TARGET);
    camera.updateProjectionMatrix();
    invalidate();
  }, [camera, invalidate]);

  return null;
}

type ChipCanvasProps = {
  isActive: boolean;
  flowSpeed: number;
  mode: Mode;
  onSceneReady?: () => void;
};

function ChipCanvas({
  isActive,
  flowSpeed,
  mode,
  onSceneReady,
}: ChipCanvasProps): React.ReactElement {
  const keyLight = mode === 'dark' ? '#ffffff' : '#fffaf0';
  const fillLight = mode === 'dark' ? '#39d8ff' : '#bfe9ff';
  const ambient = mode === 'dark' ? 0.5 : 0.85;

  return (
    <Canvas
      className="engineer-circuit3d-canvas"
      dpr={[1, 1.75]}
      camera={{ position: CAMERA_POSITION, fov: 42, near: 0.1, far: 100 }}
      gl={{ alpha: true, antialias: true, powerPreference: 'high-performance' }}
      frameloop={isActive && flowSpeed > 0 ? 'always' : 'demand'}
    >
      <CameraRig />
      <ambientLight intensity={ambient} />
      <directionalLight position={[3, 7, 4]} intensity={1.5} color={keyLight} />
      <directionalLight
        position={[-4, 4, -3]}
        intensity={0.6}
        color={fillLight}
      />
      <pointLight position={[0, 3, 0]} intensity={0.4} color="#39ff14" />
      <Suspense fallback={null}>
        <BoardScene isActive={isActive} flowSpeed={flowSpeed} mode={mode} />
        <SceneReadyNotifier onSceneReady={onSceneReady} />
      </Suspense>
    </Canvas>
  );
}

export type EngineerCircuit3DProps = {
  isActive: boolean;
  reducedMotion: boolean;
  calmMotion: boolean;
  mode: Mode;
  onSceneReady?: () => void;
};

function EngineerCircuit3D({
  isActive,
  reducedMotion,
  calmMotion,
  mode,
  onSceneReady,
}: EngineerCircuit3DProps): React.ReactElement {
  const baseSpeed = calmMotion ? 0.6 : 1.2;
  const effectiveSpeed = reducedMotion ? 0 : baseSpeed;

  return (
    <div className="engineer-circuit3d-stage" aria-hidden="true">
      <ChipCanvas
        isActive={isActive}
        flowSpeed={effectiveSpeed}
        mode={mode}
        onSceneReady={onSceneReady}
      />
    </div>
  );
}

export default EngineerCircuit3D;
