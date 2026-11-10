// Export profiles: a complete technical spec for rendering an image or video deliverable.
// Shared by the server (rendering) and the UI (profile editor), so it has no server-only imports.
import { z } from "zod"

export const IMAGE_FORMATS = ["jpeg", "png", "webp", "avif", "tiff"] as const
export const VIDEO_FORMATS = ["mp4", "webm", "mov", "gif"] as const
export const FIT_MODES = ["cover", "contain", "pad"] as const

const hex = z.string().regex(/^#[0-9a-fA-F]{6}$/)
/** "4:5", "16:9", "1.91:1" */
export const AspectRatio = z.string().regex(/^\d+(\.\d+)?:\d+(\.\d+)?$/, "Use a ratio like 4:5 or 16:9")

const Sizing = z.object({
  /** Exact output size. Missing dimensions are derived from the aspect ratio or the source. */
  width: z.number().int().min(16).max(16384).optional(),
  height: z.number().int().min(16).max(16384).optional(),
  /** Alternative to width/height: longest edge in pixels. */
  longEdge: z.number().int().min(16).max(16384).optional(),
  aspectRatio: AspectRatio.optional(),
  /** cover = crop to fill; contain = fit inside (output may be smaller on one axis); pad = fit inside and fill with padColor. */
  fit: z.enum(FIT_MODES).default("cover"),
  padColor: hex.default("#ffffff"),
  /** Crop anchor for cover. "top" keeps headroom on portraits. */
  anchor: z.enum(["center", "top", "bottom", "entropy", "attention"]).default("attention"),
  /** Allow output larger than the source (upscaling). Off by default to protect quality. */
  allowUpscale: z.boolean().default(false),
})

export const ImageProfile = Sizing.extend({
  kind: z.literal("image"),
  format: z.enum(IMAGE_FORMATS),
  quality: z.number().int().min(1).max(100).default(95),
  /** Pixel density written into the file (300 for print). */
  dpi: z.number().int().min(36).max(2400).default(72),
  colorSpace: z.enum(["srgb", "p3", "cmyk"]).default("srgb"),
  /** 16-bit applies to PNG and TIFF. */
  bitDepth: z.union([z.literal(8), z.literal(16)]).default(8),
  /** Keep transparency where the format supports it (PNG, WebP, AVIF, TIFF). */
  keepAlpha: z.boolean().default(true),
  /** Lower quality step by step until the file fits (JPEG, WebP, AVIF). */
  maxBytes: z.number().int().min(10_000).optional(),
  stripMetadata: z.boolean().default(true),
  enhance: z.enum(["none", "natural", "crisp", "hyperreal"]).default("none"),
})
export type ImageProfile = z.infer<typeof ImageProfile>

export const VideoProfile = Sizing.extend({
  kind: z.literal("video"),
  format: z.enum(VIDEO_FORMATS),
  /** Frames per second; omitted keeps the source rate. */
  fps: z.number().min(1).max(120).optional(),
  /** Target video bitrate in kbit/s; omitted uses constant quality. */
  bitrateKbps: z.number().int().min(100).max(200_000).optional(),
  /** Constant-quality level (lower = better). Used when no bitrate is set. */
  crf: z.number().int().min(0).max(51).default(18),
  /** H.264 profile for MP4/MOV compatibility targets. */
  h264Profile: z.enum(["baseline", "main", "high"]).default("high"),
  audio: z.boolean().default(true),
  trimStart: z.number().min(0).optional(),
  trimDuration: z.number().min(0.1).optional(),
  maxBytes: z.number().int().min(100_000).optional(),
})
export type VideoProfile = z.infer<typeof VideoProfile>

export const ExportProfile = z.discriminatedUnion("kind", [ImageProfile, VideoProfile])
export type ExportProfile = z.infer<typeof ExportProfile>
export type ExportProfileInput = z.input<typeof ExportProfile>

export interface NamedProfile {
  id: string
  name: string
  group: "Social" | "Web" | "Print" | "AR texture" | "Master" | "Custom"
  profile: ExportProfileInput
}

/** Built-in presets. Teams add their own (saved per brand). */
export const PRESET_PROFILES: NamedProfile[] = [
  { id: "master-png16", name: "Master PNG (16-bit, original size)", group: "Master", profile: { kind: "image", format: "png", bitDepth: 16, fit: "contain" } },
  { id: "master-tiff", name: "Master TIFF (16-bit, original size)", group: "Master", profile: { kind: "image", format: "tiff", bitDepth: 16, fit: "contain", dpi: 300 } },
  { id: "hires-jpeg", name: "High-res JPEG (6000 px long edge)", group: "Master", profile: { kind: "image", format: "jpeg", longEdge: 6000, fit: "contain", quality: 97, allowUpscale: false } },
  { id: "ig-portrait", name: "Instagram portrait 1080×1350 (4:5)", group: "Social", profile: { kind: "image", format: "jpeg", width: 1080, height: 1350, fit: "cover", anchor: "top", quality: 92, maxBytes: 8_000_000 } },
  { id: "ig-square", name: "Instagram square 1080×1080", group: "Social", profile: { kind: "image", format: "jpeg", width: 1080, height: 1080, fit: "cover", anchor: "top", quality: 92 } },
  { id: "story", name: "Story / Reels cover 1080×1920 (9:16)", group: "Social", profile: { kind: "image", format: "jpeg", width: 1080, height: 1920, fit: "cover", anchor: "top", quality: 92 } },
  { id: "story-video", name: "Story / Reels / TikTok video 1080×1920 H.264 30fps", group: "Social", profile: { kind: "video", format: "mp4", width: 1080, height: 1920, fit: "cover", anchor: "top", fps: 30, bitrateKbps: 8000, h264Profile: "high" } },
  { id: "pin", name: "Pinterest 1000×1500 (2:3)", group: "Social", profile: { kind: "image", format: "jpeg", width: 1000, height: 1500, fit: "cover", anchor: "top", quality: 90 } },
  { id: "web-hero", name: "Web hero 2560×1440 WebP", group: "Web", profile: { kind: "image", format: "webp", width: 2560, height: 1440, fit: "cover", quality: 86, maxBytes: 600_000 } },
  { id: "web-pdp", name: "Product page 2000×2000 AVIF", group: "Web", profile: { kind: "image", format: "avif", width: 2000, height: 2000, fit: "pad", padColor: "#ffffff", quality: 70 } },
  { id: "web-video", name: "Web video 1920×1080 WebM (VP9)", group: "Web", profile: { kind: "video", format: "webm", width: 1920, height: 1080, fit: "cover", crf: 31, audio: false } },
  { id: "gif-preview", name: "Animated GIF preview 720 px", group: "Web", profile: { kind: "video", format: "gif", longEdge: 720, fit: "contain", fps: 15, trimDuration: 6 } },
  { id: "print-a4", name: "Print A4 300 dpi CMYK TIFF (2480×3508)", group: "Print", profile: { kind: "image", format: "tiff", width: 2480, height: 3508, fit: "cover", anchor: "top", dpi: 300, colorSpace: "cmyk", allowUpscale: true } },
  { id: "print-jpeg", name: "Print JPEG 300 dpi (long edge 4500)", group: "Print", profile: { kind: "image", format: "jpeg", longEdge: 4500, fit: "contain", dpi: 300, quality: 98 } },
  { id: "ar-texture", name: "AR texture 1024×1024 PNG (power of two)", group: "AR texture", profile: { kind: "image", format: "png", width: 1024, height: 1024, fit: "pad", padColor: "#000000" } },
  { id: "ar-background", name: "AR background 1080×1920 JPEG", group: "AR texture", profile: { kind: "image", format: "jpeg", width: 1080, height: 1920, fit: "cover", quality: 88 } },
  { id: "ar-video", name: "AR video texture 720p H.264 baseline (mobile-safe)", group: "AR texture", profile: { kind: "video", format: "mp4", longEdge: 1280, fit: "contain", fps: 30, h264Profile: "baseline", bitrateKbps: 2500, audio: false } },
]

export const parseRatio = (r: string) => {
  const [a, b] = r.split(":").map(Number)
  return a / b
}

/**
 * Resolves the final pixel size from a sizing spec and the source size.
 * Returns the canvas size (what the file will be) and the content box (what the source is scaled to).
 */
export function resolveSize(
  spec: z.infer<typeof Sizing>,
  source: { width: number; height: number },
): { width: number; height: number; upscaled: boolean } {
  const srcRatio = source.width / source.height
  const ratio = spec.aspectRatio ? parseRatio(spec.aspectRatio) : spec.width && spec.height ? spec.width / spec.height : srcRatio
  let w: number, h: number
  if (spec.width && spec.height) [w, h] = [spec.width, spec.height]
  else if (spec.width) [w, h] = [spec.width, spec.width / ratio]
  else if (spec.height) [w, h] = [spec.height * ratio, spec.height]
  else if (spec.longEdge) [w, h] = ratio >= 1 ? [spec.longEdge, spec.longEdge / ratio] : [spec.longEdge * ratio, spec.longEdge]
  else {
    // No size: keep source resolution, apply the aspect ratio by cropping/padding.
    if (ratio >= srcRatio) [w, h] = [source.width, source.width / ratio]
    else [w, h] = [source.height * ratio, source.height]
  }
  w = Math.round(w)
  h = Math.round(h)
  // "contain" shrinks the canvas to the content; "cover"/"pad" keep the requested canvas.
  if (spec.fit === "contain") {
    const s = Math.min(w / source.width, h / source.height)
    ;[w, h] = [Math.round(source.width * s), Math.round(source.height * s)]
  }
  const scale = spec.fit === "cover" ? Math.max(w / source.width, h / source.height) : Math.min(w / source.width, h / source.height)
  if (scale > 1 && !spec.allowUpscale) {
    // Never upscale silently: shrink the whole canvas to keep the requested ratio at source resolution.
    ;[w, h] = [Math.round(w / scale), Math.round(h / scale)]
    return { width: w, height: h, upscaled: false }
  }
  return { width: w, height: h, upscaled: scale > 1 }
}
