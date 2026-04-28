#!/usr/bin/env bash
# Vendor upstream tweakcc into repos/tweakcc for reference.
#
# repos/ is gitignored. We never commit tweakcc; we just pin the commit SHA
# of whatever we ported from in THIRD_PARTY_NOTICES.md so a reviewer can
# diff our ports against a known upstream revision.
#
# Refresh with: scripts/vendor-tweakcc.sh --force [ref]

set -euo pipefail

REPO_URL="https://github.com/Piebald-AI/tweakcc.git"
TARGET_DIR="repos/tweakcc"
FORCE=0
REF="main"

if [ "${1:-}" = "--force" ]; then
  FORCE=1
  shift
fi

if [ "${1:-}" != "" ]; then
  REF="$1"
fi

if [ -d "$TARGET_DIR/.git" ]; then
  if [ "$FORCE" != "1" ]; then
    echo "tweakcc already vendored at $TARGET_DIR" >&2
    echo "rerun with --force to refresh" >&2
    exit 0
  fi
  rm -rf "$TARGET_DIR"
fi

mkdir -p repos
git clone --depth=1 --branch "$REF" "$REPO_URL" "$TARGET_DIR"

cd "$TARGET_DIR"
SHA=$(git rev-parse HEAD)
echo
echo "Vendored tweakcc at $SHA"
echo "Update THIRD_PARTY_NOTICES.md with this SHA when porting code."
