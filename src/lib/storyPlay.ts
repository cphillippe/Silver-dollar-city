import { gemWordsFor } from './gemSearch.ts'
import { storyPanelsFor, type StoryPanel } from './storyPanels.ts'
import { FATHER_RUN_LINE } from './fatherRun.ts'
import { ROAD_MAZE_LINE } from './roadMaze.ts'

/**
 * How this lesson is *played*. Same shell always: teach beats → play → Hold.
 * ph-road is road-maze. ph-father is father-run. Other Easy lines stay panel-blast.
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
