import {
  PACK_SCHEMA_VERSION,
  TIER_POINTS,
  isLessonTier,
  type LessonTierId,
  type PackArea,
  type PackCatalog,
  type PackHold,
  type PackIndex,
  type PackLesson,
  type PackLoci,
  type PackMatch,
  type PackTier,
} from './packTypes.ts'

export interface PackParseIssue {
  file: string
  message: string
}

interface El {
  name: string
  attrs: Record<string, string>
  inner: string
}

const ENTITIES: Record<string, string> = {
  '&lt;': '<',
  '&gt;': '>',
  '&amp;': '&',
  '&quot;': '"',
  '&apos;': "'",
}

function decode(text: string): string {
  return text
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1')
    .replace(/&(?:lt|gt|amp|quot|apos);/g, (hit) => ENTITIES[hit] ?? hit)
    .replace(/&#(\d+);/g, (_, code) => String.fromCharCode(Number(code)))
    .replace(/&#x([0-9a-fA-F]+);/g, (_, code) => String.fromCharCode(parseInt(code, 16)))
}

function strip(text: string): string {
  return decode(text.replace(/<!--[\s\S]*?-->/g, '')).trim()
}

function parseAttrs(raw: string): Record<string, string> {
  const attrs: Record<string, string> = {}
  const pattern = /([A-Za-z_][\w:-]*)\s*=\s*("([^"]*)"|'([^']*)')/g
  let match: RegExpExecArray | null
  while ((match = pattern.exec(raw))) {
    attrs[match[1]] = decode(match[3] ?? match[4] ?? '')
  }
  return attrs
}

function children(xml: string, name: string): El[] {
  const found: El[] = []
  const open = new RegExp(`<${name}(\\s[^>]*)?\\s*/>|<${name}(\\s[^>]*)?>`, 'g')
  let match: RegExpExecArray | null
  while ((match = open.exec(xml))) {
    const full = match[0]
    const attrs = parseAttrs(match[1] ?? match[2] ?? '')
    if (full.endsWith('/>')) {
      found.push({ name, attrs, inner: '' })
      continue
    }
    const start = match.index + full.length
    let depth = 1
    const cursor = new RegExp(`</${name}>|<${name}(?:\\s[^>]*)?\\s*/>|<${name}(?:\\s[^>]*)?>`, 'g')
    cursor.lastIndex = start
    let innerEnd = xml.length
    let next: RegExpExecArray | null
    while ((next = cursor.exec(xml))) {
      const token = next[0]
      if (token.startsWith(`</${name}`)) {
        depth -= 1
        if (depth === 0) {
          innerEnd = next.index
          open.lastIndex = next.index + token.length
          break
        }
      } else if (!token.endsWith('/>')) {
        depth += 1
      }
    }
    found.push({ name, attrs, inner: xml.slice(start, innerEnd) })
  }
  return found
}

function child(xml: string, name: string): El | undefined {
  return children(xml, name)[0]
}

function textOf(xml: string, name: string): string {
  const hit = child(xml, name)
  return hit ? strip(hit.inner) : ''
}

function textsOf(xml: string, name: string): string[] {
  return children(xml, name)
    .map((item) => strip(item.inner))
    .filter(Boolean)
}

function intAttr(attrs: Record<string, string>, key: string, fallback: number): number {
  const raw = attrs[key]
  const n = raw ? Number(raw) : NaN
  return Number.isFinite(n) ? n : fallback
}

function parseLoci(xml: string, fallback: PackLoci): PackLoci {
  const hit = child(xml, 'loci')
  if (!hit) return fallback
  return {
    place: hit.attrs.place || fallback.place,
    person: hit.attrs.person || fallback.person,
    plotId: hit.attrs.plotId || fallback.plotId,
    who: hit.attrs.who || fallback.who,
  }
}

function parseMatch(xml: string, claim: string, loci: PackLoci): PackMatch {
  const hit = child(xml, 'match')
  if (!hit) {
    return { sentence: claim, place: loci.place, person: loci.person }
  }
  return {
    sentence: hit.attrs.sentence || textOf(hit.inner, 'sentence') || claim,
    place: hit.attrs.place || textOf(hit.inner, 'place') || loci.place,
    person: hit.attrs.person || textOf(hit.inner, 'person') || loci.person,
  }
}

function parseHold(xml: string, whyFallback: string, tier: LessonTierId): PackHold {
  const hit = child(xml, 'hold')
  const inner = hit?.inner ?? ''
  const levelRaw = hit?.attrs.levelUpTo
  const levelUpTo = isLessonTier(levelRaw)
    ? levelRaw
    : tier === 'easy'
      ? 'medium'
      : tier === 'medium'
        ? 'hard'
        : undefined
  const claimMisses = [
    ...textsOf(inner, 'claimMiss'),
    ...children(inner, 'miss')
      .filter((item) => (item.attrs.kind || 'claim') === 'claim')
      .map((item) => strip(item.inner)),
  ].filter(Boolean)
  const whyMisses = [
    ...textsOf(inner, 'whyMiss'),
    ...children(inner, 'miss')
      .filter((item) => item.attrs.kind === 'why' || item.attrs.kind === 'reason')
      .map((item) => strip(item.inner)),
  ].filter(Boolean)
  return {
    levelUpTo,
    onFail: 'easy',
    why: textOf(inner, 'why') || strip(inner.replace(/<[^>]+>[\s\S]*?<\/[^>]+>/g, '')) || whyFallback,
    claimMisses,
    whyMisses,
  }
}

function parseTier(
  xml: string,
  name: LessonTierId,
  claim: string,
  loci: PackLoci,
  learnFallback: string,
  whyFallback: string,
): PackTier | undefined {
  const hit = child(xml, name)
  if (!hit) return undefined
  const points = intAttr(hit.attrs, 'points', TIER_POINTS[name])
  const easyOrder = name === 'easy' ? intAttr(hit.attrs, 'easyOrder', 0) : undefined
  const learn = textOf(hit.inner, 'learn') || textOf(hit.inner, 'shortStory') || textOf(hit.inner, 'teach') || learnFallback
  const match = parseMatch(hit.inner, claim, loci)
  const hold = parseHold(hit.inner, whyFallback, name)
  return {
    id: name,
    points,
    easyOrder: easyOrder && easyOrder > 0 ? easyOrder : undefined,
    learn,
    match,
    hold,
  }
}

function defaultTier(
  name: LessonTierId,
  claim: string,
  loci: PackLoci,
  learn: string,
  why: string,
  easyOrder?: number,
  hold?: Partial<PackHold>,
): PackTier {
  return {
    id: name,
    points: TIER_POINTS[name],
    easyOrder: name === 'easy' ? easyOrder : undefined,
    learn,
    match: { sentence: claim, place: loci.place, person: loci.person },
    hold: {
      levelUpTo: name === 'easy' ? 'medium' : name === 'medium' ? 'hard' : undefined,
      onFail: 'easy',
      why,
      claimMisses: hold?.claimMisses ?? [],
      whyMisses: hold?.whyMisses ?? [],
    },
  }
}

function parseJournal(xml: string): PackLesson['journal'] | undefined {
  const hit = child(xml, 'journal')
  if (!hit) return undefined
  const title = hit.attrs.title || textOf(hit.inner, 'title')
  const kicker = hit.attrs.kicker || textOf(hit.inner, 'kicker')
  const body = textsOf(hit.inner, 'body')
  const sources = [...textsOf(hit.inner, 'cite'), ...textsOf(hit.inner, 'source')].filter(Boolean)
  if (!title && body.length === 0) return undefined
  return { title, kicker, body, sources }
}

function parseLesson(xml: string, areaId: string, areaLoci: PackLoci): PackLesson | undefined {
  const wrap = xml.trim().startsWith('<lesson') ? xml : `<lesson>${xml}</lesson>`
  const el = child(wrap, 'lesson') ?? { name: 'lesson', attrs: {}, inner: xml }
  const id = el.attrs.id
  if (!id) return undefined
  const claim = textOf(el.inner, 'claim')
  const plain = textOf(el.inner, 'plain') || claim
  const source = textOf(el.inner, 'source')
  const loci = parseLoci(el.inner, areaLoci)
  const why = textOf(el.inner, 'why') || plain || claim
  const easyOrder = intAttr(el.attrs, 'easyOrder', 0)
  const easy =
    parseTier(el.inner, 'easy', claim, loci, plain || claim, why) ??
    defaultTier('easy', claim, loci, plain || claim, why, easyOrder || undefined)
  const easyEl = child(el.inner, 'easy')
  if (!easy.easyOrder) {
    easy.easyOrder = easyOrder || (easyEl ? intAttr(easyEl.attrs, 'easyOrder', 0) : 0) || undefined
  }
  const medium =
    parseTier(el.inner, 'medium', claim, loci, why || claim, why) ??
    defaultTier('medium', claim, loci, why || claim, why, undefined, easy.hold)
  const hard =
    parseTier(el.inner, 'hard', claim, loci, why || claim, why) ??
    defaultTier('hard', claim, loci, why || claim, why, undefined, easy.hold)
  if (!claim) return undefined
  return {
    id,
    areaId: el.attrs.areaId || areaId,
    title: el.attrs.title || claim,
    idea: el.attrs.idea || undefined,
    claim,
    plain,
    source,
    loci,
    journal: parseJournal(el.inner),
    easy: { ...easy, hold: { ...easy.hold, onFail: 'easy' } },
    medium: { ...medium, hold: { ...medium.hold, onFail: 'easy' } },
    hard: { ...hard, hold: { ...hard.hold, onFail: 'easy', levelUpTo: undefined } },
  }
}

function areaLociFallback(areaId: string, title: string): PackLoci {
  if (areaId === 'parable-hollow') {
    return { place: title || 'Story Creek', person: 'Mercy Wren', plotId: 'hollow', who: 'mercy' }
  }
  if (areaId === 'witness-bench') {
    return { place: title || 'Witness Square', person: 'Silas Whitman', plotId: 'bench', who: 'silas' }
  }
  if (areaId === 'observatory') {
    return { place: title || 'Sky Watch', person: 'Nora Skye', plotId: 'observatory', who: 'nora' }
  }
  if (areaId === 'first-gate') {
    return { place: title || 'Why Gate', person: 'Ansel Gate', plotId: 'gate', who: 'ansel' }
  }
  if (areaId === 'high-lookout') {
    return { place: title || 'Meaning Ridge', person: 'Hope Ridge', plotId: 'lookout', who: 'hope' }
  }
  return { place: title || 'East porch', person: 'Juniper Wick', plotId: 'porch', who: 'juniper' }
}

export function parseAreaXml(xml: string, file: string, issues: PackParseIssue[] = []): PackArea | undefined {
  const root = child(xml, 'area')
  if (!root) {
    issues.push({ file, message: 'Missing <area> root' })
    return undefined
  }
  const schemaVersion = intAttr(root.attrs, 'schemaVersion', PACK_SCHEMA_VERSION)
  if (schemaVersion !== PACK_SCHEMA_VERSION) {
    issues.push({ file, message: `Expected schemaVersion ${PACK_SCHEMA_VERSION}, got ${schemaVersion}` })
  }
  const id = root.attrs.id || file.replace(/\.xml$/, '')
  const title = root.attrs.title || id
  const loci = areaLociFallback(id, title)
  const lessons = children(root.inner, 'lesson')
    .map((item) => parseLesson(`<lesson${attrsToString(item.attrs)}>${item.inner}</lesson>`, id, loci))
    .filter((item): item is PackLesson => Boolean(item))
  if (lessons.length === 0) {
    issues.push({ file, message: `No <lesson> elements in ${id}` })
  }
  return {
    id,
    file,
    order: intAttr(root.attrs, 'order', 0),
    title,
    shortTitle: root.attrs.shortTitle || title,
    subtitle: root.attrs.subtitle || '',
    blurb: textOf(root.inner, 'blurb') || root.attrs.blurb || '',
    intro: textsOf(root.inner, 'intro'),
    icon: root.attrs.icon || '',
    accent: root.attrs.accent || '',
    lessons,
  }
}

function attrsToString(attrs: Record<string, string>): string {
  const keys = Object.keys(attrs)
  if (keys.length === 0) return ''
  return ` ${keys.map((key) => `${key}="${attrs[key].replace(/"/g, '&quot;')}"`).join(' ')}`
}

