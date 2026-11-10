// The Beauty OS Look Document: the portable, versioned description of a makeup look.
// It holds only platform-neutral data plus optional per-platform overrides, so the same
// document can be exported to Banuba today and to other AR platforms via new adapters.
import { z } from "zod"
import { FINISHES, REGIONS } from "./regions"

export const LOOK_FORMAT = "beautyos.look" as const
export const LOOK_FORMAT_VERSION = 1 as const

const unit = z.number().min(0).max(1)
export const HexColor = z
  .string()
  .regex(/^#[0-9a-fA-F]{6}$/, "Use a 6-digit hex color like #b3122e")
  .transform((c) => c.toLowerCase())

/** Platform-specific escape hatches. Keys are adapter ids; values are adapter-defined. */
export const PlatformOverrides = z
  .object({
    banuba: z.object({ finish: z.string().min(1) }).partial().optional(),
  })
  .catchall(z.record(z.string(), z.unknown()))

/** How a surface looks: the portable unit every adapter renders. */
export const Material = z.object({
  color: HexColor,
  finish: z.enum(FINISHES),
  coverage: unit,
  overrides: PlatformOverrides.optional(),
})
export type Material = z.infer<typeof Material>

/** Optional link from a layer back to a sellable catalog shade. */
export const ShadeRef = z.object({
  shadeId: z.string().min(1).optional(),
  sku: z.string().min(1).optional(),
  name: z.string().min(1),
  productName: z.string().min(1).optional(),
})
export type ShadeRef = z.infer<typeof ShadeRef>

export const Layer = z.object({
  region: z.enum(REGIONS),
  material: Material,
  shade: ShadeRef.optional(),
})
export type Layer = z.infer<typeof Layer>

// ---------- Assets & overlays ----------

/** A media file the look depends on. `url` is absolute or root-relative; `sha256` pins the exact bytes. */
export const AssetRef = z.object({
  assetId: z.string().min(1).optional(),
  url: z.string().min(1),
  mediaType: z.string().regex(/^(image|video)\/[\w.+-]+$/, "Expected an image/* or video/* media type"),
  fileName: z.string().max(200).optional(),
  sha256: z.string().regex(/^[a-f0-9]{64}$/).optional(),
})
export type AssetRef = z.infer<typeof AssetRef>

const Vec3 = z.tuple([z.number(), z.number(), z.number()])
export const CONTENT_MODES = ["scale_to_fill", "fill", "fit"] as const

export const Overlay = z.discriminatedUnion("kind", [
  /** Replaces the camera background (person stays). Image or video. */
  z.object({
    kind: z.literal("background"),
    asset: AssetRef,
    contentMode: z.enum(CONTENT_MODES).default("scale_to_fill"),
    blend: z.enum(["default", "screen", "multiply", "split_alpha"]).default("default"),
    rotation: z.number().default(0),
    scale: z.number().positive().default(1),
  }),
  /** Full-frame overlay on top of everything (frames, light leaks, grain). Image with alpha, or video. */
  z.object({
    kind: z.literal("foreground"),
    asset: AssetRef,
    contentMode: z.enum(CONTENT_MODES).default("scale_to_fill"),
    blend: z.enum(["alpha", "premul_alpha", "screen", "add", "multiply", "min", "max"]).default("alpha"),
    rotation: z.number().default(0),
  }),
  /** Color grade from a LUT image. */
  z.object({
    kind: z.literal("lut"),
    asset: AssetRef,
    strength: unit.default(1),
  }),
  /** Video texture anchored to the face (plane quad unless a mesh is supplied by the platform). */
  z.object({
    kind: z.literal("face_video"),
    asset: AssetRef,
    /** Separate alpha video. Omit when the main video has no alpha or uses side-by-side alpha. */
    alpha: AssetRef.optional(),
    /** True when the main video carries color on the left half and alpha on the right half. */
    splitAlpha: z.boolean().default(false),
    rotation: Vec3.default([-90, 0, 0]),
    scale: Vec3.default([1, 1, 1]),
    translation: Vec3.default([0, 0, 0]),
  }),
  /** Soft light on the face, optionally from a custom texture. */
  z.object({
    kind: z.literal("softlight"),
    asset: AssetRef.optional(),
    strength: unit.default(0.5),
  }),
])
export type Overlay = z.infer<typeof Overlay>
export type OverlayKind = Overlay["kind"]
export const OVERLAY_KINDS = ["background", "foreground", "lut", "face_video", "softlight"] as const satisfies readonly OverlayKind[]

/** Which media each overlay kind accepts. */
export const OVERLAY_MEDIA: Record<OverlayKind, readonly ("image" | "video")[]> = {
  background: ["image", "video"],
  foreground: ["image", "video"],
  lut: ["image"],
  face_video: ["video"],
  softlight: ["image"],
}

export const LookDocument = z.object({
  format: z.literal(LOOK_FORMAT),
  formatVersion: z.literal(LOOK_FORMAT_VERSION),
  name: z.string().trim().min(1).max(80),
  description: z.string().max(500).default(""),
  tags: z.array(z.string().trim().min(1).max(32)).max(20).default([]),
  skin: z.object({ smoothing: unit }).default({ smoothing: 0 }),
  /** Ordered; for stackable regions (eyeshadow) layers render in this order. */
  layers: z.array(Layer).max(40),
  /** Texture/video effects layered with the makeup. At most one of each kind. */
  overlays: z.array(Overlay).max(5).default([]),
})
export type LookDocument = z.infer<typeof LookDocument>
export type LookDocumentInput = z.input<typeof LookDocument>

export const emptyLook = (name = "Untitled look"): LookDocument => ({
  format: LOOK_FORMAT,
  formatVersion: LOOK_FORMAT_VERSION,
  name,
  description: "",
  tags: [],
  skin: { smoothing: 0 },
  layers: [],
  overlays: [],
})
