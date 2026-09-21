#!/usr/bin/env node
import { readFileSync, writeFileSync } from 'node:fs'
const path = 'src/content/changelog.ts'
let cl = readFileSync(path, 'utf8')
if (cl.includes("version: '1.4.100'")) {
  console.log('changelog already has 1.4.100')
  process.exit(0)
}
const needle = "export const CHANGELOG: ChangeNote[] = [\n"
const row = `  {
    version: '1.4.100',
    title: 'Dig Reveal timed scrub · Easy core trail',
    when: '2026-09-21',
    items: [
      'Dig: scrub dirt off three tablets against a clock (Easy 20s / Hard 12s). Clock starts on first scrub. Three reveals → DUG!; timeout soft Buried! then One more dig reset. No glow-order',
    ],
  },
`
if (!cl.includes(needle)) throw new Error('needle missing')
writeFileSync(path, cl.replace(needle, needle + row))
console.log('inserted 1.4.100 changelog row')
