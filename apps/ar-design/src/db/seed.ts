// Seeds the first brand (Swan Beauty) with a catalog and published looks.
import type { Finish, LookDocument, Region } from "@beautyos/look-format"
import { emptyLook } from "@beautyos/look-format"
import type { DB } from "./client"
import * as repo from "../server/repo"

type ShadeSeed = [name: string, hex: string, finish: Finish, banubaFinish?: string]
const CATALOG: { name: string; region: Region; code: string; shades: ShadeSeed[] }[] = [
  { name: "Velvet Lip Color", region: "lips", code: "LIP", shades: [["Swan Nude", "#c98b7d", "balm"], ["Rosewood", "#a8545f", "satin"], ["Petal Pink", "#e07a9a", "cream", "cream_shine"], ["Coral Bay", "#e8705a", "satin"], ["Classic Red", "#b3122e", "satin"], ["Berry Noir", "#6b1636", "matte"], ["Plum Silk", "#7a3b69", "metallic"]] },
  { name: "Precision Lip Liner", region: "lip_liner", code: "LLN", shades: [["Nude", "#9c6152", "satin"], ["Rose", "#8f3f4c", "satin"], ["Red", "#8a0f24", "satin"], ["Berry", "#57122b", "satin"]] },
  { name: "Silk Eyeshadow", region: "eyeshadow", code: "EYS", shades: [["Champagne", "#d9b99b", "matte"], ["Gold Leaf", "#c9a24a", "metallic"], ["Bronze", "#8c5a32", "shimmer"], ["Taupe", "#7d6a5e", "matte"], ["Mauve", "#9b6b84", "glitter"], ["Emerald", "#2f6b4f", "shimmer"], ["Navy Smoke", "#2b3550", "glitter"], ["Charcoal", "#2e2b2b", "matte"]] },
  { name: "Ink Liner", region: "eyeliner", code: "EYL", shades: [["Jet Black", "#0d0d0d", "matte"], ["Espresso", "#3b2418", "cream", "matte_cream"], ["Navy", "#1d2a4f", "shimmer"], ["Bronze", "#7a4b25", "metallic"]] },
  { name: "Lift Mascara", region: "lashes", code: "MSC", shades: [["Black", "#000000", "volume"], ["Brown Black", "#2a1a12", "natural"]] },
  { name: "Brow Sculpt", region: "brows", code: "BRW", shades: [["Blonde", "#9a7b5a", "matte"], ["Soft Brown", "#644433", "matte"], ["Dark Brown", "#3e2a22", "matte"], ["Soft Black", "#1f1a18", "matte"]] },
  { name: "Cheek Tint", region: "blush", code: "BLS", shades: [["Peach", "#f2a58e", "matte"], ["Rose", "#e0a6bf", "shimmer"], ["Berry", "#c2577a", "cream"], ["Terracotta", "#c46a4f", "matte"]] },
  { name: "Glow Drops", region: "highlighter", code: "HLT", shades: [["Pearl", "#f2e6e6", "shimmer"], ["Champagne", "#e6ccd4", "shimmer"], ["Gold", "#e3c48f", "shimmer"]] },
  { name: "Sculpt Stick", region: "contour", code: "CTR", shades: [["Light", "#a37a62", "matte"], ["Medium", "#7e5642", "matte"], ["Deep", "#553628", "matte"]] },
  { name: "Second Skin Foundation", region: "foundation", code: "FDN", shades: [["Porcelain", "#f3d6c1", "natural"], ["Ivory", "#f2b28a", "natural"], ["Sand", "#d9a07a", "natural"], ["Honey", "#b97a52", "natural"], ["Caramel", "#8f5a3a", "natural"], ["Espresso", "#5a3826", "natural"]] },
  { name: "Bright Eye Concealer", region: "concealer", code: "CNC", shades: [["Fair", "#f0baa8", "natural"], ["Light", "#e3a98c", "natural"], ["Medium", "#c48a68", "natural"], ["Deep", "#7f5440", "natural"]] },
]

