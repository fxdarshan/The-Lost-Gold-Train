"""Turn an image-to-video clip of a symbol into a seamless win-animation sheet for the game.

Usage: python3 anim_from_video2.py FRAMES_DIR KEY MODE [--frames 75] [--cols 10]
  FRAMES_DIR  folder of PNG frames (ffmpeg -i clip.mp4 DIR/f%04d.png)
  KEY         asset key, e.g. sym_01 (writes assets/images/anims/KEY_win.webp and the idle art KEY_idle)
  MODE        tile  : a tile on a white background; the tile is cut out with one mask from the first frame
              panel : the clip starts on a white background, then the generator fills it with a square panel;
                      the clip starts where the panel is in, and the frame gets a rounded mask, a dark rim and rivets
              white : a free-standing symbol on white (Power Dynamite); white is keyed per frame and a round
                      soft mask keeps full-frame flashes round

Frames are picked by a mix of motion (0.6) and time (0.4), so fast action keeps its frames; the last frames are
morphed into the first with optical flow so the loop closes. Cells are padded to multiples of 16 (WebP blocks).
"""
import sys, os, argparse
import numpy as np, cv2
from PIL import Image, ImageDraw
from scipy import ndimage

ap = argparse.ArgumentParser()
ap.add_argument('dir'); ap.add_argument('key'); ap.add_argument('mode')
ap.add_argument('--frames', type=int, default=45); ap.add_argument('--cols', type=int, default=9)
ap.add_argument('--drop', default='', help='source frame ranges to leave out, e.g. 50-58,90-92 (bad generated frames)')
ap.add_argument('--degrey', action='store_true', help='tile mode: replace grey smoke with the first frame (no dark silhouette)')
ap.add_argument('--width', type=int, default=256, help='cell width; the game scales it to the reel cell')
ap.add_argument('--k', type=int, default=6, help='frames morphed into frame 1 to close the loop')
a = ap.parse_args()
ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..')
files = sorted(f for f in os.listdir(a.dir) if f.endswith('.png'))
raw = [cv2.cvtColor(cv2.imread(os.path.join(a.dir, f)), cv2.COLOR_BGR2RGB) for f in files]
if a.drop:
    bad = set()
    for r in a.drop.split(','):
        lo, hi = map(int, r.split('-')); bad.update(range(lo, hi + 1))
    raw = [f for i, f in enumerate(raw) if i not in bad]

def border_white(img, thr=232):
    nw = img.min(-1) > thr
    lab, n = ndimage.label(nw)
    edge = set(np.unique(np.r_[lab[0], lab[-1], lab[:, 0], lab[:, -1]])) - {0}
    return np.isin(lab, list(edge))

# --- start frame and crop box
start = 0
if a.mode == 'panel':   # first frame whose corners are no longer white
    for i, f in enumerate(raw):
        if max(f[3:12, 3:12].mean(), f[3:12, -12:-3].mean(), f[-12:-3, 3:12].mean(), f[-12:-3, -12:-3].mean()) < 60: start = i + 1; break
raw = raw[start:]
H0, W0 = raw[0].shape[:2]
if a.mode == 'tile':
    out = border_white(raw[0]); ys, xs = np.where(~out)
    x0, x1, y0, y1 = xs.min(), xs.max() + 1, ys.min(), ys.max() + 1
    tile_alpha = ndimage.gaussian_filter(np.where(out, 0, 255).astype(np.float32), 1.0)[y0:y1, x0:x1]
else:
    x0, x1, y0, y1 = 0, W0, 0, H0
raw = [f[y0:y1, x0:x1] for f in raw]
h, w = raw[0].shape[:2]
N = len(raw); OUT = a.frames

# --- pick frames
sm = [cv2.resize(f, (240, round(240 * h / w))).astype(np.float32) for f in raw]
step = np.array([np.abs(sm[i] - sm[i - 1]).mean() for i in range(1, N)])
arc = np.concatenate([[0], np.cumsum(step)]); arc /= arc[-1]
mix = .6 * arc + .4 * np.linspace(0, 1, N)
idx = [int(np.argmin(np.abs(mix - t))) for t in np.linspace(0, 1, OUT)]
frames = [raw[i].copy() for i in idx]

# --- close the loop: morph the last K frames toward frame 0
K = a.k; f0 = raw[0]; g0 = cv2.cvtColor(f0, cv2.COLOR_RGB2GRAY)
Y, X = np.mgrid[0:h, 0:w].astype(np.float32)
for j in range(K):
    u = (j + 1) / (K + 1); u = u * u * (3 - 2 * u)
    fi = frames[OUT - K + j]; gi = cv2.cvtColor(fi, cv2.COLOR_RGB2GRAY)
    fl_i0 = cv2.calcOpticalFlowFarneback(gi, g0, None, .5, 4, 25, 4, 7, 1.5, 0)
    fl_0i = cv2.calcOpticalFlowFarneback(g0, gi, None, .5, 4, 25, 4, 7, 1.5, 0)
    wi = cv2.remap(fi, X + u * fl_0i[..., 0], Y + u * fl_0i[..., 1], cv2.INTER_LINEAR, borderMode=cv2.BORDER_REPLICATE)
    w0 = cv2.remap(f0, X + (1 - u) * fl_i0[..., 0], Y + (1 - u) * fl_i0[..., 1], cv2.INTER_LINEAR, borderMode=cv2.BORDER_REPLICATE)
    frames[OUT - K + j] = ((1 - u) * wi.astype(np.float32) + u * w0.astype(np.float32)).astype(np.uint8)
