import "server-only"
// Application services: the workflows the UI and APIs call. They compose the repository, media
// processing, storage and the module registry.
import { parseAseLibrary, parseCsvLibrary } from "@beautyos/color-lab"
import { getAdapter, slugify, validateLook, type AssetRef, type LookDocument } from "@beautyos/look-format"
import { strFromU8, strToU8, unzipSync, zipSync } from "fflate"
import type { DB } from "@/db/client"
import type { Provenance } from "@/db/schema"
import { ExportProfile, type ExportProfileInput } from "@/lib/export-profiles"
import { compilePrompt, likenessViolation, ModelSpec, type MakeupBrief, type ModelSpecInput } from "@/lib/synthetic"
import { activeStorage, modules } from "@/modules"
import { ensureHeadroom } from "./composition"
import { LIMITS, MediaError, processImage, processVideo, renderImage, renderPoster, renderVideo, sha256, sniff, type EnhancePreset } from "./media"
import * as repo from "./repo"

// ---------- assets ----------

export async function ingestAsset(
  db: DB,
  brandId: string,
  file: { bytes: Uint8Array; name: string },
  opts: { enhance?: EnhancePreset; provenance?: Provenance; displayName?: string } = {},
) {
  const type = sniff(file.bytes)
  if (!type) throw new MediaError(`"${file.name}" isn't a supported image or video (JPEG, PNG, WebP, AVIF, HEIC, TIFF, GIF, MP4, MOV, WebM).`)
  const limit = type.kind === "image" ? LIMITS.imageBytes : LIMITS.videoBytes
  if (file.bytes.length > limit) throw new MediaError(`"${file.name}" is ${Math.round(file.bytes.length / 1e6)} MB; the limit for ${type.kind}s is ${limit / 1e6} MB.`)

  const sha = sha256(file.bytes)
  const existing = await repo.findAssetBySha(db, brandId, sha)
  if (existing) return { asset: existing, duplicate: true }

  const store = activeStorage()
  const base = `${brandId}/${sha.slice(0, 2)}/${sha}`
  const ext = type.mediaType.split("/")[1].replace("quicktime", "mov").replace("jpeg", "jpg")
  const original = await store.put(`${base}/original.${ext}`, file.bytes, type.mediaType)
  const name = (opts.displayName ?? file.name.replace(/\.[^.]+$/, "")).slice(0, 120) || "Untitled"

  if (type.kind === "image") {
    const p = await processImage(file.bytes, opts.enhance ?? "none")
    const outExt = p.mediaType === "image/png" ? "png" : "jpg"
    const [delivery, thumb] = await Promise.all([store.put(`${base}/delivery.${outExt}`, p.bytes, p.mediaType), store.put(`${base}/thumb.webp`, p.thumbnail, "image/webp")])
    const asset = await repo.insertAsset(db, {
      brandId, kind: "image", name, url: delivery.url, storageKey: `${base}/delivery.${outExt}`, originalKey: `${base}/original.${ext}`, originalMediaType: type.mediaType,
      mediaType: p.mediaType, bytes: p.bytes.length, sha256: sha, deliverySha256: sha256(p.bytes), width: p.width, height: p.height, hasAlpha: p.hasAlpha, thumbnailUrl: thumb.url,
      palette: p.palette, processing: p.steps, originalName: file.name, provenance: opts.provenance ?? null,
    })
    void original
    return { asset, duplicate: false }
  }

  const v = await processVideo(file.bytes)
  const [delivery, thumb] = await Promise.all([store.put(`${base}/delivery.mp4`, v.bytes, v.mediaType), store.put(`${base}/thumb.webp`, v.thumbnail, "image/webp")])
  const asset = await repo.insertAsset(db, {
    brandId, kind: "video", name, url: delivery.url, storageKey: `${base}/delivery.mp4`, originalKey: `${base}/original.${ext}`, originalMediaType: type.mediaType,
    mediaType: v.mediaType, bytes: v.bytes.length, sha256: sha, deliverySha256: sha256(v.bytes), width: v.width, height: v.height, durationMs: v.durationMs, thumbnailUrl: thumb.url,
    palette: v.palette, processing: v.steps, originalName: file.name, provenance: opts.provenance ?? null,
  })
  return { asset, duplicate: false }
}

