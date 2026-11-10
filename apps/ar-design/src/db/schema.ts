// Beauty OS AR Design database schema (Postgres via Drizzle).
// Multi-brand: every content row belongs to a brand (tenant).
import type { LookDocument } from "@beautyos/look-format"
import type { LibraryEntry } from "@beautyos/color-lab"
import { sql } from "drizzle-orm"
import { boolean, index, integer, jsonb, pgTable, real, text, timestamp, uniqueIndex, uuid } from "drizzle-orm/pg-core"

const id = () => uuid("id").primaryKey().default(sql`gen_random_uuid()`)
const createdAt = () => timestamp("created_at", { withTimezone: true }).notNull().defaultNow()
const updatedAt = () => timestamp("updated_at", { withTimezone: true }).notNull().defaultNow()

export const brands = pgTable("brands", {
  id: id(),
  slug: text("slug").notNull().unique(),
  name: text("name").notNull(),
  accentColor: text("accent_color").notNull().default("#9b4b5c"),
  createdAt: createdAt(),
})

/** A sellable product line in one face region, e.g. "Velvet Lip Color". */
export const products = pgTable(
  "products",
  {
    id: id(),
    brandId: uuid("brand_id").notNull().references(() => brands.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    region: text("region").notNull(),
    description: text("description").notNull().default(""),
    archived: boolean("archived").notNull().default(false),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (t) => [index("products_brand_idx").on(t.brandId)],
)

/** A shade of a product: the catalog's material, with a SKU. */
export const shades = pgTable(
  "shades",
  {
    id: id(),
    brandId: uuid("brand_id").notNull().references(() => brands.id, { onDelete: "cascade" }),
    productId: uuid("product_id").notNull().references(() => products.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    sku: text("sku").notNull(),
    color: text("color").notNull(),
    finish: text("finish").notNull(),
    coverage: real("coverage").notNull(),
    /** Exact Banuba finish when the neutral mapping isn't what the artist wants. */
    banubaFinish: text("banuba_finish"),
    position: integer("position").notNull().default(0),
    createdAt: createdAt(),
  },
  (t) => [uniqueIndex("shades_brand_sku_uq").on(t.brandId, t.sku), index("shades_product_idx").on(t.productId)],
)

export const LOOK_STATUSES = ["draft", "published", "archived"] as const
export type LookStatus = (typeof LOOK_STATUSES)[number]

/** A look being authored. `draft` is the working copy; published snapshots live in look_versions. */
export const looks = pgTable(
  "looks",
  {
    id: id(),
    brandId: uuid("brand_id").notNull().references(() => brands.id, { onDelete: "cascade" }),
    slug: text("slug").notNull(),
    name: text("name").notNull(),
    status: text("status").$type<LookStatus>().notNull().default("draft"),
    draft: jsonb("draft").$type<LookDocument>().notNull(),
    publishedVersion: integer("published_version"),
    /** True when the draft differs from the published version. */
    dirty: boolean("dirty").notNull().default(true),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (t) => [uniqueIndex("looks_brand_slug_uq").on(t.brandId, t.slug), index("looks_brand_idx").on(t.brandId)],
)

/** Immutable published snapshots. Customers only ever see these. */
export const lookVersions = pgTable(
  "look_versions",
  {
    id: id(),
    lookId: uuid("look_id").notNull().references(() => looks.id, { onDelete: "cascade" }),
    version: integer("version").notNull(),
    document: jsonb("document").$type<LookDocument>().notNull(),
    note: text("note").notNull().default(""),
    publishedAt: timestamp("published_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [uniqueIndex("look_versions_uq").on(t.lookId, t.version)],
)

export interface Provenance {
  synthetic: true
  generator: string
  model: string
  seed?: number
  prompt: string
  /** Synthetic model spec (attributes) used for the prompt. */
  spec?: Record<string, unknown>
  /** For "with makeup" renders: the look applied. */
  look?: { id?: string; name: string; method: "ar-engine" | "generated" }
  createdAt: string
}

export const ASSET_KINDS = ["image", "video"] as const
export type AssetKind = (typeof ASSET_KINDS)[number]

/** Processed media (textures, overlays, LUTs, reference photos, swatch shots). */
export const assets = pgTable(
  "assets",
  {
    id: id(),
    brandId: uuid("brand_id").notNull().references(() => brands.id, { onDelete: "cascade" }),
    kind: text("kind").$type<AssetKind>().notNull(),
    name: text("name").notNull(),
    /** Delivery file (normalized PNG/JPEG or H.264 MP4). */
    url: text("url").notNull(),
    storageKey: text("storage_key").notNull(),
    /** The untouched upload, kept for full-quality re-exports. */
    originalKey: text("original_key").notNull(),
    originalMediaType: text("original_media_type").notNull(),
    mediaType: text("media_type").notNull(),
    bytes: integer("bytes").notNull(),
    /** Hash of the original upload (dedupe). */
    sha256: text("sha256").notNull(),
    /** Hash of the delivery file; looks reference this so the exact bytes are pinned. */
    deliverySha256: text("delivery_sha256").notNull(),
    width: integer("width"),
    height: integer("height"),
    durationMs: integer("duration_ms"),
    hasAlpha: boolean("has_alpha").notNull().default(false),
    thumbnailUrl: text("thumbnail_url"),
    /** Dominant colors, for search and the Lab. */
    palette: jsonb("palette").$type<{ hex: string; share: number }[]>().notNull().default([]),
    /** Processing steps applied, e.g. ["auto-orient", "enhance:hyperreal", "transcode:h264"]. */
    processing: jsonb("processing").$type<string[]>().notNull().default([]),
    originalName: text("original_name").notNull(),
    /** Set for AI-generated media: how it was made. Shown as a "Synthetic" badge and kept with exports. */
    provenance: jsonb("provenance").$type<Provenance>(),
    createdAt: createdAt(),
  },
  (t) => [index("assets_brand_idx").on(t.brandId), uniqueIndex("assets_brand_sha_uq").on(t.brandId, t.sha256)],
)

/** Imported color libraries (brand standards, licensed Pantone exports, custom profiles). */
export const colorLibraries = pgTable(
  "color_libraries",
  {
    id: id(),
    brandId: uuid("brand_id").notNull().references(() => brands.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    kind: text("kind").$type<"pantone" | "brand" | "custom">().notNull(),
    entries: jsonb("entries").$type<LibraryEntry[]>().notNull(),
    createdAt: createdAt(),
  },
  (t) => [index("color_libraries_brand_idx").on(t.brandId)],
)
