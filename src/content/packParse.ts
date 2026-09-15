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
  type PackWord,
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

const AREA_ORDER: Record<string, number> = {
  'parable-hollow': 1,
  'witness-bench': 2,
  observatory: 3,
  'first-gate': 4,
  'high-lookout': 5,
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

function attrsToString(attrs: Record<string, string>): string {
  const keys = Object.keys(attrs)
  if (keys.length === 0) return ''
  return ` ${keys.map((key) => `${key}="${attrs[key].replace(/"/g, '&quot;')}"`).join(' ')}`
}

function areaRoot(xml: string): El | undefined {
  return child(xml, 'areaPack') ?? child(xml, 'area')
}

function indexRoot(xml: string): El | undefined {
  return child(xml, 'silverCityPackIndex') ?? child(xml, 'packIndex') ?? child(xml, 'index')
}

function lociFromNames(place: string, person: string): Pick<PackLoci, 'plotId' | 'who'> | undefined {
  const blob = `${place} ${person}`.toLowerCase()
  if (blob.includes('juniper') || blob.includes('porch')) {
    return { plotId: 'porch', who: 'juniper' }
  }
  if (blob.includes('mercy') || blob.includes('creek') || blob.includes('hollow')) {
    return { plotId: 'hollow', who: 'mercy' }
  }
  if (blob.includes('silas') || blob.includes('witness') || blob.includes('square')) {
    return { plotId: 'bench', who: 'silas' }
  }
  if (blob.includes('nora') || blob.includes('sky watch') || blob.includes('observatory')) {
    return { plotId: 'observatory', who: 'nora' }
  }
  if (blob.includes('ansel') || blob.includes('why gate')) {
    return { plotId: 'gate', who: 'ansel' }
  }
  if (blob.includes('hope') || blob.includes('ridge') || blob.includes('lookout') || blob.includes('meaning')) {
    return { plotId: 'lookout', who: 'hope' }
  }
  return undefined
}

function parseLoci(xml: string, fallback: PackLoci, lessonAttrs: Record<string, string> = {}): PackLoci {
  const hit = child(xml, 'loci')
  const place = lessonAttrs.place || hit?.attrs.place || fallback.place
  const person = lessonAttrs.person || hit?.attrs.person || fallback.person
  const named = lociFromNames(place, person)
  return {
    place,
    person,
    plotId: lessonAttrs.plotId || hit?.attrs.plotId || named?.plotId || fallback.plotId,
    who: lessonAttrs.who || lessonAttrs.personId || hit?.attrs.who || named?.who || fallback.who,
  }
}

function parseMatch(xml: string, claim: string, loci: PackLoci): PackMatch {
  const hit = child(xml, 'match')
  if (!hit) {
    return { sentence: claim, place: loci.place, person: loci.person }
  }
  return {
    sentence:
      textOf(hit.inner, 'sentenceCorrect') ||
      hit.attrs.sentence ||
      textOf(hit.inner, 'sentence') ||
      claim,
    place: hit.attrs.place || textOf(hit.inner, 'place') || loci.place,
    person: hit.attrs.person || textOf(hit.inner, 'person') || loci.person,
  }
}

function parseHold(xml: string, whyFallback: string, tier: LessonTierId, claim: string): PackHold {
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
  const holdClaim = textOf(inner, 'claim') || claim
  const choicesWrap = child(inner, 'claimChoices')
  const claimChoices = choicesWrap ? textsOf(choicesWrap.inner, 'choice') : []
  const claimMisses = [
    ...claimChoices.filter((line) => line && line !== holdClaim),
    ...textsOf(inner, 'claimMiss'),
    ...children(inner, 'miss')
      .filter((item) => item.attrs.kind === 'claim')
      .map((item) => strip(item.inner)),
  ].filter(Boolean)
  const why =
    textOf(inner, 'whyCorrect') ||
    textOf(inner, 'reason') ||
    textOf(inner, 'why') ||
    whyFallback
  const whyWrap = child(inner, 'whyMisses')
  const reasonWrap = child(inner, 'reasonChoices')
  const reasonChoices = reasonWrap ? textsOf(reasonWrap.inner, 'choice') : []
  const whyMisses = [
    ...(whyWrap ? textsOf(whyWrap.inner, 'miss') : []),
    ...textsOf(inner, 'whyMiss'),
    ...reasonChoices.filter((line) => line && line !== why),
    ...children(inner, 'miss')
      .filter((item) => item.attrs.kind === 'why' || item.attrs.kind === 'reason')
      .map((item) => strip(item.inner)),
  ].filter(Boolean)
  return {
    levelUpTo,
    onFail: 'easy',
    why,
    claimMisses: uniqueLines(claimMisses),
    whyMisses: uniqueLines(whyMisses),
  }
}

