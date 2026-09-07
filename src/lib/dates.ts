function pad2(n: number): string {
  return String(n).padStart(2, '0')
}

/**
 * Device calendar YYYY-MM-DD from local getters only.
 * Never `toISOString()`, `getUTC*`, or `Intl` with an explicit `timeZone`
 * (date-only Intl + a zone is how America/Chicago 00:50 Monday became Sunday).
 */
export function localDateKey(d = new Date()): string {
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`
}

/** Civil (date-only) arithmetic on YYYY-MM-DD keys — not wall-clock instants. */
export function addLocalDays(key: string, n: number): string {
  const { y, m, d } = parseDateKey(key)
  const next = new Date(y, m - 1, d)
  next.setDate(next.getDate() + n)
  return localDateKey(next)
}

export function parseDateKey(key: string): { y: number; m: number; d: number } {
  const [y, m, d] = key.split('-').map(Number)
  return { y, m, d }
}

export function hashString(value: string): number {
  let h = 2166136261
  for (let i = 0; i < value.length; i++) {
    h ^= value.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return h >>> 0
}

/** Grep marker so we can prove the live bundle is this revision. */
export const DATE_SOURCE = 'device-local-getters'

/**
 * Weekday + date for a `Date` in the *device* timezone.
 * `timeZone` is omitted on purpose — the browser's local zone, not UTC.
 */
export function formatDeviceLocalDate(d = new Date()): string {
  const localNoon = new Date(d.getFullYear(), d.getMonth(), d.getDate(), 12, 0, 0)
  return new Intl.DateTimeFormat(undefined, {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  }).format(localNoon)
}

/** Print a stored YYYY-MM-DD as local noon that day (never Date.parse of the key). */
export function formatTrailDate(key: string): string {
  const { y, m, d } = parseDateKey(key)
  return formatDeviceLocalDate(new Date(y, m - 1, d, 12, 0, 0))
}

export function assertLocalCalendar(d = new Date()): void {
  const key = localDateKey(d)
  const { y, m, day } = {
    y: d.getFullYear(),
    m: d.getMonth() + 1,
    day: d.getDate(),
  }
  const [ky, km, kd] = key.split('-').map(Number)
  console.assert(
    ky === y && km === m && kd === day,
    `[${DATE_SOURCE}] date key drifted from local getters`,
    { key, y, m, day },
  )
}
