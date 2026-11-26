"""Hinglish narration for KHAMOSH HAVELI with free offline Piper voices (pip install piper-tts).

Voices come from the sherpa-onnx GitHub release "tts-models" (no API key):
  vits-piper-hi_IN-rohan-medium      (narrator, male)
  vits-piper-hi_IN-priyamvada-medium (ghost whisper, female)

Usage:
  python scripts/make_voice.py <models_dir>
Writes .voice/narration.wav (60 s, 48 kHz), then run:
  python scripts/make_soundtrack.py .voice/narration.wav && npm run render
"""
import json
import subprocess
import sys
from pathlib import Path

import numpy as np
import soundfile as sf

ROOT = Path(__file__).resolve().parent.parent
MODELS = Path(sys.argv[1] if len(sys.argv) > 1 else ROOT / '.voice' / 'models')
OUT = ROOT / '.voice'
OUT.mkdir(exist_ok=True)
FPS = 30
SR = 48000

# (start frame, end frame, text in Devanagari for natural pronunciation, voice)
# Windows match NARRATION in src/timeline.ts (the on-screen subtitles).
LINES = [
    (135, 285, 'कहते हैं, इस हवेली में, वक़्त रुक गया है।', 'narrator'),
    (315, 465, 'पचहत्तर साल से, यहाँ से कोई ज़िंदा नहीं लौटा।', 'narrator'),
    (520, 650, 'रिया, सिर्फ़ एक स्टोरी के लिए आई थी।', 'narrator'),
    (690, 880, 'लेकिन इस हवेली में, वो अकेली नहीं थी।', 'narrator'),
    (940, 1120, 'फिर उसने, वो एल्बम खोला।', 'narrator'),
    (1170, 1300, 'और उसमें, अपनी ही तस्वीर थी।', 'narrator'),
    (1420, 1495, 'रिया, तुम वापस आ गई।', 'ghost'),
    (1690, 1780, 'कुछ दरवाज़े, बंद ही रहने चाहिए।', 'narrator'),
]

VOICES = {
    'narrator': ('vits-piper-hi_IN-rohan-medium', 'hi_IN-rohan-medium.onnx', 1.18),
    'ghost': ('vits-piper-hi_IN-priyamvada-medium', 'hi_IN-priyamvada-medium.onnx', 1.25),
}

# ffmpeg chains: narrator = deeper, warmer, close-mic trailer voice; ghost = airy, pitched, echoing whisper
FX = {
    'narrator': 'asetrate={sr}*0.94,aresample=48000,atempo=1.04,'
    'equalizer=f=110:t=q:w=1:g=5,equalizer=f=3500:t=q:w=1.5:g=2,'
    'acompressor=threshold=-20dB:ratio=3:attack=10:release=150,aecho=0.8:0.4:50:0.07',
    'ghost': 'asetrate={sr}*0.93,aresample=48000,highpass=f=350,'
    'aecho=0.8:0.7:120|240|420:0.35|0.25|0.15,tremolo=f=6:d=0.3,volume=0.9',
}

PIPER = Path(sys.executable).with_name('piper')


def synth(voice: str, text: str, out: Path):
    d, onnx, length_scale = VOICES[voice]
    base = MODELS / d
    subprocess.run(
        [str(PIPER), '-m', str(base / onnx), '-c', str(base / (onnx + '.json')), '--length-scale', str(length_scale), '-f', str(out)],
        input=text.encode(), check=True, capture_output=True,
    )


def duration(path: Path) -> float:
    return float(subprocess.check_output(['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', str(path)]))


timeline = np.zeros((int(60 * SR), ), dtype=np.float32)
report = []
for i, (start, end, text, voice) in enumerate(LINES):
    raw = OUT / f'line{i}_raw.wav'
    synth(voice, text, raw)
    fx = OUT / f'line{i}.wav'
    chain = FX[voice].format(sr=sf.info(raw).samplerate)
    subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', str(raw), '-af', chain, '-ar', str(SR), '-ac', '1', str(fx)], check=True)
    window = (end - start) / FPS - 0.3
    d = duration(fx)
    if d > window:  # speed up just enough to fit its subtitle window
        tempo = min(1.35, d / window)
        fit = OUT / f'line{i}_fit.wav'
        subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', str(fx), '-af', f'atempo={tempo:.3f}', str(fit)], check=True)
        fx = fit
        d = duration(fx)
    clip, _ = sf.read(fx, dtype='float32')
    clip = clip / (np.max(np.abs(clip)) + 1e-9) * (0.6 if voice == 'ghost' else 0.95)
    at = int((start / FPS + 0.15) * SR)
    timeline[at:at + len(clip)] += clip[: len(timeline) - at]
    report.append({'line': i, 'voice': voice, 'start_s': round(start / FPS + 0.15, 2), 'dur_s': round(d, 2), 'window_s': round(window, 2)})

sf.write(OUT / 'narration.wav', timeline, SR)
print(json.dumps(report, indent=1))
print('wrote', OUT / 'narration.wav')
