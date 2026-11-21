"""Original music for The Lost Gold Train, composed and synthesised in code (no samples, no third-party material).

  python3 tools/audio/compose_music.py            -> assets/audio/bgm_basegame_loop.mp3, bgm_freegame_loop.mp3

v2 (2026-11-21, Darshan: "should be wild west rough"):
Base game: "Rattlesnake Ridge" - E minor with the flat-second (Phrygian) bite, 84 BPM, 16 bars. Overdriven twangy
baritone guitar riff through a spring reverb, a raw harmonica lead with bends, stomps and hand claps, a low drone,
desert wind, jaw-harp boings, an anvil clank and a rattlesnake rattle at the phrase ends.
Free spins: "Gold Train Heist" - A minor, 144 BPM, 16 bars, set on a running gold train: rail joints clacking,
steam chuffs in eighths, wheel rumble, a steam whistle at each phrase, palm-muted overdriven guitar chugs, galloping
toms, a gritty brass lead, brass stabs and gunshots.

Loops are seamless: every voice is rendered on a circular timeline (tails wrap to the start) and the file carries
PRE seconds of the loop's end before it and PRE seconds of its start after it. The game loops the region
[PRE, PRE + loop length] (ASSET_MANIFEST.music), so encoder padding never causes a click.
"""
import os, subprocess
import numpy as np
from scipy import signal

SR = 44100
PRE = 0.5
rng = np.random.default_rng(7)
ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..')
NOTE = {'C': -9, 'D': -7, 'E': -5, 'F': -4, 'G': -2, 'A': 0, 'B': 2}

def hz(n):
    """'A4', 'G#5', 'Bb3' -> frequency"""
    s = NOTE[n[0]]; i = 1
    if n[i] == '#': s += 1; i += 1
    elif n[i] == 'b': s -= 1; i += 1
    return 440.0 * 2 ** ((s + 12 * (int(n[i:]) - 4)) / 12)

class Track:
    """a circular stereo buffer of one loop"""
    def __init__(self, seconds):
        self.n = int(round(seconds * SR)); self.buf = np.zeros((2, self.n))
    def add(self, x, t, gain=1.0, pan=0.0):
        i0 = int(round(t * SR)) % self.n; L = len(x)
        l, r = gain * np.cos((pan + 1) * np.pi / 4), gain * np.sin((pan + 1) * np.pi / 4)
        idx = (np.arange(L) + i0) % self.n
        np.add.at(self.buf[0], idx, x * l * 1.414); np.add.at(self.buf[1], idx, x * r * 1.414)

def env_adsr(L, a=.005, d=.1, s=.6, r=.1, hold=None):
    t = np.arange(L) / SR; hold = hold if hold is not None else L / SR - r
    e = np.where(t < a, t / max(a, 1e-4), np.where(t < a + d, 1 - (1 - s) * (t - a) / max(d, 1e-4), s))
    return e * np.clip(1 - (t - hold) / max(r, 1e-4), 0, 1)

# ---------------------------------------------------------------- instruments
def pluck(f, dur, bright=.5, decay=.996):
    """Karplus-Strong string (vectorised period by period)"""
    N = max(2, int(round(SR / f))); L = int(dur * SR) + N
    y = np.zeros(L); burst = rng.uniform(-1, 1, N)
    burst = signal.lfilter([bright, 1 - bright], [1], burst); y[:N] = burst
    k = N
    while k < L:
        e = min(L, k + N); idx = np.arange(k, e)
        y[k:e] = decay * .5 * (y[idx - N] + y[np.maximum(idx - N - 1, 0)])
        k = e
    y = y[N:]; y *= env_adsr(len(y), .001, .0, 1, .05)
    return y / (np.abs(y).max() + 1e-9)

def whistle(f, dur, glide_from=None):
    L = int(dur * SR); t = np.arange(L) / SR
    vib = 1 + .009 * np.sin(2 * np.pi * 5.6 * t) * np.clip((t - .18) / .25, 0, 1)
    ff = np.full(L, f)
    if glide_from: g = np.clip(t / .07, 0, 1); ff = glide_from * (f / glide_from) ** g
    ph = 2 * np.pi * np.cumsum(ff * vib) / SR
    x = np.sin(ph) + .06 * np.sin(2 * ph) + .02 * np.sin(3 * ph)
    breath = signal.lfilter(*signal.butter(2, [f * .9 / (SR / 2), min(.95, f * 1.3 / (SR / 2))], 'band'), rng.normal(0, 1, L)) * .05
    return (x + breath) * env_adsr(L, .04, .1, .85, min(.12, dur * .3))

