# Cosmic hero astronaut

Documentation inspected against the scripts, manifest, and delivered assets on 2026-11-05.
Stored Blender/WebGL acceptance results retain their original scope; this inspection did not rerun those sessions.

The authoritative source is `cosmic-astronaut.blend`, last inspected with Blender 5.1.2. Open it to
edit the geometry, materials, or armature animation. The pre-production source
is preserved in `checkpoints/cosmic-astronaut-pre-production.blend`.

The asset has a rounded helmet shell with an oval visor aperture.
Its mounted PLSS backpack has service panels and a sealed corrugated air tube.
The chest pack carries an embroidered American flag with 13 stripes and 50 stars.

The hero view is angled slightly toward the screen. The
left pressure sleeve is a continuous deforming mesh. Its three-bone armature
moves the glove onto the lap, matching the existing right hand's mirrored pose.
The original body, legs, resting hand, and asteroid geometry were preserved.

The scene uses Z-up, -Y forward, and meters. The armature has an identity world
transform; keyed pose matrices are converted to armature space. The lap and
elbow empties are authoring references. The clip itself contains sampled FK
keys and needs no runtime IK, constraints, or drivers. The rest of the body is
rigid for this seated hero pose; this is not a full locomotion character rig.

`WaveThenRest` is 20 fps. The glove waves for 3 seconds, lowers onto the lap over
1 second, then holds the pose. The GLB starts at time zero and lasts 4.75 seconds.
The encoder consumes 96 frame inputs over 4.8 seconds.
The current WebP contains 81 encoded frames, with an 800 ms final hold; repeated hold frames are merged.

Hero floating motion is CSS-owned. Reduced
motion, visual tests, and limited connections use the still image.

## Delivery

- `public/images/hero/cosmic/astronaut-wave.webp`: transparent hero animation.
- `public/images/hero/cosmic/astronaut-asteroid.webp`: transparent still fallback.
- `public/models/hero/cosmic-astronaut.glb`: optimized skin, clip, and five embedded
  PBR images. Procedural suit and rock color/normal shaders are baked for reuse.
- `textures/`: badge image and derived runtime suit/rock atlases. The source badge
  is packed in the editable scene; the runtime images are embedded in the GLB.
- `cosmic-astronaut-manifest.json`: versions, hashes, sizes, and verified limits.

The hero does not download the GLB. It uses the lightweight rendered animation,
which retains the authored lighting and fabric details. Image URLs are generated
with content hashes so existing service-worker caches receive new releases.

## Rebuild from the saved source

Install the repository dependencies and use a Blender executable compatible with the saved scene.
The recorded tool version is Blender 5.1.2.
From the repository root:

```sh
blender --background --factory-startup --python-exit-code 1 --python scripts/blender/release_cosmic_astronaut.py -- --render
node scripts/blender/encode_cosmic_wave.mjs
blender --background --factory-startup --python-exit-code 1 --python scripts/blender/release_cosmic_astronaut.py
python3 scripts/blender/validate_cosmic_glb.py
```

Rendering and GLB export both open the saved source. Neither step runs the historical asset generator.
The render step writes review images and 96 frame inputs. The encoder writes the two public WebPs and their content-hash constants.
The export step writes the reusable GLB and runtime texture atlases. The validator writes a generated check report.

These commands do not refresh the committed manifest or historical verification summary; inspect their hashes after changing a delivery asset.

`refine_cosmic_astronaut.py` reproduces this production pass
from the immutable pre-production checkpoint; it overwrites the working source
and is only for deliberately reproducing the original production refinement.
The subsequent `refine_cosmic_chest_pack.py` edit works on the current saved
source and preserves all other meshes and all 96 arm poses. Its checkpoint is
`checkpoints/cosmic-astronaut-before-chest-pack.blend`. The historical
`create_cosmic_astronaut.py` generator is guarded against overwriting the current
source unless `--legacy-regeneration` is explicitly supplied.

## Checks and scope

The stored hash-bound summary is `verification.json`.
It records source-to-WebGL wrist parity at all 96 frame times within 0.00001 m.
It also records review of intermediate poses and desktop/emulated-phone layouts.
These are historical acceptance observations, not new results from a documentation inspection.

Generated working evidence stays in the ignored
`output/playwright/cosmic-astronaut/` and `output/playwright/professional-review/`
folders. Run `npm run start:dev` and open `/scripts/blender/viewer.html` to play or scrub
the GLB independently. The model is supplied for reuse; the portfolio hero
loads the rendered astronaut WebP assets. The separate cosmic nebula/starfield still uses its own WebGL scene.

The intended delivery is a single cosmic portfolio hero. Checks cover the
Blender source, skin and timing in a Three.js WebGL viewer, desktop and emulated
phone layouts, once-only image playback, and reduced motion. Native mobile
GPU performance and other game-engine importers have not been measured.

Blender's [armature-space documentation](https://developer.blender.org/docs/features/animation/armatures/)
provides the transform convention used by the source checks.
