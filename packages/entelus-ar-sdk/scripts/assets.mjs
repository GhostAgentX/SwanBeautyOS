#!/usr/bin/env node
// Installs the Entelus AR SDK runtime into an app's public folder:
//   <target>/wasm/    MediaPipe Tasks Vision WebAssembly runtime (Apache-2.0), from node_modules
//   <target>/models/  pinned face-tracking and segmentation models, verified by SHA-256
// Models are downloaded once into packages/entelus-ar-sdk/models (a cache) and reused.
// Set ENTELUS_MODELS_URL to download from your own mirror instead of Google's public bucket.
// Usage: entelus-ar-assets <target-dir>
import { createHash } from "node:crypto"
import { cpSync, existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from "node:fs"
import { createRequire } from "node:module"
import { dirname, join, resolve } from "node:path"
import { fileURLToPath } from "node:url"

export const MODELS = [
  {
    file: "face_landmarker.task",
    url: "https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task",
    sha256: "64184e229b263107bc2b804c6625db1341ff2bb731874b0bcc2fe6544e0bc9ff",
  },
  {
    file: "selfie_multiclass_256x256.tflite",
    url: "https://storage.googleapis.com/mediapipe-models/image_segmenter/selfie_multiclass_256x256/float32/1/selfie_multiclass_256x256.tflite",
    sha256: "c6748b1253a99067ef71f7e26ca71096cd449baefa8f101900ea23016507e0e0",
  },
]

const here = dirname(fileURLToPath(import.meta.url))
const cache = join(here, "..", "models")
const sha = (buf) => createHash("sha256").update(buf).digest("hex")

async function ensureModel(m) {
  const path = join(cache, m.file)
  if (existsSync(path) && sha(readFileSync(path)) === m.sha256) return path
  const url = process.env.ENTELUS_MODELS_URL ? `${process.env.ENTELUS_MODELS_URL.replace(/\/$/, "")}/${m.file}` : m.url
  const res = await fetch(url)
  if (!res.ok) throw new Error(`Couldn't download ${m.file} from ${url} (HTTP ${res.status})`)
  const buf = Buffer.from(await res.arrayBuffer())
  if (sha(buf) !== m.sha256) throw new Error(`${m.file} failed its integrity check (got ${sha(buf)}, expected ${m.sha256})`)
  mkdirSync(cache, { recursive: true })
  writeFileSync(path, buf)
  return path
}

async function main() {
  const target = resolve(process.argv[2] ?? "public/ar-engine")
  const require = createRequire(import.meta.url)
  // tasks-vision does not export package.json; its wasm/ folder sits next to the main bundle.
  const wasmDir = join(dirname(require.resolve("@mediapipe/tasks-vision")), "wasm")
  mkdirSync(join(target, "wasm"), { recursive: true })
  mkdirSync(join(target, "models"), { recursive: true })
  for (const f of readdirSync(wasmDir)) cpSync(join(wasmDir, f), join(target, "wasm", f))
  for (const m of MODELS) cpSync(await ensureModel(m), join(target, "models", m.file))
  console.log(`Entelus AR SDK runtime installed in ${target}`)
}

main().catch((e) => {
  console.error(e.message)
  process.exit(1)
})
