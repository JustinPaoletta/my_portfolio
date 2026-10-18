"""Focused delivery checks for the cosmic asset's buffers, PBR images and skin."""
import json, struct, math, hashlib
from pathlib import Path
ROOT=Path(__file__).resolve().parents[2]
p=ROOT/'public/models/hero/cosmic-astronaut.glb';blob=p.read_bytes()
magic,version,length=struct.unpack_from('<4sII',blob);assert magic==b'glTF' and version==2 and length==len(blob)
jlen,jtype=struct.unpack_from('<I4s',blob,12);assert jtype==b'JSON'
g=json.loads(blob[20:20+jlen]);offset=20+jlen;blen,btype=struct.unpack_from('<I4s',blob,offset);assert btype==b'BIN\x00'
binary=blob[offset+8:offset+8+blen]
formats={5120:'b',5121:'B',5122:'h',5123:'H',5125:'I',5126:'f'};dims={'SCALAR':1,'VEC2':2,'VEC3':3,'VEC4':4,'MAT4':16}
def values(index):
 a=g['accessors'][index];v=g['bufferViews'][a['bufferView']];fmt='<'+formats[a['componentType']]*dims[a['type']];size=struct.calcsize(fmt);stride=v.get('byteStride',size);start=v.get('byteOffset',0)+a.get('byteOffset',0)
 assert start+(a['count']-1)*stride+size<=len(binary)
 return [struct.unpack_from(fmt,binary,start+i*stride) for i in range(a['count'])]
triangles=0;vertices=0;weighted_vertices=0;max_weight_error=0
for mesh in g['meshes']:
 for prim in mesh['primitives']:
  attrs=prim['attributes'];positions=values(attrs['POSITION']);vertices+=len(positions)
  assert all(math.isfinite(c) for v in positions for c in v)
  indices=values(prim['indices']);assert len(indices)%3==0;triangles+=len(indices)//3
  assert max(v[0] for v in indices)<len(positions)
  for v in values(attrs['NORMAL']):assert all(math.isfinite(c) for c in v) and abs(math.sqrt(sum(c*c for c in v))-1)<.002
  if 'WEIGHTS_0' in attrs:
   weights=values(attrs['WEIGHTS_0']);weighted_vertices+=len(weights)
   for w in weights:
    assert min(w)>=-1e-6;max_weight_error=max(max_weight_error,abs(sum(w)-1))
   assert max_weight_error<1e-5
   joint_count=len(g['skins'][0]['joints']);assert all(0<=j<joint_count for row in values(attrs['JOINTS_0']) for j in row)
assert len(g['skins'])==1 and len(g['animations'])==1 and g['animations'][0]['name']=='WaveThenRest'
assert len(g['images'])==5 and all('bufferView' in i and 'uri' not in i for i in g['images'])
assert all(g['accessors'][sampler['input']]['min']==[0] for sampler in g['animations'][0]['samplers'])
assert vertices<160000 and triangles<180000
report={'sha256':hashlib.sha256(blob).hexdigest(),'bytes':len(blob),'triangles':triangles,'exported_vertices':vertices,'weighted_vertices':weighted_vertices,'max_weight_error':max_weight_error,'embedded_images':len(g['images']),'skins':len(g['skins']),'clip':'WaveThenRest','clip_start':0,'duration':max(g['accessors'][a['input']]['max'][0] for a in g['animations'][0]['samplers']),'checks':'Finite geometry, unit normals, bounded indices, normalized skin weights, valid joint indices, embedded PBR images, zero-based clip'}
report_path = ROOT/'output/playwright/cosmic-astronaut/production/glb-checks.json'
report_path.parent.mkdir(parents=True, exist_ok=True)
report_path.write_text(json.dumps(report,indent=2)+'\n')
print(json.dumps(report))
