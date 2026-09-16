#!/usr/bin/env node
/**
 * Sync the web build into native shells.
 * Android: full `cap sync`.
 * iOS: `cap sync` when CocoaPods/Xcode exist; otherwise `cap copy`
 * so Linux CI still lands web assets in ios/.
 */
import { spawnSync } from 'node:child_process'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const platform = process.argv[2]
if (platform !== 'ios' && platform !== 'android' && platform !== undefined) {
  console.error('usage: node scripts/cap-sync.mjs [ios|android]')
  process.exit(2)
}

function run(command) {
  const result = spawnSync(command, { shell: true, stdio: 'inherit', cwd: root })
  return result.status ?? 1
}

const syncCmd = platform ? `npx cap sync ${platform}` : 'npx cap sync'
const status = run(syncCmd)
if (status === 0) process.exit(0)
if (platform === 'android' || !platform) process.exit(status)

console.warn('cap sync ios: native pods/Xcode skipped on this machine. Copying web assets into ios/.')
process.exit(run('npx cap copy ios'))
