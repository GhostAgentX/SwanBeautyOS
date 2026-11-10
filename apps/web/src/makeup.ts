// Makeup catalog, look profiles and Banuba prefab config builder.
// Prefab reference: https://docs.banuba.com/far-sdk/effects/prefabs/makeup

export type ProductId =
  | "lipstick"
  | "lipsliner"
  | "eyeshadow"
  | "eyeliner"
  | "eyelashes"
  | "eyebrows"
  | "blush"
  | "highlighter"
  | "contour"
  | "foundation"
  | "concealer"

export type CategoryId = "lips" | "eyes" | "cheeks" | "face"

/** One application of color: the unit every makeup prefab takes. */
export interface Shade {
  /** Hex color, e.g. "#b3122e" */
  color: string
  /** One of the product's documented finishes */
  finish: string
  /** 0..1 */
  coverage: number
}

export interface ProductDef {
  id: ProductId
  label: string
  category: CategoryId
  /** Prefab key in the `faces[0]` object */
  prefab: `makeup_${ProductId}`
  finishes: readonly string[]
  shades: readonly { name: string; hex: string }[]
  defaultCoverage: number
  /** How many stacked layers the prefab accepts (eyeshadow: 3, everything else: 1). */
  maxLayers: number
}

/** Live, editable state for one product. `layers[0]` is the base layer; extra entries stack on top. */
export interface ProductState {
  enabled: boolean
  layers: Shade[]
}

export interface MakeupState {
  /** Skin smoothing strength for the whole face, 0..1 (makeup_base.smooth) */
  smoothing: number
  /** Look-wide strength multiplier applied to every product's coverage, 0..1 */
  intensity: number
  products: Record<ProductId, ProductState>
}

export type Occasion = "everyday" | "evening" | "bold" | "custom"

/** A product inside a look: a single shade, or a stack of layers (eyeshadow). */
export type LookProduct = Shade | Shade[]

/** A named, shareable makeup recipe. Presets ship in code; custom looks are saved by the user. */
export interface LookProfile {
  id: string
  name: string
  description: string
  occasion: Occasion
  smoothing: number
  products: Partial<Record<ProductId, LookProduct>>
  custom?: boolean
}

export const CATEGORIES: readonly { id: CategoryId; label: string }[] = [
  { id: "lips", label: "Lips" },
  { id: "eyes", label: "Eyes" },
  { id: "cheeks", label: "Cheeks" },
  { id: "face", label: "Face" },
]

export const OCCASIONS: Record<Occasion, string> = {
  everyday: "Everyday",
  evening: "Evening",
  bold: "Bold",
  custom: "My look",
}