frames[-1] = frames[-1]  # the sheet's last frame is one step before frame 0 (loop wraps)

# --- alpha per mode
def panel_mask():
    S = 4; m = Image.new('L', (w * S, h * S), 0); r = int(min(w, h) * .06) * S
    ImageDraw.Draw(m).rounded_rectangle([0, 0, w * S - 1, h * S - 1], r, fill=255)
    return np.asarray(m.resize((w, h), Image.LANCZOS)).astype(np.float32)
def round_mask():
    d = np.hypot((X - w / 2) / (w / 2), (Y - h / 2) / (h / 2))
    u = np.clip((1.0 - d) / .45, 0, 1); return (u * u * (3 - 2 * u) * 255).astype(np.float32)
def rim(img):   # dark rim and four rivets, like the other tiles
    im = Image.fromarray(img).convert('RGBA'); S = 2
    big = im.resize((w * S, h * S), Image.LANCZOS); d = ImageDraw.Draw(big)
    t = max(6, int(min(w, h) * .018)) * S; r = int(min(w, h) * .06) * S
    d.rounded_rectangle([t // 2, t // 2, w * S - 1 - t // 2, h * S - 1 - t // 2], r, outline=(34, 24, 20, 255), width=t)
    rv = int(min(w, h) * .016) * S; m = int(min(w, h) * .05) * S
    for cx, cy in [(m, m), (w * S - m, m), (m, h * S - m), (w * S - m, h * S - m)]:
        d.ellipse([cx - rv, cy - rv, cx + rv, cy + rv], fill=(70, 62, 58, 255)); d.ellipse([cx - rv // 2 - S, cy - rv // 2 - S, cx, cy], fill=(150, 140, 130, 255))
    return np.asarray(big.resize((w, h), Image.LANCZOS).convert('RGB'))

def degrey(f):   # dark smoke -> the clean first frame: pixels clearly darker than frame 1 that are not the red bundle
    hsv = cv2.cvtColor(f, cv2.COLOR_RGB2HSV).astype(np.float32)
    h0 = cv2.cvtColor(f0, cv2.COLOR_RGB2HSV).astype(np.float32)
    sat, val, v0 = hsv[..., 1] / 255, hsv[..., 2] / 255, h0[..., 2] / 255
    red = np.clip((sat - .55) / .2, 0, 1) * ((hsv[..., 0] < 8) | (hsv[..., 0] > 170))
    w = np.clip((v0 - val - .08) / .2, 0, 1) * (1 - red)
    w = np.maximum(w, np.clip((0.45 - sat) / 0.2, 0, 1) * np.clip((0.7 - val) / 0.25, 0, 1))
    # protect the bundle and its clock in this frame (red sticks, cream face), holes filled, a little grown
    keep = (red > .5) | ((sat < .35) & (val > .72))
    keep = ndimage.binary_fill_holes(ndimage.binary_closing(keep, iterations=4))
    keep = ndimage.binary_dilation(ndimage.binary_opening(keep, iterations=3), iterations=4)
    w = w * (1 - keep)
    w = cv2.GaussianBlur(w.astype(np.float32), (0, 0), 3)[..., None]
    return (f * (1 - w) + f0 * w).astype(np.uint8)
F0OBJ = None
if a.mode == 'white':   # where the first frame has the symbol: kept solid while the pixel still looks like it
    F0OBJ = ndimage.binary_erosion(~border_white(f0, 236), iterations=3).astype(np.float32)
F0COL = None
if a.mode == 'white':
    hv = cv2.cvtColor(f0, cv2.COLOR_RGB2HSV).astype(np.float32); sa, va = hv[..., 1] / 255, hv[..., 2] / 255
    Hh = hv[..., 0]
    stick = ((Hh < 5) | (Hh > 170)) & (sa > .7) & (va < .65)                      # the deep red sticks
    m = ndimage.binary_fill_holes(ndimage.binary_closing(ndimage.binary_opening(stick, iterations=2), iterations=8))
    lab, n = ndimage.label(m); m = lab == (np.argmax(np.bincount(lab.ravel())[1:]) + 1)   # the bundle only
    hull = cv2.convexHull(np.argwhere(m)[:, ::-1].astype(np.int32))                   # + the clock and wire inside its outline
    mm = np.zeros(m.shape, np.uint8); cv2.fillConvexPoly(mm, hull, 1); m = mm.astype(bool)
    F0A = ndimage.gaussian_filter(m.astype(np.float32), 1.2)
def unwhite(f):     # the video only as a glow layer behind the still symbol: no ghost, disc or dark splats
    c = f.astype(np.float32)
    al = np.clip((1 - c.min(-1) / 255 - .04) / .96, 0, 1)                 # distance from white
    hsv = cv2.cvtColor(f, cv2.COLOR_RGB2HSV).astype(np.float32)
    hue, sat_, val_ = hsv[..., 0], hsv[..., 1] / 255, hsv[..., 2] / 255
    murky = np.maximum(np.clip((0.45 - sat_) / .2, 0, 1), ((hue > 18) & (hue < 90)).astype(np.float32))   # grey or olive
    dark = murky * np.clip((0.62 - val_) / .2, 0, 1)
    colourful = np.clip((hsv[..., 1] / 255 - .25) / .2, 0, 1)            # grey smoke and white haze out, fire stays
    al = np.minimum(al * (1 - dark) * colourful, round_mask() / 255)
    a3 = np.maximum(al, 1e-3)[..., None]
    col = np.clip((c - (1 - a3) * 255) / a3, 0, 255)
    al = al ** .6 * (1 - dark)                                          # thin fire reads as fire on a dark reel, not olive haze
    # bright flash: near-white light stays as a hot glow (not see-through), fading out towards the circle's edge
    d = np.hypot((X - w / 2) / (w / 2), (Y - h / 2) / (h / 2)); inner = np.clip((0.95 - d) / .5, 0, 1)
    ring = np.r_[c[:6].reshape(-1, 3), c[-6:].reshape(-1, 3), c[:, :6].reshape(-1, 3), c[:, -6:].reshape(-1, 3)]
    flash = np.clip(1 - (ring.min(-1) > 236).mean() / .04, 0, 1)    # only when the white background is gone (the blast)
    glow = .85 * flash * np.clip((val_ - .88) / .08, 0, 1) * inner * (1 - murky * (1 - colourful))
    use = (glow > al)[..., None]
    col = np.where(use, c, col); al = np.maximum(al, glow)
    # the clean symbol from frame 1 on top
    fa = F0A[..., None]
    out_a = fa + al[..., None] * (1 - fa)
    out_c = (f0 * fa + col * al[..., None] * (1 - fa)) / np.maximum(out_a, 1e-3)
    return np.clip(out_c, 0, 255).astype(np.uint8), out_a[..., 0] * 255

rgba = []
for f in frames:
    if a.mode == 'tile':
        al = tile_alpha
        if a.degrey: f = degrey(f)
    elif a.mode == 'panel': f = rim(f); al = panel_mask()
    else:
        f, al = unwhite(f)
    rgba.append(np.dstack([f, np.clip(al, 0, 255).astype(np.uint8)]))

# --- sheet
TW = a.width; TH = round(h / w * TW)
if a.mode != 'tile' and TH > TW: TW = round(a.width * w / h); TH = a.width
CW = (TW + 15) // 16 * 16; CH = (TH + 15) // 16 * 16
cols = a.cols; rows = (OUT + cols - 1) // cols
sheet = Image.new('RGBA', (CW * cols, CH * rows), (0, 0, 0, 0)); cells = []
for i, f in enumerate(rgba):
    im = Image.fromarray(f).resize((TW, TH), Image.LANCZOS)
    cell = Image.new('RGBA', (CW, CH), (0, 0, 0, 0)); cell.paste(im, ((CW - TW) // 2, (CH - TH) // 2)); cells.append(cell)
    sheet.paste(cell, ((i % cols) * CW, (i // cols) * CH))
sheet.save(os.path.join(ROOT, 'assets/images/anims/%s_win.webp' % a.key), 'WEBP', quality=84, method=6)
idle = Image.fromarray(rgba[0]).resize((TW, TH), Image.LANCZOS)
idle.save(os.path.join(ROOT, 'assets/images/symbols/%s_idle.webp' % a.key), 'WEBP', quality=92, method=6)
idle.save(os.path.join(ROOT, 'art/symbols/%s_idle.png' % a.key))
# loop smoothness report and a preview gif
bg = []
for c in cells:
    b = Image.new('RGBA', (CW, CH), (40, 28, 20, 255)); b.alpha_composite(c); bg.append(b.convert('RGB'))
bg[0].save('/tmp/prev_%s.gif' % a.key, save_all=True, append_images=bg[1:], duration=33, loop=0)
s2 = [np.asarray(b).astype(np.float32) for b in bg]
st = [np.abs(s2[i] - s2[i - 1]).mean() for i in range(1, OUT)] + [np.abs(s2[0] - s2[-1]).mean()]
print('%s: start %d, %d src -> %d, cell %dx%d, steps max %.1f median %.1f wrap %.1f' % (a.key, start, N, OUT, CW, CH, max(st), np.median(st), st[-1]))
