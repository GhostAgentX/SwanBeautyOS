// Saves a "model wearing look" frame rendered in the browser by the AR engine.
import { getDb } from "@/db/client"
import { errorResponse, json } from "@/server/http"
import * as repo from "@/server/repo"
import { saveModelRender } from "@/server/services"

export async function POST(req: Request, ctx: RouteContext<"/api/studio/[brand]/models/render">) {
  try {
    const { brand } = await ctx.params
    const form = await req.formData()
    const file = form.get("file")
    if (!(file instanceof File)) return json({ error: "No image received." }, { status: 400 })
    const db = await getDb()
    const b = await repo.getBrandBySlug(db, brand)
    const { asset } = await saveModelRender(db, b.id, {
      bytes: new Uint8Array(await file.arrayBuffer()),
      modelAssetId: String(form.get("modelAssetId")),
      lookId: String(form.get("lookId") ?? "") || undefined,
      lookName: String(form.get("lookName") ?? "Look"),
    })
    return json({ asset })
  } catch (e) {
    return errorResponse(e)
  }
}