// Finish lists are the documented options per region (a subset for lipstick to keep the UI usable).
export const PRODUCTS: readonly ProductDef[] = [
  {
    id: "lipstick",
    label: "Lipstick",
    category: "lips",
    prefab: "makeup_lipstick",
    finishes: ["satin", "matte_velvet", "matte_cream", "cream_shine", "shimmer", "balm", "metallic_shine", "glossy_cream_plumping", "clear"],
    shades: [
      { name: "Swan Nude", hex: "#c98b7d" },
      { name: "Rosewood", hex: "#a8545f" },
      { name: "Petal Pink", hex: "#e07a9a" },
      { name: "Coral Bay", hex: "#e8705a" },
      { name: "Classic Red", hex: "#b3122e" },
      { name: "Berry Noir", hex: "#6b1636" },
      { name: "Plum Silk", hex: "#7a3b69" },
    ],
    defaultCoverage: 0.75,
    maxLayers: 1,
  },
  {
    id: "lipsliner",
    label: "Lip liner",
    category: "lips",
    prefab: "makeup_lipsliner",
    finishes: ["shimmer"],
    shades: [
      { name: "Nude", hex: "#9c6152" },
      { name: "Rose", hex: "#8f3f4c" },
      { name: "Red", hex: "#8a0f24" },
      { name: "Berry", hex: "#57122b" },
    ],
    defaultCoverage: 0.6,
    maxLayers: 1,
  },
  {
    id: "eyeshadow",
    label: "Eyeshadow",
    category: "eyes",
    prefab: "makeup_eyeshadow",
    finishes: ["matte", "shimmer", "metallic", "matte_powder", "glitter", "glitter_metallic", "glitter_sheer", "cream"],
    shades: [
      { name: "Champagne", hex: "#d9b99b" },
      { name: "Gold", hex: "#c9a24a" },
      { name: "Bronze", hex: "#8c5a32" },
      { name: "Taupe", hex: "#7d6a5e" },
      { name: "Mauve", hex: "#9b6b84" },
      { name: "Emerald", hex: "#2f6b4f" },
      { name: "Navy Smoke", hex: "#2b3550" },
      { name: "Charcoal", hex: "#2e2b2b" },
    ],
    defaultCoverage: 0.6,
    maxLayers: 3,
  },
  {
    id: "eyeliner",
    label: "Eyeliner",
    category: "eyes",
    prefab: "makeup_eyeliner",
    finishes: ["matte_liquid", "matte_cream", "matte_dark", "cream", "shimmer", "metallic", "glitter"],
    shades: [
      { name: "Jet Black", hex: "#0d0d0d" },
      { name: "Espresso", hex: "#3b2418" },
      { name: "Navy", hex: "#1d2a4f" },
      { name: "Bronze", hex: "#7a4b25" },
    ],
    defaultCoverage: 0.9,
    maxLayers: 1,
  },
  {
    id: "eyelashes",
    label: "Lashes",
    category: "eyes",
    prefab: "makeup_eyelashes",
    finishes: ["natural", "volume", "lengthening", "lengthandvolume", "natural_bottom"],
    shades: [
      { name: "Black", hex: "#000000" },
      { name: "Brown Black", hex: "#2a1a12" },
    ],
    defaultCoverage: 0.9,
    maxLayers: 1,
  },
  {
    id: "eyebrows",
    label: "Brows",
    category: "eyes",
    prefab: "makeup_eyebrows",
    finishes: ["matte", "wet", "clear"],
    shades: [
      { name: "Blonde", hex: "#9a7b5a" },
      { name: "Soft Brown", hex: "#644433" },
      { name: "Dark Brown", hex: "#3e2a22" },
      { name: "Soft Black", hex: "#1f1a18" },
    ],
    defaultCoverage: 0.5,
    maxLayers: 1,
  },
  {
    id: "blush",
    label: "Blush",
    category: "cheeks",
    prefab: "makeup_blush",
    finishes: ["matte", "shimmer", "cream_shine"],
    shades: [
      { name: "Peach", hex: "#f2a58e" },
      { name: "Rose", hex: "#e0a6bf" },
      { name: "Berry", hex: "#c2577a" },
      { name: "Terracotta", hex: "#c46a4f" },
    ],
    defaultCoverage: 0.45,
    maxLayers: 1,
  },
  {
    id: "highlighter",
    label: "Highlighter",
    category: "cheeks",
    prefab: "makeup_highlighter",
    finishes: ["shimmer"],
    shades: [
      { name: "Pearl", hex: "#f2e6e6" },
      { name: "Champagne", hex: "#e6ccd4" },
      { name: "Gold", hex: "#e3c48f" },
    ],
    defaultCoverage: 0.45,
    maxLayers: 1,
  },
  {
    id: "contour",
    label: "Contour",
    category: "cheeks",
    prefab: "makeup_contour",
    finishes: ["normal"],
    shades: [
      { name: "Light", hex: "#a37a62" },
      { name: "Medium", hex: "#7e5642" },
      { name: "Deep", hex: "#553628" },
    ],
    defaultCoverage: 0.35,
    maxLayers: 1,
  },
  {
    id: "foundation",
    label: "Foundation",
    category: "face",
    prefab: "makeup_foundation",
    finishes: ["natural", "matte", "radiance"],
    shades: [
      { name: "Porcelain", hex: "#f3d6c1" },
      { name: "Ivory", hex: "#f2b28a" },
      { name: "Sand", hex: "#d9a07a" },
      { name: "Honey", hex: "#b97a52" },
      { name: "Caramel", hex: "#8f5a3a" },
      { name: "Espresso", hex: "#5a3826" },
    ],
    defaultCoverage: 0.4,
    maxLayers: 1,
  },
  {
    id: "concealer",
    label: "Concealer",
    category: "face",
    prefab: "makeup_concealer",
    finishes: ["natural", "matte"],
    shades: [
      { name: "Fair", hex: "#f0baa8" },
      { name: "Light", hex: "#e3a98c" },
      { name: "Medium", hex: "#c48a68" },
      { name: "Deep", hex: "#7f5440" },
    ],
    defaultCoverage: 0.45,
    maxLayers: 1,
  },
]

