import { getDb } from "@/db/client"
import { errorResponse, fileResponse, json } from "@/server/http"
import * as repo from "@/server/repo"
import { exportLook, LOOK_EXPORT_TARGETS, type LookExportTarget } from "@/server/services"

export async function GET(req: Request, ctx: RouteContext<"/api/studio/[brand]/looks/[id]/export">) {
  try {
    const { brand, id } = await ctx.params
    const url = new URL(req.url)
    const target = url.searchParams.get("target") ?? "beautyos"
    const source = url.searchParams.get("source") === "draft" ? "draft" : "published"
    if (!LOOK_EXPORT_TARGETS.some((t) => t.id === target)) return json({ error: `Unknown export target "${target}".` }, { status: 400 })
    const db = await getDb()
    const b = await repo.getBrandBySlug(db, brand)
    const out = await exportLook(db, b.id, id, target as LookExportTarget, source)
    return fileResponse(out.bytes, out.mediaType, out.fileName, { "x-export-notes": encodeURIComponent(out.issues.map((i) => i.message).join(" ")) })
  } catch (e) {
    return errorResponse(e)
  }
}
