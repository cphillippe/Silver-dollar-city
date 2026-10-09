import type { WalkerFaceId } from './enemies/faces.ts'
import type { WalkerKind } from '../types.ts'
import type { WalkerGait } from './walkers.ts'

/** Board coordinates in map viewBox units (798×1134 A2 plate). */
export interface NightPoint {
  x: number
  y: number
}

export type NightPhase = 'plant' | 'wave' | 'boost' | 'lost'

export interface NightRaider {
  id: number
  t: number
  text: string
  kind: WalkerKind
  /**
   * Portrait key. Easy picks this so two walkers on the road do not share a head.
   * Kind still decides the hit. Unset means “use kind”.
   */
  face?: WalkerFaceId
  /** Climb roster id — labels can differ from the shared face. */
  castId?: string
  label?: string
  hp: number
  maxHp?: number
  /** Easy gait. Hard leaves this unset and walks at the round pace. */
  gait?: WalkerGait
  /** Easy boss on rounds 5, 10, 15, 20, and 25. Hard leaves this unset. */
  boss?: boolean
  /** Sparks this walker pays when turned. Tough pays more than one. */
  spark?: number
  turned?: string
  from?: NightPoint
  heavenT?: number
  /** Last lamp hit, for the path-face flash. */
  struckAt?: number
}

export interface NightShot {
  key: number
  from: NightPoint
  to: NightPoint
}

export interface NightBlast {
  key: number
  x: number
  y: number
  line: string
  combo: number
  /** Walker fell — puff on the road. */
  pop?: boolean
  /** Sparks this hit paid. */
  spark?: number
}
