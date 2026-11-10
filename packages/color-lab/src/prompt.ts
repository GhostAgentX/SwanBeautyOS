// Rule-based prompt understanding. Works offline and is the fallback when no language model is configured.
// It extracts color words, the regions they're attached to, finishes and the occasion, then hands off
// to the formulation engine.
import type { Finish, Region } from "@beautyos/look-format"
import type { InputColor, Occasion } from "./formulate"
import { findByName, type ColorLibrary } from "./library"
import { parseColor, rgbToHex, toRgb } from "./color"

/** Makeup-vocabulary colors (sRGB). Multi-word names first so "rose gold" beats "rose". */
export const COLOR_WORDS: [string, string][] = [
  ["rose gold", "#b76e79"], ["smoky", "#3a3a3d"], ["smokey", "#3a3a3d"], ["burnt orange", "#cc5500"], ["dusty rose", "#b8838a"],
  ["hot pink", "#e0457b"], ["baby pink", "#f4c2c2"], ["nude", "#c49a82"], ["red", "#b3122e"], ["scarlet", "#c8102e"],
  ["crimson", "#9e1b32"], ["cherry", "#990f2b"], ["burgundy", "#6d1a36"], ["wine", "#5e1224"], ["oxblood", "#4a0f19"],
  ["berry", "#8a1f4b"], ["plum", "#6e2c5e"], ["mauve", "#9b6b84"], ["pink", "#e07a9a"], ["rose", "#c96f84"],
  ["fuchsia", "#c21e75"], ["coral", "#e8705a"], ["peach", "#f2a58e"], ["apricot", "#f0a374"], ["terracotta", "#c46a4f"],
  ["brick", "#9c4a36"], ["orange", "#e46a2b"], ["brown", "#6b4430"], ["chocolate", "#4e2e22"], ["espresso", "#3b2418"],
  ["caramel", "#a86a3d"], ["bronze", "#8c5a32"], ["copper", "#b0643a"], ["gold", "#c9a24a"], ["champagne", "#e6ccb0"],
  ["taupe", "#7d6a5e"], ["beige", "#d8bfa3"], ["ivory", "#f1e6d2"], ["pearl", "#efe6e1"], ["silver", "#b8b8bf"],
  ["grey", "#77767a"], ["gray", "#77767a"], ["charcoal", "#2e2b2b"], ["black", "#0b0b0b"], ["navy", "#1d2a4f"],
  ["blue", "#2f5fa8"], ["cobalt", "#1f4ea8"], ["teal", "#1f6f6f"], ["emerald", "#1f6b4f"], ["green", "#3f7a4a"],
  ["olive", "#6b6b34"], ["khaki", "#8e8256"], ["purple", "#5e3a87"], ["violet", "#6a3fa0"], ["lilac", "#b39ccc"],
  ["lavender", "#b8a6d9"], ["white", "#f6f3ef"],
]

const REGION_WORDS: [RegExp, Region][] = [
  [/\blip ?liner\b|\blipliner\b/i, "lip_liner"],
  [/\blips?\b|\blipstick\b|\bmouth\b|\bpout\b/i, "lips"],
  [/\beye ?liner\b|\bliner\b|\bwing(ed)?\b|\bcat ?eye\b/i, "eyeliner"],
  [/\blash(es)?\b|\bmascara\b/i, "lashes"],
  [/\bbrows?\b|\beyebrows?\b/i, "brows"],
  [/\beye ?shadow\b|\bshadow\b|\blids?\b|\beyes?\b|\bcrease\b/i, "eyeshadow"],
  [/\bblush\b|\bcheeks?\b|\bflush\b/i, "blush"],
  [/\bhighlight(er)?\b|\bglow\b|\bstrobe\b/i, "highlighter"],
  [/\bcontour\b|\bsculpt(ed)?\b|\bbronzer\b/i, "contour"],
  [/\bfoundation\b|\bbase\b|\bcomplexion\b/i, "foundation"],
  [/\bconcealer\b/i, "concealer"],
]

const FINISH_WORDS: [RegExp, Finish][] = [
  [/\bmetallic|chrome|foil\b/i, "metallic"],
  [/\bglitter|sparkl/i, "glitter"],
  [/\bshimmer|shimmery|pearl(y|escent)?\b/i, "shimmer"],
  [/\bgloss(y)?|glazed|vinyl|juicy\b/i, "gloss"],
  [/\bsatin\b/i, "satin"],
  [/\bmatte|velvet\b/i, "matte"],
  [/\bdewy|radiant|luminous\b/i, "radiant"],
  [/\bsheer|tinted?\b/i, "sheer"],
  [/\bbalm\b/i, "balm"],
]

