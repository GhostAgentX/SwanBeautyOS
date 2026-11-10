import { encodeAseLibrary } from "@beautyos/color-lab"
import { validateLook, type LookDocument } from "@beautyos/look-format"
import ffmpegPath from "ffmpeg-static"
import { execFileSync } from "node:child_process"
import { mkdtempSync, readFileSync } from "node:fs"
import os from "node:os"
import path from "node:path"
import sharp from "sharp"
import { strFromU8, strToU8, unzipSync } from "fflate"
import { beforeAll, describe, expect, it } from "vitest"
import { openDatabase, type DB } from "@/db/client"
import { seed } from "@/db/seed"
import { PRESET_PROFILES, resolveSize } from "@/lib/export-profiles"
import { compilePrompt, likenessViolation, sampleCast, UNDERTONES } from "@/lib/synthetic"
import { modules } from "@/modules"
import { ensureHeadroom, measureTopSpace } from "../composition"
import * as repo from "../repo"
import { exportAsset, exportLook, generateModel, importFile, ingestAsset } from "../services"

let db: DB
let brandId: string

const png = (w: number, h: number, color = "#c46a4f") => sharp({ create: { width: w, height: h, channels: 3, background: color } }).png().toBuffer().then((b) => new Uint8Array(b))
const profile = (id: string) => PRESET_PROFILES.find((p) => p.id === id)!.profile

beforeAll(async () => {
  db = await openDatabase({ dataDir: "memory://" })
  await seed(db)
  brandId = (await repo.getBrandBySlug(db, "swan-beauty")).id
})

describe("catalog and looks", () => {
  it("seeds a catalog with unique SKUs and six published looks", async () => {
    const cat = await repo.listCatalog(db, brandId)
    expect(cat.length).toBe(11)
    const { looks } = await repo.publishedLooks(db, "swan-beauty")
    expect(looks.map((l) => l.look.name)).toContain("Sunset Bronze")
    expect(looks.every((l) => validateLook(l.look).ok)).toBe(true)
  })

  it("rejects bad shades", async () => {
    const lips = (await repo.listCatalog(db, brandId)).find((p) => p.region === "lips")!
    await expect(repo.addShade(db, brandId, lips.id, { name: "X", sku: "LIP-001", color: "#111111", finish: "satin" })).rejects.toThrow(/already used/)
    await expect(repo.addShade(db, brandId, lips.id, { name: "X", sku: "NEW-1", color: "red", finish: "satin" })).rejects.toThrow(/hex/)
    await expect(repo.addShade(db, brandId, lips.id, { name: "X", sku: "NEW-1", color: "#111111", finish: "volume" })).rejects.toThrow(/finishes/)
    await expect(repo.addShade(db, brandId, lips.id, { name: "X", sku: "NEW-1", color: "#111111", finish: "satin", banubaFinish: "laser" })).rejects.toThrow(/Banuba/)
  })

  it("runs the draft → publish → edit → restore → unpublish lifecycle", async () => {
    const look = await repo.createLook(db, brandId, { name: "Lifecycle" })
    expect(look.dirty).toBe(true)
    const doc: LookDocument = { ...look.draft, layers: [{ region: "lips", material: { color: "#b3122e", finish: "satin", coverage: 0.8 } }] }
    await repo.saveDraft(db, brandId, look.id, doc)
    const v1 = await repo.publishLook(db, brandId, look.id, "first")
    expect(v1.version.version).toBe(1)
    expect(v1.look.dirty).toBe(false)

    const edited = { ...doc, layers: [{ region: "lips" as const, material: { color: "#6b1636", finish: "matte" as const, coverage: 0.9 } }] }
    expect((await repo.saveDraft(db, brandId, look.id, edited)).look.dirty).toBe(true)
    // Customers still see v1 until the next publish.
    const live = (await repo.publishedLooks(db, "swan-beauty")).looks.find((l) => l.id === look.id)!
    expect(live.look.layers[0].material.color).toBe("#b3122e")

    expect((await repo.publishLook(db, brandId, look.id)).version.version).toBe(2)
    const restored = await repo.restoreVersion(db, brandId, look.id, 1)
    expect(restored.look.draft.layers[0].material.color).toBe("#b3122e")
    expect(restored.look.dirty).toBe(true)

    await repo.unpublishLook(db, brandId, look.id)
    expect((await repo.publishedLooks(db, "swan-beauty")).looks.some((l) => l.id === look.id)).toBe(false)
  })

  it("doesn't flag a look as edited when the saved draft equals the published version (jsonb key order)", async () => {
    const live = (await repo.publishedLooks(db, "swan-beauty")).looks.find((l) => l.look.name === "Classic Red")!
    // Same content, keys in a different order.
    const reordered = JSON.parse(JSON.stringify(live.look, Object.keys(live.look).reverse()))
    const { look } = await repo.saveDraft(db, brandId, live.id, { ...reordered, layers: live.look.layers, skin: live.look.skin, tags: live.look.tags })
    expect(look.dirty).toBe(false)
  })

  it("refuses invalid drafts and keeps slugs unique", async () => {
    const a = await repo.createLook(db, brandId, { name: "Same Name" })
    const b = await repo.createLook(db, brandId, { name: "Same Name" })
    expect(a.slug).toBe("same-name")
    expect(b.slug).toBe("same-name-2")
    await expect(repo.saveDraft(db, brandId, a.id, { ...a.draft, layers: [{ region: "highlighter", material: { color: "#ffffff", finish: "matte", coverage: 1 } }] })).rejects.toThrow(/errors/)
  })
})

