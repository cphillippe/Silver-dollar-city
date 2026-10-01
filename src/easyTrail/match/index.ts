/**
 * Match shelf. The A1 Match registry (registry.tsx) maps every StoryPlayKind to its play.
 * PuzzlePlay still owns sort / sequence / build-argument / Hard link / MatchPlay.
 */
export { PuzzlePlay } from '../../components/PuzzlePlay'
export { STORY_PLAY_REGISTRY, renderStoryPlay } from './registry'
export type { StoryPlayWiring } from './registry'
export { lessonStory, storyPlayFor } from '../../lib/storyPlay.ts'
export type { LessonStory, StoryPlayKind } from '../../lib/storyPlay.ts'
