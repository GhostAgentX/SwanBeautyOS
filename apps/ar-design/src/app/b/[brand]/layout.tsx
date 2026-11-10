import { notFound } from "next/navigation"
import { BrandSwitch } from "@/components/brand-switch"
import { ImportProvider } from "@/components/importer"
import { Nav } from "@/components/nav"
import { ThemeToggle } from "@/components/theme-toggle"
import { ToastProvider } from "@/components/ui"
import { getDb } from "@/db/client"
import { listBrands } from "@/server/repo"

export const dynamic = "force-dynamic"

export default async function BrandLayout({ children, params }: LayoutProps<"/b/[brand]">) {
  const { brand } = await params
  const brands = await listBrands(await getDb())
  const current = brands.find((b) => b.slug === brand)
  if (!current) notFound()
  return (
    <div className="shell" style={{ ["--accent" as string]: current.accentColor }}>
      <aside className="sidebar">
        <div className="brandmark">
          <div className="brandmark-logo" aria-hidden="true">{current.name.slice(0, 1)}</div>
          <div className="brandmark-text">
            <strong>{current.name}</strong>
            <span>Beauty OS · AR Design</span>
          </div>
        </div>
        <BrandSwitch current={brand} brands={brands.map((b) => ({ slug: b.slug, name: b.name }))} />
        <Nav brand={brand} />
        <div className="sidebar-foot">
          <span className="muted" style={{ fontSize: 12 }}>Drop files anywhere to import</span>
          <ThemeToggle />
        </div>
      </aside>
      <ToastProvider>
        <ImportProvider brand={brand}>
          <main className="main">{children}</main>
        </ImportProvider>
      </ToastProvider>
    </div>
  )
}
