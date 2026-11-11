// Makeup region geometry from the 478-point face mesh (MediaPipe Face Landmarker topology).
// Everything here is pure math in pixel space, so it is unit-tested without a browser.
// "Right"/"left" are the subject's, so the subject's right side appears on the image's left.
import type { Region } from "@beautyos/look-format"

export type Point = [number, number]

/** Landmark indices (canonical face mesh). */
export const LM = {
  lipsOuter: [61, 185, 40, 39, 37, 0, 267, 269, 270, 409, 291, 375, 321, 405, 314, 17, 84, 181, 91, 146],
  lipsInner: [78, 191, 80, 81, 82, 13, 312, 311, 310, 415, 308, 324, 318, 402, 317, 14, 87, 178, 88, 95],
  faceOval: [10, 338, 297, 332, 284, 251, 389, 356, 454, 323, 361, 288, 397, 365, 379, 378, 400, 377, 152, 148, 176, 149, 150, 136, 172, 58, 132, 93, 234, 127, 162, 21, 54, 103, 67, 109],
  // Eyes: upper lid from outer to inner corner; lower lid from inner to outer corner.
  rightEyeUpper: [33, 246, 161, 160, 159, 158, 157, 173, 133],
  rightEyeLower: [133, 155, 154, 153, 145, 144, 163, 7, 33],
  leftEyeUpper: [263, 466, 388, 387, 386, 385, 384, 398, 362],
  leftEyeLower: [362, 382, 381, 380, 374, 373, 390, 249, 263],
  // Brows: outer to inner.
  rightBrowUpper: [70, 63, 105, 66, 107],
  rightBrowLower: [46, 53, 52, 65, 55],
  leftBrowUpper: [300, 293, 334, 296, 336],
  leftBrowLower: [276, 283, 282, 295, 285],
  rightCheek: 50,
  leftCheek: 280,
  rightFaceEdge: 234,
  leftFaceEdge: 454,
  rightMouthCorner: 61,
  leftMouthCorner: 291,
  noseBridge: [168, 6, 197, 195],
  noseTip: 4,
  forehead: 10,
  chin: 152,
  betweenEyes: 168,
} as const

export interface PolyShape {
  kind: "poly"
  points: Point[]
  /** Areas cut out of this shape (e.g. inner mouth from lips). */
  holes?: Point[][]
}

export interface EllipseShape {
  kind: "ellipse"
  center: Point
  rx: number
  ry: number
  /** radians */
  angle: number
}

export type Shape = PolyShape | EllipseShape

export interface RegionMask {
  shapes: Shape[]
  /** Gaussian feather radius in pixels. */
  feather: number
}

// ---------- vector helpers ----------

export const lerp = (a: Point, b: Point, t: number): Point => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t]
export const dist = (a: Point, b: Point) => Math.hypot(a[0] - b[0], a[1] - b[1])
export const centroid = (pts: Point[]): Point => {
  const s = pts.reduce((acc, p) => [acc[0] + p[0], acc[1] + p[1]], [0, 0] as Point)
  return [s[0] / pts.length, s[1] / pts.length]
}
const scaleAbout = (pts: Point[], c: Point, k: number): Point[] => pts.map((p) => [c[0] + (p[0] - c[0]) * k, c[1] + (p[1] - c[1]) * k])

/** Resamples a polyline to n points evenly spaced along its length. */
export function resample(line: Point[], n: number): Point[] {
  const seg = line.slice(1).map((p, i) => dist(line[i], p))
  const total = seg.reduce((a, b) => a + b, 0)
  if (total === 0) return Array.from({ length: n }, () => line[0])
  const out: Point[] = []
  for (let k = 0; k < n; k++) {
    let d = (total * k) / (n - 1)
    let i = 0
    while (i < seg.length - 1 && d > seg[i]) d -= seg[i++]
    out.push(lerp(line[i], line[i + 1], seg[i] ? Math.min(1, d / seg[i]) : 0))
  }
  return out
}

/** Shoelace area (absolute), in px². */
export const polygonArea = (pts: Point[]) => Math.abs(pts.reduce((a, p, i) => a + p[0] * pts[(i + 1) % pts.length][1] - pts[(i + 1) % pts.length][0] * p[1], 0)) / 2

export function pointInPolygon([x, y]: Point, poly: Point[]): boolean {
  let inside = false
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const [xi, yi] = poly[i]
    const [xj, yj] = poly[j]
    if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) inside = !inside
  }
  return inside
}

// ---------- face frame ----------

export class Face {
  readonly px: Point[]
  /** Face width (cheek edge to cheek edge) in px: the unit for sizes and feathering. */
  readonly width: number

