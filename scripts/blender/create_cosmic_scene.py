"""Generate the cosmic hero's 3D nebula dome GLB (and a still poster).

This is the cosmic-theme counterpart of the engineer circuit-board pipeline
(`scripts/blender/create_circuit_board.py`). A glTF file cannot carry Blender's
procedural shader graphs, so the nebula art is authored as a node network, then
*baked* to an emissive image that is packed into the GLB. The React layer
(`CosmicScene3D`) loads the GLB, tints the named `Nebula` material per
dark/light cosmic palette, and adds a runtime-animated starfield on top.

Run headless:
    blender --background --python scripts/blender/create_cosmic_scene.py

Material is named so the web layer can recolor it per theme:
    Nebula
"""

import math
import os

import bpy
from mathutils import Vector

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.normpath(os.path.join(HERE, "..", ".."))

GLB_PATH = os.path.join(ROOT, "public", "models", "hero", "cosmic-scene.glb")
POSTER_PATH = os.path.join(
    ROOT, "public", "images", "hero", "cosmic", "cosmos-poster.webp"
)

# Inward-facing sky dome. Large enough to fully enclose the R3F camera rig at
# the origin so the nebula reads as an infinite backdrop.
DOME_RADIUS = 50.0
DOME_SEGMENTS = 96
DOME_RINGS = 64

# Baked nebula texture resolution. 1k keeps the embedded GLB small while still
# resolving the soft cloud structure.
BAKE_SIZE = 1024

# Cosmic palette (linear-ish sRGB tuples, 0..1). Mirrors the CSS nebula tokens:
# base #0b0014, accents #c77dff / #f72585 / #4cc9f0.
PALETTE = {
    "void": (0.012, 0.0, 0.028),       # #0b0014 deep space base
    "violet_deep": (0.10, 0.02, 0.18),  # #2a0a3a inner cloud shadow
    "violet": (0.78, 0.49, 1.0),        # #c77dff nebula glow
    "magenta": (0.97, 0.14, 0.52),      # #f72585 hot core accent
    "cyan": (0.30, 0.79, 0.94),         # #4cc9f0 cool rim accent
    "spark": (1.0, 0.96, 1.0),          # bright cloud cores
}


def srgb_to_linear(channel: float) -> float:
    if channel <= 0.04045:
        return channel / 12.92
    return ((channel + 0.055) / 1.055) ** 2.4


def lin(rgb: tuple[float, float, float]) -> tuple[float, float, float, float]:
    """Convert an sRGB tuple to a linear RGBA value for Blender node inputs."""
    return (*(srgb_to_linear(c) for c in rgb), 1.0)


def clear_scene() -> None:
    bpy.ops.object.select_all(action="SELECT")
    bpy.ops.object.delete(use_global=False)
    for collection in (
        bpy.data.meshes,
        bpy.data.materials,
        bpy.data.images,
        bpy.data.cameras,
        bpy.data.lights,
    ):
        for block in list(collection):
            collection.remove(block)


