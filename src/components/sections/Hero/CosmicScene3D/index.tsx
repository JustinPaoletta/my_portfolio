import { Suspense, useEffect, useLayoutEffect, useMemo, useRef } from 'react';
import { Canvas, useFrame, useLoader, useThree } from '@react-three/fiber';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import {
  AdditiveBlending,
  BufferGeometry,
  CanvasTexture,
  Color,
  Float32BufferAttribute,
  type Group,
  Mesh,
  MeshStandardMaterial,
  type Points,
  ShaderMaterial,
  type Texture,
} from 'three';
import './CosmicScene3D.css';

const MODEL_PATH = '/models/hero/cosmic-scene.glb';

type Mode = 'dark' | 'light';

// Camera sits near the centre of the nebula dome (radius 50 in the GLB) and
// looks outward, so the baked nebula reads as an infinite backdrop.
const CAMERA_POSITION: [number, number, number] = [0, 0, 6];
const CAMERA_TARGET: [number, number, number] = [0, 0, -1];

// Starfield shell: stars are scattered on a sphere around the origin so the
// slow drift continuously reveals fresh ones.
const STAR_INNER = 16;
const STAR_OUTER = 34;
const STAR_COUNT = 1100;
const STAR_COUNT_CALM = 520;

// Per-theme nebula tint. The emissive colour multiplies the baked emissive
// texture, so white preserves the authored palette while a tint shifts it.
const NEBULA_EMISSIVE: Record<Mode, Color> = {
  dark: new Color('#ffffff'),
  light: new Color('#f0e4ff'),
};
const NEBULA_EMISSIVE_INTENSITY: Record<Mode, number> = {
  dark: 1.15,
  light: 0.8,
};
// In light mode the dome's base colour is lit by a strong ambient so the deep
// "void" reads as the theme's lavender rather than black, with the baked
// nebula riding on top as soft accents.
const NEBULA_BASE: Record<Mode, Color> = {
  dark: new Color('#0b0014'),
  light: new Color('#8f74b4'),
};
const AMBIENT_INTENSITY: Record<Mode, number> = {
  dark: 0.5,
  light: 1.45,
};

// Star colours weighted toward white with cosmic-palette accents.
const STAR_PALETTE: Color[] = [
  new Color('#ffffff'),
  new Color('#ffffff'),
  new Color('#e9d8ff'),
  new Color('#c77dff'),
  new Color('#4cc9f0'),
  new Color('#f72585'),
];

// A single star sprite: a bright gaussian core with four long diffraction
// spikes plus faint diagonals, mirroring how bright stars bloom through a
// telescope's optics. Drawn once to an additive canvas and reused by every
// point, so the spikes always stay screen-aligned like real lens flares.
function createStarTexture(): CanvasTexture {
  const size = 128;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const texture = new CanvasTexture(canvas);
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    return texture;
  }

  const center = size / 2;
  ctx.fillStyle = '#000000';
  ctx.fillRect(0, 0, size, size);
  ctx.globalCompositeOperation = 'lighter';

  const drawSpike = (
    angle: number,
    length: number,
    width: number,
    alpha: number
  ): void => {
    ctx.save();
    ctx.translate(center, center);
    ctx.rotate(angle);
    const gradient = ctx.createLinearGradient(0, 0, 0, -length);
    gradient.addColorStop(0, `rgba(255, 255, 255, ${alpha})`);
    gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.moveTo(-width, 0);
    ctx.lineTo(width, 0);
    ctx.lineTo(0, -length);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  };

  const maxSpike = center * 0.96;
  // Four faint diagonal spikes (secondary flare).
  for (let i = 0; i < 4; i += 1) {
    drawSpike(Math.PI / 4 + (i * Math.PI) / 2, maxSpike * 0.5, 1.1, 0.3);
  }
  // Four primary spikes: up / right / down / left.
  for (let i = 0; i < 4; i += 1) {
    drawSpike((i * Math.PI) / 2, maxSpike, 1.7, 0.85);
  }
  // Bright central core glow.
  const core = ctx.createRadialGradient(
    center,
    center,
    0,
    center,
    center,
    size * 0.17
  );
  core.addColorStop(0, 'rgba(255, 255, 255, 1)');
  core.addColorStop(0.35, 'rgba(255, 255, 255, 0.7)');
  core.addColorStop(1, 'rgba(255, 255, 255, 0)');
  ctx.fillStyle = core;
  ctx.fillRect(0, 0, size, size);

  texture.needsUpdate = true;
  return texture;
}

