// Makeup state model and Banuba prefab config builder.
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

export interface ProductDef {
  id: ProductId
  label: string
  category: CategoryId
  /** Prefab key in the `faces[0]` object */
  prefab: `makeup_${ProductId}`
  finishes: readonly string[]
  shades: readonly { name: string; hex: string }[]
  defaultCoverage: number
}

export interface ProductState {
  enabled: boolean
  color: string
  finish: string
  coverage: number
}

export interface MakeupState {
  /** Skin smoothing strength for the whole face, 0..1 (makeup_base.smooth) */
  smoothing: number
  products: Record<ProductId, ProductState>
}

export const CATEGORIES: readonly { id: CategoryId; label: string }[] = [
  { id: "lips", label: "Lips" },
  { id: "eyes", label: "Eyes" },
  { id: "cheeks", label: "Cheeks" },
  { id: "face", label: "Face" },
]

// Finish lists are the documented options per region (subset for lipstick to keep the UI usable).
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
  },
  {
    id: "eyeshadow",
    label: "Eyeshadow",
    category: "eyes",
    prefab: "makeup_eyeshadow",
    finishes: ["matte", "shimmer", "metallic", "matte_powder", "glitter", "glitter_metallic", "glitter_sheer", "cream"],
    shades: [
      { name: "Champagne", hex: "#d9b99b" },
      { name: "Bronze", hex: "#8c5a32" },
      { name: "Taupe", hex: "#7d6a5e" },
      { name: "Mauve", hex: "#9b6b84" },
      { name: "Emerald", hex: "#2f6b4f" },
      { name: "Navy Smoke", hex: "#2b3550" },
      { name: "Charcoal", hex: "#2e2b2b" },
    ],
    defaultCoverage: 0.6,
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
  },
]

export const productById = (id: ProductId): ProductDef => PRODUCTS.find((p) => p.id === id)!

const off = (id: ProductId): ProductState => {
  const def = productById(id)
  return { enabled: false, color: def.shades[0].hex, finish: def.finishes[0], coverage: def.defaultCoverage }
}

export const emptyState = (): MakeupState => ({
  smoothing: 0,
  products: Object.fromEntries(PRODUCTS.map((p) => [p.id, off(p.id)])) as Record<ProductId, ProductState>,
})

type LookSpec = {
  smoothing: number
  products: Partial<Record<ProductId, Omit<ProductState, "enabled">>>
}

export const LOOKS: readonly { id: string; label: string; spec: LookSpec }[] = [
  { id: "bare", label: "Bare", spec: { smoothing: 0, products: {} } },
  {
    id: "natural",
    label: "Natural",
    spec: {
      smoothing: 0.4,
      products: {
        lipstick: { color: "#c98b7d", finish: "balm", coverage: 0.45 },
        blush: { color: "#f2a58e", finish: "matte", coverage: 0.3 },
        eyelashes: { color: "#2a1a12", finish: "natural", coverage: 0.7 },
        eyebrows: { color: "#644433", finish: "matte", coverage: 0.35 },
      },
    },
  },
  {
    id: "soft-glam",
    label: "Soft Glam",
    spec: {
      smoothing: 0.6,
      products: {
        foundation: { color: "#d9a07a", finish: "radiance", coverage: 0.35 },
        lipstick: { color: "#e07a9a", finish: "cream_shine", coverage: 0.7 },
        eyeshadow: { color: "#d9b99b", finish: "shimmer", coverage: 0.55 },
        eyeliner: { color: "#3b2418", finish: "matte_cream", coverage: 0.7 },
        eyelashes: { color: "#000000", finish: "lengthandvolume", coverage: 0.9 },
        blush: { color: "#e0a6bf", finish: "shimmer", coverage: 0.4 },
        highlighter: { color: "#e6ccd4", finish: "shimmer", coverage: 0.45 },
      },
    },
  },
  {
    id: "evening",
    label: "Evening",
    spec: {
      smoothing: 0.6,
      products: {
        lipstick: { color: "#6b1636", finish: "matte_velvet", coverage: 0.85 },
        lipsliner: { color: "#57122b", finish: "shimmer", coverage: 0.6 },
        eyeshadow: { color: "#2e2b2b", finish: "matte", coverage: 0.7 },
        eyeliner: { color: "#0d0d0d", finish: "matte_liquid", coverage: 1 },
        eyelashes: { color: "#000000", finish: "volume", coverage: 1 },
        contour: { color: "#7e5642", finish: "normal", coverage: 0.4 },
        highlighter: { color: "#e3c48f", finish: "shimmer", coverage: 0.5 },
      },
    },
  },
  {
    id: "classic-red",
    label: "Classic Red",
    spec: {
      smoothing: 0.5,
      products: {
        lipstick: { color: "#b3122e", finish: "satin", coverage: 0.9 },
        lipsliner: { color: "#8a0f24", finish: "shimmer", coverage: 0.6 },
        eyeliner: { color: "#0d0d0d", finish: "matte_liquid", coverage: 1 },
        eyelashes: { color: "#000000", finish: "volume", coverage: 0.9 },
        eyebrows: { color: "#3e2a22", finish: "matte", coverage: 0.4 },
      },
    },
  },
]

export const stateFromLook = (spec: LookSpec): MakeupState => {
  const state = emptyState()
  state.smoothing = spec.smoothing
  for (const [id, p] of Object.entries(spec.products) as [ProductId, Omit<ProductState, "enabled">][]) {
    state.products[id] = { enabled: true, ...p }
  }
  return state
}

const round = (n: number) => Math.round(n * 100) / 100

/** Builds a Banuba prefab config (version 2.0.0) from the makeup state. */
export const buildConfig = (state: MakeupState | null) => {
  const face: Record<string, unknown> = {}

  if (state) {
    if (state.smoothing > 0) {
      // smooth: "<whole face> <under eyes>"
      face.makeup_base = { mode: "quality", smooth: `${round(state.smoothing)} ${round(Math.min(1, state.smoothing + 0.2))}` }
    }
    for (const def of PRODUCTS) {
      const p = state.products[def.id]
      if (!p.enabled) continue
      face[def.prefab] = { color: p.color, finish: p.finish, coverage: round(p.coverage) }
    }
  }

  return {
    scene: "SwanBeautyTryOn",
    version: "2.0.0",
    camera: {},
    faces: [face],
  }
}
