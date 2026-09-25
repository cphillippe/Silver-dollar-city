import type { CityFills, CitySnapshot } from './cityModel.ts'

export * from './cityModel.ts'

export const CITY_SEEN_KEY = 'silver-city-seen-city-v1'
export const CITY_FILL_KEY = 'silver-city-seen-fill-v1'
export const CITY_HOMECOMING_KEY = 'silver-city-homecoming-v1'

export function readHomecomingDay(): string | null {
  if (typeof window === 'undefined') return null
  try {
    return window.localStorage.getItem(CITY_HOMECOMING_KEY)
  } catch {
    return null
  }
}

export function writeHomecomingDay(day: string) {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(CITY_HOMECOMING_KEY, day)
  } catch {
    /* ignore quota */
  }
}

export function readCitySeen(): CitySnapshot | null {
  if (typeof localStorage === 'undefined') return null
  try {
    const raw = localStorage.getItem(CITY_SEEN_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as CitySnapshot
    if (!parsed || typeof parsed !== 'object') return null
    return parsed
  } catch {
    return null
  }
}

export function writeCitySeen(snap: CitySnapshot) {
  if (typeof localStorage === 'undefined') return
  localStorage.setItem(CITY_SEEN_KEY, JSON.stringify(snap))
}

export function readFillsSeen(): CityFills | null {
  if (typeof localStorage === 'undefined') return null
  try {
    const raw = localStorage.getItem(CITY_FILL_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as CityFills
    if (!parsed || typeof parsed !== 'object') return null
    return parsed
  } catch {
    return null
  }
}

export function writeFillsSeen(snap: CityFills) {
  if (typeof localStorage === 'undefined') return
  localStorage.setItem(CITY_FILL_KEY, JSON.stringify(snap))
}

export function forgetCitySeen() {
  if (typeof localStorage === 'undefined') return
  localStorage.removeItem(CITY_SEEN_KEY)
  localStorage.removeItem(CITY_FILL_KEY)
}
