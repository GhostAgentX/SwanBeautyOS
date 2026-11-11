# Beauty OS

Multi-brand AR beauty platform by Entelus. **AR Design** is the production studio where creative teams author makeup looks, synthetic models and media; the **try-on** brings published looks to customers on the web, standalone or embedded. Swan Beauty is the first brand.

- **Look editor:** live AR preview on camera, photos, videos or synthetic models; layered makeup tied to catalog SKUs; image/video effects; autosave, publish, version history.
- **Lab:** formulate looks from a description, from color chips and swatches (RGB, CMYK, Lab, imported Pantone/brand libraries), and from skin-tone analysis, with the reasoning shown.
- **Models:** diverse, original synthetic casts with generous headroom; looks applied by the real AR engine.
- **Assets:** image/video pipeline with enhancement, and export to any format, size, aspect ratio, DPI or color space.
- **Entelus AR SDK:** Entelus's own face tracking and makeup renderer: no vendor SDK, license key or token.
- **Portable:** looks export as Beauty OS JSON, bundles for other AR platforms, or Banuba-format effects for partners.

```bash
npm install
cp .env.example .env        # optional settings; live AR needs no key
npm run db:seed
npm run dev:design          # http://localhost:3000
npm run dev:tryon           # http://localhost:5173
```

Read **[docs/architecture.md](docs/architecture.md)** for the system design, extension points and deployment. The AR engine is documented in [docs/architecture.md#entelus-ar-sdk](docs/architecture.md#entelus-ar-sdk); third-party software is credited there too.
