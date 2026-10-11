/**
 * Runs every check-city scan, including ones after the first miss.
 * CI fails when the failing set is not exactly ALLOWED_CITY_SCANS.
 * Keep that list empty so a new miss cannot hide behind an older one.
 */
import { register } from 'node:module'
import { pathToFileURL } from 'node:url'

/** Failing scan messages CI still allows. Keep this empty. */
export const ALLOWED_CITY_SCANS = []

globalThis.__CITY_SCAN_FAILURES = []
await register(new URL('./city-scan-hook.mjs', import.meta.url), pathToFileURL(import.meta.url).href)

const probe = await import('node:assert/strict')
try {
  probe.default.equal(1, 2, 'hook-probe')
} catch {
  console.error('check-city-scans: assert hook did not wrap node:assert/strict')
  process.exit(1)
}
if (!globalThis.__CITY_SCAN_FAILURES.includes('hook-probe')) {
  console.error('check-city-scans: assert hook did not record a miss')
  process.exit(1)
}
globalThis.__CITY_SCAN_FAILURES.length = 0

try {
  await import('./check-city.mjs')
} catch (err) {
  console.error(err)
  process.exit(1)
}

const actual = [...globalThis.__CITY_SCAN_FAILURES].sort()
const allowed = [...ALLOWED_CITY_SCANS].sort()
const same =
  actual.length === allowed.length && actual.every((item, index) => item === allowed[index])
if (!same) {
  console.error(`check-city-scans: ${actual.length} failing, allowlist is ${allowed.length}`)
  for (const item of actual) console.error(`FAIL ${item}`)
  process.exit(1)
}
console.log(`check-city-scans: ${actual.length} failing scans`)
