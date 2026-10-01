import type { WalkerKind } from '../../types.ts'

export type NightPartId = 'lot' | 'lamp' | 'face'

const lotEmpty = new URL('../../assets/defend/nw-lot-empty.png', import.meta.url).href
const lampIdle = new URL('../../assets/defend/nw-tower-lamp-idle.png', import.meta.url).href
const lampFiring = new URL('../../assets/defend/nw-tower-lamp-firing.png', import.meta.url).href

/** Per-kind portraits. One shared dark face hid every walker (Fixes #450). */
const FACE_PORTRAITS: Record<WalkerKind, string> = {
  'image-bearer': new URL('../../assets/walkers/walker-image-bearer.png', import.meta.url).href,
  skeptic: new URL('../../assets/walkers/walker-skeptic.png', import.meta.url).href,
  pagan: new URL('../../assets/walkers/walker-pagan.png', import.meta.url).href,
  physical: new URL('../../assets/walkers/walker-physical.png', import.meta.url).href,
  metaphysical: new URL('../../assets/walkers/walker-metaphysical.png', import.meta.url).href,
  spiritual: new URL('../../assets/walkers/walker-spiritual.png', import.meta.url).href,
}

/** Sprite URLs by part, then variant (walker kind for faces). */
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
  face: FACE_PORTRAITS,
}

export interface NightPartsModule {
  /** Sprite for a part, or null to keep the current built-in art. */
  src(id: NightPartId, variant?: string): string | null
}

export const nightParts: NightPartsModule = {
  src: (id, variant = 'default') => NIGHT_PARTS[id]?.[variant] ?? null,
}