/** Renders an asset to any export profile. Images render from the untouched original for maximum quality. */
export async function exportAsset(db: DB, brandId: string, assetId: string, profileInput: ExportProfileInput) {
  const asset = await repo.getAsset(db, brandId, assetId)
  const profile = ExportProfile.parse(profileInput)
  const store = activeStorage()
  if (asset.kind === "image") {
    if (profile.kind !== "image") throw new MediaError("Choose an image profile for an image asset.")
    const src = await store.get(asset.originalKey, asset.url).catch(() => store.get(asset.storageKey, asset.url))
    const r = await renderImage(src, profile)
    return { ...r, fileName: `${slugify(asset.name)}-${r.width}x${r.height}.${r.ext}` }
  }
  const src = await store.get(asset.storageKey, asset.url)
  const r = profile.kind === "image" ? await renderPoster(src, profile) : await renderVideo(src, profile)
  return { ...r, fileName: `${slugify(asset.name)}-${r.width}x${r.height}.${r.ext}` }
}

/** The reference a look stores for an asset: pinned to the exact delivered bytes. */
export const assetRef = (a: { id: string; url: string; mediaType: string; deliverySha256: string; originalName: string }): AssetRef => ({
  assetId: a.id,
  url: a.url,
  mediaType: a.mediaType,
  sha256: a.deliverySha256,
  fileName: a.originalName,
})

// ---------- looks ----------

export const LOOK_EXPORT_TARGETS = [
  { id: "beautyos", label: "Beauty OS look (.json)", description: "Portable, lossless. Re-import anywhere in Beauty OS." },
  { id: "banuba", label: "Banuba prefab config (.json)", description: "Paste into a Banuba effect's config.json." },
  { id: "banuba-effect", label: "Banuba effect (.zip)", description: "Ready to load in any Banuba Face AR SDK (Web, iOS, Android, Flutter, React Native)." },
  { id: "bundle", label: "Portable bundle (.zip)", description: "Look + every asset + manifest. For other AR platforms and archives." },
] as const
export type LookExportTarget = (typeof LOOK_EXPORT_TARGETS)[number]["id"]

async function lookDocument(db: DB, brandId: string, lookId: string, source: "draft" | "published"): Promise<LookDocument> {
  const look = await repo.getLook(db, brandId, lookId)
  if (source === "draft") return look.draft
  if (!look.publishedVersion) throw new repo.Invalid("This look hasn't been published yet.")
  const versions = await repo.listVersions(db, lookId)
  return versions.find((v) => v.version === look.publishedVersion)!.document
}

/** Reads the bytes an asset reference points to (from storage when it's one of ours). */
async function readRef(db: DB, brandId: string, ref: AssetRef): Promise<Uint8Array> {
  if (ref.assetId) {
    const a = await repo.getAsset(db, brandId, ref.assetId).catch(() => null)
    if (a) return activeStorage().get(a.storageKey, a.url)
  }
  if (/^https?:\/\//.test(ref.url)) {
    const res = await fetch(ref.url)
    if (!res.ok) throw new Error(`Couldn't fetch ${ref.url} (HTTP ${res.status})`)
    return new Uint8Array(await res.arrayBuffer())
  }
  throw new Error(`Can't resolve asset ${ref.url}`)
}

const refsOf = (doc: LookDocument): AssetRef[] => doc.overlays.flatMap((o) => [o.asset, o.kind === "face_video" ? o.alpha : undefined]).filter((r): r is AssetRef => Boolean(r))

