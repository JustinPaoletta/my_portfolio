"""Localized chest-pack and hero-view edit of the saved astronaut source.

Run with Blender --background --factory-startup --python-exit-code 1 --python.
Preserves the current artist scene and the wave-to-lap action.
"""
import hashlib
import json
import shutil
import struct
from pathlib import Path

import bpy
from mathutils import Vector

ROOT = Path(__file__).resolve().parents[2]
SOURCE = ROOT / 'assets/blender/cosmic-astronaut.blend'
CHECKPOINT = ROOT / 'assets/blender/checkpoints/cosmic-astronaut-before-chest-pack.blend'
OUT = ROOT / 'output/playwright/cosmic-astronaut/production'
if not CHECKPOINT.exists():
    shutil.copyfile(SOURCE, CHECKPOINT)
input_hash = hashlib.sha256(SOURCE.read_bytes()).hexdigest()
bpy.ops.wm.open_mainfile(filepath=str(SOURCE))
scene = bpy.context.scene
scene.frame_set(1)
edited = {
    'Chest console gasket', 'Chest console shell', 'Apollo chest control face',
    'Chest control toggle', 'Chest control toggle.001',
    'Chest sewn American flag badge', 'Flag badge stitched border',
}


def mesh_hashes():
    return {
        o.name: hashlib.sha256(b''.join(struct.pack('<3f', *v.co)
                                      for v in o.data.vertices)).hexdigest()
        for o in bpy.data.objects if o.type == 'MESH' and o.name not in edited
    }


def arm_samples():
    rig = bpy.data.objects['Cosmic explorer arm rig']
    samples = []
    for frame in range(1, 97):
        scene.frame_set(frame)
        samples.append([list(row) for bone in rig.pose.bones for row in bone.matrix])
    return samples


preserved_meshes = mesh_hashes()
preserved_motion = arm_samples()
scene.frame_set(1)


def resize(name, location, dimensions):
    obj = bpy.data.objects[name]
    obj.location = location
    obj.dimensions = dimensions
    bpy.context.view_layer.update()
    bpy.ops.object.select_all(action='DESELECT')
    obj.select_set(True)
    bpy.context.view_layer.objects.active = obj
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)


# All positions are Blender Z-up world meters; the body parent is identity.
# The flange overlaps the cloth, and the enamel case overlaps the flange.
resize('Chest console gasket', (0, -.376, 1.535), (.60, .16, .44))
resize('Chest console shell', (0, -.460, 1.535), (.55, .09, .39))
resize('Apollo chest control face', (0, -.512, 1.418), (.34, .014, .054))
for name, x in [('Chest control toggle', -.095), ('Chest control toggle.001', .095)]:
    resize(name, (x, -.529, 1.418), (.035, .025, .033))

# Keep the packed embroidered image and its UVs. Flatten the old cloth decal
# onto the front of the case, rather than leaving a second flag on the torso.
badge = bpy.data.objects['Chest sewn American flag badge']
cols, rows = 24, 12
assert len(badge.data.vertices) == (cols + 1) * (rows + 1)
width, height = .355, .355 / 1.9
center_z, face_y = 1.595, -.506
inverse = badge.matrix_world.inverted()
for row in range(rows + 1):
    for col in range(cols + 1):
        badge.data.vertices[row * (cols + 1) + col].co = inverse @ Vector((
            (col / cols - .5) * width, face_y, center_z + (row / rows - .5) * height
        ))
badge.data.update()

border = bpy.data.objects['Flag badge stitched border']
outline = []
for i in range(cols + 1):
    outline.append(((i / cols - .5) * width, center_z - height / 2))
for i in range(1, rows + 1):
    outline.append((width / 2, center_z + (i / rows - .5) * height))
for i in range(1, cols + 1):
    outline.append((width / 2 - i / cols * width, center_z + height / 2))
for i in range(1, rows):
    outline.append((-width / 2, center_z + height / 2 - i / rows * height))
assert len(border.data.splines[0].points) == len(outline)
inverse = border.matrix_world.inverted()
for p, (x, z) in zip(border.data.splines[0].points, outline):
    p.co = (*(inverse @ Vector((x, -.508, z))), 1)

camera = bpy.data.objects['Hero portrait camera']
camera.location = (1.35, -8, 3.8)
camera.rotation_euler = (Vector((-.1, -.1, 1.17)) - camera.location).to_track_quat('-Z', 'Y').to_euler()

assert mesh_hashes() == preserved_meshes, 'An unrelated mesh changed'
assert arm_samples() == preserved_motion, 'The wave-to-lap pose changed'
scene.frame_set(1)
bpy.ops.wm.save_as_mainfile(filepath=str(SOURCE))
report = {
    'input_sha256': input_hash,
    'source_sha256': hashlib.sha256(SOURCE.read_bytes()).hexdigest(),
    'blender': bpy.app.version_string,
    'preserved_mesh_count': len(preserved_meshes),
    'arm_pose_frames_unchanged': 96,
    'chest_shell_dimensions_m': [.55, .09, .39],
    'flag_surface': 'Chest console shell front face',
    'flag_width_m': width,
    'hero_camera_location': list(camera.location),
}
(OUT / 'chest-pack-checks.json').write_text(json.dumps(report, indent=2) + '\n')
print(json.dumps(report), flush=True)

# Local review of the requested appearance and the final lap pose.
scene.render.engine = 'CYCLES'
scene.render.resolution_x = 900
scene.render.resolution_y = 1000
scene.render.resolution_percentage = 100
scene.render.image_settings.file_format = 'PNG'
scene.cycles.samples = 32
scene.cycles.use_denoising = True
for frame, name in [(1, 'chest-pack-wave.png'), (81, 'chest-pack-lap.png')]:
    scene.frame_set(frame)
    scene.render.filepath = str(OUT / name)
    bpy.ops.render.render(write_still=True)
