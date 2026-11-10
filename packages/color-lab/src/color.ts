// Color science: sRGB <-> linear <-> CIE XYZ (D65) <-> CIELAB/LCh, OKLab/OKLCh, CMYK, and CIEDE2000.
// Reference formulas: IEC 61966-2-1 (sRGB), CIE 15:2004 (Lab), Björn Ottosson (OKLab), Sharma et al. 2005 (ΔE2000).

export interface Rgb { r: number; g: number; b: number } // 0..255
export interface Lab { L: number; a: number; b: number }
export interface Lch { L: number; C: number; h: number } // h in degrees 0..360
export interface Cmyk { c: number; m: number; y: number; k: number } // 0..100

const clamp = (n: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, n))
const deg = (rad: number) => (rad * 180) / Math.PI
const rad = (d: number) => (d * Math.PI) / 180

// ---------- hex ----------

export function hexToRgb(hex: string): Rgb {
  const m = /^#?([0-9a-f]{3}|[0-9a-f]{6})$/i.exec(hex.trim())
  if (!m) throw new Error(`Invalid hex color: ${hex}`)
  let h = m[1]
  if (h.length === 3) h = h.split("").map((c) => c + c).join("")
  const n = parseInt(h, 16)
  return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 }
}

export function rgbToHex({ r, g, b }: Rgb): string {
  const to = (v: number) => Math.round(clamp(v, 0, 255)).toString(16).padStart(2, "0")
  return `#${to(r)}${to(g)}${to(b)}`
}

// ---------- sRGB transfer ----------

const toLinear = (v: number) => {
  const c = v / 255
  return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4
}
const fromLinear = (c: number) => 255 * (c <= 0.0031308 ? 12.92 * c : 1.055 * c ** (1 / 2.4) - 0.055)

// ---------- CIE XYZ / Lab (D65) ----------

const WHITE = { X: 0.95047, Y: 1.0, Z: 1.08883 }
const EPS = 216 / 24389
const KAPPA = 24389 / 27

export function rgbToXyz({ r, g, b }: Rgb) {
  const R = toLinear(r), G = toLinear(g), B = toLinear(b)
  return {
    X: 0.4124564 * R + 0.3575761 * G + 0.1804375 * B,
    Y: 0.2126729 * R + 0.7151522 * G + 0.072175 * B,
    Z: 0.0193339 * R + 0.119192 * G + 0.9503041 * B,
  }
}

export function xyzToRgb({ X, Y, Z }: { X: number; Y: number; Z: number }): Rgb {
  const R = 3.2404542 * X - 1.5371385 * Y - 0.4985314 * Z
  const G = -0.969266 * X + 1.8760108 * Y + 0.041556 * Z
  const B = 0.0556434 * X - 0.2040259 * Y + 1.0572252 * Z
  return { r: fromLinear(clamp(R, 0, 1)), g: fromLinear(clamp(G, 0, 1)), b: fromLinear(clamp(B, 0, 1)) }
}

export function rgbToLab(rgb: Rgb): Lab {
  const { X, Y, Z } = rgbToXyz(rgb)
  const f = (t: number) => (t > EPS ? Math.cbrt(t) : (KAPPA * t + 16) / 116)
  const fx = f(X / WHITE.X), fy = f(Y / WHITE.Y), fz = f(Z / WHITE.Z)
  return { L: 116 * fy - 16, a: 500 * (fx - fy), b: 200 * (fy - fz) }
}

export function labToRgb({ L, a, b }: Lab): Rgb {
  const fy = (L + 16) / 116
  const fx = fy + a / 500
  const fz = fy - b / 200
  const inv = (t: number) => (t ** 3 > EPS ? t ** 3 : (116 * t - 16) / KAPPA)
  return xyzToRgb({ X: WHITE.X * inv(fx), Y: WHITE.Y * (L > KAPPA * EPS ? fy ** 3 : L / KAPPA), Z: WHITE.Z * inv(fz) })
}

export const labToLch = ({ L, a, b }: Lab): Lch => ({ L, C: Math.hypot(a, b), h: (deg(Math.atan2(b, a)) + 360) % 360 })
export const lchToLab = ({ L, C, h }: Lch): Lab => ({ L, a: C * Math.cos(rad(h)), b: C * Math.sin(rad(h)) })

