import "./style.css"
import { previewColors, validateLook, type LookDocument, REGION_SPECS } from "@beautyos/look-format"
import { TryOn, TryOnError, type TryOnInput } from "@beautyos/tryon-engine"
import { readConfig } from "./config"

interface PublishedLook {
  id: string
  slug: string
  version: number
  look: LookDocument
}

const $ = <T extends HTMLElement = HTMLElement>(id: string) => document.getElementById(id) as T
const ui = {
  topbar: $("topbar"), brandName: $("brand-name"), stage: $("stage"), intro: $("intro"), start: $<HTMLButtonElement>("start"), startFile: $<HTMLButtonElement>("start-file"),
  loading: $("loading"), loadingLabel: $("loading-label"), loadingBar: $("loading-bar"), error: $("error"), errorText: $("error-text"), retry: $<HTMLButtonElement>("retry"),
  actions: $("stage-actions"), compare: $<HTMLButtonElement>("compare"), snapPng: $<HTMLButtonElement>("snap-png"), snapJpg: $<HTMLButtonElement>("snap-jpg"), record: $<HTMLButtonElement>("record"),
  file: $<HTMLInputElement>("file"), looks: $("looks"), looksStatus: $("looks-status"), detail: $("look-detail"), lookName: $("look-name"), lookDesc: $("look-desc"),
  intensity: $("intensity"), shades: $("shades"), dlLook: $<HTMLButtonElement>("dl-look"), dlBanuba: $<HTMLButtonElement>("dl-banuba"),
}

let config: ReturnType<typeof readConfig>
try {
  config = readConfig(location.search, import.meta.env, location.origin)
} catch (e) {
  document.body.textContent = e instanceof Error ? e.message : String(e)
  throw e
}
if (config.embed) ui.topbar.hidden = true

const tryOn = new TryOn(ui.stage)
let looks: PublishedLook[] = []
let active: PublishedLook | null = null
let input: TryOnInput = { source: "camera" }
const show = (el: HTMLElement, on: boolean) => (el.hidden = !on)
const slug = (s: string) => s.toLowerCase().replace(/[^\w]+/g, "-").replace(/^-|-$/g, "")

// ---------- data ----------

async function loadLooks() {
  ui.looksStatus.textContent = "Loading looks…"
  try {
    const res = await fetch(`${config.api}/api/v1/brands/${config.brand}/looks`)
    if (!res.ok) throw new Error(res.status === 404 ? `Brand "${config.brand}" not found.` : `HTTP ${res.status}`)
    const data = (await res.json()) as { brand: { name: string; accentColor: string }; looks: PublishedLook[] }
    document.documentElement.style.setProperty("--accent", data.brand.accentColor)
    ui.brandName.textContent = data.brand.name
    document.title = `${data.brand.name} · Virtual Try-On`
    // Only render documents that validate: never trust remote data blindly.
    looks = data.looks.filter((l) => validateLook(l.look).ok)
    ui.looksStatus.textContent = looks.length ? "" : "No looks are published yet."
    renderLooks()
    const initial = looks.find((l) => l.slug === config.look) ?? looks[0]
    if (initial) select(initial)
  } catch (e) {
    ui.looksStatus.textContent = `Couldn't load looks: ${e instanceof Error ? e.message : String(e)}`
  }
}

function select(l: PublishedLook) {
  active = l
  tryOn.setLook(l.look)
  renderLooks()
  renderDetail()
}

// ---------- engine ----------

async function start(next: TryOnInput = input) {
  input = next
  if (tryOn.running) {
    await tryOn.setInput(next)
    return
  }
  show(ui.intro, false)
  show(ui.error, false)
  show(ui.loading, true)
  try {
    await tryOn.start({ clientToken: import.meta.env.BANUBA_CLIENT_TOKEN ?? "", assetsBaseUrl: "/banuba" }, (label, fraction) => {
      ui.loadingLabel.textContent = label
      ui.loadingBar.style.width = `${Math.round(fraction * 100)}%`
    }, next)
    show(ui.loading, false)
    show(ui.actions, true)
  } catch (e) {
    console.error(e)
    await tryOn.destroy().catch(() => {})
    show(ui.loading, false)
    ui.errorText.textContent = e instanceof TryOnError ? e.message : `Unexpected error: ${e instanceof Error ? e.message : String(e)}`
    show(ui.error, true)
  }
}

const setSourceButtons = (s: "camera" | "file") =>
  document.querySelectorAll<HTMLButtonElement>("[data-source]").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.source === s)))

ui.start.addEventListener("click", () => start({ source: "camera" }))
ui.retry.addEventListener("click", () => start())
ui.startFile.addEventListener("click", () => ui.file.click())
document.querySelectorAll<HTMLButtonElement>("[data-source]").forEach((b) =>
  b.addEventListener("click", () => {
    if (b.dataset.source === "file") ui.file.click()
    else { setSourceButtons("camera"); void start({ source: "camera" }) }
  }),
)
ui.file.addEventListener("change", () => {
  const f = ui.file.files?.[0]
  ui.file.value = ""
  if (!f) return
  setSourceButtons("file")
  void start(f.type.startsWith("video/") ? { source: "video", file: f } : { source: "image", file: f })
})

