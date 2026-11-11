// Entelus AR SDK: real-time face tracking and makeup rendering for Beauty OS look documents.
// Face tracking and segmentation run on open MediaPipe models (Apache-2.0) via WebAssembly; makeup,
// smoothing and effects are rendered by the Entelus WebGL2 renderer. No vendor SDK or license key.
import type { LookDocument } from "@beautyos/look-format"
import type { FaceLandmarker, ImageSegmenter } from "@mediapipe/tasks-vision"
import { Face } from "./geometry"
import { Renderer, type MediaSource } from "./renderer"

export { Face, LM, regionMask, skinShape, faceAnchor } from "./geometry"
export type { Point, Shape, RegionMask } from "./geometry"

export type ProgressFn = (label: string, fraction: number) => void

export class ARError extends Error {
  readonly kind: "unsupported" | "camera" | "engine" | "input"
  constructor(kind: ARError["kind"], message: string) {
    super(message)
    this.kind = kind
  }
}

/** What the engine renders on: live camera, an uploaded photo, or an uploaded video. */
export type ARInput = { source: "camera" } | { source: "image"; file: Blob } | { source: "video"; file: Blob }

export interface SnapshotOptions {
  type?: "image/png" | "image/jpeg" | "image/webp"
  /** Output size; defaults to the full input resolution. */
  width?: number
  height?: number
  /** 0..1 for JPEG/WebP */
  quality?: number
}

export interface StartOptions {
  /** URL folder with wasm/ and models/ (installed by `entelus-ar-assets`). */
  assetsBaseUrl: string
  /** Prefer GPU inference for tracking (falls back to CPU automatically). */
  gpu?: boolean
}

const MAX_SIDE = 1920

export class EntelusAR {
  private readonly container: HTMLElement
  private canvas: HTMLCanvasElement | null = null
  private renderer: Renderer | null = null
  private landmarker: FaceLandmarker | null = null
  private segmenter: ImageSegmenter | null = null
  private segmenterLoading: Promise<void> | null = null
  private vision: typeof import("@mediapipe/tasks-vision") | null = null
  private fileset: unknown = null
  private base = ""
  private input: ARInput = { source: "camera" }
  private stream: MediaStream | null = null
  private video: HTMLVideoElement | null = null
  /** Still photos are drawn into a canvas: WebGL ignores UNPACK_FLIP_Y for ImageBitmap sources. */
  private image: HTMLCanvasElement | null = null
  private objectUrl: string | null = null
  private look: LookDocument | null = null
  private intensity = 1
  private comparing = false
  private raf = 0
  private lastTs = 0
  private smoothed: { x: number; y: number }[] | null = null
  private stillLandmarks: { x: number; y: number }[] | null | undefined = undefined
  private personMask: { data: Float32Array; width: number; height: number } | null = null
  private readonly media = new Map<string, MediaSource | "loading" | "failed">()
  private recorder: MediaRecorder | null = null
  private chunks: Blob[] = []
  private assetError: ((message: string) => void) | null = null
  private t0 = performance.now()
  private faceFound = false

  constructor(container: HTMLElement) {
    this.container = container
  }

  get running() {
    return this.renderer !== null
  }

  get inputSource() {
    return this.input.source
  }

  /** Whether a face is currently tracked. */
  get faceDetected() {
    return this.faceFound
  }

  onAssetFailure(cb: (message: string) => void) {
    this.assetError = cb
  }

  static supported() {
    return typeof window !== "undefined" && typeof WebAssembly === "object" && Renderer.supported()
  }

  async start({ assetsBaseUrl, gpu = true }: StartOptions, onProgress: ProgressFn = () => {}, input: ARInput = { source: "camera" }) {
    if (!EntelusAR.supported()) throw new ARError("unsupported", "This browser doesn't support WebGL 2 and WebAssembly, which live try-on needs.")
    this.base = assetsBaseUrl.replace(/\/$/, "")
    onProgress(input.source === "camera" ? "Starting camera" : "Reading file", 0.05)
    const inputReady = this.openInput(input)

    onProgress("Loading AR engine", 0.2)
    try {
      this.vision ??= await import("@mediapipe/tasks-vision")
      this.fileset ??= await this.vision.FilesetResolver.forVisionTasks(`${this.base}/wasm`)
      onProgress("Loading face model", 0.5)
      this.landmarker = await this.createLandmarker(gpu)
    } catch (e) {
      await inputReady.catch(() => {})
      this.closeInput()
      throw new ARError("engine", `The AR engine couldn't load (${e instanceof Error ? e.message : String(e)}). Check that the engine files are installed at ${this.base}.`)
    }
    await inputReady
    onProgress("Preparing renderer", 0.9)
    this.canvas = document.createElement("canvas")
    this.canvas.style.cssText = "width:100%;height:100%;object-fit:cover;display:block"
    this.container.replaceChildren(this.canvas)
    try {
      this.renderer = new Renderer(this.canvas)
    } catch (e) {
      throw new ARError("unsupported", e instanceof Error ? e.message : String(e))
    }
    this.prepareMedia()
    this.loop()
    onProgress("Ready", 1)
  }

