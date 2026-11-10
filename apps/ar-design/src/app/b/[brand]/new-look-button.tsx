"use client"
import { useRouter } from "next/navigation"
import { useTransition } from "react"
import { createLookAction } from "@/app/actions"
import { Icon } from "@/components/icons"
import { useToast } from "@/components/ui"

export function NewLookButton({ brand, document, label = "New look" }: { brand: string; document?: unknown; label?: string }) {
  const router = useRouter()
  const toast = useToast()
  const [pending, start] = useTransition()
  return (
    <button
      className="btn btn-primary"
      disabled={pending}
      onClick={() =>
        start(async () => {
          const r = await createLookAction(brand, document ? { document } : { name: "Untitled look" })
          if (r.ok) router.push(`/b/${brand}/looks/${r.data.id}`)
          else toast(r.error, "error")
        })
      }
    >
      <Icon name="plus" /> {pending ? "Creating…" : label}
    </button>
  )
}
