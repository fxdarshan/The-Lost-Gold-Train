"""Re-sample an existing win sheet to fewer frames and a smaller cell (the game blends neighbouring frames).
Usage: python3 resample_sheet.py KEY COLS ROWS FRAMES NEW_FRAMES NEW_WIDTH NEW_COLS"""
import sys, os
from PIL import Image
key, cols, rows, n, m, W, nc = sys.argv[1], *map(int, sys.argv[2:8])
p = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..', 'assets/images/anims/%s_win.webp' % key)
sh = Image.open(p); cw, ch = sh.width // cols, sh.height // rows
H = round(ch * W / cw); H16 = (H + 15) // 16 * 16
nr = (m + nc - 1) // nc; out = Image.new('RGBA', (W * nc, H16 * nr), (0, 0, 0, 0))
for k in range(m):
    i = round(k * n / m) % n
    cell = sh.crop(((i % cols) * cw, (i // cols) * ch, (i % cols + 1) * cw, (i // cols + 1) * ch)).resize((W, H), Image.LANCZOS)
    out.paste(cell, ((k % nc) * W, (k // nc) * H16 + (H16 - H) // 2))
out.save(p, 'WEBP', quality=84, method=6); print(key, out.size, 'cell', W, H16, 'rows', nr)
