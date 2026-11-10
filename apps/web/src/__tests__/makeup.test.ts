import { describe, expect, it } from "vitest"
import {
  PRESET_LOOKS,
  PRODUCTS,
  buildConfig,
  lookFromState,
  lookPreviewColors,
  matchesLook,
  productById,
  sanitizeLook,
  stateFromLook,
  type ProductId,
  type Shade,
} from "../makeup"

const look = (id: string) => PRESET_LOOKS.find((l) => l.id === id)!
const face = (cfg: ReturnType<typeof buildConfig>) => cfg.faces[0] as Record<string, unknown>

describe("preset looks", () => {
  it("only use documented finishes, valid colors and allowed layer counts", () => {
    for (const l of PRESET_LOOKS) {
      for (const [id, p] of Object.entries(l.products) as [ProductId, Shade | Shade[]][]) {
        const def = productById(id)
        const layers = Array.isArray(p) ? p : [p]
        expect(layers.length, `${l.id}.${id}`).toBeLessThanOrEqual(def.maxLayers)
        for (const s of layers) {
          expect(def.finishes, `${l.id}.${id}`).toContain(s.finish)
          expect(s.color).toMatch(/^#[0-9a-f]{6}$/i)
          expect(s.coverage).toBeGreaterThanOrEqual(0)
          expect(s.coverage).toBeLessThanOrEqual(1)
        }
      }
    }
  })

  it("have unique ids", () => {
    expect(new Set(PRESET_LOOKS.map((l) => l.id)).size).toBe(PRESET_LOOKS.length)
  })

  it("Bare produces an empty face", () => {
    expect(face(buildConfig(stateFromLook(look("bare"))))).toEqual({})
  })
})

describe("buildConfig", () => {
  it("emits an eyeshadow array for multi-layer looks, in order", () => {
    const shadow = face(buildConfig(stateFromLook(look("sunset-bronze")))).makeup_eyeshadow as Shade[]
    expect(Array.isArray(shadow)).toBe(true)
    expect(shadow.map((s) => s.finish)).toEqual(["matte", "shimmer", "metallic"])
  })

  it("emits a single eyeshadow object when there is one layer", () => {
    const s = stateFromLook(look("sunset-bronze"))
    s.products.eyeshadow.layers.splice(1)
    expect(Array.isArray(face(buildConfig(s)).makeup_eyeshadow)).toBe(false)
  })

  it("scales every coverage by look intensity", () => {
    const s = stateFromLook(look("classic-red"))
    s.intensity = 0.5
    expect((face(buildConfig(s)).makeup_lipstick as Shade).coverage).toBe(0.45)
  })

  it("omits disabled products and renders nothing in compare mode", () => {
    const s = stateFromLook(look("classic-red"))
    s.products.lipstick.enabled = false
    expect(face(buildConfig(s)).makeup_lipstick).toBeUndefined()
    expect(face(buildConfig(null))).toEqual({})
  })

  it("always uses the 2.0.0 prefab format with camera", () => {
    const cfg = buildConfig(stateFromLook(look("natural")))
    expect(cfg.version).toBe("2.0.0")
    expect(cfg.camera).toEqual({})
  })
})

describe("edited detection", () => {
  it("matches the look it came from and stops matching after an edit", () => {
    const s = stateFromLook(look("soft-glam"))
    expect(matchesLook(s, look("soft-glam"))).toBe(true)
    s.products.lipstick.layers[0].finish = "matte_velvet"
    expect(matchesLook(s, look("soft-glam"))).toBe(false)
  })

  it("ignores look intensity", () => {
    const s = stateFromLook(look("soft-glam"))
    s.intensity = 0.3
    expect(matchesLook(s, look("soft-glam"))).toBe(true)
  })

  it("never mutates the preset when state is edited", () => {
    const before = JSON.stringify(look("evening-smoky"))
    const s = stateFromLook(look("evening-smoky"))
    s.products.eyeshadow.layers[0].color = "#ffffff"
    expect(JSON.stringify(look("evening-smoky"))).toBe(before)
  })
})

describe("custom looks", () => {
  it("round-trip through lookFromState and sanitizeLook", () => {
    const s = stateFromLook(look("evening-smoky"))
    const saved = sanitizeLook(JSON.parse(JSON.stringify(lookFromState(s, { id: "custom-1", name: "Date night" }))))!
    expect(saved.name).toBe("Date night")
    expect(saved.custom).toBe(true)
    expect(matchesLook(stateFromLook(saved), look("evening-smoky"))).toBe(true)
  })

  it("bakes look intensity into saved coverage", () => {
    const s = stateFromLook(look("classic-red"))
    s.intensity = 0.5
    const saved = lookFromState(s, { id: "c", name: "Soft red" })
    expect((saved.products.lipstick as Shade).coverage).toBe(0.45)
  })

  it("drops unknown products, bad colors, undocumented finishes and extra layers", () => {
    const l = sanitizeLook({
      id: "x",
      name: "  Messy  ",
      smoothing: 7,
      products: {
        lipstick: { color: "red", finish: "satin", coverage: 1 },
        blush: { color: "#AABBCC", finish: "glitter", coverage: 0.5 },
        eyeliner: { color: "#000000", finish: "matte_liquid", coverage: 3 },
        eyeshadow: Array(5).fill({ color: "#111111", finish: "matte", coverage: 0.5 }),
        tattoo: { color: "#000000", finish: "matte", coverage: 1 },
      },
    })!
    expect(l.name).toBe("Messy")
    expect(l.smoothing).toBe(1)
    expect(Object.keys(l.products).sort()).toEqual(["eyeliner", "eyeshadow"])
    expect((l.products.eyeliner as Shade).coverage).toBe(1)
    expect((l.products.eyeshadow as Shade[]).length).toBe(3)
  })

  it("rejects non-objects and nameless looks", () => {
    expect(sanitizeLook(null)).toBeNull()
    expect(sanitizeLook("look")).toBeNull()
    expect(sanitizeLook({ id: "a", name: "   " })).toBeNull()
  })
})

describe("lookPreviewColors", () => {
  it("returns up to 4 colors, lips first", () => {
    const colors = lookPreviewColors(look("sunset-bronze"))
    expect(colors[0]).toBe("#e8705a")
    expect(colors.length).toBeLessThanOrEqual(4)
  })
})

it("every product has at least one shade and finish", () => {
  for (const p of PRODUCTS) {
    expect(p.shades.length).toBeGreaterThan(0)
    expect(p.finishes.length).toBeGreaterThan(0)
  }
})
