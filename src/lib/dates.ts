/** Device IANA timezone (never assume UTC). */
export function deviceTimeZone(): string {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC'
  } catch {
    return 'UTC'
  }
}

function pad2(n: number): string {
  return String(n).padStart(2, '0')
}

function pickPart(
  parts: Intl.DateTimeFormatPart[],
  type: Intl.DateTimeFormatPartTypes,
): string {
  return parts.find((part) => part.type === type)?.value ?? ''
}

/**
 * Local calendar date as YYYY-MM-DD in the given IANA zone.
 * Uses Intl parts — never `toISOString()` / UTC getters — so America/Chicago
 * after local midnight is Monday even while UTC is still catching up, and the
 * reverse never prints yesterday.
 */
export function localDateKey(d = new Date(), timeZone = deviceTimeZone()): string {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(d)
  return `${pickPart(parts, 'year')}-${pickPart(parts, 'month')}-${pickPart(parts, 'day')}`
}

/** Civil (date-only) arithmetic — UTC calendar math on YYYY-MM-DD, not instants. */
export function addLocalDays(key: string, n: number): string {
  const { y, m, d } = parseDateKey(key)
  const next = new Date(Date.UTC(y, m - 1, d))
  next.setUTCDate(next.getUTCDate() + n)
  return `${next.getUTCFullYear()}-${pad2(next.getUTCMonth() + 1)}-${pad2(next.getUTCDate())}`
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

/**
 * Print a YYYY-MM-DD civil date. Format at UTC noon with timeZone UTC so a
 * date-only string is never parsed as UTC midnight (which is the previous
 * evening in America/Chicago).
 */
export function formatTrailDate(key: string): string {
  const { y, m, d } = parseDateKey(key)
  const utcNoon = new Date(Date.UTC(y, m - 1, d, 12, 0, 0))
  return new Intl.DateTimeFormat(undefined, {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    timeZone: 'UTC',
  }).format(utcNoon)
}
