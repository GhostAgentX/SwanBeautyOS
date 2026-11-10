import { getDb } from "@/db/client"
import { modules } from "@/modules"
import * as repo from "@/server/repo"
import { LabView } from "./lab-view"

export default async function LabPage({ params }: PageProps<"/b/[brand]/lab">) {
  const { brand } = await params
  const db = await getDb()
  const b = await repo.getBrandBySlug(db, brand)
  const libraries = await repo.listLibraries(db, b.id)
  return (
    <LabView
      brand={brand}
      libraries={libraries.map((l) => ({ id: l.id, name: l.name, kind: l.kind, entries: l.entries }))}
      engines={modules().formulators.list().map((f) => ({ id: f.id, label: f.label, available: f.isAvailable, requirement: f.requirement ?? "" }))}
    />
  )
}
