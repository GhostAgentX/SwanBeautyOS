// Synthetic model specification: original, fictional people for showing makeup looks.
// Diversity comes from sampling each axis independently (skin depth, undertone, face shape,
// eye shape, hair texture...) rather than from presets tied to ethnicity, which avoids stereotyping.
// Teams can add heritage or styling notes in their own words.
import { z } from "zod"

export const SKIN_DEPTHS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10] as const
export const UNDERTONES = ["cool", "neutral", "warm", "olive"] as const
export const FACE_SHAPES = ["oval", "round", "square", "heart", "diamond", "oblong"] as const
export const EYE_SHAPES = ["almond", "round", "hooded", "monolid", "upturned", "downturned", "deep-set", "wide-set"] as const
export const HAIR_TEXTURES = ["1 straight", "2A wavy", "2C wavy", "3A curly", "3C curly", "4A coily", "4C coily"] as const
export const HAIR_STYLES = ["loose", "slicked back", "low bun", "high puff", "braids", "locs", "twist-out", "afro", "bob", "pixie", "close crop", "ponytail", "headwrap", "hijab"] as const
export const HAIR_COLORS = ["black", "dark brown", "medium brown", "auburn", "copper", "dark blonde", "blonde", "silver", "grey"] as const
export const AGE_RANGES = ["18–24", "25–34", "35–44", "45–54", "55–64", "65+"] as const
export const PRESENTATIONS = ["feminine", "masculine", "androgynous"] as const
export const EXPRESSIONS = ["neutral, relaxed", "soft smile", "confident", "serene, eyes closed"] as const
export const LIGHTING = ["soft beauty light", "natural window light", "editorial hard light", "golden hour"] as const
export const BACKGROUNDS = ["seamless light grey", "seamless warm beige", "seamless deep charcoal", "soft gradient", "pastel color"] as const
export const FRAMINGS = ["head and shoulders", "close-up portrait", "bust", "three-quarter"] as const
export const ASPECTS = ["4:5", "1:1", "2:3", "9:16", "16:9"] as const

/** Skin depth 1–10 mapped to a representative CIELAB lightness, used to tie prompts to the skin-tone engine. */
export const depthToL = (d: number) => Math.round(80 - ((d - 1) / 9) * 60)

