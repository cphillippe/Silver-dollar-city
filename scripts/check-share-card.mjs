/**
 * Easy share card. The text carries the line and the sayitback campaign.
 * The counter stays on the device. The button is never filled gold.
 */
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

const store = new Map()
globalThis.localStorage = {
  getItem(key) {
    return store.has(key) ? store.get(key) : null
  },
  setItem(key, value) {
    store.set(key, String(value))
  },
  removeItem(key) {
    store.delete(key)
  },
}

const {
  noteShareRecap,
  noteShareTap,
  readShareCounts,
  shareCardText,
  shareCardUrl,
  shareTapRate,
} = await import('../src/lib/shareCard.ts')

const learning = {
  claim: 'Neighbor is the one who shows mercy.',
  reason: 'The one who stops is the neighbor.',
  source: 'Luke 10:25–37',
}

const text = shareCardText(learning)
assert.match(text, /Neighbor is the one who shows mercy/)
assert.match(text, /Why: The one who stops is the neighbor/)
assert.match(text, /From: Luke 10:25–37/)
assert.match(text, /utm_campaign=sayitback/)
assert.doesNotMatch(text, /score|points|stars|streak|beat|dare|can you/i)

const url = shareCardUrl()
assert.match(url, /^https:\/\/cphillippe\.github\.io\/Silver-dollar-city\/\?/)
assert.doesNotMatch(url, /playtest|debug|nwSeed|cb=/)
assert.equal(text.endsWith(url), true)

assert.equal(shareTapRate(), 0)
noteShareRecap()
noteShareTap()
const saved = JSON.parse(localStorage.getItem('silver-city-share-v1'))
assert.deepEqual(saved, { recaps: 1, taps: 1 })
assert.deepEqual(readShareCounts(), { recaps: 1, taps: 1 }, 'the counter survives another read')
assert.equal(shareTapRate(), 1)

const cardSrc = readFileSync(new URL('../src/components/ShareCard.tsx', import.meta.url), 'utf8')
const libSrc = readFileSync(new URL('../src/lib/shareCard.ts', import.meta.url), 'utf8')
assert.doesNotMatch(cardSrc, /btn gold/)
assert.doesNotMatch(cardSrc, /btn primary/)
assert.match(cardSrc, /className="btn"/)
assert.doesNotMatch(`${cardSrc}\n${libSrc}`, /fetch\s*\(|sendBeacon/)

const lesson = readFileSync(new URL('../src/content/packs/pilate-stone-way.xml', import.meta.url), 'utf8')
const start = lesson.indexOf('<lesson id="psw-ossuary"')
const end = lesson.indexOf('</lesson>', start)
const block = lesson.slice(start, end)
assert.match(block, /easyOrder="95"/)
assert.match(block, /A first-century bone box reads: James, son of Joseph, brother of Jesus\./)
assert.match(block, /Galatians 1:19/)
assert.doesNotMatch(block, /A Jerusalem bone box names James/)
assert.doesNotMatch(block, /Israel Antiquities Authority/)
const index = readFileSync(new URL('../src/content/packs/index.xml', import.meta.url), 'utf8')
assert.match(index, /id="pilate-stone-way"[^>]*lessonCount="3"/)

console.log('check-share-card: ok')