describe("asset pipeline and export profiles", () => {
  let imageId: string

  it("ingests, dedupes and records processing", async () => {
    const bytes = await png(2400, 3000)
    const first = await ingestAsset(db, brandId, { bytes, name: "backdrop.png" }, { enhance: "hyperreal" })
    expect(first.asset).toMatchObject({ kind: "image", width: 2400, height: 3000, mediaType: "image/jpeg" })
    expect(first.asset.processing).toContain("enhance:hyperreal")
    expect(first.asset.palette.length).toBeGreaterThan(0)
    expect((await ingestAsset(db, brandId, { bytes, name: "again.png" })).duplicate).toBe(true)
    imageId = first.asset.id
  })

  it("rejects files that aren't media regardless of extension", async () => {
    await expect(ingestAsset(db, brandId, { bytes: strToU8("<html>"), name: "evil.png" })).rejects.toThrow(/supported image or video/)
  })

  it("renders social, web and print profiles to spec", async () => {
    const ig = await exportAsset(db, brandId, imageId, profile("ig-portrait"))
    expect([ig.width, ig.height, ig.mediaType]).toEqual([1080, 1350, "image/jpeg"])

    const hero = await exportAsset(db, brandId, imageId, profile("web-hero"))
    expect(hero.mediaType).toBe("image/webp")
    expect(hero.bytes.length).toBeLessThanOrEqual(600_000)

    const print = await exportAsset(db, brandId, imageId, profile("print-a4"))
    const meta = await sharp(print.bytes).metadata()
    expect([meta.format, meta.space, meta.width, meta.height, meta.density]).toEqual(["tiff", "cmyk", 2480, 3508, 300])

    const master = await exportAsset(db, brandId, imageId, profile("master-png16"))
    expect((await sharp(master.bytes).metadata()).depth).toBe("ushort")
  })

  it("strips source EXIF (names, GPS) from exports while still writing DPI", async () => {
    const tagged = await sharp({ create: { width: 1200, height: 1500, channels: 3, background: "#d9a07a" } })
      .withExif({ IFD0: { Artist: "PRIVATE-PERSON" } })
      .jpeg()
      .toBuffer()
    const { asset } = await ingestAsset(db, brandId, { bytes: new Uint8Array(tagged), name: "tagged.jpg" })
    const out = await exportAsset(db, brandId, asset.id, { kind: "image", format: "jpeg", dpi: 300 })
    const meta = await sharp(out.bytes).metadata()
    expect(meta.density).toBe(300)
    expect(meta.exif?.toString("latin1").includes("PRIVATE-PERSON") ?? false).toBe(false)
  })

  it("supports custom size, aspect and fit, and never upscales unless asked", async () => {
    const pad = await exportAsset(db, brandId, imageId, { kind: "image", format: "png", width: 1000, aspectRatio: "16:9", fit: "pad", padColor: "#000000" })
    expect([pad.width, pad.height]).toEqual([1000, 563])
    const big = resolveSize({ width: 9000, height: 9000, fit: "cover", padColor: "#fff", anchor: "center", allowUpscale: false }, { width: 2400, height: 3000 })
    expect(big.upscaled).toBe(false)
    expect(Math.max(big.width, big.height)).toBeLessThanOrEqual(3000)
  })

  it("transcodes video and exports MP4, WebM, GIF and poster frames", async () => {
    const dir = mkdtempSync(path.join(os.tmpdir(), "vid-"))
    const file = path.join(dir, "clip.mov")
    execFileSync(ffmpegPath as unknown as string, ["-y", "-f", "lavfi", "-i", "testsrc=size=1280x720:rate=30", "-t", "2", "-c:v", "mpeg4", file], { stdio: "ignore" })
    const { asset } = await ingestAsset(db, brandId, { bytes: new Uint8Array(readFileSync(file)), name: "clip.mov" })
    expect(asset).toMatchObject({ kind: "video", mediaType: "video/mp4", width: 1280, height: 720 })
    expect(asset.durationMs).toBeGreaterThan(1500)

    const story = await exportAsset(db, brandId, asset.id, { kind: "video", format: "mp4", width: 540, height: 960, fit: "cover", allowUpscale: true })
    expect([story.width, story.height, story.mediaType]).toEqual([540, 960, "video/mp4"])
    expect((await exportAsset(db, brandId, asset.id, { kind: "video", format: "webm", longEdge: 640 })).mediaType).toBe("video/webm")
    expect((await exportAsset(db, brandId, asset.id, profile("gif-preview"))).mediaType).toBe("image/gif")
    const poster = await exportAsset(db, brandId, asset.id, { kind: "image", format: "png", width: 640 })
    expect(poster.mediaType).toBe("image/png")
  }, 120_000)
})

