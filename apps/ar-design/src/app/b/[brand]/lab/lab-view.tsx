"use client"
import {
  describe, extractPalette, generateSkinFamily, nearest, parseColor, rgbToHex, sampleChipGrid, toRgb, findByName,
  type ColorLibrary, type InputColor, type SkinFamily,
} from "@beautyos/color-lab"
import { previewColors, REGION_SPECS, type LookDocument } from "@beautyos/look-format"
import { useRouter } from "next/navigation"
import { useMemo, useRef, useState, useTransition } from "react"
import { createLookAction, deleteLibraryAction } from "@/app/actions"
import { Icon } from "@/components/icons"
import { useImporter } from "@/components/importer"
import { useToast } from "@/components/ui"

type Engine = { id: string; label: string; available: boolean; requirement: string }
type Result = { look: LookDocument; assignments: { region: string; hex: string; finish: string; reason: string; catalog?: { name: string; sku?: string; deltaE: number } }[]; unused: { hex: string; reason: string }[]; reasoning: string[]; engine: string; notes: string[] }
type Tab = "describe" | "swatches" | "skin" | "libraries"
type Occasion = "auto" | "everyday" | "evening" | "bold"

export function LabView({ brand, libraries, engines }: { brand: string; libraries: ColorLibrary[]; engines: Engine[] }) {
  const [tab, setTab] = useState<Tab>("describe")
  const [skin, setSkin] = useState<string>("")
  const [occasion, setOccasion] = useState<Occasion>("auto")
  const [result, setResult] = useState<Result | null>(null)
  const toast = useToast()

  const formulate = async (body: Record<string, unknown>) => {
    const res = await fetch(`/api/studio/${brand}/lab/formulate`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ ...body, skin: skin || undefined, occasion: occasion === "auto" ? undefined : occasion }) })
    const r = await res.json()
    if (!res.ok) { toast(r.error ?? "Formulation failed.", "error"); return }
    setResult(r)
  }

  return (
    <div className="page">
      <div className="page-head">
        <div>
          <h1>Lab</h1>
          <p>Formulate looks from a description, from color chips and swatches, or from a skin tone. Every result explains its choices and opens as a new look.</p>
        </div>
      </div>
      <div className="editor" style={{ gridTemplateColumns: "minmax(0, 1fr) 420px" }}>
        <div>
          <div className="tabs" role="tablist">
            {([["describe", "Describe"], ["swatches", "Swatches & chips"], ["skin", "Skin tone"], ["libraries", "Color libraries"]] as const).map(([id, label]) => (
              <button key={id} role="tab" className="tab" aria-selected={tab === id} onClick={() => setTab(id)}>{label}</button>
            ))}
          </div>
          <div className="row" style={{ marginBottom: 16, gap: 16 }}>
            <label className="row" style={{ gap: 8 }}>
              <span className="label">Skin tone</span>
              <input type="color" value={skin || "#c68863"} onChange={(e) => setSkin(e.target.value)} aria-label="Skin tone" />
              {skin ? <button className="btn btn-ghost btn-sm" onClick={() => setSkin("")}>Clear</button> : <span className="hint">optional: tailors complexion, blush and highlight</span>}
            </label>
            <div className="segmented" role="group" aria-label="Occasion">
              {(["auto", "everyday", "evening", "bold"] as const).map((o) => <button key={o} aria-pressed={occasion === o} onClick={() => setOccasion(o)} title={o === "auto" ? "Read the occasion from the description" : undefined}>{o[0].toUpperCase() + o.slice(1)}</button>)}
            </div>
          </div>
          {tab === "describe" && <Describe engines={engines} onRun={(prompt, engine) => formulate({ mode: "prompt", prompt, engine })} />}
          {tab === "swatches" && <Swatches libraries={libraries} onRun={(colors, name) => formulate({ mode: "colors", colors, name })} />}
          {tab === "skin" && <SkinTone skin={skin} setSkin={setSkin} />}
          {tab === "libraries" && <Libraries brand={brand} libraries={libraries} />}
        </div>
        <aside className="card panel" aria-label="Formulation result">
          <ResultPanel brand={brand} result={result} />
        </aside>
      </div>
    </div>
  )
}

