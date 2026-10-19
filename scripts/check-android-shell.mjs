import assert from 'node:assert/strict'
import { existsSync, readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { APP_VERSION } from '../src/config/app.ts'
import { CHANGELOG, latestChange } from '../src/content/changelog.ts'
import { PAGES_APP_URL, SHELL_APK_URL, shellApkOffer, shellVersionCode } from '../src/config/shell.ts'
import { PAGES_APP_URL as PATCH_URL, withLivePagesShell } from './android-live-shell.mjs'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const read = (rel) => readFileSync(join(root, rel), 'utf8')

assert.equal(PATCH_URL, PAGES_APP_URL)
assert.equal(PAGES_APP_URL, 'https://cphillippe.github.io/Silver-dollar-city/')
assert.equal(new URL(PAGES_APP_URL).protocol, 'https:')
assert.equal(SHELL_APK_URL, 'https://github.com/cphillippe/Silver-dollar-city/releases/download/latest/silver-city.apk')

assert.equal(
  shellApkOffer({ inShell: false, installed: 1, remote: 9, dismissed: 0 }),
  null,
)
assert.equal(
  shellApkOffer({ inShell: true, installed: 114, remote: 114, dismissed: 0 }),
  null,
)
assert.equal(
  shellApkOffer({ inShell: true, installed: 114, remote: 115, dismissed: 115 }),
  null,
)
assert.equal(
  shellApkOffer({ inShell: true, installed: 114, remote: 115, dismissed: 114 }),
  SHELL_APK_URL,
)
assert.equal(
  shellApkOffer({ inShell: true, installed: 0, remote: 115, dismissed: 0 }),
  null,
)
assert.equal(
  shellApkOffer({ inShell: true, installed: 114, remote: 1.5, dismissed: 0 }),
  null,
)
assert.equal(shellVersionCode('1.4.433'), 104433)
assert.equal(shellVersionCode('1.4.113'), 104113)
assert.ok(shellVersionCode(APP_VERSION) < 1_000_000, 'the shell code stays inside the update card')
assert.equal(
  shellApkOffer({ inShell: true, installed: 114, remote: 104433, dismissed: 0 }),
  SHELL_APK_URL,
  'a real shell bump offers the apk to an install still on 114',
)
assert.equal(
  shellApkOffer({ inShell: true, installed: 104433, remote: 104433, dismissed: 0 }),
  null,
  'a town update with the same shell code stays quiet',
)
assert.equal(
  shellApkOffer({ inShell: false, installed: 114, remote: 104433, dismissed: 0 }),
  null,
  'the website does not offer the apk',
)

const patched = withLivePagesShell({
  appId: 'city.silver.unending',
  server: {
    url: 'http://evil.example/app',
    cleartext: true,
    allowNavigation: ['evil.example', 'https://example.com'],
  },
  android: { allowMixedContent: true },
})
assert.equal(patched.server.url, PAGES_APP_URL)
assert.equal(patched.server.cleartext, false)
assert.equal(patched.server.androidScheme, 'https')
assert.equal(patched.server.errorPath, 'index.html')
assert.equal(patched.server.allowNavigation, undefined)
assert.equal(patched.android.allowMixedContent, false)

const cap = read('capacitor.config.ts')
assert.doesNotMatch(cap, /server\s*:\s*\{/)
assert.doesNotMatch(cap, /url:\s*['"]http/)

const gradle = read('android/app/build.gradle')
assert.match(gradle, /versionName appVersion/)
assert.match(gradle, /versionCode derivedCode/)
assert.match(gradle, /package\.json/)
assert.doesNotMatch(gradle, /versionName "1\.4\.113"/)
assert.doesNotMatch(gradle, /versionCode 114\b/)
const shell = JSON.parse(read('public/shell.json'))
assert.equal(shell.versionCode, 104433)
assert.notEqual(
  shell.versionCode,
  shellVersionCode(APP_VERSION),
  '1.4.462 is a town change, so an install on 104433 is not nagged',
)
assert.ok(shell.versionCode > 114, 'the published shell is newer than installs stuck at 114')
assert.equal(Object.keys(shell).length, 1, 'shell.json carries versionCode only')

assert.match(gradle, /ANDROID_KEYSTORE_PATH/)
assert.match(gradle, /ANDROID_KEYSTORE_PASSWORD/)
assert.match(gradle, /ANDROID_KEY_ALIAS/)
assert.match(gradle, /ANDROID_KEY_PASSWORD/)
assert.match(gradle, /debuggable false/)
assert.doesNotMatch(gradle, /stableDebug|androiddebugkey|silver-city-debug/)
assert.doesNotMatch(gradle, /storePassword "android"|keyPassword "android"/)
assert.equal(existsSync(join(root, 'android/silver-city-debug.keystore')), false)

const manifest = read('android/app/src/main/AndroidManifest.xml')
assert.match(manifest, /usesCleartextTraffic="false"/)
assert.match(manifest, /allowBackup="false"/)
assert.doesNotMatch(manifest, /BILLING/)
assert.match(manifest, /network_security_config/)
assert.match(read('android/app/src/main/res/xml/network_security_config.xml'), /cleartextTrafficPermitted="false"/)

const activity = read('android/app/src/main/java/city/silver/unending/MainActivity.java')
assert.match(activity, /SilverCityShell/)
assert.match(activity, /getVersionCode/)
assert.match(activity, /cphillippe\.github\.io/)
assert.match(activity, /\/Silver-dollar-city/)
assert.match(activity, /removeWebMessageListener/)
assert.match(activity, /removeJavascriptInterface\("androidBridge"\)/)
assert.match(activity, /removeJavascriptInterface\("CapacitorHttpAndroidInterface"\)/)
assert.match(activity, /removeJavascriptInterface\("CapacitorCookiesAndroidInterface"\)/)
assert.match(activity, /removeJavascriptInterface\("CapacitorSystemBarsAndroidInterface"\)/)
assert.match(activity, /ACTION_VIEW/)
assert.match(activity, /bridge\.setWebViewClient/)
assert.doesNotMatch(activity, /addJavascriptInterface\([^)]*androidBridge/)

const main = read('src/main.tsx')
assert.match(main, /inAndroidShell\(\)/)
assert.match(main, /!Capacitor\.isNativePlatform\(\)/)
assert.match(main, /registerSW\(\{ immediate: true \}\)/)
assert.match(main, /unregister\(\)/)

const notice = read('src/components/ShellUpdateNotice.tsx')
assert.match(notice, /Update available/)
assert.match(notice, /Get the update/)
assert.match(notice, /href=\{SHELL_APK_URL\}/)
assert.doesNotMatch(notice, /window\.open|location\.href\s*=/)
assert.doesNotMatch(notice, /href=\{apkUrl\}/)

const vite = read('vite.config.ts')
assert.match(vite, /"script-src 'self'"/)
assert.match(vite, /"connect-src 'self'"/)
assert.doesNotMatch(vite, /script-src[^"\n]*unsafe-eval/)

const workflow = read('.github/workflows/android-apk.yml')
for (const name of [
  'ANDROID_KEYSTORE_B64',
  'ANDROID_KEYSTORE_PASSWORD',
  'ANDROID_KEY_ALIAS',
  'ANDROID_KEY_PASSWORD',
]) {
  assert.match(workflow, new RegExp(name))
}
assert.match(workflow, /permissions:\n {2}contents: read/)
assert.match(workflow, /cancel-in-progress: \$\{\{ github\.ref != 'refs\/heads\/main' \}\}/)
assert.doesNotMatch(workflow, /actions:\s*write/)
assert.doesNotMatch(workflow, /ANDROID_KEYSTORE_BASE64/)
assert.doesNotMatch(workflow, /silver-city-debug|androiddebugkey/)
assert.doesNotMatch(workflow, /assembleDebug/)
assert.doesNotMatch(workflow, /ANDROID_KEYSTORE_PASSWORD<<EOF/)
assert.match(workflow, /assembleRelease/)
assert.match(workflow, /ci-throwaway\.keystore/)
assert.match(workflow, /Refusing to publish/)
assert.match(workflow, /runs-on: ubuntu-24\.04/)
assert.doesNotMatch(workflow, /ubuntu-latest/)
assert.match(workflow, /actions\/checkout@3d3c42e5aac5ba805825da76410c181273ba90b1/)
assert.match(workflow, /actions\/setup-node@949feb2413d6458794dcd2491c4babbbce0c15c1/)
assert.match(workflow, /actions\/setup-java@de7274f081f381c8f8158605e0321c36c376e2e6/)
assert.match(workflow, /actions\/upload-artifact@cf430e030ddbb5b0abf93d22962f4752f3646cd9/)
assert.doesNotMatch(workflow, /actions\/(?:checkout|setup-node|setup-java|upload-artifact)@v\d/)
assert.doesNotMatch(workflow, /release delete/)
assert.match(workflow, /gh release upload latest/)
assert.match(workflow, /--clobber/)
assert.match(workflow, /github\.ref == 'refs\/heads\/main'/)
assert.match(workflow, /github\.event_name != 'pull_request'/)
assert.match(workflow, /paths-ignore:\n\s+- '\*\*\.md'\n\s+- 'docs\/\*\*'/)
assert.match(workflow, /environment: release/)
const publishAt = workflow.indexOf('\n  publish:')
assert.ok(publishAt > 0, 'publish job exists')
const apkPart = workflow.slice(0, publishAt)
const publishPart = workflow.slice(publishAt)
assert.doesNotMatch(apkPart, /secrets\.ANDROID_/)
assert.doesNotMatch(apkPart, /environment:/)
assert.match(apkPart, /upload-artifact/)
assert.match(publishPart, /environment: release/)
assert.match(publishPart, /contents: write/)
assert.match(publishPart, /needs: apk/)
assert.doesNotMatch(publishPart, /upload-artifact/)
assert.equal(workflow.indexOf('contents: write') > publishAt, true)
const uploadAt = publishPart.indexOf('gh release upload latest')
const moveAt = publishPart.indexOf('git push origin refs/tags/latest --force')
assert.ok(uploadAt > 0 && moveAt > uploadAt, 'the new asset is uploaded before the latest tag moves')

const readme = read('README.md')
assert.match(readme, /releases\/download\/latest\/silver-city\.apk/)
assert.match(readme, /Install unknown apps/)
assert.match(readme, /Update available/)
assert.match(readme, /ANDROID_KEYSTORE_B64/)
assert.match(readme, /environment named `release`/)
assert.doesNotMatch(readme, /ANDROID_KEYSTORE_BASE64|silver-city-debug\.keystore/)

assert.equal(APP_VERSION, '1.4.508')
const pkg = JSON.parse(read('package.json'))
assert.equal(pkg.dependencies['@capacitor/share'], '^8.0.3')
const settingsGradle = read('android/capacitor.settings.gradle')
assert.match(settingsGradle, /include ':capacitor-share'/)
assert.match(settingsGradle, /node_modules\/@capacitor\/share\/android/)
const capBuild = read('android/app/capacitor.build.gradle')
assert.match(capBuild, /implementation project\(':capacitor-share'\)/)
assert.match(activity, /addWebMessageListener/)
assert.match(activity, /"Share"\.equals\(pluginId\)/)
assert.match(activity, /plugin not available/)
assert.match(activity, /Intent\.ACTION_SEND/)
assert.match(activity, /Share canceled/)
assert.doesNotMatch(activity, /callPluginMethod/)
assert.doesNotMatch(read('android/app/src/main/AndroidManifest.xml'), /admob|play-services-ads/i)
assert.match(activity, /SHARE_MESSAGE_MAX = 16384/)
assert.match(activity, /raw\.length\(\) > SHARE_MESSAGE_MAX/)
assert.match(activity, /share message too large/)
assert.match(activity, /SHARE_TEXT_MAX = 2000/)
assert.match(activity, /SHARE_TITLE_MAX = 200/)
assert.match(activity, /share text too long/)
assert.match(activity, /share title too long/)
assert.doesNotMatch(activity, /text\.substring|title\.substring|dialogTitle\.substring/)
assert.doesNotMatch(activity, /startsWith\("http"\)/)
assert.doesNotMatch(activity, /jsonString\(options, "url"\)/)
assert.match(activity, /PAGES_SHARE_URL = "https:\/\/cphillippe\.github\.io\/Silver-dollar-city\/"/)
assert.match(activity, /if \(shareListenerReady\) return/)
assert.match(activity, /if \(!shareListenerReady\)/)
assert.match(activity, /!WebViewFeature\.isFeatureSupported\(WebViewFeature\.WEB_MESSAGE_LISTENER\)/)
assert.equal((activity.match(/addWebMessageListener/g) || []).length, 1, 'the share listener is registered once')
const featureAt = activity.indexOf('!WebViewFeature.isFeatureSupported(WebViewFeature.WEB_MESSAGE_LISTENER)')
const addListenerAt = activity.indexOf('addWebMessageListener')
assert.ok(featureAt >= 0 && featureAt < addListenerAt, 'unsupported WebViews never register a listener')
const handleAt = activity.indexOf('void handleShareMessage')
const finishAt = activity.indexOf('void finishShare')
const handle = activity.slice(handleAt, finishAt)
const sizeAt = handle.indexOf('raw.length() > SHARE_MESSAGE_MAX')
const parseAt = handle.indexOf('new JSONObject(raw)')
const textAt = handle.indexOf('text.length() > SHARE_TEXT_MAX')
const titleAt = handle.indexOf('title.length() > SHARE_TITLE_MAX')
const dialogAt = handle.indexOf('dialogTitle.length() > SHARE_TITLE_MAX')
assert.ok(sizeAt >= 0 && sizeAt < parseAt, 'an oversize message is rejected before JSONObject')
assert.ok(parseAt < textAt && textAt < titleAt && titleAt < dialogAt, 'caps run after parse and fail the call')
assert.match(handle, /\.fail\("share message too large"\)/)
assert.match(handle, /call\.fail\("share text too long"\)/)
assert.match(handle, /call\.fail\("share title too long"\)/)
assert.doesNotMatch(handle, /substring\(/)
assert.doesNotMatch(handle, /jsonString\(options, "url"\)/)
assert.match(handle, /body = PAGES_SHARE_URL/)

const messageMax = Number(activity.match(/SHARE_MESSAGE_MAX = (\d+)/)[1])
const textMax = Number(activity.match(/SHARE_TEXT_MAX = (\d+)/)[1])
const titleMax = Number(activity.match(/SHARE_TITLE_MAX = (\d+)/)[1])
const pagesUrl = activity.match(/PAGES_SHARE_URL = "([^"]+)"/)[1]
assert.equal(messageMax, 16384)
assert.equal(textMax, 2000)
assert.equal(titleMax, 200)
assert.equal(pagesUrl, 'https://cphillippe.github.io/Silver-dollar-city/')

/** Mirrors handleShareMessage's reject-or-body rules. The Java source above is the lock. */
function sharePayload(raw) {
  if (raw != null && raw.length > messageMax) return { error: 'share message too large' }
  let post
  try {
    post = raw == null ? {} : JSON.parse(raw)
  } catch {
    return { dropped: true }
  }
  const field = (object, key) => {
    if (!object || !Object.prototype.hasOwnProperty.call(object, key) || object[key] == null) return null
    if (typeof object[key] !== 'string' || object[key] === '') return null
    return object[key]
  }
  const options = post.options && typeof post.options === 'object' ? post.options : {}
  const title = field(options, 'title')
  const text = field(options, 'text')
  const dialogTitle = field(options, 'dialogTitle')
  if (text != null && text.length > textMax) return { error: 'share text too long' }
  if (title != null && title.length > titleMax) return { error: 'share title too long' }
  if (dialogTitle != null && dialogTitle.length > titleMax) return { error: 'share title too long' }
  let body = text
  if (body == null) body = pagesUrl
  else if (!body.includes(pagesUrl)) body = `${body}\n${pagesUrl}`
  return { body, sawPageUrl: Object.prototype.hasOwnProperty.call(options, 'url') }
}

const shareMessage = (options) => JSON.stringify({ pluginId: 'Share', methodName: 'share', options })
assert.equal(sharePayload('x'.repeat(messageMax + 1)).error, 'share message too large')
assert.equal(
  sharePayload(shareMessage({ text: 'hi' }).padEnd(messageMax + 1, ' ')).error,
  'share message too large',
)
assert.equal(sharePayload(shareMessage({ text: 'y'.repeat(textMax + 1) })).error, 'share text too long')
assert.equal(sharePayload(shareMessage({ text: 'ok', title: 't'.repeat(titleMax + 1) })).error, 'share title too long')
assert.equal(
  sharePayload(shareMessage({ text: 'ok', dialogTitle: 'd'.repeat(titleMax + 1) })).error,
  'share title too long',
)
const exact = sharePayload(shareMessage({ text: 'z'.repeat(textMax), title: 't'.repeat(titleMax) }))
assert.equal(exact.error, undefined, 'a payload on the cap still shares')
assert.equal(exact.body.startsWith('z'.repeat(textMax)), true)
const poisoned = sharePayload(
  shareMessage({ text: 'Say it back', url: 'https://evil.example/phish', title: 'Nope' }),
)
assert.equal(poisoned.sawPageUrl, true)
assert.equal(poisoned.body, `Say it back\n${pagesUrl}`)
assert.doesNotMatch(poisoned.body, /evil\.example/)
const javascriptUrl = sharePayload(shareMessage({ text: 'Line', url: 'javascript:alert(1)' }))
assert.equal(javascriptUrl.body, `Line\n${pagesUrl}`)
assert.doesNotMatch(javascriptUrl.body, /javascript:/)
const already = sharePayload(shareMessage({ text: `Line\n${pagesUrl}`, url: 'http://localhost/other' }))
assert.equal(already.body, `Line\n${pagesUrl}`, 'a page url is ignored when the text already names Pages')
assert.match(read('android/app/src/main/res/values/ic_launcher_background.xml'), /#2A1650/)
assert.match(read('index.html'), /favicon\.png/)
assert.match(read('index.html'), /apple-touch-icon\.png/)
assert.ok(existsSync(new URL('../public/brand/icon-1024.png', import.meta.url)))
assert.ok(existsSync(new URL('../public/brand/wordmark-a-v2.png', import.meta.url)))
assert.ok(existsSync(new URL('../public/favicon.png', import.meta.url)))
assert.ok(existsSync(new URL('../public/icon-maskable-512.png', import.meta.url)))
assert.doesNotMatch(read('index.html'), /favicon\.svg/)
const pngSize = (rel) => {
  const buf = readFileSync(join(root, rel))
  return [buf.readUInt32BE(16), buf.readUInt32BE(20)]
}
assert.deepEqual(pngSize('public/brand/icon-1024.png'), [1024, 1024])
assert.deepEqual(pngSize('public/brand/wordmark-a-v2.png'), [1280, 720])
assert.deepEqual(pngSize('public/favicon.png'), [32, 32])
assert.deepEqual(pngSize('public/apple-touch-icon.png'), [180, 180])
assert.deepEqual(pngSize('public/icon-192.png'), [192, 192])
assert.deepEqual(pngSize('public/icon-512.png'), [512, 512])
assert.deepEqual(pngSize('public/icon-maskable-512.png'), [512, 512])
assert.deepEqual(pngSize('android/app/src/main/res/mipmap-xxxhdpi/ic_launcher.png'), [192, 192])
assert.deepEqual(pngSize('android/app/src/main/res/mipmap-xxxhdpi/ic_launcher_foreground.png'), [432, 432])
assert.deepEqual(pngSize('android/app/src/main/res/mipmap-mdpi/ic_launcher_foreground.png'), [108, 108])
assert.ok(CHANGELOG.some((note) => note.version === '1.4.426'))
assert.match(latestChange('1.4.426').items.join('\n'), /download/)
assert.ok(CHANGELOG.some((note) => note.version === '1.4.425'))
assert.match(latestChange('1.4.425').items.join('\n'), /Update available/)
assert.doesNotMatch(latestChange('1.4.427').items.join('\n'), /Fixes #|Closes #|Resolves #/)

console.log('check-android-shell: ok')
