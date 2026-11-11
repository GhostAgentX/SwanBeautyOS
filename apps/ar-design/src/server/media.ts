import "server-only"
// Media processing for the asset pipeline: probing, normalization, enhancement, thumbnails,
// palettes and format conversion. Images use sharp (libvips); video uses ffmpeg.
import { extractPalette } from "@beautyos/color-lab"
import { spawn } from "node:child_process"
import { createHash } from "node:crypto"
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises"
import os from "node:os"
import path from "node:path"
import sharp, { type Sharp } from "sharp"
import { ImageProfile, VideoProfile, resolveSize, type ExportProfileInput } from "@/lib/export-profiles"

export const LIMITS = { imageBytes: 40 * 1024 * 1024, videoBytes: 300 * 1024 * 1024, maxImageSide: 8192, maxVideoSide: 1920 }

export const ENHANCE_PRESETS = ["none", "natural", "crisp", "hyperreal"] as const
export type EnhancePreset = (typeof ENHANCE_PRESETS)[number]


export class MediaError extends Error {}

export const sha256 = (bytes: Uint8Array) => createHash("sha256").update(bytes).digest("hex")

/** Identifies the file from its bytes (never trust the extension or the browser's MIME type). */
export function sniff(bytes: Uint8Array): { kind: "image" | "video"; mediaType: string } | null {
  const ascii = (o: number, n: number) => String.fromCharCode(...bytes.subarray(o, o + n))
  if (bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) return { kind: "image", mediaType: "image/jpeg" }
  if (ascii(1, 3) === "PNG") return { kind: "image", mediaType: "image/png" }
  if (ascii(0, 4) === "RIFF" && ascii(8, 4) === "WEBP") return { kind: "image", mediaType: "image/webp" }
  if (ascii(0, 3) === "GIF") return { kind: "image", mediaType: "image/gif" }
  if (ascii(0, 2) === "II" || ascii(0, 2) === "MM") return { kind: "image", mediaType: "image/tiff" }
  if (ascii(4, 4) === "ftyp") {
    const brand = ascii(8, 4)
    if (/avif|avis/.test(brand)) return { kind: "image", mediaType: "image/avif" }
    if (/heic|heix|mif1|msf1/.test(brand)) return { kind: "image", mediaType: "image/heic" }
    if (brand === "qt  ") return { kind: "video", mediaType: "video/quicktime" }
    return { kind: "video", mediaType: "video/mp4" }
  }
  if (bytes[0] === 0x1a && bytes[1] === 0x45 && bytes[2] === 0xdf && bytes[3] === 0xa3) return { kind: "video", mediaType: "video/webm" }
  return null
}

// ---------- images ----------

export function enhance(img: Sharp, preset: EnhancePreset): Sharp {
  switch (preset) {
    case "none":
      return img
    case "natural": // gentle auto-levels and micro-sharpening
      return img.normalise({ lower: 0.5, upper: 99.5 }).sharpen({ sigma: 0.6 })
    case "crisp": // local contrast + detail
      return img.clahe({ width: 96, height: 96, maxSlope: 2 }).sharpen({ sigma: 0.9, m1: 0.8, m2: 1.6 })
    case "hyperreal": // stronger local contrast, texture and color depth (skin pores, lash detail, product texture)
      return img
        .clahe({ width: 64, height: 64, maxSlope: 3 })
        .modulate({ saturation: 1.12, brightness: 1.02 })
        .sharpen({ sigma: 1.1, m1: 1, m2: 2.2 })
  }
}

export interface ProcessedImage {
  bytes: Uint8Array
  mediaType: "image/png" | "image/jpeg"
  width: number
  height: number
  hasAlpha: boolean
  thumbnail: Uint8Array
  palette: { hex: string; share: number }[]
  steps: string[]
}

