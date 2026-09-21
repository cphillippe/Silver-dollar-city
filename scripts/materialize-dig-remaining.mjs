#!/usr/bin/env node
import { execFileSync } from 'node:child_process'
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs'
import { join } from 'node:path'

const root = process.cwd()
const parts = []
for (let i = 1; ; i += 1) {
  const p = join(root, 'tmp', `dig-rem.b64.${String(i).padStart(2, '0')}`)
  try {
    parts.push(readFileSync(p, 'utf8').trim())
  } catch {
    break
  }
}
if (!parts.length) throw new Error('no dig-rem.b64 parts')
mkdirSync(join(root, 'tmp'), { recursive: true })
const patch = Buffer.from(parts.join(''), 'base64')
const patchPath = join(root, 'tmp', 'dig-remaining.patch')
writeFileSync(patchPath, patch)
execFileSync('git', ['apply', '--whitespace=nowarn', patchPath], { cwd: root, stdio: 'inherit' })
console.log('applied remaining dig reveal', patch.length)
