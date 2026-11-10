// Data access for AR Design. Every function takes the database explicitly so it can be unit-tested
// against an in-memory PGlite instance.
import { REGION_SPECS, emptyLook, isRegion, slugify, validateLook, type Finish, type Issue, type LookDocument, type Region } from "@beautyos/look-format"
import type { LibraryEntry } from "@beautyos/color-lab"
import { and, asc, desc, eq, inArray, max, ne, or } from "drizzle-orm"
import type { DB } from "@/db/client"
import { assets, brands, colorLibraries, lookVersions, looks, products, shades } from "@/db/schema"

export class NotFound extends Error {}
export class Invalid extends Error {
  constructor(message: string, readonly issues: Issue[] = []) {
    super(message)
  }
}

/** JSON with sorted keys: Postgres jsonb doesn't preserve key order, so compare canonically. */
export const stableJson = (v: unknown): string =>
  JSON.stringify(v, (_k, x) => (x && typeof x === "object" && !Array.isArray(x) ? Object.fromEntries(Object.entries(x).sort(([a], [b]) => a.localeCompare(b))) : x))

// ---------- brands ----------

export const listBrands = (db: DB) => db.select().from(brands).orderBy(asc(brands.name))

export async function getBrandBySlug(db: DB, slug: string) {
  const [b] = await db.select().from(brands).where(eq(brands.slug, slug))
  if (!b) throw new NotFound(`Brand "${slug}" not found`)
  return b
}

export async function createBrand(db: DB, input: { name: string; slug?: string; accentColor?: string }) {
  const name = input.name.trim()
  if (!name) throw new Invalid("Brand name is required.")
  const slug = slugify(input.slug || name)
  const [exists] = await db.select({ id: brands.id }).from(brands).where(eq(brands.slug, slug))
  if (exists) throw new Invalid(`A brand with the URL name "${slug}" already exists.`)
  const accent = input.accentColor && /^#[0-9a-f]{6}$/i.test(input.accentColor) ? input.accentColor.toLowerCase() : undefined
  const [b] = await db.insert(brands).values({ name, slug, ...(accent ? { accentColor: accent } : {}) }).returning()
  return b
}

// ---------- catalog ----------

export interface CatalogProduct {
  id: string
  name: string
  region: Region
  description: string
  archived: boolean
  shades: (typeof shades.$inferSelect)[]
}

export async function listCatalog(db: DB, brandId: string, opts: { includeArchived?: boolean } = {}): Promise<CatalogProduct[]> {
  const ps = await db
    .select()
    .from(products)
    .where(opts.includeArchived ? eq(products.brandId, brandId) : and(eq(products.brandId, brandId), eq(products.archived, false)))
    .orderBy(asc(products.region), asc(products.name))
  if (!ps.length) return []
  const ss = await db.select().from(shades).where(inArray(shades.productId, ps.map((p) => p.id))).orderBy(asc(shades.position), asc(shades.name))
  return ps.map((p) => ({ id: p.id, name: p.name, region: p.region as Region, description: p.description, archived: p.archived, shades: ss.filter((s) => s.productId === p.id) }))
}

export async function createProduct(db: DB, brandId: string, input: { name: string; region: string; description?: string }) {
  if (!input.name.trim()) throw new Invalid("Product name is required.")
  if (!isRegion(input.region)) throw new Invalid(`Unknown region "${input.region}".`)
  const [p] = await db.insert(products).values({ brandId, name: input.name.trim(), region: input.region, description: input.description?.trim() ?? "" }).returning()
  return p
}

export async function setProductArchived(db: DB, brandId: string, productId: string, archived: boolean) {
  const [p] = await db.update(products).set({ archived, updatedAt: new Date() }).where(and(eq(products.id, productId), eq(products.brandId, brandId))).returning()
  if (!p) throw new NotFound("Product not found")
  return p
}

export interface ShadeInput {
  name: string
  sku: string
  color: string
  finish: string
  coverage?: number
  banubaFinish?: string | null
}

