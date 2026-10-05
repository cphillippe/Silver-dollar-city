import type { ProgressState } from '../types.ts'
import type { CharacterId } from '../content/story.ts'
import { CAST } from '../content/story.ts'
import { evidenceFor } from '../content/evidence.ts'
import { packLesson } from '../content/packCatalog.ts'
import { CITY_PLOTS, type CityPlotId } from './city.ts'

import { EASY } from './easyUi.ts'
export { EASY }
import { EASY_CHROME } from './easyChrome.ts'

export {
  DIG_ARC,
  INK_ARC,
  NAMES_ARC,
  STONE_ARC,
  digPrior,
  inkPrior,
  isSourceDigLine,
  namesPrior,
  stonePrior,
} from './sourceDig.ts'

/** Easy trail loop — defined once in the trail home; these are the same bindings. */
export {
  EASY_LINE_ORDER,
  EASY_MATCH_LINE,
  FOUNDATION_ARC,
  digReady,
  easyHoldFields,
  easyHoldLine,
  easyHoldPractice,
  easyHoldView,
  easyHomeFocus,
  easyLockInExit,
  easyLearnLine,
  easyLineHeld,
  easyLineLearned,
  easyLineTaught,
  easyLoopLine,
  easyMatchLine,
  easyMatchReady,
  easyTeachFields,
  easyTrailView,
  foundationPrior,
  foundationReady,
  inkReady,
  markEasyHeld,
  markEasyTaught,
  namesReady,
  progressAfterMatchTaught,
  stoneReady,
} from '../easyTrail/trail/loop.ts'
export type { EasyHomeFocus } from '../easyTrail/trail/loop.ts'

export function isEasy(progress: Pick<ProgressState, 'easyMode'> | { easyMode?: boolean }): boolean {
  return Boolean(progress.easyMode)
}

/** One short play cue — full tap-order sentence stays on the Start screen. */
export function easyLinkStep(step: 'idea' | 'place' | 'person'): string {
  if (step === 'idea') return EASY.tapSentence
  if (step === 'place') return EASY.tapPlace
  return EASY.tapPerson
}

/** One Easy miss line. Names the card to tap. */
export function easyWrongTap(card: string): string {
  const label = card.replace(/\.$/, '').trim()
  return `Wrong. Tap this one: ${label}.`
}

/** Hard Night Watch Love chrome — mechanic how-to, not a claim to hold. */
export const LOVE_HOW_HARD =
  'Love — tap the matching face. A true line turns a lie toward heaven.'

const EASY_LINES: Record<string, string> = {
  'td-watch': EASY.loveCue,
}

export function loveHowTo(easy: boolean): string {
  return easy ? EASY.loveCue : LOVE_HOW_HARD
}

/** After the one teach, Easy never wallpapers the word claim. */
export function easyMainIdea(text: string): string {
  return text
    .replace(new RegExp('\\bcheap cla' + 'im\\b', 'gi'), 'unkind sentence')
    .replace(new RegExp('\\bcheap li' + 'ne\\b', 'gi'), 'unkind sentence')
    .replace(/\bmean lines\b/gi, 'unkind sentences')
    .replace(/\bmean line\b/gi, 'unkind sentence')
    .replace(/\bthe claims\b/gi, 'the main ideas')
    .replace(/\ba claim\b/gi, 'a main idea')
    .replace(/\bthe claim\b/gi, 'the main idea')
    .replace(/\bA claim\b/g, 'A main idea')
    .replace(/\bThe claim\b/g, 'The main idea')
    .replace(/\bsoils\b/gi, 'ground')
}

/** Easy buttons, tiles, and hints — plain words plus a short example. Hard copy stays. */
export function easyChromeLine(text: string): string {
  const direct = EASY_CHROME[text]
  if (direct) return direct
  return easyMainIdea(text)
    .replace(/first-century banking/gi, 'old money rules')
    .replace(/\bcontradiction\b/gi, "doesn't add up")
    .replace(/\bthrottles\b/gi, 'chokes')
    .replace(/\bthrottle\b/gi, 'choke')
}

/** True when two Easy chrome lines are the same Keep/Toss cue (hint ≈ lead). */
export function easyChromeNearDup(a: string, b: string): boolean {
  const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, '')
  const na = norm(a)
  const nb = norm(b)
  if (!na || !nb) return false
  return na === nb || na.startsWith(nb) || nb.startsWith(na)
}

