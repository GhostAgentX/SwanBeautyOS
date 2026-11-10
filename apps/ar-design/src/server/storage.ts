import "server-only"
// Binary storage for assets.
// - BLOB_READ_WRITE_TOKEN set -> Vercel Blob (production; serverless filesystems are ephemeral).
// - otherwise                 -> local disk under .data/files, served by /api/files/[...key].
import { mkdir, readFile, rm, writeFile } from "node:fs/promises"
import path from "node:path"

export interface Storage {
  put(key: string, bytes: Uint8Array, contentType: string): Promise<{ url: string }>
  get(key: string, url: string): Promise<Uint8Array>
  remove(key: string, url: string): Promise<void>
}

const ROOT = path.join(process.cwd(), ".data", "files")

/** Rejects keys that could escape the storage root. */
export function safeKey(key: string): string {
  const norm = path.posix.normalize(key)
  if (norm.startsWith("..") || path.posix.isAbsolute(norm) || !/^[\w./-]+$/.test(norm)) throw new Error(`Invalid storage key: ${key}`)
  return norm
}

export const localStorage: Storage = {
  async put(key, bytes) {
    const k = safeKey(key)
    const file = path.join(ROOT, k)
    await mkdir(path.dirname(file), { recursive: true })
    await writeFile(file, bytes)
    return { url: `/api/files/${k}` }
  },
  async get(key) {
    return new Uint8Array(await readFile(path.join(ROOT, safeKey(key))))
  },
  async remove(key) {
    await rm(path.join(ROOT, safeKey(key)), { force: true })
  },
}

export const blobStorage: Storage = {
  async put(key, bytes, contentType) {
    const { put } = await import("@vercel/blob")
    const res = await put(safeKey(key), Buffer.from(bytes), { access: "public", contentType, addRandomSuffix: false, allowOverwrite: true })
    return { url: res.url }
  },
  async get(_key, url) {
    const res = await fetch(url)
    if (!res.ok) throw new Error(`Blob fetch failed: HTTP ${res.status}`)
    return new Uint8Array(await res.arrayBuffer())
  },
  async remove(_key, url) {
    const { del } = await import("@vercel/blob")
    await del(url)
  },
}

export const storage = (): Storage => (process.env.BLOB_READ_WRITE_TOKEN ? blobStorage : localStorage)

/** Reads a stored local file for the /api/files route (local driver only). */
export const readLocalFile = (key: string) => readFile(path.join(ROOT, safeKey(key)))
