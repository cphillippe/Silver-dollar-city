import type { Challenge } from '../types'
import { BuildArgumentPlay } from './challenges/BuildArgumentPlay'
import { MatchPlay } from './challenges/MatchPlay'
import { SequencePlay } from './challenges/SequencePlay'
import { SortPlay } from './challenges/SortPlay'

interface PuzzlePlayProps {
  challenge: Challenge
  onMiss: () => void
  onSolved: () => void
  onPeek?: () => void
}

export function PuzzlePlay({
  challenge,
  onMiss,
  onSolved,
  onPeek,
}: PuzzlePlayProps) {
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
  return (
    <MatchPlay
      challenge={challenge}
      onMiss={onMiss}
      onSolved={onSolved}
      onPeek={onPeek}
    />
  )
}
