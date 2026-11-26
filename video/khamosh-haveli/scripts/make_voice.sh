#!/usr/bin/env bash
# Adds Hinglish narration with Piper (free, offline Hindi voice), then re-mixes the soundtrack.
# Needs network access to huggingface.co once (to download the voice model).
# Usage: bash scripts/make_voice.sh            (from video/khamosh-haveli)
set -euo pipefail
cd "$(dirname "$0")/.."
VOICE=hi_IN-pratham-medium
BASE=https://huggingface.co/rhasspy/piper-voices/resolve/main/hi/hi_IN/pratham/medium
mkdir -p .voice && cd .voice
python3 -m venv venv >/dev/null 2>&1 || true
./venv/bin/pip install -q piper-tts numpy scipy
[ -f $VOICE.onnx ] || curl -sSLO "$BASE/$VOICE.onnx"
[ -f $VOICE.onnx.json ] || curl -sSLO "$BASE/$VOICE.onnx.json"

# Lines in Devanagari so the Hindi voice pronounces them naturally; start time in seconds.
cat > lines.tsv <<'EOF'
4.6	कहते हैं... इस हवेली में वक़्त रुक गया है।
10.6	पचहत्तर साल से... यहाँ से कोई ज़िंदा नहीं लौटा।
17.4	रिया सिर्फ़ एक स्टोरी के लिए आई थी।
23.1	लेकिन इस हवेली में... वो अकेली नहीं थी।
31.4	फिर उसने वो एल्बम खोला...
39.1	...और उसमें अपनी ही तस्वीर थी।
47.4	रिया... तुम वापस आ गई।
56.4	कुछ दरवाज़े... बंद ही रहने चाहिए।
EOF

i=0
while IFS=$'\t' read -r at text; do
  echo "$text" | ./venv/bin/piper -m $VOICE.onnx --length_scale 1.25 -f line$i.wav
  echo "$at line$i.wav" >> list.txt; i=$((i+1))
done < lines.tsv

# deepen + place each line on a 60s timeline
inputs=(); filters=""; n=0
while read -r at f; do
  inputs+=(-i "$f")
  ms=$(python3 -c "print(int($at*1000))")
  filters+="[$n:a]asetrate=22050*0.9,aresample=48000,atempo=1.11,adelay=${ms}|${ms}[v$n];"
  n=$((n+1))
done < list.txt
mixin=$(for k in $(seq 0 $((n-1))); do printf "[v$k]"; done)
ffmpeg -y -v error "${inputs[@]}" -filter_complex "${filters}${mixin}amix=inputs=$n:normalize=0,apad=whole_dur=60[out]" -map "[out]" -ac 1 -ar 48000 narration.wav
rm list.txt
cd ..
.voice/venv/bin/python scripts/make_soundtrack.py .voice/narration.wav
echo "Narration mixed. Now run: npm run render"
