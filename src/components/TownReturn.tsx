import type { CharacterId } from '../content/story'
import { CAST } from '../content/story'
import { Avatar } from './Avatar'

interface TownReturnProps {
  who: CharacterId
  line: string
  action: string
  onGo: () => void
}

export function TownReturn({ who, line, action, onGo }: TownReturnProps) {
  const person = CAST[who]
  return (
    <div className="town-return after-win-cta">
      <div className="town-now">
        <Avatar who={who} size="md" />
        <div>
          <p className="eyebrow">{person.name} · in town</p>
          <p className="town-line">“{line}”</p>
        </div>
      </div>
      <button type="button" className="btn primary xl" onClick={onGo}>
        {action}
      </button>
    </div>
  )
}
