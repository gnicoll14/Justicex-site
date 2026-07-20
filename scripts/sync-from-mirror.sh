#!/usr/bin/env bash
# sync-from-mirror.sh — reconcile Cowork's Drive mirror into the justicex-site git working tree.
#
# WHY: some chats aren't launched as "code" chats but end up producing repo files (site/app code).
# Those files land in the Drive mirror (Claude Design/JusticeX), NOT in your git tree. This script
# copies the changed web files from the mirror into your working tree and shows you exactly what
# changed, so the "mirror -> tree" step is one command instead of manual cp's. It never commits or
# pushes — you review, then commit/push yourself.
#
# USAGE (run from inside your justicex-site checkout):
#   scripts/sync-from-mirror.sh            # DRY RUN (default, safe): list what WOULD change
#   scripts/sync-from-mirror.sh --apply    # copy the files in, then print git status + diff
#   TREE=~/code/justicex-site MIRROR='/path/to/Claude Design/JusticeX' scripts/sync-from-mirror.sh --apply
#
# NOTE: make sure the Drive mirror folder is "Available offline" (Google Drive) so files are real,
#       not cloud-only placeholders — otherwise rsync copies empty stubs.

set -euo pipefail

# --- resolve the git working tree (default: the git root of the current directory) ---
TREE="${TREE:-$(git rev-parse --show-toplevel 2>/dev/null || true)}"
if [[ -z "${TREE}" || ! -d "${TREE}/.git" ]]; then
  echo "ERROR: not inside a git working tree, and \$TREE is not set."
  echo "  Run this from your justicex-site checkout, or set it explicitly:"
  echo "  TREE=~/code/justicex-site $0 --apply"
  exit 1
fi

# --- resolve the Drive mirror (default: the known JusticeX mirror path) ---
DEFAULT_MIRROR="$HOME/Library/CloudStorage/GoogleDrive-gregg.nicoll@justicex.ai/My Drive/Parent Folder/1. JusticeX.ai - Claude/Claude Design/JusticeX"
MIRROR="${MIRROR:-$DEFAULT_MIRROR}"
if [[ ! -d "${MIRROR}" ]]; then
  echo "ERROR: mirror folder not found:"
  echo "  ${MIRROR}"
  echo "  Set it explicitly: MIRROR='/path/to/Claude Design/JusticeX' $0 --apply"
  exit 1
fi

MODE="dry"
[[ "${1:-}" == "--apply" ]] && MODE="apply"

# Never copy these from the mirror into the repo (mirror-only cruft / never-tracked):
EXCLUDES=(
  --exclude '.git/'
  --exclude '_backups/'
  --exclude 'uploads/'
  --exclude 'node_modules/'
  --exclude '.DS_Store'
  --exclude '*.tmp'
)

echo "Mirror : ${MIRROR}"
echo "Tree   : ${TREE}"
echo "Mode   : ${MODE}"
echo "-------------------------------------------------------------"

# -rlt = recurse, copy symlinks as links, preserve times. NO --delete: we never remove files from
# the tree that aren't in the mirror (the tree can legitimately hold things the mirror doesn't).
RSYNC_OPTS=( -rlt --itemize-changes "${EXCLUDES[@]}" )

if [[ "${MODE}" == "dry" ]]; then
  echo "DRY RUN — files that WOULD change (nothing copied):"
  echo
  rsync "${RSYNC_OPTS[@]}" --dry-run "${MIRROR}/" "${TREE}/" || true
  echo
  echo "Re-run with --apply to copy these in, then review 'git status' before committing."
  exit 0
fi

echo "Copying changed files (mirror -> tree)…"
echo
rsync "${RSYNC_OPTS[@]}" "${MIRROR}/" "${TREE}/"
echo
cd "${TREE}"
echo "=== git status (short) ==="
git status --short || true
echo
echo "=== git diff --stat ==="
git --no-pager diff --stat || true
echo
echo "-------------------------------------------------------------"
echo "Review the diff above. Then, on a feature branch:"
echo "  git checkout -b <branch>   # if not already on one"
echo "  git add -A && git commit -m '<message>'"
echo "  git push -u origin <branch>"
echo
echo "This script does NOT commit or push — that stays with you."
