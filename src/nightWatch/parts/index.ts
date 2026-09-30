import type { WalkerKind } from '../../types.ts'

export type NightPartId = 'lot' | 'lamp' | 'face'

const lotEmpty = new URL('../../assets/defend/nw-lot-empty.png', import.meta.url).href
const lampIdle = new URL('../../assets/defend/nw-tower-lamp-idle.png', import.meta.url).href
const lampFiring = new URL('../../assets/defend/nw-tower-lamp-firing.png', import.meta.url).href
const faceDark = new URL('../../assets/defend/nw-dark-face.png', import.meta.url).href

const WALKER_FACE_KINDS: WalkerKind[] = [
  'image-bearer',
  'skeptic',
  'pagan',
  'physical',
  'metaphysical',
  'spiritual',
]

const faceSprites = Object.fromEntries(
  WALKER_FACE_KINDS.map((kind) => [kind, faceDark]),
) as Record<string, string>

/** Sprite URLs by part, then variant (e.g. walker kind for faces). Empty = built-in SVG / portrait art. */
const NIGHT_PARTS: Partial<Record<NightPartId, Record<string, string>>> = {
  lot: {
    default: lotEmpty,
    empty: lotEmpty,
  },
  lamp: {
    default: lampIdle,
    idle: lampIdle,
    firing: lampFiring,
  },
  face: faceSprites,
}

export interface NightPartsModule {
  /** Sprite for a part, or null to keep the current built-in art. */
  src(id: NightPartId, variant?: string): string | null
}

export const nightParts: NightPartsModule = {
  src: (id, variant = 'default') => NIGHT_PARTS[id]?.[variant] ?? null,
}