export async function exportLook(db: DB, brandId: string, lookId: string, target: LookExportTarget, source: "draft" | "published" = "published") {
  const doc = await lookDocument(db, brandId, lookId, source)
  const base = slugify(doc.name)
  if (target === "beautyos" || target === "banuba") {
    const r = getAdapter(target)!.export(doc)
    return { bytes: strToU8(r.content), mediaType: "application/json", fileName: getAdapter(target)!.fileName(doc), issues: r.issues }
  }
  if (target === "banuba-effect") {
    const r = getAdapter("banuba")!.export(doc)
    const files: Record<string, Uint8Array> = { "config.json": strToU8(r.content) }
    for (const f of r.files) {
      const ref = refsOf(doc).find((x) => x.url === f.url)
      files[f.path] = await readRef(db, brandId, ref ?? { url: f.url, mediaType: f.mediaType })
    }
    return { bytes: zipSync(files), mediaType: "application/zip", fileName: `${base}.banuba-effect.zip`, issues: r.issues }
  }
  // Portable bundle: the look with asset URLs rewritten to bundle paths, plus a manifest.
  const files: Record<string, Uint8Array> = {}
  const map = new Map<string, string>()
  for (const ref of refsOf(doc)) {
    if (map.has(ref.url)) continue
    const ext = ref.mediaType.split("/")[1].replace("jpeg", "jpg").replace("quicktime", "mov")
    const p = `assets/${(ref.sha256 ?? ref.assetId ?? String(map.size)).slice(0, 16)}.${ext}`
    files[p] = await readRef(db, brandId, ref)
    map.set(ref.url, p)
  }
  const rewritten = JSON.parse(JSON.stringify(doc), (k, v) => (k === "url" && typeof v === "string" && map.has(v) ? map.get(v) : v)) as LookDocument
  files["look.beautyos.json"] = strToU8(JSON.stringify(rewritten, null, 2))
  files["banuba/config.json"] = strToU8(getAdapter("banuba")!.export(doc).content)
  files["manifest.json"] = strToU8(
    JSON.stringify({ format: "beautyos.bundle", formatVersion: 1, look: "look.beautyos.json", exportedAt: new Date().toISOString(), assets: [...map.values()], platforms: { banuba: "banuba/config.json" } }, null, 2),
  )
  return { bytes: zipSync(files), mediaType: "application/zip", fileName: `${base}.beautyos-bundle.zip`, issues: [] }
}

// ---------- universal import ----------

export interface ImportResult {
  file: string
  kind: "look" | "library" | "asset" | "bundle" | "skipped"
  id?: string
  message: string
}

/** One entry point for drag-and-drop: routes each file by content. */
export async function importFile(db: DB, brandId: string, file: { name: string; bytes: Uint8Array }, opts: { enhance?: EnhancePreset } = {}): Promise<ImportResult> {
  const lower = file.name.toLowerCase()
  try {
    if (lower.endsWith(".ase")) {
      const { entries, errors } = parseAseLibrary(file.bytes.slice().buffer)
      const kind = /pantone/i.test(file.name) || entries.some((e) => /pantone/i.test(e.name)) ? "pantone" : "custom"
      const lib = await repo.createLibrary(db, brandId, { name: file.name.replace(/\.ase$/i, ""), kind, entries })
      return { file: file.name, kind: "library", id: lib.id, message: `${entries.length} colors imported${errors.length ? `, ${errors.length} skipped` : ""}.` }
    }
    if (lower.endsWith(".csv") || lower.endsWith(".tsv")) {
      const { entries, errors } = parseCsvLibrary(strFromU8(file.bytes))
      const kind = /pantone/i.test(file.name) || entries.some((e) => /pantone/i.test(e.name)) ? "pantone" : "custom"
      const lib = await repo.createLibrary(db, brandId, { name: file.name.replace(/\.[ct]sv$/i, ""), kind, entries })
      return { file: file.name, kind: "library", id: lib.id, message: `${entries.length} colors imported${errors.length ? `, ${errors.length} rows skipped` : ""}.` }
    }
    if (lower.endsWith(".json")) {
      const look = await repo.createLook(db, brandId, { document: JSON.parse(strFromU8(file.bytes)) })
      return { file: file.name, kind: "look", id: look.id, message: `Look "${look.name}" imported as a draft.` }
    }
    if (lower.endsWith(".zip")) return await importBundle(db, brandId, file)
    const { asset, duplicate } = await ingestAsset(db, brandId, file, opts)
    return { file: file.name, kind: "asset", id: asset.id, message: duplicate ? "Already in the library (same file)." : `${asset.kind === "video" ? "Video" : "Image"} processed (${asset.width}×${asset.height}).` }
  } catch (e) {
    const detail = e instanceof repo.Invalid && e.issues.length ? `: ${e.issues.map((i) => i.message).join("; ")}` : ""
    return { file: file.name, kind: "skipped", message: `${e instanceof Error ? e.message : String(e)}${detail}` }
  }
}

