import type { ProgressState } from '../types.ts'

export function isEasy(progress: Pick<ProgressState, 'easyMode'> | { easyMode?: boolean }): boolean {
  return Boolean(progress.easyMode)
}

/** Easy-mode chrome. Same truths — simpler labels. Teach hard words; don’t silently drop them. */
export const EASY = {
  creed: 'old shared belief',
  parable: 'Jesus story',
  mindMap: 'your scrapbook of links',
  mindMapShort: 'Scrapbook',
  linkMatch: 'Match sentence → place → person.',
  linkDemo: 'Match sentence → place → person',
  connectLink: 'Match sentence → place → person',
  linkStreet: 'Match sentence → place → person',
  readStory: 'Read today’s story.',
  rememberSentence: 'Choose the main idea to remember.',
  readAgain: 'Read this one again.',
  claimTeach: 'A claim is the main idea we hold to be true.',
  mainIdea: 'main idea',
  lockIn: 'Save your picks.',
  upgrade: 'Build this — raise the next look you earned by learning',
  manage: 'Building',
  nightDo: 'Do this',
  nightTap: 'Tap the walker.',
  deployTeach: 'Deploy means use a main idea you kept.',
} as const

/** Gold Town next tap — name what opens, not a bare “Tap this next.” */
export function easyTapNext(goal: { kind: string; areaId?: string }): string {
  if (goal.kind === 'daily') return 'Tap this next — short Jesus story'
  if (goal.kind === 'vista') return 'Tap this next — the lookout'
  if (goal.kind === 'welcome') return 'Tap this next — begin'
  if (goal.areaId === 'parable-hollow') return 'Tap this next — Jesus-story walk'
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
  return lit === undefined ? 'What you matched' : `What you matched · ${lit} lit`
}
