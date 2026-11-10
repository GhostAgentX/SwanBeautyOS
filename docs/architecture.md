# Beauty OS architecture

Beauty OS is a multi-brand AR beauty platform, operated by Entelus. Creative teams author makeup looks, synthetic models and media in **AR Design**, and customers try published looks in the **try-on** app (standalone or embedded on a storefront). Swan Beauty is the first brand.

```
                        ┌──────────────────────────── AR Design (apps/ar-design, Next.js) ────────────────────────────┐
 creative team ───────▶ │ Studio · Look editor · Models · Lab · Assets · Catalog · Publish                           │
                        │        │ server actions / route handlers                                                    │
                        │        ▼                                                                                    │
                        │ services ──▶ repo (Drizzle) ──▶ Postgres (PGlite locally)                                   │
                        │    │   └──▶ media (sharp, ffmpeg) ──▶ storage (local disk │ Vercel Blob)                    │
                        │    └──────▶ module registry: image generators · formulators · enhancers · storage           │
                        │                                                                                             │
                        │ /api/v1/brands/:brand/looks  (public, CORS, CDN-cached)                                     │
                        └──────────────────────────────────────────┬──────────────────────────────────────────────────┘
                                                                   │ published look documents
                        ┌──────────── try-on (apps/tryon, Vite) ───▼──────────┐
 customers ───────────▶ │ looks · intensity · compare · photo/video · capture │  ← embeddable <iframe>
                        └─────────────────────────────────────────────────────┘
 shared packages:  @beautyos/look-format · @beautyos/tryon-engine · @beautyos/color-lab
```

## Workspace

| Path | Package | Role |
|---|---|---|
| `packages/look-format` | `@beautyos/look-format` | The **Beauty OS Look Document**: platform-neutral schema (regions, neutral finishes, materials, overlays, asset refs), validation, and **platform adapters** (Banuba first). |
| `packages/tryon-engine` | `@beautyos/tryon-engine` | Banuba WebAR player for look documents: camera/photo/video input, live edits, asset packaging into effects, snapshots, recording. Used by both apps. |
| `packages/color-lab` | `@beautyos/color-lab` | Digital Lab core: color science (sRGB/Lab/OKLab/CMYK, CIEDE2000), color libraries (ASE/CSV, licensed Pantone imports), swatch/chip analysis, skin-tone reasoning, look formulation, rule-based prompt parsing. |
| `apps/ar-design` | `@beautyos/ar-design` | The production studio (Next.js 16, Postgres via Drizzle). |
| `apps/tryon` | `@beautyos/tryon` | Customer try-on (Vite, framework-free). |

## The look document

A look is `beautyos.look` v1 JSON: `name`, `description`, `tags`, `skin.smoothing`, ordered `layers` (`region` + `material { color, finish, coverage, overrides? }` + optional catalog `shade` link) and `overlays` (background, foreground, LUT, face video, soft light), each pointing at an `AssetRef` pinned by SHA-256. It describes **intent** in neutral terms; adapters translate it. `validateLook()` enforces per-region finishes and layer limits (eyeshadow stacks up to 3).

## Extension points (plug in or upgrade without touching callers)

| Capability | Interface | Built-ins | Register in |
|---|---|---|---|
| AR platform export | `PlatformAdapter` | `beautyos` (lossless JSON), `banuba` (prefab) | `registerAdapter()` in `@beautyos/look-format` |
| Synthetic image generation | `ImageGenerator` | Vercel AI Gateway image model | `apps/ar-design/src/modules/index.ts` |
| Look formulation | `LookFormulator` | Language model via AI Gateway, rule engine (offline fallback) | same |
| Image enhancement | `Enhancer` | Classic (local contrast, detail, tone) | same |
| Media storage | `StorageModule` | Vercel Blob, local disk | same |
| Database | `openDatabase()` | Postgres (`DATABASE_URL`), PGlite | `src/db/client.ts` |
| Export specs | `NamedProfile` | Social, web, print, AR-texture, master presets | `src/lib/export-profiles.ts` |

