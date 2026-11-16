#!/usr/bin/env python3
"""
Turn a 4x4 sheet of 16 AI key poses (left-to-right, top-to-bottom, on white) into a seamless
45-frame, 30 fps symbol animation that follows docs/symbol-animation-prompt.md:

  * key poses are KEYS, not frames: 45 in-betweens are generated, the loop wraps 16 -> 1;
  * position lock: every pose is aligned (ECC affine) to pose 1, the tile silhouette (alpha) and its
    outer border band are taken from pose 1 in every frame, so the frame, corners and rivets never move;
  * --mode light (gold bars, badge): the artwork itself is pose 1 for all frames; only the light is
    animated: pixels that are clearly brighter in a key pose (glints, shine sweeps) are lifted out and
    blended over pose 1, so nothing bounces, swims or wobbles;
  * --mode motion (character, train): in-betweens are interpolated along dense optical flow
    (forward and backward warp, blended), so poses move instead of cross-fading (no double images);
  * tempo: keys are spread evenly over the loop with a gentle global ease (slower near the neutral
    start/end, faster through the action);
  * the AI watermark in the bottom-right of the last cell is replaced with pose 1's pixels.

Output: <out>_sheet.webp (9 x 5 grid of 45 frames), <out>_frame00.png (frame 1, for the idle symbol),
<out>_preview.gif (30 fps, for review), and a JSON line with the sheet layout.

    python3 -I tools/asset-pipeline/anim_from_keys.py <sheet.png> <out_prefix> --mode light|motion [--frames 75] [--width 320] [--strict] [--soft] [--settle K] [--glints [--glint-script tools/asset-pipeline/glints/<symbol>.json]]

  --timing a,b,...: 16 frame counts, one per key (timing chart); sets the loop length to their sum.
  --frames N: loop length at 30 fps (default 45 = 1.5 s; 75 = 2.5 s, Darshan 2026-11-16: 'too fast').
  --switch W (motion mode): where flow can't follow, switch poses over W of a key (default 0.2; 0.5 spreads it over
  about 2 frames at --frames 75: smoother, with a faint overlap).
  --settle K: keys K..16 are neutral 'return' poses; use pose 1 for them so the loop lands exactly on the start.
  --soft (motion mode): where flow can't follow (smoke, explosions, muzzle flash) cross-fade instead of a hard switch.
  The smoothness report (stderr) lists every frame-to-frame step including the 45 -> 1 wrap.
  --glints (light mode): for objects redrawn at a different scale between keys: glint positions and sizes are
  read from the keys, and sparkles are painted on pose 1, so no pixel of a misaligned key is used.
"""
import sys, json
import numpy as np, cv2
from PIL import Image
from scipy import ndimage

src, out = sys.argv[1], sys.argv[2]
mode = sys.argv[sys.argv.index('--mode') + 1] if '--mode' in sys.argv else 'motion'
W_OUT = int(sys.argv[sys.argv.index('--width') + 1]) if '--width' in sys.argv else 320
STRICT = '--strict' in sys.argv or '--glints' in sys.argv
GLINTS = '--glints' in sys.argv
SOFT = '--soft' in sys.argv
SWITCH = float(sys.argv[sys.argv.index('--switch') + 1]) if '--switch' in sys.argv else 0.2   # width of the hard pose switch (fraction of a key)
SETTLE = int(sys.argv[sys.argv.index('--settle') + 1]) if '--settle' in sys.argv else 0
SCRIPT = sys.argv[sys.argv.index('--glint-script') + 1] if '--glint-script' in sys.argv else None
N_OUT = int(sys.argv[sys.argv.index('--frames') + 1]) if '--frames' in sys.argv else 45
FPS = 30
COLS = 9 if N_OUT == 45 else 10                # 45 -> 9 x 5 (as before); longer loops 10 wide

sheet = np.asarray(Image.open(src).convert('RGB')).astype(np.float32)
H, W = sheet.shape[:2]; cw, ch = W // 4, H // 4
cells = [sheet[r * ch:(r + 1) * ch, c * cw:(c + 1) * cw].copy() for r in range(4) for c in range(4)]

def tile_alpha(img):
    """Tile silhouette: white connected to the cell border is background; keep the largest piece."""
    white = (img.min(-1) >= 232) & (img.max(-1) - img.min(-1) <= 20)
    lab, _ = ndimage.label(white)
    border = set(np.unique(np.concatenate([lab[0], lab[-1], lab[:, 0], lab[:, -1]]))) - {0}
    fg = ~np.isin(lab, list(border))
    lab2, n = ndimage.label(fg)
    if n: fg = lab2 == (1 + int(np.argmax(ndimage.sum(fg, lab2, range(1, n + 1)))))
    return ndimage.binary_fill_holes(fg)

