// Runtime configuration from the URL (embed parameters) with build-time defaults.
export interface TryOnConfig {
  api: string
  brand: string
  look: string | null
  embed: boolean
}

export function readConfig(search: string, env: { BEAUTYOS_API_URL?: string; BEAUTYOS_BRAND?: string }): TryOnConfig {
  const q = new URLSearchParams(search)
  const api = (q.get("api") || env.BEAUTYOS_API_URL || "http://localhost:3000").replace(/\/$/, "")
  if (!/^https?:\/\//.test(api)) throw new Error(`Invalid api origin: ${api}`)
  const brand = (q.get("brand") || env.BEAUTYOS_BRAND || "swan-beauty").replace(/[^\w-]/g, "")
  return { api, brand, look: q.get("look"), embed: q.get("embed") === "1" }
}
