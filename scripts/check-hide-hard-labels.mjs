#!/usr/bin/env node
/** Player UI must not show Hard/Medium tier labels in .tsx (comments excluded). */
import assert from 'node:assert/strict'
import { readdirSync, readFileSync } from 'node:fs'
import { join, relative } from 'node:path'
import { fileURLToPath } from 'node:url'
import {
  CHANGELOG,
  playerVisibleChangeItems,
  playerVisibleChangeTitle,
} from '../src/content/changelog.ts'

const root = join(fileURLToPath(new URL('.', import.meta.url)), '..')
const src = join(root, 'src')

function stripTsxComments(source) {
  return source
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/\/\/[^\n]*/g, '')
}

function walkTsx(dir, out = []) {
  for (const name of readdirSync(dir, { withFileTypes: true })) {
    const path = join(dir, name.name)
    if (name.isDirectory()) walkTsx(path, out)
    else if (name.name.endsWith('.tsx')) out.push(path)
  }
  return out
}

const tierLabel = /\bHard\b|\bMedium\b/
const hits = []
for (const file of walkTsx(src)) {
  const body = stripTsxComments(readFileSync(file, 'utf8'))
  if (tierLabel.test(body)) hits.push(relative(root, file))
}

assert.deepEqual(
  hits,
  [],
  `player-visible .tsx must not name Hard/Medium tiers: ${hits.join(', ') || '(none)'}`,
)

assert.deepEqual(
  playerVisibleChangeItems(['A note.', 'Refs #870.', 'Refs: Bill 2026-10-25']),
  ['A note.'],
  'A4 filter drops Refs issue lines and Bill refs',
)
const filtered = playerVisibleChangeItems(['Hard stays the same.', 'A plain note.', 'Refs #871.'])
assert.deepEqual(filtered, ['A plain note.'], 'changelog render filter drops tier and Refs lines')
for (const note of CHANGELOG) {
  const visible = playerVisibleChangeItems(note.items).join('\n')
  assert.doesNotMatch(visible, /\bRefs\b/, `A4 filtered ${note.version} items have no Refs`)
}
const drop550 = CHANGELOG.find((note) => note.version === '1.4.550')
assert.ok(drop550, '1.4.550 changelog row')
assert.doesNotMatch(playerVisibleChangeItems(drop550.items).join('\n'), /\bRefs\b/, '1.4.550 player list hides Refs #870')
assert.equal(
  playerVisibleChangeTitle('Behind the scenes: groundwork for quick review cards on saved ideas'),
  'Coming soon: quick review cards for ideas you saved.',
  'dev changelog titles rewrite for players',
)
assert.doesNotMatch(
  playerVisibleChangeItems(latest538Items()).join('\n'),
  /\bHard\b|\bMedium\b/,
  '1.4.538 items lose tier lines when filtered for players',
)

function latest538Items() {
  return [
    'Before your first lamp, the gold ring moves to an open seat you can see, or a gold arrow at the screen edge points the way.',
    'Hard stays the same.',
    'Refs #834.',
  ]
}

console.log('check-hide-hard-labels: ok')