def brass(f, dur, bright=1.0):
    L = int(dur * SR); t = np.arange(L) / SR
    vib = 1 + .006 * np.sin(2 * np.pi * 5.2 * t) * np.clip((t - .2) / .3, 0, 1)
    out = np.zeros(L)
    for det in (-.004, 0, .005):
        ph = np.cumsum(f * (1 + det) * vib) / SR
        out += 2 * (ph % 1) - 1
    e = env_adsr(L, .03, .15, .8, min(.1, dur * .25))
    cut = np.clip(700 + 3800 * bright * (e ** 1.5), 300, 9000)        # brass: brighter as it gets louder
    y = np.zeros(L); z = 0.0; a = np.exp(-2 * np.pi * cut / SR)
    for i in range(0, L, 64):                                          # block-wise one-pole with moving cutoff
        b = out[i:i + 64]; zz, _ = signal.lfilter([1 - a[i]], [1, -a[i]], b, zi=[z * a[i]]); y[i:i + 64] = zz; z = zz[-1] if len(zz) else z
    y = signal.lfilter([1 - .6], [1, -.6], y)
    return y * e * .5

def choir(freqs, dur):
    L = int(dur * SR); t = np.arange(L) / SR; out = np.zeros(L)
    for f in freqs:
        for det in (-.006, .0, .007):
            ph = np.cumsum(np.full(L, f * (1 + det)) * (1 + .004 * np.sin(2 * np.pi * (4.7 + det * 100) * t))) / SR
            out += 2 * (ph % 1) - 1
    y = np.zeros(L)
    for fc, q, g in ((700, 5, 1.0), (1220, 6, .6), (2600, 8, .25)):     # "ah" formants
        b, a = signal.iirpeak(fc / (SR / 2), q); y += g * signal.lfilter(b, a, out)
    return y * env_adsr(L, .35, .2, .9, .6) / (len(freqs) * 3)

def bass(f, dur):
    L = int(dur * SR); t = np.arange(L) / SR
    x = np.sin(2 * np.pi * f * t) + .35 * np.sin(4 * np.pi * f * t) + .1 * np.sin(6 * np.pi * f * t)
    return x * np.exp(-t * 3.5) * env_adsr(L, .004, 0, 1, .05)

def kick(dur=.35):
    L = int(dur * SR); t = np.arange(L) / SR
    f = 50 + 90 * np.exp(-t * 30); return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 9)

def timpani(f, dur=1.2):
    L = int(dur * SR); t = np.arange(L) / SR
    x = sum(a * np.sin(2 * np.pi * f * m * t) for m, a in ((1, 1), (1.5, .5), (1.98, .3), (2.44, .15)))
    hit = signal.lfilter(*signal.butter(2, 400 / (SR / 2)), rng.normal(0, 1, L)) * np.exp(-t * 40) * .6
    return (x * np.exp(-t * 3) + hit) * .7

def snare(dur=.16, brush=True):
    L = int(dur * SR); t = np.arange(L) / SR; n = rng.normal(0, 1, L)
    if brush: n = signal.lfilter(*signal.butter(2, [1500 / (SR / 2), 7000 / (SR / 2)], 'band'), n); return n * np.exp(-t * 28) * .7
    n = signal.lfilter(*signal.butter(2, 900 / (SR / 2), 'high'), n)
    return (n * np.exp(-t * 22) + .5 * np.sin(2 * np.pi * 190 * t) * np.exp(-t * 30)) * .8

def shaker(dur=.06):
    L = int(dur * SR); t = np.arange(L) / SR
    return signal.lfilter(*signal.butter(2, 6000 / (SR / 2), 'high'), rng.normal(0, 1, L)) * np.exp(-t * 60) * .5

def hoof(dur=.07, f=900):
    L = int(dur * SR); t = np.arange(L) / SR
    n = signal.lfilter(*signal.butter(2, [f * .6 / (SR / 2), f * 1.6 / (SR / 2)], 'band'), rng.normal(0, 1, L))
    return (n * 2 + np.sin(2 * np.pi * f * .5 * t)) * np.exp(-t * 70) * .5