function uniqueLines(lines: string[]): string[] {
  const seen = new Set<string>()
  const next: string[] = []
  for (const line of lines) {
    if (seen.has(line)) continue
    seen.add(line)
    next.push(line)
  }
  return next
}

function parseLearnBody(tierInner: string, name: LessonTierId, fallback: string): string {
  const learn = child(tierInner, 'learn')
  const inner = learn?.inner ?? tierInner
  if (name === 'easy') {
    return textOf(inner, 'shortStory') || textOf(inner, 'teach') || looseLearnText(inner) || fallback
  }
  if (name === 'medium') {
    return textOf(inner, 'mediumTeach') || textOf(inner, 'teach') || looseLearnText(inner) || fallback
  }
  return (
    textOf(inner, 'hardTeach') ||
    textOf(inner, 'fullTeach') ||
    textOf(inner, 'teach') ||
    looseLearnText(inner) ||
    fallback
  )
}

function looseLearnText(inner: string): string {
  const stripped = inner.replace(
    /<(mainIdea|gloss|loci|word|hint|prompt|teachOnWrong|challengeTiles|shortStory|mediumTeach|hardTeach|fullTeach)\b[\s\S]*?<\/\1>/gi,
    '',
  )
  const leftover = strip(stripped.replace(/<[^>]+>/g, ' '))
  return leftover
}

function parseWord(tierInner: string): PackWord | undefined {
  const learn = child(tierInner, 'learn')
  const inner = learn?.inner ?? tierInner
  const word = child(inner, 'word')
  if (!word) return undefined
  const term = textOf(word.inner, 'term')
  const sense = textOf(word.inner, 'sense')
  if (!term || !sense) return undefined
  return { term, sense }
}

function parseHint(tierInner: string): string {
  const learn = child(tierInner, 'learn')
  return textOf(learn?.inner ?? tierInner, 'hint')
}

function parseGloss(tierInner: string, fallback: string): string {
  const learn = child(tierInner, 'learn')
  return textOf(learn?.inner ?? tierInner, 'gloss') || textOf(learn?.inner ?? tierInner, 'mainIdea') || fallback
}

