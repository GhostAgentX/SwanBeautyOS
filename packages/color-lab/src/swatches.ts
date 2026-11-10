// Extracts colors from photos of makeup chips, swatches, palettes or product shots.
// Works on raw RGBA pixels, so it runs in the browser (canvas) and on the server (sharp raw output).
import { deltaE2000 as deltaE, hexToLab, oklabToRgb, rgbToHex, rgbToLab, rgbToOklab, type OkLab } from "./color"

export interface ExtractedColor {
  hex: string
  /** Share of the analyzed (non-background) pixels, 0..1 */
  share: number
  lab: { L: number; a: number; b: number }
}

export interface AnalyzeOptions {
  /** Number of colors to find. */
  colors?: number
  /** Max pixels to sample (performance). */
  sample?: number
  /** Ignore near-white paper/background and deep shadows. */
  ignoreBackground?: boolean
  /** Merge clusters closer than this ΔE2000. */
  mergeBelow?: number
}

/** Deterministic PRNG so the same image always yields the same palette. */
function mulberry32(seed: number) {
  return () => {
    seed |= 0
    seed = (seed + 0x6d2b79f5) | 0
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

const dist2 = (p: OkLab, q: OkLab) => (p.L - q.L) ** 2 + (p.a - q.a) ** 2 + (p.b - q.b) ** 2

/** k-means++ in OKLab over sampled pixels. */
export function extractPalette(rgba: ArrayLike<number>, width: number, height: number, opts: AnalyzeOptions = {}): ExtractedColor[] {
  const k = opts.colors ?? 6
  const maxSample = opts.sample ?? 20000
  const ignoreBg = opts.ignoreBackground ?? true
  const total = width * height
  const step = Math.max(1, Math.floor(total / maxSample))
  const rand = mulberry32(total * 31 + k)

  const points: OkLab[] = []
  for (let i = 0; i < total; i += step) {
    const o = i * 4
    if (rgba[o + 3] < 200) continue // transparent
    const rgb = { r: rgba[o], g: rgba[o + 1], b: rgba[o + 2] }
    if (ignoreBg) {
      const lab = rgbToLab(rgb)
      const chroma = Math.hypot(lab.a, lab.b)
      if ((lab.L > 93 && chroma < 8) || lab.L < 6) continue // paper/white card, deep shadow
    }
    points.push(rgbToOklab(rgb))
  }
  if (!points.length) return []

  // k-means++ seeding
  const centers: OkLab[] = [points[Math.floor(rand() * points.length)]]
  while (centers.length < Math.min(k, points.length)) {
    const d = points.map((p) => Math.min(...centers.map((c) => dist2(p, c))))
    const sum = d.reduce((a, b) => a + b, 0)
    if (sum === 0) break
    let r = rand() * sum
    let idx = 0
    while ((r -= d[idx]) > 0 && idx < d.length - 1) idx++
    centers.push(points[idx])
  }

  const assign = new Int32Array(points.length)
  for (let iter = 0; iter < 25; iter++) {
    let moved = false
    for (let i = 0; i < points.length; i++) {
      let best = 0, bestD = Infinity
      for (let c = 0; c < centers.length; c++) {
        const dd = dist2(points[i], centers[c])
        if (dd < bestD) { bestD = dd; best = c }
      }
      if (assign[i] !== best) { assign[i] = best; moved = true }
    }
    const sums = centers.map(() => ({ L: 0, a: 0, b: 0, n: 0 }))
    points.forEach((p, i) => { const s = sums[assign[i]]; s.L += p.L; s.a += p.a; s.b += p.b; s.n++ })
    sums.forEach((s, c) => { if (s.n) centers[c] = { L: s.L / s.n, a: s.a / s.n, b: s.b / s.n } })
    if (!moved && iter > 0) break
  }

  const counts = centers.map((_, c) => 0 + Array.prototype.filter.call(assign, (a: number) => a === c).length)
  let colors = centers
    .map((c, i) => {
      const hex = rgbToHex(oklabToRgb(c))
      return { hex, share: counts[i] / points.length, lab: hexToLab(hex) }
    })
    .filter((c) => c.share > 0)
    .sort((a, b) => b.share - a.share)

  // Merge near-duplicates (same chip lit unevenly).
  const merge = opts.mergeBelow ?? 4
  const out: ExtractedColor[] = []
  for (const c of colors) {
    const twin = out.find((o) => deltaE(o.lab, c.lab) < merge)
    if (twin) twin.share += c.share
    else out.push({ ...c })
  }
  colors = out
  return colors.map((c) => ({ ...c, share: Math.round(c.share * 1000) / 1000, lab: round3(c.lab) }))
}

/**
 * Reads a grid of color chips (e.g. a printed shade card): returns the median color of the central
 * 50% of each cell, which avoids borders, labels and glare at the edges.
 */
export function sampleChipGrid(rgba: ArrayLike<number>, width: number, height: number, rows: number, cols: number): string[][] {
  const grid: string[][] = []
  for (let r = 0; r < rows; r++) {
    const row: string[] = []
    for (let c = 0; c < cols; c++) {
      const x0 = Math.floor(((c + 0.25) * width) / cols), x1 = Math.ceil(((c + 0.75) * width) / cols)
      const y0 = Math.floor(((r + 0.25) * height) / rows), y1 = Math.ceil(((r + 0.75) * height) / rows)
      const rs: number[] = [], gs: number[] = [], bs: number[] = []
      for (let y = y0; y < y1; y++) for (let x = x0; x < x1; x++) {
        const o = (y * width + x) * 4
        rs.push(rgba[o]); gs.push(rgba[o + 1]); bs.push(rgba[o + 2])
      }
      const med = (v: number[]) => v.sort((a, b) => a - b)[Math.floor(v.length / 2)] ?? 0
      row.push(rgbToHex({ r: med(rs), g: med(gs), b: med(bs) }))
    }
    grid.push(row)
  }
  return grid
}

const round3 = (l: { L: number; a: number; b: number }) => ({ L: Math.round(l.L * 10) / 10, a: Math.round(l.a * 10) / 10, b: Math.round(l.b * 10) / 10 })
