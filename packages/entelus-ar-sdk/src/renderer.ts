// Entelus WebGL2 makeup renderer.
// Convention: every texture is stored bottom-up (source uploads use UNPACK_FLIP_Y), so full-screen passes
// sample with uv = clip * 0.5 + 0.5. Geometry arrives in image pixels (top-down) and is mapped to clip
// space with y flipped. Masks are drawn with a stencil even-odd fill, so concave shapes and holes are exact.
import type { Finish, LookDocument, Overlay, Region } from "@beautyos/look-format"
import { REGION_SPECS } from "@beautyos/look-format"
import { faceAnchor, regionMask, skinShape, type Face, type Shape } from "./geometry"

export type MediaSource = HTMLImageElement | HTMLVideoElement | ImageBitmap | HTMLCanvasElement

export interface FrameInput {
  source: TexImageSource
  width: number
  height: number
  face: Face | null
  look: LookDocument | null
  intensity: number
  mirror: boolean
  /** seconds, drives shimmer/glitter animation */
  time: number
  /** Person probability (row 0 = top), when background replacement is active. */
  personMask?: { data: Float32Array; width: number; height: number } | null
  media: (url: string) => MediaSource | null
}

const VS = `#version 300 es
in vec2 aPos;
uniform vec2 uSize;   // target size in px (for pixel-space geometry); (0,0) = clip space passthrough
uniform mat3 uXform;  // extra 2D transform in pixel space
out vec2 vUv;
out vec2 vLocal;
void main() {
  vec2 p = aPos;
  vLocal = aPos;
  if (uSize.x > 0.0) {
    vec3 q = uXform * vec3(aPos, 1.0);
    p = vec2(q.x / uSize.x * 2.0 - 1.0, 1.0 - q.y / uSize.y * 2.0);
  }
  vUv = p * 0.5 + 0.5;
  gl_Position = vec4(p, 0.0, 1.0);
}`

const FS_SOLID = `#version 300 es
precision highp float;
uniform float uValue;
out vec4 o;
void main() { o = vec4(uValue); }`

const FS_ELLIPSE = `#version 300 es
precision highp float;
in vec2 vLocal;            // local coords in [-1,1] across the ellipse box
out vec4 o;
void main() {
  float d = dot(vLocal, vLocal);
  o = vec4(exp(-d * 2.6) * (1.0 - smoothstep(0.85, 1.0, d)));
}`

const FS_BLUR = `#version 300 es
precision highp float;
in vec2 vUv;
uniform sampler2D uTex;
uniform vec2 uDir;         // texel step * sigma direction
out vec4 o;
void main() {
  // 9-tap Gaussian (sigma ~ 2 steps)
  vec4 s = texture(uTex, vUv) * 0.2270;
  s += (texture(uTex, vUv + uDir * 1.3846) + texture(uTex, vUv - uDir * 1.3846)) * 0.3162;
  s += (texture(uTex, vUv + uDir * 3.2308) + texture(uTex, vUv - uDir * 3.2308)) * 0.0703;
  o = s;
}`

const FS_COPY = `#version 300 es
precision highp float;
in vec2 vUv;
uniform sampler2D uTex;
uniform bool uMirror;
out vec4 o;
void main() { o = texture(uTex, uMirror ? vec2(1.0 - vUv.x, vUv.y) : vUv); }`

const FS_SMOOTH = `#version 300 es
precision highp float;
in vec2 vUv;
uniform sampler2D uBase, uBlur, uMask;
uniform float uAmount;
out vec4 o;
void main() {
  vec3 b = texture(uBase, vUv).rgb;
  vec3 s = texture(uBlur, vUv).rgb;
  float m = texture(uMask, vUv).r;
  // Edge-preserving: smooth only where the pixel is close to its neighbourhood (skin texture, not features).
  float edge = 1.0 - smoothstep(0.05, 0.18, length(b - s));
  vec3 smoothed = mix(b, s * 0.82 + b * 0.18, edge);
  o = vec4(mix(b, smoothed, clamp(m * uAmount, 0.0, 1.0)), 1.0);
}`

