// Formulation engine: turns colors (from chips, swatches, libraries or a prompt) into a valid look.
// Every decision is recorded in `reasoning` so artists can see why a color landed where it did.
import {
  REGION_SPECS,
  emptyLook,
  validateLook,
  type Finish,
  type Layer,
  type LookDocument,
  type Region,
} from "@beautyos/look-format"
import { deltaE2000, hexToLab, labToLch, type Lch } from "./color"
import { generateSkinFamily } from "./skin"

export type Occasion = "everyday" | "evening" | "bold"

export interface InputColor {
  hex: string
  name?: string
  /** Pin this color to a region (e.g. from "red lips" in a prompt). */
  region?: Region
  finish?: Finish
}

export interface CatalogShade {
  shadeId?: string
  sku?: string
  name: string
  productName?: string
  region: Region
  color: string
  finish: Finish
  banubaFinish?: string | null
}

export interface FormulateInput {
  name?: string
  colors: InputColor[]
  /** Skin color for complexion products and tone-aware choices. */
  skin?: string
  occasion?: Occasion
  /** Global coverage scale, 0.3..1.2 */
  intensity?: number
  /** Snap to sellable catalog shades within this ΔE2000 (default 6). Set 0 to disable. */
  snapThreshold?: number
  catalog?: CatalogShade[]
  /** Regions to fill from the skin tone even without input colors. */
  complexion?: boolean
}

export interface Assignment {
  region: Region
  hex: string
  finish: Finish
  reason: string
  confidence: number
  catalog?: { name: string; sku?: string; deltaE: number }
}

export interface Formulation {
  look: LookDocument
  assignments: Assignment[]
  unused: { hex: string; reason: string }[]
  reasoning: string[]
}

interface Candidate {
  input: InputColor
  lch: Lch
}

const r1 = (n: number) => Math.round(n * 10) / 10
const hueIn = (h: number, from: number, to: number) => (from <= to ? h >= from && h <= to : h >= from || h <= to)

/** Default finish per region and occasion, unless the color/prompt specified one. */
const FINISH_BY_OCCASION: Record<Occasion, Partial<Record<Region, Finish>>> = {
  everyday: { lips: "satin", lip_liner: "satin", eyeshadow: "matte", eyeliner: "cream", lashes: "natural", brows: "matte", blush: "matte", highlighter: "shimmer", contour: "matte", foundation: "natural", concealer: "natural" },
  evening: { lips: "matte", lip_liner: "satin", eyeshadow: "shimmer", eyeliner: "matte", lashes: "volume", brows: "matte", blush: "shimmer", highlighter: "shimmer", contour: "matte", foundation: "matte", concealer: "matte" },
  bold: { lips: "metallic", lip_liner: "satin", eyeshadow: "metallic", eyeliner: "matte", lashes: "dramatic", brows: "matte", blush: "cream", highlighter: "shimmer", contour: "matte", foundation: "radiant", concealer: "natural" },
}

const NAME_FINISH: [RegExp, Finish][] = [
  [/metal|chrome|foil/i, "metallic"],
  [/glitter|sparkle/i, "glitter"],
  [/shimmer|pearl|lustre|luster|frost/i, "shimmer"],
  [/gloss|glossy|vinyl|shine/i, "gloss"],
  [/satin/i, "satin"],
  [/matte|velvet/i, "matte"],
  [/cream|creamy/i, "cream"],
  [/balm|tint/i, "balm"],
  [/sheer/i, "sheer"],
]

function pickFinish(region: Region, occasion: Occasion, c: InputColor): Finish {
  const allowed = REGION_SPECS[region].finishes
  const wanted = c.finish ?? NAME_FINISH.find(([re]) => c.name && re.test(c.name))?.[1]
  if (wanted && allowed.includes(wanted)) return wanted
  const def = FINISH_BY_OCCASION[occasion][region]
  return def && allowed.includes(def) ? def : allowed[0]
}

