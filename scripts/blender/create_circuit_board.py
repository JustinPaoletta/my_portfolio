"""Generate a clean 3D circuit board GLB for the engineer hero.

This is the 3D counterpart of the approved 2D SVG circuit
(`EngineerCircuitBoard`). The board layout is derived from the SAME 2D
coordinates (viewBox 1200x760, CPU centered at 600,380) so the React data-flow
packets ride exactly along the copper traces.

Run headless:
    blender --background --python scripts/blender/create_circuit_board.py

Materials are named so the web layer can recolor them per dark/light theme:
    PCB, Copper, IHS, IC, Pad
"""

import os

import bpy
from mathutils import Vector

OUTPUT_PATH = os.path.normpath(
    os.path.join(
        os.path.dirname(os.path.abspath(__file__)),
        "..",
        "..",
        "public",
        "models",
        "hero",
        "circuit-board.glb",
    )
)

BOARD_W = 7.2
BOARD_D = 4.8
BOARD_T = 0.12
TRACE_W = 0.03
TRACE_T = 0.012
TRACE_Z = BOARD_T + 0.008

# 2D -> board-space scale (viewBox 1200 x 760, CPU centred at 600,380)
SX = BOARD_W / 1200.0
SY = BOARD_D / 760.0


def p2d(px: float, py: float) -> tuple[float, float]:
    """Map a 2D SVG point to board-space (x, y)."""
    return ((px - 600.0) * SX, -((py - 380.0) * SY))


# Mirrors TRACES in EngineerCircuitBoard.tsx (keep in sync).
TRACES_2D = [
    [(500, 320), (360, 320), (360, 182), (150, 182)],
    [(500, 358), (300, 358), (300, 300), (96, 300)],
    [(500, 408), (262, 408), (262, 520), (104, 520)],
    [(500, 446), (340, 446), (340, 620), (186, 620)],
    [(700, 320), (858, 320), (858, 172), (1070, 172)],
    [(700, 358), (820, 358), (820, 300), (1096, 300)],
    [(700, 408), (900, 408), (900, 520), (1092, 520)],
    [(700, 446), (840, 446), (840, 610), (1006, 610)],
    [(560, 290), (560, 202), (424, 202), (424, 96)],
    [(640, 290), (640, 162), (780, 162), (780, 86)],
    [(560, 470), (560, 560), (444, 560), (444, 690)],
    [(640, 470), (640, 600), (760, 600), (760, 700)],
    [(120, 120), (1080, 120)],
    [(120, 680), (1080, 680)],
]

# Mirrors COMPONENTS in EngineerCircuitBoard.tsx (x, y, w, h in 2D space).
# The 5th tuple entry is the component height in board units (taller = more 3D).
COMPONENTS_2D = [
    (96, 150, 96, 64, 0.34),
    (44, 278, 72, 44, 0.22),
    (60, 494, 66, 52, 0.26),
    (142, 598, 74, 44, 0.2),
    (1024, 140, 96, 64, 0.34),
    (1060, 278, 72, 44, 0.22),
    (1048, 494, 82, 52, 0.26),
    (968, 588, 80, 44, 0.2),
    (382, 62, 84, 50, 0.18),
    (740, 50, 82, 50, 0.18),
    (402, 660, 84, 48, 0.18),
    (720, 668, 82, 46, 0.18),
]

# Tall cylindrical capacitors (px, py, radius_px, height_units) placed in the
# open left/right bands so they read as bold 3D silhouettes.
CAPS_2D = [
    (150, 250, 26, 0.78),
    (150, 470, 22, 0.62),
    (1056, 250, 26, 0.78),
    (1056, 470, 22, 0.62),
    (250, 360, 18, 0.5),
    (956, 360, 18, 0.5),
]


def clear_scene() -> None:
    bpy.ops.object.select_all(action="SELECT")
    bpy.ops.object.delete(use_global=False)
    for collection in (bpy.data.meshes, bpy.data.materials, bpy.data.curves):
        for block in list(collection):
            collection.remove(block)


