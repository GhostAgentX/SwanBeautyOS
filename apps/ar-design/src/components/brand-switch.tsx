"use client"
import { useRouter } from "next/navigation"

export function BrandSwitch({ current, brands }: { current: string; brands: { slug: string; name: string }[] }) {
  const router = useRouter()
  if (brands.length < 2) return null
  return (
    <label className="brand-switch">
      <span className="visually-hidden">Brand</span>
      <select className="select" value={current} onChange={(e) => router.push(e.target.value === "__new" ? "/?new=1" : `/b/${e.target.value}`)}>
        {brands.map((b) => (
          <option key={b.slug} value={b.slug}>{b.name}</option>
        ))}
        <option value="__new">+ New brand…</option>
      </select>
    </label>
  )
}