export function parseIndexXml(xml: string, file = 'index.xml', issues: PackParseIssue[] = []): PackIndex {
  const root = child(xml, 'packIndex') ?? child(xml, 'index') ?? child(xml, 'area')
  if (!root) {
    issues.push({ file, message: 'Missing <packIndex> root' })
    return { schemaVersion: PACK_SCHEMA_VERSION, id: 'core-v0', title: 'Core trail', files: [] }
  }
  const schemaVersion = intAttr(root.attrs, 'schemaVersion', PACK_SCHEMA_VERSION)
  if (schemaVersion !== PACK_SCHEMA_VERSION) {
    issues.push({ file, message: `Expected schemaVersion ${PACK_SCHEMA_VERSION}, got ${schemaVersion}` })
  }
  const files = children(root.inner, 'area')
    .filter((item) => item.attrs.file)
    .map((item) => ({
      file: item.attrs.file,
      id: item.attrs.id || item.attrs.file.replace(/\.xml$/, ''),
    }))
    .filter((item) => item.file && item.id)
  return {
    schemaVersion,
    id: root.attrs.id || 'core-v0',
    title: root.attrs.title || 'Core trail',
    files,
  }
}

function xmlByBasename(files: Record<string, string>): Record<string, string> {
  const next: Record<string, string> = {}
  for (const [key, xml] of Object.entries(files)) {
    next[key.split('/').pop() ?? key] = xml
  }
  return next
}