  private async createLandmarker(gpu: boolean) {
    const opts = (delegate: "GPU" | "CPU") => ({
      baseOptions: { modelAssetPath: `${this.base}/models/face_landmarker.task`, delegate },
      runningMode: "VIDEO" as const,
      numFaces: 1,
      minFaceDetectionConfidence: 0.5,
      minTrackingConfidence: 0.5,
    })
    const { FaceLandmarker } = this.vision!
    if (gpu) {
      try {
        return await FaceLandmarker.createFromOptions(this.fileset as never, opts("GPU"))
      } catch {
        // fall through to CPU (e.g. no GPU in headless or locked-down browsers)
      }
    }
    return FaceLandmarker.createFromOptions(this.fileset as never, opts("CPU"))
  }

  private ensureSegmenter() {
    if (this.segmenter || this.segmenterLoading || !this.vision) return
    this.segmenterLoading = this.vision.ImageSegmenter.createFromOptions(this.fileset as never, {
      baseOptions: { modelAssetPath: `${this.base}/models/selfie_multiclass_256x256.tflite`, delegate: "CPU" },
      runningMode: "VIDEO",
      outputConfidenceMasks: true,
      outputCategoryMask: false,
    })
      .then((s) => {
        this.segmenter = s
      })
      .catch((e) => this.assetError?.(`Background replacement unavailable: ${e instanceof Error ? e.message : String(e)}`))
  }

  // ---------- input ----------

