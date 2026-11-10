import "./style.css"
import { TryOn, TryOnError } from "./ar"
import {
  CATEGORIES,
  LOOKS,
  PRODUCTS,
  buildConfig,
  productById,
  stateFromLook,
  type CategoryId,
  type MakeupState,
  type ProductId,
} from "./makeup"

const $ = <T extends HTMLElement = HTMLElement>(id: string) => document.getElementById(id) as T

const ui = {
  stage: $("stage"),
  intro: $("intro"),
  start: $<HTMLButtonElement>("start"),
  loading: $("loading"),
  loadingLabel: $("loading-label"),
  loadingBar: $("loading-bar"),
  error: $("error"),
  errorText: $("error-text"),
  retry: $<HTMLButtonElement>("retry"),
  stageActions: $("stage-actions"),
  compare: $<HTMLButtonElement>("compare"),
  snap: $<HTMLButtonElement>("snap"),
  looks: $("looks"),
  tabs: $("tabs"),
  products: $("products"),
}

let state: MakeupState = stateFromLook(LOOKS.find((l) => l.id === "natural")!.spec)
let activeLook: string | null = "natural"
let activeCategory: CategoryId = "lips"
let comparing = false
const tryOn = new TryOn(ui.stage)

// ---------- AR wiring ----------

let frameRequested = false
function pushConfig() {
  // Coalesce rapid slider input into one reloadConfig per animation frame.
  if (frameRequested) return
  frameRequested = true
  requestAnimationFrame(() => {
    frameRequested = false
    tryOn.update(buildConfig(comparing ? null : state))
  })
}

function show(el: HTMLElement, visible: boolean) {
  el.hidden = !visible
}

async function start() {
  show(ui.intro, false)
  show(ui.error, false)
  show(ui.loading, true)
  try {
    await tryOn.start(import.meta.env.BANUBA_CLIENT_TOKEN ?? "", buildConfig(state), (label, fraction) => {
      ui.loadingLabel.textContent = label
      const pct = Math.round(fraction * 100)
      ui.loadingBar.style.width = `${pct}%`
      ui.loadingBar.parentElement?.setAttribute("aria-valuenow", String(pct))
    })
    show(ui.loading, false)
    show(ui.stageActions, true)
  } catch (e) {
    console.error(e)
    await tryOn.destroy().catch(() => {})
    show(ui.loading, false)
    ui.errorText.textContent =
      e instanceof TryOnError ? e.message : `Unexpected error: ${e instanceof Error ? e.message : String(e)}`
    show(ui.error, true)
  }
}

ui.start.addEventListener("click", start)
ui.retry.addEventListener("click", start)

const setComparing = (on: boolean) => {
  if (comparing === on) return
  comparing = on
  ui.compare.setAttribute("aria-pressed", String(on))
  pushConfig()
}
ui.compare.addEventListener("pointerdown", () => setComparing(true))
for (const ev of ["pointerup", "pointerleave", "pointercancel"]) ui.compare.addEventListener(ev, () => setComparing(false))
ui.compare.addEventListener("keydown", (e) => (e.key === " " || e.key === "Enter") && setComparing(true))
ui.compare.addEventListener("keyup", () => setComparing(false))

ui.snap.addEventListener("click", async () => {
  const blob = await tryOn.snapshot()
  if (!blob) return
  const a = document.createElement("a")
  a.href = URL.createObjectURL(blob)
  a.download = `swan-beauty-${new Date().toISOString().replace(/[:.]/g, "-")}.png`
  a.click()
  setTimeout(() => URL.revokeObjectURL(a.href), 1000)
})

window.addEventListener("pagehide", () => void tryOn.destroy())

// ---------- Panel rendering ----------

function renderLooks() {
  ui.looks.replaceChildren(
    ...LOOKS.map((look) => {
      const b = document.createElement("button")
      b.type = "button"
      b.className = "chip"
      b.textContent = look.label
      b.setAttribute("aria-pressed", String(activeLook === look.id))
      b.addEventListener("click", () => {
        state = stateFromLook(look.spec)
        activeLook = look.id
        renderAll()
        pushConfig()
      })
      return b
    }),
  )
}

