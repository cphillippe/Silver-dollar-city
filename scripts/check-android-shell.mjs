import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { APP_VERSION } from '../src/config/app.ts'
import { CHANGELOG, latestChange } from '../src/content/changelog.ts'
import { PAGES_APP_URL, SHELL_APK_URL, shellApkOffer } from '../src/config/shell.ts'
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
assert.match(gradle, /versionName "1\.4\.113"/)
const versionCode = Number(gradle.match(/versionCode\s+(\d+)/)?.[1])
const shell = JSON.parse(read('public/shell.json'))
assert.equal(shell.versionCode, versionCode)
assert.ok(versionCode >= 114)
assert.equal(Object.keys(shell).length, 1, 'shell.json carries versionCode only')

assert.match(gradle, /stableDebug/)
assert.match(gradle, /ANDROID_KEYSTORE_PATH/)
assert.match(gradle, /debuggable false/)

const manifest = read('android/app/src/main/AndroidManifest.xml')
assert.match(manifest, /usesCleartextTraffic="false"/)
assert.match(manifest, /network_security_config/)
assert.match(read('android/app/src/main/res/xml/network_security_config.xml'), /cleartextTrafficPermitted="false"/)

const activity = read('android/app/src/main/java/city/silver/unending/MainActivity.java')
assert.match(activity, /SilverCityShell/)
assert.match(activity, /getVersionCode/)

const main = read('src/main.tsx')
assert.match(main, /inAndroidShell\(\)/)
assert.match(main, /!Capacitor\.isNativePlatform\(\)/)
assert.match(main, /registerSW\(\{ immediate: true \}\)/)
assert.match(main, /unregister\(\)/)

const notice = read('src/components/ShellUpdateNotice.tsx')
assert.match(notice, /Update available/)
assert.match(notice, /Get the update/)
assert.match(notice, /SHELL_APK_URL/)
assert.doesNotMatch(notice, /window\.open|location\.href\s*=/)

const vite = read('vite.config.ts')
assert.match(vite, /"script-src 'self'"/)
assert.match(vite, /"connect-src 'self'"/)
assert.doesNotMatch(vite, /script-src[^"\n]*unsafe-eval/)

const workflow = read('.github/workflows/android-apk.yml')
for (const name of [
  'ANDROID_KEYSTORE_BASE64',
  'ANDROID_KEYSTORE_PASSWORD',
  'ANDROID_KEY_ALIAS',
  'ANDROID_KEY_PASSWORD',
]) {
  assert.match(workflow, new RegExp(name))
}
assert.match(workflow, /assembleDebug/)
assert.match(workflow, /assembleRelease/)
assert.match(workflow, /tag_name: latest/)
assert.match(workflow, /silver-city\.apk/)
assert.match(workflow, /github\.ref == 'refs\/heads\/main'/)

const readme = read('README.md')
assert.match(readme, /releases\/download\/latest\/silver-city\.apk/)
assert.match(readme, /Install unknown apps/)
assert.match(readme, /Update available/)

assert.equal(APP_VERSION, '1.4.425')
assert.ok(CHANGELOG.some((note) => note.version === '1.4.425'))
assert.match(latestChange('1.4.425').items.join('\n'), /Update available/)
assert.doesNotMatch(latestChange('1.4.425').items.join('\n'), /Fixes #|Closes #|Resolves #/)

console.log('check-android-shell: ok')