export interface ParsedPrompt {
  colors: InputColor[]
  occasion: Occasion
  intensity: number
  notes: string[]
}

const OCCASION_WORDS: [RegExp, Occasion][] = [
  [/\b(bold|editorial|dramatic|runway|statement|avant)\b/i, "bold"],
  [/\b(evening|night|party|glam|gala|date|club|smok(e)?y)\b/i, "evening"],
  [/\b(natural|everyday|daily|office|work|day|no[- ]makeup|minimal|fresh|soft)\b/i, "everyday"],
]

/**
 * Splits the prompt into clauses ("red matte lips, gold shimmer eyes and a peach blush") and reads
 * color + region + finish per clause. Library names ("PANTONE 18-1663 TPX") and notations ("#b3122e",
 * "cmyk(0,90,74,30)") are recognized when present.
 */
export function parsePrompt(prompt: string, libraries: ColorLibrary[] = []): ParsedPrompt {
  const notes: string[] = []
  const occasion = OCCASION_WORDS.find(([re]) => re.test(prompt))?.[1] ?? "everyday"
  notes.push(`Occasion read as "${occasion}".`)
  let intensity = 1
  if (/\b(subtle|light|sheer|barely|soft)\b/i.test(prompt)) { intensity = 0.7; notes.push("Softer intensity requested.") }
  if (/\b(intense|strong|full|heavy|maximal|bold)\b/i.test(prompt)) { intensity = 1.15; notes.push("Stronger intensity requested.") }

  const colors: InputColor[] = []
  const clauses = prompt.split(/[,;.]|\band\b|\bwith\b|\bplus\b/i).map((c) => c.trim()).filter(Boolean)

  for (const clause of clauses) {
    const region = REGION_WORDS.find(([re]) => re.test(clause))?.[1]
    const finish = FINISH_WORDS.find(([re]) => re.test(clause))?.[1]
    const found: { hex: string; name: string }[] = []

    // Explicit notations: hex, rgb(), cmyk(), lab()
    for (const m of clause.matchAll(/#[0-9a-f]{6}\b|#[0-9a-f]{3}\b|(?:rgb|cmyk|lab)\([^)]*\)/gi)) {
      const parsed = parseColor(m[0])
      if (parsed) found.push({ hex: rgbToHex(toRgb(parsed)), name: m[0] })
    }
    // Library names, e.g. "pantone 18-1663 tpx"
    for (const m of clause.matchAll(/pantone\s+[\w-]+(?:\s+[a-z]{1,3})?\b/gi)) {
      const hit = findByName(m[0], libraries)
      if (hit) found.push({ hex: hit.hex, name: `${hit.name} (${hit.library})` })
      else notes.push(`"${m[0]}" isn't in any imported color library; import your licensed Pantone library to use it.`)
    }
    if (!found.length) {
      const lower = clause.toLowerCase()
      const hit = COLOR_WORDS.find(([word]) => new RegExp(`\\b${word}\\b`).test(lower))
      if (hit) found.push({ hex: hit[1], name: hit[0] })
    }

    // "smoky eye" means a dark gradient, not one grey.
    if (/smok(e)?y/i.test(clause) && (region === "eyeshadow" || !region)) {
      colors.push(
        { hex: "#77767a", name: "smoky grey", region: "eyeshadow", finish: finish ?? "matte" },
        { hex: "#3a3a3d", name: "smoky charcoal", region: "eyeshadow", finish: finish ?? "shimmer" },
        { hex: "#141414", name: "smoky black", region: "eyeshadow", finish: "matte" },
      )
      notes.push("Smoky eye → three-layer grey-to-black gradient.")
      continue
    }

    for (const f of found) colors.push({ hex: f.hex, name: f.name, ...(region ? { region } : {}), ...(finish ? { finish } : {}) })
    if (found.length && region) notes.push(`"${clause}" → ${found.map((f) => f.name).join(", ")} on ${region}${finish ? `, ${finish}` : ""}.`)
  }

  if (!colors.length) notes.push("No colors recognized; the look will be built from the skin tone and occasion.")
  return { colors, occasion, intensity, notes }
}
