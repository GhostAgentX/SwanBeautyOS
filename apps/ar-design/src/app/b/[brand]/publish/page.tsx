import { headers } from "next/headers"
import { getDb } from "@/db/client"
import * as repo from "@/server/repo"
import { CopyField } from "./copy-field"

export default async function PublishPage({ params }: PageProps<"/b/[brand]/publish">) {
  const { brand } = await params
  const db = await getDb()
  const { looks } = await repo.publishedLooks(db, brand)
  const h = await headers()
  const origin = process.env.BEAUTYOS_PUBLIC_URL ?? `${h.get("x-forwarded-proto") ?? "http"}://${h.get("host")}`
  const tryon = process.env.BEAUTYOS_TRYON_URL ?? "http://localhost:5173"
  const api = `${origin}/api/v1/brands/${brand}/looks`
  const embed = `<iframe src="${tryon}/?brand=${brand}&api=${encodeURIComponent(origin)}&embed=1"\n  allow="camera; fullscreen" style="width:100%;height:760px;border:0;border-radius:16px"\n  title="Virtual try-on"></iframe>`
  return (
    <div className="page" style={{ maxWidth: 980 }}>
      <div className="page-head">
        <div>
          <h1>Publish & embed</h1>
          <p>{looks.length} live look{looks.length === 1 ? "" : "s"}. Published versions reach customers through the try-on and the public API.</p>
        </div>
        <a className="btn btn-primary" href={`${tryon}/?brand=${brand}&api=${encodeURIComponent(origin)}`} target="_blank" rel="noreferrer">Open try-on</a>
      </div>
      <div className="stack">
        <div className="card card-pad stack-sm">
          <h2 className="section-title" style={{ margin: 0 }}>Embed on a storefront</h2>
          <p className="soft" style={{ margin: 0 }}>Paste this where the try-on should appear. Add <span className="mono">&look=slug</span> to open a specific look.</p>
          <CopyField value={embed} multiline />
        </div>
        <div className="card card-pad stack-sm">
          <h2 className="section-title" style={{ margin: 0 }}>Public API</h2>
          <p className="soft" style={{ margin: 0 }}>Read-only and CORS-enabled. Returns each live look as a portable Beauty OS document.</p>
          <CopyField value={api} />
          <p className="soft" style={{ margin: 0 }}>Per-look exports for other AR platforms: <span className="mono">/looks/&#123;slug&#125;/export?target=banuba-effect|bundle|banuba|beautyos</span></p>
        </div>
        <div className="card">
          <table className="table">
            <thead><tr><th>Live look</th><th>Version</th><th>Published</th><th>Exports</th></tr></thead>
            <tbody>
              {looks.map((l) => (
                <tr key={l.id}>
                  <td><strong>{l.look.name}</strong> <span className="muted mono">{l.slug}</span></td>
                  <td>v{l.version}</td>
                  <td className="soft">{l.publishedAt.toLocaleDateString()}</td>
                  <td className="row" style={{ gap: 6 }}>
                    {["banuba-effect", "bundle"].map((t) => <a key={t} className="btn btn-sm" href={`/api/v1/brands/${brand}/looks/${l.slug}/export?target=${t}`}>{t === "bundle" ? "Bundle" : "Banuba"}</a>)}
                  </td>
                </tr>
              ))}
              {!looks.length && <tr><td colSpan={4} className="muted">Nothing live yet. Publish a look from the editor.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
