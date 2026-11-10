import { describe, expect, it } from "vitest"
import { validateLook } from "@beautyos/look-format"
import {
  analyzeSkin,
  cmykToRgb,
  deltaE2000,
  describe as describeColor,
  encodeAseLibrary,
  extractPalette,
  findByName,
  formulateLook,
  generateSkinFamily,
  hexToLab,
  labToHex,
  nearest,
  parseAseLibrary,
  parseColor,
  parseCsvLibrary,
  parsePrompt,
  rgbToCmyk,
  sampleChipGrid,
  type ColorLibrary,
} from "../index"

const close = (a: number, b: number, tol = 0.05) => expect(Math.abs(a - b)).toBeLessThan(tol)

describe("color science", () => {
  it("converts sRGB red to the reference CIELAB value", () => {
    const lab = hexToLab("#ff0000")
    close(lab.L, 53.24, 0.05); close(lab.a, 80.09, 0.1); close(lab.b, 67.2, 0.1)
  })

  it("round-trips hex through Lab", () => {
    for (const hex of ["#b3122e", "#d9b99b", "#0b0b0b", "#f6f3ef", "#2f6b4f"]) expect(labToHex(hexToLab(hex))).toBe(hex)
  })

  it("matches the Sharma et al. CIEDE2000 test data", () => {
    const pairs: [[number, number, number], [number, number, number], number][] = [
      [[50, 2.6772, -79.7751], [50, 0, -82.7485], 2.0425],
      [[50, 3.1571, -77.2803], [50, 0, -82.7485], 2.8615],
      [[50, 2.5, 0], [56, -27, -3], 31.903],
      [[60.2574, -34.0099, 36.2677], [60.4626, -34.1751, 39.4387], 1.2644],
      [[22.7233, 20.0904, -46.694], [23.0331, 14.973, -42.5619], 2.0373],
    ]
    for (const [a, b, expected] of pairs) close(deltaE2000({ L: a[0], a: a[1], b: a[2] }, { L: b[0], a: b[1], b: b[2] }), expected, 0.0005)
  })

  it("converts CMYK both ways and parses notations", () => {
    expect(rgbToCmyk({ r: 255, g: 0, b: 0 })).toEqual({ c: 0, m: 100, y: 100, k: 0 })
    const rgb = cmykToRgb({ c: 0, m: 90, y: 74, k: 30 })
    expect(Math.round(rgb.r)).toBe(179)
    expect(parseColor("cmyk(0, 90, 74, 30)")).toEqual({ space: "cmyk", c: 0, m: 90, y: 74, k: 30 })
    expect(parseColor("B3122E")).toEqual({ space: "hex", value: "#b3122e" })
    expect(parseColor("lab(38 59 31)")).toEqual({ space: "lab", L: 38, a: 59, b: 31 })
    expect(parseColor("PANTONE 18-1663 TPX")).toBeNull()
    expect(describeColor("#b3122e").cmyk.m).toBeGreaterThan(80)
  })
})

