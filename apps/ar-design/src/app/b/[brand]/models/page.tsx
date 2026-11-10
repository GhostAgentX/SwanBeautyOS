import { getDb } from "@/db/client"
import { modules } from "@/modules"
import * as repo from "@/server/repo"
import { ModelsView } from "./models-view"

export default async function ModelsPage({ params, searchParams }: PageProps<"/b/[brand]/models">) {
  const { brand } = await params
  const { asset } = await searchParams
  const db = await getDb()
  const b = await repo.getBrandBySlug(db, brand)
  const [assets, looks] = await Promise.all([repo.listAssets(db, b.id), repo.listLooks(db, b.id)])
  const generator = modules().imageGenerators.preferred()
  const info = modules().imageGenerators.list()[0]
  return (
    <ModelsView
      brand={brand}
      generator={generator ? { ready: true, label: generator.label } : { ready: false, label: info?.label ?? "Image generator", requirement: info?.requirement ?? "" }}
      media={assets.filter((a) => a.provenance?.synthetic).map((a) => ({ id: a.id, name: a.name, url: a.url, thumbnailUrl: a.thumbnailUrl, look: a.provenance!.look ?? null, spec: a.provenance!.spec ?? null }))}
      looks={looks.map((l) => ({ id: l.id, name: l.name, description: l.draft.description }))}
      focus={typeof asset === "string" ? asset : undefined}
    />
  )
}
