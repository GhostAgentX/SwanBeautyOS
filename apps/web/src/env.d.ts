/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly BANUBA_CLIENT_TOKEN?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