const WHY_WORD_CAP = 12

/** Count words in an Easy why face. Em-dashes count as breaks, not words. */
export function easyWhyWordCount(text: string): number {
  return text
    .replace(/[—–]/g, ' ')
    .replace(/[“”"'‘’*,:;!?().]/g, '')
    .split(/\s+/)
    .filter(Boolean).length
}

/** One short Easy why chip — first sentence, ~8–12 words, no stacked theology. */
export function easyWhyLine(text: string): string {
  const face = easyChromeLine(text).trim()
  const first = face.split(/(?<=[.!?])\s+/)[0] ?? face
  const words = first.split(/\s+/).filter(Boolean)
  if (words.length <= WHY_WORD_CAP) return first
  return words.slice(0, WHY_WORD_CAP).join(' ')
}

function easyPictureWord(beat: string): string {
  const text = beat.toLowerCase()
  if (text.includes('neighbor')) return 'neighbor picture'
  if (text.includes('tomb') || text.includes('empty')) return 'empty-tomb picture'
  if (text.includes('star') || text.includes('sky') || text.includes('heaven')) return 'star picture'
  if (text.includes('bread') || text.includes('table') || text.includes('cup')) return 'shared-table picture'
  if (text.includes('seed') || text.includes('ground') || text.includes('soil')) return 'seed picture'
  if (text.includes('lamp') || text.includes('light')) return 'lamp picture'
  if (
    text.includes('unkind sentence') ||
    text.includes('mean line') ||
    text.includes('true one') ||
    text.includes('true line')
  ) {
    return 'true-line picture'
  }
  return 'story picture'
}

/** Easy Journal meta: who · where · picture · tool. No Anchored / deploys / after-quote. */
export function easyJournalMeta(learning: {
  anchor: string
  beat?: string
  tool?: string
}): string {
  const bits = learning.anchor.split(' · ').map((part) => part.trim())
  const who = bits[0] || 'Juniper'
  const where = (bits[1] ?? '').replace(/\s*after\s+.*/i, '').trim() || 'East porch'
  const picture = easyPictureWord(learning.beat ?? '')
  const parts = [who, where, picture]
  if (learning.tool) parts.push(`used as ${learning.tool}`)
  return parts.join(' · ')
}

export function easyFacingLine(id: string | undefined, text: string): string {
  if (id && EASY_LINES[id]) {
    const easy = EASY_LINES[id]
    if (text === easy || text === evidenceFor(id)?.claim) return easy
  }
  return easyMainIdea(text)
}

/** Hold review chips: one button per shown line. Keep the true answer; drop identical faces. */
export function uniqueHoldChoices(
  lines: readonly string[],
  face: (line: string) => string,
  keep: string,
): string[] {
  const seen = new Set<string>()
  const picked: string[] = []
  const queue = [keep, ...lines.filter((line) => line !== keep)]
  for (const line of queue) {
    const label = face(line).trim()
    if (!label || seen.has(label)) continue
    seen.add(label)
    picked.push(line)
  }
  const order = new Map<string, number>()
  lines.forEach((line, index) => {
    if (!order.has(line)) order.set(line, index)
  })
  if (!order.has(keep)) order.set(keep, -1)
  return picked.sort((a, b) => (order.get(a) ?? 99) - (order.get(b) ?? 99))
}

/** Gold Town next tap — name what opens, not a bare “Tap this next.” */
export function easyTapNext(goal: { kind: string; areaId?: string }): string {
  if (goal.kind === 'daily') return 'Tap this next — short Jesus story'
  if (goal.kind === 'vista') return 'Tap this next — the lookout'
  if (goal.kind === 'welcome') return 'Tap this next — begin'
  if (goal.areaId === 'parable-hollow') return 'Tap this next — Mercy’s creek'
  if (goal.areaId === 'witness-bench') return 'Tap this next — public names'
  if (goal.areaId === 'observatory') return 'Tap this next — sky walk'
  if (goal.areaId === 'first-gate') return 'Tap this next — why a world'
  if (goal.areaId === 'high-lookout') return 'Tap this next — meaning walk'
  if (goal.areaId === 'stone-court') return 'Tap this next — old names'
  if (goal.areaId === 'ink-court') return 'Tap this next — more ink'
  return 'Tap this next'
}

function firstSentence(text: string): string {
  const cut = text.trim().split(/(?<=[.!?])\s+/)[0] ?? text
  return cut.length > 160 ? `${cut.slice(0, 157)}…` : cut
}

/** One-or-two-line Easy story card — not the teach wall. */
export function easyStoryCard(text: string): string {
  return firstSentence(text)
}

const LINE_HOME: Record<string, { whoId: CharacterId; plotId: CityPlotId }> = {
  'ph-road': { whoId: 'mercy', plotId: 'hollow' },
  'ph-father': { whoId: 'mercy', plotId: 'hollow' },
  'ph-debt': { whoId: 'mercy', plotId: 'hollow' },
  'wb-creed': { whoId: 'silas', plotId: 'bench' },
  'wb-women': { whoId: 'silas', plotId: 'bench' },
  'daily-names': { whoId: 'silas', plotId: 'bench' },
  'daily-creed': { whoId: 'silas', plotId: 'bench' },
  'daily-empty': { whoId: 'silas', plotId: 'bench' },
  'sc-tacitus': { whoId: 'silas', plotId: 'bench' },
  'sc-james': { whoId: 'silas', plotId: 'bench' },
  'sc-pliny': { whoId: 'silas', plotId: 'bench' },
  'ic-trajan': { whoId: 'silas', plotId: 'bench' },
  'ic-suetonius': { whoId: 'silas', plotId: 'bench' },
  'ic-lucian': { whoId: 'silas', plotId: 'bench' },
  'daily-lantern': { whoId: 'juniper', plotId: 'porch' },
  'daily-stars': { whoId: 'nora', plotId: 'observatory' },
  'daily-cosmos': { whoId: 'ansel', plotId: 'gate' },
  'fg-ground': { whoId: 'cosmo', plotId: 'gate' },
  'fg-contingent': { whoId: 'cosmo', plotId: 'gate' },
  'hl-moral': { whoId: 'hope', plotId: 'lookout' },
}

function homeFor(id: string): { whoId: CharacterId; plotId: CityPlotId } {
  if (LINE_HOME[id]) return LINE_HOME[id]
  if (id.startsWith('ph-') || id === 'td-watch') return { whoId: 'mercy', plotId: 'hollow' }
  if (id.startsWith('wb-') || id.startsWith('sc-') || id.startsWith('ic-')) return { whoId: 'silas', plotId: 'bench' }
  if (id.startsWith('ob-')) return { whoId: 'nora', plotId: 'observatory' }
  if (id.startsWith('fg-')) return { whoId: 'ansel', plotId: 'gate' }
  if (id.startsWith('hl-')) return { whoId: 'hope', plotId: 'lookout' }
  return { whoId: 'juniper', plotId: 'porch' }
}

export interface EasyWhoWhere {
  who: string
  whoName: string
  whoId: CharacterId
  place: string
}

/** First Learn names who keeps the line and where it lives. */
export function easyWhoWhere(id: string): EasyWhoWhere {
  const lesson = packLesson(id)
  if (lesson?.loci) {
    const whoId = (lesson.loci.who as CharacterId) in CAST
      ? (lesson.loci.who as CharacterId)
      : homeFor(id).whoId
    const keeper = CAST[whoId] ?? CAST.juniper
    return {
      who: keeper.shortName,
      whoName: keeper.name,
      whoId: keeper.id,
      place: lesson.loci.place || easyWhoWhereFallback(id).place,
    }
  }
  return easyWhoWhereFallback(id)
}

function easyWhoWhereFallback(id: string): EasyWhoWhere {
  const home = homeFor(id)
  const keeper = CAST[home.whoId]
  const lot = CITY_PLOTS.find((plot) => plot.id === home.plotId)
  return {
    who: keeper.shortName,
    whoName: keeper.name,
    whoId: keeper.id,
    place: lot?.title ?? 'East porch',
  }
}

export function easyWhoWhereLine(id: string): string {
  const { who, place } = easyWhoWhere(id)
  return `This idea lives at ${place}, with ${who}.`
}

export function scrapbookLabel(easy: boolean, lit?: number) {
  if (!easy) {
    return lit === undefined ? 'Mind map' : `Mind map · ${lit} lit`
  }
  return lit === undefined ? EASY.connections : `${EASY.connections} · ${lit} lit`
}