  /** `landmarks` are normalized (0..1) as returned by the tracker. */
  constructor(landmarks: readonly { x: number; y: number }[], imageWidth: number, imageHeight: number) {
    this.px = landmarks.map((l) => [l.x * imageWidth, l.y * imageHeight])
    this.width = dist(this.px[LM.rightFaceEdge], this.px[LM.leftFaceEdge])
  }

  p(i: number): Point {
    return this.px[i]
  }

  pts(idx: readonly number[]): Point[] {
    return idx.map((i) => this.px[i])
  }

  eyeHeight(side: "right" | "left") {
    const [u, l] = side === "right" ? [159, 145] : [386, 374]
    return dist(this.p(u), this.p(l))
  }
}

// ---------- region builders ----------

const eye = (f: Face, side: "right" | "left") => ({
  upper: f.pts(side === "right" ? LM.rightEyeUpper : LM.leftEyeUpper),
  lower: f.pts(side === "right" ? LM.rightEyeLower : LM.leftEyeLower),
  browLower: f.pts(side === "right" ? LM.rightBrowLower : LM.leftBrowLower),
  browUpper: f.pts(side === "right" ? LM.rightBrowUpper : LM.leftBrowUpper),
})

/** Eyelid region from the lash line up to `reach` (0..1) of the way to the brow, flared at the outer corner. */
function lidBand(f: Face, side: "right" | "left", reach: number): Point[] {
  const e = eye(f, side)
  const lid = e.upper
  const brow = resample(e.browLower, lid.length)
  const top = lid.map((p, i) => lerp(p, brow[i], reach))
  // Flare the outer corner outward/upward for a natural shadow shape.
  const outer = lid[0]
  const dir: Point = [outer[0] - lid[lid.length - 1][0], outer[1] - lid[lid.length - 1][1]]
  const len = Math.hypot(dir[0], dir[1]) || 1
  const flare: Point = [outer[0] + (dir[0] / len) * f.width * 0.025 * reach, outer[1] - f.width * 0.02 * reach]
  return [flare, ...top, ...lid.slice().reverse()]
}

/** A strip hugging the upper lash line: thickness grows toward the outer corner, with an optional wing. */
function lashStrip(f: Face, side: "right" | "left", thickness: number, wing: number): Point[] {
  const e = eye(f, side)
  const lid = e.upper
  const h = f.eyeHeight(side) || f.width * 0.03
  const n = lid.length
  const top = lid.map((p, i) => {
    const t = 1 - i / (n - 1) // 1 at outer corner, 0 at inner
    return [p[0], p[1] - h * thickness * (0.35 + 0.65 * t)] as Point
  })
  const outer = lid[0]
  const dir: Point = [outer[0] - lid[n - 1][0], outer[1] - lid[n - 1][1]]
  const len = Math.hypot(dir[0], dir[1]) || 1
  const tip: Point = [outer[0] + (dir[0] / len) * f.width * 0.06 * wing, outer[1] - f.width * 0.035 * wing]
  return wing > 0 ? [...lid, ...top.slice().reverse(), tip].reverse() : [...lid, ...top.slice().reverse()]
}

function underEye(f: Face, side: "right" | "left"): Point[] {
  const lower = eye(f, side).lower
  const h = f.eyeHeight(side) || f.width * 0.03
  const low = lower.map((p, i) => {
    const t = Math.sin((Math.PI * i) / (lower.length - 1)) // deepest under the pupil
    return [p[0], p[1] + h * (0.4 + 1.3 * t)] as Point
  })
  return [...lower, ...low.slice().reverse()]
}

function ellipseAlong(a: Point, b: Point, t: number, rx: number, ry: number, offset: Point = [0, 0]): EllipseShape {
  const c = lerp(a, b, t)
  return { kind: "ellipse", center: [c[0] + offset[0], c[1] + offset[1]], rx, ry, angle: Math.atan2(b[1] - a[1], b[0] - a[0]) }
}

/**
 * Builds the mask shapes for a makeup region. `layer`/`layers` select the band for stacked
 * eyeshadow (layer 0 = base, widest; last = lid, closest to the lashes).
 */
