// Serves locally stored files (development / self-hosted). Production uses Vercel Blob URLs directly.
import { readLocalFile, safeKey } from "@/server/storage"

const TYPES: Record<string, string> = { jpg: "image/jpeg", jpeg: "image/jpeg", png: "image/png", webp: "image/webp", avif: "image/avif", gif: "image/gif", tiff: "image/tiff", heic: "image/heic", mp4: "video/mp4", mov: "video/quicktime", webm: "video/webm" }

export async function GET(_req: Request, ctx: RouteContext<"/api/files/[...key]">) {
  const { key } = await ctx.params
  try {
    const k = safeKey(key.join("/"))
    const bytes = await readLocalFile(k)
    const ext = k.split(".").pop()!.toLowerCase()
    return new Response(new Uint8Array(bytes) as BodyInit, {
      headers: {
        "content-type": TYPES[ext] ?? "application/octet-stream",
        // Keys are content-addressed (sha256), so files never change.
        "cache-control": "public, max-age=31536000, immutable",
        "access-control-allow-origin": "*",
        "cross-origin-resource-policy": "cross-origin",
      },
    })
  } catch {
    return new Response("Not found", { status: 404 })
  }
}