function holdFields(tierInner: string): { claim: string; reason: string; source: string } {
  const hold = child(tierInner, 'hold')
  const inner = hold?.inner ?? ''
  return {
    claim: textOf(inner, 'claim'),
    reason: textOf(inner, 'whyCorrect') || textOf(inner, 'reason'),
    source: textOf(inner, 'source'),
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
  const learn = parseLearnBody(hit.inner, name, learnFallback)
  const match = parseMatch(hit.inner, claim, loci)
  const hold = parseHold(hit.inner, whyFallback, name, claim)
  const word = parseWord(hit.inner)
  const hint = parseHint(hit.inner)
  const gloss = parseGloss(hit.inner, learnFallback)
  return {
    id: name,
    points,
    easyOrder: easyOrder && easyOrder > 0 ? easyOrder : undefined,
    learn,
    gloss,
    word,
    hint: hint || undefined,
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
  const paragraphs = textsOf(hit.inner, 'p')
  const body = paragraphs.length ? paragraphs : textsOf(hit.inner, 'body')
  const sourcesWrap = child(hit.inner, 'sources')
  const sources = [
    ...(sourcesWrap ? textsOf(sourcesWrap.inner, 'source') : []),
    ...textsOf(hit.inner, 'cite'),
    ...(sourcesWrap ? [] : textsOf(hit.inner, 'source')),
  ].filter(Boolean)
  if (!title && body.length === 0) return undefined
  return {
    id: hit.attrs.id || undefined,
    title,
    kicker,
    body,
    sources: uniqueLines(sources),
    unlockAfter: hit.attrs.unlockAfter || undefined,
  }
}

function parseLesson(xml: string, areaId: string, areaLoci: PackLoci): PackLesson | undefined {
  const wrap = xml.trim().startsWith('<lesson') ? xml : `<lesson>${xml}</lesson>`
  const el = child(wrap, 'lesson') ?? { name: 'lesson', attrs: {}, inner: xml }
  const id = el.attrs.id
  if (!id) return undefined
  const easyEl = child(el.inner, 'easy')
  const mediumEl = child(el.inner, 'medium')
  const hardEl = child(el.inner, 'hard')
  const easyHold = holdFields(easyEl?.inner ?? '')
  const mediumHold = holdFields(mediumEl?.inner ?? '')
  const hardHold = holdFields(hardEl?.inner ?? '')
  const claim =
    easyHold.claim ||
    mediumHold.claim ||
    hardHold.claim ||
    textOf(el.inner, 'claim') ||
    el.attrs.ideaLabel
  const gloss = parseGloss(easyEl?.inner ?? el.inner, '')
  const plain = textOf(el.inner, 'plain') || gloss || claim
  const source = easyHold.source || textOf(el.inner, 'source') || mediumHold.source || hardHold.source
  const loci = parseLoci(el.inner, areaLoci, el.attrs)
  const why = easyHold.reason || textOf(el.inner, 'why') || plain || claim
  const easyOrder = intAttr(el.attrs, 'easyOrder', 0)
  if (!claim) return undefined
  const easy =
    parseTier(el.inner, 'easy', claim, loci, plain || claim, why) ??
    defaultTier('easy', claim, loci, plain || claim, why, easyOrder || undefined)
  if (!easy.easyOrder) {
    easy.easyOrder = easyOrder || (easyEl ? intAttr(easyEl.attrs, 'easyOrder', 0) : 0) || undefined
  }
  const medium =
    parseTier(el.inner, 'medium', claim, loci, why || claim, why) ??
    defaultTier('medium', claim, loci, why || claim, why, undefined, easy.hold)
  const hard =
    parseTier(el.inner, 'hard', claim, loci, why || claim, why) ??
    defaultTier('hard', claim, loci, why || claim, why, undefined, easy.hold)
  return {
    id,
    areaId: el.attrs.areaId || areaId,
    title: el.attrs.challengeTitle || el.attrs.title || el.attrs.ideaLabel || claim,
    idea: el.attrs.ideaLabel || el.attrs.idea || undefined,
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

function areaLociFallback(areaId: string, title: string, attrs: Record<string, string> = {}): PackLoci {
  const named = lociFromNames(attrs.place || title, attrs.person || '')
  if (attrs.place && attrs.person && (attrs.plotId || attrs.personId || named)) {
    return {
      place: attrs.place,
      person: attrs.person,
      plotId: attrs.plotId || named?.plotId || 'porch',
      who: attrs.personId || named?.who || 'juniper',
    }
  }
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
  const root = areaRoot(xml)
  if (!root) {
    issues.push({ file, message: 'Missing <areaPack> or <area> root' })
    return undefined
  }
  const schemaVersion = intAttr(root.attrs, 'schemaVersion', PACK_SCHEMA_VERSION)
  if (schemaVersion !== PACK_SCHEMA_VERSION) {
    issues.push({ file, message: `Expected schemaVersion ${PACK_SCHEMA_VERSION}, got ${schemaVersion}` })
  }
  const id = root.attrs.id || file.replace(/\.xml$/, '')
  const meta = child(root.inner, 'meta')
  const title = root.attrs.title || (meta ? textOf(meta.inner, 'title') : '') || id
  const subtitle = root.attrs.subtitle || (meta ? textOf(meta.inner, 'subtitle') : '') || ''
  const blurb = (meta ? textOf(meta.inner, 'blurb') : '') || textOf(root.inner, 'blurb') || root.attrs.blurb || ''
  const loci = areaLociFallback(id, title, root.attrs)
  const lessonParent = child(root.inner, 'lessons')
  const lessonXml = lessonParent?.inner ?? root.inner
  const lessons = children(lessonXml, 'lesson')
    .map((item) => parseLesson(`<lesson${attrsToString(item.attrs)}>${item.inner}</lesson>`, id, loci))
    .filter((item): item is PackLesson => Boolean(item))
  if (lessons.length === 0) {
    issues.push({ file, message: `No <lesson> elements in ${id}` })
  }
  return {
    id,
    file,
    order: intAttr(root.attrs, 'order', AREA_ORDER[id] ?? 0),
    title,
    shortTitle: root.attrs.shortTitle || title,
    subtitle,
    blurb,
    intro: textsOf(root.inner, 'intro'),
    icon: root.attrs.icon || '',
    accent: root.attrs.accent || '',
    lessons,
  }
}

function parseEasyShelf(xml: string): string[] {
  const shelf = child(xml, 'easyShelf')
  if (!shelf) return []
  const fromLines = children(shelf.inner, 'line')
    .slice()
    .sort((a, b) => intAttr(a.attrs, 'easyOrder', 0) - intAttr(b.attrs, 'easyOrder', 0))
    .map((item) => item.attrs.id || strip(item.inner))
    .filter(Boolean)
  if (fromLines.length) return fromLines
  return (shelf.attrs.order || '')
    .split(',')
    .map((id) => id.trim())
    .filter(Boolean)
}

export function parseIndexXml(xml: string, file = 'index.xml', issues: PackParseIssue[] = []): PackIndex {
  const root = indexRoot(xml) ?? child(xml, 'area')
  if (!root) {
    issues.push({ file, message: 'Missing pack index root' })
    return { schemaVersion: PACK_SCHEMA_VERSION, id: 'core-v0', title: 'Core trail', files: [], easyShelf: [] }
  }
  const schemaVersion = intAttr(root.attrs, 'schemaVersion', PACK_SCHEMA_VERSION)
  if (schemaVersion !== PACK_SCHEMA_VERSION) {
    issues.push({ file, message: `Expected schemaVersion ${PACK_SCHEMA_VERSION}, got ${schemaVersion}` })
  }
  const packsWrap = child(root.inner, 'packs')
  const packEls = packsWrap ? children(packsWrap.inner, 'pack') : children(root.inner, 'area')
  const files = packEls
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
    easyShelf: parseEasyShelf(root.inner),
  }
}

function xmlByBasename(files: Record<string, string>): Record<string, string> {
  const next: Record<string, string> = {}
  for (const [key, xml] of Object.entries(files)) {
    next[key.split('/').pop() ?? key] = xml
  }
  return next
}

function applyEasyShelf(lessons: PackLesson[], shelf: string[]) {
  if (!shelf.length) return
  const order = new Map(shelf.map((id, index) => [id, index + 1]))
  for (const lesson of lessons) {
    const n = order.get(lesson.id)
    if (n) lesson.easy.easyOrder = n
  }
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
    const root = areaRoot(xml)
    const areaId = root?.attrs.id ?? ''
    if (seen.has(base) || (areaId && seen.has(`id:${areaId}`))) return
    const area = parseAreaXml(xml, base, issues)
    if (!area) return
    seen.add(base)
    seen.add(`id:${area.id}`)
    areas.push(area)
  }

  const idx = indexRoot(indexXml)
  if (idx) {
    for (const item of children(idx.inner, 'area')) {
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

  applyEasyShelf(lessons, index.easyShelf)

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