type L = [Region, string, Finish, number, string?]
const LOOKS: { name: string; description: string; tags: string[]; smoothing: number; layers: L[] }[] = [
  { name: "Natural", description: "Balm nude lip, soft peach cheeks and groomed brows.", tags: ["everyday"], smoothing: 0.4, layers: [["lips", "#c98b7d", "balm", 0.45, "LIP-001"], ["blush", "#f2a58e", "matte", 0.3, "BLS-001"], ["lashes", "#2a1a12", "natural", 0.7, "MSC-002"], ["brows", "#644433", "matte", 0.35, "BRW-002"]] },
  { name: "Soft Glam", description: "Champagne-to-bronze lids, pink cream-shine lip and a lit-from-within glow.", tags: ["everyday"], smoothing: 0.6, layers: [["foundation", "#d9a07a", "radiant", 0.35], ["lips", "#e07a9a", "cream", 0.7, "LIP-003"], ["eyeshadow", "#d9b99b", "matte", 0.5, "EYS-001"], ["eyeshadow", "#8c5a32", "shimmer", 0.35, "EYS-003"], ["eyeliner", "#3b2418", "cream", 0.7, "EYL-002"], ["lashes", "#000000", "dramatic", 0.9], ["blush", "#e0a6bf", "shimmer", 0.4, "BLS-002"], ["highlighter", "#e6ccd4", "shimmer", 0.45, "HLT-002"]] },
  { name: "Sunset Bronze", description: "Three-layer gold-bronze lids, metallic bronze liner and a satin coral lip.", tags: ["everyday"], smoothing: 0.5, layers: [["eyeshadow", "#d9b99b", "matte", 0.45, "EYS-001"], ["eyeshadow", "#8c5a32", "shimmer", 0.5, "EYS-003"], ["eyeshadow", "#c9a24a", "metallic", 0.45, "EYS-002"], ["eyeliner", "#7a4b25", "metallic", 0.8, "EYL-004"], ["lashes", "#2a1a12", "lengthening", 0.85], ["lips", "#e8705a", "satin", 0.7, "LIP-004"], ["blush", "#c46a4f", "matte", 0.4, "BLS-004"], ["highlighter", "#e3c48f", "shimmer", 0.4, "HLT-003"]] },
  { name: "Evening Smoky", description: "Charcoal-to-navy smoky eye, velvet berry lip and sculpted cheeks.", tags: ["evening"], smoothing: 0.6, layers: [["eyeshadow", "#2e2b2b", "matte", 0.65, "EYS-008"], ["eyeshadow", "#7d6a5e", "shimmer", 0.4], ["eyeshadow", "#2b3550", "glitter", 0.35, "EYS-007"], ["eyeliner", "#0d0d0d", "matte", 1, "EYL-001"], ["lashes", "#000000", "volume", 1, "MSC-001"], ["lips", "#6b1636", "matte", 0.85, "LIP-006"], ["lip_liner", "#57122b", "satin", 0.6, "LLN-004"], ["contour", "#7e5642", "matte", 0.4, "CTR-002"], ["highlighter", "#e3c48f", "shimmer", 0.5, "HLT-003"]] },
  { name: "Classic Red", description: "Satin red lip with liner, crisp liquid liner and full lashes.", tags: ["evening"], smoothing: 0.5, layers: [["lips", "#b3122e", "satin", 0.9, "LIP-005"], ["lip_liner", "#8a0f24", "satin", 0.6, "LLN-003"], ["eyeliner", "#0d0d0d", "matte", 1, "EYL-001"], ["lashes", "#000000", "volume", 0.9, "MSC-001"], ["brows", "#3e2a22", "matte", 0.4, "BRW-003"]] },
  { name: "Berry Pop", description: "Metallic plum lip, glittering mauve lids and a berry flush.", tags: ["bold"], smoothing: 0.4, layers: [["lips", "#7a3b69", "metallic", 0.85, "LIP-007"], ["eyeshadow", "#9b6b84", "matte", 0.55], ["eyeshadow", "#9b6b84", "glitter", 0.4, "EYS-005"], ["eyeliner", "#1d2a4f", "shimmer", 0.8, "EYL-003"], ["lashes", "#000000", "volume", 0.9, "MSC-001"], ["blush", "#c2577a", "cream", 0.5, "BLS-003"]] },
]

export async function seed(db: DB) {
  const existing = await repo.listBrands(db)
  if (existing.some((b) => b.slug === "swan-beauty")) return { created: false }
  const brand = await repo.createBrand(db, { name: "Swan Beauty", slug: "swan-beauty", accentColor: "#9b4b5c" })
  const bySku = new Map<string, { id: string; name: string; productName: string; banubaFinish?: string }>()
  for (const p of CATALOG) {
    const product = await repo.createProduct(db, brand.id, { name: p.name, region: p.region })
    for (const [i, [name, hex, finish, banuba]] of p.shades.entries()) {
      const sku = `${p.code}-${String(i + 1).padStart(3, "0")}`
      const s = await repo.addShade(db, brand.id, product.id, { name, sku, color: hex, finish, banubaFinish: banuba ?? null })
      bySku.set(sku, { id: s.id, name, productName: p.name, banubaFinish: banuba })
    }
  }
  for (const l of LOOKS) {
    const doc: LookDocument = {
      ...emptyLook(l.name),
      description: l.description,
      tags: l.tags,
      skin: { smoothing: l.smoothing },
      layers: l.layers.map(([region, color, finish, coverage, sku]) => {
        const s = sku ? bySku.get(sku) : undefined
        return {
          region,
          material: { color, finish, coverage, ...(s?.banubaFinish ? { overrides: { banuba: { finish: s.banubaFinish } } } : {}) },
          ...(s && sku ? { shade: { shadeId: s.id, sku, name: s.name, productName: s.productName } } : {}),
        }
      }),
    }
    const look = await repo.createLook(db, brand.id, { document: doc })
    await repo.publishLook(db, brand.id, look.id, "Initial release")
  }
  return { created: true, brand }
}
