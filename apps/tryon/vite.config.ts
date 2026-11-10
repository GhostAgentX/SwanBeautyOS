import { defineConfig } from "vite"
import { fileURLToPath } from "node:url"

export default defineConfig({
  // One .env at the repo root: BANUBA_CLIENT_TOKEN, BEAUTYOS_API_URL, BEAUTYOS_BRAND.
  envDir: fileURLToPath(new URL("../..", import.meta.url)),
  envPrefix: ["VITE_", "BANUBA_", "BEAUTYOS_"],
  optimizeDeps: { exclude: ["@banuba/webar"] },
  server: { host: true },
  preview: { host: true },
})
