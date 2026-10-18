"""Author the seated cosmic explorer. Blender 5.1; Z up, -Y forward, meters.
Run: blender -b --factory-startup --python-exit-code 1 --python scripts/blender/create_cosmic_astronaut.py
WaveThenRest uses editable shoulder/elbow/wrist controls; hero floating is owned by CSS.
"""
import bpy
import math
import os
import random
import sys
from mathutils import Vector, Matrix, noise
from mathutils.geometry import interpolate_bezier

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '../..'))
# Historical generator: production source must be loaded, never regenerated.
if os.path.exists(os.path.join(ROOT, 'assets/blender/cosmic-astronaut.blend')) and '--legacy-regeneration' not in sys.argv:
    raise SystemExit('Use release_cosmic_astronaut.py to render/export the production source. The legacy generator requires --legacy-regeneration.')
bpy.ops.object.select_all(action='SELECT')
bpy.ops.object.delete(use_global=False)
random.seed(24)

def mat(name, color, metal=0, rough=.4):
    m = bpy.data.materials.new(name)
    m.diffuse_color = (*color, 1)
    m.use_nodes = True
    p = m.node_tree.nodes.get('Principled BSDF')
    p.inputs['Base Color'].default_value = (*color, 1)
    p.inputs['Metallic'].default_value = metal
    p.inputs['Roughness'].default_value = rough
    return m

ivory = mat('Apollo off-white woven pressure suit', (.78,.76,.68), 0, .94)
shell = mat('Rigid helmet and equipment enamel', (.78,.76,.68), .08, .33)
thread = mat('Off-white seam stitching', (.64,.61,.53), 0, .95)
panel = mat('Sewn canvas reinforcement', (.68,.66,.59), 0, .93)
glove_fabric = mat('Apollo graphite glove fabric', (.11,.105,.095), 0, .82)
red = mat('Muted mission red', (.45,.06,.035), 0, .7)
air_tube = mat('Flexible woven air tube', (.38,.37,.32), 0, .8)
tube_rib = mat('Air tube corrugation', (.49,.47,.40), 0, .72)
cloth_seam = mat('Warm fabric seam', (.52,.50,.43), 0, .86)
glove_grip = mat('Glove palm reinforcement', (.22,.25,.29), 0, .82)
seam = mat('Graphite flexible joints', (.025,.032,.05), .15, .5)
trim = mat('Anodized champagne hardware', (.55,.32,.10), .75, .24)
visor = mat('Apollo gold reflective visor', (.22,.13,.035), .94, .12)
blue = mat('Mission blue', (.025,.16,.30), .5, .3)
rockmat = mat('Basalt regolith', (.18,.135,.22), .08, .83)
# Procedural grain is for the beauty render; crater relief is real exported geometry.
p = rockmat.node_tree.nodes.get('Principled BSDF')
n = rockmat.node_tree.nodes.new('ShaderNodeTexNoise')
n.inputs['Scale'].default_value = 65
b = rockmat.node_tree.nodes.new('ShaderNodeBump')
b.inputs['Strength'].default_value = .38
b.inputs['Distance'].default_value = .055
rockmat.node_tree.links.new(n.outputs['Fac'], b.inputs['Height'])
rockmat.node_tree.links.new(b.outputs['Normal'], p.inputs['Normal'])
glow = mat('Cyan status lights', (.04,.7,.9), .3, .2)
p = glow.node_tree.nodes.get('Principled BSDF')
p.inputs['Emission Color'].default_value = (.03,.55,.8,1)
p.inputs['Emission Strength'].default_value = 2

