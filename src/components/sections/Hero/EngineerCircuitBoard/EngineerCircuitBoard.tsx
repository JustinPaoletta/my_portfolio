import './EngineerCircuitBoard.css';

/**
 * Realistic PCB-style hero background.
 *
 * Modeled after the well-known dual-layer SVG trace technique (a dark copper
 * "wire" path with a bright neon overlay animated via stroke-dasharray /
 * stroke-dashoffset), so glowing packets of data appear to travel along the
 * traces into a central processor. The board itself is completely static — only
 * the light pulses move. Reference: FreeFrontend "Animated CPU Circuit Loader"
 * and the "Glow Circuit PCB" SVG examples.
 */

const VIEW_W = 1200;
const VIEW_H = 760;

type Point = [number, number];

type Trace = {
  points: Point[];
  variant: 'cyan' | 'green';
  dur: number;
  delay: number;
};

// Orthogonal (Manhattan) routes fanning out from the central CPU to the board
// edges and to the surface-mounted components.
const TRACES: Trace[] = [
  // Left side
  {
    points: [
      [500, 320],
      [360, 320],
      [360, 182],
      [150, 182],
    ],
    variant: 'cyan',
    dur: 3.1,
    delay: 0,
  },
  {
    points: [
      [500, 358],
      [300, 358],
      [300, 300],
      [96, 300],
    ],
    variant: 'green',
    dur: 3.8,
    delay: 0.6,
  },
  {
    points: [
      [500, 408],
      [262, 408],
      [262, 520],
      [104, 520],
    ],
    variant: 'cyan',
    dur: 4.2,
    delay: 1.1,
  },
  {
    points: [
      [500, 446],
      [340, 446],
      [340, 620],
      [186, 620],
    ],
    variant: 'green',
    dur: 3.5,
    delay: 0.3,
  },
  // Right side
  {
    points: [
      [700, 320],
      [858, 320],
      [858, 172],
      [1070, 172],
    ],
    variant: 'green',
    dur: 3.3,
    delay: 0.9,
  },
  {
    points: [
      [700, 358],
      [820, 358],
      [820, 300],
      [1096, 300],
    ],
    variant: 'cyan',
    dur: 4.0,
    delay: 0.2,
  },
  {
    points: [
      [700, 408],
      [900, 408],
      [900, 520],
      [1092, 520],
    ],
    variant: 'green',
    dur: 3.6,
    delay: 1.3,
  },
  {
    points: [
      [700, 446],
      [840, 446],
      [840, 610],
      [1006, 610],
    ],
    variant: 'cyan',
    dur: 4.4,
    delay: 0.5,
  },
  // Top side
  {
    points: [
      [560, 290],
      [560, 202],
      [424, 202],
      [424, 96],
    ],
    variant: 'cyan',
    dur: 3.9,
    delay: 0.75,
  },
  {
    points: [
      [640, 290],
      [640, 162],
      [780, 162],
      [780, 86],
    ],
    variant: 'green',
    dur: 3.4,
    delay: 1.5,
  },
  // Bottom side
  {
    points: [
      [560, 470],
      [560, 560],
      [444, 560],
      [444, 690],
    ],
    variant: 'green',
    dur: 4.1,
    delay: 0.4,
  },
  {
    points: [
      [640, 470],
      [640, 600],
      [760, 600],
      [760, 700],
    ],
    variant: 'cyan',
    dur: 3.2,
    delay: 1.0,
  },
  // Long horizontal buses
  {
    points: [
      [120, 120],
      [1080, 120],
    ],
    variant: 'cyan',
    dur: 6.0,
    delay: 0,
  },
  {
    points: [
      [120, 680],
      [1080, 680],
    ],
    variant: 'green',
    dur: 6.4,
    delay: 1.2,
  },
];

// Surface-mounted components (ICs / capacitors) sitting at the trace endpoints.
const COMPONENTS: {
  x: number;
  y: number;
  w: number;
  h: number;
  pads: number;
}[] = [
  { x: 96, y: 150, w: 96, h: 64, pads: 4 },
  { x: 44, y: 278, w: 72, h: 44, pads: 3 },
  { x: 60, y: 494, w: 66, h: 52, pads: 3 },
  { x: 142, y: 598, w: 74, h: 44, pads: 3 },
  { x: 1024, y: 140, w: 96, h: 64, pads: 4 },
  { x: 1060, y: 278, w: 72, h: 44, pads: 3 },
  { x: 1048, y: 494, w: 82, h: 52, pads: 3 },
  { x: 968, y: 588, w: 80, h: 44, pads: 3 },
  { x: 382, y: 62, w: 84, h: 50, pads: 4 },
  { x: 740, y: 50, w: 82, h: 50, pads: 4 },
  { x: 402, y: 660, w: 84, h: 48, pads: 4 },
  { x: 720, y: 668, w: 82, h: 46, pads: 4 },
];

const CPU = { x: 500, y: 290, w: 200, h: 180 };
const CPU_DIE = { x: 524, y: 314, w: 152, h: 132 };

function toPath(points: Point[]): string {
  return points
    .map((point, index) => `${index === 0 ? 'M' : 'L'} ${point[0]} ${point[1]}`)
    .join(' ');
}

