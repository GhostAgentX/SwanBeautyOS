import Link from "next/link"
import { Icon } from "@/components/icons"
import { ImportButton } from "@/components/importer"
import { LookCard } from "@/components/look-card"
import { getDb } from "@/db/client"
import * as repo from "@/server/repo"
import { NewLookButton } from "./new-look-button"

export default async function StudioHome({ params }: PageProps<"/b/[brand]">) {
  const { brand } = await params
  const db = await getDb()
  const b = await repo.getBrandBySlug(db, brand)
  const [looks, assets] = await Promise.all([repo.listLooks(db, b.id), repo.listAssets(db, b.id)])
  const models = assets.filter((a) => a.provenance?.synthetic && !a.provenance.look).slice(0, 6)
  const live = looks.filter((l) => l.status === "published").length

  return (
    <div className="page">
      <div className="page-head">
        <div>
          <h1>Studio</h1>
          <p>{looks.length} looks · {live} live. Open a look to style it on the camera, a photo or a synthetic model.</p>
        </div>
        <div className="page-actions">
          <ImportButton />
          <Link className="btn" href={`/b/${brand}/lab`}><Icon name="wand" /> Describe a look</Link>
          <NewLookButton brand={brand} />
        </div>
      </div>

      {looks.length ? (
        <section className="gallery" aria-label="Looks">
          {looks.map((l) => (
            <LookCard key={l.id} href={`/b/${brand}/looks/${l.id}`} look={l.draft} status={l.status} dirty={l.dirty} version={l.publishedVersion} />
          ))}
        </section>
      ) : (
        <div className="card empty">
          <strong>No looks yet</strong>
          Create one, describe it in the Lab, or drop a look file here.
        </div>
      )}

      <section style={{ marginTop: 36 }}>
        <div className="page-head" style={{ marginBottom: 14 }}>
          <div>
            <h2 style={{ margin: 0, fontSize: 17 }}>Synthetic models</h2>
            <p>Original, AI-generated faces for showing looks across skin tones and features.</p>
          </div>
          <Link className="btn" href={`/b/${brand}/models`}><Icon name="models" /> {models.length ? "All models" : "Create a cast"}</Link>
        </div>
        {models.length ? (
          <div className="gallery">
            {models.map((m) => (
              <Link key={m.id} href={`/b/${brand}/models?asset=${m.id}`} className="tile">
                <div className="tile-media">{m.thumbnailUrl && <img src={m.thumbnailUrl} alt={m.name} loading="lazy" />}</div>
                <div className="tile-badges"><span className="badge badge-accent">Synthetic</span></div>
                <div className="tile-body"><div className="tile-title">{m.name}</div></div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="card empty"><strong>No models yet</strong>Generate a diverse cast in Models.</div>
        )}
      </section>
    </div>
  )
}
