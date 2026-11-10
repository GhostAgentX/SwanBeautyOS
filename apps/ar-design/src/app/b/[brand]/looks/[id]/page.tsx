import { notFound } from "next/navigation"
import { getDb } from "@/db/client"
import * as repo from "@/server/repo"
import { LookEditor } from "./look-editor"

export default async function LookPage({ params, searchParams }: PageProps<"/b/[brand]/looks/[id]">) {
  const { brand, id } = await params
  const { model } = await searchParams
  const db = await getDb()
  const b = await repo.getBrandBySlug(db, brand)
  const look = await repo.getLook(db, b.id, id).catch(() => null)
  if (!look) notFound()
  const [versions, catalog, assets] = await Promise.all([repo.listVersions(db, id), repo.catalogShades(db, b.id), repo.listAssets(db, b.id)])
  const media = assets.map((a) => ({
    id: a.id, name: a.name, kind: a.kind, url: a.url, thumbnailUrl: a.thumbnailUrl, mediaType: a.mediaType,
    deliverySha256: a.deliverySha256, originalName: a.originalName, width: a.width, height: a.height,
    synthetic: Boolean(a.provenance?.synthetic), isModel: Boolean(a.provenance?.synthetic && !a.provenance.look),
  }))
  return (
    <LookEditor
      brand={brand}
      lookId={id}
      initial={look.draft}
      status={look.status}
      dirty={look.dirty}
      publishedVersion={look.publishedVersion}
      versions={versions.map((v) => ({ version: v.version, note: v.note, publishedAt: v.publishedAt.toISOString() }))}
      catalog={catalog}
      media={media}
      initialModelId={typeof model === "string" ? model : undefined}
      clientToken={process.env.BANUBA_CLIENT_TOKEN ?? ""}
    />
  )
}
