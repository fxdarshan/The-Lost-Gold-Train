import json, numpy as np, cv2, sys
from PIL import Image, ImageDraw
M=json.load(open('manifest.json')); P={p['id']:p for p in M['parts']}
R=Image.open('reference.png').convert('RGBA'); W,H=R.size
def T_from(pv_canvas, scale, rot, pv_local):
    a=np.radians(rot); c,s=np.cos(a)*scale,np.sin(a)*scale
    lx,ly=pv_local; return np.array([[c,-s,pv_canvas[0]-(c*lx-s*ly)],[s,c,pv_canvas[1]-(s*lx+c*ly)]])
def compose(place, order, fade=0.0, grid=False, only=None):
    out=Image.new('RGBA',(W,H),(60,45,35,255))
    if fade: r=R.copy(); r.putalpha(r.getchannel('A').point(lambda v:int(v*fade))); out.alpha_composite(r)
    for pid in order:
        if pid not in place or (only and pid not in only): continue
        im=np.asarray(Image.open('parts/'+(P[pid]['file'].split('/')[-1] if pid in P else pid+'.png')))
        w=cv2.warpAffine(im,np.array(place[pid],dtype=np.float64),(W,H),flags=cv2.INTER_LINEAR,borderMode=cv2.BORDER_CONSTANT,borderValue=(0,0,0,0))
        out.alpha_composite(Image.fromarray(w))
    if grid:
        d=ImageDraw.Draw(out)
        for x in range(0,W,100): d.line((x,0,x,H),fill=(255,255,0,90)); d.text((x+2,2),str(x),fill=(255,255,0))
        for y in range(0,H,100): d.line((0,y,W,y),fill=(0,255,255,90)); d.text((2,y+2),str(y),fill=(0,255,255))
    return out
