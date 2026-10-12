"""Refine the preserved artist scene; Z-up/-Y-forward, meters, 20 fps.
The checkpoint is immutable input. Body/asteroid/resting arm remain untouched.
Usage: blender -b --factory-startup --python-exit-code 1 --python scripts/blender/refine_cosmic_astronaut.py
"""
import bpy, math, json, hashlib
from pathlib import Path
from mathutils import Vector, Matrix, Quaternion
from mathutils.geometry import interpolate_bezier

ROOT=Path(__file__).resolve().parents[2]
INPUT=ROOT/'assets/blender/checkpoints/cosmic-astronaut-pre-production.blend'
OUT=ROOT/'output/playwright/cosmic-astronaut/production'
OUT.mkdir(parents=True,exist_ok=True)
bpy.ops.wm.open_mainfile(filepath=str(INPUT))
s=bpy.context.scene;s.frame_set(1);bpy.context.view_layer.update()
root=bpy.data.objects['Seated cosmic explorer']
M=bpy.data.materials
ivory=M['Apollo off-white woven pressure suit']; enamel=M['Rigid helmet and equipment enamel']
thread=M['Off-white seam stitching']; fabric_seam=M['Warm fabric seam']; graphite=M['Graphite flexible joints']
gold=M['Apollo gold reflective visor']; trim=M['Anodized champagne hardware']; glove_mat=M['Apollo graphite glove fabric']

# Hash source data for the regions this refinement must preserve.
def mesh_hash(o):
    if o.type!='MESH':return None
    return hashlib.sha256(b''.join(__import__('struct').pack('<3f',*v.co) for v in o.data.vertices)).hexdigest()
preserved={name:mesh_hash(bpy.data.objects[name]) for name in ['Asteroid crater relief','Pressure torso','Seated pelvis','Right EVA glove','Right upper arm','Right forearm','Thigh pressure fabric','Thigh pressure fabric.001']}

def delete_tree(o):
    for c in list(o.children):delete_tree(c)
    bpy.data.objects.remove(o,do_unlink=True)

def remove_prefixes(prefixes):
    for name in list(bpy.data.objects.keys()):
        if any(name.startswith(p) for p in prefixes) and name in bpy.data.objects:
            delete_tree(bpy.data.objects[name])

def finish(o,name,mat,parent=root):
    o.name=name;o.parent=parent
    if hasattr(o.data,'materials'):o.data.materials.append(mat)
    if o.type=='MESH':
        for p in o.data.polygons:p.use_smooth=True
    return o

def mesh_obj(name,verts,faces,mat,parent=root):
    mesh=bpy.data.meshes.new(name);mesh.from_pydata(verts,[],faces);mesh.update()
    o=bpy.data.objects.new(name,mesh);bpy.context.collection.objects.link(o);return finish(o,name,mat,parent)

def box(name,loc,dimensions,mat,bevel=.04):
    bpy.ops.mesh.primitive_cube_add(size=1,location=loc);o=bpy.context.object;finish(o,name,mat)
    o.scale=dimensions;bpy.ops.object.transform_apply(location=False,rotation=False,scale=True)
    mod=o.modifiers.new('Rounded construction','BEVEL');mod.width=bevel;mod.segments=4
    o.modifiers.new('Panel normals','WEIGHTED_NORMAL');return o

def pipe(name,points,radius,mat,closed=False):
    d=bpy.data.curves.new(name,'CURVE');d.dimensions='3D';d.bevel_depth=radius;d.bevel_resolution=2
    spline=d.splines.new('POLY');spline.points.add(len(points)-1)
    for p,co in zip(spline.points,points):p.co=(*co,1)
    spline.use_cyclic_u=closed
    o=bpy.data.objects.new(name,d);bpy.context.collection.objects.link(o);return finish(o,name,mat)

def ring(name,loc,r,t,mat,axis=(0,0,1)):
    bpy.ops.mesh.primitive_torus_add(major_segments=40,minor_segments=8,major_radius=r,minor_radius=t,location=loc)
    o=finish(bpy.context.object,name,mat);o.rotation_euler=Vector(axis).to_track_quat('Z','Y').to_euler();return o