def make_material(
    name: str,
    base: tuple[float, float, float],
    metallic: float,
    roughness: float,
    emission: tuple[float, float, float] | None = None,
    emission_strength: float = 0.0,
) -> bpy.types.Material:
    mat = bpy.data.materials.new(name=name)
    mat.use_nodes = True
    nodes = mat.node_tree.nodes
    links = mat.node_tree.links
    nodes.clear()
    output = nodes.new("ShaderNodeOutputMaterial")
    bsdf = nodes.new("ShaderNodeBsdfPrincipled")
    bsdf.inputs["Base Color"].default_value = (*base, 1.0)
    bsdf.inputs["Metallic"].default_value = metallic
    bsdf.inputs["Roughness"].default_value = roughness
    if emission is not None:
        bsdf.inputs["Emission Color"].default_value = (*emission, 1.0)
        bsdf.inputs["Emission Strength"].default_value = emission_strength
    links.new(bsdf.outputs["BSDF"], output.inputs["Surface"])
    return mat


def add_box(
    name: str,
    size: Vector,
    location: Vector,
    material: bpy.types.Material,
    bevel: float = 0.0,
) -> bpy.types.Object:
    bpy.ops.mesh.primitive_cube_add(size=1.0, location=location)
    obj = bpy.context.active_object
    obj.name = name
    obj.scale = size / 2.0
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
    if bevel > 0:
        mod = obj.modifiers.new(name="Bevel", type="BEVEL")
        mod.width = bevel
        mod.segments = 2
        bpy.ops.object.modifier_apply(modifier=mod.name)
    obj.data.materials.append(material)
    return obj


def add_cylinder(
    name: str,
    radius: float,
    depth: float,
    location: Vector,
    material: bpy.types.Material,
) -> bpy.types.Object:
    bpy.ops.mesh.primitive_cylinder_add(
        radius=radius, depth=depth, vertices=16, location=location
    )
    obj = bpy.context.active_object
    obj.name = name
    obj.data.materials.append(material)
    return obj


def add_trace_segment(
    name: str,
    a: tuple[float, float],
    b: tuple[float, float],
    material: bpy.types.Material,
) -> bpy.types.Object:
    ax, ay = a
    bx, by = b
    cx, cy = (ax + bx) / 2.0, (ay + by) / 2.0
    dx, dy = abs(bx - ax), abs(by - ay)
    # Extend each segment by a full trace width so neighbouring segments
    # overlap at corners, yielding one continuous line under the data flow.
    if dx >= dy:
        size = Vector((max(dx, TRACE_W) + TRACE_W, TRACE_W, TRACE_T))
    else:
        size = Vector((TRACE_W, max(dy, TRACE_W) + TRACE_W, TRACE_T))
    return add_box(name, size, Vector((cx, cy, TRACE_Z)), material)


