import { nightMapQueryId, type NightMapId } from '../nightWatch/maps/chain.ts'
import { nightWatchSeed } from '../nightWatch/seed.ts'

/**
 * Device-only Night Watch playtest harness. Default off — Easy shipping play unchanged.
 * Bill: pause walkers so playtests can read the cue and tap the glowing face.
 * A saved switch used to stick on the device and freeze a normal night. This visit only.
 */

export const NW_DEBUG_KEY = 'silver-city-nw-debug'
/** This browser tab. A later visit starts with walkers moving. */
export const NW_DEBUG_SESSION = 'silver-city-nw-debug-session'

function clearStickyDebug() {
  try {
    localStorage.removeItem(NW_DEBUG_KEY)
  } catch {
    /* A locked store cannot keep the freeze on. */
  }
}

export function readNightWatchDebug(): boolean {
  clearStickyDebug()
  try {
    return sessionStorage.getItem(NW_DEBUG_SESSION) === 'on'
  } catch {
    return false
  }
}

export function writeNightWatchDebug(on: boolean) {
  clearStickyDebug()
  try {
    if (on) sessionStorage.setItem(NW_DEBUG_SESSION, 'on')
    else sessionStorage.removeItem(NW_DEBUG_SESSION)
  } catch {
    /* This visit cannot store the switch. The night still runs. */
  }
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event('silver-city-nw-debug'))
  }
}

/**
 * The test panel. A normal night hides it.
 * `?playtest=1`, `?nwDebug=1`, or the developer switch for this visit.
 */
export function nightWatchDebugPanel(search: string, devOn: boolean): boolean {
  if (devOn === true) return true
  const params = new URLSearchParams(search)
  if (params.get('nwDebug') === '1') return true
  return params.get('playtest') === '1'
}

/**
 * Walkers start the wave held still.
 * A playtest seed still runs. Only `?nwDebug=1` or the developer switch holds them.
 */
export function nightWatchDebugHolds(search: string, devOn: boolean): boolean {
  if (devOn === true) return true
  return new URLSearchParams(search).get('nwDebug') === '1'
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

/**
 * `?nwMap=` while playtest is allowed. A normal visit ignores it.
 * map02–map06 are the maps in order. An unknown id stays on A2.
 */
export function nightWatchMapQuery(search: string, allowed: boolean): NightMapId | null {
  if (!allowed) return null
  return nightMapQueryId(new URLSearchParams(search).get('nwMap'))
}

/** The playtest asked for a map and that name is not one of ours. */
export function nightWatchMapMissing(search: string, allowed: boolean): boolean {
  if (!allowed) return false
  const raw = new URLSearchParams(search).get('nwMap')
  if (!raw) return false
  return nightMapQueryId(raw) == null
}

/**
 * A playtest that already named the night skips the map sheet.
 * A seed, a round jump, or a real `nwMap` counts. An unknown map does not.
 */
export function nightWatchSkipsMapSheet(search: string, debugOn: boolean): boolean {
  if (nightWatchSeed(search) != null) return true
  const allowed = nightWatchJumpAllowed(search, debugOn)
  if (nightWatchMapQuery(search, allowed)) return true
  return nightWatchRoundJump(search, 25, allowed) != null
}

/**
 * `?nwLamps=` while playtest is allowed.
 * 0, 1, or 2. Missing or any other value keeps the full jump load.
 */
export function nightWatchLampCap(search: string, allowed: boolean): number | null {
  if (!allowed) return null
  const raw = new URLSearchParams(search).get('nwLamps')
  if (raw == null || raw === '') return null
  if (!/^[012]$/.test(raw)) return null
  return Number(raw)
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
