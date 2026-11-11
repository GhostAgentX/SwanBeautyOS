"use client"
import {
  BANUBA_FINISHES,
  GROUP_LABELS,
  OVERLAY_MEDIA,
  REGION_GROUPS,
  REGION_SPECS,
  REGIONS,
  validateLook,
  type Finish,
  type Layer,
  type LookDocument,
  type Overlay,
  type OverlayKind,
  type Region,
} from "@beautyos/look-format"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useCallback, useEffect, useMemo, useState, useTransition } from "react"
import { archiveLookAction, publishAction, restoreVersionAction, saveDraftAction, unpublishAction } from "@/app/actions"
import { ArStage, type ModelOption } from "@/components/ar-stage"
import { Icon } from "@/components/icons"
import { StatusBadge } from "@/components/look-card"
import { Drawer, downloadResponse, useToast } from "@/components/ui"

type CatalogShade = { shadeId: string; sku: string; name: string; productName: string; region: Region; color: string; finish: Finish; coverage: number; banubaFinish: string | null }
type Media = { id: string; name: string; kind: "image" | "video"; url: string; thumbnailUrl: string | null; mediaType: string; deliverySha256: string; originalName: string; width: number | null; height: number | null; synthetic: boolean; isModel: boolean }
type Version = { version: number; note: string; publishedAt: string }

const pretty = (s: string) => s.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())
const OVERLAY_INFO: Record<OverlayKind, { label: string; hint: string }> = {
  background: { label: "Background", hint: "Replace what's behind the person with an image or video." },
  foreground: { label: "Frame / overlay", hint: "Full-frame image (with transparency) or video on top: frames, light leaks, grain." },
  lut: { label: "Color grade (LUT)", hint: "A LUT image that grades the whole picture." },
  face_video: { label: "Face video", hint: "Video anchored to the face. Use side-by-side alpha for transparency." },
  softlight: { label: "Soft light", hint: "Flattering light on the face, optionally from a texture." },
}