# Matte woven thermal cover: irregular weave, low specular response, soft sheen.
p=ivory.node_tree.nodes.get('Principled BSDF')
p.inputs['Specular IOR Level'].default_value=.18
p.inputs['Sheen Weight'].default_value=.28
p.inputs['Sheen Roughness'].default_value=.8
n=ivory.node_tree.nodes.new('ShaderNodeTexNoise'); n.inputs['Scale'].default_value=240; n.inputs['Detail'].default_value=2
b=ivory.node_tree.nodes.new('ShaderNodeBump'); b.inputs['Strength'].default_value=.45; b.inputs['Distance'].default_value=.004
ivory.node_tree.links.new(n.outputs['Fac'],b.inputs['Height']); ivory.node_tree.links.new(b.outputs['Normal'],p.inputs['Normal'])
# Soft uneven cloth color avoids a single flat plastic fill.
low=ivory.node_tree.nodes.new('ShaderNodeTexNoise'); low.inputs['Scale'].default_value=14
ramp=ivory.node_tree.nodes.new('ShaderNodeValToRGB')
ramp.color_ramp.elements[0].color=(.55,.53,.46,1)
ramp.color_ramp.elements[1].color=(.80,.78,.71,1)
ivory.node_tree.links.new(low.outputs['Fac'],ramp.inputs['Fac']); ivory.node_tree.links.new(ramp.outputs['Color'],p.inputs['Base Color'])
parts = []
def finish(o, name, material):
    o.name = name
    o.data.materials.append(material)
    if o.type == 'MESH':
        for f in o.data.polygons: f.use_smooth = True
    parts.append(o)
    return o

def is_cloth(name, material):
    return material == ivory and any(word in name.lower() for word in ['pressure','forearm','upper arm','pelvis','elbow','quilted'])

def cloth_point(co, name):
    co=Vector(co); z=co.z; angle=math.atan2(co.y,co.x)
    torso='torso' in name.lower() or 'pelvis' in name.lower()
    # Broad sagging folds at bent joints; smaller diagonal folds on loose panels.
    centers=[-.72,-.52,-.29,.10,.43,.66] if not torso else [-.65,-.43,-.22,.15]
    displacement=0
    for i,center in enumerate(centers):
        shift=.065*math.sin(angle*2+i*1.6)
        width=.065 if not torso else .075
        strength=(.095 if not torso else .068)*(1+.30*math.sin(angle+i))
        crease=z-center-shift
        displacement += strength*math.exp(-(crease/width)**2)
        displacement -= strength*.48*math.exp(-((crease+width*.85)/(width*.48))**2)
    displacement += .022*noise.noise_vector(co*7)[0]
    taper=max(0,1-abs(z))**.45
    co.x *= 1+displacement*taper
    co.y *= 1+displacement*taper
    return co

def seam_curve(name, paths, radius, material, parent):
    data=bpy.data.curves.new(name,'CURVE'); data.dimensions='3D'; data.bevel_depth=radius; data.bevel_resolution=2
    for coords in paths:
        spline=data.splines.new('POLY'); spline.points.add(len(coords)-1)
        for p,co in zip(spline.points,coords): p.co=(*co,1)
    o=bpy.data.objects.new(name,data); bpy.context.collection.objects.link(o); data.materials.append(material)
    o.parent=parent
    # Use unscaled world dimensions in parent local coordinates (avoid tiny stitches).
    parts.append(o)
    return o

def cloth_seams(o, name):
    # Sewn longitudinal panel edges follow the displaced fabric instead of hovering.
    paths=[]; stitches=[]
    for phi in [-math.pi*.72,-math.pi*.28]:
        coords=[]
        for i in range(100):
            theta=.35+(math.pi-.70)*i/99
            co=cloth_point((math.sin(theta)*math.cos(phi),math.sin(theta)*math.sin(phi),math.cos(theta)),name)
            coords.append(Vector((co.x*o.scale.x,co.y*o.scale.y,co.z*o.scale.z))*1.008)
        paths.append(coords)
        for i in range(2,96,3):
            center=coords[i]
            tangent=(coords[i+1]-coords[i-1]).normalized()
            stitches.append([center-tangent*.004,center+tangent*.004])
    # Parent-local geometry has dimensions applied; preserve parent rotation only.
    for label,segments,radius,material in [('welt',paths,.0045,cloth_seam),('stitches',stitches,.0025,thread)]:
        obj=seam_curve(name+' '+label,segments,radius,material,o)
        obj.scale=(1/o.scale.x,1/o.scale.y,1/o.scale.z)