function buildStarGeometry(count: number): BufferGeometry {
  const positions = new Float32Array(count * 3);
  const colors = new Float32Array(count * 3);
  const sizes = new Float32Array(count);
  const phases = new Float32Array(count);
  const speeds = new Float32Array(count);

  for (let i = 0; i < count; i += 1) {
    // Uniform direction on the unit sphere.
    const u = Math.random() * 2 - 1;
    const theta = Math.random() * Math.PI * 2;
    const r = Math.sqrt(1 - u * u);
    const radius = STAR_INNER + Math.random() * (STAR_OUTER - STAR_INNER);
    positions[i * 3] = r * Math.cos(theta) * radius;
    positions[i * 3 + 1] = u * radius;
    positions[i * 3 + 2] = r * Math.sin(theta) * radius;

    // Distance falloff keeps far stars smaller for a sense of depth.
    const depth = 1 - (radius - STAR_INNER) / (STAR_OUTER - STAR_INNER);
    const colorIndex = Math.floor(Math.random() * STAR_PALETTE.length);
    const color = STAR_PALETTE[colorIndex];
    colors[i * 3] = color.r;
    colors[i * 3 + 1] = color.g;
    colors[i * 3 + 2] = color.b;

    // White stars (palette indices 0-1) are the bold, spiky "feature" stars;
    // the coloured accents stay smaller and subtler.
    const isWhite = colorIndex < 2;
    const base = isWhite
      ? 380 + Math.random() * 460
      : 150 + Math.random() * 210;
    sizes[i] = base * (0.7 + depth * 0.6);
    phases[i] = Math.random() * Math.PI * 2;
    speeds[i] = 0.6 + Math.random() * 2.2;
  }

  const geometry = new BufferGeometry();
  geometry.setAttribute('position', new Float32BufferAttribute(positions, 3));
  geometry.setAttribute('aColor', new Float32BufferAttribute(colors, 3));
  geometry.setAttribute('aSize', new Float32BufferAttribute(sizes, 1));
  geometry.setAttribute('aPhase', new Float32BufferAttribute(phases, 1));
  geometry.setAttribute('aSpeed', new Float32BufferAttribute(speeds, 1));
  return geometry;
}

const STAR_VERTEX_SHADER = /* glsl */ `
  attribute vec3 aColor;
  attribute float aSize;
  attribute float aPhase;
  attribute float aSpeed;
  uniform float uTime;
  uniform float uTwinkleAmp;
  varying vec3 vColor;

  void main() {
    vColor = aColor;
    float twinkle = 1.0 + sin(uTime * aSpeed + aPhase) * uTwinkleAmp;
    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
    gl_PointSize = (aSize * twinkle) / -mvPosition.z;
    gl_Position = projectionMatrix * mvPosition;
  }
`;

const STAR_FRAGMENT_SHADER = /* glsl */ `
  uniform sampler2D uTexture;
  varying vec3 vColor;

  void main() {
    vec4 sprite = texture2D(uTexture, gl_PointCoord);
    gl_FragColor = vec4(vColor * sprite.rgb, sprite.a);
  }
`;

type StarfieldProps = {
  isActive: boolean;
  calmMotion: boolean;
};

