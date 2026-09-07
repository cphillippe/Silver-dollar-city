import assert from 'node:assert/strict'
import {
  DATE_SOURCE,
  addLocalDays,
  formatDeviceLocalDate,
  formatTrailDate,
  localDateKey,
} from '../src/lib/dates.ts'

assert.equal(DATE_SOURCE, 'device-local-getters')

const tz = process.env.TZ || Intl.DateTimeFormat().resolvedOptions().timeZone

// 00:50 America/Chicago Mon Sep 7 2026 == 05:50 UTC Monday (CDT, UTC-5)
const chicagoMonday0050 = new Date('2026-09-07T05:50:00.000Z')
// UTC already Monday, local Chicago still Sunday: 23:50 CDT Sep 6
const chicagoSunday2350 = new Date('2026-09-07T04:50:00.000Z')

if (tz === 'America/Chicago') {
  assert.equal(chicagoMonday0050.getFullYear(), 2026)
  assert.equal(chicagoMonday0050.getMonth(), 8)
  assert.equal(chicagoMonday0050.getDate(), 7)
  assert.equal(localDateKey(chicagoMonday0050), '2026-09-07')
  assert.match(formatDeviceLocalDate(chicagoMonday0050), /Monday/i)
  assert.match(formatDeviceLocalDate(chicagoMonday0050), /September/i)
  assert.match(formatDeviceLocalDate(chicagoMonday0050), /7/)
  assert.match(formatTrailDate(localDateKey(chicagoMonday0050)), /Monday/i)

  // Local midnight after UTC has already rolled to Monday → still Monday
  const localMidnightMonday = new Date(2026, 8, 7, 0, 50, 0)
  assert.equal(localDateKey(localMidnightMonday), '2026-09-07')
  assert.match(formatDeviceLocalDate(localMidnightMonday), /Monday/i)

  assert.equal(chicagoSunday2350.getDate(), 6)
  assert.equal(localDateKey(chicagoSunday2350), '2026-09-06')
  assert.match(formatDeviceLocalDate(chicagoSunday2350), /Sunday/i)

  // The leftover bug: date-only ISO is UTC midnight → Sunday evening in Chicago
  const isoTrap = new Date('2026-09-07')
  assert.equal(isoTrap.getDate(), 6)
  assert.match(formatDeviceLocalDate(isoTrap), /Sunday/i)
  assert.notEqual(
    formatDeviceLocalDate(chicagoMonday0050),
    formatDeviceLocalDate(isoTrap),
  )
} else if (tz === 'UTC') {
  assert.equal(localDateKey(chicagoMonday0050), '2026-09-07')
  assert.match(formatDeviceLocalDate(chicagoMonday0050), /Monday/i)
  assert.equal(localDateKey(chicagoSunday2350), '2026-09-07')
}

assert.equal(addLocalDays('2026-09-07', 1), '2026-09-08')
assert.equal(addLocalDays('2026-09-07', -1), '2026-09-06')
assert.equal(addLocalDays('2026-09-30', 1), '2026-10-01')
assert.match(formatTrailDate('2026-09-07'), /Monday/i)

console.log('dates ok', tz)