# HELMET: continuous rounded visor shell with an actual oval aperture, no brim.
remove_prefixes(['Helmet inner','Helmet thermal','Visor recessed','Reflective visor','Visor narrow','Helmet stitched','Helmet upper','Helmet low','Helmet hinge'])
C=Vector((0,.01,2.397));sx,sy,sz=.438,.376,.475;rx,rz=.326,.365
N=80;verts=[];faces=[]
# Front annulus then a rear hemisphere, all joined at the silhouette ring.
for row in range(21):
    u=row/20
    for i in range(N):
        a=2*math.pi*i/N;x=(rx+(sx-rx)*u)*math.cos(a);z=(rz+(sz-rz)*u)*math.sin(a)
        y=-sy*math.sqrt(max(0,1-(x/sx)**2-(z/sz)**2))
        verts.append(C+Vector((x,y,z)))
for row in range(1,17):
    u=(math.pi/2-.012)*row/16
    for i in range(N):
        a=2*math.pi*i/N;verts.append(C+Vector((sx*math.cos(u)*math.cos(a),sy*math.sin(u),sz*math.cos(u)*math.sin(a))))
for row in range(36):
    for i in range(N):
        j=(i+1)%N;faces.append((row*N+i,(row+1)*N+i,(row+1)*N+j,row*N+j))
verts.append(C+Vector((0,sy,0)));pole=len(verts)-1
for i in range(N):faces.append((36*N+i,pole,36*N+(i+1)%N))
hood=mesh_obj('Helmet rounded visor shell',verts,faces,ivory)
solid=hood.modifiers.new('Visor shell thickness','SOLIDIFY');solid.thickness=.012;solid.offset=-1
rim=[]
for i in range(N):
    a=2*math.pi*i/N;x=rx*math.cos(a);z=rz*math.sin(a);y=-sy*math.sqrt(max(0,1-(x/sx)**2-(z/sz)**2))
    rim.append(C+Vector((x,y-.008,z)))
pipe('Helmet oval pressure gasket',rim,.018,graphite,True)
pipe('Helmet ivory aperture binding',[p+Vector((0,-.005,0)) for p in rim],.010,enamel,True)
# Gold optical cap shares the exact aperture boundary, avoiding nested spheres.
vv=[];ff=[]
for row in range(19):
    r=.001+.999*row/18
    for i in range(N):
        a=2*math.pi*i/N;x=rx*r*math.cos(a);z=rz*r*math.sin(a)
        y=-sy*math.sqrt(max(0,1-(x/sx)**2-(z/sz)**2))-.075*math.sqrt(max(0,1-r*r))-.007
        vv.append(C+Vector((x,y,z)))
for row in range(18):
    for i in range(N):
        j=(i+1)%N;ff.append((row*N+i,(row+1)*N+i,(row+1)*N+j,row*N+j))
visor=mesh_obj('Helmet gold optical visor',vv,ff,gold)
gold.node_tree.nodes.get('Principled BSDF').inputs['Roughness'].default_value=.19
# Hinge hardware follows the shell rather than appearing as headphone blocks.
for side in [-1,1]:
    ring('Helmet flush visor hinge',(side*.399,-.108,2.397),.047,.009,enamel,axis=(side,0,0))
# Soften the previous prominent gold collar into a narrow mechanical lock.
collar=bpy.data.objects['Helmet locking collar'];collar.data.materials[0]=enamel

# BACKPACK: one thermal enclosure with recessed seams, defined mount pads.
remove_prefixes(['Life support backpack frame','Backpack thermal','Backpack upper','Backpack sewn'])
pack=box('PLSS thermal enclosure',(0,.57,1.64),(.98,.47,1.27),ivory,.10)
box('PLSS upper oxygen cover',(0,.58,2.235),(.75,.43,.19),ivory,.07)
for side in [-1,1]:
    box('PLSS shoulder mounting pad',(side*.24,.30,1.78),(.15,.16,.21),graphite,.035)
    box('PLSS lower mounting pad',(side*.24,.335,1.25),(.15,.10,.18),graphite,.03)
