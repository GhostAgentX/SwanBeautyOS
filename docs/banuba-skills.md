# Banuba AI skills in this repo

The full Banuba skill bundle (with offline SDK docs) is vendored in `.claude/skills/`.
Source: https://github.com/Banuba/ai-skills (commit in `.claude/skills/.banuba-source-commit`).

| Command | Use it for |
|---|---|
| `/far-general` | Face AR SDK: AR makeup, beautification, face filters, virtual background (Web, Android, iOS, C++, Flutter, React Native) |
| `/build-video-editor` | Add a Banuba Video Editor (mobile) |
| `/build-photo-editor` | Add a Banuba Photo Editor (mobile) |
| `/explain-video-editor-photo-editor-docs` | Look up Video/Photo Editor docs |

## Requirements
- A Banuba license token (sales@banuba.com) in `.env` as `BANUBA_CLIENT_TOKEN`.
- Web Face AR needs HTTPS (or localhost) and camera permission.

## Updating
`npx skills update` does not track this vendored copy. Run `scripts/update-banuba-skills.sh` instead.

## Note on the "may be outdated" warning
The skills warn when they are more than 6 weeks old. As of 2026-11-10 the bundle (v0.8.0, Aug 2026) is the latest Banuba has published.
