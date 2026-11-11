/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** AR Design origin serving /api/v1 (defaults to http://localhost:3000). */
  readonly BEAUTYOS_API_URL?: string
  /** Default brand slug when the URL has no ?brand= */
  readonly BEAUTYOS_BRAND?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