# Rear perimeter seam and service panel preserve recognizable equipment construction.
pipe('PLSS rear sewn perimeter',[(-.39,.811,1.12),(.39,.811,1.12),(.39,.811,2.16),(-.39,.811,2.16)],.008,fabric_seam,True)
box('PLSS rear service panel',(0,.817,1.65),(.58,.015,.36),enamel,.028)
for z in [1.53,1.61,1.69,1.77]:box('PLSS rear ventilation slit',(0,.83,z),(.43,.008,.023),graphite,.007)
for side in [-1,1]:
    pipe('PLSS side seam',[(side*.493,.42,1.14),(side*.493,.73,1.14),(side*.493,.73,2.13),(side*.493,.42,2.13)],.006,fabric_seam,True)

# BADGE: a curved sewn decal with the actual 13 stripes/50 stars, packed image.
remove_prefixes(['Chest American flag patch','Flag red stripe','Flag blue field','Flag embroidered star'])
mat=bpy.data.materials.new('Embroidered American flag');mat.use_nodes=True
p=mat.node_tree.nodes.get('Principled BSDF');p.inputs['Roughness'].default_value=.9;p.inputs['Specular IOR Level'].default_value=.16
image=bpy.data.images.load(str(ROOT/'assets/blender/textures/american-flag-badge.png'));image.pack()
tex=mat.node_tree.nodes.new('ShaderNodeTexImage');tex.image=image;mat.node_tree.links.new(tex.outputs['Color'],p.inputs['Base Color'])
torso=bpy.data.objects['Pressure torso'];bpy.context.view_layer.update();dg=bpy.context.evaluated_depsgraph_get();evaluated=torso.evaluated_get(dg)
inv=torso.matrix_world.inverted()
def cloth_surface(x,z,offset=.006):
    origin=inv@Vector((x,-1,z));direction=(inv.to_3x3()@Vector((0,1,0))).normalized()
    hit,loc,n,idx=evaluated.ray_cast(origin,direction)
    if not hit:raise RuntimeError('Badge is outside chest cloth')
    point=torso.matrix_world@loc;normal=(torso.matrix_world.to_3x3().inverted().transposed()@n).normalized()
    return point+normal*offset
bv=[];bf=[];uv=[];cols,rows=24,12
for row in range(rows+1):
    for col in range(cols+1):
        u,v=col/cols,row/rows;x=.17+(u-.5)*.234;z=1.755+(v-.5)*.1232
        bv.append(cloth_surface(x,z));uv.append((u,v))
for row in range(rows):
    for col in range(cols):
        i=row*(cols+1)+col;bf.append((i,i+1,i+cols+2,i+cols+1))
badge=mesh_obj('Chest sewn American flag badge',bv,bf,mat)
layer=badge.data.uv_layers.new(name='Badge UV')
for poly in badge.data.polygons:
    for loop in poly.loop_indices:layer.data[loop].uv=uv[badge.data.loops[loop].vertex_index]
# Thin textile backing and a closed embroidered border; no floating thick plate.
solid=badge.modifiers.new('Textile badge backing','SOLIDIFY');solid.thickness=.001
border=[]
for i in range(cols+1):border.append(cloth_surface(.17+(i/cols-.5)*.234,1.755-.0616,.009))
for i in range(1,rows+1):border.append(cloth_surface(.287,1.755+(i/rows-.5)*.1232,.009))
for i in range(1,cols+1):border.append(cloth_surface(.287-i/cols*.234,1.8166,.009))
for i in range(1,rows):border.append(cloth_surface(.053,1.8166-i/rows*.1232,.009))
pipe('Flag badge stitched border',border,.0025,thread,True)

