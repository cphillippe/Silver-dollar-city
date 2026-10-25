#!/usr/bin/env node
/**
 * One-command update: bump version everywhere + changelog row + embed + quick tests + build.
 *
 *   node scripts/ship-update.mjs --title "Easy Match: ..." --item "One line." --item "Hard stays the same." [--version 1.4.535]
 *        [--scope quick|core|css|arcade|city|commerce|dig|juice|all|none] [--no-build] [--dry]
 *
 * Default version = patch + 1. Default scope = quick (~15 s). CI still runs the full suite.
 * Writes: package.json, package-lock.json, src/config/app.ts, public/shell.json, src/content/changelog.ts,
 *         src/content/packs/{index,golden-path}.xml, src/content/packEmbedded.ts (regen),
 *         and the newest-version asserts in scripts/check-{city,android-shell,panel-blast}.mjs.
 * Does NOT commit, push, open a PR, or touch docs/ (Pages deploys dist/ from CI).
 */
import { spawnSync } from 'node:child_process'
import { readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const args = process.argv.slice(2)
const flag = (name) => args.includes(`--${name}`)
const opt = (name, fallback) => {
  const i = args.indexOf(`--${name}`)
  return i >= 0 && args[i + 1] && !args[i + 1].startsWith('--') ? args[i + 1] : fallback
}
const items = args.flatMap((a, i) => (a === '--item' && args[i + 1] ? [args[i + 1]] : []))
const title = opt('title', '')
const dry = flag('dry')
if (!title || items.length === 0) {
  console.error('ship-update: need --title "..." and at least one --item "..."')
  process.exit(2)
}

const rel = (p) => join(root, p)
const read = (p) => readFileSync(rel(p), 'utf8')
const writes = []
function edit(p, fn) {
  const before = read(p)
  const after = fn(before)
  if (after === before) throw new Error(`ship-update: no change in ${p}`)
  writes.push([p, after])
}

const pkg = JSON.parse(read('package.json'))
const old = pkg.version
const [ma, mi, pa] = old.split('.').map(Number)
const next = opt('version', `${ma}.${mi}.${pa + 1}`)
const parts = next.split('.').map(Number)
if (parts.length !== 3 || parts.some((n) => !Number.isInteger(n))) throw new Error(`bad version ${next}`)
const code = parts[0] * 100000 + parts[1] * 1000 + parts[2]
const esc = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
const q = (s) => `'${s.replace(/\\/g, '\\\\').replace(/'/g, "\\'")}'`
const when = new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Chicago' }).format(new Date())

edit('package.json', (s) => s.replace(`"version": "${old}"`, `"version": "${next}"`))
edit('package-lock.json', (s) => {
  const lock = JSON.parse(s)
  lock.version = next
  lock.packages[''].version = next
  return `${JSON.stringify(lock, null, 2)}\n`
})
edit('src/config/app.ts', (s) => s.replace(`APP_VERSION = '${old}'`, `APP_VERSION = '${next}'`))
edit('public/shell.json', (s) => {
  const shell = JSON.parse(s)
  if (shell.versionCode >= code) throw new Error(`shell versionCode ${shell.versionCode} >= ${code}`)
  return s.replace(/"versionCode":\s*\d+/, `"versionCode": ${code}`)
})
for (const p of ['src/content/packs/index.xml', 'src/content/packs/golden-path.xml']) {
  edit(p, (s) => s.replace(`appVersion="${old}"`, `appVersion="${next}"`))
}
edit('src/content/changelog.ts', (s) => {
  const anchor = 'export const CHANGELOG: ChangeNote[] = [\n'
  if (!s.includes(anchor)) throw new Error('changelog anchor missing')
  const row = `  {\n    version: ${q(next)},\n    title: ${q(title)},\n    when: ${q(when)},\n    items: [\n${items
    .map((it) => `      ${q(it)},`)
    .join('\n')}\n    ],\n  },\n`
  return s.replace(anchor, anchor + row)
})
for (const p of ['scripts/check-android-shell.mjs', 'scripts/check-panel-blast.mjs']) {
  edit(p, (s) => s.replace(`assert.equal(APP_VERSION, '${old}')`, `assert.equal(APP_VERSION, '${next}')`))
}
edit('scripts/check-city.mjs', (s) =>
  s.replace(
    new RegExp(
      `assert\\.equal\\(APP_VERSION, '${esc(old)}'\\)\\nassert\\.equal\\(CHANGELOG\\[0\\]\\.version, '${esc(old)}', '${esc(old)} is the newest row'\\)\\n`,
    ),
    `assert.equal(APP_VERSION, '${next}')\nassert.equal(CHANGELOG[0].version, '${next}', '${next} is the newest row')\n` +
      `assert.ok(CHANGELOG.some((note) => note.version === '${next}'), '${next} changelog row')\n` +
      `assert.doesNotMatch(latestChange('${next}').items.join('\\n'), /Fixes #|Closes #|Resolves #/, '${next} changelog avoids GitHub close keywords')\n`,
  ),
)

console.log(`ship-update: ${old} -> ${next} (versionCode ${code}, when ${when})`)
for (const [p] of writes) console.log(`  edit ${p}`)
if (dry) {
  console.log('ship-update: --dry, nothing written')
  process.exit(0)
}
for (const [p, body] of writes) writeFileSync(rel(p), body, 'utf8')

function run(cmd, cmdArgs) {
  const t = Date.now()
  const r = spawnSync(cmd, cmdArgs, { cwd: root, stdio: 'inherit' })
  console.log(`ship-update: ${[cmd.split('/').pop(), ...cmdArgs].join(' ')} ${((Date.now() - t) / 1000).toFixed(1)}s`)
  if (r.status !== 0) process.exit(r.status ?? 1)
}
run(process.execPath, [rel('scripts/embed-packs.mjs')])
const scope = opt('scope', 'quick')
if (scope !== 'none') run(process.execPath, [rel('scripts/run-checks.mjs'), scope])
if (!flag('no-build')) run('npm', ['run', 'build', '--silent'])
console.log('ship-update: done. Review `git diff`, add hop-specific asserts, commit, open the PR.')
