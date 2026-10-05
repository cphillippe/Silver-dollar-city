/**
 * Match kinds home (A1). Every StoryPlayKind maps to the play Match mounts for it.
 * father-run stays a Match kind (LinkScreen → PuzzlePlay → FatherRunPlay); its play lives in the A2 Father home.
 */
import type { ReactElement } from 'react'
import { ClaimMergePlay } from '../../components/challenges/ClaimMergePlay'
import { GemSearchPlay } from '../../components/challenges/GemSearchPlay'
import { RoadMazePlay } from '../../components/challenges/RoadMazePlay'
import { SourceDigPlay } from '../../components/challenges/SourceDigPlay'
import { StorySnapPlay } from '../../components/challenges/StorySnapPlay'
import type { LessonStory, StoryPlayKind } from '../../lib/storyPlay.ts'
import { FatherRunPlay } from '../father/FatherRunPlay'

/** What PuzzlePlay hands the Easy/link play. */
export interface StoryPlayWiring {
  /** Source dig clock only. */
  easy: boolean
  onMiss: () => void
  onClear: () => void
  onEasyStop?: (dest: 'hold' | 'home') => void
}

/** Runs inside PuzzlePlay's render — no hooks. */
type StoryPlayMount = (story: LessonStory, wire: StoryPlayWiring) => ReactElement

/** A kind without an entry fails tsc instead of mounting a blank Match. */
export const STORY_PLAY_REGISTRY: Record<StoryPlayKind, StoryPlayMount> = {
  'panel-blast': (story, wire) => (
    <GemSearchPlay
      lineId={story.lineId}
      beats={story.beats}
      onMiss={wire.onMiss}
      onClear={wire.onClear}
      onEasyStop={wire.onEasyStop}
    />
  ),
  'father-run': (story, wire) => (
    <FatherRunPlay
      lineId={story.lineId}
      beats={story.beats}
      onMiss={wire.onMiss}
      onClear={wire.onClear}
      onEasyStop={wire.onEasyStop}
    />
  ),
  'road-maze': (story, wire) => (
    <RoadMazePlay
      key={story.lineId}
      lineId={story.lineId}
      beats={story.beats}
      onMiss={wire.onMiss}
      onClear={wire.onClear}
      onEasyStop={wire.onEasyStop}
    />
  ),
  'claim-merge': (story, wire) => (
    <ClaimMergePlay
      lineId={story.lineId}
      beats={story.beats}
      onMiss={wire.onMiss}
      onClear={wire.onClear}
      onEasyStop={wire.onEasyStop}
    />
  ),
  'source-dig': (story, wire) => (
    <SourceDigPlay
      lineId={story.lineId}
      easy={wire.easy}
      onMiss={wire.onMiss}
      onClear={wire.onClear}
      onEasyStop={wire.onEasyStop}
    />
  ),
  'story-snap': (story, wire) => (
    <StorySnapPlay
      lineId={story.lineId}
      beats={story.beats}
      onMiss={wire.onMiss}
      onClear={wire.onClear}
      onEasyStop={wire.onEasyStop}
    />
  ),
}

/** Unknown play falls back to panel-blast. */
export function renderStoryPlay(story: LessonStory, wire: StoryPlayWiring): ReactElement {
  const mount = STORY_PLAY_REGISTRY[story.play] ?? STORY_PLAY_REGISTRY['panel-blast']
  return mount(story, wire)
}
