/**
 * Device-only Night Watch playtest harness. Default off — Easy shipping play unchanged.
 * Bill: pause walkers so playtests can read the cue and tap the glowing face.
 */

export const NW_DEBUG_KEY = 'silver-city-nw-debug'

export function readNightWatchDebug(): boolean {
  if (typeof localStorage === 'undefined') return false
  return localStorage.getItem(NW_DEBUG_KEY) === 'on'
}

export function writeNightWatchDebug(on: boolean) {
  if (typeof localStorage === 'undefined') return
  if (on) localStorage.setItem(NW_DEBUG_KEY, 'on')
  else localStorage.removeItem(NW_DEBUG_KEY)
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event('silver-city-nw-debug'))
  }
}

/** Wave tick: walkers frozen while debug pause is on (spawn timer too). */
export function nightWatchDebugFrozen(
  easy: boolean,
  debugOn: boolean,
  paused: boolean,
  now: number,
  freezeUntil: number,
): boolean {
  if (easy && debugOn && paused) return true
  return now < freezeUntil
}