function renderTabs() {
  ui.tabs.replaceChildren(
    ...CATEGORIES.map((cat) => {
      const b = document.createElement("button")
      b.type = "button"
      b.role = "tab"
      b.className = "tab"
      b.id = `tab-${cat.id}`
      b.textContent = cat.label
      const count = PRODUCTS.filter((p) => p.category === cat.id && state.products[p.id].enabled).length
      if (count) {
        const dot = document.createElement("span")
        dot.className = "tab-count"
        dot.textContent = String(count)
        dot.setAttribute("aria-label", `${count} active`)
        b.append(dot)
      }
      b.setAttribute("aria-selected", String(activeCategory === cat.id))
      b.addEventListener("click", () => {
        activeCategory = cat.id
        renderTabs()
        renderProducts()
      })
      return b
    }),
  )
  ui.products.setAttribute("aria-labelledby", `tab-${activeCategory}`)
}

/** Any manual edit means we're no longer exactly on a preset look. */
function edited() {
  activeLook = null
  renderLooks()
  renderTabs()
  pushConfig()
}

function slider(label: string, value: number, onInput: (v: number) => void) {
  const wrap = document.createElement("label")
  wrap.className = "field"
  const text = document.createElement("span")
  text.className = "field-label"
  const out = document.createElement("span")
  out.className = "field-value"
  out.textContent = `${Math.round(value * 100)}%`
  text.append(label, out)
  const input = document.createElement("input")
  input.type = "range"
  input.min = "0"
  input.max = "100"
  input.value = String(Math.round(value * 100))
  input.addEventListener("input", () => {
    out.textContent = `${input.value}%`
    onInput(Number(input.value) / 100)
  })
  wrap.append(text, input)
  return wrap
}

const prettyFinish = (f: string) => f.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())

function productCard(id: ProductId) {
  const def = productById(id)
  const p = state.products[id]
  const card = document.createElement("div")
  card.className = "card"
  card.dataset.enabled = String(p.enabled)

  const head = document.createElement("div")
  head.className = "card-head"
  const title = document.createElement("span")
  title.className = "card-title"
  title.textContent = def.label
  const toggle = document.createElement("button")
  toggle.type = "button"
  toggle.className = "switch"
  toggle.role = "switch"
  toggle.setAttribute("aria-checked", String(p.enabled))
  toggle.setAttribute("aria-label", `${def.label} on/off`)
  toggle.addEventListener("click", () => {
    p.enabled = !p.enabled
    renderProducts()
    edited()
  })
  head.append(title, toggle)
  card.append(head)

  const body = document.createElement("div")
  body.className = "card-body"

  const swatches = document.createElement("div")
  swatches.className = "swatches"
  swatches.role = "radiogroup"
  swatches.setAttribute("aria-label", `${def.label} shade`)
  for (const shade of def.shades) {
    const s = document.createElement("button")
    s.type = "button"
    s.className = "swatch"
    s.role = "radio"
    s.style.setProperty("--swatch", shade.hex)
    s.title = shade.name
    s.setAttribute("aria-label", shade.name)
    s.setAttribute("aria-checked", String(p.enabled && p.color.toLowerCase() === shade.hex))
    s.addEventListener("click", () => {
      p.color = shade.hex
      p.enabled = true
      renderProducts()
      edited()
    })
    swatches.append(s)
  }
  const shadeName = document.createElement("p")
  shadeName.className = "shade-name"
  shadeName.textContent = def.shades.find((s) => s.hex === p.color.toLowerCase())?.name ?? p.color

  body.append(swatches, shadeName)

  if (p.enabled) {
    if (def.finishes.length > 1) {
      const field = document.createElement("label")
      field.className = "field"
      const lab = document.createElement("span")
      lab.className = "field-label"
      lab.textContent = "Finish"
      const select = document.createElement("select")
      for (const f of def.finishes) select.append(new Option(prettyFinish(f), f, false, f === p.finish))
      select.addEventListener("change", () => {
        p.finish = select.value
        edited()
      })
      field.append(lab, select)
      body.append(field)
    }
    body.append(
      slider("Intensity", p.coverage, (v) => {
        p.coverage = v
        edited()
      }),
    )
  }

  card.append(body)
  return card
}

function renderProducts() {
  const cards: HTMLElement[] = PRODUCTS.filter((p) => p.category === activeCategory).map((p) => productCard(p.id))
  if (activeCategory === "face") {
    const card = document.createElement("div")
    card.className = "card"
    card.dataset.enabled = "true"
    const head = document.createElement("div")
    head.className = "card-head"
    head.innerHTML = `<span class="card-title">Skin smoothing</span>`
    const body = document.createElement("div")
    body.className = "card-body"
    body.append(
      slider("Strength", state.smoothing, (v) => {
        state.smoothing = v
        edited()
      }),
    )
    card.append(head, body)
    cards.unshift(card)
  }
  ui.products.replaceChildren(...cards)
}

function renderAll() {
  renderLooks()
  renderTabs()
  renderProducts()
}

renderAll()
