#!/usr/bin/env bash
# Renders every 3D still plate to public/plates/<id>.jpg  (usage: bash scripts/render-plates.sh [id ...])
set -euo pipefail
cd "$(dirname "$0")/.."
BROWSER=${BROWSER:-/opt/pw-browsers/chromium}
ALL="ext ext-ghost gate clock-a clock-b corr-bright corr-dim corr-ghost-far corr-ghost-near corr-dark album-1 album-2 photo photo-eyes title-a title-b"
IDS=${*:-$ALL}
npx remotion bundle src/index.ts --out-dir .bundle --log=error >/dev/null
for id in $IDS; do
  s=$(date +%s)
  npx remotion still .bundle Plate public/plates/$id.jpg --props="{\"plate\":\"$id\"}" --gl=swangle \
    --jpeg-quality=95 --timeout=300000 --browser-executable="$BROWSER" --log=error >/dev/null
  echo "$id: $(( $(date +%s)-s ))s"
done