export async function processImage(input: Uint8Array, preset: EnhancePreset = "none"): Promise<ProcessedImage> {
  const meta = await sharp(input, { failOn: "error" }).metadata().catch(() => {
    throw new MediaError("This image file is damaged or in an unsupported format.")
  })
  if (!meta.width || !meta.height) throw new MediaError("Couldn't read the image dimensions.")
  const hasAlpha = Boolean(meta.hasAlpha)
  const steps = ["auto-orient", "strip-metadata", "srgb"]
  let img = sharp(input, { failOn: "error" }).rotate().toColourspace("srgb")
  if (Math.max(meta.width, meta.height) > LIMITS.maxImageSide) {
    img = img.resize({ width: LIMITS.maxImageSide, height: LIMITS.maxImageSide, fit: "inside", withoutEnlargement: true })
    steps.push(`resize:${LIMITS.maxImageSide}`)
  }
  if (preset !== "none") steps.push(`enhance:${preset}`)
  img = enhance(img, preset)
  // PNG keeps alpha (overlays, frames); everything else is a high-quality JPEG (4:4:4, no chroma loss).
  const out = hasAlpha
    ? await img.png({ compressionLevel: 9 }).toBuffer({ resolveWithObject: true })
    : await img.jpeg({ quality: 94, chromaSubsampling: "4:4:4", mozjpeg: true }).toBuffer({ resolveWithObject: true })
  const thumbnail = await sharp(out.data).resize({ width: 480, height: 480, fit: "inside" }).webp({ quality: 82 }).toBuffer()
  const small = await sharp(out.data).resize({ width: 160, height: 160, fit: "inside" }).ensureAlpha().raw().toBuffer({ resolveWithObject: true })
  const palette = extractPalette(small.data, small.info.width, small.info.height, { colors: 6 }).map(({ hex, share }) => ({ hex, share }))
  return {
    bytes: new Uint8Array(out.data),
    mediaType: hasAlpha ? "image/png" : "image/jpeg",
    width: out.info.width,
    height: out.info.height,
    hasAlpha,
    thumbnail: new Uint8Array(thumbnail),
    palette,
    steps,
  }
}

