/**
 * Match shelf — surface only. PuzzlePlay and story play stay in their files.
 * A1 Match registry is later. This shelf does not own a registry.
 */
export { PuzzlePlay } from '../../components/PuzzlePlay'
export { lessonStory, storyPlayFor } from '../../lib/storyPlay.ts'
export type { LessonStory, StoryPlayKind } from '../../lib/storyPlay.ts'
