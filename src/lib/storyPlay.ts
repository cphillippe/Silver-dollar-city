import { gemWordsFor } from './gemSearch.ts'
import { storyPanelsFor, type StoryPanel } from './storyPanels.ts'
import { FATHER_RUN_LINE } from './fatherRun.ts'

/**
 * How this lesson is *played*. Same shell always: teach beats → play → Hold.
 * panel-blast for mercy and the rest of Easy. ph-father is father-run.
 * Queued later (do not mount): Samaritan road-swipe, claim-merge, story-night TD.
 */
export type StoryPlayKind = 'panel-blast' | 'father-run'

export interface LessonStory {
  lineId: string
  play: StoryPlayKind
  beats: StoryPanel[]
}

/** Mechanic for this lesson. Hold does not read this. */
export function storyPlayFor(lineId: string): StoryPlayKind {
  if (lineId === FATHER_RUN_LINE) return 'father-run'
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
