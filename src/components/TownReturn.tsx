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
    <div className="town-return is-tight after-win-cta">
      <button type="button" className="btn primary xl" onClick={onGo}>
        <Avatar who={who} size="sm" />
        {action}
      </button>
      <p className="town-kicker">
        {person.shortName}: {line}
      </p>
    </div>
  )
}
