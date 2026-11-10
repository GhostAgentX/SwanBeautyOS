"use client"
// Drop files anywhere in the studio (or click Import). Media goes through the asset pipeline;
// .json looks, .zip bundles and .ase/.csv color libraries are routed by the server.
import { useRouter } from "next/navigation"
import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react"
import { Icon } from "./icons"
import { useToast } from "./ui"

type Result = { file: string; kind: string; id?: string; message: string }
const ImportCtx = createContext<{ open: () => void; upload: (files: File[], opts?: { enhance?: string }) => Promise<Result[]> }>({ open: () => {}, upload: async () => [] })
export const useImporter = () => useContext(ImportCtx)

export const ACCEPT = "image/*,video/*,.json,.zip,.ase,.csv,.tsv"

export function ImportProvider({ brand, children }: { brand: string; children: React.ReactNode }) {
  const router = useRouter()
  const toast = useToast()
  const input = useRef<HTMLInputElement>(null)
  const [over, setOver] = useState(false)
  const depth = useRef(0)

  const upload = useCallback(
    async (files: File[], opts: { enhance?: string } = {}) => {
      if (!files.length) return []
      toast(`Importing ${files.length} file${files.length > 1 ? "s" : ""}…`)
      const results: Result[] = []
      // One request per file keeps each under the platform body limit and lets big videos stream in.
      for (const f of files) {
        const body = new FormData()
        body.append("file", f)
        if (opts.enhance) body.append("enhance", opts.enhance)
        const res = await fetch(`/api/studio/${brand}/import`, { method: "POST", body })
        const r: Result = res.ok ? await res.json() : { file: f.name, kind: "skipped", message: (await res.json().catch(() => ({}))).error ?? `HTTP ${res.status}` }
        results.push(r)
        toast(`${r.file}: ${r.message}`, r.kind === "skipped" ? "error" : "info")
      }
      router.refresh()
      const look = results.find((r) => (r.kind === "look" || r.kind === "bundle") && r.id)
      if (look && files.length === 1) router.push(`/b/${brand}/looks/${look.id}`)
      return results
    },
    [brand, router, toast],
  )

  useEffect(() => {
    const hasFiles = (e: DragEvent) => Array.from(e.dataTransfer?.types ?? []).includes("Files")
    const enter = (e: DragEvent) => { if (hasFiles(e)) { depth.current++; setOver(true) } }
    const leave = () => { depth.current = Math.max(0, depth.current - 1); if (!depth.current) setOver(false) }
    const overFn = (e: DragEvent) => { if (hasFiles(e)) e.preventDefault() }
    const drop = (e: DragEvent) => {
      // Inputs that handle their own drops (e.g. the Lab's swatch reader) mark themselves.
      if ((e.target as HTMLElement | null)?.closest?.("[data-own-drop]")) { depth.current = 0; setOver(false); return }
      if (!hasFiles(e)) return
      e.preventDefault()
      depth.current = 0
      setOver(false)
      void upload(Array.from(e.dataTransfer!.files))
    }
    window.addEventListener("dragenter", enter)
    window.addEventListener("dragleave", leave)
    window.addEventListener("dragover", overFn)
    window.addEventListener("drop", drop)
    return () => {
      window.removeEventListener("dragenter", enter)
      window.removeEventListener("dragleave", leave)
      window.removeEventListener("dragover", overFn)
      window.removeEventListener("drop", drop)
    }
  }, [upload])

  return (
    <ImportCtx.Provider value={{ open: () => input.current?.click(), upload }}>
      {children}
      <input ref={input} type="file" multiple accept={ACCEPT} hidden onChange={(e) => { void upload(Array.from(e.target.files ?? [])); e.target.value = "" }} />
      {over && (
        <div className="drop-overlay" aria-hidden="true">
          <div>
            <Icon name="upload" size={20} /> Drop to import: images, videos, looks, bundles or color libraries
          </div>
        </div>
      )}
    </ImportCtx.Provider>
  )
}

export function ImportButton({ label = "Import", primary = false }: { label?: string; primary?: boolean }) {
  const { open } = useImporter()
  return (
    <button className={`btn ${primary ? "btn-primary" : ""}`} onClick={open}>
      <Icon name="upload" /> {label}
    </button>
  )
}
