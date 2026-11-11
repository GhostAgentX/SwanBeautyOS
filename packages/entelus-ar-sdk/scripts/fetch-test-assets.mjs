#!/usr/bin/env node
// Downloads MediaPipe's reference portrait and its expected landmarks for SDK tests (not committed).
import { existsSync, mkdirSync, writeFileSync } from "node:fs"
import { dirname, join } from "node:path"
import { fileURLToPath } from "node:url"

const dir = join(dirname(fileURLToPath(import.meta.url)), "..", "test-assets")
const quiet = process.argv.includes("--quiet")
const files = ["portrait.jpg", "portrait_expected_face_landmarks.pbtxt"]
mkdirSync(dir, { recursive: true })
for (const f of files) {
  if (existsSync(join(dir, f))) continue
  try {
    const res = await fetch(`https://storage.googleapis.com/mediapipe-assets/${f}`)
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    writeFileSync(join(dir, f), new Uint8Array(await res.arrayBuffer()))
    if (!quiet) console.log(`fetched ${f}`)
  } catch (e) {
    if (!quiet) console.warn(`couldn't fetch ${f} (${e.message}); geometry tests will be skipped`)
  }
}
