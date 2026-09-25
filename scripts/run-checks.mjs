#!/usr/bin/env node
/**
 * Scoped check runner — thin hops use a subset; `npm test` still runs all.
 * Usage: node scripts/run-checks.mjs <scope>
 * Scopes: all | core | dig | arcade | city | commerce | css | juice
 */
import { spawnSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const strip = ['--experimental-strip-types']

/** @type {Record<string, { embed?: boolean, checks: Array<string | { script: string, env?: Record<string, string> }> }>} */
const SCOPES = {
  // Full suite (same order as historical npm test)
  all: {
    embed: true,
    checks: [
      { script: 'check-dates.mjs', env: { TZ: 'America/Chicago' } },
      { script: 'check-dates.mjs', env: { TZ: 'UTC' } },
      'check-progress.mjs',
      'check-save.mjs',
      'check-learning.mjs',
      'check-packs.mjs',
      'check-gem-search.mjs',
      'check-why-blast.mjs',
      'check-father-run.mjs',
      'check-road-maze.mjs',
      'check-claim-merge.mjs',
      'check-source-dig.mjs',
      'check-story-snap.mjs',
      'check-debug-plays.mjs',
      'check-panel-blast.mjs',
      'check-city.mjs',
      'check-commerce.mjs',
    ],
  },
  // Save / progress / learning / dates — no arcade or city mega-check
  core: {
    embed: true,
    checks: [
      { script: 'check-dates.mjs', env: { TZ: 'America/Chicago' } },
      { script: 'check-dates.mjs', env: { TZ: 'UTC' } },
      'check-progress.mjs',
      'check-save.mjs',
      'check-learning.mjs',
    ],
  },
  // Dig content packs + source-dig + pack catalog
  dig: {
    embed: true,
    checks: ['check-packs.mjs', 'check-source-dig.mjs'],
  },
  // Arcade / Match-adjacent play modes (skips check-city 2.8k)
  arcade: {
    embed: true,
    checks: [
      'check-gem-search.mjs',
      'check-why-blast.mjs',
      'check-father-run.mjs',
      'check-road-maze.mjs',
      'check-claim-merge.mjs',
      'check-panel-blast.mjs',
      'check-debug-plays.mjs',
    ],
  },
  // City map / lots / mind-map (expensive alone)
  city: {
    embed: true,
    checks: ['check-city.mjs'],
  },
  // Store/ads/support locks (stores PARKED — still validates parked state)
  commerce: {
    embed: true,
    checks: ['check-commerce.mjs'],
  },
  // CSS peels: scripts that readFileSync index.css (and match sheet after peel)
  // CSS peels: checks that readAppCss / assert peeled selectors (commerce tip-drift stays in commerce scope)
  css: {
    embed: false,
    checks: [
      'check-claim-merge.mjs',
      'check-road-maze.mjs',
      'check-gem-search.mjs',
      'check-debug-plays.mjs',
    ],
  },
  // Alias: Match / Support juice hops
  juice: {
    embed: false,
    checks: ['check-claim-merge.mjs', 'check-gem-search.mjs'],
  },
}

function run(cmd, args, env = {}) {
  const result = spawnSync(cmd, args, {
    cwd: root,
    env: { ...process.env, ...env },
    stdio: 'inherit',
  })
  if (result.status !== 0) {
    process.exit(result.status ?? 1)
  }
}

const scopeName = (process.argv[2] || 'all').toLowerCase()
const scope = SCOPES[scopeName]
if (!scope) {
  console.error(
    `Unknown scope "${scopeName}". Use one of: ${Object.keys(SCOPES).join(', ')}`,
  )
  process.exit(2)
}

console.log(`run-checks: scope=${scopeName}`)

if (scope.embed) {
  run(process.execPath, [join(root, 'scripts/embed-packs.mjs')])
}

for (const item of scope.checks) {
  const script = typeof item === 'string' ? item : item.script
  const env = typeof item === 'string' ? {} : item.env || {}
  console.log(`→ ${script}${env.TZ ? ` (TZ=${env.TZ})` : ''}`)
  run(process.execPath, [...strip, join(root, 'scripts', script)], env)
}

console.log(`run-checks: scope=${scopeName} OK`)
