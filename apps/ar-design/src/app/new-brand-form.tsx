"use client"
import { useActionState } from "react"
import { createBrandAction } from "./actions"

export function NewBrandForm() {
  const [state, action, pending] = useActionState(createBrandAction, null)
  return (
    <form action={action} className="row" style={{ alignItems: "flex-end" }}>
      <label className="field" style={{ flex: 1, minWidth: 200 }}>
        <span>Brand name</span>
        <input className="input" name="name" required placeholder="e.g. Swan Beauty" />
      </label>
      <label className="field">
        <span>Accent</span>
        <input type="color" name="accent" defaultValue="#9b4b5c" />
      </label>
      <button className="btn btn-primary" disabled={pending}>{pending ? "Creating…" : "Create brand"}</button>
      {state && !state.ok && <p className="notice notice-danger" style={{ width: "100%" }}>{state.error}</p>}
    </form>
  )
}
