// Skin tone reasoning: classify a measured skin color and generate realistic tonal families.
//
// Classification uses the Individual Typology Angle (ITA°), the standard colorimetric skin measure:
//   ITA° = atan((L* − 50) / b*) · 180/π      (Chardon et al., 1991; Del Bino et al., 2006)
// Undertone uses the CIELAB hue angle h_ab and the a*/b* balance. Real skin sits around h ≈ 40–75°:
// lower angles read pink/red (cool), higher read yellow/golden (warm); a low a*/b* ratio reads olive.
// Thresholds below are heuristics tuned for makeup matching, not a medical classification.
import { fitToGamut, hexToLab, labToLch, lchToHex, type Lab, type Lch } from "./color"

export type SkinCategory = "very_light" | "light" | "intermediate" | "tan" | "brown" | "dark"
export type Undertone = "cool" | "neutral" | "warm" | "olive"

export interface SkinAnalysis {
  hex: string
  lab: Lab
  lch: Lch
  ita: number
  category: SkinCategory
  /** 1 (lightest) .. 10 (deepest), from L*. Useful for shade ladders. */
  depth: number
  undertone: Undertone
  reasoning: string[]
}

const CATEGORY_LABEL: Record<SkinCategory, string> = {
  very_light: "very light",
  light: "light",
  intermediate: "intermediate",
  tan: "tan",
  brown: "brown",
  dark: "dark",
}

const r1 = (n: number) => Math.round(n * 10) / 10

export function analyzeSkin(hex: string): SkinAnalysis {
  const lab = hexToLab(hex)
  const lch = labToLch(lab)
  const ita = (Math.atan2(lab.L - 50, lab.b) * 180) / Math.PI
  const category: SkinCategory =
    ita > 55 ? "very_light" : ita > 41 ? "light" : ita > 28 ? "intermediate" : ita > 10 ? "tan" : ita > -30 ? "brown" : "dark"
  const depth = Math.min(10, Math.max(1, Math.round(1 + ((80 - lab.L) / 60) * 9)))

  const ratio = lab.a / Math.max(1, lab.b)
  let undertone: Undertone
  const reasoning: string[] = [
    `Measured L*=${r1(lab.L)}, a*=${r1(lab.a)}, b*=${r1(lab.b)} (hue ${r1(lch.h)}°, chroma ${r1(lch.C)}).`,
    `ITA° = ${r1(ita)} → ${CATEGORY_LABEL[category]} skin (depth ${depth}/10).`,
  ]
  if (ratio < 0.55 && lch.h > 58 && lch.C < 30) {
    undertone = "olive"
    reasoning.push(`a*/b* = ${r1(ratio)} is low (little red relative to yellow) with muted chroma → olive undertone.`)
  } else if (lch.h < 52) {
    undertone = "cool"
    reasoning.push(`Hue ${r1(lch.h)}° is below 52° (toward red/pink) → cool undertone.`)
  } else if (lch.h > 62) {
    undertone = "warm"
    reasoning.push(`Hue ${r1(lch.h)}° is above 62° (toward yellow/golden) → warm undertone.`)
  } else {
    undertone = "neutral"
    reasoning.push(`Hue ${r1(lch.h)}° sits in the 52–62° band → neutral undertone.`)
  }
  return { hex: lchToHex(lch), lab, lch, ita: r1(ita), category, depth, undertone, reasoning }
}

export interface Tone {
  hex: string
  label: string
  note?: string
}

export interface SkinFamily {
  analysis: SkinAnalysis
  /** Foundation shades around the base: two lighter, the match, two deeper. */
  foundationLadder: Tone[]
  /** Same depth, different undertones, for undertone-matching. */
  undertoneVariants: Record<Undertone, Tone>
  /** Natural variation across the face. Real skin is never one flat color. */
  zones: Tone[]
  concealer: Tone[]
  contour: Tone
  highlighter: Tone
  blush: Tone[]
  lipNudes: Tone[]
  reasoning: string[]
}

/** Shift in LCh, keep in sRGB gamut, return hex. */
const shift = (base: Lch, d: Partial<Lch> & { Cmul?: number }): string =>
  lchToHex(fitToGamut({ L: Math.min(98, Math.max(4, base.L + (d.L ?? 0))), C: Math.max(0, base.C * (d.Cmul ?? 1) + (d.C ?? 0)), h: (base.h + (d.h ?? 0) + 360) % 360 }))

const UNDERTONE_HUE: Record<Undertone, number> = { cool: 46, neutral: 57, warm: 68, olive: 72 }

