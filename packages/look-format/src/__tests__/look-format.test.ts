import { describe, expect, it } from "vitest"
import {
  ADAPTERS,
  BANUBA_FINISHES,
  BANUBA_FINISH_MAP,
  REGIONS,
  REGION_SPECS,
  emptyLook,
  getAdapter,
  previewColors,
  toBanubaPrefab,
  validateLook,
  type LookDocument,
} from "../index"

const look = (layers: LookDocument["layers"], smoothing = 0): LookDocument => ({ ...emptyLook("Test"), skin: { smoothing }, layers })
const face = (l: LookDocument | null, intensity?: number) => toBanubaPrefab(l, { intensity }).config.faces[0] as Record<string, any>

describe("finish mapping", () => {
  it("maps every neutral finish allowed per region to a documented Banuba finish", () => {
    for (const region of REGIONS) {
      for (const finish of REGION_SPECS[region].finishes) {
        const mapped = BANUBA_FINISH_MAP[region][finish]
        expect(mapped, `${region}/${finish}`).toBeDefined()
        expect(BANUBA_FINISHES[region], `${region}/${finish}`).toContain(mapped)
      }
    }
  })
})

describe("validateLook", () => {
  it("accepts a valid look and lower-cases colors", () => {
    const r = validateLook(look([{ region: "lips", material: { color: "#B3122E", finish: "satin", coverage: 0.9 } }]))
    expect(r.ok).toBe(true)
    expect(r.look!.layers[0].material.color).toBe("#b3122e")
  })

  it("rejects finishes not allowed for the region", () => {
    const r = validateLook(look([{ region: "highlighter", material: { color: "#ffffff", finish: "matte", coverage: 0.5 } }]))
    expect(r.ok).toBe(false)
    expect(r.issues[0].path).toBe("layers.0.material.finish")
  })

  it("enforces per-region layer limits", () => {
    const shadow = { region: "eyeshadow" as const, material: { color: "#111111", finish: "matte" as const, coverage: 0.5 } }
    expect(validateLook(look([shadow, shadow, shadow])).ok).toBe(true)
    expect(validateLook(look([shadow, shadow, shadow, shadow])).ok).toBe(false)
    const lip = { region: "lips" as const, material: { color: "#111111", finish: "satin" as const, coverage: 0.5 } }
    expect(validateLook(look([lip, lip])).ok).toBe(false)
  })

  it("rejects bad colors, unknown regions and wrong format markers", () => {
    expect(validateLook(look([{ region: "lips", material: { color: "red", finish: "satin", coverage: 1 } } as any])).ok).toBe(false)
    expect(validateLook(look([{ region: "nails", material: { color: "#000000", finish: "satin", coverage: 1 } } as any])).ok).toBe(false)
    expect(validateLook({ ...emptyLook(), format: "other" }).ok).toBe(false)
    expect(validateLook(null).ok).toBe(false)
  })

  it("warns on an empty look", () => {
    const r = validateLook(emptyLook())
    expect(r.ok).toBe(true)
    expect(r.issues[0].level).toBe("warning")
  })
})

describe("Banuba adapter", () => {
  it("emits the 2.0.0 prefab format with mapped finishes", () => {
    const { config, issues } = toBanubaPrefab(look([{ region: "lips", material: { color: "#b3122e", finish: "matte", coverage: 0.9 } }], 0.5))
    expect(config.version).toBe("2.0.0")
    expect(config.camera).toEqual({})
    const f = config.faces[0] as Record<string, any>
    expect(f.makeup_lipstick).toEqual({ color: "#b3122e", finish: "matte_velvet", coverage: 0.9 })
    expect(f.makeup_base.smooth).toBe("0.5 0.7")
    expect(issues).toEqual([])
  })

  it("stacks eyeshadow layers in order and keeps single layers as objects", () => {
    const f = face(
      look([
        { region: "eyeshadow", material: { color: "#d9b99b", finish: "matte", coverage: 0.5 } },
        { region: "eyeliner", material: { color: "#000000", finish: "matte", coverage: 1 } },
        { region: "eyeshadow", material: { color: "#c9a24a", finish: "metallic", coverage: 0.4 } },
      ]),
    )
    expect(f.makeup_eyeshadow.map((l: any) => l.finish)).toEqual(["matte", "metallic"])
    expect(Array.isArray(f.makeup_eyeliner)).toBe(false)
    expect(f.makeup_eyeliner.finish).toBe("matte_liquid")
  })

  it("applies valid Banuba overrides and falls back on unknown ones with a warning", () => {
    const valid = face(look([{ region: "lips", material: { color: "#111111", finish: "matte", coverage: 1, overrides: { banuba: { finish: "matte_powder" } } } }]))
    expect(valid.makeup_lipstick.finish).toBe("matte_powder")
    const r = toBanubaPrefab(look([{ region: "lips", material: { color: "#111111", finish: "matte", coverage: 1, overrides: { banuba: { finish: "laser" } } } }]))
    expect((r.config.faces[0] as any).makeup_lipstick.finish).toBe("matte_velvet")
    expect(r.issues[0].level).toBe("warning")
  })

  it("scales coverage by intensity and renders nothing for null (compare mode)", () => {
    expect(face(look([{ region: "blush", material: { color: "#e0a6bf", finish: "matte", coverage: 0.8 } }]), 0.5).makeup_blush.coverage).toBe(0.4)
    expect(face(null)).toEqual({})
  })

  it("drops layers beyond the region limit with a warning", () => {
    const lip = { region: "lips" as const, material: { color: "#111111", finish: "satin" as const, coverage: 0.5 } }
    const r = toBanubaPrefab(look([lip, lip]))
    expect(Array.isArray((r.config.faces[0] as any).makeup_lipstick)).toBe(false)
    expect(r.issues.length).toBe(1)
  })
})

