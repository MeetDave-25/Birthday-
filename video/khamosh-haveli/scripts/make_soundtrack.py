"""Synthesizes the whole KHAMOSH HAVELI score + sound design (no samples, no copyright).

Usage: python make_soundtrack.py [narration.wav]  ->  ../public/soundtrack.wav
If a narration wav is given, the music is ducked under it and it is mixed on top.
"""
import sys
from pathlib import Path

import numpy as np
from scipy import signal
from scipy.io import wavfile

SR = 48000
DUR = 60.0
N = int(SR * DUR)
rng = np.random.default_rng(1947)
mix = np.zeros((N, 2))


def t_axis(sec):
    return np.arange(int(sec * SR)) / SR


def place(x, at, gain=1.0, pan=0.0):
    """Add mono or stereo clip x at time `at` seconds."""
    i = int(at * SR)
    if i >= N:
        return
    if x.ndim == 1:
        l, r = np.sqrt(0.5 * (1 - pan)), np.sqrt(0.5 * (1 + pan))
        x = np.stack([x * l, x * r], axis=1)
    j = min(N, i + len(x))
    mix[i:j] += gain * x[: j - i]


def env(n, a, d, shape=4.0):
    e = np.ones(n)
    na = max(1, int(a * SR))
    e[:na] = np.linspace(0, 1, na)
    tail = np.linspace(0, 1, n - na)
    e[na:] = np.exp(-shape * tail / max(d, 1e-3) * (n - na) / SR) if d else 1
    return e


def lp(x, hz, order=4):
    b, a = signal.butter(order, hz / (SR / 2), 'low')
    return signal.lfilter(b, a, x)


def hp(x, hz, order=2):
    b, a = signal.butter(order, hz / (SR / 2), 'high')
    return signal.lfilter(b, a, x)


def bp(x, lo, hi, order=2):
    b, a = signal.butter(order, [lo / (SR / 2), hi / (SR / 2)], 'band')
    return signal.lfilter(b, a, x)


def noise(sec):
    return rng.standard_normal(int(sec * SR))


def reverb(x, sec=2.5, wet=0.35):
    ir_n = int(sec * SR)
    ir = rng.standard_normal((ir_n, 2)) * np.exp(-np.linspace(0, 7, ir_n))[:, None]
    ir[:, 0] = lp(ir[:, 0], 6000)
    ir[:, 1] = lp(ir[:, 1], 6000)
    if x.ndim == 1:
        x = np.stack([x, x], axis=1)
    out = np.stack([signal.fftconvolve(x[:, c], ir[:, c])[: len(x)] for c in range(2)], axis=1)
    out /= np.max(np.abs(out)) + 1e-9
    dry = x / (np.max(np.abs(x)) + 1e-9)
    return (1 - wet) * dry + wet * out


# ---------------------------------------------------------------- sounds
def tick():
    t = t_axis(0.06)
    x = bp(noise(0.06), 2500, 7000) * np.exp(-t * 120) + 0.4 * np.sin(2 * np.pi * 3200 * t) * np.exp(-t * 200)
    return x


def boom(sec=4.0, f0=70, f1=28):
    t = t_axis(sec)
    f = f1 + (f0 - f1) * np.exp(-t * 3)
    ph = 2 * np.pi * np.cumsum(f) / SR
    x = np.sin(ph) * np.exp(-t * 1.2) + 0.5 * lp(noise(sec), 180) * np.exp(-t * 4)
    x += 0.25 * bp(noise(sec), 200, 2000) * np.exp(-t * 18)
    return x


def heartbeat(at, bpm, count, gain):
    for k in range(count):
        s = at + k * 60 / bpm
        for off, g in ((0, 1.0), (0.18, 0.7)):
            t = t_axis(0.3)
            x = np.sin(2 * np.pi * 50 * t) * np.exp(-t * 18) + 0.3 * lp(noise(0.3), 120) * np.exp(-t * 25)
            place(x, s + off, gain * g)


def whoosh(sec=1.2, rev=False):
    t = t_axis(sec)
    x = bp(noise(sec), 300, 3000) * np.sin(np.pi * t / sec) ** 2
    return x[::-1] * np.linspace(0.2, 1, len(x)) if rev else x


