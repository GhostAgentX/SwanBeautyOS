// Persists the user's custom looks in this browser.
// localStorage is per-device and can be unavailable (private mode, blocked storage), so every access is guarded.
// Swap this module for an API client to sync looks to a Swan Beauty account later.
import { sanitizeLook, type LookProfile } from "./makeup"

const KEY = "swan-beauty.custom-looks.v1"
export const MAX_CUSTOM_LOOKS = 12

export function loadCustomLooks(): LookProfile[] {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return []
    const parsed: unknown = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []
    return parsed
      .map(sanitizeLook)
      .filter((l): l is LookProfile => l !== null)
      .slice(0, MAX_CUSTOM_LOOKS)
  } catch {
    return []
  }
}

/** Returns false when the looks couldn't be persisted (they still work for this session). */
export function saveCustomLooks(looks: LookProfile[]): boolean {
  try {
    localStorage.setItem(KEY, JSON.stringify(looks.slice(0, MAX_CUSTOM_LOOKS)))
    return true
  } catch {
    return false
  }
}

export const newLookId = () => `custom-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`
