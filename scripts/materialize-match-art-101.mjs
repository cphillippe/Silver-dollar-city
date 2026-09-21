#!/usr/bin/env node
/** Materialize Match art flash 1.4.101 product files from zlib+base64 parts. */
import { readFileSync, writeFileSync, readdirSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { inflateSync } from 'node:zlib'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const dir = join(root, '.github/match-art-101')
const parts = readdirSync(dir)
  .filter((n) => n.startsWith('payload.part') && n.endsWith('.b64'))
  .sort()
const b64 = parts.map((n) => readFileSync(join(dir, n), 'utf8').trim()).join('')
const map = JSON.parse(inflateSync(Buffer.from(b64, 'base64')).toString('utf8'))
for (const [rel, fileB64] of Object.entries(map)) {
  writeFileSync(join(root, rel), Buffer.from(fileB64, 'base64'))
  console.log('wrote', rel)
}
