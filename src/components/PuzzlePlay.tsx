import type { Challenge } from '../types'
import { isEasy, easyMatchLine } from '../lib/easy'
import { lessonStory } from '../lib/storyPlay'
import { useProgress } from '../store/progress'
import { BuildArgumentPlay } from './challenges/BuildArgumentPlay'
import { ClaimMergePlay } from './challenges/ClaimMergePlay'
import { FatherRunPlay } from './challenges/FatherRunPlay'
import { GemSearchPlay } from './challenges/GemSearchPlay'
import { RoadMazePlay } from './challenges/RoadMazePlay'
import { SourceDigPlay } from './challenges/SourceDigPlay'
import { LinkPlay } from './challenges/LinkPlay'
import { MatchPlay } from './challenges/MatchPlay'
import { SequencePlay } from './challenges/SequencePlay'
import { SortPlay } from './challenges/SortPlay'

interface PuzzlePlayProps {
  challenge: Challenge
  onMiss: () => void
  onSolved: () => void
  onPeek?: () => void
  onEasyStop?: (dest: 'hold' | 'home') => void
  streetBeat?: { place: string; linkedAfter: number; total: number; left: number }
  /** Settings Debug jump — play this line instead of the open Easy loop. */
  lineId?: string
}

export function PuzzlePlay({
  challenge,
  onMiss,
  onSolved,
  onPeek,
  onEasyStop,
  streetBeat,
  lineId,
}: PuzzlePlayProps) {
  const { progress } = useProgress()
  if (challenge.kind === 'sort') {
    return (
      <SortPlay
        challenge={challenge}
        onMiss={onMiss}
        onSolved={onSolved}
        onPeek={onPeek}
      />
    )
  }
  if (challenge.kind === 'sequence') {
    return (
      <SequencePlay
        challenge={challenge}
        onMiss={onMiss}
        onSolved={onSolved}
        onPeek={onPeek}
      />
    )
  }
  if (challenge.kind === 'build-argument') {
    return (
      <BuildArgumentPlay
        challenge={challenge}
        onMiss={onMiss}
        onSolved={onSolved}
        onPeek={onPeek}
      />
    )
  }
  if (challenge.kind === 'link') {
    if (isEasy(progress) || lineId) {
      const story = lessonStory(lineId ?? easyMatchLine(progress))
      switch (story.play) {
        case 'father-run':
          return (
            <FatherRunPlay
              lineId={story.lineId}
              beats={story.beats}
              onMiss={onMiss}
              onClear={onSolved}
              onEasyStop={onEasyStop}
            />
          )
        case 'road-maze':
          return (
            <RoadMazePlay
              lineId={story.lineId}
              beats={story.beats}
              onMiss={onMiss}
              onClear={onSolved}
              onEasyStop={onEasyStop}
            />
          )
        case 'claim-merge':
          return (
            <ClaimMergePlay
              lineId={story.lineId}
              beats={story.beats}
              onMiss={onMiss}
              onClear={onSolved}
              onEasyStop={onEasyStop}
            />
          )
        case 'source-dig':
          return (
            <SourceDigPlay
              lineId={story.lineId}
              onMiss={onMiss}
              onClear={onSolved}
              onEasyStop={onEasyStop}
            />
          )
        case 'panel-blast':
        default:
          return (
            <GemSearchPlay
              lineId={story.lineId}
              beats={story.beats}
              onMiss={onMiss}
              onClear={onSolved}
              onEasyStop={onEasyStop}
            />
          )
      }
    }
    return (
      <LinkPlay
        challenge={challenge}
        onMiss={onMiss}
        onSolved={onSolved}
        onPeek={onPeek}
        onEasyStop={onEasyStop}
        streetBeat={streetBeat}
      />
    )
  }
  return (
    <MatchPlay
      challenge={challenge}
      onMiss={onMiss}
      onSolved={onSolved}
      onPeek={onPeek}
    />
  )
}