export const ModelSpec = z.object({
  /** Display name for the cast list (internal; never a real person's name). */
  label: z.string().trim().min(1).max(40),
  skinDepth: z.number().int().min(1).max(10),
  undertone: z.enum(UNDERTONES),
  /** Optional measured or picked skin color, e.g. from the Lab. */
  skinHex: z.string().regex(/^#[0-9a-f]{6}$/i).optional(),
  faceShape: z.enum(FACE_SHAPES),
  eyeShape: z.enum(EYE_SHAPES),
  hairTexture: z.enum(HAIR_TEXTURES),
  hairStyle: z.enum(HAIR_STYLES),
  hairColor: z.enum(HAIR_COLORS),
  ageRange: z.enum(AGE_RANGES),
  presentation: z.enum(PRESENTATIONS),
  /** Free text from the creative team: heritage, freckles, vitiligo, scars, glasses, jewelry, wardrobe... */
  notes: z.string().max(300).default(""),
  expression: z.enum(EXPRESSIONS).default("neutral, relaxed"),
  lighting: z.enum(LIGHTING).default("soft beauty light"),
  background: z.enum(BACKGROUNDS).default("seamless light grey"),
  framing: z.enum(FRAMINGS).default("head and shoulders"),
  aspect: z.enum(ASPECTS).default("4:5"),
  /** Fraction of the frame height kept empty above the head. Always generous. */
  headroom: z.number().min(0.15).max(0.5).default(0.25),
  seed: z.number().int().min(0).max(2 ** 31 - 1),
})
export type ModelSpec = z.infer<typeof ModelSpec>
export type ModelSpecInput = z.input<typeof ModelSpec>

// ---------- originality ----------

const LIKENESS = /\b(look(s|ing)?\s+like|resembl\w*|lookalike|look-alike|in the style of|celebrity|famous|actress|actor|singer|influencer|supermodel|princess|queen\s+of|doppelg[aä]nger|twin of|deepfake)\b/i

/** Rejects notes that ask for a real person's likeness. Returns the reason or null. */
export function likenessViolation(text: string): string | null {
  const m = LIKENESS.exec(text)
  return m ? `Synthetic models must be original. Remove "${m[0]}": describe features instead of referring to a real person.` : null
}

// ---------- cast sampling ----------

function rng(seed: number) {
  let s = seed >>> 0
  return () => {
    s = (s + 0x6d2b79f5) >>> 0
    let t = Math.imul(s ^ (s >>> 15), 1 | s)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

/** Shuffled, evenly spread picks: every option appears before any repeats (stratified sampling). */
function spread<T>(options: readonly T[], n: number, rand: () => number): T[] {
  const out: T[] = []
  while (out.length < n) {
    const round = [...options]
    for (let i = round.length - 1; i > 0; i--) {
      const j = Math.floor(rand() * (i + 1))
      ;[round[i], round[j]] = [round[j], round[i]]
    }
    out.push(...round)
  }
  return out.slice(0, n)
}

export interface CastOptions {
  size: number
  seed?: number
  /** Restrict any axis, e.g. { presentation: ["feminine"] }. */
  only?: Partial<{ presentation: (typeof PRESENTATIONS)[number][]; ageRange: (typeof AGE_RANGES)[number][] }>
  base?: Partial<Pick<ModelSpec, "lighting" | "background" | "framing" | "aspect" | "expression" | "headroom">>
}

/**
 * Builds a varied cast. Skin depth is spread across the whole 1–10 range; every other axis is
 * stratified independently, so features and tones combine freely instead of following stereotypes.
 */
export function sampleCast({ size, seed = 1, only = {}, base = {} }: CastOptions): ModelSpec[] {
  const rand = rng(seed)
  const n = Math.max(1, Math.min(48, size))
  const depths = Array.from({ length: n }, (_, i) => Math.min(10, Math.max(1, Math.round(1 + ((i + rand() * 0.8) / n) * 9))))
  const pick = {
    undertone: spread(UNDERTONES, n, rand),
    face: spread(FACE_SHAPES, n, rand),
    eyes: spread(EYE_SHAPES, n, rand),
    texture: spread(HAIR_TEXTURES, n, rand),
    color: spread(HAIR_COLORS.slice(0, 7), n, rand),
    age: spread(only.ageRange?.length ? only.ageRange : AGE_RANGES, n, rand),
    pres: spread(only.presentation?.length ? only.presentation : PRESENTATIONS, n, rand),
  }
  const order = spread(depths, n, rand)
  return order.map((skinDepth, i) => {
    const texture = pick.texture[i]
    // Style options that suit the sampled texture.
    const styles: (typeof HAIR_STYLES)[number][] = texture.startsWith("4")
      ? ["afro", "braids", "locs", "twist-out", "high puff", "close crop", "headwrap"]
      : texture.startsWith("3")
        ? ["loose", "high puff", "braids", "low bun", "bob", "headwrap"]
        : ["loose", "slicked back", "low bun", "bob", "pixie", "ponytail", "close crop", "hijab"]
    const age = pick.age[i]
    const hairColor = age === "65+" || (age === "55–64" && rand() < 0.5) ? (rand() < 0.5 ? "silver" : "grey") : pick.color[i]
    return ModelSpec.parse({
      label: `Model ${String(i + 1).padStart(2, "0")}`,
      skinDepth,
      undertone: pick.undertone[i],
      faceShape: pick.face[i],
      eyeShape: pick.eyes[i],
      hairTexture: texture,
      hairStyle: styles[Math.floor(rand() * styles.length)],
      hairColor,
      ageRange: age,
      presentation: pick.pres[i],
      seed: Math.floor(rand() * 2 ** 31),
      ...base,
    })
  })
}

// ---------- prompt compilation ----------

const DEPTH_WORDS = ["very fair", "fair", "light", "light-medium", "medium", "medium-tan", "tan", "deep", "very deep", "deepest"]

export interface MakeupBrief {
  /** "bare" = no visible makeup; otherwise a short description of the look. */
  mode: "bare" | "look"
  description?: string
}

/**
 * Compiles a provider-agnostic generation prompt. Composition rules are explicit: the subject
 * sits low in the frame with generous empty space above the head.
 */
export function compilePrompt(spec: ModelSpec, makeup: MakeupBrief = { mode: "bare" }) {
  const skin = `${DEPTH_WORDS[spec.skinDepth - 1]} skin (depth ${spec.skinDepth}/10) with ${spec.undertone} undertones${spec.skinHex ? `, close to ${spec.skinHex}` : ""}, realistic texture with visible pores and natural tonal variation`
  const face = `${spec.faceShape} face shape, ${spec.eyeShape} eyes`
  const hair = `${spec.hairColor} ${spec.hairTexture.replace(/^\S+\s/, "")} hair (type ${spec.hairTexture.split(" ")[0]}) worn ${spec.hairStyle}`
  const makeupText =
    makeup.mode === "bare"
      ? "bare face, no makeup, natural brows and lashes, natural lip color"
      : `wearing makeup: ${makeup.description ?? "a polished makeup look"}; makeup is realistic, follows facial structure and shows true product texture`
  const headroomPct = Math.round(spec.headroom * 100)
  const prompt = [
    `Photorealistic studio beauty portrait of an original, fictional ${spec.presentation} person aged ${spec.ageRange}.`,
    `${skin}. ${face}. ${hair}.`,
    spec.notes ? `${spec.notes}.` : "",
    `${makeupText}.`,
    `Expression: ${spec.expression}. Lighting: ${spec.lighting}. Background: ${spec.background}, clean and uncluttered.`,
    `Composition: ${spec.framing}, subject centered horizontally and placed low in the frame, generous headroom with at least ${headroomPct}% empty negative space above the top of the head, nothing cropped at the top.`,
    "High-end beauty campaign photography, 85mm lens, sharp focus on the eyes, true-to-life color.",
  ]
    .filter(Boolean)
    .join(" ")
  const negativePrompt =
    "resemblance to any real or famous person, celebrity likeness, text, watermark, logo, cropped head, head touching top edge, tight framing, plastic or airbrushed skin, uncanny, distorted features, extra fingers, heavy filters"
  return { prompt, negativePrompt }
}