def sewn_knee_panel(parent):
    # A thin canvas patch follows the knee's existing fabric surface exactly.
    vertices=[]; faces=[]; edge=[]
    for row in range(9):
        radius=.001+.75*row/8
        for i in range(64):
            angle=2*math.pi*i/64
            x=radius*math.cos(angle); z=radius*.90*math.sin(angle)
            co=cloth_point((x,-math.sqrt(max(0,1-x*x-z*z)),z),parent.name)*1.022
            vertices.append(co)
            if row==8: edge.append(Vector((co.x*parent.scale.x,co.y*parent.scale.y,co.z*parent.scale.z)))
    for row in range(8):
        for i in range(64):
            j=(i+1)%64
            faces.append((row*64+i,(row+1)*64+i,(row+1)*64+j,row*64+j))
    mesh=bpy.data.meshes.new('Sewn knee canvas surface'); mesh.from_pydata(vertices,[],faces); mesh.update()
    o=bpy.data.objects.new('Knee conforming canvas reinforcement',mesh); bpy.context.collection.objects.link(o); finish(o,o.name,panel); o.parent=parent
    border=seam_curve('Knee panel seam',[edge+[edge[0]]],.004,cloth_seam,parent); border.scale=tuple(1/v for v in parent.scale)
    stitches=[]
    for i in range(0,64,2): stitches.append([edge[i],edge[(i+1)%64]])
    stitch=seam_curve('Knee panel stitches',stitches,.002,thread,parent); stitch.scale=tuple(1/v for v in parent.scale)

cloth_objects=[]
def ell(name, loc, scale, material):
    fabric=is_cloth(name,material)
    bpy.ops.mesh.primitive_uv_sphere_add(segments=64 if fabric else 40, ring_count=48 if fabric else 24, location=loc)
    o=finish(bpy.context.object,name,material); o.scale=scale
    if fabric:
        for v in o.data.vertices: v.co=cloth_point(v.co,name)
        sub=o.modifiers.new('Soft cloth folds','SUBSURF'); sub.levels=1; sub.render_levels=1
        cloth_objects.append(o)
        if any(word in name.lower() for word in ['torso','forearm','upper arm','thigh','shin']): cloth_seams(o,name)
    return o

def box(name, loc, scale, material, bevel=.06):
    bpy.ops.mesh.primitive_cube_add(size=1, location=loc)
    o=finish(bpy.context.object,name,material)
    o.scale=scale
    bpy.ops.object.transform_apply(location=False,rotation=False,scale=True)
    mod=o.modifiers.new('Rounded machined edges','BEVEL'); mod.width=bevel; mod.segments=3
    o.modifiers.new('Weighted corner normals','WEIGHTED_NORMAL')
    return o

def segment(name,a,b,r,material):
    a,b=Vector(a),Vector(b)
    o=ell(name,(a+b)/2,(r,r,(b-a).length/2+r*.55),material)
    o.rotation_euler=(b-a).to_track_quat('Z','Y').to_euler()
    return o

def ring(name,loc,r,t,material,axis=(0,0,1),scale=(1,1,1)):
    bpy.ops.mesh.primitive_torus_add(major_segments=48,minor_segments=10,location=loc,major_radius=r,minor_radius=t)
    o=finish(bpy.context.object,name,material)
    o.rotation_euler=Vector(axis).to_track_quat('Z','Y').to_euler(); o.scale=scale
    return o

# Cratered, asymmetric asteroid with a broad seat at its upper pole.
bpy.ops.mesh.primitive_ico_sphere_add(subdivisions=6,radius=1)
rock=finish(bpy.context.object,'Asteroid crater relief',rockmat)
craters=[]
for i in range(22):
    d=Vector((random.uniform(-1,1),random.uniform(-1,1),random.uniform(-1,.6))).normalized()
    craters.append((d,random.uniform(.12,.28)))
