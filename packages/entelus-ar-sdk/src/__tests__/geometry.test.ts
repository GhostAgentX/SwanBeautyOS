import { readFileSync, existsSync } from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"
import { REGIONS } from "@beautyos/look-format"
import { beforeAll, describe, expect, it } from "vitest"
import { Face, LM, centroid, faceAnchor, pointInPolygon, polygonArea, regionMask, resample, skinShape, type PolyShape } from "../geometry"

// MediaPipe's reference portrait (820x1024) and its expected 478 landmarks. Fetched by
// `npm run fetch-test-assets`; tests skip when offline.
const DIR = path.join(path.dirname(fileURLToPath(import.meta.url)), "../../test-assets")
const PBTXT = path.join(DIR, "portrait_expected_face_landmarks.pbtxt")
const have = existsSync(PBTXT)
let face: Face

beforeAll(() => {
  if (!have) return
  const text = readFileSync(PBTXT, "utf8")
  const lms = [...text.matchAll(/x: ([-\d.e]+)\s+y: ([-\d.e]+)/g)].map((m) => ({ x: Number(m[1]), y: Number(m[2]) }))
  face = new Face(lms, 820, 1024)
})

const poly = (r: ReturnType<typeof regionMask>, i = 0) => r.shapes[i] as PolyShape

describe.skipIf(!have)("makeup geometry on the reference portrait", () => {
  it("reads 478 landmarks and a plausible face width", () => {
    expect(face.px.length).toBe(478)
    expect(face.width).toBeGreaterThan(150)
    expect(face.width).toBeLessThan(820)
  })

  it("places lips below the nose and above the chin, with the mouth opening inside", () => {
    const lips = poly(regionMask(face, "lips"))
    const c = centroid(lips.points)
    expect(c[1]).toBeGreaterThan(face.p(LM.noseTip)[1])
    expect(c[1]).toBeLessThan(face.p(LM.chin)[1])
    expect(polygonArea(lips.points)).toBeGreaterThan(polygonArea(lips.holes![0]))
    expect(pointInPolygon(centroid(lips.holes![0]), lips.points)).toBe(true)
  })

  it("stacks eyeshadow bands between lash line and brow, base widest", () => {
    const eyeC = centroid(face.pts(LM.rightEyeUpper))
    const browC = centroid(face.pts(LM.rightBrowLower))
    const bands = [0, 1, 2].map((l) => poly(regionMask(face, "eyeshadow", l, 3)))
    for (const b of bands) {
      const c = centroid(b.points)
      expect(c[1]).toBeLessThan(eyeC[1] + 1)
      expect(c[1]).toBeGreaterThan(browC[1] - 1)
    }
    const areas = bands.map((b) => polygonArea(b.points))
    expect(areas[0]).toBeGreaterThan(areas[1])
    expect(areas[1]).toBeGreaterThan(areas[2])
  })

  it("keeps liner and lashes on the upper lash line, concealer under the eye", () => {
    const lid = centroid(face.pts(LM.rightEyeUpper))
    const liner = centroid(poly(regionMask(face, "eyeliner")).points)
    expect(Math.abs(liner[1] - lid[1])).toBeLessThan(face.eyeHeight("right") * 1.5)
    const under = centroid(poly(regionMask(face, "concealer")).points)
    expect(under[1]).toBeGreaterThan(centroid(face.pts(LM.rightEyeLower))[1])
  })

  it("puts cheek products inside the face oval, on both sides", () => {
    const oval = face.pts(LM.faceOval)
    for (const region of ["blush", "highlighter", "contour"] as const) {
      const m = regionMask(face, region)
      for (const s of m.shapes) {
        expect(s.kind).toBe("ellipse")
        if (s.kind === "ellipse") expect(pointInPolygon(s.center, oval), `${region} center`).toBe(true)
      }
    }
    const [r, l] = regionMask(face, "blush").shapes as { center: [number, number] }[]
    const mid = face.p(LM.noseTip)[0]
    expect(r.center[0]).toBeLessThan(mid) // subject's right = image left
    expect(l.center[0]).toBeGreaterThan(mid)
  })

  it("cuts eyes, brows and mouth out of the skin area", () => {
    const skin = skinShape(face)
    expect(skin.holes!.length).toBe(5)
    for (const h of skin.holes!) expect(pointInPolygon(centroid(h), skin.points)).toBe(true)
    expect(pointInPolygon(face.p(LM.rightCheek), skin.points)).toBe(true)
  })

  it("produces a non-empty mask for every region", () => {
    for (const r of REGIONS) {
      const m = regionMask(face, r)
      expect(m.shapes.length, r).toBeGreaterThan(0)
      for (const s of m.shapes) if (s.kind === "poly") expect(polygonArea(s.points), r).toBeGreaterThan(10)
    }
  })

  it("anchors face media between the eyes, roughly level", () => {
    const a = faceAnchor(face)
    expect(Math.abs(a.angle)).toBeLessThan(0.3)
    expect(a.center[1]).toBeLessThan(face.p(LM.noseTip)[1])
  })
})

it("resamples a polyline evenly", () => {
  const r = resample([[0, 0], [10, 0], [10, 10]], 5)
  expect(r).toHaveLength(5)
  expect(r[0]).toEqual([0, 0])
  expect(r[4]).toEqual([10, 10])
  expect(r[2]).toEqual([10, 0])
})
