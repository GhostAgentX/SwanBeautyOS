# Beauty OS · AR Design

The production studio: looks, synthetic models, the Lab, assets, catalog and publishing. Next.js 16 (App Router), Drizzle ORM on Postgres (PGlite locally), sharp + ffmpeg media pipeline.

```bash
npm run db:seed -w @beautyos/ar-design     # from the repo root
npm run dev -w @beautyos/ar-design         # http://localhost:3000
npm test -w @beautyos/ar-design
```

| Path | What |
|---|---|
| `src/app/b/[brand]/…` | Studio pages (Studio, look editor, Models, Lab, Assets, Catalog, Publish) |
| `src/app/actions.ts` | Server actions (all mutations) |
| `src/app/api/studio/…` | Uploads, exports, generation, formulation |
| `src/app/api/v1/…` | Public, read-only customer API |
| `src/server/` | `repo` (data), `services` (workflows), `media`, `storage`, `composition` |
| `src/modules/` | Module registry + built-in implementations (extension points) |
| `src/lib/` | Shared client/server logic: export profiles, synthetic model specs |
| `drizzle/` | SQL migrations |

Architecture and deployment: `../../docs/architecture.md`.