function Describe({ engines, onRun }: { engines: Engine[]; onRun: (prompt: string, engine?: string) => Promise<void> }) {
  const [prompt, setPrompt] = useState("")
  const [engine, setEngine] = useState(engines.find((e) => e.available)?.id ?? "rules")
  const [pending, start] = useTransition()
  const examples = ["Soft everyday glow with a peach blush and a sheer rose lip", "Evening smoky eye in charcoal and navy with a velvet berry lip", "Bold editorial: metallic gold lids, glossy red lips, sculpted cheeks", "Bridal: luminous skin, champagne shimmer eyes, nude satin lip"]
  const llm = engines.find((e) => e.id !== "rules")
  return (
    <div className="stack">
      <label className="field">
        <span>Describe the look</span>
        <textarea className="textarea" rows={4} value={prompt} onChange={(e) => setPrompt(e.target.value)} placeholder="Colors, finishes, mood, occasion. You can name exact colors: #b3122e, cmyk(0,90,74,30), or Pantone codes from your imported libraries." />
      </label>
      <div className="chips">{examples.map((x) => <button key={x} className="chip" onClick={() => setPrompt(x)}>{x.split(":")[0].split(" with")[0]}</button>)}</div>
      <div className="row" style={{ justifyContent: "space-between" }}>
        <label className="row" style={{ gap: 8 }}>
          <span className="label">Engine</span>
          <select className="select" style={{ width: 300 }} value={engine} onChange={(e) => setEngine(e.target.value)}>
            {engines.map((e) => <option key={e.id} value={e.id} disabled={!e.available}>{e.label}{e.available ? "" : " (not configured)"}</option>)}
          </select>
        </label>
        <button className="btn btn-primary" disabled={!prompt.trim() || pending} onClick={() => start(() => onRun(prompt, engine))}><Icon name="wand" /> {pending ? "Formulating…" : "Formulate"}</button>
      </div>
      {llm && !llm.available && <p className="hint" style={{ margin: 0 }}>For richer interpretation, connect a language model: {llm.requirement}</p>}
    </div>
  )
}

