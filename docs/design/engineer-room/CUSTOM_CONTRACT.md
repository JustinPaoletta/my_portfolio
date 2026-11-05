# Engineer hero design contract

The hero is a decorative view inside a motherboard enclosure.
Accessible HTML copy and portfolio navigation remain authoritative.
The scene has no player, traversal, orbit controls, or collision gameplay.

## Composition

Use the [concept](renders/room-concept.jpg) as visual direction.
Keep the low camera, strong depth, green PCB floor, and memory banks.
Use silver fin stacks, black chips, gold hardware, and three back-wall fans.
Keep the center clear for copy. Side dressing is asymmetric.
Cables must terminate at visible sockets with seated connectors.

## Motion and fallback

Animate fan rotors and restrained cyan or amber indicators.
Keep normal scene lighting stable. Avoid full-scene strobes.
Pause rendering when the hero is inactive or the document is hidden.
Calm mode slows motion. Reduced motion uses a matching still.

Camera parallax is absent during reduced motion and deterministic captures.

Keep lazy loading, the poster reveal, and the error boundary.
Use the same fixed vertical camera FOV for runtime and poster captures.
Both color modes and desktop, phone, and landscape framing need inspection.

## Implementation targets

Use procedural geometry in the existing Three.js runtime.
No paid mesh service or third-party model download is required.
Share geometry and materials. Prefer instancing for repeated indicators.

Design budgets are at most 50,000 triangles, 150 draw calls, and DPR 1.5.
The mobile target is 30 fps; physical-device measurement remains necessary.
Targets are acceptance conditions, not evidence that every device meets them.

Production checks cover readable copy and controls, scene readiness,
error fallback, motion settings, framing, and measured performance.
Local browser emulation does not replace physical-device acceptance.
