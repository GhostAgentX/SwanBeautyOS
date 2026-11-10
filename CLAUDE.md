# Swan Beauty OS

Beauty platform built on Banuba SDKs (Face AR for makeup try-on and beautification; Video/Photo Editor for content).

## Layout
- `apps/`: one folder per client app (e.g. `apps/web`, `apps/mobile`)
- `docs/`: project docs; see `docs/banuba-skills.md`
- `.claude/skills/`: vendored Banuba skills with offline SDK docs (do not edit by hand; use `scripts/update-banuba-skills.sh`)

## Rules
- Use the Banuba skills (`/far-general`, `/build-video-editor`, `/build-photo-editor`) for SDK work, and their bundled docs before web lookups.
- The Banuba license token comes from `BANUBA_CLIENT_TOKEN` in `.env`. Never hardcode or commit it.
