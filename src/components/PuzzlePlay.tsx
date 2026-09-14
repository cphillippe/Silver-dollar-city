import type { Challenge } from '../types'
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
}

export function PuzzlePlay({
  challenge,
  onMiss,
  onSolved,
  onPeek,
  onEasyStop,
  streetBeat,
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
  if (challenge.kind === 'link') {
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