export async function addShade(db: DB, brandId: string, productId: string, input: ShadeInput) {
  const [p] = await db.select().from(products).where(and(eq(products.id, productId), eq(products.brandId, brandId)))
  if (!p) throw new NotFound("Product not found")
  const region = p.region as Region
  const spec = REGION_SPECS[region]
  const color = input.color.trim().toLowerCase()
  if (!input.name.trim()) throw new Invalid("Shade name is required.")
  if (!input.sku.trim()) throw new Invalid("SKU is required.")
  if (!/^#[0-9a-f]{6}$/.test(color)) throw new Invalid("Color must be a 6-digit hex like #b3122e.")
  if (!spec.finishes.includes(input.finish as Finish)) throw new Invalid(`${spec.label} finishes: ${spec.finishes.join(", ")}.`)
  const { BANUBA_FINISHES } = await import("@beautyos/look-format")
  if (input.banubaFinish && !BANUBA_FINISHES[region].includes(input.banubaFinish)) throw new Invalid(`Banuba has no "${input.banubaFinish}" finish for ${spec.label}.`)
  const [dup] = await db.select({ id: shades.id }).from(shades).where(and(eq(shades.brandId, brandId), eq(shades.sku, input.sku.trim())))
  if (dup) throw new Invalid(`SKU ${input.sku.trim()} is already used.`)
  const [{ n }] = await db.select({ n: max(shades.position) }).from(shades).where(eq(shades.productId, productId))
  const [s] = await db
    .insert(shades)
    .values({
      brandId,
      productId,
      name: input.name.trim(),
      sku: input.sku.trim(),
      color,
      finish: input.finish,
      coverage: Math.min(1, Math.max(0, input.coverage ?? spec.defaultCoverage)),
      banubaFinish: input.banubaFinish || null,
      position: (n ?? -1) + 1,
    })
    .returning()
  return s
}

export async function deleteShade(db: DB, brandId: string, shadeId: string) {
  await db.delete(shades).where(and(eq(shades.id, shadeId), eq(shades.brandId, brandId)))
}

/** Catalog shades flattened for the Lab's formulation engine and the editor's picker. */
export async function catalogShades(db: DB, brandId: string) {
  const cat = await listCatalog(db, brandId)
  return cat.flatMap((p) =>
    p.shades.map((s) => ({ shadeId: s.id, sku: s.sku, name: s.name, productName: p.name, region: p.region, color: s.color, finish: s.finish as Finish, coverage: s.coverage, banubaFinish: s.banubaFinish })),
  )
}

// ---------- looks ----------

async function uniqueLookSlug(db: DB, brandId: string, base: string, exceptId?: string) {
  const root = slugify(base)
  for (let i = 1; i < 500; i++) {
    const slug = i === 1 ? root : `${root}-${i}`
    const where = exceptId ? and(eq(looks.brandId, brandId), eq(looks.slug, slug), ne(looks.id, exceptId)) : and(eq(looks.brandId, brandId), eq(looks.slug, slug))
    const [hit] = await db.select({ id: looks.id }).from(looks).where(where)
    if (!hit) return slug
  }
  throw new Invalid("Couldn't find a free URL name for this look.")
}

export async function listLooks(db: DB, brandId: string) {
  return db.select().from(looks).where(and(eq(looks.brandId, brandId), ne(looks.status, "archived"))).orderBy(desc(looks.updatedAt))
}

export async function getLook(db: DB, brandId: string, lookId: string) {
  const [l] = await db.select().from(looks).where(and(eq(looks.id, lookId), eq(looks.brandId, brandId)))
  if (!l) throw new NotFound("Look not found")
  return l
}

/** Creates a draft. Pass a document to import/duplicate; it is validated first. */
export async function createLook(db: DB, brandId: string, input: { name?: string; document?: unknown }) {
  let doc: LookDocument
  if (input.document !== undefined) {
    const r = validateLook(input.document)
    if (!r.ok) throw new Invalid("That isn't a valid Beauty OS look.", r.issues)
    doc = r.look
  } else doc = emptyLook(input.name?.trim() || "Untitled look")
  if (input.name?.trim()) doc = { ...doc, name: input.name.trim() }
  const slug = await uniqueLookSlug(db, brandId, doc.name)
  const [l] = await db.insert(looks).values({ brandId, slug, name: doc.name, draft: doc, status: "draft", dirty: true }).returning()
  return l
}

export async function saveDraft(db: DB, brandId: string, lookId: string, document: unknown) {
  const current = await getLook(db, brandId, lookId)
  const r = validateLook(document)
  if (!r.ok) throw new Invalid("The look has errors; fix them before saving.", r.issues)
  const [published] = current.publishedVersion
    ? await db.select().from(lookVersions).where(and(eq(lookVersions.lookId, lookId), eq(lookVersions.version, current.publishedVersion)))
    : []
  const dirty = !published || stableJson(published.document) !== stableJson(r.look)
  const slug = r.look.name !== current.name ? await uniqueLookSlug(db, brandId, r.look.name, lookId) : current.slug
  const [l] = await db.update(looks).set({ draft: r.look, name: r.look.name, slug, dirty, updatedAt: new Date() }).where(eq(looks.id, lookId)).returning()
  return { look: l, issues: r.issues }
}

/** Freezes the current draft as the next immutable version and makes it live. */
export async function publishLook(db: DB, brandId: string, lookId: string, note = "") {
  const current = await getLook(db, brandId, lookId)
  const r = validateLook(current.draft)
  if (!r.ok) throw new Invalid("This look has errors and can't be published.", r.issues)
  return db.transaction(async (tx) => {
    const [{ v }] = await tx.select({ v: max(lookVersions.version) }).from(lookVersions).where(eq(lookVersions.lookId, lookId))
    const version = (v ?? 0) + 1
    const [ver] = await tx.insert(lookVersions).values({ lookId, version, document: r.look, note: note.trim().slice(0, 500) }).returning()
    const [l] = await tx.update(looks).set({ status: "published", publishedVersion: version, dirty: false, updatedAt: new Date() }).where(eq(looks.id, lookId)).returning()
    return { look: l, version: ver }
  })
}

export async function listVersions(db: DB, lookId: string) {
  return db.select().from(lookVersions).where(eq(lookVersions.lookId, lookId)).orderBy(desc(lookVersions.version))
}

/** Copies a published version back into the draft (does not change what's live). */
export async function restoreVersion(db: DB, brandId: string, lookId: string, version: number) {
  await getLook(db, brandId, lookId)
  const [ver] = await db.select().from(lookVersions).where(and(eq(lookVersions.lookId, lookId), eq(lookVersions.version, version)))
  if (!ver) throw new NotFound(`Version ${version} not found`)
  return saveDraft(db, brandId, lookId, ver.document)
}

/** Takes the look off the customer API; history is kept. */
export async function unpublishLook(db: DB, brandId: string, lookId: string) {
  await getLook(db, brandId, lookId)
  const [l] = await db.update(looks).set({ status: "draft", dirty: true, updatedAt: new Date() }).where(eq(looks.id, lookId)).returning()
  return l
}

export async function archiveLook(db: DB, brandId: string, lookId: string) {
  await getLook(db, brandId, lookId)
  await db.update(looks).set({ status: "archived", updatedAt: new Date() }).where(eq(looks.id, lookId))
}

/** What customers see: the published version of every live look. */
export async function publishedLooks(db: DB, brandSlug: string) {
  const brand = await getBrandBySlug(db, brandSlug)
  const live = await db.select().from(looks).where(and(eq(looks.brandId, brand.id), eq(looks.status, "published"))).orderBy(asc(looks.name))
  if (!live.length) return { brand, looks: [] }
  const versions = await db.select().from(lookVersions).where(inArray(lookVersions.lookId, live.map((l) => l.id)))
  return {
    brand,
    looks: live.flatMap((l) => {
      const v = versions.find((x) => x.lookId === l.id && x.version === l.publishedVersion)
      return v ? [{ id: l.id, slug: l.slug, version: v.version, publishedAt: v.publishedAt, look: v.document }] : []
    }),
  }
}

// ---------- assets ----------

export const listAssets = (db: DB, brandId: string) => db.select().from(assets).where(eq(assets.brandId, brandId)).orderBy(desc(assets.createdAt))

export async function getAsset(db: DB, brandId: string, assetId: string) {
  const [a] = await db.select().from(assets).where(and(eq(assets.id, assetId), eq(assets.brandId, brandId)))
  if (!a) throw new NotFound("Asset not found")
  return a
}

/** Matches either the original upload or a delivery file (e.g. re-importing an exported bundle). */
export async function findAssetBySha(db: DB, brandId: string, sha: string) {
  const [a] = await db.select().from(assets).where(and(eq(assets.brandId, brandId), or(eq(assets.sha256, sha), eq(assets.deliverySha256, sha))))
  return a ?? null
}

export async function insertAsset(db: DB, values: typeof assets.$inferInsert) {
  const [a] = await db.insert(assets).values(values).returning()
  return a
}

export async function deleteAsset(db: DB, brandId: string, assetId: string) {
  const [a] = await db.delete(assets).where(and(eq(assets.id, assetId), eq(assets.brandId, brandId))).returning()
  return a ?? null
}

// ---------- color libraries ----------

export const listLibraries = (db: DB, brandId: string) => db.select().from(colorLibraries).where(eq(colorLibraries.brandId, brandId)).orderBy(asc(colorLibraries.name))

export async function createLibrary(db: DB, brandId: string, input: { name: string; kind: "pantone" | "brand" | "custom"; entries: LibraryEntry[] }) {
  if (!input.name.trim()) throw new Invalid("Library name is required.")
  if (!input.entries.length) throw new Invalid("The file had no readable colors.")
  const [lib] = await db.insert(colorLibraries).values({ brandId, name: input.name.trim(), kind: input.kind, entries: input.entries.slice(0, 5000) }).returning()
  return lib
}

export async function deleteLibrary(db: DB, brandId: string, id: string) {
  await db.delete(colorLibraries).where(and(eq(colorLibraries.id, id), eq(colorLibraries.brandId, brandId)))
}
