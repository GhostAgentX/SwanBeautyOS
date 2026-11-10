import "server-only"
import { MediaError } from "./media"
import * as repo from "./repo"

export const json = (data: unknown, init: ResponseInit = {}) => Response.json(data, init)

/** Maps known errors to friendly HTTP responses. */
export function errorResponse(e: unknown) {
  if (e instanceof repo.NotFound) return json({ error: e.message }, { status: 404 })
  if (e instanceof repo.Invalid) return json({ error: e.message, issues: e.issues }, { status: 422 })
  if (e instanceof MediaError) return json({ error: e.message }, { status: 422 })
  console.error(e)
  return json({ error: e instanceof Error ? e.message : "Unexpected error" }, { status: 500 })
}

export function fileResponse(bytes: Uint8Array, mediaType: string, fileName: string, extra: Record<string, string> = {}) {
  return new Response(bytes as BodyInit, {
    headers: {
      "content-type": mediaType,
      "content-length": String(bytes.length),
      "content-disposition": `attachment; filename="${fileName.replace(/[^\w.\- ]/g, "_")}"`,
      "cache-control": "no-store",
      ...extra,
    },
  })
}

export const CORS = {
  "access-control-allow-origin": "*",
  "access-control-allow-methods": "GET, OPTIONS",
  "access-control-allow-headers": "content-type",
}