const PRODUCT_MAP = new Map(PRODUCTS.map((p) => [p.id, p]))
export const productById = (id: ProductId): ProductDef => PRODUCT_MAP.get(id)!
export const isProductId = (id: string): id is ProductId => PRODUCT_MAP.has(id as ProductId)

export const shadeName = (id: ProductId, color: string) =>
  productById(id).shades.find((s) => s.hex === color.toLowerCase())?.name ?? color

/** A fresh shade for a product, used for its first layer or when a layer is added. */
export const defaultShade = (id: ProductId, shadeIndex = 0): Shade => {
  const def = productById(id)
  return { color: def.shades[shadeIndex % def.shades.length].hex, finish: def.finishes[0], coverage: def.defaultCoverage }
}

export const emptyState = (): MakeupState => ({
  smoothing: 0,
  intensity: 1,
  products: Object.fromEntries(PRODUCTS.map((p) => [p.id, { enabled: false, layers: [defaultShade(p.id)] }])) as Record<
    ProductId,
    ProductState
  >,
})

// ---------- Preset looks ----------
// Each preset is a recipe: which products are on, and the shade/finish/coverage (and eyeshadow layers) for each.
// Add a look by appending an entry; the UI picks it up automatically.

export const PRESET_LOOKS: readonly LookProfile[] = [
  {
    id: "bare",
    name: "Bare",
    description: "No makeup, just you.",
    occasion: "everyday",
    smoothing: 0,
    products: {},
  },
  {
    id: "natural",
    name: "Natural",
    description: "Balm nude lip, soft peach cheeks and groomed brows.",
    occasion: "everyday",
    smoothing: 0.4,
    products: {
      lipstick: { color: "#c98b7d", finish: "balm", coverage: 0.45 },
      blush: { color: "#f2a58e", finish: "matte", coverage: 0.3 },
      eyelashes: { color: "#2a1a12", finish: "natural", coverage: 0.7 },
      eyebrows: { color: "#644433", finish: "matte", coverage: 0.35 },
    },
  },
  {
    id: "soft-glam",
    name: "Soft Glam",
    description: "Champagne-to-bronze shimmer lids, pink cream-shine lip and a lit-from-within glow.",
    occasion: "everyday",
    smoothing: 0.6,
    products: {
      foundation: { color: "#d9a07a", finish: "radiance", coverage: 0.35 },
      lipstick: { color: "#e07a9a", finish: "cream_shine", coverage: 0.7 },
      eyeshadow: [
        { color: "#d9b99b", finish: "matte", coverage: 0.5 },
        { color: "#8c5a32", finish: "shimmer", coverage: 0.35 },
      ],
      eyeliner: { color: "#3b2418", finish: "matte_cream", coverage: 0.7 },
      eyelashes: { color: "#000000", finish: "lengthandvolume", coverage: 0.9 },
      blush: { color: "#e0a6bf", finish: "shimmer", coverage: 0.4 },
      highlighter: { color: "#e6ccd4", finish: "shimmer", coverage: 0.45 },
    },
  },
  {
    id: "sunset-bronze",
    name: "Sunset Bronze",
    description: "Three-layer gold-bronze lids, metallic bronze liner and a satin coral lip.",
    occasion: "everyday",
    smoothing: 0.5,
    products: {
      eyeshadow: [
        { color: "#d9b99b", finish: "matte", coverage: 0.45 },
        { color: "#8c5a32", finish: "shimmer", coverage: 0.5 },
        { color: "#c9a24a", finish: "metallic", coverage: 0.45 },
      ],
      eyeliner: { color: "#7a4b25", finish: "metallic", coverage: 0.8 },
      eyelashes: { color: "#2a1a12", finish: "lengthening", coverage: 0.85 },
      lipstick: { color: "#e8705a", finish: "satin", coverage: 0.7 },
      blush: { color: "#c46a4f", finish: "matte", coverage: 0.4 },
      highlighter: { color: "#e3c48f", finish: "shimmer", coverage: 0.4 },
    },
  },
  {
    id: "evening-smoky",
    name: "Evening Smoky",
    description: "Charcoal-to-navy smoky eye, velvet berry lip and sculpted cheeks.",
    occasion: "evening",
    smoothing: 0.6,
    products: {
      eyeshadow: [
        { color: "#2e2b2b", finish: "matte", coverage: 0.65 },
        { color: "#7d6a5e", finish: "shimmer", coverage: 0.4 },
        { color: "#2b3550", finish: "glitter", coverage: 0.35 },
      ],
      eyeliner: { color: "#0d0d0d", finish: "matte_liquid", coverage: 1 },
      eyelashes: { color: "#000000", finish: "volume", coverage: 1 },
      lipstick: { color: "#6b1636", finish: "matte_velvet", coverage: 0.85 },
      lipsliner: { color: "#57122b", finish: "shimmer", coverage: 0.6 },
      contour: { color: "#7e5642", finish: "normal", coverage: 0.4 },
      highlighter: { color: "#e3c48f", finish: "shimmer", coverage: 0.5 },
    },
  },
  {
    id: "classic-red",
    name: "Classic Red",
    description: "Satin red lip with liner, crisp liquid liner and full lashes.",
    occasion: "evening",
    smoothing: 0.5,
    products: {
      lipstick: { color: "#b3122e", finish: "satin", coverage: 0.9 },
      lipsliner: { color: "#8a0f24", finish: "shimmer", coverage: 0.6 },
      eyeliner: { color: "#0d0d0d", finish: "matte_liquid", coverage: 1 },
      eyelashes: { color: "#000000", finish: "volume", coverage: 0.9 },
      eyebrows: { color: "#3e2a22", finish: "matte", coverage: 0.4 },
    },
  },
  {
    id: "berry-pop",
    name: "Berry Pop",
    description: "Metallic plum lip, glittering mauve lids and a berry flush.",
    occasion: "bold",
    smoothing: 0.4,
    products: {
      lipstick: { color: "#7a3b69", finish: "metallic_shine", coverage: 0.85 },
      eyeshadow: [
        { color: "#9b6b84", finish: "matte", coverage: 0.55 },
        { color: "#9b6b84", finish: "glitter", coverage: 0.4 },
      ],
      eyeliner: { color: "#1d2a4f", finish: "shimmer", coverage: 0.8 },
      eyelashes: { color: "#000000", finish: "volume", coverage: 0.9 },
      blush: { color: "#c2577a", finish: "cream_shine", coverage: 0.5 },
    },
  },
]