# AIR TUBE: one corrugated mesh, natural gravity bend, actual end sockets.
remove_prefixes(['Life support flexible air tube','Air tube flexible rib','Backpack air coupling','Front air coupling'])
points=[Vector(v) for v in [( .488,.52,1.34),(.75,.39,1.20),(.80,.13,1.045),(.65,-.115,1.025),(.40,-.25,1.07)]]
curve=bpy.data.curves.new('Air tube centerline','CURVE');curve.dimensions='3D'
sp=curve.splines.new('BEZIER');sp.bezier_points.add(4)
for p,co in zip(sp.bezier_points,points):p.co=co;p.handle_left_type='AUTO';p.handle_right_type='AUTO'
o=bpy.data.objects.new('Air tube editable centerline',curve);bpy.context.collection.objects.link(o);o.parent=root;o.hide_render=True
bpy.context.view_layer.update();samples=[]
for a,b in zip(sp.bezier_points,sp.bezier_points[1:]):samples.extend(interpolate_bezier(a.co,a.handle_right,b.handle_left,b.co,64)[:-1])
samples.append(points[-1]);tv=[];tf=[];distance=0
for i,center in enumerate(samples):
    tangent=(samples[min(i+1,len(samples)-1)]-samples[max(0,i-1)]).normalized()
    normal=tangent.cross(Vector((0,0,1))).normalized();binormal=tangent.cross(normal).normalized()
    if i:distance+=(center-samples[i-1]).length
    radius=.033+.004*(.5+.5*math.cos(2*math.pi*distance/.019))
    for k in range(20):
        a=2*math.pi*k/20;tv.append(center+radius*(normal*math.cos(a)+binormal*math.sin(a)))
for i in range(len(samples)-1):
    for k in range(20):j=(k+1)%20;tf.append((i*20+k,i*20+j,(i+1)*20+j,(i+1)*20+k))
tf.extend([tuple(reversed(range(20))),tuple((len(samples)-1)*20+k for k in range(20))])
tube=mesh_obj('PLSS corrugated air tube',tv,tf,M['Flexible woven air tube'])
for label,point,tangent in [('Backpack',points[0],samples[1]-samples[0]),('Waist',points[-1],samples[-1]-samples[-2])]:
    ring(label+' sealed air socket',point,.047,.014,graphite,axis=tangent)
    ring(label+' air tube locking nut',point,.052,.009,enamel,axis=tangent)

# ARM: continuous deforming sleeve in a mirrored lap rest pose, with 3-bone rig.
remove_prefixes(['Wave shoulder control','Wave elbow control','Wave wrist control','Left upper arm','Left elbow bellows','Left raised forearm','Raised cuff','Left matching relaxed EVA glove'])
s.frame_set(1);bpy.context.view_layer.update()
S=Vector((-.46,0,1.75));Erest=Vector((-.67,-.20,1.33));Wrest=Vector((-.54,-.60,1.22));Wwave=Vector((-1.0,-.25,2.105))
L1=(Erest-S).length;L2=(Wrest-Erest).length

def mirror_mesh(source,name):
    bpy.context.view_layer.update();dg=bpy.context.evaluated_depsgraph_get();ev=source.evaluated_get(dg)
    mesh=bpy.data.meshes.new_from_object(ev,preserve_all_data_layers=True,depsgraph=dg)
    for v in mesh.vertices:
        v.co=source.matrix_world@v.co;v.co.x*=-1
    for p in mesh.polygons:p.flip()
    o=bpy.data.objects.new(name,mesh);bpy.context.collection.objects.link(o);o.parent=root;return o
pieces=[mirror_mesh(bpy.data.objects[name],'Left sleeve section') for name in ['Right upper arm','Right elbow bellows','Right forearm']]
bpy.ops.object.select_all(action='DESELECT')
for o in pieces:o.select_set(True)
bpy.context.view_layer.objects.active=pieces[0];bpy.ops.object.join();sleeve=bpy.context.object;sleeve.name='Left continuous pressure sleeve'
rem=sleeve.modifiers.new('Continuous elbow fabric','REMESH');rem.mode='VOXEL';rem.voxel_size=.011;rem.use_smooth_shade=True;bpy.ops.object.modifier_apply(modifier=rem.name)
smooth=sleeve.modifiers.new('Soft elbow joins','SMOOTH');smooth.factor=.45;smooth.iterations=3;bpy.ops.object.modifier_apply(modifier=smooth.name)
# Keep editable smooth topology and a compact deformation mesh.
dec=sleeve.modifiers.new('Sleeve topology reduction','DECIMATE');dec.ratio=.6;bpy.ops.object.modifier_apply(modifier=dec.name)
for p in sleeve.data.polygons:p.use_smooth=True
sleeve.data.materials.clear();sleeve.data.materials.append(ivory)
# Mesh UVs for downstream atlas bake.
bpy.context.view_layer.objects.active=sleeve;bpy.ops.object.mode_set(mode='EDIT');bpy.ops.mesh.select_all(action='SELECT');bpy.ops.uv.smart_project(island_margin=.01);bpy.ops.object.mode_set(mode='OBJECT')
glove=mirror_mesh(bpy.data.objects['Right EVA glove'],'Left EVA lap glove')
patch=mirror_mesh(bpy.data.objects['Right glove back protective patch'],'Left glove sewn reinforcement')
cuff=mirror_mesh(bpy.data.objects['Right locking wrist cuff'],'Left pressure wrist cuff')