/** Renders an image deliverable to an export profile (size, ratio, fit, format, DPI, color space, bit depth, size cap). */
export async function renderImage(input: Uint8Array, profileInput: ExportProfileInput): Promise<Rendered> {
  const profile = ImageProfile.parse(profileInput)
  const meta = await sharp(input).rotate().metadata()
  const oriented = meta.orientation && meta.orientation >= 5 ? { width: meta.height!, height: meta.width! } : { width: meta.width!, height: meta.height! }
  const size = resolveSize(profile, oriented)
  const notes: string[] = []
  if (size.upscaled) notes.push("Upscaled beyond the source resolution.")
  // Setting DPI writes EXIF, which would carry the source's EXIF (names, GPS) along with it. When stripping,
  // decode once to a metadata-free lossless intermediate (keeps alpha and 16-bit depth) and render from that.
  const source = profile.stripMetadata ? new Uint8Array(await sharp(input).rotate().png({ compressionLevel: 0 }).toBuffer()) : input

  const build = (quality: number) => {
    let img = enhance(profile.stripMetadata ? sharp(source) : sharp(source).rotate().keepMetadata(), profile.enhance)
    img = img.resize({
      width: size.width,
      height: size.height,
      fit: profile.fit === "cover" ? "cover" : "contain",
      position: profile.anchor === "entropy" ? sharp.strategy.entropy : profile.anchor === "attention" ? sharp.strategy.attention : profile.anchor === "center" ? "centre" : profile.anchor,
      background: profile.padColor,
      kernel: "lanczos3",
      withoutEnlargement: false,
    })
    const alpha = profile.keepAlpha && ["png", "webp", "avif", "tiff"].includes(profile.format)
    if (!alpha) img = img.flatten({ background: profile.padColor })
    const deep = profile.bitDepth === 16 && (profile.format === "png" || profile.format === "tiff") && profile.colorSpace !== "cmyk"
    img = img.withDensity(profile.dpi)
    // ICC conversion: CMYK/P3 embed the target profile; sRGB is the web default.
    img = profile.colorSpace === "cmyk" ? img.withIccProfile("cmyk") : profile.colorSpace === "p3" ? img.withIccProfile("p3") : img.toColourspace(deep ? "rgb16" : "srgb")
    switch (profile.format) {
      case "jpeg": return img.jpeg({ quality, chromaSubsampling: quality >= 90 ? "4:4:4" : "4:2:0", mozjpeg: true })
      case "png": return img.png({ compressionLevel: 9 })
      case "webp": return img.webp({ quality, lossless: quality >= 100, alphaQuality: 100 })
      case "avif": return img.avif({ quality: Math.min(quality, 90), bitdepth: profile.bitDepth === 16 ? 10 : 8 })
      case "tiff": return img.tiff({ compression: "lzw", resolutionUnit: "inch" })
    }
  }

  if (profile.colorSpace === "cmyk" && !["jpeg", "tiff"].includes(profile.format)) throw new MediaError("CMYK output is supported for JPEG and TIFF only.")
  let quality = profile.quality
  let out = await build(quality).toBuffer({ resolveWithObject: true })
  if (profile.maxBytes && ["jpeg", "webp", "avif"].includes(profile.format)) {
    while (out.data.length > profile.maxBytes && quality > 40) {
      quality -= 5
      out = await build(quality).toBuffer({ resolveWithObject: true })
    }
    if (out.data.length > profile.maxBytes) notes.push(`Couldn't reach ${Math.round(profile.maxBytes / 1000)} KB without dropping below quality 40.`)
    else if (quality !== profile.quality) notes.push(`Quality lowered to ${quality} to fit ${Math.round(profile.maxBytes / 1000)} KB.`)
  } else if (profile.maxBytes && out.data.length > profile.maxBytes) notes.push(`${profile.format.toUpperCase()} is lossless here, so the size cap couldn't be applied.`)
  if (profile.colorSpace === "cmyk") notes.push("CMYK uses a generic profile; for press-accurate color, convert with your printer's ICC profile.")

  const ext = profile.format === "jpeg" ? "jpg" : profile.format
  return { bytes: new Uint8Array(out.data), mediaType: `image/${profile.format}`, ext, width: out.info.width, height: out.info.height, notes }
}

export interface Rendered {
  bytes: Uint8Array
  mediaType: string
  ext: string
  width: number
  height: number
  notes: string[]
}

// ---------- video ----------

async function ffmpegPath(): Promise<string> {
  if (process.env.FFMPEG_PATH) return process.env.FFMPEG_PATH
  try {
    const mod = (await import("ffmpeg-static")) as unknown as { default: string | null }
    if (mod.default) return mod.default
  } catch {}
  return "ffmpeg"
}

function run(bin: string, args: string[]): Promise<string> {
  return new Promise((resolve, reject) => {
    const p = spawn(bin, args, { stdio: ["ignore", "ignore", "pipe"] })
    let err = ""
    p.stderr.on("data", (d) => (err = (err + d).slice(-8000)))
    p.on("error", reject)
    p.on("close", (code) => (code === 0 ? resolve(err) : reject(new MediaError(`ffmpeg failed (${code}): ${err.split("\n").slice(-4).join(" ")}`))))
  })
}

async function withTemp<T>(fn: (dir: string) => Promise<T>): Promise<T> {
  const dir = await mkdtemp(path.join(os.tmpdir(), "beautyos-"))
  try {
    return await fn(dir)
  } finally {
    await rm(dir, { recursive: true, force: true })
  }
}

export interface ProcessedVideo {
  bytes: Uint8Array
  mediaType: "video/mp4"
  width: number
  height: number
  durationMs: number
  poster: Uint8Array
  thumbnail: Uint8Array
  palette: { hex: string; share: number }[]
  steps: string[]
}