async function importBundle(db: DB, brandId: string, file: { name: string; bytes: Uint8Array }): Promise<ImportResult> {
  const entries = unzipSync(file.bytes)
  const lookFile = entries["look.beautyos.json"]
  if (!lookFile) throw new repo.Invalid("This zip isn't a Beauty OS bundle (no look.beautyos.json).")
  const doc = JSON.parse(strFromU8(lookFile)) as LookDocument
  // Re-ingest bundled assets and point the look at the new copies.
  const urlMap = new Map<string, AssetRef>()
  for (const [path, bytes] of Object.entries(entries)) {
    if (!path.startsWith("assets/")) continue
    const { asset } = await ingestAsset(db, brandId, { bytes, name: path.split("/").pop()! })
    urlMap.set(path, assetRef(asset))
  }
  const fixRef = (r?: AssetRef) => (r && urlMap.has(r.url) ? urlMap.get(r.url)! : r)
  const fixed = { ...doc, overlays: (doc.overlays ?? []).map((o) => ({ ...o, ...(o.asset ? { asset: fixRef(o.asset) } : {}), ...(o.kind === "face_video" && o.alpha ? { alpha: fixRef(o.alpha) } : {}) })) }
  const look = await repo.createLook(db, brandId, { document: fixed })
  return { file: file.name, kind: "bundle", id: look.id, message: `Look "${look.name}" and ${urlMap.size} asset(s) imported.` }
}

// ---------- synthetic models ----------

const ASPECT_SIZES: Record<string, [number, number]> = { "4:5": [1024, 1280], "1:1": [1024, 1024], "2:3": [1024, 1536], "9:16": [1024, 1792], "16:9": [1792, 1024] }

export async function generateModel(db: DB, brandId: string, specInput: ModelSpecInput, makeup: MakeupBrief = { mode: "bare" }) {
  const spec = ModelSpec.parse(specInput)
  const violation = likenessViolation(`${spec.notes} ${spec.label} ${makeup.description ?? ""}`)
  if (violation) throw new repo.Invalid(violation)
  const generator = modules().imageGenerators.preferred()
  if (!generator) {
    const info = modules().imageGenerators.list()[0]
    throw new repo.Invalid(`Image generation isn't configured. ${info?.requirement ?? ""}`)
  }
  const { prompt, negativePrompt } = compilePrompt(spec, makeup)
  const [width, height] = ASPECT_SIZES[spec.aspect]
  const img = await generator.generate({ prompt, negativePrompt, width, height, seed: spec.seed })
  // Enforce headroom regardless of how well the generator followed the framing instruction.
  const framed = await ensureHeadroom(img.bytes, { minTop: spec.headroom, aspect: spec.aspect })
  const provenance: Provenance = {
    synthetic: true,
    generator: generator.id,
    model: img.model,
    seed: img.seed,
    prompt,
    spec: spec as unknown as Record<string, unknown>,
    ...(makeup.mode === "look" ? { look: { name: makeup.description ?? "look", method: "generated" as const } } : {}),
    createdAt: new Date().toISOString(),
  }
  const { asset } = await ingestAsset(db, brandId, { bytes: framed.bytes, name: `${spec.label}.png` }, { provenance, displayName: `${spec.label} · ${makeup.mode === "bare" ? "bare face" : "makeup"}` })
  return { asset, headroomAddedPx: framed.addedPx }
}

/** Saves a browser-rendered "model wearing look" frame (the AR engine applied to a synthetic model photo). */
export async function saveModelRender(db: DB, brandId: string, input: { bytes: Uint8Array; modelAssetId: string; lookId?: string; lookName: string }) {
  const model = await repo.getAsset(db, brandId, input.modelAssetId)
  const base = model.provenance
  const provenance: Provenance | undefined = base ? { ...base, look: { id: input.lookId, name: input.lookName, method: "ar-engine" }, createdAt: new Date().toISOString() } : undefined
  return ingestAsset(db, brandId, { bytes: input.bytes, name: `${model.name} · ${input.lookName}.png` }, { provenance, displayName: `${model.name.replace(/ · .*$/, "")} · ${input.lookName}` })
}

export const formatProfileError = (e: unknown) => (e instanceof Error ? e.message : String(e))
export { validateLook }