/** Scores how well a color suits each color-driven region (0..1). */
function regionScores({ L, C, h }: Lch): Partial<Record<Region, number>> {
  const s: Partial<Record<Region, number>> = {}
  // Lips: reds, pinks, corals, berries, plums with real chroma; or deep nudes.
  if (C > 25 && (hueIn(h, 330, 50))) s.lips = 0.6 + Math.min(0.4, (C - 25) / 60)
  else if (C > 12 && hueIn(h, 15, 60) && L > 30 && L < 65) s.lips = 0.45
  else if (C > 20 && hueIn(h, 290, 330)) s.lips = 0.5
  // Blush: lighter pinks/peaches/corals, softer chroma.
  if (L > 50 && L < 82 && C > 12 && C < 55 && hueIn(h, 345, 65)) s.blush = 0.55 + (L > 60 ? 0.2 : 0)
  // Highlighter: very light, low-to-mid chroma (pearl, champagne, light gold).
  if (L > 78 && C < 30) s.highlighter = 0.6 + (L - 78) / 60
  // Eyeliner: near-black or very deep jewel tones.
  if (L < 25) s.eyeliner = 0.75 + (C < 15 ? 0.2 : 0)
  // Brows: mid-dark, low-chroma browns/taupes.
  if (L > 18 && L < 45 && C > 4 && C < 28 && hueIn(h, 35, 85)) s.brows = 0.55
  // Eyeshadow: almost anything that isn't clearly a lip/cheek color; favors neutrals, golds, greens, blues, purples.
  s.eyeshadow = 0.35 + (hueIn(h, 60, 320) ? 0.3 : 0) + (C < 25 && L < 80 ? 0.1 : 0)
  return s
}