def screech(sec=1.5, base=880):
    t = t_axis(sec)
    x = np.zeros_like(t)
    for k, d in enumerate([0, 0.6, 1.3, -0.9, 2.1]):  # dissonant cluster, string-like
        f = base * (2 ** (d / 12)) * (1 + 0.004 * np.sin(2 * np.pi * (5 + k) * t))
        x += signal.sawtooth(2 * np.pi * np.cumsum(f) / SR)
    x = bp(x, 400, 6000) * env(len(t), 0.02, sec, 3)
    return x / 5


def whisper(sec=2.0):
    t = t_axis(sec)
    x = bp(noise(sec), 1500, 7000)
    syll = 0.5 + 0.5 * np.sin(2 * np.pi * 4.2 * t + 2 * np.sin(2 * np.pi * 0.7 * t))
    return x * syll * np.sin(np.pi * t / sec)


def creak(sec=1.6):
    t = t_axis(sec)
    f = 140 + 60 * np.sin(2 * np.pi * 0.6 * t) + 25 * np.sin(2 * np.pi * 7 * t)
    pulses = (np.sin(2 * np.pi * np.cumsum(f) / SR) > 0.97).astype(float)
    x = bp(pulses + 0.05 * noise(sec), 300, 3000)
    return x * np.sin(np.pi * t / sec)


def footstep():
    t = t_axis(0.25)
    return lp(noise(0.25), 900) * np.exp(-t * 30) + 0.5 * np.sin(2 * np.pi * 90 * t) * np.exp(-t * 40)


def page_turn():
    t = t_axis(0.7)
    return hp(noise(0.7), 1200) * np.sin(np.pi * t / 0.7) ** 3 * (1 + 0.5 * np.sin(2 * np.pi * 18 * t))


def riser(sec):
    t = t_axis(sec)
    f = 200 * 2 ** (t / sec * 3)
    x = 0.5 * np.sin(2 * np.pi * np.cumsum(f) / SR) + bp(noise(sec), 500, 8000) * 0.6
    return x * (t / sec) ** 2


def scream(sec=1.0):
    t = t_axis(sec)
    f = 620 + 300 * np.sin(2 * np.pi * 9 * t) + 400 * t
    x = signal.sawtooth(2 * np.pi * np.cumsum(f) / SR) + 0.7 * signal.sawtooth(2 * np.pi * np.cumsum(f * 1.41) / SR)
    x = bp(x, 500, 5000) + 0.8 * bp(noise(sec), 1000, 9000)
    return x * env(len(t), 0.005, sec, 2.5)


# ---------------------------------------------------------------- beds
t = np.arange(N) / SR

# wind: whole film, swelling
wind = bp(noise(DUR), 150, 900) * (0.5 + 0.5 * np.sin(2 * np.pi * 0.07 * t + 1)) * 0.10
wind *= np.clip(1 - (t - 50) / 0.3, 0, 1) + np.clip((t - 51) / 0.1, 0, 1) * 0.6  # cut for jumpscare
place(np.stack([wind, np.roll(wind, 900)], axis=1), 0)

# dark drone from 4s: low A + tritone + detuned, slowly growing
drone = np.zeros(N)
for f, g in ((55, 1.0), (55.4, 0.8), (77.8, 0.5), (110.3, 0.3), (164.8, 0.15)):
    drone += g * np.sin(2 * np.pi * f * t + rng.uniform(0, 6))
drone = lp(drone, 400) * 0.16
shape = np.interp(t, [0, 4, 10, 30, 37.9, 38.0, 39.5, 44, 49.9, 50.0, 51.0, 51.1, 56, 59.5, 60],
                  [0, 0, 0.6, 0.9, 1.2, 0.0, 0.0, 1.3, 1.4, 0.0, 0.0, 1.2, 0.9, 0.3, 0])
drone *= shape
place(reverb(drone, 3.0, 0.3) * 0.16 * 3, 0)

# high tension strings 22s-38s
tens = screech(16.0, 1320) * np.interp(t_axis(16.0), [0, 6, 15.8, 16], [0, 0.5, 1, 0])
place(reverb(tens, 3.0, 0.5) * 0.10, 22)

