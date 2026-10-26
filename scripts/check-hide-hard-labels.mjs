#!/usr/bin/env node
/** Player UI must not show Hard/Medium tier labels in .tsx (comments excluded). */
import assert from 'node:assert/strict'
import { readdirSync, readFileSync } from 'node:fs'
import { join, relative } from 'node:path'
import { fileURLToPath } from 'node:url'
import { playerVisibleChangeItems } from '../src/content/changelog.ts'

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

const filtered = playerVisibleChangeItems(['Hard stays the same.', 'A plain note.'])
assert.deepEqual(filtered, ['A plain note.'], 'changelog render filter drops tier lines')
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
