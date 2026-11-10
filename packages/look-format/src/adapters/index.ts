import { LookDocument } from "../schema"
import { banubaAdapter, slugify } from "./banuba"
import type { PlatformAdapter } from "./types"

/** The canonical, lossless export: the Beauty OS Look Document itself. Other platforms or tools can import it. */
export const beautyOsAdapter: PlatformAdapter = {
  id: "beautyos",
  label: "Beauty OS Look Document (portable JSON)",
  fileName: (look) => `${slugify(look.name)}.beautyos-look.json`,
  mediaType: "application/json",
  export(look) {
    // Assets stay as URLs: the document is portable, and importers fetch what they need.
    return { content: JSON.stringify(LookDocument.parse(look), null, 2), issues: [], files: [] }
  },
}

const adapters: PlatformAdapter[] = [beautyOsAdapter, banubaAdapter]

/** Every registered AR platform exporter. */
export const ADAPTERS: readonly PlatformAdapter[] = adapters

/** Plug in a new AR platform (or replace one with the same id). */
export function registerAdapter(adapter: PlatformAdapter) {
  const i = adapters.findIndex((a) => a.id === adapter.id)
  if (i >= 0) adapters[i] = adapter
  else adapters.push(adapter)
}

export const getAdapter = (id: string) => adapters.find((a) => a.id === id) ?? null

export * from "./banuba"
export * from "./types"