for v in rock.data.vertices:
    d=v.co.normalized(); r=1+.10*noise.noise_vector(d*3.3)[0]+.035*noise.noise_vector(d*15)[1]
    for center,size in craters:
        dist=(d-center).length/size
        if dist<1.4:
            r+=.035*math.exp(-((dist-1)/.18)**2)-.11*math.exp(-(dist/.65)**4)
    v.co=Vector((d.x*r*1.06,d.y*r*.83,d.z*r*.60))
rock.location=(0,0,.12)
# Body seat meets the rock at z=.72. Knees extend over its forward edge.
ell('Seated pelvis',(0,-.04,.96),(.53,.39,.29),ivory)
ell('Pressure torso',(0,.04,1.47),(.51,.37,.54),ivory)
box('Life support backpack frame',(0,.43,1.69),(1.04,.42,1.48),ivory,.12)
box('Backpack thermal fabric cover',(0,.65,1.70),(1.02,.30,1.43),ivory,.14)
box('Backpack upper oxygen unit',(0,.62,2.39),(.87,.43,.27),ivory,.10)
for z in [1.18,1.73,2.20]:
    box('Backpack sewn horizontal band',(0,.813,z),(.91,.022,.038),cloth_seam,.008)
ring('Neck seal',(0,0,1.94),.255,.055,seam)
ring('Helmet locking collar',(0,0,2.01),.30,.035,trim)
# Apollo extravehicular visor assembly: rounded padded hood surrounding an
# oval gold visor, with a top sunshade and small side hinges rather than ears.
ell('Helmet inner pressure shell',(0,.035,2.39),(.49,.42,.53),shell)
ell('Helmet thermal overhood',(0,.015,2.40),(.515,.445,.565),ivory)
ell('Visor recessed gasket',(0,-.365,2.39),(.425,.20,.47),seam)
ell('Reflective visor',(0,-.399,2.40),(.385,.18,.428),visor)
ring('Visor narrow gold edge',(0,-.425,2.40),.398,.017,trim,axis=(0,-1,0),scale=(1,1.11,1))
ring('Helmet stitched visor binding',(0,-.413,2.40),.428,.026,ivory,axis=(0,-1,0),scale=(1,1.10,1))
ell('Helmet upper sunshade',(0,-.295,2.84),(.40,.17,.055),shell)
for x in [-.485,.485]:
    box('Helmet low profile hinge',(x,-.19,2.36),(.07,.15,.18),shell,.025)
    box('Helmet hinge center',(x*1.06,-.20,2.36),(.015,.08,.09),cloth_seam,.015)
box('Chest console gasket',(0,-.365,1.48),(.43,.12,.32),seam)
box('Chest console shell',(0,-.436,1.49),(.37,.055,.25),shell,.035)
box('Apollo chest control face',(0,-.471,1.54),(.26,.014,.09),shell,.014)
for x in [-.08,.08]:
    box('Chest control toggle',(x,-.49,1.54),(.035,.027,.044),seam,.006)
# Visible paired hose ports on the front waist, as in the Apollo reference.
for x,material in [(-.19,blue),(.19,red)]:
    ring('Waist hose connector',(x,-.36,1.20),.065,.018,ivory,axis=(0,-1,0))
    ell('Waist connector plug',(x,-.382,1.20),(.049,.025,.049),material)
# Sewn chest flag above the control box, clear of the shoulder and helmet.
box('Chest American flag patch',(.19,-.319,1.795),(.235,.03,.15),ivory,.009)
for i in range(7):
    box('Flag red stripe',(.19,-.338,1.727+i*.021),(.215,.008,.0105),red,.002)
box('Flag blue field',(.129,-.345,1.833),(.093,.009,.075),blue,.002)
for row in range(5):
    for col in range(6):
        ell('Flag embroidered star',(.091+col*.014,-.352,1.862-row*.014),(.0026,.0015,.0026),ivory)
