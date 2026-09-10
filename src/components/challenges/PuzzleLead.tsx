import type { Challenge } from '../../types'
import { isEasy } from '../../lib/easy'
import { easyLead } from '../../lib/words'
import { useProgress } from '../../store/progress'

export function PuzzleLead({ challenge }: { challenge: Challenge }) {
  const { progress } = useProgress()
  const raw = isEasy(progress) ? challenge.prompt : (challenge.idea ?? challenge.prompt)
  const lead = isEasy(progress) ? easyLead(challenge.id, raw) : raw
  return <p className="prompt">{lead}</p>
}
