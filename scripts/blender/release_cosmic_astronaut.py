"""Render and export the authoritative artist .blend; never regenerate it.
--render: make the hero still and once-playing frames.
Default: optimize a working copy, bake runtime PBR maps, export self-contained GLB.
"""
import bpy, json, sys, shutil, hashlib, math
from pathlib import Path
ROOT=Path(__file__).resolve().parents[2]
SOURCE=ROOT/'assets/blender/cosmic-astronaut.blend'
OUT=ROOT/'output/playwright/cosmic-astronaut/production';OUT.mkdir(parents=True,exist_ok=True)
bpy.ops.wm.open_mainfile(filepath=str(SOURCE))
s=bpy.context.scene;s.frame_set(1);s.render.use_persistent_data=True;s.render.engine='CYCLES'
if '--render' in sys.argv:
    s.render.resolution_x=900;s.render.resolution_y=1000;s.render.resolution_percentage=100;s.cycles.samples=48;s.cycles.use_denoising=True
    s.render.image_settings.file_format='PNG';s.render.filepath=str(ROOT/'output/playwright/cosmic-astronaut/beauty.png');bpy.ops.render.render(write_still=True)
    frames=ROOT/'output/playwright/cosmic-astronaut/wave-frames';frames.mkdir(parents=True,exist_ok=True)
    s.render.resolution_x=420;s.render.resolution_y=467;s.cycles.samples=16
    for frame in range(1,82):
        s.frame_set(frame);s.render.filepath=str(frames/f'{frame:04d}.png');bpy.ops.render.render(write_still=True)
    for frame in range(82,97):shutil.copyfile(frames/'0081.png',frames/f'{frame:04d}.png')
    (ROOT/'output/playwright/cosmic-astronaut/render-manifest.json').write_text(json.dumps({'source_sha256':hashlib.sha256(SOURCE.read_bytes()).hexdigest(),'frames':96,'fps':20,'width':420,'height':467,'wave_seconds':3,'lower_seconds':1,'loop':1},indent=2)+'\n')
    print('Hero motion renders complete')
    raise SystemExit(0)

# Scope the runtime copy to renderable assets. Keep rig/skin; remove editor guides.
for name in list(bpy.data.objects.keys()):
    o=bpy.data.objects[name]
    if o.hide_render or name in ['Lap hand contact target','Elbow outside guide']:
        bpy.data.objects.remove(o,do_unlink=True)
bpy.context.view_layer.update()
dg=bpy.context.evaluated_depsgraph_get()
for o in list(bpy.data.objects):
    if o.type not in ['MESH','CURVE']:continue
    if any(mod.type=='ARMATURE' for mod in o.modifiers):continue
    mesh=bpy.data.meshes.new_from_object(o.evaluated_get(dg),preserve_all_data_layers=True,depsgraph=dg)
    if o.type=='CURVE':
        name=o.name;world=o.matrix_world.copy();parent=o.parent
        replacement=bpy.data.objects.new(name+' runtime',mesh);bpy.context.collection.objects.link(replacement);replacement.parent=parent;replacement.matrix_world=world
        for c in list(o.children):w=c.matrix_world.copy();c.parent=replacement;c.matrix_world=w
        bpy.data.objects.remove(o,do_unlink=True);replacement.name=name;o=replacement
    else:o.data=mesh;o.modifiers.clear()
    if len(o.data.polygons)>2000 and o.name not in ['Chest sewn American flag badge','Helmet gold optical visor']:
        bpy.ops.object.select_all(action='DESELECT');o.select_set(True);bpy.context.view_layer.objects.active=o
        mod=o.modifiers.new('Runtime silhouette reduction','DECIMATE');mod.ratio=.24 if o.name=='Asteroid crater relief' else (.62 if o.name.startswith('Helmet') else .22)
        bpy.ops.object.modifier_apply(modifier=mod.name)

# Bake unsupported procedural color/normal shaders into portable PBR textures.
s.cycles.samples=1;s.cycles.use_denoising=False;s.render.bake.margin=8
TEX=ROOT/'assets/blender/textures';TEX.mkdir(exist_ok=True)
def bake_material(material_name,stem):
    mat=bpy.data.materials[material_name]
    objects=[o for o in bpy.data.objects if o.type=='MESH' and mat in list(o.data.materials)]
    bpy.ops.object.select_all(action='DESELECT')
    for o in objects:o.select_set(True)
    bpy.context.view_layer.objects.active=objects[0]
    # Multi-object UV packing creates one atlas per material, not overlapping UVs.
    bpy.ops.object.mode_set(mode='EDIT');bpy.ops.mesh.select_all(action='SELECT');bpy.ops.uv.smart_project(island_margin=.01);bpy.ops.object.mode_set(mode='OBJECT')
    images={}
    for label,kind in [('basecolor','DIFFUSE'),('normal','NORMAL')]:
        image=bpy.data.images.new(stem+' '+label,width=1024,height=1024,alpha=False)
        if label=='normal':image.colorspace_settings.name='Non-Color'
        node=mat.node_tree.nodes.new('ShaderNodeTexImage');node.image=image;mat.node_tree.nodes.active=node
        s.render.bake.use_pass_direct=False;s.render.bake.use_pass_indirect=False;s.render.bake.use_pass_color=True
        if kind=='NORMAL':s.render.bake.normal_space='TANGENT'
        bpy.ops.object.bake(type=kind)
        image.scale(512,512)
        image.filepath_raw=str(TEX/(stem+'-'+label+'.png'));image.file_format='PNG';image.save();image.pack();images[label]=image
    runtime=mat.copy();runtime.name=stem+' runtime PBR'
    nodes=runtime.node_tree.nodes;links=runtime.node_tree.links
    p=next(n for n in nodes if n.type=='BSDF_PRINCIPLED')
    for n in list(nodes):
        if n.type not in ['BSDF_PRINCIPLED','OUTPUT_MATERIAL']:nodes.remove(n)
    p.inputs['Base Color'].default_value=(1,1,1,1)
    albedo=nodes.new('ShaderNodeTexImage');albedo.image=images['basecolor'];links.new(albedo.outputs['Color'],p.inputs['Base Color'])
    normal=nodes.new('ShaderNodeTexImage');normal.image=images['normal'];convert=nodes.new('ShaderNodeNormalMap');links.new(normal.outputs['Color'],convert.inputs['Color']);links.new(convert.outputs['Normal'],p.inputs['Normal'])
    for o in objects:
        for slot in o.material_slots:
            if slot.material==mat:slot.material=runtime
    print('Baked runtime PBR atlas:',stem,len(objects),'meshes',flush=True)
bake_material('Apollo off-white woven pressure suit','suit')
bake_material('Basalt regolith','asteroid')

bpy.ops.object.select_all(action='DESELECT')
for o in bpy.data.objects:
    if o.type not in ['CAMERA','LIGHT']:o.select_set(True)
props=bpy.ops.export_scene.gltf.get_rna_type().properties
kwargs=dict(filepath=str(ROOT/'public/models/hero/cosmic-astronaut.glb'),export_format='GLB',use_selection=True,export_apply=True,export_yup=True,export_animations=True,export_animation_mode='SCENE',export_anim_scene_split_object=False,export_anim_slide_to_zero=True,export_frame_range=True,export_force_sampling=True)
if 'export_skins' in props:kwargs['export_skins']=True
if 'export_morph' in props:kwargs['export_morph']=False
bpy.ops.export_scene.gltf(**kwargs)
print('Self-contained optimized skinned GLB exported')
