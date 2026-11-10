"use client"
// Export: pick a preset (one click), or open "Customize" for full technical control.
import { useMemo, useState } from "react"
import { Icon } from "@/components/icons"
import { useToast } from "@/components/ui"
import { ExportProfile, FIT_MODES, IMAGE_FORMATS, PRESET_PROFILES, VIDEO_FORMATS, type ExportProfileInput } from "@/lib/export-profiles"

export function ExportProfileEditor({ kind, onExport }: { kind: "image" | "video"; onExport: (p: ExportProfileInput) => Promise<void> }) {
  const toast = useToast()
  // Videos can export stills (poster frames) through image profiles.
  const presets = useMemo(() => PRESET_PROFILES.filter((p) => kind === "video" || p.profile.kind === "image"), [kind])
  const [presetId, setPresetId] = useState(presets[0].id)
  const [custom, setCustom] = useState<ExportProfileInput>(presets[0].profile)
  const [customizing, setCustomizing] = useState(false)
  const [busy, setBusy] = useState(false)
  const groups = [...new Set(presets.map((p) => p.group))]
  const profile = customizing ? custom : presets.find((p) => p.id === presetId)!.profile
  const valid = ExportProfile.safeParse(profile)
  const set = (patch: Record<string, unknown>) => setCustom((c) => ({ ...c, ...patch }) as ExportProfileInput)
  const num = (v: string) => (v === "" ? undefined : Number(v))
  const c = custom as Record<string, unknown>

  const go = async () => {
    if (!valid.success) return
    setBusy(true)
    try { await onExport(valid.data) } catch (e) { toast(e instanceof Error ? e.message : String(e), "error") } finally { setBusy(false) }
  }

  return (
    <div className="card card-pad stack-sm" style={{ padding: 14 }}>
      <span className="label">Export</span>
      <div className="row" style={{ flexWrap: "nowrap" }}>
        <select className="select" value={customizing ? "__custom" : presetId} aria-label="Export preset" onChange={(e) => {
          if (e.target.value === "__custom") { setCustomizing(true); return }
          setCustomizing(false)
          setPresetId(e.target.value)
          setCustom(presets.find((p) => p.id === e.target.value)!.profile)
        }}>
          {groups.map((g) => (
            <optgroup key={g} label={g}>
              {presets.filter((p) => p.group === g).map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
            </optgroup>
          ))}
          <option value="__custom">Custom…</option>
        </select>
        <button className="btn btn-primary" onClick={go} disabled={busy || !valid.success}><Icon name="download" size={15} /> {busy ? "Rendering…" : "Export"}</button>
      </div>
      <details className="advanced" open={customizing} onToggle={(e) => setCustomizing((e.target as HTMLDetailsElement).open)}>
        <summary>Customize size, format and specs</summary>
        <div className="stack-sm" style={{ paddingTop: 8 }}>
          <div className="grid-2">
            <label className="field"><span>Output</span>
              <select className="select" value={custom.kind} onChange={(e) => setCustom(e.target.value === "image" ? { kind: "image", format: "png" } : { kind: "video", format: "mp4" })}>
                <option value="image">Image{kind === "video" ? " (still frame)" : ""}</option>
                {kind === "video" && <option value="video">Video</option>}
              </select>
            </label>
            <label className="field"><span>Format</span>
              <select className="select" value={custom.format} onChange={(e) => set({ format: e.target.value })}>
                {(custom.kind === "image" ? IMAGE_FORMATS : VIDEO_FORMATS).map((f) => <option key={f} value={f}>{f.toUpperCase()}</option>)}
              </select>
            </label>
            <label className="field"><span>Width (px)</span><input className="input" type="number" min={16} value={(c.width as number) ?? ""} placeholder="auto" onChange={(e) => set({ width: num(e.target.value) })} /></label>
            <label className="field"><span>Height (px)</span><input className="input" type="number" min={16} value={(c.height as number) ?? ""} placeholder="auto" onChange={(e) => set({ height: num(e.target.value) })} /></label>
            <label className="field"><span>Aspect ratio</span>
              <select className="select" value={(c.aspectRatio as string) ?? ""} onChange={(e) => set({ aspectRatio: e.target.value || undefined })}>
                <option value="">Source</option>
                {["1:1", "4:5", "3:4", "2:3", "9:16", "16:9", "4:3", "1.91:1", "21:9"].map((r) => <option key={r} value={r}>{r}</option>)}
              </select>
            </label>
            <label className="field"><span>Fit</span>
              <select className="select" value={(c.fit as string) ?? "cover"} onChange={(e) => set({ fit: e.target.value })}>
                {FIT_MODES.map((f) => <option key={f} value={f}>{f === "cover" ? "Fill (crop)" : f === "contain" ? "Fit (no crop)" : "Fit + pad"}</option>)}
              </select>
            </label>
            {c.fit === "pad" && <label className="field"><span>Pad color</span><input type="color" value={(c.padColor as string) ?? "#ffffff"} onChange={(e) => set({ padColor: e.target.value })} /></label>}
            <label className="field"><span>Crop anchor</span>
              <select className="select" value={(c.anchor as string) ?? "attention"} onChange={(e) => set({ anchor: e.target.value })}>
                <option value="attention">Smart (subject)</option><option value="top">Top (keep headroom)</option><option value="center">Center</option><option value="bottom">Bottom</option><option value="entropy">Detail</option>
              </select>
            </label>
          </div>
          {custom.kind === "image" ? (
            <div className="grid-2">
              <label className="field"><span>Quality</span><input className="input" type="number" min={1} max={100} value={(c.quality as number) ?? 95} onChange={(e) => set({ quality: num(e.target.value) })} /></label>
              <label className="field"><span>DPI</span><input className="input" type="number" min={36} max={2400} value={(c.dpi as number) ?? 72} onChange={(e) => set({ dpi: num(e.target.value) })} /></label>
              <label className="field"><span>Color space</span>
                <select className="select" value={(c.colorSpace as string) ?? "srgb"} onChange={(e) => set({ colorSpace: e.target.value })}>
                  <option value="srgb">sRGB (web, social)</option><option value="p3">Display P3 (wide gamut)</option><option value="cmyk">CMYK (print: JPEG/TIFF)</option>
                </select>
              </label>
              <label className="field"><span>Bit depth</span>
                <select className="select" value={String((c.bitDepth as number) ?? 8)} onChange={(e) => set({ bitDepth: Number(e.target.value) })}>
                  <option value="8">8-bit</option><option value="16">16-bit (PNG/TIFF)</option>
                </select>
              </label>
              <label className="field"><span>Max file size (KB)</span><input className="input" type="number" min={10} placeholder="none" value={c.maxBytes ? Math.round((c.maxBytes as number) / 1000) : ""} onChange={(e) => set({ maxBytes: e.target.value ? Number(e.target.value) * 1000 : undefined })} /></label>
              <label className="field"><span>Enhance</span>
                <select className="select" value={(c.enhance as string) ?? "none"} onChange={(e) => set({ enhance: e.target.value })}>
                  <option value="none">None</option><option value="natural">Natural</option><option value="crisp">Crisp</option><option value="hyperreal">Hyperreal</option>
                </select>
              </label>
              <label className="row" style={{ fontSize: 13 }}><input type="checkbox" checked={Boolean(c.allowUpscale)} onChange={(e) => set({ allowUpscale: e.target.checked })} /> Allow upscaling</label>
              <label className="row" style={{ fontSize: 13 }}><input type="checkbox" checked={c.keepAlpha !== false} onChange={(e) => set({ keepAlpha: e.target.checked })} /> Keep transparency</label>
            </div>
          ) : (
            <div className="grid-2">
              <label className="field"><span>Frame rate</span><input className="input" type="number" min={1} max={120} placeholder="source" value={(c.fps as number) ?? ""} onChange={(e) => set({ fps: num(e.target.value) })} /></label>
              <label className="field"><span>Bitrate (kbit/s)</span><input className="input" type="number" min={100} placeholder="constant quality" value={(c.bitrateKbps as number) ?? ""} onChange={(e) => set({ bitrateKbps: num(e.target.value) })} /></label>
              <label className="field"><span>H.264 profile</span>
                <select className="select" value={(c.h264Profile as string) ?? "high"} onChange={(e) => set({ h264Profile: e.target.value })}>
                  <option value="high">High (best quality)</option><option value="main">Main</option><option value="baseline">Baseline (max compatibility)</option>
                </select>
              </label>
              <label className="field"><span>Max file size (MB)</span><input className="input" type="number" min={0.1} step={0.1} placeholder="none" value={c.maxBytes ? (c.maxBytes as number) / 1e6 : ""} onChange={(e) => set({ maxBytes: e.target.value ? Math.round(Number(e.target.value) * 1e6) : undefined })} /></label>
              <label className="field"><span>Start at (s)</span><input className="input" type="number" min={0} step={0.1} value={(c.trimStart as number) ?? ""} placeholder="0" onChange={(e) => set({ trimStart: num(e.target.value) })} /></label>
              <label className="field"><span>Duration (s)</span><input className="input" type="number" min={0.1} step={0.1} value={(c.trimDuration as number) ?? ""} placeholder="full" onChange={(e) => set({ trimDuration: num(e.target.value) })} /></label>
              <label className="row" style={{ fontSize: 13 }}><input type="checkbox" checked={c.audio !== false} onChange={(e) => set({ audio: e.target.checked })} /> Include audio</label>
              <label className="row" style={{ fontSize: 13 }}><input type="checkbox" checked={Boolean(c.allowUpscale)} onChange={(e) => set({ allowUpscale: e.target.checked })} /> Allow upscaling</label>
            </div>
          )}
          {!valid.success && <p className="notice notice-danger" style={{ margin: 0 }}>{valid.error.issues[0].path.join(".")}: {valid.error.issues[0].message}</p>}
        </div>
      </details>
    </div>
  )
}