describe("look export and universal import", () => {
  it("exports a look with an overlay as a Banuba effect zip and a portable bundle, and re-imports the bundle", async () => {
    const bg = (await ingestAsset(db, brandId, { bytes: await png(1080, 1920, "#203040"), name: "bg.png" })).asset
    const look = await repo.createLook(db, brandId, { name: "With Backdrop" })
    const doc: LookDocument = {
      ...look.draft,
      layers: [{ region: "lips", material: { color: "#b3122e", finish: "satin", coverage: 0.8 } }],
      overlays: [{ kind: "background", asset: { assetId: bg.id, url: bg.url, mediaType: bg.mediaType, sha256: bg.deliverySha256 }, contentMode: "scale_to_fill", blend: "default", rotation: 0, scale: 1 }],
    }
    await repo.saveDraft(db, brandId, look.id, doc)

    const effect = unzipSync((await exportLook(db, brandId, look.id, "banuba-effect", "draft")).bytes)
    const config = JSON.parse(strFromU8(effect["config.json"]))
    expect(effect[config.background.texture]).toBeDefined()

    const bundle = await exportLook(db, brandId, look.id, "bundle", "draft")
    const files = unzipSync(bundle.bytes)
    expect(Object.keys(files).sort()).toEqual(expect.arrayContaining(["look.beautyos.json", "manifest.json", "banuba/config.json"]))

    const result = await importFile(db, brandId, { name: bundle.fileName, bytes: bundle.bytes })
    expect(result.kind).toBe("bundle")
    const imported = await repo.getLook(db, brandId, result.id!)
    expect(imported.draft.overlays[0].asset!.assetId).toBe(bg.id) // same bytes → deduped to the existing asset
  })

  it("routes ASE, CSV and look JSON files by content and explains failures", async () => {
    const ase = encodeAseLibrary([{ name: "PANTONE 18-1663 TPX", source: { space: "lab", L: 42, a: 58, b: 35 } }])
    expect((await importFile(db, brandId, { name: "Pantone Fashion.ase", bytes: new Uint8Array(ase) })).kind).toBe("library")
    expect((await importFile(db, brandId, { name: "brand.csv", bytes: strToU8("name,hex\nSwan Red,#b3122e") })).message).toMatch(/1 colors/)
    const libs = await repo.listLibraries(db, brandId)
    expect(libs.find((l) => l.name === "Pantone Fashion")?.kind).toBe("pantone")

    const exported = await exportLook(db, brandId, (await repo.listLooks(db, brandId))[0].id, "beautyos", "draft")
    expect((await importFile(db, brandId, { name: "look.json", bytes: exported.bytes })).kind).toBe("look")
    expect((await importFile(db, brandId, { name: "broken.json", bytes: strToU8('{"format":"nope"}') })).kind).toBe("skipped")
  })
})

