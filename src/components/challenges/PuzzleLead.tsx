import type { Challenge } from '../../types'
import { isEasy } from '../../lib/easy'
import { useProgress } from '../../store/progress'

export function PuzzleLead({ challenge }: { challenge: Challenge }) {
  const { progress } = useProgress()
  const lead = isEasy(progress) ? challenge.prompt : (challenge.idea ?? challenge.prompt)
  return <p className="prompt">{lead}</p>
}
