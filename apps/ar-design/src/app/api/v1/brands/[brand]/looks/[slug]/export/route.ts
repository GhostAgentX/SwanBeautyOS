// Public export of a published look for other AR platforms: ?target=beautyos|banuba|banuba-effect|bundle
import { getDb } from "@/db/client"
import { CORS, errorResponse, fileResponse, json } from "@/server/http"
import * as repo from "@/server/repo"
import { exportLook, LOOK_EXPORT_TARGETS, type LookExportTarget } from "@/server/services"

export async function GET(req: Request, ctx: RouteContext<"/api/v1/brands/[brand]/looks/[slug]/export">) {
  try {
    const { brand, slug } = await ctx.params
    const target = new URL(req.url).searchParams.get("target") ?? "beautyos"
    if (!LOOK_EXPORT_TARGETS.some((t) => t.id === target)) return json({ error: `Unknown target "${target}".` }, { status: 400, headers: CORS })
    const db = await getDb()
    const pub = await repo.publishedLooks(db, brand)
    const look = pub.looks.find((l) => l.slug === slug)
    if (!look) return json({ error: "Look not found or not published." }, { status: 404, headers: CORS })
    const out = await exportLook(db, pub.brand.id, look.id, target as LookExportTarget, "published")
    return fileResponse(out.bytes, out.mediaType, out.fileName, { ...CORS, "cache-control": "public, max-age=60" })
  } catch (e) {
    return errorResponse(e)
  }
}

export function OPTIONS() {
  return new Response(null, { status: 204, headers: CORS })
}