for side in [-1,1]:
    hip=(side*.31,-.08,.98); knee=(side*.47,-.65,.85); ankle=(side*.49,-.85,.39)
    segment('Thigh pressure fabric',hip,knee,.275,ivory)
    knee_cloth=ell('Knee quilted fabric',knee,(.275,.26,.21),ivory)
    sewn_knee_panel(knee_cloth)
    segment('Shin pressure fabric',knee,ankle,.22,ivory)
    for z in [.46,.53]: ring('Ankle fabric gathers',(side*.49,-.82,z),.20,.019,cloth_seam)
    box('Boot sole',(side*.49,-.99,.27),(.42,.59,.12),seam,.055)
    box('Boot thermal overshoe',(side*.49,-.94,.37),(.41,.50,.26),glove_fabric,.10)
    box('Boot toe reinforcement',(side*.49,-1.19,.37),(.36,.05,.14),glove_grip,.025)
# Padded EVA gloves: continuous fabric silhouettes, short articulated fingers,
# broad cuffs, reinforced palms. Merge overlapping glove volumes before detail.
def glove_segment(name, a, b, radius, material):
    a,b=Vector(a),Vector(b)
    bpy.ops.mesh.primitive_cylinder_add(vertices=24, radius=radius, depth=(b-a).length, location=(a+b)/2)
    o=finish(bpy.context.object,name,material)
    o.rotation_euler=(b-a).to_track_quat('Z','Y').to_euler()
    caps=[ell(name+' rounded end',v,(radius,radius,radius),material) for v in (a,b)]
    bpy.ops.object.select_all(action='DESELECT')
    for part in [o,*caps]: part.select_set(True)
    bpy.context.view_layer.objects.active=o
    bpy.ops.object.join()
    parts[:]=[part for part in parts if part not in caps]
    return o

def merge_glove(name, pieces):
    bpy.ops.object.select_all(action='DESELECT')
    for o in pieces: o.select_set(True)
    bpy.context.view_layer.objects.active=pieces[0]
    bpy.ops.object.join()
    o=bpy.context.object
    parts[:]=[part for part in parts if part not in pieces]+[o]
    o.name=name
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
    rem=o.modifiers.new('Continuous sewn glove volume','REMESH')
    rem.mode='VOXEL'; rem.voxel_size=.009; rem.use_smooth_shade=True
    bpy.ops.object.modifier_apply(modifier=rem.name)
    smooth=o.modifiers.new('Soft fabric transitions','SMOOTH')
    smooth.factor=.65; smooth.iterations=5
    bpy.ops.object.modifier_apply(modifier=smooth.name)
    return o

segment('Right upper arm',(.46,.0,1.75),(.67,-.20,1.33),.205,ivory)
ell('Right elbow bellows',(.67,-.20,1.33),(.205,.205,.18),ivory)
segment('Right forearm',(.67,-.20,1.33),(.55,-.57,1.22),.185,ivory)
ring('Right locking wrist cuff',(.54,-.60,1.22),.17,.035,ivory,axis=(-.12,-.36,-.25))
right=[ell('Right glove palm',(.53,-.69,1.01),(.165,.15,.105),glove_fabric)]
for i,length in enumerate([.17,.20,.19,.145]):
    x=.405+i*.075
    right.append(glove_segment('Resting padded finger',(x,-.735,1.00),(x,-.735-length,.95),.045,glove_fabric))
right.append(glove_segment('Right glove thumb',(.39,-.67,1.02),(.34,-.79,.97),.062,glove_fabric))
right_glove=merge_glove('Right EVA glove',right)
right_glove.location.z += .15
ell('Right glove back protective patch',(.53,-.69,1.255),(.115,.10,.012),glove_grip)

segment('Left upper arm',(-.46,0,1.75),(-.78,-.07,1.60),.205,ivory)
ell('Left elbow bellows',(-.78,-.07,1.60),(.205,.205,.18),ivory)
segment('Left raised forearm',(-.78,-.07,1.60),(-.96,-.12,1.98),.185,ivory)
ring('Raised cuff fabric',(-.97,-.12,1.98),.175,.042,ivory,axis=(-.2,0,1))
ring('Raised cuff locking ring',(-.98,-.12,2.015),.163,.022,seam,axis=(-.2,0,1))
# Reuse the resting glove's exact relaxed finger/palm shape for the raised hand.
bpy.context.view_layer.update()
mesh=right_glove.data.copy()
rotation=Matrix.Rotation(-math.pi/2,4,'X')
origin=Vector((.53,-.69,1.16))
for v in mesh.vertices:
    local=right_glove.matrix_world @ v.co-origin
    local.x *= -1
    v.co=rotation @ local
