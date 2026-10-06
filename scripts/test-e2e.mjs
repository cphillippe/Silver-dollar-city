#!/usr/bin/env node
/**
 * Thin Easy phone play-through (Playwright).
 * Not part of `npm test` — core checks stay green without a browser.
 *
 *   npx playwright install chromium
 *   npm run build
 *   npm run test:e2e
 *
 * Serves `vite preview` against dist/. Builds first when dist/index.html is missing.
 * E2E_SKIP_IF_NO_BROWSER=1 exits 0 when Chromium is not installed.
 */
import { spawnSync } from 'node:child_process'
import { existsSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')

function run(cmd, args) {
  const result = spawnSync(cmd, args, { cwd: root, stdio: 'inherit' })
  if (result.status !== 0) process.exit(result.status ?? 1)
}

let chromium
try {
  ;({ chromium } = await import('@playwright/test'))
} catch (error) {
  console.error('Playwright is not installed. Run npm install, then: npx playwright install chromium')
  console.error(error instanceof Error ? error.message : error)
  process.exit(2)
}

const executable = chromium.executablePath()
if (!existsSync(executable)) {
  console.error(`Playwright Chromium is not installed (${executable}).`)
  console.error('Install it with: npx playwright install chromium')
  if (process.env.E2E_SKIP_IF_NO_BROWSER === '1') {
    console.error('E2E_SKIP_IF_NO_BROWSER=1 — skipping the phone play-through.')
    process.exit(0)
  }
  process.exit(2)
}

if (!existsSync(join(root, 'dist/index.html'))) {
  console.log('test-e2e: dist/ missing — running build')
  run('npm', ['run', 'build'])
}

console.log('test-e2e: Easy phone play-through (375×667)')
run('npx', ['playwright', 'test'])