ref = cells[0]; ref_a = tile_alpha(ref)
gray = lambda im: cv2.GaussianBlur(cv2.cvtColor(im.astype(np.uint8), cv2.COLOR_RGB2GRAY), (0, 0), 1.5).astype(np.float32) / 255

# 1. register every pose to pose 1 (affine), using the tile's frame band only: the frame is the registration
#    reference, so moving content (gun, cape, smoke) can't pull the alignment
#    (motion mode). Light mode registers on the tile interior: the object is the stable reference there.
inner = cv2.erode(ref_a.astype(np.uint8), np.ones((int(cw * .13),) * 2, np.uint8))
band_mask = (cv2.erode(ref_a.astype(np.uint8), np.ones((5, 5), np.uint8)) & (1 - inner)).astype(np.uint8)
interior_mask = cv2.erode(ref_a.astype(np.uint8), np.ones((15, 15), np.uint8))
masks = [band_mask, interior_mask] if mode == 'motion' else [interior_mask, band_mask]
aligned, warps = [], []
for i, im in enumerate(cells):
    M = np.eye(2, 3, dtype=np.float32)
    if i:
        for mk in masks:                            # preferred mask first; fall back if ECC fails or runs away
            try:
                _, M2 = cv2.findTransformECC(gray(ref), gray(im), np.eye(2, 3, dtype=np.float32), cv2.MOTION_AFFINE,
                                             (cv2.TERM_CRITERIA_EPS | cv2.TERM_CRITERIA_COUNT, 200, 1e-6), mk, 5)
                if np.hypot(M2[0, 2], M2[1, 2]) < cw * .08 and np.abs(M2[:, :2] - np.eye(2)).max() < .04:
                    M = M2; break
            except cv2.error:
                pass
    warps.append(M)
    w = cv2.warpAffine(im, M, (cw, ch), flags=cv2.INTER_CUBIC + cv2.WARP_INVERSE_MAP, borderMode=cv2.BORDER_REPLICATE)
    own = cv2.warpAffine(tile_alpha(im).astype(np.float32), M, (cw, ch), flags=cv2.INTER_LINEAR + cv2.WARP_INVERSE_MAP)
    own = cv2.GaussianBlur(own, (0, 0), 2)[..., None]
    aligned.append(w * own + ref * (1 - own))     # anything outside this pose's own tile comes from pose 1

# 2. watermark in the last cell (bottom-right sparkle): take pose 1's pixels there, feathered
wm = np.zeros((ch, cw), np.float32); wm[int(ch * .62):, int(cw * .70):] = 1
wm = cv2.GaussianBlur(wm, (0, 0), 6)[..., None]
aligned[15] = aligned[15] * (1 - wm) + aligned[0] * wm

# 3. border lock: pose 1's outer band (frame edge, corners, rivets) in every pose
band = ref_a & ~cv2.erode(ref_a.astype(np.uint8), np.ones((int(cw * .07),) * 2, np.uint8)).astype(bool)
band_f = cv2.GaussianBlur(band.astype(np.float32), (0, 0), 3)[..., None]
aligned = [a * (1 - band_f) + ref * band_f for a in aligned]

# 3b. --settle K: keys K..16 are the 'return to neutral' poses; AI redraws them slightly moved or rescaled,
#     which shows as a jump at the loop point. Replace them with pose 1 so the loop eases back into the exact
#     starting art (position lock + seamless wrap).
if SETTLE:
    for k in range(SETTLE - 1, 16): aligned[k] = aligned[0].copy()

