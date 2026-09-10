import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { adsAreVisible, adsEnabledDefault, AD_SLOTS, ADS_NEVER_COVER } from '../src/config/ads.ts'
import { APP_VERSION, SAVE_SCHEMA_VERSION } from '../src/config/app.ts'
import {
  encodeShareCode,
  parseIncomingSave,
  SAVE_MAX_BYTES,
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
assert.equal(fromLegacy.progress.defense.cleared, 0)
assert.deepEqual(fromLegacy.progress.defense.nights, [])
assert.equal(fromLegacy.progress.theme, 'candy')
assert.equal(fromLegacy.progress.easyMode, false)
assert.deepEqual(fromLegacy.progress.learnings, [])
assert.equal(fromLegacy.progress.cityBuilt.porch, 2)
assert.equal(fromLegacy.progress.cityBuilt.hollow, 3)

const withBeat = {
  ...fromLegacy.progress,
  learnings: [
    {
      id: 'ph-road',
      claim: 'Neighbor is the one who shows mercy.',
      reason: 'Mercy crosses the road.',
      source: 'Luke 10:25–37',
      anchor: 'Mercy Wren · Parable Hollow',
      picture: 'heart',
      beat: 'neighbor is the one who shows mercy',
      toolId: 'love',
      acquiredAt: '2026-09-09',
    },
  ],
}
const beatTrip = parseIncomingSave(JSON.stringify(wrapSave(withBeat)))
assert.equal(beatTrip.ok, true)
if (!beatTrip.ok) throw new Error('beat parse')
assert.equal(beatTrip.progress.learnings[0]?.beat, 'neighbor is the one who shows mercy')
assert.equal(beatTrip.meta.schemaVersion, 1)

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

const easyOn = parseIncomingSave(
  JSON.stringify(wrapSave({ ...fromLegacy.progress, easyMode: true })),
)
assert.equal(easyOn.ok, true)
if (!easyOn.ok) throw new Error('easy parse')
assert.equal(easyOn.progress.easyMode, true)
assert.equal(easyOn.meta.schemaVersion, 1)

const junk = parseIncomingSave('not-json')
assert.equal(junk.ok, false)

const tooBig = parseIncomingSave('n'.repeat(SAVE_MAX_BYTES * 2))
assert.equal(tooBig.ok, false)

const future = parseIncomingSave(
  JSON.stringify({
    kind: 'silver-city-save',
    schemaVersion: SAVE_SCHEMA_VERSION + 8,
    appVersion: APP_VERSION,
    savedAt: '2026-09-07T00:00:00.000Z',
    progress: legacy,
  }),
)
assert.equal(future.ok, false)

const protoRaw = `{"kind":"silver-city-save","schemaVersion":1,"appVersion":"${APP_VERSION}","savedAt":"2026-09-07T00:00:00.000Z","progress":{"started":true,"completed":["ph-road"],"journal":[],"firstTry":[],"stars":{},"dailyDates":[],"streak":0,"bestStreak":0,"held":[],"memory":{"__proto__":{"id":"nope","pillar":"x","intervalIndex":0,"nextReviewAt":"2026-09-07","reviews":0,"cleanRecalls":0,"elaborated":false},"ph-road":{"id":"ph-road","pillar":"parable-hollow","intervalIndex":0,"nextReviewAt":"2026-09-07","reviews":1,"cleanRecalls":0,"elaborated":false}},"elaborations":{"constructor":"nope","ph-road":"mercy crosses the road"}}}`
const protoSave = parseIncomingSave(protoRaw)
assert.equal(protoSave.ok, true)
if (!protoSave.ok) throw new Error('proto skip')
assert.equal(Object.hasOwn(protoSave.progress.memory, '__proto__'), false)
assert.equal(Object.hasOwn(protoSave.progress.elaborations, 'constructor'), false)
assert.equal(protoSave.progress.elaborations['ph-road'], 'mercy crosses the road')
assert.equal(protoSave.progress.memory['ph-road']?.id, 'ph-road')

const settingsSrc = readFileSync(
  new URL('../src/components/Settings.tsx', import.meta.url),
  'utf8',
)
assert.match(settingsSrc, /window\.confirm/)
assert.match(settingsSrc, /Reset progress/)
assert.match(settingsSrc, /wipes the save/)
assert.match(settingsSrc, /Danger zone/)
assert.match(settingsSrc, /Open Profile/)
assert.match(settingsSrc, /name: 'profile'/)
assert.match(settingsSrc, /onFile/)
assert.match(settingsSrc, /file\.size > SAVE_MAX_BYTES/)
assert.match(settingsSrc, /Treat a share/)
assert.match(settingsSrc, /code like a secret/)
assert.match(settingsSrc, /setTheme/)
assert.match(settingsSrc, /Dusk town/)
assert.match(settingsSrc, /Clean parchment/)
assert.match(settingsSrc, /Easy mode/)
assert.match(settingsSrc, /setEasyMode/)
assert.match(settingsSrc, /eyebrow">Reading/)
assert.ok(
  settingsSrc.indexOf('eyebrow">Look') < settingsSrc.indexOf('Export JSON'),
  'Look picker should sit above export so a cold player can switch themes',
)

const shellSrc = readFileSync(new URL('../src/components/AppShell.tsx', import.meta.url), 'utf8')
assert.match(shellSrc, /view\.name === 'journal'/)
assert.match(shellSrc, /hideGoalbar/)
assert.doesNotMatch(shellSrc, />Reset</)
assert.match(shellSrc, /view\.name === 'profile'/)
assert.match(shellSrc, /data-easy/)

const welcomeSrc = readFileSync(
  new URL('../src/components/Welcome.tsx', import.meta.url),
  'utf8',
)
assert.match(welcomeSrc, /welcome-easy/)
assert.match(welcomeSrc, /setEasyMode/)
assert.match(welcomeSrc, /STORY\.purpose/)
assert.match(welcomeSrc, /STORY\.who/)

const capSrc = readFileSync(new URL('../capacitor.config.ts', import.meta.url), 'utf8')
assert.match(capSrc, /allowMixedContent:\s*false/)
assert.doesNotMatch(capSrc, /allowMixedContent:\s*true/)

const viteSrc = readFileSync(new URL('../vite.config.ts', import.meta.url), 'utf8')
assert.doesNotMatch(viteSrc, /allowedHosts:\s*true/)
assert.match(viteSrc, /\.trycloudflare\.com/)
assert.match(viteSrc, /Content-Security-Policy/)
assert.match(viteSrc, /script-src 'self'/)
assert.doesNotMatch(viteSrc, /script-src[^\\n]*unsafe-eval/)

const filePaths = readFileSync(
  new URL('../android/app/src/main/res/xml/file_paths.xml', import.meta.url),
  'utf8',
)
assert.doesNotMatch(filePaths, /external-path[^>]*path="\."/)
assert.match(filePaths, /path="share\/"/)

const androidIgnore = readFileSync(new URL('../android/.gitignore', import.meta.url), 'utf8')
assert.match(androidIgnore, /^\*\.jks$/m)
assert.match(androidIgnore, /^\*\.keystore$/m)
assert.match(androidIgnore, /^google-services\.json$/m)
assert.doesNotMatch(androidIgnore, /#\*\.jks/)

console.log('check-save: ok')
