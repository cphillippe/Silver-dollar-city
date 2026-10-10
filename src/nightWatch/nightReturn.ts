import type { LampPaths } from './upgradeTree.ts'

const KEY = 'nw-night-return'

export interface NightReturn {
  phase: 'plant' | 'boost'
  waveIndex: number
  plants: Record<string, string>
  paths: Record<string, LampPaths>
  sparks: number
  hearts: number
  paid: string[]
  /** Lamp card that sent the kid to Lock In, so it is open again on the way back. */
  upgradePlot?: string
}

export function saveNightReturn(snap: NightReturn) {
  if (typeof sessionStorage === 'undefined') return
  sessionStorage.setItem(KEY, JSON.stringify(snap))
}

export function readNightReturn(): NightReturn | null {
  if (typeof sessionStorage === 'undefined') return null
  const raw = sessionStorage.getItem(KEY)
  if (!raw) return null
  try {
    const snap = JSON.parse(raw) as NightReturn
    if (snap.phase !== 'plant' && snap.phase !== 'boost') return null
    if (!snap.plants || !snap.paths) return null
    return snap
  } catch {
    return null
  }
}

export function clearNightReturn() {
  if (typeof sessionStorage === 'undefined') return
  sessionStorage.removeItem(KEY)
}