function Swatches({ libraries, onRun }: { libraries: ColorLibrary[]; onRun: (colors: InputColor[], name: string) => Promise<void> }) {
  const [colors, setColors] = useState<(InputColor & { share?: number; on: boolean })[]>([])
  const [image, setImage] = useState<string | null>(null)
  const [mode, setMode] = useState<"auto" | "grid">("auto")
  const [grid, setGrid] = useState({ rows: 2, cols: 4 })
  const [entry, setEntry] = useState("")
  const [over, setOver] = useState(false)
  const [pending, start] = useTransition()
  const toast = useToast()
  const pixels = useRef<{ data: Uint8ClampedArray; w: number; h: number } | null>(null)

  const analyze = (m = mode, g = grid) => {
    const px = pixels.current
    if (!px) return
    if (m === "auto") setColors(extractPalette(px.data, px.w, px.h, { colors: 8 }).map((c) => ({ hex: c.hex, share: c.share, on: c.share > 0.03 })))
    else setColors(sampleChipGrid(px.data, px.w, px.h, g.rows, g.cols).flat().map((hex) => ({ hex, on: true })))
  }

  const load = (file: File) => {
    const url = URL.createObjectURL(file)
    const img = new Image()
    img.onload = () => {
      const scale = Math.min(1, 640 / Math.max(img.width, img.height))
      const w = Math.round(img.width * scale), h = Math.round(img.height * scale)
      const c = document.createElement("canvas")
      c.width = w; c.height = h
      const ctx = c.getContext("2d", { willReadFrequently: true })!
      ctx.drawImage(img, 0, 0, w, h)
      pixels.current = { data: ctx.getImageData(0, 0, w, h).data, w, h }
      setImage(url)
      analyze()
    }
    img.onerror = () => toast("Couldn't read that image.", "error")
    img.src = url
  }

  const addEntry = () => {
    const t = entry.trim()
    if (!t) return
    const parsed = parseColor(t)
    const lib = parsed ? null : findByName(t, libraries)
    if (parsed) setColors((c) => [...c, { hex: rgbToHex(toRgb(parsed)), name: t, on: true }])
    else if (lib) setColors((c) => [...c, { hex: lib.hex, name: `${lib.name} (${lib.library})`, on: true }])
    else return toast(`"${t}" isn't a color notation or a name in your libraries.`, "error")
    setEntry("")
  }

  return (
    <div className="stack">
      <div className="dropzone" data-own-drop data-over={over}
        onDragOver={(e) => { e.preventDefault(); setOver(true) }} onDragLeave={() => setOver(false)}
        onDrop={(e) => { e.preventDefault(); setOver(false); const f = e.dataTransfer.files[0]; if (f) load(f) }}
        onClick={() => { const i = document.createElement("input"); i.type = "file"; i.accept = "image/*"; i.onchange = () => i.files?.[0] && load(i.files[0]); i.click() }}
        role="button" tabIndex={0}>
        {image ? <img src={image} alt="Swatch photo" style={{ maxHeight: 220, margin: "0 auto", borderRadius: 8 }} /> : <><Icon name="palette" size={20} /><p style={{ margin: "8px 0 0" }}><strong>Drop a photo of color chips, swatches or a palette</strong>. Analyzed in your browser.</p></>}
      </div>
      {image && (
        <div className="row">
          <div className="segmented" role="group" aria-label="Read colors">
            <button aria-pressed={mode === "auto"} onClick={() => { setMode("auto"); analyze("auto") }}>Find colors</button>
            <button aria-pressed={mode === "grid"} onClick={() => { setMode("grid"); analyze("grid") }}>Chip grid</button>
          </div>
          {mode === "grid" && (
            <>
              <label className="row" style={{ gap: 6 }}><span className="label">Rows</span><input className="input" style={{ width: 70 }} type="number" min={1} max={12} value={grid.rows} onChange={(e) => { const g = { ...grid, rows: Number(e.target.value) || 1 }; setGrid(g); analyze("grid", g) }} /></label>
              <label className="row" style={{ gap: 6 }}><span className="label">Columns</span><input className="input" style={{ width: 70 }} type="number" min={1} max={12} value={grid.cols} onChange={(e) => { const g = { ...grid, cols: Number(e.target.value) || 1 }; setGrid(g); analyze("grid", g) }} /></label>
            </>
          )}
        </div>
      )}
      <div className="row" style={{ flexWrap: "nowrap" }}>
        <input className="input" value={entry} onChange={(e) => setEntry(e.target.value)} onKeyDown={(e) => e.key === "Enter" && addEntry()} placeholder="Add a color: #b3122e · rgb(179,18,46) · cmyk(0,90,74,30) · lab(38 59 31) · PANTONE 18-1663 TPX" />
        <button className="btn" onClick={addEntry}><Icon name="plus" /> Add</button>
      </div>
      {colors.length > 0 && (
        <div className="card">
          <table className="table">
            <thead><tr><th>Use</th><th>Color</th><th>Values</th><th>Closest in your libraries</th></tr></thead>
            <tbody>
              {colors.map((c, i) => {
                const d = describe(c.hex)
                const match = libraries.length ? nearest(c.hex, libraries, 1)[0] : null
                return (
                  <tr key={i}>
                    <td><input type="checkbox" checked={c.on} onChange={(e) => setColors((x) => x.map((y, j) => (j === i ? { ...y, on: e.target.checked } : y)))} aria-label={`Use ${c.hex}`} /></td>
                    <td><div className="row" style={{ gap: 8 }}><span className="swatch" style={{ background: c.hex, cursor: "default" }} /><span><span className="mono">{d.hex}</span>{c.name && <div className="hint">{c.name}</div>}{c.share !== undefined && <div className="hint">{Math.round(c.share * 100)}% of image</div>}</span></div></td>
                    <td className="soft mono" style={{ fontSize: 12 }}>rgb {d.rgb.r},{d.rgb.g},{d.rgb.b}<br />cmyk {d.cmyk.c},{d.cmyk.m},{d.cmyk.y},{d.cmyk.k}<br />lab {d.lab.L} {d.lab.a} {d.lab.b}</td>
                    <td>{match ? <div className="row" style={{ gap: 8 }}><span className="swatch" style={{ background: match.entry.hex, cursor: "default" }} /><span>{match.entry.name}<div className="hint">ΔE {match.deltaE.toFixed(1)} · {match.library}</div></span></div> : <span className="hint">No libraries imported</span>}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
      <div className="row" style={{ justifyContent: "flex-end" }}>
        <button className="btn btn-primary" disabled={!colors.some((c) => c.on) || pending} onClick={() => start(() => onRun(colors.filter((c) => c.on).map(({ hex, name }) => ({ hex, ...(name ? { name } : {}) })), "Swatch formulation"))}><Icon name="wand" /> {pending ? "Formulating…" : "Formulate look from colors"}</button>
      </div>
    </div>
  )
}

function ToneStrip({ tones }: { tones: { hex: string; label: string; note?: string }[] }) {
  return (
    <div className="tone-strip">
      {tones.map((t) => <span key={t.label} style={{ background: t.hex }} title={`${t.label}${t.note ? `: ${t.note}` : ""} · ${t.hex}`}>{t.label}</span>)}
    </div>
  )
}

function SkinTone({ skin, setSkin }: { skin: string; setSkin: (s: string) => void }) {
  const hex = skin || "#c68863"
  const family: SkinFamily = useMemo(() => generateSkinFamily(hex), [hex])
  const a = family.analysis
  const presets = ["#f6dccb", "#ecc3a5", "#e3b77f", "#c68863", "#a86b47", "#8d5a3c", "#6b3f2a", "#4a2c1f"]
  return (
    <div className="stack">
      <div className="row">
        <span className="label">Start from</span>
        <div className="swatch-row">{presets.map((p) => <button key={p} className="swatch" aria-pressed={hex === p} style={{ background: p }} onClick={() => setSkin(p)} aria-label={`Skin ${p}`} />)}</div>
        <span className="hint">or use the picker above (sample from a reference photo with your OS color picker).</span>
      </div>
      <div className="grid-3">
        <div className="card card-pad"><div className="label">Category</div><strong style={{ fontSize: 17, textTransform: "capitalize" }}>{a.category.replace("_", " ")}</strong><div className="hint">ITA° {a.ita}</div></div>
        <div className="card card-pad"><div className="label">Undertone</div><strong style={{ fontSize: 17, textTransform: "capitalize" }}>{a.undertone}</strong><div className="hint">hue {a.lch.h.toFixed(1)}°</div></div>
        <div className="card card-pad"><div className="label">Depth</div><strong style={{ fontSize: 17 }}>{a.depth}/10</strong><div className="hint">L* {a.lab.L.toFixed(1)}</div></div>
      </div>
      <div className="stack-sm"><span className="label">Foundation ladder</span><ToneStrip tones={family.foundationLadder} /></div>
      <div className="stack-sm"><span className="label">Natural variation across the face</span><ToneStrip tones={family.zones} /></div>
      <div className="stack-sm"><span className="label">Same depth, other undertones</span><ToneStrip tones={Object.values(family.undertoneVariants)} /></div>
      <div className="grid-2">
        <div className="stack-sm"><span className="label">Concealer & corrector</span><ToneStrip tones={family.concealer} /></div>
        <div className="stack-sm"><span className="label">Contour · highlighter</span><ToneStrip tones={[family.contour, family.highlighter]} /></div>
        <div className="stack-sm"><span className="label">Blush</span><ToneStrip tones={family.blush} /></div>
        <div className="stack-sm"><span className="label">Lip nudes</span><ToneStrip tones={family.lipNudes} /></div>
      </div>
      <div className="card card-pad"><h3 className="section-title">Reasoning</h3><ul className="reasoning">{family.reasoning.map((r, i) => <li key={i}>{r}</li>)}</ul></div>
      <p className="hint" style={{ margin: 0 }}>Analysis uses ITA° colorimetry and CIELAB hue: a makeup-matching heuristic, not a medical classification.</p>
    </div>
  )
}

function Libraries({ brand, libraries }: { brand: string; libraries: ColorLibrary[] }) {
  const { open } = useImporter()
  const toast = useToast()
  const [conv, setConv] = useState("#b3122e")
  const parsed = parseColor(conv) ?? (findByName(conv, libraries) ? { space: "hex" as const, value: findByName(conv, libraries)!.hex } : null)
  const d = parsed ? describe(rgbToHex(toRgb(parsed))) : null
  return (
    <div className="stack">
      <div className="card card-pad stack-sm">
        <h3 className="section-title" style={{ margin: 0 }}>Convert</h3>
        <input className="input" value={conv} onChange={(e) => setConv(e.target.value)} placeholder="#hex · rgb() · cmyk() · lab() · library name" />
        {d ? (
          <div className="row" style={{ gap: 14 }}>
            <span className="swatch swatch-lg" style={{ background: d.hex, cursor: "default" }} />
            <dl className="kv mono" style={{ fontSize: 12.5 }}>
              <dt>HEX</dt><dd>{d.hex}</dd><dt>RGB</dt><dd>{d.rgb.r}, {d.rgb.g}, {d.rgb.b}</dd><dt>CMYK</dt><dd>{d.cmyk.c}, {d.cmyk.m}, {d.cmyk.y}, {d.cmyk.k}</dd><dt>LAB</dt><dd>{d.lab.L}, {d.lab.a}, {d.lab.b}</dd><dt>LCh</dt><dd>{d.lch.L}, {d.lch.C}, {d.lch.h}°</dd>
            </dl>
            {libraries.length > 0 && <div className="stack-sm">{nearest(d.hex, libraries, 3).map((m) => <div key={m.entry.name + m.library} className="row" style={{ gap: 8 }}><span className="swatch" style={{ background: m.entry.hex, cursor: "default" }} /><span>{m.entry.name}<div className="hint">ΔE {m.deltaE.toFixed(1)} · {m.library}</div></span></div>)}</div>}
          </div>
        ) : <span className="hint">Not a recognized color.</span>}
        <p className="hint" style={{ margin: 0 }}>CMYK here is device-independent. For press-accurate values, use your printer&apos;s ICC profile.</p>
      </div>
      <div className="row" style={{ justifyContent: "space-between" }}>
        <p className="soft" style={{ margin: 0, maxWidth: "62ch" }}>Import brand standards or your licensed Pantone libraries as Adobe .ase or CSV. Pantone data isn&apos;t bundled; it comes from your own license.</p>
        <button className="btn" onClick={open}><Icon name="upload" /> Import library</button>
      </div>
      {libraries.length ? libraries.map((l) => (
        <div key={l.id} className="card">
          <div className="card-head">
            <h3>{l.name} <span className="badge" style={{ marginLeft: 6 }}>{l.kind}</span> <span className="muted" style={{ fontWeight: 400 }}>{l.entries.length} colors</span></h3>
            <button className="btn btn-ghost btn-sm btn-danger" onClick={async () => { if (confirm(`Delete library "${l.name}"?`)) { const r = await deleteLibraryAction(brand, l.id); toast(r.ok ? "Deleted." : r.error, r.ok ? "info" : "error") } }}><Icon name="trash" size={15} /></button>
          </div>
          <div className="card-pad swatch-row">{l.entries.slice(0, 120).map((e) => <span key={e.name} className="swatch" style={{ background: e.hex, cursor: "default" }} title={`${e.name}${e.code ? ` (${e.code})` : ""} · ${e.hex}`} />)}</div>
        </div>
      )) : <div className="card empty"><strong>No libraries yet</strong>Drop an .ase or .csv file anywhere.</div>}
    </div>
  )
}

function ResultPanel({ brand, result }: { brand: string; result: Result | null }) {
  const router = useRouter()
  const toast = useToast()
  const [pending, start] = useTransition()
  if (!result) return <div className="empty" style={{ padding: 32 }}><strong>No formulation yet</strong>Describe a look, or add swatches, then formulate.</div>
  const colors = previewColors(result.look, 6)
  return (
    <>
      <div className="look-hero" style={{ gridTemplateColumns: `repeat(${Math.max(1, colors.length)}, 1fr)`, aspectRatio: "5 / 1", flex: "none" }}>{colors.map((c) => <span key={c} style={{ background: c }} />)}</div>
      <div className="panel-scroll">
        <div>
          <h2 style={{ margin: 0, fontSize: 18 }}>{result.look.name}</h2>
          <p className="soft" style={{ margin: "4px 0 0" }}>{result.look.description}</p>
          <span className="badge" style={{ marginTop: 8 }}>{result.engine.startsWith("llm") ? "Language model" : "Rule engine"}</span>
        </div>
        <button className="btn btn-primary" disabled={pending} onClick={() => start(async () => {
          const r = await createLookAction(brand, { document: result.look })
          if (r.ok) router.push(`/b/${brand}/looks/${r.data.id}`)
          else toast(r.issues?.map((i) => i.message).join(" ") || r.error, "error")
        })}><Icon name="check" /> {pending ? "Creating…" : "Open as new look"}</button>
        <div className="stack-sm">
          <h3 className="section-title" style={{ margin: 0 }}>Layers</h3>
          {result.assignments.map((a, i) => (
            <div key={i} className="layer" style={{ gridTemplateColumns: "28px 1fr" }}>
              <span className="swatch" style={{ background: a.hex, cursor: "default" }} />
              <div>
                <div className="layer-title">{REGION_SPECS[a.region as keyof typeof REGION_SPECS]?.label ?? a.region} · {a.finish}</div>
                <div className="layer-sub">{a.catalog ? `${a.catalog.name}${a.catalog.sku ? ` · ${a.catalog.sku}` : ""}` : a.hex}</div>
                <div className="hint" style={{ marginTop: 4 }}>{a.reason}</div>
              </div>
            </div>
          ))}
        </div>
        {(result.notes.length > 0 || result.reasoning.length > 0) && (
          <div className="stack-sm">
            <h3 className="section-title" style={{ margin: 0 }}>Reasoning</h3>
            <ul className="reasoning">{[...result.notes, ...result.reasoning].map((r, i) => <li key={i}>{r}</li>)}</ul>
          </div>
        )}
        {result.unused.length > 0 && <p className="hint" style={{ margin: 0 }}>Not used: {result.unused.map((u) => `${u.hex} (${u.reason})`).join(", ")}</p>}
      </div>
    </>
  )
}
