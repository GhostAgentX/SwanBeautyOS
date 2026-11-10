import { defineConfig } from "vite"
import { fileURLToPath } from "node:url"

export default defineConfig({
  // Read .env from the repo root so the whole monorepo shares one BANUBA_CLIENT_TOKEN.
  envDir: fileURLToPath(new URL("../..", import.meta.url)),
  // Expose BANUBA_* vars (only BANUBA_CLIENT_TOKEN today) to client code via import.meta.env.
  envPrefix: ["VITE_", "BANUBA_"],
  // The SDK ships its own pre-built WASM/ESM; don't let the dep optimizer rewrite it.
  optimizeDeps: { exclude: ["@banuba/webar"] },
  server: { host: true },
  preview: { host: true },
})
