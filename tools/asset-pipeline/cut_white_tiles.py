#!/usr/bin/env python3
"""
Cut symbol tiles exported on a white background (for example crops from an AI concept sheet).

For each image: near-white pixels connected to the border become transparent (flood fill from
the edges, so white highlights inside the art are kept), then only the largest remaining piece
is kept (drops slivers of neighbouring tiles left in the crop), and the edge is softened by 1 px.

    python3 tools/asset-pipeline/cut_white_tiles.py <in.png> <out.png> [--white 232]
"""
import sys
import numpy as np
from PIL import Image, ImageFilter
from scipy import ndimage

src, dst = sys.argv[1], sys.argv[2]
thr = int(sys.argv[sys.argv.index('--white') + 1]) if '--white' in sys.argv else 232
im = Image.open(src).convert('RGBA'); a = np.asarray(im).astype(int)
rgb = a[..., :3]
whiteish = (rgb.min(-1) >= thr) & (rgb.max(-1) - rgb.min(-1) <= 18)
lab, n = ndimage.label(whiteish)
border = set(np.unique(np.concatenate([lab[0], lab[-1], lab[:, 0], lab[:, -1]]))) - {0}
bg = np.isin(lab, list(border))
fg = ~bg & (a[..., 3] > 8)
lab2, n2 = ndimage.label(fg)
if n2:
    sizes = ndimage.sum(fg, lab2, range(1, n2 + 1)); keep = lab2 == (1 + int(np.argmax(sizes)))
    keep = ndimage.binary_fill_holes(keep)
else:
    keep = fg
alpha = Image.fromarray((keep * 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(0.7))
out = im.copy(); out.putalpha(alpha)
box = out.getbbox(); out = out.crop(box)
out.save(dst)
print(dst, out.size)