// Region models: 0 paint (lips, liner, eyeshadow, brows), 1 dark (lashes, eyeliner), 2 blush,
// 3 highlighter, 4 contour, 5 complexion (foundation, concealer).
const FS_MAKEUP = `#version 300 es
precision highp float;
in vec2 vUv;
uniform sampler2D uBase, uBlur, uMask;
uniform vec3 uColor;
uniform float uAmount, uTime;
uniform int uModel, uFinish;
uniform vec2 uRes;
out vec4 o;
float luma(vec3 c) { return dot(c, vec3(0.299, 0.587, 0.114)); }
float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
// Finishes: 0 matte 1 satin 2 cream 3 gloss 4 balm 5 sheer 6 shimmer 7 metallic 8 glitter 9 natural 10 radiant 11 volume 12 lengthening 13 dramatic
void main() {
  vec3 base = texture(uBase, vUv).rgb;
  vec3 blur = texture(uBlur, vUv).rgb;
  float m = texture(uMask, vUv).r;
  float L = luma(base), Lb = luma(blur), detail = L - Lb;
  float amount = uAmount;
  vec3 col;
  if (uModel == 5) {
    // Complexion: even the tone toward the shade while keeping skin texture.
    col = base + (uColor - blur) * 0.75;
    if (uFinish == 10) col += 0.06 * smoothstep(0.4, 0.9, L);
    if (uFinish == 9) col = mix(col, base, 0.15);
  } else if (uModel == 2) {
    col = mix(base, base * uColor * 1.75, 0.65);
  } else if (uModel == 3) {
    col = 1.0 - (1.0 - base) * (1.0 - uColor * 0.55);
    col += vec3(0.08) * smoothstep(0.5, 0.95, L);
  } else if (uModel == 4) {
    col = base * mix(vec3(1.0), uColor / max(luma(uColor), 0.25) * 0.78, 0.9);
  } else {
    float lift = uModel == 1 ? 0.25 : 0.55;
    col = uColor * (lift + 0.95 * Lb) + detail * (uModel == 1 ? 0.25 : 0.7);
  }
  // Finish shading
  float spec = 0.0;
  if (uFinish == 1 || uFinish == 2) spec = smoothstep(0.55, 0.95, L) * (uFinish == 1 ? 0.14 : 0.1);
  if (uFinish == 3 || uFinish == 4) spec = pow(smoothstep(0.45, 1.0, L), 2.0) * 0.55;
  if (uFinish == 4 || uFinish == 5) amount *= 0.55;
  if (uFinish == 7) { spec = smoothstep(0.35, 0.95, L) * 0.4; col += uColor * L * 0.25; }
  if (uFinish == 6 || uFinish == 7 || uFinish == 8) {
    vec2 cell = floor(vUv * uRes / (uFinish == 8 ? 3.0 : 2.0));
    float tw = floor(uTime * 6.0);
    float sparkle = step(uFinish == 8 ? 0.965 : 0.985, hash(cell + tw));
    col += sparkle * (0.35 + 0.65 * L) * (uFinish == 8 ? 0.9 : 0.55);
    col += (hash(cell * 1.7) - 0.5) * 0.06 * L;
  }
  if (uFinish == 11) amount *= 1.0;
  if (uFinish == 12) amount *= 0.9;
  if (uFinish == 13) amount *= 1.15;
  col += vec3(spec) * mix(vec3(1.0), uColor, uFinish == 7 ? 0.6 : 0.15);
  o = vec4(mix(base, clamp(col, 0.0, 1.0), clamp(m * amount, 0.0, 1.0)), 1.0);
}`