def build_nebula_material() -> tuple[bpy.types.Material, bpy.types.Image]:
    """Procedural nebula plugged into emission, ready to bake to `bake_img`."""
    mat = bpy.data.materials.new(name="Nebula")
    mat.use_nodes = True
    tree = mat.node_tree
    nodes = tree.nodes
    links = tree.links
    nodes.clear()

    output = nodes.new("ShaderNodeOutputMaterial")
    output.location = (900, 0)
    bsdf = nodes.new("ShaderNodeBsdfPrincipled")
    bsdf.location = (560, 0)
    bsdf.inputs["Base Color"].default_value = lin(PALETTE["void"])
    bsdf.inputs["Metallic"].default_value = 0.0
    bsdf.inputs["Roughness"].default_value = 1.0
    links.new(bsdf.outputs["BSDF"], output.inputs["Surface"])

    # Generated coordinates (0..1 over the bounding box) keep the noise
    # frequency sane regardless of the dome's huge world-space radius.
    tex_coord = nodes.new("ShaderNodeTexCoord")
    tex_coord.location = (-1200, 0)
    mapping = nodes.new("ShaderNodeMapping")
    mapping.location = (-1020, 0)
    mapping.inputs["Location"].default_value = (3.1, 1.7, 0.4)
    links.new(tex_coord.outputs["Generated"], mapping.inputs["Vector"])

    # Domain warp: offset the sampling coords by a low-frequency noise so the
    # clouds swirl into organic filaments instead of reading as uniform blobs.
    warp = nodes.new("ShaderNodeTexNoise")
    warp.location = (-820, 260)
    warp.inputs["Scale"].default_value = 1.3
    warp.inputs["Detail"].default_value = 2.0
    warp.inputs["Roughness"].default_value = 0.5
    links.new(mapping.outputs["Vector"], warp.inputs["Vector"])

    warp_scale = nodes.new("ShaderNodeVectorMath")
    warp_scale.location = (-640, 260)
    warp_scale.operation = "SCALE"
    warp_scale.inputs["Scale"].default_value = 0.55
    links.new(warp.outputs["Color"], warp_scale.inputs[0])

    warped = nodes.new("ShaderNodeVectorMath")
    warped.location = (-460, 120)
    warped.operation = "ADD"
    links.new(mapping.outputs["Vector"], warped.inputs[0])
    links.new(warp_scale.outputs["Vector"], warped.inputs[1])

    # Large rolling nebula clouds (the master density field).
    noise_big = nodes.new("ShaderNodeTexNoise")
    noise_big.location = (-260, 220)
    noise_big.inputs["Scale"].default_value = 2.4
    noise_big.inputs["Detail"].default_value = 9.0
    noise_big.inputs["Roughness"].default_value = 0.58
    links.new(warped.outputs["Vector"], noise_big.inputs["Vector"])

    # Finer wisps / filaments riding on the warped field.
    noise_fine = nodes.new("ShaderNodeTexNoise")
    noise_fine.location = (-260, -40)
    noise_fine.inputs["Scale"].default_value = 6.5
    noise_fine.inputs["Detail"].default_value = 10.0
    noise_fine.inputs["Roughness"].default_value = 0.68
    links.new(warped.outputs["Vector"], noise_fine.inputs["Vector"])

    # Smooth voronoi gives a few bright, clumped nebula cores.
    voronoi = nodes.new("ShaderNodeTexVoronoi")
    voronoi.location = (-260, -300)
    voronoi.feature = "SMOOTH_F1"
    voronoi.inputs["Scale"].default_value = 3.0
    if "Smoothness" in voronoi.inputs:
        voronoi.inputs["Smoothness"].default_value = 1.0
    links.new(warped.outputs["Vector"], voronoi.inputs["Vector"])

    # Big clouds shaped (multiplied) by the finer wisps for filament structure.
    mix_clouds = nodes.new("ShaderNodeMix")
    mix_clouds.location = (40, 120)
    mix_clouds.data_type = "FLOAT"
    mix_clouds.blend_type = "MULTIPLY"
    mix_clouds.inputs["Factor"].default_value = 0.7
    links.new(noise_big.outputs["Fac"], mix_clouds.inputs["A"])
    links.new(noise_fine.outputs["Fac"], mix_clouds.inputs["B"])

    # Invert voronoi distance so cell centres are bright, then add as cores.
    invert = nodes.new("ShaderNodeInvert")
    invert.location = (40, -260)
    links.new(voronoi.outputs["Distance"], invert.inputs["Color"])

    mix_cores = nodes.new("ShaderNodeMix")
    mix_cores.location = (260, 40)
    mix_cores.data_type = "FLOAT"
    mix_cores.blend_type = "ADD"
    mix_cores.inputs["Factor"].default_value = 0.5
    links.new(mix_clouds.outputs["Result"], mix_cores.inputs["A"])
    links.new(invert.outputs["Color"], mix_cores.inputs["B"])

    # High-contrast curve: most of the sky stays in deep void, with clouds
    # ramping through violet -> magenta -> cyan and only the densest cores
    # blowing out to near-white sparks.
    ramp = nodes.new("ShaderNodeValToRGB")
    ramp.location = (480, 0)
    elements = ramp.color_ramp.elements
    elements[0].position = 0.0
    elements[0].color = lin(PALETTE["void"])
    elements[1].position = 1.0
    elements[1].color = lin(PALETTE["spark"])
    mid_stops = [
        (0.46, PALETTE["void"]),
        (0.6, PALETTE["violet_deep"]),
        (0.72, PALETTE["violet"]),
        (0.83, PALETTE["magenta"]),
        (0.93, PALETTE["cyan"]),
    ]
    for position, color in mid_stops:
        stop = ramp.color_ramp.elements.new(position)
        stop.color = lin(color)
    links.new(mix_cores.outputs["Result"], ramp.inputs["Fac"])

    # Drive emission so an EMIT bake captures the full-colour nebula.
    links.new(ramp.outputs["Color"], bsdf.inputs["Emission Color"])
    bsdf.inputs["Emission Strength"].default_value = 1.0

    # Bake target image + its (selected, active) image node.
    bake_img = bpy.data.images.new(
        "NebulaBake", width=BAKE_SIZE, height=BAKE_SIZE, alpha=False
    )
    bake_node = nodes.new("ShaderNodeTexImage")
    bake_node.name = "NebulaBakeNode"
    bake_node.location = (220, -320)
    bake_node.image = bake_img
    bake_node.select = True
    nodes.active = bake_node

    return mat, bake_img