function buildCpuPads(): Point[] {
  const pads: Point[] = [];
  const cols = 7;
  const rows = 6;
  const gapX = CPU_DIE.w / (cols + 1);
  const gapY = CPU_DIE.h / (rows + 1);
  for (let c = 1; c <= cols; c += 1) {
    for (let r = 1; r <= rows; r += 1) {
      pads.push([CPU_DIE.x + gapX * c, CPU_DIE.y + gapY * r]);
    }
  }
  return pads;
}

function buildComponentPads(): Point[] {
  const pads: Point[] = [];
  for (const comp of COMPONENTS) {
    const step = comp.w / (comp.pads + 1);
    for (let i = 1; i <= comp.pads; i += 1) {
      pads.push([comp.x + step * i, comp.y]);
      pads.push([comp.x + step * i, comp.y + comp.h]);
    }
  }
  return pads;
}

const CPU_PADS = buildCpuPads();
const COMPONENT_PADS = buildComponentPads();

export type EngineerCircuitBoardProps = {
  isActive: boolean;
  frozen: boolean;
  calmMotion: boolean;
};

function EngineerCircuitBoard({
  isActive,
  frozen,
  calmMotion,
}: EngineerCircuitBoardProps): React.ReactElement {
  return (
    <svg
      className="engineer-circuit"
      viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
      preserveAspectRatio="xMidYMid slice"
      role="presentation"
      aria-hidden="true"
      focusable="false"
      data-active={isActive ? 'true' : 'false'}
      data-static={frozen ? 'true' : 'false'}
      style={{ '--flow-scale': calmMotion ? 1.85 : 1 } as React.CSSProperties}
    >
      <defs>
        <linearGradient id="circuit-die" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="var(--circuit-die-1)" />
          <stop offset="100%" stopColor="var(--circuit-die-2)" />
        </linearGradient>
        <filter id="circuit-glow" x="-40%" y="-40%" width="180%" height="180%">
          <feGaussianBlur stdDeviation="3.4" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* Base copper layer (static wiring) */}
      <g className="circuit-base">
        {TRACES.map((trace, index) => (
          <path key={`base-${index}`} d={toPath(trace.points)} />
        ))}
      </g>

      {/* Surface-mounted components */}
      <g className="circuit-components">
        {COMPONENTS.map((comp, index) => (
          <g key={`comp-${index}`}>
            <rect
              x={comp.x}
              y={comp.y}
              width={comp.w}
              height={comp.h}
              rx="6"
              className="circuit-chip"
            />
            <rect
              x={comp.x + 6}
              y={comp.y + 6}
              width={comp.w - 12}
              height={comp.h - 12}
              rx="4"
              className="circuit-chip-inner"
            />
          </g>
        ))}
      </g>

      {/* Solder pads / vias */}
      <g className="circuit-pads">
        {COMPONENT_PADS.map((pad, index) => (
          <rect
            key={`pad-${index}`}
            x={pad[0] - 3}
            y={pad[1] - 3}
            width="6"
            height="6"
            rx="1"
          />
        ))}
      </g>

      {/* Animated data packets travelling along the wiring */}
      <g className="circuit-flow-layer">
        {TRACES.map((trace, index) => (
          <path
            key={`flow-${index}`}
            d={toPath(trace.points)}
            className={`trace-flow trace-flow--${trace.variant}`}
            style={
              {
                '--dur': `${trace.dur}s`,
                '--delay': `${trace.delay}s`,
              } as React.CSSProperties
            }
          />
        ))}
      </g>

      {/* Glowing nodes at trace endpoints */}
      <g className="circuit-nodes">
        {TRACES.map((trace, index) => {
          const end = trace.points[trace.points.length - 1];
          return (
            <circle
              key={`node-${index}`}
              cx={end[0]}
              cy={end[1]}
              r="4.5"
              style={{ '--delay': `${trace.delay}s` } as React.CSSProperties}
            />
          );
        })}
      </g>

      {/* Central processor */}
      <g className="circuit-cpu">
        <rect
          x={CPU.x}
          y={CPU.y}
          width={CPU.w}
          height={CPU.h}
          rx="14"
          className="cpu-socket"
        />
        <rect
          x={CPU_DIE.x}
          y={CPU_DIE.y}
          width={CPU_DIE.w}
          height={CPU_DIE.h}
          rx="8"
          className="cpu-die"
          fill="url(#circuit-die)"
        />
        <g className="cpu-pads">
          {CPU_PADS.map((pad, index) => (
            <rect
              key={`cpu-pad-${index}`}
              x={pad[0] - 3}
              y={pad[1] - 3}
              width="6"
              height="6"
              rx="1"
            />
          ))}
        </g>
        <circle
          cx={CPU.x + CPU.w / 2}
          cy={CPU.y + CPU.h / 2}
          r="22"
          className="cpu-core"
        />
        <polygon
          points={`${CPU_DIE.x + 12},${CPU_DIE.y + 8} ${CPU_DIE.x + 26},${CPU_DIE.y + 8} ${CPU_DIE.x + 12},${CPU_DIE.y + 22}`}
          className="cpu-notch"
        />
      </g>
    </svg>
  );
}

export default EngineerCircuitBoard;