Registries pick the first **available** module in registration order, and the UI shows each module's `requirement` when it isn't configured. A test registers a fake image generator to prove the seam.

## Data model (Postgres)

`brands` (tenants) → `products` → `shades` (SKU, color, neutral finish, optional exact Banuba finish) · `looks` (working `draft` + status) → `look_versions` (immutable published snapshots; customers only ever see these) · `assets` (original + processed delivery file, both hashed; thumbnails, palette, processing steps, **provenance** for AI-generated media) · `color_libraries`.

Migrations live in `apps/ar-design/drizzle/`. Add a migration with `npm run db:generate -w @beautyos/ar-design` after changing `src/db/schema.ts`; never edit a released migration.

## Key workflows

- **Author → publish.** The editor autosaves valid drafts; *Publish* freezes the draft as `vN`. *History* restores any version into the draft. Live looks are served by `GET /api/v1/brands/:brand/looks`.
- **Asset pipeline.** Uploads are identified by content (magic bytes, never the extension), deduplicated by hash, and normalized: images auto-oriented, metadata stripped, sRGB, optional enhancement; videos transcoded to H.264/AAC MP4 (Banuba's recommended format) with a poster frame. Each asset gets a thumbnail and a dominant-color palette.
- **Exports.** Looks: Beauty OS JSON, Banuba prefab, a ready-to-load **Banuba effect zip** (config + media), or a **portable bundle** (look + media + manifest) that re-imports losslessly. Media: any **export profile**, covering format (JPEG/PNG/WebP/AVIF/TIFF, MP4/WebM/MOV/GIF), size or long edge, aspect ratio, fit, crop anchor, DPI, color space (sRGB/P3/CMYK), bit depth, quality, file-size cap, and for video fps, bitrate, H.264 profile and trim. Images render from the untouched original; EXIF is stripped unless the profile keeps it.
- **Import.** Drop files anywhere in AR Design: media → asset pipeline; `.json` → look; `.zip` → bundle (look + media); `.ase`/`.csv` → color library.
- **Digital Lab.** Formulate from a description (language model when configured, otherwise the rule engine), from colors read off chip/swatch photos or typed in any notation, and tailored to a skin tone. Every layer carries its reasoning and snaps to sellable catalog SKUs within ΔE2000 ≤ 6.
- **Synthetic models.** The cast sampler spreads skin depth across 1–10 and stratifies undertone, face shape, eye shape, hair texture/style/color, age and presentation independently, so diversity never comes from stereotyped presets. Prompts require an original, fictional person; likeness requests are refused. Composition always keeps generous headroom, and `ensureHeadroom()` extends the backdrop after generation if the model ignored it. Models are generated bare-faced; looks are then applied by the real AR engine (photo input), so renders match what customers see. Every image records provenance and shows a *Synthetic* badge.

## Security notes

- AR Design has **no sign-in yet** (team accounts were deferred). Don't expose it publicly until auth is added; put it behind Vercel Deployment Protection or an SSO proxy meanwhile. The public API is read-only.
- The Banuba Web token is necessarily visible to browsers; restrict it to your domains with Banuba.
- Storage keys are validated against path traversal; uploads are sniffed by content; remote look documents are validated before rendering.

## Running locally

```bash
npm install
cp .env.example .env              # add BANUBA_CLIENT_TOKEN
npm run db:seed                   # Swan Beauty catalog + looks (local PGlite)
npm run dev:design                # AR Design  → http://localhost:3000
npm run dev:tryon                 # Try-on     → http://localhost:5173
npm test                          # all packages
```

## Deploying (Vercel)

Two projects from this repo: `apps/ar-design` (Next.js) and `apps/tryon` (Vite static). AR Design needs `DATABASE_URL` (Marketplace Postgres such as Neon), a connected Blob store (`BLOB_READ_WRITE_TOKEN`), `BANUBA_CLIENT_TOKEN`, and optionally the AI Gateway model ids. Run `npm run db:migrate` against the production database before the first deploy. The try-on needs `BANUBA_CLIENT_TOKEN`, `BEAUTYOS_API_URL` (AR Design's URL) and `BEAUTYOS_BRAND`.