# Armature/world identity: matrices below are explicitly in armature space.
data=bpy.data.armatures.new('Cosmic explorer arm rig');rig=bpy.data.objects.new('Cosmic explorer arm rig',data);bpy.context.collection.objects.link(rig);rig.parent=root
bpy.ops.object.select_all(action='DESELECT');rig.select_set(True);bpy.context.view_layer.objects.active=rig;bpy.ops.object.mode_set(mode='EDIT')
def aim(head,tail):
    y=(tail-head).normalized();ref=Vector((0,-1,0));x=(ref-y*ref.dot(y)).normalized();z=x.cross(y).normalized()
    return Matrix(((x.x,y.x,z.x,head.x),(x.y,y.y,z.y,head.y),(x.z,y.z,z.z,head.z),(0,0,0,1)))
Handtail=Wrest+Vector((0,-.23,-.055))
for name,head,tail,parent in [('UpperArm.L',S,Erest,None),('Forearm.L',Erest,Wrest,'UpperArm.L'),('Hand.L',Wrest,Handtail,'Forearm.L')]:
    b=data.edit_bones.new(name);b.head=head;b.tail=tail;b.align_roll(aim(head,tail).col[2].xyz)
    if parent:b.parent=data.edit_bones[parent];b.use_connect=True
bpy.ops.object.mode_set(mode='OBJECT')

def bind(o,hand=False):
    world=o.matrix_world.copy();o.parent=rig;o.matrix_world=world
    mod=o.modifiers.new('Arm deform','ARMATURE');mod.object=rig
    groups={name:o.vertex_groups.new(name=name) for name in ['UpperArm.L','Forearm.L','Hand.L']}
    if hand:groups['Hand.L'].add(range(len(o.data.vertices)),1,'REPLACE');return
    def distance(p,a,b):t=max(0,min(1,(p-a).dot(b-a)/(b-a).length_squared));return (p-(a+(b-a)*t)).length
    for v in o.data.vertices:
        a=distance(v.co,S,Erest);b=distance(v.co,Erest,Wrest)
        # Smooth cross-fade at the elbow instead of a detached rigid elbow cap.
        w=1/(1+math.exp(max(-50,min(50,(a-b)/.027))))
        groups['UpperArm.L'].add([v.index],w,'REPLACE');groups['Forearm.L'].add([v.index],1-w,'REPLACE')
bind(sleeve)
for o in [glove,patch,cuff]:bind(o,True)

