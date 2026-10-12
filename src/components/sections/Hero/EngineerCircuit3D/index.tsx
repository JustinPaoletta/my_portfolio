import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { isPosterCaptureMode } from '@/utils/heroPoster';
import PosterFrameSync from '@/components/sections/Hero/PosterFrameSync';
import { createEngineerRoom, ROOM_CAMERA, type RoomMode } from './roomGeometry';
import { usesSoftwareRasterizer } from './rendererPolicy';
import './EngineerCircuit3D.css';

function useDocumentVisible(): boolean {
  const [visible, setVisible] = useState(
    () => typeof document === 'undefined' || !document.hidden
  );
  useEffect(() => {
    const update = () => setVisible(!document.hidden);
    document.addEventListener('visibilitychange', update);
    return () => document.removeEventListener('visibilitychange', update);
  }, []);
  return visible;
}

function RoomScene({
  mode,
  speed,
  onSceneReady,
}: {
  mode: RoomMode;
  speed: number;
  onSceneReady?: () => void;
}): null {
  const { scene, camera, invalidate, gl } = useThree();
  const roomRef = useRef<ReturnType<typeof createEngineerRoom> | null>(null);
  const time = useRef(0),
    frames = useRef(0),
    ready = useRef(false);
  const capture = isPosterCaptureMode();
  useLayoutEffect(() => {
    const room = createEngineerRoom(mode);
    roomRef.current = room;
    scene.add(room.root);
    // Fixed vertical FOV preserves poster/canvas parity across portrait and landscape.
    camera.position.set(...ROOM_CAMERA.position);
    camera.lookAt(...ROOM_CAMERA.target);
    camera.updateProjectionMatrix();
    time.current = 0;
    frames.current = 0;
    invalidate();
    return () => {
      scene.remove(room.root);
      room.dispose();
      roomRef.current = null;
    };
  }, [scene, camera, mode, invalidate]);
  useFrame((_, delta) => {
    if (!roomRef.current) return;
    if (!capture) time.current += Math.min(delta, 0.05) * speed;
    roomRef.current.animate(time.current);
    frames.current += 1;
    if (frames.current < 4) invalidate();
    if (frames.current >= 4 && !ready.current) {
      ready.current = true;
      requestAnimationFrame(() => onSceneReady?.());
    }
    if (import.meta.env.DEV) {
      // Review metadata is written to the existing decorative canvas, never to product UI.
      gl.domElement.setAttribute(
        'data-room-draw-calls',
        String(gl.info.render.calls)
      );
      gl.domElement.setAttribute(
        'data-room-triangles',
        String(gl.info.render.triangles)
      );
      gl.domElement.setAttribute('data-room-time', String(time.current));
    }
  });
  return null;
}

export type EngineerCircuit3DProps = {
  isActive: boolean;
  reducedMotion: boolean;
  calmMotion: boolean;
  mode: RoomMode;
  onSceneReady?: () => void;
  onCanvasFrame?: (canvas: HTMLCanvasElement) => void;
  syncPoster?: boolean;
};
function EngineerCircuit3D({
  isActive,
  reducedMotion,
  calmMotion,
  mode,
  onSceneReady,
  onCanvasFrame,
  syncPoster = false,
}: EngineerCircuit3DProps): React.ReactElement {
  const visible = useDocumentVisible();
  const [softwareRenderer, setSoftwareRenderer] = useState(false);
  const active = isActive && visible && !reducedMotion && !softwareRenderer;
  const speed = active ? (calmMotion ? 0.45 : 1) : 0;
  const capture = isPosterCaptureMode();
  return (
    <div
      className="engineer-circuit3d-stage"
      aria-hidden="true"
      data-room-renderer={softwareRenderer ? 'software' : 'gpu'}
    >
      <Canvas
        className="engineer-circuit3d-canvas"
        dpr={[1, 1.5]}
        camera={{
          position: ROOM_CAMERA.position,
          fov: ROOM_CAMERA.fov,
          near: 0.1,
          far: 40,
        }}
        gl={{
          alpha: false,
          antialias: true,
          powerPreference: 'low-power',
          preserveDrawingBuffer: capture || syncPoster,
        }}
        onCreated={({ gl }) =>
          setSoftwareRenderer(usesSoftwareRasterizer(gl.getContext()))
        }
        frameloop={
          visible && ((active && !capture) || syncPoster) ? 'always' : 'demand'
        }
      >
        <color
          attach="background"
          args={[mode === 'dark' ? '#091c24' : '#8faeae']}
        />
        <hemisphereLight
          args={[
            mode === 'dark' ? '#a2d6df' : '#edfaff',
            '#183b25',
            mode === 'dark' ? 2 : 2.8,
          ]}
        />
        <directionalLight
          position={[-3, 4.8, 4]}
          intensity={3.5}
          color="#fff1d6"
        />
        <directionalLight
          position={[0, 6, 12]}
          intensity={1.7}
          color="#ffffff"
        />
        <pointLight
          position={[3, 4, -6]}
          intensity={30}
          distance={12}
          decay={2}
          color="#32d9ef"
        />
        <pointLight
          position={[3, 4, 0]}
          intensity={30}
          distance={12}
          decay={2}
          color="#32d9ef"
        />
        <RoomScene mode={mode} speed={speed} onSceneReady={onSceneReady} />
        <PosterFrameSync
          enabled={syncPoster && Boolean(onCanvasFrame)}
          onCanvasFrame={onCanvasFrame ?? (() => {})}
        />
      </Canvas>
    </div>
  );
}
export default EngineerCircuit3D;
