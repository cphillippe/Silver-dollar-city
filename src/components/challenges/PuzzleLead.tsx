import type { Challenge } from '../../types'

export function PuzzleLead({ challenge }: { challenge: Challenge }) {
  return <p className="prompt">{challenge.idea ?? challenge.prompt}</p>
}