const FS_LUT = `#version 300 es
precision highp float;
in vec2 vUv;
uniform sampler2D uBase, uLut;
uniform float uStrength;
out vec4 o;
// 512x512 LUT, 64 levels arranged 8x8 (stored bottom-up like every texture here).
vec3 lut(vec3 c) {
  float b = c.b * 63.0;
  vec2 q1, q2;
  q1.y = floor(floor(b) / 8.0); q1.x = floor(b) - q1.y * 8.0;
  q2.y = floor(ceil(b) / 8.0);  q2.x = ceil(b) - q2.y * 8.0;
  vec2 t1 = (q1 * 64.0 + 0.5 + c.rg * 63.0) / 512.0;
  vec2 t2 = (q2 * 64.0 + 0.5 + c.rg * 63.0) / 512.0;
  t1.y = 1.0 - t1.y; t2.y = 1.0 - t2.y;
  return mix(texture(uLut, t1).rgb, texture(uLut, t2).rgb, fract(b));
}
void main() {
  vec3 c = texture(uBase, vUv).rgb;
  o = vec4(mix(c, lut(c), uStrength), 1.0);
}`

const FS_LAYER = `#version 300 es
precision highp float;
in vec2 vUv;
uniform sampler2D uBase, uTex, uPerson;
uniform int uBlend, uMode; // uMode: 0 overlay, 1 background (behind person), 2 face media (split alpha optional)
uniform bool uSplitAlpha, uHasPerson;
uniform vec4 uRect;        // texture rect in uv of target: x0,y0,x1,y1
uniform mat3 uLocal;       // target uv -> texture uv (for rotated face media)
out vec4 o;
vec3 blend(vec3 b, vec3 s, int mode) {
  if (mode == 1) return 1.0 - (1.0 - b) * (1.0 - s);  // screen
  if (mode == 2) return b * s;                         // multiply
  if (mode == 3) return min(b + s, 1.0);               // add
  if (mode == 4) return min(b, s);
  if (mode == 5) return max(b, s);
  return s;
}
void main() {
  vec3 base = texture(uBase, vUv).rgb;
  vec2 t = (uLocal * vec3(vUv, 1.0)).xy;
  if (t.x < 0.0 || t.x > 1.0 || t.y < 0.0 || t.y > 1.0) { o = vec4(base, 1.0); return; }
  vec4 s;
  if (uSplitAlpha) {
    vec3 rgb = texture(uTex, vec2(t.x * 0.5, t.y)).rgb;
    float a = texture(uTex, vec2(0.5 + t.x * 0.5, t.y)).r;
    s = vec4(rgb, a);
  } else s = texture(uTex, t);
  float a = s.a;
  if (uMode == 1) {
    float person = uHasPerson ? texture(uPerson, vec2(vUv.x, 1.0 - vUv.y)).r : 0.0;
    a *= 1.0 - smoothstep(0.35, 0.65, person);
  }
  o = vec4(mix(base, blend(base, s.rgb, uBlend), a), 1.0);
}`

const FS_SOFTLIGHT = `#version 300 es
precision highp float;
in vec2 vUv;
uniform sampler2D uBase, uMask;
uniform float uStrength;
out vec4 o;
void main() {
  vec3 b = texture(uBase, vUv).rgb;
  float m = texture(uMask, vUv).r * uStrength;
  vec3 s = vec3(0.72);
  vec3 soft = mix(2.0 * b * s + b * b * (1.0 - 2.0 * s), sqrt(b) * (2.0 * s - 1.0) + 2.0 * b * (1.0 - s), step(0.5, s));
  o = vec4(mix(b, soft, m), 1.0);
}`

const FINISH_ID: Record<Finish, number> = { matte: 0, satin: 1, cream: 2, gloss: 3, balm: 4, sheer: 5, shimmer: 6, metallic: 7, glitter: 8, natural: 9, radiant: 10, volume: 11, lengthening: 12, dramatic: 13 }
const MODEL_ID: Record<Region, number> = { lips: 0, lip_liner: 0, eyeshadow: 0, brows: 0, eyeliner: 1, lashes: 1, blush: 2, highlighter: 3, contour: 4, foundation: 5, concealer: 5 }
const BLEND_ID: Record<string, number> = { default: 0, alpha: 0, premul_alpha: 0, split_alpha: 0, screen: 1, multiply: 2, add: 3, min: 4, max: 5 }

