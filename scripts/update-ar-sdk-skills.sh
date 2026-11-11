#!/usr/bin/env bash
# Refresh the vendored AR SDK skills for Claude Code (full bundle with offline docs).
# Upstream is the SDK vendor's public ai-skills repository (see docs/ar-sdk-skills.md).
set -euo pipefail
root="$(cd "$(dirname "$0")/.." && pwd)"
tmp="$(mktemp -d)"
trap 'rm -rf "$tmp"' EXIT
git clone --depth 1 https://github.com/Banuba/ai-skills "$tmp/ai-skills"
for d in "$tmp"/ai-skills/.claude/skills/*/; do
  name="$(basename "$d")"
  rm -rf "$root/.claude/skills/$name"
  cp -r "$d" "$root/.claude/skills/$name"
done
git -C "$tmp/ai-skills" rev-parse --short HEAD > "$root/.claude/skills/.ar-sdk-source-commit"
cp "$tmp/ai-skills/VERSION" "$root/.claude/skills/.ar-sdk-version"
echo "Updated AR SDK skills to $(cat "$root/.claude/skills/.ar-sdk-version") ($(cat "$root/.claude/skills/.ar-sdk-source-commit"))"
