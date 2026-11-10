import "server-only"
// Composition guarantees for generated imagery. Generators don't always obey framing instructions,
// so headroom is enforced in post: the top of the frame is extended with a soft continuation of
// the background until the requested negative space exists, then the image is fitted to its aspect.
import sharp from "sharp"
import { parseRatio } from "@/lib/export-profiles"

/** Estimates how many rows at the top are plain background (low detail, close to the edge color). */
export async function measureTopSpace(bytes: Uint8Array): Promise<number> {
  const { data, info } = await sharp(bytes).resize({ width: 96 }).greyscale().raw().toBuffer({ resolveWithObject: true })
  const w = info.width, h = info.height
  const ref = data.subarray(0, w).reduce((a, b) => a + b, 0) / w
  for (let y = 0; y < h; y++) {
    const row = data.subarray(y * w, (y + 1) * w)
    const mean = row.reduce((a, b) => a + b, 0) / w
    const spread = Math.sqrt(row.reduce((a, b) => a + (b - mean) ** 2, 0) / w)
    if (Math.abs(mean - ref) > 14 || spread > 18) return y / h
  }
  return 1
}

/**
 * Ensures at least `minTop` (fraction of final height) of clean space above the subject and returns
 * an image at `aspect`. Extension mirrors and heavily blurs the top band so studio backdrops continue
 * naturally; it never paints over the subject.
 */
export async function ensureHeadroom(bytes: Uint8Array, opts: { minTop: number; aspect: string }): Promise<{ bytes: Uint8Array; addedPx: number; measured: number }> {
  const meta = await sharp(bytes).metadata()
  const W = meta.width!, H = meta.height!
  const measured = await measureTopSpace(bytes)
  const target = parseRatio(opts.aspect)
  // Final height if we only extend upward to reach the target space.
  const haveTop = measured * H
  const needTop = (opts.minTop * H - haveTop) / (1 - opts.minTop)
  const addTop = Math.max(0, Math.ceil(needTop))

  let img = sharp(bytes)
  let cur = { w: W, h: H }
  if (addTop > 0) {
    // Continue the backdrop with the color sampled from the top corners (where the subject isn't),
    // with a soft vertical blend into the original so there is no visible seam.
    const corner = Math.max(4, Math.round(W * 0.08))
    const strip = await sharp(bytes).extract({ left: 0, top: 0, width: W, height: Math.max(2, Math.round(H * 0.02)) }).removeAlpha().raw().toBuffer()
    const rows = strip.length / (W * 3)
    let r = 0, g = 0, b = 0, n = 0
    for (let y = 0; y < rows; y++) for (const x0 of [0, W - corner]) for (let x = x0; x < x0 + corner; x++) {
      const o = (y * W + x) * 3
      r += strip[o]; g += strip[o + 1]; b += strip[o + 2]; n++
    }
    const bg = { r: Math.round(r / n), g: Math.round(g / n), b: Math.round(b / n) }
    const feather = Math.min(addTop, Math.round(H * 0.04))
    const fade = Buffer.from(`<svg width="${W}" height="${feather}"><defs><linearGradient id="f" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="rgb(${bg.r},${bg.g},${bg.b})" stop-opacity="1"/><stop offset="1" stop-color="rgb(${bg.r},${bg.g},${bg.b})" stop-opacity="0"/></linearGradient></defs><rect width="100%" height="100%" fill="url(#f)"/></svg>`)
    const extended = await sharp({ create: { width: W, height: H + addTop, channels: 3, background: bg } })
      .composite([{ input: await sharp(bytes).removeAlpha().toBuffer(), top: addTop, left: 0 }, { input: fade, top: addTop, left: 0 }])
      .png()
      .toBuffer()
    img = sharp(extended)
    cur = { w: W, h: H + addTop }
  }
  // Fit to aspect without losing headroom: too wide -> crop the sides; too tall -> crop from the bottom
  // (the top, with its negative space, is always kept).
  const ratio = cur.w / cur.h
  let out: Buffer
  if (ratio > target + 0.005) {
    const newW = Math.round(cur.h * target)
    out = await img.extract({ left: Math.round((cur.w - newW) / 2), top: 0, width: newW, height: cur.h }).png().toBuffer()
  } else if (ratio < target - 0.005) {
    out = await img.extract({ left: 0, top: 0, width: cur.w, height: Math.round(cur.w / target) }).png().toBuffer()
  } else out = await img.png().toBuffer()
  return { bytes: new Uint8Array(out), addedPx: addTop, measured }
}
