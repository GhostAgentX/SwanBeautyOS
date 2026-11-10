// Color libraries ("custom color profiles"): named swatch sets in any supported color space.
// Pantone data is licensed and is NOT bundled. Teams import their own licensed Pantone libraries
// (Adobe .ase or CSV exports) and the Lab treats them like any other library.
import { cmykToRgb, deltaE2000, hexToLab, labToRgb, parseColor, rgbToHex, toRgb, type ColorInput, type Lab } from "./color"

export type LibraryKind = "pantone" | "brand" | "custom"

export interface LibraryEntry {
  name: string
  /** Optional catalog code, e.g. "18-1663 TPX". */
  code?: string
  /** The color as authored, in its original space. */
  source: ColorInput
  /** sRGB rendering of the color. */
  hex: string
}

export interface ColorLibrary {
  id: string
  name: string
  kind: LibraryKind
  entries: LibraryEntry[]
}

const entry = (name: string, source: ColorInput, code?: string): LibraryEntry => ({
  name: name.trim(),
  ...(code ? { code: code.trim() } : {}),
  source,
  hex: rgbToHex(toRgb(source)),
})

// ---------- CSV ----------

/**
 * Accepts a header row naming the columns. Recognized columns (case-insensitive):
 * name, code, hex, r/g/b, c/m/y/k, l/a/b (or lab_l/lab_a/lab_b). The first color notation present wins,
 * in the order hex, lab, cmyk, rgb. Delimiter: comma, semicolon or tab.
 */
export function parseCsvLibrary(text: string): { entries: LibraryEntry[]; errors: string[] } {
  const lines = text.split(/\r?\n/).filter((l) => l.trim())
  if (!lines.length) return { entries: [], errors: ["The file is empty."] }
  const delim = [",", ";", "\t"].sort((x, y) => lines[0].split(y).length - lines[0].split(x).length)[0]
  const split = (l: string) => l.split(delim).map((c) => c.trim().replace(/^"(.*)"$/, "$1"))
  const head = split(lines[0]).map((h) => h.toLowerCase().replace(/^lab_/, ""))
  const col = (...names: string[]) => names.map((n) => head.indexOf(n)).find((i) => i >= 0) ?? -1
  const idx = {
    name: col("name", "color", "colour", "title"),
    code: col("code", "id", "number"),
    hex: col("hex", "html", "rgb_hex"),
    r: col("r", "red"), g: col("g", "green"), bl: col("blue"),
    c: col("c", "cyan"), m: col("m", "magenta"), y: col("y", "yellow"), k: col("k", "black", "key"),
    L: col("l", "lightness"), A: col("a"), B: col("b"),
  }
  const entries: LibraryEntry[] = []
  const errors: string[] = []

  lines.slice(1).forEach((line, i) => {
    const cells = split(line)
    const num = (j: number) => (j >= 0 ? parseFloat(cells[j]) : NaN)
    const name = (idx.name >= 0 ? cells[idx.name] : "") || (idx.code >= 0 ? cells[idx.code] : "") || `Color ${i + 1}`
    const code = idx.code >= 0 ? cells[idx.code] : undefined
    let source: ColorInput | null = null
    if (idx.hex >= 0 && cells[idx.hex]) source = parseColor(cells[idx.hex])
    // "b" is ambiguous (blue vs Lab b*): treat it as Lab when an L column exists, else as blue.
    else if (idx.L >= 0 && idx.A >= 0 && idx.B >= 0 && [num(idx.L), num(idx.A), num(idx.B)].every(Number.isFinite))
      source = { space: "lab", L: num(idx.L), a: num(idx.A), b: num(idx.B) }
    else if ([idx.c, idx.m, idx.y, idx.k].every((j) => j >= 0) && [num(idx.c), num(idx.m), num(idx.y), num(idx.k)].every(Number.isFinite))
      source = { space: "cmyk", c: num(idx.c), m: num(idx.m), y: num(idx.y), k: num(idx.k) }
    else {
      const blue = idx.bl >= 0 ? idx.bl : idx.B
      if ([idx.r, idx.g, blue].every((j) => j >= 0) && [num(idx.r), num(idx.g), num(blue)].every(Number.isFinite))
        source = { space: "rgb", r: num(idx.r), g: num(idx.g), b: num(blue) }
    }
    if (source) entries.push(entry(name, source, code))
    else errors.push(`Row ${i + 2}: no readable color.`)
  })
  return { entries, errors }
}

// ---------- Adobe Swatch Exchange (.ase) ----------
// Layout: "ASEF", u16 major, u16 minor, u32 blockCount, then blocks of
// u16 type (0x0001 color, 0xC001 group start, 0xC002 group end), u32 length, payload.
// Color payload: u16 nameLength (UTF-16 units incl. NUL), UTF-16BE name, 4-char model, float32 BE values, u16 type.

