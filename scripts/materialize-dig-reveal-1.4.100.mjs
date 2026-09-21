#!/usr/bin/env node
import { execFileSync } from 'node:child_process'
import { readFileSync, writeFileSync, readdirSync } from 'node:fs'
import { join } from 'node:path'
const root = process.cwd()
const tmp = join(root, 'tmp')
const parts = readdirSync(tmp)
  .filter((n) => /^dig100p\.\d+$/.test(n))
  .sort()
if (!parts.length) throw new Error('no dig100p parts')
const b64 = parts.map((n) => readFileSync(join(tmp, n), 'utf8').trim()).join('')
const tgz = Buffer.from(b64, 'base64')
const tgzPath = join(tmp, 'dig-reveal-1.4.100.tgz')
writeFileSync(tgzPath, tgz)
execFileSync('tar', ['-xzf', tgzPath], { cwd: root, stdio: 'inherit' })
console.log('materialized dig reveal 1.4.100 from', parts.length, 'parts', tgz.length)