export const hexToLab = (hex: string) => rgbToLab(hexToRgb(hex))
export const labToHex = (lab: Lab) => rgbToHex(labToRgb(lab))
export const hexToLch = (hex: string) => labToLch(hexToLab(hex))
export const lchToHex = (lch: Lch) => labToHex(lchToLab(lch))

/** True when a Lab color survives the trip to sRGB without clipping (within 0.5 channel units). */
export function inSrgbGamut(lab: Lab): boolean {
  const fy = (lab.L + 16) / 116
  const X = WHITE.X * (fy + lab.a / 500) ** 3, Y = WHITE.Y * fy ** 3, Z = WHITE.Z * (fy - lab.b / 200) ** 3
  const lin = [
    3.2404542 * X - 1.5371385 * Y - 0.4985314 * Z,
    -0.969266 * X + 1.8760108 * Y + 0.041556 * Z,
    0.0556434 * X - 0.2040259 * Y + 1.0572252 * Z,
  ]
  return lin.every((c) => c >= -0.002 && c <= 1.002)
}

/** Brings an LCh color into sRGB by reducing chroma (keeps lightness and hue, which matter most for skin). */
export function fitToGamut(lch: Lch): Lch {
  if (inSrgbGamut(lchToLab(lch))) return lch
  let lo = 0, hi = lch.C
  for (let i = 0; i < 20; i++) {
    const mid = (lo + hi) / 2
    if (inSrgbGamut(lchToLab({ ...lch, C: mid }))) lo = mid
    else hi = mid
  }
  return { ...lch, C: lo }
}

// ---------- OKLab (perceptually uniform; used for clustering) ----------

export interface OkLab { L: number; a: number; b: number }

export function rgbToOklab({ r, g, b }: Rgb): OkLab {
  const R = toLinear(r), G = toLinear(g), B = toLinear(b)
  const l = Math.cbrt(0.4122214708 * R + 0.5363325363 * G + 0.0514459929 * B)
  const m = Math.cbrt(0.2119034982 * R + 0.6806995451 * G + 0.1073969566 * B)
  const s = Math.cbrt(0.0883024619 * R + 0.2817188376 * G + 0.6299787005 * B)
  return {
    L: 0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s,
    a: 1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s,
    b: 0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s,
  }
}

export function oklabToRgb({ L, a, b }: OkLab): Rgb {
  const l = (L + 0.3963377774 * a + 0.2158037573 * b) ** 3
  const m = (L - 0.1055613458 * a - 0.0638541728 * b) ** 3
  const s = (L - 0.0894841775 * a - 1.291485548 * b) ** 3
  return {
    r: fromLinear(clamp(4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s, 0, 1)),
    g: fromLinear(clamp(-1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s, 0, 1)),
    b: fromLinear(clamp(-0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s, 0, 1)),
  }
}

// ---------- CMYK ----------
// Device-independent approximation (no ICC profile). Print-accurate conversion needs the press profile
// (e.g. FOGRA39, GRACoL); register one as a custom profile when exact matches matter.

export function rgbToCmyk({ r, g, b }: Rgb): Cmyk {
  const R = r / 255, G = g / 255, B = b / 255
  const k = 1 - Math.max(R, G, B)
  if (k >= 1) return { c: 0, m: 0, y: 0, k: 100 }
  const f = (v: number) => Math.round(((1 - v - k) / (1 - k)) * 1000) / 10
  return { c: f(R), m: f(G), y: f(B), k: Math.round(k * 1000) / 10 }
}

export function cmykToRgb({ c, m, y, k }: Cmyk): Rgb {
  const K = clamp(k, 0, 100) / 100
  const f = (v: number) => 255 * (1 - clamp(v, 0, 100) / 100) * (1 - K)
  return { r: f(c), g: f(m), b: f(y) }
}

// ---------- CIEDE2000 ----------