# 4. key -> frame timing: 16 keys evenly around the loop, gentle global ease
TIMING = [int(x) for x in sys.argv[sys.argv.index('--timing') + 1].split(',')] if '--timing' in sys.argv else None
if TIMING:
    # --timing: frames per key (an animator's timing chart). Each key holds, then moves into the next one over its
    # last few frames: fast keys (2-3 frames) snap, long keys read as holds.
    assert len(TIMING) == 16, '--timing needs 16 numbers'
    N_OUT = sum(TIMING); COLS = 10
    _slots = []
    for _k, _d in enumerate(TIMING):
        _t = max(1, min(3, _d // 2))                 # transition length inside this key's slot
        for _i in range(_d):
            _j = _i - (_d - _t)                      # position inside the transition (negative = holding)
            _slots.append((_k, 0.0 if _j < 0 else (_j + 1) / (_t + 1)))
def key_pos(f):
    if TIMING: return _slots[f]
    p = f / N_OUT
    p = p - 0.035 * np.sin(2 * np.pi * p)          # slower near the neutral start/end
    k = p * 16
    return int(np.floor(k)) % 16, k - np.floor(k)

if mode == 'light':
    base = aligned[0]
    lum = lambda im: im @ np.array([.299, .587, .114], np.float32)
    L0 = lum(base)
    lights = []
    for a in aligned:
        La = lum(a)
        m = np.clip((La - L0 - 30) / 40, 0, 1) * np.clip((La - 200) / 35, 0, 1)   # much brighter AND near-white: glints, shine
        if STRICT:                                  # --strict: only near-white glints (objects whose gold edges shift between keys)
            m = m * np.clip((La - 228) / 20, 0, 1)
            m = cv2.dilate(m, np.ones((3, 3), np.uint8))
        m = cv2.GaussianBlur(m, (0, 0), 1.2)
        area = float((m > .3).mean() / max(ref_a.mean(), 1e-6))
        if area > .05: m = np.zeros_like(m)        # the key pose moved the object: not light, ignore it (position lock)
        lights.append(m)
        print(f'  key {len(lights):2d}: light area {area:.3f}' + ('  (ignored: shape change)' if area > .05 else ''), file=sys.stderr)
    if GLINTS:
        # --glints: the key poses only say WHERE and HOW BIG the light is; sparkles are painted on pose 1
        yy, xx = np.mgrid[0:ch, 0:cw].astype(np.float32)
        spark = []
        script = json.load(open(SCRIPT)) if SCRIPT else {}
        for ki, m in enumerate(lights):
            layer = np.zeros((ch, cw), np.float32)
            if script:
                blobs = [(x, y, r, st, rays) for x, y, r, st, rays in script.get(str(ki + 1), [])]
            else:
                La = lum(aligned[ki]); lab, n = ndimage.label(m > .45); blobs = []
                for j in range(1, n + 1):
                    ys_, xs_ = np.where(lab == j)
                    if len(ys_) >= 30 and float((La[ys_, xs_] - L0[ys_, xs_]).max()) > 75:
                        blobs.append((float(xs_.mean()), float(ys_.mean()), max(6., np.sqrt(len(ys_)) * 1.1), 1., True))
                blobs = blobs[:3]
            for cx, cy, r, st, rays_on in blobs:
                d2 = (xx - cx) ** 2 + (yy - cy) ** 2
                glow = np.exp(-d2 / (2 * r * r)) * .9
                rays = (np.exp(-np.abs(yy - cy) / 1.4) * np.exp(-np.abs(xx - cx) / (r * 2.4)) +
                        np.exp(-np.abs(xx - cx) / 1.4) * np.exp(-np.abs(yy - cy) / (r * 2.4))) * .75 if rays_on else 0
                layer = np.maximum(layer, np.clip((glow + rays) * st, 0, 1))
            spark.append(layer)
        warm = np.array([255, 244, 205], np.float32)
        def frame_at(k, s):
            b = (k + 1) % 16
            e = s * s * (3 - 2 * s)
            L = np.clip((1 - e) * spark[k] + e * spark[b], 0, 1)[..., None]
            return base + (warm - base) * L * (1 - base / 255 * .35)   # screen-like: brightens toward warm white
    else:
        def frame_at(k, s):
            b = (k + 1) % 16
            e = s * s * (3 - 2 * s)                # each light builds and decays smoothly
            m = (1 - e) * lights[k]; n = e * lights[b]
            tot = np.clip(m + n, 0, 1)[..., None]
            col = (aligned[k] * m[..., None] + aligned[b] * n[..., None]) / np.maximum(m + n, 1e-4)[..., None]
            return base * (1 - tot) + col * tot
else:
    dis = cv2.DISOpticalFlow_create(cv2.DISOPTICAL_FLOW_PRESET_MEDIUM)
    g8 = [cv2.cvtColor(a.astype(np.uint8), cv2.COLOR_RGB2GRAY) for a in aligned]
    fwd = [dis.calc(g8[k], g8[(k + 1) % 16], None) for k in range(16)]
    bwd = [dis.calc(g8[(k + 1) % 16], g8[k], None) for k in range(16)]
    yy, xx = np.mgrid[0:ch, 0:cw].astype(np.float32)
    def frame_at(k, s):
        """Pose k -> k+1 at fraction s: sample A back along k->k+1 flow, B along k+1->k flow, blend."""
        b = (k + 1) % 16
        if s < 1e-3: return aligned[k]
        s = np.float32(s)
        A = cv2.remap(aligned[k], xx - s * fwd[k][..., 0], yy - s * fwd[k][..., 1], cv2.INTER_CUBIC, borderMode=cv2.BORDER_REPLICATE)
        B = cv2.remap(aligned[b], xx - (np.float32(1) - s) * bwd[k][..., 0], yy - (np.float32(1) - s) * bwd[k][..., 1], cv2.INTER_CUBIC, borderMode=cv2.BORDER_REPLICATE)
        # where the two warps disagree (fast change, occlusion) switch over a short window instead of
        # cross-fading, so no double image appears
        err = np.abs(A - B).mean(-1)
        hard = cv2.GaussianBlur(np.clip((err - 25) / 25, 0, 1), (0, 0), 3)
        if SOFT: hard = hard * 0                    # --soft: smoke, fire, flashes dissolve (cross-fade) instead of switching
        u = np.clip((s - (.5 - SWITCH / 2)) / SWITCH, 0, 1); u = u * u * (3 - 2 * u)
        w = (1 - hard) * s + hard * u
        return (1 - w[..., None]) * A + w[..., None] * B

# 5. render 45 frames on pose 1's silhouette, crop to it, scale
ys, xs = np.where(ref_a); box = (xs.min(), ys.min(), xs.max() + 1, ys.max() + 1)
alpha = (cv2.GaussianBlur(ref_a.astype(np.float32), (0, 0), .7) * 255).astype(np.uint8)
frames = []
for f in range(N_OUT):
    k, s = key_pos(f)
    fr = frame_at(k, s)
    fr = fr * (1 - band_f) + ref * band_f        # border lock on the output frame too (warps can pull in edge pixels)
    rgb = np.clip(fr, 0, 255).astype(np.uint8)
    im = Image.fromarray(np.dstack([rgb, alpha]), 'RGBA').crop(box)
    h_out = round(im.height * W_OUT / im.width)
    frames.append(im.resize((W_OUT, h_out), Image.LANCZOS))

# smoothness: size of every frame-to-frame step, including the 45 -> 1 wrap
arr = [np.asarray(f.convert('RGB')).astype(np.float32) for f in frames]
steps = [float(np.abs(arr[(i + 1) % N_OUT] - arr[i]).mean()) for i in range(N_OUT)]
med = float(np.median(steps)) or 1e-6
print(json.dumps({'steps': [round(x, 1) for x in steps], 'wrap': round(steps[-1], 1), 'maxOverMedian': round(max(steps) / med, 1)}), file=sys.stderr)
fw, fh = frames[0].size; rows = (N_OUT + COLS - 1) // COLS
# WebP compresses in 16 px blocks: a cell height that isn't a multiple of 16 puts every sheet row on a different
# block grid, so the compression noise changes at each row and static areas shimmer every COLS frames.
if fh % 16 or fw % 16:
    fw2, fh2 = -(-fw // 16) * 16, -(-fh // 16) * 16
    frames = [fr.resize((fw2, fh2), Image.LANCZOS) for fr in frames]; fw, fh = fw2, fh2
sheet_out = Image.new('RGBA', (fw * COLS, fh * rows), (0, 0, 0, 0))
for i, fr in enumerate(frames): sheet_out.paste(fr, ((i % COLS) * fw, (i // COLS) * fh))
sheet_out.save(out + '_sheet.webp', 'WEBP', quality=88, method=6)
frames[0].save(out + '_frame00.png')
bg = (40, 28, 22)
gif = [Image.alpha_composite(Image.new('RGBA', fr.size, bg + (255,)), fr).convert('P', palette=Image.ADAPTIVE) for fr in frames]
gif[0].save(out + '_preview.gif', save_all=True, append_images=gif[1:], duration=round(1000 / FPS), loop=0, disposal=2)
drift = [float(np.hypot(M[0, 2], M[1, 2])) for M in warps]
print(json.dumps({'sheet': out + '_sheet.webp', 'frameW': fw, 'frameH': fh, 'cols': COLS, 'rows': rows, 'frames': N_OUT, 'fps': FPS,
                  'mode': mode, 'maxAlignShiftPx': round(max(drift), 1)}))
