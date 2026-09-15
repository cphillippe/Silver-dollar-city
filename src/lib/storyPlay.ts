import { FATHER_RUN_LINE } from './fatherRun.ts'
import { gemWordsFor } from './gemSearch.ts'
import { ROAD_MAZE_LINE } from './roadMaze.ts'
import { storyPanelsFor, type StoryPanel } from './storyPanels.ts'

/**
 * How this lesson is *played*. Same shell always: teach beats → play → Hold.
 * ph-father is the hold-to-run timing dash. ph-road is the Samaritan collect maze.
 * Other Easy lessons stay panel-blast so gem extras (Gap, +100) keep working.
 * Queued later (do not mount): claim-merge, story-night TD.
 */
export type StoryPlayKind = 'panel-blast' | 'father-run' | 'road-maze'

export interface LessonStory {
  lineId: string
  play: StoryPlayKind
  beats: StoryPanel[]
}

/** Mechanic for this lesson. Hold does not read this. */
export function storyPlayFor(lineId: string): StoryPlayKind {
  if (lineId === FATHER_RUN_LINE) return 'father-run'
  if (lineId === ROAD_MAZE_LINE) return 'road-maze'
  return 'panel-blast'
}

/** Beats + media slots for the open lesson. Swap `play` later without rewriting Hold. */
export function lessonStory(lineId: string, wordCount = gemWordsFor(lineId).length): LessonStory {
  return {
    lineId,
    play: storyPlayFor(lineId),
    beats: storyPanelsFor(lineId, wordCount),
  }
}
