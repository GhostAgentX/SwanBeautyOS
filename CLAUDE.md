# Beauty OS

Multi-brand AR beauty platform (by Entelus). Swan Beauty is the first brand. Architecture: `docs/architecture.md`.

## Layout
- `packages/look-format`: Beauty OS Look Document, validation, AR platform adapters
- `packages/entelus-ar-sdk`: Entelus AR SDK (`@entelus/ar-sdk`): face tracking, makeup geometry, WebGL2 rendering; used by both apps
- `packages/color-lab`: color science, libraries, swatch analysis, skin tone, formulation
- `apps/ar-design`: production studio (Next.js 16 + Drizzle/Postgres). Read `apps/ar-design/AGENTS.md` before changing Next.js code.
- `apps/tryon`: customer try-on (Vite)

## Rules
- AR engine work happens in `packages/entelus-ar-sdk` (see its README and docs/architecture.md#entelus-ar-sdk). Verify visual changes by rendering the reference portrait in a browser.
- Secrets come from the repo-root `.env` (see `.env.example`). Never hardcode or commit them. Live AR needs no key.
- New capabilities plug into the module registry (`apps/ar-design/src/modules`) or `registerAdapter()`; don't call concrete modules directly.
- Schema changes: edit `apps/ar-design/src/db/schema.ts`, then `npm run db:generate -w @beautyos/ar-design`. Never edit released migrations.
- Run `npm test` and `npm run typecheck` before committing.
