#!/usr/bin/env node
// Copies the Banuba WebAR binaries and the face modules the engine loads into an app's public folder,
// so each app self-hosts them (no CDN dependency). Usage: copy-banuba-assets <target-dir>
import { cpSync, existsSync, mkdirSync } from "node:fs"
import { createRequire } from "node:module"
import { dirname, join, resolve } from "node:path"

const target = resolve(process.argv[2] ?? "public/banuba")
const require = createRequire(import.meta.url)
const dist = dirname(require.resolve("@banuba/webar/package.json")) + "/dist"
const files = ["BanubaSDK.data", "BanubaSDK.wasm", "BanubaSDK.simd.wasm"]
const modules = ["face_tracker", "makeup", "lips", "eyes", "skin"]

mkdirSync(join(target, "modules"), { recursive: true })
for (const f of files) cpSync(join(dist, f), join(target, f))
for (const m of modules) {
  const src = join(dist, "modules", `${m}.zip`)
  if (!existsSync(src)) throw new Error(`Missing Banuba module ${m}.zip in ${dist}/modules`)
  cpSync(src, join(target, "modules", `${m}.zip`))
}
console.log(`Banuba assets copied to ${target}`)