export function deltaE2000(x: Lab, y: Lab): number {
  const avgL = (x.L + y.L) / 2
  const C1 = Math.hypot(x.a, x.b), C2 = Math.hypot(y.a, y.b)
  const avgC = (C1 + C2) / 2
  const G = 0.5 * (1 - Math.sqrt(avgC ** 7 / (avgC ** 7 + 25 ** 7)))
  const a1 = x.a * (1 + G), a2 = y.a * (1 + G)
  const C1p = Math.hypot(a1, x.b), C2p = Math.hypot(a2, y.b)
  const avgCp = (C1p + C2p) / 2
  const h1 = (deg(Math.atan2(x.b, a1)) + 360) % 360
  const h2 = (deg(Math.atan2(y.b, a2)) + 360) % 360
  let dh = h2 - h1
  if (C1p * C2p === 0) dh = 0
  else if (dh > 180) dh -= 360
  else if (dh < -180) dh += 360
  const dL = y.L - x.L
  const dC = C2p - C1p
  const dH = 2 * Math.sqrt(C1p * C2p) * Math.sin(rad(dh / 2))
  let avgH = h1 + h2
  if (C1p * C2p !== 0) {
    if (Math.abs(h1 - h2) > 180) avgH += h1 + h2 < 360 ? 360 : -360
    avgH /= 2
  }
  const T = 1 - 0.17 * Math.cos(rad(avgH - 30)) + 0.24 * Math.cos(rad(2 * avgH)) + 0.32 * Math.cos(rad(3 * avgH + 6)) - 0.2 * Math.cos(rad(4 * avgH - 63))
  const dTheta = 30 * Math.exp(-(((avgH - 275) / 25) ** 2))
  const Rc = 2 * Math.sqrt(avgCp ** 7 / (avgCp ** 7 + 25 ** 7))
  const Sl = 1 + (0.015 * (avgL - 50) ** 2) / Math.sqrt(20 + (avgL - 50) ** 2)
  const Sc = 1 + 0.045 * avgCp
  const Sh = 1 + 0.015 * avgCp * T
  const Rt = -Math.sin(rad(2 * dTheta)) * Rc
  return Math.sqrt((dL / Sl) ** 2 + (dC / Sc) ** 2 + (dH / Sh) ** 2 + Rt * (dC / Sc) * (dH / Sh))
}

export const deltaEHex = (a: string, b: string) => deltaE2000(hexToLab(a), hexToLab(b))

// ---------- Parsing any supported notation ----------

export type ColorInput =
  | { space: "hex"; value: string }
  | { space: "rgb"; r: number; g: number; b: number }
  | { space: "cmyk"; c: number; m: number; y: number; k: number }
  | { space: "lab"; L: number; a: number; b: number }

export function toRgb(input: ColorInput): Rgb {
  switch (input.space) {
    case "hex": return hexToRgb(input.value)
    case "rgb": return { r: input.r, g: input.g, b: input.b }
    case "cmyk": return cmykToRgb(input)
    case "lab": return labToRgb(input)
  }
}

/**
 * Parses "#b3122e", "b3122e", "rgb(179, 18, 46)", "cmyk(0, 90, 74, 30)" (percent), "lab(38 59 31)".
 * Returns null when the text isn't a color notation (e.g. a library name like "PANTONE 18-1663").
 */
export function parseColor(text: string): ColorInput | null {
  const t = text.trim().toLowerCase()
  if (/^#?([0-9a-f]{3}|[0-9a-f]{6})$/.test(t)) return { space: "hex", value: t.startsWith("#") ? t : `#${t}` }
  const nums = (s: string) => s.split(/[\s,/]+/).filter(Boolean).map((n) => parseFloat(n.replace("%", "")))
  let m = /^rgb\(([^)]+)\)$/.exec(t)
  if (m) {
    const [r, g, b] = nums(m[1])
    if ([r, g, b].every(Number.isFinite)) return { space: "rgb", r, g, b }
  }
  m = /^cmyk\(([^)]+)\)$/.exec(t)
  if (m) {
    const [c, mm, y, k] = nums(m[1])
    if ([c, mm, y, k].every(Number.isFinite)) return { space: "cmyk", c, m: mm, y, k }
  }
  m = /^(?:cie)?lab\(([^)]+)\)$/.exec(t)
  if (m) {
    const [L, a, b] = nums(m[1])
    if ([L, a, b].every(Number.isFinite)) return { space: "lab", L, a, b }
  }
  return null
}

/** Every representation of a color, for display in the Lab. */
export function describe(hex: string) {
  const rgb = hexToRgb(hex)
  const lab = rgbToLab(rgb)
  const lch = labToLch(lab)
  const r1 = (n: number) => Math.round(n * 10) / 10
  return {
    hex: rgbToHex(rgb),
    rgb,
    cmyk: rgbToCmyk(rgb),
    lab: { L: r1(lab.L), a: r1(lab.a), b: r1(lab.b) },
    lch: { L: r1(lch.L), C: r1(lch.C), h: r1(lch.h) },
  }
}
