# AR SDK skills for Claude Code

The AR engine's vendor publishes AI skills for Claude Code (SDK docs plus code generation). The full bundle, with offline SDK docs, is vendored in `.claude/skills/` and keeps its original attribution and license (Apache-2.0).
Source: https://github.com/Banuba/ai-skills (pinned commit in `.claude/skills/.ar-sdk-source-commit`).

| Command | Use it for |
|---|---|
| `/far-general` | Face AR SDK: AR makeup, beautification, face filters, virtual background (Web, Android, iOS, C++, Flutter, React Native) |
| `/build-video-editor` | Add the vendor's Video Editor SDK (mobile) |
| `/build-photo-editor` | Add the vendor's Photo Editor SDK (mobile) |
| `/explain-video-editor-photo-editor-docs` | Look up Video/Photo Editor docs |

## Requirements
- An AR SDK license key in `.env` as `BEAUTYOS_AR_LICENSE_KEY`.
- Web Face AR needs HTTPS (or localhost) and camera permission.

## Updating
`npx skills update` does not track this vendored copy. Run `scripts/update-ar-sdk-skills.sh` instead.

## Note on the "may be outdated" warning
The skills warn when they are more than 6 weeks old. As of 2026-11-10 the bundle (v0.8.0, Aug 2026) is the latest published.

## Where the engine is used
- `packages/tryon-engine`: the Beauty OS AR engine, used by both apps.
- `apps/tryon`: customer try-on. See `apps/tryon/README.md`.
- `apps/ar-design`: AR Design studio's live preview.
