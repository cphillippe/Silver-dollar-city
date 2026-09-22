import type { CharacterId } from '../content/story.ts'
import { packLesson } from '../content/packCatalog.ts'
import { evidenceFor } from '../content/evidence.ts'
import type { CityPlotId } from './city.ts'
import { easyFacingLine, easyWhoWhere } from './easy.ts'

/** Place · person · idea loci for Learn stamps (secondary to Match teach chips). */
export interface LociStampSpec {
  whoId: CharacterId
  placeLabel: string
  ideaShort: string
  plotId: CityPlotId
}

/**
 * Why Gate first (theology locked):
 * - Ansel @ Swinging Arch: order/reason/ought/mover/kalām/limits hinges — NOT "faith hinges on Jesus"
 * - Cosmo @ Bedrock Step: living God is the Rock; Cosmo points, is not the Rock
 */
const LOCI_STAMP: Record<string, LociStampSpec> = {
  'fg-order': {
    whoId: 'ansel',
    placeLabel: 'Why Gate · Swinging Arch',
    ideaShort: 'World holds in Christ',
    plotId: 'gate',
  },
  'fg-reason': {
    whoId: 'ansel',
    placeLabel: 'Why Gate · Swinging Arch',
    ideaShort: "Reason from God's light",
    plotId: 'gate',
  },
  'fg-ought': {
    whoId: 'ansel',
    placeLabel: 'Why Gate · Swinging Arch',
    ideaShort: "Ought is God's law",
    plotId: 'gate',
  },
  'fg-mover': {
    whoId: 'ansel',
    placeLabel: 'Why Gate · Swinging Arch',
    ideaShort: 'Motion needs First',
    plotId: 'gate',
  },
  'fg-kalam': {
    whoId: 'ansel',
    placeLabel: 'Why Gate · Swinging Arch',
    ideaShort: 'What began has Cause',
    plotId: 'gate',
  },
  'fg-limits': {
    whoId: 'ansel',
    placeLabel: 'Why Gate · Swinging Arch',
    ideaShort: 'Limits point beyond',
    plotId: 'gate',
  },
  'fg-ground': {
    whoId: 'cosmo',
    placeLabel: 'Why Gate · Bedrock Step',
    ideaShort: 'Living God is the Rock',
    plotId: 'gate',
  },
  'fg-contingent': {
    whoId: 'cosmo',
    placeLabel: 'Why Gate · Bedrock Step',
    ideaShort: 'Depends on a Maker',
    plotId: 'gate',
  },
}

/** Registry-only — Match uses MATCH_CHIPS; stamp is secondary chrome. */
export function lociStampEntry(lessonId: string): LociStampSpec | undefined {
  return LOCI_STAMP[lessonId]
}

function shortenIdea(text: string, maxWords = 6): string {
  const words = text
    .replace(/[—–]/g, ' ')
    .replace(/[.!?].*$/, '')
    .trim()
    .split(/\s+/)
    .filter(Boolean)
  if (words.length <= maxWords) return words.join(' ')
  return words.slice(0, maxWords).join(' ')
}

function deriveStamp(lessonId: string): LociStampSpec {
  const home = easyWhoWhere(lessonId)
  const lesson = packLesson(lessonId)
  const claim = lesson?.idea || lesson?.claim || evidenceFor(lessonId)?.claim || home.place
  const idea = shortenIdea(easyFacingLine(lessonId, claim))
  const rawPlot = (lesson?.loci?.plotId as CityPlotId) || 'porch'
  const plotId: CityPlotId =
    rawPlot === 'gate' ||
    rawPlot === 'hollow' ||
    rawPlot === 'bench' ||
    rawPlot === 'observatory' ||
    rawPlot === 'lookout' ||
    rawPlot === 'porch' ||
    rawPlot === 'journal' ||
    rawPlot === 'lamps'
      ? rawPlot
      : 'porch'
  return {
    whoId: home.whoId,
    placeLabel: home.place,
    ideaShort: idea,
    plotId,
  }
}

/** Always returns a stamp — registry Why Gate first, else easyWhoWhere + short idea. */
export function lociStampFor(lessonId: string): LociStampSpec {
  return LOCI_STAMP[lessonId] ?? deriveStamp(lessonId)
}