def bell(f, dur=2.5):
    L = int(dur * SR); t = np.arange(L) / SR
    return sum(a * np.sin(2 * np.pi * f * m * t) * np.exp(-t * d) for m, a, d in ((1, 1, 1.6), (2.76, .5, 2.6), (5.4, .25, 4), (8.9, .12, 6))) * .4

def whip(dur=.35):
    L = int(dur * SR); t = np.arange(L) / SR; n = rng.normal(0, 1, L)
    f = signal.lfilter(*signal.butter(2, [2500 / (SR / 2), 9000 / (SR / 2)], 'band'), n)
    crack = np.exp(-((t - .12) / .006) ** 2) * 3
    return f * (np.exp(-((t - .1) / .05) ** 2) * .4 + crack)

def reverb(x, seconds=1.6, mix=.22, pre=.012):
    """stereo convolution with a decaying-noise impulse; circular so the tail wraps into the loop start"""
    L = int(seconds * SR); t = np.arange(L) / SR
    out = x.copy()
    for ch in range(2):
        ir = rng.normal(0, 1, L) * np.exp(-t * 6.9 / seconds)
        ir = signal.lfilter(*signal.butter(1, 5200 / (SR / 2)), ir); ir[:int(pre * SR)] = 0; ir /= np.sqrt((ir ** 2).sum())
        wet = signal.fftconvolve(np.concatenate([x[ch], x[ch][:L]]), ir)[:len(x[ch]) + L]
        w = wet[:len(x[ch])].copy(); w[:L] += wet[len(x[ch]):len(x[ch]) + L]          # wrap the tail
        out[ch] = x[ch] + mix * w
    return out

# ---------------------------------------------------------------- arrangement helpers
def chord_tones(name, octave=3):
    root = name.rstrip('m7'); minor = name.endswith('m') or name.endswith('m7')
    base = {'A': 'A', 'C': 'C', 'D': 'D', 'E': 'E', 'F': 'F', 'G': 'G'}[root[0]] + root[1:]
    r = hz(base + str(octave)); third = r * 2 ** ((3 if minor else 4) / 12); fifth = r * 2 ** (7 / 12)
    return r, third, fifth

def place_melody(tr, mel, beat, start, voice, gain, pan, octave_glide=True):
    t = start; prev = None
    for n, d in mel:
        if n != 'r':
            f = hz(n); x = voice(f, d * beat * .97, glide_from=prev) if voice is whistle else voice(f, d * beat * .95)
            tr.add(x, t, gain, pan); prev = f
        t += d * beat

