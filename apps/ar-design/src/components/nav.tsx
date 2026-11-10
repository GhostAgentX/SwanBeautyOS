"use client"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Icon, type IconName } from "./icons"

const ITEMS: { href: string; label: string; icon: IconName; group: "create" | "manage" }[] = [
  { href: "", label: "Studio", icon: "studio", group: "create" },
  { href: "/models", label: "Models", icon: "models", group: "create" },
  { href: "/lab", label: "Lab", icon: "lab", group: "create" },
  { href: "/assets", label: "Assets", icon: "assets", group: "manage" },
  { href: "/catalog", label: "Catalog", icon: "catalog", group: "manage" },
  { href: "/publish", label: "Publish & embed", icon: "publish", group: "manage" },
]

export function Nav({ brand }: { brand: string }) {
  const path = usePathname()
  const base = `/b/${brand}`
  const current = (href: string) => (href === "" ? path === base || path.startsWith(`${base}/looks`) : path.startsWith(base + href))
  const group = (g: "create" | "manage") =>
    ITEMS.filter((i) => i.group === g).map((i) => (
      <Link key={i.href} href={base + i.href} aria-current={current(i.href) ? "page" : undefined}>
        <Icon name={i.icon} />
        {i.label}
      </Link>
    ))
  return (
    <nav className="nav" aria-label="Main">
      <div className="nav-label">Create</div>
      {group("create")}
      <div className="nav-label">Manage</div>
      {group("manage")}
    </nav>
  )
}
