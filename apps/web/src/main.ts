import "./style.css"
import { TryOn, TryOnError } from "./ar"
import { MAX_CUSTOM_LOOKS, loadCustomLooks, newLookId, saveCustomLooks } from "./lookStore"
import {
  CATEGORIES,
  DEFAULT_LOOK_ID,
  OCCASIONS,
  PRESET_LOOKS,
  PRODUCTS,
  buildConfig,
  defaultShade,
  lookFromState,
  lookPreviewColors,
  matchesLook,
  productById,
  shadeName,
  stateFromLook,
  type CategoryId,
  type LookProfile,
  type MakeupState,
  type ProductId,
  type Shade,
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
  lookMeta: $("look-meta"),
  lookIntensity: $("look-intensity"),
  saveLook: $<HTMLButtonElement>("save-look"),
  saveForm: $<HTMLFormElement>("save-form"),
  lookName: $<HTMLInputElement>("look-name"),
  cancelSave: $<HTMLButtonElement>("cancel-save"),
  tabs: $("tabs"),
  products: $("products"),
}

// ---------- App state ----------

let customLooks: LookProfile[] = loadCustomLooks()
const allLooks = () => [...PRESET_LOOKS, ...customLooks]
const findLook = (id: string | null) => allLooks().find((l) => l.id === id) ?? null

/** The look the user last picked. Edits keep it selected but mark it "Edited" until they reset or save. */
let activeLookId: string | null = DEFAULT_LOOK_ID
let state: MakeupState = stateFromLook(findLook(DEFAULT_LOOK_ID)!)
let activeCategory: CategoryId = "lips"
/** Which eyeshadow layer the swatches/finish/intensity controls edit. */
const activeLayer: Partial<Record<ProductId, number>> = {}
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

// ---------- Look actions ----------

function applyLook(look: LookProfile) {
  state = stateFromLook(look)
  activeLookId = look.id
  for (const k of Object.keys(activeLayer)) delete activeLayer[k as ProductId]
  renderAll()
  pushConfig()
}

function isEdited() {
  const look = findLook(activeLookId)
  return !look || !matchesLook(state, look)
}

/** Call after any manual change to the state. */
function edited() {
  renderLooks()
  renderLookMeta()
  renderTabs()
  pushConfig()
}

function persist() {
  if (!saveCustomLooks(customLooks)) {
    ui.lookMeta.dataset.warning = "Couldn't save in this browser (storage is blocked). Your look works until you leave."
  }
}

ui.saveLook.addEventListener("click", () => {
  if (customLooks.length >= MAX_CUSTOM_LOOKS) {
    ui.lookMeta.dataset.warning = `You can keep up to ${MAX_CUSTOM_LOOKS} looks. Delete one to save another.`
    renderLookMeta()
    return
  }
  show(ui.saveForm, true)
  const base = findLook(activeLookId)
  ui.lookName.value = base && !base.custom ? `My ${base.name}` : ""
  ui.lookName.focus()
  ui.lookName.select()
})
ui.cancelSave.addEventListener("click", () => show(ui.saveForm, false))
ui.saveForm.addEventListener("submit", (e) => {
  e.preventDefault()
  const name = ui.lookName.value.trim()
  if (!name) return
  const look = lookFromState(state, { id: newLookId(), name })
  customLooks = [...customLooks, look]
  persist()
  show(ui.saveForm, false)
  applyLook(look)
})

function deleteLook(id: string) {
  customLooks = customLooks.filter((l) => l.id !== id)
  persist()
  // Keep the face as-is; it simply stops being tied to the deleted look.
  if (activeLookId === id) activeLookId = null
  renderLooks()
  renderLookMeta()
}

// ---------- Panel rendering ----------

function lookChip(look: LookProfile) {
  const wrap = document.createElement("div")
  wrap.className = "chip-wrap"

  const b = document.createElement("button")
  b.type = "button"
  b.className = "chip"
  b.setAttribute("aria-pressed", String(activeLookId === look.id))
  b.title = look.description
  const dots = document.createElement("span")
  dots.className = "chip-dots"
  dots.setAttribute("aria-hidden", "true")
  for (const c of lookPreviewColors(look)) {
    const d = document.createElement("span")
    d.style.background = c
    dots.append(d)
  }
  if (dots.childElementCount) b.append(dots)
  b.append(look.name)
  b.addEventListener("click", () => applyLook(look))
  wrap.append(b)

  if (look.custom) {
    const del = document.createElement("button")
    del.type = "button"
    del.className = "chip-delete"
    del.setAttribute("aria-label", `Delete ${look.name}`)
    del.textContent = "×"
    del.addEventListener("click", () => deleteLook(look.id))
    wrap.append(del)
  }
  return wrap
}

function renderLooks() {
  const nodes: HTMLElement[] = PRESET_LOOKS.map(lookChip)
  if (customLooks.length) {
    const sep = document.createElement("span")
    sep.className = "chips-sep"
    sep.textContent = "Mine"
    nodes.push(sep, ...customLooks.map(lookChip))
  }
  ui.looks.replaceChildren(...nodes)
  // On phones the row scrolls sideways; keep the selected look in view.
  ui.looks.querySelector<HTMLElement>('.chip[aria-pressed="true"]')?.scrollIntoView({ block: "nearest", inline: "nearest" })
}

