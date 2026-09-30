import type { WalkerKind } from '../types.ts'

/** Board coordinates in map viewBox units (798×1134 A2 plate). */
export interface NightPoint {
  x: number
  y: number
}

export type NightPhase = 'plant' | 'wave' | 'lost'

export interface NightRaider {
  id: number
  t: number
  text: string
  kind: WalkerKind
  turned?: string
  from?: NightPoint
  heavenT?: number
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
}
