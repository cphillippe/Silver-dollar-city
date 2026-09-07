import assert from 'node:assert/strict'
import {
  addLocalDays,
  formatTrailDate,
  localDateKey,
} from '../src/lib/dates.ts'

// Monday 00:30 America/Chicago = Monday 05:30 UTC (CDT, UTC-5 in September)
const chicagoMondayMorning = new Date('2026-09-07T05:30:00.000Z')
assert.equal(localDateKey(chicagoMondayMorning, 'America/Chicago'), '2026-09-07')
assert.equal(localDateKey(chicagoMondayMorning, 'UTC'), '2026-09-07')

// Sunday 23:30 America/Chicago = Monday 04:30 UTC — local calendar stays Sunday
const chicagoSundayNight = new Date('2026-09-07T04:30:00.000Z')
assert.equal(localDateKey(chicagoSundayNight, 'America/Chicago'), '2026-09-06')
assert.equal(localDateKey(chicagoSundayNight, 'UTC'), '2026-09-07')

const labeled = formatTrailDate('2026-09-07')
assert.match(labeled, /Monday/i)
assert.match(labeled, /September/i)
assert.match(labeled, /7/)

// The classic bug: Date.parse('YYYY-MM-DD') is UTC midnight → Sunday in Chicago
const isoParsed = new Date('2026-09-07')
const chicagoIso = new Intl.DateTimeFormat('en-US', {
  timeZone: 'America/Chicago',
  weekday: 'long',
  month: 'long',
  day: 'numeric',
}).format(isoParsed)
assert.match(chicagoIso, /Sunday/i)
assert.notEqual(formatTrailDate('2026-09-07'), chicagoIso)

assert.equal(addLocalDays('2026-09-07', 1), '2026-09-08')
assert.equal(addLocalDays('2026-09-07', -1), '2026-09-06')
assert.equal(addLocalDays('2026-09-30', 1), '2026-10-01')

console.log('dates ok')
