// Banuba WebAR player lifecycle for the makeup try-on.
// Docs: https://docs.banuba.com/far-sdk/tutorials/development/installation/web
import { Dom, Effect, ImageCapture, Module, Player, Webcam, isBrowserSupported } from "@banuba/webar"
import { strToU8, zipSync } from "fflate"

// Vite `?url` imports: the SDK binaries and modules are served as hashed static assets.
import data from "@banuba/webar/BanubaSDK.data?url"
import wasm from "@banuba/webar/BanubaSDK.wasm?url"
import simd from "@banuba/webar/BanubaSDK.simd.wasm?url"
import FaceTracker from "@banuba/webar/face_tracker.zip?url"
import Makeup from "@banuba/webar/makeup.zip?url"
import Lips from "@banuba/webar/lips.zip?url"
import Eyes from "@banuba/webar/eyes.zip?url"
import Skin from "@banuba/webar/skin.zip?url"

// Makeup prefabs resolve their segmentation dependencies at runtime, so we load the
// face tracker, the makeup prefabs module and the lips/eyes/skin segmentation models.
const MODULE_URLS = [FaceTracker, Makeup, Lips, Eyes, Skin]

export type ProgressFn = (label: string, fraction: number) => void

export class TryOnError extends Error {
  readonly kind: "unsupported" | "token" | "camera" | "sdk"
  constructor(kind: TryOnError["kind"], message: string) {
    super(message)
    this.kind = kind
  }
}

/** `Player#_effectManager` is private in the typings but is the documented Web API for runtime prefab changes. */
type EffectManager = { reloadConfig(config: string): void }

export class TryOn {
  private player: Player | null = null
  private webcam: Webcam | null = null
  private container: HTMLElement

  constructor(container: HTMLElement) {
    this.container = container
  }

  async start(clientToken: string, initialConfig: object, onProgress: ProgressFn) {
    if (!isBrowserSupported()) {
      throw new TryOnError("unsupported", "This browser doesn't support WebGL 2 / WebAssembly needed for AR try-on.")
    }
    if (!clientToken) {
      throw new TryOnError("token", "Missing Banuba client token. Set BANUBA_CLIENT_TOKEN in the repo-root .env and restart the dev server.")
    }

    onProgress("Starting camera", 0.02)
    // Start the webcam in parallel with SDK creation so the permission prompt appears right away.
    const webcamPromise = new Webcam().start().catch((e: unknown) => {
      throw new TryOnError("camera", `Camera unavailable: ${e instanceof Error ? e.message : String(e)}`)
    })

    onProgress("Loading AR engine", 0.05)
    let player: Player
    try {
      player = await Player.create({
        clientToken,
        locateFile: { "BanubaSDK.data": data, "BanubaSDK.wasm": wasm, "BanubaSDK.simd.wasm": simd },
      })
    } catch (e) {
      webcamPromise.then((w) => w.stop(), () => {})
      console.error("Player.create failed", e)
      // Engine-side failures surface as an opaque WebAssembly.Exception; by far the most common cause is
      // the license check (invalid/expired token, or the token isn't valid for this domain).
      const detail = e instanceof Error && !(e instanceof WebAssembly.Exception) ? ` (${e.message})` : ""
      throw new TryOnError(
        "sdk",
        `The AR engine refused to start${detail}. Check that BANUBA_CLIENT_TOKEN is correct, not expired, and valid for this domain.`,
      )
    }
    this.player = player

    const progress = new Array(MODULE_URLS.length).fill(0)
    const report = () => onProgress("Loading face models", 0.1 + 0.8 * (progress.reduce((a, b) => a + b, 0) / progress.length))
    const modules = await Promise.all(
      MODULE_URLS.map((url, i) =>
        Module.preload(url, {
          onProgress: ({ total, transferred }) => {
            progress[i] = total ? transferred / total : 0
            report()
          },
        }),
      ),
    )
    await player.addModule(...modules)

    onProgress("Applying makeup", 0.95)
    // reloadConfig needs a base effect; we build a tiny prefab effect (config.json in a zip) in memory.
    await player.applyEffect(new Effect(configToEffectBlob(initialConfig)))

    this.webcam = await webcamPromise
    player.use(this.webcam)
    Dom.render(player, this.container)
    onProgress("Ready", 1)
  }

  /** Swap the active prefab config without reloading the effect. */
  update(config: object) {
    const manager = (this.player as unknown as { _effectManager?: EffectManager } | null)?._effectManager
    manager?.reloadConfig(JSON.stringify(config))
  }

  async snapshot(): Promise<Blob | null> {
    if (!this.player) return null
    return new ImageCapture(this.player).takePhoto()
  }

  async destroy() {
    this.webcam?.stop()
    this.webcam = null
    if (this.player) {
      Dom.unmount(this.container)
      await this.player.destroy()
      this.player = null
    }
  }
}

function configToEffectBlob(config: object): Blob {
  const zip = zipSync({ "config.json": strToU8(JSON.stringify(config, null, 2)) })
  return new Blob([zip as BlobPart], { type: "application/zip" })
}
