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

/**
 * 0-based wave index from `?nwRound=`, or null when the query is missing or out of range.
 * `allowed` is the playtest gate. A production night ignores the param.
 */
export function nightWatchRoundJump(search: string, nightLen: number, allowed: boolean): number | null {
  if (!allowed || nightLen < 1) return null
  const raw = new URLSearchParams(search).get('nwRound')
  if (!raw || !/^[1-9]\d*$/.test(raw)) return null
  const round = Number(raw)
  if (round > nightLen) return null
  return round - 1
}

/**
 * Current search string has `playtest=1`, or Night Watch debug freeze is explicitly on.
 * A dev build is not a pass. An old URL is not remembered.
 */
export function nightWatchJumpAllowed(search: string, debugOn: boolean): boolean {
  if (debugOn === true) return true
  return new URLSearchParams(search).get('playtest') === '1'
}

/** Easy playtest jump. Null on Hard and on a normal visit. */
export function readNightWatchRoundJump(nightLen: number): number | null {
  if (typeof window === 'undefined') return null
  const search = window.location.search
  return nightWatchRoundJump(search, nightLen, nightWatchJumpAllowed(search, readNightWatchDebug()))
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
