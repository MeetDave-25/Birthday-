#!/usr/bin/env bash
# Regenerates the Hinglish narration with free offline Piper voices and re-mixes the soundtrack.
# Voices are downloaded from the sherpa-onnx GitHub release (no API key needed).
# Usage (from video/khamosh-haveli):  bash scripts/make_voice.sh && npm run render
set -euo pipefail
cd "$(dirname "$0")/.."
mkdir -p .voice/models
python3 -m venv .voice/venv >/dev/null 2>&1 || true
.voice/venv/bin/pip install -q piper-tts numpy scipy soundfile
REL=https://github.com/k2-fsa/sherpa-onnx/releases/download/tts-models
for m in vits-piper-hi_IN-rohan-medium vits-piper-hi_IN-priyamvada-medium; do
  if [ ! -d .voice/models/$m ]; then
    curl -sSL "$REL/$m.tar.bz2" | tar xj -C .voice/models
  fi
done
.voice/venv/bin/python scripts/make_voice.py .voice/models
.voice/venv/bin/python scripts/make_soundtrack.py .voice/narration.wav
echo "Narration mixed into public/soundtrack.wav. Now run: npm run render"
