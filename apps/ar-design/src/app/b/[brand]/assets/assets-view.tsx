"use client"
import { useMemo, useState } from "react"
import { deleteAssetAction } from "@/app/actions"
import { Icon } from "@/components/icons"
import { useImporter } from "@/components/importer"
import { Drawer, downloadResponse, formatBytes, useToast } from "@/components/ui"
import type { assets as assetsTable } from "@/db/schema"
import { ExportProfileEditor } from "./export-profile-editor"

type Asset = Omit<typeof assetsTable.$inferSelect, "createdAt"> & { createdAt: string }
const FILTERS = [
  { id: "all", label: "All" },
  { id: "image", label: "Images" },
  { id: "video", label: "Videos" },
  { id: "synthetic", label: "Synthetic" },
] as const

export function AssetsView({ brand, assets }: { brand: string; assets: Asset[] }) {
  const { upload } = useImporter()
  const toast = useToast()
  const [filter, setFilter] = useState<(typeof FILTERS)[number]["id"]>("all")
  const [enhance, setEnhance] = useState("none")
  const [over, setOver] = useState(false)
  const [selected, setSelected] = useState<Asset | null>(null)
  const shown = useMemo(() => assets.filter((a) => filter === "all" || (filter === "synthetic" ? a.provenance?.synthetic : a.kind === filter)), [assets, filter])

  return (
    <div className="page">
      <div className="page-head">
        <div>
          <h1>Assets</h1>
          <p>Images and videos for backgrounds, overlays, LUTs and face textures, plus synthetic models and renders. Export anything at any size and format.</p>
        </div>
      </div>

      <div
        className="dropzone"
        data-over={over}
        data-own-drop
        onDragOver={(e) => { e.preventDefault(); setOver(true) }}
        onDragLeave={() => setOver(false)}
        onDrop={(e) => { e.preventDefault(); setOver(false); void upload(Array.from(e.dataTransfer.files), { enhance }) }}
        onClick={(e) => { if ((e.target as HTMLElement).closest("select")) return; const i = document.createElement("input"); i.type = "file"; i.multiple = true; i.accept = "image/*,video/*"; i.onchange = () => void upload(Array.from(i.files ?? []), { enhance }); i.click() }}
        role="button"
        tabIndex={0}
        aria-label="Upload images or videos"
      >
        <Icon name="upload" size={20} />
        <p style={{ margin: "8px 0 10px" }}><strong>Drop images or videos</strong> or click to browse. JPEG, PNG, WebP, AVIF, HEIC, TIFF, MP4, MOV, WebM.</p>
        <label className="row" style={{ justifyContent: "center", gap: 8 }} onClick={(e) => e.stopPropagation()}>
          <span className="label">Enhance images</span>
          <select className="select" style={{ width: 190 }} value={enhance} onChange={(e) => setEnhance(e.target.value)}>
            <option value="none">Off (keep as shot)</option>
            <option value="natural">Natural (auto levels)</option>
            <option value="crisp">Crisp (detail + contrast)</option>
            <option value="hyperreal">Hyperreal (texture + depth)</option>
          </select>
        </label>
      </div>

      <div className="row" style={{ justifyContent: "space-between", margin: "22px 0 14px" }}>
        <div className="segmented" role="group" aria-label="Filter">
          {FILTERS.map((f) => <button key={f.id} aria-pressed={filter === f.id} onClick={() => setFilter(f.id)}>{f.label}</button>)}
        </div>
        <span className="muted">{shown.length} item{shown.length === 1 ? "" : "s"}</span>
      </div>

      {shown.length ? (
        <div className="gallery">
          {shown.map((a) => (
            <button key={a.id} className="tile" style={{ padding: 0, cursor: "pointer", textAlign: "left" }} onClick={() => setSelected(a)}>
              <div className="tile-media">{a.thumbnailUrl ? <img src={a.thumbnailUrl} alt="" loading="lazy" /> : <Icon name={a.kind === "video" ? "film" : "image"} size={28} />}</div>
              <div className="tile-badges">
                {a.kind === "video" && <span className="badge">Video · {Math.round((a.durationMs ?? 0) / 1000)}s</span>}
                {a.provenance?.synthetic && <span className="badge badge-accent">Synthetic</span>}
              </div>
              <div className="tile-body">
                <div className="tile-title">{a.name}</div>
                <div className="tile-meta"><span>{a.width}×{a.height}</span><span>{formatBytes(a.bytes)}</span></div>
              </div>
            </button>
          ))}
        </div>
      ) : (
        <div className="card empty"><strong>Nothing here yet</strong>Drop files above or anywhere in the studio.</div>
      )}

      {selected && (
        <Drawer title={selected.name} onClose={() => setSelected(null)}>
          <div style={{ borderRadius: 12, overflow: "hidden", background: "var(--surface-2)" }}>
            {selected.kind === "video" ? <video src={selected.url} controls muted playsInline poster={selected.thumbnailUrl ?? undefined} /> : <img src={selected.url} alt={selected.name} />}
          </div>
          <dl className="kv">
            <dt>Size</dt><dd>{selected.width}×{selected.height} · {formatBytes(selected.bytes)}</dd>
            <dt>Format</dt><dd>{selected.mediaType}{selected.hasAlpha ? " · transparency" : ""}</dd>
            {selected.durationMs ? <><dt>Duration</dt><dd>{(selected.durationMs / 1000).toFixed(1)} s</dd></> : null}
            <dt>Processing</dt><dd>{selected.processing.join(" · ") || "none"}</dd>
            <dt>Original</dt><dd className="soft">{selected.originalName}</dd>
          </dl>
          {selected.palette.length > 0 && (
            <div className="stack-sm">
              <span className="label">Dominant colors</span>
              <div className="swatch-row">{selected.palette.map((p) => <span key={p.hex} className="swatch" style={{ background: p.hex, cursor: "default" }} title={`${p.hex} · ${Math.round(p.share * 100)}%`} />)}</div>
            </div>
          )}
          {selected.provenance && (
            <div className="notice">
              <div>
                <strong>Synthetic media.</strong> Generated by {selected.provenance.model} ({selected.provenance.generator}){selected.provenance.seed !== undefined ? `, seed ${selected.provenance.seed}` : ""}.
                {selected.provenance.look && <> Look: {selected.provenance.look.name} ({selected.provenance.look.method === "ar-engine" ? "applied with the AR engine" : "generated"}).</>}
              </div>
            </div>
          )}
          <ExportProfileEditor
            kind={selected.kind}
            onExport={async (profile) => {
              const res = await fetch(`/api/studio/${brand}/assets/${selected.id}/export`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(profile) })
              const { name, notes } = await downloadResponse(res, "export")
              toast(`Exported ${name}${notes ? `. ${decodeURIComponent(notes)}` : ""}`)
            }}
          />
          <div className="row" style={{ justifyContent: "space-between", borderTop: "1px solid var(--line)", paddingTop: 14 }}>
            <a className="btn btn-sm" href={selected.url} download><Icon name="download" size={15} /> Delivery file</a>
            <button className="btn btn-sm btn-danger" onClick={async () => {
              if (!confirm(`Delete "${selected.name}"? Looks that use it will lose this effect.`)) return
              const r = await deleteAssetAction(brand, selected.id)
              if (r.ok) { setSelected(null); toast("Deleted.") } else toast(r.error, "error")
            }}><Icon name="trash" size={15} /> Delete</button>
          </div>
        </Drawer>
      )}
    </div>
  )
}
