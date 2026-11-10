import type { LookDocument } from "../schema"

export interface ExportIssue {
  level: "warning" | "error"
  message: string
}

/** A media file that must ship next to the exported config (e.g. inside a Banuba effect zip). */
export interface ExportFile {
  /** Path inside the bundle, referenced by the config. */
  path: string
  /** Where to fetch the bytes from. */
  url: string
  mediaType: string
}

export interface ExportResult {
  content: string
  issues: ExportIssue[]
  /** Files the content references; empty when the export is self-contained. */
  files: ExportFile[]
}

/**
 * Translates a look into one AR platform's native format.
 * To support a new platform, implement this interface and add it to `ADAPTERS`.
 */
export interface PlatformAdapter {
  id: string
  label: string
  fileName(look: LookDocument): string
  mediaType: string
  export(look: LookDocument): ExportResult
}
