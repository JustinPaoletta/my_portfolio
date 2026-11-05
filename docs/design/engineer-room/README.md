# Engineer hero design

The homepage engineer theme depicts the inside of a motherboard enclosure.
Its low camera, PCB floor, fin stacks, memory banks, chips, and three fans
follow the [concept image](renders/room-concept.jpg).

## Maintained implementation

- [Scene geometry](../../../src/components/sections/Hero/EngineerCircuit3D/roomGeometry.ts) constructs the components procedurally.
- [Renderer](../../../src/components/sections/Hero/EngineerCircuit3D/index.tsx) controls motion, readiness, and lifecycle.
- [Renderer policy](../../../src/components/sections/Hero/EngineerCircuit3D/rendererPolicy.ts) handles software graphics drivers.
- [Geometry tests](../../../src/components/sections/Hero/EngineerCircuit3D/roomGeometry.test.ts) check scene structure.
- [Renderer tests](../../../src/components/sections/Hero/EngineerCircuit3D/rendererPolicy.test.ts) check driver classification.
- [Browser journeys](../../../e2e/theme-cli.spec.ts) exercise theme transitions and fallback behavior.
- [Poster capture script](../../../scripts/capture-hero-posters.ts) generates deterministic stills.

The scene uses shared materials and merged or instanced geometry.
It requires no component model or texture downloads and caps rendering DPR at 1.5.
Animation pauses while hidden or inactive. Calm mode slows motion.
Reduced motion and constrained connections use the matching poster.

## Historical evidence

Earlier local captures recorded 11 draw calls and 16,164 triangles.
The later integrated capture recorded 12 draw calls and 16,314 triangles.
These are dated measurements, not a current hardware performance guarantee.
Both Darwin and Linux visual baselines are tracked in the repository.

Local prototype code, plans, prop references, and validation records remain
ignored working evidence. They are not application dependencies.
The prototype and generic room validator do not establish production readiness.
The implementation uses local procedural geometry instead of paid mesh services.

Physical-phone GPU performance was not established by those browser captures.
Use the [custom contract](CUSTOM_CONTRACT.md) for design constraints and
[visual regression guide](../../VISUAL_REGRESSION.md) for current checks.
