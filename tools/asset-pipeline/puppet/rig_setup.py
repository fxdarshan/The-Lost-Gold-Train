import json
from place import *
S=json.load(open('sift_fit.json'))
auto=['hat','head','pelvis','hand_aim','revolver','hand_relaxed','boot_image_right','boot_image_left','holster','poncho_lower_fringe']
# manual: id -> (pivot on canvas, scale, rotation deg); pivots are the manifest's pivot_local_xy
MAN={
 'neck_connector':   ((548,338), 1.15, -4),
 'torso':            ((590,655), 1.42, 3),
 'arm_aim_upper':    ((495,345), .72, 30),
 'arm_aim_forearm':  ((445,470), .84, -2),
 'arm_relaxed_upper':((705,470), .76, -10),
 'arm_relaxed_forearm':((748,615), .70, -3),
 'thigh_image_left': ((530,860), 1.30, 21),
 'calf_image_left':  ((410,1100), .98, 7),
 'thigh_image_right':((652,860), 1.06, -5),
 'calf_image_right': ((655,1078), .95, 1),
 'poncho_back':      ((392,262), 3.15, -3),
 'poncho_right_tail':((720,465), 2.5, 5),
 'poncho_shoulder':  ((515,345), 1.72, -3),
}
ORDER=['poncho_ref_main','poncho_ref_tail','thigh_image_left','calf_image_left','boot_image_left',
 'thigh_image_right','calf_image_right','boot_image_right','arm_relaxed_upper','arm_relaxed_forearm','hand_relaxed',
 'torso','pelvis','holster','arm_aim_upper','head','neck_connector','poncho_ref_front','arm_aim_forearm','revolver','hand_aim','hat']
SHIFT={'hat':(4,-38)}
def placements(over=None):
    pl={k:[r[:] for r in S[k]['T']] for k in auto}
    for k,(dx,dy) in SHIFT.items(): pl[k][0][2]+=dx; pl[k][1][2]+=dy
    m=dict(MAN); m.update(over or {})
    for k,(pv,sc,rt) in m.items(): pl[k]=T_from(pv,sc,rt,P[k]['pivot_local_xy']).tolist()
    pl['poncho_ref_main']=pl['poncho_ref_tail']=pl['poncho_ref_front']=[[1,0,0],[0,1,0]]
    return pl
