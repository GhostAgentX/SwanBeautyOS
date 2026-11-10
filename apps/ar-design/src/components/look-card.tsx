import Link from "next/link"
import type { LookDocument } from "@beautyos/look-format"
import { previewColors } from "@beautyos/look-format"

export function StatusBadge({ status, dirty, version }: { status: string; dirty: boolean; version: number | null }) {
  if (status === "published" && !dirty) return <span className="badge badge-ok badge-dot">Live v{version}</span>
  if (status === "published") return <span className="badge badge-warn badge-dot">Live v{version} · unpublished edits</span>
  return <span className="badge">Draft</span>
}

export function LookCard({ href, look, status, dirty, version }: { href: string; look: LookDocument; status: string; dirty: boolean; version: number | null }) {
  const colors = previewColors(look, 4)
  return (
    <Link href={href} className="tile">
      <div className="look-hero" aria-hidden="true" style={{ gridTemplateColumns: `repeat(${Math.max(1, colors.length)}, 1fr)` }}>
        {(colors.length ? colors : ["var(--surface-2)"]).map((c, i) => (
          <span key={i} style={{ background: c }} />
        ))}
      </div>
      <div className="tile-body">
        <div className="tile-title">{look.name}</div>
        <div className="tile-meta">
          <StatusBadge status={status} dirty={dirty} version={version} />
          <span>{look.layers.length} layers{look.overlays.length ? ` · ${look.overlays.length} FX` : ""}</span>
        </div>
      </div>
    </Link>
  )
}
