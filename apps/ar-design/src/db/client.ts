// Database connection.
// - DATABASE_URL set  -> real Postgres (Neon/Supabase/RDS via the Vercel Marketplace or any host). Run `npm run db:migrate` on deploy.
// - DATABASE_URL unset -> PGlite: Postgres compiled to WASM, stored in .data/pglite. Migrations apply automatically.
import { drizzle as drizzlePg, type NodePgDatabase } from "drizzle-orm/node-postgres"
import { migrate as migratePg } from "drizzle-orm/node-postgres/migrator"
import path from "node:path"
import * as schema from "./schema"

export type DB = NodePgDatabase<typeof schema>

const MIGRATIONS = path.join(process.cwd(), "drizzle")

/** Opens a database. `dataDir: "memory://"` gives a throwaway in-memory database (tests). */
export async function openDatabase(opts: { url?: string; dataDir?: string; migrate?: boolean } = {}): Promise<DB> {
  if (opts.url) {
    const { Pool } = await import("pg")
    const db = drizzlePg(new Pool({ connectionString: opts.url, max: 5 }), { schema })
    if (opts.migrate) await migratePg(db, { migrationsFolder: MIGRATIONS })
    return db
  }
  const { PGlite } = await import("@electric-sql/pglite")
  const { drizzle } = await import("drizzle-orm/pglite")
  const { migrate } = await import("drizzle-orm/pglite/migrator")
  const dataDir = opts.dataDir ?? path.join(process.cwd(), ".data", "pglite")
  if (!dataDir.startsWith("memory://")) await (await import("node:fs/promises")).mkdir(dataDir, { recursive: true })
  const client = new PGlite(dataDir)
  const db = drizzle(client, { schema })
  if (opts.migrate ?? true) await migrate(db, { migrationsFolder: MIGRATIONS })
  // Same query API; only the driver differs.
  return db as unknown as DB
}

const globalForDb = globalThis as unknown as { __beautyosDb?: Promise<DB> }

/** Process-wide connection (survives dev hot reloads, which would otherwise reopen PGlite). */
export function getDb(): Promise<DB> {
  globalForDb.__beautyosDb ??= openDatabase({ url: process.env.DATABASE_URL })
  return globalForDb.__beautyosDb
}

export { schema }
