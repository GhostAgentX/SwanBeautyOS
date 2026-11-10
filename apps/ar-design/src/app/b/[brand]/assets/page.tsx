import { getDb } from "@/db/client"
import * as repo from "@/server/repo"
import { AssetsView } from "./assets-view"

export default async function AssetsPage({ params }: PageProps<"/b/[brand]/assets">) {
  const { brand } = await params
  const db = await getDb()
  const b = await repo.getBrandBySlug(db, brand)
  const assets = await repo.listAssets(db, b.id)
  return (
    <AssetsView
      brand={brand}
      assets={assets.map((a) => ({ ...a, createdAt: a.createdAt.toISOString() }))}
    />
  )
}
