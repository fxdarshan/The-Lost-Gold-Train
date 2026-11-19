import numpy as np, cv2
from PIL import Image
from scipy import ndimage
N=150; OUT=45; CW,CH=320,272; TW=320; TH=round(866/1045*320)
raw=[cv2.cvtColor(cv2.imread('f%04d.png'%i),cv2.COLOR_BGR2RGB)[0:866,15:1060] for i in range(1,N+1)]
small=[cv2.resize(f,(262,217)).astype(np.float32) for f in raw]
# motion between consecutive source frames (duplicates from the generator's frame-rate conversion count as ~0)
step=np.array([np.abs(small[i]-small[i-1]).mean() for i in range(1,N)])
# sample by a mix of motion (smooth: same visual change per frame) and time (keeps holds feeling held)
arc=np.concatenate([[0],np.cumsum(step)]); arc/=arc[-1]; tim=np.linspace(0,1,N)
mix=.6*arc+.4*tim
# OUT frames cover source 0 .. N-1 and the loop wraps back to 0
targets=np.linspace(0,1,OUT,endpoint=True)
idx=[int(np.argmin(np.abs(mix-t))) for t in targets]
print('picked',idx)
# continuous position for sub-frame blending is not used: pick nearest real frames (no ghosting)
frames=[raw[i].copy() for i in idx]
# close the loop: morph the last K frames toward frame 0 with dense optical flow
K=7; f0=raw[0]
g0=cv2.cvtColor(f0,cv2.COLOR_RGB2GRAY)
for j in range(K):
    u=(j+1)/(K+1); u=u*u*(3-2*u)
    fi=frames[OUT-K+j]; gi=cv2.cvtColor(fi,cv2.COLOR_RGB2GRAY)
    fl_i0=cv2.calcOpticalFlowFarneback(gi,g0,None,.5,4,25,4,7,1.5,0)   # i -> 0
    fl_0i=cv2.calcOpticalFlowFarneback(g0,gi,None,.5,4,25,4,7,1.5,0)   # 0 -> i
    h,w=gi.shape; X,Y=np.meshgrid(np.arange(w),np.arange(h)); X=X.astype(np.float32); Y=Y.astype(np.float32)
    wi=cv2.remap(fi,X-u*fl_0i[...,0]*0+ -u*fl_i0[...,0]*0 + (X*0) + 0*X + X*0 + 0, Y, cv2.INTER_LINEAR) if False else None
    # backward warping: sample frame i at x + u*flow(x)_{?}; approximate with flows evaluated at the target grid
    wi=cv2.remap(fi,(X+u*fl_0i[...,0]).astype(np.float32),(Y+u*fl_0i[...,1]).astype(np.float32),cv2.INTER_LINEAR,borderMode=cv2.BORDER_REPLICATE)
    w0=cv2.remap(f0,(X+(1-u)*fl_i0[...,0]).astype(np.float32),(Y+(1-u)*fl_i0[...,1]).astype(np.float32),cv2.INTER_LINEAR,borderMode=cv2.BORDER_REPLICATE)
    frames[OUT-K+j]=((1-u)*wi.astype(np.float32)+u*w0.astype(np.float32)).astype(np.uint8)
# white outside the rounded tile -> transparent (shared mask from frame 0: the tile frame never moves)
nw=(f0.min(-1)>232)
lab,n=ndimage.label(nw); border=set(np.unique(np.r_[lab[0],lab[-1],lab[:,0],lab[:,-1]]))-{0}
alpha=np.where(np.isin(lab,list(border)),0,255).astype(np.float32); alpha=ndimage.gaussian_filter(alpha,1.0)
sheet=Image.new('RGBA',(CW*9,CH*5),(0,0,0,0)); out=[]
for i,f in enumerate(frames):
    im=Image.fromarray(np.dstack([f,alpha.astype(np.uint8)])).resize((TW,TH),Image.LANCZOS)
    cell=Image.new('RGBA',(CW,CH),(0,0,0,0)); cell.paste(im,(0,(CH-TH)//2)); out.append(cell)
    sheet.paste(cell,((i%9)*CW,(i//9)*CH))
sheet.save('/home/claude/the-lost-gold-train/assets/images/anims/sym_00_win.webp','WEBP',quality=88,method=6)
out[0].save('/home/claude/the-lost-gold-train/art/symbols/sym_00_idle.png')
bg=[Image.new('RGBA',(CW,CH),(40,28,20,255)) for _ in out]
for b,c in zip(bg,out): b.alpha_composite(c)
bg=[b.convert('RGB') for b in bg]
bg[0].save('/tmp/outlaw_symbol_loop.gif',save_all=True,append_images=(bg[1:])*1,duration=33,loop=0)
small2=[np.asarray(b).astype(np.float32) for b in bg]
st=[np.abs(small2[i]-small2[i-1]).mean() for i in range(1,OUT)]+[np.abs(small2[0]-small2[-1]).mean()]
print('steps max %.1f median %.1f wrap %.1f'%(max(st),np.median(st),st[-1]))