function renderLookMeta() {
  const look = findLook(activeLookId)
  const edited = isEdited()
  const frag = document.createDocumentFragment()

  const title = document.createElement("div")
  title.className = "look-title"
  const name = document.createElement("strong")
  name.textContent = look ? look.name : "Custom"
  title.append(name)
  if (look) {
    const tag = document.createElement("span")
    tag.className = "tag"
    tag.textContent = OCCASIONS[look.occasion]
    title.append(tag)
  }
  if (look && edited) {
    const badge = document.createElement("span")
    badge.className = "tag tag-edited"
    badge.textContent = "Edited"
    const reset = document.createElement("button")
    reset.type = "button"
    reset.className = "link-btn"
    reset.textContent = "Reset"
    reset.addEventListener("click", () => applyLook(look))
    title.append(badge, reset)
  }
  frag.append(title)

  const desc = document.createElement("p")
  desc.className = "look-desc"
  desc.textContent = look ? look.description : "Your own mix. Save it to keep it."
  frag.append(desc)

  const warning = ui.lookMeta.dataset.warning
  if (warning) {
    const w = document.createElement("p")
    w.className = "look-warning"
    w.textContent = warning
    frag.append(w)
    delete ui.lookMeta.dataset.warning
  }
  ui.lookMeta.replaceChildren(frag)
}

function renderLookIntensity() {
  ui.lookIntensity.replaceChildren(
    slider("Look intensity", state.intensity, (v) => {
      state.intensity = v
      pushConfig()
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

/** Layer selector for stackable products (eyeshadow): pick, add or remove a layer. */
function layerControls(id: ProductId, layers: Shade[], current: number) {
  const def = productById(id)
  const row = document.createElement("div")
  row.className = "layers"
  row.setAttribute("role", "group")
  row.setAttribute("aria-label", `${def.label} layers`)

  layers.forEach((layer, i) => {
    const b = document.createElement("button")
    b.type = "button"
    b.className = "layer"
    b.setAttribute("aria-pressed", String(i === current))
    b.setAttribute("aria-label", `Layer ${i + 1}: ${shadeName(id, layer.color)}, ${prettyFinish(layer.finish)}`)
    const sw = document.createElement("span")
    sw.className = "layer-swatch"
    sw.style.background = layer.color
    b.append(sw, `Layer ${i + 1}`)
    b.addEventListener("click", () => {
      activeLayer[id] = i
      renderProducts()
    })
    row.append(b)
  })

  if (layers.length < def.maxLayers) {
    const add = document.createElement("button")
    add.type = "button"
    add.className = "layer layer-add"
    add.textContent = "+ Add layer"
    add.addEventListener("click", () => {
      layers.push(defaultShade(id, layers.length + 1))
      activeLayer[id] = layers.length - 1
      renderProducts()
      edited()
    })
    row.append(add)
  }
  if (layers.length > 1) {
    const rm = document.createElement("button")
    rm.type = "button"
    rm.className = "link-btn"
    rm.textContent = `Remove layer ${current + 1}`
    rm.addEventListener("click", () => {
      layers.splice(current, 1)
      activeLayer[id] = Math.max(0, current - 1)
      renderProducts()
      edited()
    })
    row.append(rm)
  }
  return row
}

function productCard(id: ProductId) {
  const def = productById(id)
  const p = state.products[id]
  const layerIndex = Math.min(activeLayer[id] ?? 0, p.layers.length - 1)
  const shade = p.layers[layerIndex]

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

  if (p.enabled && def.maxLayers > 1) body.append(layerControls(id, p.layers, layerIndex))

  const swatches = document.createElement("div")
  swatches.className = "swatches"
  swatches.role = "radiogroup"
  swatches.setAttribute("aria-label", `${def.label} shade`)
  for (const s of def.shades) {
    const b = document.createElement("button")
    b.type = "button"
    b.className = "swatch"
    b.role = "radio"
    b.style.setProperty("--swatch", s.hex)
    b.title = s.name
    b.setAttribute("aria-label", s.name)
    b.setAttribute("aria-checked", String(p.enabled && shade.color.toLowerCase() === s.hex))
    b.addEventListener("click", () => {
      shade.color = s.hex
      p.enabled = true
      renderProducts()
      edited()
    })
    swatches.append(b)
  }
  const nameEl = document.createElement("p")
  nameEl.className = "shade-name"
  nameEl.textContent = shadeName(id, shade.color)
  body.append(swatches, nameEl)

  if (p.enabled) {
    if (def.finishes.length > 1) {
      const field = document.createElement("label")
      field.className = "field"
      const lab = document.createElement("span")
      lab.className = "field-label"
      lab.textContent = "Finish"
      const select = document.createElement("select")
      for (const f of def.finishes) select.append(new Option(prettyFinish(f), f, false, f === shade.finish))
      select.addEventListener("change", () => {
        shade.finish = select.value
        if (def.maxLayers > 1) renderProducts()
        edited()
      })
      field.append(lab, select)
      body.append(field)
    }
    body.append(
      slider("Intensity", shade.coverage, (v) => {
        shade.coverage = v
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
  renderLookMeta()
  renderLookIntensity()
  renderTabs()
  renderProducts()
}

renderAll()