describe("color libraries", () => {
  it("round-trips Adobe Swatch Exchange files in RGB, CMYK and LAB", () => {
    const buf = encodeAseLibrary([
      { name: "PANTONE 18-1663 TPX", source: { space: "lab", L: 42, a: 58, b: 35 } },
      { name: "Brand Red", source: { space: "cmyk", c: 0, m: 90, y: 74, k: 30 } },
      { name: "Gold", source: { space: "rgb", r: 201, g: 162, b: 74 } },
    ])
    const { entries, errors } = parseAseLibrary(buf)
    expect(errors).toEqual([])
    expect(entries.map((e) => e.name)).toEqual(["PANTONE 18-1663 TPX", "Brand Red", "Gold"])
    expect(entries[0].code).toBe("18-1663 TPX")
    expect(entries[0].source.space).toBe("lab")
    expect(entries[2].hex).toBe("#c9a24a")
  })

  it("rejects files that aren't ASE", () => {
    expect(parseAseLibrary(new TextEncoder().encode("not a swatch file").buffer).errors.length).toBe(1)
  })

  it("parses CSV with hex, CMYK, RGB or Lab columns and reports bad rows", () => {
    expect(parseCsvLibrary("name,hex\nRed,#b3122e\nGold,c9a24a").entries.map((e) => e.hex)).toEqual(["#b3122e", "#c9a24a"])
    expect(parseCsvLibrary("Name;C;M;Y;K\nRed;0;90;74;30").entries[0].source.space).toBe("cmyk")
    expect(parseCsvLibrary("name,r,g,b\nGold,201,162,74").entries[0].hex).toBe("#c9a24a")
    expect(parseCsvLibrary("code,L,a,b\n18-1663,42,58,35").entries[0].source.space).toBe("lab")
    expect(parseCsvLibrary("name,hex\nBroken,zzz").errors.length).toBe(1)
  })

  it("finds library colors by name/code and by nearest ΔE", () => {
    const lib: ColorLibrary = { id: "p", name: "Pantone (licensed import)", kind: "pantone", entries: parseCsvLibrary("name,code,hex\nPANTONE 18-1663 TPX,18-1663 TPX,#a2242f\nPANTONE 14-1513 TPX,14-1513 TPX,#e5a99b").entries }
    expect(findByName("pantone 18-1663 tpx", [lib])?.hex).toBe("#a2242f")
    expect(findByName("14-1513 TPX", [lib])?.name).toBe("PANTONE 14-1513 TPX")
    expect(nearest("#a52530", [lib], 1)[0].entry.code).toBe("18-1663 TPX")
  })
})

describe("swatch analysis", () => {
  // Builds an RGBA image: white card with three color blocks.
  const image = (w: number, h: number, blocks: [number, number, number][]) => {
    const px = new Uint8ClampedArray(w * h * 4).fill(255)
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
      const col = Math.floor((x / w) * blocks.length)
      if (y > h * 0.2 && y < h * 0.8 && (x % Math.floor(w / blocks.length)) > 4) {
        const o = (y * w + x) * 4
        ;[px[o], px[o + 1], px[o + 2]] = blocks[col]
      }
    }
    return px
  }

  it("extracts the chip colors and ignores the white card", () => {
    const px = image(300, 100, [[179, 18, 46], [201, 162, 74], [242, 165, 142]])
    const palette = extractPalette(px, 300, 100, { colors: 5 })
    expect(palette.length).toBe(3)
    for (const target of ["#b3122e", "#c9a24a", "#f2a58e"]) {
      expect(Math.min(...palette.map((p) => deltaE2000(hexToLab(p.hex), hexToLab(target))))).toBeLessThan(2)
    }
  })

  it("is deterministic", () => {
    const px = image(120, 60, [[10, 120, 80], [200, 40, 90]])
    expect(extractPalette(px, 120, 60)).toEqual(extractPalette(px, 120, 60))
  })

  it("samples a chip grid by cell", () => {
    const px = image(300, 100, [[179, 18, 46], [201, 162, 74], [242, 165, 142]])
    expect(sampleChipGrid(px, 300, 100, 1, 3)).toEqual([["#b3122e", "#c9a24a", "#f2a58e"]])
  })
})

describe("skin tone reasoning", () => {
  it("orders ITA categories from very light to dark", () => {
    const cats = ["#f6dccb", "#e8b796", "#c68863", "#8d5a3c", "#4a2c1f"].map((h) => analyzeSkin(h).category)
    expect(cats[0]).toBe("very_light")
    expect(cats[4]).toBe("dark")
    const order = ["very_light", "light", "intermediate", "tan", "brown", "dark"]
    for (let i = 1; i < cats.length; i++) expect(order.indexOf(cats[i])).toBeGreaterThanOrEqual(order.indexOf(cats[i - 1]))
  })

  it("reads undertone from hue", () => {
    expect(analyzeSkin("#e8b4a8").undertone).toBe("cool") // pinkish
    expect(analyzeSkin("#e3b77f").undertone).toBe("warm") // golden
  })

  it("generates an ordered foundation ladder, realistic zones and depth-aware highlighter", () => {
    const fam = generateSkinFamily("#c68863")
    const Ls = fam.foundationLadder.map((t) => hexToLab(t.hex).L)
    for (let i = 1; i < Ls.length; i++) expect(Ls[i]).toBeLessThan(Ls[i - 1])
    expect(fam.zones.length).toBe(6)
    const base = hexToLab("#c68863")
    const contour = hexToLab(fam.contour.hex)
    expect(contour.L).toBeLessThan(base.L - 8)
    expect(Math.hypot(contour.a, contour.b)).toBeLessThan(Math.hypot(base.a, base.b))
    expect(generateSkinFamily("#4a2c1f").highlighter.label).toBe("Gold")
    expect(generateSkinFamily("#f6dccb").highlighter.label).toBe("Pearl")
    expect(fam.reasoning.length).toBeGreaterThan(4)
  })
})

