import "server-only"
// Built-in implementations of the registry interfaces.
import { formulateLook, generateSkinFamily, parsePrompt } from "@beautyos/color-lab"
import { FINISHES, REGIONS, REGION_SPECS, emptyLook, validateLook, type LookDocument } from "@beautyos/look-format"
import { generateImage, generateText, Output } from "ai"
import sharp from "sharp"
import { z } from "zod"
import { ENHANCE_PRESETS, enhance as enhanceSharp, type EnhancePreset } from "@/server/media"
import { blobStorage, localStorage } from "@/server/storage"
import type { Enhancer, ImageGenerator, LookFormulator, StorageModule } from "./registry"

const gatewayAuth = () => Boolean(process.env.AI_GATEWAY_API_KEY || process.env.VERCEL_OIDC_TOKEN)

// ---------- storage ----------

export const vercelBlob: StorageModule = {
  id: "vercel-blob",
  label: "Vercel Blob",
  requirement: "Set BLOB_READ_WRITE_TOKEN (connect a Blob store to the project).",
  available: () => Boolean(process.env.BLOB_READ_WRITE_TOKEN),
  storage: blobStorage,
}

export const localDisk: StorageModule = {
  id: "local-disk",
  label: "Local disk (.data/files)",
  available: () => !process.env.VERCEL,
  storage: localStorage,
}

// ---------- enhancement ----------

export const classicEnhancer: Enhancer = {
  id: "classic",
  label: "Classic enhancement (local contrast, detail, tone)",
  presets: ENHANCE_PRESETS,
  available: () => true,
  async enhance(bytes, preset) {
    const p = (ENHANCE_PRESETS as readonly string[]).includes(preset) ? (preset as EnhancePreset) : "none"
    return new Uint8Array(await enhanceSharp(sharp(bytes).rotate(), p).png().toBuffer())
  },
}

// ---------- image generation (synthetic models) ----------

export const gatewayImages: ImageGenerator = {
  id: "ai-gateway-image",
  label: "Vercel AI Gateway image model",
  requirement: "Set AI_GATEWAY_API_KEY (or deploy on Vercel) and BEAUTYOS_IMAGE_MODEL to a gateway image model id.",
  available: () => gatewayAuth() && Boolean(process.env.BEAUTYOS_IMAGE_MODEL),
  async generate(req) {
    const model = process.env.BEAUTYOS_IMAGE_MODEL!
    const text = req.negativePrompt ? `${req.prompt}\n\nAvoid: ${req.negativePrompt}.` : req.prompt
    const { image } = await generateImage({
      model,
      prompt: req.reference ? { text, images: [req.reference.bytes] } : text,
      size: `${req.width}x${req.height}`,
      ...(req.seed !== undefined ? { seed: req.seed } : {}),
    })
    return { bytes: image.uint8Array, mediaType: image.mediaType, model, seed: req.seed }
  },
}

// ---------- look formulation ----------

export const ruleFormulator: LookFormulator = {
  id: "rules",
  label: "Rule-based formulation (offline)",
  available: () => true,
  async formulate(req) {
    const parsed = parsePrompt(req.prompt, req.libraries)
    const f = formulateLook({
      name: titleFrom(req.prompt),
      colors: parsed.colors,
      skin: req.skin,
      occasion: req.occasion ?? parsed.occasion,
      intensity: parsed.intensity,
      catalog: req.catalog,
    })
    return { ...f, engine: "rules", notes: parsed.notes }
  },
}

const LlmLook = z.object({
  name: z.string().describe("Short evocative look name, 1-4 words"),
  description: z.string().describe("One sentence describing the look"),
  occasion: z.enum(["everyday", "evening", "bold"]),
  smoothing: z.number().min(0).max(1).describe("Skin smoothing strength"),
  layers: z
    .array(
      z.object({
        region: z.enum(REGIONS),
        color: z.string().describe("6-digit hex like #b3122e"),
        finish: z.enum(FINISHES),
        coverage: z.number().min(0).max(1),
        sku: z.string().optional().describe("Catalog SKU when a catalog shade is used"),
        reason: z.string().describe("Why this color and finish"),
      }),
    )
    .describe("Ordered layers. Eyeshadow may have up to 3 layers ordered light to dark; other regions at most 1."),
})

