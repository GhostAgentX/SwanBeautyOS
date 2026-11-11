# Entelus AR SDK (`@entelus/ar-sdk`)

Real-time face tracking and makeup rendering for Beauty OS look documents, in the browser. No vendor SDK, license key or token.

```ts
import { EntelusAR } from "@entelus/ar-sdk"

const ar = new EntelusAR(document.querySelector("#stage")!)
await ar.start({ assetsBaseUrl: "/ar-engine" }, (label, progress) => console.log(label, progress))
ar.setLook(lookDocument)          // Beauty OS look (validated with @beautyos/look-format)
ar.setIntensity(0.8)
await ar.setInput({ source: "image", file })   // or { source: "camera" } / { source: "video", file }
const png = await ar.snapshot()                // full resolution
ar.startRecording(); const video = await ar.stopRecording()
```

**Install the runtime** into your app's public folder (WebAssembly + two pinned models, SHA-256 verified):

```bash
npx entelus-ar-assets public/ar-engine
```

| Module | What |
|---|---|
| `src/geometry.ts` | Makeup regions from the 478-point face mesh (pure math, unit-tested) |
| `src/renderer.ts` | WebGL2 renderer: masks, feathering, finishes, smoothing, overlays |
| `src/index.ts` | Runtime: tracking, inputs, frame loop, capture, recording |
| `scripts/assets.mjs` | Runtime installer (`entelus-ar-assets`) |

Tests: `npm test -w @entelus/ar-sdk` (downloads MediaPipe's reference portrait and landmarks into `test-assets/`, which is git-ignored).

Tracking and segmentation use MediaPipe Tasks Vision (Apache-2.0) and Google's Face Landmarker and Selfie Multiclass models.
