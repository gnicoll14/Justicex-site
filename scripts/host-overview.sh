#!/usr/bin/env bash
# Host a downloaded NotebookLM asset into assets/overviews/.
# Video files are faststart-remuxed for web streaming; other files are copied.
# Run from the repo root.
#
# Usage:
#   scripts/host-overview.sh ~/Downloads/whatever.mp4 justicex-markets-video-web.mp4
#   scripts/host-overview.sh newest justicex-markets-video-web.mp4   # picks newest ~/Downloads/*.mp4
#   scripts/host-overview.sh ~/Downloads/deck.pdf   justicex-markets-deck.pdf
#
# Then: git add assets/overviews/<name> <page>.html && git commit -m "..." && git push
set -euo pipefail
SRC="${1:?source file path, or the word 'newest'}"
OUT="${2:?output filename, e.g. justicex-markets-video-web.mp4}"
DEST="assets/overviews"
[ -d "$DEST" ] || { echo "Run this from the repo root (no ./$DEST here)."; exit 1; }

if [ "$SRC" = "newest" ]; then
  SRC=$(ls -t "$HOME"/Downloads/*.mp4 2>/dev/null | head -1 || true)
fi
[ -n "${SRC:-}" ] && [ -f "$SRC" ] || { echo "Source not found: ${SRC:-<empty>}"; exit 1; }

case "$OUT" in
  *.mp4)
    if command -v ffmpeg >/dev/null 2>&1; then
      ffmpeg -y -i "$SRC" -c copy -movflags +faststart "$DEST/$OUT"
    else
      echo "(ffmpeg not found — copying as-is, without faststart; fine for short web clips)"
      cp "$SRC" "$DEST/$OUT"
    fi
    ;;
  *) cp "$SRC" "$DEST/$OUT" ;;
esac
echo "hosted -> $DEST/$OUT ($(du -h "$DEST/$OUT" | cut -f1))"
echo "next:  git add $DEST/$OUT <page>.html && git commit -m '...' && git push"