export const DEFAULT_LOOK_ID = "natural"

// ---------- Look <-> state ----------

const asLayers = (p: LookProduct): Shade[] => (Array.isArray(p) ? p : [p])

/** Turns a look recipe into editable state (deep-copied, so edits never mutate the preset). */
export const stateFromLook = (look: LookProfile): MakeupState => {
  const state = emptyState()
  state.smoothing = look.smoothing
  for (const [id, p] of Object.entries(look.products) as [ProductId, LookProduct][]) {
    const layers = asLayers(p).slice(0, productById(id).maxLayers).map((s) => ({ ...s }))
    if (layers.length) state.products[id] = { enabled: true, layers }
  }
  return state
}

/** Captures the current state as a look recipe (used to save custom looks). Intensity is baked into coverage. */
export const lookFromState = (state: MakeupState, meta: { id: string; name: string; description?: string }): LookProfile => {
  const products: LookProfile["products"] = {}
  for (const def of PRODUCTS) {
    const p = state.products[def.id]
    if (!p.enabled) continue
    const layers = p.layers.map((s) => ({ ...s, coverage: round(clamp01(s.coverage * state.intensity)) }))
    products[def.id] = def.maxLayers > 1 ? layers : layers[0]
  }
  return {
    id: meta.id,
    name: meta.name,
    description: meta.description ?? "Saved from your edits.",
    occasion: "custom",
    smoothing: state.smoothing,
    products,
    custom: true,
  }
}

/** Normalized form used to decide whether the user has edited a look (intensity is ignored on purpose). */
const fingerprint = (state: MakeupState) =>
  JSON.stringify({
    s: round(state.smoothing),
    p: PRODUCTS.filter((d) => state.products[d.id].enabled).map((d) => [
      d.id,
      state.products[d.id].layers.map((l) => [l.color.toLowerCase(), l.finish, round(l.coverage)]),
    ]),
  })

