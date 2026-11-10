"use server"
// Server actions for the studio. Each validates input, resolves the brand from its slug and
// returns a plain result ({ ok, ... } or { ok: false, error, issues }) the UI can show directly.
import type { Issue } from "@beautyos/look-format"
import { refresh, revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { getDb } from "@/db/client"
import * as repo from "@/server/repo"

export type ActionResult<T = unknown> = { ok: true; data: T } | { ok: false; error: string; issues?: Issue[] }

async function run<T>(fn: () => Promise<T>): Promise<ActionResult<T>> {
  try {
    return { ok: true, data: await fn() }
  } catch (e) {
    if (e instanceof repo.Invalid) return { ok: false, error: e.message, issues: e.issues }
    if (e instanceof repo.NotFound) return { ok: false, error: e.message }
    console.error(e)
    return { ok: false, error: "Something went wrong. Please try again." }
  }
}

const brandId = async (slug: string) => (await repo.getBrandBySlug(await getDb(), slug)).id

export async function createBrandAction(_: unknown, form: FormData): Promise<ActionResult<{ slug: string }>> {
  const r = await run(async () => {
    const b = await repo.createBrand(await getDb(), { name: String(form.get("name") ?? ""), accentColor: String(form.get("accent") ?? "") })
    return { slug: b.slug }
  })
  if (r.ok) redirect(`/b/${r.data.slug}`)
  return r
}

export async function createLookAction(brand: string, input: { name?: string; document?: unknown }) {
  const r = await run(async () => {
    const l = await repo.createLook(await getDb(), await brandId(brand), input)
    return { id: l.id }
  })
  if (r.ok) revalidatePath(`/b/${brand}`)
  return r
}

export async function saveDraftAction(brand: string, lookId: string, document: unknown) {
  return run(async () => {
    const { look, issues } = await repo.saveDraft(await getDb(), await brandId(brand), lookId, document)
    return { dirty: look.dirty, slug: look.slug, issues, updatedAt: look.updatedAt.toISOString() }
  })
}

export async function publishAction(brand: string, lookId: string, document: unknown, note: string) {
  const r = await run(async () => {
    const db = await getDb()
    const id = await brandId(brand)
    await repo.saveDraft(db, id, lookId, document)
    const { version } = await repo.publishLook(db, id, lookId, note)
    return { version: version.version }
  })
  if (r.ok) refresh()
  return r
}

export async function restoreVersionAction(brand: string, lookId: string, version: number) {
  const r = await run(async () => (await repo.restoreVersion(await getDb(), await brandId(brand), lookId, version)).look.draft)
  if (r.ok) refresh()
  return r
}

export async function unpublishAction(brand: string, lookId: string) {
  const r = await run(async () => void (await repo.unpublishLook(await getDb(), await brandId(brand), lookId)))
  if (r.ok) refresh()
  return r
}

export async function archiveLookAction(brand: string, lookId: string) {
  const r = await run(async () => void (await repo.archiveLook(await getDb(), await brandId(brand), lookId)))
  if (r.ok) redirect(`/b/${brand}`)
  return r
}

export async function createProductAction(brand: string, input: { name: string; region: string; description?: string }) {
  const r = await run(async () => (await repo.createProduct(await getDb(), await brandId(brand), input)).id)
  if (r.ok) refresh()
  return r
}

export async function archiveProductAction(brand: string, productId: string) {
  const r = await run(async () => void (await repo.setProductArchived(await getDb(), await brandId(brand), productId, true)))
  if (r.ok) refresh()
  return r
}

export async function addShadeAction(brand: string, productId: string, input: repo.ShadeInput) {
  const r = await run(async () => (await repo.addShade(await getDb(), await brandId(brand), productId, input)).id)
  if (r.ok) refresh()
  return r
}

export async function deleteShadeAction(brand: string, shadeId: string) {
  const r = await run(async () => void (await repo.deleteShade(await getDb(), await brandId(brand), shadeId)))
  if (r.ok) refresh()
  return r
}

export async function deleteAssetAction(brand: string, assetId: string) {
  const r = await run(async () => void (await repo.deleteAsset(await getDb(), await brandId(brand), assetId)))
  if (r.ok) refresh()
  return r
}

export async function deleteLibraryAction(brand: string, id: string) {
  const r = await run(async () => void (await repo.deleteLibrary(await getDb(), await brandId(brand), id)))
  if (r.ok) refresh()
  return r
}
