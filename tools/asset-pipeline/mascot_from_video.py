"""Turn the three green-screen Outlaw videos (idle 1, idle 2, win) into mascot sprite sheets.

Usage: python3 mascot_from_video.py IDLE1_DIR IDLE2_DIR WIN_DIR
  each DIR holds the PNG frames of one clip (ffmpeg -i clip.mp4 DIR/f%04d.png)
Writes assets/images/characters/char_outlaw_{idle1,idle2,win}.webp and prints the manifest entries.

- frames are sampled evenly in time (natural timing) at FPS per clip
- the green is keyed out (soft edge, green spill removed; grey smoke over green becomes see-through grey)
- every clip ends on idle 1's first frame and idle 2 / win also start from it (optical-flow morph), so any clip
  can follow any other without a pop
- the crop is the same for all clips: CROP in source pixels; the feet line and body centre are printed for config
"""
import sys, os, json
import numpy as np, cv2
from PIL import Image

CROP = (0, 100, 640, 1156)      # x0, y0, x1, y1 in the 768 x 1344 source
SCALE = .5
FPS = {'idle1': 15, 'idle2': 15, 'win': 15}     # the game plays at 30 fps and blends each frame into the next
COLS = {'idle1': 14, 'idle2': 14, 'win': 20}
WIDTH = {'idle1': 560, 'idle2': 560, 'win': 640}   # source px from the left: the idles never reach the right side
ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..')

def load(d):
    fs = sorted(f for f in os.listdir(d) if f.endswith('.png'))
    x0, y0, x1, y1 = CROP
    return [cv2.cvtColor(cv2.imread(os.path.join(d, f)), cv2.COLOR_BGR2RGB)[y0:y1, x0:x1] for f in fs]

def morph(fa, fb, u):
    """frame between fa (u=0) and fb (u=1) along the optical flow"""
    ga, gb = (cv2.cvtColor(f, cv2.COLOR_RGB2GRAY) for f in (fa, fb))
    fab = cv2.calcOpticalFlowFarneback(ga, gb, None, .5, 4, 31, 4, 7, 1.5, 0)
    fba = cv2.calcOpticalFlowFarneback(gb, ga, None, .5, 4, 31, 4, 7, 1.5, 0)
    h, w = ga.shape; Y, X = np.mgrid[0:h, 0:w].astype(np.float32)
    wa = cv2.remap(fa, X + u * fba[..., 0], Y + u * fba[..., 1], cv2.INTER_LINEAR, borderMode=cv2.BORDER_REPLICATE)
    wb = cv2.remap(fb, X + (1 - u) * fab[..., 0], Y + (1 - u) * fab[..., 1], cv2.INTER_LINEAR, borderMode=cv2.BORDER_REPLICATE)
    return ((1 - u) * wa.astype(np.float32) + u * wb.astype(np.float32)).astype(np.uint8)

def key(f):
    r, g, b = [f[..., i].astype(np.float32) for i in range(3)]
    mx = np.maximum(r, b); spill = g - mx                         # how much greener than the other channels
    a = 1 - np.clip((spill - 25) / (110 - 25), 0, 1)              # pure green screen -> 0, anything else -> 1
    a = cv2.GaussianBlur(a, (3, 3), 0)
    h, w = a.shape; E = 28.0                                      # soft fade at the crop's left, right and top edges
    xs = np.minimum(np.arange(w), w - 1 - np.arange(w)) / E; ys = np.arange(h) / E
    a = a * np.clip(xs, 0, 1)[None, :] * np.clip(ys, 0, 1)[:, None]
    g2 = np.minimum(g, mx)                                         # despill: green no higher than red/blue
    out = np.dstack([r, g2, b]).clip(0, 255).astype(np.uint8)
    return np.dstack([out, (a * 255).astype(np.uint8)])

def build(name, src, anchor, head):
    n = len(src); dur = n / 24.0; m = max(2, round(dur * FPS[name]))
    idx = [min(n - 1, round(i * (n - 1) / (m - 1))) for i in range(m)]
    fr = [src[i][:, :WIDTH[name]] for i in idx][:-1]
    anchor = anchor[:, :WIDTH[name]]                              # the last sample is replaced by the loop wrap
    K = max(4, round(FPS[name] * .5))                             # half a second into the anchor pose
    for j in range(K):
        u = (j + 1) / (K + 1); u = u * u * (3 - 2 * u); fr[-K + j] = morph(fr[-K + j], anchor, u)
    if head:                                                       # start exactly on the anchor pose
        H = 4
        for j in range(H):
            u = j / H; u = u * u * (3 - 2 * u); fr[j] = morph(anchor, fr[j], u) if j else anchor.copy()
    cols = COLS[name]; rows = (len(fr) + cols - 1) // cols
    h, w = fr[0].shape[:2]; tw, th = round(w * SCALE), round(h * SCALE)
    cw, ch = (tw + 15) // 16 * 16, (th + 15) // 16 * 16
    sheet = Image.new('RGBA', (cw * cols, ch * rows), (0, 0, 0, 0))
    for i, f in enumerate(fr):
        im = Image.fromarray(key(f)).resize((tw, th), Image.LANCZOS)
        sheet.paste(im, ((i % cols) * cw, (i // cols) * ch + (ch - th)))     # left and bottom aligned: same feet point in every clip
    out = os.path.join(ROOT, 'assets/images/characters/char_outlaw_%s.webp' % name)
    sheet.save(out, 'WEBP', quality=84, method=6)
    print(json.dumps({'key': 'char_outlaw_' + name, 'cols': cols, 'rows': rows, 'frames': len(fr), 'fps': FPS[name], 'cell': [cw, ch], 'size_kb': os.path.getsize(out) // 1024}))
    return fr

idle1 = load(sys.argv[1]); anchor = idle1[0]
build('idle1', idle1, anchor, False); del idle1
build('idle2', load(sys.argv[2]), anchor, True)
build('win', load(sys.argv[3]), anchor, True)
print('scale', SCALE, 'crop', CROP, '-> feet line at source y 1145 =', round((1145 - CROP[1]) * SCALE), 'px in the cell; body centre x ~270 =', round((270 - CROP[0]) * SCALE))
