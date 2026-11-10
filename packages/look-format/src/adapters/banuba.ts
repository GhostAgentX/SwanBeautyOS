// Banuba Face AR adapter: Beauty OS Look Document -> Banuba prefab config (version 2.0.0).
// Prefab reference: https://docs.banuba.com/far-sdk/effects/prefabs/makeup
import type { Finish, Region } from "../regions"
import { REGION_SPECS } from "../regions"
import type { AssetRef, LookDocument } from "../schema"
import type { ExportFile, ExportIssue, PlatformAdapter } from "./types"

/** Banuba prefab key for each Beauty OS region. */
export const BANUBA_PREFAB: Record<Region, string> = {
  lips: "makeup_lipstick",
  lip_liner: "makeup_lipsliner",
  eyeshadow: "makeup_eyeshadow",
  eyeliner: "makeup_eyeliner",
  lashes: "makeup_eyelashes",
  brows: "makeup_eyebrows",
  blush: "makeup_blush",
  highlighter: "makeup_highlighter",
  contour: "makeup_contour",
  foundation: "makeup_foundation",
  concealer: "makeup_concealer",
}

/** Every finish Banuba documents per region; overrides must come from these lists. */
export const BANUBA_FINISHES: Record<Region, readonly string[]> = {
  lips: [
    "shimmer", "matte_dry", "matte_cream", "matte_powder", "matte_liquid", "cream_shine", "glossy_cream_plumping", "balm",
    "balm_light", "glossy_cream_shimmer", "cream_vividcolors", "matte_velvet", "cream_shine_glitter", "matte_velvet_sparkling",
    "matte_sheer_lightcolors", "matte_cream_vividcolors", "metallic_cream", "matte_velvet_sparkling_lightcolors", "matte_light",
    "metallic_shine", "metallic_dry_lightcolors", "satin", "shine", "cream", "clear", "cream_darkcolors", "clear_shimmer", "metallic_sheer",
  ],
  lip_liner: ["shimmer"],
  eyeshadow: ["shimmer", "matte", "matte_powder", "glitter_metallic", "glitter", "metallic", "glitter_sheer", "cream"],
  eyeliner: ["shimmer", "cream", "matte_liquid", "matte_cream", "matte_dark", "metallic", "glitter", "cream_lightcolors"],
  lashes: ["volume", "lengthening", "lengthandvolume", "natural", "natural_bottom"],
  brows: ["matte", "wet", "clear"],
  blush: ["shimmer", "matte", "cream_shine"],
  highlighter: ["shimmer"],
  contour: ["normal"],
  foundation: ["natural", "matte", "radiance"],
  concealer: ["natural", "matte"],
}

/** Default translation of neutral finishes into Banuba finishes, per region. */
export const BANUBA_FINISH_MAP: { [R in Region]: Partial<Record<Finish, string>> } = {
  lips: { matte: "matte_velvet", satin: "satin", cream: "cream", gloss: "glossy_cream_plumping", balm: "balm", sheer: "clear", shimmer: "shimmer", metallic: "metallic_shine" },
  lip_liner: { satin: "shimmer" },
  eyeshadow: { matte: "matte", shimmer: "shimmer", metallic: "metallic", glitter: "glitter", cream: "cream", sheer: "glitter_sheer" },
  eyeliner: { matte: "matte_liquid", cream: "cream", shimmer: "shimmer", metallic: "metallic", glitter: "glitter" },
  lashes: { natural: "natural", volume: "volume", lengthening: "lengthening", dramatic: "lengthandvolume" },
  brows: { matte: "matte", gloss: "wet", sheer: "clear" },
  blush: { matte: "matte", shimmer: "shimmer", cream: "cream_shine" },
  highlighter: { shimmer: "shimmer" },
  contour: { matte: "normal" },
  foundation: { natural: "natural", matte: "matte", radiant: "radiance" },
  concealer: { natural: "natural", matte: "matte" },
}

const round = (n: number) => Math.round(n * 100) / 100
const clamp01 = (n: number) => Math.min(1, Math.max(0, n))

export interface BanubaOptions {
  /** Look-wide strength multiplier for coverage, 0..1. */
  intensity?: number
}

export function resolveBanubaFinish(region: Region, finish: Finish, override?: string): { finish: string; issue?: ExportIssue } {
  if (override) {
    if (BANUBA_FINISHES[region].includes(override)) return { finish: override }
    const fallback = BANUBA_FINISH_MAP[region][finish] ?? BANUBA_FINISHES[region][0]
    return {
      finish: fallback,
      issue: { level: "warning", message: `${REGION_SPECS[region].label}: Banuba has no "${override}" finish; used "${fallback}".` },
    }
  }
  const mapped = BANUBA_FINISH_MAP[region][finish]
  if (mapped) return { finish: mapped }
  const fallback = BANUBA_FINISH_MAP[region][REGION_SPECS[region].finishes[0]] ?? BANUBA_FINISHES[region][0]
  return {
    finish: fallback,
    issue: { level: "warning", message: `${REGION_SPECS[region].label}: "${finish}" isn't available on Banuba; used "${fallback}".` },
  }
}