function Starfield({
  isActive,
  calmMotion,
}: StarfieldProps): React.ReactElement {
  const pointsRef = useRef<Points>(null);
  const materialRef = useRef<ShaderMaterial | null>(null);
  const texture = useMemo<Texture>(() => createStarTexture(), []);
  const geometry = useMemo(
    () => buildStarGeometry(calmMotion ? STAR_COUNT_CALM : STAR_COUNT),
    [calmMotion]
  );
  const material = useMemo(() => {
    return new ShaderMaterial({
      uniforms: {
        uTime: { value: 0 },
        uTexture: { value: texture },
        uTwinkleAmp: { value: calmMotion ? 0.22 : 0.42 },
      },
      vertexShader: STAR_VERTEX_SHADER,
      fragmentShader: STAR_FRAGMENT_SHADER,
      transparent: true,
      depthWrite: false,
      blending: AdditiveBlending,
    });
  }, [texture, calmMotion]);

  useEffect(() => {
    materialRef.current = material;
    return () => {
      materialRef.current = null;
    };
  }, [material]);

  useEffect(() => () => geometry.dispose(), [geometry]);
  useEffect(() => () => material.dispose(), [material]);
  useEffect(() => () => texture.dispose(), [texture]);

  useFrame((state) => {
    if (!isActive) {
      return;
    }
    const starMaterial = materialRef.current;
    if (starMaterial) {
      starMaterial.uniforms.uTime.value = state.clock.elapsedTime;
    }
  });

  return (
    <points
      ref={pointsRef}
      geometry={geometry}
      material={material}
      frustumCulled={false}
    />
  );
}

type NebulaDomeProps = { mode: Mode };

function NebulaDome({ mode }: NebulaDomeProps): React.ReactElement {
  const gltf = useLoader(GLTFLoader, MODEL_PATH);
  const model = useMemo(() => gltf.scene.clone(true), [gltf.scene]);

  useEffect(() => {
    model.traverse((child) => {
      if (!(child instanceof Mesh)) {
        return;
      }
      const material = child.material;
      if (!(material instanceof MeshStandardMaterial)) {
        return;
      }
      if (material.name === 'Nebula') {
        material.emissive.copy(NEBULA_EMISSIVE[mode]);
        material.emissiveIntensity = NEBULA_EMISSIVE_INTENSITY[mode];
        material.color.copy(NEBULA_BASE[mode]);
        material.toneMapped = false;
        material.needsUpdate = true;
      }
    });
  }, [model, mode]);

  return <primitive object={model} />;
}

type SceneProps = {
  isActive: boolean;
  calmMotion: boolean;
  mode: Mode;
};

function CosmicScene({
  isActive,
  calmMotion,
  mode,
}: SceneProps): React.ReactElement {
  const groupRef = useRef<Group>(null);
  const pointer = useRef({ x: 0, y: 0 });
  const driftSpeed = calmMotion ? 0.006 : 0.014;

  useFrame((state, delta) => {
    const group = groupRef.current;
    if (!group) {
      return;
    }
    // Continuous, very slow drift gives the cosmos life even when idle.
    if (isActive) {
      group.rotation.y += delta * driftSpeed;
    }
    // Gentle pointer parallax layered on top of the drift.
    pointer.current.x = state.pointer.x;
    pointer.current.y = state.pointer.y;
    const targetX = pointer.current.y * -0.05;
    const targetZ = pointer.current.x * 0.04;
    const lerp = Math.min(delta * 2, 1);
    group.rotation.x += (targetX - group.rotation.x) * lerp;
    group.rotation.z += (targetZ - group.rotation.z) * lerp;
  });

  return (
    <group ref={groupRef}>
      <Suspense fallback={null}>
        <NebulaDome mode={mode} />
      </Suspense>
      <Starfield isActive={isActive} calmMotion={calmMotion} />
    </group>
  );
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

export type CosmicScene3DProps = {
  isActive: boolean;
  reducedMotion: boolean;
  calmMotion: boolean;
  mode: Mode;
};

function CosmicScene3D({
  isActive,
  reducedMotion,
  calmMotion,
  mode,
}: CosmicScene3DProps): React.ReactElement {
  const animating = isActive && !reducedMotion;

  return (
    <div className="cosmic-scene3d-stage" aria-hidden="true">
      <Canvas
        className="cosmic-scene3d-canvas"
        flat
        dpr={[1, 1.75]}
        camera={{ position: CAMERA_POSITION, fov: 70, near: 0.1, far: 120 }}
        gl={{
          alpha: true,
          antialias: true,
          powerPreference: 'high-performance',
        }}
        frameloop={animating ? 'always' : 'demand'}
      >
        <CameraRig />
        <ambientLight intensity={AMBIENT_INTENSITY[mode]} />
        <Suspense fallback={null}>
          <CosmicScene
            isActive={animating}
            calmMotion={calmMotion}
            mode={mode}
          />
        </Suspense>
      </Canvas>
    </div>
  );
}

export default CosmicScene3D;