def main() -> None:
    clear_scene()

    pcb_mat = make_material("PCB", (0.04, 0.13, 0.11), 0.0, 0.62)
    # Silver traces (a touch of emission keeps the lines visible in dark mode).
    trace_mat = make_material(
        "Trace", (0.82, 0.84, 0.88), 1.0, 0.28, (0.55, 0.58, 0.64), 0.2
    )
    ihs_mat = make_material("IHS", (0.78, 0.82, 0.88), 1.0, 0.22)
    ic_mat = make_material("IC", (0.03, 0.05, 0.05), 0.3, 0.45)
    # Gold for the tiny pads/vias and the chip trim. Kept only partly metallic
    # with a warm emissive tint so it reads as gold without an environment map
    # to reflect (a fully-metallic gold would render grey on the dark canvas).
    pad_mat = make_material(
        "Pad", (0.96, 0.75, 0.26), 0.5, 0.38, (0.55, 0.38, 0.07), 0.35
    )
    cap_mat = make_material("Cap", (0.08, 0.1, 0.12), 0.7, 0.3)

    root = bpy.data.objects.new("CircuitBoard", None)
    bpy.context.collection.objects.link(root)

    # Board substrate
    board = add_box(
        "Board",
        Vector((BOARD_W, BOARD_D, BOARD_T)),
        Vector((0.0, 0.0, BOARD_T / 2.0)),
        pcb_mat,
        bevel=0.05,
    )
    board.parent = root

    # NOTE: copper traces and their end vias are intentionally NOT baked into
    # the model. They are rendered at runtime in EngineerCircuit3D from the same
    # path data that drives the flowing data packets, guaranteeing the lights
    # always ride exactly on the lines. (trace_mat kept for reference/parity.)
    _ = trace_mat

    # Surface-mounted components (ICs)
    for ci, (x, y, w, h, ch) in enumerate(COMPONENTS_2D):
        cx, cy = p2d(x + w / 2.0, y + h / 2.0)
        size = Vector((w * SX, h * SY, ch))
        ic = add_box(
            f"IC_{ci}",
            size,
            Vector((cx, cy, BOARD_T + ch / 2.0)),
            ic_mat,
            bevel=0.01,
        )
        ic.parent = root
        lid = add_box(
            f"IC_lid_{ci}",
            Vector((w * SX * 0.7, h * SY * 0.7, 0.02)),
            Vector((cx, cy, BOARD_T + ch)),
            pad_mat,
        )
        lid.parent = root

        # Tiny gold leads attaching the chip to the board (SMD-style pins
        # along the two longer edges).
        hw = w * SX / 2.0
        hd = h * SY / 2.0
        pin_len = 0.08
        pin_w = 0.035
        pin_h = 0.03
        n_pins = max(2, int((2 * hd) / 0.11))
        for k in range(n_pins):
            ty = cy - hd + (2 * hd) * (k / (n_pins - 1))
            for sign in (-1.0, 1.0):
                px = cx + sign * (hw + pin_len / 2.0 - 0.012)
                pin = add_box(
                    f"IC_pin_{ci}_{k}_{'l' if sign < 0 else 'r'}",
                    Vector((pin_len, pin_w, pin_h)),
                    Vector((px, ty, BOARD_T + pin_h / 2.0)),
                    pad_mat,
                )
                pin.parent = root

    # Tall electrolytic-style capacitors for dramatic 3D depth
    for capi, (px, py, rad_px, ch) in enumerate(CAPS_2D):
        cx, cy = p2d(px, py)
        radius = rad_px * SX
        body = add_cylinder(
            f"Cap_{capi}",
            radius,
            ch,
            Vector((cx, cy, BOARD_T + ch / 2.0)),
            cap_mat,
        )
        body.parent = root
        top = add_cylinder(
            f"Cap_top_{capi}",
            radius * 0.92,
            0.03,
            Vector((cx, cy, BOARD_T + ch)),
            pad_mat,
        )
        top.parent = root

    # Central CPU: tall socket frame + raised metallic heat spreader + notch
    socket_h = 0.34
    ihs_h = 0.5
    socket = add_box(
        "CPU_socket",
        Vector((2.0, 1.8, socket_h)),
        Vector((0.0, 0.0, BOARD_T + socket_h / 2.0)),
        ic_mat,
        bevel=0.02,
    )
    socket.parent = root
    # Gold trim framing the chip, sitting on the socket beneath the IHS.
    trim = add_box(
        "CPU_trim",
        Vector((1.78, 1.58, 0.12)),
        Vector((0.0, 0.0, BOARD_T + socket_h + 0.06)),
        pad_mat,
        bevel=0.02,
    )
    trim.parent = root
    ihs = add_box(
        "CPU_IHS",
        Vector((1.5, 1.3, ihs_h)),
        Vector((0.0, 0.0, BOARD_T + socket_h + ihs_h / 2.0)),
        ihs_mat,
        bevel=0.04,
    )
    ihs.parent = root
    notch = add_box(
        "CPU_notch",
        Vector((0.16, 0.16, 0.02)),
        Vector((-0.62, 0.52, BOARD_T + socket_h + ihs_h)),
        pad_mat,
    )
    notch.parent = root

    # Gold pads ringing the CPU socket
    for i in range(8):
        t = -0.85 + (1.7 / 7.0) * i
        for sy in (-0.98, 0.98):
            pad = add_box(
                f"CPU_pad_{i}_{'b' if sy < 0 else 't'}",
                Vector((0.07, 0.07, 0.02)),
                Vector((t, sy, BOARD_T + 0.02)),
                pad_mat,
            )
            pad.parent = root

    # Select the whole hierarchy and export
    bpy.ops.object.select_all(action="DESELECT")

    def select_recursive(obj: bpy.types.Object) -> None:
        obj.select_set(True)
        for child in obj.children:
            select_recursive(child)

    select_recursive(root)
    bpy.context.view_layer.objects.active = root

    bpy.ops.export_scene.gltf(
        filepath=OUTPUT_PATH,
        export_format="GLB",
        use_selection=True,
        export_apply=True,
        export_yup=True,
        export_materials="EXPORT",
    )
    print(f"Exported circuit board to {OUTPUT_PATH}")


if __name__ == "__main__":
    main()
