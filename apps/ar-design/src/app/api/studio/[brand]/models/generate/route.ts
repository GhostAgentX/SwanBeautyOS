import { getDb } from "@/db/client"
import { errorResponse, json } from "@/server/http"
import * as repo from "@/server/repo"
import { generateModel } from "@/server/services"

export const maxDuration = 300

export async function POST(req: Request, ctx: RouteContext<"/api/studio/[brand]/models/generate">) {
  try {
    const { brand } = await ctx.params
    const body = (await req.json()) as { spec: unknown; makeup?: { mode: "bare" | "look"; description?: string } }
    const db = await getDb()
    const b = await repo.getBrandBySlug(db, brand)
    const { asset, headroomAddedPx } = await generateModel(db, b.id, body.spec as never, body.makeup ?? { mode: "bare" })
    return json({ asset, headroomAddedPx })
  } catch (e) {
    return errorResponse(e)
  }
}
