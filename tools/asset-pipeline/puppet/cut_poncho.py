import numpy as np, cv2
from PIL import Image
from scipy import ndimage
from rig_setup import *
def cut():
    pl=placements()
    excl_parts=['head','hat','hand_aim','hand_relaxed','holster','pelvis','thigh_image_left','calf_image_left','boot_image_left','thigh_image_right','calf_image_right','boot_image_right','revolver']
    U=np.zeros((H,W),np.float32)
    for k in excl_parts:
        im=np.asarray(Image.open('parts/'+P[k]['file'].split('/')[-1]))
        U=np.maximum(U,cv2.warpAffine(im[...,3],np.array(pl[k]),(W,H)).astype(np.float32))
    Rf=np.asarray(Image.open('reference.png').convert('RGBA')).astype(np.int16); a=Rf[...,3]; r,g,b=Rf[...,0],Rf[...,1],Rf[...,2]
    yy,xx=np.mgrid[0:H,0:W]
    cand=(a>100)&~ndimage.binary_erosion(U>128,iterations=4)&(yy>212)&(r>g*1.15)&(r>45)
    lab,n=ndimage.label(cand); sizes=ndimage.sum(np.ones_like(lab),lab,range(1,n+1))
    cloth=np.isin(lab,[i+1 for i,s in enumerate(sizes) if s>1500])
    # cream zigzag/fringe pattern enclosed by the cloth
    cloth=ndimage.binary_closing(cloth,iterations=4)&(a>100)
    alpha=ndimage.gaussian_filter(cloth.astype(np.float32)*255,0.6)
    out=Rf.copy(); out[...,3]=np.minimum(a,alpha).astype(np.int16)
    right=(xx>660)&(yy>430)
    main=out.copy(); main[...,3]=np.where(right,0,main[...,3])
    tail=out.copy(); tail[...,3]=np.where(right,tail[...,3],0)
    for nm,arr in [('poncho_ref_main',main),('poncho_ref_tail',tail)]: Image.fromarray(arr.astype(np.uint8)).save(f'parts/{nm}.png')
    return main,tail
if __name__=='__main__':
    main,tail=cut()
    v=Image.new('RGBA',(W,H),(30,60,30,255)); v.alpha_composite(Image.fromarray(main.astype(np.uint8))); v.alpha_composite(Image.fromarray(tail.astype(np.uint8)))
    v.convert('RGB').resize((W//2,H//2)).save('/tmp/poncho_cut.png')