const hexToRgb = (hex: string): [number, number, number] => {
  const n = parseInt(hex.slice(1), 16)
  return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255]
}

interface Target { tex: WebGLTexture; fb: WebGLFramebuffer; w: number; h: number; stencil?: WebGLRenderbuffer }

export class Renderer {
  readonly canvas: HTMLCanvasElement
  private gl: WebGL2RenderingContext
  private progs = new Map<string, { p: WebGLProgram; u: Map<string, WebGLUniformLocation | null> }>()
  private quad: WebGLBuffer
  private dyn: WebGLBuffer
  private vao: WebGLVertexArrayObject
  private frameTex: WebGLTexture
  private personTex: WebGLTexture
  private mediaTex = new Map<MediaSource, WebGLTexture>()
  private acc: Target[] = []
  private blurA!: Target
  private blurB!: Target
  private maskA!: Target
  private maskB!: Target
  private w = 0
  private h = 0

  static supported(): boolean {
    try {
      return Boolean(document.createElement("canvas").getContext("webgl2"))
    } catch {
      return false
    }
  }

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas
    const gl = canvas.getContext("webgl2", { preserveDrawingBuffer: true, premultipliedAlpha: false, antialias: false, stencil: true })
    if (!gl) throw new Error("WebGL 2 is not available in this browser.")
    this.gl = gl
    this.quad = gl.createBuffer()!
    gl.bindBuffer(gl.ARRAY_BUFFER, this.quad)
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW)
    this.dyn = gl.createBuffer()!
    this.vao = gl.createVertexArray()!
    this.frameTex = this.texture()
    this.personTex = this.texture()
    for (const [name, fs] of Object.entries({ solid: FS_SOLID, ellipse: FS_ELLIPSE, blur: FS_BLUR, copy: FS_COPY, smooth: FS_SMOOTH, makeup: FS_MAKEUP, lut: FS_LUT, layer: FS_LAYER, softlight: FS_SOFTLIGHT })) this.progs.set(name, this.program(fs))
  }

  // ---------- GL plumbing ----------

  private program(fs: string) {
    const gl = this.gl
    const compile = (type: number, src: string) => {
      const s = gl.createShader(type)!
      gl.shaderSource(s, src)
      gl.compileShader(s)
      if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(`Shader compile failed: ${gl.getShaderInfoLog(s)}`)
      return s
    }
    const p = gl.createProgram()!
    gl.attachShader(p, compile(gl.VERTEX_SHADER, VS))
    gl.attachShader(p, compile(gl.FRAGMENT_SHADER, fs))
    gl.bindAttribLocation(p, 0, "aPos")
    gl.linkProgram(p)
    if (!gl.getProgramParameter(p, gl.LINK_STATUS)) throw new Error(`Program link failed: ${gl.getProgramInfoLog(p)}`)
    return { p, u: new Map<string, WebGLUniformLocation | null>() }
  }

  private use(name: string, uniforms: Record<string, number | number[] | boolean | Float32Array> = {}, textures: Record<string, WebGLTexture> = {}) {
    const gl = this.gl
    const prog = this.progs.get(name)!
    gl.useProgram(prog.p)
    const loc = (k: string) => {
      if (!prog.u.has(k)) prog.u.set(k, gl.getUniformLocation(prog.p, k))
      return prog.u.get(k)!
    }
    gl.uniform2f(loc("uSize"), 0, 0)
    gl.uniformMatrix3fv(loc("uXform"), false, [1, 0, 0, 0, 1, 0, 0, 0, 1])
    let unit = 0
    for (const [k, tex] of Object.entries(textures)) {
      gl.activeTexture(gl.TEXTURE0 + unit)
      gl.bindTexture(gl.TEXTURE_2D, tex)
      gl.uniform1i(loc(k), unit++)
    }
    for (const [k, v] of Object.entries(uniforms)) {
      const l = loc(k)
      if (l === null) continue
      if (typeof v === "boolean") gl.uniform1i(l, v ? 1 : 0)
      else if (typeof v === "number") (k === "uModel" || k === "uFinish" || k === "uBlend" || k === "uMode" ? gl.uniform1i(l, v) : gl.uniform1f(l, v))
      else if (v.length === 2) gl.uniform2fv(l, v)
      else if (v.length === 3) gl.uniform3fv(l, v)
      else if (v.length === 4) gl.uniform4fv(l, v)
      else if (v.length === 9) gl.uniformMatrix3fv(l, false, v)
    }
    return loc
  }

  private texture(filter: number = this.gl.LINEAR) {
    const gl = this.gl
    const t = gl.createTexture()!
    gl.bindTexture(gl.TEXTURE_2D, t)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, filter)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, filter)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
    return t
  }

  private target(w: number, h: number, format: "rgba" | "r", stencil = false): Target {
    const gl = this.gl
    const tex = this.texture()
    if (format === "r") gl.texImage2D(gl.TEXTURE_2D, 0, gl.R8, w, h, 0, gl.RED, gl.UNSIGNED_BYTE, null)
    else gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA8, w, h, 0, gl.RGBA, gl.UNSIGNED_BYTE, null)
    const fb = gl.createFramebuffer()!
    gl.bindFramebuffer(gl.FRAMEBUFFER, fb)
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, tex, 0)
    let rb: WebGLRenderbuffer | undefined
    if (stencil) {
      rb = gl.createRenderbuffer()!
      gl.bindRenderbuffer(gl.RENDERBUFFER, rb)
      gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH24_STENCIL8, w, h)
      gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_STENCIL_ATTACHMENT, gl.RENDERBUFFER, rb)
    }
    return { tex, fb, w, h, stencil: rb }
  }

  private free(t?: Target) {
    if (!t) return
    this.gl.deleteTexture(t.tex)
    this.gl.deleteFramebuffer(t.fb)
    if (t.stencil) this.gl.deleteRenderbuffer(t.stencil)
  }

  private resize(w: number, h: number) {
    if (w === this.w && h === this.h) return
    this.w = w
    this.h = h
    this.canvas.width = w
    this.canvas.height = h
    for (const t of [...this.acc, this.blurA, this.blurB, this.maskA, this.maskB]) this.free(t)
    this.acc = [this.target(w, h, "rgba"), this.target(w, h, "rgba")]
    const bw = Math.max(1, Math.round(w / 4)), bh = Math.max(1, Math.round(h / 4))
    this.blurA = this.target(bw, bh, "rgba")
    this.blurB = this.target(bw, bh, "rgba")
    const mw = Math.max(1, Math.round(w / 2)), mh = Math.max(1, Math.round(h / 2))
    this.maskA = this.target(mw, mh, "r", true)
    this.maskB = this.target(mw, mh, "r")
  }

  private bindTarget(t: Target | null) {
    const gl = this.gl
    gl.bindFramebuffer(gl.FRAMEBUFFER, t ? t.fb : null)
    gl.viewport(0, 0, t ? t.w : this.w, t ? t.h : this.h)
  }

  private drawQuad() {
    const gl = this.gl
    gl.bindVertexArray(this.vao)
    gl.bindBuffer(gl.ARRAY_BUFFER, this.quad)
    gl.enableVertexAttribArray(0)
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0)
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4)
  }

  private drawPoints(points: number[], mode: number) {
    const gl = this.gl
    gl.bindVertexArray(this.vao)
    gl.bindBuffer(gl.ARRAY_BUFFER, this.dyn)
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(points), gl.STREAM_DRAW)
    gl.enableVertexAttribArray(0)
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0)
    gl.drawArrays(mode, 0, points.length / 2)
  }

  private upload(tex: WebGLTexture, src: TexImageSource) {
    const gl = this.gl
    gl.bindTexture(gl.TEXTURE_2D, tex)
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true)
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, src)
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false)
  }

  // ---------- passes ----------

  /** Draws a region mask into maskA (scaled to mask resolution), feathered by `feather` image px. */
  private mask(shapes: Shape[], feather: number) {
    const gl = this.gl
    const t = this.maskA
    this.bindTarget(t)
    gl.clearColor(0, 0, 0, 0)
    gl.clearStencil(0)
    gl.clear(gl.COLOR_BUFFER_BIT | gl.STENCIL_BUFFER_BIT)
    const size = [this.w, this.h]
    for (const s of shapes) {
      if (s.kind === "poly") {
        // Even-odd fill: toggle stencil with a fan per ring (holes included), then cover where odd.
        gl.enable(gl.STENCIL_TEST)
        gl.colorMask(false, false, false, false)
        gl.stencilFunc(gl.ALWAYS, 0, 0xff)
        gl.stencilOp(gl.KEEP, gl.KEEP, gl.INVERT)
        gl.stencilMask(0x01)
        this.use("solid", { uValue: 1, uSize: size })
        for (const ring of [s.points, ...(s.holes ?? [])]) {
          const flat = [ring[0][0], ring[0][1], ...ring.flat(), ring[0][0], ring[0][1]]
          this.drawPoints(flat, gl.TRIANGLE_FAN)
        }
        gl.colorMask(true, true, true, true)
        gl.stencilFunc(gl.EQUAL, 1, 0x01)
        gl.stencilOp(gl.ZERO, gl.ZERO, gl.ZERO)
        gl.enable(gl.BLEND)
        gl.blendEquation(gl.MAX)
        this.use("solid", { uValue: 1 })
        this.drawQuad()
        gl.disable(gl.BLEND)
        gl.disable(gl.STENCIL_TEST)
      } else {
        gl.enable(gl.BLEND)
        gl.blendEquation(gl.MAX)
        const c = Math.cos(s.angle), sn = Math.sin(s.angle)
        // local [-1,1] -> pixel: center + R * (x*rx, y*ry)
        const m = [c * s.rx, sn * s.rx, 0, -sn * s.ry, c * s.ry, 0, s.center[0], s.center[1], 1]
        this.use("ellipse", { uSize: size, uXform: m })
        this.drawQuad()
        gl.disable(gl.BLEND)
      }
    }
    gl.blendEquation(gl.FUNC_ADD)
    if (feather > 0.5) {
      const sigma = (feather * t.w) / this.w / 2
      this.blurPass(this.maskA, this.maskB, [sigma / t.w, 0])
      this.blurPass(this.maskB, this.maskA, [0, sigma / t.h])
    }
    return this.maskA.tex
  }

  private blurPass(src: Target, dst: Target, dir: number[]) {
    this.bindTarget(dst)
    this.use("blur", { uDir: dir }, { uTex: src.tex })
    this.drawQuad()
  }

  /** Low-pass copy of the frame (quarter resolution) for smoothing and texture-preserving shading. */
  private blurFrame(src: WebGLTexture, radiusPx: number) {
    this.bindTarget(this.blurA)
    this.use("copy", { uMirror: false }, { uTex: src })
    this.drawQuad()
    const sigma = Math.max(1, (radiusPx * this.blurA.w) / this.w / 2)
    for (let i = 0; i < 2; i++) {
      this.blurPass(this.blurA, this.blurB, [sigma / this.blurA.w, 0])
      this.blurPass(this.blurB, this.blurA, [0, sigma / this.blurA.h])
    }
    return this.blurA.tex
  }

  private mediaTexture(src: MediaSource) {
    let tex = this.mediaTex.get(src)
    const fresh = !tex
    if (!tex) {
      tex = this.texture()
      this.mediaTex.set(src, tex)
    }
    // Videos change every frame; images upload once.
    if (fresh || src instanceof HTMLVideoElement) this.upload(tex, src)
    return tex
  }

  // ---------- frame ----------

  render(f: FrameInput) {
    const gl = this.gl
    this.resize(f.width, f.height)
    this.upload(this.frameTex, f.source)
    let cur = 0
    const src = () => this.acc[cur].tex
    const pass = (name: string, uniforms: Record<string, number | number[] | boolean>, textures: Record<string, WebGLTexture>) => {
      const next = 1 - cur
      this.bindTarget(this.acc[next])
      this.use(name, uniforms, { uBase: src(), ...textures })
      this.drawQuad()
      cur = next
    }
    // Start from the camera frame.
    this.bindTarget(this.acc[0])
    this.use("copy", { uMirror: false }, { uTex: this.frameTex })
    this.drawQuad()

    const look = f.look
    const face = f.face
    if (look) {
      const media = (o: Overlay) => ("asset" in o && o.asset ? f.media(o.asset.url) : null)
      const bg = look.overlays.find((o) => o.kind === "background")
      if (bg && bg.kind === "background") {
        const m = media(bg)
        if (m) {
          if (f.personMask) {
            // 8-bit upload: float textures aren't linearly filterable in WebGL2 without an extension.
            const pm = f.personMask
            const bytes = new Uint8Array(pm.data.length)
            for (let i = 0; i < bytes.length; i++) bytes[i] = Math.max(0, Math.min(255, pm.data[i] * 255))
            gl.bindTexture(gl.TEXTURE_2D, this.personTex)
            gl.pixelStorei(gl.UNPACK_ALIGNMENT, 1)
            gl.texImage2D(gl.TEXTURE_2D, 0, gl.R8, pm.width, pm.height, 0, gl.RED, gl.UNSIGNED_BYTE, bytes)
            gl.pixelStorei(gl.UNPACK_ALIGNMENT, 4)
          }
          pass("layer", { uBlend: BLEND_ID[bg.blend] ?? 0, uMode: 1, uSplitAlpha: bg.blend === "split_alpha", uHasPerson: Boolean(f.personMask), uLocal: coverMatrix(m, this.w, this.h, bg.contentMode) }, { uTex: this.mediaTexture(m), uPerson: this.personTex })
        }
      }

      if (face) {
        const blur = this.blurFrame(src(), face.width * 0.035)
        if (look.skin.smoothing > 0) {
          const s = skinShape(face)
          pass("smooth", { uAmount: look.skin.smoothing }, { uBlur: blur, uMask: this.mask([s], face.width * 0.03) })
        }
        const counts = new Map<Region, number>()
        const totals = new Map<Region, number>()
        for (const l of look.layers) totals.set(l.region, (totals.get(l.region) ?? 0) + 1)
        // Complexion first, then cheeks, then eyes/lips, so color products sit on top of the base.
        const order: Region[] = ["foundation", "concealer", "contour", "blush", "highlighter", "eyeshadow", "eyeliner", "lashes", "brows", "lip_liner", "lips"]
        const layers = [...look.layers].sort((a, b) => order.indexOf(a.region) - order.indexOf(b.region))
        for (const l of layers) {
          const k = counts.get(l.region) ?? 0
          counts.set(l.region, k + 1)
          if (k >= REGION_SPECS[l.region].maxLayers) continue
          const region = regionMask(face, l.region, k, totals.get(l.region) ?? 1)
          const maskTex = this.mask(region.shapes, region.feather)
          pass("makeup", {
            uColor: hexToRgb(l.material.color),
            uAmount: l.material.coverage * f.intensity,
            uModel: MODEL_ID[l.region],
            uFinish: FINISH_ID[l.material.finish] ?? 0,
            uTime: f.time,
            uRes: [this.w, this.h],
          }, { uBlur: blur, uMask: maskTex })
        }
      }

      for (const o of look.overlays) {
        if (o.kind === "lut") {
          const m = media(o)
          if (m) pass("lut", { uStrength: o.strength * f.intensity }, { uLut: this.mediaTexture(m) })
        } else if (o.kind === "softlight" && face) {
          pass("softlight", { uStrength: o.strength * f.intensity }, { uMask: this.mask([skinShape(face, 1)], face.width * 0.05) })
        } else if (o.kind === "face_video" && face) {
          const m = media(o)
          if (m) pass("layer", { uBlend: 0, uMode: 2, uSplitAlpha: o.splitAlpha, uHasPerson: false, uLocal: faceMediaMatrix(face, m, this.w, this.h, o.scale, o.translation, o.splitAlpha) }, { uTex: this.mediaTexture(m), uPerson: this.personTex })
        }
      }
      const fg = look.overlays.find((o) => o.kind === "foreground")
      if (fg && fg.kind === "foreground") {
        const m = media(fg)
        if (m) pass("layer", { uBlend: BLEND_ID[fg.blend] ?? 0, uMode: 0, uSplitAlpha: false, uHasPerson: false, uLocal: coverMatrix(m, this.w, this.h, fg.contentMode) }, { uTex: this.mediaTexture(m), uPerson: this.personTex })
      }
    }

    // Present (mirrored for selfie camera).
    this.bindTarget(null)
    this.use("copy", { uMirror: f.mirror }, { uTex: src() })
    this.drawQuad()
  }

  destroy() {
    const ext = this.gl.getExtension("WEBGL_lose_context")
    ext?.loseContext()
  }
}

