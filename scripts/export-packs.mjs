import { mkdirSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { DAILY_POOL } from '../src/content/daily.ts'
import { evidenceFor } from '../src/content/evidence.ts'
import { firstGate } from '../src/content/firstGate.ts'
import { highLookout } from '../src/content/highLookout.ts'
import { journalEntries } from '../src/content/journal.ts'
import {
  STREET_FACT_IDS,
  STREET_NODES,
  STREET_TRIPLES,
  streetTripleForLine,
} from '../src/content/links.ts'
import { observatory } from '../src/content/observatory.ts'
import { parableHollow } from '../src/content/parableHollow.ts'
import { plainFor } from '../src/content/plain.ts'
import { witnessBench } from '../src/content/witnessBench.ts'
import { easyWhyLine } from '../src/lib/easy.ts'

const here = dirname(fileURLToPath(import.meta.url))
const outDir = join(here, '../src/content/packs')

const AREAS = [parableHollow, witnessBench, observatory, firstGate, highLookout]
const CHALLENGES = [
  ...AREAS.flatMap((area) => area.challenges),
  ...DAILY_POOL.map((item) => item.challenge),
]

function escapeXml(text) {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

function cdata(text) {
  if (/[<>&]/.test(text)) return `<![CDATA[${text.replace(/]]>/g, ']]]]><![CDATA[>')}]]>`
  return escapeXml(text)
}

const PLOT_AREA = {
  hollow: 'parable-hollow',
  bench: 'witness-bench',
  porch: 'east-porch',
  observatory: 'observatory',
  gate: 'first-gate',
  lookout: 'high-lookout',
}

const AREA_META = {
  'parable-hollow': parableHollow,
  'witness-bench': witnessBench,
  observatory,
  'first-gate': firstGate,
  'high-lookout': highLookout,
  'east-porch': {
    id: 'east-porch',
    order: 0,
    title: 'East porch',
    shortTitle: 'Porch',
    subtitle: 'A lamp is meant to be seen',
    blurb: 'Juniper’s lamp. You arrive here so today’s line can be seen.',
    intro: ['The east porch is where a line can be seen. Juniper keeps the lamp.'],
    icon: 'lamp',
    accent: '#ffcc33',
  },
}

function homeFor(id) {
  const tripleId = streetTripleForLine(id)
  const triple = STREET_TRIPLES.find((item) => item.id === tripleId)
  const place = STREET_NODES.find((node) => node.id === triple?.placeId)
  const person = STREET_NODES.find((node) => node.id === triple?.personId)
  return {
    place: place?.text ?? 'East porch',
    person: person?.text ?? 'Juniper Wick',
    plotId: place?.plotId ?? 'porch',
    who: person?.who ?? 'juniper',
  }
}

function areaIdForPlot(plotId) {
  return PLOT_AREA[plotId] ?? 'east-porch'
}

const LOCKED_EASY_LEARN = {
  'ph-father':
    'Jesus tells about a son who takes his share early and wastes it far from home. Hungry and ashamed, he starts a hired-hand speech to ask for work. But his father sees him while he is still a long way off and runs — mercy before the speech is done. He hugs the son. Honor is spent so the lost one can be welcomed; the feast is the father’s idea.',
}

function lessonXml(id, easyOrder) {
  const brief = evidenceFor(id)
  if (!brief) throw new Error(`Missing evidence for ${id}`)
  const plain = plainFor(id)
  const home = homeFor(id)
  const challenge = CHALLENGES.find((item) => item.id === id)
  const journal = journalEntries.find((entry) => entry.unlockAfter === id)
  const title = challenge?.title || journal?.title || brief.claim
  const idea = challenge?.idea
  const easyLearn = LOCKED_EASY_LEARN[id] || plain?.teach || brief.reason
  const mediumLearn = brief.reason
  const hardLearn = challenge?.deeper || journal?.body.join(' ') || brief.reason
  const easyWhy = easyWhyLine(brief.reason)
  const claimMiss = brief.claimChoices.filter((line) => line !== brief.claim)
  const whyMiss = brief.reasonChoices.filter((line) => line !== brief.reason)
  const journalXml = journal
    ? `
    <journal title="${escapeXml(journal.title)}" kicker="${escapeXml(journal.kicker)}">
      ${journal.body.map((para) => `<body>${cdata(para)}</body>`).join('\n      ')}
      ${journal.sources.map((src) => `<cite>${cdata(src)}</cite>`).join('\n      ')}
    </journal>`
    : ''

  function holdXml(tier, why, levelUpTo) {
    const up = levelUpTo ? ` levelUpTo="${levelUpTo}"` : ''
    return `<hold${up} onFail="easy">
        <why>${cdata(why)}</why>
        ${claimMiss.map((line) => `<claimMiss>${cdata(line)}</claimMiss>`).join('\n        ')}
        ${whyMiss.map((line) => `<whyMiss>${cdata(line)}</whyMiss>`).join('\n        ')}
      </hold>`
  }

  function matchXml() {
    return `<match sentence="${escapeXml(brief.claim)}" place="${escapeXml(home.place)}" person="${escapeXml(home.person)}" />`
  }

  return `  <lesson id="${escapeXml(id)}" title="${escapeXml(title)}"${idea ? ` idea="${escapeXml(idea)}"` : ''}>
    <claim>${cdata(brief.claim)}</claim>
    <plain>${cdata(plain?.gloss || brief.claim)}</plain>
    <source>${cdata(brief.source)}</source>
    <loci place="${escapeXml(home.place)}" person="${escapeXml(home.person)}" plotId="${escapeXml(home.plotId)}" who="${escapeXml(home.who)}" />${journalXml}
    <easy points="10" easyOrder="${easyOrder}">
      <learn>${cdata(easyLearn)}</learn>
      ${matchXml()}
      ${holdXml('easy', easyWhy, 'medium')}
    </easy>
    <medium points="12">
      <learn>${cdata(mediumLearn)}</learn>
      ${matchXml()}
      ${holdXml('medium', brief.reason, 'hard')}
    </medium>
    <hard points="15">
      <learn>${cdata(hardLearn)}</learn>
      ${matchXml()}
      ${holdXml('hard', brief.reason, '')}
    </hard>
  </lesson>`
}

function areaXml(areaId, lessons) {
  const meta = AREA_META[areaId]
  if (!meta) throw new Error(`No meta for ${areaId}`)
  const intro = meta.intro.map((line) => `  <intro>${cdata(line)}</intro>`).join('\n')
  return `<?xml version="1.0" encoding="UTF-8"?>
<area schemaVersion="3" id="${areaId}" order="${meta.order}" title="${escapeXml(meta.title)}" shortTitle="${escapeXml(meta.shortTitle)}" subtitle="${escapeXml(meta.subtitle)}" icon="${escapeXml(meta.icon)}" accent="${escapeXml(meta.accent)}">
  <blurb>${cdata(meta.blurb)}</blurb>
${intro}
${lessons.join('\n')}
</area>
`
}

mkdirSync(outDir, { recursive: true })

const grouped = {
  'parable-hollow': [],
  'witness-bench': [],
  observatory: [],
  'first-gate': [],
  'high-lookout': [],
  'east-porch': [],
}

STREET_FACT_IDS.forEach((id, index) => {
  const home = homeFor(id)
  const areaId = areaIdForPlot(home.plotId)
  grouped[areaId].push(lessonXml(id, index + 1))
})

const districtFiles = [
  'parable-hollow',
  'witness-bench',
  'observatory',
  'first-gate',
  'high-lookout',
]

for (const id of districtFiles) {
  writeFileSync(join(outDir, `${id}.xml`), areaXml(id, grouped[id]), 'utf8')
}

const porchLessons = grouped['east-porch']
const index = `<?xml version="1.0" encoding="UTF-8"?>
<packIndex schemaVersion="3" id="core-v0" title="Core trail">
  <area file="parable-hollow.xml" id="parable-hollow" />
  <area file="witness-bench.xml" id="witness-bench" />
  <area file="observatory.xml" id="observatory" />
  <area file="first-gate.xml" id="first-gate" />
  <area file="high-lookout.xml" id="high-lookout" />
  <area id="east-porch" order="0" title="East porch" shortTitle="Porch" subtitle="A lamp is meant to be seen" icon="lamp" accent="#ffcc33">
    <blurb>${cdata(AREA_META['east-porch'].blurb)}</blurb>
    <intro>${cdata(AREA_META['east-porch'].intro[0])}</intro>
${porchLessons.join('\n')}
  </area>
</packIndex>
`

writeFileSync(join(outDir, 'index.xml'), index, 'utf8')

const readme = `# Silver City XML packs

Schema **v3**. One file per district area, plus \`index.xml\` (East porch lessons live in the index).

These files are the Learn / Match / Hold **source of truth**. The play engine adapts them; do not invent conflicting lesson copy here.

See \`SCHEMA.md\`.
`

writeFileSync(join(outDir, 'README.md'), readme, 'utf8')

console.log(
  `export-packs: ${STREET_FACT_IDS.length} lessons → ${outDir}`,
)
