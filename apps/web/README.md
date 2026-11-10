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

| `src/lookStore.ts` | Saves custom looks in the browser's `localStorage`; checks them on load. |

## Looks

A look is a `LookProfile` in `src/makeup.ts`: a name, description and occasion, a skin-smoothing level, and a recipe of products. Each product is one `Shade` (`{ color, finish, coverage }`). Eyeshadow can instead be an array of up to 3 layers, applied in order.

```ts
{
  id: "sunset-bronze", name: "Sunset Bronze", occasion: "everyday", smoothing: 0.5,
  description: "Three-layer gold-bronze lids, metallic bronze liner and a satin coral lip.",
  products: {
    eyeshadow: [
      { color: "#d9b99b", finish: "matte",    coverage: 0.45 }, // base
      { color: "#8c5a32", finish: "shimmer",  coverage: 0.5 },  // crease
      { color: "#c9a24a", finish: "metallic", coverage: 0.45 }, // lid
    ],
    eyeliner: { color: "#7a4b25", finish: "metallic", coverage: 0.8 },
    lipstick: { color: "#e8705a", finish: "satin",    coverage: 0.7 },
    blush:    { color: "#c46a4f", finish: "matte",    coverage: 0.4 },
  },
}
```

- **To add a preset,** append it to `PRESET_LOOKS`. The UI picks it up, and `npm test` checks every finish, color and layer count against the catalog.
- **Picking a look** copies it into editable state. Edits mark it **Edited**, with a **Reset** button. **Look intensity** scales every product at once and doesn't count as an edit.
- **Save as my look** stores the current state as a custom look. It's kept in this browser only; replace `lookStore.ts` with an API client to sync looks to accounts.
- **To change the catalog,** edit `PRODUCTS`. Finishes must come from Banuba's documented list for each region.

## Tests

```bash
npm test
```

## Notes
- The token is compiled into the client bundle, as with any Web SDK token. Restrict it to your domains through Banuba.
- First load downloads about 25 MB (engine plus face models), which browsers then cache.
- Requires WebGL 2. Unsupported browsers see an error screen instead of AR.