left_glove=bpy.data.objects.new('Left matching relaxed EVA glove',mesh)
bpy.context.collection.objects.link(left_glove); left_glove.location=(-.99,-.13,2.13); parts.append(left_glove)
# Flexible corrugated air tube: a thick fabric body with real ribs following
# the same evaluated centerline, and locking couplings at both endpoints.
c=bpy.data.curves.new('Life support air tube path','CURVE'); c.dimensions='3D'; c.bevel_depth=.047; c.bevel_resolution=4
s=c.splines.new('BEZIER'); s.bezier_points.add(4)
for p,co in zip(s.bezier_points,[(.32,.50,1.25),(.80,.32,1.12),(.90,-.04,.98),(.69,-.34,1.02),(.49,-.52,1.12)]):
    p.co=co; p.handle_left_type='AUTO'; p.handle_right_type='AUTO'
o=bpy.data.objects.new('Life support flexible air tube',c); bpy.context.collection.objects.link(o); o.data.materials.append(air_tube); parts.append(o)
bpy.context.view_layer.update()
samples=[]
for a,b in zip(s.bezier_points,s.bezier_points[1:]):
    samples.extend(interpolate_bezier(a.co,a.handle_right,b.handle_left,b.co,40)[:-1])
samples.append(s.bezier_points[-1].co.copy())
distance=0
next_rib=.03
for a,b in zip(samples,samples[1:]):
    length=(b-a).length
    while distance+length >= next_rib:
        center=a+(b-a)*((next_rib-distance)/length)
        ring('Air tube flexible rib',center,.048,.008,tube_rib,axis=b-a)
        next_rib += .025
    distance += length
for label,point,tangent in [('Backpack',samples[0],samples[1]-samples[0]),('Front',samples[-1],samples[-1]-samples[-2])]:
    ring(label+' air coupling gasket',point,.058,.017,seam,axis=tangent)
    ring(label+' air coupling lock',point,.069,.014,ivory,axis=tangent)
# Apollo helmet proportions: more compact than the original mascot bubble.
helmet_center=Vector((0,0,2.39))
for o in parts:
    if any(word in o.name.lower() for word in ['helmet inner','helmet thermal','visor','helmet stitched','helmet upper','helmet low','helmet hinge','helmet hood']):
        o.location=helmet_center+(o.location-helmet_center)*.84
        o.scale *= .84
# Named hierarchy keeps independent suit parts editable, with no fake skeletal animation.
root=bpy.data.objects.new('Seated cosmic explorer',None); bpy.context.collection.objects.link(root)
for o in parts:
    if o.parent is None: o.parent=root
# Object controls keep padded suit segments rigid and preserve their sewn children.
def control(name, pivot, parent):
    o=bpy.data.objects.new(name,None); bpy.context.collection.objects.link(o); o.location=pivot; o.parent=parent
    parts.append(o); return o

def reparent_preserving_world(o, parent):
    bpy.context.view_layer.update(); world=o.matrix_world.copy(); o.parent=parent; o.matrix_world=world

shoulder=control('Wave shoulder control',(-.46,0,1.75),root)
elbow=control('Wave elbow control',(0,0,0),shoulder)
bpy.context.view_layer.update()
elbow.matrix_world.translation=Vector((-.78,-.07,1.60))
wrist=control('Wave wrist control',(0,0,0),elbow)
bpy.context.view_layer.update()
wrist.matrix_world.translation=Vector((-.98,-.12,2.015))
for o in list(parts):
    if o.name=='Left upper arm': reparent_preserving_world(o,shoulder)
    elif o.name in ['Left elbow bellows','Left raised forearm']: reparent_preserving_world(o,elbow)
    elif o.name in ['Raised cuff fabric','Raised cuff locking ring','Left matching relaxed EVA glove']: reparent_preserving_world(o,wrist)
