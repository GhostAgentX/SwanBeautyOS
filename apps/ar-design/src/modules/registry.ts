// Beauty OS module registry: the extension points of the system.
// Each capability is an interface plus a named registry. Implementations register at startup
// (see ./index.ts); callers ask the registry, never a concrete module. To add or upgrade a
// subsystem (new AR platform, image model, storage, LLM, enhancer), implement the interface and
// register it. Nothing else changes.
import type { Formulation } from "@beautyos/color-lab"
import type { PlatformAdapter } from "@beautyos/look-format"
import type { Storage } from "@/server/storage"

export interface ModuleInfo {
  id: string
  label: string
  /** Shown in the UI when unavailable, e.g. "Set AI_GATEWAY_API_KEY". */
  requirement?: string
  /** Whether the module can run in this deployment (keys present, binaries installed...). */
  available(): boolean
}

export interface GenerateImageRequest {
  prompt: string
  negativePrompt?: string
  width: number
  height: number
  seed?: number
  /** Reference image for edits (e.g. "same model, full glam makeup"). */
  reference?: { bytes: Uint8Array; mediaType: string }
}

export interface GeneratedImage {
  bytes: Uint8Array
  mediaType: string
  model: string
  seed?: number
}

export interface ImageGenerator extends ModuleInfo {
  generate(req: GenerateImageRequest): Promise<GeneratedImage>
}

export interface FormulateRequest {
  prompt: string
  skin?: string
  occasion?: "everyday" | "evening" | "bold"
  catalog: import("@beautyos/color-lab").CatalogShade[]
  libraries: import("@beautyos/color-lab").ColorLibrary[]
}

export interface LookFormulator extends ModuleInfo {
  formulate(req: FormulateRequest): Promise<Formulation & { engine: string; notes: string[] }>
}

export interface Enhancer extends ModuleInfo {
  presets: readonly string[]
  enhance(bytes: Uint8Array, preset: string): Promise<Uint8Array>
}

export interface StorageModule extends ModuleInfo {
  storage: Storage
}

class Registry<T extends ModuleInfo> {
  private readonly items = new Map<string, T>()
  constructor(readonly name: string) {}

  register(item: T) {
    this.items.set(item.id, item)
    return this
  }

  get(id: string): T {
    const item = this.items.get(id)
    if (!item) throw new Error(`No ${this.name} module "${id}". Registered: ${[...this.items.keys()].join(", ") || "none"}`)
    return item
  }

  list(): (T & { isAvailable: boolean })[] {
    return [...this.items.values()].map((i) => Object.assign(Object.create(i), i, { isAvailable: i.available() }))
  }

  /** First available module, in registration order (register the preferred implementation first). */
  preferred(): T | null {
    return [...this.items.values()].find((i) => i.available()) ?? null
  }
}

export const registry = {
  imageGenerators: new Registry<ImageGenerator>("image generator"),
  formulators: new Registry<LookFormulator>("look formulator"),
  enhancers: new Registry<Enhancer>("enhancer"),
  storage: new Registry<StorageModule>("storage"),
  /** AR platform exporters live in @beautyos/look-format so the try-on app can use them too. */
  platforms: {
    list: async (): Promise<readonly PlatformAdapter[]> => (await import("@beautyos/look-format")).ADAPTERS,
  },
}
