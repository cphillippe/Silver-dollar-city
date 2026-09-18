import { packLesson } from '../content/packCatalog.ts'
import { CLAIM_MERGE_LINE } from './claimMerge.ts'
import { EASY_LINE_ORDER } from './easy.ts'
import { FATHER_RUN_LINE } from './fatherRun.ts'
import { ROAD_MAZE_LINE } from './roadMaze.ts'
import { STORY_SNAP_LINE } from './storySnap.ts'
import { storyPlayFor, type StoryPlayKind } from './storyPlay.ts'

/** Hold Why Blast is journal lock-in, not a Match arcade. */
export type DebugPlayKind = StoryPlayKind | 'why-blast'

export interface DebugMiniGame {
  lineId: string
  play: DebugPlayKind
  name: string
}

export interface DebugPlayGroup {
  play: DebugPlayKind
  heading: string
  items: DebugMiniGame[]
}

const PLAY_HEADING: Record<DebugPlayKind, string> = {
  'road-maze': 'Road maze',
  'father-run': 'Father run',
  'story-snap': 'Story snap',
  'panel-blast': 'Gem Match / word search',
  'claim-merge': 'Claim merge',
  'source-dig': 'Source dig',
  'why-blast': 'Hold Why Blast',
}

const LAYER_ORDER: DebugPlayKind[] = [
  'road-maze',
  'father-run',
  'story-snap',
  'panel-blast',
  'claim-merge',
  'source-dig',
  'why-blast',
]

/** Layers Bill asked to jump cold — at least one of each Easy play kind. */
export const DEBUG_LAYER_LINES = {
  'road-maze': ROAD_MAZE_LINE,
  'father-run': FATHER_RUN_LINE,
  'story-snap': STORY_SNAP_LINE,
  'panel-blast': 'ph-debt',
  'claim-merge': CLAIM_MERGE_LINE,
  'source-dig': 'wb-women',
  'names-dig': 'daily-names',
  'stone-dig': 'sc-tacitus',
  'ink-dig': 'ic-trajan',
  'why-blast': ROAD_MAZE_LINE,
} as const

function lessonName(id: string): string {
  const lesson = packLesson(id)
  return lesson?.title || lesson?.idea || id
}

export function debugPlayLabel(item: DebugMiniGame): string {
  return `${item.lineId} · ${item.name}`
}

/** Every Easy-line play, plus Hold Why Blast. Grouped by mechanic. */
export function debugMiniGames(): DebugMiniGame[] {
  const plays: DebugMiniGame[] = EASY_LINE_ORDER.map((lineId) => ({
    lineId,
    play: storyPlayFor(lineId),
    name: lessonName(lineId),
  }))
  plays.push({
    lineId: DEBUG_LAYER_LINES['why-blast'],
    play: 'why-blast',
    name: 'Hold Why Blast',
  })
  return plays
}

export function debugPlayGroups(): DebugPlayGroup[] {
  const games = debugMiniGames()
  return LAYER_ORDER.map((play) => ({
    play,
    heading: PLAY_HEADING[play],
    items: games.filter((item) => item.play === play),
  })).filter((group) => group.items.length > 0)
}

export function debugJumpView(item: DebugMiniGame):
  | { name: 'link'; debugLine: string }
  | { name: 'journal'; focusId: string; autoQuiz: true } {
  if (item.play === 'why-blast') {
    return { name: 'journal', focusId: item.lineId, autoQuiz: true }
  }
  return { name: 'link', debugLine: item.lineId }
}
