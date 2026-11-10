#!/usr/bin/env bash
# Refresh the vendored Banuba skills (full bundle with offline docs).
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
git -C "$tmp/ai-skills" rev-parse --short HEAD > "$root/.claude/skills/.banuba-source-commit"
cp "$tmp/ai-skills/VERSION" "$root/.claude/skills/.banuba-version"
echo "Updated Banuba skills to $(cat "$root/.claude/skills/.banuba-version") ($(cat "$root/.claude/skills/.banuba-source-commit"))"