def rewire_to_baked(mat: bpy.types.Material, bake_img: bpy.types.Image) -> None:
    """Replace the procedural graph with the baked emissive texture."""
    tree = mat.node_tree
    nodes = tree.nodes
    links = tree.links

    bsdf = next(n for n in nodes if n.type == "BSDF_PRINCIPLED")
    bake_node = nodes["NebulaBakeNode"]
    bake_node.select = False

    # Drop every node except the BSDF, output and baked image node.
    keep = {bsdf, bake_node}
    for node in list(nodes):
        if node.type == "OUTPUT_MATERIAL":
            keep.add(node)
    for node in list(nodes):
        if node not in keep:
            nodes.remove(node)

    bsdf.inputs["Base Color"].default_value = lin(PALETTE["void"])
    bsdf.inputs["Emission Strength"].default_value = 1.0
    links.new(bake_node.outputs["Color"], bsdf.inputs["Emission Color"])


def bake_nebula(dome: bpy.types.Object) -> None:
    scene = bpy.context.scene
    scene.render.engine = "CYCLES"
    # EMIT bakes pure shader emission (no light transport), so a few samples
    # are plenty and there is no GI noise to clean up.
    scene.cycles.samples = 4
    scene.cycles.use_denoising = False
    if hasattr(scene.cycles, "device"):
        scene.cycles.device = "CPU"

    scene.render.bake.use_pass_direct = False
    scene.render.bake.use_pass_indirect = False
    scene.render.bake.margin = 8

    bpy.ops.object.select_all(action="DESELECT")
    dome.select_set(True)
    bpy.context.view_layer.objects.active = dome

    bpy.ops.object.bake(type="EMIT")


def render_poster(dome: bpy.types.Object) -> None:
    """Render a single inside-the-dome still for the fallback poster."""
    scene = bpy.context.scene

    cam_data = bpy.data.cameras.new("PosterCam")
    cam_data.lens = 24.0  # wide angle so the nebula fills the frame
    cam = bpy.data.objects.new("PosterCam", cam_data)
    bpy.context.collection.objects.link(cam)
    cam.location = Vector((0.0, 0.0, 0.0))
    # Aim into a colour-rich quadrant of the dome.
    cam.rotation_euler = (math.radians(82.0), 0.0, math.radians(38.0))
    scene.camera = cam

    scene.render.engine = "BLENDER_EEVEE"
    scene.render.resolution_x = 1600
    scene.render.resolution_y = 900
    scene.render.film_transparent = False
    scene.world = bpy.data.worlds.new("CosmosWorld")
    scene.world.use_nodes = True
    bg = scene.world.node_tree.nodes.get("Background")
    if bg is not None:
        bg.inputs["Color"].default_value = lin(PALETTE["void"])
        bg.inputs["Strength"].default_value = 1.0

    scene.render.image_settings.file_format = "WEBP"
    scene.render.image_settings.quality = 82
    scene.render.filepath = POSTER_PATH

    bpy.ops.render.render(write_still=True)


def main() -> None:
    clear_scene()

    os.makedirs(os.path.dirname(GLB_PATH), exist_ok=True)
    os.makedirs(os.path.dirname(POSTER_PATH), exist_ok=True)

    mat, bake_img = build_nebula_material()

    bpy.ops.mesh.primitive_uv_sphere_add(
        radius=DOME_RADIUS,
        segments=DOME_SEGMENTS,
        ring_count=DOME_RINGS,
        location=(0.0, 0.0, 0.0),
    )
    dome = bpy.context.active_object
    dome.name = "NebulaDome"

    # Smooth shading + flipped normals so we see the *inside* of the sphere.
    bpy.ops.object.shade_smooth()
    bpy.ops.object.mode_set(mode="EDIT")
    bpy.ops.mesh.select_all(action="SELECT")
    bpy.ops.mesh.flip_normals()
    bpy.ops.object.mode_set(mode="OBJECT")

    dome.data.materials.append(mat)

    bake_nebula(dome)
    rewire_to_baked(mat, bake_img)
    bake_img.pack()

    render_poster(dome)

    bpy.ops.object.select_all(action="DESELECT")
    dome.select_set(True)
    bpy.context.view_layer.objects.active = dome

    bpy.ops.export_scene.gltf(
        filepath=GLB_PATH,
        export_format="GLB",
        use_selection=True,
        export_apply=True,
        export_yup=True,
        export_materials="EXPORT",
        export_image_format="JPEG",
        export_jpeg_quality=82,
    )
    print(f"Exported cosmic scene to {GLB_PATH}")
    print(f"Rendered poster to {POSTER_PATH}")


if __name__ == "__main__":
    main()