const EXT: Record<string, string> = {
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/webp": "webp",
  "video/mp4": "mp4",
  "video/webm": "webm",
  "video/quicktime": "mov",
}

/** Stable in-bundle path for an asset, so the same asset always maps to the same file. */
export function banubaAssetPath(ref: AssetRef): string {
  const ext = EXT[ref.mediaType] ?? ref.mediaType.split("/")[1]?.replace(/[^a-z0-9]/gi, "") ?? "bin"
  const id = (ref.sha256?.slice(0, 16) ?? ref.assetId ?? slugify(ref.fileName ?? ref.url)).replace(/[^\w-]/g, "")
  return `assets/${id}.${ext}`
}

const vec = (v: readonly number[]) => v.join(" ")

export function toBanubaPrefab(look: LookDocument | null, options: BanubaOptions = {}) {
  const intensity = clamp01(options.intensity ?? 1)
  const issues: ExportIssue[] = []
  const files = new Map<string, ExportFile>()
  const face: Record<string, unknown> = {}
  const top: Record<string, unknown> = {}
  const file = (ref: AssetRef) => {
    const path = banubaAssetPath(ref)
    files.set(path, { path, url: ref.url, mediaType: ref.mediaType })
    return path
  }

  for (const o of look?.overlays ?? []) {
    switch (o.kind) {
      case "background":
        top.background = { texture: file(o.asset), content_mode: o.contentMode, blend_mode: o.blend, rotation: o.rotation, scale: o.scale }
        break
      case "foreground":
        top.foreground = { filename: file(o.asset), "@blend": o.blend, content_mode: o.contentMode, rotation: o.rotation }
        break
      case "lut":
        top.lut = { filename: file(o.asset), strength: round(o.strength) }
        break
      case "face_video":
        face.video_texture = {
          // true = two separate videos (color + alpha); false = one video with alpha on the right half.
          use_separate_alpha: !o.splitAlpha,
          video: file(o.asset),
          ...(o.alpha ? { alpha: file(o.alpha) } : {}),
          rotation: vec(o.rotation),
          scale: vec(o.scale),
          translation: vec(o.translation),
        }
        break
      case "softlight":
        face.softlight = { strength: round(o.strength), ...(o.asset ? { texture: file(o.asset) } : {}) }
        break
    }
  }

  if (look) {
    if (look.skin.smoothing > 0) {
      // smooth: "<whole face> <under eyes>"
      const s = round(look.skin.smoothing)
      face.makeup_base = { mode: "quality", smooth: `${s} ${round(Math.min(1, s + 0.2))}` }
    }

    const byRegion = new Map<Region, Record<string, unknown>[]>()
    for (const layer of look.layers) {
      const spec = REGION_SPECS[layer.region]
      const list = byRegion.get(layer.region) ?? []
      if (list.length >= spec.maxLayers) {
        issues.push({ level: "warning", message: `${spec.label}: Banuba supports ${spec.maxLayers} layer(s); extra layers were dropped.` })
        continue
      }
      const { finish, issue } = resolveBanubaFinish(layer.region, layer.material.finish, layer.material.overrides?.banuba?.finish)
      if (issue) issues.push(issue)
      list.push({ color: layer.material.color, finish, coverage: round(clamp01(layer.material.coverage * intensity)) })
      byRegion.set(layer.region, list)
    }
    for (const [region, list] of byRegion) {
      // Eyeshadow takes an array of up to 3 layers applied in order; every other prefab takes one object.
      face[BANUBA_PREFAB[region]] = list.length > 1 ? list : list[0]
    }
  }

  return {
    config: { scene: look?.name ?? "Beauty OS", version: "2.0.0", camera: {}, ...top, faces: [face] },
    issues,
    files: [...files.values()],
  }
}

export const banubaAdapter: PlatformAdapter = {
  id: "banuba",
  label: "Banuba Face AR (prefab config)",
  fileName: (look) => `${slugify(look.name)}.banuba.json`,
  mediaType: "application/json",
  export(look) {
    const { config, issues, files } = toBanubaPrefab(look)
    return { content: JSON.stringify(config, null, 2), issues, files }
  },
}

export const slugify = (s: string) =>
  s
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^\w\s-]/g, "")
    .trim()
    .replace(/[\s_-]+/g, "-")
    .slice(0, 60) || "look"
