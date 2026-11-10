// Banuba WebAR player lifecycle for Beauty OS looks.
// Docs: https://docs.banuba.com/far-sdk/tutorials/development/installation/web
import { toBanubaPrefab, type LookDocument } from "@beautyos/look-format"
import { strToU8, zipSync } from "fflate"
import type { Player as BanubaPlayer, Webcam as BanubaWebcam } from "@banuba/webar"

/** Makeup prefabs resolve segmentation dependencies at runtime, so load all five. */
export const BANUBA_MODULES = ["face_tracker", "makeup", "lips", "eyes", "skin"] as const

export type ProgressFn = (label: string, fraction: number) => void

export class TryOnError extends Error {
  readonly kind: "unsupported" | "token" | "camera" | "sdk"
  constructor(kind: TryOnError["kind"], message: string) {
    super(message)
    this.kind = kind
  }
}

/** What the player renders on: live camera, an uploaded photo, or an uploaded video. */
export type TryOnInput = { source: "camera" } | { source: "image"; file: Blob } | { source: "video"; file: Blob }

export interface SnapshotOptions {
  type?: "image/png" | "image/jpeg" | "image/webp"
  /** Output size; defaults to the input frame size (full resolution of the camera/photo). */
  width?: number
  height?: number
  /** 0..1 for JPEG/WebP */
  quality?: number
}

export interface TryOnOptions {
  clientToken: string
  /** URL folder holding BanubaSDK.{data,wasm,simd.wasm} and modules/*.zip (see copy-banuba-assets). */
  assetsBaseUrl: string
}

/** `Player#_effectManager` is private in the typings but is Banuba's documented Web API for runtime prefab changes. */
type EffectManager = { reloadConfig(config: string): void }

export class TryOn {
  private player: BanubaPlayer | null = null
  private webcam: BanubaWebcam | null = null
  private input: TryOnInput = { source: "camera" }
  private recorder: { stop(): Promise<Blob>; start(): void } | null = null
  private sdk: typeof import("@banuba/webar") | null = null
  private look: LookDocument | null = null
  private intensity = 1
  private comparing = false
  private readonly container: HTMLElement

  constructor(container: HTMLElement) {
    this.container = container
  }

  get running() {
    return this.player !== null
  }

  async start({ clientToken, assetsBaseUrl }: TryOnOptions, onProgress: ProgressFn = () => {}, input: TryOnInput = { source: "camera" }) {
    this.input = input
    if (!clientToken) {
      throw new TryOnError("token", "Missing Banuba client token (BANUBA_CLIENT_TOKEN).")
    }
    // Load the SDK lazily so server-rendered pages never evaluate it.
    const sdk = (this.sdk ??= await import("@banuba/webar"))
    if (!sdk.isBrowserSupported()) {
      throw new TryOnError("unsupported", "This browser doesn't support WebGL 2 / WebAssembly needed for AR try-on.")
    }
    const base = assetsBaseUrl.replace(/\/$/, "")

    onProgress(input.source === "camera" ? "Starting camera" : "Reading file", 0.02)
    const webcamPromise: Promise<BanubaWebcam | null> =
      input.source === "camera"
        ? new sdk.Webcam().start().catch((e: unknown) => {
            throw new TryOnError("camera", `Camera unavailable: ${e instanceof Error ? e.message : String(e)}`)
          })
        : Promise.resolve(null)

    onProgress("Loading AR engine", 0.05)
    let player: BanubaPlayer
    try {
      player = await sdk.Player.create({
        clientToken,
        locateFile: {
          "BanubaSDK.data": `${base}/BanubaSDK.data`,
          "BanubaSDK.wasm": `${base}/BanubaSDK.wasm`,
          "BanubaSDK.simd.wasm": `${base}/BanubaSDK.simd.wasm`,
        },
      })
    } catch (e) {
      webcamPromise.then((w) => w?.stop(), () => {})
      console.error("Player.create failed", e)
      // Engine-side failures surface as an opaque WebAssembly.Exception; the usual cause is the license check.
      const detail = e instanceof Error ? ` (${e.message})` : ""
      throw new TryOnError("sdk", `The AR engine refused to start${detail}. Check that the Banuba client token is correct, not expired, and valid for this domain.`)
    }
    this.player = player

    const progress = BANUBA_MODULES.map(() => 0)
    const modules = await Promise.all(
      BANUBA_MODULES.map((name, i) =>
        sdk.Module.preload(`${base}/modules/${name}.zip`, {
          onProgress: ({ total, transferred }) => {
            progress[i] = total ? transferred / total : 0
            onProgress("Loading face models", 0.1 + (0.8 * progress.reduce((a, b) => a + b, 0)) / progress.length)
          },
        }),
      ),
    )
    await player.addModule(...modules)

    onProgress("Applying look", 0.95)
    // reloadConfig needs a base effect, so apply an in-memory prefab effect (config + asset files) first.
    await this.applyFullEffect()

    this.webcam = await webcamPromise
    this.attachInput(input)
    sdk.Dom.render(player, this.container)
    onProgress("Ready", 1)
  }

  private attachInput(input: TryOnInput) {
    if (!this.player || !this.sdk) return
    if (input.source === "camera") {
      this.webcam ??= new this.sdk.Webcam()
      this.player.use(this.webcam)
      this.player.play()
    } else if (input.source === "image") {
      this.player.use(new this.sdk.Image(input.file))
      // Keep rendering after the single frame so live look edits show on the photo.
      this.player.play({ pauseOnEmpty: false })
    } else {
      this.player.use(new this.sdk.Video(input.file, { loop: true }))
      this.player.play()
    }
  }

