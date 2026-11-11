import type { NextConfig } from "next"

// One .env at the repo root serves every app (BEAUTYOS_AR_LICENSE_KEY, DATABASE_URL, AI keys...).
try {
  process.loadEnvFile("../../.env")
} catch {}

const nextConfig: NextConfig = {
  // AR Design is an authoring tool: every page reads live data, so it renders per request
  // (see `dynamic = "force-dynamic"` in the brand layout). Customer-facing reads go through the
  // public API, which sets its own CDN cache headers.
  cacheComponents: false,
  // Workspace packages ship TypeScript source.
  transpilePackages: ["@beautyos/look-format", "@beautyos/color-lab", "@beautyos/tryon-engine"],
  // Native/WASM server dependencies stay as Node requires.
  serverExternalPackages: ["@electric-sql/pglite", "sharp", "ffmpeg-static", "pg"],
  // Ship migrations and the ffmpeg binary with server functions.
  outputFileTracingIncludes: {
    "/**": ["./drizzle/**/*", "../../node_modules/ffmpeg-static/ffmpeg"],
  },
  experimental: {
    // Look documents and lab payloads are JSON; media uploads use route handlers instead.
    serverActions: { bodySizeLimit: "4mb" },
  },
}

export default nextConfig
