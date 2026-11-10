import { LookDocument, OVERLAY_MEDIA, type Layer } from "./schema"
import { REGION_SPECS } from "./regions"

export interface Issue {
  level: "error" | "warning"
  path: string
  message: string
}

export type ValidationResult =
  | { ok: true; look: LookDocument; issues: Issue[] }
  | { ok: false; look: null; issues: Issue[] }

/**
 * Parses unknown input into a LookDocument and applies the cross-field rules zod can't express:
 * finish allowed for the region and per-region layer limits.
 */
export function validateLook(input: unknown): ValidationResult {
  const parsed = LookDocument.safeParse(input)
  if (!parsed.success) {
    return {
      ok: false,
      look: null,
      issues: parsed.error.issues.map((i) => ({ level: "error", path: i.path.join("."), message: i.message })),
    }
  }

  const look = parsed.data
  const issues: Issue[] = []
  const counts = new Map<string, number>()

  look.layers.forEach((layer: Layer, i) => {
    const spec = REGION_SPECS[layer.region]
    const n = (counts.get(layer.region) ?? 0) + 1
    counts.set(layer.region, n)
    if (n > spec.maxLayers) {
      issues.push({
        level: "error",
        path: `layers.${i}`,
        message: `${spec.label} allows ${spec.maxLayers} layer${spec.maxLayers === 1 ? "" : "s"}; this is #${n}.`,
      })
    }
    if (!spec.finishes.includes(layer.material.finish)) {
      issues.push({
        level: "error",
        path: `layers.${i}.material.finish`,
        message: `${spec.label} doesn't support the "${layer.material.finish}" finish. Use one of: ${spec.finishes.join(", ")}.`,
      })
    }
  })

  const kinds = new Set<string>()
  look.overlays.forEach((o, i) => {
    if (kinds.has(o.kind)) issues.push({ level: "error", path: `overlays.${i}`, message: `Only one ${o.kind} overlay is allowed.` })
    kinds.add(o.kind)
    const refs = [o.asset, o.kind === "face_video" ? o.alpha : undefined].filter((a) => a !== undefined)
    for (const ref of refs) {
      const media = ref.mediaType.split("/")[0] as "image" | "video"
      if (!OVERLAY_MEDIA[o.kind].includes(media)) {
        issues.push({ level: "error", path: `overlays.${i}.asset`, message: `A ${o.kind} overlay can't use ${media} (accepts ${OVERLAY_MEDIA[o.kind].join(" or ")}).` })
      }
    }
    if (o.kind === "face_video" && o.alpha && o.splitAlpha) {
      issues.push({ level: "error", path: `overlays.${i}`, message: "Use either a separate alpha video or side-by-side alpha, not both." })
    }
  })

  if (!look.layers.length && !look.overlays.length && look.skin.smoothing === 0) {
    issues.push({ level: "warning", path: "layers", message: "This look has no makeup layers yet." })
  }

  return issues.some((i) => i.level === "error") ? { ok: false, look: null, issues } : { ok: true, look, issues }
}

export const regionLayers = (look: LookDocument, region: Layer["region"]) => look.layers.filter((l) => l.region === region)
