import type { ProgressState } from '../types.ts'

export function isEasy(progress: Pick<ProgressState, 'easyMode'> | { easyMode?: boolean }): boolean {
  return Boolean(progress.easyMode)
}

/** Easy-mode chrome. Same truths — simpler labels. Teach hard words; don’t silently drop them. */
export const EASY = {
  creed: 'old shared belief',
  parable: 'Jesus story',
  mindMap: 'your scrapbook of matches',
  mindMapShort: 'Scrapbook',
  connectLink: 'Tap the sentence, then the place, then the person.',
  readStory: 'Read today’s story.',
  rememberSentence: 'Choose the main idea to remember.',
  readAgain: 'Read this one again.',
  claimTeach: 'A claim is the main idea we hold to be true.',
  mainIdeaTeach: 'Main idea = the short true line we keep.',
  mainIdea: 'main idea',
  reasonSense: 'why this is true',
  sourceSense: 'where this comes from',
  lockIn: 'Save your picks.',
  matchHow: 'Keep the right pictures. Remove wrong picks.',
  tapSentence: 'Tap a sentence',
  tapPlace: 'Tap a place',
  tapPerson: 'Tap a person',
  upgrade: 'Build this — raise the next look you earned by learning',
  manage: 'Building',
  nightDo: 'Do this',
  nightTap: 'Tap this person.',
  loveCue: 'Love — tap the person',
  deployTeach: 'Use a main idea you kept.',
  saved: 'Saved sentences',
  connections: 'Connections',
  uses: 'Things you can use',
} as const

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

const EASY_LINES: Record<string, string> = {
  'td-watch': 'A true main idea can turn a mean line around.',
}

/** After the one teach, Easy never wallpapers the word claim. */
export function easyMainIdea(text: string): string {
  return text
    .replace(new RegExp('\\bcheap cla' + 'im\\b', 'gi'), 'mean line')
    .replace(new RegExp('\\bcheap li' + 'ne\\b', 'gi'), 'mean line')
    .replace(/\bthe claims\b/gi, 'the main ideas')
    .replace(/\ba claim\b/gi, 'a main idea')
    .replace(/\bthe claim\b/gi, 'the main idea')
    .replace(/\bA claim\b/g, 'A main idea')
    .replace(/\bThe claim\b/g, 'The main idea')
    .replace(/\bsoils\b/gi, 'ground')
    .replace(new RegExp('\\s+toward heav' + 'en\\.?', 'gi'), '.')
}

function easyPictureWord(beat: string): string {
  const text = beat.toLowerCase()
  if (text.includes('neighbor')) return 'neighbor picture'
  if (text.includes('tomb') || text.includes('empty')) return 'empty-tomb picture'
  if (text.includes('star') || text.includes('sky') || text.includes('heaven')) return 'star picture'
  if (text.includes('bread') || text.includes('table') || text.includes('cup')) return 'shared-table picture'
  if (text.includes('seed') || text.includes('ground') || text.includes('soil')) return 'seed picture'
  if (text.includes('lamp') || text.includes('light')) return 'lamp picture'
  if (text.includes('mean line') || text.includes('true one') || text.includes('true line')) {
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
  if (id && EASY_LINES[id]) return EASY_LINES[id]
  return easyMainIdea(text)
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

export function scrapbookLabel(easy: boolean, lit?: number) {
  if (!easy) {
    return lit === undefined ? 'Mind map' : `Mind map · ${lit} lit`
  }
  return lit === undefined ? EASY.connections : `${EASY.connections} · ${lit} lit`
}
