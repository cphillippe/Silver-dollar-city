export type NightPartId = 'lot' | 'lamp' | 'face'

/** Sprite URLs by part, then variant (e.g. walker kind for faces). Empty = built-in SVG / portrait art. */
const NIGHT_PARTS: Partial<Record<NightPartId, Record<string, string>>> = {}

export interface NightPartsModule {
  /** Sprite for a part, or null to keep the current built-in art. */
  src(id: NightPartId, variant?: string): string | null
}

export const nightParts: NightPartsModule = {
  src: (id, variant = 'default') => NIGHT_PARTS[id]?.[variant] ?? null,
}
