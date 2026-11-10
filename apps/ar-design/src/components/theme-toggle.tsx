"use client"
import { useSyncExternalStore } from "react"
import { Icon } from "./icons"

type Mode = "system" | "light" | "dark"
const NEXT: Record<Mode, Mode> = { system: "light", light: "dark", dark: "system" }
const LABEL: Record<Mode, string> = { system: "Theme: system", light: "Theme: light", dark: "Theme: dark" }
const KEY = "beautyos-theme"
const listeners = new Set<() => void>()

function read(): Mode {
  try {
    const t = localStorage.getItem(KEY)
    return t === "light" || t === "dark" ? t : "system"
  } catch {
    return "system"
  }
}

function subscribe(cb: () => void) {
  listeners.add(cb)
  window.addEventListener("storage", cb)
  return () => {
    listeners.delete(cb)
    window.removeEventListener("storage", cb)
  }
}

function apply(mode: Mode) {
  try {
    if (mode === "system") localStorage.removeItem(KEY)
    else localStorage.setItem(KEY, mode)
  } catch {}
  if (mode === "system") delete document.documentElement.dataset.theme
  else document.documentElement.dataset.theme = mode
  listeners.forEach((l) => l())
}

export function ThemeToggle() {
  const mode = useSyncExternalStore(subscribe, read, () => "system" as Mode)
  return (
    <button className="btn btn-ghost btn-icon btn-sm" onClick={() => apply(NEXT[mode])} title={LABEL[mode]} aria-label={LABEL[mode]}>
      <Icon name={mode === "light" ? "sun" : mode === "dark" ? "moon" : "monitor"} />
    </button>
  )
}
