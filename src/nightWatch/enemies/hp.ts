import type { WalkerKind } from '../../types.ts'
import type { NightRaider } from '../types.ts'

export type NightEnemyRole = 'swarm' | 'mid' | 'tank'

/** Existing walker kinds sorted into soft-TD roles; no new kinds. */
export const NIGHT_ENEMY_ROLE: Record<WalkerKind, NightEnemyRole> = {
  skeptic: 'swarm',
  spiritual: 'swarm',
  'image-bearer': 'mid',
  pagan: 'mid',
  metaphysical: 'mid',
  physical: 'tank',
}

/** Matching hits to turn a walker. Easy stays low so kids still clear a wave. */
export const NIGHT_ENEMY_HP: Record<'easy' | 'hard', Record<NightEnemyRole, number>> = {
  easy: { swarm: 2, mid: 2, tank: 3 },
  hard: { swarm: 2, mid: 3, tank: 4 },
}

export function enemyMaxHp(kind: WalkerKind, easy: boolean): number {
  return NIGHT_ENEMY_HP[easy ? 'easy' : 'hard'][NIGHT_ENEMY_ROLE[kind]]
}

/** One matching hit. `down` means HP is gone and the caller soft-turns the walker. */
export function enemyHit<T extends NightRaider>(raider: T, damage = 1): { raider: T; down: boolean } {
  const hp = Math.max(0, raider.hp - damage)
  return { raider: { ...raider, hp }, down: hp <= 0 }
}
