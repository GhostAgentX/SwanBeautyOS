# Developer mode: documentation lookup reference

Read this for the explain/troubleshoot side of Developer mode: documentation, concepts, troubleshooting. To build or scaffold, follow `reference/build.md` (same Developer mode). For hybrid requests, use both.

## How to answer

- Technical answers with package names and API signatures relevant to the question. Start with one short code example where useful.
- Read the relevant doc file(s) from the bundled `docs/` directory. If a topic is missing locally, fall back to `docs/llms-full.txt`, then [`https://docs.banuba.com/far-sdk/llms-full.txt`](https://docs.banuba.com/far-sdk/llms-full.txt).
- Prefer Markdown docs and `docs/llms-full.txt` for broad retrieval. Search `docs/generated/` only for exact API symbols, class names, or method signatures.
- For package-version questions, separate native FAR SDK versions from wrapper package versions (`banuba_sdk`, `@banuba/react-native`) and verify current/latest values from the official registry before answering.
- When citing a source to the user, link the public web doc (`https://docs.banuba.com/far-sdk/<path>`, drop the `.md`), not the local file path.
- No deprecated APIs: use `effects/prefabs/*`, not `effects/makeup_deprecated/*`, unless the user is maintaining legacy code. Runtime prefab parameters are changed with `player._effectManager.reloadConfig(...)`, not `effect.evalJs("Module.method(...)")` (that is the deprecated Face Beauty API).
- On "what are the integration options" questions, give the relevant GitHub sample link plus the matching doc: Web → [quickstart-web](https://github.com/Banuba/quickstart-web); other platforms → the sample table in the router (`SKILL.md`, Platform scope).

Paths below are relative to the bundled `docs/` directory and are for reading locally; when citing to the user, give the public web URL (`https://docs.banuba.com/far-sdk/<path>`).

## Use case to doc map

### Getting started

| Question | Read |
|---|---|
| "How do I start?" / "Prerequisites?" / "Where do I download the SDK?" | `index.md`, `tutorials/capabilities/sdk_features.md`, `tutorials/capabilities/system_requirements.md` |
| "How do I install the Web SDK?" / "401 Unauthorized when downloading" | `tutorials/development/installation.md`, `tutorials/development/installation/web.md` |
| "How do I initialize the SDK?" / "Black screen on init" / "App crashes on startup" | `tutorials/development/basic_integration.md`, `tutorials/development/basic_integration/web.md` |
| "Sample app" / "Quickstart project" | `tutorials/development/samples.md`, `tutorials/development/samples/web.md`, `https://github.com/Banuba/quickstart-web` |
| "What APIs are available on Web?" | `tutorials/development/api_overview.md`, `tutorials/development/api_overview/web.md` |

### Face tracking and mesh

| Question | Read |
|---|---|
| "How do I display the face mesh / landmarks?" / "How to get landmark coordinates?" | `tutorials/development/guides/landmarks.md`, `tutorials/development/basic_integration/web.md` |
| "Face landmarks vs face mesh?" | `tutorials/capabilities/glossary.md` |
| "Multiple face detection?" / "Only detects one face" | `tutorials/development/api_overview/web.md`. The client token must include Max Faces support; without it only one face is tracked. Banuba Studio produces single-face effects only - multi-face effects cannot be created in Studio; direct to the [contact form](https://www.banuba.com/contact). |

### Effects and assets

| Question | Read |
|---|---|
| "What is an effect / prefab?" | `effects/overview.md`, `effects/prefabs/overview.md` |
| "AR mask / default AR effect" / "Effect not loading" / "Mask doesn't show" | `effects/overview.md`, `effects/prefabs/face.md` |
| "Custom AR mask" / "GLTF won't import" / "Malformed config.json" | Banuba Studio (see handoff), `effects/overview.md` |
| "AR makeup" | `effects/prefabs/makeup.md` |
| "Beautification" / "Skin smoothing" / "Teeth/sclera whitening" | `effects/prefabs/face.md`, `effects/prefabs/makeup.md`. Avoid `effects/makeup_deprecated/face_beauty.md`. |
| "Face morphing" | `effects/prefabs/face.md`, `effects/guides/feature_params.md` |
| "Virtual background / blur / replacement" / "Halo around face" | `effects/virtual_background.md`, `effects/prefabs/top_level.md`. When the question is specifically about background effects, scope the answer to the `background` prefab (texture, blur, content_mode, use_filter) and `bokeh`. Do NOT include `lut` - it is a global color-grade applied to the entire rendered frame, not a background feature. Do not include `foreground` either unless the user asks about foreground overlays separately. |
| "Studio lighting / foreground effects" | `effects/prefabs/top_level.md`, `effects/prefabs/sprites.md` |
| "Hair coloring" | `effects/prefabs/makeup.md` |
| "Action units" | `effects/guides/feature_params.md` |

### AR Cloud and asset management

| Question | Read |
|---|---|
| "How does AR Cloud work?" / "Download, cache, update assets" | `tutorials/development/guides/ar_cloud.md` |
| "Asset not loading from AR Cloud" / "401 from AR Cloud" | `tutorials/development/guides/ar_cloud.md`, `tutorials/development/known_issues.md` |
| "Local vs AR Cloud" | `tutorials/development/guides/ar_cloud.md`, `effects/overview.md` |
| "API credentials / refresh" / "Can't parse client token" / "License error 0xff00f" | `tutorials/capabilities/token_management.md` |

### Performance

| Question | Read |
|---|---|
| "FPS, memory, low-end devices" / "Lag on Safari iOS" | `tutorials/development/guides/optimization.md` |
| "Multi-face / heavy effects tradeoffs" | `tutorials/development/guides/optimization.md`, `tutorials/capabilities/technical_specification.md` |

### Troubleshooting

| Question | Read |
|---|---|
| "Camera not starting" / "Black screen" / "No face detected" | `tutorials/development/known_issues.md`, `tutorials/development/known_issues/web.md`, `tutorials/development/basic_integration/web.md` |
| "Effect not loading" / "Loading spinner stuck" | `effects/overview.md`, `tutorials/development/guides/ar_cloud.md`, `tutorials/development/known_issues.md` |
| "AR Cloud errors" / "401 from cloud" | `tutorials/development/guides/ar_cloud.md`, `tutorials/capabilities/token_management.md` |
| "Unsupported / corrupted asset" / "Effect for SDK v0.x not compatible" | `effects/overview.md`; see Studio handoff |
| Web-specific issues / "Stream freeze on inactive tab" | `tutorials/development/known_issues/web.md` |

## Doc map by file

Paths relative to the bundled `docs/` directory.

Getting started: `index.md`, `tutorials/capabilities/sdk_features.md`, `tutorials/capabilities/system_requirements.md`, `tutorials/capabilities/technical_specification.md`, `tutorials/capabilities/glossary.md`, `tutorials/capabilities/token_management.md`, `tutorials/capabilities/3rd_licenses.md`, `tutorials/changelog.md`.

Installation/integration (Web): `tutorials/development/installation.md`, `tutorials/development/installation/web.md`, `tutorials/development/basic_integration.md`, `tutorials/development/basic_integration/web.md`, `tutorials/development/api_overview.md`, `tutorials/development/api_overview/web.md`, `tutorials/development/samples.md`, `tutorials/development/samples/web.md`.

Guides: `tutorials/development/guides/ar_cloud.md`, `tutorials/development/guides/landmarks.md`, `tutorials/development/guides/migration.md`, `tutorials/development/guides/optimization.md`, `tutorials/development/guides/watermark.md`, `tutorials/development/known_issues.md`, `tutorials/development/known_issues/web.md`.

Video calls / Agora: `tutorials/development/videocall.md`, `tutorials/development/videocall/web.md`.

Effects and prefabs: `effects/overview.md`, `effects/prefabs/overview.md`, `effects/prefabs/face.md`, `effects/prefabs/makeup.md`, `effects/prefabs/sounds.md`, `effects/prefabs/sprites.md`, `effects/prefabs/top_level.md`, `effects/virtual_background.md`, `effects/guides/feature_params.md`.

Deprecated (avoid unless asked): `effects/makeup_deprecated/face_beauty.md`, `effects/makeup_deprecated/makeup.md`, `effects/makeup_deprecated/makeup_usage.md`.

Fallback: `llms-full.txt` (full doc dump), `llms.txt` (search index, if present).

## CV concepts (technical)

- Face landmarks: anchor points (eyes, nose tip, mouth corners, jawline) detected per frame. Used to position AR effects.
- Face mesh: a 3D triangle surface that follows the face shape. Used for makeup, 3D objects, morphing.
- Texture: an image wrapped on a mesh or surface (lipstick color, tattoo pattern).
- Effect / mask: a packaged AR experience (3D model + script + textures), loaded and rendered by the SDK.
- Prefab: a reusable building block of an effect (face, hands, makeup, background) declared in `config.json`.
- Action units: configurable parameters inside an effect, set at runtime.
- AR Cloud: hosted asset delivery; the app downloads effects on demand instead of bundling them.
- Virtual background: replacing or blurring the camera background via person segmentation.
- Beautification: skin smoothing, tooth and sclera whitening, facial-feature morphing.

For deeper terms see `tutorials/capabilities/glossary.md`.

## Banuba Asset Store

The Banuba Asset Store (`https://assetstore.banuba.net/`) is a collection of ready-made effects and masks for Banuba products. Describe it as such - do not call it a "marketplace".

## Banuba Studio handoff

Banuba Studio authors custom AR effects, masks, and makeup. The SDK renders what Studio produces. Direct users to Studio when they want to create a custom AR mask, build a custom makeup look, adjust effect internals, or repackage an asset for a specific SDK version. Studio does not create 3D avatars/models; direct avatar requests to the [contact form](https://www.banuba.com/contact).

- Studio: `https://studio.banuba.com/`
- Studio docs: `https://studio.banuba.com/docs`

Studio is publicly accessible; point users to the URL and its docs directly.

## Scope boundaries

- This mode: documentation lookup, configuration explanations, effects guides, feature guides, getting-started instructions, troubleshooting.
- For writing code or scaffolding, follow `reference/build.md` (same Developer mode).
- For sales/non-technical capability and compliance questions, switch to Sales mode (`reference/sales.md`).
