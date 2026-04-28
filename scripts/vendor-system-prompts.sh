#!/usr/bin/env bash
# Vendor Piebald's Claude Code system prompt reference into repos/ for local
# anchor checks and prompt diff research.
#
# repos/ is gitignored. Refresh with: scripts/vendor-system-prompts.sh --force [ref]

set -euo pipefail

REPO_URL="https://github.com/Piebald-AI/claude-code-system-prompts.git"
TARGET_DIR="repos/claude-code-system-prompts"
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
    echo "system prompts already vendored at $TARGET_DIR" >&2
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
echo "Vendored Claude Code system prompts at $SHA"
