import { getDb } from "@/db/client"
import * as repo from "@/server/repo"
import { CatalogView } from "./catalog-view"

export default async function CatalogPage({ params }: PageProps<"/b/[brand]/catalog">) {
  const { brand } = await params
  const db = await getDb()
  const b = await repo.getBrandBySlug(db, brand)
  const catalog = await repo.listCatalog(db, b.id)
  return <CatalogView brand={brand} catalog={catalog.map((p) => ({ ...p, shades: p.shades.map((s) => ({ id: s.id, name: s.name, sku: s.sku, color: s.color, finish: s.finish, coverage: s.coverage, banubaFinish: s.banubaFinish })) }))} />
}