/** Transcodes to H.264/AAC MP4 (the AR engine's recommended video format), capped at 1080p, with fast start. */
export async function processVideo(input: Uint8Array): Promise<ProcessedVideo> {
  const bin = await ffmpegPath()
  return withTemp(async (dir) => {
    const src = path.join(dir, "in")
    const out = path.join(dir, "out.mp4")
    const poster = path.join(dir, "poster.png")
    await writeFile(src, input)
    const scale = `scale='if(gt(iw,ih),min(${LIMITS.maxVideoSide},iw),-2)':'if(gt(iw,ih),-2,min(${LIMITS.maxVideoSide},ih))':flags=lanczos,scale=trunc(iw/2)*2:trunc(ih/2)*2`
    const log = await run(bin, ["-y", "-i", src, "-map", "0:v:0", "-map", "0:a:0?", "-vf", scale, "-c:v", "libx264", "-profile:v", "high", "-pix_fmt", "yuv420p", "-preset", "medium", "-crf", "18", "-c:a", "aac", "-b:a", "160k", "-movflags", "+faststart", out])
    await run(bin, ["-y", "-ss", "0.5", "-i", out, "-frames:v", "1", poster]).catch(() => run(bin, ["-y", "-i", out, "-frames:v", "1", poster]))
    const dur = /Duration: (\d+):(\d+):(\d+\.\d+)/.exec(log)
    const durationMs = dur ? Math.round(((+dur[1] * 60 + +dur[2]) * 60 + +dur[3]) * 1000) : 0
    const posterBytes = await readFile(poster)
    const meta = await sharp(posterBytes).metadata()
    const thumbnail = await sharp(posterBytes).resize({ width: 480, height: 480, fit: "inside" }).webp({ quality: 82 }).toBuffer()
    const small = await sharp(posterBytes).resize({ width: 160, height: 160, fit: "inside" }).ensureAlpha().raw().toBuffer({ resolveWithObject: true })
    return {
      bytes: new Uint8Array(await readFile(out)),
      mediaType: "video/mp4" as const,
      width: meta.width ?? 0,
      height: meta.height ?? 0,
      durationMs,
      poster: new Uint8Array(posterBytes),
      thumbnail: new Uint8Array(thumbnail),
      palette: extractPalette(small.data, small.info.width, small.info.height, { colors: 6 }).map(({ hex, share }) => ({ hex, share })),
      steps: ["transcode:h264-aac", `max:${LIMITS.maxVideoSide}p`, "faststart", "poster"],
    }
  })
}

