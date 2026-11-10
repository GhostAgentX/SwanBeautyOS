import { redirect } from "next/navigation"
import { getDb } from "@/db/client"
import { listBrands } from "@/server/repo"
import { NewBrandForm } from "./new-brand-form"
import { ThemeToggle } from "@/components/theme-toggle"

export const dynamic = "force-dynamic"

export default async function Home({ searchParams }: PageProps<"/">) {
  const brands = await listBrands(await getDb())
  const wantsNew = (await searchParams).new === "1"
  if (brands.length === 1 && !wantsNew) redirect(`/b/${brands[0].slug}`)
  return (
    <div className="page" style={{ maxWidth: 760 }}>
      <div className="page-head">
        <div>
          <h1>Beauty OS · AR Design</h1>
          <p>Choose a brand to work on, or create a new one.</p>
        </div>
        <ThemeToggle />
      </div>
      <div className="stack">
        {brands.map((b) => (
          <a key={b.id} href={`/b/${b.slug}`} className="card card-pad row" style={{ justifyContent: "space-between" }}>
            <span className="row">
              <span className="brandmark-logo" style={{ background: b.accentColor }}>{b.name.slice(0, 1)}</span>
              <strong>{b.name}</strong>
            </span>
            <span className="muted mono">/{b.slug}</span>
          </a>
        ))}
        <div className="card card-pad">
          <h2 className="section-title">New brand</h2>
          <NewBrandForm />
        </div>
      </div>
    </div>
  )
}
