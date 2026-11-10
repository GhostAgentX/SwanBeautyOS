# Swan Beauty — Web AR makeup try-on

Live virtual makeup in the browser, built on the Banuba Face AR Web SDK (`@banuba/webar`) with Vite + TypeScript.

**Features:** preset looks (Natural, Soft Glam, Evening, Classic Red, Bare); per-product shade, finish and intensity for lipstick, lip liner, eyeshadow, eyeliner, lashes, brows, blush, highlighter, contour, foundation and concealer; skin smoothing; hold-to-compare; save photo. Camera frames are processed on-device.

## Run it

1. Put your token in the **repo-root** `.env` (copied from `.env.example`):
   ```
   BANUBA_CLIENT_TOKEN=your-token
   ```
2. From `apps/web`:
   ```bash
   npm install
   npm run dev
   ```
3. Open the printed URL and click **Start camera**. The camera works on `localhost` or HTTPS only.

`npm run build` writes a static site to `dist/` that any HTTPS host can serve.

## How it works

| File | Role |
|---|---|
| `src/ar.ts` | Player lifecycle: creates the player, loads the `face_tracker`, `makeup`, `lips`, `eyes` and `skin` modules, applies a base prefab effect (zipped in memory), and runs the webcam. Live changes go through `reloadConfig`. |
| `src/makeup.ts` | Product catalog, shades, looks, and `buildConfig()`, which turns the UI state into a [makeup prefab config](https://docs.banuba.com/far-sdk/effects/prefabs/makeup). |
| `src/main.ts` | UI rendering and event wiring. |

To change the catalog, edit `PRODUCTS` and `LOOKS` in `src/makeup.ts`. Shades are hex colors. Finishes must come from the documented list for each region.

## Notes
- The token is compiled into the client bundle, as with any Web SDK token. Restrict it to your domains through Banuba.
- First load downloads about 25 MB (engine plus face models), which browsers then cache.
- Requires WebGL 2. Unsupported browsers see an error screen instead of AR.
