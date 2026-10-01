import type { Challenge } from '../types'
import { renderStoryPlay } from '../easyTrail/match/registry'
import { isEasy, easyMatchLine } from '../lib/easy'
import { lessonStory } from '../lib/storyPlay'
import { useProgress } from '../store/progress'
import { BuildArgumentPlay } from './challenges/BuildArgumentPlay'
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
      return renderStoryPlay(story, {
        easy: isEasy(progress),
        onMiss,
        onClear: onSolved,
        onEasyStop,
      })
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
