import { readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const path = join(root, 'src/content/changelog.ts')
let text = readFileSync(path, 'utf8')
if (text.includes("version: '1.4.101'")) {
  console.log('changelog already has 1.4.101')
  process.exit(0)
}
const entry = `  {
    version: '1.4.101',
    title: 'Match art flash · tight letter rows',
    when: '2026-09-21',
    items: [
      'Match: story panels flash big StoryPanelArt then dock (≤1.2s); dock thumbs show real art, not sealed foil only',
      'Match: letter-board row gaps tightened (no stretch white gutters between gem rows)',
      'Match: dock +1000, required finds, and bonus SNAG all persist into saved matchBonus (Journal / profile pts)',
    ],
  },
`
const needle = 'export const CHANGELOG: ChangeNote[] = [\n'
if (!text.includes(needle)) throw new Error('CHANGELOG needle missing')
text = text.replace(needle, needle + entry)
writeFileSync(path, text)
console.log('patched changelog 1.4.101')
