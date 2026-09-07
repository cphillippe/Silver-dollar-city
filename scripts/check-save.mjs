import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { adsAreVisible, adsEnabledDefault, AD_SLOTS, ADS_NEVER_COVER } from '../src/config/ads.ts'
import { APP_VERSION, SAVE_SCHEMA_VERSION } from '../src/config/app.ts'
import {
  encodeShareCode,
  parseIncomingSave,
  wrapSave,
} from '../src/lib/save.ts'

const pkg = JSON.parse(
  readFileSync(new URL('../package.json', import.meta.url), 'utf8'),
)
assert.equal(pkg.version, APP_VERSION, 'package.json version must match APP_VERSION')
assert.equal(SAVE_SCHEMA_VERSION, 1)

assert.equal(adsEnabledDefault, false)
assert.equal(adsAreVisible('default'), false)
assert.equal(adsAreVisible('on'), true)
assert.equal(adsAreVisible('off'), false)
assert.ok(AD_SLOTS['hub-banner'])
assert.ok(AD_SLOTS['after-daily'])
assert.ok(AD_SLOTS['between-districts'])
assert.ok(ADS_NEVER_COVER.some((line) => /takeaway/i.test(line)))
assert.ok(ADS_NEVER_COVER.some((line) => /Keep/i.test(line)))

const legacy = {
  started: true,
  completed: ['ph-road', 'ph-father'],
  journal: ['j-ph-1', 'j-ph-2'],
  firstTry: ['ph-road'],
  stars: { 'ph-road': 1, 'ph-father': 2 },
  dailyDates: ['2026-09-06'],
  lastDailyDate: '2026-09-06',
  streak: 1,
  bestStreak: 1,
  held: ['ph-road'],
  memory: {
    'ph-road': {
      id: 'ph-road',
      pillar: 'parable-hollow',
      intervalIndex: 0,
      nextReviewAt: '2026-09-07',
      reviews: 1,
      cleanRecalls: 0,
      elaborated: false,
    },
  },
  elaborations: { 'ph-road': 'mercy crosses the road' },
}

const fromLegacy = parseIncomingSave(JSON.stringify(legacy))
assert.equal(fromLegacy.ok, true)
if (!fromLegacy.ok) throw new Error('legacy parse')
assert.equal(fromLegacy.meta.source, 'legacy')
assert.equal(fromLegacy.meta.schemaVersion, SAVE_SCHEMA_VERSION)
assert.deepEqual(fromLegacy.progress.completed, ['ph-road', 'ph-father'])
assert.equal(fromLegacy.progress.stars['ph-father'], 2)
assert.equal(fromLegacy.progress.held[0], 'ph-road')
assert.equal(fromLegacy.progress.journal[1], 'j-ph-2')
assert.equal(fromLegacy.progress.dailyDates[0], '2026-09-06')
assert.equal(fromLegacy.progress.memory['ph-road']?.nextReviewAt, '2026-09-07')
assert.equal(fromLegacy.envelope.kind, 'silver-city-save')

const code = encodeShareCode(fromLegacy.envelope)
assert.match(code, /^SC1\./)
const fromCode = parseIncomingSave(code)
assert.equal(fromCode.ok, true)
if (!fromCode.ok) throw new Error('code parse')
assert.deepEqual(fromCode.progress.completed, legacy.completed)
assert.equal(fromCode.progress.stars['ph-road'], 1)
assert.equal(fromCode.progress.elaborations['ph-road'], 'mercy crosses the road')

const roundTrip = parseIncomingSave(JSON.stringify(wrapSave(fromLegacy.progress)))
assert.equal(roundTrip.ok, true)
if (!roundTrip.ok) throw new Error('envelope parse')
assert.equal(roundTrip.meta.source, 'envelope')
assert.deepEqual(roundTrip.progress.journal, legacy.journal)

const junk = parseIncomingSave('not-json')
assert.equal(junk.ok, false)

const shellSrc = readFileSync(new URL('../src/components/AppShell.tsx', import.meta.url), 'utf8')
assert.match(shellSrc, /view\.name === 'journal'/)
assert.match(shellSrc, /hideGoalbar/)

console.log('check-save: ok')
