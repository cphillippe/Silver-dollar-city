import { gemWordsFor } from './gemSearch.ts'
import { storyPanelsFor, type StoryPanel } from './storyPanels.ts'

/**
 * How this lesson is *played*. Same shell always: teach beats → play → Hold.
 * This climb is panel blast only. Queued later (do not mount): father-run
 * timing dash, Samaritan road-swipe, claim-merge, story-night TD.
 */
export type StoryPlayKind = 'panel-blast'

export interface LessonStory {
  lineId: string
  play: StoryPlayKind
  beats: StoryPanel[]
}

/** Mechanic for this lesson. Hold does not read this. */
export function storyPlayFor(_lineId: string): StoryPlayKind {
  void _lineId
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