export function LookEditor(props: {
  brand: string
  lookId: string
  initial: LookDocument
  status: string
  dirty: boolean
  publishedVersion: number | null
  versions: Version[]
  catalog: CatalogShade[]
  media: Media[]
  initialModelId?: string
}) {
  const { brand, lookId, catalog, media } = props
  const router = useRouter()
  const toast = useToast()
  const [doc, setDoc] = useState<LookDocument>(props.initial)
  // What the server last confirmed; the save status is derived from it rather than tracked separately.
  const [savedJson, setSavedJson] = useState(() => JSON.stringify(props.initial))
  const [saving, setSaving] = useState<"idle" | "saving" | "error">("idle")
  const [dirty, setDirty] = useState(props.dirty)
  const [tab, setTab] = useState<"makeup" | "effects" | "details">("makeup")
  const [open, setOpen] = useState<string | null>(null)
  const [drawer, setDrawer] = useState<null | "publish" | "export" | "history">(null)
  const [intensity, setIntensity] = useState(1)
  const [pending, startTransition] = useTransition()

  const check = useMemo(() => validateLook(doc), [doc])
  const errors = check.issues.filter((i) => i.level === "error")

  // Autosave: 700 ms after the last valid edit. Compares content, so mounting/re-rendering never saves.
  const docJson = useMemo(() => JSON.stringify(doc), [doc])
  const unsaved = docJson !== savedJson
  useEffect(() => {
    if (!unsaved || !check.ok) return
    const t = setTimeout(async () => {
      setSaving("saving")
      const r = await saveDraftAction(brand, lookId, JSON.parse(docJson))
      if (r.ok) { setSavedJson(docJson); setSaving("idle"); setDirty(r.data.dirty) }
      else { setSaving("error"); toast(r.error, "error") }
    }, 700)
    return () => clearTimeout(t)
  }, [docJson, unsaved, check.ok, brand, lookId, toast])
  const saveStatus = saving === "saving" ? "Saving…" : saving === "error" && unsaved ? "Not saved" : !unsaved ? "All changes saved" : errors.length ? "Fix errors to save" : "Unsaved"

  const update = useCallback((fn: (d: LookDocument) => LookDocument) => setDoc((d) => fn(structuredClone(d))), [])
  const setLayer = (index: number, fn: (l: Layer) => Layer) => update((d) => ({ ...d, layers: d.layers.map((l, i) => (i === index ? fn(l) : l)) }))

  const addLayer = (region: Region, shade?: CatalogShade) =>
    update((d) => {
      const layer: Layer = shade
        ? { region, material: { color: shade.color, finish: shade.finish, coverage: shade.coverage, ...(shade.banubaFinish ? { overrides: { banuba: { finish: shade.banubaFinish } } } : {}) }, shade: { shadeId: shade.shadeId, sku: shade.sku, name: shade.name, productName: shade.productName } }
        : { region, material: { color: "#b5655a", finish: REGION_SPECS[region].finishes[0], coverage: REGION_SPECS[region].defaultCoverage } }
      // Keep same-region layers together, in order.
      const last = d.layers.map((l) => l.region).lastIndexOf(region)
      const layers = [...d.layers]
      layers.splice(last >= 0 ? last + 1 : layers.length, 0, layer)
      setOpen(`${region}:${last >= 0 ? d.layers.filter((l) => l.region === region).length : 0}`)
      return { ...d, layers }
    })

  const models: ModelOption[] = media.filter((m) => m.isModel).map((m) => ({ id: m.id, name: m.name, url: m.url, thumbnailUrl: m.thumbnailUrl }))

  const publish = (note: string) =>
    startTransition(async () => {
      const r = await publishAction(brand, lookId, doc, note)
      if (r.ok) { toast(`Published v${r.data.version}. It's live in the try-on.`); setDirty(false); setDrawer(null); router.refresh() }
      else toast(r.issues?.map((i) => i.message).join(" ") || r.error, "error")
    })

  const saveRender = async (blob: Blob, model: ModelOption) => {
    const body = new FormData()
    body.append("file", blob, "render.png")
    body.append("modelAssetId", model.id)
    body.append("lookId", lookId)
    body.append("lookName", doc.name)
    const res = await fetch(`/api/studio/${brand}/models/render`, { method: "POST", body })
    if (res.ok) { toast(`Saved "${model.name.replace(/ · .*/, "")} · ${doc.name}" to Models.`); router.refresh() }
    else toast((await res.json().catch(() => ({}))).error ?? "Couldn't save the render.", "error")
  }

  return (
    <div className="page" style={{ maxWidth: 1480 }}>
      <div className="page-head" style={{ marginBottom: 16 }}>
        <div className="row" style={{ gap: 12 }}>
          <Link href={`/b/${brand}`} className="btn btn-ghost btn-icon" aria-label="Back to studio"><Icon name="arrowLeft" /></Link>
          <div>
            <h1 style={{ fontSize: 21 }}>{doc.name}</h1>
            <div className="row" style={{ gap: 8, marginTop: 4 }}>
              <StatusBadge status={props.status} dirty={dirty} version={props.publishedVersion} />
              <span className="muted" style={{ fontSize: 12.5 }} aria-live="polite">
                {saveStatus}
              </span>
            </div>
          </div>
        </div>
        <div className="page-actions">
          <button className="btn" onClick={() => setDrawer("history")}><Icon name="history" /> History</button>
          <button className="btn" onClick={() => setDrawer("export")}><Icon name="download" /> Export</button>
          <button className="btn btn-primary" disabled={!check.ok || pending} onClick={() => setDrawer("publish")}><Icon name="publish" /> Publish</button>
        </div>
      </div>

      <div className="editor">
        <div className="stack-sm">
          <ArStage look={doc} intensity={intensity} models={models} initialModelId={props.initialModelId} onSaveRender={saveRender} fileBase={doc.name.toLowerCase().replace(/\W+/g, "-")} />
          <label className="field" style={{ maxWidth: 360 }}>
            <span className="row" style={{ justifyContent: "space-between" }}>Preview intensity <span className="muted">{Math.round(intensity * 100)}%</span></span>
            <input type="range" min={0} max={100} value={Math.round(intensity * 100)} onChange={(e) => setIntensity(Number(e.target.value) / 100)} />
            <span className="hint">Preview only; customers get their own intensity slider.</span>
          </label>
        </div>

        <aside className="card panel" aria-label="Look settings">
          <div className="tabs" role="tablist" style={{ padding: "6px 12px 0", marginBottom: 0, flex: "none" }}>
            {(["makeup", "effects", "details"] as const).map((t) => (
              <button key={t} role="tab" className="tab" aria-selected={tab === t} onClick={() => setTab(t)}>
                {t === "makeup" ? "Makeup" : t === "effects" ? `Effects${doc.overlays.length ? ` · ${doc.overlays.length}` : ""}` : "Details"}
              </button>
            ))}
          </div>
          <div className="panel-scroll">
            {errors.length > 0 && (
              <div className="notice notice-danger">
                <ul className="issues">{errors.map((e, i) => <li key={i}>{e.message}</li>)}</ul>
              </div>
            )}

            {tab === "makeup" && (
              <>
                <label className="field">
                  <span className="row" style={{ justifyContent: "space-between" }}>Skin smoothing <span className="muted">{Math.round(doc.skin.smoothing * 100)}%</span></span>
                  <input type="range" min={0} max={100} value={Math.round(doc.skin.smoothing * 100)} onChange={(e) => update((d) => ({ ...d, skin: { smoothing: Number(e.target.value) / 100 } }))} />
                </label>
                {REGION_GROUPS.map((g) => (
                  <section key={g} className="stack-sm">
                    <h3 className="section-title" style={{ margin: 0 }}>{GROUP_LABELS[g]}</h3>
                    {REGIONS.filter((r) => REGION_SPECS[r].group === g).map((region) => (
                      <RegionEditor
                        key={region}
                        region={region}
                        layers={doc.layers.map((l, i) => ({ l, i })).filter((x) => x.l.region === region)}
                        catalog={catalog.filter((s) => s.region === region)}
                        open={open}
                        setOpen={setOpen}
                        onAdd={(shade) => addLayer(region, shade)}
                        onChange={setLayer}
                        onRemove={(i) => update((d) => ({ ...d, layers: d.layers.filter((_, j) => j !== i) }))}
                      />
                    ))}
                  </section>
                ))}
              </>
            )}

            {tab === "effects" && <EffectsEditor doc={doc} media={media} update={update} />}

            {tab === "details" && (
              <div className="stack">
                <label className="field"><span>Name</span><input className="input" value={doc.name} maxLength={80} onChange={(e) => update((d) => ({ ...d, name: e.target.value }))} /></label>
                <label className="field"><span>Description</span><textarea className="textarea" value={doc.description} maxLength={500} onChange={(e) => update((d) => ({ ...d, description: e.target.value }))} /></label>
                <label className="field">
                  <span>Tags</span>
                  <input className="input" defaultValue={doc.tags.join(", ")} placeholder="everyday, evening, bridal…" onBlur={(e) => update((d) => ({ ...d, tags: e.target.value.split(",").map((t) => t.trim()).filter(Boolean).slice(0, 20) }))} />
                  <span className="hint">Comma-separated. Customers can filter looks by tag.</span>
                </label>
                <div className="row" style={{ justifyContent: "space-between", paddingTop: 8, borderTop: "1px solid var(--line)" }}>
                  {props.status === "published" ? (
                    <button className="btn btn-sm" onClick={() => startTransition(async () => { const r = await unpublishAction(brand, lookId); toast(r.ok ? "Removed from the try-on." : r.error, r.ok ? "info" : "error") })}>Unpublish</button>
                  ) : <span />}
                  <button className="btn btn-sm btn-danger" onClick={() => confirm(`Archive "${doc.name}"? It will be hidden from the studio and the try-on.`) && startTransition(async () => void (await archiveLookAction(brand, lookId)))}>
                    <Icon name="trash" /> Archive look
                  </button>
                </div>
              </div>
            )}
          </div>
        </aside>
      </div>

      {drawer === "publish" && <PublishDrawer onClose={() => setDrawer(null)} onPublish={publish} pending={pending} warnings={check.issues.filter((i) => i.level === "warning").map((i) => i.message)} next={(props.versions[0]?.version ?? 0) + 1} />}
      {drawer === "export" && <ExportDrawer brand={brand} lookId={lookId} hasPublished={props.publishedVersion !== null} onClose={() => setDrawer(null)} />}
      {drawer === "history" && (
        <Drawer title="Version history" onClose={() => setDrawer(null)}>
          {props.versions.length ? (
            <table className="table">
              <thead><tr><th>Version</th><th>Published</th><th>Note</th><th /></tr></thead>
              <tbody>
                {props.versions.map((v) => (
                  <tr key={v.version}>
                    <td><strong>v{v.version}</strong>{v.version === props.publishedVersion && <span className="badge badge-ok" style={{ marginLeft: 6 }}>Live</span>}</td>
                    <td className="soft">{new Date(v.publishedAt).toLocaleString()}</td>
                    <td className="soft">{v.note || "-"}</td>
                    <td>
                      <button className="btn btn-sm" onClick={() => startTransition(async () => {
                        const r = await restoreVersionAction(brand, lookId, v.version)
                        if (r.ok) { setSavedJson(JSON.stringify(r.data)); setDoc(r.data); setDirty(true); toast(`Draft restored from v${v.version}. Publish to make it live.`); setDrawer(null) }
                        else toast(r.error, "error")
                      })}>Restore</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="empty"><strong>Not published yet</strong>Each publish creates a version you can restore.</div>
          )}
        </Drawer>
      )}
    </div>
  )
}

function RegionEditor({ region, layers, catalog, open, setOpen, onAdd, onChange, onRemove }: {
  region: Region
  layers: { l: Layer; i: number }[]
  catalog: CatalogShade[]
  open: string | null
  setOpen: (k: string | null) => void
  onAdd: (shade?: CatalogShade) => void
  onChange: (i: number, fn: (l: Layer) => Layer) => void
  onRemove: (i: number) => void
}) {
  const spec = REGION_SPECS[region]
  const [picking, setPicking] = useState(false)
  const canAdd = layers.length < spec.maxLayers
  return (
    <div>
      <div className="region-head">
        <h4>{spec.label}{spec.maxLayers > 1 && <span className="muted" style={{ fontWeight: 400 }}> · up to {spec.maxLayers} layers</span>}</h4>
        {canAdd && <button className="btn btn-ghost btn-sm" onClick={() => setPicking((p) => !p)} aria-expanded={picking}><Icon name="plus" size={15} /> Add</button>}
      </div>
      {picking && (
        <div className="card card-pad stack-sm" style={{ marginBottom: 8, padding: 12 }}>
          {catalog.length > 0 && (
            <>
              <span className="label">From the catalog</span>
              <div className="swatch-row">
                {catalog.map((s) => (
                  <button key={s.shadeId} className="swatch" style={{ background: s.color }} title={`${s.name} · ${s.sku}`} aria-label={`${s.name} ${s.sku}`} onClick={() => { onAdd(s); setPicking(false) }} />
                ))}
              </div>
            </>
          )}
          <button className="btn btn-sm" onClick={() => { onAdd(); setPicking(false) }}><Icon name="palette" size={15} /> Custom color</button>
        </div>
      )}
      <div className="stack-sm">
        {layers.map(({ l, i }, n) => {
          const key = `${region}:${n}`
          const expanded = open === key
          return (
            <div className="layer" key={i}>
              <span className="swatch" style={{ background: l.material.color, cursor: "default" }} aria-hidden="true" />
              <button className="btn btn-ghost" style={{ justifyContent: "flex-start", height: "auto", padding: 0, textAlign: "left", display: "grid" }} onClick={() => setOpen(expanded ? null : key)} aria-expanded={expanded}>
                <span className="layer-title">{l.shade?.name ?? "Custom color"}{spec.maxLayers > 1 && <span className="muted" style={{ fontWeight: 400 }}> · layer {n + 1}</span>}</span>
                <span className="layer-sub">{pretty(l.material.finish)} · {Math.round(l.material.coverage * 100)}%{l.shade?.sku ? ` · ${l.shade.sku}` : ""}</span>
              </button>
              <button className="btn btn-ghost btn-icon btn-sm" onClick={() => onRemove(i)} aria-label={`Remove ${spec.label} layer`}><Icon name="trash" size={15} /></button>
              {expanded && (
                <div className="layer-body">
                  <div className="row">
                    <input type="color" value={l.material.color} aria-label="Color" onChange={(e) => onChange(i, (x) => ({ ...x, material: { ...x.material, color: e.target.value }, shade: undefined }))} />
                    <select className="select" style={{ flex: 1 }} value={l.material.finish} aria-label="Finish" onChange={(e) => onChange(i, (x) => ({ ...x, material: { ...x.material, finish: e.target.value as Finish } }))}>
                      {spec.finishes.map((f) => <option key={f} value={f}>{pretty(f)}</option>)}
                    </select>
                  </div>
                  <label className="field">
                    <span className="row" style={{ justifyContent: "space-between" }}>Intensity <span className="muted">{Math.round(l.material.coverage * 100)}%</span></span>
                    <input type="range" min={0} max={100} value={Math.round(l.material.coverage * 100)} onChange={(e) => onChange(i, (x) => ({ ...x, material: { ...x.material, coverage: Number(e.target.value) / 100 } }))} />
                  </label>
                  {l.shade && <p className="hint" style={{ margin: 0 }}>Linked to {l.shade.productName} · {l.shade.name} ({l.shade.sku}). Changing the color unlinks it.</p>}
                  <details className="advanced">
                    <summary>Advanced: finish for Banuba export</summary>
                    <select className="select" value={l.material.overrides?.banuba?.finish ?? ""} onChange={(e) => onChange(i, (x) => ({ ...x, material: { ...x.material, overrides: e.target.value ? { ...x.material.overrides, banuba: { finish: e.target.value } } : undefined } }))}>
                      <option value="">Automatic (from {pretty(l.material.finish)})</option>
                      {BANUBA_FINISHES[region].map((f) => <option key={f} value={f}>{pretty(f)}</option>)}
                    </select>
                  </details>
                </div>
              )}
            </div>
          )
        })}
        {!layers.length && !picking && <p className="muted" style={{ margin: 0, fontSize: 12.5 }}>None</p>}
      </div>
    </div>
  )
}

function EffectsEditor({ doc, media, update }: { doc: LookDocument; media: Media[]; update: (fn: (d: LookDocument) => LookDocument) => void }) {
  const kinds: OverlayKind[] = ["background", "foreground", "lut", "face_video", "softlight"]
  const ref = (m: Media) => ({ assetId: m.id, url: m.url, mediaType: m.mediaType, sha256: m.deliverySha256, fileName: m.originalName })
  const set = (kind: OverlayKind, o: Overlay | null) => update((d) => ({ ...d, overlays: [...d.overlays.filter((x) => x.kind !== kind), ...(o ? [o] : [])] }))
  return (
    <div className="stack">
      <p className="hint" style={{ margin: 0 }}>Effects use media from Assets. Drop an image or video anywhere to add it.</p>
      {kinds.map((kind) => {
        const current = doc.overlays.find((o) => o.kind === kind)
        const usable = media.filter((m) => (OVERLAY_MEDIA[kind] as readonly string[]).includes(m.kind) && !m.isModel)
        return (
          <section key={kind} className="stack-sm">
            <div className="region-head"><h4>{OVERLAY_INFO[kind].label}</h4>{current && <button className="btn btn-ghost btn-sm" onClick={() => set(kind, null)}>Remove</button>}</div>
            <p className="hint" style={{ margin: 0 }}>{OVERLAY_INFO[kind].hint}</p>
            {kind === "softlight" ? (
              <label className="field">
                <span className="row" style={{ justifyContent: "space-between" }}>Strength <span className="muted">{Math.round(((current as { strength?: number })?.strength ?? 0) * 100)}%</span></span>
                <input type="range" min={0} max={100} value={Math.round(((current as { strength?: number })?.strength ?? 0) * 100)} onChange={(e) => { const v = Number(e.target.value) / 100; set("softlight", v ? { kind: "softlight", strength: v } : null) }} />
              </label>
            ) : (
              <>
                <div className="row" style={{ gap: 6 }}>
                  {usable.slice(0, 12).map((m) => {
                    const on = current && "asset" in current && current.asset?.assetId === m.id
                    return (
                      <button key={m.id} className="tile" aria-pressed={on} style={{ width: 64, padding: 0, cursor: "pointer", outline: on ? "2px solid var(--accent)" : undefined }} title={m.name}
                        onClick={() => set(kind, kind === "background" ? { kind, asset: ref(m), contentMode: "scale_to_fill", blend: "default", rotation: 0, scale: 1 }
                          : kind === "foreground" ? { kind, asset: ref(m), contentMode: "scale_to_fill", blend: "alpha", rotation: 0 }
                          : kind === "lut" ? { kind, asset: ref(m), strength: 1 }
                          : { kind: "face_video", asset: ref(m), splitAlpha: false, rotation: [-90, 0, 0], scale: [1, 1, 1], translation: [0, 0, 0] })}>
                        <div className="tile-media" style={{ aspectRatio: "1" }}>{m.thumbnailUrl && <img src={m.thumbnailUrl} alt="" />}</div>
                      </button>
                    )
                  })}
                  {!usable.length && <span className="muted" style={{ fontSize: 12.5 }}>No {OVERLAY_MEDIA[kind].join(" or ")} assets yet.</span>}
                </div>
                {current?.kind === "lut" && (
                  <label className="field"><span>Strength</span><input type="range" min={0} max={100} value={Math.round(current.strength * 100)} onChange={(e) => set("lut", { ...current, strength: Number(e.target.value) / 100 })} /></label>
                )}
                {(current?.kind === "background" || current?.kind === "foreground") && (
                  <details className="advanced">
                    <summary>Advanced</summary>
                    <div className="grid-2">
                      <label className="field"><span>Fit</span>
                        <select className="select" value={current.contentMode} onChange={(e) => set(kind, { ...current, contentMode: e.target.value as "fill" } as Overlay)}>
                          <option value="scale_to_fill">Fill (crop)</option><option value="fit">Fit</option><option value="fill">Stretch</option>
                        </select>
                      </label>
                      <label className="field"><span>Blend</span>
                        <select className="select" value={current.blend} onChange={(e) => set(kind, { ...current, blend: e.target.value } as Overlay)}>
                          {(current.kind === "background" ? ["default", "screen", "multiply", "split_alpha"] : ["alpha", "premul_alpha", "screen", "add", "multiply", "min", "max"]).map((b) => <option key={b} value={b}>{pretty(b)}</option>)}
                        </select>
                      </label>
                    </div>
                  </details>
                )}
                {current?.kind === "face_video" && (
                  <label className="row" style={{ fontSize: 13 }}>
                    <input type="checkbox" checked={current.splitAlpha} onChange={(e) => set("face_video", { ...current, splitAlpha: e.target.checked })} /> Video has alpha on its right half
                  </label>
                )}
              </>
            )}
          </section>
        )
      })}
    </div>
  )
}

function PublishDrawer({ onClose, onPublish, pending, warnings, next }: { onClose: () => void; onPublish: (note: string) => void; pending: boolean; warnings: string[]; next: number }) {
  const [note, setNote] = useState("")
  return (
    <Drawer title={`Publish v${next}`} onClose={onClose} footer={<><button className="btn" onClick={onClose}>Cancel</button><button className="btn btn-primary" disabled={pending} onClick={() => onPublish(note)}>{pending ? "Publishing…" : "Publish to try-on"}</button></>}>
      <p className="soft" style={{ margin: 0 }}>Customers see this version right away in the try-on and the public API. Earlier versions stay in history.</p>
      {warnings.length > 0 && <div className="notice notice-warn"><ul className="issues">{warnings.map((w, i) => <li key={i}>{w}</li>)}</ul></div>}
      <label className="field"><span>What changed? (optional)</span><textarea className="textarea" value={note} onChange={(e) => setNote(e.target.value)} placeholder="e.g. Deeper lip for the holiday campaign" /></label>
    </Drawer>
  )
}

const TARGETS = [
  { id: "banuba-effect", label: "Banuba effect", ext: ".zip", hint: "Ready to load in Banuba Face AR SDK on Web, iOS, Android, Flutter and React Native." },
  { id: "bundle", label: "Portable bundle", ext: ".zip", hint: "Look + all media + manifest. For other AR platforms, agencies and archives." },
  { id: "beautyos", label: "Beauty OS look", ext: ".json", hint: "Lossless. Re-import into any Beauty OS workspace." },
  { id: "banuba", label: "Banuba config only", ext: ".json", hint: "Just the prefab config.json." },
]

function ExportDrawer({ brand, lookId, hasPublished, onClose }: { brand: string; lookId: string; hasPublished: boolean; onClose: () => void }) {
  const toast = useToast()
  const [source, setSource] = useState<"draft" | "published">(hasPublished ? "published" : "draft")
  const [busy, setBusy] = useState<string | null>(null)
  const go = async (target: string) => {
    setBusy(target)
    try {
      const { name, notes } = await downloadResponse(await fetch(`/api/studio/${brand}/looks/${lookId}/export?target=${target}&source=${source}`), "look")
      toast(`Exported ${name}${notes ? `. ${decodeURIComponent(notes)}` : ""}`)
    } catch (e) {
      toast(e instanceof Error ? e.message : String(e), "error")
    } finally {
      setBusy(null)
    }
  }
  return (
    <Drawer title="Export look" onClose={onClose}>
      <div className="segmented" role="group" aria-label="Version">
        <button aria-pressed={source === "published"} disabled={!hasPublished} onClick={() => setSource("published")}>Published</button>
        <button aria-pressed={source === "draft"} onClick={() => setSource("draft")}>Current draft</button>
      </div>
      <div className="stack-sm">
        {TARGETS.map((t) => (
          <div key={t.id} className="card card-pad row" style={{ justifyContent: "space-between", padding: 14 }}>
            <div style={{ flex: 1, minWidth: 200 }}>
              <strong>{t.label}</strong> <span className="muted mono">{t.ext}</span>
              <div className="hint">{t.hint}</div>
            </div>
            <button className="btn btn-sm" disabled={busy !== null} onClick={() => go(t.id)}><Icon name="download" size={15} /> {busy === t.id ? "Exporting…" : "Download"}</button>
          </div>
        ))}
      </div>
      <p className="hint" style={{ margin: 0 }}>Stills and video of this look: use PNG, JPEG and Record on the preview, then export any size or format from Assets.</p>
    </Drawer>
  )
}