# ---------------------------------------------------------------- events (sync with timeline.ts)
for k in range(4):  # clock ticks, then the clock stops
    place(reverb(tick(), 1.0, 0.3)[:, 0], 0.3 + k, 0.5, pan=0.2)
place(boom(3.0, 50, 25), 3.9, 0.25)
place(reverb(tick(), 2.0, 0.6)[:, 0], 15.0, 0.9)  # second-hand twitch
heartbeat(10.0, 62, 6, 0.55)
heartbeat(16.0, 80, 8, 0.6)
car = lp(noise(4.0), 160) * np.interp(t_axis(4.0), [0, 2.5, 3.4, 4], [0, 0.6, 0.6, 0]) + 0.3 * np.sin(2 * np.pi * 38 * t_axis(4.0))
place(car, 16.0, 0.5)
place(boom(0.6, 120, 60), 19.6, 0.35)  # car door
for k in range(6):
    place(reverb(footstep(), 1.5, 0.5), 20.2 + k * 0.55, 0.35)
for k in range(9):
    place(reverb(footstep(), 2.0, 0.6), 22.4 + k * 0.7, 0.25)
place(reverb(creak(), 2.5, 0.5), 23.6, 0.35, )
place(reverb(screech(0.9, 1760), 2.5, 0.6), 25.3, 0.28)  # ghost far
place(reverb(whisper(2.0), 2.0, 0.6), 26.4, 0.22)
place(boom(1.0, 200, 80) * 0.6 + bp(noise(1.0), 100, 1500) * np.exp(-t_axis(1.0) * 6), 26.8, 0.25)  # candles blow out
place(reverb(scream(0.5), 2.0, 0.5), 28.9, 0.35)  # ghost close sting
for at in (31.5, 33.5, 35.5):
    place(page_turn(), at, 0.35)
place(riser(4.0), 34.0, 0.3)
place(reverb(boom(5.0, 80, 25), 3.0, 0.3), 38.0, 0.9)  # THE photo
place(reverb(screech(2.0, 660), 3.0, 0.5), 40.5, 0.22)  # eyes glow
for k, at in enumerate((44.0, 45.5, 47.0, 48.5)):
    place(reverb(boom(1.6, 90, 35), 2.5, 0.3), at, 0.6)
    place(whoosh(1.0, rev=True), at - 1.0, 0.25)
place(reverb(whisper(2.4), 2.5, 0.6), 47.4, 0.3)
place(riser(1.6), 48.5, 0.35)
place(reverb(scream(1.0), 2.0, 0.4), 50.4, 0.9)  # JUMP SCARE
place(reverb(boom(5.0, 60, 22), 4.0, 0.5), 51.0, 1.0)  # title slam
place(reverb(screech(4.0, 440), 4.0, 0.6), 51.0, 0.12)
place(boom(1.2, 140, 50), 58.6, 0.45)  # door shuts
place(reverb(tick(), 3.0, 0.7)[:, 0], 59.3, 0.7)

# ---------------------------------------------------------------- narration (optional)
if len(sys.argv) > 1:
    sr, vo = wavfile.read(sys.argv[1])
    vo = vo.astype(np.float64)
    if vo.ndim > 1:
        vo = vo.mean(axis=1)
    vo /= np.max(np.abs(vo)) + 1e-9
    if sr != SR:
        vo = signal.resample_poly(vo, SR, sr)
    vo = vo[:N] if len(vo) >= N else np.pad(vo, (0, N - len(vo)))
    duck = np.convolve(np.abs(vo) > 0.02, np.ones(SR // 5) / (SR // 5), 'same')
    mix *= (1 - 0.5 * np.clip(duck, 0, 1))[:, None]
    vo_st = reverb(vo, 1.2, 0.18)
    mix += 0.9 * vo_st

# master: soft clip + normalize
mix = np.tanh(mix * 1.4)
mix /= np.max(np.abs(mix)) + 1e-9
mix *= 0.93
out = Path(__file__).resolve().parent.parent / 'public' / 'soundtrack.wav'
out.parent.mkdir(exist_ok=True)
wavfile.write(out, SR, (mix * 32767).astype(np.int16))
print('wrote', out)