const sizeOf = (m: MediaSource): [number, number] =>
  m instanceof HTMLVideoElement ? [m.videoWidth || 1, m.videoHeight || 1] : m instanceof HTMLImageElement ? [m.naturalWidth || 1, m.naturalHeight || 1] : [m.width || 1, m.height || 1]

/** Target uv -> media uv for cover / fit / fill (both bottom-up). */
function coverMatrix(m: MediaSource, w: number, h: number, mode: "scale_to_fill" | "fill" | "fit"): number[] {
  const [mw, mh] = sizeOf(m)
  if (mode === "fill") return [1, 0, 0, 0, 1, 0, 0, 0, 1]
  const s = mode === "fit" ? Math.min(w / mw, h / mh) : Math.max(w / mw, h / mh)
  const sx = w / (mw * s), sy = h / (mh * s)
  // t = (uv - 0.5) * (sx, sy) + 0.5   (column-major mat3)
  return [sx, 0, 0, 0, sy, 0, 0.5 - 0.5 * sx, 0.5 - 0.5 * sy, 1]
}

/** Maps target uv into face-anchored media uv (rotated with the head, sized to the face). */
function faceMediaMatrix(face: Face, m: MediaSource, w: number, h: number, scale: [number, number, number], translation: [number, number, number], split: boolean): number[] {
  const a = faceAnchor(face)
  const [mw0, mh] = sizeOf(m)
  const mw = split ? mw0 / 2 : mw0
  const boxW = a.width * 1.3 * scale[0]
  const boxH = (boxW * mh) / mw
  // translation is in millimetres on a ~150 mm wide face
  const mm = a.width / 150
  const cx = a.center[0] + translation[0] * mm
  const cy = a.center[1] - translation[1] * mm
  const c = Math.cos(-a.angle), s = Math.sin(-a.angle)
  // uv (bottom-up) -> pixel (top-down): px = u*w, py = (1-v)*h ; rotate about anchor; normalize into box.
  // t.x = ((px-cx)*c - (py-cy)*s)/boxW + 0.5 ; t.y(bottom-up) = 0.5 - ((px-cx)*s + (py-cy)*c)/boxH
  const ax = (w * c) / boxW, bx = (h * s) / boxW, cxConst = (-cx * c - (h - cy) * s) / boxW + 0.5
  const ay = -(w * s) / boxH, by = (h * c) / boxH, cyConst = 0.5 - (-cx * s + (h - cy) * c) / boxH
  // t.x = ax*u + bx*v + cxConst ; t.y = ay*u + by*v + cyConst
  return [ax, ay, 0, bx, by, 0, cxConst, cyConst, 1]
}