  private async openInput(input: ARInput) {
    this.closeInput()
    this.input = input
    this.smoothed = null
    this.stillLandmarks = undefined
    if (input.source === "camera") {
      try {
        this.stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "user", width: { ideal: 1280 }, height: { ideal: 720 } }, audio: false })
      } catch (e) {
        throw new ARError("camera", `Camera unavailable: ${e instanceof Error ? e.message : String(e)}`)
      }
      this.video = Object.assign(document.createElement("video"), { muted: true, playsInline: true, srcObject: this.stream })
      await this.video.play()
    } else if (input.source === "image") {
      let bmp: ImageBitmap
      try {
        bmp = await createImageBitmap(input.file, { imageOrientation: "from-image" })
      } catch {
        throw new ARError("input", "That image couldn't be read.")
      }
      const c = document.createElement("canvas")
      c.width = bmp.width
      c.height = bmp.height
      c.getContext("2d")!.drawImage(bmp, 0, 0)
      bmp.close()
      this.image = c
    } else {
      this.objectUrl = URL.createObjectURL(input.file)
      this.video = Object.assign(document.createElement("video"), { muted: true, playsInline: true, loop: true, src: this.objectUrl })
      try {
        await this.video.play()
      } catch {
        throw new ARError("input", "That video couldn't be played. Try MP4 (H.264) or WebM.")
      }
    }
  }

  private closeInput() {
    this.stream?.getTracks().forEach((t) => t.stop())
    this.stream = null
    if (this.video) {
      this.video.pause()
      this.video.srcObject = null
      this.video.removeAttribute("src")
    }
    this.video = null
    this.image = null
    if (this.objectUrl) URL.revokeObjectURL(this.objectUrl)
    this.objectUrl = null
  }

  /** Switch between camera, photo and video without reloading the engine. */
  async setInput(input: ARInput) {
    await this.openInput(input)
  }

  // ---------- look ----------

  setLook(look: LookDocument | null) {
    this.look = look
    this.prepareMedia()
  }

  setIntensity(intensity: number) {
    this.intensity = Math.max(0, Math.min(1, intensity))
  }

  /** While true, render without makeup (before/after compare). */
  setComparing(on: boolean) {
    this.comparing = on
  }

  private prepareMedia() {
    if (!this.look) return
    if (this.look.overlays.some((o) => o.kind === "background")) this.ensureSegmenter()
    for (const o of this.look.overlays) {
      const ref = "asset" in o ? o.asset : undefined
      if (!ref || this.media.has(ref.url)) continue
      this.media.set(ref.url, "loading")
      if (ref.mediaType.startsWith("video/")) {
        const v = Object.assign(document.createElement("video"), { muted: true, playsInline: true, loop: true, crossOrigin: "anonymous", src: ref.url })
        v.addEventListener("loadeddata", () => this.media.set(ref.url, v), { once: true })
        v.addEventListener("error", () => this.mediaFailed(ref.url), { once: true })
        void v.play().catch(() => {})
      } else {
        const img = new Image()
        img.crossOrigin = "anonymous"
        img.onload = () => this.media.set(ref.url, img)
        img.onerror = () => this.mediaFailed(ref.url)
        img.src = ref.url
      }
    }
  }

  private mediaFailed(url: string) {
    this.media.set(url, "failed")
    this.assetError?.(`Couldn't load ${url}; the rest of the look still renders.`)
  }

  // ---------- frame loop ----------

  private frameSource(): { src: TexImageSource; w: number; h: number; live: boolean } | null {
    if (this.image) return { src: this.image, w: this.image.width, h: this.image.height, live: false }
    const v = this.video
    if (!v || v.readyState < 2 || !v.videoWidth) return null
    return { src: v, w: v.videoWidth, h: v.videoHeight, live: true }
  }

  private loop = () => {
    this.raf = requestAnimationFrame(this.loop)
    this.renderFrame()
  }

  private renderFrame() {
    const r = this.renderer
    const fs = this.frameSource()
    if (!r || !fs || !this.landmarker) return
    const scale = Math.min(1, MAX_SIDE / Math.max(fs.w, fs.h))
    const w = Math.round(fs.w * scale), h = Math.round(fs.h * scale)
    const ts = Math.max(this.lastTs + 1, performance.now())
    this.lastTs = ts

    let landmarks: { x: number; y: number }[] | null = null
    if (!fs.live && this.stillLandmarks !== undefined) landmarks = this.stillLandmarks
    else {
      try {
        const res = this.landmarker.detectForVideo(fs.src as never, ts)
        landmarks = res.faceLandmarks[0] ?? null
      } catch {
        landmarks = null
      }
      if (!fs.live) this.stillLandmarks = landmarks
    }
    // Temporal smoothing (live input only) removes jitter without visible lag.
    if (landmarks && fs.live && this.smoothed?.length === landmarks.length) {
      const a = 0.55
      landmarks = landmarks.map((p, i) => ({ x: this.smoothed![i].x + (p.x - this.smoothed![i].x) * a, y: this.smoothed![i].y + (p.y - this.smoothed![i].y) * a }))
    }
    this.smoothed = landmarks
    this.faceFound = Boolean(landmarks)

    if (this.segmenter && this.look?.overlays.some((o) => o.kind === "background")) {
      try {
        const res = this.segmenter.segmentForVideo(fs.src as never, ts)
        const bg = res.confidenceMasks?.[0]
        if (bg) {
          const data = bg.getAsFloat32Array()
          const person = new Float32Array(data.length)
          for (let i = 0; i < data.length; i++) person[i] = 1 - data[i]
          this.personMask = { data: person, width: bg.width, height: bg.height }
        }
        res.close()
      } catch {
        this.personMask = null
      }
    }

    r.render({
      source: fs.src,
      width: w,
      height: h,
      face: landmarks ? new Face(landmarks, w, h) : null,
      look: this.comparing ? null : this.look,
      intensity: this.intensity,
      mirror: this.input.source === "camera",
      time: (performance.now() - this.t0) / 1000,
      personMask: this.personMask,
      media: (url) => {
        const m = this.media.get(url)
        return m && m !== "loading" && m !== "failed" ? m : null
      },
    })
  }

  // ---------- capture ----------

  /** Captures the current frame at full resolution (PNG by default). */
  async snapshot(opts: SnapshotOptions = {}): Promise<Blob | null> {
    const c = this.canvas
    if (!c || !this.renderer) return null
    this.renderFrame()
    let out: HTMLCanvasElement = c
    if ((opts.width && opts.width !== c.width) || (opts.height && opts.height !== c.height)) {
      out = document.createElement("canvas")
      out.width = opts.width ?? Math.round((c.width * (opts.height ?? c.height)) / c.height)
      out.height = opts.height ?? Math.round((c.height * out.width) / c.width)
      out.getContext("2d")!.drawImage(c, 0, 0, out.width, out.height)
    }
    return new Promise((resolve) => out.toBlob(resolve, opts.type ?? "image/png", opts.quality))
  }

  /** Best recording format this browser supports (MP4 where available, else WebM). */
  static recordingType(): string {
    const types = ["video/mp4;codecs=avc1", "video/mp4", "video/webm;codecs=vp9", "video/webm"]
    return types.find((t) => typeof MediaRecorder !== "undefined" && MediaRecorder.isTypeSupported(t)) ?? "video/webm"
  }

  startRecording(mimeType = EntelusAR.recordingType()) {
    if (!this.canvas || this.recorder) return
    this.chunks = []
    const rec = new MediaRecorder(this.canvas.captureStream(30), { mimeType, videoBitsPerSecond: 8_000_000 })
    rec.ondataavailable = (e) => e.data.size && this.chunks.push(e.data)
    rec.start(250)
    this.recorder = rec
  }

  async stopRecording(): Promise<Blob | null> {
    const rec = this.recorder
    this.recorder = null
    if (!rec) return null
    await new Promise<void>((resolve) => {
      rec.onstop = () => resolve()
      rec.stop()
    })
    return new Blob(this.chunks, { type: rec.mimeType })
  }

  get recording() {
    return this.recorder !== null
  }

  async destroy() {
    cancelAnimationFrame(this.raf)
    await this.stopRecording().catch(() => null)
    this.closeInput()
    this.landmarker?.close()
    this.segmenter?.close()
    this.landmarker = null
    this.segmenter = null
    this.renderer?.destroy()
    this.renderer = null
    this.canvas?.remove()
    this.canvas = null
    for (const m of this.media.values()) if (m instanceof HTMLVideoElement) m.pause()
    this.media.clear()
  }
}
