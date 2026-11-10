import { openDatabase } from "../src/db/client"
import { seed } from "../src/db/seed"

async function main() {
  const db = await openDatabase({ url: process.env.DATABASE_URL, migrate: true })
  const r = await seed(db)
  console.log(r.created ? "Seeded Swan Beauty (catalog + 6 published looks)." : "Swan Beauty already exists; nothing to do.")
}
main().then(() => process.exit(0), (e) => { console.error(e); process.exit(1) })
