// Face regions and finishes in Beauty OS's platform-neutral vocabulary.
// Each AR platform adapter maps these onto its own primitives.

export const REGIONS = [
  "lips",
  "lip_liner",
  "eyeshadow",
  "eyeliner",
  "lashes",
  "brows",
  "blush",
  "highlighter",
  "contour",
  "foundation",
  "concealer",
] as const
export type Region = (typeof REGIONS)[number]

export const REGION_GROUPS = ["lips", "eyes", "cheeks", "complexion"] as const
export type RegionGroup = (typeof REGION_GROUPS)[number]

/** Neutral finish vocabulary shared by all platforms. */
export const FINISHES = [
  "matte",
  "satin",
  "cream",
  "gloss",
  "balm",
  "sheer",
  "shimmer",
  "metallic",
  "glitter",
  "natural",
  "radiant",
  "volume",
  "lengthening",
  "dramatic",
] as const
export type Finish = (typeof FINISHES)[number]

export interface RegionSpec {
  id: Region
  label: string
  group: RegionGroup
  /** How many stacked layers the region accepts in one look. */
  maxLayers: number
  /** Neutral finishes an author can pick for this region. */
  finishes: readonly Finish[]
  defaultCoverage: number
}

export const REGION_SPECS: Record<Region, RegionSpec> = {
  lips: { id: "lips", label: "Lipstick", group: "lips", maxLayers: 1, finishes: ["matte", "satin", "cream", "gloss", "balm", "sheer", "shimmer", "metallic"], defaultCoverage: 0.75 },
  lip_liner: { id: "lip_liner", label: "Lip liner", group: "lips", maxLayers: 1, finishes: ["satin"], defaultCoverage: 0.6 },
  eyeshadow: { id: "eyeshadow", label: "Eyeshadow", group: "eyes", maxLayers: 3, finishes: ["matte", "shimmer", "metallic", "glitter", "cream", "sheer"], defaultCoverage: 0.6 },
  eyeliner: { id: "eyeliner", label: "Eyeliner", group: "eyes", maxLayers: 1, finishes: ["matte", "cream", "shimmer", "metallic", "glitter"], defaultCoverage: 0.9 },
  lashes: { id: "lashes", label: "Lashes", group: "eyes", maxLayers: 1, finishes: ["natural", "volume", "lengthening", "dramatic"], defaultCoverage: 0.9 },
  brows: { id: "brows", label: "Brows", group: "eyes", maxLayers: 1, finishes: ["matte", "gloss", "sheer"], defaultCoverage: 0.5 },
  blush: { id: "blush", label: "Blush", group: "cheeks", maxLayers: 1, finishes: ["matte", "shimmer", "cream"], defaultCoverage: 0.45 },
  highlighter: { id: "highlighter", label: "Highlighter", group: "cheeks", maxLayers: 1, finishes: ["shimmer"], defaultCoverage: 0.45 },
  contour: { id: "contour", label: "Contour", group: "cheeks", maxLayers: 1, finishes: ["matte"], defaultCoverage: 0.35 },
  foundation: { id: "foundation", label: "Foundation", group: "complexion", maxLayers: 1, finishes: ["natural", "matte", "radiant"], defaultCoverage: 0.4 },
  concealer: { id: "concealer", label: "Concealer", group: "complexion", maxLayers: 1, finishes: ["natural", "matte"], defaultCoverage: 0.45 },
}

export const GROUP_LABELS: Record<RegionGroup, string> = {
  lips: "Lips",
  eyes: "Eyes",
  cheeks: "Cheeks",
  complexion: "Complexion",
}

export const isRegion = (v: unknown): v is Region => typeof v === "string" && (REGIONS as readonly string[]).includes(v)