export function formulateLook(input: FormulateInput): Formulation {
  const occasion = input.occasion ?? "everyday"
  const intensity = Math.min(1.2, Math.max(0.3, input.intensity ?? 1))
  const snap = input.snapThreshold ?? 6
  const reasoning: string[] = [`Occasion: ${occasion}; intensity ×${intensity}.`]
  const assignments: Assignment[] = []
  const unused: Formulation["unused"] = []
  const taken = new Map<Region, number>()
  const room = (r: Region) => (taken.get(r) ?? 0) < REGION_SPECS[r].maxLayers

  const assign = (region: Region, c: InputColor, reason: string, confidence: number) => {
    taken.set(region, (taken.get(region) ?? 0) + 1)
    assignments.push({ region, hex: c.hex.toLowerCase(), finish: pickFinish(region, occasion, c), reason, confidence: r1(confidence) })
  }

  const candidates: Candidate[] = input.colors.map((c) => ({ input: c, lch: labToLch(hexToLab(c.hex)) }))

  // 1. Explicit placements (from prompts or the author) win.
  const free: Candidate[] = []
  for (const c of candidates) {
    if (c.input.region && room(c.input.region)) assign(c.input.region, c.input, "Placed as requested.", 1)
    else free.push(c)
  }

  // 2. Skin-like colors become complexion products when a skin tone is known or the color is clearly skin.
  const skinFamily = input.skin ? generateSkinFamily(input.skin) : null
  const remaining: Candidate[] = []
  for (const c of free) {
    const skinLike = c.lch.C > 8 && c.lch.C < 40 && hueIn(c.lch.h, 35, 80) && c.lch.L > 30 && c.lch.L < 85
    const nearSkin = skinFamily ? deltaE2000(hexToLab(c.input.hex), skinFamily.analysis.lab) < 8 : false
    if ((nearSkin || (skinLike && !skinFamily)) && room("foundation") && c.lch.C < 30) {
      assign("foundation", c.input, nearSkin ? "Within ΔE 8 of the skin tone → foundation match." : "Skin-like hue and chroma → foundation.", nearSkin ? 0.9 : 0.5)
    } else remaining.push(c)
  }

  // 3. Greedy: give each region its best-scoring color, most confident first.
  const pairs: { c: Candidate; region: Region; score: number }[] = []
  for (const c of remaining) for (const [region, score] of Object.entries(regionScores(c.lch)) as [Region, number][]) pairs.push({ c, region, score })
  pairs.sort((a, b) => b.score - a.score)
  const used = new Set<Candidate>()
  for (const p of pairs) {
    if (used.has(p.c) || !room(p.region)) continue
    if (p.region === "eyeshadow") continue // eyeshadow takes leftovers below, ordered by lightness
    used.add(p.c)
    const { L, C, h } = p.c.lch
    assign(p.region, p.c.input, `L*=${r1(L)}, C=${r1(C)}, h=${r1(h)}° fits ${REGION_SPECS[p.region].label.toLowerCase()}.`, p.score)
  }

  // 4. Eyeshadow: up to 3 leftovers, light → dark (base, crease, lid/outer corner).
  const shadows = remaining.filter((c) => !used.has(c)).sort((a, b) => b.lch.L - a.lch.L)
  const roles = ["base (lightest)", "crease (mid)", "lid / outer corner (deepest)"]
  for (const c of shadows) {
    if (!room("eyeshadow")) { unused.push({ hex: c.input.hex, reason: "Eyeshadow already has 3 layers." }); continue }
    used.add(c)
    assign("eyeshadow", c.input, `Eyeshadow ${roles[taken.get("eyeshadow") ?? 0]}: layered light → dark for depth.`, 0.6)
  }

  // 5. Fill complexion and structure from the skin tone.
  if (skinFamily && (input.complexion ?? true)) {
    reasoning.push(...skinFamily.reasoning)
    const fill = (region: Region, hex: string, why: string) => room(region) && assign(region, { hex }, why, 0.85)
    fill("foundation", skinFamily.foundationLadder[2].hex, "Foundation = skin match from the tone analysis.")
    fill("concealer", skinFamily.concealer[0].hex, "Concealer = brightening shade from the tone analysis.")
    if (occasion !== "everyday") fill("contour", skinFamily.contour.hex, "Contour = cool, desaturated shadow tone for this skin.")
    fill("highlighter", skinFamily.highlighter.hex, `Highlighter = ${skinFamily.highlighter.label.toLowerCase()} for depth ${skinFamily.analysis.depth}.`)
    fill("blush", skinFamily.blush[0].hex, `Blush = ${skinFamily.blush[0].label.toLowerCase()} for a ${skinFamily.analysis.undertone} undertone.`)
    if (!taken.has("lips") && occasion === "everyday") fill("lips", skinFamily.lipNudes[0].hex, "No lip color given; everyday look gets a skin-derived nude.")
  }

  // 6. Definition: evening/bold looks get liner and lashes even without a dark chip.
  if (occasion !== "everyday" || taken.has("eyeshadow")) {
    if (room("lashes")) assign("lashes", { hex: "#0b0b0b" }, "Lashes add definition to any eye look.", 0.7)
    if (occasion !== "everyday" && room("eyeliner")) assign("eyeliner", { hex: "#111111" }, `${occasion} look: add a defined black liner.`, 0.6)
  }

  // 7. Snap to sellable catalog shades.
  if (input.catalog?.length && snap > 0) {
    for (const a of assignments) {
      const lab = hexToLab(a.hex)
      let best: { shade: CatalogShade; dE: number } | null = null
      for (const s of input.catalog) {
        if (s.region !== a.region) continue
        const dE = deltaE2000(lab, hexToLab(s.color))
        if (!best || dE < best.dE) best = { shade: s, dE }
      }
      if (best && best.dE <= snap) {
        a.catalog = { name: best.shade.name, sku: best.shade.sku, deltaE: r1(best.dE) }
        a.reason += ` Matched catalog shade ${best.shade.name}${best.shade.sku ? ` (${best.shade.sku})` : ""} at ΔE ${r1(best.dE)}.`
        a.hex = best.shade.color
        if (REGION_SPECS[a.region].finishes.includes(best.shade.finish)) a.finish = best.shade.finish
      }
    }
    const matched = assignments.filter((a) => a.catalog).length
    reasoning.push(`${matched}/${assignments.length} layers matched sellable catalog shades within ΔE ${snap}.`)
  }

  for (const c of candidates) if (!used.has(c) && !c.input.region && !assignments.some((a) => a.hex === c.input.hex.toLowerCase())) {
    if (!unused.some((u) => u.hex === c.input.hex)) unused.push({ hex: c.input.hex, reason: "No region needed it." })
  }

  // Build the document in a stable region order.
  const order = Object.keys(REGION_SPECS) as Region[]
  const layers: Layer[] = assignments
    .slice()
    .sort((a, b) => order.indexOf(a.region) - order.indexOf(b.region))
    .map((a) => {
      const shade = input.catalog?.find((s) => s.region === a.region && a.catalog && s.name === a.catalog.name)
      return {
        region: a.region,
        material: {
          color: a.hex,
          finish: a.finish,
          coverage: Math.round(Math.min(1, REGION_SPECS[a.region].defaultCoverage * intensity) * 100) / 100,
          ...(shade?.banubaFinish ? { overrides: { banuba: { finish: shade.banubaFinish } } } : {}),
        },
        ...(shade ? { shade: { ...(shade.shadeId ? { shadeId: shade.shadeId } : {}), ...(shade.sku ? { sku: shade.sku } : {}), name: shade.name, ...(shade.productName ? { productName: shade.productName } : {}) } } : {}),
      }
    })

  const look: LookDocument = {
    ...emptyLook(input.name ?? "Formulated look"),
    description: `Formulated from ${input.colors.length} color${input.colors.length === 1 ? "" : "s"}${skinFamily ? ` for ${skinFamily.analysis.category.replace("_", " ")} ${skinFamily.analysis.undertone} skin` : ""}.`,
    tags: [occasion, "formulated"],
    skin: { smoothing: occasion === "everyday" ? 0.35 : 0.5 },
    layers,
  }
  const checked = validateLook(look)
  if (!checked.ok) throw new Error(`Formulation produced an invalid look: ${checked.issues.map((i) => i.message).join("; ")}`)
  return { look: checked.look, assignments, unused, reasoning }
}
