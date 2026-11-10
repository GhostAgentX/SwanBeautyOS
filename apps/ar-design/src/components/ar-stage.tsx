"use client"
// Live AR preview: renders a Beauty OS look with the Banuba engine on the camera, a synthetic model
// photo, or an uploaded photo/video. Captures full-resolution stills and video.
import type { LookDocument } from "@beautyos/look-format"
import { TryOn, TryOnError, type TryOnInput } from "@beautyos/tryon-engine"
import { useEffect, useRef, useState } from "react"
import { Icon } from "./icons"
import { saveBlob, useToast } from "./ui"

export interface ModelOption {
  id: string
  name: string
  url: string
  thumbnailUrl: string | null
}

type Source = { kind: "camera" } | { kind: "model"; model: ModelOption } | { kind: "file"; file: File }

export function ArStage({
  look,
  intensity = 1,
  clientToken,
  models = [],
  initialModelId,
  onSaveRender,
  fileBase = "look",
}: {
  look: LookDocument | null
  intensity?: number
  clientToken: string
  models?: ModelOption[]
  initialModelId?: string
  /** When set, shows "Save to models" for renders on a synthetic model. */
  onSaveRender?: (blob: Blob, model: ModelOption) => Promise<void>
  fileBase?: string
}) {
  const container = useRef<HTMLDivElement>(null)
  const engine = useRef<TryOn | null>(null)
  const fileInput = useRef<HTMLInputElement>(null)
  const toast = useToast()
  const initialModel = models.find((m) => m.id === initialModelId)
  const [source, setSource] = useState<Source>(initialModel ? { kind: "model", model: initialModel } : { kind: "camera" })
  const [phase, setPhase] = useState<"idle" | "loading" | "ready" | "error">("idle")
  const [progress, setProgress] = useState({ label: "", value: 0 })
  const [error, setError] = useState("")
  const [comparing, setComparing] = useState(false)
  const [recording, setRecording] = useState(false)
  const [pickModel, setPickModel] = useState(false)

  useEffect(() => {
    engine.current = new TryOn(container.current!)
    engine.current.onAssetFailure((m) => toast(m, "error"))
    return () => void engine.current?.destroy()
  }, [toast])

  useEffect(() => engine.current?.setLook(look), [look])
  useEffect(() => engine.current?.setIntensity(intensity), [intensity])
  useEffect(() => engine.current?.setComparing(comparing), [comparing])

  const toInput = async (s: Source): Promise<TryOnInput> => {
    if (s.kind === "camera") return { source: "camera" }
    if (s.kind === "file") return s.file.type.startsWith("video/") ? { source: "video", file: s.file } : { source: "image", file: s.file }
    const res = await fetch(s.model.url)
    return { source: "image", file: await res.blob() }
  }

  const start = async (s: Source = source) => {
    const e = engine.current!
    setSource(s)
    try {
      if (e.running) {
        await e.setInput(await toInput(s))
        return
      }
      setPhase("loading")
      e.setLook(look)
      e.setIntensity(intensity)
      await e.start({ clientToken, assetsBaseUrl: "/banuba" }, (label, value) => setProgress({ label, value }), await toInput(s))
      setPhase("ready")
    } catch (err) {
      console.error(err)
      await e.destroy().catch(() => {})
      engine.current = new TryOn(container.current!)
      setError(err instanceof TryOnError ? err.message : `Couldn't start the preview: ${err instanceof Error ? err.message : String(err)}`)
      setPhase("error")
    }
  }

  const snap = async (type: "image/png" | "image/jpeg") => {
    const blob = await engine.current?.snapshot({ type, quality: 0.97 })
    if (!blob) return
    saveBlob(blob, `${fileBase}.${type === "image/png" ? "png" : "jpg"}`)
  }

  const saveRender = async () => {
    if (source.kind !== "model" || !onSaveRender) return
    const blob = await engine.current?.snapshot({ type: "image/png" })
    if (blob) await onSaveRender(blob, source.model)
  }

  const toggleRecording = async () => {
    const e = engine.current!
    if (!recording) {
      e.startRecording()
      setRecording(true)
      return
    }
    setRecording(false)
    const blob = await e.stopRecording()
    if (blob) saveBlob(blob, `${fileBase}.${blob.type.includes("mp4") ? "mp4" : "webm"}`)
  }

  const sourceLabel = source.kind === "camera" ? "Camera" : source.kind === "model" ? source.model.name : source.file.name

  return (
    <div className="stack-sm">
      <div className="row" style={{ justifyContent: "space-between" }}>
        <div className="segmented" role="group" aria-label="Preview on">
          <button aria-pressed={source.kind === "camera"} onClick={() => (phase === "ready" ? start({ kind: "camera" }) : setSource({ kind: "camera" }))}>Camera</button>
          <button aria-pressed={source.kind === "model"} onClick={() => setPickModel(true)} disabled={!models.length} title={models.length ? "" : "Generate models first"}>Model</button>
          <button aria-pressed={source.kind === "file"} onClick={() => fileInput.current?.click()}>Photo / video</button>
        </div>
        <span className="muted" style={{ fontSize: 12.5 }}>{sourceLabel}</span>
      </div>

      {pickModel && (
        <div className="card card-pad stack-sm">
          <div className="row" style={{ justifyContent: "space-between" }}>
            <strong>Choose a model</strong>
            <button className="btn btn-ghost btn-sm" onClick={() => setPickModel(false)}>Close</button>
          </div>
          <div className="row" style={{ gap: 8 }}>
            {models.map((m) => (
              <button key={m.id} className="tile" style={{ width: 92, padding: 0, cursor: "pointer" }} onClick={() => { setPickModel(false); void (phase === "ready" ? start({ kind: "model", model: m }) : (setSource({ kind: "model", model: m }), undefined)) }}>
                <div className="tile-media">{m.thumbnailUrl && <img src={m.thumbnailUrl} alt="" />}</div>
                <div className="tile-body" style={{ padding: 6, fontSize: 11.5 }}>{m.name.replace(/ · .*/, "")}</div>
              </button>
            ))}
          </div>
        </div>
      )}

      <input
        ref={fileInput}
        type="file"
        accept="image/*,video/*"
        hidden
        data-own-drop
        onChange={(e) => {
          const f = e.target.files?.[0]
          e.target.value = ""
          if (!f) return
          if (phase === "ready") void start({ kind: "file", file: f })
          else setSource({ kind: "file", file: f })
        }}
      />

      <div className="stage">
        <div className="stage-canvas" ref={container} />
        {phase !== "ready" && (
          <div className="stage-overlay">
            {phase === "idle" && (
              <div>
                <h2>Live preview</h2>
                <p>Renders this look with the Banuba engine{source.kind === "camera" ? " on your camera. Video stays on this device." : ` on ${sourceLabel}.`}</p>
                <button className="btn btn-primary" onClick={() => start()}>
                  <Icon name={source.kind === "camera" ? "camera" : "eye"} /> Start preview
                </button>
              </div>
            )}
            {phase === "loading" && (
              <div>
                <p style={{ marginBottom: 12 }}>{progress.label}…</p>
                <div className="progress" role="progressbar" aria-valuenow={Math.round(progress.value * 100)} aria-valuemin={0} aria-valuemax={100}>
                  <div style={{ width: `${progress.value * 100}%` }} />
                </div>
              </div>
            )}
            {phase === "error" && (
              <div>
                <h2>Preview unavailable</h2>
                <p>{error}</p>
                <button className="btn" onClick={() => start()}>Try again</button>
              </div>
            )}
          </div>
        )}
        {phase === "ready" && (
          <div className="stage-bar">
            <button
              className="btn btn-sm glass"
              aria-pressed={comparing}
              onPointerDown={() => setComparing(true)}
              onPointerUp={() => setComparing(false)}
              onPointerLeave={() => setComparing(false)}
              onKeyDown={(e) => (e.key === " " || e.key === "Enter") && setComparing(true)}
              onKeyUp={() => setComparing(false)}
              style={{ touchAction: "none" }}
            >
              Hold: before
            </button>
            <div className="row" style={{ gap: 6 }}>
              {source.kind === "model" && onSaveRender && (
                <button className="btn btn-sm glass" onClick={saveRender}><Icon name="check" /> Save to models</button>
              )}
              <button className="btn btn-sm glass" onClick={() => snap("image/png")} title="Full-resolution PNG"><Icon name="download" /> PNG</button>
              <button className="btn btn-sm glass" onClick={() => snap("image/jpeg")} title="Full-resolution JPEG">JPEG</button>
              <button className="btn btn-sm glass" aria-pressed={recording} onClick={toggleRecording}>
                <Icon name="record" /> {recording ? "Stop" : "Record"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