export function catalogFromXml(
  files: Record<string, string>,
  issues: PackParseIssue[] = [],
): PackCatalog {
  const byName = xmlByBasename(files)
  const indexXml = byName['index.xml'] ?? ''
  const index = parseIndexXml(indexXml, 'index.xml', issues)
  const areas: PackArea[] = []
  const seen = new Set<string>()

  function addArea(file: string, xml: string) {
    const base = file.split('/').pop() ?? file
    if (seen.has(base) || seen.has(`id:${child(xml, 'area')?.attrs.id ?? ''}`)) return
    const area = parseAreaXml(xml, base, issues)
    if (!area) return
    seen.add(base)
    seen.add(`id:${area.id}`)
    areas.push(area)
  }

  const indexRoot = child(indexXml, 'packIndex') ?? child(indexXml, 'index')
  if (indexRoot) {
    for (const item of children(indexRoot.inner, 'area')) {
      if (children(item.inner, 'lesson').length === 0) continue
      addArea(
        item.attrs.file || `${item.attrs.id || 'east-porch'}.xml`,
        `<area${attrsToString(item.attrs)}>${item.inner}</area>`,
      )
    }
  }

  for (const ref of index.files) {
    const xml = byName[ref.file]
    if (!xml) {
      issues.push({ file: ref.file, message: 'Listed in index.xml but missing from the pack set' })
      continue
    }
    addArea(ref.file, xml)
  }

  for (const [file, xml] of Object.entries(byName)) {
    if (file === 'index.xml' || !file.endsWith('.xml')) continue
    addArea(file, xml)
  }

  const lessons = areas
    .slice()
    .sort((a, b) => a.order - b.order || a.id.localeCompare(b.id))
    .flatMap((area) => area.lessons)

  const ordered = lessons.slice().sort((a, b) => {
    const ao = a.easy.easyOrder ?? 999
    const bo = b.easy.easyOrder ?? 999
    return ao - bo || a.id.localeCompare(b.id)
  })

  return {
    schemaVersion: index.schemaVersion || PACK_SCHEMA_VERSION,
    id: index.id,
    title: index.title,
    areas: areas.sort((a, b) => a.order - b.order || a.id.localeCompare(b.id)),
    lessons: ordered,
  }
}

export function easyOrderIds(catalog: PackCatalog): string[] {
  return catalog.lessons
    .filter((lesson) => lesson.easy.easyOrder)
    .sort((a, b) => (a.easy.easyOrder ?? 999) - (b.easy.easyOrder ?? 999))
    .map((lesson) => lesson.id)
}

export function lessonById(catalog: PackCatalog, id: string): PackLesson | undefined {
  return catalog.lessons.find((lesson) => lesson.id === id)
}
