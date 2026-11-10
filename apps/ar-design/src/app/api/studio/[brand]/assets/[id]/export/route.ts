import { getDb } from "@/db/client"
import { ExportProfile } from "@/lib/export-profiles"
import { errorResponse, fileResponse, json } from "@/server/http"
import * as repo from "@/server/repo"
import { exportAsset } from "@/server/services"

/** POST an export profile; returns the rendered file. */
export async function POST(req: Request, ctx: RouteContext<"/api/studio/[brand]/assets/[id]/export">) {
  try {
    const { brand, id } = await ctx.params
    const parsed = ExportProfile.safeParse(await req.json())
    if (!parsed.success) return json({ error: parsed.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`).join("; ") }, { status: 400 })
    const db = await getDb()
    const b = await repo.getBrandBySlug(db, brand)
    const out = await exportAsset(db, b.id, id, parsed.data)
    return fileResponse(out.bytes, out.mediaType, out.fileName, { "x-export-notes": encodeURIComponent(out.notes.join(" ")), "x-export-size": `${out.width}x${out.height}` })
  } catch (e) {
    return errorResponse(e)
  }
}
