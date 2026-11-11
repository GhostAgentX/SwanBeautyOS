/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** AR SDK license key (web keys are public; restrict them to your domains). */
  readonly BEAUTYOS_AR_LICENSE_KEY?: string
  /** AR Design origin serving /api/v1 (defaults to http://localhost:3000). */
  readonly BEAUTYOS_API_URL?: string
  /** Default brand slug when the URL has no ?brand= */
  readonly BEAUTYOS_BRAND?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
