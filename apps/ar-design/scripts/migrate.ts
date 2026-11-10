import { openDatabase } from "../src/db/client"

async function main() {
  await openDatabase({ url: process.env.DATABASE_URL, migrate: true })
  console.log(process.env.DATABASE_URL ? "Postgres migrated." : "Local PGlite database migrated (.data/pglite).")
}
main().then(() => process.exit(0), (e) => { console.error(e); process.exit(1) })