export const gatewayFormulator: LookFormulator = {
  id: "ai-gateway-llm",
  label: "Language model formulation (Vercel AI Gateway)",
  requirement: "Set AI_GATEWAY_API_KEY (or deploy on Vercel) and BEAUTYOS_TEXT_MODEL to a gateway text model id, e.g. an Anthropic Claude model.",
  available: () => gatewayAuth() && Boolean(process.env.BEAUTYOS_TEXT_MODEL),
  async formulate(req) {
    // Resolve explicit colors (hex, CMYK, Pantone from imported libraries) deterministically first,
    // so the model reasons over exact values instead of guessing them.
    const parsed = parsePrompt(req.prompt, req.libraries)
    const skin = req.skin ? generateSkinFamily(req.skin) : null
    const regions = REGIONS.map((r) => `${r}: finishes ${REGION_SPECS[r].finishes.join("/")}, max ${REGION_SPECS[r].maxLayers} layer(s)`).join("\n")
    const catalog = req.catalog.slice(0, 250).map((s) => `${s.sku ?? "-"} | ${s.region} | ${s.name} | ${s.color} | ${s.finish}`).join("\n")
    const system = [
      "You are a senior makeup artist and color scientist formulating digital makeup looks for an AR try-on system.",
      "Only use the listed regions and finishes. Prefer catalog shades (give their SKU) when they fit the brief within a close color match.",
      "Make choices that flatter the given skin tone: blush and highlighter depth should track skin depth; contour must be cooler and greyer than the skin.",
      `Regions:\n${regions}`,
      catalog ? `Catalog (SKU | region | name | hex | finish):\n${catalog}` : "No catalog: use exact hex colors.",
      skin ? `Skin analysis:\n${skin.reasoning.join("\n")}\nSuggested: foundation ${skin.foundationLadder[2].hex}, concealer ${skin.concealer[0].hex}, contour ${skin.contour.hex}, highlighter ${skin.highlighter.hex}, blush ${skin.blush.map((b) => b.hex).join(", ")}` : "",
      parsed.colors.length ? `Colors the user specified (use them exactly):\n${parsed.colors.map((c) => `${c.name}: ${c.hex}${c.region ? ` on ${c.region}` : ""}`).join("\n")}` : "",
    ]
      .filter(Boolean)
      .join("\n\n")
    const { output } = await generateText({
      model: process.env.BEAUTYOS_TEXT_MODEL!,
      system,
      prompt: req.prompt,
      output: Output.object({ schema: LlmLook }),
    })
    const bySku = new Map(req.catalog.filter((s) => s.sku).map((s) => [s.sku!, s]))
    const doc: LookDocument = {
      ...emptyLook(output.name),
      description: output.description,
      tags: [output.occasion, "ai-formulated"],
      skin: { smoothing: output.smoothing },
      layers: output.layers.map((l) => {
        const shade = l.sku ? bySku.get(l.sku) : undefined
        return {
          region: l.region,
          material: { color: (shade?.color ?? l.color).toLowerCase(), finish: shade?.finish ?? l.finish, coverage: l.coverage, ...(shade?.banubaFinish ? { overrides: { banuba: { finish: shade.banubaFinish } } } : {}) },
          ...(shade ? { shade: { shadeId: shade.shadeId, sku: shade.sku, name: shade.name, productName: shade.productName } } : {}),
        }
      }),
    }
    const checked = validateLook(doc)
    if (!checked.ok) {
      // Never hand back an invalid look: fall back to the deterministic engine and say why.
      const fallback = await ruleFormulator.formulate(req)
      return { ...fallback, notes: [`The language model's look had problems (${checked.issues.map((i) => i.message).join("; ")}); used rule-based formulation instead.`, ...fallback.notes] }
    }
    return {
      look: checked.look,
      assignments: output.layers.map((l) => ({ region: l.region, hex: l.color, finish: l.finish, reason: l.reason, confidence: 0.8, ...(l.sku && bySku.has(l.sku) ? { catalog: { name: bySku.get(l.sku)!.name, sku: l.sku, deltaE: 0 } } : {}) })),
      unused: [],
      reasoning: skin ? skin.reasoning : [],
      engine: `llm:${process.env.BEAUTYOS_TEXT_MODEL}`,
      notes: parsed.notes,
    }
  },
}

function titleFrom(prompt: string) {
  const words = prompt.replace(/[^\w\s-]/g, " ").split(/\s+/).filter((w) => w.length > 2).slice(0, 4)
  return words.length ? words.map((w) => w[0].toUpperCase() + w.slice(1).toLowerCase()).join(" ") : "Formulated look"
}
