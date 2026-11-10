import type { ColorLibrary, InputColor } from "@beautyos/color-lab"
import { formulateLook } from "@beautyos/color-lab"
import { getDb } from "@/db/client"
import { modules } from "@/modules"
import { errorResponse, json } from "@/server/http"
import * as repo from "@/server/repo"

export const maxDuration = 120

type Body = {
  mode: "prompt" | "colors"
  prompt?: string
  colors?: InputColor[]
  skin?: string
  occasion?: "everyday" | "evening" | "bold"
  name?: string
  engine?: string
}

/** Formulates a look from a prompt (language model when configured, else rules) or from picked colors. */
export async function POST(req: Request, ctx: RouteContext<"/api/studio/[brand]/lab/formulate">) {
  try {
    const { brand } = await ctx.params
    const body = (await req.json()) as Body
    const db = await getDb()
    const b = await repo.getBrandBySlug(db, brand)
    const catalog = await repo.catalogShades(db, b.id)
    const libraries: ColorLibrary[] = (await repo.listLibraries(db, b.id)).map((l) => ({ id: l.id, name: l.name, kind: l.kind, entries: l.entries }))
    const skin = body.skin && /^#[0-9a-f]{6}$/i.test(body.skin) ? body.skin : undefined

    if (body.mode === "colors") {
      const f = formulateLook({ name: body.name || "Swatch formulation", colors: (body.colors ?? []).slice(0, 24), skin, occasion: body.occasion, catalog })
      return json({ ...f, engine: "rules", notes: [] })
    }
    const prompt = (body.prompt ?? "").trim().slice(0, 2000)
    if (!prompt) return json({ error: "Describe the look you want." }, { status: 400 })
    const reg = modules().formulators
    const formulator = body.engine ? reg.get(body.engine) : reg.preferred()!
    if (!formulator.available()) return json({ error: `${formulator.label} isn't configured. ${formulator.requirement ?? ""}` }, { status: 422 })
    return json(await formulator.formulate({ prompt, skin, occasion: body.occasion, catalog, libraries }))
  } catch (e) {
    return errorResponse(e)
  }
}
