import type { WalkerKind } from '../types.ts'

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
  /** Climb roster id — labels can differ from the shared face. */
  castId?: string
  label?: string
  hp: number
  maxHp?: number
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