export const matchesLook = (state: MakeupState, look: LookProfile) => fingerprint(state) === fingerprint(stateFromLook(look))

/** Up to 4 representative colors for a look's chip: lips, eyes, cheeks, then anything else. */
export const lookPreviewColors = (look: LookProfile): string[] => {
  const order: ProductId[] = ["lipstick", "eyeshadow", "blush", "eyeliner", "highlighter", "lipsliner", "contour", "foundation"]
  const colors: string[] = []
  for (const id of order) {
    const p = look.products[id]
    if (!p) continue
    for (const layer of asLayers(p)) {
      if (!colors.includes(layer.color)) colors.push(layer.color)
      if (colors.length === 4) return colors
      if (id !== "eyeshadow") break
    }
  }
  return colors
}

// ---------- Validation for looks loaded from storage or shared links ----------

const HEX = /^#[0-9a-f]{6}$/i
const clamp01 = (n: number) => Math.min(1, Math.max(0, n))
const round = (n: number) => Math.round(n * 100) / 100

const sanitizeShade = (id: ProductId, raw: unknown): Shade | null => {
  if (!raw || typeof raw !== "object") return null
  const { color, finish, coverage } = raw as Record<string, unknown>
  if (typeof color !== "string" || !HEX.test(color)) return null
  if (typeof finish !== "string" || !productById(id).finishes.includes(finish)) return null
  if (typeof coverage !== "number" || !Number.isFinite(coverage)) return null
  return { color: color.toLowerCase(), finish, coverage: round(clamp01(coverage)) }
}

/** Returns a safe LookProfile or null. Unknown products, bad colors or undocumented finishes are dropped. */
export const sanitizeLook = (raw: unknown): LookProfile | null => {
  if (!raw || typeof raw !== "object") return null
  const r = raw as Record<string, unknown>
  if (typeof r.id !== "string" || !r.id || typeof r.name !== "string") return null
  const name = r.name.trim().slice(0, 32)
  if (!name) return null

  const products: LookProfile["products"] = {}
  if (r.products && typeof r.products === "object") {
    for (const [id, value] of Object.entries(r.products as Record<string, unknown>)) {
      if (!isProductId(id)) continue
      const layers = (Array.isArray(value) ? value : [value])
        .slice(0, productById(id).maxLayers)
        .map((v) => sanitizeShade(id, v))
        .filter((s): s is Shade => s !== null)
      if (!layers.length) continue
      products[id] = productById(id).maxLayers > 1 ? layers : layers[0]
    }
  }

  const occasion = typeof r.occasion === "string" && r.occasion in OCCASIONS ? (r.occasion as Occasion) : "custom"
  return {
    id: r.id.slice(0, 64),
    name,
    description: typeof r.description === "string" ? r.description.slice(0, 140) : "",
    occasion,
    smoothing: typeof r.smoothing === "number" && Number.isFinite(r.smoothing) ? round(clamp01(r.smoothing)) : 0,
    products,
    custom: true,
  }
}

// ---------- Banuba prefab config ----------

/** Builds a Banuba prefab config (version 2.0.0) from the makeup state. `null` renders no makeup (compare mode). */
export const buildConfig = (state: MakeupState | null) => {
  const face: Record<string, unknown> = {}

  if (state) {
    if (state.smoothing > 0) {
      // smooth: "<whole face> <under eyes>"
      face.makeup_base = { mode: "quality", smooth: `${round(state.smoothing)} ${round(Math.min(1, state.smoothing + 0.2))}` }
    }
    for (const def of PRODUCTS) {
      const p = state.products[def.id]
      if (!p.enabled || !p.layers.length) continue
      const layers = p.layers.map((l) => ({ color: l.color, finish: l.finish, coverage: round(clamp01(l.coverage * state.intensity)) }))
      // Eyeshadow accepts an array of up to 3 layers applied in order; every other prefab takes one object.
      face[def.prefab] = def.maxLayers > 1 && layers.length > 1 ? layers : layers[0]
    }
  }

  return {
    scene: "SwanBeautyTryOn",
    version: "2.0.0",
    camera: {},
    faces: [face],
  }
}
