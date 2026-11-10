// Public, read-only customer API: a brand's published looks. Safe to call from any origin.
import { getDb } from "@/db/client"
import { CORS, errorResponse, json } from "@/server/http"
import { publishedLooks } from "@/server/repo"

export const dynamic = "force-dynamic"

export async function GET(_req: Request, ctx: RouteContext<"/api/v1/brands/[brand]/looks">) {
  try {
    const { brand } = await ctx.params
    const r = await publishedLooks(await getDb(), brand)
    return json(
      {
        brand: { slug: r.brand.slug, name: r.brand.name, accentColor: r.brand.accentColor },
        looks: r.looks.map((l) => ({ id: l.id, slug: l.slug, version: l.version, publishedAt: l.publishedAt, look: l.look })),
      },
      { headers: { ...CORS, "cache-control": "public, max-age=30, s-maxage=60, stale-while-revalidate=600" } },
    )
  } catch (e) {
    const res = errorResponse(e)
    Object.entries(CORS).forEach(([k, v]) => res.headers.set(k, v))
    return res
  }
}

export function OPTIONS() {
  return new Response(null, { status: 204, headers: CORS })
}
