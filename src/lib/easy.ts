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
  linkMatch: 'Connect sentence → place → person.',
  linkDemo: 'Connect sentence → place → person',
  connectLink: 'Connect sentence → place → person',
  readStory: 'Read today’s story.',
  rememberSentence: 'Choose the sentence to remember.',
  readAgain: 'Read this one again.',
  claimTeach: 'A claim is what we hold to be true.',
  upgrade: 'Build this — raise the next look you earned by learning',
  manage: 'Building',
  nightDo: 'Do this',
  nightTap: 'Tap the walker.',
  deployTeach: 'Deploy means use a claim you held.',
} as const

export function scrapbookLabel(easy: boolean, lit?: number) {
  if (!easy) {
    return lit === undefined ? 'Mind map' : `Mind map · ${lit} lit`
  }
  return lit === undefined
    ? 'Your scrapbook of links'
    : `Your scrapbook of links · ${lit} lit`
}