export function generateSkinFamily(hex: string): SkinFamily {
  const analysis = analyzeSkin(hex)
  const base = analysis.lch
  const deep = analysis.depth >= 6
  const reasoning = [...analysis.reasoning]

  // Deeper skin carries more chroma as it darkens; lighter skin loses a little as it lightens.
  const ladderStep = 5
  const foundationLadder: Tone[] = [-2, -1, 0, 1, 2].map((n) => ({
    hex: shift(base, { L: -n * ladderStep, Cmul: 1 + n * 0.06 }),
    label: n === 0 ? "Match" : n < 0 ? `${-n} lighter` : `${n} deeper`,
  }))
  reasoning.push(`Foundation ladder steps L* by ${ladderStep} and scales chroma ±6% per step, as deeper skin is more saturated.`)

  const undertoneVariants = Object.fromEntries(
    (Object.keys(UNDERTONE_HUE) as Undertone[]).map((u) => [
      u,
      { hex: lchToHex(fitToGamut({ L: base.L, C: u === "olive" ? base.C * 0.8 : base.C, h: UNDERTONE_HUE[u] })), label: u, note: u === analysis.undertone ? "detected" : undefined },
    ]),
  ) as Record<Undertone, Tone>

  // Zone variation: perimeter is deeper, center brighter, cheeks/nose flushed (more blood → +a*),
  // forehead slightly more yellow, under-eye cooler and darker (thin skin, visible vasculature)
  // on light skin, and deeper/warmer (hyperpigmentation) on deep skin.
  const zones: Tone[] = [
    { hex: shift(base, { L: 1.5, h: 3 }), label: "Forehead", note: "slightly brighter, more golden" },
    { hex: shift(base, { L: -1, C: 4, h: -6 }), label: "Cheeks", note: "flushed: more red" },
    { hex: shift(base, { L: 0.5, C: 3, h: -4 }), label: "Nose", note: "warm flush" },
    { hex: shift(base, { L: -3.5, Cmul: 0.95 }), label: "Jaw / perimeter", note: "deeper at the edges" },
    deep
      ? { hex: shift(base, { L: -6, C: 1, h: -3 }), label: "Under-eye", note: "deeper, warmer pigmentation" }
      : { hex: shift(base, { L: -4, Cmul: 0.75, h: -14 }), label: "Under-eye", note: "cooler, slightly violet shadow" },
    { hex: shift(base, { L: 2.5, Cmul: 0.9 }), label: "High points", note: "catches light" },
  ]
  reasoning.push("Generated six facial zones so foundation, concealer and contour can be checked against realistic variation, not a flat swatch.")

  // Concealer: brightening shade + a color corrector that neutralizes the under-eye shadow.
  const concealer: Tone[] = [
    { hex: shift(base, { L: 5, h: 4 }), label: "Brighten", note: "1–2 shades lighter, slightly warmer" },
    deep
      ? { hex: lchToHex(fitToGamut({ L: base.L + 4, C: base.C + 18, h: 55 })), label: "Corrector", note: "orange/peach cancels blue-grey darkness on deep skin" }
      : { hex: lchToHex(fitToGamut({ L: base.L + 6, C: base.C + 8, h: 62 })), label: "Corrector", note: "peach/bisque cancels violet shadow on light skin" },
  ]
  reasoning.push(`Corrector chosen ${deep ? "orange-peach" : "light peach"} because it sits opposite the under-eye shadow on the color wheel.`)

  // Contour mimics a real shadow: darker, desaturated and slightly cooler.
  const contour: Tone = { hex: shift(base, { L: -13, Cmul: 0.78, h: -5 }), label: "Contour", note: "shadow = darker, greyer, cooler" }
  reasoning.push("Contour is 13 L* deeper with 22% less chroma and a cooler hue, which is how natural shadows read; warm/orange contour looks like bronzer, not shadow.")

  const highlighter: Tone =
    analysis.depth <= 3
      ? { hex: lchToHex({ L: 93, C: 6, h: 20 }), label: "Pearl", note: "light skin: pale, pink-pearl reflect" }
      : analysis.depth <= 6
        ? { hex: lchToHex(fitToGamut({ L: 86, C: 18, h: 70 })), label: "Champagne", note: "medium skin: champagne-gold reflect" }
        : { hex: lchToHex(fitToGamut({ L: 72, C: 34, h: 75 })), label: "Gold", note: "deep skin: rich gold so the glow isn't ashy" }
  reasoning.push(`Highlighter: ${highlighter.label.toLowerCase()} for depth ${analysis.depth}; too-pale highlight on deep skin turns grey.`)

  const blushL = Math.max(38, Math.min(72, base.L - 6))
  const blushC = 30 + analysis.depth * 3
  const blush: Tone[] =
    analysis.undertone === "cool"
      ? [{ hex: lchToHex(fitToGamut({ L: blushL, C: blushC, h: 8 })), label: "Rose" }, { hex: lchToHex(fitToGamut({ L: blushL - 6, C: blushC + 6, h: 355 })), label: "Berry" }]
      : analysis.undertone === "neutral"
        ? [{ hex: lchToHex(fitToGamut({ L: blushL, C: blushC, h: 22 })), label: "Soft coral" }, { hex: lchToHex(fitToGamut({ L: blushL - 4, C: blushC, h: 10 })), label: "Rose" }]
        : [{ hex: lchToHex(fitToGamut({ L: blushL, C: blushC, h: 35 })), label: "Peach" }, { hex: lchToHex(fitToGamut({ L: blushL - 8, C: blushC + 4, h: 30 })), label: "Terracotta" }]
  reasoning.push(`Blush depth tracks skin depth (L*≈${r1(blushL)}, chroma ${blushC}); hue follows the ${analysis.undertone} undertone.`)

  // "Your lips but better": skin hue pushed toward red, deeper and more saturated.
  const lipNudes: Tone[] = [
    { hex: shift(base, { L: -16, C: 10, h: -22 }), label: "Nude" },
    { hex: shift(base, { L: -24, C: 16, h: -30 }), label: "Deeper nude" },
  ]

  return { analysis, foundationLadder, undertoneVariants, zones, concealer, contour, highlighter, blush, lipNudes, reasoning }
}
