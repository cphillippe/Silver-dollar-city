#!/usr/bin/env node
/**
 * Point the Android WebView at the live Pages app after `cap sync`.
 * Shared capacitor.config.ts stays local so iOS and `npm run build` are unchanged.
 * Allowed remote origin: the Pages URL below, HTTPS only. No extra navigation hosts.
 */
import { readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

export const PAGES_APP_URL = 'https://cphillippe.github.io/Silver-dollar-city/'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const configPath = join(root, 'android/app/src/main/assets/capacitor.config.json')

/**
 * @param {Record<string, unknown>} config
 */
export function withLivePagesShell(config) {
  const server = {
    ...(config.server && typeof config.server === 'object' ? config.server : {}),
  }
  delete server.allowNavigation
  server.url = PAGES_APP_URL
  server.androidScheme = 'https'
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

function main() {
  const raw = readFileSync(configPath, 'utf8')
  const next = withLivePagesShell(JSON.parse(raw))
  const url = next.server && typeof next.server === 'object' ? next.server.url : ''
  if (url !== PAGES_APP_URL) {
    console.error('android live shell refused a non-Pages URL')
    process.exit(1)
  }
  writeFileSync(configPath, `${JSON.stringify(next, null, 2)}\n`)
  console.log(`Android shell loads ${PAGES_APP_URL}`)
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main()
}
