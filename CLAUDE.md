# Beauty OS

Multi-brand AR beauty platform (by Entelus). Swan Beauty is the first brand. Architecture: `docs/architecture.md`.

## Layout
- `packages/look-format`: Beauty OS Look Document, validation, AR platform adapters
- `packages/tryon-engine`: Banuba player shared by both apps
- `packages/color-lab`: color science, libraries, swatch analysis, skin tone, formulation
- `apps/ar-design`: production studio (Next.js 16 + Drizzle/Postgres). Read `apps/ar-design/AGENTS.md` before changing Next.js code.
- `apps/tryon`: customer try-on (Vite)
- `.claude/skills/`: vendored Banuba skills (update with `scripts/update-banuba-skills.sh`)

## Rules
- Use the Banuba skills (`/far-general`, `/build-video-editor`, `/build-photo-editor`) and their bundled docs for SDK work.
- Secrets come from the repo-root `.env` (see `.env.example`). Never hardcode or commit them.
- New capabilities plug into the module registry (`apps/ar-design/src/modules`) or `registerAdapter()`; don't call concrete modules directly.
- Schema changes: edit `apps/ar-design/src/db/schema.ts`, then `npm run db:generate -w @beautyos/ar-design`. Never edit released migrations.
- Run `npm test` and `npm run typecheck` before committing.
