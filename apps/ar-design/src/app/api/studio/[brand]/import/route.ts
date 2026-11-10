import { getDb } from "@/db/client"
import { ENHANCE_PRESETS, type EnhancePreset } from "@/server/media"
import { errorResponse, json } from "@/server/http"
import * as repo from "@/server/repo"
import { importFile } from "@/server/services"

export async function POST(req: Request, ctx: RouteContext<"/api/studio/[brand]/import">) {
  try {
    const { brand } = await ctx.params
    const db = await getDb()
    const b = await repo.getBrandBySlug(db, brand)
    const form = await req.formData()
    const file = form.get("file")
    if (!(file instanceof File)) return json({ error: "No file received." }, { status: 400 })
    const enhance = String(form.get("enhance") ?? "none")
    const result = await importFile(db, b.id, { name: file.name, bytes: new Uint8Array(await file.arrayBuffer()) }, { enhance: (ENHANCE_PRESETS as readonly string[]).includes(enhance) ? (enhance as EnhancePreset) : "none" })
    return json(result)
  } catch (e) {
    return errorResponse(e)
  }
}
