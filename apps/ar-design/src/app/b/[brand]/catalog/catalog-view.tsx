"use client"
import { BANUBA_FINISHES, GROUP_LABELS, REGION_GROUPS, REGION_SPECS, REGIONS, type Region } from "@beautyos/look-format"
import { useState, useTransition } from "react"
import { addShadeAction, archiveProductAction, createProductAction, deleteShadeAction } from "@/app/actions"
import { Icon } from "@/components/icons"
import { useToast } from "@/components/ui"

type Shade = { id: string; name: string; sku: string; color: string; finish: string; coverage: number; banubaFinish: string | null }
type Product = { id: string; name: string; region: Region; description: string; shades: Shade[] }
const pretty = (s: string) => s.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())

export function CatalogView({ brand, catalog }: { brand: string; catalog: Product[] }) {
  const toast = useToast()
  const [pending, start] = useTransition()
  const [adding, setAdding] = useState(false)
  const [np, setNp] = useState({ name: "", region: "lips" as Region })
  const total = catalog.reduce((n, p) => n + p.shades.length, 0)
  return (
    <div className="page">
      <div className="page-head">
        <div>
          <h1>Catalog</h1>
          <p>{catalog.length} products · {total} shades. Looks link to these SKUs so customers can shop what they try on.</p>
        </div>
        <button className="btn btn-primary" onClick={() => setAdding(true)}><Icon name="plus" /> New product</button>
      </div>
      {adding && (
        <div className="card card-pad row" style={{ alignItems: "flex-end", marginBottom: 20 }}>
          <label className="field" style={{ flex: 1, minWidth: 220 }}><span>Product name</span><input className="input" autoFocus value={np.name} onChange={(e) => setNp({ ...np, name: e.target.value })} placeholder="e.g. Velvet Lip Color" /></label>
          <label className="field"><span>Region</span><select className="select" value={np.region} onChange={(e) => setNp({ ...np, region: e.target.value as Region })}>{REGIONS.map((r) => <option key={r} value={r}>{REGION_SPECS[r].label}</option>)}</select></label>
          <button className="btn" onClick={() => setAdding(false)}>Cancel</button>
          <button className="btn btn-primary" disabled={!np.name.trim() || pending} onClick={() => start(async () => { const r = await createProductAction(brand, np); if (r.ok) { setAdding(false); setNp({ name: "", region: "lips" }) } else toast(r.error, "error") })}>Create</button>
        </div>
      )}
      <div className="stack">
        {REGION_GROUPS.map((g) => {
          const products = catalog.filter((p) => REGION_SPECS[p.region].group === g)
          if (!products.length) return null
          return (
            <section key={g} className="stack-sm">
              <h2 className="section-title">{GROUP_LABELS[g]}</h2>
              {products.map((p) => <ProductCard key={p.id} brand={brand} product={p} />)}
            </section>
          )
        })}
        {!catalog.length && <div className="card empty"><strong>No products yet</strong>Add your first product line.</div>}
      </div>
    </div>
  )
}

function ProductCard({ brand, product }: { brand: string; product: Product }) {
  const toast = useToast()
  const spec = REGION_SPECS[product.region]
  const [pending, start] = useTransition()
  const [form, setForm] = useState({ name: "", sku: "", color: "#b5655a", finish: spec.finishes[0] as string, banubaFinish: "" })
  const [open, setOpen] = useState(false)
  return (
    <div className="card">
      <div className="card-head">
        <h3>{product.name} <span className="muted" style={{ fontWeight: 400 }}>· {spec.label} · {product.shades.length} shades</span></h3>
        <div className="row" style={{ gap: 6 }}>
          <button className="btn btn-sm" onClick={() => setOpen((o) => !o)} aria-expanded={open}><Icon name="plus" size={15} /> Shade</button>
          <button className="btn btn-ghost btn-sm" onClick={() => confirm(`Archive ${product.name}? Existing looks keep their colors.`) && start(async () => { const r = await archiveProductAction(brand, product.id); if (!r.ok) toast(r.error, "error") })}>Archive</button>
        </div>
      </div>
      {open && (
        <div className="card-pad stack-sm" style={{ borderBottom: "1px solid var(--line)" }}>
          <div className="row" style={{ alignItems: "flex-end" }}>
            <label className="field"><span>Color</span><input type="color" value={form.color} onChange={(e) => setForm({ ...form, color: e.target.value })} /></label>
            <label className="field" style={{ flex: 1, minWidth: 140 }}><span>Shade name</span><input className="input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></label>
            <label className="field" style={{ width: 140 }}><span>SKU</span><input className="input mono" value={form.sku} onChange={(e) => setForm({ ...form, sku: e.target.value.toUpperCase() })} /></label>
            <label className="field"><span>Finish</span><select className="select" value={form.finish} onChange={(e) => setForm({ ...form, finish: e.target.value })}>{spec.finishes.map((f) => <option key={f} value={f}>{pretty(f)}</option>)}</select></label>
            <button className="btn btn-primary" disabled={pending || !form.name || !form.sku} onClick={() => start(async () => {
              const r = await addShadeAction(brand, product.id, { ...form, banubaFinish: form.banubaFinish || null })
              if (r.ok) setForm({ ...form, name: "", sku: "" })
              else toast(r.error, "error")
            })}>Add shade</button>
          </div>
          <details className="advanced">
            <summary>Advanced: finish for Banuba export</summary>
            <select className="select" style={{ maxWidth: 320 }} value={form.banubaFinish} onChange={(e) => setForm({ ...form, banubaFinish: e.target.value })}>
              <option value="">Automatic</option>
              {BANUBA_FINISHES[product.region].map((f) => <option key={f} value={f}>{pretty(f)}</option>)}
            </select>
          </details>
        </div>
      )}
      {product.shades.length > 0 && (
        <table className="table">
          <thead><tr><th style={{ width: 48 }} /><th>Shade</th><th>SKU</th><th>Finish</th><th>Color</th><th /></tr></thead>
          <tbody>
            {product.shades.map((s) => (
              <tr key={s.id}>
                <td><span className="swatch" style={{ background: s.color, cursor: "default" }} /></td>
                <td><strong>{s.name}</strong></td>
                <td className="mono">{s.sku}</td>
                <td className="soft">{pretty(s.finish)}{s.banubaFinish ? <span className="hint"> · Banuba export: {pretty(s.banubaFinish)}</span> : null}</td>
                <td className="mono soft">{s.color}</td>
                <td style={{ textAlign: "right" }}><button className="btn btn-ghost btn-icon btn-sm" aria-label={`Delete ${s.name}`} onClick={() => confirm(`Delete ${s.name} (${s.sku})?`) && start(async () => { const r = await deleteShadeAction(brand, s.id); if (!r.ok) toast(r.error, "error") })}><Icon name="trash" size={15} /></button></td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}
