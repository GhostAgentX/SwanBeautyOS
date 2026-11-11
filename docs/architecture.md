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
 shared packages:  @entelus/ar-sdk · @beautyos/look-format · @beautyos/color-lab
```

## Workspace

| Path | Package | Role |
|---|---|---|
| `packages/look-format` | `@beautyos/look-format` | The **Beauty OS Look Document**: platform-neutral schema (regions, neutral finishes, materials, overlays, asset refs), validation, and **platform export adapters**. |
| `packages/entelus-ar-sdk` | `@entelus/ar-sdk` | The **Entelus AR SDK**: face tracking, makeup geometry and WebGL2 rendering of look documents on camera, photo or video; capture and recording. Used by both apps. No vendor SDK or license key. See [Entelus AR SDK](#entelus-ar-sdk). |
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

`brands` (tenants) → `products` → `shades` (SKU, color, neutral finish, optional exact engine finish) · `looks` (working `draft` + status) → `look_versions` (immutable published snapshots; customers only ever see these) · `assets` (original + processed delivery file, both hashed; thumbnails, palette, processing steps, **provenance** for AI-generated media) · `color_libraries`.

Migrations live in `apps/ar-design/drizzle/`. Add a migration with `npm run db:generate -w @beautyos/ar-design` after changing `src/db/schema.ts`; never edit a released migration.

## Key workflows

- **Author → publish.** The editor autosaves valid drafts; *Publish* freezes the draft as `vN`. *History* restores any version into the draft. Live looks are served by `GET /api/v1/brands/:brand/looks`.
- **Asset pipeline.** Uploads are identified by content (magic bytes, never the extension), deduplicated by hash, and normalized: images auto-oriented, metadata stripped, sRGB, optional enhancement; videos transcoded to H.264/AAC MP4 (the most widely supported web format) with a poster frame. Each asset gets a thumbnail and a dominant-color palette.
- **Exports.** Looks: Beauty OS JSON, a **portable bundle** (look + media + manifest) that re-imports losslessly, or, for partners on Banuba's SDKs, a Banuba prefab or effect zip (an export format only; Beauty OS doesn't depend on Banuba). Media: any **export profile**, covering format (JPEG/PNG/WebP/AVIF/TIFF, MP4/WebM/MOV/GIF), size or long edge, aspect ratio, fit, crop anchor, DPI, color space (sRGB/P3/CMYK), bit depth, quality, file-size cap, and for video fps, bitrate, H.264 profile and trim. Images render from the untouched original; EXIF is stripped unless the profile keeps it.
- **Import.** Drop files anywhere in AR Design: media → asset pipeline; `.json` → look; `.zip` → bundle (look + media); `.ase`/`.csv` → color library.
- **Digital Lab.** Formulate from a description (language model when configured, otherwise the rule engine), from colors read off chip/swatch photos or typed in any notation, and tailored to a skin tone. Every layer carries its reasoning and snaps to sellable catalog SKUs within ΔE2000 ≤ 6.
- **Synthetic models.** The cast sampler spreads skin depth across 1–10 and stratifies undertone, face shape, eye shape, hair texture/style/color, age and presentation independently, so diversity never comes from stereotyped presets. Prompts require an original, fictional person; likeness requests are refused. Composition always keeps generous headroom, and `ensureHeadroom()` extends the backdrop after generation if the model ignored it. Models are generated bare-faced; looks are then applied by the Entelus AR SDK (photo input), so renders match what customers see. Every image records provenance and shows a *Synthetic* badge.

## Security notes

- AR Design has **no sign-in yet** (team accounts were deferred). Don't expose it publicly until auth is added; put it behind Vercel Deployment Protection or an SSO proxy meanwhile. The public API is read-only.
- Storage keys are validated against path traversal; uploads are sniffed by content; remote look documents are validated before rendering.

## Running locally

```bash
npm install
cp .env.example .env              # optional: storage, database and AI settings
npm run db:seed                   # Swan Beauty catalog + looks (local PGlite)
npm run dev:design                # AR Design  → http://localhost:3000
npm run dev:tryon                 # Try-on     → http://localhost:5173
npm test                          # all packages
```

## Deploying (Vercel)

Two projects from this repo: `apps/ar-design` (Next.js) and `apps/tryon` (Vite static). AR Design needs `DATABASE_URL` (Marketplace Postgres such as Neon), a connected Blob store (`BLOB_READ_WRITE_TOKEN`), and optionally the AI Gateway model ids. Run `npm run db:migrate` against the production database before the first deploy. The try-on needs `BEAUTYOS_API_URL` (AR Design's URL) and `BEAUTYOS_BRAND`. Both builds install the AR SDK runtime (`entelus-ar-assets`), which downloads the two pinned models once (set `ENTELUS_MODELS_URL` to use your own mirror).

## Entelus AR SDK

`@entelus/ar-sdk` is Entelus's own AR engine. It replaced the licensed Banuba Face AR SDK, so live AR needs no vendor SDK, license key or token.

| Layer | Implementation | Source |
|---|---|---|
| Face tracking | 478-point 3D face mesh, per frame, with temporal smoothing | MediaPipe Face Landmarker model, run in WebAssembly (GPU, CPU fallback) |
| Segmentation | Person/hair/skin confidence masks, loaded only for looks with a background | MediaPipe Selfie Multiclass model |
| Makeup geometry | `src/geometry.ts`: lips (mouth cut out), lip liner, 3-band eyeshadow, eyeliner with wing, lashes, brows, blush, highlighter, contour, under-eye concealer, foundation skin area | Entelus |
| Rendering | `src/renderer.ts`: WebGL2. Even-odd stencil masks, Gaussian feathering, texture-preserving color shading per finish (matte, satin, cream, gloss, balm, sheer, shimmer, metallic, glitter, natural, radiant, lash weights), edge-preserving skin smoothing, background replacement, 512² LUTs, soft light, face-anchored video, full-frame overlays | Entelus |
| Runtime | `src/index.ts`: camera/photo/video input, frame loop, full-resolution capture, MP4/WebM recording | Entelus |

Install the runtime into an app with `entelus-ar-assets public/ar-engine` (both apps run it before `dev` and `build`): it copies the WebAssembly files and the two models, verified by SHA-256. Geometry is unit-tested against MediaPipe's reference portrait (`npm test -w @entelus/ar-sdk` fetches it; it isn't committed).

**Native apps (iOS, Android, Flutter, React Native).** The same face-mesh models run natively through MediaPipe's iOS and Android Tasks libraries, and the geometry module is plain math. The native renderer (Metal/Vulkan/GLES ports of `renderer.ts`) is the next step; until then native partners can use the portable bundle or the Banuba export.

## Third-party software

- **MediaPipe Tasks Vision** (`@mediapipe/tasks-vision`, Apache-2.0) and its Face Landmarker and Selfie Multiclass models (published by Google under their model cards) power tracking and segmentation in the Entelus AR SDK.
- The `banuba` and `banuba-effect` export targets write Banuba's documented effect format for partners on Banuba's SDKs. They are file writers only; no Banuba code ships with Beauty OS.
