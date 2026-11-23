"""Turn Darshan's green-screen logo video into a seamless looping logo sheet for the game.

  python3 logo_from_video.py FRAMES_DIR START END [--fps 12] [--fade 24] [--width 640]
    FRAMES_DIR  PNG frames of the clip (ffmpeg -i clip.mp4 DIR/f%04d.png)
    START, END  source frames of the loop (the calm part after any intro blast)

The loop is frames [START, END); its last FADE frames are cross-dissolved with the frames just before START, so the
last frame flows into the first with no break (the smoke drifts on continuously). Green is keyed out (soft edge,
spill removed), the result is cropped to the logo's area over the whole loop, resampled to --fps and written as
assets/images/ui/ui_logo_anim.webp (a sheet) plus the measurements the game needs to fit it like the still logo.
"""
import sys, os, json, argparse
import numpy as np, cv2
from PIL import Image

ap = argparse.ArgumentParser(); ap.add_argument('dir'); ap.add_argument('start', type=int); ap.add_argument('end', type=int)
ap.add_argument('--fps', type=float, default=12); ap.add_argument('--src-fps', type=float, default=24)
ap.add_argument('--fade', type=int, default=24); ap.add_argument('--width', type=int, default=640)
a = ap.parse_args()
ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..')
fs = sorted(f for f in os.listdir(a.dir) if f.endswith('.png'))
rd = lambda i: cv2.cvtColor(cv2.imread(os.path.join(a.dir, fs[i])), cv2.COLOR_BGR2RGB).astype(np.float32)

S, E, K = a.start, a.end, a.fade
frames = []
for i in range(S, E):
    f = rd(i)
    j = i - E + K                                    # position inside the closing dissolve
    if j >= 0:
        u = (j + 1) / (K + 1); u = u * u * (3 - 2 * u)
        f = f * (1 - u) + rd(S - K + j) * u          # ends sounding like the frame just before START
    frames.append(f)

def key(f):
    r, g, b = f[..., 0], f[..., 1], f[..., 2]; mx = np.maximum(r, b); spill = g - mx
    al = 1 - np.clip((spill - 25) / (110 - 25), 0, 1)
    al = cv2.GaussianBlur(al, (3, 3), 0)
    return np.dstack([r, np.minimum(g, mx), b, al * 255]).clip(0, 255).astype(np.uint8)

# resample to the sheet fps (loop length kept exact)
n_src = len(frames); n = max(2, round(n_src / a.src_fps * a.fps))
pick = [frames[min(n_src - 1, round(k * n_src / n))] for k in range(n)]
keyed = [key(f) for f in pick]
A = np.max([k[..., 3] for k in keyed], axis=0)
ys, xs = np.where(A > 10); pad = 6
x0, x1, y0, y1 = max(0, xs.min() - pad), xs.max() + pad, max(0, ys.min() - pad), ys.max() + pad
crop = [k[y0:y1, x0:x1] for k in keyed]
cw = a.width; ch = round((y1 - y0) * cw / (x1 - x0)); cw16, ch16 = (cw + 15) // 16 * 16, (ch + 15) // 16 * 16
cols = 8; rows = (n + cols - 1) // cols
sheet = Image.new('RGBA', (cw16 * cols, ch16 * rows), (0, 0, 0, 0))
for i, c in enumerate(crop):
    sheet.paste(Image.fromarray(c).resize((cw, ch), Image.LANCZOS), ((i % cols) * cw16, (i // cols) * ch16))
out = os.path.join(ROOT, 'assets/images/ui/ui_logo_anim.webp'); sheet.save(out, 'WEBP', quality=88, method=6)
# fit info: the sign's width (columns opaque in the lower 55% of frame 0) and its bottom, in cell pixels
f0 = np.asarray(Image.fromarray(crop[0]).resize((cw, ch), Image.LANCZOS))[..., 3] > 128
low = f0[int(ch * .45):]; colsOn = np.where(low.any(0))[0]; rowsOn = np.where(f0.any(1))[0]
info = {'cols': cols, 'rows': rows, 'frames': n, 'fps': a.fps, 'cell': [cw16, ch16],
        'body': [int(colsOn.min()), int(colsOn.max()) + 1], 'bottom': int(rowsOn.max()) + 1, 'kb': os.path.getsize(out) // 1024}
print(json.dumps(info))
