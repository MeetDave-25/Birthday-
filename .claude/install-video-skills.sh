#!/usr/bin/env bash
# Installs the cinematic video-editing skill pack into ~/.claude/skills (global, all projects).
# Run on your own computer:  bash .claude/install-video-skills.sh
set -euo pipefail
DEST="$HOME/.claude/skills"; TMP="$(mktemp -d)"; mkdir -p "$DEST"
HERE="$(cd "$(dirname "$0")" && pwd)"

# 1. Skills bundled in this repo (Remotion official, video-use, DaVinci, toolkit, ECC video)
cp -r "$HERE/skills/"* "$DEST/"

# 2. video-shotcraft (cinematic shot cards + film template; ~44 MB, not stored in repo)
git clone --depth 1 https://github.com/Vincentwei1021/video-shotcraft "$TMP/shotcraft"
rm -rf "$TMP/shotcraft"/{.git,demos,gallery,videos}
rm -rf "$DEST/video-shotcraft"; mv "$TMP/shotcraft" "$DEST/video-shotcraft"
rm -rf "$TMP"

echo "Installed $(ls "$DEST" | wc -l) skills into $DEST"
echo "Required tools: ffmpeg, Node 18+, Python 3.10+.  Optional: Blender, DaVinci Resolve Studio, Manim."
echo "Optional API keys (in env): ELEVENLABS_API_KEY (voice/transcripts), FAL_KEY (AI video gen)."