export function parseAseLibrary(buffer: ArrayBuffer): { entries: LibraryEntry[]; errors: string[] } {
  const view = new DataView(buffer)
  const errors: string[] = []
  const entries: LibraryEntry[] = []
  const sig = String.fromCharCode(view.getUint8(0), view.getUint8(1), view.getUint8(2), view.getUint8(3))
  if (sig !== "ASEF") return { entries, errors: ["Not an Adobe Swatch Exchange file (missing ASEF header)."] }
  const count = view.getUint32(8)
  let off = 12
  for (let i = 0; i < count && off + 6 <= view.byteLength; i++) {
    const type = view.getUint16(off)
    const len = view.getUint32(off + 2)
    const start = off + 6
    off = start + len
    if (type !== 0x0001) continue
    let p = start
    const nameLen = view.getUint16(p)
    p += 2
    let name = ""
    for (let j = 0; j < nameLen; j++) {
      const ch = view.getUint16(p + j * 2)
      if (ch) name += String.fromCharCode(ch)
    }
    p += nameLen * 2
    const model = String.fromCharCode(view.getUint8(p), view.getUint8(p + 1), view.getUint8(p + 2), view.getUint8(p + 3)).trim()
    p += 4
    const f = (k: number) => view.getFloat32(p + k * 4)
    let source: ColorInput | null = null
    if (model === "RGB") source = { space: "rgb", r: f(0) * 255, g: f(1) * 255, b: f(2) * 255 }
    else if (model === "CMYK") source = { space: "cmyk", c: f(0) * 100, m: f(1) * 100, y: f(2) * 100, k: f(3) * 100 }
    else if (model === "LAB") source = { space: "lab", L: f(0) * 100, a: f(1), b: f(2) }
    else if (model === "Gray") source = { space: "rgb", r: f(0) * 255, g: f(0) * 255, b: f(0) * 255 }
    if (source) entries.push(entry(name || `Swatch ${entries.length + 1}`, source, codeFromName(name)))
    else errors.push(`Swatch "${name}": unsupported color model ${model}.`)
  }
  return { entries, errors }
}

/** "PANTONE 18-1663 TPX" -> "18-1663 TPX"; returns undefined when there's no code. */
function codeFromName(name: string) {
  const m = /(\d{2}-\d{4}\s*[A-Z]{2,3}|\d{3,4}\s*[A-Z]{1,2})\b/.exec(name)
  return m?.[1]
}

/** Builds an .ase file (used for exporting libraries and in tests). */
export function encodeAseLibrary(entries: { name: string; source: ColorInput }[]): ArrayBuffer {
  const blocks = entries.map((e) => {
    const name = e.name + "\0"
    const s = e.source
    const values =
      s.space === "cmyk" ? { model: "CMYK", v: [s.c / 100, s.m / 100, s.y / 100, s.k / 100] }
      : s.space === "lab" ? { model: "LAB ", v: [s.L / 100, s.a, s.b] }
      : (() => { const rgb = toRgb(s); return { model: "RGB ", v: [rgb.r / 255, rgb.g / 255, rgb.b / 255] } })()
    const len = 2 + name.length * 2 + 4 + values.v.length * 4 + 2
    return { name, values, len }
  })
  const total = 12 + blocks.reduce((n, b) => n + 6 + b.len, 0)
  const view = new DataView(new ArrayBuffer(total))
  "ASEF".split("").forEach((c, i) => view.setUint8(i, c.charCodeAt(0)))
  view.setUint16(4, 1); view.setUint16(6, 0); view.setUint32(8, blocks.length)
  let off = 12
  for (const b of blocks) {
    view.setUint16(off, 0x0001); view.setUint32(off + 2, b.len)
    let p = off + 6
    view.setUint16(p, b.name.length); p += 2
    for (const ch of b.name) { view.setUint16(p, ch.charCodeAt(0)); p += 2 }
    for (const ch of b.values.model) view.setUint8(p++, ch.charCodeAt(0))
    for (const v of b.values.v) { view.setFloat32(p, v); p += 4 }
    view.setUint16(p, 2) // normal color
    off += 6 + b.len
  }
  return view.buffer
}

// ---------- Lookup ----------

export interface Match {
  entry: LibraryEntry
  library: string
  deltaE: number
}

/** Nearest entries across libraries by CIEDE2000. ΔE < 1 is imperceptible; < 3 is a close match; > 6 is a different color. */
export function nearest(hex: string, libraries: ColorLibrary[], count = 3): Match[] {
  const target = hexToLab(hex)
  const all: Match[] = []
  for (const lib of libraries) for (const e of lib.entries) all.push({ entry: e, library: lib.name, deltaE: deltaE2000(target, hexToLab(e.hex)) })
  return all.sort((a, b) => a.deltaE - b.deltaE).slice(0, count)
}

/** Finds a library color by exact name or code (case/space-insensitive), e.g. "18-1663 TPX". */
export function findByName(query: string, libraries: ColorLibrary[]): (LibraryEntry & { library: string }) | null {
  const norm = (s: string) => s.toLowerCase().replace(/^pantone\s+/, "").replace(/\s+/g, " ").trim()
  const q = norm(query)
  for (const lib of libraries) {
    const hit = lib.entries.find((e) => norm(e.name) === q || (e.code && norm(e.code) === q))
    if (hit) return { ...hit, library: lib.name }
  }
  return null
}

export const labOf = (e: LibraryEntry): Lab => hexToLab(e.hex)
export { cmykToRgb, labToRgb }