describe("adapters registry", () => {
  it("round-trips the canonical Beauty OS export", () => {
    const l = look([{ region: "lips", material: { color: "#b3122e", finish: "satin", coverage: 0.9 }, shade: { sku: "SB-LIP-05", name: "Classic Red" } }])
    const out = getAdapter("beautyos")!.export(l)
    expect(validateLook(JSON.parse(out.content)).look).toEqual(l)
  })

  it("every adapter exports every region without errors", () => {
    const l = look(REGIONS.map((region) => ({ region, material: { color: "#888888", finish: REGION_SPECS[region].finishes[0], coverage: 0.5 } })))
    for (const a of ADAPTERS) {
      const r = a.export(l)
      expect(r.issues.filter((i) => i.level === "error"), a.id).toEqual([])
      expect(a.fileName(l)).toMatch(/^test\./)
    }
  })
})

it("previewColors puts lips first and caps the count", () => {
  const l = look([
    { region: "blush", material: { color: "#000003", finish: "matte", coverage: 1 } },
    { region: "lips", material: { color: "#000001", finish: "satin", coverage: 1 } },
    { region: "eyeshadow", material: { color: "#000002", finish: "matte", coverage: 1 } },
  ])
  expect(previewColors(l, 2)).toEqual(["#000001", "#000002"])
})

describe("overlays", () => {
  const img = { assetId: "a1", url: "/assets/a1/bg.jpg", mediaType: "image/jpeg", sha256: "a".repeat(64) }
  const vid = { assetId: "v1", url: "/assets/v1/clip.mp4", mediaType: "video/mp4" }
  const withOverlays = (overlays: unknown[]) => ({ ...emptyLook("FX"), overlays })

  it("validates media types per overlay kind and one-of-each", () => {
    expect(validateLook(withOverlays([{ kind: "background", asset: vid }])).ok).toBe(true)
    expect(validateLook(withOverlays([{ kind: "lut", asset: vid }])).ok).toBe(false)
    expect(validateLook(withOverlays([{ kind: "face_video", asset: img }])).ok).toBe(false)
    expect(validateLook(withOverlays([{ kind: "background", asset: img }, { kind: "background", asset: vid }])).ok).toBe(false)
    expect(validateLook(withOverlays([{ kind: "face_video", asset: vid, alpha: vid, splitAlpha: true }])).ok).toBe(false)
  })

  it("maps overlays to Banuba prefabs and lists bundle files once each", () => {
    const r = validateLook(
      withOverlays([
        { kind: "background", asset: img, contentMode: "fit" },
        { kind: "lut", asset: img, strength: 0.8 },
        { kind: "face_video", asset: vid, splitAlpha: true },
        { kind: "softlight", strength: 0.4 },
      ]),
    )
    expect(r.ok).toBe(true)
    const { config, files } = toBanubaPrefab(r.look!)
    const c = config as any
    expect(c.background).toMatchObject({ texture: "assets/aaaaaaaaaaaaaaaa.jpg", content_mode: "fit", blend_mode: "default" })
    expect(c.lut).toEqual({ filename: "assets/aaaaaaaaaaaaaaaa.jpg", strength: 0.8 })
    expect(c.faces[0].video_texture).toMatchObject({ use_separate_alpha: false, video: "assets/v1.mp4", rotation: "-90 0 0" })
    expect(c.faces[0].softlight).toEqual({ strength: 0.4 })
    expect(files.map((f) => f.path).sort()).toEqual(["assets/aaaaaaaaaaaaaaaa.jpg", "assets/v1.mp4"])
  })

  it("defaults overlays to [] for older documents", () => {
    const { overlays, ...old } = emptyLook()
    expect(validateLook(old).look!.overlays).toEqual([])
  })
})
