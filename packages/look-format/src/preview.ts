import type { Region } from "./regions"
import type { LookDocument } from "./schema"

const PREVIEW_ORDER: Region[] = ["lips", "eyeshadow", "blush", "eyeliner", "highlighter", "lip_liner", "contour", "foundation"]

/** Up to `max` representative colors for thumbnails and chips: lips, eyes, cheeks, then the rest. */
export function previewColors(look: Pick<LookDocument, "layers">, max = 4): string[] {
  const colors: string[] = []
  for (const region of PREVIEW_ORDER) {
    for (const layer of look.layers) {
      if (layer.region !== region) continue
      if (!colors.includes(layer.material.color)) colors.push(layer.material.color)
      if (colors.length === max) return colors
    }
  }
  return colors
}