def render(tr, name, bars, bpm):
    x = tr.buf
    x = reverb(x)
    x = x / (np.abs(x).max() + 1e-9) * .98
    x = np.tanh(x * 1.6) / np.tanh(1.6)                                   # gentle glue
    x *= .89
    P = int(PRE * SR)
    full = np.concatenate([x[:, -P:], x, x[:, :P]], axis=1)
    os.makedirs(os.path.join(ROOT, 'assets/audio'), exist_ok=True)
    wav = f'/tmp/{name}.wav'
    from scipy.io import wavfile
    wavfile.write(wav, SR, (full.T * 32767).astype(np.int16))
    mp3 = os.path.join(ROOT, f'assets/audio/{name}.mp3')
    subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', wav, '-codec:a', 'libmp3lame', '-b:a', '160k', mp3], check=True)
    print(name, f'{tr.n / SR:.3f}s loop, {bars} bars at {bpm} BPM ->', mp3, os.path.getsize(mp3) // 1024, 'KB')
    return tr.n / SR

# ---------------------------------------------------------------- rough instruments (v2)
def drive(x, k=3.0):
    return np.tanh(x * k) / np.tanh(k)

def twang(f, dur, gain_drive=2.5, bright=.85):
    """baritone electric: bright pluck, a little pick noise, overdrive"""
    x = pluck(f, dur, bright, .997)
    t = np.arange(len(x)) / SR
    pick = signal.lfilter(*signal.butter(2, 3000 / (SR / 2), 'high'), rng.normal(0, 1, len(x))) * np.exp(-t * 300) * .25
    x = drive((x + pick) * 1.2, gain_drive)
    x = signal.lfilter(*signal.butter(2, 4200 / (SR / 2)), x)          # amp cabinet roll-off
    return x * env_adsr(len(x), .001, 0, 1, .03)

def chug(f, dur):
    """palm-muted overdriven chug"""
    x = pluck(f, dur, .9, .985); t = np.arange(len(x)) / SR
    x = x * np.exp(-t * 14)
    x = drive(x * 2.5, 4.0); x = signal.lfilter(*signal.butter(2, 2600 / (SR / 2)), x)
    return x * env_adsr(len(x), .001, 0, 1, .02)

def harmonica(f, dur, bend=0.0):
    """reed: pulse wave with a nasal formant, breath and a bend up into the note"""
    L = int(dur * SR); t = np.arange(L) / SR
    bendc = 2 ** (-bend / 12 * np.exp(-t / .09)) if bend else 1
    vib = 1 + .012 * np.sin(2 * np.pi * 6.2 * t) * np.clip((t - .25) / .3, 0, 1)
    ph = np.cumsum(f * bendc * vib) / SR % 1
    x = np.where(ph < .32, 1.0, -.47)
    x = x + signal.lfilter(*signal.butter(2, [f / (SR / 2), min(.95, 3 * f / (SR / 2))], 'band'), rng.normal(0, 1, L)) * .25
    y = np.zeros(L)
    for fc, q, g in ((1100, 3, 1), (2400, 4, .6), (500, 2, .4)):
        b, a = signal.iirpeak(fc / (SR / 2), q); y += g * signal.lfilter(b, a, x)
    y = drive(y * .8, 1.8)
    return y * env_adsr(L, .03, .12, .8, min(.1, dur * .25)) * .5

def stomp(dur=.3):
    L = int(dur * SR); t = np.arange(L) / SR
    body = np.sin(2 * np.pi * np.cumsum(70 + 60 * np.exp(-t * 40)) / SR) * np.exp(-t * 12)
    wood = signal.lfilter(*signal.butter(2, [150 / (SR / 2), 900 / (SR / 2)], 'band'), rng.normal(0, 1, L)) * np.exp(-t * 35) * 1.5
    return drive(body + wood, 1.5)

def clap(dur=.2):
    L = int(dur * SR); t = np.arange(L) / SR; n = rng.normal(0, 1, L)
    n = signal.lfilter(*signal.butter(2, [900 / (SR / 2), 4000 / (SR / 2)], 'band'), n)
    e = sum(np.exp(-np.clip(t - d, 0, None) * 120) * (t >= d) for d in (0, .011, .022)) + np.exp(-t * 18) * .6
    return n * e * .6

def wind(seconds):
    L = int(seconds * SR); t = np.arange(L) / SR; n = rng.normal(0, 1, L)
    out = np.zeros(L)
    for fc, rate, ph in ((500, .07, 0), (900, .11, 2), (1500, .05, 4)):
        b, a = signal.iirpeak(fc / (SR / 2), 4); y = signal.lfilter(b, a, n)
        out += y * (.5 + .5 * np.sin(2 * np.pi * rate * t + ph)) ** 2
    return out * .25

def drone(f, seconds):
    L = int(seconds * SR); t = np.arange(L) / SR; out = np.zeros(L)
    for m, det in ((1, 0), (1, .003), (1.5, -.002), (2, .001)):
        out += 2 * ((np.cumsum(np.full(L, f * m * (1 + det))) / SR) % 1) - 1
    out = signal.lfilter(*signal.butter(2, 500 / (SR / 2)), out)
    return out * (.6 + .4 * np.sin(2 * np.pi * .05 * t) ** 2) * .15

def jawharp(f, dur=.6):
    L = int(dur * SR); t = np.arange(L) / SR
    x = 2 * ((f * t) % 1) - 1
    fc = 600 + 1400 * (.5 - .5 * np.cos(2 * np.pi * 3 * t)) * np.exp(-t * 2)   # the "boing" vowel sweep
    y = np.zeros(L); z1 = z2 = 0.0
    for i in range(0, L, 128):
        b, a = signal.iirpeak(min(.95, fc[i] / (SR / 2)), 6); seg, _ = signal.lfilter(b, a, x[i:i + 128], zi=[z1, z2]); y[i:i + 128] = seg; z1, z2 = _
    return y * np.exp(-t * 4) * .8

def anvil(dur=1.5):
    L = int(dur * SR); t = np.arange(L) / SR
    return sum(a * np.sin(2 * np.pi * f * t) * np.exp(-t * d) for f, a, d in ((1180, 1, 3), (2710, .6, 4), (3920, .4, 6), (5300, .25, 9))) * .4

def rattle(dur=1.2):
    """rattlesnake: fast noise pulses, swelling"""
    L = int(dur * SR); t = np.arange(L) / SR
    n = signal.lfilter(*signal.butter(2, 5000 / (SR / 2), 'high'), rng.normal(0, 1, L))
    am = (.5 + .5 * np.sign(np.sin(2 * np.pi * 55 * t))) * np.clip(t / dur * 1.3, 0, 1) * np.clip((dur - t) / .1, 0, 1)
    return n * am * .35

def clack(dur=.12):
    """wheel over a rail joint: metal knock + low thump"""
    L = int(dur * SR); t = np.arange(L) / SR
    metal = sum(a * np.sin(2 * np.pi * f * t) for f, a in ((1650, 1), (2870, .5), (4100, .3))) * np.exp(-t * 60)
    thump = np.sin(2 * np.pi * 90 * t) * np.exp(-t * 35)
    knock = signal.lfilter(*signal.butter(2, [400 / (SR / 2), 2500 / (SR / 2)], 'band'), rng.normal(0, 1, L)) * np.exp(-t * 80)
    return (metal * .5 + thump + knock * 1.2) * .7

def chuff(dur=.22):
    L = int(dur * SR); t = np.arange(L) / SR
    n = signal.lfilter(*signal.butter(2, [200 / (SR / 2), 2200 / (SR / 2)], 'band'), rng.normal(0, 1, L))
    return n * (1 - np.exp(-t * 200)) * np.exp(-t * 16) * .8

def rumble(seconds):
    L = int(seconds * SR); n = rng.normal(0, 1, L)
    low = signal.lfilter(*signal.butter(2, 110 / (SR / 2)), n) * 3
    hiss = signal.lfilter(*signal.butter(2, [2500 / (SR / 2), 7000 / (SR / 2)], 'band'), n) * .08
    return (low + hiss) * .5

def steam_whistle(dur=1.8):
    """three-chime steam whistle: a chord of breathy pipes rising into pitch"""
    L = int(dur * SR); t = np.arange(L) / SR; out = np.zeros(L)
    for f in (hz('B4'), hz('D5'), hz('F#5')):
        ff = f * (1 - .06 * np.exp(-t / .12)); ph = np.cumsum(ff) / SR
        out += np.sin(2 * np.pi * ph) + .3 * np.sin(4 * np.pi * ph)
        b, a = signal.iirpeak(f / (SR / 2), 12); out += signal.lfilter(b, a, rng.normal(0, 1, L)) * .6
    return out * env_adsr(L, .08, .2, .85, .35) * .22

def tom(f, dur=.4):
    L = int(dur * SR); t = np.arange(L) / SR
    ff = f * (1 + .6 * np.exp(-t * 25))
    return (np.sin(2 * np.pi * np.cumsum(ff) / SR) * np.exp(-t * 8) + signal.lfilter(*signal.butter(2, 600 / (SR / 2)), rng.normal(0, 1, L)) * np.exp(-t * 50) * .4) * .8

def gunshot(dur=1.2):
    L = int(dur * SR); t = np.arange(L) / SR; n = rng.normal(0, 1, L)
    crack = n * np.exp(-t * 90) * 1.5
    boom = signal.lfilter(*signal.butter(2, 400 / (SR / 2)), n) * np.exp(-t * 5) * 2.5
    echo = np.zeros(L); d = int(.28 * SR); echo[d:] = (crack + boom)[:-d] * .25
    return drive((crack + boom + echo) * .8, 2.0) * .6

def spring(x, mix=.35):
    """spring-reverb flavour for the guitar stem: dispersive allpass chirp + short metallic decay, circular"""
    L = int(1.4 * SR); t = np.arange(L) / SR
    ir = rng.normal(0, 1, L) * np.exp(-t * 5)
    for d in (.031, .037):
        k = int(d * SR); ir[k:] += ir[:-k] * .5
    ir = signal.lfilter(*signal.butter(2, [400 / (SR / 2), 4500 / (SR / 2)], 'band'), ir); ir /= np.sqrt((ir ** 2).sum())
    out = x.copy()
    for ch in range(2):
        wet = signal.fftconvolve(np.concatenate([x[ch], x[ch][:L]]), ir)[:len(x[ch]) + L]
        w = wet[:len(x[ch])].copy(); w[:L] += wet[len(x[ch]):len(x[ch]) + L]
        out[ch] = x[ch] + mix * w
    return out

def mixdown(stems, name, bars, bpm, rev=.14, master_drive=2.2):
    n = stems[0].n; x = np.zeros((2, n))
    for st in stems: x += st.buf
    x = reverb(x, 1.1, rev)
    x = x / (np.abs(x).max() + 1e-9)
    x = drive(x * 1.1, master_drive) * .9                          # rough, tape-like saturation
    P = int(PRE * SR)
    full = np.concatenate([x[:, -P:], x, x[:, :P]], axis=1)
    from scipy.io import wavfile
    wav = f'/tmp/{name}.wav'; wavfile.write(wav, SR, (full.T * 32767).astype(np.int16))
    mp3 = os.path.join(ROOT, f'assets/audio/{name}.mp3')
    subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', wav, '-codec:a', 'libmp3lame', '-b:a', '160k', mp3], check=True)
    print(name, f'{n / SR:.4f}s loop, {bars} bars at {bpm} BPM ->', os.path.getsize(mp3) // 1024, 'KB')
    return n / SR

RIFF = {   # baritone guitar riffs in beats, relative to the bar's root
    'a': [(0, 1), (0, .5), (3, .5), (5, 1), (6, .5), (5, .5)],          # root, root, m3, 4, b5, 4
    'b': [(0, 1), (0, .5), (-2, .5), (0, 1), (3, .5), (0, .5)],
}

# ---------------------------------------------------------------- base game: "Rattlesnake Ridge"
def base_game():
    bpm = 84; beat = 60 / bpm; bars = 16; L = bars * 4 * beat
    gtr, drm, lead, amb = Track(L), Track(L), Track(L), Track(L)
    roots = ['E2', 'E2', 'F2', 'E2', 'E2', 'E2', 'D2', 'E2', 'A2', 'E2', 'F2', 'E2', 'C2', 'B1', 'F2', 'E2']
    amb.add(wind(L + .5), 0, .25, 0)
    amb.add(drone(hz('E1'), L + .5), 0, .45, 0)
    for b, r in enumerate(roots):
        t0 = b * 4 * beat; f0 = hz(r)
        riff = RIFF['a' if b % 2 == 0 else 'b']; t = t0
        for semi_, d in riff:
            gtr.add(twang(f0 * 2 ** (semi_ / 12), d * beat * 1.4), t, .29, -.25); t += d * beat
        # stomp-clap: stomp 1, the "and" of 2, 3; claps on 2 and 4
        for q, g in ((0, .9), (1.5, .55), (2, .8)): drm.add(stomp(), t0 + q * beat, g * 1.0, 0)
        for q in (1, 3): drm.add(clap(), t0 + q * beat, .62, .2)
        for q in range(8): drm.add(shaker(.05), t0 + q * beat / 2, .07 if q % 2 else .04, .55)
        if b < 4 and b % 2 == 1: amb.add(jawharp(hz('E2') * 2, .7), t0 + 3 * beat, .35, -.5)
        if b in (7, 15): amb.add(rattle(1.3), t0 + 4 * beat - 1.3, .5, .6)
    for b in (0, 8): amb.add(anvil(), b * 4 * beat, .14, .45)
    mel = [('r', 16),
           ('B4', 2), ('A4', 1), ('G4', 1), ('Bb4', 1.5), ('A4', .5), ('G4', 2), ('E4', 1), ('G4', 1), ('A4', 1), ('D5', 1), ('B4', 4),
           ('E5', 3), ('D5', 1), ('B4', 2), ('G4', 2), ('A4', 1), ('C5', 1), ('A4', 1), ('F4', 1), ('E4', 4),
           ('E5', 2), ('D5', 1), ('B4', 1), ('C5', 1.5), ('B4', .5), ('A4', 2), ('B4', 1), ('A4', 1), ('F4', 1), ('A4', 1), ('E4', 3.5), ('r', .5)]
    t = 0
    for n, d in mel:
        if n != 'r': lead.add(harmonica(hz(n), d * beat * .96, bend=1.5 if d >= 1.5 else 0), t, 1.1, .15)
        t += d * beat
    gtr.buf = spring(gtr.buf)
    return mixdown([gtr, drm, lead, amb], 'bgm_basegame_loop', bars, bpm, rev=.12)

# ---------------------------------------------------------------- free spins: "Gold Train Heist"
def free_spins():
    bpm = 144; beat = 60 / bpm; bars = 16; L = bars * 4 * beat
    trn, gtr, drm, lead = Track(L), Track(L), Track(L), Track(L)
    roots = ['A2', 'A2', 'G2', 'A2', 'F2', 'G2', 'E2', 'E2', 'A2', 'A2', 'C3', 'G2', 'F2', 'E2', 'A2', 'E2']
    trn.add(rumble(L + .5), 0, 1.0, 0)
    for b, r in enumerate(roots):
        t0 = b * 4 * beat; f0 = hz(r)
        # train: steam chuffs on eighths (accent on the beat), rail-joint double clacks on 1 and 3
        for e8 in range(8): trn.add(chuff(), t0 + e8 * beat / 2, .85 if e8 % 2 == 0 else .5, -.3 if e8 % 2 else .3)
        for q in (0, 2):
            trn.add(clack(), t0 + q * beat, .95, -.2); trn.add(clack(), t0 + q * beat + beat / 4, .8, .2)
        # palm-muted chugs in eighths, open accent on 1
        for e8 in range(8):
            f = f0 * (2 ** (3 / 12) if e8 == 6 else 2 ** (7 / 12) if e8 == 7 else 1)
            gtr.add(chug(f, beat * .5), t0 + e8 * beat / 2, .55 if e8 == 0 else .38, -.3)
            gtr.add(chug(f, beat * .5), t0 + e8 * beat / 2 + .012, .3, .3)
        gtr.add(twang(f0 * 2, beat * 1.5), t0, .22, .3)
        # galloping toms (1, a-1... feel) and stomps
        for q in range(4):
            drm.add(tom(hz('A2')), t0 + q * beat, .45, -.1)
            drm.add(tom(hz('E2')), t0 + q * beat + beat * .75, .3, .1)
        drm.add(stomp(), t0, .7, 0); drm.add(stomp(), t0 + 2 * beat, .6, 0)
        drm.add(clap(), t0 + beat, .35, 0); drm.add(clap(), t0 + 3 * beat, .35, 0)
        if b in (3, 11): drm.add(gunshot(), t0 + 3.5 * beat, .5, .5)
        if b in (7, 15): drm.add(gunshot(), t0 + 3 * beat, .45, -.5); drm.add(gunshot(), t0 + 3.5 * beat, .5, .4)
    for b in (0, 8): trn.add(steam_whistle(2.2), b * 4 * beat, .8, .4)
    # brass stabs on the "and" of 4 every two bars, gritty brass lead from bar 3
    for b in range(1, 16, 2):
        r = hz(roots[b]) * 2
        for f in (r * 2, r * 2 ** (19 / 12), r * 2 ** (24 / 12) / 2):
            lead.add(drive(brass(f, beat * .45) * 2, 2), b * 4 * beat + 3.5 * beat, .18, -.15)
    mel = [('r', 8),
           ('E5', 1.5), ('D5', .5), ('C5', 1), ('B4', 1), ('A4', 2), ('C5', 1), ('E5', 1), ('F5', 1.5), ('E5', .5), ('D5', 1), ('C5', 1), ('D5', 2), ('B4', 2),
           ('G#4', 1), ('B4', 1), ('E5', 2), ('E5', 4),
           ('A5', 1.5), ('G5', .5), ('E5', 2), ('A4', 1), ('C5', 1), ('E5', 1), ('A5', 1), ('G5', 1.5), ('E5', .5), ('C5', 2), ('B4', 1), ('D5', 1), ('G5', 2),
           ('A5', 1.5), ('G5', .5), ('F5', 1), ('C5', 1), ('B4', 2), ('G#4', 2), ('A4', 1), ('C5', 1), ('E5', 1), ('A5', 1), ('G#5', 2), ('E5', 1.5), ('r', .5)]
    t = 0
    for n, d in mel:
        if n != 'r': lead.add(drive(brass(hz(n), d * beat * .95) * 2.2, 1.8), t, .4, .1)
        t += d * beat
    return mixdown([trn, gtr, drm, lead], 'bgm_freegame_loop', bars, bpm, rev=.1, master_drive=2.6)

if __name__ == '__main__':
    a = base_game(); b = free_spins()
    print(f"ASSET_MANIFEST.music: base {a:.4f}s, free spins {b:.4f}s, pre-roll {PRE}s")