describe("synthetic models", () => {
  it("samples a cast that spans skin depth and every undertone, face and eye shape", () => {
    const cast = sampleCast({ size: 12, seed: 7 })
    const depths = cast.map((m) => m.skinDepth)
    expect(Math.min(...depths)).toBeLessThanOrEqual(2)
    expect(Math.max(...depths)).toBeGreaterThanOrEqual(9)
    expect(new Set(cast.map((m) => m.undertone)).size).toBe(UNDERTONES.length)
    expect(new Set(cast.map((m) => m.eyeShape)).size).toBeGreaterThanOrEqual(7)
    expect(new Set(cast.map((m) => m.hairTexture.split(" ")[0])).size).toBeGreaterThanOrEqual(6)
    expect(sampleCast({ size: 12, seed: 7 })).toEqual(cast)
  })

  it("compiles prompts with headroom and originality constraints, and blocks likeness requests", () => {
    const [m] = sampleCast({ size: 1, seed: 3, base: { headroom: 0.3 } })
    const { prompt, negativePrompt } = compilePrompt(m)
    expect(prompt).toMatch(/at least 30% empty negative space above/)
    expect(prompt).toMatch(/original, fictional/)
    expect(prompt).toMatch(/bare face/)
    expect(negativePrompt).toMatch(/celebrity likeness/)
    expect(likenessViolation("freckles and a septum ring")).toBeNull()
    expect(likenessViolation("looks like a famous singer")).toMatch(/must be original/)
  })

  it("guarantees headroom in post when the subject touches the top", async () => {
    // Subject (dark block) starts at the very top: no headroom.
    const img = await sharp({ create: { width: 800, height: 1000, channels: 3, background: "#e0e0e0" } })
      .composite([{ input: await sharp({ create: { width: 400, height: 800, channels: 3, background: "#5a3826" } }).png().toBuffer(), left: 200, top: 0 }])
      .png()
      .toBuffer()
    expect(await measureTopSpace(new Uint8Array(img))).toBeLessThan(0.02)
    const out = await ensureHeadroom(new Uint8Array(img), { minTop: 0.25, aspect: "4:5" })
    const meta = await sharp(out.bytes).metadata()
    expect(meta.width! / meta.height!).toBeCloseTo(0.8, 2)
    expect(await measureTopSpace(out.bytes)).toBeGreaterThanOrEqual(0.2)
  })

  it("lets a new image generator plug into the registry and records provenance", async () => {
    const calls: string[] = []
    modules().imageGenerators.register({
      id: "test-generator",
      label: "Test",
      available: () => true,
      async generate(req) {
        calls.push(req.prompt)
        const bytes = await sharp({ create: { width: req.width, height: req.height, channels: 3, background: "#c68863" } }).png().toBuffer()
        return { bytes: new Uint8Array(bytes), mediaType: "image/png", model: "test-model", seed: req.seed }
      },
    })
    const [spec] = sampleCast({ size: 1, seed: 11 })
    const { asset } = await generateModel(db, brandId, spec)
    expect(calls[0]).toMatch(/negative space above/)
    expect(asset.provenance).toMatchObject({ synthetic: true, generator: "test-generator", model: "test-model" })
    await expect(generateModel(db, brandId, { ...spec, notes: "resembling a famous actress" })).rejects.toThrow(/original/)
  })
})
