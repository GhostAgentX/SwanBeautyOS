"use client"
import { fitToGamut, lchToHex } from "@beautyos/color-lab"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { Icon } from "@/components/icons"
import { Drawer, useToast } from "@/components/ui"
import {
  AGE_RANGES, ASPECTS, BACKGROUNDS, EXPRESSIONS, EYE_SHAPES, FACE_SHAPES, FRAMINGS, HAIR_COLORS, HAIR_STYLES, HAIR_TEXTURES, LIGHTING, PRESENTATIONS, UNDERTONES,
  depthToL, likenessViolation, sampleCast, type ModelSpec,
} from "@/lib/synthetic"

type Media = { id: string; name: string; url: string; thumbnailUrl: string | null; look: { name: string; method: string } | null; spec: Record<string, unknown> | null }
type Look = { id: string; name: string; description: string }

/** Representative skin swatch for a depth/undertone, from the same CIELAB model the skin engine uses. */
function skinSwatch(depth: number, undertone: string) {
  const h = { cool: 48, neutral: 57, warm: 66, olive: 72 }[undertone] ?? 57
  const C = (undertone === "olive" ? 15 : 18) + depth * 0.9
  return lchToHex(fitToGamut({ L: depthToL(depth), C, h }))
}

export function ModelsView({ brand, generator, media, looks, focus }: {
  brand: string
  generator: { ready: true; label: string } | { ready: false; label: string; requirement: string }
  media: Media[]
  looks: Look[]
  focus?: string
}) {
  const router = useRouter()
  const toast = useToast()
  const [size, setSize] = useState(8)
  const [seed, setSeed] = useState(() => Math.floor(Math.random() * 1e6))
  const [presentation, setPresentation] = useState<string[]>([])
  const [base, setBase] = useState({ lighting: LIGHTING[0], background: BACKGROUNDS[0], framing: FRAMINGS[0], aspect: "4:5" as (typeof ASPECTS)[number], headroom: 0.25 })
  const [cast, setCast] = useState<ModelSpec[]>(() => sampleCast({ size: 8, seed: 1 }))
  const [makeup, setMakeup] = useState<{ mode: "bare" } | { mode: "look"; lookId: string }>({ mode: "bare" })
  const [busy, setBusy] = useState<Set<number>>(new Set())
  const [tryOn, setTryOn] = useState<Media | null>(media.find((m) => m.id === focus) ?? null)
  const models = media.filter((m) => !m.look)
  const renders = media.filter((m) => m.look)

  const reroll = (nextSeed = seed) => {
    setCast(sampleCast({ size, seed: nextSeed, only: { presentation: presentation as ModelSpec["presentation"][] }, base }))
  }

  const generate = async (indices: number[]) => {
    if (!generator.ready) return toast(generator.requirement, "error")
    const lookBrief = makeup.mode === "look" ? looks.find((l) => l.id === makeup.lookId) : null
    for (const i of indices) {
      const spec = cast[i]
      const violation = likenessViolation(spec.notes)
      if (violation) { toast(violation, "error"); continue }
      setBusy((b) => new Set(b).add(i))
      try {
        const res = await fetch(`/api/studio/${brand}/models/generate`, {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ spec, makeup: lookBrief ? { mode: "look", description: `${lookBrief.name}: ${lookBrief.description}` } : { mode: "bare" } }),
        })
        const r = await res.json()
        if (!res.ok) throw new Error(r.error)
        toast(`${spec.label} generated${r.headroomAddedPx ? ` (+${r.headroomAddedPx}px headroom added)` : ""}.`)
      } catch (e) {
        toast(`${spec.label}: ${e instanceof Error ? e.message : String(e)}`, "error")
      } finally {
        setBusy((b) => { const n = new Set(b); n.delete(i); return n })
      }
    }
    router.refresh()
  }

  const editSpec = (i: number, patch: Partial<ModelSpec>) => setCast((c) => c.map((s, j) => (j === i ? { ...s, ...patch } : s)))

  return (
    <div className="page">
      <div className="page-head">
        <div>
          <h1>Models</h1>
          <p>Original, fictional people for showing looks across skin tones, features and hair textures. Every image is labeled synthetic and composed with generous headroom.</p>
        </div>
      </div>

      {!generator.ready && (
        <div className="notice notice-warn" style={{ marginBottom: 18 }}>
          <div><strong>Image generation isn&apos;t connected yet.</strong> {generator.requirement} You can still plan a cast now, and use photos or the camera in the look editor.</div>
        </div>
      )}

      <section className="card" style={{ marginBottom: 28 }}>
        <div className="card-head">
          <h2>Cast builder</h2>
          <div className="row">
            <button className="btn" onClick={() => { const s = Math.floor(Math.random() * 1e6); setSeed(s); reroll(s) }}><Icon name="refresh" /> New cast</button>
            <button className="btn btn-primary" disabled={!generator.ready || busy.size > 0} onClick={() => generate(cast.map((_, i) => i))}><Icon name="wand" /> Generate all ({cast.length})</button>
          </div>
        </div>
        <div className="card-pad stack">
          <div className="row" style={{ alignItems: "flex-end", gap: 16 }}>
            <label className="field" style={{ width: 180 }}>
              <span className="row" style={{ justifyContent: "space-between" }}>Cast size <span className="muted">{size}</span></span>
              <input type="range" min={1} max={24} value={size} onChange={(e) => setSize(Number(e.target.value))} onPointerUp={() => reroll()} onKeyUp={() => reroll()} />
            </label>
            <div className="field">
              <span>Presentation</span>
              <div className="chips">
                {PRESENTATIONS.map((p) => (
                  <button key={p} className="chip" aria-pressed={presentation.includes(p)} onClick={() => setPresentation((x) => (x.includes(p) ? x.filter((y) => y !== p) : [...x, p]))}>{p}</button>
                ))}
              </div>
            </div>
            <label className="field" style={{ width: 220 }}>
              <span>Makeup</span>
              <select className="select" value={makeup.mode === "bare" ? "" : makeup.lookId} onChange={(e) => setMakeup(e.target.value ? { mode: "look", lookId: e.target.value } : { mode: "bare" })}>
                <option value="">Bare face (apply looks with AR)</option>
                {looks.map((l) => <option key={l.id} value={l.id}>Generated in: {l.name}</option>)}
              </select>
            </label>
            <button className="btn" onClick={() => reroll()}>Apply</button>
          </div>
          <details className="advanced">
            <summary>Photography and composition</summary>
            <div className="grid-3" style={{ paddingTop: 8 }}>
              <label className="field"><span>Lighting</span><select className="select" value={base.lighting} onChange={(e) => setBase({ ...base, lighting: e.target.value as never })}>{LIGHTING.map((x) => <option key={x}>{x}</option>)}</select></label>
              <label className="field"><span>Background</span><select className="select" value={base.background} onChange={(e) => setBase({ ...base, background: e.target.value as never })}>{BACKGROUNDS.map((x) => <option key={x}>{x}</option>)}</select></label>
              <label className="field"><span>Framing</span><select className="select" value={base.framing} onChange={(e) => setBase({ ...base, framing: e.target.value as never })}>{FRAMINGS.map((x) => <option key={x}>{x}</option>)}</select></label>
              <label className="field"><span>Aspect</span><select className="select" value={base.aspect} onChange={(e) => setBase({ ...base, aspect: e.target.value as never })}>{ASPECTS.map((x) => <option key={x}>{x}</option>)}</select></label>
              <label className="field">
                <span className="row" style={{ justifyContent: "space-between" }}>Headroom <span className="muted">{Math.round(base.headroom * 100)}% of frame</span></span>
                <input type="range" min={15} max={50} value={Math.round(base.headroom * 100)} onChange={(e) => setBase({ ...base, headroom: Number(e.target.value) / 100 })} />
              </label>
            </div>
            <p className="hint">Click Apply to update the cast. Headroom is enforced after generation too.</p>
          </details>

          <div className="gallery" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(230px, 1fr))" }}>
            {cast.map((m, i) => (
              <div key={i} className="card" style={{ padding: 12, display: "grid", gap: 10 }}>
                <div className="row" style={{ gap: 10 }}>
                  <span className="swatch swatch-lg" style={{ background: skinSwatch(m.skinDepth, m.undertone), cursor: "default" }} aria-hidden="true" />
                  <div>
                    <strong>{m.label}</strong>
                    <div className="hint">Depth {m.skinDepth}/10 · {m.undertone}</div>
                  </div>
                </div>
                <div className="soft" style={{ fontSize: 12.5 }}>
                  {m.presentation}, {m.ageRange} · {m.faceShape} face · {m.eyeShape} eyes · {m.hairColor} {m.hairTexture} hair, {m.hairStyle}
                </div>
                <details className="advanced">
                  <summary>Edit</summary>
                  <div className="grid-2" style={{ paddingTop: 6 }}>
                    <label className="field"><span>Skin depth</span><input type="range" min={1} max={10} value={m.skinDepth} onChange={(e) => editSpec(i, { skinDepth: Number(e.target.value) })} /></label>
                    <Sel label="Undertone" value={m.undertone} options={UNDERTONES} onChange={(v) => editSpec(i, { undertone: v as never })} />
                    <Sel label="Face shape" value={m.faceShape} options={FACE_SHAPES} onChange={(v) => editSpec(i, { faceShape: v as never })} />
                    <Sel label="Eye shape" value={m.eyeShape} options={EYE_SHAPES} onChange={(v) => editSpec(i, { eyeShape: v as never })} />
                    <Sel label="Hair texture" value={m.hairTexture} options={HAIR_TEXTURES} onChange={(v) => editSpec(i, { hairTexture: v as never })} />
                    <Sel label="Hair style" value={m.hairStyle} options={HAIR_STYLES} onChange={(v) => editSpec(i, { hairStyle: v as never })} />
                    <Sel label="Hair color" value={m.hairColor} options={HAIR_COLORS} onChange={(v) => editSpec(i, { hairColor: v as never })} />
                    <Sel label="Age" value={m.ageRange} options={AGE_RANGES} onChange={(v) => editSpec(i, { ageRange: v as never })} />
                    <Sel label="Expression" value={m.expression} options={EXPRESSIONS} onChange={(v) => editSpec(i, { expression: v as never })} />
                    <Sel label="Presentation" value={m.presentation} options={PRESENTATIONS} onChange={(v) => editSpec(i, { presentation: v as never })} />
                  </div>
                  <label className="field" style={{ marginTop: 8 }}>
                    <span>Notes: heritage, features, styling (your words)</span>
                    <textarea className="textarea" style={{ minHeight: 60 }} maxLength={300} value={m.notes} placeholder="e.g. freckles, vitiligo on the cheek, gold hoops, silk headscarf" onChange={(e) => editSpec(i, { notes: e.target.value })} />
                    {likenessViolation(m.notes) && <span className="hint" style={{ color: "var(--danger)" }}>{likenessViolation(m.notes)}</span>}
                  </label>
                </details>
                <button className="btn btn-sm" style={{ marginTop: "auto" }} disabled={!generator.ready || busy.has(i)} onClick={() => generate([i])}><Icon name="wand" size={15} /> {busy.has(i) ? "Generating…" : "Generate"}</button>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section>
        <h2 className="section-title">Generated models · {models.length}</h2>
        {models.length ? (
          <div className="gallery">
            {models.map((m) => (
              <button key={m.id} className="tile" style={{ padding: 0, cursor: "pointer", textAlign: "left" }} onClick={() => setTryOn(m)}>
                <div className="tile-media">{m.thumbnailUrl && <img src={m.thumbnailUrl} alt={m.name} loading="lazy" />}</div>
                <div className="tile-badges"><span className="badge badge-accent">Synthetic</span></div>
                <div className="tile-body"><div className="tile-title">{m.name}</div><div className="tile-meta"><span>Try a look →</span></div></div>
              </button>
            ))}
          </div>
        ) : <div className="card empty"><strong>No models yet</strong>Generate your cast above.</div>}

        {renders.length > 0 && (
          <>
            <h2 className="section-title" style={{ marginTop: 28 }}>Model × look renders · {renders.length}</h2>
            <div className="gallery">
              {renders.map((m) => (
                <Link key={m.id} href={`/b/${brand}/assets`} className="tile">
                  <div className="tile-media">{m.thumbnailUrl && <img src={m.thumbnailUrl} alt={m.name} loading="lazy" />}</div>
                  <div className="tile-badges"><span className="badge badge-accent">Synthetic</span><span className="badge">{m.look!.method === "ar-engine" ? "AR" : "Generated"}</span></div>
                  <div className="tile-body"><div className="tile-title">{m.name}</div></div>
                </Link>
              ))}
            </div>
          </>
        )}
      </section>

      {tryOn && (
        <Drawer title={`Try a look on ${tryOn.name.replace(/ · .*/, "")}`} onClose={() => setTryOn(null)}>
          <img src={tryOn.url} alt={tryOn.name} style={{ borderRadius: 12 }} />
          <p className="soft" style={{ margin: 0 }}>Opens the look editor with this model as the preview. The AR engine applies the makeup, exactly as customers will see it.</p>
          <div className="stack-sm">
            {looks.map((l) => (
              <Link key={l.id} className="btn" style={{ justifyContent: "space-between" }} href={`/b/${brand}/looks/${l.id}?model=${tryOn.id}`}>{l.name} <span className="muted">Open →</span></Link>
            ))}
          </div>
        </Drawer>
      )}
    </div>
  )
}

function Sel({ label, value, options, onChange }: { label: string; value: string; options: readonly string[]; onChange: (v: string) => void }) {
  return (
    <label className="field">
      <span>{label}</span>
      <select className="select" value={value} onChange={(e) => onChange(e.target.value)}>{options.map((o) => <option key={o} value={o}>{o}</option>)}</select>
    </label>
  )
}
