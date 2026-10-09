import { DAILY_POOL } from '../content/daily.ts'
import { firstGate } from '../content/firstGate.ts'
import { highLookout } from '../content/highLookout.ts'
import { observatory } from '../content/observatory.ts'
import { parableHollow } from '../content/parableHollow.ts'
import { witnessBench } from '../content/witnessBench.ts'
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
  'why-blast': 'Lock In Why Blast',
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
    name: 'Lock In Why Blast',
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

/** Cold jump to Night Watch — pair with Settings debug freeze for playtests. */
export function debugNightWatchJump(): { name: 'defend' } {
  return { name: 'defend' }
}

export interface StoryStripLine {
  lineId: string
  name: string
  areaId: string
}

/** Same streets as `areas` in content/index.ts. A new street belongs in both. */
const STORY_STRIP_AREAS = [parableHollow, witnessBench, observatory, firstGate, highLookout]

/** Every sequence puzzle. Easy plays these as Story Strip. */
export function storyStripLines(): StoryStripLine[] {
  const lines: StoryStripLine[] = []
  for (const area of STORY_STRIP_AREAS) {
    for (const challenge of area.challenges) {
      if (challenge.kind !== 'sequence') continue
      lines.push({ lineId: challenge.id, name: challenge.title, areaId: area.id })
    }
  }
  for (const daily of DAILY_POOL) {
    if (daily.challenge.kind !== 'sequence') continue
    lines.push({
      lineId: daily.challenge.id,
      name: daily.challenge.title,
      areaId: 'daily-trail',
    })
  }
  return lines
}

export function debugStoryStripLabel(item: StoryStripLine): string {
  return `${item.lineId} · ${item.name}`
}

/** One tap into the strip. Daily lines open the morning trail; the rest open the street puzzle. */
export function debugStoryStripJump(item: StoryStripLine):
  | { name: 'daily'; forceId: string; debugStrip: true }
  | { name: 'challenge'; areaId: string; challengeId: string; debugStrip: true } {
  if (item.lineId.startsWith('daily-')) {
    return { name: 'daily', forceId: item.lineId, debugStrip: true }
  }
  return {
    name: 'challenge',
    areaId: item.areaId,
    challengeId: item.lineId,
    debugStrip: true,
  }
}
