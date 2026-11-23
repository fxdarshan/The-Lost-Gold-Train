#!/usr/bin/env python3
"""Free spins transition from a green-screen video (Darshan, 2026-11-23).

The video starts on flat green, the scene cross-fades in, plays, then cross-fades back to green. Video files can't
carry transparency in every browser, so instead of a per-pixel key this works out ONE opacity per frame (how far the
whole frame has faded in from the green), removes the green from the colours of the fading frames
(scene = (frame - (1 - a) * green) / a) and writes an ordinary opaque video plus the opacity table. The game draws
each frame with that opacity over the reels, which gives the same cross-fade over the game instead of over green.

Usage: transition_from_video.py IN.mp4 OUT_BASENAME [--end N] [--tail N]
  --end   last frame used (the clip's tail lingers on a faint scene; default: all frames)
  --tail  frames over which the opacity is forced down to 0 before --end (default 10)
Writes OUT_BASENAME.webm (VP9), OUT_BASENAME.mp4 (H.264) and prints the opacity table as JSON.
"""
import json, subprocess, sys
import numpy as np

def main():
    args = sys.argv[1:]
    src, out = args[0], args[1]
    end = int(args[args.index('--end') + 1]) if '--end' in args else None
    tail = int(args[args.index('--tail') + 1]) if '--tail' in args else 10
    probe = subprocess.run(['ffprobe', '-v', 'error', '-select_streams', 'v:0', '-show_entries', 'stream=width,height,r_frame_rate',
                            '-of', 'csv=p=0', src], capture_output=True, text=True).stdout.strip().split(',')
    w, h = int(probe[0]), int(probe[1]); fps = probe[2]
    raw = subprocess.run(['ffmpeg', '-v', 'error', '-i', src, '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-'], capture_output=True).stdout
    fr = np.frombuffer(raw, np.uint8).reshape(-1, h, w, 3)
    if end: fr = fr[:end + 1]
    n = len(fr)
    green = fr[0].reshape(-1, 3).astype(np.float32).mean(0)
    # "greenness" of a frame: median of G - max(R, B); green screen ~0.94, the night scene about -0.05
    small = fr[:, ::4, ::4].astype(np.float32)
    x = np.median((small[..., 1] - np.maximum(small[..., 0], small[..., 2])).reshape(n, -1), axis=1) / 255
    x0 = x[0]
    full = x < x0 - 0.9 * (x0 - x.min())                  # frames that are (almost) fully faded in
    m = float(np.median(x[full]))
    a = np.clip((x0 - x) / (x0 - m), 0, 1)
    a = np.convolve(np.pad(a, 2, mode='edge'), np.ones(5) / 5, mode='valid')
    idx = np.where(a > .97)[0]; a[idx[0]:idx[-1] + 1] = 1     # fully opaque in the middle
    a[:idx[0]] = np.maximum.accumulate(a[:idx[0]])            # fade in only rises
    a[idx[-1]:] = np.minimum.accumulate(a[idx[-1]:])          # fade out only falls
    ramp = np.clip((n - 1 - np.arange(n)) / tail, 0, 1)       # the clip never quite returns to green: force 0
    alpha_draw = a * ramp; alpha_draw[0] = 0; alpha_draw[-1] = 0   # drawn opacity; the colours are unmixed with a
    enc = []
    for i in range(n):
        f = fr[i].astype(np.float32)
        k = max(a[i], .08)
        s = (f - (1 - a[i]) * green) / k if a[i] < 1 else f
        enc.append(np.clip(s, 0, 255).astype(np.uint8).tobytes())
    data = b''.join(enc)
    common = ['ffmpeg', '-v', 'error', '-y', '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-s', f'{w}x{h}', '-r', fps, '-i', '-', '-an']
    subprocess.run(common + ['-c:v', 'libvpx-vp9', '-b:v', '0', '-crf', '36', '-row-mt', '1', '-deadline', 'good', '-cpu-used', '2',
                             '-pix_fmt', 'yuv420p', out + '.webm'], input=data, check=True)
    subprocess.run(common + ['-c:v', 'libx264', '-preset', 'veryfast', '-crf', '24', '-pix_fmt', 'yuv420p', '-movflags', '+faststart',
                             out + '.mp4'], input=data, check=True)
    print(json.dumps({'frames': n, 'fps': eval(fps), 'w': w, 'h': h, 'alpha': [round(float(v), 3) for v in alpha_draw]}))

if __name__ == '__main__':
    main()