/** Renders a video deliverable to an export profile (size, ratio, fit, codec, fps, bitrate, trim, size cap). */
export async function renderVideo(input: Uint8Array, profileInput: ExportProfileInput): Promise<Rendered> {
  const profile = VideoProfile.parse(profileInput)
  const bin = await ffmpegPath()
  return withTemp(async (dir) => {
    const src = path.join(dir, "in.mp4")
    await writeFile(src, input)
    const probe = await run(bin, ["-i", src, "-f", "null", "-t", "0", "-"]).catch((e: Error) => e.message)
    const dim = /, (\d{2,5})x(\d{2,5})[, ]/.exec(probe)
    const dur = /Duration: (\d+):(\d+):(\d+\.\d+)/.exec(probe)
    const durationS = dur ? (+dur[1] * 60 + +dur[2]) * 60 + +dur[3] : 0
    if (!dim) throw new MediaError("Couldn't read the video dimensions.")
    const size = resolveSize(profile, { width: +dim[1], height: +dim[2] })
    const even = (n: number) => Math.max(2, Math.round(n / 2) * 2)
    const W = even(size.width), H = even(size.height)
    const notes: string[] = size.upscaled ? ["Upscaled beyond the source resolution."] : []

    const fit =
      profile.fit === "cover"
        ? `scale=${W}:${H}:force_original_aspect_ratio=increase:flags=lanczos,crop=${W}:${H}:(iw-${W})/2:${profile.anchor === "top" ? 0 : profile.anchor === "bottom" ? `ih-${H}` : `(ih-${H})/2`}`
        : profile.fit === "pad"
          ? `scale=${W}:${H}:force_original_aspect_ratio=decrease:flags=lanczos,pad=${W}:${H}:(ow-iw)/2:(oh-ih)/2:color=${profile.padColor}`
          : `scale=${W}:${H}:flags=lanczos`
    const filters = [fit, profile.fps ? `fps=${profile.fps}` : ""].filter(Boolean).join(",")
    const trim = [...(profile.trimStart ? ["-ss", String(profile.trimStart)] : []), ...(profile.trimDuration ? ["-t", String(profile.trimDuration)] : [])]
    const seconds = profile.trimDuration ?? Math.max(0.1, durationS - (profile.trimStart ?? 0))

    let bitrate = profile.bitrateKbps
    if (profile.maxBytes && profile.format !== "gif") {
      // Budget the bitrate so the file fits: total bits / duration, minus audio, with 5% container overhead.
      const budget = Math.floor(((profile.maxBytes * 8 * 0.95) / seconds - (profile.audio ? 128_000 : 0)) / 1000)
      if (budget < 150) throw new MediaError(`A ${Math.round(seconds)}s video can't fit in ${Math.round(profile.maxBytes / 1000)} KB.`)
      if (!bitrate || bitrate > budget) { bitrate = budget; notes.push(`Bitrate set to ${budget} kbit/s to fit the size cap.`) }
    }
    const rate = bitrate ? ["-b:v", `${bitrate}k`, "-maxrate", `${Math.round(bitrate * 1.5)}k`, "-bufsize", `${bitrate * 2}k`] : []
    const audio = (codec: string) => (profile.audio ? ["-c:a", codec, "-b:a", "128k"] : ["-an"])

    let args: string[]
    let ext: string, mediaType: string
    switch (profile.format) {
      case "mp4":
      case "mov":
        args = ["-vf", filters, "-c:v", "libx264", "-profile:v", profile.h264Profile, "-pix_fmt", "yuv420p", ...(bitrate ? rate : ["-crf", String(profile.crf)]), ...audio("aac"), ...(profile.format === "mp4" ? ["-movflags", "+faststart"] : [])]
        ;[ext, mediaType] = profile.format === "mp4" ? ["mp4", "video/mp4"] : ["mov", "video/quicktime"]
        break
      case "webm":
        args = ["-vf", filters, "-c:v", "libvpx-vp9", "-row-mt", "1", ...(bitrate ? rate : ["-crf", String(Math.max(profile.crf, 15)), "-b:v", "0"]), ...audio("libopus")]
        ;[ext, mediaType] = ["webm", "video/webm"]
        break
      case "gif":
        args = ["-vf", `${fit},fps=${profile.fps ?? 15},split[a][b];[a]palettegen=stats_mode=diff[p];[b][p]paletteuse=dither=sierra2_4a`, "-loop", "0"]
        ;[ext, mediaType] = ["gif", "image/gif"]
        break
    }
    const out = path.join(dir, `out.${ext}`)
    await run(bin, ["-y", ...trim, "-i", src, ...args, out])
    const bytes = new Uint8Array(await readFile(out))
    if (profile.maxBytes && bytes.length > profile.maxBytes) notes.push(`Result is ${Math.round(bytes.length / 1000)} KB, above the ${Math.round(profile.maxBytes / 1000)} KB cap.`)
    return { bytes, mediaType, ext, width: W, height: H, notes }
  })
}

/** Still frame from a video, rendered through an image profile. */
export async function renderPoster(input: Uint8Array, profileInput: ExportProfileInput, at = 0.5): Promise<Rendered> {
  const bin = await ffmpegPath()
  const frame = await withTemp(async (dir) => {
    const src = path.join(dir, "in.mp4"), out = path.join(dir, "frame.png")
    await writeFile(src, input)
    await run(bin, ["-y", "-ss", String(at), "-i", src, "-frames:v", "1", out]).catch(() => run(bin, ["-y", "-i", src, "-frames:v", "1", out]))
    return new Uint8Array(await readFile(out))
  })
  return renderImage(frame, profileInput)
}
