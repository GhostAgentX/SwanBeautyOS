# Beauty OS · Try-on

Customer-facing AR makeup try-on. Loads a brand's **published** looks from AR Design's public API and renders them with `@beautyos/tryon-engine` (Banuba Face AR Web SDK).

- Camera, or an uploaded photo or video
- Look picker, intensity, hold-to-compare
- Full-resolution PNG/JPEG capture and video recording
- Shades in the look, with SKUs
- Look download (Beauty OS JSON, Banuba effect zip)

```bash
npm run dev -w @beautyos/tryon     # http://localhost:5173
```

URL parameters: `?brand=swan-beauty&api=https://design.example.com&look=classic-red&embed=1` (`embed=1` hides the header for iframes).

Embed:

```html
<iframe src="https://tryon.example.com/?brand=swan-beauty&api=https%3A%2F%2Fdesign.example.com&embed=1"
  allow="camera; fullscreen" style="width:100%;height:760px;border:0" title="Virtual try-on"></iframe>
```
