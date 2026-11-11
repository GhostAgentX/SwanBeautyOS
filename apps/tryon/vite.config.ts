import { defineConfig } from "vite"
import { fileURLToPath } from "node:url"

export default defineConfig({
  // One .env at the repo root: BANUBA_CLIENT_TOKEN, BEAUTYOS_API_URL, BEAUTYOS_BRAND.
  envDir: fileURLToPath(new URL("../..", import.meta.url)),
  envPrefix: ["VITE_", "BANUBA_", "BEAUTYOS_"],
  optimizeDeps: { exclude: ["@banuba/webar"] },
  server: {
    host: true,
    // In development the try-on talks to AR Design through this origin, so it also works behind
    // preview proxies and tunnels where localhost:3000 isn't reachable from the browser.
    proxy: { "/api": { target: process.env.BEAUTYOS_DESIGN_ORIGIN ?? "http://localhost:3000", changeOrigin: true } },
  },
  preview: { host: true },
})