# Lap target and pole are retained as visible authoring controls, not exported behavior.
lap=bpy.data.objects.new('Lap hand contact target',None);bpy.context.collection.objects.link(lap);lap.parent=root;lap.location=Wrest;lap.empty_display_type='SPHERE';lap.empty_display_size=.055
pole=bpy.data.objects.new('Elbow outside guide',None);bpy.context.collection.objects.link(pole);pole.parent=root;pole.location=(-1,-.2,1.4);pole.empty_display_size=.07
rest_hand_rotation=data.bones['Hand.L'].matrix_local.to_quaternion()
rig.animation_data_clear();s.render.fps=20;s.frame_start=1;s.frame_end=96
max_contact=0;pose_report=[];max_pose_error=0;max_scale_error=0
for frame in range(1,97):
    t=(frame-1)/20;u=max(0,min(1,(t-3)/1.0));ease=u*u*u*(u*(u*6-15)+10)
    W=Wwave.lerp(Wrest,ease)+Vector((-.10,-.14,.05))*math.sin(math.pi*ease)
    direction=(W-S).normalized();distance=(W-S).length
    a=(L1*L1-L2*L2+distance*distance)/(2*distance);h=math.sqrt(max(0,L1*L1-a*a))
    rest_pole=Erest-S-direction*(Erest-S).dot(direction)
    start_pole=Vector((-1,-.1,-.25));p=start_pole.lerp(rest_pole,ease);p=(p-direction*p.dot(direction)).normalized()
    E=S+direction*a+p*h
    if ease==1:E=Erest
    wave=math.sin(2*math.pi*t)*.28 if t<3 else 0
    envelope=min(t/.20,1)*min(max((3-t)/.30,0),1)
    raised=Quaternion((1,0,0),-math.pi/2);orient=raised.slerp(Quaternion(),ease)
    orient=Quaternion((0,1,0),wave*envelope)@orient
    matrices={'UpperArm.L':aim(S,E),'Forearm.L':aim(E,W),'Hand.L':Matrix.LocRotScale(W,orient@rest_hand_rotation,Vector((1,1,1)))}
    for name,matrix in matrices.items():
        pb=rig.pose.bones[name];pb.rotation_mode='QUATERNION';pb.matrix=rig.matrix_world.inverted()@matrix
        bpy.context.view_layer.update()
        for path in ['location','rotation_quaternion','scale']:pb.keyframe_insert(data_path=path,frame=frame)
    bpy.context.view_layer.update()
    actual=rig.matrix_world@rig.pose.bones['Hand.L'].head
    max_pose_error=max(max_pose_error,(actual-W).length)
    max_scale_error=max(max_scale_error,max(abs(c.length-1) for name in matrices for c in rig.pose.bones[name].matrix.to_3x3().col))
    if t>=4:max_contact=max(max_contact,(actual-Wrest).length)
    if frame in [1,6,16,26,61,66,71,76,81,96]:pose_report.append({'frame':frame,'wrist':[float(v) for v in W],'elbow':[float(v) for v in E]})
rig.animation_data.action.name='WaveThenRest'
s.frame_set(81);bpy.context.view_layer.update()
dg=bpy.context.evaluated_depsgraph_get();lv=glove.evaluated_get(dg).to_mesh();rv=bpy.data.objects['Right EVA glove'].evaluated_get(dg).to_mesh()
mirror_error=0
for a,b in zip(lv.vertices,rv.vertices):
    expected=bpy.data.objects['Right EVA glove'].matrix_world@b.co;expected.x*=-1
    mirror_error=max(mirror_error,(glove.matrix_world@a.co-expected).length)
glove.evaluated_get(dg).to_mesh_clear();bpy.data.objects['Right EVA glove'].evaluated_get(dg).to_mesh_clear()
assert max_pose_error<2e-5 and max_contact<2e-5 and mirror_error<2e-5 and max_scale_error<2e-5
s.frame_set(1);bpy.context.view_layer.update()
# Source remains editable and procedural. Delivery rendering/baking is a separate step.
s.render.engine='CYCLES';s.cycles.samples=48;s.cycles.use_denoising=True;s.render.use_persistent_data=True
s.render.resolution_x=900;s.render.resolution_y=1000;s.render.resolution_percentage=100;s.render.image_settings.file_format='PNG'
assert preserved=={name:mesh_hash(bpy.data.objects[name]) for name in preserved}
report={'input_sha256':hashlib.sha256(INPUT.read_bytes()).hexdigest(),'blender':bpy.app.version_string,'spaces':'Z-up world, identity armature world; pose matrices converted to armature space','clip':'WaveThenRest','fps':20,'frames':96,'wave_seconds':3,'lower_seconds':1,'lap_contact_error_m':max_contact,'hand_mirror_error_m':mirror_error,'pose_target_error_m':max_pose_error,'scale_error':max_scale_error,'preserved_geometry':preserved,'pose_samples':pose_report,'flag':{'stripes':13,'stars':50,'image_packed':image.packed_file is not None}}
(OUT/'source-checks.json').write_text(json.dumps(report,indent=2)+'\n')
bpy.ops.wm.save_as_mainfile(filepath=str(ROOT/'assets/blender/cosmic-astronaut.blend'))
for frame,label in [(1,'wave-start'),(71,'arm-mid'),(81,'lap-rest')]:
    s.frame_set(frame);s.render.filepath=str(OUT/(label+'.png'));bpy.ops.render.render(write_still=True)
s.frame_set(81)
print('Production refinement source and review renders complete')