const compare = (on: boolean) => {
  tryOn.setComparing(on)
  ui.compare.setAttribute("aria-pressed", String(on))
}
ui.compare.addEventListener("pointerdown", () => compare(true))
for (const ev of ["pointerup", "pointerleave", "pointercancel"]) ui.compare.addEventListener(ev, () => compare(false))
ui.compare.addEventListener("keydown", (e) => (e.key === " " || e.key === "Enter") && compare(true))
ui.compare.addEventListener("keyup", () => compare(false))

function save(blob: Blob, name: string) {
  const a = document.createElement("a")
  a.href = URL.createObjectURL(blob)
  a.download = name
  a.click()
  setTimeout(() => URL.revokeObjectURL(a.href), 1500)
}
const fileBase = () => `${slug(ui.brandName.textContent ?? "try-on")}-${active?.slug ?? "look"}`
ui.snapPng.addEventListener("click", async () => { const b = await tryOn.snapshot({ type: "image/png" }); if (b) save(b, `${fileBase()}.png`) })
ui.snapJpg.addEventListener("click", async () => { const b = await tryOn.snapshot({ type: "image/jpeg", quality: 0.95 }); if (b) save(b, `${fileBase()}.jpg`) })
ui.record.addEventListener("click", async () => {
  if (!tryOn.recording) {
    tryOn.startRecording()
    ui.record.textContent = "Stop"
    ui.record.setAttribute("aria-pressed", "true")
    return
  }
  ui.record.textContent = "Record"
  ui.record.setAttribute("aria-pressed", "false")
  const b = await tryOn.stopRecording()
  if (b) save(b, `${fileBase()}.${b.type.includes("mp4") ? "mp4" : "webm"}`)
})

const download = async (target: "beautyos" | "banuba-effect") => {
  if (!active) return
  const res = await fetch(`${config.api}/api/v1/brands/${config.brand}/looks/${active.slug}/export?target=${target}`)
  if (!res.ok) return alert("Download failed. Please try again.")
  save(await res.blob(), `${active.slug}.${target === "beautyos" ? "beautyos-look.json" : "banuba-effect.zip"}`)
}
ui.dlLook.addEventListener("click", () => download("beautyos"))
ui.dlBanuba.addEventListener("click", () => download("banuba-effect"))

window.addEventListener("pagehide", () => void tryOn.destroy())

// ---------- rendering ----------

function renderLooks() {
  ui.looks.replaceChildren(
    ...looks.map((l) => {
      const b = document.createElement("button")
      b.type = "button"
      b.className = "chip"
      b.setAttribute("aria-pressed", String(active?.id === l.id))
      b.title = l.look.description
      const dots = document.createElement("span")
      dots.className = "chip-dots"
      dots.setAttribute("aria-hidden", "true")
      for (const c of previewColors(l.look)) {
        const d = document.createElement("span")
        d.style.background = c
        dots.append(d)
      }
      b.append(dots, l.look.name)
      b.addEventListener("click", () => select(l))
      return b
    }),
  )
  ui.looks.querySelector<HTMLElement>('[aria-pressed="true"]')?.scrollIntoView({ block: "nearest", inline: "nearest" })
}

function renderDetail() {
  show(ui.detail, Boolean(active))
  if (!active) return
  const look = active.look
  ui.lookName.textContent = look.name
  ui.lookDesc.textContent = look.description
  const label = document.createElement("label")
  label.className = "field"
  const text = document.createElement("span")
  text.className = "field-label"
  const out = document.createElement("span")
  out.className = "field-value"
  out.textContent = "100%"
  text.append("Intensity", out)
  const range = document.createElement("input")
  range.type = "range"
  range.min = "0"
  range.max = "100"
  range.value = "100"
  range.addEventListener("input", () => {
    out.textContent = `${range.value}%`
    tryOn.setIntensity(Number(range.value) / 100)
  })
  tryOn.setIntensity(1)
  label.append(text, range)
  ui.intensity.replaceChildren(label)

  ui.shades.replaceChildren(
    ...look.layers.map((l) => {
      const li = document.createElement("li")
      const sw = document.createElement("span")
      sw.className = "swatch-dot"
      sw.style.background = l.material.color
      const body = document.createElement("span")
      const title = document.createElement("strong")
      title.textContent = l.shade ? `${l.shade.productName ?? REGION_SPECS[l.region].label} · ${l.shade.name}` : REGION_SPECS[l.region].label
      const sub = document.createElement("span")
      sub.className = "shade-sub"
      sub.textContent = [l.shade?.sku, l.material.finish].filter(Boolean).join(" · ")
      body.append(title, sub)
      li.append(sw, body)
      return li
    }),
  )
}

void loadLooks()
