#!/usr/bin/env node
/**
 * Play bundle: local Capacitor files, no Pages server.url.
 * Pins the origin at https://localhost. Sideload keeps android-live-shell.mjs.
 */
import { existsSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

export const BUNDLED_ANDROID_SCHEME = 'https'
export const BUNDLED_ANDROID_HOSTNAME = 'localhost'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const configPath = join(root, 'android/app/src/main/assets/capacitor.config.json')
const publicAssets = join(root, 'android/app/src/main/assets/public')

export const PLAY_BUNDLE_OMIT = ['qa-seed.html', 'night-run']

/**
 * @param {Record<string, unknown>} config
 */
export function withBundledPlayShell(config) {
  const server = {
    ...(config.server && typeof config.server === 'object' ? config.server : {}),
  }
  delete server.url
  delete server.allowNavigation
  server.androidScheme = BUNDLED_ANDROID_SCHEME
  server.hostname = BUNDLED_ANDROID_HOSTNAME
  server.cleartext = false
  server.errorPath = 'index.html'

  const android = {
    ...(config.android && typeof config.android === 'object' ? config.android : {}),
    allowMixedContent: false,
  }

  return {
    ...config,
    server,
    android,
  }
}

/**
 * @param {string} dir
 */
export function omitPlayBundle(dir) {
  for (const name of PLAY_BUNDLE_OMIT) {
    const target = join(dir, name)
    if (existsSync(target)) rmSync(target, { recursive: true, force: true })
  }
}

function main() {
  const raw = readFileSync(configPath, 'utf8')
  const next = withBundledPlayShell(JSON.parse(raw))
  if (next.server && typeof next.server === 'object' && 'url' in next.server) {
    console.error('Play shell refused a server.url')
    process.exit(1)
  }
  writeFileSync(configPath, `${JSON.stringify(next, null, 2)}\n`)
  omitPlayBundle(publicAssets)
  console.log(`Play shell bundles local files at ${BUNDLED_ANDROID_SCHEME}://${BUNDLED_ANDROID_HOSTNAME}`)
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  if (process.argv[2] === '--omit') {
    const dir = process.argv[3]
    if (!dir) {
      console.error('usage: node scripts/android-play-shell.mjs --omit <dir>')
      process.exit(2)
    }
    omitPlayBundle(dir)
  } else {
    main()
  }
}