export function regionMask(f: Face, region: Region, layer = 0, layers = 1): RegionMask {
  const W = f.width
  switch (region) {
    case "lips":
      return { shapes: [{ kind: "poly", points: f.pts(LM.lipsOuter), holes: [f.pts(LM.lipsInner)] }], feather: W * 0.006 }
    case "lip_liner": {
      const outer = f.pts(LM.lipsOuter)
      return { shapes: [{ kind: "poly", points: scaleAbout(outer, centroid(outer), 1.02), holes: [scaleAbout(outer, centroid(outer), 0.9)] }], feather: W * 0.004 }
    }
    case "eyeshadow": {
      // Base covers most of the lid space; later layers are lower bands (crease, then lid).
      const reaches = layers <= 1 ? [0.72] : layers === 2 ? [0.78, 0.45] : [0.85, 0.58, 0.32]
      const reach = reaches[Math.min(layer, reaches.length - 1)]
      return { shapes: [{ kind: "poly", points: lidBand(f, "right", reach) }, { kind: "poly", points: lidBand(f, "left", reach) }], feather: W * 0.02 }
    }
    case "eyeliner":
      return { shapes: [{ kind: "poly", points: lashStrip(f, "right", 0.28, 1) }, { kind: "poly", points: lashStrip(f, "left", 0.28, 1) }], feather: W * 0.003 }
    case "lashes":
      return { shapes: [{ kind: "poly", points: lashStrip(f, "right", 0.45, 0.4) }, { kind: "poly", points: lashStrip(f, "left", 0.45, 0.4) }], feather: W * 0.006 }
    case "brows": {
      const r = eye(f, "right"), l = eye(f, "left")
      return { shapes: [{ kind: "poly", points: [...r.browUpper, ...r.browLower.slice().reverse()] }, { kind: "poly", points: [...l.browUpper, ...l.browLower.slice().reverse()] }], feather: W * 0.006 }
    }
    case "blush": {
      const r = f.p(LM.rightCheek), l = f.p(LM.leftCheek)
      return { shapes: [{ kind: "ellipse", center: r, rx: W * 0.13, ry: W * 0.09, angle: -0.35 }, { kind: "ellipse", center: l, rx: W * 0.13, ry: W * 0.09, angle: 0.35 }], feather: 0 }
    }
    case "highlighter": {
      const re = f.p(LM.rightEyeLower[4]), le = f.p(LM.leftEyeLower[4])
      const bridge = f.pts(LM.noseBridge)
      return {
        shapes: [
          ellipseAlong(f.p(LM.rightFaceEdge), re, 0.55, W * 0.09, W * 0.035, [0, W * 0.07]),
          ellipseAlong(f.p(LM.leftFaceEdge), le, 0.55, W * 0.09, W * 0.035, [0, W * 0.07]),
          { kind: "ellipse", center: centroid(bridge), rx: W * 0.022, ry: dist(bridge[0], bridge[3]) * 0.7, angle: 0 },
        ],
        feather: 0,
      }
    }
    case "contour":
      return {
        shapes: [
          ellipseAlong(f.p(LM.rightFaceEdge), f.p(LM.rightMouthCorner), 0.28, W * 0.15, W * 0.045, [0, W * 0.035]),
          ellipseAlong(f.p(LM.leftFaceEdge), f.p(LM.leftMouthCorner), 0.28, W * 0.15, W * 0.045, [0, W * 0.035]),
        ],
        feather: 0,
      }
    case "concealer":
      return { shapes: [{ kind: "poly", points: underEye(f, "right") }, { kind: "poly", points: underEye(f, "left") }], feather: W * 0.025 }
    case "foundation":
      return { shapes: [skinShape(f, 0.98)], feather: W * 0.03 }
  }
}

/** Face skin: the oval minus eyes, brows and mouth. Also used for skin smoothing. */
export function skinShape(f: Face, scale = 1): PolyShape {
  const oval = f.pts(LM.faceOval)
  const grow = (pts: Point[], k: number) => scaleAbout(pts, centroid(pts), k)
  return {
    kind: "poly",
    points: grow(oval, scale),
    holes: [
      grow([...f.pts(LM.rightEyeUpper), ...f.pts(LM.rightEyeLower).slice(1, -1)], 1.25),
      grow([...f.pts(LM.leftEyeUpper), ...f.pts(LM.leftEyeLower).slice(1, -1)], 1.25),
      grow([...f.pts(LM.rightBrowUpper), ...f.pts(LM.rightBrowLower).slice().reverse()], 1.15),
      grow([...f.pts(LM.leftBrowUpper), ...f.pts(LM.leftBrowLower).slice().reverse()], 1.15),
      grow(f.pts(LM.lipsOuter), 1.08),
    ],
  }
}

/** Where to anchor face-attached media (between the eyes), with size and rotation. */
export function faceAnchor(f: Face) {
  const r = f.p(LM.rightFaceEdge), l = f.p(LM.leftFaceEdge)
  return { center: f.p(LM.betweenEyes), width: f.width, angle: Math.atan2(l[1] - r[1], l[0] - r[0]) }
}