scene=bpy.context.scene; scene.name='WaveThenRest'; scene.render.fps=20; scene.frame_start=1; scene.frame_end=86
# Three gentle wrist waves through 3.0 seconds, then a 0.75-second arm release.
for frame in range(1,87):
    time=(frame-1)/20
    wave=math.sin(2*math.pi*time)*.22 if time<3 else 0
    # Smooth endpoints prevent a snap when the arm begins to lower.
    envelope=min(time/.20,1)*min(max((3-time)/.30,0),1)
    u=min(max((time-3)/.75,0),1); ease=u*u*(3-2*u)
    shoulder.rotation_euler=(0,-math.radians(65)*ease,0)
    elbow.rotation_euler=(0,-math.radians(55)*ease,0)
    wrist.rotation_euler=(0,wave*envelope,0)
    for o in [shoulder,elbow,wrist]: o.keyframe_insert(data_path='rotation_euler',frame=frame)
scene.frame_set(1)
scene=bpy.context.scene
scene.render.engine='CYCLES'; scene.cycles.samples=48; scene.cycles.use_denoising=True
scene.render.resolution_x=900; scene.render.resolution_y=1000; scene.render.resolution_percentage=100
scene.render.film_transparent=True
scene.render.use_persistent_data=True
scene.world.color=(.12,.12,.12)

def area(name,loc,power,color,size):
    d=bpy.data.lights.new(name,'AREA'); d.energy=power; d.color=color; d.shape='DISK'; d.size=size
    o=bpy.data.objects.new(name,d); bpy.context.collection.objects.link(o); o.location=loc
    o.rotation_euler=(Vector((0,0,1.3))-o.location).to_track_quat('-Z','Y').to_euler()
area('Softbox warm key',(-3,-4,6),650,(1,.96,.89),2.5)
area('Cyan edge',(3,1,4),450,(.62,.80,1),3)
area('Violet edge',(-3,2,3),380,(.78,.65,1),2.5)
area('Visor softbox',(1,-4,4),110,(.65,.77,1),2)
d=bpy.data.cameras.new('Hero portrait camera'); cam=bpy.data.objects.new('Hero portrait camera',d); bpy.context.collection.objects.link(cam)
cam.location=(2.2,-8,3.8); target=Vector((-.10,-.1,1.17)); cam.rotation_euler=(target-cam.location).to_track_quat('-Z','Y').to_euler()
d.type='ORTHO'; d.ortho_scale=3.9; scene.camera=cam
scene.view_settings.view_transform='AgX'
os.makedirs(os.path.join(ROOT,'assets/blender'),exist_ok=True)
bpy.ops.wm.save_as_mainfile(filepath=os.path.join(ROOT,'assets/blender/cosmic-astronaut.blend'))
bpy.ops.object.select_all(action='DESELECT')
for o in parts:
    o.select_set(True)
root.select_set(True)
bpy.context.view_layer.objects.active=rock
bpy.ops.export_scene.gltf(filepath=os.path.join(ROOT,'public/models/hero/cosmic-astronaut.glb'),export_format='GLB',use_selection=True,export_apply=True,export_yup=True,export_animations=True,export_animation_mode='SCENE',export_anim_scene_split_object=False,export_frame_range=True,export_force_sampling=True)
scene.render.image_settings.file_format='PNG'
scene.render.filepath=os.path.join(ROOT,'output/playwright/cosmic-astronaut/beauty.png')
bpy.ops.render.render(write_still=True)
if '--animate' in sys.argv:
    scene.render.resolution_x=360; scene.render.resolution_y=400; scene.cycles.samples=12
    frames=os.path.join(ROOT,'output/playwright/cosmic-astronaut/wave-frames'); os.makedirs(frames,exist_ok=True)
    for frame in range(1,87):
        scene.frame_set(frame)
        scene.render.filepath=os.path.join(frames,f'{frame:04d}.png')
        bpy.ops.render.render(write_still=True)
    scene.frame_set(1)
print('Completed cosmic astronaut source, WaveThenRest clip, and renders')
