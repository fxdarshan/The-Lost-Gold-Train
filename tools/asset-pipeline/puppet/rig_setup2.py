import json, numpy as np, cv2
from PIL import Image
M=json.load(open('manifest.json')); P={p['id']:p for p in M['parts']}; P2=json.load(open('parts2.json'))
S=json.load(open('sift_fit2.json'))
R=Image.open('reference.png').convert('RGBA'); W,H=R.size
def T_from(pv,sc,rt,pl):
    a=np.radians(rt); c,s=np.cos(a)*sc,np.sin(a)*sc
    return [[c,-s,pv[0]-(c*pl[0]-s*pl[1])],[s,c,pv[1]-(s*pl[0]+c*pl[1])]]
AUTO=['hat','head','torso','arm_aim_forearm','hand_aim','revolver','hand_relaxed']
# manual: pivot on the reference canvas, scale (for the new atlas part), rotation
MAN={
 'neck_connector':   ((548,330), 1.0, -4),
 'arm_aim_upper':    ((495,345), .72, 30),
 'arm_relaxed_upper':((705,470), .76, -10),
 'arm_relaxed_forearm':((748,615), .70, -3),
}
SHIFT={'hat':(6,-44)}
REF=['poncho_ref_main','poncho_ref_tail','poncho_ref_front','lowerbody_ref']
ORDER=['poncho_ref_main','poncho_ref_tail','arm_relaxed_upper','arm_relaxed_forearm','hand_relaxed',
 'torso','lowerbody_ref','neck_connector','head','poncho_ref_front','hat','arm_aim_forearm','revolver','hand_aim']
def fname(k): return 'parts/'+k+'.png' if k in REF else 'parts2/'+P[k]['file'].split('/')[-1]
def placements(over=None):
    pl={k:[r[:] for r in S[k]['T']] for k in AUTO}
    for k,(dx,dy) in SHIFT.items(): pl[k][0][2]+=dx; pl[k][1][2]+=dy
    m=dict(MAN); m.update(over or {})
    for k,(pv,sc,rt) in m.items(): pl[k]=T_from(pv,sc,rt,P2[k]['pivot'])
    for k in REF: pl[k]=[[1,0,0],[0,1,0]]
    return pl
def compose(pl,order=ORDER,bg=(60,45,35,255),fade=0):
    out=Image.new('RGBA',(W,H),bg)
    if fade: r=R.copy(); r.putalpha(r.getchannel('A').point(lambda v:int(v*fade))); out.alpha_composite(r)
    for k in order:
        im=np.asarray(Image.open(fname(k)))
        out.alpha_composite(Image.fromarray(cv2.warpAffine(im,np.array(pl[k],dtype=np.float64),(W,H),flags=cv2.INTER_LINEAR,borderValue=(0,0,0,0))))
    return out
def side(img,path):
    ref=Image.new('RGBA',(W,H),(60,45,35,255)); ref.alpha_composite(R)
    s=Image.new('RGB',(W*2,H)); s.paste(ref.convert('RGB'),(0,0)); s.paste(img.convert('RGB'),(W,0)); s.resize((W,H//2)).save(path)
