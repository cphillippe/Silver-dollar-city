/**
 * Easy share card. The text carries the line and the sayitback campaign.
 * The counter stays on the device. The button is never filled gold.
 * Android calls Share.share. The website uses navigator.share, then copy.
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

const nativeCalls = []
let nativeHandler = async () => ({ activityType: 'test' })
globalThis.androidBridge = { postMessage() {} }
globalThis.Capacitor = {
  PluginHeaders: [
    {
      name: 'Share',
      methods: [
        { name: 'share', rtype: 'promise' },
        { name: 'canShare', rtype: 'promise' },
      ],
    },
  ],
  nativePromise(pluginName, methodName, options) {
    nativeCalls.push({ pluginName, methodName, options })
    return nativeHandler(pluginName, methodName, options)
  },
}

const navCalls = []
const clip = []
function installNavigator({ share } = {}) {
  navCalls.length = 0
  clip.length = 0
  const clipboard = {
    writeText: async (text) => {
      clip.push(text)
    },
  }
  if (share) {
    navigator.share = share
  } else {
    delete navigator.share
  }
  navigator.clipboard = clipboard
}

const {
  noteShareRecap,
  noteShareTap,
  readShareCounts,
  setShareNativeTimeoutForTest,
  SHARE_NATIVE_TIMEOUT_MS,
  shareCardText,
  shareCardUrl,
  shareLine,
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

function resetNative() {
  nativeCalls.length = 0
  nativeHandler = async () => ({ activityType: 'test' })
}

installNavigator({
  share: async (data) => {
    navCalls.push(data)
  },
})
resetNative()
delete globalThis.window
assert.equal(await shareLine(learning), 'shared', 'web share resolves')
assert.equal(nativeCalls.length, 0, 'web path does not call Share.share')
assert.equal(navCalls.length, 1, 'web path uses navigator.share')
assert.equal(navCalls[0].title, 'Say it back tomorrow')
assert.equal(navCalls[0].text, text)
assert.equal(navCalls[0].url, url)
assert.equal(clip.length, 0)

installNavigator({
  share: async () => {
    const error = new Error('The user aborted a request.')
    error.name = 'AbortError'
    throw error
  },
})
resetNative()
assert.equal(await shareLine(learning), 'idle', 'web cancel is not an error')
assert.equal(clip.length, 0, 'web cancel does not copy')
assert.equal(nativeCalls.length, 0)

installNavigator()
resetNative()
assert.equal(await shareLine(learning), 'copied', 'web without navigator.share copies')
assert.equal(clip.length, 1)
assert.equal(clip[0], text)
const fallbackClip = clip[0]

function enterShell(native, { bridge = true } = {}) {
  const shell = { getVersionCode() { return 104507 } }
  const win = { SilverCityShell: shell }
  if (bridge) win.androidBridge = { postMessage() {} }
  if (native !== 'missing') win.Capacitor = { isNativePlatform: () => native }
  globalThis.window = win
}

installNavigator({
  share: async (data) => {
    navCalls.push(data)
  },
})
resetNative()
enterShell(true)
assert.equal(await shareLine(learning), 'shared', 'native share resolves')
assert.equal(nativeCalls.length, 1, 'Android shell calls Share.share')
assert.equal(nativeCalls[0].pluginName, 'Share')
assert.equal(nativeCalls[0].methodName, 'share')
assert.equal(nativeCalls[0].options.title, 'Say it back tomorrow')
assert.equal(nativeCalls[0].options.text, text, 'Share.share receives the line text')
assert.equal(nativeCalls[0].options.url, url, 'Share.share receives the URL')
assert.equal(navCalls.length, 0, 'native path does not use navigator.share')
assert.equal(clip.length, 0)

resetNative()
nativeHandler = async () => {
  throw new Error('Share canceled')
}
assert.equal(await shareLine(learning), 'idle', 'native cancel shows no toast')
assert.equal(clip.length, 0, 'native cancel does not copy')
assert.equal(nativeCalls.length, 1)

resetNative()
nativeHandler = async () => {
  throw new Error('Share plugin missing')
}
assert.equal(await shareLine(learning), 'copied', 'a thrown native plugin copies')
assert.equal(clip.length, 1)
assert.equal(clip[0], text)
assert.equal(navCalls.length, 0)

installNavigator({
  share: async (data) => {
    navCalls.push(data)
  },
})
resetNative()
enterShell(false)
assert.equal(await shareLine(learning), 'shared', 'shell that is not native stays on the web path')
assert.equal(nativeCalls.length, 0)
assert.equal(navCalls.length, 1)
assert.equal(navCalls[0].text, text)
assert.equal(navCalls[0].url, url)

resetNative()
enterShell('missing')
assert.equal(await shareLine(learning), 'shared', 'shell without isNativePlatform still uses Share.share')
assert.equal(nativeCalls.length, 1)
assert.equal(nativeCalls[0].options.text, text)
assert.equal(nativeCalls[0].options.url, url)

installNavigator({
  share: async (data) => {
    navCalls.push(data)
  },
})
resetNative()
enterShell(true, { bridge: false })
assert.equal(await shareLine(learning), 'shared', 'a missing bridge uses the web share path')
assert.equal(nativeCalls.length, 0, 'a missing bridge does not call Share.share')
assert.equal(navCalls.length, 1)
assert.equal(navCalls[0].text, text)
assert.equal(navCalls[0].url, url)

installNavigator({
  share: async (data) => {
    navCalls.push(data)
  },
})
resetNative()
enterShell(true)
setShareNativeTimeoutForTest(40)
try {
  assert.equal(await shareLine(learning), 'shared', 'a reply at launch resolves')
  await new Promise((resolve) => setTimeout(resolve, 80))
  assert.equal(nativeCalls.length, 1, 'the native call happened once')
  assert.equal(navCalls.length, 0, 'a launch reply does not open a second share sheet')
  assert.equal(clip.length, 0, 'a launch reply does not copy or toast')
} finally {
  setShareNativeTimeoutForTest(null)
}

installNavigator({
  share: async (data) => {
    navCalls.push(data)
  },
})
resetNative()
nativeHandler = () => new Promise(() => {})
enterShell(true)
setShareNativeTimeoutForTest(30)
try {
  assert.equal(await shareLine(learning), 'shared', 'a bridge that never answers falls back to Web Share')
  assert.equal(nativeCalls.length, 1, 'the native call was attempted')
  assert.equal(navCalls.length, 1, 'timeout uses navigator.share')
  assert.equal(navCalls[0].text, text)
  assert.equal(clip.length, 0)
} finally {
  setShareNativeTimeoutForTest(null)
}

installNavigator()
resetNative()
nativeHandler = () => new Promise(() => {})
enterShell(true)
setShareNativeTimeoutForTest(30)
try {
  assert.equal(await shareLine(learning), 'copied', 'a timeout with no Web Share copies')
  assert.equal(clip.length, 1)
  assert.equal(clip[0], text)
  assert.equal(navCalls.length, 0)
} finally {
  setShareNativeTimeoutForTest(null)
}

async function waitForShareCall(list) {
  for (let i = 0; i < 20 && list.length < 1; i += 1) {
    await new Promise((resolve) => setTimeout(resolve, 0))
  }
}

let releaseWeb = () => {}
installNavigator({
  share: (data) =>
    new Promise((resolve) => {
      navCalls.push(data)
      releaseWeb = resolve
    }),
})
resetNative()
delete globalThis.window
try {
  const firstWeb = shareLine(learning)
  await waitForShareCall(navCalls)
  assert.equal(navCalls.length, 1, 'the first web tap calls navigator.share once')
  assert.equal(nativeCalls.length, 0, 'the web tap does not call Share.share')
  assert.equal(await shareLine(learning), 'copied', 'a second web tap while sharing copies')
  assert.equal(navCalls.length, 1, 'a second web tap adds no navigator.share call')
  assert.equal(nativeCalls.length, 0, 'a second web tap does not call Share.share')
  assert.equal(clip.length, 1, 'a second web tap writes the clipboard once')
  assert.equal(clip[0], fallbackClip, 'busy-tap clipboard write === the no-navigator.share fallback')
  releaseWeb()
  assert.equal(await firstWeb, 'shared', 'the first web share still resolves')
  installNavigator({
    share: async (data) => {
      navCalls.push(data)
    },
  })
  delete globalThis.window
  assert.equal(await shareLine(learning), 'shared', 'after the web share resolves the next tap shares')
  assert.equal(navCalls.length, 1, 'the tap after resolve calls navigator.share again')
} finally {
  releaseWeb()
}

installNavigator({
  share: async () => {
    navCalls.push('cancel')
    const error = new Error('The user aborted a request.')
    error.name = 'AbortError'
    throw error
  },
})
resetNative()
delete globalThis.window
assert.equal(await shareLine(learning), 'idle', 'a web cancel still stays quiet')
installNavigator({
  share: async (data) => {
    navCalls.push(data)
  },
})
delete globalThis.window
assert.equal(await shareLine(learning), 'shared', 'after a web cancel the next tap shares')
assert.equal(navCalls.length, 1)

let releaseNative = () => {}
installNavigator({
  share: async (data) => {
    navCalls.push(data)
  },
})
resetNative()
nativeHandler = () =>
  new Promise((resolve) => {
    releaseNative = () => resolve({ activityType: 'test' })
  })
enterShell(true)
try {
  const firstNative = shareLine(learning)
  await waitForShareCall(nativeCalls)
  assert.equal(nativeCalls.length, 1, 'the shell stub calls Share.share once')
  assert.equal(navCalls.length, 0, 'the shell stub does not call navigator.share')
  assert.equal(await shareLine(learning), 'copied', 'a second shell tap while sharing copies')
  assert.equal(nativeCalls.length, 1, 'a second shell tap adds no Share.share call')
  assert.equal(navCalls.length, 0, 'a second shell tap adds no navigator.share call')
  assert.equal(clip.length, 1, 'a second shell tap writes the clipboard once')
  assert.equal(clip[0], fallbackClip, 'shell busy-tap clipboard write === the no-navigator.share fallback')
  releaseNative()
  assert.equal(await firstNative, 'shared', 'the first native share still resolves')
  nativeCalls.length = 0
  navCalls.length = 0
  clip.length = 0
  nativeHandler = async () => ({ activityType: 'test' })
  assert.equal(await shareLine(learning), 'shared', 'after the native share resolves the next tap shares')
  assert.equal(nativeCalls.length, 1, 'the tap after native resolve calls Share.share again')
  assert.equal(navCalls.length, 0)
} finally {
  releaseNative()
}

installNavigator({
  share: async (data) => {
    navCalls.push(data)
  },
})
resetNative()
nativeHandler = async () => {
  throw new Error("Can't share while sharing is in progress")
}
enterShell(true)
assert.equal(await shareLine(learning), 'copied', 'a native in-progress reject copies')
assert.equal(nativeCalls.length, 1, 'the in-progress reject is the one Share.share call')
assert.equal(navCalls.length, 0, 'a native in-progress reject does not call navigator.share')
assert.equal(clip.length, 1)
assert.equal(clip[0], text)
nativeCalls.length = 0
navCalls.length = 0
clip.length = 0
nativeHandler = async () => ({ activityType: 'test' })
assert.equal(await shareLine(learning), 'shared', 'after the in-progress reject the next tap shares')
assert.equal(nativeCalls.length, 1)
assert.equal(navCalls.length, 0)

const cardSrc = readFileSync(new URL('../src/components/ShareCard.tsx', import.meta.url), 'utf8')
const libSrc = readFileSync(new URL('../src/lib/shareCard.ts', import.meta.url), 'utf8')
assert.doesNotMatch(cardSrc, /btn gold/)
assert.doesNotMatch(cardSrc, /btn primary/)
assert.match(cardSrc, /className="btn"/)
assert.match(cardSrc, /Share this line/)
assert.match(cardSrc, /Copied\. Paste it to a friend\./)
assert.equal((cardSrc.match(/onClick=/g) || []).length, 1, 'the share button has one onClick')
assert.match(cardSrc, /result === 'shared'/)
assert.match(cardSrc, /result === 'copied'/)
assert.match(libSrc, /let sharing = false/)
assert.match(libSrc, /if \(sharing\) return copyShareText\(shareCardText\(learning\)\)/)
assert.doesNotMatch(cardSrc, /result === 'idle'/)
assert.match(libSrc, /Share\.share\(\{ title, text, url \}\)/)
assert.match(libSrc, /inAndroidShell\(\)/)
assert.match(libSrc, /isNativePlatform/)
assert.match(libSrc, /navigator\.share/)
assert.match(libSrc, /androidBridge/)
assert.match(libSrc, /share timed out/)
assert.equal(SHARE_NATIVE_TIMEOUT_MS, 3000)
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

const inviteSrc = readFileSync(new URL('../src/components/ShareInvite.tsx', import.meta.url), 'utf8')
assert.match(inviteSrc, /shareInviteUrl/)
assert.doesNotMatch(inviteSrc, /location\.href/)
const { shareInviteUrl, sharePitch } = await import('../src/lib/shareInvite.ts')
assert.equal(shareInviteUrl(), 'https://cphillippe.github.io/Silver-dollar-city/')
globalThis.window = {
  location: { href: 'https://localhost/Silver-dollar-city/?nwDebug=1&playtest=1#debug' },
}
const pitched = sharePitch()
const sharedUrl = pitched.slice(pitched.lastIndexOf('\n') + 1)
const shared = new URL(sharedUrl)
assert.equal(shared.search, '')
assert.equal(shared.hash, '')
assert.equal(sharedUrl, 'https://cphillippe.github.io/Silver-dollar-city/')

console.log('check-share-card: ok')
