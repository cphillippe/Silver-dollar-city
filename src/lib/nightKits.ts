import { DEFEND_HEARTS } from './defend.ts'

/**
 * Session one-offs for a Night Watch run (Fixes #463).
 * Bought with sparks between waves. Spent during a live wave.
 * Not WATCH_TOOLS rows — Love / Logic / Reason / Science stay the rail.
 */
export const KIT_IDS = ['still', 'mend'] as const

export type KitId = (typeof KIT_IDS)[number]

export const KIT_LABEL: Record<KitId, string> = {
  still: 'Still',
  mend: 'Mend',
}

/** Sparks to buy one charge. Same flat cost as a tower step. */
export const kitSparkCost = 1

/** Walker freeze. Short enough that Love I still leaks wave 5. */
export const STILL_MS = 1800

export interface RunKits {
  still: number
  mend: number
}

export function freshRunKits(): RunKits {
  return { still: 0, mend: 0 }
}

export interface KitBuy {
  ok: boolean
  kits: RunKits
  sparks: number
  note: string
}

/** Spend one spark for one charge. Does not raise tower tier. */
export function applyKitBuy(id: KitId, kits: RunKits, sparks: number): KitBuy {
  const label = KIT_LABEL[id]
  if (sparks < kitSparkCost) {
    return { ok: false, kits, sparks, note: 'Need a spark' }
  }
  return {
    ok: true,
    kits: { ...kits, [id]: kits[id] + 1 },
    sparks: sparks - kitSparkCost,
    note: `${label} ready`,
  }
}

/** Freeze deadline. Heaven flyaway is not frozen. */
export function useStill(now: number): number {
  return now + STILL_MS
}

export interface MendResult {
  hearts: number
  healed: boolean
  note: string
}

/** Restore one heart, never above DEFEND_HEARTS. Full hearts do not spend. */
export function useMend(hearts: number, cap = DEFEND_HEARTS): MendResult {
  if (hearts >= cap) return { hearts, healed: false, note: 'Hearts full' }
  return { hearts: Math.min(cap, hearts + 1), healed: true, note: 'Mend' }
}

/** Path step for an unturned walker. Freeze holds t. */
export function unturnedStep(t: number, step: number, frozen: boolean): number {
  if (frozen) return t
  return t + step
}
