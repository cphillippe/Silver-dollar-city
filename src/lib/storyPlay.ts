import { gemWordsFor } from './gemSearch.ts'
import { storyPanelsFor, type StoryPanel } from './storyPanels.ts'

/**
 * How this lesson is *played*. Same shell always: teach beats → play → Hold.
 * Every Easy Match is panel-blast (gem board) so extras like Gap can ship.
 * Father-run and road-maze stay in the tree, unmounted until bonus words are live.
 * Queued later (do not mount): claim-merge, story-night TD.
 */
export type StoryPlayKind = 'panel-blast' | 'father-run' | 'road-maze'

export interface LessonStory {
  lineId: string
  play: StoryPlayKind
  beats: StoryPanel[]
}

/** Mechanic for this lesson. Hold does not read this. */
export function storyPlayFor(_lineId: string): StoryPlayKind {
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
