"use client"
import { useState } from "react"
import { Icon } from "@/components/icons"

export function CopyField({ value, multiline = false }: { value: string; multiline?: boolean }) {
  const [copied, setCopied] = useState(false)
  return (
    <div className="row" style={{ flexWrap: "nowrap", alignItems: "flex-start" }}>
      {multiline ? <pre className="code" style={{ flex: 1, margin: 0 }}>{value}</pre> : <input className="input mono" readOnly value={value} style={{ flex: 1 }} onFocus={(e) => e.target.select()} />}
      <button className="btn" onClick={async () => { await navigator.clipboard.writeText(value); setCopied(true); setTimeout(() => setCopied(false), 1500) }}>
        <Icon name={copied ? "check" : "download"} /> {copied ? "Copied" : "Copy"}
      </button>
    </div>
  )
}
