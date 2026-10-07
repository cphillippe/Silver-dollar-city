import { DEFEND_HEARTS } from './defend.ts'
import { KIT_IDS, useMend, type KitId } from './nightKits.ts'

/**
 * Night Watch skills pack (1.4.380).
 * Still and Mend are tap powers with a cooldown, not spark charges.
 * They open one wave at a time. Mend always does something:
 * it fills missing hearts and holds the gate for a short shield.
 */

/** Wave index (0-based) when that skill first opens. One skill per wave. */
export const SKILL_UNLOCK_WAVE: Record<KitId, number> = {
  still: 0,
  mend: 1,
}

/** Recharge after a tap. Long enough to watch the ring, short enough to try twice. */
export const SKILL_COOLDOWN_MS: Record<KitId, number> = {
  still: 12_000,
  mend: 14_000,
}

/** Gate hold after Mend. Leaks during this window do not cost a heart. */
export const MEND_SHIELD_MS = 4_000

export const SKILL_BLURB: Record<KitId, string> = {
  still: 'Freezes every walker for a moment. Tap it when the road is crowded. Then it recharges.',
  mend: 'Fills your hearts and holds the gate. Tap it when a heart drops, or before a leak. Then it recharges.',
}

export type SkillFace = 'locked' | 'ready' | 'cooling'

export function skillUnlocked(id: KitId, waveIndex: number): boolean {
  return waveIndex >= SKILL_UNLOCK_WAVE[id]
}

/** The single skill that opens when this wave begins, if any. */
export function skillUnlockOnWave(waveIndex: number): KitId | null {
  return KIT_IDS.find((id) => SKILL_UNLOCK_WAVE[id] === waveIndex) ?? null
}

export function skillFace(unlocked: boolean, readyAt: number, now: number): SkillFace {
  if (!unlocked) return 'locked'
  if (now < readyAt) return 'cooling'
  return 'ready'
}

/** 1 = just tapped, 0 = ready again. */
export function cooldownFill(readyAt: number, now: number, cooldownMs: number): number {
  if (cooldownMs <= 0 || now >= readyAt) return 0
  return Math.min(1, (readyAt - now) / cooldownMs)
}

export function secondsLeft(readyAt: number, now: number): number {
  if (now >= readyAt) return 0
  return Math.ceil((readyAt - now) / 1000)
}

export function skillStatusLabel(
  face: SkillFace,
  readyAt: number,
  now: number,
  unlockWave: number,
): string {
  if (face === 'locked') return `Wave ${unlockWave + 1}`
  if (face === 'cooling') return `${secondsLeft(readyAt, now)}s`
  return 'TAP'
}

export interface MendPower {
  hearts: number
  gained: number
  /** Every Mend holds the gate, even when hearts were already full. */
  shield: boolean
  note: string
}

/** Fill every missing heart. A full bar still shields — the tap is never a no-op. */
export function mendPower(hearts: number, cap = DEFEND_HEARTS): MendPower {
  let cursor = hearts
  let gained = 0
  let step = useMend(cursor, cap)
  if (step.healed) {
    cursor = step.hearts
    gained = 1
    while (cursor < cap) {
      const more = useMend(cursor, cap)
      if (!more.healed) break
      cursor = more.hearts
      gained += 1
    }
  }
  return {
    hearts: cursor,
    gained,
    shield: true,
    note: gained > 0 ? `Mend +${gained}` : 'Mend',
  }
}