describe("formulation", () => {
  it("formulates a valid look from a prompt with regions, finishes and occasion", () => {
    const p = parsePrompt("Evening look: red matte lips, gold shimmer eyes and a peach blush")
    expect(p.occasion).toBe("evening")
    const f = formulateLook({ name: "Prompted", colors: p.colors, occasion: p.occasion, intensity: p.intensity })
    expect(validateLook(f.look).ok).toBe(true)
    const by = (r: string) => f.look.layers.filter((l) => l.region === r)
    expect(by("lips")[0].material).toMatchObject({ color: "#b3122e", finish: "matte" })
    expect(by("eyeshadow")[0].material).toMatchObject({ color: "#c9a24a", finish: "shimmer" })
    expect(by("blush")[0].material.color).toBe("#f2a58e")
    expect(by("eyeliner").length).toBe(1) // evening adds definition
  })

  it("turns 'smoky eye' into a 3-layer light-to-dark gradient", () => {
    const f = formulateLook({ colors: parsePrompt("smoky eye with nude lips").colors, occasion: "evening" })
    const shadow = f.look.layers.filter((l) => l.region === "eyeshadow").map((l) => hexToLab(l.material.color).L)
    expect(shadow.length).toBe(3)
  })

  it("classifies unplaced chip colors into sensible regions", () => {
    const f = formulateLook({ colors: [{ hex: "#b3122e" }, { hex: "#0d0d0d" }, { hex: "#efe6e1" }, { hex: "#8c5a32" }, { hex: "#d9b99b" }] })
    const region = (hex: string) => f.assignments.find((a) => a.hex === hex)?.region
    expect(region("#b3122e")).toBe("lips")
    expect(region("#0d0d0d")).toBe("eyeliner")
    expect(region("#efe6e1")).toBe("highlighter")
    expect(f.look.layers.filter((l) => l.region === "eyeshadow").length).toBeGreaterThanOrEqual(1)
    expect(f.assignments.every((a) => a.reason.length > 0)).toBe(true)
  })

  it("builds complexion from the skin tone and snaps to catalog SKUs", () => {
    const f = formulateLook({
      colors: [{ hex: "#b5142f", region: "lips" }],
      skin: "#c68863",
      catalog: [{ region: "lips", color: "#b3122e", finish: "satin", name: "Classic Red", sku: "SB-LIP-005", shadeId: "s1", productName: "Velvet Lip" }],
    })
    const lip = f.look.layers.find((l) => l.region === "lips")!
    expect(lip.material.color).toBe("#b3122e")
    expect(lip.shade).toMatchObject({ sku: "SB-LIP-005", name: "Classic Red" })
    expect(f.look.layers.some((l) => l.region === "foundation")).toBe(true)
    expect(f.reasoning.some((r) => r.includes("ITA"))).toBe(true)
  })

  it("resolves Pantone names only from imported libraries", () => {
    const lib: ColorLibrary = { id: "p", name: "Pantone", kind: "pantone", entries: parseCsvLibrary("name,hex\nPANTONE 18-1663 TPX,#a2242f").entries }
    expect(parsePrompt("lips in pantone 18-1663 tpx", [lib]).colors[0]).toMatchObject({ hex: "#a2242f", region: "lips" })
    const missing = parsePrompt("lips in pantone 18-1663 tpx")
    expect(missing.colors.length).toBe(0)
    expect(missing.notes.some((n) => n.includes("import your licensed Pantone"))).toBe(true)
  })
})