  /** Switch between camera, photo and video without reloading the engine. */
  async setInput(input: TryOnInput) {
    if (input.source !== "camera") {
      this.webcam?.stop()
      this.webcam = null
    }
    this.input = input
    this.attachInput(input)
  }

  get inputSource() {
    return this.input.source
  }

  /** Show a look (null = bare face). Safe to call before start(); the look applies once running. */
  setLook(look: LookDocument | null) {
    this.look = look
    this.push()
  }

  setIntensity(intensity: number) {
    this.intensity = intensity
    this.push()
  }

  /** While true, render without makeup (before/after compare). */
  setComparing(on: boolean) {
    this.comparing = on
    this.push()
  }

  /** Captures the current frame. Defaults to a full-resolution PNG. */
  async snapshot(opts: SnapshotOptions = {}): Promise<Blob | null> {
    if (!this.player || !this.sdk) return null
    return new this.sdk.ImageCapture(this.player).takePhoto({ type: opts.type ?? "image/png", ...(opts.width ? { width: opts.width } : {}), ...(opts.height ? { height: opts.height } : {}), ...(opts.quality ? { quality: opts.quality } : {}) })
  }

  /** Best recording format this browser supports (MP4 where available, else WebM). */
  static recordingType(): string {
    const types = ["video/mp4;codecs=avc1", "video/mp4", "video/webm;codecs=vp9", "video/webm"]
    return types.find((t) => typeof MediaRecorder !== "undefined" && MediaRecorder.isTypeSupported(t)) ?? "video/webm"
  }

  startRecording(mimeType = TryOn.recordingType()) {
    if (!this.player || !this.sdk || this.recorder) return
    const rec = new this.sdk.VideoRecorder(this.player, { mimeType, videoBitsPerSecond: 8_000_000 })
    rec.start()
    this.recorder = rec
  }

  async stopRecording(): Promise<Blob | null> {
    const rec = this.recorder
    this.recorder = null
    return rec ? rec.stop() : null
  }

  get recording() {
    return this.recorder !== null
  }

  async destroy() {
    await this.stopRecording().catch(() => null)
    this.webcam?.stop()
    this.webcam = null
    if (this.player && this.sdk) {
      this.sdk.Dom.unmount(this.container)
      await this.player.destroy()
    }
    this.player = null
  }

  private current() {
    return toBanubaPrefab(this.comparing ? null : this.look, { intensity: this.intensity })
  }

  /** Asset files currently packaged in the applied effect, keyed by bundle path. */
  private appliedFiles = ""
  private readonly fileCache = new Map<string, Promise<Uint8Array>>()
  private onAssetError: ((message: string) => void) | null = null

  /** Called when an overlay asset can't be downloaded (the rest of the look still renders). */
  onAssetFailure(cb: (message: string) => void) {
    this.onAssetError = cb
  }

  private fetchFile(url: string) {
    let p = this.fileCache.get(url)
    if (!p) {
      p = fetch(url).then(async (r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`)
        return new Uint8Array(await r.arrayBuffer())
      })
      p.catch(() => this.fileCache.delete(url))
      this.fileCache.set(url, p)
    }
    return p
  }

  private async applyFullEffect() {
    if (!this.player || !this.sdk) return
    const { config, files } = this.current()
    const entries: Record<string, Uint8Array> = {}
    const loaded = new Set<string>()
    await Promise.all(
      files.map(async (f) => {
        try {
          entries[f.path] = await this.fetchFile(f.url)
          loaded.add(f.path)
        } catch (e) {
          this.onAssetError?.(`Couldn't load ${f.url}: ${e instanceof Error ? e.message : String(e)}`)
        }
      }),
    )
    entries["config.json"] = strToU8(JSON.stringify(dropMissing(config, loaded), null, 2))
    const zip = zipSync(entries)
    await this.player.applyEffect(new this.sdk.Effect(new Blob([zip as BlobPart], { type: "application/zip" })))
    this.appliedFiles = signature(files)
  }

  private frame = 0
  private applying: Promise<void> | null = null
  private push() {
    if (!this.player || this.frame) return
    // Coalesce rapid edits (slider drags) into one update per animation frame.
    this.frame = requestAnimationFrame(() => {
      this.frame = 0
      const { config, files } = this.current()
      if (signature(files) !== this.appliedFiles) {
        // New or removed textures must be inside the effect bundle, so rebuild it.
        this.applying = (this.applying ?? Promise.resolve()).then(() => this.applyFullEffect()).finally(() => (this.applying = null))
        return
      }
      const manager = (this.player as unknown as { _effectManager?: EffectManager } | null)?._effectManager
      manager?.reloadConfig(JSON.stringify(config))
    })
  }
}

const signature = (files: { path: string; url: string }[]) =>
  files
    .map((f) => `${f.path}=${f.url}`)
    .sort()
    .join("|")

/** Remove prefab entries whose asset failed to download, so the rest of the look still applies. */
function dropMissing(config: Record<string, unknown>, loaded: Set<string>) {
  const ok = (v: unknown) => typeof v !== "string" || !v.startsWith("assets/") || loaded.has(v)
  const out: Record<string, unknown> = { ...config }
  for (const key of ["background", "foreground", "lut"]) {
    const entry = out[key] as Record<string, unknown> | undefined
    if (entry && !Object.values(entry).every(ok)) delete out[key]
  }
  const faces = (out.faces as Record<string, Record<string, unknown>>[]).map((f) => {
    const face = { ...f }
    for (const key of ["video_texture", "softlight"]) {
      const entry = face[key]
      if (entry && !Object.values(entry).every(ok)) delete face[key]
    }
    return face
  })
  return { ...out, faces }
}
