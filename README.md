# Beauty OS

Multi-brand AR beauty platform by Entelus. **AR Design** is the production studio where creative teams author makeup looks, synthetic models and media; the **try-on** brings published looks to customers on the web, standalone or embedded. Swan Beauty is the first brand.

- **Look editor:** live AR preview on camera, photos, videos or synthetic models; layered makeup tied to catalog SKUs; image/video effects; autosave, publish, version history.
- **Lab:** formulate looks from a description, from color chips and swatches (RGB, CMYK, Lab, imported Pantone/brand libraries), and from skin-tone analysis, with the reasoning shown.
- **Models:** diverse, original synthetic casts with generous headroom; looks applied by the real AR engine.
- **Assets:** image/video pipeline with enhancement, and export to any format, size, aspect ratio, DPI or color space.
- **Portable:** looks export as Beauty OS JSON, ready-to-load AR SDK effects, or bundles for other AR platforms.

```bash
npm install
cp .env.example .env        # add BEAUTYOS_AR_LICENSE_KEY
npm run db:seed
npm run dev:design          # http://localhost:3000
npm run dev:tryon           # http://localhost:5173
```

Read **[docs/architecture.md](docs/architecture.md)** for the system design, extension points and deployment. AI skills for the AR SDK are bundled in `.claude/skills/` (see [docs/ar-sdk-skills.md](docs/ar-sdk-skills.md)). Third-party software is credited in [docs/architecture.md](docs/architecture.md#third-party-software).
